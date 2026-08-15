/**
 * Migration: Update course instructorId from old 'instructors' collection ID
 * to new 'students' collection ID (matching by email)
 *
 * Run: node migrate-instructors.js
 */

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://viveksharmaa139_db_user:pLx9slULM9R2LVVj@cluster0.7cciarr.mongodb.net/';
const DB_NAME = 'test';

async function main() {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db(DB_NAME);

    // Step 1: Get all entries from old 'instructors' collection
    const oldInstructors = await db.collection('instructors').find({}).toArray();
    console.log(`Found ${oldInstructors.length} old instructor(s) in instructors collection`);

    // Step 2: For each old instructor, find their matching entry in 'students' collection by email
    let totalUpdated = 0;

    for (const oldInst of oldInstructors) {
        const newUser = await db.collection('students').findOne({
            email: oldInst.email,
            role: 'instructor'
        });

        if (!newUser) {
            console.log(`  ⚠️  No matching student account for: ${oldInst.email} — skipping`);
            continue;
        }

        const oldId = oldInst._id.toString();
        const newId = newUser._id.toString();

        if (oldId === newId) {
            console.log(`  ✓  ${oldInst.email} — IDs already match, no update needed`);
            continue;
        }

        // Update all courses that reference the old ID
        const courseResult = await db.collection('courses').updateMany(
            { instructorId: oldId },
            { $set: { instructorId: newId } }
        );

        // Update all sections that might store instructorId directly
        const sectionResult = await db.collection('sections').updateMany(
            { instructorId: oldId },
            { $set: { instructorId: newId } }
        );

        totalUpdated += courseResult.modifiedCount;

        console.log(`  ✅ ${oldInst.email}`);
        console.log(`     Old ID: ${oldId}`);
        console.log(`     New ID: ${newId}`);
        console.log(`     Courses updated: ${courseResult.modifiedCount}`);
        console.log(`     Sections updated: ${sectionResult.modifiedCount}`);
    }

    console.log(`\n🎉 Migration complete! Total courses updated: ${totalUpdated}`);

    // Step 3: Verify
    console.log('\n--- Verification ---');
    const allInstructors = await db.collection('students').find({ role: 'instructor' }).toArray();
    for (const inst of allInstructors) {
        const count = await db.collection('courses').countDocuments({ instructorId: inst._id.toString() });
        console.log(`  ${inst.email} (${inst._id}) → ${count} course(s)`);
    }

    await client.close();
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
