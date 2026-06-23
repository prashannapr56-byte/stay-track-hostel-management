import initSqlJs from 'sql.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '..', 'data')
const dbPath = process.env.SQLITE_PATH || path.join(dataDir, 'staytrack.db')

const SQL = await initSqlJs()

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

let rawDb
if (fs.existsSync(dbPath)) {
  rawDb = new SQL.Database(fs.readFileSync(dbPath))
} else {
  rawDb = new SQL.Database()
}

function persist() {
  const data = rawDb.export()
  fs.mkdirSync(dataDir, { recursive: true })
  fs.writeFileSync(dbPath, Buffer.from(data))
}

const migrations = `
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  register_number TEXT NOT NULL UNIQUE,
  student_phone TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  block_code TEXT NOT NULL,
  room_number TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 4,
  status TEXT NOT NULL DEFAULT 'AVAILABLE',
  UNIQUE(block_code, room_number)
);

CREATE TABLE IF NOT EXISTS room_allocation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id),
  room_id INTEGER NOT NULL REFERENCES rooms(id),
  check_in_date TEXT NOT NULL,
  check_out_date TEXT,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id),
  attendance_date TEXT NOT NULL,
  status TEXT NOT NULL,
  remarks TEXT,
  UNIQUE(student_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS complaints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL REFERENCES admins(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS vacating_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id),
  vacate_date TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS registration_otps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  purpose TEXT NOT NULL
);
`

rawDb.exec(migrations)
persist()

function lastInsertRowid() {
  const r = rawDb.exec('SELECT last_insert_rowid() as id')
  if (!r.length || !r[0].values.length) return 0
  return r[0].values[0][0]
}

/** SQLite-style API similar to better-sqlite3 */
export const db = {
  prepare(sql) {
    return {
      get(...params) {
        const stmt = rawDb.prepare(sql)
        if (params.length) stmt.bind([...params])
        if (!stmt.step()) {
          stmt.free()
          return undefined
        }
        const row = stmt.getAsObject()
        stmt.free()
        return row
      },
      all(...params) {
        const stmt = rawDb.prepare(sql)
        if (params.length) stmt.bind([...params])
        const rows = []
        while (stmt.step()) rows.push(stmt.getAsObject())
        stmt.free()
        return rows
      },
      run(...params) {
        rawDb.run(sql, [...params])
        const id = lastInsertRowid()
        persist()
        return { lastInsertRowid: id }
      },
    }
  },
  close() {
    persist()
    rawDb.close()
  },
}
