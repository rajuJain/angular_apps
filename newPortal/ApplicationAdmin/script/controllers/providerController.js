'use strict';

/* Home Controller Logic*/

angular.module('patientPortalWorkList')

    /**
     * @ngdoc
     * @name PatientPortal.controller:#homeController
     * @url '/'
     * @template home.html
     * @public
     * @description Provide home page interface and will be intial stage of application.
    */

    .controller('providerController', ['$http', '$scope', '$location', '$cookies', '$timeout', 'serviceGlobal', 'serviceAuth', 'serviceData', function ($http, $scope, $location, $cookies, $timeout, serviceGlobal, serviceAuth, serviceData) {
        if (!serviceAuth.isAuthenticated()) {
            $location.path("/login");
        }
        
        var session = serviceAuth.getSession();
        var pageType = 'Provider';
        $scope.pageType = 'Provider';
        if($location.path() == '/admin'){
            if (session.Type != 'Admin') {
                $location.path('notFound');
                return false;
            }
            pageType = 'Admin';
            $scope.pageType = 'Admin';
        }
        
        
        var timer = setTimeout(function () { }, 20000);
        $scope.provider = {};
        $scope.global_process = '';
        $scope.error = '';
        $scope.success = '';
        $scope.searchData = {};
        $scope.updateEmailData = {};
        $scope.isProcessing = false;
        var gridData = new kendo.data.DataSource({
            serverPaging: true,
            serverSorting: false,
            schema: {
                data: function (response) {
                    if (!response.error_code && response.response_code == 200) {
                        if (response.result.length === 0) {
                            $scope.success = '';
                            $scope.error = 'No Records Found';
                            timer = setTimeout(function () { $scope.error = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 20000);
                            return [];
                        }
                        //console.log(response);
                        timer = setTimeout(function () { $scope.success = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 20000);
                        return response.result;
                    } else {
                        if (response.error_text) {
                            $scope.success = '';
                            $scope.error = response.error_text;
                            timer = setTimeout(function () { $scope.error = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 20000);
                        }
                        return [];
                    }
                }
                ,
                total: function (response) {
                    return (response && !response.error_code && response.response_code == 200) ? response.result.length : 0;
                },
            },
            pageSize: 10,
            batch: false,
            transport: {
                read: function (e) {
                    
                    $scope.isProcessing = 'Searching...';
                    $scope.searchData.skip = e.data.skip;
                    $scope.searchData.take = e.data.take;
                    $scope.searchData.orgId = session.orgId;
                    if (timer) { clearTimeout(timer); }
                    var service = 'providerList';
                    if (pageType == 'Admin') {
                        service = 'adminList';
                    }
                    serviceData.send(service, $scope.searchData).then(function (res) {
                        $scope.isDisabled = false;
                        e.success(res);
                        $scope.isProcessing = false;
                    }, function (err) {
                        $scope.isProcessing = false;
                        $scope.success = '';
                        $scope.error = 'An error occured. Either No records found or have some server error';
                        if (timer) { clearTimeout(timer); }
                        timer = setTimeout(function () { $scope.error = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 20000);
                    });
                }
            }
        });

        $scope.providerGridOptions = {
            pageable: true,
            scrollable: false,
            filterable: false,
            dataSource: gridData,
            dataBound: function (e) {
            },
            sortable: false,
            selectable: "row",
            change: function (e) {
                $scope.selectedProvider = '';
                $scope.error = '';
                var selectedRows = this.select();
                var dataItem = this.dataItem(selectedRows[0]);
            },
            columns: [
                    { field: "Name", title: "Name", width: "25%", template: "#= lastName + '  ' + firstName #" },
                    { field: "Gender", title: "Gender", template: "#= gender #", width: "20%" },
                    { field: "Email", title: "Email", width: "30%", template: "#= username #" },
                    {
                        title: "Action", width: "10%", template:
                          "<a href='javascript:void(0);' ng-click='editProvider(dataItem)'> " +
                          "<img src='script/vendor/theme/Images/edit-icon.png' title='Edit' /></a>  " +
                          "<a href='javascript:void(0);' ng-if=dataItem.userStatus=='A';  ng-click='askConfirmation(dataItem)'> " +
                          "<img class='p-lr20' src='script/vendor/theme/Images/deactive-icon.png' title='Inactive' /></a> " +
                          "<a href='javascript:void(0);' ng-if=dataItem.userStatus=='I'; ng-click='askConfirmation(dataItem)'> " +
                             " <img class='p-lr20' src='script/vendor/theme/Images/active-icon.png' title='Active' /></a>" 
                    }]
        };

        $scope.searchProvider = function () {
            console.log("Search Controller");
            $scope.error = '';
            $scope.success = '';
            //$scope.isProcessing = 'Searching...';
            if ($scope.providerGridOptions.dataSource.page(1)) {
                $scope.providerGridOptions.dataSource.page(1).read();
            }
        }

        $scope.refreshProviderList = function () {
            if (timer) { clearTimeout(timer); }
            //$scope.isProcessing = 'Searching...';
            $scope.error = '';
            $scope.success = '';
            $scope.searchData.SearchText = '';
            if ($scope.providerGridOptions.dataSource.page(1)) {
                $scope.providerGridOptions.dataSource.page(1).read();
            }
        }

        $scope.show = false;
        $scope.editProvider = function (provider) {
            var questionData = '';
            angular.forEach(provider.Question, function (element, key) {
                if (serviceGlobal.securityQues_es.indexOf(element.Question) != -1) {
                    questionData = serviceGlobal.securityQues_en[serviceGlobal.securityQues_es.indexOf(element.Question)];
                } else {
                    questionData = element.Question;
                }
                element.Question = questionData;
            });
            if (timer) { clearTimeout(timer); }
            $scope.provider = {};
            $scope.providerError = '';
            $scope.show = true;
            $scope.success = '';
            $scope.updateEmailData = {};
            $scope.providerError = '';
            provider.email = provider.username;
            provider.userId = provider.id;
            console.log(provider);
            $scope.provider = provider;
            $scope.isProcessing = false;
            $(".has-error").removeClass('has-error');
            $('#createProvider').click();
        }

        $scope.askConfirmation = function (provider) {
            if (timer) { clearTimeout(timer); }
            $scope.providerError = '';
            $scope.error = '';
            $scope.success = '';
            $scope.isProcessing = false;
            $("#updateStatusNote").click();
            if (provider.userStatus == 'I') {
                $scope.updateStatusConfirmationMsg = 'Are you sure you want to make this provider active in the system? ';
            } else {
                $scope.updateStatusConfirmationMsg = 'Are you sure you want to deactivate this provider in the system?';
            }

            $("#confirmUpdateStatus").unbind("click").click(function () {
                $scope.updateProviderStatus(provider);
            });
        }

        $scope.updateProviderStatus = function (provider) {
            if (timer) { clearTimeout(timer); }
            $scope.isProcessing = 'Please wait...';
            var status = '';
            if (provider.userStatus == 'I') {
                status = 'A';
            }else{
                status = 'I';
            }
            if (provider.id) {
                $('#updateStatusMsg').trigger('reveal:close');
                var service = 'updateProvider';
                if (pageType == 'Admin') {
                    service = 'updateAdmin';
                }
                serviceData.send(service, {userId : provider.id, email : provider.username, userStatus : status}).then(function (res) {
                    if (!res.error_text && res.response_code == 200) {
                        $scope.success = res.success;
                        $scope.error = '';
                        if ($scope.providerGridOptions.dataSource.page(1)) {
                            $scope.providerGridOptions.dataSource.page(1).read();
                        }
                    } else if (res.error_text) {
                        $scope.isProcessing = false;
                        $scope.error = res.error_text;
                        timer = setTimeout(function () { $scope.error = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 20000);
                    }

                }, function (err) {
                    $scope.isProcessing = false;
                    if (err.error_text) {
                        $scope.error = err.error_text;
                        timer = setTimeout(function () { $scope.error = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 20000);
                    } else {
                        $scope.error = 'An error occured. Either No such user exists or have some server error';
                        timer = setTimeout(function () { $scope.error = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 20000);
                    }
                });
            }
        }

        $scope.closePopup = function () {
            $scope.show = false;
            $('#providerData').trigger('reveal:close');
            //$scope.provider = {};
        }

        $scope.show = false;
        $scope.addProvider = function () {
            if (timer) { clearTimeout(timer); }
            $scope.providerError = '';
            $scope.error = '';
            $scope.success = '';
            $scope.isProcessing = false;
            $scope.show = true;
            $scope.provider = {};
            $('#createProvider').click();
        }

        $scope.createProvider = function (provider) {
            if (timer) { clearTimeout(timer); }
            $scope.providerError = '';
            $scope.success = '';
            $scope.isProcessing = true;
            
            if (!provider.id) {
                var serviceName = 'addProvider';
                if (pageType == 'Admin') {
                    serviceName = 'addAdmin';
                }
                
                if (provider.password != provider.confirmPassword) {
                    $scope.providerError = 'Password does not match.';
                    $scope.isProcessing = false;
                    return false;
                } else {
                    $scope.providerError = '';
                }
                provider.orgId = session.orgId;
                ///provider.location = session.location;
                
            }else{
                var serviceName = 'updateProvider';
                if (pageType == 'Admin') {
                    serviceName = 'updateAdmin';
                }
                
            }
            serviceData.send(serviceName, provider).then(function (res) {
                if (!res.error_text && res.response_code == 200) {
                    $scope.success = res.success;
                    if ($scope.providerGridOptions.dataSource.page(1)) {
                        $scope.providerGridOptions.dataSource.page(1).read();
                    }
                    $scope.provider = {};
                    $('#providerData').trigger('reveal:close');
                    $scope.show = false;
                    $scope.isProcessing = false;
                } else if (res.error_text) {
                    $scope.providerError = res.error_text;
                    $scope.isProcessing = false;
                    timer = setTimeout(function () { $scope.providerError = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 20000);
                }
            }, function (err) {
                $scope.isProcessing = false;
                if (err.Message) {
                    $scope.providerError = err.Message;
                } else {
                    $scope.providerError = 'An error occured. Either user already exists or have some server error';
                }
                timer = setTimeout(function () { $scope.providerError = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 20000);
            });
        }
    }]);