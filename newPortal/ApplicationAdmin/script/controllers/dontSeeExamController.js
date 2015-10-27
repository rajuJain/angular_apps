'use strict';

/* Home Controller Logic*/

angular.module('patientPortalWorkList')

    /**
     * @ngdoc
     * @name PatientPortal.controller:#dontSeeExamController
     * @url '/'
     * @template dontSeeExam.html
     * @public
     * @description Provide dont see exam page interface and will be intial stage of application.
    */

    .controller('dontSeeExamController', ['$http', '$scope', '$location', '$cookies', '$timeout', 'serviceGlobal', 'serviceAuth', 'serviceData', function ($http, $scope, $location, $cookies, $timeout, serviceGlobal, serviceAuth, serviceData) {
        if (!serviceAuth.isAuthenticated()) {
            $location.path("/login");
        }

        //Custom Code will remove in future start      
        var jdata =
            {
                "Error": "", "Status": 200, "data":
                [
                    { length: 10, User: { "dSeeId": "1", "FirstName": "A!", "LastName": "A" }, xLocation: "1", CreationDate: "1990" },
                    { length: 10, User: { "dSeeId": "2", "FirstName": "B!", "LastName": "B" }, xLocation: "002", CreationDate: "1990" }]

            }
        //Custom Code will remove in future End

        var timer = setTimeout(function () { }, 10000);
        var examQuestions = serviceGlobal.examQuestions;
        $scope.global_process = '';
        $scope.error = '';
        $scope.isSearching = false;
        $scope.isProcessing = false;
        $scope.isDisabled = false;
        $scope.patientDetails = '';
        $scope.searchKey = '';
        // $('#examInquiryList').hide();

        $scope.div = { ShowAll: true, SMIL: false, VR: false };
        $scope.userType = { ShowAll: true, Verified: false, Anonymous: false };
        $scope.completeFilterObj = {
            'PatientName': $scope.searchKey,
            'Division': $scope.div,
            'VerificationType': $scope.userType,
        };

        $scope.showFormatedDate = function (date) {
            var values = date.split(/[^0-9]/);
            return values[0] + '/' + values[1] + '/' + values[2];
        }
        if (timer) { clearTimeout(timer); }

        var gridData = new kendo.data.DataSource({
            //serverPaging: true,
            schema: {
                data: function (response) {
                    if (!response.Error && response.Status === 200) {
                        if (response.data.length === 0) {
                            $scope.error = 'No Records Found';
                            timer = setTimeout(function () { $scope.error = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 10000);
                            return [];
                        }
                        timer = setTimeout(function () { $scope.success = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 10000);
                        return response.data;
                    } else {
                        if (response.Error) {
                            $scope.error = response.Error.Message;
                            timer = setTimeout(function () { $scope.error = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 10000);
                        }
                        return [];
                    }
                }
                /*,
                total: function(response){
                    return (!response.Error && response.Status === 200) ? response.data.length : 0;
                },*/
            },
            pageSize: 10,
            batch: true,
            transport: {
                read: function (e) {
                    // $('#examInquiryList').hide();
                    $scope.patientGridOptions.dataSource.data([]);
                    $scope.isSearching = true;
                    if (timer) { clearTimeout(timer); }

                    //Custom Code it will replce with server code --Start
                    $scope.isDisabled = false;
                    $scope.isSearching = false;
                    $scope.isProcessing = '';
                    e.success(jdata);
                    //Custom Code it will replce with server code --End

                    //serviceData.send('PatientApi/GetPatientDontSeeExamListAsync', $scope.completeFilterObj).then(function (res) {
                    //    // $('#examInquiryList').show();
                    //    //$('.spinner').hide();
                    //    $scope.isDisabled = false;
                    //    $scope.isSearching = false;
                    //    $scope.isProcessing = '';
                    //    e.success(res);
                    //}, function (err) {
                    //    //return err;
                    //    $scope.error = 'An error occured. Either No records found or have some server error';
                    //    timer = setTimeout(function () { $scope.error = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 10000);
                    //});
                }
            }
        });

        $scope.patientGridOptions = {
            pageable: false,
            scrollable: true,
            height: 600,
            filterable: false,
            dataSource: gridData,
            dataBound: function (e) {
                //e.sender.hideColumn(0);               
            },
            selectable: "row",
            change: function (e) {
                var selectedRows = this.select();
                var dataItem = this.dataItem(selectedRows[0]);
                $scope.patientDetails = dataItem;
                $scope.$apply();
            },
            columns: [
                { title: "Name", template: "#= User.LastName +' '+ User.FirstName#" },
                { title: "Location", template: "#= xLocation.LocationCode #" },
                { title: "Date", template: "#= CreationDate #" },
                { title: "", template: "<div class='user-icon' ng-if='dataItem.isAnonymous'></div>" }]
        };

        $scope.filterOtherExamUsers = function (option) {
            if (timer) { clearTimeout(timer); }
            option = option || '';
            if (option == 'refresh') {
                $scope.div = { ShowAll: true, SMIL: false, VR: false };
                $scope.userType = { ShowAll: true, Verified: false, Anonymous: false };
                $scope.searchKey = '';
            }
            if (option == 'showAll') {
                $scope.div = { ShowAll: true, SMIL: false, VR: false };
                $scope.userType = { ShowAll: true, Verified: false, Anonymous: false };
            } else {
                $scope.patientDetails = '';
                if ($(".k-loading-mask").length == 0) {
                    if ($('#filter-div').is(':visible')) {
                        $("#filter-div").animate({ "left": "-750px", opacity: "hide" }, 300);
                    }
                    $scope.selectedPatient = '';
                    $scope.error = '';
                    $scope.completeFilterObj = {
                        'PatientName': $scope.searchKey,
                        'Division': $scope.div,
                        'VerificationType': $scope.userType,
                    };
                    if ($scope.patientGridOptions.dataSource.page(1)) {
                        $scope.patientGridOptions.dataSource.page(1).read();
                    }
                }
            }
        }

        $scope.makePhoneFormated = function (phoneNumber) {
            if (phoneNumber) {
                // regex for contains the value between the parentheses
                var regForFirstDigit = /\(([^)]+)\)/;
                var firstPhoneDigits = pad(regForFirstDigit.exec(phoneNumber)[1], 3);
                var regForMiddlePhoneDigit = /\)([^)]+)\-/;
                var middlePhoneDigits = pad(regForMiddlePhoneDigit.exec(phoneNumber)[1], 3);
                var regForLastPhoneDigit = /\-([^)]+)/;
                var lastPhoneDigit = pad(regForLastPhoneDigit.exec(phoneNumber)[1], 4);
                var forMatedPhoneNumber = '(' + firstPhoneDigits + ') ' + middlePhoneDigits + '-' + lastPhoneDigit;
                return forMatedPhoneNumber;
            }
        }

        var pad = function (str, max) {
            str = str.toString();
            return str.length < max ? pad("0" + str, max) : str;
        }

        $scope.inquiryReviewed = function (patientDetails) {
            if (patientDetails) {
                if (timer) { clearTimeout(timer); }
                $scope.isProcessing = true;
                serviceData.send('PatientApi/CompleteDontSeeExam', { id: patientDetails.PKID, UserId: patientDetails.UserID }, { method: 'PUT' }).then(function (response) {
                    $scope.isProcessing = false;
                    $scope.filterOtherExamUsers();
                    $('#completeNote').trigger('reveal:close');
                }, function (error) {
                    $('#completeNote').trigger('reveal:close');
                    $scope.isProcessing = false;
                    if (error.Message) {
                        $scope.error = error.Message;
                    } else {
                        $scope.error = 'An error occured. Please try again';
                    }
                    timer = setTimeout(function () { $scope.error = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 10000);
                });
            }
        }
    }]);