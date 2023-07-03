const localStorage = window.localStorage;
const container = document.getElementById('container');
let allAnswered = true
fetch('/resources/wordData.json')
  .then(async (wordData) => {
    wordData = await wordData.json();

    for (let i = 0; i < wordData.words.length; i++) {
      if (localStorage.getItem(wordData.words[i]) !== null) {
        const item = JSON.parse(localStorage.getItem(wordData.words[i]));
        const wordbtn = document.createElement("button");
        wordbtn.textContent = wordData.words[i];

        (function (index) {
          wordbtn.onclick = function () {
            var url = '/result' +
              '?word=' + encodeURIComponent(wordData.words[index]) +
              '&meaning=' + encodeURIComponent(wordData.meanings[index]) +
              '&r=' + encodeURIComponent(item[0]) +
              '&g=' + encodeURIComponent(item[1]) +
              '&b=' + encodeURIComponent(item[2]);

            location.href = url;
          };
        })(i);

        container.appendChild(wordbtn);
      }
      else {
        allAnswered = false
      }
    }
    if (allAnswered) {
      const allAnsParagraph = document.createElement('p')
      allAnsParagraph.className = 'title'
      allAnsParagraph.innerHTML = "Congratulations! You've provided answers for all the words on my website!<br>Now you can click <a href='https://forms.gle/Wg7Y2Wq6UdWueqRF8' target='_blank'>here</a> to suggest a new word to be added in Colorword!<br>Thank you for your contribution!"
      document.getElementById('top').appendChild(allAnsParagraph)
    }
  });