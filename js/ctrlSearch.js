app.controller(
        'SearchCtrl',
        function($scope,$rootScope, $location, $http, $mdToast, $mdDialog, $timeout, Fav, $mdSidenav) {
   
   $rootScope.lang = localStorage.getItem("lang");
	$rootScope.units = localStorage.getItem("units");
    
    $rootScope.searchForm = {"city":"city"};
    
    $scope.search = function() {
			$rootScope.loadingClass = "zoomOut";
			$rootScope.loadingMsg = "Recherche en cours...";
			var dataToday;

			$timeout(function() {
				$rootScope.loadingClass = "bounceIn";
				// $scope.meteo = {name:"Searching..."};

			}, 1000 / 2);
			

			$http.get('http://api.openweathermap.org/data/2.5/weather?q=' + this.city + '&units=' + $scope.units + '&lang=' + $scope.lang + '&appid=2de143494c0b295cca9337e1e96b00e0')
					.success(function(data) {
							
						if(data.cod == 200){
							dataToday = data;
							$rootScope.currentID = data.id;
							$rootScope.meteo = data;
							
							$rootScope.loadingMsg = "";
							localStorage.setItem("city", data.name);
							localStorage.setItem("cityID", data.id);
							$rootScope.isFav = isFav(data.id);
							
							$mdSidenav('right').close();
							window.scrollTo(0,0);
							
							$http.get('http://api.openweathermap.org/data/2.5/forecast?id='+ data.id + '&units=' + $scope.units + '&lang=' + $scope.lang + '&appid=2de143494c0b295cca9337e1e96b00e0')
								.success(function(forecast) {
									$rootScope.forecast = parseForecastFromScratch(forecast, dataToday);
									$scope.messageError = null;
							
									$timeout(function() {
										$scope.chart($rootScope.forecast[0]);
									}, 0);
								}).error(function(forecast) {
									$rootScope.loadingMsg = "Erreur pour les données sur 5 jours...";
									$rootScope.forecast = null;
								});
								
							
							
						}else{
							$scope.messageError = data.message;
						}
								
					}).error(function(data) {
								$scope.messageError = "Hum. Error... please retry.";
								$rootScope.loadingMsg = "";
							});
			
		$scope.chart = function(item) {
			chartIt(item);
		};
			
		};
});

app.controller('ParamController',  function($scope, $mdToast) {

 	$mdToast.show(
      $mdToast.simple()
        .content('Parameters saved')
        .position('top right')
    );
    
	$scope.myForm = {
		units : localStorage.getItem("units"),
		lang : localStorage.getItem("lang")
	};

	$scope.saveParams = function() {
		localStorage.setItem("units", $scope.myForm.units);
		localStorage.setItem("lang", $scope.myForm.lang);
		$mdToast.show();
	};

} );


