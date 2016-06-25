// Point should be on the board.js, please move and keep this function
// function Point(edge) {
//     this.edge = edge;
//     this.neighbors = []; //hold more points & tile of points?
//     this.travelled = false;
// }

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

Player.prototype.pickMarker = function(marker) {
    this.marker = marker;
}

// Placing marker for the first time
Player.prototype.placeMarker = function(point, nextSpace) {
    this.point = point;
    this.point.travelled = true;
    this.nextSpace = nextSpace;
    // in each Space.points array, find this specific point and get the position (integer) inside this space.
    this.nextSpacePointsIndex = this.nextSpace.points.indexOf(this.point)
}

function rotateTileCw(tile) {
    var addTwo = tile.map(function(connection) {
        return connection + 2;
    });
    addTwo.unshift(addTwo.pop());
    addTwo.unshift(addTwo.pop());
    return Player.placeTile(addTwo);
}

function rotateTileCcw(tile) {
    var minusTwo = tile.map(function(connection) {
        return connection - 2;
    });
    minusTwo.push(minusTwo.shift());
    minusTwo.push(minusTwo.shift());
    return Player.placeTile(minusTwo);
}

// when we get the tile, it is already rotated or not, from angular.
Player.prototype.placeTile = function(tile) {
    var index = this.tiles.indexOf(tile)
    this.tiles.splice(index, 1);

    for (var i = 0; i < tile.length; i++) {
        this.nextSpace.points[i].neighbors.push(points[tile[i]]);
    }

    let playersWhoCanPlay = Game.players.filter(function(player) {
        return player.canPlay;
    });
    //Way1: (Longer, but I think it's easier to understand) - Kills a player one at a time
    //When a player places a tile, we would go around each player (that .canPlay) and check to see if there is anyone that moved to their spot. If there is someone that is on the same spot as them, then the player dies. Instead of killing both players, when a player hits the point that another player is already on, we have each player determine if they should be dead on not...I think forEach makes a copy of the Game.players array when they do the forEach...if we have a player kill himself and the other player at the same point during the forEach loop, the array wouldn't be updated for the other player.

    playersWhoCanPlay.forEach(function(player) {
        var playerCheckIndex = playersWhoCanPlay.indexOf(player);
        var allOtherPlayers = playersWhoCanPlay.splice(playerCheckIndex, 0);
        for (var i = 0; i < allOtherPlayers.length; i++) {
            if (player.point === allOtherPlayers[i]) {
                Game.die(player);
            } else {
                player.keepMoving();
            }
        }
    });

    //Way 2: (UNFINISHED) - Kill players at the same time if 1 player hits another player
    //I think we can update the playerWhoCanPlay with a callback in the forEach, but how would the playersWhoCanPlay array be updated if the player.canPlay status comes from player.keepMoving()?
    playersWhoCanPlay.forEach(function(player) {
        //2.) We need to check .canPlay again b/c players can be killed during another player move
        if (player.canPlay) {
            player.keepMoving();
        };
    });

    //function need to be written in the game side for when players are dead b/c of the placed tile
    //OR we can just keep the dead players on the point where they end up dying at b/c no other players would ever hit that point.
    Game.removeAllDeadPlayersForThisPlaceTile();
}


// if a plyer is on the edge, then no need to run this function
function newSpace(oldSpace) {
    if (this.nextSpacePointsIndex === 0 && this.nextSpacePointsIndex === 1) {
        return board[oldSpace.y - 1][oldSpace.x];
    } else if (this.nextSpacePointsIndex === 2 && this.nextSpacePointsIndex === 3) {
        return board[oldSpace.y][oldSpace.x + 1];
    } else if (this.nextSpacePointsIndex === 4 && this.nextSpacePointsIndex === 5) {
        return board[oldSpace.y + 1][oldSpace.x];
    } else {
        return board[oldSpace.y][oldSpace.x - 1];
    }
};

function moveTo(pointer) {
    let pointer = pointer;
    let moveTo = pointer.neighbors.filter(function(neighbor) {
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

// Game should have a function for each player to check if they can move, if can, player.prototype.move();
Player.prototype.checkNeighbors = function() {
    this.nextSpace.points[this.point].neighbors.forEach(function(neighbor) {
        if (neighbor.currentPoint.travelled === false) { // Can I say that in all cases, there will definitely be only 1 or less neighbor that isn't travelled?
            this.move(neighbor.tile); //how do we know when a tile is on a space?
        }
    });
};



function checkDeath(self) {
    self.point.edge ? Game.die(self) : bumpPlayers;
    let bumpPlayers = Game.players.forEach(function(player) {
        if (JSON.stringify(player.point) === JSON.stringify(self.point)) {
            Game.die(self); //This is for Way 1 & 2
            // Game.die(player); //This is for Way 2
        };
    });
};

Game.prototype.die = function(player) {
    //sets the player canPlay to false;
    player.canPlay = false;
}