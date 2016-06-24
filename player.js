//Updating points
function Point(edge) {
    this.edge = edge;
    this.neighbors = []; //hold more points & tile?
    this.travelled = false;
}

function Player(name, marker, startingPoint, nextSpace) {
    this.name = name;
    this.marker = marker;
    this.position = startingPoint; //0 
    this.nextSpace = nextSpace; // Space(0,0)
    this.tiles = [];
}

function rotateTileCw(tile) {
    var addTwo = tile.map(function(connection) {
        return connection + 2;
    });
    addTwo.unshift(addTwo.pop());
    addTwo.unshift(addTwo.pop());
    return Player.placeTile(addTwo);
}

function rotateTileCcw(tile) {
    var minusTwo = tile.map(function(connection) {
        return connection - 2;
    });
    minusTwo.push(minusTwo.shift());
    minusTwo.push(minusTwo.shift());
    return Player.placeTile(minusTwo);
}

// when we get the tile, it is already rotated or not, from angular.
Player.prototype.placeTile = function(tile) {
    let index = this.tiles.indexOf(tile);
    this.tiles.splice(index, 1);
    let currentPoint = this.nextSpace.points;
    let obj = {'tile': tile, 'currentPoint': currentPoint};

    for (let i = 0; i < 8; i++) {
        currentPoint[i].neighbors.push(obj);
    };
    // where does the tile come from?
    this.drawOne();
    this.move(tile);
};

// where does the tile come from?
Player.prototype.drawOne = function() {
    const newTile = Game.deck.splice(0, 1); //draw a card from _.shuffle deck
    this.tiles.push(newTile);
};

const pairs = {
    0: 5,
    1: 4,
    2: 7,
    3: 6,
    4: 1,
    5: 0,
    6: 3,
    7: 2
};

function newSpace(oldSpace) {
    if (this.position < 2) {
        return board[oldSpace.y - 1][oldSpace.x];
    } else if (this.position < 4) {
        return board[oldSpace.y][oldSpace.x - 1];
    } else if (this.position < 6) {
        return board[oldSpace.y + 1][oldSpace.x];
    } else {
        return board[oldSpace.y][oldSpace.x + 1];
    }
};

Player.prototype.move = function(tile) {
    let prev = this.position;
    let oldSpace = this.nextSpace;

    this.nextSpace.points[prev].travelled = true;
    //this.checkNeighbors();

    let currentTilePoint = tile.paths[prev]
    if (this.nextSpace.points[currentTilePoint].edge === true) {
        return gameOver(); //need to create Game Over function
    };

    // if () { //if 2 players collide
    //     return gameOver();
    // }

    this.position = pairs[currentTilePoint]; //position is index in the next space
    this.nextSpace = newSpace(oldSpace);
    this.checkNeighbors();

};

Player.prototype.checkNeighbors = function() {
    this.nextSpace.points[this.position].neighbors.forEach(function(neighbor) {
        if (neighbor.currentPoint.travelled === false) { // Can I say that in all cases, there will definitely be only 1 or less neighbor that isn't travelled?
            this.move(neighbor.tile); //how do we know when a tile is on a space?
        }
    });
};

Game.players.forEach(function(player) {
    player.checkNeighbors();
});