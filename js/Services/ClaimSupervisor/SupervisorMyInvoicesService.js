angular.module('MetronicApp').service('SupervisorMyInvoicesService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
      
    //get vendor invoice list API# 237
    this.getVendorInvoiceList = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/item/invoices/underreview",
            data: param,
            headers: AuthHeaderService.getHeader()
        })
        return response;
    } 

}]);