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

'use strict';

// https://github.com/Mostafa-Samir/Tic-Tac-Toe-AI/blob/master/scripts/ai.js

/*
 * Constructs an action that the ai player could make
 * @param pos [Number]: the cell position the ai would make its action in
 * made that action
 */
var AIAction = function AIAction(pos) {

    // public : the position on the board that the action would put the letter on
    this.movePosition = pos;

    //public : the minimax value of the state that the action leads to when applied
    this.minimaxVal = 0;

    /*
     * public : applies the action to a state to get the next state
     * @param state [State]: the state to apply the action to
     * @return [State]: the next state
     */
    this.applyTo = function (state) {
        var next = new State(state);

        //put the letter on the board
        next.board[this.movePosition] = state.turn;

        if (state.turn === "O") next.oMovesCount++;

        next.advanceTurn();

        return next;
    };
};

/*
 * public static function that defines a rule for sorting AIActions in ascending manner
 * @param firstAction [AIAction] : the first action in a pairwise sort
 * @param secondAction [AIAction]: the second action in a pairwise sort
 * @return [Number]: -1, 1, or 0
 */
AIAction.ASCENDING = function (firstAction, secondAction) {
    if (firstAction.minimaxVal < secondAction.minimaxVal) return -1; //indicates that firstAction goes before secondAction
    else if (firstAction.minimaxVal > secondAction.minimaxVal) return 1; //indicates that secondAction goes before firstAction
        else return 0; //indicates a tie
};

/*
 * public static function that defines a rule for sorting AIActions in descending manner
 * @param firstAction [AIAction] : the first action in a pairwise sort
 * @param secondAction [AIAction]: the second action in a pairwise sort
 * @return [Number]: -1, 1, or 0
 */
AIAction.DESCENDING = function (firstAction, secondAction) {
    if (firstAction.minimaxVal > secondAction.minimaxVal) return -1; //indicates that firstAction goes before secondAction
    else if (firstAction.minimaxVal < secondAction.minimaxVal) return 1; //indicates that secondAction goes before firstAction
        else return 0; //indicates a tie
};

/*
 * Constructs an AI player with a specific level of intelligence
 * @param level [String]: the desired level of intelligence
 */
var AI = function AI(level) {

    //private attribute: level of intelligence the player has
    var levelOfIntelligence = level;

    //private attribute: the game the player is playing
    var game = {};

    /*
     * private recursive function that computes the minimax value of a game state
     * @param state [State] : the state to calculate its minimax value
     * @returns [Number]: the minimax value of the state
     */
    function minimaxValue(state) {
        if (state.isTerminal()) {
            //a terminal game state is the base case
            return Game.score(state);
        } else {
            var stateScore; // this stores the minimax value we'll compute

            if (state.turn === "X")
                // X wants to maximize --> initialize to a value smaller than any possible score
                stateScore = -1000;else
                // O wants to minimize --> initialize to a value larger than any possible score
                stateScore = 1000;

            var availablePositions = state.emptyCells();

            //enumerate next available states using the info form available positions
            var availableNextStates = availablePositions.map(function (pos) {
                var action = new AIAction(pos);

                var nextState = action.applyTo(state);

                return nextState;
            });

            /* calculate the minimax value for all available next states
             * and evaluate the current state's value */
            availableNextStates.forEach(function (nextState) {
                var nextScore = minimaxValue(nextState);
                if (state.turn === "X") {
                    // X wants to maximize --> update stateScore iff nextScore is larger
                    if (nextScore > stateScore) stateScore = nextScore;
                } else {
                    // O wants to minimize --> update stateScore iff nextScore is smaller
                    if (nextScore < stateScore) stateScore = nextScore;
                }
            });

            return stateScore;
        }
    }

    /*
     * private function: make the ai player take a blind move
     * that is: choose the cell to place its symbol randomly
     * @param turn [String]: the player to play, either X or O
     */
    function takeABlindMove(turn) {
        var available = game.currentState.emptyCells();
        var randomCell = available[Math.floor(Math.random() * available.length)];
        var action = new AIAction(randomCell);

        var next = action.applyTo(game.currentState);

        ui.insertAt(randomCell, turn);

        game.advanceTo(next);
    }

    /*
     * private function: make the ai player take a novice move,
     * that is: mix between choosing the optimal and suboptimal minimax decisions
     * @param turn [String]: the player to play, either X or O
     */
    function takeANoviceMove(turn) {
        var available = game.currentState.emptyCells();

        //enumerate and calculate the score for each available actions to the ai player
        var availableActions = available.map(function (pos) {
            var action = new AIAction(pos); //create the action object
            var nextState = action.applyTo(game.currentState); //get next state by applying the action

            action.minimaxVal = minimaxValue(nextState); //calculate and set the action's minimax value

            return action;
        });

        //sort the enumerated actions list by score
        if (turn === "X")
            //X maximizes --> sort the actions in a descending manner to have the action with maximum minimax at first
            availableActions.sort(AIAction.DESCENDING);else
            //O minimizes --> sort the actions in an ascending manner to have the action with minimum minimax at first
            availableActions.sort(AIAction.ASCENDING);

        /*
         * take the optimal action 40% of the time, and take the 1st suboptimal action 60% of the time
         */
        var chosenAction;
        if (Math.random() * 100 <= 40) {
            chosenAction = availableActions[0];
        } else {
            if (availableActions.length >= 2) {
                //if there is two or more available actions, choose the 1st suboptimal
                chosenAction = availableActions[1];
            } else {
                //choose the only available actions
                chosenAction = availableActions[0];
            }
        }
        var next = chosenAction.applyTo(game.currentState);

        ui.insertAt(chosenAction.movePosition, turn);

        game.advanceTo(next);
    };

    /*
     * private function: make the ai player take a master move,
     * that is: choose the optimal minimax decision
     * @param turn [String]: the player to play, either X or O
     */
    function takeAMasterMove(turn) {
        var available = game.currentState.emptyCells();

        //enumerate and calculate the score for each avaialable actions to the ai player
        var availableActions = available.map(function (pos) {
            var action = new AIAction(pos); //create the action object
            var next = action.applyTo(game.currentState); //get next state by applying the action

            action.minimaxVal = minimaxValue(next); //calculate and set the action's minmax value

            return action;
        });

        //sort the enumerated actions list by score
        if (turn === "X")
            //X maximizes --> sort the actions in a descending manner to have the action with maximum minimax at first
            availableActions.sort(AIAction.DESCENDING);else
            //O minimizes --> sort the actions in an ascending manner to have the action with minimum minimax at first
            availableActions.sort(AIAction.ASCENDING);

        //take the first action as it's the optimal
        var chosenAction = availableActions[0];
        var next = chosenAction.applyTo(game.currentState);

        ui.insertAt(chosenAction.movePosition, turn);

        game.advanceTo(next);
    }

    /*
     * public method to specify the game the ai player will play
     * @param _game [Game] : the game the ai will play
     */
    this.plays = function (_game) {
        game = _game;
    };

    /*
     * public function: notify the ai player that it's its turn
     * @param turn [String]: the player to play, either X or O
     */
    this.notify = function (turn) {
        switch (levelOfIntelligence) {
            //invoke the desired behavior based on the level chosen
            case "blind":
                takeABlindMove(turn);break;
            case "novice":
                takeANoviceMove(turn);break;
            case "master":
                takeAMasterMove(turn);break;
        }
    };
};

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
    var firebaseUser = $scope.authObj.$getAuth();
    var gameRef = firebaseUrl + 'games/' + $stateParams.gameName;
    var deckRef = new Firebase(gameRef + '/initialDeck');
    var playersRef = new Firebase(gameRef + '/players');
    var markersRef = new Firebase(gameRef + '/availableMarkers');

    //intialize game
    $scope.game = new Game($stateParams.gameName, $stateParams.deck);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFpL2FpLWV4YW1wbGUuanMiLCJnYW1lbGlzdC9nYW1lbGlzdC5qcyIsImdhbWUvZGVjay5qcyIsImdhbWUvZ2FtZS5jb250cnVjdG9yLmpzIiwiZ2FtZS9nYW1lLmpzIiwicGlja0dhbWUvcGlja0dhbWUuanMiLCJsb2dpbi9sb2dpbi5qcyIsInBsYXllci9wbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBQSxRQUFBLFFBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTs7QUFFQSxNQUFBLE1BQUEsQ0FBQSxZQUFBO0FBQ0EsUUFBQSxTQUFBO0FBQ0EsZ0JBQUEseUNBREE7QUFFQSxvQkFBQSxzQ0FGQTtBQUdBLHFCQUFBLDZDQUhBO0FBSUEsdUJBQUE7QUFKQSxLQUFBO0FBTUEsYUFBQSxhQUFBLENBQUEsTUFBQTtBQUNBLENBUkE7O0FBVUEsTUFBQSxRQUFBLENBQUEsYUFBQSxFQUFBLDRDQUFBOztBQUVBLE1BQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQTtBQUNBLHVCQUFBLFNBQUEsQ0FBQSxHQUFBO0FBQ0EsQ0FGQTs7QUNkQTs7Ozs7Ozs7O0FBU0EsSUFBQSxXQUFBLFNBQUEsUUFBQSxDQUFBLEdBQUEsRUFBQTs7O0FBR0EsU0FBQSxZQUFBLEdBQUEsR0FBQTs7O0FBR0EsU0FBQSxVQUFBLEdBQUEsQ0FBQTs7Ozs7OztBQU9BLFNBQUEsT0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsWUFBQSxPQUFBLElBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQTs7O0FBR0EsYUFBQSxLQUFBLENBQUEsS0FBQSxZQUFBLElBQUEsTUFBQSxJQUFBOztBQUVBLFlBQUEsTUFBQSxJQUFBLEtBQUEsR0FBQSxFQUNBLEtBQUEsV0FBQTs7QUFFQSxhQUFBLFdBQUE7O0FBRUEsZUFBQSxJQUFBO0FBQ0EsS0FaQTtBQWFBLENBMUJBOzs7Ozs7OztBQWtDQSxTQUFBLFNBQUEsR0FBQSxVQUFBLFdBQUEsRUFBQSxZQUFBLEVBQUE7QUFDQSxRQUFBLFlBQUEsVUFBQSxHQUFBLGFBQUEsVUFBQSxFQUNBLE9BQUEsQ0FBQSxDQUFBLEM7QUFEQSxTQUVBLElBQUEsWUFBQSxVQUFBLEdBQUEsYUFBQSxVQUFBLEVBQ0EsT0FBQSxDQUFBLEM7QUFEQSxhQUdBLE9BQUEsQ0FBQSxDO0FBQ0EsQ0FQQTs7Ozs7Ozs7QUFlQSxTQUFBLFVBQUEsR0FBQSxVQUFBLFdBQUEsRUFBQSxZQUFBLEVBQUE7QUFDQSxRQUFBLFlBQUEsVUFBQSxHQUFBLGFBQUEsVUFBQSxFQUNBLE9BQUEsQ0FBQSxDQUFBLEM7QUFEQSxTQUVBLElBQUEsWUFBQSxVQUFBLEdBQUEsYUFBQSxVQUFBLEVBQ0EsT0FBQSxDQUFBLEM7QUFEQSxhQUdBLE9BQUEsQ0FBQSxDO0FBQ0EsQ0FQQTs7Ozs7O0FBY0EsSUFBQSxLQUFBLFNBQUEsRUFBQSxDQUFBLEtBQUEsRUFBQTs7O0FBR0EsUUFBQSxzQkFBQSxLQUFBOzs7QUFHQSxRQUFBLE9BQUEsRUFBQTs7Ozs7OztBQU9BLGFBQUEsWUFBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLFlBQUEsTUFBQSxVQUFBLEVBQUEsRUFBQTs7QUFFQSxtQkFBQSxLQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxTQUhBLE1BSUE7QUFDQSxnQkFBQSxVQUFBLEM7O0FBRUEsZ0JBQUEsTUFBQSxJQUFBLEtBQUEsR0FBQTs7QUFFQSw2QkFBQSxDQUFBLElBQUEsQ0FGQTs7QUFLQSw2QkFBQSxJQUFBOztBQUVBLGdCQUFBLHFCQUFBLE1BQUEsVUFBQSxFQUFBOzs7QUFHQSxnQkFBQSxzQkFBQSxtQkFBQSxHQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxvQkFBQSxTQUFBLElBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQTs7QUFFQSxvQkFBQSxZQUFBLE9BQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQTs7QUFFQSx1QkFBQSxTQUFBO0FBQ0EsYUFOQSxDQUFBOzs7O0FBVUEsZ0NBQUEsT0FBQSxDQUFBLFVBQUEsU0FBQSxFQUFBO0FBQ0Esb0JBQUEsWUFBQSxhQUFBLFNBQUEsQ0FBQTtBQUNBLG9CQUFBLE1BQUEsSUFBQSxLQUFBLEdBQUEsRUFBQTs7QUFFQSx3QkFBQSxZQUFBLFVBQUEsRUFDQSxhQUFBLFNBQUE7QUFDQSxpQkFKQSxNQUtBOztBQUVBLHdCQUFBLFlBQUEsVUFBQSxFQUNBLGFBQUEsU0FBQTtBQUNBO0FBQ0EsYUFaQTs7QUFjQSxtQkFBQSxVQUFBO0FBQ0E7QUFDQTs7Ozs7OztBQU9BLGFBQUEsY0FBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFlBQUEsWUFBQSxLQUFBLFlBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxZQUFBLGFBQUEsVUFBQSxLQUFBLEtBQUEsQ0FBQSxLQUFBLE1BQUEsS0FBQSxVQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxTQUFBLElBQUEsUUFBQSxDQUFBLFVBQUEsQ0FBQTs7QUFFQSxZQUFBLE9BQUEsT0FBQSxPQUFBLENBQUEsS0FBQSxZQUFBLENBQUE7O0FBRUEsV0FBQSxRQUFBLENBQUEsVUFBQSxFQUFBLElBQUE7O0FBRUEsYUFBQSxTQUFBLENBQUEsSUFBQTtBQUNBOzs7Ozs7O0FBT0EsYUFBQSxlQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsWUFBQSxZQUFBLEtBQUEsWUFBQSxDQUFBLFVBQUEsRUFBQTs7O0FBR0EsWUFBQSxtQkFBQSxVQUFBLEdBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGdCQUFBLFNBQUEsSUFBQSxRQUFBLENBQUEsR0FBQSxDQUFBLEM7QUFDQSxnQkFBQSxZQUFBLE9BQUEsT0FBQSxDQUFBLEtBQUEsWUFBQSxDQUFBLEM7O0FBRUEsbUJBQUEsVUFBQSxHQUFBLGFBQUEsU0FBQSxDQUFBLEM7O0FBRUEsbUJBQUEsTUFBQTtBQUNBLFNBUEEsQ0FBQTs7O0FBVUEsWUFBQSxTQUFBLEdBQUE7O0FBRUEsNkJBQUEsSUFBQSxDQUFBLFNBQUEsVUFBQSxFQUZBOztBQUtBLDZCQUFBLElBQUEsQ0FBQSxTQUFBLFNBQUE7Ozs7O0FBS0EsWUFBQSxZQUFBO0FBQ0EsWUFBQSxLQUFBLE1BQUEsS0FBQSxHQUFBLElBQUEsRUFBQSxFQUFBO0FBQ0EsMkJBQUEsaUJBQUEsQ0FBQSxDQUFBO0FBQ0EsU0FGQSxNQUdBO0FBQ0EsZ0JBQUEsaUJBQUEsTUFBQSxJQUFBLENBQUEsRUFBQTs7QUFFQSwrQkFBQSxpQkFBQSxDQUFBLENBQUE7QUFDQSxhQUhBLE1BSUE7O0FBRUEsK0JBQUEsaUJBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQTtBQUNBLFlBQUEsT0FBQSxhQUFBLE9BQUEsQ0FBQSxLQUFBLFlBQUEsQ0FBQTs7QUFFQSxXQUFBLFFBQUEsQ0FBQSxhQUFBLFlBQUEsRUFBQSxJQUFBOztBQUVBLGFBQUEsU0FBQSxDQUFBLElBQUE7QUFDQTs7Ozs7OztBQU9BLGFBQUEsZUFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFlBQUEsWUFBQSxLQUFBLFlBQUEsQ0FBQSxVQUFBLEVBQUE7OztBQUdBLFlBQUEsbUJBQUEsVUFBQSxHQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxnQkFBQSxTQUFBLElBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxDO0FBQ0EsZ0JBQUEsT0FBQSxPQUFBLE9BQUEsQ0FBQSxLQUFBLFlBQUEsQ0FBQSxDOztBQUVBLG1CQUFBLFVBQUEsR0FBQSxhQUFBLElBQUEsQ0FBQSxDOztBQUVBLG1CQUFBLE1BQUE7QUFDQSxTQVBBLENBQUE7OztBQVVBLFlBQUEsU0FBQSxHQUFBOztBQUVBLDZCQUFBLElBQUEsQ0FBQSxTQUFBLFVBQUEsRUFGQTs7QUFLQSw2QkFBQSxJQUFBLENBQUEsU0FBQSxTQUFBOzs7QUFJQSxZQUFBLGVBQUEsaUJBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxPQUFBLGFBQUEsT0FBQSxDQUFBLEtBQUEsWUFBQSxDQUFBOztBQUVBLFdBQUEsUUFBQSxDQUFBLGFBQUEsWUFBQSxFQUFBLElBQUE7O0FBRUEsYUFBQSxTQUFBLENBQUEsSUFBQTtBQUNBOzs7Ozs7QUFPQSxTQUFBLEtBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLGVBQUEsS0FBQTtBQUNBLEtBRkE7Ozs7OztBQVFBLFNBQUEsTUFBQSxHQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsbUJBQUE7O0FBRUEsaUJBQUEsT0FBQTtBQUFBLCtCQUFBLElBQUEsRUFBQTtBQUNBLGlCQUFBLFFBQUE7QUFBQSxnQ0FBQSxJQUFBLEVBQUE7QUFDQSxpQkFBQSxRQUFBO0FBQUEsZ0NBQUEsSUFBQSxFQUFBO0FBSkE7QUFNQSxLQVBBO0FBUUEsQ0F2TEE7O0FDeEVBLE1BQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLGFBQUEsV0FEQTtBQUVBLHFCQUFBLG9DQUZBO0FBR0Esb0JBQUE7QUFIQSxLQUFBO0FBS0EsQ0FOQTs7QUFRQSxNQUFBLFVBQUEsQ0FBQSxVQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBLGVBQUEsRUFBQSxNQUFBLEVBQUE7O0FBRUEsUUFBQSxNQUFBLFNBQUEsUUFBQSxHQUFBLEdBQUEsRUFBQTtBQUNBLFFBQUEsTUFBQSxnQkFBQSxHQUFBLENBQUE7O0FBRUEsUUFBQSxXQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQTtBQUNBLFlBQUEsR0FBQSxDQUFBLFFBQUE7O0FBRUEsUUFBQSxrQkFBQSxnQkFBQSxRQUFBLENBQUE7QUFDQSxZQUFBLEdBQUEsQ0FBQSxlQUFBOzs7O0FBSUEsb0JBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxVQUFBLEVBQ0EsSUFEQSxDQUNBLFlBQUE7QUFDQSxZQUFBLFdBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLElBQUEsT0FBQSxRQUFBLEVBQUE7QUFDQSxxQkFBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLGVBQUEsU0FBQSxHQUFBLFNBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLEtBUEE7O0FBVUEsV0FBQSxJQUFBLEdBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxnQkFBQSxHQUFBLENBQUEsUUFBQTtBQUNBLGVBQUEsRUFBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLHdCQUFBO0FBREEsU0FBQTtBQUdBLEtBTEE7QUFNQSxDQTdCQTs7QUNSQTs7SUFFQSxJO0FBQ0Esa0JBQUEsS0FBQSxFQUFBO0FBQUE7O0FBQ0EsYUFBQSxLQUFBLEdBQUEsS0FBQTtBQUNBOzs7O2tDQUVBO0FBQ0EsaUJBQUEsS0FBQSxHQUFBLEVBQUEsT0FBQSxDQUFBLEtBQUEsS0FBQSxDQUFBO0FBQ0EsbUJBQUEsSUFBQTtBQUNBOzs7b0NBRUE7QUFDQSxtQkFBQSxLQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtBQUNBOzs7NkJBRUEsRyxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxLQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsRUFBQSxHQUFBLENBQUE7QUFDQTs7OytCQUVBLEssRUFBQTtBQUNBLGlCQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQTtBQUNBLG1CQUFBLElBQUE7QUFDQTs7Ozs7O0FDdkJBOzs7O0lBSUEsSTtBQUNBLGtCQUFBLElBQUEsRUFBQTtBQUFBOztBQUNBLGFBQUEsSUFBQSxHQUFBLElBQUE7QUFDQSxhQUFBLEtBQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxLQUFBLEdBQUEsSUFBQSxLQUFBLEVBQUE7QUFDQSxhQUFBLE9BQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxnQkFBQSxHQUFBLENBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxRQUFBLEVBQUEsT0FBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLFFBQUEsQ0FBQTs7QUFFQSxhQUFBLFVBQUEsQztBQUNBLGFBQUEsY0FBQSxHQUFBLEVBQUEsQztBQUNBLGFBQUEsTUFBQSxHQUFBLEVBQUEsQztBQUNBLGFBQUEsS0FBQTtBQUNBOzs7Ozs7OzsyQ0FNQTtBQUNBLGdCQUFBLEtBQUEsVUFBQSxLQUFBLENBQUEsQ0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxjQUFBLENBQUEsS0FBQSxVQUFBLENBQUE7QUFDQTs7O3lDQUVBO0FBQ0EsaUJBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLE1BQUE7QUFBQSx1QkFBQSxPQUFBLFVBQUEsRUFBQTtBQUFBLGFBQUE7QUFDQTs7O3NDQUNBO0FBQ0EsZ0JBQUEsbUJBQUEsRUFBQTtBQUNBLGlCQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxvQkFBQSxDQUFBLE9BQUEsT0FBQSxJQUFBLE9BQUEsS0FBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLEVBQUE7QUFDQSxxQ0FBQSxJQUFBLENBQUEsT0FBQSxLQUFBO0FBQ0EsbUNBQUEsSUFBQTtBQUNBO0FBQ0EsYUFMQTtBQU1BLG1CQUFBLGdCQUFBO0FBQ0E7OztvQ0FFQTtBQUNBLG1CQUFBLGFBQUEsTUFBQSxJQUFBLENBQUE7QUFDQTs7Ozs7O3lDQUdBO0FBQ0EsZ0JBQUEsV0FBQSxLQUFBLGNBQUEsRUFBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0Esb0JBQUEsU0FBQSxLQUFBLFVBQUEsR0FBQSxDQUFBO0FBQ0EsdUJBQUEsQ0FBQSxLQUFBLGNBQUEsQ0FBQSxTQUFBLENBQUEsRUFBQSxPQUFBLEVBQUE7QUFDQTtBQUNBO0FBQ0EscUJBQUEsVUFBQSxHQUFBLE1BQUE7QUFDQSxhQU5BLE1BTUE7QUFDQSxxQkFBQSxVQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQSxtQkFBQSxLQUFBLGdCQUFBLEVBQUE7QUFDQTs7Ozs7O2dDQUdBO0FBQUE7O0FBQ0EsaUJBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxrQkFBQTs7O0FBR0Esc0JBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLEtBQUEsRUFBQSxPQUFBO0FBQ0EsdUJBQUEsS0FBQSxHQUFBLEVBQUE7O0FBRUEsdUJBQUEsT0FBQSxHQUFBLElBQUE7QUFDQSxhQVBBO0FBUUE7Ozs7Ozs7Ozs7O0FBT0EsSUFBQSxhQUFBLFNBQUEsVUFBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsUUFBQSxNQUFBLENBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxlQUFBLE9BQUEsT0FBQTtBQUNBLEtBRkEsQ0FBQTtBQUdBLENBSkE7QUM1RUEsTUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsYUFBQSxpQkFEQTtBQUVBLHFCQUFBLDRCQUZBO0FBR0Esb0JBQUE7QUFIQSxLQUFBO0FBS0EsQ0FOQTs7QUFRQSxNQUFBLFVBQUEsQ0FBQSxVQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQSxZQUFBLEVBQUEsZUFBQSxFQUFBO0FBQ0EsUUFBQSxPQUFBLGVBQUE7QUFDQSxRQUFBLGVBQUEsT0FBQSxPQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsUUFBQSxVQUFBLGNBQUEsUUFBQSxHQUFBLGFBQUEsUUFBQTtBQUNBLFFBQUEsVUFBQSxJQUFBLFFBQUEsQ0FBQSxVQUFBLGNBQUEsQ0FBQTtBQUNBLFFBQUEsYUFBQSxJQUFBLFFBQUEsQ0FBQSxVQUFBLFVBQUEsQ0FBQTtBQUNBLFFBQUEsYUFBQSxJQUFBLFFBQUEsQ0FBQSxVQUFBLG1CQUFBLENBQUE7OztBQUdBLFdBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxDQUFBLGFBQUEsUUFBQSxFQUFBLGFBQUEsSUFBQSxDQUFBOztBQUVBLFdBQUEsSUFBQSxDQUFBLElBQUEsR0FBQSxnQkFBQSxPQUFBLENBQUE7O0FBR0EsZUFBQSxFQUFBLENBQUEsT0FBQSxFQUFBLFVBQUEsZ0JBQUEsRUFBQTtBQUNBLGVBQUEsZ0JBQUEsR0FBQSxPQUFBLElBQUEsQ0FBQSxnQkFBQSxFQUFBLEdBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQTs7QUFFQSxtQkFBQSxpQkFBQSxDQUFBLENBQUE7QUFDQSxTQUhBLENBQUE7QUFJQSxLQUxBOztBQU9BLFFBQUEsUUFBQSxPQUFBLElBQUEsQ0FBQSxLQUFBOzs7QUFJQSxlQUFBLEVBQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxZQUFBLFlBQUEsSUFBQSxNQUFBLENBQUEsT0FBQSxHQUFBLENBQUE7QUFDQSxrQkFBQSxNQUFBLEdBQUEsT0FBQSxNQUFBOztBQUVBLFlBQUEsSUFBQSxPQUFBLGdCQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLE9BQUEsZ0JBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLGNBQUEsT0FBQSxnQkFBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSxrQkFBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxrQkFBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsb0JBQUEsR0FBQSxPQUFBLGdCQUFBLENBQUEsQ0FBQSxDQUFBOztBQUVBLGtCQUFBLEtBQUEsR0FBQSxPQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxFQUFBOztBQUVBLGVBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsU0FBQTtBQUNBLEtBZkE7OztBQWtCQSxXQUFBLEVBQUEsR0FBQSxPQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0EsZUFBQSxPQUFBLEdBQUEsS0FBQSxhQUFBLEdBQUE7QUFDQSxLQUZBLEVBRUEsQ0FGQSxDQUFBOzs7QUFNQSxXQUFBLFVBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsQ0FBQSxNQUFBLEdBQUEsTUFBQTtBQUNBLFlBQUEsVUFBQSxlQUFBLFVBQUEsQ0FBQTtBQUNBLFlBQUEsTUFBQSxRQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUE7QUFDQSxnQkFBQSxPQUFBLENBQUEsUUFBQSxHQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxvQkFBQSxHQUFBLENBQUEsSUFBQSxHQUFBO0FBQ0EsU0FGQTtBQUdBLEtBUEE7Ozs7QUFXQSxXQUFBLFdBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsQ0FBQSxXQUFBLENBQUEsS0FBQTtBQUNBLGVBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxNQUFBOztBQUVBLGdCQUFBLEtBQUEsQ0FBQSxTQUFBLEVBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxFQUFBLElBQUEsQ0FBQTtBQUNBLHNCQUFBLE9BQUEsTUFEQTtBQUVBLGdDQUFBLE9BQUE7QUFGQSxTQUFBO0FBSUEsS0FSQTs7Ozs7QUFhQSxRQUFBLFVBQUEsSUFBQSxRQUFBLENBQUEsVUFBQSxRQUFBLENBQUE7QUFDQSxZQUFBLEVBQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxhQUFBLEVBQUEsWUFBQSxFQUFBOztBQUVBLGdCQUFBLEdBQUEsQ0FBQSx3QkFBQSxFQUFBLGFBQUE7O0FBRUEsWUFBQSxjQUFBLElBQUEsS0FBQSxZQUFBLEVBQUE7QUFDQSxtQkFBQSxJQUFBLENBQUEsSUFBQSxHQUFBLGNBQUEsVUFBQTtBQUNBLFNBRkEsTUFFQTtBQUNBLG1CQUFBLFNBQUEsQ0FBQSxjQUFBLElBQUE7QUFDQTtBQUNBLEtBVEE7Ozs7Ozs7Ozs7QUFtQkEsV0FBQSxhQUFBLEdBQUEsT0FBQSxJQUFBLENBQUEsZ0JBQUEsRUFBQTs7O0FBR0EsV0FBQSxjQUFBLEdBQUEsT0FBQSxJQUFBLENBQUEsVUFBQSxFQUFBOzs7QUFHQSxXQUFBLE1BQUE7QUFDQSxRQUFBLHdCQUFBLEVBQUE7O0FBR0EsV0FBQSxLQUFBLEdBQUEsWUFBQTs7QUFFQSxLQUZBOztBQUlBLFdBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxlQUFBLEVBQUEsS0FBQSxPQUFBLGFBQUE7QUFDQSxLQUZBOzs7QUFLQSxXQUFBLFlBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsUUFBQTtBQUNBLFlBQUEsS0FBQSxRQUFBLEtBQUEsQ0FBQSxFQUFBLEtBQUEsUUFBQSxHQUFBLENBQUE7QUFDQSxLQUhBOztBQUtBLFdBQUEsYUFBQSxHQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsYUFBQSxRQUFBO0FBQ0EsWUFBQSxLQUFBLFFBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxLQUFBLFFBQUEsR0FBQSxDQUFBO0FBQ0EsS0FIQTs7OztBQU9BLFdBQUEsU0FBQSxHQUFBLFVBQUEsSUFBQSxFQUFBOztBQUVBLFlBQUEsS0FBQSxRQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxHQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQTtBQUNBLHVCQUFBLGFBQUEsQ0FBQTtBQUNBLGFBRkEsQ0FBQTtBQUdBLGlCQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxTQU5BLE1BTUEsSUFBQSxLQUFBLFFBQUEsR0FBQSxDQUFBLEVBQUE7QUFDQSxpQkFBQSxLQUFBLEdBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsVUFBQSxFQUFBO0FBQ0EsdUJBQUEsYUFBQSxDQUFBO0FBQ0EsYUFGQSxDQUFBO0FBR0EsaUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxpQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLEtBQUEsRUFBQTtBQUNBOztBQUVBLGVBQUEsRUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBO0FBQ0EsZ0JBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxJQUFBLENBQUE7QUFDQSxvQkFBQSxXQURBO0FBRUEsb0JBQUE7QUFGQSxTQUFBOztBQUtBLGVBQUEsSUFBQSxDQUFBLGNBQUE7O0FBRUEsWUFBQSxPQUFBLElBQUEsQ0FBQSxTQUFBLEVBQUEsRUFBQTs7QUFFQSxtQkFBQSxNQUFBLEdBQUEsT0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLG1CQUFBLFFBQUEsR0FBQSxJQUFBO0FBQ0EsU0FKQSxNQUlBOztBQUVBLGdCQUFBLE9BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxNQUFBLEVBQUE7QUFDQSx1QkFBQSxNQUFBLEdBQUEsT0FBQSxFQUFBO0FBQ0EsYUFGQSxNQUVBLElBQUEsT0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsS0FBQSxDQUFBLElBQUEsT0FBQSxNQUFBLEVBQUE7QUFDQSxzQ0FBQSxJQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsYUFGQSxNQUVBOztBQUVBLHVCQUFBLEVBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBOztBQUVBLG9CQUFBLE9BQUEsSUFBQSxDQUFBLFdBQUEsR0FBQSxNQUFBLEVBQUE7O0FBRUEsMkJBQUEsSUFBQSxDQUFBLFdBQUEsR0FBQSxPQUFBLENBQUEsVUFBQSxlQUFBLEVBQUE7QUFDQSx3Q0FBQSxPQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxtQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBO0FBQ0EseUJBRkE7QUFHQSxxQkFKQTtBQUtBLDJCQUFBLElBQUEsQ0FBQSxJQUFBLEdBQUEsT0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsRUFBQTs7QUFFQSw0QkFBQSxLQUFBLENBQUEsT0FBQSxFQUFBLElBQUEsQ0FBQTtBQUNBLGdDQUFBLFlBREE7QUFFQSxzQ0FBQSxPQUFBLElBQUEsQ0FBQTtBQUZBLHFCQUFBO0FBSUEsd0JBQUEsT0FBQSxNQUFBLEVBQUE7QUFDQSwrQkFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLCtCQUFBLE1BQUEsR0FBQSxJQUFBOztBQUVBLCtCQUFBLE9BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLElBQUEsT0FBQSxxQkFBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLG1DQUFBLHFCQUFBLENBQUEsS0FBQSxHQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLDRCQUFBLE9BQUEscUJBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxtQ0FBQSxNQUFBLEdBQUEsT0FBQSxxQkFBQSxDQUFBLEtBQUEsRUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0EsbUJBQUEsSUFBQSxDQUFBLGNBQUE7QUFDQTtBQUNBLEtBbkVBOzs7QUFzRUEsV0FBQSxTQUFBOzs7QUFHQSxXQUFBLEtBQUEsR0FBQSxPQUFBLElBQUEsQ0FBQSxLQUFBOztBQUdBLFdBQUEsUUFBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBLEVBSUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FKQSxFQUtBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQU5BLEVBT0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FQQSxFQVFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUkEsRUFTQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVRBLEVBVUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FWQSxFQVdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWEEsRUFZQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVpBLENBQUE7QUFjQSxXQUFBLFNBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBLEVBR0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQSxFQUlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSkEsRUFLQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUxBLEVBTUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FOQSxFQU9BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUEEsRUFRQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVJBLEVBU0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FUQSxFQVVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVkEsRUFXQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVhBLEVBWUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FaQSxDQUFBO0FBY0EsV0FBQSxXQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQURBLEVBRUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQSxFQUdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEEsRUFJQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUpBLEVBS0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FMQSxFQU1BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTkEsRUFPQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVBBLEVBUUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FSQSxFQVNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVEEsRUFVQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVZBLEVBV0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FYQSxFQVlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWkEsQ0FBQTtBQWNBLFdBQUEsVUFBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBLEVBSUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FKQSxFQUtBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQU5BLEVBT0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FQQSxFQVFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUkEsRUFTQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVRBLEVBVUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FWQSxFQVdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWEEsRUFZQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVpBLENBQUE7QUFlQSxDQWpRQTs7QUNSQSxNQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxhQUFBLFdBREE7QUFFQSxxQkFBQSxvQ0FGQTtBQUdBLG9CQUFBO0FBSEEsS0FBQTtBQUtBLENBTkE7O0FBUUEsTUFBQSxVQUFBLENBQUEsY0FBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxjQUFBLEVBQUEsZUFBQSxFQUFBO0FBQ0EsUUFBQSxNQUFBLFNBQUEsUUFBQSxHQUFBLEdBQUEsRUFBQTtBQUNBLFFBQUEsTUFBQSxnQkFBQSxHQUFBLENBQUE7O0FBRUEsV0FBQSxJQUFBLEdBQUEsSUFBQTs7QUFFQSxXQUFBLFVBQUEsR0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLFlBQUEsY0FBQSxJQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsS0FBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLHVCQUFBLFdBQUEsRUFBQSxJQUFBLENBQUE7QUFDQSx3QkFBQTtBQURBLFNBQUE7O0FBSUEsWUFBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsUUFBQSxLQUFBLEtBQUE7QUFDQSxnQkFBQSxPQUFBLElBQUEsSUFBQSxDQUFBLEtBQUEsRUFBQSxPQUFBLEdBQUEsS0FBQTtBQUNBLGdCQUFBLGlCQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxLQUFBLENBQUEsUUFBQSxFQUFBLEtBQUEsQ0FBQSxhQUFBLENBQUE7QUFDQSwyQkFBQSxjQUFBLEVBQUEsSUFBQSxDQUFBLElBQUE7QUFDQSxTQUxBOztBQVFBLFlBQUEsb0JBQUEsSUFBQSxLQUFBLENBQUEsT0FBQSxFQUFBLEtBQUEsQ0FBQSxRQUFBLEVBQUEsS0FBQSxDQUFBLGtCQUFBLENBQUE7QUFDQSx1QkFBQSxpQkFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsUUFBQSxFQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxRQUFBLENBQUE7O0FBRUEsZUFBQSxFQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0Esd0JBQUE7QUFEQSxTQUFBO0FBR0EsS0FwQkE7O0FBc0JBLFdBQUEsWUFBQSxHQUFBLFlBQUE7QUFDQSxlQUFBLEVBQUEsQ0FBQSxVQUFBO0FBQ0EsS0FGQTtBQUdBLENBL0JBOztBQ1JBLE1BQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLGFBQUEsUUFEQTtBQUVBLHFCQUFBLDhCQUZBO0FBR0Esb0JBQUE7QUFIQSxLQUFBO0FBS0EsQ0FOQTs7QUFRQSxNQUFBLFVBQUEsQ0FBQSxXQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLGFBQUEsRUFBQTtBQUNBLFFBQUEsT0FBQSxlQUFBOztBQUVBLFdBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxhQUFBLGdCQUFBLENBQUEsUUFBQSxFQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLG9CQUFBLEdBQUEsQ0FBQSxlQUFBLEVBQUEsUUFBQTtBQUNBLFNBRkEsRUFFQSxLQUZBLENBRUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxvQkFBQSxLQUFBLENBQUEsd0JBQUEsRUFBQSxLQUFBO0FBQ0EsU0FKQTs7QUFNQSxlQUFBLEVBQUEsQ0FBQSxVQUFBO0FBQ0EsS0FSQTtBQVVBLENBYkE7O0FDUkE7O0FBRUEsU0FBQSxNQUFBLENBQUEsR0FBQSxFQUFBOztBQUVBLFNBQUEsR0FBQSxHQUFBLEdBQUE7O0FBRUEsU0FBQSxNQUFBLEdBQUEsSUFBQTs7O0FBR0EsU0FBQSxLQUFBLEdBQUEsSUFBQTs7OztBQUlBLFNBQUEsU0FBQSxHQUFBLElBQUE7OztBQUdBLFNBQUEsb0JBQUEsR0FBQSxJQUFBOzs7QUFHQSxTQUFBLEtBQUEsR0FBQSxFQUFBOzs7QUFHQSxTQUFBLE9BQUEsR0FBQSxJQUFBO0FBQ0E7O0FBRUEsT0FBQSxTQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQTs7QUFFQSxRQUFBLElBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLElBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLGNBQUEsTUFBQSxDQUFBLENBQUE7O0FBRUEsU0FBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxTQUFBLEtBQUEsQ0FBQSxTQUFBLEdBQUEsSUFBQTs7O0FBR0EsU0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBOzs7QUFHQSxTQUFBLG9CQUFBLEdBQUEsS0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBLENBZEE7O0FBZ0JBLE9BQUEsU0FBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUE7QUFDQSxRQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsRUFBQTtBQUNBLGVBQUEsTUFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLENBQUE7QUFDQSxLQUZBLE1BRUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLEVBQUE7QUFDQSxlQUFBLE1BQUEsU0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsS0FGQSxNQUVBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxFQUFBO0FBQ0EsZUFBQSxNQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtBQUNBLEtBRkEsTUFFQTtBQUNBLGVBQUEsTUFBQSxTQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLENBVkE7O0FBWUEsT0FBQSxTQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsUUFBQSxRQUFBLEtBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7O0FBRUEsU0FBQSxTQUFBLENBQUEsT0FBQSxHQUFBLEtBQUEsUUFBQTs7QUFFQSxTQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxLQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLENBVEE7O0FBV0EsT0FBQSxTQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsT0FBQSxFQUFBOzs7O0FBSUEsUUFBQSxZQUFBLFFBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGVBQUEsQ0FBQSxTQUFBLFNBQUE7QUFDQSxLQUZBLEVBRUEsQ0FGQSxDQUFBOztBQUlBLFdBQUEsU0FBQTtBQUNBLENBVEE7O0FBV0EsT0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLFVBQUEsS0FBQSxNQUFBLENBQUEsS0FBQSxLQUFBLENBQUE7QUFDQSxXQUFBLE9BQUEsRUFBQTtBQUNBLGFBQUEsS0FBQSxDQUFBLFNBQUEsR0FBQSxJQUFBO0FBQ0EsYUFBQSxLQUFBLEdBQUEsS0FBQSxNQUFBLENBQUEsS0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLFdBQUEsS0FBQSxTQUFBO0FBQ0EsWUFBQSxXQUFBLFNBQUEsUUFBQSxDQUFBO0FBQ0EsYUFBQSxTQUFBLEdBQUEsUUFBQTs7QUFFQSxhQUFBLFVBQUE7QUFDQSxrQkFBQSxLQUFBLE1BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBO0FBQ0EsQ0FaQTs7QUFjQSxPQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsZUFBQSxLQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsZUFBQSxTQUFBLFNBQUE7QUFDQSxLQUZBLENBQUE7O0FBSUEsUUFBQSxLQUFBLEtBQUEsQ0FBQSxJQUFBLElBQUEsYUFBQSxNQUFBLEtBQUEsQ0FBQSxFQUFBLEtBQUEsR0FBQTtBQUNBLENBTkE7O0FBUUEsT0FBQSxTQUFBLENBQUEsR0FBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLE9BQUEsR0FBQSxLQUFBOztBQUVBLENBSEEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciB0c3VybyA9IGFuZ3VsYXIubW9kdWxlKCdUc3VybycsIFsndWkucm91dGVyJywgJ2ZpcmViYXNlJ10pO1xuXG50c3Vyby5jb25maWcoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjb25maWcgPSB7XG4gICAgICAgIGFwaUtleTogXCJBSXphU3lDTG0zamtrNXBwTXFlUXhLb0gtZFo5Q2RZTWFER1dXcVVcIixcbiAgICAgICAgYXV0aERvbWFpbjogXCJ0aGUtcGF0aHMtb2YtZHJhZ29ucy5maXJlYmFzZWFwcC5jb21cIixcbiAgICAgICAgZGF0YWJhc2VVUkw6IFwiaHR0cHM6Ly90aGUtcGF0aHMtb2YtZHJhZ29ucy5maXJlYmFzZWlvLmNvbVwiLFxuICAgICAgICBzdG9yYWdlQnVja2V0OiBcInRoZS1wYXRocy1vZi1kcmFnb25zLmFwcHNwb3QuY29tXCIsXG4gICAgfTtcbiAgICBmaXJlYmFzZS5pbml0aWFsaXplQXBwKGNvbmZpZyk7XG59KTtcblxudHN1cm8uY29uc3RhbnQoJ2ZpcmViYXNlVXJsJywgJ2h0dHBzOi8vcGF0aC1vZi10aGUtZHJhZ29uLmZpcmViYXNlaW8uY29tLycpO1xuXG50c3Vyby5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vTW9zdGFmYS1TYW1pci9UaWMtVGFjLVRvZS1BSS9ibG9iL21hc3Rlci9zY3JpcHRzL2FpLmpzXG5cbi8qXG4gKiBDb25zdHJ1Y3RzIGFuIGFjdGlvbiB0aGF0IHRoZSBhaSBwbGF5ZXIgY291bGQgbWFrZVxuICogQHBhcmFtIHBvcyBbTnVtYmVyXTogdGhlIGNlbGwgcG9zaXRpb24gdGhlIGFpIHdvdWxkIG1ha2UgaXRzIGFjdGlvbiBpblxuICogbWFkZSB0aGF0IGFjdGlvblxuICovXG52YXIgQUlBY3Rpb24gPSBmdW5jdGlvbihwb3MpIHtcblxuICAgIC8vIHB1YmxpYyA6IHRoZSBwb3NpdGlvbiBvbiB0aGUgYm9hcmQgdGhhdCB0aGUgYWN0aW9uIHdvdWxkIHB1dCB0aGUgbGV0dGVyIG9uXG4gICAgdGhpcy5tb3ZlUG9zaXRpb24gPSBwb3M7XG5cbiAgICAvL3B1YmxpYyA6IHRoZSBtaW5pbWF4IHZhbHVlIG9mIHRoZSBzdGF0ZSB0aGF0IHRoZSBhY3Rpb24gbGVhZHMgdG8gd2hlbiBhcHBsaWVkXG4gICAgdGhpcy5taW5pbWF4VmFsID0gMDtcblxuICAgIC8qXG4gICAgICogcHVibGljIDogYXBwbGllcyB0aGUgYWN0aW9uIHRvIGEgc3RhdGUgdG8gZ2V0IHRoZSBuZXh0IHN0YXRlXG4gICAgICogQHBhcmFtIHN0YXRlIFtTdGF0ZV06IHRoZSBzdGF0ZSB0byBhcHBseSB0aGUgYWN0aW9uIHRvXG4gICAgICogQHJldHVybiBbU3RhdGVdOiB0aGUgbmV4dCBzdGF0ZVxuICAgICAqL1xuICAgIHRoaXMuYXBwbHlUbyA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgICAgIHZhciBuZXh0ID0gbmV3IFN0YXRlKHN0YXRlKTtcblxuICAgICAgICAvL3B1dCB0aGUgbGV0dGVyIG9uIHRoZSBib2FyZFxuICAgICAgICBuZXh0LmJvYXJkW3RoaXMubW92ZVBvc2l0aW9uXSA9IHN0YXRlLnR1cm47XG5cbiAgICAgICAgaWYoc3RhdGUudHVybiA9PT0gXCJPXCIpXG4gICAgICAgICAgICBuZXh0Lm9Nb3Zlc0NvdW50Kys7XG5cbiAgICAgICAgbmV4dC5hZHZhbmNlVHVybigpO1xuXG4gICAgICAgIHJldHVybiBuZXh0O1xuICAgIH1cbn07XG5cbi8qXG4gKiBwdWJsaWMgc3RhdGljIGZ1bmN0aW9uIHRoYXQgZGVmaW5lcyBhIHJ1bGUgZm9yIHNvcnRpbmcgQUlBY3Rpb25zIGluIGFzY2VuZGluZyBtYW5uZXJcbiAqIEBwYXJhbSBmaXJzdEFjdGlvbiBbQUlBY3Rpb25dIDogdGhlIGZpcnN0IGFjdGlvbiBpbiBhIHBhaXJ3aXNlIHNvcnRcbiAqIEBwYXJhbSBzZWNvbmRBY3Rpb24gW0FJQWN0aW9uXTogdGhlIHNlY29uZCBhY3Rpb24gaW4gYSBwYWlyd2lzZSBzb3J0XG4gKiBAcmV0dXJuIFtOdW1iZXJdOiAtMSwgMSwgb3IgMFxuICovXG5BSUFjdGlvbi5BU0NFTkRJTkcgPSBmdW5jdGlvbihmaXJzdEFjdGlvbiwgc2Vjb25kQWN0aW9uKSB7XG4gICAgaWYoZmlyc3RBY3Rpb24ubWluaW1heFZhbCA8IHNlY29uZEFjdGlvbi5taW5pbWF4VmFsKVxuICAgICAgICByZXR1cm4gLTE7IC8vaW5kaWNhdGVzIHRoYXQgZmlyc3RBY3Rpb24gZ29lcyBiZWZvcmUgc2Vjb25kQWN0aW9uXG4gICAgZWxzZSBpZihmaXJzdEFjdGlvbi5taW5pbWF4VmFsID4gc2Vjb25kQWN0aW9uLm1pbmltYXhWYWwpXG4gICAgICAgIHJldHVybiAxOyAvL2luZGljYXRlcyB0aGF0IHNlY29uZEFjdGlvbiBnb2VzIGJlZm9yZSBmaXJzdEFjdGlvblxuICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIDA7IC8vaW5kaWNhdGVzIGEgdGllXG59XG5cbi8qXG4gKiBwdWJsaWMgc3RhdGljIGZ1bmN0aW9uIHRoYXQgZGVmaW5lcyBhIHJ1bGUgZm9yIHNvcnRpbmcgQUlBY3Rpb25zIGluIGRlc2NlbmRpbmcgbWFubmVyXG4gKiBAcGFyYW0gZmlyc3RBY3Rpb24gW0FJQWN0aW9uXSA6IHRoZSBmaXJzdCBhY3Rpb24gaW4gYSBwYWlyd2lzZSBzb3J0XG4gKiBAcGFyYW0gc2Vjb25kQWN0aW9uIFtBSUFjdGlvbl06IHRoZSBzZWNvbmQgYWN0aW9uIGluIGEgcGFpcndpc2Ugc29ydFxuICogQHJldHVybiBbTnVtYmVyXTogLTEsIDEsIG9yIDBcbiAqL1xuQUlBY3Rpb24uREVTQ0VORElORyA9IGZ1bmN0aW9uKGZpcnN0QWN0aW9uLCBzZWNvbmRBY3Rpb24pIHtcbiAgICBpZihmaXJzdEFjdGlvbi5taW5pbWF4VmFsID4gc2Vjb25kQWN0aW9uLm1pbmltYXhWYWwpXG4gICAgICAgIHJldHVybiAtMTsgLy9pbmRpY2F0ZXMgdGhhdCBmaXJzdEFjdGlvbiBnb2VzIGJlZm9yZSBzZWNvbmRBY3Rpb25cbiAgICBlbHNlIGlmKGZpcnN0QWN0aW9uLm1pbmltYXhWYWwgPCBzZWNvbmRBY3Rpb24ubWluaW1heFZhbClcbiAgICAgICAgcmV0dXJuIDE7IC8vaW5kaWNhdGVzIHRoYXQgc2Vjb25kQWN0aW9uIGdvZXMgYmVmb3JlIGZpcnN0QWN0aW9uXG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gMDsgLy9pbmRpY2F0ZXMgYSB0aWVcbn1cblxuXG4vKlxuICogQ29uc3RydWN0cyBhbiBBSSBwbGF5ZXIgd2l0aCBhIHNwZWNpZmljIGxldmVsIG9mIGludGVsbGlnZW5jZVxuICogQHBhcmFtIGxldmVsIFtTdHJpbmddOiB0aGUgZGVzaXJlZCBsZXZlbCBvZiBpbnRlbGxpZ2VuY2VcbiAqL1xudmFyIEFJID0gZnVuY3Rpb24obGV2ZWwpIHtcblxuICAgIC8vcHJpdmF0ZSBhdHRyaWJ1dGU6IGxldmVsIG9mIGludGVsbGlnZW5jZSB0aGUgcGxheWVyIGhhc1xuICAgIHZhciBsZXZlbE9mSW50ZWxsaWdlbmNlID0gbGV2ZWw7XG5cbiAgICAvL3ByaXZhdGUgYXR0cmlidXRlOiB0aGUgZ2FtZSB0aGUgcGxheWVyIGlzIHBsYXlpbmdcbiAgICB2YXIgZ2FtZSA9IHt9O1xuXG4gICAgLypcbiAgICAgKiBwcml2YXRlIHJlY3Vyc2l2ZSBmdW5jdGlvbiB0aGF0IGNvbXB1dGVzIHRoZSBtaW5pbWF4IHZhbHVlIG9mIGEgZ2FtZSBzdGF0ZVxuICAgICAqIEBwYXJhbSBzdGF0ZSBbU3RhdGVdIDogdGhlIHN0YXRlIHRvIGNhbGN1bGF0ZSBpdHMgbWluaW1heCB2YWx1ZVxuICAgICAqIEByZXR1cm5zIFtOdW1iZXJdOiB0aGUgbWluaW1heCB2YWx1ZSBvZiB0aGUgc3RhdGVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBtaW5pbWF4VmFsdWUoc3RhdGUpIHtcbiAgICAgICAgaWYoc3RhdGUuaXNUZXJtaW5hbCgpKSB7XG4gICAgICAgICAgICAvL2EgdGVybWluYWwgZ2FtZSBzdGF0ZSBpcyB0aGUgYmFzZSBjYXNlXG4gICAgICAgICAgICByZXR1cm4gR2FtZS5zY29yZShzdGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgc3RhdGVTY29yZTsgLy8gdGhpcyBzdG9yZXMgdGhlIG1pbmltYXggdmFsdWUgd2UnbGwgY29tcHV0ZVxuXG4gICAgICAgICAgICBpZihzdGF0ZS50dXJuID09PSBcIlhcIilcbiAgICAgICAgICAgIC8vIFggd2FudHMgdG8gbWF4aW1pemUgLS0+IGluaXRpYWxpemUgdG8gYSB2YWx1ZSBzbWFsbGVyIHRoYW4gYW55IHBvc3NpYmxlIHNjb3JlXG4gICAgICAgICAgICAgICAgc3RhdGVTY29yZSA9IC0xMDAwO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgLy8gTyB3YW50cyB0byBtaW5pbWl6ZSAtLT4gaW5pdGlhbGl6ZSB0byBhIHZhbHVlIGxhcmdlciB0aGFuIGFueSBwb3NzaWJsZSBzY29yZVxuICAgICAgICAgICAgICAgIHN0YXRlU2NvcmUgPSAxMDAwO1xuXG4gICAgICAgICAgICB2YXIgYXZhaWxhYmxlUG9zaXRpb25zID0gc3RhdGUuZW1wdHlDZWxscygpO1xuXG4gICAgICAgICAgICAvL2VudW1lcmF0ZSBuZXh0IGF2YWlsYWJsZSBzdGF0ZXMgdXNpbmcgdGhlIGluZm8gZm9ybSBhdmFpbGFibGUgcG9zaXRpb25zXG4gICAgICAgICAgICB2YXIgYXZhaWxhYmxlTmV4dFN0YXRlcyA9IGF2YWlsYWJsZVBvc2l0aW9ucy5tYXAoZnVuY3Rpb24ocG9zKSB7XG4gICAgICAgICAgICAgICAgdmFyIGFjdGlvbiA9IG5ldyBBSUFjdGlvbihwb3MpO1xuXG4gICAgICAgICAgICAgICAgdmFyIG5leHRTdGF0ZSA9IGFjdGlvbi5hcHBseVRvKHN0YXRlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBuZXh0U3RhdGU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLyogY2FsY3VsYXRlIHRoZSBtaW5pbWF4IHZhbHVlIGZvciBhbGwgYXZhaWxhYmxlIG5leHQgc3RhdGVzXG4gICAgICAgICAgICAgKiBhbmQgZXZhbHVhdGUgdGhlIGN1cnJlbnQgc3RhdGUncyB2YWx1ZSAqL1xuICAgICAgICAgICAgYXZhaWxhYmxlTmV4dFN0YXRlcy5mb3JFYWNoKGZ1bmN0aW9uKG5leHRTdGF0ZSkge1xuICAgICAgICAgICAgICAgIHZhciBuZXh0U2NvcmUgPSBtaW5pbWF4VmFsdWUobmV4dFN0YXRlKTtcbiAgICAgICAgICAgICAgICBpZihzdGF0ZS50dXJuID09PSBcIlhcIikge1xuICAgICAgICAgICAgICAgICAgICAvLyBYIHdhbnRzIHRvIG1heGltaXplIC0tPiB1cGRhdGUgc3RhdGVTY29yZSBpZmYgbmV4dFNjb3JlIGlzIGxhcmdlclxuICAgICAgICAgICAgICAgICAgICBpZihuZXh0U2NvcmUgPiBzdGF0ZVNjb3JlKVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVTY29yZSA9IG5leHRTY29yZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE8gd2FudHMgdG8gbWluaW1pemUgLS0+IHVwZGF0ZSBzdGF0ZVNjb3JlIGlmZiBuZXh0U2NvcmUgaXMgc21hbGxlclxuICAgICAgICAgICAgICAgICAgICBpZihuZXh0U2NvcmUgPCBzdGF0ZVNjb3JlKVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVTY29yZSA9IG5leHRTY29yZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlU2NvcmU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKlxuICAgICAqIHByaXZhdGUgZnVuY3Rpb246IG1ha2UgdGhlIGFpIHBsYXllciB0YWtlIGEgYmxpbmQgbW92ZVxuICAgICAqIHRoYXQgaXM6IGNob29zZSB0aGUgY2VsbCB0byBwbGFjZSBpdHMgc3ltYm9sIHJhbmRvbWx5XG4gICAgICogQHBhcmFtIHR1cm4gW1N0cmluZ106IHRoZSBwbGF5ZXIgdG8gcGxheSwgZWl0aGVyIFggb3IgT1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRha2VBQmxpbmRNb3ZlKHR1cm4pIHtcbiAgICAgICAgdmFyIGF2YWlsYWJsZSA9IGdhbWUuY3VycmVudFN0YXRlLmVtcHR5Q2VsbHMoKTtcbiAgICAgICAgdmFyIHJhbmRvbUNlbGwgPSBhdmFpbGFibGVbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYXZhaWxhYmxlLmxlbmd0aCldO1xuICAgICAgICB2YXIgYWN0aW9uID0gbmV3IEFJQWN0aW9uKHJhbmRvbUNlbGwpO1xuXG4gICAgICAgIHZhciBuZXh0ID0gYWN0aW9uLmFwcGx5VG8oZ2FtZS5jdXJyZW50U3RhdGUpO1xuXG4gICAgICAgIHVpLmluc2VydEF0KHJhbmRvbUNlbGwsIHR1cm4pO1xuXG4gICAgICAgIGdhbWUuYWR2YW5jZVRvKG5leHQpO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogcHJpdmF0ZSBmdW5jdGlvbjogbWFrZSB0aGUgYWkgcGxheWVyIHRha2UgYSBub3ZpY2UgbW92ZSxcbiAgICAgKiB0aGF0IGlzOiBtaXggYmV0d2VlbiBjaG9vc2luZyB0aGUgb3B0aW1hbCBhbmQgc3Vib3B0aW1hbCBtaW5pbWF4IGRlY2lzaW9uc1xuICAgICAqIEBwYXJhbSB0dXJuIFtTdHJpbmddOiB0aGUgcGxheWVyIHRvIHBsYXksIGVpdGhlciBYIG9yIE9cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0YWtlQU5vdmljZU1vdmUodHVybikge1xuICAgICAgICB2YXIgYXZhaWxhYmxlID0gZ2FtZS5jdXJyZW50U3RhdGUuZW1wdHlDZWxscygpO1xuXG4gICAgICAgIC8vZW51bWVyYXRlIGFuZCBjYWxjdWxhdGUgdGhlIHNjb3JlIGZvciBlYWNoIGF2YWlsYWJsZSBhY3Rpb25zIHRvIHRoZSBhaSBwbGF5ZXJcbiAgICAgICAgdmFyIGF2YWlsYWJsZUFjdGlvbnMgPSBhdmFpbGFibGUubWFwKGZ1bmN0aW9uKHBvcykge1xuICAgICAgICAgICAgdmFyIGFjdGlvbiA9ICBuZXcgQUlBY3Rpb24ocG9zKTsgLy9jcmVhdGUgdGhlIGFjdGlvbiBvYmplY3RcbiAgICAgICAgICAgIHZhciBuZXh0U3RhdGUgPSBhY3Rpb24uYXBwbHlUbyhnYW1lLmN1cnJlbnRTdGF0ZSk7IC8vZ2V0IG5leHQgc3RhdGUgYnkgYXBwbHlpbmcgdGhlIGFjdGlvblxuXG4gICAgICAgICAgICBhY3Rpb24ubWluaW1heFZhbCA9IG1pbmltYXhWYWx1ZShuZXh0U3RhdGUpOyAvL2NhbGN1bGF0ZSBhbmQgc2V0IHRoZSBhY3Rpb24ncyBtaW5pbWF4IHZhbHVlXG5cbiAgICAgICAgICAgIHJldHVybiBhY3Rpb247XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vc29ydCB0aGUgZW51bWVyYXRlZCBhY3Rpb25zIGxpc3QgYnkgc2NvcmVcbiAgICAgICAgaWYodHVybiA9PT0gXCJYXCIpXG4gICAgICAgIC8vWCBtYXhpbWl6ZXMgLS0+IHNvcnQgdGhlIGFjdGlvbnMgaW4gYSBkZXNjZW5kaW5nIG1hbm5lciB0byBoYXZlIHRoZSBhY3Rpb24gd2l0aCBtYXhpbXVtIG1pbmltYXggYXQgZmlyc3RcbiAgICAgICAgICAgIGF2YWlsYWJsZUFjdGlvbnMuc29ydChBSUFjdGlvbi5ERVNDRU5ESU5HKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAvL08gbWluaW1pemVzIC0tPiBzb3J0IHRoZSBhY3Rpb25zIGluIGFuIGFzY2VuZGluZyBtYW5uZXIgdG8gaGF2ZSB0aGUgYWN0aW9uIHdpdGggbWluaW11bSBtaW5pbWF4IGF0IGZpcnN0XG4gICAgICAgICAgICBhdmFpbGFibGVBY3Rpb25zLnNvcnQoQUlBY3Rpb24uQVNDRU5ESU5HKTtcblxuICAgICAgICAvKlxuICAgICAgICAgKiB0YWtlIHRoZSBvcHRpbWFsIGFjdGlvbiA0MCUgb2YgdGhlIHRpbWUsIGFuZCB0YWtlIHRoZSAxc3Qgc3Vib3B0aW1hbCBhY3Rpb24gNjAlIG9mIHRoZSB0aW1lXG4gICAgICAgICAqL1xuICAgICAgICB2YXIgY2hvc2VuQWN0aW9uO1xuICAgICAgICBpZihNYXRoLnJhbmRvbSgpKjEwMCA8PSA0MCkge1xuICAgICAgICAgICAgY2hvc2VuQWN0aW9uID0gYXZhaWxhYmxlQWN0aW9uc1swXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmKGF2YWlsYWJsZUFjdGlvbnMubGVuZ3RoID49IDIpIHtcbiAgICAgICAgICAgICAgICAvL2lmIHRoZXJlIGlzIHR3byBvciBtb3JlIGF2YWlsYWJsZSBhY3Rpb25zLCBjaG9vc2UgdGhlIDFzdCBzdWJvcHRpbWFsXG4gICAgICAgICAgICAgICAgY2hvc2VuQWN0aW9uID0gYXZhaWxhYmxlQWN0aW9uc1sxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vY2hvb3NlIHRoZSBvbmx5IGF2YWlsYWJsZSBhY3Rpb25zXG4gICAgICAgICAgICAgICAgY2hvc2VuQWN0aW9uID0gYXZhaWxhYmxlQWN0aW9uc1swXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgbmV4dCA9IGNob3NlbkFjdGlvbi5hcHBseVRvKGdhbWUuY3VycmVudFN0YXRlKTtcblxuICAgICAgICB1aS5pbnNlcnRBdChjaG9zZW5BY3Rpb24ubW92ZVBvc2l0aW9uLCB0dXJuKTtcblxuICAgICAgICBnYW1lLmFkdmFuY2VUbyhuZXh0KTtcbiAgICB9O1xuXG4gICAgLypcbiAgICAgKiBwcml2YXRlIGZ1bmN0aW9uOiBtYWtlIHRoZSBhaSBwbGF5ZXIgdGFrZSBhIG1hc3RlciBtb3ZlLFxuICAgICAqIHRoYXQgaXM6IGNob29zZSB0aGUgb3B0aW1hbCBtaW5pbWF4IGRlY2lzaW9uXG4gICAgICogQHBhcmFtIHR1cm4gW1N0cmluZ106IHRoZSBwbGF5ZXIgdG8gcGxheSwgZWl0aGVyIFggb3IgT1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRha2VBTWFzdGVyTW92ZSh0dXJuKSB7XG4gICAgICAgIHZhciBhdmFpbGFibGUgPSBnYW1lLmN1cnJlbnRTdGF0ZS5lbXB0eUNlbGxzKCk7XG5cbiAgICAgICAgLy9lbnVtZXJhdGUgYW5kIGNhbGN1bGF0ZSB0aGUgc2NvcmUgZm9yIGVhY2ggYXZhaWFsYWJsZSBhY3Rpb25zIHRvIHRoZSBhaSBwbGF5ZXJcbiAgICAgICAgdmFyIGF2YWlsYWJsZUFjdGlvbnMgPSBhdmFpbGFibGUubWFwKGZ1bmN0aW9uKHBvcykge1xuICAgICAgICAgICAgdmFyIGFjdGlvbiA9ICBuZXcgQUlBY3Rpb24ocG9zKTsgLy9jcmVhdGUgdGhlIGFjdGlvbiBvYmplY3RcbiAgICAgICAgICAgIHZhciBuZXh0ID0gYWN0aW9uLmFwcGx5VG8oZ2FtZS5jdXJyZW50U3RhdGUpOyAvL2dldCBuZXh0IHN0YXRlIGJ5IGFwcGx5aW5nIHRoZSBhY3Rpb25cblxuICAgICAgICAgICAgYWN0aW9uLm1pbmltYXhWYWwgPSBtaW5pbWF4VmFsdWUobmV4dCk7IC8vY2FsY3VsYXRlIGFuZCBzZXQgdGhlIGFjdGlvbidzIG1pbm1heCB2YWx1ZVxuXG4gICAgICAgICAgICByZXR1cm4gYWN0aW9uO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL3NvcnQgdGhlIGVudW1lcmF0ZWQgYWN0aW9ucyBsaXN0IGJ5IHNjb3JlXG4gICAgICAgIGlmKHR1cm4gPT09IFwiWFwiKVxuICAgICAgICAvL1ggbWF4aW1pemVzIC0tPiBzb3J0IHRoZSBhY3Rpb25zIGluIGEgZGVzY2VuZGluZyBtYW5uZXIgdG8gaGF2ZSB0aGUgYWN0aW9uIHdpdGggbWF4aW11bSBtaW5pbWF4IGF0IGZpcnN0XG4gICAgICAgICAgICBhdmFpbGFibGVBY3Rpb25zLnNvcnQoQUlBY3Rpb24uREVTQ0VORElORyk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgLy9PIG1pbmltaXplcyAtLT4gc29ydCB0aGUgYWN0aW9ucyBpbiBhbiBhc2NlbmRpbmcgbWFubmVyIHRvIGhhdmUgdGhlIGFjdGlvbiB3aXRoIG1pbmltdW0gbWluaW1heCBhdCBmaXJzdFxuICAgICAgICAgICAgYXZhaWxhYmxlQWN0aW9ucy5zb3J0KEFJQWN0aW9uLkFTQ0VORElORyk7XG5cblxuICAgICAgICAvL3Rha2UgdGhlIGZpcnN0IGFjdGlvbiBhcyBpdCdzIHRoZSBvcHRpbWFsXG4gICAgICAgIHZhciBjaG9zZW5BY3Rpb24gPSBhdmFpbGFibGVBY3Rpb25zWzBdO1xuICAgICAgICB2YXIgbmV4dCA9IGNob3NlbkFjdGlvbi5hcHBseVRvKGdhbWUuY3VycmVudFN0YXRlKTtcblxuICAgICAgICB1aS5pbnNlcnRBdChjaG9zZW5BY3Rpb24ubW92ZVBvc2l0aW9uLCB0dXJuKTtcblxuICAgICAgICBnYW1lLmFkdmFuY2VUbyhuZXh0KTtcbiAgICB9XG5cblxuICAgIC8qXG4gICAgICogcHVibGljIG1ldGhvZCB0byBzcGVjaWZ5IHRoZSBnYW1lIHRoZSBhaSBwbGF5ZXIgd2lsbCBwbGF5XG4gICAgICogQHBhcmFtIF9nYW1lIFtHYW1lXSA6IHRoZSBnYW1lIHRoZSBhaSB3aWxsIHBsYXlcbiAgICAgKi9cbiAgICB0aGlzLnBsYXlzID0gZnVuY3Rpb24oX2dhbWUpe1xuICAgICAgICBnYW1lID0gX2dhbWU7XG4gICAgfTtcblxuICAgIC8qXG4gICAgICogcHVibGljIGZ1bmN0aW9uOiBub3RpZnkgdGhlIGFpIHBsYXllciB0aGF0IGl0J3MgaXRzIHR1cm5cbiAgICAgKiBAcGFyYW0gdHVybiBbU3RyaW5nXTogdGhlIHBsYXllciB0byBwbGF5LCBlaXRoZXIgWCBvciBPXG4gICAgICovXG4gICAgdGhpcy5ub3RpZnkgPSBmdW5jdGlvbih0dXJuKSB7XG4gICAgICAgIHN3aXRjaChsZXZlbE9mSW50ZWxsaWdlbmNlKSB7XG4gICAgICAgICAgICAvL2ludm9rZSB0aGUgZGVzaXJlZCBiZWhhdmlvciBiYXNlZCBvbiB0aGUgbGV2ZWwgY2hvc2VuXG4gICAgICAgICAgICBjYXNlIFwiYmxpbmRcIjogdGFrZUFCbGluZE1vdmUodHVybik7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIm5vdmljZVwiOiB0YWtlQU5vdmljZU1vdmUodHVybik7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIm1hc3RlclwiOiB0YWtlQU1hc3Rlck1vdmUodHVybik7IGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcbn07XG4iLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2dhbWVsaXN0Jywge1xuICAgICAgICB1cmw6ICcvZ2FtZWxpc3QnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9icm93c2VyL2pzL2dhbWVsaXN0L2dhbWVsaXN0Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnZ2FtZUxpc3QnLFxuICAgIH0pO1xufSk7XG5cbnRzdXJvLmNvbnRyb2xsZXIoJ2dhbWVMaXN0JywgZnVuY3Rpb24gKCRzY29wZSwgZmlyZWJhc2VVcmwsICRmaXJlYmFzZU9iamVjdCwgJHN0YXRlKSB7XG4gICAgLy9Gb3Igc3luY2hyb25pemluZ0dhbWVMaXN0Li4uXG4gICAgdmFyIHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XG4gICAgdmFyIG9iaiA9ICRmaXJlYmFzZU9iamVjdChyZWYpO1xuXG4gICAgdmFyIHN5bmNoUmVmID0gcmVmLmNoaWxkKFwiZ2FtZXNcIik7XG4gICAgY29uc29sZS5sb2coc3luY2hSZWYpO1xuXG4gICAgdmFyIHN5bmNocm9uaXplZE9iaiA9ICRmaXJlYmFzZU9iamVjdChzeW5jaFJlZik7XG4gICAgY29uc29sZS5sb2coc3luY2hyb25pemVkT2JqKVxuXG4gICAgLy8gVGhpcyByZXR1cm5zIGEgcHJvbWlzZS4uLnlvdSBjYW4udGhlbigpIGFuZCBhc3NpZ24gdmFsdWUgdG8gJHNjb3BlLnZhcmlhYmxlXG4gICAgLy8gZ2FtZWxpc3QgaXMgd2hhdGV2ZXIgd2UgYXJlIGNhbGxpbmcgaXQgaW4gdGhlIGFuZ3VsYXIgaHRtbC5cbiAgICBzeW5jaHJvbml6ZWRPYmouJGJpbmRUbygkc2NvcGUsIFwiZ2FtZWxpc3RcIilcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGdhbWVsaXN0ID0gW11cbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gJHNjb3BlLmdhbWVsaXN0KSB7XG4gICAgICAgICAgICAgICAgZ2FtZWxpc3QucHVzaChbaSwgJHNjb3BlLmdhbWVsaXN0W2ldXSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRzY29wZS5nYW1lTmFtZXMgPSBnYW1lbGlzdC5zbGljZSgyKTtcbiAgICAgICAgfSlcblxuXG4gICAgJHNjb3BlLmpvaW4gPSBmdW5jdGlvbiAoZ2FtZU5hbWUpIHtcbiAgICAgICAgY29uc29sZS5sb2coZ2FtZU5hbWUpXG4gICAgICAgICRzdGF0ZS5nbygnZ2FtZScsIHtcbiAgICAgICAgICAgIFwiZ2FtZU5hbWVcIjogZ2FtZU5hbWVcbiAgICAgICAgfSk7XG4gICAgfTtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jbGFzcyBEZWNrIHtcbiAgICBjb25zdHJ1Y3Rvcih0aWxlcykge1xuICAgICAgICB0aGlzLnRpbGVzID0gdGlsZXNcbiAgICB9XG5cbiAgICBzaHVmZmxlKCkge1xuICAgICAgICB0aGlzLnRpbGVzID0gXy5zaHVmZmxlKHRoaXMudGlsZXMpXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGRlYWxUaHJlZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZXMuc3BsaWNlKDAsIDMpO1xuICAgIH1cblxuICAgIGRlYWwobnVtKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGVzLnNwbGljZSgwLCBudW0pO1xuICAgIH1cblxuICAgIHJlbG9hZCh0aWxlcykge1xuICAgICAgICB0aGlzLnRpbGVzLnB1c2godGlsZXMpXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vL0dBTUUvLy9cblxuY2xhc3MgR2FtZSB7XG4gICAgY29uc3RydWN0b3IobmFtZSkge1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLmNvdW50ID0gMzU7XG4gICAgICAgIHRoaXMuYm9hcmQgPSBuZXcgQm9hcmQoKTtcbiAgICAgICAgdGhpcy5wbGF5ZXJzID0gW107XG4gICAgICAgIHRoaXMuYXZhaWxhYmxlTWFya2VycyA9IFtcInJlZFwiLCBcIm9yYW5nZVwiLCBcInllbGxvd1wiLCBcImdyZWVuXCIsIFwiYXF1YVwiLCBcImJsdWVcIiwgXCJuYXZ5XCIsIFwicHVycGxlXCJdXG5cbiAgICAgICAgdGhpcy5jdXJyUGxheWVyOyAvL2luZGV4IG9mIHRoZSBjdXJyZW50UGxheWVyIGluIHRoZSB0dXJuT3JkZXJBcnJheVxuICAgICAgICB0aGlzLnR1cm5PcmRlckFycmF5ID0gW10gLy9ob2xkcyBhbGwgdGhlIHBsYXllcnMgc3RpbGwgb24gdGhlIGJvYXJkLlxuICAgICAgICB0aGlzLmRyYWdvbiA9IFwiXCI7IC8vIFBsYXllci5NYXJrZXJcbiAgICAgICAgdGhpcy5tb3ZlcztcbiAgICB9XG5cbiAgICAvLyBhZGRQbGF5ZXIocGxheWVyKSB7XG4gICAgLy8gICAgIHRoaXMucGxheWVycy5sZW5ndGggPCA4ID8gdGhpcy5wbGF5ZXJzLnB1c2gocGxheWVyKSA6IHRocm93IG5ldyBFcnJvciBcIlJvb20gZnVsbFwiO1xuICAgIC8vIH07XG5cbiAgICBnZXRDdXJyZW50UGxheWVyKCkge1xuICAgICAgICBpZiAodGhpcy5jdXJyUGxheWVyID09PSAtMSkgcmV0dXJuO1xuICAgICAgICByZXR1cm4gdGhpcy50dXJuT3JkZXJBcnJheVt0aGlzLmN1cnJQbGF5ZXJdO1xuICAgIH07XG5cbiAgICBtb3ZlQWxsUGxheWVycygpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLmZvckVhY2goKHBsYXllcikgPT4gcGxheWVyLmtlZXBNb3ZpbmcoKSlcbiAgICB9O1xuICAgIGRlYWRQbGF5ZXJzKCl7XG4gICAgICAgIHZhciBkZWFkUGxheWVyc1RpbGVzID0gW107XG4gICAgICAgIHRoaXMucGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uKHBsYXllcil7XG4gICAgICAgICAgICBpZiAoIXBsYXllci5jYW5QbGF5ICYmIHBsYXllci50aWxlcy5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgICAgICBkZWFkUGxheWVyc1RpbGVzLnB1c2gocGxheWVyLnRpbGVzKTtcbiAgICAgICAgICAgICAgICBpc0RlYWRQbGF5ZXIgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGRlYWRQbGF5ZXJzVGlsZXM7XG4gICAgfTtcblxuICAgIGNoZWNrT3ZlcigpIHtcbiAgICAgICAgcmV0dXJuIGdldENhblBsYXkoKS5sZW5ndGggPD0gMTtcbiAgICB9XG5cbiAgICAvL3RvIGJlIGNhbGxlZCBhdCB0aGUgZW5kIG9mIGEgdHVybiB0byBzZXQgdGhlIGN1cnJQbGF5ZXIgdG8gdGhlIG5leHQgZWxpZ2libGUgcGxheWVyIGluIHRoZSB0dXJuT3JkZXJBcnJheVxuICAgIGdvVG9OZXh0UGxheWVyKCkge1xuICAgICAgICBpZiAoZ2V0Q2FuUGxheSh0aGlzLnR1cm5PcmRlckFycmF5KS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBsZXQgbmV3SWR4ID0gdGhpcy5jdXJyUGxheWVyICsgMTtcbiAgICAgICAgICAgIHdoaWxlICghdGhpcy50dXJuT3JkZXJBcnJheVtuZXdJZHggJSA4XS5jYW5QbGF5KSB7XG4gICAgICAgICAgICAgICAgbmV3SWR4Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmN1cnJQbGF5ZXIgPSBuZXdJZHg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJQbGF5ZXIgPSAtMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5nZXRDdXJyZW50UGxheWVyKCk7XG4gICAgfTtcblxuICAgIC8vcmVzdGFydCB0aGUgZ2FtZVxuICAgIHJlc2V0KCkge1xuICAgICAgICB0aGlzLnBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgICAgICAgLy9yZXRyaWV2ZSBhbGwgdGlsZXNcbiAgICAgICAgICAgIC8vcmV0dXJuIHBsYXllcidzIHRpbGVzIHRvIHRoZSBkZWNrIGFuZCBzaHVmZmxlXG4gICAgICAgICAgICB0aGlzLmRlY2sucmVsb2FkKHBsYXllci50aWxlcykuc2h1ZmZsZSgpO1xuICAgICAgICAgICAgcGxheWVyLnRpbGVzID0gW107XG4gICAgICAgICAgICAvL3Jlc2V0IGFsbCBwbGF5ZXJzIHBsYXlhYmlsaXR5XG4gICAgICAgICAgICBwbGF5ZXIuY2FuUGxheSA9IHRydWU7XG4gICAgICAgIH0pXG4gICAgfTtcblxufVxuXG4vLy8vL0VORCBPRiBHQU1FIENMQVNTLy8vLy9cblxuLy9nZXQgRWxpZ2libGUgcGxheWVyc1xubGV0IGdldENhblBsYXkgPSBmdW5jdGlvbihwbGF5ZXJzKSB7XG4gICAgcmV0dXJuIHBsYXllcnMuZmlsdGVyKChwbGF5ZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIHBsYXllci5jYW5QbGF5XG4gICAgfSlcbn0iLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2dhbWUnLCB7XG4gICAgICAgIHVybDogJy9nYW1lLzpnYW1lTmFtZScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2Jyb3dzZXIvanMvZ2FtZS9nYW1lLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnZ2FtZUN0cmwnXG4gICAgfSk7XG59KTtcblxudHN1cm8uY29udHJvbGxlcignZ2FtZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkZmlyZWJhc2VBdXRoLCBmaXJlYmFzZVVybCwgJHN0YXRlUGFyYW1zLCAkZmlyZWJhc2VPYmplY3QpIHtcbiAgICB2YXIgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcbiAgICB2YXIgZmlyZWJhc2VVc2VyID0gJHNjb3BlLmF1dGhPYmouJGdldEF1dGgoKTtcbiAgICB2YXIgZ2FtZVJlZiA9IGZpcmViYXNlVXJsICsgJ2dhbWVzLycgKyAkc3RhdGVQYXJhbXMuZ2FtZU5hbWU7XG4gICAgdmFyIGRlY2tSZWYgPSBuZXcgRmlyZWJhc2UoZ2FtZVJlZiArICcvaW5pdGlhbERlY2snKTtcbiAgICB2YXIgcGxheWVyc1JlZiA9IG5ldyBGaXJlYmFzZShnYW1lUmVmICsgJy9wbGF5ZXJzJyk7XG4gICAgdmFyIG1hcmtlcnNSZWYgPSBuZXcgRmlyZWJhc2UoZ2FtZVJlZiArICcvYXZhaWxhYmxlTWFya2VycycpO1xuXG4gICAgLy9pbnRpYWxpemUgZ2FtZVxuICAgICRzY29wZS5nYW1lID0gbmV3IEdhbWUoJHN0YXRlUGFyYW1zLmdhbWVOYW1lLCAkc3RhdGVQYXJhbXMuZGVjayk7XG5cbiAgICAkc2NvcGUuZ2FtZS5kZWNrID0gJGZpcmViYXNlT2JqZWN0KGRlY2tSZWYpO1xuXG5cbiAgICBtYXJrZXJzUmVmLm9uKCd2YWx1ZScsIGZ1bmN0aW9uIChhdmFpbGFibGVNYXJrZXJzKSB7XG4gICAgICAgICRzY29wZS5hdmFpbGFibGVNYXJrZXJzID0gT2JqZWN0LmtleXMoYXZhaWxhYmxlTWFya2VycykubWFwKGZ1bmN0aW9uIChpKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBhdmFpbGFibGVNYXJrZXJzW2ldO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIHZhciBib2FyZCA9ICRzY29wZS5nYW1lLmJvYXJkO1xuXG5cbiAgICAvL3Rha2UgYWxsIHBsYXllcnMgb24gZmlyZWJhc2UgYW5kIHR1cm4gdGhlbSBpbnRvIGxvY2FsIHBsYXllclxuICAgIHBsYXllcnNSZWYub24oXCJjaGlsZF9hZGRlZFwiLCBmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAgIHZhciBuZXdQbGF5ZXIgPSBuZXcgUGxheWVyKHBsYXllci51aWQpO1xuICAgICAgICBuZXdQbGF5ZXIubWFya2VyID0gcGxheWVyLm1hcmtlcjtcblxuICAgICAgICB2YXIgeCA9IHBsYXllci5zdGFydGluZ1Bvc2l0aW9uWzBdO1xuICAgICAgICB2YXIgeSA9IHBsYXllci5zdGFydGluZ1Bvc2l0aW9uWzFdO1xuICAgICAgICB2YXIgcG9pbnRzSW5kZXggPSBwbGF5ZXIuc3RhcnRpbmdQb3NpdGlvblsyXTtcblxuICAgICAgICBuZXdQbGF5ZXIucG9pbnQgPSBib2FyZFt5XVt4XS5wb2ludHNbcG9pbnRzSW5kZXhdO1xuICAgICAgICBuZXdQbGF5ZXIubmV4dFNwYWNlID0gYm9hcmRbeV1beF07XG4gICAgICAgIG5ld1BsYXllci5uZXh0U3BhY2VQb2ludHNJbmRleCA9IHBsYXllci5zdGFydGluZ1Bvc2l0aW9uWzJdO1xuXG4gICAgICAgIG5ld1BsYXllci50aWxlcyA9ICRzY29wZS5nYW1lLmRlY2suZGVhbFRocmVlKCk7XG5cbiAgICAgICAgJHNjb3BlLmdhbWUucGxheWVycy5wdXNoKG5ld1BsYXllcik7XG4gICAgfSk7XG5cbiAgICAvL2dldCAnbWUnXG4gICAgJHNjb3BlLm1lID0gJHNjb3BlLmdhbWUucGxheWVycy5maWx0ZXIoZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICByZXR1cm4gcGxheWVyLnVpZCA9PT0gZmlyZWJhc2VVc2VyLnVpZDtcbiAgICB9KVswXTtcblxuXG4gICAgLy9IYXZlIHBsYXllciBwaWNrIHRoZSBtYXJrZXJcbiAgICAkc2NvcGUucGlja01hcmtlciA9IGZ1bmN0aW9uIChib2FyZCwgbWFya2VyKSB7XG4gICAgICAgICRzY29wZS5tZS5tYXJrZXIgPSBtYXJrZXI7XG4gICAgICAgIHZhciBtYXJrZXJzID0gJGZpcmViYXNlQXJyYXkobWFya2Vyc1JlZik7XG4gICAgICAgIHZhciBpZHggPSBtYXJrZXJzLmluZGV4T2YobWFya2VyKTtcbiAgICAgICAgbWFya2Vycy4kcmVtb3ZlKG1hcmtlcnNbaWR4XSkudGhlbihmdW5jdGlvbiAocmVmKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZWYua2V5KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vSGF2ZSBwbGF5ZXIgcGljayB0aGVpciBzdGFydCBwb2ludFxuXG4gICAgJHNjb3BlLnBsYWNlTWFya2VyID0gZnVuY3Rpb24gKGJvYXJkLCBwb2ludCkge1xuICAgICAgICAkc2NvcGUubWUucGxhY2VNYXJrZXIocG9pbnQpO1xuICAgICAgICAkc2NvcGUuZ2FtZS5wbGF5ZXJzLnB1c2goJHNjb3BlLnBsYXllcik7XG5cbiAgICAgICAgZ2FtZVJlZi5jaGlsZCgncGxheWVycycpLmNoaWxkKHBsYXllci51aWQpLnB1c2goe1xuICAgICAgICAgICAgJ21hcmtlcic6IHBsYXllci5tYXJrZXIsXG4gICAgICAgICAgICAnc3RhcnRpbmdQb3NpdGlvbic6IHBsYXllci5zdGFydGluZ1Bvc2l0aW9uXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBUT0RPOiB3ZSBwcm9iYWJseSBuZWVkIHRoaXMgb24gZmlyZWJhc2Ugc28gb3RoZXIgcGVvcGxlIGNhbid0IHBpY2sgd2hhdCdzIGJlZW4gcGlja2VkXG5cbiAgICAvL0ZvciBzeW5jaHJvbml6aW5nR2FtZS4uLlxuICAgIHZhciBzeW5jUmVmID0gbmV3IEZpcmViYXNlKGdhbWVSZWYgKyAnL21vdmVzJyk7XG4gICAgc3luY1JlZi5vbignY2hpbGRfYWRkZWQnLCBmdW5jdGlvbiAoY2hpbGRTbmFwc2hvdCwgcHJldkNoaWxkS2V5KSB7XG4gICAgICAgIC8vTkVFRCBUTyBET1VCTEUgQ0hFQ0shISBXaGF0IGRvZXMgY2hpbGRTbmFwIHJldHVybnM/XG4gICAgICAgIGNvbnNvbGUubG9nKCdjaGlsZFNuYXBzaG90X1N5bmNHYW1lJywgY2hpbGRTbmFwc2hvdCk7XG4gICAgICAgIC8vZGVwZW5kaW5nIG9uIHdoYXQgY2hpbGRTbmFwc2hvdCBnaXZlcyBtZS4uLkkgdGhpbmsgaXQncyBvbmUgY2hpbGQgcGVyIG9uIGNhbGw/IEl0IGRvZXNuJ3QgcmV0dXJuIGFuIGFycmF5IG9mIGNoYW5nZXMuLi5JIGJlbGlldmUhXG4gICAgICAgIGlmIChjaGlsZFNuYXBzaG90LnR5cGUgPT09ICd1cGRhdGVEZWNrJykge1xuICAgICAgICAgICAgJHNjb3BlLmdhbWUuZGVjayA9IGNoaWxkU25hcHNob3QudXBkYXRlRGVjaztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRzY29wZS5wbGFjZVRpbGUoY2hpbGRTbmFwc2hvdC50aWxlKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gVE9ETzogaG93IHRvIHJlLWRvIHRoZSBtb3Zlcz9cbiAgICAvLyAkc2NvcGUuZ2FtZS5tb3ZlcztcblxuICAgIC8vIFRPRE86IGhvdyBkbyB3ZSBzaG93IHRoZSB0aWxlcyBmb3IgcGxheWVyP1xuXG4gICAgLy8gVE9ETzogaG93IHRvIHNob3cgdGhlIHJvdGF0ZWQgdGlsZT9cblxuICAgIC8vIENNVDogYXNzdW1pbmcgd2UgdXNlIG5ldyBHYW1lKCkgZm9yIGVhY2ggZ2FtZVxuICAgICRzY29wZS5jdXJyZW50UGxheWVyID0gJHNjb3BlLmdhbWUuZ2V0Q3VycmVudFBsYXllcigpO1xuXG4gICAgLy8gQ01UOiBhc3N1bWluZyB3ZSB1c2UgbmV3IEdhbWUoKSBmb3IgZWFjaCBnYW1lLCBob2xkcyBhbGwgdGhlIHBsYXllcnMgc3RpbGwgb24gdGhlIGJvYXJkLlxuICAgICRzY29wZS50dXJuT3JkZXJBcnJheSA9ICRzY29wZS5nYW1lLmdldENhblBsYXkoKTtcblxuICAgIC8vIFRPRE86IG5lZWQgYSBmdW5jdGlvbiB0byBhc3NpZ24gZHJhZ29uXG4gICAgJHNjb3BlLmRyYWdvbjtcbiAgICB2YXIgYXdhaXRpbmdEcmFnb25Ib2xkZXJzID0gW107XG5cblxuICAgICRzY29wZS5zdGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy9cbiAgICB9O1xuXG4gICAgJHNjb3BlLm15VHVybiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHNjb3BlLm1lID09PSAkc2NvcGUuY3VycmVudFBsYXllcjtcbiAgICB9O1xuXG4gICAgLy90aGVzZSBhcmUgdGllZCB0byBhbmd1bGFyIG5nLWNsaWNrIGJ1dHRvbnNcbiAgICAkc2NvcGUucm90YXRlVGlsZUN3ID0gZnVuY3Rpb24gKHRpbGUpIHtcbiAgICAgICAgdGlsZS5yb3RhdGlvbisrO1xuICAgICAgICBpZiAodGlsZS5yb3RhdGlvbiA9PT0gNCkgdGlsZS5yb3RhdGlvbiA9IDA7XG4gICAgfTtcblxuICAgICRzY29wZS5yb3RhdGVUaWxlQ2N3ID0gZnVuY3Rpb24gKHRpbGUpIHtcbiAgICAgICAgdGlsZS5yb3RhdGlvbi0tO1xuICAgICAgICBpZiAodGlsZS5yb3RhdGlvbiA9PT0gLTQpIHRpbGUucm90YXRpb24gPSAwO1xuICAgIH07XG5cbiAgICAvLyBDTVQ6IGFzc3VtaW5nIHdlIHVzZSBuZXcgR2FtZSgpXG4gICAgLy8gQ01UOiB1c2UgcGxheWVyJ3MgYW5kIGdhbWUncyBwcm90b3R5cGUgZnVuY3Rpb24gdG8gcGxhY2UgdGlsZSBhbmQgdGhlbiBtb3ZlIGFsbCBwbGF5ZXJzXG4gICAgJHNjb3BlLnBsYWNlVGlsZSA9IGZ1bmN0aW9uICh0aWxlKSB7XG4gICAgICAgIC8vIFRPRE86IHNlbmQgdGhpcyBzdGF0ZSB0byBmaXJlYmFzZSBldmVyeSB0aW1lIGl0J3MgY2FsbGVkXG4gICAgICAgIGlmICh0aWxlLnJvdGF0aW9uID4gMCkge1xuICAgICAgICAgICAgdGlsZS5wYXRocyA9IHRpbGUucGF0aHMubWFwKGZ1bmN0aW9uIChjb25uZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbm5lY3Rpb24gKyAyO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aWxlLnBhdGhzLnVuc2hpZnQodGlsZS5wYXRocy5wb3AoKSk7XG4gICAgICAgICAgICB0aWxlLnBhdGhzLnVuc2hpZnQodGlsZS5wYXRocy5wb3AoKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGlsZS5yb3RhdGlvbiA8IDApIHtcbiAgICAgICAgICAgIHRpbGUucGF0aHMgPSB0aWxlLnBhdGhzLm1hcChmdW5jdGlvbiAoY29ubmVjdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb25uZWN0aW9uIC0gMjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGlsZS5wYXRocy5wdXNoKHRpbGUucGF0aHMuc2hpZnQoKSk7XG4gICAgICAgICAgICB0aWxlLnBhdGhzLnB1c2godGlsZS5wYXRocy5zaGlmdCgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5tZS5wbGFjZVRpbGUodGlsZSk7XG4gICAgICAgIGdhbWVSZWYuY2hpbGQoJ21vdmVzJykucHVzaCh7XG4gICAgICAgICAgICAndHlwZSc6ICdwbGFjZVRpbGUnLFxuICAgICAgICAgICAgJ3RpbGUnOiB0aWxlXG4gICAgICAgIH0pO1xuXG4gICAgICAgICRzY29wZS5nYW1lLm1vdmVBbGxwbGF5ZXJzKCk7XG5cbiAgICAgICAgaWYgKCRzY29wZS5nYW1lLmNoZWNrT3ZlcigpKSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBuZWVkIHRvIHRlbGwgdGhlIHBsYXllciBzaGUgd29uXG4gICAgICAgICAgICAkc2NvcGUud2lubmVyID0gJHNjb3BlLmdhbWUuZ2V0Q2FuUGxheSgpWzBdO1xuICAgICAgICAgICAgJHNjb3BlLmdhbWVPdmVyID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIElmIGRlY2sgaXMgZW1wdHkgJiBubyBvbmUgaXMgZHJhZ29uLCBzZXQgbWUgYXMgZHJhZ29uXG4gICAgICAgICAgICBpZiAoJHNjb3BlLmdhbWUuZGVjay5sZW5ndGggPT09IDAgJiYgISRzY29wZS5kcmFnb24pIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZHJhZ29uID0gJHNjb3BlLm1lO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgkc2NvcGUuZ2FtZS5kZWNrLmxlbmd0aCA9PT0gMCAmJiAkc2NvcGUuZHJhZ29uKSB7XG4gICAgICAgICAgICAgICAgYXdhaXRpbmdEcmFnb25Ib2xkZXJzLnB1c2goJHNjb3BlLm1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gQ01UOiBkcmF3IG9uZSB0aWxlIGFuZCBwdXNoIGl0IHRvIHRoZSBwbGF5ZXIudGlsZXMgYXJyYXlcbiAgICAgICAgICAgICAgICAkc2NvcGUubWUudGlsZXMucHVzaCgkc2NvcGUuZ2FtZS5kZWNrLmRlYWwoMSkpO1xuICAgICAgICAgICAgICAgIC8vaWYgZGVhZCBwbGF5ZXJzLCB0aGVuIHB1c2ggdGhlaXIgY2FyZHMgYmFjayB0byB0aGUgZGVjayAmIHJlc2h1ZmZsZVxuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuZ2FtZS5kZWFkUGxheWVycygpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAvL3dpdGggbmV3IGNhcmRzICYgbmVlZCB0byByZXNodWZmbGVcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmdhbWUuZGVhZFBsYXllcnMoKS5mb3JFYWNoKGZ1bmN0aW9uIChkZWFkUGxheWVyVGlsZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlYWRQbGF5ZXJUaWxlcy5mb3JFYWNoKGZ1bmN0aW9uICh0aWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmdhbWUuZGVjay5wdXNoKHRpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZ2FtZS5kZWNrID0gJHNjb3BlLmdhbWUuZGVjay5zaHVmZmxlKCk7XG4gICAgICAgICAgICAgICAgICAgIC8vc2VuZCBmaXJlYmFzZSBhIG5ldyBtb3ZlXG4gICAgICAgICAgICAgICAgICAgIGdhbWVSZWYuY2hpbGQoJ21vdmVzJykucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAndHlwZSc6ICd1cGRhdGVEZWNrJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICd1cGRhdGVEZWNrJzogJHNjb3BlLmdhbWUuZGVja1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS5kcmFnb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kcmFnb24udGlsZXMucHVzaCgkc2NvcGUuZ2FtZS5kZWNrLmRlYWwoMSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRyYWdvbiA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL05FRUQgVE8gRElTQ1VTUzogTWlnaHQgbmVlZCB0byBtb2RpZnkgdGhpcyBpZiB3ZSB3YW50IHRvIHVzZSB1cCB0aGUgY2FyZHMgYW5kIGdpdmUgZWFjaCBhd2FpdGluZyBwbGF5ZXJzJyB1cCB0byAzIGNhcmRzXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoJHNjb3BlLmdhbWUuZGVjay5sZW5ndGggJiYgJHNjb3BlLmF3YWl0aW5nRHJhZ29uSG9sZGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuYXdhaXRpbmdEcmFnb25Ib2xkZXJzLnNoaWZ0KCkudGlsZXMucHVzaCgkc2NvcGUuZ2FtZS5kZWNrLmRlYWwoMSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuYXdhaXRpbmdEcmFnb25Ib2xkZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kcmFnb24gPSAkc2NvcGUuYXdhaXRpbmdEcmFnb25Ib2xkZXJzLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkc2NvcGUuZ2FtZS5nb1RvTmV4dFBsYXllcigpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIFRPRE86IGZpcmViYXNlIGdhbWUucGxheWVycyBzbGljZSAkc2NvcGUucGxheWVyIG91dFxuICAgICRzY29wZS5sZWF2ZUdhbWU7XG5cbiAgICAvLyBUT0RPOiBkbyB3ZSByZW1vdmUgdGhpcyBnYW1lIHJvb20ncyBtb3ZlcyBmcm9tIGZpcmViYXNlP1xuICAgICRzY29wZS5yZXNldCA9ICRzY29wZS5nYW1lLnJlc2V0O1xuXG5cbiAgICAkc2NvcGUuc3RhcnR0b3AgPSBbXG4gICAgICAgIFswLCAwLCAwXSxcbiAgICAgICAgWzAsIDAsIDFdLFxuICAgICAgICBbMSwgMCwgMF0sXG4gICAgICAgIFsxLCAwLCAxXSxcbiAgICAgICAgWzIsIDAsIDBdLFxuICAgICAgICBbMiwgMCwgMV0sXG4gICAgICAgIFszLCAwLCAwXSxcbiAgICAgICAgWzMsIDAsIDFdLFxuICAgICAgICBbNCwgMCwgMF0sXG4gICAgICAgIFs0LCAwLCAxXSxcbiAgICAgICAgWzUsIDAsIDBdLFxuICAgICAgICBbNSwgMCwgMV1cbiAgICBdO1xuICAgICRzY29wZS5zdGFydGxlZnQgPSBbXG4gICAgICAgIFswLCAwLCA3XSxcbiAgICAgICAgWzAsIDAsIDZdLFxuICAgICAgICBbMCwgMSwgN10sXG4gICAgICAgIFswLCAxLCA2XSxcbiAgICAgICAgWzAsIDIsIDddLFxuICAgICAgICBbMCwgMiwgNl0sXG4gICAgICAgIFswLCAzLCA3XSxcbiAgICAgICAgWzAsIDMsIDZdLFxuICAgICAgICBbMCwgNCwgN10sXG4gICAgICAgIFswLCA0LCA2XSxcbiAgICAgICAgWzAsIDUsIDddLFxuICAgICAgICBbMCwgNSwgNl1cbiAgICBdO1xuICAgICRzY29wZS5zdGFydGJvdHRvbSA9IFtcbiAgICAgICAgWzAsIDUsIDBdLFxuICAgICAgICBbMCwgNSwgMV0sXG4gICAgICAgIFsxLCA1LCAwXSxcbiAgICAgICAgWzEsIDUsIDFdLFxuICAgICAgICBbMiwgNSwgMF0sXG4gICAgICAgIFsyLCA1LCAxXSxcbiAgICAgICAgWzMsIDUsIDBdLFxuICAgICAgICBbMywgNSwgMV0sXG4gICAgICAgIFs0LCA1LCAwXSxcbiAgICAgICAgWzQsIDUsIDFdLFxuICAgICAgICBbNSwgNSwgMF0sXG4gICAgICAgIFs1LCA1LCAxXVxuICAgIF07XG4gICAgJHNjb3BlLnN0YXJ0cmlnaHQgPSBbXG4gICAgICAgIFs1LCAwLCAyXSxcbiAgICAgICAgWzUsIDAsIDNdLFxuICAgICAgICBbNSwgMSwgMl0sXG4gICAgICAgIFs1LCAxLCAzXSxcbiAgICAgICAgWzUsIDIsIDJdLFxuICAgICAgICBbNSwgMiwgM10sXG4gICAgICAgIFs1LCAzLCAyXSxcbiAgICAgICAgWzUsIDMsIDNdLFxuICAgICAgICBbNSwgNCwgMl0sXG4gICAgICAgIFs1LCA0LCAzXSxcbiAgICAgICAgWzUsIDUsIDJdLFxuICAgICAgICBbNSwgNSwgM11cbiAgICBdO1xuXG59KTtcbiIsInRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgncGlja0dhbWUnLCB7XG4gICAgICAgIHVybDogJy9waWNrZ2FtZScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2Jyb3dzZXIvanMvcGlja0dhbWUvcGlja0dhbWUuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdwaWNrR2FtZUN0cmwnXG4gICAgfSk7XG59KTtcblxudHN1cm8uY29udHJvbGxlcigncGlja0dhbWVDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlLCAkZmlyZWJhc2VBcnJheSwgJGZpcmViYXNlT2JqZWN0KSB7XG4gICAgdmFyIHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XG4gICAgdmFyIG9iaiA9ICRmaXJlYmFzZU9iamVjdChyZWYpO1xuXG4gICAgJHNjb3BlLnRlc3QgPSBcImhpXCI7XG5cbiAgICAkc2NvcGUuY3JlYXRlR2FtZSA9IGZ1bmN0aW9uIChnYW1lTmFtZSkge1xuICAgICAgICB2YXIgZ2FtZU5hbWVSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoZ2FtZU5hbWUpO1xuICAgICAgICAkZmlyZWJhc2VBcnJheShnYW1lTmFtZVJlZikuJGFkZCh7XG4gICAgICAgICAgICBcImdhbWVOYW1lXCI6IGdhbWVOYW1lXG4gICAgICAgIH0pO1xuXG4gICAgICAgIG9iai4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgdmFyIHRpbGVzID0gZGF0YS50aWxlc1xuICAgICAgICAgICAgdmFyIGRlY2sgPSBuZXcgRGVjayh0aWxlcykuc2h1ZmZsZSgpLnRpbGVzO1xuICAgICAgICAgICAgdmFyIGluaXRpYWxEZWNrUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKGdhbWVOYW1lKS5jaGlsZCgnaW5pdGlhbERlY2snKTtcbiAgICAgICAgICAgICRmaXJlYmFzZUFycmF5KGluaXRpYWxEZWNrUmVmKS4kYWRkKGRlY2spO1xuICAgICAgICB9KVxuXG5cbiAgICAgICAgdmFyIGluaXRpYWxNYXJrZXJzUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKGdhbWVOYW1lKS5jaGlsZCgnYXZhaWxhYmxlTWFya2VycycpO1xuICAgICAgICAkZmlyZWJhc2VBcnJheShpbml0aWFsTWFya2Vyc1JlZikuJGFkZChbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJ5ZWxsb3dcIiwgXCJncmVlblwiLCBcImFxdWFcIiwgXCJibHVlXCIsIFwibmF2eVwiLCBcInB1cnBsZVwiXSk7XG5cbiAgICAgICAgJHN0YXRlLmdvKCdnYW1lJywge1xuICAgICAgICAgICAgXCJnYW1lTmFtZVwiOiBnYW1lTmFtZVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmdvVG9HYW1lTGlzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHN0YXRlLmdvKCdnYW1lbGlzdCcpO1xuICAgIH07XG59KTtcbiIsInRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbG9naW4nLCB7XG4gICAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2Jyb3dzZXIvanMvbG9naW4vbG9naW4uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdsb2dpbkN0cmwnXG4gICAgfSk7XG59KTtcblxudHN1cm8uY29udHJvbGxlcignbG9naW5DdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlLCAkZmlyZWJhc2VBdXRoKSB7XG4gICAgdmFyIGF1dGggPSAkZmlyZWJhc2VBdXRoKCk7XG5cbiAgICAkc2NvcGUubG9nSW5XaXRoR29vZ2xlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBhdXRoLiRzaWduSW5XaXRoUG9wdXAoXCJnb29nbGVcIikudGhlbihmdW5jdGlvbiAoYXV0aERhdGEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTG9nZ2VkIGluIGFzOlwiLCBhdXRoRGF0YSk7XG4gICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkF1dGhlbnRpY2F0aW9uIGZhaWxlZDpcIiwgZXJyb3IpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkc3RhdGUuZ28oJ3BpY2tHYW1lJyk7XG4gICAgfTtcblxufSk7XG4iLCIndXNlIHN0cmljdCdcblxuZnVuY3Rpb24gUGxheWVyKHVpZCkge1xuICAgIC8vIFRPRE86IGdldCB1aWQgZnJvbSBmaXJlYmFzZSBhdXRoXG4gICAgdGhpcy51aWQgPSB1aWQ7XG5cbiAgICB0aGlzLm1hcmtlciA9IG51bGw7XG5cbiAgICAvLyBzaG91bGQgYmUgYSBQb2ludCBvYmplY3RcbiAgICB0aGlzLnBvaW50ID0gbnVsbDtcblxuICAgIC8vIFt4LCB5XVxuICAgIC8vIGRlcGVuZHMgb24gdGhlIGFuZ3VsYXIgU3BhY2UueCwgU3BhY2UueVxuICAgIHRoaXMubmV4dFNwYWNlID0gbnVsbDtcblxuICAgIC8vIGluIGVhY2ggU3BhY2UucG9pbnRzIGFycmF5LCBmaW5kIHRoaXMgc3BlY2lmaWMgcG9pbnQgYW5kIGdldCB0aGUgcG9zaXRpb24gKGludGVnZXIpIGluc2lkZSB0aGlzIHNwYWNlLlxuICAgIHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPSBudWxsO1xuXG4gICAgLy8gbWF4aW11biAzIHRpbGVzXG4gICAgdGhpcy50aWxlcyA9IFtdO1xuXG4gICAgLy8gaWYgYSBwbGF5ZXIgZGllcywgaXQgd2lsbCBiZSBjaGFuZ2VkIHRvIGZhbHNlXG4gICAgdGhpcy5jYW5QbGF5ID0gdHJ1ZTtcbn1cblxuUGxheWVyLnByb3RvdHlwZS5wbGFjZU1hcmtlciA9IGZ1bmN0aW9uIChib2FyZCwgcG9pbnQpIHtcbiAgICAvLyBwb2ludCBsb29rcyBsaWtlIFt4LCB5LCBwb2ludHNJbmRleF0gaW4gdGhlIHNwYWNlXG4gICAgdmFyIHggPSBwb2ludFswXTtcbiAgICB2YXIgeSA9IHBvaW50WzFdO1xuICAgIHZhciBwb2ludHNJbmRleCA9IHBvaW50WzJdO1xuXG4gICAgdGhpcy5wb2ludCA9IGJvYXJkW3ldW3hdLnBvaW50c1twb2ludHNJbmRleF07XG4gICAgdGhpcy5wb2ludC50cmF2ZWxsZWQgPSB0cnVlO1xuXG4gICAgLy9beCwgeV0gZnJvbSB0aGUgcG9pbnRcbiAgICB0aGlzLm5leHRTcGFjZSA9IGJvYXJkW3ldW3hdO1xuXG4gICAgLy8gaW4gZWFjaCBTcGFjZS5wb2ludHMgYXJyYXksIGZpbmQgdGhpcyBzcGVjaWZpYyBwb2ludCBhbmQgZ2V0IHRoZSBwb3NpdGlvbiAoaW50ZWdlcikgaW5zaWRlIHRoaXMgc3BhY2UuXG4gICAgdGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9IHRoaXMubmV4dFNwYWNlLnBvaW50cy5pbmRleE9mKHRoaXMucG9pbnQpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5uZXdTcGFjZSA9IGZ1bmN0aW9uIChib2FyZCwgb2xkU3BhY2UpIHtcbiAgICBpZiAodGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gMCB8fCB0aGlzLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSAxKSB7XG4gICAgICAgIHJldHVybiBib2FyZFtvbGRTcGFjZS55IC0gMV1bb2xkU3BhY2UueF07XG4gICAgfSBlbHNlIGlmICh0aGlzLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSAyIHx8IHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDMpIHtcbiAgICAgICAgcmV0dXJuIGJvYXJkW29sZFNwYWNlLnldW29sZFNwYWNlLnggKyAxXTtcbiAgICB9IGVsc2UgaWYgKHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDQgfHwgdGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gNSkge1xuICAgICAgICByZXR1cm4gYm9hcmRbb2xkU3BhY2UueSArIDFdW29sZFNwYWNlLnhdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBib2FyZFtvbGRTcGFjZS55XVtvbGRTcGFjZS54IC0gMV07XG4gICAgfVxufTtcblxuUGxheWVyLnByb3RvdHlwZS5wbGFjZVRpbGUgPSBmdW5jdGlvbiAodGlsZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMudGlsZXMuaW5kZXhPZih0aWxlKTtcbiAgICB0aGlzLnRpbGVzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICB0aGlzLm5leHRTcGFjZS50aWxlVXJsID0gdGlsZS5pbWFnZVVybDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGlsZS5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLm5leHRTcGFjZS5wb2ludHNbaV0ubmVpZ2hib3JzLnB1c2godGhpcy5uZXh0U3BhY2UucG9pbnRzW3RpbGVbaV1dKTtcbiAgICB9XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLm1vdmVUbyA9IGZ1bmN0aW9uIChwb2ludGVyKSB7XG4gICAgLy8gbGV0IHBvaW50ZXIgPSBwb2ludGVyO1xuXG4gICAgLy9hbHdheXMgYmUgcmV0dXJuaW5nIDAgb3IgMSBwb2ludCBpbiB0aGUgYXJyYXlcbiAgICBsZXQgbmV4dFBvaW50ID0gcG9pbnRlci5uZWlnaGJvcnMuZmlsdGVyKGZ1bmN0aW9uIChuZWlnaGJvcikge1xuICAgICAgICByZXR1cm4gIW5laWdoYm9yLnRyYXZlbGxlZDtcbiAgICB9KVswXTtcblxuICAgIHJldHVybiBuZXh0UG9pbnQ7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLmtlZXBNb3ZpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgbGV0IG1vdmFibGUgPSB0aGlzLm1vdmVUbyh0aGlzLnBvaW50KTtcbiAgICB3aGlsZSAobW92YWJsZSkge1xuICAgICAgICB0aGlzLnBvaW50LnRyYXZlbGxlZCA9IHRydWU7XG4gICAgICAgIHRoaXMucG9pbnQgPSB0aGlzLm1vdmVUbyh0aGlzLnBvaW50KTtcbiAgICAgICAgbGV0IG9sZFNwYWNlID0gdGhpcy5uZXh0U3BhY2U7XG4gICAgICAgIGxldCBuZXdTcGFjZSA9IG5ld1NwYWNlKG9sZFNwYWNlKTtcbiAgICAgICAgdGhpcy5uZXh0U3BhY2UgPSBuZXdTcGFjZTtcblxuICAgICAgICB0aGlzLmNoZWNrRGVhdGgoKTtcbiAgICAgICAgbW92YWJsZSA9IHRoaXMubW92ZVRvKHRoaXMucG9pbnQpO1xuICAgIH1cbn07XG5cblBsYXllci5wcm90b3R5cGUuY2hlY2tEZWF0aCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYWxsVHJhdmVsbGVkID0gdGhpcy5wb2ludC5uZWlnaGJvcnMuZmlsdGVyKGZ1bmN0aW9uIChuZWlnaGJvcikge1xuICAgICAgICByZXR1cm4gbmVpZ2hib3IudHJhdmVsbGVkO1xuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMucG9pbnQuZWRnZSB8fCBhbGxUcmF2ZWxsZWQubGVuZ3RoID09PSAyKSB0aGlzLmRpZSgpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5kaWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jYW5QbGF5ID0gZmFsc2U7XG4gICAgLy8gVE9ETzogbmVlZCB0byBzZW5kIGFuIGFsZXJ0IG9yIG1lc3NhZ2UgdG8gdGhlIHBsYXllciB3aG8ganVzdCBkaWVkLlxufTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
