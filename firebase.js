// // <!-- Angular -->
// < script src = "https://ajax.googleapis.com/ajax/libs/angularjs/1.5.5/angular.min.js" > < /script>

// // <!-- Firebase -->
// < script src = "https://www.gstatic.com/firebasejs/3.0.3/firebase.js" > < /script>

// // <!-- AngularFire -->
// < script src = "https://cdn.firebase.com/libs/angularfire/2.0.0/angularfire.min.js" > < /script>

// < script >
//     // Initialize Firebase
//     var config = {
//         apiKey: "AIzaSyA66RYlAJh20GOq04qgLc3c3OKy5yC-zH8",
//         authDomain: "path-of-the-dragon.firebaseapp.com",
//         databaseURL: "https://path-of-the-dragon.firebaseio.com",
//         storageBucket: "path-of-the-dragon.appspot.com",
//     };
//     firebase.initializeApp(config);
// < /script>

var tsuro = require('angular').module('Tsuro', ['ui.router', 'firebase']);
tsuro
    .constant('FB', 'https://path-of-the-dragon.firebaseio.com/')
    .controller("SampleCtrlWithFireBase", function($scope, $firebaseArray, $firebaseObject, FB) {
            $scope.gameName = 'nameOfTheGame';

            var ref = new Firebase("FB");

            //Gets all tiles in a deck to firebase
            var deck = $firebaseArray(ref).child('tiles');
            console.log(deck);

            //With the deck shuffled (e.g. shuffledDeck)...set the game initialDeck
            var setInitialShuffledDeck = function(shuffledDeck) {
                ref.child('games').child($scope.gameName).child('initialDeck').push(shuffledDeck);
            };

            var compileRefURL = function(){
              return ref.child('games').child($scope.gameName);
            }

            //players: {uid : { marker: marker, startingPosition: [x,y,i] }} 
            // This will create the new game in the games object. This first player in the players object will always be the masterPlayer.
            var setPlayersForGame = function(uid, marker, startingPosition) {
                var gameRef = compileRefURL();
                gameRef.child('players').child(uid).push({ 'marker': marker, 'startingPosition': startingPosition});
            }; //If the user doesn't pick the marker here...see next fn

            //Moves - We keep a history of all the moves aka the state of the game
            var pickMarker = function(uid, marker){
              var gameRef = compileRefURL();
             
              //with firebaseArray
              var userRef = new Firebase('FB' + 'games/' + gameName + '/players/' + uid);
              var user = $firebaseArray(userRef);
              user.$add({
                'marker' : marker;
              })

              //with only firebase
              gameRef.child('players').child(uid).push({'marker': marker});
            }
            var setMovesForPlaceTile = function(moveObj) {
                var gameRef = compileRefURL();
                gameRef.child('moves').push({ 'type': moveObj.name });
            }

            //In order to make sure all the players in a game is synchronized with the latest data... we might not need to use apply?

            //For synchronizingGame...
            var synchRef = new Firebase('FB' + games + '/' + $scope.gameName);
            var synchronizedObj = $firebaseObject(synchRef);
            //This returns a promise... you can .then() and assign value to $scope.variable
            synchronizedObj.$bindTo($scope, data); //data is whatever we are calling it in the angular html. 

            //If a player dies, do we need to remove them from the game as a player?
            //We can use $remove, if so... or we can just keep them at the point where they died?


            //How to deploy the game...
            //https://firebase.google.com/docs/hosting/#implementation_path
            //In command lines...1.) firebase init --> name: Path of the Dragon 2.) Directory... where does the index.html? 3.) firebase deploy

//listener child added to maps
//game.applyMove(moveObj){
//game(moveObj.type).apply(game,move);
//}

// ref.child('tiles').push().set([{...}]);