'use strict'

function Player(uid,name) {
    // TODO: get uid from firebase auth
    this.uid = uid;
    this.name = name || "Mystery Player";
    this.marker;

    // should be a Point object
    this.x;
    this.y;
    this.i;

    // maximun 3 tiles
    this.tiles;

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
    console.log(currPoint)
    currPoint.travelled = true;
    let end = false;
    while (!end) {

        let nextPoint = currPoint.neighbors.find((neighbor) => !neighbor.travelled);
        console.log(nextPoint)
        if (nextPoint) {
            currPoint = nextPoint;
            currPoint.travelled = true;
            console.log(this.point);
            this.point = currPoint;
            console.log("edge?",this.point.edge);
            if (this.point.edge){
                this.canPlay = false
            }
            this.assignXYI(currPoint);
        } else {
            if (currPoint.neighbors.length === 2 || currPoint.edge) this.canPlay = false;
            console.log("can play", this.canPlay)
            end = true;
        }
    }
};


Player.prototype.assignXYI = function (point) {
    var self = this;
		console.log("attempting to move to", point);
    console.log("self", self);
    let spaceObj = point.spaces.find(function (space) {
        return !(space.x === self.x && space.y === self.y);
    });

    if (spaceObj) {
        console.log("spaceObj in XYI", spaceObj)
        this.i = spaceObj.i;
        this.x = spaceObj.x;
        this.y = spaceObj.y;
    } else {
        this.i = +point.spaceId.slice(-1);
        this.x = +point.spaceId.slice(6,-1);
        this.y = +point.spaceId.slice(5,-2);
    }
};
