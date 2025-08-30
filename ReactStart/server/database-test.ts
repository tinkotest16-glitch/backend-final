import { dbStorage } from "./db-storage";

// Test database connection
async function testDatabaseConnection() {
  try {
    console.log("Testing database connection...");
    
    // Test simple query
    const pairs = await dbStorage.getAllTradingPairs();
    console.log(`✅ Database connected successfully. Found ${pairs.length} trading pairs.`);
    
    // Test user query
    const users = await dbStorage.getAllUsers();
    console.log(`✅ Found ${users.length} users in database.`);
    
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// Switch to database storage if connection works
export async function initializeDatabaseStorage() {
  const connected = await testDatabaseConnection();
  if (connected) {
    console.log("Switching to database storage...");
    return dbStorage;
  }
  console.log("Keeping memory storage...");
  return null;
}

// Run test if called directly
testDatabaseConnection();