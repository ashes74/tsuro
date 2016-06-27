'use strict';

tsuro.controller('gameCtrl', function ($scope, gameFactory, playerFactory, game, player) {
    // resolved from game state, pulled from firebase
    $scope.game = game


    $scope.deck = game.deck;
    $scope.players = game.players;
    $scope.master = game.master;

    // resolved by game state based on login info
    $scope.player = player;

    $scope.availableMarkers = game.availableMarkers;

    $scope.pickMarker = function (marker) {
        $scop.player.marker = marker;
        // TODO: send this info to firebase game, remove the marker from availableMarkers
    };

    $scope.placeMarker = playerFactory.placeMarker;

    // the index of players (should include this player's nextSpace)
    $scope.currentPlayer = gameFactory.getCurrentPlayer();

    $scope.dragon = game.dragon;

    // holds all the players still on the board.
    $scope.turnOrderArray = gameFactory.getCanPlay();


    $scope.start = function () {
        $scope.turnOrderArray.forEach(function (player) {
            player.tiles = $scope.deck.dealThree()
        })
    }

    // either have buttons that let players rotate the tile, or let them drag the tile in CW or CCW
    $scope.rotateTileCw = playerFactory.rotateTileCw;
    $scope.rotateTileCcw = playerFactory.rotateTileCcw;

    $scope.myTurn = function () {
        $scope.player === $scope.currentPlayer;
    };

    // after placing tile, this function will move all players in the same function.
    $scope.placeTile = function () {
        playerFactory.placeTile();
        // TODO: move keepMoving to gameFty:
        gameFactory.moveAllPlayers();

        // TODO: checkOver() check game.getCanPlay.length <= 1

        // TODO: drawOne();
        gameFactory.goToNextPlayer();
    };

    // TODO: game.players slice $scope.player out
    $scope.leave;
    $scope.reset;

    // can we use this to set the player.nextSpace?
    $scope.spaces = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];

    $scope.starttop = [
        [0, 0, 0],
        [0, 0, 1],
        [1, 0, 0],
        [1, 0, 1],
        [2, 0, 0],
        [2, 0, 1],
        [3, 0, 0],
        [3, 0, 1],
        [4, 0, 0],
        [4, 0, 1],
        [5, 0, 0],
        [5, 0, 1]
    ];
    $scope.startleft = [
        [0, 0, 7],
        [0, 0, 6],
        [0, 1, 7],
        [0, 1, 6],
        [0, 2, 7],
        [0, 2, 6],
        [0, 3, 7],
        [0, 3, 6],
        [0, 4, 7],
        [0, 4, 6],
        [0, 5, 7],
        [0, 5, 6]
    ];
    $scope.startbottom = [
        [0, 5, 0],
        [0, 5, 1],
        [1, 5, 0],
        [1, 5, 1],
        [2, 5, 0],
        [2, 5, 1],
        [3, 5, 0],
        [3, 5, 1],
        [4, 5, 0],
        [4, 5, 1],
        [5, 5, 0],
        [5, 5, 1]
    ];
    $scope.startright = [
        [5, 0, 2],
        [5, 0, 3],
        [5, 1, 2],
        [5, 1, 3],
        [5, 2, 2],
        [5, 2, 3],
        [5, 3, 2],
        [5, 3, 3],
        [5, 4, 2],
        [5, 4, 3],
        [5, 5, 2],
        [5, 5, 3]
    ];


});

var spaces = new Array(36);
