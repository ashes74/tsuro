tsuro.config(function ($stateProvider) {
    $stateProvider.state('gamelist', {
        url: '/gamelist',
        templateUrl: '/js/gamelist/gamelist.html',
        controller: 'gameList'
    });
});

tsuro.controller('gameList', function ($scope) {
    // TODO: get game list from firebase (?)
    $scope.gamelist = [];

    $scope.join = function (gameName) {
        // TODO: new Player() for this game room, need the uid or something from the auth;


        $state.go('game', {
            "gameName": gameName
        })
    }
});
