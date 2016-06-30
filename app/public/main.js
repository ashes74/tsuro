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

				var ref = firebase.database().ref();
				var obj = $firebaseObject(ref);
				var gameRef = ref.child('games').child($stateParams.gameName);

				var deckRef = gameRef.child('initialDeck');
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
								// $scope.game.deck = data[0]; //add the deck to the local game ? Try this as firebase DeckArr????
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
																}
																if ($scope.me.marker === "n") $scope.me.marker = null;
												} else {
																// No user is signed in.
																console.log("no one is logged in");
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
								firebasePlayersArr.$loaded().then(function (players) {
												var meIdx;

												players.find(function (e, i) {
																if (e.$id === $scope.me.$id) meIdx = i;
												});

												firebasePlayersArr[meIdx].tiles = [{
																id: 1,
																imageUrl: "",
																paths: [3, 4, 6, 0, 1, 7, 2, 5],
																rotation: 0
												}, {
																id: 2,
																imageUrl: "",
																paths: [1, 0, 4, 7, 2, 6, 5, 3],
																rotation: 0
												}, {
																id: 3,
																imageUrl: "",
																paths: [1, 0, 4, 6, 2, 7, 3, 5],
																rotation: 0
												}];

												player.placeMarker(board, point, firebasePlayersArr[meIdx]);
												$scope.game.players.push(firebasePlayersArr[meIdx]);
												firebasePlayersArr.$save(meIdx);
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
												$state.go('pickGame');
								}).catch(function (error) {
												console.error("Authentication failed:", error);
								});
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImdhbWUvYm9hcmQuanMiLCJnYW1lL2RlY2suanMiLCJnYW1lL2dhbWUuY29udHJ1Y3Rvci5qcyIsImdhbWUvZ2FtZS5qcyIsImdhbWVsaXN0L2dhbWVsaXN0LmpzIiwicGlja0dhbWUvcGlja0dhbWUuanMiLCJsb2dpbi9sb2dpbi5qcyIsInBsYXllci9wbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBQSxRQUFBLFFBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTs7QUFFQSxNQUFBLE1BQUEsQ0FBQSxZQUFBO0FBQ0EsUUFBQSxTQUFBO0FBQ0EsZ0JBQUEseUNBREE7QUFFQSxvQkFBQSxzQ0FGQTtBQUdBLHFCQUFBLDZDQUhBO0FBSUEsdUJBQUE7QUFKQSxLQUFBO0FBTUEsYUFBQSxhQUFBLENBQUEsTUFBQTtBQUNBLENBUkE7O0FBVUEsTUFBQSxRQUFBLENBQUEsYUFBQSxFQUFBLDRDQUFBOztBQUVBLE1BQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQTtBQUNBLHVCQUFBLFNBQUEsQ0FBQSxHQUFBO0FBQ0EsQ0FGQTs7QUNkQSxTQUFBLEtBQUEsR0FBQTtBQUNBLFNBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQTs7QUFFQSxNQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBO0FBQ0E7QUFDQSxXQUFBLEtBQUEsS0FBQTtBQUNBLENBUkE7O0FBVUEsU0FBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEVBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLFNBQUEsS0FBQSxHQUFBLEdBQUE7QUFDQSxTQUFBLE1BQUEsR0FBQSxDQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBQUE7QUFDQSxTQUFBLE9BQUEsR0FBQSxHQUFBO0FBQ0EsU0FBQSxNQUFBLEdBQUEsR0FBQTs7QUFFQSxTQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxzQkFBQTs7QUFFQSxZQUFBLElBQUEsQ0FBQSxFQUFBOztBQUNBLDRCQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLEM7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FDQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsTUFBQSxJQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLFNBSkEsTUFJQSxJQUFBLElBQUEsQ0FBQSxFQUFBOztBQUNBLGdCQUFBLE1BQUEsQ0FBQSxFQUFBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxLQUNBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxTQUhBLE1BR0EsSUFBQSxJQUFBLENBQUEsRUFBQTs7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FDQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsU0FIQSxNQUdBOztBQUNBLDRCQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLEM7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FDQTtBQUNBLHFCQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsTUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFJQSxTQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxTQUFBLElBQUEsR0FBQSxJQUFBO0FBQ0EsU0FBQSxTQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUE7QUFDQSxTQUFBLFNBQUEsR0FBQSxLQUFBO0FBQ0E7O0FDbkRBOztJQUVBLEk7QUFDQSxrQkFBQSxLQUFBLEVBQUE7QUFBQTs7QUFDQSxhQUFBLEtBQUEsR0FBQSxLQUFBO0FBQ0E7Ozs7a0NBRUE7QUFDQSxpQkFBQSxLQUFBLEdBQUEsRUFBQSxPQUFBLENBQUEsS0FBQSxLQUFBLENBQUE7QUFDQSxtQkFBQSxJQUFBO0FBQ0E7OztvQ0FFQTtBQUNBLG1CQUFBLEtBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0E7Ozs2QkFFQSxHLEVBQUE7QUFDQSxtQkFBQSxLQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLEdBQUEsQ0FBQTtBQUNBOzs7K0JBRUEsSyxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBO0FBQ0EsbUJBQUEsSUFBQTtBQUNBOzs7Ozs7QUN2QkE7Ozs7SUFJQSxJO0FBQ0Esa0JBQUEsSUFBQSxFQUFBO0FBQUE7O0FBQ0EsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQUNBLGFBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLEtBQUEsR0FBQSxJQUFBLEtBQUEsR0FBQSxTQUFBLEVBQUE7QUFDQSxhQUFBLE9BQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxnQkFBQSxHQUFBLENBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxRQUFBLEVBQUEsT0FBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLFFBQUEsQ0FBQTs7QUFFQSxhQUFBLFVBQUEsQztBQUNBLGFBQUEsY0FBQSxHQUFBLEVBQUEsQztBQUNBLGFBQUEsTUFBQSxHQUFBLEVBQUEsQztBQUNBLGFBQUEsS0FBQTtBQUNBOzs7OzJDQUVBO0FBQ0EsZ0JBQUEsS0FBQSxVQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLGNBQUEsQ0FBQSxLQUFBLFVBQUEsQ0FBQTtBQUNBOzs7eUNBRUE7QUFDQSxpQkFBQSxPQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsTUFBQTtBQUFBLHVCQUFBLE9BQUEsVUFBQSxDQUFBLE1BQUEsQ0FBQTtBQUFBLGFBQUE7QUFDQTs7O3NDQUVBO0FBQ0EsZ0JBQUEsbUJBQUEsRUFBQTtBQUNBLGlCQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxvQkFBQSxDQUFBLE9BQUEsT0FBQSxJQUFBLE9BQUEsS0FBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLEVBQUE7QUFDQSxxQ0FBQSxJQUFBLENBQUEsT0FBQSxLQUFBO0FBQ0EsbUNBQUEsSUFBQTtBQUNBO0FBQ0EsYUFMQTtBQU1BLG1CQUFBLGdCQUFBO0FBQ0E7OztvQ0FFQTtBQUNBLG1CQUFBLGFBQUEsTUFBQSxJQUFBLENBQUE7QUFDQTs7Ozs7O3lDQUdBO0FBQ0EsZ0JBQUEsV0FBQSxLQUFBLGNBQUEsRUFBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0Esb0JBQUEsU0FBQSxLQUFBLFVBQUEsR0FBQSxDQUFBO0FBQ0EsdUJBQUEsQ0FBQSxLQUFBLGNBQUEsQ0FBQSxTQUFBLENBQUEsRUFBQSxPQUFBLEVBQUE7QUFDQTtBQUNBO0FBQ0EscUJBQUEsVUFBQSxHQUFBLE1BQUE7QUFDQSxhQU5BLE1BTUE7QUFDQSxxQkFBQSxVQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQSxtQkFBQSxLQUFBLGdCQUFBLEVBQUE7QUFDQTs7OzZCQUVBLEcsRUFBQTtBQUNBLGdCQUFBLFFBQUEsRUFBQTtBQUNBLGlCQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EscUJBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsNEJBQUEsR0FBQSxDQUFBLElBQUE7QUFDQSwwQkFBQSxJQUFBLENBQUEsSUFBQTtBQUNBLGlCQUhBO0FBSUE7QUFDQSxtQkFBQSxLQUFBO0FBQ0E7Ozs7OztnQ0FHQTtBQUFBOztBQUNBLGlCQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsa0JBQUE7OztBQUdBLHNCQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxLQUFBLEVBQUEsT0FBQTtBQUNBLHVCQUFBLEtBQUEsR0FBQSxFQUFBOztBQUVBLHVCQUFBLE9BQUEsR0FBQSxJQUFBO0FBQ0EsYUFQQTtBQVFBOzs7Ozs7Ozs7OztBQU9BLElBQUEsYUFBQSxTQUFBLFVBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLFFBQUEsTUFBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0EsZUFBQSxPQUFBLE9BQUE7QUFDQSxLQUZBLENBQUE7QUFHQSxDQUpBOztBQ3BGQSxNQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxhQUFBLGlCQURBO0FBRUEscUJBQUEsNEJBRkE7QUFHQSxvQkFBQTtBQUhBLEtBQUE7QUFLQSxDQU5BOztBQVFBLE1BQUEsVUFBQSxDQUFBLFVBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxhQUFBLEVBQUEsV0FBQSxFQUFBLFlBQUEsRUFBQSxlQUFBLEVBQUEsY0FBQSxFQUFBO0FBQ0EsV0FBQSxJQUFBLEdBQUE7QUFDQSxrQkFBQSxFQURBO0FBRUEsZUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkE7QUFHQSxrQkFBQTtBQUhBLEtBQUE7O0FBT0EsUUFBQSxNQUFBLFNBQUEsUUFBQSxHQUFBLEdBQUEsRUFBQTtBQUNBLFFBQUEsTUFBQSxnQkFBQSxHQUFBLENBQUE7QUFDQSxRQUFBLFVBQUEsSUFBQSxLQUFBLENBQUEsT0FBQSxFQUFBLEtBQUEsQ0FBQSxhQUFBLFFBQUEsQ0FBQTs7QUFFQSxRQUFBLFVBQUEsUUFBQSxLQUFBLENBQUEsYUFBQSxDQUFBO0FBQ0EsUUFBQSxhQUFBLFFBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQTtBQUNBLFFBQUEsYUFBQSxRQUFBLEtBQUEsQ0FBQSxrQkFBQSxDQUFBO0FBQ0EsUUFBQSxVQUFBLGVBQUEsT0FBQSxDQUFBO0FBQ0EsUUFBQSxxQkFBQSxlQUFBLFVBQUEsQ0FBQTs7QUFFQSxRQUFBLFNBQUEsT0FBQSxNQUFBLENBQUEsT0FBQSxTQUFBLENBQUE7Ozs7Ozs7QUFPQSxXQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxhQUFBLFFBQUEsQ0FBQTs7O0FBR0EsWUFBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBOztBQUVBLGVBQUEsSUFBQSxDQUFBLElBQUEsR0FBQSxPQUFBLEM7OztBQUlBLG1CQUFBLEVBQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxnQkFBQSxjQUFBLEtBQUEsR0FBQSxFQUFBLEM7OztBQUdBLGlCQUFBLElBQUEsVUFBQSxJQUFBLFdBQUEsRUFBQTtBQUNBLG9CQUFBLG1CQUFBLEVBQUEsZ0JBQUE7OztBQUdBLG9CQUFBLGNBQUEsT0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQSxPQUFBLEVBQUE7QUFDQSwwQ0FBQSxP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QUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBLEVBSUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FKQSxFQUtBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQU5BLEVBT0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FQQSxFQVFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUkEsRUFTQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVRBLEVBVUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FWQSxFQVdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWEEsRUFZQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVpBLENBQUE7QUFjQSxXQUFBLFNBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBLEVBR0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQSxFQUlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSkEsRUFLQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUxBLEVBTUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FOQSxFQU9BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUEEsRUFRQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVJBLEVBU0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FUQSxFQVVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVkEsRUFXQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVhBLEVBWUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FaQSxDQUFBO0FBY0EsV0FBQSxXQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQURBLEVBRUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQSxFQUdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEEsRUFJQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUpBLEVBS0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FMQSxFQU1BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTkEsRUFPQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVBBLEVBUUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FSQSxFQVNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVEEsRUFVQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVZBLEVBV0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FYQSxFQVlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWkEsQ0FBQTtBQWNBLFdBQUEsVUFBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBLEVBSUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FKQSxFQUtBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQU5BLEVBT0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FQQSxFQVFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUkEsRUFTQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVRBLEVBVUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FWQSxFQVdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWEEsRUFZQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVpBLENBQUE7QUFjQSxDQS9jQTs7QUNSQSxNQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxhQUFBLFdBREE7QUFFQSxxQkFBQSxvQ0FGQTtBQUdBLG9CQUFBO0FBSEEsS0FBQTtBQUtBLENBTkE7O0FBUUEsTUFBQSxVQUFBLENBQUEsVUFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQSxlQUFBLEVBQUEsTUFBQSxFQUFBLGFBQUEsRUFBQSxjQUFBLEVBQUE7O0FBRUEsUUFBQSxNQUFBLFNBQUEsUUFBQSxHQUFBLEdBQUEsRUFBQTtBQUNBLFFBQUEsTUFBQSxnQkFBQSxHQUFBLENBQUE7O0FBRUEsUUFBQSxPQUFBLGVBQUE7QUFDQSxRQUFBLGVBQUEsS0FBQSxRQUFBLEVBQUE7O0FBRUEsUUFBQSxXQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQTtBQUNBLFFBQUEsa0JBQUEsZ0JBQUEsUUFBQSxDQUFBOzs7O0FBSUEsb0JBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxVQUFBLEVBQ0EsSUFEQSxDQUNBLFlBQUE7QUFDQSxZQUFBLFdBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLElBQUEsT0FBQSxRQUFBLEVBQUE7QUFDQSxxQkFBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLGVBQUEsU0FBQSxHQUFBLFNBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLEtBUEE7O0FBWUEsV0FBQSxJQUFBLEdBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxZQUFBLGNBQUEsSUFBQSxLQUFBLENB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QSxDQUFBLFdBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBOztBQUVBLFFBQUEsSUFBQSxNQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsSUFBQSxNQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsY0FBQSxNQUFBLENBQUEsQ0FBQTs7QUFFQSxTQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLFNBQUEsS0FBQSxDQUFBLFNBQUEsR0FBQSxJQUFBOzs7QUFHQSxTQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7OztBQUdBLFNBQUEsb0JBQUEsR0FBQSxLQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsS0FBQSxDQUFBO0FBQ0EsQ0FkQTs7QUFnQkEsT0FBQSxTQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxJQUFBLEVBQUE7QUFDQSxRQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsRUFBQTtBQUNBLGVBQUEsTUFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLENBQUE7QUFDQSxLQUZBLE1BRUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLEVBQUE7QUFDQSxlQUFBLE1BQUEsU0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsS0FGQSxNQUVBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxFQUFBO0FBQ0EsZUFBQSxNQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTtBQUNBLEtBRkEsTUFFQTtBQUNBLGVBQUEsTUFBQSxTQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQTtBQUNBLENBVkE7OztBQWFBLE9BQUEsU0FBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLElBQUEsRUFBQSxJQUFBLEVBQUE7QUFDQSxTQUFBLEtBQUEsR0FBQSxLQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsRUFBQSxLQUFBLEtBQUEsRUFBQTtBQUNBLEtBRkEsQ0FBQTs7QUFJQSxTQUFBLFNBQUEsQ0FBQSxPQUFBLEdBQUEsS0FBQSxRQUFBO0FBRUEsQ0FQQTs7QUFTQSxPQUFBLFNBQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUE7O0FBRUEsUUFBQSxZQUFBLFFBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGVBQUEsQ0FBQSxTQUFBLFNBQUEsSUFBQSxhQUFBLEdBQUE7QUFDQSxLQUZBLEVBRUEsQ0FGQSxDQUFBO0FBR0EsWUFBQSxHQUFBLENBQUEsV0FBQSxFQUFBLFNBQUE7QUFDQSxXQUFBLFNBQUE7QUFDQSxDQVBBOzs7Ozs7Ozs7Ozs7Ozs7OztBQXdCQSxPQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxRQUFBLGVBQUEsS0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGVBQUEsU0FBQSxTQUFBO0FBQ0EsS0FGQSxDQUFBOztBQUlBLFFBQUEsS0FBQSxLQUFBLENBQUEsSUFBQSxJQUFBLGFBQUEsTUFBQSxLQUFBLENBQUEsRUFBQSxLQUFBLEdBQUE7QUFDQSxDQU5BOztBQVFBLE9BQUEsU0FBQSxDQUFBLEdBQUEsR0FBQSxZQUFBO0FBQ0EsU0FBQSxPQUFBLEdBQUEsS0FBQTs7QUFFQSxDQUhBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgdHN1cm8gPSBhbmd1bGFyLm1vZHVsZSgnVHN1cm8nLCBbJ3VpLnJvdXRlcicsICdmaXJlYmFzZSddKTtcblxudHN1cm8uY29uZmlnKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29uZmlnID0ge1xuICAgICAgICBhcGlLZXk6IFwiQUl6YVN5Q0xtM2prazVwcE1xZVF4S29ILWRaOUNkWU1hREdXV3FVXCIsXG4gICAgICAgIGF1dGhEb21haW46IFwidGhlLXBhdGhzLW9mLWRyYWdvbnMuZmlyZWJhc2VhcHAuY29tXCIsXG4gICAgICAgIGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vdGhlLXBhdGhzLW9mLWRyYWdvbnMuZmlyZWJhc2Vpby5jb21cIixcbiAgICAgICAgc3RvcmFnZUJ1Y2tldDogXCJ0aGUtcGF0aHMtb2YtZHJhZ29ucy5hcHBzcG90LmNvbVwiLFxuICAgIH07XG4gICAgZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChjb25maWcpO1xufSk7XG5cbnRzdXJvLmNvbnN0YW50KCdmaXJlYmFzZVVybCcsICdodHRwczovL3BhdGgtb2YtdGhlLWRyYWdvbi5maXJlYmFzZWlvLmNvbS8nKTtcblxudHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG59KTtcbiIsImZ1bmN0aW9uIEJvYXJkKCkge1xuICAgIHRoaXMuYm9hcmQgPSBbXTtcbn1cblxuQm9hcmQucHJvdG90eXBlLmRyYXdCb2FyZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IDY7IHkrKykge1xuICAgICAgICBpZiAoIXRoaXMuYm9hcmRbeV0pIHRoaXMuYm9hcmRbeV0gPSBbXTtcbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCA2OyB4KyspIHtcbiAgICAgICAgICAgIHRoaXMuYm9hcmRbeV0ucHVzaChuZXcgU3BhY2UoeCwgeSwgdGhpcy5ib2FyZCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmJvYXJkO1xufVxuXG5mdW5jdGlvbiBTcGFjZSh4LCB5LCBib2FyZCkge1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbiAgICB0aGlzLmltYWdlID0gXCJuXCI7XG4gICAgdGhpcy5wb2ludHMgPSBbbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbF07XG4gICAgdGhpcy50aWxlVXJsID0gXCJuXCI7XG4gICAgdGhpcy50aWxlSWQgPSBcIm5cIjtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgIGxldCBjb3JyZXNwb25kaW5nO1xuXG4gICAgICAgIGlmIChpIDwgMikgeyAvL3RvcFxuICAgICAgICAgICAgY29ycmVzcG9uZGluZyA9IGkgPT09IDAgPyA1IDogNDsgLy8gMCAtPiA1ICYgMSAtPiA0XG4gICAgICAgICAgICBpZiAoeSA9PT0gMCkgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQodHJ1ZSk7XG4gICAgICAgICAgICBlbHNlIHRoaXMucG9pbnRzW2ldID0gYm9hcmRbeSAtIDFdW3hdLnBvaW50c1tjb3JyZXNwb25kaW5nXTtcbiAgICAgICAgfSBlbHNlIGlmIChpIDwgNCkgeyAvL3JpZ2h0XG4gICAgICAgICAgICBpZiAoeCA9PT0gNSkgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQodHJ1ZSk7XG4gICAgICAgICAgICBlbHNlIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIGlmIChpIDwgNikgeyAvL2JvdHRvbVxuICAgICAgICAgICAgaWYgKHkgPT09IDUpIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KHRydWUpO1xuICAgICAgICAgICAgZWxzZSB0aGlzLnBvaW50c1tpXSA9IG5ldyBQb2ludChmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7IC8vbGVmdFxuICAgICAgICAgICAgY29ycmVzcG9uZGluZyA9IGkgPT09IDYgPyAzIDogMjsgLy8gNiAtPiAzICYgNyAtPiAyXG4gICAgICAgICAgICBpZiAoeCA9PT0gMCkgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQodHJ1ZSk7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBvaW50c1tpXSA9IGJvYXJkW3ldW3ggLSAxXS5wb2ludHNbY29ycmVzcG9uZGluZ107XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxuLy8gZWRnZSA9IGJvb2xlYW5cbmZ1bmN0aW9uIFBvaW50KGVkZ2UpIHtcbiAgICB0aGlzLmVkZ2UgPSBlZGdlO1xuICAgIHRoaXMubmVpZ2hib3JzID0gW1wiblwiXTtcbiAgICB0aGlzLnRyYXZlbGxlZCA9IGZhbHNlO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jbGFzcyBEZWNrIHtcbiAgICBjb25zdHJ1Y3Rvcih0aWxlcykge1xuICAgICAgICB0aGlzLnRpbGVzID0gdGlsZXNcbiAgICB9XG5cbiAgICBzaHVmZmxlKCkge1xuICAgICAgICB0aGlzLnRpbGVzID0gXy5zaHVmZmxlKHRoaXMudGlsZXMpXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGRlYWxUaHJlZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZXMuc3BsaWNlKDAsIDMpO1xuICAgIH1cblxuICAgIGRlYWwobnVtKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGVzLnNwbGljZSgwLCBudW0pO1xuICAgIH1cblxuICAgIHJlbG9hZCh0aWxlcykge1xuICAgICAgICB0aGlzLnRpbGVzLnB1c2godGlsZXMpXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLy9HQU1FLy8vXG5cbmNsYXNzIEdhbWUge1xuICAgIGNvbnN0cnVjdG9yKG5hbWUpIHtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5jb3VudCA9IDM1O1xuICAgICAgICB0aGlzLmJvYXJkID0gbmV3IEJvYXJkKCkuZHJhd0JvYXJkKCk7XG4gICAgICAgIHRoaXMucGxheWVycyA9IFtdO1xuICAgICAgICB0aGlzLmF2YWlsYWJsZU1hcmtlcnMgPSBbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJ5ZWxsb3dcIiwgXCJncmVlblwiLCBcImFxdWFcIiwgXCJibHVlXCIsIFwibmF2eVwiLCBcInB1cnBsZVwiXVxuXG4gICAgICAgIHRoaXMuY3VyclBsYXllcjsgLy9pbmRleCBvZiB0aGUgY3VycmVudFBsYXllciBpbiB0aGUgdHVybk9yZGVyQXJyYXlcbiAgICAgICAgdGhpcy50dXJuT3JkZXJBcnJheSA9IFtdIC8vaG9sZHMgYWxsIHRoZSBwbGF5ZXJzIHN0aWxsIG9uIHRoZSBib2FyZC5cbiAgICAgICAgdGhpcy5kcmFnb24gPSBcIlwiOyAvLyBQbGF5ZXIuTWFya2VyXG4gICAgICAgIHRoaXMubW92ZXM7XG4gICAgfVxuXG4gICAgZ2V0Q3VycmVudFBsYXllcigpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VyclBsYXllciA9PT0gLTEpIHJldHVybjtcbiAgICAgICAgcmV0dXJuIHRoaXMudHVybk9yZGVyQXJyYXlbdGhpcy5jdXJyUGxheWVyXTtcbiAgICB9XG5cbiAgICBtb3ZlQWxsUGxheWVycygpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLmZvckVhY2goKHBsYXllcikgPT4gcGxheWVyLmtlZXBNb3ZpbmcocGxheWVyKSlcbiAgICB9XG5cbiAgICBkZWFkUGxheWVycygpIHtcbiAgICAgICAgdmFyIGRlYWRQbGF5ZXJzVGlsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLmZvckVhY2goZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICAgICAgaWYgKCFwbGF5ZXIuY2FuUGxheSAmJiBwbGF5ZXIudGlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGRlYWRQbGF5ZXJzVGlsZXMucHVzaChwbGF5ZXIudGlsZXMpO1xuICAgICAgICAgICAgICAgIGlzRGVhZFBsYXllciA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZGVhZFBsYXllcnNUaWxlcztcbiAgICB9XG5cbiAgICBjaGVja092ZXIoKSB7XG4gICAgICAgIHJldHVybiBnZXRDYW5QbGF5KCkubGVuZ3RoIDw9IDE7XG4gICAgfVxuXG4gICAgLy90byBiZSBjYWxsZWQgYXQgdGhlIGVuZCBvZiBhIHR1cm4gdG8gc2V0IHRoZSBjdXJyUGxheWVyIHRvIHRoZSBuZXh0IGVsaWdpYmxlIHBsYXllciBpbiB0aGUgdHVybk9yZGVyQXJyYXlcbiAgICBnb1RvTmV4dFBsYXllcigpIHtcbiAgICAgICAgaWYgKGdldENhblBsYXkodGhpcy50dXJuT3JkZXJBcnJheSkubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgbGV0IG5ld0lkeCA9IHRoaXMuY3VyclBsYXllciArIDE7XG4gICAgICAgICAgICB3aGlsZSAoIXRoaXMudHVybk9yZGVyQXJyYXlbbmV3SWR4ICUgOF0uY2FuUGxheSkge1xuICAgICAgICAgICAgICAgIG5ld0lkeCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdXJyUGxheWVyID0gbmV3SWR4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jdXJyUGxheWVyID0gLTE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q3VycmVudFBsYXllcigpO1xuICAgIH1cblxuICAgIGRlYWwobnVtKXtcbiAgICAgICAgdmFyIHRpbGVzID0gW11cbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IG51bTsgaSsrKXtcbiAgICAgICAgICAgIHRoaXMuZGVjay4kcmVtb3ZlKDApLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgICAgICAgICAgICAgdGlsZXMucHVzaChkYXRhKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aWxlcztcbiAgICB9XG5cbiAgICAvL3Jlc3RhcnQgdGhlIGdhbWVcbiAgICByZXNldCgpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgICAgIC8vcmV0cmlldmUgYWxsIHRpbGVzXG4gICAgICAgICAgICAvL3JldHVybiBwbGF5ZXIncyB0aWxlcyB0byB0aGUgZGVjayBhbmQgc2h1ZmZsZVxuICAgICAgICAgICAgdGhpcy5kZWNrLnJlbG9hZChwbGF5ZXIudGlsZXMpLnNodWZmbGUoKTtcbiAgICAgICAgICAgIHBsYXllci50aWxlcyA9IFtdO1xuICAgICAgICAgICAgLy9yZXNldCBhbGwgcGxheWVycyBwbGF5YWJpbGl0eVxuICAgICAgICAgICAgcGxheWVyLmNhblBsYXkgPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbn1cblxuLy8vLy9FTkQgT0YgR0FNRSBDTEFTUy8vLy8vXG5cbi8vZ2V0IEVsaWdpYmxlIHBsYXllcnNcbmxldCBnZXRDYW5QbGF5ID0gZnVuY3Rpb24gKHBsYXllcnMpIHtcbiAgICByZXR1cm4gcGxheWVycy5maWx0ZXIoKHBsYXllcikgPT4ge1xuICAgICAgICByZXR1cm4gcGxheWVyLmNhblBsYXlcbiAgICB9KVxufVxuIiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnZ2FtZScsIHtcblx0XHR1cmw6ICcvZ2FtZS86Z2FtZU5hbWUnLFxuXHRcdHRlbXBsYXRlVXJsOiAnL2Jyb3dzZXIvanMvZ2FtZS9nYW1lLmh0bWwnLFxuXHRcdGNvbnRyb2xsZXI6ICdnYW1lQ3RybCdcblx0fSk7XG59KTtcblxudHN1cm8uY29udHJvbGxlcignZ2FtZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkZmlyZWJhc2VBdXRoLCBmaXJlYmFzZVVybCwgJHN0YXRlUGFyYW1zLCAkZmlyZWJhc2VPYmplY3QsICRmaXJlYmFzZUFycmF5KSB7IFxuXHQkc2NvcGUudGlsZSA9IHtcblx0XHRpbWFnZVVybDogXCJcIixcblx0XHRwYXRoczogWzMsIDQsIDYsIDAsIDEsIDcsIDIsIDVdLFxuXHRcdHJvdGF0aW9uOiAwXG5cdH07XG5cblxuXHR2YXIgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcblx0dmFyIG9iaiA9ICRmaXJlYmFzZU9iamVjdChyZWYpO1xuXHR2YXIgZ2FtZVJlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZCgkc3RhdGVQYXJhbXMuZ2FtZU5hbWUpO1xuXG5cdHZhciBkZWNrUmVmID0gZ2FtZVJlZi5jaGlsZCgnaW5pdGlhbERlY2snKTtcblx0dmFyIHBsYXllcnNSZWYgPSBnYW1lUmVmLmNoaWxkKCdwbGF5ZXJzJyk7XG5cdHZhciBtYXJrZXJzUmVmID0gZ2FtZVJlZi5jaGlsZCgnYXZhaWxhYmxlTWFya2VycycpO1xuXHR2YXIgZGVja0FyciA9ICRmaXJlYmFzZUFycmF5KGRlY2tSZWYpO1xuXHR2YXIgZmlyZWJhc2VQbGF5ZXJzQXJyID0gJGZpcmViYXNlQXJyYXkocGxheWVyc1JlZik7XG5cblx0dmFyIHBsYXllciA9IE9iamVjdC5jcmVhdGUoUGxheWVyLnByb3RvdHlwZSk7XG5cblx0LyoqKioqKioqKioqKioqKipcblx0SU5JVElBTElaSU5HIEdBTUVcblx0KioqKioqKioqKioqKioqKi9cblxuXHQvL25ldyBsb2NhbCBnYW1lIHdpdGggZ2FtZSBuYW1lIGRlZmluZWQgYnkgdXJsXG5cdCRzY29wZS5nYW1lID0gbmV3IEdhbWUoJHN0YXRlUGFyYW1zLmdhbWVOYW1lKTtcblxuXHQvL3doZW4gdGhlIGRlY2sgaXMgbG9hZGVkLi4uXG5cdGRlY2tBcnIuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcblx0XHQvLyAkc2NvcGUuZ2FtZS5kZWNrID0gZGF0YVswXTsgLy9hZGQgdGhlIGRlY2sgdG8gdGhlIGxvY2FsIGdhbWUgPyBUcnkgdGhpcyBhcyBmaXJlYmFzZSBEZWNrQXJyPz8/P1xuXHRcdCRzY29wZS5nYW1lLmRlY2sgPSBkZWNrQXJyOyAvL2FkZCB0aGUgZGVjayB0byB0aGUgbG9jYWwgZ2FtZSA/IFRyeSB0aGlzIGFzIGZpcmViYXNlIERlY2tBcnI/Pz8/XG5cblxuXHRcdC8vZG9uJ3Qgc3RhcnQgd2F0Y2hpbmcgcGxheWVycyB1bnRpbCB0aGVyZSBpcyBhIGRlY2sgaW4gdGhlIGdhbWVcblx0XHRwbGF5ZXJzUmVmLm9uKFwidmFsdWVcIiwgZnVuY3Rpb24gKHNuYXApIHtcblx0XHRcdHZhciBzbmFwUGxheWVycyA9IHNuYXAudmFsKCk7IC8vZ3JhYiB0aGUgdmFsdWUgb2YgdGhlIHNuYXBzaG90IChhbGwgcGxheWVycyBpbiBnYW1lIGluIEZpcmViYXNlKVxuXG5cdFx0XHQvL2ZvciBlYWNoIHBsYXllciBpbiB0aGlzIGNvbGxlY3Rpb24uLi5cblx0XHRcdGZvciAodmFyIHRoaXNQbGF5ZXIgaW4gc25hcFBsYXllcnMpIHtcblx0XHRcdFx0dmFyIGV4aXN0aW5nUGxheWVySW5kZXgsIHRoaXNJc0FOZXdQbGF5ZXI7XG5cblx0XHRcdFx0Ly9maW5kIHRoaXMgJ3NuYXAnIHBsYXllcidzIGluZGV4IGluIGxvY2FsIGdhbWUuIGZpbmQgcmV0dXJucyB0aGF0IHZhbHVlLiBcblx0XHRcdFx0dmFyIGxvY2FsUGxheWVyID0gJHNjb3BlLmdhbWUucGxheWVycy5maW5kKGZ1bmN0aW9uIChwbHlyLCBwbHlySWR4KSB7XG5cdFx0XHRcdFx0ZXhpc3RpbmdQbGF5ZXJJbmRleCA9IHBseXJJZHg7XG5cdFx0XHRcdFx0cmV0dXJuIHBseXIudWlkID09PSBzbmFwUGxheWVyc1t0aGlzUGxheWVyXS51aWQ7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vaWYgbm90IGZvdW5kLCBjcmVhdGUgbmV3IHBsYXllclxuXHRcdFx0XHRpZiAoIWxvY2FsUGxheWVyKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coJ2kgZGlkbnQgZmluZCBhIGxvY2FsIHBsYXllciEnKTtcblx0XHRcdFx0XHRsb2NhbFBsYXllciA9IG5ldyBQbGF5ZXIoc25hcFBsYXllcnNbdGhpc1BsYXllcl0udWlkKTtcblx0XHRcdFx0XHR0aGlzSXNBTmV3UGxheWVyID0gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vZm9yIGVhY2gga2V5IGluIHRoZSBzbmFwUGxheWVyJ3Mga2V5cywgYWRkIHRoYXQga2V5IGFuZCB2YWx1ZSB0byBsb2NhbCBwbGF5ZXJcblx0XHRcdFx0Zm9yICh2YXIgcGxheWVycHJvcGVydHkgaW4gc25hcFBsYXllcnNbdGhpc1BsYXllcl0pIHtcblx0XHRcdFx0XHRsb2NhbFBsYXllcltwbGF5ZXJwcm9wZXJ0eV0gPSBzbmFwUGxheWVyc1t0aGlzUGxheWVyXVtwbGF5ZXJwcm9wZXJ0eV07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsb2NhbFBsYXllci50aWxlcyA9ICRzY29wZS5nYW1lLmRlYWwoMyk7XG5cblx0XHRcdFx0Ly9wdXNoIGxvY2FsIHBsYXllciB0byBnYW1lLnBsYXllcnNcblx0XHRcdFx0aWYgKHRoaXNJc0FOZXdQbGF5ZXIpICRzY29wZS5nYW1lLnBsYXllcnMucHVzaChsb2NhbFBsYXllcik7XG5cdFx0XHRcdGVsc2UgJHNjb3BlLmdhbWUucGxheWVyc1tleGlzdGluZ1BsYXllckluZGV4XSA9IGxvY2FsUGxheWVyO1xuXHRcdFx0XHRjb25zb2xlLmxvZygkc2NvcGUuZ2FtZS5wbGF5ZXJzKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHR9KTtcblxuXHQvLyBjb25zb2xlLmxvZygnZGVjaz8nLCAkc2NvcGUuZ2FtZS5kZWNrKTtcblx0Ly8gbG9jYWxQbGF5ZXIudGlsZXMgPSAkc2NvcGUuZ2FtZS5kZWFsKDMpO1xuXG5cdHZhciBtYXJrZXJzQXJyID0gJGZpcmViYXNlQXJyYXkobWFya2Vyc1JlZik7IC8vc3RvcmUgbWFya2VycyBhcnJheVxuXG5cdC8vd2hlbiB0aGF0IG1hcmtlcnMgYXJyYXkgaXMgbG9hZGVkLCB1cGRhdGUgdGhlIGF2YWlsYWJsZSBtYXJrZXJzIGFycmF5IG9uIHNjb3BlXG5cdG1hcmtlcnNBcnIuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcblx0XHQkc2NvcGUuZ2FtZS5hdmFpbGFibGVNYXJrZXJzID0gZGF0YVswXTtcblx0fSk7XG5cblx0Ly9pZiBzb21lb25lIGVsc2UgcGlja3MgYSBtYXJrZXIsIHVwZGF0ZSB5b3VyIHZpZXdcblx0bWFya2Vyc1JlZi5vbignY2hpbGRfY2hhbmdlZCcsIGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0JHNjb3BlLmdhbWUuYXZhaWxhYmxlTWFya2VycyA9IGRhdGEudmFsKCk7XG5cdH0pO1xuXG5cdC8vb24gbG9naW4sIGZpbmQgbWUgaW4gdGhlIGZpcmViYXNlIHBsYXllcnMgYXJyYXlcblx0ZmlyZWJhc2UuYXV0aCgpLm9uQXV0aFN0YXRlQ2hhbmdlZChmdW5jdGlvbiAodXNlcikge1xuXHRcdHZhciBmaXJlYmFzZVBsYXllcnNBcnIgPSAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKTtcblxuXHRcdGZpcmViYXNlUGxheWVyc0Fyci4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuXHRcdFx0dmFyIEZCcGxheWVycyA9IGRhdGE7XG5cblx0XHRcdGlmICh1c2VyKSB7XG5cdFx0XHRcdHZhciB1c2VyQXV0aElkID0gdXNlci51aWQ7XG5cdFx0XHRcdHZhciBtZSA9IEZCcGxheWVycy5maWx0ZXIocGxheWVyID0+IHBsYXllci51aWQgPT09IHVzZXJBdXRoSWQpWzBdO1xuXHRcdFx0XHRpZiAobWUpIHtcblx0XHRcdFx0XHQkc2NvcGUubWUgPSBtZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoJHNjb3BlLm1lLm1hcmtlciA9PT0gXCJuXCIpICRzY29wZS5tZS5tYXJrZXIgPSBudWxsO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gTm8gdXNlciBpcyBzaWduZWQgaW4uXG5cdFx0XHRcdGNvbnNvbGUubG9nKFwibm8gb25lIGlzIGxvZ2dlZCBpblwiKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSk7XG5cblxuXHQvKioqKioqKioqKioqKioqKlxuXHRBVkFJTEFCTEUgUExBWUVSIEFDVElPTlMgQVQgR0FNRSBTVEFSVFxuXHQqKioqKioqKioqKioqKioqL1xuXG5cdCRzY29wZS5waWNrTWFya2VyID0gZnVuY3Rpb24gKGJvYXJkLCBtYXJrZXIpIHtcblx0XHQkc2NvcGUubWUubWFya2VyID0gbWFya2VyO1xuXG5cdFx0ZmlyZWJhc2VQbGF5ZXJzQXJyLiRsb2FkZWQoKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcblx0XHRcdFx0dmFyIG1lSWR4O1xuXHRcdFx0XHQvL2ZpbmQgbXkgaW5kZXggaW4gdGhlIHBsYXllcnMgYXJyYXlcblx0XHRcdFx0cGxheWVycy5maW5kKGZ1bmN0aW9uIChlLCBpKSB7XG5cdFx0XHRcdFx0aWYgKGUuJGlkID09PSAkc2NvcGUubWUuJGlkKSBtZUlkeCA9IGk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHQvL2dpdmUgbWUgYSBtYXJrZXIgYW5kIHNhdmUgbWUgaW4gZmlyZWJhc2Vcblx0XHRcdFx0ZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS5tYXJrZXIgPSBtYXJrZXI7XG5cdFx0XHRcdGZpcmViYXNlUGxheWVyc0Fyci4kc2F2ZShtZUlkeCk7XG5cdFx0XHR9KTtcblxuXHRcdHZhciBpZHggPSAkc2NvcGUuZ2FtZS5hdmFpbGFibGVNYXJrZXJzLmluZGV4T2YobWFya2VyKTtcblxuXHRcdG1hcmtlcnNBcnJbMF0uc3BsaWNlKGlkeCwgMSk7XG5cblx0XHRtYXJrZXJzQXJyLiRzYXZlKDApXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmVmKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwicmVtb3ZlZCB0aGUgcGlja2VkIG1hcmtlclwiKTtcblx0XHRcdFx0Y29uc29sZS5sb2cocmVmLmtleSk7XG5cdFx0XHR9KTtcblx0fTtcblxuXHQvL0hhdmUgcGxheWVyIHBpY2sgdGhlaXIgc3RhcnQgcG9pbnRcblx0JHNjb3BlLnBsYWNlTWFya2VyID0gZnVuY3Rpb24gKGJvYXJkLCBwb2ludCkge1xuXHRcdGZpcmViYXNlUGxheWVyc0Fyci4kbG9hZGVkKClcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG5cdFx0XHRcdHZhciBtZUlkeDtcblxuXHRcdFx0XHRwbGF5ZXJzLmZpbmQoZnVuY3Rpb24gKGUsIGkpIHtcblx0XHRcdFx0XHRpZiAoZS4kaWQgPT09ICRzY29wZS5tZS4kaWQpIG1lSWR4ID0gaTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0ZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS50aWxlcyA9IFt7XG5cdFx0XHRcdFx0aWQ6IDEsXG5cdFx0XHRcdFx0aW1hZ2VVcmw6IFwiXCIsXG5cdFx0XHRcdFx0cGF0aHM6IFszLCA0LCA2LCAwLCAxLCA3LCAyLCA1XSxcblx0XHRcdFx0XHRyb3RhdGlvbjogMFxuXHRcdFx0XHR9LCB7XG5cdFx0XHRcdFx0aWQ6IDIsXG5cdFx0XHRcdFx0aW1hZ2VVcmw6IFwiXCIsXG5cdFx0XHRcdFx0cGF0aHM6IFsxLCAwLCA0LCA3LCAyLCA2LCA1LCAzXSxcblx0XHRcdFx0XHRyb3RhdGlvbjogMFxuXHRcdFx0XHR9LCB7XG5cdFx0XHRcdFx0aWQ6IDMsXG5cdFx0XHRcdFx0aW1hZ2VVcmw6IFwiXCIsXG5cdFx0XHRcdFx0cGF0aHM6IFsxLCAwLCA0LCA2LCAyLCA3LCAzLCA1XSxcblx0XHRcdFx0XHRyb3RhdGlvbjogMFxuXHRcdFx0XHR9XTtcblxuXHRcdFx0XHRwbGF5ZXIucGxhY2VNYXJrZXIoYm9hcmQsIHBvaW50LCBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdKTtcblx0XHRcdFx0JHNjb3BlLmdhbWUucGxheWVycy5wdXNoKGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0pO1xuXHRcdFx0XHRmaXJlYmFzZVBsYXllcnNBcnIuJHNhdmUobWVJZHgpO1xuXHRcdFx0fSk7XG5cdH07XG5cblxuXG5cblxuXG5cblxuXHQvLyBUT0RPOiB3ZSBwcm9iYWJseSBuZWVkIHRoaXMgb24gZmlyZWJhc2Ugc28gb3RoZXIgcGVvcGxlIGNhbid0IHBpY2sgd2hhdCdzIGJlZW4gcGlja2VkXG5cblx0Ly9Gb3Igc3luY2hyb25pemluZ0dhbWUuLi5cblx0Ly8gdmFyIHN5bmNSZWYgPSBnYW1lUmVmLmNoaWxkKCdtb3ZlcycpO1xuXHQvLyBzeW5jUmVmLm9uKCdjaGlsZF9hZGRlZCcsIGZ1bmN0aW9uIChjaGlsZFNuYXBzaG90LCBwcmV2Q2hpbGRLZXkpIHtcblx0Ly8gXHQvL05FRUQgVE8gRE9VQkxFIENIRUNLISEgV2hhdCBkb2VzIGNoaWxkU25hcCByZXR1cm5zP1xuXHQvLyBcdGNvbnNvbGUubG9nKCdjaGlsZFNuYXBzaG90X1N5bmNHYW1lJywgY2hpbGRTbmFwc2hvdCk7XG5cdC8vIFx0Ly9kZXBlbmRpbmcgb24gd2hhdCBjaGlsZFNuYXBzaG90IGdpdmVzIG1lLi4uSSB0aGluayBpdCdzIG9uZSBjaGlsZCBwZXIgb24gY2FsbD8gSXQgZG9lc24ndCByZXR1cm4gYW4gYXJyYXkgb2YgY2hhbmdlcy4uLkkgYmVsaWV2ZSFcblx0Ly8gXHRpZiAoY2hpbGRTbmFwc2hvdC50eXBlID09PSAndXBkYXRlRGVjaycpIHtcblx0Ly8gXHRcdCRzY29wZS5nYW1lLmRlY2sgPSBjaGlsZFNuYXBzaG90LnVwZGF0ZURlY2s7XG5cdC8vIFx0fSBlbHNlIHtcblx0Ly8gXHRcdCRzY29wZS5wbGFjZVRpbGUoY2hpbGRTbmFwc2hvdC50aWxlKTtcblx0Ly8gXHR9XG5cdC8vIH0pO1xuXG5cdC8vIFRPRE86IGhvdyB0byByZS1kbyB0aGUgbW92ZXM/XG5cdC8vICRzY29wZS5nYW1lLm1vdmVzO1xuXG5cdC8vIFRPRE86IGhvdyBkbyB3ZSBzaG93IHRoZSB0aWxlcyBmb3IgcGxheWVyP1xuXG5cdC8vIFRPRE86IGhvdyB0byBzaG93IHRoZSByb3RhdGVkIHRpbGU/XG5cblx0Ly8gQ01UOiBhc3N1bWluZyB3ZSB1c2UgbmV3IEdhbWUoKSBmb3IgZWFjaCBnYW1lXG5cdCRzY29wZS5jdXJyZW50UGxheWVyID0gJHNjb3BlLmdhbWUuZ2V0Q3VycmVudFBsYXllcigpO1xuXG5cdC8vIFRPRE86IG5lZWQgYSBmdW5jdGlvbiB0byBhc3NpZ24gZHJhZ29uXG5cdCRzY29wZS5kcmFnb247XG5cdHZhciBhd2FpdGluZ0RyYWdvbkhvbGRlcnMgPSBbXTtcblxuXHQkc2NvcGUuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0Ly9cblx0fTtcblxuXHQkc2NvcGUubXlUdXJuID0gZnVuY3Rpb24gKCkge1xuXHRcdCRzY29wZS5tZSA9PT0gJHNjb3BlLmN1cnJlbnRQbGF5ZXI7XG5cdH07XG5cblx0Ly90aGVzZSBhcmUgdGllZCB0byBhbmd1bGFyIG5nLWNsaWNrIGJ1dHRvbnNcblx0JHNjb3BlLnJvdGF0ZVRpbGVDdyA9IGZ1bmN0aW9uICh0aWxlKSB7XG5cdFx0Y29uc29sZS5sb2coXCJyb3RhdGUgdG8gcmlnaHRcIik7XG5cdFx0dGlsZS5yb3RhdGlvbisrO1xuXHRcdGlmICh0aWxlLnJvdGF0aW9uID09PSA0KSB0aWxlLnJvdGF0aW9uID0gMDtcblx0fTtcblxuXHQkc2NvcGUucm90YXRlVGlsZUNjdyA9IGZ1bmN0aW9uICh0aWxlKSB7XG5cdFx0dGlsZS5yb3RhdGlvbi0tO1xuXHRcdGlmICh0aWxlLnJvdGF0aW9uID09PSAtNCkgdGlsZS5yb3RhdGlvbiA9IDA7XG5cdH07XG5cblx0Ly8gQ01UOiB1c2UgcGxheWVyJ3MgYW5kIGdhbWUncyBwcm90b3R5cGUgZnVuY3Rpb24gdG8gcGxhY2UgdGlsZSBhbmQgdGhlbiBtb3ZlIGFsbCBwbGF5ZXJzXG5cdCRzY29wZS5wbGFjZVRpbGUgPSBmdW5jdGlvbiAodGlsZSkge1xuXHRcdC8vIFRPRE86IHNlbmQgdGhpcyBzdGF0ZSB0byBmaXJlYmFzZSBldmVyeSB0aW1lIGl0J3MgY2FsbGVkXG5cdFx0aWYgKHRpbGUucm90YXRpb24gPiAwKSB7XG5cdFx0XHR0aWxlLnBhdGhzID0gdGlsZS5wYXRocy5tYXAoZnVuY3Rpb24gKGNvbm5lY3Rpb24pIHtcblx0XHRcdFx0Y29ubmVjdGlvbiA9IGNvbm5lY3Rpb24gKyAyO1xuXHRcdFx0XHRpZiAoY29ubmVjdGlvbiA9PT0gOSkgY29ubmVjdGlvbiA9IDE7XG5cdFx0XHRcdGlmIChjb25uZWN0aW9uID09PSA4KSBjb25uZWN0aW9uID0gMDtcblx0XHRcdFx0cmV0dXJuIGNvbm5lY3Rpb247XG5cdFx0XHR9KTtcblx0XHRcdHRpbGUucGF0aHMudW5zaGlmdCh0aWxlLnBhdGhzLnBvcCgpKTtcblx0XHRcdHRpbGUucGF0aHMudW5zaGlmdCh0aWxlLnBhdGhzLnBvcCgpKTtcblx0XHR9IGVsc2UgaWYgKHRpbGUucm90YXRpb24gPCAwKSB7XG5cdFx0XHR0aWxlLnBhdGhzID0gdGlsZS5wYXRocy5tYXAoZnVuY3Rpb24gKGNvbm5lY3Rpb24pIHtcblx0XHRcdFx0Y29ubmVjdGlvbiA9IGNvbm5lY3Rpb24gLSAyO1xuXHRcdFx0XHRpZiAoY29ubmVjdGlvbiA9PT0gLTIpIGNvbm5lY3Rpb24gPSA2O1xuXHRcdFx0XHRpZiAoY29ubmVjdGlvbiA9PT0gLTEpIGNvbm5lY3Rpb24gPSA3O1xuXHRcdFx0XHRyZXR1cm4gY29ubmVjdGlvbjtcblx0XHRcdH0pO1xuXHRcdFx0dGlsZS5wYXRocy5wdXNoKHRpbGUucGF0aHMuc2hpZnQoKSk7XG5cdFx0XHR0aWxlLnBhdGhzLnB1c2godGlsZS5wYXRocy5zaGlmdCgpKTtcblx0XHR9XG5cblx0XHR2YXIgZmlyZWJhc2VQbGF5ZXJzQXJyID0gJGZpcmViYXNlQXJyYXkocGxheWVyc1JlZik7XG5cdFx0ZmlyZWJhc2VQbGF5ZXJzQXJyLiRsb2FkZWQoKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcblx0XHRcdFx0dmFyIG1lSWR4O1xuXHRcdFx0XHRwbGF5ZXJzLmZpbmQoZnVuY3Rpb24gKGUsIGkpIHtcblx0XHRcdFx0XHRpZiAoZS4kaWQgPT09ICRzY29wZS5tZS4kaWQpIG1lSWR4ID0gaTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0cGxheWVyLnBsYWNlVGlsZSh0aWxlLCBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdKTtcblxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRpbGUucGF0aHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRpZiAoZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS5uZXh0U3BhY2UucG9pbnRzW2ldLm5laWdoYm9yc1swXSA9PT0gXCJuXCIpIHtcblx0XHRcdFx0XHRcdGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0ubmV4dFNwYWNlLnBvaW50c1tpXS5uZWlnaGJvcnMuc3BsaWNlKDAsIDEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLm5leHRTcGFjZS5wb2ludHNbaV0ubmVpZ2hib3JzLnB1c2goZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS5uZXh0U3BhY2UucG9pbnRzW3RpbGUucGF0aHNbaV1dKTtcblx0XHRcdFx0XHRmaXJlYmFzZVBsYXllcnNBcnIuJHNhdmUobWVJZHgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS5wb2ludCA9IGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0ubmV4dFNwYWNlLnBvaW50c1tmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLm5leHRTcGFjZVBvaW50c0luZGV4XTtcblx0XHRcdFx0ZmlyZWJhc2VQbGF5ZXJzQXJyLiRzYXZlKG1lSWR4KTtcblx0XHRcdH0pO1xuXG5cblx0XHQvLyBDTVQ6IHRoaXMgc2hvdWxkIHNlbmQgdGhlIHJvdGF0ZWQgdGlsZSB0byBmaXJlYmFzZVxuXHRcdG1vdmVzQXJyLiRhZGQoe1xuXHRcdFx0J3R5cGUnOiAncGxhY2VUaWxlJyxcblx0XHRcdCd0aWxlJzogdGlsZSxcblx0XHRcdCdwbGF5ZXJVaWQnOiAkc2NvcGUubWUudWlkXG5cdFx0fSk7XG5cblxuXHRcdGZpcmViYXNlUGxheWVyc0Fyci4kbG9hZGVkKClcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG5cdFx0XHRcdHBsYXllcnMuZm9yRWFjaChmdW5jdGlvbiAocCkge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFwicFwiLCBwLnBvaW50KTtcblxuXHRcdFx0XHRcdC8vIGxldCBtb3ZhYmxlID0gcGxheWVyLm1vdmVUbyhwLnBvaW50KTtcblx0XHRcdFx0XHQvLyB2YXIgcElkeCA9IHBsYXllcnMuaW5kZXhPZihwKVxuXG5cdFx0XHRcdFx0Ly8gd2hpbGUgKG1vdmFibGUpIHtcblx0XHRcdFx0XHQvLyAgICAgLy8gbXkgcG9pbnQgaXMgZ29pbmcgdG8gYmUgY3VycmVudCBwb2ludCdzIG5laWdoYm9yc1xuXHRcdFx0XHRcdC8vICAgICBwLnBvaW50LnRyYXZlbGxlZCA9IHRydWU7XG5cdFx0XHRcdFx0Ly8gICAgIHAucG9pbnQgPSBwLm5laWdoYm9ycy5maWx0ZXIoZnVuY3Rpb24gKG4pIHtcblx0XHRcdFx0XHQvLyAgICAgICAgIHJldHVybiAhbi50cmF2ZWxsZWQgJiYgbmVpZ2hib3IgIT09IFwiblwiO1xuXHRcdFx0XHRcdC8vICAgICB9KVswXVxuXHRcdFx0XHRcdC8vICAgICBjb25zb2xlLmxvZyhwLnBvaW50LCBcImdhbWUganMgcCBwb2ludFwiKVxuXHRcdFx0XHRcdC8vICAgICB2YXIgcG9pbnRJZHg7XG5cdFx0XHRcdFx0Ly8gICAgIHAubmV4dFNwYWNlLnBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uIChwb2ludCwgaWR4KSB7XG5cdFx0XHRcdFx0Ly8gICAgICAgICBpZiAoSlNPTi50b1N0cmluZyhwb2ludCkgPT09IEpTT04udG9TdHJpbmcocC5wb2ludCkpIHtcblx0XHRcdFx0XHQvLyAgICAgICAgICAgICBwb2ludElkeCA9IGlkeDtcblx0XHRcdFx0XHQvLyAgICAgICAgIH1cblx0XHRcdFx0XHQvLyAgICAgfSlcblx0XHRcdFx0XHQvLyAgICAgcC5uZXh0U3BhY2VQb2ludHNJbmRleCA9IHBvaW50SWR4O1xuXHRcdFx0XHRcdC8vXG5cdFx0XHRcdFx0Ly8gICAgIGxldCBvbGRTcGFjZSA9IHAubmV4dFNwYWNlO1xuXHRcdFx0XHRcdC8vICAgICBsZXQgbmV3U3BhY2UgPSBwbGF5ZXIubmV3U3BhY2UoJHNjb3BlLmdhbWUuYm9hcmQsIG9sZFNwYWNlLCBwKTtcblx0XHRcdFx0XHQvLyAgICAgcC5uZXh0U3BhY2UgPSBuZXdTcGFjZTtcblx0XHRcdFx0XHQvL1xuXHRcdFx0XHRcdC8vICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJHNhdmUocElkeClcblx0XHRcdFx0XHQvLyAgICAgICAgIC8vIHBsYXllci5jaGVja0RlYXRoKHApO1xuXHRcdFx0XHRcdC8vICAgICBtb3ZhYmxlID0gcGxheWVyLm1vdmVUbyhwLnBvaW50KTtcblx0XHRcdFx0XHQvL1xuXHRcdFx0XHRcdC8vIH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXG5cdFx0Ly8gaWYgKCRzY29wZS5nYW1lLmNoZWNrT3ZlcigpKSB7XG5cdFx0Ly8gICAgIC8vIFRPRE86IG5lZWQgdG8gdGVsbCB0aGUgcGxheWVyIHNoZSB3b25cblx0XHQvLyAgICAgJHNjb3BlLndpbm5lciA9ICRzY29wZS5nYW1lLmdldENhblBsYXkoKVswXTtcblx0XHQvLyAgICAgJHNjb3BlLmdhbWVPdmVyID0gdHJ1ZTtcblx0XHQvLyB9IGVsc2Uge1xuXHRcdC8vICAgICAvLyBJZiBkZWNrIGlzIGVtcHR5ICYgbm8gb25lIGlzIGRyYWdvbiwgc2V0IG1lIGFzIGRyYWdvblxuXHRcdC8vICAgICBpZiAoJHNjb3BlLmdhbWUuZGVjay5sZW5ndGggPT09IDAgJiYgISRzY29wZS5kcmFnb24pIHtcblx0XHQvLyAgICAgICAgICRzY29wZS5kcmFnb24gPSAkc2NvcGUubWU7XG5cdFx0Ly8gICAgIH0gZWxzZSBpZiAoJHNjb3BlLmdhbWUuZGVjay5sZW5ndGggPT09IDAgJiYgJHNjb3BlLmRyYWdvbikge1xuXHRcdC8vICAgICAgICAgYXdhaXRpbmdEcmFnb25Ib2xkZXJzLnB1c2goJHNjb3BlLm1lKTtcblx0XHQvLyAgICAgfSBlbHNlIHtcblx0XHQvLyAgICAgICAgIC8vIENNVDogZHJhdyBvbmUgdGlsZSBhbmQgcHVzaCBpdCB0byB0aGUgcGxheWVyLnRpbGVzIGFycmF5XG5cdFx0Ly8gICAgICAgICAkc2NvcGUubWUudGlsZXMucHVzaCgkc2NvcGUuZ2FtZS5kZWNrLmRlYWwoMSkpO1xuXHRcdC8vICAgICAgICAgLy9pZiBkZWFkIHBsYXllcnMsIHRoZW4gcHVzaCB0aGVpciBjYXJkcyBiYWNrIHRvIHRoZSBkZWNrICYgcmVzaHVmZmxlXG5cdFx0Ly8gICAgICAgICBpZiAoJHNjb3BlLmdhbWUuZGVhZFBsYXllcnMoKS5sZW5ndGgpIHtcblx0XHQvLyAgICAgICAgICAgICAvL3dpdGggbmV3IGNhcmRzICYgbmVlZCB0byByZXNodWZmbGVcblx0XHQvLyAgICAgICAgICAgICAkc2NvcGUuZ2FtZS5kZWFkUGxheWVycygpLmZvckVhY2goZnVuY3Rpb24gKGRlYWRQbGF5ZXJUaWxlcykge1xuXHRcdC8vICAgICAgICAgICAgICAgICBkZWFkUGxheWVyVGlsZXMuZm9yRWFjaChmdW5jdGlvbiAodGlsZSkge1xuXHRcdC8vICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmdhbWUuZGVjay5wdXNoKHRpbGUpO1xuXHRcdC8vICAgICAgICAgICAgICAgICB9KTtcblx0XHQvLyAgICAgICAgICAgICB9KTtcblx0XHQvLyAgICAgICAgICAgICAkc2NvcGUuZ2FtZS5kZWNrID0gJHNjb3BlLmdhbWUuZGVjay5zaHVmZmxlKCk7XG5cdFx0Ly8gICAgICAgICAgICAgLy9zZW5kIGZpcmViYXNlIGEgbmV3IG1vdmVcblx0XHQvLyAgICAgICAgICAgICBnYW1lUmVmLmNoaWxkKCdtb3ZlcycpLnB1c2goe1xuXHRcdC8vICAgICAgICAgICAgICAgICAndHlwZSc6ICd1cGRhdGVEZWNrJyxcblx0XHQvLyAgICAgICAgICAgICAgICAgJ3VwZGF0ZURlY2snOiAkc2NvcGUuZ2FtZS5kZWNrXG5cdFx0Ly8gICAgICAgICAgICAgfSk7XG5cdFx0Ly8gICAgICAgICAgICAgaWYgKCRzY29wZS5kcmFnb24pIHtcblx0XHQvLyAgICAgICAgICAgICAgICAgJHNjb3BlLmRyYWdvbi50aWxlcy5wdXNoKCRzY29wZS5nYW1lLmRlY2suZGVhbCgxKSk7XG5cdFx0Ly8gICAgICAgICAgICAgICAgICRzY29wZS5kcmFnb24gPSBudWxsO1xuXHRcdC8vICAgICAgICAgICAgICAgICAvL05FRUQgVE8gRElTQ1VTUzogTWlnaHQgbmVlZCB0byBtb2RpZnkgdGhpcyBpZiB3ZSB3YW50IHRvIHVzZSB1cCB0aGUgY2FyZHMgYW5kIGdpdmUgZWFjaCBhd2FpdGluZyBwbGF5ZXJzJyB1cCB0byAzIGNhcmRzXG5cdFx0Ly8gICAgICAgICAgICAgICAgIHdoaWxlICgkc2NvcGUuZ2FtZS5kZWNrLmxlbmd0aCAmJiAkc2NvcGUuYXdhaXRpbmdEcmFnb25Ib2xkZXJzLmxlbmd0aCkge1xuXHRcdC8vICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmF3YWl0aW5nRHJhZ29uSG9sZGVycy5zaGlmdCgpLnRpbGVzLnB1c2goJHNjb3BlLmdhbWUuZGVjay5kZWFsKDEpKTtcblx0XHQvLyAgICAgICAgICAgICAgICAgfTtcblx0XHQvLyAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS5hd2FpdGluZ0RyYWdvbkhvbGRlcnMubGVuZ3RoKSB7XG5cdFx0Ly8gICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZHJhZ29uID0gJHNjb3BlLmF3YWl0aW5nRHJhZ29uSG9sZGVycy5zaGlmdCgpO1xuXHRcdC8vICAgICAgICAgICAgICAgICB9XG5cdFx0Ly8gICAgICAgICAgICAgfTtcblx0XHQvLyAgICAgICAgIH1cblx0XHQvL1xuXHRcdC8vICAgICB9XG5cdFx0Ly8gICAgICRzY29wZS5nYW1lLmdvVG9OZXh0UGxheWVyKCk7XG5cdFx0Ly8gfVxuXHR9O1xuXG5cdC8vIFRPRE86IGZpcmViYXNlIGdhbWUucGxheWVycyBzbGljZSAkc2NvcGUucGxheWVyIG91dFxuXHQkc2NvcGUubGVhdmVHYW1lO1xuXG5cdC8vIFRPRE86IG5lZWQgdG8gcmVtb3ZlIHRoaXMgZ2FtZSByb29tJ3MgbW92ZXMgZnJvbSBmaXJlYmFzZT9cblx0JHNjb3BlLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuXHRcdG1hcmtlcnNBcnIuJHJlbW92ZSgwKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlZikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcInJlbW92ZWQgYWxsIG1hcmtlcnNcIiwgcmVmLmtleSk7XG5cdFx0XHR9KTtcblxuXHRcdGRlY2tBcnIuJHJlbW92ZSgwKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlZikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcInJlbW92ZWQgdGhlIGRlY2tcIiwgcmVmLmtleSk7XG5cdFx0XHR9KTtcblxuXHRcdG9iai4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuXHRcdFx0dmFyIHRpbGVzID0gZGF0YS50aWxlcztcblx0XHRcdHZhciBkZWNrID0gbmV3IERlY2sodGlsZXMpLnNodWZmbGUoKS50aWxlcztcblx0XHRcdHZhciBpbml0aWFsRGVja1JlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZCgkc3RhdGVQYXJhbXMuZ2FtZU5hbWUpLmNoaWxkKCdpbml0aWFsRGVjaycpO1xuXHRcdFx0JGZpcmViYXNlQXJyYXkoaW5pdGlhbERlY2tSZWYpLiRhZGQoZGVjayk7XG5cdFx0fSk7XG5cblxuXG5cdFx0dmFyIGluaXRpYWxNYXJrZXJzUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKCRzdGF0ZVBhcmFtcy5nYW1lTmFtZSkuY2hpbGQoJ2F2YWlsYWJsZU1hcmtlcnMnKTtcblx0XHQkZmlyZWJhc2VBcnJheShpbml0aWFsTWFya2Vyc1JlZikuJGFkZChbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJ5ZWxsb3dcIiwgXCJncmVlblwiLCBcImFxdWFcIiwgXCJibHVlXCIsIFwibmF2eVwiLCBcInB1cnBsZVwiXSk7XG5cblxuXHRcdHZhciBwbGF5ZXJzID0gJGZpcmViYXNlQXJyYXkocGxheWVyc1JlZik7XG5cdFx0cGxheWVycy4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGRhdGFbaV0uY2FuUGxheSA9IHRydWU7XG5cdFx0XHRcdGRhdGFbaV0ubWFya2VyID0gJ24nO1xuXHRcdFx0XHRkYXRhW2ldLm5leHRTcGFjZSA9ICduJztcblx0XHRcdFx0ZGF0YVtpXS5uZXh0U3BhY2VQb2ludHNJbmRleCA9ICduJztcblx0XHRcdFx0ZGF0YVtpXS5wb2ludCA9ICduJztcblx0XHRcdFx0ZGF0YVtpXS50aWxlcyA9ICduJztcblx0XHRcdFx0cGxheWVycy4kc2F2ZShpKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGNvbnNvbGUubG9nKCRzY29wZS5tZSk7XG5cblx0fTtcblxuXG5cdCRzY29wZS5zdGFydHRvcCA9IFtcblx0XHRbMCwgMCwgMF0sXG5cdFx0WzAsIDAsIDFdLFxuXHRcdFsxLCAwLCAwXSxcblx0XHRbMSwgMCwgMV0sXG5cdFx0WzIsIDAsIDBdLFxuXHRcdFsyLCAwLCAxXSxcblx0XHRbMywgMCwgMF0sXG5cdFx0WzMsIDAsIDFdLFxuXHRcdFs0LCAwLCAwXSxcblx0XHRbNCwgMCwgMV0sXG5cdFx0WzUsIDAsIDBdLFxuXHRcdFs1LCAwLCAxXVxuXHRdO1xuXHQkc2NvcGUuc3RhcnRsZWZ0ID0gW1xuXHRcdFswLCAwLCA3XSxcblx0XHRbMCwgMCwgNl0sXG5cdFx0WzAsIDEsIDddLFxuXHRcdFswLCAxLCA2XSxcblx0XHRbMCwgMiwgN10sXG5cdFx0WzAsIDIsIDZdLFxuXHRcdFswLCAzLCA3XSxcblx0XHRbMCwgMywgNl0sXG5cdFx0WzAsIDQsIDddLFxuXHRcdFswLCA0LCA2XSxcblx0XHRbMCwgNSwgN10sXG5cdFx0WzAsIDUsIDZdXG5cdF07XG5cdCRzY29wZS5zdGFydGJvdHRvbSA9IFtcblx0XHRbMCwgNSwgMF0sXG5cdFx0WzAsIDUsIDFdLFxuXHRcdFsxLCA1LCAwXSxcblx0XHRbMSwgNSwgMV0sXG5cdFx0WzIsIDUsIDBdLFxuXHRcdFsyLCA1LCAxXSxcblx0XHRbMywgNSwgMF0sXG5cdFx0WzMsIDUsIDFdLFxuXHRcdFs0LCA1LCAwXSxcblx0XHRbNCwgNSwgMV0sXG5cdFx0WzUsIDUsIDBdLFxuXHRcdFs1LCA1LCAxXVxuXHRdO1xuXHQkc2NvcGUuc3RhcnRyaWdodCA9IFtcblx0XHRbNSwgMCwgMl0sXG5cdFx0WzUsIDAsIDNdLFxuXHRcdFs1LCAxLCAyXSxcblx0XHRbNSwgMSwgM10sXG5cdFx0WzUsIDIsIDJdLFxuXHRcdFs1LCAyLCAzXSxcblx0XHRbNSwgMywgMl0sXG5cdFx0WzUsIDMsIDNdLFxuXHRcdFs1LCA0LCAyXSxcblx0XHRbNSwgNCwgM10sXG5cdFx0WzUsIDUsIDJdLFxuXHRcdFs1LCA1LCAzXVxuXHRdO1xufSk7XG4iLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2dhbWVsaXN0Jywge1xuICAgICAgICB1cmw6ICcvZ2FtZWxpc3QnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9icm93c2VyL2pzL2dhbWVsaXN0L2dhbWVsaXN0Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnZ2FtZUxpc3QnLFxuICAgIH0pO1xufSk7XG5cbnRzdXJvLmNvbnRyb2xsZXIoJ2dhbWVMaXN0JywgZnVuY3Rpb24gKCRzY29wZSwgZmlyZWJhc2VVcmwsICRmaXJlYmFzZU9iamVjdCwgJHN0YXRlLCAkZmlyZWJhc2VBdXRoLCAkZmlyZWJhc2VBcnJheSkge1xuICAgIC8vRm9yIHN5bmNocm9uaXppbmdHYW1lTGlzdC4uLlxuICAgIHZhciByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xuICAgIHZhciBvYmogPSAkZmlyZWJhc2VPYmplY3QocmVmKTtcblxuICAgIHZhciBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuICAgIHZhciBmaXJlYmFzZVVzZXIgPSBhdXRoLiRnZXRBdXRoKCk7XG5cbiAgICB2YXIgc3luY2hSZWYgPSByZWYuY2hpbGQoXCJnYW1lc1wiKTtcbiAgICB2YXIgc3luY2hyb25pemVkT2JqID0gJGZpcmViYXNlT2JqZWN0KHN5bmNoUmVmKTtcblxuICAgIC8vIFRoaXMgcmV0dXJucyBhIHByb21pc2UuLi55b3UgY2FuLnRoZW4oKSBhbmQgYXNzaWduIHZhbHVlIHRvICRzY29wZS52YXJpYWJsZVxuICAgIC8vIGdhbWVsaXN0IGlzIHdoYXRldmVyIHdlIGFyZSBjYWxsaW5nIGl0IGluIHRoZSBhbmd1bGFyIGh0bWwuXG4gICAgc3luY2hyb25pemVkT2JqLiRiaW5kVG8oJHNjb3BlLCBcImdhbWVsaXN0XCIpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBnYW1lbGlzdCA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiAkc2NvcGUuZ2FtZWxpc3QpIHtcbiAgICAgICAgICAgICAgICBnYW1lbGlzdC5wdXNoKFtpLCAkc2NvcGUuZ2FtZWxpc3RbaV1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRzY29wZS5nYW1lTmFtZXMgPSBnYW1lbGlzdC5zbGljZSgyKTtcbiAgICAgICAgfSk7XG5cblxuXG5cbiAgICAkc2NvcGUuam9pbiA9IGZ1bmN0aW9uIChnYW1lTmFtZSkge1xuICAgICAgICB2YXIgZ2FtZU5hbWVSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoZ2FtZU5hbWUpO1xuICAgICAgICB2YXIgcGxheWVyc1JlZiA9IGdhbWVOYW1lUmVmLmNoaWxkKCdwbGF5ZXJzJyk7XG5cbiAgICAgICAgZmlyZWJhc2UuYXV0aCgpLm9uQXV0aFN0YXRlQ2hhbmdlZChmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgdmFyIGZpcmViYXNlUGxheWVyc0FyciA9ICRmaXJlYmFzZUFycmF5KHBsYXllcnNSZWYpO1xuXG4gICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIEZCcGxheWVycyA9IGRhdGE7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghRkJwbGF5ZXJzLmZpbHRlcihmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwbGF5ZXIudWlkID09PSB1c2VyLnVpZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdQbGF5ZXIgPSBuZXcgUGxheWVyKHVzZXIudWlkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRmaXJlYmFzZUFycmF5KHBsYXllcnNSZWYpLiRhZGQobmV3UGxheWVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm8gdXNlciBpcyBzaWduZWQgaW4uXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIm5vdGhpbmdcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdnYW1lJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJnYW1lTmFtZVwiOiBnYW1lTmFtZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn0pO1xuIiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdwaWNrR2FtZScsIHtcbiAgICAgICAgdXJsOiAnL3BpY2tnYW1lJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvYnJvd3Nlci9qcy9waWNrR2FtZS9waWNrR2FtZS5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ3BpY2tHYW1lQ3RybCdcbiAgICB9KTtcbn0pO1xuXG50c3Vyby5jb250cm9sbGVyKCdwaWNrR2FtZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QpIHtcbiAgICB2YXIgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbiAgICB2YXIgb2JqID0gJGZpcmViYXNlT2JqZWN0KHJlZilcblxuXG4gICAgJHNjb3BlLmNyZWF0ZUdhbWUgPSBmdW5jdGlvbiAoZ2FtZU5hbWUpIHtcbiAgICAgICAgdmFyIGdhbWVOYW1lUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKGdhbWVOYW1lKTtcbiAgICAgICAgdmFyIHBsYXllcnNSZWYgPSBnYW1lTmFtZVJlZi5jaGlsZCgncGxheWVycycpO1xuXG4gICAgICAgICRmaXJlYmFzZUFycmF5KGdhbWVOYW1lUmVmKS4kYWRkKHtcbiAgICAgICAgICAgIFwiZ2FtZU5hbWVcIjogZ2FtZU5hbWVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZmlyZWJhc2UuYXV0aCgpLm9uQXV0aFN0YXRlQ2hhbmdlZChmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV3UGxheWVyID0gbmV3IFBsYXllcih1c2VyLnVpZClcbiAgICAgICAgICAgICAgICAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKS4kYWRkKG5ld1BsYXllcilcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJubyBvbmUgbG9nZ2VkIGluXCIpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgb2JqLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICB2YXIgdGlsZXMgPSBkYXRhLnRpbGVzXG4gICAgICAgICAgICB2YXIgZGVjayA9IG5ldyBEZWNrKHRpbGVzKS5zaHVmZmxlKCkudGlsZXM7XG4gICAgICAgICAgICB2YXIgaW5pdGlhbERlY2tSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoZ2FtZU5hbWUpLmNoaWxkKCdpbml0aWFsRGVjaycpO1xuICAgICAgICAgICAgJGZpcmViYXNlQXJyYXkoaW5pdGlhbERlY2tSZWYpLiRhZGQoZGVjayk7XG4gICAgICAgIH0pXG5cblxuICAgICAgICB2YXIgaW5pdGlhbE1hcmtlcnNSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoZ2FtZU5hbWUpLmNoaWxkKCdhdmFpbGFibGVNYXJrZXJzJyk7XG4gICAgICAgICRmaXJlYmFzZUFycmF5KGluaXRpYWxNYXJrZXJzUmVmKS4kYWRkKFtcInJlZFwiLCBcIm9yYW5nZVwiLCBcInllbGxvd1wiLCBcImdyZWVuXCIsIFwiYXF1YVwiLCBcImJsdWVcIiwgXCJuYXZ5XCIsIFwicHVycGxlXCJdKTtcblxuXG4gICAgICAgICRzdGF0ZS5nbygnZ2FtZScsIHtcbiAgICAgICAgICAgIFwiZ2FtZU5hbWVcIjogZ2FtZU5hbWVcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgICRzY29wZS5nb1RvR2FtZUxpc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzdGF0ZS5nbygnZ2FtZWxpc3QnKTtcbiAgICB9O1xufSk7XG4iLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9icm93c2VyL2pzL2xvZ2luL2xvZ2luLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnbG9naW5DdHJsJ1xuICAgIH0pO1xufSk7XG5cbnRzdXJvLmNvbnRyb2xsZXIoJ2xvZ2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSwgJGZpcmViYXNlQXV0aCwgJHJvb3RTY29wZSkge1xuICAgIHZhciBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuXG4gICAgJHNjb3BlLmxvZ0luV2l0aEdvb2dsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYXV0aC4kc2lnbkluV2l0aFBvcHVwKFwiZ29vZ2xlXCIpLnRoZW4oZnVuY3Rpb24gKGF1dGhEYXRhKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkxvZ2dlZCBpbiBhczpcIiwgYXV0aERhdGEpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS5jdXJyZW50VXNlciA9IGF1dGhEYXRhO1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdwaWNrR2FtZScpO1xuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJBdXRoZW50aWNhdGlvbiBmYWlsZWQ6XCIsIGVycm9yKTtcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG59KTtcbiIsIid1c2Ugc3RyaWN0J1xuXG5mdW5jdGlvbiBQbGF5ZXIodWlkKSB7XG4gICAgLy8gVE9ETzogZ2V0IHVpZCBmcm9tIGZpcmViYXNlIGF1dGhcbiAgICB0aGlzLnVpZCA9IHVpZDtcblxuICAgIHRoaXMubWFya2VyID0gXCJuXCI7XG5cbiAgICAvLyBzaG91bGQgYmUgYSBQb2ludCBvYmplY3RcbiAgICB0aGlzLnBvaW50ID0gXCJuXCI7XG5cbiAgICAvLyBbeCwgeV1cbiAgICAvLyBkZXBlbmRzIG9uIHRoZSBhbmd1bGFyIFNwYWNlLngsIFNwYWNlLnlcbiAgICB0aGlzLm5leHRTcGFjZSA9IFwiblwiO1xuXG4gICAgLy8gaW4gZWFjaCBTcGFjZS5wb2ludHMgYXJyYXksIGZpbmQgdGhpcyBzcGVjaWZpYyBwb2ludCBhbmQgZ2V0IHRoZSBwb3NpdGlvbiAoaW50ZWdlcikgaW5zaWRlIHRoaXMgc3BhY2UuXG4gICAgdGhpcy5uZXh0U3BhY2VQb2ludHNJbmRleCA9IFwiblwiO1xuXG4gICAgLy8gbWF4aW11biAzIHRpbGVzXG4gICAgdGhpcy50aWxlcyA9ICduJztcblxuICAgIC8vIGlmIGEgcGxheWVyIGRpZXMsIGl0IHdpbGwgYmUgY2hhbmdlZCB0byBmYWxzZVxuICAgIHRoaXMuY2FuUGxheSA9IHRydWU7XG59XG5QbGF5ZXIucHJvdG90eXBlLmhpID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkhJXCIpXG4gICAgfVxuICAgIC8vIG5lZWQgdG8gdXNlIHNlbGYgYmVjdXNlIHdlIG5lZWQgdG8gY2hhbmdlICRzY29wZS5tZSBvbiBnYW1lQ3RybCBhbmQgc2VuZCB0byBmaXJlYmFzZVxuUGxheWVyLnByb3RvdHlwZS5wbGFjZU1hcmtlciA9IGZ1bmN0aW9uIChib2FyZCwgcG9pbnQsIHNlbGYpIHtcbiAgICAvLyBwb2ludCBsb29rcyBsaWtlIFt4LCB5LCBwb2ludHNJbmRleF0gaW4gdGhlIHNwYWNlXG4gICAgdmFyIHggPSBwb2ludFswXTtcbiAgICB2YXIgeSA9IHBvaW50WzFdO1xuICAgIHZhciBwb2ludHNJbmRleCA9IHBvaW50WzJdO1xuXG4gICAgc2VsZi5wb2ludCA9IGJvYXJkW3ldW3hdLnBvaW50c1twb2ludHNJbmRleF07XG4gICAgc2VsZi5wb2ludC50cmF2ZWxsZWQgPSB0cnVlO1xuXG4gICAgLy9beCwgeV0gZnJvbSB0aGUgcG9pbnRcbiAgICBzZWxmLm5leHRTcGFjZSA9IGJvYXJkW3ldW3hdO1xuXG4gICAgLy8gaW4gZWFjaCBTcGFjZS5wb2ludHMgYXJyYXksIGZpbmQgdGhpcyBzcGVjaWZpYyBwb2ludCBhbmQgZ2V0IHRoZSBwb3NpdGlvbiAoaW50ZWdlcikgaW5zaWRlIHRoaXMgc3BhY2UuXG4gICAgc2VsZi5uZXh0U3BhY2VQb2ludHNJbmRleCA9IHNlbGYubmV4dFNwYWNlLnBvaW50cy5pbmRleE9mKHNlbGYucG9pbnQpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5uZXdTcGFjZSA9IGZ1bmN0aW9uIChib2FyZCwgb2xkU3BhY2UsIHNlbGYpIHtcbiAgICBpZiAoc2VsZi5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gMCB8fCBzZWxmLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSAxKSB7XG4gICAgICAgIHJldHVybiBib2FyZFtvbGRTcGFjZS55IC0gMV1bb2xkU3BhY2UueF07XG4gICAgfSBlbHNlIGlmIChzZWxmLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSAyIHx8IHNlbGYubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDMpIHtcbiAgICAgICAgcmV0dXJuIGJvYXJkW29sZFNwYWNlLnldW29sZFNwYWNlLnggKyAxXTtcbiAgICB9IGVsc2UgaWYgKHNlbGYubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDQgfHwgc2VsZi5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gNSkge1xuICAgICAgICByZXR1cm4gYm9hcmRbb2xkU3BhY2UueSArIDFdW29sZFNwYWNlLnhdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBib2FyZFtvbGRTcGFjZS55XVtvbGRTcGFjZS54IC0gMV07XG4gICAgfVxufTtcblxuLy8gbmVlZCB0byB1c2Ugc2VsZiBiZWN1c2Ugd2UgbmVlZCB0byBjaGFuZ2UgJHNjb3BlLm1lIG9uIGdhbWVDdHJsIGFuZCBzZW5kIHRvIGZpcmViYXNlXG5QbGF5ZXIucHJvdG90eXBlLnBsYWNlVGlsZSA9IGZ1bmN0aW9uICh0aWxlLCBzZWxmKSB7XG4gICAgc2VsZi50aWxlcyA9IHNlbGYudGlsZXMuZmlsdGVyKGZ1bmN0aW9uICh0KSB7XG4gICAgICAgIHJldHVybiB0LmlkICE9PSB0aWxlLmlkXG4gICAgfSk7XG5cbiAgICBzZWxmLm5leHRTcGFjZS50aWxlVXJsID0gdGlsZS5pbWFnZVVybDtcblxufTtcblxuUGxheWVyLnByb3RvdHlwZS5tb3ZlVG8gPSBmdW5jdGlvbiAocG9pbnRlcikge1xuICAgIC8vYWx3YXlzIGJlIHJldHVybmluZyAwIG9yIDEgcG9pbnQgaW4gdGhlIGFycmF5XG4gICAgbGV0IG5leHRQb2ludCA9IHBvaW50ZXIubmVpZ2hib3JzLmZpbHRlcihmdW5jdGlvbiAobmVpZ2hib3IpIHtcbiAgICAgICAgcmV0dXJuICFuZWlnaGJvci50cmF2ZWxsZWQgJiYgbmVpZ2hib3IgIT09IFwiblwiO1xuICAgIH0pWzBdO1xuICAgIGNvbnNvbGUubG9nKFwibmV4dFBvaW50XCIsIG5leHRQb2ludClcbiAgICByZXR1cm4gbmV4dFBvaW50O1xufTtcblxuLy8gVE9ETzogbm90IHN1cmUgaG93IHRvIG1ha2UgdGhpcyBrZWVwIG1vdmluZyB3aXRoIHBsYXllcnMgaW5zdGVhZCBvZiBzZWxmXG4vLyBQbGF5ZXIucHJvdG90eXBlLmtlZXBNb3ZpbmcgPSBmdW5jdGlvbiAoc2VsZikge1xuLy8gICAgIGxldCBtb3ZhYmxlID0gc2VsZi5tb3ZlVG8oc2VsZi5wb2ludCk7XG4vLyAgICAgd2hpbGUgKG1vdmFibGUpIHtcbi8vICAgICAgICAgc2VsZi5wb2ludC50cmF2ZWxsZWQgPSB0cnVlO1xuLy8gICAgICAgICBzZWxmLnBvaW50ID0gc2VsZi5tb3ZlVG8oc2VsZi5wb2ludCk7XG4vLyAgICAgICAgIGxldCBvbGRTcGFjZSA9IHNlbGYubmV4dFNwYWNlO1xuLy8gICAgICAgICBsZXQgbmV3U3BhY2UgPSBuZXdTcGFjZShvbGRTcGFjZSk7XG4vLyAgICAgICAgIHNlbGYubmV4dFNwYWNlID0gbmV3U3BhY2U7XG4vLyAgICAgICAgIHNlbGYubmV4dFNwYWNlUG9pbnRzSW5kZXggPSBzZWxmLm5leHRTcGFjZS5wb2ludHMuaW5kZXhPZihzZWxmLnBvaW50KTtcbi8vICAgICAgICAgc2VsZi5jaGVja0RlYXRoKCk7XG4vLyAgICAgICAgIG1vdmFibGUgPSBzZWxmLm1vdmVUbyhzZWxmLnBvaW50KTtcbi8vICAgICB9XG4vLyB9O1xuXG5QbGF5ZXIucHJvdG90eXBlLmNoZWNrRGVhdGggPSBmdW5jdGlvbiAoc2VsZikge1xuICAgIHZhciBhbGxUcmF2ZWxsZWQgPSBzZWxmLnBvaW50Lm5laWdoYm9ycy5maWx0ZXIoZnVuY3Rpb24gKG5laWdoYm9yKSB7XG4gICAgICAgIHJldHVybiBuZWlnaGJvci50cmF2ZWxsZWQ7XG4gICAgfSk7XG5cbiAgICBpZiAoc2VsZi5wb2ludC5lZGdlIHx8IGFsbFRyYXZlbGxlZC5sZW5ndGggPT09IDIpIHNlbGYuZGllKCk7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLmRpZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmNhblBsYXkgPSBmYWxzZTtcbiAgICAvLyBUT0RPOiBuZWVkIHRvIHNlbmQgYW4gYWxlcnQgb3IgbWVzc2FnZSB0byB0aGUgcGxheWVyIHdobyBqdXN0IGRpZWQuXG59O1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
