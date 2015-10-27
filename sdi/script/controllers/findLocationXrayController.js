'use strict';

/* Find Location Controller Logic*/

angular.module('sdi')

    /**
    * @ngdoc
    * @name sdi.Controller:findLocationXrayController
    * @url '/findLocationXray'
    * @template findLocationXray.html
    * @description 
    *           find locatoin
    * param 
    *     all dependencies
    */
    .controller('findLocationXrayController', ['$scope', '$routeParams', '$timeout', '$location', '$q', 'serviceData', 'serviceAuth', 'serviceGlobal', 'serviceExamCode', function ($scope, $routeParams, $timeout, $location, $q, serviceData, serviceAuth, serviceGlobal, serviceExamCode) {
           if ((!serviceGlobal.userSession.mrn && !serviceAuth.isAuthenticated() || !serviceGlobal.isDontSeeExam) && (serviceGlobal.home.examData[0]!='XRay' && serviceGlobal.patientInfo.wishingExamText===undefined)) {
                  $location.path('/');
                  return false;
            }
            
            $scope.isDontSeeExam = serviceGlobal.isDontSeeExam;
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
           * @name sdi.Controller:function:initialize
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
                    center: new google.maps.LatLng(33.488007, -112.08043090000001),
                    zoom: zoomVal,
                    tilt: 45,
                    draggable: true,
                    scrollwheel: isScrollwheel,
 					          panControl: true,
                    mapTypeControl: true,
                    streetViewControl: true,
                    mapTypeId: google.maps.MapTypeId.ROADMAP ,
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
             * @name sdi.Controller:function:getLatLongByZip
             * @description 
             *        Get lat long by passing zipcode
             *@param 
             *        zipcode (int)
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
                                deferred.reject('No such location found');
                            }
                     });
                  }else{
                        deferred.reject('No such location found');
                  }
                  return promise;
            }


            /**
             * @ngdoc
             * @name sdi.Controller:function:getDistance
             * @description 
             *        Get distance between to latlong
             *@param 
             *        lat long 
            */


            var getDistance = function() {
              return (google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(userLat, userLng), $scope.userLatLong) / 1000).toFixed(2);
            }

            /**
             * @ngdoc
             * @name sdi.Controller:function:filterByDistance
             * @description 
             *        filter record by distance 
             *@param 
             *        zipcode, range in miles
            */

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

            /**
             * @ngdoc
             * @name sdi.Controller:function:triggerMarker
             * @description 
             *        make selected markers as well as record in grid
             *@param 
             *        data(total record object), selectedRow(selected record object)
            */

            $scope.triggerMarker = function(data, selectedRow){
              infowindow.close();
                      var marker = $scope.markersArray[data.indexOf(selectedRow)];
                      if(marker.key != selectedRow.ID){
                            
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
              
           
                
              if(data.length > 0){
                $scope.selectedData = (selectedRow) ? selectedRow : '';
                var locationIndex = 0;
                angular.forEach(data, function(value, key) {
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
                 value.AddressLine2 = value.AddressLine2.replace('STE', 'SUITE');
                  
                 var AddressLine1 = (value.AddressLine1) ? value.AddressLine1+', ' : '';
                 var AddressLine2 = (value.AddressLine2) ? value.AddressLine2.replace('STE', 'SUITE') + ', ' : '';
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
                      if(selectedRow && selectedRow.ID && value.ID && value.ID == selectedRow.ID){
                        map.setCenter(new google.maps.LatLng(lat, lng));
                        var iconAnimation = google.maps.Animation.BOUNCE;
                        iconImg = '../../images/location-icon-small-green-shadow.png';
                        iconClass = 'green-label';
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
                });
              }
            }

            var searchdata = [];
            var idxCounter=0;
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
                              $scope.RealResponse = searchdata;
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
             * @name sdi.Controller:function:searchLocation
             * @description 
             *            seach location by searchKeyword
             * @param 
             *      {string}searchKeyword
            */
            $scope.searchLocation = function(searchValue){
              $scope.inProgress = 'inProgress';
              searchValue = (searchValue) ? searchValue : '';
              if(serviceGlobal.isDontSeeExam){
                  var locationCodes = ['ARHD', 'BEMO', 'CDS', 'CF', 'DSR', 'FH', 'GH', 'GMC', 'HIL', 'MTV', 'NIC', 'PALM', 'PAS1', 'PAS2', 'PDVO', 'SIC', 'SUNWEST', 'SWBC', 'TAS', 'TBO', 'TC', 'TPK', 'UNHO'];
              }else{
                  var locationCodes = ['ARHD', 'BEMO', 'CDS', 'CF', 'DSR', 'FH', 'GMC', 'HIL', 'MTV', 'NIC', 'PALM', 'PAS1', 'PDVO', 'SIC', 'SUNWEST', 'TAS', 'TBO', 'TC', 'TPK', 'UNHO'];  
              }
              
              
              setTimeout(function () { $("#loading2, .overlay2").hide(); }, 2000);
                  $('.search-area').css('border-color', 'solid 1px #e6e8e9');
                  $("#loading2, .overlay2").show();
                  var searchData = {Organizations : locationCodes, searchKeyword : searchValue};
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


             $scope.sendingData = false;
            $scope.backToHome = function(){
              $scope.sendingData = true;
              if(serviceGlobal.home.examData){
                serviceGlobal.home.examData = [];
              }
              $location.path('/');
              return false;
            }
            
            
            
            /**
             * @ngdoc
             * @name sdi.Controller:function:continueToDate
             * @description 
             *          after selecting a location countinue to appointment date & time module
             * @param 
             *      {array}selectedData
            */
            serviceGlobal.isCompleteDontSeeExam = false;
           
            $scope.continueToThanks = function (selectedData) {
              setTimeout(function () { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);
              $scope.inProgress = 'inProgress';
              $scope.sendingData = true;
              $scope.donSeeExamError = '';
                  serviceGlobal.findLocation.location = selectedData;
                  var userID = (!serviceAuth.isAuthenticated()) ? serviceGlobal.userSession.UserId : '';
                  var wishingExamText = serviceGlobal.patientInfo.wishingExamText;
                  var locationCode = selectedData.Code
                  var jsonData = {UserID : userID, Reason : wishingExamText, Code : locationCode}; 
                  serviceData.send('Patient/SavePatientDontSeeExam', jsonData).then(function (response) {
                       if(!response.Error && response.Status === 200){
                            //serviceGlobal.patientInfo = {};
                            //serviceGlobal.userSession = {};
                            //serviceGlobal.findLocation.location = {};
                            //if(serviceGlobal.home.examData){
                            //    serviceGlobal.home.examData = [];
                            //}
                            
                            serviceGlobal.isCompleteDontSeeExam = true;
                             $location.path("/otherExamThankYou");
                              return false;
                       }else{
                          $scope.donSeeExamError = response.Error.Message;
                          $timeout(function() {  $scope.donSeeExamError = '';}, 3000);
                          $scope.sendingData = false;
                          $scope.inProgress = '';
                       }
                });
                
            }

    }]);
