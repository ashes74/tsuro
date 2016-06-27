tsuro.config(function ($stateProvider) {
    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: '/js/home/home.html'
        })
        .state('gameList', {
            url: '/gamelist',
            templateUrl: ''
        })
});

tsuro.controller('signIn', function ($scope) {
    // TODO: do auth here
})

var Game = require('../../game')
var Player = require('../player/player')

tsuro.controller('homeCtrl', function ($scope, $state, gameFactory, playerFactory) {

    $scope.createGame = function (gameName) {
        // TODO: new Game() then put in firebase, make gameFactory and playerFactory
        //  TODO: uid from auth
        var player = new Player(uid)
        var game = gameFactory.createGame(gameName)

        // TODO: put game.js into game.factory.js
        gameFactory.addMaster(player);

        // TODO: send this game model with player name to firebase;
        // also need to updat the players model with game # and Player properties

        $state.go("game", {
            "gameName": gameName
        })
    }

    $scope.goToGameList = function () {
        // TODO:
        // create user (sign in user, put in firebase)
        // what if the user is already in the firebase?
        $state.go("gameList")
    }

    // TODO: let people register
})
