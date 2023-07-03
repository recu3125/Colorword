const localStorage = window.localStorage;
const container = document.getElementById('container');

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
    }
  });
