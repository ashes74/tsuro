tsuro.config(function ($stateProvider) {
    $stateProvider.state('gamelist', {
        url: '/gamelist',
        templateUrl: '/js/gamelist/gamelist.html',
        controller: 'gameList',
        resolve: {
            allGames: function () {
                //lookup gamelist with players included
            }
        }
    });
});

tsuro.controller('gameList', function ($scope) {
    //inject game factory here!!!
    $scope.gamelist = [{
        name: 'best game ever',
        players: 'kimber, lori'
    }, {
        name: 'this game is awesome',
        players: 'taffy, jennifer, biru'
    }];
});
