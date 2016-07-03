'use strict'

function Player(uid) {
    // TODO: get uid from firebase auth
    this.uid = uid;
    this.marker;
    // [x, y]
    // depends on the angular Space.x, Space.y
    this.x;
		this.y;
		this.i;
    // maximun 3 tiles
    this.tiles;
    // if a player dies, it will be changed to false
    this.canPlay = true;
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

//
// Player.prototype.moveTo = function (pointer) {
//     //always be returning 0 or 1 point in the array
//     let nextPoint = pointer.neighbors.filter(function (neighbor) {
//         return !neighbor.travelled && neighbor !== "n";
//     })[0];
//     return nextPoint;
// };
Player.prototype.move = function (board) {
	//look at point, find untravelled neighbor move
	let currPoint = board[this.y][this.x][this.i];
	let end = false;
	while (!end) {
		let nextPoint = currPoint.neighbors.find((neighbor) => {
			return !neighbor.travelled
		})
		if(nextPoint){
			currPoint=nextPoint;
			let space = parsePoint(nextPoint.spaceId);

			//TODO: can we use Object.assign? Ask Ashi
			// Object.assign(this, space);
			this.x = space.x;
			this.y = space.y;
			this.i = space.i;
		} else {
			end = true
			if (currPoint.neighbors.length==2 ||currPoint.edge) {
				this.canPlay = false;
			}
		}
	}
};


let parsePoint = function (spaceId) {
	spaceArray = spaceId.split("");
	let space;
	space.i= spaceArray.pop();
	space.x = spaceArray.pop();
	space.y = spaceArray.pop();
	return space;
}
