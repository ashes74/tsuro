'use strict';

class Deck {
	constructor(tiles) {
		this.tiles = tiles
	}

	shuffle() {
		this.tiles = _.shuffle(this.tiles)
		return this;
	}

	dealThree() {
		return this.tiles.splice(0, 3);
	}

	deal(num) {
		return this.tiles.splice(0, num);
	}

	reload(tiles) {
		for (var i = 0; i < tiles.length; i++) {
			this.tiles.push(tiles[i]);
		}
		return this;
	}
	
	length(){
		return this.tiles.length
	}
}
