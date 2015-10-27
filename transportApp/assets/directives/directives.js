'use strict';

/* Application */

/*
 * Angular js Directive starts here
 * angular directive function
 */

angular.module('fvg')


// created directive for submit form with validations
 .directive('rcSubmit', ['$parse', '$validator', function ($parse, $validator) {
     return {
         restrict: 'AE',
         require: ['rcSubmit', '?form'],
         controller: ['$scope', function ($scope) {
             this.attempted = false;

             var formController = null;

             this.setAttempted = function () {
                    this.attempted = true;   
                 
             };
             this.setFormController = function (controller) {
                 formController = controller;
             };
         
         }],
         compile: function (cElement, cAttributes, transclude) {
             return {
                 pre: function (scope, formElement, attributes, controllers) {

                 },
                 post: function (scope, formElement, attributes, controllers) {
                     var submitController = controllers[0];
                     var formController = (controllers.length > 1) ? controllers[1] : null;
                     var fn = $parse(attributes.rcSubmit);
                     formElement.bind('submit', function (event) {
                        $validator.validate(scope).success(function() {
                            scope.$apply(function () {
                                fn(scope, { $event: event });
                            });
                            return true;                      
                        }).error(function(error) {
                            return false;
                        });   
                     });
                 }
             };
         }
     };
 }])

// created directive to avoid the undesirable flicker effect caused by the html template display
.directive('ngCloak', function ($timeout) {
	return {
	    compile: function(element, attr) {
	       attr.$set('ngCloak', undefined);
	       element.removeClass('ng-cloak');
	     }
	}
})

.directive("csDateToIso", function () {

    var linkFunction = function (scope, element, attrs, ngModelCtrl) {

        ngModelCtrl.$parsers.push(function (datepickerValue) {
            return moment(datepickerValue).format("MM/DD/YYYY");
        });
    };

    return {
        restrict: "A",
        require: "ngModel",
        link: linkFunction
    };
});



/* Directive Ends */
