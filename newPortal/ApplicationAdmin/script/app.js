'use strict';

/* Application */

/*
 * Angular js Application starts here
 * Contains view binding and
 * angular controller function
 */

// create the module and name it dempApp
angular.module('patientPortalWorkList', ['ngCookies', 'ngRoute', 'kendo.directives', 'validator'])

	// configure our routes
	.config(function ($routeProvider) {
	    $routeProvider

            // route for home page
            //.when('/', { templateUrl: 'views/home.html', controller: 'homeController' })

            // route for login page
            .when('/login', { templateUrl: 'views/login.html', controller: 'loginController' })

			// route for patient management page
            .when('/', { templateUrl: 'views/patient.html', controller: 'patientController' })
			
             // route for patient management page
            .when('/patient', { templateUrl: 'views/patient.html', controller: 'patientController' })

            // route for provider management page
            .when('/provider', { templateUrl: 'views/provider.html', controller: 'providerController' })
			
			// route for admin management page
            .when('/admin', { templateUrl: 'views/provider.html', controller: 'providerController' })

              // route for scheduler management page
            .when('/features', { templateUrl: 'views/features.html', controller: 'featuresController' })

            // route for scheduler management page
            .when('/setting', { templateUrl: 'views/setting.html', controller: 'settingController' })

            // route for logout page
            .when('/logout', { templateUrl: 'views/login.html', controller: 'logoutController' })

             // route for Schedule your appointment page
            .when('/notFound', { templateUrl: 'views/notFound.html', controller: '' })

            // For all other url
            .otherwise({ redirectTo: '/notFound' });

	})
	
	.config(function($validatorProvider) {
			$validatorProvider.register('required', {
			  invoke: 'sub',
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
			  validator: /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/,
			  error: 'Enter valid date.'
			});
			$validatorProvider.register('float', {
			  invoke: 'blur',
			  validator: /^[0-9]{1,11}(?:\.[0-9]{1,3})?$|^$/,
			  error: 'Enter valid number(3 digit after decimal allowed).'
			});
			
			
			
		   
	 })

	// Bind functon once application starts for global access
	.run(function ($rootScope, $cookies, $route, $location, config, serviceGlobal, serviceData, serviceAuth) {
		
		if (serviceAuth.isAuthenticated()) {
			var session = serviceAuth.getSession();
			
			$rootScope.isAdmin = session.Type;
			$rootScope.token = session.sso_token;
			config.setToken(session.sso_token).then(function(token){
				console.log('Authentication Mapped..');
			});
			serviceData.send('getUserDetail', {user_id : session.user_id}).then(function(res){
				if (res.error_code == 300) {
					console.log('Session Expired..');
					$location.path('/logout');
				}
			},function(err){
				console.log(err);
			});	
		}
		
		window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
			serviceData.logData(errorMsg, 'error');
			// Tell browser to run its own error handler as well   
			return false;
		}

		$rootScope.$on('$routeChangeStart', function (event, next, prevRoute) {
			if (next.$$route != undefined) {
				$rootScope.isLoggedIn = serviceAuth.isAuthenticated();
				if ($rootScope.isLoggedIn) {
					var userInfo = serviceAuth.getSession();
					$rootScope.userName = userInfo.firstName;
				}
				$rootScope.removeContent = true;
				if (next.$$route.originalPath == '/login' || next.$$route.originalPath == '/forgotPassword' || next.$$route.originalPath == '/forgotPasswordConfirmation' || next.$$route.originalPath == '/confirmEmail') {
					$rootScope.removeContent = false;
				}
				serviceData.logData('---------------------***---------------------');
				var message = 'Next Angular Route - "' + next.$$route.originalPath + '", Controller - "' + next.$$route.controller + '", Template - "' + next.$$route.templateUrl + '"';
				serviceData.logData(message);
			}
		});

		$rootScope.$on('$locationChangeSuccess', function (evt, absNewUrl, absOldUrl) {
			serviceData.logData('Route Loaded Successfully - ' + absNewUrl);
			//localStorage.setItem('serviceGlobal', encodeURIComponent(JSON.stringify(serviceGlobal)));
			//console.log(JSON.parse(decodeURIComponent(localStorage.getItem('serviceGlobal'))));
		});

	});

/* Application Ends */