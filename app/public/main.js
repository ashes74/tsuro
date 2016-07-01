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
    // this.tile = "n";
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

        // $scope.clicked = false

        // place my marker
        player.placeMarker(board, point, $scope.me);
        // deal me three cards
        $scope.me.tiles = $scope.game.deal(3);

        $scope.clicked = true;
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
        return false;
    };

    /****************
    GAMEPLAY ACTIONS
    ****************/
    $scope.tryTile = function (tile) {
        console.log('trying tile');
        console.log($scope.game.board[0]);
        $scope.game.board[0][$scope.me.nextSpace.y][$scope.me.nextSpace.x].image = tile.imageUrl;
        $scope.game.board[0][$scope.me.nextSpace.y][$scope.me.nextSpace.x].rotation = tile.rotation;
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
        tile.rotation++;
        if (tile.rotation === 4) tile.rotation = 0;
        console.log("rotate cw", tile);
    };

    $scope.rotateTileCcw = function (tile) {
        tile.rotation--;
        if (tile.rotation === -4) tile.rotation = 0;
        console.log('rotate ccw', tile);
    };

    // CMT: use player's and game's prototype function to place tile and then move all players

    $scope.placeTile = function (tile) {
        console.log($scope.game.board[0]);
        $scope.game.board[0][$scope.me.nextSpace.y][$scope.me.nextSpace.x].image = tile.imageUrl;
        $scope.game.board[0][$scope.me.nextSpace.y][$scope.me.nextSpace.x].rotation = tile.rotation;
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
                spaceArr.$add(tile);
                return key;
            }).then(function (key) {
                var spaceRef = boardRef.child(key).child(nextSpace[0]).child(nextSpace[1]);
                var spaceArr = $firebaseArray(spaceRef);
                spaceArr.$loaded().then(function () {
                    console.log(spaceArr[1]);
                    spaceArr[1].forEach(function (point, idx) {
                        var pointRef = boardRef.child(key).child(nextSpace[0]).child(nextSpace[1]).child('points');
                        var pointArr = $firebaseArray(pointRef);
                        pointArr.$loaded().then(function () {
                            var neighborRef = boardRef.child(key).child(nextSpace[0]).child(nextSpace[1]).child('points').child(idx).child('neighbors');
                            var neighborArr = $firebaseArray(neighborRef);
                            neighborArr.$add(pointArr[tile.paths[idx]]);
                        });
                    });
                });
            });
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
                        var newNextSpaceInfo;

                        if (p.point.spaces.length > 1) {
                            newNextSpaceInfo = p.point.spaces.filter(function (space) {
                                return space.x !== p.nextSpace.x || space.y !== p.nextSpace.y;
                            })[0];
                        } else {
                            newNextSpaceInfo = p.point.spaces[0];
                        }

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

        var tiles = [{
            id: 1,
            imageUrl: "",
            paths: [3, 4, 6, 0, 1, 7, 2, 5],
            rotation: 0
        }, {
            id: 2,
            imageUrl: "",
            paths: [1, 0, 4, 7, 2, 6, 5, 3],
            rotation: 0
        }, {
            id: 3,
            imageUrl: "",
            paths: [1, 0, 4, 6, 2, 7, 3, 5],
            rotation: 0
        }, {
            id: 4,
            imageUrl: "",
            paths: [2, 5, 0, 7, 6, 1, 4, 3],
            rotation: 0
        }, {
            id: 5,
            imageUrl: "",
            paths: [4, 2, 1, 6, 0, 7, 3, 5],
            rotation: 0
        }, {
            id: 6,
            imageUrl: "",
            paths: [1, 0, 5, 7, 6, 2, 4, 3],
            rotation: 0
        }, {
            id: 7,
            imageUrl: "",
            paths: [2, 4, 0, 6, 1, 7, 3, 5],
            rotation: 0
        }, {
            id: 8,
            imageUrl: "",
            paths: [2, 5, 0, 6, 7, 1, 3, 4],
            rotation: 0
        }, {
            id: 9,
            imageUrl: "",
            paths: [1, 0, 7, 6, 5, 4, 3, 2],
            rotation: 0
        }, {
            id: 10,
            imageUrl: "",
            paths: [4, 5, 6, 7, 0, 1, 2, 3],
            rotation: 0
        }, {
            id: 11,
            imageUrl: "",
            paths: [7, 2, 1, 4, 3, 6, 5, 0],
            rotation: 0
        }, {
            id: 12,
            imageUrl: "",
            paths: [2, 7, 0, 5, 6, 3, 4, 1],
            rotation: 0
        }, {
            id: 13,
            imageUrl: "",
            paths: [5, 4, 7, 6, 1, 0, 3, 2],
            rotation: 0
        }, {
            id: 14,
            imageUrl: "",
            paths: [3, 2, 1, 0, 7, 6, 5, 4],
            rotation: 0
        }, {
            id: 15,
            imageUrl: "",
            paths: [1, 0, 7, 4, 3, 6, 5, 2],
            rotation: 0
        }, {
            id: 16,
            imageUrl: "",
            paths: [1, 0, 5, 6, 7, 2, 3, 4],
            rotation: 0
        }, {
            id: 17,
            imageUrl: "",
            paths: [3, 5, 6, 0, 7, 1, 2, 4],
            rotation: 0
        }, {
            id: 18,
            imageUrl: "",
            paths: [2, 7, 0, 4, 3, 6, 5, 1],
            rotation: 0
        }, {
            id: 19,
            imageUrl: "",
            paths: [4, 3, 6, 1, 0, 7, 2, 5],
            rotation: 0
        }, {
            id: 20,
            imageUrl: "",
            paths: [2, 6, 0, 4, 3, 7, 1, 5],
            rotation: 0
        }, {
            id: 21,
            imageUrl: "",
            paths: [2, 3, 0, 1, 7, 6, 5, 4],
            rotation: 0
        }, {
            id: 22,
            imageUrl: "",
            paths: [2, 6, 0, 5, 7, 3, 1, 4],
            rotation: 0
        }, {
            id: 23,
            imageUrl: "",
            paths: [1, 0, 6, 4, 3, 7, 2, 5],
            rotation: 0
        }, {
            id: 24,
            imageUrl: "",
            paths: [3, 4, 7, 0, 1, 6, 5, 2],
            rotation: 0
        }, {
            id: 25,
            imageUrl: "",
            paths: [1, 0, 3, 2, 7, 6, 5, 4],
            rotation: 0
        }, {
            id: 26,
            imageUrl: "",
            paths: [1, 0, 6, 7, 5, 4, 2, 3],
            rotation: 0
        }, {
            id: 27,
            imageUrl: "",
            paths: [2, 4, 0, 7, 1, 6, 5, 3],
            rotation: 0
        }, {
            id: 28,
            imageUrl: "",
            paths: [4, 2, 1, 7, 0, 6, 5, 3],
            rotation: 0
        }, {
            id: 29,
            imageUrl: "",
            paths: [1, 0, 3, 2, 5, 4, 7, 6],
            rotation: 0
        }, {
            id: 30,
            imageUrl: "",
            paths: [2, 3, 0, 1, 6, 7, 4, 5],
            rotation: 0
        }, {
            id: 31,
            imageUrl: "",
            paths: [3, 6, 5, 0, 7, 2, 1, 4],
            rotation: 0
        }, {
            id: 32,
            imageUrl: "",
            paths: [1, 0, 6, 5, 7, 3, 2, 4],
            rotation: 0
        }, {
            id: 33,
            imageUrl: "",
            paths: [1, 0, 3, 2, 6, 7, 4, 5],
            rotation: 0
        }, {
            id: 34,
            imageUrl: "",
            paths: [4, 5, 7, 6, 0, 1, 3, 2],
            rotation: 0
        }, {
            id: 35,
            imageUrl: "",
            paths: [1, 0, 7, 5, 6, 3, 4, 2],
            rotation: 0
        }];

        var deck = new Deck(tiles).shuffle().tiles;
        initialDeckArr.$add(deck);
        deckArr.$add(deck);

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

tsuro.directive('tile', function () {
    return {
        templateUrl: 'browser/js/game/tile.directive.html',
        scope: {
            thisTile: '=',
            'tryTile': '&tryTile',
            'rotateccw': '&rotateccw',
            'rotatecw': '&rotatecw',
            'place': '&place'
        },
        link: function link(s, e, a) {
            // e.on('click', function(event){
            //     s.tryTile(s.thisTile);
            //     // console.log('clicked me!', s.thisTile);
            // });
        }
    };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImdhbWUvYm9hcmQuanMiLCJnYW1lL2RlY2suanMiLCJnYW1lL2dhbWUuY29udHJ1Y3Rvci5qcyIsImdhbWUvZ2FtZS5qcyIsImdhbWVsaXN0L2dhbWVsaXN0LmpzIiwibG9naW4vbG9naW4uanMiLCJwaWNrR2FtZS9waWNrR2FtZS5qcyIsInBsYXllci9wbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBQSxRQUFBLFFBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTs7QUFFQSxNQUFBLE1BQUEsQ0FBQSxZQUFBO0FBQ0EsUUFBQSxTQUFBO0FBQ0EsZ0JBQUEseUNBREE7QUFFQSxvQkFBQSxzQ0FGQTtBQUdBLHFCQUFBLDZDQUhBO0FBSUEsdUJBQUE7QUFKQSxLQUFBO0FBTUEsYUFBQSxhQUFBLENBQUEsTUFBQTtBQUNBLENBUkE7O0FBVUEsTUFBQSxRQUFBLENBQUEsYUFBQSxFQUFBLDRDQUFBOztBQUVBLE1BQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQTtBQUNBLHVCQUFBLFNBQUEsQ0FBQSxHQUFBO0FBQ0EsQ0FGQTs7QUNkQSxTQUFBLEtBQUEsR0FBQTtBQUNBLFNBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQTs7QUFFQSxNQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBO0FBQ0E7QUFDQSxXQUFBLEtBQUEsS0FBQTtBQUNBLENBUkE7O0FBVUEsU0FBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEVBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQTs7QUFFQSxTQUFBLE1BQUEsR0FBQSxDQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBQUE7O0FBRUEsU0FBQSxJQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsc0JBQUE7O0FBRUEsWUFBQSxJQUFBLENBQUEsRUFBQTs7QUFDQSw0QkFBQSxNQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxDO0FBQ0EsZ0JBQUEsTUFBQSxDQUFBLEVBQUEsS0FBQSxNQUFBLENBQUEsQ0FBQSxJQUFBLElBQUEsS0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0FBQ0EsbUJBQUEsQ0FEQTtBQUVBLG1CQUFBLENBRkE7QUFHQSxtQkFBQTtBQUhBLGFBQUEsQ0FBQSxDQUFBLENBQUEsS0FLQTtBQUNBLHFCQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsTUFBQSxJQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBO0FBQ0EsU0FWQSxNQVVBLElBQUEsSUFBQSxDQUFBLEVBQUE7O0FBQ0EsNEJBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUE7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7QUFDQSxtQkFBQSxDQURBO0FBRUEsbUJBQUEsQ0FGQTtBQUdBLG1CQUFBO0FBSEEsYUFBQSxDQUFBLENBQUEsQ0FBQSxLQUtBO0FBQ0EscUJBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtBQUNBLHVCQUFBLENBREE7QUFFQSx1QkFBQSxDQUZBO0FBR0EsdUJBQUE7QUFIQSxpQkFBQSxFQUlBO0FBQ0EsdUJBQUEsSUFBQSxDQURBO0FBRUEsdUJBQUEsQ0FGQTtBQUdBLHVCQUFBO0FBSEEsaUJBSkEsQ0FBQSxDQUFBO0FBU0E7QUFDQSxTQWxCQSxNQWtCQSxJQUFBLElBQUEsQ0FBQSxFQUFBOztBQUNBLDRCQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsZ0JBQUEsTUFBQSxDQUFBLEVBQUEsS0FBQSxNQUFBLENBQUEsQ0FBQSxJQUFBLElBQUEsS0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0FBQ0EsbUJBQUEsQ0FEQTtBQUVBLG1CQUFBLENBRkE7QUFHQSxtQkFBQTtBQUhBLGFBQUEsQ0FBQSxDQUFBLENBQUEsS0FLQTtBQUNBLHFCQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7QUFDQSx1QkFBQSxDQURBO0FBRUEsdUJBQUEsQ0FGQTtBQUdBLHVCQUFBO0FBSEEsaUJBQUEsRUFJQTtBQUNBLHVCQUFBLENBREE7QUFFQSx1QkFBQSxJQUFBLENBRkE7QUFHQSx1QkFBQTtBQUhBLGlCQUpBLENBQUEsQ0FBQTtBQVNBO0FBQ0EsU0FsQkEsTUFrQkE7O0FBQ0EsNEJBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsQztBQUNBLGdCQUFBLE1BQUEsQ0FBQSxFQUFBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtBQUNBLG1CQUFBLENBREE7QUFFQSxtQkFBQSxDQUZBO0FBR0EsbUJBQUE7QUFIQSxhQUFBLENBQUEsQ0FBQSxDQUFBLEtBS0E7QUFDQSxxQkFBQSxNQUFBLENBQUEsQ0FBQSxJQUFBLE1BQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxFQUFBLE1BQUEsQ0FBQSxhQUFBLENBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBSUEsU0FBQSxLQUFBLENBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQTtBQUNBLFNBQUEsSUFBQSxHQUFBLElBQUE7QUFDQSxTQUFBLFNBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLFNBQUEsU0FBQSxHQUFBLEtBQUE7QUFDQSxTQUFBLE1BQUEsR0FBQSxLQUFBO0FBQ0E7O0FDMUZBOztJQUVBLEk7QUFDQSxrQkFBQSxLQUFBLEVBQUE7QUFBQTs7QUFDQSxhQUFBLEtBQUEsR0FBQSxLQUFBO0FBQ0E7Ozs7a0NBRUE7QUFDQSxpQkFBQSxLQUFBLEdBQUEsRUFBQSxPQUFBLENBQUEsS0FBQSxLQUFBLENBQUE7QUFDQSxtQkFBQSxJQUFBO0FBQ0E7OztvQ0FFQTtBQUNBLG1CQUFBLEtBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0E7Ozs2QkFFQSxHLEVBQUE7QUFDQSxtQkFBQSxLQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLEdBQUEsQ0FBQTtBQUNBOzs7K0JBRUEsSyxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBO0FBQ0EsbUJBQUEsSUFBQTtBQUNBOzs7Ozs7QUN2QkE7Ozs7SUFJQSxJO0FBQ0Esa0JBQUEsSUFBQSxFQUFBO0FBQUE7O0FBQ0EsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQUNBLGFBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLEtBQUEsR0FBQSxJQUFBLEtBQUEsR0FBQSxTQUFBLEVBQUE7QUFDQSxhQUFBLE9BQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxnQkFBQSxHQUFBLENBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxRQUFBLEVBQUEsT0FBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLFFBQUEsQ0FBQTs7O0FBR0EsYUFBQSxVQUFBOztBQUVBLGFBQUEsTUFBQSxHQUFBLElBQUE7QUFDQSxhQUFBLEtBQUE7QUFDQTs7OzsyQ0FFQTtBQUNBLGdCQUFBLEtBQUEsVUFBQSxLQUFBLENBQUEsQ0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxPQUFBLENBQUEsS0FBQSxVQUFBLENBQUE7QUFDQTs7O3lDQUVBO0FBQ0EsaUJBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLE1BQUE7QUFBQSx1QkFBQSxPQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUE7QUFBQSxhQUFBO0FBQ0E7OztzQ0FFQTtBQUNBLGdCQUFBLG1CQUFBLEVBQUE7QUFDQSxpQkFBQSxPQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0Esb0JBQUEsQ0FBQSxPQUFBLE9BQUEsSUFBQSxPQUFBLEtBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EscUNBQUEsSUFBQSxDQUFBLE9BQUEsS0FBQTtBQUNBLG1DQUFBLElBQUE7QUFDQTtBQUNBLGFBTEE7QUFNQSxtQkFBQSxnQkFBQTtBQUNBOzs7b0NBRUE7QUFDQSxtQkFBQSxLQUFBLFVBQUEsR0FBQSxNQUFBLElBQUEsQ0FBQTtBQUNBOzs7Ozs7eUNBR0E7QUFDQSxnQkFBQSxLQUFBLFVBQUEsR0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0Esd0JBQUEsR0FBQSxDQUFBLEtBQUEsVUFBQSxFQUFBLFlBQUEsRUFBQSxTQUFBLEVBQUEsS0FBQSxPQUFBO0FBQ0Esb0JBQUEsU0FBQSxLQUFBLFVBQUEsR0FBQSxDQUFBLElBQUEsS0FBQSxPQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsR0FBQSxLQUFBLFVBQUEsR0FBQSxDQUFBO0FBQ0Esd0JBQUEsR0FBQSxDQUFBLFFBQUEsRUFBQSxNQUFBO0FBQ0EsdUJBQUEsU0FBQSxLQUFBLE9BQUEsQ0FBQSxNQUFBLElBQUEsQ0FBQSxLQUFBLE9BQUEsQ0FBQSxNQUFBLEVBQUEsT0FBQSxFQUFBO0FBQ0E7QUFDQSx3QkFBQSxXQUFBLEtBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxTQUFBLENBQUE7QUFDQSw0QkFBQSxHQUFBLENBQUEsTUFBQTtBQUNBO0FBQ0EscUJBQUEsVUFBQSxHQUFBLE1BQUE7QUFDQSxhQVZBLE1BVUE7QUFDQSxxQkFBQSxVQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQSxtQkFBQSxLQUFBLGdCQUFBLEVBQUE7QUFDQTs7OzZCQUVBLEcsRUFBQTtBQUNBLGdCQUFBLFFBQUEsRUFBQTtBQUNBLGlCQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0Esb0JBQUEsT0FBQSxLQUFBLElBQUEsQ0FBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxxQkFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSw0QkFBQSxHQUFBLENBQUEsZUFBQTtBQUNBLGlCQUZBO0FBR0Esd0JBQUEsTUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0Esd0JBQUEsR0FBQSxDQUFBLEtBQUE7QUFDQTtBQUNBLG1CQUFBLEtBQUE7QUFDQTs7O3FDQUVBO0FBQ0EsbUJBQUEsS0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0EsdUJBQUEsT0FBQSxPQUFBO0FBQ0EsYUFGQSxDQUFBO0FBR0E7Ozs7OztBQzlFQSxNQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxhQUFBLGlCQURBO0FBRUEscUJBQUEsNEJBRkE7QUFHQSxvQkFBQTtBQUhBLEtBQUE7QUFLQSxDQU5BOztBQVNBLE1BQUEsVUFBQSxDQUFBLFVBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxhQUFBLEVBQUEsV0FBQSxFQUFBLFlBQUEsRUFBQSxlQUFBLEVBQUEsY0FBQSxFQUFBLE1BQUEsRUFBQTs7QUFFQSxRQUFBLE1BQUEsU0FBQSxRQUFBLEdBQUEsR0FBQSxFQUFBO0FBQ0EsUUFBQSxNQUFBLGdCQUFBLEdBQUEsQ0FBQTs7QUFFQSxRQUFBLFVBQUEsSUFBQSxLQUFBLENBQUEsT0FBQSxFQUFBLEtBQUEsQ0FBQSxhQUFBLFFBQUEsQ0FBQTtBQUNBLFFBQUEsVUFBQSxRQUFBLEtBQUEsQ0FBQSxhQUFBLFFBQUEsQ0FBQTs7QUFFQSxRQUFBLGlCQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxLQUFBLENBQUEsYUFBQSxRQUFBLEVBQUEsS0FBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLFFBQUEsaUJBQUEsZUFBQSxjQUFBLENBQUE7O0FBRUEsUUFBQSxVQUFBLFFBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQTtBQUNBLFFBQUEsVUFBQSxlQUFBLE9BQUEsQ0FBQTs7QUFFQSxRQUFBLGFBQUEsUUFBQSxLQUFBLENBQUEsU0FBQSxDQUFBO0FBQ0EsUUFBQSxxQkFBQSxlQUFBLFVBQUEsQ0FBQTs7QUFFQSxRQUFBLGFBQUEsUUFBQSxLQUFBLENBQUEsa0JBQUEsQ0FBQTtBQUNBLFFBQUEsYUFBQSxlQUFBLFVBQUEsQ0FBQTs7QUFFQSxRQUFBLFdBQUEsUUFBQSxLQUFBLENBQUEsT0FBQSxDQUFBO0FBQ0EsUUFBQSxXQUFBLGVBQUEsUUFBQSxDQUFBOztBQUVBLFFBQUEsV0FBQSxRQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUE7QUFDQSxRQUFBLFdBQUEsZUFBQSxRQUFBLENBQUE7O0FBRUEsUUFBQSxTQUFBLE9BQUEsTUFBQSxDQUFBLE9BQUEsU0FBQSxDQUFBOzs7Ozs7O0FBT0EsV0FBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsYUFBQSxRQUFBLENBQUE7OztBQUdBLGFBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLE1BQUEsRUFBQTtBQUNBLHFCQUFBLElBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxLQUFBO0FBQ0E7QUFDQSxlQUFBLElBQUEsQ0FBQSxLQUFBLEdBQUEsUUFBQTs7O0FBR0EsaUJBQUEsRUFBQSxDQUFBLGVBQUEsRUFBQSxVQUFBLElBQUEsRUFBQTs7QUFFQSxvQkFBQSxHQUFBLENBQUEsSUFBQTtBQUNBLG1CQUFBLElBQUEsQ0FBQSxLQUFBLEdBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxTQUpBO0FBS0EsS0FaQTs7QUFjQSxXQUFBLE1BQUEsR0FBQSxFQUFBLE9BQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7OztBQUlBLFlBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTs7QUFFQSxlQUFBLElBQUEsQ0FBQSxJQUFBLEdBQUEsT0FBQSxDOzs7QUFHQSxtQkFBQSxFQUFBLENBQUEsT0FBQSxFQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsY0FBQSxLQUFBLEdBQUEsRUFBQSxDOzs7QUFHQSxpQkFBQSxJQUFBLFVBQUEsSUFBQSxXQUFBLEVBQUE7QUFDQSxvQkFBQSxtQkFBQSxFQUFBLGdCQUFBOzs7QUFHQSxvQkFBQSxjQUFBLE9BQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBO0FBQ0EsMENBQUEsT0FBQTtBQUNBLDJCQUFBLEtBQUEsR0FBQSxLQUFBLFlBQUEsVUFBQSxFQUFBLEdBQUE7QUFDQSxpQkFIQSxDQUFBOzs7QUFNQSxvQkFBQSxDQUFBLFdBQUEsRUFBQTtBQUNBLDRCQUFBLEdBQUEsQ0FBQSw4QkFBQTtBQUNBLGtDQUFBLElBQUEsTUFBQSxDQUFBLFlBQUEsVUFBQSxFQUFBLEdBQUEsQ0FBQTtBQUNBLHVDQUFBLElBQUE7QUFDQTs7O0FBR0EscUJBQUEsSUFBQSxjQUFBLElBQUEsWUFBQSxVQUFBLENBQUEsRUFBQTtBQUNBLGdDQUFBLGNBQUEsSUFBQSxZQUFBLFVBQUEsRUFBQSxjQUFBLENBQUE7QUFDQTs7O0FBR0Esb0JBQUEsZ0JBQUEsRUFBQSxPQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsRUFBQSxLQUNBLE9BQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxtQkFBQSxJQUFBLFdBQUE7QUFDQTtBQUNBLFNBN0JBO0FBK0JBLEtBcENBOzs7QUF5Q0EsZUFBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZUFBQSxJQUFBLENBQUEsZ0JBQUEsR0FBQSxLQUFBLENBQUEsQ0FBQTtBQUNBLEtBRkE7OztBQUtBLGVBQUEsRUFBQSxDQUFBLGVBQUEsRUFBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGVBQUEsSUFBQSxDQUFBLGdCQUFBLEdBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxLQUZBOzs7QUFLQSxhQUFBLElBQUEsR0FBQSxrQkFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsMkJBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxVQUFBLE9BQUEsRUFBQTs7QUFFQSxnQkFBQSxJQUFBLEVBQUE7QUFDQSxvQkFBQSxLQUFBO0FBQ0Esd0JBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQTtBQUNBLHdCQUFBLEVBQUEsR0FBQSxLQUFBLEtBQUEsR0FBQSxFQUFBLFFBQUEsQ0FBQTtBQUNBLGlCQUZBOztBQUlBLHVCQUFBLEVBQUEsR0FBQSxRQUFBLEtBQUEsQ0FBQTtBQUNBLHVCQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQTs7QUFHQSxvQkFBQSxPQUFBLEVBQUEsQ0FBQSxNQUFBLEtBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLE1BQUEsR0FBQSxJQUFBO0FBRUEsYUFaQSxNQVlBOztBQUVBLHdCQUFBLEdBQUEsQ0FBQSxxQkFBQTtBQUNBO0FBQ0Esb0JBQUEsR0FBQSxDQUFBLGlCQUFBO0FBQ0EsU0FuQkE7QUFvQkEsS0FyQkE7Ozs7OztBQTRCQSxXQUFBLFVBQUEsR0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGlCQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSx5QkFBQSxJQUFBLEVBQUEsTUFBQTtBQUNBLFNBRkE7QUFHQSxLQUpBOztBQU1BLFFBQUEsZUFBQSxTQUFBLFlBQUEsQ0FBQSxLQUFBLEVBQUEsTUFBQSxFQUFBOztBQUVBLGVBQUEsRUFBQSxDQUFBLE1BQUEsR0FBQSxNQUFBOztBQUVBLDJCQUFBLE9BQUEsR0FDQSxJQURBLENBQ0EsVUFBQSxPQUFBLEVBQUE7QUFDQSxnQkFBQSxLQUFBOztBQUVBLG9CQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxDQUFBLEVBQUE7QUFDQSxvQkFBQSxFQUFBLEdBQUEsS0FBQSxPQUFBLEVBQUEsQ0FBQSxHQUFBLEVBQUEsUUFBQSxDQUFBO0FBQ0EsYUFGQTs7QUFJQSwrQkFBQSxLQUFBLEVBQUEsTUFBQSxHQUFBLE1BQUE7QUFDQSwrQkFBQSxLQUFBLENBQUEsS0FBQTtBQUNBLFNBVkE7O0FBWUEsWUFBQSxNQUFBLE9BQUEsSUFBQSxDQUFBLGdCQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQTs7QUFFQSxtQkFBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLG1CQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQ0EsSUFEQSxDQUNBLFVBQUEsR0FBQSxFQUFBO0FBQ0Esb0JBQUEsR0FBQSxDQUFBLDJCQUFBO0FBQ0Esb0JBQUEsR0FBQSxDQUFBLElBQUEsR0FBQTtBQUNBLFNBSkE7QUFLQSxLQXpCQTs7OztBQStCQSxXQUFBLFdBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLGlCQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSwwQkFBQSxJQUFBLEVBQUEsS0FBQTtBQUNBLFNBRkE7QUFHQSxLQUpBOzs7O0FBUUEsUUFBQSxnQkFBQSxTQUFBLGFBQUEsQ0FBQSxLQUFBLEVBQUEsS0FBQSxFQUFBO0FBQ0EsZ0JBQUEsR0FBQSxDQUFBLEtBQUE7Ozs7O0FBS0EsZUFBQSxXQUFBLENBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUE7O0FBRUEsZUFBQSxFQUFBLENBQUEsS0FBQSxHQUFBLE9BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7O0FBRUEsZUFBQSxPQUFBLEdBQUEsSUFBQTs7QUFFQSwyQkFBQSxPQUFBLEdBQ0EsSUFEQSxDQUNBLFVBQUEsT0FBQSxFQUFBOztBQUVBLGdCQUFBLEtBQUE7QUFDQSxvQkFBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBO0FBQ0Esb0JBQUEsRUFBQSxHQUFBLEtBQUEsT0FBQSxFQUFBLENBQUEsR0FBQSxFQUFBLFFBQUEsQ0FBQTtBQUNBLGFBRkE7O0FBSUEsK0JBQUEsS0FBQSxJQUFBLE9BQUEsRUFBQSxDOztBQUVBLCtCQUFBLEtBQUEsQ0FBQSxLQUFBLEU7QUFDQSxTQVhBO0FBWUEsZUFBQSxLQUFBO0FBQ0EsS0F6QkE7Ozs7O0FBK0JBLFdBQUEsT0FBQSxHQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsR0FBQSxDQUFBLGFBQUE7QUFDQSxnQkFBQSxHQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLGVBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxFQUFBLEtBQUEsR0FBQSxLQUFBLFFBQUE7QUFDQSxlQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsRUFBQSxRQUFBLEdBQUEsS0FBQSxRQUFBO0FBQ0EsS0FMQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWlDQSxXQUFBLGFBQUEsR0FBQSxPQUFBLElBQUEsQ0FBQSxnQkFBQSxFQUFBOzs7QUFHQSxXQUFBLE1BQUE7QUFDQSxRQUFBLHdCQUFBLEVBQUE7O0FBRUEsV0FBQSxLQUFBLEdBQUEsWUFBQTs7QUFFQSxLQUZBOztBQUlBLFdBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxlQUFBLEVBQUEsS0FBQSxPQUFBLGFBQUE7QUFDQSxLQUZBOzs7O0FBTUEsV0FBQSxZQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLFFBQUE7QUFDQSxZQUFBLEtBQUEsUUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLFFBQUEsR0FBQSxDQUFBO0FBQ0EsZ0JBQUEsR0FBQSxDQUFBLFdBQUEsRUFBQSxJQUFBO0FBQ0EsS0FKQTs7QUFNQSxXQUFBLGFBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsUUFBQTtBQUNBLFlBQUEsS0FBQSxRQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxRQUFBLEdBQUEsQ0FBQTtBQUNBLGdCQUFBLEdBQUEsQ0FBQSxZQUFBLEVBQUEsSUFBQTtBQUNBLEtBSkE7Ozs7QUFRQSxXQUFBLFNBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGdCQUFBLEdBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsZUFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxHQUFBLEtBQUEsUUFBQTtBQUNBLGVBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxFQUFBLFFBQUEsR0FBQSxLQUFBLFFBQUE7O0FBRUEsWUFBQSxLQUFBLFFBQUEsR0FBQSxDQUFBLEVBQUE7QUFDQSxpQkFBQSxLQUFBLEdBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsVUFBQSxFQUFBO0FBQ0EsNkJBQUEsYUFBQSxDQUFBO0FBQ0Esb0JBQUEsZUFBQSxDQUFBLEVBQUEsYUFBQSxDQUFBO0FBQ0Esb0JBQUEsZUFBQSxDQUFBLEVBQUEsYUFBQSxDQUFBO0FBQ0EsdUJBQUEsVUFBQTtBQUNBLGFBTEEsQ0FBQTtBQU1BLGlCQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxTQVRBLE1BU0EsSUFBQSxLQUFBLFFBQUEsR0FBQSxDQUFBLEVBQUE7QUFDQSxpQkFBQSxLQUFBLEdBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsVUFBQSxFQUFBO0FBQ0EsNkJBQUEsYUFBQSxDQUFBO0FBQ0Esb0JBQUEsZUFBQSxDQUFBLENBQUEsRUFBQSxhQUFBLENBQUE7QUFDQSxvQkFBQSxlQUFBLENBQUEsQ0FBQSxFQUFBLGFBQUEsQ0FBQTtBQUNBLHVCQUFBLFVBQUE7QUFDQSxhQUxBLENBQUE7QUFNQSxpQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLGlCQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0E7O0FBRUEsWUFBQSxxQkFBQSxlQUFBLFVBQUEsQ0FBQTtBQUNBLDJCQUFBLE9BQUEsR0FDQSxJQURBLENBQ0EsVUFBQSxPQUFBLEVBQUE7QUFDQSxnQkFBQSxLQUFBO0FBQ0Esb0JBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUEsR0FBQSxLQUFBLE9BQUEsRUFBQSxDQUFBLEdBQUEsRUFBQSxRQUFBLENBQUE7QUFDQSxhQUZBOztBQUlBLCtCQUFBLEtBQUEsRUFBQSxLQUFBLEdBQUEsbUJBQUEsS0FBQSxFQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLEVBQUE7QUFDQSx1QkFBQSxFQUFBLEVBQUEsS0FBQSxLQUFBLEVBQUE7QUFDQSxhQUZBLENBQUE7O0FBSUEsK0JBQUEsS0FBQSxFQUFBLFNBQUEsQ0FBQSxPQUFBLEdBQUEsS0FBQSxRQUFBOztBQUVBLGlCQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxLQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0Esb0JBQUEsbUJBQUEsS0FBQSxFQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxDQUFBLE1BQUEsR0FBQSxFQUFBO0FBQ0EsdUNBQUEsS0FBQSxFQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQTtBQUNBLG1DQUFBLEtBQUEsRUFBQSxTQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsSUFBQSxDQUFBLG1CQUFBLEtBQUEsRUFBQSxTQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsbUNBQUEsS0FBQSxDQUFBLEtBQUE7QUFDQTs7QUFFQSwrQkFBQSxLQUFBLEVBQUEsS0FBQSxHQUFBLG1CQUFBLEtBQUEsRUFBQSxTQUFBLENBQUEsTUFBQSxDQUFBLG1CQUFBLEtBQUEsRUFBQSxvQkFBQSxDQUFBOztBQUVBLCtCQUFBLEtBQUEsQ0FBQSxLQUFBOztBQUVBLGdCQUFBLG9CQUFBLG1CQUFBLEtBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtBQUNBLGdCQUFBLG9CQUFBLG1CQUFBLEtBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtBQUNBLG1CQUFBLENBQUEsaUJBQUEsRUFBQSxpQkFBQSxDQUFBO0FBQ0EsU0E1QkEsRUE2QkEsSUE3QkEsQ0E2QkEsVUFBQSxTQUFBLEVBQUE7QUFDQSxxQkFBQSxPQUFBLEdBQ0EsSUFEQSxDQUNBLFlBQUE7QUFDQSxvQkFBQSxNQUFBLFNBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLG9CQUFBLFdBQUEsU0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0Esb0JBQUEsV0FBQSxlQUFBLFFBQUEsQ0FBQTtBQUNBLHlCQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0EsdUJBQUEsR0FBQTtBQUNBLGFBUEEsRUFRQSxJQVJBLENBUUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxvQkFBQSxXQUFBLFNBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxLQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLG9CQUFBLFdBQUEsZUFBQSxRQUFBLENBQUE7QUFDQSx5QkFBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSw0QkFBQSxHQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7QUFDQSw2QkFBQSxDQUFBLEVBQUEsT0FBQSxDQUFBLFVBQUEsS0FBQSxFQUFBLEdBQUEsRUFBQTtBQUNBLDRCQUFBLFdBQUEsU0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSw0QkFBQSxXQUFBLGVBQUEsUUFBQSxDQUFBO0FBQ0EsaUNBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsZ0NBQUEsY0FBQSxTQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLFFBQUEsRUFBQSxLQUFBLENBQUEsR0FBQSxFQUFBLEtBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxnQ0FBQSxjQUFBLGVBQUEsV0FBQSxDQUFBO0FBQ0Esd0NBQUEsSUFBQSxDQUFBLFNBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSx5QkFKQTtBQUtBLHFCQVJBO0FBVUEsaUJBWkE7QUFhQSxhQXhCQTtBQXlCQSxTQXZEQTs7Ozs7OztBQThEQSwyQkFBQSxPQUFBLEdBQ0EsSUFEQSxDQUNBLFVBQUEsT0FBQSxFQUFBO0FBQ0EscUJBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLHdCQUFBLE9BQUEsQ0FBQSxVQUFBLENBQUEsRUFBQTtBQUNBLHdCQUFBLFVBQUEsT0FBQSxNQUFBLENBQUEsRUFBQSxLQUFBLENBQUE7QUFDQSx3QkFBQSxPQUFBLFFBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSwyQkFBQSxPQUFBLEVBQUE7QUFDQSwwQkFBQSxLQUFBLENBQUEsU0FBQSxHQUFBLElBQUE7QUFDQSwwQkFBQSxLQUFBLEdBQUEsT0FBQTs7QUFFQSw0QkFBQSxFQUFBLEtBQUEsQ0FBQSxTQUFBLEtBQUEsSUFBQSxFQUFBO0FBQ0EsOEJBQUEsT0FBQSxHQUFBLEtBQUE7QUFDQTtBQUNBOzs7QUFHQSw0QkFBQSxnQkFBQTs7QUFFQSw0QkFBQSxFQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsRUFBQTtBQUNBLCtDQUFBLEVBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSx1Q0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLFNBQUEsQ0FBQSxDQUFBLElBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtBQUNBLDZCQUZBLEVBRUEsQ0FGQSxDQUFBO0FBSUEseUJBTEEsTUFLQTtBQUNBLCtDQUFBLEVBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7QUFDQTs7QUFFQSw0QkFBQSxXQUFBLEVBQUEsU0FBQTtBQUNBLDRCQUFBLFdBQUEsTUFBQSxDQUFBLEVBQUEsaUJBQUEsQ0FBQSxFQUFBLGlCQUFBLENBQUEsQ0FBQTtBQUNBLDBCQUFBLFNBQUEsR0FBQSxRQUFBOztBQUVBLDJDQUFBLEtBQUEsQ0FBQSxJQUFBOztBQUVBLCtCQUFBLFVBQUEsQ0FBQSxDQUFBO0FBQ0Esa0NBQUEsT0FBQSxNQUFBLENBQUEsRUFBQSxLQUFBLENBQUE7QUFDQTtBQUNBLDRCQUFBLEdBQUEsQ0FBQSxZQUFBO0FBQ0EsaUJBbkNBO0FBb0NBLGFBckNBO0FBc0NBLFNBeENBOztBQTJDQSxZQUFBLE9BQUEsSUFBQSxDQUFBLFNBQUEsRUFBQSxFQUFBOztBQUVBLG1CQUFBLE1BQUEsR0FBQSxPQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsbUJBQUEsUUFBQSxHQUFBLElBQUE7QUFDQSxvQkFBQSxHQUFBLENBQUEsV0FBQTs7QUFFQSxTQU5BLE1BTUE7QUFDQSxnQkFBQSxPQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsTUFBQSxFQUFBOzs7O0FBSUEsb0JBQUEsa0JBQUEsT0FBQSxJQUFBLENBQUEsV0FBQSxHQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxDQUFBLEVBQUE7QUFDQSwyQkFBQSxJQUFBLEVBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLGlCQUZBLENBQUE7O0FBSUEsdUJBQUEsSUFBQSxDQUFBLElBQUEsR0FBQSxPQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLGVBQUEsQ0FBQTtBQUNBLHVCQUFBLElBQUEsQ0FBQSxJQUFBLEdBQUEsT0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsRUFBQTs7O0FBR0EseUJBQUEsSUFBQSxDQUFBO0FBQ0EsNEJBQUEsWUFEQTtBQUVBLGtDQUFBLE9BQUEsSUFBQSxDQUFBO0FBRkEsaUJBQUE7QUFJQTs7O0FBR0EsZ0JBQUEsT0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLE1BQUEsRUFBQTtBQUNBLHVCQUFBLE1BQUEsR0FBQSxPQUFBLEVBQUE7QUFDQSx3QkFBQSxHQUFBLENBQUEsa0JBQUE7QUFDQSxhQUhBLE1BR0EsSUFBQSxPQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxLQUFBLENBQUEsSUFBQSxPQUFBLE1BQUEsRUFBQTtBQUNBLHNDQUFBLElBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSx3QkFBQSxHQUFBLENBQUEsZ0NBQUE7QUFDQSxhQUhBLE1BR0E7QUFDQSx3QkFBQSxHQUFBLENBQUEsZ0JBQUE7QUFDQSxtQ0FBQSxPQUFBLEdBQ0EsSUFEQSxDQUNBLFVBQUEsT0FBQSxFQUFBOztBQUVBLHdCQUFBLEtBQUE7QUFDQSw0QkFBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBO0FBQ0EsNEJBQUEsRUFBQSxHQUFBLEtBQUEsT0FBQSxFQUFBLENBQUEsR0FBQSxFQUFBLFFBQUEsQ0FBQTtBQUNBLHFCQUZBOzs7QUFLQSx1Q0FBQSxLQUFBLEVBQUEsS0FBQSxHQUFBLE9BQUEsRUFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsNEJBQUEsR0FBQSxDQUFBLHdCQUFBOzs7QUFHQSx1Q0FBQSxLQUFBLENBQUEsS0FBQTs7QUFFQSwyQkFBQSxFQUFBLEdBQUEsbUJBQUEsS0FBQSxDQUFBO0FBQ0EsaUJBaEJBOztBQWtCQSx1QkFBQSxPQUFBLE1BQUEsSUFBQSxPQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsMkJBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLHVDQUFBLE9BQUEsR0FDQSxJQURBLENBQ0EsVUFBQSxPQUFBLEVBQUE7O0FBRUEsNEJBQUEsS0FBQTtBQUNBLGdDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxDQUFBLEVBQUE7QUFDQSxnQ0FBQSxFQUFBLEdBQUEsS0FBQSxPQUFBLE1BQUEsQ0FBQSxHQUFBLEVBQUEsUUFBQSxDQUFBO0FBQ0EseUJBRkE7OztBQUtBLDJDQUFBLEtBQUEsSUFBQSxPQUFBLE1BQUE7OztBQUdBLDJDQUFBLEtBQUEsQ0FBQSxLQUFBO0FBQ0EscUJBYkE7O0FBZUEsMkJBQUEsTUFBQSxHQUFBLE9BQUEscUJBQUEsQ0FBQSxLQUFBLE1BQUEsSUFBQTtBQUNBO0FBQ0E7OztBQUdBLG1CQUFBLGFBQUEsR0FBQSxPQUFBLElBQUEsQ0FBQSxjQUFBLEVBQUE7QUFDQSxvQkFBQSxHQUFBLENBQUEsaUJBQUEsRUFBQSxPQUFBLGFBQUE7QUFDQTtBQUNBLEtBaE5BOztBQW1OQSxXQUFBLFNBQUEsR0FBQSxZQUFBO0FBQ0EsZ0JBQUEsR0FBQSxDQUFBLFNBQUE7O0FBRUEsMkJBQUEsT0FBQSxHQUNBLElBREEsQ0FDQSxVQUFBLE9BQUEsRUFBQTs7QUFFQSxnQkFBQSxLQUFBOztBQUVBLG9CQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxDQUFBLEVBQUE7QUFDQSxvQkFBQSxFQUFBLEdBQUEsS0FBQSxPQUFBLEVBQUEsQ0FBQSxHQUFBLEVBQUEsUUFBQSxDQUFBO0FBQ0EsYUFGQTs7O0FBS0EsK0JBQUEsT0FBQSxDQUFBLG1CQUFBLEtBQUEsQ0FBQTtBQUNBLFNBWEE7O0FBYUEsZUFBQSxFQUFBLENBQUEsVUFBQTtBQUNBLEtBakJBOzs7QUFvQkEsV0FBQSxLQUFBLEdBQUEsWUFBQTtBQUNBLG1CQUFBLE9BQUEsQ0FBQSxDQUFBLEVBQ0EsSUFEQSxDQUNBLFVBQUEsR0FBQSxFQUFBO0FBQ0Esb0JBQUEsR0FBQSxDQUFBLHFCQUFBLEVBQUEsSUFBQSxHQUFBO0FBQ0EsU0FIQTs7QUFLQSxnQkFBQSxPQUFBLENBQUEsQ0FBQSxFQUNBLElBREEsQ0FDQSxVQUFBLEdBQUEsRUFBQTtBQUNBLG9CQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsR0FBQTtBQUNBLFNBSEE7O0FBS0EsdUJBQUEsT0FBQSxDQUFBLENBQUEsRUFDQSxJQURBLENBQ0EsVUFBQSxHQUFBLEVBQUE7QUFDQSxvQkFBQSxHQUFBLENBQUEseUJBQUEsRUFBQSxJQUFBLEdBQUE7QUFDQSxTQUhBOztBQUtBLGlCQUFBLE9BQUEsR0FDQSxJQURBLENBQ0EsVUFBQSxLQUFBLEVBQUE7QUFDQSxpQkFBQSxJQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsTUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EseUJBQUEsT0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLFNBTEEsRUFNQSxJQU5BLENBTUEsWUFBQTtBQUNBLG9CQUFBLEdBQUEsQ0FBQSxtQkFBQTtBQUNBLFNBUkE7O0FBV0EsWUFBQSxRQUFBLENBQUE7QUFDQSxnQkFBQSxDQURBO0FBRUEsc0JBQUEsRUFGQTtBQUdBLG1CQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQTtBQUlBLHNCQUFBO0FBSkEsU0FBQSxFQUtBO0FBQ0EsZ0JBQUEsQ0FEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBTEEsRUFVQTtBQUNBLGdCQUFBLENBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQVZBLEVBZUE7QUFDQSxnQkFBQSxDQURBO0FBRUEsc0JBQUEsRUFGQTtBQUdBLG1CQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQTtBQUlBLHNCQUFBO0FBSkEsU0FmQSxFQW9CQTtBQUNBLGdCQUFBLENBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXBCQSxFQXlCQTtBQUNBLGdCQUFBLENBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXpCQSxFQThCQTtBQUNBLGdCQUFBLENBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQTlCQSxFQW1DQTtBQUNBLGdCQUFBLENBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQW5DQSxFQXdDQTtBQUNBLGdCQUFBLENBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXhDQSxFQTZDQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQTdDQSxFQWtEQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQWxEQSxFQXVEQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXZEQSxFQTREQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQTVEQSxFQWlFQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQWpFQSxFQXNFQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXRFQSxFQTJFQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQTNFQSxFQWdGQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQWhGQSxFQXFGQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXJGQSxFQTBGQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQTFGQSxFQStGQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQS9GQSxFQW9HQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXBHQSxFQXlHQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXpHQSxFQThHQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQTlHQSxFQW1IQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQW5IQSxFQXdIQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXhIQSxFQTZIQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQTdIQSxFQWtJQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQWxJQSxFQXVJQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXZJQSxFQTRJQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQTVJQSxFQWlKQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQWpKQSxFQXNKQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXRKQSxFQTJKQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQTNKQSxFQWdLQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQWhLQSxFQXFLQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXJLQSxFQTBLQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQTFLQSxDQUFBOztBQWlMQSxZQUFBLE9BQUEsSUFBQSxJQUFBLENBQUEsS0FBQSxFQUFBLE9BQUEsR0FBQSxLQUFBO0FBQ0EsdUJBQUEsSUFBQSxDQUFBLElBQUE7QUFDQSxnQkFBQSxJQUFBLENBQUEsSUFBQTs7QUFNQSxZQUFBLG9CQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxLQUFBLENBQUEsYUFBQSxRQUFBLEVBQUEsS0FBQSxDQUFBLGtCQUFBLENBQUE7QUFDQSx1QkFBQSxpQkFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsUUFBQSxFQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxRQUFBLENBQUE7O0FBR0EsWUFBQSxVQUFBLGVBQUEsVUFBQSxDQUFBO0FBQ0EsZ0JBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGlCQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxLQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxxQkFBQSxDQUFBLEVBQUEsT0FBQSxHQUFBLElBQUE7QUFDQSxxQkFBQSxDQUFBLEVBQUEsTUFBQSxHQUFBLEdBQUE7QUFDQSxxQkFBQSxDQUFBLEVBQUEsU0FBQSxHQUFBLEdBQUE7QUFDQSxxQkFBQSxDQUFBLEVBQUEsb0JBQUEsR0FBQSxHQUFBO0FBQ0EscUJBQUEsQ0FBQSxFQUFBLEtBQUEsR0FBQSxHQUFBO0FBQ0EscUJBQUEsQ0FBQSxFQUFBLEtBQUEsR0FBQSxHQUFBO0FBQ0Esd0JBQUEsS0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLFNBVkE7O0FBWUEsZUFBQSxNQUFBO0FBQ0EsZ0JBQUEsR0FBQSxDQUFBLE9BQUEsRUFBQTtBQUVBLEtBeE9BOztBQTBPQSxXQUFBLFFBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBLEVBR0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQSxFQUlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSkEsRUFLQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUxBLEVBTUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FOQSxFQU9BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUEEsRUFRQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVJBLEVBU0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FUQSxFQVVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVkEsRUFXQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVhBLEVBWUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FaQSxDQUFBO0FBY0EsV0FBQSxTQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQURBLEVBRUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQSxFQUdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEEsRUFJQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUpBLEVBS0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FMQSxFQU1BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTkEsRUFPQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVBBLEVBUUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FSQSxFQVNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVEEsRUFVQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVZBLEVBV0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FYQSxFQVlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWkEsQ0FBQTtBQWNBLFdBQUEsV0FBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBLEVBSUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FKQSxFQUtBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQU5BLEVBT0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FQQSxFQVFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUkEsRUFTQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVRBLEVBVUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FWQSxFQVdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWEEsRUFZQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVpBLENBQUE7QUFjQSxXQUFBLFVBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBLEVBR0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQSxFQUlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSkEsRUFLQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUxBLEVBTUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FOQSxFQU9BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUEEsRUFRQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVJBLEVBU0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FUQSxFQVVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFB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QSxDQUFBLE1BQUEsQ0FBQTtBQUNBLFlBQUEsVUFBQSxlQUFBLE9BQUEsQ0FBQTs7QUFFQSx1QkFBQSxXQUFBLEVBQUEsSUFBQSxDQUFBO0FBQ0Esd0JBQUE7QUFEQSxTQUFBOztBQUlBLGlCQUFBLElBQUEsR0FBQSxrQkFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsSUFBQSxFQUFBO0FBQ0Esb0JBQUEsWUFBQSxJQUFBLE1BQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQTtBQUNBLCtCQUFBLFVBQUEsRUFBQSxJQUFBLENBQUEsU0FBQTtBQUNBLGFBSEEsTUFHQTtBQUNBLHdCQUFBLEdBQUEsQ0FBQSxrQkFBQTtBQUNBO0FBQ0EsU0FQQTs7QUFTQSxZQUFBLFFBQUEsQ0FBQTtBQUNBLGdCQUFBLENBREE7QUFFQSxzQkFBQSx1SkFGQTtBQUdBLG1CQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQTtBQUlBLHNCQUFBO0FBSkEsU0FBQSxFQUtBO0FBQ0EsZ0JBQUEsQ0FEQTtBQUVBLHNCQUFBLHVKQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQUxBLEVBVUE7QUFDQSxnQkFBQSxDQURBO0FBRUEsc0JBQUEsdUpBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBVkEsRUFlQTtBQUNBLGdCQUFBLENBREE7QUFFQSxzQkFBQSx1SkFGQTtBQUdBLG1CQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQTtBQUlBLHNCQUFBO0FBSkEsU0FmQSxFQW9CQTtBQUNBLGdCQUFBLENBREE7QUFFQSxzQkFBQSx1SkFGQTtBQUdBLG1CQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQTtBQUlBLHNCQUFBO0FBSkEsU0FwQkEsRUF5QkE7QUFDQSxnQkFBQSxDQURBO0FBRUEsc0JBQUEsdUpBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBekJBLEVBOEJBO0FBQ0EsZ0JBQUEsQ0FEQTtBQUVBLHNCQUFBLHVKQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQTlCQSxFQW1DQTtBQUNBLGdCQUFBLENBREE7QUFFQSxzQkFBQSx1SkFGQTtBQUdBLG1CQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQTtBQUlBLHNCQUFBO0FBSkEsU0FuQ0EsRUF3Q0E7QUFDQSxnQkFBQSxDQURBO0FBRUEsc0JBQUEsdUpBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBeENBLEVBNkNBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLHVKQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQTdDQSxFQWtEQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSx1SkFGQTtBQUdBLG1CQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQTtBQUlBLHNCQUFBO0FBSkEsU0FsREEsRUF1REE7QUFDQSxnQkFBQSxFQURBO0FBRUEsc0JBQUEsdUpBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBdkRBLEVBNERBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLHVKQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQTVEQSxFQWlFQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSx1SkFGQTtBQUdBLG1CQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQTtBQUlBLHNCQUFBO0FBSkEsU0FqRUEsRUFzRUE7QUFDQSxnQkFBQSxFQURBO0FBRUEsc0JBQUEsdUpBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBdEVBLEVBMkVBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLHVKQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQTNFQSxFQWdGQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSx1SkFGQTtBQUdBLG1CQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQTtBQUlBLHNCQUFBO0FBSkEsU0FoRkEsRUFxRkE7QUFDQSxnQkFBQSxFQURBO0FBRUEsc0JBQUEsdUpBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBckZBLEVBMEZBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLHVKQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQTFGQSxFQStGQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSx1SkFGQTtBQUdBLG1CQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQTtBQUlBLHNCQUFBO0FBSkEsU0EvRkEsRUFvR0E7QUFDQSxnQkFBQSxFQURBO0FBRUEsc0JBQUEsdUpBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBcEdBLEVBeUdBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLHVKQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXpHQSxFQThHQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSx1SkFGQTtBQUdBLG1CQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQTtBQUlBLHNCQUFBO0FBSkEsU0E5R0EsRUFtSEE7QUFDQSxnQkFBQSxFQURBO0FBRUEsc0JBQUEsdUpBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBbkhBLEVBd0hBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLHVKQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXhIQSxFQTZIQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSx1SkFGQTtBQUdBLG1CQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQTtBQUlBLHNCQUFBO0FBSkEsU0E3SEEsRUFrSUE7QUFDQSxnQkFBQSxFQURBO0FBRUEsc0JBQUEsdUpBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBbElBLEVBdUlBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLHVKQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXZJQSxFQTRJQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSx1SkFGQTtBQUdBLG1CQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQTtBQUlBLHNCQUFBO0FBSkEsU0E1SUEsRUFpSkE7QUFDQSxnQkFBQSxFQURBO0FBRUEsc0JBQUEsdUpBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBakpBLEVBc0pBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLHVKQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXRKQSxFQTJKQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSx1SkFGQTtBQUdBLG1CQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQTtBQUlBLHNCQUFBO0FBSkEsU0EzSkEsRUFnS0E7QUFDQSxnQkFBQSxFQURBO0FBRUEsc0JBQUEsdUpBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBaEtBLEVBcUtBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLHVKQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXJLQSxFQTBLQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSx1SkFGQTtBQUdBLG1CQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQTtBQUlBLHNCQUFBO0FBSkEsU0ExS0EsQ0FBQTs7QUFpTEEsWUFBQSxPQUFBLElBQUEsSUFBQSxDQUFBLEtBQUEsRUFBQSxPQUFBLEdBQUEsS0FBQTtBQUNBLFlBQUEsVUFBQSxJQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsS0FBQSxDQUFBLFFBQUEsRUFBQSxLQUFBLENBQUEsTUFBQSxDQUFBOztBQUVBLHVCQUFBLE9BQUEsRUFBQSxJQUFBLENBQUEsSUFBQTs7QUFFQSxZQUFBLG9CQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxLQUFBLENBQUEsUUFBQSxFQUFBLEtBQUEsQ0FBQSxrQkFBQSxDQUFBO0FBQ0EsdUJBQUEsaUJBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQSxLQUFBLEVBQUEsUUFBQSxFQUFBLFFBQUEsRUFBQSxPQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsUUFBQSxDQUFBOztBQUVBLGdCQUFBLElBQUEsQ0FBQSxJQUFBOztBQUVBLDBCQUFBLElBQUEsQ0FBQSxDQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsUUFBQSxFQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxRQUFBLENBQUE7O0FBRUEsZUFBQSxFQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0Esd0JBQUE7QUFEQSxTQUFBO0FBR0EsS0FyTkE7O0FBdU5BLFdBQUEsWUFBQSxHQUFBLFlBQUE7QUFDQSxlQUFBLEVBQUEsQ0FBQSxVQUFBO0FBQ0EsS0FGQTtBQUdBLENBL05BOztBQ1JBOztBQUVBLFNBQUEsTUFBQSxDQUFBLEdBQUEsRUFBQTs7QUFFQSxTQUFBLEdBQUEsR0FBQSxHQUFBOztBQUVBLFNBQUEsTUFBQSxHQUFBLEdBQUE7OztBQUdBLFNBQUEsS0FBQSxHQUFBLEdBQUE7Ozs7QUFJQSxTQUFBLFNBQUEsR0FBQSxHQUFBOzs7QUFHQSxTQUFBLG9CQUFBLEdBQUEsR0FBQTs7O0FBR0EsU0FBQSxLQUFBLEdBQUEsR0FBQTs7O0FBR0EsU0FBQSxPQUFBLEdBQUEsSUFBQTtBQUNBO0FBQ0EsT0FBQSxTQUFBLENBQUEsRUFBQSxHQUFBLFlBQUE7QUFDQSxZQUFBLEdBQUEsQ0FBQSxJQUFBO0FBQ0EsQ0FGQTs7QUFJQSxPQUFBLFNBQUEsQ0FBQSxXQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQTs7QUFFQSxRQUFBLElBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLElBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLGNBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSxTQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxTQUFBLEtBQUEsQ0FBQSxTQUFBLEdBQUEsSUFBQTs7O0FBR0EsU0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTs7O0FBR0EsU0FBQSxvQkFBQSxHQUFBLEtBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxLQUFBLENBQUE7QUFDQSxDQWJBOztBQWVBLE9BQUEsU0FBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsUUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLEVBQUE7QUFDQSxlQUFBLE1BQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQ0EsS0FGQSxNQUVBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxFQUFBO0FBQ0EsZUFBQSxNQUFBLFNBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLEtBRkEsTUFFQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsRUFBQTtBQUNBLGVBQUEsTUFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLENBQUE7QUFDQSxLQUZBLE1BRUE7QUFDQSxlQUFBLE1BQUEsU0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQSxDQVZBOztBQWFBLE9BQUEsU0FBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLE9BQUEsRUFBQTs7QUFFQSxRQUFBLFlBQUEsUUFBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsZUFBQSxDQUFBLFNBQUEsU0FBQSxJQUFBLGFBQUEsR0FBQTtBQUNBLEtBRkEsRUFFQSxDQUZBLENBQUE7QUFHQSxXQUFBLFNBQUE7QUFDQSxDQU5BOztBQVNBLE9BQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLFFBQUEsZUFBQSxLQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsZUFBQSxTQUFBLFNBQUE7QUFDQSxLQUZBLENBQUE7O0FBSUEsUUFBQSxLQUFBLEtBQUEsQ0FBQSxJQUFBLElBQUEsYUFBQSxNQUFBLEtBQUEsQ0FBQSxFQUFBLEtBQUEsT0FBQSxHQUFBLEtBQUE7QUFDQSxDQU5BIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgdHN1cm8gPSBhbmd1bGFyLm1vZHVsZSgnVHN1cm8nLCBbJ3VpLnJvdXRlcicsICdmaXJlYmFzZSddKTtcblxudHN1cm8uY29uZmlnKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0ge1xuICAgICAgICBhcGlLZXk6IFwiQUl6YVN5Q0xtM2prazVwcE1xZVF4S29ILWRaOUNkWU1hREdXV3FVXCIsXG4gICAgICAgIGF1dGhEb21haW46IFwidGhlLXBhdGhzLW9mLWRyYWdvbnMuZmlyZWJhc2VhcHAuY29tXCIsXG4gICAgICAgIGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vdGhlLXBhdGhzLW9mLWRyYWdvbnMuZmlyZWJhc2Vpby5jb21cIixcbiAgICAgICAgc3RvcmFnZUJ1Y2tldDogXCJ0aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbVwiLFxuICAgIH07XG4gICAgZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChjb25maWcpO1xufSk7XG5cbnRzdXJvLmNvbnN0YW50KCdmaXJlYmFzZVVybCcsICdodHRwczovL3BhdGgtb2YtdGhlLWRyYWdvbi5maXJlYmFzZWlvLmNvbS8nKTtcblxudHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG59KTtcbiIsImZ1bmN0aW9uIEJvYXJkKCkge1xuICAgIHRoaXMuYm9hcmQgPSBbXTtcbn1cblxuQm9hcmQucHJvdG90eXBlLmRyYXdCb2FyZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IDY7IHkrKykge1xuICAgICAgICBpZiAoIXRoaXMuYm9hcmRbeV0pIHRoaXMuYm9hcmRbeV0gPSBbXTtcbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCA2OyB4KyspIHtcbiAgICAgICAgICAgIHRoaXMuYm9hcmRbeV0ucHVzaChuZXcgU3BhY2UoeCwgeSwgdGhpcy5ib2FyZCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmJvYXJkO1xufVxuXG5mdW5jdGlvbiBTcGFjZSh4LCB5LCBib2FyZCkge1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbiAgICAvLyB0aGlzLnRpbGUgPSBcIm5cIjtcbiAgICB0aGlzLnBvaW50cyA9IFtudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgIGxldCBjb3JyZXNwb25kaW5nO1xuXG4gICAgICAgIGlmIChpIDwgMikgeyAvL3RvcFxuICAgICAgICAgICAgY29ycmVzcG9uZGluZyA9IGkgPT09IDAgPyA1IDogNDsgLy8gMCAtPiA1ICYgMSAtPiA0XG4gICAgICAgICAgICBpZiAoeSA9PT0gMCkgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQodHJ1ZSwgW3tcbiAgICAgICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgICAgIHk6IHksXG4gICAgICAgICAgICAgICAgaTogaVxuICAgICAgICAgICAgfV0pO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb2ludHNbaV0gPSBib2FyZFt5IC0gMV1beF0ucG9pbnRzW2NvcnJlc3BvbmRpbmddO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGkgPCA0KSB7IC8vcmlnaHRcbiAgICAgICAgICAgIGNvcnJlc3BvbmRpbmcgPSBpID09PSAyID8gNyA6IDY7XG4gICAgICAgICAgICBpZiAoeCA9PT0gNSkgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQodHJ1ZSwgW3tcbiAgICAgICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgICAgIHk6IHksXG4gICAgICAgICAgICAgICAgaTogaVxuICAgICAgICAgICAgfV0pO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQoZmFsc2UsIFt7XG4gICAgICAgICAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICAgICAgICAgIHk6IHksXG4gICAgICAgICAgICAgICAgICAgIGk6IGlcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIHg6IHggKyAxLFxuICAgICAgICAgICAgICAgICAgICB5OiB5LFxuICAgICAgICAgICAgICAgICAgICBpOiBjb3JyZXNwb25kaW5nXG4gICAgICAgICAgICAgICAgfV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGkgPCA2KSB7IC8vYm90dG9tXG4gICAgICAgICAgICBjb3JyZXNwb25kaW5nID0gaSA9PT0gNCA/IDEgOiAwO1xuICAgICAgICAgICAgaWYgKHkgPT09IDUpIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KHRydWUsIFt7XG4gICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICB5OiB5LFxuICAgICAgICAgICAgICAgIGk6IGlcbiAgICAgICAgICAgIH1dKTtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KGZhbHNlLCBbe1xuICAgICAgICAgICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgICAgICAgICB5OiB5LFxuICAgICAgICAgICAgICAgICAgICBpOiBpXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgICAgICAgICB5OiB5ICsgMSxcbiAgICAgICAgICAgICAgICAgICAgaTogY29ycmVzcG9uZGluZ1xuICAgICAgICAgICAgICAgIH1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHsgLy9sZWZ0XG4gICAgICAgICAgICBjb3JyZXNwb25kaW5nID0gaSA9PT0gNiA/IDMgOiAyOyAvLyA2IC0+IDMgJiA3IC0+IDJcbiAgICAgICAgICAgIGlmICh4ID09PSAwKSB0aGlzLnBvaW50c1tpXSA9IG5ldyBQb2ludCh0cnVlLCBbe1xuICAgICAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICAgICAgeTogeSxcbiAgICAgICAgICAgICAgICBpOiBpXG4gICAgICAgICAgICB9XSk7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBvaW50c1tpXSA9IGJvYXJkW3ldW3ggLSAxXS5wb2ludHNbY29ycmVzcG9uZGluZ107XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxuLy8gZWRnZSA9IGJvb2xlYW5cbmZ1bmN0aW9uIFBvaW50KGVkZ2UsIHNwYWNlKSB7XG4gICAgdGhpcy5lZGdlID0gZWRnZTtcbiAgICB0aGlzLm5laWdoYm9ycyA9IFtcIm5cIl07XG4gICAgdGhpcy50cmF2ZWxsZWQgPSBmYWxzZTtcbiAgICB0aGlzLnNwYWNlcyA9IHNwYWNlO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jbGFzcyBEZWNrIHtcbiAgICBjb25zdHJ1Y3Rvcih0aWxlcykge1xuICAgICAgICB0aGlzLnRpbGVzID0gdGlsZXNcbiAgICB9XG5cbiAgICBzaHVmZmxlKCkge1xuICAgICAgICB0aGlzLnRpbGVzID0gXy5zaHVmZmxlKHRoaXMudGlsZXMpXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGRlYWxUaHJlZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZXMuc3BsaWNlKDAsIDMpO1xuICAgIH1cblxuICAgIGRlYWwobnVtKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGVzLnNwbGljZSgwLCBudW0pO1xuICAgIH1cblxuICAgIHJlbG9hZCh0aWxlcykge1xuICAgICAgICB0aGlzLnRpbGVzLnB1c2godGlsZXMpXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLy9HQU1FLy8vXG5cbmNsYXNzIEdhbWUge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUpIHtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5jb3VudCA9IDM1O1xuICAgICAgICB0aGlzLmJvYXJkID0gbmV3IEJvYXJkKCkuZHJhd0JvYXJkKCk7XG4gICAgICAgIHRoaXMucGxheWVycyA9IFtdO1xuICAgICAgICB0aGlzLmF2YWlsYWJsZU1hcmtlcnMgPSBbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJ5ZWxsb3dcIiwgXCJncmVlblwiLCBcImFxdWFcIiwgXCJibHVlXCIsIFwibmF2eVwiLCBcInB1cnBsZVwiXVxuXG4gICAgICAgIC8vaW5kZXggb2YgdGhlIGN1cnJlbnRQbGF5ZXIgaW4gdGhlIHBsYXllcnNcbiAgICAgICAgdGhpcy5jdXJyUGxheWVyO1xuXG4gICAgICAgIHRoaXMuZHJhZ29uID0gbnVsbDtcbiAgICAgICAgdGhpcy5tb3ZlcztcbiAgICB9XG5cbiAgICBnZXRDdXJyZW50UGxheWVyKCkge1xuICAgICAgICBpZiAodGhpcy5jdXJyUGxheWVyID09PSAtMSkgcmV0dXJuO1xuICAgICAgICByZXR1cm4gdGhpcy5wbGF5ZXJzW3RoaXMuY3VyclBsYXllcl07XG4gICAgfVxuXG4gICAgbW92ZUFsbFBsYXllcnMoKSB7XG4gICAgICAgIHRoaXMucGxheWVycy5mb3JFYWNoKChwbGF5ZXIpID0+IHBsYXllci5rZWVwTW92aW5nKHBsYXllcikpXG4gICAgfVxuXG4gICAgZGVhZFBsYXllcnMoKSB7XG4gICAgICAgIHZhciBkZWFkUGxheWVyc1RpbGVzID0gW107XG4gICAgICAgIHRoaXMucGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICAgICAgIGlmICghcGxheWVyLmNhblBsYXkgJiYgcGxheWVyLnRpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBkZWFkUGxheWVyc1RpbGVzLnB1c2gocGxheWVyLnRpbGVzKTtcbiAgICAgICAgICAgICAgICBpc0RlYWRQbGF5ZXIgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGRlYWRQbGF5ZXJzVGlsZXM7XG4gICAgfVxuXG4gICAgY2hlY2tPdmVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRDYW5QbGF5KCkubGVuZ3RoIDw9IDE7XG4gICAgfVxuXG4gICAgLy90byBiZSBjYWxsZWQgYXQgdGhlIGVuZCBvZiBhIHR1cm4gdG8gc2V0IHRoZSBjdXJyUGxheWVyIHRvIHRoZSBuZXh0IGVsaWdpYmxlIHBsYXllciBpbiB0aGUgcGxheWVycyBhcnJheTtcbiAgICBnb1RvTmV4dFBsYXllcigpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2V0Q2FuUGxheSgpLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuY3VyclBsYXllciwgXCJjdXJyUGxheWVyXCIsIFwicGxheWVyc1wiLCB0aGlzLnBsYXllcnMpXG4gICAgICAgICAgICBsZXQgbmV3SWR4ID0gdGhpcy5jdXJyUGxheWVyICsgMSA+PSB0aGlzLnBsYXllcnMubGVuZ3RoID8gMCA6IHRoaXMuY3VyclBsYXllciArIDE7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIm5ld0lkeFwiLCBuZXdJZHgpXG4gICAgICAgICAgICB3aGlsZSAobmV3SWR4IDwgdGhpcy5wbGF5ZXJzLmxlbmd0aCAmJiAhdGhpcy5wbGF5ZXJzW25ld0lkeF0uY2FuUGxheSkge1xuICAgICAgICAgICAgICAgIG5ld0lkeCsrO1xuICAgICAgICAgICAgICAgIGlmIChuZXdJZHggPT09IHRoaXMucGxheWVycy5sZW5ndGgpIG5ld0lkeCA9IDA7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cobmV3SWR4KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdXJyUGxheWVyID0gbmV3SWR4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jdXJyUGxheWVyID0gLTE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q3VycmVudFBsYXllcigpO1xuICAgIH1cblxuICAgIGRlYWwobnVtKSB7XG4gICAgICAgIHZhciB0aWxlcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgdGlsZSA9IHRoaXMuZGVja1swXS5zcGxpY2UoMCwgMSk7XG4gICAgICAgICAgICB0aGlzLmRlY2suJHNhdmUoMCkudGhlbihmdW5jdGlvbiAocmVmKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2RlYWx0IGEgY2FyZCEnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGlsZXMgPSB0aWxlcy5jb25jYXQodGlsZSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aWxlcylcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGlsZXM7XG4gICAgfVxuXG4gICAgZ2V0Q2FuUGxheSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGxheWVycy5maWx0ZXIoKHBsYXllcikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHBsYXllci5jYW5QbGF5XG4gICAgICAgIH0pXG4gICAgfVxuXG59XG4iLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZ2FtZScsIHtcbiAgICAgICAgdXJsOiAnL2dhbWUvOmdhbWVOYW1lJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvYnJvd3Nlci9qcy9nYW1lL2dhbWUuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdnYW1lQ3RybCdcbiAgICB9KTtcbn0pO1xuXG5cbnRzdXJvLmNvbnRyb2xsZXIoJ2dhbWVDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkZmlyZWJhc2VBdXRoLCBmaXJlYmFzZVVybCwgJHN0YXRlUGFyYW1zLCAkZmlyZWJhc2VPYmplY3QsICRmaXJlYmFzZUFycmF5LCAkc3RhdGUpIHtcblxuICAgIHZhciByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xuICAgIHZhciBvYmogPSAkZmlyZWJhc2VPYmplY3QocmVmKTtcblxuICAgIHZhciBnYW1lUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKCRzdGF0ZVBhcmFtcy5nYW1lTmFtZSk7XG4gICAgdmFyIGdhbWVBcnIgPSBnYW1lUmVmLmNoaWxkKCRzdGF0ZVBhcmFtcy5nYW1lTmFtZSk7XG5cbiAgICB2YXIgaW5pdGlhbERlY2tSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoJHN0YXRlUGFyYW1zLmdhbWVOYW1lKS5jaGlsZCgnaW5pdGlhbERlY2snKTtcbiAgICB2YXIgaW5pdGlhbERlY2tBcnIgPSAkZmlyZWJhc2VBcnJheShpbml0aWFsRGVja1JlZik7XG5cbiAgICB2YXIgZGVja1JlZiA9IGdhbWVSZWYuY2hpbGQoJ2RlY2snKTtcbiAgICB2YXIgZGVja0FyciA9ICRmaXJlYmFzZUFycmF5KGRlY2tSZWYpO1xuXG4gICAgdmFyIHBsYXllcnNSZWYgPSBnYW1lUmVmLmNoaWxkKCdwbGF5ZXJzJyk7XG4gICAgdmFyIGZpcmViYXNlUGxheWVyc0FyciA9ICRmaXJlYmFzZUFycmF5KHBsYXllcnNSZWYpO1xuXG4gICAgdmFyIG1hcmtlcnNSZWYgPSBnYW1lUmVmLmNoaWxkKCdhdmFpbGFibGVNYXJrZXJzJyk7XG4gICAgdmFyIG1hcmtlcnNBcnIgPSAkZmlyZWJhc2VBcnJheShtYXJrZXJzUmVmKTtcblxuICAgIHZhciBtb3Zlc1JlZiA9IGdhbWVSZWYuY2hpbGQoJ21vdmVzJyk7XG4gICAgdmFyIG1vdmVzQXJyID0gJGZpcmViYXNlQXJyYXkobW92ZXNSZWYpO1xuXG4gICAgdmFyIGJvYXJkUmVmID0gZ2FtZVJlZi5jaGlsZCgnYm9hcmQnKTtcbiAgICB2YXIgYm9hcmRBcnIgPSAkZmlyZWJhc2VBcnJheShib2FyZFJlZik7XG5cbiAgICB2YXIgcGxheWVyID0gT2JqZWN0LmNyZWF0ZShQbGF5ZXIucHJvdG90eXBlKTtcblxuICAgIC8qKioqKioqKioqKioqKioqXG4gICAgSU5JVElBTElaSU5HIEdBTUVcbiAgICAqKioqKioqKioqKioqKioqL1xuXG4gICAgLy9uZXcgbG9jYWwgZ2FtZSB3aXRoIGdhbWUgbmFtZSBkZWZpbmVkIGJ5IHVybFxuICAgICRzY29wZS5nYW1lID0gbmV3IEdhbWUoJHN0YXRlUGFyYW1zLmdhbWVOYW1lKTtcblxuICAgIC8vd2hlbiB0aGUgYm9hcmQgaXMgbG9hZGVkLi4uXG4gICAgYm9hcmRBcnIuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBpZiAoIWRhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICBib2FyZEFyci4kYWRkKCRzY29wZS5nYW1lLmJvYXJkKTtcbiAgICAgICAgfVxuICAgICAgICAkc2NvcGUuZ2FtZS5ib2FyZCA9IGJvYXJkQXJyO1xuXG4gICAgICAgIC8vd2F0Y2hpbmcgYm9hcmQgZm9yIGNoYW5nZXNcbiAgICAgICAgYm9hcmRSZWYub24oJ2NoaWxkX2NoYW5nZWQnLCBmdW5jdGlvbihzbmFwKSB7XG4gICAgICAgICAgICAvL05FRUQgVE8gUkVUVVJOIFRPIENIRUNLIEJPQVJEXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzbmFwKTtcbiAgICAgICAgICAgICRzY29wZS5nYW1lLmJvYXJkID0gc25hcC52YWwoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAkc2NvcGUuc3BhY2VzID0gXy5mbGF0dGVuKCRzY29wZS5nYW1lLmJvYXJkKTtcblxuXG4gICAgLy93aGVuIHRoZSBkZWNrIGlzIGxvYWRlZC4uLlxuICAgIGRlY2tBcnIuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAgICRzY29wZS5nYW1lLmRlY2sgPSBkZWNrQXJyOyAvL2FkZCB0aGUgZGVjayB0byB0aGUgbG9jYWwgZ2FtZSA/IFRyeSB0aGlzIGFzIGZpcmViYXNlIERlY2tBcnI/Pz8/XG5cbiAgICAgICAgLy9kb24ndCBzdGFydCB3YXRjaGluZyBwbGF5ZXJzIHVudGlsIHRoZXJlIGlzIGEgZGVjayBpbiB0aGUgZ2FtZVxuICAgICAgICBwbGF5ZXJzUmVmLm9uKFwidmFsdWVcIiwgZnVuY3Rpb24oc25hcCkge1xuICAgICAgICAgICAgdmFyIHNuYXBQbGF5ZXJzID0gc25hcC52YWwoKTsgLy9ncmFiIHRoZSB2YWx1ZSBvZiB0aGUgc25hcHNob3QgKGFsbCBwbGF5ZXJzIGluIGdhbWUgaW4gRmlyZWJhc2UpXG5cbiAgICAgICAgICAgIC8vZm9yIGVhY2ggcGxheWVyIGluIHRoaXMgY29sbGVjdGlvbi4uLlxuICAgICAgICAgICAgZm9yICh2YXIgdGhpc1BsYXllciBpbiBzbmFwUGxheWVycykge1xuICAgICAgICAgICAgICAgIHZhciBleGlzdGluZ1BsYXllckluZGV4LCB0aGlzSXNBTmV3UGxheWVyO1xuXG4gICAgICAgICAgICAgICAgLy9maW5kIHRoaXMgJ3NuYXAnIHBsYXllcidzIGluZGV4IGluIGxvY2FsIGdhbWUuIGZpbmQgcmV0dXJucyB0aGF0IHZhbHVlLlxuICAgICAgICAgICAgICAgIHZhciBsb2NhbFBsYXllciA9ICRzY29wZS5nYW1lLnBsYXllcnMuZmluZChmdW5jdGlvbihwbHlyLCBwbHlySWR4KSB7XG4gICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nUGxheWVySW5kZXggPSBwbHlySWR4O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGx5ci51aWQgPT09IHNuYXBQbGF5ZXJzW3RoaXNQbGF5ZXJdLnVpZDtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vaWYgbm90IGZvdW5kLCBjcmVhdGUgbmV3IHBsYXllclxuICAgICAgICAgICAgICAgIGlmICghbG9jYWxQbGF5ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2kgZGlkbnQgZmluZCBhIGxvY2FsIHBsYXllciEnKTtcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxQbGF5ZXIgPSBuZXcgUGxheWVyKHNuYXBQbGF5ZXJzW3RoaXNQbGF5ZXJdLnVpZCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXNJc0FOZXdQbGF5ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vZm9yIGVhY2gga2V5IGluIHRoZSBzbmFwUGxheWVyJ3Mga2V5cywgYWRkIHRoYXQga2V5IGFuZCB2YWx1ZSB0byBsb2NhbCBwbGF5ZXJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBwbGF5ZXJwcm9wZXJ0eSBpbiBzbmFwUGxheWVyc1t0aGlzUGxheWVyXSkge1xuICAgICAgICAgICAgICAgICAgICBsb2NhbFBsYXllcltwbGF5ZXJwcm9wZXJ0eV0gPSBzbmFwUGxheWVyc1t0aGlzUGxheWVyXVtwbGF5ZXJwcm9wZXJ0eV07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy9wdXNoIGxvY2FsIHBsYXllciB0byBnYW1lLnBsYXllcnNcbiAgICAgICAgICAgICAgICBpZiAodGhpc0lzQU5ld1BsYXllcikgJHNjb3BlLmdhbWUucGxheWVycy5wdXNoKGxvY2FsUGxheWVyKTtcbiAgICAgICAgICAgICAgICBlbHNlICRzY29wZS5nYW1lLnBsYXllcnNbZXhpc3RpbmdQbGF5ZXJJbmRleF0gPSBsb2NhbFBsYXllcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9KTtcblxuXG5cbiAgICAvL3doZW4gdGhhdCBtYXJrZXJzIGFycmF5IGlzIGxvYWRlZCwgdXBkYXRlIHRoZSBhdmFpbGFibGUgbWFya2VycyBhcnJheSBvbiBzY29wZVxuICAgIG1hcmtlcnNBcnIuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAkc2NvcGUuZ2FtZS5hdmFpbGFibGVNYXJrZXJzID0gZGF0YVswXTtcbiAgICB9KTtcblxuICAgIC8vaWYgc29tZW9uZSBlbHNlIHBpY2tzIGEgbWFya2VyLCB1cGRhdGUgeW91ciB2aWV3XG4gICAgbWFya2Vyc1JlZi5vbignY2hpbGRfY2hhbmdlZCcsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgJHNjb3BlLmdhbWUuYXZhaWxhYmxlTWFya2VycyA9IGRhdGEudmFsKCk7XG4gICAgfSk7XG5cbiAgICAvL29uIGxvZ2luLCBmaW5kIG1lIGluIHRoZSBmaXJlYmFzZSBwbGF5ZXJzIGFycmF5XG4gICAgZmlyZWJhc2UuYXV0aCgpLm9uQXV0aFN0YXRlQ2hhbmdlZChmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgIGZpcmViYXNlUGxheWVyc0Fyci4kbG9hZGVkKCkudGhlbihmdW5jdGlvbihwbGF5ZXJzKSB7XG5cbiAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1lSWR4O1xuICAgICAgICAgICAgICAgIHBsYXllcnMuZmluZChmdW5jdGlvbihlLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlLnVpZCA9PT0gdXNlci51aWQpIG1lSWR4ID0gaTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICRzY29wZS5tZSA9IHBsYXllcnNbbWVJZHhdO1xuICAgICAgICAgICAgICAgICRzY29wZS5nYW1lLmN1cnJQbGF5ZXIgPSBtZUlkeDtcblxuXG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZS5tZS5tYXJrZXIgPT09IFwiblwiKSAkc2NvcGUubWUubWFya2VyID0gbnVsbDtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBObyB1c2VyIGlzIHNpZ25lZCBpbi5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIm5vIG9uZSBpcyBsb2dnZWQgaW5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnaW0gaGVyZSEhISEhISEhJylcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cblxuICAgIC8qKioqKioqKioqKioqKioqXG4gICAgQVZBSUxBQkxFIFBMQVlFUiBBQ1RJT05TIEFUIEdBTUUgU1RBUlRcbiAgICAqKioqKioqKioqKioqKioqL1xuXG4gICAgJHNjb3BlLnBpY2tNYXJrZXIgPSBmdW5jdGlvbihtYXJrZXIpIHtcbiAgICAgICAgYm9hcmRBcnIuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgcGlja01hcmtlckZuKGRhdGEsIG1hcmtlcik7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB2YXIgcGlja01hcmtlckZuID0gZnVuY3Rpb24oYm9hcmQsIG1hcmtlcikge1xuXG4gICAgICAgICRzY29wZS5tZS5tYXJrZXIgPSBtYXJrZXI7XG5cbiAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyLiRsb2FkZWQoKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocGxheWVycykge1xuICAgICAgICAgICAgICAgIHZhciBtZUlkeDtcbiAgICAgICAgICAgICAgICAvL2ZpbmQgbXkgaW5kZXggaW4gdGhlIHBsYXllcnMgYXJyYXlcbiAgICAgICAgICAgICAgICBwbGF5ZXJzLmZpbmQoZnVuY3Rpb24oZSwgaSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZS4kaWQgPT09ICRzY29wZS5tZS4kaWQpIG1lSWR4ID0gaTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvL2dpdmUgbWUgYSBtYXJrZXIgYW5kIHNhdmUgbWUgaW4gZmlyZWJhc2VcbiAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLm1hcmtlciA9IG1hcmtlcjtcbiAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJHNhdmUobWVJZHgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGlkeCA9ICRzY29wZS5nYW1lLmF2YWlsYWJsZU1hcmtlcnMuaW5kZXhPZihtYXJrZXIpO1xuXG4gICAgICAgIG1hcmtlcnNBcnJbMF0uc3BsaWNlKGlkeCwgMSk7XG5cbiAgICAgICAgbWFya2Vyc0Fyci4kc2F2ZSgwKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVmKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZW1vdmVkIHRoZSBwaWNrZWQgbWFya2VyXCIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlZi5rZXkpO1xuICAgICAgICAgICAgfSk7XG4gICAgfTtcblxuXG4gICAgLy9UT0RPOiBsaW1pdCBzdGFydCBwb2ludHNcblxuXG4gICAgJHNjb3BlLnBsYWNlTWFya2VyID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICAgICAgYm9hcmRBcnIuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgcGxhY2VNYXJrZXJGbihkYXRhLCBwb2ludCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvL2FkZGluZyBhIGJvYXJkIHRvIGZpcmViYXNlXG4gICAgLy9IYXZlIHBsYXllciBwaWNrIHRoZWlyIHN0YXJ0IHBvaW50XG4gICAgdmFyIHBsYWNlTWFya2VyRm4gPSBmdW5jdGlvbihib2FyZCwgcG9pbnQpIHtcbiAgICAgICAgY29uc29sZS5sb2coYm9hcmQpO1xuXG4gICAgLy8gJHNjb3BlLmNsaWNrZWQgPSBmYWxzZVxuXG4gICAgICAgIC8vIHBsYWNlIG15IG1hcmtlclxuICAgICAgICBwbGF5ZXIucGxhY2VNYXJrZXIoYm9hcmQsIHBvaW50LCAkc2NvcGUubWUpO1xuICAgICAgICAvLyBkZWFsIG1lIHRocmVlIGNhcmRzXG4gICAgICAgICRzY29wZS5tZS50aWxlcyA9ICRzY29wZS5nYW1lLmRlYWwoMyk7XG5cbiAgICAgICAgJHNjb3BlLmNsaWNrZWQgPSB0cnVlO1xuICAgICAgICAvLyB3aGVuIHRoZSBmaXJlYmFzZSBwbGF5ZXJzIGFyZSBsb2FkZWQuLi4uXG4gICAgICAgIGZpcmViYXNlUGxheWVyc0Fyci4kbG9hZGVkKClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHBsYXllcnMpIHtcbiAgICAgICAgICAgICAgICAvL2ZpbmQgbWUgaW4gdGhlIGZpcmViYXNlIHBsYXllcnMgYXJyYXlcbiAgICAgICAgICAgICAgICB2YXIgbWVJZHg7XG4gICAgICAgICAgICAgICAgcGxheWVycy5maW5kKGZ1bmN0aW9uKGUsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUudWlkID09PSAkc2NvcGUubWUudWlkKSBtZUlkeCA9IGk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdID0gJHNjb3BlLm1lOyAvL3NldCBmaXJlYmFzZSBtZSB0byBsb2NhbCBtZVxuXG4gICAgICAgICAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyLiRzYXZlKG1lSWR4KTsgLy9zYXZlIGl0LlxuICAgICAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG5cbiAgICAvKioqKioqKioqKioqKioqKlxuICAgIEdBTUVQTEFZIEFDVElPTlNcbiAgICAqKioqKioqKioqKioqKioqL1xuICAgICRzY29wZS50cnlUaWxlID0gZnVuY3Rpb24odGlsZSl7XG4gICAgICAgIGNvbnNvbGUubG9nKCd0cnlpbmcgdGlsZScpO1xuICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUuZ2FtZS5ib2FyZFswXSk7XG4gICAgICAgICRzY29wZS5nYW1lLmJvYXJkWzBdWyRzY29wZS5tZS5uZXh0U3BhY2UueV1bJHNjb3BlLm1lLm5leHRTcGFjZS54XS5pbWFnZSA9IHRpbGUuaW1hZ2VVcmw7XG4gICAgICAgICRzY29wZS5nYW1lLmJvYXJkWzBdWyRzY29wZS5tZS5uZXh0U3BhY2UueV1bJHNjb3BlLm1lLm5leHRTcGFjZS54XS5yb3RhdGlvbiA9IHRpbGUucm90YXRpb247XG4gICAgfTtcblxuXG5cblxuICAgIC8vIFRPRE86IHdlIHByb2JhYmx5IG5lZWQgdGhpcyBvbiBmaXJlYmFzZSBzbyBvdGhlciBwZW9wbGUgY2FuJ3QgcGljayB3aGF0J3MgYmVlbiBwaWNrZWRcblxuICAgIC8vRm9yIHN5bmNocm9uaXppbmdHYW1lLi4uXG4gICAgLy8gdmFyIHN5bmNSZWYgPSBnYW1lUmVmLmNoaWxkKCdtb3ZlcycpO1xuICAgIC8vIHN5bmNSZWYub24oJ2NoaWxkX2FkZGVkJywgZnVuY3Rpb24gKGNoaWxkU25hcHNob3QsIHByZXZDaGlsZEtleSkge1xuICAgIC8vICAvL05FRUQgVE8gRE9VQkxFIENIRUNLISEgV2hhdCBkb2VzIGNoaWxkU25hcCByZXR1cm5zP1xuICAgIC8vICBjb25zb2xlLmxvZygnY2hpbGRTbmFwc2hvdF9TeW5jR2FtZScsIGNoaWxkU25hcHNob3QpO1xuICAgIC8vICAvL2RlcGVuZGluZyBvbiB3aGF0IGNoaWxkU25hcHNob3QgZ2l2ZXMgbWUuLi5JIHRoaW5rIGl0J3Mgb25lIGNoaWxkIHBlciBvbiBjYWxsPyBJdCBkb2Vzbid0IHJldHVybiBhbiBhcnJheSBvZiBjaGFuZ2VzLi4uSSBiZWxpZXZlIVxuICAgIC8vICBpZiAoY2hpbGRTbmFwc2hvdC50eXBlID09PSAndXBkYXRlRGVjaycpIHtcbiAgICAvLyAgICAgICRzY29wZS5nYW1lLmRlY2sgPSBjaGlsZFNuYXBzaG90LnVwZGF0ZURlY2s7XG4gICAgLy8gIH0gZWxzZSB7XG4gICAgLy8gICAgICAkc2NvcGUucGxhY2VUaWxlKGNoaWxkU25hcHNob3QudGlsZSk7XG4gICAgLy8gIH1cbiAgICAvLyB9KTtcblxuICAgIC8vIFRPRE86IGhvdyB0byByZS1kbyB0aGUgbW92ZXM/XG4gICAgLy8gJHNjb3BlLmdhbWUubW92ZXM7XG5cbiAgICAvLyBUT0RPOiBob3cgZG8gd2Ugc2hvdyB0aGUgdGlsZXMgZm9yIHBsYXllcj9cblxuICAgIC8vIFRPRE86IGhvdyB0byBzaG93IHRoZSByb3RhdGVkIHRpbGU/XG5cbiAgICAvLyBDTVQ6IGFzc3VtaW5nIHdlIHVzZSBuZXcgR2FtZSgpIGZvciBlYWNoIGdhbWVcbiAgICAkc2NvcGUuY3VycmVudFBsYXllciA9ICRzY29wZS5nYW1lLmdldEN1cnJlbnRQbGF5ZXIoKTtcblxuICAgIC8vIFRPRE86IG5lZWQgYSBmdW5jdGlvbiB0byBhc3NpZ24gZHJhZ29uXG4gICAgJHNjb3BlLmRyYWdvbjtcbiAgICB2YXIgYXdhaXRpbmdEcmFnb25Ib2xkZXJzID0gW107XG5cbiAgICAkc2NvcGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgLy9cbiAgICB9O1xuXG4gICAgJHNjb3BlLm15VHVybiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAkc2NvcGUubWUgPT09ICRzY29wZS5jdXJyZW50UGxheWVyO1xuICAgIH07XG5cbiAgICAvL3RoZXNlIGFyZSB0aWVkIHRvIGFuZ3VsYXIgbmctY2xpY2sgYnV0dG9uc1xuXG4gICAgJHNjb3BlLnJvdGF0ZVRpbGVDdyA9IGZ1bmN0aW9uICh0aWxlKSB7XG4gICAgICAgIHRpbGUucm90YXRpb24rKztcbiAgICAgICAgaWYgKHRpbGUucm90YXRpb24gPT09IDQpIHRpbGUucm90YXRpb24gPSAwO1xuICAgICAgICBjb25zb2xlLmxvZyhcInJvdGF0ZSBjd1wiLCB0aWxlKTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnJvdGF0ZVRpbGVDY3cgPSBmdW5jdGlvbih0aWxlKSB7XG4gICAgICAgIHRpbGUucm90YXRpb24tLTtcbiAgICAgICAgaWYgKHRpbGUucm90YXRpb24gPT09IC00KSB0aWxlLnJvdGF0aW9uID0gMDtcbiAgICAgICAgY29uc29sZS5sb2coJ3JvdGF0ZSBjY3cnLCB0aWxlKTtcbiAgICB9O1xuXG4gICAgLy8gQ01UOiB1c2UgcGxheWVyJ3MgYW5kIGdhbWUncyBwcm90b3R5cGUgZnVuY3Rpb24gdG8gcGxhY2UgdGlsZSBhbmQgdGhlbiBtb3ZlIGFsbCBwbGF5ZXJzXG5cbiAgICAkc2NvcGUucGxhY2VUaWxlID0gZnVuY3Rpb24gKHRpbGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLmdhbWUuYm9hcmRbMF0pO1xuICAgICAgICAkc2NvcGUuZ2FtZS5ib2FyZFswXVskc2NvcGUubWUubmV4dFNwYWNlLnldWyRzY29wZS5tZS5uZXh0U3BhY2UueF0uaW1hZ2UgPSB0aWxlLmltYWdlVXJsO1xuICAgICAgICAkc2NvcGUuZ2FtZS5ib2FyZFswXVskc2NvcGUubWUubmV4dFNwYWNlLnldWyRzY29wZS5tZS5uZXh0U3BhY2UueF0ucm90YXRpb24gPSB0aWxlLnJvdGF0aW9uO1xuICAgICAgICAvLyBUT0RPOiBzZW5kIHRoaXMgc3RhdGUgdG8gZmlyZWJhc2UgZXZlcnkgdGltZSBpdCdzIGNhbGxlZFxuICAgICAgICBpZiAodGlsZS5yb3RhdGlvbiA+IDApIHtcbiAgICAgICAgICAgIHRpbGUucGF0aHMgPSB0aWxlLnBhdGhzLm1hcChmdW5jdGlvbihjb25uZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbiA9IGNvbm5lY3Rpb24gKyAyO1xuICAgICAgICAgICAgICAgIGlmIChjb25uZWN0aW9uID09PSA5KSBjb25uZWN0aW9uID0gMTtcbiAgICAgICAgICAgICAgICBpZiAoY29ubmVjdGlvbiA9PT0gOCkgY29ubmVjdGlvbiA9IDA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbm5lY3Rpb247XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRpbGUucGF0aHMudW5zaGlmdCh0aWxlLnBhdGhzLnBvcCgpKTtcbiAgICAgICAgICAgIHRpbGUucGF0aHMudW5zaGlmdCh0aWxlLnBhdGhzLnBvcCgpKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aWxlLnJvdGF0aW9uIDwgMCkge1xuICAgICAgICAgICAgdGlsZS5wYXRocyA9IHRpbGUucGF0aHMubWFwKGZ1bmN0aW9uKGNvbm5lY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uID0gY29ubmVjdGlvbiAtIDI7XG4gICAgICAgICAgICAgICAgaWYgKGNvbm5lY3Rpb24gPT09IC0yKSBjb25uZWN0aW9uID0gNjtcbiAgICAgICAgICAgICAgICBpZiAoY29ubmVjdGlvbiA9PT0gLTEpIGNvbm5lY3Rpb24gPSA3O1xuICAgICAgICAgICAgICAgIHJldHVybiBjb25uZWN0aW9uO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aWxlLnBhdGhzLnB1c2godGlsZS5wYXRocy5zaGlmdCgpKTtcbiAgICAgICAgICAgIHRpbGUucGF0aHMucHVzaCh0aWxlLnBhdGhzLnNoaWZ0KCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGZpcmViYXNlUGxheWVyc0FyciA9ICRmaXJlYmFzZUFycmF5KHBsYXllcnNSZWYpO1xuICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJGxvYWRlZCgpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihwbGF5ZXJzKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1lSWR4O1xuICAgICAgICAgICAgICAgIHBsYXllcnMuZmluZChmdW5jdGlvbihlLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlLiRpZCA9PT0gJHNjb3BlLm1lLiRpZCkgbWVJZHggPSBpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS50aWxlcyA9IGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0udGlsZXMuZmlsdGVyKGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHQuaWQgIT09IHRpbGUuaWRcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0ubmV4dFNwYWNlLnRpbGVVcmwgPSB0aWxlLmltYWdlVXJsO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aWxlLnBhdGhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLm5leHRTcGFjZS5wb2ludHNbaV0ubmVpZ2hib3JzWzBdID09PSBcIm5cIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS5uZXh0U3BhY2UucG9pbnRzW2ldLm5laWdoYm9ycy5zcGxpY2UoMCwgMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS5uZXh0U3BhY2UucG9pbnRzW2ldLm5laWdoYm9ycy5wdXNoKGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0ubmV4dFNwYWNlLnBvaW50c1t0aWxlLnBhdGhzW2ldXSk7XG4gICAgICAgICAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0Fyci4kc2F2ZShtZUlkeCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS5wb2ludCA9IGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0ubmV4dFNwYWNlLnBvaW50c1tmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLm5leHRTcGFjZVBvaW50c0luZGV4XTtcblxuICAgICAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0Fyci4kc2F2ZShtZUlkeCk7XG5cbiAgICAgICAgICAgICAgICB2YXIgcGxheWVyc05leHRTcGFjZVggPSBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLm5leHRTcGFjZS54O1xuICAgICAgICAgICAgICAgIHZhciBwbGF5ZXJzTmV4dFNwYWNlWSA9IGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0ubmV4dFNwYWNlLnk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtwbGF5ZXJzTmV4dFNwYWNlWSwgcGxheWVyc05leHRTcGFjZVhdO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKG5leHRTcGFjZSkge1xuICAgICAgICAgICAgICAgIGJvYXJkQXJyLiRsb2FkZWQoKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBib2FyZEFyci4ka2V5QXQoMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3BhY2VSZWYgPSBib2FyZFJlZi5jaGlsZChrZXkpLmNoaWxkKG5leHRTcGFjZVswXSkuY2hpbGQobmV4dFNwYWNlWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzcGFjZUFyciA9ICRmaXJlYmFzZUFycmF5KHNwYWNlUmVmKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwYWNlQXJyLiRhZGQodGlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ga2V5O1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzcGFjZVJlZiA9IGJvYXJkUmVmLmNoaWxkKGtleSkuY2hpbGQobmV4dFNwYWNlWzBdKS5jaGlsZChuZXh0U3BhY2VbMV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNwYWNlQXJyID0gJGZpcmViYXNlQXJyYXkoc3BhY2VSZWYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3BhY2VBcnIuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coc3BhY2VBcnJbMV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwYWNlQXJyWzFdLmZvckVhY2goZnVuY3Rpb24ocG9pbnQsIGlkeCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcG9pbnRSZWYgPSBib2FyZFJlZi5jaGlsZChrZXkpLmNoaWxkKG5leHRTcGFjZVswXSkuY2hpbGQobmV4dFNwYWNlWzFdKS5jaGlsZCgncG9pbnRzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwb2ludEFyciA9ICRmaXJlYmFzZUFycmF5KHBvaW50UmVmKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRBcnIuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmVpZ2hib3JSZWYgPSBib2FyZFJlZi5jaGlsZChrZXkpLmNoaWxkKG5leHRTcGFjZVswXSkuY2hpbGQobmV4dFNwYWNlWzFdKS5jaGlsZCgncG9pbnRzJykuY2hpbGQoaWR4KS5jaGlsZCgnbmVpZ2hib3JzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmVpZ2hib3JBcnIgPSAkZmlyZWJhc2VBcnJheShuZWlnaGJvclJlZik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZWlnaGJvckFyci4kYWRkKHBvaW50QXJyW3RpbGUucGF0aHNbaWR4XV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgLy8gQ01UOiB0aGlzIHNob3VsZCBzZW5kIHRoZSByb3RhdGVkIHRpbGUgdG8gZmlyZWJhc2VcbiAgICAgICAgLy8gbW92ZXNBcnIuJGFkZCh7XG4gICAgICAgIC8vICAgICAndHlwZSc6ICdwbGFjZVRpbGUnLFxuICAgICAgICAvLyAgICAgJ3RpbGUnOiB0aWxlLFxuICAgICAgICAvLyAgICAgJ3BsYXllclVpZCc6ICRzY29wZS5tZS51aWRcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIGZpcmViYXNlUGxheWVyc0Fyci4kbG9hZGVkKClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHBsYXllcnMpIHtcbiAgICAgICAgICAgICAgICBib2FyZEFyci4kbG9hZGVkKCkudGhlbihmdW5jdGlvbihib2FyZCkge1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJzLmZvckVhY2goZnVuY3Rpb24ocCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1vdmFibGUgPSBwbGF5ZXIubW92ZVRvKHAucG9pbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBJZHggPSBwbGF5ZXJzLmluZGV4T2YocClcblxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKG1vdmFibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwLnBvaW50LnRyYXZlbGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcC5wb2ludCA9IG1vdmFibGU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocC5wb2ludC50cmF2ZWxsZWQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcC5jYW5QbGF5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIHRoZSBzcGFjZSB0aGF0J3Mgbm90IG15IGN1cnJlbnQgbmV4dFNwYWNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld05leHRTcGFjZUluZm87XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocC5wb2ludC5zcGFjZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdOZXh0U3BhY2VJbmZvID0gcC5wb2ludC5zcGFjZXMuZmlsdGVyKGZ1bmN0aW9uKHNwYWNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3BhY2UueCAhPT0gcC5uZXh0U3BhY2UueCB8fCBzcGFjZS55ICE9PSBwLm5leHRTcGFjZS55XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pWzBdXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdOZXh0U3BhY2VJbmZvID0gcC5wb2ludC5zcGFjZXNbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgb2xkU3BhY2UgPSBwLm5leHRTcGFjZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3U3BhY2UgPSBib2FyZFswXVtuZXdOZXh0U3BhY2VJbmZvLnldW25ld05leHRTcGFjZUluZm8ueF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcC5uZXh0U3BhY2UgPSBuZXdTcGFjZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0Fyci4kc2F2ZShwSWR4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBuZWVkIG1vcmUgcGxheWVycyB0byBjaGVjayBpZiBpdCB3b3Jrc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllci5jaGVja0RlYXRoKHApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vdmFibGUgPSBwbGF5ZXIubW92ZVRvKHAucG9pbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJlbmQgbW92aW5nXCIpXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICBpZiAoJHNjb3BlLmdhbWUuY2hlY2tPdmVyKCkpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IG5lZWQgdG8gdGVsbCB0aGUgcGxheWVyIHNoZSB3b25cbiAgICAgICAgICAgICRzY29wZS53aW5uZXIgPSAkc2NvcGUuZ2FtZS5nZXRDYW5QbGF5KClbMF07XG4gICAgICAgICAgICAkc2NvcGUuZ2FtZU92ZXIgPSB0cnVlO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJnYW1lIG92ZXJcIilcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBkaXNhYmxlIGV2ZXJ5dGhpbmcsIGxldCB0aGUgcGxheWVycyBkZWNpZGUgd2V0aGVyIHJlc2V0IHRoZSBnYW1lIG9yIG5vdFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCRzY29wZS5nYW1lLmRlYWRQbGF5ZXJzKCkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgLy93aXRoIG5ldyBjYXJkcyAmIG5lZWQgdG8gcmVzaHVmZmxlXG5cbiAgICAgICAgICAgICAgICAvLyBiZWNhdXNlIHRoZSBkZWFkUGxheWVycygpIHJldHVybnMgYSAyRCBhcnJheSwgdXNlIHJlZHVjZSB0byBmbGF0dGVuIGl0XG4gICAgICAgICAgICAgICAgdmFyIGRlYWRQbGF5ZXJUaWxlcyA9ICRzY29wZS5nYW1lLmRlYWRQbGF5ZXJzKCkucmVkdWNlKGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGEgPSBhLmNvbmNhdChiKVxuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgICAkc2NvcGUuZ2FtZS5kZWNrID0gJHNjb3BlLmdhbWUuZGVjay5jb25jYXQoZGVhZFBsYXllclRpbGVzKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZ2FtZS5kZWNrID0gJHNjb3BlLmdhbWUuZGVjay5zaHVmZmxlKCk7XG5cbiAgICAgICAgICAgICAgICAvL3NlbmQgZmlyZWJhc2UgYSBuZXcgbW92ZVxuICAgICAgICAgICAgICAgIG1vdmVzQXJyLiRhZGQoe1xuICAgICAgICAgICAgICAgICAgICAndHlwZSc6ICd1cGRhdGVEZWNrJyxcbiAgICAgICAgICAgICAgICAgICAgJ3VwZGF0ZURlY2snOiAkc2NvcGUuZ2FtZS5kZWNrXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIElmIGRlY2sgaXMgZW1wdHkgJiBubyBvbmUgaXMgZHJhZ29uLCBzZXQgbWUgYXMgZHJhZ29uXG4gICAgICAgICAgICBpZiAoJHNjb3BlLmdhbWUuZGVjay5sZW5ndGggPT09IDAgJiYgISRzY29wZS5kcmFnb24pIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZHJhZ29uID0gJHNjb3BlLm1lO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwic2V0IGRyYWdvbiB0byBtZVwiKVxuICAgICAgICAgICAgfSBlbHNlIGlmICgkc2NvcGUuZ2FtZS5kZWNrLmxlbmd0aCA9PT0gMCAmJiAkc2NvcGUuZHJhZ29uKSB7XG4gICAgICAgICAgICAgICAgYXdhaXRpbmdEcmFnb25Ib2xkZXJzLnB1c2goJHNjb3BlLm1lKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkknbSB3YWl0aW5nIGZvciB0byBiZSBhIGRyYWdvblwiKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImdpdmUgbWUgYSB0aWxlXCIpXG4gICAgICAgICAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyLiRsb2FkZWQoKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihwbGF5ZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2ZpbmQgbWUgaW4gdGhlIGZpcmViYXNlIHBsYXllcnMgYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtZUlkeDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllcnMuZmluZChmdW5jdGlvbihlLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUudWlkID09PSAkc2NvcGUubWUudWlkKSBtZUlkeCA9IGk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy9zZXQgZmlyZWJhc2UgbWUgdG8gbG9jYWwgbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0udGlsZXMgPSAkc2NvcGUubWUudGlsZXMuY29uY2F0KCRzY29wZS5nYW1lLmRlYWwoMSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJkZWFsZWQgb25lIHRpbGUgdG8gbWUhXCIpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3NhdmUgaXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0Fyci4kc2F2ZShtZUlkeCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5tZSA9IGZpcmViYXNlUGxheWVyc0FyclttZUlkeF07XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgd2hpbGUgKCRzY29wZS5kcmFnb24gJiYgJHNjb3BlLmdhbWUuZGVjay5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRyYWdvbi50aWxlcy5wdXNoKCRzY29wZS5nYW1lLmRlYWwoMSkpO1xuICAgICAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJGxvYWRlZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihwbGF5ZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9maW5kIG1lIGluIHRoZSBmaXJlYmFzZSBwbGF5ZXJzIGFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1lSWR4O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllcnMuZmluZChmdW5jdGlvbihlLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlLnVpZCA9PT0gJHNjb3BlLmRyYWdvbi51aWQpIG1lSWR4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vc2V0IGZpcmViYXNlIG1lIHRvIGxvY2FsIG1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XSA9ICRzY29wZS5kcmFnb247XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3NhdmUgaXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJHNhdmUobWVJZHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRyYWdvbiA9ICRzY29wZS5hd2FpdGluZ0RyYWdvbkhvbGRlcnMuc2hpZnQoKSB8fCBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVE9ETzogc3RpbGwgbmVlZCB0byB3b3JrIG9uIHRoaXNcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50UGxheWVyID0gJHNjb3BlLmdhbWUuZ29Ub05leHRQbGF5ZXIoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibmV3IGN1cnIgcGxheWVyXCIsICRzY29wZS5jdXJyZW50UGxheWVyKVxuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgJHNjb3BlLmxlYXZlR2FtZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImknbSBvdXRcIik7XG5cbiAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyLiRsb2FkZWQoKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocGxheWVycykge1xuICAgICAgICAgICAgICAgIC8vZmluZCBtZSBpbiB0aGUgZmlyZWJhc2UgcGxheWVycyBhcnJheVxuICAgICAgICAgICAgICAgIHZhciBtZUlkeDtcblxuICAgICAgICAgICAgICAgIHBsYXllcnMuZmluZChmdW5jdGlvbihlLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlLnVpZCA9PT0gJHNjb3BlLm1lLnVpZCkgbWVJZHggPSBpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlIHRoZSBwbGF5ZXIgZnJvbSBmaXJlYmFzZVxuICAgICAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0Fyci4kcmVtb3ZlKGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgJHN0YXRlLmdvKCdwaWNrR2FtZScpO1xuICAgIH07XG5cbiAgICAvLyBUT0RPOiBuZWVkIHRvIHJlbW92ZSB0aGlzIGdhbWUgcm9vbSdzIG1vdmVzIGZyb20gZmlyZWJhc2U/XG4gICAgJHNjb3BlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIG1hcmtlcnNBcnIuJHJlbW92ZSgwKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVmKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZW1vdmVkIGFsbCBtYXJrZXJzXCIsIHJlZi5rZXkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgZGVja0Fyci4kcmVtb3ZlKDApXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZWYpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInJlbW92ZWQgdGhlIGRlY2tcIiwgcmVmLmtleSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBpbml0aWFsRGVja0Fyci4kcmVtb3ZlKDApXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZWYpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInJlb212ZWQgdGhlIGluaXRpYWxEZWNrXCIsIHJlZi5rZXkpXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgIG1vdmVzQXJyLiRsb2FkZWQoKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24obW92ZXMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vdmVzQXJyLiRyZW1vdmUoaSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlZCBhbGwgbW92ZXNcIilcbiAgICAgICAgICAgIH0pXG5cblxuICAgICAgICB2YXIgdGlsZXMgPSBbe1xuICAgICAgICAgICAgaWQ6IDEsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMywgNCwgNiwgMCwgMSwgNywgMiwgNV0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMixcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFsxLCAwLCA0LCA3LCAyLCA2LCA1LCAzXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAzLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzEsIDAsIDQsIDYsIDIsIDcsIDMsIDVdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDQsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMiwgNSwgMCwgNywgNiwgMSwgNCwgM10sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogNSxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFs0LCAyLCAxLCA2LCAwLCA3LCAzLCA1XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiA2LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzEsIDAsIDUsIDcsIDYsIDIsIDQsIDNdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDcsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMiwgNCwgMCwgNiwgMSwgNywgMywgNV0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogOCxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFsyLCA1LCAwLCA2LCA3LCAxLCAzLCA0XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiA5LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzEsIDAsIDcsIDYsIDUsIDQsIDMsIDJdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDEwLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzQsIDUsIDYsIDcsIDAsIDEsIDIsIDNdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDExLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzcsIDIsIDEsIDQsIDMsIDYsIDUsIDBdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDEyLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzIsIDcsIDAsIDUsIDYsIDMsIDQsIDFdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDEzLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzUsIDQsIDcsIDYsIDEsIDAsIDMsIDJdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDE0LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzMsIDIsIDEsIDAsIDcsIDYsIDUsIDRdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDE1LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzEsIDAsIDcsIDQsIDMsIDYsIDUsIDJdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDE2LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzEsIDAsIDUsIDYsIDcsIDIsIDMsIDRdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDE3LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzMsIDUsIDYsIDAsIDcsIDEsIDIsIDRdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDE4LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzIsIDcsIDAsIDQsIDMsIDYsIDUsIDFdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDE5LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzQsIDMsIDYsIDEsIDAsIDcsIDIsIDVdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDIwLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzIsIDYsIDAsIDQsIDMsIDcsIDEsIDVdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDIxLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzIsIDMsIDAsIDEsIDcsIDYsIDUsIDRdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDIyLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzIsIDYsIDAsIDUsIDcsIDMsIDEsIDRdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDIzLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzEsIDAsIDYsIDQsIDMsIDcsIDIsIDVdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDI0LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzMsIDQsIDcsIDAsIDEsIDYsIDUsIDJdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDI1LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzEsIDAsIDMsIDIsIDcsIDYsIDUsIDRdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDI2LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzEsIDAsIDYsIDcsIDUsIDQsIDIsIDNdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDI3LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzIsIDQsIDAsIDcsIDEsIDYsIDUsIDNdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDI4LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzQsIDIsIDEsIDcsIDAsIDYsIDUsIDNdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDI5LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzEsIDAsIDMsIDIsIDUsIDQsIDcsIDZdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDMwLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzIsIDMsIDAsIDEsIDYsIDcsIDQsIDVdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDMxLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzMsIDYsIDUsIDAsIDcsIDIsIDEsIDRdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDMyLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzEsIDAsIDYsIDUsIDcsIDMsIDIsIDRdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDMzLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzEsIDAsIDMsIDIsIDYsIDcsIDQsIDVdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDM0LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzQsIDUsIDcsIDYsIDAsIDEsIDMsIDJdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDM1LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzEsIDAsIDcsIDUsIDYsIDMsIDQsIDJdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfV07XG5cbiAgICAgICAgdmFyIGRlY2sgPSBuZXcgRGVjayh0aWxlcykuc2h1ZmZsZSgpLnRpbGVzO1xuICAgICAgICBpbml0aWFsRGVja0Fyci4kYWRkKGRlY2spO1xuICAgICAgICBkZWNrQXJyLiRhZGQoZGVjayk7XG5cblxuXG5cblxuICAgICAgICB2YXIgaW5pdGlhbE1hcmtlcnNSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoJHN0YXRlUGFyYW1zLmdhbWVOYW1lKS5jaGlsZCgnYXZhaWxhYmxlTWFya2VycycpO1xuICAgICAgICAkZmlyZWJhc2VBcnJheShpbml0aWFsTWFya2Vyc1JlZikuJGFkZChbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJ5ZWxsb3dcIiwgXCJncmVlblwiLCBcImFxdWFcIiwgXCJibHVlXCIsIFwibmF2eVwiLCBcInB1cnBsZVwiXSk7XG5cblxuICAgICAgICB2YXIgcGxheWVycyA9ICRmaXJlYmFzZUFycmF5KHBsYXllcnNSZWYpO1xuICAgICAgICBwbGF5ZXJzLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGRhdGFbaV0uY2FuUGxheSA9IHRydWU7XG4gICAgICAgICAgICAgICAgZGF0YVtpXS5tYXJrZXIgPSAnbic7XG4gICAgICAgICAgICAgICAgZGF0YVtpXS5uZXh0U3BhY2UgPSAnbic7XG4gICAgICAgICAgICAgICAgZGF0YVtpXS5uZXh0U3BhY2VQb2ludHNJbmRleCA9ICduJztcbiAgICAgICAgICAgICAgICBkYXRhW2ldLnBvaW50ID0gJ24nO1xuICAgICAgICAgICAgICAgIGRhdGFbaV0udGlsZXMgPSAnbic7XG4gICAgICAgICAgICAgICAgcGxheWVycy4kc2F2ZShpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHN0YXRlLnJlbG9hZCgpXG4gICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5tZSk7XG5cbiAgICB9O1xuXG4gICAgJHNjb3BlLnN0YXJ0dG9wID0gW1xuICAgICAgICBbMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAxXSxcbiAgICAgICAgWzEsIDAsIDBdLFxuICAgICAgICBbMSwgMCwgMV0sXG4gICAgICAgIFsyLCAwLCAwXSxcbiAgICAgICAgWzIsIDAsIDFdLFxuICAgICAgICBbMywgMCwgMF0sXG4gICAgICAgIFszLCAwLCAxXSxcbiAgICAgICAgWzQsIDAsIDBdLFxuICAgICAgICBbNCwgMCwgMV0sXG4gICAgICAgIFs1LCAwLCAwXSxcbiAgICAgICAgWzUsIDAsIDFdXG4gICAgXTtcbiAgICAkc2NvcGUuc3RhcnRsZWZ0ID0gW1xuICAgICAgICBbMCwgMCwgN10sXG4gICAgICAgIFswLCAwLCA2XSxcbiAgICAgICAgWzAsIDEsIDddLFxuICAgICAgICBbMCwgMSwgNl0sXG4gICAgICAgIFswLCAyLCA3XSxcbiAgICAgICAgWzAsIDIsIDZdLFxuICAgICAgICBbMCwgMywgN10sXG4gICAgICAgIFswLCAzLCA2XSxcbiAgICAgICAgWzAsIDQsIDddLFxuICAgICAgICBbMCwgNCwgNl0sXG4gICAgICAgIFswLCA1LCA3XSxcbiAgICAgICAgWzAsIDUsIDZdXG4gICAgXTtcbiAgICAkc2NvcGUuc3RhcnRib3R0b20gPSBbXG4gICAgICAgIFswLCA1LCA1XSxcbiAgICAgICAgWzAsIDUsIDRdLFxuICAgICAgICBbMSwgNSwgNV0sXG4gICAgICAgIFsxLCA1LCA0XSxcbiAgICAgICAgWzIsIDUsIDVdLFxuICAgICAgICBbMiwgNSwgNF0sXG4gICAgICAgIFszLCA1LCA1XSxcbiAgICAgICAgWzMsIDUsIDRdLFxuICAgICAgICBbNCwgNSwgNV0sXG4gICAgICAgIFs0LCA1LCA0XSxcbiAgICAgICAgWzUsIDUsIDVdLFxuICAgICAgICBbNSwgNSwgNF1cbiAgICBdO1xuICAgICRzY29wZS5zdGFydHJpZ2h0ID0gW1xuICAgICAgICBbNSwgMCwgMl0sXG4gICAgICAgIFs1LCAwLCAzXSxcbiAgICAgICAgWzUsIDEsIDJdLFxuICAgICAgICBbNSwgMSwgM10sXG4gICAgICAgIFs1LCAyLCAyXSxcbiAgICAgICAgWzUsIDIsIDNdLFxuICAgICAgICBbNSwgMywgMl0sXG4gICAgICAgIFs1LCAzLCAzXSxcbiAgICAgICAgWzUsIDQsIDJdLFxuICAgICAgICBbNSwgNCwgM10sXG4gICAgICAgIFs1LCA1LCAyXSxcbiAgICAgICAgWzUsIDUsIDNdXG4gICAgXTtcblxufSk7XG5cbnRzdXJvLmRpcmVjdGl2ZSgndGlsZScsIGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdicm93c2VyL2pzL2dhbWUvdGlsZS5kaXJlY3RpdmUuaHRtbCcsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICB0aGlzVGlsZTogJz0nLFxuICAgICAgICAgICAgJ3RyeVRpbGUnOiAnJnRyeVRpbGUnLFxuICAgICAgICAgICAgJ3JvdGF0ZWNjdyc6ICcmcm90YXRlY2N3JyxcbiAgICAgICAgICAgICdyb3RhdGVjdyc6ICcmcm90YXRlY3cnLFxuICAgICAgICAgICAgJ3BsYWNlJzogJyZwbGFjZSdcbiAgICAgICAgfSxcbiAgICAgICAgbGluazogZnVuY3Rpb24ocyxlLGEpe1xuICAgICAgICAgICAgLy8gZS5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCl7XG4gICAgICAgICAgICAvLyAgICAgcy50cnlUaWxlKHMudGhpc1RpbGUpO1xuICAgICAgICAgICAgLy8gICAgIC8vIGNvbnNvbGUubG9nKCdjbGlja2VkIG1lIScsIHMudGhpc1RpbGUpO1xuICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5cbiIsInRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZ2FtZWxpc3QnLCB7XG4gICAgICAgIHVybDogJy9nYW1lbGlzdCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2Jyb3dzZXIvanMvZ2FtZWxpc3QvZ2FtZWxpc3QuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdnYW1lTGlzdCcsXG4gICAgfSk7XG59KTtcblxudHN1cm8uY29udHJvbGxlcignZ2FtZUxpc3QnLCBmdW5jdGlvbiAoJHNjb3BlLCBmaXJlYmFzZVVybCwgJGZpcmViYXNlT2JqZWN0LCAkc3RhdGUsICRmaXJlYmFzZUF1dGgsICRmaXJlYmFzZUFycmF5KSB7XG4gICAgLy9Gb3Igc3luY2hyb25pemluZ0dhbWVMaXN0Li4uXG4gICAgdmFyIHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XG4gICAgdmFyIG9iaiA9ICRmaXJlYmFzZU9iamVjdChyZWYpO1xuXG4gICAgdmFyIGF1dGggPSAkZmlyZWJhc2VBdXRoKCk7XG4gICAgdmFyIGZpcmViYXNlVXNlciA9IGF1dGguJGdldEF1dGgoKTtcblxuICAgIHZhciBzeW5jaFJlZiA9IHJlZi5jaGlsZChcImdhbWVzXCIpO1xuICAgIHZhciBzeW5jaHJvbml6ZWRPYmogPSAkZmlyZWJhc2VPYmplY3Qoc3luY2hSZWYpO1xuXG4gICAgLy8gVGhpcyByZXR1cm5zIGEgcHJvbWlzZS4uLnlvdSBjYW4udGhlbigpIGFuZCBhc3NpZ24gdmFsdWUgdG8gJHNjb3BlLnZhcmlhYmxlXG4gICAgLy8gZ2FtZWxpc3QgaXMgd2hhdGV2ZXIgd2UgYXJlIGNhbGxpbmcgaXQgaW4gdGhlIGFuZ3VsYXIgaHRtbC5cbiAgICBzeW5jaHJvbml6ZWRPYmouJGJpbmRUbygkc2NvcGUsIFwiZ2FtZWxpc3RcIilcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGdhbWVsaXN0ID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluICRzY29wZS5nYW1lbGlzdCkge1xuICAgICAgICAgICAgICAgIGdhbWVsaXN0LnB1c2goW2ksICRzY29wZS5nYW1lbGlzdFtpXV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJHNjb3BlLmdhbWVOYW1lcyA9IGdhbWVsaXN0LnNsaWNlKDIpO1xuICAgICAgICB9KTtcblxuXG5cblxuICAgICRzY29wZS5qb2luID0gZnVuY3Rpb24gKGdhbWVOYW1lKSB7XG4gICAgICAgIHZhciBnYW1lTmFtZVJlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZChnYW1lTmFtZSk7XG4gICAgICAgIHZhciBwbGF5ZXJzUmVmID0gZ2FtZU5hbWVSZWYuY2hpbGQoJ3BsYXllcnMnKTtcblxuICAgICAgICBmaXJlYmFzZS5hdXRoKCkub25BdXRoU3RhdGVDaGFuZ2VkKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICB2YXIgZmlyZWJhc2VQbGF5ZXJzQXJyID0gJGZpcmViYXNlQXJyYXkocGxheWVyc1JlZik7XG5cbiAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0Fyci4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgRkJwbGF5ZXJzID0gZGF0YTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFGQnBsYXllcnMuZmlsdGVyKGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBsYXllci51aWQgPT09IHVzZXIudWlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld1BsYXllciA9IG5ldyBQbGF5ZXIodXNlci51aWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGZpcmViYXNlQXJyYXkocGxheWVyc1JlZikuJGFkZChuZXdQbGF5ZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBObyB1c2VyIGlzIHNpZ25lZCBpbi5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibm90aGluZ1wiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2dhbWUnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcImdhbWVOYW1lXCI6IGdhbWVOYW1lXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufSk7XG4iLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9icm93c2VyL2pzL2xvZ2luL2xvZ2luLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnbG9naW5DdHJsJ1xuICAgIH0pO1xufSk7XG5cbnRzdXJvLmNvbnRyb2xsZXIoJ2xvZ2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSwgJGZpcmViYXNlQXV0aCwgJHJvb3RTY29wZSkge1xuICAgIHZhciBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuXG4gICAgJHNjb3BlLmxvZ0luV2l0aEdvb2dsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYXV0aC4kc2lnbkluV2l0aFBvcHVwKFwiZ29vZ2xlXCIpLnRoZW4oZnVuY3Rpb24gKGF1dGhEYXRhKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkxvZ2dlZCBpbiBhczpcIiwgYXV0aERhdGEpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS5jdXJyZW50VXNlciA9IGF1dGhEYXRhO1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdwaWNrR2FtZScpO1xuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJBdXRoZW50aWNhdGlvbiBmYWlsZWQ6XCIsIGVycm9yKTtcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG59KTtcbiIsInRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgncGlja0dhbWUnLCB7XG4gICAgICAgIHVybDogJy9waWNrZ2FtZScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2Jyb3dzZXIvanMvcGlja0dhbWUvcGlja0dhbWUuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdwaWNrR2FtZUN0cmwnXG4gICAgfSk7XG59KTtcblxudHN1cm8uY29udHJvbGxlcigncGlja0dhbWVDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlLCAkZmlyZWJhc2VBcnJheSwgJGZpcmViYXNlT2JqZWN0KSB7XG4gICAgdmFyIHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XG4gICAgdmFyIG9iaiA9ICRmaXJlYmFzZU9iamVjdChyZWYpO1xuXG5cbiAgICAkc2NvcGUuY3JlYXRlR2FtZSA9IGZ1bmN0aW9uIChnYW1lTmFtZSkge1xuICAgICAgICB2YXIgZ2FtZU5hbWVSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoZ2FtZU5hbWUpO1xuICAgICAgICB2YXIgcGxheWVyc1JlZiA9IGdhbWVOYW1lUmVmLmNoaWxkKCdwbGF5ZXJzJyk7XG4gICAgICAgIHZhciBpbml0aWFsTWFya2Vyc1JlZiA9IGdhbWVOYW1lUmVmLmNoaWxkKCdhdmFpbGFibGVNYXJrZXJzJyk7XG4gICAgICAgIHZhciBpbml0aWFsTWFya2Vyc0FyciA9ICRmaXJlYmFzZUFycmF5KGluaXRpYWxNYXJrZXJzUmVmKTtcbiAgICAgICAgdmFyIGRlY2tSZWYgPSBnYW1lTmFtZVJlZi5jaGlsZCgnZGVjaycpO1xuICAgICAgICB2YXIgZGVja0FyciA9ICRmaXJlYmFzZUFycmF5KGRlY2tSZWYpO1xuXG4gICAgICAgICRmaXJlYmFzZUFycmF5KGdhbWVOYW1lUmVmKS4kYWRkKHtcbiAgICAgICAgICAgIFwiZ2FtZU5hbWVcIjogZ2FtZU5hbWVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZmlyZWJhc2UuYXV0aCgpLm9uQXV0aFN0YXRlQ2hhbmdlZChmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV3UGxheWVyID0gbmV3IFBsYXllcih1c2VyLnVpZClcbiAgICAgICAgICAgICAgICAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKS4kYWRkKG5ld1BsYXllcilcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJubyBvbmUgbG9nZ2VkIGluXCIpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgdmFyIHRpbGVzID0gW3tcbiAgICAgICAgICAgIGlkOiAxLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMDEucG5nP2FsdD1tZWRpYSZ0b2tlbj1kYzJlNTUzYi1mNGRhLTQ0MmUtOTdlOC1kMGQ4MDhjMmQ1YzBcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMywgNCwgNiwgMCwgMSwgNywgMiwgNV0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMixcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzAyLnBuZz9hbHQ9bWVkaWEmdG9rZW49YmJiMGI1OTYtNzRlYS00OWE4LTlmNmMtYjQyNjI3Y2NkODczXCIsXG4gICAgICAgICAgICBwYXRoczogWzEsIDAsIDQsIDcsIDIsIDYsIDUsIDNdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDMsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8wMy5wbmc/YWx0PW1lZGlhJnRva2VuPTRkZDFmZjg1LTAyMDQtNDg5NS04OTU3LTNiNzA3MzU1OTExN1wiLFxuICAgICAgICAgICAgcGF0aHM6IFsxLCAwLCA0LCA2LCAyLCA3LCAzLCA1XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiA0LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMDQucG5nP2FsdD1tZWRpYSZ0b2tlbj05MGRkMmRlOC05Yzk5LTRjYjctODZmZi03ODYzYjBhNTY0MWNcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMiwgNSwgMCwgNywgNiwgMSwgNCwgM10sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogNSxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzA1LnBuZz9hbHQ9bWVkaWEmdG9rZW49NTkxMmE0N2ItODU0YS00NmQwLWJmZWItMDA1OTEzZDI0MTU4XCIsXG4gICAgICAgICAgICBwYXRoczogWzQsIDIsIDEsIDYsIDAsIDcsIDMsIDVdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDYsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8wNi5wbmc/YWx0PW1lZGlhJnRva2VuPTA1NmI4OTM4LTZlMWYtNDgxZS05ZDM0LWI2YjI3ZjJjZDllM1wiLFxuICAgICAgICAgICAgcGF0aHM6IFsxLCAwLCA1LCA3LCA2LCAyLCA0LCAzXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiA3LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMDcucG5nP2FsdD1tZWRpYSZ0b2tlbj1iNWRkYmFmNi1mMDYxLTQyMDYtOWY5Yi05MmJjODYzYmI0ODRcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMiwgNCwgMCwgNiwgMSwgNywgMywgNV0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogOCxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzA4LnBuZz9hbHQ9bWVkaWEmdG9rZW49OGFkNjM0MGUtZjhhNS00ZmYyLWJkYWYtMGE4NWUyYmJjNjMwXCIsXG4gICAgICAgICAgICBwYXRoczogWzIsIDUsIDAsIDYsIDcsIDEsIDMsIDRdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDksXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8wOS5wbmc/YWx0PW1lZGlhJnRva2VuPTZhMWE2MmI4LTE4NzItNDYwZC05Mjc2LTViNDhmM2EzOGEzOVwiLFxuICAgICAgICAgICAgcGF0aHM6IFsxLCAwLCA3LCA2LCA1LCA0LCAzLCAyXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAxMCxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzEwLnBuZz9hbHQ9bWVkaWEmdG9rZW49NjNlOGEyMTQtM2FlZi00ZGE2LTg4MjctMTMzZGI5YjliNGVmXCIsXG4gICAgICAgICAgICBwYXRoczogWzQsIDUsIDYsIDcsIDAsIDEsIDIsIDNdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDExLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMTEucG5nP2FsdD1tZWRpYSZ0b2tlbj01Nzg2OTY4Mi01YzRkLTRmODAtODMyYi1lYmM0NjA4MGE0YzVcIixcbiAgICAgICAgICAgIHBhdGhzOiBbNywgMiwgMSwgNCwgMywgNiwgNSwgMF0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMTIsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8xMi5wbmc/YWx0PW1lZGlhJnRva2VuPWU1MDVmMjJiLTlkNTItNDlkMS05YjcxLTRkY2RjZTU2ODUzZlwiLFxuICAgICAgICAgICAgcGF0aHM6IFsyLCA3LCAwLCA1LCA2LCAzLCA0LCAxXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAxMyxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzEzLnBuZz9hbHQ9bWVkaWEmdG9rZW49ZjBhYzRlYjktN2I4MS00ZGZiLWIwY2ItYWVjYzAyOTBhZTNiXCIsXG4gICAgICAgICAgICBwYXRoczogWzUsIDQsIDcsIDYsIDEsIDAsIDMsIDJdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDE0LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMTQucG5nP2FsdD1tZWRpYSZ0b2tlbj03ZmYyNGU3Ny02NzM3LTQxMmItYmFjZC00MTRiZjRmNjQzYzlcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMywgMiwgMSwgMCwgNywgNiwgNSwgNF0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMTUsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8xNS5wbmc/YWx0PW1lZGlhJnRva2VuPWExYWQ3YzBjLThlNmQtNDQ3NC05ZmRlLTBiNDdkMDQxMDRjMVwiLFxuICAgICAgICAgICAgcGF0aHM6IFsxLCAwLCA3LCA0LCAzLCA2LCA1LCAyXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAxNixcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzE2LnBuZz9hbHQ9bWVkaWEmdG9rZW49ZTMzYjNjZDktOTIwNy00Y2I4LTk2OWItNWNlNjBmOTE1MzdmXCIsXG4gICAgICAgICAgICBwYXRoczogWzEsIDAsIDUsIDYsIDcsIDIsIDMsIDRdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDE3LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMTcucG5nP2FsdD1tZWRpYSZ0b2tlbj0yMDBkNmNhYi1kZjMxLTQ5YjgtYmE5NS1hZDUyZDdjNzllOGJcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMywgNSwgNiwgMCwgNywgMSwgMiwgNF0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMTgsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8xOC5wbmc/YWx0PW1lZGlhJnRva2VuPTFjN2JmNTE1LTk5NDEtNDdjZC05ZWNiLTQ3OWQ2NmYyNjEyYlwiLFxuICAgICAgICAgICAgcGF0aHM6IFsyLCA3LCAwLCA0LCAzLCA2LCA1LCAxXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAxOSxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzE5LnBuZz9hbHQ9bWVkaWEmdG9rZW49ZjVjYzYyNWMtNzNjMC00OWY3LTkzMmMtMGU2NWQzMWQyYmY3XCIsXG4gICAgICAgICAgICBwYXRoczogWzQsIDMsIDYsIDEsIDAsIDcsIDIsIDVdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDIwLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMjAucG5nP2FsdD1tZWRpYSZ0b2tlbj01YjliNDQ1NS0yYzA5LTQxZTQtYTJmMi1mNjBiZWRjNDcwYWRcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMiwgNiwgMCwgNCwgMywgNywgMSwgNV0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMjEsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8yMS5wbmc/YWx0PW1lZGlhJnRva2VuPTZkNTY0NmQ3LWIxYjEtNDljOS1iZjg3LTAwYmU5ZTdiOGUyY1wiLFxuICAgICAgICAgICAgcGF0aHM6IFsyLCAzLCAwLCAxLCA3LCA2LCA1LCA0XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAyMixcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzIyLnBuZz9hbHQ9bWVkaWEmdG9rZW49NWE1ODczNTktODMxYy00ZGNkLWE5YzUtZTcwODVjNWEzMDc5XCIsXG4gICAgICAgICAgICBwYXRoczogWzIsIDYsIDAsIDUsIDcsIDMsIDEsIDRdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDIzLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMjMucG5nP2FsdD1tZWRpYSZ0b2tlbj00Y2I5NzUwYi0wZjUwLTQyOWQtOTM2Ny0xNzBiMDg1NWM2YzRcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMSwgMCwgNiwgNCwgMywgNywgMiwgNV0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMjQsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8yNC5wbmc/YWx0PW1lZGlhJnRva2VuPWE4MGI3ZjViLWM1NzItNDQzMC1hYjhhLTNkMzY1NmU0YzY0M1wiLFxuICAgICAgICAgICAgcGF0aHM6IFszLCA0LCA3LCAwLCAxLCA2LCA1LCAyXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAyNSxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzI1LnBuZz9hbHQ9bWVkaWEmdG9rZW49OWI4ZTg1M2QtOTYyYi00ZDMyLWI2NzktNjIyZThhZTdiZTZhXCIsXG4gICAgICAgICAgICBwYXRoczogWzEsIDAsIDMsIDIsIDcsIDYsIDUsIDRdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDI2LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMjYucG5nP2FsdD1tZWRpYSZ0b2tlbj1kODRjYjdkMy00YmQ1LTRhMTctOGI3YS02ZGY4NTc5NzVjNDVcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMSwgMCwgNiwgNywgNSwgNCwgMiwgM10sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMjcsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8yNy5wbmc/YWx0PW1lZGlhJnRva2VuPWQwZWFmNjMxLThhMGUtNGFhOS04ZGQyLTc3OGU5YmUxZmVjNlwiLFxuICAgICAgICAgICAgcGF0aHM6IFsyLCA0LCAwLCA3LCAxLCA2LCA1LCAzXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAyOCxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzI4LnBuZz9hbHQ9bWVkaWEmdG9rZW49ZWU0MmNjMTEtMTlkMi00NDc2LTg4N2ItN2EyOTgxNzQzMGZjXCIsXG4gICAgICAgICAgICBwYXRoczogWzQsIDIsIDEsIDcsIDAsIDYsIDUsIDNdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDI5LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMjkucG5nP2FsdD1tZWRpYSZ0b2tlbj1hNjA3NjZhNS01ZTBjLTQ5YWQtOTI0MC0yMGIxZDUzOWZhMmZcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMSwgMCwgMywgMiwgNSwgNCwgNywgNl0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMzAsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8zMC5wbmc/YWx0PW1lZGlhJnRva2VuPWRlYTI2ODA4LWQ0OWQtNDNiMC1iODFjLTE3NGMxZTA5OGMxZVwiLFxuICAgICAgICAgICAgcGF0aHM6IFsyLCAzLCAwLCAxLCA2LCA3LCA0LCA1XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAzMSxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzMxLnBuZz9hbHQ9bWVkaWEmdG9rZW49NGNiOWVkZDctOTVhYi00ZTJmLWFlZGEtZDI1MWY3MDE1YTBkXCIsXG4gICAgICAgICAgICBwYXRoczogWzMsIDYsIDUsIDAsIDcsIDIsIDEsIDRdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDMyLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMzIucG5nP2FsdD1tZWRpYSZ0b2tlbj00ZjE5Nzg4Zi1hZDg1LTRlNmYtODJhYy03ZmVmNGM4ZjA0MTlcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMSwgMCwgNiwgNSwgNywgMywgMiwgNF0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMzMsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8zMy5wbmc/YWx0PW1lZGlhJnRva2VuPTA5MTQwMjhkLWVhMjUtNDYxMy04MmY2LWVhYjU3NGU2OWY3MFwiLFxuICAgICAgICAgICAgcGF0aHM6IFsxLCAwLCAzLCAyLCA2LCA3LCA0LCA1XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAzNCxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzM0LnBuZz9hbHQ9bWVkaWEmdG9rZW49MzcxNGU4N2EtOTQyZS00MzZlLWFlNWItYmMwYTIzZGUzM2QxXCIsXG4gICAgICAgICAgICBwYXRoczogWzQsIDUsIDcsIDYsIDAsIDEsIDMsIDJdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDM1LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMzUucG5nP2FsdD1tZWRpYSZ0b2tlbj1hYTlkZGE5Ny1lZGVlLTQ3MmEtOGIyNC04YmIwYjY5ZGZhOWFcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMSwgMCwgNywgNSwgNiwgMywgNCwgMl0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9XTtcblxuICAgICAgICB2YXIgZGVjayA9IG5ldyBEZWNrKHRpbGVzKS5zaHVmZmxlKCkudGlsZXM7XG4gICAgICAgIHZhciBkZWNrUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKGdhbWVOYW1lKS5jaGlsZCgnZGVjaycpO1xuXG4gICAgICAgICRmaXJlYmFzZUFycmF5KGRlY2tSZWYpLiRhZGQoZGVjayk7XG5cbiAgICAgICAgdmFyIGluaXRpYWxNYXJrZXJzUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKGdhbWVOYW1lKS5jaGlsZCgnYXZhaWxhYmxlTWFya2VycycpO1xuICAgICAgICAkZmlyZWJhc2VBcnJheShpbml0aWFsTWFya2Vyc1JlZikuJGFkZChbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJ5ZWxsb3dcIiwgXCJncmVlblwiLCBcImFxdWFcIiwgXCJibHVlXCIsIFwibmF2eVwiLCBcInB1cnBsZVwiXSk7XG5cbiAgICAgICAgZGVja0Fyci4kYWRkKGRlY2spO1xuXG4gICAgICAgIGluaXRpYWxNYXJrZXJzQXJyLiRhZGQoW1wicmVkXCIsIFwib3JhbmdlXCIsIFwieWVsbG93XCIsIFwiZ3JlZW5cIiwgXCJhcXVhXCIsIFwiYmx1ZVwiLCBcIm5hdnlcIiwgXCJwdXJwbGVcIl0pO1xuXG4gICAgICAgICRzdGF0ZS5nbygnZ2FtZScsIHtcbiAgICAgICAgICAgIFwiZ2FtZU5hbWVcIjogZ2FtZU5hbWVcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgICRzY29wZS5nb1RvR2FtZUxpc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzdGF0ZS5nbygnZ2FtZWxpc3QnKTtcbiAgICB9O1xufSk7XG4iLCIndXNlIHN0cmljdCdcblxuZnVuY3Rpb24gUGxheWVyKHVpZCkge1xuICAgIC8vIFRPRE86IGdldCB1aWQgZnJvbSBmaXJlYmFzZSBhdXRoXG4gICAgdGhpcy51aWQgPSB1aWQ7XG5cbiAgICB0aGlzLm1hcmtlciA9IFwiblwiO1xuXG4gICAgLy8gc2hvdWxkIGJlIGEgUG9pbnQgb2JqZWN0XG4gICAgdGhpcy5wb2ludCA9IFwiblwiO1xuXG4gICAgLy8gW3gsIHldXG4gICAgLy8gZGVwZW5kcyBvbiB0aGUgYW5ndWxhciBTcGFjZS54LCBTcGFjZS55XG4gICAgdGhpcy5uZXh0U3BhY2UgPSBcIm5cIjtcblxuICAgIC8vIGluIGVhY2ggU3BhY2UucG9pbnRzIGFycmF5LCBmaW5kIHRoaXMgc3BlY2lmaWMgcG9pbnQgYW5kIGdldCB0aGUgcG9zaXRpb24gKGludGVnZXIpIGluc2lkZSB0aGlzIHNwYWNlLlxuICAgIHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPSBcIm5cIjtcblxuICAgIC8vIG1heGltdW4gMyB0aWxlc1xuICAgIHRoaXMudGlsZXMgPSAnbic7XG5cbiAgICAvLyBpZiBhIHBsYXllciBkaWVzLCBpdCB3aWxsIGJlIGNoYW5nZWQgdG8gZmFsc2VcbiAgICB0aGlzLmNhblBsYXkgPSB0cnVlO1xufVxuUGxheWVyLnByb3RvdHlwZS5oaSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJISVwiKVxuICAgIH1cbiAgICAvLyBuZWVkIHRvIHVzZSBzZWxmIGJlY3VzZSB3ZSBuZWVkIHRvIGNoYW5nZSAkc2NvcGUubWUgb24gZ2FtZUN0cmwgYW5kIHNlbmQgdG8gZmlyZWJhc2VcblBsYXllci5wcm90b3R5cGUucGxhY2VNYXJrZXIgPSBmdW5jdGlvbiAoYm9hcmQsIHBvaW50LCBzZWxmKSB7XG4gICAgLy8gcG9pbnQgbG9va3MgbGlrZSBbeCwgeSwgcG9pbnRzSW5kZXhdIGluIHRoZSBzcGFjZVxuICAgIHZhciB4ID0gcG9pbnRbMF07XG4gICAgdmFyIHkgPSBwb2ludFsxXTtcbiAgICB2YXIgcG9pbnRzSW5kZXggPSBwb2ludFsyXTtcbiAgICBzZWxmLnBvaW50ID0gYm9hcmRbMF1beV1beF0ucG9pbnRzW3BvaW50c0luZGV4XTtcbiAgICBzZWxmLnBvaW50LnRyYXZlbGxlZCA9IHRydWU7XG5cbiAgICAvL1t4LCB5XSBmcm9tIHRoZSBwb2ludFxuICAgIHNlbGYubmV4dFNwYWNlID0gYm9hcmRbMF1beV1beF07XG5cbiAgICAvLyBpbiBlYWNoIFNwYWNlLnBvaW50cyBhcnJheSwgZmluZCB0aGlzIHNwZWNpZmljIHBvaW50IGFuZCBnZXQgdGhlIHBvc2l0aW9uIChpbnRlZ2VyKSBpbnNpZGUgdGhpcyBzcGFjZS5cbiAgICBzZWxmLm5leHRTcGFjZVBvaW50c0luZGV4ID0gc2VsZi5uZXh0U3BhY2UucG9pbnRzLmluZGV4T2Yoc2VsZi5wb2ludCk7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLm5ld1NwYWNlID0gZnVuY3Rpb24gKGJvYXJkLCBvbGRTcGFjZSwgc2VsZikge1xuICAgIGlmIChzZWxmLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSAwIHx8IHNlbGYubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIGJvYXJkW29sZFNwYWNlLnkgLSAxXVtvbGRTcGFjZS54XTtcbiAgICB9IGVsc2UgaWYgKHNlbGYubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDIgfHwgc2VsZi5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gMykge1xuICAgICAgICByZXR1cm4gYm9hcmRbb2xkU3BhY2UueV1bb2xkU3BhY2UueCArIDFdO1xuICAgIH0gZWxzZSBpZiAoc2VsZi5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gNCB8fCBzZWxmLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSA1KSB7XG4gICAgICAgIHJldHVybiBib2FyZFtvbGRTcGFjZS55ICsgMV1bb2xkU3BhY2UueF07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGJvYXJkW29sZFNwYWNlLnldW29sZFNwYWNlLnggLSAxXTtcbiAgICB9XG59O1xuXG5cblBsYXllci5wcm90b3R5cGUubW92ZVRvID0gZnVuY3Rpb24gKHBvaW50ZXIpIHtcbiAgICAvL2Fsd2F5cyBiZSByZXR1cm5pbmcgMCBvciAxIHBvaW50IGluIHRoZSBhcnJheVxuICAgIGxldCBuZXh0UG9pbnQgPSBwb2ludGVyLm5laWdoYm9ycy5maWx0ZXIoZnVuY3Rpb24gKG5laWdoYm9yKSB7XG4gICAgICAgIHJldHVybiAhbmVpZ2hib3IudHJhdmVsbGVkICYmIG5laWdoYm9yICE9PSBcIm5cIjtcbiAgICB9KVswXTtcbiAgICByZXR1cm4gbmV4dFBvaW50O1xufTtcblxuXG5QbGF5ZXIucHJvdG90eXBlLmNoZWNrRGVhdGggPSBmdW5jdGlvbiAoc2VsZikge1xuICAgIHZhciBhbGxUcmF2ZWxsZWQgPSBzZWxmLnBvaW50Lm5laWdoYm9ycy5maWx0ZXIoZnVuY3Rpb24gKG5laWdoYm9yKSB7XG4gICAgICAgIHJldHVybiBuZWlnaGJvci50cmF2ZWxsZWQ7XG4gICAgfSk7XG5cbiAgICBpZiAoc2VsZi5wb2ludC5lZGdlIHx8IGFsbFRyYXZlbGxlZC5sZW5ndGggPT09IDIpIHNlbGYuY2FuUGxheSA9IGZhbHNlO1xufTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
