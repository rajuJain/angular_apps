'use strict';

/* Signup Controller Logic*/

angular.module('AngularDemo')

     /**
    * @ngdoc
    * @name AngularDemo.Controller:homeController
    * @url '/'
    * @template home.html
    * @description
    * display user home page
    */
    .controller('loginController', ['$scope', '$location', '$cookies', 'serviceAuth', function ($scope, $location, $cookies, serviceAuth) {
        $scope.credentials = {};
        
        if (!serviceAuth.isAuthenticated()) {
                if ($cookies.lastUserName)
                {
                    $scope.credentials.username = JSON.parse($cookies.lastUserName);
                    $scope.credentials.password = JSON.parse($cookies.lastPassword);
                    $scope.credentials.remember = true;
                }

                /**
                 * @ngdoc
                 * @name AngularDemo.controller.function:#login
                 * @description check valid credencial
                 * @param username, password
                */
                $scope.login = function (credentials) {
                    setTimeout(function () { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);
                    $scope.global_progress = 'inProgress';
                    $scope.loginMessage = "";
                    $scope.loginErrorMessage = '';
                    
                    if (credentials.username && credentials.password) {
                        var dataJSON = {email: credentials.username, password: credentials.password};
                     
                        serviceAuth.login(dataJSON).then(function (response) {
                            if (response.response_code == 200 && !response.error_code) {
                                $scope.global_progress = '';
                                if (credentials.remember)
                                {
                                    $cookies.lastUserName = JSON.stringify(credentials.username);
                                    $cookies.lastPassword = JSON.stringify(credentials.password);
                                } else {
                                    delete $cookies.lastUserName;
                                    delete $cookies.lastPassword;
                                }
                                $location.path('/');
                                return false;
                            }else{
                                if (response.error_code && response.error_text) {
                                    $scope.loginErrorMessage = response.error_text;
                                }
                                $scope.global_progress = '';
                             }                        
                        }, function (err) {
                            $scope.global_progress =  '';
                                $scope.loginErrorMessage = "Connected but received a server error in response: " + err.status;
                           
                        });
                        
                    } else {
                        $scope.global_progress = '';
                        if (credentials.username && credentials.password) {
                            $scope.loginErrorMessage = "Please enter username and password!";
                        }else if (!credentials.username) {
                            $scope.loginErrorMessage = 'Please enter username!';
                        }else if (!credentials.password) {
                            $scope.loginErrorMessage = 'Please enter password!';    
                        }
                    }
                }
        }else{
            $location.path("/");
            return false;
        }
        
        
    }]);


