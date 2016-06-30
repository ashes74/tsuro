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
    var deckArr = $firebaseArray(deckRef);

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
        console.log(players);
        players.$loaded().then(function (data) {
            console.log(data);
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
    };

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImdhbWUvYm9hcmQuanMiLCJnYW1lL2RlY2suanMiLCJnYW1lL2dhbWUuY29udHJ1Y3Rvci5qcyIsImdhbWUvZ2FtZS5qcyIsImdhbWVsaXN0L2dhbWVsaXN0LmpzIiwibG9naW4vbG9naW4uanMiLCJwaWNrR2FtZS9waWNrR2FtZS5qcyIsInBsYXllci9wbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBQSxRQUFBLFFBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTs7QUFFQSxNQUFBLE1BQUEsQ0FBQSxZQUFBO0FBQ0EsUUFBQSxTQUFBO0FBQ0EsZ0JBQUEseUNBREE7QUFFQSxvQkFBQSxzQ0FGQTtBQUdBLHFCQUFBLDZDQUhBO0FBSUEsdUJBQUE7QUFKQSxLQUFBO0FBTUEsYUFBQSxhQUFBLENBQUEsTUFBQTtBQUNBLENBUkE7O0FBVUEsTUFBQSxRQUFBLENBQUEsYUFBQSxFQUFBLDRDQUFBOztBQUVBLE1BQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQTtBQUNBLHVCQUFBLFNBQUEsQ0FBQSxHQUFBO0FBQ0EsQ0FGQTs7QUNkQSxTQUFBLEtBQUEsR0FBQTtBQUNBLFNBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQTs7QUFFQSxNQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBO0FBQ0E7QUFDQSxXQUFBLEtBQUEsS0FBQTtBQUNBLENBUkE7O0FBVUEsU0FBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEVBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLFNBQUEsS0FBQSxHQUFBLElBQUE7QUFDQSxTQUFBLE1BQUEsR0FBQSxDQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBQUE7QUFDQSxTQUFBLE9BQUE7QUFDQSxTQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxzQkFBQTs7QUFFQSxZQUFBLElBQUEsQ0FBQSxFQUFBOztBQUNBLDRCQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLEM7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FDQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsTUFBQSxJQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLFNBSkEsTUFJQSxJQUFBLElBQUEsQ0FBQSxFQUFBOztBQUNBLGdCQUFBLE1BQUEsQ0FBQSxFQUFBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxLQUNBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxTQUhBLE1BR0EsSUFBQSxJQUFBLENBQUEsRUFBQTs7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FDQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsU0FIQSxNQUdBOztBQUNBLDRCQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLEM7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FDQTtBQUNBLHFCQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsTUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFJQSxTQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxTQUFBLElBQUEsR0FBQSxJQUFBO0FBQ0EsU0FBQSxTQUFBLEdBQUEsRUFBQTtBQUNBLFNBQUEsU0FBQSxHQUFBLEtBQUE7QUFDQTs7QUNqREE7O0lBRUEsSTtBQUNBLGtCQUFBLEtBQUEsRUFBQTtBQUFBOztBQUNBLGFBQUEsS0FBQSxHQUFBLEtBQUE7QUFDQTs7OztrQ0FFQTtBQUNBLGlCQUFBLEtBQUEsR0FBQSxFQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBLG1CQUFBLElBQUE7QUFDQTs7O29DQUVBO0FBQ0EsbUJBQUEsS0FBQSxLQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7QUFDQTs7OzZCQUVBLEcsRUFBQTtBQUNBLG1CQUFBLEtBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxDQUFBO0FBQ0E7OzsrQkFFQSxLLEVBQUE7QUFDQSxpQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLEtBQUE7QUFDQSxtQkFBQSxJQUFBO0FBQ0E7Ozs7OztBQ3ZCQTs7OztJQUlBLEk7QUFDQSxrQkFBQSxJQUFBLEVBQUE7QUFBQTs7QUFDQSxhQUFBLElBQUEsR0FBQSxJQUFBO0FBQ0EsYUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsS0FBQSxHQUFBLElBQUEsS0FBQSxHQUFBLFNBQUEsRUFBQTtBQUNBLGFBQUEsT0FBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLGdCQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsUUFBQSxFQUFBLFFBQUEsRUFBQSxPQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsUUFBQSxDQUFBOztBQUVBLGFBQUEsVUFBQSxDO0FBQ0EsYUFBQSxjQUFBLEdBQUEsRUFBQSxDO0FBQ0EsYUFBQSxNQUFBLEdBQUEsRUFBQSxDO0FBQ0EsYUFBQSxLQUFBO0FBQ0E7Ozs7MkNBRUE7QUFDQSxnQkFBQSxLQUFBLFVBQUEsS0FBQSxDQUFBLENBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsY0FBQSxDQUFBLEtBQUEsVUFBQSxDQUFBO0FBQ0E7Ozt5Q0FFQTtBQUNBLGlCQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxNQUFBO0FBQUEsdUJBQUEsT0FBQSxVQUFBLEVBQUE7QUFBQSxhQUFBO0FBQ0E7OztzQ0FDQTtBQUNBLGdCQUFBLG1CQUFBLEVBQUE7QUFDQSxpQkFBQSxPQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0Esb0JBQUEsQ0FBQSxPQUFBLE9BQUEsSUFBQSxPQUFBLEtBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EscUNBQUEsSUFBQSxDQUFBLE9BQUEsS0FBQTtBQUNBLG1DQUFBLElBQUE7QUFDQTtBQUNBLGFBTEE7QUFNQSxtQkFBQSxnQkFBQTtBQUNBOzs7b0NBRUE7QUFDQSxtQkFBQSxhQUFBLE1BQUEsSUFBQSxDQUFBO0FBQ0E7Ozs7Ozt5Q0FHQTtBQUNBLGdCQUFBLFdBQUEsS0FBQSxjQUFBLEVBQUEsTUFBQSxHQUFBLENBQUEsRUFBQTtBQUNBLG9CQUFBLFNBQUEsS0FBQSxVQUFBLEdBQUEsQ0FBQTtBQUNBLHVCQUFBLENBQUEsS0FBQSxjQUFBLENBQUEsU0FBQSxDQUFBLEVBQUEsT0FBQSxFQUFBO0FBQ0E7QUFDQTtBQUNBLHFCQUFBLFVBQUEsR0FBQSxNQUFBO0FBQ0EsYUFOQSxNQU1BO0FBQ0Es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QSxnQkFBQSxFQUFBOzs7Ozs7QUFNQSxXQUFBLE1BQUE7QUFDQSxRQUFBLHdCQUFBLEVBQUE7O0FBR0EsV0FBQSxLQUFBLEdBQUEsWUFBQTs7QUFFQSxLQUZBOztBQUlBLFdBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxlQUFBLEVBQUEsS0FBQSxPQUFBLGFBQUE7QUFDQSxLQUZBOzs7QUFLQSxXQUFBLFlBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGdCQUFBLEdBQUEsQ0FBQSxpQkFBQTtBQUNBLGFBQUEsUUFBQTtBQUNBLFlBQUEsS0FBQSxRQUFBLEtBQUEsQ0FBQSxFQUFBLEtBQUEsUUFBQSxHQUFBLENBQUE7QUFDQSxLQUpBOztBQU1BLFdBQUEsYUFBQSxHQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsYUFBQSxRQUFBO0FBQ0EsWUFBQSxLQUFBLFFBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxLQUFBLFFBQUEsR0FBQSxDQUFBO0FBQ0EsS0FIQTs7OztBQU9BLFdBQUEsU0FBQSxHQUFBLFVBQUEsSUFBQSxFQUFBOztBQUVBLFlBQUEsS0FBQSxRQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxHQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQTtBQUNBLHVCQUFBLGFBQUEsQ0FBQTtBQUNBLGFBRkEsQ0FBQTtBQUdBLGlCQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxTQU5BLE1BTUEsSUFBQSxLQUFBLFFBQUEsR0FBQSxDQUFBLEVBQUE7QUFDQSxpQkFBQSxLQUFBLEdBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsVUFBQSxFQUFBO0FBQ0EsdUJBQUEsYUFBQSxDQUFBO0FBQ0EsYUFGQSxDQUFBO0FBR0EsaUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxpQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLEtBQUEsRUFBQTtBQUNBOztBQUVBLGVBQUEsRUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBO0FBQ0EsZ0JBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxJQUFBLENBQUE7QUFDQSxvQkFBQSxXQURBO0FBRUEsb0JBQUE7QUFGQSxTQUFBOztBQUtBLGVBQUEsSUFBQSxDQUFBLGNBQUE7O0FBRUEsWUFBQSxPQUFBLElBQUEsQ0FBQSxTQUFBLEVBQUEsRUFBQTs7QUFFQSxtQkFBQSxNQUFBLEdBQUEsT0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLG1CQUFBLFFBQUEsR0FBQSxJQUFBO0FBQ0EsU0FKQSxNQUlBOztBQUVBLGdCQUFBLE9BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxNQUFBLEVBQUE7QUFDQSx1QkFBQSxNQUFBLEdBQUEsT0FBQSxFQUFBO0FBQ0EsYUFGQSxNQUVBLElBQUEsT0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsS0FBQSxDQUFBLElBQUEsT0FBQSxNQUFBLEVBQUE7QUFDQSxzQ0FBQSxJQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsYUFGQSxNQUVBOztBQUVBLHVCQUFBLEVBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBOztBQUVBLG9CQUFBLE9BQUEsSUFBQSxDQUFBLFdBQUEsR0FBQSxNQUFBLEVBQUE7O0FBRUEsMkJBQUEsSUFBQSxDQUFBLFdBQUEsR0FBQSxPQUFBLENBQUEsVUFBQSxlQUFBLEVBQUE7QUFDQSx3Q0FBQSxPQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxtQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0EseUJBRkE7QUFHQSxxQkFKQTtBQUtBLDJCQUFBLElBQUEsQ0FBQSxJQUFBLEdBQUEsT0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsRUFBQTs7QUFFQSw0QkFBQSxLQUFBLENBQUEsT0FBQSxFQUFBLElBQUEsQ0FBQTtBQUNBLGdDQUFBLFlBREE7QUFFQSxzQ0FBQSxPQUFBLElBQUEsQ0FBQTtBQUZBLHFCQUFBO0FBSUEsd0JBQUEsT0FBQSxNQUFBLEVBQUE7QUFDQSwrQkFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLCtCQUFBLE1BQUEsR0FBQSxJQUFBOztBQUVBLCtCQUFBLE9BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLElBQUEsT0FBQSxxQkFBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLG1DQUFBLHFCQUFBLENBQUEsS0FBQSxHQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLDRCQUFBLE9BQUEscUJBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxtQ0FBQSxNQUFBLEdBQUEsT0FBQSxxQkFBQSxDQUFBLEtBQUEsRUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0EsbUJBQUEsSUFBQSxDQUFBLGNBQUE7QUFDQTtBQUNBLEtBbkVBOzs7QUFzRUEsV0FBQSxTQUFBOzs7QUFHQSxXQUFBLEtBQUEsR0FBQSxZQUFBO0FBQ0EsbUJBQUEsT0FBQSxDQUFBLENBQUEsRUFDQSxJQURBLENBQ0EsVUFBQSxHQUFBLEVBQUE7QUFDQSxvQkFBQSxHQUFBLENBQUEscUJBQUEsRUFBQSxJQUFBLEdBQUE7QUFDQSxTQUhBOztBQUtBLGdCQUFBLE9BQUEsQ0FBQSxDQUFBLEVBQ0EsSUFEQSxDQUNBLFVBQUEsR0FBQSxFQUFBO0FBQ0Esb0JBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxHQUFBO0FBQ0EsU0FIQTs7QUFLQSxZQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxnQkFBQSxRQUFBLEtBQUEsS0FBQTtBQUNBLGdCQUFBLE9BQUEsSUFBQSxJQUFBLENBQUEsS0FBQSxFQUFBLE9BQUEsR0FBQSxLQUFBO0FBQ0EsZ0JBQUEsaUJBQUEsSUFBQSxLQUFBLENBQUEsT0FBQSxFQUFBLEtBQUEsQ0FBQSxhQUFBLFFBQUEsRUFBQSxLQUFBLENBQUEsYUFBQSxDQUFBO0FBQ0EsMkJBQUEsY0FBQSxFQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0EsU0FMQTs7QUFTQSxZQUFBLG9CQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxLQUFBLENBQUEsYUFBQSxRQUFBLEVBQUEsS0FBQSxDQUFBLGtCQUFBLENBQUE7QUFDQSx1QkFBQSxpQkFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsUUFBQSxFQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxRQUFBLENBQUE7O0FBR0EsWUFBQSxVQUFBLGVBQUEsVUFBQSxDQUFBO0FBQ0EsZ0JBQUEsR0FBQSxDQUFBLE9BQUE7QUFDQSxnQkFBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0Esb0JBQUEsR0FBQSxDQUFBLElBQUE7QUFDQSxpQkFBQSxJQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsS0FBQSxNQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxFQUFBLE9BQUEsR0FBQSxJQUFBO0FBQ0EscUJBQUEsQ0FBQSxFQUFBLE1BQUEsR0FBQSxHQUFBO0FBQ0EscUJBQUEsQ0FBQSxFQUFBLFNBQUEsR0FBQSxHQUFBO0FBQ0EscUJBQUEsQ0FBQSxFQUFBLG9CQUFBLEdBQUEsR0FBQTtBQUNBLHFCQUFBLENBQUEsRUFBQSxLQUFBLEdBQUEsR0FBQTtBQUNBLHFCQUFBLENBQUEsRUFBQSxLQUFBLEdBQUEsR0FBQTtBQUNBLHdCQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQSxTQVhBO0FBYUEsS0F2Q0E7O0FBMENBLFdBQUEsUUFBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBLEVBSUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FKQSxFQUtBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQU5BLEVBT0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FQQSxFQVFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUkEsRUFTQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVRBLEVBVUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FWQSxFQVdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWEEsRUFZQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVpBLENBQUE7QUFjQSxXQUFBLFNBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBLEVBR0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQSxFQUlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSkEsRUFLQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUxBLEVBTUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FOQSxFQU9BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUEEsRUFRQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVJBLEVBU0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FUQSxFQVVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVkEsRUFXQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVhBLEVBWUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FaQSxDQUFBO0FBY0EsV0FBQSxXQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQURBLEVBRUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQSxFQUdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEEsRUFJQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUpBLEVBS0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FMQSxFQU1BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTkEsRUFPQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVBBLEVBUUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FSQSxFQVNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVEEsRUFVQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVZBLEVBV0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FYQSxFQVlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWkEsQ0FBQTtBQWNBLFdBQUEsVUFBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBLEVBSUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FKQSxFQUtBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQU5BLEVBT0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FQQSxFQVFB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QUEsQ0FBQSxRQUFBLEVBQUEsS0FBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLDJCQUFBLGNBQUEsRUFBQSxJQUFBLENBQUEsSUFBQTtBQUNBLFNBTEE7O0FBUUEsWUFBQSxvQkFBQSxJQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsS0FBQSxDQUFBLFFBQUEsRUFBQSxLQUFBLENBQUEsa0JBQUEsQ0FBQTtBQUNBLHVCQUFBLGlCQUFBLEVBQUEsSUFBQSxDQUFBLENBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxRQUFBLEVBQUEsT0FBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLFFBQUEsQ0FBQTs7QUFHQSxlQUFBLEVBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSx3QkFBQTtBQURBLFNBQUE7QUFHQSxLQWhDQTs7QUFrQ0EsV0FBQSxZQUFBLEdBQUEsWUFBQTtBQUNBLGVBQUEsRUFBQSxDQUFBLFVBQUE7QUFDQSxLQUZBO0FBR0EsQ0ExQ0E7O0FDUkE7O0FBRUEsU0FBQSxNQUFBLENBQUEsR0FBQSxFQUFBOztBQUVBLFNBQUEsR0FBQSxHQUFBLEdBQUE7O0FBRUEsU0FBQSxNQUFBLEdBQUEsR0FBQTs7O0FBR0EsU0FBQSxLQUFBLEdBQUEsR0FBQTs7OztBQUlBLFNBQUEsU0FBQSxHQUFBLEdBQUE7OztBQUdBLFNBQUEsb0JBQUEsR0FBQSxHQUFBOzs7QUFHQSxTQUFBLEtBQUEsR0FBQSxHQUFBOzs7QUFHQSxTQUFBLE9BQUEsR0FBQSxJQUFBO0FBQ0E7O0FBRUEsT0FBQSxTQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQTs7QUFFQSxRQUFBLElBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLElBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLGNBQUEsTUFBQSxDQUFBLENBQUE7O0FBRUEsU0FBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxTQUFBLEtBQUEsQ0FBQSxTQUFBLEdBQUEsSUFBQTs7O0FBR0EsU0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBOzs7QUFHQSxTQUFBLG9CQUFBLEdBQUEsS0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBLENBZEE7O0FBZ0JBLE9BQUEsU0FBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUE7QUFDQSxRQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsRUFBQTtBQUNBLGVBQUEsTUFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLENBQUE7QUFDQSxLQUZBLE1BRUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLEVBQUE7QUFDQSxlQUFBLE1BQUEsU0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsS0FGQSxNQUVBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxFQUFBO0FBQ0EsZUFBQSxNQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtBQUNBLEtBRkEsTUFFQTtBQUNBLGVBQUEsTUFBQSxTQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLENBVkE7O0FBWUEsT0FBQSxTQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsUUFBQSxRQUFBLEtBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7O0FBRUEsU0FBQSxTQUFBLENBQUEsT0FBQSxHQUFBLEtBQUEsUUFBQTs7QUFFQSxTQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxLQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLENBVEE7O0FBV0EsT0FBQSxTQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsT0FBQSxFQUFBOzs7O0FBSUEsUUFBQSxZQUFBLFFBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGVBQUEsQ0FBQSxTQUFBLFNBQUE7QUFDQSxLQUZBLEVBRUEsQ0FGQSxDQUFBOztBQUlBLFdBQUEsU0FBQTtBQUNBLENBVEE7O0FBV0EsT0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLFVBQUEsS0FBQSxNQUFBLENBQUEsS0FBQSxLQUFBLENBQUE7QUFDQSxXQUFBLE9BQUEsRUFBQTtBQUNBLGFBQUEsS0FBQSxDQUFBLFNBQUEsR0FBQSxJQUFBO0FBQ0EsYUFBQSxLQUFBLEdBQUEsS0FBQSxNQUFBLENBQUEsS0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLFdBQUEsS0FBQSxTQUFBO0FBQ0EsWUFBQSxXQUFBLFNBQUEsUUFBQSxDQUFBO0FBQ0EsYUFBQSxTQUFBLEdBQUEsUUFBQTs7QUFFQSxhQUFBLFVBQUE7QUFDQSxrQkFBQSxLQUFBLE1BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBO0FBQ0EsQ0FaQTs7QUFjQSxPQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsZUFBQSxLQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsZUFBQSxTQUFBLFNBQUE7QUFDQSxLQUZBLENBQUE7O0FBSUEsUUFBQSxLQUFBLEtBQUEsQ0FBQSxJQUFBLElBQUEsYUFBQSxNQUFBLEtBQUEsQ0FBQSxFQUFBLEtBQUEsR0FBQTtBQUNBLENBTkE7O0FBUUEsT0FBQSxTQUFBLENBQUEsR0FBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLE9BQUEsR0FBQSxLQUFBOztBQUVBLENBSEEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciB0c3VybyA9IGFuZ3VsYXIubW9kdWxlKCdUc3VybycsIFsndWkucm91dGVyJywgJ2ZpcmViYXNlJ10pO1xuXG50c3Vyby5jb25maWcoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB7XG4gICAgICAgIGFwaUtleTogXCJBSXphU3lDTG0zamtrNXBwTXFlUXhLb0gtZFo5Q2RZTWFER1dXcVVcIixcbiAgICAgICAgYXV0aERvbWFpbjogXCJ0aGUtcGF0aHMtb2YtZHJhZ29ucy5maXJlYmFzZWFwcC5jb21cIixcbiAgICAgICAgZGF0YWJhc2VVUkw6IFwiaHR0cHM6Ly90aGUtcGF0aHMtb2YtZHJhZ29ucy5maXJlYmFzZWlvLmNvbVwiLFxuICAgICAgICBzdG9yYWdlQnVja2V0OiBcInRoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tXCIsXG4gICAgfTtcbiAgICBmaXJlYmFzZS5pbml0aWFsaXplQXBwKGNvbmZpZyk7XG59KTtcblxudHN1cm8uY29uc3RhbnQoJ2ZpcmViYXNlVXJsJywgJ2h0dHBzOi8vcGF0aC1vZi10aGUtZHJhZ29uLmZpcmViYXNlaW8uY29tLycpO1xuXG50c3Vyby5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbn0pO1xuIiwiZnVuY3Rpb24gQm9hcmQoKSB7XG4gICAgdGhpcy5ib2FyZCA9IFtdO1xufVxuXG5Cb2FyZC5wcm90b3R5cGUuZHJhd0JvYXJkID0gZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgNjsgeSsrKSB7XG4gICAgICAgIGlmICghdGhpcy5ib2FyZFt5XSkgdGhpcy5ib2FyZFt5XSA9IFtdO1xuICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IDY7IHgrKykge1xuICAgICAgICAgICAgdGhpcy5ib2FyZFt5XS5wdXNoKG5ldyBTcGFjZSh4LCB5LCB0aGlzLmJvYXJkKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYm9hcmQ7XG59XG5cbmZ1bmN0aW9uIFNwYWNlKHgsIHksIGJvYXJkKSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICAgIHRoaXMuaW1hZ2UgPSBudWxsO1xuICAgIHRoaXMucG9pbnRzID0gW251bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGxdO1xuICAgIHRoaXMudGlsZVVybDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICBsZXQgY29ycmVzcG9uZGluZztcblxuICAgICAgICBpZiAoaSA8IDIpIHsgLy90b3BcbiAgICAgICAgICAgIGNvcnJlc3BvbmRpbmcgPSBpID09PSAwID8gNSA6IDQ7IC8vIDAgLT4gNSAmIDEgLT4gNFxuICAgICAgICAgICAgaWYgKHkgPT09IDApIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KHRydWUpO1xuICAgICAgICAgICAgZWxzZSB0aGlzLnBvaW50c1tpXSA9IGJvYXJkW3kgLSAxXVt4XS5wb2ludHNbY29ycmVzcG9uZGluZ107XG4gICAgICAgIH0gZWxzZSBpZiAoaSA8IDQpIHsgLy9yaWdodFxuICAgICAgICAgICAgaWYgKHggPT09IDUpIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KHRydWUpO1xuICAgICAgICAgICAgZWxzZSB0aGlzLnBvaW50c1tpXSA9IG5ldyBQb2ludChmYWxzZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaSA8IDYpIHsgLy9ib3R0b21cbiAgICAgICAgICAgIGlmICh5ID09PSA1KSB0aGlzLnBvaW50c1tpXSA9IG5ldyBQb2ludCh0cnVlKTtcbiAgICAgICAgICAgIGVsc2UgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQoZmFsc2UpO1xuICAgICAgICB9IGVsc2UgeyAvL2xlZnRcbiAgICAgICAgICAgIGNvcnJlc3BvbmRpbmcgPSBpID09PSA2ID8gMyA6IDI7IC8vIDYgLT4gMyAmIDcgLT4gMlxuICAgICAgICAgICAgaWYgKHggPT09IDApIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KHRydWUpO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb2ludHNbaV0gPSBib2FyZFt5XVt4IC0gMV0ucG9pbnRzW2NvcnJlc3BvbmRpbmddO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5cbi8vIGVkZ2UgPSBib29sZWFuXG5mdW5jdGlvbiBQb2ludChlZGdlKSB7XG4gICAgdGhpcy5lZGdlID0gZWRnZTtcbiAgICB0aGlzLm5laWdoYm9ycyA9IFtdO1xuICAgIHRoaXMudHJhdmVsbGVkID0gZmFsc2U7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmNsYXNzIERlY2sge1xuICAgIGNvbnN0cnVjdG9yKHRpbGVzKSB7XG4gICAgICAgIHRoaXMudGlsZXMgPSB0aWxlc1xuICAgIH1cblxuICAgIHNodWZmbGUoKSB7XG4gICAgICAgIHRoaXMudGlsZXMgPSBfLnNodWZmbGUodGhpcy50aWxlcylcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZGVhbFRocmVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlcy5zcGxpY2UoMCwgMyk7XG4gICAgfVxuXG4gICAgZGVhbChudW0pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZXMuc3BsaWNlKDAsIG51bSk7XG4gICAgfVxuXG4gICAgcmVsb2FkKHRpbGVzKSB7XG4gICAgICAgIHRoaXMudGlsZXMucHVzaCh0aWxlcylcbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vR0FNRS8vL1xuXG5jbGFzcyBHYW1lIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuY291bnQgPSAzNTtcbiAgICAgICAgdGhpcy5ib2FyZCA9IG5ldyBCb2FyZCgpLmRyYXdCb2FyZCgpO1xuICAgICAgICB0aGlzLnBsYXllcnMgPSBbXTtcbiAgICAgICAgdGhpcy5hdmFpbGFibGVNYXJrZXJzID0gW1wicmVkXCIsIFwib3JhbmdlXCIsIFwieWVsbG93XCIsIFwiZ3JlZW5cIiwgXCJhcXVhXCIsIFwiYmx1ZVwiLCBcIm5hdnlcIiwgXCJwdXJwbGVcIl1cblxuICAgICAgICB0aGlzLmN1cnJQbGF5ZXI7IC8vaW5kZXggb2YgdGhlIGN1cnJlbnRQbGF5ZXIgaW4gdGhlIHR1cm5PcmRlckFycmF5XG4gICAgICAgIHRoaXMudHVybk9yZGVyQXJyYXkgPSBbXSAvL2hvbGRzIGFsbCB0aGUgcGxheWVycyBzdGlsbCBvbiB0aGUgYm9hcmQuXG4gICAgICAgIHRoaXMuZHJhZ29uID0gXCJcIjsgLy8gUGxheWVyLk1hcmtlclxuICAgICAgICB0aGlzLm1vdmVzO1xuICAgIH1cblxuICAgIGdldEN1cnJlbnRQbGF5ZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJQbGF5ZXIgPT09IC0xKSByZXR1cm47XG4gICAgICAgIHJldHVybiB0aGlzLnR1cm5PcmRlckFycmF5W3RoaXMuY3VyclBsYXllcl07XG4gICAgfTtcblxuICAgIG1vdmVBbGxQbGF5ZXJzKCkge1xuICAgICAgICB0aGlzLnBsYXllcnMuZm9yRWFjaCgocGxheWVyKSA9PiBwbGF5ZXIua2VlcE1vdmluZygpKVxuICAgIH07XG4gICAgZGVhZFBsYXllcnMoKSB7XG4gICAgICAgIHZhciBkZWFkUGxheWVyc1RpbGVzID0gW107XG4gICAgICAgIHRoaXMucGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICAgICAgIGlmICghcGxheWVyLmNhblBsYXkgJiYgcGxheWVyLnRpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBkZWFkUGxheWVyc1RpbGVzLnB1c2gocGxheWVyLnRpbGVzKTtcbiAgICAgICAgICAgICAgICBpc0RlYWRQbGF5ZXIgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGRlYWRQbGF5ZXJzVGlsZXM7XG4gICAgfTtcblxuICAgIGNoZWNrT3ZlcigpIHtcbiAgICAgICAgcmV0dXJuIGdldENhblBsYXkoKS5sZW5ndGggPD0gMTtcbiAgICB9XG5cbiAgICAvL3RvIGJlIGNhbGxlZCBhdCB0aGUgZW5kIG9mIGEgdHVybiB0byBzZXQgdGhlIGN1cnJQbGF5ZXIgdG8gdGhlIG5leHQgZWxpZ2libGUgcGxheWVyIGluIHRoZSB0dXJuT3JkZXJBcnJheVxuICAgIGdvVG9OZXh0UGxheWVyKCkge1xuICAgICAgICBpZiAoZ2V0Q2FuUGxheSh0aGlzLnR1cm5PcmRlckFycmF5KS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBsZXQgbmV3SWR4ID0gdGhpcy5jdXJyUGxheWVyICsgMTtcbiAgICAgICAgICAgIHdoaWxlICghdGhpcy50dXJuT3JkZXJBcnJheVtuZXdJZHggJSA4XS5jYW5QbGF5KSB7XG4gICAgICAgICAgICAgICAgbmV3SWR4Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmN1cnJQbGF5ZXIgPSBuZXdJZHg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJQbGF5ZXIgPSAtMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5nZXRDdXJyZW50UGxheWVyKCk7XG4gICAgfTtcblxuICAgIC8vcmVzdGFydCB0aGUgZ2FtZVxuICAgIHJlc2V0KCkge1xuICAgICAgICB0aGlzLnBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgICAgICAgLy9yZXRyaWV2ZSBhbGwgdGlsZXNcbiAgICAgICAgICAgIC8vcmV0dXJuIHBsYXllcidzIHRpbGVzIHRvIHRoZSBkZWNrIGFuZCBzaHVmZmxlXG4gICAgICAgICAgICB0aGlzLmRlY2sucmVsb2FkKHBsYXllci50aWxlcykuc2h1ZmZsZSgpO1xuICAgICAgICAgICAgcGxheWVyLnRpbGVzID0gW107XG4gICAgICAgICAgICAvL3Jlc2V0IGFsbCBwbGF5ZXJzIHBsYXlhYmlsaXR5XG4gICAgICAgICAgICBwbGF5ZXIuY2FuUGxheSA9IHRydWU7XG4gICAgICAgIH0pXG4gICAgfTtcblxufVxuXG4vLy8vL0VORCBPRiBHQU1FIENMQVNTLy8vLy9cblxuLy9nZXQgRWxpZ2libGUgcGxheWVyc1xubGV0IGdldENhblBsYXkgPSBmdW5jdGlvbiAocGxheWVycykge1xuICAgIHJldHVybiBwbGF5ZXJzLmZpbHRlcigocGxheWVyKSA9PiB7XG4gICAgICAgIHJldHVybiBwbGF5ZXIuY2FuUGxheVxuICAgIH0pXG59XG4iLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2dhbWUnLCB7XG4gICAgICAgIHVybDogJy9nYW1lLzpnYW1lTmFtZScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2Jyb3dzZXIvanMvZ2FtZS9nYW1lLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnZ2FtZUN0cmwnXG4gICAgfSk7XG59KTtcblxudHN1cm8uY29udHJvbGxlcignZ2FtZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkZmlyZWJhc2VBdXRoLCBmaXJlYmFzZVVybCwgJHN0YXRlUGFyYW1zLCAkZmlyZWJhc2VPYmplY3QsICRmaXJlYmFzZUFycmF5KSB7XG4gICAgdmFyIHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XG4gICAgdmFyIG9iaiA9ICRmaXJlYmFzZU9iamVjdChyZWYpO1xuXG5cbiAgICB2YXIgZ2FtZVJlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZCgkc3RhdGVQYXJhbXMuZ2FtZU5hbWUpO1xuICAgIHZhciBkZWNrUmVmID0gZ2FtZVJlZi5jaGlsZCgnaW5pdGlhbERlY2snKTtcbiAgICB2YXIgcGxheWVyc1JlZiA9IGdhbWVSZWYuY2hpbGQoJ3BsYXllcnMnKTtcbiAgICB2YXIgbWFya2Vyc1JlZiA9IGdhbWVSZWYuY2hpbGQoJ2F2YWlsYWJsZU1hcmtlcnMnKTtcbiAgICB2YXIgZGVja0FyciA9ICRmaXJlYmFzZUFycmF5KGRlY2tSZWYpO1xuXG5cbiAgICAvLyBpbnRpYWxpemUgZ2FtZVxuICAgICRzY29wZS5nYW1lID0gbmV3IEdhbWUoJHN0YXRlUGFyYW1zLmdhbWVOYW1lLCAkc3RhdGVQYXJhbXMuZGVjayk7XG4gICAgJHNjb3BlLmdhbWUuZGVjayA9ICRmaXJlYmFzZU9iamVjdChkZWNrUmVmKTtcblxuICAgIHZhciBtYXJrZXJzQXJyID0gJGZpcmViYXNlQXJyYXkobWFya2Vyc1JlZik7XG5cbiAgICBtYXJrZXJzQXJyLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICRzY29wZS5nYW1lLmF2YWlsYWJsZU1hcmtlcnMgPSBkYXRhWzBdO1xuICAgICAgICAkc2NvcGUuZ2FtZS5hdmFpbGFibGVNYXJrZXJzID0gJHNjb3BlLmdhbWUuYXZhaWxhYmxlTWFya2Vycy5maWx0ZXIoZnVuY3Rpb24gKGVsZW0pIHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgZWxlbSA9PT0gXCJzdHJpbmdcIjtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBtYXJrZXJzUmVmLm9uKCdjaGlsZF9jaGFuZ2VkJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgJHNjb3BlLmdhbWUuYXZhaWxhYmxlTWFya2VycyA9IGRhdGEudmFsKCk7XG4gICAgfSk7XG5cbiAgICBmaXJlYmFzZS5hdXRoKCkub25BdXRoU3RhdGVDaGFuZ2VkKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHZhciBmaXJlYmFzZVBsYXllcnNBcnIgPSAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKTtcblxuICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciBGQnBsYXllcnMgPSBkYXRhO1xuXG4gICAgICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgICAgIHZhciB1c2VyQXV0aElkID0gdXNlci51aWQ7XG4gICAgICAgICAgICAgICAgdmFyIG1lID0gRkJwbGF5ZXJzLmZpbHRlcihwbGF5ZXIgPT4gcGxheWVyLnVpZCA9PT0gdXNlckF1dGhJZClbMF07XG4gICAgICAgICAgICAgICAgaWYgKG1lKSAkc2NvcGUubWUgPSBtZTtcbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLm1lLm1hcmtlciA9PT0gXCJuXCIpICRzY29wZS5tZS5tYXJrZXIgPSBudWxsO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBObyB1c2VyIGlzIHNpZ25lZCBpbi5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIm5vdGhpbmdcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgJHNjb3BlLnBpY2tNYXJrZXIgPSBmdW5jdGlvbiAoYm9hcmQsIG1hcmtlcikge1xuICAgICAgICAkc2NvcGUubWUubWFya2VyID0gbWFya2VyO1xuICAgICAgICB2YXIgZmlyZWJhc2VQbGF5ZXJzQXJyID0gJGZpcmViYXNlQXJyYXkocGxheWVyc1JlZik7XG5cbiAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyLiRsb2FkZWQoKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWVJZHg7XG5cbiAgICAgICAgICAgICAgICBwbGF5ZXJzLmZpbmQoZnVuY3Rpb24gKGUsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUuJGlkID09PSAkc2NvcGUubWUuJGlkKSBtZUlkeCA9IGk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLm1hcmtlciA9IG1hcmtlcjtcbiAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJHNhdmUobWVJZHgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGlkeCA9ICRzY29wZS5nYW1lLmF2YWlsYWJsZU1hcmtlcnMuaW5kZXhPZihtYXJrZXIpO1xuXG4gICAgICAgICRzY29wZS5nYW1lLmF2YWlsYWJsZU1hcmtlcnMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgIG1hcmtlcnNBcnJbMF0uc3BsaWNlKGlkeCwgMSk7XG5cbiAgICAgICAgbWFya2Vyc0Fyci4kc2F2ZSgwKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlZikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlZCB0aGUgcGlja2VkIG1hcmtlclwiKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZWYua2V5KTtcbiAgICAgICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLy8vL0s6IHdvcmtpbmcgdXAgdW50aWwgaGVyZSFcblxuICAgIC8vSGF2ZSBwbGF5ZXIgcGljayB0aGVpciBzdGFydCBwb2ludFxuXG4gICAgJHNjb3BlLnBsYWNlTWFya2VyID0gZnVuY3Rpb24gKGJvYXJkLCBwb2ludCkge1xuICAgICAgICAkc2NvcGUubWUucGxhY2VNYXJrZXIocG9pbnQpO1xuICAgICAgICAkc2NvcGUuZ2FtZS5wbGF5ZXJzLnB1c2goJHNjb3BlLnBsYXllcik7XG5cbiAgICAgICAgZ2FtZVJlZi5jaGlsZCgncGxheWVycycpLmNoaWxkKHBsYXllci51aWQpLnB1c2goe1xuICAgICAgICAgICAgJ21hcmtlcic6IHBsYXllci5tYXJrZXIsXG4gICAgICAgICAgICAnc3RhcnRpbmdQb3NpdGlvbic6IHBsYXllci5zdGFydGluZ1Bvc2l0aW9uXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvL3Rha2UgYWxsIHBsYXllcnMgb24gZmlyZWJhc2UgYW5kIHR1cm4gdGhlbSBpbnRvIGxvY2FsIHBsYXllclxuICAgIHBsYXllcnNSZWYub24oXCJjaGlsZF9hZGRlZFwiLCBmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAgIHZhciBuZXdQbGF5ZXIgPSBuZXcgUGxheWVyKHBsYXllci51aWQpO1xuICAgICAgICBuZXdQbGF5ZXIubWFya2VyID0gcGxheWVyLm1hcmtlcjtcblxuICAgICAgICB2YXIgeCA9IHBsYXllci5zdGFydGluZ1Bvc2l0aW9uWzBdO1xuICAgICAgICB2YXIgeSA9IHBsYXllci5zdGFydGluZ1Bvc2l0aW9uWzFdO1xuICAgICAgICB2YXIgcG9pbnRzSW5kZXggPSBwbGF5ZXIuc3RhcnRpbmdQb3NpdGlvblsyXTtcblxuICAgICAgICBuZXdQbGF5ZXIucG9pbnQgPSBib2FyZFt5XVt4XS5wb2ludHNbcG9pbnRzSW5kZXhdO1xuICAgICAgICBuZXdQbGF5ZXIubmV4dFNwYWNlID0gYm9hcmRbeV1beF07XG4gICAgICAgIG5ld1BsYXllci5uZXh0U3BhY2VQb2ludHNJbmRleCA9IHBsYXllci5zdGFydGluZ1Bvc2l0aW9uWzJdO1xuXG4gICAgICAgIG5ld1BsYXllci50aWxlcyA9ICRzY29wZS5nYW1lLmRlY2suZGVhbFRocmVlKCk7XG5cbiAgICAgICAgJHNjb3BlLmdhbWUucGxheWVycy5wdXNoKG5ld1BsYXllcik7XG4gICAgfSk7XG5cblxuXG5cblxuXG5cbiAgICAvLyBUT0RPOiB3ZSBwcm9iYWJseSBuZWVkIHRoaXMgb24gZmlyZWJhc2Ugc28gb3RoZXIgcGVvcGxlIGNhbid0IHBpY2sgd2hhdCdzIGJlZW4gcGlja2VkXG5cbiAgICAvL0ZvciBzeW5jaHJvbml6aW5nR2FtZS4uLlxuICAgIHZhciBzeW5jUmVmID0gZ2FtZVJlZi5jaGlsZCgnbW92ZXMnKTtcbiAgICBzeW5jUmVmLm9uKCdjaGlsZF9hZGRlZCcsIGZ1bmN0aW9uIChjaGlsZFNuYXBzaG90LCBwcmV2Q2hpbGRLZXkpIHtcbiAgICAgICAgLy9ORUVEIFRPIERPVUJMRSBDSEVDSyEhIFdoYXQgZG9lcyBjaGlsZFNuYXAgcmV0dXJucz9cbiAgICAgICAgY29uc29sZS5sb2coJ2NoaWxkU25hcHNob3RfU3luY0dhbWUnLCBjaGlsZFNuYXBzaG90KTtcbiAgICAgICAgLy9kZXBlbmRpbmcgb24gd2hhdCBjaGlsZFNuYXBzaG90IGdpdmVzIG1lLi4uSSB0aGluayBpdCdzIG9uZSBjaGlsZCBwZXIgb24gY2FsbD8gSXQgZG9lc24ndCByZXR1cm4gYW4gYXJyYXkgb2YgY2hhbmdlcy4uLkkgYmVsaWV2ZSFcbiAgICAgICAgaWYgKGNoaWxkU25hcHNob3QudHlwZSA9PT0gJ3VwZGF0ZURlY2snKSB7XG4gICAgICAgICAgICAkc2NvcGUuZ2FtZS5kZWNrID0gY2hpbGRTbmFwc2hvdC51cGRhdGVEZWNrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJHNjb3BlLnBsYWNlVGlsZShjaGlsZFNuYXBzaG90LnRpbGUpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBUT0RPOiBob3cgdG8gcmUtZG8gdGhlIG1vdmVzP1xuICAgIC8vICRzY29wZS5nYW1lLm1vdmVzO1xuXG4gICAgLy8gVE9ETzogaG93IGRvIHdlIHNob3cgdGhlIHRpbGVzIGZvciBwbGF5ZXI/XG5cbiAgICAvLyBUT0RPOiBob3cgdG8gc2hvdyB0aGUgcm90YXRlZCB0aWxlP1xuXG4gICAgLy8gQ01UOiBhc3N1bWluZyB3ZSB1c2UgbmV3IEdhbWUoKSBmb3IgZWFjaCBnYW1lXG4gICAgJHNjb3BlLmN1cnJlbnRQbGF5ZXIgPSAkc2NvcGUuZ2FtZS5nZXRDdXJyZW50UGxheWVyKCk7XG5cbiAgICAvLyBDTVQ6IGFzc3VtaW5nIHdlIHVzZSBuZXcgR2FtZSgpIGZvciBlYWNoIGdhbWUsIGhvbGRzIGFsbCB0aGUgcGxheWVycyBzdGlsbCBvbiB0aGUgYm9hcmQuXG4gICAgLy8gJHNjb3BlLnR1cm5PcmRlckFycmF5ID0gJHNjb3BlLmdhbWUuZ2V0Q2FuUGxheSgpO1xuXG4gICAgLy8gVE9ETzogbmVlZCBhIGZ1bmN0aW9uIHRvIGFzc2lnbiBkcmFnb25cbiAgICAkc2NvcGUuZHJhZ29uO1xuICAgIHZhciBhd2FpdGluZ0RyYWdvbkhvbGRlcnMgPSBbXTtcblxuXG4gICAgJHNjb3BlLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvL1xuICAgIH07XG5cbiAgICAkc2NvcGUubXlUdXJuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAkc2NvcGUubWUgPT09ICRzY29wZS5jdXJyZW50UGxheWVyO1xuICAgIH07XG5cbiAgICAvL3RoZXNlIGFyZSB0aWVkIHRvIGFuZ3VsYXIgbmctY2xpY2sgYnV0dG9uc1xuICAgICRzY29wZS5yb3RhdGVUaWxlQ3cgPSBmdW5jdGlvbiAodGlsZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInJvdGF0ZSB0byByaWdodFwiKVxuICAgICAgICB0aWxlLnJvdGF0aW9uKys7XG4gICAgICAgIGlmICh0aWxlLnJvdGF0aW9uID09PSA0KSB0aWxlLnJvdGF0aW9uID0gMDtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnJvdGF0ZVRpbGVDY3cgPSBmdW5jdGlvbiAodGlsZSkge1xuICAgICAgICB0aWxlLnJvdGF0aW9uLS07XG4gICAgICAgIGlmICh0aWxlLnJvdGF0aW9uID09PSAtNCkgdGlsZS5yb3RhdGlvbiA9IDA7XG4gICAgfTtcblxuICAgIC8vIENNVDogYXNzdW1pbmcgd2UgdXNlIG5ldyBHYW1lKClcbiAgICAvLyBDTVQ6IHVzZSBwbGF5ZXIncyBhbmQgZ2FtZSdzIHByb3RvdHlwZSBmdW5jdGlvbiB0byBwbGFjZSB0aWxlIGFuZCB0aGVuIG1vdmUgYWxsIHBsYXllcnNcbiAgICAkc2NvcGUucGxhY2VUaWxlID0gZnVuY3Rpb24gKHRpbGUpIHtcbiAgICAgICAgLy8gVE9ETzogc2VuZCB0aGlzIHN0YXRlIHRvIGZpcmViYXNlIGV2ZXJ5IHRpbWUgaXQncyBjYWxsZWRcbiAgICAgICAgaWYgKHRpbGUucm90YXRpb24gPiAwKSB7XG4gICAgICAgICAgICB0aWxlLnBhdGhzID0gdGlsZS5wYXRocy5tYXAoZnVuY3Rpb24gKGNvbm5lY3Rpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29ubmVjdGlvbiArIDI7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRpbGUucGF0aHMudW5zaGlmdCh0aWxlLnBhdGhzLnBvcCgpKTtcbiAgICAgICAgICAgIHRpbGUucGF0aHMudW5zaGlmdCh0aWxlLnBhdGhzLnBvcCgpKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aWxlLnJvdGF0aW9uIDwgMCkge1xuICAgICAgICAgICAgdGlsZS5wYXRocyA9IHRpbGUucGF0aHMubWFwKGZ1bmN0aW9uIChjb25uZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbm5lY3Rpb24gLSAyO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aWxlLnBhdGhzLnB1c2godGlsZS5wYXRocy5zaGlmdCgpKTtcbiAgICAgICAgICAgIHRpbGUucGF0aHMucHVzaCh0aWxlLnBhdGhzLnNoaWZ0KCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLm1lLnBsYWNlVGlsZSh0aWxlKTtcbiAgICAgICAgZ2FtZVJlZi5jaGlsZCgnbW92ZXMnKS4kYWRkKHtcbiAgICAgICAgICAgICd0eXBlJzogJ3BsYWNlVGlsZScsXG4gICAgICAgICAgICAndGlsZSc6IHRpbGVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLmdhbWUubW92ZUFsbHBsYXllcnMoKTtcblxuICAgICAgICBpZiAoJHNjb3BlLmdhbWUuY2hlY2tPdmVyKCkpIHtcbiAgICAgICAgICAgIC8vIFRPRE86IG5lZWQgdG8gdGVsbCB0aGUgcGxheWVyIHNoZSB3b25cbiAgICAgICAgICAgICRzY29wZS53aW5uZXIgPSAkc2NvcGUuZ2FtZS5nZXRDYW5QbGF5KClbMF07XG4gICAgICAgICAgICAkc2NvcGUuZ2FtZU92ZXIgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gSWYgZGVjayBpcyBlbXB0eSAmIG5vIG9uZSBpcyBkcmFnb24sIHNldCBtZSBhcyBkcmFnb25cbiAgICAgICAgICAgIGlmICgkc2NvcGUuZ2FtZS5kZWNrLmxlbmd0aCA9PT0gMCAmJiAhJHNjb3BlLmRyYWdvbikge1xuICAgICAgICAgICAgICAgICRzY29wZS5kcmFnb24gPSAkc2NvcGUubWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCRzY29wZS5nYW1lLmRlY2subGVuZ3RoID09PSAwICYmICRzY29wZS5kcmFnb24pIHtcbiAgICAgICAgICAgICAgICBhd2FpdGluZ0RyYWdvbkhvbGRlcnMucHVzaCgkc2NvcGUubWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBDTVQ6IGRyYXcgb25lIHRpbGUgYW5kIHB1c2ggaXQgdG8gdGhlIHBsYXllci50aWxlcyBhcnJheVxuICAgICAgICAgICAgICAgICRzY29wZS5tZS50aWxlcy5wdXNoKCRzY29wZS5nYW1lLmRlY2suZGVhbCgxKSk7XG4gICAgICAgICAgICAgICAgLy9pZiBkZWFkIHBsYXllcnMsIHRoZW4gcHVzaCB0aGVpciBjYXJkcyBiYWNrIHRvIHRoZSBkZWNrICYgcmVzaHVmZmxlXG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZS5nYW1lLmRlYWRQbGF5ZXJzKCkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vd2l0aCBuZXcgY2FyZHMgJiBuZWVkIHRvIHJlc2h1ZmZsZVxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZ2FtZS5kZWFkUGxheWVycygpLmZvckVhY2goZnVuY3Rpb24gKGRlYWRQbGF5ZXJUaWxlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVhZFBsYXllclRpbGVzLmZvckVhY2goZnVuY3Rpb24gKHRpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZ2FtZS5kZWNrLnB1c2godGlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5nYW1lLmRlY2sgPSAkc2NvcGUuZ2FtZS5kZWNrLnNodWZmbGUoKTtcbiAgICAgICAgICAgICAgICAgICAgLy9zZW5kIGZpcmViYXNlIGEgbmV3IG1vdmVcbiAgICAgICAgICAgICAgICAgICAgZ2FtZVJlZi5jaGlsZCgnbW92ZXMnKS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICd0eXBlJzogJ3VwZGF0ZURlY2snLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3VwZGF0ZURlY2snOiAkc2NvcGUuZ2FtZS5kZWNrXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmRyYWdvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRyYWdvbi50aWxlcy5wdXNoKCRzY29wZS5nYW1lLmRlY2suZGVhbCgxKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZHJhZ29uID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vTkVFRCBUTyBESVNDVVNTOiBNaWdodCBuZWVkIHRvIG1vZGlmeSB0aGlzIGlmIHdlIHdhbnQgdG8gdXNlIHVwIHRoZSBjYXJkcyBhbmQgZ2l2ZSBlYWNoIGF3YWl0aW5nIHBsYXllcnMnIHVwIHRvIDMgY2FyZHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlICgkc2NvcGUuZ2FtZS5kZWNrLmxlbmd0aCAmJiAkc2NvcGUuYXdhaXRpbmdEcmFnb25Ib2xkZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5hd2FpdGluZ0RyYWdvbkhvbGRlcnMuc2hpZnQoKS50aWxlcy5wdXNoKCRzY29wZS5nYW1lLmRlY2suZGVhbCgxKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS5hd2FpdGluZ0RyYWdvbkhvbGRlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRyYWdvbiA9ICRzY29wZS5hd2FpdGluZ0RyYWdvbkhvbGRlcnMuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRzY29wZS5nYW1lLmdvVG9OZXh0UGxheWVyKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gVE9ETzogZmlyZWJhc2UgZ2FtZS5wbGF5ZXJzIHNsaWNlICRzY29wZS5wbGF5ZXIgb3V0XG4gICAgJHNjb3BlLmxlYXZlR2FtZTtcblxuICAgIC8vIFRPRE86IGRvIHdlIHJlbW92ZSB0aGlzIGdhbWUgcm9vbSdzIG1vdmVzIGZyb20gZmlyZWJhc2U/XG4gICAgJHNjb3BlLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBtYXJrZXJzQXJyLiRyZW1vdmUoMClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZWYpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInJlbW92ZWQgYWxsIG1hcmtlcnNcIiwgcmVmLmtleSlcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGRlY2tBcnIuJHJlbW92ZSgwKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlZikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlZCB0aGUgZGVja1wiLCByZWYua2V5KVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgb2JqLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICB2YXIgdGlsZXMgPSBkYXRhLnRpbGVzXG4gICAgICAgICAgICB2YXIgZGVjayA9IG5ldyBEZWNrKHRpbGVzKS5zaHVmZmxlKCkudGlsZXM7XG4gICAgICAgICAgICB2YXIgaW5pdGlhbERlY2tSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoJHN0YXRlUGFyYW1zLmdhbWVOYW1lKS5jaGlsZCgnaW5pdGlhbERlY2snKTtcbiAgICAgICAgICAgICRmaXJlYmFzZUFycmF5KGluaXRpYWxEZWNrUmVmKS4kYWRkKGRlY2spO1xuICAgICAgICB9KVxuXG5cblxuICAgICAgICB2YXIgaW5pdGlhbE1hcmtlcnNSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoJHN0YXRlUGFyYW1zLmdhbWVOYW1lKS5jaGlsZCgnYXZhaWxhYmxlTWFya2VycycpO1xuICAgICAgICAkZmlyZWJhc2VBcnJheShpbml0aWFsTWFya2Vyc1JlZikuJGFkZChbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJ5ZWxsb3dcIiwgXCJncmVlblwiLCBcImFxdWFcIiwgXCJibHVlXCIsIFwibmF2eVwiLCBcInB1cnBsZVwiXSk7XG5cblxuICAgICAgICB2YXIgcGxheWVycyA9ICRmaXJlYmFzZUFycmF5KHBsYXllcnNSZWYpO1xuICAgICAgICBjb25zb2xlLmxvZyhwbGF5ZXJzKVxuICAgICAgICBwbGF5ZXJzLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGRhdGFbaV0uY2FuUGxheSA9IHRydWU7XG4gICAgICAgICAgICAgICAgZGF0YVtpXS5tYXJrZXIgPSAnbic7XG4gICAgICAgICAgICAgICAgZGF0YVtpXS5uZXh0U3BhY2UgPSAnbic7XG4gICAgICAgICAgICAgICAgZGF0YVtpXS5uZXh0U3BhY2VQb2ludHNJbmRleCA9ICduJztcbiAgICAgICAgICAgICAgICBkYXRhW2ldLnBvaW50ID0gJ24nO1xuICAgICAgICAgICAgICAgIGRhdGFbaV0udGlsZXMgPSAnbic7XG4gICAgICAgICAgICAgICAgcGxheWVycy4kc2F2ZShpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgIH07XG5cblxuICAgICRzY29wZS5zdGFydHRvcCA9IFtcbiAgICAgICAgWzAsIDAsIDBdLFxuICAgICAgICBbMCwgMCwgMV0sXG4gICAgICAgIFsxLCAwLCAwXSxcbiAgICAgICAgWzEsIDAsIDFdLFxuICAgICAgICBbMiwgMCwgMF0sXG4gICAgICAgIFsyLCAwLCAxXSxcbiAgICAgICAgWzMsIDAsIDBdLFxuICAgICAgICBbMywgMCwgMV0sXG4gICAgICAgIFs0LCAwLCAwXSxcbiAgICAgICAgWzQsIDAsIDFdLFxuICAgICAgICBbNSwgMCwgMF0sXG4gICAgICAgIFs1LCAwLCAxXVxuICAgIF07XG4gICAgJHNjb3BlLnN0YXJ0bGVmdCA9IFtcbiAgICAgICAgWzAsIDAsIDddLFxuICAgICAgICBbMCwgMCwgNl0sXG4gICAgICAgIFswLCAxLCA3XSxcbiAgICAgICAgWzAsIDEsIDZdLFxuICAgICAgICBbMCwgMiwgN10sXG4gICAgICAgIFswLCAyLCA2XSxcbiAgICAgICAgWzAsIDMsIDddLFxuICAgICAgICBbMCwgMywgNl0sXG4gICAgICAgIFswLCA0LCA3XSxcbiAgICAgICAgWzAsIDQsIDZdLFxuICAgICAgICBbMCwgNSwgN10sXG4gICAgICAgIFswLCA1LCA2XVxuICAgIF07XG4gICAgJHNjb3BlLnN0YXJ0Ym90dG9tID0gW1xuICAgICAgICBbMCwgNSwgMF0sXG4gICAgICAgIFswLCA1LCAxXSxcbiAgICAgICAgWzEsIDUsIDBdLFxuICAgICAgICBbMSwgNSwgMV0sXG4gICAgICAgIFsyLCA1LCAwXSxcbiAgICAgICAgWzIsIDUsIDFdLFxuICAgICAgICBbMywgNSwgMF0sXG4gICAgICAgIFszLCA1LCAxXSxcbiAgICAgICAgWzQsIDUsIDBdLFxuICAgICAgICBbNCwgNSwgMV0sXG4gICAgICAgIFs1LCA1LCAwXSxcbiAgICAgICAgWzUsIDUsIDFdXG4gICAgXTtcbiAgICAkc2NvcGUuc3RhcnRyaWdodCA9IFtcbiAgICAgICAgWzUsIDAsIDJdLFxuICAgICAgICBbNSwgMCwgM10sXG4gICAgICAgIFs1LCAxLCAyXSxcbiAgICAgICAgWzUsIDEsIDNdLFxuICAgICAgICBbNSwgMiwgMl0sXG4gICAgICAgIFs1LCAyLCAzXSxcbiAgICAgICAgWzUsIDMsIDJdLFxuICAgICAgICBbNSwgMywgM10sXG4gICAgICAgIFs1LCA0LCAyXSxcbiAgICAgICAgWzUsIDQsIDNdLFxuICAgICAgICBbNSwgNSwgMl0sXG4gICAgICAgIFs1LCA1LCAzXVxuICAgIF07XG59KTtcbiIsInRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZ2FtZWxpc3QnLCB7XG4gICAgICAgIHVybDogJy9nYW1lbGlzdCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2Jyb3dzZXIvanMvZ2FtZWxpc3QvZ2FtZWxpc3QuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdnYW1lTGlzdCcsXG4gICAgfSk7XG59KTtcblxudHN1cm8uY29udHJvbGxlcignZ2FtZUxpc3QnLCBmdW5jdGlvbiAoJHNjb3BlLCBmaXJlYmFzZVVybCwgJGZpcmViYXNlT2JqZWN0LCAkc3RhdGUsICRmaXJlYmFzZUF1dGgsICRmaXJlYmFzZUFycmF5KSB7XG4gICAgLy9Gb3Igc3luY2hyb25pemluZ0dhbWVMaXN0Li4uXG4gICAgdmFyIHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XG4gICAgdmFyIG9iaiA9ICRmaXJlYmFzZU9iamVjdChyZWYpO1xuXG4gICAgdmFyIGF1dGggPSAkZmlyZWJhc2VBdXRoKCk7XG4gICAgdmFyIGZpcmViYXNlVXNlciA9IGF1dGguJGdldEF1dGgoKTtcblxuICAgIHZhciBzeW5jaFJlZiA9IHJlZi5jaGlsZChcImdhbWVzXCIpO1xuICAgIHZhciBzeW5jaHJvbml6ZWRPYmogPSAkZmlyZWJhc2VPYmplY3Qoc3luY2hSZWYpO1xuXG4gICAgLy8gVGhpcyByZXR1cm5zIGEgcHJvbWlzZS4uLnlvdSBjYW4udGhlbigpIGFuZCBhc3NpZ24gdmFsdWUgdG8gJHNjb3BlLnZhcmlhYmxlXG4gICAgLy8gZ2FtZWxpc3QgaXMgd2hhdGV2ZXIgd2UgYXJlIGNhbGxpbmcgaXQgaW4gdGhlIGFuZ3VsYXIgaHRtbC5cbiAgICBzeW5jaHJvbml6ZWRPYmouJGJpbmRUbygkc2NvcGUsIFwiZ2FtZWxpc3RcIilcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGdhbWVsaXN0ID0gW11cbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gJHNjb3BlLmdhbWVsaXN0KSB7XG4gICAgICAgICAgICAgICAgZ2FtZWxpc3QucHVzaChbaSwgJHNjb3BlLmdhbWVsaXN0W2ldXSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRzY29wZS5nYW1lTmFtZXMgPSBnYW1lbGlzdC5zbGljZSgyKTtcbiAgICAgICAgfSlcblxuXG4gICAgJHNjb3BlLmpvaW4gPSBmdW5jdGlvbiAoZ2FtZU5hbWUpIHtcbiAgICAgICAgdmFyIGdhbWVOYW1lUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKGdhbWVOYW1lKTtcbiAgICAgICAgdmFyIHBsYXllcnNSZWYgPSBnYW1lTmFtZVJlZi5jaGlsZCgncGxheWVycycpO1xuXG4gICAgICAgIHZhciBwbGF5ZXJBcnIgPSAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKTtcbiAgICAgICAgcGxheWVyQXJyLiRsb2FkZWQoKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXBsYXllcnMuZmlsdGVyKHBsYXllciA9PiBwbGF5ZXIudWlkID09PSBmaXJlYmFzZVVzZXIudWlkKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3UGxheWVyID0gbmV3IFBsYXllcihmaXJlYmFzZVVzZXIudWlkKVxuICAgICAgICAgICAgICAgICAgICAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKS4kYWRkKG5ld1BsYXllcilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICRzdGF0ZS5nbygnZ2FtZScsIHtcbiAgICAgICAgICAgIFwiZ2FtZU5hbWVcIjogZ2FtZU5hbWVcbiAgICAgICAgfSk7XG4gICAgfTtcbn0pO1xuIiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsb2dpbicsIHtcbiAgICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvYnJvd3Nlci9qcy9sb2dpbi9sb2dpbi5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2xvZ2luQ3RybCdcbiAgICB9KTtcbn0pO1xuXG50c3Vyby5jb250cm9sbGVyKCdsb2dpbkN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsICRmaXJlYmFzZUF1dGgsICRyb290U2NvcGUpIHtcbiAgICB2YXIgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcblxuICAgICRzY29wZS5sb2dJbldpdGhHb29nbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGF1dGguJHNpZ25JbldpdGhQb3B1cChcImdvb2dsZVwiKS50aGVuKGZ1bmN0aW9uIChhdXRoRGF0YSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJMb2dnZWQgaW4gYXM6XCIsIGF1dGhEYXRhKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuY3VycmVudFVzZXIgPSBhdXRoRGF0YTtcbiAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiQXV0aGVudGljYXRpb24gZmFpbGVkOlwiLCBlcnJvcik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRzdGF0ZS5nbygncGlja0dhbWUnKTtcbiAgICB9O1xuXG59KTtcbiIsInRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgncGlja0dhbWUnLCB7XG4gICAgICAgIHVybDogJy9waWNrZ2FtZScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2Jyb3dzZXIvanMvcGlja0dhbWUvcGlja0dhbWUuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdwaWNrR2FtZUN0cmwnXG4gICAgfSk7XG59KTtcblxudHN1cm8uY29udHJvbGxlcigncGlja0dhbWVDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlLCAkZmlyZWJhc2VBcnJheSwgJGZpcmViYXNlT2JqZWN0KSB7XG4gICAgdmFyIHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XG4gICAgdmFyIG9iaiA9ICRmaXJlYmFzZU9iamVjdChyZWYpXG5cblxuICAgICRzY29wZS5jcmVhdGVHYW1lID0gZnVuY3Rpb24gKGdhbWVOYW1lKSB7XG4gICAgICAgIHZhciBnYW1lTmFtZVJlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZChnYW1lTmFtZSk7XG4gICAgICAgIHZhciBwbGF5ZXJzUmVmID0gZ2FtZU5hbWVSZWYuY2hpbGQoJ3BsYXllcnMnKTtcblxuICAgICAgICAkZmlyZWJhc2VBcnJheShnYW1lTmFtZVJlZikuJGFkZCh7XG4gICAgICAgICAgICBcImdhbWVOYW1lXCI6IGdhbWVOYW1lXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZpcmViYXNlLmF1dGgoKS5vbkF1dGhTdGF0ZUNoYW5nZWQoZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5ld1BsYXllciA9IG5ldyBQbGF5ZXIodXNlci51aWQpXG4gICAgICAgICAgICAgICAgJGZpcmViYXNlQXJyYXkocGxheWVyc1JlZikuJGFkZChuZXdQbGF5ZXIpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibm8gb25lIGxvZ2dlZCBpblwiKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIG9iai4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgdmFyIHRpbGVzID0gZGF0YS50aWxlc1xuICAgICAgICAgICAgdmFyIGRlY2sgPSBuZXcgRGVjayh0aWxlcykuc2h1ZmZsZSgpLnRpbGVzO1xuICAgICAgICAgICAgdmFyIGluaXRpYWxEZWNrUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKGdhbWVOYW1lKS5jaGlsZCgnaW5pdGlhbERlY2snKTtcbiAgICAgICAgICAgICRmaXJlYmFzZUFycmF5KGluaXRpYWxEZWNrUmVmKS4kYWRkKGRlY2spO1xuICAgICAgICB9KVxuXG5cbiAgICAgICAgdmFyIGluaXRpYWxNYXJrZXJzUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKGdhbWVOYW1lKS5jaGlsZCgnYXZhaWxhYmxlTWFya2VycycpO1xuICAgICAgICAkZmlyZWJhc2VBcnJheShpbml0aWFsTWFya2Vyc1JlZikuJGFkZChbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJ5ZWxsb3dcIiwgXCJncmVlblwiLCBcImFxdWFcIiwgXCJibHVlXCIsIFwibmF2eVwiLCBcInB1cnBsZVwiXSk7XG5cblxuICAgICAgICAkc3RhdGUuZ28oJ2dhbWUnLCB7XG4gICAgICAgICAgICBcImdhbWVOYW1lXCI6IGdhbWVOYW1lXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAkc2NvcGUuZ29Ub0dhbWVMaXN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAkc3RhdGUuZ28oJ2dhbWVsaXN0Jyk7XG4gICAgfTtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmZ1bmN0aW9uIFBsYXllcih1aWQpIHtcbiAgICAvLyBUT0RPOiBnZXQgdWlkIGZyb20gZmlyZWJhc2UgYXV0aFxuICAgIHRoaXMudWlkID0gdWlkO1xuXG4gICAgdGhpcy5tYXJrZXIgPSBcIm5cIjtcblxuICAgIC8vIHNob3VsZCBiZSBhIFBvaW50IG9iamVjdFxuICAgIHRoaXMucG9pbnQgPSBcIm5cIjtcblxuICAgIC8vIFt4LCB5XVxuICAgIC8vIGRlcGVuZHMgb24gdGhlIGFuZ3VsYXIgU3BhY2UueCwgU3BhY2UueVxuICAgIHRoaXMubmV4dFNwYWNlID0gXCJuXCI7XG5cbiAgICAvLyBpbiBlYWNoIFNwYWNlLnBvaW50cyBhcnJheSwgZmluZCB0aGlzIHNwZWNpZmljIHBvaW50IGFuZCBnZXQgdGhlIHBvc2l0aW9uIChpbnRlZ2VyKSBpbnNpZGUgdGhpcyBzcGFjZS5cbiAgICB0aGlzLm5leHRTcGFjZVBvaW50c0luZGV4ID0gXCJuXCI7XG5cbiAgICAvLyBtYXhpbXVuIDMgdGlsZXNcbiAgICB0aGlzLnRpbGVzID0gJ24nO1xuXG4gICAgLy8gaWYgYSBwbGF5ZXIgZGllcywgaXQgd2lsbCBiZSBjaGFuZ2VkIHRvIGZhbHNlXG4gICAgdGhpcy5jYW5QbGF5ID0gdHJ1ZTtcbn1cblxuUGxheWVyLnByb3RvdHlwZS5wbGFjZU1hcmtlciA9IGZ1bmN0aW9uIChib2FyZCwgcG9pbnQpIHtcbiAgICAvLyBwb2ludCBsb29rcyBsaWtlIFt4LCB5LCBwb2ludHNJbmRleF0gaW4gdGhlIHNwYWNlXG4gICAgdmFyIHggPSBwb2ludFswXTtcbiAgICB2YXIgeSA9IHBvaW50WzFdO1xuICAgIHZhciBwb2ludHNJbmRleCA9IHBvaW50WzJdO1xuXG4gICAgdGhpcy5wb2ludCA9IGJvYXJkW3ldW3hdLnBvaW50c1twb2ludHNJbmRleF07XG4gICAgdGhpcy5wb2ludC50cmF2ZWxsZWQgPSB0cnVlO1xuXG4gICAgLy9beCwgeV0gZnJvbSB0aGUgcG9pbnRcbiAgICB0aGlzLm5leHRTcGFjZSA9IGJvYXJkW3ldW3hdO1xuXG4gICAgLy8gaW4gZWFjaCBTcGFjZS5wb2ludHMgYXJyYXksIGZpbmQgdGhpcyBzcGVjaWZpYyBwb2ludCBhbmQgZ2V0IHRoZSBwb3NpdGlvbiAoaW50ZWdlcikgaW5zaWRlIHRoaXMgc3BhY2UuXG4gICAgdGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9IHRoaXMubmV4dFNwYWNlLnBvaW50cy5pbmRleE9mKHRoaXMucG9pbnQpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5uZXdTcGFjZSA9IGZ1bmN0aW9uIChib2FyZCwgb2xkU3BhY2UpIHtcbiAgICBpZiAodGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gMCB8fCB0aGlzLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSAxKSB7XG4gICAgICAgIHJldHVybiBib2FyZFtvbGRTcGFjZS55IC0gMV1bb2xkU3BhY2UueF07XG4gICAgfSBlbHNlIGlmICh0aGlzLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSAyIHx8IHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDMpIHtcbiAgICAgICAgcmV0dXJuIGJvYXJkW29sZFNwYWNlLnldW29sZFNwYWNlLnggKyAxXTtcbiAgICB9IGVsc2UgaWYgKHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDQgfHwgdGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gNSkge1xuICAgICAgICByZXR1cm4gYm9hcmRbb2xkU3BhY2UueSArIDFdW29sZFNwYWNlLnhdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBib2FyZFtvbGRTcGFjZS55XVtvbGRTcGFjZS54IC0gMV07XG4gICAgfVxufTtcblxuUGxheWVyLnByb3RvdHlwZS5wbGFjZVRpbGUgPSBmdW5jdGlvbiAodGlsZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMudGlsZXMuaW5kZXhPZih0aWxlKTtcbiAgICB0aGlzLnRpbGVzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICB0aGlzLm5leHRTcGFjZS50aWxlVXJsID0gdGlsZS5pbWFnZVVybDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGlsZS5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLm5leHRTcGFjZS5wb2ludHNbaV0ubmVpZ2hib3JzLnB1c2godGhpcy5uZXh0U3BhY2UucG9pbnRzW3RpbGVbaV1dKTtcbiAgICB9XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLm1vdmVUbyA9IGZ1bmN0aW9uIChwb2ludGVyKSB7XG4gICAgLy8gbGV0IHBvaW50ZXIgPSBwb2ludGVyO1xuXG4gICAgLy9hbHdheXMgYmUgcmV0dXJuaW5nIDAgb3IgMSBwb2ludCBpbiB0aGUgYXJyYXlcbiAgICBsZXQgbmV4dFBvaW50ID0gcG9pbnRlci5uZWlnaGJvcnMuZmlsdGVyKGZ1bmN0aW9uIChuZWlnaGJvcikge1xuICAgICAgICByZXR1cm4gIW5laWdoYm9yLnRyYXZlbGxlZDtcbiAgICB9KVswXTtcblxuICAgIHJldHVybiBuZXh0UG9pbnQ7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLmtlZXBNb3ZpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IG1vdmFibGUgPSB0aGlzLm1vdmVUbyh0aGlzLnBvaW50KTtcbiAgICB3aGlsZSAobW92YWJsZSkge1xuICAgICAgICB0aGlzLnBvaW50LnRyYXZlbGxlZCA9IHRydWU7XG4gICAgICAgIHRoaXMucG9pbnQgPSB0aGlzLm1vdmVUbyh0aGlzLnBvaW50KTtcbiAgICAgICAgbGV0IG9sZFNwYWNlID0gdGhpcy5uZXh0U3BhY2U7XG4gICAgICAgIGxldCBuZXdTcGFjZSA9IG5ld1NwYWNlKG9sZFNwYWNlKTtcbiAgICAgICAgdGhpcy5uZXh0U3BhY2UgPSBuZXdTcGFjZTtcblxuICAgICAgICB0aGlzLmNoZWNrRGVhdGgoKTtcbiAgICAgICAgbW92YWJsZSA9IHRoaXMubW92ZVRvKHRoaXMucG9pbnQpO1xuICAgIH1cbn07XG5cblBsYXllci5wcm90b3R5cGUuY2hlY2tEZWF0aCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYWxsVHJhdmVsbGVkID0gdGhpcy5wb2ludC5uZWlnaGJvcnMuZmlsdGVyKGZ1bmN0aW9uIChuZWlnaGJvcikge1xuICAgICAgICByZXR1cm4gbmVpZ2hib3IudHJhdmVsbGVkO1xuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMucG9pbnQuZWRnZSB8fCBhbGxUcmF2ZWxsZWQubGVuZ3RoID09PSAyKSB0aGlzLmRpZSgpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5kaWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jYW5QbGF5ID0gZmFsc2U7XG4gICAgLy8gVE9ETzogbmVlZCB0byBzZW5kIGFuIGFsZXJ0IG9yIG1lc3NhZ2UgdG8gdGhlIHBsYXllciB3aG8ganVzdCBkaWVkLlxufTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
