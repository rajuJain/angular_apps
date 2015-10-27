'use strict';

/* Controller Logic*/

angular.module('patientPortalWorkList')

    /**
     * @ngdoc
     * @name PatientPortal.controller:#rootController
     * @url '/'
     * @template home.html
     * @public
     * @description Act as parent controller, to provide root scope for global functions within child controller.
    */
    .controller('rootController', ['$scope', '$rootScope', '$location', '$cookies', '$timeout', 'serviceGlobal', 'serviceAuth', 'serviceData', 'config', function ($scope, $rootScope, $location, $cookies, $timeout, serviceGlobal, serviceAuth, serviceData, config) {
        if (!serviceAuth.isAuthenticated()) {
            $location.path("/login");
        }

        $scope.showSpanishCss = false;
        $scope.enablePopup = true;
        $timeout(function () { $scope.enablePopup = false; }, 2000);
        $scope.makeActive = function (link) {

            var path = $location.path();
            if ((link == path) || (path == '/' && link == '/patient')) {
                return true;
            }
            return false;
        }
    }]);