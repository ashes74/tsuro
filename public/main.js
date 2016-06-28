'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var tsuro = angular.module('Tsuro', ['ui.router', 'firebase']);

tsuro.constant('firebaseUrl', 'https://path-of-the-dragon.firebaseio.com/');

tsuro.config(function ($urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');
});

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
        this.board = new Board();
        // this.deck;
        this.players = [];
        this.availableMarkers = ["red", "orange", "yellow", "green", "aqua", "blue", "navy", "purple"];

        this.currPlayer; //index of the currentPlayer in the turnOrderArray
        this.turnOrderArray = []; //holds all the players still on the board.
        this.dragon = ""; // Player.Marker
        this.moves;
    }

    // addPlayer(player) {
    //     this.players.length < 8 ? this.players.push(player) : throw new Error "Room full";
    // };

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
        templateUrl: '/js/game/game.html',
        controller: 'gameCtrl'
    });
});

tsuro.controller('gameCtrl', function ($scope, $firebaseAuth, firebaseUrl, $stateParams, $firebaseObject) {

    var auth = $firebaseAuth();
    var firebaseUser = $scope.authObj.$getAuth();
    var gameRef = firebaseUrl + 'games/' + $stateParams.gameName;
    var deckRef = new Firebase(gameRef + '/initialDeck');
    var playersRef = new Firebase(gameRef + '/players');
    var markersRef = new Firebase(gameRef + '/availableMarkers');

    //intialize game
    $scope.game = new Game($stateParams.gameName);
    $scope.game.deck = $firebaseObject(deckRef);

    markersRef.on('value', function (availableMarkers) {
        $scope.availableMarkers = Object.keys(availableMarkers).map(function (i) {
            return availableMarkers[i];
        });
    });

    var board = $scope.game.board;

    //take all players on firebase and turn them into local player
    playersRef.on("child_added", function (player) {
        var newPlayer = new Player(player.uid);
        newPlayer.marker = player.marker;

        var x = player.startingPosition[0];
        var y = player.startingPosition[1];
        var pointsIndex = player.startingPosition[2];

        newPlayer.point = board[y][x].points[pointsIndex];
        newplayer.nextSpace = board[y][x];
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
        $scope.player.marker = marker;
        var markers = $firebaseArray(markersRef);
        var idx = markers.indexOf(marker);
        markers.$remove(markers[idx]).then(function (ref) {
            console.log(ref.key);
        });
    };

    //Have player pick their start point
    $scope.placeMarker = function (board, point) {
        $scope.player.placeMarker(point);
        $scope.game.players.push($scope.player);

        gameRef.child('players').child(player.uid).push({ 'marker': player.marker, 'startingPosition': player.startingPosition });
    };

    // TODO: we probably need this on firebase so other people can't pick what's been picked

    ////GAME FB - MOVES UPDATE LOOP
    //if something is added to moves
    //watcher for added children
    //ref.on child added

    //For synchronizingGame...
    // var synchRef = new Firebase(gameRef + '/moves');
    // var synchronizedObj = $firebaseObject(synchRef);
    // //This returns a promise... you can .then() and assign value to $scope.variable
    // synchronizedObj
    // .$bindTo($scope, game.moves); //do we need this?

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

    // CMT: assuming we are using new Game() for $scope.game
    $scope.start = function () {
        // TODO: add game init state with shuffled deck

        // TODO: need to add to firebase (?)
        $scope.game.turnOrderArray.forEach(function (player) {
            player.tiles = $scope.game.deck.dealThree();
        });
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
        $scope.game.moveAllplayers();

        if ($scope.game.checkOver()) {
            // TODO: need to tell the player she won
            $scope.winner = $scope.game.getCanPlay()[0];
            $scope.gameOver = true;
        } else {
            // CMT: draw one tile and push it to the player.tiles array
            $scope.me.tiles.push($scope.game.deck.deal(1));
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
        templateUrl: '/js/gamelist/gamelist.html',
        controller: 'gameList'
    });
});

tsuro.controller('gameList', function ($scope, firebaseUrl, $firebaseObject) {
    //For synchronizingGameList...
    var synchRef = new Firebase(firebaseUrl + games);
    var synchronizedObj = $firebaseObject(synchRef);
    //This returns a promise... you can .then() and assign value to $scope.variable
    synchronizedObj.$bindTo($scope, gamelist); //data is whatever we are calling it in the angular html.   

    $scope.join = function (gameName) {
        $state.go('game', { "gameName": gameName });
    };
});

tsuro.config(function ($stateProvider) {
    $stateProvider.state('login', {
        url: '/login',
        templateUrl: '/js/login/login.html',
        controller: 'loginCtrl'
    });
});

tsuro.controller('loginCtrl', function ($scope, $state) {
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
        templateUrl: '/js/pickGame/pickGame.html',
        controller: 'pickGameCtrl'
    });
});

tsuro.controller('pickGameCtrl', function ($scope, $state, $firebaseAuth, firebaseUrl) {
    var ref = new Firebase(firebaseUrl);

    $scope.createGame = function (gameName) {
        // var game = new Game(gameName);
        var deck = new Deck().shuffle;
        ref.child('games').child(gameName).child('initialDeck').push(deck);
        ref.child('games').child(gameName).child('availableMarkers').push(["red", "orange", "yellow", "green", "aqua", "blue", "navy", "purple"]);
        $state.go('game', { "gameName": gameName });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImdhbWUvZGVjay5qcyIsImdhbWUvZ2FtZS5jb250cnVjdG9yLmpzIiwiZ2FtZS9nYW1lLmpzIiwiZ2FtZWxpc3QvZ2FtZWxpc3QuanMiLCJsb2dpbi9sb2dpbi5qcyIsInBpY2tHYW1lL3BpY2tHYW1lLmpzIiwicGxheWVyL3BsYXllci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFBLFFBQUEsUUFBQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsV0FBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBOztBQUVBLE1BQUEsUUFBQSxDQUFBLGFBQUEsRUFBQSw0Q0FBQTs7QUFFQSxNQUFBLE1BQUEsQ0FBQSxVQUFBLGtCQUFBLEVBQUEsaUJBQUEsRUFBQTtBQUNBLHVCQUFBLFNBQUEsQ0FBQSxHQUFBO0FBQ0EsQ0FGQTs7QUNKQTs7SUFFQSxJO0FBQ0Esa0JBQUEsS0FBQSxFQUFBO0FBQUE7O0FBQ0EsYUFBQSxLQUFBLEdBQUEsS0FBQTtBQUNBOzs7O2tDQUVBO0FBQ0EsaUJBQUEsS0FBQSxHQUFBLEVBQUEsT0FBQSxDQUFBLEtBQUEsS0FBQSxDQUFBO0FBQ0EsbUJBQUEsSUFBQTtBQUNBOzs7b0NBRUE7QUFDQSxtQkFBQSxLQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtBQUNBOzs7NkJBRUEsRyxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxLQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsRUFBQSxHQUFBLENBQUE7QUFDQTs7OytCQUVBLEssRUFBQTtBQUNBLGlCQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQTtBQUNBLG1CQUFBLElBQUE7QUFDQTs7Ozs7O0FDdkJBOzs7O0lBSUEsSTtBQUNBLGtCQUFBLElBQUEsRUFBQTtBQUFBOztBQUNBLGFBQUEsSUFBQSxHQUFBLElBQUE7QUFDQSxhQUFBLEtBQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxLQUFBLEdBQUEsSUFBQSxLQUFBLEVBQUE7O0FBRUEsYUFBQSxPQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsZ0JBQUEsR0FBQSxDQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsUUFBQSxFQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxRQUFBLENBQUE7O0FBRUEsYUFBQSxVQUFBLEM7QUFDQSxhQUFBLGNBQUEsR0FBQSxFQUFBLEM7QUFDQSxhQUFBLE1BQUEsR0FBQSxFQUFBLEM7QUFDQSxhQUFBLEtBQUE7QUFDQTs7Ozs7Ozs7MkNBTUE7QUFDQSxnQkFBQSxLQUFBLFVBQUEsS0FBQSxDQUFBLENBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsY0FBQSxDQUFBLEtBQUEsVUFBQSxDQUFBO0FBQ0E7Ozt5Q0FFQTtBQUNBLGlCQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxNQUFBO0FBQUEsdUJBQUEsT0FBQSxVQUFBLEVBQUE7QUFBQSxhQUFBO0FBQ0E7OztvQ0FFQTtBQUNBLG1CQUFBLGFBQUEsTUFBQSxJQUFBLENBQUE7QUFDQTs7Ozs7O3lDQUdBO0FBQ0EsZ0JBQUEsV0FBQSxLQUFBLGNBQUEsRUFBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0Esb0JBQUEsU0FBQSxLQUFBLFVBQUEsR0FBQSxDQUFBO0FBQ0EsdUJBQUEsQ0FBQSxLQUFBLGNBQUEsQ0FBQSxTQUFBLENBQUEsRUFBQSxPQUFBLEVBQUE7QUFDQTtBQUNBO0FBQ0EscUJBQUEsVUFBQSxHQUFBLE1BQUE7QUFDQSxhQU5BLE1BTUE7QUFDQSxxQkFBQSxVQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQSxtQkFBQSxLQUFBLGdCQUFBLEVBQUE7QUFDQTs7Ozs7O2dDQUdBO0FBQUE7O0FBQ0EsaUJBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxrQkFBQTs7O0FBR0Esc0JBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLEtBQUEsRUFBQSxPQUFBO0FBQ0EsdUJBQUEsS0FBQSxHQUFBLEVBQUE7O0FBRUEsdUJBQUEsT0FBQSxHQUFBLElBQUE7QUFDQSxhQVBBO0FBUUE7Ozs7Ozs7Ozs7O0FBT0EsSUFBQSxhQUFBLFNBQUEsVUFBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsUUFBQSxNQUFBLENBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxlQUFBLE9BQUEsT0FBQTtBQUNBLEtBRkEsQ0FBQTtBQUdBLENBSkE7O0FDbkVBLE1BQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLGFBQUEsaUJBREE7QUFFQSxxQkFBQSxvQkFGQTtBQUdBLG9CQUFBO0FBSEEsS0FBQTtBQUtBLENBTkE7O0FBUUEsTUFBQSxVQUFBLENBQUEsVUFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLGFBQUEsRUFBQSxXQUFBLEVBQUEsWUFBQSxFQUFBLGVBQUEsRUFBQTs7QUFFQSxRQUFBLE9BQUEsZUFBQTtBQUNBLFFBQUEsZUFBQSxPQUFBLE9BQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxRQUFBLFVBQUEsY0FBQSxRQUFBLEdBQUEsYUFBQSxRQUFBO0FBQ0EsUUFBQSxVQUFBLElBQUEsUUFBQSxDQUFBLFVBQUEsY0FBQSxDQUFBO0FBQ0EsUUFBQSxhQUFBLElBQUEsUUFBQSxDQUFBLFVBQUEsVUFBQSxDQUFBO0FBQ0EsUUFBQSxhQUFBLElBQUEsUUFBQSxDQUFBLFVBQUEsbUJBQUEsQ0FBQTs7O0FBR0EsV0FBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsYUFBQSxRQUFBLENBQUE7QUFDQSxXQUFBLElBQUEsQ0FBQSxJQUFBLEdBQUEsZ0JBQUEsT0FBQSxDQUFBOztBQUVBLGVBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxVQUFBLGdCQUFBLEVBQUE7QUFDQSxlQUFBLGdCQUFBLEdBQUEsT0FBQSxJQUFBLENBQUEsZ0JBQUEsRUFBQSxHQUFBLENBQUEsVUFBQSxDQUFBLEVBQUE7QUFDQSxtQkFBQSxpQkFBQSxDQUFBLENBQUE7QUFDQSxTQUZBLENBQUE7QUFHQSxLQUpBOztBQU1BLFFBQUEsUUFBQSxPQUFBLElBQUEsQ0FBQSxLQUFBOzs7QUFJQSxlQUFBLEVBQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxZQUFBLFlBQUEsSUFBQSxNQUFBLENBQUEsT0FBQSxHQUFBLENBQUE7QUFDQSxrQkFBQSxNQUFBLEdBQUEsT0FBQSxNQUFBOztBQUVBLFlBQUEsSUFBQSxPQUFBLGdCQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLE9BQUEsZ0JBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLGNBQUEsT0FBQSxnQkFBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSxrQkFBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxrQkFBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsb0JBQUEsR0FBQSxPQUFBLGdCQUFBLENBQUEsQ0FBQSxDQUFBOztBQUVBLGtCQUFBLEtBQUEsR0FBQSxPQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxFQUFBOztBQUVBLGVBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsU0FBQTtBQUNBLEtBZkE7OztBQWtCQSxXQUFBLEVBQUEsR0FBQSxPQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0EsZUFBQSxPQUFBLEdBQUEsS0FBQSxhQUFBLEdBQUE7QUFDQSxLQUZBLEVBRUEsQ0FGQSxDQUFBOzs7QUFNQSxXQUFBLFVBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUE7QUFDQSxlQUFBLE1BQUEsQ0FBQSxNQUFBLEdBQUEsTUFBQTtBQUNBLFlBQUEsVUFBQSxlQUFBLFVBQUEsQ0FBQTtBQUNBLFlBQUEsTUFBQSxRQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUE7QUFDQSxnQkFBQSxPQUFBLENBQUEsUUFBQSxHQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxvQkFBQSxHQUFBLENBQUEsSUFBQSxHQUFBO0FBQ0EsU0FGQTtBQUdBLEtBUEE7OztBQVVBLFdBQUEsV0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQTtBQUNBLGVBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxLQUFBO0FBQ0EsZUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLE1BQUE7O0FBRUEsZ0JBQUEsS0FBQSxDQUFBLFNBQUEsRUFBQSxLQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsVUFBQSxPQUFBLE1BQUEsRUFBQSxvQkFBQSxPQUFBLGdCQUFBLEVBQUE7QUFDQSxLQUxBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQ0EsV0FBQSxhQUFBLEdBQUEsT0FBQSxJQUFBLENBQUEsZ0JBQUEsRUFBQTs7O0FBR0EsV0FBQSxjQUFBLEdBQUEsT0FBQSxJQUFBLENBQUEsVUFBQSxFQUFBOzs7QUFHQSxXQUFBLE1BQUE7OztBQUtBLFdBQUEsS0FBQSxHQUFBLFlBQUE7Ozs7QUFJQSxlQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxHQUFBLE9BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEVBQUE7QUFDQSxTQUZBO0FBR0EsS0FQQTs7QUFTQSxXQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsZUFBQSxFQUFBLEtBQUEsT0FBQSxhQUFBO0FBQ0EsS0FGQTs7O0FBS0EsV0FBQSxZQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLFFBQUE7QUFDQSxZQUFBLEtBQUEsUUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLFFBQUEsR0FBQSxDQUFBO0FBQ0EsS0FIQTs7QUFLQSxXQUFBLGFBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsUUFBQTtBQUNBLFlBQUEsS0FBQSxRQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxRQUFBLEdBQUEsQ0FBQTtBQUNBLEtBSEE7Ozs7QUFPQSxXQUFBLFNBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTs7QUFFQSxZQUFBLEtBQUEsUUFBQSxHQUFBLENBQUEsRUFBQTtBQUNBLGlCQUFBLEtBQUEsR0FBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxVQUFBLEVBQUE7QUFDQSx1QkFBQSxhQUFBLENBQUE7QUFDQSxhQUZBLENBQUE7QUFHQSxpQkFBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGlCQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsU0FOQSxNQU1BLElBQUEsS0FBQSxRQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxHQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQTtBQUNBLHVCQUFBLGFBQUEsQ0FBQTtBQUNBLGFBRkEsQ0FBQTtBQUdBLGlCQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQTs7QUFFQSxlQUFBLEVBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQTtBQUNBLGVBQUEsSUFBQSxDQUFBLGNBQUE7O0FBRUEsWUFBQSxPQUFBLElBQUEsQ0FBQSxTQUFBLEVBQUEsRUFBQTs7QUFFQSxtQkFBQSxNQUFBLEdBQUEsT0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLG1CQUFBLFFBQUEsR0FBQSxJQUFBO0FBQ0EsU0FKQSxNQUlBOztBQUVBLG1CQUFBLEVBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsbUJBQUEsSUFBQSxDQUFBLGNBQUE7QUFDQTtBQUNBLEtBNUJBOzs7QUErQkEsV0FBQSxTQUFBOzs7QUFHQSxXQUFBLEtBQUEsR0FBQSxPQUFBLElBQUEsQ0FBQSxLQUFBOztBQUdBLFdBQUEsUUFBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBLEVBSUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FKQSxFQUtBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQU5BLEVBT0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FQQSxFQVFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUkEsRUFTQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVRBLEVBVUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FWQSxFQVdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWEEsRUFZQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVpBLENBQUE7QUFjQSxXQUFBLFNBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBLEVBR0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQSxFQUlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSkEsRUFLQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUxBLEVBTUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FOQSxFQU9BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUEEsRUFRQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVJBLEVBU0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FUQSxFQVVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVkEsRUFXQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVhBLEVBWUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FaQSxDQUFBO0FBY0EsV0FBQSxXQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQURBLEVBRUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQSxFQUdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEEsRUFJQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUpBLEVBS0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FMQSxFQU1BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTkEsRUFPQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVBBLEVBUUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FSQSxFQVNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVEEsRUFVQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVZBLEVBV0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FYQSxFQVlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWkEsQ0FBQTtBQWNBLFdBQUEsVUFBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBLEVBSUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FKQSxFQUtBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQU5BLEVBT0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FQQSxFQVFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUkEsRUFTQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVRBLEVBVUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FWQSxFQVdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWEEsRUFZQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVpBLENBQUE7QUFpQkEsQ0FqT0E7O0FDUkEsTUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsYUFBQSxXQURBO0FBRUEscUJBQUEsNEJBRkE7QUFHQSxvQkFBQTtBQUhBLEtBQUE7QUFLQSxDQU5BOztBQVFBLE1BQUEsVUFBQSxDQUFBLFVBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsZUFBQSxFQUFBOztBQUVBLFFBQUEsV0FBQSxJQUFBLFFBQUEsQ0FBQSxjQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsa0JBQUEsZ0JBQUEsUUFBQSxDQUFBOztBQUVBLG9CQUFBLE9BQUEsQ0FBQSxNQUFBLEVBQUEsUUFBQSxFOztBQUVBLFdBQUEsSUFBQSxHQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsTUFBQSxFQUFBLEVBQUEsWUFBQSxRQUFBLEVBQUE7QUFDQSxLQUZBO0FBR0EsQ0FWQTs7QUNSQSxNQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxhQUFBLFFBREE7QUFFQSxxQkFBQSxzQkFGQTtBQUdBLG9CQUFBO0FBSEEsS0FBQTtBQUtBLENBTkE7O0FBUUEsTUFBQSxVQUFBLENBQUEsV0FBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQTtBQUNBLFFBQUEsT0FBQSxlQUFBOztBQUVBLFdBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxhQUFBLGdCQUFBLENBQUEsUUFBQSxFQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLG9CQUFBLEdBQUEsQ0FBQSxlQUFBLEVBQUEsUUFBQTtBQUNBLFNBRkEsRUFFQSxLQUZBLENBRUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxvQkFBQSxLQUFBLENBQUEsd0JBQUEsRUFBQSxLQUFBO0FBQ0EsU0FKQTs7QUFNQSxlQUFBLEVBQUEsQ0FBQSxVQUFBO0FBQ0EsS0FSQTtBQVVBLENBYkE7O0FDUkEsTUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsYUFBQSxXQURBO0FBRUEscUJBQUEsNEJBRkE7QUFHQSxvQkFBQTtBQUhBLEtBQUE7QUFLQSxDQU5BOztBQVFBLE1BQUEsVUFBQSxDQUFBLGNBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLFFBQUEsTUFBQSxJQUFBLFFBQUEsQ0FBQSxXQUFBLENBQUE7O0FBRUEsV0FBQSxVQUFBLEdBQUEsVUFBQSxRQUFBLEVBQUE7O0FBRUEsWUFBQSxPQUFBLElBQUEsSUFBQSxHQUFBLE9BQUE7QUFDQSxZQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsS0FBQSxDQUFBLFFBQUEsRUFBQSxLQUFBLENBQUEsYUFBQSxFQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0EsWUFBQSxLQUFBLENBQUEsT0FBQSxFQUFBLEtBQUEsQ0FBQSxRQUFBLEVBQUEsS0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxDQUFBLENBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxRQUFBLEVBQUEsT0FBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLFFBQUEsQ0FBQTtBQUNBLGVBQUEsRUFBQSxDQUFBLE1BQUEsRUFBQSxFQUFBLFlBQUEsUUFBQSxFQUFBO0FBQ0EsS0FOQTs7QUFRQSxXQUFBLFlBQUEsR0FBQSxZQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsVUFBQTtBQUNBLEtBRkE7QUFHQSxDQWRBOztBQ1JBOztBQUVBLFNBQUEsTUFBQSxDQUFBLEdBQUEsRUFBQTs7QUFFQSxTQUFBLEdBQUEsR0FBQSxHQUFBOztBQUVBLFNBQUEsTUFBQSxHQUFBLElBQUE7OztBQUdBLFNBQUEsS0FBQSxHQUFBLElBQUE7Ozs7QUFJQSxTQUFBLFNBQUEsR0FBQSxJQUFBOzs7QUFHQSxTQUFBLG9CQUFBLEdBQUEsSUFBQTs7O0FBR0EsU0FBQSxLQUFBLEdBQUEsRUFBQTs7O0FBR0EsU0FBQSxPQUFBLEdBQUEsSUFBQTtBQUNBOztBQUVBLE9BQUEsU0FBQSxDQUFBLFdBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUE7O0FBRUEsUUFBQSxJQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxJQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxjQUFBLE1BQUEsQ0FBQSxDQUFBOztBQUVBLFNBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxNQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsU0FBQSxLQUFBLENBQUEsU0FBQSxHQUFBLElBQUE7OztBQUdBLFNBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTs7O0FBR0EsU0FBQSxvQkFBQSxHQUFBLEtBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxLQUFBLENBQUE7QUFDQSxDQWRBOztBQWdCQSxPQUFBLFNBQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUEsUUFBQSxFQUFBO0FBQ0EsUUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLEVBQUE7QUFDQSxlQUFBLE1BQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQ0EsS0FGQSxNQUVBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxFQUFBO0FBQ0EsZUFBQSxNQUFBLFNBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLEtBRkEsTUFFQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsRUFBQTtBQUNBLGVBQUEsTUFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLENBQUE7QUFDQSxLQUZBLE1BRUE7QUFDQSxlQUFBLE1BQUEsU0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQSxDQVZBOztBQVlBLE9BQUEsU0FBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLFFBQUEsUUFBQSxLQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxLQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBOztBQUVBLFNBQUEsU0FBQSxDQUFBLE9BQUEsR0FBQSxLQUFBLFFBQUE7O0FBRUEsU0FBQSxJQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsS0FBQSxNQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxTQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQSxDQVRBOztBQVdBLE9BQUEsU0FBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLE9BQUEsRUFBQTs7OztBQUlBLFFBQUEsWUFBQSxRQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxlQUFBLENBQUEsU0FBQSxTQUFBO0FBQ0EsS0FGQSxFQUVBLENBRkEsQ0FBQTs7QUFJQSxXQUFBLFNBQUE7QUFDQSxDQVRBOztBQVdBLE9BQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxVQUFBLEtBQUEsTUFBQSxDQUFBLEtBQUEsS0FBQSxDQUFBO0FBQ0EsV0FBQSxPQUFBLEVBQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQSxTQUFBLEdBQUEsSUFBQTtBQUNBLGFBQUEsS0FBQSxHQUFBLEtBQUEsTUFBQSxDQUFBLEtBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxXQUFBLEtBQUEsU0FBQTtBQUNBLFlBQUEsV0FBQSxTQUFBLFFBQUEsQ0FBQTtBQUNBLGFBQUEsU0FBQSxHQUFBLFFBQUE7O0FBRUEsYUFBQSxVQUFBO0FBQ0Esa0JBQUEsS0FBQSxNQUFBLENBQUEsS0FBQSxLQUFBLENBQUE7QUFDQTtBQUNBLENBWkE7O0FBY0EsT0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLGVBQUEsS0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGVBQUEsU0FBQSxTQUFBO0FBQ0EsS0FGQSxDQUFBOztBQUlBLFFBQUEsS0FBQSxLQUFBLENBQUEsSUFBQSxJQUFBLGFBQUEsTUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLEdBQUE7QUFDQSxDQU5BOztBQVFBLE9BQUEsU0FBQSxDQUFBLEdBQUEsR0FBQSxZQUFBO0FBQ0EsU0FBQSxPQUFBLEdBQUEsS0FBQTs7QUFFQSxDQUhBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgdHN1cm8gPSBhbmd1bGFyLm1vZHVsZSgnVHN1cm8nLCBbJ3VpLnJvdXRlcicsICdmaXJlYmFzZSddKTtcblxudHN1cm8uY29uc3RhbnQoJ2ZpcmViYXNlVXJsJywgJ2h0dHBzOi8vcGF0aC1vZi10aGUtZHJhZ29uLmZpcmViYXNlaW8uY29tLycpO1xuXG50c3Vyby5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY2xhc3MgRGVjayB7XG4gICAgY29uc3RydWN0b3IodGlsZXMpIHtcbiAgICAgICAgdGhpcy50aWxlcyA9IHRpbGVzXG4gICAgfVxuXG4gICAgc2h1ZmZsZSgpIHtcbiAgICAgICAgdGhpcy50aWxlcyA9IF8uc2h1ZmZsZSh0aGlzLnRpbGVzKVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBkZWFsVGhyZWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGVzLnNwbGljZSgwLCAzKTtcbiAgICB9XG5cbiAgICBkZWFsKG51bSkge1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlcy5zcGxpY2UoMCwgbnVtKTtcbiAgICB9XG5cbiAgICByZWxvYWQodGlsZXMpIHtcbiAgICAgICAgdGhpcy50aWxlcy5wdXNoKHRpbGVzKVxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLy9HQU1FLy8vXG5cbmNsYXNzIEdhbWUge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUpIHtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5jb3VudCA9IDM1O1xuICAgICAgICB0aGlzLmJvYXJkID0gbmV3IEJvYXJkKCk7XG4gICAgICAgIC8vIHRoaXMuZGVjaztcbiAgICAgICAgdGhpcy5wbGF5ZXJzID0gW107XG4gICAgICAgIHRoaXMuYXZhaWxhYmxlTWFya2VycyA9IFtcInJlZFwiLCBcIm9yYW5nZVwiLCBcInllbGxvd1wiLCBcImdyZWVuXCIsIFwiYXF1YVwiLCBcImJsdWVcIiwgXCJuYXZ5XCIsIFwicHVycGxlXCJdXG5cbiAgICAgICAgdGhpcy5jdXJyUGxheWVyOyAvL2luZGV4IG9mIHRoZSBjdXJyZW50UGxheWVyIGluIHRoZSB0dXJuT3JkZXJBcnJheVxuICAgICAgICB0aGlzLnR1cm5PcmRlckFycmF5ID0gW10gLy9ob2xkcyBhbGwgdGhlIHBsYXllcnMgc3RpbGwgb24gdGhlIGJvYXJkLlxuICAgICAgICB0aGlzLmRyYWdvbiA9IFwiXCI7IC8vIFBsYXllci5NYXJrZXJcbiAgICAgICAgdGhpcy5tb3ZlcztcbiAgICB9XG5cbiAgICAvLyBhZGRQbGF5ZXIocGxheWVyKSB7XG4gICAgLy8gICAgIHRoaXMucGxheWVycy5sZW5ndGggPCA4ID8gdGhpcy5wbGF5ZXJzLnB1c2gocGxheWVyKSA6IHRocm93IG5ldyBFcnJvciBcIlJvb20gZnVsbFwiO1xuICAgIC8vIH07XG5cbiAgICBnZXRDdXJyZW50UGxheWVyKCkge1xuICAgICAgICBpZiAodGhpcy5jdXJyUGxheWVyID09PSAtMSkgcmV0dXJuO1xuICAgICAgICByZXR1cm4gdGhpcy50dXJuT3JkZXJBcnJheVt0aGlzLmN1cnJQbGF5ZXJdO1xuICAgIH07XG5cbiAgICBtb3ZlQWxsUGxheWVycygpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLmZvckVhY2goKHBsYXllcikgPT4gcGxheWVyLmtlZXBNb3ZpbmcoKSlcbiAgICB9O1xuXG4gICAgY2hlY2tPdmVyKCkge1xuICAgICAgICByZXR1cm4gZ2V0Q2FuUGxheSgpLmxlbmd0aCA8PSAxO1xuICAgIH1cblxuICAgIC8vdG8gYmUgY2FsbGVkIGF0IHRoZSBlbmQgb2YgYSB0dXJuIHRvIHNldCB0aGUgY3VyclBsYXllciB0byB0aGUgbmV4dCBlbGlnaWJsZSBwbGF5ZXIgaW4gdGhlIHR1cm5PcmRlckFycmF5XG4gICAgZ29Ub05leHRQbGF5ZXIoKSB7XG4gICAgICAgIGlmIChnZXRDYW5QbGF5KHRoaXMudHVybk9yZGVyQXJyYXkpLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIGxldCBuZXdJZHggPSB0aGlzLmN1cnJQbGF5ZXIgKyAxO1xuICAgICAgICAgICAgd2hpbGUgKCF0aGlzLnR1cm5PcmRlckFycmF5W25ld0lkeCAlIDhdLmNhblBsYXkpIHtcbiAgICAgICAgICAgICAgICBuZXdJZHgrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY3VyclBsYXllciA9IG5ld0lkeDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY3VyclBsYXllciA9IC0xXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q3VycmVudFBsYXllcigpXG4gICAgfTtcblxuICAgIC8vcmVzdGFydCB0aGUgZ2FtZVxuICAgIHJlc2V0KCkge1xuICAgICAgICB0aGlzLnBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgICAgICAgLy9yZXRyaWV2ZSBhbGwgdGlsZXNcbiAgICAgICAgICAgIC8vcmV0dXJuIHBsYXllcidzIHRpbGVzIHRvIHRoZSBkZWNrIGFuZCBzaHVmZmxlXG4gICAgICAgICAgICB0aGlzLmRlY2sucmVsb2FkKHBsYXllci50aWxlcykuc2h1ZmZsZSgpO1xuICAgICAgICAgICAgcGxheWVyLnRpbGVzID0gW107XG4gICAgICAgICAgICAvL3Jlc2V0IGFsbCBwbGF5ZXJzIHBsYXlhYmlsaXR5XG4gICAgICAgICAgICBwbGF5ZXIuY2FuUGxheSA9IHRydWU7XG4gICAgICAgIH0pXG4gICAgfVxuXG59XG5cbi8vLy8vRU5EIE9GIEdBTUUgQ0xBU1MvLy8vL1xuXG4vL2dldCBFbGlnaWJsZSBwbGF5ZXJzXG5sZXQgZ2V0Q2FuUGxheSA9IGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgcmV0dXJuIHBsYXllcnMuZmlsdGVyKChwbGF5ZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIHBsYXllci5jYW5QbGF5XG4gICAgfSlcbn1cbiIsInRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZ2FtZScsIHtcbiAgICAgICAgdXJsOiAnL2dhbWUvOmdhbWVOYW1lJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvanMvZ2FtZS9nYW1lLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnZ2FtZUN0cmwnXG4gICAgfSk7XG59KTtcblxudHN1cm8uY29udHJvbGxlcignZ2FtZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCRmaXJlYmFzZUF1dGgsZmlyZWJhc2VVcmwsICRzdGF0ZVBhcmFtcywgJGZpcmViYXNlT2JqZWN0KSB7XG5cbiAgICB2YXIgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcbiAgICB2YXIgZmlyZWJhc2VVc2VyID0gJHNjb3BlLmF1dGhPYmouJGdldEF1dGgoKTtcbiAgICB2YXIgZ2FtZVJlZiA9IGZpcmViYXNlVXJsICsgJ2dhbWVzLycgKyAkc3RhdGVQYXJhbXMuZ2FtZU5hbWU7XG4gICAgdmFyIGRlY2tSZWYgPSBuZXcgRmlyZWJhc2UoZ2FtZVJlZiArICcvaW5pdGlhbERlY2snKTtcbiAgICB2YXIgcGxheWVyc1JlZiA9IG5ldyBGaXJlYmFzZShnYW1lUmVmICsgJy9wbGF5ZXJzJyk7XG4gICAgdmFyIG1hcmtlcnNSZWYgPSBuZXcgRmlyZWJhc2UoZ2FtZVJlZiArICcvYXZhaWxhYmxlTWFya2VycycpO1xuXG4gICAgLy9pbnRpYWxpemUgZ2FtZVxuICAgICRzY29wZS5nYW1lID0gbmV3IEdhbWUoJHN0YXRlUGFyYW1zLmdhbWVOYW1lKTtcbiAgICAkc2NvcGUuZ2FtZS5kZWNrID0gJGZpcmViYXNlT2JqZWN0KGRlY2tSZWYpO1xuXG4gICAgbWFya2Vyc1JlZi5vbigndmFsdWUnLCBmdW5jdGlvbihhdmFpbGFibGVNYXJrZXJzKXtcbiAgICAgICAgJHNjb3BlLmF2YWlsYWJsZU1hcmtlcnMgPSBPYmplY3Qua2V5cyhhdmFpbGFibGVNYXJrZXJzKS5tYXAoZnVuY3Rpb24oaSl7XG4gICAgICAgICAgICByZXR1cm4gYXZhaWxhYmxlTWFya2Vyc1tpXTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB2YXIgYm9hcmQgPSAkc2NvcGUuZ2FtZS5ib2FyZDtcblxuXG4gICAgLy90YWtlIGFsbCBwbGF5ZXJzIG9uIGZpcmViYXNlIGFuZCB0dXJuIHRoZW0gaW50byBsb2NhbCBwbGF5ZXJcbiAgICBwbGF5ZXJzUmVmLm9uKFwiY2hpbGRfYWRkZWRcIiwgZnVuY3Rpb24ocGxheWVyKXtcbiAgICAgICAgdmFyIG5ld1BsYXllciA9IG5ldyBQbGF5ZXIocGxheWVyLnVpZCk7XG4gICAgICAgIG5ld1BsYXllci5tYXJrZXIgPSBwbGF5ZXIubWFya2VyO1xuXG4gICAgICAgIHZhciB4ID0gcGxheWVyLnN0YXJ0aW5nUG9zaXRpb25bMF07XG4gICAgICAgIHZhciB5ID0gcGxheWVyLnN0YXJ0aW5nUG9zaXRpb25bMV07XG4gICAgICAgIHZhciBwb2ludHNJbmRleCA9IHBsYXllci5zdGFydGluZ1Bvc2l0aW9uWzJdO1xuXG4gICAgICAgIG5ld1BsYXllci5wb2ludCA9IGJvYXJkW3ldW3hdLnBvaW50c1twb2ludHNJbmRleF07XG4gICAgICAgIG5ld3BsYXllci5uZXh0U3BhY2UgPSBib2FyZFt5XVt4XTtcbiAgICAgICAgbmV3UGxheWVyLm5leHRTcGFjZVBvaW50c0luZGV4ID0gcGxheWVyLnN0YXJ0aW5nUG9zaXRpb25bMl07XG5cbiAgICAgICAgbmV3UGxheWVyLnRpbGVzID0gJHNjb3BlLmdhbWUuZGVjay5kZWFsVGhyZWUoKTtcblxuICAgICAgICAkc2NvcGUuZ2FtZS5wbGF5ZXJzLnB1c2gobmV3UGxheWVyKTtcbiAgICB9KTtcblxuICAgIC8vZ2V0ICdtZSdcbiAgICAkc2NvcGUubWUgPSAkc2NvcGUuZ2FtZS5wbGF5ZXJzLmZpbHRlcihmdW5jdGlvbihwbGF5ZXIpe1xuICAgICAgICByZXR1cm4gcGxheWVyLnVpZCA9PT0gZmlyZWJhc2VVc2VyLnVpZDtcbiAgICB9KVswXTtcblxuXG4gICAgLy9IYXZlIHBsYXllciBwaWNrIHRoZSBtYXJrZXJcbiAgICAkc2NvcGUucGlja01hcmtlciA9IGZ1bmN0aW9uIChib2FyZCwgbWFya2VyKSB7XG4gICAgICAgICRzY29wZS5wbGF5ZXIubWFya2VyID0gbWFya2VyO1xuICAgICAgICB2YXIgbWFya2VycyA9ICRmaXJlYmFzZUFycmF5KG1hcmtlcnNSZWYpO1xuICAgICAgICB2YXIgaWR4ID0gbWFya2Vycy5pbmRleE9mKG1hcmtlcik7XG4gICAgICAgIG1hcmtlcnMuJHJlbW92ZShtYXJrZXJzW2lkeF0pLnRoZW4oZnVuY3Rpb24ocmVmKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlZi5rZXkpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy9IYXZlIHBsYXllciBwaWNrIHRoZWlyIHN0YXJ0IHBvaW50XG4gICAgJHNjb3BlLnBsYWNlTWFya2VyID0gZnVuY3Rpb24gKGJvYXJkLCBwb2ludCkge1xuICAgICAgICAkc2NvcGUucGxheWVyLnBsYWNlTWFya2VyKHBvaW50KTtcbiAgICAgICAgJHNjb3BlLmdhbWUucGxheWVycy5wdXNoKCRzY29wZS5wbGF5ZXIpO1xuXG4gICAgICAgIGdhbWVSZWYuY2hpbGQoJ3BsYXllcnMnKS5jaGlsZChwbGF5ZXIudWlkKS5wdXNoKHsgJ21hcmtlcic6IHBsYXllci5tYXJrZXIsICdzdGFydGluZ1Bvc2l0aW9uJzogcGxheWVyLnN0YXJ0aW5nUG9zaXRpb24gfSk7XG4gICAgfTtcblxuICAgIC8vIFRPRE86IHdlIHByb2JhYmx5IG5lZWQgdGhpcyBvbiBmaXJlYmFzZSBzbyBvdGhlciBwZW9wbGUgY2FuJ3QgcGljayB3aGF0J3MgYmVlbiBwaWNrZWRcblxuICAgIC8vLy9HQU1FIEZCIC0gTU9WRVMgVVBEQVRFIExPT1BcbiAgICAvL2lmIHNvbWV0aGluZyBpcyBhZGRlZCB0byBtb3Zlc1xuICAgIC8vd2F0Y2hlciBmb3IgYWRkZWQgY2hpbGRyZW5cbiAgICAvL3JlZi5vbiBjaGlsZCBhZGRlZFxuXG5cblxuICAgIC8vRm9yIHN5bmNocm9uaXppbmdHYW1lLi4uXG4gICAgLy8gdmFyIHN5bmNoUmVmID0gbmV3IEZpcmViYXNlKGdhbWVSZWYgKyAnL21vdmVzJyk7XG4gICAgLy8gdmFyIHN5bmNocm9uaXplZE9iaiA9ICRmaXJlYmFzZU9iamVjdChzeW5jaFJlZik7XG4gICAgLy8gLy9UaGlzIHJldHVybnMgYSBwcm9taXNlLi4uIHlvdSBjYW4gLnRoZW4oKSBhbmQgYXNzaWduIHZhbHVlIHRvICRzY29wZS52YXJpYWJsZVxuICAgIC8vIHN5bmNocm9uaXplZE9ialxuICAgIC8vIC4kYmluZFRvKCRzY29wZSwgZ2FtZS5tb3Zlcyk7IC8vZG8gd2UgbmVlZCB0aGlzP1xuXG5cbiAgICAvLyBUT0RPOiBob3cgdG8gcmUtZG8gdGhlIG1vdmVzP1xuICAgIC8vICRzY29wZS5nYW1lLm1vdmVzO1xuXG5cblxuXG4gICAgLy8gVE9ETzogaG93IGRvIHdlIHNob3cgdGhlIHRpbGVzIGZvciBwbGF5ZXI/XG5cbiAgICAvLyBUT0RPOiBob3cgdG8gc2hvdyB0aGUgcm90YXRlZCB0aWxlP1xuXG4gICAgLy8gQ01UOiBhc3N1bWluZyB3ZSB1c2UgbmV3IEdhbWUoKSBmb3IgZWFjaCBnYW1lXG4gICAgJHNjb3BlLmN1cnJlbnRQbGF5ZXIgPSAkc2NvcGUuZ2FtZS5nZXRDdXJyZW50UGxheWVyKCk7XG5cbiAgICAvLyBDTVQ6IGFzc3VtaW5nIHdlIHVzZSBuZXcgR2FtZSgpIGZvciBlYWNoIGdhbWUsIGhvbGRzIGFsbCB0aGUgcGxheWVycyBzdGlsbCBvbiB0aGUgYm9hcmQuXG4gICAgJHNjb3BlLnR1cm5PcmRlckFycmF5ID0gJHNjb3BlLmdhbWUuZ2V0Q2FuUGxheSgpO1xuXG4gICAgLy8gVE9ETzogbmVlZCBhIGZ1bmN0aW9uIHRvIGFzc2lnbiBkcmFnb25cbiAgICAkc2NvcGUuZHJhZ29uO1xuXG5cblxuICAgIC8vIENNVDogYXNzdW1pbmcgd2UgYXJlIHVzaW5nIG5ldyBHYW1lKCkgZm9yICRzY29wZS5nYW1lXG4gICAgJHNjb3BlLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBUT0RPOiBhZGQgZ2FtZSBpbml0IHN0YXRlIHdpdGggc2h1ZmZsZWQgZGVja1xuXG4gICAgICAgIC8vIFRPRE86IG5lZWQgdG8gYWRkIHRvIGZpcmViYXNlICg/KVxuICAgICAgICAkc2NvcGUuZ2FtZS50dXJuT3JkZXJBcnJheS5mb3JFYWNoKGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICAgICAgIHBsYXllci50aWxlcyA9ICRzY29wZS5nYW1lLmRlY2suZGVhbFRocmVlKCk7XG4gICAgICAgIH0pXG4gICAgfTtcblxuICAgICRzY29wZS5teVR1cm4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzY29wZS5tZSA9PT0gJHNjb3BlLmN1cnJlbnRQbGF5ZXI7XG4gICAgfTtcblxuICAgIC8vdGhlc2UgYXJlIHRpZWQgdG8gYW5ndWxhciBuZy1jbGljayBidXR0b25zXG4gICAgJHNjb3BlLnJvdGF0ZVRpbGVDdyA9IGZ1bmN0aW9uICh0aWxlKSB7XG4gICAgICAgIHRpbGUucm90YXRpb24rKztcbiAgICAgICAgaWYodGlsZS5yb3RhdGlvbiA9PT0gNCkgdGlsZS5yb3RhdGlvbiA9IDA7XG4gICAgfTtcblxuICAgICRzY29wZS5yb3RhdGVUaWxlQ2N3ID0gZnVuY3Rpb24gKHRpbGUpIHtcbiAgICAgICAgdGlsZS5yb3RhdGlvbi0tO1xuICAgICAgICBpZih0aWxlLnJvdGF0aW9uID09PSAtNCkgdGlsZS5yb3RhdGlvbiA9IDA7XG4gICAgfTtcblxuICAgIC8vIENNVDogYXNzdW1pbmcgd2UgdXNlIG5ldyBHYW1lKClcbiAgICAvLyBDTVQ6IHVzZSBwbGF5ZXIncyBhbmQgZ2FtZSdzIHByb3RvdHlwZSBmdW5jdGlvbiB0byBwbGFjZSB0aWxlIGFuZCB0aGVuIG1vdmUgYWxsIHBsYXllcnNcbiAgICAkc2NvcGUucGxhY2VUaWxlID0gZnVuY3Rpb24gKHRpbGUpIHtcbiAgICAgICAgLy8gVE9ETzogc2VuZCB0aGlzIHN0YXRlIHRvIGZpcmViYXNlIGV2ZXJ5IHRpbWUgaXQncyBjYWxsZWRcbiAgICAgICAgaWYodGlsZS5yb3RhdGlvbiA+IDApe1xuICAgICAgICAgICAgdGlsZS5wYXRocyA9IHRpbGUucGF0aHMubWFwKGZ1bmN0aW9uIChjb25uZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbm5lY3Rpb24gKyAyO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aWxlLnBhdGhzLnVuc2hpZnQodGlsZS5wYXRocy5wb3AoKSk7XG4gICAgICAgICAgICB0aWxlLnBhdGhzLnVuc2hpZnQodGlsZS5wYXRocy5wb3AoKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGlsZS5yb3RhdGlvbiA8IDApIHtcbiAgICAgICAgICAgIHRpbGUucGF0aHMgPSB0aWxlLnBhdGhzLm1hcChmdW5jdGlvbiAoY29ubmVjdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb25uZWN0aW9uIC0gMjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGlsZS5wYXRocy5wdXNoKHRpbGUucGF0aHMuc2hpZnQoKSk7XG4gICAgICAgICAgICB0aWxlLnBhdGhzLnB1c2godGlsZS5wYXRocy5zaGlmdCgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5tZS5wbGFjZVRpbGUodGlsZSk7XG4gICAgICAgICRzY29wZS5nYW1lLm1vdmVBbGxwbGF5ZXJzKCk7XG5cbiAgICAgICAgaWYgKCRzY29wZS5nYW1lLmNoZWNrT3ZlcigpKSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBuZWVkIHRvIHRlbGwgdGhlIHBsYXllciBzaGUgd29uXG4gICAgICAgICAgICAkc2NvcGUud2lubmVyID0gJHNjb3BlLmdhbWUuZ2V0Q2FuUGxheSgpWzBdO1xuICAgICAgICAgICAgJHNjb3BlLmdhbWVPdmVyID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIENNVDogZHJhdyBvbmUgdGlsZSBhbmQgcHVzaCBpdCB0byB0aGUgcGxheWVyLnRpbGVzIGFycmF5XG4gICAgICAgICAgICAkc2NvcGUubWUudGlsZXMucHVzaCgkc2NvcGUuZ2FtZS5kZWNrLmRlYWwoMSkpO1xuICAgICAgICAgICAgJHNjb3BlLmdhbWUuZ29Ub05leHRQbGF5ZXIoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBUT0RPOiBmaXJlYmFzZSBnYW1lLnBsYXllcnMgc2xpY2UgJHNjb3BlLnBsYXllciBvdXRcbiAgICAkc2NvcGUubGVhdmVHYW1lO1xuXG4gICAgLy8gVE9ETzogZG8gd2UgcmVtb3ZlIHRoaXMgZ2FtZSByb29tJ3MgbW92ZXMgZnJvbSBmaXJlYmFzZT9cbiAgICAkc2NvcGUucmVzZXQgPSAkc2NvcGUuZ2FtZS5yZXNldDtcblxuXG4gICAgJHNjb3BlLnN0YXJ0dG9wID0gW1xuICAgICAgICBbMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAxXSxcbiAgICAgICAgWzEsIDAsIDBdLFxuICAgICAgICBbMSwgMCwgMV0sXG4gICAgICAgIFsyLCAwLCAwXSxcbiAgICAgICAgWzIsIDAsIDFdLFxuICAgICAgICBbMywgMCwgMF0sXG4gICAgICAgIFszLCAwLCAxXSxcbiAgICAgICAgWzQsIDAsIDBdLFxuICAgICAgICBbNCwgMCwgMV0sXG4gICAgICAgIFs1LCAwLCAwXSxcbiAgICAgICAgWzUsIDAsIDFdXG4gICAgXTtcbiAgICAkc2NvcGUuc3RhcnRsZWZ0ID0gW1xuICAgICAgICBbMCwgMCwgN10sXG4gICAgICAgIFswLCAwLCA2XSxcbiAgICAgICAgWzAsIDEsIDddLFxuICAgICAgICBbMCwgMSwgNl0sXG4gICAgICAgIFswLCAyLCA3XSxcbiAgICAgICAgWzAsIDIsIDZdLFxuICAgICAgICBbMCwgMywgN10sXG4gICAgICAgIFswLCAzLCA2XSxcbiAgICAgICAgWzAsIDQsIDddLFxuICAgICAgICBbMCwgNCwgNl0sXG4gICAgICAgIFswLCA1LCA3XSxcbiAgICAgICAgWzAsIDUsIDZdXG4gICAgXTtcbiAgICAkc2NvcGUuc3RhcnRib3R0b20gPSBbXG4gICAgICAgIFswLCA1LCAwXSxcbiAgICAgICAgWzAsIDUsIDFdLFxuICAgICAgICBbMSwgNSwgMF0sXG4gICAgICAgIFsxLCA1LCAxXSxcbiAgICAgICAgWzIsIDUsIDBdLFxuICAgICAgICBbMiwgNSwgMV0sXG4gICAgICAgIFszLCA1LCAwXSxcbiAgICAgICAgWzMsIDUsIDFdLFxuICAgICAgICBbNCwgNSwgMF0sXG4gICAgICAgIFs0LCA1LCAxXSxcbiAgICAgICAgWzUsIDUsIDBdLFxuICAgICAgICBbNSwgNSwgMV1cbiAgICBdO1xuICAgICRzY29wZS5zdGFydHJpZ2h0ID0gW1xuICAgICAgICBbNSwgMCwgMl0sXG4gICAgICAgIFs1LCAwLCAzXSxcbiAgICAgICAgWzUsIDEsIDJdLFxuICAgICAgICBbNSwgMSwgM10sXG4gICAgICAgIFs1LCAyLCAyXSxcbiAgICAgICAgWzUsIDIsIDNdLFxuICAgICAgICBbNSwgMywgMl0sXG4gICAgICAgIFs1LCAzLCAzXSxcbiAgICAgICAgWzUsIDQsIDJdLFxuICAgICAgICBbNSwgNCwgM10sXG4gICAgICAgIFs1LCA1LCAyXSxcbiAgICAgICAgWzUsIDUsIDNdXG4gICAgXTtcblxuXG5cbn0pO1xuXG5cbiAgICAgICAiLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2dhbWVsaXN0Jywge1xuICAgICAgICB1cmw6ICcvZ2FtZWxpc3QnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9qcy9nYW1lbGlzdC9nYW1lbGlzdC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2dhbWVMaXN0JyxcbiAgICB9KTtcbn0pO1xuXG50c3Vyby5jb250cm9sbGVyKCdnYW1lTGlzdCcsIGZ1bmN0aW9uICgkc2NvcGUsIGZpcmViYXNlVXJsLCAkZmlyZWJhc2VPYmplY3QpIHtcbiAgICAvL0ZvciBzeW5jaHJvbml6aW5nR2FtZUxpc3QuLi5cbiAgICB2YXIgc3luY2hSZWYgPSBuZXcgRmlyZWJhc2UoZmlyZWJhc2VVcmwgKyBnYW1lcyk7XG4gICAgdmFyIHN5bmNocm9uaXplZE9iaiA9ICRmaXJlYmFzZU9iamVjdChzeW5jaFJlZik7XG4gICAgLy9UaGlzIHJldHVybnMgYSBwcm9taXNlLi4uIHlvdSBjYW4gLnRoZW4oKSBhbmQgYXNzaWduIHZhbHVlIHRvICRzY29wZS52YXJpYWJsZVxuICAgIHN5bmNocm9uaXplZE9iai4kYmluZFRvKCRzY29wZSwgZ2FtZWxpc3QpOyAvL2RhdGEgaXMgd2hhdGV2ZXIgd2UgYXJlIGNhbGxpbmcgaXQgaW4gdGhlIGFuZ3VsYXIgaHRtbC4gICAgXG5cbiAgICAkc2NvcGUuam9pbiA9IGZ1bmN0aW9uIChnYW1lTmFtZSkge1xuICAgICAgICAkc3RhdGUuZ28oJ2dhbWUnLCB7XCJnYW1lTmFtZVwiOiBnYW1lTmFtZX0pO1xuICAgIH07XG59KTtcbiIsInRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbG9naW4nLCB7XG4gICAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2pzL2xvZ2luL2xvZ2luLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnbG9naW5DdHJsJ1xuICAgIH0pO1xufSk7XG5cbnRzdXJvLmNvbnRyb2xsZXIoJ2xvZ2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSkge1xuICAgIHZhciBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuXG4gICAgJHNjb3BlLmxvZ0luV2l0aEdvb2dsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYXV0aC4kc2lnbkluV2l0aFBvcHVwKFwiZ29vZ2xlXCIpLnRoZW4oZnVuY3Rpb24gKGF1dGhEYXRhKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkxvZ2dlZCBpbiBhczpcIiwgYXV0aERhdGEpO1xuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJBdXRoZW50aWNhdGlvbiBmYWlsZWQ6XCIsIGVycm9yKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHN0YXRlLmdvKCdwaWNrR2FtZScpO1xuICAgIH07XG5cbn0pO1xuIiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdwaWNrR2FtZScsIHtcbiAgICAgICAgdXJsOiAnL3BpY2tnYW1lJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvanMvcGlja0dhbWUvcGlja0dhbWUuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdwaWNrR2FtZUN0cmwnXG4gICAgfSk7XG59KTtcblxudHN1cm8uY29udHJvbGxlcigncGlja0dhbWVDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlLCAkZmlyZWJhc2VBdXRoLCBmaXJlYmFzZVVybCkge1xuICAgIHZhciByZWYgPSBuZXcgRmlyZWJhc2UoZmlyZWJhc2VVcmwpO1xuICAgIFxuICAgICRzY29wZS5jcmVhdGVHYW1lID0gZnVuY3Rpb24gKGdhbWVOYW1lKSB7XG4gICAgICAgIC8vIHZhciBnYW1lID0gbmV3IEdhbWUoZ2FtZU5hbWUpO1xuICAgICAgICB2YXIgZGVjayA9IG5ldyBEZWNrKCkuc2h1ZmZsZTtcbiAgICAgICAgcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKGdhbWVOYW1lKS5jaGlsZCgnaW5pdGlhbERlY2snKS5wdXNoKGRlY2spO1xuICAgICAgICByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoZ2FtZU5hbWUpLmNoaWxkKCdhdmFpbGFibGVNYXJrZXJzJykucHVzaChbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJ5ZWxsb3dcIiwgXCJncmVlblwiLCBcImFxdWFcIiwgXCJibHVlXCIsIFwibmF2eVwiLCBcInB1cnBsZVwiXSkgICAgICAgXG4gICAgICAgICRzdGF0ZS5nbygnZ2FtZScsIHtcImdhbWVOYW1lXCI6IGdhbWVOYW1lfSk7XG4gICAgfTtcblxuICAgICRzY29wZS5nb1RvR2FtZUxpc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzdGF0ZS5nbygnZ2FtZWxpc3QnKTtcbiAgICB9O1xufSk7XG4iLCIndXNlIHN0cmljdCdcblxuZnVuY3Rpb24gUGxheWVyKHVpZCkge1xuICAgIC8vIFRPRE86IGdldCB1aWQgZnJvbSBmaXJlYmFzZSBhdXRoXG4gICAgdGhpcy51aWQgPSB1aWQ7XG5cbiAgICB0aGlzLm1hcmtlciA9IG51bGw7XG5cbiAgICAvLyBzaG91bGQgYmUgYSBQb2ludCBvYmplY3RcbiAgICB0aGlzLnBvaW50ID0gbnVsbDtcblxuICAgIC8vIFt4LCB5XVxuICAgIC8vIGRlcGVuZHMgb24gdGhlIGFuZ3VsYXIgU3BhY2UueCwgU3BhY2UueVxuICAgIHRoaXMubmV4dFNwYWNlID0gbnVsbDtcblxuICAgIC8vIGluIGVhY2ggU3BhY2UucG9pbnRzIGFycmF5LCBmaW5kIHRoaXMgc3BlY2lmaWMgcG9pbnQgYW5kIGdldCB0aGUgcG9zaXRpb24gKGludGVnZXIpIGluc2lkZSB0aGlzIHNwYWNlLlxuICAgIHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPSBudWxsO1xuXG4gICAgLy8gbWF4aW11biAzIHRpbGVzXG4gICAgdGhpcy50aWxlcyA9IFtdO1xuXG4gICAgLy8gaWYgYSBwbGF5ZXIgZGllcywgaXQgd2lsbCBiZSBjaGFuZ2VkIHRvIGZhbHNlXG4gICAgdGhpcy5jYW5QbGF5ID0gdHJ1ZTtcbn1cblxuUGxheWVyLnByb3RvdHlwZS5wbGFjZU1hcmtlciA9IGZ1bmN0aW9uIChib2FyZCwgcG9pbnQpIHtcbiAgICAvLyBwb2ludCBsb29rcyBsaWtlIFt4LCB5LCBwb2ludHNJbmRleF0gaW4gdGhlIHNwYWNlXG4gICAgdmFyIHggPSBwb2ludFswXTtcbiAgICB2YXIgeSA9IHBvaW50WzFdO1xuICAgIHZhciBwb2ludHNJbmRleCA9IHBvaW50WzJdO1xuXG4gICAgdGhpcy5wb2ludCA9IGJvYXJkW3ldW3hdLnBvaW50c1twb2ludHNJbmRleF07XG4gICAgdGhpcy5wb2ludC50cmF2ZWxsZWQgPSB0cnVlO1xuXG4gICAgLy9beCwgeV0gZnJvbSB0aGUgcG9pbnRcbiAgICB0aGlzLm5leHRTcGFjZSA9IGJvYXJkW3ldW3hdO1xuXG4gICAgLy8gaW4gZWFjaCBTcGFjZS5wb2ludHMgYXJyYXksIGZpbmQgdGhpcyBzcGVjaWZpYyBwb2ludCBhbmQgZ2V0IHRoZSBwb3NpdGlvbiAoaW50ZWdlcikgaW5zaWRlIHRoaXMgc3BhY2UuXG4gICAgdGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9IHRoaXMubmV4dFNwYWNlLnBvaW50cy5pbmRleE9mKHRoaXMucG9pbnQpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5uZXdTcGFjZSA9IGZ1bmN0aW9uIChib2FyZCwgb2xkU3BhY2UpIHtcbiAgICBpZiAodGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gMCB8fCB0aGlzLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSAxKSB7XG4gICAgICAgIHJldHVybiBib2FyZFtvbGRTcGFjZS55IC0gMV1bb2xkU3BhY2UueF07XG4gICAgfSBlbHNlIGlmICh0aGlzLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSAyIHx8IHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDMpIHtcbiAgICAgICAgcmV0dXJuIGJvYXJkW29sZFNwYWNlLnldW29sZFNwYWNlLnggKyAxXTtcbiAgICB9IGVsc2UgaWYgKHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDQgfHwgdGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gNSkge1xuICAgICAgICByZXR1cm4gYm9hcmRbb2xkU3BhY2UueSArIDFdW29sZFNwYWNlLnhdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBib2FyZFtvbGRTcGFjZS55XVtvbGRTcGFjZS54IC0gMV07XG4gICAgfVxufTtcblxuUGxheWVyLnByb3RvdHlwZS5wbGFjZVRpbGUgPSBmdW5jdGlvbiAodGlsZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMudGlsZXMuaW5kZXhPZih0aWxlKTtcbiAgICB0aGlzLnRpbGVzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICB0aGlzLm5leHRTcGFjZS50aWxlVXJsID0gdGlsZS5pbWFnZVVybDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGlsZS5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLm5leHRTcGFjZS5wb2ludHNbaV0ubmVpZ2hib3JzLnB1c2godGhpcy5uZXh0U3BhY2UucG9pbnRzW3RpbGVbaV1dKTtcbiAgICB9XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLm1vdmVUbyA9IGZ1bmN0aW9uIChwb2ludGVyKSB7XG4gICAgLy8gbGV0IHBvaW50ZXIgPSBwb2ludGVyO1xuXG4gICAgLy9hbHdheXMgYmUgcmV0dXJuaW5nIDAgb3IgMSBwb2ludCBpbiB0aGUgYXJyYXlcbiAgICBsZXQgbmV4dFBvaW50ID0gcG9pbnRlci5uZWlnaGJvcnMuZmlsdGVyKGZ1bmN0aW9uIChuZWlnaGJvcikge1xuICAgICAgICByZXR1cm4gIW5laWdoYm9yLnRyYXZlbGxlZDtcbiAgICB9KVswXTtcblxuICAgIHJldHVybiBuZXh0UG9pbnQ7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLmtlZXBNb3ZpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IG1vdmFibGUgPSB0aGlzLm1vdmVUbyh0aGlzLnBvaW50KTtcbiAgICB3aGlsZSAobW92YWJsZSkge1xuICAgICAgICB0aGlzLnBvaW50LnRyYXZlbGxlZCA9IHRydWU7XG4gICAgICAgIHRoaXMucG9pbnQgPSB0aGlzLm1vdmVUbyh0aGlzLnBvaW50KTtcbiAgICAgICAgbGV0IG9sZFNwYWNlID0gdGhpcy5uZXh0U3BhY2U7XG4gICAgICAgIGxldCBuZXdTcGFjZSA9IG5ld1NwYWNlKG9sZFNwYWNlKTtcbiAgICAgICAgdGhpcy5uZXh0U3BhY2UgPSBuZXdTcGFjZTtcblxuICAgICAgICB0aGlzLmNoZWNrRGVhdGgoKTtcbiAgICAgICAgbW92YWJsZSA9IHRoaXMubW92ZVRvKHRoaXMucG9pbnQpO1xuICAgIH1cbn07XG5cblBsYXllci5wcm90b3R5cGUuY2hlY2tEZWF0aCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYWxsVHJhdmVsbGVkID0gdGhpcy5wb2ludC5uZWlnaGJvcnMuZmlsdGVyKGZ1bmN0aW9uIChuZWlnaGJvcikge1xuICAgICAgICByZXR1cm4gbmVpZ2hib3IudHJhdmVsbGVkO1xuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMucG9pbnQuZWRnZSB8fCBhbGxUcmF2ZWxsZWQubGVuZ3RoID09PSAyKSB0aGlzLmRpZSgpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5kaWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jYW5QbGF5ID0gZmFsc2U7XG4gICAgLy8gVE9ETzogbmVlZCB0byBzZW5kIGFuIGFsZXJ0IG9yIG1lc3NhZ2UgdG8gdGhlIHBsYXllciB3aG8ganVzdCBkaWVkLlxufTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
