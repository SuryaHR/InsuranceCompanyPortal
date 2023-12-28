angular.module('MetronicApp').service('AccountPayableService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
   
    this.getInvoiceList = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/company/accountpayables",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.getAccountPayableDetails = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/account/payable/details",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    // getContractForPayable
    this.getContractForPayable = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/get/invoice/payment/contract/details",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
     //get Vendor List
     this.getVendorList = function () {
        var Assign = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/registered/vendors ",
            headers: AuthHeaderService.getHeader()
        });
        return Assign;
    };
    // /list/invoice/status
this.getStatusList = function () {
    var Assign = $http({
        method: "Get",
        url: AuthHeaderService.getApiURL() + "web/list/payable/status",
        headers: AuthHeaderService.getHeader()
    });
    return Assign;
};
}]);