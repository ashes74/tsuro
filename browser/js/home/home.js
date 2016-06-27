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

tsuro.controller('homeCtrl', function ($scope, $state, gameFactory, playerFactory) {
    $scope.createGame = function () {
        // TODO: new Game() then put in firebase, make gameFactory and playerFactory
        var player = playerFactory.createPlayer(username);
        var game = gameFactory.createGame($scope.game.name)

        // TODO: put game.js into game.factory.js
        gameFactory.addMaster(player);

        // TODO: send this game model with player name to firebase;
        // also need to updat the players model with game # and Player properties

        $state.go("game", {
            "gameName": $scope.game.name
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
