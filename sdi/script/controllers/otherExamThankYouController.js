'use strict';

/* thankYou Controller Logic*/

angular.module('sdi')

     /**
    * @ngdoc
    * @name sdi.Controller:otherExamThankYouController
    * @url '/otherExamThankYou'
    * @template otherExamThankYou.html
    * @description
    * display after schedule appointment 
    */
    .controller('otherExamThankYouController', ['$scope', '$location', '$cookies', '$timeout', 'serviceGlobal', 'serviceAuth', 'serviceExamCode', 'serviceData' , function ($scope, $location, $cookies, $timeout, serviceGlobal, serviceAuth, serviceExamCode, serviceData) {
        
        if(!serviceGlobal.isDontSeeExam){
           $location.path('/');
           return false;
        }
        serviceGlobal.isDontSeeExam = false;
        
        $scope.backToHome = function(){
            $scope.isProcessing = 'inProgress';
          $location.path('/');
          return false;
        }



    }]);