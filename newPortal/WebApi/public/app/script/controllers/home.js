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
    .controller('homeController', ['$scope', '$location', 'serviceAuth', 'serviceGlobal', 'serviceData', function ($scope, $location, serviceAuth, serviceGlobal, serviceData) {
        $scope.allDataHome = null;
         serviceData.get('getCompletedModule', {}).then(function (response) {
            if (response.response_code == 200) {
                $scope.allDataHome = response.result;
                console.log("response",$scope.allDataHome);
            }else{
                alert('Please Login');
                console.log("failure",response);
            }
        },function(error){
            $scope.errorMsg = "Connected but received a server error in response: " + error.status;
        });
    }]);


