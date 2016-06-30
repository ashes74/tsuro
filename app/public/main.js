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
        $scope.game.availableMarkers = data[0];
        $scope.game.availableMarkers = $scope.game.availableMarkers.filter(function (elem) {
            return typeof elem === "string";
        });
    });

    markersRef.on('child_changed', function (data) {
        $scope.game.availableMarkers = data.val();
    });

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

    $scope.pickMarker = function (board, marker) {
        $scope.me.marker = marker;
        var firebasePlayersArr = $firebaseArray(playersRef);

        firebasePlayersArr.$loaded().then(function (players) {
            var meIdx;

            players.find(function (e, i) {
                if (e.$id === $scope.me.$id) meIdx = i;
            });

            firebasePlayersArr[meIdx].marker = marker;
            firebasePlayersArr.$save(meIdx);
        });

        var idx = $scope.game.availableMarkers.indexOf(marker);

        $scope.game.availableMarkers.splice(idx, 1);
        markersArr[0].splice(idx, 1);

        markersArr.$save(0).then(function (ref) {
            console.log("removed the picked marker");
            console.log(ref.key);
        });
    };

    /////K: working up until here!

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImdhbWUvYm9hcmQuanMiLCJnYW1lL2RlY2suanMiLCJnYW1lL2dhbWUuY29udHJ1Y3Rvci5qcyIsImdhbWUvZ2FtZS5qcyIsImdhbWVsaXN0L2dhbWVsaXN0LmpzIiwicGlja0dhbWUvcGlja0dhbWUuanMiLCJsb2dpbi9sb2dpbi5qcyIsInBsYXllci9wbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBQSxRQUFBLFFBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTs7QUFFQSxNQUFBLE1BQUEsQ0FBQSxZQUFBO0FBQ0EsUUFBQSxTQUFBO0FBQ0EsZ0JBQUEseUNBREE7QUFFQSxvQkFBQSxzQ0FGQTtBQUdBLHFCQUFBLDZDQUhBO0FBSUEsdUJBQUE7QUFKQSxLQUFBO0FBTUEsYUFBQSxhQUFBLENBQUEsTUFBQTtBQUNBLENBUkE7O0FBVUEsTUFBQSxRQUFBLENBQUEsYUFBQSxFQUFBLDRDQUFBOztBQUVBLE1BQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQTtBQUNBLHVCQUFBLFNBQUEsQ0FBQSxHQUFBO0FBQ0EsQ0FGQTs7QUNkQSxTQUFBLEtBQUEsR0FBQTtBQUNBLFNBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQTs7QUFFQSxNQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBO0FBQ0E7QUFDQSxXQUFBLEtBQUEsS0FBQTtBQUNBLENBUkE7O0FBVUEsU0FBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEVBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLFNBQUEsS0FBQSxHQUFBLElBQUE7QUFDQSxTQUFBLE1BQUEsR0FBQSxDQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBQUE7QUFDQSxTQUFBLE9BQUE7QUFDQSxTQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxzQkFBQTs7QUFFQSxZQUFBLElBQUEsQ0FBQSxFQUFBOztBQUNBLDRCQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLEM7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FDQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsTUFBQSxJQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLFNBSkEsTUFJQSxJQUFBLElBQUEsQ0FBQSxFQUFBOztBQUNBLGdCQUFBLE1BQUEsQ0FBQSxFQUFBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxLQUNBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxTQUhBLE1BR0EsSUFBQSxJQUFBLENBQUEsRUFBQTs7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FDQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsU0FIQSxNQUdBOztBQUNBLDRCQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLEM7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FDQTtBQUNBLHFCQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsTUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFJQSxTQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxTQUFBLElBQUEsR0FBQSxJQUFBO0FBQ0EsU0FBQSxTQUFBLEdBQUEsRUFBQTtBQUNBLFNBQUEsU0FBQSxHQUFBLEtBQUE7QUFDQTs7QUNqREE7O0lBRUEsSTtBQUNBLGtCQUFBLEtBQUEsRUFBQTtBQUFBOztBQUNBLGFBQUEsS0FBQSxHQUFBLEtBQUE7QUFDQTs7OztrQ0FFQTtBQUNBLGlCQUFBLEtBQUEsR0FBQSxFQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBLG1CQUFBLElBQUE7QUFDQTs7O29DQUVBO0FBQ0EsbUJBQUEsS0FBQSxLQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7QUFDQTs7OzZCQUVBLEcsRUFBQTtBQUNBLG1CQUFBLEtBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxDQUFBO0FBQ0E7OzsrQkFFQSxLLEVBQUE7QUFDQSxpQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLEtBQUE7QUFDQSxtQkFBQSxJQUFBO0FBQ0E7Ozs7OztBQ3ZCQTs7OztJQUlBLEk7QUFDQSxrQkFBQSxJQUFBLEVBQUE7QUFBQTs7QUFDQSxhQUFBLElBQUEsR0FBQSxJQUFBO0FBQ0EsYUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsS0FBQSxHQUFBLElBQUEsS0FBQSxHQUFBLFNBQUEsRUFBQTtBQUNBLGFBQUEsT0FBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLGdCQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsUUFBQSxFQUFBLFFBQUEsRUFBQSxPQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsUUFBQSxDQUFBOztBQUVBLGFBQUEsVUFBQSxDO0FBQ0EsYUFBQSxjQUFBLEdBQUEsRUFBQSxDO0FBQ0EsYUFBQSxNQUFBLEdBQUEsRUFBQSxDO0FBQ0EsYUFBQSxLQUFBO0FBQ0E7Ozs7MkNBRUE7QUFDQSxnQkFBQSxLQUFBLFVBQUEsS0FBQSxDQUFBLENBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsY0FBQSxDQUFBLEtBQUEsVUFBQSxDQUFBO0FBQ0E7Ozt5Q0FFQTtBQUNBLGlCQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxNQUFBO0FBQUEsdUJBQUEsT0FBQSxVQUFBLEVBQUE7QUFBQSxhQUFBO0FBQ0E7OztzQ0FDQTtBQUNBLGdCQUFBLG1CQUFBLEVBQUE7QUFDQSxpQkFBQSxPQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0Esb0JBQUEsQ0FBQSxPQUFBLE9BQUEsSUFBQSxPQUFBLEtBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EscUNBQUEsSUFBQSxDQUFBLE9BQUEsS0FBQTtBQUNBLG1DQUFBLElBQUE7QUFDQTtBQUNBLGFBTEE7QUFNQSxtQkFBQSxnQkFBQTtBQUNBOzs7b0NBRUE7QUFDQSxtQkFBQSxhQUFBLE1BQUEsSUFBQSxDQUFBO0FBQ0E7Ozs7Ozt5Q0FHQTtBQUNBLGdCQUFBLFdBQUEsS0FBQSxjQUFBLEVBQUEsTUFBQSxHQUFBLENBQUEsRUFBQTtBQUNBLG9CQUFBLFNBQUEsS0FBQSxVQUFBLEdBQUEsQ0FBQTtBQUNBLHVCQUFBLENBQUEsS0FBQSxjQUFBLENBQUEsU0FBQSxDQUFBLEVBQUEsT0FBQSxFQUFBO0FBQ0E7QUFDQTtBQUNBLHFCQUFBLFVBQUEsR0FBQSxNQUFBO0FBQ0EsYUFOQSxNQU1BO0FBQ0Es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QUE7QUFDQSxRQUFBLHdCQUFBLEVBQUE7O0FBR0EsV0FBQSxLQUFBLEdBQUEsWUFBQTs7QUFFQSxLQUZBOztBQUlBLFdBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxlQUFBLEVBQUEsS0FBQSxPQUFBLGFBQUE7QUFDQSxLQUZBOzs7QUFLQSxXQUFBLFlBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGdCQUFBLEdBQUEsQ0FBQSxpQkFBQTtBQUNBLGFBQUEsUUFBQTtBQUNBLFlBQUEsS0FBQSxRQUFBLEtBQUEsQ0FBQSxFQUFBLEtBQUEsUUFBQSxHQUFBLENBQUE7QUFDQSxLQUpBOztBQU1BLFdBQUEsYUFBQSxHQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsYUFBQSxRQUFBO0FBQ0EsWUFBQSxLQUFBLFFBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxLQUFBLFFBQUEsR0FBQSxDQUFBO0FBQ0EsS0FIQTs7OztBQU9BLFdBQUEsU0FBQSxHQUFBLFVBQUEsSUFBQSxFQUFBOztBQUVBLFlBQUEsS0FBQSxRQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxHQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQTtBQUNBLHVCQUFBLGFBQUEsQ0FBQTtBQUNBLGFBRkEsQ0FBQTtBQUdBLGlCQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxTQU5BLE1BTUEsSUFBQSxLQUFBLFFBQUEsR0FBQSxDQUFBLEVBQUE7QUFDQSxpQkFBQSxLQUFBLEdBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsVUFBQSxFQUFBO0FBQ0EsdUJBQUEsYUFBQSxDQUFBO0FBQ0EsYUFGQSxDQUFBO0FBR0EsaUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxpQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLEtBQUEsRUFBQTtBQUNBOztBQUVBLGVBQUEsRUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBO0FBQ0EsZ0JBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxJQUFBLENBQUE7QUFDQSxvQkFBQSxXQURBO0FBRUEsb0JBQUE7QUFGQSxTQUFBOztBQUtBLGVBQUEsSUFBQSxDQUFBLGNBQUE7O0FBRUEsWUFBQSxPQUFBLElBQUEsQ0FBQSxTQUFBLEVBQUEsRUFBQTs7QUFFQSxtQkFBQSxNQUFBLEdBQUEsT0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLG1CQUFBLFFBQUEsR0FBQSxJQUFBO0FBQ0EsU0FKQSxNQUlBOztBQUVBLGdCQUFBLE9BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxNQUFBLEVBQUE7QUFDQSx1QkFBQSxNQUFBLEdBQUEsT0FBQSxFQUFBO0FBQ0EsYUFGQSxNQUVBLElBQUEsT0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsS0FBQSxDQUFBLElBQUEsT0FBQSxNQUFBLEVBQUE7QUFDQSxzQ0FBQSxJQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsYUFGQSxNQUVBOztBQUVBLHVCQUFBLEVBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBOztBQUVBLG9CQUFBLE9BQUEsSUFBQSxDQUFBLFdBQUEsR0FBQSxNQUFBLEVBQUE7O0FBRUEsMkJBQUEsSUFBQSxDQUFBLFdBQUEsR0FBQSxPQUFBLENBQUEsVUFBQSxlQUFBLEVBQUE7QUFDQSx3Q0FBQSxPQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxtQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0EseUJBRkE7QUFHQSxxQkFKQTtBQUtBLDJCQUFBLElBQUEsQ0FBQSxJQUFBLEdBQUEsT0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsRUFBQTs7QUFFQSw0QkFBQSxLQUFBLENBQUEsT0FBQSxFQUFBLElBQUEsQ0FBQTtBQUNBLGdDQUFBLFlBREE7QUFFQSxzQ0FBQSxPQUFBLElBQUEsQ0FBQTtBQUZBLHFCQUFBO0FBSUEsd0JBQUEsT0FBQSxNQUFBLEVBQUE7QUFDQSwrQkFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLCtCQUFBLE1BQUEsR0FBQSxJQUFBOztBQUVBLCtCQUFBLE9BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLElBQUEsT0FBQSxxQkFBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLG1DQUFBLHFCQUFBLENBQUEsS0FBQSxHQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLDRCQUFBLE9BQUEscUJBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxtQ0FBQSxNQUFBLEdBQUEsT0FBQSxxQkFBQSxDQUFBLEtBQUEsRUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0EsbUJBQUEsSUFBQSxDQUFBLGNBQUE7QUFDQTtBQUNBLEtBbkVBOzs7QUFzRUEsV0FBQSxTQUFBOzs7QUFHQSxXQUFBLEtBQUEsR0FBQSxPQUFBLElBQUEsQ0FBQSxLQUFBOztBQUdBLFdBQUEsUUFBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBLEVBSUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FKQSxFQUtBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQU5BLEVBT0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FQQSxFQVFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUkEsRUFTQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVRBLEVBVUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FWQSxFQVdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWEEsRUFZQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVpBLENBQUE7QUFjQSxXQUFBLFNBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBLEVBR0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQSxFQUlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSkEsRUFLQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUxBLEVBTUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FOQSxFQU9BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUEEsRUFRQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVJBLEVBU0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FUQSxFQVVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVkEsRUFXQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVhBLEVBWUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FaQSxDQUFBO0FBY0EsV0FBQSxXQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQURBLEVBRUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQSxFQUdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEEsRUFJQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUpBLEVBS0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FMQSxFQU1BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTkEsRUFPQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVBBLEVBUUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FSQSxFQVNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVEEsRUFVQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVZBLEVBV0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FYQSxFQVlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWkEsQ0FBQTtBQWNBLFdBQUEsVUFBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBLEVBSUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FKQSxFQUtBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQU5BLEVBT0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FQQSxFQVFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUkEsRUFTQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVRBLEVBVUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FWQSxFQVdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWEEsRUFZQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVpBLENBQUE7QUFjQSxDQXpTQTs7QUNSQSxNQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxhQUFBLFdBREE7QUFFQSxxQkFBQSxvQ0FGQTtBQUdBLG9CQUFBO0FBSEEsS0FBQTtBQUtBLENBTkE7O0FBUUEsTUFBQSxVQUFBLENBQUEsVUFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQSxlQUFBLEVBQUEsTUFBQSxFQUFBLGFBQUEsRUFBQSxjQUFBLEVBQUE7O0FBRUEsUUFBQSxNQUFBLFNBQUEsUUFBQSxHQUFBLEdBQUEsRUFBQTtBQUNBLFFBQUEsTUFBQSxnQkFBQSxHQUFBLENBQUE7O0FBRUEsUUFBQSxPQUFBLGVBQUE7QUFDQSxRQUFBLGVBQUEsS0FBQSxRQUFBLEVBQUE7O0FBRUEsUUFBQSxXQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQTtBQUNBLFFBQUEsa0JBQUEsZ0JBQUEsUUFBQSxDQUFBOzs7O0FBSUEsb0JBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxVQUFBLEVBQ0EsSUFEQSxDQUNBLFlBQUE7QUFDQSxZQUFBLFdBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLElBQUEsT0FBQSxRQUFBLEVBQUE7QUFDQSxxQkFBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLGVBQUEsU0FBQSxHQUFBLFNBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLEtBUEE7O0FBVUEsV0FBQSxJQUFBLEdBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxZQUFBLGNBQUEsSUFBQSxLQUFBLENBQUEsT0FBQSxFQUFBLEtBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxZQUFBLGFBQUEsWUFBQSxLQUFBLENBQUEsU0FBQSxDQUFBOztBQUVBLFlBQUEsWUFBQSxlQUFBLFVBQUEsQ0FBQTtBQUNBLGtCQUFBLE9BQUEsR0FDQSxJQURBLENBQ0EsVUFBQSxPQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLFFBQUEsTUFBQSxDQUFBO0FBQUEsdUJBQUEsT0FBQSxHQUFBLEtBQUEsYUFBQSxHQUFB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QUE7QUFDQSx1QkFBQSxXQUFBLEdBQUEsUUFBQTtBQUNBLFNBSEEsRUFHQSxLQUhBLENBR0EsVUFBQSxLQUFBLEVBQUE7QUFDQSxvQkFBQSxLQUFBLENBQUEsd0JBQUEsRUFBQSxLQUFBO0FBQ0EsU0FMQTs7QUFPQSxlQUFBLEVBQUEsQ0FBQSxVQUFBO0FBQ0EsS0FUQTtBQVdBLENBZEE7O0FDUkE7O0FBRUEsU0FBQSxNQUFBLENBQUEsR0FBQSxFQUFBOztBQUVBLFNBQUEsR0FBQSxHQUFBLEdBQUE7O0FBRUEsU0FBQSxNQUFBLEdBQUEsR0FBQTs7O0FBR0EsU0FBQSxLQUFBLEdBQUEsR0FBQTs7OztBQUlBLFNBQUEsU0FBQSxHQUFBLEdBQUE7OztBQUdBLFNBQUEsb0JBQUEsR0FBQSxHQUFBOzs7QUFHQSxTQUFBLEtBQUEsR0FBQSxHQUFBOzs7QUFHQSxTQUFBLE9BQUEsR0FBQSxJQUFBO0FBQ0E7O0FBRUEsT0FBQSxTQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQTs7QUFFQSxRQUFBLElBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLElBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLGNBQUEsTUFBQSxDQUFBLENBQUE7O0FBRUEsU0FBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxTQUFBLEtBQUEsQ0FBQSxTQUFBLEdBQUEsSUFBQTs7O0FBR0EsU0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBOzs7QUFHQSxTQUFBLG9CQUFBLEdBQUEsS0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBLENBZEE7O0FBZ0JBLE9BQUEsU0FBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUE7QUFDQSxRQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsRUFBQTtBQUNBLGVBQUEsTUFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLENBQUE7QUFDQSxLQUZBLE1BRUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLEVBQUE7QUFDQSxlQUFBLE1BQUEsU0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsS0FGQSxNQUVBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxFQUFBO0FBQ0EsZUFBQSxNQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtBQUNBLEtBRkEsTUFFQTtBQUNBLGVBQUEsTUFBQSxTQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLENBVkE7O0FBWUEsT0FBQSxTQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsUUFBQSxRQUFBLEtBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7O0FBRUEsU0FBQSxTQUFBLENBQUEsT0FBQSxHQUFBLEtBQUEsUUFBQTs7QUFFQSxTQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxLQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLENBVEE7O0FBV0EsT0FBQSxTQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsT0FBQSxFQUFBOzs7O0FBSUEsUUFBQSxZQUFBLFFBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGVBQUEsQ0FBQSxTQUFBLFNBQUE7QUFDQSxLQUZBLEVBRUEsQ0FGQSxDQUFBOztBQUlBLFdBQUEsU0FBQTtBQUNBLENBVEE7O0FBV0EsT0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLFVBQUEsS0FBQSxNQUFBLENBQUEsS0FBQSxLQUFBLENBQUE7QUFDQSxXQUFBLE9BQUEsRUFBQTtBQUNBLGFBQUEsS0FBQSxDQUFBLFNBQUEsR0FBQSxJQUFBO0FBQ0EsYUFBQSxLQUFBLEdBQUEsS0FBQSxNQUFBLENBQUEsS0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLFdBQUEsS0FBQSxTQUFBO0FBQ0EsWUFBQSxXQUFBLFNBQUEsUUFBQSxDQUFBO0FBQ0EsYUFBQSxTQUFBLEdBQUEsUUFBQTs7QUFFQSxhQUFBLFVBQUE7QUFDQSxrQkFBQSxLQUFBLE1BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBO0FBQ0EsQ0FaQTs7QUFjQSxPQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsZUFBQSxLQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsZUFBQSxTQUFBLFNBQUE7QUFDQSxLQUZBLENBQUE7O0FBSUEsUUFBQSxLQUFBLEtBQUEsQ0FBQSxJQUFBLElBQUEsYUFBQSxNQUFBLEtBQUEsQ0FBQSxFQUFBLEtBQUEsR0FBQTtBQUNBLENBTkE7O0FBUUEsT0FBQSxTQUFBLENBQUEsR0FBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLE9BQUEsR0FBQSxLQUFBOztBQUVBLENBSEEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciB0c3VybyA9IGFuZ3VsYXIubW9kdWxlKCdUc3VybycsIFsndWkucm91dGVyJywgJ2ZpcmViYXNlJ10pO1xuXG50c3Vyby5jb25maWcoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB7XG4gICAgICAgIGFwaUtleTogXCJBSXphU3lDTG0zamtrNXBwTXFlUXhLb0gtZFo5Q2RZTWFER1dXcVVcIixcbiAgICAgICAgYXV0aERvbWFpbjogXCJ0aGUtcGF0aHMtb2YtZHJhZ29ucy5maXJlYmFzZWFwcC5jb21cIixcbiAgICAgICAgZGF0YWJhc2VVUkw6IFwiaHR0cHM6Ly90aGUtcGF0aHMtb2YtZHJhZ29ucy5maXJlYmFzZWlvLmNvbVwiLFxuICAgICAgICBzdG9yYWdlQnVja2V0OiBcInRoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tXCIsXG4gICAgfTtcbiAgICBmaXJlYmFzZS5pbml0aWFsaXplQXBwKGNvbmZpZyk7XG59KTtcblxudHN1cm8uY29uc3RhbnQoJ2ZpcmViYXNlVXJsJywgJ2h0dHBzOi8vcGF0aC1vZi10aGUtZHJhZ29uLmZpcmViYXNlaW8uY29tLycpO1xuXG50c3Vyby5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbn0pO1xuIiwiZnVuY3Rpb24gQm9hcmQoKSB7XG4gICAgdGhpcy5ib2FyZCA9IFtdO1xufVxuXG5Cb2FyZC5wcm90b3R5cGUuZHJhd0JvYXJkID0gZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgNjsgeSsrKSB7XG4gICAgICAgIGlmICghdGhpcy5ib2FyZFt5XSkgdGhpcy5ib2FyZFt5XSA9IFtdO1xuICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IDY7IHgrKykge1xuICAgICAgICAgICAgdGhpcy5ib2FyZFt5XS5wdXNoKG5ldyBTcGFjZSh4LCB5LCB0aGlzLmJvYXJkKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYm9hcmQ7XG59XG5cbmZ1bmN0aW9uIFNwYWNlKHgsIHksIGJvYXJkKSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICAgIHRoaXMuaW1hZ2UgPSBudWxsO1xuICAgIHRoaXMucG9pbnRzID0gW251bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGxdO1xuICAgIHRoaXMudGlsZVVybDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICBsZXQgY29ycmVzcG9uZGluZztcblxuICAgICAgICBpZiAoaSA8IDIpIHsgLy90b3BcbiAgICAgICAgICAgIGNvcnJlc3BvbmRpbmcgPSBpID09PSAwID8gNSA6IDQ7IC8vIDAgLT4gNSAmIDEgLT4gNFxuICAgICAgICAgICAgaWYgKHkgPT09IDApIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KHRydWUpO1xuICAgICAgICAgICAgZWxzZSB0aGlzLnBvaW50c1tpXSA9IGJvYXJkW3kgLSAxXVt4XS5wb2ludHNbY29ycmVzcG9uZGluZ107XG4gICAgICAgIH0gZWxzZSBpZiAoaSA8IDQpIHsgLy9yaWdodFxuICAgICAgICAgICAgaWYgKHggPT09IDUpIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KHRydWUpO1xuICAgICAgICAgICAgZWxzZSB0aGlzLnBvaW50c1tpXSA9IG5ldyBQb2ludChmYWxzZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaSA8IDYpIHsgLy9ib3R0b21cbiAgICAgICAgICAgIGlmICh5ID09PSA1KSB0aGlzLnBvaW50c1tpXSA9IG5ldyBQb2ludCh0cnVlKTtcbiAgICAgICAgICAgIGVsc2UgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQoZmFsc2UpO1xuICAgICAgICB9IGVsc2UgeyAvL2xlZnRcbiAgICAgICAgICAgIGNvcnJlc3BvbmRpbmcgPSBpID09PSA2ID8gMyA6IDI7IC8vIDYgLT4gMyAmIDcgLT4gMlxuICAgICAgICAgICAgaWYgKHggPT09IDApIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KHRydWUpO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb2ludHNbaV0gPSBib2FyZFt5XVt4IC0gMV0ucG9pbnRzW2NvcnJlc3BvbmRpbmddO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5cbi8vIGVkZ2UgPSBib29sZWFuXG5mdW5jdGlvbiBQb2ludChlZGdlKSB7XG4gICAgdGhpcy5lZGdlID0gZWRnZTtcbiAgICB0aGlzLm5laWdoYm9ycyA9IFtdO1xuICAgIHRoaXMudHJhdmVsbGVkID0gZmFsc2U7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmNsYXNzIERlY2sge1xuICAgIGNvbnN0cnVjdG9yKHRpbGVzKSB7XG4gICAgICAgIHRoaXMudGlsZXMgPSB0aWxlc1xuICAgIH1cblxuICAgIHNodWZmbGUoKSB7XG4gICAgICAgIHRoaXMudGlsZXMgPSBfLnNodWZmbGUodGhpcy50aWxlcylcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZGVhbFRocmVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlcy5zcGxpY2UoMCwgMyk7XG4gICAgfVxuXG4gICAgZGVhbChudW0pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZXMuc3BsaWNlKDAsIG51bSk7XG4gICAgfVxuXG4gICAgcmVsb2FkKHRpbGVzKSB7XG4gICAgICAgIHRoaXMudGlsZXMucHVzaCh0aWxlcylcbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vR0FNRS8vL1xuXG5jbGFzcyBHYW1lIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuY291bnQgPSAzNTtcbiAgICAgICAgdGhpcy5ib2FyZCA9IG5ldyBCb2FyZCgpLmRyYXdCb2FyZCgpO1xuICAgICAgICB0aGlzLnBsYXllcnMgPSBbXTtcbiAgICAgICAgdGhpcy5hdmFpbGFibGVNYXJrZXJzID0gW1wicmVkXCIsIFwib3JhbmdlXCIsIFwieWVsbG93XCIsIFwiZ3JlZW5cIiwgXCJhcXVhXCIsIFwiYmx1ZVwiLCBcIm5hdnlcIiwgXCJwdXJwbGVcIl1cblxuICAgICAgICB0aGlzLmN1cnJQbGF5ZXI7IC8vaW5kZXggb2YgdGhlIGN1cnJlbnRQbGF5ZXIgaW4gdGhlIHR1cm5PcmRlckFycmF5XG4gICAgICAgIHRoaXMudHVybk9yZGVyQXJyYXkgPSBbXSAvL2hvbGRzIGFsbCB0aGUgcGxheWVycyBzdGlsbCBvbiB0aGUgYm9hcmQuXG4gICAgICAgIHRoaXMuZHJhZ29uID0gXCJcIjsgLy8gUGxheWVyLk1hcmtlclxuICAgICAgICB0aGlzLm1vdmVzO1xuICAgIH1cblxuICAgIGdldEN1cnJlbnRQbGF5ZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJQbGF5ZXIgPT09IC0xKSByZXR1cm47XG4gICAgICAgIHJldHVybiB0aGlzLnR1cm5PcmRlckFycmF5W3RoaXMuY3VyclBsYXllcl07XG4gICAgfTtcblxuICAgIG1vdmVBbGxQbGF5ZXJzKCkge1xuICAgICAgICB0aGlzLnBsYXllcnMuZm9yRWFjaCgocGxheWVyKSA9PiBwbGF5ZXIua2VlcE1vdmluZygpKVxuICAgIH07XG4gICAgZGVhZFBsYXllcnMoKSB7XG4gICAgICAgIHZhciBkZWFkUGxheWVyc1RpbGVzID0gW107XG4gICAgICAgIHRoaXMucGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICAgICAgIGlmICghcGxheWVyLmNhblBsYXkgJiYgcGxheWVyLnRpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBkZWFkUGxheWVyc1RpbGVzLnB1c2gocGxheWVyLnRpbGVzKTtcbiAgICAgICAgICAgICAgICBpc0RlYWRQbGF5ZXIgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGRlYWRQbGF5ZXJzVGlsZXM7XG4gICAgfTtcblxuICAgIGNoZWNrT3ZlcigpIHtcbiAgICAgICAgcmV0dXJuIGdldENhblBsYXkoKS5sZW5ndGggPD0gMTtcbiAgICB9XG5cbiAgICAvL3RvIGJlIGNhbGxlZCBhdCB0aGUgZW5kIG9mIGEgdHVybiB0byBzZXQgdGhlIGN1cnJQbGF5ZXIgdG8gdGhlIG5leHQgZWxpZ2libGUgcGxheWVyIGluIHRoZSB0dXJuT3JkZXJBcnJheVxuICAgIGdvVG9OZXh0UGxheWVyKCkge1xuICAgICAgICBpZiAoZ2V0Q2FuUGxheSh0aGlzLnR1cm5PcmRlckFycmF5KS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBsZXQgbmV3SWR4ID0gdGhpcy5jdXJyUGxheWVyICsgMTtcbiAgICAgICAgICAgIHdoaWxlICghdGhpcy50dXJuT3JkZXJBcnJheVtuZXdJZHggJSA4XS5jYW5QbGF5KSB7XG4gICAgICAgICAgICAgICAgbmV3SWR4Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmN1cnJQbGF5ZXIgPSBuZXdJZHg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJQbGF5ZXIgPSAtMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5nZXRDdXJyZW50UGxheWVyKCk7XG4gICAgfTtcblxuICAgIC8vcmVzdGFydCB0aGUgZ2FtZVxuICAgIHJlc2V0KCkge1xuICAgICAgICB0aGlzLnBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgICAgICAgLy9yZXRyaWV2ZSBhbGwgdGlsZXNcbiAgICAgICAgICAgIC8vcmV0dXJuIHBsYXllcidzIHRpbGVzIHRvIHRoZSBkZWNrIGFuZCBzaHVmZmxlXG4gICAgICAgICAgICB0aGlzLmRlY2sucmVsb2FkKHBsYXllci50aWxlcykuc2h1ZmZsZSgpO1xuICAgICAgICAgICAgcGxheWVyLnRpbGVzID0gW107XG4gICAgICAgICAgICAvL3Jlc2V0IGFsbCBwbGF5ZXJzIHBsYXlhYmlsaXR5XG4gICAgICAgICAgICBwbGF5ZXIuY2FuUGxheSA9IHRydWU7XG4gICAgICAgIH0pXG4gICAgfTtcblxufVxuXG4vLy8vL0VORCBPRiBHQU1FIENMQVNTLy8vLy9cblxuLy9nZXQgRWxpZ2libGUgcGxheWVyc1xubGV0IGdldENhblBsYXkgPSBmdW5jdGlvbiAocGxheWVycykge1xuICAgIHJldHVybiBwbGF5ZXJzLmZpbHRlcigocGxheWVyKSA9PiB7XG4gICAgICAgIHJldHVybiBwbGF5ZXIuY2FuUGxheVxuICAgIH0pXG59XG4iLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdnYW1lJywge1xuXHRcdHVybDogJy9nYW1lLzpnYW1lTmFtZScsXG5cdFx0dGVtcGxhdGVVcmw6ICcvYnJvd3Nlci9qcy9nYW1lL2dhbWUuaHRtbCcsXG5cdFx0Y29udHJvbGxlcjogJ2dhbWVDdHJsJ1xuXHR9KTtcbn0pO1xuXG50c3Vyby5jb250cm9sbGVyKCdnYW1lQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRmaXJlYmFzZUF1dGgsIGZpcmViYXNlVXJsLCAkc3RhdGVQYXJhbXMsICRmaXJlYmFzZU9iamVjdCwgJGZpcmViYXNlQXJyYXkpIHtcblx0dmFyIHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XG5cdHZhciBvYmogPSAkZmlyZWJhc2VPYmplY3QocmVmKTtcblxuXHR2YXIgZ2FtZVJlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZCgkc3RhdGVQYXJhbXMuZ2FtZU5hbWUpO1xuXHR2YXIgZGVja1JlZiA9IGdhbWVSZWYuY2hpbGQoJ2luaXRpYWxEZWNrJyk7XG5cdHZhciBwbGF5ZXJzUmVmID0gZ2FtZVJlZi5jaGlsZCgncGxheWVycycpO1xuXHR2YXIgbWFya2Vyc1JlZiA9IGdhbWVSZWYuY2hpbGQoJ2F2YWlsYWJsZU1hcmtlcnMnKTtcblxuXHQvLyBpbnRpYWxpemUgZ2FtZVxuXHQkc2NvcGUuZ2FtZSA9IG5ldyBHYW1lKCRzdGF0ZVBhcmFtcy5nYW1lTmFtZSwgJHN0YXRlUGFyYW1zLmRlY2spO1xuXHQkc2NvcGUuZ2FtZS5kZWNrID0gJGZpcmViYXNlT2JqZWN0KGRlY2tSZWYpO1xuXG5cdHZhciBtYXJrZXJzQXJyID0gJGZpcmViYXNlQXJyYXkobWFya2Vyc1JlZik7XG5cblx0bWFya2Vyc0Fyci4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuXHRcdCRzY29wZS5nYW1lLmF2YWlsYWJsZU1hcmtlcnMgPSBkYXRhWzBdO1xuXHRcdCRzY29wZS5nYW1lLmF2YWlsYWJsZU1hcmtlcnMgPSAkc2NvcGUuZ2FtZS5hdmFpbGFibGVNYXJrZXJzLmZpbHRlcihmdW5jdGlvbihlbGVtKXtcblx0XHRcdHJldHVybiB0eXBlb2YgZWxlbSA9PT0gXCJzdHJpbmdcIjtcblx0XHR9KTtcblx0fSk7XG5cblx0bWFya2Vyc1JlZi5vbignY2hpbGRfY2hhbmdlZCcsZnVuY3Rpb24gKGRhdGEpIHtcblx0XHQkc2NvcGUuZ2FtZS5hdmFpbGFibGVNYXJrZXJzID0gZGF0YS52YWwoKTtcblx0fSk7XG5cblx0ZmlyZWJhc2UuYXV0aCgpLm9uQXV0aFN0YXRlQ2hhbmdlZChmdW5jdGlvbiAodXNlcikge1xuXHRcdHZhciBmaXJlYmFzZVBsYXllcnNBcnIgPSAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKTtcblxuXHRcdGZpcmViYXNlUGxheWVyc0Fyci4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuXHRcdFx0dmFyIEZCcGxheWVycyA9IGRhdGE7XG5cblx0XHRcdGlmICh1c2VyKSB7XG5cdFx0XHRcdHZhciB1c2VyQXV0aElkID0gdXNlci51aWQ7XG5cdFx0XHRcdHZhciBtZSA9IEZCcGxheWVycy5maWx0ZXIocGxheWVyID0+IHBsYXllci51aWQgPT09IHVzZXJBdXRoSWQpWzBdO1xuXHRcdFx0XHRpZiAobWUpICRzY29wZS5tZSA9IG1lO1xuXHRcdFx0XHRpZiAoJHNjb3BlLm1lLm1hcmtlciA9PT0gXCJuXCIpICRzY29wZS5tZS5tYXJrZXIgPSBudWxsO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gTm8gdXNlciBpcyBzaWduZWQgaW4uXG5cdFx0XHRcdGNvbnNvbGUubG9nKFwibm90aGluZ1wiKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSk7XG5cblx0JHNjb3BlLnBpY2tNYXJrZXIgPSBmdW5jdGlvbiAoYm9hcmQsIG1hcmtlcikge1xuXHRcdCRzY29wZS5tZS5tYXJrZXIgPSBtYXJrZXI7XG5cdFx0dmFyIGZpcmViYXNlUGxheWVyc0FyciA9ICRmaXJlYmFzZUFycmF5KHBsYXllcnNSZWYpO1xuXG5cdFx0ZmlyZWJhc2VQbGF5ZXJzQXJyLiRsb2FkZWQoKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcblx0XHRcdFx0dmFyIG1lSWR4O1xuXG5cdFx0XHRcdHBsYXllcnMuZmluZChmdW5jdGlvbihlLGkpe1xuXHRcdFx0XHRcdGlmKGUuJGlkID09PSAkc2NvcGUubWUuJGlkKSBtZUlkeCA9IGk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0ubWFya2VyID0gbWFya2VyO1xuXHRcdFx0XHRmaXJlYmFzZVBsYXllcnNBcnIuJHNhdmUobWVJZHgpO1xuXHRcdFx0fSk7XG5cblx0XHR2YXIgaWR4ID0gJHNjb3BlLmdhbWUuYXZhaWxhYmxlTWFya2Vycy5pbmRleE9mKG1hcmtlcik7XG5cblx0XHQkc2NvcGUuZ2FtZS5hdmFpbGFibGVNYXJrZXJzLnNwbGljZShpZHgsIDEpO1xuXHRcdG1hcmtlcnNBcnJbMF0uc3BsaWNlKGlkeCwxKTtcblxuXHRcdG1hcmtlcnNBcnIuJHNhdmUoMClcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZWYpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJyZW1vdmVkIHRoZSBwaWNrZWQgbWFya2VyXCIpO1xuXHRcdFx0XHRjb25zb2xlLmxvZyhyZWYua2V5KTtcblx0XHRcdH0pO1xuXHR9O1xuXG4vLy8vL0s6IHdvcmtpbmcgdXAgdW50aWwgaGVyZSFcblxuXHQgICAgLy9IYXZlIHBsYXllciBwaWNrIHRoZWlyIHN0YXJ0IHBvaW50XG5cblx0ICAgICRzY29wZS5wbGFjZU1hcmtlciA9IGZ1bmN0aW9uIChib2FyZCwgcG9pbnQpIHtcblx0ICAgICAgICAkc2NvcGUubWUucGxhY2VNYXJrZXIocG9pbnQpO1xuXHQgICAgICAgICRzY29wZS5nYW1lLnBsYXllcnMucHVzaCgkc2NvcGUucGxheWVyKTtcblxuXHQgICAgICAgIGdhbWVSZWYuY2hpbGQoJ3BsYXllcnMnKS5jaGlsZChwbGF5ZXIudWlkKS5wdXNoKHtcblx0ICAgICAgICAgICAgJ21hcmtlcic6IHBsYXllci5tYXJrZXIsXG5cdCAgICAgICAgICAgICdzdGFydGluZ1Bvc2l0aW9uJzogcGxheWVyLnN0YXJ0aW5nUG9zaXRpb25cblx0ICAgICAgICB9KTtcblx0ICAgIH07XG5cblx0ICAgIC8vdGFrZSBhbGwgcGxheWVycyBvbiBmaXJlYmFzZSBhbmQgdHVybiB0aGVtIGludG8gbG9jYWwgcGxheWVyXG5cdCAgICBwbGF5ZXJzUmVmLm9uKFwiY2hpbGRfYWRkZWRcIiwgZnVuY3Rpb24gKHBsYXllcikge1xuXHQgICAgICAgIHZhciBuZXdQbGF5ZXIgPSBuZXcgUGxheWVyKHBsYXllci51aWQpO1xuXHQgICAgICAgIG5ld1BsYXllci5tYXJrZXIgPSBwbGF5ZXIubWFya2VyO1xuXG5cdCAgICAgICAgdmFyIHggPSBwbGF5ZXIuc3RhcnRpbmdQb3NpdGlvblswXTtcblx0ICAgICAgICB2YXIgeSA9IHBsYXllci5zdGFydGluZ1Bvc2l0aW9uWzFdO1xuXHQgICAgICAgIHZhciBwb2ludHNJbmRleCA9IHBsYXllci5zdGFydGluZ1Bvc2l0aW9uWzJdO1xuXG5cdCAgICAgICAgbmV3UGxheWVyLnBvaW50ID0gYm9hcmRbeV1beF0ucG9pbnRzW3BvaW50c0luZGV4XTtcblx0ICAgICAgICBuZXdQbGF5ZXIubmV4dFNwYWNlID0gYm9hcmRbeV1beF07XG5cdCAgICAgICAgbmV3UGxheWVyLm5leHRTcGFjZVBvaW50c0luZGV4ID0gcGxheWVyLnN0YXJ0aW5nUG9zaXRpb25bMl07XG5cblx0ICAgICAgICBuZXdQbGF5ZXIudGlsZXMgPSAkc2NvcGUuZ2FtZS5kZWNrLmRlYWxUaHJlZSgpO1xuXG5cdCAgICAgICAgJHNjb3BlLmdhbWUucGxheWVycy5wdXNoKG5ld1BsYXllcik7XG5cdCAgICB9KTtcblxuXG5cblxuXG5cblxuXHQgICAgLy8gVE9ETzogd2UgcHJvYmFibHkgbmVlZCB0aGlzIG9uIGZpcmViYXNlIHNvIG90aGVyIHBlb3BsZSBjYW4ndCBwaWNrIHdoYXQncyBiZWVuIHBpY2tlZFxuXG5cdCAgICAvL0ZvciBzeW5jaHJvbml6aW5nR2FtZS4uLlxuXHQgICAgdmFyIHN5bmNSZWYgPSBnYW1lUmVmLmNoaWxkKCdtb3ZlcycpO1xuXHQgICAgc3luY1JlZi5vbignY2hpbGRfYWRkZWQnLCBmdW5jdGlvbiAoY2hpbGRTbmFwc2hvdCwgcHJldkNoaWxkS2V5KSB7XG5cdCAgICAgICAgLy9ORUVEIFRPIERPVUJMRSBDSEVDSyEhIFdoYXQgZG9lcyBjaGlsZFNuYXAgcmV0dXJucz9cblx0ICAgICAgICBjb25zb2xlLmxvZygnY2hpbGRTbmFwc2hvdF9TeW5jR2FtZScsIGNoaWxkU25hcHNob3QpO1xuXHQgICAgICAgIC8vZGVwZW5kaW5nIG9uIHdoYXQgY2hpbGRTbmFwc2hvdCBnaXZlcyBtZS4uLkkgdGhpbmsgaXQncyBvbmUgY2hpbGQgcGVyIG9uIGNhbGw/IEl0IGRvZXNuJ3QgcmV0dXJuIGFuIGFycmF5IG9mIGNoYW5nZXMuLi5JIGJlbGlldmUhXG5cdCAgICAgICAgaWYgKGNoaWxkU25hcHNob3QudHlwZSA9PT0gJ3VwZGF0ZURlY2snKSB7XG5cdCAgICAgICAgICAgICRzY29wZS5nYW1lLmRlY2sgPSBjaGlsZFNuYXBzaG90LnVwZGF0ZURlY2s7XG5cdCAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgICAgJHNjb3BlLnBsYWNlVGlsZShjaGlsZFNuYXBzaG90LnRpbGUpO1xuXHQgICAgICAgIH1cblx0ICAgIH0pO1xuXG5cdCAgICAvLyBUT0RPOiBob3cgdG8gcmUtZG8gdGhlIG1vdmVzP1xuXHQgICAgLy8gJHNjb3BlLmdhbWUubW92ZXM7XG5cblx0ICAgIC8vIFRPRE86IGhvdyBkbyB3ZSBzaG93IHRoZSB0aWxlcyBmb3IgcGxheWVyP1xuXG5cdCAgICAvLyBUT0RPOiBob3cgdG8gc2hvdyB0aGUgcm90YXRlZCB0aWxlP1xuXG5cdCAgICAvLyBDTVQ6IGFzc3VtaW5nIHdlIHVzZSBuZXcgR2FtZSgpIGZvciBlYWNoIGdhbWVcblx0ICAgICRzY29wZS5jdXJyZW50UGxheWVyID0gJHNjb3BlLmdhbWUuZ2V0Q3VycmVudFBsYXllcigpO1xuXG5cdCAgICAvLyBDTVQ6IGFzc3VtaW5nIHdlIHVzZSBuZXcgR2FtZSgpIGZvciBlYWNoIGdhbWUsIGhvbGRzIGFsbCB0aGUgcGxheWVycyBzdGlsbCBvbiB0aGUgYm9hcmQuXG5cdCAgICAvLyAkc2NvcGUudHVybk9yZGVyQXJyYXkgPSAkc2NvcGUuZ2FtZS5nZXRDYW5QbGF5KCk7XG5cblx0ICAgIC8vIFRPRE86IG5lZWQgYSBmdW5jdGlvbiB0byBhc3NpZ24gZHJhZ29uXG5cdCAgICAkc2NvcGUuZHJhZ29uO1xuXHQgICAgdmFyIGF3YWl0aW5nRHJhZ29uSG9sZGVycyA9IFtdO1xuXG5cblx0ICAgICRzY29wZS5zdGFydCA9IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAvL1xuXHQgICAgfTtcblxuXHQgICAgJHNjb3BlLm15VHVybiA9IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAkc2NvcGUubWUgPT09ICRzY29wZS5jdXJyZW50UGxheWVyO1xuXHQgICAgfTtcblxuXHQgICAgLy90aGVzZSBhcmUgdGllZCB0byBhbmd1bGFyIG5nLWNsaWNrIGJ1dHRvbnNcblx0ICAgICRzY29wZS5yb3RhdGVUaWxlQ3cgPSBmdW5jdGlvbiAodGlsZSkge1xuXHQgICAgICAgIGNvbnNvbGUubG9nKFwicm90YXRlIHRvIHJpZ2h0XCIpXG5cdCAgICAgICAgdGlsZS5yb3RhdGlvbisrO1xuXHQgICAgICAgIGlmICh0aWxlLnJvdGF0aW9uID09PSA0KSB0aWxlLnJvdGF0aW9uID0gMDtcblx0ICAgIH07XG5cblx0ICAgICRzY29wZS5yb3RhdGVUaWxlQ2N3ID0gZnVuY3Rpb24gKHRpbGUpIHtcblx0ICAgICAgICB0aWxlLnJvdGF0aW9uLS07XG5cdCAgICAgICAgaWYgKHRpbGUucm90YXRpb24gPT09IC00KSB0aWxlLnJvdGF0aW9uID0gMDtcblx0ICAgIH07XG5cblx0ICAgIC8vIENNVDogYXNzdW1pbmcgd2UgdXNlIG5ldyBHYW1lKClcblx0ICAgIC8vIENNVDogdXNlIHBsYXllcidzIGFuZCBnYW1lJ3MgcHJvdG90eXBlIGZ1bmN0aW9uIHRvIHBsYWNlIHRpbGUgYW5kIHRoZW4gbW92ZSBhbGwgcGxheWVyc1xuXHQgICAgJHNjb3BlLnBsYWNlVGlsZSA9IGZ1bmN0aW9uICh0aWxlKSB7XG5cdCAgICAgICAgLy8gVE9ETzogc2VuZCB0aGlzIHN0YXRlIHRvIGZpcmViYXNlIGV2ZXJ5IHRpbWUgaXQncyBjYWxsZWRcblx0ICAgICAgICBpZiAodGlsZS5yb3RhdGlvbiA+IDApIHtcblx0ICAgICAgICAgICAgdGlsZS5wYXRocyA9IHRpbGUucGF0aHMubWFwKGZ1bmN0aW9uIChjb25uZWN0aW9uKSB7XG5cdCAgICAgICAgICAgICAgICByZXR1cm4gY29ubmVjdGlvbiArIDI7XG5cdCAgICAgICAgICAgIH0pO1xuXHQgICAgICAgICAgICB0aWxlLnBhdGhzLnVuc2hpZnQodGlsZS5wYXRocy5wb3AoKSk7XG5cdCAgICAgICAgICAgIHRpbGUucGF0aHMudW5zaGlmdCh0aWxlLnBhdGhzLnBvcCgpKTtcblx0ICAgICAgICB9IGVsc2UgaWYgKHRpbGUucm90YXRpb24gPCAwKSB7XG5cdCAgICAgICAgICAgIHRpbGUucGF0aHMgPSB0aWxlLnBhdGhzLm1hcChmdW5jdGlvbiAoY29ubmVjdGlvbikge1xuXHQgICAgICAgICAgICAgICAgcmV0dXJuIGNvbm5lY3Rpb24gLSAyO1xuXHQgICAgICAgICAgICB9KTtcblx0ICAgICAgICAgICAgdGlsZS5wYXRocy5wdXNoKHRpbGUucGF0aHMuc2hpZnQoKSk7XG5cdCAgICAgICAgICAgIHRpbGUucGF0aHMucHVzaCh0aWxlLnBhdGhzLnNoaWZ0KCkpO1xuXHQgICAgICAgIH1cblxuXHQgICAgICAgICRzY29wZS5tZS5wbGFjZVRpbGUodGlsZSk7XG5cdCAgICAgICAgZ2FtZVJlZi5jaGlsZCgnbW92ZXMnKS4kYWRkKHtcblx0ICAgICAgICAgICAgJ3R5cGUnOiAncGxhY2VUaWxlJyxcblx0ICAgICAgICAgICAgJ3RpbGUnOiB0aWxlXG5cdCAgICAgICAgfSk7XG5cblx0ICAgICAgICAkc2NvcGUuZ2FtZS5tb3ZlQWxscGxheWVycygpO1xuXG5cdCAgICAgICAgaWYgKCRzY29wZS5nYW1lLmNoZWNrT3ZlcigpKSB7XG5cdCAgICAgICAgICAgIC8vIFRPRE86IG5lZWQgdG8gdGVsbCB0aGUgcGxheWVyIHNoZSB3b25cblx0ICAgICAgICAgICAgJHNjb3BlLndpbm5lciA9ICRzY29wZS5nYW1lLmdldENhblBsYXkoKVswXTtcblx0ICAgICAgICAgICAgJHNjb3BlLmdhbWVPdmVyID0gdHJ1ZTtcblx0ICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgICAvLyBJZiBkZWNrIGlzIGVtcHR5ICYgbm8gb25lIGlzIGRyYWdvbiwgc2V0IG1lIGFzIGRyYWdvblxuXHQgICAgICAgICAgICBpZiAoJHNjb3BlLmdhbWUuZGVjay5sZW5ndGggPT09IDAgJiYgISRzY29wZS5kcmFnb24pIHtcblx0ICAgICAgICAgICAgICAgICRzY29wZS5kcmFnb24gPSAkc2NvcGUubWU7XG5cdCAgICAgICAgICAgIH0gZWxzZSBpZiAoJHNjb3BlLmdhbWUuZGVjay5sZW5ndGggPT09IDAgJiYgJHNjb3BlLmRyYWdvbikge1xuXHQgICAgICAgICAgICAgICAgYXdhaXRpbmdEcmFnb25Ib2xkZXJzLnB1c2goJHNjb3BlLm1lKTtcblx0ICAgICAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgICAgICAgIC8vIENNVDogZHJhdyBvbmUgdGlsZSBhbmQgcHVzaCBpdCB0byB0aGUgcGxheWVyLnRpbGVzIGFycmF5XG5cdCAgICAgICAgICAgICAgICAkc2NvcGUubWUudGlsZXMucHVzaCgkc2NvcGUuZ2FtZS5kZWNrLmRlYWwoMSkpO1xuXHQgICAgICAgICAgICAgICAgLy9pZiBkZWFkIHBsYXllcnMsIHRoZW4gcHVzaCB0aGVpciBjYXJkcyBiYWNrIHRvIHRoZSBkZWNrICYgcmVzaHVmZmxlXG5cdCAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmdhbWUuZGVhZFBsYXllcnMoKS5sZW5ndGgpIHtcblx0ICAgICAgICAgICAgICAgICAgICAvL3dpdGggbmV3IGNhcmRzICYgbmVlZCB0byByZXNodWZmbGVcblx0ICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZ2FtZS5kZWFkUGxheWVycygpLmZvckVhY2goZnVuY3Rpb24gKGRlYWRQbGF5ZXJUaWxlcykge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICBkZWFkUGxheWVyVGlsZXMuZm9yRWFjaChmdW5jdGlvbiAodGlsZSkge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmdhbWUuZGVjay5wdXNoKHRpbGUpO1xuXHQgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblx0ICAgICAgICAgICAgICAgICAgICB9KTtcblx0ICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZ2FtZS5kZWNrID0gJHNjb3BlLmdhbWUuZGVjay5zaHVmZmxlKCk7XG5cdCAgICAgICAgICAgICAgICAgICAgLy9zZW5kIGZpcmViYXNlIGEgbmV3IG1vdmVcblx0ICAgICAgICAgICAgICAgICAgICBnYW1lUmVmLmNoaWxkKCdtb3ZlcycpLnB1c2goe1xuXHQgICAgICAgICAgICAgICAgICAgICAgICAndHlwZSc6ICd1cGRhdGVEZWNrJyxcblx0ICAgICAgICAgICAgICAgICAgICAgICAgJ3VwZGF0ZURlY2snOiAkc2NvcGUuZ2FtZS5kZWNrXG5cdCAgICAgICAgICAgICAgICAgICAgfSk7XG5cdCAgICAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS5kcmFnb24pIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRyYWdvbi50aWxlcy5wdXNoKCRzY29wZS5nYW1lLmRlY2suZGVhbCgxKSk7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kcmFnb24gPSBudWxsO1xuXHQgICAgICAgICAgICAgICAgICAgICAgICAvL05FRUQgVE8gRElTQ1VTUzogTWlnaHQgbmVlZCB0byBtb2RpZnkgdGhpcyBpZiB3ZSB3YW50IHRvIHVzZSB1cCB0aGUgY2FyZHMgYW5kIGdpdmUgZWFjaCBhd2FpdGluZyBwbGF5ZXJzJyB1cCB0byAzIGNhcmRzXG5cdCAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlICgkc2NvcGUuZ2FtZS5kZWNrLmxlbmd0aCAmJiAkc2NvcGUuYXdhaXRpbmdEcmFnb25Ib2xkZXJzLmxlbmd0aCkge1xuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmF3YWl0aW5nRHJhZ29uSG9sZGVycy5zaGlmdCgpLnRpbGVzLnB1c2goJHNjb3BlLmdhbWUuZGVjay5kZWFsKDEpKTtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgfTtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS5hd2FpdGluZ0RyYWdvbkhvbGRlcnMubGVuZ3RoKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZHJhZ29uID0gJHNjb3BlLmF3YWl0aW5nRHJhZ29uSG9sZGVycy5zaGlmdCgpO1xuXHQgICAgICAgICAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgICAgICAgICAgfTtcblx0ICAgICAgICAgICAgICAgIH1cblxuXHQgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgICRzY29wZS5nYW1lLmdvVG9OZXh0UGxheWVyKCk7XG5cdCAgICAgICAgfVxuXHQgICAgfTtcblxuXHQgICAgLy8gVE9ETzogZmlyZWJhc2UgZ2FtZS5wbGF5ZXJzIHNsaWNlICRzY29wZS5wbGF5ZXIgb3V0XG5cdCAgICAkc2NvcGUubGVhdmVHYW1lO1xuXG5cdCAgICAvLyBUT0RPOiBkbyB3ZSByZW1vdmUgdGhpcyBnYW1lIHJvb20ncyBtb3ZlcyBmcm9tIGZpcmViYXNlP1xuXHQgICAgJHNjb3BlLnJlc2V0ID0gJHNjb3BlLmdhbWUucmVzZXQ7XG5cblxuXHQgICAgJHNjb3BlLnN0YXJ0dG9wID0gW1xuXHQgICAgICAgIFswLCAwLCAwXSxcblx0ICAgICAgICBbMCwgMCwgMV0sXG5cdCAgICAgICAgWzEsIDAsIDBdLFxuXHQgICAgICAgIFsxLCAwLCAxXSxcblx0ICAgICAgICBbMiwgMCwgMF0sXG5cdCAgICAgICAgWzIsIDAsIDFdLFxuXHQgICAgICAgIFszLCAwLCAwXSxcblx0ICAgICAgICBbMywgMCwgMV0sXG5cdCAgICAgICAgWzQsIDAsIDBdLFxuXHQgICAgICAgIFs0LCAwLCAxXSxcblx0ICAgICAgICBbNSwgMCwgMF0sXG5cdCAgICAgICAgWzUsIDAsIDFdXG5cdCAgICBdO1xuXHQgICAgJHNjb3BlLnN0YXJ0bGVmdCA9IFtcblx0ICAgICAgICBbMCwgMCwgN10sXG5cdCAgICAgICAgWzAsIDAsIDZdLFxuXHQgICAgICAgIFswLCAxLCA3XSxcblx0ICAgICAgICBbMCwgMSwgNl0sXG5cdCAgICAgICAgWzAsIDIsIDddLFxuXHQgICAgICAgIFswLCAyLCA2XSxcblx0ICAgICAgICBbMCwgMywgN10sXG5cdCAgICAgICAgWzAsIDMsIDZdLFxuXHQgICAgICAgIFswLCA0LCA3XSxcblx0ICAgICAgICBbMCwgNCwgNl0sXG5cdCAgICAgICAgWzAsIDUsIDddLFxuXHQgICAgICAgIFswLCA1LCA2XVxuXHQgICAgXTtcblx0ICAgICRzY29wZS5zdGFydGJvdHRvbSA9IFtcblx0ICAgICAgICBbMCwgNSwgMF0sXG5cdCAgICAgICAgWzAsIDUsIDFdLFxuXHQgICAgICAgIFsxLCA1LCAwXSxcblx0ICAgICAgICBbMSwgNSwgMV0sXG5cdCAgICAgICAgWzIsIDUsIDBdLFxuXHQgICAgICAgIFsyLCA1LCAxXSxcblx0ICAgICAgICBbMywgNSwgMF0sXG5cdCAgICAgICAgWzMsIDUsIDFdLFxuXHQgICAgICAgIFs0LCA1LCAwXSxcblx0ICAgICAgICBbNCwgNSwgMV0sXG5cdCAgICAgICAgWzUsIDUsIDBdLFxuXHQgICAgICAgIFs1LCA1LCAxXVxuXHQgICAgXTtcblx0ICAgICRzY29wZS5zdGFydHJpZ2h0ID0gW1xuXHQgICAgICAgIFs1LCAwLCAyXSxcblx0ICAgICAgICBbNSwgMCwgM10sXG5cdCAgICAgICAgWzUsIDEsIDJdLFxuXHQgICAgICAgIFs1LCAxLCAzXSxcblx0ICAgICAgICBbNSwgMiwgMl0sXG5cdCAgICAgICAgWzUsIDIsIDNdLFxuXHQgICAgICAgIFs1LCAzLCAyXSxcblx0ICAgICAgICBbNSwgMywgM10sXG5cdCAgICAgICAgWzUsIDQsIDJdLFxuXHQgICAgICAgIFs1LCA0LCAzXSxcblx0ICAgICAgICBbNSwgNSwgMl0sXG5cdCAgICAgICAgWzUsIDUsIDNdXG5cdCAgICBdO1xufSk7XG4iLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2dhbWVsaXN0Jywge1xuICAgICAgICB1cmw6ICcvZ2FtZWxpc3QnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9icm93c2VyL2pzL2dhbWVsaXN0L2dhbWVsaXN0Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnZ2FtZUxpc3QnLFxuICAgIH0pO1xufSk7XG5cbnRzdXJvLmNvbnRyb2xsZXIoJ2dhbWVMaXN0JywgZnVuY3Rpb24gKCRzY29wZSwgZmlyZWJhc2VVcmwsICRmaXJlYmFzZU9iamVjdCwgJHN0YXRlLCAkZmlyZWJhc2VBdXRoLCAkZmlyZWJhc2VBcnJheSkge1xuICAgIC8vRm9yIHN5bmNocm9uaXppbmdHYW1lTGlzdC4uLlxuICAgIHZhciByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xuICAgIHZhciBvYmogPSAkZmlyZWJhc2VPYmplY3QocmVmKTtcblxuICAgIHZhciBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuICAgIHZhciBmaXJlYmFzZVVzZXIgPSBhdXRoLiRnZXRBdXRoKCk7XG5cbiAgICB2YXIgc3luY2hSZWYgPSByZWYuY2hpbGQoXCJnYW1lc1wiKTtcbiAgICB2YXIgc3luY2hyb25pemVkT2JqID0gJGZpcmViYXNlT2JqZWN0KHN5bmNoUmVmKTtcblxuICAgIC8vIFRoaXMgcmV0dXJucyBhIHByb21pc2UuLi55b3UgY2FuLnRoZW4oKSBhbmQgYXNzaWduIHZhbHVlIHRvICRzY29wZS52YXJpYWJsZVxuICAgIC8vIGdhbWVsaXN0IGlzIHdoYXRldmVyIHdlIGFyZSBjYWxsaW5nIGl0IGluIHRoZSBhbmd1bGFyIGh0bWwuXG4gICAgc3luY2hyb25pemVkT2JqLiRiaW5kVG8oJHNjb3BlLCBcImdhbWVsaXN0XCIpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBnYW1lbGlzdCA9IFtdXG4gICAgICAgICAgICBmb3IgKHZhciBpIGluICRzY29wZS5nYW1lbGlzdCkge1xuICAgICAgICAgICAgICAgIGdhbWVsaXN0LnB1c2goW2ksICRzY29wZS5nYW1lbGlzdFtpXV0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkc2NvcGUuZ2FtZU5hbWVzID0gZ2FtZWxpc3Quc2xpY2UoMik7XG4gICAgICAgIH0pXG5cblxuICAgICRzY29wZS5qb2luID0gZnVuY3Rpb24gKGdhbWVOYW1lKSB7XG4gICAgICAgIHZhciBnYW1lTmFtZVJlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZChnYW1lTmFtZSk7XG4gICAgICAgIHZhciBwbGF5ZXJzUmVmID0gZ2FtZU5hbWVSZWYuY2hpbGQoJ3BsYXllcnMnKTtcblxuICAgICAgICB2YXIgcGxheWVyQXJyID0gJGZpcmViYXNlQXJyYXkocGxheWVyc1JlZik7XG4gICAgICAgIHBsYXllckFyci4kbG9hZGVkKClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFwbGF5ZXJzLmZpbHRlcihwbGF5ZXIgPT4gcGxheWVyLnVpZCA9PT0gZmlyZWJhc2VVc2VyLnVpZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld1BsYXllciA9IG5ldyBQbGF5ZXIoZmlyZWJhc2VVc2VyLnVpZClcbiAgICAgICAgICAgICAgICAgICAgJGZpcmViYXNlQXJyYXkocGxheWVyc1JlZikuJGFkZChuZXdQbGF5ZXIpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAkc3RhdGUuZ28oJ2dhbWUnLCB7XG4gICAgICAgICAgICBcImdhbWVOYW1lXCI6IGdhbWVOYW1lXG4gICAgICAgIH0pO1xuICAgIH07XG59KTtcbiIsInRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgncGlja0dhbWUnLCB7XG4gICAgICAgIHVybDogJy9waWNrZ2FtZScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2Jyb3dzZXIvanMvcGlja0dhbWUvcGlja0dhbWUuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdwaWNrR2FtZUN0cmwnXG4gICAgfSk7XG59KTtcblxudHN1cm8uY29udHJvbGxlcigncGlja0dhbWVDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlLCAkZmlyZWJhc2VBcnJheSwgJGZpcmViYXNlT2JqZWN0KSB7XG4gICAgdmFyIHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XG4gICAgdmFyIG9iaiA9ICRmaXJlYmFzZU9iamVjdChyZWYpXG5cblxuICAgICRzY29wZS5jcmVhdGVHYW1lID0gZnVuY3Rpb24gKGdhbWVOYW1lKSB7XG4gICAgICAgIHZhciBnYW1lTmFtZVJlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZChnYW1lTmFtZSk7XG4gICAgICAgIHZhciBwbGF5ZXJzUmVmID0gZ2FtZU5hbWVSZWYuY2hpbGQoJ3BsYXllcnMnKTtcblxuICAgICAgICAkZmlyZWJhc2VBcnJheShnYW1lTmFtZVJlZikuJGFkZCh7XG4gICAgICAgICAgICBcImdhbWVOYW1lXCI6IGdhbWVOYW1lXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZpcmViYXNlLmF1dGgoKS5vbkF1dGhTdGF0ZUNoYW5nZWQoZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5ld1BsYXllciA9IG5ldyBQbGF5ZXIodXNlci51aWQpXG4gICAgICAgICAgICAgICAgJGZpcmViYXNlQXJyYXkocGxheWVyc1JlZikuJGFkZChuZXdQbGF5ZXIpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibm8gb25lIGxvZ2dlZCBpblwiKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIG9iai4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgdmFyIHRpbGVzID0gZGF0YS50aWxlc1xuICAgICAgICAgICAgdmFyIGRlY2sgPSBuZXcgRGVjayh0aWxlcykuc2h1ZmZsZSgpLnRpbGVzO1xuICAgICAgICAgICAgdmFyIGluaXRpYWxEZWNrUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKGdhbWVOYW1lKS5jaGlsZCgnaW5pdGlhbERlY2snKTtcbiAgICAgICAgICAgICRmaXJlYmFzZUFycmF5KGluaXRpYWxEZWNrUmVmKS4kYWRkKGRlY2spO1xuICAgICAgICB9KVxuXG5cbiAgICAgICAgdmFyIGluaXRpYWxNYXJrZXJzUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKGdhbWVOYW1lKS5jaGlsZCgnYXZhaWxhYmxlTWFya2VycycpO1xuICAgICAgICAkZmlyZWJhc2VBcnJheShpbml0aWFsTWFya2Vyc1JlZikuJGFkZChbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJ5ZWxsb3dcIiwgXCJncmVlblwiLCBcImFxdWFcIiwgXCJibHVlXCIsIFwibmF2eVwiLCBcInB1cnBsZVwiXSk7XG5cblxuICAgICAgICAkc3RhdGUuZ28oJ2dhbWUnLCB7XG4gICAgICAgICAgICBcImdhbWVOYW1lXCI6IGdhbWVOYW1lXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAkc2NvcGUuZ29Ub0dhbWVMaXN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAkc3RhdGUuZ28oJ2dhbWVsaXN0Jyk7XG4gICAgfTtcbn0pO1xuIiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsb2dpbicsIHtcbiAgICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvYnJvd3Nlci9qcy9sb2dpbi9sb2dpbi5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2xvZ2luQ3RybCdcbiAgICB9KTtcbn0pO1xuXG50c3Vyby5jb250cm9sbGVyKCdsb2dpbkN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsICRmaXJlYmFzZUF1dGgsICRyb290U2NvcGUpIHtcbiAgICB2YXIgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcblxuICAgICRzY29wZS5sb2dJbldpdGhHb29nbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGF1dGguJHNpZ25JbldpdGhQb3B1cChcImdvb2dsZVwiKS50aGVuKGZ1bmN0aW9uIChhdXRoRGF0YSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJMb2dnZWQgaW4gYXM6XCIsIGF1dGhEYXRhKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuY3VycmVudFVzZXIgPSBhdXRoRGF0YTtcbiAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiQXV0aGVudGljYXRpb24gZmFpbGVkOlwiLCBlcnJvcik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRzdGF0ZS5nbygncGlja0dhbWUnKTtcbiAgICB9O1xuXG59KTtcbiIsIid1c2Ugc3RyaWN0J1xuXG5mdW5jdGlvbiBQbGF5ZXIodWlkKSB7XG4gICAgLy8gVE9ETzogZ2V0IHVpZCBmcm9tIGZpcmViYXNlIGF1dGhcbiAgICB0aGlzLnVpZCA9IHVpZDtcblxuICAgIHRoaXMubWFya2VyID0gXCJuXCI7XG5cbiAgICAvLyBzaG91bGQgYmUgYSBQb2ludCBvYmplY3RcbiAgICB0aGlzLnBvaW50ID0gXCJuXCI7XG5cbiAgICAvLyBbeCwgeV1cbiAgICAvLyBkZXBlbmRzIG9uIHRoZSBhbmd1bGFyIFNwYWNlLngsIFNwYWNlLnlcbiAgICB0aGlzLm5leHRTcGFjZSA9IFwiblwiO1xuXG4gICAgLy8gaW4gZWFjaCBTcGFjZS5wb2ludHMgYXJyYXksIGZpbmQgdGhpcyBzcGVjaWZpYyBwb2ludCBhbmQgZ2V0IHRoZSBwb3NpdGlvbiAoaW50ZWdlcikgaW5zaWRlIHRoaXMgc3BhY2UuXG4gICAgdGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9IFwiblwiO1xuXG4gICAgLy8gbWF4aW11biAzIHRpbGVzXG4gICAgdGhpcy50aWxlcyA9ICduJztcblxuICAgIC8vIGlmIGEgcGxheWVyIGRpZXMsIGl0IHdpbGwgYmUgY2hhbmdlZCB0byBmYWxzZVxuICAgIHRoaXMuY2FuUGxheSA9IHRydWU7XG59XG5cblBsYXllci5wcm90b3R5cGUucGxhY2VNYXJrZXIgPSBmdW5jdGlvbiAoYm9hcmQsIHBvaW50KSB7XG4gICAgLy8gcG9pbnQgbG9va3MgbGlrZSBbeCwgeSwgcG9pbnRzSW5kZXhdIGluIHRoZSBzcGFjZVxuICAgIHZhciB4ID0gcG9pbnRbMF07XG4gICAgdmFyIHkgPSBwb2ludFsxXTtcbiAgICB2YXIgcG9pbnRzSW5kZXggPSBwb2ludFsyXTtcblxuICAgIHRoaXMucG9pbnQgPSBib2FyZFt5XVt4XS5wb2ludHNbcG9pbnRzSW5kZXhdO1xuICAgIHRoaXMucG9pbnQudHJhdmVsbGVkID0gdHJ1ZTtcblxuICAgIC8vW3gsIHldIGZyb20gdGhlIHBvaW50XG4gICAgdGhpcy5uZXh0U3BhY2UgPSBib2FyZFt5XVt4XTtcblxuICAgIC8vIGluIGVhY2ggU3BhY2UucG9pbnRzIGFycmF5LCBmaW5kIHRoaXMgc3BlY2lmaWMgcG9pbnQgYW5kIGdldCB0aGUgcG9zaXRpb24gKGludGVnZXIpIGluc2lkZSB0aGlzIHNwYWNlLlxuICAgIHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPSB0aGlzLm5leHRTcGFjZS5wb2ludHMuaW5kZXhPZih0aGlzLnBvaW50KTtcbn07XG5cblBsYXllci5wcm90b3R5cGUubmV3U3BhY2UgPSBmdW5jdGlvbiAoYm9hcmQsIG9sZFNwYWNlKSB7XG4gICAgaWYgKHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDAgfHwgdGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gYm9hcmRbb2xkU3BhY2UueSAtIDFdW29sZFNwYWNlLnhdO1xuICAgIH0gZWxzZSBpZiAodGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gMiB8fCB0aGlzLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSAzKSB7XG4gICAgICAgIHJldHVybiBib2FyZFtvbGRTcGFjZS55XVtvbGRTcGFjZS54ICsgMV07XG4gICAgfSBlbHNlIGlmICh0aGlzLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSA0IHx8IHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDUpIHtcbiAgICAgICAgcmV0dXJuIGJvYXJkW29sZFNwYWNlLnkgKyAxXVtvbGRTcGFjZS54XTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYm9hcmRbb2xkU3BhY2UueV1bb2xkU3BhY2UueCAtIDFdO1xuICAgIH1cbn07XG5cblBsYXllci5wcm90b3R5cGUucGxhY2VUaWxlID0gZnVuY3Rpb24gKHRpbGUpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLnRpbGVzLmluZGV4T2YodGlsZSk7XG4gICAgdGhpcy50aWxlcy5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgdGhpcy5uZXh0U3BhY2UudGlsZVVybCA9IHRpbGUuaW1hZ2VVcmw7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRpbGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5uZXh0U3BhY2UucG9pbnRzW2ldLm5laWdoYm9ycy5wdXNoKHRoaXMubmV4dFNwYWNlLnBvaW50c1t0aWxlW2ldXSk7XG4gICAgfVxufTtcblxuUGxheWVyLnByb3RvdHlwZS5tb3ZlVG8gPSBmdW5jdGlvbiAocG9pbnRlcikge1xuICAgIC8vIGxldCBwb2ludGVyID0gcG9pbnRlcjtcblxuICAgIC8vYWx3YXlzIGJlIHJldHVybmluZyAwIG9yIDEgcG9pbnQgaW4gdGhlIGFycmF5XG4gICAgbGV0IG5leHRQb2ludCA9IHBvaW50ZXIubmVpZ2hib3JzLmZpbHRlcihmdW5jdGlvbiAobmVpZ2hib3IpIHtcbiAgICAgICAgcmV0dXJuICFuZWlnaGJvci50cmF2ZWxsZWQ7XG4gICAgfSlbMF07XG5cbiAgICByZXR1cm4gbmV4dFBvaW50O1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5rZWVwTW92aW5nID0gZnVuY3Rpb24gKCkge1xuICAgIGxldCBtb3ZhYmxlID0gdGhpcy5tb3ZlVG8odGhpcy5wb2ludCk7XG4gICAgd2hpbGUgKG1vdmFibGUpIHtcbiAgICAgICAgdGhpcy5wb2ludC50cmF2ZWxsZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnBvaW50ID0gdGhpcy5tb3ZlVG8odGhpcy5wb2ludCk7XG4gICAgICAgIGxldCBvbGRTcGFjZSA9IHRoaXMubmV4dFNwYWNlO1xuICAgICAgICBsZXQgbmV3U3BhY2UgPSBuZXdTcGFjZShvbGRTcGFjZSk7XG4gICAgICAgIHRoaXMubmV4dFNwYWNlID0gbmV3U3BhY2U7XG5cbiAgICAgICAgdGhpcy5jaGVja0RlYXRoKCk7XG4gICAgICAgIG1vdmFibGUgPSB0aGlzLm1vdmVUbyh0aGlzLnBvaW50KTtcbiAgICB9XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLmNoZWNrRGVhdGggPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFsbFRyYXZlbGxlZCA9IHRoaXMucG9pbnQubmVpZ2hib3JzLmZpbHRlcihmdW5jdGlvbiAobmVpZ2hib3IpIHtcbiAgICAgICAgcmV0dXJuIG5laWdoYm9yLnRyYXZlbGxlZDtcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLnBvaW50LmVkZ2UgfHwgYWxsVHJhdmVsbGVkLmxlbmd0aCA9PT0gMikgdGhpcy5kaWUoKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUuZGllID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY2FuUGxheSA9IGZhbHNlO1xuICAgIC8vIFRPRE86IG5lZWQgdG8gc2VuZCBhbiBhbGVydCBvciBtZXNzYWdlIHRvIHRoZSBwbGF5ZXIgd2hvIGp1c3QgZGllZC5cbn07XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
