const localStorage = window.localStorage;
function extractRGB(rgbColor) {
  var rgbValues = rgbColor.substring(rgbColor.indexOf("(") + 1, rgbColor.indexOf(")")).split(", ");
  var red = parseInt(rgbValues[0]);
  var green = parseInt(rgbValues[1]);
  var blue = parseInt(rgbValues[2]);

  return {
    r: red,
    g: green,
    b: blue
  };
}

var hCanvas = document.getElementById("h")
var hCtx = hCanvas.getContext('2d');
hCanvas.width = hCanvas.clientWidth;
hCanvas.height = hCanvas.clientHeight;
hCtx.setTransform(1, 0, 0, 1, 0, 0);
var hueGradient = hCtx.createLinearGradient(0, 0, hCtx.canvas.width, 0);
hueGradient.addColorStop(0, 'rgb(255, 0, 0)');
hueGradient.addColorStop(0.15, 'rgb(255, 0, 255)');
hueGradient.addColorStop(0.33, 'rgb(0, 0, 255)');
hueGradient.addColorStop(0.49, 'rgb(0, 255, 255)');
hueGradient.addColorStop(0.67, 'rgb(0, 255, 0)');
hueGradient.addColorStop(0.84, 'rgb(255, 255, 0)');
hueGradient.addColorStop(1, 'rgb(255, 0, 0)');
hCtx.fillStyle = hueGradient;
hCtx.fillRect(0, 0, hCtx.canvas.width, hCtx.canvas.height);

var sbCanvas = document.getElementById("sb")
var sbCtx = sbCanvas.getContext('2d');
sbCanvas.width = sbCanvas.clientWidth;
sbCanvas.height = sbCanvas.clientHeight;
sbCtx.setTransform(1, 0, 0, 1, 0, 0);
sbCanvasChange('rgb(255,0,0)')
function sbCanvasChange(hueselected) {
  sbCtx.fillStyle = hueselected
  sbCtx.fillRect(0, 0, sbCtx.canvas.width, sbCtx.canvas.height);
  var saturationGradient = sbCtx.createLinearGradient(0, 0, hCtx.canvas.width, 0);
  saturationGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  saturationGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  sbCtx.fillStyle = saturationGradient;
  sbCtx.fillRect(0, 0, sbCtx.canvas.width, sbCtx.canvas.height);
  var brightnessGradient = sbCtx.createLinearGradient(0, 0, 0, sbCtx.canvas.height);
  brightnessGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
  brightnessGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
  sbCtx.fillStyle = brightnessGradient;
  sbCtx.fillRect(0, 0, sbCtx.canvas.width, sbCtx.canvas.height);
}
var mouseDown = false
var clickedInH = false
var clickedInSb = false
let sbMouseX, sbMouseY, sbIn;
let hMouseX, hMouseY, hIn;
document.addEventListener('mousemove', (event) => {
  if (document.getElementById("colorviewer").style.backgroundColor !== "") {
    document.getElementById("submit").style.backgroundColor = "#F0F0F0"
    document.getElementById("submit").style.color = "#000"
    document.getElementById("submit").style.width = "100px"
    document.getElementById("submit").textContent = "submit"
  }
  sbMouseX = event.pageX - sbCanvas.offsetLeft;
  sbMouseY = event.pageY - sbCanvas.offsetTop;
  if (sbMouseX > sbCanvas.offsetWidth || sbMouseX < 0 || sbMouseY > sbCanvas.offsetHeight || sbMouseY < 0) {
    sbIn = false
  }
  else {
    sbIn = true
  }
  hMouseX = event.pageX - hCanvas.offsetLeft;
  hMouseY = event.pageY - hCanvas.offsetTop;
  if (hMouseX > hCanvas.offsetWidth || hMouseX < 0 || hMouseY > hCanvas.offsetHeight || hMouseY < 0) {
    hIn = false
  }
  else {
    hIn = true
  }

  if (mouseDown) {
    if (clickedInSb) {
      let colorAtMouse = sbCtx.getImageData(sbMouseX, sbMouseY, 1, 1).data;
      let color = 'rgb(' + colorAtMouse[0] + ',' + colorAtMouse[1] + ',' + colorAtMouse[2] + ')';
      if (color != "rgb(0,0,0)") {
        document.getElementById("colorviewer").style.backgroundColor = color
      }
    }
    if (clickedInH) {
      let colorAtMouse = hCtx.getImageData(hMouseX, 1, 1, 1).data;
      let color = 'rgb(' + colorAtMouse[0] + ',' + colorAtMouse[1] + ',' + colorAtMouse[2] + ')';
      if (color != "rgb(0,0,0)")
        sbCanvasChange(color)
    }
  }
});

document.addEventListener('mouseup', (event) => {
  if (document.getElementById("colorviewer").style.backgroundColor !== "") {
    document.getElementById("submit").style.backgroundColor = "#F0F0F0"
    document.getElementById("submit").style.color = "#000"
    document.getElementById("submit").textContent = "submit"
  }
  mouseDown = false
  clickedInH = false
  clickedInSb = false
});

document.addEventListener('mousedown', (event) => {
  if (hIn) {
    clickedInH = true
  }
  else {
    clickedInH = false
  }
  if (sbIn) {
    clickedInSb = true
  }
  else {
    clickedInSb = false
  }
  if (clickedInSb) {
    let colorAtMouse = sbCtx.getImageData(sbMouseX, sbMouseY, 1, 1).data;
    let color = 'rgb(' + colorAtMouse[0] + ',' + colorAtMouse[1] + ',' + colorAtMouse[2] + ')';
    if (color != "rgb(0,0,0)") {
      document.getElementById("colorviewer").style.backgroundColor = color
    }
  }
  if (clickedInH) {
    let colorAtMouse = hCtx.getImageData(hMouseX, 1, 1, 1).data;
    let color = 'rgb(' + colorAtMouse[0] + ',' + colorAtMouse[1] + ',' + colorAtMouse[2] + ')';
    if (color != "rgb(0,0,0)")
      sbCanvasChange(color)
  }
  mouseDown = true
});

//단어배정
var words, meanings
(async () => {
  const wordData = await (await fetch('/resources/wordData.json')).json()
  words = wordData.words;
  meanings = wordData.meanings;
  wordnum = 0
  while (localStorage.getItem(words[wordnum]) !== null) {
    wordnum++;
    if (wordnum >= words.length) {
      location.href = '/results'
      throw "every colorword has been submitted"
    }
  }
  document.getElementById('word').textContent = words[wordnum] + '?'
  document.getElementById('meaning').textContent = ' - ' + meanings[wordnum]
})()

//버튼 눌리면 전송+결과 리다이렉트
var button = document.getElementById("submit");

// Attach a click event listener to the button
button.addEventListener("click", function () {
  if (button.textContent == "select your color first!") {
    return
  }
  const { r, g, b } = extractRGB(document.getElementById("colorviewer").style.backgroundColor)
  fetch('/api/submitcolor', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([words[wordnum], { r, g, b }]),
  })
    .then((response) => {
      if (response.ok) {
        // RGB data submitted successfully
        return response.json();
      } else {
        throw new Error('Error submitting RGB data');
      }
    })
    .then((data) => {
      console.log(data.message);
    })
    .catch((error) => {
      console.log('An error occurred:', error);
    });
  localStorage.setItem(document.getElementById('word').textContent.slice(0, -1), JSON.stringify([r, g, b]));
  location.href = '/result' + '?word=' + document.getElementById('word').textContent.slice(0, -1) + '&meaning=' + document.getElementById('meaning').textContent + '&r=' + r + '&g=' + g + '&b=' + b
});