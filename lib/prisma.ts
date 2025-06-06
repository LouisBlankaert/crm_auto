import { PrismaClient } from '@prisma/client';

// Éviter de créer plusieurs instances de PrismaClient en développement
// https://www.prisma.io/docs/guides/performance-and-optimization/connection-management

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // @ts-ignore
  if (!global.prisma) {
    // @ts-ignore
    global.prisma = new PrismaClient();
  }
  // @ts-ignore
  prisma = global.prisma;
}

export default prisma;
