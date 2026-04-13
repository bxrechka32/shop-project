<div align="center">

# &nbsp;&nbsp;SHOP PROJECT

### Modern Fullstack E-Commerce Platform

[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3.12-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Nginx](https://img.shields.io/badge/Nginx-Alpine-009639?style=for-the-badge&logo=nginx&logoColor=white)](https://nginx.org/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

---

**Production-grade** e-commerce monorepo with 3-instance load balancing,
real-time WebSocket notifications, PWA offline support, JWT authentication,
role-based access control, audit logging, and message queue processing.

[Getting Started](#-getting-started) &bull;
[Architecture](#-architecture) &bull;
[API Reference](#-api-reference) &bull;
[Demo Accounts](#-demo-accounts)

</div>

---

## Features

<table>
<tr>
<td width="50%">

**Frontend**
- React 18 + Vite SPA
- Zustand state management
- Real-time notifications via Socket.io
- PWA with offline caching & push notifications
- SASS/SCSS styling
- Auto token refresh on 401

</td>
<td width="50%">

**Backend**
- 3 Express.js instances (load balanced)
- JWT auth with access + refresh tokens
- Role-based access (USER / SELLER / ADMIN)
- Swagger/OpenAPI documentation
- Audit logging to MongoDB
- Redis product caching (60s TTL)

</td>
</tr>
<tr>
<td>

**Infrastructure**
- Docker Compose orchestration
- Nginx reverse proxy & load balancer
- PostgreSQL for primary data
- MongoDB for audit logs
- Health checks on all services

</td>
<td>

**Advanced**
- RabbitMQ async order processing
- Web Push notifications (VAPID)
- Service Worker caching strategies
- CORS & security middleware
- Prisma ORM with migrations & seeding

</td>
</tr>
</table>

---

## Architecture

```
                         :80
                    +----+----+
                    |  Nginx  |
                    +----+----+
                   /     |     \
           /api   /      |      \   /api
        +--------+  +--------+  +--------+
        |Backend1|  |Backend2|  |Backend3|
        | :3001  |  | :3002  |  | :3003  |
        +---+----+  +---+----+  +---+----+
            |            |            |
    +-------+------------+------------+-------+
    |       |            |            |       |
+---+---+ +-+--------+ ++------+ +---+----+  |
|Postgre| | MongoDB  | | Redis | |RabbitMQ|  |
| SQL   | | (logs)   | |(cache)| | (queue)|  |
+-------+ +----------+ +-------+ +--------+  |
                                              |
                    +----------+              |
                    | Frontend | <--- Nginx --+
                    | (SPA)    |       /
                    +----------+
```

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Launch

```bash
git clone https://github.com/bxrechka32/shop-project.git
cd shop-project
docker compose up --build
```

That's it. Wait for all services to become healthy, then open **http://localhost**.

### Services

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost | Main application |
| **API (via proxy)** | http://localhost/api/ | Backend through Nginx |
| **Swagger Docs** | http://localhost/api-docs/ | Interactive API docs |
| **Backend 1** | http://localhost:3001 | Direct instance access |
| **Backend 2** | http://localhost:3002 | Direct instance access |
| **Backend 3** | http://localhost:3003 | Direct instance access |
| **RabbitMQ UI** | http://localhost:15672 | Queue management (`guest`/`guest`) |

---

## Demo Accounts

| Email | Password | Role | Permissions |
|-------|----------|------|-------------|
| `admin@shop.com` | `admin123` | **ADMIN** | Full access: users, products, orders, logs |
| `seller@shop.com` | `seller123` | **SELLER** | Create & manage own products |
| `user@shop.com` | `user123` | **USER** | Browse, cart, place orders |

---

## API Reference

All endpoints are prefixed with `/api`. Full interactive docs at `/api-docs/`.

### Auth `/api/auth`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/register` | Create account | - |
| `POST` | `/login` | Get JWT tokens | - |
| `POST` | `/refresh` | Refresh access token | - |
| `POST` | `/logout` | Invalidate refresh token | - |

### Products `/api/products`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/` | List all products (Redis cached) | - |
| `GET` | `/:id` | Get product details | - |
| `POST` | `/` | Create product | SELLER, ADMIN |
| `PUT` | `/:id` | Update product | SELLER, ADMIN |
| `DELETE` | `/:id` | Delete product | ADMIN |

### Orders `/api/orders`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/` | Place order (RabbitMQ) | USER+ |
| `GET` | `/` | My orders (admin: all) | USER+ |
| `PUT` | `/:id/status` | Update order status | ADMIN |

### Users `/api/users`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/me` | Current user profile | USER+ |
| `GET` | `/` | List all users | ADMIN |
| `PUT` | `/:id` | Update user role | ADMIN |
| `DELETE` | `/:id` | Delete user | ADMIN |
| `GET` | `/logs` | Audit logs (MongoDB) | ADMIN |

### Push `/api/push`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/vapidPublicKey` | Get VAPID key | - |
| `POST` | `/subscribe` | Subscribe to push | - |

---

## Tech Stack

<table>
<tr>
<th>Layer</th>
<th>Technology</th>
<th>Purpose</th>
</tr>
<tr><td><b>Frontend</b></td><td>React 18 + Vite 5</td><td>SPA with HMR</td></tr>
<tr><td></td><td>Zustand</td><td>State management</td></tr>
<tr><td></td><td>React Router 6</td><td>Client-side routing</td></tr>
<tr><td></td><td>Socket.io Client</td><td>Real-time events</td></tr>
<tr><td></td><td>SASS/SCSS</td><td>Styling</td></tr>
<tr><td></td><td>Vite PWA Plugin</td><td>Service worker & caching</td></tr>
<tr><td><b>Backend</b></td><td>Express.js 4</td><td>REST API server</td></tr>
<tr><td></td><td>Prisma 5</td><td>PostgreSQL ORM</td></tr>
<tr><td></td><td>Mongoose 8</td><td>MongoDB ODM (logs)</td></tr>
<tr><td></td><td>Socket.io</td><td>WebSocket server</td></tr>
<tr><td></td><td>ioredis</td><td>Redis client (caching)</td></tr>
<tr><td></td><td>amqplib</td><td>RabbitMQ client</td></tr>
<tr><td></td><td>jsonwebtoken</td><td>JWT auth (15min + 7d refresh)</td></tr>
<tr><td></td><td>web-push</td><td>Push notifications</td></tr>
<tr><td></td><td>Swagger UI</td><td>API documentation</td></tr>
<tr><td><b>Database</b></td><td>PostgreSQL 16</td><td>Primary data store</td></tr>
<tr><td></td><td>MongoDB 7</td><td>Audit log storage</td></tr>
<tr><td></td><td>Redis 7</td><td>Caching & sessions</td></tr>
<tr><td><b>Queue</b></td><td>RabbitMQ 3.12</td><td>Async order processing</td></tr>
<tr><td><b>Proxy</b></td><td>Nginx</td><td>Load balancer & reverse proxy</td></tr>
<tr><td><b>Infra</b></td><td>Docker Compose</td><td>Container orchestration</td></tr>
</table>

---

## Project Structure

```
shop-project/
|
|-- docker-compose.yml            # All services orchestration
|-- .dockerignore                  # Docker build exclusions
|
|-- prisma/
|   |-- schema.prisma              # Database schema (User, Product, Order, OrderItem)
|   +-- migrations/                # PostgreSQL migration history
|
|-- backend/
|   |-- Dockerfile
|   |-- package.json
|   +-- src/
|       |-- index.js               # Express + Socket.io + RabbitMQ bootstrap
|       |-- config/
|       |   |-- prisma.js          # Prisma client singleton
|       |   |-- mongodb.js         # Mongoose connection
|       |   |-- redis.js           # ioredis client
|       |   |-- rabbitmq.js        # AMQP connection & consumer
|       |   |-- swagger.js         # OpenAPI spec config
|       |   +-- seed.js            # Demo data seeder
|       |-- middleware/
|       |   |-- auth.js            # JWT verification & RBAC
|       |   +-- logger.js          # MongoDB audit logger
|       |-- models/
|       |   +-- Log.js             # Mongoose audit log schema
|       +-- routes/
|           |-- auth.js            # Register, login, refresh, logout
|           |-- products.js        # CRUD + cache + WebSocket + push
|           |-- users.js           # Profile, admin user management
|           |-- orders.js          # Order placement & management
|           +-- push.js            # Web Push subscription
|
|-- frontend/
|   |-- Dockerfile
|   |-- package.json
|   |-- vite.config.js             # Vite + PWA plugin config
|   |-- nginx-spa.conf             # SPA fallback for nginx
|   +-- src/
|       |-- App.jsx                # Router & layout
|       |-- main.jsx               # React entry point
|       |-- pages/
|       |   |-- ProductsPage.jsx   # Product catalog & cart
|       |   |-- LoginPage.jsx      # Authentication
|       |   |-- RegisterPage.jsx   # User registration
|       |   |-- ProfilePage.jsx    # User profile & push settings
|       |   |-- OrdersPage.jsx     # Order history
|       |   +-- AdminPage.jsx      # Admin dashboard
|       |-- components/
|       |   |-- Layout.jsx         # Header, nav, footer
|       |   |-- ProductCard.jsx    # Product display card
|       |   |-- ProductForm.jsx    # Create/edit product modal
|       |   +-- ToastContainer.jsx # Notification toasts
|       |-- store/
|       |   |-- authStore.js       # Auth state (Zustand)
|       |   +-- toastStore.js      # Toast notifications (Zustand)
|       |-- hooks/
|       |   +-- useSocket.js       # Socket.io real-time hook
|       |-- utils/
|       |   |-- api.js             # Axios instance + interceptors
|       |   +-- push.js            # Web Push subscription helper
|       +-- styles/                # SCSS stylesheets
|
+-- nginx/
    |-- nginx.conf                 # Reverse proxy & load balancer config
    +-- certs/                     # TLS certificates (production)
```

---

## Database Schema

```
+----------------+       +----------------+       +----------------+
|     Users      |       |    Products    |       |     Orders     |
+----------------+       +----------------+       +----------------+
| id        PK   |--+    | id        PK   |    +-| id        PK   |
| email  UNIQUE  |  |    | name           |    |  | userId    FK   |--+
| first_name     |  +---<| sellerId  FK   |    |  | total          |  |
| last_name      |       | description    |    |  | status (enum)  |  |
| password (hash)|       | price          |    |  | createdAt      |  |
| role   (enum)  |       | image          |    |  +----------------+  |
| createdAt      |       | publishAt      |    |                     |
| updatedAt      |       | createdAt      |    |  +----------------+ |
+----------------+       | updatedAt      |    |  |  Order Items   | |
                         +----------------+    |  +----------------+ |
  Roles:                        |              +--| orderId   FK   | |
  - USER                        |                 | productId FK   |-+
  - SELLER                      +--------------<--| quantity       |
  - ADMIN                                        | price          |
                                                  +----------------+
  Order Statuses:
  PENDING -> PROCESSING -> SHIPPED -> DELIVERED
                                  \-> CANCELLED
```

---

## Caching Strategy

| Layer | Strategy | TTL | Target |
|-------|----------|-----|--------|
| **Redis** | Cache-aside | 60s | Product list API |
| **Service Worker** | Cache First | - | App shell (JS, CSS, HTML) |
| **Service Worker** | Network First | 5min | `/api/products` |
| **Service Worker** | Stale While Revalidate | - | External images |

---

## Stopping

```bash
# Stop all containers
docker compose down

# Stop and remove all data (fresh start)
docker compose down -v
```

---

<div align="center">

Built with modern web technologies for learning and demonstration purposes.

</div>
