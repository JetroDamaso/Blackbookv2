-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ScannedDocument" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookingId" INTEGER,
    "clientId" INTEGER,
    "paymentId" INTEGER,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file" TEXT NOT NULL,
    CONSTRAINT "ScannedDocument_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ScannedDocumentCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ScannedDocument_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ScannedDocument_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ScannedDocument_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ScannedDocument" ("bookingId", "categoryId", "date", "file", "id", "name") SELECT "bookingId", "categoryId", "date", "file", "id", "name" FROM "ScannedDocument";
DROP TABLE "ScannedDocument";
ALTER TABLE "new_ScannedDocument" RENAME TO "ScannedDocument";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
