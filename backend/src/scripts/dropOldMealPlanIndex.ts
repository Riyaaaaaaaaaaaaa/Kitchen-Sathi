// Script to drop old weekStartDate index from MealPlan collection
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function dropOldIndex() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aajkyabanega');
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('mealplans');

    // List all indexes
    console.log('\n📋 Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach((index: any) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    // Drop the old weekStartDate index if it exists
    try {
      console.log('\n🗑️  Attempting to drop old index: userId_1_weekStartDate_1');
      await collection.dropIndex('userId_1_weekStartDate_1');
      console.log('✅ Successfully dropped old index!');
    } catch (err: any) {
      if (err.code === 27 || err.message.includes('index not found')) {
        console.log('ℹ️  Index does not exist (already dropped or never created)');
      } else {
        throw err;
      }
    }

    // List indexes after dropping
    console.log('\n📋 Indexes after cleanup:');
    const indexesAfter = await collection.indexes();
    indexesAfter.forEach((index: any) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    console.log('\n✅ Migration complete!');
    console.log('🔄 Please restart your backend server.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

dropOldIndex();

