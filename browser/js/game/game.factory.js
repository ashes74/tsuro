'use strict';

// game factory written in the style for Browserify
module.exports = function () {
    return {
        // not sure how we know this is add to a specific game room, so I use $scope here inside the function
        addPlayer: function (player) {
            $scope.players.length < 8 ? $scope.players.push(player) : throw new Error "Room Full";
        },
        getCanPlay: function (players) {
            return players.filter(function (player) {
                return player.canPlay;
            })
        }
    }
}
