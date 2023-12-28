angular.module('MetronicApp')
  // Directive
  .directive('inputCurrency', function ($filter) {
    return {
      require: '?ngModel',
      link: function (scope, elem, attrs, ctrl) {
        if (!ctrl) return;
        ctrl.$formatters.unshift(function (a) {
          return $filter('currency')(ctrl.$modelValue)
        });
        elem.bind('focus', function () {
          //let old = ctrl.$modelValue;
          elem.val(ctrl.$modelValue);
        });
        elem.bind('blur', function (event) {
          var plainNumber = elem.val().replace(/[^\d|\-+|\.+]/g, '');
          elem.val($filter('currency')(plainNumber));
        });
      }
    };
  });