'use strict';

class Deck {
    constructor(tiles) {
        this.tiles = tiles
    }

    shuffle() {
        console.log("tiles shuffle", this.tiles)
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
        this.tiles.push(tiles)
        return this;
    }
}
