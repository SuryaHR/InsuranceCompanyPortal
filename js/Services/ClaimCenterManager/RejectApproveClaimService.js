angular.module('MetronicApp').service('RejectApproveClaimService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    //Reject Claim 190
    this.RejectOrApproveClaim = function (param) {
        
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/approval",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }  
}]);