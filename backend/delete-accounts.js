// Script to delete all accounts except specified ones
const mongoose = require('mongoose');

// Define User schema
const UserSchema = new mongoose.Schema({
  email: String,
  name: String,
  passwordHash: String,
  role: String,
  isEmailVerified: Boolean,
}, { strict: false, timestamps: true });

const User = mongoose.model('User', UserSchema);

async function deleteAccounts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/aajkyabanega');
    console.log('✅ Connected to MongoDB');

    // Emails to keep
    const keepEmails = ['chaya@gmail.com', 'riya123@gmail.com'];
    
    console.log('\n📊 Current accounts:');
    const allUsers = await User.find({}, { email: 1, name: 1, isEmailVerified: 1 });
    allUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.name}) - Verified: ${user.isEmailVerified}`);
    });
    console.log(`  Total: ${allUsers.length} accounts`);

    // Delete accounts NOT in the keep list
    console.log('\n🗑️  Deleting accounts except:', keepEmails.join(', '));
    const result = await User.deleteMany({ 
      email: { $nin: keepEmails } 
    });
    
    console.log(`✅ Deleted ${result.deletedCount} accounts`);

    // Show remaining accounts
    console.log('\n📊 Remaining accounts:');
    const remaining = await User.find({}, { email: 1, name: 1, isEmailVerified: 1 });
    if (remaining.length === 0) {
      console.log('  No accounts remaining');
    } else {
      remaining.forEach(user => {
        console.log(`  - ${user.email} (${user.name}) - Verified: ${user.isEmailVerified}`);
      });
      console.log(`  Total: ${remaining.length} accounts`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteAccounts();

