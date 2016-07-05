tsuro.config(function($stateProvider) {
    $stateProvider.state('game', {
        url: '/game/:gameName',
        templateUrl: '/browser/js/game/game.html',
        controller: 'gameCtrl'
    });
});

tsuro.controller('gameCtrl', function($scope, $firebaseAuth, firebaseUrl, $stateParams, $firebaseObject, $firebaseArray, $state, gameFactory, boardFactory) {

    var ref = firebase.database().ref();
    var obj = $firebaseObject(ref);

    var gameRef = ref.child('games').child($stateParams.gameName);
    var gameArr = gameRef.child($stateParams.gameName);

    var deckRef = gameRef.child('deck');
    var deckArr = $firebaseArray(deckRef);

    var currPlayerRef = gameRef.child('currentPlayerIdx');
    var currPlayerArr = $firebaseArray(currPlayerRef);

    var playersRef = gameRef.child('players');
    var firebasePlayersArr = $firebaseArray(playersRef);

    var markersRef = gameRef.child('availableMarkers');
    var markersArr = $firebaseArray(markersRef);

    var spaceRef = gameRef.child('spaces');
    var spaceObj = $firebaseObject(spaceRef);
    var spaceArr = $firebaseArray(spaceRef);

    var player = Object.create(Player.prototype);


    /****************
    INITIALIZING GAME
    ****************/

    // new local game with game name defined by url
    $scope.game = new Game($stateParams.gameName);

    $scope.spaces = _.flatten($scope.game.board);
    console.log($scope.spaces);


    //when the deck is loaded...
    deckArr.$loaded().then(function(data) {

        $scope.game.deck = deckArr; //add the deck to the local game ?

        //don't start watching players until there is a deck in the game
        playersRef.on("value", function(snap) {

            var snapPlayers = snap.val(); //grab the value of the snapshot (all players in game in Firebase)

            // for each player in this collection...
            for (var thisPlayer in snapPlayers) {
                var existingPlayerIndex, thisIsANewPlayer;

                // find this 'snap' player's index in local game. find returns that value.
                var localPlayer = $scope.game.players.find(function(plyr, plyrIdx) {

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

            //on login, find me in the firebase players array

            //on login, find me in the firebase players array
            firebase.auth().onAuthStateChanged(function(user) {
                firebasePlayersArr.$loaded()
                    .then(function(players) {
                        if (user) {

                            $scope.me = $scope.game.players.find((player) => player.uid === user.uid);

                            var meIdx;
                            players.find(function(e, i) {
                                if (e.uid === user.uid) meIdx = i;
                            });
                            console.log($scope.game.players);
                            // $scope.game.players = players;
                            // $scope.me = $scope.game.players[meIdx];

                            $scope.me.myidx = meIdx;
                            if (!$scope.me.marker) {
                                $scope.me.marker = null;
                            }
                            $scope.game.currentPlayer = $scope.game.players[0];
                            $scope.myTurn = $scope.me.uid === $scope.game.currentPlayer.uid;
                            console.log($scope.game.currentPlayer);
                            console.log($scope.me.uid);
                            console.log("IS IT MY TURN?", $scope.myTurn);


                            // $scope.me = $scope.game.players.find((player) => player.uid === user.uid);

                            //                 $scope.meIdx;
                            //                 player.find((player, i) => {
                            //                     if (player.uid === user.uid) $scope.meIdx = i
                            //                 });

                            //                 $scope.me.marker = player[$scope.meIdx].marker;
                            //                 $scope.clicked = player[$scope.meIdx].clicked;
                            //                 $scope.me.x = player[$scope.meIdx].x;
                            //                 $scope.me.y = player[$scope.meIdx].y;
                            //                 $scope.me.i = player[$scope.meIdx].i;

                            //                 // $scope.myTurn = $scope.me.uid === $scope.game.currentPlayer.uid;
                            //                 // console.log("IS IT MY TURN?", $scope.myTurn)
                            //             } else {
                            //                 console.log("no one is logged in");
                            //             }
                            //             console.log('im here!!!!!!!!');

                        }

                    });
            });

        });
    });

    // when that markers array is loaded, update the available markers array on scope
    markersArr.$loaded().then(function(data) {

        $scope.game.availableMarkers = data[0];
    });

    //if someone else picks a marker, update your view
    markersRef.on('child_changed', function(data) {
        $scope.game.availableMarkers = data.val();
    });



    currPlayerRef.on('value', function(snap) {
        $scope.game.currentPlayerIdx = snap.val();
        console.log(snap.val());
        $scope.game.currentPlayer = $scope.game.players[$scope.game.currentPlayerIdx];
        console.log($scope.game.players);

        console.log(spaceObj);
        console.log(spaceArr);
        console.log(spaceArr.length <=1);
        if (spaceArr.length <= 1) {
            $scope.myTurn = $scope.me.uid === $scope.game.currentPlayer.uid;
            console.log("IS IT MY TURN?", $scope.myTurn);
        }
    });

    $scope.spaces = _.flatten($scope.game.board);
    console.log($scope.spaces);
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


    $scope.pickMarker = function(marker) {
        pickMarkerFn(marker);
    }


    function pickMarkerFn(marker) {
        console.log($scope.me);
        console.log($scope.me[marker]);
        $scope.me.marker = marker;
        console.log($scope.me.myidx)
        firebasePlayersArr[$scope.me.myidx].marker = marker;
        firebasePlayersArr.$save($scope.me.myidx);


        var idx = $scope.game.availableMarkers.indexOf(marker);
        markersArr[0].splice(idx, 1);
        markersArr.$save(0)
            .then(function() {
                console.log("removed the picked marker");
            });
    }

    // once placed the marker, cannot place again
    $scope.clicked = false;


    $scope.placeMarker = function(point) {
        placeMarkerFn(point);
    };

    var placeMarkerFn = function(point) {
        $scope.me.placeMarker(point, $scope.game.board);
        $scope.me.tiles = $scope.game.deal(3);
        $scope.me.clicked = true;

        console.log($scope.me);

        // FOR SOME REASON I can't just do firebasePlayersArr[$scope.meIdx] = $scope.me;
        firebasePlayersArr[$scope.me.myidx].tiles = $scope.me.tiles;
        firebasePlayersArr[$scope.me.myidx].point = $scope.me.point;
        firebasePlayersArr[$scope.me.myidx].x = $scope.me.x;
        firebasePlayersArr[$scope.me.myidx].y = $scope.me.y;
        firebasePlayersArr[$scope.me.myidx].i = $scope.me.i;
        firebasePlayersArr[$scope.me.myidx].clicked = true;
        firebasePlayersArr.$save($scope.me.myidx);
        return false;
    };

    /****************
    GAMEPLAY ACTIONS
    ****************/

    // TODO: need a function to assign dragon
    $scope.dragon;
    var awaitingDragonHolders = [];

    $scope.start = function() {
        //
    };

    // these are tied to angular ng-click buttons
    // TODO: doesn't work
    $scope.rotateTileCw = function(tile) {
        tile.rotation++;
        if (tile.rotation === 4) tile.rotation = 0; //set rotation to be between 0 and 3
        console.log("rotate cw", tile.rotation);
    };

    $scope.rotateTileCcw = function(tile) {
        console.log("ccw original", tile.rotation)
        tile.rotation--;
        if (tile.rotation === -4) tile.rotation = 0; //set rotation to be between -0 and -3
        if (tile.rotation < 0) tile.rotation += 4 //set it to be between +0 and +3
        console.log('rotate ccw', tile.rotation);
    };


    // CMT: use player's and game's prototype function to place tile and then move all players
    $scope.placeTile = function(tile) {
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

    spaceRef.on('child_added', function(snapshot) {
        console.log("got a tile", snapshot.val())
        var addedTile = snapshot.val();
        var spaceKey = snapshot.key;
        var x = +spaceKey.slice(-2, -1);
        var y = +spaceKey.slice(-1);

        var space = $scope.game.board[y][x]; // look space up in game.board

        space.image = addedTile.img;
        space.rotation = addedTile.rotation;
        var tile = gameFactory.tiles[addedTile.tileId]; // look up tile by id
        console.log("tile", tile, "snapshot.val().rotation", snapshot.val().rotation)
        var rotatedTile = gameFactory.rotateTile(tile, snapshot.val().rotation); // rotate tile
        console.log(rotatedTile, "rotated")
        for (var i = 0; i < rotatedTile.paths.length; i++) {
            // if the point doesn't have neighbors... set to empty array
            if (!space.points[i].neighbors) space.points[i].neighbors = [];
            // set each point's neighbors to it's corresponding point
            space.points[i].neighbors.push(space.points[rotatedTile.paths[i]]);
        }
        // trigger move
        console.log("spaceRef",  x, typeof $scope.me.x)
        if ($scope.me.x === x && $scope.me.y === y) {
            console.log("inside if")
            console.log(x, y, i)
                // $scope.me.move($scope.game.board);
                // $scope.me.point = $scope.me.move($scope.game.board);
            console.log("in on", $scope.me, "meidx", $scope.me.myidx);

            // TODO: this doesn't send to firebase
            console.log($scope.me.x, $scope.me.y, $scope.me.i)
            //weird... scope.me.x/y/i don't match i/x/y
            firebasePlayersArr[$scope.me.myidx].x = x;
            firebasePlayersArr[$scope.me.myidx].y = y;
            firebasePlayersArr[$scope.me.myidx].i = i;
            firebasePlayersArr.$save($scope.me.myidx).then(function(ref) {
                    console.log("made it to adding the indexes")
                })
                .catch(function(err) {
                    console.log(err);
                })

            console.log($scope.me.move($scope.game.board));

            // firebasePlayersArr[$scope.me.myidx].point = $scope.me.move($scope.game.board);
            // firebasePlayersArr.$save($scope.me.myidx).then(function(ref) {
            //         console.log(ref.key)
            //     })
            //     .catch(function(err) {
            //         console.log(err);
            //     })
                // syncWithFirebase();

            $scope.me.move($scope.game.board);

            console.log(firebasePlayersArr.length);
            console.log(currPlayerArr.length);
            console.log(currPlayerArr);

            var nextPlayerIdx = $scope.game.currentPlayerIdx + 1 >= firebasePlayersArr.length ? 0 : $scope.game.currentPlayerIdx + 1;
            gameRef.update({ "currentPlayerIdx": nextPlayerIdx });
        };
    });

    $scope.leaveGame = function() {
        console.log("i'm out");


        firebasePlayersArr.$loaded()
            .then(function(players) {
                //find me in the firebase players array
                var meIdx;

                players.find(function(e, i) {
                    if (e.uid === $scope.me.uid) meIdx = i;
                });

                // remove the player from firebase
                firebasePlayersArr.$remove(firebasePlayersArr[meIdx]);
            });
        $state.go('pickGame');
    };


    // TODO: need to remove this game room's moves from firebase?
    $scope.reset = function() {
        spaceObj.$remove()


        markersArr.$remove(0)
            .then(function(ref) {
                console.log("removed all markers", ref.key);
            });

        deckArr.$remove(0)
            .then(function(ref) {
                console.log("removed the deck", ref.key);
            });

        //JC: Clear out the spaces

        var tiles = gameFactory.tiles;
        var deck = new Deck(tiles).shuffle().tiles;
        deckArr.$add(deck);

        currPlayerArr.$remove(0)
            .then(function() {
                currPlayerArr.$add([0])
            })

        markersArr.$add(gameFactory.markers);

        gameRef.set({
            'name': gameName,
            'currentPlayerIdx': 0
        });

        firebasePlayersArr.$loaded().then(function(data) {
            for (var i = 0; i < data.length; i++) {
                data[i].clicked = true;
                data[i].i = null;
                data[i].x = null;
                data[i].y = null;
                data[i].clicked = false;
                data[i].canPlay = null;
                data[i].marker = null;
                data[i].point = null;
                data[i].tiles = null;
                players.$save(i);
            }
        });


        $state.reload();

        console.log($scope.me);
    };

    $scope.starttop = boardFactory.starttop;
    $scope.startleft = boardFactory.startleft;
    $scope.startbottom = boardFactory.startbottom;
    $scope.startright = boardFactory.startright;
});

tsuro.directive('tile', function() {
    return {
        templateUrl: 'browser/js/game/tile.directive.html',
        scope: {
            'thisTile': '=',
            'tryTile': '&tryTile',
            'rotateccw': '&rotateccw',
            'rotatecw': '&rotatecw',
            'place': '&place',
            'myTurn': '='
                // 'myTurn': '&myTurn'
        }
    };
});