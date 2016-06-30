'use strict';


/// AI player
class AI {
	constructor() {
		this.player = new Player();

	}
}


///AI action
/*
* Constructs an action that the ai player could make
* @param possiblePoint[point]: the point that the ai player would be on
* action = placing a tile in a specified orientation
*/

class AIAction {
	constructor(possibleTile) {
		// the position that the board that a player would move to
		this.newTile = possibleTile;
		// the minimax value of the state of the board if the ai player moved to tne new point
		this.minimaxVal = 0
	}

	//should we add a state class to do all the checking?
	applyTo(space){
		var next = new State(space);
		next.placeTile
	}


}

//AI
class AI {
	constructor(level, player) {
		this.levelOfIntelligence = level;
		this.player = player;
		this.space = player.nextSpace;
	}

	//returns the value of playing a tile in a particular orientation
	minimaxValue(tile){
		//test different orientations of the tile in a space


	}

	makeATameMove(tile){

	}

	makeASuperiorMove(tile){

	}

	makeAMaliciousMove(tile){

	}

	notify(){
		switch (levelOfIntelligence) {
			case "tame":makeATameMove();break;
			case "superior":makeASuperiorMove(); break;
			case "malicious":makeAMaliciousMove(); break;
		}
	}


}





///State - represent a certain configuration of the board
//purpose - a way to see who dies if a particular move is made
// important factors - game.getCanPlay() array, point.travelled, point.edge
class State {
	constructor(space) {
		this.space = space;
		this.result = "still running"
	}


	testTile(tile){

	}


}
