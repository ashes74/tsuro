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

tsuro.controller('gameCtrl', function ($scope, $firebaseAuth, firebaseUrl, $stateParams, $firebaseObject, $firebaseArray) {
    var ref = firebase.database().ref();
    var obj = $firebaseObject(ref);

    var gameRef = ref.child('games').child($stateParams.gameName);
    var deckRef = gameRef.child('initialDeck');
    var playersRef = gameRef.child('players');
    var markersRef = gameRef.child('availableMarkers');

    // intialize game
    $scope.game = new Game($stateParams.gameName, $stateParams.deck);

    $scope.game.deck = $firebaseObject(deckRef);

    var markersArr = $firebaseArray(markersRef);

    markersArr.$loaded().then(function (data) {
        $scope.availableMarkers = data[0];
    });

    markersRef.on('value', function (availableMarkers) {
        $scope.availableMarkers = Object.keys(availableMarkers).map(function (i) {
            return availableMarkers[i];
        });
    });

    // assign $scope.me to the signed in user
    firebase.auth().onAuthStateChanged(function (user) {

        var firebasePlayersArr = $firebaseArray(playersRef);
        firebasePlayersArr.$loaded().then(function (data) {
            var FBplayers = data;

            if (user) {
                var userAuthId = user.uid;
                var me = FBplayers.filter(function (player) {
                    return player.uid === userAuthId;
                })[0];
                if (me) $scope.me = me;
                if ($scope.me.marker === "n") $scope.me.marker = null;
            } else {
                // No user is signed in.
                console.log("nothing");
            }
        });
    });

    //Have player pick the marker
    $scope.pickMarker = function (board, marker) {
        $scope.me.marker = marker;
        var firebasePlayersArr = $firebaseArray(playersRef);
        firebasePlayersArr.$loaded().then(function (players) {
            var meIdx = players.indexOf($scope.me);
            firebasePlayersArr.$save(idx);
        });
        var idx = $scope.availableMarkers.indexOf(marker);
        $scope.availableMarkers.splice(idx, 1);
        markersArr.$save(0).then(function (ref) {
            console.log("removed the picked one");
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

    // TODO: we probably need this on firebase so other people can't pick what's been picked

    //For synchronizingGame...
    var syncRef = gameRef.child('moves');
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
    // $scope.turnOrderArray = $scope.game.getCanPlay();

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
        gameRef.child('moves').$add({
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
});;

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
        }).catch(function (error) {
            console.error("Authentication failed:", error);
        });

        $state.go('pickGame');
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

        var playerArr = $firebaseArray(playersRef);
        playerArr.$loaded().then(function (players) {
            if (!players.filter(function (player) {
                return player.uid === firebaseUser.uid;
            })) {
                var newPlayer = new Player(firebaseUser.uid);
                $firebaseArray(playersRef).$add(newPlayer);
            }
        });

        $state.go('game', {
            "gameName": gameName
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

tsuro.controller('pickGameCtrl', function ($scope, $state, $firebaseArray, $firebaseObject, $firebaseAuth) {
    var ref = firebase.database().ref();
    var obj = $firebaseObject(ref);

    var auth = $firebaseAuth();
    var firebaseUser = auth.$getAuth();

    $scope.createGame = function (gameName) {
        var gameNameRef = ref.child('games').child(gameName);
        var playersRef = gameNameRef.child('players');

        $firebaseArray(gameNameRef).$add({
            "gameName": gameName
        });

        var newPlayer = new Player(firebaseUser.uid);
        $firebaseArray(playersRef).$add(newPlayer);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImdhbWUvYm9hcmQuanMiLCJnYW1lL2RlY2suanMiLCJnYW1lL2dhbWUuY29udHJ1Y3Rvci5qcyIsImdhbWUvZ2FtZS5qcyIsImxvZ2luL2xvZ2luLmpzIiwiZ2FtZWxpc3QvZ2FtZWxpc3QuanMiLCJwaWNrR2FtZS9waWNrR2FtZS5qcyIsInBsYXllci9wbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBQSxRQUFBLFFBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTs7QUFFQSxNQUFBLE1BQUEsQ0FBQSxZQUFBO0FBQ0EsUUFBQSxTQUFBO0FBQ0EsZ0JBQUEseUNBREE7QUFFQSxvQkFBQSxzQ0FGQTtBQUdBLHFCQUFBLDZDQUhBO0FBSUEsdUJBQUE7QUFKQSxLQUFBO0FBTUEsYUFBQSxhQUFBLENBQUEsTUFBQTtBQUNBLENBUkE7O0FBVUEsTUFBQSxRQUFBLENBQUEsYUFBQSxFQUFBLDRDQUFBOztBQUVBLE1BQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQTtBQUNBLHVCQUFBLFNBQUEsQ0FBQSxHQUFBO0FBQ0EsQ0FGQTs7QUNkQSxTQUFBLEtBQUEsR0FBQTtBQUNBLFNBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQTs7QUFFQSxNQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBO0FBQ0E7QUFDQSxXQUFBLEtBQUEsS0FBQTtBQUNBLENBUkE7O0FBVUEsU0FBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEVBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLFNBQUEsS0FBQSxHQUFBLElBQUE7QUFDQSxTQUFBLE1BQUEsR0FBQSxDQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBQUE7QUFDQSxTQUFBLE9BQUE7QUFDQSxTQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxzQkFBQTs7QUFFQSxZQUFBLElBQUEsQ0FBQSxFQUFBOztBQUNBLDRCQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLEM7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FDQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsTUFBQSxJQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLFNBSkEsTUFJQSxJQUFBLElBQUEsQ0FBQSxFQUFBOztBQUNBLGdCQUFBLE1BQUEsQ0FBQSxFQUFBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxLQUNBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxTQUhBLE1BR0EsSUFBQSxJQUFBLENBQUEsRUFBQTs7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FDQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsU0FIQSxNQUdBOztBQUNBLDRCQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLEM7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FDQTtBQUNBLHFCQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsTUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFJQSxTQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxTQUFBLElBQUEsR0FBQSxJQUFBO0FBQ0EsU0FBQSxTQUFBLEdBQUEsRUFBQTtBQUNBLFNBQUEsU0FBQSxHQUFBLEtBQUE7QUFDQTs7QUNqREE7O0lBRUEsSTtBQUNBLGtCQUFBLEtBQUEsRUFBQTtBQUFBOztBQUNBLGFBQUEsS0FBQSxHQUFBLEtBQUE7QUFDQTs7OztrQ0FFQTtBQUNBLGlCQUFBLEtBQUEsR0FBQSxFQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBLG1CQUFBLElBQUE7QUFDQTs7O29DQUVBO0FBQ0EsbUJBQUEsS0FBQSxLQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7QUFDQTs7OzZCQUVBLEcsRUFBQTtBQUNBLG1CQUFBLEtBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxDQUFBO0FBQ0E7OzsrQkFFQSxLLEVBQUE7QUFDQSxpQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLEtBQUE7QUFDQSxtQkFBQSxJQUFBO0FBQ0E7Ozs7OztBQ3ZCQTs7OztJQUlBLEk7QUFDQSxrQkFBQSxJQUFBLEVBQUE7QUFBQTs7QUFDQSxhQUFBLElBQUEsR0FBQSxJQUFBO0FBQ0EsYUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsS0FBQSxHQUFBLElBQUEsS0FBQSxHQUFBLFNBQUEsRUFBQTtBQUNBLGFBQUEsT0FBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLGdCQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsUUFBQSxFQUFBLFFBQUEsRUFBQSxPQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsUUFBQSxDQUFBOztBQUVBLGFBQUEsVUFBQSxDO0FBQ0EsYUFBQSxjQUFBLEdBQUEsRUFBQSxDO0FBQ0EsYUFBQSxNQUFBLEdBQUEsRUFBQSxDO0FBQ0EsYUFBQSxLQUFBO0FBQ0E7Ozs7MkNBRUE7QUFDQSxnQkFBQSxLQUFBLFVBQUEsS0FBQSxDQUFBLENBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsY0FBQSxDQUFBLEtBQUEsVUFBQSxDQUFBO0FBQ0E7Ozt5Q0FFQTtBQUNBLGlCQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxNQUFBO0FBQUEsdUJBQUEsT0FBQSxVQUFBLEVBQUE7QUFBQSxhQUFBO0FBQ0E7OztzQ0FDQTtBQUNBLGdCQUFBLG1CQUFBLEVBQUE7QUFDQSxpQkFBQSxPQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0Esb0JBQUEsQ0FBQSxPQUFBLE9BQUEsSUFBQSxPQUFBLEtBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EscUNBQUEsSUFBQSxDQUFBLE9BQUEsS0FBQTtBQUNBLG1DQUFBLElBQUE7QUFDQTtBQUNBLGFBTEE7QUFNQSxtQkFBQSxnQkFBQTtBQUNBOzs7b0NBRUE7QUFDQSxtQkFBQSxhQUFBLE1BQUEsSUFBQSxDQUFBO0FBQ0E7Ozs7Ozt5Q0FHQTtBQUNBLGdCQUFBLFdBQUEsS0FBQSxjQUFBLEVBQUEsTUFBQSxHQUFBLENBQUEsRUFBQTtBQUNBLG9CQUFBLFNBQUEsS0FBQSxVQUFBLEdBQUEsQ0FBQTtBQUNBLHVCQUFBLENBQUEsS0FBQSxjQUFBLENBQUEsU0FBQSxDQUFBLEVBQUEsT0FBQSxFQUFBO0FBQ0E7QUFDQTtBQUNBLHFCQUFBLFVBQUEsR0FBQSxNQUFBO0FBQ0EsYUFOQSxNQU1BO0FBQ0Es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Q0EsS0FKQTs7QUFNQSxXQUFBLGFBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsUUFBQTtBQUNBLFlBQUEsS0FBQSxRQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxRQUFBLEdBQUEsQ0FBQTtBQUNBLEtBSEE7Ozs7QUFPQSxXQUFBLFNBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTs7QUFFQSxZQUFBLEtBQUEsUUFBQSxHQUFBLENBQUEsRUFBQTtBQUNBLGlCQUFBLEtBQUEsR0FBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxVQUFBLEVBQUE7QUFDQSx1QkFBQSxhQUFBLENBQUE7QUFDQSxhQUZBLENBQUE7QUFHQSxpQkFBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGlCQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsU0FOQSxNQU1BLElBQUEsS0FBQSxRQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxHQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQTtBQUNBLHVCQUFBLGFBQUEsQ0FBQTtBQUNBLGFBRkEsQ0FBQTtBQUdBLGlCQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQTs7QUFFQSxlQUFBLEVBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQTtBQUNBLGdCQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsSUFBQSxDQUFBO0FBQ0Esb0JBQUEsV0FEQTtBQUVBLG9CQUFBO0FBRkEsU0FBQTs7QUFLQSxlQUFBLElBQUEsQ0FBQSxjQUFBOztBQUVBLFlBQUEsT0FBQSxJQUFBLENBQUEsU0FBQSxFQUFBLEVBQUE7O0FBRUEsbUJBQUEsTUFBQSxHQUFBLE9BQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxtQkFBQSxRQUFBLEdBQUEsSUFBQTtBQUNBLFNBSkEsTUFJQTs7QUFFQSxnQkFBQSxPQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsTUFBQSxFQUFBO0FBQ0EsdUJBQUEsTUFBQSxHQUFBLE9BQUEsRUFBQTtBQUNBLGFBRkEsTUFFQSxJQUFBLE9BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLEtBQUEsQ0FBQSxJQUFBLE9BQUEsTUFBQSxFQUFBO0FBQ0Esc0NBQUEsSUFBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLGFBRkEsTUFFQTs7QUFFQSx1QkFBQSxFQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSxvQkFBQSxPQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsTUFBQSxFQUFBOztBQUVBLDJCQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsT0FBQSxDQUFBLFVBQUEsZUFBQSxFQUFBO0FBQ0Esd0NBQUEsT0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsbUNBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQTtBQUNBLHlCQUZBO0FBR0EscUJBSkE7QUFLQSwyQkFBQSxJQUFBLENBQUEsSUFBQSxHQUFBLE9BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEVBQUE7O0FBRUEsNEJBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxJQUFBLENBQUE7QUFDQSxnQ0FBQSxZQURBO0FBRUEsc0NBQUEsT0FBQSxJQUFBLENBQUE7QUFGQSxxQkFBQTtBQUlBLHdCQUFBLE9BQUEsTUFBQSxFQUFBO0FBQ0EsK0JBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSwrQkFBQSxNQUFBLEdBQUEsSUFBQTs7QUFFQSwrQkFBQSxPQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxJQUFBLE9BQUEscUJBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxtQ0FBQSxxQkFBQSxDQUFBLEtBQUEsR0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQSw0QkFBQSxPQUFBLHFCQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsbUNBQUEsTUFBQSxHQUFBLE9BQUEscUJBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBLG1CQUFBLElBQUEsQ0FBQSxjQUFBO0FBQ0E7QUFDQSxLQW5FQTs7O0FBc0VBLFdBQUEsU0FBQTs7O0FBR0EsV0FBQSxLQUFBLEdBQUEsT0FBQSxJQUFBLENBQUEsS0FBQTs7QUFHQSxXQUFBLFFBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBLEVBR0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQSxFQUlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSkEsRUFLQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUxBLEVBTUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FOQSxFQU9BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUEEsRUFRQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVJBLEVBU0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FUQSxFQVVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVkEsRUFXQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVhBLEVBWUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FaQSxDQUFBO0FBY0EsV0FBQSxTQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQURBLEVBRUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQSxFQUdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEEsRUFJQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUpBLEVBS0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FMQSxFQU1BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTkEsRUFPQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVBBLEVBUUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FSQSxFQVNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVEEsRUFVQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVZBLEVBV0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FYQSxFQVlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWkEsQ0FBQTtBQWNBLFdBQUEsV0FBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBLEVBSUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FKQSxFQUtBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQU5BLEVBT0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FQQSxFQVFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUkEsRUFTQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVRBLEVBVUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FWQSxFQVdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWEEsRUFZQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVpBLENBQUE7QUFjQSxXQUFBLFVBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBLEVBR0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQSxFQUlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSkEsRUFLQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUxBLEVBTUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FOQSxFQU9BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUEEsRUFRQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVJBLEVBU0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FUQSxFQVVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVkEsRUFXQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVhBLEVBWUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FaQSxDQUFBO0FBZUEsQ0FsU0EsRUFrU0E7O0FDMVNBLE1BQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLGFBQUEsUUFEQTtBQUVBLHFCQUFBLDhCQUZBO0FBR0Esb0JBQUE7QUFIQSxLQUFBO0FBS0EsQ0FOQTs7QUFRQSxNQUFBLFVBQUEsQ0FBQSxXQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLGFBQUEsRUFBQSxVQUFBLEVBQUE7QUFDQSxRQUFBLE9BQUEsZUFBQTs7QUFFQSxXQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0EsYUFBQSxnQkFBQSxDQUFBLFFBQUEsRUFBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxvQkFBQSxHQUFBLENBQUEsZUFBQSxFQUFBLFFBQUE7QUFDQSx1QkFBQSxXQUFBLEdBQUEsUUFBQTtBQUNBLFNBSEEsRUFHQSxLQUhBLENBR0EsVUFBQSxLQUFBLEVBQUE7QUFDQSxvQkFBQSxLQUFBLENBQUEsd0JBQUEsRUFBQSxLQUFBO0FBQ0EsU0FMQTs7QUFPQSxlQUFBLEVBQUEsQ0FBQSxVQUFBO0FBQ0EsS0FUQTtBQVdBLENBZEE7O0FDUkEsTUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsYUFBQSxXQURBO0FBRUEscUJBQUEsb0NBRkE7QUFHQSxvQkFBQTtBQUhBLEtBQUE7QUFLQSxDQU5BOztBQVFBLE1BQUEsVUFBQSxDQUFBLFVBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsZUFBQSxFQUFBLE1BQUEsRUFBQSxhQUFBLEVBQUEsY0FBQSxFQUFBOztBQUVBLFFBQUEsTUFBQSxTQUFBLFFBQUEsR0FBQSxHQUFBLEVBQUE7QUFDQSxRQUFBLE1BQUEsZ0JBQUEsR0FBQSxDQUFBOztBQUVBLFFBQUEsT0FBQSxlQUFBO0FBQ0EsUUFBQSxlQUFBLEtBQUEsUUFBQSxFQUFBOztBQUVBLFFBQUEsV0FBQSxJQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUE7QUFDQSxRQUFBLGtCQUFBLGdCQUFBLFFBQUEsQ0FBQTs7OztBQUlBLG9CQUFBLE9BQUEsQ0FBQSxNQUFBLEVBQUEsVUFBQSxFQUNBLElBREEsQ0FDQSxZQUFBO0FBQ0EsWUFBQSxXQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxJQUFBLE9BQUEsUUFBQSxFQUFBO0FBQ0EscUJBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxFQUFBLE9BQUEsUUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQSxlQUFBLFNBQUEsR0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxLQVBBOztBQVVBLFdBQUEsSUFBQSxHQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsWUFBQSxjQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxLQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsWUFBQSxhQUFBLFlBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQTs7QUFFQSxZQUFBLFlBQUEsZUFBQSxVQUFBLENBQUE7QUFDQSxrQkFBQSxPQUFBLEdBQ0EsSUFEQSxDQUNBLFVBQUEsT0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxRQUFBLE1BQUEsQ0FBQTtBQUFBLHVCQUFBLE9BQUEsR0FBQSxLQUFBLGFBQUEsR0FBQTtBQUFBLGFBQUEsQ0FBQSxFQUFBO0FBQ0Esb0JBQUEsWUFBQSxJQUFBLE1BQUEsQ0FBQSxhQUFBLEdBQUEsQ0FBQTtBQUNBLCtCQUFBLFVBQUEsRUFBQSxJQUFBLENBQUEsU0FBQTtBQUNBO0FBQ0EsU0FOQTs7QUFRQSxlQUFBLEVBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSx3QkFBQTtBQURBLFNBQUE7QUFHQSxLQWhCQTtBQWlCQSxDQXhDQTs7QUNSQSxNQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxhQUFBLFdBREE7QUFFQSxxQkFBQSxvQ0FGQTtBQUdBLG9CQUFBO0FBSEEsS0FBQTtBQUtBLENBTkE7O0FBUUEsTUFBQSxVQUFBLENBQUEsY0FBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxjQUFBLEVBQUEsZUFBQSxFQUFBLGFBQUEsRUFBQTtBQUNBLFFBQUEsTUFBQSxTQUFBLFFBQUEsR0FBQSxHQUFBLEVBQUE7QUFDQSxRQUFBLE1BQUEsZ0JBQUEsR0FBQSxDQUFBOztBQUVBLFFBQUEsT0FBQSxlQUFBO0FBQ0EsUUFBQSxlQUFBLEtBQUEsUUFBQSxFQUFBOztBQUVBLFdBQUEsVUFBQSxHQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsWUFBQSxjQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxLQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsWUFBQSxhQUFBLFlBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQTs7QUFFQSx1QkFBQSxXQUFBLEVBQUEsSUFBQSxDQUFBO0FBQ0Esd0JBQUE7QUFEQSxTQUFBOztBQUlBLFlBQUEsWUFBQSxJQUFBLE1BQUEsQ0FBQSxhQUFBLEdBQUEsQ0FBQTtBQUNBLHVCQUFBLFVBQUEsRUFBQSxJQUFBLENBQUEsU0FBQTs7QUFFQSxZQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxnQkFBQSxRQUFBLEtBQUEsS0FBQTtBQUNBLGdCQUFBLE9BQUEsSUFBQSxJQUFBLENBQUEsS0FBQSxFQUFBLE9BQUEsR0FBQSxLQUFBO0FBQ0EsZ0JBQUEsaUJBQUEsSUFBQSxLQUFBLENBQUEsT0FBQSxFQUFBLEtBQUEsQ0FBQSxRQUFBLEVBQUEsS0FBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLDJCQUFBLGNBQUEsRUFBQSxJQUFBLENBQUEsSUFBQTtBQUNBLFNBTEE7O0FBUUEsWUFBQSxvQkFBQSxJQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsS0FBQSxDQUFBLFFBQUEsRUFBQSxLQUFBLENBQUEsa0JBQUEsQ0FBQTtBQUNBLHVCQUFBLGlCQUFBLEVBQUEsSUFBQSxDQUFBLENBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxRQUFBLEVBQUEsT0FBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLFFBQUEsQ0FBQTs7QUFHQSxlQUFBLEVBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSx3QkFBQTtBQURBLFNBQUE7QUFHQSxLQTFCQTs7QUE0QkEsV0FBQSxZQUFBLEdBQUEsWUFBQTtBQUNBLGVBQUEsRUFBQSxDQUFBLFVBQUE7QUFDQSxLQUZBO0FBR0EsQ0F0Q0E7O0FDUkE7O0FBRUEsU0FBQSxNQUFBLENBQUEsR0FBQSxFQUFBOztBQUVBLFNBQUEsR0FBQSxHQUFBLEdBQUE7O0FBRUEsU0FBQSxNQUFBLEdBQUEsR0FBQTs7O0FBR0EsU0FBQSxLQUFBLEdBQUEsR0FBQTs7OztBQUlBLFNBQUEsU0FBQSxHQUFBLEdBQUE7OztBQUdBLFNBQUEsb0JBQUEsR0FBQSxHQUFBOzs7QUFHQSxTQUFBLEtBQUEsR0FBQSxHQUFBOzs7QUFHQSxTQUFBLE9BQUEsR0FBQSxJQUFBO0FBQ0E7O0FBRUEsT0FBQSxTQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQTs7QUFFQSxRQUFBLElBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLElBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLGNBQUEsTUFBQSxDQUFBLENBQUE7O0FBRUEsU0FBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxTQUFBLEtBQUEsQ0FBQSxTQUFBLEdBQUEsSUFBQTs7O0FBR0EsU0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBOzs7QUFHQSxTQUFBLG9CQUFBLEdBQUEsS0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBLENBZEE7O0FBZ0JBLE9BQUEsU0FBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUE7QUFDQSxRQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsRUFBQTtBQUNBLGVBQUEsTUFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLENBQUE7QUFDQSxLQUZBLE1BRUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLEVBQUE7QUFDQSxlQUFBLE1BQUEsU0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsS0FGQSxNQUVBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxFQUFBO0FBQ0EsZUFBQSxNQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtBQUNBLEtBRkEsTUFFQTtBQUNBLGVBQUEsTUFBQSxTQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLENBVkE7O0FBWUEsT0FBQSxTQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsUUFBQSxRQUFBLEtBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7O0FBRUEsU0FBQSxTQUFBLENBQUEsT0FBQSxHQUFBLEtBQUEsUUFBQTs7QUFFQSxTQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxLQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLENBVEE7O0FBV0EsT0FBQSxTQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsT0FBQSxFQUFBOzs7O0FBSUEsUUFBQSxZQUFBLFFBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGVBQUEsQ0FBQSxTQUFBLFNBQUE7QUFDQSxLQUZBLEVBRUEsQ0FGQSxDQUFBOztBQUlBLFdBQUEsU0FBQTtBQUNBLENBVEE7O0FBV0EsT0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLFVBQUEsS0FBQSxNQUFBLENBQUEsS0FBQSxLQUFBLENBQUE7QUFDQSxXQUFBLE9BQUEsRUFBQTtBQUNBLGFBQUEsS0FBQSxDQUFBLFNBQUEsR0FBQSxJQUFBO0FBQ0EsYUFBQSxLQUFBLEdBQUEsS0FBQSxNQUFBLENBQUEsS0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLFdBQUEsS0FBQSxTQUFBO0FBQ0EsWUFBQSxXQUFBLFNBQUEsUUFBQSxDQUFBO0FBQ0EsYUFBQSxTQUFBLEdBQUEsUUFBQTs7QUFFQSxhQUFBLFVBQUE7QUFDQSxrQkFBQSxLQUFBLE1BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBO0FBQ0EsQ0FaQTs7QUFjQSxPQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsZUFBQSxLQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsZUFBQSxTQUFBLFNBQUE7QUFDQSxLQUZBLENBQUE7O0FBSUEsUUFBQSxLQUFBLEtBQUEsQ0FBQSxJQUFBLElBQUEsYUFBQSxNQUFBLEtBQUEsQ0FBQSxFQUFBLEtBQUEsR0FBQTtBQUNBLENBTkE7O0FBUUEsT0FBQSxTQUFBLENBQUEsR0FBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLE9BQUEsR0FBQSxLQUFBOztBQUVBLENBSEEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciB0c3VybyA9IGFuZ3VsYXIubW9kdWxlKCdUc3VybycsIFsndWkucm91dGVyJywgJ2ZpcmViYXNlJ10pO1xuXG50c3Vyby5jb25maWcoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB7XG4gICAgICAgIGFwaUtleTogXCJBSXphU3lDTG0zamtrNXBwTXFlUXhLb0gtZFo5Q2RZTWFER1dXcVVcIixcbiAgICAgICAgYXV0aERvbWFpbjogXCJ0aGUtcGF0aHMtb2YtZHJhZ29ucy5maXJlYmFzZWFwcC5jb21cIixcbiAgICAgICAgZGF0YWJhc2VVUkw6IFwiaHR0cHM6Ly90aGUtcGF0aHMtb2YtZHJhZ29ucy5maXJlYmFzZWlvLmNvbVwiLFxuICAgICAgICBzdG9yYWdlQnVja2V0OiBcInRoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tXCIsXG4gICAgfTtcbiAgICBmaXJlYmFzZS5pbml0aWFsaXplQXBwKGNvbmZpZyk7XG59KTtcblxudHN1cm8uY29uc3RhbnQoJ2ZpcmViYXNlVXJsJywgJ2h0dHBzOi8vcGF0aC1vZi10aGUtZHJhZ29uLmZpcmViYXNlaW8uY29tLycpO1xuXG50c3Vyby5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbn0pO1xuIiwiZnVuY3Rpb24gQm9hcmQoKSB7XG4gICAgdGhpcy5ib2FyZCA9IFtdO1xufVxuXG5Cb2FyZC5wcm90b3R5cGUuZHJhd0JvYXJkID0gZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgNjsgeSsrKSB7XG4gICAgICAgIGlmICghdGhpcy5ib2FyZFt5XSkgdGhpcy5ib2FyZFt5XSA9IFtdO1xuICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IDY7IHgrKykge1xuICAgICAgICAgICAgdGhpcy5ib2FyZFt5XS5wdXNoKG5ldyBTcGFjZSh4LCB5LCB0aGlzLmJvYXJkKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYm9hcmQ7XG59XG5cbmZ1bmN0aW9uIFNwYWNlKHgsIHksIGJvYXJkKSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICAgIHRoaXMuaW1hZ2UgPSBudWxsO1xuICAgIHRoaXMucG9pbnRzID0gW251bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGxdO1xuICAgIHRoaXMudGlsZVVybDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICBsZXQgY29ycmVzcG9uZGluZztcblxuICAgICAgICBpZiAoaSA8IDIpIHsgLy90b3BcbiAgICAgICAgICAgIGNvcnJlc3BvbmRpbmcgPSBpID09PSAwID8gNSA6IDQ7IC8vIDAgLT4gNSAmIDEgLT4gNFxuICAgICAgICAgICAgaWYgKHkgPT09IDApIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KHRydWUpO1xuICAgICAgICAgICAgZWxzZSB0aGlzLnBvaW50c1tpXSA9IGJvYXJkW3kgLSAxXVt4XS5wb2ludHNbY29ycmVzcG9uZGluZ107XG4gICAgICAgIH0gZWxzZSBpZiAoaSA8IDQpIHsgLy9yaWdodFxuICAgICAgICAgICAgaWYgKHggPT09IDUpIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KHRydWUpO1xuICAgICAgICAgICAgZWxzZSB0aGlzLnBvaW50c1tpXSA9IG5ldyBQb2ludChmYWxzZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaSA8IDYpIHsgLy9ib3R0b21cbiAgICAgICAgICAgIGlmICh5ID09PSA1KSB0aGlzLnBvaW50c1tpXSA9IG5ldyBQb2ludCh0cnVlKTtcbiAgICAgICAgICAgIGVsc2UgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQoZmFsc2UpO1xuICAgICAgICB9IGVsc2UgeyAvL2xlZnRcbiAgICAgICAgICAgIGNvcnJlc3BvbmRpbmcgPSBpID09PSA2ID8gMyA6IDI7IC8vIDYgLT4gMyAmIDcgLT4gMlxuICAgICAgICAgICAgaWYgKHggPT09IDApIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KHRydWUpO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb2ludHNbaV0gPSBib2FyZFt5XVt4IC0gMV0ucG9pbnRzW2NvcnJlc3BvbmRpbmddO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5cbi8vIGVkZ2UgPSBib29sZWFuXG5mdW5jdGlvbiBQb2ludChlZGdlKSB7XG4gICAgdGhpcy5lZGdlID0gZWRnZTtcbiAgICB0aGlzLm5laWdoYm9ycyA9IFtdO1xuICAgIHRoaXMudHJhdmVsbGVkID0gZmFsc2U7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmNsYXNzIERlY2sge1xuICAgIGNvbnN0cnVjdG9yKHRpbGVzKSB7XG4gICAgICAgIHRoaXMudGlsZXMgPSB0aWxlc1xuICAgIH1cblxuICAgIHNodWZmbGUoKSB7XG4gICAgICAgIHRoaXMudGlsZXMgPSBfLnNodWZmbGUodGhpcy50aWxlcylcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZGVhbFRocmVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlcy5zcGxpY2UoMCwgMyk7XG4gICAgfVxuXG4gICAgZGVhbChudW0pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZXMuc3BsaWNlKDAsIG51bSk7XG4gICAgfVxuXG4gICAgcmVsb2FkKHRpbGVzKSB7XG4gICAgICAgIHRoaXMudGlsZXMucHVzaCh0aWxlcylcbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vR0FNRS8vL1xuXG5jbGFzcyBHYW1lIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuY291bnQgPSAzNTtcbiAgICAgICAgdGhpcy5ib2FyZCA9IG5ldyBCb2FyZCgpLmRyYXdCb2FyZCgpO1xuICAgICAgICB0aGlzLnBsYXllcnMgPSBbXTtcbiAgICAgICAgdGhpcy5hdmFpbGFibGVNYXJrZXJzID0gW1wicmVkXCIsIFwib3JhbmdlXCIsIFwieWVsbG93XCIsIFwiZ3JlZW5cIiwgXCJhcXVhXCIsIFwiYmx1ZVwiLCBcIm5hdnlcIiwgXCJwdXJwbGVcIl1cblxuICAgICAgICB0aGlzLmN1cnJQbGF5ZXI7IC8vaW5kZXggb2YgdGhlIGN1cnJlbnRQbGF5ZXIgaW4gdGhlIHR1cm5PcmRlckFycmF5XG4gICAgICAgIHRoaXMudHVybk9yZGVyQXJyYXkgPSBbXSAvL2hvbGRzIGFsbCB0aGUgcGxheWVycyBzdGlsbCBvbiB0aGUgYm9hcmQuXG4gICAgICAgIHRoaXMuZHJhZ29uID0gXCJcIjsgLy8gUGxheWVyLk1hcmtlclxuICAgICAgICB0aGlzLm1vdmVzO1xuICAgIH1cblxuICAgIGdldEN1cnJlbnRQbGF5ZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJQbGF5ZXIgPT09IC0xKSByZXR1cm47XG4gICAgICAgIHJldHVybiB0aGlzLnR1cm5PcmRlckFycmF5W3RoaXMuY3VyclBsYXllcl07XG4gICAgfTtcblxuICAgIG1vdmVBbGxQbGF5ZXJzKCkge1xuICAgICAgICB0aGlzLnBsYXllcnMuZm9yRWFjaCgocGxheWVyKSA9PiBwbGF5ZXIua2VlcE1vdmluZygpKVxuICAgIH07XG4gICAgZGVhZFBsYXllcnMoKSB7XG4gICAgICAgIHZhciBkZWFkUGxheWVyc1RpbGVzID0gW107XG4gICAgICAgIHRoaXMucGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICAgICAgIGlmICghcGxheWVyLmNhblBsYXkgJiYgcGxheWVyLnRpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBkZWFkUGxheWVyc1RpbGVzLnB1c2gocGxheWVyLnRpbGVzKTtcbiAgICAgICAgICAgICAgICBpc0RlYWRQbGF5ZXIgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGRlYWRQbGF5ZXJzVGlsZXM7XG4gICAgfTtcblxuICAgIGNoZWNrT3ZlcigpIHtcbiAgICAgICAgcmV0dXJuIGdldENhblBsYXkoKS5sZW5ndGggPD0gMTtcbiAgICB9XG5cbiAgICAvL3RvIGJlIGNhbGxlZCBhdCB0aGUgZW5kIG9mIGEgdHVybiB0byBzZXQgdGhlIGN1cnJQbGF5ZXIgdG8gdGhlIG5leHQgZWxpZ2libGUgcGxheWVyIGluIHRoZSB0dXJuT3JkZXJBcnJheVxuICAgIGdvVG9OZXh0UGxheWVyKCkge1xuICAgICAgICBpZiAoZ2V0Q2FuUGxheSh0aGlzLnR1cm5PcmRlckFycmF5KS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBsZXQgbmV3SWR4ID0gdGhpcy5jdXJyUGxheWVyICsgMTtcbiAgICAgICAgICAgIHdoaWxlICghdGhpcy50dXJuT3JkZXJBcnJheVtuZXdJZHggJSA4XS5jYW5QbGF5KSB7XG4gICAgICAgICAgICAgICAgbmV3SWR4Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmN1cnJQbGF5ZXIgPSBuZXdJZHg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJQbGF5ZXIgPSAtMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5nZXRDdXJyZW50UGxheWVyKCk7XG4gICAgfTtcblxuICAgIC8vcmVzdGFydCB0aGUgZ2FtZVxuICAgIHJlc2V0KCkge1xuICAgICAgICB0aGlzLnBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgICAgICAgLy9yZXRyaWV2ZSBhbGwgdGlsZXNcbiAgICAgICAgICAgIC8vcmV0dXJuIHBsYXllcidzIHRpbGVzIHRvIHRoZSBkZWNrIGFuZCBzaHVmZmxlXG4gICAgICAgICAgICB0aGlzLmRlY2sucmVsb2FkKHBsYXllci50aWxlcykuc2h1ZmZsZSgpO1xuICAgICAgICAgICAgcGxheWVyLnRpbGVzID0gW107XG4gICAgICAgICAgICAvL3Jlc2V0IGFsbCBwbGF5ZXJzIHBsYXlhYmlsaXR5XG4gICAgICAgICAgICBwbGF5ZXIuY2FuUGxheSA9IHRydWU7XG4gICAgICAgIH0pXG4gICAgfTtcblxufVxuXG4vLy8vL0VORCBPRiBHQU1FIENMQVNTLy8vLy9cblxuLy9nZXQgRWxpZ2libGUgcGxheWVyc1xubGV0IGdldENhblBsYXkgPSBmdW5jdGlvbiAocGxheWVycykge1xuICAgIHJldHVybiBwbGF5ZXJzLmZpbHRlcigocGxheWVyKSA9PiB7XG4gICAgICAgIHJldHVybiBwbGF5ZXIuY2FuUGxheVxuICAgIH0pXG59XG4iLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2dhbWUnLCB7XG4gICAgICAgIHVybDogJy9nYW1lLzpnYW1lTmFtZScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2Jyb3dzZXIvanMvZ2FtZS9nYW1lLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnZ2FtZUN0cmwnXG4gICAgfSk7XG59KTtcblxudHN1cm8uY29udHJvbGxlcignZ2FtZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkZmlyZWJhc2VBdXRoLCBmaXJlYmFzZVVybCwgJHN0YXRlUGFyYW1zLCAkZmlyZWJhc2VPYmplY3QsICRmaXJlYmFzZUFycmF5KSB7XG4gICAgdmFyIHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XG4gICAgdmFyIG9iaiA9ICRmaXJlYmFzZU9iamVjdChyZWYpO1xuXG4gICAgdmFyIGdhbWVSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoJHN0YXRlUGFyYW1zLmdhbWVOYW1lKTtcbiAgICB2YXIgZGVja1JlZiA9IGdhbWVSZWYuY2hpbGQoJ2luaXRpYWxEZWNrJyk7XG4gICAgdmFyIHBsYXllcnNSZWYgPSBnYW1lUmVmLmNoaWxkKCdwbGF5ZXJzJyk7XG4gICAgdmFyIG1hcmtlcnNSZWYgPSBnYW1lUmVmLmNoaWxkKCdhdmFpbGFibGVNYXJrZXJzJyk7XG5cbiAgICAvLyBpbnRpYWxpemUgZ2FtZVxuICAgICRzY29wZS5nYW1lID0gbmV3IEdhbWUoJHN0YXRlUGFyYW1zLmdhbWVOYW1lLCAkc3RhdGVQYXJhbXMuZGVjayk7XG5cbiAgICAkc2NvcGUuZ2FtZS5kZWNrID0gJGZpcmViYXNlT2JqZWN0KGRlY2tSZWYpO1xuXG4gICAgdmFyIG1hcmtlcnNBcnIgPSAkZmlyZWJhc2VBcnJheShtYXJrZXJzUmVmKTtcblxuICAgIG1hcmtlcnNBcnIuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgJHNjb3BlLmF2YWlsYWJsZU1hcmtlcnMgPSBkYXRhWzBdXG4gICAgfSk7XG5cbiAgICBtYXJrZXJzUmVmLm9uKCd2YWx1ZScsIGZ1bmN0aW9uIChhdmFpbGFibGVNYXJrZXJzKSB7XG4gICAgICAgICRzY29wZS5hdmFpbGFibGVNYXJrZXJzID0gT2JqZWN0LmtleXMoYXZhaWxhYmxlTWFya2VycykubWFwKGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICAgICByZXR1cm4gYXZhaWxhYmxlTWFya2Vyc1tpXTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBhc3NpZ24gJHNjb3BlLm1lIHRvIHRoZSBzaWduZWQgaW4gdXNlclxuICAgIGZpcmViYXNlLmF1dGgoKS5vbkF1dGhTdGF0ZUNoYW5nZWQoZnVuY3Rpb24gKHVzZXIpIHtcblxuICAgICAgICB2YXIgZmlyZWJhc2VQbGF5ZXJzQXJyID0gJGZpcmViYXNlQXJyYXkocGxheWVyc1JlZilcbiAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICB2YXIgRkJwbGF5ZXJzID0gZGF0YTtcblxuICAgICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgICAgICB2YXIgdXNlckF1dGhJZCA9IHVzZXIudWlkO1xuICAgICAgICAgICAgICAgIHZhciBtZSA9IEZCcGxheWVycy5maWx0ZXIocGxheWVyID0+IHBsYXllci51aWQgPT09IHVzZXJBdXRoSWQpWzBdO1xuICAgICAgICAgICAgICAgIGlmIChtZSkgJHNjb3BlLm1lID0gbWU7XG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZS5tZS5tYXJrZXIgPT09IFwiblwiKSAkc2NvcGUubWUubWFya2VyID0gbnVsbDtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBObyB1c2VyIGlzIHNpZ25lZCBpbi5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIm5vdGhpbmdcIilcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KVxuICAgIH0pO1xuXG4gICAgLy9IYXZlIHBsYXllciBwaWNrIHRoZSBtYXJrZXJcbiAgICAkc2NvcGUucGlja01hcmtlciA9IGZ1bmN0aW9uIChib2FyZCwgbWFya2VyKSB7XG4gICAgICAgICRzY29wZS5tZS5tYXJrZXIgPSBtYXJrZXI7XG4gICAgICAgIHZhciBmaXJlYmFzZVBsYXllcnNBcnIgPSAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKVxuICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJGxvYWRlZCgpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocGxheWVycykge1xuICAgICAgICAgICAgICAgIHZhciBtZUlkeCA9IHBsYXllcnMuaW5kZXhPZigkc2NvcGUubWUpXG4gICAgICAgICAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyLiRzYXZlKGlkeClcblxuICAgICAgICAgICAgfSlcbiAgICAgICAgdmFyIGlkeCA9ICRzY29wZS5hdmFpbGFibGVNYXJrZXJzLmluZGV4T2YobWFya2VyKTtcbiAgICAgICAgJHNjb3BlLmF2YWlsYWJsZU1hcmtlcnMuc3BsaWNlKGlkeCwgMSlcbiAgICAgICAgbWFya2Vyc0Fyci4kc2F2ZSgwKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlZikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlZCB0aGUgcGlja2VkIG9uZVwiKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlZi5rZXkpXG4gICAgICAgICAgICB9KVxuICAgIH07XG5cbiAgICAvL0hhdmUgcGxheWVyIHBpY2sgdGhlaXIgc3RhcnQgcG9pbnRcblxuICAgICRzY29wZS5wbGFjZU1hcmtlciA9IGZ1bmN0aW9uIChib2FyZCwgcG9pbnQpIHtcbiAgICAgICAgJHNjb3BlLm1lLnBsYWNlTWFya2VyKHBvaW50KTtcbiAgICAgICAgJHNjb3BlLmdhbWUucGxheWVycy5wdXNoKCRzY29wZS5wbGF5ZXIpO1xuXG4gICAgICAgIGdhbWVSZWYuY2hpbGQoJ3BsYXllcnMnKS5jaGlsZChwbGF5ZXIudWlkKS5wdXNoKHtcbiAgICAgICAgICAgICdtYXJrZXInOiBwbGF5ZXIubWFya2VyLFxuICAgICAgICAgICAgJ3N0YXJ0aW5nUG9zaXRpb24nOiBwbGF5ZXIuc3RhcnRpbmdQb3NpdGlvblxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy90YWtlIGFsbCBwbGF5ZXJzIG9uIGZpcmViYXNlIGFuZCB0dXJuIHRoZW0gaW50byBsb2NhbCBwbGF5ZXJcbiAgICBwbGF5ZXJzUmVmLm9uKFwiY2hpbGRfYWRkZWRcIiwgZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICB2YXIgbmV3UGxheWVyID0gbmV3IFBsYXllcihwbGF5ZXIudWlkKTtcbiAgICAgICAgbmV3UGxheWVyLm1hcmtlciA9IHBsYXllci5tYXJrZXI7XG5cbiAgICAgICAgdmFyIHggPSBwbGF5ZXIuc3RhcnRpbmdQb3NpdGlvblswXTtcbiAgICAgICAgdmFyIHkgPSBwbGF5ZXIuc3RhcnRpbmdQb3NpdGlvblsxXTtcbiAgICAgICAgdmFyIHBvaW50c0luZGV4ID0gcGxheWVyLnN0YXJ0aW5nUG9zaXRpb25bMl07XG5cbiAgICAgICAgbmV3UGxheWVyLnBvaW50ID0gYm9hcmRbeV1beF0ucG9pbnRzW3BvaW50c0luZGV4XTtcbiAgICAgICAgbmV3UGxheWVyLm5leHRTcGFjZSA9IGJvYXJkW3ldW3hdO1xuICAgICAgICBuZXdQbGF5ZXIubmV4dFNwYWNlUG9pbnRzSW5kZXggPSBwbGF5ZXIuc3RhcnRpbmdQb3NpdGlvblsyXTtcblxuICAgICAgICBuZXdQbGF5ZXIudGlsZXMgPSAkc2NvcGUuZ2FtZS5kZWNrLmRlYWxUaHJlZSgpO1xuXG4gICAgICAgICRzY29wZS5nYW1lLnBsYXllcnMucHVzaChuZXdQbGF5ZXIpO1xuICAgIH0pO1xuXG5cblxuXG5cblxuXG4gICAgLy8gVE9ETzogd2UgcHJvYmFibHkgbmVlZCB0aGlzIG9uIGZpcmViYXNlIHNvIG90aGVyIHBlb3BsZSBjYW4ndCBwaWNrIHdoYXQncyBiZWVuIHBpY2tlZFxuXG4gICAgLy9Gb3Igc3luY2hyb25pemluZ0dhbWUuLi5cbiAgICB2YXIgc3luY1JlZiA9IGdhbWVSZWYuY2hpbGQoJ21vdmVzJyk7XG4gICAgc3luY1JlZi5vbignY2hpbGRfYWRkZWQnLCBmdW5jdGlvbiAoY2hpbGRTbmFwc2hvdCwgcHJldkNoaWxkS2V5KSB7XG4gICAgICAgIC8vTkVFRCBUTyBET1VCTEUgQ0hFQ0shISBXaGF0IGRvZXMgY2hpbGRTbmFwIHJldHVybnM/XG4gICAgICAgIGNvbnNvbGUubG9nKCdjaGlsZFNuYXBzaG90X1N5bmNHYW1lJywgY2hpbGRTbmFwc2hvdCk7XG4gICAgICAgIC8vZGVwZW5kaW5nIG9uIHdoYXQgY2hpbGRTbmFwc2hvdCBnaXZlcyBtZS4uLkkgdGhpbmsgaXQncyBvbmUgY2hpbGQgcGVyIG9uIGNhbGw/IEl0IGRvZXNuJ3QgcmV0dXJuIGFuIGFycmF5IG9mIGNoYW5nZXMuLi5JIGJlbGlldmUhXG4gICAgICAgIGlmIChjaGlsZFNuYXBzaG90LnR5cGUgPT09ICd1cGRhdGVEZWNrJykge1xuICAgICAgICAgICAgJHNjb3BlLmdhbWUuZGVjayA9IGNoaWxkU25hcHNob3QudXBkYXRlRGVjaztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRzY29wZS5wbGFjZVRpbGUoY2hpbGRTbmFwc2hvdC50aWxlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gVE9ETzogaG93IHRvIHJlLWRvIHRoZSBtb3Zlcz9cbiAgICAvLyAkc2NvcGUuZ2FtZS5tb3ZlcztcblxuICAgIC8vIFRPRE86IGhvdyBkbyB3ZSBzaG93IHRoZSB0aWxlcyBmb3IgcGxheWVyP1xuXG4gICAgLy8gVE9ETzogaG93IHRvIHNob3cgdGhlIHJvdGF0ZWQgdGlsZT9cblxuICAgIC8vIENNVDogYXNzdW1pbmcgd2UgdXNlIG5ldyBHYW1lKCkgZm9yIGVhY2ggZ2FtZVxuICAgICRzY29wZS5jdXJyZW50UGxheWVyID0gJHNjb3BlLmdhbWUuZ2V0Q3VycmVudFBsYXllcigpO1xuXG4gICAgLy8gQ01UOiBhc3N1bWluZyB3ZSB1c2UgbmV3IEdhbWUoKSBmb3IgZWFjaCBnYW1lLCBob2xkcyBhbGwgdGhlIHBsYXllcnMgc3RpbGwgb24gdGhlIGJvYXJkLlxuICAgIC8vICRzY29wZS50dXJuT3JkZXJBcnJheSA9ICRzY29wZS5nYW1lLmdldENhblBsYXkoKTtcblxuICAgIC8vIFRPRE86IG5lZWQgYSBmdW5jdGlvbiB0byBhc3NpZ24gZHJhZ29uXG4gICAgJHNjb3BlLmRyYWdvbjtcbiAgICB2YXIgYXdhaXRpbmdEcmFnb25Ib2xkZXJzID0gW107XG5cblxuICAgICRzY29wZS5zdGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy9cbiAgICB9O1xuXG4gICAgJHNjb3BlLm15VHVybiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHNjb3BlLm1lID09PSAkc2NvcGUuY3VycmVudFBsYXllcjtcbiAgICB9O1xuXG4gICAgLy90aGVzZSBhcmUgdGllZCB0byBhbmd1bGFyIG5nLWNsaWNrIGJ1dHRvbnNcbiAgICAkc2NvcGUucm90YXRlVGlsZUN3ID0gZnVuY3Rpb24gKHRpbGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJyb3RhdGUgdG8gcmlnaHRcIilcbiAgICAgICAgdGlsZS5yb3RhdGlvbisrO1xuICAgICAgICBpZiAodGlsZS5yb3RhdGlvbiA9PT0gNCkgdGlsZS5yb3RhdGlvbiA9IDA7XG4gICAgfTtcblxuICAgICRzY29wZS5yb3RhdGVUaWxlQ2N3ID0gZnVuY3Rpb24gKHRpbGUpIHtcbiAgICAgICAgdGlsZS5yb3RhdGlvbi0tO1xuICAgICAgICBpZiAodGlsZS5yb3RhdGlvbiA9PT0gLTQpIHRpbGUucm90YXRpb24gPSAwO1xuICAgIH07XG5cbiAgICAvLyBDTVQ6IGFzc3VtaW5nIHdlIHVzZSBuZXcgR2FtZSgpXG4gICAgLy8gQ01UOiB1c2UgcGxheWVyJ3MgYW5kIGdhbWUncyBwcm90b3R5cGUgZnVuY3Rpb24gdG8gcGxhY2UgdGlsZSBhbmQgdGhlbiBtb3ZlIGFsbCBwbGF5ZXJzXG4gICAgJHNjb3BlLnBsYWNlVGlsZSA9IGZ1bmN0aW9uICh0aWxlKSB7XG4gICAgICAgIC8vIFRPRE86IHNlbmQgdGhpcyBzdGF0ZSB0byBmaXJlYmFzZSBldmVyeSB0aW1lIGl0J3MgY2FsbGVkXG4gICAgICAgIGlmICh0aWxlLnJvdGF0aW9uID4gMCkge1xuICAgICAgICAgICAgdGlsZS5wYXRocyA9IHRpbGUucGF0aHMubWFwKGZ1bmN0aW9uIChjb25uZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbm5lY3Rpb24gKyAyO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aWxlLnBhdGhzLnVuc2hpZnQodGlsZS5wYXRocy5wb3AoKSk7XG4gICAgICAgICAgICB0aWxlLnBhdGhzLnVuc2hpZnQodGlsZS5wYXRocy5wb3AoKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGlsZS5yb3RhdGlvbiA8IDApIHtcbiAgICAgICAgICAgIHRpbGUucGF0aHMgPSB0aWxlLnBhdGhzLm1hcChmdW5jdGlvbiAoY29ubmVjdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb25uZWN0aW9uIC0gMjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGlsZS5wYXRocy5wdXNoKHRpbGUucGF0aHMuc2hpZnQoKSk7XG4gICAgICAgICAgICB0aWxlLnBhdGhzLnB1c2godGlsZS5wYXRocy5zaGlmdCgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5tZS5wbGFjZVRpbGUodGlsZSk7XG4gICAgICAgIGdhbWVSZWYuY2hpbGQoJ21vdmVzJykuJGFkZCh7XG4gICAgICAgICAgICAndHlwZSc6ICdwbGFjZVRpbGUnLFxuICAgICAgICAgICAgJ3RpbGUnOiB0aWxlXG4gICAgICAgIH0pO1xuXG4gICAgICAgICRzY29wZS5nYW1lLm1vdmVBbGxwbGF5ZXJzKCk7XG5cbiAgICAgICAgaWYgKCRzY29wZS5nYW1lLmNoZWNrT3ZlcigpKSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBuZWVkIHRvIHRlbGwgdGhlIHBsYXllciBzaGUgd29uXG4gICAgICAgICAgICAkc2NvcGUud2lubmVyID0gJHNjb3BlLmdhbWUuZ2V0Q2FuUGxheSgpWzBdO1xuICAgICAgICAgICAgJHNjb3BlLmdhbWVPdmVyID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIElmIGRlY2sgaXMgZW1wdHkgJiBubyBvbmUgaXMgZHJhZ29uLCBzZXQgbWUgYXMgZHJhZ29uXG4gICAgICAgICAgICBpZiAoJHNjb3BlLmdhbWUuZGVjay5sZW5ndGggPT09IDAgJiYgISRzY29wZS5kcmFnb24pIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZHJhZ29uID0gJHNjb3BlLm1lO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgkc2NvcGUuZ2FtZS5kZWNrLmxlbmd0aCA9PT0gMCAmJiAkc2NvcGUuZHJhZ29uKSB7XG4gICAgICAgICAgICAgICAgYXdhaXRpbmdEcmFnb25Ib2xkZXJzLnB1c2goJHNjb3BlLm1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gQ01UOiBkcmF3IG9uZSB0aWxlIGFuZCBwdXNoIGl0IHRvIHRoZSBwbGF5ZXIudGlsZXMgYXJyYXlcbiAgICAgICAgICAgICAgICAkc2NvcGUubWUudGlsZXMucHVzaCgkc2NvcGUuZ2FtZS5kZWNrLmRlYWwoMSkpO1xuICAgICAgICAgICAgICAgIC8vaWYgZGVhZCBwbGF5ZXJzLCB0aGVuIHB1c2ggdGhlaXIgY2FyZHMgYmFjayB0byB0aGUgZGVjayAmIHJlc2h1ZmZsZVxuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuZ2FtZS5kZWFkUGxheWVycygpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAvL3dpdGggbmV3IGNhcmRzICYgbmVlZCB0byByZXNodWZmbGVcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmdhbWUuZGVhZFBsYXllcnMoKS5mb3JFYWNoKGZ1bmN0aW9uIChkZWFkUGxheWVyVGlsZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlYWRQbGF5ZXJUaWxlcy5mb3JFYWNoKGZ1bmN0aW9uICh0aWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmdhbWUuZGVjay5wdXNoKHRpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZ2FtZS5kZWNrID0gJHNjb3BlLmdhbWUuZGVjay5zaHVmZmxlKCk7XG4gICAgICAgICAgICAgICAgICAgIC8vc2VuZCBmaXJlYmFzZSBhIG5ldyBtb3ZlXG4gICAgICAgICAgICAgICAgICAgIGdhbWVSZWYuY2hpbGQoJ21vdmVzJykucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAndHlwZSc6ICd1cGRhdGVEZWNrJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICd1cGRhdGVEZWNrJzogJHNjb3BlLmdhbWUuZGVja1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS5kcmFnb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kcmFnb24udGlsZXMucHVzaCgkc2NvcGUuZ2FtZS5kZWNrLmRlYWwoMSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRyYWdvbiA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL05FRUQgVE8gRElTQ1VTUzogTWlnaHQgbmVlZCB0byBtb2RpZnkgdGhpcyBpZiB3ZSB3YW50IHRvIHVzZSB1cCB0aGUgY2FyZHMgYW5kIGdpdmUgZWFjaCBhd2FpdGluZyBwbGF5ZXJzJyB1cCB0byAzIGNhcmRzXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoJHNjb3BlLmdhbWUuZGVjay5sZW5ndGggJiYgJHNjb3BlLmF3YWl0aW5nRHJhZ29uSG9sZGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuYXdhaXRpbmdEcmFnb25Ib2xkZXJzLnNoaWZ0KCkudGlsZXMucHVzaCgkc2NvcGUuZ2FtZS5kZWNrLmRlYWwoMSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuYXdhaXRpbmdEcmFnb25Ib2xkZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kcmFnb24gPSAkc2NvcGUuYXdhaXRpbmdEcmFnb25Ib2xkZXJzLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkc2NvcGUuZ2FtZS5nb1RvTmV4dFBsYXllcigpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIFRPRE86IGZpcmViYXNlIGdhbWUucGxheWVycyBzbGljZSAkc2NvcGUucGxheWVyIG91dFxuICAgICRzY29wZS5sZWF2ZUdhbWU7XG5cbiAgICAvLyBUT0RPOiBkbyB3ZSByZW1vdmUgdGhpcyBnYW1lIHJvb20ncyBtb3ZlcyBmcm9tIGZpcmViYXNlP1xuICAgICRzY29wZS5yZXNldCA9ICRzY29wZS5nYW1lLnJlc2V0O1xuXG5cbiAgICAkc2NvcGUuc3RhcnR0b3AgPSBbXG4gICAgICAgIFswLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDFdLFxuICAgICAgICBbMSwgMCwgMF0sXG4gICAgICAgIFsxLCAwLCAxXSxcbiAgICAgICAgWzIsIDAsIDBdLFxuICAgICAgICBbMiwgMCwgMV0sXG4gICAgICAgIFszLCAwLCAwXSxcbiAgICAgICAgWzMsIDAsIDFdLFxuICAgICAgICBbNCwgMCwgMF0sXG4gICAgICAgIFs0LCAwLCAxXSxcbiAgICAgICAgWzUsIDAsIDBdLFxuICAgICAgICBbNSwgMCwgMV1cbiAgICBdO1xuICAgICRzY29wZS5zdGFydGxlZnQgPSBbXG4gICAgICAgIFswLCAwLCA3XSxcbiAgICAgICAgWzAsIDAsIDZdLFxuICAgICAgICBbMCwgMSwgN10sXG4gICAgICAgIFswLCAxLCA2XSxcbiAgICAgICAgWzAsIDIsIDddLFxuICAgICAgICBbMCwgMiwgNl0sXG4gICAgICAgIFswLCAzLCA3XSxcbiAgICAgICAgWzAsIDMsIDZdLFxuICAgICAgICBbMCwgNCwgN10sXG4gICAgICAgIFswLCA0LCA2XSxcbiAgICAgICAgWzAsIDUsIDddLFxuICAgICAgICBbMCwgNSwgNl1cbiAgICBdO1xuICAgICRzY29wZS5zdGFydGJvdHRvbSA9IFtcbiAgICAgICAgWzAsIDUsIDBdLFxuICAgICAgICBbMCwgNSwgMV0sXG4gICAgICAgIFsxLCA1LCAwXSxcbiAgICAgICAgWzEsIDUsIDFdLFxuICAgICAgICBbMiwgNSwgMF0sXG4gICAgICAgIFsyLCA1LCAxXSxcbiAgICAgICAgWzMsIDUsIDBdLFxuICAgICAgICBbMywgNSwgMV0sXG4gICAgICAgIFs0LCA1LCAwXSxcbiAgICAgICAgWzQsIDUsIDFdLFxuICAgICAgICBbNSwgNSwgMF0sXG4gICAgICAgIFs1LCA1LCAxXVxuICAgIF07XG4gICAgJHNjb3BlLnN0YXJ0cmlnaHQgPSBbXG4gICAgICAgIFs1LCAwLCAyXSxcbiAgICAgICAgWzUsIDAsIDNdLFxuICAgICAgICBbNSwgMSwgMl0sXG4gICAgICAgIFs1LCAxLCAzXSxcbiAgICAgICAgWzUsIDIsIDJdLFxuICAgICAgICBbNSwgMiwgM10sXG4gICAgICAgIFs1LCAzLCAyXSxcbiAgICAgICAgWzUsIDMsIDNdLFxuICAgICAgICBbNSwgNCwgMl0sXG4gICAgICAgIFs1LCA0LCAzXSxcbiAgICAgICAgWzUsIDUsIDJdLFxuICAgICAgICBbNSwgNSwgM11cbiAgICBdO1xuXG59KTs7XG4iLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9icm93c2VyL2pzL2xvZ2luL2xvZ2luLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnbG9naW5DdHJsJ1xuICAgIH0pO1xufSk7XG5cbnRzdXJvLmNvbnRyb2xsZXIoJ2xvZ2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSwgJGZpcmViYXNlQXV0aCwgJHJvb3RTY29wZSkge1xuICAgIHZhciBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuXG4gICAgJHNjb3BlLmxvZ0luV2l0aEdvb2dsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYXV0aC4kc2lnbkluV2l0aFBvcHVwKFwiZ29vZ2xlXCIpLnRoZW4oZnVuY3Rpb24gKGF1dGhEYXRhKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkxvZ2dlZCBpbiBhczpcIiwgYXV0aERhdGEpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS5jdXJyZW50VXNlciA9IGF1dGhEYXRhO1xuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJBdXRoZW50aWNhdGlvbiBmYWlsZWQ6XCIsIGVycm9yKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHN0YXRlLmdvKCdwaWNrR2FtZScpO1xuICAgIH07XG5cbn0pO1xuIiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdnYW1lbGlzdCcsIHtcbiAgICAgICAgdXJsOiAnL2dhbWVsaXN0JyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvYnJvd3Nlci9qcy9nYW1lbGlzdC9nYW1lbGlzdC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2dhbWVMaXN0JyxcbiAgICB9KTtcbn0pO1xuXG50c3Vyby5jb250cm9sbGVyKCdnYW1lTGlzdCcsIGZ1bmN0aW9uICgkc2NvcGUsIGZpcmViYXNlVXJsLCAkZmlyZWJhc2VPYmplY3QsICRzdGF0ZSwgJGZpcmViYXNlQXV0aCwgJGZpcmViYXNlQXJyYXkpIHtcbiAgICAvL0ZvciBzeW5jaHJvbml6aW5nR2FtZUxpc3QuLi5cbiAgICB2YXIgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbiAgICB2YXIgb2JqID0gJGZpcmViYXNlT2JqZWN0KHJlZik7XG5cbiAgICB2YXIgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcbiAgICB2YXIgZmlyZWJhc2VVc2VyID0gYXV0aC4kZ2V0QXV0aCgpO1xuXG4gICAgdmFyIHN5bmNoUmVmID0gcmVmLmNoaWxkKFwiZ2FtZXNcIik7XG4gICAgdmFyIHN5bmNocm9uaXplZE9iaiA9ICRmaXJlYmFzZU9iamVjdChzeW5jaFJlZik7XG5cbiAgICAvLyBUaGlzIHJldHVybnMgYSBwcm9taXNlLi4ueW91IGNhbi50aGVuKCkgYW5kIGFzc2lnbiB2YWx1ZSB0byAkc2NvcGUudmFyaWFibGVcbiAgICAvLyBnYW1lbGlzdCBpcyB3aGF0ZXZlciB3ZSBhcmUgY2FsbGluZyBpdCBpbiB0aGUgYW5ndWxhciBodG1sLlxuICAgIHN5bmNocm9uaXplZE9iai4kYmluZFRvKCRzY29wZSwgXCJnYW1lbGlzdFwiKVxuICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZ2FtZWxpc3QgPSBbXVxuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiAkc2NvcGUuZ2FtZWxpc3QpIHtcbiAgICAgICAgICAgICAgICBnYW1lbGlzdC5wdXNoKFtpLCAkc2NvcGUuZ2FtZWxpc3RbaV1dKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJHNjb3BlLmdhbWVOYW1lcyA9IGdhbWVsaXN0LnNsaWNlKDIpO1xuICAgICAgICB9KVxuXG5cbiAgICAkc2NvcGUuam9pbiA9IGZ1bmN0aW9uIChnYW1lTmFtZSkge1xuICAgICAgICB2YXIgZ2FtZU5hbWVSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoZ2FtZU5hbWUpO1xuICAgICAgICB2YXIgcGxheWVyc1JlZiA9IGdhbWVOYW1lUmVmLmNoaWxkKCdwbGF5ZXJzJyk7XG5cbiAgICAgICAgdmFyIHBsYXllckFyciA9ICRmaXJlYmFzZUFycmF5KHBsYXllcnNSZWYpO1xuICAgICAgICBwbGF5ZXJBcnIuJGxvYWRlZCgpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocGxheWVycykge1xuICAgICAgICAgICAgICAgIGlmICghcGxheWVycy5maWx0ZXIocGxheWVyID0+IHBsYXllci51aWQgPT09IGZpcmViYXNlVXNlci51aWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdQbGF5ZXIgPSBuZXcgUGxheWVyKGZpcmViYXNlVXNlci51aWQpXG4gICAgICAgICAgICAgICAgICAgICRmaXJlYmFzZUFycmF5KHBsYXllcnNSZWYpLiRhZGQobmV3UGxheWVyKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgJHN0YXRlLmdvKCdnYW1lJywge1xuICAgICAgICAgICAgXCJnYW1lTmFtZVwiOiBnYW1lTmFtZVxuICAgICAgICB9KTtcbiAgICB9O1xufSk7XG4iLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3BpY2tHYW1lJywge1xuICAgICAgICB1cmw6ICcvcGlja2dhbWUnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9icm93c2VyL2pzL3BpY2tHYW1lL3BpY2tHYW1lLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAncGlja0dhbWVDdHJsJ1xuICAgIH0pO1xufSk7XG5cbnRzdXJvLmNvbnRyb2xsZXIoJ3BpY2tHYW1lQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSwgJGZpcmViYXNlQXJyYXksICRmaXJlYmFzZU9iamVjdCwgJGZpcmViYXNlQXV0aCkge1xuICAgIHZhciByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xuICAgIHZhciBvYmogPSAkZmlyZWJhc2VPYmplY3QocmVmKTtcblxuICAgIHZhciBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuICAgIHZhciBmaXJlYmFzZVVzZXIgPSBhdXRoLiRnZXRBdXRoKCk7XG5cbiAgICAkc2NvcGUuY3JlYXRlR2FtZSA9IGZ1bmN0aW9uIChnYW1lTmFtZSkge1xuICAgICAgICB2YXIgZ2FtZU5hbWVSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoZ2FtZU5hbWUpO1xuICAgICAgICB2YXIgcGxheWVyc1JlZiA9IGdhbWVOYW1lUmVmLmNoaWxkKCdwbGF5ZXJzJyk7XG5cbiAgICAgICAgJGZpcmViYXNlQXJyYXkoZ2FtZU5hbWVSZWYpLiRhZGQoe1xuICAgICAgICAgICAgXCJnYW1lTmFtZVwiOiBnYW1lTmFtZVxuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgbmV3UGxheWVyID0gbmV3IFBsYXllcihmaXJlYmFzZVVzZXIudWlkKVxuICAgICAgICAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKS4kYWRkKG5ld1BsYXllcilcblxuICAgICAgICBvYmouJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciB0aWxlcyA9IGRhdGEudGlsZXNcbiAgICAgICAgICAgIHZhciBkZWNrID0gbmV3IERlY2sodGlsZXMpLnNodWZmbGUoKS50aWxlcztcbiAgICAgICAgICAgIHZhciBpbml0aWFsRGVja1JlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZChnYW1lTmFtZSkuY2hpbGQoJ2luaXRpYWxEZWNrJyk7XG4gICAgICAgICAgICAkZmlyZWJhc2VBcnJheShpbml0aWFsRGVja1JlZikuJGFkZChkZWNrKTtcbiAgICAgICAgfSlcblxuXG4gICAgICAgIHZhciBpbml0aWFsTWFya2Vyc1JlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZChnYW1lTmFtZSkuY2hpbGQoJ2F2YWlsYWJsZU1hcmtlcnMnKTtcbiAgICAgICAgJGZpcmViYXNlQXJyYXkoaW5pdGlhbE1hcmtlcnNSZWYpLiRhZGQoW1wicmVkXCIsIFwib3JhbmdlXCIsIFwieWVsbG93XCIsIFwiZ3JlZW5cIiwgXCJhcXVhXCIsIFwiYmx1ZVwiLCBcIm5hdnlcIiwgXCJwdXJwbGVcIl0pO1xuXG5cbiAgICAgICAgJHN0YXRlLmdvKCdnYW1lJywge1xuICAgICAgICAgICAgXCJnYW1lTmFtZVwiOiBnYW1lTmFtZVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmdvVG9HYW1lTGlzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHN0YXRlLmdvKCdnYW1lbGlzdCcpO1xuICAgIH07XG59KTtcbiIsIid1c2Ugc3RyaWN0J1xuXG5mdW5jdGlvbiBQbGF5ZXIodWlkKSB7XG4gICAgLy8gVE9ETzogZ2V0IHVpZCBmcm9tIGZpcmViYXNlIGF1dGhcbiAgICB0aGlzLnVpZCA9IHVpZDtcblxuICAgIHRoaXMubWFya2VyID0gXCJuXCI7XG5cbiAgICAvLyBzaG91bGQgYmUgYSBQb2ludCBvYmplY3RcbiAgICB0aGlzLnBvaW50ID0gXCJuXCI7XG5cbiAgICAvLyBbeCwgeV1cbiAgICAvLyBkZXBlbmRzIG9uIHRoZSBhbmd1bGFyIFNwYWNlLngsIFNwYWNlLnlcbiAgICB0aGlzLm5leHRTcGFjZSA9IFwiblwiO1xuXG4gICAgLy8gaW4gZWFjaCBTcGFjZS5wb2ludHMgYXJyYXksIGZpbmQgdGhpcyBzcGVjaWZpYyBwb2ludCBhbmQgZ2V0IHRoZSBwb3NpdGlvbiAoaW50ZWdlcikgaW5zaWRlIHRoaXMgc3BhY2UuXG4gICAgdGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9IFwiblwiO1xuXG4gICAgLy8gbWF4aW11biAzIHRpbGVzXG4gICAgdGhpcy50aWxlcyA9ICduJztcblxuICAgIC8vIGlmIGEgcGxheWVyIGRpZXMsIGl0IHdpbGwgYmUgY2hhbmdlZCB0byBmYWxzZVxuICAgIHRoaXMuY2FuUGxheSA9IHRydWU7XG59XG5cblBsYXllci5wcm90b3R5cGUucGxhY2VNYXJrZXIgPSBmdW5jdGlvbiAoYm9hcmQsIHBvaW50KSB7XG4gICAgLy8gcG9pbnQgbG9va3MgbGlrZSBbeCwgeSwgcG9pbnRzSW5kZXhdIGluIHRoZSBzcGFjZVxuICAgIHZhciB4ID0gcG9pbnRbMF07XG4gICAgdmFyIHkgPSBwb2ludFsxXTtcbiAgICB2YXIgcG9pbnRzSW5kZXggPSBwb2ludFsyXTtcblxuICAgIHRoaXMucG9pbnQgPSBib2FyZFt5XVt4XS5wb2ludHNbcG9pbnRzSW5kZXhdO1xuICAgIHRoaXMucG9pbnQudHJhdmVsbGVkID0gdHJ1ZTtcblxuICAgIC8vW3gsIHldIGZyb20gdGhlIHBvaW50XG4gICAgdGhpcy5uZXh0U3BhY2UgPSBib2FyZFt5XVt4XTtcblxuICAgIC8vIGluIGVhY2ggU3BhY2UucG9pbnRzIGFycmF5LCBmaW5kIHRoaXMgc3BlY2lmaWMgcG9pbnQgYW5kIGdldCB0aGUgcG9zaXRpb24gKGludGVnZXIpIGluc2lkZSB0aGlzIHNwYWNlLlxuICAgIHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPSB0aGlzLm5leHRTcGFjZS5wb2ludHMuaW5kZXhPZih0aGlzLnBvaW50KTtcbn07XG5cblBsYXllci5wcm90b3R5cGUubmV3U3BhY2UgPSBmdW5jdGlvbiAoYm9hcmQsIG9sZFNwYWNlKSB7XG4gICAgaWYgKHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDAgfHwgdGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gYm9hcmRbb2xkU3BhY2UueSAtIDFdW29sZFNwYWNlLnhdO1xuICAgIH0gZWxzZSBpZiAodGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gMiB8fCB0aGlzLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSAzKSB7XG4gICAgICAgIHJldHVybiBib2FyZFtvbGRTcGFjZS55XVtvbGRTcGFjZS54ICsgMV07XG4gICAgfSBlbHNlIGlmICh0aGlzLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSA0IHx8IHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDUpIHtcbiAgICAgICAgcmV0dXJuIGJvYXJkW29sZFNwYWNlLnkgKyAxXVtvbGRTcGFjZS54XTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYm9hcmRbb2xkU3BhY2UueV1bb2xkU3BhY2UueCAtIDFdO1xuICAgIH1cbn07XG5cblBsYXllci5wcm90b3R5cGUucGxhY2VUaWxlID0gZnVuY3Rpb24gKHRpbGUpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLnRpbGVzLmluZGV4T2YodGlsZSk7XG4gICAgdGhpcy50aWxlcy5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgdGhpcy5uZXh0U3BhY2UudGlsZVVybCA9IHRpbGUuaW1hZ2VVcmw7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRpbGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5uZXh0U3BhY2UucG9pbnRzW2ldLm5laWdoYm9ycy5wdXNoKHRoaXMubmV4dFNwYWNlLnBvaW50c1t0aWxlW2ldXSk7XG4gICAgfVxufTtcblxuUGxheWVyLnByb3RvdHlwZS5tb3ZlVG8gPSBmdW5jdGlvbiAocG9pbnRlcikge1xuICAgIC8vIGxldCBwb2ludGVyID0gcG9pbnRlcjtcblxuICAgIC8vYWx3YXlzIGJlIHJldHVybmluZyAwIG9yIDEgcG9pbnQgaW4gdGhlIGFycmF5XG4gICAgbGV0IG5leHRQb2ludCA9IHBvaW50ZXIubmVpZ2hib3JzLmZpbHRlcihmdW5jdGlvbiAobmVpZ2hib3IpIHtcbiAgICAgICAgcmV0dXJuICFuZWlnaGJvci50cmF2ZWxsZWQ7XG4gICAgfSlbMF07XG5cbiAgICByZXR1cm4gbmV4dFBvaW50O1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5rZWVwTW92aW5nID0gZnVuY3Rpb24gKCkge1xuICAgIGxldCBtb3ZhYmxlID0gdGhpcy5tb3ZlVG8odGhpcy5wb2ludCk7XG4gICAgd2hpbGUgKG1vdmFibGUpIHtcbiAgICAgICAgdGhpcy5wb2ludC50cmF2ZWxsZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnBvaW50ID0gdGhpcy5tb3ZlVG8odGhpcy5wb2ludCk7XG4gICAgICAgIGxldCBvbGRTcGFjZSA9IHRoaXMubmV4dFNwYWNlO1xuICAgICAgICBsZXQgbmV3U3BhY2UgPSBuZXdTcGFjZShvbGRTcGFjZSk7XG4gICAgICAgIHRoaXMubmV4dFNwYWNlID0gbmV3U3BhY2U7XG5cbiAgICAgICAgdGhpcy5jaGVja0RlYXRoKCk7XG4gICAgICAgIG1vdmFibGUgPSB0aGlzLm1vdmVUbyh0aGlzLnBvaW50KTtcbiAgICB9XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLmNoZWNrRGVhdGggPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFsbFRyYXZlbGxlZCA9IHRoaXMucG9pbnQubmVpZ2hib3JzLmZpbHRlcihmdW5jdGlvbiAobmVpZ2hib3IpIHtcbiAgICAgICAgcmV0dXJuIG5laWdoYm9yLnRyYXZlbGxlZDtcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLnBvaW50LmVkZ2UgfHwgYWxsVHJhdmVsbGVkLmxlbmd0aCA9PT0gMikgdGhpcy5kaWUoKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUuZGllID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY2FuUGxheSA9IGZhbHNlO1xuICAgIC8vIFRPRE86IG5lZWQgdG8gc2VuZCBhbiBhbGVydCBvciBtZXNzYWdlIHRvIHRoZSBwbGF5ZXIgd2hvIGp1c3QgZGllZC5cbn07XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
