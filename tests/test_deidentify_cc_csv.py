from pathlib import Path
import logging
import sys

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from deidentify_cc_csv import InputValidationError, export_columns, mask_names, run_deidentify  # noqa: E402


HEADER = ["Createtime", "Tx-Id", "Tx-Type", "Status", "Merchant Order", "Deposit Order Number", "Currency",
          "Refund Amount", "Refund_Amount_crm", "recon_result", "recon_source", "Comparison", "Action",
          "", "", "", "", "", "", "", "", ""]


def raw_row(comparison, tx="111", note="", review="", reviewer="", note_2="", amount="60", crm="-30"):
    return ["2026-06-11 03:46:00", tx, "Refund", "In progress", "VU-MERCHANT-ORDER", "VU1849736420251105003315",
            "USD", amount, crm, "Mismatch", "Payabl & Crm", comparison, note, review, reviewer, note_2,
            "", "", "", "", "", ""]


@pytest.fixture
def logger():
    return logging.getLogger("test")


def test_normal_path_filters_window_pseudonymises_and_masks(logger):
    rows = [
        HEADER,
        raw_row("2026-02-28 23:06:00", tx="000"),                                    # before window -> dropped
        raw_row("2026-06-11 11:07:11", tx="111", note="refunded wrong amount, aborted by Vincent",
                review="error", reviewer="Vincent Lelis", note_2="Wrong amount, aborted by venus"),
        raw_row("2026-06-11 12:07:11", tx="111"),                                    # same tx, next run
        raw_row("7/18/2026 4:07", tx="222", note="double refund by OP, aborted by Lyka",
                reviewer="Lyka Balarusan"),
        raw_row("2026-07-19 05:06:00", tx="-", amount="-", crm="-"),                 # run without anomaly
        raw_row("2026-08-01 00:06:00", tx="333"),                                    # after window -> dropped
    ]

    out = run_deidentify(rows, logger)

    assert out[0] == export_columns
    assert len(out) == 5
    assert [r[2] for r in out[1:]] == ["TX-0001", "TX-0001", "TX-0002", "-"]
    assert out[1][10] == "refunded wrong amount, aborted by <name> / Wrong amount, aborted by <name>"
    assert out[3][10] == "double refund by OP, aborted by <name>"
    assert out[1][11] == "error"
    flat = " ".join(" ".join(r) for r in out)
    for secret in ("Vincent", "venus", "Lyka", "Lelis", "VU1849736420251105003315", "VU-MERCHANT-ORDER"):
        assert secret not in flat


def test_empty_body_returns_header_only(logger):
    assert run_deidentify([HEADER], logger) == [export_columns]


def test_empty_file_raises(logger):
    with pytest.raises(InputValidationError, match="空的"):
        run_deidentify([], logger)


def test_missing_column_raises(logger):
    header = [c for c in HEADER if c != "Comparison"]
    with pytest.raises(InputValidationError, match="Comparison"):
        run_deidentify([header], logger)


def test_unparseable_comparison_raises(logger):
    with pytest.raises(InputValidationError, match="無法解析"):
        run_deidentify([HEADER, raw_row("next tuesday")], logger)


def test_reviewer_name_without_by_is_masked(logger):
    rows = [HEADER, raw_row("2026-06-11 11:07:11", note="checked with Lelis-team", reviewer="Vincent Lelis")]
    out  = run_deidentify(rows, logger)
    assert out[1][10] == "checked with <name>-team"


def test_leftover_name_raises(logger, monkeypatch):
    # Safety net: if masking ever misses a reviewer name, the run must fail instead of publishing it.
    monkeypatch.setattr("deidentify_cc_csv.mask_names", lambda text, tokens: text)
    rows = [HEADER, raw_row("2026-06-11 11:07:11", note="aborted by Vincent", reviewer="Vincent Lelis")]
    with pytest.raises(InputValidationError, match="殘留人名"):
        run_deidentify(rows, logger)


def test_mask_names_keeps_roles():
    assert mask_names("aborted by OP also, immediately aborted by agent", set()) == \
        "aborted by OP also, immediately aborted by agent"
    assert mask_names("refunded by venus, but completed on crm by erika", set()) == \
        "refunded by <name>, but completed on crm by <name>"
