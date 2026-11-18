const mongoose = require('mongoose');
const config = require('config');

const connectDB = async () => {
  const db = config.get('mongoURI');
  if (!db) {
    console.error('MONGO_URI is not set. Add it to your environment variables.');
    process.exit(1);
  }
  if (!config.get('jwtSecret')) {
    console.error('JWT_SECRET is not set. Add it to your environment variables.');
    process.exit(1);
  }
  try {
    await mongoose.connect(db);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
