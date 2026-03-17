const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'game.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    score INTEGER NOT NULL,
    result TEXT NOT NULL CHECK(result IN ('win', 'loss', 'tie')),
    played_at TEXT DEFAULT (datetime('now'))
  );
`);

const createUser = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
const findUserByUsername = db.prepare('SELECT * FROM users WHERE username = ?');
const saveScore = db.prepare('INSERT INTO scores (user_id, score, result) VALUES (?, ?, ?)');
const getScoresByUser = db.prepare('SELECT score, result, played_at FROM scores WHERE user_id = ? ORDER BY played_at DESC');

module.exports = { createUser, findUserByUsername, saveScore, getScoresByUser };
