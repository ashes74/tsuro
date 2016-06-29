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
    this.image = null;
    this.points = [null, null, null, null, null, null, null, null];
    this.tileUrl;
    for (var i = 0; i < 8; i++) {
        var corresponding = void 0;

        if (i < 2) {
            //top
            corresponding = i === 0 ? 5 : 4; // 0 -> 5 & 1 -> 4
            if (y === 0) this.points[i] = new Point(true);else this.points[i] = board[y - 1][x].points[corresponding];
        } else if (i < 4) {
            //right
            if (x === 5) this.points[i] = new Point(true);else this.points[i] = new Point(false);
        } else if (i < 6) {
            //bottom
            if (y === 5) this.points[i] = new Point(true);else this.points[i] = new Point(false);
        } else {
            //left
            corresponding = i === 6 ? 3 : 2; // 6 -> 3 & 7 -> 2
            if (x === 0) this.points[i] = new Point(true);else {
                this.points[i] = board[y][x - 1].points[corresponding];
            }
        }
    }
}

// edge = boolean
function Point(edge) {
    this.edge = edge;
    this.neighbors = [];
    this.travelled = false;
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
                return player.keepMoving();
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
        key: 'reset',


        //restart the game
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

tsuro.controller('gameCtrl', function ($scope, $firebaseAuth, firebaseUrl, $stateParams, $firebaseObject) {
    var auth = $firebaseAuth();
    var firebaseUser = auth.$getAuth();

    var ref = firebase.database().ref();
    var obj = $firebaseObject(ref);

    var gameRef = ref.child('games').child($stateParams.gameName);
    var deckRef = gameRef.child('initialDeck');
    var playersRef = gameRef.child('players');
    var markersRef = gameRef.child('availableMarkers');

    //intialize game
    $scope.game = new Game($stateParams.gameName, $stateParams.deck);

    $scope.game.deck = $firebaseObject(deckRef);

    markersRef.on('value', function (availableMarkers) {
        $scope.availableMarkers = Object.keys(availableMarkers).map(function (i) {

            return availableMarkers[i];
        });
    });
    console.log($scope.game);
    var board = $scope.game.board;

    //take all players on firebase and turn them into local player
    playersRef.on("child_added", function (player) {
        var newPlayer = new Player(player.uid);
        newPlayer.marker = player.marker;

        var x = player.startingPosition[0];
        var y = player.startingPosition[1];
        var pointsIndex = player.startingPosition[2];

        newPlayer.point = board[y][x].points[pointsIndex];
        newPlayer.nextSpace = board[y][x];
        newPlayer.nextSpacePointsIndex = player.startingPosition[2];

        newPlayer.tiles = $scope.game.deck.dealThree();

        $scope.game.players.push(newPlayer);
    });

    //get 'me'
    $scope.me = $scope.game.players.filter(function (player) {
        return player.uid === firebaseUser.uid;
    })[0];

    //Have player pick the marker
    $scope.pickMarker = function (board, marker) {
        $scope.me.marker = marker;
        var markers = $firebaseArray(markersRef);
        var idx = markers.indexOf(marker);
        markers.$remove(markers[idx]).then(function (ref) {
            console.log(ref.key);
        });
    };

    //Have player pick their start point

    $scope.placeMarker = function (board, point) {
        $scope.me.placeMarker(point);
        $scope.game.players.push($scope.player);

        gameRef.child('players').child(player.uid).push({
            'marker': player.marker,
            'startingPosition': player.startingPosition
        });
    };

    // TODO: we probably need this on firebase so other people can't pick what's been picked

    //For synchronizingGame...
    var syncRef = new Firebase(gameRef + '/moves');
    syncRef.on('child_added', function (childSnapshot, prevChildKey) {
        //NEED TO DOUBLE CHECK!! What does childSnap returns?
        console.log('childSnapshot_SyncGame', childSnapshot);
        //depending on what childSnapshot gives me...I think it's one child per on call? It doesn't return an array of changes...I believe!
        if (childSnapshot.type === 'updateDeck') {
            $scope.game.deck = childSnapshot.updateDeck;
        } else {
            $scope.placeTile(childSnapshot.tile);
        }
    });

    // TODO: how to re-do the moves?
    // $scope.game.moves;

    // TODO: how do we show the tiles for player?

    // TODO: how to show the rotated tile?

    // CMT: assuming we use new Game() for each game
    $scope.currentPlayer = $scope.game.getCurrentPlayer();

    // CMT: assuming we use new Game() for each game, holds all the players still on the board.
    $scope.turnOrderArray = $scope.game.getCanPlay();

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
    };

    $scope.rotateTileCcw = function (tile) {
        tile.rotation--;
        if (tile.rotation === -4) tile.rotation = 0;
    };

    // CMT: assuming we use new Game()
    // CMT: use player's and game's prototype function to place tile and then move all players
    $scope.placeTile = function (tile) {
        // TODO: send this state to firebase every time it's called
        if (tile.rotation > 0) {
            tile.paths = tile.paths.map(function (connection) {
                return connection + 2;
            });
            tile.paths.unshift(tile.paths.pop());
            tile.paths.unshift(tile.paths.pop());
        } else if (tile.rotation < 0) {
            tile.paths = tile.paths.map(function (connection) {
                return connection - 2;
            });
            tile.paths.push(tile.paths.shift());
            tile.paths.push(tile.paths.shift());
        }

        $scope.me.placeTile(tile);
        gameRef.child('moves').push({
            'type': 'placeTile',
            'tile': tile
        });

        $scope.game.moveAllplayers();

        if ($scope.game.checkOver()) {
            // TODO: need to tell the player she won
            $scope.winner = $scope.game.getCanPlay()[0];
            $scope.gameOver = true;
        } else {
            // If deck is empty & no one is dragon, set me as dragon
            if ($scope.game.deck.length === 0 && !$scope.dragon) {
                $scope.dragon = $scope.me;
            } else if ($scope.game.deck.length === 0 && $scope.dragon) {
                awaitingDragonHolders.push($scope.me);
            } else {
                // CMT: draw one tile and push it to the player.tiles array
                $scope.me.tiles.push($scope.game.deck.deal(1));
                //if dead players, then push their cards back to the deck & reshuffle
                if ($scope.game.deadPlayers().length) {
                    //with new cards & need to reshuffle
                    $scope.game.deadPlayers().forEach(function (deadPlayerTiles) {
                        deadPlayerTiles.forEach(function (tile) {
                            $scope.game.deck.push(tile);
                        });
                    });
                    $scope.game.deck = $scope.game.deck.shuffle();
                    //send firebase a new move
                    gameRef.child('moves').push({
                        'type': 'updateDeck',
                        'updateDeck': $scope.game.deck
                    });
                    if ($scope.dragon) {
                        $scope.dragon.tiles.push($scope.game.deck.deal(1));
                        $scope.dragon = null;
                        //NEED TO DISCUSS: Might need to modify this if we want to use up the cards and give each awaiting players' up to 3 cards
                        while ($scope.game.deck.length && $scope.awaitingDragonHolders.length) {
                            $scope.awaitingDragonHolders.shift().tiles.push($scope.game.deck.deal(1));
                        };
                        if ($scope.awaitingDragonHolders.length) {
                            $scope.dragon = $scope.awaitingDragonHolders.shift();
                        }
                    };
                }
            }
            $scope.game.goToNextPlayer();
        }
    };

    // TODO: firebase game.players slice $scope.player out
    $scope.leaveGame;

    // TODO: do we remove this game room's moves from firebase?
    $scope.reset = $scope.game.reset;

    $scope.starttop = [[0, 0, 0], [0, 0, 1], [1, 0, 0], [1, 0, 1], [2, 0, 0], [2, 0, 1], [3, 0, 0], [3, 0, 1], [4, 0, 0], [4, 0, 1], [5, 0, 0], [5, 0, 1]];
    $scope.startleft = [[0, 0, 7], [0, 0, 6], [0, 1, 7], [0, 1, 6], [0, 2, 7], [0, 2, 6], [0, 3, 7], [0, 3, 6], [0, 4, 7], [0, 4, 6], [0, 5, 7], [0, 5, 6]];
    $scope.startbottom = [[0, 5, 0], [0, 5, 1], [1, 5, 0], [1, 5, 1], [2, 5, 0], [2, 5, 1], [3, 5, 0], [3, 5, 1], [4, 5, 0], [4, 5, 1], [5, 5, 0], [5, 5, 1]];
    $scope.startright = [[5, 0, 2], [5, 0, 3], [5, 1, 2], [5, 1, 3], [5, 2, 2], [5, 2, 3], [5, 3, 2], [5, 3, 3], [5, 4, 2], [5, 4, 3], [5, 5, 2], [5, 5, 3]];
});

tsuro.config(function ($stateProvider) {
    $stateProvider.state('gamelist', {
        url: '/gamelist',
        templateUrl: '/browser/js/gamelist/gamelist.html',
        controller: 'gameList'
    });
});

tsuro.controller('gameList', function ($scope, firebaseUrl, $firebaseObject, $state) {
    //For synchronizingGameList...
    var ref = firebase.database().ref();
    var obj = $firebaseObject(ref);

    var synchRef = ref.child("games");
    console.log(synchRef);

    var synchronizedObj = $firebaseObject(synchRef);
    console.log(synchronizedObj);

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
        console.log(gameName);
        $state.go('game', {
            "gameName": gameName
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

tsuro.controller('loginCtrl', function ($scope, $state, $firebaseAuth) {
    var auth = $firebaseAuth();

    $scope.logInWithGoogle = function () {
        auth.$signInWithPopup("google").then(function (authData) {
            console.log("Logged in as:", authData);
        }).catch(function (error) {
            console.error("Authentication failed:", error);
        });

        $state.go('pickGame');
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

    $scope.test = "hi";

    $scope.createGame = function (gameName) {
        var gameNameRef = ref.child('games').child(gameName);
        $firebaseArray(gameNameRef).$add({
            "gameName": gameName
        });

        obj.$loaded().then(function (data) {
            var tiles = data.tiles;
            var deck = new Deck(tiles).shuffle().tiles;
            var initialDeckRef = ref.child('games').child(gameName).child('initialDeck');
            $firebaseArray(initialDeckRef).$add(deck);
        });

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

    this.marker = null;

    // should be a Point object
    this.point = null;

    // [x, y]
    // depends on the angular Space.x, Space.y
    this.nextSpace = null;

    // in each Space.points array, find this specific point and get the position (integer) inside this space.
    this.nextSpacePointsIndex = null;

    // maximun 3 tiles
    this.tiles = [];

    // if a player dies, it will be changed to false
    this.canPlay = true;
}

Player.prototype.placeMarker = function (board, point) {
    // point looks like [x, y, pointsIndex] in the space
    var x = point[0];
    var y = point[1];
    var pointsIndex = point[2];

    this.point = board[y][x].points[pointsIndex];
    this.point.travelled = true;

    //[x, y] from the point
    this.nextSpace = board[y][x];

    // in each Space.points array, find this specific point and get the position (integer) inside this space.
    this.nextSpacePointsIndex = this.nextSpace.points.indexOf(this.point);
};

Player.prototype.newSpace = function (board, oldSpace) {
    if (this.nextSpacePointsIndex === 0 || this.nextSpacePointsIndex === 1) {
        return board[oldSpace.y - 1][oldSpace.x];
    } else if (this.nextSpacePointsIndex === 2 || this.nextSpacePointsIndex === 3) {
        return board[oldSpace.y][oldSpace.x + 1];
    } else if (this.nextSpacePointsIndex === 4 || this.nextSpacePointsIndex === 5) {
        return board[oldSpace.y + 1][oldSpace.x];
    } else {
        return board[oldSpace.y][oldSpace.x - 1];
    }
};

Player.prototype.placeTile = function (tile) {
    var index = this.tiles.indexOf(tile);
    this.tiles.splice(index, 1);

    this.nextSpace.tileUrl = tile.imageUrl;

    for (var i = 0; i < tile.length; i++) {
        this.nextSpace.points[i].neighbors.push(this.nextSpace.points[tile[i]]);
    }
};

Player.prototype.moveTo = function (pointer) {
    // let pointer = pointer;

    //always be returning 0 or 1 point in the array
    var nextPoint = pointer.neighbors.filter(function (neighbor) {
        return !neighbor.travelled;
    })[0];

    return nextPoint;
};

Player.prototype.keepMoving = function () {
    var movable = this.moveTo(this.point);
    while (movable) {
        this.point.travelled = true;
        this.point = this.moveTo(this.point);
        var oldSpace = this.nextSpace;
        var newSpace = newSpace(oldSpace);
        this.nextSpace = newSpace;

        this.checkDeath();
        movable = this.moveTo(this.point);
    }
};

Player.prototype.checkDeath = function () {
    var allTravelled = this.point.neighbors.filter(function (neighbor) {
        return neighbor.travelled;
    });

    if (this.point.edge || allTravelled.length === 2) this.die();
};

Player.prototype.die = function () {
    this.canPlay = false;
    // TODO: need to send an alert or message to the player who just died.
};

var tiles = [{
    imageUrl: "",
    paths: [3, 4, 6, 0, 1, 7, 2, 5],
    rotation: 0
}, {
    imageUrl: "",
    paths: [1, 0, 4, 7, 2, 6, 5, 3],
    rotation: 0
}, {
    imageUrl: "",
    paths: [1, 0, 4, 6, 2, 7, 3, 5],
    rotation: 0
}, {
    imageUrl: "",
    paths: [2, 5, 0, 7, 6, 1, 4, 3],
    rotation: 0
}, {
    imageUrl: "",
    paths: [4, 2, 1, 6, 0, 7, 3, 5],
    rotation: 0
}, {
    imageUrl: "",
    paths: [1, 0, 5, 7, 6, 2, 4, 3],
    rotation: 0
}, {
    imageUrl: "",
    paths: [2, 4, 0, 6, 1, 7, 3, 5],
    rotation: 0
}, {
    imageUrl: "",
    paths: [2, 5, 0, 6, 7, 1, 3, 4],
    rotation: 0
}, {
    imageUrl: "",
    paths: [1, 0, 7, 6, 5, 4, 3, 2],
    rotation: 0
}, {
    imageUrl: "",
    paths: [4, 5, 6, 7, 0, 1, 2, 3],
    rotation: 0
}, {
    imageUrl: "",
    paths: [7, 2, 1, 4, 3, 6, 5, 0],
    rotation: 0
}, {
    imageUrl: "",
    paths: [2, 7, 0, 5, 6, 3, 4, 1],
    rotation: 0
}, {
    imageUrl: "",
    paths: [5, 4, 7, 6, 1, 0, 3, 2],
    rotation: 0
}, {
    imageUrl: "",
    paths: [3, 2, 1, 0, 7, 6, 5, 4],
    rotation: 0
}, {
    imageUrl: "",
    paths: [1, 0, 7, 4, 3, 6, 5, 2],
    rotation: 0
}, {
    imageUrl: "",
    paths: [1, 0, 5, 6, 7, 2, 3, 4],
    rotation: 0
}, {
    imageUrl: "",
    paths: [3, 5, 6, 0, 7, 1, 2, 4],
    rotation: 0
}, {
    imageUrl: "",
    paths: [2, 7, 0, 4, 3, 6, 5, 1],
    rotation: 0
}, {
    imageUrl: "",
    paths: [4, 3, 6, 1, 0, 7, 2, 5],
    rotation: 0
}, {
    imageUrl: "",
    paths: [2, 6, 0, 4, 3, 7, 1, 5],
    rotation: 0
}, {
    imageUrl: "",
    paths: [2, 3, 0, 1, 7, 6, 5, 4],
    rotation: 0
}, {
    imageUrl: "",
    paths: [2, 6, 0, 5, 7, 3, 1, 4],
    rotation: 0
}, {
    imageUrl: "",
    paths: [1, 0, 6, 4, 3, 7, 2, 5],
    rotation: 0
}, {
    imageUrl: "",
    paths: [3, 4, 7, 0, 1, 6, 5, 2],
    rotation: 0
}, {
    imageUrl: "",
    paths: [1, 0, 3, 2, 7, 6, 5, 4],
    rotation: 0
}, {
    imageUrl: "",
    paths: [1, 0, 6, 7, 5, 4, 2, 3],
    rotation: 0
}, {
    imageUrl: "",
    paths: [2, 4, 0, 7, 1, 6, 5, 3],
    rotation: 0
}, {
    imageUrl: "",
    paths: [4, 2, 1, 7, 0, 6, 5, 3],
    rotation: 0
}, {
    imageUrl: "",
    paths: [1, 0, 3, 2, 5, 4, 7, 6],
    rotation: 0
}, {
    imageUrl: "",
    paths: [2, 3, 0, 1, 6, 7, 4, 5],
    rotation: 0
}, {
    imageUrl: "",
    paths: [3, 6, 5, 0, 7, 2, 1, 4],
    rotation: 0
}, {
    imageUrl: "",
    paths: [1, 0, 6, 5, 7, 3, 2, 4],
    rotation: 0
}, {
    imageUrl: "",
    paths: [1, 0, 3, 2, 6, 7, 4, 5],
    rotation: 0
}, {
    imageUrl: "",
    paths: [4, 5, 7, 6, 0, 1, 3, 2],
    rotation: 0
}, {
    imageUrl: "",
    paths: [1, 0, 7, 5, 6, 3, 4, 2],
    rotation: 0
}];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImdhbWUvYm9hcmQuanMiLCJnYW1lL2RlY2suanMiLCJnYW1lL2dhbWUuY29udHJ1Y3Rvci5qcyIsImdhbWUvZ2FtZS5qcyIsImdhbWVsaXN0L2dhbWVsaXN0LmpzIiwibG9naW4vbG9naW4uanMiLCJwaWNrR2FtZS9waWNrR2FtZS5qcyIsInBsYXllci9wbGF5ZXIuanMiLCJ0aWxlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFBLFFBQUEsUUFBQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsV0FBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBOztBQUVBLE1BQUEsTUFBQSxDQUFBLFlBQUE7QUFDQSxRQUFBLFNBQUE7QUFDQSxnQkFBQSx5Q0FEQTtBQUVBLG9CQUFBLHNDQUZBO0FBR0EscUJBQUEsNkNBSEE7QUFJQSx1QkFBQTtBQUpBLEtBQUE7QUFNQSxhQUFBLGFBQUEsQ0FBQSxNQUFBO0FBQ0EsQ0FSQTs7QUFVQSxNQUFBLFFBQUEsQ0FBQSxhQUFBLEVBQUEsNENBQUE7O0FBRUEsTUFBQSxNQUFBLENBQUEsVUFBQSxrQkFBQSxFQUFBO0FBQ0EsdUJBQUEsU0FBQSxDQUFBLEdBQUE7QUFDQSxDQUZBOztBQ2RBLFNBQUEsS0FBQSxHQUFBO0FBQ0EsU0FBQSxLQUFBLEdBQUEsRUFBQTtBQUNBOztBQUVBLE1BQUEsU0FBQSxDQUFBLFNBQUEsR0FBQSxZQUFBO0FBQ0EsU0FBQSxJQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQSxDQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxpQkFBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLElBQUEsQ0FBQSxJQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEtBQUEsS0FBQSxDQUFBO0FBQ0E7QUFDQTtBQUNBLFdBQUEsS0FBQSxLQUFBO0FBQ0EsQ0FSQTs7QUFVQSxTQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEtBQUEsRUFBQTtBQUNBLFNBQUEsQ0FBQSxHQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsU0FBQSxLQUFBLEdBQUEsSUFBQTtBQUNBLFNBQUEsTUFBQSxHQUFBLENBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsT0FBQTtBQUNBLFNBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLHNCQUFBOztBQUVBLFlBQUEsSUFBQSxDQUFBLEVBQUE7O0FBQ0EsNEJBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsQztBQUNBLGdCQUFBLE1BQUEsQ0FBQSxFQUFBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxLQUNBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxNQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxNQUFBLENBQUEsYUFBQSxDQUFBO0FBQ0EsU0FKQSxNQUlBLElBQUEsSUFBQSxDQUFBLEVBQUE7O0FBQ0EsZ0JBQUEsTUFBQSxDQUFBLEVBQUEsS0FBQSxNQUFBLENBQUEsQ0FBQSxJQUFBLElBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLEtBQ0EsS0FBQSxNQUFBLENBQUEsQ0FBQSxJQUFBLElBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLFNBSEEsTUFHQSxJQUFBLElBQUEsQ0FBQSxFQUFBOztBQUNBLGdCQUFBLE1BQUEsQ0FBQSxFQUFBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxLQUNBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxTQUhBLE1BR0E7O0FBQ0EsNEJBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsQztBQUNBLGdCQUFBLE1BQUEsQ0FBQSxFQUFBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxLQUNBO0FBQ0EscUJBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxNQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsRUFBQSxNQUFBLENBQUEsYUFBQSxDQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUlBLFNBQUEsS0FBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFNBQUEsSUFBQSxHQUFBLElBQUE7QUFDQSxTQUFBLFNBQUEsR0FBQSxFQUFBO0FBQ0EsU0FBQSxTQUFBLEdBQUEsS0FBQTtBQUNBOztBQ2pEQTs7SUFFQSxJO0FBQ0Esa0JBQUEsS0FBQSxFQUFBO0FBQUE7O0FBQ0EsYUFBQSxLQUFBLEdBQUEsS0FBQTtBQUNBOzs7O2tDQUVBO0FBQ0EsaUJBQUEsS0FBQSxHQUFBLEVBQUEsT0FBQSxDQUFBLEtBQUEsS0FBQSxDQUFBO0FBQ0EsbUJBQUEsSUFBQTtBQUNBOzs7b0NBRUE7QUFDQSxtQkFBQSxLQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtBQUNBOzs7NkJBRUEsRyxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxLQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsRUFBQSxHQUFBLENBQUE7QUFDQTs7OytCQUVBLEssRUFBQTtBQUNBLGlCQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQTtBQUNBLG1CQUFBLElBQUE7QUFDQTs7Ozs7O0FDdkJBOzs7O0lBSUEsSTtBQUNBLGtCQUFBLElBQUEsRUFBQTtBQUFBOztBQUNBLGFBQUEsSUFBQSxHQUFBLElBQUE7QUFDQSxhQUFBLEtBQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxLQUFBLEdBQUEsSUFBQSxLQUFBLEdBQUEsU0FBQSxFQUFBO0FBQ0EsYUFBQSxPQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsZ0JBQUEsR0FBQSxDQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsUUFBQSxFQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxRQUFBLENBQUE7O0FBRUEsYUFBQSxVQUFBLEM7QUFDQSxhQUFBLGNBQUEsR0FBQSxFQUFBLEM7QUFDQSxhQUFBLE1BQUEsR0FBQSxFQUFBLEM7QUFDQSxhQUFBLEtBQUE7QUFDQTs7OzsyQ0FFQTtBQUNBLGdCQUFBLEtBQUEsVUFBQSxLQUFBLENBQUEsQ0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxjQUFBLENBQUEsS0FBQSxVQUFBLENBQUE7QUFDQTs7O3lDQUVBO0FBQ0EsaUJBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLE1BQUE7QUFBQSx1QkFBQSxPQUFBLFVBQUEsRUFBQTtBQUFBLGFBQUE7QUFDQTs7O3NDQUNBO0FBQ0EsZ0JBQUEsbUJBQUEsRUFBQTtBQUNBLGlCQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxvQkFBQSxDQUFBLE9BQUEsT0FBQSxJQUFBLE9BQUEsS0FBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLEVBQUE7QUFDQSxxQ0FBQSxJQUFBLENBQUEsT0FBQSxLQUFBO0FBQ0EsbUNBQUEsSUFBQTtBQUNBO0FBQ0EsYUFMQTtBQU1BLG1CQUFBLGdCQUFBO0FBQ0E7OztvQ0FFQTtBQUNBLG1CQUFBLGFBQUEsTUFBQSxJQUFBLENBQUE7QUFDQTs7Ozs7O3lDQUdBO0FBQ0EsZ0JBQUEsV0FBQSxLQUFBLGNBQUEsRUFBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0Esb0JBQUEsU0FBQSxLQUFBLFVBQUEsR0FBQSxDQUFBO0FBQ0EsdUJBQUEsQ0FBQSxLQUFBLGNBQUEsQ0FBQSxTQUFBLENBQUEsRUFBQSxPQUFBLEVBQUE7QUFDQTtBQUNBO0FBQ0EscUJBQUEsVUFBQSxHQUFBLE1BQUE7QUFDQSxhQU5BLE1BTUE7QUFDQSxxQkFBQSxVQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQSxtQkFBQSxLQUFBLGdCQUFBLEVBQUE7QUFDQTs7Ozs7O2dDQUdBO0FBQUE7O0FBQ0EsaUJBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxrQkFBQTs7O0FBR0Esc0JBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLEtBQUEsRUFBQSxPQUFBO0FBQ0EsdUJBQUEsS0FBQSxHQUFBLEVBQUE7O0FBRUEsdUJBQUEsT0FBQSxHQUFBLElBQUE7QUFDQSxhQVBBO0FBUUE7Ozs7Ozs7Ozs7O0FBT0EsSUFBQSxhQUFBLFNBQUEsVUFBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsUUFBQSxNQUFBLENBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxlQUFBLE9BQUEsT0FBQTtBQUNBLEtBRkEsQ0FBQTtBQUdBLENBSkE7O0FDeEVBLE1BQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLGFBQUEsaUJBREE7QUFFQSxxQkFBQSw0QkFGQTtBQUdBLG9CQUFBO0FBSEEsS0FBQTtBQUtBLENBTkE7O0FBUUEsTUFBQSxVQUFBLENBQUEsVUFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLGFBQUEsRUFBQSxXQUFBLEVBQUEsWUFBQSxFQUFBLGVBQUEsRUFBQTtBQUNBLFFBQUEsT0FBQSxlQUFBO0FBQ0EsUUFBQSxlQUFBLEtBQUEsUUFBQSxFQUFBOztBQUVBLFFBQUEsTUFBQSxTQUFBLFFBQUEsR0FBQSxHQUFBLEVBQUE7QUFDQSxRQUFBLE1BQUEsZ0JBQUEsR0FBQSxDQUFBOztBQUVBLFFBQUEsVUFBQSxJQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsS0FBQSxDQUFBLGFBQUEsUUFBQSxDQUFBO0FBQ0EsUUFBQSxVQUFBLFFBQUEsS0FBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLFFBQUEsYUFBQSxRQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUE7QUFDQSxRQUFBLGFBQUEsUUFBQSxLQUFBLENBQUEsa0JBQUEsQ0FBQTs7O0FBR0EsV0FBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsYUFBQSxRQUFBLEVBQUEsYUFBQSxJQUFBLENBQUE7O0FBRUEsV0FBQSxJQUFBLENBQUEsSUFBQSxHQUFBLGdCQUFBLE9BQUEsQ0FBQTs7QUFHQSxlQUFBLEVBQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQSxnQkFBQSxFQUFBO0FBQ0EsZUFBQSxnQkFBQSxHQUFBLE9BQUEsSUFBQSxDQUFBLGdCQUFBLEVBQUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBOztBQUVBLG1CQUFBLGlCQUFBLENBQUEsQ0FBQTtBQUNBLFNBSEEsQ0FBQTtBQUlBLEtBTEE7QUFNQSxZQUFBLEdBQUEsQ0FBQSxPQUFBLElBQUE7QUFDQSxRQUFBLFFBQUEsT0FBQSxJQUFBLENBQUEsS0FBQTs7O0FBSUEsZUFBQSxFQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0EsWUFBQSxZQUFBLElBQUEsTUFBQSxDQUFBLE9BQUEsR0FBQSxDQUFBO0FBQ0Esa0JBQUEsTUFBQSxHQUFBLE9BQUEsTUFBQTs7QUFFQSxZQUFBLElBQUEsT0FBQSxnQkFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsSUFBQSxPQUFBLGdCQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxjQUFBLE9BQUEsZ0JBQUEsQ0FBQSxDQUFBLENBQUE7O0FBRUEsa0JBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxNQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0Esa0JBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLGtCQUFBLG9CQUFBLEdBQUEsT0FBQSxnQkFBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSxrQkFBQSxLQUFBLEdBQUEsT0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsRUFBQTs7QUFFQSxlQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLFNBQUE7QUFDQSxLQWZBOzs7QUFrQkEsV0FBQSxFQUFBLEdBQUEsT0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGVBQUEsT0FBQSxHQUFBLEtBQUEsYUFBQSxHQUFBO0FBQ0EsS0FGQSxFQUVBLENBRkEsQ0FBQTs7O0FBTUEsV0FBQSxVQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsTUFBQSxHQUFBLE1BQUE7QUFDQSxZQUFBLFVBQUEsZUFBQSxVQUFBLENBQUE7QUFDQSxZQUFBLE1BQUEsUUFBQSxPQUFBLENBQUEsTUFBQSxDQUFBO0FBQ0EsZ0JBQUEsT0FBQSxDQUFBLFFBQUEsR0FBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0Esb0JBQUEsR0FBQSxDQUFBLElBQUEsR0FBQTtBQUNBLFNBRkE7QUFHQSxLQVBBOzs7O0FBV0EsV0FBQSxXQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsV0FBQSxDQUFBLEtBQUE7QUFDQSxlQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsTUFBQTs7QUFFQSxnQkFBQSxLQUFBLENBQUEsU0FBQSxFQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxJQUFBLENBQUE7QUFDQSxzQkFBQSxPQUFBLE1BREE7QUFFQSxnQ0FBQSxPQUFBO0FBRkEsU0FBQTtBQUlBLEtBUkE7Ozs7O0FBYUEsUUFBQSxVQUFBLElBQUEsUUFBQSxDQUFBLFVBQUEsUUFBQSxDQUFBO0FBQ0EsWUFBQSxFQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsYUFBQSxFQUFBLFlBQUEsRUFBQTs7QUFFQSxnQkFBQSxHQUFBLENBQUEsd0JBQUEsRUFBQSxhQUFBOztBQUVBLFlBQUEsY0FBQSxJQUFBLEtBQUEsWUFBQSxFQUFBO0FBQ0EsbUJBQUEsSUFBQSxDQUFBLElBQUEsR0FBQSxjQUFBLFVBQUE7QUFDQSxTQUZBLE1BRUE7QUFDQSxtQkFBQSxTQUFBLENBQUEsY0FBQSxJQUFBO0FBQ0E7QUFDQSxLQVRBOzs7Ozs7Ozs7O0FBbUJBLFdBQUEsYUFBQSxHQUFBLE9BQUEsSUFBQSxDQUFBLGdCQUFBLEVBQUE7OztBQUdBLFdBQUEsY0FBQSxHQUFBLE9BQUEsSUFBQSxDQUFBLFVBQUEsRUFBQTs7O0FBR0EsV0FBQSxNQUFBO0FBQ0EsUUFBQSx3QkFBQSxFQUFBOztBQUdBLFdBQUEsS0FBQSxHQUFBLFlBQUE7O0FBRUEsS0FGQTs7QUFJQSxXQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsZUFBQSxFQUFBLEtBQUEsT0FBQSxhQUFBO0FBQ0EsS0FGQTs7O0FBS0EsV0FBQSxZQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLFFBQUE7QUFDQSxZQUFBLEtBQUEsUUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLFFBQUEsR0FBQSxDQUFBO0FBQ0EsS0FIQTs7QUFLQSxXQUFBLGFBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsUUFBQTtBQUNBLFlBQUEsS0FBQSxRQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxRQUFBLEdBQUEsQ0FBQTtBQUNBLEtBSEE7Ozs7QUFPQSxXQUFBLFNBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTs7QUFFQSxZQUFBLEtBQUEsUUFBQSxHQUFBLENBQUEsRUFBQTtBQUNBLGlCQUFBLEtBQUEsR0FBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxVQUFBLEVBQUE7QUFDQSx1QkFBQSxhQUFBLENBQUE7QUFDQSxhQUZBLENBQUE7QUFHQSxpQkFBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGlCQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsU0FOQSxNQU1BLElBQUEsS0FBQSxRQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxHQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQTtBQUNBLHVCQUFBLGFBQUEsQ0FBQTtBQUNBLGFBRkEsQ0FBQTtBQUdBLGlCQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQTs7QUFFQSxlQUFBLEVBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQTtBQUNBLGdCQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsSUFBQSxDQUFBO0FBQ0Esb0JBQUEsV0FEQTtBQUVBLG9CQUFBO0FBRkEsU0FBQTs7QUFLQSxlQUFBLElBQUEsQ0FBQSxjQUFBOztBQUVBLFlBQUEsT0FBQSxJQUFBLENBQUEsU0FBQSxFQUFBLEVBQUE7O0FBRUEsbUJBQUEsTUFBQSxHQUFBLE9BQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxtQkFBQSxRQUFBLEdBQUEsSUFBQTtBQUNBLFNBSkEsTUFJQTs7QUFFQSxnQkFBQSxPQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsTUFBQSxFQUFBO0FBQ0EsdUJBQUEsTUFBQSxHQUFBLE9BQUEsRUFBQTtBQUNBLGFBRkEsTUFFQSxJQUFBLE9BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLEtBQUEsQ0FBQSxJQUFBLE9BQUEsTUFBQSxFQUFBO0FBQ0Esc0NBQUEsSUFBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLGFBRkEsTUFFQTs7QUFFQSx1QkFBQSxFQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSxvQkFBQSxPQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsTUFBQSxFQUFBOztBQUVBLDJCQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsT0FBQSxDQUFBLFVBQUEsZUFBQSxFQUFBO0FBQ0Esd0NBQUEsT0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsbUNBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQTtBQUNBLHlCQUZBO0FBR0EscUJBSkE7QUFLQSwyQkFBQSxJQUFBLENBQUEsSUFBQSxHQUFBLE9BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEVBQUE7O0FBRUEsNEJBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxJQUFBLENBQUE7QUFDQSxnQ0FBQSxZQURBO0FBRUEsc0NBQUEsT0FBQSxJQUFBLENBQUE7QUFGQSxxQkFBQTtBQUlBLHdCQUFBLE9BQUEsTUFBQSxFQUFBO0FBQ0EsK0JBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSwrQkFBQSxNQUFBLEdBQUEsSUFBQTs7QUFFQSwrQkFBQSxPQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxJQUFBLE9BQUEscUJBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxtQ0FBQSxxQkFBQSxDQUFBLEtBQUEsR0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQSw0QkFBQSxPQUFBLHFCQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsbUNBQUEsTUFBQSxHQUFBLE9BQUEscUJBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBLG1CQUFBLElBQUEsQ0FBQSxjQUFBO0FBQ0E7QUFDQSxLQW5FQTs7O0FBc0VBLFdBQUEsU0FBQTs7O0FBR0EsV0FBQSxLQUFBLEdBQUEsT0FBQSxJQUFBLENBQUEsS0FBQTs7QUFHQSxXQUFBLFFBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBLEVBR0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQSxFQUlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSkEsRUFLQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUxBLEVBTUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FOQSxFQU9BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUEEsRUFRQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVJBLEVBU0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FUQSxFQVVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVkEsRUFXQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVhBLEVBWUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FaQSxDQUFBO0FBY0EsV0FBQSxTQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQURBLEVBRUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQSxFQUdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEEsRUFJQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUpBLEVBS0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FMQSxFQU1BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTkEsRUFPQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVBBLEVBUUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FSQSxFQVNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVEEsRUFVQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVZBLEVBV0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FYQSxFQVlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWkEsQ0FBQTtBQWNBLFdBQUEsV0FBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBLEVBSUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FKQSxFQUtBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQU5BLEVBT0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FQQSxFQVFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUkEsRUFTQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVRBLEVBVUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FWQSxFQVdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWEEsRUFZQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVpBLENBQUE7QUFjQSxXQUFBLFVBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBLEVBR0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQSxFQUlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSkEsRUFLQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUxBLEVBTUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FOQSxFQU9BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUEEsRUFRQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVJBLEVBU0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FUQSxFQVVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVkEsRUFXQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVhBLEVBWUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FaQSxDQUFBO0FBZUEsQ0FyUUE7O0FDUkEsTUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsYUFBQSxXQURBO0FBRUEscUJBQUEsb0NBRkE7QUFHQSxvQkFBQTtBQUhBLEtBQUE7QUFLQSxDQU5BOztBQVFBLE1BQUEsVUFBQSxDQUFBLFVBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsZUFBQSxFQUFBLE1BQUEsRUFBQTs7QUFFQSxRQUFBLE1BQUEsU0FBQSxRQUFBLEdBQUEsR0FBQSxFQUFBO0FBQ0EsUUFBQSxNQUFBLGdCQUFBLEdBQUEsQ0FBQTs7QUFFQSxRQUFBLFdBQUEsSUFBQSxLQUFBLENBQUEsT0FBQSxDQUFBO0FBQ0EsWUFBQSxHQUFBLENBQUEsUUFBQTs7QUFFQSxRQUFBLGtCQUFBLGdCQUFBLFFBQUEsQ0FBQTtBQUNBLFlBQUEsR0FBQSxDQUFBLGVBQUE7Ozs7QUFJQSxvQkFBQSxPQUFBLENBQUEsTUFBQSxFQUFBLFVBQUEsRUFDQSxJQURBLENBQ0EsWUFBQTtBQUNBLFlBQUEsV0FBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsSUFBQSxPQUFBLFFBQUEsRUFBQTtBQUNBLHFCQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxPQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBO0FBQ0EsZUFBQSxTQUFBLEdBQUEsU0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsS0FQQTs7QUFVQSxXQUFBLElBQUEsR0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGdCQUFBLEdBQUEsQ0FBQSxRQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0Esd0JBQUE7QUFEQSxTQUFBO0FBR0EsS0FMQTtBQU1BLENBN0JBOztBQ1JBLE1BQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLGFBQUEsUUFEQTtBQUVBLHFCQUFBLDhCQUZBO0FBR0Esb0JBQUE7QUFIQSxLQUFBO0FBS0EsQ0FOQTs7QUFRQSxNQUFBLFVBQUEsQ0FBQSxXQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLGFBQUEsRUFBQTtBQUNBLFFBQUEsT0FBQSxlQUFBOztBQUVBLFdBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxhQUFBLGdCQUFBLENBQUEsUUFBQSxFQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLG9CQUFBLEdBQUEsQ0FBQSxlQUFBLEVBQUEsUUFBQTtBQUNBLFNBRkEsRUFFQSxLQUZBLENBRUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxvQkFBQSxLQUFBLENBQUEsd0JBQUEsRUFBQSxLQUFBO0FBQ0EsU0FKQTs7QUFNQSxlQUFBLEVBQUEsQ0FBQSxVQUFBO0FBQ0EsS0FSQTtBQVVBLENBYkE7O0FDUkEsTUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsYUFBQSxXQURBO0FBRUEscUJBQUEsb0NBRkE7QUFHQSxvQkFBQTtBQUhBLEtBQUE7QUFLQSxDQU5BOztBQVFBLE1BQUEsVUFBQSxDQUFBLGNBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsY0FBQSxFQUFBLGVBQUEsRUFBQTtBQUNBLFFBQUEsTUFBQSxTQUFBLFFBQUEsR0FBQSxHQUFBLEVBQUE7QUFDQSxRQUFBLE1BQUEsZ0JBQUEsR0FBQSxDQUFBOztBQUVBLFdBQUEsSUFBQSxHQUFBLElBQUE7O0FBRUEsV0FBQSxVQUFBLEdBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxZQUFBLGNBQUEsSUFBQSxLQUFBLENBQUEsT0FBQSxFQUFBLEtBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSx1QkFBQSxXQUFBLEVBQUEsSUFBQSxDQUFBO0FBQ0Esd0JBQUE7QUFEQSxTQUFBOztBQUlBLFlBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGdCQUFBLFFBQUEsS0FBQSxLQUFBO0FBQ0EsZ0JBQUEsT0FBQSxJQUFBLElBQUEsQ0FBQSxLQUFBLEVBQUEsT0FBQSxHQUFBLEtBQUE7QUFDQSxnQkFBQSxpQkFBQSxJQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsS0FBQSxDQUFBLFFBQUEsRUFBQSxLQUFBLENBQUEsYUFBQSxDQUFBO0FBQ0EsMkJBQUEsY0FBQSxFQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0EsU0FMQTs7QUFRQSxZQUFBLG9CQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxLQUFBLENBQUEsUUFBQSxFQUFBLEtBQUEsQ0FBQSxrQkFBQSxDQUFBO0FBQ0EsdUJBQUEsaUJBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQSxLQUFBLEVBQUEsUUFBQSxFQUFBLFFBQUEsRUFBQSxPQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsUUFBQSxDQUFBOztBQUVBLGVBQUEsRUFBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLHdCQUFBO0FBREEsU0FBQTtBQUdBLEtBcEJBOztBQXNCQSxXQUFBLFlBQUEsR0FBQSxZQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsVUFBQTtBQUNBLEtBRkE7QUFHQSxDQS9CQTs7QUNSQTs7QUFFQSxTQUFBLE1BQUEsQ0FBQSxHQUFBLEVBQUE7O0FBRUEsU0FBQSxHQUFBLEdBQUEsR0FBQTs7QUFFQSxTQUFBLE1BQUEsR0FBQSxJQUFBOzs7QUFHQSxTQUFBLEtBQUEsR0FBQSxJQUFBOzs7O0FBSUEsU0FBQSxTQUFBLEdBQUEsSUFBQTs7O0FBR0EsU0FBQSxvQkFBQSxHQUFBLElBQUE7OztBQUdBLFNBQUEsS0FBQSxHQUFBLEVBQUE7OztBQUdBLFNBQUEsT0FBQSxHQUFBLElBQUE7QUFDQTs7QUFFQSxPQUFBLFNBQUEsQ0FBQSxXQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBOztBQUVBLFFBQUEsSUFBQSxNQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsSUFBQSxNQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsY0FBQSxNQUFBLENBQUEsQ0FBQTs7QUFFQSxTQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLFNBQUEsS0FBQSxDQUFBLFNBQUEsR0FBQSxJQUFBOzs7QUFHQSxTQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7OztBQUdBLFNBQUEsb0JBQUEsR0FBQSxLQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsS0FBQSxDQUFBO0FBQ0EsQ0FkQTs7QUFnQkEsT0FBQSxTQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQTtBQUNBLFFBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxFQUFBO0FBQ0EsZUFBQSxNQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtBQUNBLEtBRkEsTUFFQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsRUFBQTtBQUNBLGVBQUEsTUFBQSxTQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxLQUZBLE1BRUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLEVBQUE7QUFDQSxlQUFBLE1BQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQ0EsS0FGQSxNQUVBO0FBQ0EsZUFBQSxNQUFBLFNBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBO0FBQ0EsQ0FWQTs7QUFZQSxPQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxRQUFBLFFBQUEsS0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTs7QUFFQSxTQUFBLFNBQUEsQ0FBQSxPQUFBLEdBQUEsS0FBQSxRQUFBOztBQUVBLFNBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxJQUFBLEtBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBO0FBQ0EsQ0FUQTs7QUFXQSxPQUFBLFNBQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUE7Ozs7QUFJQSxRQUFBLFlBQUEsUUFBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsZUFBQSxDQUFBLFNBQUEsU0FBQTtBQUNBLEtBRkEsRUFFQSxDQUZBLENBQUE7O0FBSUEsV0FBQSxTQUFBO0FBQ0EsQ0FUQTs7QUFXQSxPQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsVUFBQSxLQUFBLE1BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsT0FBQSxFQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUEsU0FBQSxHQUFBLElBQUE7QUFDQSxhQUFBLEtBQUEsR0FBQSxLQUFBLE1BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsV0FBQSxLQUFBLFNBQUE7QUFDQSxZQUFBLFdBQUEsU0FBQSxRQUFBLENBQUE7QUFDQSxhQUFBLFNBQUEsR0FBQSxRQUFBOztBQUVBLGFBQUEsVUFBQTtBQUNBLGtCQUFBLEtBQUEsTUFBQSxDQUFBLEtBQUEsS0FBQSxDQUFBO0FBQ0E7QUFDQSxDQVpBOztBQWNBLE9BQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxlQUFBLEtBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxlQUFBLFNBQUEsU0FBQTtBQUNBLEtBRkEsQ0FBQTs7QUFJQSxRQUFBLEtBQUEsS0FBQSxDQUFBLElBQUEsSUFBQSxhQUFBLE1BQUEsS0FBQSxDQUFBLEVBQUEsS0FBQSxHQUFBO0FBQ0EsQ0FOQTs7QUFRQSxPQUFBLFNBQUEsQ0FBQSxHQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsT0FBQSxHQUFBLEtBQUE7O0FBRUEsQ0FIQTs7QUNqR0EsSUFBQSxRQUFBLENBQUE7QUFDQSxjQUFBLEVBREE7QUFFQSxXQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQTtBQUdBLGNBQUE7QUFIQSxDQUFBLEVBSUE7QUFDQSxjQUFBLEVBREE7QUFFQSxXQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQTtBQUdBLGNBQUE7QUFIQSxDQUpBLEVBUUE7QUFDQSxjQUFBLEVBREE7QUFFQSxXQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQTtBQUdBLGNBQUE7QUFIQSxDQVJBLEVBWUE7QUFDQSxjQUFBLEVBREE7QUFFQSxXQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQTtBQUdBLGNBQUE7QUFIQSxDQVpBLEVBZ0JBO0FBQ0EsY0FBQSxFQURBO0FBRUEsV0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkE7QUFHQSxjQUFBO0FBSEEsQ0FoQkEsRUFvQkE7QUFDQSxjQUFBLEVBREE7QUFFQSxXQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQTtBQUdBLGNBQUE7QUFIQSxDQXBCQSxFQXdCQTtBQUNBLGNBQUEsRUFEQTtBQUVBLFdBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBO0FBR0EsY0FBQTtBQUhBLENBeEJBLEVBNEJBO0FBQ0EsY0FBQSxFQURBO0FBRUEsV0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkE7QUFHQSxjQUFBO0FBSEEsQ0E1QkEsRUFnQ0E7QUFDQSxjQUFBLEVBREE7QUFFQSxXQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQTtBQUdBLGNBQUE7QUFIQSxDQWhDQSxFQW9DQTtBQUNBLGNBQUEsRUFEQTtBQUVBLFdBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBO0FBR0EsY0FBQTtBQUhBLENBcENBLEVBd0NBO0FBQ0EsY0FBQSxFQURBO0FBRUEsV0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkE7QUFHQSxjQUFBO0FBSEEsQ0F4Q0EsRUE0Q0E7QUFDQSxjQUFBLEVBREE7QUFFQSxXQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQTtBQUdBLGNBQUE7QUFIQSxDQTVDQSxFQWdEQTtBQUNBLGNBQUEsRUFEQTtBQUVBLFdBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBO0FBR0EsY0FBQTtBQUhBLENBaERBLEVBb0RBO0FBQ0EsY0FBQSxFQURBO0FBRUEsV0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkE7QUFHQSxjQUFBO0FBSEEsQ0FwREEsRUF3REE7QUFDQSxjQUFBLEVBREE7QUFFQSxXQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQTtBQUdBLGNBQUE7QUFIQSxDQXhEQSxFQTREQTtBQUNBLGNBQUEsRUFEQTtBQUVBLFdBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBO0FBR0EsY0FBQTtBQUhBLENBNURBLEVBZ0VBO0FBQ0EsY0FBQSxFQURBO0FBRUEsV0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkE7QUFHQSxjQUFBO0FBSEEsQ0FoRUEsRUFvRUE7QUFDQSxjQUFBLEVBREE7QUFFQSxXQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQTtBQUdBLGNBQUE7QUFIQSxDQXBFQSxFQXdFQTtBQUNBLGNBQUEsRUFEQTtBQUVBLFdBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBO0FBR0EsY0FBQTtBQUhBLENBeEVBLEVBNEVBO0FBQ0EsY0FBQSxFQURBO0FBRUEsV0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkE7QUFHQSxjQUFBO0FBSEEsQ0E1RUEsRUFnRkE7QUFDQSxjQUFBLEVBREE7QUFFQSxXQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQTtBQUdBLGNBQUE7QUFIQSxDQWhGQSxFQW9GQTtBQUNBLGNBQUEsRUFEQTtBQUVBLFdBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBO0FBR0EsY0FBQTtBQUhBLENBcEZBLEVBd0ZBO0FBQ0EsY0FBQSxFQURBO0FBRUEsV0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkE7QUFHQSxjQUFBO0FBSEEsQ0F4RkEsRUE0RkE7QUFDQSxjQUFBLEVBREE7QUFFQSxXQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQTtBQUdBLGNBQUE7QUFIQSxDQTVGQSxFQWdHQTtBQUNBLGNBQUEsRUFEQTtBQUVBLFdBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBO0FBR0EsY0FBQTtBQUhBLENBaEdBLEVBb0dBO0FBQ0EsY0FBQSxFQURBO0FBRUEsV0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkE7QUFHQSxjQUFBO0FBSEEsQ0FwR0EsRUF3R0E7QUFDQSxjQUFBLEVBREE7QUFFQSxXQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQTtBQUdBLGNBQUE7QUFIQSxDQXhHQSxFQTRHQTtBQUNBLGNBQUEsRUFEQTtBQUVBLFdBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBO0FBR0EsY0FBQTtBQUhBLENBNUdBLEVBZ0hBO0FBQ0EsY0FBQSxFQURBO0FBRUEsV0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkE7QUFHQSxjQUFBO0FBSEEsQ0FoSEEsRUFvSEE7QUFDQSxjQUFBLEVBREE7QUFFQSxXQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQTtBQUdBLGNBQUE7QUFIQSxDQXBIQSxFQXdIQTtBQUNBLGNBQUEsRUFEQTtBQUVBLFdBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBO0FBR0EsY0FBQTtBQUhBLENBeEhBLEVBNEhBO0FBQ0EsY0FBQSxFQURBO0FBRUEsV0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkE7QUFHQSxjQUFBO0FBSEEsQ0E1SEEsRUFnSUE7QUFDQSxjQUFBLEVBREE7QUFFQSxXQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQTtBQUdBLGNBQUE7QUFIQSxDQWhJQSxFQW9JQTtBQUNBLGNBQUEsRUFEQTtBQUVBLFdBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBO0FBR0EsY0FBQTtBQUhBLENBcElBLEVBd0lBO0FBQ0EsY0FBQSxFQURBO0FBRUEsV0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkE7QUFHQSxjQUFBO0FBSEEsQ0F4SUEsQ0FBQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIHRzdXJvID0gYW5ndWxhci5tb2R1bGUoJ1RzdXJvJywgWyd1aS5yb3V0ZXInLCAnZmlyZWJhc2UnXSk7XG5cbnRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHtcbiAgICAgICAgYXBpS2V5OiBcIkFJemFTeUNMbTNqa2s1cHBNcWVReEtvSC1kWjlDZFlNYURHV1dxVVwiLFxuICAgICAgICBhdXRoRG9tYWluOiBcInRoZS1wYXRocy1vZi1kcmFnb25zLmZpcmViYXNlYXBwLmNvbVwiLFxuICAgICAgICBkYXRhYmFzZVVSTDogXCJodHRwczovL3RoZS1wYXRocy1vZi1kcmFnb25zLmZpcmViYXNlaW8uY29tXCIsXG4gICAgICAgIHN0b3JhZ2VCdWNrZXQ6IFwidGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb21cIixcbiAgICB9O1xuICAgIGZpcmViYXNlLmluaXRpYWxpemVBcHAoY29uZmlnKTtcbn0pO1xuXG50c3Vyby5jb25zdGFudCgnZmlyZWJhc2VVcmwnLCAnaHR0cHM6Ly9wYXRoLW9mLXRoZS1kcmFnb24uZmlyZWJhc2Vpby5jb20vJyk7XG5cbnRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xufSk7XG4iLCJmdW5jdGlvbiBCb2FyZCgpIHtcbiAgICB0aGlzLmJvYXJkID0gW107XG59XG5cbkJvYXJkLnByb3RvdHlwZS5kcmF3Qm9hcmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCA2OyB5KyspIHtcbiAgICAgICAgaWYgKCF0aGlzLmJvYXJkW3ldKSB0aGlzLmJvYXJkW3ldID0gW107XG4gICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgNjsgeCsrKSB7XG4gICAgICAgICAgICB0aGlzLmJvYXJkW3ldLnB1c2gobmV3IFNwYWNlKHgsIHksIHRoaXMuYm9hcmQpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5ib2FyZDtcbn1cblxuZnVuY3Rpb24gU3BhY2UoeCwgeSwgYm9hcmQpIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgdGhpcy5pbWFnZSA9IG51bGw7XG4gICAgdGhpcy5wb2ludHMgPSBbbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbF07XG4gICAgdGhpcy50aWxlVXJsO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgIGxldCBjb3JyZXNwb25kaW5nO1xuXG4gICAgICAgIGlmIChpIDwgMikgeyAvL3RvcFxuICAgICAgICAgICAgY29ycmVzcG9uZGluZyA9IGkgPT09IDAgPyA1IDogNDsgLy8gMCAtPiA1ICYgMSAtPiA0XG4gICAgICAgICAgICBpZiAoeSA9PT0gMCkgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQodHJ1ZSk7XG4gICAgICAgICAgICBlbHNlIHRoaXMucG9pbnRzW2ldID0gYm9hcmRbeSAtIDFdW3hdLnBvaW50c1tjb3JyZXNwb25kaW5nXTtcbiAgICAgICAgfSBlbHNlIGlmIChpIDwgNCkgeyAvL3JpZ2h0XG4gICAgICAgICAgICBpZiAoeCA9PT0gNSkgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQodHJ1ZSk7XG4gICAgICAgICAgICBlbHNlIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIGlmIChpIDwgNikgeyAvL2JvdHRvbVxuICAgICAgICAgICAgaWYgKHkgPT09IDUpIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KHRydWUpO1xuICAgICAgICAgICAgZWxzZSB0aGlzLnBvaW50c1tpXSA9IG5ldyBQb2ludChmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7IC8vbGVmdFxuICAgICAgICAgICAgY29ycmVzcG9uZGluZyA9IGkgPT09IDYgPyAzIDogMjsgLy8gNiAtPiAzICYgNyAtPiAyXG4gICAgICAgICAgICBpZiAoeCA9PT0gMCkgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQodHJ1ZSk7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBvaW50c1tpXSA9IGJvYXJkW3ldW3ggLSAxXS5wb2ludHNbY29ycmVzcG9uZGluZ107XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxuLy8gZWRnZSA9IGJvb2xlYW5cbmZ1bmN0aW9uIFBvaW50KGVkZ2UpIHtcbiAgICB0aGlzLmVkZ2UgPSBlZGdlO1xuICAgIHRoaXMubmVpZ2hib3JzID0gW107XG4gICAgdGhpcy50cmF2ZWxsZWQgPSBmYWxzZTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuY2xhc3MgRGVjayB7XG4gICAgY29uc3RydWN0b3IodGlsZXMpIHtcbiAgICAgICAgdGhpcy50aWxlcyA9IHRpbGVzXG4gICAgfVxuXG4gICAgc2h1ZmZsZSgpIHtcbiAgICAgICAgdGhpcy50aWxlcyA9IF8uc2h1ZmZsZSh0aGlzLnRpbGVzKVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBkZWFsVGhyZWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGVzLnNwbGljZSgwLCAzKTtcbiAgICB9XG5cbiAgICBkZWFsKG51bSkge1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlcy5zcGxpY2UoMCwgbnVtKTtcbiAgICB9XG5cbiAgICByZWxvYWQodGlsZXMpIHtcbiAgICAgICAgdGhpcy50aWxlcy5wdXNoKHRpbGVzKVxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLy9HQU1FLy8vXG5cbmNsYXNzIEdhbWUge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUpIHtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5jb3VudCA9IDM1O1xuICAgICAgICB0aGlzLmJvYXJkID0gbmV3IEJvYXJkKCkuZHJhd0JvYXJkKCk7XG4gICAgICAgIHRoaXMucGxheWVycyA9IFtdO1xuICAgICAgICB0aGlzLmF2YWlsYWJsZU1hcmtlcnMgPSBbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJ5ZWxsb3dcIiwgXCJncmVlblwiLCBcImFxdWFcIiwgXCJibHVlXCIsIFwibmF2eVwiLCBcInB1cnBsZVwiXVxuXG4gICAgICAgIHRoaXMuY3VyclBsYXllcjsgLy9pbmRleCBvZiB0aGUgY3VycmVudFBsYXllciBpbiB0aGUgdHVybk9yZGVyQXJyYXlcbiAgICAgICAgdGhpcy50dXJuT3JkZXJBcnJheSA9IFtdIC8vaG9sZHMgYWxsIHRoZSBwbGF5ZXJzIHN0aWxsIG9uIHRoZSBib2FyZC5cbiAgICAgICAgdGhpcy5kcmFnb24gPSBcIlwiOyAvLyBQbGF5ZXIuTWFya2VyXG4gICAgICAgIHRoaXMubW92ZXM7XG4gICAgfVxuXG4gICAgZ2V0Q3VycmVudFBsYXllcigpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VyclBsYXllciA9PT0gLTEpIHJldHVybjtcbiAgICAgICAgcmV0dXJuIHRoaXMudHVybk9yZGVyQXJyYXlbdGhpcy5jdXJyUGxheWVyXTtcbiAgICB9O1xuXG4gICAgbW92ZUFsbFBsYXllcnMoKSB7XG4gICAgICAgIHRoaXMucGxheWVycy5mb3JFYWNoKChwbGF5ZXIpID0+IHBsYXllci5rZWVwTW92aW5nKCkpXG4gICAgfTtcbiAgICBkZWFkUGxheWVycygpIHtcbiAgICAgICAgdmFyIGRlYWRQbGF5ZXJzVGlsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLmZvckVhY2goZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICAgICAgaWYgKCFwbGF5ZXIuY2FuUGxheSAmJiBwbGF5ZXIudGlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGRlYWRQbGF5ZXJzVGlsZXMucHVzaChwbGF5ZXIudGlsZXMpO1xuICAgICAgICAgICAgICAgIGlzRGVhZFBsYXllciA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZGVhZFBsYXllcnNUaWxlcztcbiAgICB9O1xuXG4gICAgY2hlY2tPdmVyKCkge1xuICAgICAgICByZXR1cm4gZ2V0Q2FuUGxheSgpLmxlbmd0aCA8PSAxO1xuICAgIH1cblxuICAgIC8vdG8gYmUgY2FsbGVkIGF0IHRoZSBlbmQgb2YgYSB0dXJuIHRvIHNldCB0aGUgY3VyclBsYXllciB0byB0aGUgbmV4dCBlbGlnaWJsZSBwbGF5ZXIgaW4gdGhlIHR1cm5PcmRlckFycmF5XG4gICAgZ29Ub05leHRQbGF5ZXIoKSB7XG4gICAgICAgIGlmIChnZXRDYW5QbGF5KHRoaXMudHVybk9yZGVyQXJyYXkpLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIGxldCBuZXdJZHggPSB0aGlzLmN1cnJQbGF5ZXIgKyAxO1xuICAgICAgICAgICAgd2hpbGUgKCF0aGlzLnR1cm5PcmRlckFycmF5W25ld0lkeCAlIDhdLmNhblBsYXkpIHtcbiAgICAgICAgICAgICAgICBuZXdJZHgrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY3VyclBsYXllciA9IG5ld0lkeDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY3VyclBsYXllciA9IC0xO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmdldEN1cnJlbnRQbGF5ZXIoKTtcbiAgICB9O1xuXG4gICAgLy9yZXN0YXJ0IHRoZSBnYW1lXG4gICAgcmVzZXQoKSB7XG4gICAgICAgIHRoaXMucGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAgICAgICAvL3JldHJpZXZlIGFsbCB0aWxlc1xuICAgICAgICAgICAgLy9yZXR1cm4gcGxheWVyJ3MgdGlsZXMgdG8gdGhlIGRlY2sgYW5kIHNodWZmbGVcbiAgICAgICAgICAgIHRoaXMuZGVjay5yZWxvYWQocGxheWVyLnRpbGVzKS5zaHVmZmxlKCk7XG4gICAgICAgICAgICBwbGF5ZXIudGlsZXMgPSBbXTtcbiAgICAgICAgICAgIC8vcmVzZXQgYWxsIHBsYXllcnMgcGxheWFiaWxpdHlcbiAgICAgICAgICAgIHBsYXllci5jYW5QbGF5ID0gdHJ1ZTtcbiAgICAgICAgfSlcbiAgICB9O1xuXG59XG5cbi8vLy8vRU5EIE9GIEdBTUUgQ0xBU1MvLy8vL1xuXG4vL2dldCBFbGlnaWJsZSBwbGF5ZXJzXG5sZXQgZ2V0Q2FuUGxheSA9IGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgcmV0dXJuIHBsYXllcnMuZmlsdGVyKChwbGF5ZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIHBsYXllci5jYW5QbGF5XG4gICAgfSlcbn1cbiIsInRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZ2FtZScsIHtcbiAgICAgICAgdXJsOiAnL2dhbWUvOmdhbWVOYW1lJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvYnJvd3Nlci9qcy9nYW1lL2dhbWUuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdnYW1lQ3RybCdcbiAgICB9KTtcbn0pO1xuXG50c3Vyby5jb250cm9sbGVyKCdnYW1lQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRmaXJlYmFzZUF1dGgsIGZpcmViYXNlVXJsLCAkc3RhdGVQYXJhbXMsICRmaXJlYmFzZU9iamVjdCkge1xuICAgIHZhciBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuICAgIHZhciBmaXJlYmFzZVVzZXIgPSBhdXRoLiRnZXRBdXRoKCk7XG5cbiAgICB2YXIgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbiAgICB2YXIgb2JqID0gJGZpcmViYXNlT2JqZWN0KHJlZik7XG5cbiAgICB2YXIgZ2FtZVJlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZCgkc3RhdGVQYXJhbXMuZ2FtZU5hbWUpO1xuICAgIHZhciBkZWNrUmVmID0gZ2FtZVJlZi5jaGlsZCgnaW5pdGlhbERlY2snKTtcbiAgICB2YXIgcGxheWVyc1JlZiA9IGdhbWVSZWYuY2hpbGQoJ3BsYXllcnMnKTtcbiAgICB2YXIgbWFya2Vyc1JlZiA9IGdhbWVSZWYuY2hpbGQoJ2F2YWlsYWJsZU1hcmtlcnMnKTtcblxuICAgIC8vaW50aWFsaXplIGdhbWVcbiAgICAkc2NvcGUuZ2FtZSA9IG5ldyBHYW1lKCRzdGF0ZVBhcmFtcy5nYW1lTmFtZSwgJHN0YXRlUGFyYW1zLmRlY2spO1xuXG4gICAgJHNjb3BlLmdhbWUuZGVjayA9ICRmaXJlYmFzZU9iamVjdChkZWNrUmVmKTtcblxuXG4gICAgbWFya2Vyc1JlZi5vbigndmFsdWUnLCBmdW5jdGlvbiAoYXZhaWxhYmxlTWFya2Vycykge1xuICAgICAgICAkc2NvcGUuYXZhaWxhYmxlTWFya2VycyA9IE9iamVjdC5rZXlzKGF2YWlsYWJsZU1hcmtlcnMpLm1hcChmdW5jdGlvbiAoaSkge1xuXG4gICAgICAgICAgICByZXR1cm4gYXZhaWxhYmxlTWFya2Vyc1tpXTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgY29uc29sZS5sb2coJHNjb3BlLmdhbWUpXG4gICAgdmFyIGJvYXJkID0gJHNjb3BlLmdhbWUuYm9hcmQ7XG5cblxuICAgIC8vdGFrZSBhbGwgcGxheWVycyBvbiBmaXJlYmFzZSBhbmQgdHVybiB0aGVtIGludG8gbG9jYWwgcGxheWVyXG4gICAgcGxheWVyc1JlZi5vbihcImNoaWxkX2FkZGVkXCIsIGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICAgdmFyIG5ld1BsYXllciA9IG5ldyBQbGF5ZXIocGxheWVyLnVpZCk7XG4gICAgICAgIG5ld1BsYXllci5tYXJrZXIgPSBwbGF5ZXIubWFya2VyO1xuXG4gICAgICAgIHZhciB4ID0gcGxheWVyLnN0YXJ0aW5nUG9zaXRpb25bMF07XG4gICAgICAgIHZhciB5ID0gcGxheWVyLnN0YXJ0aW5nUG9zaXRpb25bMV07XG4gICAgICAgIHZhciBwb2ludHNJbmRleCA9IHBsYXllci5zdGFydGluZ1Bvc2l0aW9uWzJdO1xuXG4gICAgICAgIG5ld1BsYXllci5wb2ludCA9IGJvYXJkW3ldW3hdLnBvaW50c1twb2ludHNJbmRleF07XG4gICAgICAgIG5ld1BsYXllci5uZXh0U3BhY2UgPSBib2FyZFt5XVt4XTtcbiAgICAgICAgbmV3UGxheWVyLm5leHRTcGFjZVBvaW50c0luZGV4ID0gcGxheWVyLnN0YXJ0aW5nUG9zaXRpb25bMl07XG5cbiAgICAgICAgbmV3UGxheWVyLnRpbGVzID0gJHNjb3BlLmdhbWUuZGVjay5kZWFsVGhyZWUoKTtcblxuICAgICAgICAkc2NvcGUuZ2FtZS5wbGF5ZXJzLnB1c2gobmV3UGxheWVyKTtcbiAgICB9KTtcblxuICAgIC8vZ2V0ICdtZSdcbiAgICAkc2NvcGUubWUgPSAkc2NvcGUuZ2FtZS5wbGF5ZXJzLmZpbHRlcihmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAgIHJldHVybiBwbGF5ZXIudWlkID09PSBmaXJlYmFzZVVzZXIudWlkO1xuICAgIH0pWzBdO1xuXG5cbiAgICAvL0hhdmUgcGxheWVyIHBpY2sgdGhlIG1hcmtlclxuICAgICRzY29wZS5waWNrTWFya2VyID0gZnVuY3Rpb24gKGJvYXJkLCBtYXJrZXIpIHtcbiAgICAgICAgJHNjb3BlLm1lLm1hcmtlciA9IG1hcmtlcjtcbiAgICAgICAgdmFyIG1hcmtlcnMgPSAkZmlyZWJhc2VBcnJheShtYXJrZXJzUmVmKTtcbiAgICAgICAgdmFyIGlkeCA9IG1hcmtlcnMuaW5kZXhPZihtYXJrZXIpO1xuICAgICAgICBtYXJrZXJzLiRyZW1vdmUobWFya2Vyc1tpZHhdKS50aGVuKGZ1bmN0aW9uIChyZWYpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlZi5rZXkpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy9IYXZlIHBsYXllciBwaWNrIHRoZWlyIHN0YXJ0IHBvaW50XG5cbiAgICAkc2NvcGUucGxhY2VNYXJrZXIgPSBmdW5jdGlvbiAoYm9hcmQsIHBvaW50KSB7XG4gICAgICAgICRzY29wZS5tZS5wbGFjZU1hcmtlcihwb2ludCk7XG4gICAgICAgICRzY29wZS5nYW1lLnBsYXllcnMucHVzaCgkc2NvcGUucGxheWVyKTtcblxuICAgICAgICBnYW1lUmVmLmNoaWxkKCdwbGF5ZXJzJykuY2hpbGQocGxheWVyLnVpZCkucHVzaCh7XG4gICAgICAgICAgICAnbWFya2VyJzogcGxheWVyLm1hcmtlcixcbiAgICAgICAgICAgICdzdGFydGluZ1Bvc2l0aW9uJzogcGxheWVyLnN0YXJ0aW5nUG9zaXRpb25cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIFRPRE86IHdlIHByb2JhYmx5IG5lZWQgdGhpcyBvbiBmaXJlYmFzZSBzbyBvdGhlciBwZW9wbGUgY2FuJ3QgcGljayB3aGF0J3MgYmVlbiBwaWNrZWRcblxuICAgIC8vRm9yIHN5bmNocm9uaXppbmdHYW1lLi4uXG4gICAgdmFyIHN5bmNSZWYgPSBuZXcgRmlyZWJhc2UoZ2FtZVJlZiArICcvbW92ZXMnKTtcbiAgICBzeW5jUmVmLm9uKCdjaGlsZF9hZGRlZCcsIGZ1bmN0aW9uIChjaGlsZFNuYXBzaG90LCBwcmV2Q2hpbGRLZXkpIHtcbiAgICAgICAgLy9ORUVEIFRPIERPVUJMRSBDSEVDSyEhIFdoYXQgZG9lcyBjaGlsZFNuYXAgcmV0dXJucz9cbiAgICAgICAgY29uc29sZS5sb2coJ2NoaWxkU25hcHNob3RfU3luY0dhbWUnLCBjaGlsZFNuYXBzaG90KTtcbiAgICAgICAgLy9kZXBlbmRpbmcgb24gd2hhdCBjaGlsZFNuYXBzaG90IGdpdmVzIG1lLi4uSSB0aGluayBpdCdzIG9uZSBjaGlsZCBwZXIgb24gY2FsbD8gSXQgZG9lc24ndCByZXR1cm4gYW4gYXJyYXkgb2YgY2hhbmdlcy4uLkkgYmVsaWV2ZSFcbiAgICAgICAgaWYgKGNoaWxkU25hcHNob3QudHlwZSA9PT0gJ3VwZGF0ZURlY2snKSB7XG4gICAgICAgICAgICAkc2NvcGUuZ2FtZS5kZWNrID0gY2hpbGRTbmFwc2hvdC51cGRhdGVEZWNrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJHNjb3BlLnBsYWNlVGlsZShjaGlsZFNuYXBzaG90LnRpbGUpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBUT0RPOiBob3cgdG8gcmUtZG8gdGhlIG1vdmVzP1xuICAgIC8vICRzY29wZS5nYW1lLm1vdmVzO1xuXG4gICAgLy8gVE9ETzogaG93IGRvIHdlIHNob3cgdGhlIHRpbGVzIGZvciBwbGF5ZXI/XG5cbiAgICAvLyBUT0RPOiBob3cgdG8gc2hvdyB0aGUgcm90YXRlZCB0aWxlP1xuXG4gICAgLy8gQ01UOiBhc3N1bWluZyB3ZSB1c2UgbmV3IEdhbWUoKSBmb3IgZWFjaCBnYW1lXG4gICAgJHNjb3BlLmN1cnJlbnRQbGF5ZXIgPSAkc2NvcGUuZ2FtZS5nZXRDdXJyZW50UGxheWVyKCk7XG5cbiAgICAvLyBDTVQ6IGFzc3VtaW5nIHdlIHVzZSBuZXcgR2FtZSgpIGZvciBlYWNoIGdhbWUsIGhvbGRzIGFsbCB0aGUgcGxheWVycyBzdGlsbCBvbiB0aGUgYm9hcmQuXG4gICAgJHNjb3BlLnR1cm5PcmRlckFycmF5ID0gJHNjb3BlLmdhbWUuZ2V0Q2FuUGxheSgpO1xuXG4gICAgLy8gVE9ETzogbmVlZCBhIGZ1bmN0aW9uIHRvIGFzc2lnbiBkcmFnb25cbiAgICAkc2NvcGUuZHJhZ29uO1xuICAgIHZhciBhd2FpdGluZ0RyYWdvbkhvbGRlcnMgPSBbXTtcblxuXG4gICAgJHNjb3BlLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvL1xuICAgIH07XG5cbiAgICAkc2NvcGUubXlUdXJuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAkc2NvcGUubWUgPT09ICRzY29wZS5jdXJyZW50UGxheWVyO1xuICAgIH07XG5cbiAgICAvL3RoZXNlIGFyZSB0aWVkIHRvIGFuZ3VsYXIgbmctY2xpY2sgYnV0dG9uc1xuICAgICRzY29wZS5yb3RhdGVUaWxlQ3cgPSBmdW5jdGlvbiAodGlsZSkge1xuICAgICAgICB0aWxlLnJvdGF0aW9uKys7XG4gICAgICAgIGlmICh0aWxlLnJvdGF0aW9uID09PSA0KSB0aWxlLnJvdGF0aW9uID0gMDtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnJvdGF0ZVRpbGVDY3cgPSBmdW5jdGlvbiAodGlsZSkge1xuICAgICAgICB0aWxlLnJvdGF0aW9uLS07XG4gICAgICAgIGlmICh0aWxlLnJvdGF0aW9uID09PSAtNCkgdGlsZS5yb3RhdGlvbiA9IDA7XG4gICAgfTtcblxuICAgIC8vIENNVDogYXNzdW1pbmcgd2UgdXNlIG5ldyBHYW1lKClcbiAgICAvLyBDTVQ6IHVzZSBwbGF5ZXIncyBhbmQgZ2FtZSdzIHByb3RvdHlwZSBmdW5jdGlvbiB0byBwbGFjZSB0aWxlIGFuZCB0aGVuIG1vdmUgYWxsIHBsYXllcnNcbiAgICAkc2NvcGUucGxhY2VUaWxlID0gZnVuY3Rpb24gKHRpbGUpIHtcbiAgICAgICAgLy8gVE9ETzogc2VuZCB0aGlzIHN0YXRlIHRvIGZpcmViYXNlIGV2ZXJ5IHRpbWUgaXQncyBjYWxsZWRcbiAgICAgICAgaWYgKHRpbGUucm90YXRpb24gPiAwKSB7XG4gICAgICAgICAgICB0aWxlLnBhdGhzID0gdGlsZS5wYXRocy5tYXAoZnVuY3Rpb24gKGNvbm5lY3Rpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29ubmVjdGlvbiArIDI7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRpbGUucGF0aHMudW5zaGlmdCh0aWxlLnBhdGhzLnBvcCgpKTtcbiAgICAgICAgICAgIHRpbGUucGF0aHMudW5zaGlmdCh0aWxlLnBhdGhzLnBvcCgpKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aWxlLnJvdGF0aW9uIDwgMCkge1xuICAgICAgICAgICAgdGlsZS5wYXRocyA9IHRpbGUucGF0aHMubWFwKGZ1bmN0aW9uIChjb25uZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbm5lY3Rpb24gLSAyO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aWxlLnBhdGhzLnB1c2godGlsZS5wYXRocy5zaGlmdCgpKTtcbiAgICAgICAgICAgIHRpbGUucGF0aHMucHVzaCh0aWxlLnBhdGhzLnNoaWZ0KCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLm1lLnBsYWNlVGlsZSh0aWxlKTtcbiAgICAgICAgZ2FtZVJlZi5jaGlsZCgnbW92ZXMnKS5wdXNoKHtcbiAgICAgICAgICAgICd0eXBlJzogJ3BsYWNlVGlsZScsXG4gICAgICAgICAgICAndGlsZSc6IHRpbGVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLmdhbWUubW92ZUFsbHBsYXllcnMoKTtcblxuICAgICAgICBpZiAoJHNjb3BlLmdhbWUuY2hlY2tPdmVyKCkpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IG5lZWQgdG8gdGVsbCB0aGUgcGxheWVyIHNoZSB3b25cbiAgICAgICAgICAgICRzY29wZS53aW5uZXIgPSAkc2NvcGUuZ2FtZS5nZXRDYW5QbGF5KClbMF07XG4gICAgICAgICAgICAkc2NvcGUuZ2FtZU92ZXIgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gSWYgZGVjayBpcyBlbXB0eSAmIG5vIG9uZSBpcyBkcmFnb24sIHNldCBtZSBhcyBkcmFnb25cbiAgICAgICAgICAgIGlmICgkc2NvcGUuZ2FtZS5kZWNrLmxlbmd0aCA9PT0gMCAmJiAhJHNjb3BlLmRyYWdvbikge1xuICAgICAgICAgICAgICAgICRzY29wZS5kcmFnb24gPSAkc2NvcGUubWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCRzY29wZS5nYW1lLmRlY2subGVuZ3RoID09PSAwICYmICRzY29wZS5kcmFnb24pIHtcbiAgICAgICAgICAgICAgICBhd2FpdGluZ0RyYWdvbkhvbGRlcnMucHVzaCgkc2NvcGUubWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBDTVQ6IGRyYXcgb25lIHRpbGUgYW5kIHB1c2ggaXQgdG8gdGhlIHBsYXllci50aWxlcyBhcnJheVxuICAgICAgICAgICAgICAgICRzY29wZS5tZS50aWxlcy5wdXNoKCRzY29wZS5nYW1lLmRlY2suZGVhbCgxKSk7XG4gICAgICAgICAgICAgICAgLy9pZiBkZWFkIHBsYXllcnMsIHRoZW4gcHVzaCB0aGVpciBjYXJkcyBiYWNrIHRvIHRoZSBkZWNrICYgcmVzaHVmZmxlXG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZS5nYW1lLmRlYWRQbGF5ZXJzKCkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vd2l0aCBuZXcgY2FyZHMgJiBuZWVkIHRvIHJlc2h1ZmZsZVxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZ2FtZS5kZWFkUGxheWVycygpLmZvckVhY2goZnVuY3Rpb24gKGRlYWRQbGF5ZXJUaWxlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVhZFBsYXllclRpbGVzLmZvckVhY2goZnVuY3Rpb24gKHRpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZ2FtZS5kZWNrLnB1c2godGlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5nYW1lLmRlY2sgPSAkc2NvcGUuZ2FtZS5kZWNrLnNodWZmbGUoKTtcbiAgICAgICAgICAgICAgICAgICAgLy9zZW5kIGZpcmViYXNlIGEgbmV3IG1vdmVcbiAgICAgICAgICAgICAgICAgICAgZ2FtZVJlZi5jaGlsZCgnbW92ZXMnKS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICd0eXBlJzogJ3VwZGF0ZURlY2snLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3VwZGF0ZURlY2snOiAkc2NvcGUuZ2FtZS5kZWNrXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmRyYWdvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRyYWdvbi50aWxlcy5wdXNoKCRzY29wZS5nYW1lLmRlY2suZGVhbCgxKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZHJhZ29uID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vTkVFRCBUTyBESVNDVVNTOiBNaWdodCBuZWVkIHRvIG1vZGlmeSB0aGlzIGlmIHdlIHdhbnQgdG8gdXNlIHVwIHRoZSBjYXJkcyBhbmQgZ2l2ZSBlYWNoIGF3YWl0aW5nIHBsYXllcnMnIHVwIHRvIDMgY2FyZHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlICgkc2NvcGUuZ2FtZS5kZWNrLmxlbmd0aCAmJiAkc2NvcGUuYXdhaXRpbmdEcmFnb25Ib2xkZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5hd2FpdGluZ0RyYWdvbkhvbGRlcnMuc2hpZnQoKS50aWxlcy5wdXNoKCRzY29wZS5nYW1lLmRlY2suZGVhbCgxKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS5hd2FpdGluZ0RyYWdvbkhvbGRlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRyYWdvbiA9ICRzY29wZS5hd2FpdGluZ0RyYWdvbkhvbGRlcnMuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRzY29wZS5nYW1lLmdvVG9OZXh0UGxheWVyKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gVE9ETzogZmlyZWJhc2UgZ2FtZS5wbGF5ZXJzIHNsaWNlICRzY29wZS5wbGF5ZXIgb3V0XG4gICAgJHNjb3BlLmxlYXZlR2FtZTtcblxuICAgIC8vIFRPRE86IGRvIHdlIHJlbW92ZSB0aGlzIGdhbWUgcm9vbSdzIG1vdmVzIGZyb20gZmlyZWJhc2U/XG4gICAgJHNjb3BlLnJlc2V0ID0gJHNjb3BlLmdhbWUucmVzZXQ7XG5cblxuICAgICRzY29wZS5zdGFydHRvcCA9IFtcbiAgICAgICAgWzAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMV0sXG4gICAgICAgIFsxLCAwLCAwXSxcbiAgICAgICAgWzEsIDAsIDFdLFxuICAgICAgICBbMiwgMCwgMF0sXG4gICAgICAgIFsyLCAwLCAxXSxcbiAgICAgICAgWzMsIDAsIDBdLFxuICAgICAgICBbMywgMCwgMV0sXG4gICAgICAgIFs0LCAwLCAwXSxcbiAgICAgICAgWzQsIDAsIDFdLFxuICAgICAgICBbNSwgMCwgMF0sXG4gICAgICAgIFs1LCAwLCAxXVxuICAgIF07XG4gICAgJHNjb3BlLnN0YXJ0bGVmdCA9IFtcbiAgICAgICAgWzAsIDAsIDddLFxuICAgICAgICBbMCwgMCwgNl0sXG4gICAgICAgIFswLCAxLCA3XSxcbiAgICAgICAgWzAsIDEsIDZdLFxuICAgICAgICBbMCwgMiwgN10sXG4gICAgICAgIFswLCAyLCA2XSxcbiAgICAgICAgWzAsIDMsIDddLFxuICAgICAgICBbMCwgMywgNl0sXG4gICAgICAgIFswLCA0LCA3XSxcbiAgICAgICAgWzAsIDQsIDZdLFxuICAgICAgICBbMCwgNSwgN10sXG4gICAgICAgIFswLCA1LCA2XVxuICAgIF07XG4gICAgJHNjb3BlLnN0YXJ0Ym90dG9tID0gW1xuICAgICAgICBbMCwgNSwgMF0sXG4gICAgICAgIFswLCA1LCAxXSxcbiAgICAgICAgWzEsIDUsIDBdLFxuICAgICAgICBbMSwgNSwgMV0sXG4gICAgICAgIFsyLCA1LCAwXSxcbiAgICAgICAgWzIsIDUsIDFdLFxuICAgICAgICBbMywgNSwgMF0sXG4gICAgICAgIFszLCA1LCAxXSxcbiAgICAgICAgWzQsIDUsIDBdLFxuICAgICAgICBbNCwgNSwgMV0sXG4gICAgICAgIFs1LCA1LCAwXSxcbiAgICAgICAgWzUsIDUsIDFdXG4gICAgXTtcbiAgICAkc2NvcGUuc3RhcnRyaWdodCA9IFtcbiAgICAgICAgWzUsIDAsIDJdLFxuICAgICAgICBbNSwgMCwgM10sXG4gICAgICAgIFs1LCAxLCAyXSxcbiAgICAgICAgWzUsIDEsIDNdLFxuICAgICAgICBbNSwgMiwgMl0sXG4gICAgICAgIFs1LCAyLCAzXSxcbiAgICAgICAgWzUsIDMsIDJdLFxuICAgICAgICBbNSwgMywgM10sXG4gICAgICAgIFs1LCA0LCAyXSxcbiAgICAgICAgWzUsIDQsIDNdLFxuICAgICAgICBbNSwgNSwgMl0sXG4gICAgICAgIFs1LCA1LCAzXVxuICAgIF07XG5cbn0pO1xuIiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdnYW1lbGlzdCcsIHtcbiAgICAgICAgdXJsOiAnL2dhbWVsaXN0JyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvYnJvd3Nlci9qcy9nYW1lbGlzdC9nYW1lbGlzdC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2dhbWVMaXN0JyxcbiAgICB9KTtcbn0pO1xuXG50c3Vyby5jb250cm9sbGVyKCdnYW1lTGlzdCcsIGZ1bmN0aW9uICgkc2NvcGUsIGZpcmViYXNlVXJsLCAkZmlyZWJhc2VPYmplY3QsICRzdGF0ZSkge1xuICAgIC8vRm9yIHN5bmNocm9uaXppbmdHYW1lTGlzdC4uLlxuICAgIHZhciByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xuICAgIHZhciBvYmogPSAkZmlyZWJhc2VPYmplY3QocmVmKTtcblxuICAgIHZhciBzeW5jaFJlZiA9IHJlZi5jaGlsZChcImdhbWVzXCIpO1xuICAgIGNvbnNvbGUubG9nKHN5bmNoUmVmKTtcblxuICAgIHZhciBzeW5jaHJvbml6ZWRPYmogPSAkZmlyZWJhc2VPYmplY3Qoc3luY2hSZWYpO1xuICAgIGNvbnNvbGUubG9nKHN5bmNocm9uaXplZE9iailcblxuICAgIC8vIFRoaXMgcmV0dXJucyBhIHByb21pc2UuLi55b3UgY2FuLnRoZW4oKSBhbmQgYXNzaWduIHZhbHVlIHRvICRzY29wZS52YXJpYWJsZVxuICAgIC8vIGdhbWVsaXN0IGlzIHdoYXRldmVyIHdlIGFyZSBjYWxsaW5nIGl0IGluIHRoZSBhbmd1bGFyIGh0bWwuXG4gICAgc3luY2hyb25pemVkT2JqLiRiaW5kVG8oJHNjb3BlLCBcImdhbWVsaXN0XCIpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBnYW1lbGlzdCA9IFtdXG4gICAgICAgICAgICBmb3IgKHZhciBpIGluICRzY29wZS5nYW1lbGlzdCkge1xuICAgICAgICAgICAgICAgIGdhbWVsaXN0LnB1c2goW2ksICRzY29wZS5nYW1lbGlzdFtpXV0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkc2NvcGUuZ2FtZU5hbWVzID0gZ2FtZWxpc3Quc2xpY2UoMik7XG4gICAgICAgIH0pXG5cblxuICAgICRzY29wZS5qb2luID0gZnVuY3Rpb24gKGdhbWVOYW1lKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGdhbWVOYW1lKVxuICAgICAgICAkc3RhdGUuZ28oJ2dhbWUnLCB7XG4gICAgICAgICAgICBcImdhbWVOYW1lXCI6IGdhbWVOYW1lXG4gICAgICAgIH0pO1xuICAgIH07XG59KTtcbiIsInRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbG9naW4nLCB7XG4gICAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2Jyb3dzZXIvanMvbG9naW4vbG9naW4uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdsb2dpbkN0cmwnXG4gICAgfSk7XG59KTtcblxudHN1cm8uY29udHJvbGxlcignbG9naW5DdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlLCAkZmlyZWJhc2VBdXRoKSB7XG4gICAgdmFyIGF1dGggPSAkZmlyZWJhc2VBdXRoKCk7XG5cbiAgICAkc2NvcGUubG9nSW5XaXRoR29vZ2xlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBhdXRoLiRzaWduSW5XaXRoUG9wdXAoXCJnb29nbGVcIikudGhlbihmdW5jdGlvbiAoYXV0aERhdGEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTG9nZ2VkIGluIGFzOlwiLCBhdXRoRGF0YSk7XG4gICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkF1dGhlbnRpY2F0aW9uIGZhaWxlZDpcIiwgZXJyb3IpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkc3RhdGUuZ28oJ3BpY2tHYW1lJyk7XG4gICAgfTtcblxufSk7XG4iLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3BpY2tHYW1lJywge1xuICAgICAgICB1cmw6ICcvcGlja2dhbWUnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9icm93c2VyL2pzL3BpY2tHYW1lL3BpY2tHYW1lLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAncGlja0dhbWVDdHJsJ1xuICAgIH0pO1xufSk7XG5cbnRzdXJvLmNvbnRyb2xsZXIoJ3BpY2tHYW1lQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSwgJGZpcmViYXNlQXJyYXksICRmaXJlYmFzZU9iamVjdCkge1xuICAgIHZhciByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xuICAgIHZhciBvYmogPSAkZmlyZWJhc2VPYmplY3QocmVmKTtcblxuICAgICRzY29wZS50ZXN0ID0gXCJoaVwiO1xuXG4gICAgJHNjb3BlLmNyZWF0ZUdhbWUgPSBmdW5jdGlvbiAoZ2FtZU5hbWUpIHtcbiAgICAgICAgdmFyIGdhbWVOYW1lUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKGdhbWVOYW1lKTtcbiAgICAgICAgJGZpcmViYXNlQXJyYXkoZ2FtZU5hbWVSZWYpLiRhZGQoe1xuICAgICAgICAgICAgXCJnYW1lTmFtZVwiOiBnYW1lTmFtZVxuICAgICAgICB9KTtcblxuICAgICAgICBvYmouJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciB0aWxlcyA9IGRhdGEudGlsZXNcbiAgICAgICAgICAgIHZhciBkZWNrID0gbmV3IERlY2sodGlsZXMpLnNodWZmbGUoKS50aWxlcztcbiAgICAgICAgICAgIHZhciBpbml0aWFsRGVja1JlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZChnYW1lTmFtZSkuY2hpbGQoJ2luaXRpYWxEZWNrJyk7XG4gICAgICAgICAgICAkZmlyZWJhc2VBcnJheShpbml0aWFsRGVja1JlZikuJGFkZChkZWNrKTtcbiAgICAgICAgfSlcblxuXG4gICAgICAgIHZhciBpbml0aWFsTWFya2Vyc1JlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZChnYW1lTmFtZSkuY2hpbGQoJ2F2YWlsYWJsZU1hcmtlcnMnKTtcbiAgICAgICAgJGZpcmViYXNlQXJyYXkoaW5pdGlhbE1hcmtlcnNSZWYpLiRhZGQoW1wicmVkXCIsIFwib3JhbmdlXCIsIFwieWVsbG93XCIsIFwiZ3JlZW5cIiwgXCJhcXVhXCIsIFwiYmx1ZVwiLCBcIm5hdnlcIiwgXCJwdXJwbGVcIl0pO1xuXG4gICAgICAgICRzdGF0ZS5nbygnZ2FtZScsIHtcbiAgICAgICAgICAgIFwiZ2FtZU5hbWVcIjogZ2FtZU5hbWVcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgICRzY29wZS5nb1RvR2FtZUxpc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzdGF0ZS5nbygnZ2FtZWxpc3QnKTtcbiAgICB9O1xufSk7XG4iLCIndXNlIHN0cmljdCdcblxuZnVuY3Rpb24gUGxheWVyKHVpZCkge1xuICAgIC8vIFRPRE86IGdldCB1aWQgZnJvbSBmaXJlYmFzZSBhdXRoXG4gICAgdGhpcy51aWQgPSB1aWQ7XG5cbiAgICB0aGlzLm1hcmtlciA9IG51bGw7XG5cbiAgICAvLyBzaG91bGQgYmUgYSBQb2ludCBvYmplY3RcbiAgICB0aGlzLnBvaW50ID0gbnVsbDtcblxuICAgIC8vIFt4LCB5XVxuICAgIC8vIGRlcGVuZHMgb24gdGhlIGFuZ3VsYXIgU3BhY2UueCwgU3BhY2UueVxuICAgIHRoaXMubmV4dFNwYWNlID0gbnVsbDtcblxuICAgIC8vIGluIGVhY2ggU3BhY2UucG9pbnRzIGFycmF5LCBmaW5kIHRoaXMgc3BlY2lmaWMgcG9pbnQgYW5kIGdldCB0aGUgcG9zaXRpb24gKGludGVnZXIpIGluc2lkZSB0aGlzIHNwYWNlLlxuICAgIHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPSBudWxsO1xuXG4gICAgLy8gbWF4aW11biAzIHRpbGVzXG4gICAgdGhpcy50aWxlcyA9IFtdO1xuXG4gICAgLy8gaWYgYSBwbGF5ZXIgZGllcywgaXQgd2lsbCBiZSBjaGFuZ2VkIHRvIGZhbHNlXG4gICAgdGhpcy5jYW5QbGF5ID0gdHJ1ZTtcbn1cblxuUGxheWVyLnByb3RvdHlwZS5wbGFjZU1hcmtlciA9IGZ1bmN0aW9uIChib2FyZCwgcG9pbnQpIHtcbiAgICAvLyBwb2ludCBsb29rcyBsaWtlIFt4LCB5LCBwb2ludHNJbmRleF0gaW4gdGhlIHNwYWNlXG4gICAgdmFyIHggPSBwb2ludFswXTtcbiAgICB2YXIgeSA9IHBvaW50WzFdO1xuICAgIHZhciBwb2ludHNJbmRleCA9IHBvaW50WzJdO1xuXG4gICAgdGhpcy5wb2ludCA9IGJvYXJkW3ldW3hdLnBvaW50c1twb2ludHNJbmRleF07XG4gICAgdGhpcy5wb2ludC50cmF2ZWxsZWQgPSB0cnVlO1xuXG4gICAgLy9beCwgeV0gZnJvbSB0aGUgcG9pbnRcbiAgICB0aGlzLm5leHRTcGFjZSA9IGJvYXJkW3ldW3hdO1xuXG4gICAgLy8gaW4gZWFjaCBTcGFjZS5wb2ludHMgYXJyYXksIGZpbmQgdGhpcyBzcGVjaWZpYyBwb2ludCBhbmQgZ2V0IHRoZSBwb3NpdGlvbiAoaW50ZWdlcikgaW5zaWRlIHRoaXMgc3BhY2UuXG4gICAgdGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9IHRoaXMubmV4dFNwYWNlLnBvaW50cy5pbmRleE9mKHRoaXMucG9pbnQpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5uZXdTcGFjZSA9IGZ1bmN0aW9uIChib2FyZCwgb2xkU3BhY2UpIHtcbiAgICBpZiAodGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gMCB8fCB0aGlzLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSAxKSB7XG4gICAgICAgIHJldHVybiBib2FyZFtvbGRTcGFjZS55IC0gMV1bb2xkU3BhY2UueF07XG4gICAgfSBlbHNlIGlmICh0aGlzLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSAyIHx8IHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDMpIHtcbiAgICAgICAgcmV0dXJuIGJvYXJkW29sZFNwYWNlLnldW29sZFNwYWNlLnggKyAxXTtcbiAgICB9IGVsc2UgaWYgKHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDQgfHwgdGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gNSkge1xuICAgICAgICByZXR1cm4gYm9hcmRbb2xkU3BhY2UueSArIDFdW29sZFNwYWNlLnhdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBib2FyZFtvbGRTcGFjZS55XVtvbGRTcGFjZS54IC0gMV07XG4gICAgfVxufTtcblxuUGxheWVyLnByb3RvdHlwZS5wbGFjZVRpbGUgPSBmdW5jdGlvbiAodGlsZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMudGlsZXMuaW5kZXhPZih0aWxlKTtcbiAgICB0aGlzLnRpbGVzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICB0aGlzLm5leHRTcGFjZS50aWxlVXJsID0gdGlsZS5pbWFnZVVybDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGlsZS5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLm5leHRTcGFjZS5wb2ludHNbaV0ubmVpZ2hib3JzLnB1c2godGhpcy5uZXh0U3BhY2UucG9pbnRzW3RpbGVbaV1dKTtcbiAgICB9XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLm1vdmVUbyA9IGZ1bmN0aW9uIChwb2ludGVyKSB7XG4gICAgLy8gbGV0IHBvaW50ZXIgPSBwb2ludGVyO1xuXG4gICAgLy9hbHdheXMgYmUgcmV0dXJuaW5nIDAgb3IgMSBwb2ludCBpbiB0aGUgYXJyYXlcbiAgICBsZXQgbmV4dFBvaW50ID0gcG9pbnRlci5uZWlnaGJvcnMuZmlsdGVyKGZ1bmN0aW9uIChuZWlnaGJvcikge1xuICAgICAgICByZXR1cm4gIW5laWdoYm9yLnRyYXZlbGxlZDtcbiAgICB9KVswXTtcblxuICAgIHJldHVybiBuZXh0UG9pbnQ7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLmtlZXBNb3ZpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IG1vdmFibGUgPSB0aGlzLm1vdmVUbyh0aGlzLnBvaW50KTtcbiAgICB3aGlsZSAobW92YWJsZSkge1xuICAgICAgICB0aGlzLnBvaW50LnRyYXZlbGxlZCA9IHRydWU7XG4gICAgICAgIHRoaXMucG9pbnQgPSB0aGlzLm1vdmVUbyh0aGlzLnBvaW50KTtcbiAgICAgICAgbGV0IG9sZFNwYWNlID0gdGhpcy5uZXh0U3BhY2U7XG4gICAgICAgIGxldCBuZXdTcGFjZSA9IG5ld1NwYWNlKG9sZFNwYWNlKTtcbiAgICAgICAgdGhpcy5uZXh0U3BhY2UgPSBuZXdTcGFjZTtcblxuICAgICAgICB0aGlzLmNoZWNrRGVhdGgoKTtcbiAgICAgICAgbW92YWJsZSA9IHRoaXMubW92ZVRvKHRoaXMucG9pbnQpO1xuICAgIH1cbn07XG5cblBsYXllci5wcm90b3R5cGUuY2hlY2tEZWF0aCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYWxsVHJhdmVsbGVkID0gdGhpcy5wb2ludC5uZWlnaGJvcnMuZmlsdGVyKGZ1bmN0aW9uIChuZWlnaGJvcikge1xuICAgICAgICByZXR1cm4gbmVpZ2hib3IudHJhdmVsbGVkO1xuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMucG9pbnQuZWRnZSB8fCBhbGxUcmF2ZWxsZWQubGVuZ3RoID09PSAyKSB0aGlzLmRpZSgpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5kaWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jYW5QbGF5ID0gZmFsc2U7XG4gICAgLy8gVE9ETzogbmVlZCB0byBzZW5kIGFuIGFsZXJ0IG9yIG1lc3NhZ2UgdG8gdGhlIHBsYXllciB3aG8ganVzdCBkaWVkLlxufTtcbiIsInZhciB0aWxlcyA9IFt7XG4gICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgcGF0aHM6IFszLCA0LCA2LCAwLCAxLCA3LCAyLCA1XSxcbiAgICByb3RhdGlvbjogMFxufSwge1xuICAgIGltYWdlVXJsOiBcIlwiLFxuICAgIHBhdGhzOiBbMSwgMCwgNCwgNywgMiwgNiwgNSwgM10sXG4gICAgcm90YXRpb246IDBcbn0sIHtcbiAgICBpbWFnZVVybDogXCJcIixcbiAgICBwYXRoczogWzEsIDAsIDQsIDYsIDIsIDcsIDMsIDVdLFxuICAgIHJvdGF0aW9uOiAwXG59LCB7XG4gICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgcGF0aHM6IFsyLCA1LCAwLCA3LCA2LCAxLCA0LCAzXSxcbiAgICByb3RhdGlvbjogMFxufSwge1xuICAgIGltYWdlVXJsOiBcIlwiLFxuICAgIHBhdGhzOiBbNCwgMiwgMSwgNiwgMCwgNywgMywgNV0sXG4gICAgcm90YXRpb246IDBcbn0sIHtcbiAgICBpbWFnZVVybDogXCJcIixcbiAgICBwYXRoczogWzEsIDAsIDUsIDcsIDYsIDIsIDQsIDNdLFxuICAgIHJvdGF0aW9uOiAwXG59LCB7XG4gICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgcGF0aHM6IFsyLCA0LCAwLCA2LCAxLCA3LCAzLCA1XSxcbiAgICByb3RhdGlvbjogMFxufSwge1xuICAgIGltYWdlVXJsOiBcIlwiLFxuICAgIHBhdGhzOiBbMiwgNSwgMCwgNiwgNywgMSwgMywgNF0sXG4gICAgcm90YXRpb246IDBcbn0sIHtcbiAgICBpbWFnZVVybDogXCJcIixcbiAgICBwYXRoczogWzEsIDAsIDcsIDYsIDUsIDQsIDMsIDJdLFxuICAgIHJvdGF0aW9uOiAwXG59LCB7XG4gICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgcGF0aHM6IFs0LCA1LCA2LCA3LCAwLCAxLCAyLCAzXSxcbiAgICByb3RhdGlvbjogMFxufSwge1xuICAgIGltYWdlVXJsOiBcIlwiLFxuICAgIHBhdGhzOiBbNywgMiwgMSwgNCwgMywgNiwgNSwgMF0sXG4gICAgcm90YXRpb246IDBcbn0sIHtcbiAgICBpbWFnZVVybDogXCJcIixcbiAgICBwYXRoczogWzIsIDcsIDAsIDUsIDYsIDMsIDQsIDFdLFxuICAgIHJvdGF0aW9uOiAwXG59LCB7XG4gICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgcGF0aHM6IFs1LCA0LCA3LCA2LCAxLCAwLCAzLCAyXSxcbiAgICByb3RhdGlvbjogMFxufSwge1xuICAgIGltYWdlVXJsOiBcIlwiLFxuICAgIHBhdGhzOiBbMywgMiwgMSwgMCwgNywgNiwgNSwgNF0sXG4gICAgcm90YXRpb246IDBcbn0sIHtcbiAgICBpbWFnZVVybDogXCJcIixcbiAgICBwYXRoczogWzEsIDAsIDcsIDQsIDMsIDYsIDUsIDJdLFxuICAgIHJvdGF0aW9uOiAwXG59LCB7XG4gICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgcGF0aHM6IFsxLCAwLCA1LCA2LCA3LCAyLCAzLCA0XSxcbiAgICByb3RhdGlvbjogMFxufSwge1xuICAgIGltYWdlVXJsOiBcIlwiLFxuICAgIHBhdGhzOiBbMywgNSwgNiwgMCwgNywgMSwgMiwgNF0sXG4gICAgcm90YXRpb246IDBcbn0sIHtcbiAgICBpbWFnZVVybDogXCJcIixcbiAgICBwYXRoczogWzIsIDcsIDAsIDQsIDMsIDYsIDUsIDFdLFxuICAgIHJvdGF0aW9uOiAwXG59LCB7XG4gICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgcGF0aHM6IFs0LCAzLCA2LCAxLCAwLCA3LCAyLCA1XSxcbiAgICByb3RhdGlvbjogMFxufSwge1xuICAgIGltYWdlVXJsOiBcIlwiLFxuICAgIHBhdGhzOiBbMiwgNiwgMCwgNCwgMywgNywgMSwgNV0sXG4gICAgcm90YXRpb246IDBcbn0sIHtcbiAgICBpbWFnZVVybDogXCJcIixcbiAgICBwYXRoczogWzIsIDMsIDAsIDEsIDcsIDYsIDUsIDRdLFxuICAgIHJvdGF0aW9uOiAwXG59LCB7XG4gICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgcGF0aHM6IFsyLCA2LCAwLCA1LCA3LCAzLCAxLCA0XSxcbiAgICByb3RhdGlvbjogMFxufSwge1xuICAgIGltYWdlVXJsOiBcIlwiLFxuICAgIHBhdGhzOiBbMSwgMCwgNiwgNCwgMywgNywgMiwgNV0sXG4gICAgcm90YXRpb246IDBcbn0sIHtcbiAgICBpbWFnZVVybDogXCJcIixcbiAgICBwYXRoczogWzMsIDQsIDcsIDAsIDEsIDYsIDUsIDJdLFxuICAgIHJvdGF0aW9uOiAwXG59LCB7XG4gICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgcGF0aHM6IFsxLCAwLCAzLCAyLCA3LCA2LCA1LCA0XSxcbiAgICByb3RhdGlvbjogMFxufSwge1xuICAgIGltYWdlVXJsOiBcIlwiLFxuICAgIHBhdGhzOiBbMSwgMCwgNiwgNywgNSwgNCwgMiwgM10sXG4gICAgcm90YXRpb246IDBcbn0sIHtcbiAgICBpbWFnZVVybDogXCJcIixcbiAgICBwYXRoczogWzIsIDQsIDAsIDcsIDEsIDYsIDUsIDNdLFxuICAgIHJvdGF0aW9uOiAwXG59LCB7XG4gICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgcGF0aHM6IFs0LCAyLCAxLCA3LCAwLCA2LCA1LCAzXSxcbiAgICByb3RhdGlvbjogMFxufSwge1xuICAgIGltYWdlVXJsOiBcIlwiLFxuICAgIHBhdGhzOiBbMSwgMCwgMywgMiwgNSwgNCwgNywgNl0sXG4gICAgcm90YXRpb246IDBcbn0sIHtcbiAgICBpbWFnZVVybDogXCJcIixcbiAgICBwYXRoczogWzIsIDMsIDAsIDEsIDYsIDcsIDQsIDVdLFxuICAgIHJvdGF0aW9uOiAwXG59LCB7XG4gICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgcGF0aHM6IFszLCA2LCA1LCAwLCA3LCAyLCAxLCA0XSxcbiAgICByb3RhdGlvbjogMFxufSwge1xuICAgIGltYWdlVXJsOiBcIlwiLFxuICAgIHBhdGhzOiBbMSwgMCwgNiwgNSwgNywgMywgMiwgNF0sXG4gICAgcm90YXRpb246IDBcbn0sIHtcbiAgICBpbWFnZVVybDogXCJcIixcbiAgICBwYXRoczogWzEsIDAsIDMsIDIsIDYsIDcsIDQsIDVdLFxuICAgIHJvdGF0aW9uOiAwXG59LCB7XG4gICAgaW1hZ2VVcmw6IFwiXCIsXG4gICAgcGF0aHM6IFs0LCA1LCA3LCA2LCAwLCAxLCAzLCAyXSxcbiAgICByb3RhdGlvbjogMFxufSwge1xuICAgIGltYWdlVXJsOiBcIlwiLFxuICAgIHBhdGhzOiBbMSwgMCwgNywgNSwgNiwgMywgNCwgMl0sXG4gICAgcm90YXRpb246IDBcbn1dO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
