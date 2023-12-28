angular.module('MetronicApp').service('AdjusterDashboardService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    //get  list of claims API #72- New #12
    this.getClaimsInProgress = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claims",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    this.getOpenClaims = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/open/claims",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    
    //get  notifications API #103- New -#43
    this.getNotification = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/get/claimfornotification",
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }
    //get  getClaimStatusList API #124
    this.getClaimStatusList = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/claim/statuslist",
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }

    //get result for global search from dashboard
    this.getSearchClaims = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/search/claims",
            data: param,
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }
    //get event list

    this.getEventList = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/myevents",

            headers: AuthHeaderService.getHeader()
        })
        return response;
    }

    //Get Global Search result for Vendor and Vendor Associate
    this.searchResultVendorAndAssociate = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/vendor/search/claims",
            data: param,
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }
    //Get Global Search result for Vendor and Vendor Associate
    this.GlobalSearch = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/search",
            data: param,
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }
    this.GetVendorDetails = function (param) {
        var details = $http({
            method: "Post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/vendor/details",
            headers: AuthHeaderService.getHeader()
        });
        return details;
    }
    this.getClaimStatus = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/claim/statuslist",
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }

    this.getImmediateClaims = function(userId){
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/get/immediate/attention/claims?userId=" + userId,
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }

    // this.getAllImmediateClaims = function(userId){
    //     var response = $http({
    //         method: "GET",
    //         url: AuthHeaderService.getApiURL() + "web/get/all/immediate/claims?userId=" + userId,
    //         headers: AuthHeaderService.getHeader()
    //     })
    //     return response;
    // }

    this.getAllImmediateClaims = function(param){
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/get/all/immediate/claims",
            data: param,
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }

    this.getPendingVendorInvoices = function(param){
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/get/company/invoicelist",
            data: param,
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }
    // getClaimScoreCard
    this.getClaimScoreCard = function(param){
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/claims/scorecard?statusFlag="+param.statusFlag,
            
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }
}]);