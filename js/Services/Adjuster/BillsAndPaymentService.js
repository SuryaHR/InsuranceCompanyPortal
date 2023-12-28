angular.module('MetronicApp').service('BillsAndPaymentService', function ($http, $rootScope, AuthHeaderService) {

    //API #387 for adjuster and supervisor
    this.GetInvoiceListByClaim = function (param) {
        var response = $http({
            method: "Post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/company/invoice", //"web/company/invoice",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    //API# for third party vendor and associate
    this.GetVendorInvoiceListForVendor = function (param) {
        var response = $http({
            method: "Post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/vendor/invoice",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //API #388 gruped by vendor name for company
    this.GetCompanyInvoiceListByVendor = function (param) {
        var response = $http({
            method: "Post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/company/invoice/list",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    
    //API #199 for search Result
    this.GetSearchInvoiceList = function (param) {
        var response = $http({
            method: "Post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/search/invoice",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    this.GetInvoiceListByVendor = function (param) {
        var response = $http({
            method: "Post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/company/invoice",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

 //get Vendor List
 this.getVendorList = function () {
    var Assign = $http({
        method: "Get",
        url: AuthHeaderService.getApiURL() + "web/registered/vendors",
        headers: AuthHeaderService.getHeader()
    });
    return Assign;
};

//get Adjuster List
this.getAdjusterList = function (param) {

    var response = $http({
        method: "Post",
        url: AuthHeaderService.getApiURL() + "web/company/adjusters",
        data: param,
        headers: AuthHeaderService.getHeader()
    });
    return response;
}

// /list/invoice/status
this.getStatusList = function () {
    var Assign = $http({
        method: "Get",
        url: AuthHeaderService.getApiURL() + "web/list/invoice/status",
        headers: AuthHeaderService.getHeader()
    });
    return Assign;
};



 
    
});
