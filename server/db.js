const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_PATH = path.join(__dirname, 'colorword.sqlite');
const BACKUP_DIR = path.join(__dirname, '..', 'sqlite_backups');

function getCurrentDateTime() {
  const date = new Date();
  const timeZoneOffset = new Date().getTimezoneOffset();
  const targetTime = new Date(date.getTime() - (timeZoneOffset * 60000));

  return targetTime.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'UTC'
  });
}

function persistDb(db) {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function getMonthStamp(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function createMonthlyBackupIfNeeded() {
  if (!fs.existsSync(DB_PATH)) return;

  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const monthStamp = getMonthStamp();
  const backupName = `colorword-${monthStamp}.sqlite`;
  const backupPath = path.join(BACKUP_DIR, backupName);

  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(DB_PATH, backupPath);
    console.log(`SQLite monthly backup created: ${backupPath}`);
  }

  const backupFiles = fs.readdirSync(BACKUP_DIR)
    .filter((name) => /^colorword-\d{4}-\d{2}\.sqlite$/.test(name))
    .sort((a, b) => b.localeCompare(a));

  for (let i = 2; i < backupFiles.length; i += 1) {
    fs.rmSync(path.join(BACKUP_DIR, backupFiles[i]), { force: true });
  }
}

function allRows(db, sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function oneRow(db, sql, params = []) {
  const rows = allRows(db, sql, params);
  return rows.length > 0 ? rows[0] : null;
}

const ready = (async () => {
  const SQL = await initSqlJs({
    locateFile: (file) => path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', file)
  });

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  const db = fs.existsSync(DB_PATH)
    ? new SQL.Database(fs.readFileSync(DB_PATH))
    : new SQL.Database();

  db.run(`
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS words (
  word TEXT PRIMARY KEY,
  meaning TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS colors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL,
  r INTEGER NOT NULL CHECK(r BETWEEN 0 AND 255),
  g INTEGER NOT NULL CHECK(g BETWEEN 0 AND 255),
  b INTEGER NOT NULL CHECK(b BETWEEN 0 AND 255),
  time TEXT NOT NULL,
  FOREIGN KEY (word) REFERENCES words(word) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_colors_word ON colors(word);
`);

  const wordData = require('../resources/wordData.json');
  const words = wordData.words || [];
  const meanings = wordData.meanings || [];
  const upsertWordStmt = db.prepare(`
INSERT INTO words(word, meaning)
VALUES (?, ?)
ON CONFLICT(word) DO UPDATE SET meaning=excluded.meaning
WHERE words.meaning <> excluded.meaning;
`);

  let changed = !fs.existsSync(DB_PATH);

  db.run('BEGIN;');
  try {
    for (let i = 0; i < words.length; i += 1) {
      upsertWordStmt.run([words[i], meanings[i] || '']);
      if (db.getRowsModified() > 0) {
        changed = true;
      }
      upsertWordStmt.reset();
    }
    db.run('COMMIT;');
  } catch (error) {
    db.run('ROLLBACK;');
    upsertWordStmt.free();
    throw error;
  }
  upsertWordStmt.free();

  if (changed) {
    persistDb(db);
  }

  createMonthlyBackupIfNeeded();

  console.log(`SQLite initialized. Synced ${words.length} words.`);
  return { db };
})();

let writeQueue = Promise.resolve();

function enqueueWrite(task) {
  writeQueue = writeQueue.then(task, task);
  return writeQueue;
}

async function addColor(word, r, g, b) {
  if (!Number.isInteger(r) || r < 0 || r > 255 ||
      !Number.isInteger(g) || g < 0 || g > 255 ||
      !Number.isInteger(b) || b < 0 || b > 255) {
    console.error('Invalid color values. r, g, and b must be integers between 0 and 255.');
    return;
  }

  return enqueueWrite(async () => {
    const { db } = await ready;
    const exists = oneRow(db, 'SELECT 1 AS ok FROM words WHERE word = ? LIMIT 1;', [word]);
    if (!exists) {
      console.error(`Word not found: ${word}`);
      return;
    }

    db.run(
      'INSERT INTO colors(word, r, g, b, time) VALUES (?, ?, ?, ?, ?);',
      [word, r, g, b, getCurrentDateTime()]
    );
    persistDb(db);
  }).catch((error) => {
    console.error('Failed to update word:', error);
    throw error;
  });
}

async function getColors(word) {
  try {
    const { db } = await ready;
    const exists = oneRow(db, 'SELECT 1 AS ok FROM words WHERE word = ? LIMIT 1;', [word]);
    if (!exists) {
      throw new Error('Word not found');
    }

    return allRows(db, 'SELECT r, g, b FROM colors WHERE word = ? ORDER BY id ASC;', [word])
      .map((row) => ({ r: Number(row.r), g: Number(row.g), b: Number(row.b) }));
  } catch (error) {
    console.error('Failed to retrieve colors:', error);
    throw error;
  }
}

async function getWordsWithColorsCount() {
  try {
    const { db } = await ready;
    const rows = allRows(db, `
SELECT w.word, w.meaning, COUNT(c.id) AS colorCount
FROM words w
LEFT JOIN colors c ON c.word = w.word
GROUP BY w.word, w.meaning
ORDER BY w.word ASC;
`);

    return rows.map((row) => [row.word, row.meaning, Number(row.colorCount)]);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = {
  addColor,
  getColors,
  getWordsWithColorsCount,
  DB_PATH,
  ready,
  persistDb,
  allRows
};
