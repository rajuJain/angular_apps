'use strict';

/* Forgot Password Controller Logic*/

angular.module('patientPortalWorkList')

    /**
    * @ngdoc
    * @name PatientPortal.Controller:forgotPasswordController
    * @url '/forgotPassword'
    * @template forgot_password.html
    * @description
    * Provide user password by paasing email id
    */
    .controller('forgotPasswordController', ['$scope', 'serviceData', '$timeout', '$location', 'serviceAuth', function ($scope, serviceData, $timeout, $location, serviceAuth) {
        if (!serviceAuth.isAuthenticated()) {

            $scope.forgotPassword = function (email) {
                $scope.successMsg = '';
                $scope.forgotpasswordError = '';
                $scope.global_process = 'inProgress';
                if (email) {
                    var patientDataJSON = { Email: email };
                    serviceData.send('AccountApi/ForgotPassword', patientDataJSON).then(function (response) {
                        if (!response.Error && response.Status === 200) {
                            $scope.successMsg = response.data.Message;
                            $scope.global_process = '';
                        } else {
                            $scope.forgotpasswordError = response.Error.Message;
                            $scope.global_process = '';
                            $timeout(function () { $scope.forgotpasswordError = ''; }, 3000);
                        }
                    }, function (error) {
                        $scope.global_process = '';
                        $scope.forgotpasswordError = 'AnErrorOccurred';
                        $timeout(function () { $scope.forgotpasswordError = ''; }, 3000);
                    });
                    $("#email").removeClass('has-error');
                } else {
                    $scope.global_process = '';
                    $("#email").addClass('has-error');
                }
            }
        } else {
            $location.path("/");
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
    .controller('forgotPasswordConfirmationController', ['$scope', '$location', '$timeout', '$routeParams', 'serviceData', 'serviceAuth', function ($scope, $location, $timeout, $routeParams, serviceData, serviceAuth) {
        if ($routeParams.userId && $routeParams.code) {

            if (!serviceAuth.isAuthenticated()) {
                serviceData.get('AccountApi/GetUserQuestions', { UserId: $routeParams.userId }).then(function (response) {
                    $scope.userQuestions = [];
                    if (!response.Error && response.Status === 200) {
                        angular.forEach(response.data, function (value, key) {
                            $scope.userQuestions.push({ Question: key, Answer: value });
                        });
                    }
                });

                /**
                 * @ngdoc
                 * @name sdi.controller.function:#saveForgotPasswordConfirm
                 * @description save new password
                 * @param UserId, Password, ConfirmPassword, Code, Question AND Answer
                */
                $scope.saveForgotPasswordConfirm = function (userData) {
                    $scope.forgotpasswordConfirmError = '';
                    $scope.forgotpasswordConfirmSuccess = '';
                    $scope.global_process = 'inProgress';
                    if (userData && userData.password != userData.cfPassword) {
                        $scope.forgotpasswordConfirmError = "BothPasswordShouldSame";
                        $scope.global_process = '';
                        $timeout(function () { $scope.forgotpasswordConfirmError = ''; }, 3000);
                        return false;
                    } else {
                        var jsonData = { UserId: $routeParams.userId, Password: userData.password, ConfirmPassword: userData.cfPassword, Code: $routeParams.code, Question: userData.question.Question, Answer: userData.answer };
                        serviceData.send('AccountApi/ForgotPasswordConfirmation', jsonData).then(function (response) {
                            if (!response.Error && response.Status === 200) {
                                $scope.forgotpasswordConfirmSuccess = response.data.Message;
                                $timeout(function () { $location.path('/login'); }, 3000);
                                $scope.global_process = '';
                            } else {
                                $scope.global_process = '';
                                $scope.forgotpasswordConfirmError = response.Error.Message;
                                $timeout(function () { $scope.forgotpasswordConfirmError = ''; }, 3000);
                            }
                        }, function (error) {
                            $scope.global_process = '';
                            $scope.forgotpasswordConfirmError = 'AnErrorOccurred';
                            $timeout(function () { $scope.forgotpasswordConfirmError = ''; }, 3000);
                        });
                    }
                }
            } else {
                $location.path('/');
            }
        } else {
            $location.path('/');
        }
    }]);