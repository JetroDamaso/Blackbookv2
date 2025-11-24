import 'dotenv/config'
import { PrismaClient } from "../generated/prisma";
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const db = new Database(process.env.DATABASE_URL?.replace('file:', '') || './prisma/dev.db');
const adapter = new PrismaBetterSqlite3(db);
const prisma = new PrismaClient({ adapter });

async function seedDocumentCategories() {
  const categories = [
    { name: "Contract" },
    { name: "ID / Identification" },
    { name: "Receipt" },
    { name: "Permit" },
    { name: "Agreement" },
    { name: "Other" },
  ];

  for (const category of categories) {
    await prisma.scannedDocumentCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log("Document categories seeded successfully!");
}

seedDocumentCategories()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
