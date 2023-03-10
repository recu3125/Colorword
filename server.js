const express = require("express");
const path = require("path");
const app = express();

const words = ['Be', 'Have', 'Do', 'Say', 'Go', 'Get', 'Make', 'Know', 'Take', 'See', 'Come', 'Think', 'Look', 'Want', 'Give', 'Use', 'Find', 'Tell', 'Ask', 'Work', 'Good', 'New', 'First', 'Last', 'Long', 'Great', 'Little', 'Own', 'Other', 'Old', 'Right', 'Big', 'High', 'Different', 'Small', 'Large', 'Next', 'Early', 'Young', 'Important', 'Up', 'So', 'Out', 'Just', 'Now', 'How', 'Then', 'More', 'Also', 'Here', 'Well', 'Only', 'Very', 'Even', 'Back', 'There', 'Still', 'Down', 'Too', 'Why', 'Beauty', 'Happiness', 'Knowledge', 'Love', 'Power', 'Success', 'Wisdom', 'Freedom', 'Justice', 'Courage', 'Truth', 'Equality', 'Kindness', 'Understanding', 'Creativity', 'Patience', 'Respect', 'Peace', 'Imagination']
const meanings = ['To exist', 'To possess', 'To perform an action', 'To express in words', 'To move', 'To obtain', 'To create', 'To be aware of', 'To get possession of', 'To perceive with the eyes', 'To move towards', 'To have an opinion', 'To use one’s eyes', 'To desire', 'To transfer possession', 'To employ', 'To discover', 'To make known', 'To put a question', 'To perform labor', 'Deserving of respect', 'Not existing before', 'Preceding all others', 'Coming after all others', 'Extending for a considerable distance', 'Remarkable', 'Small in size', 'Belonging to oneself', 'Not the same', 'Of long duration', 'Correct', 'Of considerable size', 'Of great vertical dimension', 'Dissimilar', 'Not large', 'Of considerable size', 'Immediately following', 'Occurring at or near the beginning', 'Not old', 'Of great consequence', 'From a lower to a higher position', 'In the manner expressed', 'From within to the outside', 'Exactly', 'At the present time', 'In what manner', 'At that time', 'To a greater degree', 'In addition', 'In this place', 'In a satisfactory manner', 'Solely', 'To a great extent', 'To a greater degree', 'In a backward direction', 'In that place', 'Without movement', 'From a higher to a lower position', 'Excessively', 'For what reason', 'A combination of qualities that pleases the senses', 'A state of contentment', 'The state of being aware of something', 'A strong feeling of affection', 'The ability to control or influence someone or something', 'The accomplishment of an aim or purpose', 'The ability to make sound judgments', 'The state of being able to act without restraint', 'The upholding of what is right and fair', 'The ability to confront fear or difficulty', 'The quality of being in accord with fact or reality', 'The state of being equal in rights, status, and opportunities', 'The quality of being friendly, generous, and considerate', 'Comprehension of a situation or subject', 'The ability to produce something original', 'The capacity to accept or tolerate delay', 'High regard for the worth or value of someone or something', 'A state of tranquility or serenity', 'The ability to form new ideas or concepts']

app.use(express.static('public'))

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public/home.html'));
});

app.get("/question", (req, res) => {
  res.sendFile(path.join(__dirname, 'public/question.html'));
});

app.get("/result", (req, res) => {
  res.sendFile(path.join(__dirname, 'public/result.html'));
});

app.listen(80, () => {
  console.log("Server is listening on port 80")
});