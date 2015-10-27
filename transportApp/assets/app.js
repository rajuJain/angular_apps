'use strict';

    /* Application */

    /*
     * Angular js Application starts here
     * Contains view binding and
     * angular controller function
     */

    // create the module and name it fvg
angular.module('fvg', ['ngRoute', 'ngCookies','validator','ui.bootstrap','ngSanitize', 'ui.select'])
	
	.config(function ($httpProvider) {
		$httpProvider.defaults.useXDomain = true;
		
	})
	
	// configure our routes
	.config(function ($routeProvider) {
           $routeProvider

               // route for home page
               .when('/', { templateUrl: 'views/myFiles.html', controller: 'homeController' })
               
               .when('/goods', { templateUrl: 'views/goods.html', controller: 'goodsController' })
               
               .when('/container', { templateUrl: 'views/container.html', controller: 'containerController' })
               
			   .when('/transport', { templateUrl: 'views/transport.html', controller: 'transportController' })
			   
			   .when('/summary', { templateUrl: 'views/summary.html', controller: 'summaryController' })
			   
			   .when('/login', { templateUrl: 'views/login.html', controller: 'loginController' })
			   
               // For all other url
               .otherwise({ redirectTo: '/notFound' });
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
              $validatorProvider.register('alphanum', {
                invoke: 'blur',
                validator: /^[a-zA-Z0-9]*$/,
                error: 'Enter only alpha numeric characters.'
              });
              $validatorProvider.register('alpha', {
                invoke: 'blur',
                validator: /^[A-z]+$/,
                error: 'Enter valid alphabetical characters.'
              });
              $validatorProvider.register('numeric', {
                invoke: 'blur',
                validator: /(^[0-9]+$|^$)/,
                error: 'Enter valid number.'
              });
              $validatorProvider.register('date', {
                invoke: 'blur',
                //validator: /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/,
                validator: /^(19|20)\d{2}\-(0[1-9]|1[0-2])\-(0[1-9]|1\d|2\d|3[01])$/,
                error: 'Enter valid date.'
              });
              $validatorProvider.register('float', {
                invoke: 'blur',
                validator: /^[0-9]{1,11}(?:\.[0-9]{1,3})?$|^$/,
                error: 'Enter valid number(3 digit after decimal allowed).'
              });
              
              
              
             
       })

       // Bind functon once application starts for global access
       .run(function ($rootScope, $location, $route, serviceGlobal,serviceData, serviceAuth) {
       	
	    	window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
				serviceData.logData(errorMsg, 'error');
				// Tell browser to run its own error handler as well   
				return false;
		    }
	    	
	    	$rootScope.$on('$routeChangeStart', function(event, next, prevRoute){
                $(window).scrollTop(0);
				if (next.$$route != undefined) {
					$rootScope.isLoggedIn = serviceAuth.isAuthenticated();
					if($rootScope.isLoggedIn){
						var userInfo = serviceAuth.getSession();
			    		$rootScope.userName = userInfo.Name;
					}
					
				  serviceData.logData('---------------------***---------------------');
		                  var message = 'Next Angular Route - "' + next.$$route.originalPath + '", Controller - "' + next.$$route.controller + '", Template - "' + next.$$route.templateUrl +'"';
		                  serviceData.logData(message);    
				}
	    	});
	    
	});
	
/* Application Ends */  