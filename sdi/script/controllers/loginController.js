'use strict';

/* Login Controller Logic*/

angular.module('sdi')


    /**
    * @ngdoc
    * @name sdi.Controller:loginController
    * @url '/login'
    * @template login.html
    * @description
    * Provides access to application after checking validity of credentials.
    */
    
    .controller('loginController', ['$rootScope','$scope', '$location', '$route', '$cookies', '$timeout', 'serviceData', 'serviceAuth', 'serviceGlobal', function ($rootScope, $scope, $location, $route, $cookies, $timeout, serviceData, serviceAuth, serviceGlobal) {
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
             * @name sdi.controller.function:#login
             * @description check valid credencial
             * @param username, password
            */
            $scope.login = function (credentials) {
                setTimeout(function () { window.scrollTo(document.body.scrollLeft, document.body.scrollTop); }, 1);
                $scope.global_progress = 'inProgress';
                $scope.loginMessage = "";
                $scope.loginErrorMessage = '';
                
                if (credentials.username && credentials.password) {
                    
                    serviceAuth.login(credentials.username, credentials.password).then(function (response) {
                        if(!response.Error && response.Status === 200){
                            serviceGlobal.reset();
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
                            
                            /* Code commented becouse we are having data holding issue in some cases. Now it's replaced with  "$location.path('/');"*/
                            
                             /*if ($rootScope.referralUrl && $rootScope.referralUrl != '/login' && $rootScope.referralUrl != '/findInfo' && $rootScope.referralUrl != '/confirmEmail' && $rootScope.referralUrl != '/emailConfirmation'
                                 && $rootScope.referralUrl != '/forgotPassword' && $rootScope.referralUrl != '/forgotPasswordConfirmation' && $rootScope.referralUrl != '/logout' && $rootScope.referralUrl != '/tokenError'
                                  && $rootScope.referralUrl != '/notFound') {
                                $location.path($rootScope.referralUrl);
                            }else{
                                $location.path('/');
                            }*/
                            return false;
                        }else{
                            $scope.global_progress = '';
                            $scope.loginErrorMessage = response.Error.Message;                                
                        }                        
                    }, function (err) {
                        $scope.global_progress =  '';
                        if (err.data && !angular.isArray(err.data)) {
                            $scope.loginErrorMessage = err.data.Message;
                        } else {
                            $scope.loginErrorMessage = 'An error occured. Please try again !';
                        }
                    });
                    
                } else {
                    $scope.global_progress = '';
                   
                    if (credentials.username && credentials.password) {
                        $scope.loginErrorMessage = "PleaseEnterUsernamePassword";
                    }else if (!credentials.username) {
                        $scope.loginErrorMessage = 'UsernameRequired';
                    }else if (!credentials.password) {
                        $scope.loginErrorMessage = 'PasswordRequired';    
                    }
                }
            };
        } else {
            $location.path("/");
            return false;
        }
    }])
    
    /**
    * @ngdoc
    * @name sdi.Controller:logoutController
    * @url '/logout'
    * @template login.html
    * @description
    * Destroy user session
    */
    .controller('logoutController', ['$scope', 'serviceAuth', '$location', 'serviceGlobal', function ($scope, serviceAuth, $location, serviceGlobal) {
        serviceGlobal.exam.isExamCompleted = 0;
        serviceGlobal.home.userGender = '';
        serviceAuth.logout();
        $location.path("/");
        return false;
    }])
    
    
    
     /**
    * @ngdoc
    * @name sdi.Controller:logoutController
    * @url '/emailConfirmation'
    * @template emailConfirmation.html
    * @description
    * Verify Email
    */
    .controller('verifyController', ['$rootScope', '$scope', 'serviceAuth', '$location', '$routeParams', 'serviceGlobal', 'serviceData', function ($rootScope, $scope, serviceAuth, $location, $routeParams, serviceGlobal, serviceData) {
        $scope.culture = $routeParams.culture;
        $rootScope.setLanguage($scope.culture);
        $scope.isVerified = '';
        if (!serviceAuth.isAuthenticated()) {
            
            var dataJson = {Code : $routeParams.code, UserId  : $routeParams.userId, Type : 'Confirmation'};
            serviceData.send('AccountApi/IsTokenValid', dataJson).then(function (tokenResponse) {
                if(!tokenResponse.Error && tokenResponse.Status === 200 && tokenResponse.data.IsTokenValid){
                    var verifydata = {Code : dataJson.Code, UserId  : dataJson.UserId};
                    serviceData.send('AccountApi/ConfirmEmail', verifydata).then(function (response) {
                        if(!response.Error && response.Status === 200){
                            $scope.isVerified = response.data.Message;
                        }else{
                            serviceGlobal.isTokenError = {
                                isError : true,
                                msg : response.Error.Message
                            }
                            $location.path('/tokenError');
                            return false;
                        }
                    },function(error){
                        serviceGlobal.isTokenError = {
                            isError : true,
                            msg : response.Error.Message
                        }
                        $location.path('/tokenError');
                        return false;
                        $scope.isVerified = error;
                    });    
                }else{
                    serviceGlobal.isTokenError = {
                        isError : true,
                        msg : tokenResponse.Error.Message
                    }
                    $location.path('/tokenError');
                }
            });            
        }else{
            window.location.href = "#/";
        }
    }]);
    
    