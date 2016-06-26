// remove startingPoint and nextSpace
function Player(name) {
    this.name = name;
    this.marker = null;

    this.point = null; // should be a Point object
    this.nextSpace = null; // [x, y] // depends on the angular Space.x, Space.y

    // in each Space.points array, find this specific point and get the position (integer) inside this space.
    this.nextSpacePointsIndex = null;

    // maximun 3 tiles
    this.tiles = [];

    // if a player dies, it will be changed to false
    this.canPlay = true;
}

Player.prototype.pickMarker = function (marker) {
    this.marker = marker;
}

// Placing marker for the first time
Player.prototype.placeMarker = function (point, nextSpace) {
    this.point = point;
    this.point.travelled = true;
    this.nextSpace = nextSpace;
    // in each Space.points array, find this specific point and get the position (integer) inside this space.
    this.nextSpacePointsIndex = this.nextSpace.points.indexOf(this.point)
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

    let playersWhoCanPlay = Game.players.filter(function (player) {
        return player.canPlay;
    });

    // after a player placed a tile, we check all canPlay players to use keepMoving function to see if can move and/or die
    playersWhoCanPlay.forEach(function (player) {
        player.keepMoving();
    });


    //function need to be written in the game side for when players are dead b/c of the placed tile
    //OR we can just keep the dead players on the point where they end up dying at b/c no other players would ever hit that point.
    Game.removeAllDeadPlayersForThisPlaceTile();
}


// if a plyer is on the edge, then no need to run this function
function newSpace(oldSpace) {
    if (this.nextSpacePointsIndex === 0 || this.nextSpacePointsIndex === 1) {
        return board[oldSpace.y - 1][oldSpace.x];
    } else if (this.nextSpacePointsIndex === 2 || this.nextSpacePointsIndex === 3) {
        return board[oldSpace.y][oldSpace.x + 1];
    } else if (this.nextSpacePointsIndex === 4 || this.nextSpacePointsIndex === 5) {
        return board[oldSpace.y + 1][oldSpace.x];
    } else {
        return board[oldSpace.y][oldSpace.x - 1];
    }
};

function moveTo(pointer) {
    let pointer = pointer;
    let moveTo = pointer.neighbors.filter(function (neighbor) {
        return !neighbor.travelled;
    })[0]; //always be returning 0 or 1 point in the array
    return moveTo;
}

Player.prototype.keepMoving() {
    while (moveTo(this.point)) {
        this.point.travelled = true;
        this.point = moveTo(this.point);
        let oldSpace = this.nextSpace;
        let newSpace = newSpace(oldSpace);
        this.nextSpace = newSpace;

        checkDeath(this);
        moveTo(this.point);
    };
};

function checkDeath(self) {
    self.point.edge ? (
        Game.die(self)
    ) : (
        Game.players.forEach(function (player) {
            if (JSON.stringify(player.point) === JSON.stringify(self.point)) {
                Game.die(self);
            };
        });
    )
}

Game.prototype.die = function (player) {
    //sets the player canPlay to false;
    player.canPlay = false;
}
