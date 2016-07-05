'use strict'

function Player(uid,name) {
    // TODO: get uid from firebase auth
    this.uid = uid;
    this.name = name;
    this.marker;

    // should be a Point object
    this.x;
    this.y;
    this.i;

    // maximun 3 tiles
    this.tiles = 'n';

    // if a player dies, it will be changed to false
    this.canPlay = true;
};


// need to use self becuse we need to change $scope.me on gameCtrl and send to firebase
Player.prototype.placeMarker = function (point, board) {
    this.x = point[0];
    this.y = point[1];
    this.i = point[2];
    this.point = board[this.y][this.x].points[this.i];
    this.point.travelled = true;
};

Player.prototype.move = function (board) {
    let currPoint = board[this.y][this.x].points[this.i];

    currPoint.travelled = true;
    let end = false;
    while (!end) {
        let nextPoint = currPoint.neighbors.find((neighbor) => !neighbor.travelled);
        if (nextPoint) {
            currPoint = nextPoint;
            currPoint.travelled = true;
            this.point = currPoint;
            this.assignXYI(currPoint);
        } else {
            end = true;
            if (currPoint.neighbors.length === 2 || currPoint.edge) this.canPlay = false;
            console.log("cannot play", this.canPlay)
        }
    }
    return currPoint;
};


Player.prototype.assignXYI = function (point) {
    var self = this;
    console.log("self", self)
    let spaceObj = point.spaces.find(function (space) {
        return !(space.x === self.x && space.y === self.y);
    });
    console.log("spaceObj in XYI", spaceObj)
    this.i = spaceObj.i;
    this.x = spaceObj.x;
    this.y = spaceObj.y;
};
