'use strict';

/* Find Location Controller Logic*/

angular.module('sdi')

    /**
    * @ngdoc
    * @name sdi.Controller:findLocationController
    * @url '/map'
    * @template map.html
    * @description 
    *           find locatoin
    * param 
    *     all dependencies
    */
    .controller('findLocationController', ['$rootScope', '$scope', '$routeParams', '$timeout', '$location', '$q', 'serviceData', 'serviceAuth', 'serviceGlobal', 'serviceExamCode', function ($rootScope, $scope, $routeParams, $timeout, $location, $q, serviceData, serviceAuth, serviceGlobal, serviceExamCode) {
            if (!serviceGlobal.userSession.mrn && !serviceAuth.isAuthenticated()) {
                  $location.path('/login');
                  return false;
            }
            if(serviceGlobal.appointment.completedStep < 2){
                  $location.path("/" + serviceGlobal.appointment.getLastStep());
                  return false;
            }
            $("#loading2, .overlay2").hide();

          $scope.locationRange = [{ id: '5', name: '+ 5 Miles' },{ id: '10', name: '+ 10 Miles' },{ id: '25', name: '+ 25 Miles' },{ id: '50', name: '+ 50 Miles' }];
            
            $scope.range = { id: '5', name: '+ 5 Miles' };
             
             
        /**
        * @ngdoc
        * @name sdi.Controller:function:CenterControl
        * @param {tag name} created div, {object} map object
        * @description 
        *            initialize google map on location module
       */    
              
        var CenterControl = function(controlDiv, map) {
               // Set CSS for the control border
              var controlUI = document.createElement('div');
              controlUI.style.backgroundColor = 'rgba(255, 255, 255, .8)';
              controlUI.style.border = '2px solid rgba(255, 255, 255, .2)';
              //controlUI.style.opacity = '0.8';
              controlUI.style.borderRadius = '3px';
              //controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
              controlUI.style.cursor = 'pointer';
              controlUI.style.marginBottom = '22px';
              //controlUI.style.textAlign = 'center';
              controlUI.title = 'Click to recenter the map';
              controlDiv.appendChild(controlUI);
            
              // Set CSS for the control interior
              var controlText = document.createElement('div');
              controlText.style.color = 'rgb(25,25,25)';
              controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
              controlText.style.fontSize = '16px';
              //controlText.style.lineHeight = '38px';
              controlText.style.paddingLeft = '5px';
              controlText.style.paddingRight = '5px';
              //controlText.style.width = '340px';
              controlText.innerHTML = '<div class="row"><div class="medium-6 columns"><div class="map-vrl-cnt-text"><div class="border"><img src="images/valley-icon-blue-shadow.png"><span>VALLEY<br /> RADIOLOGISTS</span></div></div></div><div class="medium-6 columns"><div class="map-smil-cnt-text"><img src="images/scottsdale-icon-cyan-shadow.png"><span>SCOTTSDALE MEDICAL IMAGING</span></div></div></div';
              controlUI.appendChild(controlText);
             
               // Setup the click event listeners: simply set the map to
               //google.maps.event.addDomListener(controlUI, 'click', function() {
               //  map.setCenter(chicago)
               //});
             
        }             
             
             
             
             
             
          // global var for google map
          var geocoder;
          var map;
          var oms;
          /**
           * @ngdoc
           * @name npl.Controller:function:initialize
           * @description 
           *            initialize google map on location module
          */
           $scope.initialize = function () {
              if(google && google.maps && google.maps.Geocoder){
                  geocoder = new google.maps.Geocoder();
                var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
                var isScrollwheel = w > 480 ? true : false;
                var zoomVal = w > 480 ? 10 : 8;
                  var mapOptions = {
                        zoom:zoomVal,
                        center: new google.maps.LatLng(33.488007, -112.08043090000001),
                        draggable: true,
                        disableDoubleClickZoom: isScrollwheel,
                        scrollwheel: isScrollwheel,
                        zoomControl: true,
                        panControl: true,
                        mapTypeControl: true,
                        streetViewControl: true,
                        mapTypeId: google.maps.MapTypeId.ROADMAP ,
                        tilt: 45,
                    
                  }
                  map = new google.maps.Map(document.getElementById("map"), mapOptions);
                  oms = new OverlappingMarkerSpiderfier(map,{markersWontMove: true, markersWontHide: true});
                     var centerControlDiv = document.createElement('div');
                     var centerControl = new CenterControl(centerControlDiv, map);
                     centerControlDiv.index = 1;
                     map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(centerControlDiv);
              }
            }
             
            $scope.initialize();
            $scope.selectedIndex = '';
            $scope.markersArray = [];
            var infowindow = (google && google.maps && google.maps.InfoWindow) ? new google.maps.InfoWindow() : '';
            var userLat = 33.488007;
            var userLng = -112.08043090000001;
            $scope.userLatLong = new google.maps.LatLng(userLat, userLng);




            /**
             * @ngdoc
             * @name npl.Controller:function:clearMarker
             * @description 
             *        remove markers from the google map on location module
             * @param {array}
             *        array of previous markers
             * @return {array}
             *        return blanck array
            */
            $scope.clearMarker = function(markersArray){
                if (markersArray) {
                  for (var i in markersArray) {
                    markersArray[i].setMap(null);
                  }
                }
                $scope.markersArray = [];
            }


            /**
             * @ngdoc
             * @name npl.Controller:function:renderMarkerOnMap
             * @description 
             *        add markers on google map  
             *        make vice versa selection marker to list and list to marker
             *@param 
             *        {array}data, {array}selectedRow
            */


            var getLatLongByZip = function(zipCode){
                 
                  var deferred = $q.defer();
                  var promise = deferred.promise;
                  var zipCodePattern = /^\d{5}$|^\d{5}-\d{4}$/;
                 
                if(zipCodePattern.test(zipCode)){
                      geocoder.geocode( { 'address': zipCode}, function(results, status) {
                        
                          if (status == google.maps.GeocoderStatus.OK) {
                               var locationLat = results[0].geometry.location.lat();
                               var locationLong = results[0].geometry.location.lng();
                              deferred.resolve(new google.maps.LatLng(locationLat, locationLong)); 
                            } else {
                                //var locationLat = $scope.userLatLong.lat();
                                //var locationLong = $scope.userLatLong.lng();
                                //deferred.resolve(new google.maps.LatLng(locationLat, locationLong)); 
                                deferred.reject('No such location found');
                            }
                     });
                  }else{
                        deferred.reject('No such location found');
                  }
                  return promise;
            }


            var getDistance = function() {
              return (google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(userLat, userLng), $scope.userLatLong) / 1000).toFixed(2);
            }

          
            $scope.filterByDistance = function(){
                infowindow.close();
                if (!$scope.searchBox) {
                  $scope.searchdata =  $scope.RealResponse;  
                  $scope.renderMarkerOnMap($scope.RealResponse, '');
                  $scope.inProgress = '';
                  $scope.range = { id: '5', name: '+ 5 Miles' };      
                }else{
                 getLatLongByZip($scope.searchBox).then(function(userLatLong){
                    
                    var arrayToReturn = [];
                    var distance = $scope.range;
                    var items = $scope.RealResponse;
                    //var zipCode = $scope.searchBox;
                    
                    if (items && distance) {
                    for (var i=0; i<items.length; i++){
                       var locationLatLong = new google.maps.LatLng(items[i].Latitude, items[i].Longitude);
                        items[i].locationLatLongObj = locationLatLong;
                        items[i].distance = getDistance(locationLatLong);   
                      var locationCalculatedDistance = (google.maps.geometry.spherical.computeDistanceBetween(items[i].locationLatLongObj, userLatLong) / 1000).toFixed(2);
                      
                      if ( (Math.round(locationCalculatedDistance * .6214)) <= parseInt(distance.id)) {
                          arrayToReturn.push(items[i]);
                      }
                    }
                  }else{
                  for (var i=0; i<items.length; i++){
        
                    if ($scope.searchBox == items[i].PostalCode) {
                        arrayToReturn.push(items[i]);
                    }
                  }
                }
                  
                  arrayToReturn = (arrayToReturn) ? arrayToReturn.sort(function(a,b) { return parseFloat(a.distance) - parseFloat(b.distance) } ) : [];
                  $scope.searchdata = [];
                  $scope.searchdata =  arrayToReturn;  
                  $scope.renderMarkerOnMap(arrayToReturn, '');
                  $scope.inProgress = '';

                 },function(error){
                    $scope.searchdata = [];
                    $scope.renderMarkerOnMap([], '');
                 });
                }
                
            }
                $scope.triggerMarker = function(data, selectedRow){
                  infowindow.close();
                        //console.log($scope.markersArray[data.indexOf(selectedRow)], data.indexOf(selectedRow));
                        //google.maps.event.trigger($scope.markersArray[data.indexOf(selectedRow)], 'click');
                        var marker = $scope.markersArray[data.indexOf(selectedRow)];
                        if(marker.key != selectedRow.ID){
                                
                                        angular.forEach($scope.markersArray, function(markerObj, key){
                                                markerObj.setOptions({labelClass :'mapLabels'});
                                                ;
                                               if (markerObj.value.LocationType=='SMIL') {
                                                        markerObj.setIcon("/images/location-icon-small-cyan-shadow.png");
                                                }else{
                                                        markerObj.setIcon("/images/location-icon-small-blue-shadow.png");
                                                }
                                        });
                                        marker.setOptions({labelClass :'mapLabels'});
                                        marker.setIcon("/images/location-icon-small-green-shadow.png");
                                        marker.value.AddressLine2 = marker.value.AddressLine2.replace('STE', 'SUITE');
                                        $scope.selectedData = marker.value;
                                        //$scope.renderMarkerOnMap(data, data[marker.key]);
                                        $scope.selectedIndex = marker.value.ID;
                                       if (!$scope.$$phase){$scope.$apply();}
                                        
                                }
                                var markerInfo = '';
                                var addressInfo1 = marker.value.AddressLine1;
                                var AddressLine2 = (marker.value.AddressLine2) ? marker.value.AddressLine2.replace('STE', 'SUITE')+', ' : '';
                                var City = (marker.value.City) ? marker.value.City+', ' : '';
                                var StateCode = (marker.value.StateCode) ? marker.value.StateCode+', ' : '';
                                var PostalCode = (marker.value.PostalCode) ? marker.value.PostalCode : '';
        
                                var addressInfo2 = AddressLine2+City+StateCode+PostalCode;
                                if (marker.value.LocationType=='SMIL') {
                                        
                                        markerInfo = "<div class='map-info-window'><div class='smil-infowin-title'>SCOTTSDALE MEDICAL IMAGING</div><p style='text-transform: uppercase;'>"+addressInfo1+"<br/>"+addressInfo2+"</p></div>";
                                }else{
                                        markerInfo = "<div class='map-info-window'><div class='vrl-infowin-title'>VALLEY RADIOLOGISTS</div><p style='text-transform: uppercase;'>"+addressInfo1+"<br/>"+addressInfo2+"</p></div>";
                                }
                                
                                infowindow.setOptions({content :markerInfo});
                                infowindow.open(map, marker);
                }
           
            $scope.renderMarkerOnMap = function(data, selectedRow){
              $scope.clearMarker($scope.markersArray);
              
              if(serviceGlobal.findLocation.location && ( selectedRow.length == 0 || !selectedRow) ){
                selectedRow = {};
                selectedRow = serviceGlobal.findLocation.location;
                selectedRow.ID = selectedRow.FKID;
                $scope.selectedIndex = selectedRow.FKID;
                
              }
                var markerArr = $scope.markersArray;
                oms.addListener('spiderfy', function(markerArr) {
                  infowindow.close();
                });
                oms.addListener('unspiderfy', function(markerArr) {
                        
                });
                
                oms.addListener('click', function(marker,event) {
                  infowindow.close();
                        if(marker.value.ID !=  $scope.selectedIndex){
                                angular.forEach($scope.markersArray, function(markerObj, key){
                                        markerObj.setOptions({labelClass :'mapLabels'});
                                        
                                        if (markerObj.value.LocationType=='SMIL') {
                                                markerObj.setIcon("/images/location-icon-small-cyan-shadow.png");
                                        }else{
                                                markerObj.setIcon("/images/location-icon-small-blue-shadow.png");
                                        }
                                });
                                marker.setOptions({labelClass :'mapLabels'});
                                marker.setIcon("/images/location-icon-small-green-shadow.png");
                                switch(marker.value.Code){
                                        case 'CDS' :
                                                marker.value.AddressLine2 = 'SUITE 101';
                                        break;
                                        case 'UNHO' :
                                                marker.value.AddressLine2 = 'SUITE 140';
                                        break;
                                        case 'ARHD' :
                                                marker.value.AddressLine2 = 'SUITE K-168';
                                        break;
                                }
                                marker.value.AddressLine2 = marker.value.AddressLine2.replace('STE', 'SUITE');
                                
                                
                                $scope.selectedData = marker.value;
                                $scope.selectedIndex = marker.value.ID;
                                $scope.$apply();
                        }
                        var markerInfo = '';
                        var addressInfo1 = marker.value.AddressLine1;
                        var AddressLine2 = (marker.value.AddressLine2) ? marker.value.AddressLine2.replace('STE', 'SUITE')+', ' : '';
                        var City = (marker.value.City) ? marker.value.City+', ' : '';
                        var StateCode = (marker.value.StateCode) ? marker.value.StateCode+', ' : '';
                        var PostalCode = (marker.value.PostalCode) ? marker.value.PostalCode : '';

                        var addressInfo2 = AddressLine2+City+StateCode+PostalCode;
                        if (marker.value.LocationType=='SMIL') {
                                
                                markerInfo = "<div class='map-info-window'><div class='smil-infowin-title'>SCOTTSDALE MEDICAL IMAGING</div><p style='text-transform: uppercase;'>"+addressInfo1+"<br/>"+addressInfo2+"</p></div>";
                        }else{
                                markerInfo = "<div class='map-info-window'><div class='vrl-infowin-title'>VALLEY RADIOLOGISTS</div><p style='text-transform: uppercase;'>"+addressInfo1+"<br/>"+addressInfo2+"</p></div>";
                        }
                        infowindow.setOptions({content :markerInfo});
                        infowindow.open(map, marker);
                        $('.content').animate({
                                scrollTop:  $('.content').scrollTop() - $('.content').offset().top + $("#row_"+marker.value.ID).offset().top 
                        }, 1000);
                        
                }); 
                
              var marker = [];
              $scope.selectedIndex = (selectedRow) ? selectedRow.ID : false;
              
                if(serviceGlobal.appointment.completedStep >= 3 ){
                        var isLocChanged = false;
                        var registerUnregister = $scope.$watch('selectedIndex', function(newVal, oldVal){
                                if (isLocChanged) {
                                        serviceGlobal.appointment.PendingStep = 3;
                                        serviceGlobal.appointment.completedStep = 2;
                                        serviceGlobal.findLocation = {location : {}};
                                        serviceGlobal.findDate = {appointments : [],appointmentToken : {}};
                                        serviceGlobal.appointmentSlotData = {};
                                        $rootScope.currentStep = serviceGlobal.appointment.completedStep;
                                        registerUnregister();
                                }
                                isLocChanged = true;
                        },true);        
                }
                
              if(data.length > 0){
                // $('#row_'+selectedRow.ID).focus();
                $scope.selectedData = (selectedRow) ? selectedRow : '';
                var locationIndex = 0;
                angular.forEach(data, function(value, key) {
                  
                 var AddressLine1 = (value.AddressLine1) ? value.AddressLine1+', ' : '';
                 switch(value.Code){
                        case 'CDS' :
                                value.AddressLine2 = 'SUITE 101';
                        break;
                        case 'UNHO' :
                                value.AddressLine2 = 'SUITE 140';
                        break;
                        case 'ARHD' :
                                value.AddressLine2 = 'SUITE K-168';
                        break;
                }
                 var AddressLine2 = (value.AddressLine2) ? value.AddressLine2.replace('STE', 'SUITE')+', ' : '';
                 var City = (value.City) ? value.City+', ' : '';
                 var StateCode = (value.StateCode) ? value.StateCode+', ' : '';
                 var PostalCode = (value.PostalCode) ? value.PostalCode : '';


                  var address = AddressLine1+AddressLine2+City+StateCode+PostalCode;
                  var lat = value.Latitude;
                  var lng = value.Longitude;
                  var iconImg = '';
                  var iconClass = '';
                      if(!value.ID){
                        value.ID = value.FKID;
                      }
                      if(selectedRow && value && selectedRow.ID && value.ID == selectedRow.ID){
                        map.setCenter(new google.maps.LatLng(lat, lng));
                        var iconAnimation = google.maps.Animation.BOUNCE;
                        iconImg = '../../images/location-icon-small-green-shadow.png';
                        iconClass = '';
                      }else{
                        var iconAnimation = google.maps.Animation.DROP;
                        if (value.LocationType=='SMIL') {
                                iconImg = "../../images/location-icon-small-cyan-shadow.png";
                        }else{
                                iconImg = "../../images/location-icon-small-blue-shadow.png";
                        }
                      }
                          marker = new MarkerWithLabel({
                              map: map,
                              animation: false,
                              position: new google.maps.LatLng(lat, lng),
                              icon : iconImg,
                              labelContent: (locationIndex+1),
                              labelAnchor: new google.maps.Point(16,42),
                              labelClass: 'mapLabels ' + iconClass, // the CSS class for the label
                              labelInBackground: false
                          });
                          marker.key = key;
                          marker.value = value;
                          marker.value.ID = value.FKID;
                          marker.address = address;
                          locationIndex++;
                          $scope.markersArray.push(marker);
                          oms.addMarker(marker);
                          infowindow.close();
                         
                         /* google.maps.event.addListener(marker, 'click', (function(marker, i) {
                            return function() {
                              /*if(i != selectedRow.ID){
                                $scope.selectedIndex = value.ID;

                                $scope.renderMarkerOnMap(data, data[key]);
                                $scope.$apply();                                
                              }
                              var markerInfo = "<div class='map-info-window'><p>"+address+"</p></div>";
                              infowindow.setOptions({content :markerInfo});
                              infowindow.open(map, marker);
                              * /
                              
                              if(i != selectedRow.ID){
                                        angular.forEach($scope.markersArray, function(markerObj, markerKey){
                                                markerObj.setOptions({labelClass :'mapLabels'});
                                                markerObj.setIcon("/images/pin-black.png");
                                        });
                                        marker.setOptions({labelClass :'mapLabels green-label'});
                                        marker.setIcon("/images/pin-green.png");
                                        $scope.selectedData = data[key];
                                        $scope.selectedIndex = data[key].ID;
                                        $scope.$apply();                                
                                }
                                var markerInfo = "<div class='map-info-window'><p>"+address+"</p></div>";
                                infowindow.setOptions({content :markerInfo});
                                infowindow.open(map, marker);
                                
                            }
                          })(marker, key));*/
                        
                });
              }
            }

            var searchdata = [];
            var idxCounter = 0;
            $scope.renderLatLong = function(data, dataLength, i){
                
                geocoder.geocode( { 'address': data.AddressLine1 + ', ' + data.AddressLine2 + ', ' + data.City + ', ' + data.StateCode + ', '  + data.PostalCode }, function(results, status) {
                      if (status == google.maps.GeocoderStatus.OK) {
                          idxCounter++;
                          data.lat = results[0].geometry.location.lat();
                          data.lng = results[0].geometry.location.lng();
                          var locationLatLong = new google.maps.LatLng(data.lat, data.lng);
                          data.locationLatLongObj = locationLatLong;
                          data.distance = getDistance(locationLatLong);
                          if(searchdata.indexOf(data) === -1){
                              searchdata.push(data);
                          }
                          
                          if(idxCounter == dataLength){
                              searchdata = searchdata.sort(function(a,b) { return parseFloat(a.distance) - parseFloat(b.distance) } );
                              //console.log(searchdata);
                              $scope.RealResponse = searchdata;
                              //$scope.filterByDistance();
                              $scope.searchdata = searchdata;
                              $scope.renderMarkerOnMap($scope.searchdata, '');
                              $scope.inProgress = '';
                              $scope.$apply();
                          }
                          
                        } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {    
                            setTimeout(function() {
                               $scope.renderLatLong(data, dataLength, i);
                            }, 100);
                        } else {
                          idxCounter++;      
                          try {
                              console.error("Geocode was not successful for the following reason: " + status);
                            } catch(e) {}
                       }
                  });
            }


            /**
             * @ngdoc
             * @name npl.Controller:function:searchLocation
             * @description 
             *            seach location by searchKeyword
             * @param 
             *      {string}searchKeyword
            */
            $scope.searchLocation = function(searchValue){
              $scope.inProgress = 'inProgress';
              searchValue = (searchValue) ? searchValue : '';
              var examsCodeArray = [];

              // organization codes
              var locationCodes = serviceExamCode.getExamLocationCode();
              
              // get exam codes by organization code
              for(var i=0; i < locationCodes.length; i++){
                  //serviceGlobal.findLocation.location.Code = locationCodes[i];
                  var examCodeObj = serviceExamCode.getExamCode();
                  var examCodeArray = examCodeObj.commaSeperatedCode.split(",");
                  for(var j=0; j < examCodeArray.length; j++){
                      if(examCodeArray[j]){
                        if(examsCodeArray.indexOf(examCodeArray[j]) === -1){
                            examsCodeArray.push(examCodeArray[j]);
                        }
                      }
                  }
              }
              
              setTimeout(function () { $("#loading2, .overlay2").hide(); }, 2000);
                  $('.search-area').css('border-color', 'solid 1px #e6e8e9');
                  $("#loading2, .overlay2").show();
                  var searchData = {Organizations : locationCodes, ExamCodes : examsCodeArray, searchKeyword : searchValue};
                    serviceData.send('ExamLocationApi/GetExamLocationSearch', searchData).then(function (response) {
                       if(!response.Error && response.Status === 200){
                             
                             /*var searchLocationData = response.data;
                             var dataLength = searchLocationData.length;
                             
                             idxCounter = 0;
                             for(var j = 0; j < searchLocationData.length; j++){
                                  (function(i){
                                     $scope.renderLatLong(searchLocationData[i], dataLength, i);
                                })(j);
                              }*/
                             
                              
                              $scope.RealResponse = response.data;
                              $scope.searchdata = response.data;
                              $scope.renderMarkerOnMap($scope.searchdata, '');
                              $scope.inProgress = '';
                       }else{
                          $scope.inProgress = '';
                       }
                    });

            }
            
            // call this function on page load with blank param
            $scope.searchLocation();
            
            /**
             * @ngdoc
             * @name npl.Controller:function:continueToDate
             * @description 
             *          after selecting a location countinue to appointment date & time module
             * @param 
             *      {array}selectedData
            */
            $scope.inProgressToNext = false;;
            $scope.continueToDate = function(selectedData){
                        $scope.inProgressToNext = true;
                        if(selectedData){
                        selectedData.lat = selectedData.Latitude;
                        selectedData.lng = selectedData.Longitude;
                        serviceGlobal.findLocation.location = selectedData;
                        if(serviceGlobal.appointment.completedStep < 3){
                              serviceGlobal.appointment.completedStep = 3;
                               serviceGlobal.appointment.PendingStep = 0;
                        }                    
                        $location.path("/appointmentDate");
                        return false;
               }
            }

    }]);
