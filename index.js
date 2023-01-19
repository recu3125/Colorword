class RGBColor {
  constructor(r, g, b, a) {
    this.r = r
    this.g = g
    this.b = b
    this.a = a
  }
}
const imagewh = 100
function loaded() {
  setTimeout(() => {
    makeimage()
  }, 10);
}

function makeimage() {
  var canvas = document.getElementById('colorsort')
  var ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;


  //pixels init
  var pixels = []
  for (var i = 0; i < imagewh; i++) {
    var row = []
    for (var j = 0; j < imagewh; j++) {
      row.push(false)
    }
    pixels.push(row)
  }


  // var colors = testcolors(400)
  // centercolor = new Color(0,0,0)
  // colors.sort((a, b) => colordist(a,centercolor) - colordist(b,centercolor))
  // for (var i = 0; i < 400; i++) {
  //   for (var j = 0; j < 100; j++) {
  //     pixels[150 + j][i] = colors[i]
  //   }
  // }
  var colors = testcolors(imagewh * imagewh)
  pixels[imagewh / 2][imagewh / 2] = LABtoRGB(mostcolor(colors))
  colors.splice(0, 1)
  step()
  function step() {
    console.log(colors.length)
    var prepixels = JSON.parse(JSON.stringify(pixels));
    for (var i = 0; i < imagewh; i++) {
      for (var j = 0; j < imagewh; j++) {
        if ((i == imagewh / 2 && j == imagewh / 2) || prepixels[i][j] != false) continue;
        var idealcolor = aroundcolor(pixels, prepixels, i, j)
        if (idealcolor == false) {
          continue;
        }
        var mindist = 10000000
        var minloc = 0
        for (var k = 0; k < colors.length; k++) {
          if (colordist(colors[k], idealcolor) < mindist) {
            mindist = colordist(colors[k], idealcolor)
            minloc = k
          }
        }
        pixels[i][j] = colors[minloc]
        colors.splice(minloc, 1)
      }
    }
    viewimage(pixels, ctx)
    if (colors.length > 0) {
      setTimeout(() => {
        step()
      }, 0);
    }
  }


}

function viewimage(pixels, ctx) {
  var img = ctx.createImageData(imagewh, imagewh);
  //pixels to img
  for (var i = 0; i < imagewh; i++) {
    for (var j = 0; j < imagewh; j++) {
      {
        img.data[4 * (i * imagewh + j)] = pixels[i][j].r
        img.data[4 * (i * imagewh + j) + 1] = pixels[i][j].g
        img.data[4 * (i * imagewh + j) + 2] = pixels[i][j].b
        img.data[4 * (i * imagewh + j) + 3] = pixels[i][j].a
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

// function dot(img, x, y, color) {
//   var w = img.width
//   var h = img.height
//   var location = w * y + x
//   img.data[location * 4] = color[0]
//   img.data[location * 4 + 1] = color[1]
//   img.data[location * 4 + 2] = color[2]
//   img.data[location * 4 + 3] = color[3]
//   return img
// }

function colordist(color1, color2) {
  var LAB1 = RGBtoLAB(color1)
  var LAB2 = RGBtoLAB(color2)
  return Math.pow(LAB1[0] - LAB2[0], 2) + Math.pow(LAB1[1] - LAB2[1], 2) + Math.pow(LAB1[2] - LAB2[2], 2)
}

function aroundcolor(pixels, prepixels, i, j) {
  var colorlist = []
  // var aroundlist = [
  //   [-1, -1], [-1, 0], [-1, 1],
  //    [0, -1],           [0, 1],
  //    [1, -1],  [1, 0],  [1, 1]
  // ]
  // var aroundlist2 = [
  //   [-2, -2], [-2, -1], [-2, 0], [-2, 1], [-2, 2],
  //   [-1, -2],                             [-1, 2],
  //    [0, -2],                              [0, 2], 
  //    [1, -2],                              [1, 2],  
  //    [2, -2],  [2, -1],  [2, 0],  [2, 1],  [2, 2]  
  // ]
  var aroundlist = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
  for (var k = 0; k < aroundlist.length; k++) {
    var x = i + aroundlist[k][0]
    var y = j + aroundlist[k][1]
    if (imagewh > x && imagewh > y && x >= 0 && y >= 0 && prepixels[x][y] != false) {
      colorlist.push(pixels[x][y])
    }
  }
  // for (var k = 0; k < aroundlist2.length; k++) {
  //   var x = i + aroundlist2[k][0]
  //   var y = j + aroundlist2[k][1]
  //   if (imagewh > x && imagewh > y && x >= 0 && y >= 0 && pixels[x][y] != false) {
  //     colorlist.push(pixels[x][y])
  //   }
  // }
  if (colorlist.length <= Math.round(Math.random() * 10)) {
    return false
  }
  return avgcolor(colorlist)
}

function avgcolor(colorlist) {
  var result = new RGBColor(0, 0, 0, 255)
  for (var i = 0; i < colorlist.length; i++) {
    var color = colorlist[i]
    result.r += color.r
    result.g += color.g
    result.b += color.b
  }
  result.r = Math.round(result.r / colorlist.length)
  result.g = Math.round(result.g / colorlist.length)
  result.b = Math.round(result.b / colorlist.length)
  return result
}

function testcolors(colorscount) {
  var bias = new RGBColor(0, 0, 255, 255)
  var bstrength = 1 //1<=
  var colorslist = []
  for (var i = 0; i < colorscount; i++) {
    var red = Math.round(Math.random() * 255)
    var green = Math.round(Math.random() * 255)
    var blue = Math.round(Math.random() * 255)
    var alpha = 255
    //bias
    red = Math.round(red >= bias.r ? (-Math.pow((256 - red) * Math.pow(256 - bias.r, bstrength), 1 / (bstrength + 1)) + 256) : Math.pow(red * Math.pow(bias.r, bstrength), 1 / (bstrength + 1)))
    green = Math.round(green >= bias.g ? (-Math.pow((256 - green) * Math.pow(256 - bias.g, bstrength), 1 / (bstrength + 1)) + 256) : Math.pow(green * Math.pow(bias.g, bstrength), 1 / (bstrength + 1)))
    blue = Math.round(blue >= bias.b ? (-Math.pow((256 - blue) * Math.pow(256 - bias.b, bstrength), 1 / (bstrength + 1)) + 256) : Math.pow(blue * Math.pow(bias.b, bstrength), 1 / (bstrength + 1)))
    colorslist.push(new RGBColor(red, green, blue, alpha))
  }
  return colorslist
}

// CIELAB
var cache = new Array(256)
for (i = 0; i < 256; i++) {
  cache[i] = new Array(256)
  for (j = 0; j < 256; j++) {
    cache[i][j] = new Array(256).fill(0)
  }
}
function mostcolor(colors) {
  var maxpart = getmaxpart(colors)
  var avgL = 0, avgA = 0, avgB = 0
  for (i = 0; i < maxpart.length; i++) {
    avgL += maxpart[i][0]
    avgA += maxpart[i][1]
    avgB += maxpart[i][2]
  }
  avgL /= maxpart.length
  avgA /= maxpart.length
  avgB /= maxpart.length
  return [avgL, avgA, avgB]
}

function getmaxpart(colors) {
  colorlabs = colors.map(color => RGBtoLAB(color))
  // console.log(colors)
  parts = new Array(4).fill(new Array(4).fill(new Array(4)))
  for (i = 0; i < 4; i++) {
    for (j = 0; j < 4; j++) {
      for (k = 0; k < 4; k++) {
        parts[i][j][k] = []
      }
    }
  }
  for (i = 0; i < colorlabs.length; i++) {
    var x, y, z
    x = Math.floor((colorlabs[i][0]) / 25)
    y = Math.floor((colorlabs[i][1] / 2 + 50) / 25)
    z = Math.floor((colorlabs[i][2] / 2 + 50) / 25)
    // console.log(colorlabs[i][0],
    //   colorlabs[i][1],
    //   colorlabs[i][2])
    parts[x][y][z].push(colorlabs[i])
  }
  var max = 0
  var maxloc = []
  for (i = 0; i < 4; i++) {
    for (j = 0; j < 4; j++) {
      for (k = 0; k < 4; k++) {
        if (parts[i][j][k].length > max) {
          maxloc = [i, j, k]
          max = parts[i][j][k].length
        }
      }
    }
  }
  return parts[maxloc[0]][maxloc[1]][maxloc[2]]
}
function LABtoRGB(LAB) {
  // Convert LAB to XYZ
  let y = (LAB[0] + 16) / 116;
  let x = LAB[1] / 500 + y;
  let z = y - LAB[2] / 200;

  // Calculate XYZ to RGB
  let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
  let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
  let b = x * 0.0557 + y * -0.2040 + z * 1.0570;

  // Adjust gamma
  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
  b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

  // Convert to 0-255 range
  var rgb = []
  rgb[0] = Math.round(r * 255);
  rgb[1] = Math.round(g * 255);
  rgb[2] = Math.round(b * 255);

  return new RGBColor(rgb[0],rgb[1],rgb[2]);
}

function RGBtoLAB(color) {
  if (cache[color.r][color.g][color.b] !== 0) {
    return cache[color.r][color.g][color.b]
  }

  var r = color.r
  var g = color.g
  var b = color.b
  
  let rL = r/255;
  let gL = g/255;
  let bL = b/255;

  rL = (rL > 0.04045) ? Math.pow(((rL + 0.055)/1.055), 2.4) : (rL / 12.92);
  gL = (gL > 0.04045) ? Math.pow(((gL + 0.055)/1.055), 2.4) : (gL / 12.92);
  bL = (bL > 0.04045) ? Math.pow(((bL + 0.055)/1.055), 2.4) : (bL / 12.92);

  let x = (rL * 0.4124) + (gL * 0.3576) + (bL * 0.1805);
  let y = (rL * 0.2126) + (gL * 0.7152) + (bL * 0.0722);
  let z = (rL * 0.0193) + (gL * 0.1192) + (bL * 0.9505);

  x = (x > 0.008856) ? Math.pow(x, (1/3)) : (7.787 * x) + 16/116;
  y = (y > 0.008856) ? Math.pow(y, (1/3)) : (7.787 * y) + 16/116;
  z = (z > 0.008856) ? Math.pow(z, (1/3)) : (7.787 * z) + 16/116;

  let L = (116 * y) - 16;
  let A = 500 * (x - y);
  let B = 200 * (y - z) + 13;

  cache[color.r][color.g][color.b] = [L, A, B]
  return [L, A, B];
}
