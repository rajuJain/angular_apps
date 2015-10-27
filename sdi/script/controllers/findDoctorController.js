'use strict';

/* Controller Logic*/

    angular.module('sdi')

    /**
    * @ngdoc
    * @name sdi.Controller:findDoctorController
    * @url '/findDoctor'
    * @template findDoctor.html
    * @description
    * find doctor by last name, first name, city and zip
    */
    .controller('findDoctorController', ['$rootScope','$scope', '$location', '$timeout', '$translate', 'serviceAuth', 'serviceData', 'serviceGlobal', function ($rootScope,$scope, $location, $timeout, $translate, serviceAuth, serviceData, serviceGlobal) {
        $scope.global_process = '';
        $scope.searchDoctorError = '';
        $scope.searchData = {};
        var recordPerPage = 10;
        var headers = [];
	
	$scope.selectedDoctorData = serviceGlobal.findDoctor || [];
	
        if (!serviceGlobal.userSession.mrn && !serviceAuth.isAuthenticated()) {
             $location.path('/login');
             return false;
        }
        if(serviceGlobal.appointment.completedStep < 1){
            $location.path("/" + serviceGlobal.appointment.getLastStep());
            return false;
        }
	
	$scope.emptyDoctor = '';
        headers['SDI-Authorization'] = serviceData.serverKey();
        headers['RequestVerificationToken'] = serviceData.serverToken();
            var gridData = new kendo.data.DataSource({
                serverPaging: true,
                schema: {
                    data: function(responce){
                       return (responce && responce.Error == undefined) ? responce.data.Doctor : [];
                    },
                    total: function(responce){
                        var totalRecord = (responce && responce.Error == undefined) ? responce.data.TotalRecords : 0;
                        if(totalRecord > 0){
                            $('.find-doctor #doctorList .k-grid-pager').show();
                            $scope.emptyDoctor = '';
                            $scope.isDoctorFound = true;
                        }else if($scope.searchData.LastName || $scope.searchData.FirstName || $scope.searchData.City || $scope.searchData.Zip){
                                $('.find-doctor #doctorList .k-grid-pager').hide();
                                $scope.emptyDoctor = 'NO_RECORDS_FOUND';
                                $scope.isDoctorFound = false;
                        }
                        return totalRecord;
                    }
                },
                pageSize: 10,
                batch: true,
                transport: {
                    read : function(e){
                        if($scope.searchData.LastName || $scope.searchData.FirstName || $scope.searchData.City || $scope.searchData.Zip){
                            
                            $scope.isProcessing = 'inProgress';
                            $scope.searchData.page = e.data.page; 
                            $scope.searchData.pageSize = e.data.pageSize;
                            $scope.searchData.skip = e.data.skip;
                            $scope.searchData.take = e.data.take;
                            $scope.selectedDoctorData = [];
			    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
			    if(w < 480 ){
				$('html, body').animate({
				    scrollTop: $( "#doctorData" ).offset().top
				}, 1000);
			    }
			     
                            serviceData.send('DoctorApi/GetDoctorSearch', $scope.searchData).then(function(res){
                                serviceGlobal.searchDoctorData = $scope.searchData;
                                 e.success(res);
				 $scope.isSkipShow = true;
                                 $scope.isProcessing = '';
                            },function(err){
                                //return err;
                                $scope.error = 'An error occured. Either No records found or have some server error';
                                $scope.isProcessing = '';
				e.success(null);
				$scope.isSkipShow = false;
                            });
                        }else{
			    $scope.isSkipShow = true;
                             e.success(null);
                        }
                    }
                    
                }
            });

        /**
         * @ngdoc
         * @name sdi.controller.function:#searchDoctor
         * @Description search doctor by first name, last name and d.o.b
         * @param FirstName, LastName, Month, Day AND Year 
        */
  //       $scope.selectedDoctorData = [];
		// if(serviceGlobal.findDoctor){
  //           $scope.selectedDoctorData.push(serviceGlobal.findDoctor);
  //       }
        $scope.searchDoctor = function (searchData) {
            $scope.isDoctorFound = false
            serviceGlobal.searchDoctorData = {};
            var data = [];
            $scope.selectedDoctorData;
            $('.find-doctor #doctorList .k-grid-pager').hide();
	    $scope.isDoctorFound = false;
            $scope.mainGridOptions.dataSource.data(data);

            $scope.emptyDoctor = '';
            if ($scope.mainGridOptions.dataSource.page(1) != undefined) {
                $scope.searchData = searchData;
                $scope.mainGridOptions.dataSource.page(1).read();
            }
        }

        if(serviceGlobal.searchDoctorData.page){
            $scope.searchData = serviceGlobal.searchDoctorData;
            var page = serviceGlobal.searchDoctorData.page;
            if(page > 1){
              $timeout(function() {$scope.mainGridOptions.dataSource.page(page);}, 2000);  
            }
        }

        /**
         * @ngdoc
         * @name sdi.controller.object:#mainGridOptions
         * @Description showing doctor list in grid
        */
         $scope.mainGridOptions = {
            pageable:  {
                messages: {
                    empty : $translate.instant('NoItemDisplay')
                }
            },
            scrollable: false, 
            filterable: false,
            dataSource: gridData,
	    language: $scope.lang,
            dataBound: function (e) {

                e.sender.hideColumn(0);
                var grid = e.sender;
                $.each(grid.tbody.find('tr'),function(){
                  var model = grid.dataItem(this);
                  if(serviceGlobal.findDoctor[0] && model.ProviderID == serviceGlobal.findDoctor[0].ProviderID){
                        grid.select(this);
                  }                          
                });
            },
            selectable: "row",
            change: function(e) {
                var selectedRows = this.select();
                var dataItem = this.dataItem(selectedRows[0]);
                
                $scope.selectedDoctorData = [];
                if(dataItem && dataItem!=null){
		    
                    $scope.selectedDoctorData.push(dataItem);
                    serviceGlobal.findDoctor = $scope.selectedDoctorData;    
                }else{
                    $scope.selectedDoctorData = [];
                    serviceGlobal.findDoctor = {};
                }
                
                $scope.selectedDoctorData;
                if (!$scope.$$phase){$scope.$apply();}
            },
            columns:[{field: "ProviderID",title: "ProviderID",width: "5%"},
                    {title: "{{'Name' | translate}}",width: "30%",template: "#= LastName + ',  ' + FirstName #"},
                    {title: "{{'Address' | translate}}",template: " {{dataItem.AddressLine1}} <span ng-if='dataItem.AddressLine2'>, {{dataItem.AddressLine2}}</span>, {{dataItem.City}}, {{dataItem.StateCode}}, {{dataItem.PostalCode}} ",width: "40%"}]
                    //{title: "{{'Phone' | translate}}",width: "25%",template: "#= PhoneArea + '  ' + PhoneExchange  + ' ' + PhoneLast4 #"  }
        };
	$scope.removeSelectedDoctor = function(){
	    $scope.selectedDoctorData = [];
	    $scope.selectedDoctorData;
	    $('.k-state-selected').removeClass('k-state-selected');
            if (!$scope.$$phase){$scope.$apply();}
	    serviceGlobal.appointment.completedStep = 1;
	    serviceGlobal.appointment.PendingStep = 2;
	    serviceGlobal.findLocation = {location : {}};
	    serviceGlobal.findDate = {appointments : [],appointmentToken : {}};
	    serviceGlobal.appointmentSlotData = {};
	    $rootScope.currentStep = serviceGlobal.appointment.completedStep;
	}
	
	$scope.skipDoctor = function(){
	    $scope.selectedDoctorData = [];
	    var defaultProvider = {AddressLine1: "",AddressLine2: "",City: "",FirstName: "DOCTOR",LastName: "Temporary",PhoneArea: "",
				    PhoneExchange: "",PhoneExtension: "",PhoneLast4: "",PostalCode: "",ProviderID: "245169",ProviderNumber: "Z11",StateCode: "",TitleName: "",uid: "", ProviderLocationID  : "36363"};
	    $scope.selectedDoctorData.push(defaultProvider);
	    serviceGlobal.findDoctor = $scope.selectedDoctorData;
	    $scope.goToLocation();    
	}
       $scope.goToLocation = function(selectedDoctor){
            if(serviceGlobal.appointment.completedStep < 2){
               serviceGlobal.appointment.completedStep = 2;
            }
            $location.path('/findLocation');
            return false;
       }
       
       $scope.$watch('lang',function(newVal, oldVal){
	
	    var lang = 'en-US';
	    if ($scope.lang == 'es-AR') {
		 lang = 'es-ES';
	    }
	    
	    $.getScript("//cdn.kendostatic.com/2014.2.903/js/messages/kendo.messages." + lang + ".min.js", function() {
     
		 /* $scope.$apply should be used in order to notify the $scope for language change */
		 $scope.$apply(function(){
		   kendo.culture(lang); //change kendo culture
     
		   /* we use dummy language option in order to force the Grid to rebind */
		   $scope.mainGridOptions.language = lang;
     
		 })
	       });
	
       });
       
    }]);