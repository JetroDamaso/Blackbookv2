import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

async function deleteAllEmployees() {
  try {
    console.log("🗑️  Starting to delete all Employee records...");

    // First, delete related records that reference Employee
    console.log("📋 Step 1: Deleting related HistoryLog records...");
    const deletedHistoryLogs = await prisma.historyLog.deleteMany({
      where: {
        employeeId: {
          not: null
        }
      }
    });
    console.log(`✅ Deleted ${deletedHistoryLogs.count} HistoryLog records`);

    // Now delete all Employee records
    console.log("👥 Step 2: Deleting all Employee records...");
    const deletedEmployees = await prisma.employee.deleteMany({});
    console.log(`✅ Deleted ${deletedEmployees.count} Employee records`);

    console.log("🎉 All Employee records have been successfully deleted!");

  } catch (error) {
    console.error("❌ Error deleting Employee records:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
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
