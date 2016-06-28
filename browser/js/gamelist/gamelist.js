tsuro.config(function ($stateProvider) {
    $stateProvider.state('gamelist', {
        url: '/gamelist',
        templateUrl: '/js/gamelist/gamelist.html',
        controller: 'gameList',
    });
});

tsuro.controller('gameList', function ($scope, firebaseUrl, $firebaseObject) {
    //For synchronizingGameList...
    var synchRef = new Firebase(firebaseUrl + games);
    var synchronizedObj = $firebaseObject(synchRef);
    //This returns a promise... you can .then() and assign value to $scope.variable
    synchronizedObj.$bindTo($scope, gamelist); //data is whatever we are calling it in the angular html.    

    $scope.join = function (gameName) {
        $state.go('game', {"gameName": gameName});
    };
});
