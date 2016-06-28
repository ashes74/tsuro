tsuro.config(function ($stateProvider) {
    $stateProvider.state('pickGame', {
        url: '/pickgame',
        templateUrl: '/js/pickGame/pickGame.html',
        controller: 'pickGameCtrl'
    })
})

tsuro.controller('pickGameCtrl', function ($scope, $state) {
    // TODO: write createGame function with firebase
    $scope.createGame = function (gameNmae) {
        // TODO: create player and add as master for this new game

        // TODO: game = new Game(gameName)

        $state.go('game', {
            "gameName": gameName
        })

    };

    // TODO: create player for the game (?)
    $scope.goToGameList = function () {
        $state.go('gamelist')
    }
})
