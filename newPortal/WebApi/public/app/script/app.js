'use strict';

    /* Application */

    /*
     * Angular js Application starts here
     * Contains view binding and
     * angular controller function
     */
    // create the module and name it AngularDemo
angular.module('AngularDemo', ['ngCookies', 'ngRoute', 'ngApiGateWay', 'ngAuth', 'validator'])
        
       // configure our routes
       .config(function ($routeProvider) {
              $routeProvider
       
                  // route for home page
                  .when('/', { templateUrl: 'views/home.html', controller: 'homeController' })
       
                  // route for home page
                  .when('/login', { templateUrl: 'views/login.html', controller: 'loginController' })
       
                  // route for home page
                  .when('/signup', { templateUrl: 'views/signup.html', controller: 'signupController' })
       
                  // route for home page
                  .when('/forgotpassword', { templateUrl: 'views/fotgotpassword.html', controller: 'forgotPassowrdController' })
                    
                  .when('/financialGoals', {
                    templateUrl: 'views/financialGoals.html',
                    controller: 'financialGoalsController' 
                  })
                  
                  .when('/goalsView', {
                    templateUrl: 'views/goalsView.html',
                    controller: 'goalsViewController'
                  })
       
                  // For all other url
                  .otherwise({ redirectTo: '/' });
       })
       // config for ngApiGateWay provider
       .config(function(serviceDataProvider){
              var environments = {
                                   prd: {text: 'Production',server: '',serverKeyName : '', serverKeyValue : '', serverTokenName : '',  serverTokenValue : ''},
                                   dev: {text: 'Development',server: 'http://52.4.210.88:8080',serverKeyName : 'apikey', serverKeyValue : '68F5H7HDKI97855BHJKYSNY68', serverTokenName : '',  serverTokenValue : ''},
                                   localhost: {text: 'Localhost',server: 'http://localhost:8080', serverKeyName : 'apikey', serverKeyValue : '68F5H7HDKI97855BHJKYSNY68', serverTokenName : 'token',  serverTokenValue : ''}
                            };
              var configData = {
                     environments : environments,
                     currentEnvironment: 'localhost',
                     writeLogData: false
              }
              serviceDataProvider.setConfig(configData);
       })
       
       // config for ngAuth provider
       .config(function(serviceAuthProvider){
              var AuthData = {
                     authUrl : 'http://localhost:8080/api/signin',
                     headers: {'apikey' : '68F5H7HDKI97855BHJKYSNY68'},
                     setAuthToken : true, // Flag to set token in Service Data Module,
                     tokenNode : 'SSO_TOKEN' // Flag to get token value from session in Service Data Module
              }
              serviceAuthProvider.setAuthData(AuthData);
       })
       
       
       .config(function($validatorProvider) {
              $validatorProvider.register('required', {
                invoke: 'blur',
                validator: /^.+$/,
                error: 'This field is required.'
              });
              $validatorProvider.register('email', {
                invoke: 'blur',
                validator: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                error: 'Enter valid email.'
              });
             
       })

       // Bind functon once application starts for global access
       .run(function ($rootScope, $cookies, $route, $location, serviceGlobal, serviceAuth, $validator, serviceData) {
              $rootScope.$on('$routeChangeStart', function(event, next, prevRoute){
                $rootScope.cuurent_path = next.$$route.originalPath;
                if (next.$$route != undefined) {
                    $rootScope.isLoggedIn = serviceAuth.isAuthenticated();
                }

                //autheticated controllers when logged in
                if (!$rootScope.isLoggedIn) {
                  var defaultPath = "/login";
                  switch($rootScope.cuurent_path) {
                    case '/financialGoals':
                      $location.path(defaultPath);
                    break;
                  }
                };

                if ($rootScope.isLoggedIn) {
                    var defaultPath = "/home";
                    switch($rootScope.cuurent_path) {
                      case '/signup': case '/login':
                        $location.path(defaultPath);
                      break;
                    }
                    $rootScope.sessionData = serviceAuth.getSession();
                };
              });

              
              $rootScope.logout = function(){
                     serviceAuth.logout();
                     $rootScope.isLoggedIn = false;
                     var tokenValue = serviceData.config.currentEnvironment.serverKeyValue;
                     serviceData.get('logout', {token: tokenValue}).then(function (response) {
                            if (response.response_code == 200 && !response.error_code) {
                            }else{
                                if (response.error_code && response.error_text) {
                                    $location.path('/login');
                                    $rootScope.errorMsg = response.error_text;
                                }
                                
                            }
                        },function(error){
                            $rootScope.errorMsg = "Connected but received a server error in response: " + error.status;
                        });
              }
       });
	
/* Application Ends */  