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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFpL2FpLmpzIiwiZ2FtZWxpc3QvZ2FtZWxpc3QuanMiLCJnYW1lL2RlY2suanMiLCJnYW1lL2dhbWUuY29udHJ1Y3Rvci5qcyIsImdhbWUvZ2FtZS5qcyIsImxvZ2luL2xvZ2luLmpzIiwicGlja0dhbWUvcGlja0dhbWUuanMiLCJwbGF5ZXIvcGxheWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLElBQUEsUUFBQSxRQUFBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxXQUFBLEVBQUEsVUFBQSxDQUFBLENBQUE7O0FBRUEsTUFBQSxNQUFBLENBQUEsWUFBQTtBQUNBLFFBQUEsU0FBQTtBQUNBLGdCQUFBLHlDQURBO0FBRUEsb0JBQUEsc0NBRkE7QUFHQSxxQkFBQSw2Q0FIQTtBQUlBLHVCQUFBO0FBSkEsS0FBQTtBQU1BLGFBQUEsYUFBQSxDQUFBLE1BQUE7QUFDQSxDQVJBOztBQVVBLE1BQUEsUUFBQSxDQUFBLGFBQUEsRUFBQSw0Q0FBQTs7QUFFQSxNQUFBLE1BQUEsQ0FBQSxVQUFBLGtCQUFBLEVBQUE7QUFDQSx1QkFBQSxTQUFBLENBQUEsR0FBQTtBQUNBLENBRkE7O0FDZEE7Ozs7Ozs7OztBQVNBLElBQUEsV0FBQSxTQUFBLFFBQUEsQ0FBQSxHQUFBLEVBQUE7OztBQUdBLFNBQUEsWUFBQSxHQUFBLEdBQUE7OztBQUdBLFNBQUEsVUFBQSxHQUFBLENBQUE7Ozs7Ozs7QUFPQSxTQUFBLE9BQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFlBQUEsT0FBQSxJQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUE7OztBQUdBLGFBQUEsS0FBQSxDQUFBLEtBQUEsWUFBQSxJQUFBLE1BQUEsSUFBQTs7QUFFQSxZQUFBLE1BQUEsSUFBQSxLQUFBLEdBQUEsRUFDQSxLQUFBLFdBQUE7O0FBRUEsYUFBQSxXQUFBOztBQUVBLGVBQUEsSUFBQTtBQUNBLEtBWkE7QUFhQSxDQTFCQTs7Ozs7Ozs7QUFrQ0EsU0FBQSxTQUFBLEdBQUEsVUFBQSxXQUFBLEVBQUEsWUFBQSxFQUFBO0FBQ0EsUUFBQSxZQUFBLFVBQUEsR0FBQSxhQUFBLFVBQUEsRUFDQSxPQUFBLENBQUEsQ0FBQSxDO0FBREEsU0FFQSxJQUFBLFlBQUEsVUFBQSxHQUFBLGFBQUEsVUFBQSxFQUNBLE9BQUEsQ0FBQSxDO0FBREEsYUFHQSxPQUFBLENBQUEsQztBQUNBLENBUEE7Ozs7Ozs7O0FBZUEsU0FBQSxVQUFBLEdBQUEsVUFBQSxXQUFBLEVBQUEsWUFBQSxFQUFBO0FBQ0EsUUFBQSxZQUFBLFVBQUEsR0FBQSxhQUFBLFVBQUEsRUFDQSxPQUFBLENBQUEsQ0FBQSxDO0FBREEsU0FFQSxJQUFBLFlBQUEsVUFBQSxHQUFBLGFBQUEsVUFBQSxFQUNBLE9BQUEsQ0FBQSxDO0FBREEsYUFHQSxPQUFBLENBQUEsQztBQUNBLENBUEE7Ozs7OztBQWNBLElBQUEsS0FBQSxTQUFBLEVBQUEsQ0FBQSxLQUFBLEVBQUE7OztBQUdBLFFBQUEsc0JBQUEsS0FBQTs7O0FBR0EsUUFBQSxPQUFBLEVBQUE7Ozs7Ozs7QUFPQSxhQUFBLFlBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxZQUFBLE1BQUEsVUFBQSxFQUFBLEVBQUE7O0FBRUEsbUJBQUEsS0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsU0FIQSxNQUlBO0FBQ0EsZ0JBQUEsVUFBQSxDOztBQUVBLGdCQUFBLE1BQUEsSUFBQSxLQUFBLEdBQUE7O0FBRUEsNkJBQUEsQ0FBQSxJQUFBLENBRkE7O0FBS0EsNkJBQUEsSUFBQTs7QUFFQSxnQkFBQSxxQkFBQSxNQUFBLFVBQUEsRUFBQTs7O0FBR0EsZ0JBQUEsc0JBQUEsbUJBQUEsR0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0Esb0JBQUEsU0FBQSxJQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUE7O0FBRUEsb0JBQUEsWUFBQSxPQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUE7O0FBRUEsdUJBQUEsU0FBQTtBQUNBLGFBTkEsQ0FBQTs7OztBQVVBLGdDQUFBLE9BQUEsQ0FBQSxVQUFBLFNBQUEsRUFBQTtBQUNBLG9CQUFBLFlBQUEsYUFBQSxTQUFBLENBQUE7QUFDQSxvQkFBQSxNQUFBLElBQUEsS0FBQSxHQUFBLEVBQUE7O0FBRUEsd0JBQUEsWUFBQSxVQUFBLEVBQ0EsYUFBQSxTQUFBO0FBQ0EsaUJBSkEsTUFLQTs7QUFFQSx3QkFBQSxZQUFBLFVBQUEsRUFDQSxhQUFBLFNBQUE7QUFDQTtBQUNBLGFBWkE7O0FBY0EsbUJBQUEsVUFBQTtBQUNBO0FBQ0E7Ozs7Ozs7QUFPQSxhQUFBLGNBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxZQUFBLFlBQUEsS0FBQSxZQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsWUFBQSxhQUFBLFVBQUEsS0FBQSxLQUFBLENBQUEsS0FBQSxNQUFBLEtBQUEsVUFBQSxNQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsU0FBQSxJQUFBLFFBQUEsQ0FBQSxVQUFBLENBQUE7O0FBRUEsWUFBQSxPQUFBLE9BQUEsT0FBQSxDQUFBLEtBQUEsWUFBQSxDQUFBOztBQUVBLFdBQUEsUUFBQSxDQUFBLFVBQUEsRUFBQSxJQUFBOztBQUVBLGFBQUEsU0FBQSxDQUFBLElBQUE7QUFDQTs7Ozs7OztBQU9BLGFBQUEsZUFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFlBQUEsWUFBQSxLQUFBLFlBQUEsQ0FBQSxVQUFBLEVBQUE7OztBQUdBLFlBQUEsbUJBQUEsVUFBQSxHQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxnQkFBQSxTQUFBLElBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxDO0FBQ0EsZ0JBQUEsWUFBQSxPQUFBLE9BQUEsQ0FBQSxLQUFBLFlBQUEsQ0FBQSxDOztBQUVBLG1CQUFBLFVBQUEsR0FBQSxhQUFBLFNBQUEsQ0FBQSxDOztBQUVBLG1CQUFBLE1BQUE7QUFDQSxTQVBBLENBQUE7OztBQVVBLFlBQUEsU0FBQSxHQUFBOztBQUVBLDZCQUFBLElBQUEsQ0FBQSxTQUFBLFVBQUEsRUFGQTs7QUFLQSw2QkFBQSxJQUFBLENBQUEsU0FBQSxTQUFBOzs7OztBQUtBLFlBQUEsWUFBQTtBQUNBLFlBQUEsS0FBQSxNQUFBLEtBQUEsR0FBQSxJQUFBLEVBQUEsRUFBQTtBQUNBLDJCQUFBLGlCQUFBLENBQUEsQ0FBQTtBQUNBLFNBRkEsTUFHQTtBQUNBLGdCQUFBLGlCQUFBLE1BQUEsSUFBQSxDQUFBLEVBQUE7O0FBRUEsK0JBQUEsaUJBQUEsQ0FBQSxDQUFBO0FBQ0EsYUFIQSxNQUlBOztBQUVBLCtCQUFBLGlCQUFBLENBQUEsQ0FBQTtBQUNBO0FBQ0E7QUFDQSxZQUFBLE9BQUEsYUFBQSxPQUFBLENBQUEsS0FBQSxZQUFBLENBQUE7O0FBRUEsV0FBQSxRQUFBLENBQUEsYUFBQSxZQUFBLEVBQUEsSUFBQTs7QUFFQSxhQUFBLFNBQUEsQ0FBQSxJQUFBO0FBQ0E7Ozs7Ozs7QUFPQSxhQUFBLGVBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxZQUFBLFlBQUEsS0FBQSxZQUFBLENBQUEsVUFBQSxFQUFBOzs7QUFHQSxZQUFBLG1CQUFBLFVBQUEsR0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsZ0JBQUEsU0FBQSxJQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsQztBQUNBLGdCQUFBLE9BQUEsT0FBQSxPQUFBLENBQUEsS0FBQSxZQUFBLENBQUEsQzs7QUFFQSxtQkFBQSxVQUFBLEdBQUEsYUFBQSxJQUFBLENBQUEsQzs7QUFFQSxtQkFBQSxNQUFBO0FBQ0EsU0FQQSxDQUFBOzs7QUFVQSxZQUFBLFNBQUEsR0FBQTs7QUFFQSw2QkFBQSxJQUFBLENBQUEsU0FBQSxVQUFBLEVBRkE7O0FBS0EsNkJBQUEsSUFBQSxDQUFBLFNBQUEsU0FBQTs7O0FBSUEsWUFBQSxlQUFBLGlCQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsT0FBQSxhQUFBLE9BQUEsQ0FBQSxLQUFBLFlBQUEsQ0FBQTs7QUFFQSxXQUFBLFFBQUEsQ0FBQSxhQUFBLFlBQUEsRUFBQSxJQUFBOztBQUVBLGFBQUEsU0FBQSxDQUFBLElBQUE7QUFDQTs7Ozs7O0FBT0EsU0FBQSxLQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxl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LEtBQUEsVUFBQSxDQUFBO0FBQ0E7Ozt5Q0FFQTtBQUNBLGlCQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxNQUFBO0FBQUEsdUJBQUEsT0FBQSxVQUFBLEVBQUE7QUFBQSxhQUFBO0FBQ0E7OztzQ0FDQTtBQUNBLGdCQUFBLG1CQUFBLEVBQUE7QUFDQSxpQkFBQSxPQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0Esb0JBQUEsQ0FBQSxPQUFBLE9BQUEsSUFBQSxPQUFBLEtBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EscUNBQUEsSUFBQSxDQUFBLE9BQUEsS0FBQTtBQUNBLG1DQUFBLElBQUE7QUFDQTtBQUNBLGFBTEE7QUFNQSxtQkFBQSxnQkFBQTtBQUNBOzs7b0NBRUE7QUFDQSxtQkFBQSxhQUFBLE1BQUEsSUFBQSxDQUFBO0FBQ0E7Ozs7Ozt5Q0FHQTtBQUNBLGdCQUFBLFdBQUEsS0FBQSxjQUFBLEVBQUEsTUFBQSxHQUFBLENBQUEsRUFBQTtBQUNBLG9CQUFBLFNBQUEsS0FBQSxVQUFBLEdBQUEsQ0FBQTtBQUNBLHVCQUFBLENBQUEsS0FBQSxjQUFBLENBQUEsU0FBQSxDQUFBLEVBQUEsT0FBQSxFQUFBO0FBQ0E7QUFDQTtBQUNBLHFCQUFBLFVBQUEsR0FBQSxNQUFBO0FBQ0EsYUFOQSxNQU1BO0FBQ0EscUJBQUEsVUFBQSxHQUFBLENBQUEsQ0FBQTtBQUNBO0FBQ0EsbUJBQUEsS0FBQSxnQkFBQSxFQUFBO0FBQ0E7Ozs7OztnQ0FHQTtBQUFBOztBQUNBLGlCQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsa0JBQUE7OztBQUdBLHNCQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxLQUFBLEVBQUEsT0FBQTtBQUNBLHVCQUFBLEtBQUEsR0FBQSxFQUFBOztBQUVBLHVCQUFBLE9BQUEsR0FBQSxJQUFBO0FBQ0EsYUFQQTtBQVFBOzs7Ozs7Ozs7OztBQU9BLElBQUEsYUFBQSxTQUFBLFVBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLFFBQUEsTUFBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0EsZUFBQSxPQUFBLE9BQUE7QUFDQSxLQUZBLENBQUE7QUFHQSxDQUpBO0FDNUVBLE1BQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLGFBQUEsaUJBREE7QUFFQSxxQkFBQSw0QkFGQTtBQUdBLG9CQUFBO0FBSEEsS0FBQTtBQUtBLENBTkE7O0FBUUEsTUFBQSxVQUFBLENBQUEsVUFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLGFBQUEsRUFBQSxXQUFBLEVBQUEsWUFBQSxFQUFBLGVBQUEsRUFBQTtBQUNBLFFBQUEsT0FBQSxlQUFBO0FBQ0EsUUFBQSxlQUFBLE9BQUEsT0FBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLFFBQUEsVUFBQSxjQUFBLFFBQUEsR0FBQSxhQUFBLFFBQUE7QUFDQSxRQUFBLFVBQUEsSUFBQSxRQUFBLENBQUEsVUFBQSxjQUFBLENBQUE7QUFDQSxRQUFBLGFBQUEsSUFBQSxRQUFBLENBQUEsVUFBQSxVQUFBLENBQUE7QUFDQSxRQUFBLGFBQUEsSUFBQSxRQUFBLENBQUEsVUFBQSxtQkFBQSxDQUFBOzs7QUFHQSxXQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxhQUFBLFFBQUEsRUFBQSxhQUFBLElBQUEsQ0FBQTs7QUFFQSxXQUFBLElBQUEsQ0FBQSxJQUFBLEdBQUEsZ0JBQUEsT0FBQSxDQUFBOztBQUdBLGVBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxVQUFBLGdCQUFBLEVBQUE7QUFDQSxlQUFBLGdCQUFBLEdBQUEsT0FBQSxJQUFBLENBQUEsZ0JBQUEsRUFBQSxHQUFBLENBQUEsVUFBQSxDQUFBLEVBQUE7O0FBRUEsbUJBQUEsaUJBQUEsQ0FBQSxDQUFBO0FBQ0EsU0FIQSxDQUFBO0FBSUEsS0FMQTs7QUFPQSxRQUFBLFFBQUEsT0FBQSxJQUFBLENBQUEsS0FBQTs7O0FBSUEsZUFBQSxFQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0EsWUFBQSxZQUFBLElBQUEsTUFBQSxDQUFBLE9BQUEsR0FBQSxDQUFBO0FBQ0Esa0JBQUEsTUFBQSxHQUFBLE9BQUEsTUFBQTs7QUFFQSxZQUFBLElBQUEsT0FBQSxnQkFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsSUFBQSxPQUFBLGdCQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxjQUFBLE9BQUEsZ0JBQUEsQ0FBQSxDQUFBLENBQUE7O0FBRUEsa0JBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxNQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0Esa0JBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLGtCQUFBLG9CQUFBLEdBQUEsT0FBQSxnQkFBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSxrQkFBQSxLQUFBLEdBQUEsT0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsRUFBQTs7QUFFQSxlQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLFNBQUE7QUFDQSxLQWZBOzs7QUFrQkEsV0FBQSxFQUFBLEdBQUEsT0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGVBQUEsT0FBQSxHQUFBLEtBQUEsYUFBQSxHQUFBO0FBQ0EsS0FGQSxFQUVBLENBRkEsQ0FBQTs7O0FBTUEsV0FBQSxVQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsTUFBQSxHQUFBLE1BQUE7QUFDQSxZQUFBLFVBQUEsZUFBQSxVQUFBLENBQUE7QUFDQSxZQUFBLE1BQUEsUUFBQSxPQUFBLENBQUEsTUFBQSxDQUFBO0FBQ0EsZ0JBQUEsT0FBQSxDQUFBLFFBQUEsR0FBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0Esb0JBQUEsR0FBQSxDQUFBLElBQUEsR0FBQTtBQUNBLFNBRkE7QUFHQSxLQVBBOzs7O0FBV0EsV0FBQSxXQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsV0FBQSxDQUFBLEtBQUE7QUFDQSxlQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsTUFBQTs7QUFFQSxnQkFBQSxLQUFBLENBQUEsU0FBQSxFQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxJQUFBLENBQUE7QUFDQSxzQkFBQSxPQUFBLE1BREE7QUFFQSxnQ0FBQSxPQUFBO0FBRkEsU0FBQTtBQUlBLEtBUkE7Ozs7O0FBYUEsUUFBQSxVQUFBLElBQUEsUUFBQSxDQUFBLFVBQUEsUUFBQSxDQUFBO0FBQ0EsWUFBQSxFQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsYUFBQSxFQUFBLFlBQUEsRUFBQTs7QUFFQSxnQkFBQSxHQUFBLENBQUEsd0JBQUEsRUFBQSxhQUFBOztBQUVBLFlBQUEsY0FBQSxJQUFBLEtBQUEsWUFBQSxFQUFBO0FBQ0EsbUJBQUEsSUFBQSxDQUFBLElBQUEsR0FBQSxjQUFBLFVBQUE7QUFDQSxTQUZBLE1BRUE7QUFDQSxtQkFBQSxTQUFBLENBQUEsY0FBQSxJQUFBO0FBQ0E7QUFDQSxLQVRBOzs7Ozs7Ozs7O0FBbUJBLFdBQUEsYUFBQSxHQUFBLE9BQUEsSUFBQSxDQUFBLGdCQUFBLEVBQUE7OztBQUdBLFdBQUEsY0FBQSxHQUFBLE9BQUEsSUFBQSxDQUFBLFVBQUEsRUFBQTs7O0FBR0EsV0FBQSxNQUFBO0FBQ0EsUUFBQSx3QkFBQSxFQUFBOztBQUdBLFdBQUEsS0FBQSxHQUFBLFlBQUE7O0FBRUEsS0FGQTs7QUFJQSxXQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsZUFBQSxFQUFBLEtBQUEsT0FBQSxhQUFBO0FBQ0EsS0FGQTs7O0FBS0EsV0FBQSxZQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLFFBQUE7QUFDQSxZQUFBLEtBQUEsUUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLFFBQUEsR0FBQSxDQUFBO0FBQ0EsS0FIQTs7QUFLQSxXQUFBLGFBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsUUFBQTtBQUNBLFlBQUEsS0FBQSxRQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxRQUFBLEdBQUEsQ0FBQTtBQUNBLEtBSEE7Ozs7QUFPQSxXQUFBLFNBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTs7QUFFQSxZQUFBLEtBQUEsUUFBQSxHQUFBLENBQUEsRUFBQTtBQUNBLGlCQUFBLEtBQUEsR0FBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxVQUFBLEVBQUE7QUFDQSx1QkFBQSxhQUFBLENBQUE7QUFDQSxhQUZBLENBQUE7QUFHQSxpQkFBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGlCQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsU0FOQSxNQU1BLElBQUEsS0FBQSxRQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxHQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQTtBQUNBLHVCQUFBLGFBQUEsQ0FBQTtBQUNBLGFBRkEsQ0FBQTtBQUdBLGlCQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQTs7QUFFQSxlQUFBLEVBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQTtBQUNBLGdCQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsSUFBQSxDQUFBO0FBQ0Esb0JBQUEsV0FEQTtBQUVBLG9CQUFBO0FBRkEsU0FBQTs7QUFLQSxlQUFBLElBQUEsQ0FBQSxjQUFBOztBQUVBLFlBQUEsT0FBQSxJQUFBLENBQUEsU0FBQSxFQUFBLEVBQUE7O0FBRUEsbUJBQUEsTUFBQSxHQUFBLE9BQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxtQkFBQSxRQUFBLEdBQUEsSUFBQTtBQUNBLFNBSkEsTUFJQTs7QUFFQSxnQkFBQSxPQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsTUFBQSxFQUFBO0FBQ0EsdUJBQUEsTUFBQSxHQUFBLE9BQUEsRUFBQTtBQUNBLGFBRkEsTUFFQSxJQUFBLE9BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLEtBQUEsQ0FBQSxJQUFBLE9BQUEsTUFBQSxFQUFBO0FBQ0Esc0NBQUEsSUFBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLGFBRkEsTUFFQTs7QUFFQSx1QkFBQSxFQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSxvQkFBQSxPQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsTUFBQSxFQUFBOztBQUVBLDJCQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsT0FBQSxDQUFBLFVBQUEsZUFBQSxFQUFBO0FBQ0Esd0NBQUEsT0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsbUNBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQTtBQUNBLHlCQUZBO0FBR0EscUJBSkE7QUFLQSwyQkFBQSxJQUFBLENBQUEsSUFBQSxHQUFBLE9BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEVBQUE7O0FBRUEsNEJBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxJQUFBLENBQUE7QUFDQSxnQ0FBQSxZQURBO0FBRUEsc0NBQUEsT0FBQSxJQUFBLENBQUE7QUFGQSxxQkFBQTtBQUlBLHdCQUFBLE9BQUEsTUFBQSxFQUFBO0FBQ0EsK0JBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSwrQkFBQSxNQUFBLEdBQUEsSUFBQTs7QUFFQSwrQkFBQSxPQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxJQUFBLE9BQUEscUJBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxtQ0FBQSxxQkFBQSxDQUFBLEtBQUEsR0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQSw0QkFBQSxPQUFBLHFCQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsbUNBQUEsTUFBQSxHQUFBLE9BQUEscUJBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBLG1CQUFBLElBQUEsQ0FBQSxjQUFBO0FBQ0E7QUFDQSxLQW5FQTs7O0FBc0VBLFdBQUEsU0FBQTs7O0FBR0EsV0FBQSxLQUFBLEdBQUEsT0FBQSxJQUFBLENBQUEsS0FBQTs7QUFHQSxXQUFBLFFBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBLEVBR0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQSxFQUlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSkEsRUFLQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUxBLEVBTUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FOQSxFQU9BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUEEsRUFRQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVJBLEVBU0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FUQSxFQVVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVkEsRUFXQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVhBLEVBWUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FaQSxDQUFBO0FBY0EsV0FBQSxTQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQURBLEVBRUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQSxFQUdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEEsRUFJQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUpBLEVBS0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FMQSxFQU1BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTkEsRUFPQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVBBLEVBUUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FSQSxFQVNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVEEsRUFVQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVZBLEVBV0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FYQSxFQVlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWkEsQ0FBQTtBQWNBLFdBQUEsV0FBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBLEVBSUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FKQSxFQUtBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQU5BLEVBT0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FQQSxFQVFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUkEsRUFTQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVRBLEVBVUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FWQSxFQVdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWEEsRUFZQSxDQUFBLENBQUEsRUFB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QUFDQSx1QkFBQSxpQkFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsUUFBQSxFQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxRQUFBLENBQUE7O0FBRUEsZUFBQSxFQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0Esd0JBQUE7QUFEQSxTQUFBO0FBR0EsS0FwQkE7O0FBc0JBLFdBQUEsWUFBQSxHQUFBLFlBQUE7QUFDQSxlQUFBLEVBQUEsQ0FBQSxVQUFBO0FBQ0EsS0FGQTtBQUdBLENBL0JBOztBQ1JBOztBQUVBLFNBQUEsTUFBQSxDQUFBLEdBQUEsRUFBQTs7QUFFQSxTQUFBLEdBQUEsR0FBQSxHQUFBOztBQUVBLFNBQUEsTUFBQSxHQUFBLElBQUE7OztBQUdBLFNBQUEsS0FBQSxHQUFBLElBQUE7Ozs7QUFJQSxTQUFBLFNBQUEsR0FBQSxJQUFBOzs7QUFHQSxTQUFBLG9CQUFBLEdBQUEsSUFBQTs7O0FBR0EsU0FBQSxLQUFBLEdBQUEsRUFBQTs7O0FBR0EsU0FBQSxPQUFBLEdBQUEsSUFBQTtBQUNBOztBQUVBLE9BQUEsU0FBQSxDQUFBLFdBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUE7O0FBRUEsUUFBQSxJQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxJQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxjQUFBLE1BQUEsQ0FBQSxDQUFBOztBQUVBLFNBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxNQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsU0FBQSxLQUFBLENBQUEsU0FBQSxHQUFBLElBQUE7OztBQUdBLFNBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTs7O0FBR0EsU0FBQSxvQkFBQSxHQUFBLEtBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxLQUFBLENBQUE7QUFDQSxDQWRBOztBQWdCQSxPQUFBLFNBQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUEsUUFBQSxFQUFBO0FBQ0EsUUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLEVBQUE7QUFDQSxlQUFBLE1BQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQ0EsS0FGQSxNQUVBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxFQUFBO0FBQ0EsZUFBQSxNQUFBLFNBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLEtBRkEsTUFFQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsRUFBQTtBQUNBLGVBQUEsTUFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLENBQUE7QUFDQSxLQUZBLE1BRUE7QUFDQSxlQUFBLE1BQUEsU0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQSxDQVZBOztBQVlBLE9BQUEsU0FBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLFFBQUEsUUFBQSxLQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxLQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBOztBQUVBLFNBQUEsU0FBQSxDQUFBLE9BQUEsR0FBQSxLQUFBLFFBQUE7O0FBRUEsU0FBQSxJQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsS0FBQSxNQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxTQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQSxDQVRBOztBQVdBLE9BQUEsU0FBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLE9BQUEsRUFBQTs7OztBQUlBLFFBQUEsWUFBQSxRQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxlQUFBLENBQUEsU0FBQSxTQUFBO0FBQ0EsS0FGQSxFQUVBLENBRkEsQ0FBQTs7QUFJQSxXQUFBLFNBQUE7QUFDQSxDQVRBOztBQVdBLE9BQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxVQUFBLEtBQUEsTUFBQSxDQUFBLEtBQUEsS0FBQSxDQUFBO0FBQ0EsV0FBQSxPQUFBLEVBQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQSxTQUFBLEdBQUEsSUFBQTtBQUNBLGFBQUEsS0FBQSxHQUFBLEtBQUEsTUFBQSxDQUFBLEtBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxXQUFBLEtBQUEsU0FBQTtBQUNBLFlBQUEsV0FBQSxTQUFBLFFBQUEsQ0FBQTtBQUNBLGFBQUEsU0FBQSxHQUFBLFFBQUE7O0FBRUEsYUFBQSxVQUFBO0FBQ0Esa0JBQUEsS0FBQSxNQUFBLENBQUEsS0FBQSxLQUFBLENBQUE7QUFDQTtBQUNBLENBWkE7O0FBY0EsT0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLGVBQUEsS0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGVBQUEsU0FBQSxTQUFBO0FBQ0EsS0FGQSxDQUFBOztBQUlBLFFBQUEsS0FBQSxLQUFBLENBQUEsSUFBQSxJQUFBLGFBQUEsTUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLEdBQUE7QUFDQSxDQU5BOztBQVFBLE9BQUEsU0FBQSxDQUFBLEdBQUEsR0FBQSxZQUFBO0FBQ0EsU0FBQSxPQUFBLEdBQUEsS0FBQTs7QUFFQSxDQUhBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgdHN1cm8gPSBhbmd1bGFyLm1vZHVsZSgnVHN1cm8nLCBbJ3VpLnJvdXRlcicsICdmaXJlYmFzZSddKTtcblxudHN1cm8uY29uZmlnKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0ge1xuICAgICAgICBhcGlLZXk6IFwiQUl6YVN5Q0xtM2prazVwcE1xZVF4S29ILWRaOUNkWU1hREdXV3FVXCIsXG4gICAgICAgIGF1dGhEb21haW46IFwidGhlLXBhdGhzLW9mLWRyYWdvbnMuZmlyZWJhc2VhcHAuY29tXCIsXG4gICAgICAgIGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vdGhlLXBhdGhzLW9mLWRyYWdvbnMuZmlyZWJhc2Vpby5jb21cIixcbiAgICAgICAgc3RvcmFnZUJ1Y2tldDogXCJ0aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbVwiLFxuICAgIH07XG4gICAgZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChjb25maWcpO1xufSk7XG5cbnRzdXJvLmNvbnN0YW50KCdmaXJlYmFzZVVybCcsICdodHRwczovL3BhdGgtb2YtdGhlLWRyYWdvbi5maXJlYmFzZWlvLmNvbS8nKTtcblxudHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL01vc3RhZmEtU2FtaXIvVGljLVRhYy1Ub2UtQUkvYmxvYi9tYXN0ZXIvc2NyaXB0cy9haS5qc1xuXG4vKlxuICogQ29uc3RydWN0cyBhbiBhY3Rpb24gdGhhdCB0aGUgYWkgcGxheWVyIGNvdWxkIG1ha2VcbiAqIEBwYXJhbSBwb3MgW051bWJlcl06IHRoZSBjZWxsIHBvc2l0aW9uIHRoZSBhaSB3b3VsZCBtYWtlIGl0cyBhY3Rpb24gaW5cbiAqIG1hZGUgdGhhdCBhY3Rpb25cbiAqL1xudmFyIEFJQWN0aW9uID0gZnVuY3Rpb24ocG9zKSB7XG5cbiAgICAvLyBwdWJsaWMgOiB0aGUgcG9zaXRpb24gb24gdGhlIGJvYXJkIHRoYXQgdGhlIGFjdGlvbiB3b3VsZCBwdXQgdGhlIGxldHRlciBvblxuICAgIHRoaXMubW92ZVBvc2l0aW9uID0gcG9zO1xuXG4gICAgLy9wdWJsaWMgOiB0aGUgbWluaW1heCB2YWx1ZSBvZiB0aGUgc3RhdGUgdGhhdCB0aGUgYWN0aW9uIGxlYWRzIHRvIHdoZW4gYXBwbGllZFxuICAgIHRoaXMubWluaW1heFZhbCA9IDA7XG5cbiAgICAvKlxuICAgICAqIHB1YmxpYyA6IGFwcGxpZXMgdGhlIGFjdGlvbiB0byBhIHN0YXRlIHRvIGdldCB0aGUgbmV4dCBzdGF0ZVxuICAgICAqIEBwYXJhbSBzdGF0ZSBbU3RhdGVdOiB0aGUgc3RhdGUgdG8gYXBwbHkgdGhlIGFjdGlvbiB0b1xuICAgICAqIEByZXR1cm4gW1N0YXRlXTogdGhlIG5leHQgc3RhdGVcbiAgICAgKi9cbiAgICB0aGlzLmFwcGx5VG8gPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgICB2YXIgbmV4dCA9IG5ldyBTdGF0ZShzdGF0ZSk7XG5cbiAgICAgICAgLy9wdXQgdGhlIGxldHRlciBvbiB0aGUgYm9hcmRcbiAgICAgICAgbmV4dC5ib2FyZFt0aGlzLm1vdmVQb3NpdGlvbl0gPSBzdGF0ZS50dXJuO1xuXG4gICAgICAgIGlmKHN0YXRlLnR1cm4gPT09IFwiT1wiKVxuICAgICAgICAgICAgbmV4dC5vTW92ZXNDb3VudCsrO1xuXG4gICAgICAgIG5leHQuYWR2YW5jZVR1cm4oKTtcblxuICAgICAgICByZXR1cm4gbmV4dDtcbiAgICB9XG59O1xuXG4vKlxuICogcHVibGljIHN0YXRpYyBmdW5jdGlvbiB0aGF0IGRlZmluZXMgYSBydWxlIGZvciBzb3J0aW5nIEFJQWN0aW9ucyBpbiBhc2NlbmRpbmcgbWFubmVyXG4gKiBAcGFyYW0gZmlyc3RBY3Rpb24gW0FJQWN0aW9uXSA6IHRoZSBmaXJzdCBhY3Rpb24gaW4gYSBwYWlyd2lzZSBzb3J0XG4gKiBAcGFyYW0gc2Vjb25kQWN0aW9uIFtBSUFjdGlvbl06IHRoZSBzZWNvbmQgYWN0aW9uIGluIGEgcGFpcndpc2Ugc29ydFxuICogQHJldHVybiBbTnVtYmVyXTogLTEsIDEsIG9yIDBcbiAqL1xuQUlBY3Rpb24uQVNDRU5ESU5HID0gZnVuY3Rpb24oZmlyc3RBY3Rpb24sIHNlY29uZEFjdGlvbikge1xuICAgIGlmKGZpcnN0QWN0aW9uLm1pbmltYXhWYWwgPCBzZWNvbmRBY3Rpb24ubWluaW1heFZhbClcbiAgICAgICAgcmV0dXJuIC0xOyAvL2luZGljYXRlcyB0aGF0IGZpcnN0QWN0aW9uIGdvZXMgYmVmb3JlIHNlY29uZEFjdGlvblxuICAgIGVsc2UgaWYoZmlyc3RBY3Rpb24ubWluaW1heFZhbCA+IHNlY29uZEFjdGlvbi5taW5pbWF4VmFsKVxuICAgICAgICByZXR1cm4gMTsgLy9pbmRpY2F0ZXMgdGhhdCBzZWNvbmRBY3Rpb24gZ29lcyBiZWZvcmUgZmlyc3RBY3Rpb25cbiAgICBlbHNlXG4gICAgICAgIHJldHVybiAwOyAvL2luZGljYXRlcyBhIHRpZVxufVxuXG4vKlxuICogcHVibGljIHN0YXRpYyBmdW5jdGlvbiB0aGF0IGRlZmluZXMgYSBydWxlIGZvciBzb3J0aW5nIEFJQWN0aW9ucyBpbiBkZXNjZW5kaW5nIG1hbm5lclxuICogQHBhcmFtIGZpcnN0QWN0aW9uIFtBSUFjdGlvbl0gOiB0aGUgZmlyc3QgYWN0aW9uIGluIGEgcGFpcndpc2Ugc29ydFxuICogQHBhcmFtIHNlY29uZEFjdGlvbiBbQUlBY3Rpb25dOiB0aGUgc2Vjb25kIGFjdGlvbiBpbiBhIHBhaXJ3aXNlIHNvcnRcbiAqIEByZXR1cm4gW051bWJlcl06IC0xLCAxLCBvciAwXG4gKi9cbkFJQWN0aW9uLkRFU0NFTkRJTkcgPSBmdW5jdGlvbihmaXJzdEFjdGlvbiwgc2Vjb25kQWN0aW9uKSB7XG4gICAgaWYoZmlyc3RBY3Rpb24ubWluaW1heFZhbCA+IHNlY29uZEFjdGlvbi5taW5pbWF4VmFsKVxuICAgICAgICByZXR1cm4gLTE7IC8vaW5kaWNhdGVzIHRoYXQgZmlyc3RBY3Rpb24gZ29lcyBiZWZvcmUgc2Vjb25kQWN0aW9uXG4gICAgZWxzZSBpZihmaXJzdEFjdGlvbi5taW5pbWF4VmFsIDwgc2Vjb25kQWN0aW9uLm1pbmltYXhWYWwpXG4gICAgICAgIHJldHVybiAxOyAvL2luZGljYXRlcyB0aGF0IHNlY29uZEFjdGlvbiBnb2VzIGJlZm9yZSBmaXJzdEFjdGlvblxuICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIDA7IC8vaW5kaWNhdGVzIGEgdGllXG59XG5cblxuLypcbiAqIENvbnN0cnVjdHMgYW4gQUkgcGxheWVyIHdpdGggYSBzcGVjaWZpYyBsZXZlbCBvZiBpbnRlbGxpZ2VuY2VcbiAqIEBwYXJhbSBsZXZlbCBbU3RyaW5nXTogdGhlIGRlc2lyZWQgbGV2ZWwgb2YgaW50ZWxsaWdlbmNlXG4gKi9cbnZhciBBSSA9IGZ1bmN0aW9uKGxldmVsKSB7XG5cbiAgICAvL3ByaXZhdGUgYXR0cmlidXRlOiBsZXZlbCBvZiBpbnRlbGxpZ2VuY2UgdGhlIHBsYXllciBoYXNcbiAgICB2YXIgbGV2ZWxPZkludGVsbGlnZW5jZSA9IGxldmVsO1xuXG4gICAgLy9wcml2YXRlIGF0dHJpYnV0ZTogdGhlIGdhbWUgdGhlIHBsYXllciBpcyBwbGF5aW5nXG4gICAgdmFyIGdhbWUgPSB7fTtcblxuICAgIC8qXG4gICAgICogcHJpdmF0ZSByZWN1cnNpdmUgZnVuY3Rpb24gdGhhdCBjb21wdXRlcyB0aGUgbWluaW1heCB2YWx1ZSBvZiBhIGdhbWUgc3RhdGVcbiAgICAgKiBAcGFyYW0gc3RhdGUgW1N0YXRlXSA6IHRoZSBzdGF0ZSB0byBjYWxjdWxhdGUgaXRzIG1pbmltYXggdmFsdWVcbiAgICAgKiBAcmV0dXJucyBbTnVtYmVyXTogdGhlIG1pbmltYXggdmFsdWUgb2YgdGhlIHN0YXRlXG4gICAgICovXG4gICAgZnVuY3Rpb24gbWluaW1heFZhbHVlKHN0YXRlKSB7XG4gICAgICAgIGlmKHN0YXRlLmlzVGVybWluYWwoKSkge1xuICAgICAgICAgICAgLy9hIHRlcm1pbmFsIGdhbWUgc3RhdGUgaXMgdGhlIGJhc2UgY2FzZVxuICAgICAgICAgICAgcmV0dXJuIEdhbWUuc2NvcmUoc3RhdGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIHN0YXRlU2NvcmU7IC8vIHRoaXMgc3RvcmVzIHRoZSBtaW5pbWF4IHZhbHVlIHdlJ2xsIGNvbXB1dGVcblxuICAgICAgICAgICAgaWYoc3RhdGUudHVybiA9PT0gXCJYXCIpXG4gICAgICAgICAgICAvLyBYIHdhbnRzIHRvIG1heGltaXplIC0tPiBpbml0aWFsaXplIHRvIGEgdmFsdWUgc21hbGxlciB0aGFuIGFueSBwb3NzaWJsZSBzY29yZVxuICAgICAgICAgICAgICAgIHN0YXRlU2NvcmUgPSAtMTAwMDtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIC8vIE8gd2FudHMgdG8gbWluaW1pemUgLS0+IGluaXRpYWxpemUgdG8gYSB2YWx1ZSBsYXJnZXIgdGhhbiBhbnkgcG9zc2libGUgc2NvcmVcbiAgICAgICAgICAgICAgICBzdGF0ZVNjb3JlID0gMTAwMDtcblxuICAgICAgICAgICAgdmFyIGF2YWlsYWJsZVBvc2l0aW9ucyA9IHN0YXRlLmVtcHR5Q2VsbHMoKTtcblxuICAgICAgICAgICAgLy9lbnVtZXJhdGUgbmV4dCBhdmFpbGFibGUgc3RhdGVzIHVzaW5nIHRoZSBpbmZvIGZvcm0gYXZhaWxhYmxlIHBvc2l0aW9uc1xuICAgICAgICAgICAgdmFyIGF2YWlsYWJsZU5leHRTdGF0ZXMgPSBhdmFpbGFibGVQb3NpdGlvbnMubWFwKGZ1bmN0aW9uKHBvcykge1xuICAgICAgICAgICAgICAgIHZhciBhY3Rpb24gPSBuZXcgQUlBY3Rpb24ocG9zKTtcblxuICAgICAgICAgICAgICAgIHZhciBuZXh0U3RhdGUgPSBhY3Rpb24uYXBwbHlUbyhzdGF0ZSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbmV4dFN0YXRlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8qIGNhbGN1bGF0ZSB0aGUgbWluaW1heCB2YWx1ZSBmb3IgYWxsIGF2YWlsYWJsZSBuZXh0IHN0YXRlc1xuICAgICAgICAgICAgICogYW5kIGV2YWx1YXRlIHRoZSBjdXJyZW50IHN0YXRlJ3MgdmFsdWUgKi9cbiAgICAgICAgICAgIGF2YWlsYWJsZU5leHRTdGF0ZXMuZm9yRWFjaChmdW5jdGlvbihuZXh0U3RhdGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV4dFNjb3JlID0gbWluaW1heFZhbHVlKG5leHRTdGF0ZSk7XG4gICAgICAgICAgICAgICAgaWYoc3RhdGUudHVybiA9PT0gXCJYXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gWCB3YW50cyB0byBtYXhpbWl6ZSAtLT4gdXBkYXRlIHN0YXRlU2NvcmUgaWZmIG5leHRTY29yZSBpcyBsYXJnZXJcbiAgICAgICAgICAgICAgICAgICAgaWYobmV4dFNjb3JlID4gc3RhdGVTY29yZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlU2NvcmUgPSBuZXh0U2NvcmU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBPIHdhbnRzIHRvIG1pbmltaXplIC0tPiB1cGRhdGUgc3RhdGVTY29yZSBpZmYgbmV4dFNjb3JlIGlzIHNtYWxsZXJcbiAgICAgICAgICAgICAgICAgICAgaWYobmV4dFNjb3JlIDwgc3RhdGVTY29yZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlU2NvcmUgPSBuZXh0U2NvcmU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBzdGF0ZVNjb3JlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBwcml2YXRlIGZ1bmN0aW9uOiBtYWtlIHRoZSBhaSBwbGF5ZXIgdGFrZSBhIGJsaW5kIG1vdmVcbiAgICAgKiB0aGF0IGlzOiBjaG9vc2UgdGhlIGNlbGwgdG8gcGxhY2UgaXRzIHN5bWJvbCByYW5kb21seVxuICAgICAqIEBwYXJhbSB0dXJuIFtTdHJpbmddOiB0aGUgcGxheWVyIHRvIHBsYXksIGVpdGhlciBYIG9yIE9cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0YWtlQUJsaW5kTW92ZSh0dXJuKSB7XG4gICAgICAgIHZhciBhdmFpbGFibGUgPSBnYW1lLmN1cnJlbnRTdGF0ZS5lbXB0eUNlbGxzKCk7XG4gICAgICAgIHZhciByYW5kb21DZWxsID0gYXZhaWxhYmxlW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGF2YWlsYWJsZS5sZW5ndGgpXTtcbiAgICAgICAgdmFyIGFjdGlvbiA9IG5ldyBBSUFjdGlvbihyYW5kb21DZWxsKTtcblxuICAgICAgICB2YXIgbmV4dCA9IGFjdGlvbi5hcHBseVRvKGdhbWUuY3VycmVudFN0YXRlKTtcblxuICAgICAgICB1aS5pbnNlcnRBdChyYW5kb21DZWxsLCB0dXJuKTtcblxuICAgICAgICBnYW1lLmFkdmFuY2VUbyhuZXh0KTtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIHByaXZhdGUgZnVuY3Rpb246IG1ha2UgdGhlIGFpIHBsYXllciB0YWtlIGEgbm92aWNlIG1vdmUsXG4gICAgICogdGhhdCBpczogbWl4IGJldHdlZW4gY2hvb3NpbmcgdGhlIG9wdGltYWwgYW5kIHN1Ym9wdGltYWwgbWluaW1heCBkZWNpc2lvbnNcbiAgICAgKiBAcGFyYW0gdHVybiBbU3RyaW5nXTogdGhlIHBsYXllciB0byBwbGF5LCBlaXRoZXIgWCBvciBPXG4gICAgICovXG4gICAgZnVuY3Rpb24gdGFrZUFOb3ZpY2VNb3ZlKHR1cm4pIHtcbiAgICAgICAgdmFyIGF2YWlsYWJsZSA9IGdhbWUuY3VycmVudFN0YXRlLmVtcHR5Q2VsbHMoKTtcblxuICAgICAgICAvL2VudW1lcmF0ZSBhbmQgY2FsY3VsYXRlIHRoZSBzY29yZSBmb3IgZWFjaCBhdmFpbGFibGUgYWN0aW9ucyB0byB0aGUgYWkgcGxheWVyXG4gICAgICAgIHZhciBhdmFpbGFibGVBY3Rpb25zID0gYXZhaWxhYmxlLm1hcChmdW5jdGlvbihwb3MpIHtcbiAgICAgICAgICAgIHZhciBhY3Rpb24gPSAgbmV3IEFJQWN0aW9uKHBvcyk7IC8vY3JlYXRlIHRoZSBhY3Rpb24gb2JqZWN0XG4gICAgICAgICAgICB2YXIgbmV4dFN0YXRlID0gYWN0aW9uLmFwcGx5VG8oZ2FtZS5jdXJyZW50U3RhdGUpOyAvL2dldCBuZXh0IHN0YXRlIGJ5IGFwcGx5aW5nIHRoZSBhY3Rpb25cblxuICAgICAgICAgICAgYWN0aW9uLm1pbmltYXhWYWwgPSBtaW5pbWF4VmFsdWUobmV4dFN0YXRlKTsgLy9jYWxjdWxhdGUgYW5kIHNldCB0aGUgYWN0aW9uJ3MgbWluaW1heCB2YWx1ZVxuXG4gICAgICAgICAgICByZXR1cm4gYWN0aW9uO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL3NvcnQgdGhlIGVudW1lcmF0ZWQgYWN0aW9ucyBsaXN0IGJ5IHNjb3JlXG4gICAgICAgIGlmKHR1cm4gPT09IFwiWFwiKVxuICAgICAgICAvL1ggbWF4aW1pemVzIC0tPiBzb3J0IHRoZSBhY3Rpb25zIGluIGEgZGVzY2VuZGluZyBtYW5uZXIgdG8gaGF2ZSB0aGUgYWN0aW9uIHdpdGggbWF4aW11bSBtaW5pbWF4IGF0IGZpcnN0XG4gICAgICAgICAgICBhdmFpbGFibGVBY3Rpb25zLnNvcnQoQUlBY3Rpb24uREVTQ0VORElORyk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgLy9PIG1pbmltaXplcyAtLT4gc29ydCB0aGUgYWN0aW9ucyBpbiBhbiBhc2NlbmRpbmcgbWFubmVyIHRvIGhhdmUgdGhlIGFjdGlvbiB3aXRoIG1pbmltdW0gbWluaW1heCBhdCBmaXJzdFxuICAgICAgICAgICAgYXZhaWxhYmxlQWN0aW9ucy5zb3J0KEFJQWN0aW9uLkFTQ0VORElORyk7XG5cbiAgICAgICAgLypcbiAgICAgICAgICogdGFrZSB0aGUgb3B0aW1hbCBhY3Rpb24gNDAlIG9mIHRoZSB0aW1lLCBhbmQgdGFrZSB0aGUgMXN0IHN1Ym9wdGltYWwgYWN0aW9uIDYwJSBvZiB0aGUgdGltZVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGNob3NlbkFjdGlvbjtcbiAgICAgICAgaWYoTWF0aC5yYW5kb20oKSoxMDAgPD0gNDApIHtcbiAgICAgICAgICAgIGNob3NlbkFjdGlvbiA9IGF2YWlsYWJsZUFjdGlvbnNbMF07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZihhdmFpbGFibGVBY3Rpb25zLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgICAgICAgLy9pZiB0aGVyZSBpcyB0d28gb3IgbW9yZSBhdmFpbGFibGUgYWN0aW9ucywgY2hvb3NlIHRoZSAxc3Qgc3Vib3B0aW1hbFxuICAgICAgICAgICAgICAgIGNob3NlbkFjdGlvbiA9IGF2YWlsYWJsZUFjdGlvbnNbMV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvL2Nob29zZSB0aGUgb25seSBhdmFpbGFibGUgYWN0aW9uc1xuICAgICAgICAgICAgICAgIGNob3NlbkFjdGlvbiA9IGF2YWlsYWJsZUFjdGlvbnNbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5leHQgPSBjaG9zZW5BY3Rpb24uYXBwbHlUbyhnYW1lLmN1cnJlbnRTdGF0ZSk7XG5cbiAgICAgICAgdWkuaW5zZXJ0QXQoY2hvc2VuQWN0aW9uLm1vdmVQb3NpdGlvbiwgdHVybik7XG5cbiAgICAgICAgZ2FtZS5hZHZhbmNlVG8obmV4dCk7XG4gICAgfTtcblxuICAgIC8qXG4gICAgICogcHJpdmF0ZSBmdW5jdGlvbjogbWFrZSB0aGUgYWkgcGxheWVyIHRha2UgYSBtYXN0ZXIgbW92ZSxcbiAgICAgKiB0aGF0IGlzOiBjaG9vc2UgdGhlIG9wdGltYWwgbWluaW1heCBkZWNpc2lvblxuICAgICAqIEBwYXJhbSB0dXJuIFtTdHJpbmddOiB0aGUgcGxheWVyIHRvIHBsYXksIGVpdGhlciBYIG9yIE9cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0YWtlQU1hc3Rlck1vdmUodHVybikge1xuICAgICAgICB2YXIgYXZhaWxhYmxlID0gZ2FtZS5jdXJyZW50U3RhdGUuZW1wdHlDZWxscygpO1xuXG4gICAgICAgIC8vZW51bWVyYXRlIGFuZCBjYWxjdWxhdGUgdGhlIHNjb3JlIGZvciBlYWNoIGF2YWlhbGFibGUgYWN0aW9ucyB0byB0aGUgYWkgcGxheWVyXG4gICAgICAgIHZhciBhdmFpbGFibGVBY3Rpb25zID0gYXZhaWxhYmxlLm1hcChmdW5jdGlvbihwb3MpIHtcbiAgICAgICAgICAgIHZhciBhY3Rpb24gPSAgbmV3IEFJQWN0aW9uKHBvcyk7IC8vY3JlYXRlIHRoZSBhY3Rpb24gb2JqZWN0XG4gICAgICAgICAgICB2YXIgbmV4dCA9IGFjdGlvbi5hcHBseVRvKGdhbWUuY3VycmVudFN0YXRlKTsgLy9nZXQgbmV4dCBzdGF0ZSBieSBhcHBseWluZyB0aGUgYWN0aW9uXG5cbiAgICAgICAgICAgIGFjdGlvbi5taW5pbWF4VmFsID0gbWluaW1heFZhbHVlKG5leHQpOyAvL2NhbGN1bGF0ZSBhbmQgc2V0IHRoZSBhY3Rpb24ncyBtaW5tYXggdmFsdWVcblxuICAgICAgICAgICAgcmV0dXJuIGFjdGlvbjtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9zb3J0IHRoZSBlbnVtZXJhdGVkIGFjdGlvbnMgbGlzdCBieSBzY29yZVxuICAgICAgICBpZih0dXJuID09PSBcIlhcIilcbiAgICAgICAgLy9YIG1heGltaXplcyAtLT4gc29ydCB0aGUgYWN0aW9ucyBpbiBhIGRlc2NlbmRpbmcgbWFubmVyIHRvIGhhdmUgdGhlIGFjdGlvbiB3aXRoIG1heGltdW0gbWluaW1heCBhdCBmaXJzdFxuICAgICAgICAgICAgYXZhaWxhYmxlQWN0aW9ucy5zb3J0KEFJQWN0aW9uLkRFU0NFTkRJTkcpO1xuICAgICAgICBlbHNlXG4gICAgICAgIC8vTyBtaW5pbWl6ZXMgLS0+IHNvcnQgdGhlIGFjdGlvbnMgaW4gYW4gYXNjZW5kaW5nIG1hbm5lciB0byBoYXZlIHRoZSBhY3Rpb24gd2l0aCBtaW5pbXVtIG1pbmltYXggYXQgZmlyc3RcbiAgICAgICAgICAgIGF2YWlsYWJsZUFjdGlvbnMuc29ydChBSUFjdGlvbi5BU0NFTkRJTkcpO1xuXG5cbiAgICAgICAgLy90YWtlIHRoZSBmaXJzdCBhY3Rpb24gYXMgaXQncyB0aGUgb3B0aW1hbFxuICAgICAgICB2YXIgY2hvc2VuQWN0aW9uID0gYXZhaWxhYmxlQWN0aW9uc1swXTtcbiAgICAgICAgdmFyIG5leHQgPSBjaG9zZW5BY3Rpb24uYXBwbHlUbyhnYW1lLmN1cnJlbnRTdGF0ZSk7XG5cbiAgICAgICAgdWkuaW5zZXJ0QXQoY2hvc2VuQWN0aW9uLm1vdmVQb3NpdGlvbiwgdHVybik7XG5cbiAgICAgICAgZ2FtZS5hZHZhbmNlVG8obmV4dCk7XG4gICAgfVxuXG5cbiAgICAvKlxuICAgICAqIHB1YmxpYyBtZXRob2QgdG8gc3BlY2lmeSB0aGUgZ2FtZSB0aGUgYWkgcGxheWVyIHdpbGwgcGxheVxuICAgICAqIEBwYXJhbSBfZ2FtZSBbR2FtZV0gOiB0aGUgZ2FtZSB0aGUgYWkgd2lsbCBwbGF5XG4gICAgICovXG4gICAgdGhpcy5wbGF5cyA9IGZ1bmN0aW9uKF9nYW1lKXtcbiAgICAgICAgZ2FtZSA9IF9nYW1lO1xuICAgIH07XG5cbiAgICAvKlxuICAgICAqIHB1YmxpYyBmdW5jdGlvbjogbm90aWZ5IHRoZSBhaSBwbGF5ZXIgdGhhdCBpdCdzIGl0cyB0dXJuXG4gICAgICogQHBhcmFtIHR1cm4gW1N0cmluZ106IHRoZSBwbGF5ZXIgdG8gcGxheSwgZWl0aGVyIFggb3IgT1xuICAgICAqL1xuICAgIHRoaXMubm90aWZ5ID0gZnVuY3Rpb24odHVybikge1xuICAgICAgICBzd2l0Y2gobGV2ZWxPZkludGVsbGlnZW5jZSkge1xuICAgICAgICAgICAgLy9pbnZva2UgdGhlIGRlc2lyZWQgYmVoYXZpb3IgYmFzZWQgb24gdGhlIGxldmVsIGNob3NlblxuICAgICAgICAgICAgY2FzZSBcImJsaW5kXCI6IHRha2VBQmxpbmRNb3ZlKHR1cm4pOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJub3ZpY2VcIjogdGFrZUFOb3ZpY2VNb3ZlKHR1cm4pOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJtYXN0ZXJcIjogdGFrZUFNYXN0ZXJNb3ZlKHR1cm4pOyBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG59O1xuIiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdnYW1lbGlzdCcsIHtcbiAgICAgICAgdXJsOiAnL2dhbWVsaXN0JyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvYnJvd3Nlci9qcy9nYW1lbGlzdC9nYW1lbGlzdC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2dhbWVMaXN0JyxcbiAgICB9KTtcbn0pO1xuXG50c3Vyby5jb250cm9sbGVyKCdnYW1lTGlzdCcsIGZ1bmN0aW9uICgkc2NvcGUsIGZpcmViYXNlVXJsLCAkZmlyZWJhc2VPYmplY3QsICRzdGF0ZSkge1xuICAgIC8vRm9yIHN5bmNocm9uaXppbmdHYW1lTGlzdC4uLlxuICAgIHZhciByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xuICAgIHZhciBvYmogPSAkZmlyZWJhc2VPYmplY3QocmVmKTtcblxuICAgIHZhciBzeW5jaFJlZiA9IHJlZi5jaGlsZChcImdhbWVzXCIpO1xuICAgIGNvbnNvbGUubG9nKHN5bmNoUmVmKTtcblxuICAgIHZhciBzeW5jaHJvbml6ZWRPYmogPSAkZmlyZWJhc2VPYmplY3Qoc3luY2hSZWYpO1xuICAgIGNvbnNvbGUubG9nKHN5bmNocm9uaXplZE9iailcblxuICAgIC8vIFRoaXMgcmV0dXJucyBhIHByb21pc2UuLi55b3UgY2FuLnRoZW4oKSBhbmQgYXNzaWduIHZhbHVlIHRvICRzY29wZS52YXJpYWJsZVxuICAgIC8vIGdhbWVsaXN0IGlzIHdoYXRldmVyIHdlIGFyZSBjYWxsaW5nIGl0IGluIHRoZSBhbmd1bGFyIGh0bWwuXG4gICAgc3luY2hyb25pemVkT2JqLiRiaW5kVG8oJHNjb3BlLCBcImdhbWVsaXN0XCIpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBnYW1lbGlzdCA9IFtdXG4gICAgICAgICAgICBmb3IgKHZhciBpIGluICRzY29wZS5nYW1lbGlzdCkge1xuICAgICAgICAgICAgICAgIGdhbWVsaXN0LnB1c2goW2ksICRzY29wZS5nYW1lbGlzdFtpXV0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkc2NvcGUuZ2FtZU5hbWVzID0gZ2FtZWxpc3Quc2xpY2UoMik7XG4gICAgICAgIH0pXG5cblxuICAgICRzY29wZS5qb2luID0gZnVuY3Rpb24gKGdhbWVOYW1lKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGdhbWVOYW1lKVxuICAgICAgICAkc3RhdGUuZ28oJ2dhbWUnLCB7XG4gICAgICAgICAgICBcImdhbWVOYW1lXCI6IGdhbWVOYW1lXG4gICAgICAgIH0pO1xuICAgIH07XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY2xhc3MgRGVjayB7XG4gICAgY29uc3RydWN0b3IodGlsZXMpIHtcbiAgICAgICAgdGhpcy50aWxlcyA9IHRpbGVzXG4gICAgfVxuXG4gICAgc2h1ZmZsZSgpIHtcbiAgICAgICAgdGhpcy50aWxlcyA9IF8uc2h1ZmZsZSh0aGlzLnRpbGVzKVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBkZWFsVGhyZWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGVzLnNwbGljZSgwLCAzKTtcbiAgICB9XG5cbiAgICBkZWFsKG51bSkge1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlcy5zcGxpY2UoMCwgbnVtKTtcbiAgICB9XG5cbiAgICByZWxvYWQodGlsZXMpIHtcbiAgICAgICAgdGhpcy50aWxlcy5wdXNoKHRpbGVzKVxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLy9HQU1FLy8vXG5cbmNsYXNzIEdhbWUge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUpIHtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5jb3VudCA9IDM1O1xuICAgICAgICB0aGlzLmJvYXJkID0gbmV3IEJvYXJkKCk7XG4gICAgICAgIHRoaXMucGxheWVycyA9IFtdO1xuICAgICAgICB0aGlzLmF2YWlsYWJsZU1hcmtlcnMgPSBbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJ5ZWxsb3dcIiwgXCJncmVlblwiLCBcImFxdWFcIiwgXCJibHVlXCIsIFwibmF2eVwiLCBcInB1cnBsZVwiXVxuXG4gICAgICAgIHRoaXMuY3VyclBsYXllcjsgLy9pbmRleCBvZiB0aGUgY3VycmVudFBsYXllciBpbiB0aGUgdHVybk9yZGVyQXJyYXlcbiAgICAgICAgdGhpcy50dXJuT3JkZXJBcnJheSA9IFtdIC8vaG9sZHMgYWxsIHRoZSBwbGF5ZXJzIHN0aWxsIG9uIHRoZSBib2FyZC5cbiAgICAgICAgdGhpcy5kcmFnb24gPSBcIlwiOyAvLyBQbGF5ZXIuTWFya2VyXG4gICAgICAgIHRoaXMubW92ZXM7XG4gICAgfVxuXG4gICAgLy8gYWRkUGxheWVyKHBsYXllcikge1xuICAgIC8vICAgICB0aGlzLnBsYXllcnMubGVuZ3RoIDwgOCA/IHRoaXMucGxheWVycy5wdXNoKHBsYXllcikgOiB0aHJvdyBuZXcgRXJyb3IgXCJSb29tIGZ1bGxcIjtcbiAgICAvLyB9O1xuXG4gICAgZ2V0Q3VycmVudFBsYXllcigpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VyclBsYXllciA9PT0gLTEpIHJldHVybjtcbiAgICAgICAgcmV0dXJuIHRoaXMudHVybk9yZGVyQXJyYXlbdGhpcy5jdXJyUGxheWVyXTtcbiAgICB9O1xuXG4gICAgbW92ZUFsbFBsYXllcnMoKSB7XG4gICAgICAgIHRoaXMucGxheWVycy5mb3JFYWNoKChwbGF5ZXIpID0+IHBsYXllci5rZWVwTW92aW5nKCkpXG4gICAgfTtcbiAgICBkZWFkUGxheWVycygpe1xuICAgICAgICB2YXIgZGVhZFBsYXllcnNUaWxlcyA9IFtdO1xuICAgICAgICB0aGlzLnBsYXllcnMuZm9yRWFjaChmdW5jdGlvbihwbGF5ZXIpe1xuICAgICAgICAgICAgaWYgKCFwbGF5ZXIuY2FuUGxheSAmJiBwbGF5ZXIudGlsZXMubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICAgICAgZGVhZFBsYXllcnNUaWxlcy5wdXNoKHBsYXllci50aWxlcyk7XG4gICAgICAgICAgICAgICAgaXNEZWFkUGxheWVyID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkZWFkUGxheWVyc1RpbGVzO1xuICAgIH07XG5cbiAgICBjaGVja092ZXIoKSB7XG4gICAgICAgIHJldHVybiBnZXRDYW5QbGF5KCkubGVuZ3RoIDw9IDE7XG4gICAgfVxuXG4gICAgLy90byBiZSBjYWxsZWQgYXQgdGhlIGVuZCBvZiBhIHR1cm4gdG8gc2V0IHRoZSBjdXJyUGxheWVyIHRvIHRoZSBuZXh0IGVsaWdpYmxlIHBsYXllciBpbiB0aGUgdHVybk9yZGVyQXJyYXlcbiAgICBnb1RvTmV4dFBsYXllcigpIHtcbiAgICAgICAgaWYgKGdldENhblBsYXkodGhpcy50dXJuT3JkZXJBcnJheSkubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgbGV0IG5ld0lkeCA9IHRoaXMuY3VyclBsYXllciArIDE7XG4gICAgICAgICAgICB3aGlsZSAoIXRoaXMudHVybk9yZGVyQXJyYXlbbmV3SWR4ICUgOF0uY2FuUGxheSkge1xuICAgICAgICAgICAgICAgIG5ld0lkeCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdXJyUGxheWVyID0gbmV3SWR4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jdXJyUGxheWVyID0gLTE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q3VycmVudFBsYXllcigpO1xuICAgIH07XG5cbiAgICAvL3Jlc3RhcnQgdGhlIGdhbWVcbiAgICByZXNldCgpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgICAgIC8vcmV0cmlldmUgYWxsIHRpbGVzXG4gICAgICAgICAgICAvL3JldHVybiBwbGF5ZXIncyB0aWxlcyB0byB0aGUgZGVjayBhbmQgc2h1ZmZsZVxuICAgICAgICAgICAgdGhpcy5kZWNrLnJlbG9hZChwbGF5ZXIudGlsZXMpLnNodWZmbGUoKTtcbiAgICAgICAgICAgIHBsYXllci50aWxlcyA9IFtdO1xuICAgICAgICAgICAgLy9yZXNldCBhbGwgcGxheWVycyBwbGF5YWJpbGl0eVxuICAgICAgICAgICAgcGxheWVyLmNhblBsYXkgPSB0cnVlO1xuICAgICAgICB9KVxuICAgIH07XG5cbn1cblxuLy8vLy9FTkQgT0YgR0FNRSBDTEFTUy8vLy8vXG5cbi8vZ2V0IEVsaWdpYmxlIHBsYXllcnNcbmxldCBnZXRDYW5QbGF5ID0gZnVuY3Rpb24ocGxheWVycykge1xuICAgIHJldHVybiBwbGF5ZXJzLmZpbHRlcigocGxheWVyKSA9PiB7XG4gICAgICAgIHJldHVybiBwbGF5ZXIuY2FuUGxheVxuICAgIH0pXG59IiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdnYW1lJywge1xuICAgICAgICB1cmw6ICcvZ2FtZS86Z2FtZU5hbWUnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9icm93c2VyL2pzL2dhbWUvZ2FtZS5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2dhbWVDdHJsJ1xuICAgIH0pO1xufSk7XG5cbnRzdXJvLmNvbnRyb2xsZXIoJ2dhbWVDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgJGZpcmViYXNlQXV0aCwgZmlyZWJhc2VVcmwsICRzdGF0ZVBhcmFtcywgJGZpcmViYXNlT2JqZWN0KSB7XG4gICAgdmFyIGF1dGggPSAkZmlyZWJhc2VBdXRoKCk7XG4gICAgdmFyIGZpcmViYXNlVXNlciA9ICRzY29wZS5hdXRoT2JqLiRnZXRBdXRoKCk7XG4gICAgdmFyIGdhbWVSZWYgPSBmaXJlYmFzZVVybCArICdnYW1lcy8nICsgJHN0YXRlUGFyYW1zLmdhbWVOYW1lO1xuICAgIHZhciBkZWNrUmVmID0gbmV3IEZpcmViYXNlKGdhbWVSZWYgKyAnL2luaXRpYWxEZWNrJyk7XG4gICAgdmFyIHBsYXllcnNSZWYgPSBuZXcgRmlyZWJhc2UoZ2FtZVJlZiArICcvcGxheWVycycpO1xuICAgIHZhciBtYXJrZXJzUmVmID0gbmV3IEZpcmViYXNlKGdhbWVSZWYgKyAnL2F2YWlsYWJsZU1hcmtlcnMnKTtcblxuICAgIC8vaW50aWFsaXplIGdhbWVcbiAgICAkc2NvcGUuZ2FtZSA9IG5ldyBHYW1lKCRzdGF0ZVBhcmFtcy5nYW1lTmFtZSwgJHN0YXRlUGFyYW1zLmRlY2spO1xuXG4gICAgJHNjb3BlLmdhbWUuZGVjayA9ICRmaXJlYmFzZU9iamVjdChkZWNrUmVmKTtcblxuXG4gICAgbWFya2Vyc1JlZi5vbigndmFsdWUnLCBmdW5jdGlvbiAoYXZhaWxhYmxlTWFya2Vycykge1xuICAgICAgICAkc2NvcGUuYXZhaWxhYmxlTWFya2VycyA9IE9iamVjdC5rZXlzKGF2YWlsYWJsZU1hcmtlcnMpLm1hcChmdW5jdGlvbiAoaSkge1xuXG4gICAgICAgICAgICByZXR1cm4gYXZhaWxhYmxlTWFya2Vyc1tpXTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB2YXIgYm9hcmQgPSAkc2NvcGUuZ2FtZS5ib2FyZDtcblxuXG4gICAgLy90YWtlIGFsbCBwbGF5ZXJzIG9uIGZpcmViYXNlIGFuZCB0dXJuIHRoZW0gaW50byBsb2NhbCBwbGF5ZXJcbiAgICBwbGF5ZXJzUmVmLm9uKFwiY2hpbGRfYWRkZWRcIiwgZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICB2YXIgbmV3UGxheWVyID0gbmV3IFBsYXllcihwbGF5ZXIudWlkKTtcbiAgICAgICAgbmV3UGxheWVyLm1hcmtlciA9IHBsYXllci5tYXJrZXI7XG5cbiAgICAgICAgdmFyIHggPSBwbGF5ZXIuc3RhcnRpbmdQb3NpdGlvblswXTtcbiAgICAgICAgdmFyIHkgPSBwbGF5ZXIuc3RhcnRpbmdQb3NpdGlvblsxXTtcbiAgICAgICAgdmFyIHBvaW50c0luZGV4ID0gcGxheWVyLnN0YXJ0aW5nUG9zaXRpb25bMl07XG5cbiAgICAgICAgbmV3UGxheWVyLnBvaW50ID0gYm9hcmRbeV1beF0ucG9pbnRzW3BvaW50c0luZGV4XTtcbiAgICAgICAgbmV3UGxheWVyLm5leHRTcGFjZSA9IGJvYXJkW3ldW3hdO1xuICAgICAgICBuZXdQbGF5ZXIubmV4dFNwYWNlUG9pbnRzSW5kZXggPSBwbGF5ZXIuc3RhcnRpbmdQb3NpdGlvblsyXTtcblxuICAgICAgICBuZXdQbGF5ZXIudGlsZXMgPSAkc2NvcGUuZ2FtZS5kZWNrLmRlYWxUaHJlZSgpO1xuXG4gICAgICAgICRzY29wZS5nYW1lLnBsYXllcnMucHVzaChuZXdQbGF5ZXIpO1xuICAgIH0pO1xuXG4gICAgLy9nZXQgJ21lJ1xuICAgICRzY29wZS5tZSA9ICRzY29wZS5nYW1lLnBsYXllcnMuZmlsdGVyKGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuIHBsYXllci51aWQgPT09IGZpcmViYXNlVXNlci51aWQ7XG4gICAgfSlbMF07XG5cblxuICAgIC8vSGF2ZSBwbGF5ZXIgcGljayB0aGUgbWFya2VyXG4gICAgJHNjb3BlLnBpY2tNYXJrZXIgPSBmdW5jdGlvbiAoYm9hcmQsIG1hcmtlcikge1xuICAgICAgICAkc2NvcGUubWUubWFya2VyID0gbWFya2VyO1xuICAgICAgICB2YXIgbWFya2VycyA9ICRmaXJlYmFzZUFycmF5KG1hcmtlcnNSZWYpO1xuICAgICAgICB2YXIgaWR4ID0gbWFya2Vycy5pbmRleE9mKG1hcmtlcik7XG4gICAgICAgIG1hcmtlcnMuJHJlbW92ZShtYXJrZXJzW2lkeF0pLnRoZW4oZnVuY3Rpb24gKHJlZikge1xuICAgICAgICAgICAgY29uc29sZS5sb2cocmVmLmtleSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvL0hhdmUgcGxheWVyIHBpY2sgdGhlaXIgc3RhcnQgcG9pbnRcblxuICAgICRzY29wZS5wbGFjZU1hcmtlciA9IGZ1bmN0aW9uIChib2FyZCwgcG9pbnQpIHtcbiAgICAgICAgJHNjb3BlLm1lLnBsYWNlTWFya2VyKHBvaW50KTtcbiAgICAgICAgJHNjb3BlLmdhbWUucGxheWVycy5wdXNoKCRzY29wZS5wbGF5ZXIpO1xuXG4gICAgICAgIGdhbWVSZWYuY2hpbGQoJ3BsYXllcnMnKS5jaGlsZChwbGF5ZXIudWlkKS5wdXNoKHtcbiAgICAgICAgICAgICdtYXJrZXInOiBwbGF5ZXIubWFya2VyLFxuICAgICAgICAgICAgJ3N0YXJ0aW5nUG9zaXRpb24nOiBwbGF5ZXIuc3RhcnRpbmdQb3NpdGlvblxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gVE9ETzogd2UgcHJvYmFibHkgbmVlZCB0aGlzIG9uIGZpcmViYXNlIHNvIG90aGVyIHBlb3BsZSBjYW4ndCBwaWNrIHdoYXQncyBiZWVuIHBpY2tlZFxuXG4gICAgLy9Gb3Igc3luY2hyb25pemluZ0dhbWUuLi5cbiAgICB2YXIgc3luY1JlZiA9IG5ldyBGaXJlYmFzZShnYW1lUmVmICsgJy9tb3ZlcycpO1xuICAgIHN5bmNSZWYub24oJ2NoaWxkX2FkZGVkJywgZnVuY3Rpb24gKGNoaWxkU25hcHNob3QsIHByZXZDaGlsZEtleSkge1xuICAgICAgICAvL05FRUQgVE8gRE9VQkxFIENIRUNLISEgV2hhdCBkb2VzIGNoaWxkU25hcCByZXR1cm5zP1xuICAgICAgICBjb25zb2xlLmxvZygnY2hpbGRTbmFwc2hvdF9TeW5jR2FtZScsIGNoaWxkU25hcHNob3QpO1xuICAgICAgICAvL2RlcGVuZGluZyBvbiB3aGF0IGNoaWxkU25hcHNob3QgZ2l2ZXMgbWUuLi5JIHRoaW5rIGl0J3Mgb25lIGNoaWxkIHBlciBvbiBjYWxsPyBJdCBkb2Vzbid0IHJldHVybiBhbiBhcnJheSBvZiBjaGFuZ2VzLi4uSSBiZWxpZXZlIVxuICAgICAgICBpZiAoY2hpbGRTbmFwc2hvdC50eXBlID09PSAndXBkYXRlRGVjaycpIHtcbiAgICAgICAgICAgICRzY29wZS5nYW1lLmRlY2sgPSBjaGlsZFNuYXBzaG90LnVwZGF0ZURlY2s7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkc2NvcGUucGxhY2VUaWxlKGNoaWxkU25hcHNob3QudGlsZSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFRPRE86IGhvdyB0byByZS1kbyB0aGUgbW92ZXM/XG4gICAgLy8gJHNjb3BlLmdhbWUubW92ZXM7XG5cbiAgICAvLyBUT0RPOiBob3cgZG8gd2Ugc2hvdyB0aGUgdGlsZXMgZm9yIHBsYXllcj9cblxuICAgIC8vIFRPRE86IGhvdyB0byBzaG93IHRoZSByb3RhdGVkIHRpbGU/XG5cbiAgICAvLyBDTVQ6IGFzc3VtaW5nIHdlIHVzZSBuZXcgR2FtZSgpIGZvciBlYWNoIGdhbWVcbiAgICAkc2NvcGUuY3VycmVudFBsYXllciA9ICRzY29wZS5nYW1lLmdldEN1cnJlbnRQbGF5ZXIoKTtcblxuICAgIC8vIENNVDogYXNzdW1pbmcgd2UgdXNlIG5ldyBHYW1lKCkgZm9yIGVhY2ggZ2FtZSwgaG9sZHMgYWxsIHRoZSBwbGF5ZXJzIHN0aWxsIG9uIHRoZSBib2FyZC5cbiAgICAkc2NvcGUudHVybk9yZGVyQXJyYXkgPSAkc2NvcGUuZ2FtZS5nZXRDYW5QbGF5KCk7XG5cbiAgICAvLyBUT0RPOiBuZWVkIGEgZnVuY3Rpb24gdG8gYXNzaWduIGRyYWdvblxuICAgICRzY29wZS5kcmFnb247XG4gICAgdmFyIGF3YWl0aW5nRHJhZ29uSG9sZGVycyA9IFtdO1xuXG5cbiAgICAkc2NvcGUuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vXG4gICAgfTtcblxuICAgICRzY29wZS5teVR1cm4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzY29wZS5tZSA9PT0gJHNjb3BlLmN1cnJlbnRQbGF5ZXI7XG4gICAgfTtcblxuICAgIC8vdGhlc2UgYXJlIHRpZWQgdG8gYW5ndWxhciBuZy1jbGljayBidXR0b25zXG4gICAgJHNjb3BlLnJvdGF0ZVRpbGVDdyA9IGZ1bmN0aW9uICh0aWxlKSB7XG4gICAgICAgIHRpbGUucm90YXRpb24rKztcbiAgICAgICAgaWYgKHRpbGUucm90YXRpb24gPT09IDQpIHRpbGUucm90YXRpb24gPSAwO1xuICAgIH07XG5cbiAgICAkc2NvcGUucm90YXRlVGlsZUNjdyA9IGZ1bmN0aW9uICh0aWxlKSB7XG4gICAgICAgIHRpbGUucm90YXRpb24tLTtcbiAgICAgICAgaWYgKHRpbGUucm90YXRpb24gPT09IC00KSB0aWxlLnJvdGF0aW9uID0gMDtcbiAgICB9O1xuXG4gICAgLy8gQ01UOiBhc3N1bWluZyB3ZSB1c2UgbmV3IEdhbWUoKVxuICAgIC8vIENNVDogdXNlIHBsYXllcidzIGFuZCBnYW1lJ3MgcHJvdG90eXBlIGZ1bmN0aW9uIHRvIHBsYWNlIHRpbGUgYW5kIHRoZW4gbW92ZSBhbGwgcGxheWVyc1xuICAgICRzY29wZS5wbGFjZVRpbGUgPSBmdW5jdGlvbiAodGlsZSkge1xuICAgICAgICAvLyBUT0RPOiBzZW5kIHRoaXMgc3RhdGUgdG8gZmlyZWJhc2UgZXZlcnkgdGltZSBpdCdzIGNhbGxlZFxuICAgICAgICBpZiAodGlsZS5yb3RhdGlvbiA+IDApIHtcbiAgICAgICAgICAgIHRpbGUucGF0aHMgPSB0aWxlLnBhdGhzLm1hcChmdW5jdGlvbiAoY29ubmVjdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb25uZWN0aW9uICsgMjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGlsZS5wYXRocy51bnNoaWZ0KHRpbGUucGF0aHMucG9wKCkpO1xuICAgICAgICAgICAgdGlsZS5wYXRocy51bnNoaWZ0KHRpbGUucGF0aHMucG9wKCkpO1xuICAgICAgICB9IGVsc2UgaWYgKHRpbGUucm90YXRpb24gPCAwKSB7XG4gICAgICAgICAgICB0aWxlLnBhdGhzID0gdGlsZS5wYXRocy5tYXAoZnVuY3Rpb24gKGNvbm5lY3Rpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29ubmVjdGlvbiAtIDI7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRpbGUucGF0aHMucHVzaCh0aWxlLnBhdGhzLnNoaWZ0KCkpO1xuICAgICAgICAgICAgdGlsZS5wYXRocy5wdXNoKHRpbGUucGF0aHMuc2hpZnQoKSk7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUubWUucGxhY2VUaWxlKHRpbGUpO1xuICAgICAgICBnYW1lUmVmLmNoaWxkKCdtb3ZlcycpLnB1c2goe1xuICAgICAgICAgICAgJ3R5cGUnOiAncGxhY2VUaWxlJyxcbiAgICAgICAgICAgICd0aWxlJzogdGlsZVxuICAgICAgICB9KTtcblxuICAgICAgICAkc2NvcGUuZ2FtZS5tb3ZlQWxscGxheWVycygpO1xuXG4gICAgICAgIGlmICgkc2NvcGUuZ2FtZS5jaGVja092ZXIoKSkge1xuICAgICAgICAgICAgLy8gVE9ETzogbmVlZCB0byB0ZWxsIHRoZSBwbGF5ZXIgc2hlIHdvblxuICAgICAgICAgICAgJHNjb3BlLndpbm5lciA9ICRzY29wZS5nYW1lLmdldENhblBsYXkoKVswXTtcbiAgICAgICAgICAgICRzY29wZS5nYW1lT3ZlciA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBJZiBkZWNrIGlzIGVtcHR5ICYgbm8gb25lIGlzIGRyYWdvbiwgc2V0IG1lIGFzIGRyYWdvblxuICAgICAgICAgICAgaWYgKCRzY29wZS5nYW1lLmRlY2subGVuZ3RoID09PSAwICYmICEkc2NvcGUuZHJhZ29uKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRyYWdvbiA9ICRzY29wZS5tZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoJHNjb3BlLmdhbWUuZGVjay5sZW5ndGggPT09IDAgJiYgJHNjb3BlLmRyYWdvbikge1xuICAgICAgICAgICAgICAgIGF3YWl0aW5nRHJhZ29uSG9sZGVycy5wdXNoKCRzY29wZS5tZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIENNVDogZHJhdyBvbmUgdGlsZSBhbmQgcHVzaCBpdCB0byB0aGUgcGxheWVyLnRpbGVzIGFycmF5XG4gICAgICAgICAgICAgICAgJHNjb3BlLm1lLnRpbGVzLnB1c2goJHNjb3BlLmdhbWUuZGVjay5kZWFsKDEpKTtcbiAgICAgICAgICAgICAgICAvL2lmIGRlYWQgcGxheWVycywgdGhlbiBwdXNoIHRoZWlyIGNhcmRzIGJhY2sgdG8gdGhlIGRlY2sgJiByZXNodWZmbGVcbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmdhbWUuZGVhZFBsYXllcnMoKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy93aXRoIG5ldyBjYXJkcyAmIG5lZWQgdG8gcmVzaHVmZmxlXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5nYW1lLmRlYWRQbGF5ZXJzKCkuZm9yRWFjaChmdW5jdGlvbiAoZGVhZFBsYXllclRpbGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWFkUGxheWVyVGlsZXMuZm9yRWFjaChmdW5jdGlvbiAodGlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5nYW1lLmRlY2sucHVzaCh0aWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmdhbWUuZGVjayA9ICRzY29wZS5nYW1lLmRlY2suc2h1ZmZsZSgpO1xuICAgICAgICAgICAgICAgICAgICAvL3NlbmQgZmlyZWJhc2UgYSBuZXcgbW92ZVxuICAgICAgICAgICAgICAgICAgICBnYW1lUmVmLmNoaWxkKCdtb3ZlcycpLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3R5cGUnOiAndXBkYXRlRGVjaycsXG4gICAgICAgICAgICAgICAgICAgICAgICAndXBkYXRlRGVjayc6ICRzY29wZS5nYW1lLmRlY2tcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuZHJhZ29uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZHJhZ29uLnRpbGVzLnB1c2goJHNjb3BlLmdhbWUuZGVjay5kZWFsKDEpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kcmFnb24gPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9ORUVEIFRPIERJU0NVU1M6IE1pZ2h0IG5lZWQgdG8gbW9kaWZ5IHRoaXMgaWYgd2Ugd2FudCB0byB1c2UgdXAgdGhlIGNhcmRzIGFuZCBnaXZlIGVhY2ggYXdhaXRpbmcgcGxheWVycycgdXAgdG8gMyBjYXJkc1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKCRzY29wZS5nYW1lLmRlY2subGVuZ3RoICYmICRzY29wZS5hd2FpdGluZ0RyYWdvbkhvbGRlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmF3YWl0aW5nRHJhZ29uSG9sZGVycy5zaGlmdCgpLnRpbGVzLnB1c2goJHNjb3BlLmdhbWUuZGVjay5kZWFsKDEpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmF3YWl0aW5nRHJhZ29uSG9sZGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZHJhZ29uID0gJHNjb3BlLmF3YWl0aW5nRHJhZ29uSG9sZGVycy5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJHNjb3BlLmdhbWUuZ29Ub05leHRQbGF5ZXIoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBUT0RPOiBmaXJlYmFzZSBnYW1lLnBsYXllcnMgc2xpY2UgJHNjb3BlLnBsYXllciBvdXRcbiAgICAkc2NvcGUubGVhdmVHYW1lO1xuXG4gICAgLy8gVE9ETzogZG8gd2UgcmVtb3ZlIHRoaXMgZ2FtZSByb29tJ3MgbW92ZXMgZnJvbSBmaXJlYmFzZT9cbiAgICAkc2NvcGUucmVzZXQgPSAkc2NvcGUuZ2FtZS5yZXNldDtcblxuXG4gICAgJHNjb3BlLnN0YXJ0dG9wID0gW1xuICAgICAgICBbMCwgMCwgMF0sXG4gICAgICAgIFswLCAwLCAxXSxcbiAgICAgICAgWzEsIDAsIDBdLFxuICAgICAgICBbMSwgMCwgMV0sXG4gICAgICAgIFsyLCAwLCAwXSxcbiAgICAgICAgWzIsIDAsIDFdLFxuICAgICAgICBbMywgMCwgMF0sXG4gICAgICAgIFszLCAwLCAxXSxcbiAgICAgICAgWzQsIDAsIDBdLFxuICAgICAgICBbNCwgMCwgMV0sXG4gICAgICAgIFs1LCAwLCAwXSxcbiAgICAgICAgWzUsIDAsIDFdXG4gICAgXTtcbiAgICAkc2NvcGUuc3RhcnRsZWZ0ID0gW1xuICAgICAgICBbMCwgMCwgN10sXG4gICAgICAgIFswLCAwLCA2XSxcbiAgICAgICAgWzAsIDEsIDddLFxuICAgICAgICBbMCwgMSwgNl0sXG4gICAgICAgIFswLCAyLCA3XSxcbiAgICAgICAgWzAsIDIsIDZdLFxuICAgICAgICBbMCwgMywgN10sXG4gICAgICAgIFswLCAzLCA2XSxcbiAgICAgICAgWzAsIDQsIDddLFxuICAgICAgICBbMCwgNCwgNl0sXG4gICAgICAgIFswLCA1LCA3XSxcbiAgICAgICAgWzAsIDUsIDZdXG4gICAgXTtcbiAgICAkc2NvcGUuc3RhcnRib3R0b20gPSBbXG4gICAgICAgIFswLCA1LCAwXSxcbiAgICAgICAgWzAsIDUsIDFdLFxuICAgICAgICBbMSwgNSwgMF0sXG4gICAgICAgIFsxLCA1LCAxXSxcbiAgICAgICAgWzIsIDUsIDBdLFxuICAgICAgICBbMiwgNSwgMV0sXG4gICAgICAgIFszLCA1LCAwXSxcbiAgICAgICAgWzMsIDUsIDFdLFxuICAgICAgICBbNCwgNSwgMF0sXG4gICAgICAgIFs0LCA1LCAxXSxcbiAgICAgICAgWzUsIDUsIDBdLFxuICAgICAgICBbNSwgNSwgMV1cbiAgICBdO1xuICAgICRzY29wZS5zdGFydHJpZ2h0ID0gW1xuICAgICAgICBbNSwgMCwgMl0sXG4gICAgICAgIFs1LCAwLCAzXSxcbiAgICAgICAgWzUsIDEsIDJdLFxuICAgICAgICBbNSwgMSwgM10sXG4gICAgICAgIFs1LCAyLCAyXSxcbiAgICAgICAgWzUsIDIsIDNdLFxuICAgICAgICBbNSwgMywgMl0sXG4gICAgICAgIFs1LCAzLCAzXSxcbiAgICAgICAgWzUsIDQsIDJdLFxuICAgICAgICBbNSwgNCwgM10sXG4gICAgICAgIFs1LCA1LCAyXSxcbiAgICAgICAgWzUsIDUsIDNdXG4gICAgXTtcblxufSk7XG4iLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9icm93c2VyL2pzL2xvZ2luL2xvZ2luLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnbG9naW5DdHJsJ1xuICAgIH0pO1xufSk7XG5cbnRzdXJvLmNvbnRyb2xsZXIoJ2xvZ2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSwgJGZpcmViYXNlQXV0aCkge1xuICAgIHZhciBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuXG4gICAgJHNjb3BlLmxvZ0luV2l0aEdvb2dsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYXV0aC4kc2lnbkluV2l0aFBvcHVwKFwiZ29vZ2xlXCIpLnRoZW4oZnVuY3Rpb24gKGF1dGhEYXRhKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkxvZ2dlZCBpbiBhczpcIiwgYXV0aERhdGEpO1xuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJBdXRoZW50aWNhdGlvbiBmYWlsZWQ6XCIsIGVycm9yKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHN0YXRlLmdvKCdwaWNrR2FtZScpO1xuICAgIH07XG5cbn0pO1xuIiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdwaWNrR2FtZScsIHtcbiAgICAgICAgdXJsOiAnL3BpY2tnYW1lJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvYnJvd3Nlci9qcy9waWNrR2FtZS9waWNrR2FtZS5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ3BpY2tHYW1lQ3RybCdcbiAgICB9KTtcbn0pO1xuXG50c3Vyby5jb250cm9sbGVyKCdwaWNrR2FtZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QpIHtcbiAgICB2YXIgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbiAgICB2YXIgb2JqID0gJGZpcmViYXNlT2JqZWN0KHJlZik7XG5cbiAgICAkc2NvcGUudGVzdCA9IFwiaGlcIjtcblxuICAgICRzY29wZS5jcmVhdGVHYW1lID0gZnVuY3Rpb24gKGdhbWVOYW1lKSB7XG4gICAgICAgIHZhciBnYW1lTmFtZVJlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZChnYW1lTmFtZSk7XG4gICAgICAgICRmaXJlYmFzZUFycmF5KGdhbWVOYW1lUmVmKS4kYWRkKHtcbiAgICAgICAgICAgIFwiZ2FtZU5hbWVcIjogZ2FtZU5hbWVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgb2JqLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICB2YXIgdGlsZXMgPSBkYXRhLnRpbGVzXG4gICAgICAgICAgICB2YXIgZGVjayA9IG5ldyBEZWNrKHRpbGVzKS5zaHVmZmxlKCkudGlsZXM7XG4gICAgICAgICAgICB2YXIgaW5pdGlhbERlY2tSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoZ2FtZU5hbWUpLmNoaWxkKCdpbml0aWFsRGVjaycpO1xuICAgICAgICAgICAgJGZpcmViYXNlQXJyYXkoaW5pdGlhbERlY2tSZWYpLiRhZGQoZGVjayk7XG4gICAgICAgIH0pXG5cblxuICAgICAgICB2YXIgaW5pdGlhbE1hcmtlcnNSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoZ2FtZU5hbWUpLmNoaWxkKCdhdmFpbGFibGVNYXJrZXJzJyk7XG4gICAgICAgICRmaXJlYmFzZUFycmF5KGluaXRpYWxNYXJrZXJzUmVmKS4kYWRkKFtcInJlZFwiLCBcIm9yYW5nZVwiLCBcInllbGxvd1wiLCBcImdyZWVuXCIsIFwiYXF1YVwiLCBcImJsdWVcIiwgXCJuYXZ5XCIsIFwicHVycGxlXCJdKTtcblxuICAgICAgICAkc3RhdGUuZ28oJ2dhbWUnLCB7XG4gICAgICAgICAgICBcImdhbWVOYW1lXCI6IGdhbWVOYW1lXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAkc2NvcGUuZ29Ub0dhbWVMaXN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAkc3RhdGUuZ28oJ2dhbWVsaXN0Jyk7XG4gICAgfTtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmZ1bmN0aW9uIFBsYXllcih1aWQpIHtcbiAgICAvLyBUT0RPOiBnZXQgdWlkIGZyb20gZmlyZWJhc2UgYXV0aFxuICAgIHRoaXMudWlkID0gdWlkO1xuXG4gICAgdGhpcy5tYXJrZXIgPSBudWxsO1xuXG4gICAgLy8gc2hvdWxkIGJlIGEgUG9pbnQgb2JqZWN0XG4gICAgdGhpcy5wb2ludCA9IG51bGw7XG5cbiAgICAvLyBbeCwgeV1cbiAgICAvLyBkZXBlbmRzIG9uIHRoZSBhbmd1bGFyIFNwYWNlLngsIFNwYWNlLnlcbiAgICB0aGlzLm5leHRTcGFjZSA9IG51bGw7XG5cbiAgICAvLyBpbiBlYWNoIFNwYWNlLnBvaW50cyBhcnJheSwgZmluZCB0aGlzIHNwZWNpZmljIHBvaW50IGFuZCBnZXQgdGhlIHBvc2l0aW9uIChpbnRlZ2VyKSBpbnNpZGUgdGhpcyBzcGFjZS5cbiAgICB0aGlzLm5leHRTcGFjZVBvaW50c0luZGV4ID0gbnVsbDtcblxuICAgIC8vIG1heGltdW4gMyB0aWxlc1xuICAgIHRoaXMudGlsZXMgPSBbXTtcblxuICAgIC8vIGlmIGEgcGxheWVyIGRpZXMsIGl0IHdpbGwgYmUgY2hhbmdlZCB0byBmYWxzZVxuICAgIHRoaXMuY2FuUGxheSA9IHRydWU7XG59XG5cblBsYXllci5wcm90b3R5cGUucGxhY2VNYXJrZXIgPSBmdW5jdGlvbiAoYm9hcmQsIHBvaW50KSB7XG4gICAgLy8gcG9pbnQgbG9va3MgbGlrZSBbeCwgeSwgcG9pbnRzSW5kZXhdIGluIHRoZSBzcGFjZVxuICAgIHZhciB4ID0gcG9pbnRbMF07XG4gICAgdmFyIHkgPSBwb2ludFsxXTtcbiAgICB2YXIgcG9pbnRzSW5kZXggPSBwb2ludFsyXTtcblxuICAgIHRoaXMucG9pbnQgPSBib2FyZFt5XVt4XS5wb2ludHNbcG9pbnRzSW5kZXhdO1xuICAgIHRoaXMucG9pbnQudHJhdmVsbGVkID0gdHJ1ZTtcblxuICAgIC8vW3gsIHldIGZyb20gdGhlIHBvaW50XG4gICAgdGhpcy5uZXh0U3BhY2UgPSBib2FyZFt5XVt4XTtcblxuICAgIC8vIGluIGVhY2ggU3BhY2UucG9pbnRzIGFycmF5LCBmaW5kIHRoaXMgc3BlY2lmaWMgcG9pbnQgYW5kIGdldCB0aGUgcG9zaXRpb24gKGludGVnZXIpIGluc2lkZSB0aGlzIHNwYWNlLlxuICAgIHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPSB0aGlzLm5leHRTcGFjZS5wb2ludHMuaW5kZXhPZih0aGlzLnBvaW50KTtcbn07XG5cblBsYXllci5wcm90b3R5cGUubmV3U3BhY2UgPSBmdW5jdGlvbiAoYm9hcmQsIG9sZFNwYWNlKSB7XG4gICAgaWYgKHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDAgfHwgdGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gYm9hcmRbb2xkU3BhY2UueSAtIDFdW29sZFNwYWNlLnhdO1xuICAgIH0gZWxzZSBpZiAodGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gMiB8fCB0aGlzLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSAzKSB7XG4gICAgICAgIHJldHVybiBib2FyZFtvbGRTcGFjZS55XVtvbGRTcGFjZS54ICsgMV07XG4gICAgfSBlbHNlIGlmICh0aGlzLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSA0IHx8IHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDUpIHtcbiAgICAgICAgcmV0dXJuIGJvYXJkW29sZFNwYWNlLnkgKyAxXVtvbGRTcGFjZS54XTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYm9hcmRbb2xkU3BhY2UueV1bb2xkU3BhY2UueCAtIDFdO1xuICAgIH1cbn07XG5cblBsYXllci5wcm90b3R5cGUucGxhY2VUaWxlID0gZnVuY3Rpb24gKHRpbGUpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLnRpbGVzLmluZGV4T2YodGlsZSk7XG4gICAgdGhpcy50aWxlcy5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgdGhpcy5uZXh0U3BhY2UudGlsZVVybCA9IHRpbGUuaW1hZ2VVcmw7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRpbGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5uZXh0U3BhY2UucG9pbnRzW2ldLm5laWdoYm9ycy5wdXNoKHRoaXMubmV4dFNwYWNlLnBvaW50c1t0aWxlW2ldXSk7XG4gICAgfVxufTtcblxuUGxheWVyLnByb3RvdHlwZS5tb3ZlVG8gPSBmdW5jdGlvbiAocG9pbnRlcikge1xuICAgIC8vIGxldCBwb2ludGVyID0gcG9pbnRlcjtcblxuICAgIC8vYWx3YXlzIGJlIHJldHVybmluZyAwIG9yIDEgcG9pbnQgaW4gdGhlIGFycmF5XG4gICAgbGV0IG5leHRQb2ludCA9IHBvaW50ZXIubmVpZ2hib3JzLmZpbHRlcihmdW5jdGlvbiAobmVpZ2hib3IpIHtcbiAgICAgICAgcmV0dXJuICFuZWlnaGJvci50cmF2ZWxsZWQ7XG4gICAgfSlbMF07XG5cbiAgICByZXR1cm4gbmV4dFBvaW50O1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5rZWVwTW92aW5nID0gZnVuY3Rpb24gKCkge1xuICAgIGxldCBtb3ZhYmxlID0gdGhpcy5tb3ZlVG8odGhpcy5wb2ludCk7XG4gICAgd2hpbGUgKG1vdmFibGUpIHtcbiAgICAgICAgdGhpcy5wb2ludC50cmF2ZWxsZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnBvaW50ID0gdGhpcy5tb3ZlVG8odGhpcy5wb2ludCk7XG4gICAgICAgIGxldCBvbGRTcGFjZSA9IHRoaXMubmV4dFNwYWNlO1xuICAgICAgICBsZXQgbmV3U3BhY2UgPSBuZXdTcGFjZShvbGRTcGFjZSk7XG4gICAgICAgIHRoaXMubmV4dFNwYWNlID0gbmV3U3BhY2U7XG5cbiAgICAgICAgdGhpcy5jaGVja0RlYXRoKCk7XG4gICAgICAgIG1vdmFibGUgPSB0aGlzLm1vdmVUbyh0aGlzLnBvaW50KTtcbiAgICB9XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLmNoZWNrRGVhdGggPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFsbFRyYXZlbGxlZCA9IHRoaXMucG9pbnQubmVpZ2hib3JzLmZpbHRlcihmdW5jdGlvbiAobmVpZ2hib3IpIHtcbiAgICAgICAgcmV0dXJuIG5laWdoYm9yLnRyYXZlbGxlZDtcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLnBvaW50LmVkZ2UgfHwgYWxsVHJhdmVsbGVkLmxlbmd0aCA9PT0gMikgdGhpcy5kaWUoKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUuZGllID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY2FuUGxheSA9IGZhbHNlO1xuICAgIC8vIFRPRE86IG5lZWQgdG8gc2VuZCBhbiBhbGVydCBvciBtZXNzYWdlIHRvIHRoZSBwbGF5ZXIgd2hvIGp1c3QgZGllZC5cbn07XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
