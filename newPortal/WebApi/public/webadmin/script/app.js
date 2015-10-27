'use strict';

    /* Application */

    /*
     * Angular js Application starts here
     * Contains view binding and
     * angular controller function
     */
    // create the module and name it AngularDemo
angular.module('AngularDemo', ['ngCookies', 'ngRoute', 'ngApiGateWay', 'ngAuth', 'validator', 'ngGrid', 'ngDialog'])

       // configure our routes
       .config(function ($routeProvider) {
              $routeProvider
       
                  // route for home page
                  .when('/', { templateUrl: 'views/home.html', controller: 'homeController' })
       
                  // route for module page
                  .when('/modules', { templateUrl: 'views/module.html', controller: 'manageModuleController' })
       
                  // route for slides page
                  .when('/slides', { templateUrl: 'views/slides.html', controller: 'manageSlidesController' })
       
                  // route for login page
                  .when('/login', { templateUrl: 'views/login.html', controller: 'loginController' })
				  
       				     // route for my profile page
                  .when('/myprofile', { templateUrl: 'views/myprofile.html', controller: 'myProfileController' })
                  
                  //route for general settings
                  .when('/generalSettings', { templateUrl: 'views/generalSettings.html', controller: 'generalSettingsController' })
                  // For all other url
                  .otherwise({ redirectTo: '/' });
       })
       // config for ngApiGateWay provider
       .config(function(serviceDataProvider){
              var environments = {
                                   prd: {text: 'Production',server: '',serverKeyName : '', serverKeyValue : '', serverTokenName : '',  serverTokenValue : ''},
                                   dev: {text: 'Development',server: 'http://52.4.210.88:8080',serverKeyName : 'apikey', serverKeyValue : '68F5H7HDKI97855BHJKYSNY68', serverTokenName : 'token',  serverTokenValue : ''},
                                   localhost: {text: 'Localhost',server: 'http://localhost:8080', serverKeyName : 'apikey', serverKeyValue : '68F5H7HDKI97855BHJKYSNY68', serverTokenName : 'token',  serverTokenValue : ''}
                            };
              var configData = {
                     environments : environments,
                     // currentEnvironment: 'localhost',
                     currentEnvironment: 'dev',
                     writeLogData: false
              }
              serviceDataProvider.setConfig(configData);
       })
       
       // config for ngAuth provider
       .config(function(serviceAuthProvider){
              var AuthData = {
                     authUrl : 'http://52.4.210.88:8080/admin/signin',
                     // authUrl : 'http://localhost:8080/admin/signin',
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
                    $rootScope.isAdminLoggedIn = serviceAuth.isAuthenticated();
                }

                //autheticated controllers when logged in
                if (!$rootScope.isAdminLoggedIn && next.$$route.originalPath != '/login') {
                  var defaultPath = "/login";    
				   $location.path(defaultPath);
                };

                if ($rootScope.isAdminLoggedIn  && next.$$route.originalPath == '/login') {
                    var defaultPath = "/";                   
                    $rootScope.sessionData = serviceAuth.getSession();
					$location.path(defaultPath);
                };
              });

              
              $rootScope.logout = function(){
                     serviceAuth.logout();
                     $rootScope.isAdminLoggedIn = false;
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