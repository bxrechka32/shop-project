// backend/src/routes/products.js
const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { getRedis } = require('../config/redis');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { logAction } = require('../middleware/logger');
const { getChannel } = require('../config/rabbitmq');
const webpush = require('web-push');

const CACHE_KEY = 'products:all';
const CACHE_TTL = 60; // seconds

async function invalidateCache() {
  const redis = getRedis();
  if (redis) await redis.del(CACHE_KEY).catch(() => {});
}

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Array of products
 */
router.get('/', logAction('LIST', 'product'), async (req, res) => {
  try {
    const redis = getRedis();
    if (redis) {
      const cached = await redis.get(CACHE_KEY).catch(() => null);
      if (cached) return res.json({ data: JSON.parse(cached), cached: true });
    }

    const products = await prisma.product.findMany({
      include: { seller: { select: { id: true, first_name: true, last_name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    if (redis) await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(products)).catch(() => {});
    res.json({ data: products, cached: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { seller: { select: { id: true, first_name: true, last_name: true } } },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create product (seller/admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, price]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               image: { type: string }
 *               publishAt: { type: string, format: date-time }
 */
router.post(
  '/',
  authMiddleware,
  requireRole('SELLER', 'ADMIN'),
  logAction('CREATE', 'product'),
  async (req, res) => {
    try {
      const { name, description, price, image, publishAt } = req.body;
      const product = await prisma.product.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          image,
          publishAt: publishAt ? new Date(publishAt) : null,
          sellerId: req.user.id,
        },
      });

      await invalidateCache();

      // Notify all WebSocket clients
      const io = req.app.get('io');
      io.emit('product:new', { product, message: `New product: ${product.name}` });

      // Schedule push notification on publishAt
      if (publishAt) {
        const delay = new Date(publishAt).getTime() - Date.now();
        if (delay > 0) {
          setTimeout(() => sendAdminPush(req.app, product), delay);
        } else {
          sendAdminPush(req.app, product);
        }
      } else {
        sendAdminPush(req.app, product);
      }

      res.status(201).json(product);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

async function sendAdminPush(app, product) {
  try {
    const subscriptions = app.get('pushSubscriptions') || [];
    const payload = JSON.stringify({
      title: 'New product added',
      body: product.name,
      data: { productId: product.id },
      actions: [{ action: 'snooze', title: 'Snooze 5 min' }],
    });
    for (const sub of subscriptions) {
      webpush.sendNotification(sub, payload).catch(() => {});
    }
  } catch (err) {}
}

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update product (seller/admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/:id',
  authMiddleware,
  requireRole('SELLER', 'ADMIN'),
  logAction('UPDATE', 'product'),
  async (req, res) => {
    try {
      const { name, description, price, image, publishAt } = req.body;
      const product = await prisma.product.update({
        where: { id: parseInt(req.params.id) },
        data: { name, description, price: parseFloat(price), image, publishAt: publishAt ? new Date(publishAt) : undefined },
      });
      await invalidateCache();
      res.json(product);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete product (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  authMiddleware,
  requireRole('ADMIN'),
  logAction('DELETE', 'product'),
  async (req, res) => {
    try {
      await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
      await invalidateCache();
      res.json({ message: 'Product deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
