tsuro.config(function ($stateProvider) {
    $stateProvider.state('game', {
        url: '/game/:gameName',
        templateUrl: '/browser/js/game/game.html',
        controller: 'gameCtrl'
    });
});

tsuro.controller('gameCtrl', function ($scope, $firebaseAuth, firebaseUrl, $stateParams, $firebaseObject, $firebaseArray, $state, gameFactory) {
    var ref = firebase.database().ref();
    var obj = $firebaseObject(ref);

    var gameRef = ref.child('games').child($stateParams.gameName);
    var gameArr = gameRef.child($stateParams.gameName);

    var initialDeckRef = ref.child('games').child($stateParams.gameName).child('initialDeck');
    var initialDeckArr = $firebaseArray(initialDeckRef);

    var deckRef = gameRef.child('deck');
    var deckArr = $firebaseArray(deckRef);

    var currPlayerRef = gameRef.child('currPlyaer');
    // Should be an array with only one number
    var currPlayerArr = $firebaseArray(currPlayerRef);

    var playersRef = gameRef.child('players');
    var firebasePlayersArr = $firebaseArray(playersRef);

    var markersRef = gameRef.child('availableMarkers');
    var markersArr = $firebaseArray(markersRef);

    var boardRef = gameRef.child('board');
    var boardArr = $firebaseArray(boardRef);

    var player = Object.create(Player.prototype);

    /****************
    INITIALIZING GAME
    ****************/

    //new local game with game name defined by url
    $scope.game = new Game($stateParams.gameName);

    //when the board is loaded...
    boardArr.$loaded().then(function (data) {
        if (!data.length) {
            boardArr.$add($scope.game.board);
        }
        $scope.game.board = boardArr[0];

        //watching board for changes
        boardRef.on('child_changed', function (snap) {
            //NEED TO RETURN TO CHECK BOARD
            console.log(snap);
            $scope.game.board = snap.val();
        });
    });

    $scope.spaces = _.flatten($scope.game.board);

    //when the deck is loaded...
    deckArr.$loaded().then(function (data) {

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
                if (thisIsANewPlayer) $scope.game.players.push(localPlayer);
                else $scope.game.players[existingPlayerIndex] = localPlayer;
            }
        });

    });



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
                var meIdx;
                players.find(function (e, i) {
                    if (e.uid === user.uid) meIdx = i;
                });

                $scope.me = players[meIdx];
                // $scope.game.currPlayer = meIdx;

                $scope.game.players = players;
                $scope.game.currentPlayer = $scope.game.players[0];
                $scope.myTurn = $scope.me.uid === $scope.game.currentPlayer.uid;
                console.log("IS IT MY TURN?", $scope.myTurn)
                if ($scope.me.marker === "n") $scope.me.marker = null;

            } else {
                // No user is signed in.
                console.log("no one is logged in");
            }
            console.log('im here!!!!!!!!')
        });
    });

    // Start with first player in the array, index 0
    currPlayerArr.$loaded()
        .then(function (currPlayer) {
            $scope.game.currPlayer = currPlayer[0][0];
            console.log("when loaded, currPlayer", $scope.game.currPlayer)
        })

    // update your view for current player index
    currPlayerRef.on('child_changed', function (data) {
        $scope.game.currPlayer = data.val()[0];
        $scope.game.currentPlayer = firebasePlayersArr[data.val()[0]];
        $scope.myTurn = $scope.me.uid === $scope.game.currentPlayer.uid;
        console.log("IS IT MY TURN?", $scope.myTurn)
    });

    /****************
    AVAILABLE PLAYER ACTIONS AT GAME START
    ****************/

    $scope.pickMarker = function (marker) {
        boardArr.$loaded().then(function (data) {
            pickMarkerFn(data, marker);
        });
    }

    function pickMarkerFn(board, marker) {
        $scope.me.marker = marker;

        firebasePlayersArr.$loaded()
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



    // once placed the marker, cannot place again
    $scope.clicked = false

    //  Have player pick their start point
    $scope.placeMarker = function (point) {
        console.log("point in ctrl", point)
        boardArr.$loaded()
            .then(function (data) {
                player.placeMarker(data[0], point, $scope.me);

                // deal me three cards
                $scope.me.tiles = $scope.game.deal(3);
                $scope.clicked = true;

                // when the firebase players are loaded....
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
                return false;
            });
    };




    /****************
    GAMEPLAY ACTIONS
    ****************/
    $scope.tryTile = function (tile) {
        console.log('trying tile');
        console.log("board in try tile", $scope.me.nextSpace.y, $scope.me.nextSpace.x)

        $scope.game.board[$scope.me.nextSpace.y][$scope.me.nextSpace.x].image = tile.imageUrl;
        $scope.game.board[$scope.me.nextSpace.y][$scope.me.nextSpace.x].rotation = tile.rotation;
        console.log("paths", tile.paths);

        // CMT: need this line here in order to update the $scope.spaces for the html
        $scope.spaces = _.flatten($scope.game.board);
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


    // TODO: need a function to assign dragon
    $scope.dragon;
    var awaitingDragonHolders = [];

    $scope.start = function () {

    };

    //these are tied to angular ng-click buttons
    $scope.rotateTileCw = function (tile) {
        tile.rotation++;
        if (tile.rotation === 4) tile.rotation = 0;
        console.log("rotate cw", tile);
    };

    $scope.rotateTileCcw = function (tile) {
        tile.rotation--;
        if (tile.rotation === -4) tile.rotation = 0;
        console.log('rotate ccw', tile);
    };

    // CMT: use player's and game's prototype function to place tile and then move all players
    $scope.placeTile = function (tile) {
        console.log("placing tile...here's the paths", tile.paths, "rotation", tile.rotation);

        console.log("my next space", $scope.me.nextSpace)
        $scope.game.board[$scope.me.nextSpace.y][$scope.me.nextSpace.x].image = tile.imageUrl;
        $scope.game.board[$scope.me.nextSpace.y][$scope.me.nextSpace.x].rotation = tile.rotation;

        // CMT: need this line here in order to update the $scope.spaces for the html
        $scope.spaces = _.flatten($scope.game.board);

        // TODO: send this state to firebase every time it's called
        tile = gameFactory.rotateTile(tile);

        var firebasePlayersArr = $firebaseArray(playersRef);
        firebasePlayersArr.$loaded()
            .then(function (players) {
                var meIdx;
                players.find(function (e, i) {
                    if (e.$id === $scope.me.$id) meIdx = i;
                });

                firebasePlayersArr[meIdx].tiles = firebasePlayersArr[meIdx].tiles.filter(function (t) {
                    return t.id !== tile.id
                });

                firebasePlayersArr[meIdx].nextSpace.tileUrl = tile.imageUrl;

                for (var i = 0; i < tile.paths.length; i++) {
                    if (firebasePlayersArr[meIdx].nextSpace.points[i].neighbors[0] === "n") {
                        firebasePlayersArr[meIdx].nextSpace.points[i].neighbors.splice(0, 1);
                    }
                    firebasePlayersArr[meIdx].nextSpace.points[i].neighbors.push(firebasePlayersArr[meIdx].nextSpace.points[tile.paths[i]]);
                    firebasePlayersArr.$save(meIdx);
                }

                firebasePlayersArr[meIdx].point = firebasePlayersArr[meIdx].nextSpace.points[firebasePlayersArr[meIdx].nextSpacePointsIndex];

                firebasePlayersArr.$save(meIdx);
                return firebasePlayersArr[meIdx]
            }).then(function (FBme) {
                $scope.me = FBme;
            })

        console.log("now moving all players")
        firebasePlayersArr.$loaded()
            .then(function (players) {
                players.forEach(function (p) {
                    p.point.travelled = true;
                    let movable = player.moveTo(p.point);
                    console.log("1st movable", movable)
                    var pIdx = players.indexOf(p)

                    while (movable) {
                        console.log("movable", movable)
                        p.point.travelled = true;
                        p.point = movable;

                        // if (p.point.travelled === true) {
                        //     p.canPlay = false;
                        //     break;
                        // }

                        // Check the space that's not my current nextSpace
                        var newNextSpaceInfo = p.point.spaces.filter(function (space) {
                            return space.x !== p.nextSpace.x || space.y !== p.nextSpace.y
                        })[0]
                        console.log("newNextSpaceInfo", newNextSpaceInfo);

                        let oldSpace = p.nextSpace;
                        let newSpace = $scope.game.board[newNextSpaceInfo.y][newNextSpaceInfo.x];
                        p.nextSpace = newSpace;
                        p.nextSpacePointsIndex = newNextSpaceInfo.i;
                        firebasePlayersArr.$save(pIdx);
                        //                 // TODO: need more players to check if it works
                        //                 player.checkDeath(p);

                        movable = player.moveTo(p.point);
                        console.log("movable at the end", movable)
                    }

                    console.log("end moving")
                });
                $scope.game.players = players;
                console.log("updated players", $scope.game.players)
            });

        // if ($scope.game.checkOver()) {
        //     // TODO: need to tell the player she won
        //     $scope.winner = $scope.game.getCanPlay()[0];
        //     $scope.gameOver = true;
        //     console.log("game over")
        //         // TODO: disable everything, let the players decide wether reset the game or not
        // } else {
        if ($scope.game.deadPlayers().length) {
            //with new cards & need to reshuffle

            // because the deadPlayers() returns a 2D array, use reduce to flatten it
            var deadPlayerTiles = $scope.game.deadPlayers().reduce(function (a, b) {
                return a = a.concat(b)
            })

            $scope.game.deck = $scope.game.deck.concat(deadPlayerTiles);
            $scope.game.deck = $scope.game.deck.shuffle();

        }

        // If deck is empty & no one is dragon, set me as dragon
        if ($scope.game.deck.length === 0 && !$scope.dragon) {
            $scope.dragon = $scope.me;
            console.log("set dragon to me")
        } else if ($scope.game.deck.length === 0 && $scope.dragon) {
            awaitingDragonHolders.push($scope.me);
            console.log("I'm waiting for to be a dragon")
        } else {
            console.log("give me a tile")
            firebasePlayersArr.$loaded()
                .then(function (players) {
                    //find me in the firebase players array
                    var meIdx;
                    players.find(function (e, i) {
                        if (e.uid === $scope.me.uid) meIdx = i;
                    });

                    //set firebase me to local me
                    firebasePlayersArr[meIdx].tiles = $scope.me.tiles.concat($scope.game.deal(1));
                    console.log("dealed one tile to me!");

                    //save it
                    firebasePlayersArr.$save(meIdx);

                    $scope.me = firebasePlayersArr[meIdx];
                });

            while ($scope.dragon && $scope.game.deck.length) {
                $scope.dragon.tiles.push($scope.game.deal(1));
                firebasePlayersArr.$loaded()
                    .then(function (players) {
                        //find me in the firebase players array
                        var meIdx;
                        players.find(function (e, i) {
                            if (e.uid === $scope.dragon.uid) meIdx = i;
                        });

                        //set firebase me to local me
                        firebasePlayersArr[meIdx] = $scope.dragon;

                        //save it
                        firebasePlayersArr.$save(meIdx);
                    });

                $scope.dragon = $scope.awaitingDragonHolders.shift() || null;
            }
        }

        currPlayerArr[0][0] = $scope.game.nextCanPlay();
        currPlayerArr.$save(0);
        $scope.game.currentPlayer = $scope.game.players[currPlayerArr[0][0]];
    };


    $scope.leaveGame = function () {
        console.log("i'm out");

        firebasePlayersArr.$loaded()
            .then(function (players) {
                //find me in the firebase players array
                var meIdx;

                players.find(function (e, i) {
                    if (e.uid === $scope.me.uid) meIdx = i;
                });

                // remove the player from firebase
                firebasePlayersArr.$remove(firebasePlayersArr[meIdx]);
            });

        $state.go('pickGame');
    };

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

        initialDeckArr.$remove(0)
            .then(function (ref) {
                console.log("reomved the initialDeck", ref.key)
            })

        var tiles = gameFactory.tiles;

        var deck = new Deck(tiles).shuffle().tiles;
        initialDeckArr.$add(deck);
        deckArr.$add(deck);


        currPlayerArr.$remove(0)
            .then(function () {
                currPlayerArr.$add([0])
            })

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

        $state.reload()
        console.log($scope.me);

    };


    $scope.starttop = [
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
        [0, 5, 5],
        [0, 5, 4],
        [1, 5, 5],
        [1, 5, 4],
        [2, 5, 5],
        [2, 5, 4],
        [3, 5, 5],
        [3, 5, 4],
        [4, 5, 5],
        [4, 5, 4],
        [5, 5, 5],
        [5, 5, 4]
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

tsuro.directive('tile', function () {
    return {
        templateUrl: 'browser/js/game/tile.directive.html',
        scope: {
            'thisTile': '=',
            'tryTile': '&tryTile',
            'rotateccw': '&rotateccw',
            'rotatecw': '&rotatecw',
            'place': '&place',
            'myTurn': '='
        }
    };
});
