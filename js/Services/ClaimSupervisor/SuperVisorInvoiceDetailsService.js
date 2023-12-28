angular.module('MetronicApp').service('SuperVisorInvoiceDetailsService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

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
            url: AuthHeaderService.getApiURL() + "web/items/payment",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //get all states #123
    this.getStates = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/states",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
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
}]);