const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Create sample data for testing metrics

  // First, create some required records

  // Create event types
  const birthdayEvent = await prisma.eventTypes.upsert({
    where: { name: "Birthday" },
    update: {},
    create: { name: "Birthday" },
  });

  const weddingEvent = await prisma.eventTypes.upsert({
    where: { name: "Wedding" },
    update: {},
    create: { name: "Wedding" },
  });

  const seminarEvent = await prisma.eventTypes.upsert({
    where: { name: "Seminar" },
    update: {},
    create: { name: "Seminar" },
  });

  // Create a sample pavilion
  const pavilion = await prisma.pavilion.upsert({
    where: { name: "Grand Pavilion" },
    update: {},
    create: {
      name: "Grand Pavilion",
      price: 25000,
      maxPax: 200,
      color: "#FF6B6B",
      description: "Our largest pavilion perfect for grand celebrations",
    },
  });

  // Create a sample client
  const client = await prisma.client.upsert({
    where: { email: "john.doe@example.com" },
    update: {},
    create: {
      firstName: "John",
      lastName: "Doe",
      region: "NCR",
      province: "Metro Manila",
      municipality: "Quezon City",
      barangay: "Barangay 1",
      phoneNumber: "09123456789",
      email: "john.doe@example.com",
    },
  });

  // Create sample bookings for different months
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const bookings = [
    // Current month bookings
    {
      eventName: "Sarah's 25th Birthday Party",
      clientId: client.id,
      pavilionId: pavilion.id,
      eventType: birthdayEvent.id,
      startAt: new Date(currentYear, currentMonth, 15, 14, 0),
      endAt: new Date(currentYear, currentMonth, 15, 22, 0),
      totalPax: 80,
      status: 1, // Active
      themeMotif: "Garden Party",
    },
    {
      eventName: "Wedding Reception - Mike & Lisa",
      clientId: client.id,
      pavilionId: pavilion.id,
      eventType: weddingEvent.id,
      startAt: new Date(currentYear, currentMonth, 20, 16, 0),
      endAt: new Date(currentYear, currentMonth, 20, 23, 0),
      totalPax: 150,
      status: 1, // Active
      themeMotif: "Rustic Elegance",
    },
    {
      eventName: "Corporate Training Seminar",
      clientId: client.id,
      pavilionId: pavilion.id,
      eventType: seminarEvent.id,
      startAt: new Date(currentYear, currentMonth, 25, 9, 0),
      endAt: new Date(currentYear, currentMonth, 25, 17, 0),
      totalPax: 60,
      status: 1, // Active
      themeMotif: "Professional",
    },
    // Last month bookings
    {
      eventName: "Golden Anniversary Celebration",
      clientId: client.id,
      pavilionId: pavilion.id,
      eventType: birthdayEvent.id,
      startAt: new Date(currentYear, currentMonth - 1, 10, 18, 0),
      endAt: new Date(currentYear, currentMonth - 1, 10, 23, 0),
      totalPax: 120,
      status: 2, // Completed
      themeMotif: "Golden Elegance",
    },
    {
      eventName: "Beach Wedding - Alex & Maria",
      clientId: client.id,
      pavilionId: pavilion.id,
      eventType: weddingEvent.id,
      startAt: new Date(currentYear, currentMonth - 1, 5, 15, 0),
      endAt: new Date(currentYear, currentMonth - 1, 5, 22, 0),
      totalPax: 180,
      status: 2, // Completed
      themeMotif: "Beach Paradise",
    },
  ];

  for (const bookingData of bookings) {
    const booking = await prisma.booking.create({
      data: bookingData,
    });

    // Create billing for each booking
    await prisma.billing.create({
      data: {
        bookingId: booking.id,
        originalPrice: Math.random() * 50000 + 15000, // Random price between 15k-65k
        discountedPrice: Math.random() * 45000 + 12000,
        discountType: "Percentage",
        discountPercentage: 0,
        balance: 0,
        modeOfPayment: "Cash",
        yve: 0,
        deposit: 5000,
        status: "Paid",
      },
    });
  }

  console.log("Database seeded successfully with sample data!");
  console.log(`Created ${bookings.length} bookings with billing records`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
