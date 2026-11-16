from pathlib import Path
import logging
import sys

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from deidentify_account_record import InputValidationError, export_columns, run_deidentify  # noqa: E402


LOGGER = logging.LoggerAdapter(logging.getLogger("test"), {"stage": "t", "status": "t"})

HEADER = ["requestor", "comparison_time", "total_users", "total_users_list ", "total_accounts", "total_missing",
          "total_missing_list", "countries_covered", "servers_covered", "regulators_covered",
          "account_types_covered", "total_balance", "total_equity", "total_credit", "earliest_update_time",
          "latest_update_time", "manual_seconds_per_account", "estimated_hours_saved", "estimated_twd_saved",
          "return_msg", None, None, None]


def raw_row(requestor="Howard", when="2026-06-09 11:31:09", msg="Success | 2 users | 3 accounts validated"):
    return [requestor, when, "2", "['8769981', '7785482']", "3", "1", "['user_6325394']", "2", "1", "1", "1",
            "489650.47", "496562.57", "8357.41", "2019-11-15 02:10:11", "2026-06-08 15:34:28", 45, 0.04, 15,
            msg, None, None, None]


def test_normal_path_drops_sensitive_columns():
    out = run_deidentify([HEADER, raw_row(), raw_row("Ann")], LOGGER)
    assert out[0] == export_columns
    assert [r[0] for r in out[1:]] == ["R-0001", "R-0002"]
    assert out[1][2] == "Success"
    flat = " ".join(" ".join(r) for r in out)
    for secret in ["Howard", "Ann", "8769981", "user_6325394", "489650.47"]:
        assert secret not in flat


def test_failed_status_is_parsed():
    out = run_deidentify([HEADER, raw_row(msg="Input validation failed: 'Requestor' 欄位為必填。")], LOGGER)
    assert out[1][2] == "Input validation failed"


def test_empty_input_raises():
    with pytest.raises(InputValidationError, match="空的"):
        run_deidentify([], LOGGER)


def test_missing_header_raises():
    with pytest.raises(InputValidationError, match="return_msg"):
        run_deidentify([HEADER[:19]], LOGGER)


def test_bad_time_raises():
    with pytest.raises(InputValidationError, match="comparison_time"):
        run_deidentify([HEADER, raw_row(when="6/9/2026")], LOGGER)


def test_leftover_name_raises():
    with pytest.raises(InputValidationError, match="howard"):
        run_deidentify([HEADER, raw_row(msg="Success by Howard")], LOGGER)


def test_leftover_id_raises():
    with pytest.raises(InputValidationError, match="6\\+ digit"):
        run_deidentify([HEADER, raw_row(msg="Success | user 8769981")], LOGGER)
