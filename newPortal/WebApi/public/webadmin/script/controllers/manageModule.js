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
    .controller('manageModuleController', ['$scope', 'ngDialog', '$location', 'serviceAuth', 'serviceGlobal', 'serviceData', function ($scope, ngDialog, $location, serviceAuth, serviceGlobal, serviceData) 	{
        
                var getModuleList = function(){
                        serviceData.get('getModules').then(function(response){
                            if (response.response_code == 200 && response.data.length > 0) {
                                $scope.myData = response.data;
							}else if (response.error_code == 300){
								alert(response.error_text);
								serviceAuth.logout();
                     			$scope.isAdminLoggedIn = false;	
								$location.path('/login');
                            }
                        });
                }
                getModuleList();
                
                var getObjById = function(array, id){
                        for (var d = 0, len = array.length; d < len; d += 1) {
                                if (array[d].ID === id) {
                                    return array[d];
                                }
                        }
                }
                
                serviceData.get('getFinancialGoals').then(function(response){
                    $scope.goals = response.data;
                });
                
                serviceData.get('getFinancialValues').then(function(response){
                    $scope.values =  response.data;                    
                });
                
                
            
                $scope.myData = [];
                $scope.gridOptions = {
                    data: 'myData',
                    multiSelect: false,
                    columnDefs: [							
							{field: 'ICON', displayName:'', cellTemplate: '<div><img width="60" height="60" ng-if="row.entity.ICON!=null" ng-src="'+serviceData.config.currentEnvironment.server+'/uploads/{{row.entity.ICON}}" type="uploads/{{row.entity.ICON}}"/> </div>' },
                            {field: 'NAME', displayName: 'Name'}, 
                            {field:'DESCRIPTION', displayName:'Description'}, 
							{field:'SEQ', displayName:'Seq'}, 
							{field:'STATUS', displayName:'Status'}, 
                            {field: 'ID', displayName:'Action', cellTemplate: '<div><a href="javascript:void(0);" ng-click="editModules(row.entity)">Edit</a></div>' }
                        ]
                };
                
                $scope.addModuleModel = function(){
                         ngDialog.open({
                                controller: function($http){
                                        var photofile = '';
                                        $scope.file_changed = function(element) {
                                                $scope.$apply(function(scope) {
                                                    photofile = element.files[0];
                                                    /*var reader = new FileReader();
                                                    reader.onload = function(e) {
                                                      console.log(e.target.result);
                                                    };
                                                    reader.readAsDataURL(photofile);*/                                                    
                                                });
                                        };
                                        $scope.addModule = function(moduleData){
                                                $scope.success = '';
                                                $scope.error = '';
                                                moduleData.goal_id = (moduleData.goal_id && moduleData.goal_id.ID) ? moduleData.goal_id.ID : null;
                                                moduleData.value_id = (moduleData.value_id && moduleData.value_id.ID) ? moduleData.value_id.ID : null;
                                                var uploadUrl = serviceData.config.currentEnvironment.server+'/admin/addModule';
                                               
                                                var fd = new FormData();
                                                fd.append('file', photofile);                                                
                                                fd.append('description', moduleData.description);
                                                fd.append('goal_id', moduleData.goal_id);
                                                fd.append('id', moduleData.id);
                                                fd.append('name', moduleData.name);
                                                fd.append('status', moduleData.status);
												fd.append('seq', moduleData.seq);
                                                fd.append('value_id', moduleData.value_id);
                                                fd.append(serviceData.config.currentEnvironment.serverKeyName, serviceData.config.currentEnvironment.serverKeyValue);
                                                fd.append(serviceData.config.currentEnvironment.serverTokenName, serviceData.config.currentEnvironment.serverTokenValue);
                                                
                                                $http.post(uploadUrl, fd, {
                                                    transformRequest: angular.identity,
                                                    headers: {
                                                        'Content-Type': undefined,
                                                        'apikey' : serviceData.config.currentEnvironment.serverKeyValue,
                                                        'token' : serviceData.config.currentEnvironment.serverTokenValue
                                                    }
                                                }).success(function(response){
                                                        if (response.response_code==200) {
                                                                getModuleList();
                                                                ngDialog.close('ngdialog1');
                                                                $scope.error = '';
                                                                $scope.success = 'Successfully added module.'
                                                        }else{
                                                                $scope.error = 'Module not added! Please try again.';
                                                                $scope.success = ''
                                                        }
                                                }).error(function(error){
                                                    $scope.error = error;
                                                    $scope.success = '';
                                                });
                                        }
                                        
                                },
                                template: 'addModuleTemplate',
                                scope: $scope
                        });
                }
                
                
                
                $scope.editModules = function(selectedModuleData){
                        ngDialog.open({
                                controller: function($http){
                                       var data = {
                                                'id':selectedModuleData.ID,
                                                'name':selectedModuleData.NAME,
                                                'description': selectedModuleData.DESCRIPTION,
                                                'goal_id' : (selectedModuleData.GOAL_ID) ? getObjById($scope.goals, selectedModuleData.GOAL_ID) : null,
                                                'value_id': (selectedModuleData.VALUE_ID) ? getObjById($scope.values, selectedModuleData.VALUE_ID) : null,
												'seq': selectedModuleData.SEQ,
                                                'status': selectedModuleData.STATUS
                                        };
                                        var photofile = '';
                                        $scope.file_changed = function(element) {
                                                $scope.$apply(function(scope) {
                                                    photofile = element.files[0];
													//photofile = $(element).val();
													console.log($scope.selectModuleData.profile_pic);
                                                    /*var reader = new FileReader();
                                                    reader.onload = function(e) {
                                                      console.log(e.target.result);
                                                    };
                                                    reader.readAsDataURL(photofile);*/                                                    
                                                });
                                        };
                                       
                                        $scope.selectModuleData = data;
                                        
                                        $scope.updateModule = function(){
                                                $scope.success = '';
                                                $scope.error = '';
                                                
                                                var selectedModuleData = $scope.selectModuleData;                       
                                                selectedModuleData.goal_id = (selectedModuleData.goal_id && selectedModuleData.goal_id.ID) ? selectedModuleData.goal_id.ID : null;
                                                selectedModuleData.value_id = (selectedModuleData.value_id && selectedModuleData.value_id.ID) ? selectedModuleData.value_id.ID : null;
                                                var uploadUrl = serviceData.config.currentEnvironment.server+'/admin/editModule';
                                               	console.log(photofile);
												var finalAuditData = {'file' :  photofile, 'description' : selectedModuleData.description, 'goal_id' : selectedModuleData.goal_id, 'id' : selectedModuleData.id,
																		'name': selectedModuleData.name, 'status' : selectedModuleData.status, 'seq' : selectedModuleData.seq, 'value_id' : selectedModuleData.value_id
																		};
                                               var test = 'audit_json_data='+encodeURIComponent(JSON.stringify(finalAuditData));
                                                var fd = new FormData();
                                                fd.append('file', photofile);                                                
                                                fd.append('description', selectedModuleData.description);
                                                fd.append('goal_id', selectedModuleData.goal_id);
                                                fd.append('id', selectedModuleData.id);
                                                fd.append('name', selectedModuleData.name);
                                                fd.append('status', selectedModuleData.status);
												fd.append('seq', selectedModuleData.seq);
                                                fd.append('value_id', selectedModuleData.value_id);
                                                fd.append(serviceData.config.currentEnvironment.serverKeyName, serviceData.config.currentEnvironment.serverKeyValue);
                                                fd.append(serviceData.config.currentEnvironment.serverTokenName, serviceData.config.currentEnvironment.serverTokenValue);
                                                
                                                $http.post(uploadUrl, fd, {
                                                   transformRequest: angular.identity,
                                                    headers: {
                                                        'Content-Type': undefined,
														//'Content-Type': 'application/x-www-form-urlencoded',
                                                        'apikey' : serviceData.config.currentEnvironment.serverKeyValue,
                                                        'token' : serviceData.config.currentEnvironment.serverTokenValue
                                                    }
                                                }).success(function(response){
                                                    if (response.response_code==200) {
                                                            getModuleList();
                                                            ngDialog.close('ngdialog1');
                                                            $scope.error = '';
                                                            $scope.success = 'Successfully added module.';
                                                    }else{
                                                            $scope.error = 'Error are occurred! Please try again.';
                                                            $scope.success = '';
                                                    }
                                                }).error(function(error){
                                                    $scope.error = error;
                                                    $scope.success = '';
                                                });
                                        }
                                        
                                },
                                template: 'editModuleTemplate',
                                scope: $scope
                        });
                }
    }]);


