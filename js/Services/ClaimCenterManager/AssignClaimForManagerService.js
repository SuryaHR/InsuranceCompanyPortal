angular.module('MetronicApp').service('AssignClaimForManagerService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    //Assign Claim to adjuster 64
    this.AssignClaim = function (param) {        
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/assign",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    this.GetAdjusterList = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/company/adjusters",
            data:param,
            headers: AuthHeaderService.getHeader()
        });       
        return response;
    }

}]);