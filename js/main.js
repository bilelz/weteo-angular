var app = angular.module( 'weteoApp', [ 'ngMaterial', 'ngRoute' ] );

app.config(['$routeProvider',
	function($routeProvider) {
	
		/* URL associée : http://127.0.0.1:8080/#/home */
		$routeProvider.when('/home', {
			controller : 'HomeController',	templateUrl : 'html/home.html'
		})
		//.when('/:cityLabel/:cityId', {controller:'MainController', templateUrl:'html/home.html'})
		/* URL associée : http://127.0.0.1:8080/#/param */
		.when('/param', { controller : 'ParamController',	templateUrl : 'html/param.html' })
		.when('/list', { controller : 'ListController',	templateUrl : 'html/list.html' })
		.when('/', { controller : 'AppCtrl',	templateUrl : 'html/index.html' })
		/* Si l'URL est inconnue, on redirige vers la page #/home */
		.otherwise({
			redirectTo : '/'
		});
}]);


app.service('Fav', function () {
    return JSON.parse(localStorage.getItem("favorites")).sort(comparator);
});