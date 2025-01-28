import mongoose from 'mongoose';

const connectDB = async () => {
  mongoose.connection.on('connected', () => console.log(`MongoDB Connected: ${mongoose.connection.host}`));
  
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
};


export default connectDB;
