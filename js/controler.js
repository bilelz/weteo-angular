app.controller(
        'HomeController',
        function($scope,$rootScope, $location, $http, $mdToast, $mdDialog, $timeout, Fav) {
   
   $scope.lang = localStorage.getItem("lang");
	$scope.units = localStorage.getItem("units");

   $scope.showAdvanced = function(ev, name, id) {
    $mdDialog.show({
      controller: DialogController,
      templateUrl: 'html/dialog.tmpl.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true
    })
    .then(function(answer) {
      $scope.status = 'You said the information was "' + answer + '".';
    }, function() {
      $scope.status = 'You cancelled the dialog.';
    });
  };
   
   
	$scope.rechercheID = function(id) {
			$rootScope.loadingClass = "zoomOut";

			$timeout(function() {
				$rootScope.loadingClass = "bounceIn";
			}, 1000 / 2);

			$http.get('http://api.openweathermap.org/data/2.5/weather?id=' + id + '&units=' + $scope.units + '&lang=' + $scope.lang + '&appid=2de143494c0b295cca9337e1e96b00e0')
					.success(function(data) {
								$rootScope.currentID = data.id;
								$rootScope.meteo = data;
								$rootScope.loadingMsg = "";
								localStorage.setItem("cityID", data.id);
								$rootScope.isFav = isFav(id);
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
						$scope.chart($rootScope.forecast[0]);
					}).error(function(data) {
						$rootScope.loadingMsg = "Erreur pour les données sur 5 jours...";
					});
		};
		
		 $scope.favIt = function(id, label, lat, lon) {
		 	if(!isFav(id)){
				var favlist = JSON.parse(localStorage.getItem("favorites"));				
				
				var fav = new Object();
				fav = { "label" : label, "id" : id, "lat" : lat, "lon" : lon };
				
				favlist.push(fav);
				localStorage.setItem("favorites", JSON.stringify(favlist));
				$rootScope.isFav = true;
				
				$rootScope.favList = JSON.parse(localStorage.getItem("favorites")).sort(comparator);
			}
		};
		
		$scope.removefavIt = function(_id) {
		 	removefav(_id);
			$rootScope.isFav = false;
			$rootScope.favList = JSON.parse(localStorage.getItem("favorites")).sort(comparator);
		};
		
		$scope.chart = function(item) {
			chartIt(item);
		};
		
	if (localStorage.getItem("cityID") != "") {
			cityID = localStorage.getItem("cityID");
			$scope.rechercheID(cityID);
	}
});

function DialogController($scope, $mdDialog) {
  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
  };
}

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

	var lastDay = "", index = 0;

	for (var i = 0; i < dataList.list.length; i++) {
				
		if (dataList.list[i].dt_txt.substring(0, 10) == lastDay) {
			
			
			
			days.list[days.list.length-1].dayDetailList.push(dataList.list[i]);
			

		} else {
			
			days.list.push(dataList.list[i]);
			
			days.list[days.list.length-1].dayDetailList = [];
			
			days.list[days.list.length-1].dayDetailList.push(dataList.list[i]);
			days.list[days.list.length-1].index = index++;
			
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

function chartIt(item) {
		console.log(item);
		var chartData = [];
			for(var i=0; i<item.dayDetailList.length;i++){
			chartData.push([item.dayDetailList[i].dt*1000, 
							Math.ceil(item.dayDetailList[i].main.temp)]);	
		 	}		 	
	
			var options = {
				chart : {
					renderTo : 'container' + item.index,
					type : 'spline',
					backgroundColor: '#000028',
					animation : "false"
				},
				title : { text : '' },
				yAxis : [{ visible : false }],
				xAxis : {
					type : 'linear',
					ordinal : false,
					labels : { format : '{value:%Hh}' },
					formatter : function() {
						return parseInt((Highcharts.dateFormat('%H', this.value)), 10);	
					},
					tickInterval : 3*3600 * 1000 // un trait toutes les heures
				},
	
				plotOptions : {
					series : {
						dataLabels : {
							enabled : true,
							 format: '{y}°',
							 useHTML : false,
							 animation: false,
							 style : {
							 	color : "white",
							 	textShadow : "none"
							 }
						}
					},
					spline: {
                marker: {
                    enabled: true
                }
            }
				},
				legend : {  enabled : false, },
				scrollbar : { enabled : false },
				rangeSelector : { enabled : false },
				credits : { enabled : false },
				exporting : { enabled : false },
				navigator : { enabled : false, height : 0 },
				series : [{	color: '#FF4081',
            				type : "areaspline",
            				marker: {
            					enabled :"true",
                    fillColor: '#FF4081'
                },
            				fillColor : {
         	 				linearGradient : [0, 0, 0, 100],
					              			stops : [  [0, "#FF4081"],
									                [1, 'rgba(2,0,0,0)']]
					            }
           			  }]
			}; 
			
			options.series[0].data = chartData;
			var chart = new Highcharts.StockChart(options);
		};
