'use strict';

/**
 * @ngdoc service
 * @name PatientPortal.service:serviceGlobal
 * @description Maintain application flow by locking required input values.
 */

(function () {
    angular.module('patientPortalWorkList')
    /*globalVarFactory to store temp data */
    .factory('serviceGlobal', ['$log', 'config', function ($log, config) {
        return {
            reset: function () {

            },
            // Lock all variables used in home controller
            home: {},
            //Bind user identity through out application
            userSession: {},
        };
    }]);
})();