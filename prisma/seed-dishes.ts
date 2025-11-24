import 'dotenv/config'
import { PrismaClient } from '../generated/prisma';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const db = new Database(process.env.DATABASE_URL?.replace('file:', '') || './prisma/dev.db');
const adapter = new PrismaBetterSqlite3(db);
const prisma = new PrismaClient({ adapter })

async function seedDishes() {
  console.log('🌱 Seeding dish categories and dishes...')

  // Create dish categories
  const categories = [
    { id: 1, name: 'Main Courses' },
    { id: 2, name: 'Appetizers' },
    { id: 3, name: 'Poultry' },
    { id: 4, name: 'Seafood' },
    { id: 5, name: 'Vegetarian' },
    { id: 6, name: 'Soups' },
    { id: 7, name: 'Desserts' },
    { id: 8, name: 'Beverages' },
    { id: 9, name: 'Others' },
  ]

  // Upsert categories (create or update if exists)
  for (const category of categories) {
    await prisma.dishCategory.upsert({
      where: { id: category.id },
      update: { name: category.name },
      create: category,
    })
  }

  console.log('✅ Created dish categories')

  // Sample dishes
  const dishes = [
    // Main Courses
    { name: 'Grilled Beef Steak', categoryId: 1, description: 'Tender grilled beef with herbs' },
    { name: 'Pork Adobo', categoryId: 1, description: 'Filipino classic pork adobo' },
    { name: 'Beef Caldereta', categoryId: 1, description: 'Rich beef stew with vegetables' },

    // Appetizers
    { name: 'Spring Rolls', categoryId: 2, description: 'Fresh vegetable spring rolls' },
    { name: 'Chicken Wings', categoryId: 2, description: 'Crispy buffalo chicken wings' },
    { name: 'Cheese Sticks', categoryId: 2, description: 'Golden fried mozzarella sticks' },

    // Poultry
    { name: 'Lechon Manok', categoryId: 3, description: 'Roasted whole chicken' },
    { name: 'Chicken Curry', categoryId: 3, description: 'Spicy coconut chicken curry' },
    { name: 'Chicken Teriyaki', categoryId: 3, description: 'Sweet and savory grilled chicken' },

    // Seafood
    { name: 'Grilled Tilapia', categoryId: 4, description: 'Fresh grilled tilapia with lemon' },
    { name: 'Sweet and Sour Fish', categoryId: 4, description: 'Crispy fish in sweet and sour sauce' },
    { name: 'Shrimp Tempura', categoryId: 4, description: 'Light and crispy battered shrimp' },

    // Vegetarian
    { name: 'Vegetable Lumpia', categoryId: 5, description: 'Fresh vegetable spring rolls' },
    { name: 'Pinakbet', categoryId: 5, description: 'Mixed vegetables in shrimp paste' },
    { name: 'Tofu Sisig', categoryId: 5, description: 'Sizzling tofu with onions and peppers' },

    // Soups
    { name: 'Chicken Tinola', categoryId: 6, description: 'Clear chicken soup with ginger' },
    { name: 'Sinigang na Baboy', categoryId: 6, description: 'Sour pork soup with tamarind' },
    { name: 'Mushroom Soup', categoryId: 6, description: 'Creamy mushroom soup' },

    // Desserts
    { name: 'Leche Flan', categoryId: 7, description: 'Classic Filipino custard dessert' },
    { name: 'Halo-Halo', categoryId: 7, description: 'Mixed shaved ice dessert' },
    { name: 'Chocolate Cake', categoryId: 7, description: 'Rich chocolate layer cake' },

    // Beverages
    { name: 'Fresh Buko Juice', categoryId: 8, description: 'Fresh coconut water' },
    { name: 'Iced Tea', categoryId: 8, description: 'Refreshing iced tea' },
    { name: 'Soft Drinks', categoryId: 8, description: 'Assorted soft drinks' },

    // Others
    { name: 'Garlic Rice', categoryId: 9, description: 'Fragrant garlic fried rice' },
    { name: 'Steamed Rice', categoryId: 9, description: 'Plain steamed jasmine rice' },
    { name: 'Mixed Salad', categoryId: 9, description: 'Fresh garden salad with dressing' },
  ]

  // Create dishes
  for (const dish of dishes) {
    await prisma.dish.create({
      data: dish,
    })
  }

  console.log('✅ Created sample dishes')
  console.log(`📊 Total categories: ${categories.length}`)
  console.log(`📊 Total dishes: ${dishes.length}`)
}

async function main() {
  try {
    await seedDishes()
    console.log('🎉 Dish seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding dishes:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
main().catch((error) => {
  console.error('❌ Seeding failed:', error)
  process.exit(1)
})
