/**
 * @fileoverview Seed Demo Data Script
 * @description Run this script to populate MongoDB with demo recruiter data
 * Usage: node seedDemoData.js
 */

import seedDatabase from './utils/seedData.js';

console.log('🌱 Starting Database Seeding...\n');

seedDatabase()
  .then(() => {
    console.log('\n✨ Seeding completed successfully!');
    console.log('\n💡 Tip: You can now login to the recruiter view to see all the demo students');
    console.log('   Navigate to: http://localhost:5173/recruiter (after login)\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  });
