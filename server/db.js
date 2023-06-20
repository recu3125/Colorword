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
    r: String,
    g: String,
    b: String
  }]
});

const colorwordModel = mongoose.model('colorword', colorwordSchema);

//data init
const words = ['Love', 'Harmony', 'Energy', 'Passion', 'Creativity', 'Confidence', 'Joy', 'Wisdom', 'Curiosity', 'Power', 'Balance', 'Growth', 'Happiness', 'Hope', 'Ambition', 'Peace', 'Vibrant', 'Bold', 'Calm', 'Brilliant', 'Illuminating', 'Enchanting', 'Soothing', 'Dynamic', 'Uplifting']
const meanings = ['Deep affection and care.', 'State of peaceful coexistence.', 'Capacity for work or action.', 'Strong and intense emotion.', 'Ability to produce original ideas.', 'Belief in oneself and abilities.', 'Intense feeling of happiness.', 'Deep knowledge and understanding.', 'Desire to learn or explore.', 'Ability to exert influence or control.', 'State of equilibrium or stability.', 'Process of development and increase.', 'State of being happy and content.', 'Optimistic expectation or desire.', 'Strong desire for achievement or success.', 'State of tranquility and harmony.', 'Full of energy and vitality.', 'Fearless and daring in action.', 'Peaceful and undisturbed.', 'Exceptionally bright or intelligent.', 'Providing light or insight.', 'Captivating or charming.', 'Calming and comforting.', 'Energetic and active.', 'Inspiring and elevating.']
colorwordModel.countDocuments({})
  .then((count) => {
    if (count === 0) {
      // The collection is empty, run initialization code
      for (let i = 0; i < words.length; i++) {
        const colorword = new colorwordModel({
          word: words[i],
          meaning: meanings[i],
          color: []
        });
        colorword.save()
          .then(() => {
            console.log('Document saved:', colorword);
          })
          .catch((error) => {
            console.error('Failed to save document:', error);
          });
      }
    } else {
      console.log('Collection is not empty. Skipping initialization.');
    }
  })
  .catch((error) => {
    console.error('Failed to check collection count:', error);
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

module.exports={
  addColor,
  getColors
}