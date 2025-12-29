const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import Category model
const Category = require('../models/Category');

const categories = [
  {
    name: 'Casual Wear',
    slug: 'casual',
    description: 'Comfortable and stylish everyday wear for modern women',
    image: 'https://images.unsplash.com/photo-1583391733956-6c78e0e68a24?w=800&h=1000&fit=crop',
    sortOrder: 1,
    isActive: true
  },
  {
    name: 'Party Wear',
    slug: 'party-wear',
    description: 'Glamorous outfits perfect for celebrations and special occasions',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=1000&fit=crop',
    sortOrder: 2,
    isActive: true
  },
  {
    name: 'Formal',
    slug: 'formal',
    description: 'Elegant and sophisticated attire for professional settings',
    image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&h=1000&fit=crop',
    sortOrder: 3,
    isActive: true
  },
  {
    name: 'Bridal',
    slug: 'bridal',
    description: 'Exquisite bridal collections for your special day',
    image: 'https://images.unsplash.com/photo-1519657337289-077653f724ed?w=800&h=1000&fit=crop',
    sortOrder: 4,
    isActive: true
  },
  {
    name: 'Festive',
    slug: 'festive',
    description: 'Traditional and contemporary festive wear for Eid and celebrations',
    image: 'https://images.unsplash.com/photo-1583391733975-c72195e1e98e?w=800&h=1000&fit=crop',
    sortOrder: 5,
    isActive: true
  },
  {
    name: 'New Arrivals',
    slug: 'new-arrivals',
    description: 'Latest additions to our collection',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1000&fit=crop',
    sortOrder: 6,
    isActive: true
  }
];

const seedCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Delete old categories (Men, Women, Kids, etc.)
    const deletedResult = await Category.deleteMany({
      slug: { $in: ['men', 'women', 'kids', 'mens', 'womens', 'children', 'boy', 'girl', 'boys', 'girls'] }
    });
    console.log(`Deleted ${deletedResult.deletedCount} old categories`);

    // Upsert new categories (update if exists, insert if not)
    for (const cat of categories) {
      await Category.findOneAndUpdate(
        { slug: cat.slug },
        cat,
        { upsert: true, new: true }
      );
      console.log(`✅ Category "${cat.name}" created/updated`);
    }

    console.log('\n🎉 Categories seeded successfully!');
    console.log('Categories now in database:');
    
    const allCategories = await Category.find({ isActive: true }).sort('sortOrder');
    allCategories.forEach((cat, i) => {
      console.log(`  ${i + 1}. ${cat.name} (${cat.slug})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
