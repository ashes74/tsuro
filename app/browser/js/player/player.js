'use strict'

function Player(uid) {
    // TODO: get uid from firebase auth
    this.uid = uid;

    this.marker = "n";

    // should be a Point object
    this.point = null;

    // [x, y]
    // depends on the angular Space.x, Space.y
    this.nextSpace = "n";

    // in each Space.points array, find this specific point and get the position (integer) inside this space.
    this.nextSpacePointsIndex = "n";

    // maximun 3 tiles
    this.tiles = 'n';

    // if a player dies, it will be changed to false
    this.canPlay = true;
}
Player.prototype.hi = function () {
        console.log("HI")
    }
    // need to use self becuse we need to change $scope.me on gameCtrl and send to firebase
Player.prototype.placeMarker = function (board, point, self) {
    // point looks like [x, y, pointsIndex] in the space
    var x = point[0];
    var y = point[1];
    var pointsIndex = point[2];

    console.log("board in playr place marker", board, "point", point)
    self.point = board[y][x].points[pointsIndex];
    self.point.travelled = true;

    //[x, y] from the point
    self.nextSpace = board[y][x];

    // in each Space.points array, find this specific point and get the position (integer) inside this space.
    self.nextSpacePointsIndex = self.nextSpace.points.indexOf(self.point);
};

Player.prototype.newSpace = function (board, oldSpace, self) {
    if (self.nextSpacePointsIndex === 0 || self.nextSpacePointsIndex === 1) {
        return board[oldSpace.y - 1][oldSpace.x];
    } else if (self.nextSpacePointsIndex === 2 || self.nextSpacePointsIndex === 3) {
        return board[oldSpace.y][oldSpace.x + 1];
    } else if (self.nextSpacePointsIndex === 4 || self.nextSpacePointsIndex === 5) {
        return board[oldSpace.y + 1][oldSpace.x];
    } else {
        return board[oldSpace.y][oldSpace.x - 1];
    }
};


Player.prototype.moveTo = function (pointer) {
    //always be returning 0 or 1 point in the array
    for (var key in pointer.neighbors){
        console.log(pointer.neighbors);
        if (!pointer.neighbors[key].travelled && pointer.neighbors[key].n !== 0){
            return pointer.neighbors[key];
        }
    }

    // let nextPoint = pointer.neighbors.filter(function (neighbor) {
    //     return !neighbor.travelled && neighbor !== "n";
    // })[0];
    // return nextPoint;
};


Player.prototype.checkDeath = function (self) {
    var allTravelled = self.point.neighbors.filter(function (neighbor) {
        return neighbor.travelled;
    });

    if (self.point.edge || allTravelled.length === 2) self.canPlay = false;
};
