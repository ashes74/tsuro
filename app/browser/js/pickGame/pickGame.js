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
        var markersRef = gameNameRef.child('availableMarkers');
        var markersArr = $firebaseArray(markersRef);
        var deckRef = gameNameRef.child('deck');
        var deckArr = $firebaseArray(deckRef);
        var currPlayerRef = gameNameRef.child('currPlayer');
        // Should be an array with only one number
        var currPlayerArr = $firebaseArray(currPlayerRef);

        $firebaseArray(gameNameRef).$add({
            "gameName": gameName
        });


        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                var newPlayer = {
                    uid: user.uid,
                    name: user.displayName
                };
                $firebaseArray(playersRef).$add(newPlayer);
            } else {
                console.log("no one logged in");
            }
        });

        var tiles = gameFactory.tiles;

        var deck = new Deck(tiles).shuffle().tiles;
        deckArr.$add(deck);

        initialMarkersArr.$add(["red", "pink", "yellow", "green", "jade", "sky", "ocean", "purple"]);
        currPlayerArr.$add([0]);


        $state.go('game', {
            "gameName": gameName
        });
    };

    $scope.goToGameList = function () {
        $state.go('gamelist');
    };
});
