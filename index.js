'use strict';
var angular = require('angular');
var Game = require('./game');

var tsuro = angular.module('tsuro', []);

tsuro.factory('GameFactory', function(){
	return {
			addPlayer: function (player){

			}
	}
})

tsuro.controller('GameController', function($scope, GameFactory){

	$scope.game = game;

	$scope.start = function(){
		$scope.currentPlayer = game.getCurrentPlayer();
		//enable the currentPlayer controls
	}

	$scope.placeTile = function (tile){
		$scope.currentPlayer.placeTile(tile);
		$scope.game.moveAllPlayers();
	}


})
