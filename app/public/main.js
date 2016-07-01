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
				this.image = "n";
				this.points = [null, null, null, null, null, null, null, null];
				this.tileUrl = "n";
				this.tileId = "n";

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
				this.neighbors = ["n"];
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
																var tile = this.deck[0].splice(0, 1);
																this.deck.$save(0).then(function (ref) {
																				console.log('dealt a card!');
																});
																tiles += tile;
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

				var ref = firebase.database().ref();
				var obj = $firebaseObject(ref);
				var gameRef = ref.child('games').child($stateParams.gameName);

				var deckRef = gameRef.child('deck');
				var playersRef = gameRef.child('players');
				var markersRef = gameRef.child('availableMarkers');
				var deckArr = $firebaseArray(deckRef);
				var firebasePlayersArr = $firebaseArray(playersRef);

				var player = Object.create(Player.prototype);

				/****************
    INITIALIZING GAME
    ****************/

				//new local game with game name defined by url
				$scope.game = new Game($stateParams.gameName);

				//when the deck is loaded...
				deckArr.$loaded().then(function (data) {
								// $scope.game.deck = data[0];
								$scope.game.deck = deckArr; //add the deck to the local game ? Try this as firebase DeckArr????

								//don't start watching players until there is a deck in the game
								playersRef.on("value", function (snap) {
												var snapPlayers = snap.val(); //grab the value of the snapshot (all players in game in Firebase)

												//for each player in this collection...
												for (var thisPlayer in snapPlayers) {
																var existingPlayerIndex, thisIsANewPlayer;

																//find this 'snap' player's index in local game. find returns that value.
																var localPlayer = $scope.game.players.find(function (plyr, plyrIdx) {
																				existingPlayerIndex = plyrIdx;
																				return plyr.uid === snapPlayers[thisPlayer].uid;
																});

																//if not found, create new player
																if (!localPlayer) {
																				console.log('i didnt find a local player!');
																				localPlayer = new Player(snapPlayers[thisPlayer].uid);
																				thisIsANewPlayer = true;
																}

																//for each key in the snapPlayer's keys, add that key and value to local player
																for (var playerproperty in snapPlayers[thisPlayer]) {
																				localPlayer[playerproperty] = snapPlayers[thisPlayer][playerproperty];
																}

																//push local player to game.players
																if (thisIsANewPlayer) $scope.game.players.push(localPlayer);else $scope.game.players[existingPlayerIndex] = localPlayer;
												}
								});
				});

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
								firebasePlayersArr.$loaded().then(function (players) {

												if (user) {
																var me = players.find(function (player) {
																				return player.uid === user.uid;
																});

																if (me) {
																				$scope.me = me;
																}
																if ($scope.me.marker === "n") $scope.me.marker = null;
												} else {
																// No user is signed in.
																console.log("no one is logged in");
												}
												console.log('im here!!!!!!!!');
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

				//TODO: limit start points

				//Have player pick their start point
				$scope.placeMarker = function (board, point) {
								//place my marker
								player.placeMarker(board, point, $scope.me);
								$scope.me.tiles = $scope.game.deal(3); //deal me three cards

								//when the firebase players are loaded....
								firebasePlayersArr.$loaded().then(function (players) {
												//find me in the firebase players array
												var meIdx;
												players.find(function (e, i) {
																if (e.uid === $scope.me.uid) meIdx = i;
												});

												firebasePlayersArr[meIdx] = $scope.me; //set firebase me to local me

												firebasePlayersArr.$save(meIdx); //save it.
								});
				};

				// TODO: we probably need this on firebase so other people can't pick what's been picked

				//For synchronizingGame...
				// var syncRef = gameRef.child('moves');
				// syncRef.on('child_added', function (childSnapshot, prevChildKey) {
				// 	//NEED TO DOUBLE CHECK!! What does childSnap returns?
				// 	console.log('childSnapshot_SyncGame', childSnapshot);
				// 	//depending on what childSnapshot gives me...I think it's one child per on call? It doesn't return an array of changes...I believe!
				// 	if (childSnapshot.type === 'updateDeck') {
				// 		$scope.game.deck = childSnapshot.updateDeck;
				// 	} else {
				// 		$scope.placeTile(childSnapshot.tile);
				// 	}
				// });

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

								var firebasePlayersArr = $firebaseArray(playersRef);
								firebasePlayersArr.$loaded().then(function (players) {
												var meIdx;
												players.find(function (e, i) {
																if (e.$id === $scope.me.$id) meIdx = i;
												});

												player.placeTile(tile, firebasePlayersArr[meIdx]);

												for (var i = 0; i < tile.paths.length; i++) {
																if (firebasePlayersArr[meIdx].nextSpace.points[i].neighbors[0] === "n") {
																				firebasePlayersArr[meIdx].nextSpace.points[i].neighbors.splice(0, 1);
																}
																firebasePlayersArr[meIdx].nextSpace.points[i].neighbors.push(firebasePlayersArr[meIdx].nextSpace.points[tile.paths[i]]);
																firebasePlayersArr.$save(meIdx);
												}

												firebasePlayersArr[meIdx].point = firebasePlayersArr[meIdx].nextSpace.points[firebasePlayersArr[meIdx].nextSpacePointsIndex];
												firebasePlayersArr.$save(meIdx);
								});

								// CMT: this should send the rotated tile to firebase
								movesArr.$add({
												'type': 'placeTile',
												'tile': tile,
												'playerUid': $scope.me.uid
								});

								firebasePlayersArr.$loaded().then(function (players) {
												players.forEach(function (p) {
																console.log("p", p.point);

																// let movable = player.moveTo(p.point);
																// var pIdx = players.indexOf(p)

																// while (movable) {
																//     // my point is going to be current point's neighbors
																//     p.point.travelled = true;
																//     p.point = p.neighbors.filter(function (n) {
																//         return !n.travelled && neighbor !== "n";
																//     })[0]
																//     console.log(p.point, "game js p point")
																//     var pointIdx;
																//     p.nextSpace.points.forEach(function (point, idx) {
																//         if (JSON.toString(point) === JSON.toString(p.point)) {
																//             pointIdx = idx;
																//         }
																//     })
																//     p.nextSpacePointsIndex = pointIdx;
																//
																//     let oldSpace = p.nextSpace;
																//     let newSpace = player.newSpace($scope.game.board, oldSpace, p);
																//     p.nextSpace = newSpace;
																//
																//     firebasePlayersArr.$save(pIdx)
																//         // player.checkDeath(p);
																//     movable = player.moveTo(p.point);
																//
																// }
												});
								});

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

								firebase.auth().onAuthStateChanged(function (user) {
												var firebasePlayersArr = $firebaseArray(playersRef);

												firebasePlayersArr.$loaded().then(function (data) {
																var FBplayers = data;

																if (user) {
																				if (!FBplayers.filter(function (player) {
																								return player.uid === user.uid;
																				}).length) {
																								var newPlayer = new Player(user.uid);
																								$firebaseArray(playersRef).$add(newPlayer);
																				}
																} else {
																				// No user is signed in.
																				console.log("nothing");
																}
												}).then(function () {
																$state.go('game', {
																				"gameName": gameName
																});
												});
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
												var deckRef = ref.child('games').child(gameName).child('deck');
												$firebaseArray(deckRef).$add(deck);
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
Player.prototype.hi = function () {
				console.log("HI");
};
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

Player.prototype.newSpace = function (board, oldSpace, self) {
				if (self.nextSpacePointsIndex === 0 || self.nextSpacePointsIndex === 1) {
								return board[oldSpace.y - 1][oldSpace.x];
				} else if (self.nextSpacePointsIndex === 2 || self.nextSpacePointsIndex === 3) {
								return board[oldSpace.y][oldSpace.x + 1];
				} else if (self.nextSpacePointsIndex === 4 || self.nextSpacePointsIndex === 5) {
								return board[oldSpace.y + 1][oldSpace.x];
				} else {
								return board[oldSpace.y][oldSpace.x - 1];
				}
};

// need to use self becuse we need to change $scope.me on gameCtrl and send to firebase
Player.prototype.placeTile = function (tile, self) {
				self.tiles = self.tiles.filter(function (t) {
								return t.id !== tile.id;
				});

				self.nextSpace.tileUrl = tile.imageUrl;
};

Player.prototype.moveTo = function (pointer) {
				//always be returning 0 or 1 point in the array
				var nextPoint = pointer.neighbors.filter(function (neighbor) {
								return !neighbor.travelled && neighbor !== "n";
				})[0];
				console.log("nextPoint", nextPoint);
				return nextPoint;
};

// TODO: not sure how to make this keep moving with players instead of self
// Player.prototype.keepMoving = function (self) {
//     let movable = self.moveTo(self.point);
//     while (movable) {
//         self.point.travelled = true;
//         self.point = self.moveTo(self.point);
//         let oldSpace = self.nextSpace;
//         let newSpace = newSpace(oldSpace);
//         self.nextSpace = newSpace;
//         self.nextSpacePointsIndex = self.nextSpace.points.indexOf(self.point);
//         self.checkDeath();
//         movable = self.moveTo(self.point);
//     }
// };

Player.prototype.checkDeath = function (self) {
				var allTravelled = self.point.neighbors.filter(function (neighbor) {
								return neighbor.travelled;
				});

				if (self.point.edge || allTravelled.length === 2) self.die();
};

Player.prototype.die = function () {
				this.canPlay = false;
				// TODO: need to send an alert or message to the player who just died.
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImdhbWUvYm9hcmQuanMiLCJnYW1lL2RlY2suanMiLCJnYW1lL2dhbWUuY29udHJ1Y3Rvci5qcyIsImdhbWUvZ2FtZS5qcyIsImdhbWVsaXN0L2dhbWVsaXN0LmpzIiwibG9naW4vbG9naW4uanMiLCJwaWNrR2FtZS9waWNrR2FtZS5qcyIsInBsYXllci9wbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBQSxRQUFBLFFBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTs7QUFFQSxNQUFBLE1BQUEsQ0FBQSxZQUFBO0FBQ0EsUUFBQSxTQUFBO0FBQ0EsZ0JBQUEseUNBREE7QUFFQSxvQkFBQSxzQ0FGQTtBQUdBLHFCQUFBLDZDQUhBO0FBSUEsdUJBQUE7QUFKQSxLQUFBO0FBTUEsYUFBQSxhQUFBLENBQUEsTUFBQTtBQUNBLENBUkE7O0FBVUEsTUFBQSxRQUFBLENBQUEsYUFBQSxFQUFBLDRDQUFBOztBQUVBLE1BQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQTtBQUNBLHVCQUFBLFNBQUEsQ0FBQSxHQUFBO0FBQ0EsQ0FGQTs7QUNkQSxTQUFBLEtBQUEsR0FBQTtBQUNBLFNBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQTs7QUFFQSxNQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBO0FBQ0E7QUFDQSxXQUFBLEtBQUEsS0FBQTtBQUNBLENBUkE7O0FBVUEsU0FBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEVBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLFNBQUEsS0FBQSxHQUFBLEdBQUE7QUFDQSxTQUFBLE1BQUEsR0FBQSxDQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBQUE7QUFDQSxTQUFBLE9BQUEsR0FBQSxHQUFBO0FBQ0EsU0FBQSxNQUFBLEdBQUEsR0FBQTs7QUFFQSxTQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxzQkFBQTs7QUFFQSxZQUFBLElBQUEsQ0FBQSxFQUFBOztBQUNBLDRCQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLEM7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FDQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsTUFBQSxJQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLFNBSkEsTUFJQSxJQUFBLElBQUEsQ0FBQSxFQUFBOztBQUNBLGdCQUFBLE1BQUEsQ0FBQSxFQUFBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxLQUNBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxTQUhBLE1BR0EsSUFBQSxJQUFBLENBQUEsRUFBQTs7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FDQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsU0FIQSxNQUdBOztBQUNBLDRCQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLEM7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FDQTtBQUNBLHFCQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsTUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFJQSxTQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxTQUFBLElBQUEsR0FBQSxJQUFBO0FBQ0EsU0FBQSxTQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUE7QUFDQSxTQUFBLFNBQUEsR0FBQSxLQUFBO0FBQ0E7O0FDbkRBOztJQUVBLEk7QUFDQSxrQkFBQSxLQUFBLEVBQUE7QUFBQTs7QUFDQSxhQUFBLEtBQUEsR0FBQSxLQUFBO0FBQ0E7Ozs7a0NBRUE7QUFDQSxpQkFBQSxLQUFBLEdBQUEsRUFBQSxPQUFBLENBQUEsS0FBQSxLQUFBLENBQUE7QUFDQSxtQkFBQSxJQUFBO0FBQ0E7OztvQ0FFQTtBQUNBLG1CQUFBLEtBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0E7Ozs2QkFFQSxHLEVBQUE7QUFDQSxtQkFBQSxLQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLEdBQUEsQ0FBQTtBQUNBOzs7K0JBRUEsSyxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBO0FBQ0EsbUJBQUEsSUFBQTtBQUNBOzs7Ozs7QUN2QkE7Ozs7SUFJQSxJO0FBQ0Esa0JBQUEsSUFBQSxFQUFBO0FBQUE7O0FBQ0EsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQUNBLGFBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLEtBQUEsR0FBQSxJQUFBLEtBQUEsR0FBQSxTQUFBLEVBQUE7QUFDQSxhQUFBLE9BQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxnQkFBQSxHQUFBLENBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxRQUFBLEVBQUEsT0FBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLFFBQUEsQ0FBQTs7QUFFQSxhQUFBLFVBQUEsQztBQUNBLGFBQUEsY0FBQSxHQUFBLEVBQUEsQztBQUNBLGFBQUEsTUFBQSxHQUFBLEVBQUEsQztBQUNBLGFBQUEsS0FBQTtBQUNBOzs7OzJDQUVBO0FBQ0EsZ0JBQUEsS0FBQSxVQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLGNBQUEsQ0FBQSxLQUFBLFVBQUEsQ0FBQTtBQUNBOzs7eUNBRUE7QUFDQSxpQkFBQSxPQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsTUFBQTtBQUFBLHVCQUFBLE9BQUEsVUFBQSxDQUFBLE1BQUEsQ0FBQTtBQUFBLGFBQUE7QUFDQTs7O3NDQUVBO0FBQ0EsZ0JBQUEsbUJBQUEsRUFBQTtBQUNBLGlCQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxvQkFBQSxDQUFBLE9BQUEsT0FBQSxJQUFBLE9BQUEsS0FBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLEVBQUE7QUFDQSxxQ0FBQSxJQUFBLENBQUEsT0FBQSxLQUFBO0FBQ0EsbUNBQUEsSUFBQTtBQUNBO0FBQ0EsYUFMQTtBQU1BLG1CQUFBLGdCQUFBO0FBQ0E7OztvQ0FFQTtBQUNBLG1CQUFBLGFBQUEsTUFBQSxJQUFBLENBQUE7QUFDQTs7Ozs7O3lDQUdBO0FBQ0EsZ0JBQUEsV0FBQSxLQUFBLGNBQUEsRUFBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0Esb0JBQUEsU0FBQSxLQUFBLFVBQUEsR0FBQSxDQUFBO0FBQ0EsdUJBQUEsQ0FBQSxLQUFBLGNBQUEsQ0FBQSxTQUFBLENBQUEsRUFBQSxPQUFBLEVBQUE7QUFDQTtBQUNBO0FBQ0EscUJBQUEsVUFBQSxHQUFBLE1BQUE7QUFDQSxhQU5BLE1BTUE7QUFDQSxxQkFBQSxVQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQSxtQkFBQSxLQUFBLGdCQUFBLEVBQUE7QUFDQTs7OzZCQUVBLEcsRUFBQTtBQUNBLGdCQUFBLFFBQUEsRUFBQTtBQUNBLGlCQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0Esb0JBQUEsT0FBQSxLQUFBLElBQUEsQ0FBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxxQkFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSw0QkFBQSxHQUFBLENBQUEsZUFBQTtBQUNBLGlCQUZBO0FBR0EseUJBQUEsSUFBQTtBQUNBO0FBQ0EsbUJBQUEsS0FBQTtBQUNBOzs7Ozs7Z0NBR0E7QUFBQTs7QUFDQSxpQkFBQSxPQUFBLENBQUEsT0FBQSxDQUFBLGtCQUFBOzs7QUFHQSxzQkFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsS0FBQSxFQUFBLE9BQUE7QUFDQSx1QkFBQSxLQUFBLEdBQUEsRUFBQTs7QUFFQSx1QkFBQSxPQUFBLEdBQUEsSUFBQTtBQUNBLGFBUEE7QUFRQTs7Ozs7Ozs7Ozs7QUFPQSxJQUFBLGFBQUEsU0FBQSxVQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsV0FBQSxRQUFBLE1BQUEsQ0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGVBQUEsT0FBQSxPQUFBO0FBQ0EsS0FGQSxDQUFBO0FBR0EsQ0FKQTs7QUNyRkEsTUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsYUFBQSxpQkFEQTtBQUVBLHFCQUFBLDRCQUZBO0FBR0Esb0JBQUE7QUFIQSxLQUFBO0FBS0EsQ0FOQTs7QUFRQSxNQUFBLFVBQUEsQ0FBQSxVQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQSxZQUFBLEVBQUEsZUFBQSxFQUFBLGNBQUEsRUFBQTtBQUNBLFdBQUEsSUFBQSxHQUFBO0FBQ0Esa0JBQUEsRUFEQTtBQUVBLGVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBO0FBR0Esa0JBQUE7QUFIQSxLQUFBOztBQU9BLFFBQUEsTUFBQSxTQUFBLFFBQUEsR0FBQSxHQUFBLEVBQUE7QUFDQSxRQUFBLE1BQUEsZ0JBQUEsR0FBQSxDQUFBO0FBQ0EsUUFBQSxVQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxLQUFBLENBQUEsYUFBQSxRQUFBLENBQUE7O0FBRUEsUUFBQSxVQUFBLFFBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQTtBQUNBLFFBQUEsYUFBQSxRQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUE7QUFDQSxRQUFBLGFBQUEsUUFBQSxLQUFBLENBQUEsa0JBQUEsQ0FBQTtBQUNBLFFBQUEsVUFBQSxlQUFBLE9BQUEsQ0FBQTtBQUNBLFFBQUEscUJBQUEsZUFBQSxVQUFBLENBQUE7O0FBRUEsUUFBQSxTQUFBLE9BQUEsTUFBQSxDQUFBLE9BQUEsU0FBQSxDQUFBOzs7Ozs7O0FBT0EsV0FBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsYUFBQSxRQUFBLENBQUE7OztBQUdBLFlBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTs7QUFFQSxlQUFBLElBQUEsQ0FBQSxJQUFBLEdBQUEsT0FBQSxDOzs7QUFJQSxtQkFBQSxFQUFBLENBQUEsT0FBQSxFQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsY0FBQSxLQUFBLEdBQUEsRUFBQSxDOzs7QUFHQSxpQkFBQSxJQUFBLFVBQUEsSUFBQSxXQUFBLEVBQUE7QUFDQSxvQkFBQSxtQkFBQSxFQUFBLGdCQUFBOzs7QUFHQSxvQkFBQSxjQUFBLE9BQUEsSUFBQSxD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LGVBQUEsV0FBQSxDQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsS0FBQSxHQUFBLE9BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQzs7O0FBR0EsMkJBQUEsT0FBQSxHQUNBLElBREEsQ0FDQSxVQUFBLE9BQUEsRUFBQTs7QUFFQSxnQkFBQSxLQUFBO0FBQ0Esb0JBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUEsR0FBQSxLQUFBLE9BQUEsRUFBQSxDQUFBLEdBQUEsRUFBQSxRQUFBLENBQUE7QUFDQSxhQUZBOztBQUlBLCtCQUFBLEtBQUEsSUFBQSxPQUFBLEVBQUEsQzs7QUFFQSwrQkFBQSxLQUFBLENBQUEsS0FBQSxFO0FBQ0EsU0FYQTtBQVlBLEtBbEJBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0RBLFdBQUEsYUFBQSxHQUFBLE9BQUEsSUFBQSxDQUFBLGdCQUFBLEVBQUE7OztBQUdBLFdBQUEsTUFBQTtBQUNBLFFBQUEsd0JBQUEsRUFBQTs7QUFFQSxXQUFBLEtBQUEsR0FBQSxZQUFBOztBQUVBLEtBRkE7O0FBSUEsV0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLGVBQUEsRUFBQSxLQUFBLE9BQUEsYUFBQTtBQUNBLEtBRkE7OztBQUtBLFdBQUEsWUFBQSxHQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsR0FBQSxDQUFBLGlCQUFBO0FBQ0EsYUFBQSxRQUFBO0FBQ0EsWUFBQSxLQUFBLFFBQUEsS0FBQSxDQUFBLEVBQUEsS0FBQSxRQUFBLEdBQUEsQ0FBQTtBQUNBLEtBSkE7O0FBTUEsV0FBQSxhQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLFFBQUE7QUFDQSxZQUFBLEtBQUEsUUFBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLEtBQUEsUUFBQSxHQUFBLENBQUE7QUFDQSxLQUhBOzs7QUFNQSxXQUFBLFNBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTs7QUFFQSxZQUFBLEtBQUEsUUFBQSxHQUFBLENBQUEsRUFBQTtBQUNBLGlCQUFBLEtBQUEsR0FBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxVQUFBLEVBQUE7QUFDQSw2QkFBQSxhQUFBLENBQUE7QUFDQSxvQkFBQSxlQUFBLENBQUEsRUFBQSxhQUFBLENBQUE7QUFDQSxvQkFBQSxlQUFBLENBQUEsRUFBQSxhQUFBLENBQUE7QUFDQSx1QkFBQSxVQUFBO0FBQ0EsYUFMQSxDQUFBO0FBTUEsaUJBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxpQkFBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFNBVEEsTUFTQSxJQUFBLEtBQUEsUUFBQSxHQUFBLENBQUEsRUFBQTtBQUNBLGlCQUFBLEtBQUEsR0FBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxVQUFBLEVBQUE7QUFDQSw2QkFBQSxhQUFBLENBQUE7QUFDQSxvQkFBQSxlQUFBLENBQUEsQ0FBQSxFQUFBLGFBQUEsQ0FBQTtBQUNBLG9CQUFBLGVBQUEsQ0FBQSxDQUFBLEVBQUEsYUFBQSxDQUFBO0FBQ0EsdUJBQUEsVUFBQTtBQUNBLGFBTEEsQ0FBQTtBQU1BLGlCQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQTs7QUFFQSxZQUFBLHFCQUFBLGVBQUEsVUFBQSxDQUFBO0FBQ0EsMkJBQUEsT0FBQSxHQUNBLElBREEsQ0FDQSxVQUFBLE9BQUEsRUFBQTtBQUNBLGdCQUFBLEtBQUE7QUFDQSxvQkFBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBO0FBQ0Esb0JBQUEsRUFBQSxHQUFBLEtBQUEsT0FBQSxFQUFBLENBQUEsR0FBQSxFQUFBLFFBQUEsQ0FBQTtBQUNBLGFBRkE7O0FBSUEs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QUEsT0FBQSxHQUFBLElBQUE7QUFDQSxxQkFBQSxDQUFBLEVBQUEsTUFBQSxHQUFBLEdBQUE7QUFDQSxxQkFBQSxDQUFBLEVBQUEsU0FBQSxHQUFBLEdBQUE7QUFDQSxxQkFBQSxDQUFBLEVBQUEsb0JBQUEsR0FBQSxHQUFBO0FBQ0EscUJBQUEsQ0FBQSxFQUFBLEtBQUEsR0FBQSxHQUFBO0FBQ0EscUJBQUEsQ0FBQSxFQUFBLEtBQUEsR0FBQSxHQUFBO0FBQ0Esd0JBQUEsS0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLFNBVkE7O0FBWUEsZ0JBQUEsR0FBQSxDQUFBLE9BQUEsRUFBQTtBQUVBLEtBdkNBOztBQTBDQSxXQUFBLFFBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBLEVBR0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQSxFQUlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSkEsRUFLQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUxBLEVBTUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FOQSxFQU9BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUEEsRUFRQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVJBLEVBU0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FUQSxFQVVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVkEsRUFXQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVhBLEVBWUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FaQSxDQUFBO0FBY0EsV0FBQSxTQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQURBLEVBRUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQSxFQUdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEEsRUFJQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUpBLEVBS0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FMQSxFQU1BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTkEsRUFPQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVBBLEVBUUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FSQSxFQVNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVEEsRUFVQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVZBLEVBV0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FYQSxFQVlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWkEsQ0FBQTtBQWNBLFdBQUEsV0FBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBLEVBSUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FKQSxFQUtBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQU5BLEVBT0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FQQSxFQVFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUkEsRUFTQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVRBLEVBVUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FWQSxFQVdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWEEsRUFZQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVpBLENBQUE7QUFjQSxXQUFBLFVBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBLEVBR0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQSxFQUlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSkEsRUFLQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUxBLEVBTUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FOQSxFQU9BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUEEsRUFRQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVJBLEVBU0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FUQSxFQVVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVkEsRUFXQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVhBLEVBWUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FaQSxDQUFBO0FBY0EsQ0EvYkE7O0FDUkEsTUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsYUFBQSxXQURBO0FBRUEscUJBQUEsb0NBRkE7QUFHQSxvQkFBQTtBQUhBLEtBQUE7QUFLQSxDQU5BOztBQVFBLE1BQUEsVUFBQSxDQUFBLFVBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsZUFBQSxFQUFBLE1BQUEsRUFBQSxhQUFBLEVBQUEsY0FBQSxFQUFBOztBQUVBLFFBQUEsTUFBQSxTQUFBLFFBQUEsR0FBQSxHQUFBLEVBQUE7QUFDQSxRQUFBLE1BQUEsZ0JBQUEsR0FBQSxDQUFBOztBQUVBLFFBQUEsT0FBQSxlQUFBO0FBQ0EsUUFBQSxlQUFBLEtBQUEsUUFBQSxFQUFBOztBQUVBLFFBQUEsV0FBQSxJQUFBLEtBQUEsQ0FBQSxPQUFB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QUEsQ0FBQSxPQUFBLEVBQUEsS0FBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLFlBQUEsYUFBQSxZQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUE7O0FBRUEsdUJBQUEsV0FBQSxFQUFBLElBQUEsQ0FBQTtBQUNBLHdCQUFBO0FBREEsU0FBQTs7QUFJQSxpQkFBQSxJQUFBLEdBQUEsa0JBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGdCQUFBLElBQUEsRUFBQTtBQUNBLG9CQUFBLFlBQUEsSUFBQSxNQUFBLENBQUEsS0FBQSxHQUFBLENBQUE7QUFDQSwrQkFBQSxVQUFBLEVBQUEsSUFBQSxDQUFBLFNBQUE7QUFDQSxhQUhBLE1BR0E7QUFDQSx3QkFBQSxHQUFBLENBQUEsa0JBQUE7QUFDQTtBQUNBLFNBUEE7O0FBU0EsWUFBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsUUFBQSxLQUFBLEtBQUE7QUFDQSxnQkFBQSxPQUFBLElBQUEsSUFBQSxDQUFBLEtBQUEsRUFBQSxPQUFBLEdBQUEsS0FBQTtBQUNBLGdCQUFBLFVBQUEsSUFBQSxLQUFBLENBQUEsT0FBQSxFQUFBLEtBQUEsQ0FBQSxRQUFBLEVBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQTtBQUNBLDJCQUFBLE9BQUEsRUFBQSxJQUFBLENBQUEsSUFBQTtBQUNBLFNBTEE7O0FBUUEsWUFBQSxvQkFBQSxJQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsS0FBQSxDQUFBLFFBQUEsRUFBQSxLQUFBLENBQUEsa0JBQUEsQ0FBQTtBQUNBLHVCQUFBLGlCQUFBLEVBQUEsSUFBQSxDQUFBLENBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxRQUFBLEVBQUEsT0FBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLFFBQUEsQ0FBQTs7QUFHQSxlQUFBLEVBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSx3QkFBQTtBQURBLFNBQUE7QUFHQSxLQWhDQTs7QUFrQ0EsV0FBQSxZQUFBLEdBQUEsWUFBQTtBQUNBLGVBQUEsRUFBQSxDQUFBLFVBQUE7QUFDQSxLQUZBO0FBR0EsQ0ExQ0E7O0FDUkE7O0FBRUEsU0FBQSxNQUFBLENBQUEsR0FBQSxFQUFBOztBQUVBLFNBQUEsR0FBQSxHQUFBLEdBQUE7O0FBRUEsU0FBQSxNQUFBLEdBQUEsR0FBQTs7O0FBR0EsU0FBQSxLQUFBLEdBQUEsR0FBQTs7OztBQUlBLFNBQUEsU0FBQSxHQUFBLEdBQUE7OztBQUdBLFNBQUEsb0JBQUEsR0FBQSxHQUFBOzs7QUFHQSxTQUFBLEtBQUEsR0FBQSxHQUFBOzs7QUFHQSxTQUFBLE9BQUEsR0FBQSxJQUFBO0FBQ0E7QUFDQSxPQUFBLFNBQUEsQ0FBQSxFQUFBLEdBQUEsWUFBQTtBQUNBLFlBQUEsR0FBQSxDQUFBLElBQUE7QUFDQSxDQUZBOztBQUlBLE9BQUEsU0FBQSxDQUFBLFdBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBOztBQUVBLFFBQUEsSUFBQSxNQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsSUFBQSxNQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsY0FBQSxNQUFBLENBQUEsQ0FBQTs7QUFFQSxTQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLFNBQUEsS0FBQSxDQUFBLFNBQUEsR0FBQSxJQUFBOzs7QUFHQSxTQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7OztBQUdBLFNBQUEsb0JBQUEsR0FBQSxLQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsS0FBQSxDQUFBO0FBQ0EsQ0FkQTs7QUFnQkEsT0FBQSxTQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxJQUFBLEVBQUE7QUFDQSxRQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsRUFBQTtBQUNBLGVBQUEsTUFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLENBQUE7QUFDQSxLQUZBLE1BRUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLEVBQUE7QUFDQSxlQUFBLE1BQUEsU0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsS0FGQSxNQUVBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxFQUFBO0FBQ0EsZUFBQSxNQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtBQUNBLEtBRkEsTUFFQTtBQUNBLGVBQUEsTUFBQSxTQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLENBVkE7OztBQWFBLE9BQUEsU0FBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLElBQUEsRUFBQSxJQUFBLEVBQUE7QUFDQSxTQUFBLEtBQUEsR0FBQSxLQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsRUFBQSxLQUFBLEtBQUEsRUFBQTtBQUNBLEtBRkEsQ0FBQTs7QUFJQSxTQUFBLFNBQUEsQ0FBQSxPQUFBLEdBQUEsS0FBQSxRQUFBO0FBRUEsQ0FQQTs7QUFTQSxPQUFBLFNBQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUE7O0FBRUEsUUFBQSxZQUFBLFFBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGVBQUEsQ0FBQSxTQUFBLFNBQUEsSUFBQSxhQUFBLEdBQUE7QUFDQSxLQUZBLEVBRUEsQ0FGQSxDQUFBO0FBR0EsWUFBQSxHQUFBLENBQUEsV0FBQSxFQUFBLFNBQUE7QUFDQSxXQUFBLFNBQUE7QUFDQSxDQVBBOzs7Ozs7Ozs7Ozs7Ozs7OztBQXdCQSxPQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxRQUFBLGVBQUEsS0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGVBQUEsU0FBQSxTQUFBO0FBQ0EsS0FGQSxDQUFBOztBQUlBLFFBQUEsS0FBQSxLQUFBLENBQUEsSUFBQSxJQUFBLGFBQUEsTUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLEdBQUE7QUFDQSxDQU5BOztBQVFBLE9BQUEsU0FBQSxDQUFBLEdBQUEsR0FBQSxZQUFBO0FBQ0EsU0FBQSxPQUFBLEdBQUEsS0FBQTs7QUFFQSxDQUhBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgdHN1cm8gPSBhbmd1bGFyLm1vZHVsZSgnVHN1cm8nLCBbJ3VpLnJvdXRlcicsICdmaXJlYmFzZSddKTtcblxudHN1cm8uY29uZmlnKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0ge1xuICAgICAgICBhcGlLZXk6IFwiQUl6YVN5Q0xtM2prazVwcE1xZVF4S29ILWRaOUNkWU1hREdXV3FVXCIsXG4gICAgICAgIGF1dGhEb21haW46IFwidGhlLXBhdGhzLW9mLWRyYWdvbnMuZmlyZWJhc2VhcHAuY29tXCIsXG4gICAgICAgIGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vdGhlLXBhdGhzLW9mLWRyYWdvbnMuZmlyZWJhc2Vpby5jb21cIixcbiAgICAgICAgc3RvcmFnZUJ1Y2tldDogXCJ0aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbVwiLFxuICAgIH07XG4gICAgZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChjb25maWcpO1xufSk7XG5cbnRzdXJvLmNvbnN0YW50KCdmaXJlYmFzZVVybCcsICdodHRwczovL3BhdGgtb2YtdGhlLWRyYWdvbi5maXJlYmFzZWlvLmNvbS8nKTtcblxudHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG59KTtcbiIsImZ1bmN0aW9uIEJvYXJkKCkge1xuICAgIHRoaXMuYm9hcmQgPSBbXTtcbn1cblxuQm9hcmQucHJvdG90eXBlLmRyYXdCb2FyZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IDY7IHkrKykge1xuICAgICAgICBpZiAoIXRoaXMuYm9hcmRbeV0pIHRoaXMuYm9hcmRbeV0gPSBbXTtcbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCA2OyB4KyspIHtcbiAgICAgICAgICAgIHRoaXMuYm9hcmRbeV0ucHVzaChuZXcgU3BhY2UoeCwgeSwgdGhpcy5ib2FyZCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmJvYXJkO1xufVxuXG5mdW5jdGlvbiBTcGFjZSh4LCB5LCBib2FyZCkge1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbiAgICB0aGlzLmltYWdlID0gXCJuXCI7XG4gICAgdGhpcy5wb2ludHMgPSBbbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbF07XG4gICAgdGhpcy50aWxlVXJsID0gXCJuXCI7XG4gICAgdGhpcy50aWxlSWQgPSBcIm5cIjtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgIGxldCBjb3JyZXNwb25kaW5nO1xuXG4gICAgICAgIGlmIChpIDwgMikgeyAvL3RvcFxuICAgICAgICAgICAgY29ycmVzcG9uZGluZyA9IGkgPT09IDAgPyA1IDogNDsgLy8gMCAtPiA1ICYgMSAtPiA0XG4gICAgICAgICAgICBpZiAoeSA9PT0gMCkgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQodHJ1ZSk7XG4gICAgICAgICAgICBlbHNlIHRoaXMucG9pbnRzW2ldID0gYm9hcmRbeSAtIDFdW3hdLnBvaW50c1tjb3JyZXNwb25kaW5nXTtcbiAgICAgICAgfSBlbHNlIGlmIChpIDwgNCkgeyAvL3JpZ2h0XG4gICAgICAgICAgICBpZiAoeCA9PT0gNSkgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQodHJ1ZSk7XG4gICAgICAgICAgICBlbHNlIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIGlmIChpIDwgNikgeyAvL2JvdHRvbVxuICAgICAgICAgICAgaWYgKHkgPT09IDUpIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KHRydWUpO1xuICAgICAgICAgICAgZWxzZSB0aGlzLnBvaW50c1tpXSA9IG5ldyBQb2ludChmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7IC8vbGVmdFxuICAgICAgICAgICAgY29ycmVzcG9uZGluZyA9IGkgPT09IDYgPyAzIDogMjsgLy8gNiAtPiAzICYgNyAtPiAyXG4gICAgICAgICAgICBpZiAoeCA9PT0gMCkgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQodHJ1ZSk7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBvaW50c1tpXSA9IGJvYXJkW3ldW3ggLSAxXS5wb2ludHNbY29ycmVzcG9uZGluZ107XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxuLy8gZWRnZSA9IGJvb2xlYW5cbmZ1bmN0aW9uIFBvaW50KGVkZ2UpIHtcbiAgICB0aGlzLmVkZ2UgPSBlZGdlO1xuICAgIHRoaXMubmVpZ2hib3JzID0gW1wiblwiXTtcbiAgICB0aGlzLnRyYXZlbGxlZCA9IGZhbHNlO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jbGFzcyBEZWNrIHtcbiAgICBjb25zdHJ1Y3Rvcih0aWxlcykge1xuICAgICAgICB0aGlzLnRpbGVzID0gdGlsZXNcbiAgICB9XG5cbiAgICBzaHVmZmxlKCkge1xuICAgICAgICB0aGlzLnRpbGVzID0gXy5zaHVmZmxlKHRoaXMudGlsZXMpXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGRlYWxUaHJlZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZXMuc3BsaWNlKDAsIDMpO1xuICAgIH1cblxuICAgIGRlYWwobnVtKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGVzLnNwbGljZSgwLCBudW0pO1xuICAgIH1cblxuICAgIHJlbG9hZCh0aWxlcykge1xuICAgICAgICB0aGlzLnRpbGVzLnB1c2godGlsZXMpXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLy9HQU1FLy8vXG5cbmNsYXNzIEdhbWUge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUpIHtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5jb3VudCA9IDM1O1xuICAgICAgICB0aGlzLmJvYXJkID0gbmV3IEJvYXJkKCkuZHJhd0JvYXJkKCk7XG4gICAgICAgIHRoaXMucGxheWVycyA9IFtdO1xuICAgICAgICB0aGlzLmF2YWlsYWJsZU1hcmtlcnMgPSBbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJ5ZWxsb3dcIiwgXCJncmVlblwiLCBcImFxdWFcIiwgXCJibHVlXCIsIFwibmF2eVwiLCBcInB1cnBsZVwiXVxuXG4gICAgICAgIHRoaXMuY3VyclBsYXllcjsgLy9pbmRleCBvZiB0aGUgY3VycmVudFBsYXllciBpbiB0aGUgdHVybk9yZGVyQXJyYXlcbiAgICAgICAgdGhpcy50dXJuT3JkZXJBcnJheSA9IFtdIC8vaG9sZHMgYWxsIHRoZSBwbGF5ZXJzIHN0aWxsIG9uIHRoZSBib2FyZC5cbiAgICAgICAgdGhpcy5kcmFnb24gPSBcIlwiOyAvLyBQbGF5ZXIuTWFya2VyXG4gICAgICAgIHRoaXMubW92ZXM7XG4gICAgfVxuXG4gICAgZ2V0Q3VycmVudFBsYXllcigpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VyclBsYXllciA9PT0gLTEpIHJldHVybjtcbiAgICAgICAgcmV0dXJuIHRoaXMudHVybk9yZGVyQXJyYXlbdGhpcy5jdXJyUGxheWVyXTtcbiAgICB9XG5cbiAgICBtb3ZlQWxsUGxheWVycygpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLmZvckVhY2goKHBsYXllcikgPT4gcGxheWVyLmtlZXBNb3ZpbmcocGxheWVyKSlcbiAgICB9XG5cbiAgICBkZWFkUGxheWVycygpIHtcbiAgICAgICAgdmFyIGRlYWRQbGF5ZXJzVGlsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLmZvckVhY2goZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICAgICAgaWYgKCFwbGF5ZXIuY2FuUGxheSAmJiBwbGF5ZXIudGlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGRlYWRQbGF5ZXJzVGlsZXMucHVzaChwbGF5ZXIudGlsZXMpO1xuICAgICAgICAgICAgICAgIGlzRGVhZFBsYXllciA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZGVhZFBsYXllcnNUaWxlcztcbiAgICB9XG5cbiAgICBjaGVja092ZXIoKSB7XG4gICAgICAgIHJldHVybiBnZXRDYW5QbGF5KCkubGVuZ3RoIDw9IDE7XG4gICAgfVxuXG4gICAgLy90byBiZSBjYWxsZWQgYXQgdGhlIGVuZCBvZiBhIHR1cm4gdG8gc2V0IHRoZSBjdXJyUGxheWVyIHRvIHRoZSBuZXh0IGVsaWdpYmxlIHBsYXllciBpbiB0aGUgdHVybk9yZGVyQXJyYXlcbiAgICBnb1RvTmV4dFBsYXllcigpIHtcbiAgICAgICAgaWYgKGdldENhblBsYXkodGhpcy50dXJuT3JkZXJBcnJheSkubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgbGV0IG5ld0lkeCA9IHRoaXMuY3VyclBsYXllciArIDE7XG4gICAgICAgICAgICB3aGlsZSAoIXRoaXMudHVybk9yZGVyQXJyYXlbbmV3SWR4ICUgOF0uY2FuUGxheSkge1xuICAgICAgICAgICAgICAgIG5ld0lkeCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdXJyUGxheWVyID0gbmV3SWR4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jdXJyUGxheWVyID0gLTE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q3VycmVudFBsYXllcigpO1xuICAgIH1cblxuICAgIGRlYWwobnVtKXtcbiAgICAgICAgdmFyIHRpbGVzID0gW107XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBudW07IGkrKyl7IFxuICAgICAgICAgICAgdmFyIHRpbGUgPSB0aGlzLmRlY2tbMF0uc3BsaWNlKDAsMSk7XG4gICAgICAgICAgICB0aGlzLmRlY2suJHNhdmUoMCkudGhlbihmdW5jdGlvbihyZWYpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkZWFsdCBhIGNhcmQhJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRpbGVzICs9IHRpbGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRpbGVzO1xuICAgIH1cblxuICAgIC8vcmVzdGFydCB0aGUgZ2FtZVxuICAgIHJlc2V0KCkge1xuICAgICAgICB0aGlzLnBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgICAgICAgLy9yZXRyaWV2ZSBhbGwgdGlsZXNcbiAgICAgICAgICAgIC8vcmV0dXJuIHBsYXllcidzIHRpbGVzIHRvIHRoZSBkZWNrIGFuZCBzaHVmZmxlXG4gICAgICAgICAgICB0aGlzLmRlY2sucmVsb2FkKHBsYXllci50aWxlcykuc2h1ZmZsZSgpO1xuICAgICAgICAgICAgcGxheWVyLnRpbGVzID0gW107XG4gICAgICAgICAgICAvL3Jlc2V0IGFsbCBwbGF5ZXJzIHBsYXlhYmlsaXR5XG4gICAgICAgICAgICBwbGF5ZXIuY2FuUGxheSA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgIH1cblxufVxuXG4vLy8vL0VORCBPRiBHQU1FIENMQVNTLy8vLy9cblxuLy9nZXQgRWxpZ2libGUgcGxheWVyc1xubGV0IGdldENhblBsYXkgPSBmdW5jdGlvbiAocGxheWVycykge1xuICAgIHJldHVybiBwbGF5ZXJzLmZpbHRlcigocGxheWVyKSA9PiB7XG4gICAgICAgIHJldHVybiBwbGF5ZXIuY2FuUGxheVxuICAgIH0pXG59XG4iLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdnYW1lJywge1xuXHRcdHVybDogJy9nYW1lLzpnYW1lTmFtZScsXG5cdFx0dGVtcGxhdGVVcmw6ICcvYnJvd3Nlci9qcy9nYW1lL2dhbWUuaHRtbCcsXG5cdFx0Y29udHJvbGxlcjogJ2dhbWVDdHJsJ1xuXHR9KTtcbn0pO1xuXG50c3Vyby5jb250cm9sbGVyKCdnYW1lQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRmaXJlYmFzZUF1dGgsIGZpcmViYXNlVXJsLCAkc3RhdGVQYXJhbXMsICRmaXJlYmFzZU9iamVjdCwgJGZpcmViYXNlQXJyYXkpIHsgXG5cdCRzY29wZS50aWxlID0ge1xuXHRcdGltYWdlVXJsOiBcIlwiLFxuXHRcdHBhdGhzOiBbMywgNCwgNiwgMCwgMSwgNywgMiwgNV0sXG5cdFx0cm90YXRpb246IDBcblx0fTtcblxuXG5cdHZhciByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xuXHR2YXIgb2JqID0gJGZpcmViYXNlT2JqZWN0KHJlZik7XG5cdHZhciBnYW1lUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKCRzdGF0ZVBhcmFtcy5nYW1lTmFtZSk7XG5cblx0dmFyIGRlY2tSZWYgPSBnYW1lUmVmLmNoaWxkKCdkZWNrJyk7XG5cdHZhciBwbGF5ZXJzUmVmID0gZ2FtZVJlZi5jaGlsZCgncGxheWVycycpO1xuXHR2YXIgbWFya2Vyc1JlZiA9IGdhbWVSZWYuY2hpbGQoJ2F2YWlsYWJsZU1hcmtlcnMnKTtcblx0dmFyIGRlY2tBcnIgPSAkZmlyZWJhc2VBcnJheShkZWNrUmVmKTtcblx0dmFyIGZpcmViYXNlUGxheWVyc0FyciA9ICRmaXJlYmFzZUFycmF5KHBsYXllcnNSZWYpO1xuXG5cdHZhciBwbGF5ZXIgPSBPYmplY3QuY3JlYXRlKFBsYXllci5wcm90b3R5cGUpO1xuXG5cdC8qKioqKioqKioqKioqKioqXG5cdElOSVRJQUxJWklORyBHQU1FXG5cdCoqKioqKioqKioqKioqKiovXG5cblx0Ly9uZXcgbG9jYWwgZ2FtZSB3aXRoIGdhbWUgbmFtZSBkZWZpbmVkIGJ5IHVybFxuXHQkc2NvcGUuZ2FtZSA9IG5ldyBHYW1lKCRzdGF0ZVBhcmFtcy5nYW1lTmFtZSk7XG5cblx0Ly93aGVuIHRoZSBkZWNrIGlzIGxvYWRlZC4uLlxuXHRkZWNrQXJyLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0Ly8gJHNjb3BlLmdhbWUuZGVjayA9IGRhdGFbMF07IFxuXHRcdCRzY29wZS5nYW1lLmRlY2sgPSBkZWNrQXJyOyAvL2FkZCB0aGUgZGVjayB0byB0aGUgbG9jYWwgZ2FtZSA/IFRyeSB0aGlzIGFzIGZpcmViYXNlIERlY2tBcnI/Pz8/XG5cblxuXHRcdC8vZG9uJ3Qgc3RhcnQgd2F0Y2hpbmcgcGxheWVycyB1bnRpbCB0aGVyZSBpcyBhIGRlY2sgaW4gdGhlIGdhbWVcblx0XHRwbGF5ZXJzUmVmLm9uKFwidmFsdWVcIiwgZnVuY3Rpb24gKHNuYXApIHtcblx0XHRcdHZhciBzbmFwUGxheWVycyA9IHNuYXAudmFsKCk7IC8vZ3JhYiB0aGUgdmFsdWUgb2YgdGhlIHNuYXBzaG90IChhbGwgcGxheWVycyBpbiBnYW1lIGluIEZpcmViYXNlKVxuXG5cdFx0XHQvL2ZvciBlYWNoIHBsYXllciBpbiB0aGlzIGNvbGxlY3Rpb24uLi5cblx0XHRcdGZvciAodmFyIHRoaXNQbGF5ZXIgaW4gc25hcFBsYXllcnMpIHtcblx0XHRcdFx0dmFyIGV4aXN0aW5nUGxheWVySW5kZXgsIHRoaXNJc0FOZXdQbGF5ZXI7XG5cblx0XHRcdFx0Ly9maW5kIHRoaXMgJ3NuYXAnIHBsYXllcidzIGluZGV4IGluIGxvY2FsIGdhbWUuIGZpbmQgcmV0dXJucyB0aGF0IHZhbHVlLiBcblx0XHRcdFx0dmFyIGxvY2FsUGxheWVyID0gJHNjb3BlLmdhbWUucGxheWVycy5maW5kKGZ1bmN0aW9uIChwbHlyLCBwbHlySWR4KSB7XG5cdFx0XHRcdFx0ZXhpc3RpbmdQbGF5ZXJJbmRleCA9IHBseXJJZHg7XG5cdFx0XHRcdFx0cmV0dXJuIHBseXIudWlkID09PSBzbmFwUGxheWVyc1t0aGlzUGxheWVyXS51aWQ7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vaWYgbm90IGZvdW5kLCBjcmVhdGUgbmV3IHBsYXllclxuXHRcdFx0XHRpZiAoIWxvY2FsUGxheWVyKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coJ2kgZGlkbnQgZmluZCBhIGxvY2FsIHBsYXllciEnKTtcblx0XHRcdFx0XHRsb2NhbFBsYXllciA9IG5ldyBQbGF5ZXIoc25hcFBsYXllcnNbdGhpc1BsYXllcl0udWlkKTtcblx0XHRcdFx0XHR0aGlzSXNBTmV3UGxheWVyID0gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vZm9yIGVhY2gga2V5IGluIHRoZSBzbmFwUGxheWVyJ3Mga2V5cywgYWRkIHRoYXQga2V5IGFuZCB2YWx1ZSB0byBsb2NhbCBwbGF5ZXJcblx0XHRcdFx0Zm9yICh2YXIgcGxheWVycHJvcGVydHkgaW4gc25hcFBsYXllcnNbdGhpc1BsYXllcl0pIHtcblx0XHRcdFx0XHRsb2NhbFBsYXllcltwbGF5ZXJwcm9wZXJ0eV0gPSBzbmFwUGxheWVyc1t0aGlzUGxheWVyXVtwbGF5ZXJwcm9wZXJ0eV07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL3B1c2ggbG9jYWwgcGxheWVyIHRvIGdhbWUucGxheWVyc1xuXHRcdFx0XHRpZiAodGhpc0lzQU5ld1BsYXllcikgJHNjb3BlLmdhbWUucGxheWVycy5wdXNoKGxvY2FsUGxheWVyKTtcblx0XHRcdFx0ZWxzZSAkc2NvcGUuZ2FtZS5wbGF5ZXJzW2V4aXN0aW5nUGxheWVySW5kZXhdID0gbG9jYWxQbGF5ZXI7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0fSk7XG5cblxuXHR2YXIgbWFya2Vyc0FyciA9ICRmaXJlYmFzZUFycmF5KG1hcmtlcnNSZWYpOyAvL3N0b3JlIG1hcmtlcnMgYXJyYXlcblxuXHQvL3doZW4gdGhhdCBtYXJrZXJzIGFycmF5IGlzIGxvYWRlZCwgdXBkYXRlIHRoZSBhdmFpbGFibGUgbWFya2VycyBhcnJheSBvbiBzY29wZVxuXHRtYXJrZXJzQXJyLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0JHNjb3BlLmdhbWUuYXZhaWxhYmxlTWFya2VycyA9IGRhdGFbMF07XG5cdH0pO1xuXG5cdC8vaWYgc29tZW9uZSBlbHNlIHBpY2tzIGEgbWFya2VyLCB1cGRhdGUgeW91ciB2aWV3XG5cdG1hcmtlcnNSZWYub24oJ2NoaWxkX2NoYW5nZWQnLCBmdW5jdGlvbiAoZGF0YSkge1xuXHRcdCRzY29wZS5nYW1lLmF2YWlsYWJsZU1hcmtlcnMgPSBkYXRhLnZhbCgpO1xuXHR9KTtcblxuXHQvL29uIGxvZ2luLCBmaW5kIG1lIGluIHRoZSBmaXJlYmFzZSBwbGF5ZXJzIGFycmF5XG5cdGZpcmViYXNlLmF1dGgoKS5vbkF1dGhTdGF0ZUNoYW5nZWQoZnVuY3Rpb24gKHVzZXIpIHtcblx0XHRmaXJlYmFzZVBsYXllcnNBcnIuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcblxuXHRcdFx0aWYgKHVzZXIpIHtcblx0XHRcdFx0dmFyIG1lID0gcGxheWVycy5maW5kKHBsYXllciA9PiBwbGF5ZXIudWlkID09PSB1c2VyLnVpZCk7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAobWUpIHtcblx0XHRcdFx0XHQkc2NvcGUubWUgPSBtZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoJHNjb3BlLm1lLm1hcmtlciA9PT0gXCJuXCIpICRzY29wZS5tZS5tYXJrZXIgPSBudWxsO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gTm8gdXNlciBpcyBzaWduZWQgaW4uXG5cdFx0XHRcdGNvbnNvbGUubG9nKFwibm8gb25lIGlzIGxvZ2dlZCBpblwiKTtcblx0XHRcdH1cblx0XHRcdGNvbnNvbGUubG9nKCdpbSBoZXJlISEhISEhISEnKVxuXHRcdH0pO1xuXHR9KTtcblxuXG5cdC8qKioqKioqKioqKioqKioqXG5cdEFWQUlMQUJMRSBQTEFZRVIgQUNUSU9OUyBBVCBHQU1FIFNUQVJUXG5cdCoqKioqKioqKioqKioqKiovXG5cblx0JHNjb3BlLnBpY2tNYXJrZXIgPSBmdW5jdGlvbiAoYm9hcmQsIG1hcmtlcikge1xuXHRcdCRzY29wZS5tZS5tYXJrZXIgPSBtYXJrZXI7XG5cblx0XHRmaXJlYmFzZVBsYXllcnNBcnIuJGxvYWRlZCgpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocGxheWVycykge1xuXHRcdFx0XHR2YXIgbWVJZHg7XG5cdFx0XHRcdC8vZmluZCBteSBpbmRleCBpbiB0aGUgcGxheWVycyBhcnJheVxuXHRcdFx0XHRwbGF5ZXJzLmZpbmQoZnVuY3Rpb24gKGUsIGkpIHtcblx0XHRcdFx0XHRpZiAoZS4kaWQgPT09ICRzY29wZS5tZS4kaWQpIG1lSWR4ID0gaTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdC8vZ2l2ZSBtZSBhIG1hcmtlciBhbmQgc2F2ZSBtZSBpbiBmaXJlYmFzZVxuXHRcdFx0XHRmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLm1hcmtlciA9IG1hcmtlcjtcblx0XHRcdFx0ZmlyZWJhc2VQbGF5ZXJzQXJyLiRzYXZlKG1lSWR4KTtcblx0XHRcdH0pO1xuXG5cdFx0dmFyIGlkeCA9ICRzY29wZS5nYW1lLmF2YWlsYWJsZU1hcmtlcnMuaW5kZXhPZihtYXJrZXIpO1xuXG5cdFx0bWFya2Vyc0FyclswXS5zcGxpY2UoaWR4LCAxKTtcblxuXHRcdG1hcmtlcnNBcnIuJHNhdmUoMClcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZWYpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJyZW1vdmVkIHRoZSBwaWNrZWQgbWFya2VyXCIpO1xuXHRcdFx0XHRjb25zb2xlLmxvZyhyZWYua2V5KTtcblx0XHRcdH0pO1xuXHR9O1xuXG5cblx0Ly9UT0RPOiBsaW1pdCBzdGFydCBwb2ludHNcblxuXHQvL0hhdmUgcGxheWVyIHBpY2sgdGhlaXIgc3RhcnQgcG9pbnRcblx0JHNjb3BlLnBsYWNlTWFya2VyID0gZnVuY3Rpb24gKGJvYXJkLCBwb2ludCkge1xuXHRcdC8vcGxhY2UgbXkgbWFya2VyXG5cdFx0cGxheWVyLnBsYWNlTWFya2VyKGJvYXJkLCBwb2ludCwgJHNjb3BlLm1lKTtcblx0XHQkc2NvcGUubWUudGlsZXMgPSAkc2NvcGUuZ2FtZS5kZWFsKDMpOyAvL2RlYWwgbWUgdGhyZWUgY2FyZHNcblxuXHRcdC8vd2hlbiB0aGUgZmlyZWJhc2UgcGxheWVycyBhcmUgbG9hZGVkLi4uLlxuXHRcdGZpcmViYXNlUGxheWVyc0Fyci4kbG9hZGVkKClcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG5cdFx0XHRcdC8vZmluZCBtZSBpbiB0aGUgZmlyZWJhc2UgcGxheWVycyBhcnJheVxuXHRcdFx0XHR2YXIgbWVJZHg7XG5cdFx0XHRcdHBsYXllcnMuZmluZChmdW5jdGlvbiAoZSwgaSkge1xuXHRcdFx0XHRcdGlmIChlLnVpZCA9PT0gJHNjb3BlLm1lLnVpZCkgbWVJZHggPSBpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdID0gJHNjb3BlLm1lOyAvL3NldCBmaXJlYmFzZSBtZSB0byBsb2NhbCBtZVxuXG5cdFx0XHRcdGZpcmViYXNlUGxheWVyc0Fyci4kc2F2ZShtZUlkeCk7IC8vc2F2ZSBpdC5cblx0XHRcdH0pO1xuXHR9O1xuXG5cblxuXG5cblxuXG5cblx0Ly8gVE9ETzogd2UgcHJvYmFibHkgbmVlZCB0aGlzIG9uIGZpcmViYXNlIHNvIG90aGVyIHBlb3BsZSBjYW4ndCBwaWNrIHdoYXQncyBiZWVuIHBpY2tlZFxuXG5cdC8vRm9yIHN5bmNocm9uaXppbmdHYW1lLi4uXG5cdC8vIHZhciBzeW5jUmVmID0gZ2FtZVJlZi5jaGlsZCgnbW92ZXMnKTtcblx0Ly8gc3luY1JlZi5vbignY2hpbGRfYWRkZWQnLCBmdW5jdGlvbiAoY2hpbGRTbmFwc2hvdCwgcHJldkNoaWxkS2V5KSB7XG5cdC8vIFx0Ly9ORUVEIFRPIERPVUJMRSBDSEVDSyEhIFdoYXQgZG9lcyBjaGlsZFNuYXAgcmV0dXJucz9cblx0Ly8gXHRjb25zb2xlLmxvZygnY2hpbGRTbmFwc2hvdF9TeW5jR2FtZScsIGNoaWxkU25hcHNob3QpO1xuXHQvLyBcdC8vZGVwZW5kaW5nIG9uIHdoYXQgY2hpbGRTbmFwc2hvdCBnaXZlcyBtZS4uLkkgdGhpbmsgaXQncyBvbmUgY2hpbGQgcGVyIG9uIGNhbGw/IEl0IGRvZXNuJ3QgcmV0dXJuIGFuIGFycmF5IG9mIGNoYW5nZXMuLi5JIGJlbGlldmUhXG5cdC8vIFx0aWYgKGNoaWxkU25hcHNob3QudHlwZSA9PT0gJ3VwZGF0ZURlY2snKSB7XG5cdC8vIFx0XHQkc2NvcGUuZ2FtZS5kZWNrID0gY2hpbGRTbmFwc2hvdC51cGRhdGVEZWNrO1xuXHQvLyBcdH0gZWxzZSB7XG5cdC8vIFx0XHQkc2NvcGUucGxhY2VUaWxlKGNoaWxkU25hcHNob3QudGlsZSk7XG5cdC8vIFx0fVxuXHQvLyB9KTtcblxuXHQvLyBUT0RPOiBob3cgdG8gcmUtZG8gdGhlIG1vdmVzP1xuXHQvLyAkc2NvcGUuZ2FtZS5tb3ZlcztcblxuXHQvLyBUT0RPOiBob3cgZG8gd2Ugc2hvdyB0aGUgdGlsZXMgZm9yIHBsYXllcj9cblxuXHQvLyBUT0RPOiBob3cgdG8gc2hvdyB0aGUgcm90YXRlZCB0aWxlP1xuXG5cdC8vIENNVDogYXNzdW1pbmcgd2UgdXNlIG5ldyBHYW1lKCkgZm9yIGVhY2ggZ2FtZVxuXHQkc2NvcGUuY3VycmVudFBsYXllciA9ICRzY29wZS5nYW1lLmdldEN1cnJlbnRQbGF5ZXIoKTtcblxuXHQvLyBUT0RPOiBuZWVkIGEgZnVuY3Rpb24gdG8gYXNzaWduIGRyYWdvblxuXHQkc2NvcGUuZHJhZ29uO1xuXHR2YXIgYXdhaXRpbmdEcmFnb25Ib2xkZXJzID0gW107XG5cblx0JHNjb3BlLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuXHRcdC8vXG5cdH07XG5cblx0JHNjb3BlLm15VHVybiA9IGZ1bmN0aW9uICgpIHtcblx0XHQkc2NvcGUubWUgPT09ICRzY29wZS5jdXJyZW50UGxheWVyO1xuXHR9O1xuXG5cdC8vdGhlc2UgYXJlIHRpZWQgdG8gYW5ndWxhciBuZy1jbGljayBidXR0b25zXG5cdCRzY29wZS5yb3RhdGVUaWxlQ3cgPSBmdW5jdGlvbiAodGlsZSkge1xuXHRcdGNvbnNvbGUubG9nKFwicm90YXRlIHRvIHJpZ2h0XCIpO1xuXHRcdHRpbGUucm90YXRpb24rKztcblx0XHRpZiAodGlsZS5yb3RhdGlvbiA9PT0gNCkgdGlsZS5yb3RhdGlvbiA9IDA7XG5cdH07XG5cblx0JHNjb3BlLnJvdGF0ZVRpbGVDY3cgPSBmdW5jdGlvbiAodGlsZSkge1xuXHRcdHRpbGUucm90YXRpb24tLTtcblx0XHRpZiAodGlsZS5yb3RhdGlvbiA9PT0gLTQpIHRpbGUucm90YXRpb24gPSAwO1xuXHR9O1xuXG5cdC8vIENNVDogdXNlIHBsYXllcidzIGFuZCBnYW1lJ3MgcHJvdG90eXBlIGZ1bmN0aW9uIHRvIHBsYWNlIHRpbGUgYW5kIHRoZW4gbW92ZSBhbGwgcGxheWVyc1xuXHQkc2NvcGUucGxhY2VUaWxlID0gZnVuY3Rpb24gKHRpbGUpIHtcblx0XHQvLyBUT0RPOiBzZW5kIHRoaXMgc3RhdGUgdG8gZmlyZWJhc2UgZXZlcnkgdGltZSBpdCdzIGNhbGxlZFxuXHRcdGlmICh0aWxlLnJvdGF0aW9uID4gMCkge1xuXHRcdFx0dGlsZS5wYXRocyA9IHRpbGUucGF0aHMubWFwKGZ1bmN0aW9uIChjb25uZWN0aW9uKSB7XG5cdFx0XHRcdGNvbm5lY3Rpb24gPSBjb25uZWN0aW9uICsgMjtcblx0XHRcdFx0aWYgKGNvbm5lY3Rpb24gPT09IDkpIGNvbm5lY3Rpb24gPSAxO1xuXHRcdFx0XHRpZiAoY29ubmVjdGlvbiA9PT0gOCkgY29ubmVjdGlvbiA9IDA7XG5cdFx0XHRcdHJldHVybiBjb25uZWN0aW9uO1xuXHRcdFx0fSk7XG5cdFx0XHR0aWxlLnBhdGhzLnVuc2hpZnQodGlsZS5wYXRocy5wb3AoKSk7XG5cdFx0XHR0aWxlLnBhdGhzLnVuc2hpZnQodGlsZS5wYXRocy5wb3AoKSk7XG5cdFx0fSBlbHNlIGlmICh0aWxlLnJvdGF0aW9uIDwgMCkge1xuXHRcdFx0dGlsZS5wYXRocyA9IHRpbGUucGF0aHMubWFwKGZ1bmN0aW9uIChjb25uZWN0aW9uKSB7XG5cdFx0XHRcdGNvbm5lY3Rpb24gPSBjb25uZWN0aW9uIC0gMjtcblx0XHRcdFx0aWYgKGNvbm5lY3Rpb24gPT09IC0yKSBjb25uZWN0aW9uID0gNjtcblx0XHRcdFx0aWYgKGNvbm5lY3Rpb24gPT09IC0xKSBjb25uZWN0aW9uID0gNztcblx0XHRcdFx0cmV0dXJuIGNvbm5lY3Rpb247XG5cdFx0XHR9KTtcblx0XHRcdHRpbGUucGF0aHMucHVzaCh0aWxlLnBhdGhzLnNoaWZ0KCkpO1xuXHRcdFx0dGlsZS5wYXRocy5wdXNoKHRpbGUucGF0aHMuc2hpZnQoKSk7XG5cdFx0fVxuXG5cdFx0dmFyIGZpcmViYXNlUGxheWVyc0FyciA9ICRmaXJlYmFzZUFycmF5KHBsYXllcnNSZWYpO1xuXHRcdGZpcmViYXNlUGxheWVyc0Fyci4kbG9hZGVkKClcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG5cdFx0XHRcdHZhciBtZUlkeDtcblx0XHRcdFx0cGxheWVycy5maW5kKGZ1bmN0aW9uIChlLCBpKSB7XG5cdFx0XHRcdFx0aWYgKGUuJGlkID09PSAkc2NvcGUubWUuJGlkKSBtZUlkeCA9IGk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHBsYXllci5wbGFjZVRpbGUodGlsZSwgZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XSk7XG5cblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aWxlLnBhdGhzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0aWYgKGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0ubmV4dFNwYWNlLnBvaW50c1tpXS5uZWlnaGJvcnNbMF0gPT09IFwiblwiKSB7XG5cdFx0XHRcdFx0XHRmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLm5leHRTcGFjZS5wb2ludHNbaV0ubmVpZ2hib3JzLnNwbGljZSgwLCAxKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS5uZXh0U3BhY2UucG9pbnRzW2ldLm5laWdoYm9ycy5wdXNoKGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0ubmV4dFNwYWNlLnBvaW50c1t0aWxlLnBhdGhzW2ldXSk7XG5cdFx0XHRcdFx0ZmlyZWJhc2VQbGF5ZXJzQXJyLiRzYXZlKG1lSWR4KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0ucG9pbnQgPSBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLm5leHRTcGFjZS5wb2ludHNbZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS5uZXh0U3BhY2VQb2ludHNJbmRleF07XG5cdFx0XHRcdGZpcmViYXNlUGxheWVyc0Fyci4kc2F2ZShtZUlkeCk7XG5cdFx0XHR9KTtcblxuXG5cdFx0Ly8gQ01UOiB0aGlzIHNob3VsZCBzZW5kIHRoZSByb3RhdGVkIHRpbGUgdG8gZmlyZWJhc2Vcblx0XHRtb3Zlc0Fyci4kYWRkKHtcblx0XHRcdCd0eXBlJzogJ3BsYWNlVGlsZScsXG5cdFx0XHQndGlsZSc6IHRpbGUsXG5cdFx0XHQncGxheWVyVWlkJzogJHNjb3BlLm1lLnVpZFxuXHRcdH0pO1xuXG5cblx0XHRmaXJlYmFzZVBsYXllcnNBcnIuJGxvYWRlZCgpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocGxheWVycykge1xuXHRcdFx0XHRwbGF5ZXJzLmZvckVhY2goZnVuY3Rpb24gKHApIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhcInBcIiwgcC5wb2ludCk7XG5cblx0XHRcdFx0XHQvLyBsZXQgbW92YWJsZSA9IHBsYXllci5tb3ZlVG8ocC5wb2ludCk7XG5cdFx0XHRcdFx0Ly8gdmFyIHBJZHggPSBwbGF5ZXJzLmluZGV4T2YocClcblxuXHRcdFx0XHRcdC8vIHdoaWxlIChtb3ZhYmxlKSB7XG5cdFx0XHRcdFx0Ly8gICAgIC8vIG15IHBvaW50IGlzIGdvaW5nIHRvIGJlIGN1cnJlbnQgcG9pbnQncyBuZWlnaGJvcnNcblx0XHRcdFx0XHQvLyAgICAgcC5wb2ludC50cmF2ZWxsZWQgPSB0cnVlO1xuXHRcdFx0XHRcdC8vICAgICBwLnBvaW50ID0gcC5uZWlnaGJvcnMuZmlsdGVyKGZ1bmN0aW9uIChuKSB7XG5cdFx0XHRcdFx0Ly8gICAgICAgICByZXR1cm4gIW4udHJhdmVsbGVkICYmIG5laWdoYm9yICE9PSBcIm5cIjtcblx0XHRcdFx0XHQvLyAgICAgfSlbMF1cblx0XHRcdFx0XHQvLyAgICAgY29uc29sZS5sb2cocC5wb2ludCwgXCJnYW1lIGpzIHAgcG9pbnRcIilcblx0XHRcdFx0XHQvLyAgICAgdmFyIHBvaW50SWR4O1xuXHRcdFx0XHRcdC8vICAgICBwLm5leHRTcGFjZS5wb2ludHMuZm9yRWFjaChmdW5jdGlvbiAocG9pbnQsIGlkeCkge1xuXHRcdFx0XHRcdC8vICAgICAgICAgaWYgKEpTT04udG9TdHJpbmcocG9pbnQpID09PSBKU09OLnRvU3RyaW5nKHAucG9pbnQpKSB7XG5cdFx0XHRcdFx0Ly8gICAgICAgICAgICAgcG9pbnRJZHggPSBpZHg7XG5cdFx0XHRcdFx0Ly8gICAgICAgICB9XG5cdFx0XHRcdFx0Ly8gICAgIH0pXG5cdFx0XHRcdFx0Ly8gICAgIHAubmV4dFNwYWNlUG9pbnRzSW5kZXggPSBwb2ludElkeDtcblx0XHRcdFx0XHQvL1xuXHRcdFx0XHRcdC8vICAgICBsZXQgb2xkU3BhY2UgPSBwLm5leHRTcGFjZTtcblx0XHRcdFx0XHQvLyAgICAgbGV0IG5ld1NwYWNlID0gcGxheWVyLm5ld1NwYWNlKCRzY29wZS5nYW1lLmJvYXJkLCBvbGRTcGFjZSwgcCk7XG5cdFx0XHRcdFx0Ly8gICAgIHAubmV4dFNwYWNlID0gbmV3U3BhY2U7XG5cdFx0XHRcdFx0Ly9cblx0XHRcdFx0XHQvLyAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyLiRzYXZlKHBJZHgpXG5cdFx0XHRcdFx0Ly8gICAgICAgICAvLyBwbGF5ZXIuY2hlY2tEZWF0aChwKTtcblx0XHRcdFx0XHQvLyAgICAgbW92YWJsZSA9IHBsYXllci5tb3ZlVG8ocC5wb2ludCk7XG5cdFx0XHRcdFx0Ly9cblx0XHRcdFx0XHQvLyB9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblxuXHRcdC8vIGlmICgkc2NvcGUuZ2FtZS5jaGVja092ZXIoKSkge1xuXHRcdC8vICAgICAvLyBUT0RPOiBuZWVkIHRvIHRlbGwgdGhlIHBsYXllciBzaGUgd29uXG5cdFx0Ly8gICAgICRzY29wZS53aW5uZXIgPSAkc2NvcGUuZ2FtZS5nZXRDYW5QbGF5KClbMF07XG5cdFx0Ly8gICAgICRzY29wZS5nYW1lT3ZlciA9IHRydWU7XG5cdFx0Ly8gfSBlbHNlIHtcblx0XHQvLyAgICAgLy8gSWYgZGVjayBpcyBlbXB0eSAmIG5vIG9uZSBpcyBkcmFnb24sIHNldCBtZSBhcyBkcmFnb25cblx0XHQvLyAgICAgaWYgKCRzY29wZS5nYW1lLmRlY2subGVuZ3RoID09PSAwICYmICEkc2NvcGUuZHJhZ29uKSB7XG5cdFx0Ly8gICAgICAgICAkc2NvcGUuZHJhZ29uID0gJHNjb3BlLm1lO1xuXHRcdC8vICAgICB9IGVsc2UgaWYgKCRzY29wZS5nYW1lLmRlY2subGVuZ3RoID09PSAwICYmICRzY29wZS5kcmFnb24pIHtcblx0XHQvLyAgICAgICAgIGF3YWl0aW5nRHJhZ29uSG9sZGVycy5wdXNoKCRzY29wZS5tZSk7XG5cdFx0Ly8gICAgIH0gZWxzZSB7XG5cdFx0Ly8gICAgICAgICAvLyBDTVQ6IGRyYXcgb25lIHRpbGUgYW5kIHB1c2ggaXQgdG8gdGhlIHBsYXllci50aWxlcyBhcnJheVxuXHRcdC8vICAgICAgICAgJHNjb3BlLm1lLnRpbGVzLnB1c2goJHNjb3BlLmdhbWUuZGVjay5kZWFsKDEpKTtcblx0XHQvLyAgICAgICAgIC8vaWYgZGVhZCBwbGF5ZXJzLCB0aGVuIHB1c2ggdGhlaXIgY2FyZHMgYmFjayB0byB0aGUgZGVjayAmIHJlc2h1ZmZsZVxuXHRcdC8vICAgICAgICAgaWYgKCRzY29wZS5nYW1lLmRlYWRQbGF5ZXJzKCkubGVuZ3RoKSB7XG5cdFx0Ly8gICAgICAgICAgICAgLy93aXRoIG5ldyBjYXJkcyAmIG5lZWQgdG8gcmVzaHVmZmxlXG5cdFx0Ly8gICAgICAgICAgICAgJHNjb3BlLmdhbWUuZGVhZFBsYXllcnMoKS5mb3JFYWNoKGZ1bmN0aW9uIChkZWFkUGxheWVyVGlsZXMpIHtcblx0XHQvLyAgICAgICAgICAgICAgICAgZGVhZFBsYXllclRpbGVzLmZvckVhY2goZnVuY3Rpb24gKHRpbGUpIHtcblx0XHQvLyAgICAgICAgICAgICAgICAgICAgICRzY29wZS5nYW1lLmRlY2sucHVzaCh0aWxlKTtcblx0XHQvLyAgICAgICAgICAgICAgICAgfSk7XG5cdFx0Ly8gICAgICAgICAgICAgfSk7XG5cdFx0Ly8gICAgICAgICAgICAgJHNjb3BlLmdhbWUuZGVjayA9ICRzY29wZS5nYW1lLmRlY2suc2h1ZmZsZSgpO1xuXHRcdC8vICAgICAgICAgICAgIC8vc2VuZCBmaXJlYmFzZSBhIG5ldyBtb3ZlXG5cdFx0Ly8gICAgICAgICAgICAgZ2FtZVJlZi5jaGlsZCgnbW92ZXMnKS5wdXNoKHtcblx0XHQvLyAgICAgICAgICAgICAgICAgJ3R5cGUnOiAndXBkYXRlRGVjaycsXG5cdFx0Ly8gICAgICAgICAgICAgICAgICd1cGRhdGVEZWNrJzogJHNjb3BlLmdhbWUuZGVja1xuXHRcdC8vICAgICAgICAgICAgIH0pO1xuXHRcdC8vICAgICAgICAgICAgIGlmICgkc2NvcGUuZHJhZ29uKSB7XG5cdFx0Ly8gICAgICAgICAgICAgICAgICRzY29wZS5kcmFnb24udGlsZXMucHVzaCgkc2NvcGUuZ2FtZS5kZWNrLmRlYWwoMSkpO1xuXHRcdC8vICAgICAgICAgICAgICAgICAkc2NvcGUuZHJhZ29uID0gbnVsbDtcblx0XHQvLyAgICAgICAgICAgICAgICAgLy9ORUVEIFRPIERJU0NVU1M6IE1pZ2h0IG5lZWQgdG8gbW9kaWZ5IHRoaXMgaWYgd2Ugd2FudCB0byB1c2UgdXAgdGhlIGNhcmRzIGFuZCBnaXZlIGVhY2ggYXdhaXRpbmcgcGxheWVycycgdXAgdG8gMyBjYXJkc1xuXHRcdC8vICAgICAgICAgICAgICAgICB3aGlsZSAoJHNjb3BlLmdhbWUuZGVjay5sZW5ndGggJiYgJHNjb3BlLmF3YWl0aW5nRHJhZ29uSG9sZGVycy5sZW5ndGgpIHtcblx0XHQvLyAgICAgICAgICAgICAgICAgICAgICRzY29wZS5hd2FpdGluZ0RyYWdvbkhvbGRlcnMuc2hpZnQoKS50aWxlcy5wdXNoKCRzY29wZS5nYW1lLmRlY2suZGVhbCgxKSk7XG5cdFx0Ly8gICAgICAgICAgICAgICAgIH07XG5cdFx0Ly8gICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuYXdhaXRpbmdEcmFnb25Ib2xkZXJzLmxlbmd0aCkge1xuXHRcdC8vICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRyYWdvbiA9ICRzY29wZS5hd2FpdGluZ0RyYWdvbkhvbGRlcnMuc2hpZnQoKTtcblx0XHQvLyAgICAgICAgICAgICAgICAgfVxuXHRcdC8vICAgICAgICAgICAgIH07XG5cdFx0Ly8gICAgICAgICB9XG5cdFx0Ly9cblx0XHQvLyAgICAgfVxuXHRcdC8vICAgICAkc2NvcGUuZ2FtZS5nb1RvTmV4dFBsYXllcigpO1xuXHRcdC8vIH1cblx0fTtcblxuXHQvLyBUT0RPOiBmaXJlYmFzZSBnYW1lLnBsYXllcnMgc2xpY2UgJHNjb3BlLnBsYXllciBvdXRcblx0JHNjb3BlLmxlYXZlR2FtZTtcblxuXHQvLyBUT0RPOiBuZWVkIHRvIHJlbW92ZSB0aGlzIGdhbWUgcm9vbSdzIG1vdmVzIGZyb20gZmlyZWJhc2U/XG5cdCRzY29wZS5yZXNldCA9IGZ1bmN0aW9uICgpIHtcblx0XHRtYXJrZXJzQXJyLiRyZW1vdmUoMClcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZWYpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJyZW1vdmVkIGFsbCBtYXJrZXJzXCIsIHJlZi5rZXkpO1xuXHRcdFx0fSk7XG5cblx0XHRkZWNrQXJyLiRyZW1vdmUoMClcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZWYpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJyZW1vdmVkIHRoZSBkZWNrXCIsIHJlZi5rZXkpO1xuXHRcdFx0fSk7XG5cblx0XHRvYmouJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcblx0XHRcdHZhciB0aWxlcyA9IGRhdGEudGlsZXM7XG5cdFx0XHR2YXIgZGVjayA9IG5ldyBEZWNrKHRpbGVzKS5zaHVmZmxlKCkudGlsZXM7XG5cdFx0XHR2YXIgaW5pdGlhbERlY2tSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoJHN0YXRlUGFyYW1zLmdhbWVOYW1lKS5jaGlsZCgnaW5pdGlhbERlY2snKTtcblx0XHRcdCRmaXJlYmFzZUFycmF5KGluaXRpYWxEZWNrUmVmKS4kYWRkKGRlY2spO1xuXHRcdH0pO1xuXG5cblxuXHRcdHZhciBpbml0aWFsTWFya2Vyc1JlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZCgkc3RhdGVQYXJhbXMuZ2FtZU5hbWUpLmNoaWxkKCdhdmFpbGFibGVNYXJrZXJzJyk7XG5cdFx0JGZpcmViYXNlQXJyYXkoaW5pdGlhbE1hcmtlcnNSZWYpLiRhZGQoW1wicmVkXCIsIFwib3JhbmdlXCIsIFwieWVsbG93XCIsIFwiZ3JlZW5cIiwgXCJhcXVhXCIsIFwiYmx1ZVwiLCBcIm5hdnlcIiwgXCJwdXJwbGVcIl0pO1xuXG5cblx0XHR2YXIgcGxheWVycyA9ICRmaXJlYmFzZUFycmF5KHBsYXllcnNSZWYpO1xuXHRcdHBsYXllcnMuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRkYXRhW2ldLmNhblBsYXkgPSB0cnVlO1xuXHRcdFx0XHRkYXRhW2ldLm1hcmtlciA9ICduJztcblx0XHRcdFx0ZGF0YVtpXS5uZXh0U3BhY2UgPSAnbic7XG5cdFx0XHRcdGRhdGFbaV0ubmV4dFNwYWNlUG9pbnRzSW5kZXggPSAnbic7XG5cdFx0XHRcdGRhdGFbaV0ucG9pbnQgPSAnbic7XG5cdFx0XHRcdGRhdGFbaV0udGlsZXMgPSAnbic7XG5cdFx0XHRcdHBsYXllcnMuJHNhdmUoaSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRjb25zb2xlLmxvZygkc2NvcGUubWUpO1xuXG5cdH07XG5cblxuXHQkc2NvcGUuc3RhcnR0b3AgPSBbXG5cdFx0WzAsIDAsIDBdLFxuXHRcdFswLCAwLCAxXSxcblx0XHRbMSwgMCwgMF0sXG5cdFx0WzEsIDAsIDFdLFxuXHRcdFsyLCAwLCAwXSxcblx0XHRbMiwgMCwgMV0sXG5cdFx0WzMsIDAsIDBdLFxuXHRcdFszLCAwLCAxXSxcblx0XHRbNCwgMCwgMF0sXG5cdFx0WzQsIDAsIDFdLFxuXHRcdFs1LCAwLCAwXSxcblx0XHRbNSwgMCwgMV1cblx0XTtcblx0JHNjb3BlLnN0YXJ0bGVmdCA9IFtcblx0XHRbMCwgMCwgN10sXG5cdFx0WzAsIDAsIDZdLFxuXHRcdFswLCAxLCA3XSxcblx0XHRbMCwgMSwgNl0sXG5cdFx0WzAsIDIsIDddLFxuXHRcdFswLCAyLCA2XSxcblx0XHRbMCwgMywgN10sXG5cdFx0WzAsIDMsIDZdLFxuXHRcdFswLCA0LCA3XSxcblx0XHRbMCwgNCwgNl0sXG5cdFx0WzAsIDUsIDddLFxuXHRcdFswLCA1LCA2XVxuXHRdO1xuXHQkc2NvcGUuc3RhcnRib3R0b20gPSBbXG5cdFx0WzAsIDUsIDBdLFxuXHRcdFswLCA1LCAxXSxcblx0XHRbMSwgNSwgMF0sXG5cdFx0WzEsIDUsIDFdLFxuXHRcdFsyLCA1LCAwXSxcblx0XHRbMiwgNSwgMV0sXG5cdFx0WzMsIDUsIDBdLFxuXHRcdFszLCA1LCAxXSxcblx0XHRbNCwgNSwgMF0sXG5cdFx0WzQsIDUsIDFdLFxuXHRcdFs1LCA1LCAwXSxcblx0XHRbNSwgNSwgMV1cblx0XTtcblx0JHNjb3BlLnN0YXJ0cmlnaHQgPSBbXG5cdFx0WzUsIDAsIDJdLFxuXHRcdFs1LCAwLCAzXSxcblx0XHRbNSwgMSwgMl0sXG5cdFx0WzUsIDEsIDNdLFxuXHRcdFs1LCAyLCAyXSxcblx0XHRbNSwgMiwgM10sXG5cdFx0WzUsIDMsIDJdLFxuXHRcdFs1LCAzLCAzXSxcblx0XHRbNSwgNCwgMl0sXG5cdFx0WzUsIDQsIDNdLFxuXHRcdFs1LCA1LCAyXSxcblx0XHRbNSwgNSwgM11cblx0XTtcbn0pO1xuIiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdnYW1lbGlzdCcsIHtcbiAgICAgICAgdXJsOiAnL2dhbWVsaXN0JyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvYnJvd3Nlci9qcy9nYW1lbGlzdC9nYW1lbGlzdC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2dhbWVMaXN0JyxcbiAgICB9KTtcbn0pO1xuXG50c3Vyby5jb250cm9sbGVyKCdnYW1lTGlzdCcsIGZ1bmN0aW9uICgkc2NvcGUsIGZpcmViYXNlVXJsLCAkZmlyZWJhc2VPYmplY3QsICRzdGF0ZSwgJGZpcmViYXNlQXV0aCwgJGZpcmViYXNlQXJyYXkpIHtcbiAgICAvL0ZvciBzeW5jaHJvbml6aW5nR2FtZUxpc3QuLi5cbiAgICB2YXIgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbiAgICB2YXIgb2JqID0gJGZpcmViYXNlT2JqZWN0KHJlZik7XG5cbiAgICB2YXIgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcbiAgICB2YXIgZmlyZWJhc2VVc2VyID0gYXV0aC4kZ2V0QXV0aCgpO1xuXG4gICAgdmFyIHN5bmNoUmVmID0gcmVmLmNoaWxkKFwiZ2FtZXNcIik7XG4gICAgdmFyIHN5bmNocm9uaXplZE9iaiA9ICRmaXJlYmFzZU9iamVjdChzeW5jaFJlZik7XG5cbiAgICAvLyBUaGlzIHJldHVybnMgYSBwcm9taXNlLi4ueW91IGNhbi50aGVuKCkgYW5kIGFzc2lnbiB2YWx1ZSB0byAkc2NvcGUudmFyaWFibGVcbiAgICAvLyBnYW1lbGlzdCBpcyB3aGF0ZXZlciB3ZSBhcmUgY2FsbGluZyBpdCBpbiB0aGUgYW5ndWxhciBodG1sLlxuICAgIHN5bmNocm9uaXplZE9iai4kYmluZFRvKCRzY29wZSwgXCJnYW1lbGlzdFwiKVxuICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZ2FtZWxpc3QgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gJHNjb3BlLmdhbWVsaXN0KSB7XG4gICAgICAgICAgICAgICAgZ2FtZWxpc3QucHVzaChbaSwgJHNjb3BlLmdhbWVsaXN0W2ldXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkc2NvcGUuZ2FtZU5hbWVzID0gZ2FtZWxpc3Quc2xpY2UoMik7XG4gICAgICAgIH0pO1xuXG5cblxuXG4gICAgJHNjb3BlLmpvaW4gPSBmdW5jdGlvbiAoZ2FtZU5hbWUpIHtcbiAgICAgICAgdmFyIGdhbWVOYW1lUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKGdhbWVOYW1lKTtcbiAgICAgICAgdmFyIHBsYXllcnNSZWYgPSBnYW1lTmFtZVJlZi5jaGlsZCgncGxheWVycycpO1xuXG4gICAgICAgIGZpcmViYXNlLmF1dGgoKS5vbkF1dGhTdGF0ZUNoYW5nZWQoZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIHZhciBmaXJlYmFzZVBsYXllcnNBcnIgPSAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKTtcblxuICAgICAgICAgICAgZmlyZWJhc2VQbGF5ZXJzQXJyLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBGQnBsYXllcnMgPSBkYXRhO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIUZCcGxheWVycy5maWx0ZXIoZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGxheWVyLnVpZCA9PT0gdXNlci51aWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3UGxheWVyID0gbmV3IFBsYXllcih1c2VyLnVpZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKS4kYWRkKG5ld1BsYXllcilcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vIHVzZXIgaXMgc2lnbmVkIGluLlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJub3RoaW5nXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnZ2FtZScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZ2FtZU5hbWVcIjogZ2FtZU5hbWVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59KTtcbiIsInRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbG9naW4nLCB7XG4gICAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2Jyb3dzZXIvanMvbG9naW4vbG9naW4uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdsb2dpbkN0cmwnXG4gICAgfSk7XG59KTtcblxudHN1cm8uY29udHJvbGxlcignbG9naW5DdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlLCAkZmlyZWJhc2VBdXRoLCAkcm9vdFNjb3BlKSB7XG4gICAgdmFyIGF1dGggPSAkZmlyZWJhc2VBdXRoKCk7XG5cbiAgICAkc2NvcGUubG9nSW5XaXRoR29vZ2xlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBhdXRoLiRzaWduSW5XaXRoUG9wdXAoXCJnb29nbGVcIikudGhlbihmdW5jdGlvbiAoYXV0aERhdGEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTG9nZ2VkIGluIGFzOlwiLCBhdXRoRGF0YSk7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLmN1cnJlbnRVc2VyID0gYXV0aERhdGE7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ3BpY2tHYW1lJyk7XG4gICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkF1dGhlbnRpY2F0aW9uIGZhaWxlZDpcIiwgZXJyb3IpO1xuICAgICAgICB9KTtcblxuICAgIH07XG5cbn0pO1xuIiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdwaWNrR2FtZScsIHtcbiAgICAgICAgdXJsOiAnL3BpY2tnYW1lJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvYnJvd3Nlci9qcy9waWNrR2FtZS9waWNrR2FtZS5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ3BpY2tHYW1lQ3RybCdcbiAgICB9KTtcbn0pO1xuXG50c3Vyby5jb250cm9sbGVyKCdwaWNrR2FtZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QpIHtcbiAgICB2YXIgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbiAgICB2YXIgb2JqID0gJGZpcmViYXNlT2JqZWN0KHJlZik7XG5cblxuICAgICRzY29wZS5jcmVhdGVHYW1lID0gZnVuY3Rpb24gKGdhbWVOYW1lKSB7XG4gICAgICAgIHZhciBnYW1lTmFtZVJlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZChnYW1lTmFtZSk7XG4gICAgICAgIHZhciBwbGF5ZXJzUmVmID0gZ2FtZU5hbWVSZWYuY2hpbGQoJ3BsYXllcnMnKTtcblxuICAgICAgICAkZmlyZWJhc2VBcnJheShnYW1lTmFtZVJlZikuJGFkZCh7XG4gICAgICAgICAgICBcImdhbWVOYW1lXCI6IGdhbWVOYW1lXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZpcmViYXNlLmF1dGgoKS5vbkF1dGhTdGF0ZUNoYW5nZWQoZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5ld1BsYXllciA9IG5ldyBQbGF5ZXIodXNlci51aWQpXG4gICAgICAgICAgICAgICAgJGZpcmViYXNlQXJyYXkocGxheWVyc1JlZikuJGFkZChuZXdQbGF5ZXIpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibm8gb25lIGxvZ2dlZCBpblwiKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIG9iai4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgdmFyIHRpbGVzID0gZGF0YS50aWxlc1xuICAgICAgICAgICAgdmFyIGRlY2sgPSBuZXcgRGVjayh0aWxlcykuc2h1ZmZsZSgpLnRpbGVzO1xuICAgICAgICAgICAgdmFyIGRlY2tSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoZ2FtZU5hbWUpLmNoaWxkKCdkZWNrJyk7XG4gICAgICAgICAgICAkZmlyZWJhc2VBcnJheShkZWNrUmVmKS4kYWRkKGRlY2spO1xuICAgICAgICB9KVxuXG5cbiAgICAgICAgdmFyIGluaXRpYWxNYXJrZXJzUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKGdhbWVOYW1lKS5jaGlsZCgnYXZhaWxhYmxlTWFya2VycycpO1xuICAgICAgICAkZmlyZWJhc2VBcnJheShpbml0aWFsTWFya2Vyc1JlZikuJGFkZChbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJ5ZWxsb3dcIiwgXCJncmVlblwiLCBcImFxdWFcIiwgXCJibHVlXCIsIFwibmF2eVwiLCBcInB1cnBsZVwiXSk7XG5cblxuICAgICAgICAkc3RhdGUuZ28oJ2dhbWUnLCB7XG4gICAgICAgICAgICBcImdhbWVOYW1lXCI6IGdhbWVOYW1lXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAkc2NvcGUuZ29Ub0dhbWVMaXN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAkc3RhdGUuZ28oJ2dhbWVsaXN0Jyk7XG4gICAgfTtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmZ1bmN0aW9uIFBsYXllcih1aWQpIHtcbiAgICAvLyBUT0RPOiBnZXQgdWlkIGZyb20gZmlyZWJhc2UgYXV0aFxuICAgIHRoaXMudWlkID0gdWlkO1xuXG4gICAgdGhpcy5tYXJrZXIgPSBcIm5cIjtcblxuICAgIC8vIHNob3VsZCBiZSBhIFBvaW50IG9iamVjdFxuICAgIHRoaXMucG9pbnQgPSBcIm5cIjtcblxuICAgIC8vIFt4LCB5XVxuICAgIC8vIGRlcGVuZHMgb24gdGhlIGFuZ3VsYXIgU3BhY2UueCwgU3BhY2UueVxuICAgIHRoaXMubmV4dFNwYWNlID0gXCJuXCI7XG5cbiAgICAvLyBpbiBlYWNoIFNwYWNlLnBvaW50cyBhcnJheSwgZmluZCB0aGlzIHNwZWNpZmljIHBvaW50IGFuZCBnZXQgdGhlIHBvc2l0aW9uIChpbnRlZ2VyKSBpbnNpZGUgdGhpcyBzcGFjZS5cbiAgICB0aGlzLm5leHRTcGFjZVBvaW50c0luZGV4ID0gXCJuXCI7XG5cbiAgICAvLyBtYXhpbXVuIDMgdGlsZXNcbiAgICB0aGlzLnRpbGVzID0gJ24nO1xuXG4gICAgLy8gaWYgYSBwbGF5ZXIgZGllcywgaXQgd2lsbCBiZSBjaGFuZ2VkIHRvIGZhbHNlXG4gICAgdGhpcy5jYW5QbGF5ID0gdHJ1ZTtcbn1cblBsYXllci5wcm90b3R5cGUuaGkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiSElcIilcbiAgICB9XG4gICAgLy8gbmVlZCB0byB1c2Ugc2VsZiBiZWN1c2Ugd2UgbmVlZCB0byBjaGFuZ2UgJHNjb3BlLm1lIG9uIGdhbWVDdHJsIGFuZCBzZW5kIHRvIGZpcmViYXNlXG5QbGF5ZXIucHJvdG90eXBlLnBsYWNlTWFya2VyID0gZnVuY3Rpb24gKGJvYXJkLCBwb2ludCwgc2VsZikge1xuICAgIC8vIHBvaW50IGxvb2tzIGxpa2UgW3gsIHksIHBvaW50c0luZGV4XSBpbiB0aGUgc3BhY2VcbiAgICB2YXIgeCA9IHBvaW50WzBdO1xuICAgIHZhciB5ID0gcG9pbnRbMV07XG4gICAgdmFyIHBvaW50c0luZGV4ID0gcG9pbnRbMl07XG5cbiAgICBzZWxmLnBvaW50ID0gYm9hcmRbeV1beF0ucG9pbnRzW3BvaW50c0luZGV4XTtcbiAgICBzZWxmLnBvaW50LnRyYXZlbGxlZCA9IHRydWU7XG5cbiAgICAvL1t4LCB5XSBmcm9tIHRoZSBwb2ludFxuICAgIHNlbGYubmV4dFNwYWNlID0gYm9hcmRbeV1beF07XG5cbiAgICAvLyBpbiBlYWNoIFNwYWNlLnBvaW50cyBhcnJheSwgZmluZCB0aGlzIHNwZWNpZmljIHBvaW50IGFuZCBnZXQgdGhlIHBvc2l0aW9uIChpbnRlZ2VyKSBpbnNpZGUgdGhpcyBzcGFjZS5cbiAgICBzZWxmLm5leHRTcGFjZVBvaW50c0luZGV4ID0gc2VsZi5uZXh0U3BhY2UucG9pbnRzLmluZGV4T2Yoc2VsZi5wb2ludCk7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLm5ld1NwYWNlID0gZnVuY3Rpb24gKGJvYXJkLCBvbGRTcGFjZSwgc2VsZikge1xuICAgIGlmIChzZWxmLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSAwIHx8IHNlbGYubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIGJvYXJkW29sZFNwYWNlLnkgLSAxXVtvbGRTcGFjZS54XTtcbiAgICB9IGVsc2UgaWYgKHNlbGYubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDIgfHwgc2VsZi5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gMykge1xuICAgICAgICByZXR1cm4gYm9hcmRbb2xkU3BhY2UueV1bb2xkU3BhY2UueCArIDFdO1xuICAgIH0gZWxzZSBpZiAoc2VsZi5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gNCB8fCBzZWxmLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSA1KSB7XG4gICAgICAgIHJldHVybiBib2FyZFtvbGRTcGFjZS55ICsgMV1bb2xkU3BhY2UueF07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGJvYXJkW29sZFNwYWNlLnldW29sZFNwYWNlLnggLSAxXTtcbiAgICB9XG59O1xuXG4vLyBuZWVkIHRvIHVzZSBzZWxmIGJlY3VzZSB3ZSBuZWVkIHRvIGNoYW5nZSAkc2NvcGUubWUgb24gZ2FtZUN0cmwgYW5kIHNlbmQgdG8gZmlyZWJhc2VcblBsYXllci5wcm90b3R5cGUucGxhY2VUaWxlID0gZnVuY3Rpb24gKHRpbGUsIHNlbGYpIHtcbiAgICBzZWxmLnRpbGVzID0gc2VsZi50aWxlcy5maWx0ZXIoZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgcmV0dXJuIHQuaWQgIT09IHRpbGUuaWRcbiAgICB9KTtcblxuICAgIHNlbGYubmV4dFNwYWNlLnRpbGVVcmwgPSB0aWxlLmltYWdlVXJsO1xuXG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLm1vdmVUbyA9IGZ1bmN0aW9uIChwb2ludGVyKSB7XG4gICAgLy9hbHdheXMgYmUgcmV0dXJuaW5nIDAgb3IgMSBwb2ludCBpbiB0aGUgYXJyYXlcbiAgICBsZXQgbmV4dFBvaW50ID0gcG9pbnRlci5uZWlnaGJvcnMuZmlsdGVyKGZ1bmN0aW9uIChuZWlnaGJvcikge1xuICAgICAgICByZXR1cm4gIW5laWdoYm9yLnRyYXZlbGxlZCAmJiBuZWlnaGJvciAhPT0gXCJuXCI7XG4gICAgfSlbMF07XG4gICAgY29uc29sZS5sb2coXCJuZXh0UG9pbnRcIiwgbmV4dFBvaW50KVxuICAgIHJldHVybiBuZXh0UG9pbnQ7XG59O1xuXG4vLyBUT0RPOiBub3Qgc3VyZSBob3cgdG8gbWFrZSB0aGlzIGtlZXAgbW92aW5nIHdpdGggcGxheWVycyBpbnN0ZWFkIG9mIHNlbGZcbi8vIFBsYXllci5wcm90b3R5cGUua2VlcE1vdmluZyA9IGZ1bmN0aW9uIChzZWxmKSB7XG4vLyAgICAgbGV0IG1vdmFibGUgPSBzZWxmLm1vdmVUbyhzZWxmLnBvaW50KTtcbi8vICAgICB3aGlsZSAobW92YWJsZSkge1xuLy8gICAgICAgICBzZWxmLnBvaW50LnRyYXZlbGxlZCA9IHRydWU7XG4vLyAgICAgICAgIHNlbGYucG9pbnQgPSBzZWxmLm1vdmVUbyhzZWxmLnBvaW50KTtcbi8vICAgICAgICAgbGV0IG9sZFNwYWNlID0gc2VsZi5uZXh0U3BhY2U7XG4vLyAgICAgICAgIGxldCBuZXdTcGFjZSA9IG5ld1NwYWNlKG9sZFNwYWNlKTtcbi8vICAgICAgICAgc2VsZi5uZXh0U3BhY2UgPSBuZXdTcGFjZTtcbi8vICAgICAgICAgc2VsZi5uZXh0U3BhY2VQb2ludHNJbmRleCA9IHNlbGYubmV4dFNwYWNlLnBvaW50cy5pbmRleE9mKHNlbGYucG9pbnQpO1xuLy8gICAgICAgICBzZWxmLmNoZWNrRGVhdGgoKTtcbi8vICAgICAgICAgbW92YWJsZSA9IHNlbGYubW92ZVRvKHNlbGYucG9pbnQpO1xuLy8gICAgIH1cbi8vIH07XG5cblBsYXllci5wcm90b3R5cGUuY2hlY2tEZWF0aCA9IGZ1bmN0aW9uIChzZWxmKSB7XG4gICAgdmFyIGFsbFRyYXZlbGxlZCA9IHNlbGYucG9pbnQubmVpZ2hib3JzLmZpbHRlcihmdW5jdGlvbiAobmVpZ2hib3IpIHtcbiAgICAgICAgcmV0dXJuIG5laWdoYm9yLnRyYXZlbGxlZDtcbiAgICB9KTtcblxuICAgIGlmIChzZWxmLnBvaW50LmVkZ2UgfHwgYWxsVHJhdmVsbGVkLmxlbmd0aCA9PT0gMikgc2VsZi5kaWUoKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUuZGllID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY2FuUGxheSA9IGZhbHNlO1xuICAgIC8vIFRPRE86IG5lZWQgdG8gc2VuZCBhbiBhbGVydCBvciBtZXNzYWdlIHRvIHRoZSBwbGF5ZXIgd2hvIGp1c3QgZGllZC5cbn07XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
