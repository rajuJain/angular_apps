'use strict';

/* thankYou Controller Logic*/

angular.module('sdi')

     /**
    * @ngdoc
    * @name sdi.Controller:thankYouController
    * @url '/thankYou'
    * @template thankYou.html
    * @description
    * display after schedule appointment 
    */
    .controller('thankYouController', ['$scope', '$location', '$timeout', 'serviceGlobal', 'serviceAuth', 'serviceExamCode', 'serviceData' , function ($scope, $location, $timeout, serviceGlobal, serviceAuth, serviceExamCode, serviceData) {
        if (!serviceGlobal.userSession.mrn && !serviceAuth.isAuthenticated()) {
              $location.path('/login');
              return false;
        }
        if(serviceGlobal.appointment.completedStep < 4){
            $location.path("/" + serviceGlobal.appointment.getLastStep());
            return false;
        }
        if(serviceGlobal.findLocation.location && serviceGlobal.appointmentSlotData.AppointmentReason){
            $scope.location = serviceGlobal.findLocation.location;
            $scope.slotAppointment = serviceGlobal.appointmentSlotData.SelectedSlot;
        }else{
            $location.path('#/');
            return false;
        }
          var sessionData = serviceAuth.isAuthenticated() ? serviceAuth.getSession() : serviceGlobal.userSession.firstName;

        $scope.selectedExams = serviceGlobal.home.examData;
        $scope.instructions = serviceExamCode.examInstructions();
        
        $scope.currentYear = new Date();
        var examPriorities = serviceExamCode.examPriority;
        var examCodeObj = serviceExamCode.getExamCode();
        var orderedExam = [];
        var orderedExamName = [];
        angular.forEach(serviceGlobal.home.examData, function(value,key){
            orderedExam[examPriorities.indexOf(value)] = value;
        });
        angular.forEach(orderedExam, function(element, key){
                   orderedExamName.push(element);
        });

        var orderedExamArray = orderedExamName.toString();
        if (orderedExamArray=='Pelvic' || orderedExamArray=='Pelvic,Mammogram Screening' || orderedExamArray=='Pelvic,Mammogram Diagnostic,Breast' || orderedExamArray=='Pelvic,Abdomen') {
            if (orderedExamArray=='Pelvic'){
                if ($scope.location.LocationType == 'SMIL') {
                    $scope.InstructionKey = 'Pelvic_SMIL_instruction';
                }else{
                    if (serviceGlobal.userSession.gender=='M') {
                        $scope.InstructionKey = 'Pelvic_VRL_MALE_instruction';
                    }else{
                        $scope.InstructionKey = 'Pelvic_VRL_FEMALE_instruction';
                    }
                }
            }else if (orderedExamArray=='Pelvic,Mammogram Screening'){
                if ($scope.location.LocationType == 'SMIL') {
                    $scope.InstructionKey = 'Pelvic,Mammogram Screening_SMIL_instruction';
                }else{
                    $scope.InstructionKey = 'Pelvic,Mammogram Screening_VRL_instruction';
                }
            }else if (orderedExamArray=='Pelvic,Abdomen') {
                if ($scope.location.LocationType == 'SMIL') {
                    $scope.InstructionKey = 'Pelvic,Abdomen_SMIL_instruction';
                }else{
                    if (serviceGlobal.userSession.gender=='M') {
                        $scope.InstructionKey = 'Pelvic,Abdomen_VRL_MALE_instruction';
                    }else{
                        $scope.InstructionKey = 'Pelvic,Abdomen_VRL_FEMALE_instruction';
                    }
                }
            }else if(orderedExamArray=='Pelvic,Mammogram Diagnostic,Breast'){
                    if ($scope.location.LocationType == 'SMIL') {
                        $scope.InstructionKey = 'Pelvic,Mammogram Diagnostic,Breast_SMIL_instruction';
                    }else{
                        $scope.InstructionKey = 'Pelvic,Mammogram Diagnostic,Breast_VRL_instruction';
                    }
            }
        }else{
            $scope.InstructionKey = orderedExamArray+'_instruction';
        }

          /*var instructionsArray = [];
          var selectedExams = serviceGlobal.home.examData;
          var instructions = serviceExamCode.examInstructions();
          for(var i=0; i < selectedExams.length; i++){
              if(instructionsArray.indexOf(instructions[selectedExams[i]]) === -1){
                  instructionsArray.push(instructions[selectedExams[i]]);    
              }                    
          }
          $scope.examInstructions = instructionsArray;*/



        $scope.serverPath = serviceData.rootUrl;
        serviceData.logData($scope.serverPath);
        
        serviceGlobal.reset();

        $(".overlay").hide();

        $scope.showFormatedDate = function(date, type){
            if(date){
                var values = date.split(/[^0-9]/),
               year = parseInt(values[0], 10),
               month = parseInt(values[1], 10) - 1, // Month is zero based, so subtract 1
               day = parseInt(values[2], 10),
               hours = parseInt(values[3], 10),
               minutes = parseInt(values[4], 10),
               seconds = parseInt(values[5], 10);
               
               date = new Date(year, month, day, hours, minutes, seconds);
               return dateFormat(new Date(date), type);    
            }
       }

       $scope.printInstructions = function(){
            var contents = document.getElementById("print_template").innerHTML;
            var frame1 = document.createElement('iframe');
            frame1.name = "frame1";
            frame1.style.position = "absolute";
            frame1.style.top = "-1000000px";
            document.body.appendChild(frame1);
            var frameDoc = frame1.contentWindow ? frame1.contentWindow : frame1.contentDocument.document ? frame1.contentDocument.document : frame1.contentDocument;
            frameDoc.document.open();
            frameDoc.document.write('<html><head><title>Prep Instructions</title>');
            frameDoc.document.write('</head><body>');
            frameDoc.document.write(contents);
            frameDoc.document.write('</body></html>');
            frameDoc.document.close();
            setTimeout(function () {
                window.frames["frame1"].focus();
                window.frames["frame1"].print();
                document.body.removeChild(frame1);
            }, 500);
            return false;
       }

       $scope.sendInstructionsMail = function(){
          if (serviceAuth.isAuthenticated()) {
              var info = {Email: sessionData.Email, Name: sessionData.Name};
              $scope.sendInstructionsViaMail(info);
          }else{
              $('#sendMailFormDiv').toggle();
          }
       }

       $scope.sendInstructionsViaMail = function(info){
        setTimeout(function () { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);
        var ContentHtml = $('#mailContant').html();
        $scope.isProcessing = 'Sending';
        $scope.emailError = '';
        $scope.emailError = '';
        if(info.Name){
          var instructionsJson = {Name : info.Name, Email : info.Email, Html : ContentHtml};
        }else{
          var instructionsJson = {Name : sessionData, Email : info.Email, Html : ContentHtml};  
        }
        
        serviceData.send('Appointment/EmailPreInstruction', instructionsJson).then(function (response) {
           if(response.Status == 200){
                    $('#sendMailFormDiv').hide();
                    $scope.info = {};
                    $scope.isProcessing = '';
                if (response.data.IsEmailSent) {
                    $scope.emailSuccess ='mailSentSuccessfully';
                    $timeout(function() { $scope.emailSuccess = ''; }, 10000);
                }else{
                    $scope.emailError = 'EMAIL_SENDING_FAILED';
                    $timeout(function() { $scope.emailError = ''; }, 10000);
                }
           }else{
              $scope.emailError = response.Error.Message;
              $scope.isProcessing = '';
              $timeout(function() { $scope.emailError = ''; }, 10000);
           }               
        });
       }



    }]);