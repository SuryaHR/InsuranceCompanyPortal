angular.module('MetronicApp').service('VendorInvoiceDetailsService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    this.getInviceDetails = function (param) {
        
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/invoice/details",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.makeItemPaymentByCheck = function (param) {

        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/invoice/payment",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    //Invoice aprove
    this.ApproveInvoice = function (param) {
        var Result = $http({
            method: "POST",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/invoice/approval",
            headers: AuthHeaderService.getHeader()
        });
        return Result;
    };
   
    this.SendToSupervisor = function (param) {
        var Result = $http({
            method: "POST",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/review/invoice",
            headers: AuthHeaderService.getHeader()
        });
        return Result;
    };

}]);