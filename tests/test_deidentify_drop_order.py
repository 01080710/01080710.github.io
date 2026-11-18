from datetime import datetime
from pathlib import Path
import logging
import sys

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from deidentify_drop_order import (  # noqa: E402
    InputValidationError, case_type_map, export_columns, main, run_deidentify, to_text,
)


DEP_HEADER = ["User ID", "Account", "Type", "Status", "交易状态", "交易币种", "交易金额", "Country",
              "Order Number", "Operator", "Comparison Time", "Handler", "Status", "Checker"]
WD_HEADER  = ["User ID", "Account", "Order Number", "Type", "交易金额", "交易币种", "交易状态", "出金状态",
              "原因类别", "子类别", "Sales", "Status", "Apply Status", "Country", "Comparison Time", "Handler", "Status"]
CC_HEADER  = ["User ID", "Account", "Merchant Order", "Status", "Deposit Order Number", "Order Channel",
              "交易金额", "交易币种", "交易状态", "出金状态", "原因类别", "子类别", "Country", "Comparison Time",
              "Handler", "Status"]


def dep_row(when, order="VU1000000120261106000001", user="1000001", handler="Amy Test"):
    return [user, "20000001", "UPI-India-CPS-APP", "Audit", "交易成功", "INR", "2000", "India",
            order, "System Auto", when, handler, "Done", "Mona Test"]


def wd_row(when, order="VU1000000220260910000002", sales="Bob Test"):
    return ["10000002", "20000002", order, "India-CPS", "10519", "INR", "处理完成", "交易失败(人工)",
            "客户问题", "银行端交易失败", sales, "Risk Audit", "Completed", "India", when, "Carl Test", "Reversed"]


def heartbeat(header, when):
    return ["-"] * header.index("Comparison Time") + [when]


def cc_row(when, merchant="V2U1000000320260904000003", deposit_order="V2U1000000420260805000004"):
    return ["10000003", "20000003", merchant, "Success", deposit_order, "Apple/GooglePay-BridgerPay-CPS",
            "50", "CC_EUR", "处理完成", "交易失败(人工)", "客户问题", "银行端交易失败", "Germany", when,
            "Dana Test", "Reversed"]


def workbook(**overrides):
    sheets = {
        "Deposit"                  : [DEP_HEADER],
        "Withdraw - LBT"           : [WD_HEADER],
        "Withdraw - Crypto&Wallet" : [WD_HEADER],
        "Withdraw - CreditCard"    : [CC_HEADER],
        "Withdraw - IBT"           : [WD_HEADER],
    }
    sheets.update(overrides)
    return sheets


@pytest.fixture
def logger():
    return logging.getLogger("test")


def test_normal_path_filters_window_pseudonymises_and_drops_identifiers(logger):
    sheets = workbook(**{
        "Deposit": [
            DEP_HEADER,
            dep_row("2026-03-29 23:00:00", order="VU0000000020260329000000"),   # before go-live -> dropped
            dep_row("2026-03-30 13:35:55"),
            heartbeat(DEP_HEADER, "2026-03-30 14:35:55"),                      # run without new case
            dep_row("2026-11-18 00:10:00", order="VU9999999920261118000000"),   # after window -> dropped
        ],
        "Withdraw - LBT": [
            WD_HEADER,
            wd_row("2026-09-02 09:10:20", order="VU1111111120260902000000"),    # before withdrawal go-live
            wd_row("2026-09-10 10:00:00"),
        ],
        "Withdraw - CreditCard": [
            CC_HEADER,
            cc_row("2026-09-10 16:19:57", deposit_order="V2U-DEPOSIT-A"),
            cc_row("2026-09-10 16:19:57", deposit_order="V2U-DEPOSIT-B"),      # same withdrawal, 2nd deposit
        ],
    })

    out = run_deidentify(sheets, logger)

    assert out[0] == export_columns
    assert [r[0] for r in out[1:]] == ["Deposit", "Deposit", "Withdraw-LBT", "Withdraw-CreditCard",
                                      "Withdraw-CreditCard"]
    assert [r[2] for r in out[1:]] == ["TX-00001", "-", "TX-00002", "TX-00003", "TX-00003"]
    assert out[1][3:10] == ["UPI-India-CPS-APP", "Audit", "交易成功", "", "INR", "2000", "India"]
    assert out[1][12] == "done"
    assert out[3][4:7] == ["Completed", "处理完成", "交易失败(人工)"]
    assert out[3][10:] == ["客户问题", "银行端交易失败", "reversed"]
    assert out[4][3:5] == ["Apple/GooglePay-BridgerPay-CPS", "Success"]
    flat = " ".join(" ".join(r) for r in out)
    for secret in ("1000001", "20000001", "VU1000000120261106000001", "V2U1000000320260904000003",
                   "Amy Test", "Mona Test", "Bob Test", "Carl Test", "Dana Test"):
        assert secret not in flat


def test_country_matching_a_name_word_is_not_a_leak(logger):
    # "Martin" is part of a sales name, but "Saint Martin" as a country must pass.
    row = wd_row("2026-09-10 10:00:00", sales="Tess Martin")
    row[WD_HEADER.index("Country")] = "Saint Martin"
    out = run_deidentify(workbook(**{"Withdraw - LBT": [WD_HEADER, row]}), logger)
    assert out[1][9] == "Saint Martin"


def test_staff_name_in_output_column_raises(logger):
    row = wd_row("2026-09-10 10:00:00", sales="Bob Test")
    row[WD_HEADER.index("子类别")] = "follow up by Bob Test"
    with pytest.raises(InputValidationError, match="殘留"):
        run_deidentify(workbook(**{"Withdraw - LBT": [WD_HEADER, row]}), logger)


def test_brand_word_in_output_column_raises(logger):
    row = wd_row("2026-09-10 10:00:00")
    row[WD_HEADER.index("子类别")] = "Acme app timeout"
    with pytest.raises(InputValidationError, match="brand:ac"):
        run_deidentify(workbook(**{"Withdraw - LBT": [WD_HEADER, row]}), logger, brand_words=("acme",))


def test_main_without_brand_words_fails_fast(monkeypatch, tmp_path):
    monkeypatch.delenv("DEID_BRAND_WORDS", raising=False)
    assert main(["deidentify_drop_order.py", "raw.xlsx", str(tmp_path / "out.csv")]) == 2
    assert not (tmp_path / "out.csv").exists()


def test_header_only_sheets_return_header_only(logger):
    assert run_deidentify(workbook(), logger) == [export_columns]


def test_missing_sheet_raises(logger):
    sheets = workbook()
    del sheets["Withdraw - IBT"]
    with pytest.raises(InputValidationError, match="Withdraw - IBT"):
        run_deidentify(sheets, logger)


def test_empty_sheet_raises(logger):
    with pytest.raises(InputValidationError, match="空的"):
        run_deidentify(workbook(Deposit=[]), logger)


def test_missing_required_column_raises(logger):
    header = [c for c in DEP_HEADER if c != "Comparison Time"]
    with pytest.raises(InputValidationError, match="Comparison Time"):
        run_deidentify(workbook(Deposit=[header]), logger)


def test_unparsable_comparison_time_raises(logger):
    with pytest.raises(InputValidationError, match="無法解析"):
        run_deidentify(workbook(Deposit=[DEP_HEADER, dep_row("yesterday")]), logger)


def test_to_text_normalises_excel_values():
    assert to_text(None) == ""
    assert to_text(121.0) == "121"
    assert to_text(4.054) == "4.054"
    assert to_text(datetime(2026, 3, 30, 7, 55, 51)) == "2026-03-30 07:55:51"
    assert set(case_type_map) == {"Deposit", "Withdraw - LBT", "Withdraw - Crypto&Wallet",
                                  "Withdraw - CreditCard", "Withdraw - IBT"}
