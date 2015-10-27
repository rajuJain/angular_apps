'use strict';

/* Login Controller Logic*/

angular.module('patientPortalWorkList')

    /**
    * @ngdoc
    * @name PatientPortal.Controller:settingController
    * @url '/setting'
    * @template setting.html
    * @description
    * Interface to change auth credentials
    */

    .controller('settingController', ['$scope', '$location', '$route', '$cookies', '$timeout', 'serviceData', 'serviceAuth', 'serviceGlobal', function ($scope, $location, $route, $cookies, $timeout, serviceData, serviceAuth, serviceGlobal) {
        $scope.credentials = {};

        if (!serviceAuth.isAuthenticated()) {
            $location.path("/login");
        }
        $scope.error = '';
        $scope.password = {};
        $scope.global_progress = '';
        $scope.success = '';
        var timer = setTimeout(function () { }, 10000);
        var session = serviceAuth.getSession();
        
        $scope.updateSetting = function (password) {
            if (timer) { clearTimeout(timer); }
            $scope.error = '';
            $scope.success = '';
            if (password.NewPassword != password.ConfirmPassword) {
                $scope.error = 'Passwords do not match.';
                timer = setTimeout(function () { $scope.error = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 10000);
                return false;
            }

            if (password.OldPassword.length < 6 || password.NewPassword.length < 6 || password.ConfirmPassword.length < 6) {
                $scope.error = 'Password length should be minimum 6 digit!';
                timer = setTimeout(function () { $scope.error = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 10000);
                return false;
            } else {
                $('#password').removeClass('has-error');
            }

            serviceData.send('updatePassword', {password : $scope.password.NewPassword, userId : session.user_id, oldPassword : $scope.password.OldPassword}).then(function (res) {
                $scope.global_progress = 'Please wait...';
                if (!res.error_code && res.response_code == 200) {
                    $scope.success = 'Password updated successfully.';
                    $scope.password = {};
                    setTimeout(function () { $('#OldPassword, #NewPassword, #ConfirmPassword').removeClass('has-error'); }, 100)
                    timer = setTimeout(function () { $scope.success = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 10000);
                } else if (res.error_code) {
                    $scope.error = res.error_text;
                    timer = setTimeout(function () { $scope.error = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 10000);
                }
                $scope.global_progress = '';
            }, function (err) {
                $scope.global_progress = '';
                if (err.error_text) {
                    $scope.error = err.error_text;
                } else {
                    $scope.error = 'An error occured. Either user already exists or have some server error.';
                }
                timer = setTimeout(function () { $scope.error = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 10000);
            })
        }
    }]);