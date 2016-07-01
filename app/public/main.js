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
    this.image = "n";
    this.points = [null, null, null, null, null, null, null, null];
    this.tileUrl = "n";
    this.tileId = "n";

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

        this.currPlayer; //index of the currentPlayer in the turnOrderArray
        this.turnOrderArray = []; //holds all the players still on the board.
        this.dragon = ""; // Player.Marker
        this.moves;
    }

    _createClass(Game, [{
        key: 'getCurrentPlayer',
        value: function getCurrentPlayer() {
            if (this.currPlayer === -1) return;
            return this.turnOrderArray[this.currPlayer];
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
            return getCanPlay().length <= 1;
        }

        //to be called at the end of a turn to set the currPlayer to the next eligible player in the turnOrderArray

    }, {
        key: 'goToNextPlayer',
        value: function goToNextPlayer() {
            if (getCanPlay(this.turnOrderArray).length > 1) {
                var newIdx = this.currPlayer + 1;
                while (!this.turnOrderArray[newIdx % 8].canPlay) {
                    newIdx++;
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

        //restart the game

    }, {
        key: 'reset',
        value: function reset() {
            var _this = this;

            this.players.forEach(function (player) {
                //retrieve all tiles
                //return player's tiles to the deck and shuffle
                _this.deck.reload(player.tiles).shuffle();
                player.tiles = [];
                //reset all players playability
                player.canPlay = true;
            });
        }
    }]);

    return Game;
}();

/////END OF GAME CLASS/////

//get Eligible players


var getCanPlay = function getCanPlay(players) {
    return players.filter(function (player) {
        return player.canPlay;
    });
};

tsuro.config(function ($stateProvider) {
    $stateProvider.state('game', {
        url: '/game/:gameName',
        templateUrl: '/browser/js/game/game.html',
        controller: 'gameCtrl'
    });
});

tsuro.controller('gameCtrl', function ($scope, $firebaseAuth, firebaseUrl, $stateParams, $firebaseObject, $firebaseArray) {
    $scope.tile = {
        imageUrl: "",
        paths: [3, 4, 6, 0, 1, 7, 2, 5],
        rotation: 0
    };

    var ref = firebase.database().ref();
    var obj = $firebaseObject(ref);
    var gameRef = ref.child('games').child($stateParams.gameName);

    var deckRef = gameRef.child('deck');
    var playersRef = gameRef.child('players');
    var markersRef = gameRef.child('availableMarkers');
    var deckArr = $firebaseArray(deckRef);
    var firebasePlayersArr = $firebaseArray(playersRef);
    var movesRef = gameRef.child('moves');
    var movesArr = $firebaseArray(movesRef);
    var player = Object.create(Player.prototype);

    /****************
    INITIALIZING GAME
    ****************/

    //new local game with game name defined by url
    $scope.game = new Game($stateParams.gameName);

    //when the deck is loaded...
    deckArr.$loaded().then(function (data) {
        // $scope.game.deck = data[0];
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

    var markersArr = $firebaseArray(markersRef); //store markers array

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
                var me = players.find(function (player) {
                    return player.uid === user.uid;
                });

                if (me) {
                    $scope.me = me;
                }
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

    //Have player pick their start point
    $scope.placeMarker = function (board, point) {
        //place my marker
        player.placeMarker(board, point, $scope.me);
        $scope.me.tiles = $scope.game.deal(3); //deal me three cards
        console.log($scope.me.tiles);
        //when the firebase players are loaded....
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

        var firebasePlayersArr = $firebaseArray(playersRef);
        firebasePlayersArr.$loaded().then(function (players) {
            var meIdx;
            players.find(function (e, i) {
                if (e.$id === $scope.me.$id) meIdx = i;
            });

            player.placeTile(tile, firebasePlayersArr[meIdx]);

            for (var i = 0; i < tile.paths.length; i++) {
                if (firebasePlayersArr[meIdx].nextSpace.points[i].neighbors[0] === "n") {
                    firebasePlayersArr[meIdx].nextSpace.points[i].neighbors.splice(0, 1);
                }
                firebasePlayersArr[meIdx].nextSpace.points[i].neighbors.push(firebasePlayersArr[meIdx].nextSpace.points[tile.paths[i]]);
                firebasePlayersArr.$save(meIdx);
            }

            firebasePlayersArr[meIdx].point = firebasePlayersArr[meIdx].nextSpace.points[firebasePlayersArr[meIdx].nextSpacePointsIndex];
            firebasePlayersArr.$save(meIdx);
        });

        // CMT: this should send the rotated tile to firebase
        movesArr.$add({
            'type': 'placeTile',
            'tile': tile,
            'playerUid': $scope.me.uid
        });

        firebasePlayersArr.$loaded().then(function (players) {
            players.forEach(function (p) {
                var movable = player.moveTo(p.point);
                var pIdx = players.indexOf(p);

                while (movable) {
                    p.point.travelled = true;
                    p.point = movable;

                    console.log("p nextSpace", p.nextSpace);
                    console.log("p.point.spaces", p.point.spaces);
                    var newNextSpaceInfo = p.point.spaces.filter(function (space) {
                        return space.x !== p.nextSpace.x || space.y !== p.nextSpace.y;
                    })[0];

                    var oldSpace = p.nextSpace;
                    var newSpace = $scope.game.board[newNextSpaceInfo.y][newNextSpaceInfo.x];
                    p.nextSpace = newSpace;

                    firebasePlayersArr.$save(pIdx);
                    //         // player.checkDeath(p);
                    movable = player.moveTo(p.point);
                }
            });
        });

        // if ($scope.game.checkOver()) {
        //     // TODO: need to tell the player she won
        //     $scope.winner = $scope.game.getCanPlay()[0];
        //     $scope.gameOver = true;
        // } else {
        //     // If deck is empty & no one is dragon, set me as dragon
        //     if ($scope.game.deck.length === 0 && !$scope.dragon) {
        //         $scope.dragon = $scope.me;
        //     } else if ($scope.game.deck.length === 0 && $scope.dragon) {
        //         awaitingDragonHolders.push($scope.me);
        //     } else {
        //         // CMT: draw one tile and push it to the player.tiles array
        //         $scope.me.tiles.push($scope.game.deck.deal(1));
        //         //if dead players, then push their cards back to the deck & reshuffle
        //         if ($scope.game.deadPlayers().length) {
        //             //with new cards & need to reshuffle
        //             $scope.game.deadPlayers().forEach(function (deadPlayerTiles) {
        //                 deadPlayerTiles.forEach(function (tile) {
        //                     $scope.game.deck.push(tile);
        //                 });
        //             });
        //             $scope.game.deck = $scope.game.deck.shuffle();
        //             //send firebase a new move
        //             gameRef.child('moves').push({
        //                 'type': 'updateDeck',
        //                 'updateDeck': $scope.game.deck
        //             });
        //             if ($scope.dragon) {
        //                 $scope.dragon.tiles.push($scope.game.deck.deal(1));
        //                 $scope.dragon = null;
        //                 //NEED TO DISCUSS: Might need to modify this if we want to use up the cards and give each awaiting players' up to 3 cards
        //                 while ($scope.game.deck.length && $scope.awaitingDragonHolders.length) {
        //                     $scope.awaitingDragonHolders.shift().tiles.push($scope.game.deck.deal(1));
        //                 };
        //                 if ($scope.awaitingDragonHolders.length) {
        //                     $scope.dragon = $scope.awaitingDragonHolders.shift();
        //                 }
        //             };
        //         }
        //
        //     }
        //     $scope.game.goToNextPlayer();
        // }
    };

    // TODO: firebase game.players slice $scope.player out
    $scope.leaveGame;

    // TODO: need to remove this game room's moves from firebase?
    $scope.reset = function () {
        markersArr.$remove(0).then(function (ref) {
            console.log("removed all markers", ref.key);
        });

        deckArr.$remove(0).then(function (ref) {
            console.log("removed the deck", ref.key);
        });

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
        var deckRef = ref.child('games').child(gameName).child('deck');
        $firebaseArray(deckRef).$add(deck);

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

// need to use self becuse we need to change $scope.me on gameCtrl and send to firebase
Player.prototype.placeTile = function (tile, self) {
    self.tiles = self.tiles.filter(function (t) {
        return t.id !== tile.id;
    });

    self.nextSpace.tileUrl = tile.imageUrl;
};

Player.prototype.moveTo = function (pointer) {
    //always be returning 0 or 1 point in the array
    var nextPoint = pointer.neighbors.filter(function (neighbor) {
        return !neighbor.travelled && neighbor !== "n";
    })[0];
    return nextPoint;
};

// TODO: not sure how to make this keep moving with players instead of self
// Player.prototype.keepMoving = function (self) {
//     let movable = self.moveTo(self.point);
//     while (movable) {
//         self.point.travelled = true;
//         self.point = self.moveTo(self.point);
//         let oldSpace = self.nextSpace;
//         let newSpace = newSpace(oldSpace);
//         self.nextSpace = newSpace;
//         self.nextSpacePointsIndex = self.nextSpace.points.indexOf(self.point);
//         self.checkDeath();
//         movable = self.moveTo(self.point);
//     }
// };

Player.prototype.checkDeath = function (self) {
    var allTravelled = self.point.neighbors.filter(function (neighbor) {
        return neighbor.travelled;
    });

    if (self.point.edge || allTravelled.length === 2) self.die();
};

Player.prototype.die = function () {
    this.canPlay = false;
    // TODO: need to send an alert or message to the player who just died.
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImdhbWUvYm9hcmQuanMiLCJnYW1lL2RlY2suanMiLCJnYW1lL2dhbWUuY29udHJ1Y3Rvci5qcyIsImdhbWUvZ2FtZS5qcyIsImxvZ2luL2xvZ2luLmpzIiwiZ2FtZWxpc3QvZ2FtZWxpc3QuanMiLCJwaWNrR2FtZS9waWNrR2FtZS5qcyIsInBsYXllci9wbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBQSxRQUFBLFFBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTs7QUFFQSxNQUFBLE1BQUEsQ0FBQSxZQUFBO0FBQ0EsUUFBQSxTQUFBO0FBQ0EsZ0JBQUEseUNBREE7QUFFQSxvQkFBQSxzQ0FGQTtBQUdBLHFCQUFBLDZDQUhBO0FBSUEsdUJBQUE7QUFKQSxLQUFBO0FBTUEsYUFBQSxhQUFBLENBQUEsTUFBQTtBQUNBLENBUkE7O0FBVUEsTUFBQSxRQUFBLENBQUEsYUFBQSxFQUFBLDRDQUFBOztBQUVBLE1BQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQTtBQUNBLHVCQUFBLFNBQUEsQ0FBQSxHQUFBO0FBQ0EsQ0FGQTs7QUNkQSxTQUFBLEtBQUEsR0FBQTtBQUNBLFNBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQTs7QUFFQSxNQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBO0FBQ0E7QUFDQSxXQUFBLEtBQUEsS0FBQTtBQUNBLENBUkE7O0FBVUEsU0FBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEVBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLFNBQUEsS0FBQSxHQUFBLEdBQUE7QUFDQSxTQUFBLE1BQUEsR0FBQSxDQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBQUE7QUFDQSxTQUFBLE9BQUEsR0FBQSxHQUFBO0FBQ0EsU0FBQSxNQUFBLEdBQUEsR0FBQTs7QUFFQSxTQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxzQkFBQTs7QUFFQSxZQUFBLElBQUEsQ0FBQSxFQUFBOztBQUNBLDRCQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLEM7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7QUFDQSxtQkFBQSxDQURBO0FBRUEsbUJBQUEsQ0FGQTtBQUdBLG1CQUFBO0FBSEEsYUFBQSxDQUFBLENBQUEsQ0FBQSxLQUtBO0FBQ0EscUJBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxNQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxNQUFBLENBQUEsYUFBQSxDQUFBO0FBQ0E7QUFDQSxTQVZBLE1BVUEsSUFBQSxJQUFBLENBQUEsRUFBQTs7QUFDQSw0QkFBQSxNQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLGdCQUFBLE1BQUEsQ0FBQSxFQUFBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtBQUNBLG1CQUFBLENBREE7QUFFQSxtQkFBQSxDQUZBO0FBR0EsbUJBQUE7QUFIQSxhQUFBLENBQUEsQ0FBQSxDQUFBLEtBS0E7QUFDQSxxQkFBQSxNQUFBLENBQUEsQ0FBQSxJQUFBLElBQUEsS0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0FBQ0EsdUJBQUEsQ0FEQTtBQUVBLHVCQUFBLENBRkE7QUFHQSx1QkFBQTtBQUhBLGlCQUFBLEVBSUE7QUFDQSx1QkFBQSxJQUFBLENBREE7QUFFQSx1QkFBQSxDQUZBO0FBR0EsdUJBQUE7QUFIQSxpQkFKQSxDQUFBLENBQUE7QUFTQTtBQUNBLFNBbEJBLE1Ba0JBLElBQUEsSUFBQSxDQUFBLEVBQUE7O0FBQ0EsNEJBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUE7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7QUFDQSxtQkFBQSxDQURBO0FBRUEsbUJBQUEsQ0FGQTtBQUdBLG1CQUFBO0FBSEEsYUFBQSxDQUFBLENBQUEsQ0FBQSxLQUtBO0FBQ0EscUJBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtBQUNBLHVCQUFBLENBREE7QUFFQSx1QkFBQSxDQUZBO0FBR0EsdUJBQUE7QUFIQSxpQkFBQSxFQUlBO0FBQ0EsdUJBQUEsQ0FEQTtBQUVBLHVCQUFBLElBQUEsQ0FGQTtBQUdBLHVCQUFBO0FBSEEsaUJBSkEsQ0FBQSxDQUFBO0FBU0E7QUFDQSxTQWxCQSxNQWtCQTs7QUFDQSw0QkFBQSxNQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxDO0FBQ0EsZ0JBQUEsTUFBQSxDQUFBLEVBQUEsS0FBQSxNQUFBLENBQUEsQ0FBQSxJQUFBLElBQUEsS0FBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0FBQ0EsbUJBQUEsQ0FEQTtBQUVBLG1CQUFBLENBRkE7QUFHQSxtQkFBQTtBQUhBLGFBQUEsQ0FBQSxDQUFBLENBQUEsS0FLQTtBQUNBLHFCQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsTUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFJQSxTQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQUEsS0FBQSxFQUFBO0FBQ0EsU0FBQSxJQUFBLEdBQUEsSUFBQTtBQUNBLFNBQUEsU0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsU0FBQSxTQUFBLEdBQUEsS0FBQTtBQUNBLFNBQUEsTUFBQSxHQUFBLEtBQUE7QUFDQTs7QUM1RkE7O0lBRUEsSTtBQUNBLGtCQUFBLEtBQUEsRUFBQTtBQUFBOztBQUNBLGFBQUEsS0FBQSxHQUFBLEtBQUE7QUFDQTs7OztrQ0FFQTtBQUNBLGlCQUFBLEtBQUEsR0FBQSxFQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBLG1CQUFBLElBQUE7QUFDQTs7O29DQUVBO0FBQ0EsbUJBQUEsS0FBQSxLQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7QUFDQTs7OzZCQUVBLEcsRUFBQTtBQUNBLG1CQUFBLEtBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxDQUFBO0FBQ0E7OzsrQkFFQSxLLEVBQUE7QUFDQSxpQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLEtBQUE7QUFDQSxtQkFBQSxJQUFBO0FBQ0E7Ozs7OztBQ3ZCQTs7OztJQUlBLEk7QUFDQSxrQkFBQSxJQUFBLEVBQUE7QUFBQTs7QUFDQSxhQUFBLElBQUEsR0FBQSxJQUFBO0FBQ0EsYUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsS0FBQSxHQUFBLElBQUEsS0FBQSxHQUFBLFNBQUEsRUFBQTtBQUNBLGFBQUEsT0FBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLGdCQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsUUFBQSxFQUFBLFFBQUEsRUFBQSxPQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsUUFBQSxDQUFBOztBQUVBLGFBQUEsVUFBQSxDO0FBQ0EsYUFBQSxjQUFBLEdBQUEsRUFBQSxDO0FBQ0EsYUFBQSxNQUFBLEdBQUEsRUFBQSxDO0FBQ0EsYUFBQSxLQUFBO0FBQ0E7Ozs7MkNBRUE7QUFDQSxnQkFBQSxLQUFBLFVBQUEsS0FBQSxDQUFBLENBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsY0FBQSxDQUFBLEtBQUEsVUFBQSxDQUFBO0FBQ0E7Ozt5Q0FFQTtBQUNBLGlCQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxNQUFBO0FBQUEsdUJBQUEsT0FBQSxVQUFBLENBQUEsTUFBQSxDQUFBO0FBQUEsYUFBQTtBQUNBOzs7c0NBRUE7QUFDQSxnQkFBQSxtQkFBQSxFQUFBO0FBQ0EsaUJBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLG9CQUFBLENBQUEsT0FBQSxPQUFBLElBQUEsT0FBQSxLQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsRUFBQTtBQUNBLHFDQUFBLElBQUEsQ0FBQSxPQUFBLEtBQUE7QUFDQSxtQ0FBQSxJQUFBO0FBQ0E7QUFDQSxhQUxBO0FBTUEsbUJBQUEsZ0JBQUE7QUFDQTs7O29DQUVBO0FBQ0EsbUJBQUEsYUFBQSxNQUFBLElBQUEsQ0FBQTtBQUNBOzs7Ozs7eUNBR0E7QUFDQSxnQkFBQSxXQUFBLEtBQUEsY0FBQSxFQUFBLE1BQUEsR0FBQSxDQUFBLEVBQUE7QUFDQSxvQkFBQSxTQUFBLEtBQUEsVUFBQSxHQUFBLENBQUE7QUFDQSx1QkFBQSxDQUFBLEtBQUEsY0FBQSxDQUFBLFNBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQTtBQUNBO0FBQ0E7QUFDQSxxQkFBQSxVQUFBLEdBQUEsTUFBQTtBQUNBLGFBTkEsTUFNQTtBQUNBLHFCQUFBLFVBQUEsR0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLG1CQUFBLEtBQUEsZ0JBQUEsRUFBQTtBQUNBOzs7NkJBRUEsRyxFQUFBO0FBQ0EsZ0JBQUEsUUFBQSxFQUFBO0FBQ0EsaUJBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxJQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxvQkFBQSxPQUFBLEtBQUEsSUFBQSxDQUFBLENBQUEsRUFBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLHFCQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLDRCQUFBLEdBQUEsQ0FBQSxlQUFBO0FBQ0EsaUJBRkE7QUFHQSx3QkFBQSxNQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSx3QkFBQSxHQUFBLENBQUEsS0FBQTtBQUNBO0FBQ0EsbUJBQUEsS0FBQTtBQUNBOzs7Ozs7Z0NBR0E7QUFBQTs7QUFDQSxpQkFBQSxPQUFBLENBQUEsT0FBQSxDQUFBLGtCQUFBOzs7QUFHQSxzQkFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsS0FBQSxFQUFBLE9BQUE7QUFDQSx1QkFBQSxLQUFBLEdBQUEsRUFBQTs7QUFFQSx1QkFBQSxPQUFBLEdBQUEsSUFBQTtBQUNBLGFBUEE7QUFRQTs7Ozs7Ozs7Ozs7QUFPQSxJQUFBLGFBQUEsU0FBQSxVQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsV0FBQSxRQUFBLE1BQUEsQ0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGVBQUEsT0FBQSxPQUFBO0FBQ0EsS0FGQSxDQUFBO0FBR0EsQ0FKQTs7QUN0RkEsTUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsYUFBQSxpQkFEQTtBQUVBLHFCQUFBLDRCQUZBO0FBR0Esb0JBQUE7QUFIQSxLQUFBO0FBS0EsQ0FOQTs7QUFRQSxNQUFBLFVBQUEsQ0FBQSxVQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQSxZQUFBLEVBQUEsZUFBQSxFQUFBLGNBQUEsRUFBQTtBQUNBLFdBQUEsSUFBQSxHQUFBO0FBQ0Esa0JBQUEsRUFEQTtBQUVBLGVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBO0FBR0Esa0JBQUE7QUFIQSxLQUFBOztBQU9BLFFBQUEsTUFBQSxTQUFBLFFBQUEsR0FBQSxHQUFBLEVBQUE7QUFDQSxRQUFBLE1BQUEsZ0JBQUEsR0FBQSxDQUFBO0FBQ0EsUUFBQSxVQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxLQUFBLENBQUEsYUFBQSxRQUFBLENBQUE7O0FBRUEsUUFBQSxVQUFBLFFBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQTtBQUNBLFFBQUEsYUFBQSxRQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUE7QUFDQSxRQUFBLGFBQUEsUUFBQSxLQUFBLENBQUEsa0JBQUEsQ0FBQTtBQUNBLFFBQUEsVUFBQSxlQUFBLE9BQUEsQ0FBQTtBQUNBLFFBQUEscUJBQUEsZUFBQSxVQUFBLENBQUE7QUFDQSxRQUFBLFdBQUEsUUFBQSxLQUFBLENBQUEsT0FBQSxDQUFBO0FBQ0EsUUFBQSxXQUFBLGVBQUEsUUFBQSxDQUFBO0FBQ0EsUUFBQSxTQUFBLE9BQUEsTUFBQSxDQUFBLE9BQUEsU0FBQSxDQUFBOzs7Ozs7O0FBT0EsV0FBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsYUFBQSxRQUFBLENBQUE7OztBQUdBLFlBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTs7QUFFQSxlQUFBLElBQUEsQ0FBQSxJQUFBLEdBQUEsT0FBQSxDOzs7QUFJQSxtQkFBQSxFQUFBLENBQUEsT0FBQSxFQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsY0FBQSxLQUFBLEdBQUEsRUFBQSxDOzs7QUFHQSxpQkFBQSxJQUFBLFVBQUEsSUFBQSxXQUFBLEVBQUE7QUFDQSxvQkFBQSxtQkFBQSxFQUFBLGdCQUFBOzs7QUFHQSxvQkFBQSxjQUFBLE9BQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBO0FBQ0EsMENBQUEsT0FBQTtBQUNBLDJCQUFBLEtBQUEsR0FBQSxLQUFBLFlB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QSxLQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsVUFBQSxFQUFBO0FBQ0EsNkJBQUEsYUFBQSxDQUFBO0FBQ0Esb0JBQUEsZUFBQSxDQUFBLEVBQUEsYUFBQSxDQUFBO0FBQ0Esb0JBQUEsZUFBQSxDQUFBLEVBQUEsYUFBQSxDQUFBO0FBQ0EsdUJBQUEsVUFBQTtBQUNBLGFBTEEsQ0FBQTtBQU1BLGlCQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxTQVRBLE1BU0EsSUFBQSxLQUFBLFFBQUEsR0FBQSxDQUFBLEVBQUE7QUFDQSxpQkFBQSxLQUFBLEdBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsVUFBQSxFQUFBO0FBQ0EsNkJBQUEsYUFBQSxDQUFBO0FBQ0Esb0JBQUEsZUFBQSxDQUFBLENBQUEsRUFBQSxhQUFBLENBQUE7QUFDQSxvQkFBQSxlQUFBLENBQUEsQ0FBQSxFQUFBLGFBQUEsQ0FBQTtBQUNBLHVCQUFBLFVBQUE7QUFDQSxhQUxBLENBQUE7QUFNQSxpQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLGlCQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0E7O0FBRUEsWUFBQSxxQkFBQSxlQUFBLFVBQUEsQ0FBQTtBQUNBLDJCQUFBLE9BQUEsR0FDQSxJQURBLENBQ0EsVUFBQSxPQUFBLEVBQUE7QUFDQSxnQkFBQSxLQUFBO0FBQ0Esb0JBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUEsR0FBQSxLQUFBLE9BQUEsRUFBQSxDQUFBLEdBQUEsRUFBQSxRQUFBLENBQUE7QUFDQSxhQUZBOztBQUlBLG1CQUFBLFNBQUEsQ0FBQSxJQUFBLEVBQUEsbUJBQUEsS0FBQSxDQUFBOztBQUVBLGlCQUFB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LENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBLEVBSUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FKQSxFQUtBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQU5BLEVBT0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FQQSxFQVFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUkEsRUFTQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVRBLEVBVUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FWQSxFQVdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWEEsRUFZQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVpBLENBQUE7QUFjQSxXQUFBLFNBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBLEVBR0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQSxFQUlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSkEsRUFLQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUxBLEVBTUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FOQSxFQU9BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUEEsRUFRQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVJBLEVBU0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FUQSxFQVVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVkEsRUFXQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVhBLEVBWUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FaQSxDQUFBO0FBY0EsV0FBQSxXQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQURBLEVBRUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQSxFQUdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEEsRUFJQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUpBLEVBS0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FMQSxFQU1BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTkEsRUFPQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVBBLEVBUUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FSQSxFQVNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVEEsRUFVQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVZBLEVBV0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FYQSxFQVlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWkEsQ0FBQTtBQWNBLFdBQUEsVUFBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBLEVBSUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FKQSxFQUtBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQU5BLEVBT0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FQQSxFQVFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUkEsRUFTQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVRBLEVBVUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FWQSxFQVdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWEEsRUFZQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVpBLENBQUE7QUFjQSxDQXpiQTs7QUNSQSxNQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxhQUFBLFFBREE7QUFFQSxxQkFBQSw4QkFGQTtBQUdBLG9CQUFBO0FBSEEsS0FBQTtBQUtBLENBTkE7O0FBUUEsTUFBQSxVQUFBLENBQUEsV0FBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxhQUFBLEVBQUEsVUFBQSxFQUFBO0FBQ0EsUUFBQSxPQUFBLGVBQUE7O0FBRUEsV0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLGFBQUEsZ0JBQUEsQ0FBQSxRQUFBLEVBQUEsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0Esb0JBQUEsR0FBQSxDQUFBLGVBQUEsRUFBQSxRQUFBO0FBQ0EsdUJBQUEsV0FBQSxHQUFBLFFBQUE7QUFDQSxtQkFBQSxFQUFBLENBQUEsVUFBQTtBQUNBLFNBSkEsRUFJQSxLQUpBLENBSUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxvQkFBQSxLQUFBLENBQUEsd0JBQUEsRUFBQSxLQUFBO0FBQ0EsU0FOQTtBQVFBLEtBVEE7QUFXQSxDQWRBOztBQ1JBLE1BQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLGFBQUEsV0FEQTtBQUVBLHFCQUFBLG9DQUZBO0FBR0Esb0JBQUE7QUFIQSxLQUFBO0FBS0EsQ0FOQTs7QUFRQSxNQUFBLFVBQUEsQ0FBQSxVQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBLGVBQUEsRUFBQSxNQUFBLEVBQUEsYUFBQSxFQUFBLGNBQUEsRUFBQTs7QUFFQSxRQUFBLE1BQUEsU0FBQSxRQUFBLEdBQUEsR0FBQSxFQUFBO0FBQ0EsUUFBQSxNQUFBLGdCQUFBLEdBQUEsQ0FBQTs7QUFFQSxRQUFBLE9BQUEsZUFBQTtBQUNBLFFBQUEsZUFBQSxLQUFBLFFBQUEsRUFBQTs7QUFFQSxRQUFBLFdBQUEsSUFBQSxLQUFBLENBQUEsT0FBQSxDQUFBO0FBQ0EsUUFBQSxrQkFBQSxnQkFBQSxRQUFBLENBQUE7Ozs7QUFJQSxvQkFBQSxPQUFBLENBQUEsTUFBQSxFQUFBLFVBQUEsRUFDQSxJQURBLENBQ0EsWUFBQTtBQUNBLFlBQUEsV0FBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsSUFBQSxPQUFBLFFBQUEsRUFBQTtBQUNBLHFCQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxPQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBO0FBQ0EsZUFBQSxTQUFBLEdBQUEsU0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsS0FQQTs7QUFZQSxXQUFBLElBQUEsR0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLFlBQUEsY0FBQSxJQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsS0FBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLFlBQUEsYUFBQSxZQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUE7O0FBRUEsaUJBQUEsSUFBQSxHQUFBLGtCQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxnQkFBQSxxQkFBQSxlQUFBLFVBQUEsQ0FBQTs7QUFFQSwrQkFBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0Esb0JBQUEsWUFBQSxJQUFBOztBQUVBLG9CQUFBLElBQUEsRUFBQTtBQUNBLHdCQUFBLENBQUEsVUFBQSxNQUFBLENBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSwrQkFBQSxPQUFBLEdBQUEsS0FBQSxLQUFBLEdBQUE7QUFDQSxxQkFGQSxFQUVBLE1BRkEsRUFFQTtBQUNBLDRCQUFBLFlBQUEsSUFBQSxNQUFBLENBQUEsS0FBQSxHQUFBLENBQUE7QUFDQSx1Q0FBQSxVQUFBLEVBQUEsSUFBQSxDQUFBLFNBQUE7QUFDQTtBQUNBLGlCQVBBLE1BT0E7O0FBRUEsNEJBQUEsR0FBQSxDQUFBLFNBQUE7QUFDQTtBQUNBLGFBZEEsRUFlQSxJQWZBLENBZUEsWUFBQTtBQUNBLHVCQUFBLEVBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxnQ0FBQTtBQURBLGlCQUFBO0FBR0EsYUFuQkE7QUFvQkEsU0F2QkE7QUF3QkEsS0E1QkE7QUE2QkEsQ0F0REE7O0FDUkEsTUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsYUFBQSxXQURBO0FBRUEscUJBQUEsb0NBRkE7QUFHQSxvQkFBQTtBQUhBLEtBQUE7QUFLQSxDQU5BOztBQVFBLE1BQUEsVUFBQSxDQUFBLGNBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsY0FBQSxFQUFBLGVBQUEsRUFBQTtBQUNBLFFBQUEsTUFBQSxTQUFBLFFBQUEsR0FBQSxHQUFBLEVBQUE7QUFDQSxRQUFBLE1BQUEsZ0JBQUEsR0FBQSxDQUFBOztBQUdBLFdBQUEsVUFBQSxHQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsWUFBQSxjQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxLQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsWUFBQSxhQUFBLFlBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQTs7QUFFQSx1QkFBQSxXQUFBLEVBQUEsSUFBQSxDQUFBO0FBQ0Esd0JBQUE7QUFEQSxTQUFBOztBQUlBLGlCQUFBLElBQUEsR0FBQSxrQkFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsSUFBQSxFQUFBO0FBQ0Esb0JBQUEsWUFBQSxJQUFBLE1BQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQTtBQUNBLCtCQUFBLFVBQUEsRUFBQSxJQUFBLENBQUEsU0FBQTtBQUNBLGFBSEEsTUFHQTtBQUNBLHdCQUFBLEdBQUEsQ0FBQSxrQkFBQTtBQUNBO0FBQ0EsU0FQQTs7QUFTQSxZQUFBLFFBQUEsQ0FBQTtBQUNBLGdCQUFBLENBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQUFBLEVBS0E7QUFDQSxnQkFBQSxDQURBO0FBRUEsc0JBQUEsRUFGQTtBQUdBLG1CQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQTtBQUlBLHNCQUFBO0FBSkEsU0FMQSxFQVVBO0FBQ0EsZ0JBQUEsQ0FEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBVkEsRUFlQTtBQUNBLGdCQUFBLENBREE7QUFFQSxzQkFBQSxFQUZBO0FBR0EsbUJBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBO0FBSUEsc0JBQUE7QUFKQSxTQWZBLEVBb0JBO0FBQ0EsZ0JBQUEsQ0FEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBcEJBLEVBeUJBO0FBQ0EsZ0JBQUEsQ0FEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBekJBLEVBOEJBO0FBQ0EsZ0JBQUEsQ0FEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBOUJBLEVBbUNBO0FBQ0EsZ0JBQUEsQ0FEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBbkNBLEVBd0NBO0FBQ0EsZ0JBQUEsQ0FEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBeENBLEVBNkNBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBN0NBLEVBa0RBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBbERBLEVBdURBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBdkRBLEVBNERBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBNURBLEVBaUVBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBakVBLEVBc0VBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBdEVBLEVBMkVBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBM0VBLEVBZ0ZBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBaEZBLEVBcUZBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBckZBLEVBMEZBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBMUZBLEVBK0ZBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBL0ZBLEVBb0dBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBcEdBLEVBeUdBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBekdBLEVBOEdBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBOUdBLEVBbUhBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBbkhBLEVBd0hBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBeEhBLEVBNkhBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBN0hBLEVBa0lBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBbElBLEVBdUlBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBdklBLEVBNElBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBNUlBLEVBaUpBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBakpBLEVBc0pBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBdEpBLEVBMkpBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBM0pBLEVBZ0tBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBaEtBLEVBcUtBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBcktBLEVBMEtBO0FBQ0EsZ0JBQUEsRUFEQTtBQUVBLHNCQUFBLEVBRkE7QUFHQSxtQkFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFJQSxzQkFBQTtBQUpBLFNBMUtBLENBQUE7O0FBaUxBLFlBQUEsT0FBQSxJQUFBLElBQUEsQ0FBQSxLQUFBLEVBQUEsT0FBQSxHQUFBLEtBQUE7QUFDQSxZQUFBLFVBQUEsSUFBQSxLQUFBLENBQUEsT0FBQSxFQUFBLEtBQUEsQ0FBQSxRQUFBLEVBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQTtBQUNBLHVCQUFBLE9BQUEsRUFBQSxJQUFBLENBQUEsSUFBQTs7QUFJQSxZQUFBLG9CQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxLQUFBLENBQUEsUUFBQSxFQUFBLEtBQUEsQ0FBQSxrQkFBQSxDQUFBO0FBQ0EsdUJBQUEsaUJBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQSxLQUFBLEVBQUEsUUFBQSxFQUFBLFFBQUEsRUFBQSxPQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsUUFBQSxDQUFBOztBQUdBLGVBQUEsRUFBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLHdCQUFBO0FBREEsU0FBQTtBQUdBLEtBL01BOztBQWlOQSxXQUFBLFlBQUEsR0FBQSxZQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsVUFBQTtBQUNBLEtBRkE7QUFHQSxDQXpOQTs7QUNSQTs7QUFFQSxTQUFBLE1BQUEsQ0FBQSxHQUFBLEVBQUE7O0FBRUEsU0FBQSxHQUFBLEdBQUEsR0FBQTs7QUFFQSxTQUFBLE1BQUEsR0FBQSxHQUFBOzs7QUFHQSxTQUFBLEtBQUEsR0FBQSxHQUFBOzs7O0FBSUEsU0FBQSxTQUFBLEdBQUEsR0FBQTs7O0FBR0EsU0FBQSxvQkFBQSxHQUFBLEdBQUE7OztBQUdBLFNBQUEsS0FBQSxHQUFBLEdBQUE7OztBQUdBLFNBQUEsT0FBQSxHQUFBLElBQUE7QUFDQTtBQUNBLE9BQUEsU0FBQSxDQUFBLEVBQUEsR0FBQSxZQUFBO0FBQ0EsWUFBQSxHQUFBLENBQUEsSUFBQTtBQUNBLENBRkE7O0FBSUEsT0FBQSxTQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUE7O0FBRUEsUUFBQSxJQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxJQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxjQUFBLE1BQUEsQ0FBQSxDQUFBOztBQUVBLFNBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxNQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsU0FBQSxLQUFBLENBQUEsU0FBQSxHQUFBLElBQUE7OztBQUdBLFNBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTs7O0FBR0EsU0FBQSxvQkFBQSxHQUFBLEtBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxLQUFBLENBQUE7QUFDQSxDQWRBOztBQWdCQSxPQUFBLFNBQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUEsUUFBQSxFQUFBLElBQUEsRUFBQTtBQUNBLFFBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxFQUFBO0FBQ0EsZUFBQSxNQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtBQUNBLEtBRkEsTUFFQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsRUFBQTtBQUNBLGVBQUEsTUFBQSxTQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxLQUZBLE1BRUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLEVBQUE7QUFDQSxlQUFBLE1BQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQ0EsS0FGQSxNQUVBO0FBQ0EsZUFBQSxNQUFBLFNBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBO0FBQ0EsQ0FWQTs7O0FBYUEsT0FBQSxTQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQTtBQUNBLFNBQUEsS0FBQSxHQUFBLEtBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsRUFBQTtBQUNBLGVBQUEsRUFBQSxFQUFBLEtBQUEsS0FBQSxFQUFBO0FBQ0EsS0FGQSxDQUFBOztBQUlBLFNBQUEsU0FBQSxDQUFBLE9BQUEsR0FBQSxLQUFBLFFBQUE7QUFFQSxDQVBBOztBQVNBLE9BQUEsU0FBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLE9BQUEsRUFBQTs7QUFFQSxRQUFBLFlBQUEsUUFBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsZUFBQSxDQUFBLFNBQUEsU0FBQSxJQUFBLGFBQUEsR0FBQTtBQUNBLEtBRkEsRUFFQSxDQUZBLENBQUE7QUFHQSxXQUFBLFNBQUE7QUFDQSxDQU5BOzs7Ozs7Ozs7Ozs7Ozs7OztBQXVCQSxPQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxRQUFBLGVBQUEsS0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGVBQUEsU0FBQSxTQUFBO0FBQ0EsS0FGQSxDQUFBOztBQUlBLFFBQUEsS0FBQSxLQUFBLENBQUEsSUFBQSxJQUFBLGFBQUEsTUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLEdBQUE7QUFDQSxDQU5BOztBQVFBLE9BQUEsU0FBQSxDQUFBLEdBQUEsR0FBQSxZQUFBO0FBQ0EsU0FBQSxPQUFBLEdBQUEsS0FBQTs7QUFFQSxDQUhBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgdHN1cm8gPSBhbmd1bGFyLm1vZHVsZSgnVHN1cm8nLCBbJ3VpLnJvdXRlcicsICdmaXJlYmFzZSddKTtcblxudHN1cm8uY29uZmlnKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0ge1xuICAgICAgICBhcGlLZXk6IFwiQUl6YVN5Q0xtM2prazVwcE1xZVF4S29ILWRaOUNkWU1hREdXV3FVXCIsXG4gICAgICAgIGF1dGhEb21haW46IFwidGhlLXBhdGhzLW9mLWRyYWdvbnMuZmlyZWJhc2VhcHAuY29tXCIsXG4gICAgICAgIGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vdGhlLXBhdGhzLW9mLWRyYWdvbnMuZmlyZWJhc2Vpby5jb21cIixcbiAgICAgICAgc3RvcmFnZUJ1Y2tldDogXCJ0aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbVwiLFxuICAgIH07XG4gICAgZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChjb25maWcpO1xufSk7XG5cbnRzdXJvLmNvbnN0YW50KCdmaXJlYmFzZVVybCcsICdodHRwczovL3BhdGgtb2YtdGhlLWRyYWdvbi5maXJlYmFzZWlvLmNvbS8nKTtcblxudHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG59KTtcbiIsImZ1bmN0aW9uIEJvYXJkKCkge1xuICAgIHRoaXMuYm9hcmQgPSBbXTtcbn1cblxuQm9hcmQucHJvdG90eXBlLmRyYXdCb2FyZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IDY7IHkrKykge1xuICAgICAgICBpZiAoIXRoaXMuYm9hcmRbeV0pIHRoaXMuYm9hcmRbeV0gPSBbXTtcbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCA2OyB4KyspIHtcbiAgICAgICAgICAgIHRoaXMuYm9hcmRbeV0ucHVzaChuZXcgU3BhY2UoeCwgeSwgdGhpcy5ib2FyZCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmJvYXJkO1xufVxuXG5mdW5jdGlvbiBTcGFjZSh4LCB5LCBib2FyZCkge1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbiAgICB0aGlzLmltYWdlID0gXCJuXCI7XG4gICAgdGhpcy5wb2ludHMgPSBbbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbF07XG4gICAgdGhpcy50aWxlVXJsID0gXCJuXCI7XG4gICAgdGhpcy50aWxlSWQgPSBcIm5cIjtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgIGxldCBjb3JyZXNwb25kaW5nO1xuXG4gICAgICAgIGlmIChpIDwgMikgeyAvL3RvcFxuICAgICAgICAgICAgY29ycmVzcG9uZGluZyA9IGkgPT09IDAgPyA1IDogNDsgLy8gMCAtPiA1ICYgMSAtPiA0XG4gICAgICAgICAgICBpZiAoeSA9PT0gMCkgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQodHJ1ZSwgW3tcbiAgICAgICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgICAgIHk6IHksXG4gICAgICAgICAgICAgICAgaTogaVxuICAgICAgICAgICAgfV0pO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb2ludHNbaV0gPSBib2FyZFt5IC0gMV1beF0ucG9pbnRzW2NvcnJlc3BvbmRpbmddO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGkgPCA0KSB7IC8vcmlnaHRcbiAgICAgICAgICAgIGNvcnJlc3BvbmRpbmcgPSBpID09PSAyID8gNyA6IDY7XG4gICAgICAgICAgICBpZiAoeCA9PT0gNSkgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQodHJ1ZSwgW3tcbiAgICAgICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgICAgIHk6IHksXG4gICAgICAgICAgICAgICAgaTogaVxuICAgICAgICAgICAgfV0pO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQoZmFsc2UsIFt7XG4gICAgICAgICAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICAgICAgICAgIHk6IHksXG4gICAgICAgICAgICAgICAgICAgIGk6IGlcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIHg6IHggKyAxLFxuICAgICAgICAgICAgICAgICAgICB5OiB5LFxuICAgICAgICAgICAgICAgICAgICBpOiBjb3JyZXNwb25kaW5nXG4gICAgICAgICAgICAgICAgfV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGkgPCA2KSB7IC8vYm90dG9tXG4gICAgICAgICAgICBjb3JyZXNwb25kaW5nID0gaSA9PT0gNCA/IDEgOiAwO1xuICAgICAgICAgICAgaWYgKHkgPT09IDUpIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KHRydWUsIFt7XG4gICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICB5OiB5LFxuICAgICAgICAgICAgICAgIGk6IGlcbiAgICAgICAgICAgIH1dKTtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KGZhbHNlLCBbe1xuICAgICAgICAgICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgICAgICAgICB5OiB5LFxuICAgICAgICAgICAgICAgICAgICBpOiBpXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgICAgICAgICB5OiB5ICsgMSxcbiAgICAgICAgICAgICAgICAgICAgaTogY29ycmVzcG9uZGluZ1xuICAgICAgICAgICAgICAgIH1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHsgLy9sZWZ0XG4gICAgICAgICAgICBjb3JyZXNwb25kaW5nID0gaSA9PT0gNiA/IDMgOiAyOyAvLyA2IC0+IDMgJiA3IC0+IDJcbiAgICAgICAgICAgIGlmICh4ID09PSAwKSB0aGlzLnBvaW50c1tpXSA9IG5ldyBQb2ludCh0cnVlLCBbe1xuICAgICAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICAgICAgeTogeSxcbiAgICAgICAgICAgICAgICBpOiBpXG4gICAgICAgICAgICB9XSk7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBvaW50c1tpXSA9IGJvYXJkW3ldW3ggLSAxXS5wb2ludHNbY29ycmVzcG9uZGluZ107XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxuLy8gZWRnZSA9IGJvb2xlYW5cbmZ1bmN0aW9uIFBvaW50KGVkZ2UsIHNwYWNlKSB7XG4gICAgdGhpcy5lZGdlID0gZWRnZTtcbiAgICB0aGlzLm5laWdoYm9ycyA9IFtcIm5cIl07XG4gICAgdGhpcy50cmF2ZWxsZWQgPSBmYWxzZTtcbiAgICB0aGlzLnNwYWNlcyA9IHNwYWNlO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jbGFzcyBEZWNrIHtcbiAgICBjb25zdHJ1Y3Rvcih0aWxlcykge1xuICAgICAgICB0aGlzLnRpbGVzID0gdGlsZXNcbiAgICB9XG5cbiAgICBzaHVmZmxlKCkge1xuICAgICAgICB0aGlzLnRpbGVzID0gXy5zaHVmZmxlKHRoaXMudGlsZXMpXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGRlYWxUaHJlZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZXMuc3BsaWNlKDAsIDMpO1xuICAgIH1cblxuICAgIGRlYWwobnVtKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGVzLnNwbGljZSgwLCBudW0pO1xuICAgIH1cblxuICAgIHJlbG9hZCh0aWxlcykge1xuICAgICAgICB0aGlzLnRpbGVzLnB1c2godGlsZXMpXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLy9HQU1FLy8vXG5cbmNsYXNzIEdhbWUge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUpIHtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5jb3VudCA9IDM1O1xuICAgICAgICB0aGlzLmJvYXJkID0gbmV3IEJvYXJkKCkuZHJhd0JvYXJkKCk7XG4gICAgICAgIHRoaXMucGxheWVycyA9IFtdO1xuICAgICAgICB0aGlzLmF2YWlsYWJsZU1hcmtlcnMgPSBbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJ5ZWxsb3dcIiwgXCJncmVlblwiLCBcImFxdWFcIiwgXCJibHVlXCIsIFwibmF2eVwiLCBcInB1cnBsZVwiXVxuXG4gICAgICAgIHRoaXMuY3VyclBsYXllcjsgLy9pbmRleCBvZiB0aGUgY3VycmVudFBsYXllciBpbiB0aGUgdHVybk9yZGVyQXJyYXlcbiAgICAgICAgdGhpcy50dXJuT3JkZXJBcnJheSA9IFtdIC8vaG9sZHMgYWxsIHRoZSBwbGF5ZXJzIHN0aWxsIG9uIHRoZSBib2FyZC5cbiAgICAgICAgdGhpcy5kcmFnb24gPSBcIlwiOyAvLyBQbGF5ZXIuTWFya2VyXG4gICAgICAgIHRoaXMubW92ZXM7XG4gICAgfVxuXG4gICAgZ2V0Q3VycmVudFBsYXllcigpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VyclBsYXllciA9PT0gLTEpIHJldHVybjtcbiAgICAgICAgcmV0dXJuIHRoaXMudHVybk9yZGVyQXJyYXlbdGhpcy5jdXJyUGxheWVyXTtcbiAgICB9XG5cbiAgICBtb3ZlQWxsUGxheWVycygpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLmZvckVhY2goKHBsYXllcikgPT4gcGxheWVyLmtlZXBNb3ZpbmcocGxheWVyKSlcbiAgICB9XG5cbiAgICBkZWFkUGxheWVycygpIHtcbiAgICAgICAgdmFyIGRlYWRQbGF5ZXJzVGlsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLmZvckVhY2goZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICAgICAgaWYgKCFwbGF5ZXIuY2FuUGxheSAmJiBwbGF5ZXIudGlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGRlYWRQbGF5ZXJzVGlsZXMucHVzaChwbGF5ZXIudGlsZXMpO1xuICAgICAgICAgICAgICAgIGlzRGVhZFBsYXllciA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZGVhZFBsYXllcnNUaWxlcztcbiAgICB9XG5cbiAgICBjaGVja092ZXIoKSB7XG4gICAgICAgIHJldHVybiBnZXRDYW5QbGF5KCkubGVuZ3RoIDw9IDE7XG4gICAgfVxuXG4gICAgLy90byBiZSBjYWxsZWQgYXQgdGhlIGVuZCBvZiBhIHR1cm4gdG8gc2V0IHRoZSBjdXJyUGxheWVyIHRvIHRoZSBuZXh0IGVsaWdpYmxlIHBsYXllciBpbiB0aGUgdHVybk9yZGVyQXJyYXlcbiAgICBnb1RvTmV4dFBsYXllcigpIHtcbiAgICAgICAgaWYgKGdldENhblBsYXkodGhpcy50dXJuT3JkZXJBcnJheSkubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgbGV0IG5ld0lkeCA9IHRoaXMuY3VyclBsYXllciArIDE7XG4gICAgICAgICAgICB3aGlsZSAoIXRoaXMudHVybk9yZGVyQXJyYXlbbmV3SWR4ICUgOF0uY2FuUGxheSkge1xuICAgICAgICAgICAgICAgIG5ld0lkeCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdXJyUGxheWVyID0gbmV3SWR4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jdXJyUGxheWVyID0gLTE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q3VycmVudFBsYXllcigpO1xuICAgIH1cblxuICAgIGRlYWwobnVtKSB7XG4gICAgICAgIHZhciB0aWxlcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgdGlsZSA9IHRoaXMuZGVja1swXS5zcGxpY2UoMCwgMSk7XG4gICAgICAgICAgICB0aGlzLmRlY2suJHNhdmUoMCkudGhlbihmdW5jdGlvbiAocmVmKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2RlYWx0IGEgY2FyZCEnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGlsZXMgPSB0aWxlcy5jb25jYXQodGlsZSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aWxlcylcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGlsZXM7XG4gICAgfVxuXG4gICAgLy9yZXN0YXJ0IHRoZSBnYW1lXG4gICAgcmVzZXQoKSB7XG4gICAgICAgIHRoaXMucGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAgICAgICAvL3JldHJpZXZlIGFsbCB0aWxlc1xuICAgICAgICAgICAgLy9yZXR1cm4gcGxheWVyJ3MgdGlsZXMgdG8gdGhlIGRlY2sgYW5kIHNodWZmbGVcbiAgICAgICAgICAgIHRoaXMuZGVjay5yZWxvYWQocGxheWVyLnRpbGVzKS5zaHVmZmxlKCk7XG4gICAgICAgICAgICBwbGF5ZXIudGlsZXMgPSBbXTtcbiAgICAgICAgICAgIC8vcmVzZXQgYWxsIHBsYXllcnMgcGxheWFiaWxpdHlcbiAgICAgICAgICAgIHBsYXllci5jYW5QbGF5ID0gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG59XG5cbi8vLy8vRU5EIE9GIEdBTUUgQ0xBU1MvLy8vL1xuXG4vL2dldCBFbGlnaWJsZSBwbGF5ZXJzXG5sZXQgZ2V0Q2FuUGxheSA9IGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgcmV0dXJuIHBsYXllcnMuZmlsdGVyKChwbGF5ZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIHBsYXllci5jYW5QbGF5XG4gICAgfSlcbn1cbiIsInRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZ2FtZScsIHtcbiAgICAgICAgdXJsOiAnL2dhbWUvOmdhbWVOYW1lJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvYnJvd3Nlci9qcy9nYW1lL2dhbWUuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdnYW1lQ3RybCdcbiAgICB9KTtcbn0pO1xuXG50c3Vyby5jb250cm9sbGVyKCdnYW1lQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRmaXJlYmFzZUF1dGgsIGZpcmViYXNlVXJsLCAkc3RhdGVQYXJhbXMsICRmaXJlYmFzZU9iamVjdCwgJGZpcmViYXNlQXJyYXkpIHtcbiAgICAkc2NvcGUudGlsZSA9IHtcbiAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgIHBhdGhzOiBbMywgNCwgNiwgMCwgMSwgNywgMiwgNV0sXG4gICAgICAgIHJvdGF0aW9uOiAwXG4gICAgfTtcblxuXG4gICAgdmFyIHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XG4gICAgdmFyIG9iaiA9ICRmaXJlYmFzZU9iamVjdChyZWYpO1xuICAgIHZhciBnYW1lUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKCRzdGF0ZVBhcmFtcy5nYW1lTmFtZSk7XG5cbiAgICB2YXIgZGVja1JlZiA9IGdhbWVSZWYuY2hpbGQoJ2RlY2snKTtcbiAgICB2YXIgcGxheWVyc1JlZiA9IGdhbWVSZWYuY2hpbGQoJ3BsYXllcnMnKTtcbiAgICB2YXIgbWFya2Vyc1JlZiA9IGdhbWVSZWYuY2hpbGQoJ2F2YWlsYWJsZU1hcmtlcnMnKTtcbiAgICB2YXIgZGVja0FyciA9ICRmaXJlYmFzZUFycmF5KGRlY2tSZWYpO1xuICAgIHZhciBmaXJlYmFzZVBsYXllcnNBcnIgPSAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKTtcbiAgICB2YXIgbW92ZXNSZWYgPSBnYW1lUmVmLmNoaWxkKCdtb3ZlcycpO1xuICAgIHZhciBtb3Zlc0FyciA9ICRmaXJlYmFzZUFycmF5KG1vdmVzUmVmKTtcbiAgICB2YXIgcGxheWVyID0gT2JqZWN0LmNyZWF0ZShQbGF5ZXIucHJvdG90eXBlKTtcblxuICAgIC8qKioqKioqKioqKioqKioqXG4gICAgSU5JVElBTElaSU5HIEdBTUVcbiAgICAqKioqKioqKioqKioqKioqL1xuXG4gICAgLy9uZXcgbG9jYWwgZ2FtZSB3aXRoIGdhbWUgbmFtZSBkZWZpbmVkIGJ5IHVybFxuICAgICRzY29wZS5nYW1lID0gbmV3IEdhbWUoJHN0YXRlUGFyYW1zLmdhbWVOYW1lKTtcblxuICAgIC8vd2hlbiB0aGUgZGVjayBpcyBsb2FkZWQuLi5cbiAgICBkZWNrQXJyLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIC8vICRzY29wZS5nYW1lLmRlY2sgPSBkYXRhWzBdO1xuICAgICAgICAkc2NvcGUuZ2FtZS5kZWNrID0gZGVja0FycjsgLy9hZGQgdGhlIGRlY2sgdG8gdGhlIGxvY2FsIGdhbWUgPyBUcnkgdGhpcyBhcyBmaXJlYmFzZSBEZWNrQXJyPz8/P1xuXG5cbiAgICAgICAgLy9kb24ndCBzdGFydCB3YXRjaGluZyBwbGF5ZXJzIHVudGlsIHRoZXJlIGlzIGEgZGVjayBpbiB0aGUgZ2FtZVxuICAgICAgICBwbGF5ZXJzUmVmLm9uKFwidmFsdWVcIiwgZnVuY3Rpb24gKHNuYXApIHtcbiAgICAgICAgICAgIHZhciBzbmFwUGxheWVycyA9IHNuYXAudmFsKCk7IC8vZ3JhYiB0aGUgdmFsdWUgb2YgdGhlIHNuYXBzaG90IChhbGwgcGxheWVycyBpbiBnYW1lIGluIEZpcmViYXNlKVxuXG4gICAgICAgICAgICAvL2ZvciBlYWNoIHBsYXllciBpbiB0aGlzIGNvbGxlY3Rpb24uLi5cbiAgICAgICAgICAgIGZvciAodmFyIHRoaXNQbGF5ZXIgaW4gc25hcFBsYXllcnMpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXhpc3RpbmdQbGF5ZXJJbmRleCwgdGhpc0lzQU5ld1BsYXllcjtcblxuICAgICAgICAgICAgICAgIC8vZmluZCB0aGlzICdzbmFwJyBwbGF5ZXIncyBpbmRleCBpbiBsb2NhbCBnYW1lLiBmaW5kIHJldHVybnMgdGhhdCB2YWx1ZS5cbiAgICAgICAgICAgICAgICB2YXIgbG9jYWxQbGF5ZXIgPSAkc2NvcGUuZ2FtZS5wbGF5ZXJzLmZpbmQoZnVuY3Rpb24gKHBseXIsIHBseXJJZHgpIHtcbiAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmdQbGF5ZXJJbmRleCA9IHBseXJJZHg7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwbHlyLnVpZCA9PT0gc25hcFBsYXllcnNbdGhpc1BsYXllcl0udWlkO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy9pZiBub3QgZm91bmQsIGNyZWF0ZSBuZXcgcGxheWVyXG4gICAgICAgICAgICAgICAgaWYgKCFsb2NhbFBsYXllcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaSBkaWRudCBmaW5kIGEgbG9jYWwgcGxheWVyIScpO1xuICAgICAgICAgICAgICAgICAgICBsb2NhbFBsYXllciA9IG5ldyBQbGF5ZXIoc25hcFBsYXllcnNbdGhpc1BsYXllcl0udWlkKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpc0lzQU5ld1BsYXllciA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy9mb3IgZWFjaCBrZXkgaW4gdGhlIHNuYXBQbGF5ZXIncyBrZXlzLCBhZGQgdGhhdCBrZXkgYW5kIHZhbHVlIHRvIGxvY2FsIHBsYXllclxuICAgICAgICAgICAgICAgIGZvciAodmFyIHBsYXllcnByb3BlcnR5IGluIHNuYXBQbGF5ZXJzW3RoaXNQbGF5ZXJdKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsUGxheWVyW3BsYXllcnByb3BlcnR5XSA9IHNuYXBQbGF5ZXJzW3RoaXNQbGF5ZXJdW3BsYXllcnByb3BlcnR5XTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvL3B1c2ggbG9jYWwgcGxheWVyIHRvIGdhbWUucGxheWVyc1xuICAgICAgICAgICAgICAgIGlmICh0aGlzSXNBTmV3UGxheWVyKSAkc2NvcGUuZ2FtZS5wbGF5ZXJzLnB1c2gobG9jYWxQbGF5ZXIpO1xuICAgICAgICAgICAgICAgIGVsc2UgJHNjb3BlLmdhbWUucGxheWVyc1tleGlzdGluZ1BsYXllckluZGV4XSA9IGxvY2FsUGxheWVyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH0pO1xuXG5cbiAgICB2YXIgbWFya2Vyc0FyciA9ICRmaXJlYmFzZUFycmF5KG1hcmtlcnNSZWYpOyAvL3N0b3JlIG1hcmtlcnMgYXJyYXlcblxuICAgIC8vd2hlbiB0aGF0IG1hcmtlcnMgYXJyYXkgaXMgbG9hZGVkLCB1cGRhdGUgdGhlIGF2YWlsYWJsZSBtYXJrZXJzIGFycmF5IG9uIHNjb3BlXG4gICAgbWFya2Vyc0Fyci4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAkc2NvcGUuZ2FtZS5hdmFpbGFibGVNYXJrZXJzID0gZGF0YVswXTtcbiAgICB9KTtcblxuICAgIC8vaWYgc29tZW9uZSBlbHNlIHBpY2tzIGEgbWFya2VyLCB1cGRhdGUgeW91ciB2aWV3XG4gICAgbWFya2Vyc1JlZi5vbignY2hpbGRfY2hhbmdlZCcsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICRzY29wZS5nYW1lLmF2YWlsYWJsZU1hcmtlcnMgPSBkYXRhLnZhbCgpO1xuICAgIH0pO1xuXG4gICAgLy9vbiBsb2dpbiwgZmluZCBtZSBpbiB0aGUgZmlyZWJhc2UgcGxheWVycyBhcnJheVxuICAgIGZpcmViYXNlLmF1dGgoKS5vbkF1dGhTdGF0ZUNoYW5nZWQoZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG5cbiAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1lID0gcGxheWVycy5maW5kKHBsYXllciA9PiBwbGF5ZXIudWlkID09PSB1c2VyLnVpZCk7XG5cbiAgICAgICAgICAgICAgICBpZiAobWUpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1lID0gbWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUubWUubWFya2VyID09PSBcIm5cIikgJHNjb3BlLm1lLm1hcmtlciA9IG51bGw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIE5vIHVzZXIgaXMgc2lnbmVkIGluLlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibm8gb25lIGlzIGxvZ2dlZCBpblwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpbSBoZXJlISEhISEhISEnKVxuICAgICAgICB9KTtcbiAgICB9KTtcblxuXG4gICAgLyoqKioqKioqKioqKioqKipcbiAgICBBVkFJTEFCTEUgUExBWUVSIEFDVElPTlMgQVQgR0FNRSBTVEFSVFxuICAgICoqKioqKioqKioqKioqKiovXG5cbiAgICAkc2NvcGUucGlja01hcmtlciA9IGZ1bmN0aW9uIChib2FyZCwgbWFya2VyKSB7XG4gICAgICAgICRzY29wZS5tZS5tYXJrZXIgPSBtYXJrZXI7XG5cbiAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyLiRsb2FkZWQoKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWVJZHg7XG4gICAgICAgICAgICAgICAgLy9maW5kIG15IGluZGV4IGluIHRoZSBwbGF5ZXJzIGFycmF5XG4gICAgICAgICAgICAgICAgcGxheWVycy5maW5kKGZ1bmN0aW9uIChlLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlLiRpZCA9PT0gJHNjb3BlLm1lLiRpZCkgbWVJZHggPSBpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vZ2l2ZSBtZSBhIG1hcmtlciBhbmQgc2F2ZSBtZSBpbiBmaXJlYmFzZVxuICAgICAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0ubWFya2VyID0gbWFya2VyO1xuICAgICAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0Fyci4kc2F2ZShtZUlkeCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB2YXIgaWR4ID0gJHNjb3BlLmdhbWUuYXZhaWxhYmxlTWFya2Vycy5pbmRleE9mKG1hcmtlcik7XG5cbiAgICAgICAgbWFya2Vyc0FyclswXS5zcGxpY2UoaWR4LCAxKTtcblxuICAgICAgICBtYXJrZXJzQXJyLiRzYXZlKDApXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocmVmKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZW1vdmVkIHRoZSBwaWNrZWQgbWFya2VyXCIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlZi5rZXkpO1xuICAgICAgICAgICAgfSk7XG4gICAgfTtcblxuXG4gICAgLy9UT0RPOiBsaW1pdCBzdGFydCBwb2ludHNcblxuICAgIC8vSGF2ZSBwbGF5ZXIgcGljayB0aGVpciBzdGFydCBwb2ludFxuICAgICRzY29wZS5wbGFjZU1hcmtlciA9IGZ1bmN0aW9uIChib2FyZCwgcG9pbnQpIHtcbiAgICAgICAgLy9wbGFjZSBteSBtYXJrZXJcbiAgICAgICAgcGxheWVyLnBsYWNlTWFya2VyKGJvYXJkLCBwb2ludCwgJHNjb3BlLm1lKTtcbiAgICAgICAgJHNjb3BlLm1lLnRpbGVzID0gJHNjb3BlLmdhbWUuZGVhbCgzKTsgLy9kZWFsIG1lIHRocmVlIGNhcmRzXG4gICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5tZS50aWxlcylcbiAgICAgICAgICAgIC8vd2hlbiB0aGUgZmlyZWJhc2UgcGxheWVycyBhcmUgbG9hZGVkLi4uLlxuICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJGxvYWRlZCgpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocGxheWVycykge1xuICAgICAgICAgICAgICAgIC8vZmluZCBtZSBpbiB0aGUgZmlyZWJhc2UgcGxheWVycyBhcnJheVxuICAgICAgICAgICAgICAgIHZhciBtZUlkeDtcbiAgICAgICAgICAgICAgICBwbGF5ZXJzLmZpbmQoZnVuY3Rpb24gKGUsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUudWlkID09PSAkc2NvcGUubWUudWlkKSBtZUlkeCA9IGk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdID0gJHNjb3BlLm1lOyAvL3NldCBmaXJlYmFzZSBtZSB0byBsb2NhbCBtZVxuXG4gICAgICAgICAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyLiRzYXZlKG1lSWR4KTsgLy9zYXZlIGl0LlxuICAgICAgICAgICAgfSk7XG4gICAgfTtcblxuXG5cblxuXG5cblxuXG4gICAgLy8gVE9ETzogd2UgcHJvYmFibHkgbmVlZCB0aGlzIG9uIGZpcmViYXNlIHNvIG90aGVyIHBlb3BsZSBjYW4ndCBwaWNrIHdoYXQncyBiZWVuIHBpY2tlZFxuXG4gICAgLy9Gb3Igc3luY2hyb25pemluZ0dhbWUuLi5cbiAgICAvLyB2YXIgc3luY1JlZiA9IGdhbWVSZWYuY2hpbGQoJ21vdmVzJyk7XG4gICAgLy8gc3luY1JlZi5vbignY2hpbGRfYWRkZWQnLCBmdW5jdGlvbiAoY2hpbGRTbmFwc2hvdCwgcHJldkNoaWxkS2V5KSB7XG4gICAgLy8gXHQvL05FRUQgVE8gRE9VQkxFIENIRUNLISEgV2hhdCBkb2VzIGNoaWxkU25hcCByZXR1cm5zP1xuICAgIC8vIFx0Y29uc29sZS5sb2coJ2NoaWxkU25hcHNob3RfU3luY0dhbWUnLCBjaGlsZFNuYXBzaG90KTtcbiAgICAvLyBcdC8vZGVwZW5kaW5nIG9uIHdoYXQgY2hpbGRTbmFwc2hvdCBnaXZlcyBtZS4uLkkgdGhpbmsgaXQncyBvbmUgY2hpbGQgcGVyIG9uIGNhbGw/IEl0IGRvZXNuJ3QgcmV0dXJuIGFuIGFycmF5IG9mIGNoYW5nZXMuLi5JIGJlbGlldmUhXG4gICAgLy8gXHRpZiAoY2hpbGRTbmFwc2hvdC50eXBlID09PSAndXBkYXRlRGVjaycpIHtcbiAgICAvLyBcdFx0JHNjb3BlLmdhbWUuZGVjayA9IGNoaWxkU25hcHNob3QudXBkYXRlRGVjaztcbiAgICAvLyBcdH0gZWxzZSB7XG4gICAgLy8gXHRcdCRzY29wZS5wbGFjZVRpbGUoY2hpbGRTbmFwc2hvdC50aWxlKTtcbiAgICAvLyBcdH1cbiAgICAvLyB9KTtcblxuICAgIC8vIFRPRE86IGhvdyB0byByZS1kbyB0aGUgbW92ZXM/XG4gICAgLy8gJHNjb3BlLmdhbWUubW92ZXM7XG5cbiAgICAvLyBUT0RPOiBob3cgZG8gd2Ugc2hvdyB0aGUgdGlsZXMgZm9yIHBsYXllcj9cblxuICAgIC8vIFRPRE86IGhvdyB0byBzaG93IHRoZSByb3RhdGVkIHRpbGU/XG5cbiAgICAvLyBDTVQ6IGFzc3VtaW5nIHdlIHVzZSBuZXcgR2FtZSgpIGZvciBlYWNoIGdhbWVcbiAgICAkc2NvcGUuY3VycmVudFBsYXllciA9ICRzY29wZS5nYW1lLmdldEN1cnJlbnRQbGF5ZXIoKTtcblxuICAgIC8vIFRPRE86IG5lZWQgYSBmdW5jdGlvbiB0byBhc3NpZ24gZHJhZ29uXG4gICAgJHNjb3BlLmRyYWdvbjtcbiAgICB2YXIgYXdhaXRpbmdEcmFnb25Ib2xkZXJzID0gW107XG5cbiAgICAkc2NvcGUuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vXG4gICAgfTtcblxuICAgICRzY29wZS5teVR1cm4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzY29wZS5tZSA9PT0gJHNjb3BlLmN1cnJlbnRQbGF5ZXI7XG4gICAgfTtcblxuICAgIC8vdGhlc2UgYXJlIHRpZWQgdG8gYW5ndWxhciBuZy1jbGljayBidXR0b25zXG4gICAgJHNjb3BlLnJvdGF0ZVRpbGVDdyA9IGZ1bmN0aW9uICh0aWxlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicm90YXRlIHRvIHJpZ2h0XCIpO1xuICAgICAgICB0aWxlLnJvdGF0aW9uKys7XG4gICAgICAgIGlmICh0aWxlLnJvdGF0aW9uID09PSA0KSB0aWxlLnJvdGF0aW9uID0gMDtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnJvdGF0ZVRpbGVDY3cgPSBmdW5jdGlvbiAodGlsZSkge1xuICAgICAgICB0aWxlLnJvdGF0aW9uLS07XG4gICAgICAgIGlmICh0aWxlLnJvdGF0aW9uID09PSAtNCkgdGlsZS5yb3RhdGlvbiA9IDA7XG4gICAgfTtcblxuICAgIC8vIENNVDogdXNlIHBsYXllcidzIGFuZCBnYW1lJ3MgcHJvdG90eXBlIGZ1bmN0aW9uIHRvIHBsYWNlIHRpbGUgYW5kIHRoZW4gbW92ZSBhbGwgcGxheWVyc1xuICAgICRzY29wZS5wbGFjZVRpbGUgPSBmdW5jdGlvbiAodGlsZSkge1xuICAgICAgICAvLyBUT0RPOiBzZW5kIHRoaXMgc3RhdGUgdG8gZmlyZWJhc2UgZXZlcnkgdGltZSBpdCdzIGNhbGxlZFxuICAgICAgICBpZiAodGlsZS5yb3RhdGlvbiA+IDApIHtcbiAgICAgICAgICAgIHRpbGUucGF0aHMgPSB0aWxlLnBhdGhzLm1hcChmdW5jdGlvbiAoY29ubmVjdGlvbikge1xuICAgICAgICAgICAgICAgIGNvbm5lY3Rpb24gPSBjb25uZWN0aW9uICsgMjtcbiAgICAgICAgICAgICAgICBpZiAoY29ubmVjdGlvbiA9PT0gOSkgY29ubmVjdGlvbiA9IDE7XG4gICAgICAgICAgICAgICAgaWYgKGNvbm5lY3Rpb24gPT09IDgpIGNvbm5lY3Rpb24gPSAwO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb25uZWN0aW9uO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aWxlLnBhdGhzLnVuc2hpZnQodGlsZS5wYXRocy5wb3AoKSk7XG4gICAgICAgICAgICB0aWxlLnBhdGhzLnVuc2hpZnQodGlsZS5wYXRocy5wb3AoKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGlsZS5yb3RhdGlvbiA8IDApIHtcbiAgICAgICAgICAgIHRpbGUucGF0aHMgPSB0aWxlLnBhdGhzLm1hcChmdW5jdGlvbiAoY29ubmVjdGlvbikge1xuICAgICAgICAgICAgICAgIGNvbm5lY3Rpb24gPSBjb25uZWN0aW9uIC0gMjtcbiAgICAgICAgICAgICAgICBpZiAoY29ubmVjdGlvbiA9PT0gLTIpIGNvbm5lY3Rpb24gPSA2O1xuICAgICAgICAgICAgICAgIGlmIChjb25uZWN0aW9uID09PSAtMSkgY29ubmVjdGlvbiA9IDc7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbm5lY3Rpb247XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRpbGUucGF0aHMucHVzaCh0aWxlLnBhdGhzLnNoaWZ0KCkpO1xuICAgICAgICAgICAgdGlsZS5wYXRocy5wdXNoKHRpbGUucGF0aHMuc2hpZnQoKSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZmlyZWJhc2VQbGF5ZXJzQXJyID0gJGZpcmViYXNlQXJyYXkocGxheWVyc1JlZik7XG4gICAgICAgIGZpcmViYXNlUGxheWVyc0Fyci4kbG9hZGVkKClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1lSWR4O1xuICAgICAgICAgICAgICAgIHBsYXllcnMuZmluZChmdW5jdGlvbiAoZSwgaSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZS4kaWQgPT09ICRzY29wZS5tZS4kaWQpIG1lSWR4ID0gaTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHBsYXllci5wbGFjZVRpbGUodGlsZSwgZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XSk7XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRpbGUucGF0aHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0ubmV4dFNwYWNlLnBvaW50c1tpXS5uZWlnaGJvcnNbMF0gPT09IFwiblwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLm5leHRTcGFjZS5wb2ludHNbaV0ubmVpZ2hib3JzLnNwbGljZSgwLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLm5leHRTcGFjZS5wb2ludHNbaV0ubmVpZ2hib3JzLnB1c2goZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS5uZXh0U3BhY2UucG9pbnRzW3RpbGUucGF0aHNbaV1dKTtcbiAgICAgICAgICAgICAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyLiRzYXZlKG1lSWR4KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLnBvaW50ID0gZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS5uZXh0U3BhY2UucG9pbnRzW2ZpcmViYXNlUGxheWVyc0FyclttZUlkeF0ubmV4dFNwYWNlUG9pbnRzSW5kZXhdO1xuICAgICAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0Fyci4kc2F2ZShtZUlkeCk7XG4gICAgICAgICAgICB9KTtcblxuXG4gICAgICAgIC8vIENNVDogdGhpcyBzaG91bGQgc2VuZCB0aGUgcm90YXRlZCB0aWxlIHRvIGZpcmViYXNlXG4gICAgICAgIG1vdmVzQXJyLiRhZGQoe1xuICAgICAgICAgICAgJ3R5cGUnOiAncGxhY2VUaWxlJyxcbiAgICAgICAgICAgICd0aWxlJzogdGlsZSxcbiAgICAgICAgICAgICdwbGF5ZXJVaWQnOiAkc2NvcGUubWUudWlkXG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyLiRsb2FkZWQoKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcbiAgICAgICAgICAgICAgICBwbGF5ZXJzLmZvckVhY2goZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1vdmFibGUgPSBwbGF5ZXIubW92ZVRvKHAucG9pbnQpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcElkeCA9IHBsYXllcnMuaW5kZXhPZihwKVxuXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChtb3ZhYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwLnBvaW50LnRyYXZlbGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBwLnBvaW50ID0gbW92YWJsZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJwIG5leHRTcGFjZVwiLCBwLm5leHRTcGFjZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicC5wb2ludC5zcGFjZXNcIiwgcC5wb2ludC5zcGFjZXMpXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3TmV4dFNwYWNlSW5mbyA9IHAucG9pbnQuc3BhY2VzLmZpbHRlcihmdW5jdGlvbiAoc3BhY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3BhY2UueCAhPT0gcC5uZXh0U3BhY2UueCB8fCBzcGFjZS55ICE9PSBwLm5leHRTcGFjZS55XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVswXVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgb2xkU3BhY2UgPSBwLm5leHRTcGFjZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBuZXdTcGFjZSA9ICRzY29wZS5nYW1lLmJvYXJkW25ld05leHRTcGFjZUluZm8ueV1bbmV3TmV4dFNwYWNlSW5mby54XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHAubmV4dFNwYWNlID0gbmV3U3BhY2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0Fyci4kc2F2ZShwSWR4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgLy8gcGxheWVyLmNoZWNrRGVhdGgocCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb3ZhYmxlID0gcGxheWVyLm1vdmVUbyhwLnBvaW50KTtcblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuXG4gICAgICAgIC8vIGlmICgkc2NvcGUuZ2FtZS5jaGVja092ZXIoKSkge1xuICAgICAgICAvLyAgICAgLy8gVE9ETzogbmVlZCB0byB0ZWxsIHRoZSBwbGF5ZXIgc2hlIHdvblxuICAgICAgICAvLyAgICAgJHNjb3BlLndpbm5lciA9ICRzY29wZS5nYW1lLmdldENhblBsYXkoKVswXTtcbiAgICAgICAgLy8gICAgICRzY29wZS5nYW1lT3ZlciA9IHRydWU7XG4gICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgIC8vICAgICAvLyBJZiBkZWNrIGlzIGVtcHR5ICYgbm8gb25lIGlzIGRyYWdvbiwgc2V0IG1lIGFzIGRyYWdvblxuICAgICAgICAvLyAgICAgaWYgKCRzY29wZS5nYW1lLmRlY2subGVuZ3RoID09PSAwICYmICEkc2NvcGUuZHJhZ29uKSB7XG4gICAgICAgIC8vICAgICAgICAgJHNjb3BlLmRyYWdvbiA9ICRzY29wZS5tZTtcbiAgICAgICAgLy8gICAgIH0gZWxzZSBpZiAoJHNjb3BlLmdhbWUuZGVjay5sZW5ndGggPT09IDAgJiYgJHNjb3BlLmRyYWdvbikge1xuICAgICAgICAvLyAgICAgICAgIGF3YWl0aW5nRHJhZ29uSG9sZGVycy5wdXNoKCRzY29wZS5tZSk7XG4gICAgICAgIC8vICAgICB9IGVsc2Uge1xuICAgICAgICAvLyAgICAgICAgIC8vIENNVDogZHJhdyBvbmUgdGlsZSBhbmQgcHVzaCBpdCB0byB0aGUgcGxheWVyLnRpbGVzIGFycmF5XG4gICAgICAgIC8vICAgICAgICAgJHNjb3BlLm1lLnRpbGVzLnB1c2goJHNjb3BlLmdhbWUuZGVjay5kZWFsKDEpKTtcbiAgICAgICAgLy8gICAgICAgICAvL2lmIGRlYWQgcGxheWVycywgdGhlbiBwdXNoIHRoZWlyIGNhcmRzIGJhY2sgdG8gdGhlIGRlY2sgJiByZXNodWZmbGVcbiAgICAgICAgLy8gICAgICAgICBpZiAoJHNjb3BlLmdhbWUuZGVhZFBsYXllcnMoKS5sZW5ndGgpIHtcbiAgICAgICAgLy8gICAgICAgICAgICAgLy93aXRoIG5ldyBjYXJkcyAmIG5lZWQgdG8gcmVzaHVmZmxlXG4gICAgICAgIC8vICAgICAgICAgICAgICRzY29wZS5nYW1lLmRlYWRQbGF5ZXJzKCkuZm9yRWFjaChmdW5jdGlvbiAoZGVhZFBsYXllclRpbGVzKSB7XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICBkZWFkUGxheWVyVGlsZXMuZm9yRWFjaChmdW5jdGlvbiAodGlsZSkge1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICRzY29wZS5nYW1lLmRlY2sucHVzaCh0aWxlKTtcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAvLyAgICAgICAgICAgICB9KTtcbiAgICAgICAgLy8gICAgICAgICAgICAgJHNjb3BlLmdhbWUuZGVjayA9ICRzY29wZS5nYW1lLmRlY2suc2h1ZmZsZSgpO1xuICAgICAgICAvLyAgICAgICAgICAgICAvL3NlbmQgZmlyZWJhc2UgYSBuZXcgbW92ZVxuICAgICAgICAvLyAgICAgICAgICAgICBnYW1lUmVmLmNoaWxkKCdtb3ZlcycpLnB1c2goe1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgJ3R5cGUnOiAndXBkYXRlRGVjaycsXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAndXBkYXRlRGVjayc6ICRzY29wZS5nYW1lLmRlY2tcbiAgICAgICAgLy8gICAgICAgICAgICAgfSk7XG4gICAgICAgIC8vICAgICAgICAgICAgIGlmICgkc2NvcGUuZHJhZ29uKSB7XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAkc2NvcGUuZHJhZ29uLnRpbGVzLnB1c2goJHNjb3BlLmdhbWUuZGVjay5kZWFsKDEpKTtcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICRzY29wZS5kcmFnb24gPSBudWxsO1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgLy9ORUVEIFRPIERJU0NVU1M6IE1pZ2h0IG5lZWQgdG8gbW9kaWZ5IHRoaXMgaWYgd2Ugd2FudCB0byB1c2UgdXAgdGhlIGNhcmRzIGFuZCBnaXZlIGVhY2ggYXdhaXRpbmcgcGxheWVycycgdXAgdG8gMyBjYXJkc1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgd2hpbGUgKCRzY29wZS5nYW1lLmRlY2subGVuZ3RoICYmICRzY29wZS5hd2FpdGluZ0RyYWdvbkhvbGRlcnMubGVuZ3RoKSB7XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmF3YWl0aW5nRHJhZ29uSG9sZGVycy5zaGlmdCgpLnRpbGVzLnB1c2goJHNjb3BlLmdhbWUuZGVjay5kZWFsKDEpKTtcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIH07XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmF3YWl0aW5nRHJhZ29uSG9sZGVycy5sZW5ndGgpIHtcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZHJhZ29uID0gJHNjb3BlLmF3YWl0aW5nRHJhZ29uSG9sZGVycy5zaGlmdCgpO1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgfVxuICAgICAgICAvLyAgICAgICAgICAgICB9O1xuICAgICAgICAvLyAgICAgICAgIH1cbiAgICAgICAgLy9cbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gICAgICRzY29wZS5nYW1lLmdvVG9OZXh0UGxheWVyKCk7XG4gICAgICAgIC8vIH1cbiAgICB9O1xuXG4gICAgLy8gVE9ETzogZmlyZWJhc2UgZ2FtZS5wbGF5ZXJzIHNsaWNlICRzY29wZS5wbGF5ZXIgb3V0XG4gICAgJHNjb3BlLmxlYXZlR2FtZTtcblxuICAgIC8vIFRPRE86IG5lZWQgdG8gcmVtb3ZlIHRoaXMgZ2FtZSByb29tJ3MgbW92ZXMgZnJvbSBmaXJlYmFzZT9cbiAgICAkc2NvcGUucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIG1hcmtlcnNBcnIuJHJlbW92ZSgwKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlZikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlZCBhbGwgbWFya2Vyc1wiLCByZWYua2V5KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGRlY2tBcnIuJHJlbW92ZSgwKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlZikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlZCB0aGUgZGVja1wiLCByZWYua2V5KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIG9iai4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgdmFyIHRpbGVzID0gZGF0YS50aWxlcztcbiAgICAgICAgICAgIHZhciBkZWNrID0gbmV3IERlY2sodGlsZXMpLnNodWZmbGUoKS50aWxlcztcbiAgICAgICAgICAgIHZhciBpbml0aWFsRGVja1JlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZCgkc3RhdGVQYXJhbXMuZ2FtZU5hbWUpLmNoaWxkKCdpbml0aWFsRGVjaycpO1xuICAgICAgICAgICAgJGZpcmViYXNlQXJyYXkoaW5pdGlhbERlY2tSZWYpLiRhZGQoZGVjayk7XG4gICAgICAgIH0pO1xuXG5cblxuICAgICAgICB2YXIgaW5pdGlhbE1hcmtlcnNSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoJHN0YXRlUGFyYW1zLmdhbWVOYW1lKS5jaGlsZCgnYXZhaWxhYmxlTWFya2VycycpO1xuICAgICAgICAkZmlyZWJhc2VBcnJheShpbml0aWFsTWFya2Vyc1JlZikuJGFkZChbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJ5ZWxsb3dcIiwgXCJncmVlblwiLCBcImFxdWFcIiwgXCJibHVlXCIsIFwibmF2eVwiLCBcInB1cnBsZVwiXSk7XG5cblxuICAgICAgICB2YXIgcGxheWVycyA9ICRmaXJlYmFzZUFycmF5KHBsYXllcnNSZWYpO1xuICAgICAgICBwbGF5ZXJzLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBkYXRhW2ldLmNhblBsYXkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGRhdGFbaV0ubWFya2VyID0gJ24nO1xuICAgICAgICAgICAgICAgIGRhdGFbaV0ubmV4dFNwYWNlID0gJ24nO1xuICAgICAgICAgICAgICAgIGRhdGFbaV0ubmV4dFNwYWNlUG9pbnRzSW5kZXggPSAnbic7XG4gICAgICAgICAgICAgICAgZGF0YVtpXS5wb2ludCA9ICduJztcbiAgICAgICAgICAgICAgICBkYXRhW2ldLnRpbGVzID0gJ24nO1xuICAgICAgICAgICAgICAgIHBsYXllcnMuJHNhdmUoaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5tZSk7XG5cbiAgICB9O1xuXG5cbiAgICAkc2NvcGUuc3RhcnR0b3AgPSBbXG4gICAgICAgIFswLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDFdLFxuICAgICAgICBbMSwgMCwgMF0sXG4gICAgICAgIFsxLCAwLCAxXSxcbiAgICAgICAgWzIsIDAsIDBdLFxuICAgICAgICBbMiwgMCwgMV0sXG4gICAgICAgIFszLCAwLCAwXSxcbiAgICAgICAgWzMsIDAsIDFdLFxuICAgICAgICBbNCwgMCwgMF0sXG4gICAgICAgIFs0LCAwLCAxXSxcbiAgICAgICAgWzUsIDAsIDBdLFxuICAgICAgICBbNSwgMCwgMV1cbiAgICBdO1xuICAgICRzY29wZS5zdGFydGxlZnQgPSBbXG4gICAgICAgIFswLCAwLCA3XSxcbiAgICAgICAgWzAsIDAsIDZdLFxuICAgICAgICBbMCwgMSwgN10sXG4gICAgICAgIFswLCAxLCA2XSxcbiAgICAgICAgWzAsIDIsIDddLFxuICAgICAgICBbMCwgMiwgNl0sXG4gICAgICAgIFswLCAzLCA3XSxcbiAgICAgICAgWzAsIDMsIDZdLFxuICAgICAgICBbMCwgNCwgN10sXG4gICAgICAgIFswLCA0LCA2XSxcbiAgICAgICAgWzAsIDUsIDddLFxuICAgICAgICBbMCwgNSwgNl1cbiAgICBdO1xuICAgICRzY29wZS5zdGFydGJvdHRvbSA9IFtcbiAgICAgICAgWzAsIDUsIDBdLFxuICAgICAgICBbMCwgNSwgMV0sXG4gICAgICAgIFsxLCA1LCAwXSxcbiAgICAgICAgWzEsIDUsIDFdLFxuICAgICAgICBbMiwgNSwgMF0sXG4gICAgICAgIFsyLCA1LCAxXSxcbiAgICAgICAgWzMsIDUsIDBdLFxuICAgICAgICBbMywgNSwgMV0sXG4gICAgICAgIFs0LCA1LCAwXSxcbiAgICAgICAgWzQsIDUsIDFdLFxuICAgICAgICBbNSwgNSwgMF0sXG4gICAgICAgIFs1LCA1LCAxXVxuICAgIF07XG4gICAgJHNjb3BlLnN0YXJ0cmlnaHQgPSBbXG4gICAgICAgIFs1LCAwLCAyXSxcbiAgICAgICAgWzUsIDAsIDNdLFxuICAgICAgICBbNSwgMSwgMl0sXG4gICAgICAgIFs1LCAxLCAzXSxcbiAgICAgICAgWzUsIDIsIDJdLFxuICAgICAgICBbNSwgMiwgM10sXG4gICAgICAgIFs1LCAzLCAyXSxcbiAgICAgICAgWzUsIDMsIDNdLFxuICAgICAgICBbNSwgNCwgMl0sXG4gICAgICAgIFs1LCA0LCAzXSxcbiAgICAgICAgWzUsIDUsIDJdLFxuICAgICAgICBbNSwgNSwgM11cbiAgICBdO1xufSk7XG4iLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9icm93c2VyL2pzL2xvZ2luL2xvZ2luLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnbG9naW5DdHJsJ1xuICAgIH0pO1xufSk7XG5cbnRzdXJvLmNvbnRyb2xsZXIoJ2xvZ2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSwgJGZpcmViYXNlQXV0aCwgJHJvb3RTY29wZSkge1xuICAgIHZhciBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuXG4gICAgJHNjb3BlLmxvZ0luV2l0aEdvb2dsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYXV0aC4kc2lnbkluV2l0aFBvcHVwKFwiZ29vZ2xlXCIpLnRoZW4oZnVuY3Rpb24gKGF1dGhEYXRhKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkxvZ2dlZCBpbiBhczpcIiwgYXV0aERhdGEpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS5jdXJyZW50VXNlciA9IGF1dGhEYXRhO1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdwaWNrR2FtZScpO1xuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJBdXRoZW50aWNhdGlvbiBmYWlsZWQ6XCIsIGVycm9yKTtcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG59KTtcbiIsInRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZ2FtZWxpc3QnLCB7XG4gICAgICAgIHVybDogJy9nYW1lbGlzdCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2Jyb3dzZXIvanMvZ2FtZWxpc3QvZ2FtZWxpc3QuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdnYW1lTGlzdCcsXG4gICAgfSk7XG59KTtcblxudHN1cm8uY29udHJvbGxlcignZ2FtZUxpc3QnLCBmdW5jdGlvbiAoJHNjb3BlLCBmaXJlYmFzZVVybCwgJGZpcmViYXNlT2JqZWN0LCAkc3RhdGUsICRmaXJlYmFzZUF1dGgsICRmaXJlYmFzZUFycmF5KSB7XG4gICAgLy9Gb3Igc3luY2hyb25pemluZ0dhbWVMaXN0Li4uXG4gICAgdmFyIHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XG4gICAgdmFyIG9iaiA9ICRmaXJlYmFzZU9iamVjdChyZWYpO1xuXG4gICAgdmFyIGF1dGggPSAkZmlyZWJhc2VBdXRoKCk7XG4gICAgdmFyIGZpcmViYXNlVXNlciA9IGF1dGguJGdldEF1dGgoKTtcblxuICAgIHZhciBzeW5jaFJlZiA9IHJlZi5jaGlsZChcImdhbWVzXCIpO1xuICAgIHZhciBzeW5jaHJvbml6ZWRPYmogPSAkZmlyZWJhc2VPYmplY3Qoc3luY2hSZWYpO1xuXG4gICAgLy8gVGhpcyByZXR1cm5zIGEgcHJvbWlzZS4uLnlvdSBjYW4udGhlbigpIGFuZCBhc3NpZ24gdmFsdWUgdG8gJHNjb3BlLnZhcmlhYmxlXG4gICAgLy8gZ2FtZWxpc3QgaXMgd2hhdGV2ZXIgd2UgYXJlIGNhbGxpbmcgaXQgaW4gdGhlIGFuZ3VsYXIgaHRtbC5cbiAgICBzeW5jaHJvbml6ZWRPYmouJGJpbmRUbygkc2NvcGUsIFwiZ2FtZWxpc3RcIilcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGdhbWVsaXN0ID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluICRzY29wZS5nYW1lbGlzdCkge1xuICAgICAgICAgICAgICAgIGdhbWVsaXN0LnB1c2goW2ksICRzY29wZS5nYW1lbGlzdFtpXV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJHNjb3BlLmdhbWVOYW1lcyA9IGdhbWVsaXN0LnNsaWNlKDIpO1xuICAgICAgICB9KTtcblxuXG5cblxuICAgICRzY29wZS5qb2luID0gZnVuY3Rpb24gKGdhbWVOYW1lKSB7XG4gICAgICAgIHZhciBnYW1lTmFtZVJlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZChnYW1lTmFtZSk7XG4gICAgICAgIHZhciBwbGF5ZXJzUmVmID0gZ2FtZU5hbWVSZWYuY2hpbGQoJ3BsYXllcnMnKTtcblxuICAgICAgICBmaXJlYmFzZS5hdXRoKCkub25BdXRoU3RhdGVDaGFuZ2VkKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICB2YXIgZmlyZWJhc2VQbGF5ZXJzQXJyID0gJGZpcmViYXNlQXJyYXkocGxheWVyc1JlZik7XG5cbiAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0Fyci4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgRkJwbGF5ZXJzID0gZGF0YTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFGQnBsYXllcnMuZmlsdGVyKGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBsYXllci51aWQgPT09IHVzZXIudWlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld1BsYXllciA9IG5ldyBQbGF5ZXIodXNlci51aWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGZpcmViYXNlQXJyYXkocGxheWVyc1JlZikuJGFkZChuZXdQbGF5ZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBObyB1c2VyIGlzIHNpZ25lZCBpbi5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibm90aGluZ1wiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2dhbWUnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcImdhbWVOYW1lXCI6IGdhbWVOYW1lXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufSk7XG4iLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3BpY2tHYW1lJywge1xuICAgICAgICB1cmw6ICcvcGlja2dhbWUnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9icm93c2VyL2pzL3BpY2tHYW1lL3BpY2tHYW1lLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAncGlja0dhbWVDdHJsJ1xuICAgIH0pO1xufSk7XG5cbnRzdXJvLmNvbnRyb2xsZXIoJ3BpY2tHYW1lQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSwgJGZpcmViYXNlQXJyYXksICRmaXJlYmFzZU9iamVjdCkge1xuICAgIHZhciByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xuICAgIHZhciBvYmogPSAkZmlyZWJhc2VPYmplY3QocmVmKTtcblxuXG4gICAgJHNjb3BlLmNyZWF0ZUdhbWUgPSBmdW5jdGlvbiAoZ2FtZU5hbWUpIHtcbiAgICAgICAgdmFyIGdhbWVOYW1lUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKGdhbWVOYW1lKTtcbiAgICAgICAgdmFyIHBsYXllcnNSZWYgPSBnYW1lTmFtZVJlZi5jaGlsZCgncGxheWVycycpO1xuXG4gICAgICAgICRmaXJlYmFzZUFycmF5KGdhbWVOYW1lUmVmKS4kYWRkKHtcbiAgICAgICAgICAgIFwiZ2FtZU5hbWVcIjogZ2FtZU5hbWVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZmlyZWJhc2UuYXV0aCgpLm9uQXV0aFN0YXRlQ2hhbmdlZChmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV3UGxheWVyID0gbmV3IFBsYXllcih1c2VyLnVpZClcbiAgICAgICAgICAgICAgICAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKS4kYWRkKG5ld1BsYXllcilcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJubyBvbmUgbG9nZ2VkIGluXCIpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgdmFyIHRpbGVzID0gW3tcbiAgICAgICAgICAgIGlkOiAxLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzMsIDQsIDYsIDAsIDEsIDcsIDIsIDVdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDIsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMSwgMCwgNCwgNywgMiwgNiwgNSwgM10sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogMyxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFsxLCAwLCA0LCA2LCAyLCA3LCAzLCA1XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiA0LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzIsIDUsIDAsIDcsIDYsIDEsIDQsIDNdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDUsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJcIixcbiAgICAgICAgICAgIHBhdGhzOiBbNCwgMiwgMSwgNiwgMCwgNywgMywgNV0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogNixcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFsxLCAwLCA1LCA3LCA2LCAyLCA0LCAzXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiA3LFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgICAgICAgICBwYXRoczogWzIsIDQsIDAsIDYsIDEsIDcsIDMsIDVdLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IDgsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJcIixcbiAgICAgICAgICAgIHBhdGhzOiBbMiwgNSwgMCwgNiwgNywgMSwgMywgNF0sXG4gICAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogOSxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFsxLCAwLCA3LCA2LCA1LCA0LCAzLCAyXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAxMCxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFs0LCA1LCA2LCA3LCAwLCAxLCAyLCAzXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAxMSxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFs3LCAyLCAxLCA0LCAzLCA2LCA1LCAwXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAxMixcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFsyLCA3LCAwLCA1LCA2LCAzLCA0LCAxXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAxMyxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFs1LCA0LCA3LCA2LCAxLCAwLCAzLCAyXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAxNCxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFszLCAyLCAxLCAwLCA3LCA2LCA1LCA0XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAxNSxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFsxLCAwLCA3LCA0LCAzLCA2LCA1LCAyXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAxNixcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFsxLCAwLCA1LCA2LCA3LCAyLCAzLCA0XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAxNyxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFszLCA1LCA2LCAwLCA3LCAxLCAyLCA0XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAxOCxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFsyLCA3LCAwLCA0LCAzLCA2LCA1LCAxXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAxOSxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFs0LCAzLCA2LCAxLCAwLCA3LCAyLCA1XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAyMCxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFsyLCA2LCAwLCA0LCAzLCA3LCAxLCA1XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAyMSxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFsyLCAzLCAwLCAxLCA3LCA2LCA1LCA0XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAyMixcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFsyLCA2LCAwLCA1LCA3LCAzLCAxLCA0XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAyMyxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFsxLCAwLCA2LCA0LCAzLCA3LCAyLCA1XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAyNCxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFszLCA0LCA3LCAwLCAxLCA2LCA1LCAyXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAyNSxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFsxLCAwLCAzLCAyLCA3LCA2LCA1LCA0XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAyNixcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFsxLCAwLCA2LCA3LCA1LCA0LCAyLCAzXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAyNyxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFsyLCA0LCAwLCA3LCAxLCA2LCA1LCAzXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAyOCxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFs0LCAyLCAxLCA3LCAwLCA2LCA1LCAzXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAyOSxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFsxLCAwLCAzLCAyLCA1LCA0LCA3LCA2XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAzMCxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFsyLCAzLCAwLCAxLCA2LCA3LCA0LCA1XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAzMSxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFszLCA2LCA1LCAwLCA3LCAyLCAxLCA0XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAzMixcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFsxLCAwLCA2LCA1LCA3LCAzLCAyLCA0XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAzMyxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFsxLCAwLCAzLCAyLCA2LCA3LCA0LCA1XSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAzNCxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFs0LCA1LCA3LCA2LCAwLCAxLCAzLCAyXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiAzNSxcbiAgICAgICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICAgICAgcGF0aHM6IFsxLCAwLCA3LCA1LCA2LCAzLCA0LCAyXSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH1dO1xuXG4gICAgICAgIHZhciBkZWNrID0gbmV3IERlY2sodGlsZXMpLnNodWZmbGUoKS50aWxlcztcbiAgICAgICAgdmFyIGRlY2tSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoZ2FtZU5hbWUpLmNoaWxkKCdkZWNrJyk7XG4gICAgICAgICRmaXJlYmFzZUFycmF5KGRlY2tSZWYpLiRhZGQoZGVjayk7XG5cblxuXG4gICAgICAgIHZhciBpbml0aWFsTWFya2Vyc1JlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZChnYW1lTmFtZSkuY2hpbGQoJ2F2YWlsYWJsZU1hcmtlcnMnKTtcbiAgICAgICAgJGZpcmViYXNlQXJyYXkoaW5pdGlhbE1hcmtlcnNSZWYpLiRhZGQoW1wicmVkXCIsIFwib3JhbmdlXCIsIFwieWVsbG93XCIsIFwiZ3JlZW5cIiwgXCJhcXVhXCIsIFwiYmx1ZVwiLCBcIm5hdnlcIiwgXCJwdXJwbGVcIl0pO1xuXG5cbiAgICAgICAgJHN0YXRlLmdvKCdnYW1lJywge1xuICAgICAgICAgICAgXCJnYW1lTmFtZVwiOiBnYW1lTmFtZVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmdvVG9HYW1lTGlzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHN0YXRlLmdvKCdnYW1lbGlzdCcpO1xuICAgIH07XG59KTtcbiIsIid1c2Ugc3RyaWN0J1xuXG5mdW5jdGlvbiBQbGF5ZXIodWlkKSB7XG4gICAgLy8gVE9ETzogZ2V0IHVpZCBmcm9tIGZpcmViYXNlIGF1dGhcbiAgICB0aGlzLnVpZCA9IHVpZDtcblxuICAgIHRoaXMubWFya2VyID0gXCJuXCI7XG5cbiAgICAvLyBzaG91bGQgYmUgYSBQb2ludCBvYmplY3RcbiAgICB0aGlzLnBvaW50ID0gXCJuXCI7XG5cbiAgICAvLyBbeCwgeV1cbiAgICAvLyBkZXBlbmRzIG9uIHRoZSBhbmd1bGFyIFNwYWNlLngsIFNwYWNlLnlcbiAgICB0aGlzLm5leHRTcGFjZSA9IFwiblwiO1xuXG4gICAgLy8gaW4gZWFjaCBTcGFjZS5wb2ludHMgYXJyYXksIGZpbmQgdGhpcyBzcGVjaWZpYyBwb2ludCBhbmQgZ2V0IHRoZSBwb3NpdGlvbiAoaW50ZWdlcikgaW5zaWRlIHRoaXMgc3BhY2UuXG4gICAgdGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9IFwiblwiO1xuXG4gICAgLy8gbWF4aW11biAzIHRpbGVzXG4gICAgdGhpcy50aWxlcyA9ICduJztcblxuICAgIC8vIGlmIGEgcGxheWVyIGRpZXMsIGl0IHdpbGwgYmUgY2hhbmdlZCB0byBmYWxzZVxuICAgIHRoaXMuY2FuUGxheSA9IHRydWU7XG59XG5QbGF5ZXIucHJvdG90eXBlLmhpID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkhJXCIpXG4gICAgfVxuICAgIC8vIG5lZWQgdG8gdXNlIHNlbGYgYmVjdXNlIHdlIG5lZWQgdG8gY2hhbmdlICRzY29wZS5tZSBvbiBnYW1lQ3RybCBhbmQgc2VuZCB0byBmaXJlYmFzZVxuUGxheWVyLnByb3RvdHlwZS5wbGFjZU1hcmtlciA9IGZ1bmN0aW9uIChib2FyZCwgcG9pbnQsIHNlbGYpIHtcbiAgICAvLyBwb2ludCBsb29rcyBsaWtlIFt4LCB5LCBwb2ludHNJbmRleF0gaW4gdGhlIHNwYWNlXG4gICAgdmFyIHggPSBwb2ludFswXTtcbiAgICB2YXIgeSA9IHBvaW50WzFdO1xuICAgIHZhciBwb2ludHNJbmRleCA9IHBvaW50WzJdO1xuXG4gICAgc2VsZi5wb2ludCA9IGJvYXJkW3ldW3hdLnBvaW50c1twb2ludHNJbmRleF07XG4gICAgc2VsZi5wb2ludC50cmF2ZWxsZWQgPSB0cnVlO1xuXG4gICAgLy9beCwgeV0gZnJvbSB0aGUgcG9pbnRcbiAgICBzZWxmLm5leHRTcGFjZSA9IGJvYXJkW3ldW3hdO1xuXG4gICAgLy8gaW4gZWFjaCBTcGFjZS5wb2ludHMgYXJyYXksIGZpbmQgdGhpcyBzcGVjaWZpYyBwb2ludCBhbmQgZ2V0IHRoZSBwb3NpdGlvbiAoaW50ZWdlcikgaW5zaWRlIHRoaXMgc3BhY2UuXG4gICAgc2VsZi5uZXh0U3BhY2VQb2ludHNJbmRleCA9IHNlbGYubmV4dFNwYWNlLnBvaW50cy5pbmRleE9mKHNlbGYucG9pbnQpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5uZXdTcGFjZSA9IGZ1bmN0aW9uIChib2FyZCwgb2xkU3BhY2UsIHNlbGYpIHtcbiAgICBpZiAoc2VsZi5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gMCB8fCBzZWxmLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSAxKSB7XG4gICAgICAgIHJldHVybiBib2FyZFtvbGRTcGFjZS55IC0gMV1bb2xkU3BhY2UueF07XG4gICAgfSBlbHNlIGlmIChzZWxmLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSAyIHx8IHNlbGYubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDMpIHtcbiAgICAgICAgcmV0dXJuIGJvYXJkW29sZFNwYWNlLnldW29sZFNwYWNlLnggKyAxXTtcbiAgICB9IGVsc2UgaWYgKHNlbGYubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDQgfHwgc2VsZi5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gNSkge1xuICAgICAgICByZXR1cm4gYm9hcmRbb2xkU3BhY2UueSArIDFdW29sZFNwYWNlLnhdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBib2FyZFtvbGRTcGFjZS55XVtvbGRTcGFjZS54IC0gMV07XG4gICAgfVxufTtcblxuLy8gbmVlZCB0byB1c2Ugc2VsZiBiZWN1c2Ugd2UgbmVlZCB0byBjaGFuZ2UgJHNjb3BlLm1lIG9uIGdhbWVDdHJsIGFuZCBzZW5kIHRvIGZpcmViYXNlXG5QbGF5ZXIucHJvdG90eXBlLnBsYWNlVGlsZSA9IGZ1bmN0aW9uICh0aWxlLCBzZWxmKSB7XG4gICAgc2VsZi50aWxlcyA9IHNlbGYudGlsZXMuZmlsdGVyKGZ1bmN0aW9uICh0KSB7XG4gICAgICAgIHJldHVybiB0LmlkICE9PSB0aWxlLmlkXG4gICAgfSk7XG5cbiAgICBzZWxmLm5leHRTcGFjZS50aWxlVXJsID0gdGlsZS5pbWFnZVVybDtcblxufTtcblxuUGxheWVyLnByb3RvdHlwZS5tb3ZlVG8gPSBmdW5jdGlvbiAocG9pbnRlcikge1xuICAgIC8vYWx3YXlzIGJlIHJldHVybmluZyAwIG9yIDEgcG9pbnQgaW4gdGhlIGFycmF5XG4gICAgbGV0IG5leHRQb2ludCA9IHBvaW50ZXIubmVpZ2hib3JzLmZpbHRlcihmdW5jdGlvbiAobmVpZ2hib3IpIHtcbiAgICAgICAgcmV0dXJuICFuZWlnaGJvci50cmF2ZWxsZWQgJiYgbmVpZ2hib3IgIT09IFwiblwiO1xuICAgIH0pWzBdO1xuICAgIHJldHVybiBuZXh0UG9pbnQ7XG59O1xuXG4vLyBUT0RPOiBub3Qgc3VyZSBob3cgdG8gbWFrZSB0aGlzIGtlZXAgbW92aW5nIHdpdGggcGxheWVycyBpbnN0ZWFkIG9mIHNlbGZcbi8vIFBsYXllci5wcm90b3R5cGUua2VlcE1vdmluZyA9IGZ1bmN0aW9uIChzZWxmKSB7XG4vLyAgICAgbGV0IG1vdmFibGUgPSBzZWxmLm1vdmVUbyhzZWxmLnBvaW50KTtcbi8vICAgICB3aGlsZSAobW92YWJsZSkge1xuLy8gICAgICAgICBzZWxmLnBvaW50LnRyYXZlbGxlZCA9IHRydWU7XG4vLyAgICAgICAgIHNlbGYucG9pbnQgPSBzZWxmLm1vdmVUbyhzZWxmLnBvaW50KTtcbi8vICAgICAgICAgbGV0IG9sZFNwYWNlID0gc2VsZi5uZXh0U3BhY2U7XG4vLyAgICAgICAgIGxldCBuZXdTcGFjZSA9IG5ld1NwYWNlKG9sZFNwYWNlKTtcbi8vICAgICAgICAgc2VsZi5uZXh0U3BhY2UgPSBuZXdTcGFjZTtcbi8vICAgICAgICAgc2VsZi5uZXh0U3BhY2VQb2ludHNJbmRleCA9IHNlbGYubmV4dFNwYWNlLnBvaW50cy5pbmRleE9mKHNlbGYucG9pbnQpO1xuLy8gICAgICAgICBzZWxmLmNoZWNrRGVhdGgoKTtcbi8vICAgICAgICAgbW92YWJsZSA9IHNlbGYubW92ZVRvKHNlbGYucG9pbnQpO1xuLy8gICAgIH1cbi8vIH07XG5cblBsYXllci5wcm90b3R5cGUuY2hlY2tEZWF0aCA9IGZ1bmN0aW9uIChzZWxmKSB7XG4gICAgdmFyIGFsbFRyYXZlbGxlZCA9IHNlbGYucG9pbnQubmVpZ2hib3JzLmZpbHRlcihmdW5jdGlvbiAobmVpZ2hib3IpIHtcbiAgICAgICAgcmV0dXJuIG5laWdoYm9yLnRyYXZlbGxlZDtcbiAgICB9KTtcblxuICAgIGlmIChzZWxmLnBvaW50LmVkZ2UgfHwgYWxsVHJhdmVsbGVkLmxlbmd0aCA9PT0gMikgc2VsZi5kaWUoKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUuZGllID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY2FuUGxheSA9IGZhbHNlO1xuICAgIC8vIFRPRE86IG5lZWQgdG8gc2VuZCBhbiBhbGVydCBvciBtZXNzYWdlIHRvIHRoZSBwbGF5ZXIgd2hvIGp1c3QgZGllZC5cbn07XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
