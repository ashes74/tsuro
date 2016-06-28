tsuro.config(function ($stateProvider) {
    $stateProvider.state('pickGame', {
        url: '/pickgame',
        templateUrl: '/js/pickGame/pickGame.html',
        controller: 'pickGameCtrl'
    });
});

tsuro.controller('pickGameCtrl', function ($scope, $state, $firebaseAuth, firebaseUrl) {
    var ref = new Firebase(firebaseUrl);
    
    $scope.createGame = function (gameName) {
        // var game = new Game(gameName);
        var deck = new Deck().shuffle;
        ref.child('games').child(gameName).child('initialDeck').push(deck);
        ref.child('games').child(gameName).child('availableMarkers').push(["red", "orange", "yellow", "green", "aqua", "blue", "navy", "purple"])       
        $state.go('game', {"gameName": gameName});
    };

    $scope.goToGameList = function () {
        $state.go('gamelist');
    };
});
