'use strict';

class Deck {
	constructor(tiles) {
		this.tiles = tiles
	}


	shuffle() {
		console.log("tiles to be shuffled", this.tiles);
		this.tiles = _.shuffle(this.tiles).filter((item) => {return item!==undefined});
		console.log("tiles shuffled", this.tiles);
		return this;
	}

	deal(num) {
		let cardsToDeal = [];
		//splicing causes weird empty array slots that clutters the deck
		for (var i = 0; i < num; i++) {
			cardsToDeal.push(this.tiles.shift());
		}
		return cardsToDeal;
	}

	reload(tiles) {
		while(tiles.length>0) {
			this.tiles.push(tiles.pop())
		}
		return this;
	}

	length(){
		return this.tiles.length
	}
}
