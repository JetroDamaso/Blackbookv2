import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

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
