// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
const refreshTokens = new Set();

function generateTokens(user) {
  const payload = { id: user.id, email: user.email, role: user.role };
  const access_token = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  const refresh_token = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { access_token, refresh_token };
}

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, first_name, last_name]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               first_name: { type: string }
 *               last_name: { type: string }
 *     responses:
 *       201:
 *         description: User registered
 *       400:
 *         description: User already exists
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, first_name, last_name },
      select: { id: true, email: true, role: true, first_name: true, last_name: true },
    });

    const tokens = generateTokens(user);
    refreshTokens.add(tokens.refresh_token);
    res.status(201).json({ user, ...tokens });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and get tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Tokens and user info
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const tokens = generateTokens(user);
    refreshTokens.add(tokens.refresh_token);

    res.json({
      user: { id: user.id, email: user.email, role: user.role, first_name: user.first_name, last_name: user.last_name },
      ...tokens,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh_token: { type: string }
 *     responses:
 *       200:
 *         description: New token pair
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh', (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token || !refreshTokens.has(refresh_token)) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
  try {
    const payload = jwt.verify(refresh_token, JWT_REFRESH_SECRET);
    refreshTokens.delete(refresh_token);
    const tokens = generateTokens(payload);
    refreshTokens.add(tokens.refresh_token);
    res.json(tokens);
  } catch (err) {
    refreshTokens.delete(refresh_token);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout (invalidate refresh token)
 *     tags: [Auth]
 */
router.post('/logout', (req, res) => {
  const { refresh_token } = req.body;
  if (refresh_token) refreshTokens.delete(refresh_token);
  res.json({ message: 'Logged out' });
});

module.exports = router;
