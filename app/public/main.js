'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var tsuro = angular.module('Tsuro', ['ui.router', 'firebase']);

tsuro.config(function () {
    var config = {
        apiKey: "AIzaSyCLm3jkk5ppMqeQxKoH-dZ9CdYMaDGWWqU",
        authDomain: "the-paths-of-dragons.firebaseapp.com",
        databaseURL: "https://the-paths-of-dragons.firebaseio.com",
        storageBucket: "the-paths-of-dragons.appspot.com"
    };
    firebase.initializeApp(config);
});

tsuro.constant('firebaseUrl', 'https://path-of-the-dragon.firebaseio.com/');

tsuro.config(function ($urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
});

function Board() {
    this.board = [];
}

Board.prototype.drawBoard = function () {
    for (var y = 0; y < 6; y++) {
        if (!this.board[y]) this.board[y] = [];
        for (var x = 0; x < 6; x++) {
            this.board[y].push(new Space(x, y, this.board));
        }
    }
    return this.board;
};

function Space(x, y, board) {
    this.x = x;
    this.y = y;
    this.tile = "n";
    this.points = [null, null, null, null, null, null, null, null];

    for (var i = 0; i < 8; i++) {
        var corresponding = void 0;

        if (i < 2) {
            //top
            corresponding = i === 0 ? 5 : 4; // 0 -> 5 & 1 -> 4
            if (y === 0) this.points[i] = new Point(true, [{
                x: x,
                y: y,
                i: i
            }]);else {
                this.points[i] = board[y - 1][x].points[corresponding];
            }
        } else if (i < 4) {
            //right
            corresponding = i === 2 ? 7 : 6;
            if (x === 5) this.points[i] = new Point(true, [{
                x: x,
                y: y,
                i: i
            }]);else {
                this.points[i] = new Point(false, [{
                    x: x,
                    y: y,
                    i: i
                }, {
                    x: x + 1,
                    y: y,
                    i: corresponding
                }]);
            }
        } else if (i < 6) {
            //bottom
            corresponding = i === 4 ? 1 : 0;
            if (y === 5) this.points[i] = new Point(true, [{
                x: x,
                y: y,
                i: i
            }]);else {
                this.points[i] = new Point(false, [{
                    x: x,
                    y: y,
                    i: i
                }, {
                    x: x,
                    y: y + 1,
                    i: corresponding
                }]);
            }
        } else {
            //left
            corresponding = i === 6 ? 3 : 2; // 6 -> 3 & 7 -> 2
            if (x === 0) this.points[i] = new Point(true, [{
                x: x,
                y: y,
                i: i
            }]);else {
                this.points[i] = board[y][x - 1].points[corresponding];
            }
        }
    }
}

// edge = boolean
function Point(edge, space) {
    this.edge = edge;
    this.neighbors = ["n"];
    this.travelled = false;
    this.spaces = space;
}

'use strict';

var Deck = function () {
    function Deck(tiles) {
        _classCallCheck(this, Deck);

        this.tiles = tiles;
    }

    _createClass(Deck, [{
        key: 'shuffle',
        value: function shuffle() {
            this.tiles = _.shuffle(this.tiles);
            return this;
        }
    }, {
        key: 'dealThree',
        value: function dealThree() {
            return this.tiles.splice(0, 3);
        }
    }, {
        key: 'deal',
        value: function deal(num) {
            return this.tiles.splice(0, num);
        }
    }, {
        key: 'reload',
        value: function reload(tiles) {
            this.tiles.push(tiles);
            return this;
        }
    }]);

    return Deck;
}();

'use strict';

//GAME///

var Game = function () {
    function Game(name) {
        _classCallCheck(this, Game);

        this.name = name;
        this.count = 35;
        this.board = new Board().drawBoard();
        this.players = [];
        this.availableMarkers = ["red", "orange", "yellow", "green", "aqua", "blue", "navy", "purple"];

        //index of the currentPlayer in the players
        this.currPlayer;

        this.dragon = null;
        this.moves;
    }

    _createClass(Game, [{
        key: 'getCurrentPlayer',
        value: function getCurrentPlayer() {
            if (this.currPlayer === -1) return;
            return this.players[this.currPlayer];
        }
    }, {
        key: 'moveAllPlayers',
        value: function moveAllPlayers() {
            this.players.forEach(function (player) {
                return player.keepMoving(player);
            });
        }
    }, {
        key: 'deadPlayers',
        value: function deadPlayers() {
            var deadPlayersTiles = [];
            this.players.forEach(function (player) {
                if (!player.canPlay && player.tiles.length > 0) {
                    deadPlayersTiles.push(player.tiles);
                    isDeadPlayer = true;
                }
            });
            return deadPlayersTiles;
        }
    }, {
        key: 'checkOver',
        value: function checkOver() {
            return this.getCanPlay().length <= 1;
        }

        //to be called at the end of a turn to set the currPlayer to the next eligible player in the players array;

    }, {
        key: 'goToNextPlayer',
        value: function goToNextPlayer() {
            if (this.getCanPlay().length > 1) {
                console.log(this.currPlayer, "currPlayer", "players", this.players);
                var newIdx = this.currPlayer + 1 >= this.players.length ? 0 : this.currPlayer + 1;
                console.log("newIdx", newIdx);
                while (newIdx < this.players.length && !this.players[newIdx].canPlay) {
                    newIdx++;
                    if (newIdx === this.players.length) newIdx = 0;
                    console.log(newIdx);
                }
                this.currPlayer = newIdx;
            } else {
                this.currPlayer = -1;
            }
            return this.getCurrentPlayer();
        }
    }, {
        key: 'deal',
        value: function deal(num) {
            var tiles = [];
            for (var i = 0; i < num; i++) {
                var tile = this.deck[0].splice(0, 1);
                this.deck.$save(0).then(function (ref) {
                    console.log('dealt a card!');
                });
                tiles = tiles.concat(tile);
                console.log(tiles);
            }
            return tiles;
        }
    }, {
        key: 'getCanPlay',
        value: function getCanPlay() {
            return this.players.filter(function (player) {
                return player.canPlay;
            });
        }
    }]);

    return Game;
}();

tsuro.config(function ($stateProvider) {
    $stateProvider.state('game', {
        url: '/game/:gameName',
        templateUrl: '/browser/js/game/game.html',
        controller: 'gameCtrl'
    });
});

tsuro.controller('gameCtrl', function ($scope, $firebaseAuth, firebaseUrl, $stateParams, $firebaseObject, $firebaseArray, $state) {

    var ref = firebase.database().ref();
    var obj = $firebaseObject(ref);

    var gameRef = ref.child('games').child($stateParams.gameName);
    var gameArr = gameRef.child($stateParams.gameName);

    var initialDeckRef = ref.child('games').child($stateParams.gameName).child('initialDeck');
    var initialDeckArr = $firebaseArray(initialDeckRef);

    var deckRef = gameRef.child('deck');
    var deckArr = $firebaseArray(deckRef);

    var playersRef = gameRef.child('players');
    var firebasePlayersArr = $firebaseArray(playersRef);

    var markersRef = gameRef.child('availableMarkers');
    var markersArr = $firebaseArray(markersRef);

    var movesRef = gameRef.child('moves');
    var movesArr = $firebaseArray(movesRef);

    var boardRef = gameRef.child('board');
    var boardArr = $firebaseArray(boardRef);

    var player = Object.create(Player.prototype);

    /****************
    INITIALIZING GAME
    ****************/

    //new local game with game name defined by url
    $scope.game = new Game($stateParams.gameName);

    //when the board is loaded...
    boardArr.$loaded().then(function (data) {
        if (!data.length) {
            boardArr.$add($scope.game.board);
        }
        $scope.game.board = boardArr;

        //watching board for changes
        boardRef.on('child_changed', function (snap) {
            //NEED TO RETURN TO CHECK BOARD
            console.log(snap);
            $scope.game.board = snap.val();
        });
    });

    $scope.spaces = _.flatten($scope.game.board);

    //when the deck is loaded...
    deckArr.$loaded().then(function (data) {

        $scope.game.deck = deckArr; //add the deck to the local game ? Try this as firebase DeckArr????

        //don't start watching players until there is a deck in the game
        playersRef.on("value", function (snap) {
            var snapPlayers = snap.val(); //grab the value of the snapshot (all players in game in Firebase)

            //for each player in this collection...
            for (var thisPlayer in snapPlayers) {
                var existingPlayerIndex, thisIsANewPlayer;

                //find this 'snap' player's index in local game. find returns that value.
                var localPlayer = $scope.game.players.find(function (plyr, plyrIdx) {
                    existingPlayerIndex = plyrIdx;
                    return plyr.uid === snapPlayers[thisPlayer].uid;
                });

                //if not found, create new player
                if (!localPlayer) {
                    console.log('i didnt find a local player!');
                    localPlayer = new Player(snapPlayers[thisPlayer].uid);
                    thisIsANewPlayer = true;
                }

                //for each key in the snapPlayer's keys, add that key and value to local player
                for (var playerproperty in snapPlayers[thisPlayer]) {
                    localPlayer[playerproperty] = snapPlayers[thisPlayer][playerproperty];
                }

                //push local player to game.players
                if (thisIsANewPlayer) $scope.game.players.push(localPlayer);else $scope.game.players[existingPlayerIndex] = localPlayer;
            }
        });
    });

    //when that markers array is loaded, update the available markers array on scope
    markersArr.$loaded().then(function (data) {
        $scope.game.availableMarkers = data[0];
    });

    //if someone else picks a marker, update your view
    markersRef.on('child_changed', function (data) {
        $scope.game.availableMarkers = data.val();
    });

    //on login, find me in the firebase players array
    firebase.auth().onAuthStateChanged(function (user) {
        firebasePlayersArr.$loaded().then(function (players) {

            if (user) {
                var meIdx;
                players.find(function (e, i) {
                    if (e.uid === user.uid) meIdx = i;
                });

                $scope.me = players[meIdx];
                $scope.game.currPlayer = meIdx;

                if ($scope.me.marker === "n") $scope.me.marker = null;
            } else {
                // No user is signed in.
                console.log("no one is logged in");
            }
            console.log('im here!!!!!!!!');
        });
    });

    /****************
    AVAILABLE PLAYER ACTIONS AT GAME START
    ****************/

    $scope.pickMarker = function (marker) {
        boardArr.$loaded().then(function (data) {
            pickMarkerFn(data, marker);
        });
    };

    var pickMarkerFn = function pickMarkerFn(board, marker) {

        $scope.me.marker = marker;

        firebasePlayersArr.$loaded().then(function (players) {
            var meIdx;
            //find my index in the players array
            players.find(function (e, i) {
                if (e.$id === $scope.me.$id) meIdx = i;
            });
            //give me a marker and save me in firebase
            firebasePlayersArr[meIdx].marker = marker;
            firebasePlayersArr.$save(meIdx);
        });

        var idx = $scope.game.availableMarkers.indexOf(marker);

        markersArr[0].splice(idx, 1);

        markersArr.$save(0).then(function (ref) {
            console.log("removed the picked marker");
            console.log(ref.key);
        });
    };

    //TODO: limit start points

    $scope.placeMarker = function (point) {
        boardArr.$loaded().then(function (data) {
            placeMarkerFn(data, point);
        });
    };

    //adding a board to firebase
    //Have player pick their start point
    var placeMarkerFn = function placeMarkerFn(board, point) {
        console.log(board);
        // place my marker
        player.placeMarker(board, point, $scope.me);
        // deal me three cards
        $scope.me.tiles = $scope.game.deal(3);

        // when the firebase players are loaded....
        firebasePlayersArr.$loaded().then(function (players) {
            //find me in the firebase players array
            var meIdx;
            players.find(function (e, i) {
                if (e.uid === $scope.me.uid) meIdx = i;
            });

            firebasePlayersArr[meIdx] = $scope.me; //set firebase me to local me

            firebasePlayersArr.$save(meIdx); //save it.
        });
    };

    // TODO: we probably need this on firebase so other people can't pick what's been picked

    //For synchronizingGame...
    // var syncRef = gameRef.child('moves');
    // syncRef.on('child_added', function (childSnapshot, prevChildKey) {
    //  //NEED TO DOUBLE CHECK!! What does childSnap returns?
    //  console.log('childSnapshot_SyncGame', childSnapshot);
    //  //depending on what childSnapshot gives me...I think it's one child per on call? It doesn't return an array of changes...I believe!
    //  if (childSnapshot.type === 'updateDeck') {
    //      $scope.game.deck = childSnapshot.updateDeck;
    //  } else {
    //      $scope.placeTile(childSnapshot.tile);
    //  }
    // });

    // TODO: how to re-do the moves?
    // $scope.game.moves;

    // TODO: how do we show the tiles for player?

    // TODO: how to show the rotated tile?

    // CMT: assuming we use new Game() for each game
    $scope.currentPlayer = $scope.game.getCurrentPlayer();

    // TODO: need a function to assign dragon
    $scope.dragon;
    var awaitingDragonHolders = [];

    $scope.start = function () {
        //
    };

    $scope.myTurn = function () {
        $scope.me === $scope.currentPlayer;
    };

    //these are tied to angular ng-click buttons
    $scope.rotateTileCw = function (tile) {
        console.log("rotate to right");
        tile.rotation++;
        if (tile.rotation === 4) tile.rotation = 0;
    };

    $scope.rotateTileCcw = function (tile) {
        tile.rotation--;
        if (tile.rotation === -4) tile.rotation = 0;
    };

    // CMT: use player's and game's prototype function to place tile and then move all players
    $scope.placeTile = function (tile) {
        // TODO: send this state to firebase every time it's called
        if (tile.rotation > 0) {
            tile.paths = tile.paths.map(function (connection) {
                connection = connection + 2;
                if (connection === 9) connection = 1;
                if (connection === 8) connection = 0;
                return connection;
            });
            tile.paths.unshift(tile.paths.pop());
            tile.paths.unshift(tile.paths.pop());
        } else if (tile.rotation < 0) {
            tile.paths = tile.paths.map(function (connection) {
                connection = connection - 2;
                if (connection === -2) connection = 6;
                if (connection === -1) connection = 7;
                return connection;
            });
            tile.paths.push(tile.paths.shift());
            tile.paths.push(tile.paths.shift());
        }

        var firebasePlayersArr = $firebaseArray(playersRef);
        firebasePlayersArr.$loaded().then(function (players) {
            var meIdx;
            players.find(function (e, i) {
                if (e.$id === $scope.me.$id) meIdx = i;
            });

            firebasePlayersArr[meIdx].tiles = firebasePlayersArr[meIdx].tiles.filter(function (t) {
                return t.id !== tile.id;
            });

            firebasePlayersArr[meIdx].nextSpace.tileUrl = tile.imageUrl;

            for (var i = 0; i < tile.paths.length; i++) {
                if (firebasePlayersArr[meIdx].nextSpace.points[i].neighbors[0] === "n") {
                    firebasePlayersArr[meIdx].nextSpace.points[i].neighbors.splice(0, 1);
                }
                firebasePlayersArr[meIdx].nextSpace.points[i].neighbors.push(firebasePlayersArr[meIdx].nextSpace.points[tile.paths[i]]);
                firebasePlayersArr.$save(meIdx);
            }

            firebasePlayersArr[meIdx].point = firebasePlayersArr[meIdx].nextSpace.points[firebasePlayersArr[meIdx].nextSpacePointsIndex];

            firebasePlayersArr.$save(meIdx);

            var playersNextSpaceX = firebasePlayersArr[meIdx].nextSpace.x;
            var playersNextSpaceY = firebasePlayersArr[meIdx].nextSpace.y;
            return [playersNextSpaceY, playersNextSpaceX];
        }).then(function (nextSpace) {
            boardArr.$loaded().then(function () {
                var key = boardArr.$keyAt(0);
                var spaceRef = boardRef.child(key).child(nextSpace[0]).child(nextSpace[1]);
                var spaceArr = $firebaseArray(spaceRef);
                spaceArr[1] = tile;
                console.log(spaceArr);
                spaceArr.$save(1);
                console.log("out", spaceArr);

                // spaceArr.$loaded()
                //     .then(function() {
                //         console.log("here", spaceArr)
                //         // var key = boardArr.$keyAt(0)
                //         console.log("tile", tile)
                //         spaceArr[1] = tile;

                //         // boardArr[0][nextSpace[0]][nextSpace[1]].tile = tile;
                //         spaceArr.$save(tile);

                //         // var points = data[nextSpace[0]][nextSpace[1]].points;
                //         // points.forEach(function(point, idx) {
                //         //     point.neighbors.$add(
                //         //         points[tile.paths[idx]]);
                //             //save it back to firebase
                //         // });
                // });
            });

            //Need to reassign the tiles points neighbors
        });

        // CMT: this should send the rotated tile to firebase
        // movesArr.$add({
        //     'type': 'placeTile',
        //     'tile': tile,
        //     'playerUid': $scope.me.uid
        // });
        firebasePlayersArr.$loaded().then(function (players) {
            boardArr.$loaded().then(function (board) {
                players.forEach(function (p) {
                    var movable = player.moveTo(p.point);
                    var pIdx = players.indexOf(p);

                    while (movable) {
                        p.point.travelled = true;
                        p.point = movable;

                        if (p.point.travelled === true) {
                            p.canPlay = false;
                            break;
                        }

                        // Check the space that's not my current nextSpace
                        var newNextSpaceInfo = p.point.spaces.filter(function (space) {
                            return space.x !== p.nextSpace.x || space.y !== p.nextSpace.y;
                        })[0];

                        var oldSpace = p.nextSpace;
                        var newSpace = board[0][newNextSpaceInfo.y][newNextSpaceInfo.x];
                        p.nextSpace = newSpace;

                        firebasePlayersArr.$save(pIdx);
                        // TODO: need more players to check if it works
                        player.checkDeath(p);
                        movable = player.moveTo(p.point);
                    }
                    console.log("end moving");
                });
            });
        });

        if ($scope.game.checkOver()) {
            // TODO: need to tell the player she won
            $scope.winner = $scope.game.getCanPlay()[0];
            $scope.gameOver = true;
            console.log("game over");
            // TODO: disable everything, let the players decide wether reset the game or not
        } else {
            if ($scope.game.deadPlayers().length) {
                //with new cards & need to reshuffle

                // because the deadPlayers() returns a 2D array, use reduce to flatten it
                var deadPlayerTiles = $scope.game.deadPlayers().reduce(function (a, b) {
                    return a = a.concat(b);
                });

                $scope.game.deck = $scope.game.deck.concat(deadPlayerTiles);
                $scope.game.deck = $scope.game.deck.shuffle();

                //send firebase a new move
                movesArr.$add({
                    'type': 'updateDeck',
                    'updateDeck': $scope.game.deck
                });
            }

            // If deck is empty & no one is dragon, set me as dragon
            if ($scope.game.deck.length === 0 && !$scope.dragon) {
                $scope.dragon = $scope.me;
                console.log("set dragon to me");
            } else if ($scope.game.deck.length === 0 && $scope.dragon) {
                awaitingDragonHolders.push($scope.me);
                console.log("I'm waiting for to be a dragon");
            } else {
                console.log("give me a tile");
                firebasePlayersArr.$loaded().then(function (players) {
                    //find me in the firebase players array
                    var meIdx;
                    players.find(function (e, i) {
                        if (e.uid === $scope.me.uid) meIdx = i;
                    });

                    //set firebase me to local me
                    firebasePlayersArr[meIdx].tiles = $scope.me.tiles.concat($scope.game.deal(1));
                    console.log("dealed one tile to me!");

                    //save it
                    firebasePlayersArr.$save(meIdx);

                    $scope.me = firebasePlayersArr[meIdx];
                });

                while ($scope.dragon && $scope.game.deck.length) {
                    $scope.dragon.tiles.push($scope.game.deal(1));
                    firebasePlayersArr.$loaded().then(function (players) {
                        //find me in the firebase players array
                        var meIdx;
                        players.find(function (e, i) {
                            if (e.uid === $scope.dragon.uid) meIdx = i;
                        });

                        //set firebase me to local me
                        firebasePlayersArr[meIdx] = $scope.dragon;

                        //save it
                        firebasePlayersArr.$save(meIdx);
                    });

                    $scope.dragon = $scope.awaitingDragonHolders.shift() || null;
                }
            }

            // TODO: still need to work on this
            $scope.currentPlayer = $scope.game.goToNextPlayer();
            console.log("new curr player", $scope.currentPlayer);
        }
    };

    $scope.leaveGame = function () {
        console.log("i'm out");

        firebasePlayersArr.$loaded().then(function (players) {
            //find me in the firebase players array
            var meIdx;

            players.find(function (e, i) {
                if (e.uid === $scope.me.uid) meIdx = i;
            });

            // remove the player from firebase
            firebasePlayersArr.$remove(firebasePlayersArr[meIdx]);
        });

        $state.go('pickGame');
    };

    // TODO: need to remove this game room's moves from firebase?
    $scope.reset = function () {
        markersArr.$remove(0).then(function (ref) {
            console.log("removed all markers", ref.key);
        });

        deckArr.$remove(0).then(function (ref) {
            console.log("removed the deck", ref.key);
        });

        initialDeckArr.$remove(0).then(function (ref) {
            console.log("reomved the initialDeck", ref.key);
        });

        movesArr.$loaded().then(function (moves) {
            for (var i = 0; i < moves.length; i++) {
                movesArr.$remove(i);
            }
        }).then(function () {
            console.log("removed all moves");
        });

        obj.$loaded().then(function (data) {
            var tiles = data.tiles;
            var deck = new Deck(tiles).shuffle().tiles;
            initialDeckArr.$add(deck);
        });

        var initialMarkersRef = ref.child('games').child($stateParams.gameName).child('availableMarkers');
        $firebaseArray(initialMarkersRef).$add(["red", "orange", "yellow", "green", "aqua", "blue", "navy", "purple"]);

        var players = $firebaseArray(playersRef);
        players.$loaded().then(function (data) {
            for (var i = 0; i < data.length; i++) {
                data[i].canPlay = true;
                data[i].marker = 'n';
                data[i].nextSpace = 'n';
                data[i].nextSpacePointsIndex = 'n';
                data[i].point = 'n';
                data[i].tiles = 'n';
                players.$save(i);
            }
        });

        $state.reload();
        console.log($scope.me);
    };

    $scope.starttop = [[0, 0, 0], [0, 0, 1], [1, 0, 0], [1, 0, 1], [2, 0, 0], [2, 0, 1], [3, 0, 0], [3, 0, 1], [4, 0, 0], [4, 0, 1], [5, 0, 0], [5, 0, 1]];
    $scope.startleft = [[0, 0, 7], [0, 0, 6], [0, 1, 7], [0, 1, 6], [0, 2, 7], [0, 2, 6], [0, 3, 7], [0, 3, 6], [0, 4, 7], [0, 4, 6], [0, 5, 7], [0, 5, 6]];
    $scope.startbottom = [[0, 5, 5], [0, 5, 4], [1, 5, 5], [1, 5, 4], [2, 5, 5], [2, 5, 4], [3, 5, 5], [3, 5, 4], [4, 5, 5], [4, 5, 4], [5, 5, 5], [5, 5, 4]];
    $scope.startright = [[5, 0, 2], [5, 0, 3], [5, 1, 2], [5, 1, 3], [5, 2, 2], [5, 2, 3], [5, 3, 2], [5, 3, 3], [5, 4, 2], [5, 4, 3], [5, 5, 2], [5, 5, 3]];
});
tsuro.config(function ($stateProvider) {
    $stateProvider.state('gamelist', {
        url: '/gamelist',
        templateUrl: '/browser/js/gamelist/gamelist.html',
        controller: 'gameList'
    });
});

tsuro.controller('gameList', function ($scope, firebaseUrl, $firebaseObject, $state, $firebaseAuth, $firebaseArray) {
    //For synchronizingGameList...
    var ref = firebase.database().ref();
    var obj = $firebaseObject(ref);

    var auth = $firebaseAuth();
    var firebaseUser = auth.$getAuth();

    var synchRef = ref.child("games");
    var synchronizedObj = $firebaseObject(synchRef);

    // This returns a promise...you can.then() and assign value to $scope.variable
    // gamelist is whatever we are calling it in the angular html.
    synchronizedObj.$bindTo($scope, "gamelist").then(function () {
        var gamelist = [];
        for (var i in $scope.gamelist) {
            gamelist.push([i, $scope.gamelist[i]]);
        }
        $scope.gameNames = gamelist.slice(2);
    });

    $scope.join = function (gameName) {
        var gameNameRef = ref.child('games').child(gameName);
        var playersRef = gameNameRef.child('players');

        firebase.auth().onAuthStateChanged(function (user) {
            var firebasePlayersArr = $firebaseArray(playersRef);

            firebasePlayersArr.$loaded().then(function (data) {
                var FBplayers = data;

                if (user) {
                    if (!FBplayers.filter(function (player) {
                        return player.uid === user.uid;
                    }).length) {
                        var newPlayer = new Player(user.uid);
                        $firebaseArray(playersRef).$add(newPlayer);
                    }
                } else {
                    // No user is signed in.
                    console.log("nothing");
                }
            }).then(function () {
                $state.go('game', {
                    "gameName": gameName
                });
            });
        });
    };
});

tsuro.config(function ($stateProvider) {
    $stateProvider.state('login', {
        url: '/login',
        templateUrl: '/browser/js/login/login.html',
        controller: 'loginCtrl'
    });
});

tsuro.controller('loginCtrl', function ($scope, $state, $firebaseAuth, $rootScope) {
    var auth = $firebaseAuth();

    $scope.logInWithGoogle = function () {
        auth.$signInWithPopup("google").then(function (authData) {
            console.log("Logged in as:", authData);
            $rootScope.currentUser = authData;
            $state.go('pickGame');
        }).catch(function (error) {
            console.error("Authentication failed:", error);
        });
    };
});

tsuro.config(function ($stateProvider) {
    $stateProvider.state('pickGame', {
        url: '/pickgame',
        templateUrl: '/browser/js/pickGame/pickGame.html',
        controller: 'pickGameCtrl'
    });
});

tsuro.controller('pickGameCtrl', function ($scope, $state, $firebaseArray, $firebaseObject) {
    var ref = firebase.database().ref();
    var obj = $firebaseObject(ref);

    $scope.createGame = function (gameName) {
        var gameNameRef = ref.child('games').child(gameName);
        var playersRef = gameNameRef.child('players');
        var initialMarkersRef = gameNameRef.child('availableMarkers');
        var initialMarkersArr = $firebaseArray(initialMarkersRef);
        var deckRef = gameNameRef.child('deck');
        var deckArr = $firebaseArray(deckRef);

        $firebaseArray(gameNameRef).$add({
            "gameName": gameName
        });

        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                var newPlayer = new Player(user.uid);
                $firebaseArray(playersRef).$add(newPlayer);
            } else {
                console.log("no one logged in");
            }
        });

        var tiles = [{
            id: 1,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_01.png?alt=media&token=dc2e553b-f4da-442e-97e8-d0d808c2d5c0",
            paths: [3, 4, 6, 0, 1, 7, 2, 5],
            rotation: 0
        }, {
            id: 2,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_02.png?alt=media&token=bbb0b596-74ea-49a8-9f6c-b42627ccd873",
            paths: [1, 0, 4, 7, 2, 6, 5, 3],
            rotation: 0
        }, {
            id: 3,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_03.png?alt=media&token=4dd1ff85-0204-4895-8957-3b7073559117",
            paths: [1, 0, 4, 6, 2, 7, 3, 5],
            rotation: 0
        }, {
            id: 4,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_04.png?alt=media&token=90dd2de8-9c99-4cb7-86ff-7863b0a5641c",
            paths: [2, 5, 0, 7, 6, 1, 4, 3],
            rotation: 0
        }, {
            id: 5,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_05.png?alt=media&token=5912a47b-854a-46d0-bfeb-005913d24158",
            paths: [4, 2, 1, 6, 0, 7, 3, 5],
            rotation: 0
        }, {
            id: 6,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_06.png?alt=media&token=056b8938-6e1f-481e-9d34-b6b27f2cd9e3",
            paths: [1, 0, 5, 7, 6, 2, 4, 3],
            rotation: 0
        }, {
            id: 7,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_07.png?alt=media&token=b5ddbaf6-f061-4206-9f9b-92bc863bb484",
            paths: [2, 4, 0, 6, 1, 7, 3, 5],
            rotation: 0
        }, {
            id: 8,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_08.png?alt=media&token=8ad6340e-f8a5-4ff2-bdaf-0a85e2bbc630",
            paths: [2, 5, 0, 6, 7, 1, 3, 4],
            rotation: 0
        }, {
            id: 9,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_09.png?alt=media&token=6a1a62b8-1872-460d-9276-5b48f3a38a39",
            paths: [1, 0, 7, 6, 5, 4, 3, 2],
            rotation: 0
        }, {
            id: 10,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_10.png?alt=media&token=63e8a214-3aef-4da6-8827-133db9b9b4ef",
            paths: [4, 5, 6, 7, 0, 1, 2, 3],
            rotation: 0
        }, {
            id: 11,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_11.png?alt=media&token=57869682-5c4d-4f80-832b-ebc46080a4c5",
            paths: [7, 2, 1, 4, 3, 6, 5, 0],
            rotation: 0
        }, {
            id: 12,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_12.png?alt=media&token=e505f22b-9d52-49d1-9b71-4dcdce56853f",
            paths: [2, 7, 0, 5, 6, 3, 4, 1],
            rotation: 0
        }, {
            id: 13,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_13.png?alt=media&token=f0ac4eb9-7b81-4dfb-b0cb-aecc0290ae3b",
            paths: [5, 4, 7, 6, 1, 0, 3, 2],
            rotation: 0
        }, {
            id: 14,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_14.png?alt=media&token=7ff24e77-6737-412b-bacd-414bf4f643c9",
            paths: [3, 2, 1, 0, 7, 6, 5, 4],
            rotation: 0
        }, {
            id: 15,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_15.png?alt=media&token=a1ad7c0c-8e6d-4474-9fde-0b47d04104c1",
            paths: [1, 0, 7, 4, 3, 6, 5, 2],
            rotation: 0
        }, {
            id: 16,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_16.png?alt=media&token=e33b3cd9-9207-4cb8-969b-5ce60f91537f",
            paths: [1, 0, 5, 6, 7, 2, 3, 4],
            rotation: 0
        }, {
            id: 17,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_17.png?alt=media&token=200d6cab-df31-49b8-ba95-ad52d7c79e8b",
            paths: [3, 5, 6, 0, 7, 1, 2, 4],
            rotation: 0
        }, {
            id: 18,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_18.png?alt=media&token=1c7bf515-9941-47cd-9ecb-479d66f2612b",
            paths: [2, 7, 0, 4, 3, 6, 5, 1],
            rotation: 0
        }, {
            id: 19,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_19.png?alt=media&token=f5cc625c-73c0-49f7-932c-0e65d31d2bf7",
            paths: [4, 3, 6, 1, 0, 7, 2, 5],
            rotation: 0
        }, {
            id: 20,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_20.png?alt=media&token=5b9b4455-2c09-41e4-a2f2-f60bedc470ad",
            paths: [2, 6, 0, 4, 3, 7, 1, 5],
            rotation: 0
        }, {
            id: 21,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_21.png?alt=media&token=6d5646d7-b1b1-49c9-bf87-00be9e7b8e2c",
            paths: [2, 3, 0, 1, 7, 6, 5, 4],
            rotation: 0
        }, {
            id: 22,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_22.png?alt=media&token=5a587359-831c-4dcd-a9c5-e7085c5a3079",
            paths: [2, 6, 0, 5, 7, 3, 1, 4],
            rotation: 0
        }, {
            id: 23,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_23.png?alt=media&token=4cb9750b-0f50-429d-9367-170b0855c6c4",
            paths: [1, 0, 6, 4, 3, 7, 2, 5],
            rotation: 0
        }, {
            id: 24,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_24.png?alt=media&token=a80b7f5b-c572-4430-ab8a-3d3656e4c643",
            paths: [3, 4, 7, 0, 1, 6, 5, 2],
            rotation: 0
        }, {
            id: 25,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_25.png?alt=media&token=9b8e853d-962b-4d32-b679-622e8ae7be6a",
            paths: [1, 0, 3, 2, 7, 6, 5, 4],
            rotation: 0
        }, {
            id: 26,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_26.png?alt=media&token=d84cb7d3-4bd5-4a17-8b7a-6df857975c45",
            paths: [1, 0, 6, 7, 5, 4, 2, 3],
            rotation: 0
        }, {
            id: 27,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_27.png?alt=media&token=d0eaf631-8a0e-4aa9-8dd2-778e9be1fec6",
            paths: [2, 4, 0, 7, 1, 6, 5, 3],
            rotation: 0
        }, {
            id: 28,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_28.png?alt=media&token=ee42cc11-19d2-4476-887b-7a29817430fc",
            paths: [4, 2, 1, 7, 0, 6, 5, 3],
            rotation: 0
        }, {
            id: 29,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_29.png?alt=media&token=a60766a5-5e0c-49ad-9240-20b1d539fa2f",
            paths: [1, 0, 3, 2, 5, 4, 7, 6],
            rotation: 0
        }, {
            id: 30,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_30.png?alt=media&token=dea26808-d49d-43b0-b81c-174c1e098c1e",
            paths: [2, 3, 0, 1, 6, 7, 4, 5],
            rotation: 0
        }, {
            id: 31,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_31.png?alt=media&token=4cb9edd7-95ab-4e2f-aeda-d251f7015a0d",
            paths: [3, 6, 5, 0, 7, 2, 1, 4],
            rotation: 0
        }, {
            id: 32,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_32.png?alt=media&token=4f19788f-ad85-4e6f-82ac-7fef4c8f0419",
            paths: [1, 0, 6, 5, 7, 3, 2, 4],
            rotation: 0
        }, {
            id: 33,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_33.png?alt=media&token=0914028d-ea25-4613-82f6-eab574e69f70",
            paths: [1, 0, 3, 2, 6, 7, 4, 5],
            rotation: 0
        }, {
            id: 34,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_34.png?alt=media&token=3714e87a-942e-436e-ae5b-bc0a23de33d1",
            paths: [4, 5, 7, 6, 0, 1, 3, 2],
            rotation: 0
        }, {
            id: 35,
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/the-paths-of-dragons.appspot.com/o/tsuro-tile_35.png?alt=media&token=aa9dda97-edee-472a-8b24-8bb0b69dfa9a",
            paths: [1, 0, 7, 5, 6, 3, 4, 2],
            rotation: 0
        }];

        var deck = new Deck(tiles).shuffle().tiles;
        var deckRef = ref.child('games').child(gameName).child('deck');

        $firebaseArray(deckRef).$add(deck);

        var initialMarkersRef = ref.child('games').child(gameName).child('availableMarkers');
        $firebaseArray(initialMarkersRef).$add(["red", "orange", "yellow", "green", "aqua", "blue", "navy", "purple"]);

        deckArr.$add(deck);

        initialMarkersArr.$add(["red", "orange", "yellow", "green", "aqua", "blue", "navy", "purple"]);

        $state.go('game', {
            "gameName": gameName
        });
    };

    $scope.goToGameList = function () {
        $state.go('gamelist');
    };
});

'use strict';

function Player(uid) {
    // TODO: get uid from firebase auth
    this.uid = uid;

    this.marker = "n";

    // should be a Point object
    this.point = "n";

    // [x, y]
    // depends on the angular Space.x, Space.y
    this.nextSpace = "n";

    // in each Space.points array, find this specific point and get the position (integer) inside this space.
    this.nextSpacePointsIndex = "n";

    // maximun 3 tiles
    this.tiles = 'n';

    // if a player dies, it will be changed to false
    this.canPlay = true;
}
Player.prototype.hi = function () {
    console.log("HI");
};
// need to use self becuse we need to change $scope.me on gameCtrl and send to firebase
Player.prototype.placeMarker = function (board, point, self) {
    // point looks like [x, y, pointsIndex] in the space
    var x = point[0];
    var y = point[1];
    var pointsIndex = point[2];
    self.point = board[0][y][x].points[pointsIndex];
    self.point.travelled = true;

    //[x, y] from the point
    self.nextSpace = board[0][y][x];

    // in each Space.points array, find this specific point and get the position (integer) inside this space.
    self.nextSpacePointsIndex = self.nextSpace.points.indexOf(self.point);
};

Player.prototype.newSpace = function (board, oldSpace, self) {
    if (self.nextSpacePointsIndex === 0 || self.nextSpacePointsIndex === 1) {
        return board[oldSpace.y - 1][oldSpace.x];
    } else if (self.nextSpacePointsIndex === 2 || self.nextSpacePointsIndex === 3) {
        return board[oldSpace.y][oldSpace.x + 1];
    } else if (self.nextSpacePointsIndex === 4 || self.nextSpacePointsIndex === 5) {
        return board[oldSpace.y + 1][oldSpace.x];
    } else {
        return board[oldSpace.y][oldSpace.x - 1];
    }
};

Player.prototype.moveTo = function (pointer) {
    //always be returning 0 or 1 point in the array
    var nextPoint = pointer.neighbors.filter(function (neighbor) {
        return !neighbor.travelled && neighbor !== "n";
    })[0];
    return nextPoint;
};

Player.prototype.checkDeath = function (self) {
    var allTravelled = self.point.neighbors.filter(function (neighbor) {
        return neighbor.travelled;
    });

    if (self.point.edge || allTravelled.length === 2) self.canPlay = false;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImdhbWUvYm9hcmQuanMiLCJnYW1lL2RlY2suanMiLCJnYW1lL2dhbWUuY29udHJ1Y3Rvci5qcyIsImdhbWUvZ2FtZS5qcyIsImdhbWVsaXN0L2dhbWVsaXN0LmpzIiwibG9naW4vbG9naW4uanMiLCJwaWNrR2FtZS9waWNrR2FtZS5qcyIsInBsYXllci9wbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBQSxRQUFBLFFBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTs7QUFFQSxNQUFBLE1BQUEsQ0FBQSxZQUFBO0FBQ0EsUUFBQSxTQUFBO0FBQ0EsZ0JBQUEseUNBREE7QUFFQSxvQkFBQSxzQ0FGQTtBQUdBLHFCQUFBLDZDQUhBO0FBSUEsdUJBQUE7QUFKQSxLQUFBO0FBTUEsYUFBQSxhQUFBLENBQUEsTUFBQTtBQUNBLENBUkE7O0FBVUEsTUFBQSxRQUFBLENBQUEsYUFBQSxFQUFBLDRDQUFBOztBQUVBLE1BQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQTtBQUNBLHVCQUFBLFNBQUEsQ0FBQSxHQUFBO0FBQ0EsQ0FGQTs7QUNkQSxTQUFBLEtBQUEsR0FBQTtBQUNBLFNBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQTs7QUFFQSxNQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBO0FBQ0E7QUFDQSxXQUFBLEtBQUEsS0FBQTtBQUNBLENBUkE7O0FBVUEsU0FBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEVBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLFNBQUEsSUFBQSxHQUFBLEdBQUE7QUFDQSxTQUFBLE1BQUEsR0FBQSxDQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBQUE7O0FBRUEsU0FBQSxJQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsc0JBQUE7O0FBRUEsWUFBQSxJQUFBLENBQUEsRUFBQTs7QUFDQSw0QkFBQSxNQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxDO0FBQ0EsZ0JBQUEsTUFBQSxDQUFBLEVBQUEsS0FBQSxNQUFBLENBQUEsQ0FBQSxJQUFBLElBQUEsS0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0FBQ0EsbUJBQUEsQ0FEQTtBQUVBLG1CQUFBLENBRkE7QUFHQSxtQkFBQTtBQUhBLGFBQUEsQ0FBQSxDQUFBLENBQUEsS0FLQTtBQUNBLHFCQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsTUFBQSxJQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBO0FBQ0EsU0FWQSxNQVVBLElBQUEsSUFBQSxDQUFBLEVBQUE7O0FBQ0EsNEJBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUE7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7QUFDQSxtQkFBQSxDQURBO0FBRUEsbUJBQUEsQ0FGQTtBQUdBLG1CQUFBO0FBSEEsYUFBQSxDQUFBLENBQUEsQ0FBQSxLQUtBO0FBQ0EscUJBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtBQUNBLHVCQUFBLENBREE7QUFFQSx1QkFBQSxDQUZBO0FBR0EsdUJBQUE7QUFIQSxpQkFBQSxFQUlBO0FBQ0EsdUJBQUEsSUFBQSxDQURBO0FBRUEsdUJBQUEsQ0FGQTtBQUdBLHVCQUFBO0FBSEEsaUJBSkEsQ0FBQSxDQUFBO0FBU0E7QUFDQSxTQWxCQSxNQWtCQSxJQUFBLElBQUEsQ0FBQSxFQUFBOztBQUNBLDRCQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsZ0JBQUEsTUFBQSxDQUFBLEVBQUEsS0FBQSxNQUFBLENBQUEsQ0FBQSxJQUFBLElBQUEsS0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0FBQ0EsbUJBQUEsQ0FEQTtBQUVBLG1CQUFBLENBRkE7QUFHQSxtQkFBQTtBQUhBLGFBQUEsQ0FBQSxDQUFBLENBQUEsS0FLQTtBQUNBLHFCQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7QUFDQSx1QkFBQSxDQURBO0FBRUEsdUJBQUEsQ0FGQTtBQUdBLHVCQUFBO0FBSEEsaUJBQUEsRUFJQTtBQUNBLHVCQUFBLENBREE7QUFFQSx1QkFBQSxJQUFBLENBRkE7QUFHQSx1QkFBQTtBQUhBLGlCQUpBLENBQUEsQ0FBQTtBQVNBO0FBQ0EsU0FsQkEsTUFrQkE7O0FBQ0EsNEJBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsQztBQUNBLGdCQUFBLE1BQUEsQ0FBQSxFQUFBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtBQUNBLG1CQUFBLENBREE7QUFFQSxtQkFBQSxDQUZBO0FBR0EsbUJBQUE7QUFIQSxhQUFBLENBQUEsQ0FBQSxDQUFBLEtBS0E7QUFDQSxxQkFBQSxNQUFBLENBQUEsQ0FBQSxJQUFBLE1BQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxFQUFBLE1BQUEsQ0FBQSxhQUFBLENBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBSUEsU0FBQSxLQUFBLENBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQTtBQUNBLFNBQUEsSUFBQSxHQUFBLElBQUE7QUFDQSxTQUFBLFNBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLFNBQUEsU0FBQSxHQUFBLEtBQUE7QUFDQSxTQUFBLE1BQUEsR0FBQSxLQUFBO0FBQ0E7O0FDMUZBOztJQUVBLEk7QUFDQSxrQkFBQSxLQUFBLEVBQUE7QUFBQTs7QUFDQSxhQUFBLEtBQUEsR0FBQSxLQUFBO0FBQ0E7Ozs7a0NBRUE7QUFDQSxpQkFBQSxLQUFBLEdBQUEsRUFBQSxPQUFBLENBQUEsS0FBQSxLQUFBLENBQUE7QUFDQSxtQkFBQSxJQUFBO0FBQ0E7OztvQ0FFQTtBQUNBLG1CQUFBLEtBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0E7Ozs2QkFFQSxHLEVBQUE7QUFDQSxtQkFBQSxLQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLEdBQUEsQ0FBQTtBQUNBOzs7K0JBRUEsSyxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBO0FBQ0EsbUJBQUEsSUFBQTtBQUNBOzs7Ozs7QUN2QkE7Ozs7SUFJQSxJO0FBQ0Esa0JBQUEsSUFBQSxFQUFBO0FBQUE7O0FBQ0EsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQUNBLGFBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLEtBQUEsR0FBQSxJQUFBLEtBQUEsR0FBQSxTQUFBLEVBQUE7QUFDQSxhQUFBLE9BQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxnQkFBQSxHQUFBLENBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxRQUFBLEVBQUEsT0FBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLFFBQUEsQ0FBQTs7O0FBR0EsYUFBQSxVQUFBOztBQUVBLGFBQUEsTUFBQSxHQUFBLElBQUE7QUFDQSxhQUFBLEtBQUE7QUFDQTs7OzsyQ0FFQTtBQUNBLGdCQUFBLEtBQUEsVUFBQSxLQUFBLENBQUEsQ0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxPQUFBLENBQUEsS0FBQSxVQUFBLENBQUE7QUFDQTs7O3lDQUVBO0FBQ0EsaUJBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLE1BQUE7QUFBQSx1QkFBQSxPQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUE7QUFBQSxhQUFBO0FBQ0E7OztzQ0FFQTtBQUNBLGdCQUFBLG1CQUFBLEVBQUE7QUFDQSxpQkFBQSxPQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0Esb0JBQUEsQ0FBQSxPQUFBLE9BQUEsSUFBQSxPQUFBLEtBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EscUNBQUEsSUFBQSxDQUFBLE9BQUEsS0FBQTtBQUNBLG1DQUFBLElBQUE7QUFDQTtBQUNBLGFBTEE7QUFNQSxtQkFBQSxnQkFBQTtBQUNBOzs7b0NBRUE7QUFDQSxtQkFBQSxLQUFBLFVBQUEsR0FBQSxNQUFBLElBQUEsQ0FBQTtBQUNBOzs7Ozs7eUNBR0E7QUFDQSxnQkFBQSxLQUFBLFVBQUEsR0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0Esd0JBQUEsR0FBQSxDQUFBLEtBQUEsVUFBQSxFQUFBLFlBQUEsRUFBQSxTQUFBLEVBQUEsS0FBQSxPQUFBO0FBQ0Esb0JBQUEsU0FBQSxLQUFBLFVBQUEsR0FBQSxDQUFBLElBQUEsS0FBQSxPQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsR0FBQSxLQUFBLFVBQUEsR0FBQSxDQUFBO0FBQ0Esd0JBQUEsR0FBQSxDQUFBLFFBQUEsRUFBQSxNQUFBO0FBQ0EsdUJBQUEsU0FBQSxLQUFBLE9BQUEsQ0FBQSxNQUFBLElBQUEsQ0FBQSxLQUFBLE9BQUEsQ0FBQSxNQUFBLEVBQUEsT0FBQSxFQUFBO0FBQ0E7QUFDQSx3QkFBQSxXQUFBLEtBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxTQUFBLENBQUE7QUFDQSw0QkFBQSxHQUFBLENBQUEsTUFBQTtBQUNBO0FBQ0EscUJBQUEsVUFBQSxHQUFBLE1BQUE7QUFDQSxhQVZBLE1BVUE7QUFDQSxxQkFBQSxVQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQSxtQkFBQSxLQUFBLGdCQUFBLEVBQUE7QUFDQTs7OzZCQUVBLEcsRUFBQTtBQUNBLGdCQUFBLFFBQUEsRUFBQTtBQUNBLGlCQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0Esb0JBQUEsT0FBQSxLQUFBLElBQUEsQ0FBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxxQkFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSw0QkFBQSxHQUFBLENBQUEsZUFBQTtBQUNBLGlCQUZBO0FBR0Esd0JBQUEsTUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0Esd0JBQUEsR0FBQSxDQUFBLEtBQUE7QUFDQTtBQUNBLG1CQUFBLEtBQUE7QUFDQTs7O3FDQUVBO0FBQ0EsbUJBQUEsS0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0EsdUJBQUEsT0FBQSxPQUFBO0FBQ0EsYUFGQSxDQUFBO0FBR0E7Ozs7OztBQzlFQSxNQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxhQUFBLGlCQURBO0FBRUEscUJBQUEsNEJBRkE7QUFHQSxvQkFBQTtBQUhBLEtBQUE7QUFLQSxDQU5BOztBQVNBLE1BQUEsVUFBQSxDQUFBLFVBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxhQUFBLEVBQUEsV0FBQSxFQUFBLFlBQUEsRUFBQSxlQUFBLEVBQUEsY0FBQSxFQUFBLE1BQUEsRUFBQTs7QUFFQSxRQUFBLE1BQUEsU0FBQSxRQUFBLEdBQUEsR0FBQSxFQUFBO0FBQ0EsUUFBQSxNQUFBLGdCQUFBLEdBQUEsQ0FBQTs7QUFFQSxRQUFBLFVBQUEsSUFBQSxLQUFBLENBQUEsT0FBQSxFQUFBLEtBQUEsQ0FBQSxhQUFBLFFBQUEsQ0FBQTtBQUNBLFFBQUEsVUFBQSxRQUFBLEtBQUEsQ0FBQSxhQUFBLFFBQUEsQ0FBQTs7QUFFQSxRQUFBLGlCQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxLQUFBLENBQUEsYUFBQSxRQUFBLEVBQUEsS0FBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLFFBQUEsaUJBQUEsZUFBQSxjQUFBLENBQUE7O0FBRUEsUUFBQSxVQUFBLFFBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQTtBQUNBLFFBQUEsVUFBQSxlQUFBLE9BQUEsQ0FBQTs7QUFFQSxRQUFBLGFBQUEsUUFBQSxLQUFBLENBQUEsU0FBQSxDQUFBO0FBQ0EsUUFBQSxxQkFBQSxlQUFBLFVBQUEsQ0FBQTs7QUFFQSxRQUFBLGFBQUEsUUFBQSxLQUFBLENBQUEsa0JBQUEsQ0FBQTtBQUNBLFFBQUEsYUFBQSxlQUFBLFVBQUEsQ0FBQTs7QUFFQSxRQUFBLFdBQUEsUUFBQSxLQUFBLENBQUEsT0FBQSxDQUFBO0FBQ0EsUUFBQSxXQUFBLGVBQUEsUUFBQSxDQUFBOztBQUVBLFFBQUEsV0FBQSxRQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUE7QUFDQSxRQUFBLFdBQUEsZUFBQSxRQUFBLENBQUE7O0FBRUEsUUFBQSxTQUFBLE9BQUEsTUFBQSxDQUFBLE9BQUEsU0FBQSxDQUFBOzs7Ozs7O0FBT0EsV0FBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsYUFBQSxRQUFBLENBQUE7OztBQUdBLGFBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLE1BQUEsRUFBQTtBQUNBLHFCQUFBLElBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxLQUFBO0FBQ0E7QUFDQSxlQUFBLElBQUEsQ0FBQSxLQUFBLEdBQUEsUUFBQTs7O0FBR0EsaUJBQUEsRUFBQSxDQUFBLGVBQUEsRUFBQSxVQUFBLElBQUEsRUFBQTs7QUFFQSxvQkFBQSxHQUFBLENBQUEsSUFBQTtBQUNBLG1CQUFB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QTtBQUNBLGFBTEEsQ0FBQTtBQU1BLGlCQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxTQVRBLE1BU0EsSUFBQSxLQUFBLFFBQUEsR0FBQSxDQUFBLEVBQUE7QUFDQSxpQkFBQSxLQUFBLEdBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsVUFBQSxFQUFBO0FBQ0EsNkJBQUEsYUFBQSxDQUFBO0FBQ0Esb0JBQUEsZUFBQSxDQUFBLENBQUEsRUFBQSxhQUFBLENBQUE7QUFDQSxvQkFBQSxlQUFBLENBQUEsQ0FBQSxFQUFBLGFBQUEsQ0FBQTtBQUNBLHVCQUFBLFVBQUE7QUFDQSxhQUxBLENBQUE7QUFNQSxpQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLGlCQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0E7O0FBRUEsWUFBQSxxQkFBQSxlQUFBLFVBQUEsQ0FBQTtBQUNBLDJCQUFBLE9BQUEsR0FDQSxJQURBLENBQ0EsVUFBQSxPQUFBLEVBQUE7QUFDQSxnQkFBQSxLQUFBO0FBQ0Esb0JBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUEsR0FBQSxLQUFBLE9BQUEsRUFBQSxDQUFBLEdBQUEsRUFBQSxRQUFBLENBQUE7QUFDQSxhQUZBOztBQUlBLCtCQUFBLEtBQUEsRUFBQSxLQUFBLEdBQUEsbUJBQUEsS0FBQSxFQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLEVBQUE7QUFDQSx1QkFBQSxFQUFBLEVBQUEsS0FBQSxLQUFBLEVBQUE7QUFDQSxhQUZBLENBQUE7O0FBSUEsK0JBQUEsS0FBQSxFQUFBLFNBQUEsQ0FBQSxPQUFBLEdBQUEsS0FBQSxRQUFBOztBQUVBLGlCQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxLQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0Esb0JBQUEsbUJBQUEsS0FBQSxFQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxDQUFBLE1BQUEsR0FBQSxFQUFBO0FBQ0EsdUNBQUEsS0FBQSxFQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQTtBQUNBLG1DQUFBLEtBQUEsRUFBQSxTQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsSUFBQSxDQUFBLG1CQUFBLEtBQUEsRUFBQSxTQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsbUNBQUEsS0FBQSxDQUFBLEtBQUE7QUFDQTs7QUFFQSwrQkFBQSxLQUFBLEVBQUEsS0FBQSxHQUFBLG1CQUFBLEtBQUEsRUFBQSxTQUFBLENBQUEsTUFBQSxDQUFBLG1CQUFBLEtBQUEsRUFBQSxvQkFBQSxDQUFBOztBQUVBLCtCQUFBLEtBQUEsQ0FBQSxLQUFBOztBQUVBLGdCQUFBLG9CQUFBLG1CQUFBLEtBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtBQUNBLGdCQUFBLG9CQUFBLG1CQUFBLEtBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtBQUNBLG1CQUFBLENBQUEsaUJBQUEsRUFBQSxpQkFBQSxDQUFBO0FBQ0EsU0E1QkEsRUE2QkEsSUE3QkEsQ0E2QkEsVUFBQSxTQUFBLEVBQUE7QUFDQSxxQkFBQSxPQUFBLEdBQ0EsSUFEQSxDQUNBLFlBQUE7QUFDQSxvQkFBQSxNQUFBLFNBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLG9CQUFBLFdBQUEsU0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0Esb0JBQUEsV0FBQSxlQUFBLFFBQUEsQ0FBQTtBQUNBLHlCQUFBLENBQUEsSUFBQSxJQUFBO0FBQ0Esd0JBQUEsR0FBQSxDQUFBLFFBQUE7QUFDQSx5QkFBQSxLQUFBLENBQUEsQ0FBQTtBQUNBLHdCQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsUUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXFCQSxhQTdCQTs7O0FBaUNBLFNBL0RBOzs7Ozs7OztBQXdFQSwyQkFBQSxPQUFBLEdBQ0EsSUFEQSxDQUNBLFVBQUEsT0FBQSxFQUFBO0FBQ0EscUJBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLHdCQUFBLE9BQUEsQ0FBQSxVQUFBLENBQUEsRUFBQTtBQUNBLHdCQUFBLFVBQUEsT0FBQSxNQUFBLENBQUEsRUFBQSxLQUFBLENBQUE7QUFDQSx3QkFBQSxPQUFBLFFBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSwyQkFBQSxPQUFBLEVBQUE7QUFDQSwwQkFBQSxLQUFBLENBQUEsU0FBQSxHQUFBLElBQUE7QUFDQSwwQkFBQSxLQUFBLEdBQUEsT0FBQTs7QUFFQSw0QkFBQSxFQUFBLEtBQUEsQ0FBQSxTQUFBLEtBQUEsSUFBQSxFQUFBO0FBQ0EsOEJBQUEsT0FBQSxHQUFBLEtBQUE7QUFDQTtBQUNBOzs7QUFHQSw0QkFBQSxtQkFBQSxFQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsbUNBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsU0FBQSxDQUFBLENBQUE7QUFDQSx5QkFGQSxFQUVBLENBRkEsQ0FBQTs7QUFJQSw0QkFBQSxXQUFBLEVBQUEsU0FBQTtBQUNBLDRCQUFBLFdBQUEsTUFBQSxDQUFBLEVBQUEsaUJBQUEsQ0FBQSxFQUFBLGlCQUFBLENBQUEsQ0FBQTtBQUNBLDBCQUFBLFNBQUEsR0FBQSxRQUFBOztBQUVBLDJDQUFBLEtBQUEsQ0FBQSxJQUFBOztBQUVBLCtCQUFBLFVBQUEs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LElBQUEsQ0FBQSxFQUFBLElBQUEsTUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EseUJBQUEsT0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLFNBTEEsRUFNQSxJQU5BLENBTUEsWUFBQTtBQUNBLG9CQUFBLEdBQUEsQ0FBQSxtQkFBQTtBQUNBLFNBUkE7O0FBVUEsWUFBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsUUFBQSxLQUFBLEtBQUE7QUFDQSxnQkFBQSxPQUFBLElBQUEsSUFBQSxDQUFBLEtBQUEsRUFBQSxPQUFBLEdBQUEsS0FBQTtBQUNBLDJCQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0EsU0FKQTs7QUFRQSxZQUFBLG9CQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxLQUFBLENBQUEsYUFBQSxRQUFBLEVBQUEsS0FBQSxDQUFBLGtCQUFBLENBQUE7QUFDQSx1QkFBQSxpQkFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsUUFBQSxFQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxRQUFBLENBQUE7O0FBR0EsWUFBQSxVQUFBLGVBQUEsVUFBQSxDQUFBO0FBQ0EsZ0JBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGlCQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxLQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxxQkFBQSxDQUFBLEVBQUEsT0FBQSxHQUFBLElBQUE7QUFDQSxxQkFBQSxDQUFBLEVBQUEsTUFBQSxHQUFBLEdBQUE7QUFDQSxxQkFBQSxDQUFBLEVBQUEsU0FBQSxHQUFBLEdBQUE7QUFDQSxxQkFBQSxDQUFBLEVBQUEsb0JBQUEsR0FBQSxHQUFBO0FBQ0EscUJBQUEsQ0FBQSxFQUFBLEtBQUEsR0FBQSxHQUFBO0FBQ0EscUJBQUEsQ0FBQSxFQUFBLEtBQUEsR0FBQSxHQUFBO0FBQ0Esd0JBQUEsS0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLFNBVkE7O0FBWUEsZUFBQSxNQUFBO0FBQ0EsZ0JBQUEsR0FBQSxDQUFBLE9BQUEsRUFBQTtBQUVBLEtBdERBOztBQXdEQSxXQUFBLFFBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBLEVBR0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQSxFQUlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSkEsRUFLQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUxBLEVBTUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FOQSxFQU9BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUEEsRUFRQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVJBLEVBU0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FUQSxFQVVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVkEsRUFXQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVhBLEVBWUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FaQSxDQUFBO0FBY0EsV0FBQSxTQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQURBLEVBRUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQSxFQUdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEEsRUFJQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUpBLEVBS0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FMQSxFQU1BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTkEsRUFPQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVBBLEVBUUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FSQSxFQVNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVEEsRUFVQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVZBLEVBV0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FYQSxFQVlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWkEsQ0FBQTtBQWNBLFdBQUEsV0FBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBLEVBSUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FKQSxFQUtBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQU5BLEVBT0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FQQSxFQVFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUkEsRUFTQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVRBLEVBVUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FWQSxFQVdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWEEsRUFZQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVpBLENBQUE7QUFjQSxXQUFBLFVBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBLEVBR0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQSxFQUlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSkEsRUFLQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxD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ZkEsRUFvQkE7QUFDQSxnQkFBQSxDQURBO0FBRUEsc0JBQUEsdUpBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBcEJBLEVBeUJBO0FBQ0EsZ0JBQUEsQ0FEQTtBQUVBLHNCQUFBLHVKQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXpCQSxFQThCQTtBQUNBLGdCQUFBLENBREE7QUFFQSxzQkFBQSx1SkFGQTtBQUdBLG1CQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQTtBQUlBLHNCQUFBO0FBSkEsU0E5QkEsRUFtQ0E7QUFDQSxnQkFBQSxDQURBO0FBRUEsc0JBQUEsdUpBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBbkNBLEVBd0NBO0FBQ0EsZ0JBQUEsQ0FEQTtBQUVBLHNCQUFBLHVKQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXhDQSxFQTZDQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSx1SkFGQTtBQUdBLG1CQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQTtBQUlBLHNCQUFBO0FBSkEsU0E3Q0EsRUFrREE7QUFDQSxnQkFBQSxFQURBO0FBRUEsc0JBQUEsdUpBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBbERBLEVBdURBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLHVKQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXZEQSxFQTREQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSx1SkFGQTtBQUdBLG1CQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQTtBQUlBLHNCQUFBO0FBSkEsU0E1REEsRUFpRUE7QUFDQSxnQkFBQSxFQURBO0FBRUEsc0JBQUEsdUpBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBakVBLEVBc0VBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLHVKQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXRFQSxFQTJFQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSx1SkFGQTtBQUdBLG1CQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQTtBQUlBLHNCQUFBO0FBSkEsU0EzRUEsRUFnRkE7QUFDQSxnQkFBQSxFQURBO0FBRUEsc0JBQUEsdUpBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBaEZBLEVBcUZBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLHVKQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXJGQSxFQTBGQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSx1SkFGQTtBQUdBLG1CQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQTtBQUlBLHNCQUFBO0FBSkEsU0ExRkEsRUErRkE7QUFDQSxnQkFBQSxFQURBO0FBRUEsc0JBQUEsdUpBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBL0ZBLEVBb0dBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLHVKQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXBHQSxFQXlHQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxz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QUFBLE1BQUEsRUFBQTtBQUNBLHdCQUFBO0FBREEsU0FBQTtBQUdBLEtBck5BOztBQXVOQSxXQUFBLFlBQUEsR0FBQSxZQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsVUFBQTtBQUNBLEtBRkE7QUFHQSxDQS9OQTs7QUNSQTs7QUFFQSxTQUFBLE1BQUEsQ0FBQSxHQUFBLEVBQUE7O0FBRUEsU0FBQSxHQUFBLEdBQUEsR0FBQTs7QUFFQSxTQUFBLE1BQUEsR0FBQSxHQUFBOzs7QUFHQSxTQUFBLEtBQUEsR0FBQSxHQUFBOzs7O0FBSUEsU0FBQSxTQUFBLEdBQUEsR0FBQTs7O0FBR0EsU0FBQSxvQkFBQSxHQUFBLEdBQUE7OztBQUdBLFNBQUEsS0FBQSxHQUFBLEdBQUE7OztBQUdBLFNBQUEsT0FBQSxHQUFBLElBQUE7QUFDQTtBQUNBLE9BQUEsU0FBQSxDQUFBLEVBQUEsR0FBQSxZQUFBO0FBQ0EsWUFBQSxHQUFBLENBQUEsSUFBQTtBQUNBLENBRkE7O0FBSUEsT0FBQSxTQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUE7O0FBRUEsUUFBQSxJQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxJQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxjQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQ0EsU0FBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxNQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsU0FBQSxLQUFBLENBQUEsU0FBQSxHQUFBLElBQUE7OztBQUdBLFNBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7OztBQUdBLFNBQUEsb0JBQUEsR0FBQSxLQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsS0FBQSxDQUFBO0FBQ0EsQ0FiQTs7QUFlQSxPQUFBLFNBQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUEsUUFBQSxFQUFBLElBQUEsRUFBQTtBQUNBLFFBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxFQUFBO0FBQ0EsZUFBQSxNQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtBQUNBLEtBRkEsTUFFQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsRUFBQTtBQUNBLGVBQUEsTUFBQSxTQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxLQUZBLE1BRUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLEVBQUE7QUFDQSxlQUFBLE1BQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQ0EsS0FGQSxNQUVBO0FBQ0EsZUFBQSxNQUFBLFNBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBO0FBQ0EsQ0FWQTs7QUFhQSxPQUFBLFNBQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUE7O0FBRUEsUUFBQSxZQUFBLFFBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGVBQUEsQ0FBQSxTQUFBLFNBQUEsSUFBQSxhQUFBLEdBQUE7QUFDQSxLQUZBLEVBRUEsQ0FGQSxDQUFBO0FBR0EsV0FBQSxTQUFBO0FBQ0EsQ0FOQTs7QUFTQSxPQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxRQUFBLGVBQUEsS0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGVBQUEsU0FBQSxTQUFBO0FBQ0EsS0FGQSxDQUFBOztBQUlBLFFBQUEsS0FBQSxLQUFBLENBQUEsSUFBQSxJQUFBLGFBQUEsTUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLE9BQUEsR0FBQSxLQUFBO0FBQ0EsQ0FOQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIHRzdXJvID0gYW5ndWxhci5tb2R1bGUoJ1RzdXJvJywgWyd1aS5yb3V0ZXInLCAnZmlyZWJhc2UnXSk7XG5cbnRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHtcbiAgICAgICAgYXBpS2V5OiBcIkFJemFTeUNMbTNqa2s1cHBNcWVReEtvSC1kWjlDZFlNYURHV1dxVVwiLFxuICAgICAgICBhdXRoRG9tYWluOiBcInRoZS1wYXRocy1vZi1kcmFnb25zLmZpcmViYXNlYXBwLmNvbVwiLFxuICAgICAgICBkYXRhYmFzZVVSTDogXCJodHRwczovL3RoZS1wYXRocy1vZi1kcmFnb25zLmZpcmViYXNlaW8uY29tXCIsXG4gICAgICAgIHN0b3JhZ2VCdWNrZXQ6IFwidGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb21cIixcbiAgICB9O1xuICAgIGZpcmViYXNlLmluaXRpYWxpemVBcHAoY29uZmlnKTtcbn0pO1xuXG50c3Vyby5jb25zdGFudCgnZmlyZWJhc2VVcmwnLCAnaHR0cHM6Ly9wYXRoLW9mLXRoZS1kcmFnb24uZmlyZWJhc2Vpby5jb20vJyk7XG5cbnRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xufSk7XG4iLCJmdW5jdGlvbiBCb2FyZCgpIHtcbiAgICB0aGlzLmJvYXJkID0gW107XG59XG5cbkJvYXJkLnByb3RvdHlwZS5kcmF3Qm9hcmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCA2OyB5KyspIHtcbiAgICAgICAgaWYgKCF0aGlzLmJvYXJkW3ldKSB0aGlzLmJvYXJkW3ldID0gW107XG4gICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgNjsgeCsrKSB7XG4gICAgICAgICAgICB0aGlzLmJvYXJkW3ldLnB1c2gobmV3IFNwYWNlKHgsIHksIHRoaXMuYm9hcmQpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5ib2FyZDtcbn1cblxuZnVuY3Rpb24gU3BhY2UoeCwgeSwgYm9hcmQpIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgdGhpcy50aWxlID0gXCJuXCI7XG4gICAgdGhpcy5wb2ludHMgPSBbbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbF07XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICBsZXQgY29ycmVzcG9uZGluZztcblxuICAgICAgICBpZiAoaSA8IDIpIHsgLy90b3BcbiAgICAgICAgICAgIGNvcnJlc3BvbmRpbmcgPSBpID09PSAwID8gNSA6IDQ7IC8vIDAgLT4gNSAmIDEgLT4gNFxuICAgICAgICAgICAgaWYgKHkgPT09IDApIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KHRydWUsIFt7XG4gICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICB5OiB5LFxuICAgICAgICAgICAgICAgIGk6IGlcbiAgICAgICAgICAgIH1dKTtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucG9pbnRzW2ldID0gYm9hcmRbeSAtIDFdW3hdLnBvaW50c1tjb3JyZXNwb25kaW5nXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChpIDwgNCkgeyAvL3JpZ2h0XG4gICAgICAgICAgICBjb3JyZXNwb25kaW5nID0gaSA9PT0gMiA/IDcgOiA2O1xuICAgICAgICAgICAgaWYgKHggPT09IDUpIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KHRydWUsIFt7XG4gICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICB5OiB5LFxuICAgICAgICAgICAgICAgIGk6IGlcbiAgICAgICAgICAgIH1dKTtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KGZhbHNlLCBbe1xuICAgICAgICAgICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgICAgICAgICB5OiB5LFxuICAgICAgICAgICAgICAgICAgICBpOiBpXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICB4OiB4ICsgMSxcbiAgICAgICAgICAgICAgICAgICAgeTogeSxcbiAgICAgICAgICAgICAgICAgICAgaTogY29ycmVzcG9uZGluZ1xuICAgICAgICAgICAgICAgIH1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChpIDwgNikgeyAvL2JvdHRvbVxuICAgICAgICAgICAgY29ycmVzcG9uZGluZyA9IGkgPT09IDQgPyAxIDogMDtcbiAgICAgICAgICAgIGlmICh5ID09PSA1KSB0aGlzLnBvaW50c1tpXSA9IG5ldyBQb2ludCh0cnVlLCBbe1xuICAgICAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICAgICAgeTogeSxcbiAgICAgICAgICAgICAgICBpOiBpXG4gICAgICAgICAgICB9XSk7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBvaW50c1tpXSA9IG5ldyBQb2ludChmYWxzZSwgW3tcbiAgICAgICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICAgICAgeTogeSxcbiAgICAgICAgICAgICAgICAgICAgaTogaVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICAgICAgeTogeSArIDEsXG4gICAgICAgICAgICAgICAgICAgIGk6IGNvcnJlc3BvbmRpbmdcbiAgICAgICAgICAgICAgICB9XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7IC8vbGVmdFxuICAgICAgICAgICAgY29ycmVzcG9uZGluZyA9IGkgPT09IDYgPyAzIDogMjsgLy8gNiAtPiAzICYgNyAtPiAyXG4gICAgICAgICAgICBpZiAoeCA9PT0gMCkgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQodHJ1ZSwgW3tcbiAgICAgICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgICAgIHk6IHksXG4gICAgICAgICAgICAgICAgaTogaVxuICAgICAgICAgICAgfV0pO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb2ludHNbaV0gPSBib2FyZFt5XVt4IC0gMV0ucG9pbnRzW2NvcnJlc3BvbmRpbmddO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5cbi8vIGVkZ2UgPSBib29sZWFuXG5mdW5jdGlvbiBQb2ludChlZGdlLCBzcGFjZSkge1xuICAgIHRoaXMuZWRnZSA9IGVkZ2U7XG4gICAgdGhpcy5uZWlnaGJvcnMgPSBbXCJuXCJdO1xuICAgIHRoaXMudHJhdmVsbGVkID0gZmFsc2U7XG4gICAgdGhpcy5zcGFjZXMgPSBzcGFjZTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuY2xhc3MgRGVjayB7XG4gICAgY29uc3RydWN0b3IodGlsZXMpIHtcbiAgICAgICAgdGhpcy50aWxlcyA9IHRpbGVzXG4gICAgfVxuXG4gICAgc2h1ZmZsZSgpIHtcbiAgICAgICAgdGhpcy50aWxlcyA9IF8uc2h1ZmZsZSh0aGlzLnRpbGVzKVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBkZWFsVGhyZWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGVzLnNwbGljZSgwLCAzKTtcbiAgICB9XG5cbiAgICBkZWFsKG51bSkge1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlcy5zcGxpY2UoMCwgbnVtKTtcbiAgICB9XG5cbiAgICByZWxvYWQodGlsZXMpIHtcbiAgICAgICAgdGhpcy50aWxlcy5wdXNoKHRpbGVzKVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vR0FNRS8vL1xuXG5jbGFzcyBHYW1lIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuY291bnQgPSAzNTtcbiAgICAgICAgdGhpcy5ib2FyZCA9IG5ldyBCb2FyZCgpLmRyYXdCb2FyZCgpO1xuICAgICAgICB0aGlzLnBsYXllcnMgPSBbXTtcbiAgICAgICAgdGhpcy5hdmFpbGFibGVNYXJrZXJzID0gW1wicmVkXCIsIFwib3JhbmdlXCIsIFwieWVsbG93XCIsIFwiZ3JlZW5cIiwgXCJhcXVhXCIsIFwiYmx1ZVwiLCBcIm5hdnlcIiwgXCJwdXJwbGVcIl1cblxuICAgICAgICAvL2luZGV4IG9mIHRoZSBjdXJyZW50UGxheWVyIGluIHRoZSBwbGF5ZXJzXG4gICAgICAgIHRoaXMuY3VyclBsYXllcjtcblxuICAgICAgICB0aGlzLmRyYWdvbiA9IG51bGw7XG4gICAgICAgIHRoaXMubW92ZXM7XG4gICAgfVxuXG4gICAgZ2V0Q3VycmVudFBsYXllcigpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VyclBsYXllciA9PT0gLTEpIHJldHVybjtcbiAgICAgICAgcmV0dXJuIHRoaXMucGxheWVyc1t0aGlzLmN1cnJQbGF5ZXJdO1xuICAgIH1cblxuICAgIG1vdmVBbGxQbGF5ZXJzKCkge1xuICAgICAgICB0aGlzLnBsYXllcnMuZm9yRWFjaCgocGxheWVyKSA9PiBwbGF5ZXIua2VlcE1vdmluZyhwbGF5ZXIpKVxuICAgIH1cblxuICAgIGRlYWRQbGF5ZXJzKCkge1xuICAgICAgICB2YXIgZGVhZFBsYXllcnNUaWxlcyA9IFtdO1xuICAgICAgICB0aGlzLnBsYXllcnMuZm9yRWFjaChmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAgICAgICBpZiAoIXBsYXllci5jYW5QbGF5ICYmIHBsYXllci50aWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgZGVhZFBsYXllcnNUaWxlcy5wdXNoKHBsYXllci50aWxlcyk7XG4gICAgICAgICAgICAgICAgaXNEZWFkUGxheWVyID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkZWFkUGxheWVyc1RpbGVzO1xuICAgIH1cblxuICAgIGNoZWNrT3ZlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q2FuUGxheSgpLmxlbmd0aCA8PSAxO1xuICAgIH1cblxuICAgIC8vdG8gYmUgY2FsbGVkIGF0IHRoZSBlbmQgb2YgYSB0dXJuIHRvIHNldCB0aGUgY3VyclBsYXllciB0byB0aGUgbmV4dCBlbGlnaWJsZSBwbGF5ZXIgaW4gdGhlIHBsYXllcnMgYXJyYXk7XG4gICAgZ29Ub05leHRQbGF5ZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLmdldENhblBsYXkoKS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmN1cnJQbGF5ZXIsIFwiY3VyclBsYXllclwiLCBcInBsYXllcnNcIiwgdGhpcy5wbGF5ZXJzKVxuICAgICAgICAgICAgbGV0IG5ld0lkeCA9IHRoaXMuY3VyclBsYXllciArIDEgPj0gdGhpcy5wbGF5ZXJzLmxlbmd0aCA/IDAgOiB0aGlzLmN1cnJQbGF5ZXIgKyAxO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJuZXdJZHhcIiwgbmV3SWR4KVxuICAgICAgICAgICAgd2hpbGUgKG5ld0lkeCA8IHRoaXMucGxheWVycy5sZW5ndGggJiYgIXRoaXMucGxheWVyc1tuZXdJZHhdLmNhblBsYXkpIHtcbiAgICAgICAgICAgICAgICBuZXdJZHgrKztcbiAgICAgICAgICAgICAgICBpZiAobmV3SWR4ID09PSB0aGlzLnBsYXllcnMubGVuZ3RoKSBuZXdJZHggPSAwO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG5ld0lkeClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY3VyclBsYXllciA9IG5ld0lkeDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY3VyclBsYXllciA9IC0xO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmdldEN1cnJlbnRQbGF5ZXIoKTtcbiAgICB9XG5cbiAgICBkZWFsKG51bSkge1xuICAgICAgICB2YXIgdGlsZXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW07IGkrKykge1xuICAgICAgICAgICAgdmFyIHRpbGUgPSB0aGlzLmRlY2tbMF0uc3BsaWNlKDAsIDEpO1xuICAgICAgICAgICAgdGhpcy5kZWNrLiRzYXZlKDApLnRoZW4oZnVuY3Rpb24gKHJlZikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkZWFsdCBhIGNhcmQhJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRpbGVzID0gdGlsZXMuY29uY2F0KHRpbGUpO1xuICAgICAgICAgICAgY29uc29sZS5sb2codGlsZXMpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRpbGVzO1xuICAgIH1cblxuICAgIGdldENhblBsYXkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBsYXllcnMuZmlsdGVyKChwbGF5ZXIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBwbGF5ZXIuY2FuUGxheVxuICAgICAgICB9KVxuICAgIH1cblxufVxuIiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2dhbWUnLCB7XG4gICAgICAgIHVybDogJy9nYW1lLzpnYW1lTmFtZScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2Jyb3dzZXIvanMvZ2FtZS9nYW1lLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnZ2FtZUN0cmwnXG4gICAgfSk7XG59KTtcblxuXG50c3Vyby5jb250cm9sbGVyKCdnYW1lQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGZpcmViYXNlQXV0aCwgZmlyZWJhc2VVcmwsICRzdGF0ZVBhcmFtcywgJGZpcmViYXNlT2JqZWN0LCAkZmlyZWJhc2VBcnJheSwgJHN0YXRlKSB7XG5cbiAgICB2YXIgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbiAgICB2YXIgb2JqID0gJGZpcmViYXNlT2JqZWN0KHJlZik7XG5cbiAgICB2YXIgZ2FtZVJlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZCgkc3RhdGVQYXJhbXMuZ2FtZU5hbWUpO1xuICAgIHZhciBnYW1lQXJyID0gZ2FtZVJlZi5jaGlsZCgkc3RhdGVQYXJhbXMuZ2FtZU5hbWUpO1xuXG4gICAgdmFyIGluaXRpYWxEZWNrUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKCRzdGF0ZVBhcmFtcy5nYW1lTmFtZSkuY2hpbGQoJ2luaXRpYWxEZWNrJyk7XG4gICAgdmFyIGluaXRpYWxEZWNrQXJyID0gJGZpcmViYXNlQXJyYXkoaW5pdGlhbERlY2tSZWYpO1xuXG4gICAgdmFyIGRlY2tSZWYgPSBnYW1lUmVmLmNoaWxkKCdkZWNrJyk7XG4gICAgdmFyIGRlY2tBcnIgPSAkZmlyZWJhc2VBcnJheShkZWNrUmVmKTtcblxuICAgIHZhciBwbGF5ZXJzUmVmID0gZ2FtZVJlZi5jaGlsZCgncGxheWVycycpO1xuICAgIHZhciBmaXJlYmFzZVBsYXllcnNBcnIgPSAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKTtcblxuICAgIHZhciBtYXJrZXJzUmVmID0gZ2FtZVJlZi5jaGlsZCgnYXZhaWxhYmxlTWFya2VycycpO1xuICAgIHZhciBtYXJrZXJzQXJyID0gJGZpcmViYXNlQXJyYXkobWFya2Vyc1JlZik7XG5cbiAgICB2YXIgbW92ZXNSZWYgPSBnYW1lUmVmLmNoaWxkKCdtb3ZlcycpO1xuICAgIHZhciBtb3Zlc0FyciA9ICRmaXJlYmFzZUFycmF5KG1vdmVzUmVmKTtcblxuICAgIHZhciBib2FyZFJlZiA9IGdhbWVSZWYuY2hpbGQoJ2JvYXJkJyk7XG4gICAgdmFyIGJvYXJkQXJyID0gJGZpcmViYXNlQXJyYXkoYm9hcmRSZWYpO1xuXG4gICAgdmFyIHBsYXllciA9IE9iamVjdC5jcmVhdGUoUGxheWVyLnByb3RvdHlwZSk7XG5cbiAgICAvKioqKioqKioqKioqKioqKlxuICAgIElOSVRJQUxJWklORyBHQU1FXG4gICAgKioqKioqKioqKioqKioqKi9cblxuICAgIC8vbmV3IGxvY2FsIGdhbWUgd2l0aCBnYW1lIG5hbWUgZGVmaW5lZCBieSB1cmxcbiAgICAkc2NvcGUuZ2FtZSA9IG5ldyBHYW1lKCRzdGF0ZVBhcmFtcy5nYW1lTmFtZSk7XG5cbiAgICAvL3doZW4gdGhlIGJvYXJkIGlzIGxvYWRlZC4uLlxuICAgIGJvYXJkQXJyLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgaWYgKCFkYXRhLmxlbmd0aCkge1xuICAgICAgICAgICAgYm9hcmRBcnIuJGFkZCgkc2NvcGUuZ2FtZS5ib2FyZCk7XG4gICAgICAgIH1cbiAgICAgICAgJHNjb3BlLmdhbWUuYm9hcmQgPSBib2FyZEFycjtcblxuICAgICAgICAvL3dhdGNoaW5nIGJvYXJkIGZvciBjaGFuZ2VzXG4gICAgICAgIGJvYXJkUmVmLm9uKCdjaGlsZF9jaGFuZ2VkJywgZnVuY3Rpb24oc25hcCkge1xuICAgICAgICAgICAgLy9ORUVEIFRPIFJFVFVSTiBUTyBDSEVDSyBCT0FSRFxuICAgICAgICAgICAgY29uc29sZS5sb2coc25hcCk7XG4gICAgICAgICAgICAkc2NvcGUuZ2FtZS5ib2FyZCA9IHNuYXAudmFsKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgJHNjb3BlLnNwYWNlcyA9IF8uZmxhdHRlbigkc2NvcGUuZ2FtZS5ib2FyZCk7XG5cblxuICAgIC8vd2hlbiB0aGUgZGVjayBpcyBsb2FkZWQuLi5cbiAgICBkZWNrQXJyLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgICAgICAkc2NvcGUuZ2FtZS5kZWNrID0gZGVja0FycjsgLy9hZGQgdGhlIGRlY2sgdG8gdGhlIGxvY2FsIGdhbWUgPyBUcnkgdGhpcyBhcyBmaXJlYmFzZSBEZWNrQXJyPz8/P1xuXG4gICAgICAgIC8vZG9uJ3Qgc3RhcnQgd2F0Y2hpbmcgcGxheWVycyB1bnRpbCB0aGVyZSBpcyBhIGRlY2sgaW4gdGhlIGdhbWVcbiAgICAgICAgcGxheWVyc1JlZi5vbihcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXApIHtcbiAgICAgICAgICAgIHZhciBzbmFwUGxheWVycyA9IHNuYXAudmFsKCk7IC8vZ3JhYiB0aGUgdmFsdWUgb2YgdGhlIHNuYXBzaG90IChhbGwgcGxheWVycyBpbiBnYW1lIGluIEZpcmViYXNlKVxuXG4gICAgICAgICAgICAvL2ZvciBlYWNoIHBsYXllciBpbiB0aGlzIGNvbGxlY3Rpb24uLi5cbiAgICAgICAgICAgIGZvciAodmFyIHRoaXNQbGF5ZXIgaW4gc25hcFBsYXllcnMpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXhpc3RpbmdQbGF5ZXJJbmRleCwgdGhpc0lzQU5ld1BsYXllcjtcblxuICAgICAgICAgICAgICAgIC8vZmluZCB0aGlzICdzbmFwJyBwbGF5ZXIncyBpbmRleCBpbiBsb2NhbCBnYW1lLiBmaW5kIHJldHVybnMgdGhhdCB2YWx1ZS5cbiAgICAgICAgICAgICAgICB2YXIgbG9jYWxQbGF5ZXIgPSAkc2NvcGUuZ2FtZS5wbGF5ZXJzLmZpbmQoZnVuY3Rpb24ocGx5ciwgcGx5cklkeCkge1xuICAgICAgICAgICAgICAgICAgICBleGlzdGluZ1BsYXllckluZGV4ID0gcGx5cklkeDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBseXIudWlkID09PSBzbmFwUGxheWVyc1t0aGlzUGxheWVyXS51aWQ7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvL2lmIG5vdCBmb3VuZCwgY3JlYXRlIG5ldyBwbGF5ZXJcbiAgICAgICAgICAgICAgICBpZiAoIWxvY2FsUGxheWVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpIGRpZG50IGZpbmQgYSBsb2NhbCBwbGF5ZXIhJyk7XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsUGxheWVyID0gbmV3IFBsYXllcihzbmFwUGxheWVyc1t0aGlzUGxheWVyXS51aWQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzSXNBTmV3UGxheWVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvL2ZvciBlYWNoIGtleSBpbiB0aGUgc25hcFBsYXllcidzIGtleXMsIGFkZCB0aGF0IGtleSBhbmQgdmFsdWUgdG8gbG9jYWwgcGxheWVyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgcGxheWVycHJvcGVydHkgaW4gc25hcFBsYXllcnNbdGhpc1BsYXllcl0pIHtcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxQbGF5ZXJbcGxheWVycHJvcGVydHldID0gc25hcFBsYXllcnNbdGhpc1BsYXllcl1bcGxheWVycHJvcGVydHldO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vcHVzaCBsb2NhbCBwbGF5ZXIgdG8gZ2FtZS5wbGF5ZXJzXG4gICAgICAgICAgICAgICAgaWYgKHRoaXNJc0FOZXdQbGF5ZXIpICRzY29wZS5nYW1lLnBsYXllcnMucHVzaChsb2NhbFBsYXllcik7XG4gICAgICAgICAgICAgICAgZWxzZSAkc2NvcGUuZ2FtZS5wbGF5ZXJzW2V4aXN0aW5nUGxheWVySW5kZXhdID0gbG9jYWxQbGF5ZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cblxuXG4gICAgLy93aGVuIHRoYXQgbWFya2VycyBhcnJheSBpcyBsb2FkZWQsIHVwZGF0ZSB0aGUgYXZhaWxhYmxlIG1hcmtlcnMgYXJyYXkgb24gc2NvcGVcbiAgICBtYXJrZXJzQXJyLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgJHNjb3BlLmdhbWUuYXZhaWxhYmxlTWFya2VycyA9IGRhdGFbMF07XG4gICAgfSk7XG5cbiAgICAvL2lmIHNvbWVvbmUgZWxzZSBwaWNrcyBhIG1hcmtlciwgdXBkYXRlIHlvdXIgdmlld1xuICAgIG1hcmtlcnNSZWYub24oJ2NoaWxkX2NoYW5nZWQnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICRzY29wZS5nYW1lLmF2YWlsYWJsZU1hcmtlcnMgPSBkYXRhLnZhbCgpO1xuICAgIH0pO1xuXG4gICAgLy9vbiBsb2dpbiwgZmluZCBtZSBpbiB0aGUgZmlyZWJhc2UgcGxheWVycyBhcnJheVxuICAgIGZpcmViYXNlLmF1dGgoKS5vbkF1dGhTdGF0ZUNoYW5nZWQoZnVuY3Rpb24odXNlcikge1xuICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24ocGxheWVycykge1xuXG4gICAgICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgICAgIHZhciBtZUlkeDtcbiAgICAgICAgICAgICAgICBwbGF5ZXJzLmZpbmQoZnVuY3Rpb24oZSwgaSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZS51aWQgPT09IHVzZXIudWlkKSBtZUlkeCA9IGk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAkc2NvcGUubWUgPSBwbGF5ZXJzW21lSWR4XTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZ2FtZS5jdXJyUGxheWVyID0gbWVJZHg7XG5cblxuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUubWUubWFya2VyID09PSBcIm5cIikgJHNjb3BlLm1lLm1hcmtlciA9IG51bGw7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gTm8gdXNlciBpcyBzaWduZWQgaW4uXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJubyBvbmUgaXMgbG9nZ2VkIGluXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2ltIGhlcmUhISEhISEhIScpXG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG5cbiAgICAvKioqKioqKioqKioqKioqKlxuICAgIEFWQUlMQUJMRSBQTEFZRVIgQUNUSU9OUyBBVCBHQU1FIFNUQVJUXG4gICAgKioqKioqKioqKioqKioqKi9cblxuICAgICRzY29wZS5waWNrTWFya2VyID0gZnVuY3Rpb24obWFya2VyKSB7XG4gICAgICAgIGJvYXJkQXJyLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIHBpY2tNYXJrZXJGbihkYXRhLCBtYXJrZXIpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgdmFyIHBpY2tNYXJrZXJGbiA9IGZ1bmN0aW9uKGJvYXJkLCBtYXJrZXIpIHtcblxuICAgICAgICAkc2NvcGUubWUubWFya2VyID0gbWFya2VyO1xuXG4gICAgICAgIGZpcmViYXNlUGxheWVyc0Fyci4kbG9hZGVkKClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHBsYXllcnMpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWVJZHg7XG4gICAgICAgICAgICAgICAgLy9maW5kIG15IGluZGV4IGluIHRoZSBwbGF5ZXJzIGFycmF5XG4gICAgICAgICAgICAgICAgcGxheWVycy5maW5kKGZ1bmN0aW9uKGUsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUuJGlkID09PSAkc2NvcGUubWUuJGlkKSBtZUlkeCA9IGk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy9naXZlIG1lIGEgbWFya2VyIGFuZCBzYXZlIG1lIGluIGZpcmViYXNlXG4gICAgICAgICAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS5tYXJrZXIgPSBtYXJrZXI7XG4gICAgICAgICAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyLiRzYXZlKG1lSWR4KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBpZHggPSAkc2NvcGUuZ2FtZS5hdmFpbGFibGVNYXJrZXJzLmluZGV4T2YobWFya2VyKTtcblxuICAgICAgICBtYXJrZXJzQXJyWzBdLnNwbGljZShpZHgsIDEpO1xuXG4gICAgICAgIG1hcmtlcnNBcnIuJHNhdmUoMClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlZikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlZCB0aGUgcGlja2VkIG1hcmtlclwiKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZWYua2V5KTtcbiAgICAgICAgICAgIH0pO1xuICAgIH07XG5cblxuICAgIC8vVE9ETzogbGltaXQgc3RhcnQgcG9pbnRzXG5cbiAgICAkc2NvcGUucGxhY2VNYXJrZXIgPSBmdW5jdGlvbihwb2ludCkge1xuICAgICAgICBib2FyZEFyci4kbG9hZGVkKCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICBwbGFjZU1hcmtlckZuKGRhdGEsIHBvaW50KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vYWRkaW5nIGEgYm9hcmQgdG8gZmlyZWJhc2VcbiAgICAvL0hhdmUgcGxheWVyIHBpY2sgdGhlaXIgc3RhcnQgcG9pbnRcbiAgICB2YXIgcGxhY2VNYXJrZXJGbiA9IGZ1bmN0aW9uKGJvYXJkLCBwb2ludCkge1xuICAgICAgICBjb25zb2xlLmxvZyhib2FyZCk7XG4gICAgICAgIC8vIHBsYWNlIG15IG1hcmtlclxuICAgICAgICBwbGF5ZXIucGxhY2VNYXJrZXIoYm9hcmQsIHBvaW50LCAkc2NvcGUubWUpO1xuICAgICAgICAvLyBkZWFsIG1lIHRocmVlIGNhcmRzXG4gICAgICAgICRzY29wZS5tZS50aWxlcyA9ICRzY29wZS5nYW1lLmRlYWwoMyk7XG5cbiAgICAgICAgLy8gd2hlbiB0aGUgZmlyZWJhc2UgcGxheWVycyBhcmUgbG9hZGVkLi4uLlxuICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJGxvYWRlZCgpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihwbGF5ZXJzKSB7XG4gICAgICAgICAgICAgICAgLy9maW5kIG1lIGluIHRoZSBmaXJlYmFzZSBwbGF5ZXJzIGFycmF5XG4gICAgICAgICAgICAgICAgdmFyIG1lSWR4O1xuICAgICAgICAgICAgICAgIHBsYXllcnMuZmluZChmdW5jdGlvbihlLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlLnVpZCA9PT0gJHNjb3BlLm1lLnVpZCkgbWVJZHggPSBpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XSA9ICRzY29wZS5tZTsgLy9zZXQgZmlyZWJhc2UgbWUgdG8gbG9jYWwgbWVcblxuICAgICAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0Fyci4kc2F2ZShtZUlkeCk7IC8vc2F2ZSBpdC5cbiAgICAgICAgICAgIH0pO1xuICAgIH07XG5cblxuXG5cblxuXG5cblxuICAgIC8vIFRPRE86IHdlIHByb2JhYmx5IG5lZWQgdGhpcyBvbiBmaXJlYmFzZSBzbyBvdGhlciBwZW9wbGUgY2FuJ3QgcGljayB3aGF0J3MgYmVlbiBwaWNrZWRcblxuICAgIC8vRm9yIHN5bmNocm9uaXppbmdHYW1lLi4uXG4gICAgLy8gdmFyIHN5bmNSZWYgPSBnYW1lUmVmLmNoaWxkKCdtb3ZlcycpO1xuICAgIC8vIHN5bmNSZWYub24oJ2NoaWxkX2FkZGVkJywgZnVuY3Rpb24gKGNoaWxkU25hcHNob3QsIHByZXZDaGlsZEtleSkge1xuICAgIC8vICAvL05FRUQgVE8gRE9VQkxFIENIRUNLISEgV2hhdCBkb2VzIGNoaWxkU25hcCByZXR1cm5zP1xuICAgIC8vICBjb25zb2xlLmxvZygnY2hpbGRTbmFwc2hvdF9TeW5jR2FtZScsIGNoaWxkU25hcHNob3QpO1xuICAgIC8vICAvL2RlcGVuZGluZyBvbiB3aGF0IGNoaWxkU25hcHNob3QgZ2l2ZXMgbWUuLi5JIHRoaW5rIGl0J3Mgb25lIGNoaWxkIHBlciBvbiBjYWxsPyBJdCBkb2Vzbid0IHJldHVybiBhbiBhcnJheSBvZiBjaGFuZ2VzLi4uSSBiZWxpZXZlIVxuICAgIC8vICBpZiAoY2hpbGRTbmFwc2hvdC50eXBlID09PSAndXBkYXRlRGVjaycpIHtcbiAgICAvLyAgICAgICRzY29wZS5nYW1lLmRlY2sgPSBjaGlsZFNuYXBzaG90LnVwZGF0ZURlY2s7XG4gICAgLy8gIH0gZWxzZSB7XG4gICAgLy8gICAgICAkc2NvcGUucGxhY2VUaWxlKGNoaWxkU25hcHNob3QudGlsZSk7XG4gICAgLy8gIH1cbiAgICAvLyB9KTtcblxuICAgIC8vIFRPRE86IGhvdyB0byByZS1kbyB0aGUgbW92ZXM/XG4gICAgLy8gJHNjb3BlLmdhbWUubW92ZXM7XG5cbiAgICAvLyBUT0RPOiBob3cgZG8gd2Ugc2hvdyB0aGUgdGlsZXMgZm9yIHBsYXllcj9cblxuICAgIC8vIFRPRE86IGhvdyB0byBzaG93IHRoZSByb3RhdGVkIHRpbGU/XG5cbiAgICAvLyBDTVQ6IGFzc3VtaW5nIHdlIHVzZSBuZXcgR2FtZSgpIGZvciBlYWNoIGdhbWVcbiAgICAkc2NvcGUuY3VycmVudFBsYXllciA9ICRzY29wZS5nYW1lLmdldEN1cnJlbnRQbGF5ZXIoKTtcblxuICAgIC8vIFRPRE86IG5lZWQgYSBmdW5jdGlvbiB0byBhc3NpZ24gZHJhZ29uXG4gICAgJHNjb3BlLmRyYWdvbjtcbiAgICB2YXIgYXdhaXRpbmdEcmFnb25Ib2xkZXJzID0gW107XG5cbiAgICAkc2NvcGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgLy9cbiAgICB9O1xuXG4gICAgJHNjb3BlLm15VHVybiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAkc2NvcGUubWUgPT09ICRzY29wZS5jdXJyZW50UGxheWVyO1xuICAgIH07XG5cbiAgICAvL3RoZXNlIGFyZSB0aWVkIHRvIGFuZ3VsYXIgbmctY2xpY2sgYnV0dG9uc1xuICAgICRzY29wZS5yb3RhdGVUaWxlQ3cgPSBmdW5jdGlvbih0aWxlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicm90YXRlIHRvIHJpZ2h0XCIpO1xuICAgICAgICB0aWxlLnJvdGF0aW9uKys7XG4gICAgICAgIGlmICh0aWxlLnJvdGF0aW9uID09PSA0KSB0aWxlLnJvdGF0aW9uID0gMDtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnJvdGF0ZVRpbGVDY3cgPSBmdW5jdGlvbih0aWxlKSB7XG4gICAgICAgIHRpbGUucm90YXRpb24tLTtcbiAgICAgICAgaWYgKHRpbGUucm90YXRpb24gPT09IC00KSB0aWxlLnJvdGF0aW9uID0gMDtcbiAgICB9O1xuXG4gICAgLy8gQ01UOiB1c2UgcGxheWVyJ3MgYW5kIGdhbWUncyBwcm90b3R5cGUgZnVuY3Rpb24gdG8gcGxhY2UgdGlsZSBhbmQgdGhlbiBtb3ZlIGFsbCBwbGF5ZXJzXG4gICAgJHNjb3BlLnBsYWNlVGlsZSA9IGZ1bmN0aW9uKHRpbGUpIHtcbiAgICAgICAgLy8gVE9ETzogc2VuZCB0aGlzIHN0YXRlIHRvIGZpcmViYXNlIGV2ZXJ5IHRpbWUgaXQncyBjYWxsZWRcbiAgICAgICAgaWYgKHRpbGUucm90YXRpb24gPiAwKSB7XG4gICAgICAgICAgICB0aWxlLnBhdGhzID0gdGlsZS5wYXRocy5tYXAoZnVuY3Rpb24oY29ubmVjdGlvbikge1xuICAgICAgICAgICAgICAgIGNvbm5lY3Rpb24gPSBjb25uZWN0aW9uICsgMjtcbiAgICAgICAgICAgICAgICBpZiAoY29ubmVjdGlvbiA9PT0gOSkgY29ubmVjdGlvbiA9IDE7XG4gICAgICAgICAgICAgICAgaWYgKGNvbm5lY3Rpb24gPT09IDgpIGNvbm5lY3Rpb24gPSAwO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb25uZWN0aW9uO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aWxlLnBhdGhzLnVuc2hpZnQodGlsZS5wYXRocy5wb3AoKSk7XG4gICAgICAgICAgICB0aWxlLnBhdGhzLnVuc2hpZnQodGlsZS5wYXRocy5wb3AoKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGlsZS5yb3RhdGlvbiA8IDApIHtcbiAgICAgICAgICAgIHRpbGUucGF0aHMgPSB0aWxlLnBhdGhzLm1hcChmdW5jdGlvbihjb25uZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbiA9IGNvbm5lY3Rpb24gLSAyO1xuICAgICAgICAgICAgICAgIGlmIChjb25uZWN0aW9uID09PSAtMikgY29ubmVjdGlvbiA9IDY7XG4gICAgICAgICAgICAgICAgaWYgKGNvbm5lY3Rpb24gPT09IC0xKSBjb25uZWN0aW9uID0gNztcbiAgICAgICAgICAgICAgICByZXR1cm4gY29ubmVjdGlvbjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGlsZS5wYXRocy5wdXNoKHRpbGUucGF0aHMuc2hpZnQoKSk7XG4gICAgICAgICAgICB0aWxlLnBhdGhzLnB1c2godGlsZS5wYXRocy5zaGlmdCgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBmaXJlYmFzZVBsYXllcnNBcnIgPSAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKTtcbiAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyLiRsb2FkZWQoKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocGxheWVycykge1xuICAgICAgICAgICAgICAgIHZhciBtZUlkeDtcbiAgICAgICAgICAgICAgICBwbGF5ZXJzLmZpbmQoZnVuY3Rpb24oZSwgaSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZS4kaWQgPT09ICRzY29wZS5tZS4kaWQpIG1lSWR4ID0gaTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0udGlsZXMgPSBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLnRpbGVzLmZpbHRlcihmdW5jdGlvbih0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0LmlkICE9PSB0aWxlLmlkXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLm5leHRTcGFjZS50aWxlVXJsID0gdGlsZS5pbWFnZVVybDtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGlsZS5wYXRocy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS5uZXh0U3BhY2UucG9pbnRzW2ldLm5laWdoYm9yc1swXSA9PT0gXCJuXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0ubmV4dFNwYWNlLnBvaW50c1tpXS5uZWlnaGJvcnMuc3BsaWNlKDAsIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0ubmV4dFNwYWNlLnBvaW50c1tpXS5uZWlnaGJvcnMucHVzaChmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLm5leHRTcGFjZS5wb2ludHNbdGlsZS5wYXRoc1tpXV0pO1xuICAgICAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJHNhdmUobWVJZHgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0ucG9pbnQgPSBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLm5leHRTcGFjZS5wb2ludHNbZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS5uZXh0U3BhY2VQb2ludHNJbmRleF07XG5cbiAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJHNhdmUobWVJZHgpO1xuXG4gICAgICAgICAgICAgICAgdmFyIHBsYXllcnNOZXh0U3BhY2VYID0gZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS5uZXh0U3BhY2UueDtcbiAgICAgICAgICAgICAgICB2YXIgcGxheWVyc05leHRTcGFjZVkgPSBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLm5leHRTcGFjZS55O1xuICAgICAgICAgICAgICAgIHJldHVybiBbcGxheWVyc05leHRTcGFjZVksIHBsYXllcnNOZXh0U3BhY2VYXTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihuZXh0U3BhY2UpIHtcbiAgICAgICAgICAgICAgICBib2FyZEFyci4kbG9hZGVkKClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gYm9hcmRBcnIuJGtleUF0KDApXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3BhY2VSZWYgPSBib2FyZFJlZi5jaGlsZChrZXkpLmNoaWxkKG5leHRTcGFjZVswXSkuY2hpbGQobmV4dFNwYWNlWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzcGFjZUFyciA9ICRmaXJlYmFzZUFycmF5KHNwYWNlUmVmKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwYWNlQXJyWzFdID0gdGlsZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNwYWNlQXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwYWNlQXJyLiRzYXZlKDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJvdXRcIiwgc3BhY2VBcnIpO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNwYWNlQXJyLiRsb2FkZWQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICBjb25zb2xlLmxvZyhcImhlcmVcIiwgc3BhY2VBcnIpXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIC8vIHZhciBrZXkgPSBib2FyZEFyci4ka2V5QXQoMClcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgY29uc29sZS5sb2coXCJ0aWxlXCIsIHRpbGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIHNwYWNlQXJyWzFdID0gdGlsZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAvLyBib2FyZEFyclswXVtuZXh0U3BhY2VbMF1dW25leHRTcGFjZVsxXV0udGlsZSA9IHRpbGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIHNwYWNlQXJyLiRzYXZlKHRpbGUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIC8vIHZhciBwb2ludHMgPSBkYXRhW25leHRTcGFjZVswXV1bbmV4dFNwYWNlWzFdXS5wb2ludHM7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIC8vIHBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uKHBvaW50LCBpZHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgLy8gICAgIHBvaW50Lm5laWdoYm9ycy4kYWRkKFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAvLyAgICAgICAgIHBvaW50c1t0aWxlLnBhdGhzW2lkeF1dKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIC8vc2F2ZSBpdCBiYWNrIHRvIGZpcmViYXNlXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIC8vIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgIC8vTmVlZCB0byByZWFzc2lnbiB0aGUgdGlsZXMgcG9pbnRzIG5laWdoYm9yc1xuXG4gICAgICAgICAgICB9KTtcblxuXG4gICAgICAgIC8vIENNVDogdGhpcyBzaG91bGQgc2VuZCB0aGUgcm90YXRlZCB0aWxlIHRvIGZpcmViYXNlXG4gICAgICAgIC8vIG1vdmVzQXJyLiRhZGQoe1xuICAgICAgICAvLyAgICAgJ3R5cGUnOiAncGxhY2VUaWxlJyxcbiAgICAgICAgLy8gICAgICd0aWxlJzogdGlsZSxcbiAgICAgICAgLy8gICAgICdwbGF5ZXJVaWQnOiAkc2NvcGUubWUudWlkXG4gICAgICAgIC8vIH0pO1xuICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJGxvYWRlZCgpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihwbGF5ZXJzKSB7XG4gICAgICAgICAgICAgICAgYm9hcmRBcnIuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24oYm9hcmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uKHApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtb3ZhYmxlID0gcGxheWVyLm1vdmVUbyhwLnBvaW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwSWR4ID0gcGxheWVycy5pbmRleE9mKHApXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChtb3ZhYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcC5wb2ludC50cmF2ZWxsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHAucG9pbnQgPSBtb3ZhYmxlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHAucG9pbnQudHJhdmVsbGVkID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHAuY2FuUGxheSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayB0aGUgc3BhY2UgdGhhdCdzIG5vdCBteSBjdXJyZW50IG5leHRTcGFjZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdOZXh0U3BhY2VJbmZvID0gcC5wb2ludC5zcGFjZXMuZmlsdGVyKGZ1bmN0aW9uKHNwYWNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzcGFjZS54ICE9PSBwLm5leHRTcGFjZS54IHx8IHNwYWNlLnkgIT09IHAubmV4dFNwYWNlLnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVswXVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG9sZFNwYWNlID0gcC5uZXh0U3BhY2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1NwYWNlID0gYm9hcmRbMF1bbmV3TmV4dFNwYWNlSW5mby55XVtuZXdOZXh0U3BhY2VJbmZvLnhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHAubmV4dFNwYWNlID0gbmV3U3BhY2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJHNhdmUocElkeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogbmVlZCBtb3JlIHBsYXllcnMgdG8gY2hlY2sgaWYgaXQgd29ya3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuY2hlY2tEZWF0aChwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3ZhYmxlID0gcGxheWVyLm1vdmVUbyhwLnBvaW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZW5kIG1vdmluZ1wiKVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgaWYgKCRzY29wZS5nYW1lLmNoZWNrT3ZlcigpKSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBuZWVkIHRvIHRlbGwgdGhlIHBsYXllciBzaGUgd29uXG4gICAgICAgICAgICAkc2NvcGUud2lubmVyID0gJHNjb3BlLmdhbWUuZ2V0Q2FuUGxheSgpWzBdO1xuICAgICAgICAgICAgJHNjb3BlLmdhbWVPdmVyID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZ2FtZSBvdmVyXCIpXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogZGlzYWJsZSBldmVyeXRoaW5nLCBsZXQgdGhlIHBsYXllcnMgZGVjaWRlIHdldGhlciByZXNldCB0aGUgZ2FtZSBvciBub3RcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICgkc2NvcGUuZ2FtZS5kZWFkUGxheWVycygpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIC8vd2l0aCBuZXcgY2FyZHMgJiBuZWVkIHRvIHJlc2h1ZmZsZVxuXG4gICAgICAgICAgICAgICAgLy8gYmVjYXVzZSB0aGUgZGVhZFBsYXllcnMoKSByZXR1cm5zIGEgMkQgYXJyYXksIHVzZSByZWR1Y2UgdG8gZmxhdHRlbiBpdFxuICAgICAgICAgICAgICAgIHZhciBkZWFkUGxheWVyVGlsZXMgPSAkc2NvcGUuZ2FtZS5kZWFkUGxheWVycygpLnJlZHVjZShmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhID0gYS5jb25jYXQoYilcbiAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgJHNjb3BlLmdhbWUuZGVjayA9ICRzY29wZS5nYW1lLmRlY2suY29uY2F0KGRlYWRQbGF5ZXJUaWxlcyk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmdhbWUuZGVjayA9ICRzY29wZS5nYW1lLmRlY2suc2h1ZmZsZSgpO1xuXG4gICAgICAgICAgICAgICAgLy9zZW5kIGZpcmViYXNlIGEgbmV3IG1vdmVcbiAgICAgICAgICAgICAgICBtb3Zlc0Fyci4kYWRkKHtcbiAgICAgICAgICAgICAgICAgICAgJ3R5cGUnOiAndXBkYXRlRGVjaycsXG4gICAgICAgICAgICAgICAgICAgICd1cGRhdGVEZWNrJzogJHNjb3BlLmdhbWUuZGVja1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJZiBkZWNrIGlzIGVtcHR5ICYgbm8gb25lIGlzIGRyYWdvbiwgc2V0IG1lIGFzIGRyYWdvblxuICAgICAgICAgICAgaWYgKCRzY29wZS5nYW1lLmRlY2subGVuZ3RoID09PSAwICYmICEkc2NvcGUuZHJhZ29uKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRyYWdvbiA9ICRzY29wZS5tZTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInNldCBkcmFnb24gdG8gbWVcIilcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoJHNjb3BlLmdhbWUuZGVjay5sZW5ndGggPT09IDAgJiYgJHNjb3BlLmRyYWdvbikge1xuICAgICAgICAgICAgICAgIGF3YWl0aW5nRHJhZ29uSG9sZGVycy5wdXNoKCRzY29wZS5tZSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJJJ20gd2FpdGluZyBmb3IgdG8gYmUgYSBkcmFnb25cIilcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJnaXZlIG1lIGEgdGlsZVwiKVxuICAgICAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0Fyci4kbG9hZGVkKClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocGxheWVycykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9maW5kIG1lIGluIHRoZSBmaXJlYmFzZSBwbGF5ZXJzIGFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWVJZHg7XG4gICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXJzLmZpbmQoZnVuY3Rpb24oZSwgaSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlLnVpZCA9PT0gJHNjb3BlLm1lLnVpZCkgbWVJZHggPSBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc2V0IGZpcmViYXNlIG1lIHRvIGxvY2FsIG1lXG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLnRpbGVzID0gJHNjb3BlLm1lLnRpbGVzLmNvbmNhdCgkc2NvcGUuZ2FtZS5kZWFsKDEpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVkIG9uZSB0aWxlIHRvIG1lIVwiKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy9zYXZlIGl0XG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJHNhdmUobWVJZHgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUubWUgPSBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHdoaWxlICgkc2NvcGUuZHJhZ29uICYmICRzY29wZS5nYW1lLmRlY2subGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kcmFnb24udGlsZXMucHVzaCgkc2NvcGUuZ2FtZS5kZWFsKDEpKTtcbiAgICAgICAgICAgICAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyLiRsb2FkZWQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocGxheWVycykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vZmluZCBtZSBpbiB0aGUgZmlyZWJhc2UgcGxheWVycyBhcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtZUlkeDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXJzLmZpbmQoZnVuY3Rpb24oZSwgaSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZS51aWQgPT09ICRzY29wZS5kcmFnb24udWlkKSBtZUlkeCA9IGk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3NldCBmaXJlYmFzZSBtZSB0byBsb2NhbCBtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0gPSAkc2NvcGUuZHJhZ29uO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9zYXZlIGl0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyLiRzYXZlKG1lSWR4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kcmFnb24gPSAkc2NvcGUuYXdhaXRpbmdEcmFnb25Ib2xkZXJzLnNoaWZ0KCkgfHwgbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFRPRE86IHN0aWxsIG5lZWQgdG8gd29yayBvbiB0aGlzXG4gICAgICAgICAgICAkc2NvcGUuY3VycmVudFBsYXllciA9ICRzY29wZS5nYW1lLmdvVG9OZXh0UGxheWVyKCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIm5ldyBjdXJyIHBsYXllclwiLCAkc2NvcGUuY3VycmVudFBsYXllcilcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgICRzY29wZS5sZWF2ZUdhbWUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJpJ20gb3V0XCIpO1xuXG4gICAgICAgIGZpcmViYXNlUGxheWVyc0Fyci4kbG9hZGVkKClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHBsYXllcnMpIHtcbiAgICAgICAgICAgICAgICAvL2ZpbmQgbWUgaW4gdGhlIGZpcmViYXNlIHBsYXllcnMgYXJyYXlcbiAgICAgICAgICAgICAgICB2YXIgbWVJZHg7XG5cbiAgICAgICAgICAgICAgICBwbGF5ZXJzLmZpbmQoZnVuY3Rpb24oZSwgaSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZS51aWQgPT09ICRzY29wZS5tZS51aWQpIG1lSWR4ID0gaTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIHJlbW92ZSB0aGUgcGxheWVyIGZyb20gZmlyZWJhc2VcbiAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJHJlbW92ZShmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICRzdGF0ZS5nbygncGlja0dhbWUnKTtcbiAgICB9O1xuXG4gICAgLy8gVE9ETzogbmVlZCB0byByZW1vdmUgdGhpcyBnYW1lIHJvb20ncyBtb3ZlcyBmcm9tIGZpcmViYXNlP1xuICAgICRzY29wZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBtYXJrZXJzQXJyLiRyZW1vdmUoMClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlZikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlZCBhbGwgbWFya2Vyc1wiLCByZWYua2V5KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGRlY2tBcnIuJHJlbW92ZSgwKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVmKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZW1vdmVkIHRoZSBkZWNrXCIsIHJlZi5rZXkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgaW5pdGlhbERlY2tBcnIuJHJlbW92ZSgwKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVmKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZW9tdmVkIHRoZSBpbml0aWFsRGVja1wiLCByZWYua2V5KVxuICAgICAgICAgICAgfSlcblxuICAgICAgICBtb3Zlc0Fyci4kbG9hZGVkKClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKG1vdmVzKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb3Zlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBtb3Zlc0Fyci4kcmVtb3ZlKGkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInJlbW92ZWQgYWxsIG1vdmVzXCIpXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgIG9iai4kbG9hZGVkKCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB2YXIgdGlsZXMgPSBkYXRhLnRpbGVzO1xuICAgICAgICAgICAgdmFyIGRlY2sgPSBuZXcgRGVjayh0aWxlcykuc2h1ZmZsZSgpLnRpbGVzO1xuICAgICAgICAgICAgaW5pdGlhbERlY2tBcnIuJGFkZChkZWNrKTtcbiAgICAgICAgfSk7XG5cblxuXG4gICAgICAgIHZhciBpbml0aWFsTWFya2Vyc1JlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZCgkc3RhdGVQYXJhbXMuZ2FtZU5hbWUpLmNoaWxkKCdhdmFpbGFibGVNYXJrZXJzJyk7XG4gICAgICAgICRmaXJlYmFzZUFycmF5KGluaXRpYWxNYXJrZXJzUmVmKS4kYWRkKFtcInJlZFwiLCBcIm9yYW5nZVwiLCBcInllbGxvd1wiLCBcImdyZWVuXCIsIFwiYXF1YVwiLCBcImJsdWVcIiwgXCJuYXZ5XCIsIFwicHVycGxlXCJdKTtcblxuXG4gICAgICAgIHZhciBwbGF5ZXJzID0gJGZpcmViYXNlQXJyYXkocGxheWVyc1JlZik7XG4gICAgICAgIHBsYXllcnMuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZGF0YVtpXS5jYW5QbGF5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBkYXRhW2ldLm1hcmtlciA9ICduJztcbiAgICAgICAgICAgICAgICBkYXRhW2ldLm5leHRTcGFjZSA9ICduJztcbiAgICAgICAgICAgICAgICBkYXRhW2ldLm5leHRTcGFjZVBvaW50c0luZGV4ID0gJ24nO1xuICAgICAgICAgICAgICAgIGRhdGFbaV0ucG9pbnQgPSAnbic7XG4gICAgICAgICAgICAgICAgZGF0YVtpXS50aWxlcyA9ICduJztcbiAgICAgICAgICAgICAgICBwbGF5ZXJzLiRzYXZlKGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAkc3RhdGUucmVsb2FkKClcbiAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLm1lKTtcblxuICAgIH07XG5cbiAgICAkc2NvcGUuc3RhcnR0b3AgPSBbXG4gICAgICAgIFswLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDFdLFxuICAgICAgICBbMSwgMCwgMF0sXG4gICAgICAgIFsxLCAwLCAxXSxcbiAgICAgICAgWzIsIDAsIDBdLFxuICAgICAgICBbMiwgMCwgMV0sXG4gICAgICAgIFszLCAwLCAwXSxcbiAgICAgICAgWzMsIDAsIDFdLFxuICAgICAgICBbNCwgMCwgMF0sXG4gICAgICAgIFs0LCAwLCAxXSxcbiAgICAgICAgWzUsIDAsIDBdLFxuICAgICAgICBbNSwgMCwgMV1cbiAgICBdO1xuICAgICRzY29wZS5zdGFydGxlZnQgPSBbXG4gICAgICAgIFswLCAwLCA3XSxcbiAgICAgICAgWzAsIDAsIDZdLFxuICAgICAgICBbMCwgMSwgN10sXG4gICAgICAgIFswLCAxLCA2XSxcbiAgICAgICAgWzAsIDIsIDddLFxuICAgICAgICBbMCwgMiwgNl0sXG4gICAgICAgIFswLCAzLCA3XSxcbiAgICAgICAgWzAsIDMsIDZdLFxuICAgICAgICBbMCwgNCwgN10sXG4gICAgICAgIFswLCA0LCA2XSxcbiAgICAgICAgWzAsIDUsIDddLFxuICAgICAgICBbMCwgNSwgNl1cbiAgICBdO1xuICAgICRzY29wZS5zdGFydGJvdHRvbSA9IFtcbiAgICAgICAgWzAsIDUsIDVdLFxuICAgICAgICBbMCwgNSwgNF0sXG4gICAgICAgIFsxLCA1LCA1XSxcbiAgICAgICAgWzEsIDUsIDRdLFxuICAgICAgICBbMiwgNSwgNV0sXG4gICAgICAgIFsyLCA1LCA0XSxcbiAgICAgICAgWzMsIDUsIDVdLFxuICAgICAgICBbMywgNSwgNF0sXG4gICAgICAgIFs0LCA1LCA1XSxcbiAgICAgICAgWzQsIDUsIDRdLFxuICAgICAgICBbNSwgNSwgNV0sXG4gICAgICAgIFs1LCA1LCA0XVxuICAgIF07XG4gICAgJHNjb3BlLnN0YXJ0cmlnaHQgPSBbXG4gICAgICAgIFs1LCAwLCAyXSxcbiAgICAgICAgWzUsIDAsIDNdLFxuICAgICAgICBbNSwgMSwgMl0sXG4gICAgICAgIFs1LCAxLCAzXSxcbiAgICAgICAgWzUsIDIsIDJdLFxuICAgICAgICBbNSwgMiwgM10sXG4gICAgICAgIFs1LCAzLCAyXSxcbiAgICAgICAgWzUsIDMsIDNdLFxuICAgICAgICBbNSwgNCwgMl0sXG4gICAgICAgIFs1LCA0LCAzXSxcbiAgICAgICAgWzUsIDUsIDJdLFxuICAgICAgICBbNSwgNSwgM11cbiAgICBdO1xufSk7IiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdnYW1lbGlzdCcsIHtcbiAgICAgICAgdXJsOiAnL2dhbWVsaXN0JyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvYnJvd3Nlci9qcy9nYW1lbGlzdC9nYW1lbGlzdC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2dhbWVMaXN0JyxcbiAgICB9KTtcbn0pO1xuXG50c3Vyby5jb250cm9sbGVyKCdnYW1lTGlzdCcsIGZ1bmN0aW9uICgkc2NvcGUsIGZpcmViYXNlVXJsLCAkZmlyZWJhc2VPYmplY3QsICRzdGF0ZSwgJGZpcmViYXNlQXV0aCwgJGZpcmViYXNlQXJyYXkpIHtcbiAgICAvL0ZvciBzeW5jaHJvbml6aW5nR2FtZUxpc3QuLi5cbiAgICB2YXIgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbiAgICB2YXIgb2JqID0gJGZpcmViYXNlT2JqZWN0KHJlZik7XG5cbiAgICB2YXIgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcbiAgICB2YXIgZmlyZWJhc2VVc2VyID0gYXV0aC4kZ2V0QXV0aCgpO1xuXG4gICAgdmFyIHN5bmNoUmVmID0gcmVmLmNoaWxkKFwiZ2FtZXNcIik7XG4gICAgdmFyIHN5bmNocm9uaXplZE9iaiA9ICRmaXJlYmFzZU9iamVjdChzeW5jaFJlZik7XG5cbiAgICAvLyBUaGlzIHJldHVybnMgYSBwcm9taXNlLi4ueW91IGNhbi50aGVuKCkgYW5kIGFzc2lnbiB2YWx1ZSB0byAkc2NvcGUudmFyaWFibGVcbiAgICAvLyBnYW1lbGlzdCBpcyB3aGF0ZXZlciB3ZSBhcmUgY2FsbGluZyBpdCBpbiB0aGUgYW5ndWxhciBodG1sLlxuICAgIHN5bmNocm9uaXplZE9iai4kYmluZFRvKCRzY29wZSwgXCJnYW1lbGlzdFwiKVxuICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZ2FtZWxpc3QgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gJHNjb3BlLmdhbWVsaXN0KSB7XG4gICAgICAgICAgICAgICAgZ2FtZWxpc3QucHVzaChbaSwgJHNjb3BlLmdhbWVsaXN0W2ldXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkc2NvcGUuZ2FtZU5hbWVzID0gZ2FtZWxpc3Quc2xpY2UoMik7XG4gICAgICAgIH0pO1xuXG5cblxuXG4gICAgJHNjb3BlLmpvaW4gPSBmdW5jdGlvbiAoZ2FtZU5hbWUpIHtcbiAgICAgICAgdmFyIGdhbWVOYW1lUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKGdhbWVOYW1lKTtcbiAgICAgICAgdmFyIHBsYXllcnNSZWYgPSBnYW1lTmFtZVJlZi5jaGlsZCgncGxheWVycycpO1xuXG4gICAgICAgIGZpcmViYXNlLmF1dGgoKS5vbkF1dGhTdGF0ZUNoYW5nZWQoZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIHZhciBmaXJlYmFzZVBsYXllcnNBcnIgPSAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKTtcblxuICAgICAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBGQnBsYXllcnMgPSBkYXRhO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIUZCcGxheWVycy5maWx0ZXIoZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGxheWVyLnVpZCA9PT0gdXNlci51aWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3UGxheWVyID0gbmV3IFBsYXllcih1c2VyLnVpZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKS4kYWRkKG5ld1BsYXllcilcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vIHVzZXIgaXMgc2lnbmVkIGluLlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJub3RoaW5nXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnZ2FtZScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZ2FtZU5hbWVcIjogZ2FtZU5hbWVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59KTtcbiIsInRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbG9naW4nLCB7XG4gICAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2Jyb3dzZXIvanMvbG9naW4vbG9naW4uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdsb2dpbkN0cmwnXG4gICAgfSk7XG59KTtcblxudHN1cm8uY29udHJvbGxlcignbG9naW5DdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlLCAkZmlyZWJhc2VBdXRoLCAkcm9vdFNjb3BlKSB7XG4gICAgdmFyIGF1dGggPSAkZmlyZWJhc2VBdXRoKCk7XG5cbiAgICAkc2NvcGUubG9nSW5XaXRoR29vZ2xlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBhdXRoLiRzaWduSW5XaXRoUG9wdXAoXCJnb29nbGVcIikudGhlbihmdW5jdGlvbiAoYXV0aERhdGEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTG9nZ2VkIGluIGFzOlwiLCBhdXRoRGF0YSk7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLmN1cnJlbnRVc2VyID0gYXV0aERhdGE7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ3BpY2tHYW1lJyk7XG4gICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkF1dGhlbnRpY2F0aW9uIGZhaWxlZDpcIiwgZXJyb3IpO1xuICAgICAgICB9KTtcblxuICAgIH07XG5cbn0pO1xuIiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdwaWNrR2FtZScsIHtcbiAgICAgICAgdXJsOiAnL3BpY2tnYW1lJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvYnJvd3Nlci9qcy9waWNrR2FtZS9waWNrR2FtZS5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ3BpY2tHYW1lQ3RybCdcbiAgICB9KTtcbn0pO1xuXG50c3Vyby5jb250cm9sbGVyKCdwaWNrR2FtZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QpIHtcbiAgICB2YXIgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbiAgICB2YXIgb2JqID0gJGZpcmViYXNlT2JqZWN0KHJlZik7XG5cblxuICAgICRzY29wZS5jcmVhdGVHYW1lID0gZnVuY3Rpb24gKGdhbWVOYW1lKSB7XG4gICAgICAgIHZhciBnYW1lTmFtZVJlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZChnYW1lTmFtZSk7XG4gICAgICAgIHZhciBwbGF5ZXJzUmVmID0gZ2FtZU5hbWVSZWYuY2hpbGQoJ3BsYXllcnMnKTtcbiAgICAgICAgdmFyIGluaXRpYWxNYXJrZXJzUmVmID0gZ2FtZU5hbWVSZWYuY2hpbGQoJ2F2YWlsYWJsZU1hcmtlcnMnKTtcbiAgICAgICAgdmFyIGluaXRpYWxNYXJrZXJzQXJyID0gJGZpcmViYXNlQXJyYXkoaW5pdGlhbE1hcmtlcnNSZWYpO1xuICAgICAgICB2YXIgZGVja1JlZiA9IGdhbWVOYW1lUmVmLmNoaWxkKCdkZWNrJyk7XG4gICAgICAgIHZhciBkZWNrQXJyID0gJGZpcmViYXNlQXJyYXkoZGVja1JlZik7XG5cbiAgICAgICAgJGZpcmViYXNlQXJyYXkoZ2FtZU5hbWVSZWYpLiRhZGQoe1xuICAgICAgICAgICAgXCJnYW1lTmFtZVwiOiBnYW1lTmFtZVxuICAgICAgICB9KTtcblxuICAgICAgICBmaXJlYmFzZS5hdXRoKCkub25BdXRoU3RhdGVDaGFuZ2VkKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgICAgIHZhciBuZXdQbGF5ZXIgPSBuZXcgUGxheWVyKHVzZXIudWlkKVxuICAgICAgICAgICAgICAgICRmaXJlYmFzZUFycmF5KHBsYXllcnNSZWYpLiRhZGQobmV3UGxheWVyKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIm5vIG9uZSBsb2dnZWQgaW5cIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICB2YXIgdGlsZXMgPSBbe1xuICAgICAgICAgICAgaWQ6IDEsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8wMS5wbmc/YWx0PW1lZGlhJnRva2VuPWRjMmU1NTNiLWY0ZGEtNDQyZS05N2U4LWQwZDgwOGMyZDVjMFwiLFxuICAgICAgICAgICAgcGF0aHM6IFszLCA0LCA2LCAwLCAxLCA3LCAyLCA1XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAyLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMDIucG5nP2FsdD1tZWRpYSZ0b2tlbj1iYmIwYjU5Ni03NGVhLTQ5YTgtOWY2Yy1iNDI2MjdjY2Q4NzNcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMSwgMCwgNCwgNywgMiwgNiwgNSwgM10sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMyxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzAzLnBuZz9hbHQ9bWVkaWEmdG9rZW49NGRkMWZmODUtMDIwNC00ODk1LTg5NTctM2I3MDczNTU5MTE3XCIsXG4gICAgICAgICAgICBwYXRoczogWzEsIDAsIDQsIDYsIDIsIDcsIDMsIDVdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDQsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8wNC5wbmc/YWx0PW1lZGlhJnRva2VuPTkwZGQyZGU4LTljOTktNGNiNy04NmZmLTc4NjNiMGE1NjQxY1wiLFxuICAgICAgICAgICAgcGF0aHM6IFsyLCA1LCAwLCA3LCA2LCAxLCA0LCAzXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiA1LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMDUucG5nP2FsdD1tZWRpYSZ0b2tlbj01OTEyYTQ3Yi04NTRhLTQ2ZDAtYmZlYi0wMDU5MTNkMjQxNThcIixcbiAgICAgICAgICAgIHBhdGhzOiBbNCwgMiwgMSwgNiwgMCwgNywgMywgNV0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogNixcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzA2LnBuZz9hbHQ9bWVkaWEmdG9rZW49MDU2Yjg5MzgtNmUxZi00ODFlLTlkMzQtYjZiMjdmMmNkOWUzXCIsXG4gICAgICAgICAgICBwYXRoczogWzEsIDAsIDUsIDcsIDYsIDIsIDQsIDNdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDcsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8wNy5wbmc/YWx0PW1lZGlhJnRva2VuPWI1ZGRiYWY2LWYwNjEtNDIwNi05ZjliLTkyYmM4NjNiYjQ4NFwiLFxuICAgICAgICAgICAgcGF0aHM6IFsyLCA0LCAwLCA2LCAxLCA3LCAzLCA1XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiA4LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMDgucG5nP2FsdD1tZWRpYSZ0b2tlbj04YWQ2MzQwZS1mOGE1LTRmZjItYmRhZi0wYTg1ZTJiYmM2MzBcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMiwgNSwgMCwgNiwgNywgMSwgMywgNF0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogOSxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzA5LnBuZz9hbHQ9bWVkaWEmdG9rZW49NmExYTYyYjgtMTg3Mi00NjBkLTkyNzYtNWI0OGYzYTM4YTM5XCIsXG4gICAgICAgICAgICBwYXRoczogWzEsIDAsIDcsIDYsIDUsIDQsIDMsIDJdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDEwLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMTAucG5nP2FsdD1tZWRpYSZ0b2tlbj02M2U4YTIxNC0zYWVmLTRkYTYtODgyNy0xMzNkYjliOWI0ZWZcIixcbiAgICAgICAgICAgIHBhdGhzOiBbNCwgNSwgNiwgNywgMCwgMSwgMiwgM10sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMTEsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8xMS5wbmc/YWx0PW1lZGlhJnRva2VuPTU3ODY5NjgyLTVjNGQtNGY4MC04MzJiLWViYzQ2MDgwYTRjNVwiLFxuICAgICAgICAgICAgcGF0aHM6IFs3LCAyLCAxLCA0LCAzLCA2LCA1LCAwXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAxMixcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzEyLnBuZz9hbHQ9bWVkaWEmdG9rZW49ZTUwNWYyMmItOWQ1Mi00OWQxLTliNzEtNGRjZGNlNTY4NTNmXCIsXG4gICAgICAgICAgICBwYXRoczogWzIsIDcsIDAsIDUsIDYsIDMsIDQsIDFdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDEzLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMTMucG5nP2FsdD1tZWRpYSZ0b2tlbj1mMGFjNGViOS03YjgxLTRkZmItYjBjYi1hZWNjMDI5MGFlM2JcIixcbiAgICAgICAgICAgIHBhdGhzOiBbNSwgNCwgNywgNiwgMSwgMCwgMywgMl0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMTQsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8xNC5wbmc/YWx0PW1lZGlhJnRva2VuPTdmZjI0ZTc3LTY3MzctNDEyYi1iYWNkLTQxNGJmNGY2NDNjOVwiLFxuICAgICAgICAgICAgcGF0aHM6IFszLCAyLCAxLCAwLCA3LCA2LCA1LCA0XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAxNSxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzE1LnBuZz9hbHQ9bWVkaWEmdG9rZW49YTFhZDdjMGMtOGU2ZC00NDc0LTlmZGUtMGI0N2QwNDEwNGMxXCIsXG4gICAgICAgICAgICBwYXRoczogWzEsIDAsIDcsIDQsIDMsIDYsIDUsIDJdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDE2LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMTYucG5nP2FsdD1tZWRpYSZ0b2tlbj1lMzNiM2NkOS05MjA3LTRjYjgtOTY5Yi01Y2U2MGY5MTUzN2ZcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMSwgMCwgNSwgNiwgNywgMiwgMywgNF0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMTcsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8xNy5wbmc/YWx0PW1lZGlhJnRva2VuPTIwMGQ2Y2FiLWRmMzEtNDliOC1iYTk1LWFkNTJkN2M3OWU4YlwiLFxuICAgICAgICAgICAgcGF0aHM6IFszLCA1LCA2LCAwLCA3LCAxLCAyLCA0XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAxOCxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzE4LnBuZz9hbHQ9bWVkaWEmdG9rZW49MWM3YmY1MTUtOTk0MS00N2NkLTllY2ItNDc5ZDY2ZjI2MTJiXCIsXG4gICAgICAgICAgICBwYXRoczogWzIsIDcsIDAsIDQsIDMsIDYsIDUsIDFdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDE5LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMTkucG5nP2FsdD1tZWRpYSZ0b2tlbj1mNWNjNjI1Yy03M2MwLTQ5ZjctOTMyYy0wZTY1ZDMxZDJiZjdcIixcbiAgICAgICAgICAgIHBhdGhzOiBbNCwgMywgNiwgMSwgMCwgNywgMiwgNV0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMjAsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8yMC5wbmc/YWx0PW1lZGlhJnRva2VuPTViOWI0NDU1LTJjMDktNDFlNC1hMmYyLWY2MGJlZGM0NzBhZFwiLFxuICAgICAgICAgICAgcGF0aHM6IFsyLCA2LCAwLCA0LCAzLCA3LCAxLCA1XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAyMSxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzIxLnBuZz9hbHQ9bWVkaWEmdG9rZW49NmQ1NjQ2ZDctYjFiMS00OWM5LWJmODctMDBiZTllN2I4ZTJjXCIsXG4gICAgICAgICAgICBwYXRoczogWzIsIDMsIDAsIDEsIDcsIDYsIDUsIDRdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDIyLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMjIucG5nP2FsdD1tZWRpYSZ0b2tlbj01YTU4NzM1OS04MzFjLTRkY2QtYTljNS1lNzA4NWM1YTMwNzlcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMiwgNiwgMCwgNSwgNywgMywgMSwgNF0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMjMsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8yMy5wbmc/YWx0PW1lZGlhJnRva2VuPTRjYjk3NTBiLTBmNTAtNDI5ZC05MzY3LTE3MGIwODU1YzZjNFwiLFxuICAgICAgICAgICAgcGF0aHM6IFsxLCAwLCA2LCA0LCAzLCA3LCAyLCA1XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAyNCxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzI0LnBuZz9hbHQ9bWVkaWEmdG9rZW49YTgwYjdmNWItYzU3Mi00NDMwLWFiOGEtM2QzNjU2ZTRjNjQzXCIsXG4gICAgICAgICAgICBwYXRoczogWzMsIDQsIDcsIDAsIDEsIDYsIDUsIDJdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDI1LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMjUucG5nP2FsdD1tZWRpYSZ0b2tlbj05YjhlODUzZC05NjJiLTRkMzItYjY3OS02MjJlOGFlN2JlNmFcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMSwgMCwgMywgMiwgNywgNiwgNSwgNF0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMjYsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8yNi5wbmc/YWx0PW1lZGlhJnRva2VuPWQ4NGNiN2QzLTRiZDUtNGExNy04YjdhLTZkZjg1Nzk3NWM0NVwiLFxuICAgICAgICAgICAgcGF0aHM6IFsxLCAwLCA2LCA3LCA1LCA0LCAyLCAzXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAyNyxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzI3LnBuZz9hbHQ9bWVkaWEmdG9rZW49ZDBlYWY2MzEtOGEwZS00YWE5LThkZDItNzc4ZTliZTFmZWM2XCIsXG4gICAgICAgICAgICBwYXRoczogWzIsIDQsIDAsIDcsIDEsIDYsIDUsIDNdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDI4LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMjgucG5nP2FsdD1tZWRpYSZ0b2tlbj1lZTQyY2MxMS0xOWQyLTQ0NzYtODg3Yi03YTI5ODE3NDMwZmNcIixcbiAgICAgICAgICAgIHBhdGhzOiBbNCwgMiwgMSwgNywgMCwgNiwgNSwgM10sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMjksXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8yOS5wbmc/YWx0PW1lZGlhJnRva2VuPWE2MDc2NmE1LTVlMGMtNDlhZC05MjQwLTIwYjFkNTM5ZmEyZlwiLFxuICAgICAgICAgICAgcGF0aHM6IFsxLCAwLCAzLCAyLCA1LCA0LCA3LCA2XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAzMCxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzMwLnBuZz9hbHQ9bWVkaWEmdG9rZW49ZGVhMjY4MDgtZDQ5ZC00M2IwLWI4MWMtMTc0YzFlMDk4YzFlXCIsXG4gICAgICAgICAgICBwYXRoczogWzIsIDMsIDAsIDEsIDYsIDcsIDQsIDVdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDMxLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMzEucG5nP2FsdD1tZWRpYSZ0b2tlbj00Y2I5ZWRkNy05NWFiLTRlMmYtYWVkYS1kMjUxZjcwMTVhMGRcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMywgNiwgNSwgMCwgNywgMiwgMSwgNF0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMzIsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8zMi5wbmc/YWx0PW1lZGlhJnRva2VuPTRmMTk3ODhmLWFkODUtNGU2Zi04MmFjLTdmZWY0YzhmMDQxOVwiLFxuICAgICAgICAgICAgcGF0aHM6IFsxLCAwLCA2LCA1LCA3LCAzLCAyLCA0XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAzMyxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzMzLnBuZz9hbHQ9bWVkaWEmdG9rZW49MDkxNDAyOGQtZWEyNS00NjEzLTgyZjYtZWFiNTc0ZTY5ZjcwXCIsXG4gICAgICAgICAgICBwYXRoczogWzEsIDAsIDMsIDIsIDYsIDcsIDQsIDVdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDM0LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMzQucG5nP2FsdD1tZWRpYSZ0b2tlbj0zNzE0ZTg3YS05NDJlLTQzNmUtYWU1Yi1iYzBhMjNkZTMzZDFcIixcbiAgICAgICAgICAgIHBhdGhzOiBbNCwgNSwgNywgNiwgMCwgMSwgMywgMl0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMzUsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8zNS5wbmc/YWx0PW1lZGlhJnRva2VuPWFhOWRkYTk3LWVkZWUtNDcyYS04YjI0LThiYjBiNjlkZmE5YVwiLFxuICAgICAgICAgICAgcGF0aHM6IFsxLCAwLCA3LCA1LCA2LCAzLCA0LCAyXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH1dO1xuXG4gICAgICAgIHZhciBkZWNrID0gbmV3IERlY2sodGlsZXMpLnNodWZmbGUoKS50aWxlcztcbiAgICAgICAgdmFyIGRlY2tSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoZ2FtZU5hbWUpLmNoaWxkKCdkZWNrJyk7XG5cbiAgICAgICAgJGZpcmViYXNlQXJyYXkoZGVja1JlZikuJGFkZChkZWNrKTtcblxuICAgICAgICB2YXIgaW5pdGlhbE1hcmtlcnNSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoZ2FtZU5hbWUpLmNoaWxkKCdhdmFpbGFibGVNYXJrZXJzJyk7XG4gICAgICAgICRmaXJlYmFzZUFycmF5KGluaXRpYWxNYXJrZXJzUmVmKS4kYWRkKFtcInJlZFwiLCBcIm9yYW5nZVwiLCBcInllbGxvd1wiLCBcImdyZWVuXCIsIFwiYXF1YVwiLCBcImJsdWVcIiwgXCJuYXZ5XCIsIFwicHVycGxlXCJdKTtcblxuICAgICAgICBkZWNrQXJyLiRhZGQoZGVjayk7XG5cbiAgICAgICAgaW5pdGlhbE1hcmtlcnNBcnIuJGFkZChbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJ5ZWxsb3dcIiwgXCJncmVlblwiLCBcImFxdWFcIiwgXCJibHVlXCIsIFwibmF2eVwiLCBcInB1cnBsZVwiXSk7XG5cbiAgICAgICAgJHN0YXRlLmdvKCdnYW1lJywge1xuICAgICAgICAgICAgXCJnYW1lTmFtZVwiOiBnYW1lTmFtZVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmdvVG9HYW1lTGlzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHN0YXRlLmdvKCdnYW1lbGlzdCcpO1xuICAgIH07XG59KTtcbiIsIid1c2Ugc3RyaWN0J1xuXG5mdW5jdGlvbiBQbGF5ZXIodWlkKSB7XG4gICAgLy8gVE9ETzogZ2V0IHVpZCBmcm9tIGZpcmViYXNlIGF1dGhcbiAgICB0aGlzLnVpZCA9IHVpZDtcblxuICAgIHRoaXMubWFya2VyID0gXCJuXCI7XG5cbiAgICAvLyBzaG91bGQgYmUgYSBQb2ludCBvYmplY3RcbiAgICB0aGlzLnBvaW50ID0gXCJuXCI7XG5cbiAgICAvLyBbeCwgeV1cbiAgICAvLyBkZXBlbmRzIG9uIHRoZSBhbmd1bGFyIFNwYWNlLngsIFNwYWNlLnlcbiAgICB0aGlzLm5leHRTcGFjZSA9IFwiblwiO1xuXG4gICAgLy8gaW4gZWFjaCBTcGFjZS5wb2ludHMgYXJyYXksIGZpbmQgdGhpcyBzcGVjaWZpYyBwb2ludCBhbmQgZ2V0IHRoZSBwb3NpdGlvbiAoaW50ZWdlcikgaW5zaWRlIHRoaXMgc3BhY2UuXG4gICAgdGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9IFwiblwiO1xuXG4gICAgLy8gbWF4aW11biAzIHRpbGVzXG4gICAgdGhpcy50aWxlcyA9ICduJztcblxuICAgIC8vIGlmIGEgcGxheWVyIGRpZXMsIGl0IHdpbGwgYmUgY2hhbmdlZCB0byBmYWxzZVxuICAgIHRoaXMuY2FuUGxheSA9IHRydWU7XG59XG5QbGF5ZXIucHJvdG90eXBlLmhpID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkhJXCIpXG4gICAgfVxuICAgIC8vIG5lZWQgdG8gdXNlIHNlbGYgYmVjdXNlIHdlIG5lZWQgdG8gY2hhbmdlICRzY29wZS5tZSBvbiBnYW1lQ3RybCBhbmQgc2VuZCB0byBmaXJlYmFzZVxuUGxheWVyLnByb3RvdHlwZS5wbGFjZU1hcmtlciA9IGZ1bmN0aW9uIChib2FyZCwgcG9pbnQsIHNlbGYpIHtcbiAgICAvLyBwb2ludCBsb29rcyBsaWtlIFt4LCB5LCBwb2ludHNJbmRleF0gaW4gdGhlIHNwYWNlXG4gICAgdmFyIHggPSBwb2ludFswXTtcbiAgICB2YXIgeSA9IHBvaW50WzFdO1xuICAgIHZhciBwb2ludHNJbmRleCA9IHBvaW50WzJdO1xuICAgIHNlbGYucG9pbnQgPSBib2FyZFswXVt5XVt4XS5wb2ludHNbcG9pbnRzSW5kZXhdO1xuICAgIHNlbGYucG9pbnQudHJhdmVsbGVkID0gdHJ1ZTtcblxuICAgIC8vW3gsIHldIGZyb20gdGhlIHBvaW50XG4gICAgc2VsZi5uZXh0U3BhY2UgPSBib2FyZFswXVt5XVt4XTtcblxuICAgIC8vIGluIGVhY2ggU3BhY2UucG9pbnRzIGFycmF5LCBmaW5kIHRoaXMgc3BlY2lmaWMgcG9pbnQgYW5kIGdldCB0aGUgcG9zaXRpb24gKGludGVnZXIpIGluc2lkZSB0aGlzIHNwYWNlLlxuICAgIHNlbGYubmV4dFNwYWNlUG9pbnRzSW5kZXggPSBzZWxmLm5leHRTcGFjZS5wb2ludHMuaW5kZXhPZihzZWxmLnBvaW50KTtcbn07XG5cblBsYXllci5wcm90b3R5cGUubmV3U3BhY2UgPSBmdW5jdGlvbiAoYm9hcmQsIG9sZFNwYWNlLCBzZWxmKSB7XG4gICAgaWYgKHNlbGYubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDAgfHwgc2VsZi5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gYm9hcmRbb2xkU3BhY2UueSAtIDFdW29sZFNwYWNlLnhdO1xuICAgIH0gZWxzZSBpZiAoc2VsZi5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gMiB8fCBzZWxmLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSAzKSB7XG4gICAgICAgIHJldHVybiBib2FyZFtvbGRTcGFjZS55XVtvbGRTcGFjZS54ICsgMV07XG4gICAgfSBlbHNlIGlmIChzZWxmLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSA0IHx8IHNlbGYubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDUpIHtcbiAgICAgICAgcmV0dXJuIGJvYXJkW29sZFNwYWNlLnkgKyAxXVtvbGRTcGFjZS54XTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYm9hcmRbb2xkU3BhY2UueV1bb2xkU3BhY2UueCAtIDFdO1xuICAgIH1cbn07XG5cblxuUGxheWVyLnByb3RvdHlwZS5tb3ZlVG8gPSBmdW5jdGlvbiAocG9pbnRlcikge1xuICAgIC8vYWx3YXlzIGJlIHJldHVybmluZyAwIG9yIDEgcG9pbnQgaW4gdGhlIGFycmF5XG4gICAgbGV0IG5leHRQb2ludCA9IHBvaW50ZXIubmVpZ2hib3JzLmZpbHRlcihmdW5jdGlvbiAobmVpZ2hib3IpIHtcbiAgICAgICAgcmV0dXJuICFuZWlnaGJvci50cmF2ZWxsZWQgJiYgbmVpZ2hib3IgIT09IFwiblwiO1xuICAgIH0pWzBdO1xuICAgIHJldHVybiBuZXh0UG9pbnQ7XG59O1xuXG5cblBsYXllci5wcm90b3R5cGUuY2hlY2tEZWF0aCA9IGZ1bmN0aW9uIChzZWxmKSB7XG4gICAgdmFyIGFsbFRyYXZlbGxlZCA9IHNlbGYucG9pbnQubmVpZ2hib3JzLmZpbHRlcihmdW5jdGlvbiAobmVpZ2hib3IpIHtcbiAgICAgICAgcmV0dXJuIG5laWdoYm9yLnRyYXZlbGxlZDtcbiAgICB9KTtcblxuICAgIGlmIChzZWxmLnBvaW50LmVkZ2UgfHwgYWxsVHJhdmVsbGVkLmxlbmd0aCA9PT0gMikgc2VsZi5jYW5QbGF5ID0gZmFsc2U7XG59O1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
