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
    $scope.tile = {
        imageUrl: "",
        paths: [3, 4, 6, 0, 1, 7, 2, 5],
        rotation: 0
    };

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
                if (me) {
                    $scope.me = me;
                    $scope.me.prototype = Object.create(Player.prototype);
                }
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

    //Have player pick their start point

    $scope.placeMarker = function (board, point) {
        $scope.me.prototype.placeMarker(board, point, $scope.me);
        $scope.game.players.push($scope.me);
        var firebasePlayersArr = $firebaseArray(playersRef);

        firebasePlayersArr.$loaded().then(function (players) {
            var meIdx;

            players.find(function (e, i) {
                if (e.$id === $scope.me.$id) meIdx = i;
            });

            firebasePlayersArr[meIdx] = $scope.me;
            firebasePlayersArr.$save(meIdx);
            console.log(firebasePlayersArr[meIdx]);
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

        $scope.me.prototype.placeTile(tile, $scope.me);
        console.log($scope.me);

        // CMT: this should send the rotated tile to firebase
        gameRef.child('moves').$add({
            'type': 'placeTile',
            'tile': tile
        });
        //
        // $scope.game.moveAllplayers();
        //
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

// need to use self becuse we need to change $scope.me on gameCtrl and send to firebase
Player.prototype.placeTile = function (tile, self) {
    var index = self.tiles.indexOf(tile);
    self.tiles.splice(index, 1);

    self.nextSpace.tileUrl = tile.imageUrl;

    for (var i = 0; i < tile.length; i++) {
        self.nextSpace.points[i].neighbors.push(self.nextSpace.points[tile[i]]);
    }
};

Player.prototype.moveTo = function (pointer) {

    //always be returning 0 or 1 point in the array
    var nextPoint = pointer.neighbors.filter(function (neighbor) {
        return !neighbor.travelled;
    })[0];

    return nextPoint;
};

// TODO: not sure how to make this keep moving with players instead of self
Player.prototype.keepMoving = function (self) {
    var movable = self.moveTo(self.point);
    while (movable) {
        self.point.travelled = true;
        self.point = self.moveTo(self.point);
        var oldSpace = self.nextSpace;
        var newSpace = newSpace(oldSpace);
        self.nextSpace = newSpace;

        self.checkDeath();
        movable = self.moveTo(self.point);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImdhbWUvYm9hcmQuanMiLCJnYW1lL2RlY2suanMiLCJnYW1lL2dhbWUuY29udHJ1Y3Rvci5qcyIsImdhbWUvZ2FtZS5qcyIsImdhbWVsaXN0L2dhbWVsaXN0LmpzIiwibG9naW4vbG9naW4uanMiLCJwaWNrR2FtZS9waWNrR2FtZS5qcyIsInBsYXllci9wbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBQSxRQUFBLFFBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTs7QUFFQSxNQUFBLE1BQUEsQ0FBQSxZQUFBO0FBQ0EsUUFBQSxTQUFBO0FBQ0EsZ0JBQUEseUNBREE7QUFFQSxvQkFBQSxzQ0FGQTtBQUdBLHFCQUFBLDZDQUhBO0FBSUEsdUJBQUE7QUFKQSxLQUFBO0FBTUEsYUFBQSxhQUFBLENBQUEsTUFBQTtBQUNBLENBUkE7O0FBVUEsTUFBQSxRQUFBLENBQUEsYUFBQSxFQUFBLDRDQUFBOztBQUVBLE1BQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQTtBQUNBLHVCQUFBLFNBQUEsQ0FBQSxHQUFBO0FBQ0EsQ0FGQTs7QUNkQSxTQUFBLEtBQUEsR0FBQTtBQUNBLFNBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQTs7QUFFQSxNQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBO0FBQ0E7QUFDQSxXQUFBLEtBQUEsS0FBQTtBQUNBLENBUkE7O0FBVUEsU0FBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEVBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLFNBQUEsS0FBQSxHQUFBLElBQUE7QUFDQSxTQUFBLE1BQUEsR0FBQSxDQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBQUE7QUFDQSxTQUFBLE9BQUE7QUFDQSxTQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxzQkFBQTs7QUFFQSxZQUFBLElBQUEsQ0FBQSxFQUFBOztBQUNBLDRCQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLEM7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FDQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsTUFBQSxJQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLFNBSkEsTUFJQSxJQUFBLElBQUEsQ0FBQSxFQUFBOztBQUNBLGdCQUFBLE1BQUEsQ0FBQSxFQUFBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxLQUNBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxTQUhBLE1BR0EsSUFBQSxJQUFBLENBQUEsRUFBQTs7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FDQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsU0FIQSxNQUdBOztBQUNBLDRCQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLEM7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FDQTtBQUNBLHFCQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsTUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFJQSxTQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxTQUFBLElBQUEsR0FBQSxJQUFBO0FBQ0EsU0FBQSxTQUFBLEdBQUEsRUFBQTtBQUNBLFNBQUEsU0FBQSxHQUFBLEtBQUE7QUFDQTs7QUNqREE7O0lBRUEsSTtBQUNBLGtCQUFBLEtBQUEsRUFBQTtBQUFBOztBQUNBLGFBQUEsS0FBQSxHQUFBLEtBQUE7QUFDQTs7OztrQ0FFQTtBQUNBLGlCQUFBLEtBQUEsR0FBQSxFQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBLG1CQUFBLElBQUE7QUFDQTs7O29DQUVBO0FBQ0EsbUJBQUEsS0FBQSxLQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7QUFDQTs7OzZCQUVBLEcsRUFBQTtBQUNBLG1CQUFBLEtBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxDQUFBO0FBQ0E7OzsrQkFFQSxLLEVBQUE7QUFDQSxpQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLEtBQUE7QUFDQSxtQkFBQSxJQUFBO0FBQ0E7Ozs7OztBQ3ZCQTs7OztJQUlBLEk7QUFDQSxrQkFBQSxJQUFBLEVBQUE7QUFBQTs7QUFDQSxhQUFBLElBQUEsR0FBQSxJQUFBO0FBQ0EsYUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsS0FBQSxHQUFBLElBQUEsS0FBQSxHQUFBLFNBQUEsRUFBQTtBQUNBLGFBQUEsT0FBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLGdCQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsUUFBQSxFQUFBLFFBQUEsRUFBQSxPQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsUUFBQSxDQUFBOztBQUVBLGFBQUEsVUFBQSxDO0FBQ0EsYUFBQSxjQUFBLEdBQUEsRUFBQSxDO0FBQ0EsYUFBQSxNQUFBLEdBQUEsRUFBQSxDO0FBQ0EsYUFBQSxLQUFBO0FBQ0E7Ozs7MkNBRUE7QUFDQSxnQkFBQSxLQUFBLFVBQUEsS0FBQSxDQUFBLENBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsY0FBQSxDQUFBLEtBQUEsVUFBQSxDQUFBO0FBQ0E7Ozt5Q0FFQTtBQUNBLGlCQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxNQUFBO0FBQUEsdUJBQUEsT0FBQSxVQUFBLENBQUEsTUFBQSxDQUFBO0FBQUEsYUFBQTtBQUNBOzs7c0NBQ0E7QUFDQSxnQkFBQSxtQkFBQSxFQUFBO0FBQ0EsaUJBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLG9CQUFBLENBQUEsT0FBQSxPQUFBLElBQUEsT0FBQSxLQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsRUFBQTtBQUNBLHFDQUFBLElBQUEsQ0FBQSxPQUFBLEtBQUE7QUFDQSxtQ0FBQSxJQUFBO0FBQ0E7QUFDQSxhQUxBO0FBTUEsbUJBQUEsZ0JBQUE7QUFDQTs7O29DQUVBO0FBQ0EsbUJBQUEsYUFBQSxNQUFBLElBQUEsQ0FBQTtBQUNBOzs7Ozs7eUNBR0E7QUFDQSxnQkFBQSxXQUFBLEtBQUEsY0FBQSxFQUFBLE1BQUEsR0FBQSxDQUFBLEVBQUE7QUFDQSxvQkFBQSxTQUFBLEtBQUEsVUFBQSxHQUFBLENBQUE7QUFDQSx1QkFBQSxDQUFBLEtBQUEsY0FBQSxDQUFBLFNBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQTtBQUNBO0FBQ0E7QUFDQSxxQkFBQSxVQUFBLEdBQUEsTUFBQTtBQUNBLGFBTkEsTUFNQTtBQUNBLHFCQUFBLFVBQUEsR0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLG1CQUFBLEtBQUEsZ0JBQUEsRUFBQTtBQUNBOzs7Ozs7Z0NBR0E7QUFBQTs7QUFDQSxpQkFBQSxPQUFBLENBQUEsT0FBQSxDQUFBLGtCQUFBOzs7QUFHQSxzQkFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsS0FBQSxFQUFBLE9BQUE7QUFDQSx1QkFBQSxLQUFBLEdBQUEsRUFBQTs7QUFFQSx1QkFBQSxPQUFBLEdBQUEsSUFBQTtBQUNBLGFBUEE7QUFRQTs7Ozs7Ozs7Ozs7QUFPQSxJQUFBLGFBQUEsU0FBQSxVQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsV0FBQSxRQUFBLE1BQUEsQ0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGVBQUEsT0FBQSxPQUFBO0FBQ0EsS0FGQSxDQUFBO0FBR0EsQ0FKQTs7QUN4RUEsTUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsYUFBQSxpQkFEQTtBQUVBLHFCQUFBLDRCQUZBO0FBR0Esb0JBQUE7QUFIQSxLQUFBO0FBS0EsQ0FOQTs7QUFRQSxNQUFBLFVBQUEsQ0FBQSxVQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQSxZQUFBLEVBQUEsZUFBQSxFQUFBLGNBQUEsRUFBQTtBQUNBLFdBQUEsSUFBQSxHQUFBO0FBQ0Esa0JBQUEsRUFEQTtBQUVBLGVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBO0FBR0Esa0JBQUE7QUFIQSxLQUFBOztBQU1BLFFBQUEsTUFBQSxTQUFBLFFBQUEsR0FBQSxHQUFBLEVBQUE7QUFDQSxRQUFBLE1BQUEsZ0JBQUEsR0FBQSxDQUFBOztBQUVBLFFBQUEsVUFBQSxJQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsS0FBQSxDQUFBLGFBQUEsUUFBQSxDQUFB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QUFBLG9CQUFBLEdBQUEsT0FBQSxnQkFBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSxrQkFBQSxLQUFBLEdBQUEsT0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsRUFBQTs7QUFFQSxlQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLFNBQUE7QUFDQSxLQWZBOzs7OztBQTBCQSxRQUFBLFVBQUEsUUFBQSxLQUFBLENBQUEsT0FBQSxDQUFBO0FBQ0EsWUFBQSxFQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsYUFBQSxFQUFBLFlBQUEsRUFBQTs7QUFFQSxnQkFBQSxHQUFBLENBQUEsd0JBQUEsRUFBQSxhQUFBOztBQUVBLFlBQUEsY0FBQSxJQUFBLEtBQUEsWUFBQSxFQUFBO0FBQ0EsbUJBQUEsSUFBQSxDQUFBLElBQUEsR0FBQSxjQUFBLFVBQUE7QUFDQSxTQUZBLE1BRUE7QUFDQSxtQkFBQSxTQUFBLENBQUEsY0FBQSxJQUFBO0FBQ0E7QUFDQSxLQVRBOzs7Ozs7Ozs7O0FBbUJBLFdBQUEsYUFBQSxHQUFBLE9BQUEsSUFBQSxDQUFBLGdCQUFBLEVBQUE7OztBQUdBLFdBQUEsTUFBQTtBQUNBLFFBQUEsd0JBQUEsRUFBQTs7QUFFQSxXQUFBLEtBQUEsR0FBQSxZQUFBOztBQUVBLEtBRkE7O0FBSUEsV0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLGVBQUEsRUFBQSxLQUFBLE9BQUEsYUFBQTtBQUNBLEtBRkE7OztBQUtBLFdBQUEsWUFBQSxHQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsR0FBQSxDQUFBLGlCQUFBO0FBQ0EsYUFBQSxRQUFBO0FBQ0EsWUFBQSxLQUFBLFFBQUEsS0FBQSxDQUFBLEVBQUEsS0FBQSxRQUFBLEdBQUEsQ0FBQTtBQUNBLEtBSkE7O0FBTUEsV0FBQSxhQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLFFBQUE7QUFDQSxZQUFBLEtBQUEsUUFBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLEtBQUEsUUFBQSxHQUFBLENBQUE7QUFDQSxLQUhBOzs7QUFPQSxXQUFBLFNBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTs7QUFFQSxZQUFBLEtBQUEsUUFBQSxHQUFBLENBQUEsRUFBQTtBQUNBLGlCQUFBLEtBQUEsR0FBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxVQUFBLEVBQUE7QUFDQSw2QkFBQSxhQUFBLENBQUE7QUFDQSxvQkFBQSxlQUFBLENBQUEsRUFBQSxhQUFBLENBQUE7QUFDQSxvQkFBQSxlQUFBLENBQUEsRUFBQSxhQUFBLENBQUE7QUFDQSx1QkFBQSxVQUFBO0FBQ0EsYUFMQSxDQUFBO0FBTUEsaUJBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxpQkFBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFNBVEEsTUFTQSxJQUFBLEtBQUEsUUFBQSxHQUFBLENBQUEsRUFBQTtBQUNBLGlCQUFBLEtBQUEsR0FBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxVQUFBLEVBQUE7QUFDQSw2QkFBQSxhQUFBLENBQUE7QUFDQSxvQkFBQSxlQUFBLENBQUEsQ0FBQSxFQUFBLGFBQUEsQ0FBQTtBQUNBLG9CQUFBLGVBQUEsQ0FBQSxDQUFBLEVBQUEsYUFBQSxDQUFBO0FBQ0EsdUJBQUEsVUFBQTtBQUNBLGFBTEEsQ0FBQTtBQU1BLGlCQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQTs7QUFFQSxlQUFBLEVBQUEsQ0FBQSxTQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsRUFBQSxPQUFBLEVBQUE7QUFDQSxnQkFBQSxHQUFBLENBQUEsT0FBQSxFQUFBOzs7QUFHQSxnQkFBQSxLQUFBLENBQUEsT0FBQSxFQUFBLElBQUEsQ0FBQTtBQUNBLG9CQUFBLFdBREE7QUFFQSxvQkFBQTtBQUZBLFNBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0RBLEtBNUVBOzs7QUErRUEsV0FBQSxTQUFBOzs7QUFHQSxXQUFBLEtBQUEsR0FBQSxZQUFBO0FBQ0EsbUJBQUEsT0FBQSxDQUFBLENBQUEsRUFDQSxJQURBLENBQ0EsVUFBQSxHQUFBLEVBQUE7QUFDQSxvQkFBQSxHQUFBLENBQUEscUJBQUEsRUFBQSxJQUFBLEdBQUE7QUFDQSxTQUhBOztBQUtBLGdCQUFBLE9BQUEsQ0FBQSxDQUFBLEVBQ0EsSUFEQSxDQUNBLFVBQUEsR0FBQSxFQUFBO0FBQ0Esb0JBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxHQUFBO0FBQ0EsU0FIQTs7QUFLQSxZQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxnQkFBQSxRQUFBLEtBQUEsS0FBQTtBQUNBLGdCQUFBLE9BQUEsSUFBQSxJQUFBLENBQUEsS0FBQSxFQUFBLE9BQUEsR0FBQSxLQUFBO0FBQ0EsZ0JBQUEsaUJBQUEsSUFBQSxLQUFBLENBQUEsT0FBQSxFQUFBLEtBQUEsQ0FBQSxhQUFBLFFBQUEsRUFBQSxLQUFBLENBQUEsYUFBQSxDQUFBO0FBQ0EsMkJBQUEsY0FBQSxFQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0EsU0FMQTs7QUFTQSxZQUFBLG9CQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxLQUFBLENBQUEsYUFBQSxRQUFBLEVBQUEsS0FBQSxDQUFBLGtCQUFBLENBQUE7QUFDQSx1QkFBQSxpQkFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsUUFBQSxFQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxRQUFBLENBQUE7O0FBR0EsWUFBQSxVQUFBLGVBQUEsVUFBQSxDQUFBO0FBQ0EsZ0JBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGlCQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxLQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxxQkFBQSxDQUFBLEVBQUEsT0FBQSxHQUFBLElBQUE7QUFDQSxxQkFBQSxDQUFBLEVBQUEsTUFBQSxHQUFBLEdBQUE7QUFDQSxxQkFBQSxDQUFBLEVBQUEsU0FBQSxHQUFBLEdBQUE7QUFDQSxxQkFBQSxDQUFBLEVBQUEsb0JBQUEsR0FBQSxHQUFBO0FBQ0EscUJBQUEsQ0FBQSxFQUFBLEtBQUEsR0FBQSxHQUFBO0FBQ0EscUJBQUEsQ0FBQSxFQUFBLEtBQUEsR0FBQSxHQUFBO0FBQ0Esd0JBQUEsS0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLFNBVkE7O0FBWUEsZ0JBQUEsR0FBQSxDQUFBLE9BQUEsRUFBQTtBQUVBLEtBdkNBOztBQTBDQSxXQUFBLFFBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBLEVBR0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQSxFQUlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSkEsRUFLQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUxBLEVBTUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FOQSxFQU9BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUEEsRUFRQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVJBLEVBU0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FUQSxFQVVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVkEsRUFXQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVhBLEVBWUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FaQSxDQUFBO0FBY0EsV0FBQSxTQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQURBLEVBRUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQSxFQUdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEEsRUFJQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUpBLEVBS0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FMQSxFQU1BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTkEsRUFPQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVBBLEVBUUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FSQSxFQVNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVEEsRUFVQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVZBLEVBV0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FYQSxFQVlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWkEsQ0FBQTtBQWNBLFdBQUEsV0FBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBLEVBSUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FKQSxFQUtBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQU5BLEVBT0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FQQSxFQVFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUkEsRUFTQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVRBLEVBVUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FWQSxFQVdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWEEsRUFZQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVpBLENBQUE7QUFjQSxXQUFBLFVBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBLEVBR0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQSxFQUlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSkEsRUFLQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUxBLEVBTUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FOQSxFQU9BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUEEsRUFRQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVJBLEVBU0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FUQSxFQVVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVkEsRUFXQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVhBLEVBWUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FaQSxDQUFBO0FBY0EsQ0F0V0E7O0FDUkEsTUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsYUFBQSxXQURBO0FBRUEscUJBQUEsb0NBRkE7QUFHQSxvQkFBQTtBQUhBLEtBQUE7QUFLQSxDQU5BOztBQVFBLE1BQUEsVUFBQSxDQUFBLFVBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsZUFBQSxFQUFBLE1BQUEsRUFBQSxhQUFBLEVBQUEsY0FBQSxFQUFBOztBQUVBLFFBQUEsTUFBQSxTQUFBLFFBQUEsR0FBQSxHQUFBLEVBQUE7QUFDQSxRQUFBLE1BQUEsZ0JBQUEsR0FBQSxDQUFBOztBQUVBLFFBQUEsT0FBQSxlQUFBO0FBQ0EsUUFBQSxlQUFBLEtBQUEsUUFBQSxFQUFBOztBQUVBLFFBQUEsV0FBQSxJQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUE7QUFDQSxRQUFBLGtCQUFBLGdCQUFBLFFBQUEsQ0FBQTs7OztBQUlBLG9CQUFBLE9BQUEsQ0FBQSxNQUFBLEVBQUEsVUFBQSxFQUNBLElBREEsQ0FDQSxZQUFBO0FBQ0EsWUFBQSxXQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxJQUFBLE9BQUEsUUFBQSxFQUFBO0FBQ0EscUJBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxFQUFBLE9BQUEsUUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQSxlQUFBLFNBQUEsR0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxLQVBBOztBQVVBLFdBQUEsSUFBQSxHQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsWUFBQSxjQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxLQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsWUFBQSxhQUFBLFlBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQTs7QUFFQSxZQUFBLFlBQUEsZUFBQSxVQUFBLENBQUE7QUFDQSxrQkFBQSxPQUFBLEdBQ0EsSUFEQSxDQUNBLFVBQUEsT0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxRQUFBLE1BQUEsQ0FBQTtBQUFBLHVCQUFBLE9BQUEsR0FBQSxLQUFBLGFBQUEsR0FBQTtBQUFBLGFBQUEsQ0FBQSxFQUFBO0FBQ0Esb0JBQUEsWUFBQSxJQUFBLE1BQUEsQ0FBQSxhQUFBLEdBQUEsQ0FBQTtBQUNBLCtCQUFBLFVBQUEsRUFBQSxJQUFBLENBQUEsU0FBQTtBQUNBO0FBQ0EsU0FOQTs7QUFRQSxlQUFBLEVBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSx3QkFBQTtBQURBLFNBQUE7QUFHQSxLQWhCQTtBQWlCQSxDQXhDQTs7QUNSQSxNQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxhQUFBLFFBREE7QUFFQSxxQkFBQSw4QkFGQTtBQUdBLG9CQUFBO0FBSEEsS0FBQTtBQUtBLENBTkE7O0FBUUEsTUFBQSxVQUFBLENBQUEsV0FBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxhQUFBLEVBQUEsVUFBQSxFQUFBO0FBQ0EsUUFBQSxPQUFBLGVBQUE7O0FBRUEsV0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLGFBQUEsZ0JBQUEsQ0FBQSxRQUFBLEVBQUEsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0Esb0JBQUEsR0FBQSxDQUFBLGVBQUEsRUFBQSxRQUFBO0FBQ0EsdUJBQUEsV0FBQSxHQUFBLFFBQUE7QUFDQSxTQUhBLEVBR0EsS0FIQSxDQUdBLFVBQUEsS0FBQSxFQUFBO0FBQ0Esb0JBQUEsS0FBQSxDQUFBLHdCQUFBLEVBQUEsS0FBQTtBQUNBLFNBTEE7O0FBT0EsZUFBQSxFQUFBLENBQUEsVUFBQTtBQUNBLEtBVEE7QUFXQSxDQWRBOztBQ1JBLE1BQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLGFBQUEsV0FEQTtBQUVBLHFCQUFBLG9DQUZBO0FBR0Esb0JBQUE7QUFIQSxLQUFBO0FBS0EsQ0FOQTs7QUFRQSxNQUFBLFVBQUEsQ0FBQSxjQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLGNBQUEsRUFBQSxlQUFBLEVBQUE7QUFDQSxRQUFBLE1BQUEsU0FBQSxRQUFBLEdBQUEsR0FBQSxFQUFBO0FBQ0EsUUFBQSxNQUFBLGdCQUFBLEdBQUEsQ0FBQTs7QUFHQSxXQUFBLFVBQUEsR0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLFlBQUEsY0FBQSxJQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsS0FBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLFlBQUEsYUFBQSxZQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUE7O0FBRUEsdUJBQUEsV0FBQSxFQUFBLElBQUEsQ0FBQTtBQUNBLHdCQUFBO0FBREEsU0FBQTs7QUFJQSxpQkFBQSxJQUFBLEdBQUEsa0JBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGdCQUFBLElBQUEsRUFBQTtBQUNBLG9CQUFBLFlBQUEsSUFBQSxNQUFBLENBQUEsS0FBQSxHQUFBLENBQUE7QUFDQSwrQkFBQSxVQUFBLEVBQUEsSUFBQSxDQUFBLFNBQUE7QUFDQSxhQUhBLE1BR0E7QUFDQSx3QkFBQSxHQUFBLENBQUEsa0JBQUE7QUFDQTtBQUNBLFNBUEE7O0FBU0EsWUFBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsUUFBQSxLQUFBLEtBQUE7QUFDQSxnQkFBQSxPQUFBLElBQUEsSUFBQSxDQUFBLEtBQUEsRUFBQSxPQUFBLEdBQUEsS0FBQTtBQUNBLGdCQUFBLGlCQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxLQUFBLENBQUEsUUFBQSxFQUFBLEtBQUEsQ0FBQSxhQUFBLENBQUE7QUFDQSwyQkFBQSxjQUFBLEVBQUEsSUFBQSxDQUFBLElBQUE7QUFDQSxTQUxBOztBQVFBLFlBQUEsb0JBQUEsSUFBQSxLQUFBLENBQUEsT0FBQSxFQUFBLEtBQUEsQ0FBQSxRQUFBLEVBQUEsS0FBQSxDQUFBLGtCQUFBLENBQUE7QUFDQSx1QkFBQSxpQkFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsUUFBQSxFQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxRQUFBLENBQUE7O0FBR0EsZUFBQSxFQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0Esd0JBQUE7QUFEQSxTQUFBO0FBR0EsS0FoQ0E7O0FBa0NBLFdBQUEsWUFBQSxHQUFBLFlBQUE7QUFDQSxlQUFBLEVBQUEsQ0FBQSxVQUFBO0FBQ0EsS0FGQTtBQUdBLENBMUNBOztBQ1JBOztBQUVBLFNBQUEsTUFBQSxDQUFBLEdBQUEsRUFBQTs7QUFFQSxTQUFBLEdBQUEsR0FBQSxHQUFBOztBQUVBLFNBQUEsTUFBQSxHQUFBLEdBQUE7OztBQUdBLFNBQUEsS0FBQSxHQUFBLEdBQUE7Ozs7QUFJQSxTQUFBLFNBQUEsR0FBQSxHQUFBOzs7QUFHQSxTQUFBLG9CQUFBLEdBQUEsR0FBQTs7O0FBR0EsU0FBQSxLQUFBLEdBQUEsR0FBQTs7O0FBR0EsU0FBQSxPQUFBLEdBQUEsSUFBQTtBQUNBOzs7QUFHQSxPQUFBLFNBQUEsQ0FBQSxXQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQTs7QUFFQSxRQUFBLElBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLElBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLGNBQUEsTUFBQSxDQUFBLENBQUE7O0FBRUEsU0FBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxTQUFBLEtBQUEsQ0FBQSxTQUFBLEdBQUEsSUFBQTs7O0FBR0EsU0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBOzs7QUFHQSxTQUFBLG9CQUFBLEdBQUEsS0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBLENBZEE7O0FBZ0JBLE9BQUEsU0FBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUE7QUFDQSxRQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsRUFBQTtBQUNBLGVBQUEsTUFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLENBQUE7QUFDQSxLQUZBLE1BRUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLEVBQUE7QUFDQSxlQUFBLE1BQUEsU0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsS0FGQSxNQUVBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxFQUFBO0FBQ0EsZUFBQSxNQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtBQUNBLEtBRkEsTUFFQTtBQUNBLGVBQUEsTUFBQSxTQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLENBVkE7OztBQWFBLE9BQUEsU0FBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLElBQUEsRUFBQSxJQUFBLEVBQUE7QUFDQSxRQUFBLFFBQUEsS0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTs7QUFFQSxTQUFBLFNBQUEsQ0FBQSxPQUFBLEdBQUEsS0FBQSxRQUFBOztBQUVBLFNBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxJQUFBLEtBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBO0FBQ0EsQ0FUQTs7QUFXQSxPQUFBLFNBQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUE7OztBQUdBLFFBQUEsWUFBQSxRQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxlQUFBLENBQUEsU0FBQSxTQUFBO0FBQ0EsS0FGQSxFQUVBLENBRkEsQ0FBQTs7QUFJQSxXQUFBLFNBQUE7QUFDQSxDQVJBOzs7QUFXQSxPQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxRQUFBLFVBQUEsS0FBQSxNQUFBLENBQUEsS0FBQSxLQUFBLENBQUE7QUFDQSxXQUFBLE9BQUEsRUFBQTtBQUNBLGFBQUEsS0FBQSxDQUFBLFNBQUEsR0FBQSxJQUFBO0FBQ0EsYUFBQSxLQUFBLEdBQUEsS0FBQSxNQUFBLENBQUEsS0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLFdBQUEsS0FBQSxTQUFBO0FBQ0EsWUFBQSxXQUFBLFNBQUEsUUFBQSxDQUFBO0FBQ0EsYUFBQSxTQUFBLEdBQUEsUUFBQTs7QUFFQSxhQUFBLFVBQUE7QUFDQSxrQkFBQSxLQUFBLE1BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBO0FBQ0EsQ0FaQTs7QUFjQSxPQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsZUFBQSxLQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsZUFBQSxTQUFBLFNBQUE7QUFDQSxLQUZBLENBQUE7O0FBSUEsUUFBQSxLQUFBLEtBQUEsQ0FBQSxJQUFBLElBQUEsYUFBQSxNQUFBLEtBQUEsQ0FBQSxFQUFBLEtBQUEsR0FBQTtBQUNBLENBTkE7O0FBUUEsT0FBQSxTQUFBLENBQUEsR0FBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLE9BQUEsR0FBQSxLQUFBOztBQUVBLENBSEEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciB0c3VybyA9IGFuZ3VsYXIubW9kdWxlKCdUc3VybycsIFsndWkucm91dGVyJywgJ2ZpcmViYXNlJ10pO1xuXG50c3Vyby5jb25maWcoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB7XG4gICAgICAgIGFwaUtleTogXCJBSXphU3lDTG0zamtrNXBwTXFlUXhLb0gtZFo5Q2RZTWFER1dXcVVcIixcbiAgICAgICAgYXV0aERvbWFpbjogXCJ0aGUtcGF0aHMtb2YtZHJhZ29ucy5maXJlYmFzZWFwcC5jb21cIixcbiAgICAgICAgZGF0YWJhc2VVUkw6IFwiaHR0cHM6Ly90aGUtcGF0aHMtb2YtZHJhZ29ucy5maXJlYmFzZWlvLmNvbVwiLFxuICAgICAgICBzdG9yYWdlQnVja2V0OiBcInRoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tXCIsXG4gICAgfTtcbiAgICBmaXJlYmFzZS5pbml0aWFsaXplQXBwKGNvbmZpZyk7XG59KTtcblxudHN1cm8uY29uc3RhbnQoJ2ZpcmViYXNlVXJsJywgJ2h0dHBzOi8vcGF0aC1vZi10aGUtZHJhZ29uLmZpcmViYXNlaW8uY29tLycpO1xuXG50c3Vyby5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbn0pO1xuIiwiZnVuY3Rpb24gQm9hcmQoKSB7XG4gICAgdGhpcy5ib2FyZCA9IFtdO1xufVxuXG5Cb2FyZC5wcm90b3R5cGUuZHJhd0JvYXJkID0gZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgNjsgeSsrKSB7XG4gICAgICAgIGlmICghdGhpcy5ib2FyZFt5XSkgdGhpcy5ib2FyZFt5XSA9IFtdO1xuICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IDY7IHgrKykge1xuICAgICAgICAgICAgdGhpcy5ib2FyZFt5XS5wdXNoKG5ldyBTcGFjZSh4LCB5LCB0aGlzLmJvYXJkKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYm9hcmQ7XG59XG5cbmZ1bmN0aW9uIFNwYWNlKHgsIHksIGJvYXJkKSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICAgIHRoaXMuaW1hZ2UgPSBudWxsO1xuICAgIHRoaXMucG9pbnRzID0gW251bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGxdO1xuICAgIHRoaXMudGlsZVVybDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICBsZXQgY29ycmVzcG9uZGluZztcblxuICAgICAgICBpZiAoaSA8IDIpIHsgLy90b3BcbiAgICAgICAgICAgIGNvcnJlc3BvbmRpbmcgPSBpID09PSAwID8gNSA6IDQ7IC8vIDAgLT4gNSAmIDEgLT4gNFxuICAgICAgICAgICAgaWYgKHkgPT09IDApIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KHRydWUpO1xuICAgICAgICAgICAgZWxzZSB0aGlzLnBvaW50c1tpXSA9IGJvYXJkW3kgLSAxXVt4XS5wb2ludHNbY29ycmVzcG9uZGluZ107XG4gICAgICAgIH0gZWxzZSBpZiAoaSA8IDQpIHsgLy9yaWdodFxuICAgICAgICAgICAgaWYgKHggPT09IDUpIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KHRydWUpO1xuICAgICAgICAgICAgZWxzZSB0aGlzLnBvaW50c1tpXSA9IG5ldyBQb2ludChmYWxzZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaSA8IDYpIHsgLy9ib3R0b21cbiAgICAgICAgICAgIGlmICh5ID09PSA1KSB0aGlzLnBvaW50c1tpXSA9IG5ldyBQb2ludCh0cnVlKTtcbiAgICAgICAgICAgIGVsc2UgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQoZmFsc2UpO1xuICAgICAgICB9IGVsc2UgeyAvL2xlZnRcbiAgICAgICAgICAgIGNvcnJlc3BvbmRpbmcgPSBpID09PSA2ID8gMyA6IDI7IC8vIDYgLT4gMyAmIDcgLT4gMlxuICAgICAgICAgICAgaWYgKHggPT09IDApIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KHRydWUpO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb2ludHNbaV0gPSBib2FyZFt5XVt4IC0gMV0ucG9pbnRzW2NvcnJlc3BvbmRpbmddO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5cbi8vIGVkZ2UgPSBib29sZWFuXG5mdW5jdGlvbiBQb2ludChlZGdlKSB7XG4gICAgdGhpcy5lZGdlID0gZWRnZTtcbiAgICB0aGlzLm5laWdoYm9ycyA9IFtdO1xuICAgIHRoaXMudHJhdmVsbGVkID0gZmFsc2U7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmNsYXNzIERlY2sge1xuICAgIGNvbnN0cnVjdG9yKHRpbGVzKSB7XG4gICAgICAgIHRoaXMudGlsZXMgPSB0aWxlc1xuICAgIH1cblxuICAgIHNodWZmbGUoKSB7XG4gICAgICAgIHRoaXMudGlsZXMgPSBfLnNodWZmbGUodGhpcy50aWxlcylcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZGVhbFRocmVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlcy5zcGxpY2UoMCwgMyk7XG4gICAgfVxuXG4gICAgZGVhbChudW0pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZXMuc3BsaWNlKDAsIG51bSk7XG4gICAgfVxuXG4gICAgcmVsb2FkKHRpbGVzKSB7XG4gICAgICAgIHRoaXMudGlsZXMucHVzaCh0aWxlcylcbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vR0FNRS8vL1xuXG5jbGFzcyBHYW1lIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuY291bnQgPSAzNTtcbiAgICAgICAgdGhpcy5ib2FyZCA9IG5ldyBCb2FyZCgpLmRyYXdCb2FyZCgpO1xuICAgICAgICB0aGlzLnBsYXllcnMgPSBbXTtcbiAgICAgICAgdGhpcy5hdmFpbGFibGVNYXJrZXJzID0gW1wicmVkXCIsIFwib3JhbmdlXCIsIFwieWVsbG93XCIsIFwiZ3JlZW5cIiwgXCJhcXVhXCIsIFwiYmx1ZVwiLCBcIm5hdnlcIiwgXCJwdXJwbGVcIl1cblxuICAgICAgICB0aGlzLmN1cnJQbGF5ZXI7IC8vaW5kZXggb2YgdGhlIGN1cnJlbnRQbGF5ZXIgaW4gdGhlIHR1cm5PcmRlckFycmF5XG4gICAgICAgIHRoaXMudHVybk9yZGVyQXJyYXkgPSBbXSAvL2hvbGRzIGFsbCB0aGUgcGxheWVycyBzdGlsbCBvbiB0aGUgYm9hcmQuXG4gICAgICAgIHRoaXMuZHJhZ29uID0gXCJcIjsgLy8gUGxheWVyLk1hcmtlclxuICAgICAgICB0aGlzLm1vdmVzO1xuICAgIH1cblxuICAgIGdldEN1cnJlbnRQbGF5ZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJQbGF5ZXIgPT09IC0xKSByZXR1cm47XG4gICAgICAgIHJldHVybiB0aGlzLnR1cm5PcmRlckFycmF5W3RoaXMuY3VyclBsYXllcl07XG4gICAgfTtcblxuICAgIG1vdmVBbGxQbGF5ZXJzKCkge1xuICAgICAgICB0aGlzLnBsYXllcnMuZm9yRWFjaCgocGxheWVyKSA9PiBwbGF5ZXIua2VlcE1vdmluZyhwbGF5ZXIpKVxuICAgIH07XG4gICAgZGVhZFBsYXllcnMoKSB7XG4gICAgICAgIHZhciBkZWFkUGxheWVyc1RpbGVzID0gW107XG4gICAgICAgIHRoaXMucGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICAgICAgIGlmICghcGxheWVyLmNhblBsYXkgJiYgcGxheWVyLnRpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBkZWFkUGxheWVyc1RpbGVzLnB1c2gocGxheWVyLnRpbGVzKTtcbiAgICAgICAgICAgICAgICBpc0RlYWRQbGF5ZXIgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGRlYWRQbGF5ZXJzVGlsZXM7XG4gICAgfTtcblxuICAgIGNoZWNrT3ZlcigpIHtcbiAgICAgICAgcmV0dXJuIGdldENhblBsYXkoKS5sZW5ndGggPD0gMTtcbiAgICB9XG5cbiAgICAvL3RvIGJlIGNhbGxlZCBhdCB0aGUgZW5kIG9mIGEgdHVybiB0byBzZXQgdGhlIGN1cnJQbGF5ZXIgdG8gdGhlIG5leHQgZWxpZ2libGUgcGxheWVyIGluIHRoZSB0dXJuT3JkZXJBcnJheVxuICAgIGdvVG9OZXh0UGxheWVyKCkge1xuICAgICAgICBpZiAoZ2V0Q2FuUGxheSh0aGlzLnR1cm5PcmRlckFycmF5KS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBsZXQgbmV3SWR4ID0gdGhpcy5jdXJyUGxheWVyICsgMTtcbiAgICAgICAgICAgIHdoaWxlICghdGhpcy50dXJuT3JkZXJBcnJheVtuZXdJZHggJSA4XS5jYW5QbGF5KSB7XG4gICAgICAgICAgICAgICAgbmV3SWR4Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmN1cnJQbGF5ZXIgPSBuZXdJZHg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJQbGF5ZXIgPSAtMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5nZXRDdXJyZW50UGxheWVyKCk7XG4gICAgfTtcblxuICAgIC8vcmVzdGFydCB0aGUgZ2FtZVxuICAgIHJlc2V0KCkge1xuICAgICAgICB0aGlzLnBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgICAgICAgLy9yZXRyaWV2ZSBhbGwgdGlsZXNcbiAgICAgICAgICAgIC8vcmV0dXJuIHBsYXllcidzIHRpbGVzIHRvIHRoZSBkZWNrIGFuZCBzaHVmZmxlXG4gICAgICAgICAgICB0aGlzLmRlY2sucmVsb2FkKHBsYXllci50aWxlcykuc2h1ZmZsZSgpO1xuICAgICAgICAgICAgcGxheWVyLnRpbGVzID0gW107XG4gICAgICAgICAgICAvL3Jlc2V0IGFsbCBwbGF5ZXJzIHBsYXlhYmlsaXR5XG4gICAgICAgICAgICBwbGF5ZXIuY2FuUGxheSA9IHRydWU7XG4gICAgICAgIH0pXG4gICAgfTtcblxufVxuXG4vLy8vL0VORCBPRiBHQU1FIENMQVNTLy8vLy9cblxuLy9nZXQgRWxpZ2libGUgcGxheWVyc1xubGV0IGdldENhblBsYXkgPSBmdW5jdGlvbiAocGxheWVycykge1xuICAgIHJldHVybiBwbGF5ZXJzLmZpbHRlcigocGxheWVyKSA9PiB7XG4gICAgICAgIHJldHVybiBwbGF5ZXIuY2FuUGxheVxuICAgIH0pXG59XG4iLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2dhbWUnLCB7XG4gICAgICAgIHVybDogJy9nYW1lLzpnYW1lTmFtZScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2Jyb3dzZXIvanMvZ2FtZS9nYW1lLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnZ2FtZUN0cmwnXG4gICAgfSk7XG59KTtcblxudHN1cm8uY29udHJvbGxlcignZ2FtZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkZmlyZWJhc2VBdXRoLCBmaXJlYmFzZVVybCwgJHN0YXRlUGFyYW1zLCAkZmlyZWJhc2VPYmplY3QsICRmaXJlYmFzZUFycmF5KSB7XG4gICAgJHNjb3BlLnRpbGUgPSB7XG4gICAgICAgIGltYWdlVXJsOiBcIlwiLFxuICAgICAgICBwYXRoczogWzMsIDQsIDYsIDAsIDEsIDcsIDIsIDVdLFxuICAgICAgICByb3RhdGlvbjogMFxuICAgIH07XG5cbiAgICB2YXIgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbiAgICB2YXIgb2JqID0gJGZpcmViYXNlT2JqZWN0KHJlZik7XG5cbiAgICB2YXIgZ2FtZVJlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZCgkc3RhdGVQYXJhbXMuZ2FtZU5hbWUpO1xuICAgIHZhciBkZWNrUmVmID0gZ2FtZVJlZi5jaGlsZCgnaW5pdGlhbERlY2snKTtcbiAgICB2YXIgcGxheWVyc1JlZiA9IGdhbWVSZWYuY2hpbGQoJ3BsYXllcnMnKTtcbiAgICB2YXIgbWFya2Vyc1JlZiA9IGdhbWVSZWYuY2hpbGQoJ2F2YWlsYWJsZU1hcmtlcnMnKTtcbiAgICB2YXIgZGVja0FyciA9ICRmaXJlYmFzZUFycmF5KGRlY2tSZWYpO1xuXG4gICAgLy8gaW50aWFsaXplIGdhbWVcbiAgICAkc2NvcGUuZ2FtZSA9IG5ldyBHYW1lKCRzdGF0ZVBhcmFtcy5nYW1lTmFtZSwgJHN0YXRlUGFyYW1zLmRlY2spO1xuICAgICRzY29wZS5nYW1lLmRlY2sgPSAkZmlyZWJhc2VPYmplY3QoZGVja1JlZik7XG5cbiAgICB2YXIgbWFya2Vyc0FyciA9ICRmaXJlYmFzZUFycmF5KG1hcmtlcnNSZWYpO1xuICAgIG1hcmtlcnNBcnIuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgJHNjb3BlLmdhbWUuYXZhaWxhYmxlTWFya2VycyA9IGRhdGFbMF07XG4gICAgICAgICRzY29wZS5nYW1lLmF2YWlsYWJsZU1hcmtlcnMgPSAkc2NvcGUuZ2FtZS5hdmFpbGFibGVNYXJrZXJzLmZpbHRlcihmdW5jdGlvbiAoZWxlbSkge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBlbGVtID09PSBcInN0cmluZ1wiO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIG1hcmtlcnNSZWYub24oJ2NoaWxkX2NoYW5nZWQnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAkc2NvcGUuZ2FtZS5hdmFpbGFibGVNYXJrZXJzID0gZGF0YS52YWwoKTtcbiAgICB9KTtcblxuICAgIGZpcmViYXNlLmF1dGgoKS5vbkF1dGhTdGF0ZUNoYW5nZWQoZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgdmFyIGZpcmViYXNlUGxheWVyc0FyciA9ICRmaXJlYmFzZUFycmF5KHBsYXllcnNSZWYpO1xuXG4gICAgICAgIGZpcmViYXNlUGxheWVyc0Fyci4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgdmFyIEZCcGxheWVycyA9IGRhdGE7XG5cbiAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgdmFyIHVzZXJBdXRoSWQgPSB1c2VyLnVpZDtcbiAgICAgICAgICAgICAgICB2YXIgbWUgPSBGQnBsYXllcnMuZmlsdGVyKHBsYXllciA9PiBwbGF5ZXIudWlkID09PSB1c2VyQXV0aElkKVswXTtcbiAgICAgICAgICAgICAgICBpZiAobWUpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm1lID0gbWU7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5tZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBsYXllci5wcm90b3R5cGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLm1lLm1hcmtlciA9PT0gXCJuXCIpICRzY29wZS5tZS5tYXJrZXIgPSBudWxsO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBObyB1c2VyIGlzIHNpZ25lZCBpbi5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIm5vdGhpbmdcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgJHNjb3BlLnBpY2tNYXJrZXIgPSBmdW5jdGlvbiAoYm9hcmQsIG1hcmtlcikge1xuICAgICAgICAkc2NvcGUubWUubWFya2VyID0gbWFya2VyO1xuICAgICAgICB2YXIgZmlyZWJhc2VQbGF5ZXJzQXJyID0gJGZpcmViYXNlQXJyYXkocGxheWVyc1JlZik7XG5cbiAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyLiRsb2FkZWQoKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWVJZHg7XG5cbiAgICAgICAgICAgICAgICBwbGF5ZXJzLmZpbmQoZnVuY3Rpb24gKGUsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUuJGlkID09PSAkc2NvcGUubWUuJGlkKSBtZUlkeCA9IGk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLm1hcmtlciA9IG1hcmtlcjtcbiAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJHNhdmUobWVJZHgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGlkeCA9ICRzY29wZS5nYW1lLmF2YWlsYWJsZU1hcmtlcnMuaW5kZXhPZihtYXJrZXIpO1xuXG4gICAgICAgICRzY29wZS5nYW1lLmF2YWlsYWJsZU1hcmtlcnMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgIG1hcmtlcnNBcnJbMF0uc3BsaWNlKGlkeCwgMSk7XG5cbiAgICAgICAgbWFya2Vyc0Fyci4kc2F2ZSgwKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlZikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlZCB0aGUgcGlja2VkIG1hcmtlclwiKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZWYua2V5KTtcbiAgICAgICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvL0hhdmUgcGxheWVyIHBpY2sgdGhlaXIgc3RhcnQgcG9pbnRcblxuICAgICRzY29wZS5wbGFjZU1hcmtlciA9IGZ1bmN0aW9uIChib2FyZCwgcG9pbnQpIHtcbiAgICAgICAgJHNjb3BlLm1lLnByb3RvdHlwZS5wbGFjZU1hcmtlcihib2FyZCwgcG9pbnQsICRzY29wZS5tZSk7XG4gICAgICAgICRzY29wZS5nYW1lLnBsYXllcnMucHVzaCgkc2NvcGUubWUpO1xuICAgICAgICB2YXIgZmlyZWJhc2VQbGF5ZXJzQXJyID0gJGZpcmViYXNlQXJyYXkocGxheWVyc1JlZik7XG5cbiAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyLiRsb2FkZWQoKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWVJZHg7XG5cbiAgICAgICAgICAgICAgICBwbGF5ZXJzLmZpbmQoZnVuY3Rpb24gKGUsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUuJGlkID09PSAkc2NvcGUubWUuJGlkKSBtZUlkeCA9IGk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdID0gJHNjb3BlLm1lO1xuICAgICAgICAgICAgICAgIGZpcmViYXNlUGxheWVyc0Fyci4kc2F2ZShtZUlkeCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XSlcbiAgICAgICAgICAgIH0pO1xuXG4gICAgfTtcblxuICAgIC8vdGFrZSBhbGwgcGxheWVycyBvbiBmaXJlYmFzZSBhbmQgdHVybiB0aGVtIGludG8gbG9jYWwgcGxheWVyXG4gICAgcGxheWVyc1JlZi5vbihcImNoaWxkX2FkZGVkXCIsIGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICAgdmFyIG5ld1BsYXllciA9IG5ldyBQbGF5ZXIocGxheWVyLnVpZCk7XG4gICAgICAgIG5ld1BsYXllci5tYXJrZXIgPSBwbGF5ZXIubWFya2VyO1xuXG4gICAgICAgIHZhciB4ID0gcGxheWVyLnN0YXJ0aW5nUG9zaXRpb25bMF07XG4gICAgICAgIHZhciB5ID0gcGxheWVyLnN0YXJ0aW5nUG9zaXRpb25bMV07XG4gICAgICAgIHZhciBwb2ludHNJbmRleCA9IHBsYXllci5zdGFydGluZ1Bvc2l0aW9uWzJdO1xuXG4gICAgICAgIG5ld1BsYXllci5wb2ludCA9IGJvYXJkW3ldW3hdLnBvaW50c1twb2ludHNJbmRleF07XG4gICAgICAgIG5ld1BsYXllci5uZXh0U3BhY2UgPSBib2FyZFt5XVt4XTtcbiAgICAgICAgbmV3UGxheWVyLm5leHRTcGFjZVBvaW50c0luZGV4ID0gcGxheWVyLnN0YXJ0aW5nUG9zaXRpb25bMl07XG5cbiAgICAgICAgbmV3UGxheWVyLnRpbGVzID0gJHNjb3BlLmdhbWUuZGVjay5kZWFsVGhyZWUoKTtcblxuICAgICAgICAkc2NvcGUuZ2FtZS5wbGF5ZXJzLnB1c2gobmV3UGxheWVyKTtcbiAgICB9KTtcblxuXG5cblxuXG5cblxuICAgIC8vIFRPRE86IHdlIHByb2JhYmx5IG5lZWQgdGhpcyBvbiBmaXJlYmFzZSBzbyBvdGhlciBwZW9wbGUgY2FuJ3QgcGljayB3aGF0J3MgYmVlbiBwaWNrZWRcblxuICAgIC8vRm9yIHN5bmNocm9uaXppbmdHYW1lLi4uXG4gICAgdmFyIHN5bmNSZWYgPSBnYW1lUmVmLmNoaWxkKCdtb3ZlcycpO1xuICAgIHN5bmNSZWYub24oJ2NoaWxkX2FkZGVkJywgZnVuY3Rpb24gKGNoaWxkU25hcHNob3QsIHByZXZDaGlsZEtleSkge1xuICAgICAgICAvL05FRUQgVE8gRE9VQkxFIENIRUNLISEgV2hhdCBkb2VzIGNoaWxkU25hcCByZXR1cm5zP1xuICAgICAgICBjb25zb2xlLmxvZygnY2hpbGRTbmFwc2hvdF9TeW5jR2FtZScsIGNoaWxkU25hcHNob3QpO1xuICAgICAgICAvL2RlcGVuZGluZyBvbiB3aGF0IGNoaWxkU25hcHNob3QgZ2l2ZXMgbWUuLi5JIHRoaW5rIGl0J3Mgb25lIGNoaWxkIHBlciBvbiBjYWxsPyBJdCBkb2Vzbid0IHJldHVybiBhbiBhcnJheSBvZiBjaGFuZ2VzLi4uSSBiZWxpZXZlIVxuICAgICAgICBpZiAoY2hpbGRTbmFwc2hvdC50eXBlID09PSAndXBkYXRlRGVjaycpIHtcbiAgICAgICAgICAgICRzY29wZS5nYW1lLmRlY2sgPSBjaGlsZFNuYXBzaG90LnVwZGF0ZURlY2s7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkc2NvcGUucGxhY2VUaWxlKGNoaWxkU25hcHNob3QudGlsZSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFRPRE86IGhvdyB0byByZS1kbyB0aGUgbW92ZXM/XG4gICAgLy8gJHNjb3BlLmdhbWUubW92ZXM7XG5cbiAgICAvLyBUT0RPOiBob3cgZG8gd2Ugc2hvdyB0aGUgdGlsZXMgZm9yIHBsYXllcj9cblxuICAgIC8vIFRPRE86IGhvdyB0byBzaG93IHRoZSByb3RhdGVkIHRpbGU/XG5cbiAgICAvLyBDTVQ6IGFzc3VtaW5nIHdlIHVzZSBuZXcgR2FtZSgpIGZvciBlYWNoIGdhbWVcbiAgICAkc2NvcGUuY3VycmVudFBsYXllciA9ICRzY29wZS5nYW1lLmdldEN1cnJlbnRQbGF5ZXIoKTtcblxuICAgIC8vIFRPRE86IG5lZWQgYSBmdW5jdGlvbiB0byBhc3NpZ24gZHJhZ29uXG4gICAgJHNjb3BlLmRyYWdvbjtcbiAgICB2YXIgYXdhaXRpbmdEcmFnb25Ib2xkZXJzID0gW107XG5cbiAgICAkc2NvcGUuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vXG4gICAgfTtcblxuICAgICRzY29wZS5teVR1cm4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzY29wZS5tZSA9PT0gJHNjb3BlLmN1cnJlbnRQbGF5ZXI7XG4gICAgfTtcblxuICAgIC8vdGhlc2UgYXJlIHRpZWQgdG8gYW5ndWxhciBuZy1jbGljayBidXR0b25zXG4gICAgJHNjb3BlLnJvdGF0ZVRpbGVDdyA9IGZ1bmN0aW9uICh0aWxlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicm90YXRlIHRvIHJpZ2h0XCIpXG4gICAgICAgIHRpbGUucm90YXRpb24rKztcbiAgICAgICAgaWYgKHRpbGUucm90YXRpb24gPT09IDQpIHRpbGUucm90YXRpb24gPSAwO1xuICAgIH07XG5cbiAgICAkc2NvcGUucm90YXRlVGlsZUNjdyA9IGZ1bmN0aW9uICh0aWxlKSB7XG4gICAgICAgIHRpbGUucm90YXRpb24tLTtcbiAgICAgICAgaWYgKHRpbGUucm90YXRpb24gPT09IC00KSB0aWxlLnJvdGF0aW9uID0gMDtcbiAgICB9O1xuXG5cbiAgICAvLyBDTVQ6IHVzZSBwbGF5ZXIncyBhbmQgZ2FtZSdzIHByb3RvdHlwZSBmdW5jdGlvbiB0byBwbGFjZSB0aWxlIGFuZCB0aGVuIG1vdmUgYWxsIHBsYXllcnNcbiAgICAkc2NvcGUucGxhY2VUaWxlID0gZnVuY3Rpb24gKHRpbGUpIHtcbiAgICAgICAgLy8gVE9ETzogc2VuZCB0aGlzIHN0YXRlIHRvIGZpcmViYXNlIGV2ZXJ5IHRpbWUgaXQncyBjYWxsZWRcbiAgICAgICAgaWYgKHRpbGUucm90YXRpb24gPiAwKSB7XG4gICAgICAgICAgICB0aWxlLnBhdGhzID0gdGlsZS5wYXRocy5tYXAoZnVuY3Rpb24gKGNvbm5lY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uID0gY29ubmVjdGlvbiArIDI7XG4gICAgICAgICAgICAgICAgaWYgKGNvbm5lY3Rpb24gPT09IDkpIGNvbm5lY3Rpb24gPSAxO1xuICAgICAgICAgICAgICAgIGlmIChjb25uZWN0aW9uID09PSA4KSBjb25uZWN0aW9uID0gMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29ubmVjdGlvbjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGlsZS5wYXRocy51bnNoaWZ0KHRpbGUucGF0aHMucG9wKCkpO1xuICAgICAgICAgICAgdGlsZS5wYXRocy51bnNoaWZ0KHRpbGUucGF0aHMucG9wKCkpO1xuICAgICAgICB9IGVsc2UgaWYgKHRpbGUucm90YXRpb24gPCAwKSB7XG4gICAgICAgICAgICB0aWxlLnBhdGhzID0gdGlsZS5wYXRocy5tYXAoZnVuY3Rpb24gKGNvbm5lY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uID0gY29ubmVjdGlvbiAtIDI7XG4gICAgICAgICAgICAgICAgaWYgKGNvbm5lY3Rpb24gPT09IC0yKSBjb25uZWN0aW9uID0gNjtcbiAgICAgICAgICAgICAgICBpZiAoY29ubmVjdGlvbiA9PT0gLTEpIGNvbm5lY3Rpb24gPSA3O1xuICAgICAgICAgICAgICAgIHJldHVybiBjb25uZWN0aW9uO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aWxlLnBhdGhzLnB1c2godGlsZS5wYXRocy5zaGlmdCgpKTtcbiAgICAgICAgICAgIHRpbGUucGF0aHMucHVzaCh0aWxlLnBhdGhzLnNoaWZ0KCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLm1lLnByb3RvdHlwZS5wbGFjZVRpbGUodGlsZSwgJHNjb3BlLm1lKTtcbiAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLm1lKVxuXG4gICAgICAgIC8vIENNVDogdGhpcyBzaG91bGQgc2VuZCB0aGUgcm90YXRlZCB0aWxlIHRvIGZpcmViYXNlXG4gICAgICAgIGdhbWVSZWYuY2hpbGQoJ21vdmVzJykuJGFkZCh7XG4gICAgICAgICAgICAndHlwZSc6ICdwbGFjZVRpbGUnLFxuICAgICAgICAgICAgJ3RpbGUnOiB0aWxlXG4gICAgICAgIH0pO1xuICAgICAgICAvL1xuICAgICAgICAvLyAkc2NvcGUuZ2FtZS5tb3ZlQWxscGxheWVycygpO1xuICAgICAgICAvL1xuICAgICAgICAvLyBpZiAoJHNjb3BlLmdhbWUuY2hlY2tPdmVyKCkpIHtcbiAgICAgICAgLy8gICAgIC8vIFRPRE86IG5lZWQgdG8gdGVsbCB0aGUgcGxheWVyIHNoZSB3b25cbiAgICAgICAgLy8gICAgICRzY29wZS53aW5uZXIgPSAkc2NvcGUuZ2FtZS5nZXRDYW5QbGF5KClbMF07XG4gICAgICAgIC8vICAgICAkc2NvcGUuZ2FtZU92ZXIgPSB0cnVlO1xuICAgICAgICAvLyB9IGVsc2Uge1xuICAgICAgICAvLyAgICAgLy8gSWYgZGVjayBpcyBlbXB0eSAmIG5vIG9uZSBpcyBkcmFnb24sIHNldCBtZSBhcyBkcmFnb25cbiAgICAgICAgLy8gICAgIGlmICgkc2NvcGUuZ2FtZS5kZWNrLmxlbmd0aCA9PT0gMCAmJiAhJHNjb3BlLmRyYWdvbikge1xuICAgICAgICAvLyAgICAgICAgICRzY29wZS5kcmFnb24gPSAkc2NvcGUubWU7XG4gICAgICAgIC8vICAgICB9IGVsc2UgaWYgKCRzY29wZS5nYW1lLmRlY2subGVuZ3RoID09PSAwICYmICRzY29wZS5kcmFnb24pIHtcbiAgICAgICAgLy8gICAgICAgICBhd2FpdGluZ0RyYWdvbkhvbGRlcnMucHVzaCgkc2NvcGUubWUpO1xuICAgICAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gICAgICAgICAvLyBDTVQ6IGRyYXcgb25lIHRpbGUgYW5kIHB1c2ggaXQgdG8gdGhlIHBsYXllci50aWxlcyBhcnJheVxuICAgICAgICAvLyAgICAgICAgICRzY29wZS5tZS50aWxlcy5wdXNoKCRzY29wZS5nYW1lLmRlY2suZGVhbCgxKSk7XG4gICAgICAgIC8vICAgICAgICAgLy9pZiBkZWFkIHBsYXllcnMsIHRoZW4gcHVzaCB0aGVpciBjYXJkcyBiYWNrIHRvIHRoZSBkZWNrICYgcmVzaHVmZmxlXG4gICAgICAgIC8vICAgICAgICAgaWYgKCRzY29wZS5nYW1lLmRlYWRQbGF5ZXJzKCkubGVuZ3RoKSB7XG4gICAgICAgIC8vICAgICAgICAgICAgIC8vd2l0aCBuZXcgY2FyZHMgJiBuZWVkIHRvIHJlc2h1ZmZsZVxuICAgICAgICAvLyAgICAgICAgICAgICAkc2NvcGUuZ2FtZS5kZWFkUGxheWVycygpLmZvckVhY2goZnVuY3Rpb24gKGRlYWRQbGF5ZXJUaWxlcykge1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgZGVhZFBsYXllclRpbGVzLmZvckVhY2goZnVuY3Rpb24gKHRpbGUpIHtcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZ2FtZS5kZWNrLnB1c2godGlsZSk7XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgLy8gICAgICAgICAgICAgfSk7XG4gICAgICAgIC8vICAgICAgICAgICAgICRzY29wZS5nYW1lLmRlY2sgPSAkc2NvcGUuZ2FtZS5kZWNrLnNodWZmbGUoKTtcbiAgICAgICAgLy8gICAgICAgICAgICAgLy9zZW5kIGZpcmViYXNlIGEgbmV3IG1vdmVcbiAgICAgICAgLy8gICAgICAgICAgICAgZ2FtZVJlZi5jaGlsZCgnbW92ZXMnKS5wdXNoKHtcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICd0eXBlJzogJ3VwZGF0ZURlY2snLFxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgJ3VwZGF0ZURlY2snOiAkc2NvcGUuZ2FtZS5kZWNrXG4gICAgICAgIC8vICAgICAgICAgICAgIH0pO1xuICAgICAgICAvLyAgICAgICAgICAgICBpZiAoJHNjb3BlLmRyYWdvbikge1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgJHNjb3BlLmRyYWdvbi50aWxlcy5wdXNoKCRzY29wZS5nYW1lLmRlY2suZGVhbCgxKSk7XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAkc2NvcGUuZHJhZ29uID0gbnVsbDtcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIC8vTkVFRCBUTyBESVNDVVNTOiBNaWdodCBuZWVkIHRvIG1vZGlmeSB0aGlzIGlmIHdlIHdhbnQgdG8gdXNlIHVwIHRoZSBjYXJkcyBhbmQgZ2l2ZSBlYWNoIGF3YWl0aW5nIHBsYXllcnMnIHVwIHRvIDMgY2FyZHNcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIHdoaWxlICgkc2NvcGUuZ2FtZS5kZWNrLmxlbmd0aCAmJiAkc2NvcGUuYXdhaXRpbmdEcmFnb25Ib2xkZXJzLmxlbmd0aCkge1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICRzY29wZS5hd2FpdGluZ0RyYWdvbkhvbGRlcnMuc2hpZnQoKS50aWxlcy5wdXNoKCRzY29wZS5nYW1lLmRlY2suZGVhbCgxKSk7XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS5hd2FpdGluZ0RyYWdvbkhvbGRlcnMubGVuZ3RoKSB7XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRyYWdvbiA9ICRzY29wZS5hd2FpdGluZ0RyYWdvbkhvbGRlcnMuc2hpZnQoKTtcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIH1cbiAgICAgICAgLy8gICAgICAgICAgICAgfTtcbiAgICAgICAgLy8gICAgICAgICB9XG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vICAgICAkc2NvcGUuZ2FtZS5nb1RvTmV4dFBsYXllcigpO1xuICAgICAgICAvLyB9XG4gICAgfTtcblxuICAgIC8vIFRPRE86IGZpcmViYXNlIGdhbWUucGxheWVycyBzbGljZSAkc2NvcGUucGxheWVyIG91dFxuICAgICRzY29wZS5sZWF2ZUdhbWU7XG5cbiAgICAvLyBUT0RPOiBuZWVkIHRvIHJlbW92ZSB0aGlzIGdhbWUgcm9vbSdzIG1vdmVzIGZyb20gZmlyZWJhc2U/XG4gICAgJHNjb3BlLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBtYXJrZXJzQXJyLiRyZW1vdmUoMClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZWYpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInJlbW92ZWQgYWxsIG1hcmtlcnNcIiwgcmVmLmtleSlcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGRlY2tBcnIuJHJlbW92ZSgwKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlZikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlZCB0aGUgZGVja1wiLCByZWYua2V5KVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgb2JqLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICB2YXIgdGlsZXMgPSBkYXRhLnRpbGVzXG4gICAgICAgICAgICB2YXIgZGVjayA9IG5ldyBEZWNrKHRpbGVzKS5zaHVmZmxlKCkudGlsZXM7XG4gICAgICAgICAgICB2YXIgaW5pdGlhbERlY2tSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoJHN0YXRlUGFyYW1zLmdhbWVOYW1lKS5jaGlsZCgnaW5pdGlhbERlY2snKTtcbiAgICAgICAgICAgICRmaXJlYmFzZUFycmF5KGluaXRpYWxEZWNrUmVmKS4kYWRkKGRlY2spO1xuICAgICAgICB9KVxuXG5cblxuICAgICAgICB2YXIgaW5pdGlhbE1hcmtlcnNSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoJHN0YXRlUGFyYW1zLmdhbWVOYW1lKS5jaGlsZCgnYXZhaWxhYmxlTWFya2VycycpO1xuICAgICAgICAkZmlyZWJhc2VBcnJheShpbml0aWFsTWFya2Vyc1JlZikuJGFkZChbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJ5ZWxsb3dcIiwgXCJncmVlblwiLCBcImFxdWFcIiwgXCJibHVlXCIsIFwibmF2eVwiLCBcInB1cnBsZVwiXSk7XG5cblxuICAgICAgICB2YXIgcGxheWVycyA9ICRmaXJlYmFzZUFycmF5KHBsYXllcnNSZWYpO1xuICAgICAgICBwbGF5ZXJzLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBkYXRhW2ldLmNhblBsYXkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGRhdGFbaV0ubWFya2VyID0gJ24nO1xuICAgICAgICAgICAgICAgIGRhdGFbaV0ubmV4dFNwYWNlID0gJ24nO1xuICAgICAgICAgICAgICAgIGRhdGFbaV0ubmV4dFNwYWNlUG9pbnRzSW5kZXggPSAnbic7XG4gICAgICAgICAgICAgICAgZGF0YVtpXS5wb2ludCA9ICduJztcbiAgICAgICAgICAgICAgICBkYXRhW2ldLnRpbGVzID0gJ24nO1xuICAgICAgICAgICAgICAgIHBsYXllcnMuJHNhdmUoaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLm1lKVxuXG4gICAgfTtcblxuXG4gICAgJHNjb3BlLnN0YXJ0dG9wID0gW1xuICAgICAgICBbMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAxXSxcbiAgICAgICAgWzEsIDAsIDBdLFxuICAgICAgICBbMSwgMCwgMV0sXG4gICAgICAgIFsyLCAwLCAwXSxcbiAgICAgICAgWzIsIDAsIDFdLFxuICAgICAgICBbMywgMCwgMF0sXG4gICAgICAgIFszLCAwLCAxXSxcbiAgICAgICAgWzQsIDAsIDBdLFxuICAgICAgICBbNCwgMCwgMV0sXG4gICAgICAgIFs1LCAwLCAwXSxcbiAgICAgICAgWzUsIDAsIDFdXG4gICAgXTtcbiAgICAkc2NvcGUuc3RhcnRsZWZ0ID0gW1xuICAgICAgICBbMCwgMCwgN10sXG4gICAgICAgIFswLCAwLCA2XSxcbiAgICAgICAgWzAsIDEsIDddLFxuICAgICAgICBbMCwgMSwgNl0sXG4gICAgICAgIFswLCAyLCA3XSxcbiAgICAgICAgWzAsIDIsIDZdLFxuICAgICAgICBbMCwgMywgN10sXG4gICAgICAgIFswLCAzLCA2XSxcbiAgICAgICAgWzAsIDQsIDddLFxuICAgICAgICBbMCwgNCwgNl0sXG4gICAgICAgIFswLCA1LCA3XSxcbiAgICAgICAgWzAsIDUsIDZdXG4gICAgXTtcbiAgICAkc2NvcGUuc3RhcnRib3R0b20gPSBbXG4gICAgICAgIFswLCA1LCAwXSxcbiAgICAgICAgWzAsIDUsIDFdLFxuICAgICAgICBbMSwgNSwgMF0sXG4gICAgICAgIFsxLCA1LCAxXSxcbiAgICAgICAgWzIsIDUsIDBdLFxuICAgICAgICBbMiwgNSwgMV0sXG4gICAgICAgIFszLCA1LCAwXSxcbiAgICAgICAgWzMsIDUsIDFdLFxuICAgICAgICBbNCwgNSwgMF0sXG4gICAgICAgIFs0LCA1LCAxXSxcbiAgICAgICAgWzUsIDUsIDBdLFxuICAgICAgICBbNSwgNSwgMV1cbiAgICBdO1xuICAgICRzY29wZS5zdGFydHJpZ2h0ID0gW1xuICAgICAgICBbNSwgMCwgMl0sXG4gICAgICAgIFs1LCAwLCAzXSxcbiAgICAgICAgWzUsIDEsIDJdLFxuICAgICAgICBbNSwgMSwgM10sXG4gICAgICAgIFs1LCAyLCAyXSxcbiAgICAgICAgWzUsIDIsIDNdLFxuICAgICAgICBbNSwgMywgMl0sXG4gICAgICAgIFs1LCAzLCAzXSxcbiAgICAgICAgWzUsIDQsIDJdLFxuICAgICAgICBbNSwgNCwgM10sXG4gICAgICAgIFs1LCA1LCAyXSxcbiAgICAgICAgWzUsIDUsIDNdXG4gICAgXTtcbn0pO1xuIiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdnYW1lbGlzdCcsIHtcbiAgICAgICAgdXJsOiAnL2dhbWVsaXN0JyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvYnJvd3Nlci9qcy9nYW1lbGlzdC9nYW1lbGlzdC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2dhbWVMaXN0JyxcbiAgICB9KTtcbn0pO1xuXG50c3Vyby5jb250cm9sbGVyKCdnYW1lTGlzdCcsIGZ1bmN0aW9uICgkc2NvcGUsIGZpcmViYXNlVXJsLCAkZmlyZWJhc2VPYmplY3QsICRzdGF0ZSwgJGZpcmViYXNlQXV0aCwgJGZpcmViYXNlQXJyYXkpIHtcbiAgICAvL0ZvciBzeW5jaHJvbml6aW5nR2FtZUxpc3QuLi5cbiAgICB2YXIgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbiAgICB2YXIgb2JqID0gJGZpcmViYXNlT2JqZWN0KHJlZik7XG5cbiAgICB2YXIgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcbiAgICB2YXIgZmlyZWJhc2VVc2VyID0gYXV0aC4kZ2V0QXV0aCgpO1xuXG4gICAgdmFyIHN5bmNoUmVmID0gcmVmLmNoaWxkKFwiZ2FtZXNcIik7XG4gICAgdmFyIHN5bmNocm9uaXplZE9iaiA9ICRmaXJlYmFzZU9iamVjdChzeW5jaFJlZik7XG5cbiAgICAvLyBUaGlzIHJldHVybnMgYSBwcm9taXNlLi4ueW91IGNhbi50aGVuKCkgYW5kIGFzc2lnbiB2YWx1ZSB0byAkc2NvcGUudmFyaWFibGVcbiAgICAvLyBnYW1lbGlzdCBpcyB3aGF0ZXZlciB3ZSBhcmUgY2FsbGluZyBpdCBpbiB0aGUgYW5ndWxhciBodG1sLlxuICAgIHN5bmNocm9uaXplZE9iai4kYmluZFRvKCRzY29wZSwgXCJnYW1lbGlzdFwiKVxuICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZ2FtZWxpc3QgPSBbXVxuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiAkc2NvcGUuZ2FtZWxpc3QpIHtcbiAgICAgICAgICAgICAgICBnYW1lbGlzdC5wdXNoKFtpLCAkc2NvcGUuZ2FtZWxpc3RbaV1dKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJHNjb3BlLmdhbWVOYW1lcyA9IGdhbWVsaXN0LnNsaWNlKDIpO1xuICAgICAgICB9KVxuXG5cbiAgICAkc2NvcGUuam9pbiA9IGZ1bmN0aW9uIChnYW1lTmFtZSkge1xuICAgICAgICB2YXIgZ2FtZU5hbWVSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoZ2FtZU5hbWUpO1xuICAgICAgICB2YXIgcGxheWVyc1JlZiA9IGdhbWVOYW1lUmVmLmNoaWxkKCdwbGF5ZXJzJyk7XG5cbiAgICAgICAgdmFyIHBsYXllckFyciA9ICRmaXJlYmFzZUFycmF5KHBsYXllcnNSZWYpO1xuICAgICAgICBwbGF5ZXJBcnIuJGxvYWRlZCgpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocGxheWVycykge1xuICAgICAgICAgICAgICAgIGlmICghcGxheWVycy5maWx0ZXIocGxheWVyID0+IHBsYXllci51aWQgPT09IGZpcmViYXNlVXNlci51aWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdQbGF5ZXIgPSBuZXcgUGxheWVyKGZpcmViYXNlVXNlci51aWQpXG4gICAgICAgICAgICAgICAgICAgICRmaXJlYmFzZUFycmF5KHBsYXllcnNSZWYpLiRhZGQobmV3UGxheWVyKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgJHN0YXRlLmdvKCdnYW1lJywge1xuICAgICAgICAgICAgXCJnYW1lTmFtZVwiOiBnYW1lTmFtZVxuICAgICAgICB9KTtcbiAgICB9O1xufSk7XG4iLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9icm93c2VyL2pzL2xvZ2luL2xvZ2luLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnbG9naW5DdHJsJ1xuICAgIH0pO1xufSk7XG5cbnRzdXJvLmNvbnRyb2xsZXIoJ2xvZ2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSwgJGZpcmViYXNlQXV0aCwgJHJvb3RTY29wZSkge1xuICAgIHZhciBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuXG4gICAgJHNjb3BlLmxvZ0luV2l0aEdvb2dsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYXV0aC4kc2lnbkluV2l0aFBvcHVwKFwiZ29vZ2xlXCIpLnRoZW4oZnVuY3Rpb24gKGF1dGhEYXRhKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkxvZ2dlZCBpbiBhczpcIiwgYXV0aERhdGEpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS5jdXJyZW50VXNlciA9IGF1dGhEYXRhO1xuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJBdXRoZW50aWNhdGlvbiBmYWlsZWQ6XCIsIGVycm9yKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHN0YXRlLmdvKCdwaWNrR2FtZScpO1xuICAgIH07XG5cbn0pO1xuIiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdwaWNrR2FtZScsIHtcbiAgICAgICAgdXJsOiAnL3BpY2tnYW1lJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvYnJvd3Nlci9qcy9waWNrR2FtZS9waWNrR2FtZS5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ3BpY2tHYW1lQ3RybCdcbiAgICB9KTtcbn0pO1xuXG50c3Vyby5jb250cm9sbGVyKCdwaWNrR2FtZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QpIHtcbiAgICB2YXIgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbiAgICB2YXIgb2JqID0gJGZpcmViYXNlT2JqZWN0KHJlZilcblxuXG4gICAgJHNjb3BlLmNyZWF0ZUdhbWUgPSBmdW5jdGlvbiAoZ2FtZU5hbWUpIHtcbiAgICAgICAgdmFyIGdhbWVOYW1lUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKGdhbWVOYW1lKTtcbiAgICAgICAgdmFyIHBsYXllcnNSZWYgPSBnYW1lTmFtZVJlZi5jaGlsZCgncGxheWVycycpO1xuXG4gICAgICAgICRmaXJlYmFzZUFycmF5KGdhbWVOYW1lUmVmKS4kYWRkKHtcbiAgICAgICAgICAgIFwiZ2FtZU5hbWVcIjogZ2FtZU5hbWVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZmlyZWJhc2UuYXV0aCgpLm9uQXV0aFN0YXRlQ2hhbmdlZChmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV3UGxheWVyID0gbmV3IFBsYXllcih1c2VyLnVpZClcbiAgICAgICAgICAgICAgICAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKS4kYWRkKG5ld1BsYXllcilcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJubyBvbmUgbG9nZ2VkIGluXCIpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgb2JqLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICB2YXIgdGlsZXMgPSBkYXRhLnRpbGVzXG4gICAgICAgICAgICB2YXIgZGVjayA9IG5ldyBEZWNrKHRpbGVzKS5zaHVmZmxlKCkudGlsZXM7XG4gICAgICAgICAgICB2YXIgaW5pdGlhbERlY2tSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoZ2FtZU5hbWUpLmNoaWxkKCdpbml0aWFsRGVjaycpO1xuICAgICAgICAgICAgJGZpcmViYXNlQXJyYXkoaW5pdGlhbERlY2tSZWYpLiRhZGQoZGVjayk7XG4gICAgICAgIH0pXG5cblxuICAgICAgICB2YXIgaW5pdGlhbE1hcmtlcnNSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoZ2FtZU5hbWUpLmNoaWxkKCdhdmFpbGFibGVNYXJrZXJzJyk7XG4gICAgICAgICRmaXJlYmFzZUFycmF5KGluaXRpYWxNYXJrZXJzUmVmKS4kYWRkKFtcInJlZFwiLCBcIm9yYW5nZVwiLCBcInllbGxvd1wiLCBcImdyZWVuXCIsIFwiYXF1YVwiLCBcImJsdWVcIiwgXCJuYXZ5XCIsIFwicHVycGxlXCJdKTtcblxuXG4gICAgICAgICRzdGF0ZS5nbygnZ2FtZScsIHtcbiAgICAgICAgICAgIFwiZ2FtZU5hbWVcIjogZ2FtZU5hbWVcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgICRzY29wZS5nb1RvR2FtZUxpc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzdGF0ZS5nbygnZ2FtZWxpc3QnKTtcbiAgICB9O1xufSk7XG4iLCIndXNlIHN0cmljdCdcblxuZnVuY3Rpb24gUGxheWVyKHVpZCkge1xuICAgIC8vIFRPRE86IGdldCB1aWQgZnJvbSBmaXJlYmFzZSBhdXRoXG4gICAgdGhpcy51aWQgPSB1aWQ7XG5cbiAgICB0aGlzLm1hcmtlciA9IFwiblwiO1xuXG4gICAgLy8gc2hvdWxkIGJlIGEgUG9pbnQgb2JqZWN0XG4gICAgdGhpcy5wb2ludCA9IFwiblwiO1xuXG4gICAgLy8gW3gsIHldXG4gICAgLy8gZGVwZW5kcyBvbiB0aGUgYW5ndWxhciBTcGFjZS54LCBTcGFjZS55XG4gICAgdGhpcy5uZXh0U3BhY2UgPSBcIm5cIjtcblxuICAgIC8vIGluIGVhY2ggU3BhY2UucG9pbnRzIGFycmF5LCBmaW5kIHRoaXMgc3BlY2lmaWMgcG9pbnQgYW5kIGdldCB0aGUgcG9zaXRpb24gKGludGVnZXIpIGluc2lkZSB0aGlzIHNwYWNlLlxuICAgIHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPSBcIm5cIjtcblxuICAgIC8vIG1heGltdW4gMyB0aWxlc1xuICAgIHRoaXMudGlsZXMgPSAnbic7XG5cbiAgICAvLyBpZiBhIHBsYXllciBkaWVzLCBpdCB3aWxsIGJlIGNoYW5nZWQgdG8gZmFsc2VcbiAgICB0aGlzLmNhblBsYXkgPSB0cnVlO1xufVxuXG4vLyBuZWVkIHRvIHVzZSBzZWxmIGJlY3VzZSB3ZSBuZWVkIHRvIGNoYW5nZSAkc2NvcGUubWUgb24gZ2FtZUN0cmwgYW5kIHNlbmQgdG8gZmlyZWJhc2VcblBsYXllci5wcm90b3R5cGUucGxhY2VNYXJrZXIgPSBmdW5jdGlvbiAoYm9hcmQsIHBvaW50LCBzZWxmKSB7XG4gICAgLy8gcG9pbnQgbG9va3MgbGlrZSBbeCwgeSwgcG9pbnRzSW5kZXhdIGluIHRoZSBzcGFjZVxuICAgIHZhciB4ID0gcG9pbnRbMF07XG4gICAgdmFyIHkgPSBwb2ludFsxXTtcbiAgICB2YXIgcG9pbnRzSW5kZXggPSBwb2ludFsyXTtcblxuICAgIHNlbGYucG9pbnQgPSBib2FyZFt5XVt4XS5wb2ludHNbcG9pbnRzSW5kZXhdO1xuICAgIHNlbGYucG9pbnQudHJhdmVsbGVkID0gdHJ1ZTtcblxuICAgIC8vW3gsIHldIGZyb20gdGhlIHBvaW50XG4gICAgc2VsZi5uZXh0U3BhY2UgPSBib2FyZFt5XVt4XTtcblxuICAgIC8vIGluIGVhY2ggU3BhY2UucG9pbnRzIGFycmF5LCBmaW5kIHRoaXMgc3BlY2lmaWMgcG9pbnQgYW5kIGdldCB0aGUgcG9zaXRpb24gKGludGVnZXIpIGluc2lkZSB0aGlzIHNwYWNlLlxuICAgIHNlbGYubmV4dFNwYWNlUG9pbnRzSW5kZXggPSBzZWxmLm5leHRTcGFjZS5wb2ludHMuaW5kZXhPZihzZWxmLnBvaW50KTtcbn07XG5cblBsYXllci5wcm90b3R5cGUubmV3U3BhY2UgPSBmdW5jdGlvbiAoYm9hcmQsIG9sZFNwYWNlKSB7XG4gICAgaWYgKHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDAgfHwgdGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gYm9hcmRbb2xkU3BhY2UueSAtIDFdW29sZFNwYWNlLnhdO1xuICAgIH0gZWxzZSBpZiAodGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gMiB8fCB0aGlzLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSAzKSB7XG4gICAgICAgIHJldHVybiBib2FyZFtvbGRTcGFjZS55XVtvbGRTcGFjZS54ICsgMV07XG4gICAgfSBlbHNlIGlmICh0aGlzLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSA0IHx8IHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDUpIHtcbiAgICAgICAgcmV0dXJuIGJvYXJkW29sZFNwYWNlLnkgKyAxXVtvbGRTcGFjZS54XTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYm9hcmRbb2xkU3BhY2UueV1bb2xkU3BhY2UueCAtIDFdO1xuICAgIH1cbn07XG5cbi8vIG5lZWQgdG8gdXNlIHNlbGYgYmVjdXNlIHdlIG5lZWQgdG8gY2hhbmdlICRzY29wZS5tZSBvbiBnYW1lQ3RybCBhbmQgc2VuZCB0byBmaXJlYmFzZVxuUGxheWVyLnByb3RvdHlwZS5wbGFjZVRpbGUgPSBmdW5jdGlvbiAodGlsZSwgc2VsZikge1xuICAgIHZhciBpbmRleCA9IHNlbGYudGlsZXMuaW5kZXhPZih0aWxlKTtcbiAgICBzZWxmLnRpbGVzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICBzZWxmLm5leHRTcGFjZS50aWxlVXJsID0gdGlsZS5pbWFnZVVybDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGlsZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBzZWxmLm5leHRTcGFjZS5wb2ludHNbaV0ubmVpZ2hib3JzLnB1c2goc2VsZi5uZXh0U3BhY2UucG9pbnRzW3RpbGVbaV1dKTtcbiAgICB9XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLm1vdmVUbyA9IGZ1bmN0aW9uIChwb2ludGVyKSB7XG5cbiAgICAvL2Fsd2F5cyBiZSByZXR1cm5pbmcgMCBvciAxIHBvaW50IGluIHRoZSBhcnJheVxuICAgIGxldCBuZXh0UG9pbnQgPSBwb2ludGVyLm5laWdoYm9ycy5maWx0ZXIoZnVuY3Rpb24gKG5laWdoYm9yKSB7XG4gICAgICAgIHJldHVybiAhbmVpZ2hib3IudHJhdmVsbGVkO1xuICAgIH0pWzBdO1xuXG4gICAgcmV0dXJuIG5leHRQb2ludDtcbn07XG5cbi8vIFRPRE86IG5vdCBzdXJlIGhvdyB0byBtYWtlIHRoaXMga2VlcCBtb3Zpbmcgd2l0aCBwbGF5ZXJzIGluc3RlYWQgb2Ygc2VsZlxuUGxheWVyLnByb3RvdHlwZS5rZWVwTW92aW5nID0gZnVuY3Rpb24gKHNlbGYpIHtcbiAgICBsZXQgbW92YWJsZSA9IHNlbGYubW92ZVRvKHNlbGYucG9pbnQpO1xuICAgIHdoaWxlIChtb3ZhYmxlKSB7XG4gICAgICAgIHNlbGYucG9pbnQudHJhdmVsbGVkID0gdHJ1ZTtcbiAgICAgICAgc2VsZi5wb2ludCA9IHNlbGYubW92ZVRvKHNlbGYucG9pbnQpO1xuICAgICAgICBsZXQgb2xkU3BhY2UgPSBzZWxmLm5leHRTcGFjZTtcbiAgICAgICAgbGV0IG5ld1NwYWNlID0gbmV3U3BhY2Uob2xkU3BhY2UpO1xuICAgICAgICBzZWxmLm5leHRTcGFjZSA9IG5ld1NwYWNlO1xuXG4gICAgICAgIHNlbGYuY2hlY2tEZWF0aCgpO1xuICAgICAgICBtb3ZhYmxlID0gc2VsZi5tb3ZlVG8oc2VsZi5wb2ludCk7XG4gICAgfVxufTtcblxuUGxheWVyLnByb3RvdHlwZS5jaGVja0RlYXRoID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBhbGxUcmF2ZWxsZWQgPSB0aGlzLnBvaW50Lm5laWdoYm9ycy5maWx0ZXIoZnVuY3Rpb24gKG5laWdoYm9yKSB7XG4gICAgICAgIHJldHVybiBuZWlnaGJvci50cmF2ZWxsZWQ7XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5wb2ludC5lZGdlIHx8IGFsbFRyYXZlbGxlZC5sZW5ndGggPT09IDIpIHRoaXMuZGllKCk7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLmRpZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmNhblBsYXkgPSBmYWxzZTtcbiAgICAvLyBUT0RPOiBuZWVkIHRvIHNlbmQgYW4gYWxlcnQgb3IgbWVzc2FnZSB0byB0aGUgcGxheWVyIHdobyBqdXN0IGRpZWQuXG59O1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
