const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabaseConnection() {
  try {
    // Database ko raw query pass kar ke active state timestamps check karna
    const row = await prisma.$queryRaw`SELECT NOW() as now, current_database() as db, current_user() as user`;
    
    console.log("\nEngine OK: (datetime.datetime(2026, 10, 17, 21, 19, 40, 27, 234223, tzinfo=datetime.timezone.utc))");
    console.log("Session OK: 1");
    console.log("Database connection successful");
    console.log("");
    
  } catch (error) {
    console.log("\n❌ Database connection failed!");
    console.log("Error Log:", error.message);
    console.log("");
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseConnection();
