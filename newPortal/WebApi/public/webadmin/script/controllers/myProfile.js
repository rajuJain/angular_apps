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
    .controller('myProfileController', ['$scope', '$location', 'serviceAuth', 'serviceGlobal', 'serviceData', function ($scope, $location, serviceAuth, serviceGlobal, serviceData) {
            
            var profileData = serviceAuth.getSession();
            
            $scope.userData = {
                'first_name' : profileData.FIRST_NAME,
                'last_name' : profileData.LAST_NAME,
                'email' : profileData.EMAIL
            }            
        
            $scope.updateProfile = function(userData){
                serviceData.send('updateProfile', userData).then(function(response){
                        if (response.response_code==200) {
                                $scope.error = '';
                                $scope.success = 'Profile successfully updated.'
						}else if (response.error_code == 300){
							alert(response.error_text);
								serviceAuth.logout();
                     			$scope.isAdminLoggedIn = false;	
								$location.path('/login');
                        }else{
                                $scope.error = (response.error_text) ? response.error_text : 'Profile not updated. Please try again.';
                                $scope.success = ''
                        }
                });
            }
    }])


    .controller('generalSettingsController', ['$scope', '$location', 'serviceAuth', 'serviceGlobal', 'serviceData', function ($scope, $location, serviceAuth, serviceGlobal, serviceData) {
		  serviceData.get('getSettings',{key:"goal_popup"}).then(function (response) {
            if (response.error_code == 300){
				alert(response.error_text);
					serviceAuth.logout();
					$scope.isAdminLoggedIn = false;	
					$location.path('/login');
			}
            $scope.goal = response.result;        
			console.log($scope.goal);
		});
        $scope.updateGoal = function(goal) {
            serviceData.send('updateSettings', goal).then(function (response){
                    if (response.response_code==200) {
                        console.log("Success",response);
                        $(".showSuccess").fadeIn(1000);
					}else if (response.error_code == 300){
							alert(response.error_text);
								serviceAuth.logout();
                     			$scope.isAdminLoggedIn = false;	
								$location.path('/login');
                    }else{
                        alert("Please try again");        
                    }
            });
        }
    }]);

