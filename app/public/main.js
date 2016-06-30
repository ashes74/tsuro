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
																				console.log('epi', existingPlayerIndex);
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
								// var firebasePlayersArr = $firebaseArray(playersRef);

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

				//TODO: limit start points
				//This version has some weird side effects...

				//Have player pick their start point
				$scope.placeMarker = function (board, point) {

								firebasePlayersArr.$loaded().then(function (players) {
												console.log('players', players);
												var meIdx;
												players.find(function (e, i) {
																if (e.uid === $scope.me.uid) meIdx = i;
																console.log('me and e and i', $scope.me.uid, e.uid, meIdx);
												});

												player.placeMarker(board, point, firebasePlayersArr[meIdx]);
												firebasePlayersArr[meIdx].tiles = $scope.game.deal(3);

												$scope.game.players[meIdx] = firebasePlayersArr[meIdx]; //This is main issue... puts Object, not Player into firebase... 

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImdhbWUvYm9hcmQuanMiLCJnYW1lL2RlY2suanMiLCJnYW1lL2dhbWUuY29udHJ1Y3Rvci5qcyIsImdhbWUvZ2FtZS5qcyIsImdhbWVsaXN0L2dhbWVsaXN0LmpzIiwibG9naW4vbG9naW4uanMiLCJwaWNrR2FtZS9waWNrR2FtZS5qcyIsInBsYXllci9wbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsSUFBQSxRQUFBLFFBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTs7QUFFQSxNQUFBLE1BQUEsQ0FBQSxZQUFBO0FBQ0EsUUFBQSxTQUFBO0FBQ0EsZ0JBQUEseUNBREE7QUFFQSxvQkFBQSxzQ0FGQTtBQUdBLHFCQUFBLDZDQUhBO0FBSUEsdUJBQUE7QUFKQSxLQUFBO0FBTUEsYUFBQSxhQUFBLENBQUEsTUFBQTtBQUNBLENBUkE7O0FBVUEsTUFBQSxRQUFBLENBQUEsYUFBQSxFQUFBLDRDQUFBOztBQUVBLE1BQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQTtBQUNBLHVCQUFBLFNBQUEsQ0FBQSxHQUFBO0FBQ0EsQ0FGQTs7QUNkQSxTQUFBLEtBQUEsR0FBQTtBQUNBLFNBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQTs7QUFFQSxNQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsRUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBO0FBQ0E7QUFDQSxXQUFBLEtBQUEsS0FBQTtBQUNBLENBUkE7O0FBVUEsU0FBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxLQUFBLEVBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLFNBQUEsS0FBQSxHQUFBLEdBQUE7QUFDQSxTQUFBLE1BQUEsR0FBQSxDQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBQUE7QUFDQSxTQUFBLE9BQUEsR0FBQSxHQUFBO0FBQ0EsU0FBQSxNQUFBLEdBQUEsR0FBQTs7QUFFQSxTQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxzQkFBQTs7QUFFQSxZQUFBLElBQUEsQ0FBQSxFQUFBOztBQUNBLDRCQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLEM7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FDQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsTUFBQSxJQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLFNBSkEsTUFJQSxJQUFBLElBQUEsQ0FBQSxFQUFBOztBQUNBLGdCQUFBLE1BQUEsQ0FBQSxFQUFBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxLQUNBLEtBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxTQUhBLE1BR0EsSUFBQSxJQUFBLENBQUEsRUFBQTs7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FDQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsU0FIQSxNQUdBOztBQUNBLDRCQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLEM7QUFDQSxnQkFBQSxNQUFBLENBQUEsRUFBQSxLQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsS0FDQTtBQUNBLHFCQUFBLE1BQUEsQ0FBQSxDQUFBLElBQUEsTUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFJQSxTQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxTQUFBLElBQUEsR0FBQSxJQUFBO0FBQ0EsU0FBQSxTQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUE7QUFDQSxTQUFBLFNBQUEsR0FBQSxLQUFBO0FBQ0E7O0FDbkRBOztJQUVBLEk7QUFDQSxrQkFBQSxLQUFBLEVBQUE7QUFBQTs7QUFDQSxhQUFBLEtBQUEsR0FBQSxLQUFBO0FBQ0E7Ozs7a0NBRUE7QUFDQSxpQkFBQSxLQUFBLEdBQUEsRUFBQSxPQUFBLENBQUEsS0FBQSxLQUFBLENBQUE7QUFDQSxtQkFBQSxJQUFBO0FBQ0E7OztvQ0FFQTtBQUNBLG1CQUFBLEtBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0E7Ozs2QkFFQSxHLEVBQUE7QUFDQSxtQkFBQSxLQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLEdBQUEsQ0FBQTtBQUNBOzs7K0JBRUEsSyxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBO0FBQ0EsbUJBQUEsSUFBQTtBQUNBOzs7Ozs7QUN2QkE7Ozs7SUFJQSxJO0FBQ0Esa0JBQUEsSUFBQSxFQUFBO0FBQUE7O0FBQ0EsYUFBQSxJQUFBLEdBQUEsSUFBQTtBQUNBLGFBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLEtBQUEsR0FBQSxJQUFBLEtBQUEsR0FBQSxTQUFBLEVBQUE7QUFDQSxhQUFBLE9BQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxnQkFBQSxHQUFBLENBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxRQUFBLEVBQUEsT0FBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLFFBQUEsQ0FBQTs7QUFFQSxhQUFBLFVBQUEsQztBQUNBLGFBQUEsY0FBQSxHQUFBLEVBQUEsQztBQUNBLGFBQUEsTUFBQSxHQUFBLEVBQUEsQztBQUNBLGFBQUEsS0FBQTtBQUNBOzs7OzJDQUVBO0FBQ0EsZ0JBQUEsS0FBQSxVQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLGNBQUEsQ0FBQSxLQUFBLFVBQUEsQ0FBQTtBQUNBOzs7eUNBRUE7QUFDQSxpQkFBQSxPQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsTUFBQTtBQUFBLHVCQUFBLE9BQUEsVUFBQSxDQUFBLE1BQUEsQ0FBQTtBQUFBLGFBQUE7QUFDQTs7O3NDQUVBO0FBQ0EsZ0JBQUEsbUJBQUEsRUFBQTtBQUNBLGlCQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxvQkFBQSxDQUFBLE9BQUEsT0FBQSxJQUFBLE9BQUEsS0FBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLEVBQUE7QUFDQSxxQ0FBQSxJQUFBLENBQUEsT0FBQSxLQUFBO0FBQ0EsbUNBQUEsSUFBQTtBQUNBO0FBQ0EsYUFMQTtBQU1BLG1CQUFBLGdCQUFBO0FBQ0E7OztvQ0FFQTtBQUNBLG1CQUFBLGFBQUEsTUFBQSxJQUFBLENBQUE7QUFDQTs7Ozs7O3lDQUdBO0FBQ0EsZ0JBQUEsV0FBQSxLQUFBLGNBQUEsRUFBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0Esb0JBQUEsU0FBQSxLQUFBLFVBQUEsR0FBQSxDQUFBO0FBQ0EsdUJBQUEsQ0FBQSxLQUFBLGNBQUEsQ0FBQSxTQUFBLENBQUEsRUFBQSxPQUFBLEVBQUE7QUFDQTtBQUNBO0FBQ0EscUJBQUEsVUFBQSxHQUFBLE1BQUE7QUFDQSxhQU5BLE1BTUE7QUFDQSxxQkFBQSxVQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQSxtQkFBQSxLQUFBLGdCQUFBLEVBQUE7QUFDQTs7OzZCQUVBLEcsRUFBQTtBQUNBLGdCQUFBLFFBQUEsRUFBQTtBQUNBLGlCQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0Esb0JBQUEsT0FBQSxLQUFBLElBQUEsQ0FBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxxQkFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSw0QkFBQSxHQUFBLENBQUEsZUFBQTtBQUNBLGlCQUZBO0FBR0EseUJBQUEsSUFBQTtBQUNBO0FBQ0EsbUJBQUEsS0FBQTtBQUNBOzs7Ozs7Z0NBR0E7QUFBQTs7QUFDQSxpQkFBQSxPQUFBLENBQUEsT0FBQSxDQUFBLGtCQUFBOzs7QUFHQSxzQkFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsS0FBQSxFQUFBLE9BQUE7QUFDQSx1QkFBQSxLQUFBLEdBQUEsRUFBQTs7QUFFQSx1QkFBQSxPQUFBLEdBQUEsSUFBQTtBQUNBLGFBUEE7QUFRQTs7Ozs7Ozs7Ozs7QUFPQSxJQUFBLGFBQUEsU0FBQSxVQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsV0FBQSxRQUFBLE1BQUEsQ0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGVBQUEsT0FBQSxPQUFBO0FBQ0EsS0FGQSxDQUFBO0FBR0EsQ0FKQTs7QUNyRkEsTUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsYUFBQSxpQkFEQTtBQUVBLHFCQUFBLDRCQUZBO0FBR0Esb0JBQUE7QUFIQSxLQUFBO0FBS0EsQ0FOQTs7QUFRQSxNQUFBLFVBQUEsQ0FBQSxVQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQSxZQUFBLEVBQUEsZUFBQSxFQUFBLGNBQUEsRUFBQTtBQUNBLFdBQUEsSUFBQSxHQUFBO0FBQ0Esa0JBQUEsRUFEQTtBQUVBLGVBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBO0FBR0Esa0JBQUE7QUFIQSxLQUFBOztBQU9BLFFBQUEsTUFBQSxTQUFBLFFBQUEsR0FBQSxHQUFBLEVBQUE7QUFDQSxRQUFBLE1BQUEsZ0JBQUEsR0FBQSxDQUFBO0FBQ0EsUUFBQSxVQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxLQUFBLENBQUEsYUFBQSxRQUFBLENBQUE7O0FBRUEsUUFBQSxVQUFBLFFBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQTtBQUNBLFFBQUEsYUFBQSxRQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUE7QUFDQSxRQUFBLGFBQUEsUUFBQSxLQUFBLENBQUEsa0JBQUEsQ0FBQTtBQUNBLFFBQUEsVUFBQSxlQUFBLE9BQUEsQ0FBQTtBQUNBLFFBQUEscUJBQUEsZUFBQSxVQUFBLENBQUE7O0FBRUEsUUFBQSxTQUFBLE9BQUEsTUFBQSxDQUFBLE9BQUEsU0FBQSxDQUFBOzs7Ozs7O0FBT0EsV0FBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsYUFBQSxRQUFBLENBQUE7OztBQUdBLFlBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTs7QUFFQSxlQUFBLElBQUEsQ0FBQSxJQUFBLEdBQUEsT0FBQSxDOzs7QUFJQSxtQkFBQSxFQUFBLENBQUEsT0FBQSxFQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsY0FBQSxLQUFBLEdBQUEsRUFBQSxDOzs7QUFHQSxpQkFBQSxJQUFBLFVBQUEsSUFBQSxXQUFBLEVBQUE7QUFDQSxvQkFBQSxtQkFBQSxFQUFBLGdCQUFBOzs7QUFHQSxvQkFBQSxjQUFBLE9BQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBO0FBQ0EsMENBQUEsT0FBQTtBQUNBLDRCQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsbUJBQUE7QUFDQSwyQkFBQSxLQUFBLEdBQUEsS0FBQSxZQUFBLFVBQUEsRUFBQSxHQUFBO0FBQ0EsaUJBSkEsQ0FBQTs7O0FBT0Esb0JBQUEsQ0FBQSxXQUFBLEVBQUE7QUFDQSw0QkFBQSxHQUFBLENBQUEsOEJBQUE7QUFDQSxrQ0FBQSxJQUFBLE1BQUEsQ0FBQSxZQUFBLFVBQUEsRUFBQSxHQUFBLENBQUE7QUFDQSx1Q0FBQSxJQUFBO0FBQ0E7OztBQUdBLHFCQUFBLElBQUEsY0FBQSxJQUFBLFlBQUEsVUFBQSxDQUFBLEVBQUE7QUFDQSxnQ0FBQSxjQUFBLElBQUEsWUFBQSxVQUFBLEVBQUEsY0FBQSxDQUFBO0FBQ0E7OztBQUdBLG9CQUFBLGdCQUFBLEVBQUEsT0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLEVBQUEsS0FDQSxPQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsbUJBQUEsSUFBQSxXQUFBO0FBQ0Esd0JBQUEsR0FBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLE9BQUE7QUFDQTtBQUNBLFNBL0JBO0FBaUNBLEtBdkNBOzs7OztBQTRDQSxRQUFBLGFBQUEsZUFBQSxVQUFBLENBQUEsQzs7O0FBR0EsZUFBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZUFBQSxJQUFBLENBQUEsZ0JBQUEsR0FBQSxLQUFBLENBQUEsQ0FBQTtBQUNBLEtBRkE7OztBQUtBLGVBQUEsRUFBQSxDQUFBLGVBQUEsRUFBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGVBQUEsSUFBQSxDQUFBLGdCQUFBLEdBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxLQUZBOzs7QUFLQSxhQUFBLElBQUEsR0FBQSxrQkFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBOzs7QUFHQSwyQkFBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsWUFBQSxJQUFBOztBQUVBLGdCQUFBLElBQUEsRUFBQTtBQUNBLG9CQUFBLGFBQUEsS0FBQSxHQUFBO0FBQ0Esb0JBQUEsS0FBQSxVQUFBLE1BQUEsQ0FBQTtBQUFBLDJCQUFBLE9BQUEsR0FBQSxLQUFBLFVBQUE7QUFBQSxpQkFBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLG9CQUFBLEVBQUEsRUFBQTtBQUNBLDJCQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0E7QUFDQSxvQkFBQSxPQUFBLEVBQUEsQ0FBQSxNQUFBLEtBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLE1BQUEsR0FBQSxJQUFBO0FBQ0EsYUFQQSxNQU9BOztBQUVBLHdCQUFBLEdBQUEsQ0FBQSxxQkFBQTtBQUNBO0FBQ0EsU0FkQTtBQWVBLEtBbEJBOzs7Ozs7QUF5QkEsV0FBQSxVQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsTUFBQSxHQUFBLE1BQUE7O0FBRUEsMkJBQUEsT0FBQSxHQUNBLElBREEsQ0FDQSxVQUFBLE9BQUEsRUFBQTtBQUNBLGdCQUFBLEtBQUE7O0FBRUEsb0JBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUEsR0FBQSxLQUFBLE9BQUEsRUFBQSxDQUFBLEdBQUEsRUFBQSxRQUFBLENBQUE7QUFDQSxhQUZBOztBQUlBLCtCQUFBLEtBQUEsRUFBQSxNQUFBLEdBQUEsTUFBQTtBQUNBLCtCQUFBLEtBQUEsQ0FBQSxLQUFBO0FBQ0EsU0FWQTs7QUFZQSxZQUFBLE1BQUEsT0FBQSxJQUFBLENBQUEsZ0JBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBOztBQUVBLG1CQUFBLENBQUEsRUFBQSxNQUFBLENBQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsbUJBQUEsS0FBQSxDQUFBLENBQUEsRUFDQSxJQURBLENBQ0EsVUFBQSxHQUFBLEVBQUE7QUFDQSxvQkFBQSxHQUFBLENBQUEsMkJBQUE7QUFDQSxvQkFBQSxHQUFBLENBQUEsSUFBQSxHQUFBO0FBQ0EsU0FKQTtBQUtBLEtBeEJBOzs7Ozs7QUErQkEsV0FBQSxXQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBOztBQUVBLDJCQUFBLE9BQUEsR0FDQSxJQURBLENBQ0EsVUFBQSxPQUFBLEVBQUE7QUFDQSxvQkFBQSxHQUFBLENBQUEsU0FBQSxFQUFBLE9BQUE7QUFDQSxnQkFBQSxLQUFBO0FBQ0Esb0JBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUEsR0FBQSxLQUFBLE9BQUEsRUFBQSxDQUFBLEdBQUEsRUFBQSxRQUFBLENBQUE7QUFDQSx3QkFBQSxHQUFBLENBQUEsZ0JBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxHQUFBLEVBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQTtBQUNBLGFBSEE7O0FBS0EsbUJBQUEsV0FBQSxDQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsbUJBQUEsS0FBQSxDQUFBO0FBQ0EsK0JBQUEsS0FBQSxFQUFBLEtBQUEsR0FBQSxPQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBOztBQUVBLG1CQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxJQUFBLG1CQUFBLEtBQUEsQ0FBQSxDOztBQUVBLCtCQUFBLEtBQUEsQ0FBQSxLQUFBO0FBQ0EsU0FmQTtBQWdCQSxLQWxCQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtEQSxXQUFBLGFBQUEsR0FBQSxPQUFBLElBQUEsQ0FBQSxnQkFBQSxFQUFBOzs7QUFHQSxXQUFBLE1BQUE7QUFDQSxRQUFBLHdCQUFBLEVBQUE7O0FBRUEsV0FBQSxLQUFBLEdBQUEsWUFBQTs7QUFFQSxLQUZBOztBQUlBLFdBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxlQUFBLEVBQUEsS0FBQSxPQUFBLGFBQUE7QUFDQSxLQUZBOzs7QUFLQSxXQUFBLFlBQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGdCQUFBLEdBQUEsQ0FBQSxpQkFBQTtBQUNBLGFBQUEsUUFBQTtBQUNBLFlBQUEsS0FBQSxRQUFBLEtBQUEsQ0FBQSxFQUFBLEtBQUEsUUFBQSxHQUFBLENBQUE7QUFDQSxLQUpBOztBQU1BLFdBQUEsYUFBQSxHQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsYUFBQSxRQUFBO0FBQ0EsWUFBQSxLQUFBLFFBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxLQUFBLFFBQUEsR0FBQSxDQUFBO0FBQ0EsS0FIQTs7O0FBTUEsV0FBQSxTQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUE7O0FBRUEsWUFBQSxLQUFBLFFBQUEsR0FBQSxDQUFBLEVBQUE7QUFDQSxpQkFBQSxLQUFBLEdBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsVUFBQSxFQUFBO0FBQ0EsNkJBQUEsYUFBQSxDQUFBO0FBQ0Esb0JBQUEsZUFBQSxDQUFBLEVBQUEsYUFBQSxDQUFBO0FBQ0Esb0JBQUEsZUFBQSxDQUFBLEVBQUEsYUFBQSxDQUFBO0FBQ0EsdUJBQUEsVUFBQTtBQUNBLGFBTEEsQ0FBQTtBQU1BLGlCQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxTQVRBLE1BU0EsSUFBQSxLQUFBLFFBQUEsR0FBQSxDQUFBLEVBQUE7QUFDQSxpQkFBQSxLQUFBLEdBQUEsS0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsVUFBQSxFQUFBO0FBQ0EsNkJBQUEsYUFBQSxDQUFBO0FBQ0Esb0JBQUEsZUFBQSxDQUFBLENBQUEsRUFBQSxhQUFBLENBQUE7QUFDQSxvQkFBQSxlQUFBLENBQUEsQ0FBQSxFQUFBLGFBQUEsQ0FBQTtBQUNBLHVCQUFBLFVBQUE7QUFDQSxhQUxBLENBQUE7QUFNQSxpQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLGlCQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0E7O0FBRUEsWUFBQSxxQkFBQSxlQUFBLFVBQUEsQ0FBQTtBQUNBLDJCQUFBLE9BQUEsR0FDQSxJQURBLENBQ0EsVUFBQSxPQUFBLEVBQUE7QUFDQSxnQkFBQSxLQUFBO0FBQ0Esb0JBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUEsR0FBQSxLQUFBLE9BQUEsRUFBQSxDQUFBLEdBQUEsRUFBQSxRQUFBLENBQUE7QUFDQSxhQUZBOztBQUlBLG1CQUFBLFNBQUEsQ0FBQSxJQUFBLEVBQUEsbUJBQUEsS0FBQSxDQUFBOztBQUVBLGlCQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsSUFBQSxLQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0Esb0JBQUEsbUJBQUEsS0FBQSxFQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxDQUFBLE1BQUEsR0FBQSxFQUFBO0FBQ0EsdUNBQUEsS0FBQSxFQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQTtBQUNBLG1DQUFBLEtBQUEsRUFBQSxTQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsRUFBQSxTQUFBLENBQUEsSUFBQSxDQUFBLG1CQUFBLEtBQUEsRUFBQSxTQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsbUNBQUEsS0FBQSxDQUFBLEtBQUE7QUFDQTs7QUFFQSwrQkFBQSxLQUFBLEVBQUEsS0FBQSxHQUFBLG1CQUFBLEtBQUEsRUFBQSxTQUFBLENBQUEsTUFBQSxDQUFBLG1CQUFBLEtBQUEsRUFBQSxvQkFBQSxDQUFBO0FBQ0EsK0JBQUEsS0FBQSxDQUFBLEtBQUE7QUFDQSxTQW5CQTs7O0FBdUJBLGlCQUFBLElBQUEsQ0FBQTtBQUNBLG9CQUFBLFdBREE7QUFFQSxvQkFBQSxJQUZBO0FBR0EseUJBQUEsT0FBQSxFQUFBLENBQUE7QUFIQSxTQUFBOztBQU9BLDJCQUFBLE9BQUEsR0FDQSxJQURBLENBQ0EsVUFBQSxPQUFBLEVBQUE7QUFDQSxvQkFBQSxPQUFBLENBQUEsVUFBQSxDQUFBLEVBQUE7QUFDQSx3QkFBQSxHQUFBLENBQUEsR0FBQSxFQUFBLEVBQUEsS0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE2QkEsYUE5QkE7QUErQkEsU0FqQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQStFQSxLQXBJQTs7O0FBdUlBLFdBQUEsU0FBQTs7O0FBR0EsV0FBQSxLQUFBLEdBQUEsWUFBQTtBQUNBLG1CQUFBLE9BQUEsQ0FBQSxDQUFBLEVBQ0EsSUFEQSxDQUNBLFVBQUEsR0FBQSxFQUFBO0FBQ0Esb0JBQUEsR0FBQSxDQUFBLHFCQUFBLEVBQUEsSUFBQSxHQUFBO0FBQ0EsU0FIQTs7QUFLQSxnQkFBQSxPQUFBLENBQUEsQ0FBQSxFQUNBLElBREEsQ0FDQSxVQUFBLEdBQUEsRUFBQTtBQUNBLG9CQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsR0FBQTtBQUNBLFNBSEE7O0FBS0EsWUFBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsUUFBQSxLQUFBLEtBQUE7QUFDQSxnQkFBQSxPQUFBLElBQUEsSUFBQSxDQUFBLEtBQUEsRUFBQSxPQUFBLEdBQUEsS0FBQTtBQUNBLGdCQUFBLGlCQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxLQUFBLENBQUEsYUFBQSxRQUFBLEVBQUEsS0FBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLDJCQUFBLGNBQUEsRUFBQSxJQUFBLENBQUEsSUFBQTtBQUNBLFNBTEE7O0FBU0EsWUFBQSxvQkFBQSxJQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsS0FBQSxDQUFBLGFBQUEsUUFBQSxFQUFBLEtBQUEsQ0FBQSxrQkFBQSxDQUFBO0FBQ0EsdUJBQUEsaUJBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQSxLQUFBLEVBQUEsUUFBQSxFQUFBLFFBQUEsRUFBQSxPQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsUUFBQSxDQUFBOztBQUdBLFlBQUEsVUFBQSxlQUFBLFVBQUEsQ0FBQTtBQUNBLGdCQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxpQkFBQSxJQUFBLElBQUEsQ0FBQSxFQUFBLElBQUEsS0FBQSxNQUFBLEVBQUEsR0FBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxFQUFBLE9BQUEsR0FBQSxJQUFBO0FBQ0EscUJBQUEsQ0FBQSxFQUFBLE1BQUEsR0FBQSxHQUFBO0FBQ0EscUJBQUEsQ0FBQSxFQUFBLFNBQUEsR0FBQSxHQUFBO0FBQ0EscUJBQUEsQ0FBQSxFQUFBLG9CQUFBLEdBQUEsR0FBQTtBQUNBLHFCQUFBLENBQUEsRUFBQSxLQUFBLEdBQUEsR0FBQTtBQUNBLHFCQUFBLENBQUEsRUFBQSxLQUFBLEdBQUEsR0FBQTtBQUNBLHdCQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQSxTQVZBOztBQVlBLGdCQUFBLEdBQUEsQ0FBQSxPQUFBLEVBQUE7QUFFQSxLQXZDQTs7QUEwQ0EsV0FBQSxRQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQURBLEVBRUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQSxFQUdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEEsRUFJQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUpBLEVBS0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FMQSxFQU1BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTkEsRUFPQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVBBLEVBUUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FSQSxFQVNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVEEsRUFVQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVZBLEVBV0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FYQSxFQVlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWkEsQ0FBQTtBQWNBLFdBQUEsU0FBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUhBLEVBSUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FKQSxFQUtBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQU5BLEVBT0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FQQSxFQVFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUkEsRUFTQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVRBLEVBVUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FWQSxFQVdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWEEsRUFZQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVpBLENBQUE7QUFjQSxXQUFBLFdBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBLEVBR0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQSxFQUlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSkEsRUFLQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUxBLEVBTUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FOQSxFQU9BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBUEEsRUFRQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVJBLEVBU0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FUQSxFQVVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVkEsRUFXQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVhBLEVBWUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FaQSxDQUFBO0FBY0EsV0FBQSxVQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQURBLEVBRUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FGQSxFQUdBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEEsRUFJQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUpBLEVBS0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FMQSxFQU1BLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBTkEsRUFPQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVBBLEVBUUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FSQSxFQVNBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBVEEsRUFVQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQVZBLEVBV0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FYQSxFQVlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBWkEsQ0FBQTtBQWNBLENBdGNBOztBQ1JBLE1BQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLGFBQUEsV0FEQTtBQUVBLHFCQUFBLG9DQUZBO0FBR0Esb0JBQUE7QUFIQSxLQUFBO0FBS0EsQ0FOQTs7QUFRQSxNQUFBLFVBQUEsQ0FBQSxVQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBLGVBQUEsRUFBQSxNQUFBLEVBQUEsYUFBQSxFQUFBLGNBQUEsRUFBQTs7QUFFQSxRQUFBLE1BQUEsU0FBQSxRQUFBLEdBQUEsR0FBQSxFQUFBO0FBQ0EsUUFBQSxNQUFBLGdCQUFBLEdBQUEsQ0FBQTs7QUFFQSxRQUFBLE9BQUEsZUFBQTtBQUNBLFFBQUEsZUFBQSxLQUFBLFFBQUEsRUFBQTs7QUFFQSxRQUFBLFdBQUEsSUFBQSxLQUFBLENBQUEsT0FBQSxDQUFBO0FBQ0EsUUFBQSxrQkFBQSxnQkFBQSxRQUFBLENBQUE7Ozs7QUFJQSxvQkFBQSxPQUFBLENBQUEsTUFBQSxFQUFBLFVBQUEsRUFDQSxJQURBLENBQ0EsWUFBQTtBQUNBLFlBQUEsV0FBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsSUFBQSxPQUFBLFFBQUEsRUFBQTtBQUNBLHFCQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxPQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBO0FBQ0EsZUFBQSxTQUFBLEdBQUEsU0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsS0FQQTs7QUFZQSxXQUFBLElBQUEsR0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLFlBQUEsY0FBQSxJQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsS0FBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLFlBQUEsYUFBQSxZQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUE7O0FBRUEsaUJBQUEsSUFBQSxHQUFBLGtCQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxnQkFBQSxxQkFBQSxlQUFBLFVBQUEsQ0FBQTs7QUFFQSwrQkFBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0Esb0JBQUEsWUFBQSxJQUFBOztBQUVBLG9CQUFBLElBQUEsRUFBQTtBQUNBLHdCQUFBLENBQUEsVUFBQSxNQUFBLENBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSwrQkFBQSxPQUFBLEdBQUEsS0FBQSxLQUFBLEdBQUE7QUFDQSxxQkFGQSxFQUVBLE1BRkEsRUFFQTtBQUNBLDRCQUFBLFlBQUEsSUFBQSxNQUFBLENBQUEsS0FBQSxHQUFBLENBQUE7QUFDQSx1Q0FBQSxVQUFBLEVBQUEsSUFBQSxDQUFBLFNBQUE7QUFDQTtBQUNBLGlCQVBBLE1BT0E7O0FBRUEsNEJBQUEsR0FBQSxDQUFBLFNBQUE7QUFDQTtBQUNBLGFBZEEsRUFlQSxJQWZBLENBZUEsWUFBQTtBQUNBLHVCQUFBLEVBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxnQ0FBQTtBQURBLGlCQUFBO0FBR0EsYUFuQkE7QUFvQkEsU0F2QkE7QUF3QkEsS0E1QkE7QUE2QkEsQ0F0REE7O0FDUkEsTUFBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsYUFBQSxRQURBO0FBRUEscUJBQUEsOEJBRkE7QUFHQSxvQkFBQTtBQUhBLEtBQUE7QUFLQSxDQU5BOztBQVFBLE1BQUEsVUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsYUFBQSxFQUFBLFVBQUEsRUFBQTtBQUNBLFFBQUEsT0FBQSxlQUFBOztBQUVBLFdBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxhQUFBLGdCQUFBLENBQUEsUUFBQSxFQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLG9CQUFBLEdBQUEsQ0FBQSxlQUFBLEVBQUEsUUFBQTtBQUNBLHVCQUFBLFdBQUEsR0FBQSxRQUFBO0FBQ0EsbUJBQUEsRUFBQSxDQUFBLFVBQUE7QUFDQSxTQUpBLEVBSUEsS0FKQSxDQUlBLFVBQUEsS0FBQSxFQUFBO0FBQ0Esb0JBQUEsS0FBQSxDQUFBLHdCQUFBLEVBQUEsS0FBQTtBQUNBLFNBTkE7QUFRQSxLQVRBO0FBV0EsQ0FkQTs7QUNSQSxNQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxhQUFBLFdBREE7QUFFQSxxQkFBQSxvQ0FGQTtBQUdBLG9CQUFBO0FBSEEsS0FBQTtBQUtBLENBTkE7O0FBUUEsTUFBQSxVQUFBLENBQUEsY0FBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxjQUFBLEVBQUEsZUFBQSxFQUFBO0FBQ0EsUUFBQSxNQUFBLFNBQUEsUUFBQSxHQUFBLEdBQUEsRUFBQTtBQUNBLFFBQUEsTUFBQSxnQkFBQSxHQUFBLENBQUE7O0FBR0EsV0FBQSxVQUFBLEdBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxZQUFBLGNBQUEsSUFBQSxLQUFBLENBQUEsT0FBQSxFQUFBLEtBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxZQUFBLGFBQUEsWUFBQSxLQUFBLENBQUEsU0FBQSxDQUFBOztBQUVBLHVCQUFBLFdBQUEsRUFBQSxJQUFBLENBQUE7QUFDQSx3QkFBQTtBQURBLFNBQUE7O0FBSUEsaUJBQUEsSUFBQSxHQUFBLGtCQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxnQkFBQSxJQUFBLEVBQUE7QUFDQSxvQkFBQSxZQUFBLElBQUEsTUFBQSxDQUFBLEtBQUEsR0FBQSxDQUFBO0FBQ0EsK0JBQUEsVUFBQSxFQUFBLElBQUEsQ0FBQSxTQUFBO0FBQ0EsYUFIQSxNQUdBO0FBQ0Esd0JBQUEsR0FBQSxDQUFBLGtCQUFBO0FBQ0E7QUFDQSxTQVBBOztBQVNBLFlBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGdCQUFBLFFBQUEsS0FBQSxLQUFBO0FBQ0EsZ0JBQUEsT0FBQSxJQUFBLElBQUEsQ0FBQSxLQUFBLEVBQUEsT0FBQSxHQUFBLEtBQUE7QUFDQSxnQkFBQSxVQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxLQUFBLENBQUEsUUFBQSxFQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUE7QUFDQSwyQkFBQSxPQUFBLEVBQUEsSUFBQSxDQUFBLElBQUE7QUFDQSxTQUxBOztBQVFBLFlBQUEsb0JBQUEsSUFBQSxLQUFBLENBQUEsT0FBQSxFQUFBLEtBQUEsQ0FBQSxRQUFBLEVBQUEsS0FBQSxDQUFBLGtCQUFBLENBQUE7QUFDQSx1QkFBQSxpQkFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsUUFBQSxFQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxRQUFBLENBQUE7O0FBR0EsZUFBQSxFQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0Esd0JBQUE7QUFEQSxTQUFBO0FBR0EsS0FoQ0E7O0FBa0NBLFdBQUEsWUFBQSxHQUFBLFlBQUE7QUFDQSxlQUFBLEVBQUEsQ0FBQSxVQUFBO0FBQ0EsS0FGQTtBQUdBLENBMUNBOztBQ1JBOztBQUVBLFNBQUEsTUFBQSxDQUFBLEdBQUEsRUFBQTs7QUFFQSxTQUFBLEdBQUEsR0FBQSxHQUFBOztBQUVBLFNBQUEsTUFBQSxHQUFBLEdBQUE7OztBQUdBLFNBQUEsS0FBQSxHQUFBLEdBQUE7Ozs7QUFJQSxTQUFBLFNBQUEsR0FBQSxHQUFBOzs7QUFHQSxTQUFBLG9CQUFBLEdBQUEsR0FBQTs7O0FBR0EsU0FBQSxLQUFBLEdBQUEsR0FBQTs7O0FBR0EsU0FBQSxPQUFBLEdBQUEsSUFBQTtBQUNBO0FBQ0EsT0FBQSxTQUFBLENBQUEsRUFBQSxHQUFBLFlBQUE7QUFDQSxZQUFBLEdBQUEsQ0FBQSxJQUFBO0FBQ0EsQ0FGQTs7QUFJQSxPQUFBLFNBQUEsQ0FBQSxXQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQTs7QUFFQSxRQUFBLElBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLElBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLGNBQUEsTUFBQSxDQUFBLENBQUE7O0FBRUEsU0FBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxTQUFBLEtBQUEsQ0FBQSxTQUFBLEdBQUEsSUFBQTs7O0FBR0EsU0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBOzs7QUFHQSxTQUFBLG9CQUFBLEdBQUEsS0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQTtBQUNBLENBZEE7O0FBZ0JBLE9BQUEsU0FBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsUUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLEVBQUE7QUFDQSxlQUFBLE1BQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQ0EsS0FGQSxNQUVBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsSUFBQSxLQUFBLG9CQUFBLEtBQUEsQ0FBQSxFQUFBO0FBQ0EsZUFBQSxNQUFBLFNBQUEsQ0FBQSxFQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLEtBRkEsTUFFQSxJQUFBLEtBQUEsb0JBQUEsS0FBQSxDQUFBLElBQUEsS0FBQSxvQkFBQSxLQUFBLENBQUEsRUFBQTtBQUNBLGVBQUEsTUFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLENBQUE7QUFDQSxLQUZBLE1BRUE7QUFDQSxlQUFBLE1BQUEsU0FBQSxDQUFBLEVBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0E7QUFDQSxDQVZBOzs7QUFhQSxPQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsU0FBQSxLQUFBLEdBQUEsS0FBQSxLQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLEVBQUEsS0FBQSxLQUFBLEVBQUE7QUFDQSxLQUZBLENBQUE7O0FBSUEsU0FBQSxTQUFBLENBQUEsT0FBQSxHQUFBLEtBQUEsUUFBQTtBQUVBLENBUEE7O0FBU0EsT0FBQSxTQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsT0FBQSxFQUFBOztBQUVBLFFBQUEsWUFBQSxRQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxlQUFBLENBQUEsU0FBQSxTQUFBLElBQUEsYUFBQSxHQUFBO0FBQ0EsS0FGQSxFQUVBLENBRkEsQ0FBQTtBQUdBLFlBQUEsR0FBQSxDQUFBLFdBQUEsRUFBQSxTQUFBO0FBQ0EsV0FBQSxTQUFBO0FBQ0EsQ0FQQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF3QkEsT0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsUUFBQSxlQUFBLEtBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxlQUFBLFNBQUEsU0FBQTtBQUNBLEtBRkEsQ0FBQTs7QUFJQSxRQUFBLEtBQUEsS0FBQSxDQUFBLElBQUEsSUFBQSxhQUFBLE1BQUEsS0FBQSxDQUFBLEVBQUEsS0FBQSxHQUFBO0FBQ0EsQ0FOQTs7QUFRQSxPQUFBLFNBQUEsQ0FBQSxHQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsT0FBQSxHQUFBLEtBQUE7O0FBRUEsQ0FIQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIHRzdXJvID0gYW5ndWxhci5tb2R1bGUoJ1RzdXJvJywgWyd1aS5yb3V0ZXInLCAnZmlyZWJhc2UnXSk7XG5cbnRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNvbmZpZyA9IHtcbiAgICAgICAgYXBpS2V5OiBcIkFJemFTeUNMbTNqa2s1cHBNcWVReEtvSC1kWjlDZFlNYURHV1dxVVwiLFxuICAgICAgICBhdXRoRG9tYWluOiBcInRoZS1wYXRocy1vZi1kcmFnb25zLmZpcmViYXNlYXBwLmNvbVwiLFxuICAgICAgICBkYXRhYmFzZVVSTDogXCJodHRwczovL3RoZS1wYXRocy1vZi1kcmFnb25zLmZpcmViYXNlaW8uY29tXCIsXG4gICAgICAgIHN0b3JhZ2VCdWNrZXQ6IFwidGhlLXBhdGhzLW9mLWRyYWdvbnMuYXBwc3BvdC5jb21cIixcbiAgICB9O1xuICAgIGZpcmViYXNlLmluaXRpYWxpemVBcHAoY29uZmlnKTtcbn0pO1xuXG50c3Vyby5jb25zdGFudCgnZmlyZWJhc2VVcmwnLCAnaHR0cHM6Ly9wYXRoLW9mLXRoZS1kcmFnb24uZmlyZWJhc2Vpby5jb20vJyk7XG5cbnRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xufSk7XG4iLCJmdW5jdGlvbiBCb2FyZCgpIHtcbiAgICB0aGlzLmJvYXJkID0gW107XG59XG5cbkJvYXJkLnByb3RvdHlwZS5kcmF3Qm9hcmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCA2OyB5KyspIHtcbiAgICAgICAgaWYgKCF0aGlzLmJvYXJkW3ldKSB0aGlzLmJvYXJkW3ldID0gW107XG4gICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgNjsgeCsrKSB7XG4gICAgICAgICAgICB0aGlzLmJvYXJkW3ldLnB1c2gobmV3IFNwYWNlKHgsIHksIHRoaXMuYm9hcmQpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5ib2FyZDtcbn1cblxuZnVuY3Rpb24gU3BhY2UoeCwgeSwgYm9hcmQpIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgdGhpcy5pbWFnZSA9IFwiblwiO1xuICAgIHRoaXMucG9pbnRzID0gW251bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGxdO1xuICAgIHRoaXMudGlsZVVybCA9IFwiblwiO1xuICAgIHRoaXMudGlsZUlkID0gXCJuXCI7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICBsZXQgY29ycmVzcG9uZGluZztcblxuICAgICAgICBpZiAoaSA8IDIpIHsgLy90b3BcbiAgICAgICAgICAgIGNvcnJlc3BvbmRpbmcgPSBpID09PSAwID8gNSA6IDQ7IC8vIDAgLT4gNSAmIDEgLT4gNFxuICAgICAgICAgICAgaWYgKHkgPT09IDApIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KHRydWUpO1xuICAgICAgICAgICAgZWxzZSB0aGlzLnBvaW50c1tpXSA9IGJvYXJkW3kgLSAxXVt4XS5wb2ludHNbY29ycmVzcG9uZGluZ107XG4gICAgICAgIH0gZWxzZSBpZiAoaSA8IDQpIHsgLy9yaWdodFxuICAgICAgICAgICAgaWYgKHggPT09IDUpIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KHRydWUpO1xuICAgICAgICAgICAgZWxzZSB0aGlzLnBvaW50c1tpXSA9IG5ldyBQb2ludChmYWxzZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaSA8IDYpIHsgLy9ib3R0b21cbiAgICAgICAgICAgIGlmICh5ID09PSA1KSB0aGlzLnBvaW50c1tpXSA9IG5ldyBQb2ludCh0cnVlKTtcbiAgICAgICAgICAgIGVsc2UgdGhpcy5wb2ludHNbaV0gPSBuZXcgUG9pbnQoZmFsc2UpO1xuICAgICAgICB9IGVsc2UgeyAvL2xlZnRcbiAgICAgICAgICAgIGNvcnJlc3BvbmRpbmcgPSBpID09PSA2ID8gMyA6IDI7IC8vIDYgLT4gMyAmIDcgLT4gMlxuICAgICAgICAgICAgaWYgKHggPT09IDApIHRoaXMucG9pbnRzW2ldID0gbmV3IFBvaW50KHRydWUpO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb2ludHNbaV0gPSBib2FyZFt5XVt4IC0gMV0ucG9pbnRzW2NvcnJlc3BvbmRpbmddO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5cbi8vIGVkZ2UgPSBib29sZWFuXG5mdW5jdGlvbiBQb2ludChlZGdlKSB7XG4gICAgdGhpcy5lZGdlID0gZWRnZTtcbiAgICB0aGlzLm5laWdoYm9ycyA9IFtcIm5cIl07XG4gICAgdGhpcy50cmF2ZWxsZWQgPSBmYWxzZTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuY2xhc3MgRGVjayB7XG4gICAgY29uc3RydWN0b3IodGlsZXMpIHtcbiAgICAgICAgdGhpcy50aWxlcyA9IHRpbGVzXG4gICAgfVxuXG4gICAgc2h1ZmZsZSgpIHtcbiAgICAgICAgdGhpcy50aWxlcyA9IF8uc2h1ZmZsZSh0aGlzLnRpbGVzKVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBkZWFsVGhyZWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGVzLnNwbGljZSgwLCAzKTtcbiAgICB9XG5cbiAgICBkZWFsKG51bSkge1xuICAgICAgICByZXR1cm4gdGhpcy50aWxlcy5zcGxpY2UoMCwgbnVtKTtcbiAgICB9XG5cbiAgICByZWxvYWQodGlsZXMpIHtcbiAgICAgICAgdGhpcy50aWxlcy5wdXNoKHRpbGVzKVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vR0FNRS8vL1xuXG5jbGFzcyBHYW1lIHtcbiAgICBjb25zdHJ1Y3RvcihuYW1lKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuY291bnQgPSAzNTtcbiAgICAgICAgdGhpcy5ib2FyZCA9IG5ldyBCb2FyZCgpLmRyYXdCb2FyZCgpO1xuICAgICAgICB0aGlzLnBsYXllcnMgPSBbXTtcbiAgICAgICAgdGhpcy5hdmFpbGFibGVNYXJrZXJzID0gW1wicmVkXCIsIFwib3JhbmdlXCIsIFwieWVsbG93XCIsIFwiZ3JlZW5cIiwgXCJhcXVhXCIsIFwiYmx1ZVwiLCBcIm5hdnlcIiwgXCJwdXJwbGVcIl1cblxuICAgICAgICB0aGlzLmN1cnJQbGF5ZXI7IC8vaW5kZXggb2YgdGhlIGN1cnJlbnRQbGF5ZXIgaW4gdGhlIHR1cm5PcmRlckFycmF5XG4gICAgICAgIHRoaXMudHVybk9yZGVyQXJyYXkgPSBbXSAvL2hvbGRzIGFsbCB0aGUgcGxheWVycyBzdGlsbCBvbiB0aGUgYm9hcmQuXG4gICAgICAgIHRoaXMuZHJhZ29uID0gXCJcIjsgLy8gUGxheWVyLk1hcmtlclxuICAgICAgICB0aGlzLm1vdmVzO1xuICAgIH1cblxuICAgIGdldEN1cnJlbnRQbGF5ZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJQbGF5ZXIgPT09IC0xKSByZXR1cm47XG4gICAgICAgIHJldHVybiB0aGlzLnR1cm5PcmRlckFycmF5W3RoaXMuY3VyclBsYXllcl07XG4gICAgfVxuXG4gICAgbW92ZUFsbFBsYXllcnMoKSB7XG4gICAgICAgIHRoaXMucGxheWVycy5mb3JFYWNoKChwbGF5ZXIpID0+IHBsYXllci5rZWVwTW92aW5nKHBsYXllcikpXG4gICAgfVxuXG4gICAgZGVhZFBsYXllcnMoKSB7XG4gICAgICAgIHZhciBkZWFkUGxheWVyc1RpbGVzID0gW107XG4gICAgICAgIHRoaXMucGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICAgICAgIGlmICghcGxheWVyLmNhblBsYXkgJiYgcGxheWVyLnRpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBkZWFkUGxheWVyc1RpbGVzLnB1c2gocGxheWVyLnRpbGVzKTtcbiAgICAgICAgICAgICAgICBpc0RlYWRQbGF5ZXIgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGRlYWRQbGF5ZXJzVGlsZXM7XG4gICAgfVxuXG4gICAgY2hlY2tPdmVyKCkge1xuICAgICAgICByZXR1cm4gZ2V0Q2FuUGxheSgpLmxlbmd0aCA8PSAxO1xuICAgIH1cblxuICAgIC8vdG8gYmUgY2FsbGVkIGF0IHRoZSBlbmQgb2YgYSB0dXJuIHRvIHNldCB0aGUgY3VyclBsYXllciB0byB0aGUgbmV4dCBlbGlnaWJsZSBwbGF5ZXIgaW4gdGhlIHR1cm5PcmRlckFycmF5XG4gICAgZ29Ub05leHRQbGF5ZXIoKSB7XG4gICAgICAgIGlmIChnZXRDYW5QbGF5KHRoaXMudHVybk9yZGVyQXJyYXkpLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIGxldCBuZXdJZHggPSB0aGlzLmN1cnJQbGF5ZXIgKyAxO1xuICAgICAgICAgICAgd2hpbGUgKCF0aGlzLnR1cm5PcmRlckFycmF5W25ld0lkeCAlIDhdLmNhblBsYXkpIHtcbiAgICAgICAgICAgICAgICBuZXdJZHgrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY3VyclBsYXllciA9IG5ld0lkeDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY3VyclBsYXllciA9IC0xO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmdldEN1cnJlbnRQbGF5ZXIoKTtcbiAgICB9XG5cbiAgICBkZWFsKG51bSl7XG4gICAgICAgIHZhciB0aWxlcyA9IFtdO1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgbnVtOyBpKyspeyBcbiAgICAgICAgICAgIHZhciB0aWxlID0gdGhpcy5kZWNrWzBdLnNwbGljZSgwLDEpO1xuICAgICAgICAgICAgdGhpcy5kZWNrLiRzYXZlKDApLnRoZW4oZnVuY3Rpb24ocmVmKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZGVhbHQgYSBjYXJkIScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aWxlcyArPSB0aWxlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aWxlcztcbiAgICB9XG5cbiAgICAvL3Jlc3RhcnQgdGhlIGdhbWVcbiAgICByZXNldCgpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgICAgIC8vcmV0cmlldmUgYWxsIHRpbGVzXG4gICAgICAgICAgICAvL3JldHVybiBwbGF5ZXIncyB0aWxlcyB0byB0aGUgZGVjayBhbmQgc2h1ZmZsZVxuICAgICAgICAgICAgdGhpcy5kZWNrLnJlbG9hZChwbGF5ZXIudGlsZXMpLnNodWZmbGUoKTtcbiAgICAgICAgICAgIHBsYXllci50aWxlcyA9IFtdO1xuICAgICAgICAgICAgLy9yZXNldCBhbGwgcGxheWVycyBwbGF5YWJpbGl0eVxuICAgICAgICAgICAgcGxheWVyLmNhblBsYXkgPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbn1cblxuLy8vLy9FTkQgT0YgR0FNRSBDTEFTUy8vLy8vXG5cbi8vZ2V0IEVsaWdpYmxlIHBsYXllcnNcbmxldCBnZXRDYW5QbGF5ID0gZnVuY3Rpb24gKHBsYXllcnMpIHtcbiAgICByZXR1cm4gcGxheWVycy5maWx0ZXIoKHBsYXllcikgPT4ge1xuICAgICAgICByZXR1cm4gcGxheWVyLmNhblBsYXlcbiAgICB9KVxufVxuIiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnZ2FtZScsIHtcblx0XHR1cmw6ICcvZ2FtZS86Z2FtZU5hbWUnLFxuXHRcdHRlbXBsYXRlVXJsOiAnL2Jyb3dzZXIvanMvZ2FtZS9nYW1lLmh0bWwnLFxuXHRcdGNvbnRyb2xsZXI6ICdnYW1lQ3RybCdcblx0fSk7XG59KTtcblxudHN1cm8uY29udHJvbGxlcignZ2FtZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkZmlyZWJhc2VBdXRoLCBmaXJlYmFzZVVybCwgJHN0YXRlUGFyYW1zLCAkZmlyZWJhc2VPYmplY3QsICRmaXJlYmFzZUFycmF5KSB7IFxuXHQkc2NvcGUudGlsZSA9IHtcblx0XHRpbWFnZVVybDogXCJcIixcblx0XHRwYXRoczogWzMsIDQsIDYsIDAsIDEsIDcsIDIsIDVdLFxuXHRcdHJvdGF0aW9uOiAwXG5cdH07XG5cblxuXHR2YXIgcmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcblx0dmFyIG9iaiA9ICRmaXJlYmFzZU9iamVjdChyZWYpO1xuXHR2YXIgZ2FtZVJlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZCgkc3RhdGVQYXJhbXMuZ2FtZU5hbWUpO1xuXG5cdHZhciBkZWNrUmVmID0gZ2FtZVJlZi5jaGlsZCgnZGVjaycpO1xuXHR2YXIgcGxheWVyc1JlZiA9IGdhbWVSZWYuY2hpbGQoJ3BsYXllcnMnKTtcblx0dmFyIG1hcmtlcnNSZWYgPSBnYW1lUmVmLmNoaWxkKCdhdmFpbGFibGVNYXJrZXJzJyk7XG5cdHZhciBkZWNrQXJyID0gJGZpcmViYXNlQXJyYXkoZGVja1JlZik7XG5cdHZhciBmaXJlYmFzZVBsYXllcnNBcnIgPSAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKTtcblxuXHR2YXIgcGxheWVyID0gT2JqZWN0LmNyZWF0ZShQbGF5ZXIucHJvdG90eXBlKTtcblxuXHQvKioqKioqKioqKioqKioqKlxuXHRJTklUSUFMSVpJTkcgR0FNRVxuXHQqKioqKioqKioqKioqKioqL1xuXG5cdC8vbmV3IGxvY2FsIGdhbWUgd2l0aCBnYW1lIG5hbWUgZGVmaW5lZCBieSB1cmxcblx0JHNjb3BlLmdhbWUgPSBuZXcgR2FtZSgkc3RhdGVQYXJhbXMuZ2FtZU5hbWUpO1xuXG5cdC8vd2hlbiB0aGUgZGVjayBpcyBsb2FkZWQuLi5cblx0ZGVja0Fyci4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuXHRcdC8vICRzY29wZS5nYW1lLmRlY2sgPSBkYXRhWzBdOyBcblx0XHQkc2NvcGUuZ2FtZS5kZWNrID0gZGVja0FycjsgLy9hZGQgdGhlIGRlY2sgdG8gdGhlIGxvY2FsIGdhbWUgPyBUcnkgdGhpcyBhcyBmaXJlYmFzZSBEZWNrQXJyPz8/P1xuXG5cblx0XHQvL2Rvbid0IHN0YXJ0IHdhdGNoaW5nIHBsYXllcnMgdW50aWwgdGhlcmUgaXMgYSBkZWNrIGluIHRoZSBnYW1lXG5cdFx0cGxheWVyc1JlZi5vbihcInZhbHVlXCIsIGZ1bmN0aW9uIChzbmFwKSB7XG5cdFx0XHR2YXIgc25hcFBsYXllcnMgPSBzbmFwLnZhbCgpOyAvL2dyYWIgdGhlIHZhbHVlIG9mIHRoZSBzbmFwc2hvdCAoYWxsIHBsYXllcnMgaW4gZ2FtZSBpbiBGaXJlYmFzZSlcblxuXHRcdFx0Ly9mb3IgZWFjaCBwbGF5ZXIgaW4gdGhpcyBjb2xsZWN0aW9uLi4uXG5cdFx0XHRmb3IgKHZhciB0aGlzUGxheWVyIGluIHNuYXBQbGF5ZXJzKSB7XG5cdFx0XHRcdHZhciBleGlzdGluZ1BsYXllckluZGV4LCB0aGlzSXNBTmV3UGxheWVyO1xuXG5cdFx0XHRcdC8vZmluZCB0aGlzICdzbmFwJyBwbGF5ZXIncyBpbmRleCBpbiBsb2NhbCBnYW1lLiBmaW5kIHJldHVybnMgdGhhdCB2YWx1ZS4gXG5cdFx0XHRcdHZhciBsb2NhbFBsYXllciA9ICRzY29wZS5nYW1lLnBsYXllcnMuZmluZChmdW5jdGlvbiAocGx5ciwgcGx5cklkeCkge1xuXHRcdFx0XHRcdGV4aXN0aW5nUGxheWVySW5kZXggPSBwbHlySWR4O1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCdlcGknLGV4aXN0aW5nUGxheWVySW5kZXgpO1xuXHRcdFx0XHRcdHJldHVybiBwbHlyLnVpZCA9PT0gc25hcFBsYXllcnNbdGhpc1BsYXllcl0udWlkO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQvL2lmIG5vdCBmb3VuZCwgY3JlYXRlIG5ldyBwbGF5ZXJcblx0XHRcdFx0aWYgKCFsb2NhbFBsYXllcikge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCdpIGRpZG50IGZpbmQgYSBsb2NhbCBwbGF5ZXIhJyk7XG5cdFx0XHRcdFx0bG9jYWxQbGF5ZXIgPSBuZXcgUGxheWVyKHNuYXBQbGF5ZXJzW3RoaXNQbGF5ZXJdLnVpZCk7XG5cdFx0XHRcdFx0dGhpc0lzQU5ld1BsYXllciA9IHRydWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL2ZvciBlYWNoIGtleSBpbiB0aGUgc25hcFBsYXllcidzIGtleXMsIGFkZCB0aGF0IGtleSBhbmQgdmFsdWUgdG8gbG9jYWwgcGxheWVyXG5cdFx0XHRcdGZvciAodmFyIHBsYXllcnByb3BlcnR5IGluIHNuYXBQbGF5ZXJzW3RoaXNQbGF5ZXJdKSB7XG5cdFx0XHRcdFx0bG9jYWxQbGF5ZXJbcGxheWVycHJvcGVydHldID0gc25hcFBsYXllcnNbdGhpc1BsYXllcl1bcGxheWVycHJvcGVydHldO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly9wdXNoIGxvY2FsIHBsYXllciB0byBnYW1lLnBsYXllcnNcblx0XHRcdFx0aWYgKHRoaXNJc0FOZXdQbGF5ZXIpICRzY29wZS5nYW1lLnBsYXllcnMucHVzaChsb2NhbFBsYXllcik7XG5cdFx0XHRcdGVsc2UgJHNjb3BlLmdhbWUucGxheWVyc1tleGlzdGluZ1BsYXllckluZGV4XSA9IGxvY2FsUGxheWVyO1xuXHRcdFx0XHRjb25zb2xlLmxvZygkc2NvcGUuZ2FtZS5wbGF5ZXJzKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHR9KTtcblxuXHQvLyBjb25zb2xlLmxvZygnZGVjaz8nLCAkc2NvcGUuZ2FtZS5kZWNrKTtcblx0Ly8gbG9jYWxQbGF5ZXIudGlsZXMgPSAkc2NvcGUuZ2FtZS5kZWFsKDMpO1xuXG5cdHZhciBtYXJrZXJzQXJyID0gJGZpcmViYXNlQXJyYXkobWFya2Vyc1JlZik7IC8vc3RvcmUgbWFya2VycyBhcnJheVxuXG5cdC8vd2hlbiB0aGF0IG1hcmtlcnMgYXJyYXkgaXMgbG9hZGVkLCB1cGRhdGUgdGhlIGF2YWlsYWJsZSBtYXJrZXJzIGFycmF5IG9uIHNjb3BlXG5cdG1hcmtlcnNBcnIuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcblx0XHQkc2NvcGUuZ2FtZS5hdmFpbGFibGVNYXJrZXJzID0gZGF0YVswXTtcblx0fSk7XG5cblx0Ly9pZiBzb21lb25lIGVsc2UgcGlja3MgYSBtYXJrZXIsIHVwZGF0ZSB5b3VyIHZpZXdcblx0bWFya2Vyc1JlZi5vbignY2hpbGRfY2hhbmdlZCcsIGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0JHNjb3BlLmdhbWUuYXZhaWxhYmxlTWFya2VycyA9IGRhdGEudmFsKCk7XG5cdH0pO1xuXG5cdC8vb24gbG9naW4sIGZpbmQgbWUgaW4gdGhlIGZpcmViYXNlIHBsYXllcnMgYXJyYXlcblx0ZmlyZWJhc2UuYXV0aCgpLm9uQXV0aFN0YXRlQ2hhbmdlZChmdW5jdGlvbiAodXNlcikge1xuXHRcdC8vIHZhciBmaXJlYmFzZVBsYXllcnNBcnIgPSAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKTtcblxuXHRcdGZpcmViYXNlUGxheWVyc0Fyci4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuXHRcdFx0dmFyIEZCcGxheWVycyA9IGRhdGE7XG5cblx0XHRcdGlmICh1c2VyKSB7XG5cdFx0XHRcdHZhciB1c2VyQXV0aElkID0gdXNlci51aWQ7XG5cdFx0XHRcdHZhciBtZSA9IEZCcGxheWVycy5maWx0ZXIocGxheWVyID0+IHBsYXllci51aWQgPT09IHVzZXJBdXRoSWQpWzBdO1xuXHRcdFx0XHRpZiAobWUpIHtcblx0XHRcdFx0XHQkc2NvcGUubWUgPSBtZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoJHNjb3BlLm1lLm1hcmtlciA9PT0gXCJuXCIpICRzY29wZS5tZS5tYXJrZXIgPSBudWxsO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gTm8gdXNlciBpcyBzaWduZWQgaW4uXG5cdFx0XHRcdGNvbnNvbGUubG9nKFwibm8gb25lIGlzIGxvZ2dlZCBpblwiKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSk7XG5cblxuXHQvKioqKioqKioqKioqKioqKlxuXHRBVkFJTEFCTEUgUExBWUVSIEFDVElPTlMgQVQgR0FNRSBTVEFSVFxuXHQqKioqKioqKioqKioqKioqL1xuXG5cdCRzY29wZS5waWNrTWFya2VyID0gZnVuY3Rpb24gKGJvYXJkLCBtYXJrZXIpIHtcblx0XHQkc2NvcGUubWUubWFya2VyID0gbWFya2VyO1xuXG5cdFx0ZmlyZWJhc2VQbGF5ZXJzQXJyLiRsb2FkZWQoKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcblx0XHRcdFx0dmFyIG1lSWR4O1xuXHRcdFx0XHQvL2ZpbmQgbXkgaW5kZXggaW4gdGhlIHBsYXllcnMgYXJyYXlcblx0XHRcdFx0cGxheWVycy5maW5kKGZ1bmN0aW9uIChlLCBpKSB7XG5cdFx0XHRcdFx0aWYgKGUuJGlkID09PSAkc2NvcGUubWUuJGlkKSBtZUlkeCA9IGk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHQvL2dpdmUgbWUgYSBtYXJrZXIgYW5kIHNhdmUgbWUgaW4gZmlyZWJhc2Vcblx0XHRcdFx0ZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS5tYXJrZXIgPSBtYXJrZXI7XG5cdFx0XHRcdGZpcmViYXNlUGxheWVyc0Fyci4kc2F2ZShtZUlkeCk7XG5cdFx0XHR9KTtcblxuXHRcdHZhciBpZHggPSAkc2NvcGUuZ2FtZS5hdmFpbGFibGVNYXJrZXJzLmluZGV4T2YobWFya2VyKTtcblxuXHRcdG1hcmtlcnNBcnJbMF0uc3BsaWNlKGlkeCwgMSk7XG5cblx0XHRtYXJrZXJzQXJyLiRzYXZlKDApXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmVmKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwicmVtb3ZlZCB0aGUgcGlja2VkIG1hcmtlclwiKTtcblx0XHRcdFx0Y29uc29sZS5sb2cocmVmLmtleSk7XG5cdFx0XHR9KTtcblx0fTtcblxuXG5cdC8vVE9ETzogbGltaXQgc3RhcnQgcG9pbnRzXG5cdC8vVGhpcyB2ZXJzaW9uIGhhcyBzb21lIHdlaXJkIHNpZGUgZWZmZWN0cy4uLlxuXG5cdC8vSGF2ZSBwbGF5ZXIgcGljayB0aGVpciBzdGFydCBwb2ludFxuXHQkc2NvcGUucGxhY2VNYXJrZXIgPSBmdW5jdGlvbiAoYm9hcmQsIHBvaW50KSB7XG5cdFxuXHRcdGZpcmViYXNlUGxheWVyc0Fyci4kbG9hZGVkKClcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCdwbGF5ZXJzJywgcGxheWVycyk7XG5cdFx0XHRcdHZhciBtZUlkeDtcblx0XHRcdFx0cGxheWVycy5maW5kKGZ1bmN0aW9uIChlLCBpKSB7XG5cdFx0XHRcdFx0aWYgKGUudWlkID09PSAkc2NvcGUubWUudWlkKSBtZUlkeCA9IGk7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coJ21lIGFuZCBlIGFuZCBpJywkc2NvcGUubWUudWlkLCBlLnVpZCwgbWVJZHgpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRwbGF5ZXIucGxhY2VNYXJrZXIoYm9hcmQsIHBvaW50LCBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdKTtcblx0XHRcdFx0ZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS50aWxlcyA9ICRzY29wZS5nYW1lLmRlYWwoMyk7XG5cblx0XHRcdFx0JHNjb3BlLmdhbWUucGxheWVyc1ttZUlkeF0gPSBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdOyAvL1RoaXMgaXMgbWFpbiBpc3N1ZS4uLiBwdXRzIE9iamVjdCwgbm90IFBsYXllciBpbnRvIGZpcmViYXNlLi4uICBcblxuXHRcdFx0XHRmaXJlYmFzZVBsYXllcnNBcnIuJHNhdmUobWVJZHgpO1xuXHRcdFx0fSk7XG5cdH07XG5cblxuXG5cblxuXG5cblxuXHQvLyBUT0RPOiB3ZSBwcm9iYWJseSBuZWVkIHRoaXMgb24gZmlyZWJhc2Ugc28gb3RoZXIgcGVvcGxlIGNhbid0IHBpY2sgd2hhdCdzIGJlZW4gcGlja2VkXG5cblx0Ly9Gb3Igc3luY2hyb25pemluZ0dhbWUuLi5cblx0Ly8gdmFyIHN5bmNSZWYgPSBnYW1lUmVmLmNoaWxkKCdtb3ZlcycpO1xuXHQvLyBzeW5jUmVmLm9uKCdjaGlsZF9hZGRlZCcsIGZ1bmN0aW9uIChjaGlsZFNuYXBzaG90LCBwcmV2Q2hpbGRLZXkpIHtcblx0Ly8gXHQvL05FRUQgVE8gRE9VQkxFIENIRUNLISEgV2hhdCBkb2VzIGNoaWxkU25hcCByZXR1cm5zP1xuXHQvLyBcdGNvbnNvbGUubG9nKCdjaGlsZFNuYXBzaG90X1N5bmNHYW1lJywgY2hpbGRTbmFwc2hvdCk7XG5cdC8vIFx0Ly9kZXBlbmRpbmcgb24gd2hhdCBjaGlsZFNuYXBzaG90IGdpdmVzIG1lLi4uSSB0aGluayBpdCdzIG9uZSBjaGlsZCBwZXIgb24gY2FsbD8gSXQgZG9lc24ndCByZXR1cm4gYW4gYXJyYXkgb2YgY2hhbmdlcy4uLkkgYmVsaWV2ZSFcblx0Ly8gXHRpZiAoY2hpbGRTbmFwc2hvdC50eXBlID09PSAndXBkYXRlRGVjaycpIHtcblx0Ly8gXHRcdCRzY29wZS5nYW1lLmRlY2sgPSBjaGlsZFNuYXBzaG90LnVwZGF0ZURlY2s7XG5cdC8vIFx0fSBlbHNlIHtcblx0Ly8gXHRcdCRzY29wZS5wbGFjZVRpbGUoY2hpbGRTbmFwc2hvdC50aWxlKTtcblx0Ly8gXHR9XG5cdC8vIH0pO1xuXG5cdC8vIFRPRE86IGhvdyB0byByZS1kbyB0aGUgbW92ZXM/XG5cdC8vICRzY29wZS5nYW1lLm1vdmVzO1xuXG5cdC8vIFRPRE86IGhvdyBkbyB3ZSBzaG93IHRoZSB0aWxlcyBmb3IgcGxheWVyP1xuXG5cdC8vIFRPRE86IGhvdyB0byBzaG93IHRoZSByb3RhdGVkIHRpbGU/XG5cblx0Ly8gQ01UOiBhc3N1bWluZyB3ZSB1c2UgbmV3IEdhbWUoKSBmb3IgZWFjaCBnYW1lXG5cdCRzY29wZS5jdXJyZW50UGxheWVyID0gJHNjb3BlLmdhbWUuZ2V0Q3VycmVudFBsYXllcigpO1xuXG5cdC8vIFRPRE86IG5lZWQgYSBmdW5jdGlvbiB0byBhc3NpZ24gZHJhZ29uXG5cdCRzY29wZS5kcmFnb247XG5cdHZhciBhd2FpdGluZ0RyYWdvbkhvbGRlcnMgPSBbXTtcblxuXHQkc2NvcGUuc3RhcnQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0Ly9cblx0fTtcblxuXHQkc2NvcGUubXlUdXJuID0gZnVuY3Rpb24gKCkge1xuXHRcdCRzY29wZS5tZSA9PT0gJHNjb3BlLmN1cnJlbnRQbGF5ZXI7XG5cdH07XG5cblx0Ly90aGVzZSBhcmUgdGllZCB0byBhbmd1bGFyIG5nLWNsaWNrIGJ1dHRvbnNcblx0JHNjb3BlLnJvdGF0ZVRpbGVDdyA9IGZ1bmN0aW9uICh0aWxlKSB7XG5cdFx0Y29uc29sZS5sb2coXCJyb3RhdGUgdG8gcmlnaHRcIik7XG5cdFx0dGlsZS5yb3RhdGlvbisrO1xuXHRcdGlmICh0aWxlLnJvdGF0aW9uID09PSA0KSB0aWxlLnJvdGF0aW9uID0gMDtcblx0fTtcblxuXHQkc2NvcGUucm90YXRlVGlsZUNjdyA9IGZ1bmN0aW9uICh0aWxlKSB7XG5cdFx0dGlsZS5yb3RhdGlvbi0tO1xuXHRcdGlmICh0aWxlLnJvdGF0aW9uID09PSAtNCkgdGlsZS5yb3RhdGlvbiA9IDA7XG5cdH07XG5cblx0Ly8gQ01UOiB1c2UgcGxheWVyJ3MgYW5kIGdhbWUncyBwcm90b3R5cGUgZnVuY3Rpb24gdG8gcGxhY2UgdGlsZSBhbmQgdGhlbiBtb3ZlIGFsbCBwbGF5ZXJzXG5cdCRzY29wZS5wbGFjZVRpbGUgPSBmdW5jdGlvbiAodGlsZSkge1xuXHRcdC8vIFRPRE86IHNlbmQgdGhpcyBzdGF0ZSB0byBmaXJlYmFzZSBldmVyeSB0aW1lIGl0J3MgY2FsbGVkXG5cdFx0aWYgKHRpbGUucm90YXRpb24gPiAwKSB7XG5cdFx0XHR0aWxlLnBhdGhzID0gdGlsZS5wYXRocy5tYXAoZnVuY3Rpb24gKGNvbm5lY3Rpb24pIHtcblx0XHRcdFx0Y29ubmVjdGlvbiA9IGNvbm5lY3Rpb24gKyAyO1xuXHRcdFx0XHRpZiAoY29ubmVjdGlvbiA9PT0gOSkgY29ubmVjdGlvbiA9IDE7XG5cdFx0XHRcdGlmIChjb25uZWN0aW9uID09PSA4KSBjb25uZWN0aW9uID0gMDtcblx0XHRcdFx0cmV0dXJuIGNvbm5lY3Rpb247XG5cdFx0XHR9KTtcblx0XHRcdHRpbGUucGF0aHMudW5zaGlmdCh0aWxlLnBhdGhzLnBvcCgpKTtcblx0XHRcdHRpbGUucGF0aHMudW5zaGlmdCh0aWxlLnBhdGhzLnBvcCgpKTtcblx0XHR9IGVsc2UgaWYgKHRpbGUucm90YXRpb24gPCAwKSB7XG5cdFx0XHR0aWxlLnBhdGhzID0gdGlsZS5wYXRocy5tYXAoZnVuY3Rpb24gKGNvbm5lY3Rpb24pIHtcblx0XHRcdFx0Y29ubmVjdGlvbiA9IGNvbm5lY3Rpb24gLSAyO1xuXHRcdFx0XHRpZiAoY29ubmVjdGlvbiA9PT0gLTIpIGNvbm5lY3Rpb24gPSA2O1xuXHRcdFx0XHRpZiAoY29ubmVjdGlvbiA9PT0gLTEpIGNvbm5lY3Rpb24gPSA3O1xuXHRcdFx0XHRyZXR1cm4gY29ubmVjdGlvbjtcblx0XHRcdH0pO1xuXHRcdFx0dGlsZS5wYXRocy5wdXNoKHRpbGUucGF0aHMuc2hpZnQoKSk7XG5cdFx0XHR0aWxlLnBhdGhzLnB1c2godGlsZS5wYXRocy5zaGlmdCgpKTtcblx0XHR9XG5cblx0XHR2YXIgZmlyZWJhc2VQbGF5ZXJzQXJyID0gJGZpcmViYXNlQXJyYXkocGxheWVyc1JlZik7XG5cdFx0ZmlyZWJhc2VQbGF5ZXJzQXJyLiRsb2FkZWQoKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcblx0XHRcdFx0dmFyIG1lSWR4O1xuXHRcdFx0XHRwbGF5ZXJzLmZpbmQoZnVuY3Rpb24gKGUsIGkpIHtcblx0XHRcdFx0XHRpZiAoZS4kaWQgPT09ICRzY29wZS5tZS4kaWQpIG1lSWR4ID0gaTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0cGxheWVyLnBsYWNlVGlsZSh0aWxlLCBmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdKTtcblxuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRpbGUucGF0aHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRpZiAoZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS5uZXh0U3BhY2UucG9pbnRzW2ldLm5laWdoYm9yc1swXSA9PT0gXCJuXCIpIHtcblx0XHRcdFx0XHRcdGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0ubmV4dFNwYWNlLnBvaW50c1tpXS5uZWlnaGJvcnMuc3BsaWNlKDAsIDEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLm5leHRTcGFjZS5wb2ludHNbaV0ubmVpZ2hib3JzLnB1c2goZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS5uZXh0U3BhY2UucG9pbnRzW3RpbGUucGF0aHNbaV1dKTtcblx0XHRcdFx0XHRmaXJlYmFzZVBsYXllcnNBcnIuJHNhdmUobWVJZHgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZmlyZWJhc2VQbGF5ZXJzQXJyW21lSWR4XS5wb2ludCA9IGZpcmViYXNlUGxheWVyc0FyclttZUlkeF0ubmV4dFNwYWNlLnBvaW50c1tmaXJlYmFzZVBsYXllcnNBcnJbbWVJZHhdLm5leHRTcGFjZVBvaW50c0luZGV4XTtcblx0XHRcdFx0ZmlyZWJhc2VQbGF5ZXJzQXJyLiRzYXZlKG1lSWR4KTtcblx0XHRcdH0pO1xuXG5cblx0XHQvLyBDTVQ6IHRoaXMgc2hvdWxkIHNlbmQgdGhlIHJvdGF0ZWQgdGlsZSB0byBmaXJlYmFzZVxuXHRcdG1vdmVzQXJyLiRhZGQoe1xuXHRcdFx0J3R5cGUnOiAncGxhY2VUaWxlJyxcblx0XHRcdCd0aWxlJzogdGlsZSxcblx0XHRcdCdwbGF5ZXJVaWQnOiAkc2NvcGUubWUudWlkXG5cdFx0fSk7XG5cblxuXHRcdGZpcmViYXNlUGxheWVyc0Fyci4kbG9hZGVkKClcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG5cdFx0XHRcdHBsYXllcnMuZm9yRWFjaChmdW5jdGlvbiAocCkge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFwicFwiLCBwLnBvaW50KTtcblxuXHRcdFx0XHRcdC8vIGxldCBtb3ZhYmxlID0gcGxheWVyLm1vdmVUbyhwLnBvaW50KTtcblx0XHRcdFx0XHQvLyB2YXIgcElkeCA9IHBsYXllcnMuaW5kZXhPZihwKVxuXG5cdFx0XHRcdFx0Ly8gd2hpbGUgKG1vdmFibGUpIHtcblx0XHRcdFx0XHQvLyAgICAgLy8gbXkgcG9pbnQgaXMgZ29pbmcgdG8gYmUgY3VycmVudCBwb2ludCdzIG5laWdoYm9yc1xuXHRcdFx0XHRcdC8vICAgICBwLnBvaW50LnRyYXZlbGxlZCA9IHRydWU7XG5cdFx0XHRcdFx0Ly8gICAgIHAucG9pbnQgPSBwLm5laWdoYm9ycy5maWx0ZXIoZnVuY3Rpb24gKG4pIHtcblx0XHRcdFx0XHQvLyAgICAgICAgIHJldHVybiAhbi50cmF2ZWxsZWQgJiYgbmVpZ2hib3IgIT09IFwiblwiO1xuXHRcdFx0XHRcdC8vICAgICB9KVswXVxuXHRcdFx0XHRcdC8vICAgICBjb25zb2xlLmxvZyhwLnBvaW50LCBcImdhbWUganMgcCBwb2ludFwiKVxuXHRcdFx0XHRcdC8vICAgICB2YXIgcG9pbnRJZHg7XG5cdFx0XHRcdFx0Ly8gICAgIHAubmV4dFNwYWNlLnBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uIChwb2ludCwgaWR4KSB7XG5cdFx0XHRcdFx0Ly8gICAgICAgICBpZiAoSlNPTi50b1N0cmluZyhwb2ludCkgPT09IEpTT04udG9TdHJpbmcocC5wb2ludCkpIHtcblx0XHRcdFx0XHQvLyAgICAgICAgICAgICBwb2ludElkeCA9IGlkeDtcblx0XHRcdFx0XHQvLyAgICAgICAgIH1cblx0XHRcdFx0XHQvLyAgICAgfSlcblx0XHRcdFx0XHQvLyAgICAgcC5uZXh0U3BhY2VQb2ludHNJbmRleCA9IHBvaW50SWR4O1xuXHRcdFx0XHRcdC8vXG5cdFx0XHRcdFx0Ly8gICAgIGxldCBvbGRTcGFjZSA9IHAubmV4dFNwYWNlO1xuXHRcdFx0XHRcdC8vICAgICBsZXQgbmV3U3BhY2UgPSBwbGF5ZXIubmV3U3BhY2UoJHNjb3BlLmdhbWUuYm9hcmQsIG9sZFNwYWNlLCBwKTtcblx0XHRcdFx0XHQvLyAgICAgcC5uZXh0U3BhY2UgPSBuZXdTcGFjZTtcblx0XHRcdFx0XHQvL1xuXHRcdFx0XHRcdC8vICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJHNhdmUocElkeClcblx0XHRcdFx0XHQvLyAgICAgICAgIC8vIHBsYXllci5jaGVja0RlYXRoKHApO1xuXHRcdFx0XHRcdC8vICAgICBtb3ZhYmxlID0gcGxheWVyLm1vdmVUbyhwLnBvaW50KTtcblx0XHRcdFx0XHQvL1xuXHRcdFx0XHRcdC8vIH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblxuXG5cdFx0Ly8gaWYgKCRzY29wZS5nYW1lLmNoZWNrT3ZlcigpKSB7XG5cdFx0Ly8gICAgIC8vIFRPRE86IG5lZWQgdG8gdGVsbCB0aGUgcGxheWVyIHNoZSB3b25cblx0XHQvLyAgICAgJHNjb3BlLndpbm5lciA9ICRzY29wZS5nYW1lLmdldENhblBsYXkoKVswXTtcblx0XHQvLyAgICAgJHNjb3BlLmdhbWVPdmVyID0gdHJ1ZTtcblx0XHQvLyB9IGVsc2Uge1xuXHRcdC8vICAgICAvLyBJZiBkZWNrIGlzIGVtcHR5ICYgbm8gb25lIGlzIGRyYWdvbiwgc2V0IG1lIGFzIGRyYWdvblxuXHRcdC8vICAgICBpZiAoJHNjb3BlLmdhbWUuZGVjay5sZW5ndGggPT09IDAgJiYgISRzY29wZS5kcmFnb24pIHtcblx0XHQvLyAgICAgICAgICRzY29wZS5kcmFnb24gPSAkc2NvcGUubWU7XG5cdFx0Ly8gICAgIH0gZWxzZSBpZiAoJHNjb3BlLmdhbWUuZGVjay5sZW5ndGggPT09IDAgJiYgJHNjb3BlLmRyYWdvbikge1xuXHRcdC8vICAgICAgICAgYXdhaXRpbmdEcmFnb25Ib2xkZXJzLnB1c2goJHNjb3BlLm1lKTtcblx0XHQvLyAgICAgfSBlbHNlIHtcblx0XHQvLyAgICAgICAgIC8vIENNVDogZHJhdyBvbmUgdGlsZSBhbmQgcHVzaCBpdCB0byB0aGUgcGxheWVyLnRpbGVzIGFycmF5XG5cdFx0Ly8gICAgICAgICAkc2NvcGUubWUudGlsZXMucHVzaCgkc2NvcGUuZ2FtZS5kZWNrLmRlYWwoMSkpO1xuXHRcdC8vICAgICAgICAgLy9pZiBkZWFkIHBsYXllcnMsIHRoZW4gcHVzaCB0aGVpciBjYXJkcyBiYWNrIHRvIHRoZSBkZWNrICYgcmVzaHVmZmxlXG5cdFx0Ly8gICAgICAgICBpZiAoJHNjb3BlLmdhbWUuZGVhZFBsYXllcnMoKS5sZW5ndGgpIHtcblx0XHQvLyAgICAgICAgICAgICAvL3dpdGggbmV3IGNhcmRzICYgbmVlZCB0byByZXNodWZmbGVcblx0XHQvLyAgICAgICAgICAgICAkc2NvcGUuZ2FtZS5kZWFkUGxheWVycygpLmZvckVhY2goZnVuY3Rpb24gKGRlYWRQbGF5ZXJUaWxlcykge1xuXHRcdC8vICAgICAgICAgICAgICAgICBkZWFkUGxheWVyVGlsZXMuZm9yRWFjaChmdW5jdGlvbiAodGlsZSkge1xuXHRcdC8vICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmdhbWUuZGVjay5wdXNoKHRpbGUpO1xuXHRcdC8vICAgICAgICAgICAgICAgICB9KTtcblx0XHQvLyAgICAgICAgICAgICB9KTtcblx0XHQvLyAgICAgICAgICAgICAkc2NvcGUuZ2FtZS5kZWNrID0gJHNjb3BlLmdhbWUuZGVjay5zaHVmZmxlKCk7XG5cdFx0Ly8gICAgICAgICAgICAgLy9zZW5kIGZpcmViYXNlIGEgbmV3IG1vdmVcblx0XHQvLyAgICAgICAgICAgICBnYW1lUmVmLmNoaWxkKCdtb3ZlcycpLnB1c2goe1xuXHRcdC8vICAgICAgICAgICAgICAgICAndHlwZSc6ICd1cGRhdGVEZWNrJyxcblx0XHQvLyAgICAgICAgICAgICAgICAgJ3VwZGF0ZURlY2snOiAkc2NvcGUuZ2FtZS5kZWNrXG5cdFx0Ly8gICAgICAgICAgICAgfSk7XG5cdFx0Ly8gICAgICAgICAgICAgaWYgKCRzY29wZS5kcmFnb24pIHtcblx0XHQvLyAgICAgICAgICAgICAgICAgJHNjb3BlLmRyYWdvbi50aWxlcy5wdXNoKCRzY29wZS5nYW1lLmRlY2suZGVhbCgxKSk7XG5cdFx0Ly8gICAgICAgICAgICAgICAgICRzY29wZS5kcmFnb24gPSBudWxsO1xuXHRcdC8vICAgICAgICAgICAgICAgICAvL05FRUQgVE8gRElTQ1VTUzogTWlnaHQgbmVlZCB0byBtb2RpZnkgdGhpcyBpZiB3ZSB3YW50IHRvIHVzZSB1cCB0aGUgY2FyZHMgYW5kIGdpdmUgZWFjaCBhd2FpdGluZyBwbGF5ZXJzJyB1cCB0byAzIGNhcmRzXG5cdFx0Ly8gICAgICAgICAgICAgICAgIHdoaWxlICgkc2NvcGUuZ2FtZS5kZWNrLmxlbmd0aCAmJiAkc2NvcGUuYXdhaXRpbmdEcmFnb25Ib2xkZXJzLmxlbmd0aCkge1xuXHRcdC8vICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmF3YWl0aW5nRHJhZ29uSG9sZGVycy5zaGlmdCgpLnRpbGVzLnB1c2goJHNjb3BlLmdhbWUuZGVjay5kZWFsKDEpKTtcblx0XHQvLyAgICAgICAgICAgICAgICAgfTtcblx0XHQvLyAgICAgICAgICAgICAgICAgaWYgKCRzY29wZS5hd2FpdGluZ0RyYWdvbkhvbGRlcnMubGVuZ3RoKSB7XG5cdFx0Ly8gICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZHJhZ29uID0gJHNjb3BlLmF3YWl0aW5nRHJhZ29uSG9sZGVycy5zaGlmdCgpO1xuXHRcdC8vICAgICAgICAgICAgICAgICB9XG5cdFx0Ly8gICAgICAgICAgICAgfTtcblx0XHQvLyAgICAgICAgIH1cblx0XHQvL1xuXHRcdC8vICAgICB9XG5cdFx0Ly8gICAgICRzY29wZS5nYW1lLmdvVG9OZXh0UGxheWVyKCk7XG5cdFx0Ly8gfVxuXHR9O1xuXG5cdC8vIFRPRE86IGZpcmViYXNlIGdhbWUucGxheWVycyBzbGljZSAkc2NvcGUucGxheWVyIG91dFxuXHQkc2NvcGUubGVhdmVHYW1lO1xuXG5cdC8vIFRPRE86IG5lZWQgdG8gcmVtb3ZlIHRoaXMgZ2FtZSByb29tJ3MgbW92ZXMgZnJvbSBmaXJlYmFzZT9cblx0JHNjb3BlLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuXHRcdG1hcmtlcnNBcnIuJHJlbW92ZSgwKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlZikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcInJlbW92ZWQgYWxsIG1hcmtlcnNcIiwgcmVmLmtleSk7XG5cdFx0XHR9KTtcblxuXHRcdGRlY2tBcnIuJHJlbW92ZSgwKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlZikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcInJlbW92ZWQgdGhlIGRlY2tcIiwgcmVmLmtleSk7XG5cdFx0XHR9KTtcblxuXHRcdG9iai4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuXHRcdFx0dmFyIHRpbGVzID0gZGF0YS50aWxlcztcblx0XHRcdHZhciBkZWNrID0gbmV3IERlY2sodGlsZXMpLnNodWZmbGUoKS50aWxlcztcblx0XHRcdHZhciBpbml0aWFsRGVja1JlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZCgkc3RhdGVQYXJhbXMuZ2FtZU5hbWUpLmNoaWxkKCdpbml0aWFsRGVjaycpO1xuXHRcdFx0JGZpcmViYXNlQXJyYXkoaW5pdGlhbERlY2tSZWYpLiRhZGQoZGVjayk7XG5cdFx0fSk7XG5cblxuXG5cdFx0dmFyIGluaXRpYWxNYXJrZXJzUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKCRzdGF0ZVBhcmFtcy5nYW1lTmFtZSkuY2hpbGQoJ2F2YWlsYWJsZU1hcmtlcnMnKTtcblx0XHQkZmlyZWJhc2VBcnJheShpbml0aWFsTWFya2Vyc1JlZikuJGFkZChbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJ5ZWxsb3dcIiwgXCJncmVlblwiLCBcImFxdWFcIiwgXCJibHVlXCIsIFwibmF2eVwiLCBcInB1cnBsZVwiXSk7XG5cblxuXHRcdHZhciBwbGF5ZXJzID0gJGZpcmViYXNlQXJyYXkocGxheWVyc1JlZik7XG5cdFx0cGxheWVycy4kbG9hZGVkKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGRhdGFbaV0uY2FuUGxheSA9IHRydWU7XG5cdFx0XHRcdGRhdGFbaV0ubWFya2VyID0gJ24nO1xuXHRcdFx0XHRkYXRhW2ldLm5leHRTcGFjZSA9ICduJztcblx0XHRcdFx0ZGF0YVtpXS5uZXh0U3BhY2VQb2ludHNJbmRleCA9ICduJztcblx0XHRcdFx0ZGF0YVtpXS5wb2ludCA9ICduJztcblx0XHRcdFx0ZGF0YVtpXS50aWxlcyA9ICduJztcblx0XHRcdFx0cGxheWVycy4kc2F2ZShpKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGNvbnNvbGUubG9nKCRzY29wZS5tZSk7XG5cblx0fTtcblxuXG5cdCRzY29wZS5zdGFydHRvcCA9IFtcblx0XHRbMCwgMCwgMF0sXG5cdFx0WzAsIDAsIDFdLFxuXHRcdFsxLCAwLCAwXSxcblx0XHRbMSwgMCwgMV0sXG5cdFx0WzIsIDAsIDBdLFxuXHRcdFsyLCAwLCAxXSxcblx0XHRbMywgMCwgMF0sXG5cdFx0WzMsIDAsIDFdLFxuXHRcdFs0LCAwLCAwXSxcblx0XHRbNCwgMCwgMV0sXG5cdFx0WzUsIDAsIDBdLFxuXHRcdFs1LCAwLCAxXVxuXHRdO1xuXHQkc2NvcGUuc3RhcnRsZWZ0ID0gW1xuXHRcdFswLCAwLCA3XSxcblx0XHRbMCwgMCwgNl0sXG5cdFx0WzAsIDEsIDddLFxuXHRcdFswLCAxLCA2XSxcblx0XHRbMCwgMiwgN10sXG5cdFx0WzAsIDIsIDZdLFxuXHRcdFswLCAzLCA3XSxcblx0XHRbMCwgMywgNl0sXG5cdFx0WzAsIDQsIDddLFxuXHRcdFswLCA0LCA2XSxcblx0XHRbMCwgNSwgN10sXG5cdFx0WzAsIDUsIDZdXG5cdF07XG5cdCRzY29wZS5zdGFydGJvdHRvbSA9IFtcblx0XHRbMCwgNSwgMF0sXG5cdFx0WzAsIDUsIDFdLFxuXHRcdFsxLCA1LCAwXSxcblx0XHRbMSwgNSwgMV0sXG5cdFx0WzIsIDUsIDBdLFxuXHRcdFsyLCA1LCAxXSxcblx0XHRbMywgNSwgMF0sXG5cdFx0WzMsIDUsIDFdLFxuXHRcdFs0LCA1LCAwXSxcblx0XHRbNCwgNSwgMV0sXG5cdFx0WzUsIDUsIDBdLFxuXHRcdFs1LCA1LCAxXVxuXHRdO1xuXHQkc2NvcGUuc3RhcnRyaWdodCA9IFtcblx0XHRbNSwgMCwgMl0sXG5cdFx0WzUsIDAsIDNdLFxuXHRcdFs1LCAxLCAyXSxcblx0XHRbNSwgMSwgM10sXG5cdFx0WzUsIDIsIDJdLFxuXHRcdFs1LCAyLCAzXSxcblx0XHRbNSwgMywgMl0sXG5cdFx0WzUsIDMsIDNdLFxuXHRcdFs1LCA0LCAyXSxcblx0XHRbNSwgNCwgM10sXG5cdFx0WzUsIDUsIDJdLFxuXHRcdFs1LCA1LCAzXVxuXHRdO1xufSk7XG4iLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2dhbWVsaXN0Jywge1xuICAgICAgICB1cmw6ICcvZ2FtZWxpc3QnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9icm93c2VyL2pzL2dhbWVsaXN0L2dhbWVsaXN0Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnZ2FtZUxpc3QnLFxuICAgIH0pO1xufSk7XG5cbnRzdXJvLmNvbnRyb2xsZXIoJ2dhbWVMaXN0JywgZnVuY3Rpb24gKCRzY29wZSwgZmlyZWJhc2VVcmwsICRmaXJlYmFzZU9iamVjdCwgJHN0YXRlLCAkZmlyZWJhc2VBdXRoLCAkZmlyZWJhc2VBcnJheSkge1xuICAgIC8vRm9yIHN5bmNocm9uaXppbmdHYW1lTGlzdC4uLlxuICAgIHZhciByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xuICAgIHZhciBvYmogPSAkZmlyZWJhc2VPYmplY3QocmVmKTtcblxuICAgIHZhciBhdXRoID0gJGZpcmViYXNlQXV0aCgpO1xuICAgIHZhciBmaXJlYmFzZVVzZXIgPSBhdXRoLiRnZXRBdXRoKCk7XG5cbiAgICB2YXIgc3luY2hSZWYgPSByZWYuY2hpbGQoXCJnYW1lc1wiKTtcbiAgICB2YXIgc3luY2hyb25pemVkT2JqID0gJGZpcmViYXNlT2JqZWN0KHN5bmNoUmVmKTtcblxuICAgIC8vIFRoaXMgcmV0dXJucyBhIHByb21pc2UuLi55b3UgY2FuLnRoZW4oKSBhbmQgYXNzaWduIHZhbHVlIHRvICRzY29wZS52YXJpYWJsZVxuICAgIC8vIGdhbWVsaXN0IGlzIHdoYXRldmVyIHdlIGFyZSBjYWxsaW5nIGl0IGluIHRoZSBhbmd1bGFyIGh0bWwuXG4gICAgc3luY2hyb25pemVkT2JqLiRiaW5kVG8oJHNjb3BlLCBcImdhbWVsaXN0XCIpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBnYW1lbGlzdCA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiAkc2NvcGUuZ2FtZWxpc3QpIHtcbiAgICAgICAgICAgICAgICBnYW1lbGlzdC5wdXNoKFtpLCAkc2NvcGUuZ2FtZWxpc3RbaV1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRzY29wZS5nYW1lTmFtZXMgPSBnYW1lbGlzdC5zbGljZSgyKTtcbiAgICAgICAgfSk7XG5cblxuXG5cbiAgICAkc2NvcGUuam9pbiA9IGZ1bmN0aW9uIChnYW1lTmFtZSkge1xuICAgICAgICB2YXIgZ2FtZU5hbWVSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoZ2FtZU5hbWUpO1xuICAgICAgICB2YXIgcGxheWVyc1JlZiA9IGdhbWVOYW1lUmVmLmNoaWxkKCdwbGF5ZXJzJyk7XG5cbiAgICAgICAgZmlyZWJhc2UuYXV0aCgpLm9uQXV0aFN0YXRlQ2hhbmdlZChmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgdmFyIGZpcmViYXNlUGxheWVyc0FyciA9ICRmaXJlYmFzZUFycmF5KHBsYXllcnNSZWYpO1xuXG4gICAgICAgICAgICBmaXJlYmFzZVBsYXllcnNBcnIuJGxvYWRlZCgpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIEZCcGxheWVycyA9IGRhdGE7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghRkJwbGF5ZXJzLmZpbHRlcihmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwbGF5ZXIudWlkID09PSB1c2VyLnVpZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdQbGF5ZXIgPSBuZXcgUGxheWVyKHVzZXIudWlkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRmaXJlYmFzZUFycmF5KHBsYXllcnNSZWYpLiRhZGQobmV3UGxheWVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm8gdXNlciBpcyBzaWduZWQgaW4uXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIm5vdGhpbmdcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdnYW1lJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJnYW1lTmFtZVwiOiBnYW1lTmFtZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn0pO1xuIiwidHN1cm8uY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsb2dpbicsIHtcbiAgICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvYnJvd3Nlci9qcy9sb2dpbi9sb2dpbi5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2xvZ2luQ3RybCdcbiAgICB9KTtcbn0pO1xuXG50c3Vyby5jb250cm9sbGVyKCdsb2dpbkN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUsICRmaXJlYmFzZUF1dGgsICRyb290U2NvcGUpIHtcbiAgICB2YXIgYXV0aCA9ICRmaXJlYmFzZUF1dGgoKTtcblxuICAgICRzY29wZS5sb2dJbldpdGhHb29nbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGF1dGguJHNpZ25JbldpdGhQb3B1cChcImdvb2dsZVwiKS50aGVuKGZ1bmN0aW9uIChhdXRoRGF0YSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJMb2dnZWQgaW4gYXM6XCIsIGF1dGhEYXRhKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuY3VycmVudFVzZXIgPSBhdXRoRGF0YTtcbiAgICAgICAgICAgICRzdGF0ZS5nbygncGlja0dhbWUnKTtcbiAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiQXV0aGVudGljYXRpb24gZmFpbGVkOlwiLCBlcnJvcik7XG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxufSk7XG4iLCJ0c3Vyby5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3BpY2tHYW1lJywge1xuICAgICAgICB1cmw6ICcvcGlja2dhbWUnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJy9icm93c2VyL2pzL3BpY2tHYW1lL3BpY2tHYW1lLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAncGlja0dhbWVDdHJsJ1xuICAgIH0pO1xufSk7XG5cbnRzdXJvLmNvbnRyb2xsZXIoJ3BpY2tHYW1lQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSwgJGZpcmViYXNlQXJyYXksICRmaXJlYmFzZU9iamVjdCkge1xuICAgIHZhciByZWYgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xuICAgIHZhciBvYmogPSAkZmlyZWJhc2VPYmplY3QocmVmKTtcblxuXG4gICAgJHNjb3BlLmNyZWF0ZUdhbWUgPSBmdW5jdGlvbiAoZ2FtZU5hbWUpIHtcbiAgICAgICAgdmFyIGdhbWVOYW1lUmVmID0gcmVmLmNoaWxkKCdnYW1lcycpLmNoaWxkKGdhbWVOYW1lKTtcbiAgICAgICAgdmFyIHBsYXllcnNSZWYgPSBnYW1lTmFtZVJlZi5jaGlsZCgncGxheWVycycpO1xuXG4gICAgICAgICRmaXJlYmFzZUFycmF5KGdhbWVOYW1lUmVmKS4kYWRkKHtcbiAgICAgICAgICAgIFwiZ2FtZU5hbWVcIjogZ2FtZU5hbWVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZmlyZWJhc2UuYXV0aCgpLm9uQXV0aFN0YXRlQ2hhbmdlZChmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV3UGxheWVyID0gbmV3IFBsYXllcih1c2VyLnVpZClcbiAgICAgICAgICAgICAgICAkZmlyZWJhc2VBcnJheShwbGF5ZXJzUmVmKS4kYWRkKG5ld1BsYXllcilcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJubyBvbmUgbG9nZ2VkIGluXCIpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgb2JqLiRsb2FkZWQoKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICB2YXIgdGlsZXMgPSBkYXRhLnRpbGVzXG4gICAgICAgICAgICB2YXIgZGVjayA9IG5ldyBEZWNrKHRpbGVzKS5zaHVmZmxlKCkudGlsZXM7XG4gICAgICAgICAgICB2YXIgZGVja1JlZiA9IHJlZi5jaGlsZCgnZ2FtZXMnKS5jaGlsZChnYW1lTmFtZSkuY2hpbGQoJ2RlY2snKTtcbiAgICAgICAgICAgICRmaXJlYmFzZUFycmF5KGRlY2tSZWYpLiRhZGQoZGVjayk7XG4gICAgICAgIH0pXG5cblxuICAgICAgICB2YXIgaW5pdGlhbE1hcmtlcnNSZWYgPSByZWYuY2hpbGQoJ2dhbWVzJykuY2hpbGQoZ2FtZU5hbWUpLmNoaWxkKCdhdmFpbGFibGVNYXJrZXJzJyk7XG4gICAgICAgICRmaXJlYmFzZUFycmF5KGluaXRpYWxNYXJrZXJzUmVmKS4kYWRkKFtcInJlZFwiLCBcIm9yYW5nZVwiLCBcInllbGxvd1wiLCBcImdyZWVuXCIsIFwiYXF1YVwiLCBcImJsdWVcIiwgXCJuYXZ5XCIsIFwicHVycGxlXCJdKTtcblxuXG4gICAgICAgICRzdGF0ZS5nbygnZ2FtZScsIHtcbiAgICAgICAgICAgIFwiZ2FtZU5hbWVcIjogZ2FtZU5hbWVcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgICRzY29wZS5nb1RvR2FtZUxpc3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzdGF0ZS5nbygnZ2FtZWxpc3QnKTtcbiAgICB9O1xufSk7XG4iLCIndXNlIHN0cmljdCdcblxuZnVuY3Rpb24gUGxheWVyKHVpZCkge1xuICAgIC8vIFRPRE86IGdldCB1aWQgZnJvbSBmaXJlYmFzZSBhdXRoXG4gICAgdGhpcy51aWQgPSB1aWQ7XG5cbiAgICB0aGlzLm1hcmtlciA9IFwiblwiO1xuXG4gICAgLy8gc2hvdWxkIGJlIGEgUG9pbnQgb2JqZWN0XG4gICAgdGhpcy5wb2ludCA9IFwiblwiO1xuXG4gICAgLy8gW3gsIHldXG4gICAgLy8gZGVwZW5kcyBvbiB0aGUgYW5ndWxhciBTcGFjZS54LCBTcGFjZS55XG4gICAgdGhpcy5uZXh0U3BhY2UgPSBcIm5cIjtcblxuICAgIC8vIGluIGVhY2ggU3BhY2UucG9pbnRzIGFycmF5LCBmaW5kIHRoaXMgc3BlY2lmaWMgcG9pbnQgYW5kIGdldCB0aGUgcG9zaXRpb24gKGludGVnZXIpIGluc2lkZSB0aGlzIHNwYWNlLlxuICAgIHRoaXMubmV4dFNwYWNlUG9pbnRzSW5kZXggPSBcIm5cIjtcblxuICAgIC8vIG1heGltdW4gMyB0aWxlc1xuICAgIHRoaXMudGlsZXMgPSAnbic7XG5cbiAgICAvLyBpZiBhIHBsYXllciBkaWVzLCBpdCB3aWxsIGJlIGNoYW5nZWQgdG8gZmFsc2VcbiAgICB0aGlzLmNhblBsYXkgPSB0cnVlO1xufVxuUGxheWVyLnByb3RvdHlwZS5oaSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJISVwiKVxuICAgIH1cbiAgICAvLyBuZWVkIHRvIHVzZSBzZWxmIGJlY3VzZSB3ZSBuZWVkIHRvIGNoYW5nZSAkc2NvcGUubWUgb24gZ2FtZUN0cmwgYW5kIHNlbmQgdG8gZmlyZWJhc2VcblBsYXllci5wcm90b3R5cGUucGxhY2VNYXJrZXIgPSBmdW5jdGlvbiAoYm9hcmQsIHBvaW50LCBzZWxmKSB7XG4gICAgLy8gcG9pbnQgbG9va3MgbGlrZSBbeCwgeSwgcG9pbnRzSW5kZXhdIGluIHRoZSBzcGFjZVxuICAgIHZhciB4ID0gcG9pbnRbMF07XG4gICAgdmFyIHkgPSBwb2ludFsxXTtcbiAgICB2YXIgcG9pbnRzSW5kZXggPSBwb2ludFsyXTtcblxuICAgIHNlbGYucG9pbnQgPSBib2FyZFt5XVt4XS5wb2ludHNbcG9pbnRzSW5kZXhdO1xuICAgIHNlbGYucG9pbnQudHJhdmVsbGVkID0gdHJ1ZTtcblxuICAgIC8vW3gsIHldIGZyb20gdGhlIHBvaW50XG4gICAgc2VsZi5uZXh0U3BhY2UgPSBib2FyZFt5XVt4XTtcblxuICAgIC8vIGluIGVhY2ggU3BhY2UucG9pbnRzIGFycmF5LCBmaW5kIHRoaXMgc3BlY2lmaWMgcG9pbnQgYW5kIGdldCB0aGUgcG9zaXRpb24gKGludGVnZXIpIGluc2lkZSB0aGlzIHNwYWNlLlxuICAgIHNlbGYubmV4dFNwYWNlUG9pbnRzSW5kZXggPSBzZWxmLm5leHRTcGFjZS5wb2ludHMuaW5kZXhPZihzZWxmLnBvaW50KTtcbn07XG5cblBsYXllci5wcm90b3R5cGUubmV3U3BhY2UgPSBmdW5jdGlvbiAoYm9hcmQsIG9sZFNwYWNlLCBzZWxmKSB7XG4gICAgaWYgKHNlbGYubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDAgfHwgc2VsZi5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gYm9hcmRbb2xkU3BhY2UueSAtIDFdW29sZFNwYWNlLnhdO1xuICAgIH0gZWxzZSBpZiAoc2VsZi5uZXh0U3BhY2VQb2ludHNJbmRleCA9PT0gMiB8fCBzZWxmLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSAzKSB7XG4gICAgICAgIHJldHVybiBib2FyZFtvbGRTcGFjZS55XVtvbGRTcGFjZS54ICsgMV07XG4gICAgfSBlbHNlIGlmIChzZWxmLm5leHRTcGFjZVBvaW50c0luZGV4ID09PSA0IHx8IHNlbGYubmV4dFNwYWNlUG9pbnRzSW5kZXggPT09IDUpIHtcbiAgICAgICAgcmV0dXJuIGJvYXJkW29sZFNwYWNlLnkgKyAxXVtvbGRTcGFjZS54XTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYm9hcmRbb2xkU3BhY2UueV1bb2xkU3BhY2UueCAtIDFdO1xuICAgIH1cbn07XG5cbi8vIG5lZWQgdG8gdXNlIHNlbGYgYmVjdXNlIHdlIG5lZWQgdG8gY2hhbmdlICRzY29wZS5tZSBvbiBnYW1lQ3RybCBhbmQgc2VuZCB0byBmaXJlYmFzZVxuUGxheWVyLnByb3RvdHlwZS5wbGFjZVRpbGUgPSBmdW5jdGlvbiAodGlsZSwgc2VsZikge1xuICAgIHNlbGYudGlsZXMgPSBzZWxmLnRpbGVzLmZpbHRlcihmdW5jdGlvbiAodCkge1xuICAgICAgICByZXR1cm4gdC5pZCAhPT0gdGlsZS5pZFxuICAgIH0pO1xuXG4gICAgc2VsZi5uZXh0U3BhY2UudGlsZVVybCA9IHRpbGUuaW1hZ2VVcmw7XG5cbn07XG5cblBsYXllci5wcm90b3R5cGUubW92ZVRvID0gZnVuY3Rpb24gKHBvaW50ZXIpIHtcbiAgICAvL2Fsd2F5cyBiZSByZXR1cm5pbmcgMCBvciAxIHBvaW50IGluIHRoZSBhcnJheVxuICAgIGxldCBuZXh0UG9pbnQgPSBwb2ludGVyLm5laWdoYm9ycy5maWx0ZXIoZnVuY3Rpb24gKG5laWdoYm9yKSB7XG4gICAgICAgIHJldHVybiAhbmVpZ2hib3IudHJhdmVsbGVkICYmIG5laWdoYm9yICE9PSBcIm5cIjtcbiAgICB9KVswXTtcbiAgICBjb25zb2xlLmxvZyhcIm5leHRQb2ludFwiLCBuZXh0UG9pbnQpXG4gICAgcmV0dXJuIG5leHRQb2ludDtcbn07XG5cbi8vIFRPRE86IG5vdCBzdXJlIGhvdyB0byBtYWtlIHRoaXMga2VlcCBtb3Zpbmcgd2l0aCBwbGF5ZXJzIGluc3RlYWQgb2Ygc2VsZlxuLy8gUGxheWVyLnByb3RvdHlwZS5rZWVwTW92aW5nID0gZnVuY3Rpb24gKHNlbGYpIHtcbi8vICAgICBsZXQgbW92YWJsZSA9IHNlbGYubW92ZVRvKHNlbGYucG9pbnQpO1xuLy8gICAgIHdoaWxlIChtb3ZhYmxlKSB7XG4vLyAgICAgICAgIHNlbGYucG9pbnQudHJhdmVsbGVkID0gdHJ1ZTtcbi8vICAgICAgICAgc2VsZi5wb2ludCA9IHNlbGYubW92ZVRvKHNlbGYucG9pbnQpO1xuLy8gICAgICAgICBsZXQgb2xkU3BhY2UgPSBzZWxmLm5leHRTcGFjZTtcbi8vICAgICAgICAgbGV0IG5ld1NwYWNlID0gbmV3U3BhY2Uob2xkU3BhY2UpO1xuLy8gICAgICAgICBzZWxmLm5leHRTcGFjZSA9IG5ld1NwYWNlO1xuLy8gICAgICAgICBzZWxmLm5leHRTcGFjZVBvaW50c0luZGV4ID0gc2VsZi5uZXh0U3BhY2UucG9pbnRzLmluZGV4T2Yoc2VsZi5wb2ludCk7XG4vLyAgICAgICAgIHNlbGYuY2hlY2tEZWF0aCgpO1xuLy8gICAgICAgICBtb3ZhYmxlID0gc2VsZi5tb3ZlVG8oc2VsZi5wb2ludCk7XG4vLyAgICAgfVxuLy8gfTtcblxuUGxheWVyLnByb3RvdHlwZS5jaGVja0RlYXRoID0gZnVuY3Rpb24gKHNlbGYpIHtcbiAgICB2YXIgYWxsVHJhdmVsbGVkID0gc2VsZi5wb2ludC5uZWlnaGJvcnMuZmlsdGVyKGZ1bmN0aW9uIChuZWlnaGJvcikge1xuICAgICAgICByZXR1cm4gbmVpZ2hib3IudHJhdmVsbGVkO1xuICAgIH0pO1xuXG4gICAgaWYgKHNlbGYucG9pbnQuZWRnZSB8fCBhbGxUcmF2ZWxsZWQubGVuZ3RoID09PSAyKSBzZWxmLmRpZSgpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5kaWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jYW5QbGF5ID0gZmFsc2U7XG4gICAgLy8gVE9ETzogbmVlZCB0byBzZW5kIGFuIGFsZXJ0IG9yIG1lc3NhZ2UgdG8gdGhlIHBsYXllciB3aG8ganVzdCBkaWVkLlxufTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
