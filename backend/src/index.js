// backend/src/index.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const pushRoutes = require('./routes/push');

const { connectMongo } = require('./config/mongodb');
const { connectRedis } = require('./config/redis');
const { connectRabbitMQ } = require('./config/rabbitmq');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Expose io globally
app.set('io', io);

// Middlewares
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('combined'));

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/push', pushRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', instance: process.env.INSTANCE_ID || 1 }));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// Start
const PORT = process.env.PORT || 3001;

async function start() {
  await connectMongo();
  await connectRedis();
  await connectRabbitMQ();

  server.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
    console.log(`📚 Swagger docs: http://localhost:${PORT}/api-docs`);
  });
}

start().catch(console.error);
