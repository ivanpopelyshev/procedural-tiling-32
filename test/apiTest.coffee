buildBackground = require '../src/index.js'

tileImages =
  '32x32':   [ 'a.png', 'b.png', 'c.png' ]
  '64x64':   [ 'd.png', 'e.png', 'f.png', 'g.png', 'h.png', 'i.png' ]
  '128x128': [ 'j.png', 'k.png', 'l.png', 'm.png' ]

options =
  mustFillAllOpen: false
  tileImages: tileImages
  cols: 8
  rows: 5
  reduceProb: 0.6
  grid:[0, 0, 0, 0, 1, 1, 1, 1
        0, 0, 0, 0, 0, 0, 0, 0
        0, 0, 0, 0, 0, 0, 0, 0
        0, 0, 0, 0, 0, 0, 0, 0
        1, 1, 1, 1, 0, 0, 0, 0]

placedTiles = buildBackground(options)

###
placedTiles == [
    { x: 0, y:0, image: 'a.png' },
    { x: 32, y: 32, image: 'f.png' },
    { x: 96, y: 96, image: 'a.png' }
]
###

test = []
for tile in placedTiles
  for i in [0 .. tile.w/32-1]
    for j in [0 .. tile.w/32-1]
      x = i + tile.x/32
      y = j + tile.y/32
      ind = x +  options.cols * y
      if (x<0 || y<0 || x>=options.cols || y >= options.rows || test[ind])
        throw "test failed, intersecting tiles"
      test[ind] = tile.image[0];
for i in [0..options.rows-1]
  s = ""
  for j in [0..options.cols-1]
    s += test[i * options.cols + j] || 0
  console.log s