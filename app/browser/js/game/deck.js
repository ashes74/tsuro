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
			//TODO: add firebase sync functions
        let newTiles= this.tiles.splice(0, num);
				this.tiles.$save(0).then(function (ref) {
						console.log('dealt a card!');
				});
				return newTiles;
    }

    reload(tiles) {
        this.tiles.concat(tiles)
        return this;
    }

		length(){
			return this.tiles.length
		}

}
