var tsuro = angular.module('Tsuro', ['ui.router']);

tsuro.config(function ($urlRouterProvider, $locationProvider) {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    // $locationProvider.html5Mode(true);
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');
});
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

tsuro.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: '/js/home/home.html'
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImdhbWUvZ2FtZS5qcyIsImhvbWUvaG9tZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciB0c3VybyA9IGFuZ3VsYXIubW9kdWxlKCdUc3VybycsIFsndWkucm91dGVyJ10pO1xuXG50c3Vyby5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcbiAgICAvLyBUaGlzIHR1cm5zIG9mZiBoYXNoYmFuZyB1cmxzICgvI2Fib3V0KSBhbmQgY2hhbmdlcyBpdCB0byBzb21ldGhpbmcgbm9ybWFsICgvYWJvdXQpXG4gICAgLy8gJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuICAgIC8vIElmIHdlIGdvIHRvIGEgVVJMIHRoYXQgdWktcm91dGVyIGRvZXNuJ3QgaGF2ZSByZWdpc3RlcmVkLCBnbyB0byB0aGUgXCIvXCIgdXJsLlxuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbn0pOyIsInRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2dhbWUnLCB7XG5cdFx0dXJsOiAnL2dhbWUvJyxcblx0XHR0ZW1wbGF0ZVVybDogJy9qcy9nYW1lL2dhbWUuaHRtbCcsXG5cdFx0Y29udHJvbGxlcjogJ2dhbWVDdHJsJyxcblx0fSk7XG59KTtcblxudHN1cm8uY29udHJvbGxlcignZ2FtZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlKSB7XG5cdCRzY29wZS5zcGFjZXMgPSBbMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgMTAsIDExLCAxMiwgMTMsIDE0LCAxNSwgMTYsIDE3LCAxOCwgMTksIDIwLCAyMSwgMjIsIDIzLCAyNCwgMjUsIDI2LCAyNywgMjgsIDI5LCAzMCwgMzEsIDMyLCAzMywgMzQsIDM1LCAzNl07XG5cblx0JHNjb3BlLnN0YXJ0dG9wID0gW1xuXHRcdFswLCAwLCAwXSxcblx0XHRbMCwgMCwgMV0sXG5cdFx0WzEsIDAsIDBdLFxuXHRcdFsxLCAwLCAxXSxcblx0XHRbMiwgMCwgMF0sXG5cdFx0WzIsIDAsIDFdLFxuXHRcdFszLCAwLCAwXSxcblx0XHRbMywgMCwgMV0sXG5cdFx0WzQsIDAsIDBdLFxuXHRcdFs0LCAwLCAxXSxcblx0XHRbNSwgMCwgMF0sXG5cdFx0WzUsIDAsIDFdXG5cdF07XG5cdCRzY29wZS5zdGFydGxlZnQgPSBbXG5cdFx0WzAsIDAsIDddLFxuXHRcdFswLCAwLCA2XSxcblx0XHRbMCwgMSwgN10sXG5cdFx0WzAsIDEsIDZdLFxuXHRcdFswLCAyLCA3XSxcblx0XHRbMCwgMiwgNl0sXG5cdFx0WzAsIDMsIDddLFxuXHRcdFswLCAzLCA2XSxcblx0XHRbMCwgNCwgN10sXG5cdFx0WzAsIDQsIDZdLFxuXHRcdFswLCA1LCA3XSxcblx0XHRbMCwgNSwgNl1cblx0XTtcblx0JHNjb3BlLnN0YXJ0Ym90dG9tID0gW1xuXHRcdFswLCA1LCAwXSxcblx0XHRbMCwgNSwgMV0sXG5cdFx0WzEsIDUsIDBdLFxuXHRcdFsxLCA1LCAxXSxcblx0XHRbMiwgNSwgMF0sXG5cdFx0WzIsIDUsIDFdLFxuXHRcdFszLCA1LCAwXSxcblx0XHRbMywgNSwgMV0sXG5cdFx0WzQsIDUsIDBdLFxuXHRcdFs0LCA1LCAxXSxcblx0XHRbNSwgNSwgMF0sXG5cdFx0WzUsIDUsIDFdXG5cdF07XG5cdCRzY29wZS5zdGFydHJpZ2h0ID0gW1xuXHRcdFs1LCAwLCAyXSxcblx0XHRbNSwgMCwgM10sXG5cdFx0WzUsIDEsIDJdLFxuXHRcdFs1LCAxLCAzXSxcblx0XHRbNSwgMiwgMl0sXG5cdFx0WzUsIDIsIDNdLFxuXHRcdFs1LCAzLCAyXSxcblx0XHRbNSwgMywgM10sXG5cdFx0WzUsIDQsIDJdLFxuXHRcdFs1LCA0LCAzXSxcblx0XHRbNSwgNSwgMl0sXG5cdFx0WzUsIDUsIDNdXG5cdF07XG5cblx0JHNjb3BlLmF2YWlsYWJsZU1hcmtlcnMgPSBbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJ5ZWxsb3dcIiwgXCJncmVlblwiLCBcImFxdWFcIiwgXCJibHVlXCIsIFwibmF2eVwiLCBcInB1cnBsZVwiXTtcblx0JHNjb3BlLm1hcmtlclBpY2tlZCA9IGZhbHNlO1xuXHQkc2NvcGUucGlja01hcmtlciA9IGZ1bmN0aW9uIChtYXJrZXIpIHtcblx0XHQkc2NvcGUubWFya2VyUGlja2VkID0gdHJ1ZTtcblx0XHQkc2NvcGUuYXZhaWxhYmxlTWFya2VycyA9ICRzY29wZS5hdmFpbGFibGVNYXJrZXJzLmZpbHRlcihmdW5jdGlvbiAobSkge1xuXHRcdFx0cmV0dXJuIG0gIT09IG1hcmtlcjtcblx0XHR9KTtcblx0fTtcbn0pO1xuXG52YXIgc3BhY2VzID0gbmV3IEFycmF5KDM2KTtcbiIsInRzdXJvLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnaG9tZScsIHtcbiAgICAgICAgdXJsOiAnLycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnL2pzL2hvbWUvaG9tZS5odG1sJ1xuICAgIH0pO1xufSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
