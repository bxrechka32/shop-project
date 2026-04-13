// backend/src/config/rabbitmq.js
let amqplib;
try { amqplib = require('amqplib'); } catch(e) {}

let channel = null;

async function connectRabbitMQ() {
  if (!amqplib) return;
  try {
    const conn = await amqplib.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    channel = await conn.createChannel();
    await channel.assertQueue('orders', { durable: true });
    console.log('✅ RabbitMQ connected');

    // Consumer — sends email (stub)
    channel.consume('orders', (msg) => {
      if (msg) {
        const order = JSON.parse(msg.content.toString());
        console.log(`📧 [EMAIL STUB] Order #${order.id} confirmed for user ${order.userEmail}. Total: $${order.total}`);
        channel.ack(msg);
      }
    });
  } catch (err) {
    console.error('RabbitMQ connection error:', err.message);
  }
}

function getChannel() {
  return channel;
}

module.exports = { connectRabbitMQ, getChannel };
