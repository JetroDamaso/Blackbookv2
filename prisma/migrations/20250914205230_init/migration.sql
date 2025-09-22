-- CreateTable
CREATE TABLE "BookingTable" (
    "booking_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "event_name" TEXT NOT NULL,
    "client_id" INTEGER,
    "pavilion_id" INTEGER,
    "ref_pavillion_name" TEXT NOT NULL,
    "ref_pavillion_price" REAL NOT NULL,
    "ref_client_id" INTEGER NOT NULL,
    "ref_billing_id" INTEGER NOT NULL,
    "event_category" TEXT NOT NULL,
    "calendar_color" TEXT NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "time" DATETIME NOT NULL,
    "start_time" DATETIME NOT NULL,
    "end_time" DATETIME NOT NULL,
    "food_tasting_date" DATETIME NOT NULL,
    "total_pax" INTEGER NOT NULL,
    "theme_motif" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "notes" TEXT NOT NULL,
    CONSTRAINT "BookingTable_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "ClientTable" ("client_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "BookingTable_pavilion_id_fkey" FOREIGN KEY ("pavilion_id") REFERENCES "PavillionTable" ("pavillion_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClientTable" (
    "client_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "EmployeeTable" (
    "employee_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,
    "ref_role" TEXT NOT NULL,
    "date_of_employment" DATETIME NOT NULL,
    "status" INTEGER NOT NULL,
    CONSTRAINT "EmployeeTable_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "EmployeeRole" ("role_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmployeeRole" (
    "role_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PavillionTable" (
    "pavillion_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "max_pax" INTEGER NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AdditionalCharges" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "booking_id" INTEGER,
    "ad_charges_id" INTEGER,
    "ref_additional_name" TEXT,
    "name" TEXT,
    "amount" REAL,
    "ref_description" TEXT,
    "note" TEXT,
    CONSTRAINT "AdditionalCharges_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "BookingTable" ("booking_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AdditionalCharges_ad_charges_id_fkey" FOREIGN KEY ("ad_charges_id") REFERENCES "AdditionalCharges_MasterList" ("ad_charges_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OtherServices" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "booking_id" INTEGER,
    "ref_name" TEXT,
    "ref_amount" REAL,
    "ref_description" TEXT,
    CONSTRAINT "OtherServices_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "BookingTable" ("booking_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryStatusTable" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "inv_id" INTEGER,
    "pavillion_id" INTEGER,
    "booking_id" INTEGER,
    "quantity" INTEGER,
    "ref_pavilion" TEXT,
    "ref_name" TEXT,
    "ref_category" TEXT,
    "status" INTEGER,
    CONSTRAINT "InventoryStatusTable_inv_id_fkey" FOREIGN KEY ("inv_id") REFERENCES "Inventory_MasterList" ("inv_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InventoryStatusTable_pavillion_id_fkey" FOREIGN KEY ("pavillion_id") REFERENCES "PavillionTable" ("pavillion_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InventoryStatusTable_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "BookingTable" ("booking_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "booking_id" INTEGER,
    "ref_category" TEXT,
    "ref_dish_name" TEXT,
    "ref_allergens" TEXT,
    "ref_description" TEXT,
    CONSTRAINT "Menu_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "BookingTable" ("booking_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Billing" (
    "billing_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "booking_id" INTEGER,
    "total_package" REAL NOT NULL,
    "mode_of_payment" TEXT NOT NULL,
    "balance" REAL NOT NULL,
    "YVE" REAL NOT NULL,
    "deposit" REAL NOT NULL,
    "status" INTEGER NOT NULL,
    "date_completed" DATETIME NOT NULL,
    CONSTRAINT "Billing_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "BookingTable" ("booking_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HistoryLogs" (
    "log_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "booking_id" INTEGER NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HistoryLogs_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "BookingTable" ("booking_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HistoryLogs_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "EmployeeTable" ("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdditionalCharges_MasterList" (
    "ad_charges_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "OtherServices_MasterList" (
    "other_services_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "other_services_category_id" INTEGER NOT NULL DEFAULT 0,
    "ref_category_name" TEXT NOT NULL DEFAULT 'Uncategorized',
    "amount" REAL NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "OtherServices_MasterList_other_services_category_id_fkey" FOREIGN KEY ("other_services_category_id") REFERENCES "OtherServices_Category" ("other_services_category_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OtherServices_Category" (
    "other_services_category_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Inventory_MasterList" (
    "inv_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "inv_category_id" INTEGER NOT NULL DEFAULT 0,
    "ref_category" TEXT NOT NULL DEFAULT 'Uncategorized',
    "quantity" INTEGER NOT NULL,
    "out" INTEGER NOT NULL,
    CONSTRAINT "Inventory_MasterList_inv_category_id_fkey" FOREIGN KEY ("inv_category_id") REFERENCES "Inventory_MasterList_Category" ("inv_category_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Inventory_MasterList_Category" (
    "inv_category_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Dishes" (
    "dish_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "dish_category_id" INTEGER NOT NULL DEFAULT 0,
    "ref_category" TEXT NOT NULL DEFAULT 'Uncategorized',
    "allergens" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "Dishes_dish_category_id_fkey" FOREIGN KEY ("dish_category_id") REFERENCES "DishCategory" ("dish_category_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DishCategory" (
    "dish_category_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Payments" (
    "payment_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "billing_id" INTEGER NOT NULL,
    "payment_name" TEXT NOT NULL,
    "client_id" INTEGER NOT NULL,
    "payment_amount" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" INTEGER NOT NULL,
    CONSTRAINT "Payments_billing_id_fkey" FOREIGN KEY ("billing_id") REFERENCES "Billing" ("billing_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "ClientTable" ("client_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScannedDocument" (
    "document_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "booking_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "sc_id" INTEGER NOT NULL DEFAULT 0,
    "ref_category" TEXT NOT NULL DEFAULT 'Uncategorized',
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file" TEXT NOT NULL,
    CONSTRAINT "ScannedDocument_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "BookingTable" ("booking_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ScannedDocument_sc_id_fkey" FOREIGN KEY ("sc_id") REFERENCES "ScannedDocumentCategory" ("sc_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScannedDocumentCategory" (
    "sc_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ModeOfPayments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Discounts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "percent" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "_OtherServicesToOtherServices_MasterList" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_OtherServicesToOtherServices_MasterList_A_fkey" FOREIGN KEY ("A") REFERENCES "OtherServices" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_OtherServicesToOtherServices_MasterList_B_fkey" FOREIGN KEY ("B") REFERENCES "OtherServices_MasterList" ("other_services_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_DishesToMenu" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_DishesToMenu_A_fkey" FOREIGN KEY ("A") REFERENCES "Dishes" ("dish_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DishesToMenu_B_fkey" FOREIGN KEY ("B") REFERENCES "Menu" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PavillionTable_pavillion_id_name_price_key" ON "PavillionTable"("pavillion_id", "name", "price");

-- CreateIndex
CREATE UNIQUE INDEX "PavillionTable_pavillion_id_name_key" ON "PavillionTable"("pavillion_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Billing_booking_id_key" ON "Billing"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "_OtherServicesToOtherServices_MasterList_AB_unique" ON "_OtherServicesToOtherServices_MasterList"("A", "B");

-- CreateIndex
CREATE INDEX "_OtherServicesToOtherServices_MasterList_B_index" ON "_OtherServicesToOtherServices_MasterList"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DishesToMenu_AB_unique" ON "_DishesToMenu"("A", "B");

-- CreateIndex
CREATE INDEX "_DishesToMenu_B_index" ON "_DishesToMenu"("B");
