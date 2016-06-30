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
								key: 'deal',
								value: function deal(num) {
												var tiles = [];
												for (var i = 0; i < num; i++) {
																this.deck.$remove(0).then(function (data) {
																				console.log(data);
																				tiles.push(data);
																});
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

				// var obj = $firebaseObject(ref);
				var ref = firebase.database().ref();
				var gameRef = ref.child('games').child($stateParams.gameName);

				var deckRef = gameRef.child('initialDeck');
				var playersRef = gameRef.child('players');
				var markersRef = gameRef.child('availableMarkers');
				var deckArr = $firebaseArray(deckRef);
				var firebasePlayersArr = $firebaseArray(playersRef);

				/****************
    INITIALIZING GAME
    ****************/

				//new local game with game name defined by url
				$scope.game = new Game($stateParams.gameName);

				//when the deck is loaded...
				deckArr.$loaded().then(function (data) {
								// $scope.game.deck = data[0]; //add the deck to the local game ? Try this as firebase DeckArr????
								$scope.game.deck = deckArr; //add the deck to the local game ? Try this as firebase DeckArr????

								//don't start watching players until there is a deck in the game
								playersRef.on("value", function (snap) {
												var snapPlayers = snap.val(); //grab the value of the snapshot (all players in game in Firebase)

												//for each player in this collection...
												for (var player in snapPlayers) {
																var existingPlayerIndex, thisIsANewPlayer;

																//find this 'snap' player's index in local game. find returns that value.
																var localPlayer = $scope.game.players.find(function (plyr, plyrIdx) {
																				existingPlayerIndex = plyrIdx;
																				return plyr.uid === snapPlayers[player].uid;
																});

																//if not found, create new player
																if (!localPlayer) {
																				console.log('i didnt find a local player!');
																				localPlayer = new Player(snapPlayers[player].uid);
																				thisIsANewPlayer = true;
																}

																//for each key in the snapPlayer's keys, add that key and value to local player
																for (var playerproperty in snapPlayers[player]) {
																				localPlayer[playerproperty] = snapPlayers[player][playerproperty];
																}

																localPlayer.tiles = $scope.game.deal(3);

																//push local player to game.players
																if (thisIsANewPlayer) $scope.game.players.push(localPlayer);else $scope.game.players[existingPlayerIndex] = localPlayer;
																console.log($scope.game.players);
												}
								});
				});

				// console.log('deck?', $scope.game.deck);
				// localPlayer.tiles = $scope.game.deal(3);

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

								firebasePlayersArr.$loaded().then(function (data) {
												var FBplayers = data;
												if (user) {
																var me = FBplayers.filter(function (player) {
																				return player.uid === user.uid;
																})[0];
																if (me) {
																				$scope.me = me;
																				$scope.me.prototype = Object.create(Player.prototype);
																}
																if ($scope.me.marker === "n") $scope.me.marker = null;
												} else {
																// No user is signed in.
																console.log("no one is signed in");
												}
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

				//Have player pick their start point
				$scope.placeMarker = function (board, point) {
								console.log($scope.me);
								$scope.me.prototype.placeMarker(board, point, $scope.me);
								$scope.game.players.push($scope.me);
								// var firebasePlayersArr = $firebaseArray(playersRef);

								firebasePlayersArr.$loaded().then(function (players) {
												var meIdx;

												players.find(function (e, i) {
																if (e.$id === $scope.me.$id) meIdx = i;
												});

												firebasePlayersArr[meIdx] = $scope.me;
												firebasePlayersArr.$save(meIdx);
								});
				};

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
												//check if I am already a player in this game
												//if I am a new player, add me to the players array in firebase
												if (players.filter(function (player) {
																return player.uid === firebaseUser.uid;
												}).length === 0) {
																var newPlayer = new Player(firebaseUser.uid);
																$firebaseArray(playersRef).$add(newPlayer);
												}
												$state.go('game', { "gameName": gameName });
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
												$state.go('pickGame');
								}).catch(function (error) {
												console.error("Authentication failed:", error);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImdhbWUvYm9hcmQuanMiLCJnYW1lL2RlY2suanMiLCJnYW1lL2dhbWUuY29udHJ1Y3Rvci5qcyIsImdhbWUvZ2FtZS5qcyIsImdhbWVsaXN0L2dhbWVsaXN0LmpzIiwibG9naW4vbG9naW4uanMiLCJwaWNrR2FtZS9waWNrR2FtZS5qcyIsInBsYXllci9wbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBQSxRQUFBLFFBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTs7QUFFQSxNQUFBLE1BQUEsQ0FBQSxZQUFBO0FBQ0EsUUFBQSxTQUFBO0FBQ0EsZ0JBQUEseUNBREE7QUFFQSxvQkFBQSxzQ0FGQTtBQUdBLHFCQUFBLDZDQUhBO0FBSUEsdUJBQUE7QUFKQSxLQUFBO0FBTUEsYUFBQSxhQUFBLENBQUEsTUFBQTtBQUNBLENBUkE7O0FBVUEsTUFBQSxRQUFBLENBQUEsYUFBQSxFQUFBLDRDQUFBOztBQUVBLE1BQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQTtBQUNBLHVCQUFBLFNBQUEsQ0FBQSxHQUFBO0FBQ0EsQ0FGQTs7QUNkQSxTQUFBLEtBQUEsR0FBQTtBQUNBLFNBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQTs7QUFFQSxNQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBO0FBQ0E7QUFDQSxXQUFBLEtBQUEsS0FBQTtBQUNBLENBUkE7O0FBVUEsU0FBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEVBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLFNBQUEsS0FBQSxHQUFBLElBQUE7QUFDQSxTQUFBLE1BQUEsR0FBQSxDQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBQUE7QUFDQSxTQUFBLE9BQUE7QUFDQSxTQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxzQkFBQTs7QUFFQSxZQUFBLElBQUEsQ0FBQSxFQUFBOztBQUNBLDRCQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLEM7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FDQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsTUFBQSxJQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLFNBSkEsTUFJQSxJQUFBLElBQUEsQ0FBQSxFQUFBOztBQUNBLGdCQUFBLE1BQUEsQ0FBQSxFQUFBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxLQUNBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxTQUhBLE1BR0EsSUFBQSxJQUFBLENBQUEsRUFBQTs7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FDQSxLQUFBLE1BQUEs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QSxnQkFBQSxHQUFBLENBQUEsaUJBQUE7QUFDQSxhQUFBLFFBQUE7QUFDQSxZQUFBLEtBQUEsUUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLFFBQUEsR0FBQSxDQUFBO0FBQ0EsS0FKQTs7QUFNQSxXQUFBLGFBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsUUFBQTtBQUNBLFlBQUEsS0FBQSxRQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxRQUFBLEdBQUEsQ0FBQTtBQUNBLEtBSEE7OztBQU9BLFdBQUEsU0FBQSxHQUFBLFVBQUEsSUFBQSxFQUFBOztBQUVBLFlBQUEsS0FBQSxRQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxHQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQTtBQUNBLDZCQUFBLGFBQUEsQ0FBQTtBQUNBLG9CQUFBLGVBQUEsQ0FBQSxFQUFBLGFBQUEsQ0FBQTtBQUNBLG9CQUFBLGVBQUEsQ0FBQSxFQUFBLGFBQUEsQ0FBQTtBQUNBLHVCQUFBLFVBQUE7QUFDQSxhQUxBLENBQUE7QUFNQSxpQkFBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGlCQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsU0FUQSxNQVNBLElBQUEsS0FBQSxRQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxHQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQTtBQUNBLDZCQUFBLGFBQUEsQ0FBQTtBQUNBLG9CQUFBLGVBQUEsQ0FBQSxDQUFBLEVBQUEsYUFBQSxDQUFBO0FBQ0Esb0JBQUEsZUFBQSxDQUFBLENBQUEsRUFBQSxhQUFBLENBQUE7QUFDQSx1QkFBQSxVQUFBO0FBQ0EsYUFMQSxDQUFBO0FBTUEsaUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxpQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLEtBQUEsRUFBQTtBQUNBOztBQUVBLGVBQUEsRUFBQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQTtBQUNBLGdCQUFBLEdBQUEsQ0FBQSxPQUFBLEVBQUE7OztBQUdBLGdCQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsSUFBQSxDQUFBO0FBQ0Esb0JBQUEsV0FEQTtBQUVBLG9CQUFBO0FBRkEsU0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrREEsS0E1RUE7OztBQStFQSxXQUFBLFNBQUE7OztBQUdBLFdBQUEsS0FBQSxHQUFBLFlBQUE7QUFDQSxtQkFBQSxPQUFBLENBQUEsQ0FBQSxFQUNBLElBREEsQ0FDQSxVQUFBLEdBQUEsRUFBQTtBQUNBLG9CQUFBLEdBQUEsQ0FBQSxxQkFBQSxFQUFBLElBQUEsR0FBQTtBQUNBLFNBSEE7O0FBS0EsZ0JBQUEsT0FBQSxDQUFBLENBQUEsRUFDQSxJQURBLENBQ0EsVUFBQSxHQUFBLEVBQUE7QUFDQSxvQkFBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLEdBQUE7QUFDQSxTQUhBOztBQUtBLFlBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGdCQUFBLFFBQUEsS0FBQSxLQUFBO0FBQ0EsZ0JBQUEsT0FBQSxJQUFBLElBQUEsQ0FBQSxLQUFBLEVBQUEsT0FBQSxHQUFBLEtBQUE7QUFDQSxnQkFBQSxpQkFBQSxJQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsS0FBQSxDQUFBLGFBQUEsUUFBQSxFQUFBLEtBQUEsQ0FBQSxhQUFBLENBQUE7QUFDQSwyQkFBQSxjQUFBLEVBQUEsSUFBQSxDQUFBLElBQUE7QUFDQSxTQUxBOztBQVNBLFlBQUEsb0JBQUEsSUFBQSxLQUFBLENBQUEsT0FBQSxFQUFBLEtBQUEsQ0FBQSxhQUFBLFFBQUEsRUFBQSxLQUFBLENBQUEsa0JBQUEsQ0FBQTtBQUNBLHVCQUFBLGlCQUFBLEVBQUEsSUFBQSxDQUFBLENBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxRQUFBLEVBQUEsT0FBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLFFBQUEsQ0FBQTs7QUFHQSxZQUFBLFVBQUEsZUFBQSxVQUFBLENBQUE7QUFDQSxnQkFBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsaUJBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxJQUFBLEtBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQTtBQUNBLHFCQUFBLENBQUEsRUFBQSxPQUFBLEdBQUEsSUFBQTtBQUNBLHFCQUFBLENBQUEsRUFBQSxNQUFBLEdBQUEsR0FBQTtBQUNBLHFCQUFBLENBQUEsRUFBQSxTQUFBLEdBQUEsR0FBQTtBQUNBLHFCQUFBLENBQUEsRUFBQSxvQkFBQSxHQUFBLEdBQUE7QUFDQSxxQkFBQSxDQUFBLEVBQUEsS0FBQSxHQUFBLEdBQUE7QUFDQSxxQkFBQSxDQUFBLEVBQUEsS0FBQSxHQUFBLEdBQUE7QUFDQSx3QkFBQSxLQUFBLENBQUEsQ0FBQTtBQUNBO0FBQ0EsU0FWQTs7QUFZQSxnQkFBQSxHQUFBLENBQUEsT0FBQSxFQUFBO0FBRUEsS0F2Q0E7O0FBMENBLFdBQUEsUUFBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBLEVBSUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FKQSxFQUtBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQU5BLEVBT0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FQQSxFQVFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUkEsRUFTQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVRBLEVBVUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FWQSxFQVdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWEEsRUFZQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVpBLENBQUE7QUFjQSxXQUFBLFNBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBLEVBR0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQSxFQUlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSkEsRUFLQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUxBLEVBTUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FOQSxFQU9BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUEEsRUFRQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVJBLEVBU0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FUQSxFQVVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVkEsRUFXQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVhBLEVBWUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FaQSxDQUFBO0FBY0EsV0FBQSxXQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQURBLEVBRUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQSxFQUdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEEsRUFJQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUpBLEVBS0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FMQSxFQU1BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTkEsRUFPQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVBBLEVBUUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FSQSxFQVNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVEEsRUFVQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVZBLEVBV0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FYQSxFQVlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWkEsQ0FBQTtBQWNBLFdBQUEsVUFBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBLEVBSUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FKQSxFQUtBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQU5BLEVBT0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FQQSxFQVFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUkEsRUFTQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVRBLEVBVUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FWQSxFQVdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWEEsRUFZQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVpBLENBQUE7QUFjQSxDQXhZQTs7QUNSQSxNQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxhQUFBLFdBREE7QUFFQSxxQkFBQSxvQ0FGQTtBQUdBLG9CQUFBO0FBSEEsS0FBQTtBQUtBLENBTkE7O0FBUUEsTUFBQSxVQUFBLENBQUEsVUFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQSxlQUFBLEVBQUEsTUFBQSxFQUFBLGFBQUEsRUFBQSxjQUFBLEVBQUE7O0FBRUEsUUFBQSxNQUFBLFNBQUEsUUFBQSxHQUFBLEdBQUEsRUFBQTtBQUNBLFFBQUEsTUFBQSxnQkFBQSxHQUFBLENBQUE7O0FBRUEsUUFBQSxPQUFBLGVBQUE7QUFDQSxRQUFBLGVBQUEsS0FBQSxRQUFBLEVBQUE7O0FBRUEsUUFBQSxXQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQTtBQUNBLFFBQUEsa0JBQUEsZ0JBQUEsUUFBQSxDQUFBOzs7O0FBSUEsb0JBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxVQUFBLEVBQ0EsSUFEQSxDQUNBLFlBQUE7QUFDQSxZQUFBLFdBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLElBQUEsT0FBQSxRQUFBLEVBQUE7QUFDQSxxQkFBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLGVBQUEsU0FBQSxHQUFBLFNBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLEtBUEE7O0FBVUEsV0FBQSxJQUFBLEdBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxZQUFBLGNBQUEsSUFBQSxLQUFBLENBQUEsT0FBQSxFQUFBLEtBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxZQUFBLGFBQUEsWUFBQSxLQUFBLENBQUEsU0FBQSxDQUFBOztBQUVBLFlBQUEsWUFBQSxlQUFBLFVBQUEsQ0FBQTtBQUNBLGtCQUFBLE9BQUEsR0FDQSxJQURBLENBQ0EsVUFBQSxPQUFBLEVBQUE7OztBQUdBLGdCQUFBLFFBQUEsTUFBQSxDQUFBO0FBQUEsdUJBQUEsT0FBQSxHQUFBLEtBQUEsYUFBQSxHQUFBO0FBQUEsYUFBQSxFQUFBLE1BQUEsS0FBQSxDQUFBLEVBQUE7QUFDQSxvQkFBQSxZQUFBLElBQUEsTUFBQSxDQUFBLGFBQUEsR0FB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LHdCQUFBO0FBREEsU0FBQTtBQUdBLEtBaENBOztBQWtDQSxXQUFBLFlBQUEsR0FBQSxZQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsVUFBQTtBQUNBLEtBRkE7QUFHQSxDQTFDQTs7QUNSQTs7QUFFQSxTQUFBLE1BQUEsQ0FBQSxHQUFBLEVBQUE7O0FBRUEsU0FBQSxHQUFBLEdBQUEsR0FBQTs7QUFFQSxTQUFBLE1BQUEsR0FBQSxHQUFBOzs7QUFHQSxTQUFBLEtBQUEsR0FBQSxHQUFBOzs7O0FBSUEsU0FBQSxTQUFBLEdBQUEsR0FBQTs7O0FBR0EsU0FBQSxvQkFBQSxHQUFBLEdBQUE7OztBQUdBLFNBQUEsS0FBQSxHQUFBLEdBQUE7OztBQUdBLFNBQUEsT0FBQSxHQUFBLElBQUE7QUFDQTs7O0FBR0EsT0FBQSxTQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUE7O0FBRUEsUUFBQSxJQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxJQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxjQUFBLE1BQUEsQ0FBQSxDQUFBOztBQUVBLFNBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxNQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsU0FBQSxLQUFBLENBQUEsU0FBQSxHQUFBLElBQUE7OztBQUdBLFNBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTs7O0FBR0EsU0FBQSxvQkFBQSxHQUFBLEtBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxLQUFBLENBQUE7QUFDQSxDQWRBOztBQWdCQSxPQUFBLFNBQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUEsUUFBQSxFQUFBO0FBQ0EsUUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLEVBQUE7QUFDQSxlQUFBLE1BQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQ0EsS0FGQSxNQUVBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxFQUFBO0FBQ0EsZUFBQSxNQUFBLFNBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLEtBRkEsTUFFQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsRUFBQTtBQUNBLGVBQUEsTUFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLENBQUE7QUFDQSxLQUZBLE1BRUE7QUFDQSxlQUFBLE1BQUEsU0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQSxDQVZBOzs7QUFhQSxPQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsUUFBQSxRQUFBLEtBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7O0FBRUEsU0FBQSxTQUFBLENBQUEsT0FBQSxHQUFBLEtBQUEsUUFBQTs7QUFFQSxTQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxLQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLENBVEE7O0FBV0EsT0FBQSxTQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsT0FBQSxFQUFBOzs7QUFHQSxRQUFBLFlBQUEsUUFBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsZUFBQSxDQUFBLFNBQUEsU0FBQTtBQUNBLEtBRkEsRUFFQSxDQUZBLENBQUE7O0FBSUEsV0FBQSxTQUFBO0FBQ0EsQ0FSQTs7O0FBV0EsT0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsUUFBQSxVQUFBLEtBQUEsTUFBQSxDQUFBLEtBQUEsS0FBQSxDQUFBO0FBQ0EsV0FBQSxPQUFBLEVBQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQSxTQUFBLEdBQUEsSUFBQTtBQUNBLGFBQUEsS0FBQSxHQUFBLEtBQUEsTUFBQSxDQUFBLEtBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxXQUFBLEtBQUEsU0FBQTtBQUNBLFlBQUEsV0FBQSxTQUFBLFFBQUEsQ0FBQTtBQUNBLGFBQUEsU0FBQSxHQUFBLFFBQUE7O0FBRUEsYUFBQSxVQUFBO0FBQ0Esa0JBQUEsS0FBQSxNQUFBLENBQUEsS0FBQSxLQUFBLENBQUE7QUFDQTtBQUNBLENBWkE7O0FBY0EsT0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLGVBQUEsS0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGVBQUEsU0FBQSxTQUFBO0FBQ0EsS0FGQSxDQUFBOztBQUlBLFFBQUEsS0FBQSxLQUFBLENBQUEsSUFBQSxJQUFBLGFBQUEsTUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLEdBQUE7QUFDQSxDQU5BOztBQVFBLE9BQUEsU0FBQSxDQUFBLEdBQUEsR0FBQSxZQUFBO0FBQ0EsU0FBQSxPQUFBLEdBQUEsS0FBQTs7QUFFQSxDQUhBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgdHN1cm8gPSBhbmd1bGFyLm1vZHVsZSgnVHN1cm8nLCBbJ3VpLnJvdXRlcicsICdmaXJlYmFzZSddKTtcblxudHN1cm8uY29uZmlnKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0ge1xuICAgICAgICBhcGlLZXk6IFwiQUl6YVN5Q0xtM2prazVwcE1xZVF4S29ILWRaOUNkWU1hREdXV3FVXCIsXG4gICAgICAgIGF1dGhEb21haW46IFwidGhlLXBhdGhzLW9mLWRyYWdvbnMuZmlyZWJhc2VhcHAuY29tXCIsXG4gICAgICAgIGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vdGhlLXBhdGhzLW9mLWRyYWdvbnMuZmlyZWJhc2Vpby5jb21cIixcbiAgICAgICAgc3RvcmFnZUJ1Y2tldDogXCJ0aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbVwiLFxuICAgIH07XG4gICAgZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChjb25maWcpO1xufSk7XG5cbnRzdXJvLmNvbnN0YW50KCdmaXJlYmFzZVVybCcsICdodHRwczovL3BhdGgtb2YtdGhlLWRyYWdvbi5maXJlYmFzZWlvLmNvbS8nKTtcblxudHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG59KTtcbiIsImZ1bmN0aW9uIEJvYXJkKCkge1xuICAgIHRoaXMuYm9hcmQgPSBbXTtcbn1cblxuQm9hcmQucHJvdG90eXBlLmRyYXdCb2FyZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IDY7IHkrKykge1xuICAgICAgICBpZiAoIXRoaXMuYm9hcmRbeV0pIHRoaXMuYm9hcmRbeV0gPSBbXTtcbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCA2OyB4KyspIHtcbiAgICAgICAgICAgIHRoaXMuYm9hcmRbeV0ucHVzaChuZXcgU3BhY2UoeCwgeSwgdGhpcy5ib2FyZCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmJvYXJkO1xufVxuXG5mdW5jdGlvbiBTcGFjZSh4LCB5LCBib2FyZCkge1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbiAgICB0aGlzLmltYWdlID0gbnVsbDtcbiAgICB0aGlzLnBvaW50cyA9IFtudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsXTtcbiAgICB0aGlzLnRpbGVVcmw7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgICAgbGV0IGNvcnJlc3BvbmRpbmc7XG5cbiAgICAgICAgaWYgKGkgPCAyKSB7IC8vdG9wXG4gICAgICAgICAgICBjb3JyZXNwb25kaW5nID0gaSA9PT0gMCA/IDUgOiA0OyAvLyAwIC0+IDUgJiAxIC0+IDRcbiAgICAgICAgICAgIGlmICh5ID09PSAwKSB0aGlzLnBvaW50c1tpXSA9IG5ldyBQb2ludCh0cnVlKTtcbiAgICAgICAgICAgIGVsc2UgdGhpcy5wb2ludHNbaV0gPSBib2FyZFt5IC0gMV1beF0ucG9pbnRzW2NvcnJlc3BvbmRpbmddO1xuICAgICAgICB9IGVsc2UgaWYgKGkgPCA0KSB7IC8vcmlnaHRcbiAgICAgICAgICAgIGlmICh4ID09PSA1KSB0aGlzLnBvaW50c1tpXSA9IG5ldyBQb2ludCh0cnVlKTtcbiAgICAgICAgICAgIGVsc2UgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQoZmFsc2UpO1xuICAgICAgICB9IGVsc2UgaWYgKGkgPCA2KSB7IC8vYm90dG9tXG4gICAgICAgICAgICBpZiAoeSA9PT0gNSkgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQodHJ1ZSk7XG4gICAgICAgICAgICBlbHNlIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHsgLy9sZWZ0XG4gICAgICAgICAgICBjb3JyZXNwb25kaW5nID0gaSA9PT0gNiA/IDMgOiAyOyAvLyA2IC0+IDMgJiA3IC0+IDJcbiAgICAgICAgICAgIGlmICh4ID09PSAwKSB0aGlzLnBvaW50c1tpXSA9IG5ldyBQb2ludCh0cnVlKTtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucG9pbnRzW2ldID0gYm9hcmRbeV1beCAtIDFdLnBvaW50c1tjb3JyZXNwb25kaW5nXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG4vLyBlZGdlID0gYm9vbGVhblxuZnVuY3Rpb24gUG9pbnQoZWRnZSkge1xuICAgIHRoaXMuZWRnZSA9IGVkZ2U7XG4gICAgdGhpcy5uZWlnaGJvcnMgPSBbXTtcbiAgICB0aGlzLnRyYXZlbGxlZCA9IGZhbHNlO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jbGFzcyBEZWNrIHtcbiAgICBjb25zdHJ1Y3Rvcih0aWxlcykge1xuICAgICAgICB0aGlzLnRpbGVzID0gdGlsZXNcbiAgICB9XG5cbiAgICBzaHVmZmxlKCkge1xuICAgICAgICB0aGlzLnRpbGVzID0gXy5zaHVmZmxlKHRoaXMudGlsZXMpXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGRlYWxUaHJlZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZXMuc3BsaWNlKDAsIDMpO1xuICAgIH1cblxuICAgIGRlYWwobnVtKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGVzLnNwbGljZSgwLCBudW0pO1xuICAgIH1cblxuICAgIHJlbG9hZCh0aWxlcykge1xuICAgICAgICB0aGlzLnRpbGVzLnB1c2godGlsZXMpXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLy9HQU1FLy8vXG5cbmNsYXNzIEdhbWUge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUpIHtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5jb3VudCA9IDM1O1xuICAgICAgICB0aGlzLmJvYXJkID0gbmV3IEJvYXJkKCkuZHJhd0JvYXJkKCk7XG4gICAgICAgIHRoaXMucGxheWVycyA9IFtdO1xuICAgICAgICB0aGlzLmF2YWlsYWJsZU1hcmtlcnMgPSBbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJ5ZWxsb3dcIiwgXCJncmVlblwiLCBcImFxdWFcIiwgXCJibHVlXCIsIFwibmF2eVwiLCBcInB1cnBsZVwiXVxuXG4gICAgICAgIHRoaXMuY3VyclBsYXllcjsgLy9pbmRleCBvZiB0aGUgY3VycmVudFBsYXllciBpbiB0aGUgdHVybk9yZGVyQXJyYXlcbiAgICAgICAgdGhpcy50dXJuT3JkZXJBcnJheSA9IFtdIC8vaG9sZHMgYWxsIHRoZSBwbGF5ZXJzIHN0aWxsIG9uIHRoZSBib2FyZC5cbiAgICAgICAgdGhpcy5kcmFnb24gPSBcIlwiOyAvLyBQbGF5ZXIuTWFya2VyXG4gICAgICAgIHRoaXMubW92ZXM7XG4gICAgfVxuXG4gICAgZ2V0Q3VycmVudFBsYXllcigpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VyclBsYXllciA9PT0gLTEpIHJldHVybjtcbiAgICAgICAgcmV0dXJuIHRoaXMudHVybk9yZGVyQXJyYXlbdGhpcy5jdXJyUGxheWVyXTtcbiAgICB9XG5cbiAgICBtb3ZlQWxsUGxheWVycygpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLmZvckVhY2goKHBsYXllcikgPT4gcGxheWVyLmtlZXBNb3ZpbmcocGxheWVyKSlcbiAgICB9XG5cbiAgICBkZWFkUGxheWVycygpIHtcbiAgICAgICAgdmFyIGRlYWRQbGF5ZXJzVGlsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLmZvckVhY2goZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICAgICAgaWYgKCFwbGF5ZXIuY2FuUGxheSAmJiBwbGF5ZXIudGlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGRlYWRQbGF5ZXJzVGlsZXMucHVzaChwbGF5ZXIudGlsZXMpO1xuICAgICAgICAgICAgICAgIGlzRGVhZFBsYXllciA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZGVhZFBsYXllcnNUaWxlcztcbiAgICB9XG5cbiAgICBjaGVja092ZXIoKSB7XG4gICAgICAgIHJldHVybiBnZXRDYW5QbGF5KCkubGVuZ3RoIDw9IDE7XG4gICAgfVxuXG4gICAgLy90byBiZSBjYWxsZWQgYXQgdGhlIGVuZCBvZiBhIHR1cm4gdG8gc2V0IHRoZSBjdXJyUGxheWVyIHRvIHRoZSBuZXh0IGVsaWdpYmxlIHBsYXllciBpbiB0aGUgdHVybk9yZGVyQXJyYXlcbiAgICBnb1RvTmV4dFBsYXllcigpIHtcbiAgICAgICAgaWYgKGdldENhblBsYXkodGhpcy50dXJuT3JkZXJBcnJheSkubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgbGV0IG5ld0lkeCA9IHRoaXMuY3VyclBsYXllciArIDE7XG4gICAgICAgICAgICB3aGlsZSAoIXRoaXMudHVybk9yZGVyQXJyYXlbbmV3SWR4ICUgOF0uY2FuUGxheSkge1xuICAgICAgICAgICAgICAgIG5ld0lkeCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdXJyUGxheWVyID0gbmV3SWR4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jdXJyUGxheWVyID0gLTE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q3VycmVudFBsYXllcigpO1xuICAgIH1cblxuICAgIGRlYWwobnVtKXtcbiAgICAgICAgdmFyIHRpbGVzID0gW11cbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IG51bTsgaSsrKXtcbiAgICAgICAgICAgIHRoaXMuZGVjay4kcmVtb3ZlKDApLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgICAgICAgICAgICAgdGlsZXMucHVzaChkYXRhKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aWxlcztcbiAgICB9XG5cbiAgICAvL3Jlc3RhcnQgdGhlIGdhbWVcbiAgICByZXNldCgpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgICAgIC8vcmV0cmlldmUgYWxsIHRpbGVzXG4gICAgICAgICAgICAvL3JldHVybiBwbGF5ZXIncyB0aWxlcyB0byB0aGUgZGVjayBhbmQgc2h1ZmZsZVxuICAgICAgICAgICAgdGhpcy5kZWNrLnJlbG9hZChwbGF5ZXIudGlsZXMpLnNodWZmbGUoKTtcbiAgICAgICAgICAgIHBsYXllci50aWxlcyA9IFtdO1xuICAgICAgICAgICAgLy9yZXNldCBhbGwgcGxheWVycyBwbGF5YWJpbGl0eVxuICAgICAgICAgICAgcGxheWVyLmNhblBsYXkgPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbn1cblxuLy8vLy9FTkQgT0YgR0FNRSBDTEFTUy8vLy8vXG5cbi8vZ2V0IEVsaWdpYmxlIHBsYXllcnNcbmxldCBnZXRDYW5QbGF5ID0gZnVuY3Rpb24gKHBsYXllcnMpIHtcbiAgICByZXR1cm4gcGxheWVycy5maWx0ZXIoKHBsYXllcikgPT4ge1xuICAgICAgICByZXR1cm4gcGxheWVyLmNhblBsYXlcbiAgICB9KVxufVxuIiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnZ2FtZScsIHtcblx0XHR1cmw6ICcvZ2FtZS86Z2FtZU5hbWUnLFxuXHRcdHRlbXBsYXRlVXJsOiAnL2Jyb3dzZXIvanMvZ2FtZS9nYW1lLmh0bWwnLFxuXHRcdGNvbnRyb2xsZXI6ICdnYW1lQ3RybCdcblx0fSk7XG59KTtcblxudHN1cm8uY29udHJvbGxlcignZ2FtZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkZmlyZWJhc2VBdXRoLCBmaXJlYmFzZVVybCwgJHN0YXRlUGFyYW1zLCAkZmlyZWJhc2VPYmplY3QsICRmaXJlYmFzZUFycmF5KSB7XG5cdCRzY29wZS50aWxlID0ge1xuXHRcdGltYWdlVXJsOiBcIlwiLFxuXHRcdHBhdGhzOiBbMywgNCwgNiwgMCwgMSwgNywgMiwgNV0sXG5cdFx0cm90YXRpb246IDBcblx0fTtcblxuXG5cdC8vIHZhciBvYmogPSAkZmlyZWJhc2VPYmplY3QocmVmKTtcblx0dmFyIHJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XG5cdHZhciBnYW1lUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKCRzdGF0ZVBhcmFtcy5nYW1lTmFtZSk7XG5cblx0dmFyIGRlY2tSZWYgPSBnYW1lUmVmLmNoaWxkKCdpbml0aWFsRGVjaycpO1xuXHR2YXIgcGxheWVyc1JlZiA9IGdhbWVSZWYuY2hpbGQoJ3BsYXllcnMnKTtcblx0dmFyIG1hcmtlcnNSZWYgPSBnYW1lUmVmLmNoaWxkKCdhdmFpbGFibGVNYXJrZXJzJyk7XG5cdHZhciBkZWNrQXJyID0gJGZpcmViYXNlQXJyYXkoZGVja1JlZik7XG5cdHZhciBmaXJlYmFzZVBsYXllcnNBcnIgPSAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKTtcblxuXHQvKioqKioqKioqKioqKioqKlxuXHRJTklUSUFMSVpJTkcgR0FNRVxuXHQqKioqKioqKioqKioqKioqL1xuXG5cdC8vbmV3IGxvY2FsIGdhbWUgd2l0aCBnYW1lIG5hbWUgZGVmaW5lZCBieSB1cmxcblx0JHNjb3BlLmdhbWUgPSBuZXcgR2FtZSgkc3RhdGVQYXJhbXMuZ2FtZU5hbWUpO1xuXG5cdC8vd2hlbiB0aGUgZGVjayBpcyBsb2FkZWQuLi5cblx0ZGVja0Fyci4kbG9hZGVkKCkudGhlbihmdW5jdGlvbihkYXRhKXtcblx0XHQvLyAkc2NvcGUuZ2FtZS5kZWNrID0gZGF0YVswXTsgLy9hZGQgdGhlIGRlY2sgdG8gdGhlIGxvY2FsIGdhbWUgPyBUcnkgdGhpcyBhcyBmaXJlYmFzZSBEZWNrQXJyPz8/P1xuXHRcdCRzY29wZS5nYW1lLmRlY2sgPSBkZWNrQXJyOyAvL2FkZCB0aGUgZGVjayB0byB0aGUgbG9jYWwgZ2FtZSA/IFRyeSB0aGlzIGFzIGZpcmViYXNlIERlY2tBcnI/Pz8/XG5cblxuXHRcdC8vZG9uJ3Qgc3RhcnQgd2F0Y2hpbmcgcGxheWVycyB1bnRpbCB0aGVyZSBpcyBhIGRlY2sgaW4gdGhlIGdhbWVcblx0XHRwbGF5ZXJzUmVmLm9uKFwidmFsdWVcIiwgZnVuY3Rpb24gKHNuYXApIHtcblx0XHRcdHZhciBzbmFwUGxheWVycyA9IHNuYXAudmFsKCk7IC8vZ3JhYiB0aGUgdmFsdWUgb2YgdGhlIHNuYXBzaG90IChhbGwgcGxheWVycyBpbiBnYW1lIGluIEZpcmViYXNlKVxuXG5cdFx0XHQvL2ZvciBlYWNoIHBsYXllciBpbiB0aGlzIGNvbGxlY3Rpb24uLi5cblx0XHRcdGZvcih2YXIgcGxheWVyIGluIHNuYXBQbGF5ZXJzKXtcblx0XHRcdFx0dmFyIGV4aXN0aW5nUGxheWVySW5kZXgsIHRoaXNJc0FOZXdQbGF5ZXI7XG5cblx0XHRcdFx0Ly9maW5kIHRoaXMgJ3NuYXAnIHBsYXllcidzIGluZGV4IGluIGxvY2FsIGdhbWUuIGZpbmQgcmV0dXJucyB0aGF0IHZhbHVlLiBcblx0XHRcdFx0dmFyIGxvY2FsUGxheWVyID0gJHNjb3BlLmdhbWUucGxheWVycy5maW5kKGZ1bmN0aW9uKHBseXIsIHBseXJJZHgpe1xuXHRcdFx0XHRcdGV4aXN0aW5nUGxheWVySW5kZXggPSBwbHlySWR4O1xuXHRcdFx0XHRcdHJldHVybiBwbHlyLnVpZCA9PT0gc25hcFBsYXllcnNbcGxheWVyXS51aWQ7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vaWYgbm90IGZvdW5kLCBjcmVhdGUgbmV3IHBsYXllclxuXHRcdFx0XHRpZighbG9jYWxQbGF5ZXIpe1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCdpIGRpZG50IGZpbmQgYSBsb2NhbCBwbGF5ZXIhJyk7XG5cdFx0XHRcdFx0bG9jYWxQbGF5ZXIgPSBuZXcgUGxheWVyKHNuYXBQbGF5ZXJzW3BsYXllcl0udWlkKTtcblx0XHRcdFx0XHR0aGlzSXNBTmV3UGxheWVyID0gdHJ1ZTtcblx0XHRcdFx0fVx0XG5cblx0XHRcdFx0Ly9mb3IgZWFjaCBrZXkgaW4gdGhlIHNuYXBQbGF5ZXIncyBrZXlzLCBhZGQgdGhhdCBrZXkgYW5kIHZhbHVlIHRvIGxvY2FsIHBsYXllclxuXHRcdFx0XHRmb3IodmFyIHBsYXllcnByb3BlcnR5IGluIHNuYXBQbGF5ZXJzW3BsYXllcl0pe1xuXHRcdFx0XHRcdGxvY2FsUGxheWVyW3BsYXllcnByb3BlcnR5XSA9IHNuYXBQbGF5ZXJzW3BsYXllcl1bcGxheWVycHJvcGVydHldO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bG9jYWxQbGF5ZXIudGlsZXMgPSAkc2NvcGUuZ2FtZS5kZWFsKDMpO1xuXG5cdFx0XHRcdC8vcHVzaCBsb2NhbCBwbGF5ZXIgdG8gZ2FtZS5wbGF5ZXJzXG5cdFx0XHRcdGlmKHRoaXNJc0FOZXdQbGF5ZXIpICRzY29wZS5nYW1lLnBsYXllcnMucHVzaChsb2NhbFBsYXllcik7XG5cdFx0XHRcdGVsc2UgJHNjb3BlLmdhbWUucGxheWVyc1tleGlzdGluZ1BsYXllckluZGV4XSA9IGxvY2FsUGxheWVyO1xuXHRcdFx0XHRjb25zb2xlLmxvZygkc2NvcGUuZ2FtZS5wbGF5ZXJzKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHR9KTtcblxuXHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKCdkZWNrPycsICRzY29wZS5nYW1lLmRlY2spO1xuXHRcdFx0XHRcdC8vIGxvY2FsUGxheWVyLnRpbGVzID0gJHNjb3BlLmdhbWUuZGVhbCgzKTtcblxuXHR2YXIgbWFya2Vyc0FyciA9ICRmaXJlYmFzZUFycmF5KG1hcmtlcnNSZWYpOyBcdC8vc3RvcmUgbWFya2VycyBhcnJheVxuXG5cdC8vd2hlbiB0aGF0IG1hcmtlcnMgYXJyYXkgaXMgbG9hZGVkLCB1cGRhdGUgdGhlIGF2YWlsYWJsZSBtYXJrZXJzIGFycmF5IG9uIHNjb3BlXG5cdG1hcmtlcnNBcnIuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcblx0XHQkc2NvcGUuZ2FtZS5hdmFpbGFibGVNYXJrZXJzID0gZGF0YVswXTtcblx0fSk7XG5cblx0Ly9pZiBzb21lb25lIGVsc2UgcGlja3MgYSBtYXJrZXIsIHVwZGF0ZSB5b3VyIHZpZXdcblx0bWFya2Vyc1JlZi5vbignY2hpbGRfY2hhbmdlZCcsIGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0JHNjb3BlLmdhbWUuYXZhaWxhYmxlTWFya2VycyA9IGRhdGEudmFsKCk7XG5cdH0pO1xuXG5cdC8vb24gbG9naW4sIGZpbmQgbWUgaW4gdGhlIGZpcmViYXNlIHBsYXllcnMgYXJyYXlcblx0ZmlyZWJhc2UuYXV0aCgpLm9uQXV0aFN0YXRlQ2hhbmdlZChmdW5jdGlvbiAodXNlcikge1xuXG5cdFx0ZmlyZWJhc2VQbGF5ZXJzQXJyLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0XHR2YXIgRkJwbGF5ZXJzID0gZGF0YTtcblx0XHRcdGlmICh1c2VyKSB7XG5cdFx0XHRcdHZhciBtZSA9IEZCcGxheWVycy5maWx0ZXIocGxheWVyID0+IHBsYXllci51aWQgPT09IHVzZXIudWlkKVswXTtcblx0XHRcdFx0aWYgKG1lKSB7XG5cdFx0XHRcdFx0JHNjb3BlLm1lID0gbWU7XG5cdFx0XHRcdFx0JHNjb3BlLm1lLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUGxheWVyLnByb3RvdHlwZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCRzY29wZS5tZS5tYXJrZXIgPT09IFwiblwiKSAkc2NvcGUubWUubWFya2VyID0gbnVsbDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIE5vIHVzZXIgaXMgc2lnbmVkIGluLlxuXHRcdFx0XHRjb25zb2xlLmxvZyhcIm5vIG9uZSBpcyBzaWduZWQgaW5cIik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0pO1xuXG5cblx0LyoqKioqKioqKioqKioqKipcblx0QVZBSUxBQkxFIFBMQVlFUiBBQ1RJT05TIEFUIEdBTUUgU1RBUlRcblx0KioqKioqKioqKioqKioqKi9cblxuXHQkc2NvcGUucGlja01hcmtlciA9IGZ1bmN0aW9uIChib2FyZCwgbWFya2VyKSB7XG5cdFx0JHNjb3BlLm1lLm1hcmtlciA9IG1hcmtlcjtcblxuXHRcdGZpcmViYXNlUGxheWVyc0Fyci4kbG9hZGVkKClcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG5cdFx0XHRcdHZhciBtZUlkeDtcblx0XHRcdFx0Ly9maW5kIG15IGluZGV4IGluIHRoZSBwbGF5ZXJzIGFycmF5XG5cdFx0XHRcdHBsYXllcnMuZmluZChmdW5jdGlvbiAoZSwgaSkge1xuXHRcdFx0XHRcdGlmIChlLiRpZCA9PT0gJHNjb3BlLm1lLiRpZCkgbWVJZHggPSBpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0Ly9naXZlIG1lIGEgbWFya2VyIGFuZCBzYXZlIG1lIGluIGZpcmViYXNlXG5cdFx0XHRcdGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0ubWFya2VyID0gbWFya2VyO1xuXHRcdFx0XHRmaXJlYmFzZVBsYXllcnNBcnIuJHNhdmUobWVJZHgpO1xuXHRcdFx0fSk7XG5cblx0XHR2YXIgaWR4ID0gJHNjb3BlLmdhbWUuYXZhaWxhYmxlTWFya2Vycy5pbmRleE9mKG1hcmtlcik7XG5cblx0XHRtYXJrZXJzQXJyWzBdLnNwbGljZShpZHgsIDEpO1xuXG5cdFx0bWFya2Vyc0Fyci4kc2F2ZSgwKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlZikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcInJlbW92ZWQgdGhlIHBpY2tlZCBtYXJrZXJcIik7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHJlZi5rZXkpO1xuXHRcdFx0fSk7XG5cdH07XG5cblx0Ly9IYXZlIHBsYXllciBwaWNrIHRoZWlyIHN0YXJ0IHBvaW50XG5cdCRzY29wZS5wbGFjZU1hcmtlciA9IGZ1bmN0aW9uIChib2FyZCwgcG9pbnQpIHtcblx0XHRjb25zb2xlLmxvZygkc2NvcGUubWUpO1xuXHRcdCRzY29wZS5tZS5wcm90b3R5cGUucGxhY2VNYXJrZXIoYm9hcmQsIHBvaW50LCAkc2NvcGUubWUpO1xuXHRcdCRzY29wZS5nYW1lLnBsYXllcnMucHVzaCgkc2NvcGUubWUpO1xuXHRcdC8vIHZhciBmaXJlYmFzZVBsYXllcnNBcnIgPSAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKTtcblxuXHRcdGZpcmViYXNlUGxheWVyc0Fyci4kbG9hZGVkKClcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG5cdFx0XHRcdHZhciBtZUlkeDtcblxuXHRcdFx0XHRwbGF5ZXJzLmZpbmQoZnVuY3Rpb24gKGUsIGkpIHtcblx0XHRcdFx0XHRpZiAoZS4kaWQgPT09ICRzY29wZS5tZS4kaWQpIG1lSWR4ID0gaTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0ZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XSA9ICRzY29wZS5tZTtcblx0XHRcdFx0ZmlyZWJhc2VQbGF5ZXJzQXJyLiRzYXZlKG1lSWR4KTtcblx0XHRcdH0pO1xuXG5cdH07XG5cblxuXG5cblxuXG5cblxuXHQvLyBUT0RPOiB3ZSBwcm9iYWJseSBuZWVkIHRoaXMgb24gZmlyZWJhc2Ugc28gb3RoZXIgcGVvcGxlIGNhbid0IHBpY2sgd2hhdCdzIGJlZW4gcGlja2VkXG5cblx0Ly9Gb3Igc3luY2hyb25pemluZ0dhbWUuLi5cblx0dmFyIHN5bmNSZWYgPSBnYW1lUmVmLmNoaWxkKCdtb3ZlcycpO1xuXHRzeW5jUmVmLm9uKCdjaGlsZF9hZGRlZCcsIGZ1bmN0aW9uIChjaGlsZFNuYXBzaG90LCBwcmV2Q2hpbGRLZXkpIHtcblx0XHQvL05FRUQgVE8gRE9VQkxFIENIRUNLISEgV2hhdCBkb2VzIGNoaWxkU25hcCByZXR1cm5zP1xuXHRcdGNvbnNvbGUubG9nKCdjaGlsZFNuYXBzaG90X1N5bmNHYW1lJywgY2hpbGRTbmFwc2hvdCk7XG5cdFx0Ly9kZXBlbmRpbmcgb24gd2hhdCBjaGlsZFNuYXBzaG90IGdpdmVzIG1lLi4uSSB0aGluayBpdCdzIG9uZSBjaGlsZCBwZXIgb24gY2FsbD8gSXQgZG9lc24ndCByZXR1cm4gYW4gYXJyYXkgb2YgY2hhbmdlcy4uLkkgYmVsaWV2ZSFcblx0XHRpZiAoY2hpbGRTbmFwc2hvdC50eXBlID09PSAndXBkYXRlRGVjaycpIHtcblx0XHRcdCRzY29wZS5nYW1lLmRlY2sgPSBjaGlsZFNuYXBzaG90LnVwZGF0ZURlY2s7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCRzY29wZS5wbGFjZVRpbGUoY2hpbGRTbmFwc2hvdC50aWxlKTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vIFRPRE86IGhvdyB0byByZS1kbyB0aGUgbW92ZXM/XG5cdC8vICRzY29wZS5nYW1lLm1vdmVzO1xuXG5cdC8vIFRPRE86IGhvdyBkbyB3ZSBzaG93IHRoZSB0aWxlcyBmb3IgcGxheWVyP1xuXG5cdC8vIFRPRE86IGhvdyB0byBzaG93IHRoZSByb3RhdGVkIHRpbGU/XG5cblx0Ly8gQ01UOiBhc3N1bWluZyB3ZSB1c2UgbmV3IEdhbWUoKSBmb3IgZWFjaCBnYW1lXG5cdCRzY29wZS5jdXJyZW50UGxheWVyID0gJHNjb3BlLmdhbWUuZ2V0Q3VycmVudFBsYXllcigpO1xuXG5cdC8vIFRPRE86IG5lZWQgYSBmdW5jdGlvbiB0byBhc3NpZ24gZHJhZ29uXG5cdCRzY29wZS5kcmFnb247XG5cdHZhciBhd2FpdGluZ0RyYWdvbkhvbGRlcnMgPSBbXTtcblxuXHQkc2NvcGUuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0Ly9cblx0fTtcblxuXHQkc2NvcGUubXlUdXJuID0gZnVuY3Rpb24gKCkge1xuXHRcdCRzY29wZS5tZSA9PT0gJHNjb3BlLmN1cnJlbnRQbGF5ZXI7XG5cdH07XG5cblx0Ly90aGVzZSBhcmUgdGllZCB0byBhbmd1bGFyIG5nLWNsaWNrIGJ1dHRvbnNcblx0JHNjb3BlLnJvdGF0ZVRpbGVDdyA9IGZ1bmN0aW9uICh0aWxlKSB7XG5cdFx0Y29uc29sZS5sb2coXCJyb3RhdGUgdG8gcmlnaHRcIilcblx0XHR0aWxlLnJvdGF0aW9uKys7XG5cdFx0aWYgKHRpbGUucm90YXRpb24gPT09IDQpIHRpbGUucm90YXRpb24gPSAwO1xuXHR9O1xuXG5cdCRzY29wZS5yb3RhdGVUaWxlQ2N3ID0gZnVuY3Rpb24gKHRpbGUpIHtcblx0XHR0aWxlLnJvdGF0aW9uLS07XG5cdFx0aWYgKHRpbGUucm90YXRpb24gPT09IC00KSB0aWxlLnJvdGF0aW9uID0gMDtcblx0fTtcblxuXG5cdC8vIENNVDogdXNlIHBsYXllcidzIGFuZCBnYW1lJ3MgcHJvdG90eXBlIGZ1bmN0aW9uIHRvIHBsYWNlIHRpbGUgYW5kIHRoZW4gbW92ZSBhbGwgcGxheWVyc1xuXHQkc2NvcGUucGxhY2VUaWxlID0gZnVuY3Rpb24gKHRpbGUpIHtcblx0XHQvLyBUT0RPOiBzZW5kIHRoaXMgc3RhdGUgdG8gZmlyZWJhc2UgZXZlcnkgdGltZSBpdCdzIGNhbGxlZFxuXHRcdGlmICh0aWxlLnJvdGF0aW9uID4gMCkge1xuXHRcdFx0dGlsZS5wYXRocyA9IHRpbGUucGF0aHMubWFwKGZ1bmN0aW9uIChjb25uZWN0aW9uKSB7XG5cdFx0XHRcdGNvbm5lY3Rpb24gPSBjb25uZWN0aW9uICsgMjtcblx0XHRcdFx0aWYgKGNvbm5lY3Rpb24gPT09IDkpIGNvbm5lY3Rpb24gPSAxO1xuXHRcdFx0XHRpZiAoY29ubmVjdGlvbiA9PT0gOCkgY29ubmVjdGlvbiA9IDA7XG5cdFx0XHRcdHJldHVybiBjb25uZWN0aW9uO1xuXHRcdFx0fSk7XG5cdFx0XHR0aWxlLnBhdGhzLnVuc2hpZnQodGlsZS5wYXRocy5wb3AoKSk7XG5cdFx0XHR0aWxlLnBhdGhzLnVuc2hpZnQodGlsZS5wYXRocy5wb3AoKSk7XG5cdFx0fSBlbHNlIGlmICh0aWxlLnJvdGF0aW9uIDwgMCkge1xuXHRcdFx0dGlsZS5wYXRocyA9IHRpbGUucGF0aHMubWFwKGZ1bmN0aW9uIChjb25uZWN0aW9uKSB7XG5cdFx0XHRcdGNvbm5lY3Rpb24gPSBjb25uZWN0aW9uIC0gMjtcblx0XHRcdFx0aWYgKGNvbm5lY3Rpb24gPT09IC0yKSBjb25uZWN0aW9uID0gNjtcblx0XHRcdFx0aWYgKGNvbm5lY3Rpb24gPT09IC0xKSBjb25uZWN0aW9uID0gNztcblx0XHRcdFx0cmV0dXJuIGNvbm5lY3Rpb247XG5cdFx0XHR9KTtcblx0XHRcdHRpbGUucGF0aHMucHVzaCh0aWxlLnBhdGhzLnNoaWZ0KCkpO1xuXHRcdFx0dGlsZS5wYXRocy5wdXNoKHRpbGUucGF0aHMuc2hpZnQoKSk7XG5cdFx0fVxuXG5cdFx0JHNjb3BlLm1lLnByb3RvdHlwZS5wbGFjZVRpbGUodGlsZSwgJHNjb3BlLm1lKTtcblx0XHRjb25zb2xlLmxvZygkc2NvcGUubWUpO1xuXG5cdFx0Ly8gQ01UOiB0aGlzIHNob3VsZCBzZW5kIHRoZSByb3RhdGVkIHRpbGUgdG8gZmlyZWJhc2Vcblx0XHRnYW1lUmVmLmNoaWxkKCdtb3ZlcycpLiRhZGQoe1xuXHRcdFx0J3R5cGUnOiAncGxhY2VUaWxlJyxcblx0XHRcdCd0aWxlJzogdGlsZVxuXHRcdH0pO1xuXHRcdC8vXG5cdFx0Ly8gJHNjb3BlLmdhbWUubW92ZUFsbHBsYXllcnMoKTtcblx0XHQvL1xuXHRcdC8vIGlmICgkc2NvcGUuZ2FtZS5jaGVja092ZXIoKSkge1xuXHRcdC8vICAgICAvLyBUT0RPOiBuZWVkIHRvIHRlbGwgdGhlIHBsYXllciBzaGUgd29uXG5cdFx0Ly8gICAgICRzY29wZS53aW5uZXIgPSAkc2NvcGUuZ2FtZS5nZXRDYW5QbGF5KClbMF07XG5cdFx0Ly8gICAgICRzY29wZS5nYW1lT3ZlciA9IHRydWU7XG5cdFx0Ly8gfSBlbHNlIHtcblx0XHQvLyAgICAgLy8gSWYgZGVjayBpcyBlbXB0eSAmIG5vIG9uZSBpcyBkcmFnb24sIHNldCBtZSBhcyBkcmFnb25cblx0XHQvLyAgICAgaWYgKCRzY29wZS5nYW1lLmRlY2subGVuZ3RoID09PSAwICYmICEkc2NvcGUuZHJhZ29uKSB7XG5cdFx0Ly8gICAgICAgICAkc2NvcGUuZHJhZ29uID0gJHNjb3BlLm1lO1xuXHRcdC8vICAgICB9IGVsc2UgaWYgKCRzY29wZS5nYW1lLmRlY2subGVuZ3RoID09PSAwICYmICRzY29wZS5kcmFnb24pIHtcblx0XHQvLyAgICAgICAgIGF3YWl0aW5nRHJhZ29uSG9sZGVycy5wdXNoKCRzY29wZS5tZSk7XG5cdFx0Ly8gICAgIH0gZWxzZSB7XG5cdFx0Ly8gICAgICAgICAvLyBDTVQ6IGRyYXcgb25lIHRpbGUgYW5kIHB1c2ggaXQgdG8gdGhlIHBsYXllci50aWxlcyBhcnJheVxuXHRcdC8vICAgICAgICAgJHNjb3BlLm1lLnRpbGVzLnB1c2goJHNjb3BlLmdhbWUuZGVjay5kZWFsKDEpKTtcblx0XHQvLyAgICAgICAgIC8vaWYgZGVhZCBwbGF5ZXJzLCB0aGVuIHB1c2ggdGhlaXIgY2FyZHMgYmFjayB0byB0aGUgZGVjayAmIHJlc2h1ZmZsZVxuXHRcdC8vICAgICAgICAgaWYgKCRzY29wZS5nYW1lLmRlYWRQbGF5ZXJzKCkubGVuZ3RoKSB7XG5cdFx0Ly8gICAgICAgICAgICAgLy93aXRoIG5ldyBjYXJkcyAmIG5lZWQgdG8gcmVzaHVmZmxlXG5cdFx0Ly8gICAgICAgICAgICAgJHNjb3BlLmdhbWUuZGVhZFBsYXllcnMoKS5mb3JFYWNoKGZ1bmN0aW9uIChkZWFkUGxheWVyVGlsZXMpIHtcblx0XHQvLyAgICAgICAgICAgICAgICAgZGVhZFBsYXllclRpbGVzLmZvckVhY2goZnVuY3Rpb24gKHRpbGUpIHtcblx0XHQvLyAgICAgICAgICAgICAgICAgICAgICRzY29wZS5nYW1lLmRlY2sucHVzaCh0aWxlKTtcblx0XHQvLyAgICAgICAgICAgICAgICAgfSk7XG5cdFx0Ly8gICAgICAgICAgICAgfSk7XG5cdFx0Ly8gICAgICAgICAgICAgJHNjb3BlLmdhbWUuZGVjayA9ICRzY29wZS5nYW1lLmRlY2suc2h1ZmZsZSgpO1xuXHRcdC8vICAgICAgICAgICAgIC8vc2VuZCBmaXJlYmFzZSBhIG5ldyBtb3ZlXG5cdFx0Ly8gICAgICAgICAgICAgZ2FtZVJlZi5jaGlsZCgnbW92ZXMnKS5wdXNoKHtcblx0XHQvLyAgICAgICAgICAgICAgICAgJ3R5cGUnOiAndXBkYXRlRGVjaycsXG5cdFx0Ly8gICAgICAgICAgICAgICAgICd1cGRhdGVEZWNrJzogJHNjb3BlLmdhbWUuZGVja1xuXHRcdC8vICAgICAgICAgICAgIH0pO1xuXHRcdC8vICAgICAgICAgICAgIGlmICgkc2NvcGUuZHJhZ29uKSB7XG5cdFx0Ly8gICAgICAgICAgICAgICAgICRzY29wZS5kcmFnb24udGlsZXMucHVzaCgkc2NvcGUuZ2FtZS5kZWNrLmRlYWwoMSkpO1xuXHRcdC8vICAgICAgICAgICAgICAgICAkc2NvcGUuZHJhZ29uID0gbnVsbDtcblx0XHQvLyAgICAgICAgICAgICAgICAgLy9ORUVEIFRPIERJU0NVU1M6IE1pZ2h0IG5lZWQgdG8gbW9kaWZ5IHRoaXMgaWYgd2Ugd2FudCB0byB1c2UgdXAgdGhlIGNhcmRzIGFuZCBnaXZlIGVhY2ggYXdhaXRpbmcgcGxheWVycycgdXAgdG8gMyBjYXJkc1xuXHRcdC8vICAgICAgICAgICAgICAgICB3aGlsZSAoJHNjb3BlLmdhbWUuZGVjay5sZW5ndGggJiYgJHNjb3BlLmF3YWl0aW5nRHJhZ29uSG9sZGVycy5sZW5ndGgpIHtcblx0XHQvLyAgICAgICAgICAgICAgICAgICAgICRzY29wZS5hd2FpdGluZ0RyYWdvbkhvbGRlcnMuc2hpZnQoKS50aWxlcy5wdXNoKCRzY29wZS5nYW1lLmRlY2suZGVhbCgxKSk7XG5cdFx0Ly8gICAgICAgICAgICAgICAgIH07XG5cdFx0Ly8gICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuYXdhaXRpbmdEcmFnb25Ib2xkZXJzLmxlbmd0aCkge1xuXHRcdC8vICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRyYWdvbiA9ICRzY29wZS5hd2FpdGluZ0RyYWdvbkhvbGRlcnMuc2hpZnQoKTtcblx0XHQvLyAgICAgICAgICAgICAgICAgfVxuXHRcdC8vICAgICAgICAgICAgIH07XG5cdFx0Ly8gICAgICAgICB9XG5cdFx0Ly9cblx0XHQvLyAgICAgfVxuXHRcdC8vICAgICAkc2NvcGUuZ2FtZS5nb1RvTmV4dFBsYXllcigpO1xuXHRcdC8vIH1cblx0fTtcblxuXHQvLyBUT0RPOiBmaXJlYmFzZSBnYW1lLnBsYXllcnMgc2xpY2UgJHNjb3BlLnBsYXllciBvdXRcblx0JHNjb3BlLmxlYXZlR2FtZTtcblxuXHQvLyBUT0RPOiBuZWVkIHRvIHJlbW92ZSB0aGlzIGdhbWUgcm9vbSdzIG1vdmVzIGZyb20gZmlyZWJhc2U/XG5cdCRzY29wZS5yZXNldCA9IGZ1bmN0aW9uICgpIHtcblx0XHRtYXJrZXJzQXJyLiRyZW1vdmUoMClcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZWYpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJyZW1vdmVkIGFsbCBtYXJrZXJzXCIsIHJlZi5rZXkpXG5cdFx0XHR9KTtcblxuXHRcdGRlY2tBcnIuJHJlbW92ZSgwKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlZikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcInJlbW92ZWQgdGhlIGRlY2tcIiwgcmVmLmtleSlcblx0XHRcdH0pO1xuXG5cdFx0b2JqLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0XHR2YXIgdGlsZXMgPSBkYXRhLnRpbGVzXG5cdFx0XHR2YXIgZGVjayA9IG5ldyBEZWNrKHRpbGVzKS5zaHVmZmxlKCkudGlsZXM7XG5cdFx0XHR2YXIgaW5pdGlhbERlY2tSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoJHN0YXRlUGFyYW1zLmdhbWVOYW1lKS5jaGlsZCgnaW5pdGlhbERlY2snKTtcblx0XHRcdCRmaXJlYmFzZUFycmF5KGluaXRpYWxEZWNrUmVmKS4kYWRkKGRlY2spO1xuXHRcdH0pXG5cblxuXG5cdFx0dmFyIGluaXRpYWxNYXJrZXJzUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKCRzdGF0ZVBhcmFtcy5nYW1lTmFtZSkuY2hpbGQoJ2F2YWlsYWJsZU1hcmtlcnMnKTtcblx0XHQkZmlyZWJhc2VBcnJheShpbml0aWFsTWFya2Vyc1JlZikuJGFkZChbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJ5ZWxsb3dcIiwgXCJncmVlblwiLCBcImFxdWFcIiwgXCJibHVlXCIsIFwibmF2eVwiLCBcInB1cnBsZVwiXSk7XG5cblxuXHRcdHZhciBwbGF5ZXJzID0gJGZpcmViYXNlQXJyYXkocGxheWVyc1JlZik7XG5cdFx0cGxheWVycy4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGRhdGFbaV0uY2FuUGxheSA9IHRydWU7XG5cdFx0XHRcdGRhdGFbaV0ubWFya2VyID0gJ24nO1xuXHRcdFx0XHRkYXRhW2ldLm5leHRTcGFjZSA9ICduJztcblx0XHRcdFx0ZGF0YVtpXS5uZXh0U3BhY2VQb2ludHNJbmRleCA9ICduJztcblx0XHRcdFx0ZGF0YVtpXS5wb2ludCA9ICduJztcblx0XHRcdFx0ZGF0YVtpXS50aWxlcyA9ICduJztcblx0XHRcdFx0cGxheWVycy4kc2F2ZShpKTtcblx0XHRcdH1cblx0XHR9KVxuXG5cdFx0Y29uc29sZS5sb2coJHNjb3BlLm1lKVxuXG5cdH07XG5cblxuXHQkc2NvcGUuc3RhcnR0b3AgPSBbXG5cdFx0WzAsIDAsIDBdLFxuXHRcdFswLCAwLCAxXSxcblx0XHRbMSwgMCwgMF0sXG5cdFx0WzEsIDAsIDFdLFxuXHRcdFsyLCAwLCAwXSxcblx0XHRbMiwgMCwgMV0sXG5cdFx0WzMsIDAsIDBdLFxuXHRcdFszLCAwLCAxXSxcblx0XHRbNCwgMCwgMF0sXG5cdFx0WzQsIDAsIDFdLFxuXHRcdFs1LCAwLCAwXSxcblx0XHRbNSwgMCwgMV1cblx0XTtcblx0JHNjb3BlLnN0YXJ0bGVmdCA9IFtcblx0XHRbMCwgMCwgN10sXG5cdFx0WzAsIDAsIDZdLFxuXHRcdFswLCAxLCA3XSxcblx0XHRbMCwgMSwgNl0sXG5cdFx0WzAsIDIsIDddLFxuXHRcdFswLCAyLCA2XSxcblx0XHRbMCwgMywgN10sXG5cdFx0WzAsIDMsIDZdLFxuXHRcdFswLCA0LCA3XSxcblx0XHRbMCwgNCwgNl0sXG5cdFx0WzAsIDUsIDddLFxuXHRcdFswLCA1LCA2XVxuXHRdO1xuXHQkc2NvcGUuc3RhcnRib3R0b20gPSBbXG5cdFx0WzAsIDUsIDBdLFxuXHRcdFswLCA1LCAxXSxcblx0XHRbMSwgNSwgMF0sXG5cdFx0WzEsIDUsIDFdLFxuXHRcdFsyLCA1LCAwXSxcblx0XHRbMiwgNSwgMV0sXG5cdFx0WzMsIDUsIDBdLFxuXHRcdFszLCA1LCAxXSxcblx0XHRbNCwgNSwgMF0sXG5cdFx0WzQsIDUsIDFdLFxuXHRcdFs1LCA1LCAwXSxcblx0XHRbNSwgNSwgMV1cblx0XTtcblx0JHNjb3BlLnN0YXJ0cmlnaHQgPSBbXG5cdFx0WzUsIDAsIDJdLFxuXHRcdFs1LCAwLCAzXSxcblx0XHRbNSwgMSwgMl0sXG5cdFx0WzUsIDEsIDNdLFxuXHRcdFs1LCAyLCAyXSxcblx0XHRbNSwgMiwgM10sXG5cdFx0WzUsIDMsIDJdLFxuXHRcdFs1LCAzLCAzXSxcblx0XHRbNSwgNCwgMl0sXG5cdFx0WzUsIDQsIDNdLFxuXHRcdFs1LCA1LCAyXSxcblx0XHRbNSwgNSwgM11cblx0XTtcbn0pO1xuIiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdnYW1lbGlzdCcsIHtcbiAgICAgICAgdXJsOiAnL2dhbWVsaXN0JyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvYnJvd3Nlci9qcy9nYW1lbGlzdC9nYW1lbGlzdC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2dhbWVMaXN0JyxcbiAgICB9KTtcbn0pO1xuXG50c3Vyby5jb250cm9sbGVyKCdnYW1lTGlzdCcsIGZ1bmN0aW9uICgkc2NvcGUsIGZpcmViYXNlVXJsLCAkZmlyZWJhc2VPYmplY3QsICRzdGF0ZSwgJGZpcmViYXNlQXV0aCwgJGZpcmViYXNlQXJyYXkpIHtcbiAgICAvL0ZvciBzeW5jaHJvbml6aW5nR2FtZUxpc3QuLi5cbiAgICB2YXIgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbiAgICB2YXIgb2JqID0gJGZpcmViYXNlT2JqZWN0KHJlZik7XG5cbiAgICB2YXIgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcbiAgICB2YXIgZmlyZWJhc2VVc2VyID0gYXV0aC4kZ2V0QXV0aCgpO1xuXG4gICAgdmFyIHN5bmNoUmVmID0gcmVmLmNoaWxkKFwiZ2FtZXNcIik7XG4gICAgdmFyIHN5bmNocm9uaXplZE9iaiA9ICRmaXJlYmFzZU9iamVjdChzeW5jaFJlZik7XG5cbiAgICAvLyBUaGlzIHJldHVybnMgYSBwcm9taXNlLi4ueW91IGNhbi50aGVuKCkgYW5kIGFzc2lnbiB2YWx1ZSB0byAkc2NvcGUudmFyaWFibGVcbiAgICAvLyBnYW1lbGlzdCBpcyB3aGF0ZXZlciB3ZSBhcmUgY2FsbGluZyBpdCBpbiB0aGUgYW5ndWxhciBodG1sLlxuICAgIHN5bmNocm9uaXplZE9iai4kYmluZFRvKCRzY29wZSwgXCJnYW1lbGlzdFwiKVxuICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZ2FtZWxpc3QgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gJHNjb3BlLmdhbWVsaXN0KSB7XG4gICAgICAgICAgICAgICAgZ2FtZWxpc3QucHVzaChbaSwgJHNjb3BlLmdhbWVsaXN0W2ldXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkc2NvcGUuZ2FtZU5hbWVzID0gZ2FtZWxpc3Quc2xpY2UoMik7XG4gICAgICAgIH0pO1xuXG5cbiAgICAkc2NvcGUuam9pbiA9IGZ1bmN0aW9uIChnYW1lTmFtZSkge1xuICAgICAgICB2YXIgZ2FtZU5hbWVSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoZ2FtZU5hbWUpO1xuICAgICAgICB2YXIgcGxheWVyc1JlZiA9IGdhbWVOYW1lUmVmLmNoaWxkKCdwbGF5ZXJzJyk7XG5cbiAgICAgICAgdmFyIHBsYXllckFyciA9ICRmaXJlYmFzZUFycmF5KHBsYXllcnNSZWYpO1xuICAgICAgICBwbGF5ZXJBcnIuJGxvYWRlZCgpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocGxheWVycykge1xuICAgICAgICAgICAgICAgIC8vY2hlY2sgaWYgSSBhbSBhbHJlYWR5IGEgcGxheWVyIGluIHRoaXMgZ2FtZVxuICAgICAgICAgICAgICAgIC8vaWYgSSBhbSBhIG5ldyBwbGF5ZXIsIGFkZCBtZSB0byB0aGUgcGxheWVycyBhcnJheSBpbiBmaXJlYmFzZVxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXJzLmZpbHRlcihwbGF5ZXIgPT4gcGxheWVyLnVpZCA9PT0gZmlyZWJhc2VVc2VyLnVpZCkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdQbGF5ZXIgPSBuZXcgUGxheWVyKGZpcmViYXNlVXNlci51aWQpO1xuICAgICAgICAgICAgICAgICAgICAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKS4kYWRkKG5ld1BsYXllcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnZ2FtZScsIHsgXCJnYW1lTmFtZVwiOiBnYW1lTmFtZSB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgfTtcbn0pO1xuIiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsb2dpbicsIHtcbiAgICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvYnJvd3Nlci9qcy9sb2dpbi9sb2dpbi5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2xvZ2luQ3RybCdcbiAgICB9KTtcbn0pO1xuXG50c3Vyby5jb250cm9sbGVyKCdsb2dpbkN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsICRmaXJlYmFzZUF1dGgsICRyb290U2NvcGUpIHtcbiAgICB2YXIgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcblxuICAgICRzY29wZS5sb2dJbldpdGhHb29nbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGF1dGguJHNpZ25JbldpdGhQb3B1cChcImdvb2dsZVwiKS50aGVuKGZ1bmN0aW9uIChhdXRoRGF0YSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJMb2dnZWQgaW4gYXM6XCIsIGF1dGhEYXRhKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuY3VycmVudFVzZXIgPSBhdXRoRGF0YTtcbiAgICAgICAgICAgICRzdGF0ZS5nbygncGlja0dhbWUnKTtcbiAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiQXV0aGVudGljYXRpb24gZmFpbGVkOlwiLCBlcnJvcik7XG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxufSk7XG4iLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3BpY2tHYW1lJywge1xuICAgICAgICB1cmw6ICcvcGlja2dhbWUnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9icm93c2VyL2pzL3BpY2tHYW1lL3BpY2tHYW1lLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAncGlja0dhbWVDdHJsJ1xuICAgIH0pO1xufSk7XG5cbnRzdXJvLmNvbnRyb2xsZXIoJ3BpY2tHYW1lQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSwgJGZpcmViYXNlQXJyYXksICRmaXJlYmFzZU9iamVjdCkge1xuICAgIHZhciByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xuICAgIHZhciBvYmogPSAkZmlyZWJhc2VPYmplY3QocmVmKVxuXG5cbiAgICAkc2NvcGUuY3JlYXRlR2FtZSA9IGZ1bmN0aW9uIChnYW1lTmFtZSkge1xuICAgICAgICB2YXIgZ2FtZU5hbWVSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoZ2FtZU5hbWUpO1xuICAgICAgICB2YXIgcGxheWVyc1JlZiA9IGdhbWVOYW1lUmVmLmNoaWxkKCdwbGF5ZXJzJyk7XG5cbiAgICAgICAgJGZpcmViYXNlQXJyYXkoZ2FtZU5hbWVSZWYpLiRhZGQoe1xuICAgICAgICAgICAgXCJnYW1lTmFtZVwiOiBnYW1lTmFtZVxuICAgICAgICB9KTtcblxuICAgICAgICBmaXJlYmFzZS5hdXRoKCkub25BdXRoU3RhdGVDaGFuZ2VkKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgICAgIHZhciBuZXdQbGF5ZXIgPSBuZXcgUGxheWVyKHVzZXIudWlkKVxuICAgICAgICAgICAgICAgICRmaXJlYmFzZUFycmF5KHBsYXllcnNSZWYpLiRhZGQobmV3UGxheWVyKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIm5vIG9uZSBsb2dnZWQgaW5cIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICBvYmouJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciB0aWxlcyA9IGRhdGEudGlsZXNcbiAgICAgICAgICAgIHZhciBkZWNrID0gbmV3IERlY2sodGlsZXMpLnNodWZmbGUoKS50aWxlcztcbiAgICAgICAgICAgIHZhciBpbml0aWFsRGVja1JlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZChnYW1lTmFtZSkuY2hpbGQoJ2luaXRpYWxEZWNrJyk7XG4gICAgICAgICAgICAkZmlyZWJhc2VBcnJheShpbml0aWFsRGVja1JlZikuJGFkZChkZWNrKTtcbiAgICAgICAgfSlcblxuXG4gICAgICAgIHZhciBpbml0aWFsTWFya2Vyc1JlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZChnYW1lTmFtZSkuY2hpbGQoJ2F2YWlsYWJsZU1hcmtlcnMnKTtcbiAgICAgICAgJGZpcmViYXNlQXJyYXkoaW5pdGlhbE1hcmtlcnNSZWYpLiRhZGQoW1wicmVkXCIsIFwib3JhbmdlXCIsIFwieWVsbG93XCIsIFwiZ3JlZW5cIiwgXCJhcXVhXCIsIFwiYmx1ZVwiLCBcIm5hdnlcIiwgXCJwdXJwbGVcIl0pO1xuXG5cbiAgICAgICAgJHN0YXRlLmdvKCdnYW1lJywge1xuICAgICAgICAgICAgXCJnYW1lTmFtZVwiOiBnYW1lTmFtZVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmdvVG9HYW1lTGlzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHN0YXRlLmdvKCdnYW1lbGlzdCcpO1xuICAgIH07XG59KTtcbiIsIid1c2Ugc3RyaWN0J1xuXG5mdW5jdGlvbiBQbGF5ZXIodWlkKSB7XG4gICAgLy8gVE9ETzogZ2V0IHVpZCBmcm9tIGZpcmViYXNlIGF1dGhcbiAgICB0aGlzLnVpZCA9IHVpZDtcblxuICAgIHRoaXMubWFya2VyID0gXCJuXCI7XG5cbiAgICAvLyBzaG91bGQgYmUgYSBQb2ludCBvYmplY3RcbiAgICB0aGlzLnBvaW50ID0gXCJuXCI7XG5cbiAgICAvLyBbeCwgeV1cbiAgICAvLyBkZXBlbmRzIG9uIHRoZSBhbmd1bGFyIFNwYWNlLngsIFNwYWNlLnlcbiAgICB0aGlzLm5leHRTcGFjZSA9IFwiblwiO1xuXG4gICAgLy8gaW4gZWFjaCBTcGFjZS5wb2ludHMgYXJyYXksIGZpbmQgdGhpcyBzcGVjaWZpYyBwb2ludCBhbmQgZ2V0IHRoZSBwb3NpdGlvbiAoaW50ZWdlcikgaW5zaWRlIHRoaXMgc3BhY2UuXG4gICAgdGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9IFwiblwiO1xuXG4gICAgLy8gbWF4aW11biAzIHRpbGVzXG4gICAgdGhpcy50aWxlcyA9ICduJztcblxuICAgIC8vIGlmIGEgcGxheWVyIGRpZXMsIGl0IHdpbGwgYmUgY2hhbmdlZCB0byBmYWxzZVxuICAgIHRoaXMuY2FuUGxheSA9IHRydWU7XG59XG5cbi8vIG5lZWQgdG8gdXNlIHNlbGYgYmVjdXNlIHdlIG5lZWQgdG8gY2hhbmdlICRzY29wZS5tZSBvbiBnYW1lQ3RybCBhbmQgc2VuZCB0byBmaXJlYmFzZVxuUGxheWVyLnByb3RvdHlwZS5wbGFjZU1hcmtlciA9IGZ1bmN0aW9uIChib2FyZCwgcG9pbnQsIHNlbGYpIHtcbiAgICAvLyBwb2ludCBsb29rcyBsaWtlIFt4LCB5LCBwb2ludHNJbmRleF0gaW4gdGhlIHNwYWNlXG4gICAgdmFyIHggPSBwb2ludFswXTtcbiAgICB2YXIgeSA9IHBvaW50WzFdO1xuICAgIHZhciBwb2ludHNJbmRleCA9IHBvaW50WzJdO1xuXG4gICAgc2VsZi5wb2ludCA9IGJvYXJkW3ldW3hdLnBvaW50c1twb2ludHNJbmRleF07XG4gICAgc2VsZi5wb2ludC50cmF2ZWxsZWQgPSB0cnVlO1xuXG4gICAgLy9beCwgeV0gZnJvbSB0aGUgcG9pbnRcbiAgICBzZWxmLm5leHRTcGFjZSA9IGJvYXJkW3ldW3hdO1xuXG4gICAgLy8gaW4gZWFjaCBTcGFjZS5wb2ludHMgYXJyYXksIGZpbmQgdGhpcyBzcGVjaWZpYyBwb2ludCBhbmQgZ2V0IHRoZSBwb3NpdGlvbiAoaW50ZWdlcikgaW5zaWRlIHRoaXMgc3BhY2UuXG4gICAgc2VsZi5uZXh0U3BhY2VQb2ludHNJbmRleCA9IHNlbGYubmV4dFNwYWNlLnBvaW50cy5pbmRleE9mKHNlbGYucG9pbnQpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5uZXdTcGFjZSA9IGZ1bmN0aW9uIChib2FyZCwgb2xkU3BhY2UpIHtcbiAgICBpZiAodGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gMCB8fCB0aGlzLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSAxKSB7XG4gICAgICAgIHJldHVybiBib2FyZFtvbGRTcGFjZS55IC0gMV1bb2xkU3BhY2UueF07XG4gICAgfSBlbHNlIGlmICh0aGlzLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSAyIHx8IHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDMpIHtcbiAgICAgICAgcmV0dXJuIGJvYXJkW29sZFNwYWNlLnldW29sZFNwYWNlLnggKyAxXTtcbiAgICB9IGVsc2UgaWYgKHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDQgfHwgdGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gNSkge1xuICAgICAgICByZXR1cm4gYm9hcmRbb2xkU3BhY2UueSArIDFdW29sZFNwYWNlLnhdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBib2FyZFtvbGRTcGFjZS55XVtvbGRTcGFjZS54IC0gMV07XG4gICAgfVxufTtcblxuLy8gbmVlZCB0byB1c2Ugc2VsZiBiZWN1c2Ugd2UgbmVlZCB0byBjaGFuZ2UgJHNjb3BlLm1lIG9uIGdhbWVDdHJsIGFuZCBzZW5kIHRvIGZpcmViYXNlXG5QbGF5ZXIucHJvdG90eXBlLnBsYWNlVGlsZSA9IGZ1bmN0aW9uICh0aWxlLCBzZWxmKSB7XG4gICAgdmFyIGluZGV4ID0gc2VsZi50aWxlcy5pbmRleE9mKHRpbGUpO1xuICAgIHNlbGYudGlsZXMuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgIHNlbGYubmV4dFNwYWNlLnRpbGVVcmwgPSB0aWxlLmltYWdlVXJsO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aWxlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHNlbGYubmV4dFNwYWNlLnBvaW50c1tpXS5uZWlnaGJvcnMucHVzaChzZWxmLm5leHRTcGFjZS5wb2ludHNbdGlsZVtpXV0pO1xuICAgIH1cbn07XG5cblBsYXllci5wcm90b3R5cGUubW92ZVRvID0gZnVuY3Rpb24gKHBvaW50ZXIpIHtcblxuICAgIC8vYWx3YXlzIGJlIHJldHVybmluZyAwIG9yIDEgcG9pbnQgaW4gdGhlIGFycmF5XG4gICAgbGV0IG5leHRQb2ludCA9IHBvaW50ZXIubmVpZ2hib3JzLmZpbHRlcihmdW5jdGlvbiAobmVpZ2hib3IpIHtcbiAgICAgICAgcmV0dXJuICFuZWlnaGJvci50cmF2ZWxsZWQ7XG4gICAgfSlbMF07XG5cbiAgICByZXR1cm4gbmV4dFBvaW50O1xufTtcblxuLy8gVE9ETzogbm90IHN1cmUgaG93IHRvIG1ha2UgdGhpcyBrZWVwIG1vdmluZyB3aXRoIHBsYXllcnMgaW5zdGVhZCBvZiBzZWxmXG5QbGF5ZXIucHJvdG90eXBlLmtlZXBNb3ZpbmcgPSBmdW5jdGlvbiAoc2VsZikge1xuICAgIGxldCBtb3ZhYmxlID0gc2VsZi5tb3ZlVG8oc2VsZi5wb2ludCk7XG4gICAgd2hpbGUgKG1vdmFibGUpIHtcbiAgICAgICAgc2VsZi5wb2ludC50cmF2ZWxsZWQgPSB0cnVlO1xuICAgICAgICBzZWxmLnBvaW50ID0gc2VsZi5tb3ZlVG8oc2VsZi5wb2ludCk7XG4gICAgICAgIGxldCBvbGRTcGFjZSA9IHNlbGYubmV4dFNwYWNlO1xuICAgICAgICBsZXQgbmV3U3BhY2UgPSBuZXdTcGFjZShvbGRTcGFjZSk7XG4gICAgICAgIHNlbGYubmV4dFNwYWNlID0gbmV3U3BhY2U7XG5cbiAgICAgICAgc2VsZi5jaGVja0RlYXRoKCk7XG4gICAgICAgIG1vdmFibGUgPSBzZWxmLm1vdmVUbyhzZWxmLnBvaW50KTtcbiAgICB9XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLmNoZWNrRGVhdGggPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFsbFRyYXZlbGxlZCA9IHRoaXMucG9pbnQubmVpZ2hib3JzLmZpbHRlcihmdW5jdGlvbiAobmVpZ2hib3IpIHtcbiAgICAgICAgcmV0dXJuIG5laWdoYm9yLnRyYXZlbGxlZDtcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLnBvaW50LmVkZ2UgfHwgYWxsVHJhdmVsbGVkLmxlbmd0aCA9PT0gMikgdGhpcy5kaWUoKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUuZGllID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY2FuUGxheSA9IGZhbHNlO1xuICAgIC8vIFRPRE86IG5lZWQgdG8gc2VuZCBhbiBhbGVydCBvciBtZXNzYWdlIHRvIHRoZSBwbGF5ZXIgd2hvIGp1c3QgZGllZC5cbn07XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
