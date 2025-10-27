-- CreateTable
CREATE TABLE "MultiDayBooking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventName" TEXT NOT NULL,
    "clientId" INTEGER,
    "pavilionId" INTEGER,
    "eventType" INTEGER,
    "catering" INTEGER,
    "totalPax" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MultiDayBooking_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MultiDayBooking_pavilionId_fkey" FOREIGN KEY ("pavilionId") REFERENCES "Pavilion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MultiDayBooking_eventType_fkey" FOREIGN KEY ("eventType") REFERENCES "EventTypes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MultiDayBooking_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MultiDayBookingSchedule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "multiDayBookingId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    CONSTRAINT "MultiDayBookingSchedule_multiDayBookingId_fkey" FOREIGN KEY ("multiDayBookingId") REFERENCES "MultiDayBooking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MultiDayBookingFee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "multiDayBookingId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MultiDayBookingFee_multiDayBookingId_fkey" FOREIGN KEY ("multiDayBookingId") REFERENCES "MultiDayBooking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MultiDayBookingMenu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "multiDayBookingId" INTEGER NOT NULL,
    CONSTRAINT "MultiDayBookingMenu_multiDayBookingId_fkey" FOREIGN KEY ("multiDayBookingId") REFERENCES "MultiDayBooking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MultiDayBookingMenuDish" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "multiDayBookingMenuId" INTEGER NOT NULL,
    "dishId" INTEGER,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "MultiDayBookingMenuDish_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MultiDayBookingMenuDish_multiDayBookingMenuId_fkey" FOREIGN KEY ("multiDayBookingMenuId") REFERENCES "MultiDayBookingMenu" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MultiDayInventoryStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "inventoryId" INTEGER,
    "pavilionId" INTEGER,
    "multiDayBookingId" INTEGER,
    "quantity" INTEGER,
    CONSTRAINT "MultiDayInventoryStatus_multiDayBookingId_fkey" FOREIGN KEY ("multiDayBookingId") REFERENCES "MultiDayBooking" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MultiDayInventoryStatus_pavilionId_fkey" FOREIGN KEY ("pavilionId") REFERENCES "Pavilion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MultiDayInventoryStatus_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "InventoryItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MultiDayScannedDocument" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "multiDayBookingId" INTEGER,
    "clientId" INTEGER,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file" TEXT NOT NULL,
    CONSTRAINT "MultiDayScannedDocument_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ScannedDocumentCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MultiDayScannedDocument_multiDayBookingId_fkey" FOREIGN KEY ("multiDayBookingId") REFERENCES "MultiDayBooking" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MultiDayScannedDocument_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MultiDayDiscountRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "multiDayBookingId" INTEGER NOT NULL,
    "requestedById" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "discountValue" REAL NOT NULL,
    "discountUnit" TEXT NOT NULL,
    "justification" TEXT NOT NULL,
    "documents" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewNotes" TEXT,
    "originalAmount" REAL,
    "finalAmount" REAL,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" DATETIME,
    CONSTRAINT "MultiDayDiscountRequest_multiDayBookingId_fkey" FOREIGN KEY ("multiDayBookingId") REFERENCES "MultiDayBooking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MultiDayDiscountRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MultiDayDiscountRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MultiDayNotification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "multiDayBookingId" INTEGER,
    "clientId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MultiDayNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MultiDayNotification_multiDayBookingId_fkey" FOREIGN KEY ("multiDayBookingId") REFERENCES "MultiDayBooking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MultiDayNotification_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_MultiDayBookingToRooms" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_MultiDayBookingToRooms_A_fkey" FOREIGN KEY ("A") REFERENCES "MultiDayBooking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MultiDayBookingToRooms_B_fkey" FOREIGN KEY ("B") REFERENCES "Rooms" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MultiDayBookingSchedule_multiDayBookingId_idx" ON "MultiDayBookingSchedule"("multiDayBookingId");

-- CreateIndex
CREATE INDEX "MultiDayBookingSchedule_date_idx" ON "MultiDayBookingSchedule"("date");

-- CreateIndex
CREATE INDEX "MultiDayBookingFee_multiDayBookingId_idx" ON "MultiDayBookingFee"("multiDayBookingId");

-- CreateIndex
CREATE INDEX "MultiDayBookingMenu_multiDayBookingId_idx" ON "MultiDayBookingMenu"("multiDayBookingId");

-- CreateIndex
CREATE INDEX "MultiDayBookingMenuDish_multiDayBookingMenuId_idx" ON "MultiDayBookingMenuDish"("multiDayBookingMenuId");

-- CreateIndex
CREATE UNIQUE INDEX "MultiDayBookingMenuDish_multiDayBookingMenuId_dishId_key" ON "MultiDayBookingMenuDish"("multiDayBookingMenuId", "dishId");

-- CreateIndex
CREATE INDEX "MultiDayInventoryStatus_multiDayBookingId_idx" ON "MultiDayInventoryStatus"("multiDayBookingId");

-- CreateIndex
CREATE INDEX "MultiDayScannedDocument_multiDayBookingId_idx" ON "MultiDayScannedDocument"("multiDayBookingId");

-- CreateIndex
CREATE INDEX "MultiDayDiscountRequest_multiDayBookingId_idx" ON "MultiDayDiscountRequest"("multiDayBookingId");

-- CreateIndex
CREATE INDEX "MultiDayDiscountRequest_requestedById_idx" ON "MultiDayDiscountRequest"("requestedById");

-- CreateIndex
CREATE INDEX "MultiDayDiscountRequest_status_idx" ON "MultiDayDiscountRequest"("status");

-- CreateIndex
CREATE INDEX "MultiDayDiscountRequest_reviewedById_idx" ON "MultiDayDiscountRequest"("reviewedById");

-- CreateIndex
CREATE INDEX "MultiDayNotification_userId_idx" ON "MultiDayNotification"("userId");

-- CreateIndex
CREATE INDEX "MultiDayNotification_read_idx" ON "MultiDayNotification"("read");

-- CreateIndex
CREATE INDEX "MultiDayNotification_createdAt_idx" ON "MultiDayNotification"("createdAt");

-- CreateIndex
CREATE INDEX "MultiDayNotification_multiDayBookingId_idx" ON "MultiDayNotification"("multiDayBookingId");

-- CreateIndex
CREATE UNIQUE INDEX "_MultiDayBookingToRooms_AB_unique" ON "_MultiDayBookingToRooms"("A", "B");

-- CreateIndex
CREATE INDEX "_MultiDayBookingToRooms_B_index" ON "_MultiDayBookingToRooms"("B");
