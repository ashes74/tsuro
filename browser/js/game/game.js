tsuro.config(function ($stateProvider) {
	$stateProvider.state('game', {
		url: '/game/',
		templateUrl: '/js/game/game.html',
		controller: 'gameCtrl',
	});
});

tsuro.controller('gameCtrl', function ($scope) {
	$scope.spaces = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];

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

	$scope.availableMarkers = ["red", "orange", "yellow", "green", "aqua", "blue", "navy", "purple"];
	$scope.markerPicked = false;
	$scope.pickMarker = function (marker) {
		$scope.markerPicked = true;
		$scope.availableMarkers = $scope.availableMarkers.filter(function (m) {
			return m !== marker;
		});
	};
});

var spaces = new Array(36);
