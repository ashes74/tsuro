'use strict'

function Player(name) {
    this.name;
    this.marker = null;
    this.point = null; // should be a Point object
    this.nextSpace = null; // [x, y] // depends on the angular Space.x, Space.y

    // in each Space.points array, find this specific point and get the position (integer) inside this space.
    this.nextSpacePointsIndex = null;

    // maximun 3 tiles
    this.tiles = [];

    // if a player dies, it will be changed to false
    this.canPlay = true;
};

Player.prototype.placeMarker = function (point) {
    // point looks like [x, y, pointsIndex] in the space
    var y = point[1]
    var x = point[0]
    var pointsIndex = point[2]
    this.point = board[y][x].points[pointsIndex];
    this.point.travelled = true;
    this.nextSpace = nextSpace; //[x, y] from the point
    // in each Space.points array, find this specific point and get the position (integer) inside this space.
    this.nextSpacePointsIndex = this.nextSpace.points.indexOf(this.point)
}
Player.prototype.newSpace = function (oldeSpace, this) {
    if (this.nextSpacePointsIndex === 0 || this.nextSpacePointsIndex === 1) {
        return board[oldSpace.y - 1][oldSpace.x];
    } else if (this.nextSpacePointsIndex === 2 || this.nextSpacePointsIndex === 3) {
        return board[oldSpace.y][oldSpace.x + 1];
    } else if (this.nextSpacePointsIndex === 4 || this.nextSpacePointsIndex === 5) {
        return board[oldSpace.y + 1][oldSpace.x];
    } else {
        return board[oldSpace.y][oldSpace.x - 1];
    }
}
Player.prototype.rotateTileCw = function (tile) {
        var addTwo = tile.map(function (connection) {
            return connection + 2;
        });
        addTwo.unshift(addTwo.pop());
        addTwo.unshift(addTwo.pop());
        return Player.placeTile(addTwo);
    },
    Player.prototype.rotateTileCcw = function (tile) {
        var minusTwo = tile.map(function (connection) {
            return connection - 2;
        });
        minusTwo.push(minusTwo.shift());
        minusTwo.push(minusTwo.shift());
        return Player.placeTile(minusTwo);
    }
Player.prototype.placeTile = function (tile, this) {
    var index = this.tiles.indexOf(tile)
    this.tiles.splice(index, 1);

    for (var i = 0; i < tile.length; i++) {
        this.nextSpace.points[i].neighbors.push(points[tile[i]]);
    }

    // $scope.turnOrderArray.forEach(function (this) {
    //     keepMoving(this)
    // })
}
Player.prototype.moveTo = function (pointer) {
    let pointer = pointer;
    let nextPoint = pointer.neighbors.filter(function (neighbor) {
        return !neighbor.travelled;
    })[0]; //always be returning 0 or 1 point in the array
    return nextPoint;
}
Player.prototype.keepMoving = function () {
    let movable = moveTo(this.point);
    while (movable) {
        this.point.travelled = true;
        this.point = moveTo(this.point);
        let oldSpace = this.nextSpace;
        let newSpace = newSpace(oldSpace);
        this.nextSpace = newSpace;

        checkDeath(this);
        movable = moveTo(this.point);
    };
}
Player.prototype.checkDeath = function () {
    this.point.edge ? (
        die(this)
    ) : (
        $scope.players.forEach(function (player) {
            if (JSON.stringify(player.point) === JSON.stringify(this.point)) {
                die(this);
            };
        });
    );
}
Player.prototype.die = function (this) {
    this.canPlay = false;
    // TODO: need to send an alert or message to the player who just died.
}
