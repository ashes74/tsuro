var tsuro = angular.module('Tsuro', ['ui.router'])

tsuro.config(function ($urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');
});
