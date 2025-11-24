import 'dotenv/config'
import { PrismaClient } from "../generated/prisma";
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const dbPath = process.env.DATABASE_URL 
  ? process.env.DATABASE_URL.replace('file:', '').replace(/"/g, '')
  : './dev.db';

console.log('Database path:', dbPath);
const db = new Database(dbPath);
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting comprehensive database seeding...\n");

  // ========== ROLES ==========
  console.log("👤 Seeding Roles...");
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { id: 1 },
      update: {},
      create: { name: "Admin" },
    }),
    prisma.role.upsert({
      where: { id: 2 },
      update: {},
      create: { name: "Manager" },
    }),
    prisma.role.upsert({
      where: { id: 3 },
      update: {},
      create: { name: "Staff" },
    }),
    prisma.role.upsert({
      where: { id: 4 },
      update: {},
      create: { name: "Cashier" },
    }),
  ]);
  console.log(`✅ Created ${roles.length} roles\n`);

  // ========== EMPLOYEES ==========
  console.log("👔 Seeding Employees...");
  const employees = await Promise.all([
    prisma.employee.upsert({
      where: { id: "admin-001" },
      update: {},
      create: {
        id: "admin-001",
        empId: "EMP001",
        firstName: "John",
        lastName: "Admin",
        password: "$2a$10$K7L1OJ45/4Y9EYc8oJWRIuNqZ0bsqFmRQFO9K6OYS3HQJX4YQHQJW", // "password"
        roleId: 1,
        dateOfEmployment: new Date("2023-01-15"),
        isActive: true,
      },
    }),
    prisma.employee.upsert({
      where: { id: "manager-001" },
      update: {},
      create: {
        id: "manager-001",
        empId: "EMP002",
        firstName: "Maria",
        lastName: "Santos",
        password: "$2a$10$K7L1OJ45/4Y9EYc8oJWRIuNqZ0bsqFmRQFO9K6OYS3HQJX4YQHQJW",
        roleId: 2,
        dateOfEmployment: new Date("2023-03-20"),
        isActive: true,
      },
    }),
    prisma.employee.upsert({
      where: { id: "staff-001" },
      update: {},
      create: {
        id: "staff-001",
        empId: "EMP003",
        firstName: "Jose",
        lastName: "Reyes",
        password: "$2a$10$K7L1OJ45/4Y9EYc8oJWRIuNqZ0bsqFmRQFO9K6OYS3HQJX4YQHQJW",
        roleId: 3,
        dateOfEmployment: new Date("2023-06-10"),
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ Created ${employees.length} employees\n`);

  // ========== CLIENTS ==========
  console.log("👥 Seeding Clients...");
  const clients = await Promise.all([
    prisma.client.upsert({
      where: { email: "juan.cruz@email.com" },
      update: {},
      create: {
        firstName: "Juan",
        lastName: "Cruz",
        region: "NCR",
        province: "Metro Manila",
        municipality: "Quezon City",
        barangay: "Barangay Holy Spirit",
        phoneNumber: "+639171234567",
        email: "juan.cruz@email.com",
      },
    }),
    prisma.client.upsert({
      where: { email: "ana.garcia@email.com" },
      update: {},
      create: {
        firstName: "Ana",
        lastName: "Garcia",
        region: "NCR",
        province: "Metro Manila",
        municipality: "Makati",
        barangay: "Poblacion",
        phoneNumber: "+639181234567",
        email: "ana.garcia@email.com",
      },
    }),
    prisma.client.upsert({
      where: { email: "pedro.lopez@email.com" },
      update: {},
      create: {
        firstName: "Pedro",
        lastName: "Lopez",
        region: "Region IV-A",
        province: "Cavite",
        municipality: "Bacoor",
        barangay: "Molino",
        phoneNumber: "+639191234567",
        email: "pedro.lopez@email.com",
      },
    }),
  ]);
  console.log(`✅ Created ${clients.length} clients\n`);

  // ========== PAVILIONS ==========
  console.log("🏛️ Seeding Pavilions...");
  const pavilions = await Promise.all([
    prisma.pavilion.upsert({
      where: { name: "Grand Pavilion" },
      update: {},
      create: {
        name: "Grand Pavilion",
        price: 15000,
        maxPax: 300,
        description: "Our largest venue perfect for grand celebrations",
        color: "#3B82F6",
        isActive: true,
      },
    }),
    prisma.pavilion.upsert({
      where: { name: "Garden Pavilion" },
      update: {},
      create: {
        name: "Garden Pavilion",
        price: 12000,
        maxPax: 200,
        description: "Beautiful garden setting for intimate gatherings",
        color: "#10B981",
        isActive: true,
      },
    }),
    prisma.pavilion.upsert({
      where: { name: "Poolside Pavilion" },
      update: {},
      create: {
        name: "Poolside Pavilion",
        price: 18000,
        maxPax: 250,
        description: "Modern poolside venue with stunning views",
        color: "#06B6D4",
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ Created ${pavilions.length} pavilions\n`);

  // ========== EVENT TYPES ==========
  console.log("🎉 Seeding Event Types...");
  const eventTypes = await Promise.all([
    prisma.eventTypes.upsert({
      where: { name: "Wedding" },
      update: {},
      create: { name: "Wedding" },
    }),
    prisma.eventTypes.upsert({
      where: { name: "Birthday" },
      update: {},
      create: { name: "Birthday" },
    }),
    prisma.eventTypes.upsert({
      where: { name: "Corporate Event" },
      update: {},
      create: { name: "Corporate Event" },
    }),
    prisma.eventTypes.upsert({
      where: { name: "Debut" },
      update: {},
      create: { name: "Debut" },
    }),
    prisma.eventTypes.upsert({
      where: { name: "Anniversary" },
      update: {},
      create: { name: "Anniversary" },
    }),
  ]);
  console.log(`✅ Created ${eventTypes.length} event types\n`);

  // ========== PACKAGES ==========
  console.log("📦 Seeding Venue Packages...");
  const packages = await Promise.all([
    prisma.package.create({
      data: {
        name: "Basic Package",
        pavilionId: pavilions[0].id,
        price: 20000,
        description: "Includes basic amenities and setup",
        includePool: false,
      },
    }),
    prisma.package.create({
      data: {
        name: "Premium Package",
        pavilionId: pavilions[2].id,
        price: 35000,
        description: "Premium setup with pool access",
        includePool: true,
      },
    }),
  ]);
  console.log(`✅ Created ${packages.length} venue packages\n`);

  // ========== DISH CATEGORIES ==========
  console.log("🍽️ Seeding Dish Categories...");
  const dishCategoryNames = [
    "Beef", "Chicken", "Pork", "Fish", "Vegetables",
    "Rice", "Mixed Seafoods", "Ice Tea", "Dessert", "Soup", "Appetizer"
  ];

  const dishCategories = await Promise.all(
    dishCategoryNames.map(name =>
      prisma.dishCategory.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );
  console.log(`✅ Created ${dishCategories.length} dish categories\n`);

  const categoryMap = Object.fromEntries(
    dishCategories.map(cat => [cat.name, cat.id])
  );

  // ========== DISHES ==========
  console.log("🥘 Seeding Dishes...");
  const dishes = await Promise.all([
    // Beef
    prisma.dish.create({ data: { name: "Beef Caldereta", categoryId: categoryMap["Beef"], description: "Spicy beef stew" } }),
    prisma.dish.create({ data: { name: "Beef Mechado", categoryId: categoryMap["Beef"], description: "Tender beef in tomato sauce" } }),
    prisma.dish.create({ data: { name: "Beef Tapa", categoryId: categoryMap["Beef"], description: "Sweet marinated beef" } }),

    // Chicken
    prisma.dish.create({ data: { name: "Chicken Adobo", categoryId: categoryMap["Chicken"], description: "Classic Filipino chicken dish" } }),
    prisma.dish.create({ data: { name: "Fried Chicken", categoryId: categoryMap["Chicken"], description: "Crispy fried chicken" } }),
    prisma.dish.create({ data: { name: "Chicken Teriyaki", categoryId: categoryMap["Chicken"], description: "Sweet and savory glazed chicken" } }),

    // Pork
    prisma.dish.create({ data: { name: "Lechon Kawali", categoryId: categoryMap["Pork"], description: "Crispy pork belly" } }),
    prisma.dish.create({ data: { name: "Pork BBQ", categoryId: categoryMap["Pork"], description: "Grilled pork skewers" } }),
    prisma.dish.create({ data: { name: "Sweet and Sour Pork", categoryId: categoryMap["Pork"], description: "Pork in tangy sauce" } }),

    // Fish
    prisma.dish.create({ data: { name: "Grilled Tilapia", categoryId: categoryMap["Fish"], description: "Charcoal grilled fish" } }),
    prisma.dish.create({ data: { name: "Fish Fillet", categoryId: categoryMap["Fish"], description: "Crispy fried fish fillet" } }),

    // Seafood
    prisma.dish.create({ data: { name: "Shrimp Tempura", categoryId: categoryMap["Mixed Seafoods"], description: "Battered fried shrimp" } }),
    prisma.dish.create({ data: { name: "Seafood Paella", categoryId: categoryMap["Mixed Seafoods"], description: "Spanish-style rice with seafood" } }),

    // Vegetables
    prisma.dish.create({ data: { name: "Chopsuey", categoryId: categoryMap["Vegetables"], description: "Mixed vegetables stir-fry" } }),
    prisma.dish.create({ data: { name: "Pinakbet", categoryId: categoryMap["Vegetables"], description: "Traditional vegetable medley" } }),

    // Rice
    prisma.dish.create({ data: { name: "Garlic Rice", categoryId: categoryMap["Rice"], description: "Fragrant garlic fried rice" } }),
    prisma.dish.create({ data: { name: "Java Rice", categoryId: categoryMap["Rice"], description: "Turmeric-flavored rice" } }),

    // Soup
    prisma.dish.create({ data: { name: "Sinigang", categoryId: categoryMap["Soup"], description: "Sour tamarind soup" } }),

    // Dessert
    prisma.dish.create({ data: { name: "Leche Flan", categoryId: categoryMap["Dessert"], description: "Caramel custard" } }),
    prisma.dish.create({ data: { name: "Fruit Salad", categoryId: categoryMap["Dessert"], description: "Mixed fruits in cream" } }),

    // Beverages
    prisma.dish.create({ data: { name: "Iced Tea", categoryId: categoryMap["Ice Tea"], description: "Refreshing iced tea" } }),
  ]);
  console.log(`✅ Created ${dishes.length} dishes\n`);

  // ========== MENU PACKAGES ==========
  console.log("📋 Seeding Menu Packages...");
  await prisma.menuPackages.deleteMany({});

  const menuPackages = [
    {
      name: "Package A - Classic Menu",
      price: 250,
      maxDishes: 5,
      description: "Our classic 5-dish menu with traditional favorites",
      categories: ["Beef", "Chicken", "Pork", "Fish", "Vegetables", "Rice"],
    },
    {
      name: "Package B - Deluxe Menu",
      price: 350,
      maxDishes: 6,
      description: "Deluxe menu with seafood and beverages included",
      categories: ["Beef", "Chicken", "Pork", "Fish", "Vegetables", "Rice", "Mixed Seafoods", "Ice Tea"],
    },
    {
      name: "Package C - Premium Menu",
      price: 450,
      maxDishes: 7,
      description: "Premium all-inclusive menu with dessert and soup",
      categories: ["Beef", "Chicken", "Pork", "Fish", "Vegetables", "Rice", "Mixed Seafoods", "Ice Tea", "Dessert", "Soup"],
    },
    {
      name: "Package D - Economy Menu",
      price: 180,
      maxDishes: 4,
      description: "Budget-friendly menu with essential dishes",
      categories: ["Chicken", "Pork", "Vegetables", "Rice"],
    },
    {
      name: "Package E - Seafood Special",
      price: 500,
      maxDishes: 6,
      description: "Seafood-focused menu for seafood lovers",
      categories: ["Fish", "Mixed Seafoods", "Vegetables", "Rice", "Soup", "Appetizer"],
    },
  ];

  for (const pkg of menuPackages) {
    await prisma.menuPackages.create({
      data: {
        name: pkg.name,
        price: pkg.price,
        maxDishes: pkg.maxDishes,
        description: pkg.description,
        isActive: true,
        isDeleted: false,
        allowedCategories: {
          connect: pkg.categories
            .map(catName => ({ id: categoryMap[catName] }))
            .filter(Boolean),
        },
      },
    });
  }
  console.log(`✅ Created ${menuPackages.length} menu packages\n`);

  // ========== INVENTORY CATEGORIES ==========
  console.log("📦 Seeding Inventory Categories...");
  const invCategories = await Promise.all([
    prisma.inventoryCategory.upsert({
      where: { name: "Tables" },
      update: {},
      create: { name: "Tables" },
    }),
    prisma.inventoryCategory.upsert({
      where: { name: "Chairs" },
      update: {},
      create: { name: "Chairs" },
    }),
    prisma.inventoryCategory.upsert({
      where: { name: "Linens" },
      update: {},
      create: { name: "Linens" },
    }),
    prisma.inventoryCategory.upsert({
      where: { name: "Utensils" },
      update: {},
      create: { name: "Utensils" },
    }),
    prisma.inventoryCategory.upsert({
      where: { name: "Decorations" },
      update: {},
      create: { name: "Decorations" },
    }),
  ]);
  console.log(`✅ Created ${invCategories.length} inventory categories\n`);

  // ========== INVENTORY ITEMS ==========
  console.log("📋 Seeding Inventory Items...");
  const inventoryItems = await Promise.all([
    prisma.inventoryItem.create({
      data: { name: "Round Table", categoryId: invCategories[0].id, quantity: 50, out: 0 },
    }),
    prisma.inventoryItem.create({
      data: { name: "Rectangular Table", categoryId: invCategories[0].id, quantity: 30, out: 0 },
    }),
    prisma.inventoryItem.create({
      data: { name: "Tiffany Chair", categoryId: invCategories[1].id, quantity: 300, out: 0 },
    }),
    prisma.inventoryItem.create({
      data: { name: "Monobloc Chair", categoryId: invCategories[1].id, quantity: 200, out: 0 },
    }),
    prisma.inventoryItem.create({
      data: { name: "Table Cloth (White)", categoryId: invCategories[2].id, quantity: 100, out: 0 },
    }),
    prisma.inventoryItem.create({
      data: { name: "Napkins", categoryId: invCategories[2].id, quantity: 500, out: 0 },
    }),
    prisma.inventoryItem.create({
      data: { name: "Plates", categoryId: invCategories[3].id, quantity: 400, out: 0 },
    }),
    prisma.inventoryItem.create({
      data: { name: "Spoons", categoryId: invCategories[3].id, quantity: 400, out: 0 },
    }),
    prisma.inventoryItem.create({
      data: { name: "Forks", categoryId: invCategories[3].id, quantity: 400, out: 0 },
    }),
  ]);
  console.log(`✅ Created ${inventoryItems.length} inventory items\n`);

  // ========== ROOMS ==========
  console.log("🛏️ Seeding Rooms...");
  const rooms = await Promise.all([
    prisma.rooms.upsert({
      where: { name: "Bridal Suite" },
      update: {},
      create: { name: "Bridal Suite", capacity: 4 },
    }),
    prisma.rooms.upsert({
      where: { name: "VIP Room 1" },
      update: {},
      create: { name: "VIP Room 1", capacity: 6 },
    }),
    prisma.rooms.upsert({
      where: { name: "VIP Room 2" },
      update: {},
      create: { name: "VIP Room 2", capacity: 6 },
    }),
  ]);
  console.log(`✅ Created ${rooms.length} rooms\n`);

  // ========== OTHER SERVICE CATEGORIES ==========
  console.log("🎵 Seeding Other Service Categories...");
  const serviceCategories = await Promise.all([
    prisma.otherServiceCategory.create({ data: { name: "Entertainment" } }),
    prisma.otherServiceCategory.create({ data: { name: "Photography" } }),
    prisma.otherServiceCategory.create({ data: { name: "Decoration" } }),
  ]);
  console.log(`✅ Created ${serviceCategories.length} service categories\n`);

  // ========== OTHER SERVICES ==========
  console.log("💼 Seeding Other Services...");
  const otherServices = await Promise.all([
    prisma.otherService.create({
      data: {
        name: "Live Band",
        categoryId: serviceCategories[0].id,
        amount: 15000,
        description: "Professional 5-piece live band",
      },
    }),
    prisma.otherService.create({
      data: {
        name: "DJ Service",
        categoryId: serviceCategories[0].id,
        amount: 8000,
        description: "Professional DJ with sound system",
      },
    }),
    prisma.otherService.create({
      data: {
        name: "Photo & Video Coverage",
        categoryId: serviceCategories[1].id,
        amount: 25000,
        description: "Full day coverage with edited video",
      },
    }),
    prisma.otherService.create({
      data: {
        name: "Photography Only",
        categoryId: serviceCategories[1].id,
        amount: 12000,
        description: "Photo coverage with edited photos",
      },
    }),
  ]);
  console.log(`✅ Created ${otherServices.length} other services\n`);

  // ========== DISCOUNTS ==========
  console.log("💰 Seeding Discounts...");
  const discounts = await Promise.all([
    prisma.discount.create({
      data: {
        name: "Senior Citizen/PWD",
        percent: 20,
        isActive: true,
        description: "20% discount for senior citizens and PWD",
      },
    }),
    prisma.discount.create({
      data: {
        name: "Early Bird Special",
        percent: 10,
        isActive: true,
        description: "10% discount for bookings made 6 months in advance",
      },
    }),
    prisma.discount.create({
      data: {
        name: "Corporate Package",
        amount: 5000,
        isActive: true,
        description: "₱5,000 discount for corporate events",
      },
    }),
  ]);
  console.log(`✅ Created ${discounts.length} discounts\n`);

  // ========== MODE OF PAYMENT ==========
  console.log("💳 Seeding Mode of Payment...");
  const modesOfPayment = await Promise.all([
    prisma.modeOfPayment.upsert({
      where: { name: "Cash" },
      update: {},
      create: { name: "Cash" },
    }),
    prisma.modeOfPayment.upsert({
      where: { name: "Bank Transfer" },
      update: {},
      create: { name: "Bank Transfer" },
    }),
    prisma.modeOfPayment.upsert({
      where: { name: "GCash" },
      update: {},
      create: { name: "GCash" },
    }),
    prisma.modeOfPayment.upsert({
      where: { name: "Credit Card" },
      update: {},
      create: { name: "Credit Card" },
    }),
  ]);
  console.log(`✅ Created ${modesOfPayment.length} modes of payment\n`);

  // ========== SCANNED DOCUMENT CATEGORIES ==========
  console.log("📄 Seeding Document Categories...");
  const docCategories = await Promise.all([
    prisma.scannedDocumentCategory.upsert({
      where: { name: "Contract" },
      update: {},
      create: { name: "Contract" },
    }),
    prisma.scannedDocumentCategory.upsert({
      where: { name: "Receipt" },
      update: {},
      create: { name: "Receipt" },
    }),
    prisma.scannedDocumentCategory.upsert({
      where: { name: "ID Document" },
      update: {},
      create: { name: "ID Document" },
    }),
  ]);
  console.log(`✅ Created ${docCategories.length} document categories\n`);

  // ========== SUMMARY ==========
  console.log("\n📊 Database Seeding Summary:");
  console.log("============================");
  console.log(`👤 Roles: ${roles.length}`);
  console.log(`👔 Employees: ${employees.length}`);
  console.log(`👥 Clients: ${clients.length}`);
  console.log(`🏛️ Pavilions: ${pavilions.length}`);
  console.log(`🎉 Event Types: ${eventTypes.length}`);
  console.log(`📦 Venue Packages: ${packages.length}`);
  console.log(`🍽️ Dish Categories: ${dishCategories.length}`);
  console.log(`🥘 Dishes: ${dishes.length}`);
  console.log(`📋 Menu Packages: ${menuPackages.length}`);
  console.log(`📦 Inventory Categories: ${invCategories.length}`);
  console.log(`📋 Inventory Items: ${inventoryItems.length}`);
  console.log(`🛏️ Rooms: ${rooms.length}`);
  console.log(`🎵 Service Categories: ${serviceCategories.length}`);
  console.log(`💼 Other Services: ${otherServices.length}`);
  console.log(`💰 Discounts: ${discounts.length}`);
  console.log(`💳 Payment Modes: ${modesOfPayment.length}`);
  console.log(`📄 Document Categories: ${docCategories.length}`);

  console.log("\n🎉 Comprehensive database seeding completed successfully!");
  console.log("\n📌 Default Login Credentials:");
  console.log("   Email: admin-001");
  console.log("   Password: password");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
