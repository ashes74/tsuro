'use strict';

var tsuro = require('angular').module('Tsuro', ['ui.router']);
tsuro.controller('gameCtrl', require('./game/game.controller'));
tsuro.factory('gameFactory', require('./game.factory'));
tsuro.factory('playerFactory', require('../../player/player.factory'));

tsuro.config(function ($urlRouterProvider, $locationProvider) {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    // $locationProvider.html5Mode(true);
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');
});
