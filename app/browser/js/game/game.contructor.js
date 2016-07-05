'use strict';

//GAME///

class Game {
    constructor(name) {
        this.name = name;
        this.count = 35;
        this.board = new Board().drawBoard();
        this.players = [];
        this.availableMarkers = ["red", "orange", "yellow", "green", "aqua", "blue", "navy", "purple"]

        //index of the currentPlayer in the players
        this.currPlayer;
				this.deck;
        this.dragon = null;
        this.moves;
    }

    getCurrentPlayer() {
        if (this.currPlayer === -1) return;
        return this.players[this.currPlayer];
    }

		//moveAllPlayers removed because each person will listen to their next space and move themselves

    getDeadPlayerTiles() {
        var deadPlayersTiles = [];
        console.log(this.players)
        this.players.forEach(function (player) {
            if (!player.canPlay && player.tiles.length > 0) {
                deadPlayersTiles.push(player.tiles);
                isDeadPlayer = true;
            }
        });
        return deadPlayersTiles;
    }

    checkOver() {
        return this.getCanPlay().length <= 1;
    }

    //to be called at the end of a turn to set the currPlayer to the next eligible player in the players array;
    nextCanPlay() {
        if (this.getCanPlay().length > 1) {
            console.log(this.currPlayer, "currPlayer", "players", this.players)
            var newIdx = this.currPlayer + 1 >= this.players.length ? 0 : this.currPlayer + 1;
            console.log("newIdx", newIdx)
            while (newIdx < this.players.length && !this.players[newIdx].canPlay) {
                newIdx++;
                if (newIdx === this.players.length) newIdx = 0;
                console.log(newIdx)
            }
            this.currPlayer = newIdx;
        } else {
            this.currPlayer = -1;
        }
        return newIdx;
    }

    deal(num) {
        var tiles = [];
        for (var i = 0; i < num; i++) {
            var tile = this.deck[0].splice(0, 1);
            this.deck.$save(0).then(function (ref) {
                console.log('dealt a card!');
            });
            tiles = tiles.concat(tile);
            console.log(tiles)
        }
        return tiles;
    }

    getCanPlay() {
        return this.players.filter((player) => {
            return player.canPlay
        })
    }

}
