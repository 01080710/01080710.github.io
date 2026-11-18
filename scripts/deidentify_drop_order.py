"""De-identify the drop-order monitor case sheets for the public portfolio.

Usage:
    DEID_BRAND_WORDS=<word1>,<word2> python scripts/deidentify_drop_order.py <raw.xlsx> <output.csv>

DEID_BRAND_WORDS (required): comma-separated brand words that must not survive in the output.
Kept out of the repo so the brand name never appears in public files.

The raw workbook (LarkSheet export) stays in canva-export/ (git-ignored).
Only the de-identified output under public/data/ is published.
Reading .xlsx needs openpyxl; the transform itself only uses the standard library.
"""

from datetime  import datetime
import logging
import uuid
import csv
import sys
import os
import re


SERVICE = "deidentify-drop-order"

# Only these five sheets are tracked on the portfolio (Peter, 2026-11-18); value = public case type.
case_type_map = {
    "Deposit"                  : "Deposit",
    "Withdraw - LBT"           : "Withdraw-LBT",
    "Withdraw - Crypto&Wallet" : "Withdraw-Crypto&Wallet",
    "Withdraw - CreditCard"    : "Withdraw-CreditCard",
    "Withdraw - IBT"           : "Withdraw-IBT",
}

# Go-live dates (Peter, 2026-11-18): Deposit 2026-03-30, Withdrawal 2026-09-09.
# Window end is exclusive: whole days up to 2026-11-17.
window_start_map = {
    "Deposit"                  : datetime(2026, 3, 30),
    "Withdraw - LBT"           : datetime(2026, 9, 9),
    "Withdraw - Crypto&Wallet" : datetime(2026, 9, 9),
    "Withdraw - CreditCard"    : datetime(2026, 9, 9),
    "Withdraw - IBT"           : datetime(2026, 9, 9),
}
WINDOW_END = datetime(2026, 11, 18)

# The pipeline writes Comparison Time as ISO; a few deposit rows were typed by hand.
COMPARISON_FORMATS = ("%Y-%m-%d %H:%M:%S", "%Y/%m/%d %H:%M:%S", "%Y-%m-%d %H:%M")

# Heartbeat row: the pipeline writes "-" in every column except Comparison Time when a run finds no new case.
HEARTBEAT = "-"

REQUIRED_HEADER = ["User ID", "Comparison Time", "交易状态"]

export_columns = ["Case Type", "Comparison Time", "Tx", "Channel Type", "CRM Status", "CPS 交易状态",
                  "CPS 出金状态", "Currency", "Amount", "Country", "原因类别", "子类别", "處理狀態"]

# Identifier / free-text columns that must never reach the output (checked in Step 4).
id_columns   = ["User ID", "Account", "Order Number", "Merchant Order", "Deposit Order Number", "CPS Order ID"]
name_columns = ["Handler", "Checker", "Sales", "Operator", "CC Operator"]
BRAND_WORDS_ENV = "DEID_BRAND_WORDS"
# Output cells are categorical (country, currency, channel), so a single name word such as "Martin" or
# "Man" also matches "Saint Martin" / "Isle Of Man". Check the full staff name string instead.
NON_PERSON_VALUES = {"system auto"}


class InputValidationError(Exception):
    pass


def to_text(value) -> str:
    if value is None:
        return ""
    if isinstance(value, datetime):
        return value.strftime("%Y-%m-%d %H:%M:%S")
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value).strip()


def parse_comparison(value: str) -> datetime | None:
    for fmt in COMPARISON_FORMATS:
        try:
            return datetime.strptime(value.strip(), fmt)
        except ValueError:
            continue
    return None


def build_index(header: list[str]) -> dict[str, list[int]]:
    """Column name -> every position (sheets repeat 'Status': first = CRM status, second = handling status)."""
    index = {}
    for pos, name in enumerate(header):
        index.setdefault(name, []).append(pos)
    return index


def pick(row: list[str], index: dict[str, list[int]], name: str, nth: int = 0) -> str:
    positions = index.get(name, [])
    if len(positions) <= nth or positions[nth] >= len(row):
        return ""
    return row[positions[nth]]


def transform_row(sheet: str, row: list[str], index: dict[str, list[int]], tx: str) -> list[str]:
    is_cc    = sheet == "Withdraw - CreditCard"
    is_dep   = sheet == "Deposit"
    channel  = pick(row, index, "Order Channel" if is_cc else "Type")
    crm      = pick(row, index, "Status") if (is_dep or is_cc) else pick(row, index, "Apply Status")
    handling = pick(row, index, "Status", nth=1).lower()
    return [
        case_type_map[sheet],
        pick(row, index, "Comparison Time"),
        tx,
        channel,
        crm,
        pick(row, index, "交易状态"),
        pick(row, index, "出金状态"),
        pick(row, index, "交易币种"),
        pick(row, index, "交易金额"),
        pick(row, index, "Country"),
        pick(row, index, "原因类别"),
        pick(row, index, "子类别"),
        handling,
    ]


def run_deidentify(sheets: dict[str, list[list[str]]], logger: logging.Logger,
                   brand_words: tuple[str, ...] = ()) -> list[list[str]]:
    """sheets = {sheet name: rows as text, header first}. Returns output rows including header."""

    # Step 1 : Validate -> five tracked sheets with required header
    missing_sheets = [name for name in case_type_map if name not in sheets]
    if missing_sheets:
        raise InputValidationError(f"活頁簿缺少工作表：{', '.join(missing_sheets)}。請確認是 LarkSheet 匯出的原始檔。")
    for name in case_type_map:
        if not sheets[name]:
            raise InputValidationError(f"工作表「{name}」是空的：至少需要標題列。")
        missing = [col for col in REQUIRED_HEADER if col not in sheets[name][0]]
        if missing:
            raise InputValidationError(f"工作表「{name}」缺少欄位：{', '.join(missing)}。")
    logger.info("Validate success (sheets=%d)", len(case_type_map), extra={"stage": "validate", "status": "success"})


    # Step 2 : Filter window -> rows with Comparison Time in [go-live, WINDOW_END)
    selected, sensitive_ids, staff_names = [], set(), set()
    for name in case_type_map:
        header, body = sheets[name][0], sheets[name][1:]
        index        = build_index(header)
        bad_rows     = []
        for line_no, row in enumerate(body, start=2):
            first = pick(row, index, "User ID")
            if not first and not pick(row, index, "Comparison Time"):
                continue                                             # trailing blank row
            when = parse_comparison(pick(row, index, "Comparison Time"))
            if when is None:
                bad_rows.append(line_no)
                continue
            for col in id_columns:
                value = pick(row, index, col)
                if len(value) >= 6 and value != HEARTBEAT:
                    sensitive_ids.add(value)
            for col in name_columns:
                value = pick(row, index, col).lower()
                if len(value) >= 5 and value not in NON_PERSON_VALUES:
                    staff_names.add(value)
            if window_start_map[name] <= when < WINDOW_END:
                selected.append((name, index, row, when))
        if bad_rows:
            raise InputValidationError(
                f"工作表「{name}」Comparison Time 無法解析（第 {bad_rows[:10]} 列）。支援格式：{COMPARISON_FORMATS}。")
    logger.info("Filter success (selected=%d)", len(selected), extra={"stage": "filter", "status": "success"})


    # Step 3 : Transform -> pseudonymous order id, drop ids / names / free text
    tx_map = {}
    output = [export_columns]
    for name, index, row, when in sorted(selected, key=lambda item: item[3]):
        key = pick(row, index, "Merchant Order" if name == "Withdraw - CreditCard" else "Order Number")
        if key and key != HEARTBEAT:
            tx_map.setdefault(key, f"TX-{len(tx_map) + 1:05d}")
            tx = tx_map[key]
        else:
            tx = HEARTBEAT
        output.append(transform_row(name, row, index, tx))
    logger.info("Transform success (rows=%d, unique_orders=%d)", len(output) - 1, len(tx_map),
                extra={"stage": "transform", "status": "success"})


    # Step 4 : Verify -> no id, staff name or brand word survives
    leaks = set()
    for out in output[1:]:
        for cell in out:
            if cell in sensitive_ids:
                leaks.add(f"id:{cell[:4]}***")
            lowered = cell.lower()
            leaks.update(f"name:{n[:3]}***" for n in staff_names if n in lowered)
            leaks.update(f"brand:{b[:2]}***" for b in brand_words if b in lowered)
    if leaks:
        raise InputValidationError(f"去識別後仍殘留敏感資料：{sorted(leaks)[:10]}。請調整輸出欄位後重跑。")
    logger.info("Verify success", extra={"stage": "verify", "status": "success"})

    return output


def load_workbook_text(path: str) -> dict[str, list[list[str]]]:
    import openpyxl

    # read_only mode trusts the sheet's stored dimension, which LarkSheet exports set to A1 -> load fully.
    workbook = openpyxl.load_workbook(path, data_only=True)
    return {name: [[to_text(v) for v in row] for row in workbook[name].iter_rows(values_only=True)]
            for name in case_type_map if name in workbook.sheetnames}


def build_logger(run_id: str) -> logging.Logger:
    logger  = logging.getLogger(SERVICE)
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(
        f"%(asctime)s %(levelname)s service={SERVICE} run_id={run_id} stage=%(stage)s status=%(status)s %(message)s"))
    logger.handlers = [handler]
    logger.setLevel(logging.INFO)
    return logger


def main(argv: list[str]) -> int:
    run_id = uuid.uuid4().hex[:8]
    logger = build_logger(run_id)
    if len(argv) != 3:
        logger.critical("Usage: python scripts/deidentify_drop_order.py <raw.xlsx> <output.csv>",
                        extra={"stage": "start", "status": "failed"})
        return 2
    brand_words = tuple(w.strip().lower() for w in os.environ.get(BRAND_WORDS_ENV, "").split(",") if w.strip())
    if not brand_words:
        logger.critical("Config missing (%s)：請設定以逗號分隔的品牌字詞後重跑。", BRAND_WORDS_ENV,
                        extra={"stage": "start", "status": "failed"})
        return 2
    src, dst = argv[1], argv[2]
    try:
        output = run_deidentify(load_workbook_text(src), logger, brand_words)
        with open(dst, "w", encoding="utf-8", newline="") as f:
            csv.writer(f).writerows(output)
        logger.info("Write success (path=%s, rows=%d)", dst, len(output) - 1, extra={"stage": "load", "status": "success"})
        return 0
    except InputValidationError as err:
        logger.error("Run failed (%s)", err, extra={"stage": "run", "status": "failed"})
        return 1
    except Exception:
        logger.exception("Run failed unexpectedly", extra={"stage": "run", "status": "failed"})
        return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
