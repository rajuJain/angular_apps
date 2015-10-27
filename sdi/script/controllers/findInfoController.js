'use strict';

/* Find info Controller Logic*/

angular.module('sdi')

    /**
    * @ngdoc
    * @name sdi.controller:#findInfoController
    * @url '/findinfo'
    * @template returning_patient.html
    * @public
    * @description Will be the signup page along with contact verification flow.
    */
    
    .controller('findInfoController', ['$rootScope','$scope', '$location', '$timeout', '$filter', 'serviceGlobal', 'serviceData', 'serviceAuth', function ($rootScope,$scope, $location, $timeout, $filter, serviceGlobal, serviceData, serviceAuth) {
       if(!serviceGlobal.home.examData.length > 0){
          $location.path('/');
          return false;
       }
       if (serviceAuth.isAuthenticated()) {
          $location.path('/exam');
          return false;
       }
        
        // create month array
        $scope.monthNames = [
           { id: '01', name: 'January' },
           { id: '02', name: 'February' },
           { id: '03', name: 'March' },
           { id: '04', name: 'April' },
           { id: '05', name: 'May' },
           { id: '06', name: 'June' },
           { id: '07', name: 'July' },
           { id: '08', name: 'August' },
           { id: '09', name: 'September' },
           { id: '10', name: 'October' },
           { id: '11', name: 'November' },
           { id: '12', name: 'December' }
        ];
        //////////////////////////////

        // create days array according to year and month
        $scope.days = [];
        $scope.totMonths = $scope.monthNames;
        $scope.getDays = function(month, year){

          var dateObj = new Date();
          var currentYear = dateObj.getFullYear();
          var currentMonth = dateObj.getMonth()+1;
          var currentDay = dateObj.getDate();

          
          if(year && year.id==currentYear){
                if(month && month.id==currentMonth){
                    var monthDays = currentDay
                }else{
                  if(month && month.id > currentMonth){
                     delete $scope.patientData.Month;  
                  }  
                }
                var months = []
                for(var i=0; i < currentMonth; i++){
                    months.push($scope.monthNames[i]);
                }
               // 
                $scope.monthNames = months;
            }else{
                $scope.monthNames = $scope.totMonths;
            }

          year = (year) ? year.id : currentYear;
          month = (month) ? month.id : currentMonth;

          if(month)
          {
            if(!$scope.patientData.Year && month == '02'){
                monthDays = 29;
            }
            var monthDays = (monthDays) ? monthDays : new Date(year, month, 0).getDate(); 
            var days = [];
              for (var i = 0; i < monthDays; i++)
              {
                 if (i < 9) {
                     var objDay = {id : '0'+(i+1), name : i + 1};   
                 }else{
                     var objDay = {id : i+1, name : i + 1};
                 }
                days.push(objDay);
              }
              if($scope.patientData.Day && monthDays < $scope.patientData.Day.id){
                  delete $scope.patientData.Day;
              }
              $scope.days = days;
          }else{
              $scope.days = [];
          }
          $scope.makeVisibleFindMyInfoButton(month);
        }

        
        ///////////////////////////
    
        // create year array
        var thisYear = new Date().getFullYear();
        var year = [];
        for (var i = 0; i < 114; i++)
        {
            var objYear = { id: thisYear - i, name: thisYear - i };
           year.push(objYear);
        }
        $scope.year = year;
        /////////////////////////
       if (!serviceAuth.isAuthenticated()) {
           $scope.patientData = serviceGlobal.patientInfo || {};
            if(!serviceGlobal.userSession.gender){
                $scope.patientData.Gender = '';
                $scope.patientData.ChancePregnancy = ''; 
            }else{
                $scope.patientData.Gender = (serviceGlobal.userSession.gender == 'F') ? 2 : 1;
                $scope.patientData.ChancePregnancy = serviceGlobal.userSession.isPregnant; 
            }
            
            if(serviceGlobal.appointment.completedStep >= 0 ){
                  var isInfoChanged = false;
                  var registerUnregister = $scope.$watch('patientData', function(newVal, oldVal){
                          if (isInfoChanged) {
                                 serviceGlobal.appointment.completedStep = -1;
                                 serviceGlobal.appointment.PendingStep = -1;
                                 serviceGlobal.exam = {
                                     examQuestionIds : [],
                                     examQuestions : {},
                                     examAnswers : {},
                                     examWiseAnswers : {},
                                     examCode : '',
                                     examWiseCode : []
                                 };
                                 serviceGlobal.findDoctor = {};
                                 serviceGlobal.searchDoctorData = {};
                                 serviceGlobal.findLocation = {location : {}};
                                 serviceGlobal.findDate = {appointments : [],appointmentToken : {}};
                                 serviceGlobal.appointmentSlotData = {};
                                 $rootScope.currentStep = serviceGlobal.appointment.completedStep;
                                 registerUnregister();
                          }
                          isInfoChanged = true;
                  },true);        
            }
            
           /**
            * @ngdoc 
            * @name sdi.controller.function:#makeVisibleFindMyInfoButton
            * @description enable and disable find my info button
           */
           $scope.buttonVisible = false;
           $scope.resendEmail  = false;
           $scope.userId = '';
           $scope.makeVisibleFindMyInfoButton = function(value){
                $scope.isVerified = false;
                $scope.resendEmail = false;
                $scope.createAccountError = '';
                if(value){
                    $scope.buttonVisible = true;
                    $scope.verificationType = '';
                    $scope.findInfoError = '';
                    $scope.validationError = '';
                }else{
                  $scope.buttonVisible = false;
                  $scope.findInfoError = '';
                  $scope.validationError = '';
                }
           }


           if(serviceGlobal.patientInfo.FirstName){
              $scope.buttonVisible = true;
              $scope.patientData = serviceGlobal.patientInfo;
           }
           
            
           if(serviceGlobal.userSession.isPregnant == 'Yes') {
               $('#togglePregnent').click();
           }

           $scope.setChancePregnancy = function (value) {
              serviceGlobal.userSession.isPregnant = value;
              $scope.patientData.ChancePregnancy = value;
              if(value=='Yes'){
                serviceGlobal.userSession.gender = 'F';
                $('#togglePregnent').click();
              }else{
                serviceGlobal.userSession.gender = 'M';
              }
           }

           $scope.setPregnancy = function(val){
            $scope.patientData.ChancePregnancy = val;
              if(val=='No'){
                $('#pregnent').trigger('reveal:close');
              }else{
                serviceGlobal.reset();
                serviceGlobal.userSession = {};
                $location.path('/');    
                return false;            
              }
            }
            
           $scope.showPhoneNumberVerification = function(val){
               if(val){
                  $scope.verificationType = 'Email';
               }else{
                  $scope.verificationType = 'Phone';
               }
           }
           
           $scope.thisEmail = '';
           $scope.verifyThis = function(value){
               $scope.thisEmail = value;
               $scope.patientData.email = '';
               $scope.patientData.PhoneNumber = '';
           }

           $scope.resetForm = function(gender){
              if($scope.Gender){
                $scope.findInfoError = '';
                $scope.validationError = '';
				$('#phoneNumner').val('');
                $scope.patientData ={};
                $scope.patientData= angular.copy($scope.patientData);
                $scope.returningPatientForm.$setPristine();
                $scope.patientData.Gender = gender;
                $scope.verificationType = '';
              }
              $scope.Gender = gender;
           }
           

           if($scope.patientData.Month && $scope.patientData.Month.id && $scope.patientData.Year && $scope.patientData.Year.id){
              $scope.patientData.Month = {"id": $scope.patientData.Month.id,"name": $scope.patientData.Month.name};  
              $scope.getDays($scope.patientData.Month, $scope.patientData.Year);
            }
            
           /**
            * @ngdoc
            * @name sdi.controller.function:#submitReturningPatient
            * @description find info by passing param.
            * @param FirstName, LastName, ChancePregnancy, Gender, Dob
           */
           $scope.submitReturningPatient = function (patientData) {
               setTimeout(function () { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);
               $scope.global_process = 'Searching';
               $scope.isVerified = false;
               $scope.buttonVisible = true;
               $scope.findInfoError = '';
               $scope.validationError = '';
               $scope.verify_process = '';
               $scope.verificationType = '';
               $scope.patientData = patientData;
               serviceGlobal.patientInfo = patientData;
               $scope.resendEmail = false;
               $scope.resendSuccess = false; 
               $scope.createAccountError = '';
               $scope.emailError = '';

               var Dob = patientData.Month.id+"/"+patientData.Day.id+"/"+patientData.Year.id;
               if (patientData.Gender == ''){
                  $scope.validationError = 'PleaseSelectGender';
                  $scope.global_process = '';
                  $timeout(function() { $scope.validationError = ''; }, 3000);
                  return false; 
               }
               
               if(patientData.Gender==2 && !patientData.ChancePregnancy){
                  $scope.validationError = 'PleaseSelectOptions';
                  $scope.global_process = '';
                  $timeout(function() { $scope.validationError = ''; }, 3000);
                  return false;
               }
               
              

               if (patientData.Gender == 1) {
                   var gender = 'M';
                   patientData.ChancePregnancy = 'No';
               }else{
                   var gender =  'F';
               }
               
               var findResponceData ='';
               var emailData = [];
               var phoneData = [];
               var patientDataJSON = {FirstName : patientData.FirstName, LastName : patientData.LastName, ChancePregnancy : patientData.ChancePregnancy, Gender : gender, Dob : Dob};
               serviceData.send('AccountApi/FindMyInfo', patientDataJSON).then(function (response) {
                  $scope.resendEmail = false;
                  $scope.resendSuccess = false; 
                  serviceGlobal.patientInfo.MedicalRecordNo = '';
                  serviceGlobal.patientInfo.PersonId = '';

                  if(!response.Error && response.Status === 200 && response.data[0] && !response.data[0].IsEmailVerified && !response.data[0].UserId){
                       $scope.global_process = '';
                       
                       $scope.verificationType = 'Email';
                       
                       if(response.data!=''){
                        $scope.buttonVisible = false;
                        angular.forEach(response.data, function(value, key) {
                           if(value.EmailAddress || value.SecondaryEmailAddress || value.WorkEmailAddress){
                              if(value.EmailAddress){
                                var eData = {EmailAddress : value.EmailAddress, Type : 'PRIMARY', MedicalRecordNo : value.MedicalRecordNo, PersonId : value.PersonId};
                                emailData.push(eData);
                              }
                              if(value.SecondaryEmailAddress){
                                var eData = {EmailAddress : value.SecondaryEmailAddress, Type : 'SECONDRY', MedicalRecordNo : value.MedicalRecordNo, PersonId : value.PersonId};
                                emailData.push(eData);
                              }
                              if(value.WorkEmailAddress){
                                var eData = {EmailAddress : value.WorkEmailAddress, Type : 'WORK', MedicalRecordNo : value.MedicalRecordNo, PersonId : value.PersonId};
                                emailData.push(eData);
                              }
                           }
                           if(value.PhoneArea || value.SecondaryPhoneArea || value.WorkPhoneArea){
                              if(value.PhoneArea && value.PhoneExchange && value.PhoneLast4){
                                var pData = {PhoneArea : value.PhoneArea, PhoneExchange : value.PhoneExchange, PhoneLast4 : value.PhoneLast4, Type : 'PRIMARY', MedicalRecordNo : value.MedicalRecordNo, PersonId : value.PersonId};
                                phoneData.push(pData);
                              }
                              if(value.SecondaryPhoneArea && value.SecondaryPhoneExchange && value.SecondaryPhoneLast4){
                                var pData = {PhoneArea : value.SecondaryPhoneArea, PhoneExchange : value.SecondaryPhoneExchange, PhoneLast4 : value.SecondaryPhoneLast4, Type : 'SECONDRY', MedicalRecordNo : value.MedicalRecordNo, PersonId : value.PersonId};
                                phoneData.push(pData);
                              }
                              if(value.WorkPhoneArea && value.WorkPhoneExchange && value.WorkPhoneLast4){
                                var pData = {PhoneArea : value.WorkPhoneArea, PhoneExchange : value.WorkPhoneExchange, PhoneLast4 : value.WorkPhoneLast4, Type : 'WORK', MedicalRecordNo : value.MedicalRecordNo, PersonId : value.PersonId};
                                phoneData.push(pData);
                              }
                           }
                           
                        });
                          
                          if(emailData.length==0 && phoneData.length > 0){
                            $scope.verificationType = 'Phone';
                          }else if(emailData.length==0 && phoneData.length==0){
                           
                            $scope.buttonVisible = true;
                            $scope.verificationType = '';
                            $scope.findInfoError = 'WeWereUnableToProceed';
                          }
                           if (response.data[0] && response.data[0].MedicalRecordNo) {
                              serviceGlobal.patientInfo.MedicalRecordNo = response.data[0].MedicalRecordNo;
                              serviceGlobal.patientInfo.PersonId = response.data[0].PersonId;
                           }

                          $scope.responcePhoneData = phoneData;
                          $scope.responceEmailData = emailData;
                       }else{
                           $scope.buttonVisible = true;
                           $scope.verificationType = '';
                           $scope.findInfoError = 'WeWereUnableToProceed';
                           //$timeout(function() { $scope.findInfoError = ''; }, 3000);
                       }
                  }else if(!response.Error && response.data[0] && !response.data[0].IsEmailVerified && response.data[0].UserId != null){
                     $scope.global_process = '';
                     $scope.resendEmail = true;
                     $scope.isVerified = false;
                     $scope.verificationType = ''
                     $scope.userId = response.data[0].UserId;
                     
                  }else if( !response.Error && response.data[0] && response.data[0].IsEmailVerified){
                     $scope.global_process = '';
                     $scope.validationError = 'EMAIL_ALREADY_EXIST';
                     $scope.isVerified = false;
                     $scope.verificationType = ''
                     $timeout(function() { $scope.validationError = '';}, 10000);
                     
                  }else{
                       $scope.verificationType = '';
                       $scope.global_process = '';
                       $scope.buttonVisible = false;
                       $scope.findResponceData = '';
                       $scope.isVerified = false;
                       $scope.findInfoError = 'WeWereUnableToProceed';
                       //$timeout(function() { $scope.findInfoError = ''; }, 3000);
                   }
               }, function (error) {
                   $scope.verificationType = '';
                   $scope.isVerified = false;
                   $scope.buttonVisible = false;
                   $scope.global_process = '';
                   $scope.findInfoError = 'AnErrorOccurred';
                   
                   //$timeout(function() { $scope.findInfoError = ''; }, 3000);
               });
           }

           // verify user by passing phone number OR email address
           /**
            * @ngdoc
            * @name sdi.controller.function:#verifyUserEmailData
            * @description verify user by passing param
            * @param email 
           */
           $scope.isVerified = false;
           $scope.verifyUserEmailData = function(verifyEmailData){
            setTimeout(function () { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);
              $scope.createAccountError = '';
               $scope.verify_process = 'Verifying';
               $scope.emailError = '';
               $scope.verifySuccessMsg = '';
               var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
               if(verifyEmailData.Email){
                     if(regex.test(verifyEmailData.Email)){
                       serviceData.send('AccountApi/EmailVerification', verifyEmailData).then(function (response) {
                              if(response && !response.Error && response.Status === 200){
                                   $scope.verify_process = '';
                                   $scope.isVerified = true;
                                   $scope.verifyEmailData = verifyEmailData;
                                   $scope.verifySuccessMsg = response.data.Message;
                              }else{
                                     $scope.isVerified = false;
                                   $scope.verify_process = '';
                                   var errorMsg = response.Error.Message;
                                   $scope.emailError = errorMsg;
                                   $timeout(function() { $scope.emailError = '';}, 10000);
                              }                 
                           }, function (error) {
                                     $scope.isVerified = false;
                               $scope.verify_process = '';
                               var errorMsg = 'AnErrorOccurred';
                               $scope.emailError = errorMsg;
                               $timeout(function() { $scope.emailError = '';}, 10000);
                           });
                      }else{
                                     //$scope.isVerified = false;
                          $scope.verify_process = '';
                           var errorMsg = 'INVALID_EMAIL';
                           $scope.emailError = errorMsg;
                           $timeout(function() { $scope.emailError = '';}, 10000);
                      }
                  }else{
                      //$scope.isVerified = false;
                      $scope.verify_process = '';
                       var errorMsg = 'EMAIL_NOT_EMPTY';
                       $scope.emailError = errorMsg;
                       $timeout(function() { $scope.emailError = '';}, 10000);
                 } 
               }


               // verify user by passing patient data object
               /**
                * @ngdoc
                * @name sdi.controller.function:#createAnAccount
                * @description send varification link to patient email
                * @param email 
               */
               $scope.createAnAccount = function(verifyEmailData){
                setTimeout(function () { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);
                  $scope.verify_process = 'Processing';
                   $scope.createAccountError = '';
                   $scope.verifySuccessMsg = '';

                   if(verifyEmailData.Email){
                           serviceData.send('AccountApi/CreateAnAccount', verifyEmailData).then(function (response) {
                                  if(response && !response.Error && response.Status === 200){
                                       $scope.verify_process = '';
                                        $scope.isVerified = false;
                                       $scope.verificationType = 'verifyCompleted';
                                       $scope.userFirstName = $scope.patientData.FirstName;
                                       $scope.verifySuccessMsg = response.data.MessageKey;
                                  }else{
                                        $scope.verificationType = 'Email';
                                       $scope.isVerified = false;
                                       $scope.verify_process = '';
                                       var errorMsg = response.Error.Message;
                                       $scope.createAccountError = errorMsg;
                                       $timeout(function() { $scope.emailError = '';}, 10000);
                                  }                 
                               }, function (error) {
                                  $scope.verificationType = 'Email';
                                  $scope.verifySuccessMsg = '';
                                     $scope.isVerified = false;
                                   $scope.verify_process = '';
                                   var errorMsg = 'AnErrorOccurred';
                                   $scope.createAccountError = errorMsg;
                                   $timeout(function() { $scope.emailError = '';}, 10000);
                               });
                      }else{
                          $scope.verificationType = 'Email';
                          $scope.verifySuccessMsg = '';
                          $scope.isVerified = false;
                          $scope.verify_process = '';
                           var errorMsg = 'EMAIL_NOT_EMPTY';
                           $scope.createAccountError = errorMsg;
                           $timeout(function() { $scope.emailError = '';}, 10000);
                     } 
               }


               /**
                * @ngdoc
                * @name sdi.controller.function:#verifyUserPhoneData
                * @description verify user by passing param
                * @param PhoneNumber
               */
               $scope.verifyUserPhoneData = function(verifyPhoneData){
                  setTimeout(function () { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);
                  $scope.verify_process = "inProgress";
                  $scope.phoneNumber = '';
                 
                  
                  /*delete verifyPhoneData.PhoneArea;
                  delete verifyPhoneData.PhoneExchange;
                  delete verifyPhoneData.PhoneLast4;
                  delete verifyPhoneData.PhoneNumber;*/
                  if(verifyPhoneData.PhoneNumber){
                    var regex = /^[0-9]{1}[0-9]{9}$/;  
                     if(verifyPhoneData.PhoneNumber.length < 10 || !(verifyPhoneData.PhoneNumber.match(regex))){
                        $scope.phoneNumber = 'PleaseEnterValidPhoneNumber';
                        $scope.verify_process = '';
                        $timeout(function() { $scope.phoneNumber = ''; }, 10000);
                        return false;
                     }
                      verifyPhoneData.PhoneNo =  $filter('phonenumber')(verifyPhoneData.PhoneNumber);

                      serviceData.send('AccountApi/PhoneVerification', verifyPhoneData).then(function (response) {
                        if(response && !response.Error && response.Status === 200){
                             $scope.verify_process = '';
                             serviceGlobal.userSession = response.data;
                             serviceGlobal.userSession.gender = response.data.Gender;
                             serviceGlobal.userSession.mrn = response.data.MedicalRecordNo;
                             serviceGlobal.userSession.isPregnant = serviceGlobal.patientInfo.ChancePregnancy;
                             serviceGlobal.appointment.completedStep = 0;
                             serviceGlobal.appointment.PendingStep = 0;
                             $location.path('/exam');
                             return false;
                        }else{
                             $scope.verify_process = '';
                             var errorMsg = response.Error.Message;
                             $scope.phoneNumber = errorMsg;
                             $timeout(function() { $scope.phoneNumber = '';}, 3000);
                        }                 
                      }, function (error) {
                         $scope.verify_process = '';
                         var errorMsg = 'AnErrorOccurred';
                         $scope.phoneNumber = errorMsg;
                         $timeout(function() { $scope.phoneNumber = '';}, 3000);
                      });
                  }else{
                        $scope.verify_process = '';
                        var errorMsg = 'PHONE_CAN_NOT_EMPTY';
                        $scope.phoneNumber = errorMsg;
                        $timeout(function() { $scope.phoneNumber = '';}, 3000);
                  }           
               }

               /**
                * @ngdoc
                * @name sdi.controller.function:#continueAsGuest
                * @description continue without verify
                * @param gender
               */
               $scope.continueAsGuest = function(patientData, isProceed){
                setTimeout(function () { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);
                if(isProceed=='No'){
                  serviceGlobal.reset();
                  $location.path('/');
                  return false;
                }
                var PatientId = '';
                var MedicalRecordNo = '';
                      $scope.verify_process = "Processing";
                      $scope.continueGuestError = '';
                      var Dob = patientData.Month.id+"/"+patientData.Day.id+"/"+patientData.Year.id;
                     if (patientData.Gender === 1) {
                         var gender = 'M';
                     }else{
                         var gender =  'F';
                     }

                        if(serviceGlobal.patientInfo.MedicalRecordNo){
                          PatientId  = serviceGlobal.patientInfo.PersonId;
                          MedicalRecordNo = serviceGlobal.patientInfo.MedicalRecordNo;
                        }
                       var patientDataJSON = {FirstName : patientData.FirstName, LastName : patientData.LastName, Gender : gender, DateOfBirth : Dob, PatientId : PatientId, MedicalRecordNo : MedicalRecordNo};
                        serviceData.send('AccountApi/GuestUser?requestTime='+JSON.stringify(new Date()), patientDataJSON).then(function (response) {
                          var Gender = 'M';
                          if(patientData.Gender === 2){
                            Gender = 'F';
                          }
                           if(!response.Error && response.Status === 200){
                                  $scope.verify_process = '';
                                  serviceGlobal.userSession = response.data;
                                  serviceGlobal.userSession.gender = Gender;
                                  serviceGlobal.userSession.mrn = response.data.MedicalRecordNo;
                                  serviceGlobal.userSession.isPregnant = patientData.ChancePregnancy;
                                  serviceGlobal.appointment.completedStep = 0;
                                  serviceGlobal.appointment.PendingStep = 0;
                                  $location.path('/exam'); 
                                  return false;
                              }else{
                                  $scope.verify_process = '';
                                  $scope.continueGuestError = response.Error.Message;
                                  //$timeout(function() { $scope.phoneNumber = '';}, 3000);
                              }                 
                           }, function (error) {
                               $scope.verify_process = '';
                               $scope.continueGuestError = 'AnErrorOccurred';
                               //$timeout(function() { $scope.emailError = ''; $scope.phoneNumber = '';}, 3000);
                           });
                   

                 }
                 
                 $scope.resendVerificationEmail = function(){
                  setTimeout(function () { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);
                     $scope.verify_process = "Sending";
                     
                     serviceData.send('AccountApi/ReSendVerificationEmail', {UserId : $scope.userId}).then(function (response) {
                        $scope.verify_process = "";
                        if (response.Status === 200) {
                           $scope.resendEmail = false;
                           $scope.resendSuccess = true; 
                           $timeout(function() {  $scope.resendSuccess = false;}, 10000);
                        }else{
                           $scope.verify_process = '';
                           if (response.Error && response.Error.Message) {
                              $scope.validationError = response.Error.Message;   
                           }else{
                              $scope.validationError = 'AnErrorOccurred';
                           }
                          $timeout(function() {  $scope.validationError = '';}, 10000);
                        }
                     }, function (error) {
                           $scope.verify_process = '';
                           $scope.validationError = 'AnErrorOccurred';
                           $timeout(function() {  $scope.validationError = '';}, 10000);
                     });
                 }
    
       } else {
           $location.path('/');
           return false;
       }   
    }]);
