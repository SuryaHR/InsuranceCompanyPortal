angular.module('MetronicApp').service('SupervisorAllClaimsService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    //get  list of all claims
    this.getClaimsInProgress = function (param) {

        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claims",
            data: param,
            headers: AuthHeaderService.getHeader()
        });

        return response;
    }
    
     //get  list of all claims
     this.getAllClaims = function (param) {

        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/supervisor/all_claims",
            data: param,
            headers: AuthHeaderService.getHeader()
        });

        return response;
    }

    //API #34
    this.getAdjusterList = function (param) {

        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/company/adjusters",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
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

    // getAllCliams
    this.getAllClaimsReport = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/export/claims",
            data: param,
            headers: AuthHeaderService.getHeader(),
            responseType: 'arraybuffer'
        });
        return response;
    }

}]);
