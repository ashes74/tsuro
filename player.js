function Player(name, marker, startingPoint, nextSpace) {
    this.name = name;
    this.marker = marker;
    this.position = startingPoint;
    this.nextSpace = nextSpace;
    this.tiles = [];
}

function rotateTileCw(tile) {
    var addTwo = tile.map(function (connection) {
        return connection + 2;
    });
    addTwo.unshift(addTwo.pop());
    addTwo.unshift(addTwo.pop());
    return addTwo;
}

function rotateTileCcw(tile) {
    var minusTwo = tile.map(function (connection) {
        return connection - 2;
    });
    minusTwo.push(minusTwo.shift());
    minusTwo.push(minusTwo.shift());
    return minusTwo;
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
Player.prototype.drawOne = function (tile) {
    this.tiles.push(tile)
}

Player.prototype.move = function () {
    var prev = this.position; //position is index in the next space
    this.position = tile[prev]

}
