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
            .catch((deleteError) => {
              console.error('Failed to delete extra documents:', deleteError);
            });
        }
      })
  })
  .catch((error) => {
    console.error('Failed to add or update documents:', error);
  });

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
        $match: {
          colors: { $exists: true, $ne: [] },
        },
      },
      {
        $project: {
          word: 1,
          meaning: 1,
          colorCount: { $size: '$colors' },
        },
      },
    ];

    const result = await colorwordModel.aggregate(aggregationPipeline);
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