'use strict';

/* Home Controller Logic*/

angular.module('patientPortalWorkList')

    /**
     * @ngdoc
     * @name PatientPortal.controller:#homeController
     * @url '/'
     * @template home.html
     * @public
     * @description Provide home page interface and will be intial stage of application.
    */

    .controller('featuresController', ['$http', '$scope', '$location', '$cookies', '$timeout', 'config', 'serviceGlobal', 'serviceAuth', 'serviceData', function ($http, $scope, $location, $cookies, $timeout, config, serviceGlobal, serviceAuth, serviceData) {
        if (!serviceAuth.isAuthenticated()) {
            $location.path("/login");
        }
        if (serviceAuth.getSession().Type != 'Admin') {
            $location.path('notFound');
            return false;
        }

        $scope.CheckBoxClicked = function (checkvalue) {            
            if (checkvalue == true) {
                //if (timer) { clearTimeout(timer); }            
                $scope.error = '';
                $scope.success = '';
                $scope.isProcessing = false;
                $scope.show = true;
                $('#ComminmgSoonAlert').click();
            }
        }

        $scope.closePopup = function () {
            $scope.show = false;
            $('#AlertMsg').trigger('reveal:close');
        }
    }]);