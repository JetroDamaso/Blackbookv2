-- AlterTable
ALTER TABLE "OtherService" ADD COLUMN "packageId" INTEGER;

-- CreateTable
CREATE TABLE "Package" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "_OtherServiceToPackage" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_OtherServiceToPackage_A_fkey" FOREIGN KEY ("A") REFERENCES "OtherService" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_OtherServiceToPackage_B_fkey" FOREIGN KEY ("B") REFERENCES "Package" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Package_name_key" ON "Package"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_OtherServiceToPackage_AB_unique" ON "_OtherServiceToPackage"("A", "B");

-- CreateIndex
CREATE INDEX "_OtherServiceToPackage_B_index" ON "_OtherServiceToPackage"("B");
