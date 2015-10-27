'use strict';

/* Application */

/*
 * Angular js Directive starts here
 * angular directive function
 */

angular.module('sdi')

.directive('formInput', function ($parse) {
    var template = '';
    var newHtml = '';
    return {
        restrict: "A",
        replace: false,
        //transclude: false,
        template: function (element, attr) {
            var type = (attr.type != '' && attr.type != undefined) ? 'type = "' + attr.type + '"' : '';
            var ngClassName = (attr.ngclass != '' && attr.ngclass != undefined) ? 'ng-class = "' + attr.ngclass + '"' : '';
            var className = (attr.classname != '' && attr.classname != undefined) ? 'class = "' + attr.classname + '"' : '';
            var name = (attr.name != '' && attr.name != undefined) ? 'name = "' + attr.name + '"' : '';
            var id = (attr.id != '' && attr.id != undefined) ? 'id = "' + attr.id + '"' : '';
            var minLength = (attr.minlength != '' && attr.minlength != undefined) ? 'minlength = "' + attr.minlength + '"' : '';
            var maxLength = (attr.maxlength != '' && attr.maxlength != undefined) ? 'maxlength = "' + attr.maxlength + '"' : '';
            var change = (attr.change != '' && attr.change != undefined) ? 'ng-change = "' + attr.change + '"' : '';
            var required = (attr.required != '' && attr.required != undefined && attr.required == 'true') ? 'required' : '';
            var model = (attr.ngmodel != '' && attr.ngmodel != undefined) ? 'ng-model = "' + attr.ngmodel + '"' : '';
            var trueValue = (attr.truevalue != '' && attr.truevalue != undefined) ? 'ng-true-value = "' + attr.truevalue + '"' : '';
            var falseValue = (attr.falsevalue != '' && attr.falsevalue != undefined) ? 'ng-false-value = "' + attr.falsevalue + '"' : '';
            var ngClick = (attr.ngclick != '' && attr.ngclick != undefined) ? 'ng-click = "' + attr.ngclick + '"' : '';
            var ngChecked = (attr.ngchecked != '' && attr.ngchecked != undefined) ? 'ng-checked = "' + attr.ngchecked + '"' : '';
            var checked = (attr.checked != '' && attr.checked != undefined) ? 'checked = "' + attr.checked + '"' : '';
            var value = (attr.value != '' && attr.value != undefined) ? 'value = "' + attr.value + '"' : '';
            var ngvalue = (attr.ngvalue != '' && attr.ngvalue != undefined) ? 'ng-value = "' + attr.ngvalue + '"' : '';
            var ngBlur = (attr.ngblur != '' && attr.ngblur != undefined) ? 'ng-blur = "' + attr.ngblur + '"' : '';
            var nginit = (attr.nginit != '' && attr.nginit != undefined) ? 'ng-init = "' + attr.nginit + '"' : '';
            var ngkeyup = (attr.ngkeyup != '' && attr.ngkeyup != undefined) ? 'ng-keyup = "' + attr.ngkeyup + '"' : '';
            var ngenter = (attr.ngenter != '' && attr.ngenter != undefined) ? 'ng-enter = "' + attr.ngenter + '"' : '';
            var placeholder = (attr.placeholder != '' && attr.placeholder != undefined) ? 'placeholder = "' + attr.placeholder + '"' : '';
            var ngdisabled = (attr.ngdisabled != '' && attr.ngdisabled != undefined) ? 'ng-disabled = "' + attr.ngdisabled + '"' : '';
            var autocomplete = '';
            if (attr.type=='password') {
                autocomplete = 'autocomplete="off"';
            }
          
            if (attr.type != '' && attr.type != undefined && attr.type == 'select') {
                var ngOption = (attr.options != '' && attr.options != undefined) ? 'ng-options = "' + attr.options + '"' : '';
                var firstOption = (attr.firstoption != '' && attr.firstoption != undefined) ? attr.firstoption  : '{{"Select" | translate}}';
                return '<select ' + model + ' ' + ngvalue + ' ' + ngdisabled + ' ' + ngClassName + ' ' + name + ' ' + id + ' ' + minLength + ' ' + maxLength + ' ' + change + ' ' + required + ' ' + ngOption + ' '+ ngBlur +' '+ nginit +'><option value="">' + firstOption + '</option></select>'
            } else {
                return '<input ng-blur="protectFields($event)" ng-keypress="protectFields($event)" ng-paste="protectFields($event)" '+ autocomplete +' ' + type + ' ' + placeholder + ' ' + ngenter + ' ' + ngClassName + ' ' + className + ' ' + ngkeyup + ' ' + model + ' ' + ngClick + ' ' + checked + ' ' + ngvalue + ' ' + ngChecked + ' ' + name + ' ' + id + ' ' + minLength + ' ' + maxLength + ' ' + change + ' ' + trueValue + ' ' + falseValue + ' ' + value + ' ' + required + ' '+ ngBlur +' />';
            }
            //element.replaceWith(newHtml);
        }

    };
})


 .directive('rcSubmit', ['$parse', function ($parse) {
     return {
         restrict: 'AE',
         require: ['rcSubmit', '?form'],
         controller: ['$scope', function ($scope) {
             this.attempted = false;

             var formController = null;

             this.setAttempted = function () {
                if(formController.$name=='returningPatientForm' && $scope.patientData.FindPhoneNumber != undefined){
                    if($scope.patientData.FindPhoneNumber =='' || ($scope.patientData.FindPhoneNumber !='' && $scope.patientData.FindPhoneNumber.length < 10)){
                        $('#phoneNumner').addClass('has-error');
                    }else{
                        $('#phoneNumner').removeClass('has-error');
                    }
                }
                
                    this.attempted = true;   
                 
             };
             this.setFormController = function (controller) {
                 formController = controller;
             };
            
             this.needsAttention = function (fieldModelController) {
                 if(this.attempted){
                    if (!formController) return false;
                     if (fieldModelController) {
                         return fieldModelController.$invalid && (fieldModelController.$dirty || this.attempted);
                     } else {
                        return formController && formController.$invalid && (formController.$dirty || this.attempted);
                     }   
                 }   
                 
             };
         }],
         compile: function (cElement, cAttributes, transclude) {
             return {
                 pre: function (scope, formElement, attributes, controllers) {

                     var submitController = controllers[0];
                     var formController = (controllers.length > 1) ? controllers[1] : null;

                     submitController.setFormController(formController);

                     scope.rc = scope.rc || {};
                     scope.rc[attributes.name] = submitController;
                 },
                 post: function (scope, formElement, attributes, controllers) {
                     var submitController = controllers[0];
                     var formController = (controllers.length > 1) ? controllers[1] : null;
                     var fn = $parse(attributes.rcSubmit);

                     formElement.bind('submit', function (event) {
                        
                        
                         submitController.setAttempted();
                         if (!scope.$$phase) scope.$apply();


                         if (!formController.$valid){
                                if($( ".has-error" ).length > 0){
                                    $( "select .has-error" ).first().focus();
                                    $( ".has-error" ).first().focus();
                                }
                           return false; 
                         } 


                         scope.$apply(function () {
                             fn(scope, { $event: event });
                         });
                     });
                 }
             };
         }
     };
 }])

.directive('onReadFile', function ($parse) {
	return {
		restrict: 'A',
		scope: false,
		link: function(scope, element, attrs) {
                var fn = $parse(attrs.onReadFile);
            
                    element.on('change', function(onChangeEvent) {
                            var reader = new FileReader();
            
                            reader.onload = function(onLoadEvent) {
                                    scope.$apply(function() {
                                            fn(scope, {$fileContent:onLoadEvent.target.result});
                                    });
                            };
                            
                            reader.readAsDataURL((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
                    });
		}
	};
})

.directive("datepicker", function () {
  return {
    restrict: "A",
    require: "ngModel",
    link: function (scope, elem, attrs, examController) {
      var updateModel = function (dateText) {
        scope.$apply(function () {
          examController.$setViewValue(dateText);
        });
      };
      var options = {
        dateFormat: "dd/mm/yy",
        onSelect: function (dateText) {
          updateModel(dateText);
        }
      };
      elem.datepicker(options);
    }
  }
})


    .directive('phonenumberDirective', ['$filter', function($filter) {
        /*
        Intended use:
            <phonenumber-directive placeholder='prompt' model='someModel.phonenumber'></phonenumber-directive>
        Where:
            someModel.phonenumber: {String} value which to bind only the numeric characters [0-9] entered
                ie, if user enters 617-2223333, value of 6172223333 will be bound to model
            prompt: {String} text to keep in placeholder when no numeric input entered
        */
 
        function link(scope, element, attributes) {
            // scope.inputValue is the value of input element used in template
            scope.inputValue = scope.phonenumberModel;
            scope.$watch('inputValue', function(value, oldValue) {
                value = String(value);
                var number = value.replace(/[^0-9]+/g, '');
                scope.phonenumberModel = number;
                scope.inputValue = $filter('phonenumber')(number);
            });
        }
        
        return {
            link: link,
            restrict: 'AE',
            scope: {
                phonenumberPlaceholder: '=placeholder',
                phonenumberModel: '=model'
            },
            template: function(element, attr){
                var require = (attr.required) ? 'required' : '';
                var ngclass = (attr.ngclass) ? attr.ngclass : '';
                var change = (attr.change) ? attr.change : '';
                    return '<input ng-model="inputValue" id="phoneNumner" required minlength=10 type="tel" ng-change="'+change+'" ng-class="'+ngclass+'" '+require+' placeholder="{{phonenumberPlaceholder | translate}}" title="{{\'PHONE_NUMBER\' | translate}} ({{\'Format\' | translate}}: (999) 999-9999)">';
                }
        };
    }])
 
    .filter('phonenumber', function() {
        /* 
        Format phonenumber as: c (xxx) xxx-xxxx
            or as close as possible if phonenumber length is not 10
            if c is not '1' (country code not USA), does not use country code
        */
        
        return function (number) {
            /* 
            @param {Number | String} number - Number that will be formatted as telephone number
            Returns formatted number: (###) ###-####
                if number.length < 4: ###
                else if number.length < 7: (###) ###
 
            Does not handle country codes that are not '1' (USA)
            */
            if (!number) { return ''; }
 
            number = String(number);
 
            // Will return formattedNumber. 
            // If phonenumber isn't longer than an area code, just show number
            var formattedNumber = number;
 
            // if the first character is '1', strip it out and add it back
            var c = (number[0] == '1') ? '' : '';
            //number = number[0] == '1' ? number.slice(1) : number;
 
            // # (###) ###-#### as c (area) front-end
            var area = number.substring(0,3);
            var front = number.substring(3, 6);
            var end = number.substring(6, 10);
 
            if (front) {
                formattedNumber = (c + "(" + area + ") "+front);  
            }
            if (end) {
                formattedNumber += ("-" + end);
            }
            return formattedNumber;
        };
    })

    .directive('onFinishRender', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function () {
                        scope.searchOnMap(attr, 0);
                    });
                }
            }
        }
    })
    
    .directive('ngCloak', function ($timeout) {
	return {
	    compile: function(element, attr) {
	       attr.$set('ngCloak', undefined);
	       element.removeClass('ng-cloak');
	     }
	}
    });



/* Directive Ends */
