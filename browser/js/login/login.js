tsuro.config(function ($stateProvider) {
    $stateProvider.state('login', {
        url: '/login',
        templateUrl: '/js/login/login.html',
        controller: 'loginCtrl'
    })
})

tsuro.controller('loginCtrl', function ($scope) {
    // TODO: write login function with firebase
    $scope.login = function () {

    };

    // TODO: get user from auth
    $scope.user;
})
