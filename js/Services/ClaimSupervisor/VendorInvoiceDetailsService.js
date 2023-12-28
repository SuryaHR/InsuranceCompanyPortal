angular.module('MetronicApp').service('VendorInvoiceDetailsService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    this.getInvoiceDetails = function (param) {

        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/servicerequest/invoice/details",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.makeItemPaymentByCheck = function (param) {

        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/items/payment",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };


}]);