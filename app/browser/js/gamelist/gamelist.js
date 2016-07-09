tsuro.config(function ($stateProvider) {
    $stateProvider.state('gamelist', {
        url: '/gamelist',
        templateUrl: '/browser/js/gamelist/gamelist.html',
        controller: 'gameList',
    });
});

tsuro.controller('gameList', function ($scope, firebaseUrl, $firebaseObject, $state, $firebaseAuth, $firebaseArray, $window) {
    //For synchronizingGameList...
    var ref = firebase.database().ref();
    var obj = $firebaseObject(ref);

    var auth = $firebaseAuth();
    var firebaseUser = auth.$getAuth();

    var synchRef = ref.child("games");
    var synchronizedArr = $firebaseArray(synchRef);

    var synchronizedObj = $firebaseObject(synchRef);

    // This returns a promise...you can.then() and assign value to $scope.variable
    // gamelist is whatever we are calling it in the angular html.
    firebase.auth().onAuthStateChanged(function (user) {
        synchronizedArr.$loaded()
            .then(function (games) {
                if (user) {
                    for (var i = 0; i < games.length; i++) {
                        if (games[i].players) {
                            var playerKey = Object.keys(games[i].players)[0];
                            games[i].index = i;
                            if (user.uid === games[i].players[playerKey].uid) {
                                games[i].myGame = true;
                            }
                        }

                        if (!games[i].gameName || !games[i].players) {
                            synchronizedArr.$remove(i);
                            console.log("revoming invalid games")
                        }
                    }
                }
                $scope.games = games
            })
    })

    synchRef.on('child_changed', function (snapshot) {
        console.log(snapshot.val())
        var game = snapshot.val();
        if (!game.gameName || !game.players) {
            $window.location.reload();
        }
    })

    $scope.delete = function (game) {
        synchronizedArr.$remove(game.index)
    }

    $scope.join = function (game) {
        var gameNameRef = ref.child('games').child(game.gameName);
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
                        "gameName": game.gameName
                    });
                });
        });
    };
});
