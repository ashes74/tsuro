tsuro.config(function ($stateProvider) {
    $stateProvider.state('login', {
        url: '/login',
        templateUrl: '/browser/js/login/login.html',
        controller: 'loginCtrl'
    });
});

tsuro.controller('loginCtrl', function ($scope, $state, $firebaseAuth, $rootScope) {
    var auth = $firebaseAuth();
		var provider = new firebase.auth.GoogleAuthProvider();

    $scope.logInWithGoogle = function () {
        auth.$signInWithPopup(provider)
				.then(function (authData) {
            console.log("Logged in as:", authData);
            $rootScope.currentUser = authData;
            $state.go('pickGame');
        }).catch(function (error) {
					$scope.error = "Something went wrong"; //TODO: provide a user friendly error message
            console.error("Authentication failed:", error);
        });

    };

});
