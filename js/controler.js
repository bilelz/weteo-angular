app.controller(
        'HomeController',
        function($scope,$rootScope, $location, $http, $mdToast, $mdDialog, $timeout, Fav, $mdSidenav) {
   
   $scope.lang = localStorage.getItem("lang");
	$scope.units = localStorage.getItem("units");

   $scope.showAdvanced = function(ev, label, id) {
    $mdDialog.show({
      controller: DialogController,
      templateUrl: 'html/dialog.tmpl.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
                locals:{
                	label : label,
                	id : id,
                	protocol : document.location.protocol,
                	host : document.location.host
                }
    })
        .then(function(answer) {
          $scope.status = 'You said the information was "' + answer + '".';
        }, function() {
          $scope.status = 'You cancelled the dialog.';
        });
  };
   
   
	$scope.rechercheID = function(id) {
			searchViaID(id,$scope, $rootScope, $timeout, $http, $mdSidenav);
		};
		
		$scope.favToggle = function(id, label, lat, lon) {
		 	if(!isFav(id)){
				var favlist = JSON.parse(localStorage.getItem("favorites"));				
				
				var fav = new Object();
				fav = { "label" : label, "id" : id, "lat" : lat, "lon" : lon };
				
				favlist.push(fav);
				localStorage.setItem("favorites", JSON.stringify(favlist));
				$rootScope.isFav = true;
				
				$rootScope.favList = JSON.parse(localStorage.getItem("favorites")).sort(comparator);
			}else{
				removefav(id);
				$rootScope.isFav = false;
				$rootScope.favList = JSON.parse(localStorage.getItem("favorites")).sort(comparator);
			}
		};
		
		
		$scope.chart = function(item) {
			chartIt(item);
		};
		
		function comparator(a, b) {
		    return a["label"] > b["label"];
		}
		
	if (localStorage.getItem("cityID") != "") {
			cityID = localStorage.getItem("cityID");
			$scope.rechercheID(cityID);
	}
});

function DialogController($scope, $mdDialog, locals) {
	
	$scope.locals = locals;
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

function parseForecastFromScratch(dataList, dataToday) {
	var daysList = [];
	dataToday.sys.pod = (dataToday.dt>dataToday.sys.sunrise && dataToday.dt<dataToday.sys.sunset)?'d':'n';
	dataToday.dt_txt = new Date(dataToday.dt*1000).toISOString();
	var lastDay = dataToday.dt_txt.substring(0, 10);
	console.log(lastDay);
	
	var minTempAllDay = 0, maxTempAllDay = 0;
	
	daysList.push(dataToday);
	
	for (var i = 0; i < dataList.list.length; i++) {
				
		if (dataList.list[i].dt_txt.substring(0, 10) != lastDay) {
			daysList.push(dataList.list[i]);
			lastDay = dataList.list[i].dt_txt.substring(0, 10);
			console.log(lastDay);
		}
		
		if(dataList.list[i].main.temp > maxTempAllDay){
			maxTempAllDay = dataList.list[i].main.temp;
		} else if(dataList.list[i].main.temp < minTempAllDay){
			minTempAllDay = dataList.list[i].main.temp;
		}
	}
	
	console.log(daysList);
	
	// pour chaque jour, on met une liste de donnée par heure
	for (var i = 0; i < daysList.length; i++) {
		
		daysList[i].index = i;
		daysList[i].minTemp = minTempAllDay;
		daysList[i].maxTemp = maxTempAllDay;
		daysList[i].dayDetailList = [];
		daysList[i].currentDayPod = dataToday.sys.pod;
		
		var minTemp = 1000, maxTemp = -3000, iconID = 800;
		
		for(var j=0; j < dataList.list.length; j++){
			
			if (dataList.list[j].dt_txt.substring(0, 10) == daysList[i].dt_txt.substring(0, 10)) {
				
				var tmp = new Object();
				
				tmp = JSON.parse(JSON.stringify(dataList.list[j]));
				
				daysList[i].dayDetailList.push(tmp);
				console.log(dataList.list[j].dt_txt  + " " + dataList.list[j].main.temp);
				
				if(dataList.list[j].main.temp < minTemp){
					minTemp = dataList.list[j].main.temp ;
				} 
				 if(dataList.list[j].main.temp > maxTemp){
					maxTemp = dataList.list[j].main.temp ;
					iconID = dataList.list[j].weather[0].id ;
				}
			}
		}	
		
		if(maxTemp != -3000){
			daysList[i].main.temp = maxTemp;
		daysList[i].weather[0].id = iconID;
		}
		
		
		
	}
	
	console.log(daysList);
	return((daysList));

	
}



function chartIt(item) {
		console.log(item.minTemp + '|' +item.maxTemp );
		
		var chartData = [];
		for(var i=0; i<item.dayDetailList.length;i++){
			chartData.push([item.dayDetailList[i].dt*1000,  
							Math.round(item.dayDetailList[i].main.temp),
							item.weather[0].id]);	
	 	}		 	
	
			var options = {
				chart : {
					renderTo : 'container' + item.index,
					type : 'spline',
					backgroundColor: 'transparent', 
					animation : "false",
            marginLeft: 0,
            marginRight : 0
				},
				title : { text : '' },
				yAxis : [{ visible : false, min: item.minTemp, max: item.maxTemp }],
				xAxis : {
					type : 'linear',
					ordinal : false,
					tickLength: 3,
		            tickWidth: 0,
		            tickPosition: 'inside',
		            tickColor : 'white',
		            lineWidth: 0,
		            labels: {
		            	format : '{value:%Hh}',
		                align: 'center',
		                x: 0,
		                y: -5,
		                style : {"color":"#ffffff"}
		            },
					formatter : function() {
						return parseInt((Highcharts.dateFormat('%H', this.value)), 10);	
					},
					tickInterval : 3*3600 * 1000 // un trait toutes les heures
				},
	
				plotOptions : {
					series : {
						animation : false,
						dataLabels : {
							enabled : true,
							 format: '{y}°',
							 useHTML : false,
							 animation: false,
							 style : {
							 	color : '#ffffff',
							 	textShadow : "none",
							 	fontWeight: 'normal'
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
         	 				linearGradient : [0, 0, 0, 200],
					              			stops : [  [0, '#FF4081'],    
									                [1, 'rgba(255,255,255,0)']]
					            }
           			  }]
			}; 
			
			options.series[0].data = chartData;
			var chart = new Highcharts.StockChart(options);
		};
