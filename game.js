'use strict';
var _ = require('lodash');
var Deck = require('./deck');
var Player = require('./player');
//GAME///

class Game {
	constructor(){
		this.count = 35;
		this.board = new Board();
		this.players = [];
		this.activeSpace = [x,y] //The next space of the currentPlayer
		this.currPlayer;   //ask turn for next player
		this.deck = new Deck().shuffle();
		this.turnOrderArray = [] //holds all the players still on the board.
		this.dragon = "";// Player.Marker
	}

	addPlayer(player) {
		this.players.length < 8 ? this.players.push(player): throw new Error "Room full" ;
	};

	// //Run the game
	// run(){
	// 	this.turnOrderArray = getCanPlay(this.players);
	// 	//while more than 1 player on board and deck non empty -> play
	// 	var idx = 0; //turn pointer
	// 	while (count > 0 && this.turnOrderArray.length>1){
	// 		this.currPlayer = this.turnOrderArray[idx];
	// 		//TODO: game mechanics
	//
	// 		//move through turn array, wrap around when get to end
	// 		idx = (idx+1)%this.turnOrderArray.length
	// 		count --;
	// 	}
	// }

	//start with the players in the room
	start(players){
		// add players to the game
		players.forEach((player)=>{
			this.addPlayer(player)
		})
		//find all that can play
		this.turnOrderArray = getCanPlay(this.players)
		//for each player dealThree
		this.turnOrderArray.forEach((player)=>{
			player.tiles = this.deck.dealThree();
		})

		//TODO: how are we setting game master or player one?
	}

	getCurrentPlayer(){
		return this.currPlayer;
	}

	moveAllPlayers(){
		this.players.forEach((player)=>player.move())
	}

	nextPlayer(){

	}

	//restart the game
	reset(){
		//retrieve all tiles
		this.players.forEach(player=>{
			//return player's tiles to the deck and shuffle
			this.deck.reload(player.tiles).shuffle();
			player.tiles=[];
			//reset all players playability
			player.canPlay = true;

		})
	}

}
/////END OF GAME CLASS/////


//get Eligible players
let getCanPlay = function(players){
	players.filter((player) => {return player.canPlay})
}

module.exports = Game
