'use strict';

class Game {
    constructor(name) {
        this.name = name;
        this.count = 35;
        this.board = new Board().drawBoard();
        this.players = [];
        this.availableMarkers = ["red", "pink", "yellow", "green", "jade", "sky", "ocean", "purple"];
        this.currentPlayerIndex; //index of the currentPlayer in the players
        this.deck = new Deck();
        this.dragon = null;
        this.moves;
    }

    getCurrentPlayer() {
        if (this.currentPlayerIndex === -1) return;
        return this.players[this.currentPlayerIndex];
    }

    moveAllPlayers() {
        this.players.forEach((player) => player.keepMoving(player))
    }

    getDeadPlayerTiles() {
        var deadPlayersTiles = [];
        this.players.forEach(function(player) {

            if (!player.canPlay && player.tiles.length > 0 && player.tiles.length < 3) {
                deadPlayersTiles.concat(player.tiles);
            }
        });
        return deadPlayersTiles;
    }

    checkOver(spaceArr) {
        return this.getCanPlay().length <= 1;
    }

    //Called at the end of a turn to set the currentPlayerIndex to the next eligible player in the players array
    nextCanPlay() {
        if (this.getCanPlay().length === 1) return -1;
        var newIdx = this.currentPlayerIndex + 1 >= this.players.length ? 0 : this.currentPlayerIndex + 1;
        while (newIdx < this.players.length && !this.players[newIdx].canPlay) {
            newIdx++;
            if (newIdx === this.players.length) newIdx = 0;
        }
        this.currentPlayerIndex = newIdx;
        return this.currentPlayerIndex;
    }

    deal(num) {
        return this.deck.deal(num);
    }

    getCanPlay() {
        return this.players.filter((player) => {
            return player.canPlay
        })
    }
}