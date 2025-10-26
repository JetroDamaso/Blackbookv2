/**
 * Local notification processor script
 * Run this script daily to process pending scheduled notifications
 *
 * Usage:
 *   npm run process-notifications
 *   or
 *   npx tsx scripts/process-notifications.ts
 */

import { processPendingNotifications } from "../lib/notification-scheduler";

async function main() {
  console.log("=".repeat(50));
  console.log("📧 Processing Pending Notifications");
  console.log("=".repeat(50));
  console.log(`Started at: ${new Date().toLocaleString()}\n`);

  try {
    const result = await processPendingNotifications();

    console.log("\n✅ Success!");
    console.log(`Processed ${result.processed} notification(s)`);

    if (result.processed === 0) {
      console.log("ℹ️  No pending notifications at this time.");
    }
  } catch (error) {
    console.error("\n❌ Error processing notifications:");
    console.error(error);
    process.exit(1);
  }

  console.log(`\nCompleted at: ${new Date().toLocaleString()}`);
  console.log("=".repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
