#!/usr/bin/env python3
"""
Transforme les migrations MySQL (db/migration/V*.sql) en équivalents PostgreSQL
dans db/migration/postgresql/. Gère : backticks, ENGINE/CHARSET, ON UPDATE
CURRENT_TIMESTAMP, TINYINT(1)->BOOLEAN, DOUBLE->DOUBLE PRECISION, index préfixe
col(NNN)->col, et surtout les index INLINE MySQL (KEY/UNIQUE KEY) :
 - UNIQUE KEY name (cols) -> CONSTRAINT name UNIQUE (cols)  (gardé dans la table)
 - KEY name (cols)        -> CREATE INDEX name ON table (cols);  (sorti après)
"""
import re, sys, pathlib

SRC = pathlib.Path("src/main/resources/db/migration")
DST = SRC / "postgresql"
DST.mkdir(exist_ok=True)


def split_top_level(body: str):
    """Découpe le corps d'un CREATE TABLE par virgules de NIVEAU 0 (hors parens)."""
    parts, depth, cur = [], 0, ""
    for ch in body:
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        if ch == "," and depth == 0:
            parts.append(cur)
            cur = ""
        else:
            cur += ch
    if cur.strip():
        parts.append(cur)
    return parts


def transform_table(name: str, body: str):
    """Retourne (corps_table_transformé, [create_index...])."""
    kept, indexes = [], []
    for part in split_top_level(body):
        s = part.strip()
        m_u = re.match(r"UNIQUE\s+KEY\s+(\w+)\s*\((.+)\)$", s, re.I | re.S)
        m_k = re.match(r"KEY\s+(\w+)\s*\((.+)\)$", s, re.I | re.S)
        if m_u:
            cols = re.sub(r"\(\d+\)", "", m_u.group(2)).strip()
            kept.append(f"    CONSTRAINT {m_u.group(1)} UNIQUE ({cols})")
        elif m_k:
            cols = re.sub(r"\(\d+\)", "", m_k.group(2)).strip()
            indexes.append(f"CREATE INDEX IF NOT EXISTS {m_k.group(1)} ON {name} ({cols});")
        else:
            kept.append("    " + s)
    return ",\n".join(kept), indexes


def transform(sql: str) -> str:
    sql = sql.replace("`", "")
    sql = re.sub(r"\s*ENGINE=InnoDB[^;]*", "", sql, flags=re.I)
    sql = re.sub(r"\s+ON UPDATE CURRENT_TIMESTAMP", "", sql, flags=re.I)
    sql = re.sub(r"TINYINT\(1\)", "BOOLEAN", sql, flags=re.I)
    sql = re.sub(r"BOOLEAN(\s+NOT NULL)?\s+DEFAULT 0", r"BOOLEAN\1 DEFAULT FALSE", sql, flags=re.I)
    sql = re.sub(r"BOOLEAN(\s+NOT NULL)?\s+DEFAULT 1", r"BOOLEAN\1 DEFAULT TRUE", sql, flags=re.I)
    sql = re.sub(r"\bDOUBLE\b(?!\s+PRECISION)", "DOUBLE PRECISION", sql, flags=re.I)
    # Variantes TEXT MySQL -> TEXT Postgres
    sql = re.sub(r"\b(?:LONG|MEDIUM|TINY)TEXT\b", "TEXT", sql, flags=re.I)
    # ALTER TABLE x MODIFY col TYPE [NOT NULL...] -> ALTER COLUMN col TYPE
    sql = re.sub(
        r"ALTER TABLE\s+(\w+)\s+MODIFY\s+(\w+)\s+([A-Za-z]+(?:\(\d+\))?)[^;]*",
        r"ALTER TABLE \1 ALTER COLUMN \2 TYPE \3",
        sql, flags=re.I)

    out, i = [], 0
    pattern = re.compile(r"CREATE TABLE(\s+IF NOT EXISTS)?\s+(\w+)\s*\(", re.I)
    while True:
        m = pattern.search(sql, i)
        if not m:
            out.append(sql[i:])
            break
        out.append(sql[i:m.start()])
        name = m.group(2)
        # lire le corps jusqu'à la parenthèse fermante de niveau 0
        depth, j = 1, m.end()
        while j < len(sql) and depth > 0:
            if sql[j] == "(":
                depth += 1
            elif sql[j] == ")":
                depth -= 1
            j += 1
        body = sql[m.end():j - 1]
        rest_after = sql[j:]
        tail = rest_after[:rest_after.find(";") + 1]
        i = j + rest_after.find(";") + 1

        new_body, indexes = transform_table(name, body)
        out.append(f"CREATE TABLE{m.group(1) or ''} {name} (\n{new_body}\n);")
        for idx in indexes:
            out.append("\n" + idx)
    return "".join(out)


count = 0
for f in sorted(SRC.glob("V*.sql")):
    pg = transform(f.read_text(encoding="utf-8"))
    (DST / f.name).write_text(pg, encoding="utf-8")
    count += 1
print(f"{count} migrations transformées -> {DST}")
