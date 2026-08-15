/**
 * Clean all test/garbage data and keep only what vivekk@gmail.com created recently
 * Run: node clean-test-data.js
 */
const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb+srv://viveksharmaa139_db_user:pLx9slULM9R2LVVj@cluster0.7cciarr.mongodb.net/';

async function main() {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('test');

    // Keep only the latest course created by vivekk (6a5b8dbef0f66c09b055942b = "dsdsfsdfs")
    const KEEP_COURSE_ID = '6a5b8dbef0f66c09b055942b';

    // Delete all other courses
    const delCourses = await db.collection('courses').deleteMany({
        _id: { $ne: new ObjectId(KEEP_COURSE_ID) }
    });
    console.log('Deleted courses:', delCourses.deletedCount);

    // Delete all sections except ones linked to kept course
    const delSections = await db.collection('sections').deleteMany({
        courseId: { $ne: KEEP_COURSE_ID }
    });
    console.log('Deleted sections:', delSections.deletedCount);

    // Delete all lessons
    const delLessons = await db.collection('lessons').deleteMany({});
    console.log('Deleted lessons:', delLessons.deletedCount);

    // Delete all enrollments with null courseId
    const delEnrollments = await db.collection('enrollments').deleteMany({
        courseId: null
    });
    console.log('Deleted null-course enrollments:', delEnrollments.deletedCount);

    // Verify what's left
    const courses = await db.collection('courses').find({}).toArray();
    const sections = await db.collection('sections').find({}).toArray();
    console.log('\n--- What remains ---');
    console.log('Courses:', courses.map(c => c.title));
    console.log('Sections:', sections.map(s => s.title));

    await client.close();
    console.log('\nDone!');
}

main().catch(console.error);
