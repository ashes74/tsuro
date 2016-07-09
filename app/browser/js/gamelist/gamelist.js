tsuro.config(function ($stateProvider) {
    $stateProvider.state('gamelist', {
        url: '/gamelist',
        templateUrl: '/browser/js/gamelist/gamelist.html',
        controller: 'gameList',
    });
});

tsuro.controller('gameList', function ($scope, firebaseUrl, $firebaseObject, $state, $firebaseAuth, $firebaseArray) {
    //For synchronizingGameList...
    var ref = firebase.database().ref();
    var obj = $firebaseObject(ref);

    var auth = $firebaseAuth();
    var firebaseUser = auth.$getAuth();

    var synchRef = ref.child("games");
    var synchronizedArr = $firebaseArray(synchRef);


    // This returns a promise...you can.then() and assign value to $scope.variable
    // gamelist is whatever we are calling it in the angular html.
    firebase.auth().onAuthStateChanged(function (user) {
        synchronizedArr.$loaded()
            .then(function (games) {
                if (user) {
                    for (var i = 0; i < games.length; i++) {
                        var playerKey = Object.keys(games[i].players)[0];
                        games[i].index = i;
                        if (user.uid === games[i].players[playerKey].uid) {
                            games[i].myGame = true;
                        }
                    }
                }
                $scope.games = games
                console.log($scope.games)
            })
    })

    $scope.delete = function (game) {
        synchronizedArr.$remove(game.index)
    }

    $scope.join = function (gameName) {
        var gameNameRef = ref.child('games').child(gameName);
        var playersRef = gameNameRef.child('players');
        var firebasePlayersArr = $firebaseArray(playersRef);

        firebase.auth().onAuthStateChanged(function (user) {

            firebasePlayersArr.$loaded().then(function (data) {
                    var FBplayers = data;

                    if (user) {
                        if (!FBplayers.filter(function (player) {
                                return player.uid === user.uid;
                            }).length) {
                            var newPlayer = {
                                uid: user.uid,
                                name: user.displayName
                            };
                            firebasePlayersArr.$add(newPlayer);
                        }
                    } else {
                        // No user is signed in.
                        console.log("nothing");
                    }
                })
                .then(function () {
                    $state.go('game', {
                        "gameName": gameName
                    });
                });
        });
    };
});
