// Migration script to add token fields to existing users
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function migrateUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Get the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");

    // Update all users that don't have the tokens field
    const result = await usersCollection.updateMany(
      { tokens: { $exists: false } },
      { 
        $set: { 
          tokens: 10,
          tokensUsed: 0 
        } 
      }
    );

    console.log(`✅ Migration complete!`);
    console.log(`   - Modified ${result.modifiedCount} users`);
    console.log(`   - Matched ${result.matchedCount} users`);

    // Show sample user to verify
    const sampleUser = await usersCollection.findOne({});
    if (sampleUser) {
      console.log("\nSample user after migration:");
      console.log({
        email: sampleUser.email,
        plan: sampleUser.plan,
        tokens: sampleUser.tokens,
        tokensUsed: sampleUser.tokensUsed
      });
    }

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateUsers();
