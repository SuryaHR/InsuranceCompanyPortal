angular.module('MetronicApp').service('ServiceRequestInvoicesService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    //Get Invoice list
    this.GetInvoiceList= function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/servicerequest/invoices",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    this.getVendorDetails = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/vendor/details",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    this.getStates = function () {

        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/states",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //Service request invoice payment
    this.MakePayment = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/servicerequest/invoice/payment",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

}]);