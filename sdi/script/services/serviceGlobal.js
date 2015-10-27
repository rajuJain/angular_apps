'use strict';

/**
 * @ngdoc service
 * @name sdi.service:serviceGlobal
 * @description Maintain application flow by locking required input values.
 */

(function () {
    
    angular.module('sdi')
    /*globalVarFactory to store temp data */
    .factory('serviceGlobal',['$rootScope', '$cookies', '$log', 'config', 'serviceData' , function ($rootScope, $cookies, $log, config, serviceData) {
        var combinations = [];

        combinations['Mammogram Screening'] = [];
        combinations['Mammogram Diagnostic'] = [];
        combinations['DEXA'] = [];
        combinations['Breast'] = [];
        combinations['Pelvic'] = [];
        combinations['Abdomen'] = [];
        combinations['Carotid'] = [];
        combinations['Thyriod'] = [];
        combinations['XRay'] = [];
        
        combinations['Mammogram Screening']['Mammogram Screening'] = 1;
        combinations['Mammogram Screening']['Mammogram Diagnostic'] = 0;
        combinations['Mammogram Screening']['DEXA'] = 1;
        combinations['Mammogram Screening']['Breast'] = 0;
        combinations['Mammogram Screening']['Pelvic'] = 1;
        combinations['Mammogram Screening']['Abdomen'] = 0;
        combinations['Mammogram Screening']['Carotid'] = 0;
        combinations['Mammogram Screening']['Thyriod'] = 0;
        
        combinations['Mammogram Diagnostic']['Mammogram Screening'] = 0;
        combinations['Mammogram Diagnostic']['Mammogram Diagnostic'] = 1;
        combinations['Mammogram Diagnostic']['DEXA'] = 1;
        // Need to be 1 as per Matrix logic, but 0 mentioned in diagram
        combinations['Mammogram Diagnostic']['Breast'] = 1;
        combinations['Mammogram Diagnostic']['Pelvic'] = 1;
        combinations['Mammogram Diagnostic']['Abdomen'] = 0;
        combinations['Mammogram Diagnostic']['Carotid'] = 0;
        combinations['Mammogram Diagnostic']['Thyriod'] = 0;
        
        combinations['DEXA']['Mammogram Screening'] = 1;
        combinations['DEXA']['Mammogram Diagnostic'] = 1;
        combinations['DEXA']['DEXA'] = 1;
        combinations['DEXA']['Breast'] = 1;
        combinations['DEXA']['Pelvic'] = 0;
        combinations['DEXA']['Abdomen'] = 0;
        combinations['DEXA']['Carotid'] = 0;
        combinations['DEXA']['Thyriod'] = 0;
        
        combinations['Breast']['Mammogram Screening'] = 0;
        combinations['Breast']['Mammogram Diagnostic'] = 1;
        combinations['Breast']['DEXA'] = 1;
        combinations['Breast']['Breast'] = 1;
        combinations['Breast']['Pelvic'] = 1;
        combinations['Breast']['Abdomen'] = 0;
        combinations['Breast']['Carotid'] = 0;
        combinations['Breast']['Thyriod'] = 0;
        
        combinations['Pelvic']['Mammogram Screening'] = 1;
        combinations['Pelvic']['Mammogram Diagnostic'] = 1;
        combinations['Pelvic']['DEXA'] = 0;
        combinations['Pelvic']['Breast'] = 1;
        combinations['Pelvic']['Pelvic'] = 1;
        combinations['Pelvic']['Abdomen'] = 1;
        combinations['Pelvic']['Carotid'] = 0;
        combinations['Pelvic']['Thyriod'] = 0;
        
        combinations['Abdomen']['Mammogram Screening'] = 0;
        combinations['Abdomen']['Mammogram Diagnostic'] = 0;
        combinations['Abdomen']['DEXA'] = 0;
        combinations['Abdomen']['Breast'] = 0;
        combinations['Abdomen']['Pelvic'] = 1;
        combinations['Abdomen']['Abdomen'] = 1;
        combinations['Abdomen']['Carotid'] = 0;
        combinations['Abdomen']['Thyriod'] = 0;
        
        combinations['Carotid']['Mammogram Screening'] = 0;
        combinations['Carotid']['Mammogram Diagnostic'] = 0;
        combinations['Carotid']['DEXA'] = 0;
        combinations['Carotid']['Breast'] = 0;
        combinations['Carotid']['Pelvic'] = 0;
        combinations['Carotid']['Abdomen'] = 0;
        combinations['Carotid']['Carotid'] = 1;
        combinations['Carotid']['Thyriod'] = 0;
        
        combinations['Thyriod']['Mammogram Screening'] = 0;
        combinations['Thyriod']['Mammogram Diagnostic'] = 0;
        combinations['Thyriod']['DEXA'] = 0;
        combinations['Thyriod']['Breast'] = 0;
        combinations['Thyriod']['Pelvic'] = 0;
        combinations['Thyriod']['Abdomen'] = 0;
        combinations['Thyriod']['Carotid'] = 0;
        combinations['Thyriod']['Thyriod'] = 1;
        
    	combinations['XRay']['Mammogram Screening'] = 0;
        combinations['XRay']['Mammogram Diagnostic'] = 0;
        combinations['XRay']['DEXA'] = 0;
        combinations['XRay']['Breast'] = 0;
        combinations['XRay']['Pelvic'] = 0;
        combinations['XRay']['Abdomen'] = 0;
        combinations['XRay']['Carotid'] = 0;
        combinations['XRay']['Thyriod'] = 0;
        combinations['XRay']['XRay'] = 1;

        var appointMentSteps = [];
        appointMentSteps[0] = '';
        appointMentSteps[1] = 'exam';
        appointMentSteps[2] = 'findDoctor';
        appointMentSteps[3] = 'findLocation';
        appointMentSteps[4] = 'appointmentDate';
        appointMentSteps[5] = 'scheduleAppointment';
        
        return {
            releaseTokens : function(){
                var releaseTokenArr = [];
                var token = this.findDate.appointmentToken;
                //var oldTokens = JSON.parse(localStorage.getItem('tokens')) || [];
                var oldTokens = [];
                this.findDate.appointmentToken = [];
                
                for(var i = 0; i < token.length; i++){
                    releaseTokenArr.push({Token : token[i]});
                }
                
                for(var j = 0; j < oldTokens.length; j++){
                    if (releaseTokenArr.indexOf(oldTokens[j]) == -1) {
                        releaseTokenArr.push({Token : oldTokens[j]});
                    }
                }
                
                if (releaseTokenArr.length > 0) {
                    
                    serviceData.send('Appointment/SlotRelease', releaseTokenArr).then(function (response) {
                        //localStorage.removeItem('tokens');
                        $log.debug('Slot Rleased');
                    },function(error){
                        
                    });    
                } 
            },
            reset : function(){
                    this.releaseTokens();
                    
                    this.home = {
                        examData : [],
                        ultraSoundCount : 0,
                        screeningCount : 0,
                        validCombinations : combinations
                    },
                    this.exam = {
                        examQuestionIds : [],
                        examQuestions : {},
                        examAnswers : {},
                        examWiseAnswers : {},
                        isExamCompleted : 0,
                        examCode : '',
                        examWiseCode : []
                    },
                    this.findDoctor = {
                    },
                    this.findLocation = {
                        location : {}
                    },
                    this.findDate = {
                        appointment : {},
                        appointmentToken : []
                    },
                    this.appointmentSlotData = {
                        
                    },
                    
                    this.patientInfo = {
                    },
                    this.searchDoctorData = {

                    },
                    this.isTokenError = {

                    },
                    this.isDontSeeExam = false,
                    this.appointment.completedStep = 0,
                    this.appointment.PendingStep = 0
            },
            
            
            // Lock all variables used in home controller
            home : {
                    examData: [],
                    ultraSoundCount: 0,
                    screeningCount : 0,
                    validCombinations : combinations 
            },
            exam : {
                examQuestionIds : [],
                examQuestions : {},
                examAnswers : {},
                examWiseAnswers : {},
                isExamCompleted : 0,
                examCode : '',
                examWiseCode : {}
            },
            findDoctor : {
            },
            findLocation : {
                location : {}
            },
            findDate : {
                appointments : [],
                appointmentToken : []
            },
            appointmentSlotData : {

            },
            
            //Bind user identity through out application
            userSession : {
                gender : '',
                mrn : '',
                isPregnant : ''
            },

            patientInfo : {

            },

            searchDoctorData : {

            },

            isTokenError : {

            },
            isDontSeeExam : false,            
            appointment : {
                steps :  appointMentSteps,
                completedStep : 0,
                PendingStep : 0,
                getLastStep : function(){
                    $log.info('Last completed step - ' + appointMentSteps[this.completedStep]);
                    if (this.PendingStep != 0) {
                        if (this.PendingStep == -1) {
                            return 'findInfo';
                        }else{
                            return appointMentSteps[this.PendingStep];        
                        }
                        
                    }else{    
                        if (appointMentSteps[this.completedStep]) {
                             return appointMentSteps[this.completedStep];    
                        }else{
                            var session = $cookies.session || {};
                            if (!angular.isObject(session) && session.length > 0) {
                                session = JSON.parse(session)
                                if(session.Type && session.Type == 'User'){
                                    return 'exam';
                                }else{
                                  return '';
                                }
                            }else{
                                return '';
                            }
                        }
                    }
                }
            }
        };
    }]);

})();