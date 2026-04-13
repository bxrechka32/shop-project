// backend/src/routes/push.js
const express = require('express');
const router = express.Router();
const webpush = require('web-push');

// In production, store these in DB. Here we use app-level store.
webpush.setVapidDetails(
  'mailto:admin@shop.com',
  process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U',
  process.env.VAPID_PRIVATE_KEY || 'UUxI4O8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls'
);

/**
 * @swagger
 * /push/subscribe:
 *   post:
 *     summary: Subscribe to push notifications
 *     tags: [Push]
 *     security:
 *       - bearerAuth: []
 */
router.post('/subscribe', (req, res) => {
  const subscription = req.body;
  let subs = req.app.get('pushSubscriptions');
  if (!subs) {
    subs = [];
    req.app.set('pushSubscriptions', subs);
  }
  subs.push(subscription);
  res.status(201).json({ message: 'Subscribed' });
});

/**
 * @swagger
 * /push/vapidPublicKey:
 *   get:
 *     summary: Get VAPID public key
 *     tags: [Push]
 */
router.get('/vapidPublicKey', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U' });
});

module.exports = router;
