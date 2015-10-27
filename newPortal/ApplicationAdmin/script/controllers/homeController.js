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

    .controller('homeController', ['$http', '$scope', '$location', '$cookies', '$timeout', 'serviceGlobal', 'serviceAuth', 'serviceData', function ($http, $scope, $location, $cookies, $timeout, serviceGlobal, serviceAuth, serviceData) {
        if (!serviceAuth.isAuthenticated()) {
            $location.path("/login");
        }

        //Custom Code will remove in future start      
        var jdata =
                [
                    { "HomeId": "1", "FirstName": "A!", "LastName": "A", "LocationCode": "M", "AppointmentDateTime": "1990" },
                    { "HomeId": "2", "FirstName": "B!", "LastName": "B", "LocationCode": "F", "AppointmentDateTime": "1991" },
                    { "HomeId": "3", "FirstName": "C!", "LastName": "C", "LocationCode": "M", "AppointmentDateTime": "1992" },
                    { "HomeId": "4", "FirstName": "D!", "LastName": "D", "LocationCode": "F", "AppointmentDateTime": "1993" },
                    { "HomeId": "5", "FirstName": "E!", "LastName": "E", "LocationCode": "M", "AppointmentDateTime": "1994" },
                    { "HomeId": "6", "FirstName": "F!", "LastName": "F", "LocationCode": "M", "AppointmentDateTime": "1995" },
                    { "HomeId": "7", "FirstName": "G!", "LastName": "G", "LocationCode": "F", "AppointmentDateTime": "1996" },
                    { "HomeId": "8", "FirstName": "H!", "LastName": "H", "LocationCode": "M", "AppointmentDateTime": "1997" },
                    { "HomeId": "9", "FirstName": "I!", "LastName": "I", "LocationCode": "F", "AppointmentDateTime": "1998" },
                    { "HomeId": "10", "FirstName": "J!", "LastName": "J", "LocationCode": "M", "AppointmentDateTime": "1999" }]
        //Custom Code will remove in future End

        var timer = setTimeout(function () { }, 10000);
        var examQuestions = serviceGlobal.examQuestions;
        $scope.global_process = '';
        $scope.error = '';
        $scope.isProcessing = false;
        $scope.searchKey = '';
        $scope.isDisabled = false;
        $scope.selectedPatient = [];
        $scope.QuestionSummary = [];
        $scope.combination = false;
        $scope.isSearching = false;
        //Filter Objects
        $scope.exam = {};
        $scope.exam.all = 'All';
        $('#patientExamList').hide();
        $scope.div = { ShowAll: true, SMIL: false, VR: false };
        $scope.userType = { ShowAll: true, Verified: false, Anonymous: false };
        $scope.appointmentStatus = false;

        $scope.divSelected = { ShowAll: true, SMIL: false, VR: false };
        $scope.appointmentStatusSelected = false;
        $scope.examSelected = { all: 'All' };

        $scope.completeFilterObj = {
            'PatientName': $scope.searchKey,
            'Division': $scope.div,
            'Modality': [],
            'VerificationType': $scope.userType,
            'IncludeCombination': $scope.combination,
            'Status': $scope.appointmentStatus
        };


        $scope.showFormatedDate = function (date) {
            var values = date.split(/[^0-9]/);
            return values[0] + '/' + values[1] + '/' + values[2];
        }

        $scope.showAll = function (val, type) {
            /*if (val) {
                if (type == 'division') {
                    $scope.div.SMIL = false;
                    $scope.div.VR = false;
                }else if (type == 'exam') {
                   $scope.exam.dexa = false;
                   $scope.exam.ultrasound = false;
                   $scope.exam.mammogram = false;
                   
                }else if (type == 'userType') {
                    $scope.userType.Verified = false;
                    $scope.userType.Anonymous = false;
                }
            }*/
        }

        var getExamCodes = function () {
            var examCodes = []
            if (!$scope.exam.all) {

                if ($scope.exam.dexa) {
                    examCodes = examCodes.concat(serviceGlobal.examWiseCode.DEXA);
                }
                if ($scope.exam.mammogram) {
                    examCodes = examCodes.concat(serviceGlobal.examWiseCode.Mammogram);
                }
                if ($scope.exam.ultrasound) {
                    examCodes = examCodes.concat(serviceGlobal.examWiseCode.Ultrasound);
                }
            }
            return examCodes;
        }

        var gridData = new kendo.data.DataSource({
            transport: {
                read: function (e) {
                    $('#patientExamList').hide();
                    $scope.isSearching = true;
                    if (timer) { clearTimeout(timer); }

                    $scope.completeFilterObj.Page = e.data.page;
                    $scope.completeFilterObj.PageSize = e.data.pageSize;
                    $scope.completeFilterObj.Skip = e.data.skip;
                    $scope.completeFilterObj.Take = e.data.take;

                    serviceData.send('AppointmentApi/GetUserAppointments', $scope.completeFilterObj).then(function (res) {
                        $scope.isSearching = false;
                        $('#patientExamList').show();
                        $scope.isProcessing = '';
                        e.success(res);
                    }, function (err) {
                        $scope.error = 'An error occured. Either No records found or have some server error';
                        timer = setTimeout(function () { $scope.error = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 10000);
                    });
                }
            },
            schema: {
                data: function (res) {
                    if (!res.Error && res.Status === 200) {
                        if (res.data.Appointment.length === 0) {
                            $scope.error = 'No Records Found';
                            timer = setTimeout(function () { $scope.error = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 10000);
                            return [];
                        }
                        timer = setTimeout(function () { $scope.success = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 10000);
                        return res.data.Appointment;
                    } else {
                        if (res.Error) {
                            $scope.error = res.Error.Message;
                            timer = setTimeout(function () { $scope.error = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 10000);
                        }
                        return [];
                    }
                },
                total: function (response) {
                    return (!response.Error && response.Status === 200) ? response.data.Count : 0;
                },
            },
            batch: true,
            serverPaging: true,
            pageSize: 100,
            dataBound: function (e) {

            },
        });

        $scope.patientGridOptions = {
            height: 600,
            scrollable: {
                virtual: true
            },
            dataSource: jdata,//gridData, //Custom Code Replace by gridData
            selectable: "row",
            change: function (e) {
                $scope.isProcessing = true;
                $scope.selectedPatient = '';
                $scope.error = '';

                var selectedRows = this.select();
                var dataItem = this.dataItem(selectedRows[0]);

                var appointmentData = {
                    'PatientName': $scope.searchKey,
                    'Division': $scope.div,
                    'Modality': getExamCodes(),
                    'VerificationType': $scope.userType,
                    'IncludeCombination': $scope.combination,

                    'AppointmentDetailFilterModel': {
                        FirstName: dataItem.FirstName,
                        LastName: dataItem.LastName,
                        Gender: dataItem.Gender,
                        AppointmentDateTime: dataItem.AppointmentDateTime,
                        LocationCode: dataItem.LocationCode,
                        GroupId: dataItem.GroupId
                    }
                };

                serviceData.send('AppointmentApi/GetUserAppointmentExamDetail', appointmentData).then(function (response) {
                    $scope.isProcessing = false;
                    if (!response.Error && response.data && response.Status === 200) {
                        $scope.selectedPatient = response.data;
                        $scope.selectedPatient.User.isAnonymous = dataItem.isAnonymous;
                        $scope.selectedPatient.User.GroupId = dataItem.GroupId;

                        $scope.QuestionSummary = [];
                        var isRepeatQuestion = [];
                        if ($scope.selectedPatient.Appointments[0] && $scope.selectedPatient.Appointments[0].PatientExams[0]) {
                            var questionAnswerJSON = JSON.parse($scope.selectedPatient.Appointments[0].PatientExams[0].QuestionnaireResponseData);
                            if (questionAnswerJSON) {
                                if (questionAnswerJSON.examWiseAnswers) {
                                    var questionAnswerData = questionAnswerJSON.examWiseAnswers;
                                } else {
                                    var questionAnswerData = questionAnswerJSON;
                                }

                                angular.forEach(questionAnswerData, function (questionAnswers, examName) {
                                    if (angular.isArray(questionAnswers)) {
                                        angular.forEach(questionAnswers, function (AnswerObj, answerIndex) {
                                            var answerString = '';
                                            if (angular.isObject(AnswerObj.answer)) {

                                                if (AnswerObj.answer.month) {
                                                    answerString = AnswerObj.answer.month.name + " - " + AnswerObj.answer.year.name;
                                                } else {
                                                    angular.forEach(AnswerObj.answer, function (value, key) {
                                                        if (value == true && key != 'Other' && key != 'Other_text') {
                                                            answerString += key + ',';
                                                        } else if (key == 'Other_text') {
                                                            answerString += value + ',';
                                                        }
                                                    });
                                                }
                                            } else {
                                                answerString = AnswerObj.answer;
                                            }
                                            if (isRepeatQuestion.indexOf(AnswerObj.questionID) == -1) {
                                                $scope.QuestionSummary.push({ question: examQuestions[AnswerObj.questionID], answer: answerString.replace(/,(?=[^,]*$)/, '') });
                                                isRepeatQuestion.push(AnswerObj.questionID);
                                            }
                                        });
                                    }
                                });
                            } else {
                                //Need to handle error
                                $scope.QuestionSummary.push({ question: 'Invalid Question Summary', answer: '' });
                            }
                        } else {
                            //Need to handle error
                            $scope.QuestionSummary.push({ question: 'Summary Not Found!', answer: '' });
                        }
                    } else {
                        //Need to handle error
                        if (response.Error.Message) {
                            $scope.error = response.Error.Message;
                        } else {
                            $scope.error = 'Patient Details Not Found.';
                        }
                        timer = setTimeout(function () { $scope.error = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 10000);
                    }
                }, function (error) {
                    $scope.isProcessing = false;
                    //Need to handle error
                    if (error.Message) {
                        $scope.error = error.Message;
                    } else {
                        $scope.error = 'An error occured. Please try again';
                    }
                    timer = setTimeout(function () { $scope.error = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 10000);
                });

            },
            columns: [
                    { title: "Name", template: "#= LastName + '  ' + FirstName #" },
                    { title: "Location", template: "#= LocationCode #" },
                    { title: "Date", template: "#= AppointmentDateTime #" },
                    { title: "", template: "<div class='user-icon' ng-if='dataItem.isAnonymous'></div>" }]
        };



        $scope.searchPatient = function (searchKey) {
            $scope.selectedPatient = '';
            $scope.error = '';
            if ($scope.patientGridOptions.dataSource.page(1) && searchKey != '' && $(".k-loading-mask").length == 0) {
                $scope.completeFilterObj = {
                    'PatientName': $scope.searchKey,
                    'Division': $scope.div,
                    'Modality': getExamCodes(),
                    'VerificationType': $scope.userType,
                    'IncludeCombination': $scope.combination,
                    'Status': $scope.appointmentStatus
                };
                $scope.patientGridOptions.dataSource.page(1).read();
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

        $scope.filterAppointments = function (option) {
            if (timer) { clearTimeout(timer); }
            option = option || '';
            if (option == 'refresh') {
                $scope.exam = {};
                $scope.exam.all = 'All';
                $scope.div = { ShowAll: true, SMIL: false, VR: false };
                $scope.userType = { ShowAll: true, Verified: false, Anonymous: false };
                $scope.combination = false;
                $scope.searchKey = '';
            }
            if (option == 'showAll') {
                $scope.exam = {};
                $scope.exam.all = 'All';
                $scope.div = { ShowAll: true, SMIL: false, VR: false };
                $scope.userType = { ShowAll: true, Verified: false, Anonymous: false };
                $scope.combination = false;
            } else {
                if ($(".k-loading-mask").length == 0) {
                    if ($('#filter-div').is(':visible')) {
                        $("#filter-div").animate({ "left": "-750px", opacity: "hide" }, 300);
                    }
                    $scope.selectedPatient = '';
                    $scope.error = '';
                    $scope.completeFilterObj = {
                        'PatientName': $scope.searchKey,
                        'Division': $scope.div,
                        'Modality': getExamCodes(),
                        'VerificationType': $scope.userType,
                        'IncludeCombination': $scope.combination,
                        'Status': $scope.appointmentStatus
                    };
                    $scope.divSelected = $scope.div;
                    $scope.appointmentStatusSelected = $scope.appointmentStatus;
                    $scope.examSelected = $scope.exam;

                    if ($scope.patientGridOptions.dataSource.page(1)) {
                        $scope.patientGridOptions.dataSource.page(1).read();
                    }
                }
            }

        }

        $scope.closeDetails = function () {
            $scope.selectedPatient = '';
        }

        $scope.markComplete = function () {
            if (timer) { clearTimeout(timer); }
            $('#completeNote').trigger('reveal:close');
            if ($scope.selectedPatient && $scope.selectedPatient.Appointments[0] && $scope.selectedPatient.Appointments[0].PatientExams[0] && $scope.selectedPatient.Appointments[0].PatientExams[0].GroupID) {
                $scope.isProcessing = true;
                serviceData.send('AppointmentApi/EditCompleteAppointmentByGroupID', { groupID: $scope.selectedPatient.Appointments[0].PatientExams[0].GroupID }).then(function (response) {
                    $scope.isProcessing = false;
                    $scope.filterAppointments();
                }, function (error) {
                    $scope.isProcessing = false;
                    if (error.Message) {
                        $scope.error = error.Message;
                    } else {
                        $scope.error = 'An error occured. Please try again';
                    }
                    timer = setTimeout(function () { $scope.error = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 10000);
                });
            } else {
                $scope.error = 'Appointment does\'nt have valid group combinatoin.';
                timer = setTimeout(function () { $scope.error = ''; if (!$scope.$$phase) { $scope.$apply(); } }, 10000);
            }
        }
    }]);