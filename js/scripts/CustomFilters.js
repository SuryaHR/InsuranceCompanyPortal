angular.module('MetronicApp').filter('AddressFilter', function () {
    return function (input) {  //Accepts Complete address and filter it to print properly
        var result = "";
        if (angular.isDefined(input) && input != null)
        {
            var arry = input.split(',');
            angular.forEach(arry, function (value, key) {
                if (key != arry.length - 1 && key != arry.length - 2)
                    result += value + ', '
                else if (key == arry.length - 2)
                    result += value + '. '
                else
                    result += value + ".";
            })
        }
       
        return result; //input.replace(/,/g, ', ');
    }
})
.filter('percentageDecimal', ['$filter', function($filter) {
    return function(input, decimals) {
        return $filter('number')(parseFloat(input), 2)+'%';
    };
}])
;