var hCanvas = document.getElementById("h")
var hCtx = hCanvas.getContext('2d');
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
        document.body.style.backgroundColor = color
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
      document.body.style.backgroundColor = color
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