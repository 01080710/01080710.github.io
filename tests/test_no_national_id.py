"""Guard: no Taiwan national ID number may appear in any published or committed text file.

Certificates carry the ID on every page; the published scans in public/media/certs/ are masked images, which this
test cannot read. It covers text only (pages, data, docs, CSVs), so a copied ID in a caption or note fails the build.
"""
from pathlib import Path

import re

import pytest

ROOT            = Path(__file__).resolve().parent.parent
SCAN_DIRS       = ["src", "public", "docs", "scripts", "tests"]
SCAN_ROOT_FILES = ["README.md", "CLAUDE.md"]
TEXT_SUFFIXES   = {".ts", ".astro", ".md", ".css", ".js", ".mjs", ".py", ".csv", ".json", ".html", ".svg", ".txt"}

# Letter + 1/2 (sex digit; 8/9 for residence permits) + 8 digits, not part of a longer token.
national_id_re = re.compile(r"(?<![A-Za-z0-9])[A-Z][1289]\d{8}(?![A-Za-z0-9])")


def find_national_ids(text: str) -> list[str]:
    return national_id_re.findall(text)


def iter_text_files() -> list[Path]:
    files = [ROOT / name for name in SCAN_ROOT_FILES if (ROOT / name).exists()]
    for folder in SCAN_DIRS:
        files += [p for p in (ROOT / folder).rglob("*") if p.is_file() and p.suffix in TEXT_SUFFIXES]
    return files


@pytest.mark.parametrize("text, expected", [
    ("ID: A123456789 printed", ["A123456789"]),
    ("resident permit A812345678", ["A812345678"]),
    ("", []),
    ("2026-06 58,805 runs", []),
    ("order VA1234567890 is longer", []),
    ("lowercase a123456789", []),
    ("third digit A323456789", []),
])
def test_find_national_ids(text, expected):
    assert find_national_ids(text) == expected


def test_repo_text_has_no_national_id():
    hits = []
    for path in iter_text_files():
        if path.name == "test_no_national_id.py":
            continue  # the samples above are synthetic, but skip self to keep the guard simple
        for match in find_national_ids(path.read_text(encoding="utf-8", errors="ignore")):
            hits.append(f"{path.relative_to(ROOT)}: {match[:3]}***")
    assert not hits, "National ID pattern found (mask it before committing):\n" + "\n".join(hits)
