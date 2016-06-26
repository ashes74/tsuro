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
		this.currPlayer;   //index of the currentPlayer in the turnOrderArray
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
		if(this.currPlayer===-1) return;
		return this.turnOrderArray[this.currPlayer];
	}

	moveAllPlayers(){
		this.players.forEach((player)=>player.move())
	}

	//to be called at the end of a turn to set the currPlayer to the next eligible player in the turnOrderArray
	goToNextPlayer(){
		if (getCanPlay(this.turnOrderArray).length>1) {
			let newIdx = this.currPlayer+1;
			while (!this.turnOrderArray[newIdx%8].canPlay) {
				newIdx ++;
			}
			this.currPlayer = newIdx;
		}
		else {
			this.currPlayer= -1
		}
		return this.getCurrentPlayer()
	}

	//restart the game
	reset(){
		this.players.forEach(player=>{
			//retrieve all tiles
			//return player's tiles to the deck and shuffle
			this.deck.reload(player.tiles).shuffle();
			player.tiles=[];
			//reset all players playability
			player.canPlay = true;
			//TODO: are we assuming all people in the room want to play? Do we want watchers at all?

		})
	}

}
/////END OF GAME CLASS/////


//get Eligible players
let getCanPlay = function(players){
	return players.filter((player) => {return player.canPlay})
}

module.exports = Game
