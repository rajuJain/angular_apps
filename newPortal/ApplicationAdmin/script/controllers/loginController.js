'use strict';

/* Login Controller Logic*/

angular.module('patientPortalWorkList')

    /**
    * @ngdoc
    * @name PatientPortal.Controller:loginController
    * @url '/login'
    * @template login.html
    * @description
    * Provides access to application after checking validity of credentials.
    */

    .controller('loginController', ['$rootScope', '$scope', '$location', '$route', '$cookies', '$timeout', 'serviceData', 'serviceAuth', 'serviceGlobal', function ($rootScope, $scope, $location, $route, $cookies, $timeout, serviceData, serviceAuth, serviceGlobal) {
        $scope.credentials = {};

        if (!serviceAuth.isAuthenticated()) {
            if ($cookies.lastUserName) {
                $scope.credentials.username = JSON.parse($cookies.lastUserName);
                $scope.credentials.password = JSON.parse($cookies.lastPassword);
                $scope.credentials.remember = true;
            }
            $rootScope.isAdmin = '';

            var timer = setTimeout(function () { }, 10000);

            /**
             * @ngdoc
             * @name sdi.controller.function:#login
             * @description check valid credencial
             * @param username, password
            */
            $scope.login = function (credentials) {
                if (timer) { clearTimeout(timer); }
                $scope.global_progress = 'Please wait...';
                $scope.loginMessage = "";
                $scope.loginErrorMessage = '';
                if (credentials.username && credentials.password) {
                    serviceAuth.login(credentials.username, credentials.password, credentials.remember).then(function (response) {
                        
                        if (!response.error_code && response.response_code == 200) {
                            $scope.global_progress = '';
                            if (credentials.remember) {
                                $cookies.lastUserName = JSON.stringify(credentials.username);
                                $cookies.lastPassword = JSON.stringify(credentials.password);
                            } else {
                                delete $cookies.lastUserName;
                                delete $cookies.lastPassword;
                            }
                            $rootScope.isAdmin = response.Type;
                            $location.path("/");
                        } else {
                            $scope.global_progress = '';
                            $scope.loginErrorMessage = response.error_text;
                            timer = setTimeout(function () { $scope.loginErrorMessage = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 10000);
                        }
                    }, function (err) {
                        $scope.global_progress = '';
                        if (err.error_text) {
                            $scope.loginErrorMessage = err.error_text;
                        } else {
                            $scope.loginErrorMessage = 'An error occured. Please try again !';
                        }
                        timer = setTimeout(function () { $scope.loginErrorMessage = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 10000);
                    });

                } else {
                    $scope.global_progress = '';
                    if (credentials.username && credentials.password) {
                        $scope.loginErrorMessage = "Please enter username & password";
                    } else if (!credentials.username) {
                        $scope.loginErrorMessage = 'Username Required';
                    } else if (!credentials.password) {
                        $scope.loginErrorMessage = 'Password Required';
                    }
                    timer = setTimeout(function () { $scope.loginErrorMessage = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 10000);
                }
            };
        } else {
            $location.path("/");
        }
    }])

    /**
    * @ngdoc
    * @name npl.Controller:logoutController
    * @url '/logout'
    * @template login.html
    * @description
    * Destroy user session
    */
    .controller('logoutController', ['$scope', 'serviceAuth', '$location', 'serviceGlobal', function ($scope, serviceAuth, $location, serviceGlobal) {
        serviceAuth.logout();
        $location.path("/");
    }]);