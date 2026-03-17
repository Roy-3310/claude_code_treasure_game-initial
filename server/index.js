const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, findUserByUsername, saveScore, getScoresByUser } = require('./db');
const { verifyToken, JWT_SECRET } = require('./auth');

const app = express();
app.use(cors());
app.use(express.json());

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const info = createUser.run(username, hashed);
    const token = jwt.sign({ userId: info.lastInsertRowid, username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      res.status(409).json({ error: 'Username already taken' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// POST /api/auth/signin
app.post('/api/auth/signin', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const user = findUserByUsername.get(username);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username: user.username });
});

// POST /api/scores (auth required)
app.post('/api/scores', verifyToken, (req, res) => {
  const { score } = req.body;
  if (score === undefined) return res.status(400).json({ error: 'Score required' });

  const result = score > 0 ? 'win' : score < 0 ? 'loss' : 'tie';
  saveScore.run(req.user.userId, score, result);
  res.json({ ok: true });
});

// GET /api/scores/me (auth required)
app.get('/api/scores/me', verifyToken, (req, res) => {
  const scores = getScoresByUser.all(req.user.userId);
  res.json(scores);
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
