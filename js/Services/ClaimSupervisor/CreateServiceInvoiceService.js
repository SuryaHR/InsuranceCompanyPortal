angular.module('MetronicApp').service('CreateServiceInvoiceService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    this.getStates = function (param) {
        var response = $http({
            method: "post",
            url: AuthHeaderService.getApiURL() + "web/states",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    this.GetPaymentTerms = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web//paymentterms",           
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    // new invoice for service request API# 235
    this.SaveServiceInvoiceDetails = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/servicerequest/invoice",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    };

    //Get Vendor Details
    this.getVendorDetails = function (param) {

        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/vendor/details",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
   
    }]);
