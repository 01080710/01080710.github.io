"""De-identify the Account Automation Engine "Record" sheet for the public portfolio.

Usage:
    python lark_get_info.py "<sheet url>" --sheet <record_sheet_id> --output <raw.json>
    python scripts/deidentify_account_record.py <raw.json> <output.csv>

The raw JSON (Lark output) stays outside the repo. Only the de-identified CSV under public/data/ is published.

Dropped on purpose:
- requestor                         : colleague names (free text)
- total_users_list / total_missing_list : client user ids
- total_balance / total_equity / total_credit : client fund totals (business-sensitive)
- three unnamed trailing columns    : always empty
"""

from datetime  import datetime
import logging
import json
import uuid
import csv
import sys
import re


SERVICE    = "deidentify-account-record"
SHEET_NAME = "Record"
TIME_FMT   = "%Y-%m-%d %H:%M:%S"

REQUIRED_HEADER = ["requestor", "comparison_time", "total_users", "total_accounts", "total_missing",
                   "countries_covered", "servers_covered", "regulators_covered", "account_types_covered",
                   "earliest_update_time", "latest_update_time", "manual_seconds_per_account",
                   "estimated_hours_saved", "estimated_twd_saved", "return_msg"]

export_columns = ["run", "comparison_time", "status", "total_users", "total_accounts", "total_missing",
                  "countries_covered", "servers_covered", "regulators_covered", "account_types_covered",
                  "earliest_update_time", "latest_update_time", "manual_seconds_per_account",
                  "estimated_hours_saved", "estimated_twd_saved", "return_msg"]

# Client ids are 6+ digits; a run summary never has a count that large in return_msg
ID_PATTERN = re.compile(r"\d{6,}")

# Fixed words the engine writes in return_msg; requestor is free text and sometimes contains them
SYSTEM_WORDS = {"success", "users", "accounts", "account", "validated", "countries", "hrs", "saved",
                "input", "validation", "failed", "requestor", "userid"}


class InputValidationError(Exception):
    pass


def cell(value) -> str:
    return "" if value is None else str(value).strip()


def collect_name_tokens(rows: list[dict]) -> set[str]:
    """Every word (3+ letters) of every requestor, lower-cased."""
    tokens = {w.lower() for r in rows for w in re.findall(r"[A-Za-z]{3,}", r["requestor"])}
    return tokens - SYSTEM_WORDS


def find_leftovers(text: str, name_tokens: set[str]) -> list[str]:
    words = {w.lower() for w in re.findall(r"[A-Za-z]+", text)}
    found = sorted(words & name_tokens)
    if ID_PATTERN.search(text):
        found.append("<6+ digit id>")
    return found


def run_deidentify(values: list[list], logger: logging.Logger) -> list[list[str]]:
    """values = Record sheet cells including header. Returns output rows including header."""

    # Step 1 : Validate header -> Record sheet
    if not values:
        raise InputValidationError("Record 工作表是空的：至少需要標題列。")
    header  = [cell(h) for h in values[0]]
    missing = [name for name in REQUIRED_HEADER if name not in header]
    if missing:
        raise InputValidationError(f"Record 缺少欄位：{', '.join(missing)}。請確認抓的是 Record 工作表。")
    rows = [dict(zip(header, (cell(v) for v in row))) for row in values[1:]]
    logger.info("Validate success (rows=%d)", len(rows), extra={"stage": "validate", "status": "success"})


    # Step 2 : Validate rows -> comparison_time must parse
    bad_rows = []
    for line_no, r in enumerate(rows, start=2):
        try:
            datetime.strptime(r["comparison_time"], TIME_FMT)
        except ValueError:
            bad_rows.append(line_no)
    if bad_rows:
        raise InputValidationError(f"comparison_time 無法解析（第 {bad_rows[:10]} 列），格式需為 {TIME_FMT}。")


    # Step 3 : Transform -> sequential run id, status, drop sensitive columns
    output = [export_columns]
    for i, r in enumerate(rows, start=1):
        status = r["return_msg"].split("|")[0].split(":")[0].strip()
        output.append([f"R-{i:04d}", r["comparison_time"], status] + [r[c] for c in export_columns[3:]])
    logger.info("Transform success (rows=%d)", len(output) - 1, extra={"stage": "transform", "status": "success"})


    # Step 4 : Verify -> no requestor name or client id survives
    name_tokens = collect_name_tokens(rows)
    leftovers   = sorted({x for out in output[1:] for x in find_leftovers(" ".join(out), name_tokens)})
    if leftovers:
        raise InputValidationError(f"去識別後仍殘留：{leftovers}。請檢查欄位後重跑。")
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
        logger.critical("Usage: python scripts/deidentify_account_record.py <raw.json> <output.csv>",
                        extra={"stage": "start", "status": "failed"})
        return 2
    src, dst = argv[1], argv[2]
    try:
        with open(src, encoding="utf-8") as f:
            sheets = json.load(f)["sheets"]
        record = next((s for s in sheets if s.get("title") == SHEET_NAME), None)
        if record is None:
            raise InputValidationError(f"JSON 中找不到 '{SHEET_NAME}' 工作表。")
        output = run_deidentify(record.get("values", []), logger)
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
