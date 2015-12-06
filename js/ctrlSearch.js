app.controller(
        'SearchCtrl',
        function($scope,$rootScope, $location, $http, $mdToast, $mdDialog, $timeout, Fav, $mdSidenav) {
   
   $rootScope.lang = localStorage.getItem("lang");
	$rootScope.units = localStorage.getItem("units");
    
    $rootScope.searchForm = {"city":"city"};
    
    $scope.search = function() {
			$rootScope.loadingClass = "zoomOut";
			$rootScope.loadingMsg = "Recherche en cours...";

			$timeout(function() {
				$rootScope.loadingClass = "bounceIn";
				// $scope.meteo = {name:"Searching..."};

			}, 1000 / 2);
			

			$http.get('http://api.openweathermap.org/data/2.5/weather?q=' + this.city + '&units=' + $scope.units + '&lang=' + $scope.lang + '&appid=2de143494c0b295cca9337e1e96b00e0')
					.success(function(data) {
							
							if(data.cod == 200){
								$rootScope.currentID = data.id;
								$rootScope.meteo = data;
								
								$rootScope.loadingMsg = "";
								localStorage.setItem("city", data.name);
								localStorage.setItem("cityID", data.id);
								$rootScope.isFav = isFav(data.id);
								
								$mdSidenav('right').close();
								window.scrollTo(0,0);
								
								$http.get('http://api.openweathermap.org/data/2.5/forecast?id='+ data.id + '&units=' + $scope.units + '&lang=' + $scope.lang + '&appid=2de143494c0b295cca9337e1e96b00e0')
									.success(function(data) {
										$rootScope.forecast = parseForecastOneMaxTempByDay2(data);
									}).error(function(data) {
										$rootScope.loadingMsg = "Erreur pour les données sur 5 jours...";
									});
									
								
								
							}else{
								$scope.messageError = data.message;
							}
								
					}).error(function(data) {
								$scope.messageError = "Hum. Error... please retry.";
								$rootScope.loadingMsg = "";
							});
			
			
			
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



function parseForecastOneMaxTempByDay(data) {
	var days = {
		list : []
	};
	
	var lastDay = "";
	var lastMaxTemp = -200;
	var maxIdPerDay = 0;
	var idx = 0;

	for (var i = 0; i < data.list.length; i++) {
				
		if (data.list[i].dt_txt.substring(0, 10) != lastDay) {
			
			
			lastDay = data.list[i].dt_txt.substring(0, 10);
			maxIdPerDay = i;
			if (i > 1) {
				data.list[i - 1].maxTemp = lastMaxTemp;
				lastMaxTemp = data.list[i - 1].main.temp;
			}
			
			
			days.list.push(data.list[maxIdPerDay]);
			days.list[days.list.length-1].dayDetailList = [];
			days.list[days.list.length-1].dayDetailList.push(data.list[i]);
			
			lastMaxTemp = -200;

		} else {
			// stock l'id du moment le plus chaud
			if (data.list[i].main.temp > lastMaxTemp) {
				lastMaxTemp = data.list[i].main.temp;
				maxIdPerDay = i;
			}
			
			days.list[days.list.length-1].dayDetailList.push(data.list[i]);
			
		}
	}
	return days;
}

function parseForecastOneMaxTempByDay2(dataList) {
	var days = {
		list : []
	};
	
	var lastDay = "";

	for (var i = 0; i < dataList.list.length; i++) {
				
		if (dataList.list[i].dt_txt.substring(0, 10) == lastDay) {
			
			
			
			days.list[days.list.length-1].dayDetailList.push(dataList.list[i]);
			

		} else {
			days.list.push(dataList.list[i]);
			
			days.list[days.list.length-1].dayDetailList = [];
			
			days.list[days.list.length-1].dayDetailList.push(dataList.list[i]);
			
		}
		lastDay = dataList.list[i].dt_txt.substring(0, 10);
	}
	return getMaxTempPerDay(days);
}


function getMaxTempPerDay(data){
	
	for (var i = 0; i < data.list.length; i++) {
		for (var j = 0; j < data.list[i].dayDetailList.length; j++) {
			if(data.list[i].dayDetailList[j].main.temp > data.list[i].main.temp){
				data.list[i].main.temp = data.list[i].dayDetailList[j].main.temp;
				data.list[i].sys.pod = data.list[i].dayDetailList[j].sys.pod;
				data.list[i].weather[0].description = data.list[i].dayDetailList[j].weather[0].description;
			}
		}
	}
	
	
	return data;
	
}
