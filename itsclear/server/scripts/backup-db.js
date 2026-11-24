const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/itsclear';

async function backupDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for backup...');

    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    const backupData = {};
    for (const coll of collections) {
      const data = await db.collection(coll.name).find({}).toArray();
      backupData[coll.name] = data;
      console.log(`Backed up collection "${coll.name}": ${data.length} records`);
    }

    const backupFile = path.join(backupDir, `itsclear-db-backup-${timestamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`✅ Full database backup saved to: ${backupFile}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Backup failed:', err.message);
    process.exit(1);
  }
}

backupDatabase();
