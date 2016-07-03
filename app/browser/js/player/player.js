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

Player.prototype.placeMarker = function (point) {
    this.point.travelled = true;
		this.assignXYI(point);
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
			this.assignXYI(currPoint);
		} else {
			end = true
			if (currPoint.neighbors.length==2 ||currPoint.edge) {
				this.canPlay = false;
			}
		}
	}
};

Player.prototype.assignXYI = function (spaceId) {
	spaceArray = spaceId.split("");
	let space;
	this.i= spaceArray.pop();
	this.x = spaceArray.pop();
	this.y = spaceArray.pop();
	return space;
};
