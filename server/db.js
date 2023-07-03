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
    b: Number
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
        }
      })
  })
  .catch((error) => {
    console.error('Failed to add or update documents:', error);
  });

function addColor(word, r, g, b) {
  colorwordModel.findOne({ word: word })
    .then((word) => {
      if (!word) {
        throw new Error('Word not found');
      }

      word.colors.push({ r: r, g: g, b: b });

      return word.save();
    })
    .then(() => {
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
    return wordfound.colors;
  }
  catch (error) {
    console.error('Failed to retrieve colors:', error);
    throw error;
  }
}

module.exports = {
  addColor,
  getColors
}