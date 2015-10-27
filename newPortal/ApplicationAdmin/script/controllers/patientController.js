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

    .controller('patientController', ['$http', '$scope', '$location', '$cookies', '$timeout', 'serviceGlobal', 'serviceAuth', 'serviceData', function ($http, $scope, $location, $cookies, $timeout, serviceGlobal, serviceAuth, serviceData) {
        if (!serviceAuth.isAuthenticated()) {
            $location.path("/login");
        }
        
        var session = serviceAuth.getSession();
        var timer = setTimeout(function () { }, 10000);
        $scope.patient = {};
        $scope.global_process = '';
        $scope.error = '';
        $scope.success = '';
        $scope.searchData = {};
        $scope.updateEmailData = {};
        $scope.isProcessing = false;
        
        serviceData.send('orgProviderList', {orgId : session.orgId}).then(function (res) {
            if (!res.error_code && res.response_code == 200) {
                $scope.providerList = res.result;    
            }else{
                console.log('failure in provider list');
                console.log(res);
            }
            
        }, function (err) {
            console.log('Error in provider list');
            console.log(err);
        });

        
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
                    serviceData.send('patientList', $scope.searchData).then(function (res) {
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

        $scope.patientGridOptions = {
            pageable: true,
            scrollable: false,
            filterable: false,
            dataSource: gridData,
            dataBound: function (e) {
            },
            sortable: false,
            selectable: "row",
            change: function (e) {
                $scope.selectedPatient = '';
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
                          "<a href='javascript:void(0);' ng-click='editPatient(dataItem)'> " +
                          "<img src='script/vendor/theme/Images/edit-icon.png' title='Edit' /></a>  " +
                          "<a href='javascript:void(0);' ng-if=dataItem.userStatus=='A';  ng-click='askConfirmation(dataItem)'> " +
                          "<img class='p-lr20' src='script/vendor/theme/Images/deactive-icon.png' title='Inactive' /></a> " +
                          "<a href='javascript:void(0);' ng-if=dataItem.userStatus=='I'; ng-click='askConfirmation(dataItem)'> " +
                          " <img class='p-lr20' src='script/vendor/theme/Images/active-icon.png' title='Active' /></a>" 
                    }]
        };

        $scope.searchPatient = function () {
            $scope.error = '';
            $scope.success = '';
            //$scope.isProcessing = 'Searching...';
            if ($scope.patientGridOptions.dataSource.page(1)) {
                $scope.patientGridOptions.dataSource.page(1).read();
            }
        }

        $scope.refreshPatientList = function () {
            if (timer) { clearTimeout(timer); }
            //$scope.isProcessing = 'Searching...';
            $scope.error = '';
            $scope.success = '';
            $scope.searchData.SearchText = '';
            if ($scope.patientGridOptions.dataSource.page(1)) {
                $scope.patientGridOptions.dataSource.page(1).read();
            }
        }

        $scope.show = false;
        $scope.editPatient = function (patient) {
            var questionData = '';
            angular.forEach(patient.Question, function (element, key) {
                if (serviceGlobal.securityQues_es.indexOf(element.Question) != -1) {
                    questionData = serviceGlobal.securityQues_en[serviceGlobal.securityQues_es.indexOf(element.Question)];
                } else {
                    questionData = element.Question;
                }
                element.Question = questionData;
            });
            if (timer) { clearTimeout(timer); }
            $scope.patient = {};
            $scope.patientError = '';
            $scope.show = true;
            $scope.success = '';
            $scope.updateEmailData = {};
            $scope.patientError = '';
            patient.email = patient.username;
            patient.userId = patient.id;
            
            $scope.patient = patient;
            $scope.isProcessing = false;
            $(".has-error").removeClass('has-error');
            $('#createPatient').click();
        }

        $scope.askConfirmation = function (patient) {
            if (timer) { clearTimeout(timer); }
            $scope.patientError = '';
            $scope.error = '';
            $scope.success = '';
            $scope.isProcessing = false;
            $("#updateStatusNote").click();
            if (patient.userStatus == 'I') {
                $scope.updateStatusConfirmationMsg = 'Are you sure you want to make this patient active in the system? ';
            } else {
                $scope.updateStatusConfirmationMsg = 'Are you sure you want to deactivate this patient in the system?';
            }

            $("#confirmUpdateStatus").unbind("click").click(function () {
                $scope.updatePatientStatus(patient);
            });
        }

        $scope.updatePatientStatus = function (patient) {
            if (timer) { clearTimeout(timer); }
            $scope.isProcessing = 'Please wait...';
            var status = '';
            if (patient.userStatus == 'I') {
                status = 'A';
            }else{
                status = 'I';
            }
            if (patient.id) {
                $('#updateStatusMsg').trigger('reveal:close');
                serviceData.send('updatePatient', {userId : patient.id, email : patient.username, userStatus : status}).then(function (res) {
                    if (!res.error_text && res.response_code == 200) {
                        $scope.success = res.success;
                        $scope.error = '';
                        if ($scope.patientGridOptions.dataSource.page(1)) {
                            $scope.patientGridOptions.dataSource.page(1).read();
                        }
                    } else if (res.error_text) {
                        $scope.isProcessing = false;
                        $scope.error = res.error_text;
                        timer = setTimeout(function () { $scope.error = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 10000);
                    }

                }, function (err) {
                    $scope.isProcessing = false;
                    if (err.error_text) {
                        $scope.error = err.error_text;
                        timer = setTimeout(function () { $scope.error = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 10000);
                    } else {
                        $scope.error = 'An error occured. Either No such user exists or have some server error';
                        timer = setTimeout(function () { $scope.error = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 10000);
                    }
                });
            }
        }

        $scope.closePopup = function () {
            $scope.show = false;
            $('#patientData').trigger('reveal:close');
            //$scope.patient = {};
        }

        $scope.show = false;
        $scope.addPatient = function () {
            if (timer) { clearTimeout(timer); }
            $scope.patientError = '';
            $scope.error = '';
            $scope.success = '';
            $scope.isProcessing = false;
            $scope.show = true;
            $scope.patient = {};
            $('#createPatient').click();
        }

        $scope.createPatient = function (patient) {
            if (timer) { clearTimeout(timer); }
            $scope.patientError = '';
            $scope.success = '';
            $scope.isProcessing = true;
            
            if (!patient.id) {
                var serviceName = 'addPatient';
                if (patient.password != patient.confirmPassword) {
                    $scope.patientError = 'Password does not match.';
                    $scope.isProcessing = false;
                    return false;
                } else {
                    $scope.patientError = '';
                }
                patient.orgId = session.orgId;
                patient.location = session.location;
                patient.providerId = patient.provider.userId;
            }else{
                var serviceName = 'updatePatient';
            }
            serviceData.send(serviceName, patient).then(function (res) {
                if (!res.error_text && res.response_code == 200) {
                    $scope.success = res.success;
                    if ($scope.patientGridOptions.dataSource.page(1)) {
                        $scope.patientGridOptions.dataSource.page(1).read();
                    }
                    $scope.patient = {};
                    $('#patientData').trigger('reveal:close');
                    $scope.show = false;
                    $scope.isProcessing = false;
                } else if (res.error_text) {
                    $scope.patientError = res.error_text;
                    $scope.isProcessing = false;
                    timer = setTimeout(function () { $scope.patientError = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 10000);
                }
            }, function (err) {
                $scope.isProcessing = false;
                if (err.Message) {
                    $scope.patientError = err.Message;
                } else {
                    $scope.patientError = 'An error occured. Either user already exists or have some server error';
                }
                timer = setTimeout(function () { $scope.patientError = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 10000);
            });
            
        }
    }]);