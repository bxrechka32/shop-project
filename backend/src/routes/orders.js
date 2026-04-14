// backend/src/routes/orders.js
const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { getChannel } = require('../config/rabbitmq');
const { logAction } = require('../middleware/logger');

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId: { type: integer }
 *                     quantity: { type: integer }
 */
router.post('/', authMiddleware, logAction('CREATE', 'order'), async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: 'No items' });

    // Use Prisma transaction for atomic order creation
    const order = await prisma.$transaction(async (tx) => {
      // Fetch and validate products within transaction
      const productIds = items.map((i) => i.productId);
      const products = await tx.product.findMany({ where: { id: { in: productIds } } });
      const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

      let total = 0;
      const orderItems = items.map((item) => {
        const product = productMap[item.productId];
        if (!product) throw new Error(`Product ${item.productId} not found`);
        const price = product.price * item.quantity;
        total += price;
        return { productId: item.productId, quantity: item.quantity, price };
      });

      // Create order with items atomically
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          total,
          items: { create: orderItems },
        },
        include: { items: { include: { product: true } }, user: { select: { email: true } } },
      });

      return newOrder;
    });

    // Send to RabbitMQ (outside transaction)
    const ch = getChannel();
    if (ch) {
      ch.sendToQueue(
        'orders',
        Buffer.from(JSON.stringify({ id: order.id, total: order.total, userEmail: order.user.email })),
        { persistent: true }
      );
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get my orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const where = req.user.role === 'ADMIN' ? {} : { userId: req.user.id };
    const orders = await prisma.order.findMany({
      where,
      include: { items: { include: { product: true } }, user: { select: { email: true, first_name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Update order status (admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/status', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
