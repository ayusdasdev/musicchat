// Local MongoDB for development. Data persists in .dev/db-data.
const fs = require('fs');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

const dbPath = path.join(__dirname, 'db-data');
fs.mkdirSync(dbPath, { recursive: true });

(async () => {
  const mongo = await MongoMemoryServer.create({
    // dbPath on /mnt/c (WSL) makes startup slow (~40s), so allow 2 minutes
    instance: { port: 27017, dbPath, storageEngine: 'wiredTiger', launchTimeout: 120000 },
  });
  console.log('MongoDB ready at', mongo.getUri());

  const stop = async () => {
    await mongo.stop({ doCleanup: false });
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
})();
