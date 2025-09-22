-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OtherService" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "amount" REAL,
    "description" TEXT,
    CONSTRAINT "OtherService_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "OtherServiceCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_OtherService" ("amount", "categoryId", "description", "id", "name") SELECT "amount", "categoryId", "description", "id", "name" FROM "OtherService";
DROP TABLE "OtherService";
ALTER TABLE "new_OtherService" RENAME TO "OtherService";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
