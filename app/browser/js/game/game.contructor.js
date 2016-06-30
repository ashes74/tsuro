'use strict';

//GAME///

class Game {
    constructor(name) {
        this.name = name;
        this.count = 35;
        this.board = new Board().drawBoard();
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

    deadPlayers() {
        var deadPlayersTiles = [];
        this.players.forEach(function (player) {
            if (!player.canPlay && player.tiles.length > 0) {
                deadPlayersTiles.push(player.tiles);
                isDeadPlayer = true;
            }
        });
        return deadPlayersTiles;
    }

    checkOver() {
        return getCanPlay().length <= 1;
    }

    //to be called at the end of a turn to set the currPlayer to the next eligible player in the turnOrderArray
    goToNextPlayer() {
        if (getCanPlay(this.turnOrderArray).length > 1) {
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

    deal(num){
        var tiles = []
        for(var i = 0; i < num; i++){
            this.deck.$remove(0).then(function(data){
                console.log(data);
                tiles.push(data);
            });
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
let getCanPlay = function (players) {
    return players.filter((player) => {
        return player.canPlay
    })
}
