import { PrismaService } from '../../src/core/database/prisma.service'

export async function cleanDatabase(prisma: PrismaService) {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `

  const tableNames = tables
    .map(({ tablename }) => `"${tablename}"`)
    .filter(name => name !== '"_prisma_migrations"')
    .join(', ')

  if (tableNames) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`,
    )
  }
}