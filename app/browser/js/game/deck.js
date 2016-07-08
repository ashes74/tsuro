'use strict';

class Deck {
    constructor(tiles) {
        this.tiles = tiles
    }

    shuffle() {
        console.log("tiles to be shuffled", this.tiles);
        console.log(_.shuffle(this.tiles));
        this.tiles = _.shuffle(this.tiles);
        console.log("tiles shuffled", this.tiles);
        return this;

    }

    dealThree() {
        return this.tiles.splice(0, 3);
    }

    deal(num) {
        console.log(`attempting to deal`);
        let newTiles = this.tiles.splice(0, num);
        console.log(`returning ${newTiles}`, newTiles);
        console.log('dealt a card!');

        return newTiles;
    }

    reload(tiles) {
        for (var i = 0; i < tiles.length; i++) {
            this.tiles.push(tiles[i]);
        }
        return this
    }

    length() {
        return this.tiles.length
    }
}