import 'dotenv/config'
import { PrismaClient } from "@/generated/prisma";
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import * as readline from "readline";

const db = new Database(process.env.DATABASE_URL?.replace('file:', '') || './prisma/dev.db');
const adapter = new PrismaBetterSqlite3(db);
const prisma = new PrismaClient({ adapter });

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function deleteAllEmployees() {
  try {
    // Show current count
    const currentCount = await prisma.employee.count();
    console.log(`📊 Current Employee records: ${currentCount}`);

    if (currentCount === 0) {
      console.log("ℹ️  No Employee records to delete.");
      rl.close();
      return;
    }

    // Show related records that will be affected
    const historyLogsCount = await prisma.historyLog.count({
      where: {
        employeeId: {
          not: null
        }
      }
    });

    console.log(`⚠️  Warning: This will also delete ${historyLogsCount} related HistoryLog records`);
    console.log("🚨 This action CANNOT be undone!");

    // First confirmation
    const confirmation1 = await askQuestion("\n❓ Are you sure you want to delete ALL Employee records? (yes/no): ");

    if (confirmation1.toLowerCase() !== 'yes') {
      console.log("❌ Operation cancelled.");
      rl.close();
      return;
    }

    // Second confirmation
    const confirmation2 = await askQuestion("❓ Type 'DELETE ALL EMPLOYEES' to confirm: ");

    if (confirmation2 !== 'DELETE ALL EMPLOYEES') {
      console.log("❌ Confirmation text doesn't match. Operation cancelled.");
      rl.close();
      return;
    }

    console.log("\n🗑️  Starting deletion process...");

    // Delete related records first
    console.log("📋 Step 1: Deleting related HistoryLog records...");
    const deletedHistoryLogs = await prisma.historyLog.deleteMany({
      where: {
        employeeId: {
          not: null
        }
      }
    });
    console.log(`✅ Deleted ${deletedHistoryLogs.count} HistoryLog records`);

    // Delete all Employee records
    console.log("👥 Step 2: Deleting all Employee records...");
    const deletedEmployees = await prisma.employee.deleteMany({});
    console.log(`✅ Deleted ${deletedEmployees.count} Employee records`);

    console.log("🎉 All Employee records have been successfully deleted!");

  } catch (error) {
    console.error("❌ Error deleting Employee records:", error);
    throw error;
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  console.log("🚨 DANGER ZONE: Employee Record Deletion Tool 🚨");
  console.log("=" .repeat(50));

  deleteAllEmployees()
    .then(() => {
      console.log("✨ Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Script failed:", error);
      process.exit(1);
    });
}

export default deleteAllEmployees;
