'use strict';

/* Signup Controller Logic*/

angular.module('sdi')

     /**
    * @ngdoc
    * @name sdi.Controller:appointmentsController
    * @url '/appointments'
    * @template appointments.html
    * @description
    * display user upcomming and past appointments
    */
    .controller('appointmentsController', ['$scope', '$location', '$q', 'serviceAuth', 'serviceData', 'serviceExamCode', 'serviceGlobal', function ($scope, $location, $q, serviceAuth, serviceData, serviceExamCode, serviceGlobal) {
        if (!serviceAuth.isAuthenticated()) {
            $location.path('/login');
            return false;
        }

        $scope.selectedExams = serviceGlobal.home.examData;
        $scope.instructions = serviceExamCode.examInstructions();
        $scope.notificationText = '';
        serviceData.get('AccountApi/GetNotification', {}).then(function(response){
            if(response.Status == 200){
              $scope.notificationText = response.data.Notification;
            }
        });

        $scope.isProcessing = 'inProgress';
        $scope.showInstructions = function(index){
            $('#instructions_'+index).toggle();
        }
        $scope.getExamInstruction = function(appointment){
            var locationType = '';
            var examArray = appointment.Appointment;
            var location = appointment.Address;
            if (location==location.toUpperCase()) {
                locationType = 'SMIL';
            }else{
                locationType = 'VRL';
            }
            var InstructionKey = '';
            var appointmentExamArray = [];
            angular.forEach(examArray, function(element, key){
                appointmentExamArray.push(element.ExamType);
            });
            var examPriorities = serviceExamCode.examPriority;
            var examCodeObj = serviceExamCode.getExamCode();
            var orderedExam = [];
            var orderedExamName = [];
            angular.forEach(appointmentExamArray, function(value,key){
                orderedExam[examPriorities.indexOf(value)] = value;
            });
            angular.forEach(orderedExam, function(element, key){
                       orderedExamName.push(element);
            });
    
            var orderedExamArray = orderedExamName.toString();
            if (orderedExamArray=='Pelvic' || orderedExamArray=='Pelvic,Mammogram Screening' || orderedExamArray=='Pelvic,Mammogram Diagnostic,Breast' || orderedExamArray=='Pelvic,Abdomen') {
                if (orderedExamArray=='Pelvic'){
                    if (locationType == 'SMIL') {
                        InstructionKey = 'Pelvic_SMIL_instruction';
                    }else{
                        if (serviceGlobal.userSession.gender=='M') {
                            InstructionKey = 'Pelvic_VRL_MALE_instruction';
                        }else{
                            InstructionKey = 'Pelvic_VRL_FEMALE_instruction';
                        }
                    }
                }else if (orderedExamArray=='Pelvic,Mammogram Screening'){
                    if (locationType == 'SMIL') {
                        InstructionKey = 'Pelvic,Mammogram Screening_SMIL_instruction';
                    }else{
                        InstructionKey = 'Pelvic,Mammogram Screening_VRL_instruction';
                    }
                }else if (orderedExamArray=='Pelvic,Abdomen') {
                    if (locationType == 'SMIL') {
                        InstructionKey = 'Pelvic,Abdomen_SMIL_instruction';
                    }else{
                        if (serviceGlobal.userSession.gender=='M') {
                            InstructionKey = 'Pelvic,Abdomen_VRL_MALE_instruction';
                        }else{
                            InstructionKey = 'Pelvic,Abdomen_VRL_FEMALE_instruction';
                        }
                    }
                }else if(orderedExamArray=='Pelvic,Mammogram Diagnostic,Breast'){
                    if (locationType == 'SMIL') {
                        InstructionKey = 'Pelvic,Mammogram Diagnostic,Breast_SMIL_instruction';
                    }else{
                        InstructionKey = 'Pelvic,Mammogram Diagnostic,Breast_VRL_instruction';
                    }
                }
            }else{
                InstructionKey = orderedExamArray+'_instruction';
            }
            
            return InstructionKey;
            
            
            
            
            
            
        }

        //get upcomming appointments
        var upcomingAppointments = serviceData.get('Appointment/GetUpcomingAppointments', {}).then(function(response){
              if (!response.Error && response.data) {
                    return response.data.DashboardAppointment
              }else{
                 return response.Error.Message;
              }
          },function(error){
             return error;
          });
        //get past appointments
        var pastAppointments = serviceData.get('Appointment/GetPastAppointments?type=3', {}).then(function(response){
              if (!response.Error && response.data) {
                    return response.data.DashboardAppointment
              }else{
                 return response.Error.Message;
              }
          },function(error){
             return error;
          });  
          
        $q.all([upcomingAppointments,pastAppointments]).then(function(appointmentResponse){
              $scope.isProcessing = '';
              $scope.upcomingAppointments = (appointmentResponse[0]) ? appointmentResponse[0] : [];
              $scope.pastAppointments = (appointmentResponse[1]) ? appointmentResponse[1] : [];
        },function(error){
            $scope.isProcessing = '';
        })


        var geocoder;
        var map;

        var initialize = function() {
            geocoder = new google.maps.Geocoder();
            var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            var isScrollwheel = w > 480 ? true : false;
            
              var mapOptions = {
                center: new google.maps.LatLng(33.4910411, -111.92422390000002),
                zoom: 10,
                streetViewControl: false,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                tilt: 45,
                draggable: true,
                scrollwheel: isScrollwheel
              }
            map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
        }

        initialize();  
        var infowindow = (google && google.maps && google.maps.InfoWindow) ? new google.maps.InfoWindow() : '';
        var markersArray = [];

        $scope.showMap = function(appointmentData){
          var marker = [];
          var iconImg = '../../images/location-icon-small-blue-shadow.png';
          
          var address = (appointmentData) ? appointmentData.Address+', '+appointmentData.City+', '+appointmentData.State+', '+appointmentData.Zipcode : '';
          geocoder.geocode( { 'address': address }, function(results, status) {
            clearMarker(markersArray);
            $('#map_model').reveal();
          google.maps.event.trigger(map, 'resize');
              if (status == google.maps.GeocoderStatus.OK) {
                  var lat = results[0].geometry.location.lat();
                  var lng = results[0].geometry.location.lng();
                  map.setCenter(new google.maps.LatLng(lat, lng));
                    if (appointmentData.Address == appointmentData.Address.toUpperCase()) {
                        iconImg = '../../images/location-icon-small-cyan-shadow.png';
                    }  

                  marker = new google.maps.Marker({
                      map: map,
                      position: new google.maps.LatLng(lat, lng),
                      icon : iconImg
                  });
                    markersArray.push(marker);
                    infowindow.close();
                    google.maps.event.addListener(marker, 'click', (function(marker) {
                      return function() {
                        if (appointmentData.Address == appointmentData.Address.toUpperCase()) {
                                var markerInfo = "<div class='map-info-window'><div class='smil-infowin-title'>SCOTTSDALE MEDICAL IMAGING</div><p style='text-transform: uppercase;'>"+address+"</p></div>";
                        }else{
                                var markerInfo = "<div class='map-info-window'><div class='vrl-infowin-title'>VALLEY RADIOLOGISTS</div><p style='text-transform: uppercase;'>"+address+"</p></div>";
                        }
                        //var markerInfo = "<div class='map-info-window'><p style='text-transform: uppercase;'>"+address+"</p></div>";
                        infowindow.setOptions({content :markerInfo});
                        infowindow.open(map, marker);
                      }
                    })(marker));
                    
                } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {    
                    setTimeout(function() {
                       $scope.showMap(appointmentData);
                    }, 100);
                } else {
                  try {
                      console.error("Geocode was not successful for the following reason: " + status);
                    } catch(e) {}
               }
          });
        }
        

        var clearMarker = function(markersArray){
              if (markersArray) {
                for (var i in markersArray) {
                  markersArray[i].setMap(null);
                }
              }
              $scope.markersArray = [];
          }
       
       
            

        $scope.showFormatedDate = function(date, type){
           if(date){
            var values = date.split(/[^0-9]/),
            year = parseInt(values[2], 10),
            month = parseInt(values[0], 10) - 1, // Month is zero based, so subtract 1
            day = parseInt(values[1], 10),
            hours = parseInt(values[3], 10),
            minutes = parseInt(values[4], 10),
            seconds = parseInt(values[5], 10);
            
            
            if ( type == 'h:MM TT' ) {
                var timeVal = date.search('AM') != -1 ? values[3]+":"+values[4]+ " AM" : values[3]+":"+values[4] + " PM";
                return timeVal;
            }else{
                date = new Date(year, month, day, hours, minutes, seconds);
                return dateFormat(new Date(date), type);    
            }
            
           }
        }
       
        $scope.scheduleAnother = function(appointmentDetails){
            $location.path("/");
            return false;
        }

        $scope.confirmPopUp = function(appointmentDetails, id){
            $scope.openPopup(id);
            $scope.appointmentDetails = appointmentDetails;
        }

        $scope.openPopup = function(id){
          $('#'+id).click();
        }

        $scope.closePopup = function(id){
          $('#'+id).trigger('reveal:close');
        }
        
        $scope.cancelAppointment = function(appointmentDetails){
         $scope.isProcessing = 'Processing';
         $scope.closePopup('cancelAppointment');
         $scope.appointmentError = '';
          //var jsonData = {AccessionNumber : appointmentDetails.AccessionNumber, AppointmentId : appointmentDetails.PKID};
          var jsonData = {GroupId: appointmentDetails.GroupId};
            serviceData.send('Appointment/SlotCancel', jsonData).then(function(response){
                if (!response.Error && response.Status == 200 && response.data && response.data.IsSlotCanceled  ) {
                    $("#"+appointmentDetails.GroupId).hide();
                    if($scope.pastAppointments.indexOf(appointmentDetails)!= -1){
                      $scope.pastAppointments.splice(appointmentDetails,1);
                    }
                    serviceGlobal.reset();
                    $scope.isProcessing = '';
                }else{
                    $scope.appointmentError = response.Error.Message;
                    $scope.isProcessing = '';
                }
            },function(error){
              $scope.appointmentError = 'AnErrorOccurred';
              $scope.isProcessing = '';
              console.log(error);
            });
           
        }
        
        $scope.rescheduleAppointment = function(appointmentDetails){
          $scope.isProcessing = 'Processing';
          $scope.closePopup('rescheduleAppointment');
          //var jsonData = {AccessionNumber : appointmentDetails.AccessionNumber, AppointmentId : appointmentDetails.PKID};
          var jsonData = {GroupId: appointmentDetails.GroupId};
            serviceData.send('Appointment/SlotReschedule', jsonData).then(function(response){
                if (!response.Error && response.Status == 200 && response.data && response.data.IsSlotRescheduled ) {
                     serviceGlobal.reset();
                    angular.forEach(appointmentDetails.Appointment, function(appointmentObj, index){
                        if(appointmentObj.ExamType){
                            if (appointmentObj.ExamType == 'Mammogram Diagnostic' || appointmentObj.ExamType == 'Mammogram Screening' ) {
                                serviceGlobal.home.screeningCount = 1;
                                //serviceGlobal.home.ultraSoundCount = 0;
                            }else if(appointmentObj.ExamType != 'DEXA'){
                                serviceGlobal.home.ultraSoundCount = 1;
                                //serviceGlobal.home.screeningCount = 0;
                            }

                            serviceGlobal.home.examData.push(appointmentObj.ExamType);
                        }
                    })
                    /*if(appointmentDetails.ExamType){
                      
                        if(appointmentDetails.ExamType != 'DEXA' && (appointmentDetails.ExamType == 'Mammogram Diagnostic' || appointmentDetails.ExamType == 'Mammogram Screening')){
                          serviceGlobal.home.screeningCount = 1;
                          serviceGlobal.home.ultraSoundCount = 0;
                        }else if(appointmentDetails.ExamType != 'DEXA'){
                          serviceGlobal.home.ultraSoundCount = 1;
                          serviceGlobal.home.screeningCount = 0;
                        }
                        serviceGlobal.home.examData = [appointmentDetails.ExamType];
                    }*/
                    
                    $scope.isProcessing = '';
                    $location.path("/");
                    return false;
                }else{
                    $scope.appointmentError = response.Error.Message;
                    $scope.isProcessing = '';
                }
            },function(error){
              $scope.appointmentError = 'AnErrorOccurred';
              $scope.isProcessing = '';
              console.log(error);
            });
        }
        
    }])


    .controller('pastAppointmentsController', ['$scope', '$location', 'serviceAuth', 'serviceData', 'serviceExamCode', 'serviceGlobal', function ($scope, $location, serviceAuth, serviceData, serviceExamCode, serviceGlobal) {
        $scope.isProcessing = 'inProgress';
        $scope.showFormatedDate = function(date, type){
           if(date){
            var values = date.split(/[^0-9]/),
            year = parseInt(values[2], 10),
            month = parseInt(values[0], 10) - 1, // Month is zero based, so subtract 1
            day = parseInt(values[1], 10),
            hours = parseInt(values[3], 10),
            minutes = parseInt(values[4], 10),
            seconds = parseInt(values[5], 10);
            
            if ( type == 'h:MM TT' ) {
                var timeVal = date.search('AM') != -1 ? values[3]+":"+values[4]+ " AM" : values[3]+":"+values[4] + " PM";
                return timeVal;
            }else{
                date = new Date(year, month, day, hours, minutes, seconds);
                return dateFormat(new Date(date), type);    
            }
           }
        };
        
        $scope.notificationText = '';
        serviceData.get('AccountApi/GetNotification', {}).then(function(response){
            if(response.Status == 200){
              $scope.notificationText = response.data.Notification;
            }
        });
        
        $scope.scheduleAnother = function(appointmentDetails){
            $location.path("/");
            return false;
        }
        
        serviceData.get('Appointment/GetPastAppointments?type=ALL', {}).then(function(response){
            if (!response.Error && response.data) {
                $scope.pastAppointments = response.data.DashboardAppointment;
                $scope.isProcessing = '';
            }else{
              $scope.isProcessing = '';
            }
        },function(error){
          $scope.isProcessing = '';
        });
        
    }]);


