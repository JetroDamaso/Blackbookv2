"use server";
import "server-only";
import { prisma } from "../../db";

export async function seedDishCategories() {
  try {
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
    ];

    for (const category of categories) {
      await prisma.dishCategory.upsert({
        where: { id: category.id },
        update: { name: category.name },
        create: category,
      });
    }

    return { success: true, message: 'Dish categories seeded successfully', count: categories.length };
  } catch (error) {
    console.error("Failed to seed dish categories", error);
    throw new Error("Failed to seed dish categories");
  }
}

export async function seedSampleDishes() {
  try {
    // First ensure categories exist
    await seedDishCategories();

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
    ];

    // Check if dishes already exist to avoid duplicates
    const existingDishCount = await prisma.dish.count();

    if (existingDishCount === 0) {
      const createdDishes = await prisma.dish.createMany({
        data: dishes,
      });

      return {
        success: true,
        message: 'Sample dishes seeded successfully',
        count: createdDishes.count
      };
    } else {
      return {
        success: true,
        message: 'Dishes already exist in database',
        count: existingDishCount
      };
    }
  } catch (error) {
    console.error("Failed to seed sample dishes", error);
    throw new Error("Failed to seed sample dishes");
  }
}

export async function checkDatabaseStatus() {
  try {
    const dishCount = await prisma.dish.count();
    const categoryCount = await prisma.dishCategory.count();

    return {
      dishes: dishCount,
      categories: categoryCount,
      isEmpty: dishCount === 0 && categoryCount === 0,
    };
  } catch (error) {
    console.error("Failed to check database status", error);
    throw new Error("Failed to check database status");
  }
}
