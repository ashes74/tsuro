'use strict';

//GAME///

class Game {
    constructor(name) {
        this.name = name;
        this.count = 35;
        this.board = makeBoard() // .drawBoard();  now called in constructor
        this.players = [];
        this.availableMarkers = ["red", "orange", "yellow", "green", "aqua", "blue", "navy", "purple"]

        this.currPlayer; //index of the currentPlayer in the turnOrderArray
        this.turnOrderArray = [] //holds all the players still on the board.
        this.dragon = ""; // Player.Marker
        this.moves;
    }

    getCurrentPlayer() {
        if (this.currPlayer === -1) return;
        return this.turnOrderArray[this.currPlayer];
    }

    moveAllPlayers() {
        this.players.forEach((player) => player.keepMoving(player))
    }

    deadPlayersTiles() {
        return _.flatMap(this.players, player => player.canPlay ? [] : player.tiles)
    }

    checkOver() {
        return this.alive.length <= 1;
    }

    get alive() {
        return this.players.filter(player => player.canPlay);
    }

    //to be called at the end of a turn to set the currPlayer to the next eligible player in the turnOrderArray
    goToNextPlayer() {
        if (this.alive.length > 1) {
            let newIdx = this.currPlayer + 1;
            while (!this.turnOrderArray[newIdx % 8].canPlay) {
                newIdx++;
            }
            this.currPlayer = newIdx;
        } else {
            this.currPlayer = -1;
        }
        return this.getCurrentPlayer();
    }

    deal(num) {
        var tiles = [];
        for (var i = 0; i < num; i++) {
            // Where does deck come from? ~ ak
            var tile = this.deck[0].splice(0, 1);
            this.deck.$save(0).then(function (ref) {
                console.log('dealt a card!');
            });
            tiles = tiles.concat(tile);
            console.log(tiles)
        }
        return tiles;
    }

    //restart the game
    reset() {
        this.players.forEach(player => {
            //retrieve all tiles
            //return player's tiles to the deck and shuffle
            this.deck.reload(player.tiles).shuffle();
            player.tiles = [];
            //reset all players playability
            player.canPlay = true;
        });
    }

}

/////END OF GAME CLASS/////

//get Eligible players
// What is this doing out here? ~ ak
let getCanPlay = function (players) {
    return players.filter((player) => {
        return player.canPlay
    })
}
