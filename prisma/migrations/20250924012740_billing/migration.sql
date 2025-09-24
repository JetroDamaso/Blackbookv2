/*
  Warnings:

  - You are about to drop the column `totalPackage` on the `Billing` table. All the data in the column will be lost.
  - Added the required column `discountPercentage` to the `Billing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountType` to the `Billing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountedPrice` to the `Billing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modeOfPayment` to the `Billing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalPrice` to the `Billing` table without a default value. This is not possible if the table is not empty.

*/
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
    "modeOfPaymentId" INTEGER,
    CONSTRAINT "Billing_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Billing_status_fkey" FOREIGN KEY ("status") REFERENCES "BillingStatus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Billing_modeOfPaymentId_fkey" FOREIGN KEY ("modeOfPaymentId") REFERENCES "ModeOfPayment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Billing" ("balance", "bookingId", "dateCompleted", "deposit", "id", "modeOfPaymentId", "status", "yve") SELECT "balance", "bookingId", "dateCompleted", "deposit", "id", "modeOfPaymentId", "status", "yve" FROM "Billing";
DROP TABLE "Billing";
ALTER TABLE "new_Billing" RENAME TO "Billing";
CREATE UNIQUE INDEX "Billing_bookingId_key" ON "Billing"("bookingId");
CREATE TABLE "new_Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "billingId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "name" TEXT,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" INTEGER NOT NULL,
    CONSTRAINT "Payment_billingId_fkey" FOREIGN KEY ("billingId") REFERENCES "Billing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payment_status_fkey" FOREIGN KEY ("status") REFERENCES "PaymentStatus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "billingId", "clientId", "date", "id", "name", "status") SELECT "amount", "billingId", "clientId", "date", "id", "name", "status" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
