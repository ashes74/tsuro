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

	dealThree() {
		return this.tiles.splice(0, 3);
	}

	deal(num) {
		return this.tiles.splice(0, num);
	}

	reload(tiles) {
		while(tiles.length>0) {
			console.log(this.tiles.length-1);
			this.tiles.push(tiles.pop());
		}
		var temp = [];
		for (let i of this.tiles) i && temp.push(i);
		this.tiles = temp;
		delete window.temp;
		console.log(this.tiles);
		return this;
	}

	length(){
		return this.tiles.length
	}
}
