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

    var spaceRef = ref.child('games').child($stateParams.gameName).child('spaces')
    var spaceObj = $firebaseObject(spaceRef);

    /****************
    INITIALIZING GAME
    ****************/

    // new local game with game name defined by url
    $scope.game = new Game($stateParams.gameName);

    // when the deck is loaded, local deck is the firebase deck
    deckArr.$loaded().then(function () {
        $scope.game.deck = deckArr;

        // don't start watching players until there is a deck in the game
        playersRef.on("value", function (snap) {
            var snapPlayers = snap.val(); //grab the value of the snapshot (all players in game in Firebase)

            // for each player in this collection...
            for (var thisPlayer in snapPlayers) {
                var existingPlayerIndex, thisIsANewPlayer;

                // find this 'snap' player's index in local game. find returns that value.
                var localPlayer = $scope.game.players.find(function (plyr, plyrIdx) {
                    existingPlayerIndex = plyrIdx;
                    return plyr.uid === snapPlayers[thisPlayer].uid;
                });

                // if not found, create new player
                if (!localPlayer) {
                    console.log('i didnt find a local player!');
                    localPlayer = new Player(snapPlayers[thisPlayer].uid);
                    thisIsANewPlayer = true;
                }

                // for each key in the snapPlayer's keys, add that key and value to local player
                for (var playerproperty in snapPlayers[thisPlayer]) {
                    localPlayer[playerproperty] = snapPlayers[thisPlayer][playerproperty];
                }

                //push local player to game.players
                if (thisIsANewPlayer) $scope.game.players.push(localPlayer);
                else $scope.game.players[existingPlayerIndex] = localPlayer;
            }
            // on login, find me in the $scope.game players array
            firebase.auth().onAuthStateChanged(function (user) {
                firebasePlayersArr.$loaded()
                    .then(function (player) {
                        if (user) {
                            console.log("scope game", $scope.game)
                            $scope.me = $scope.game.players.find((player) => player.uid === user.uid);

                            $scope.meIdx;
                            player.find((player, i) => {
                                if (player.uid === user.uid) $scope.meIdx = i
                            });

                            $scope.me.marker = player[$scope.meIdx].marker;
                            $scope.clicked = player[$scope.meIdx].clicked;
                            $scope.me.x = player[$scope.meIdx].x;
                            $scope.me.y = player[$scope.meIdx].y;
                            $scope.me.i = player[$scope.meIdx].i

                            // $scope.myTurn = $scope.me.uid === $scope.game.currentPlayer.uid;
                            // console.log("IS IT MY TURN?", $scope.myTurn)
                        } else {
                            console.log("no one is logged in");
                        }
                        console.log('im here!!!!!!!!');
                    })
            })
        });
    });




    // when that markers array is loaded, update the available markers array on scope
    markersArr.$loaded().then(function (data) {
        $scope.game.availableMarkers = data[0];
    });

    //if someone else picks a marker, update your view
    markersRef.on('child_changed', function (data) {
        $scope.game.availableMarkers = data.val();
    });

    $scope.spaces = _.flatten($scope.game.board);
    // // Start with first player in the array, index 0
    // $scope.game.currPlayer = 0;
    // currPlayerArr[0] = $scope.game.currPlayer;
    // currPlayer.$save(0);
    //
    // // update your view for current player index
    // currPlayerRef.on('child_changed', function (data) {
    //     $scope.game.currPlayer = data.val()[0];
    //     $scope.game.currentPlayer = firebasePlayersArr[data.val()[0]];
    //     $scope.myTurn = $scope.me.uid === $scope.game.currentPlayer.uid;
    //     console.log("IS IT MY TURN?", $scope.myTurn)
    // });

    /****************
    AVAILABLE PLAYER ACTIONS AT GAME START
    ****************/

    $scope.pickMarker = function (marker) {
        pickMarkerFn(marker);
    }

    function pickMarkerFn(marker) {
        $scope.me.marker = marker;

        firebasePlayersArr[$scope.meIdx].marker = marker;
        firebasePlayersArr.$save($scope.meIdx);

        var idx = $scope.game.availableMarkers.indexOf(marker);

        markersArr[0].splice(idx, 1);

        markersArr.$save(0)
            .then(function () {
                console.log("removed the picked marker");
            });
    };



    // once placed the marker, cannot place again
    $scope.clicked = false

    //  Have player pick their start point
    $scope.placeMarker = function (point) {
        placeMarkerFn(point);
    };

    var placeMarkerFn = function (point) {
        console.log("point in ctrl", point);
        console.log("board", $scope.game.board)
        $scope.me.placeMarker(point, $scope.game.board);
        $scope.me.tiles = $scope.game.deal(3);
        $scope.me.clicked = true;

        // FOR SOME REASON I can't just do firebasePlayersArr[$scope.meIdx] = $scope.me;
        firebasePlayersArr[$scope.meIdx].tiles = $scope.me.tiles;
        firebasePlayersArr[$scope.meIdx].point = $scope.me.point;
        firebasePlayersArr[$scope.meIdx].x = $scope.me.x;
        firebasePlayersArr[$scope.meIdx].y = $scope.me.y;
        firebasePlayersArr[$scope.meIdx].i = $scope.me.i;
        firebasePlayersArr[$scope.meIdx].clicked = true;
        firebasePlayersArr.$save($scope.meIdx);

        return false;
    };

    /****************
    GAMEPLAY ACTIONS
    ****************/

    // TODO: need a function to assign dragon
    $scope.dragon;
    var awaitingDragonHolders = [];

    $scope.start = function () {

    };

    // these are tied to angular ng-click buttons
    // these are tied to angular ng-click buttons
    // TODO: doesn't work
    $scope.rotateTileCw = function (tile) {
        tile.rotation++;
        tile.rotation %= 4; //set rotation to be between 0 and 3
        console.log("rotate cw", tile);
    };

    $scope.rotateTileCcw = function (tile) {
        tile.rotation--;
        tile.rotation %= 4; //set rotation to be between -0 and -3
        tile.rotation += 4 //set it to be between +0 and +3
        console.log('rotate ccw', tile);
    };

    // CMT: use player's and game's prototype function to place tile and then move all players
    $scope.placeTile = function (tile) {
        var spacex = $scope.me.x;
        var spacey = $scope.me.y;
        var tileId = tile.id;
        var tileImg = tile.imageUrl;
        var rotation = tile.rotation;
        placeTileOnSpace(spacex, spacey, tileId, tileImg, rotation);
    }

    function placeTileOnSpace(x, y, tileId, img, rotate) {
        var spaceId = 'space' + x + y;
        console.log(`spaceId = ${spaceId}`);
        spaceObj[spaceId] = {
            'tileId': tileId,
            'img': img,
            'rotation': rotate
        };
        spaceObj.$save();
        console.log("tile placement sent to Firebase");
    };

    spaceRef.on('child_added', function (snapshot) {
        console.log("got a tile", snapshot.val())
        var addedTile = snapshot.val();
        var spaceKey = snapshot.key;
        var x = +spaceKey.slice(-2, -1);
        var y = +spaceKey.slice(-1);
        var space = $scope.game.board[y][x]; // look space up in game.board

        space.image = addedTile.img;
        space.rotation = addedTile.rotation;
        var tile = gameFactory.tiles[addedTile.tileId]; // look up tile by id
        console.log("tile", tile)
        var rotatedTile = gameFactory.rotateTile(tile, snapshot.val().rotation); // rotate tile
        console.log(rotatedTile, "rotated")
        for (var i = 0; i < rotatedTile.paths.length; i++) {
            // if the point doesn't have neighbors... set to empty array
            if (!space.points[i].neighbors) space.points[i].neighbors = [];
            // set each point's neighbors to it's corresponding point
            space.points[i].neighbors.push(space.points[rotatedTile.paths[i]]);
        }
        // trigger move
        console.log("spaceRef", typeof x, typeof $scope.me.x)
        if ($scope.me.x === x && $scope.me.y === y) {
            console.log("inside if")
            $scope.me.move($scope.game.board);
            console.log("in on", $scope.me, "meidx", $scope.meIdx);

            // TODO: this doesn't send to firebase
            firebasePlayersArr[$scope.meIdx].point = $scope.me.point;
            firebasePlayersArr[$scope.meIdx].x = $scope.me.x;
            firebasePlayersArr[$scope.meIdx].y = $scope.me.y;
            firebasePlayersArr[$scope.meIdx].i = $scope.me.i;
            firebasePlayersArr.$save($scope.meIdx);
            // syncWithFirebase();
        }
    });

    // function syncWithFirebase() {
    //     firebasePlayersArr[$scope.meIdx].tiles = $scope.me.tiles;
    //     firebasePlayersArr[$scope.meIdx].point = $scope.me.point;
    //     firebasePlayersArr[$scope.meIdx].x = $scope.me.x;
    //     firebasePlayersArr[$scope.meIdx].y = $scope.me.y;
    //     firebasePlayersArr[$scope.meIdx].i = $scope.me.i;
    //     firebasePlayersArr.$save($scope.meIdx);
    // }

    // $scope.placeTile = function (tile) {
    //
    //     console.log("now moving all players")
    //     firebasePlayersArr.$loaded()
    //         .then(function (players) {
    //             players.forEach(function (p) {
    //                 p.point.travelled = true;
    //                 let movable = player.moveTo(p.point);
    //                 console.log("1st movable", movable)
    //                 var pIdx = players.indexOf(p)
    //
    //                 while (movable) {
    //                     console.log("movable", movable)
    //                     p.point.travelled = true;
    //                     p.point = movable;
    //
    //                     // if (p.point.travelled === true) {
    //                     //     p.canPlay = false;
    //                     //     break;
    //                     // }
    //
    //                     // Check the space that's not my current nextSpace
    //                     var newNextSpaceInfo = p.point.spaces.filter(function (space) {
    //                         return space.x !== p.nextSpace.x || space.y !== p.nextSpace.y
    //                     })[0]
    //                     console.log("newNextSpaceInfo", newNextSpaceInfo);
    //
    //                     let oldSpace = p.nextSpace;
    //                     let newSpace = $scope.game.board[newNextSpaceInfo.y][newNextSpaceInfo.x];
    //                     p.nextSpace = newSpace;
    //                     p.nextSpacePointsIndex = newNextSpaceInfo.i;
    //                     firebasePlayersArr.$save(pIdx);
    //                     //                 // TODO: need more players to check if it works
    //                     //                 player.checkDeath(p);
    //
    //                     movable = player.moveTo(p.point);
    //                     console.log("movable at the end", movable)
    //                 }
    //
    //                 console.log("end moving")
    //             });
    //             $scope.game.players = players;
    //             console.log("updated players", $scope.game.players)
    //         });
    //
    //     // if ($scope.game.checkOver()) {
    //     //     // TODO: need to tell the player she won
    //     //     $scope.winner = $scope.game.getCanPlay()[0];
    //     //     $scope.gameOver = true;
    //     //     console.log("game over")
    //     //         // TODO: disable everything, let the players decide wether reset the game or not
    //     // } else {
    //     if ($scope.game.deadPlayers().length) {
    //         //with new cards & need to reshuffle
    //
    //         // because the deadPlayers() returns a 2D array, use reduce to flatten it
    //         var deadPlayerTiles = $scope.game.deadPlayers().reduce(function (a, b) {
    //             return a = a.concat(b)
    //         })
    //
    //         $scope.game.deck = $scope.game.deck.concat(deadPlayerTiles);
    //         $scope.game.deck = $scope.game.deck.shuffle();
    //
    //     }
    //
    //     // If deck is empty & no one is dragon, set me as dragon
    //     if ($scope.game.deck.length === 0 && !$scope.dragon) {
    //         $scope.dragon = $scope.me;
    //         console.log("set dragon to me")
    //     } else if ($scope.game.deck.length === 0 && $scope.dragon) {
    //         awaitingDragonHolders.push($scope.me);
    //         console.log("I'm waiting for to be a dragon")
    //     } else {
    //         console.log("give me a tile")
    //         firebasePlayersArr.$loaded()
    //             .then(function (players) {
    //                 //find me in the firebase players array
    //                 var meIdx;
    //                 players.find(function (e, i) {
    //                     if (e.uid === $scope.me.uid) meIdx = i;
    //                 });
    //
    //                 //set firebase me to local me
    //                 firebasePlayersArr[meIdx].tiles = $scope.me.tiles.concat($scope.game.deal(1));
    //                 console.log("dealed one tile to me!");
    //
    //                 //save it
    //                 firebasePlayersArr.$save(meIdx);
    //
    //                 $scope.me = firebasePlayersArr[meIdx];
    //             });
    //
    //         while ($scope.dragon && $scope.game.deck.length) {
    //             $scope.dragon.tiles.push($scope.game.deal(1));
    //             firebasePlayersArr.$loaded()
    //                 .then(function (players) {
    //                     //find me in the firebase players array
    //                     var meIdx;
    //                     players.find(function (e, i) {
    //                         if (e.uid === $scope.dragon.uid) meIdx = i;
    //                     });
    //
    //                     //set firebase me to local me
    //                     firebasePlayersArr[meIdx] = $scope.dragon;
    //
    //                     //save it
    //                     firebasePlayersArr.$save(meIdx);
    //                 });
    //
    //             $scope.dragon = $scope.awaitingDragonHolders.shift() || null;
    //         }
    //     }
    //
    //     currPlayerArr[0][0] = $scope.game.nextCanPlay();
    //     currPlayerArr.$save(0);
    //     $scope.game.currentPlayer = $scope.game.players[currPlayerArr[0][0]];
    // };


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
                data[i].canPlay = null;
                data[i].marker = null;
                data[i].point = null;
                data[i].tiles = null;
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
            'place': '&place'
                // 'myTurn': '='
        }
    };
});
