function searchViaID(id, $scope, $rootScope, $timeout, $http, $mdSidenav){
	
	$mdSidenav('left').close();
	
	$timeout(function() {
		$rootScope.loadingClass = "zoomOut";
	
		$timeout(function() {
			$rootScope.loadingClass = "bounceIn";
			
			
			
			window.scrollTo(0,0);
			var dataToday;
	
			$http.get('http://api.openweathermap.org/data/2.5/weather?id=' + id + '&units=' + $scope.units + '&lang=' + $scope.lang + '&appid=2de143494c0b295cca9337e1e96b00e0')
				.success(function(data) {
							
							$rootScope.currentID = data.id;
							dataToday = data;
							$rootScope.meteo = data;
							$rootScope.loadingMsg = "";
							localStorage.setItem("city", data.name);
							localStorage.setItem("cityID", data.id);
							$rootScope.isFav = isFav(id);
							
							
							$http.get('http://api.openweathermap.org/data/2.5/forecast?id='+ id + '&units=' + $scope.units + '&lang=' + $scope.lang + '&appid=2de143494c0b295cca9337e1e96b00e0')
								.success(function(forecast) {
									//parseForecastFromScratch(forecast, dataToday);
									$rootScope.forecast = parseForecastFromScratch(forecast, dataToday);
									
								
									$timeout(function() {
										$scope.chart($rootScope.forecast[0]);
									}, 0);
								}).error(function(forecast) {
									$rootScope.loadingMsg = "Erreur pour les données sur 5 jours...";
									$rootScope.forecast = null;
								});
							
				}).error(function(data) {
							$rootScope.meteo = {
								name : "Hum. Error... please retry."
							};
							$rootScope.loadingMsg = "";
							$rootScope.forecast = null;
						});
		}, 700);
	
	}, 700);
}