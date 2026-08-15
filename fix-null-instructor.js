const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://viveksharmaa139_db_user:pLx9slULM9R2LVVj@cluster0.7cciarr.mongodb.net/';
async function main() {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('test');
    const inst = await db.collection('students').findOne({ email: 'vivekk@gmail.com' });
    console.log('Instructor:', inst._id.toString());
    const r = await db.collection('courses').updateMany(
        { instructorId: null },
        { $set: { instructorId: inst._id.toString() } }
    );
    console.log('Fixed courses with null instructorId:', r.modifiedCount);
    // Also publish the course so students can see it
    const r2 = await db.collection('courses').updateMany(
        { instructorId: inst._id.toString(), status: 'draft' },
        { $set: { status: 'published' } }
    );
    console.log('Published draft courses:', r2.modifiedCount);
    await client.close();
}
main().catch(console.error);
