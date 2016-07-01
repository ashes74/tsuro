tsuro.config(function ($stateProvider) {
    $stateProvider.state('pickGame', {
        url: '/pickgame',
        templateUrl: '/browser/js/pickGame/pickGame.html',
        controller: 'pickGameCtrl'
    });
});

tsuro.controller('pickGameCtrl', function ($scope, $state, $firebaseArray, $firebaseObject) {
    var ref = firebase.database().ref();
    var obj = $firebaseObject(ref);


    $scope.createGame = function (gameName) {
        var gameNameRef = ref.child('games').child(gameName);
        var playersRef = gameNameRef.child('players');

        $firebaseArray(gameNameRef).$add({
            "gameName": gameName
        });

        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                var newPlayer = new Player(user.uid)
                $firebaseArray(playersRef).$add(newPlayer)
            } else {
                console.log("no one logged in")
            }
        })

        var tiles = [{
            id: 1,
            imageUrl: "",
            paths: [3, 4, 6, 0, 1, 7, 2, 5],
            rotation: 0
        }, {
            id: 2,
            imageUrl: "",
            paths: [1, 0, 4, 7, 2, 6, 5, 3],
            rotation: 0
        }, {
            id: 3,
            imageUrl: "",
            paths: [1, 0, 4, 6, 2, 7, 3, 5],
            rotation: 0
        }, {
            id: 4,
            imageUrl: "",
            paths: [2, 5, 0, 7, 6, 1, 4, 3],
            rotation: 0
        }, {
            id: 5,
            imageUrl: "",
            paths: [4, 2, 1, 6, 0, 7, 3, 5],
            rotation: 0
        }, {
            id: 6,
            imageUrl: "",
            paths: [1, 0, 5, 7, 6, 2, 4, 3],
            rotation: 0
        }, {
            id: 7,
            imageUrl: "",
            paths: [2, 4, 0, 6, 1, 7, 3, 5],
            rotation: 0
        }, {
            id: 8,
            imageUrl: "",
            paths: [2, 5, 0, 6, 7, 1, 3, 4],
            rotation: 0
        }, {
            id: 9,
            imageUrl: "",
            paths: [1, 0, 7, 6, 5, 4, 3, 2],
            rotation: 0
        }, {
            id: 10,
            imageUrl: "",
            paths: [4, 5, 6, 7, 0, 1, 2, 3],
            rotation: 0
        }, {
            id: 11,
            imageUrl: "",
            paths: [7, 2, 1, 4, 3, 6, 5, 0],
            rotation: 0
        }, {
            id: 12,
            imageUrl: "",
            paths: [2, 7, 0, 5, 6, 3, 4, 1],
            rotation: 0
        }, {
            id: 13,
            imageUrl: "",
            paths: [5, 4, 7, 6, 1, 0, 3, 2],
            rotation: 0
        }, {
            id: 14,
            imageUrl: "",
            paths: [3, 2, 1, 0, 7, 6, 5, 4],
            rotation: 0
        }, {
            id: 15,
            imageUrl: "",
            paths: [1, 0, 7, 4, 3, 6, 5, 2],
            rotation: 0
        }, {
            id: 16,
            imageUrl: "",
            paths: [1, 0, 5, 6, 7, 2, 3, 4],
            rotation: 0
        }, {
            id: 17,
            imageUrl: "",
            paths: [3, 5, 6, 0, 7, 1, 2, 4],
            rotation: 0
        }, {
            id: 18,
            imageUrl: "",
            paths: [2, 7, 0, 4, 3, 6, 5, 1],
            rotation: 0
        }, {
            id: 19,
            imageUrl: "",
            paths: [4, 3, 6, 1, 0, 7, 2, 5],
            rotation: 0
        }, {
            id: 20,
            imageUrl: "",
            paths: [2, 6, 0, 4, 3, 7, 1, 5],
            rotation: 0
        }, {
            id: 21,
            imageUrl: "",
            paths: [2, 3, 0, 1, 7, 6, 5, 4],
            rotation: 0
        }, {
            id: 22,
            imageUrl: "",
            paths: [2, 6, 0, 5, 7, 3, 1, 4],
            rotation: 0
        }, {
            id: 23,
            imageUrl: "",
            paths: [1, 0, 6, 4, 3, 7, 2, 5],
            rotation: 0
        }, {
            id: 24,
            imageUrl: "",
            paths: [3, 4, 7, 0, 1, 6, 5, 2],
            rotation: 0
        }, {
            id: 25,
            imageUrl: "",
            paths: [1, 0, 3, 2, 7, 6, 5, 4],
            rotation: 0
        }, {
            id: 26,
            imageUrl: "",
            paths: [1, 0, 6, 7, 5, 4, 2, 3],
            rotation: 0
        }, {
            id: 27,
            imageUrl: "",
            paths: [2, 4, 0, 7, 1, 6, 5, 3],
            rotation: 0
        }, {
            id: 28,
            imageUrl: "",
            paths: [4, 2, 1, 7, 0, 6, 5, 3],
            rotation: 0
        }, {
            id: 29,
            imageUrl: "",
            paths: [1, 0, 3, 2, 5, 4, 7, 6],
            rotation: 0
        }, {
            id: 30,
            imageUrl: "",
            paths: [2, 3, 0, 1, 6, 7, 4, 5],
            rotation: 0
        }, {
            id: 31,
            imageUrl: "",
            paths: [3, 6, 5, 0, 7, 2, 1, 4],
            rotation: 0
        }, {
            id: 32,
            imageUrl: "",
            paths: [1, 0, 6, 5, 7, 3, 2, 4],
            rotation: 0
        }, {
            id: 33,
            imageUrl: "",
            paths: [1, 0, 3, 2, 6, 7, 4, 5],
            rotation: 0
        }, {
            id: 34,
            imageUrl: "",
            paths: [4, 5, 7, 6, 0, 1, 3, 2],
            rotation: 0
        }, {
            id: 35,
            imageUrl: "",
            paths: [1, 0, 7, 5, 6, 3, 4, 2],
            rotation: 0
        }];

        var deck = new Deck(tiles).shuffle().tiles;
        var deckRef = ref.child('games').child(gameName).child('deck');
        $firebaseArray(deckRef).$add(deck);



        var initialMarkersRef = ref.child('games').child(gameName).child('availableMarkers');
        $firebaseArray(initialMarkersRef).$add(["red", "orange", "yellow", "green", "aqua", "blue", "navy", "purple"]);


        $state.go('game', {
            "gameName": gameName
        });
    };

    $scope.goToGameList = function () {
        $state.go('gamelist');
    };
});
