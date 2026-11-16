"""De-identify the Credit Card reconciliation output CSV for the public portfolio.

Usage:
    python scripts/deidentify_cc_csv.py <raw.csv> <output.csv>

The raw CSV (pipeline output exported from LarkSheet) stays outside the repo.
Only the de-identified output under public/data/ is published.
"""

from datetime  import datetime
import logging
import uuid
import csv
import sys
import re


SERVICE = "deidentify-cc-csv"

# Stable period shown on the portfolio (Peter, 2026-11-16): 2026-03-01 <= Comparison < 2026-08-01
WINDOW_START = datetime(2026, 3, 1)
WINDOW_END   = datetime(2026, 8, 1)

# The pipeline wrote Comparison as ISO; one row was edited by hand in Sheets (M/D/YYYY H:MM).
COMPARISON_FORMATS = ("%Y-%m-%d %H:%M:%S", "%m/%d/%Y %H:%M")

# Raw column positions (header row only names the first 13; the rest were added by operations).
COL_TX_ID      = 1
COL_COMPARISON = 11
COL_NOTE       = 12   # "Action"
COL_REVIEW     = 13   # clear / error, written by the reviewer
COL_REVIEWER   = 14   # reviewer full name -> dropped
COL_NOTE_2     = 15   # second free-text note -> merged into "Note"

REQUIRED_HEADER = ["Createtime", "Tx-Id", "Tx-Type", "Status", "Merchant Order", "Deposit Order Number",
                   "Currency", "Refund Amount", "Refund_Amount_crm", "recon_result", "recon_source", "Comparison"]

export_columns = ["Comparison", "Createtime", "Tx", "Tx-Type", "Status", "Currency", "Refund Amount",
                  "Refund_Amount_crm", "recon_result", "recon_source", "Note", "Review"]

# "by <someone>" in free text; OP / agent are roles, not names.
BY_NAME_PATTERN = re.compile(r"\bby\s+([A-Za-z]+(?:\s+[A-Z][a-z]+)?)")
ROLE_WORDS      = {"op", "agent"}
MASK            = "<name>"


class InputValidationError(Exception):
    pass


def parse_comparison(value: str) -> datetime | None:
    for fmt in COMPARISON_FORMATS:
        try:
            return datetime.strptime(value.strip(), fmt)
        except ValueError:
            continue
    return None


def collect_name_tokens(rows: list[list[str]]) -> set[str]:
    """Every word of every reviewer name, lower-cased (e.g. 'Erlyn A Serenado' -> erlyn, serenado)."""
    tokens = set()
    for row in rows:
        for word in re.findall(r"[A-Za-z]+", row[COL_REVIEWER] if len(row) > COL_REVIEWER else ""):
            if len(word) >= 3 and word.lower() not in {"clear", "error"}:
                tokens.add(word.lower())
    return tokens


def mask_names(text: str, name_tokens: set[str]) -> str:
    def _by(match: re.Match) -> str:
        return match.group(0) if match.group(1).lower() in ROLE_WORDS else f"by {MASK}"

    text = BY_NAME_PATTERN.sub(_by, text)
    for token in name_tokens:
        text = re.sub(rf"\b{re.escape(token)}\b", MASK, text, flags=re.IGNORECASE)
    return text


def find_leftover_names(text: str, name_tokens: set[str]) -> list[str]:
    words = {w.lower() for w in re.findall(r"[A-Za-z]+", text)}
    return sorted(words & name_tokens)


def run_deidentify(rows: list[list[str]], logger: logging.Logger) -> list[list[str]]:
    """rows = raw CSV including header. Returns output rows including header."""

    # Step 1 : Validate header -> raw CSV
    if not rows:
        raise InputValidationError("輸入 CSV 是空的：至少需要標題列。")
    header  = rows[0]
    missing = [name for name in REQUIRED_HEADER if name not in header[:len(REQUIRED_HEADER)]]
    if missing:
        raise InputValidationError(f"輸入 CSV 缺少欄位：{', '.join(missing)}。請確認是 LarkSheet 匯出的原始檔。")
    body = rows[1:]
    logger.info("Validate success (rows=%d)", len(body), extra={"stage": "validate", "status": "success"})


    # Step 2 : Filter stable window -> rows with Comparison in [WINDOW_START, WINDOW_END)
    bad_rows, selected = [], []
    for line_no, row in enumerate(body, start=2):
        when = parse_comparison(row[COL_COMPARISON] if len(row) > COL_COMPARISON else "")
        if when is None:
            bad_rows.append(line_no)
        elif WINDOW_START <= when < WINDOW_END:
            selected.append(row)
    if bad_rows:
        raise InputValidationError(f"Comparison 欄位無法解析（第 {bad_rows[:10]} 列）。支援格式：{COMPARISON_FORMATS}。")
    logger.info("Filter success (selected=%d)", len(selected), extra={"stage": "filter", "status": "success"})


    # Step 3 : Transform -> pseudonymous Tx, merged + masked notes, drop order ids and reviewer
    name_tokens = collect_name_tokens(body)
    tx_map      = {}
    output      = [export_columns]
    for row in selected:
        raw_tx = row[COL_TX_ID].strip()
        if raw_tx and raw_tx != "-":
            tx_map.setdefault(raw_tx, f"TX-{len(tx_map) + 1:04d}")
        notes  = [row[i].strip() for i in (COL_NOTE, COL_NOTE_2) if len(row) > i and row[i].strip()]
        output.append([
            row[COL_COMPARISON].strip(),
            row[0].strip(),
            tx_map.get(raw_tx, raw_tx),
            row[2], row[3], row[6], row[7], row[8], row[9], row[10],
            mask_names(" / ".join(notes), name_tokens),
            mask_names(row[COL_REVIEW].strip() if len(row) > COL_REVIEW else "", name_tokens),
        ])
    logger.info("Transform success (rows=%d, unique_tx=%d)", len(output) - 1, len(tx_map),
                extra={"stage": "transform", "status": "success"})


    # Step 4 : Verify -> no reviewer name survives in the output
    leftovers = sorted({name for out in output[1:] for name in find_leftover_names(" ".join(out), name_tokens)})
    if leftovers:
        raise InputValidationError(f"去識別後仍殘留人名：{leftovers}。請擴充 mask_names 規則後重跑。")
    logger.info("Verify success", extra={"stage": "verify", "status": "success"})

    return output


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
        logger.critical("Usage: python scripts/deidentify_cc_csv.py <raw.csv> <output.csv>",
                        extra={"stage": "start", "status": "failed"})
        return 2
    src, dst = argv[1], argv[2]
    try:
        with open(src, encoding="utf-8-sig", newline="") as f:
            rows = list(csv.reader(f))
        output = run_deidentify(rows, logger)
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
