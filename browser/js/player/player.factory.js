'use strict'

module.exports = function () {
    return {
        player: function (name) {
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

        },
        placeMarker: function (player, point, nextSpace) {
            player.point = point;
            player.point.travelled = true;
            player.nextSpace = nextSpace;
            // in each Space.points array, find this specific point and get the position (integer) inside this space.
            player.nextSpacePointsIndex = this.nextSpace.points.indexOf(player.point)
        },
        newSpace: function (oldeSpace, player) {
            if (player.nextSpacePointsIndex === 0 || player.nextSpacePointsIndex === 1) {
                return board[oldSpace.y - 1][oldSpace.x];
            } else if (player.nextSpacePointsIndex === 2 || player.nextSpacePointsIndex === 3) {
                return board[oldSpace.y][oldSpace.x + 1];
            } else if (player.nextSpacePointsIndex === 4 || player.nextSpacePointsIndex === 5) {
                return board[oldSpace.y + 1][oldSpace.x];
            } else {
                return board[oldSpace.y][oldSpace.x - 1];
            }
        }
        rotateTileCw: function (tile) {
            var addTwo = tile.map(function (connection) {
                return connection + 2;
            });
            addTwo.unshift(addTwo.pop());
            addTwo.unshift(addTwo.pop());
            return Player.placeTile(addTwo);
        },
        rotateTileCcw: function (tile) {
            var minusTwo = tile.map(function (connection) {
                return connection - 2;
            });
            minusTwo.push(minusTwo.shift());
            minusTwo.push(minusTwo.shift());
            return Player.placeTile(minusTwo);
        },
        placeTile: function (tile, player) {
            var index = player.tiles.indexOf(tile)
            player.tiles.splice(index, 1);

            for (var i = 0; i < tile.length; i++) {
                player.nextSpace.points[i].neighbors.push(points[tile[i]]);
            }

            $scope.turnOrderArray.forEach(function (player) {
                keepMoving(player)
            })
        },
        moveTo: function (pointer) {
            let pointer = pointer;
            let nextPoint = pointer.neighbors.filter(function (neighbor) {
                return !neighbor.travelled;
            })[0]; //always be returning 0 or 1 point in the array
            return nextPoint;
        },
        keepMoving: function (player) {
            let movable = moveTo(player.point);
            while (movable) {
                player.point.travelled = true;
                player.point = moveTo(player.point);
                let oldSpace = player.nextSpace;
                let newSpace = newSpace(oldSpace);
                player.nextSpace = newSpace;

                checkDeath(player);
                movable = moveTo(player.point);
            };
        },
        checkDeath: function (self) {
            self.point.edge ? (
                die(self)
            ) : (
                $scope.players.forEach(function (player) {
                    if (JSON.stringify(player.point) === JSON.stringify(self.point)) {
                        die(self);
                    };
                });
            );
        },
        die: function (player) {
            player.canPlay = false;
            // need to send an alert or message to the player who just died.
        }
    }
}
