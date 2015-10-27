'use strict';

/* scheduleAppointment Controller Logic*/

angular.module('sdi')

     /**
    * @ngdoc
    * @name sdi.Controller:scheduleAppointmentController
    * @url '/appointmentDate'
    * @template appointmentDate.html
    * @description
    * display user set own schedule
    */
    .controller('scheduleAppointmentController', ['$scope', '$location', '$filter', '$translate', '$sce', 'serviceGlobal', 'serviceData', 'serviceAuth', 'serviceExamQuestion', 'serviceExamCode' , function ($scope, $location, $filter, $translate, $sce, serviceGlobal, serviceData, serviceAuth, serviceExamQuestion, serviceExamCode) {
        $scope.isAuthenticated= serviceAuth.isAuthenticated();
        if (!serviceGlobal.userSession.mrn && !serviceAuth.isAuthenticated()) {
            $location.path('/login');
            return false;
        }
        if(serviceGlobal.appointment.completedStep < 4){
           $location.path("/" + serviceGlobal.appointment.getLastStep());
           return false;
        }
        
        if(serviceGlobal.findLocation.location && serviceGlobal.home.examData && serviceGlobal.findDate.appointments)
        {
            $scope.location = serviceGlobal.findLocation.location;
            $scope.selectedExam = serviceGlobal.home.examData;    
            var dateAppointmentData = serviceGlobal.findDate.appointments;
            var selectedAppointments = [];

            $scope.insuranceProviderOptions = [
                                               {id:'1', name:"AHCCCS"},
                                               {id:'2', name:"BCBS"},
                                               {id:'3', name:"Cigna"},
                                               {id:'4', name:"Medicare"},
                                               {id:'5', name:"United Healthcare"},
                                               {id:'6', name:"Other"}
                                            ]

            angular.forEach(dateAppointmentData, function(appointmentsData,key){
                    appointmentsData.day = dateFormat(new Date(appointmentsData.ExamDateTime), "dddd ");
                    appointmentsData.date = dateFormat(new Date(appointmentsData.ExamDateTime), "mmmm d, yyyy");
                    appointmentsData.month = dateFormat(new Date(appointmentsData.ExamDateTime), "mmmm");
                    appointmentsData.dateYear = dateFormat(new Date(appointmentsData.ExamDateTime), "d, yyyy");
                    appointmentsData.time = dateFormat(new Date(appointmentsData.ExamDateTime), "h:MM TT");
                    
                    angular.forEach(serviceGlobal.exam.examWiseCode, function(value, key){
                        if (value.examCode === appointmentsData.ExamCode) {
                            appointmentsData.ExamName = key;
                        }
                    });
                    selectedAppointments.push(appointmentsData);
            });
            
            $scope.selectedAppData = selectedAppointments;
        }else{
           $location.path('/');
           return false;
        }
        
        $scope.selecetInsurance = function(){
            $scope.insuranceData.first = {};
            delete $scope.insuranceData.second;
            delete $scope.insuranceData.third;
            $scope.formNo = 'first';
            //$('input[type="text"],.selectParent').removeClass('has-error');
        }

        $scope.showInsuranceForm = function(formNo){
            if(formNo=='first'){
               delete $scope.insuranceData.second;
               delete $scope.insuranceData.third;
            }else if(formNo=='second'){
               delete $scope.insuranceData.third;
            }
            $scope.formNo = formNo;
        }


        $scope.insuranceData = {};

        $scope.checkFieldValueType = function(className, id)
        {
            if($('#'+id).val() && $('#'+id).val().length > 0){
                $scope.slotReserveError = '';
                var alphabeticalRegex = /^[-\sa-zA-Z]+$/;
                var numericRegex = /^[0-9]+$/;
                var alfaNumericRegex = /^[-\sa-zA-Z0-9]+$/;
                var value = $('#'+id).val();
                if(className=='alphabetical')
                {
                    var isValidAlfa = alphabeticalRegex.test(value);
                    if(!isValidAlfa){
                        $('#'+id).addClass('has-error');
                    }else{
                        $('#'+id).removeClass('has-error');
                    }
                }
                if(className=='numeric')
                {
                    var isValidNumeric = numericRegex.test(value);
                    if(!isValidNumeric){
                        
                        $('#'+id).addClass('has-error');
                    }else{
                        $('#'+id).removeClass('has-error');
                    }
                }
                if(className=='alfaNumeric')
                {
                    var isValidAlfaNumeric = alfaNumericRegex.test(value);
                    if(!isValidAlfaNumeric){
                        $('#'+id).addClass('has-error');
                    }else{
                        $('#'+id).removeClass('has-error');
                    }
                }
            }

        }


        
        $scope.setScheduledAppointment = function (selectedAppData, insuranceData) {
            setTimeout(function () { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);
            $scope.slotReserveError = '';
            $scope.slotReserveErrorHtml  = '';
            //if(!serviceAuth.isAuthenticated()){
                var regex = /^[0-9]{1}[0-9]{9}$/;
                insuranceData.PhoneNumber = (insuranceData.PhoneNumber.replace(/\(/g, '')).replace(/\)/g, '').replace(/\ /g, '').replace(/\-/g, '');
                if(!insuranceData.PhoneNumber || insuranceData.PhoneNumber.length != 10 || !(insuranceData.PhoneNumber.match(regex))) {
                    $('#phoneNumner').addClass('has-error');
                    $scope.slotReserveError = 'PleaseEnterValidPhoneNumber';
                    return false;
                }else{
                     $('#phoneNumner').removeClass('has-error');
                }
            //}
            if(!insuranceData.insurance){
                $scope.slotReserveError = 'PleaseSelectInsuranceOption';
                return false;
            }
            if($('.has-error').length != 0){
                return false;
            }
            
            insuranceData.PhoneNumber =  $filter('phonenumber')(insuranceData.PhoneNumber);
            $scope.slotReserveError = '';
            $scope.isProcessing ='Processing';
            var examData = serviceGlobal.home.examData;
            var examQuestionData = serviceGlobal.exam;
            var doctorData = serviceGlobal.findDoctor;
            var UserId = (serviceGlobal.userSession && serviceGlobal.userSession.UserId) ? serviceGlobal.userSession.UserId : 'Not Require';
            var SelectedSlot = [];
            var insuranceFormData = [];
            angular.forEach(selectedAppData, function(appointment,appKey){
                
                var slots = {};
                slots.Duration = appointment.Duration;
                slots.OrganizationCode  = appointment.OrganizationCode ;
                slots.ResourceCode = appointment.ResourceCode;
                slots.SlotDateAndTime = appointment.ExamDateTime;
                slots.ExamCode = appointment.ExamCode;
                slots.ExamName = appointment.ExamName;
                slots.ExamType = appointment.ExamName;
                slots.ExamDescription = appointment.ExamDescription;
                slots.ExamInstruction = appointment.PrecautionText;
                slots.ExamModifiers1 = appointment.ExamModifierCode1;
                slots.ExamModifiers2 = appointment.ExamModifierCode2;
                slots.ExamModifiers3 = appointment.ExamModifierCode3;    
                slots.month = appointment.month;    
                slots.dateYear = appointment.dateYear;    
                slots.date = appointment.date;    
                slots.day = appointment.day;    
                slots.time = appointment.time;    
                slots.Token = appointment.Token;
                SelectedSlot.push(slots);
            });
           
            if(insuranceData.insurance == 'HaveInsurance'){
                if(insuranceData.first){
                    var firstInsuranceForm = insuranceData.first;
                    var providerName = (firstInsuranceForm.Provider.id == 6) ? firstInsuranceForm.otherProviderName : firstInsuranceForm.Provider.name;
                    var firstGroupNumber = (firstInsuranceForm.GroupNo) ? firstInsuranceForm.GroupNo : '';
                    insuranceFormData.push({Name:firstInsuranceForm.Name, GroupNumber:firstGroupNumber, SubscriberId:firstInsuranceForm.SubscriberId, InsuranceProvider:providerName})
                }
                if(insuranceData.second){
                    var secondInsuranceForm = insuranceData.second;
                    var providerName = (secondInsuranceForm.Provider.id == 6) ? secondInsuranceForm.otherProviderName : secondInsuranceForm.Provider.name;
                    var secondGroupNumber = (secondInsuranceForm.GroupNo) ? secondInsuranceForm.GroupNo : '';
                    insuranceFormData.push({Name:secondInsuranceForm.Name, GroupNumber:secondGroupNumber, SubscriberId:secondInsuranceForm.SubscriberId, InsuranceProvider:providerName})
                }
                if(insuranceData.third){
                    var thirdInsuranceForm = insuranceData.third;
                    var providerName = (thirdInsuranceForm.Provider.id == 6) ? thirdInsuranceForm.otherProviderName : thirdInsuranceForm.Provider.name;
                    var thirdGroupNumber = (thirdInsuranceForm.GroupNo) ? thirdInsuranceForm.GroupNo : '';
                    insuranceFormData.push({Name:thirdInsuranceForm.Name, GroupNumber:thirdGroupNumber, SubscriberId:thirdInsuranceForm.SubscriberId, InsuranceProvider:providerName})
                }
            }
            var insuranceType = {};
            insuranceType['HaveInsurance'] = 'I have insurance';
            insuranceType['Cash'] = 'Self-pay (I do not have insurance.)';
            insuranceType['IWillProvideInfoLater'] = 'I will provide insurance information later';
            insuranceType['DirectPay'] = 'Direct-pay (I have insurance I choose not to use.)';
            
            var insuranceJson = {
                InsuranceType: insuranceType[insuranceData.insurance], 
                PhoneNo:insuranceData.PhoneNumber, 
                InsuranceSubscriberInfo : insuranceFormData
            }
            var MRNnumber = '';
            if(serviceAuth.isAuthenticated()){
                MRNnumber = 'NotFound';
            }else if(serviceGlobal.userSession.mrn){
                MRNnumber = serviceGlobal.userSession.mrn;   
            }else{
                $scope.slotReserveError = 'Your Session Expired. Please try again after login or continue as a guest user.';
            }

            var appointmentSlotData = {
                                        AppointmentReason  : serviceExamQuestion.getExamReasons(),
                                        MedicalRecordNumber : MRNnumber,
                                        ProviderId : doctorData[0].ProviderID,
                                        ProviderNumber : doctorData[0].ProviderNumber,
                                        ProviderFirstName : doctorData[0].FirstName,
                                        ProviderLastName : doctorData[0].LastName,
                                        ProviderLocationID  : doctorData[0].ProviderLocationID,
                                        SelectedSlot:  SelectedSlot,
                                        Questionnaire  : JSON.stringify({examWiseAnswers : examQuestionData.examWiseAnswers, questionWiseAnswers : examQuestionData.examAnswers}),
                                        UserId  : UserId,
                                        Insurance : insuranceJson
                                    };
            serviceData.send('Appointment/SlotReserved', appointmentSlotData).then(function (response) {
               if(!response.Error && response.Status === 200){
                     if(response.data.IsSlotReserved){
                        //serviceGlobal.reset();
                        serviceGlobal.appointmentSlotData = appointmentSlotData;
                        $location.path('/thankYou');
                        return false;
                     }else{
                        $scope.isProcessing ='';
                        $scope.slotReserveError = 'SelectedSlotNotAvailable';
                     }
                }else if(response.Error && response.Error.Code == '1090'){
                    serviceAuth.logout();
                    window.location.href = serviceData.rootUrl;
                }else if(response.Error && response.Error.Code == '1006'){
                        var msgArray = (response.Error.Message).split("#");
                        var codeArr = [];
                            for(var i = 1; i < msgArray.length; i++)
                            {
                                if(isNaN(msgArray[i])){
                                    codeArr.push('<li>'+msgArray[i]+'</li>');
                                }
                            }
                            var msgTest = codeArr.toString().replace(/,/g, '');
                        $scope.slotReserveErrorHtml = $sce.trustAsHtml('<ul style="margin-left: 20px;text-align: left;">'+msgTest+'</ul>');
                        $scope.isProcessing ='';
                }else{
                    $scope.isProcessing ='';
                    $scope.slotReserveError = response.Error.Message;
               }   
            },function(error){
                    $scope.isProcessing ='';
                    $scope.slotReserveError = 'AnErrorOccurred';
            });
        }
        $(".overlay").hide();
    }]);