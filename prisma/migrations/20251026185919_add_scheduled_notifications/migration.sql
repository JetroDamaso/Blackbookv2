-- CreateTable
CREATE TABLE "ScheduledNotification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" INTEGER NOT NULL,
    "notificationType" TEXT NOT NULL,
    "scheduledFor" DATETIME NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScheduledNotification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ScheduledNotification_bookingId_idx" ON "ScheduledNotification"("bookingId");

-- CreateIndex
CREATE INDEX "ScheduledNotification_scheduledFor_sent_idx" ON "ScheduledNotification"("scheduledFor", "sent");
