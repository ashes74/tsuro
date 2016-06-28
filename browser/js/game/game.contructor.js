'use strict';

//GAME///

class Game {
    constructor(name) {
        this.name = name;
        this.count = 35;
        this.board = new Board();
        // this.deck;
        this.players = [];
        this.availableMarkers = ["red", "orange", "yellow", "green", "aqua", "blue", "navy", "purple"]

        this.currPlayer; //index of the currentPlayer in the turnOrderArray
        this.turnOrderArray = [] //holds all the players still on the board.
        this.dragon = ""; // Player.Marker
        this.moves;
    }

    addPlayer(player) {
        this.players.length < 8 ? this.players.push(player) : throw new Error "Room full";
    };

    getCurrentPlayer() {
        if (this.currPlayer === -1) return;
        return this.turnOrderArray[this.currPlayer];
    };

    moveAllPlayers() {
        this.players.forEach((player) => player.keepMoving())
    };

    checkOver() {
        if (getCanPlay().length === 1) {
            var overObj = {
                "winner": getCanPlay()[0]
            }
        } else if (getCanPlay().length <= 1) {
            var overObj = {
                "winner": null
            }
            return overObj;
        } else {
            return false;
        }

    };

    // TODO: fill in this function
    gameOver() {

    };

    //to be called at the end of a turn to set the currPlayer to the next eligible player in the turnOrderArray
    goToNextPlayer() {
        if (getCanPlay(this.turnOrderArray).length > 1) {
            let newIdx = this.currPlayer + 1;
            while (!this.turnOrderArray[newIdx % 8].canPlay) {
                newIdx++;
            }
            this.currPlayer = newIdx;
        } else {
            this.currPlayer = -1
        }
        return this.getCurrentPlayer()
    };

    //restart the game
    reset() {
        this.players.forEach(player => {
            //retrieve all tiles
            //return player's tiles to the deck and shuffle
            this.deck.reload(player.tiles).shuffle();
            player.tiles = [];
            //reset all players playability
            player.canPlay = true;
        })
    }

}

/////END OF GAME CLASS/////

//get Eligible players
let getCanPlay = function (players) {
    return players.filter((player) => {
        return player.canPlay
    })
}
