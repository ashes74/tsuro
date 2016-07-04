'use strict'

function Player(uid) {
    // TODO: get uid from firebase auth
    this.uid = uid;
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
    console.log(this.i)
    this.point = board[this.y][this.x].points[this.i];
    this.point.travelled = true;
};

Player.prototype.move = function (board) {
    console.log("move board", board)
    let currPoint = board[this.y][this.x].points[this.i];
    console.log("move currPoint", currPoint)

    currPoint.travelled = true;
    let end = false;
    console.log("end outside", end)
    while (!end) {
        let nextPoint = currPoint.neighbors.find((neighbor) => !neighbor.travelled);
        if (nextPoint) {
            currPoint = nextPoint;
            currPoint.travelled = true;
            this.point = currPoint;
            this.assignXYI(currPoint);
            console.log("next point", this)
        } else {
            console.log("no next point", this)
            end = true;
            if (currPoint.neighbors.length === 2 || currPoint.edge) this.canPlay = false;
        }
        console.log("end inside at the end", end)
    }
}


Player.prototype.assignXYI = function (point) {
    console.log("assignXYI point", point);
    var self = this;
    console.log("self", self)
    let spaceObj = point.spaces.find(function (space) {
        return !(space.x === self.x && space.y === self.y);
    });
    console.log("spaceArr", spaceObj)
    this.i = spaceObj.i;
    this.x = spaceObj.x;
    this.y = spaceObj.y;
    console.log("me assignXYI i x y", typeof this.i, this.i, this.x, this.y)
};
