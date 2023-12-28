/* draggable */
angular.module('MetronicApp')
  .directive('draggable', function () {
    return {
      restrict: 'A',
      link: function (scope, elm, attrs) {
        var options = scope.$eval(attrs.draggable); //allow options to be passed in
        elm.draggable(options);
      }
    };
  })
  .directive('allowonedecimalpoint', function () {
    return {
      link: function (scope, ele, attrs) {
        ele.bind('keypress', function (e) {
          if (e.charCode == 46 && e.target.value.includes('.')) {
            e.preventDefault();
          }if(["e", "E", "+", "-"].includes(e.key)){
            e.preventDefault();
          } 
          // else {
          //   e.target.value = e.target.value
          //     // Remove anything that isn't valid in a number
          //     .replace(/[^\d-.]/g, '')
          //     // Remove all dashes unless it is the first character
          //     .replace(/(?!^)-/g, '')
          //     // Remove all periods unless it is the last one
          //     .replace(/\.(?=.*\.)/g, '');
          // }
        });
      }
    };
  })

  .directive('disableValidation', function () {
    return {
      require: 'ngModel',
      link: function (scope, elem, attrs, ngModelController) {
        wrapOriginalValidators();
        watchDisableCriteria();

        function wrapOriginalValidators() {
          var originalValidators = angular.copy(ngModelController.$validators);
          Object.keys(originalValidators).forEach(function (key) {
            ngModelController.$validators[key] = function (v) {
              return scope.$eval(attrs.disableValidation) || originalValidators[key](v);
            }
          });
        }

        function watchDisableCriteria() {
          scope.$watch(attrs.disableValidation, function () {
            // trigger validation
            var originalViewValue = ngModelController.$viewValue;
            scope.$applyAsync(function () {
              ngModelController.$setViewValue('');
            });
            scope.$applyAsync(function () {
              ngModelController.$setViewValue(originalViewValue);
            });
          });
        }
      }
    };
  })

  .directive('decimalplaces', function () {
    return {
      link: function (scope, ele, attrs) {
        ele.bind('keypress', function (e) {
          var newVal = $(this).val() + (e.charCode !== 0 ? String.fromCharCode(e.charCode) : '');
          if ($(this).val().search(/(.*)\.[0-9][0-9]/) === 0 && newVal.length > $(this).val().length) {
            e.preventDefault();
          }
        });
      }
    };
  })

  .directive('stopPropagation', function () {
    return {
      restrict: 'A',
      link: function (scope, element) {
        element.bind('click', function (e) {
          return false;
        });
      }
    };
  })

  .directive('infinityScroll', function () {
    return {
      restrict: "A",
      link: function (scope, elm, attr) {
        var raw = elm[0];
        raw.addEventListener('scroll', function () {
          if ((raw.scrollTop + raw.offsetHeight) >= raw.scrollHeight - 50) {
            scope.$apply(attr.infinityScroll);
          }
        });
      }
    };
  })

  .directive("pwSameCheck", function () {
    return {
      require: 'ngModel',
      link: function (scope, elem, attrs, ctrl) {
        var firstPassword = '#' + attrs.pwSameCheck;
        elem.add(firstPassword).on('keyup', function () {
          scope.$apply(function () {
            var v = elem.val() === $(firstPassword).val();
            ctrl.$setValidity('pwmatch', v);
          });
        });
      }
    }
  })

  .directive("pwDiffCheck", function () {
    return {
      require: 'ngModel',
      link: function (scope, elem, attrs, ctrl) {
        var firstPassword = '#' + attrs.pwDiffCheck;
        elem.add(firstPassword).on('keyup', function () {
          scope.$apply(function () {
            var v = elem.val() != $(firstPassword).val();
            ctrl.$setValidity('pwdiff', v);
          });
        });
      }
    }
  })

  .directive('stopCutCopyPaste', function () {
    return {
      scope: {},
      link: function (scope, element) {
        element.on('cut copy paste', function (event) {
          event.preventDefault();
        });
      }
    };
  })
  // Prevent users from entering 
  // space at first position of textbox / Special characters
  .directive('restrictKeypress', function () {
    return function (scope, element, attrs) {
      element.bind("keypress", function (e) {
        var startPos = e.currentTarget.selectionStart;
        // restricts space at first position
        if ((e.which === 32 && startPos == 0)
          // uncomment to restrict special characters
          // || ((e.which != 32 && (e.which < 48 ||
          //   (e.which > 57 && e.which < 65) ||
          //   (e.which > 90 && e.which < 97) ||
          //   e.which > 122)))
        )
          e.preventDefault();
      });
    };
  })

  .directive('restrictZero', function () {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function (scope, element, attrs, modelCtrl) {
        modelCtrl.$parsers.push(function (inputValue) {
          if (inputValue == null)
            return ''
          var cleanInputValue = inputValue.replace(/^0/g, '');
          if (cleanInputValue != inputValue) {
            modelCtrl.$setViewValue(cleanInputValue);
            modelCtrl.$render();
          }
          return cleanInputValue;
        });
      }
    }
  })

  .directive('tooltip', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        $(element).hover(function () {
          // on mouseenter
          $(element).tooltip('show');
        }, function () {
          // on mouseleave
          $(element).tooltip('hide');
        });
      }
    }
  })
  .directive('months', function ($filter, $timeout) {
    return {
      scope: {
        ngModel: '=',
        prefix: '=',
        decimals: '=',
        limit: '='
      },
      link: function (scope, el, attrs, ctrl) {
        el.bind('focus', function () {
          el.val(scope.ngModel);
        });
        el.bind('input', function () {
          var monthRegex = /^(?!0\.00)\d{1,10}(,\d{3})*$/;
          if (monthRegex.test(el.val())) {
            if (scope.limit)
              scope.limit = parseFloat(scope.limit);
            let inputVal = +el.val();
            if (scope.limit < inputVal)
              scope.ngModel = parseFloat(("" + inputVal / 10).split('.')[0])
            else
              scope.ngModel = inputVal;
            scope.$apply();
          }
        });
      }
    }
  });


