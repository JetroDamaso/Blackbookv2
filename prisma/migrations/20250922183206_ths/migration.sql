/*
  Warnings:

  - Made the column `description` on table `Package` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "_BookingToRooms" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_BookingToRooms_A_fkey" FOREIGN KEY ("A") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BookingToRooms_B_fkey" FOREIGN KEY ("B") REFERENCES "Rooms" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Package" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "pavilionId" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "includePool" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Package_pavilionId_fkey" FOREIGN KEY ("pavilionId") REFERENCES "Pavilion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Package" ("description", "id", "name", "pavilionId", "price") SELECT "description", "id", "name", "pavilionId", "price" FROM "Package";
DROP TABLE "Package";
ALTER TABLE "new_Package" RENAME TO "Package";
CREATE UNIQUE INDEX "Package_name_key" ON "Package"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_BookingToRooms_AB_unique" ON "_BookingToRooms"("A", "B");

-- CreateIndex
CREATE INDEX "_BookingToRooms_B_index" ON "_BookingToRooms"("B");
