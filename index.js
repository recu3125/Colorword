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
  return Math.pow(LAB1[0] - LAB2[0], 2) * 1.5 + Math.pow(LAB1[1] - LAB2[1], 2) + Math.pow(LAB1[2] - LAB2[2], 2)
}
function colordistlab(color1, color2) {
  var LAB1 = color1
  var LAB2 = color2
  return Math.pow(LAB1[0] - LAB2[0], 2) * 1.5 + Math.pow(LAB1[1] - LAB2[1], 2) + Math.pow(LAB1[2] - LAB2[2], 2)
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
  var bias = new RGBColor(255, 0, 0, 255)
  var bstrength = 2
  var colorslist = []
  for (var i = 0; i < colorscount; i++) {
    var red = Math.round(Math.random() * 255)
    var green = Math.round(Math.random() * 255)
    var blue = Math.round(Math.random() * 255)
    var alpha = 255
    //bias
    if (bstrength >= 1) {
      red = Math.round(red >= bias.r ? (-Math.pow((256 - red) * Math.pow(256 - bias.r, bstrength), 1 / (bstrength + 1)) + 256) : Math.pow(red * Math.pow(bias.r, bstrength), 1 / (bstrength + 1)))
      green = Math.round(green >= bias.g ? (-Math.pow((256 - green) * Math.pow(256 - bias.g, bstrength), 1 / (bstrength + 1)) + 256) : Math.pow(green * Math.pow(bias.g, bstrength), 1 / (bstrength + 1)))
      blue = Math.round(blue >= bias.b ? (-Math.pow((256 - blue) * Math.pow(256 - bias.b, bstrength), 1 / (bstrength + 1)) + 256) : Math.pow(blue * Math.pow(bias.b, bstrength), 1 / (bstrength + 1)))
    }
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
  colors = colors.map(color => RGBtoLAB(color))
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
  var xyz = []
  xyz[0] = avgL
  xyz[1] = avgA
  xyz[2] = avgB

  var asdf = 4
  while (asdf--) {
    xyz = approachmost(xyz[0], xyz[1], xyz[2], colors, 30, 5)
  }
  var asdf = 4
  while (asdf--) {
    xyz = approachmost(xyz[0], xyz[1], xyz[2], colors, 10, 3)
  }
  var asdf = 4
  var asdf = 4
  while (asdf--) {
    xyz = approachmost(xyz[0], xyz[1], xyz[2], colors, 7, 1)
  }
  var asdf = 4
  while (asdf--) {
    xyz = approachmost(xyz[0], xyz[1], xyz[2], colors, 3, 1)
  }
  return xyz
}

function approachmost(x, y, z, colors, radius, step) {
  var dir = []
  dir[0] = countnearcolors(x + step, y, z, colors, radius)
  dir[1] = countnearcolors(x, y + step, z, colors, radius)
  dir[2] = countnearcolors(x, y, z + step, colors, radius)
  dir[3] = countnearcolors(x - step, y, z, colors, radius)
  dir[4] = countnearcolors(x, y - step, z, colors, radius)
  dir[5] = countnearcolors(x, y, z - step, colors, radius)
  var coords = [[step, 0, 0], [0, step, 0], [0, 0, step], [-step, 0, 0], [0, -step, 0], [0, 0, -step]]
  var max = Math.max(dir[0], dir[1], dir[2], dir[3], dir[4], dir[5])
  for (i = 0; i < 6; i++) {
    if (max == dir[i]) {
      x += coords[i][0]
      y += coords[i][1]
      z += coords[i][2]
      return ([x, y, z])
    }
  }
}

function countnearcolors(x, y, z, colors, radius) {
  var count = 0
  for (i = 0; i < colors.length; i++) {
    if (colordistlab([x, y, z], colors[i]) <= radius) {
      count += 1
    }
  }
  return count
}

function getmaxpart(colors) {
  // console.log(colors)
  parts = new Array(4).fill(new Array(4).fill(new Array(4)))
  for (i = 0; i < 4; i++) {
    for (j = 0; j < 4; j++) {
      for (k = 0; k < 4; k++) {
        parts[i][j][k] = []
      }
    }
  }
  // var xmin=1000000000,ymin=100000000000,zmin=100000000000000
  // var xmax=-1000000000,ymax=-100000000000,zmax=-100000000000000
  for (i = 0; i < colors.length; i++) {
    var x, y, z
    x = Math.floor((colors[i][0]) / 25)
    y = Math.floor((colors[i][1] + 86.184636497626) / 184.43885518379 *4)
    z = Math.floor((colors[i][2] + 107.863681044952) / 202.34616649140 *4)
    // xmin=Math.min(xmin,colors[i][0])
    // ymin=Math.min(ymin,colors[i][1])
    // zmin=Math.min(zmin,colors[i][2])
    // xmax=Math.max(xmax,colors[i][0])
    // ymax=Math.max(ymax,colors[i][1])
    // zmax=Math.max(zmax,colors[i][2])
    // console.log(xmin,ymin,zmin,xmax,ymax,zmax)
    // console.log(x,y,z)
    parts[x][y][z].push(colors[i])
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
  let L = LAB[0]
  let A = LAB[1]
  let B = LAB[2]

  let y = (L + 16) / 116
  let x = A / 500 + y
  let z = y - B / 200

  if (Math.pow(y, 3) > 0.008856) {
    y = Math.pow(y, 3)
  } else {
    y = (y - 16 / 116) / 7.787
  }

  if (Math.pow(x, 3) > 0.008856) {
    x = Math.pow(x, 3)
  } else {
    x = (x - 16 / 116) / 7.787
  }

  if (Math.pow(z, 3) > 0.008856) {
    z = Math.pow(z, 3)
  } else {
    z = (z - 16 / 116) / 7.787
  }

  let xPrime = x * 0.95047
  let yPrime = y * 1.00000
  let zPrime = z * 1.08883

  let r = xPrime * 3.2406 + yPrime * -1.5372 + zPrime * -0.4986
  let g = xPrime * -0.9689 + yPrime * 1.8758 + zPrime * 0.0415
  let b = xPrime * 0.0557 + yPrime * -0.2040 + zPrime * 1.0570

  if (r > 0.0031308) {
    r = 1.055 * (Math.pow(r, (1 / 2.4))) - 0.055
  } else {
    r *= 12.92
  }

  if (g > 0.0031308) {
    g = 1.055 * (Math.pow(g, (1 / 2.4))) - 0.055
  } else {
    g *= 12.92
  }

  if (b > 0.0031308) {
    b = 1.055 * (Math.pow(b, (1 / 2.4))) - 0.055
  } else {
    b *= 12.92
  }

  let rFinal = Math.round(r * 255);
  let gFinal = Math.round(g * 255);
  let bFinal = Math.round(b * 255);

  return new RGBColor(rFinal, gFinal, bFinal, 255);
}

function RGBtoLAB(color) {
  if (cache[color.r][color.g][color.b] !== 0) {
    return cache[color.r][color.g][color.b]
  }

  var r = color.r
  var g = color.g
  var b = color.b

  let rPrime = r / 255;
  let gPrime = g / 255;
  let bPrime = b / 255;

  if (rPrime > 0.04045) {
    rPrime = Math.pow(((rPrime + 0.055) / 1.055), 2.4);
  } else {
    rPrime /= 12.92;
  }

  if (gPrime > 0.04045) {
    gPrime = Math.pow(((gPrime + 0.055) / 1.055), 2.4);
  } else {
    gPrime /= 12.92;
  }

  if (bPrime > 0.04045) {
    bPrime = Math.pow(((bPrime + 0.055) / 1.055), 2.4);
  } else {
    bPrime /= 12.92;
  }

  let x = (rPrime * 0.4124 + gPrime * 0.3576 + bPrime * 0.1805) / 0.95047;
  let y = (rPrime * 0.2126 + gPrime * 0.7152 + bPrime * 0.0722) / 1.00000;
  let z = (rPrime * 0.0193 + gPrime * 0.1192 + bPrime * 0.9505) / 1.08883;

  if (x > 0.008856) {
    x = Math.pow(x, (1 / 3));
  } else {
    x = (7.787 * x) + (16 / 116);
  }

  if (y > 0.008856) {
    y = Math.pow(y, (1 / 3));
  } else {
    y = (7.787 * y) + (16 / 116);
  }

  if (z > 0.008856) {
    z = Math.pow(z, (1 / 3));
  } else {
    z = (7.787 * z) + (16 / 116);
  }

  let L = (116 * y) - 16;
  let A = 500 * (x - y);
  let B = 200 * (y - z);

  cache[color.r][color.g][color.b] = [L, A, B]
  return [L, A, B];
}
