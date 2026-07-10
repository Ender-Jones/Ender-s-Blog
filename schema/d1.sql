-- D1 = 当日工作区(working tree), 不是本源 — git markdown 才是.
-- close-the-day 把行编成月文件的一节提交进 git, 然后这里只打归档标记(committed=1).
-- 上线时执行: npx wrangler d1 execute EJ_DB --remote --file=schema/d1.sql

CREATE TABLE IF NOT EXISTS lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day TEXT NOT NULL,              -- 逻辑日 YYYY-MM-DD(04:00 JST 为界)
  type TEXT NOT NULL,             -- project | done | decision | risk | next | drop | public
  text TEXT NOT NULL,
  created_at TEXT NOT NULL,       -- ISO UTC
  amended_at TEXT,
  deleted INTEGER NOT NULL DEFAULT 0,
  committed INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_lines_day ON lines (day, committed, deleted);
