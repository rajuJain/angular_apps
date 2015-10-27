'use strict';

/* appointmentDate Controller Logic*/

angular.module('sdi')

     /**
    * @ngdoc
    * @name sdi.Controller:appointmentDateController
    * @url '/appointmentDate'
    * @template appointmentDate.html
    * @description
    * display user set appointment date and select an appointment
    */
    .controller('appointmentDateController', ['$scope', '$location', '$q', 'serviceGlobal', 'serviceAuth', 'serviceData', 'serviceExamCode', function ($scope, $location, $q, serviceGlobal, serviceAuth, serviceData, serviceExamCode) {
        $scope.isProcessing = 'inProgress';
        if (!serviceGlobal.userSession.mrn && !serviceAuth.isAuthenticated()) {
              $location.path('/login');
              return false;
        }
        if(serviceGlobal.appointment.completedStep < 3){
            $location.path("/" + serviceGlobal.appointment.getLastStep());
            return false;
        }
	
        var examPriorities = serviceExamCode.examPriority;
        var examCodeObj = serviceExamCode.getExamCode();
        var lastType = '';
        var location = serviceGlobal.findLocation.location;
        $scope.location = serviceGlobal.findLocation.location;
        var counter;
        var id = window.setTimeout(function() {}, 0);
        while (id--) {
            window.clearTimeout(id); // will do nothing if no timeout with id is present
        }
	
        var countdown = function() {
            var seconds = 120;
            function tick() {
                
                seconds--;
                
                if(seconds > 59){
                    $("#counter").html("1:" + ((seconds-60) < 10 ? "0" + String(seconds-60) : "" + String(seconds-60)));
                }else{
                    $("#counter").html("0:" + (seconds < 10 ? "0" + String(seconds) : "" + String(seconds)));
                }
                if( seconds > 0 ) {
                    counter = setTimeout(tick, 1000);
                } else {
                    //alert("Game over");
		    $(".overlay,.popup").hide();
                    releaseAppointment();
                    $scope.allAvailableAppointment = [];
                    $scope.rowValueMatrix = [];
                }
            }
            tick();
        }
        
        var releaseAppointment = function(){
            if ($scope.isSearchProcessing == '') {
                $scope.isProcessing = 'inProgress';    
            }
            var deferred = $q.defer();
            var promise = deferred.promise;
            if(serviceGlobal.findDate.appointmentToken.length > 0){
                var releaseTokens = [];
                var token = serviceGlobal.findDate.appointmentToken;
                //serviceGlobal.findDate.appointmentToken = [];
                for(var i = 0; i < token.length; i++){
                    releaseTokens.push({Token : token[i]});
                }
                serviceData.send('Appointment/SlotRelease', releaseTokens).then(function (response) {
                    $scope.isProcessing = '';
                    deferred.resolve(response);
                    serviceGlobal.findDate.appointmentToken = [];
                    //localStorage.removeItem('tokens');
                },function(error){
                    $scope.isProcessing = '';
                    deferred.reject(error);    
                });    
            }else{
                $scope.isProcessing = '';
                deferred.resolve('FirstAppointment');
            }
               return promise;
        }
	
        var examAnswers =  serviceGlobal.exam.examAnswers;
            if (examAnswers && examAnswers[2] && examAnswers[2] == 'Yes' && examAnswers[3]) {
            var minDate = new Date(new Date(examAnswers[3]).getTime()+(10*24*60*60*1000));
            var todayDate = new Date();

            if (todayDate > minDate) {
                minDate = todayDate;
            }
            $scope.DatePickerOptions = {
                open: function () {
                    $('.k-weekend').bind('click', function () { return false; });
                },
                min: minDate,
                max: new Date(2049, 11, 31, 16, 0, 0),
                format : "MM/dd/yyyy",
                culture : $scope.lang
            }
        }else{

            $scope.DatePickerOptions = {
                open: function () {
                    $('.k-weekend').bind('click', function () { return false; });
                },
                min: new Date(),
                max: new Date(2049, 11, 31, 16, 0, 0),
                format : "MM/dd/yyyy",
                culture : $scope.lang
            }
        }
	
        $scope.TimePickerOptions = {
            interval : 60,
            min: new Date(2014, 0, 1, 7, 0, 0),
            max: new Date(2049, 11, 31, 16, 0, 0)
        }
       
        $scope.getAppointment = function(type){
	    
	    window.clearTimeout(counter);
            type = type || lastType;
            var exams = [];
	    var priorityExams = [];
            $scope.isSearchProcessing = 'inProgress';
            $scope.searchError = '';
            $scope.allAvailableAppointment = [];
	    angular.forEach(serviceGlobal.home.examData, function(value,key){
		var locationCode = location.Code;
		if (value == 'DEXA' && location.Code == 'SWBC') {
		    locationCode = 'SUNWEST';
		}
		if (serviceGlobal.home.examData.length == 1) {
		
		    exams.push({
			ExamOrganizationCode : locationCode,
			ExamCode : examCodeObj.examCodeArray[value].examCode,
			ExamModifiers1 : '',
			ExamModifiers2 : '',
			ExamModifiers3 : '',
			PatientTypeCode : examCodeObj.examCodeArray[value].patientType,
			TransportationCode : ''
		    });
		}else{
		    exams[examPriorities.indexOf(value)] = {
			ExamOrganizationCode : locationCode,
			ExamCode : examCodeObj.examCodeArray[value].examCode,
			ExamModifiers1 : '',
			ExamModifiers2 : '',
			ExamModifiers3 : '',
			PatientTypeCode : examCodeObj.examCodeArray[value].patientType,
			TransportationCode : ''
		    };
		}
            });
	    if (serviceGlobal.home.examData.length == 1) {
		priorityExams = exams;
	    }else{
		angular.forEach(exams, function(examObj,priorityIndex){
		    priorityExams.push(examObj);
		});
	    }
            
            var patientDataJSON = {
                AnonymousSearch : false,
                Patient  : {OrganizationCode : location.Code, MedicalRecordNumber : serviceGlobal.userSession.mrn != '' ? serviceGlobal.userSession.mrn : 'NotFound', DepartmentNumber : ''},
                Exams  : priorityExams.length > 0 ? priorityExams : '',
                SearchOrganizations : '',
                OrganizationCodePreference : location.Code,
                ScheduleWithInSameOrganization : false,
                ExamDateAndTime : $("#appointmentDate").val()+" "+$("#appointmentTime").val(),
                NumberSearchSlots : 3,
		IsNext : false,
		IsNextWithBuffer : false
            };
	    
            if (type == 'next3Appointment' && $scope.NextAvailableTime != '') {
		
		patientDataJSON.ExamDateAndTime = $scope.NextAvailableTime;
		//patientDataJSON.IsNext = $scope.isNext;
		patientDataJSON.IsNext = true;

		
	    }else if (type === 'current') {
		$scope.isNext = false;		
		lastType = 'current';
		if (examAnswers && examAnswers[2] && examAnswers[2] == 'Yes' && examAnswers[3]) {
		    var currentdate = new Date(new Date(examAnswers[3]).getTime()+(10*24*60*60*1000)); 
		}else{
		    var currentdate = new Date();
		    
		}
               patientDataJSON.IsNextWithBuffer = true;     
                currentdate = (currentdate) ? currentdate.setMinutes((Math.floor((dateFormat(new Date(currentdate), "MM"))/15)+1)*15) : '';
                var datetime = dateFormat(new Date(currentdate), "m/d/yyyy h:MM TT");
                patientDataJSON.ExamDateAndTime = datetime;
            }else{
		$scope.isNext = false;
                lastType = '';
                if ((!$("#appointmentDate").val() || !$("#appointmentTime").val()) && type=='datePicker') {
		              $scope.isSearchProcessing ='';
                    $scope.searchError = 'SelectDesiredDateTime';
                }
            }
	    
            if (!$scope.searchError) {
                
                releaseAppointment().then(function(releaseResponse){
                    
                    if (releaseResponse == 'FirstAppointment' || (releaseResponse.data && releaseResponse.data.IsSlotReleased)) {
			
			delete $scope.parentIndex;
			$scope.selectedAppointments=[];
			var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
			if(w < 480 ){
			    $('html, body').animate({
				scrollTop: $( "#slotError" ).offset().top
			    }, 1000);
			}
                        serviceData.send('Appointment/SearchAppointment', patientDataJSON).then(function (response) {
			    
			    $scope.NextAvailableTime = '';
                            window.clearTimeout(counter);
                            $scope.isSearchProcessing ='';
                            
			    if (response.Status == 200 && response.data && response.data.IsSuccess) {
				$scope.isNext = true;
				$scope.NextAvailableTime = response.data.NextAvailableTime;
				
                                var appointmentToken = [];
                                var allAvailableAppointment = [];
                                var rowValueMatrix = [];
                                var isSlotAvailable = false;
                                
                                angular.forEach(response.data.Slot, function(appointmentsData,key){
                                    
                                    if (appointmentsData.IsSuccess) {
                                        angular.forEach(serviceGlobal.exam.examWiseCode, function(value, key){
                                            if (value.examCode === appointmentsData.ExamCode) {
					        appointmentsData.ExamName = key;
                                            }
                                        });
                                       
                                        angular.forEach(appointmentsData.Appointments, function(value,appKey){
                                            if (value.Token && value.Token != null) {
                                                if (rowValueMatrix[appKey] == undefined) {
                                                    rowValueMatrix[appKey] = [];
                                                }
                                                value.day = dateFormat(new Date(value.ExamDateTime), "dddd ");
                                                value.date = dateFormat(new Date(value.ExamDateTime), "mmmm d, yyyy");
                                                value.month = dateFormat(new Date(value.ExamDateTime), "mmmm");
                                                value.dateYear = dateFormat(new Date(value.ExamDateTime), "d, yyyy");
                                                value.time = dateFormat(new Date(value.ExamDateTime), "h:MM TT");
                                                if(appointmentToken.indexOf(value.Token) === -1){
                                                   appointmentToken.push(value.Token);
						   serviceGlobal.findDate.appointmentToken.push(value.Token);
                                                }
                                                rowValueMatrix[appKey].push(value);
                                                appointmentsData.Appointments[appKey] = value;
                                                var date = new Date(value.ExamDateTime);
                                                var minutes = parseInt(dateFormat(new Date(value.ExamDateTime), "MM")) + 5;
                                                date.setMinutes(minutes);
                                                $scope.examDateTime = dateFormat(new Date(date), "mm/dd/yyyy h:MM TT");
                                                
                                                if (rowValueMatrix[appKey].length == $scope.exam.length) {
                                                    isSlotAvailable = true;
                                                }
                                                
                                            }else{
                                                //rowValueMatrix[appKey].push(value);
                                                appointmentsData.Appointments[appKey] = value;
                                            }
                                        });
                                        allAvailableAppointment.push(appointmentsData);
                                    }
                                    
                                });
				//localStorage.setItem('tokens', JSON.stringify(serviceGlobal.findDate.appointmentToken));
                                //serviceGlobal.findDate.appointmentToken = appointmentToken;
                                if (isSlotAvailable) {
				    if (allAvailableAppointment.length > 0) {
					$scope.allAvailableAppointment = allAvailableAppointment;
					$scope.rowValueMatrix = rowValueMatrix;
					window.clearTimeout(counter);
					countdown();
				    }else{
					$scope.allAvailableAppointment = [];
					$scope.rowValueMatrix = [];
					$scope.searchError = 'NoExamTimesFound';
				    }
                                    
                                }else{
                                    $scope.allAvailableAppointment = [];
                                    $scope.rowValueMatrix = [];
                                    $scope.searchError = 'NoExamTimesFound';
                                    releaseAppointment();
                                }
                                
                            }else if(!response.Error && !response.data.IsSuccess && response.data.NextAvailableTime != ''){
				$scope.NextAvailableTime = response.data.NextAvailableTime;
				$scope.searchError = 'NoExamTimesFound';//response.Error.Message;
				$scope.isNext = false;
				
			    }else if(response.Error && response.Error.Code == '1090'){
				serviceAuth.logout();
				window.location.href = serviceData.rootUrl;
			    }else if(response.Error){
				
                                $scope.searchError = 'NoExamTimesFound';//response.Error.Message;
                            }
                            
                        },function(error){
                            $scope.isSearchProcessing ='';
                            $scope.searchError = 'AnErrorOccurred';
                        });
                    }else{
                        $scope.isSearchProcessing ='';
                        $scope.searchError = 'SlotNeedToBeRelease';
                        
                    }
                },function(releaseError){
                    $scope.isSearchProcessing ='';
                    $scope.searchError = 'SlotNeedToBeRelease.';
                });
                
            }
        }
        
        $scope.showNote = function(index){
            $("#appointmentNote_" + index + ", .overlay").show();
        }
        
        $scope.cancelAppointmentSlot = function(index){
            $(".popup,.overlay").hide();
        }
        
        $scope.checkAppointment = function(parentIndex){
            
          $scope.isProcessing = 'Processing';
          var appointmentSlots = [];
          angular.forEach($scope.rowValueMatrix[parentIndex], function(appObj, key){
            if (appObj.Duration) {
                var appointmentJSON = {
                                    Duration : appObj.Duration,
                                    OrganizationCode : appObj.OrganizationCode,
                                    ResourceCode : appObj.ResourceCode,
                                    SlotDateAndTime : appObj.ExamDateTime
                                };
                appointmentSlots.push(appointmentJSON);    
            }
          });
          serviceData.send('Appointment/CheckSlotAvailability', appointmentSlots).then(function (response) {
              
                if (!response.Error && response.Status === 200 && response.data) {
                    
                    if (response.data.IsSlotAvailable) {
                        serviceGlobal.findDate.appointments = $scope.rowValueMatrix[parentIndex];   
                        $scope.parentIndex = parentIndex;
                        $scope.selectedAppointments = serviceGlobal.findDate.appointments;
                        $scope.cancelAppointmentSlot();
                        $scope.isProcessing = '';
                        window.clearTimeout(counter);
                        $scope.goToScheduleAppointment()
                    }else{
                        $scope.selectedAppointments = [];
                        serviceGlobal.findDate.appointments = [];
                        $scope.cancelAppointmentSlot();
                        $scope.isProcessing = '';
                        $(".popup,.overlay").hide();
                        $scope.searchError = "SelectDifferentSlotAlreadyBooked";
                    }
                }else{
                    serviceGlobal.findDate.appointments = [];
                    $scope.selectedAppointments = [];
                    $scope.cancelAppointmentSlot();
                    $scope.isProcessing = '';
                    $(".popup,.overlay").hide();
                    $scope.searchError = response.Error.Message;
                }
          },function(error){
                serviceGlobal.findDate.appointments = [];
                $scope.selectedAppointments = [];
                $scope.isProcessing ='';
                $(".popup,.overlay").hide();
                $scope.searchError = 'AnErrorOccurred';
          });
          
          
        };


        /**
         * @ngdoc
         * @name sdi.controller.function:#goToScheduleAppointment
         * @go to schedule appoint after select a appointment .
         * @param {selectedAppointment}array()
        */
        $scope.goToScheduleAppointment = function(){
            if(serviceGlobal.findDate.appointments.length === $scope.allAvailableAppointment.length)
            {
                if(serviceGlobal.findDate.appointments){
                    if(serviceGlobal.appointment.completedStep < 4){
                      serviceGlobal.appointment.completedStep = 4;
                    }
                    window.clearTimeout(counter);
                    $location.path('/scheduleAppointment');  
                    return false;  
                }            
            }
        }
	
	
	
        
	releaseAppointment().then(function(releaseResponse){
	    
	    if (releaseResponse == 'FirstAppointment' || (releaseResponse.data && releaseResponse.data.IsSlotReleased)) {
		
		serviceGlobal.findDate = {appointments : [],appointmentToken : []};
		serviceGlobal.appointment.completedStep = 3;
		serviceGlobal.exam.examCode = examCodeObj.commaSeperatedCode;
		serviceGlobal.exam.examWiseCode = examCodeObj.examCodeArray;
		
		// comment because of service change
		//$scope.addressLine2 = location.AddressLine2 + ", " + location.City +", "+ location.StateCode + ", "+ location.PostalCode +" "+ location.workingDays + " " + location.workTime;
		$scope.addressLine1 = location.AddressLine1;
		$scope.addressLine2 = location.AddressLine2 + ", " + location.City +", "+ location.StateCode + ", "+ location.PostalCode;
		$scope.exam = serviceGlobal.home.examData;
		$scope.availableAppointment = [];
		$scope.searchError = '';
		$scope.isProcessing = '';
		$scope.NextAvailableTime = '';
		$scope.isNext = false;
		$scope.selectedSlots = [];
		$scope.selectedAppointments = '';
		$scope.selectedSlotParentIndex = [];    
		$scope.isProcessing = '';
	    }else{
		$scope.isProcessing ='';
                $scope.searchError = 'SlotNeedToBeRelease';
	    }
	},function(releaseError){
	    console.log(releaseError);
	    $scope.isProcessing ='';
            $scope.searchError = releaseError;
	});
	
	$scope.$watch('lang',function(newVal, oldVal){
	
	    var lang = 'en-US';
	    if ($scope.lang == 'es-AR') {
		 lang = 'es-ES';
	    }
	    
	    $.getScript("//cdn.kendostatic.com/2014.2.903/js/cultures/kendo.culture." + lang + ".min.js", function() {
     
		 /* $scope.$apply should be used in order to notify the $scope for language change */
		 $scope.$apply(function(){
		   kendo.culture(lang); //change kendo culture
     
		   /* we use dummy language option in order to force the Grid to rebind */
		   $scope.DatePickerOptions.culture = lang;
     
		 })
	       });
	
       });
	
    }]);

