tsuro.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: '/js/home/home.html'
    });
});

tsuro.controller('homeCtrl', function ($scope) {
    $scope.createGame = function () {
        // new Game() then put in firebase 
    }
})
