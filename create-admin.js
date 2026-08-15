/**
 * Run this script once to create the admin account:
 *   node create-admin.js
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const MONGODB_URI = 'mongodb+srv://viveksharmaa139_db_user:pLx9slULM9R2LVVj@cluster0.7cciarr.mongodb.net/';
const DB_NAME = 'lms'; // actual database name on Atlas

const ADMIN = {
    firstName: 'Super',
    lastName: 'Admin',
    email: 'admin@gmail.com',
    password: 'Admin@1234',   // change this after first login
    role: 'admin',
    isActive: true,
    status: 'active',
    totalCoursesEnrolled: 0,
    totalCoursesCompleted: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
};

async function main() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db(DB_NAME);
        const students = db.collection('students');

        // Check if admin already exists
        const existing = await students.findOne({ email: ADMIN.email });
        if (existing) {
            console.log(`⚠️  Admin already exists: ${ADMIN.email} (role: ${existing.role})`);
            console.log('   If you forgot the password, delete the record and run again.');
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(ADMIN.password, 10);

        await students.insertOne({ ...ADMIN, password: hashedPassword });

        console.log('');
        console.log('🎉 Admin account created successfully!');
        console.log('─────────────────────────────────────');
        console.log(`   Email    : ${ADMIN.email}`);
        console.log(`   Password : ${ADMIN.password}`);
        console.log('─────────────────────────────────────');
        console.log('   Login at : http://localhost:3000/login');
        console.log('');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.close();
    }
}

main();
