'use strict';

class Deck {
	constructor(tiles) {
		this.tiles = tiles
	}

	shuffle() {
		this.tiles = _.shuffle(this.tiles).filter((item) => {return item!==undefined});
		return this;
	}

	dealThree() {
		return this.tiles.splice(0, 3);
	}

	deal(num) {
		return this.tiles.splice(0, num);
	}

	reload(tiles) {
		while(tiles.length>0) {
			this.tiles.push(tiles.pop());
		}
		var temp = [];
		for (let i of this.tiles) i && temp.push(i);
		this.tiles = temp;
		delete window.temp;
		return this;
	}

	length(){
		return this.tiles.length
	}
}
