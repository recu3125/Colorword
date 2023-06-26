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
const words = ['Love', 'Harmony', 'Energy', 'Passion', 'Creativity', 'Confidence', 'Joy', 'Wisdom', 'Curiosity', 'Power', 'Balance', 'Growth', 'Happiness', 'Hope', 'Ambition', 'Peace', 'Vibrant', 'Bold', 'Calm', 'Brilliant', 'Illuminating', 'Enchanting', 'Soothing', 'Dynamic', 'Uplifting']
const meanings = ['Deep affection and care.', 'State of peaceful coexistence.', 'Capacity for work or action.', 'Strong and intense emotion.', 'Ability to produce original ideas.', 'Belief in oneself and abilities.', 'Intense feeling of happiness.', 'Deep knowledge and understanding.', 'Desire to learn or explore.', 'Ability to exert influence or control.', 'State of equilibrium or stability.', 'Process of development and increase.', 'State of being happy and content.', 'Optimistic expectation or desire.', 'Strong desire for achievement or success.', 'State of tranquility and harmony.', 'Full of energy and vitality.', 'Fearless and daring in action.', 'Peaceful and undisturbed.', 'Exceptionally bright or intelligent.', 'Providing light or insight.', 'Captivating or charming.', 'Calming and comforting.', 'Energetic and active.', 'Inspiring and elevating.']
wordnum = Math.floor(Math.random() * words.length)
document.getElementById('word').textContent = words[wordnum] + '?'
document.getElementById('meaning').textContent = ' - ' + meanings[wordnum]

console.log(navigator.userAgent)

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
  location.href = '/result' + '?word=' + document.getElementById('word').textContent.slice(0, -1) + '&meaning=' + document.getElementById('meaning').textContent + '&r=' + r + '&g=' + g + '&b=' + b
});