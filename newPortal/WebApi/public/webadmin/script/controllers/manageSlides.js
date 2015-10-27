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
    .controller('manageSlidesController', ['$scope', 'ngDialog', '$location',  'serviceAuth', 'serviceGlobal', 'serviceData', function ($scope, ngDialog, $location, serviceAuth, serviceGlobal, serviceData) 	{
        
            var getObjById = function(array, id){
                        for (var d = 0, len = array.length; d < len; d += 1) {
                                if (array[d].ID === id) {
                                    return array[d];
                                }
                        }
            }
            
                serviceData.get('getModules').then(function(response){
					if (response.error_code == 300){
						alert(response.error_text);
						serviceAuth.logout();
						$scope.isAdminLoggedIn = false;	
						$location.path('/login');	
					}
                    $scope.modules = response.data;
                    var moduleObj = (response.data && response.data[0]) ? response.data[0] : null;                     
                        if(moduleObj){
                                    $scope.getSlidesList(moduleObj);
                        }
                });
                
                serviceData.get('getTemplates').then(function(response){
                    $scope.templates =  response.data;                    
                });
        
                $scope.getSlidesList = function(moduleObj){
                        $scope.modulesObj = moduleObj
                        var module_id = (moduleObj && moduleObj.ID) ? moduleObj.ID  : null;
                        if (module_id) {
                                    serviceData.get('getSlides', {module_id: module_id}).then(function(response){
                                        if (response.response_code == 200 && response.data.length > 0) {
                                            $scope.myData = response.data;        
										}else if (response.error_code == 300){
											alert(response.error_text);
											serviceAuth.logout();
											$scope.isAdminLoggedIn = false;	
											$location.path('/login');										
                                        }else{
                                            $scope.myData = [];
                                        }
                                    });
                        }else{
                                  $scope.myData = [];  
                        }
                }
            
                $scope.myData = [];
                $scope.gridOptions = {
                    data: 'myData',
                    multiSelect: false,
                    columnDefs: [
                            {field: 'TITLE', displayName: 'Slide'}, 							
                            {field:'tbl_template', displayName:'Template', cellTemplate: '<div>{{row.entity.tbl_template[\'TITLE\']}}</div>'}, 
							{field: 'SEQ', displayName: 'Seq'}, 
							{field: 'STATUS', displayName: 'Status'}, 
                            {field: 'ID', displayName:'Action', cellTemplate: '<div><a href="javascript:void(0);" ng-click="ediSlides(row.entity)">Edit</a></div>' }
                        ]
                };
                
                $scope.addSlidesModel = function(){
                         ngDialog.open({
							   controller : function(){
								 $scope.slideData = {};
								 $scope.getContent = function(templateObj){
									 if(templateObj){
										 var template_id = templateObj.ID;
										 serviceData.get('getSingleSlide', {'template_id': template_id}).then(function(response){
												if (response.response_code==200 && response.data.length > 0) {
														$scope.slideData.content = response.data[0].CONTENT;
												}else{
													$scope.slideData.content = '';
												}
										});
									 }else{
											$scope.slideData.content = ''; 
									 }
								 }
							   },
								template: 'addSlideTemplate',
								scope: $scope
                        });
                }
                
                
                $scope.addSlide = function(slideData){
                        $scope.success = '';
                        $scope.error = '';
                        slideData.template_id = (slideData.template_id && slideData.template_id.ID) ? slideData.template_id.ID : null;
                        slideData.module_id = ($scope.modulesObj && $scope.modulesObj.ID) ? $scope.modulesObj.ID : null;
                        
                        serviceData.send('addSlide', slideData).then(function(response){
                                if (response.response_code==200) {
                                        $scope.getSlidesList($scope.modulesObj);
                                        ngDialog.close('ngdialog1');
                                        $scope.error = '';
                                        $scope.success = 'Slide added successfully.'
                                }else{
                                        $scope.error = 'Slide not added! Please try again.';
                                        $scope.success = ''
                                }
                        });
                }
                
                
                $scope.ediSlides = function(selectedSlidesData){
                        console.log(getObjById($scope.templates, selectedSlidesData.TEMPLATE_ID));
                        ngDialog.open({
                                controller: function(){
                                       var data = {
                                                'id':selectedSlidesData.ID,
                                                'title':selectedSlidesData.TITLE,
                                                'content':selectedSlidesData.CONTENT,
												'seq':selectedSlidesData.SEQ,
                                                'template_id': (selectedSlidesData.TEMPLATE_ID) ? getObjById($scope.templates, selectedSlidesData.TEMPLATE_ID) : null,
                                                'status': selectedSlidesData.STATUS
                                        };
                                        $scope.selectslideData = data;
										$scope.getContent = function(templateObj){
											 if(templateObj){
												 var template_id = templateObj.ID;
												 serviceData.get('getSingleSlide', {'template_id': template_id}).then(function(response){
														if (response.response_code==200 && response.data.length > 0) {
																$scope.selectslideData.content = response.data[0].CONTENT;
														}else{
															$scope.selectslideData.content = '';
														}
												});
											 }else{
												 $scope.selectslideData.content = '';
											 }
										 }
                                },
                                template: 'editSlidesTemplate',
                                scope: $scope
                        });
                }
                
                
                $scope.updateSlide = function(){
                        var selectedSlideData = $scope.selectslideData;
                        console.log(selectedSlideData);
                        $scope.success = '';
                        $scope.error = '';
                        selectedSlideData.template_id = (selectedSlideData.template_id && selectedSlideData.template_id.ID) ? selectedSlideData.template_id.ID : null;
                        selectedSlideData.module_id = ($scope.modulesObj && $scope.modulesObj.ID) ? $scope.modulesObj.ID : null;

                        serviceData.send('editSlide', selectedSlideData).then(function(response){
                                if (response.response_code==200) {
                                        $scope.getSlidesList($scope.modulesObj);
                                        ngDialog.close('ngdialog1');
                                        $scope.error = '';
                                        $scope.success = 'Slide updated successfully.'
                                }else{
                                        $scope.error = 'Slide not updated! Please try again.';
                                        $scope.success = ''
                                }
                        });
                }
    }]);


