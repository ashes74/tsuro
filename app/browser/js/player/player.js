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
    let currPoint = board[this.y][this.x][this.i];
    currPoint.travelled = true;
    let end = false;
    while (!end) {
        let nextPoint = currPoint.neighbors.find((neighbor) => !neighbor.travelled);
        if (nextPoint) {
            currPoint = nextPoint;
            currPoint.travelled = true;
            this.assignXYI(currPoint);
        } else {
            end = true;
            if (currPoint.neighbors.length === 2 || currPoint.edge) this.canPlay = false;
        }
    }
}


Player.prototype.assignXYI = function (spaceId) {
    console.log(spaceId)
    spaceArray = spaceId.split("");
    let space;
    this.i = spaceArray.pop();
    this.x = spaceArray.pop();
    this.y = spaceArray.pop();
    return space;
};
