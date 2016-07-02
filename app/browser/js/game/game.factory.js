'use strict';
//
tsuro.factory('GameFactory', function() {

	return {
		firebasePlayersArr:null,
		findMyself(myId){

		}
		dealCard(player){
			// if there is no cards in the deck
			if ($scope.game.deck.length ===0) {
				//add me to the queue
				console.log("add me to the dragon list");
				awaitingDragonHolders.push($scope.me);
			}

				$scope.dragon = awaitingDragonHolders.shift()
			while (awaitingDragonHolders.length>0 && $scope.game.deck.length > 0 ) {
				//assign the dragon
				console.log(`${$scope.dragon} is the dragon`);
				var meIdx = getPlayerIndex(players, $scope.me, "uid");

			}
			// // If deck is empty & no one is dragon, set me as dragon
			// if ($scope.game.deck.length === 0 && !$scope.dragon) {
			// 	$scope.dragon = $scope.me;
			// 	console.log("set dragon to me")
			// } else if ($scope.game.deck.length === 0 && $scope.dragon) {
			// 	awaitingDragonHolders.push($scope.me);
			// 	console.log("I'm waiting for to be a dragon")
			// } else {
			// 	console.log("give me a tile")
			// 	firebasePlayersArr.$loaded()
			// 	.then(function (players) {
			// 		//find me in the firebase players array
			// 		var meIdx = getPlayerIndex(players, $scope.me, "uid");
			// 		// players.find(function (e, i) {
			// 		// 	if (e.uid === $scope.me.uid) meIdx = i;
			// 		// });
			//
			// 		//set firebase me to local me
			// 		firebasePlayersArr[meIdx].tiles = $scope.me.tiles.concat($scope.game.deal(1));
			// 		console.log("dealed one tile to me!");
			//
			// 		//save it
			// 		firebasePlayersArr.$save(meIdx);
			//
			// 		$scope.me = firebasePlayersArr[meIdx];
			// 	});
			//
			// 	while ($scope.dragon && $scope.game.deck.length) {
			// 		$scope.dragon.tiles.push($scope.game.deal(1));
			// 		firebasePlayersArr.$loaded()
			// 		.then(function (players) {
			// 			//find me in the firebase players array
			// 			var meIdx = getPlayerIndex(players, $scope.dragon, "uid");
			// 			// players.find(function (e, i) {
			// 			// 	if (e.uid === $scope.dragon.uid) meIdx = i;
			// 			// });
			//
			// 			//set firebase me to local me
			// 			firebasePlayersArr[meIdx] = $scope.dragon;
			//
			// 			//save it
			// 			firebasePlayersArr.$save(meIdx);
			// 		});
			//
			// 		$scope.dragon = $scope.awaitingDragonHolders.shift() || null;
			// 	}
			// }

		}
		dragonDeal{

		}
	}

})
