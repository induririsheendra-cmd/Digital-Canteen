import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with Phase 2 items...');

  // 1. Users
  const studentPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('adminpassword123', 10);
  const userAdminPassword = await bcrypt.hash('password123', 10); // Default password for the specific user

  // Clear existing items to prevent duplicates and constraint errors
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.complaint.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.itemSubscription.deleteMany({});
  await prisma.mealTiming.deleteMany({});
  await prisma.menuItem.deleteMany({});

  // Clear existing users safely before reseeding to prevent email collisions
  await prisma.user.deleteMany({
    where: { email: { in: ['student1@university.edu', 'admin@university.edu', 'induririsheendra@gmail.com'] } }
  });

  const student = await prisma.user.create({
    data: {
      username: 'student1',
      email: 'student1@university.edu',
      password: studentPassword,
      role: 'USER',
      userType: 'STUDENT',
    },
  });

  const admin = await prisma.user.create({
    data: {
      username: 'admin1',
      email: 'admin@university.edu',
      password: adminPassword,
      role: 'ADMIN',
      userType: 'STUDENT',
    },
  });

  const userAdmin = await prisma.user.create({
    data: {
      username: 'induririsheendra-cmd',
      email: 'induririsheendra@gmail.com',
      password: userAdminPassword,
      role: 'ADMIN',
      userType: 'STUDENT',
    },
  });

  // 1.5 CMS Banner Settings
  await prisma.bannerSettings.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      title: 'Delicious Food, Delivered Fast.',
      description: 'Experience the best meals from our digital canteen right to your desk.',
      price: 149,
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070',
    }
  });

  // 1.7 Dynamic Plate Categories
  await prisma.plateCategory.deleteMany({});
  const plateCategories = [
    { name: 'RICE', label: '🍚 Rice', limit: 2 },
    { name: 'CURRY', label: '🍛 Curry', limit: 2 },
    { name: 'BREAD', label: '🫓 Bread', limit: 2 },
    { name: 'SWEET', label: '🍰 Sweet', limit: 1 },
    { name: 'BEVERAGE', label: '🥤 Beverage', limit: 1 },
    { name: 'EXTRA', label: '🍳 Extra', limit: 1 },
  ];
  for (const cat of plateCategories) {
    await prisma.plateCategory.create({ data: cat });
  }

  // 1.8 Phase 8 Meal Timings
  await prisma.mealTiming.deleteMany({});
  const timings = [
    { category: 'BREAKFAST', startTime: '08:00', endTime: '11:00' },
    { category: 'LUNCH', startTime: '12:00', endTime: '15:00' },
    { category: 'SNACKS', startTime: '15:30', endTime: '18:00' },
    { category: 'DINNER', startTime: '19:00', endTime: '22:00' },
  ];
  for (const timing of timings) {
    await prisma.mealTiming.create({ data: timing });
  }

  // 3. Menu Items
  const items = [
    // BREAKFAST
    { name: 'Masala Dosa', description: 'Crispy rice crepe with potato curry', price: 60, category: 'BREAKFAST', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&q=80' },
    { name: 'Idli Sambar', description: 'Steamed rice cakes with lentil soup', price: 40, category: 'BREAKFAST', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=600&q=80' },
    { name: 'Cheese Omelet', description: 'Fluffy omelet with melted cheese', price: 50, category: 'BREAKFAST', isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=600&q=80' },

    // LUNCH
    { name: 'Veg Thali', description: 'Complete vegetarian meal', price: 120, category: 'LUNCH', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&q=80' },
    { name: 'Chicken Biryani', description: 'Aromatic rice with spiced chicken', price: 180, category: 'LUNCH', isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80' },
    { name: 'Paneer Butter Masala & Naan', description: 'Rich paneer curry with 2 naans', price: 160, category: 'LUNCH', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?w=600&q=80' },

    // SNACKS
    { name: 'Samosa (2 pcs)', description: 'Crispy potato stuffed pastry', price: 30, category: 'SNACKS', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568a70550?w=600&q=80' },
    { name: 'Chicken Roll', description: 'Spicy chicken wrapped in paratha', price: 70, category: 'SNACKS', isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80' },
    { name: 'French Fries', description: 'Crispy golden fries', price: 50, category: 'SNACKS', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908582?w=600&q=80' },

    // DINNER
    { name: 'Chicken Fried Rice', description: 'Wok tossed rice with chicken', price: 140, category: 'DINNER', isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80' },
    { name: 'Dal Tadka & Jeera Rice', description: 'Comforting lentil curry with rice', price: 110, category: 'DINNER', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80' },

    // YOUR PLATE: RICE
    { name: 'Steamed Rice', description: 'Plain white rice', price: 40, category: 'RICE', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&q=80' },
    { name: 'Jeera Rice', description: 'Cumin flavored rice', price: 60, category: 'RICE', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80' },

    // YOUR PLATE: BREAD
    { name: 'Tandoori Roti', description: 'Whole wheat flatbread', price: 15, category: 'BREAD', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80' },
    { name: 'Butter Naan', description: 'Soft flatbread with butter', price: 30, category: 'BREAD', isVeg: true, imageUrl: 'https://plus.unsplash.com/premium_photo-1661600135893-61fc66a8581e?w=600&q=80' },
    { name: 'Chapati', description: 'Homestyle wheat flatbread', price: 10, category: 'BREAD', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1599818465646-c09a888cce6c?w=600&q=80' },

    // YOUR PLATE: CURRY
    { name: 'Chicken Curry', description: 'Spicy homestyle chicken', price: 120, category: 'CURRY', isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80' },
    { name: 'Paneer Masala', description: 'Cottage cheese in rich gravy', price: 110, category: 'CURRY', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?w=600&q=80' },
    { name: 'Mixed Veg Curry', description: 'Seasonal vegetables in gravy', price: 80, category: 'CURRY', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80' },
    { name: 'Kadhai Chicken', description: 'Spicy wok tossed chicken', price: 130, category: 'CURRY', isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80' },
    { name: 'Dal Makhani', description: 'Slow cooked black lentils', price: 90, category: 'CURRY', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80' },

    // YOUR PLATE: SWEET
    { name: 'Gulab Jamun (2 pcs)', description: 'Classic milk solid sweet', price: 40, category: 'SWEET', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=600&q=80' },
    { name: 'Rasmalai (2 pcs)', description: 'Cottage cheese in sweetened milk', price: 60, category: 'SWEET', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=600&q=80' },

    // YOUR PLATE: BEVERAGE
    { name: 'Cold Coffee', description: 'Chilled coffee with ice cream', price: 60, category: 'BEVERAGE', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80' },
    { name: 'Sweet Lassi', description: 'Traditional yogurt drink', price: 40, category: 'BEVERAGE', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1564149504298-00c351fd7f16?w=600&q=80' },

    // YOUR PLATE: EXTRA
    { name: 'Boiled Egg (2 pcs)', description: 'Hard boiled eggs', price: 20, category: 'EXTRA', isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1521513919009-be90ad555598?w=600&q=80' },
    { name: 'Masala Papad', description: 'Roasted papad with onions/tomatoes', price: 25, category: 'EXTRA', isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80' },
    { name: 'Plain Omelet', description: 'Simple seasoned omelet', price: 30, category: 'EXTRA', isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=600&q=80' },
  ];

  for (const item of items) {
    await prisma.menuItem.create({
      data: item,
    });
  }

  console.log(`Seeded ${items.length} Phase 2 menu items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
