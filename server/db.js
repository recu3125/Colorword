const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// 상위 폴더에 백업
const backupPath = path.join(__dirname, '../auto_backup', 
  new Date().toISOString().replace(/[:.]/g, '-'));
fs.mkdirSync(backupPath, { recursive: true });
exec(`mongodump --db=colorword --out="${backupPath}"`, 
  (err) => err && console.error('백업 실패:', err));

const mongoose = require('mongoose');
mongoose.connect(`mongodb://127.0.0.1:27017/colorword`, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected successfully to MongoDB server');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB server:', err);
  });

const colorwordSchema = new mongoose.Schema({
  word: {
    type: String,
    unique: true
  },
  meaning: String,
  colors: [{
    r: Number,
    g: Number,
    b: Number,
    time: String
  }]
});

const colorwordModel = mongoose.model('colorword', colorwordSchema);

//data init
const wordData = require('../resources/wordData.json');
const words = wordData.words;
const meanings = wordData.meanings;

const promises = [];

let added = []
for (let i = 0; i < words.length; i++) {
  promises.push(
    colorwordModel.findOne({ word: words[i] })
      .then((existingColorword) => {
        if (!existingColorword) {
          added.push(words[i])
          const colorword = new colorwordModel({
            word: words[i],
            meaning: meanings[i],
            color: []
          });
          return colorword.save();
        }
      })
      .catch((error) => {
        console.error('Error while checking document:', error);
      })
  );
}

Promise.all(promises)
  .then(() => {
    if (added.length >= 1) {
      console.log(`Words:${added} added or updated successfully.`);
    }
    else {
      console.log('Collection is complete. Skipping addition.');
    }
    colorwordModel.find({}, 'word')
      .then((dbWords) => {
        const extraDocuments = dbWords.filter(colorword => !words.includes(colorword.word));
        if (extraDocuments.length >= 1) {
          console.log(`Db has ${extraDocuments.length} extra documents : ${extraDocuments.map(x => x.word)}`);

          // Delete extra documents from the collection
          const extraDocumentIds = extraDocuments.map(doc => doc._id);
          colorwordModel.deleteMany({ _id: { $in: extraDocumentIds } })
            .then(() => {
              console.log(`Deleted ${extraDocuments.length} extra documents.`);
            })
        }
      })
  })
  .then(() => cleanInvalidColors())
  .then(() => {
    console.log('Database cleanup completed successfully');
  })
  .catch((error) => {
    console.error('Failed during cleanup process:', error);
  });

// 유효하지 않은 색상 데이터 정리 함수
async function cleanInvalidColors() {
  try {
    const allDocs = await colorwordModel.find().exec();
    let totalCleaned = 0;

    const bulkOps = [];
    for (const doc of allDocs) {
      const validColors = doc.colors.filter(color => 
        Number.isInteger(color.r) && color.r >= 0 && color.r <= 255 &&
        Number.isInteger(color.g) && color.g >= 0 && color.g <= 255 &&
        Number.isInteger(color.b) && color.b >= 0 && color.b <= 255
      );

      if (validColors.length !== doc.colors.length) {
        bulkOps.push({
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: { colors: validColors } }
          }
        });
        totalCleaned += (doc.colors.length - validColors.length);
      }
    }

    if (bulkOps.length > 0) {
      await colorwordModel.bulkWrite(bulkOps);
      console.log(`Cleaned ${totalCleaned} invalid color entries from ${bulkOps.length} documents.`);
      return true;
    }
    console.log('No invalid color entries found.');
    return false;
  } catch (error) {
    console.error('Error during color cleanup:', error);
    throw error;
  }
}

function getCurrentDateTime() {
  // Create a new Date object
  const date = new Date();

  // Get the UTC time offset for the specified time zone (in minutes)
  const timeZoneOffset = new Date().getTimezoneOffset();

  // Apply the timezone offset to the current date
  const targetTime = new Date(date.getTime() - (timeZoneOffset * 60000));

  // Format the date and time as "yyyy-MM-dd-hh-mm-ss"
  const formattedDateTime = targetTime.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'UTC'
  });

  return formattedDateTime;
}


function addColor(word, r, g, b) {
  if (!Number.isInteger(r) || r < 0 || r > 255 ||
      !Number.isInteger(g) || g < 0 || g > 255 ||
      !Number.isInteger(b) || b < 0 || b > 255) {
    console.error('Invalid color values. r, g, and b must be integers between 0 and 255.');
    return;
  }
  colorwordModel.updateOne(
    { word: word },
    {
      $push: {
        colors: { r: r, g: g, b: b, time: getCurrentDateTime() }
      }
    }
  ).then(result => {
    if (result.nModified === 0)
      throw new Error('Word not found');
    else
      console.log('Word updated successfully');
  })
    .catch((error) => {
      console.error('Failed to update word:', error);
    });
}

async function getColors(word) {
  try {
    const wordfound = await colorwordModel.findOne({ word: word }).lean().exec();
    if (!wordfound) {
      throw new Error('Word not found');
    }
    const filteredColors = wordfound.colors.map(({ r, g, b }) => ({ r, g, b }));
    return filteredColors;
  }
  catch (error) {
    console.error('Failed to retrieve colors:', error);
    throw error;
  }
}

async function getWordsWithColorsCount() {
  try {
    const aggregationPipeline = [
      {
        $project: {
          word: 1,
          meaning: 1,
          colorCount: {
            $size: {
              $ifNull: ['$colors', []], // Use an empty array if colors is null or missing
            },
          },
        },
      },
    ];

    const result = await colorwordModel.aggregate(aggregationPipeline);
    console.log (result)
    return (result.map((wordInfo) => [wordInfo.word, wordInfo.meaning, wordInfo.colorCount]))
  } catch (err) {
    console.error(err);
    throw err;
  }
}

module.exports = {
  addColor,
  getColors,
  getWordsWithColorsCount
}