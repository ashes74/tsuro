'use strict';
var _ = require('lodash');

class Deck {
	constructor(tiles) {
		this.tiles = tiles
	}

	shuffle(){
		this.tiles =	_.shuffle(this.tiles)
	}

	dealThree(){
		return this.tiles.splice(0,3);
	}

	deal(num){
		return this.tiles.splice(0, num);
	}
}

module.exports = Deck
