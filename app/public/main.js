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

    firebase.auth().onAuthStateChanged(function (user) {
        var firebasePlayersArr = $firebaseArray(playersRef);
        firebasePlayersArr.$loaded().then(function (data) {
            var FBplayers = data;
            console.log("players", FBplayers);
            if (user) {
                var userAuthId = user.uid;
                var me = $scope.FBplayers.filter(function (player) {
                    return player.uid === userAuthId;
                })[0];
                console.log("me idx", FBplayers.indexOf(me));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImdhbWUvYm9hcmQuanMiLCJnYW1lL2RlY2suanMiLCJnYW1lL2dhbWUuY29udHJ1Y3Rvci5qcyIsImdhbWUvZ2FtZS5qcyIsImdhbWVsaXN0L2dhbWVsaXN0LmpzIiwibG9naW4vbG9naW4uanMiLCJwbGF5ZXIvcGxheWVyLmpzIiwicGlja0dhbWUvcGlja0dhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBQSxRQUFBLFFBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTs7QUFFQSxNQUFBLE1BQUEsQ0FBQSxZQUFBO0FBQ0EsUUFBQSxTQUFBO0FBQ0EsZ0JBQUEseUNBREE7QUFFQSxvQkFBQSxzQ0FGQTtBQUdBLHFCQUFBLDZDQUhBO0FBSUEsdUJBQUE7QUFKQSxLQUFBO0FBTUEsYUFBQSxhQUFBLENBQUEsTUFBQTtBQUNBLENBUkE7O0FBVUEsTUFBQSxRQUFBLENBQUEsYUFBQSxFQUFBLDRDQUFBOztBQUVBLE1BQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQTtBQUNBLHVCQUFBLFNBQUEsQ0FBQSxHQUFBO0FBQ0EsQ0FGQTs7QUNkQSxTQUFBLEtBQUEsR0FBQTtBQUNBLFNBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQTs7QUFFQSxNQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBO0FBQ0E7QUFDQSxXQUFBLEtBQUEsS0FBQTtBQUNBLENBUkE7O0FBVUEsU0FBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEVBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLFNBQUEsS0FBQSxHQUFBLElBQUE7QUFDQSxTQUFBLE1BQUEsR0FBQSxDQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBQUE7QUFDQSxTQUFBLE9BQUE7QUFDQSxTQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxzQkFBQTs7QUFFQSxZQUFBLElBQUEsQ0FBQSxFQUFBOztBQUNBLDRCQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLEM7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FDQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsTUFBQSxJQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLFNBSkEsTUFJQSxJQUFBLElBQUEsQ0FBQSxFQUFBOztBQUNBLGdCQUFBLE1BQUEsQ0FBQSxFQUFBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxLQUNBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxTQUhBLE1BR0EsSUFBQSxJQUFBLENBQUEsRUFBQTs7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FDQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsU0FIQSxNQUdBOztBQUNBLDRCQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLEM7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FDQTtBQUNBLHFCQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsTUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFJQSxTQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxTQUFBLElBQUEsR0FBQSxJQUFBO0FBQ0EsU0FBQSxTQUFBLEdBQUEsRUFBQTtBQUNBLFNBQUEsU0FBQSxHQUFBLEtBQUE7QUFDQTs7QUNqREE7O0lBRUEsSTtBQUNBLGtCQUFBLEtBQUEsRUFBQTtBQUFBOztBQUNBLGFBQUEsS0FBQSxHQUFBLEtBQUE7QUFDQTs7OztrQ0FFQTtBQUNBLGlCQUFBLEtBQUEsR0FBQSxFQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBLG1CQUFBLElBQUE7QUFDQTs7O29DQUVBO0FBQ0EsbUJBQUEsS0FBQSxLQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7QUFDQTs7OzZCQUVBLEcsRUFBQTtBQUNBLG1CQUFBLEtBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxDQUFBO0FBQ0E7OzsrQkFFQSxLLEVBQUE7QUFDQSxpQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLEtBQUE7QUFDQSxtQkFBQSxJQUFBO0FBQ0E7Ozs7OztBQ3ZCQTs7OztJQUlBLEk7QUFDQSxrQkFBQSxJQUFBLEVBQUE7QUFBQTs7QUFDQSxhQUFBLElBQUEsR0FBQSxJQUFBO0FBQ0EsYUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsS0FBQSxHQUFBLElBQUEsS0FBQSxHQUFBLFNBQUEsRUFBQTtBQUNBLGFBQUEsT0FBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLGdCQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsUUFBQSxFQUFBLFFBQUEsRUFBQSxPQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsUUFBQSxDQUFBOztBQUVBLGFBQUEsVUFBQSxDO0FBQ0EsYUFBQSxjQUFBLEdBQUEsRUFBQSxDO0FBQ0EsYUFBQSxNQUFBLEdBQUEsRUFBQSxDO0FBQ0EsYUFBQSxLQUFBO0FBQ0E7Ozs7MkNBRUE7QUFDQSxnQkFBQSxLQUFBLFVBQUEsS0FBQSxDQUFBLENBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsY0FBQSxDQUFBLEtBQUEsVUFBQSxDQUFBO0FBQ0E7Ozt5Q0FFQTtBQUNBLGlCQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxNQUFBO0FBQUEsdUJBQUEsT0FBQSxVQUFBLEVBQUE7QUFBQSxhQUFBO0FBQ0E7OztzQ0FDQTtBQUNBLGdCQUFBLG1CQUFBLEVBQUE7QUFDQSxpQkFBQSxPQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0Esb0JBQUEsQ0FBQSxPQUFBLE9BQUEsSUFBQSxPQUFBLEtBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EscUNBQUEsSUFBQSxDQUFBLE9BQUEsS0FBQTtBQUNBLG1DQUFBLElBQUE7QUFDQTtBQUNBLGFBTEE7QUFNQSxtQkFBQSxnQkFBQTtBQUNBOzs7b0NBRUE7QUFDQSxtQkFBQSxhQUFBLE1BQUEsSUFBQSxDQUFBO0FBQ0E7Ozs7Ozt5Q0FHQTtBQUNBLGdCQUFBLFdBQUEsS0FBQSxjQUFBLEVBQUEsTUFBQSxHQUFBLENBQUEsRUFBQTtBQUNBLG9CQUFBLFNBQUEsS0FBQSxVQUFBLEdBQUEsQ0FBQTtBQUNBLHVCQUFBLENBQUEsS0FBQSxjQUFBLENBQUEsU0FBQSxDQUFBLEVBQUEsT0FBQSxFQUFBO0FBQ0E7QUFDQTtBQUNBLHFCQUFBLFVBQUEsR0FBQSxNQUFBO0FBQ0EsYUFOQSxNQU1BO0FBQ0Es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QUFDQSxnQkFBQSxHQUFBLENBQUEsaUJBQUE7QUFDQSxhQUFBLFFBQUE7QUFDQSxZQUFBLEtBQUEsUUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLFFBQUEsR0FBQSxDQUFBO0FBQ0EsS0FKQTs7QUFNQSxXQUFBLGFBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsUUFBQTtBQUNBLFlBQUEsS0FBQSxRQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxRQUFBLEdBQUEsQ0FBQTtBQUNBLEtBSEE7Ozs7QUFPQSxXQUFBLFNBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTs7QUFFQSxZQUFBLEtBQUEsUUFBQSxHQUFBLENBQUEsRUFBQTtBQUNBLGlCQUFBLEtBQUEsR0FBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxVQUFBLEVBQUE7QUFDQSx1QkFBQSxhQUFBLENBQUE7QUFDQSxhQUZBLENBQUE7QUFHQSxpQkFBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGlCQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsU0FOQSxNQU1BLElBQUEsS0FBQSxRQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxHQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQTtBQUNBLHVCQUFBLGFBQUEsQ0FBQTtBQUNBLGFBRkEsQ0FBQTtBQUdBLGlCQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQTs7QUFFQSxlQUFBLEVBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQTtBQUNBLGdCQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsSUFBQSxDQUFBO0FBQ0Esb0JBQUEsV0FEQTtBQUVBLG9CQUFBO0FBRkEsU0FBQTs7QUFLQSxlQUFBLElBQUEsQ0FBQSxjQUFBOztBQUVBLFlBQUEsT0FBQSxJQUFBLENBQUEsU0FBQSxFQUFBLEVBQUE7O0FBRUEsbUJBQUEsTUFBQSxHQUFBLE9BQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxtQkFBQSxRQUFBLEdBQUEsSUFBQTtBQUNBLFNBSkEsTUFJQTs7QUFFQSxnQkFBQSxPQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsTUFBQSxFQUFBO0FBQ0EsdUJBQUEsTUFBQSxHQUFBLE9BQUEsRUFBQTtBQUNBLGFBRkEsTUFFQSxJQUFBLE9BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLEtBQUEsQ0FBQSxJQUFBLE9BQUEsTUFBQSxFQUFBO0FBQ0Esc0NBQUEsSUFBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLGFBRkEsTUFFQTs7QUFFQSx1QkFBQSxFQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSxvQkFBQSxPQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsTUFBQSxFQUFBOztBQUVBLDJCQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsT0FBQSxDQUFBLFVBQUEsZUFBQSxFQUFBO0FBQ0Esd0NBQUEsT0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsbUNBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQTtBQUNBLHlCQUZBO0FBR0EscUJBSkE7QUFLQSwyQkFBQSxJQUFBLENBQUEsSUFBQSxHQUFBLE9BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEVBQUE7O0FBRUEsNEJBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxJQUFBLENBQUE7QUFDQSxnQ0FBQSxZQURBO0FBRUEsc0NBQUEsT0FBQSxJQUFBLENBQUE7QUFGQSxxQkFBQTtBQUlBLHdCQUFBLE9BQUEsTUFBQSxFQUFBO0FBQ0EsK0JBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSwrQkFBQSxNQUFBLEdBQUEsSUFBQTs7QUFFQSwrQkFBQSxPQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxJQUFBLE9BQUEscUJBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxtQ0FBQSxxQkFBQSxDQUFBLEtBQUEsR0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQSw0QkFBQSxPQUFBLHFCQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsbUNBQUEsTUFBQSxHQUFBLE9BQUEscUJBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBLG1CQUFBLElBQUEsQ0FBQSxjQUFBO0FBQ0E7QUFDQSxLQW5FQTs7O0FBc0VBLFdBQUEsU0FBQTs7O0FBR0EsV0FBQSxLQUFBLEdBQUEsT0FBQSxJQUFBLENBQUEsS0FBQTs7QUFHQSxXQUFBLFFBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBLEVBR0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQSxFQUlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSkEsRUFLQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUxBLEVBTUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FOQSxFQU9BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUEEsRUFRQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVJBLEVBU0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FUQSxFQVVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVkEsRUFXQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVhBLEVBWUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FaQSxDQUFBO0FBY0EsV0FBQSxTQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQURBLEVBRUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQSxFQUdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEEsRUFJQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUpBLEVBS0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FMQSxFQU1BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTkEsRUFPQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVBBLEVBUUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FSQSxFQVNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVEEsRUFVQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVZBLEVBV0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FYQSxFQVlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWkEsQ0FBQTtBQWNBLFdBQUEsV0FBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBLEVBSUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FKQSxFQUtBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQU5BLEVBT0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FQQSxFQVFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUkEsRUFTQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVRBLEVBVUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FWQSxFQVdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWEEsRUFZQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVpBLENBQUE7QUFjQSxXQUFBLFVBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBLEVBR0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQSxFQUlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSkEsRUFLQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUxBLEVBTUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FOQSxFQU9BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUEEsRUFRQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVJBLEVBU0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FUQSxFQVVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVkEsRUFXQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVhBLEVBWUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FaQSxDQUFBO0FBZUEsQ0FoU0EsRUFnU0E7O0FDeFNBLE1BQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLGFBQUEsV0FEQTtBQUVBLHFCQUFBLG9DQUZBO0FBR0Esb0JBQUE7QUFIQSxLQUFBO0FBS0EsQ0FOQTs7QUFRQSxNQUFBLFVBQUEsQ0FBQSxVQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBLGVBQUEsRUFBQSxNQUFBLEVBQUEsYUFBQSxFQUFBLGNBQUEsRUFBQTs7QUFFQSxRQUFBLE1BQUEsU0FBQSxRQUFBLEdBQUEsR0FBQSxFQUFBO0FBQ0EsUUFBQSxNQUFBLGdCQUFBLEdBQUEsQ0FBQTs7QUFFQSxRQUFBLE9BQUEsZUFBQTtBQUNBLFFBQUEsZUFBQSxLQUFBLFFBQUEsRUFBQTs7QUFFQSxRQUFBLFdBQUEsSUFBQSxLQUFBLENBQUEsT0FBQSxDQUFBO0FBQ0EsUUFBQSxrQkFBQSxnQkFBQSxRQUFBLENBQUE7Ozs7QUFJQSxvQkFBQSxPQUFBLENBQUEsTUFBQSxFQUFBLFVBQUEsRUFDQSxJQURBLENBQ0EsWUFBQTtBQUNBLFlBQUEsV0FBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsSUFBQSxPQUFBLFFBQUEsRUFBQTtBQUNBLHFCQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxPQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBO0FBQ0EsZUFBQSxTQUFBLEdBQUEsU0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsS0FQQTs7QUFVQSxXQUFBLElBQUEsR0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLFlBQUEsY0FBQSxJQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsS0FBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLFlBQUEsYUFBQSxZQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUE7O0FBRUEsWUFBQSxZQUFBLGVBQUEsVUFBQSxDQUFBO0FBQ0Esa0JBQUEsT0FBQSxHQUNBLElBREEsQ0FDQSxVQUFBLE9BQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsUUFBQSxNQUFBLENBQUE7QUFBQSx1QkFBQSxPQUFBLEdBQUEsS0FBQSxhQUFBLEdBQUE7QUFBQSxhQUFBLENBQUEsRUFBQTtBQUNBLG9CQUFBLFlBQUEsSUFBQSxNQUFBLENBQUEsYUFBQSxHQUFBLENBQUE7QUFDQSwrQkFBQSxVQUFBLEVBQUEsSUFBQSxDQUFBLFNBQUE7QUFDQTtBQUNBLFNBTkE7O0FBUUEsZUFBQSxFQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0Esd0JBQUE7QUFEQSxTQUFBO0FBR0EsS0FoQkE7QUFpQkEsQ0F4Q0E7O0FDUkEsTUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsYUFBQSxRQURBO0FBRUEscUJBQUEsOEJBRkE7QUFHQSxvQkFBQTtBQUhBLEtBQUE7QUFLQSxDQU5BOztBQVFBLE1BQUEsVUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsYUFBQSxFQUFBLFVBQUEsRUFBQTtBQUNBLFFBQUEsT0FBQSxlQUFBOztBQUVBLFdBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxhQUFBLGdCQUFBLENBQUEsUUFBQSxFQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLG9CQUFBLEdBQUEsQ0FBQSxlQUFBLEVBQUEsUUFBQTtBQUNBLHVCQUFBLFdBQUEsR0FBQSxRQUFBO0FBQ0EsU0FIQSxFQUdBLEtBSEEsQ0FHQSxVQUFBLEtBQUEsRUFBQTtBQUNBLG9CQUFBLEtBQUEsQ0FBQSx3QkFBQSxFQUFBLEtBQUE7QUFDQSxTQUxBOztBQU9BLGVBQUEsRUFBQSxDQUFBLFVBQUE7QUFDQSxLQVRBO0FBV0EsQ0FkQTs7QUNSQTs7QUFFQSxTQUFBLE1BQUEsQ0FBQSxHQUFBLEVBQUE7O0FBRUEsU0FBQSxHQUFBLEdBQUEsR0FBQTs7QUFFQSxTQUFBLE1BQUEsR0FBQSxHQUFBOzs7QUFHQSxTQUFBLEtBQUEsR0FBQSxHQUFBOzs7O0FBSUEsU0FBQSxTQUFBLEdBQUEsR0FBQTs7O0FBR0EsU0FBQSxvQkFBQSxHQUFBLEdBQUE7OztBQUdBLFNBQUEsS0FBQSxHQUFBLEdBQUE7OztBQUdBLFNBQUEsT0FBQSxHQUFBLElBQUE7QUFDQTs7QUFFQSxPQUFBLFNBQUEsQ0FBQSxXQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBOztBQUVBLFFBQUEsSUFBQSxNQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsSUFBQSxNQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsY0FBQSxNQUFBLENBQUEsQ0FBQTs7QUFFQSxTQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLFNBQUEsS0FBQSxDQUFBLFNBQUEsR0FBQSxJQUFBOzs7QUFHQSxTQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7OztBQUdBLFNBQUEsb0JBQUEsR0FBQSxLQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsS0FBQSxDQUFBO0FBQ0EsQ0FkQTs7QUFnQkEsT0FBQSxTQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQTtBQUNBLFFBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxFQUFBO0FBQ0EsZUFBQSxNQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtBQUNBLEtBRkEsTUFFQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsRUFBQTtBQUNBLGVBQUEsTUFBQSxTQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxLQUZBLE1BRUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLEVBQUE7QUFDQSxlQUFBLE1BQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQ0EsS0FGQSxNQUVBO0FBQ0EsZUFBQSxNQUFBLFNBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBO0FBQ0EsQ0FWQTs7QUFZQSxPQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxRQUFBLFFBQUEsS0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTs7QUFFQSxTQUFBLFNBQUEsQ0FBQSxPQUFBLEdBQUEsS0FBQSxRQUFBOztBQUVBLFNBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxJQUFBLEtBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBO0FBQ0EsQ0FUQTs7QUFXQSxPQUFBLFNBQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUE7Ozs7QUFJQSxRQUFBLFlBQUEsUUFBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsZUFBQSxDQUFBLFNBQUEsU0FBQTtBQUNBLEtBRkEsRUFFQSxDQUZBLENBQUE7O0FBSUEsV0FBQSxTQUFBO0FBQ0EsQ0FUQTs7QUFXQSxPQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsVUFBQSxLQUFBLE1BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsT0FBQSxFQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUEsU0FBQSxHQUFBLElBQUE7QUFDQSxhQUFBLEtBQUEsR0FBQSxLQUFBLE1BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsV0FBQSxLQUFBLFNBQUE7QUFDQSxZQUFBLFdBQUEsU0FBQSxRQUFBLENBQUE7QUFDQSxhQUFBLFNBQUEsR0FBQSxRQUFBOztBQUVBLGFBQUEsVUFBQTtBQUNBLGtCQUFBLEtBQUEsTUFBQSxDQUFBLEtBQUEsS0FBQSxDQUFBO0FBQ0E7QUFDQSxDQVpBOztBQWNBLE9BQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxlQUFBLEtBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxlQUFBLFNBQUEsU0FBQTtBQUNBLEtBRkEsQ0FBQTs7QUFJQSxRQUFBLEtBQUEsS0FBQSxDQUFBLElBQUEsSUFBQSxhQUFBLE1BQUEsS0FBQSxDQUFBLEVBQUEsS0FBQSxHQUFBO0FBQ0EsQ0FOQTs7QUFRQSxPQUFBLFNBQUEsQ0FBQSxHQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsT0FBQSxHQUFBLEtBQUE7O0FBRUEsQ0FIQTs7QUNqR0EsTUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsYUFBQSxXQURBO0FBRUEscUJBQUEsb0NBRkE7QUFHQSxvQkFBQTtBQUhBLEtBQUE7QUFLQSxDQU5BOztBQVFBLE1BQUEsVUFBQSxDQUFBLGNBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsY0FBQSxFQUFBLGVBQUEsRUFBQSxhQUFBLEVBQUE7QUFDQSxRQUFBLE1BQUEsU0FBQSxRQUFBLEdBQUEsR0FBQSxFQUFBO0FBQ0EsUUFBQSxNQUFBLGdCQUFBLEdBQUEsQ0FBQTs7QUFFQSxRQUFBLE9BQUEsZUFBQTtBQUNBLFFBQUEsZUFBQSxLQUFBLFFBQUEsRUFBQTs7QUFFQSxXQUFBLFVBQUEsR0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLFlBQUEsY0FBQSxJQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsS0FBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLFlBQUEsYUFBQSxZQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUE7O0FBRUEsdUJBQUEsV0FBQSxFQUFBLElBQUEsQ0FBQTtBQUNBLHdCQUFBO0FBREEsU0FBQTs7QUFJQSxZQUFBLFlBQUEsSUFBQSxNQUFBLENBQUEsYUFBQSxHQUFBLENBQUE7QUFDQSx1QkFBQSxVQUFBLEVBQUEsSUFBQSxDQUFBLFNBQUE7O0FBRUEsWUFBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsUUFBQSxLQUFBLEtBQUE7QUFDQSxnQkFBQSxPQUFBLElBQUEsSUFBQSxDQUFBLEtBQUEsRUFBQSxPQUFBLEdBQUEsS0FBQTtBQUNBLGdCQUFBLGlCQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxLQUFBLENBQUEsUUFBQSxFQUFBLEtBQUEsQ0FBQSxhQUFBLENBQUE7QUFDQSwyQkFBQSxjQUFBLEVBQUEsSUFBQSxDQUFBLElBQUE7QUFDQSxTQUxBOztBQVFBLFlBQUEsb0JBQUEsSUFBQSxLQUFBLENBQUEsT0FBQSxFQUFBLEtBQUEsQ0FBQSxRQUFBLEVBQUEsS0FBQSxDQUFBLGtCQUFBLENBQUE7QUFDQSx1QkFBQSxpQkFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsUUFBQSxFQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxRQUFBLENBQUE7O0FBR0EsZUFBQSxFQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0Esd0JBQUE7QUFEQSxTQUFBO0FBR0EsS0ExQkE7O0FBNEJBLFdBQUEsWUFBQSxHQUFBLFlBQUE7QUFDQSxlQUFBLEVBQUEsQ0FBQSxVQUFBO0FBQ0EsS0FGQTtBQUdBLENBdENBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgdHN1cm8gPSBhbmd1bGFyLm1vZHVsZSgnVHN1cm8nLCBbJ3VpLnJvdXRlcicsICdmaXJlYmFzZSddKTtcblxudHN1cm8uY29uZmlnKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0ge1xuICAgICAgICBhcGlLZXk6IFwiQUl6YVN5Q0xtM2prazVwcE1xZVF4S29ILWRaOUNkWU1hREdXV3FVXCIsXG4gICAgICAgIGF1dGhEb21haW46IFwidGhlLXBhdGhzLW9mLWRyYWdvbnMuZmlyZWJhc2VhcHAuY29tXCIsXG4gICAgICAgIGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vdGhlLXBhdGhzLW9mLWRyYWdvbnMuZmlyZWJhc2Vpby5jb21cIixcbiAgICAgICAgc3RvcmFnZUJ1Y2tldDogXCJ0aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbVwiLFxuICAgIH07XG4gICAgZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChjb25maWcpO1xufSk7XG5cbnRzdXJvLmNvbnN0YW50KCdmaXJlYmFzZVVybCcsICdodHRwczovL3BhdGgtb2YtdGhlLWRyYWdvbi5maXJlYmFzZWlvLmNvbS8nKTtcblxudHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG59KTtcbiIsImZ1bmN0aW9uIEJvYXJkKCkge1xuICAgIHRoaXMuYm9hcmQgPSBbXTtcbn1cblxuQm9hcmQucHJvdG90eXBlLmRyYXdCb2FyZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IDY7IHkrKykge1xuICAgICAgICBpZiAoIXRoaXMuYm9hcmRbeV0pIHRoaXMuYm9hcmRbeV0gPSBbXTtcbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCA2OyB4KyspIHtcbiAgICAgICAgICAgIHRoaXMuYm9hcmRbeV0ucHVzaChuZXcgU3BhY2UoeCwgeSwgdGhpcy5ib2FyZCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmJvYXJkO1xufVxuXG5mdW5jdGlvbiBTcGFjZSh4LCB5LCBib2FyZCkge1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbiAgICB0aGlzLmltYWdlID0gbnVsbDtcbiAgICB0aGlzLnBvaW50cyA9IFtudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsXTtcbiAgICB0aGlzLnRpbGVVcmw7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgICAgbGV0IGNvcnJlc3BvbmRpbmc7XG5cbiAgICAgICAgaWYgKGkgPCAyKSB7IC8vdG9wXG4gICAgICAgICAgICBjb3JyZXNwb25kaW5nID0gaSA9PT0gMCA/IDUgOiA0OyAvLyAwIC0+IDUgJiAxIC0+IDRcbiAgICAgICAgICAgIGlmICh5ID09PSAwKSB0aGlzLnBvaW50c1tpXSA9IG5ldyBQb2ludCh0cnVlKTtcbiAgICAgICAgICAgIGVsc2UgdGhpcy5wb2ludHNbaV0gPSBib2FyZFt5IC0gMV1beF0ucG9pbnRzW2NvcnJlc3BvbmRpbmddO1xuICAgICAgICB9IGVsc2UgaWYgKGkgPCA0KSB7IC8vcmlnaHRcbiAgICAgICAgICAgIGlmICh4ID09PSA1KSB0aGlzLnBvaW50c1tpXSA9IG5ldyBQb2ludCh0cnVlKTtcbiAgICAgICAgICAgIGVsc2UgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQoZmFsc2UpO1xuICAgICAgICB9IGVsc2UgaWYgKGkgPCA2KSB7IC8vYm90dG9tXG4gICAgICAgICAgICBpZiAoeSA9PT0gNSkgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQodHJ1ZSk7XG4gICAgICAgICAgICBlbHNlIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHsgLy9sZWZ0XG4gICAgICAgICAgICBjb3JyZXNwb25kaW5nID0gaSA9PT0gNiA/IDMgOiAyOyAvLyA2IC0+IDMgJiA3IC0+IDJcbiAgICAgICAgICAgIGlmICh4ID09PSAwKSB0aGlzLnBvaW50c1tpXSA9IG5ldyBQb2ludCh0cnVlKTtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucG9pbnRzW2ldID0gYm9hcmRbeV1beCAtIDFdLnBvaW50c1tjb3JyZXNwb25kaW5nXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG4vLyBlZGdlID0gYm9vbGVhblxuZnVuY3Rpb24gUG9pbnQoZWRnZSkge1xuICAgIHRoaXMuZWRnZSA9IGVkZ2U7XG4gICAgdGhpcy5uZWlnaGJvcnMgPSBbXTtcbiAgICB0aGlzLnRyYXZlbGxlZCA9IGZhbHNlO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jbGFzcyBEZWNrIHtcbiAgICBjb25zdHJ1Y3Rvcih0aWxlcykge1xuICAgICAgICB0aGlzLnRpbGVzID0gdGlsZXNcbiAgICB9XG5cbiAgICBzaHVmZmxlKCkge1xuICAgICAgICB0aGlzLnRpbGVzID0gXy5zaHVmZmxlKHRoaXMudGlsZXMpXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGRlYWxUaHJlZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZXMuc3BsaWNlKDAsIDMpO1xuICAgIH1cblxuICAgIGRlYWwobnVtKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGVzLnNwbGljZSgwLCBudW0pO1xuICAgIH1cblxuICAgIHJlbG9hZCh0aWxlcykge1xuICAgICAgICB0aGlzLnRpbGVzLnB1c2godGlsZXMpXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vL0dBTUUvLy9cblxuY2xhc3MgR2FtZSB7XG4gICAgY29uc3RydWN0b3IobmFtZSkge1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLmNvdW50ID0gMzU7XG4gICAgICAgIHRoaXMuYm9hcmQgPSBuZXcgQm9hcmQoKS5kcmF3Qm9hcmQoKTtcbiAgICAgICAgdGhpcy5wbGF5ZXJzID0gW107XG4gICAgICAgIHRoaXMuYXZhaWxhYmxlTWFya2VycyA9IFtcInJlZFwiLCBcIm9yYW5nZVwiLCBcInllbGxvd1wiLCBcImdyZWVuXCIsIFwiYXF1YVwiLCBcImJsdWVcIiwgXCJuYXZ5XCIsIFwicHVycGxlXCJdXG5cbiAgICAgICAgdGhpcy5jdXJyUGxheWVyOyAvL2luZGV4IG9mIHRoZSBjdXJyZW50UGxheWVyIGluIHRoZSB0dXJuT3JkZXJBcnJheVxuICAgICAgICB0aGlzLnR1cm5PcmRlckFycmF5ID0gW10gLy9ob2xkcyBhbGwgdGhlIHBsYXllcnMgc3RpbGwgb24gdGhlIGJvYXJkLlxuICAgICAgICB0aGlzLmRyYWdvbiA9IFwiXCI7IC8vIFBsYXllci5NYXJrZXJcbiAgICAgICAgdGhpcy5tb3ZlcztcbiAgICB9XG5cbiAgICBnZXRDdXJyZW50UGxheWVyKCkge1xuICAgICAgICBpZiAodGhpcy5jdXJyUGxheWVyID09PSAtMSkgcmV0dXJuO1xuICAgICAgICByZXR1cm4gdGhpcy50dXJuT3JkZXJBcnJheVt0aGlzLmN1cnJQbGF5ZXJdO1xuICAgIH07XG5cbiAgICBtb3ZlQWxsUGxheWVycygpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLmZvckVhY2goKHBsYXllcikgPT4gcGxheWVyLmtlZXBNb3ZpbmcoKSlcbiAgICB9O1xuICAgIGRlYWRQbGF5ZXJzKCkge1xuICAgICAgICB2YXIgZGVhZFBsYXllcnNUaWxlcyA9IFtdO1xuICAgICAgICB0aGlzLnBsYXllcnMuZm9yRWFjaChmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAgICAgICBpZiAoIXBsYXllci5jYW5QbGF5ICYmIHBsYXllci50aWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgZGVhZFBsYXllcnNUaWxlcy5wdXNoKHBsYXllci50aWxlcyk7XG4gICAgICAgICAgICAgICAgaXNEZWFkUGxheWVyID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkZWFkUGxheWVyc1RpbGVzO1xuICAgIH07XG5cbiAgICBjaGVja092ZXIoKSB7XG4gICAgICAgIHJldHVybiBnZXRDYW5QbGF5KCkubGVuZ3RoIDw9IDE7XG4gICAgfVxuXG4gICAgLy90byBiZSBjYWxsZWQgYXQgdGhlIGVuZCBvZiBhIHR1cm4gdG8gc2V0IHRoZSBjdXJyUGxheWVyIHRvIHRoZSBuZXh0IGVsaWdpYmxlIHBsYXllciBpbiB0aGUgdHVybk9yZGVyQXJyYXlcbiAgICBnb1RvTmV4dFBsYXllcigpIHtcbiAgICAgICAgaWYgKGdldENhblBsYXkodGhpcy50dXJuT3JkZXJBcnJheSkubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgbGV0IG5ld0lkeCA9IHRoaXMuY3VyclBsYXllciArIDE7XG4gICAgICAgICAgICB3aGlsZSAoIXRoaXMudHVybk9yZGVyQXJyYXlbbmV3SWR4ICUgOF0uY2FuUGxheSkge1xuICAgICAgICAgICAgICAgIG5ld0lkeCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdXJyUGxheWVyID0gbmV3SWR4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jdXJyUGxheWVyID0gLTE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q3VycmVudFBsYXllcigpO1xuICAgIH07XG5cbiAgICAvL3Jlc3RhcnQgdGhlIGdhbWVcbiAgICByZXNldCgpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgICAgIC8vcmV0cmlldmUgYWxsIHRpbGVzXG4gICAgICAgICAgICAvL3JldHVybiBwbGF5ZXIncyB0aWxlcyB0byB0aGUgZGVjayBhbmQgc2h1ZmZsZVxuICAgICAgICAgICAgdGhpcy5kZWNrLnJlbG9hZChwbGF5ZXIudGlsZXMpLnNodWZmbGUoKTtcbiAgICAgICAgICAgIHBsYXllci50aWxlcyA9IFtdO1xuICAgICAgICAgICAgLy9yZXNldCBhbGwgcGxheWVycyBwbGF5YWJpbGl0eVxuICAgICAgICAgICAgcGxheWVyLmNhblBsYXkgPSB0cnVlO1xuICAgICAgICB9KVxuICAgIH07XG5cbn1cblxuLy8vLy9FTkQgT0YgR0FNRSBDTEFTUy8vLy8vXG5cbi8vZ2V0IEVsaWdpYmxlIHBsYXllcnNcbmxldCBnZXRDYW5QbGF5ID0gZnVuY3Rpb24gKHBsYXllcnMpIHtcbiAgICByZXR1cm4gcGxheWVycy5maWx0ZXIoKHBsYXllcikgPT4ge1xuICAgICAgICByZXR1cm4gcGxheWVyLmNhblBsYXlcbiAgICB9KVxufVxuIiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdnYW1lJywge1xuICAgICAgICB1cmw6ICcvZ2FtZS86Z2FtZU5hbWUnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9icm93c2VyL2pzL2dhbWUvZ2FtZS5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2dhbWVDdHJsJ1xuICAgIH0pO1xufSk7XG5cbnRzdXJvLmNvbnRyb2xsZXIoJ2dhbWVDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgJGZpcmViYXNlQXV0aCwgZmlyZWJhc2VVcmwsICRzdGF0ZVBhcmFtcywgJGZpcmViYXNlT2JqZWN0LCAkZmlyZWJhc2VBcnJheSkge1xuICAgIHZhciByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xuICAgIHZhciBvYmogPSAkZmlyZWJhc2VPYmplY3QocmVmKTtcblxuICAgIHZhciBnYW1lUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKCRzdGF0ZVBhcmFtcy5nYW1lTmFtZSk7XG4gICAgdmFyIGRlY2tSZWYgPSBnYW1lUmVmLmNoaWxkKCdpbml0aWFsRGVjaycpO1xuICAgIHZhciBwbGF5ZXJzUmVmID0gZ2FtZVJlZi5jaGlsZCgncGxheWVycycpO1xuICAgIHZhciBtYXJrZXJzUmVmID0gZ2FtZVJlZi5jaGlsZCgnYXZhaWxhYmxlTWFya2VycycpO1xuXG4gICAgLy8gaW50aWFsaXplIGdhbWVcbiAgICAkc2NvcGUuZ2FtZSA9IG5ldyBHYW1lKCRzdGF0ZVBhcmFtcy5nYW1lTmFtZSwgJHN0YXRlUGFyYW1zLmRlY2spO1xuXG4gICAgJHNjb3BlLmdhbWUuZGVjayA9ICRmaXJlYmFzZU9iamVjdChkZWNrUmVmKTtcblxuICAgIHZhciBtYXJrZXJzQXJyID0gJGZpcmViYXNlQXJyYXkobWFya2Vyc1JlZik7XG5cbiAgICBtYXJrZXJzQXJyLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICRzY29wZS5hdmFpbGFibGVNYXJrZXJzID0gZGF0YVswXVxuICAgIH0pO1xuXG4gICAgbWFya2Vyc1JlZi5vbigndmFsdWUnLCBmdW5jdGlvbiAoYXZhaWxhYmxlTWFya2Vycykge1xuICAgICAgICAkc2NvcGUuYXZhaWxhYmxlTWFya2VycyA9IE9iamVjdC5rZXlzKGF2YWlsYWJsZU1hcmtlcnMpLm1hcChmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgcmV0dXJuIGF2YWlsYWJsZU1hcmtlcnNbaV07XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZmlyZWJhc2UuYXV0aCgpLm9uQXV0aFN0YXRlQ2hhbmdlZChmdW5jdGlvbiAodXNlcikge1xuICAgICAgICB2YXIgZmlyZWJhc2VQbGF5ZXJzQXJyID0gJGZpcmViYXNlQXJyYXkocGxheWVyc1JlZilcbiAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICB2YXIgRkJwbGF5ZXJzID0gZGF0YTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicGxheWVyc1wiLCBGQnBsYXllcnMpXG4gICAgICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgICAgIHZhciB1c2VyQXV0aElkID0gdXNlci51aWQ7XG4gICAgICAgICAgICAgICAgdmFyIG1lID0gJHNjb3BlLkZCcGxheWVycy5maWx0ZXIocGxheWVyID0+IHBsYXllci51aWQgPT09IHVzZXJBdXRoSWQpWzBdO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibWUgaWR4XCIsIEZCcGxheWVycy5pbmRleE9mKG1lKSlcbiAgICAgICAgICAgICAgICBpZiAobWUpICRzY29wZS5tZSA9IG1lO1xuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUubWUubWFya2VyID09PSBcIm5cIikgJHNjb3BlLm1lLm1hcmtlciA9IG51bGw7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gTm8gdXNlciBpcyBzaWduZWQgaW4uXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJub3RoaW5nXCIpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfSk7XG5cbiAgICAvL0hhdmUgcGxheWVyIHBpY2sgdGhlIG1hcmtlclxuICAgICRzY29wZS5waWNrTWFya2VyID0gZnVuY3Rpb24gKGJvYXJkLCBtYXJrZXIpIHtcbiAgICAgICAgJHNjb3BlLm1lLm1hcmtlciA9IG1hcmtlcjtcbiAgICAgICAgdmFyIGZpcmViYXNlUGxheWVyc0FyciA9ICRmaXJlYmFzZUFycmF5KHBsYXllcnNSZWYpXG4gICAgICAgIGZpcmViYXNlUGxheWVyc0Fyci4kbG9hZGVkKClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1lSWR4ID0gcGxheWVycy5pbmRleE9mKCRzY29wZS5tZSlcbiAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJHNhdmUoaWR4KVxuXG4gICAgICAgICAgICB9KVxuICAgICAgICB2YXIgaWR4ID0gJHNjb3BlLmF2YWlsYWJsZU1hcmtlcnMuaW5kZXhPZihtYXJrZXIpO1xuICAgICAgICAkc2NvcGUuYXZhaWxhYmxlTWFya2Vycy5zcGxpY2UoaWR4LCAxKVxuICAgICAgICBtYXJrZXJzQXJyLiRzYXZlKDApXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocmVmKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZW1vdmVkIHRoZSBwaWNrZWQgb25lXCIpXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVmLmtleSlcbiAgICAgICAgICAgIH0pXG4gICAgfTtcblxuICAgIC8vSGF2ZSBwbGF5ZXIgcGljayB0aGVpciBzdGFydCBwb2ludFxuXG4gICAgJHNjb3BlLnBsYWNlTWFya2VyID0gZnVuY3Rpb24gKGJvYXJkLCBwb2ludCkge1xuICAgICAgICAkc2NvcGUubWUucGxhY2VNYXJrZXIocG9pbnQpO1xuICAgICAgICAkc2NvcGUuZ2FtZS5wbGF5ZXJzLnB1c2goJHNjb3BlLnBsYXllcik7XG5cbiAgICAgICAgZ2FtZVJlZi5jaGlsZCgncGxheWVycycpLmNoaWxkKHBsYXllci51aWQpLnB1c2goe1xuICAgICAgICAgICAgJ21hcmtlcic6IHBsYXllci5tYXJrZXIsXG4gICAgICAgICAgICAnc3RhcnRpbmdQb3NpdGlvbic6IHBsYXllci5zdGFydGluZ1Bvc2l0aW9uXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvL3Rha2UgYWxsIHBsYXllcnMgb24gZmlyZWJhc2UgYW5kIHR1cm4gdGhlbSBpbnRvIGxvY2FsIHBsYXllclxuICAgIHBsYXllcnNSZWYub24oXCJjaGlsZF9hZGRlZFwiLCBmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAgIHZhciBuZXdQbGF5ZXIgPSBuZXcgUGxheWVyKHBsYXllci51aWQpO1xuICAgICAgICBuZXdQbGF5ZXIubWFya2VyID0gcGxheWVyLm1hcmtlcjtcblxuICAgICAgICB2YXIgeCA9IHBsYXllci5zdGFydGluZ1Bvc2l0aW9uWzBdO1xuICAgICAgICB2YXIgeSA9IHBsYXllci5zdGFydGluZ1Bvc2l0aW9uWzFdO1xuICAgICAgICB2YXIgcG9pbnRzSW5kZXggPSBwbGF5ZXIuc3RhcnRpbmdQb3NpdGlvblsyXTtcblxuICAgICAgICBuZXdQbGF5ZXIucG9pbnQgPSBib2FyZFt5XVt4XS5wb2ludHNbcG9pbnRzSW5kZXhdO1xuICAgICAgICBuZXdQbGF5ZXIubmV4dFNwYWNlID0gYm9hcmRbeV1beF07XG4gICAgICAgIG5ld1BsYXllci5uZXh0U3BhY2VQb2ludHNJbmRleCA9IHBsYXllci5zdGFydGluZ1Bvc2l0aW9uWzJdO1xuXG4gICAgICAgIG5ld1BsYXllci50aWxlcyA9ICRzY29wZS5nYW1lLmRlY2suZGVhbFRocmVlKCk7XG5cbiAgICAgICAgJHNjb3BlLmdhbWUucGxheWVycy5wdXNoKG5ld1BsYXllcik7XG4gICAgfSk7XG5cblxuXG5cblxuXG5cbiAgICAvLyBUT0RPOiB3ZSBwcm9iYWJseSBuZWVkIHRoaXMgb24gZmlyZWJhc2Ugc28gb3RoZXIgcGVvcGxlIGNhbid0IHBpY2sgd2hhdCdzIGJlZW4gcGlja2VkXG5cbiAgICAvL0ZvciBzeW5jaHJvbml6aW5nR2FtZS4uLlxuICAgIHZhciBzeW5jUmVmID0gZ2FtZVJlZi5jaGlsZCgnbW92ZXMnKTtcbiAgICBzeW5jUmVmLm9uKCdjaGlsZF9hZGRlZCcsIGZ1bmN0aW9uIChjaGlsZFNuYXBzaG90LCBwcmV2Q2hpbGRLZXkpIHtcbiAgICAgICAgLy9ORUVEIFRPIERPVUJMRSBDSEVDSyEhIFdoYXQgZG9lcyBjaGlsZFNuYXAgcmV0dXJucz9cbiAgICAgICAgY29uc29sZS5sb2coJ2NoaWxkU25hcHNob3RfU3luY0dhbWUnLCBjaGlsZFNuYXBzaG90KTtcbiAgICAgICAgLy9kZXBlbmRpbmcgb24gd2hhdCBjaGlsZFNuYXBzaG90IGdpdmVzIG1lLi4uSSB0aGluayBpdCdzIG9uZSBjaGlsZCBwZXIgb24gY2FsbD8gSXQgZG9lc24ndCByZXR1cm4gYW4gYXJyYXkgb2YgY2hhbmdlcy4uLkkgYmVsaWV2ZSFcbiAgICAgICAgaWYgKGNoaWxkU25hcHNob3QudHlwZSA9PT0gJ3VwZGF0ZURlY2snKSB7XG4gICAgICAgICAgICAkc2NvcGUuZ2FtZS5kZWNrID0gY2hpbGRTbmFwc2hvdC51cGRhdGVEZWNrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJHNjb3BlLnBsYWNlVGlsZShjaGlsZFNuYXBzaG90LnRpbGUpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBUT0RPOiBob3cgdG8gcmUtZG8gdGhlIG1vdmVzP1xuICAgIC8vICRzY29wZS5nYW1lLm1vdmVzO1xuXG4gICAgLy8gVE9ETzogaG93IGRvIHdlIHNob3cgdGhlIHRpbGVzIGZvciBwbGF5ZXI/XG5cbiAgICAvLyBUT0RPOiBob3cgdG8gc2hvdyB0aGUgcm90YXRlZCB0aWxlP1xuXG4gICAgLy8gQ01UOiBhc3N1bWluZyB3ZSB1c2UgbmV3IEdhbWUoKSBmb3IgZWFjaCBnYW1lXG4gICAgJHNjb3BlLmN1cnJlbnRQbGF5ZXIgPSAkc2NvcGUuZ2FtZS5nZXRDdXJyZW50UGxheWVyKCk7XG5cbiAgICAvLyBDTVQ6IGFzc3VtaW5nIHdlIHVzZSBuZXcgR2FtZSgpIGZvciBlYWNoIGdhbWUsIGhvbGRzIGFsbCB0aGUgcGxheWVycyBzdGlsbCBvbiB0aGUgYm9hcmQuXG4gICAgLy8gJHNjb3BlLnR1cm5PcmRlckFycmF5ID0gJHNjb3BlLmdhbWUuZ2V0Q2FuUGxheSgpO1xuXG4gICAgLy8gVE9ETzogbmVlZCBhIGZ1bmN0aW9uIHRvIGFzc2lnbiBkcmFnb25cbiAgICAkc2NvcGUuZHJhZ29uO1xuICAgIHZhciBhd2FpdGluZ0RyYWdvbkhvbGRlcnMgPSBbXTtcblxuXG4gICAgJHNjb3BlLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvL1xuICAgIH07XG5cbiAgICAkc2NvcGUubXlUdXJuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAkc2NvcGUubWUgPT09ICRzY29wZS5jdXJyZW50UGxheWVyO1xuICAgIH07XG5cbiAgICAvL3RoZXNlIGFyZSB0aWVkIHRvIGFuZ3VsYXIgbmctY2xpY2sgYnV0dG9uc1xuICAgICRzY29wZS5yb3RhdGVUaWxlQ3cgPSBmdW5jdGlvbiAodGlsZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInJvdGF0ZSB0byByaWdodFwiKVxuICAgICAgICB0aWxlLnJvdGF0aW9uKys7XG4gICAgICAgIGlmICh0aWxlLnJvdGF0aW9uID09PSA0KSB0aWxlLnJvdGF0aW9uID0gMDtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnJvdGF0ZVRpbGVDY3cgPSBmdW5jdGlvbiAodGlsZSkge1xuICAgICAgICB0aWxlLnJvdGF0aW9uLS07XG4gICAgICAgIGlmICh0aWxlLnJvdGF0aW9uID09PSAtNCkgdGlsZS5yb3RhdGlvbiA9IDA7XG4gICAgfTtcblxuICAgIC8vIENNVDogYXNzdW1pbmcgd2UgdXNlIG5ldyBHYW1lKClcbiAgICAvLyBDTVQ6IHVzZSBwbGF5ZXIncyBhbmQgZ2FtZSdzIHByb3RvdHlwZSBmdW5jdGlvbiB0byBwbGFjZSB0aWxlIGFuZCB0aGVuIG1vdmUgYWxsIHBsYXllcnNcbiAgICAkc2NvcGUucGxhY2VUaWxlID0gZnVuY3Rpb24gKHRpbGUpIHtcbiAgICAgICAgLy8gVE9ETzogc2VuZCB0aGlzIHN0YXRlIHRvIGZpcmViYXNlIGV2ZXJ5IHRpbWUgaXQncyBjYWxsZWRcbiAgICAgICAgaWYgKHRpbGUucm90YXRpb24gPiAwKSB7XG4gICAgICAgICAgICB0aWxlLnBhdGhzID0gdGlsZS5wYXRocy5tYXAoZnVuY3Rpb24gKGNvbm5lY3Rpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29ubmVjdGlvbiArIDI7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRpbGUucGF0aHMudW5zaGlmdCh0aWxlLnBhdGhzLnBvcCgpKTtcbiAgICAgICAgICAgIHRpbGUucGF0aHMudW5zaGlmdCh0aWxlLnBhdGhzLnBvcCgpKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aWxlLnJvdGF0aW9uIDwgMCkge1xuICAgICAgICAgICAgdGlsZS5wYXRocyA9IHRpbGUucGF0aHMubWFwKGZ1bmN0aW9uIChjb25uZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbm5lY3Rpb24gLSAyO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aWxlLnBhdGhzLnB1c2godGlsZS5wYXRocy5zaGlmdCgpKTtcbiAgICAgICAgICAgIHRpbGUucGF0aHMucHVzaCh0aWxlLnBhdGhzLnNoaWZ0KCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLm1lLnBsYWNlVGlsZSh0aWxlKTtcbiAgICAgICAgZ2FtZVJlZi5jaGlsZCgnbW92ZXMnKS4kYWRkKHtcbiAgICAgICAgICAgICd0eXBlJzogJ3BsYWNlVGlsZScsXG4gICAgICAgICAgICAndGlsZSc6IHRpbGVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLmdhbWUubW92ZUFsbHBsYXllcnMoKTtcblxuICAgICAgICBpZiAoJHNjb3BlLmdhbWUuY2hlY2tPdmVyKCkpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IG5lZWQgdG8gdGVsbCB0aGUgcGxheWVyIHNoZSB3b25cbiAgICAgICAgICAgICRzY29wZS53aW5uZXIgPSAkc2NvcGUuZ2FtZS5nZXRDYW5QbGF5KClbMF07XG4gICAgICAgICAgICAkc2NvcGUuZ2FtZU92ZXIgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gSWYgZGVjayBpcyBlbXB0eSAmIG5vIG9uZSBpcyBkcmFnb24sIHNldCBtZSBhcyBkcmFnb25cbiAgICAgICAgICAgIGlmICgkc2NvcGUuZ2FtZS5kZWNrLmxlbmd0aCA9PT0gMCAmJiAhJHNjb3BlLmRyYWdvbikge1xuICAgICAgICAgICAgICAgICRzY29wZS5kcmFnb24gPSAkc2NvcGUubWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCRzY29wZS5nYW1lLmRlY2subGVuZ3RoID09PSAwICYmICRzY29wZS5kcmFnb24pIHtcbiAgICAgICAgICAgICAgICBhd2FpdGluZ0RyYWdvbkhvbGRlcnMucHVzaCgkc2NvcGUubWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBDTVQ6IGRyYXcgb25lIHRpbGUgYW5kIHB1c2ggaXQgdG8gdGhlIHBsYXllci50aWxlcyBhcnJheVxuICAgICAgICAgICAgICAgICRzY29wZS5tZS50aWxlcy5wdXNoKCRzY29wZS5nYW1lLmRlY2suZGVhbCgxKSk7XG4gICAgICAgICAgICAgICAgLy9pZiBkZWFkIHBsYXllcnMsIHRoZW4gcHVzaCB0aGVpciBjYXJkcyBiYWNrIHRvIHRoZSBkZWNrICYgcmVzaHVmZmxlXG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZS5nYW1lLmRlYWRQbGF5ZXJzKCkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vd2l0aCBuZXcgY2FyZHMgJiBuZWVkIHRvIHJlc2h1ZmZsZVxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZ2FtZS5kZWFkUGxheWVycygpLmZvckVhY2goZnVuY3Rpb24gKGRlYWRQbGF5ZXJUaWxlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVhZFBsYXllclRpbGVzLmZvckVhY2goZnVuY3Rpb24gKHRpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZ2FtZS5kZWNrLnB1c2godGlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5nYW1lLmRlY2sgPSAkc2NvcGUuZ2FtZS5kZWNrLnNodWZmbGUoKTtcbiAgICAgICAgICAgICAgICAgICAgLy9zZW5kIGZpcmViYXNlIGEgbmV3IG1vdmVcbiAgICAgICAgICAgICAgICAgICAgZ2FtZVJlZi5jaGlsZCgnbW92ZXMnKS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICd0eXBlJzogJ3VwZGF0ZURlY2snLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3VwZGF0ZURlY2snOiAkc2NvcGUuZ2FtZS5kZWNrXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmRyYWdvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRyYWdvbi50aWxlcy5wdXNoKCRzY29wZS5nYW1lLmRlY2suZGVhbCgxKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZHJhZ29uID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vTkVFRCBUTyBESVNDVVNTOiBNaWdodCBuZWVkIHRvIG1vZGlmeSB0aGlzIGlmIHdlIHdhbnQgdG8gdXNlIHVwIHRoZSBjYXJkcyBhbmQgZ2l2ZSBlYWNoIGF3YWl0aW5nIHBsYXllcnMnIHVwIHRvIDMgY2FyZHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlICgkc2NvcGUuZ2FtZS5kZWNrLmxlbmd0aCAmJiAkc2NvcGUuYXdhaXRpbmdEcmFnb25Ib2xkZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5hd2FpdGluZ0RyYWdvbkhvbGRlcnMuc2hpZnQoKS50aWxlcy5wdXNoKCRzY29wZS5nYW1lLmRlY2suZGVhbCgxKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS5hd2FpdGluZ0RyYWdvbkhvbGRlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRyYWdvbiA9ICRzY29wZS5hd2FpdGluZ0RyYWdvbkhvbGRlcnMuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRzY29wZS5nYW1lLmdvVG9OZXh0UGxheWVyKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gVE9ETzogZmlyZWJhc2UgZ2FtZS5wbGF5ZXJzIHNsaWNlICRzY29wZS5wbGF5ZXIgb3V0XG4gICAgJHNjb3BlLmxlYXZlR2FtZTtcblxuICAgIC8vIFRPRE86IGRvIHdlIHJlbW92ZSB0aGlzIGdhbWUgcm9vbSdzIG1vdmVzIGZyb20gZmlyZWJhc2U/XG4gICAgJHNjb3BlLnJlc2V0ID0gJHNjb3BlLmdhbWUucmVzZXQ7XG5cblxuICAgICRzY29wZS5zdGFydHRvcCA9IFtcbiAgICAgICAgWzAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMV0sXG4gICAgICAgIFsxLCAwLCAwXSxcbiAgICAgICAgWzEsIDAsIDFdLFxuICAgICAgICBbMiwgMCwgMF0sXG4gICAgICAgIFsyLCAwLCAxXSxcbiAgICAgICAgWzMsIDAsIDBdLFxuICAgICAgICBbMywgMCwgMV0sXG4gICAgICAgIFs0LCAwLCAwXSxcbiAgICAgICAgWzQsIDAsIDFdLFxuICAgICAgICBbNSwgMCwgMF0sXG4gICAgICAgIFs1LCAwLCAxXVxuICAgIF07XG4gICAgJHNjb3BlLnN0YXJ0bGVmdCA9IFtcbiAgICAgICAgWzAsIDAsIDddLFxuICAgICAgICBbMCwgMCwgNl0sXG4gICAgICAgIFswLCAxLCA3XSxcbiAgICAgICAgWzAsIDEsIDZdLFxuICAgICAgICBbMCwgMiwgN10sXG4gICAgICAgIFswLCAyLCA2XSxcbiAgICAgICAgWzAsIDMsIDddLFxuICAgICAgICBbMCwgMywgNl0sXG4gICAgICAgIFswLCA0LCA3XSxcbiAgICAgICAgWzAsIDQsIDZdLFxuICAgICAgICBbMCwgNSwgN10sXG4gICAgICAgIFswLCA1LCA2XVxuICAgIF07XG4gICAgJHNjb3BlLnN0YXJ0Ym90dG9tID0gW1xuICAgICAgICBbMCwgNSwgMF0sXG4gICAgICAgIFswLCA1LCAxXSxcbiAgICAgICAgWzEsIDUsIDBdLFxuICAgICAgICBbMSwgNSwgMV0sXG4gICAgICAgIFsyLCA1LCAwXSxcbiAgICAgICAgWzIsIDUsIDFdLFxuICAgICAgICBbMywgNSwgMF0sXG4gICAgICAgIFszLCA1LCAxXSxcbiAgICAgICAgWzQsIDUsIDBdLFxuICAgICAgICBbNCwgNSwgMV0sXG4gICAgICAgIFs1LCA1LCAwXSxcbiAgICAgICAgWzUsIDUsIDFdXG4gICAgXTtcbiAgICAkc2NvcGUuc3RhcnRyaWdodCA9IFtcbiAgICAgICAgWzUsIDAsIDJdLFxuICAgICAgICBbNSwgMCwgM10sXG4gICAgICAgIFs1LCAxLCAyXSxcbiAgICAgICAgWzUsIDEsIDNdLFxuICAgICAgICBbNSwgMiwgMl0sXG4gICAgICAgIFs1LCAyLCAzXSxcbiAgICAgICAgWzUsIDMsIDJdLFxuICAgICAgICBbNSwgMywgM10sXG4gICAgICAgIFs1LCA0LCAyXSxcbiAgICAgICAgWzUsIDQsIDNdLFxuICAgICAgICBbNSwgNSwgMl0sXG4gICAgICAgIFs1LCA1LCAzXVxuICAgIF07XG5cbn0pOztcbiIsInRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZ2FtZWxpc3QnLCB7XG4gICAgICAgIHVybDogJy9nYW1lbGlzdCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2Jyb3dzZXIvanMvZ2FtZWxpc3QvZ2FtZWxpc3QuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdnYW1lTGlzdCcsXG4gICAgfSk7XG59KTtcblxudHN1cm8uY29udHJvbGxlcignZ2FtZUxpc3QnLCBmdW5jdGlvbiAoJHNjb3BlLCBmaXJlYmFzZVVybCwgJGZpcmViYXNlT2JqZWN0LCAkc3RhdGUsICRmaXJlYmFzZUF1dGgsICRmaXJlYmFzZUFycmF5KSB7XG4gICAgLy9Gb3Igc3luY2hyb25pemluZ0dhbWVMaXN0Li4uXG4gICAgdmFyIHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XG4gICAgdmFyIG9iaiA9ICRmaXJlYmFzZU9iamVjdChyZWYpO1xuXG4gICAgdmFyIGF1dGggPSAkZmlyZWJhc2VBdXRoKCk7XG4gICAgdmFyIGZpcmViYXNlVXNlciA9IGF1dGguJGdldEF1dGgoKTtcblxuICAgIHZhciBzeW5jaFJlZiA9IHJlZi5jaGlsZChcImdhbWVzXCIpO1xuICAgIHZhciBzeW5jaHJvbml6ZWRPYmogPSAkZmlyZWJhc2VPYmplY3Qoc3luY2hSZWYpO1xuXG4gICAgLy8gVGhpcyByZXR1cm5zIGEgcHJvbWlzZS4uLnlvdSBjYW4udGhlbigpIGFuZCBhc3NpZ24gdmFsdWUgdG8gJHNjb3BlLnZhcmlhYmxlXG4gICAgLy8gZ2FtZWxpc3QgaXMgd2hhdGV2ZXIgd2UgYXJlIGNhbGxpbmcgaXQgaW4gdGhlIGFuZ3VsYXIgaHRtbC5cbiAgICBzeW5jaHJvbml6ZWRPYmouJGJpbmRUbygkc2NvcGUsIFwiZ2FtZWxpc3RcIilcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGdhbWVsaXN0ID0gW11cbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gJHNjb3BlLmdhbWVsaXN0KSB7XG4gICAgICAgICAgICAgICAgZ2FtZWxpc3QucHVzaChbaSwgJHNjb3BlLmdhbWVsaXN0W2ldXSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRzY29wZS5nYW1lTmFtZXMgPSBnYW1lbGlzdC5zbGljZSgyKTtcbiAgICAgICAgfSlcblxuXG4gICAgJHNjb3BlLmpvaW4gPSBmdW5jdGlvbiAoZ2FtZU5hbWUpIHtcbiAgICAgICAgdmFyIGdhbWVOYW1lUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKGdhbWVOYW1lKTtcbiAgICAgICAgdmFyIHBsYXllcnNSZWYgPSBnYW1lTmFtZVJlZi5jaGlsZCgncGxheWVycycpO1xuXG4gICAgICAgIHZhciBwbGF5ZXJBcnIgPSAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKTtcbiAgICAgICAgcGxheWVyQXJyLiRsb2FkZWQoKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXBsYXllcnMuZmlsdGVyKHBsYXllciA9PiBwbGF5ZXIudWlkID09PSBmaXJlYmFzZVVzZXIudWlkKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3UGxheWVyID0gbmV3IFBsYXllcihmaXJlYmFzZVVzZXIudWlkKVxuICAgICAgICAgICAgICAgICAgICAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKS4kYWRkKG5ld1BsYXllcilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICRzdGF0ZS5nbygnZ2FtZScsIHtcbiAgICAgICAgICAgIFwiZ2FtZU5hbWVcIjogZ2FtZU5hbWVcbiAgICAgICAgfSk7XG4gICAgfTtcbn0pO1xuIiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsb2dpbicsIHtcbiAgICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvYnJvd3Nlci9qcy9sb2dpbi9sb2dpbi5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2xvZ2luQ3RybCdcbiAgICB9KTtcbn0pO1xuXG50c3Vyby5jb250cm9sbGVyKCdsb2dpbkN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsICRmaXJlYmFzZUF1dGgsICRyb290U2NvcGUpIHtcbiAgICB2YXIgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcblxuICAgICRzY29wZS5sb2dJbldpdGhHb29nbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGF1dGguJHNpZ25JbldpdGhQb3B1cChcImdvb2dsZVwiKS50aGVuKGZ1bmN0aW9uIChhdXRoRGF0YSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJMb2dnZWQgaW4gYXM6XCIsIGF1dGhEYXRhKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuY3VycmVudFVzZXIgPSBhdXRoRGF0YTtcbiAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiQXV0aGVudGljYXRpb24gZmFpbGVkOlwiLCBlcnJvcik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRzdGF0ZS5nbygncGlja0dhbWUnKTtcbiAgICB9O1xuXG59KTtcbiIsIid1c2Ugc3RyaWN0J1xuXG5mdW5jdGlvbiBQbGF5ZXIodWlkKSB7XG4gICAgLy8gVE9ETzogZ2V0IHVpZCBmcm9tIGZpcmViYXNlIGF1dGhcbiAgICB0aGlzLnVpZCA9IHVpZDtcblxuICAgIHRoaXMubWFya2VyID0gXCJuXCI7XG5cbiAgICAvLyBzaG91bGQgYmUgYSBQb2ludCBvYmplY3RcbiAgICB0aGlzLnBvaW50ID0gXCJuXCI7XG5cbiAgICAvLyBbeCwgeV1cbiAgICAvLyBkZXBlbmRzIG9uIHRoZSBhbmd1bGFyIFNwYWNlLngsIFNwYWNlLnlcbiAgICB0aGlzLm5leHRTcGFjZSA9IFwiblwiO1xuXG4gICAgLy8gaW4gZWFjaCBTcGFjZS5wb2ludHMgYXJyYXksIGZpbmQgdGhpcyBzcGVjaWZpYyBwb2ludCBhbmQgZ2V0IHRoZSBwb3NpdGlvbiAoaW50ZWdlcikgaW5zaWRlIHRoaXMgc3BhY2UuXG4gICAgdGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9IFwiblwiO1xuXG4gICAgLy8gbWF4aW11biAzIHRpbGVzXG4gICAgdGhpcy50aWxlcyA9ICduJztcblxuICAgIC8vIGlmIGEgcGxheWVyIGRpZXMsIGl0IHdpbGwgYmUgY2hhbmdlZCB0byBmYWxzZVxuICAgIHRoaXMuY2FuUGxheSA9IHRydWU7XG59XG5cblBsYXllci5wcm90b3R5cGUucGxhY2VNYXJrZXIgPSBmdW5jdGlvbiAoYm9hcmQsIHBvaW50KSB7XG4gICAgLy8gcG9pbnQgbG9va3MgbGlrZSBbeCwgeSwgcG9pbnRzSW5kZXhdIGluIHRoZSBzcGFjZVxuICAgIHZhciB4ID0gcG9pbnRbMF07XG4gICAgdmFyIHkgPSBwb2ludFsxXTtcbiAgICB2YXIgcG9pbnRzSW5kZXggPSBwb2ludFsyXTtcblxuICAgIHRoaXMucG9pbnQgPSBib2FyZFt5XVt4XS5wb2ludHNbcG9pbnRzSW5kZXhdO1xuICAgIHRoaXMucG9pbnQudHJhdmVsbGVkID0gdHJ1ZTtcblxuICAgIC8vW3gsIHldIGZyb20gdGhlIHBvaW50XG4gICAgdGhpcy5uZXh0U3BhY2UgPSBib2FyZFt5XVt4XTtcblxuICAgIC8vIGluIGVhY2ggU3BhY2UucG9pbnRzIGFycmF5LCBmaW5kIHRoaXMgc3BlY2lmaWMgcG9pbnQgYW5kIGdldCB0aGUgcG9zaXRpb24gKGludGVnZXIpIGluc2lkZSB0aGlzIHNwYWNlLlxuICAgIHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPSB0aGlzLm5leHRTcGFjZS5wb2ludHMuaW5kZXhPZih0aGlzLnBvaW50KTtcbn07XG5cblBsYXllci5wcm90b3R5cGUubmV3U3BhY2UgPSBmdW5jdGlvbiAoYm9hcmQsIG9sZFNwYWNlKSB7XG4gICAgaWYgKHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDAgfHwgdGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gYm9hcmRbb2xkU3BhY2UueSAtIDFdW29sZFNwYWNlLnhdO1xuICAgIH0gZWxzZSBpZiAodGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gMiB8fCB0aGlzLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSAzKSB7XG4gICAgICAgIHJldHVybiBib2FyZFtvbGRTcGFjZS55XVtvbGRTcGFjZS54ICsgMV07XG4gICAgfSBlbHNlIGlmICh0aGlzLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSA0IHx8IHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDUpIHtcbiAgICAgICAgcmV0dXJuIGJvYXJkW29sZFNwYWNlLnkgKyAxXVtvbGRTcGFjZS54XTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYm9hcmRbb2xkU3BhY2UueV1bb2xkU3BhY2UueCAtIDFdO1xuICAgIH1cbn07XG5cblBsYXllci5wcm90b3R5cGUucGxhY2VUaWxlID0gZnVuY3Rpb24gKHRpbGUpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLnRpbGVzLmluZGV4T2YodGlsZSk7XG4gICAgdGhpcy50aWxlcy5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgdGhpcy5uZXh0U3BhY2UudGlsZVVybCA9IHRpbGUuaW1hZ2VVcmw7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRpbGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5uZXh0U3BhY2UucG9pbnRzW2ldLm5laWdoYm9ycy5wdXNoKHRoaXMubmV4dFNwYWNlLnBvaW50c1t0aWxlW2ldXSk7XG4gICAgfVxufTtcblxuUGxheWVyLnByb3RvdHlwZS5tb3ZlVG8gPSBmdW5jdGlvbiAocG9pbnRlcikge1xuICAgIC8vIGxldCBwb2ludGVyID0gcG9pbnRlcjtcblxuICAgIC8vYWx3YXlzIGJlIHJldHVybmluZyAwIG9yIDEgcG9pbnQgaW4gdGhlIGFycmF5XG4gICAgbGV0IG5leHRQb2ludCA9IHBvaW50ZXIubmVpZ2hib3JzLmZpbHRlcihmdW5jdGlvbiAobmVpZ2hib3IpIHtcbiAgICAgICAgcmV0dXJuICFuZWlnaGJvci50cmF2ZWxsZWQ7XG4gICAgfSlbMF07XG5cbiAgICByZXR1cm4gbmV4dFBvaW50O1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5rZWVwTW92aW5nID0gZnVuY3Rpb24gKCkge1xuICAgIGxldCBtb3ZhYmxlID0gdGhpcy5tb3ZlVG8odGhpcy5wb2ludCk7XG4gICAgd2hpbGUgKG1vdmFibGUpIHtcbiAgICAgICAgdGhpcy5wb2ludC50cmF2ZWxsZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnBvaW50ID0gdGhpcy5tb3ZlVG8odGhpcy5wb2ludCk7XG4gICAgICAgIGxldCBvbGRTcGFjZSA9IHRoaXMubmV4dFNwYWNlO1xuICAgICAgICBsZXQgbmV3U3BhY2UgPSBuZXdTcGFjZShvbGRTcGFjZSk7XG4gICAgICAgIHRoaXMubmV4dFNwYWNlID0gbmV3U3BhY2U7XG5cbiAgICAgICAgdGhpcy5jaGVja0RlYXRoKCk7XG4gICAgICAgIG1vdmFibGUgPSB0aGlzLm1vdmVUbyh0aGlzLnBvaW50KTtcbiAgICB9XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLmNoZWNrRGVhdGggPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFsbFRyYXZlbGxlZCA9IHRoaXMucG9pbnQubmVpZ2hib3JzLmZpbHRlcihmdW5jdGlvbiAobmVpZ2hib3IpIHtcbiAgICAgICAgcmV0dXJuIG5laWdoYm9yLnRyYXZlbGxlZDtcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLnBvaW50LmVkZ2UgfHwgYWxsVHJhdmVsbGVkLmxlbmd0aCA9PT0gMikgdGhpcy5kaWUoKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUuZGllID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY2FuUGxheSA9IGZhbHNlO1xuICAgIC8vIFRPRE86IG5lZWQgdG8gc2VuZCBhbiBhbGVydCBvciBtZXNzYWdlIHRvIHRoZSBwbGF5ZXIgd2hvIGp1c3QgZGllZC5cbn07XG4iLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3BpY2tHYW1lJywge1xuICAgICAgICB1cmw6ICcvcGlja2dhbWUnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9icm93c2VyL2pzL3BpY2tHYW1lL3BpY2tHYW1lLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAncGlja0dhbWVDdHJsJ1xuICAgIH0pO1xufSk7XG5cbnRzdXJvLmNvbnRyb2xsZXIoJ3BpY2tHYW1lQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSwgJGZpcmViYXNlQXJyYXksICRmaXJlYmFzZU9iamVjdCwgJGZpcmViYXNlQXV0aCkge1xuICAgIHZhciByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xuICAgIHZhciBvYmogPSAkZmlyZWJhc2VPYmplY3QocmVmKTtcblxuICAgIHZhciBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuICAgIHZhciBmaXJlYmFzZVVzZXIgPSBhdXRoLiRnZXRBdXRoKCk7XG5cbiAgICAkc2NvcGUuY3JlYXRlR2FtZSA9IGZ1bmN0aW9uIChnYW1lTmFtZSkge1xuICAgICAgICB2YXIgZ2FtZU5hbWVSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoZ2FtZU5hbWUpO1xuICAgICAgICB2YXIgcGxheWVyc1JlZiA9IGdhbWVOYW1lUmVmLmNoaWxkKCdwbGF5ZXJzJyk7XG5cbiAgICAgICAgJGZpcmViYXNlQXJyYXkoZ2FtZU5hbWVSZWYpLiRhZGQoe1xuICAgICAgICAgICAgXCJnYW1lTmFtZVwiOiBnYW1lTmFtZVxuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgbmV3UGxheWVyID0gbmV3IFBsYXllcihmaXJlYmFzZVVzZXIudWlkKVxuICAgICAgICAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKS4kYWRkKG5ld1BsYXllcilcblxuICAgICAgICBvYmouJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciB0aWxlcyA9IGRhdGEudGlsZXNcbiAgICAgICAgICAgIHZhciBkZWNrID0gbmV3IERlY2sodGlsZXMpLnNodWZmbGUoKS50aWxlcztcbiAgICAgICAgICAgIHZhciBpbml0aWFsRGVja1JlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZChnYW1lTmFtZSkuY2hpbGQoJ2luaXRpYWxEZWNrJyk7XG4gICAgICAgICAgICAkZmlyZWJhc2VBcnJheShpbml0aWFsRGVja1JlZikuJGFkZChkZWNrKTtcbiAgICAgICAgfSlcblxuXG4gICAgICAgIHZhciBpbml0aWFsTWFya2Vyc1JlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZChnYW1lTmFtZSkuY2hpbGQoJ2F2YWlsYWJsZU1hcmtlcnMnKTtcbiAgICAgICAgJGZpcmViYXNlQXJyYXkoaW5pdGlhbE1hcmtlcnNSZWYpLiRhZGQoW1wicmVkXCIsIFwib3JhbmdlXCIsIFwieWVsbG93XCIsIFwiZ3JlZW5cIiwgXCJhcXVhXCIsIFwiYmx1ZVwiLCBcIm5hdnlcIiwgXCJwdXJwbGVcIl0pO1xuXG5cbiAgICAgICAgJHN0YXRlLmdvKCdnYW1lJywge1xuICAgICAgICAgICAgXCJnYW1lTmFtZVwiOiBnYW1lTmFtZVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmdvVG9HYW1lTGlzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHN0YXRlLmdvKCdnYW1lbGlzdCcpO1xuICAgIH07XG59KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
