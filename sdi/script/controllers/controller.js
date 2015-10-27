'use strict';

/* Controller Logic*/

    angular.module('sdi')

    /**
     * @ngdoc
     * @name sdi.controller:#rootController
     * @url '/'
     * @template home.html
     * @public
     * @description Act as parent controller, to provide root scope for global functions within child controller.
    */  
    .controller('rootController',['$scope', '$rootScope', '$location', '$cookies', '$timeout', 'serviceGlobal', 'serviceAuth', 'config', '$translate', function ($scope, $rootScope, $location, $cookies, $timeout, serviceGlobal, serviceAuth, config, $translate) {
        $scope.token = $rootScope.token;
        $scope.showSpanishCss = false;
        $scope.enablePopup = true;
        $timeout(function() { $scope.enablePopup = false; }, 2000);
        config.setVerificationToken($rootScope.token);
        var session = serviceAuth.getSession();
        serviceGlobal.userSession.gender = session.Gender || '';
        
        /**
         * @ngdoc
         * @name sdi.controller.function:#setLanguage
         * @set web language by passing language param.
         * @param lang
        */
        $rootScope.setLanguage = function(lang) {
         // set language in cookies
         ///$cookies.__APPLICATION_LANGUAGE = lang;
         document.cookie="__APPLICATION_LANGUAGE="+lang;
         $scope.lang = lang;
         //use language
          $translate.use(lang);
            if (lang === 'es-AR') {
                if ($('link[rel=stylesheet][href~="/Content/style-spanish.css"]').length === 0) {
                    $("body").append("<link href='/Content/style-spanish.css' type='text/css' rel='stylesheet' />");
                }    
            }else{
                $('link[rel=stylesheet][href~="/Content/style-spanish.css"]').remove();
            }
        }
        
        /**
        * @ngdoc
        * @name sdi.controller.function:#init
        * @set language when page is load.
        * @param get from cookie
       */ 
        $scope.init = function() {
           // get language from cookies || defualt language 'en-US
           var lang = $scope.lang = $cookies.__APPLICATION_LANGUAGE || 'en-US';
           $translate.use(lang);
        }
        
        // call init function when application start for globale access
        $scope.init();
        
        if ($cookies.__APPLICATION_LANGUAGE == 'es-AR') {
            $("body").append("<link href='/Content/style-spanish.css' type='text/css' rel='stylesheet' />");
        }
       
        
    }])

    /**
     * @ngdoc
     * @name sdi.controller:#progressController
     * @url '/'
     * @template progress_bar.html
     * @public
     * @description bind page progress to progress bar.
    */  
     .controller('progressController',['$rootScope','$scope', '$location', 'serviceAuth', 'serviceGlobal', function ($rootScope, $scope, $location, serviceAuth, serviceGlobal) {
        
        $rootScope.currentStep = serviceGlobal.appointment.completedStep;
        $scope.isAuthenticated = serviceAuth.isAuthenticated();
        $rootScope.CurrentPage = $location.path().replace('/','');
        if ($rootScope.CurrentPage != 'scheduleAppointment' && $rootScope.CurrentPage != 'appointmentDate') {
            serviceGlobal.releaseTokens();
        }
        $scope.goToPage = function(pageName, pageNo){
                if ($scope.currentStep >= pageNo) {
                    $location.path('/'+pageName);
                    return false;    
                }
                
        }
        
        $scope.startOver = function(){
            serviceGlobal.reset();
            serviceGlobal.appointment.completedStep = 0;
            $location.path('/');
            return false;
        }


     }])

     /**
     * @ngdoc
     * @name sdi.controller:#tokenErrorController
     * @url '/tokenError'
     * @template tokenError.html
     * @public
     * @description show token error msg.
    */  
     .controller('tokenErrorController',['$scope', '$location', 'serviceGlobal', function ($scope, $location, serviceGlobal) {
            if(serviceGlobal.isTokenError.isError){
                $scope.errorMsg = serviceGlobal.isTokenError.msg;
            }else{
                $location.path('/');
                return false;
            }
     }])
         /**
     * @ngdoc
     * @name sdi.controller:#quotaExceededController
     * @url '/quotaExceeded'
     * @template quotaExceeded.html
     * @public
     * @description exceeded the maximum number of limit for the request.
    */  
     .controller('quotaExceededController',['$scope', '$location', '$rootScope', function ($scope, $location, $rootScope) {
            if (!$rootScope.isQuotaExceeded || !$rootScope.quotaExceededTime) {
                $location.path('');
                return false;
            }
            $rootScope.isQuotaExceeded = false;
            $scope.quotaExceededTime = $rootScope.quotaExceededTime;
     }]);
    