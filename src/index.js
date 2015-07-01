/**
 tileImages =
 '32x32':   [ 'a.png', 'b.png', 'c.png' ]
 '64x64':   [ 'd.png', 'e.png', 'f.png', 'g.png', 'h.png', 'i.png' ]
 '128x128': [ 'j.png', 'k.png', 'l.png', 'm.png' ]

 options =
 mustFillAllOpen: false
 tileImages: tileImages
 cols: 4
 rows: 5
 grid:[ 0, 0, 0, 0,
 0, 0, 0, 0,
 0, 0, 0, 0,
 0, 0, 0, 0,
 1, 1, 1, 1 ]

 returns

 placedTiles == [
 { x: 0, y:0, w: 32, image: 'a.png' },
 { x: 32, y: 32, w: 64, image: 'f.png' },
 { x: 96, y: 96, w: 32, image: 'a.png' }
 ]
 */

var seedrandom = require('seedrandom');

//random placing function
module.exports = function buildBackground(options) {
    var tileImages = options.tileImages;
    var tileNames = [];
    var i, j, x, y, sz, ind, pos;
    var tiles = [null, tileImages['32x32'] || [], tileImages['64x64'] || [],
        tileImages['96x96'] || [], tileImages['128x128'] || []];
    for (i=1;i<tiles.length;i++)
        for (j=0;j<tiles[i].length;j++)
            tileNames.push(tiles[i][j]);
    if (!tiles[1]) throw "at least one tile of size 32x32 required";
    var w = options.cols, h = options.rows;
    var rand = new seedrandom(options.seed);
    var grid = options.grid;
    if (!grid) throw "grid is required";
    if (w * h != grid.length) throw "grid size != cols * rows";

    //1. look for max square size with (x,y) left-top corner: 1, 2 or 4
    var maxSize = [];
    for (y = 0; y < h; y++)
        for (x = 0; x < w; x++) {
            pos = x + y * w;
            cycle: for (i = 0; i < 4 && x + i < w && y + i < h; i++) {
                for (j = 0; j <= i; j++)
                    if (grid[pos + i * w + j] || grid[pos + j * w + i]) break cycle;
            }
            maxSize.push(i);
        }

    //debug output
    function debug() {
        console.log("==debug out==")
        for (j = 0; j < h; j++) {
            var s = "";
            for (i = 0; i < w; i++) {
                if (maxSize[i + j * w] >= 0) s += maxSize[i + j * w];
                else s += tileNames[-maxSize[i + j * w] - 1][0];
            }
            console.log(s);
        }
    }

    //2. generate all spaces and shuffle them
    var spaces = [];
    for (var x = 0; x < w * h; x++) if (!grid[x]) spaces.push(x);
    shuffle(rand, spaces);
    var res = [];
    //for every space, try to place maximal square in it
    var candidates = [];
    var neib = [];
    for (ind = 0; ind < spaces.length; ind++) {
        pos = spaces[ind];
        if (maxSize[pos] <= 0) continue;
        x = pos % w;
        y = pos / w | 0;
        for (sz = 4; sz >= 2; sz--) {
            if (tiles[sz].length == 0) continue;
            while (candidates.length > 0) candidates.pop();
            for (i = 0; i < sz && i <= x; i++)
                for (j = 0; j < sz && j <= y; j++)
                    if (maxSize[pos - i - j * w] >= sz) candidates.push(pos - i - j * w);
            if (candidates.length > 0) {
                if (rand.quick()>=options.reduceProb) {
                    pos = candidates[Math.floor(rand.quick() * candidates.length)];
                    break;
                }
            }
        }
        //ok, now we can place something of size "sz" in position "pos"
        //lets look at neighbors
        x = pos % w;
        y = pos / w | 0;
        while (neib.length>0) neib.pop();
        for (i = -1; i <= sz; i++)
            for (j = -1; j <= sz; j++)
                if (i==-1||j==-1||i==sz||j==sz)
                    if (x+i>=0&&x+i<w&&y+j>=0&&y+j<h)
                        if (maxSize[pos+i+j*w]<0)
                            neib.push(-maxSize[pos+i+j*w]-1);
        var tileBase = 0;
        for (i=1;i<sz;i++)
            tileBase += tiles[i].length;
        var tileNumber = tileBase;
        //try to place something different than neib
        for (var tries=0;tries<4;tries++) {
            tileNumber = tileBase + Math.floor(rand.quick() * tiles[sz].length);
            if (neib.indexOf(tileNumber)<0) break;
        }
        //fill the place
        for (i = 0; i < sz; i++)
            for (j = 0; j < sz; j++)
                maxSize[pos+i+j*w] = -tileNumber-1;
        //reduce size of max squares in the zone
        for (i = Math.max(x-3, 0); i < x+sz && i<w; i++)
            for (j = Math.max(y-3, 0); j < y+sz && j<h; j++) {
                maxSize[i+j*w] = Math.min(maxSize[i+j*w], Math.max(x-i, y-j));
            }
        res.push({
            x: x * 32,
            y: y * 32,
            w: sz * 32,
            image: tileNames[tileNumber]
        });
    }
    return res;
};

// http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(rand, array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(rand.quick() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}
