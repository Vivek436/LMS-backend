/**
 * Fix orphaned courses (instructorId points to old instructors collection)
 * Reassigns them to the vivekk@gmail.com instructor account
 *
 * Run: node fix-orphan-courses.js
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://viveksharmaa139_db_user:pLx9slULM9R2LVVj@cluster0.7cciarr.mongodb.net/';
const DB_NAME = 'test';

async function main() {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected\n');

    const db = client.db(DB_NAME);

    // Get all valid instructor IDs in students collection
    const validInstructors = await db.collection('students').find({ role: 'instructor' }).toArray();
    const validIds = new Set(validInstructors.map(i => i._id.toString()));

    console.log('Valid instructor IDs:', [...validIds]);

    // Find all courses
    const allCourses = await db.collection('courses').find({}).toArray();

    // Find orphaned courses (instructorId not in valid set)
    const orphaned = allCourses.filter(c => !validIds.has(c.instructorId?.toString()));
    console.log(`\nOrphaned courses (invalid instructorId): ${orphaned.length}`);
    orphaned.forEach(c => console.log(`  - "${c.title}" → instructorId: ${c.instructorId}`));

    if (orphaned.length === 0) {
        console.log('Nothing to fix!');
        await client.close();
        return;
    }

    // Find vivekk@gmail.com instructor
    const vivekk = validInstructors.find(i => i.email === 'vivekk@gmail.com');
    if (!vivekk) {
        console.log('\n❌ vivekk@gmail.com not found. Available instructors:');
        validInstructors.forEach(i => console.log(`  - ${i.email}`));
        await client.close();
        return;
    }

    const newInstructorId = vivekk._id.toString();
    console.log(`\nReassigning to: ${vivekk.email} (${newInstructorId})`);

    // Reassign orphaned courses
    const orphanedIds = orphaned.map(c => c._id);
    const result = await db.collection('courses').updateMany(
        { _id: { $in: orphanedIds } },
        { $set: { instructorId: newInstructorId } }
    );

    console.log(`✅ Updated ${result.modifiedCount} courses`);

    // Verify
    console.log('\n--- Final count per instructor ---');
    for (const inst of validInstructors) {
        const count = await db.collection('courses').countDocuments({ instructorId: inst._id.toString() });
        console.log(`  ${inst.email} → ${count} course(s)`);
    }

    await client.close();
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
