'use strict';

/**
 * @ngdoc service
 * @name AngularDemo.service:serviceGlobal
 * @description Maintain application flow by locking required input values.
 */

(function () {
    
    angular.module('AngularDemo')
    /*globalVarFactory to store temp data */
    .factory('serviceGlobal',['$rootScope', '$cookies', '$log', function ($rootScope, $cookies, $log) {
            return {
                    userSession: {}
            }
          
            
    }]);

})();