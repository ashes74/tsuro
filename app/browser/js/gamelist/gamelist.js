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
    var synchronizedObj = $firebaseObject(synchRef);

    // This returns a promise...you can.then() and assign value to $scope.variable
    // gamelist is whatever we are calling it in the angular html.
    synchronizedObj.$bindTo($scope, "gamelist")
        .then(function () {
            var gamelist = [];
            for (var i in $scope.gamelist) {
                gamelist.push([i, $scope.gamelist[i]]);
            }
            $scope.gameNames = gamelist.slice(2);
        });


    $scope.join = function (gameName) {
        var gameNameRef = ref.child('games').child(gameName);
        var playersRef = gameNameRef.child('players');

        var playerArr = $firebaseArray(playersRef);
        playerArr.$loaded()
            .then(function (players) {
                //check if I am already a player in this game
                //if I am a new player, add me to the players array in firebase
                if (players.filter(player => player.uid === firebaseUser.uid).length === 0) {
                    var newPlayer = new Player(firebaseUser.uid);
                    $firebaseArray(playersRef).$add(newPlayer);
                }
                $state.go('game', { "gameName": gameName });
            });

    };
});
