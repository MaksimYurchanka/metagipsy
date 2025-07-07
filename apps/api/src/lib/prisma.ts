import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
export const prisma = globalThis.__prisma || new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'info', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' }
  ]
});

// FIXED: Remove problematic query logging for now
if (process.env.NODE_ENV === 'development') {
  // Commented out problematic event handler
  // prisma.$on('query' as any, (e: any) => {
  //   logger.debug(`Query: ${e.query}`);
  //   logger.debug(`Params: ${e.params}`);
  //   logger.debug(`Duration: ${e.duration}ms`);
  // });
  
  logger.info('Prisma client initialized in development mode');
}

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

export default prisma;