tsuro.config(function ($stateProvider) {
    $stateProvider.state('game', {
        url: '/game/:gameName',
        templateUrl: '/browser/js/game/game.html',
        controller: 'gameCtrl'
    });
});

tsuro.controller('gameCtrl', function ($scope, $firebaseAuth, firebaseUrl, $stateParams, $firebaseObject, $firebaseArray) {//eventually can break chunks up? any way to use factories? -th/ei
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
    var movesRef = gameRef.child('moves');
    var movesArr = $firebaseArray(movesRef);
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
        playersRef.on("value", function (snap) {//make a more descriptive value/param name/variable names -th/ei
            var snapPlayers = snap.val(); //grab the value of the snapshot (all players in game in Firebase)

            //for each player in this collection...
            for (var thisPlayerId in snapPlayers) {//is this an obj? -th/ei
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
                for (var playerproperty in snapPlayers[thisPlayer]) {//need to change to match thisPlayerId -th
                    localPlayer[playerproperty] = snapPlayers[thisPlayer][playerproperty];
                }

                //push local player to game.players
                if (thisIsANewPlayer) $scope.game.players.push(localPlayer);
                else $scope.game.players[existingPlayerIndex] = localPlayer;
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
                var me = players.find(player => player.uid === user.uid);

                if (me) {
                    $scope.me = me;
                }
                if ($scope.me.marker === "n") $scope.me.marker = null;
            } else {
                // No user is signed in.
                console.log("no one is logged in");
            }
            console.log('im here!!!!!!!!')
        });
    });


    /****************
    AVAILABLE PLAYER ACTIONS AT GAME START
    ****************/

    $scope.pickMarker = function (board, marker) {
        $scope.me.marker = marker;

        firebasePlayersArr.$loaded()//factory - th/ei
            .then(function (players) {
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

        markersArr.$save(0)
            .then(function (ref) {
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
        console.log($scope.me.tiles)
            //when the firebase players are loaded....
        firebasePlayersArr.$loaded()
            .then(function (players) {
                //find me in the firebase players array
                var meIdx;
                players.find(function (e, i) {
                    if (e.uid === $scope.me.uid) meIdx = i;
                });

                firebasePlayersArr[meIdx] = $scope.me; //set firebase me to local me

                firebasePlayersArr.$save(meIdx); //save it.
            });
    };







//LOVE TODOs -th/ei
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
        firebasePlayersArr.$loaded()
            .then(function (players) {
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


        firebasePlayersArr.$loaded()
            .then(function (players) {
                players.forEach(function (p) {
                    let movable = player.moveTo(p.point);
                    var pIdx = players.indexOf(p)

                    while (movable) {
                        p.point.travelled = true;
                        p.point = movable;

                        console.log("p nextSpace", p.nextSpace)
                        console.log("p.point.spaces", p.point.spaces)
                        var newNextSpaceInfo = p.point.spaces.filter(function (space) {
                            return space.x !== p.nextSpace.x || space.y !== p.nextSpace.y
                        })[0]

                        let oldSpace = p.nextSpace;
                        let newSpace = $scope.game.board[newNextSpaceInfo.y][newNextSpaceInfo.x];
                        p.nextSpace = newSpace;

                        firebasePlayersArr.$save(pIdx);
                        //         // player.checkDeath(p);
                        movable = player.moveTo(p.point);

                    }
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
        markersArr.$remove(0)
            .then(function (ref) {
                console.log("removed all markers", ref.key);
            });

        deckArr.$remove(0)
            .then(function (ref) {
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


    $scope.starttop = [//JSON  -th/ei
        [0, 0, 0],
        [0, 0, 1],
        [1, 0, 0],
        [1, 0, 1],
        [2, 0, 0],
        [2, 0, 1],
        [3, 0, 0],
        [3, 0, 1],
        [4, 0, 0],
        [4, 0, 1],
        [5, 0, 0],
        [5, 0, 1]
    ];
    $scope.startleft = [
        [0, 0, 7],
        [0, 0, 6],
        [0, 1, 7],
        [0, 1, 6],
        [0, 2, 7],
        [0, 2, 6],
        [0, 3, 7],
        [0, 3, 6],
        [0, 4, 7],
        [0, 4, 6],
        [0, 5, 7],
        [0, 5, 6]
    ];
    $scope.startbottom = [
        [0, 5, 0],
        [0, 5, 1],
        [1, 5, 0],
        [1, 5, 1],
        [2, 5, 0],
        [2, 5, 1],
        [3, 5, 0],
        [3, 5, 1],
        [4, 5, 0],
        [4, 5, 1],
        [5, 5, 0],
        [5, 5, 1]
    ];
    $scope.startright = [
        [5, 0, 2],
        [5, 0, 3],
        [5, 1, 2],
        [5, 1, 3],
        [5, 2, 2],
        [5, 2, 3],
        [5, 3, 2],
        [5, 3, 3],
        [5, 4, 2],
        [5, 4, 3],
        [5, 5, 2],
        [5, 5, 3]
    ];
});
