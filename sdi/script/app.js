'use strict';

    /* Application */

    /*
     * Angular js Application starts here
     * Contains view binding and
     * angular controller function
     */

    // create the module and name it sdi
angular.module('sdi', ['ngCookies', 'pascalprecht.translate', 'ngRoute', 'kendo.directives'])

	// configure our routes
	.config(function ($routeProvider) {
           $routeProvider

               // route for home page
               .when('/', { templateUrl: 'app/views/home.html', controller: 'homeController' })

               // route for find patient page
               .when('/findInfo', { templateUrl: 'app/views/returning_patient.html', controller: 'findInfoController' })

               // route for find patient page
               .when('/otherExams', { templateUrl: 'app/views/otherExams.html', controller: 'otherExamsController' })

	       // route for signup confirmation page
               .when('/confirmEmail', { templateUrl: 'app/views/signup.html', controller: 'signupController' })
               
               // route for email confirmation
               .when('/emailConfirmation', { templateUrl: 'app/views/verifyEmail.html', controller: 'verifyController' })
	       
	       		// route for profile page
               .when('/profile', { templateUrl: 'app/views/profile.html', controller: 'profileController' })
	       
               // route for login page
               .when('/login', { templateUrl: 'app/views/login.html', controller: 'loginController' })

               // route for forgor password page
               .when('/forgotPassword', { templateUrl: 'app/views/forgot_password.html', controller: 'forgotPasswordController' })

               // route for forgot password confirmation page
               .when('/forgotPasswordConfirmation', { templateUrl: 'app/views/forgot_password_confirmation.html', controller: 'forgotPasswordConfirmationController' })

               // route for logout page
               .when('/logout', { templateUrl: 'app/views/login.html', controller: 'logoutController' })
		
				// route for Exam page
               .when('/exam', { templateUrl: 'app/views/exam.html', controller: 'examController' })
		
               // route for appointments page
               .when('/appointments', { templateUrl: 'app/views/appointments.html', controller: 'appointmentsController' })

               // route for find doctor page
               .when('/findDoctor', { templateUrl: 'app/views/findDoctor.html', controller: 'findDoctorController' })

               // route for Medical history page
               .when('/medicalHistory', { templateUrl: 'app/views/medicalHistory.html', controller: 'medicalHistoryController' })
               
               // route for find location page
               .when('/findLocation', { templateUrl: 'app/views/findLocation.html', controller: 'findLocationController' })

               // route for find location page
               .when('/findLocationXray', { templateUrl: 'app/views/findLocationXray.html', controller: 'findLocationXrayController' })

               // route for appointment date page
               .when('/appointmentDate', { templateUrl: 'app/views/appointmentDate.html', controller: 'appointmentDateController' })

               // route for Schedule your appointment page
               .when('/scheduleAppointment', { templateUrl: 'app/views/scheduleAppointment.html', controller: 'scheduleAppointmentController' })

               // route for Schedule your appointment page
               .when('/pastAppointment', { templateUrl: 'app/views/pastAppointment.html', controller: 'pastAppointmentsController' })
              
               // route for Schedule your appointment page
               .when('/thankYou', { templateUrl: 'app/views/thankYou.html', controller: 'thankYouController' })

               // route for Schedule your appointment page
               .when('/otherExamThankYou', { templateUrl: 'app/views/otherExamThankYou.html', controller: 'otherExamThankYouController' })

               // route for Schedule your appointment page
               .when('/tokenError', { templateUrl: 'app/views/tokenError.html', controller: 'tokenErrorController' })
               
               // route for Schedule your appointment page
               .when('/notFound', { templateUrl: 'app/views/notFound.html', controller: 'rootController' })

               // route for Schedule your appointment page
               .when('/quotaExceeded', { templateUrl: 'app/views/quotaExceeded.html', controller: 'quotaExceededController' })

               // For all other url
               .otherwise({ redirectTo: '/notFound' });
	})

       // Bind functon once application starts for global access
       .run(function ($rootScope, $cookies, $translate, $route, $location, serviceGlobal,serviceData, serviceAuth) {
	    $rootScope.token = $('#hdnToken').val();
         
         
         $rootScope.protectFields = function($event){
              setTimeout(function(){
                     var e = $event.target;
                     var inputId = e.id;
                     var inputValue = $('#'+inputId).val();
                     var result = (inputValue.replace(/\</g, '')).replace(/\>/g, '');                            
                     $('#'+inputId).val(result);                     
              }, 2);
         }
         
            //var storedAppData = JSON.parse(decodeURIComponent(localStorage.getItem('serviceGlobal')));
            //serviceGlobal = storedAppData;
            //console.log(storedAppData);
            
	    window.onbeforeunload = function (event) {
		//console.log(serviceGlobal);
		//$cookies.globalData = serviceGlobal;
                
	    }
	   
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
			$rootScope.removeContent = true;
		    if(next.$$route.originalPath == '/login' || next.$$route.originalPath == '/forgotPassword' || next.$$route.originalPath == '/forgotPasswordConfirmation' || next.$$route.originalPath == '/confirmEmail'){
				$rootScope.removeContent = false;
		    }
                  if(prevRoute && prevRoute.$$route && prevRoute.$$route.originalPath){
                     if (prevRoute.$$route.originalPath != '/login') {
                        $rootScope.referralUrl = prevRoute.$$route.originalPath;
                     }
                     
                  }
		  serviceData.logData('---------------------***---------------------');
                  var message = 'Next Angular Route - "' + next.$$route.originalPath + '", Controller - "' + next.$$route.controller + '", Template - "' + next.$$route.templateUrl +'"';
                  serviceData.logData(message);    
		}
	    });
	   
       $rootScope.$on('$viewContentLoaded', function(event) {
		    ga('send', 'pageview',$location.url());
  		});

	    $rootScope.$on('$locationChangeSuccess',function(evt, absNewUrl, absOldUrl) {
              serviceData.logData('Route Loaded Successfully - ' + absNewUrl);
              //$window._gaq.push(['_trackPageview', $location.url()]);       
              //localStorage.setItem('serviceGlobal', encodeURIComponent(JSON.stringify(serviceGlobal)));
              //console.log(JSON.parse(decodeURIComponent(localStorage.getItem('serviceGlobal'))));
	    });
	    serviceGlobal.reset();
	});
	
/* Application Ends */  