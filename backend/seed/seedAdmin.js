const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Workshop = require('../models/Workshop');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected for seeding...');

    // Clear existing data (optional, be careful in real use)
    await User.deleteMany();
    await Workshop.deleteMany();

    // Create Admin
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@workshop.com',
      password: 'admin123', // will be hashed automatically
      role: 'admin',
    });

    // Create sample Manager
    const manager = await User.create({
      name: 'John Manager',
      email: 'manager@workshop.com',
      password: 'manager123',
      role: 'manager',
    });

    // Create sample Staff
    const staff = await User.create({
      name: 'Jane Staff',
      email: 'staff@workshop.com',
      password: 'staff123',
      role: 'staff',
    });

    console.log('✅ Users created:', admin.email, manager.email, staff.email);

    // Create sample workshops
    await Workshop.create([
      {
        code: 'WS-001',
        title: 'Coding Basics',
        instructor: 'Mr. Silva',
        dateTime: new Date('2025-10-15T09:00:00'),
        capacity: 20,
        bookedSeats: 0,
        status: 'active',
        createdBy: manager._id,
      },
      {
        code: 'WS-002',
        title: 'Pottery Making',
        instructor: 'Ms. Fernando',
        dateTime: new Date('2025-10-17T10:00:00'),
        capacity: 20,
        bookedSeats: 0,
        status: 'active',
        createdBy: manager._id,
      },
      {
        code: 'WS-003',
        title: 'Fitness Training',
        instructor: 'Mr. Perera',
        dateTime: new Date('2025-10-20T08:00:00'),
        capacity: 15,
        bookedSeats: 0,
        status: 'active',
        createdBy: manager._id,
      },
    ]);

    console.log('✅ Sample workshops created');
    console.log('🎉 Seeding complete!');
    process.exit();
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();