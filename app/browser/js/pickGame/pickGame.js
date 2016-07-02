tsuro.config(function ($stateProvider) {
    $stateProvider.state('pickGame', {
        url: '/pickgame',
        templateUrl: '/browser/js/pickGame/pickGame.html',
        controller: 'pickGameCtrl'
    });
});

tsuro.controller('pickGameCtrl', function ($scope, $state, $firebaseArray, $firebaseObject, gameFactory) {
    var ref = firebase.database().ref();
    var obj = $firebaseObject(ref);


    $scope.createGame = function (gameName) {
        var gameNameRef = ref.child('games').child(gameName);
        var playersRef = gameNameRef.child('players');
        var initialMarkersRef = gameNameRef.child('availableMarkers');
        var initialMarkersArr = $firebaseArray(initialMarkersRef);
        var deckRef = gameNameRef.child('deck');
        var deckArr = $firebaseArray(deckRef);

        $firebaseArray(gameNameRef).$add({
            "gameName": gameName
        });

        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                var newPlayer = new Player(user.uid);
                $firebaseArray(playersRef).$add(newPlayer);
            } else {
                console.log("no one logged in");
            }
        });

        var tiles = gameFactory.tiles;

        var deck = new Deck(tiles).shuffle().tiles;
        deckArr.$add(deck);

        initialMarkersArr.$add(["red", "orange", "yellow", "green", "aqua", "blue", "navy", "purple"]);

        $state.go('game', {
            "gameName": gameName
        });
    };

    $scope.goToGameList = function () {
        $state.go('gamelist');
    };
});
