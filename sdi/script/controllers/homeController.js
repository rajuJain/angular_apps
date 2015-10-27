'use strict';

/* Home Controller Logic*/

angular.module('sdi')
    
    /**
     * @ngdoc
     * @name sdi.controller:#homeController
     * @url '/'
     * @template home.html
     * @public
     * @description Provide home page interface and will be intial stage of application.
    */
    
    .controller('homeController', ['$scope', '$location', '$cookies', '$timeout', 'serviceGlobal', 'serviceAuth', 'serviceData', function ($scope, $location, $cookies, $timeout, serviceGlobal, serviceAuth, serviceData) {
        
        $scope.combinationError = '';
        var allTypes = ['Mammogram Screening', 'Mammogram Diagnostic', 'DEXA', 'Breast', 'Pelvic', 'Abdomen', 'Carotid', 'Thyriod', 'XRay',
                        'ankle_le', 'brain', 'c_spine', 'foot_le', 'hip_le', 'knee_le', 'le_spine','shoulder_le', 't_spine', 'elbow_le', 'wrist_le',
                        'ct_abdomen','ct_brain_head','ct_chest','ct_neck','ct_sinus','ct_urogram','ct_pelvis'];
        
        $scope.examList =   [
                                { ParentExam : {ExamId: 'Mammogram', ExamName: 'Mammogram', DisplayName : 'Mammogram', ExamImagePath : '../images/mammogram.png', designClass : 'mammogram'},
                                  ChildExam : [
                                               {ExamId: 'Mammogram Diagnostic', ExamName: 'Mammogram Diagnostic', DisplayName : 'Diagnostic', ExamImagePath : '', designClass : 'mammogram'},
                                               {ExamId: 'Mammogram Screening', ExamName: 'Mammogram Screening', DisplayName : 'Screening', ExamImagePath : '', designClass : 'mammogram'}
                                              ]  
                                },
                                
                                { ParentExam : {ExamId: 'DEXA', ExamName: 'DEXA', DisplayName : 'DEXAB', ExamImagePath : '../images/dexa.png'}, ChildExam : [], designClass : 'dexa' },
                                
                                { ParentExam : {ExamId: 'DEXA', ExamName: 'DEXA', DisplayName : 'Ultrasound', ExamImagePath : '../images/ultrasound.png', designClass : 'ultrasound'},
                                    ChildExam : [
                                                    {ExamId: 'Abdomen', ExamName: 'Abdomen', DisplayName : 'UAbdomen', ExamImagePath : '', designClass : 'ultrasound'},
                                                    {ExamId: 'Breast', ExamName: 'Breast', DisplayName : 'UBreast', ExamImagePath : '', designClass : 'ultrasound'},
                                                    {ExamId: 'Carotid', ExamName: 'Carotid', DisplayName : 'UCarotid', ExamImagePath : '', designClass : 'ultrasound'},
                                                    {ExamId: 'Pelvic', ExamName: 'Pelvic', DisplayName : 'UPelvic', ExamImagePath : '', designClass : 'ultrasound'},
                                                    {ExamId: 'Thyriod', ExamName: 'Thyriod', DisplayName : 'UThyriod', ExamImagePath : '', designClass : 'ultrasound'}
                                                ]
                                },
                                
                                { ParentExam : {ExamId: 'XRay', ExamName: 'XRay', DisplayName : 'XRay', ExamImagePath : '../images/xray.png'}, ChildExam : [], designClass : 'xray' },
                                
                                { ParentExam : {ExamId: 'MRI', ExamName: 'MRI', DisplayName : 'MRI', ExamImagePath : '', designClass : 'mri'},
                                    ChildExam : [
                                                    {ExamId: 'ankle_le', ExamName: 'ankle_le', DisplayName : 'ankle_le', ExamImagePath : '', designClass : ''},
                                                    {ExamId: 'brain', ExamName: 'brain', DisplayName : 'brain', ExamImagePath : '', designClass : ''},
                                                    {ExamId: 'c_spine', ExamName: 'c_spine', DisplayName : 'c_spine', ExamImagePath : '', designClass : ''},
                                                    {ExamId: 'foot_le', ExamName: 'foot_le', DisplayName : 'foot_le', ExamImagePath : '', designClass : ''},
                                                    {ExamId: 'hip_le', ExamName: 'hip_le', DisplayName : 'hip_le', ExamImagePath : '', designClass : ''},
                                                    {ExamId: 'knee_le', ExamName: 'knee_le', DisplayName : 'knee_le', ExamImagePath : '', designClass : ''},
                                                    {ExamId: 'le_spine', ExamName: 'l_spine', DisplayName : 'l_spine', ExamImagePath : '', designClass : ''},
                                                    {ExamId: 'shoulder_le', ExamName: 'shoulder_le', DisplayName : 'shoulder_le', ExamImagePath : '', designClass : ''},
                                                    {ExamId: 't_spine', ExamName: 't_spine', DisplayName : 't_spine', ExamImagePath : '', designClass : ''},
                                                    {ExamId: 'elbow_le', ExamName: 'elbow_le', DisplayName : 'elbow_le', ExamImagePath : '', designClass : ''},
                                                    {ExamId: 'wrist_le', ExamName: 'wrist_le', DisplayName : 'wrist_le', ExamImagePath : '', designClass : ''}
                                                ]
                                },
                                { ParentExam : {ExamId: 'CTScan', ExamName: 'CTScan', DisplayName : 'CTScan', ExamImagePath : '', designClass : 'ct_scan'},
                                    ChildExam : [
                                                    {ExamId: 'ct_abdomen', ExamName: 'ct_abdomen', DisplayName : 'ct_abdomen', ExamImagePath : '', designClass : ''},
                                                    {ExamId: 'ct_brain_head', ExamName: 'ct_brain_head', DisplayName : 'ct_brain_head', ExamImagePath : '', designClass : ''},
                                                    {ExamId: 'ct_chest', ExamName: 'ct_chest', DisplayName : 'ct_chest', ExamImagePath : '', designClass : ''},
                                                    {ExamId: 'ct_neck', ExamName: 'ct_neck', DisplayName : 'ct_neck', ExamImagePath : '', designClass : ''},
                                                    {ExamId: 'ct_sinus', ExamName: 'ct_sinus', DisplayName : 'ct_sinus', ExamImagePath : '', designClass : ''},
                                                    {ExamId: 'ct_urogram', ExamName: 'ct_urogram', DisplayName : 'ct_urogram', ExamImagePath : '', designClass : ''},
                                                    {ExamId: 'ct_pelvis', ExamName: 'ct_pelvis', DisplayName : 'ct_pelvis', ExamImagePath : '', designClass : ''}
                                                ]
                                },
                            ];
        var combinations =  {
                               'Mammogram Diagnostic'  : ['Mammogram Diagnostic', 'DEXA', 'Breast','Pelvic'],
                               'Mammogram Screening' : ['Mammogram Screening', 'DEXA','Pelvic'],
                               'DEXA' : ['DEXA', 'Breast', 'Mammogram Diagnostic', 'Mammogram Screening'],
                               'Abdomen' : ['Abdomen', 'Pelvic'],
                               'Breast' : ['Breast', 'DEXA','Mammogram Diagnostic','Pelvic'],
                               'Carotid' : ['Carotid'],
                               'Pelvic' : ['Pelvic','Abdomen','Mammogram Diagnostic','Mammogram Screening','Breast'],
                               'Thyriod' : ['Thyriod'],
                               'XRay' : ['XRay'],
                               
                               'ankle_le' : ['ankle_le'],
                               'brain' : ['brain'],
                               'c_spine' : ['c_spine'],
                               'foot_le' : ['foot_le'],
                               'hip_le' : ['hip_le'],
                               'knee_le' : ['knee_le'],
                               'le_spine' : ['le_spine'],
                               'shoulder_le' : ['shoulder_le'],
                               't_spine' : ['t_spine'],
                               'elbow_le' : ['elbow_le'],
                               'wrist_le' : ['wrist_le'],
                               
                               'ct_abdomen' : ['ct_abdomen', 'ct_pelvis', 'ct_chest'],
                               'ct_brain_head' : ['ct_brain_head'],
                               'ct_chest' : ['ct_chest', 'ct_abdomen', 'ct_pelvis'],
                               'ct_neck' : ['ct_neck'],
                               'ct_sinus' : ['ct_sinus'],
                               'ct_urogram' : ['ct_urogram'],
                               'ct_pelvis' : ['ct_pelvis', 'ct_abdomen', 'ct_chest']
                               
                            };
                            
        var manadatoryExams =   {
                                    'Mammogram Diagnostic' : ['Breast'],
                                    'Breast' : ['Mammogram Diagnostic']
                                };
        
        
        $scope.selectedExam = serviceGlobal.home.examData || [];
        $scope.selectedParent = serviceGlobal.home.selectedParent || [];
        $scope.isDisable = serviceGlobal.home.isDisable || [];
        
        if(serviceGlobal.home.examData[0] == 'XRay' || serviceGlobal.isCompleteDontSeeExam){
            $scope.selectedExam = [];
            serviceGlobal.reset();
        }
        
        $scope.isProcessing = false;
        
        //Show child exams 
         $scope.openSubExamBox = function(tileName){
            if(!$scope.selectedParent[tileName]){
                $scope.selectedParent[tileName] = 1;    
            }else{
                delete $scope.selectedParent[tileName];
            }
            
        }
        
        //Disable Invalid exams as per selected exams
        $scope.disableInvalid = function(){
            $scope.isDisable = [];
            
            for(var examIndex = 0; examIndex <$scope.selectedExam.length; examIndex++){
                
                for(var typeIndex = 0; typeIndex <allTypes.length; typeIndex++){
                    
                    if (combinations[$scope.selectedExam[examIndex]].indexOf(allTypes[typeIndex]) == -1) {
                        $scope.isDisable[allTypes[typeIndex]] = true;
                    }
                }
                
            }
        }    

        /**
         * @ngdoc
         * @name sdi.controller.function:#setSchedule
         * @description select schedule exam 
         * @param value(exam name) type
        */
        
        $scope.setSchedule = function (value, type) {
            $scope.combinationError = '';
            var valueIndex = $scope.selectedExam.indexOf(value);
            var validCombinationFlag = 1;
           
            if (valueIndex === -1) {
                $scope.selectedExam.push(value);
                
                for(var examIndex = 0; examIndex <$scope.selectedExam.length; examIndex++){
                    if (combinations[$scope.selectedExam[examIndex]].indexOf(value) == -1) {
                        validCombinationFlag = 0;
                        break;
                    }
                }
                
                if(validCombinationFlag == 1){
                    if (manadatoryExams[value]) {
                        angular.forEach(manadatoryExams[value], function(mandExm, key){
                            $scope.selectedExam.push(mandExm);
                        });
                        $('#autoSelection').reveal();
                    }            
                    for(var typeIndex = 0; typeIndex <allTypes.length; typeIndex++){
                        if (combinations[value].indexOf(allTypes[typeIndex]) == -1) {
                            $scope.isDisable[allTypes[typeIndex]] = true;
                        }
                    }
                    
                }else{
                    $scope.selectedExam.splice($scope.selectedExam.indexOf(value),1);
                    $scope.combinationError = 'combinationError';
                    $('body').scrollTop(0);
                    $timeout(function() { $scope.combinationError = ''; }, 2000);
                }
                
            } else {
                
                $scope.selectedExam.splice(valueIndex, 1);
                if (manadatoryExams[value]) {
                    angular.forEach(manadatoryExams[value], function(mandExm, key){
                        $scope.selectedExam.splice($scope.selectedExam.indexOf(mandExm),1);
                    });
                }
                $scope.disableInvalid();
            }
            
            serviceGlobal.reset();
            serviceGlobal.exam.examAnswers = {};
            serviceGlobal.exam.isExamCompleted = 0;
            serviceGlobal.appointment.completedStep = -1;
            if (value == 'XRay' && validCombinationFlag == 1) {
                //console.log(validCombinationFlag);
               $scope.goToFindInfo();
               return false;
            }
            
        }
        
        /**
         * @ngdoc
         * @name sdi.controller.function:#checkSchedule
         * @description check combination of selected exam
         * @param value(exam name)
         * @return true, false
        */
        
        $scope.checkSchedule = function (value) {
            if (angular.isArray(value)) {
                for(var i =0; i < value.length; i++){
                    if ($scope.selectedExam.indexOf(value[i].ExamId) != -1) {
                        return true;
                    }
                }
                return false;
            }else{
                if ($scope.selectedExam.indexOf(value) === -1) {
                    return false;
                } else {
                    return true;
                }    
            }
        }
        
        /**
         * @ngdoc
         * @name sdi.controller.function:#goToFindInfo
         * @description after selecting exam got ot find info page if not loggedin otherwise it's redirect to exam page
         * @param selected exam data
        */
        
        $scope.goToFindInfo = function () {
			
            if ($scope.selectedExam.length > 0) {
                
                serviceGlobal.home.selectedParent   = $scope.selectedParent;
                serviceGlobal.home.isDisable = $scope.isDisable;
                serviceGlobal.home.examData  = $scope.selectedExam;
        
               serviceGlobal.isDontSeeExam = false;
                if($scope.selectedExam && $scope.selectedExam[0] == 'XRay'){
                    serviceGlobal.patientInfo = {};
                    $location.path('findLocationXray');
                    return false;
                }else{
                
                    if (!serviceAuth.isAuthenticated()) {
                        $cookies.globalData = serviceGlobal;
                        if(!serviceGlobal.appointment.completedStep)
                        {
                            serviceGlobal.appointment.completedStep = -1;    
                        }                    
                        $location.path('/findInfo');
                        return false;
                    } else {
                        //serviceGlobal.exam.examAnswers = {};
                        if(!serviceGlobal.appointment.completedStep || serviceGlobal.appointment.completedStep == -1)
                        {
                            serviceGlobal.appointment.completedStep = 0;
                        }
                        $location.path('/exam');
                        return false;
                    }
                }
            }
        }

    	$scope.dontSeeExams = function(){
            serviceGlobal.isDontSeeExam = true;
            serviceGlobal.patientInfo = {};
            $location.path('/otherExams');
            return false;
        }
        
        $scope.disableInvalid();
    }]);