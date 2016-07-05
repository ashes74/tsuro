tsuro.config(function($stateProvider) {
    $stateProvider.state('pickGame', {
        url: '/pickgame',
        templateUrl: '/browser/js/pickGame/pickGame.html',
        controller: 'pickGameCtrl'
    });
});

tsuro.controller('pickGameCtrl', function($scope, $state, $firebaseArray, $firebaseObject, gameFactory) {
    var ref = firebase.database().ref();
    var obj = $firebaseObject(ref);

    $scope.createGame = function(gameName) {
        var gameRef = ref.child('games').child(gameName);
        var playersRef = gameRef.child('players');
        var deckRef = gameRef.child('deck');
        var deckArr = $firebaseArray(deckRef);
        var markersRef = gameRef.child('availableMarkers');
        var markersArr = $firebaseArray(markersRef);

        gameRef.set({
            'name': gameName,
            'currentPlayerIdx': 0
        });

        var tiles = gameFactory.tiles;
        var deck = new Deck(tiles).shuffle().tiles;

        markersArr.$add(gameFactory.markers);

        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                var newPlayer = new Player(user.uid);
                $firebaseArray(playersRef).$add(newPlayer);
            } else {
                console.log("no one logged in");
            }
        });

        deckArr.$add(deck).then(function() {
            $state.go('game', {
                "gameName": gameName
            });
        });
    };

    $scope.goToGameList = function() {
        $state.go('gamelist');
    };
});
