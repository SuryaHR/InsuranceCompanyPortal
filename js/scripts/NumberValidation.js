﻿MetronicApp.directive('numbersOnly', function () {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^0-9]/g,'');
                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return '';
            }
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});