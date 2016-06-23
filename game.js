'use strict';
var _ = require('lodash');
//GAME///

function Game () {
	this.count = 35;
	this.board;
	this.players = [];
	this.activeSpace = [x,y] //The next space of the currentPlayer
	this.currPlayer;   //ask turn for next player
	this.deck = [];
	this.dragon = // Player.Marker
}

//initializeGame: Generate new game, shuffle deck
Game.prototype.initializeGame = function (numOfPlayers) {
	// Generate a board
	this.board = new Board();
	// -	Create Players
	this.players = new Array(numOfPlayers);
	// -	Shuffle deck
	// this.deck.shuffle();
	_.shuffle(this.deck)
	// -	Deal Tiles
	// TODO:  deal those tiles
};


//createPlayers - add players to game's player array
Game.prototype.createPlayers = function (arguments) {
	// 		Create turnOrderArray[player1, player2...]

	// - Players pick a start point on the board -> edge Point

	// - Next Player picks a different start point (i.e. points must be unique)
};
