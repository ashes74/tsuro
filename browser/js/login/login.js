tsuro.config(function ($stateProvider) {
    $stateProvider.state('login', {
        url: '/login',
        templateUrl: '/js/login/login.html',
        controller: 'loginCtrl'
    })
})

tsuro.controller('loginCtrl', function ($scope) {

})
