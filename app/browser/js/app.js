var tsuro = angular.module('Tsuro', ['ui.router', 'firebase']);

tsuro.constant('firebaseUrl', 'https://path-of-the-dragon.firebaseio.com/');

tsuro.config(function ($urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
});
