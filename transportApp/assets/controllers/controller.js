'use strict';

/* Controller Logic*/

    angular.module('fvg')

    /**
     * @ngdoc
     * @name fvg.controller:#rootController
     * @url '/'
     * @template home.html
     * @public
     * @description Act as parent controller, to provide root scope for global functions within child controller.
    */  
    .controller('rootController',['$rootScope','$scope', '$location', 'serviceGlobal', 'serviceAuth', 'config', 'serviceData', 'serviceSync', function ($rootScope, $scope, $location, serviceGlobal, serviceAuth, config, serviceData, serviceSync) {
        var session = serviceAuth.getSession();
        if (session && session.user && session.password) {
            config.user(session.user,session.password);
        }
        serviceGlobal.restoreData();
		$scope.mainLoader = false;
        $rootScope.showCancelPopup = false;
        
        $scope.createFile = function(){
        	if(!serviceGlobal.createFile.fileNr){
				$scope.mainLoader = true; 
				serviceSync.createFile(true).then(function(response){
	                if (angular.isArray(response) && response.indexOf('Unautharized Request') != -1) {
	                    serviceAuth.logout();
	                    $location.path('/login');
	                }
	                $scope.mainLoader = false;
                    serviceGlobal.saveData();
                    if ($location.path() == '/goods') {
                        $scope.$broadcast ('setFile');
                    }else{
                        $location.path('/goods');    
                    }
	                
                    
	            },function(error){
	                if (angular.isArray(error) && error.indexOf('Unautharized Request') != -1) {
	                    serviceAuth.logout();
	                    $location.path('/login');
	                }
	                console.log(error);
	                $scope.mainLoader = false;
	                alert('An error occured. Please try again.');
	            });
			}else{
				$location.path('/goods');
			}
		}
		
        $scope.logout = function(){
            serviceAuth.logout();
            $location.path('/login');
        }
        
        $rootScope.cancel = function(){
            if (serviceGlobal.createFile.fileNr) {
                $rootScope.showCancelPopup = true;
            }
        }
        
        $rootScope.closeCancelPopup = function(){
            $rootScope.showCancelPopup = false;
        }
        
        $rootScope.cancelFile = function(){
            if (serviceGlobal.createFile.fileNr) {
                $rootScope.showCancelPopup = false;
                serviceData.get('cancelfile?id='+serviceGlobal.createFile.fileNr).then(function(response){
                    if (response.status == 200) {
                        serviceGlobal.reset();
                        $location.path('/goods');    
                    }else{
                        alert('An error occured. Please try again!');
                        $scope.commonFileError = 'An error occured. Please try again!';
                        console.log(response);
                    }
                    
                },function(error){
                    alert(error);
                    $scope.commonFileError = error;
                    console.log(error);
                });	    
            }
        }
            
        
    }])
    
    /**
     * @ngdoc
     * @name fvg.controller:#summaryController
     * @url '/'
     * @template summary.html
     * @public
     * @description fourth and last Step, Give Sumamary of all three steps.
    */
	 .controller('homeController',['$rootScope','$scope', '$location', 'serviceAuth', 'serviceGlobal', function ($rootScope, $scope, $location, serviceAuth, serviceGlobal) {
        if(!serviceAuth.isAuthenticated()){
			$location.path('/login');
			return false;
		}
        
     }])
     
     
     /**
     * @ngdoc
     * @name fvg.controller:#summaryController
     * @url '/'
     * @template summary.html
     * @public
     * @description fourth and last Step, Give Sumamary of all three steps.
    */
	 .controller('loginController', ['$rootScope','$scope', '$location', '$route', '$cookies', '$timeout', 'serviceData', 'serviceAuth', 'serviceGlobal', function ($rootScope, $scope, $location, $route, $cookies, $timeout, serviceData, serviceAuth, serviceGlobal) {
 
        $scope.credentials = {};
        $scope.isProcessing = false;
        if (!serviceAuth.isAuthenticated()) {
            
            /**
             * @ngdoc
             * @name sdi.controller.function:#login
             * @description check valid credencial
             * @param username, password
            */
            
            $scope.login = function () {
            	 var credentials = $scope.credentials;
                $scope.global_progress = 'inProgress';
                $scope.loginMessage = "";
                $scope.loginErrorMessage = '';
                
                if (credentials.username && credentials.password) {
                    $scope.isProcessing = true;
                    serviceAuth.login(credentials.username, credentials.password).then(function (response) {
                        $scope.isProcessing = false;
                        if(response.status == 200){
                            $scope.global_progress = '';
                            $location.path('/');
                            return false;
                        }else{
                            $scope.global_progress = '';
                            $scope.loginErrorMessage = response.Message;                                
                        }                        
                    }, function (err) {
                        $scope.isProcessing = false;
                    	console.log(err);
                        $scope.global_progress =  '';
                        if(err.status === 401 || err == 'Unautharized Request'){
                            $scope.loginErrorMessage = 'Wrong username or password';
                        }else{
                            $scope.loginErrorMessage = 'An error occured. Please try again !';    
                        }
                    });
                    
                } else {
                    $scope.global_progress = '';
                   
                    if (credentials.username && credentials.password) {
                        $scope.loginErrorMessage = "Please Enter Username & Password";
                    }else if (!credentials.username) {
                        $scope.loginErrorMessage = 'Username Required';
                    }else if (!credentials.password) {
                        $scope.loginErrorMessage = 'Password Required';    
                    }
                }
            };
        } else {
            $location.path("/");
            return false;
        }
     }])

    /**
     * @ngdoc
     * @name fvg.controller:#progressController
     * @url '/'
     * @template progressBar.html
     * @public
     * @description bind page progress to progress bar.
    */  
     .controller('progressController',['$rootScope','$scope', '$location', 'serviceAuth', 'serviceGlobal', function ($rootScope, $scope, $location, serviceAuth, serviceGlobal) {
        if(!serviceAuth.isAuthenticated()){
			$location.path('/login');
			return false;
		}
        $rootScope.commonFileError = '';
        $rootScope.currentStep = serviceGlobal.progress.completedStep;
        $scope.isAuthenticated = serviceAuth.isAuthenticated();
        $rootScope.CurrentPage = $location.path().replace('/','');
        $scope.goToPage = function(pageName, pageNo){
            if ($scope.currentStep >= pageNo) {
                $location.path('/'+pageName);
                return false;    
            }
        }
        $rootScope.hideCommonError = function(){
            $rootScope.commonFileError = '';    
        }
        
     }])
     
     /**
     * @ngdoc
     * @name fvg.controller:#goodsController
     * @url '/'
     * @template goods.html
     * @public
     * @description First Step, Provide details about goods to transport from one place to other.
    */
	 .controller('goodsController',['$rootScope','$scope', '$location', '$filter', '$timeout', '$validator', 'serviceData', 'serviceAuth', 'serviceGlobal','serviceSync', function ($rootScope, $scope, $location, $filter, $timeout, $validator, serviceData, serviceAuth, serviceGlobal,serviceSync) {
        if(!serviceAuth.isAuthenticated()){
			$location.path('/login');
			return false;
		}
        
		$scope.isProcessing = false;
        //$scope.minDate = $filter('date')(Date.now(),'yyyy-MM-dd'); 
        
		var session = serviceAuth.getSession();
        if(!serviceGlobal.createFile.fileNr){
            $scope.isProcessing = true;
            serviceSync.createFile().then(function(response){
                if (angular.isArray(response) && response.indexOf('Unautharized Request') != -1) {
                    serviceAuth.logout();
                    $location.path('/login');
                }
                $scope.suppliers = serviceGlobal.suppliers;
                $scope.units = serviceGlobal.units;
                $scope.currencies = serviceGlobal.currencies;
                $scope.fileNr = serviceGlobal.createFile.fileNr;
                
                $scope.goodsData = serviceGlobal.goodsPage.goodsData ? serviceGlobal.goodsPage.goodsData : [{}];
                $scope.goodsForm = serviceGlobal.goodsPage.goodsForm ? serviceGlobal.goodsPage.goodsForm : [1];
                $scope.isProcessing = false;
                
            },function(error){
                if (angular.isArray(error) && error.indexOf('Unautharized Request') != -1) {
                    serviceAuth.logout();
                    $location.path('/login');
                }
                console.log(error);
                $scope.isProcessing = false;
                $scope.commonFileError = 'An error occured. Please try again.';
            });
        }else{
            $scope.suppliers = serviceGlobal.suppliers;
            $scope.units = serviceGlobal.units;
            $scope.currencies = serviceGlobal.currencies;
            $scope.fileNr = serviceGlobal.createFile.fileNr;
            
            $scope.goodsData = serviceGlobal.goodsPage.goodsData ? serviceGlobal.goodsPage.goodsData : [{}];
            $scope.goodsForm = serviceGlobal.goodsPage.goodsForm ? serviceGlobal.goodsPage.goodsForm : [1];
        }
		$scope.checkValue = function(selected, index){
            if ($scope.suppliers.indexOf(selected) == -1) {
                $scope.goodsData[index].supplier = '';
            }
        }
        
        $scope.$on('setFile', function(e,data) {  
            $scope.fileNr = serviceGlobal.createFile.fileNr;
            if(!$scope.$$phase){ $scope.$apply(); }
        });
        
		$scope.addGoods = function(){
            $scope.goodsForm.unshift($scope.goodsForm.length + 1);	
			$scope.goodsData.unshift({});
            
            $validator.reset($scope, $scope.goodsData[0].supplier);
            $validator.reset($scope, $scope.goodsData[0].description);
            $validator.reset($scope, $scope.goodsData[0].cargo_date);
            
            $timeout(function () {$('#supplier_0 .ui-select-search').click();});
        }
		$scope.removeGoods = function($index){
			$scope.goodsForm.splice($index, 1);
			$scope.goodsData.splice($index, 1);
            $timeout(function () {$('#supplier_0 .ui-select-search').click();});
        }
		
        $scope.open = function($event,$index){
            $event.preventDefault();
            $event.stopPropagation();
            
            $scope.goodsData[$index].Opened = true;
        }
        
        
		$scope.next = function(){
			$scope.isProcessing = true;
			serviceGlobal.goodsPage.goodsData = $scope.goodsData;
			serviceGlobal.goodsPage.goodsForm = $scope.goodsForm;
			serviceGlobal.progress.completedStep = 1;
			serviceGlobal.progress.progressStep = 2;
            
			if(serviceGlobal.containerTypes.length == 0){
				serviceData.get('containertypes').then(
			        function (res) {
						$scope.isProcessing = false;
						if(angular.isArray(res) && res.length > 0){
							serviceGlobal.containerTypes = res;
                            serviceGlobal.saveData();
							$location.path('/container');
						}else{
							$scope.commonFileError = 'No Container found';
						}  
			    	},function (error) {
			    		$scope.isProcessing = false;
						$scope.commonFileError = 'An error occured. Please try again.';
	                });	
			}else{
				$location.path('/container');
				$scope.isProcessing = false;	
			}
			
		}
		$timeout(function () {$('#supplier_0 .ui-select-search').click();},1000);
	 }])
     
     /**
     * @ngdoc
     * @name fvg.controller:#containerController
     * @url '/'
     * @template container.html
     * @public
     * @description Second Step, Provide details about goods container.
    */
	 .controller('containerController',['$rootScope','$scope', '$location', 'serviceData', 'serviceAuth', 'serviceGlobal', function ($rootScope, $scope, $location, serviceData, serviceAuth, serviceGlobal) {
        if(!serviceAuth.isAuthenticated()){
			$location.path('/login');
			return false;
		}
        
        if(serviceGlobal.progress.completedStep < 1){
			$location.path('/goods');
		}
		
        
		$scope.containerTypes = serviceGlobal.containerTypes;
		$scope.fileNr = serviceGlobal.createFile.fileNr;
		$scope.goodsForm = serviceGlobal.goodsPage.goodsForm;
        $scope.containerData = [];
        $scope.containerForm = [];
        $scope.isProcessing = false;
        
        $scope.containerLoad = serviceGlobal.containerPage.containerLoad ? serviceGlobal.containerPage.containerLoad : 'FCL';
		$scope.containerData = serviceGlobal.containerPage.containerData ? serviceGlobal.containerPage.containerData : [{typeOfContainer : $scope.containerTypes[0], amount : 1}];
        $scope.containerForm = serviceGlobal.containerPage.containerForm ? serviceGlobal.containerPage.containerForm : [1];	
		
		//serviceGlobal.containerPage.containerForm = serviceGlobal.goodsPage.goodsForm;
 		
        $scope.checkValue = function(selected, index){
            if ($scope.containerTypes.indexOf(selected) == -1) {
                $scope.containerData[index].typeOfContainer = '';
                
                
            }
        }
        
        $scope.checkContainerLoad = function(){
            if ($scope.containerLoad == 'LCL') {
                $scope.containerData = [{typeOfContainer : $scope.containerTypes[0], amount : 1}];
                $scope.containerForm = [1];
                
            }else if ($scope.containerLoad == 'NC') {
                $scope.containerData = [];
                $scope.containerForm = [];	
            }else if ($scope.containerLoad == 'FCL' && $scope.containerForm.length == 0) {
                $scope.containerData = [{typeOfContainer : $scope.containerTypes[0], amount : 1}];
                $scope.containerForm = [1];	
            }
            
        }
         $scope.disableChoices = function(diff) {
            
          var i, item, 
              newArray = [],
              exception = Array.prototype.slice.call(arguments, 2),array = $scope.containerData;
    
          for(i = 0; i < array.length; i++) {
            item = array[i].typeOfContainer;
            if(diff == item) {
              return true;
            }
          }
    
          return false;
    
        }
        
		$scope.addContainer = function(){
			$scope.containerForm.unshift($scope.containerForm.length + 1);	
			$scope.containerData.unshift({typeOfContainer : [], amount : 1});
		}
		$scope.removeContainer = function($index){
			$scope.containerForm.splice($index, 1);
			$scope.containerData.splice($index, 1);
		}
		
        $scope.$watch('containerData', function(){
            serviceGlobal.containerPage.containerLoad = $scope.containerLoad;
			serviceGlobal.containerPage.containerData = $scope.containerData;
			serviceGlobal.containerPage.containerForm = $scope.containerForm;
        });
        
        
        function hasDuplicates(array) {
            var valuesSoFar = [];
            for (var i = 0; i < array.length; ++i) {
                var value = array[i];
                if (valuesSoFar.indexOf(value) !== -1) {
                    return true;
                }
                valuesSoFar.push(value);
            }
            return false;
        }

		$scope.next = function(){
            var selectedContainer = [];
            var error = false;
            
            angular.forEach($scope.containerData, function(value,key){
                selectedContainer.push(value.typeOfContainer[0]);
            });
            
            if (!hasDuplicates(selectedContainer) || selectedContainer.length == 0) {
                $scope.isProcessing = true;
                serviceGlobal.containerPage.containerLoad = $scope.containerLoad;
                serviceGlobal.containerPage.containerData = $scope.containerData;
                serviceGlobal.containerPage.containerForm = $scope.containerForm;
                serviceGlobal.progress.completedStep = 2;
                serviceGlobal.progress.progressStep = 3;
                
                if(serviceGlobal.ports.length == 0){
                    serviceData.get('ports').then(
                        function (res) {
                            $scope.isProcessing = false;
                            if(angular.isArray(res) && res.length > 0){
                                serviceGlobal.ports = res;
                                $location.path('/transport');
                            }else{
                                $scope.commonFileError =  'No transport port found';
                            }  
                        },function (error) {
                            $scope.isProcessing = false;
                            $scope.commonFileError =  'An error occured. Please try again.';
                        });	
                }else{
                    $location.path('/transport');
                    $scope.isProcessing = false;	
                }
            }else{
                alert('Please select different containers');
            }
		}
		
     }])
     
     /**
     * @ngdoc
     * @name fvg.controller:#transportController
     * @url '/'
     * @template transport.html
     * @public
     * @description third Step, Provide details about transport.
    */
	 .controller('transportController',['$rootScope','$scope', '$location', '$timeout', 'serviceAuth', 'serviceGlobal', function ($rootScope, $scope, $location, $timeout, serviceAuth, serviceGlobal) {
        if(!serviceAuth.isAuthenticated()){
			$location.path('/login');
			return false;
		}
        if(serviceGlobal.progress.completedStep < 2){
			$location.path('/container');
		}
		
		$scope.ports = serviceGlobal.ports;
		$scope.suppliers = serviceGlobal.suppliers;
		$scope.fileNr = serviceGlobal.createFile.fileNr;
		$scope.checkbox = serviceGlobal.transportPage.checkbox || [];
        $scope.blMap = serviceGlobal.transportPage.blMap || [];
        
		$scope.goodsData = serviceGlobal.goodsPage.goodsData;
		$scope.goodsForm = serviceGlobal.goodsPage.goodsForm;
		$scope.transportData = serviceGlobal.transportPage.transportData ? serviceGlobal.transportPage.transportData : {landingPort : [], destinationPort : [], bl : [{}]};
		
        $scope.checkLandingPort = function(selected){
            if ($scope.ports.indexOf(selected) == -1) {
                $scope.transportData.landingPort = '';
            }
        }
        
        $scope.checkDestinationPort = function(selected){
            if ($scope.ports.indexOf(selected) == -1) {
                $scope.transportData.destinationPort = '';
            }
        }
        
        $scope.checkValue = function(selected, index, type){
            if ($scope.suppliers.indexOf(selected) == -1) {
                $scope.transportData.bl[index][type] = '';
                
                
            }
        }
        
        $scope.addBL = function(){
			$scope.transportData.bl.unshift({});
            angular.forEach($scope.blMap, function(value, key){
                if(value){
                    $scope.blMap[key] = (value + 1);
                }
            });
            $timeout(function () {$('#shipper_0 .ui-select-search').click();});
		}
		$scope.removeBL = function($index){
			$scope.transportData.bl.splice($index, 1);
            angular.forEach($scope.blMap, function(value, key){
                if(value && value > 1){
                    $scope.blMap[key] = (value - 1);
                }
            });
            $timeout(function () {$('#shipper_0 .ui-select-search').click();});
		}
        
        $scope.addMapIndex = function(transportIndex, cargoIndex){
            //console.log(cargoIndex, $scope.blMap);
            if($scope.blMap[cargoIndex]){
                if ($scope.blMap[cargoIndex] == (transportIndex + 1)) {
                    $scope.blMap[cargoIndex] = false;
                    $scope.checkbox[cargoIndex] = false;
                }
                
            }else{
                $scope.blMap[cargoIndex] = (transportIndex + 1);
            }
            //console.log(cargoIndex, $scope.blMap);
            $scope.transportData.blMap = $scope.blMap;
            
        }
        
        $scope.$watch('transportData', function(){
            serviceGlobal.transportPage.transportData = $scope.transportData;
            serviceGlobal.transportPage.checkbox = $scope.checkbox;
            serviceGlobal.transportPage.blMap = $scope.blMap;
        });
        
		$scope.next = function(){
            var isError = false;
            for(var i = 1; i <= $scope.transportData.bl.length; i++){
                if($scope.blMap.indexOf(i) == -1){
                    $scope.commonFileError =  'Invalid Bill landing details. Please re-check';
                    isError = true;
                    break;
                } 
            };
            
            if ($('form input[type=checkbox]:visible:checked').size() !=  $('form input[type=checkbox]:visible').size()) {
                $scope.commonFileError =  'Invalid Bill landing details. Please re-check';
                isError = true;
            }
            
            if (!isError) {
                //console.log($scope.checkbox, $scope.transportData, $scope.blMap);
                serviceGlobal.transportPage.transportData = $scope.transportData;
                serviceGlobal.transportPage.checkbox = $scope.checkbox;
                serviceGlobal.transportPage.blMap = $scope.blMap;
                
                //serviceGlobal.transportPage.transportForm = $scope.transportForm;
                serviceGlobal.progress.completedStep = 3;
                serviceGlobal.progress.progressStep = 4;
                $location.path('/summary');        
            }
        }
        $timeout(function () {$('#loading_port .ui-select-search').click();});
     }])
	 
	 /**
     * @ngdoc
     * @name fvg.controller:#summaryController
     * @url '/'
     * @template summary.html
     * @public
     * @description fourth and last Step, Give Sumamary of all three steps.
    */
	 .controller('summaryController',['$rootScope','$scope', '$location', 'serviceAuth', 'serviceGlobal', 'serviceData', function ($rootScope, $scope, $location, serviceAuth, serviceGlobal, serviceData) {
        if(!serviceAuth.isAuthenticated()){
			$location.path('/login');
			return false;
		}
        if(serviceGlobal.progress.completedStep < 3){
			$location.path('/transport');
		}
        
        $scope.isProcessing = false;
        $scope.showSavePopup = false;
		$scope.fileNr = serviceGlobal.createFile.fileNr;
		$scope.goodsData = serviceGlobal.goodsPage.goodsData;
		$scope.goodsForm = serviceGlobal.goodsPage.goodsForm;
        
        $scope.containerLoad = serviceGlobal.containerPage.containerLoad;
		$scope.containerData = serviceGlobal.containerPage.containerData;
        $scope.containerForm = serviceGlobal.containerPage.containerForm;
		$scope.transportData = serviceGlobal.transportPage.transportData;
        
        
        $scope.confirm = function(){
            $scope.showSavePopup = true;    
        }
        $scope.closeSavePopup = function(){
            $scope.showSavePopup = false;    
        }
        
        $scope.saveFile = function(){
            $scope.showSavePopup = false;
            $scope.isProcessing = true;
            var fileId = serviceGlobal.createFile.id;
            
            var fileDetails = {
                
                "id":fileId,
                "financialStatus": serviceGlobal.createFile.financialStatus,
                "fileNr": serviceGlobal.createFile.fileNr,
                "jaguarNr": serviceGlobal.createFile.jaguarNr,
                "fileInfo": serviceGlobal.createFile.fileInfo,
                "clientRef": serviceGlobal.createFile.clientRef,
                "owner": serviceGlobal.createFile.owner,
                "status": {
                    "fileStatus": serviceGlobal.createFile.status.fileStatus
                },
                "client": {
                    "id": serviceGlobal.createFile.client.id
                },
                "goods" : [],
                "containers": []
            };
            
            
            angular.forEach($scope.goodsData, function(value,key){
                var goodsNode = {
                    "fileId": fileId,
                    "description": value.description ? value.description : "",
                    "volume": value.volume ? value.volume : 0.0,
                    "weight": value.weight ? value.weight : 0.0,
                    "weightNet": value.net_weight ? value.net_weight : 0.0,
                    "value": value.cargo_value ? value.cargo_value : 0.0,
                    "quantity1": value.quantity ? value.quantity : 0.0,
                    "quantity2": 0.0,
                    "currency": value.currency ? value.currency.currency : "",
                    "taricCode": "",
                    "info1": "",
                    "info2": "",
                    "info3": "",
                    "hsCode": value.hs_code ? value.hs_code : "",
                    "goodsReadyDate": value.cargo_date,
                    "ponr": value.po_number ? value.po_number : "",
                    "supplier": {
                        "id": value.supplier[0]
                    }
                };
                fileDetails.goods.push(goodsNode);
            });
            
            if ($scope.containerLoad != 'NC') {
                angular.forEach($scope.containerData, function(value,key){
                    var containerNode = {
                        "fileId": fileId,
                        "containerType": value.typeOfContainer[0],
                        "sequenceNr": 1,
                        "containerLoad": $scope.containerLoad,
                        "containerNr": ""
                    };
                    fileDetails.containers.push(containerNode);
                });   
            }
            
            serviceData.send('submit', fileDetails).then(function (res) {
                $scope.isProcessing = false;
                if(angular.isArray(res) && res.length > 0){
                    serviceGlobal.containerTypes = res;
                    $location.path('/container');
                }else{
                    $scope.commonFileError = 'No Container found';
                }  
            },function (error) {
                $scope.isProcessing = false;
                $scope.commonFileError = 'An error occured. Please try again.';
            });	
            /*alert('Pending');*/
        }
     
	 }]);
    