'use strict';

/**
 * @ngdoc service
 * @name fvg.service:serviceGlobal
 * @description Maintain application flow by locking required input values.
 */

(function () {
    
    angular.module('fvg')
    /*globalVarFactory to store temp data */
    .factory('serviceGlobal',['$rootScope', '$log', '$q', 'config', 'serviceData' , function ($rootScope, $log, $q, config, serviceData) {
        
         var progressStep = [];
        progressStep[0] = '';
        progressStep[1] = 'goods';
        progressStep[2] = 'container';
        progressStep[3] = 'transport';
        progressStep[4] = 'summary';
        
          /*if (serviceGlobal.progress.completedStep < 1) {
	            serviceGlobal.progress.completedStep = 1; 
	        }
        */
        return {
        	dateLocking : {},
        	createFile : {},
			suppliers : [],
			units : [],
			currencies : [],
			containerTypes : [],
			ports: [],
			
			goodsPage : {},
			containerPage : {},
			transportPage : {},
			summaryPage : {},
			
			syncData : function(){
				var deferred = $q.defer();
	      		var promise = deferred.promise;	
				var suppliers = serviceData.get('agent/index.php?action=suppliers').then(
						        function (res) {
									if(angular.isArray(res) && res.length > 0){
										this.suppliers = res;
										return res;
									}else{
										return false;
									}  
						    	},function (error) {
									return false;
							    });
				var units = serviceData.get('agent/index.php?action=units').then(
						        function (res) {
									if(angular.isArray(res) && res.length > 0){
										this.units = res;
										return res;
									}else{
										return false;
									}  
						    	},function (error) {
									return false;
							    });			    
							    
				var currencies = serviceData.get('agent/index.php?action=currencies').then(
						        function (res) {
									if(angular.isArray(res) && res.length > 0){
										this.currencies = res;
										return res;
									}else{
										return false;
									}  
						    	},function (error) {
									return false;
							    });
							    
				var containerTypes = serviceData.get('agent/index.php?action=containertypes').then(
						        function (res) {
									if(angular.isArray(res) && res.length > 0){
										this.containerTypes = res;
										return res;
									}else{
										return false;
									}  
						    	},function (error) {
									return false;
							    });					
				
				var ports = serviceData.get('agent/index.php?action=ports').then(
						        function (res) {
									if(angular.isArray(res) && res.length > 0){
										this.ports = res;
										return res;
									}else{
										return false;
									}  
						    	},function (error) {
									return false;
							    });
							    
				$q.all([suppliers, units, currencies, containerTypes, ports]).then(function(response){
					deferred.resolve(response);
				},function(error){
					deferred.reject('An error occurred in synchronization. Please try again!');
				});
				
				return promise;
			},
			
			reset : function(){
				/*this.dateLocking  = {},
	        	this.createFile = {},
				this.suppliers = [],
				this.units = [],
				this.currencies =  {},
				this.containerTypes = [],
				this.ports = [];*/
                
                this.createFile = {},
                this.goodsPage = {},
                this.containerPage = {},
                this.transportPage = {},
                this.summaryPage ; {};
			},
			
			progress : {
				progressStep : progressStep,
				completedStep : 0,
				getLastStep : function(){
                    if (progressStep[this.completedStep]) {
                         return progressStep[this.completedStep];    
                    }else{
                        var session = $cookies.session || {};
                        if (!angular.isObject(session) && session.length > 0) {
                            session = JSON.parse(session)
                            if(session.Type && session.Type == 'User'){
                                return 'exam';
                            }else{
                              return '';
                            }
                        }else{
                            return '';
                        }
                    }
                    
				}
					
			},
            saveData : function saveData() {
                localStorage.setItem('fileData', encodeURIComponent(JSON.stringify(this.createFile)));
                localStorage.setItem('goodsData', encodeURIComponent(JSON.stringify(this.goodsPage)));
                localStorage.setItem('suppliers', encodeURIComponent(JSON.stringify(this.suppliers)));
                localStorage.setItem('units', encodeURIComponent(JSON.stringify(this.units)));
                localStorage.setItem('currencies', encodeURIComponent(JSON.stringify(this.currencies)));
                
                return true;
                
            },
          
            restoreData : function restoreData() {
                var createdFile = localStorage.getItem('fileData');
                var goodsPageData = localStorage.getItem('goodsData');
                
                if (typeof createdFile !== 'undefined' && createdFile !== null){
                    this.createFile = JSON.parse(decodeURIComponent(createdFile));
                    
                    this.suppliers = JSON.parse(decodeURIComponent(localStorage.getItem('suppliers')));
                    this.units = JSON.parse(decodeURIComponent(localStorage.getItem('units')));
                    this.currencies = JSON.parse(decodeURIComponent(localStorage.getItem('currencies')));
                }
                if (typeof goodsPageData !== 'undefined' && goodsPageData !== null){
                    this.goodsPage = JSON.parse(decodeURIComponent(goodsPageData));        
                }
                
                return true;
                
            }
            
        };
    }]);

})();