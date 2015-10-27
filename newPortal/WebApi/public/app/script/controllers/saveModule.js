'use strict';

/* Signup Controller Logic*/

angular.module('AngularDemo')

     /**
    * @ngdoc
    * @name AngularDemo.Controller:homeController
    * @url '/'
    * @template http://localhost/learnlux/webapi/public/app/#/saveModule/1.html
    * @description
    * display save module
    */
    .controller('saveModuleController', ['$scope', '$routeParams', 'serviceData','$location','serviceAuth', function ($scope, $routeParams, serviceData, $location, serviceAuth) {
       // alert("Save Module Controller");
       $scope.moduleId = $routeParams.moduleID;
       // console.log($scope.moduleId);

      //saving module for this user 
      $scope.saveModule = function() {
         serviceData.get('moduleComplete', {module_id: $scope.moduleId}).then(function (response) {
            if (response.response_code == 200 && response.result == "Success") {
                console.log("Data Saved!!");
                $location.path("/dashboard");
            }else{
                console.log("failure",response);
            }
        },function(error){
            $scope.errorMsg = "Connected but received a server error in response: " + error.status;
        });
      }
    }])
