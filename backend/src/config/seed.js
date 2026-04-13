// backend/src/config/seed.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('./prisma');

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const sellerPassword = await bcrypt.hash('seller123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@shop.com' },
    update: {},
    create: { email: 'admin@shop.com', first_name: 'Admin', last_name: 'User', password: adminPassword, role: 'ADMIN' },
  });

  const seller = await prisma.user.upsert({
    where: { email: 'seller@shop.com' },
    update: {},
    create: { email: 'seller@shop.com', first_name: 'Seller', last_name: 'User', password: sellerPassword, role: 'SELLER' },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@shop.com' },
    update: {},
    create: { email: 'user@shop.com', first_name: 'Regular', last_name: 'User', password: userPassword, role: 'USER' },
  });

  for (let i = 1; i <= 6; i++) {
    await prisma.product.upsert({
      where: { id: i },
      update: {},
      create: {
        name: `Product ${i}`,
        description: `Description for product ${i}`,
        price: parseFloat((Math.random() * 100 + 10).toFixed(2)),
        image: `https://picsum.photos/seed/${i}/400/300`,
        sellerId: seller.id,
      },
    });
  }

  console.log('✅ Seed complete:', { admin: admin.email, seller: seller.email, user: user.email });
}

main().catch(console.error).finally(() => prisma.$disconnect());
