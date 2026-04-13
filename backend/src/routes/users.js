// backend/src/routes/users.js
const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { authMiddleware, requireRole } = require('../middleware/auth');
const Log = require('../models/Log');

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, first_name: true, last_name: true, role: true, createdAt: true },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, first_name: true, last_name: true, role: true, createdAt: true },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user role (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const { role } = req.body;
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { role },
      select: { id: true, email: true, role: true, first_name: true, last_name: true },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /users/logs:
 *   get:
 *     summary: Get action logs (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/logs', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
