var tsuro = angular.module('Tsuro', ['ui.router', 'firebase']);

tsuro.config(function() {
     var config = {
    apiKey: "AIzaSyCLm3jkk5ppMqeQxKoH-dZ9CdYMaDGWWqU",
    authDomain: "the-paths-of-dragons.firebaseapp.com",
    databaseURL: "https://the-paths-of-dragons.firebaseio.com",
    storageBucket: "the-paths-of-dragons.appspot.com",
  };
  firebase.initializeApp(config);
});

tsuro.constant('firebaseUrl', 'https://the-paths-of-dragons.firebaseio.com/');

tsuro.config(function ($urlRouterProvider, $locationProvider) {
    // remove '#' from urls
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/login');
    $urlRouterProvider.when('/', '/login');
});
