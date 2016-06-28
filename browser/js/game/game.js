tsuro.config(function ($stateProvider) {
    $stateProvider.state('game', {
        url: '/game/:gameName',
        templateUrl: '/js/game/game.html',
        controller: 'gameCtrl'
    })
})

tsuro.controller('gameCtrl', function ($scope) {
    // TODO: how do we show the tiles for player?

    // TODO: how to show the rotated tile?


    // TODO: store game and moves on firebase
    $scope.game;

    // TODO: store players locally
    $scope.players;

    // TODO: store player locally
    $scope.player;

    // CMT: assuming we use new Game() for each game
    $scope.currentPlayer = $scope.game.getCurrentPlayer();

    // CMT: assuming we use new Game() for each game, holds all the players still on the board.
    $scope.turnOrderArray = $scope.game.getCanPlay();

    // TODO: need this info for firebase, already shuffled tiles. Is it from new Game() ?
    $scope.deck;

    // QUESTION: do we need master to be stored in firebase?
    // TODO: get who's the master
    $scope.master;

    // TODO: need a function to assign dragon
    $scope.dragon;

    // TODO: we probably need this on firebase so other people can't pick what's been picked
    $scope.availableMarkers;

    // QUESTION: do we need to store this on firebase?
    $scope.pickMarker = function (marker) {
        $scope.player.marker = marker;
    };

    // CMT: assume we are using new Player(uid) for any player (?)
    // using player.prototype.placeMarker
    $scope.placeMarker = function (point) {
        $scope.player.placeMarker(point);
    };

    // CMT: assuming we are using new Game() for $scope.game
    $scope.start = function () {
        // TODO: add game init state with shuffled deck

        // TODO: need to add to firebase (?)
        $scope.game.turnOrderArray.forEach(function (player) {
            player.tiles = $scope.game.deck.dealThree();
        })
    };

    $scope.myTurn = function () {
        $scope.player === $scope.currentPlayer;
    };

    $scope.rotateTileCw = function (tile) {
        var addTwo = tile.map(function (connection) {
            return connection + 2;
        });
        addTwo.unshift(addTwo.pop());
        addTwo.unshift(addTwo.pop());
        return Player.placeTile(addTwo);
    };

    $scope.rotateTileCcw = function (tile) {
        var minusTwo = tile.map(function (connection) {
            return connection - 2;
        });
        minusTwo.push(minusTwo.shift());
        minusTwo.push(minusTwo.shift());
        return Player.placeTile(minusTwo);
    };

    // CMT: assuming we use new Game()
    // CMT: use player's and game's prototype function to place tile and then move all players
    $scope.placeTile = function (tile) {
        // TODO: send this state to firebase every time it's called


        $scope.player.placeTile(tile)
        $scope.game.moveAllplayers();

        if ($scope.game.checkOver()) {
            // TODO: need to tell the player she won
            $scope.winner = $scope.game.checkOver().winner;

            // TODO: make a gameOver function on Game contructor
            $scope.gameOver();

        } else {
            // CMT: draw one tile and push it to the player.tiles array
            $scope.player.tiles.push($scope.game.deck.deal(1))

            $scope.game.goToNextPlayer();
        }
    };

    // TODO: firebase game.players slice $scope.player out
    $scope.leaveGame;

    // TODO: do we remove this game room's moves from firebase?
    $scope.reset = $scope.game.reset;

})
