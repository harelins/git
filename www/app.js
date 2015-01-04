// Main configuration file. Sets up AngularJS module and routes and any other config objects
var appRoot = angular.module('hrl', ['ngCookies']);     //Define the main module
appRoot.config(['$httpProvider', function($httpProvider, $routeProvider) {
	
	$httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=UTF-8';
	
}]);
