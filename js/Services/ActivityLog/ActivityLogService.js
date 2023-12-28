angular.module('MetronicApp').service('ActivityLogService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    this.GetItemLog = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/item/status/history",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    this.GetClaimItemsLog = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claimitems/status/history",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };


    this.GetClaimLog = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/assignment/history",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    
    this.getClaimLogPdf = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/export/claim_log/pdf",
            data: param,
            headers: AuthHeaderService.getHeader(),
            responseType: 'blob'
        });
        return response;
    };

    //Add custome ActivityLog
    this.AddCustomActivityLog = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/claim/add/custom/activitylog",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    };

    // this.getActivityEvents = function () {
    //     var response = $http({
    //         method: "GET",
    //         url: AuthHeaderService.getApiURL() + "web/claim/getActivityEvents",
    //         headers: AuthHeaderService.getHeader()
    //     })
    //     return response;
    // }
    
    
}]);