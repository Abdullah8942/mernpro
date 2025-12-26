const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config({ path: __dirname + '/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/meraab-emaan';

const adminData = {
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@meraab-emaan.test',
  password: 'Admin123!@#',
  role: 'admin'
};

async function connectDB() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

async function seedAdmin() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: adminData.email });
    if (existing) {
      console.log('Admin user already exists:', adminData.email);
      process.exit(0);
    }

    const user = new User(adminData);
    await user.save();
    console.log('Admin user created:');
    console.log('  email:', adminData.email);
    console.log('  password:', adminData.password);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err.message);
    process.exit(1);
  }
}

seedAdmin();
