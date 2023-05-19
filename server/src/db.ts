import sqlite from 'better-sqlite3'

export const db = sqlite('hack.db')

db.prepare('CREATE TABLE IF NOT EXISTS documents (id TEXT PRIMARY KEY, timestamp DATETIME, metadata TEXT, blob TEXT)').run()