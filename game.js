'use strict';
var _ = require('lodash');
var Deck = require('./deck');
//GAME///

class Game {
	constructor(){
		this.count = 35;
		this.board;
		this.players = [];
		// this.activeSpace = [x,y] //The next space of the currentPlayer
		this.currPlayer;   //ask turn for next player
		this.deck = new Deck ();
		this.turnOrderArray = [] //holds all the players still on the board.
		this.dragon = "";// Player.Marker
	}

	//initializeGame: Generate new game, shuffle deck
	// IDEA: numOfPlayers is if we initializeGame with a choose number of players option
	//XXX: Should we dynamically createPlayers? SEE: initializePlayers
	initializeGame(numOfPlayers) {
		// Generate a board
		this.board = new Board();
		// -	Create Players
		this.players = new Array(numOfPlayers);
		// -	Shuffle deck
		// this.deck.shuffle();
		this.deck.shuffle();
		// -	Deal Tiles
		// TODO:  deal those tiles
	};

	//createPlayers - add players to game's player array
	// function[players: Array] -> return turnOrderArray
//IDEA:  have an elimination flag on players and filter by them
//TODO: how are we doing the placement of a marker
	initializePlayers(players) {
		this.players = players;
		// - Players pick a start point on the board -> edge Point
		this.turnOrderArray = getCanPlay(this.players);
		// - Next Player picks a different start point (i.e. points must be unique)
	};

	//Run the game
	play(){
		//while more than 1 player on board and deck non empty -> play
		var idx = 0; //turn pointer
		while (this.turnOrderArray.length>1 || this.deck.length>0){
			this.currPlayer = this.turnOrderArray[idx];
			//TODO: game mechanics
			//move through turn array, wrap around when get to end
			idx = (idx+1)%this.turnOrderArray.length
		}
	}

	getCurrentPlayer(){
		return this.currPlayer;
	}


}


//get Eligible players
let getCanPlay = function(players){
	players.filter((player) => {return player.canPlay})
}

module.exports = Game
