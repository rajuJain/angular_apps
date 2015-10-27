'use strict';

/* Forgot Password Controller Logic*/

angular.module('sdi')


    /**
    * @ngdoc
    * @name sdi.Controller:forgotPasswordController
    * @url '/forgotPassword'
    * @template forgot_password.html
    * @description
    * Provide user password by paasing email id
    */
    .controller('forgotPasswordController', ['$scope', 'serviceData', '$timeout', '$location', 'serviceAuth', function ($scope, serviceData, $timeout, $location, serviceAuth) {
        if (!serviceAuth.isAuthenticated()) {
    
            $scope.forgotPassword = function (email) {
                setTimeout(function () { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);
                $scope.successMsg = '';
                $scope.forgotpasswordError = '';
                
                var pattern =/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                if(pattern.test(email)){
                    $scope.successMsg = '';
                    $scope.forgotpasswordError = '';
                    $scope.global_process = 'inProgress';
                        var patientDataJSON  = {Email : email};
                        serviceData.send('AccountApi/ForgotPassword', patientDataJSON).then(function (response) {
                            if(!response.Error && response.Status === 200){
                                $scope.successMsg = response.data.Message;
                                $scope.global_process = '';
                            }else{
                                $scope.forgotpasswordError = response.Error.Message;
                                $scope.global_process = '';
                                $timeout(function() { $scope.forgotpasswordError = ''; }, 10000);
                            }                    
                        }, function (error) {
                            $scope.global_process = '';
                            $scope.forgotpasswordError = 'AnErrorOccurred';
                            $timeout(function() { $scope.forgotpasswordError = ''; }, 10000);
                        });
                        $("#email").removeClass('has-error');
                }else{
                    $scope.forgotpasswordError = 'INVALID_EMAIL';
                    $timeout(function() { $scope.forgotpasswordError = ''; }, 10000);
                    $scope.global_process = '';
                    $("#email").addClass('has-error');
                }
            }
        }else{
            $location.path("/");
            return false;
        }
    }])
    
    
    /**
    * @ngdoc
    * @name npl.Controller:ForgotPasswordConfirmationController
    * @url '/ForgotPasswordConfirmation'
    * @param userId(string), code(string)
    * @template forgot_password_confirmation.html
    * @description
    * Provide input box to enter new password
    */
    .controller('forgotPasswordConfirmationController', ['$scope', '$location', '$timeout', '$routeParams', '$translate', 'serviceGlobal', 'serviceData', 'serviceAuth', 'serviceExamQuestion', function ($scope, $location, $timeout, $routeParams, $translate, serviceGlobal, serviceData, serviceAuth, serviceExamQuestion) {
        if($routeParams.userId && $routeParams.code && $routeParams.culture){
            $scope.culture = $routeParams.culture;
            var securityQuestionObj = serviceExamQuestion.securityQuestions;
        if (!serviceAuth.isAuthenticated()) {
            var dataJson = {Code : $routeParams.code, UserId  : $routeParams.userId, Type : 'ResetPassword'};
            serviceData.send('AccountApi/IsTokenValid', dataJson).then(function (response) {
                if(!response.Error && response.Status === 200 && response.data.IsTokenValid){
                     serviceGlobal.isTokenError = {
                        isError : false,
                        msg : ''
                    }
                    serviceData.get('AccountApi/GetUserQuestions', {UserId : $routeParams.userId}).then(function (response) {
                            $scope.userQuestions = [];
                            if(!response.Error && response.Status === 200){
                                angular.forEach(response.data, function(qValue, qKey){
                                    console.log(qValue, qKey);
                                    
                                    if($.inArray(qValue, securityQuestionObj.securityQues_en) != -1){
                                        var questionIndex =  $.inArray(qValue, securityQuestionObj.securityQues_en);
                                    }else if ($.inArray(qValue, securityQuestionObj.securityQues_es) != -1) {
                                        var questionIndex =  $.inArray(qValue, securityQuestionObj.securityQues_es);
                                    }
                                    var Question = $translate.instant(securityQuestionObj.securityQues[questionIndex]);
                                    var QuestionKey = securityQuestionObj.securityQues[questionIndex];
                                    $scope.userQuestions.push({Question : Question, Key : QuestionKey, QuestionIndex : questionIndex});
                                });
                                
                                //angular.forEach(response.data, function(value, key){
                                //    $scope.userQuestions.push({Question : key, Answer : value});
                                //});
                            }
                    });

                   /**
                    * @ngdoc
                    * @name sdi.controller.function:#saveForgotPasswordConfirm
                    * @description save new password
                    * @param UserId, Password, ConfirmPassword, Code, Question AND Answer
                   */
                    $scope.saveForgotPasswordConfirm = function (userData) {
                        setTimeout(function () { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);
                          $scope.forgotpasswordConfirmError = '';
                          $scope.forgotpasswordConfirmSuccess = '';
                          $scope.global_process = 'Processing';
                          $('#cfNewPassword').removeClass('has-error');
                          $('#newPassword').removeClass('has-error');
                          if(userData.password && userData.password.length < 6){
                            $scope.global_process = '';
                            $('#newPassword').addClass('has-error').focus();
                            $scope.forgotpasswordConfirmError = "PasswordLength6Digit";
                            return false;
                          }
                        if(userData  && userData.password != userData.cfPassword){
                            $('#cfNewPassword').addClass('has-error').focus();
                            $scope.forgotpasswordConfirmError = "BothPasswordShouldSame";
                            $scope.global_process = '';
                            $timeout(function() { $scope.forgotpasswordConfirmError = ''; }, 3000);
                            return false;
                        }else{
                            var spanishQuestion = securityQuestionObj.securityQues_es[userData.question.QuestionIndex];
                            var englishQuestion = securityQuestionObj.securityQues_en[userData.question.QuestionIndex];
                            
                            
                            
                            var jsonData = {UserId : $routeParams.userId, Password: userData.password , ConfirmPassword : userData.cfPassword, Code : $routeParams.code, Question: englishQuestion, QuestionSpanish : spanishQuestion,  Answer :userData.answer };
                            serviceData.send('AccountApi/ForgotPasswordConfirmation', jsonData).then(function (response) {
                                    if(!response.Error && response.Status === 200){
                                        $scope.forgotpasswordConfirmSuccess = response.data.Message; 
                                        $timeout(function() { $location.path('/login');return false; }, 3000);
                                        $scope.global_process = ''; 
                                    }else{
                                        $scope.global_process = '';
                                        $scope.forgotpasswordConfirmError = response.Error.Message;
                                        $timeout(function() { $scope.forgotpasswordConfirmError = ''; }, 3000);
                                    }
                                }, function (error) {
                                    $scope.global_process = '';
                                    $scope.forgotpasswordConfirmError = 'AnErrorOccurred';
                                    $timeout(function() { $scope.forgotpasswordConfirmError = ''; }, 3000);
                            });
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
                $location.path('/');
                return false;
            }
        }else{
            $location.path('/');
            return false;
        }
    }]);