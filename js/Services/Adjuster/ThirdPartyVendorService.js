angular.module('MetronicApp').service('ThirdPartyVendorService', function ($http, $rootScope, AuthHeaderService) {

    //API #116
    this.getVendorList = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL()
                + "web/registered/vendors" +"?page=" +param.page + "&q=" + param.searchKey + "&sort_by=" + param.sortBy + "&order_by=" + param.orderBy + "&limit=" + param.limit,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    //Get all vendor services
    this.GetAllVendorServices = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/vendor/services",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    //API#55
    this.inviteVendor = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/invite/vendor",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
//New API to get vendor details
    this.GetVendorReqDetails= function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/registration/vendor/details",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    // getThirdPartyReport
    this.getThirdPartyReport = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/export/registered/vendors",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
});
