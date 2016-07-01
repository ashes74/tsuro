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

tsuro.controller('gameCtrl', function ($scope, $firebaseAuth, firebaseUrl, $stateParams, $firebaseObject, $firebaseArray) {
    var ref = firebase.database().ref();
    var obj = $firebaseObject(ref);

    var gameRef = ref.child('games').child($stateParams.gameName);
    var gameArr = gameRef.child($stateParams.gameName);

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

    boardArr.$add($scope.game.board);

    //when the board is loaded...
    boardArr.$loaded().then(function (data) {
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

    var board = $scope.game.board;
    /****************
    AVAILABLE PLAYER ACTIONS AT GAME START
    ****************/
    $scope.pickMarker = function (board, marker) {

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

    //adding a board to firebase

    //Have player pick their start point
    $scope.placeMarker = function (board, point) {
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
    // 	//NEED TO DOUBLE CHECK!! What does childSnap returns?
    // 	console.log('childSnapshot_SyncGame', childSnapshot);
    // 	//depending on what childSnapshot gives me...I think it's one child per on call? It doesn't return an array of changes...I believe!
    // 	if (childSnapshot.type === 'updateDeck') {
    // 		$scope.game.deck = childSnapshot.updateDeck;
    // 	} else {
    // 		$scope.placeTile(childSnapshot.tile);
    // 	}
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

        console.log(tile);

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
            boardArr.$loaded().then(function (data) {
                data[nextSpace[0]][nextSpace[1]].tile.$add(tile);

                var points = data[nextSpace[0]][nextSpace[1]].points;
                points.forEach(function (point, idx) {
                    point.neighbors.$add(points[tile.paths[idx]]);
                    //save it back to firebase
                });
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
                    var newSpace = $scope.game.board[newNextSpaceInfo.y][newNextSpaceInfo.x];
                    p.nextSpace = newSpace;

                    firebasePlayersArr.$save(pIdx);
                    // TODO: need more players to check if it works
                    player.checkDeath(p);
                    movable = player.moveTo(p.point);
                }

                console.log("end moving");
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
    };

    // TODO: need to remove this game room's moves from firebase?
    $scope.reset = function () {
        markersArr.$remove(0).then(function (ref) {
            console.log("removed all markers", ref.key);
        });

        deckArr.$remove(0).then(function (ref) {
            console.log("removed the deck", ref.key);
        });

        movesArr.$remove();
        obj.$loaded().then(function (data) {
            var tiles = data.tiles;
            var deck = new Deck(tiles).shuffle().tiles;
            var initialDeckRef = ref.child('games').child($stateParams.gameName).child('initialDeck');
            $firebaseArray(initialDeckRef).$add(deck);
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

        console.log($scope.me);
    };

    $scope.starttop = [[0, 0, 0], [0, 0, 1], [1, 0, 0], [1, 0, 1], [2, 0, 0], [2, 0, 1], [3, 0, 0], [3, 0, 1], [4, 0, 0], [4, 0, 1], [5, 0, 0], [5, 0, 1]];
    $scope.startleft = [[0, 0, 7], [0, 0, 6], [0, 1, 7], [0, 1, 6], [0, 2, 7], [0, 2, 6], [0, 3, 7], [0, 3, 6], [0, 4, 7], [0, 4, 6], [0, 5, 7], [0, 5, 6]];
    $scope.startbottom = [[0, 5, 0], [0, 5, 1], [1, 5, 0], [1, 5, 1], [2, 5, 0], [2, 5, 1], [3, 5, 0], [3, 5, 1], [4, 5, 0], [4, 5, 1], [5, 5, 0], [5, 5, 1]];
    $scope.startright = [[5, 0, 2], [5, 0, 3], [5, 1, 2], [5, 1, 3], [5, 2, 2], [5, 2, 3], [5, 3, 2], [5, 3, 3], [5, 4, 2], [5, 4, 3], [5, 5, 2], [5, 5, 3]];
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

        // var boardRef = gameNameRef.child('board');
        // var boardArr = $firebaseArray(boardRef);
        // boardArr.$add($scope.game.board);

        var initialMarkersRef = ref.child('games').child(gameName).child('availableMarkers');
        $firebaseArray(initialMarkersRef).$add(["red", "orange", "yellow", "green", "aqua", "blue", "navy", "purple"]);

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

    self.point = board[y][x].points[pointsIndex];
    self.point.travelled = true;

    //[x, y] from the point
    self.nextSpace = board[y][x];

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImdhbWUvYm9hcmQuanMiLCJnYW1lL2RlY2suanMiLCJnYW1lL2dhbWUuY29udHJ1Y3Rvci5qcyIsImdhbWUvZ2FtZS5qcyIsImxvZ2luL2xvZ2luLmpzIiwiZ2FtZWxpc3QvZ2FtZWxpc3QuanMiLCJwaWNrR2FtZS9waWNrR2FtZS5qcyIsInBsYXllci9wbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBQSxRQUFBLFFBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTs7QUFFQSxNQUFBLE1BQUEsQ0FBQSxZQUFBO0FBQ0EsUUFBQSxTQUFBO0FBQ0EsZ0JBQUEseUNBREE7QUFFQSxvQkFBQSxzQ0FGQTtBQUdBLHFCQUFBLDZDQUhBO0FBSUEsdUJBQUE7QUFKQSxLQUFBO0FBTUEsYUFBQSxhQUFBLENBQUEsTUFBQTtBQUNBLENBUkE7O0FBVUEsTUFBQSxRQUFBLENBQUEsYUFBQSxFQUFBLDRDQUFBOztBQUVBLE1BQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQTtBQUNBLHVCQUFBLFNBQUEsQ0FBQSxHQUFBO0FBQ0EsQ0FGQTs7QUNkQSxTQUFBLEtBQUEsR0FBQTtBQUNBLFNBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQTs7QUFFQSxNQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBO0FBQ0E7QUFDQSxXQUFBLEtBQUEsS0FBQTtBQUNBLENBUkE7O0FBVUEsU0FBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEVBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLFNBQUEsSUFBQSxHQUFBLEdBQUE7QUFDQSxTQUFBLE1BQUEsR0FBQSxDQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBQUE7O0FBRUEsU0FBQSxJQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsc0JBQUE7O0FBRUEsWUFBQSxJQUFBLENBQUEsRUFBQTs7QUFDQSw0QkFBQSxNQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxDO0FBQ0EsZ0JBQUEsTUFBQSxDQUFBLEVBQUEsS0FBQSxNQUFBLENBQUEsQ0FBQSxJQUFBLElBQUEsS0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0FBQ0EsbUJBQUEsQ0FEQTtBQUVBLG1CQUFBLENBRkE7QUFHQSxtQkFBQTtBQUhBLGFBQUEsQ0FBQSxDQUFBLENBQUEsS0FLQTtBQUNBLHFCQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsTUFBQSxJQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBO0FBQ0EsU0FWQSxNQVVBLElBQUEsSUFBQSxDQUFBLEVBQUE7O0FBQ0EsNEJBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUE7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7QUFDQSxtQkFBQSxDQURBO0FBRUEsbUJBQUEsQ0FGQTtBQUdBLG1CQUFBO0FBSEEsYUFBQSxDQUFBLENBQUEsQ0FBQSxLQUtBO0FBQ0EscUJBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtBQUNBLHVCQUFBLENBREE7QUFFQSx1QkFBQSxDQUZBO0FBR0EsdUJBQUE7QUFIQSxpQkFBQSxFQUlBO0FBQ0EsdUJBQUEsSUFBQSxDQURBO0FBRUEsdUJBQUEsQ0FGQTtBQUdBLHVCQUFBO0FBSEEsaUJBSkEsQ0FBQSxDQUFBO0FBU0E7QUFDQSxTQWxCQSxNQWtCQSxJQUFBLElBQUEsQ0FBQSxFQUFBOztBQUNBLDRCQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsZ0JBQUEsTUFBQSxDQUFBLEVBQUEsS0FBQSxNQUFBLENBQUEsQ0FBQSxJQUFBLElBQUEsS0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0FBQ0EsbUJBQUEsQ0FEQTtBQUVBLG1CQUFBLENBRkE7QUFHQSxtQkFBQTtBQUhBLGFBQUEsQ0FBQSxDQUFBLENBQUEsS0FLQTtBQUNBLHFCQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7QUFDQSx1QkFBQSxDQURBO0FBRUEsdUJBQUEsQ0FGQTtBQUdBLHVCQUFBO0FBSEEsaUJBQUEsRUFJQTtBQUNBLHVCQUFBLENBREE7QUFFQSx1QkFBQSxJQUFBLENBRkE7QUFHQSx1QkFBQTtBQUhBLGlCQUpBLENBQUEsQ0FBQTtBQVNBO0FBQ0EsU0FsQkEsTUFrQkE7O0FBQ0EsNEJBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsQztBQUNBLGdCQUFBLE1BQUEsQ0FBQSxFQUFBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtBQUNBLG1CQUFBLENBREE7QUFFQSxtQkFBQSxDQUZBO0FBR0EsbUJBQUE7QUFIQSxhQUFBLENBQUEsQ0FBQSxDQUFBLEtBS0E7QUFDQSxxQkFBQSxNQUFBLENBQUEsQ0FBQSxJQUFBLE1BQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxFQUFBLE1BQUEsQ0FBQSxhQUFBLENBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBSUEsU0FBQSxLQUFBLENBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQTtBQUNBLFNBQUEsSUFBQSxHQUFBLElBQUE7QUFDQSxTQUFBLFNBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLFNBQUEsU0FBQSxHQUFBLEtBQUE7QUFDQSxTQUFBLE1BQUEsR0FBQSxLQUFBO0FBQ0E7O0FDMUZBOztJQUVBLEk7QUFDQSxrQkFBQSxLQUFBLEVBQUE7QUFBQTs7QUFDQSxhQUFBLEtBQUEsR0FBQSxLQUFBO0FBQ0E7Ozs7a0NBRUE7QUFDQSxpQkFBQSxLQUFBLEdBQUEsRUFBQSxPQUFBLENBQUEsS0FBQSxLQUFBLENBQUE7QUFDQSxtQkFBQSxJQUFBO0FBQ0E7OztvQ0FFQTtBQUNBLG1CQUFBLEtBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0E7Ozs2QkFFQSxHLEVBQUE7QUFDQSxtQkFBQSxLQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLEdBQUEsQ0FBQTtBQUNBOzs7K0JBRUEsSyxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBO0FBQ0EsbUJBQUEsSUFBQTtBQUNBOzs7Ozs7QUN2QkE7Ozs7SUFJQSxJO0FBQ0Esa0JBQUEsSUFBQSxFQUFBO0FBQUE7O0FBQ0EsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQUNBLGFBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLEtBQUEsR0FBQSxJQUFBLEtBQUEsR0FBQSxTQUFBLEVBQUE7QUFDQSxhQUFBLE9BQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxnQkFBQSxHQUFBLENBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxRQUFBLEVBQUEsT0FBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLFFBQUEsQ0FBQTs7O0FBR0EsYUFBQSxVQUFBOztBQUVBLGFBQUEsTUFBQSxHQUFBLElBQUE7QUFDQSxhQUFBLEtBQUE7QUFDQTs7OzsyQ0FFQTtBQUNBLGdCQUFBLEtBQUEsVUFBQSxLQUFBLENBQUEsQ0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxPQUFBLENBQUEsS0FBQSxVQUFBLENBQUE7QUFDQTs7O3lDQUVBO0FBQ0EsaUJBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLE1BQUE7QUFBQSx1QkFBQSxPQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUE7QUFBQSxhQUFBO0FBQ0E7OztzQ0FFQTtBQUNBLGdCQUFBLG1CQUFBLEVBQUE7QUFDQSxpQkFBQSxPQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0Esb0JBQUEsQ0FBQSxPQUFBLE9BQUEsSUFBQSxPQUFBLEtBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EscUNBQUEsSUFBQSxDQUFBLE9BQUEsS0FBQTtBQUNBLG1DQUFBLElBQUE7QUFDQTtBQUNBLGFBTEE7QUFNQSxtQkFBQSxnQkFBQTtBQUNBOzs7b0NBRUE7QUFDQSxtQkFBQSxLQUFBLFVBQUEsR0FBQSxNQUFBLElBQUEsQ0FBQTtBQUNBOzs7Ozs7eUNBR0E7QUFDQSxnQkFBQSxLQUFBLFVBQUEsR0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0Esd0JBQUEsR0FBQSxDQUFBLEtBQUEsVUFBQSxFQUFBLFlBQUEsRUFBQSxTQUFBLEVBQUEsS0FBQSxPQUFBO0FBQ0Esb0JBQUEsU0FBQSxLQUFBLFVBQUEsR0FBQSxDQUFBLElBQUEsS0FBQSxPQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsR0FBQSxLQUFBLFVBQUEsR0FBQSxDQUFBO0FBQ0Esd0JBQUEsR0FBQSxDQUFBLFFBQUEsRUFBQSxNQUFBO0FBQ0EsdUJBQUEsU0FBQSxLQUFBLE9BQUEsQ0FBQSxNQUFBLElBQUEsQ0FBQSxLQUFBLE9BQUEsQ0FBQSxNQUFBLEVBQUEsT0FBQSxFQUFBO0FBQ0E7QUFDQSx3QkFBQSxXQUFBLEtBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxTQUFBLENBQUE7QUFDQSw0QkFBQSxHQUFBLENBQUEsTUFBQTtBQUNBO0FBQ0EscUJBQUEsVUFBQSxHQUFBLE1BQUE7QUFDQSxhQVZBLE1BVUE7QUFDQSxxQkFBQSxVQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQSxtQkFBQSxLQUFBLGdCQUFBLEVBQUE7QUFDQTs7OzZCQUVBLEcsRUFBQTtBQUNBLGdCQUFBLFFBQUEsRUFBQTtBQUNBLGlCQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0Esb0JBQUEsT0FBQSxLQUFBLElBQUEsQ0FBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxxQkFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSw0QkFBQSxHQUFBLENBQUEsZUFBQTtBQUNBLGlCQUZBO0FBR0Esd0JBQUEsTUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0Esd0JBQUEsR0FBQSxDQUFBLEtBQUE7QUFDQTtBQUNBLG1CQUFBLEtBQUE7QUFDQTs7O3FDQUVBO0FBQ0EsbUJBQUEsS0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0EsdUJBQUEsT0FBQSxPQUFBO0FBQ0EsYUFGQSxDQUFBO0FBR0E7Ozs7OztBQzlFQSxNQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxhQUFBLGlCQURBO0FBRUEscUJBQUEsNEJBRkE7QUFHQSxvQkFBQTtBQUhBLEtBQUE7QUFLQSxDQU5BOztBQVFBLE1BQUEsVUFBQSxDQUFBLFVBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxhQUFBLEVBQUEsV0FBQSxFQUFBLFlBQUEsRUFBQSxlQUFBLEVBQUEsY0FBQSxFQUFBO0FBQ0EsUUFBQSxNQUFBLFNBQUEsUUFBQSxHQUFBLEdBQUEsRUFBQTtBQUNBLFFBQUEsTUFBQSxnQkFBQSxHQUFBLENBQUE7O0FBRUEsUUFBQSxVQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxLQUFBLENBQUEsYUFBQSxRQUFBLENBQUE7QUFDQSxRQUFBLFVBQUEsUUFBQSxLQUFBLENBQUEsYUFBQSxRQUFBLENBQUE7O0FBRUEsUUFBQSxVQUFBLFFBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQTtBQUNBLFFBQUEsVUFBQSxlQUFBLE9BQUEsQ0FBQTs7QUFFQSxRQUFBLGFBQUEsUUFBQSxLQUFBLENBQUEsU0FBQSxDQUFBO0FBQ0EsUUFBQSxxQkFBQSxlQUFBLFVBQUEsQ0FBQTs7QUFFQSxRQUFBLGFBQUEsUUFBQSxLQUFBLENBQUEsa0JBQUEsQ0FBQTtBQUNBLFFBQUEsYUFBQSxlQUFBLFVBQUEsQ0FBQTs7QUFFQSxRQUFBLFdBQUEsUUFBQSxLQUFBLENBQUEsT0FBQSxDQUFBO0FBQ0EsUUFBQSxXQUFBLGVBQUEsUUFBQSxDQUFBOztBQUVBLFFBQUEsV0FBQSxRQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUE7QUFDQSxRQUFBLFdBQUEsZUFBQSxRQUFBLENBQUE7O0FBRUEsUUFBQSxTQUFBLE9BQUEsTUFBQSxDQUFBLE9BQUEsU0FBQSxDQUFBOzs7Ozs7O0FBT0EsV0FBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsYUFBQSxRQUFBLENBQUE7O0FBR0EsYUFBQSxJQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsS0FBQTs7O0FBR0EsYUFBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZUFBQSxJQUFBLENBQUEsS0FBQSxHQUFBLFFBQUE7OztBQUdBLGlCQUFBLEVBQUEsQ0FBQSxlQUFBLEVBQUEsVUFBQSxJQUFBLEVBQUE7O0FBRUEsb0JBQUEsR0FBQSxDQUFBLElBQUE7QUFDQSxtQkFBQSxJQUFBLENBQUEsS0FBQSxHQUFBLEtBQUEsR0FBQSxFQUFBO0FBQ0EsU0FKQTtBQUtBLEtBVEE7O0FBV0EsV0FBQSxNQUFBLEdBQUEsRUFBQSxPQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBOzs7QUFJQSxZQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7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QUFBLEVBQUE7QUFDQSxnQkFBQSxHQUFBLENBQUEsaUJBQUE7QUFDQSxhQUFBLFFBQUE7QUFDQSxZQUFBLEtBQUEsUUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLFFBQUEsR0FBQSxDQUFBO0FBQ0EsS0FKQTs7QUFNQSxXQUFBLGFBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsUUFBQTtBQUNBLFlBQUEsS0FBQSxRQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxRQUFBLEdBQUEsQ0FBQTtBQUNBLEtBSEE7OztBQU1BLFdBQUEsU0FBQSxHQUFBLFVBQUEsSUFBQSxFQUFBOztBQUVBLFlBQUEsS0FBQSxRQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxHQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQTtBQUNBLDZCQUFBLGFBQUEsQ0FBQTtBQUNBLG9CQUFBLGVBQUEsQ0FBQSxFQUFBLGFBQUEsQ0FBQTtBQUNBLG9CQUFBLGVBQUEsQ0FBQSxFQUFBLGFBQUEsQ0FBQTtBQUNBLHVCQUFBLFVBQUE7QUFDQSxhQUxBLENBQUE7QUFNQSxpQkFBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGlCQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsU0FUQSxNQVNBLElBQUEsS0FBQSxRQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxHQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQTtBQUNBLDZCQUFBLGFBQUEsQ0FBQTtBQUNBLG9CQUFBLGVBQUEsQ0FBQSxDQUFBLEVBQUEsYUFBQSxDQUFBO0FBQ0Esb0JBQUEsZUFBQSxDQUFBLENBQUEsRUFBQSxhQUFBLENBQUE7QUFDQSx1QkFBQSxVQUFBO0FBQ0EsYUFMQSxDQUFBO0FBTUEsaUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxpQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLEtBQUEsRUFBQTtBQUNBOztBQUVBLGdCQUFBLEdBQUEsQ0FBQSxJQUFBOztBQUVBLFlBQUEscUJBQUEsZUFBQSxVQUFBLENBQUE7QUFDQSwyQkFBQSxPQUFBLEdBQ0EsSUFEQSxDQUNBLFVBQUEsT0FBQSxFQUFBO0FBQ0EsZ0JBQUEsS0FBQTtBQUNBLG9CQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxDQUFBLEVBQUE7QUFDQSxvQkFBQSxFQUFBLEdBQUEsS0FBQSxPQUFBLEVBQUEsQ0FBQSxHQUFBLEVBQUEsUUFBQSxDQUFBO0FBQ0EsYUFGQTs7QUFJQSwrQkFBQSxLQUFBLEVBQUEsS0FBQSxHQUFBLG1CQUFBLEtBQUEsRUFBQSxLQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBO0FBQ0EsdUJBQUEsRUFBQSxFQUFBLEtBQUEsS0FBQSxFQUFBO0FBQ0EsYUFGQSxDQUFBOztBQUlBLCtCQUFBLEtBQUEsRUFBQSxTQUFBLENBQUEsT0FBQSxHQUFBLEtBQUEsUUFBQTs7QUFFQSxpQkFBQSxJQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsS0FBQSxLQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQTtBQUNBLG9CQUFBLG1CQUFBLEtBQUEsRUFBQSxTQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQSxNQUFBLEdBQUEsRUFBQTtBQUNBLHVDQUFBLEtBQUEsRUFBQSxTQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBO0FBQ0E7QUFDQSxtQ0FBQSxLQUFBLEVBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxtQkFBQSxLQUFBLEVBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLG1DQUFBLEtBQUEsQ0FBQSxLQUFB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dUJBQUEsSUFBQSxDQUFBLElBQUEsR0FBQSxPQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLGVBQUEsQ0FBQTtBQUNBLHVCQUFBLElBQUEsQ0FBQSxJQUFBLEdBQUEsT0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsRUFBQTs7O0FBR0EseUJBQUEsSUFBQSxDQUFBO0FBQ0EsNEJBQUEsWUFEQTtBQUVBLGtDQUFBLE9BQUEsSUFBQSxDQUFBO0FBRkEsaUJBQUE7QUFJQTs7O0FBR0EsZ0JBQUEsT0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLE1BQUEsRUFBQTtBQUNBLHVCQUFBLE1BQUEsR0FBQSxPQUFBLEVBQUE7QUFDQSx3QkFBQSxHQUFBLENBQUEsa0JBQUE7QUFDQSxhQUhBLE1BR0EsSUFBQSxPQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxLQUFBLENBQUEsSUFBQSxPQUFBLE1BQUEsRUFBQTtBQUNBLHNDQUFBLElBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSx3QkFBQSxHQUFBLENBQUEsZ0NBQUE7QUFDQSxhQUhBLE1BR0E7QUFDQSx3QkFBQSxHQUFBLENBQUEsZ0JBQUE7QUFDQSxtQ0FBQSxPQUFBLEdBQ0EsSUFEQSxDQUNBLFVBQUEsT0FBQSxFQUFBOztBQUVBLHdCQUFBLEtBQUE7QUFDQSw0QkFBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBO0FBQ0EsNEJBQUEsRUFBQSxHQUFBLEtBQUEsT0FBQSxFQUFBLENBQUEsR0FBQSxFQUFBLFFBQUEsQ0FBQTtBQUNBLHFCQUZBOzs7QUFLQSx1Q0FBQSxLQUFBLEVBQUEsS0FBQSxHQUFBLE9BQUEsRUFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsNEJBQUEsR0FBQSxDQUFBLHdCQUFBOzs7QUFHQSx1Q0FBQSxLQUFBLENBQUEsS0FBQTs7QUFFQSwyQkFBQSxFQUFBLEdBQUEs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RUFBQSxNQUFBLEdBQUEsR0FBQTtBQUNBLHFCQUFBLENBQUEsRUFBQSxTQUFBLEdBQUEsR0FBQTtBQUNBLHFCQUFBLENBQUEsRUFBQSxvQkFBQSxHQUFBLEdBQUE7QUFDQSxxQkFBQSxDQUFBLEVBQUEsS0FBQSxHQUFBLEdBQUE7QUFDQSxxQkFBQSxDQUFBLEVBQUEsS0FBQSxHQUFBLEdBQUE7QUFDQSx3QkFBQSxLQUFBLENBQUEsQ0FBQTtBQUNBO0FBQ0EsU0FWQTs7QUFZQSxnQkFBQSxHQUFBLENBQUEsT0FBQSxFQUFBO0FBRUEsS0F4Q0E7O0FBMkNBLFdBQUEsUUFBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBLEVBSUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FKQSxFQUtBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQU5BLEVBT0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FQQSxFQVFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUkEsRUFTQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVRBLEVBVUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FWQSxFQVdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWEEsRUFZQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVpBLENBQUE7QUFjQSxXQUFBLFNBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBLEVBR0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQSxFQUlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSkEsRUFLQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUxBLEVBTUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FOQSxFQU9BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUEEsRUFRQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVJBLEVBU0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FUQSxFQVVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVkEsRUFXQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVhBLEVBWUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FaQSxDQUFBO0FBY0EsV0FBQSxXQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQURBLEVBRUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQSxFQUdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEEsRUFJQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUpBLEVBS0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FMQSxFQU1BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTkEsRUFPQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVBBLEVBUUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FSQSxFQVNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVEEsRUFVQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVZBLEVBV0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FYQSxFQVlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWkEsQ0FBQTtBQWNBLFdBQUEsVUFBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBLEVBSUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FKQSxFQUtBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQU5BLEVBT0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FQQSxFQVFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUkEsRUFTQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVRBLEVBVUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FWQSxFQVdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWEEsRUFZQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVpBLENBQUE7QUFjQSxDQXRpQkE7O0FDUkEsTUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsYUFBQSxRQURBO0FBRUEscUJBQUEsOEJBRkE7QUFHQSxvQkFBQTtBQUhBLEtBQUE7QUFLQSxDQU5BOztBQVFBLE1BQUEsVUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsYUFBQSxFQUFBLFVBQUEsRUFBQTtBQUNBLFFBQUEsT0FBQSxlQUFBOztBQUVBLFdBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxhQUFBLGdCQUFBLENBQUEsUUFBQSxFQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLG9CQUFBLEdBQUEsQ0FBQSxlQUFBLEVBQUEsUUFBQTtBQUNBLHVCQUFBLFdBQUEsR0FBQSxRQUFBO0FBQ0EsbUJBQUEsRUFBQSxDQUFBLFVBQUE7QUFDQSxTQUpBLEVBSUEsS0FKQSxDQUlBLFVBQUEsS0FBQSxFQUFBO0FBQ0Esb0JBQUEsS0FBQSxDQUFBLHdCQUFBLEVBQUEsS0FBQTtBQUNBLFNBTkE7QUFRQSxLQVRBO0FBV0EsQ0FkQTs7QUNSQSxNQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxhQUFBLFdBREE7QUFFQSxxQkFBQSxvQ0FGQTtBQUdBLG9CQUFBO0FBSEEsS0FBQTtBQUtBLENBTkE7O0FBUUEsTUFBQSxVQUFBLENBQUEsVUFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQSxlQUFBLEVBQUEsTUFBQSxFQUFBLGFBQUEsRUFBQSxjQUFBLEVBQUE7O0FBRUEsUUFBQSxNQUFBLFNBQUEsUUFBQSxHQUFBLEdBQUEsRUFBQTtBQUNBLFFBQUEsTUFBQSxnQkFBQSxHQUFBLENBQUE7O0FBRUEsUUFBQSxPQUFBLGVBQUE7QUFDQSxRQUFBLGVBQUEsS0FBQSxRQUFBLEVBQUE7O0FBRUEsUUFBQSxXQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQTtBQUNBLFFBQUEsa0JBQUEsZ0JBQUEsUUFBQSxDQUFBOzs7O0FBSUEsb0JBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxVQUFBLEVBQ0EsSUFEQSxDQUNBLFlBQUE7QUFDQSxZQUFBLFdBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLElBQUEsT0FBQSxRQUFBLEVBQUE7QUFDQSxxQkFBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLGVBQUEsU0FBQSxHQUFBLFNBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLEtBUEE7O0FBWUEsV0FBQSxJQUFBLEdBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxZQUFBLGNBQUEsSUFBQSxLQUFBLENBQUEsT0FBQSxFQUFBLEtBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxZQUFBLGFBQUEsWUFBQSxLQUFBLENBQUEsU0FBQSxDQUFBOztBQUVBLGlCQUFB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LENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBZkEsRUFvQkE7QUFDQSxnQkFBQSxDQURBO0FBRUEsc0JBQUEsdUpBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBcEJBLEVBeUJBO0FBQ0EsZ0JBQUEsQ0FEQTtBQUVBLHNCQUFBLHVKQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXpCQSxFQThCQTtBQUNBLGdCQUFBLENBREE7QUFFQSxzQkFBQSx1SkFGQTtBQUdBLG1CQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQTtBQUlBLHNCQUFBO0FBSkEsU0E5QkEsRUFtQ0E7QUFDQSxnQkFBQSxDQURBO0FBRUEsc0JBQUEsdUpBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBbkNBLEVBd0NBO0FBQ0EsZ0JBQUEsQ0FEQTtBQUVBLHNCQUFBLHVKQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXhDQSxFQTZDQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSx1SkFGQTtBQUdBLG1CQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQTtBQUlBLHNCQUFBO0FBSkEsU0E3Q0EsRUFrREE7QUFDQSxnQkFBQSxFQURBO0FBRUEsc0JBQUEsdUpBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBbERBLEVBdURBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLHVKQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXZEQSxFQTREQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSx1SkFGQTtBQUdBLG1CQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQTtBQUlBLHNCQUFBO0FBSkEsU0E1REEsRUFpRUE7QUFDQSxnQkFBQSxFQURBO0FBRUEsc0JBQUEsdUpBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBakVBLEVBc0VBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLHVKQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXRFQSxFQTJFQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSx1SkFGQTtBQUdBLG1CQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQTtBQUlBLHNCQUFBO0FBSkEsU0EzRUEsRUFnRkE7QUFDQSxnQkFBQSxFQURBO0FBRUEsc0JBQUEsdUpBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBaEZBLEVBcUZBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLHVKQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQXJGQSxFQTBGQTtBQUNBLGdCQUFBLEVBREE7QUFFQSxzQkFBQSx1SkFGQTtBQUdBLG1CQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQTtBQUlBLHNCQUFBO0FBSkEsU0ExRkEsRUErRkE7QUFDQSxnQkFBQSxFQURBO0FBRUEsc0JBQUEsdUpBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBL0ZBLEVBb0dBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLHVKQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7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LFVBQUE7QUFDQSxLQUZBO0FBR0EsQ0E1TkE7O0FDUkE7O0FBRUEsU0FBQSxNQUFBLENBQUEsR0FBQSxFQUFBOztBQUVBLFNBQUEsR0FBQSxHQUFBLEdBQUE7O0FBRUEsU0FBQSxNQUFBLEdBQUEsR0FBQTs7O0FBR0EsU0FBQSxLQUFBLEdBQUEsR0FBQTs7OztBQUlBLFNBQUEsU0FBQSxHQUFBLEdBQUE7OztBQUdBLFNBQUEsb0JBQUEsR0FBQSxHQUFBOzs7QUFHQSxTQUFBLEtBQUEsR0FBQSxHQUFBOzs7QUFHQSxTQUFBLE9BQUEsR0FBQSxJQUFBO0FBQ0E7QUFDQSxPQUFBLFNBQUEsQ0FBQSxFQUFBLEdBQUEsWUFBQTtBQUNBLFlBQUEsR0FBQSxDQUFBLElBQUE7QUFDQSxDQUZBOztBQUlBLE9BQUEsU0FBQSxDQUFBLFdBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBOztBQUVBLFFBQUEsSUFBQSxNQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsSUFBQSxNQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsY0FBQSxNQUFBLENBQUEsQ0FBQTs7QUFFQSxTQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLFNBQUEsS0FBQSxDQUFBLFNBQUEsR0FBQSxJQUFBOzs7QUFHQSxTQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7OztBQUdBLFNBQUEsb0JBQUEsR0FBQSxLQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsS0FBQSxDQUFBO0FBQ0EsQ0FkQTs7QUFnQkEsT0FBQSxTQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxJQUFBLEVBQUE7QUFDQSxRQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsRUFBQTtBQUNBLGVBQUEsTUFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLENBQUE7QUFDQSxLQUZBLE1BRUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLEVBQUE7QUFDQSxlQUFBLE1BQUEsU0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsS0FGQSxNQUVBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxFQUFBO0FBQ0EsZUFBQSxNQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtBQUNBLEtBRkEsTUFFQTtBQUNBLGVBQUEsTUFBQSxTQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLENBVkE7O0FBYUEsT0FBQSxTQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsT0FBQSxFQUFBOztBQUVBLFFBQUEsWUFBQSxRQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxlQUFBLENBQUEsU0FBQSxTQUFBLElBQUEsYUFBQSxHQUFBO0FBQ0EsS0FGQSxFQUVBLENBRkEsQ0FBQTtBQUdBLFdBQUEsU0FBQTtBQUNBLENBTkE7O0FBU0EsT0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsUUFBQSxlQUFBLEtBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxlQUFBLFNBQUEsU0FBQTtBQUNBLEtBRkEsQ0FBQTs7QUFJQSxRQUFBLEtBQUEsS0FBQSxDQUFBLElBQUEsSUFBQSxhQUFBLE1BQUEsS0FBQSxDQUFBLEVBQUEsS0FBQSxPQUFBLEdBQUEsS0FBQTtBQUNBLENBTkEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciB0c3VybyA9IGFuZ3VsYXIubW9kdWxlKCdUc3VybycsIFsndWkucm91dGVyJywgJ2ZpcmViYXNlJ10pO1xuXG50c3Vyby5jb25maWcoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB7XG4gICAgICAgIGFwaUtleTogXCJBSXphU3lDTG0zamtrNXBwTXFlUXhLb0gtZFo5Q2RZTWFER1dXcVVcIixcbiAgICAgICAgYXV0aERvbWFpbjogXCJ0aGUtcGF0aHMtb2YtZHJhZ29ucy5maXJlYmFzZWFwcC5jb21cIixcbiAgICAgICAgZGF0YWJhc2VVUkw6IFwiaHR0cHM6Ly90aGUtcGF0aHMtb2YtZHJhZ29ucy5maXJlYmFzZWlvLmNvbVwiLFxuICAgICAgICBzdG9yYWdlQnVja2V0OiBcInRoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tXCIsXG4gICAgfTtcbiAgICBmaXJlYmFzZS5pbml0aWFsaXplQXBwKGNvbmZpZyk7XG59KTtcblxudHN1cm8uY29uc3RhbnQoJ2ZpcmViYXNlVXJsJywgJ2h0dHBzOi8vcGF0aC1vZi10aGUtZHJhZ29uLmZpcmViYXNlaW8uY29tLycpO1xuXG50c3Vyby5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbn0pO1xuIiwiZnVuY3Rpb24gQm9hcmQoKSB7XG4gICAgdGhpcy5ib2FyZCA9IFtdO1xufVxuXG5Cb2FyZC5wcm90b3R5cGUuZHJhd0JvYXJkID0gZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgNjsgeSsrKSB7XG4gICAgICAgIGlmICghdGhpcy5ib2FyZFt5XSkgdGhpcy5ib2FyZFt5XSA9IFtdO1xuICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IDY7IHgrKykge1xuICAgICAgICAgICAgdGhpcy5ib2FyZFt5XS5wdXNoKG5ldyBTcGFjZSh4LCB5LCB0aGlzLmJvYXJkKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYm9hcmQ7XG59XG5cbmZ1bmN0aW9uIFNwYWNlKHgsIHksIGJvYXJkKSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICAgIHRoaXMudGlsZSA9IFwiblwiO1xuICAgIHRoaXMucG9pbnRzID0gW251bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGxdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgICAgbGV0IGNvcnJlc3BvbmRpbmc7XG5cbiAgICAgICAgaWYgKGkgPCAyKSB7IC8vdG9wXG4gICAgICAgICAgICBjb3JyZXNwb25kaW5nID0gaSA9PT0gMCA/IDUgOiA0OyAvLyAwIC0+IDUgJiAxIC0+IDRcbiAgICAgICAgICAgIGlmICh5ID09PSAwKSB0aGlzLnBvaW50c1tpXSA9IG5ldyBQb2ludCh0cnVlLCBbe1xuICAgICAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICAgICAgeTogeSxcbiAgICAgICAgICAgICAgICBpOiBpXG4gICAgICAgICAgICB9XSk7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBvaW50c1tpXSA9IGJvYXJkW3kgLSAxXVt4XS5wb2ludHNbY29ycmVzcG9uZGluZ107XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoaSA8IDQpIHsgLy9yaWdodFxuICAgICAgICAgICAgY29ycmVzcG9uZGluZyA9IGkgPT09IDIgPyA3IDogNjtcbiAgICAgICAgICAgIGlmICh4ID09PSA1KSB0aGlzLnBvaW50c1tpXSA9IG5ldyBQb2ludCh0cnVlLCBbe1xuICAgICAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICAgICAgeTogeSxcbiAgICAgICAgICAgICAgICBpOiBpXG4gICAgICAgICAgICB9XSk7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBvaW50c1tpXSA9IG5ldyBQb2ludChmYWxzZSwgW3tcbiAgICAgICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICAgICAgeTogeSxcbiAgICAgICAgICAgICAgICAgICAgaTogaVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgeDogeCArIDEsXG4gICAgICAgICAgICAgICAgICAgIHk6IHksXG4gICAgICAgICAgICAgICAgICAgIGk6IGNvcnJlc3BvbmRpbmdcbiAgICAgICAgICAgICAgICB9XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoaSA8IDYpIHsgLy9ib3R0b21cbiAgICAgICAgICAgIGNvcnJlc3BvbmRpbmcgPSBpID09PSA0ID8gMSA6IDA7XG4gICAgICAgICAgICBpZiAoeSA9PT0gNSkgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQodHJ1ZSwgW3tcbiAgICAgICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgICAgIHk6IHksXG4gICAgICAgICAgICAgICAgaTogaVxuICAgICAgICAgICAgfV0pO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQoZmFsc2UsIFt7XG4gICAgICAgICAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICAgICAgICAgIHk6IHksXG4gICAgICAgICAgICAgICAgICAgIGk6IGlcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICAgICAgICAgIHk6IHkgKyAxLFxuICAgICAgICAgICAgICAgICAgICBpOiBjb3JyZXNwb25kaW5nXG4gICAgICAgICAgICAgICAgfV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgeyAvL2xlZnRcbiAgICAgICAgICAgIGNvcnJlc3BvbmRpbmcgPSBpID09PSA2ID8gMyA6IDI7IC8vIDYgLT4gMyAmIDcgLT4gMlxuICAgICAgICAgICAgaWYgKHggPT09IDApIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KHRydWUsIFt7XG4gICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICB5OiB5LFxuICAgICAgICAgICAgICAgIGk6IGlcbiAgICAgICAgICAgIH1dKTtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucG9pbnRzW2ldID0gYm9hcmRbeV1beCAtIDFdLnBvaW50c1tjb3JyZXNwb25kaW5nXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG4vLyBlZGdlID0gYm9vbGVhblxuZnVuY3Rpb24gUG9pbnQoZWRnZSwgc3BhY2UpIHtcbiAgICB0aGlzLmVkZ2UgPSBlZGdlO1xuICAgIHRoaXMubmVpZ2hib3JzID0gW1wiblwiXTtcbiAgICB0aGlzLnRyYXZlbGxlZCA9IGZhbHNlO1xuICAgIHRoaXMuc3BhY2VzID0gc3BhY2U7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmNsYXNzIERlY2sge1xuICAgIGNvbnN0cnVjdG9yKHRpbGVzKSB7XG4gICAgICAgIHRoaXMudGlsZXMgPSB0aWxlc1xuICAgIH1cblxuICAgIHNodWZmbGUoKSB7XG4gICAgICAgIHRoaXMudGlsZXMgPSBfLnNodWZmbGUodGhpcy50aWxlcylcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZGVhbFRocmVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlcy5zcGxpY2UoMCwgMyk7XG4gICAgfVxuXG4gICAgZGVhbChudW0pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZXMuc3BsaWNlKDAsIG51bSk7XG4gICAgfVxuXG4gICAgcmVsb2FkKHRpbGVzKSB7XG4gICAgICAgIHRoaXMudGlsZXMucHVzaCh0aWxlcylcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vL0dBTUUvLy9cblxuY2xhc3MgR2FtZSB7XG4gICAgY29uc3RydWN0b3IobmFtZSkge1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLmNvdW50ID0gMzU7XG4gICAgICAgIHRoaXMuYm9hcmQgPSBuZXcgQm9hcmQoKS5kcmF3Qm9hcmQoKTtcbiAgICAgICAgdGhpcy5wbGF5ZXJzID0gW107XG4gICAgICAgIHRoaXMuYXZhaWxhYmxlTWFya2VycyA9IFtcInJlZFwiLCBcIm9yYW5nZVwiLCBcInllbGxvd1wiLCBcImdyZWVuXCIsIFwiYXF1YVwiLCBcImJsdWVcIiwgXCJuYXZ5XCIsIFwicHVycGxlXCJdXG5cbiAgICAgICAgLy9pbmRleCBvZiB0aGUgY3VycmVudFBsYXllciBpbiB0aGUgcGxheWVyc1xuICAgICAgICB0aGlzLmN1cnJQbGF5ZXI7XG5cbiAgICAgICAgdGhpcy5kcmFnb24gPSBudWxsO1xuICAgICAgICB0aGlzLm1vdmVzO1xuICAgIH1cblxuICAgIGdldEN1cnJlbnRQbGF5ZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJQbGF5ZXIgPT09IC0xKSByZXR1cm47XG4gICAgICAgIHJldHVybiB0aGlzLnBsYXllcnNbdGhpcy5jdXJyUGxheWVyXTtcbiAgICB9XG5cbiAgICBtb3ZlQWxsUGxheWVycygpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLmZvckVhY2goKHBsYXllcikgPT4gcGxheWVyLmtlZXBNb3ZpbmcocGxheWVyKSlcbiAgICB9XG5cbiAgICBkZWFkUGxheWVycygpIHtcbiAgICAgICAgdmFyIGRlYWRQbGF5ZXJzVGlsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLmZvckVhY2goZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICAgICAgaWYgKCFwbGF5ZXIuY2FuUGxheSAmJiBwbGF5ZXIudGlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGRlYWRQbGF5ZXJzVGlsZXMucHVzaChwbGF5ZXIudGlsZXMpO1xuICAgICAgICAgICAgICAgIGlzRGVhZFBsYXllciA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZGVhZFBsYXllcnNUaWxlcztcbiAgICB9XG5cbiAgICBjaGVja092ZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldENhblBsYXkoKS5sZW5ndGggPD0gMTtcbiAgICB9XG5cbiAgICAvL3RvIGJlIGNhbGxlZCBhdCB0aGUgZW5kIG9mIGEgdHVybiB0byBzZXQgdGhlIGN1cnJQbGF5ZXIgdG8gdGhlIG5leHQgZWxpZ2libGUgcGxheWVyIGluIHRoZSBwbGF5ZXJzIGFycmF5O1xuICAgIGdvVG9OZXh0UGxheWVyKCkge1xuICAgICAgICBpZiAodGhpcy5nZXRDYW5QbGF5KCkubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5jdXJyUGxheWVyLCBcImN1cnJQbGF5ZXJcIiwgXCJwbGF5ZXJzXCIsIHRoaXMucGxheWVycylcbiAgICAgICAgICAgIGxldCBuZXdJZHggPSB0aGlzLmN1cnJQbGF5ZXIgKyAxID49IHRoaXMucGxheWVycy5sZW5ndGggPyAwIDogdGhpcy5jdXJyUGxheWVyICsgMTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibmV3SWR4XCIsIG5ld0lkeClcbiAgICAgICAgICAgIHdoaWxlIChuZXdJZHggPCB0aGlzLnBsYXllcnMubGVuZ3RoICYmICF0aGlzLnBsYXllcnNbbmV3SWR4XS5jYW5QbGF5KSB7XG4gICAgICAgICAgICAgICAgbmV3SWR4Kys7XG4gICAgICAgICAgICAgICAgaWYgKG5ld0lkeCA9PT0gdGhpcy5wbGF5ZXJzLmxlbmd0aCkgbmV3SWR4ID0gMDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhuZXdJZHgpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmN1cnJQbGF5ZXIgPSBuZXdJZHg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJQbGF5ZXIgPSAtMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5nZXRDdXJyZW50UGxheWVyKCk7XG4gICAgfVxuXG4gICAgZGVhbChudW0pIHtcbiAgICAgICAgdmFyIHRpbGVzID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtOyBpKyspIHtcbiAgICAgICAgICAgIHZhciB0aWxlID0gdGhpcy5kZWNrWzBdLnNwbGljZSgwLCAxKTtcbiAgICAgICAgICAgIHRoaXMuZGVjay4kc2F2ZSgwKS50aGVuKGZ1bmN0aW9uIChyZWYpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZGVhbHQgYSBjYXJkIScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aWxlcyA9IHRpbGVzLmNvbmNhdCh0aWxlKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRpbGVzKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aWxlcztcbiAgICB9XG5cbiAgICBnZXRDYW5QbGF5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wbGF5ZXJzLmZpbHRlcigocGxheWVyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcGxheWVyLmNhblBsYXlcbiAgICAgICAgfSlcbiAgICB9XG5cbn1cbiIsInRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZ2FtZScsIHtcbiAgICAgICAgdXJsOiAnL2dhbWUvOmdhbWVOYW1lJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvYnJvd3Nlci9qcy9nYW1lL2dhbWUuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdnYW1lQ3RybCdcbiAgICB9KTtcbn0pO1xuXG50c3Vyby5jb250cm9sbGVyKCdnYW1lQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRmaXJlYmFzZUF1dGgsIGZpcmViYXNlVXJsLCAkc3RhdGVQYXJhbXMsICRmaXJlYmFzZU9iamVjdCwgJGZpcmViYXNlQXJyYXkpIHtcbiAgICB2YXIgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbiAgICB2YXIgb2JqID0gJGZpcmViYXNlT2JqZWN0KHJlZik7XG5cbiAgICB2YXIgZ2FtZVJlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZCgkc3RhdGVQYXJhbXMuZ2FtZU5hbWUpO1xuICAgIHZhciBnYW1lQXJyID0gZ2FtZVJlZi5jaGlsZCgkc3RhdGVQYXJhbXMuZ2FtZU5hbWUpO1xuXG4gICAgdmFyIGRlY2tSZWYgPSBnYW1lUmVmLmNoaWxkKCdkZWNrJyk7XG4gICAgdmFyIGRlY2tBcnIgPSAkZmlyZWJhc2VBcnJheShkZWNrUmVmKTtcblxuICAgIHZhciBwbGF5ZXJzUmVmID0gZ2FtZVJlZi5jaGlsZCgncGxheWVycycpO1xuICAgIHZhciBmaXJlYmFzZVBsYXllcnNBcnIgPSAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKTtcblxuICAgIHZhciBtYXJrZXJzUmVmID0gZ2FtZVJlZi5jaGlsZCgnYXZhaWxhYmxlTWFya2VycycpO1xuICAgIHZhciBtYXJrZXJzQXJyID0gJGZpcmViYXNlQXJyYXkobWFya2Vyc1JlZik7XG5cbiAgICB2YXIgbW92ZXNSZWYgPSBnYW1lUmVmLmNoaWxkKCdtb3ZlcycpO1xuICAgIHZhciBtb3Zlc0FyciA9ICRmaXJlYmFzZUFycmF5KG1vdmVzUmVmKTtcblxuICAgIHZhciBib2FyZFJlZiA9IGdhbWVSZWYuY2hpbGQoJ2JvYXJkJyk7XG4gICAgdmFyIGJvYXJkQXJyID0gJGZpcmViYXNlQXJyYXkoYm9hcmRSZWYpO1xuXG4gICAgdmFyIHBsYXllciA9IE9iamVjdC5jcmVhdGUoUGxheWVyLnByb3RvdHlwZSk7XG5cbiAgICAvKioqKioqKioqKioqKioqKlxuICAgIElOSVRJQUxJWklORyBHQU1FXG4gICAgKioqKioqKioqKioqKioqKi9cblxuICAgIC8vbmV3IGxvY2FsIGdhbWUgd2l0aCBnYW1lIG5hbWUgZGVmaW5lZCBieSB1cmxcbiAgICAkc2NvcGUuZ2FtZSA9IG5ldyBHYW1lKCRzdGF0ZVBhcmFtcy5nYW1lTmFtZSk7XG5cblxuICAgIGJvYXJkQXJyLiRhZGQoJHNjb3BlLmdhbWUuYm9hcmQpO1xuXG4gICAgLy93aGVuIHRoZSBib2FyZCBpcyBsb2FkZWQuLi5cbiAgICBib2FyZEFyci4kbG9hZGVkKCkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgJHNjb3BlLmdhbWUuYm9hcmQgPSBib2FyZEFycjtcbiAgICBcbiAgICAgICAgLy93YXRjaGluZyBib2FyZCBmb3IgY2hhbmdlc1xuICAgICAgICBib2FyZFJlZi5vbignY2hpbGRfY2hhbmdlZCcsIGZ1bmN0aW9uKHNuYXApe1xuICAgICAgICAgICAgLy9ORUVEIFRPIFJFVFVSTiBUTyBDSEVDSyBCT0FSRFxuICAgICAgICAgICAgY29uc29sZS5sb2coc25hcCk7XG4gICAgICAgICAgICAkc2NvcGUuZ2FtZS5ib2FyZCA9IHNuYXAudmFsKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgJHNjb3BlLnNwYWNlcyA9IF8uZmxhdHRlbigkc2NvcGUuZ2FtZS5ib2FyZCk7XG5cblxuICAgIC8vd2hlbiB0aGUgZGVjayBpcyBsb2FkZWQuLi5cbiAgICBkZWNrQXJyLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG5cbiAgICAgICAgJHNjb3BlLmdhbWUuZGVjayA9IGRlY2tBcnI7IC8vYWRkIHRoZSBkZWNrIHRvIHRoZSBsb2NhbCBnYW1lID8gVHJ5IHRoaXMgYXMgZmlyZWJhc2UgRGVja0Fycj8/Pz9cblxuICAgICAgICAvL2Rvbid0IHN0YXJ0IHdhdGNoaW5nIHBsYXllcnMgdW50aWwgdGhlcmUgaXMgYSBkZWNrIGluIHRoZSBnYW1lXG4gICAgICAgIHBsYXllcnNSZWYub24oXCJ2YWx1ZVwiLCBmdW5jdGlvbiAoc25hcCkge1xuICAgICAgICAgICAgdmFyIHNuYXBQbGF5ZXJzID0gc25hcC52YWwoKTsgLy9ncmFiIHRoZSB2YWx1ZSBvZiB0aGUgc25hcHNob3QgKGFsbCBwbGF5ZXJzIGluIGdhbWUgaW4gRmlyZWJhc2UpXG5cbiAgICAgICAgICAgIC8vZm9yIGVhY2ggcGxheWVyIGluIHRoaXMgY29sbGVjdGlvbi4uLlxuICAgICAgICAgICAgZm9yICh2YXIgdGhpc1BsYXllciBpbiBzbmFwUGxheWVycykge1xuICAgICAgICAgICAgICAgIHZhciBleGlzdGluZ1BsYXllckluZGV4LCB0aGlzSXNBTmV3UGxheWVyO1xuXG4gICAgICAgICAgICAgICAgLy9maW5kIHRoaXMgJ3NuYXAnIHBsYXllcidzIGluZGV4IGluIGxvY2FsIGdhbWUuIGZpbmQgcmV0dXJucyB0aGF0IHZhbHVlLlxuICAgICAgICAgICAgICAgIHZhciBsb2NhbFBsYXllciA9ICRzY29wZS5nYW1lLnBsYXllcnMuZmluZChmdW5jdGlvbiAocGx5ciwgcGx5cklkeCkge1xuICAgICAgICAgICAgICAgICAgICBleGlzdGluZ1BsYXllckluZGV4ID0gcGx5cklkeDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBseXIudWlkID09PSBzbmFwUGxheWVyc1t0aGlzUGxheWVyXS51aWQ7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvL2lmIG5vdCBmb3VuZCwgY3JlYXRlIG5ldyBwbGF5ZXJcbiAgICAgICAgICAgICAgICBpZiAoIWxvY2FsUGxheWVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpIGRpZG50IGZpbmQgYSBsb2NhbCBwbGF5ZXIhJyk7XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsUGxheWVyID0gbmV3IFBsYXllcihzbmFwUGxheWVyc1t0aGlzUGxheWVyXS51aWQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzSXNBTmV3UGxheWVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvL2ZvciBlYWNoIGtleSBpbiB0aGUgc25hcFBsYXllcidzIGtleXMsIGFkZCB0aGF0IGtleSBhbmQgdmFsdWUgdG8gbG9jYWwgcGxheWVyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgcGxheWVycHJvcGVydHkgaW4gc25hcFBsYXllcnNbdGhpc1BsYXllcl0pIHtcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxQbGF5ZXJbcGxheWVycHJvcGVydHldID0gc25hcFBsYXllcnNbdGhpc1BsYXllcl1bcGxheWVycHJvcGVydHldO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vcHVzaCBsb2NhbCBwbGF5ZXIgdG8gZ2FtZS5wbGF5ZXJzXG4gICAgICAgICAgICAgICAgaWYgKHRoaXNJc0FOZXdQbGF5ZXIpICRzY29wZS5nYW1lLnBsYXllcnMucHVzaChsb2NhbFBsYXllcik7XG4gICAgICAgICAgICAgICAgZWxzZSAkc2NvcGUuZ2FtZS5wbGF5ZXJzW2V4aXN0aW5nUGxheWVySW5kZXhdID0gbG9jYWxQbGF5ZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cblxuXG4gICAgLy93aGVuIHRoYXQgbWFya2VycyBhcnJheSBpcyBsb2FkZWQsIHVwZGF0ZSB0aGUgYXZhaWxhYmxlIG1hcmtlcnMgYXJyYXkgb24gc2NvcGVcbiAgICBtYXJrZXJzQXJyLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICRzY29wZS5nYW1lLmF2YWlsYWJsZU1hcmtlcnMgPSBkYXRhWzBdO1xuICAgIH0pO1xuXG4gICAgLy9pZiBzb21lb25lIGVsc2UgcGlja3MgYSBtYXJrZXIsIHVwZGF0ZSB5b3VyIHZpZXdcbiAgICBtYXJrZXJzUmVmLm9uKCdjaGlsZF9jaGFuZ2VkJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgJHNjb3BlLmdhbWUuYXZhaWxhYmxlTWFya2VycyA9IGRhdGEudmFsKCk7XG4gICAgfSk7XG5cbiAgICAvL29uIGxvZ2luLCBmaW5kIG1lIGluIHRoZSBmaXJlYmFzZSBwbGF5ZXJzIGFycmF5XG4gICAgZmlyZWJhc2UuYXV0aCgpLm9uQXV0aFN0YXRlQ2hhbmdlZChmdW5jdGlvbiAodXNlcikge1xuICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcblxuICAgICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWVJZHg7XG4gICAgICAgICAgICAgICAgcGxheWVycy5maW5kKGZ1bmN0aW9uIChlLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlLnVpZCA9PT0gdXNlci51aWQpIG1lSWR4ID0gaTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICRzY29wZS5tZSA9IHBsYXllcnNbbWVJZHhdO1xuICAgICAgICAgICAgICAgICRzY29wZS5nYW1lLmN1cnJQbGF5ZXIgPSBtZUlkeDtcblxuXG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZS5tZS5tYXJrZXIgPT09IFwiblwiKSAkc2NvcGUubWUubWFya2VyID0gbnVsbDtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBObyB1c2VyIGlzIHNpZ25lZCBpbi5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIm5vIG9uZSBpcyBsb2dnZWQgaW5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnaW0gaGVyZSEhISEhISEhJylcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB2YXIgYm9hcmQgPSAkc2NvcGUuZ2FtZS5ib2FyZDtcbiAgICAvKioqKioqKioqKioqKioqKlxuICAgIEFWQUlMQUJMRSBQTEFZRVIgQUNUSU9OUyBBVCBHQU1FIFNUQVJUXG4gICAgKioqKioqKioqKioqKioqKi8gXG4gICAgJHNjb3BlLnBpY2tNYXJrZXIgPSBmdW5jdGlvbiAoYm9hcmQsIG1hcmtlcikge1xuXG4gICAgICAgICRzY29wZS5tZS5tYXJrZXIgPSBtYXJrZXI7XG5cbiAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyLiRsb2FkZWQoKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWVJZHg7XG4gICAgICAgICAgICAgICAgLy9maW5kIG15IGluZGV4IGluIHRoZSBwbGF5ZXJzIGFycmF5XG4gICAgICAgICAgICAgICAgcGxheWVycy5maW5kKGZ1bmN0aW9uIChlLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlLiRpZCA9PT0gJHNjb3BlLm1lLiRpZCkgbWVJZHggPSBpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vZ2l2ZSBtZSBhIG1hcmtlciBhbmQgc2F2ZSBtZSBpbiBmaXJlYmFzZVxuICAgICAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0ubWFya2VyID0gbWFya2VyO1xuICAgICAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0Fyci4kc2F2ZShtZUlkeCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB2YXIgaWR4ID0gJHNjb3BlLmdhbWUuYXZhaWxhYmxlTWFya2Vycy5pbmRleE9mKG1hcmtlcik7XG5cbiAgICAgICAgbWFya2Vyc0FyclswXS5zcGxpY2UoaWR4LCAxKTtcblxuICAgICAgICBtYXJrZXJzQXJyLiRzYXZlKDApXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocmVmKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZW1vdmVkIHRoZSBwaWNrZWQgbWFya2VyXCIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlZi5rZXkpO1xuICAgICAgICAgICAgfSk7XG4gICAgfTtcblxuXG4gICAgLy9UT0RPOiBsaW1pdCBzdGFydCBwb2ludHNcblxuICAgIC8vYWRkaW5nIGEgYm9hcmQgdG8gZmlyZWJhc2VcblxuICAgIC8vSGF2ZSBwbGF5ZXIgcGljayB0aGVpciBzdGFydCBwb2ludFxuICAgICRzY29wZS5wbGFjZU1hcmtlciA9IGZ1bmN0aW9uIChib2FyZCwgcG9pbnQpIHtcbiAgICAgICAgLy8gcGxhY2UgbXkgbWFya2VyXG4gICAgICAgIHBsYXllci5wbGFjZU1hcmtlcihib2FyZCwgcG9pbnQsICRzY29wZS5tZSk7XG4gICAgICAgIC8vIGRlYWwgbWUgdGhyZWUgY2FyZHNcbiAgICAgICAgJHNjb3BlLm1lLnRpbGVzID0gJHNjb3BlLmdhbWUuZGVhbCgzKTtcblxuICAgICAgICAvLyB3aGVuIHRoZSBmaXJlYmFzZSBwbGF5ZXJzIGFyZSBsb2FkZWQuLi4uXG4gICAgICAgIGZpcmViYXNlUGxheWVyc0Fyci4kbG9hZGVkKClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgICAgICAgICAgICAgLy9maW5kIG1lIGluIHRoZSBmaXJlYmFzZSBwbGF5ZXJzIGFycmF5XG4gICAgICAgICAgICAgICAgdmFyIG1lSWR4O1xuICAgICAgICAgICAgICAgIHBsYXllcnMuZmluZChmdW5jdGlvbiAoZSwgaSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZS51aWQgPT09ICRzY29wZS5tZS51aWQpIG1lSWR4ID0gaTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0gPSAkc2NvcGUubWU7IC8vc2V0IGZpcmViYXNlIG1lIHRvIGxvY2FsIG1lXG5cbiAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJHNhdmUobWVJZHgpOyAvL3NhdmUgaXQuXG4gICAgICAgICAgICB9KTtcbiAgICB9O1xuXG5cblxuXG5cblxuXG5cbiAgICAvLyBUT0RPOiB3ZSBwcm9iYWJseSBuZWVkIHRoaXMgb24gZmlyZWJhc2Ugc28gb3RoZXIgcGVvcGxlIGNhbid0IHBpY2sgd2hhdCdzIGJlZW4gcGlja2VkXG5cbiAgICAvL0ZvciBzeW5jaHJvbml6aW5nR2FtZS4uLlxuICAgIC8vIHZhciBzeW5jUmVmID0gZ2FtZVJlZi5jaGlsZCgnbW92ZXMnKTtcbiAgICAvLyBzeW5jUmVmLm9uKCdjaGlsZF9hZGRlZCcsIGZ1bmN0aW9uIChjaGlsZFNuYXBzaG90LCBwcmV2Q2hpbGRLZXkpIHtcbiAgICAvLyBcdC8vTkVFRCBUTyBET1VCTEUgQ0hFQ0shISBXaGF0IGRvZXMgY2hpbGRTbmFwIHJldHVybnM/XG4gICAgLy8gXHRjb25zb2xlLmxvZygnY2hpbGRTbmFwc2hvdF9TeW5jR2FtZScsIGNoaWxkU25hcHNob3QpO1xuICAgIC8vIFx0Ly9kZXBlbmRpbmcgb24gd2hhdCBjaGlsZFNuYXBzaG90IGdpdmVzIG1lLi4uSSB0aGluayBpdCdzIG9uZSBjaGlsZCBwZXIgb24gY2FsbD8gSXQgZG9lc24ndCByZXR1cm4gYW4gYXJyYXkgb2YgY2hhbmdlcy4uLkkgYmVsaWV2ZSFcbiAgICAvLyBcdGlmIChjaGlsZFNuYXBzaG90LnR5cGUgPT09ICd1cGRhdGVEZWNrJykge1xuICAgIC8vIFx0XHQkc2NvcGUuZ2FtZS5kZWNrID0gY2hpbGRTbmFwc2hvdC51cGRhdGVEZWNrO1xuICAgIC8vIFx0fSBlbHNlIHtcbiAgICAvLyBcdFx0JHNjb3BlLnBsYWNlVGlsZShjaGlsZFNuYXBzaG90LnRpbGUpO1xuICAgIC8vIFx0fVxuICAgIC8vIH0pO1xuXG4gICAgLy8gVE9ETzogaG93IHRvIHJlLWRvIHRoZSBtb3Zlcz9cbiAgICAvLyAkc2NvcGUuZ2FtZS5tb3ZlcztcblxuICAgIC8vIFRPRE86IGhvdyBkbyB3ZSBzaG93IHRoZSB0aWxlcyBmb3IgcGxheWVyP1xuXG4gICAgLy8gVE9ETzogaG93IHRvIHNob3cgdGhlIHJvdGF0ZWQgdGlsZT9cblxuICAgIC8vIENNVDogYXNzdW1pbmcgd2UgdXNlIG5ldyBHYW1lKCkgZm9yIGVhY2ggZ2FtZVxuICAgICRzY29wZS5jdXJyZW50UGxheWVyID0gJHNjb3BlLmdhbWUuZ2V0Q3VycmVudFBsYXllcigpO1xuXG4gICAgLy8gVE9ETzogbmVlZCBhIGZ1bmN0aW9uIHRvIGFzc2lnbiBkcmFnb25cbiAgICAkc2NvcGUuZHJhZ29uO1xuICAgIHZhciBhd2FpdGluZ0RyYWdvbkhvbGRlcnMgPSBbXTtcblxuICAgICRzY29wZS5zdGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy9cbiAgICB9O1xuXG4gICAgJHNjb3BlLm15VHVybiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHNjb3BlLm1lID09PSAkc2NvcGUuY3VycmVudFBsYXllcjtcbiAgICB9O1xuXG4gICAgLy90aGVzZSBhcmUgdGllZCB0byBhbmd1bGFyIG5nLWNsaWNrIGJ1dHRvbnNcbiAgICAkc2NvcGUucm90YXRlVGlsZUN3ID0gZnVuY3Rpb24gKHRpbGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJyb3RhdGUgdG8gcmlnaHRcIik7XG4gICAgICAgIHRpbGUucm90YXRpb24rKztcbiAgICAgICAgaWYgKHRpbGUucm90YXRpb24gPT09IDQpIHRpbGUucm90YXRpb24gPSAwO1xuICAgIH07XG5cbiAgICAkc2NvcGUucm90YXRlVGlsZUNjdyA9IGZ1bmN0aW9uICh0aWxlKSB7XG4gICAgICAgIHRpbGUucm90YXRpb24tLTtcbiAgICAgICAgaWYgKHRpbGUucm90YXRpb24gPT09IC00KSB0aWxlLnJvdGF0aW9uID0gMDtcbiAgICB9O1xuXG4gICAgLy8gQ01UOiB1c2UgcGxheWVyJ3MgYW5kIGdhbWUncyBwcm90b3R5cGUgZnVuY3Rpb24gdG8gcGxhY2UgdGlsZSBhbmQgdGhlbiBtb3ZlIGFsbCBwbGF5ZXJzXG4gICAgJHNjb3BlLnBsYWNlVGlsZSA9IGZ1bmN0aW9uICh0aWxlKSB7XG4gICAgICAgIC8vIFRPRE86IHNlbmQgdGhpcyBzdGF0ZSB0byBmaXJlYmFzZSBldmVyeSB0aW1lIGl0J3MgY2FsbGVkXG4gICAgICAgIGlmICh0aWxlLnJvdGF0aW9uID4gMCkge1xuICAgICAgICAgICAgdGlsZS5wYXRocyA9IHRpbGUucGF0aHMubWFwKGZ1bmN0aW9uIChjb25uZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbiA9IGNvbm5lY3Rpb24gKyAyO1xuICAgICAgICAgICAgICAgIGlmIChjb25uZWN0aW9uID09PSA5KSBjb25uZWN0aW9uID0gMTtcbiAgICAgICAgICAgICAgICBpZiAoY29ubmVjdGlvbiA9PT0gOCkgY29ubmVjdGlvbiA9IDA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbm5lY3Rpb247XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRpbGUucGF0aHMudW5zaGlmdCh0aWxlLnBhdGhzLnBvcCgpKTtcbiAgICAgICAgICAgIHRpbGUucGF0aHMudW5zaGlmdCh0aWxlLnBhdGhzLnBvcCgpKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aWxlLnJvdGF0aW9uIDwgMCkge1xuICAgICAgICAgICAgdGlsZS5wYXRocyA9IHRpbGUucGF0aHMubWFwKGZ1bmN0aW9uIChjb25uZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgY29ubmVjdGlvbiA9IGNvbm5lY3Rpb24gLSAyO1xuICAgICAgICAgICAgICAgIGlmIChjb25uZWN0aW9uID09PSAtMikgY29ubmVjdGlvbiA9IDY7XG4gICAgICAgICAgICAgICAgaWYgKGNvbm5lY3Rpb24gPT09IC0xKSBjb25uZWN0aW9uID0gNztcbiAgICAgICAgICAgICAgICByZXR1cm4gY29ubmVjdGlvbjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGlsZS5wYXRocy5wdXNoKHRpbGUucGF0aHMuc2hpZnQoKSk7XG4gICAgICAgICAgICB0aWxlLnBhdGhzLnB1c2godGlsZS5wYXRocy5zaGlmdCgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKHRpbGUpO1xuXG4gICAgICAgIHZhciBmaXJlYmFzZVBsYXllcnNBcnIgPSAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKTtcbiAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyLiRsb2FkZWQoKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWVJZHg7XG4gICAgICAgICAgICAgICAgcGxheWVycy5maW5kKGZ1bmN0aW9uIChlLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlLiRpZCA9PT0gJHNjb3BlLm1lLiRpZCkgbWVJZHggPSBpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS50aWxlcyA9IGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0udGlsZXMuZmlsdGVyKGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0LmlkICE9PSB0aWxlLmlkXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLm5leHRTcGFjZS50aWxlVXJsID0gdGlsZS5pbWFnZVVybDtcblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGlsZS5wYXRocy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS5uZXh0U3BhY2UucG9pbnRzW2ldLm5laWdoYm9yc1swXSA9PT0gXCJuXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0ubmV4dFNwYWNlLnBvaW50c1tpXS5uZWlnaGJvcnMuc3BsaWNlKDAsIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0ubmV4dFNwYWNlLnBvaW50c1tpXS5uZWlnaGJvcnMucHVzaChmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLm5leHRTcGFjZS5wb2ludHNbdGlsZS5wYXRoc1tpXV0pO1xuICAgICAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJHNhdmUobWVJZHgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0ucG9pbnQgPSBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLm5leHRTcGFjZS5wb2ludHNbZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS5uZXh0U3BhY2VQb2ludHNJbmRleF07XG5cbiAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJHNhdmUobWVJZHgpO1xuXG4gICAgICAgICAgICAgICAgdmFyIHBsYXllcnNOZXh0U3BhY2VYID0gZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS5uZXh0U3BhY2UueDtcbiAgICAgICAgICAgICAgICB2YXIgcGxheWVyc05leHRTcGFjZVkgPSBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLm5leHRTcGFjZS55O1xuICAgICAgICAgICAgICAgIHJldHVybiBbcGxheWVyc05leHRTcGFjZVksIHBsYXllcnNOZXh0U3BhY2VYXTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihuZXh0U3BhY2Upe1xuICAgICAgICAgICAgICAgIGJvYXJkQXJyLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgICAgICAgICBkYXRhW25leHRTcGFjZVswXV1bbmV4dFNwYWNlWzFdXS50aWxlLiRhZGQodGlsZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHBvaW50cyA9IGRhdGFbbmV4dFNwYWNlWzBdXVtuZXh0U3BhY2VbMV1dLnBvaW50cztcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRzLmZvckVhY2goZnVuY3Rpb24ocG9pbnQsIGlkeCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb2ludC5uZWlnaGJvcnMuJGFkZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb2ludHNbdGlsZS5wYXRoc1tpZHhdXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3NhdmUgaXQgYmFjayB0byBmaXJlYmFzZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvL05lZWQgdG8gcmVhc3NpZ24gdGhlIHRpbGVzIHBvaW50cyBuZWlnaGJvcnNcblxuICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAvLyBDTVQ6IHRoaXMgc2hvdWxkIHNlbmQgdGhlIHJvdGF0ZWQgdGlsZSB0byBmaXJlYmFzZVxuICAgICAgICAvLyBtb3Zlc0Fyci4kYWRkKHtcbiAgICAgICAgLy8gICAgICd0eXBlJzogJ3BsYWNlVGlsZScsXG4gICAgICAgIC8vICAgICAndGlsZSc6IHRpbGUsXG4gICAgICAgIC8vICAgICAncGxheWVyVWlkJzogJHNjb3BlLm1lLnVpZFxuICAgICAgICAvLyB9KTtcblxuICAgICAgICBcblxuICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJGxvYWRlZCgpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocGxheWVycykge1xuICAgICAgICAgICAgICAgIHBsYXllcnMuZm9yRWFjaChmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbW92YWJsZSA9IHBsYXllci5tb3ZlVG8ocC5wb2ludCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwSWR4ID0gcGxheWVycy5pbmRleE9mKHApXG5cbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKG1vdmFibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHAucG9pbnQudHJhdmVsbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHAucG9pbnQgPSBtb3ZhYmxlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocC5wb2ludC50cmF2ZWxsZWQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwLmNhblBsYXkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgdGhlIHNwYWNlIHRoYXQncyBub3QgbXkgY3VycmVudCBuZXh0U3BhY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdOZXh0U3BhY2VJbmZvID0gcC5wb2ludC5zcGFjZXMuZmlsdGVyKGZ1bmN0aW9uIChzcGFjZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzcGFjZS54ICE9PSBwLm5leHRTcGFjZS54IHx8IHNwYWNlLnkgIT09IHAubmV4dFNwYWNlLnlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pWzBdXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBvbGRTcGFjZSA9IHAubmV4dFNwYWNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1NwYWNlID0gJHNjb3BlLmdhbWUuYm9hcmRbbmV3TmV4dFNwYWNlSW5mby55XVtuZXdOZXh0U3BhY2VJbmZvLnhdO1xuICAgICAgICAgICAgICAgICAgICAgICAgcC5uZXh0U3BhY2UgPSBuZXdTcGFjZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyLiRzYXZlKHBJZHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogbmVlZCBtb3JlIHBsYXllcnMgdG8gY2hlY2sgaWYgaXQgd29ya3NcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllci5jaGVja0RlYXRoKHApO1xuICAgICAgICAgICAgICAgICAgICAgICAgbW92YWJsZSA9IHBsYXllci5tb3ZlVG8ocC5wb2ludCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImVuZCBtb3ZpbmdcIilcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgaWYgKCRzY29wZS5nYW1lLmNoZWNrT3ZlcigpKSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBuZWVkIHRvIHRlbGwgdGhlIHBsYXllciBzaGUgd29uXG4gICAgICAgICAgICAkc2NvcGUud2lubmVyID0gJHNjb3BlLmdhbWUuZ2V0Q2FuUGxheSgpWzBdO1xuICAgICAgICAgICAgJHNjb3BlLmdhbWVPdmVyID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZ2FtZSBvdmVyXCIpXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogZGlzYWJsZSBldmVyeXRoaW5nLCBsZXQgdGhlIHBsYXllcnMgZGVjaWRlIHdldGhlciByZXNldCB0aGUgZ2FtZSBvciBub3RcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICgkc2NvcGUuZ2FtZS5kZWFkUGxheWVycygpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIC8vd2l0aCBuZXcgY2FyZHMgJiBuZWVkIHRvIHJlc2h1ZmZsZVxuXG4gICAgICAgICAgICAgICAgLy8gYmVjYXVzZSB0aGUgZGVhZFBsYXllcnMoKSByZXR1cm5zIGEgMkQgYXJyYXksIHVzZSByZWR1Y2UgdG8gZmxhdHRlbiBpdFxuICAgICAgICAgICAgICAgIHZhciBkZWFkUGxheWVyVGlsZXMgPSAkc2NvcGUuZ2FtZS5kZWFkUGxheWVycygpLnJlZHVjZShmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYSA9IGEuY29uY2F0KGIpXG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgICRzY29wZS5nYW1lLmRlY2sgPSAkc2NvcGUuZ2FtZS5kZWNrLmNvbmNhdChkZWFkUGxheWVyVGlsZXMpO1xuICAgICAgICAgICAgICAgICRzY29wZS5nYW1lLmRlY2sgPSAkc2NvcGUuZ2FtZS5kZWNrLnNodWZmbGUoKTtcblxuICAgICAgICAgICAgICAgIC8vc2VuZCBmaXJlYmFzZSBhIG5ldyBtb3ZlXG4gICAgICAgICAgICAgICAgbW92ZXNBcnIuJGFkZCh7XG4gICAgICAgICAgICAgICAgICAgICd0eXBlJzogJ3VwZGF0ZURlY2snLFxuICAgICAgICAgICAgICAgICAgICAndXBkYXRlRGVjayc6ICRzY29wZS5nYW1lLmRlY2tcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgZGVjayBpcyBlbXB0eSAmIG5vIG9uZSBpcyBkcmFnb24sIHNldCBtZSBhcyBkcmFnb25cbiAgICAgICAgICAgIGlmICgkc2NvcGUuZ2FtZS5kZWNrLmxlbmd0aCA9PT0gMCAmJiAhJHNjb3BlLmRyYWdvbikge1xuICAgICAgICAgICAgICAgICRzY29wZS5kcmFnb24gPSAkc2NvcGUubWU7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJzZXQgZHJhZ29uIHRvIG1lXCIpXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCRzY29wZS5nYW1lLmRlY2subGVuZ3RoID09PSAwICYmICRzY29wZS5kcmFnb24pIHtcbiAgICAgICAgICAgICAgICBhd2FpdGluZ0RyYWdvbkhvbGRlcnMucHVzaCgkc2NvcGUubWUpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiSSdtIHdhaXRpbmcgZm9yIHRvIGJlIGEgZHJhZ29uXCIpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZ2l2ZSBtZSBhIHRpbGVcIilcbiAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJGxvYWRlZCgpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2ZpbmQgbWUgaW4gdGhlIGZpcmViYXNlIHBsYXllcnMgYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtZUlkeDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllcnMuZmluZChmdW5jdGlvbiAoZSwgaSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlLnVpZCA9PT0gJHNjb3BlLm1lLnVpZCkgbWVJZHggPSBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc2V0IGZpcmViYXNlIG1lIHRvIGxvY2FsIG1lXG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLnRpbGVzID0gJHNjb3BlLm1lLnRpbGVzLmNvbmNhdCgkc2NvcGUuZ2FtZS5kZWFsKDEpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZGVhbGVkIG9uZSB0aWxlIHRvIG1lIVwiKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy9zYXZlIGl0XG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJHNhdmUobWVJZHgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUubWUgPSBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHdoaWxlICgkc2NvcGUuZHJhZ29uICYmICRzY29wZS5nYW1lLmRlY2subGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5kcmFnb24udGlsZXMucHVzaCgkc2NvcGUuZ2FtZS5kZWFsKDEpKTtcbiAgICAgICAgICAgICAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyLiRsb2FkZWQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2ZpbmQgbWUgaW4gdGhlIGZpcmViYXNlIHBsYXllcnMgYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWVJZHg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVycy5maW5kKGZ1bmN0aW9uIChlLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlLnVpZCA9PT0gJHNjb3BlLmRyYWdvbi51aWQpIG1lSWR4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vc2V0IGZpcmViYXNlIG1lIHRvIGxvY2FsIG1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XSA9ICRzY29wZS5kcmFnb247XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3NhdmUgaXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJHNhdmUobWVJZHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRyYWdvbiA9ICRzY29wZS5hd2FpdGluZ0RyYWdvbkhvbGRlcnMuc2hpZnQoKSB8fCBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVE9ETzogc3RpbGwgbmVlZCB0byB3b3JrIG9uIHRoaXNcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50UGxheWVyID0gJHNjb3BlLmdhbWUuZ29Ub05leHRQbGF5ZXIoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibmV3IGN1cnIgcGxheWVyXCIsICRzY29wZS5jdXJyZW50UGxheWVyKVxuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgJHNjb3BlLmxlYXZlR2FtZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJpJ20gb3V0XCIpO1xuXG4gICAgICAgIGZpcmViYXNlUGxheWVyc0Fyci4kbG9hZGVkKClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgICAgICAgICAgICAgLy9maW5kIG1lIGluIHRoZSBmaXJlYmFzZSBwbGF5ZXJzIGFycmF5XG4gICAgICAgICAgICAgICAgdmFyIG1lSWR4O1xuXG4gICAgICAgICAgICAgICAgcGxheWVycy5maW5kKGZ1bmN0aW9uIChlLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlLnVpZCA9PT0gJHNjb3BlLm1lLnVpZCkgbWVJZHggPSBpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlIHRoZSBwbGF5ZXIgZnJvbSBmaXJlYmFzZVxuICAgICAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0Fyci4kcmVtb3ZlKGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0pO1xuICAgICAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIFRPRE86IG5lZWQgdG8gcmVtb3ZlIHRoaXMgZ2FtZSByb29tJ3MgbW92ZXMgZnJvbSBmaXJlYmFzZT9cbiAgICAkc2NvcGUucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIG1hcmtlcnNBcnIuJHJlbW92ZSgwKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlZikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlZCBhbGwgbWFya2Vyc1wiLCByZWYua2V5KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGRlY2tBcnIuJHJlbW92ZSgwKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlZikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlZCB0aGUgZGVja1wiLCByZWYua2V5KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIG1vdmVzQXJyLiRyZW1vdmUoKVxuICAgICAgICBvYmouJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciB0aWxlcyA9IGRhdGEudGlsZXM7XG4gICAgICAgICAgICB2YXIgZGVjayA9IG5ldyBEZWNrKHRpbGVzKS5zaHVmZmxlKCkudGlsZXM7XG4gICAgICAgICAgICB2YXIgaW5pdGlhbERlY2tSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoJHN0YXRlUGFyYW1zLmdhbWVOYW1lKS5jaGlsZCgnaW5pdGlhbERlY2snKTtcbiAgICAgICAgICAgICRmaXJlYmFzZUFycmF5KGluaXRpYWxEZWNrUmVmKS4kYWRkKGRlY2spO1xuICAgICAgICB9KTtcblxuXG5cbiAgICAgICAgdmFyIGluaXRpYWxNYXJrZXJzUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKCRzdGF0ZVBhcmFtcy5nYW1lTmFtZSkuY2hpbGQoJ2F2YWlsYWJsZU1hcmtlcnMnKTtcbiAgICAgICAgJGZpcmViYXNlQXJyYXkoaW5pdGlhbE1hcmtlcnNSZWYpLiRhZGQoW1wicmVkXCIsIFwib3JhbmdlXCIsIFwieWVsbG93XCIsIFwiZ3JlZW5cIiwgXCJhcXVhXCIsIFwiYmx1ZVwiLCBcIm5hdnlcIiwgXCJwdXJwbGVcIl0pO1xuXG5cbiAgICAgICAgdmFyIHBsYXllcnMgPSAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKTtcbiAgICAgICAgcGxheWVycy4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZGF0YVtpXS5jYW5QbGF5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBkYXRhW2ldLm1hcmtlciA9ICduJztcbiAgICAgICAgICAgICAgICBkYXRhW2ldLm5leHRTcGFjZSA9ICduJztcbiAgICAgICAgICAgICAgICBkYXRhW2ldLm5leHRTcGFjZVBvaW50c0luZGV4ID0gJ24nO1xuICAgICAgICAgICAgICAgIGRhdGFbaV0ucG9pbnQgPSAnbic7XG4gICAgICAgICAgICAgICAgZGF0YVtpXS50aWxlcyA9ICduJztcbiAgICAgICAgICAgICAgICBwbGF5ZXJzLiRzYXZlKGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUubWUpO1xuXG4gICAgfTtcblxuXG4gICAgJHNjb3BlLnN0YXJ0dG9wID0gW1xuICAgICAgICBbMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAxXSxcbiAgICAgICAgWzEsIDAsIDBdLFxuICAgICAgICBbMSwgMCwgMV0sXG4gICAgICAgIFsyLCAwLCAwXSxcbiAgICAgICAgWzIsIDAsIDFdLFxuICAgICAgICBbMywgMCwgMF0sXG4gICAgICAgIFszLCAwLCAxXSxcbiAgICAgICAgWzQsIDAsIDBdLFxuICAgICAgICBbNCwgMCwgMV0sXG4gICAgICAgIFs1LCAwLCAwXSxcbiAgICAgICAgWzUsIDAsIDFdXG4gICAgXTtcbiAgICAkc2NvcGUuc3RhcnRsZWZ0ID0gW1xuICAgICAgICBbMCwgMCwgN10sXG4gICAgICAgIFswLCAwLCA2XSxcbiAgICAgICAgWzAsIDEsIDddLFxuICAgICAgICBbMCwgMSwgNl0sXG4gICAgICAgIFswLCAyLCA3XSxcbiAgICAgICAgWzAsIDIsIDZdLFxuICAgICAgICBbMCwgMywgN10sXG4gICAgICAgIFswLCAzLCA2XSxcbiAgICAgICAgWzAsIDQsIDddLFxuICAgICAgICBbMCwgNCwgNl0sXG4gICAgICAgIFswLCA1LCA3XSxcbiAgICAgICAgWzAsIDUsIDZdXG4gICAgXTtcbiAgICAkc2NvcGUuc3RhcnRib3R0b20gPSBbXG4gICAgICAgIFswLCA1LCAwXSxcbiAgICAgICAgWzAsIDUsIDFdLFxuICAgICAgICBbMSwgNSwgMF0sXG4gICAgICAgIFsxLCA1LCAxXSxcbiAgICAgICAgWzIsIDUsIDBdLFxuICAgICAgICBbMiwgNSwgMV0sXG4gICAgICAgIFszLCA1LCAwXSxcbiAgICAgICAgWzMsIDUsIDFdLFxuICAgICAgICBbNCwgNSwgMF0sXG4gICAgICAgIFs0LCA1LCAxXSxcbiAgICAgICAgWzUsIDUsIDBdLFxuICAgICAgICBbNSwgNSwgMV1cbiAgICBdO1xuICAgICRzY29wZS5zdGFydHJpZ2h0ID0gW1xuICAgICAgICBbNSwgMCwgMl0sXG4gICAgICAgIFs1LCAwLCAzXSxcbiAgICAgICAgWzUsIDEsIDJdLFxuICAgICAgICBbNSwgMSwgM10sXG4gICAgICAgIFs1LCAyLCAyXSxcbiAgICAgICAgWzUsIDIsIDNdLFxuICAgICAgICBbNSwgMywgMl0sXG4gICAgICAgIFs1LCAzLCAzXSxcbiAgICAgICAgWzUsIDQsIDJdLFxuICAgICAgICBbNSwgNCwgM10sXG4gICAgICAgIFs1LCA1LCAyXSxcbiAgICAgICAgWzUsIDUsIDNdXG4gICAgXTtcbn0pO1xuIiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsb2dpbicsIHtcbiAgICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvYnJvd3Nlci9qcy9sb2dpbi9sb2dpbi5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2xvZ2luQ3RybCdcbiAgICB9KTtcbn0pO1xuXG50c3Vyby5jb250cm9sbGVyKCdsb2dpbkN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsICRmaXJlYmFzZUF1dGgsICRyb290U2NvcGUpIHtcbiAgICB2YXIgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcblxuICAgICRzY29wZS5sb2dJbldpdGhHb29nbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGF1dGguJHNpZ25JbldpdGhQb3B1cChcImdvb2dsZVwiKS50aGVuKGZ1bmN0aW9uIChhdXRoRGF0YSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJMb2dnZWQgaW4gYXM6XCIsIGF1dGhEYXRhKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuY3VycmVudFVzZXIgPSBhdXRoRGF0YTtcbiAgICAgICAgICAgICRzdGF0ZS5nbygncGlja0dhbWUnKTtcbiAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiQXV0aGVudGljYXRpb24gZmFpbGVkOlwiLCBlcnJvcik7XG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxufSk7XG4iLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2dhbWVsaXN0Jywge1xuICAgICAgICB1cmw6ICcvZ2FtZWxpc3QnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9icm93c2VyL2pzL2dhbWVsaXN0L2dhbWVsaXN0Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnZ2FtZUxpc3QnLFxuICAgIH0pO1xufSk7XG5cbnRzdXJvLmNvbnRyb2xsZXIoJ2dhbWVMaXN0JywgZnVuY3Rpb24gKCRzY29wZSwgZmlyZWJhc2VVcmwsICRmaXJlYmFzZU9iamVjdCwgJHN0YXRlLCAkZmlyZWJhc2VBdXRoLCAkZmlyZWJhc2VBcnJheSkge1xuICAgIC8vRm9yIHN5bmNocm9uaXppbmdHYW1lTGlzdC4uLlxuICAgIHZhciByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xuICAgIHZhciBvYmogPSAkZmlyZWJhc2VPYmplY3QocmVmKTtcblxuICAgIHZhciBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuICAgIHZhciBmaXJlYmFzZVVzZXIgPSBhdXRoLiRnZXRBdXRoKCk7XG5cbiAgICB2YXIgc3luY2hSZWYgPSByZWYuY2hpbGQoXCJnYW1lc1wiKTtcbiAgICB2YXIgc3luY2hyb25pemVkT2JqID0gJGZpcmViYXNlT2JqZWN0KHN5bmNoUmVmKTtcblxuICAgIC8vIFRoaXMgcmV0dXJucyBhIHByb21pc2UuLi55b3UgY2FuLnRoZW4oKSBhbmQgYXNzaWduIHZhbHVlIHRvICRzY29wZS52YXJpYWJsZVxuICAgIC8vIGdhbWVsaXN0IGlzIHdoYXRldmVyIHdlIGFyZSBjYWxsaW5nIGl0IGluIHRoZSBhbmd1bGFyIGh0bWwuXG4gICAgc3luY2hyb25pemVkT2JqLiRiaW5kVG8oJHNjb3BlLCBcImdhbWVsaXN0XCIpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBnYW1lbGlzdCA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiAkc2NvcGUuZ2FtZWxpc3QpIHtcbiAgICAgICAgICAgICAgICBnYW1lbGlzdC5wdXNoKFtpLCAkc2NvcGUuZ2FtZWxpc3RbaV1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRzY29wZS5nYW1lTmFtZXMgPSBnYW1lbGlzdC5zbGljZSgyKTtcbiAgICAgICAgfSk7XG5cblxuXG5cbiAgICAkc2NvcGUuam9pbiA9IGZ1bmN0aW9uIChnYW1lTmFtZSkge1xuICAgICAgICB2YXIgZ2FtZU5hbWVSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoZ2FtZU5hbWUpO1xuICAgICAgICB2YXIgcGxheWVyc1JlZiA9IGdhbWVOYW1lUmVmLmNoaWxkKCdwbGF5ZXJzJyk7XG5cbiAgICAgICAgZmlyZWJhc2UuYXV0aCgpLm9uQXV0aFN0YXRlQ2hhbmdlZChmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgdmFyIGZpcmViYXNlUGxheWVyc0FyciA9ICRmaXJlYmFzZUFycmF5KHBsYXllcnNSZWYpO1xuXG4gICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIEZCcGxheWVycyA9IGRhdGE7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghRkJwbGF5ZXJzLmZpbHRlcihmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwbGF5ZXIudWlkID09PSB1c2VyLnVpZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdQbGF5ZXIgPSBuZXcgUGxheWVyKHVzZXIudWlkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRmaXJlYmFzZUFycmF5KHBsYXllcnNSZWYpLiRhZGQobmV3UGxheWVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm8gdXNlciBpcyBzaWduZWQgaW4uXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIm5vdGhpbmdcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdnYW1lJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJnYW1lTmFtZVwiOiBnYW1lTmFtZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn0pO1xuIiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdwaWNrR2FtZScsIHtcbiAgICAgICAgdXJsOiAnL3BpY2tnYW1lJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvYnJvd3Nlci9qcy9waWNrR2FtZS9waWNrR2FtZS5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ3BpY2tHYW1lQ3RybCdcbiAgICB9KTtcbn0pO1xuXG50c3Vyby5jb250cm9sbGVyKCdwaWNrR2FtZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QpIHtcbiAgICB2YXIgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbiAgICB2YXIgb2JqID0gJGZpcmViYXNlT2JqZWN0KHJlZik7XG5cblxuICAgICRzY29wZS5jcmVhdGVHYW1lID0gZnVuY3Rpb24gKGdhbWVOYW1lKSB7XG4gICAgICAgIHZhciBnYW1lTmFtZVJlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZChnYW1lTmFtZSk7XG4gICAgICAgIHZhciBwbGF5ZXJzUmVmID0gZ2FtZU5hbWVSZWYuY2hpbGQoJ3BsYXllcnMnKTtcblxuICAgICAgICAkZmlyZWJhc2VBcnJheShnYW1lTmFtZVJlZikuJGFkZCh7XG4gICAgICAgICAgICBcImdhbWVOYW1lXCI6IGdhbWVOYW1lXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZpcmViYXNlLmF1dGgoKS5vbkF1dGhTdGF0ZUNoYW5nZWQoZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5ld1BsYXllciA9IG5ldyBQbGF5ZXIodXNlci51aWQpXG4gICAgICAgICAgICAgICAgJGZpcmViYXNlQXJyYXkocGxheWVyc1JlZikuJGFkZChuZXdQbGF5ZXIpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibm8gb25lIGxvZ2dlZCBpblwiKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIHZhciB0aWxlcyA9IFt7XG4gICAgICAgICAgICBpZDogMSxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzAxLnBuZz9hbHQ9bWVkaWEmdG9rZW49ZGMyZTU1M2ItZjRkYS00NDJlLTk3ZTgtZDBkODA4YzJkNWMwXCIsXG4gICAgICAgICAgICBwYXRoczogWzMsIDQsIDYsIDAsIDEsIDcsIDIsIDVdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDIsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8wMi5wbmc/YWx0PW1lZGlhJnRva2VuPWJiYjBiNTk2LTc0ZWEtNDlhOC05ZjZjLWI0MjYyN2NjZDg3M1wiLFxuICAgICAgICAgICAgcGF0aHM6IFsxLCAwLCA0LCA3LCAyLCA2LCA1LCAzXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAzLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMDMucG5nP2FsdD1tZWRpYSZ0b2tlbj00ZGQxZmY4NS0wMjA0LTQ4OTUtODk1Ny0zYjcwNzM1NTkxMTdcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMSwgMCwgNCwgNiwgMiwgNywgMywgNV0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogNCxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzA0LnBuZz9hbHQ9bWVkaWEmdG9rZW49OTBkZDJkZTgtOWM5OS00Y2I3LTg2ZmYtNzg2M2IwYTU2NDFjXCIsXG4gICAgICAgICAgICBwYXRoczogWzIsIDUsIDAsIDcsIDYsIDEsIDQsIDNdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDUsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8wNS5wbmc/YWx0PW1lZGlhJnRva2VuPTU5MTJhNDdiLTg1NGEtNDZkMC1iZmViLTAwNTkxM2QyNDE1OFwiLFxuICAgICAgICAgICAgcGF0aHM6IFs0LCAyLCAxLCA2LCAwLCA3LCAzLCA1XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiA2LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMDYucG5nP2FsdD1tZWRpYSZ0b2tlbj0wNTZiODkzOC02ZTFmLTQ4MWUtOWQzNC1iNmIyN2YyY2Q5ZTNcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMSwgMCwgNSwgNywgNiwgMiwgNCwgM10sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogNyxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzA3LnBuZz9hbHQ9bWVkaWEmdG9rZW49YjVkZGJhZjYtZjA2MS00MjA2LTlmOWItOTJiYzg2M2JiNDg0XCIsXG4gICAgICAgICAgICBwYXRoczogWzIsIDQsIDAsIDYsIDEsIDcsIDMsIDVdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDgsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8wOC5wbmc/YWx0PW1lZGlhJnRva2VuPThhZDYzNDBlLWY4YTUtNGZmMi1iZGFmLTBhODVlMmJiYzYzMFwiLFxuICAgICAgICAgICAgcGF0aHM6IFsyLCA1LCAwLCA2LCA3LCAxLCAzLCA0XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiA5LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMDkucG5nP2FsdD1tZWRpYSZ0b2tlbj02YTFhNjJiOC0xODcyLTQ2MGQtOTI3Ni01YjQ4ZjNhMzhhMzlcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMSwgMCwgNywgNiwgNSwgNCwgMywgMl0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMTAsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8xMC5wbmc/YWx0PW1lZGlhJnRva2VuPTYzZThhMjE0LTNhZWYtNGRhNi04ODI3LTEzM2RiOWI5YjRlZlwiLFxuICAgICAgICAgICAgcGF0aHM6IFs0LCA1LCA2LCA3LCAwLCAxLCAyLCAzXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAxMSxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzExLnBuZz9hbHQ9bWVkaWEmdG9rZW49NTc4Njk2ODItNWM0ZC00ZjgwLTgzMmItZWJjNDYwODBhNGM1XCIsXG4gICAgICAgICAgICBwYXRoczogWzcsIDIsIDEsIDQsIDMsIDYsIDUsIDBdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDEyLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMTIucG5nP2FsdD1tZWRpYSZ0b2tlbj1lNTA1ZjIyYi05ZDUyLTQ5ZDEtOWI3MS00ZGNkY2U1Njg1M2ZcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMiwgNywgMCwgNSwgNiwgMywgNCwgMV0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMTMsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8xMy5wbmc/YWx0PW1lZGlhJnRva2VuPWYwYWM0ZWI5LTdiODEtNGRmYi1iMGNiLWFlY2MwMjkwYWUzYlwiLFxuICAgICAgICAgICAgcGF0aHM6IFs1LCA0LCA3LCA2LCAxLCAwLCAzLCAyXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAxNCxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzE0LnBuZz9hbHQ9bWVkaWEmdG9rZW49N2ZmMjRlNzctNjczNy00MTJiLWJhY2QtNDE0YmY0ZjY0M2M5XCIsXG4gICAgICAgICAgICBwYXRoczogWzMsIDIsIDEsIDAsIDcsIDYsIDUsIDRdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDE1LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMTUucG5nP2FsdD1tZWRpYSZ0b2tlbj1hMWFkN2MwYy04ZTZkLTQ0NzQtOWZkZS0wYjQ3ZDA0MTA0YzFcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMSwgMCwgNywgNCwgMywgNiwgNSwgMl0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMTYsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8xNi5wbmc/YWx0PW1lZGlhJnRva2VuPWUzM2IzY2Q5LTkyMDctNGNiOC05NjliLTVjZTYwZjkxNTM3ZlwiLFxuICAgICAgICAgICAgcGF0aHM6IFsxLCAwLCA1LCA2LCA3LCAyLCAzLCA0XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAxNyxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzE3LnBuZz9hbHQ9bWVkaWEmdG9rZW49MjAwZDZjYWItZGYzMS00OWI4LWJhOTUtYWQ1MmQ3Yzc5ZThiXCIsXG4gICAgICAgICAgICBwYXRoczogWzMsIDUsIDYsIDAsIDcsIDEsIDIsIDRdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDE4LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMTgucG5nP2FsdD1tZWRpYSZ0b2tlbj0xYzdiZjUxNS05OTQxLTQ3Y2QtOWVjYi00NzlkNjZmMjYxMmJcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMiwgNywgMCwgNCwgMywgNiwgNSwgMV0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMTksXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8xOS5wbmc/YWx0PW1lZGlhJnRva2VuPWY1Y2M2MjVjLTczYzAtNDlmNy05MzJjLTBlNjVkMzFkMmJmN1wiLFxuICAgICAgICAgICAgcGF0aHM6IFs0LCAzLCA2LCAxLCAwLCA3LCAyLCA1XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAyMCxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzIwLnBuZz9hbHQ9bWVkaWEmdG9rZW49NWI5YjQ0NTUtMmMwOS00MWU0LWEyZjItZjYwYmVkYzQ3MGFkXCIsXG4gICAgICAgICAgICBwYXRoczogWzIsIDYsIDAsIDQsIDMsIDcsIDEsIDVdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDIxLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMjEucG5nP2FsdD1tZWRpYSZ0b2tlbj02ZDU2NDZkNy1iMWIxLTQ5YzktYmY4Ny0wMGJlOWU3YjhlMmNcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMiwgMywgMCwgMSwgNywgNiwgNSwgNF0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMjIsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8yMi5wbmc/YWx0PW1lZGlhJnRva2VuPTVhNTg3MzU5LTgzMWMtNGRjZC1hOWM1LWU3MDg1YzVhMzA3OVwiLFxuICAgICAgICAgICAgcGF0aHM6IFsyLCA2LCAwLCA1LCA3LCAzLCAxLCA0XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAyMyxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzIzLnBuZz9hbHQ9bWVkaWEmdG9rZW49NGNiOTc1MGItMGY1MC00MjlkLTkzNjctMTcwYjA4NTVjNmM0XCIsXG4gICAgICAgICAgICBwYXRoczogWzEsIDAsIDYsIDQsIDMsIDcsIDIsIDVdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDI0LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMjQucG5nP2FsdD1tZWRpYSZ0b2tlbj1hODBiN2Y1Yi1jNTcyLTQ0MzAtYWI4YS0zZDM2NTZlNGM2NDNcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMywgNCwgNywgMCwgMSwgNiwgNSwgMl0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMjUsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8yNS5wbmc/YWx0PW1lZGlhJnRva2VuPTliOGU4NTNkLTk2MmItNGQzMi1iNjc5LTYyMmU4YWU3YmU2YVwiLFxuICAgICAgICAgICAgcGF0aHM6IFsxLCAwLCAzLCAyLCA3LCA2LCA1LCA0XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAyNixcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzI2LnBuZz9hbHQ9bWVkaWEmdG9rZW49ZDg0Y2I3ZDMtNGJkNS00YTE3LThiN2EtNmRmODU3OTc1YzQ1XCIsXG4gICAgICAgICAgICBwYXRoczogWzEsIDAsIDYsIDcsIDUsIDQsIDIsIDNdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDI3LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMjcucG5nP2FsdD1tZWRpYSZ0b2tlbj1kMGVhZjYzMS04YTBlLTRhYTktOGRkMi03NzhlOWJlMWZlYzZcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMiwgNCwgMCwgNywgMSwgNiwgNSwgM10sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMjgsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8yOC5wbmc/YWx0PW1lZGlhJnRva2VuPWVlNDJjYzExLTE5ZDItNDQ3Ni04ODdiLTdhMjk4MTc0MzBmY1wiLFxuICAgICAgICAgICAgcGF0aHM6IFs0LCAyLCAxLCA3LCAwLCA2LCA1LCAzXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAyOSxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzI5LnBuZz9hbHQ9bWVkaWEmdG9rZW49YTYwNzY2YTUtNWUwYy00OWFkLTkyNDAtMjBiMWQ1MzlmYTJmXCIsXG4gICAgICAgICAgICBwYXRoczogWzEsIDAsIDMsIDIsIDUsIDQsIDcsIDZdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDMwLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMzAucG5nP2FsdD1tZWRpYSZ0b2tlbj1kZWEyNjgwOC1kNDlkLTQzYjAtYjgxYy0xNzRjMWUwOThjMWVcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMiwgMywgMCwgMSwgNiwgNywgNCwgNV0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMzEsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8zMS5wbmc/YWx0PW1lZGlhJnRva2VuPTRjYjllZGQ3LTk1YWItNGUyZi1hZWRhLWQyNTFmNzAxNWEwZFwiLFxuICAgICAgICAgICAgcGF0aHM6IFszLCA2LCA1LCAwLCA3LCAyLCAxLCA0XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAzMixcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzMyLnBuZz9hbHQ9bWVkaWEmdG9rZW49NGYxOTc4OGYtYWQ4NS00ZTZmLTgyYWMtN2ZlZjRjOGYwNDE5XCIsXG4gICAgICAgICAgICBwYXRoczogWzEsIDAsIDYsIDUsIDcsIDMsIDIsIDRdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDMzLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi90aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbS9vL3RzdXJvLXRpbGVfMzMucG5nP2FsdD1tZWRpYSZ0b2tlbj0wOTE0MDI4ZC1lYTI1LTQ2MTMtODJmNi1lYWI1NzRlNjlmNzBcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMSwgMCwgMywgMiwgNiwgNywgNCwgNV0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMzQsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJodHRwczovL2ZpcmViYXNlc3RvcmFnZS5nb29nbGVhcGlzLmNvbS92MC9iL3RoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tL28vdHN1cm8tdGlsZV8zNC5wbmc/YWx0PW1lZGlhJnRva2VuPTM3MTRlODdhLTk0MmUtNDM2ZS1hZTViLWJjMGEyM2RlMzNkMVwiLFxuICAgICAgICAgICAgcGF0aHM6IFs0LCA1LCA3LCA2LCAwLCAxLCAzLCAyXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAzNSxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vZmlyZWJhc2VzdG9yYWdlLmdvb2dsZWFwaXMuY29tL3YwL2IvdGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb20vby90c3Vyby10aWxlXzM1LnBuZz9hbHQ9bWVkaWEmdG9rZW49YWE5ZGRhOTctZWRlZS00NzJhLThiMjQtOGJiMGI2OWRmYTlhXCIsXG4gICAgICAgICAgICBwYXRoczogWzEsIDAsIDcsIDUsIDYsIDMsIDQsIDJdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfV07XG5cbiAgICAgICAgdmFyIGRlY2sgPSBuZXcgRGVjayh0aWxlcykuc2h1ZmZsZSgpLnRpbGVzO1xuICAgICAgICB2YXIgZGVja1JlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZChnYW1lTmFtZSkuY2hpbGQoJ2RlY2snKTtcbiAgICAgICAgJGZpcmViYXNlQXJyYXkoZGVja1JlZikuJGFkZChkZWNrKTtcblxuICAgICAgICAvLyB2YXIgYm9hcmRSZWYgPSBnYW1lTmFtZVJlZi5jaGlsZCgnYm9hcmQnKTtcbiAgICAgICAgLy8gdmFyIGJvYXJkQXJyID0gJGZpcmViYXNlQXJyYXkoYm9hcmRSZWYpO1xuICAgICAgICAvLyBib2FyZEFyci4kYWRkKCRzY29wZS5nYW1lLmJvYXJkKTtcblxuXG4gICAgICAgIHZhciBpbml0aWFsTWFya2Vyc1JlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZChnYW1lTmFtZSkuY2hpbGQoJ2F2YWlsYWJsZU1hcmtlcnMnKTtcbiAgICAgICAgJGZpcmViYXNlQXJyYXkoaW5pdGlhbE1hcmtlcnNSZWYpLiRhZGQoW1wicmVkXCIsIFwib3JhbmdlXCIsIFwieWVsbG93XCIsIFwiZ3JlZW5cIiwgXCJhcXVhXCIsIFwiYmx1ZVwiLCBcIm5hdnlcIiwgXCJwdXJwbGVcIl0pO1xuXG5cbiAgICAgICAgJHN0YXRlLmdvKCdnYW1lJywge1xuICAgICAgICAgICAgXCJnYW1lTmFtZVwiOiBnYW1lTmFtZVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmdvVG9HYW1lTGlzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHN0YXRlLmdvKCdnYW1lbGlzdCcpO1xuICAgIH07XG59KTtcbiIsIid1c2Ugc3RyaWN0J1xuXG5mdW5jdGlvbiBQbGF5ZXIodWlkKSB7XG4gICAgLy8gVE9ETzogZ2V0IHVpZCBmcm9tIGZpcmViYXNlIGF1dGhcbiAgICB0aGlzLnVpZCA9IHVpZDtcblxuICAgIHRoaXMubWFya2VyID0gXCJuXCI7XG5cbiAgICAvLyBzaG91bGQgYmUgYSBQb2ludCBvYmplY3RcbiAgICB0aGlzLnBvaW50ID0gXCJuXCI7XG5cbiAgICAvLyBbeCwgeV1cbiAgICAvLyBkZXBlbmRzIG9uIHRoZSBhbmd1bGFyIFNwYWNlLngsIFNwYWNlLnlcbiAgICB0aGlzLm5leHRTcGFjZSA9IFwiblwiO1xuXG4gICAgLy8gaW4gZWFjaCBTcGFjZS5wb2ludHMgYXJyYXksIGZpbmQgdGhpcyBzcGVjaWZpYyBwb2ludCBhbmQgZ2V0IHRoZSBwb3NpdGlvbiAoaW50ZWdlcikgaW5zaWRlIHRoaXMgc3BhY2UuXG4gICAgdGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9IFwiblwiO1xuXG4gICAgLy8gbWF4aW11biAzIHRpbGVzXG4gICAgdGhpcy50aWxlcyA9ICduJztcblxuICAgIC8vIGlmIGEgcGxheWVyIGRpZXMsIGl0IHdpbGwgYmUgY2hhbmdlZCB0byBmYWxzZVxuICAgIHRoaXMuY2FuUGxheSA9IHRydWU7XG59XG5QbGF5ZXIucHJvdG90eXBlLmhpID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkhJXCIpXG4gICAgfVxuICAgIC8vIG5lZWQgdG8gdXNlIHNlbGYgYmVjdXNlIHdlIG5lZWQgdG8gY2hhbmdlICRzY29wZS5tZSBvbiBnYW1lQ3RybCBhbmQgc2VuZCB0byBmaXJlYmFzZVxuUGxheWVyLnByb3RvdHlwZS5wbGFjZU1hcmtlciA9IGZ1bmN0aW9uIChib2FyZCwgcG9pbnQsIHNlbGYpIHtcbiAgICAvLyBwb2ludCBsb29rcyBsaWtlIFt4LCB5LCBwb2ludHNJbmRleF0gaW4gdGhlIHNwYWNlXG4gICAgdmFyIHggPSBwb2ludFswXTtcbiAgICB2YXIgeSA9IHBvaW50WzFdO1xuICAgIHZhciBwb2ludHNJbmRleCA9IHBvaW50WzJdO1xuXG4gICAgc2VsZi5wb2ludCA9IGJvYXJkW3ldW3hdLnBvaW50c1twb2ludHNJbmRleF07XG4gICAgc2VsZi5wb2ludC50cmF2ZWxsZWQgPSB0cnVlO1xuXG4gICAgLy9beCwgeV0gZnJvbSB0aGUgcG9pbnRcbiAgICBzZWxmLm5leHRTcGFjZSA9IGJvYXJkW3ldW3hdO1xuXG4gICAgLy8gaW4gZWFjaCBTcGFjZS5wb2ludHMgYXJyYXksIGZpbmQgdGhpcyBzcGVjaWZpYyBwb2ludCBhbmQgZ2V0IHRoZSBwb3NpdGlvbiAoaW50ZWdlcikgaW5zaWRlIHRoaXMgc3BhY2UuXG4gICAgc2VsZi5uZXh0U3BhY2VQb2ludHNJbmRleCA9IHNlbGYubmV4dFNwYWNlLnBvaW50cy5pbmRleE9mKHNlbGYucG9pbnQpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5uZXdTcGFjZSA9IGZ1bmN0aW9uIChib2FyZCwgb2xkU3BhY2UsIHNlbGYpIHtcbiAgICBpZiAoc2VsZi5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gMCB8fCBzZWxmLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSAxKSB7XG4gICAgICAgIHJldHVybiBib2FyZFtvbGRTcGFjZS55IC0gMV1bb2xkU3BhY2UueF07XG4gICAgfSBlbHNlIGlmIChzZWxmLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSAyIHx8IHNlbGYubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDMpIHtcbiAgICAgICAgcmV0dXJuIGJvYXJkW29sZFNwYWNlLnldW29sZFNwYWNlLnggKyAxXTtcbiAgICB9IGVsc2UgaWYgKHNlbGYubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDQgfHwgc2VsZi5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gNSkge1xuICAgICAgICByZXR1cm4gYm9hcmRbb2xkU3BhY2UueSArIDFdW29sZFNwYWNlLnhdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBib2FyZFtvbGRTcGFjZS55XVtvbGRTcGFjZS54IC0gMV07XG4gICAgfVxufTtcblxuXG5QbGF5ZXIucHJvdG90eXBlLm1vdmVUbyA9IGZ1bmN0aW9uIChwb2ludGVyKSB7XG4gICAgLy9hbHdheXMgYmUgcmV0dXJuaW5nIDAgb3IgMSBwb2ludCBpbiB0aGUgYXJyYXlcbiAgICBsZXQgbmV4dFBvaW50ID0gcG9pbnRlci5uZWlnaGJvcnMuZmlsdGVyKGZ1bmN0aW9uIChuZWlnaGJvcikge1xuICAgICAgICByZXR1cm4gIW5laWdoYm9yLnRyYXZlbGxlZCAmJiBuZWlnaGJvciAhPT0gXCJuXCI7XG4gICAgfSlbMF07XG4gICAgcmV0dXJuIG5leHRQb2ludDtcbn07XG5cblxuUGxheWVyLnByb3RvdHlwZS5jaGVja0RlYXRoID0gZnVuY3Rpb24gKHNlbGYpIHtcbiAgICB2YXIgYWxsVHJhdmVsbGVkID0gc2VsZi5wb2ludC5uZWlnaGJvcnMuZmlsdGVyKGZ1bmN0aW9uIChuZWlnaGJvcikge1xuICAgICAgICByZXR1cm4gbmVpZ2hib3IudHJhdmVsbGVkO1xuICAgIH0pO1xuXG4gICAgaWYgKHNlbGYucG9pbnQuZWRnZSB8fCBhbGxUcmF2ZWxsZWQubGVuZ3RoID09PSAyKSBzZWxmLmNhblBsYXkgPSBmYWxzZTtcbn07XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
