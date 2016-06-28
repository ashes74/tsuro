var tsuro = angular.module('Tsuro', ['ui.router', 'firebase']);

tsuro.config(function ($urlRouterProvider, $locationProvider) {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    // $locationProvider.html5Mode(true);
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');
});

tsuro.constant('fb',{
	url: "https://path-of-the-dragon.firebaseio.com"
});