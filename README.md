# procedural-tiling-32

Naive implementation of https://github.com/mreinstein/spec-procedural-tiling

Changes:

1) reduceProb - probability of breaking big tile into small

2) output has parameter "w" which is size of the tile

## Usage:

```bash
coffee src/apiTest.coffee
```

# specs

## motivation
Rather than having to manually skin a game level's background, I want to generate it randomly using a bunch of existing artwork tiles. This will make creating large levels less work, and will keep it visually interesting by having the tile patterns generated with randomness.

## problem statement

Given a 2d space, a group of images, and some configuration options, randomly fill the space with the provided tile art images.

### Possible API


```coffeescript
buildBackground = require 'procedural-tiling'


tileImages =
  '32x32':   [ 'a.png', 'b.png', 'c.png' ]
  '64x64':   [ 'd.png', 'e.png', 'f.png', 'g.png', 'h.png', 'i.png' ]
  '128x128': [ 'j.png', 'k.png', 'l.png', 'm.png' ]

options =
  mustFillAllOpen: false
  tileImages: tileImages
  cols: 4
  rows: 5
  reduceProb: 0.2
  grid:[ 0, 0, 0, 0,
         0, 0, 0, 0,
         0, 0, 0, 0,
         0, 0, 0, 0,
         1, 1, 1, 1 ]
  
placedTiles = buildBackground(options)

###
placedTiles == [
  { x: 0, y:0, w: 32, image: 'a.png' },
  { x: 32, y: 32, w: 64, image: 'f.png' },
  { x: 96, y: 96, w: 32, image: 'a.png' }
]
###
```

OPEN ISSUE: maybe there should be some way to tweak the generation algorithm. For example, have some variables to set the breakdown of tile usage? 20% 128x128, 60% 64x64, 20% 32x32 ? Open for suggestions/ideas!


### options
* `cols` number of columns in the grid
* `rows` number of rows in the grid
* `grid` array representing a 2 dimensional grid of tiles stored in row-major order
* `mustFillAllOpen` boolean. if true, every open cell must be occupied by a tileImage
* `tileImages` images arranged by various fixed dimensions (in pixels)
* `seed` (optional) integer to seed the random number generator with. If you don't specify a seed, every call to `buildBackground()` will result in a different result. If you specify a seed you'll get the same result each time (useful for testing.) `seedrandom` is a great module for this https://www.npmjs.com/package/seedrandom


### output
* `placedTiles` list of tiles with positions specified in (x,y) pixel coordinates


### constraints

* a grid cell is 32x32 pixels
* image tile dimensions are in pixels, and either 32x32, 64x64, or 128x128
* the array is stored in row major order. example world with 3 columns and 4 rows:
```
  [ 2, 0, 0,
    0, 1, 0,
    0, 0, 0,
    0, 0, 5 ]
```
2 is in the top left corner of the world, and 5 is in the bottom right corner.

* cell value of 0 indicates the space is open. a non-zero value indicates space is filled
