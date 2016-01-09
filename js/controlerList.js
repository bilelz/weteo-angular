app.controller(
        'ListController',
        function($scope,$rootScope, $location, $http, $mdToast, $mdDialog, $timeout, Fav, $mdSidenav) {
   
   	$scope.lang = localStorage.getItem("lang");
	$scope.units = localStorage.getItem("units");
   
   
	$rootScope.favList = Fav;   
   

    $scope.rechercheID = function(id) {

			searchViaID(id,$scope, $rootScope, $timeout, $http, $mdSidenav);

			
		};
		
		$scope.chart = function(item) {
			chartIt(item);
		};
		
	$scope.removefav = function(_id) {
		 	removefav(_id);
		 	$rootScope.isFav = isFav($rootScope.currentID);
		 	$rootScope.favList = JSON.parse(localStorage.getItem("favorites")).sort(comparator);
	};
	
	$scope.goSearch = function() {
			document.querySelector('[type="search"]').value = '';
		 	$mdSidenav('left').close();
		 	$mdSidenav('right').open();
	};
});

function comparator(a, b) {
	
	if( a["label"].toLowerCase() > b["label"].toLowerCase()){
        return 1;
    }else if( a["label"].toLowerCase() < b["label"].toLowerCase() ){
        return -1;
    }
    return 0;
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
		localStorage.setItem("favorites", JSON.stringify(favArray.sort(comparator)));
	}
};