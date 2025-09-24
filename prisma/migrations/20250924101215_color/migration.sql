/*
  Warnings:

  - You are about to drop the column `modeOfPaymentId` on the `Billing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Pavilion" ADD COLUMN "color" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Billing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookingId" INTEGER NOT NULL,
    "originalPrice" REAL NOT NULL,
    "discountedPrice" REAL NOT NULL,
    "discountType" TEXT NOT NULL,
    "discountPercentage" REAL NOT NULL,
    "balance" REAL NOT NULL,
    "modeOfPayment" TEXT NOT NULL,
    "yve" REAL NOT NULL DEFAULT 0,
    "deposit" REAL NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL,
    "dateCompleted" DATETIME,
    CONSTRAINT "Billing_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Billing_status_fkey" FOREIGN KEY ("status") REFERENCES "BillingStatus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Billing" ("balance", "bookingId", "dateCompleted", "deposit", "discountPercentage", "discountType", "discountedPrice", "id", "modeOfPayment", "originalPrice", "status", "yve") SELECT "balance", "bookingId", "dateCompleted", "deposit", "discountPercentage", "discountType", "discountedPrice", "id", "modeOfPayment", "originalPrice", "status", "yve" FROM "Billing";
DROP TABLE "Billing";
ALTER TABLE "new_Billing" RENAME TO "Billing";
CREATE UNIQUE INDEX "Billing_bookingId_key" ON "Billing"("bookingId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
