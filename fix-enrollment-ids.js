// Migration script to fix enrollment IDs from string to ObjectId
const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = 'mongodb+srv://viveksharmaa139_db_user:pLx9slULM9R2LVVj@cluster0.7cciarr.mongodb.net/';

async function fixEnrollmentIds() {
    const client = new MongoClient(MONGO_URI);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db();
        const enrollments = db.collection('enrollments');
        
        // Find all enrollments where studentId or courseId are strings
        const cursor = enrollments.find({});
        let fixed = 0;
        
        while (await cursor.hasNext()) {
            const enrollment = await cursor.next();
            const updates = {};
            
            // Check if studentId is a string
            if (typeof enrollment.studentId === 'string') {
                updates.studentId = new ObjectId(enrollment.studentId);
                console.log(`Converting studentId: ${enrollment.studentId} -> ObjectId`);
            }
            
            // Check if courseId is a string
            if (typeof enrollment.courseId === 'string') {
                updates.courseId = new ObjectId(enrollment.courseId);
                console.log(`Converting courseId: ${enrollment.courseId} -> ObjectId`);
            }
            
            // Update if needed
            if (Object.keys(updates).length > 0) {
                await enrollments.updateOne(
                    { _id: enrollment._id },
                    { $set: updates }
                );
                fixed++;
                console.log(`✅ Fixed enrollment ${enrollment._id}`);
            }
        }
        
        console.log(`\n🎉 Migration complete! Fixed ${fixed} enrollments.`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('👋 Disconnected from MongoDB');
    }
}

fixEnrollmentIds();
