app.controller(
        'ListController',
        function($scope,$rootScope, $location, $http, $mdToast, $mdDialog, $timeout, Fav, $mdSidenav) {
   
   	$scope.lang = localStorage.getItem("lang");
	$scope.units = localStorage.getItem("units");
   
   
	$rootScope.favList = Fav;   
   

    $scope.rechercheID = function(id) {
			$rootScope.loadingClass = "zoomOut";
			$rootScope.loadingMsg = "Recherche en cours...";

			$timeout(function() {
				$rootScope.loadingClass = "bounceIn";
				// $scope.meteo = {name:"Searching..."};

			}, 1000 / 2);

			$http.get('http://api.openweathermap.org/data/2.5/weather?id=' + id + '&units=' + $scope.units + '&lang=' + $scope.lang + '&appid=2de143494c0b295cca9337e1e96b00e0')
					.success(function(data) {
								$rootScope.currentID = data.id;
								$rootScope.meteo = data;
								$rootScope.loadingMsg = "";
								localStorage.setItem("city", data.name);
								localStorage.setItem("cityID", data.id);
								$rootScope.isFav = isFav(id);
								$mdSidenav('left').close();
								window.scrollTo(0,0);
					}).error(function(data) {
								$rootScope.meteo = {
									name : "Hum. Error... please retry."
								};
								$rootScope.loadingMsg = "";
							});

			$http.get('http://api.openweathermap.org/data/2.5/forecast?id='+ id + '&units=' + $scope.units + '&lang=' + $scope.lang + '&appid=2de143494c0b295cca9337e1e96b00e0')
					.success(function(data) {
						$rootScope.forecast = parseForecastOneMaxTempByDay2(data);
					}).error(function(data) {
						$rootScope.loadingMsg = "Erreur pour les données sur 5 jours...";
					});
		};
		
	$scope.removefav = function(_id) {
		 	removefav(_id);
		 	$rootScope.isFav = isFav($rootScope.currentID);
		 	$rootScope.favList = JSON.parse(localStorage.getItem("favorites")).sort(comparator);
	};
	
	$scope.goSearch = function() {
		 	$mdSidenav('left').close();
		 	$mdSidenav('right').open();
	};
});

function comparator(a, b) {
    return a["label"] > b["label"];
}

var favListDefault = [{"label":"Paris","id":2988507,"lat":48.85,"lon":2.35},{"label":"Java","id":614217,"lat":42.4,"lon":43.94},{"label":"Jenkins","id":4296229,"lat":37.17,"lon":-82.63},{"label":"Karlstad","id":2701680,"lat":59.38,"lon":13.5},{"label":"Eureka","id":5563397,"lat":40.8,"lon":-124.16},{"label":"Arnac-la-Poste","id":3036879,"lat":46.27,"lon":1.37}];

if(localStorage.getItem("favorites") == null || localStorage.getItem("favorites") === undefined){
	localStorage.setItem("favorites", JSON.stringify(favListDefault));
}

if(localStorage.getItem("lang") == null || localStorage.getItem("lang") === undefined){
	localStorage.setItem("lang", "en");
}

if(localStorage.getItem("units") == null || localStorage.getItem("units") === undefined){
	localStorage.setItem("units", "metric");
}

if(localStorage.getItem("cityID") == null || localStorage.getItem("cityID") === undefined){
	localStorage.setItem("cityID", 614217);
}
	

function isFav(_id){
	if(localStorage.getItem("favorites") == null || localStorage.getItem("favorites") === undefined){
		return false;
	}
	
	var favlist = JSON.parse(localStorage.getItem("favorites"));
	for (var i in favlist){
		if(favlist[i].id == _id){
			return true;
		}
	}
	return false;
}

 function removefav(_id) {
	 	if(isFav(_id)){
				var favlist = JSON.parse(localStorage.getItem("favorites"));
		var favArray = [];
		
		for (var i in favlist){
				if(favlist[i].id != _id){
					favArray.push(favlist[i]);
				}
		}
		localStorage.setItem("favorites", JSON.stringify(favArray));
	}
};