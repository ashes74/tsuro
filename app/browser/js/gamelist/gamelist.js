tsuro.config(function ($stateProvider) {
    $stateProvider.state('gamelist', {
        url: '/gamelist',
        templateUrl: '/browser/js/gamelist/gamelist.html',
        controller: 'gameList',
    });
});

tsuro.controller('gameList', function ($scope, firebaseUrl, $firebaseObject, $state) {
    //For synchronizingGameList...
    var ref = firebase.database().ref();
    var obj = $firebaseObject(ref);

    var synchRef = ref.child("games");
    console.log(synchRef);

    var synchronizedObj = $firebaseObject(synchRef);
    console.log(synchronizedObj)

    // This returns a promise...you can.then() and assign value to $scope.variable
    // gamelist is whatever we are calling it in the angular html.
    synchronizedObj.$bindTo($scope, "gamelist")
        .then(function () {
            var gamelist = []
            for (var i in $scope.gamelist) {
                gamelist.push([i, $scope.gamelist[i]])
            }
            $scope.gameNames = gamelist.slice(2);
        })


    $scope.join = function (gameName) {
        console.log(gameName)
        $state.go('game', {
            "gameName": gameName
        });
    };
});
