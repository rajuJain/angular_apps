'use strict';

/**
 * @ngdoc service
 * @name fvg.service:serviceSync
 * @description Maintain application flow by locking required input values.
 */

(function () {
    
    angular.module('fvg')
    .factory('serviceSync',['$q', '$location', 'serviceData', 'serviceGlobal', function ($q, $location, serviceData, serviceGlobal) {
        return {
        	createFile : function(create){
                create = create || false;
				var deferred = $q.defer();
	      		var promise = deferred.promise;	
				var suppliers = serviceData.get('suppliers').then(
						        function (res) {
									if(angular.isArray(res) && res.length > 0){
										serviceGlobal.suppliers = res;
										return res;
									}else{
										return false;
									}  
						    	},function (error) {
                                    //return error;
							    });
				var units = serviceData.get('units').then(
						        function (res) {
									if(angular.isArray(res) && res.length > 0){
										serviceGlobal.units = res;
										return res;
									}else{
										return false;
									}  
						    	},function (error) {
                                    //return error;
							    });			    
							    
				var currencies = serviceData.get('currencies').then(
						        function (res) {
									serviceGlobal.currencies = res;
									return res;
									
								},function (error) {
                                    //return error;
							    });
                if (create) {
                    var file = serviceData.get('createfile').then(
                        function(response){
                            if(response.fileNr){
                                    serviceGlobal.createFile = response;
                                    return response;
                            }else{
                                return 'Unautharized Request';
                            }
                        },function(error){
                            //return error;
                        });	
                }else{
                    var file = {};
							    
                }
				$q.all([suppliers, units, currencies, file]).then(function(response){
                    //console.log(angular.isArray(response), response.length);
                    if (angular.isArray(response) && response.indexOf(undefined) != -1) {
                        deferred.reject('An error occurred in synchronization. Please try again!');
	                }
					deferred.resolve(response);
					
				},function(error){
                    console.log(error);
					deferred.reject('An error occurred in synchronization. Please try again!');
				})
				return promise;			    
			},
        	
        	syncData : function(){
				var deferred = $q.defer();
	      		var promise = deferred.promise;	
				var suppliers = serviceData.get('suppliers').then(
						        function (res) {
									if(angular.isArray(res) && res.length > 0){
										serviceGlobal.suppliers = res;
										return res;
									}else{
										return false;
									}  
						    	},function (error) {
                                    //return error;
							    });
				var units = serviceData.get('units').then(
						        function (res) {
									if(angular.isArray(res) && res.length > 0){
										serviceGlobal.units = res;
										return res;
									}else{
										return false;
									}  
						    	},function (error) {
                                    //return error;
							    });			    
							    
				var currencies = serviceData.get('currencies').then(
						        function (res) {
									serviceGlobal.currencies = res;
									return res;
									
								},function (error) {
                                    //return error;
							    });
							    
				var containerTypes = serviceData.get('containertypes').then(
						        function (res) {
									if(angular.isArray(res) && res.length > 0){
										serviceGlobal.containerTypes = res;
										return res;
									}else{
										return false;
									}  
						    	},function (error) {
                                    //return error;
							    });					
				var ports = serviceData.get('ports').then(
						        function (res) {
									if(angular.isArray(res) && res.length > 0){
										serviceGlobal.ports = res;
										return res;
									}else{
										return false;
									}  
						    	},function (error) {
                                    //return error;
							    });
							    
				$q.all([suppliers, units, currencies, containerTypes, ports]).then(function(response){
					if (angular.isArray(response) && response.indexOf(undefined) != -1) {
	                    deferred.reject('An error occurred in synchronization. Please try again!');
	                }
					deferred.resolve(response);
				},function(error){
					deferred.reject('An error occurred in synchronization. Please try again!');
				})
				return promise;
			}
            
        };
    }]);

})();