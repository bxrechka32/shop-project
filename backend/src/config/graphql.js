const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginLandingPageLocalDefault } = require('@apollo/server/plugin/landingPage/default');
const prisma = require('./prisma');

const typeDefs = `#graphql
  type User {
    id: Int!
    email: String!
    first_name: String!
    last_name: String!
    role: String!
  }

  type Product {
    id: Int!
    name: String!
    description: String!
    price: Float!
    image: String
    seller: User
    createdAt: String!
  }

  type OrderItem {
    id: Int!
    quantity: Int!
    price: Float!
    product: Product
  }

  type Order {
    id: Int!
    total: Float!
    status: String!
    createdAt: String!
    items: [OrderItem!]!
    user: User
  }

  type Query {
    products: [Product!]!
    product(id: Int!): Product
    orders: [Order!]!
  }
`;

const resolvers = {
  Query: {
    products: () => prisma.product.findMany({
      include: { seller: { select: { id: true, first_name: true, last_name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    product: (_, { id }) => prisma.product.findUnique({
      where: { id },
      include: { seller: { select: { id: true, first_name: true, last_name: true, email: true } } },
    }),
    orders: () => prisma.order.findMany({
      include: { items: { include: { product: true } }, user: { select: { id: true, email: true, first_name: true, last_name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  },
};

async function createApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
  });
  await server.start();
  return expressMiddleware(server, {
    context: async ({ req }) => ({ req }),
  });
}

module.exports = { createApolloServer };
