'use strict';

/* Exam Controller Logic*/

angular.module('sdi')


/**
     * @ngdoc
     * @name sdi.controller:#examController
     * @url '/exam'
     * @template exam.html
     * @public
     * @description Generate a dynamic exam form as per exam/test selection on home page.
    */
    
    .controller('examController', ['$rootScope', '$scope', '$location', '$cookies', '$timeout', 'serviceAuth','serviceData', 'serviceGlobal', 'serviceExamQuestion', 'serviceExamCode', function ($rootScope, $scope, $location, $cookies, $timeout, serviceAuth, serviceData, serviceGlobal, serviceExamQuestion, serviceExamCode) {
            serviceData.logData(serviceExamQuestion.getQuestions());
            $scope.SuccessMsg = '';
            $scope.examError = '';
            $scope.isProcessing = '';
            $scope.exam = serviceGlobal.home.examData;
            var isConvertToDiagnostic = false;
            var questionData = serviceExamQuestion.getQuestions();
            var questions = questionData.questions;
            var examWiseQuestions = questionData.examWiseQuestions;
            var parentChildMap = questionData.parentChildMap;

        
            
            if (questions.length > 0 && (serviceGlobal.userSession.mrn || serviceAuth.isAuthenticated())) {
                if (serviceGlobal.userSession.gender == '') {
                    if(!serviceAuth.isAuthenticated()){
                        $location.path('/findInfo'); 
                        return false;   
                    }else{
                        $location.path('/');
                        return false;
                    }
                }else if (serviceGlobal.userSession.gender == 'F' && serviceGlobal.userSession.isPregnant == 'Yes') {
                        $('#togglePregnent').click();
                }
                if (serviceGlobal.exam.isExamCompleted == 1) {
                    //$location.path('/findDoctor');
                }
                
                serviceGlobal.exam.examQuestions = questions;
                serviceGlobal.exam.examQuestionIds = questionData.examQuestionId;
                $scope.answer =  serviceGlobal.exam.examAnswers || {};
                
                if(serviceGlobal.appointment.completedStep >= 1 ){
                        var isExamChanged = false;
                        var registerUnregister = $scope.$watch('answer', function(newVal, oldVal){
                                if (isExamChanged) {
                                        serviceGlobal.appointment.completedStep = 0;
                                        serviceGlobal.appointment.PendingStep = 1;
                                        serviceGlobal.findDoctor = {};
                                        serviceGlobal.searchDoctorData = {};
                                        serviceGlobal.findLocation = {location : {}};
                                        serviceGlobal.findDate = {appointments : [],appointmentToken : {}};
                                        serviceGlobal.appointmentSlotData = {};
                                        $rootScope.currentStep = serviceGlobal.appointment.completedStep;
                                        registerUnregister();
                                }
                                isExamChanged = true;
                        },true);        
                }
                
                $scope.questions = questions;
                
                // create month array
                $scope.monthNames = [
                   { id: 1, name: 'January' },
                   { id: 2, name: 'February' },
                   { id: 3, name: 'March' },
                   { id: 4, name: 'April' },
                   { id: 5, name: 'May' },
                   { id: 6, name: 'June' },
                   { id: 7, name: 'July' },
                   { id: 8, name: 'August' },
                   { id: 9, name: 'September' },
                   { id: 10, name: 'October' },
                   { id: 11, name: 'November' },
                   { id: 12, name: 'December' }
                ];
                
                // create year array
                var thisYear = new Date().getFullYear();
                var year = [];
                for (var i = 0; i < 25; i++)
                {
                    var objYear = { id: thisYear - i, name: thisYear - i };
                   year.push(objYear);
                }
                $scope.year = year;



                $scope.datePickerOptions = {
                    min: new Date(1950, 11, 31, 16, 0, 0),
                    max: new Date(),
                    format : "MM/dd/yyyy",
                    culture : $scope.lang
                };
                
                $scope.checkExistense = function(existFor){
                    for(var ei=0; ei<serviceGlobal.home.examData.length; ei++){
                        if (existFor.indexOf(serviceGlobal.home.examData[ei]) !== -1) {
                            return true;
                            break;
                        }
                    }
                    return false;
                }
                
                $scope.setPregnancy = function(val){
                    serviceGlobal.userSession.isPregnant = (val=='ok' || val == 'Yes') ? 'Yes' : ((val=='No' || val == 'cancel') ? 'No' : '');
                    $("#checkPregnency").trigger('reveal:close');
                    if (val == 'Yes') {
                       $('#togglePregnent').click();
                    }else if(val == 'ok'){
                        serviceGlobal.appointment.completedStep = 0;
                        serviceGlobal.reset();
                        serviceGlobal.userSession = {};
                        $('#pregnent').trigger('reveal:close');
                        $location.path('/');
                        return false;
                    }else if(val == 'cancel'){
                        $('#pregnent').trigger('reveal:close');
                    }
                }
                
                $scope.convertMammo = function(val){
                        if (val == 'Yes') {
                                $("#changeMammo").click();
                        }else{
                                $('#conversionMsg').trigger('reveal:close');
                                $scope.makeDiagnosticMammo(0);
                        }
                }
                
                $scope.makeDiagnosticMammo = function(bool){
                        if (bool === 1) {
                                isConvertToDiagnostic = true;
                                var screeningIndex = serviceGlobal.home.examData.indexOf('Mammogram Screening');
                                if (screeningIndex !== -1) {
                                        serviceGlobal.home.examData.splice(screeningIndex,1, 'Mammogram Diagnostic','Breast');
                                        serviceGlobal.home.ultraSoundCount = 1;
                                        $scope.exam = serviceGlobal.home.examData;             
                                }
                                
                        }else{
                                isConvertToDiagnostic = false;
                                var screeningIndex = serviceGlobal.home.examData.indexOf('Mammogram Diagnostic');
                                if (screeningIndex !== -1) {
                                        serviceGlobal.home.examData.splice(screeningIndex,2, 'Mammogram Screening');
                                        serviceGlobal.home.ultraSoundCount = 0;
                                        $scope.exam = serviceGlobal.home.examData;        
                                }
                                
                                $scope.answer[4] = 'No';
                                $('input[name=question_4]').val('No');        
                        }
                        
                        // In case if need to reload question for conversion case
                        
                        /*questionData = serviceExamQuestion.getQuestions();
                        questions = questionData.questions;
                        examWiseQuestions = questionData.examWiseQuestions;
                        parentChildMap = questionData.parentChildMap;
                        serviceGlobal.exam.examQuestions = questions;
                        serviceGlobal.exam.examQuestionIds = questionData.examQuestionId;
                        $scope.answer =  serviceGlobal.exam.examAnswers || {};
                        $scope.questions = questions;*/
                        
                        $('#conversionMsg').trigger('reveal:close');
                        
                }
                
                
                
                $scope.answerMedicalHistory = function (answer) {
                   setTimeout(function () { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);
                   serviceData.logData(answer);
                    var isErrorFlag = 0;
                    
                    function validInputs(questionsArr){
                        
                        angular.forEach(questionsArr, function(value,key){
                                
                            if ( ($scope.checkExistense(value.questionExistFor)  || ( value.questionLevel == 1 && value.questionId ==  4) ) && !answer[value.questionId] && value.isRequired) {
                                    $("#label_"+value.questionId).css('color', '#d9534f');
                                    if(!$("#label_"+value.questionId).hasClass('hasValidationError')){
                                        $("#label_"+value.questionId).addClass('hasValidationError');
                                    }
                                    isErrorFlag = 1;    
                            }else if($scope.checkExistense(value.questionExistFor) || ( value.questionLevel == 1 && value.questionId ==  4) && value.isRequired){
                                $("#label_"+value.questionId).css('color', '#282f37');
                                if($("#label_"+value.questionId).hasClass('hasValidationError')){
                                    $("#label_"+value.questionId).removeClass('hasValidationError');
                                }
                                
                                if (value.answerType == 'date') {
                                    if($("#question_"+ value.questionId +"_month").val() == '' || $("#question_"+ value.questionId +"_year").val() == ''){
                                        $("#label_"+value.questionId).css('color', '#d9534f');
                                        if(!$("#label_"+value.questionId).hasClass('hasValidationError')){
                                            $("#label_"+value.questionId).addClass('hasValidationError');
                                        }
                                        isErrorFlag = 1;
                                    }else{
                                        $("#label_"+value.questionId).css('color', '#282f37');
                                        if($("#label_"+value.questionId).hasClass('hasValidationError')){
                                                $("#label_"+value.questionId).removeClass('hasValidationError');
                                        }
                                    }
                                }else if(value.answerType == 'checkbox'){
                                    if ($("#feildGroup_" + value.questionId + " input[type='checkbox']:checked").length > 0) {
                                        $("#label_"+value.questionId).css('color', '#282f37');
                                        if($("#label_"+value.questionId).hasClass('hasValidationError')){
                                                $("#label_"+value.questionId).removeClass('hasValidationError');
                                        }
                                        
                                        if (answer[value.questionId]['Other'] && $("#other_"+value.questionId).val() == '') {
                                            $("#label_"+value.questionId).css('color', '#d9534f');
                                            if(!$("#label_"+value.questionId).hasClass('hasValidationError')){
                                                $("#label_"+value.questionId).addClass('hasValidationError');
                                            }
                                            isErrorFlag = 1;
                                        }
                                        
                                    }else{
                                        $("#label_"+value.questionId).css('color', '#d9534f');
                                        if(!$("#label_"+value.questionId).hasClass('hasValidationError')){
                                            $("#label_"+value.questionId).addClass('hasValidationError');
                                        }
                                        isErrorFlag = 1;    
                                    }    
                                }
                                
                                
                                if (answer[value.questionId] == 'Yes') {
                                    var childQuestions = value.childQuestion_yes;
                                    angular.forEach(value.childQuestion_no, function(noQues, key){
                                        if( (noQues.answerType == 'text' || noQues.answerType == 'radio' || noQues.answerType == 'date') && answer[noQues.questionId])
                                        {
                                            delete answer[noQues.questionId];
                                        }else if(noQues.answerType == 'checkbox'){
                                            angular.forEach(noQues.answerOption, function(option,optionIndex){
                                                delete answer[option + noQues.questionId];
                                            });
                                        }
                                    });
                                }else if (answer[value.questionId] == 'No') {
                                    var childQuestions = value.childQuestion_no;
                                    angular.forEach(value.childQuestion_yes, function(yesQues, key){
                                        if( (yesQues.answerType == 'text' || yesQues.answerType == 'radio' || yesQues.answerType == 'date') && answer[yesQues.questionId]){
                                            delete answer[yesQues.questionId];
                                        }else if(yesQues.answerType == 'checkbox'){
                                            angular.forEach(yesQues.answerOption, function(option,optionIndex){
                                                delete answer[option + yesQues.questionId];
                                            });
                                        }
                                    });
                                }else{
                                    var childQuestions = [];
                                }
                                
                                if (childQuestions.length > 0) {
                                    validInputs(childQuestions);
                                }
                                
                                /*angular.forEach(childQuestions, function(childQue,childIndex){
                                    if (answer[childQue.questionId] == undefined || answer[childQue.questionId] == '') {
                                        checkValidity(childQue);
                                    }else{
                                        $("#label_"+childQue.questionId).css('color', '#282f37');
                                    }
                                });*/
                            }else{
                                console.log(value.questionExistFor, value.questionId);
                            }
                        });    
                    }
                    validInputs(questions);
                    
                    if (isErrorFlag === 0) {
                        //In case if screening converted to diagnostic based on answers
                        if (isConvertToDiagnostic && answer[5]) {
                                var diagnosticMammoReason = answer[5];
                                delete answer[5];
                                answer[6] = diagnosticMammoReason;
                        }
                        $scope.answer = answer;
                        serviceGlobal.exam.examAnswers = answer;
                        $scope.isProcessing = 'Processing';
                        $scope.examError = '';
                        var examWiseAnswers = {};
                        angular.forEach($scope.exam, function(examName,key){
                            examWiseAnswers[examName] = []; 
                            angular.forEach(examWiseQuestions[examName], function(examQuestionID,key){
                                if (answer[examQuestionID]) {
                                    examWiseAnswers[examName].push({questionID : examQuestionID, answer : answer[examQuestionID]});
                                }
                                if (parentChildMap[examQuestionID] && parentChildMap[examQuestionID].length > 0) {
                                    angular.forEach(parentChildMap[examQuestionID], function(childQuestionId, key){
                                        if (answer[childQuestionId]) {
                                            examWiseAnswers[examName].push({questionID : childQuestionId, answer : answer[childQuestionId]});
                                        }
                                    })
                                }
                            });
                        });
                        serviceGlobal.exam.examWiseAnswers = examWiseAnswers;
                        
                        if (serviceGlobal.appointment.completedStep < 1) {
                            serviceGlobal.appointment.PendingStep = 0;    
                            serviceGlobal.appointment.completedStep = 1; 
                        }
                        $location.path('/findDoctor');
                        return false;
                       
                    }else{
                        $scope.answer = answer;
                        $scope.isProcessing = '';
                        $scope.examError = 'PleaseAnswerAllQuestions';
                        serviceData.logData('Please answer all questions');
                        $('html, body').animate({
                                scrollTop: $( ".hasValidationError" ).first().offset().top
                            }, 1000);
                        
                        
                    }
                }
                $("document").ready(function(){
                    if (!serviceGlobal.userSession.isPregnant && serviceGlobal.userSession.gender == 'F' && serviceGlobal.exam.isExamCompleted == 0) {
                        $('#togglePregnancyCheck').click();
                    }
                });
            }else{
                $location.path('/');
                return false;
            }
            
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
                       $scope.datePickerOptions.culture = lang;
         
                     })
                   });
            
           });
    }]);