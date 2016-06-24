// Point should be on the board.js, please move and keep this function
// function Point(edge) {
//     this.edge = edge;
//     this.neighbors = []; //hold more points & tile of points?
//     this.travelled = false;
// }

function Player(name, marker, startingPoint, nextSpace) {
    this.name = name;
    this.marker = marker;
    this.point = startingPoint; // should be a Point object
    this.nextSpace = nextSpace; // [x, y]

    // in each Space.points array, find this specific point and get the position (integer) inside this space.
    this.nextSpacePointsIndex = this.nextSpace.points.indexOf(this.point)

    // maximun 3 tiles
    this.tiles = [];

    // if a player dies, it will be changed to false
    this.canPlay = true;
}

function rotateTileCw(tile) {
    var addTwo = tile.map(function (connection) {
        return connection + 2;
    });
    addTwo.unshift(addTwo.pop());
    addTwo.unshift(addTwo.pop());
    return Player.placeTile(addTwo);
}

function rotateTileCcw(tile) {
    var minusTwo = tile.map(function (connection) {
        return connection - 2;
    });
    minusTwo.push(minusTwo.shift());
    minusTwo.push(minusTwo.shift());
    return Player.placeTile(minusTwo);
}

// when we get the tile, it is already rotated or not, from angular.
Player.prototype.placeTile = function (tile) {
    var index = this.tiles.indexOf(tile)
    this.tiles.splice(index, 1);

    for (var i = 0; i < tile.length; i++) {
        this.nextSpace.points[i].neighbors.push(points[tile[i]]);
    }

    // where does the tile come from?
    this.drawOne();
}


// where does the tile come from?
Player.prototype.drawOne = function () {
    const newTile = Game.deck.splice(0, 1); //draw a card from _.shuffle deck
    this.tiles.push(newTile);
};


// if a plyer is on the edge, then no need to run this function
function newSpace(oldSpace) {
    if (this.nextSpacePointsIndex === 0 && this.nextSpacePointsIndex === 1) {
        return board[oldSpace.y - 1][oldSpace.x];
    } else if (this.nextSpacePointsIndex === 2 && this.nextSpacePointsIndex === 3) {
        return board[oldSpace.y][oldSpace.x + 1];
    } else if (this.nextSpacePointsIndex === 4 && this.nextSpacePointsIndex === 5) {
        return board[oldSpace.y + 1][oldSpace.x];
    } else {
        return board[oldSpace.y][oldSpace.x - 1];
    }
};

Player.prototype.move = function () {
    // should be a Point object
    var moveTo = this.point.neighbors.filter(function (neighbor) {
        return !neighbor.travelled;
    })[0]

    if (moveTo) {
        this.point.travelled = true;
        this.point = moveTo;
    }

    const oldSpace = this.nextSpace;
    const newSpace = newSpace(oldSpace);
    this.nextSpace = newSpace;

    checkBumping(this)

};


// Game should have a function for each player to check if they can move, if can, player.prototype.move();
// Player.prototype.checkNeighbors = function () {
//     this.nextSpace.points[this.point].neighbors.forEach(function (neighbor) {
//         if (neighbor.currentPoint.travelled === false) { // Can I say that in all cases, there will definitely be only 1 or less neighbor that isn't travelled?
//             this.move(neighbor.tile); //how do we know when a tile is on a space?
//         }
//     });
// };



function checkBumping(self) {
    const index = Game.players.indexOf(self);
    Game.players.splice(index, 1).forEach(function (player) {
        if (player.point === self.point) {
            // need to write a Game.prototype.die function
            Game.die(player)
            Game.die(self)
        }
    })
}
