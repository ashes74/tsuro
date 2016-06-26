tsuro.config(function ($stateProvider) {
    $stateProvider.state('game', {
        url: '/game/',
        templateUrl: '/js/game/game.html',
        controller: 'gameCtrl',
    });
});
