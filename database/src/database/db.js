const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../data/temp_share.db');
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath, { verbose: console.log });
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log('Veritabanı bağlantısı (A-kisisi) -> ' + dbPath);

// USERS + FILES şeması (raporlar yok)
const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s','now')),
        updated_at INTEGER DEFAULT (strftime('%s','now')),
        last_login_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        token TEXT NOT NULL UNIQUE,
        owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        filename TEXT NOT NULL,
        filepath TEXT NOT NULL,
        mime_type TEXT,
        size_bytes INTEGER,
        password_hash TEXT,
        e2ee_enabled INTEGER DEFAULT 0,
        burn_after_download INTEGER DEFAULT 0,
        download_limit INTEGER NOT NULL DEFAULT 1 CHECK (download_limit > 0),
        download_count INTEGER NOT NULL DEFAULT 0 CHECK (download_count >= 0),
        expires_at INTEGER NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s','now')),
        updated_at INTEGER DEFAULT (strftime('%s','now'))
    );

    CREATE INDEX IF NOT EXISTS idx_files_expires_at ON files (expires_at);
    CREATE INDEX IF NOT EXISTS idx_files_owner ON files (owner_id);
    CREATE INDEX IF NOT EXISTS idx_files_token ON files (token);
`;
db.exec(createTablesQuery);

// Tetikleyiciler: users + files
const triggerQuery = `
    CREATE TRIGGER IF NOT EXISTS trg_users_updated
    AFTER UPDATE ON users
    FOR EACH ROW
    BEGIN
        UPDATE users SET updated_at = strftime('%s','now') WHERE id = OLD.id;
    END;

    CREATE TRIGGER IF NOT EXISTS trg_files_updated
    AFTER UPDATE ON files
    FOR EACH ROW
    BEGIN
        UPDATE files SET updated_at = strftime('%s','now') WHERE id = OLD.id;
    END;
`;
db.exec(triggerQuery);

console.log('Şema ve tetikleyiciler (users + files) hazır.');

module.exports = db;

