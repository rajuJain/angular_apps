'use strict';

/* Signup Controller Logic*/

angular.module('sdi')

    /**
    * @ngdoc
    * @name sdi.Controller:signupController
    * @url '/signup'
    * @template signup.html
    * @description Manage user signup process
    */
    .controller('signupController', ['$scope', '$routeParams', '$timeout', '$location', '$translate', 'serviceGlobal', 'serviceData', 'serviceAuth', 'serviceExamQuestion', function ($scope, $routeParams, $timeout, $location, $translate, serviceGlobal, serviceData, serviceAuth, serviceExamQuestion) {
                
        if ($routeParams.userId && $routeParams.code && $routeParams.culture) {
            $scope.culture = $routeParams.culture;
            if (!serviceAuth.isAuthenticated()) {
                var dataJson = {Code : $routeParams.code, UserId  : $routeParams.userId, Type : 'Confirmation'};
                serviceData.send('AccountApi/IsTokenValid', dataJson).then(function (response) {
                    if(!response.Error && response.Status === 200 && response.data.IsTokenValid){
                         serviceGlobal.isTokenError = {
                            isError : false,
                            msg : ''
                        }
                    
                        
                        // serviceData.send('AccountApi/ConfirmEmail',{'userId' : $routeParams.userId, 'code' : $routeParams.code}).then(function(response){
                        //     if(response.Error && response.Error.Code==1050){
                        //         $location.path('/login');
                        //     }
                        // },function(error){
                        //     $location.path("/");
                        // });

                
                    $scope.questions = [];
                    $scope.userData = {WillOptInForSurveys:true};
                    /*serviceData.get('Accountapi/GetSecurityQuestions').then(function(response){
                        if(!response.Error && response.Status === 200){
                            angular.forEach(response.data, function(value, key){
                                $scope.questions.push({ID : key, Question : value, CustomQustion : false});
                            });
                        }
                    },function(error){
                        console.log(error);
                    });*/
                    
                    
                    angular.forEach(serviceExamQuestion.securityQuestions.securityQues, function(questionCode, key){
                        $scope.questions.push({ID : key, Question : questionCode, CustomQustion : false});   
                    });


                    $scope.checkValidValue = function(value, id){
                        $scope.createAccountError = '';
                        if(value && value.length < 6){
                            $('#'+id).addClass('has-error').focus();
                            return false;
                        }else{
                            $('#'+id).removeClass('has-error');
                        }
                    }  

                    /**
                     * @ngdoc
                     * @name sdi.controller.function:#createAccount
                     * @description create user account by passing user information
                     * @param userId, NewPassword, confirmPassword, displayName, QusetionAnswers AND NotificationSetting
                    */
                    $scope.createAccount = function(userData){
                        setTimeout(function () { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);
                        var errorFlag = 0, notificationData, questionData = [];
                        $scope.createAccountError = '';    
                        if(userData.password.length < 6){
                            $('#password').addClass('has-error').focus();
                            $scope.createAccountError = "PasswordLength6Digit";
                            return false;
                        }else{
                            $('#password').removeClass('has-error');
                        }
                        
                        if (userData.password !== userData.confirmPassword) {
                            $scope.createAccountError = "YourNewAndConFirmPasswordDoNotMatch";
                            $("#confirmPassword").addClass('has-error').focus();
                            return false;
                        }else{
                            $("#confirmPassword").removeClass('has-error');
                        };              

                        $scope.createAccountProgress = 'Processing';
                        $scope.createAccountSuccess = '';
                        $scope.forgotpasswordError = '';

        
                        if ((userData.q1.ID === userData.q2.ID) ||
                            (userData.q3.ID === userData.q2.ID) ||
                            (userData.q3.ID === userData.q1.ID) ||
                            (userData.q3.ID === userData.q2.ID === userData.q1.ID)) {
                            errorFlag = 1;
                        }
        
                        if (errorFlag === 0) {
                            userData.q1.Answer = userData.a1;
                            userData.q2.Answer = userData.a2;
                            userData.q3.Answer = userData.a3;
                            userData.q1.Question = $translate.instant(userData.q1.Question);
                            userData.q2.Question = $translate.instant(userData.q2.Question);
                            userData.q3.Question = $translate.instant(userData.q3.Question);
                            questionData.push(userData.q1);
                            questionData.push(userData.q2);
                            questionData.push(userData.q3);

                            var isChecked = (userData.WillOptInForSurveys) ? true : false;
                            notificationData = [{Type : 'WillOptInForSurveys', IsChecked : isChecked}];
                            var userJson = {
                                UserId: $routeParams.userId, NewPassword: userData.password, ConfirmPassword: userData.confirmPassword, DisplayName: userData.displayName,
                                QusetionAnswers: questionData,
                                NotificationSetting: notificationData,
                                Code : $routeParams.code
                            };
                            serviceData.send('AccountApi/createAccount', userJson).then(function(response){
                                if(!response.Error && response.Status === 200)
                                {
                                    $scope.createAccountProgress = '';
                                    $scope.createAccountSuccess = response.data.Message;
                                    $timeout(function() {$location.path("/login");return false; }, 3000);
                                } else{
                                    $scope.createAccountProgress = '';
                                    $scope.createAccountError = response.Error.Message;
                                    $timeout(function() { $scope.createAccountError = ''; }, 3000);
                                }
                            },function(error){
                                $scope.createAccountProgress = '';
                                $scope.createAccountError = 'AnErrorOccurred';
                                $timeout(function() { $scope.createAccountError = ''; }, 3000);
                                $location.path("/");
                                return false;
                            });
                        }else{
                            if(errorFlag === 1){
                                $scope.createAccountError = 'PleaseSelectDifferentQuestion';
                            }else if(errorFlag === 2){
                                $scope.createAccountError = 'SelectSamePassword';
                            }
                            $scope.createAccountProgress = '';
                            $timeout(function() { $scope.createAccountError = ''; }, 3000);
                        }
                    };

                    
                    $scope.showImage = function(content) {
                        $('#previewImage').attr('src', content);
                    }
                    
                    $scope.checkNameAvailablity = function(displayName){
                        if(displayName){
                            var checkNumericValue = displayName.match(/^[a-zA-Z]+$/);
                            var checkSpecialChar = displayName.match(/[^\w\s]/gi);
                            var checkSpace = displayName.match('[ trn]');
                            if((checkSpace && checkSpace[0]==='') || (checkSpecialChar!==null) || (checkNumericValue===null)){
                                $scope.displayNameVal = "DisplayNameShouldBeOneWordOnly"
                            }else{
                                $scope.displayNameVal = '';
                            }
                        }
                        /*serviceData.send('checkDisplayName',{name : displayName}).then(function(res){
                            consol.log(res);
                        });
                        */
                    }

                    $scope.checkInputValue = function(value, id, type){
                        if(value){
                            //var checkNumericValue = value.match(/^[a-zA-Z]+$/);
                            var checkSpecialChar = value.match(/[^\w\s]/gi);
                            if((checkSpecialChar!==null)){
                                $('#'+id).addClass('has-error1');
                                if(type == 'password'){
                                    $scope.createAccountError = 'ValidInputErrorMessage';
                                }else if(type == 'answer'){
                                    $scope.createAccountError = 'ValidInputErrorMessage';
                                }   
                            }else{
                                $('#'+id).removeClass('has-error1');
                                if($('.has-error1').length == 0){
                                    $scope.createAccountError = '';
                                }                       
                            }
                        }
                    }
                }else{
                        serviceGlobal.isTokenError = {
                            isError : true,
                            msg : response.Error.Message
                        }
                        $location.path('/tokenError');
                        return false;
                    }
                });

            
            }else{
              $location.path("/"); 
              return false;
            }
        }else{
           $location.path("/");
           return false;
        }
        
    }])
    
    /**
    * @ngdoc
    * @name npl.Controller:profileController
    * @url '/profile'
    * @template profile.html
    * @description
    * edit user information
    */
    .controller('profileController', ['$rootScope', '$scope', '$location', '$timeout', '$cookies', '$translate', 'serviceData', 'serviceAuth', 'serviceExamQuestion', function ($rootScope, $scope, $location, $timeout, $cookies, $translate, serviceData, serviceAuth, serviceExamQuestion) {
        var currentLanguage = $translate.use();
        
        if (serviceAuth.isAuthenticated()) {
            $scope.securityQuestionData = {};
            $scope.userData = {};
            $scope.questions = [];
            /**
             * @ngdoc
             * @name sdi.controller.function:#GetUserInformation
             * @description get User information 
            */
            $scope.updateQuestionProgress = 'inProgress';
            var securityQuestionObj = serviceExamQuestion.securityQuestions;
            serviceData.get('AccountApi/GetNotification', {}).then(function(response){
                if(response.Status == 200){
                  $scope.notificationText = response.data.Notification;
                }
            });
            $scope.GetUserInformation = function(){
                serviceData.get('AccountApi/GetUserInformation').then(function (response) {
                        if(!response.Error && response.Status === 200){
                            $scope.updateQuestionProgress = '';
                            angular.forEach(response.data.QusetionAnswers, function(qValue, qKey){
                                
                                if($.inArray(qValue.Question, securityQuestionObj.securityQues_en) != -1){
                                    var questionIndex =  $.inArray(qValue.Question, securityQuestionObj.securityQues_en);
                                }else if ($.inArray(qValue.Question, securityQuestionObj.securityQues_es) != -1) {
                                    var questionIndex =  $.inArray(qValue.Question, securityQuestionObj.securityQues_es);
                                }
                                response.data.QusetionAnswers[qKey].Question = $translate.instant(securityQuestionObj.securityQues[questionIndex]);
                                response.data.QusetionAnswers[qKey].QuestionKey = securityQuestionObj.securityQues[questionIndex];
                            });
                            $scope.userData = response.data;
                            $cookies.userData = JSON.stringify(response.data);
                            if(response.data.NotificationSetting[0].IsChecked){
                                $scope.userData.WillOptInForSurveys = response.data.NotificationSetting[0].IsChecked;
                            }
                            getAllSecurityQestions();
                        }else{
                            $scope.updateQuestionProgress = '';
                            $location.path('/');
                            return false;
                        }
                    }, function (error) {     
                        $scope.updateQuestionProgress = ''; 
                });
            }

            $scope.GetUserInformation();
            
            $scope.isButtonVisible = false;
            $scope.isSaveBtnVisible = function(userInfo, id){
                $('#'+id).removeClass('has-error');
                var userActualInfo = ($cookies.userData) ? JSON.parse($cookies.userData) : '';
                var isChange = false;
                if (userInfo.OldPassword || userInfo.NewPassword  || userInfo.ConfirmPassword){
                    if(userInfo.OldPassword && userInfo.NewPassword && userInfo.ConfirmPassword ){
                        if(userInfo.NewPassword && userInfo.ConfirmPassword){
                           isChange = true;
                        }else{
                           isChange = false;
                        }
                    }else{
                        isChange = false;
                    }
                }
                if((($("#WillOptInForSurveys").is(':checked') != userActualInfo.NotificationSetting[0].IsChecked) || (userInfo.DisplayName != userActualInfo.DisplayName)) || isChange){
                    $scope.isButtonVisible = true;
                }else{
                    $scope.isButtonVisible = false;
                }
            }
            $scope.isAnswerChanged = false;
            var getAllSecurityQestions = function(){
                var questionsData = [], answer = [], id = [], i = 0, j = 0;

                
                /*serviceData.get('Accountapi/GetSecurityQuestions').then(function(response){
                    if(!response.Error && response.Status === 200){
                        angular.forEach($scope.userData.QusetionAnswers, function(qValue, qKey){
                                questionsData.push(qValue.Question);
                                answer.push(qValue.Answer);
                                id.push(qValue.ID);
                        });
                        $scope.securityQuestionData = {};
                        angular.forEach(response.data, function(value, key){
                            if(questionsData.indexOf(value) != -1){
                                if(questionsData[0]===value){
                                    $scope.securityQuestionData.q1 = {"ID":key,"Question":questionsData[0],"CustomQustion":false};
                                    $scope.securityQuestionData.a1 = answer[0];
                                    $scope.securityQuestionData.a1id = id[0];
                                }
                                if(questionsData[1]===value){
                                    $scope.securityQuestionData.q2 = {"ID":key,"Question":questionsData[1],"CustomQustion":false};
                                    $scope.securityQuestionData.a2 = answer[1];
                                    $scope.securityQuestionData.a2id = id[1];
                                }
                                if(questionsData[2]===value){
                                    $scope.securityQuestionData.q3 = {"ID":key,"Question":questionsData[2],"CustomQustion":false};
                                    $scope.securityQuestionData.a3 = answer[2];
                                    $scope.securityQuestionData.a3id = id[2];
                                }
                                j++;
                            }
                            $scope.questions.push({ID : key, Question : value, CustomQustion : false});
                            i++;
                        });
                    }
                },function(error){
                    console.log(error);
                });
                */
                
                angular.forEach($scope.userData.QusetionAnswers, function(qValue, qKey){
                        questionsData.push(qValue.QuestionKey);
                        answer.push(qValue.Answer);
                        id.push(qValue.ID);
                });
                
                angular.forEach(securityQuestionObj.securityQues, function(questionCode, key){
                    var value = $translate.instant(questionCode);
                    
                    if(questionsData.indexOf(questionCode) != -1){
                        
                        if(questionsData[0] === questionCode){
                            if (!$scope.isAnswerChanged) {
                                $scope.securityQuestionData.q1 = {"ID":key,"Question":value,"CustomQustion":false};
                                $scope.securityQuestionData.a1 = answer[0];
                                $scope.securityQuestionData.a1id = id[0];
                            }
                        }
                        if(questionsData[1] === questionCode){
                            if (!$scope.isAnswerChanged) {
                                $scope.securityQuestionData.q2 = {"ID":key,"Question":value,"CustomQustion":false};
                                $scope.securityQuestionData.a2 = answer[1];
                                $scope.securityQuestionData.a2id = id[1];
                            }
                        }
                        if(questionsData[2] === questionCode){
                            if (!$scope.isAnswerChanged) {
                                $scope.securityQuestionData.q3 = {"ID":key,"Question":value,"CustomQustion":false};
                                $scope.securityQuestionData.a3 = answer[2];
                                $scope.securityQuestionData.a3id = id[2];
                            }
                        }
                        j++;
                    }
                    $scope.questions.push({ID : key, Question : value, CustomQustion : false});
                    
                    i++;
                });
            }                
            //$timeout(function(){ getAllSecurityQestions();}, 2000);

            $scope.isVisible = false;
            $scope.makeVisibleUpdateQuestionButton = function(actionFor){
                var value = $scope.securityQuestionData;
                if(value){
                        if(actionFor === 'q1' && value.q1){
                            if(value.q1.Question != $scope.userData.QusetionAnswers[0].Question){
                                $scope.securityQuestionData.a1 = ''; 
                            }else{
                                $scope.securityQuestionData.a1 = $scope.userData.QusetionAnswers[0].Answer; 
                            }
                        }
                        if(actionFor === 'q2' && value.q2){
                            if(value.q2.Question != $scope.userData.QusetionAnswers[1].Question)
                            {
                                $scope.securityQuestionData.a2 = ''; 
                            }else{
                                $scope.securityQuestionData.a2 = $scope.userData.QusetionAnswers[1].Answer; 
                            }
                        }

                        if(actionFor === 'q3' && value.q3){
                            if(value.q3.Question != $scope.userData.QusetionAnswers[2].Question)
                            {
                                $scope.securityQuestionData.a3 = ''; 
                            }else{
                                $scope.securityQuestionData.a3 = $scope.userData.QusetionAnswers[2].Answer; 
                            }
                        }

                        if ((value.q1 && (value.q1.Question !== $scope.userData.QusetionAnswers[0].Question)) ||
                            (value.q2 && (value.q2.Question !== $scope.userData.QusetionAnswers[1].Question)) ||
                            (value.q3 && (value.q3.Question !== $scope.userData.QusetionAnswers[2].Question)) ||
                            (value.a1 !== $scope.userData.QusetionAnswers[0].Answer) ||
                            (value.a2 !== $scope.userData.QusetionAnswers[1].Answer) ||
                            (value.a3 !== $scope.userData.QusetionAnswers[2].Answer)) {
                            $scope.isVisible = true;
                            $scope.isAnswerChanged = true;
                        }
                        else {
                            $scope.isVisible=false;
                            $scope.isAnswerChanged = false;
                        }
                }
            }

            $scope.checkInputValue = function(value, id, type){
                if(value){
                    $scope.makeVisibleUpdateQuestionButton(id);
                    //var checkNumericValue = value.match(/^[a-zA-Z]+$/);
                    var checkSpecialChar = value.match(/[^\w\s]/gi);
                    if((checkSpecialChar!==null)){
                        $('#'+id).addClass('has-error');
                        if(type == 'password'){
                            $scope.updateProfileError = 'ValidInputErrorMessage';
                        }else if(type == 'answer'){
                            $scope.updateQuestionError = 'ValidInputErrorMessage';
                        }   
                    }else{
                        $('#'+id).removeClass('has-error');
                        if($('.has-error').length == 0){
                            $scope.updateProfileError = '';
                            $scope.updateQuestionError = '';
                        }                       
                    }
                }
                
            }


            /**
             * @ngdoc
             * @name sdi.controller.function:#resetSecurityQuestionsModel
             * @description open model reset security questions
            */
            $scope.resetSecurityQuestionsModel = function(){
                $scope.questions = [];
                //$scope.isVisible = false;
                getAllSecurityQestions();
                $('#resetSecurityQuestionModel').click();
            }


            /**
             * @ngdoc
             * @name sdi.controller.function:#closeSecurityQuestionModel
             * @description is user made any changes then it asking for close the model
            */
            $scope.closeSecurityQuestionModel = function(){
                
                if($scope.isVisible){
                    $('.reveal-model-bg-inner, .reveal-model-inner').show();
                }else{
                    $('#resetQuestion').trigger('reveal:close');
                    
                }            
            }


            /**
             * @ngdoc
             * @name sdi.controller.function:#confirmAction
             * @description on security question model close actions
             * @param {string}(Yes or No)
            */
            $scope.confirmAction = function(action){
                $('.reveal-model-bg-inner, .reveal-model-inner').hide();
                if(action == 'Yes'){
                    var securityQuestionData = $scope.securityQuestionData;
                    if ((securityQuestionData.q1.ID === securityQuestionData.q2.ID) ||
                        (securityQuestionData.q3.ID === securityQuestionData.q2.ID) ||
                        (securityQuestionData.q3.ID === securityQuestionData.q1.ID) ||
                        (securityQuestionData.q3.ID === securityQuestionData.q2.ID === securityQuestionData.q1.ID)) {
                            $scope.updateQuestionProgress = '';
                            $scope.updateQuestionError = 'PleaseSelectDifferentQuestion';;
                            $timeout(function() { $scope.updateQuestionError = ''; }, 3000);
                            return false;
                    }
                    //$scope.questions = [];
                    //getAllSecurityQestions();
                    currentLanguage = $translate.use();
                    $scope.isVisible = true;
                    $('#resetQuestion').trigger('reveal:close');
                }else if(action == 'Reset'){
                    $scope.questions = [];
                    $scope.isAnswerChanged = false;
                    getAllSecurityQestions();
                    $scope.isVisible = false;
                    $('#resetQuestion').trigger('reveal:close');
                }else{
                    $scope.isVisible = false;
                }
            }


            /**
             * @ngdoc
             * @name sdi.controller.function:#updateSecurityQuestion
             * @description update sequrity questions
             * @param q1, q2, q3, a1, a2 AND a3
            */
            $scope.updateSecurityQuestion = function(securityQuestionData){
                getAllSecurityQestions();
                $scope.updateQuestionProgress = 'inProgress';
                $scope.successUpdateQuestion = '';
                $scope.updateQuestionError = '';
                $scope.isVisible = false;
                var errorFlag = 0;
                if ((securityQuestionData.q1.ID === securityQuestionData.q2.ID) ||
                    (securityQuestionData.q3.ID === securityQuestionData.q2.ID) ||
                    (securityQuestionData.q3.ID === securityQuestionData.q1.ID) ||
                    (securityQuestionData.q3.ID === securityQuestionData.q2.ID === securityQuestionData.q1.ID)) {
                        errorFlag = 1;
                }
                if(errorFlag === 0){
                    var questionDataJson = {
                        EditSequrityQuestions: [{ ID: securityQuestionData.a1id, Question: securityQuestionData.q1.Question, Answer: securityQuestionData.a1 },
                                                { ID: securityQuestionData.a2id, Question: securityQuestionData.q2.Question, Answer: securityQuestionData.a2 },
                                                { ID: securityQuestionData.a3id, Question: securityQuestionData.q3.Question, Answer: securityQuestionData.a3 }]
                    }
                    
                    serviceData.send('AccountApi/EditSecurityQuestions', questionDataJson).then(function (response) {

                            if(!response.Error && response.Status === 200){
                                $scope.isAnswerChanged = false;
                                
                                serviceData.get('AccountApi/GetUserInformation').then(function (response) {
                                        if(!response.Error && response.Status === 200){
                                             angular.forEach(response.data.QusetionAnswers, function(qValue, qKey){
                                            
                                                if($.inArray(qValue.Question, securityQuestionObj.securityQues_en) != -1){
                                                    var questionIndex =  $.inArray(qValue.Question, securityQuestionObj.securityQues_en);
                                                }else if ($.inArray(qValue.Question, securityQuestionObj.securityQues_es) != -1) {
                                                    var questionIndex =  $.inArray(qValue.Question, securityQuestionObj.securityQues_es);
                                                }
                                                response.data.QusetionAnswers[qKey].Question = $translate.instant(securityQuestionObj.securityQues[questionIndex]);
                                                response.data.QusetionAnswers[qKey].QuestionKey = securityQuestionObj.securityQues[questionIndex];
                                            });
                                             
                                            $scope.userData.QusetionAnswers = response.data.QusetionAnswers;
                                        }
                                    }, function (error) {     
                                        $scope.updateQuestionProgress = ''; 
                                });
                                


                                $scope.updateQuestionProgress = '';
                                $scope.successUpdateQuestion = (response.data.Message) ? response.data.Message : 'SAVE_SUCCESSFULLY';
                                $timeout(function() {
                                    //$("#resetQuestion").trigger('reveal:close');
                                    $scope.successUpdateQuestion = '';}, 3000);
                            }else{
                                $scope.updateQuestionProgress = '';
                                $scope.updateQuestionError = response.Error.Message;
                                $timeout(function() { $scope.updateQuestionError = ''; }, 3000);
                            }
                        }, function (error) {
                                $scope.updateQuestionProgress = '';
                                $scope.updateQuestionError = 'AnErrorOccurred';;
                                $timeout(function() { $scope.updateQuestionError = ''; }, 3000);       
                        });
                }else{
                            $scope.updateQuestionProgress = '';
                            $scope.updateQuestionError = 'PleaseSelectDifferentQuestion';;
                            $timeout(function() { $scope.updateQuestionError = ''; }, 3000);       
                }

            }
    
            /**
             * @ngdoc
             * @name sdi.controller.function:#updateAccount
             * @description update user account information
             * @param displayName, NotificationSetting, OldPassword, NewPassword AND ConfirmPassword 
            */
            $scope.updateAccount = function(userData){
                if (currentLanguage != $translate.use() && $scope.isVisible) {
                    $('#cultureChangeModel').click();
                    return;
                }
                
                setTimeout(function () { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);
                $scope.updateProfileProgress = 'inProgress';
                $scope.successUpdateProfile = '';
                $scope.updateProfileError = '';
                var error = 0;
                if (!$scope.updateProfileProgress || !$scope.displayNameVal || $scope.isButtonVisible || !$scope.updateProfileError) {
                
                    
                    if(userData.OldPassword && userData.OldPassword.length<6){$('#OldPassword').addClass('has-error').focus();$scope.updateProfileError = 'PasswordLength6Digit';$scope.updateProfileProgress = '';$timeout(function() { $scope.updateProfileError = ''; }, 3000);   return false}else{$('#OldPassword').removeClass('has-error');error = 0;}
                    if(userData.NewPassword && userData.NewPassword.length<6){$('#NewPassword').addClass('has-error').focus();$scope.updateProfileError = 'PasswordLength6Digit'; $scope.updateProfileProgress = '';$timeout(function() { $scope.updateProfileError = ''; }, 3000);    return false}else{$('#NewPassword').removeClass('has-error');error = 0;}
                    if($('.has-error').length > 0){
                        $scope.updateProfileError = 'AnErrorOccurred';
                        $timeout(function() { $scope.updateProfileError = ''; $scope.isButtonVisible = true;}, 3000);
                        return false;
                    }
                    if ( userData.OldPassword || userData.NewPassword  || userData.ConfirmPassword){
                        if(userData.OldPassword && userData.NewPassword && userData.ConfirmPassword ){
                            if(userData.NewPassword == userData.ConfirmPassword){
                               error = 0;
                            }else{
                               error = 2;
                            }
                        }else{
                            error = 1;
                        }
                    }else {
                        delete userData.OldPassword;
                        delete userData.NewPassword;
                        delete userData.ConfirmPassword;
                    }
                    
                    var isChecked = (userData.WillOptInForSurveys) ? true : false; 
                    var notificationSetting = [{Type : 'WillOptInForSurveys', IsChecked : isChecked}];
                    var userDataJson = {DisplayName : userData.DisplayName, OldPassword : userData.OldPassword, NewPassword : userData.NewPassword, ConfirmPassword : userData.ConfirmPassword, NotificationSetting : notificationSetting};
                    if(!error){
                        serviceData.send('AccountApi/EditAccount', userDataJson).then(function (response) {
                            if(!response.Error && response.Status === 200){
                                var sessionData = serviceAuth.getSession();
                                $cookies.userData = JSON.stringify(userDataJson);
                                sessionData.Name = userData.DisplayName;
                                $cookies.session = JSON.stringify(sessionData);
                                $rootScope.userName = userData.DisplayName;
                                $scope.updateProfileProgress = '';
                                $scope.successUpdateProfile = response.data.Message;
                                $scope.isButtonVisible = false;
                                if($scope.isVisible && !error){
                                     $scope.updateSecurityQuestion($scope.securityQuestionData);
                                }
                                $timeout(function() { $scope.successUpdateProfile = ''; }, 3000);
                            }else{
                                $scope.updateProfileProgress = '';
                                $scope.updateProfileError = response.Error.Message;
                                $timeout(function() { $scope.updateProfileError = ''; $scope.isButtonVisible = true;}, 3000);
                            }
                        }, function (error) {
                                $scope.updateProfileProgress = '';
                                $scope.updateProfileError = 'AnErrorOccurred';;
                                $timeout(function() { $scope.updateProfileError = '';  $scope.isButtonVisible = true;}, 3000);       
                        });
                    }
                    else {
                        $scope.updateProfileProgress = '';
                        if(error === 2){
                            $scope.updateProfileError = 'PasswordDoNotMatch';
                        }else if(error === 1){
                            $scope.updateProfileError = 'YourPasswordFieldEmpty';
                        }
                        $timeout(function() { $scope.updateProfileError = ''; }, 3000);   
                    }
                }
            }

            $scope.showImage = function(content) {
                $('#previewImage').attr('src', content);
            }
        }else{
            $location.path('/');
            return false;
        }


        $scope.checkNameAvailablity = function(displayName){
            if(displayName){
                $scope.isSaveBtnVisible($scope.userData, 'DisplayName');
                var checkNumericValue = displayName.match(/^[a-zA-Z]+$/);
                var checkSpecialChar = displayName.match(/[^\w\s]/gi);
                var checkSpace = displayName.match('[ trn]');
                if((checkSpace && checkSpace[0]==='') || (checkSpecialChar!==null) || (checkNumericValue===null)){
                    $scope.displayNameVal = "DisplayNameShouldBeOneWordOnly"
                    $('#displayName').focus();
                }else{
                    $scope.displayNameVal = '';
                }
            }

            /*serviceData.send('checkDisplayName',{name : displayName}).then(function(res){
                consol.log(res);
            });
            */
        }
        
        
        


    }]); 