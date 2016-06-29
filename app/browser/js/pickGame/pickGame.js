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
    // obj.$loaded(function(data){
    //     console.log(data === obj);
    //     console.log(data);
    // });
    // var ref = new Firebase(firebaseUrl);
    $scope.test = "hi";
    $scope.createGame = function (gameName) {
        // var game = new Game(gameName);
        var deck = new Deck().shuffle;
        var initialDeckRef = ref.child('games').child(gameName).child('initialDeck');
        $firebaseArray(initialDeckRef).$add(deck).then(function(ref){
           
        })
        var initialMarkersRef = ref.child('games').child(gameName).child('availableMarkers')
        $firebaseArray(initialMarkersRef).$add(["red", "orange", "yellow", "green", "aqua", "blue", "navy", "purple"]);
        $state.go('game', {
            "gameName": gameName
        });
    };

    $scope.goToGameList = function () {
        $state.go('gamelist');
    };
});
