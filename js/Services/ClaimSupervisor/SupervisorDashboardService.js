angular.module('MetronicApp').service('SupervisorDashboardService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
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

    //get vendor invoice list API# 237
    this.getVendorInvoiceList = function (param) {
        var response = $http({
            method: "Post",
            //url: AuthHeaderService.getApiURL() + "web/invoices/underreview",
            url: AuthHeaderService.getApiURL() + "web/item/invoices/underreview",
            data: param,
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }    

    //API#568 Service for get claim list of supervisor
    this.GetClaimList = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/supervisor/claims",
            data: param,
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }

    this.GetItemList = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/supervisor/items",
            data: param,
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }

    this.supervisorApprovals = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/supervisor/claims",
            data: param,
            headers: AuthHeaderService.getHeader()
        })
        return response;
    };

    this.getAdjusterList = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/supervisor/adjuster",
            headers: AuthHeaderService.getHeader()
        })
        return response;
    };

    this.getAdjusterDetailsWithClaim = function (param) {
        var response = $http({
            method: "post",
            url: AuthHeaderService.getApiURL() + "web/supervisor/adjuster/details",
            data:param,
            headers: AuthHeaderService.getHeader()
        })
        return response;
    };

    this.getImmediateClaims = function(userId){
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/get/immediate/attention/claims?userId="+userId,
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }

    // this.getAllImmediateClaims = function(userId){
    //     var response = $http({
    //         method: "GET",
    //         url: AuthHeaderService.getApiURL() + "web/get/all/immediate/claims?userId="+userId,
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
    
    // getPendingVendorInvoices
    this.getPendingVendorInvoices = function(param){
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/get/company/invoicelist",
            data: param,
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }
    //getsupervisorscorecard
    this.getClaimSupervisorScoreCard = function(param){
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/claims/scorecard?statusFlag="+param.statusFlag,
            
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }

}]);