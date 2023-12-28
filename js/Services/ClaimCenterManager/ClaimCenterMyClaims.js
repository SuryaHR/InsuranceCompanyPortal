angular.module('MetronicApp').service('ClaimCenterMyClaimdService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    //get perticular list of claims for manager
    this.getMyClaimList = function (param) {      
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claims",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    this.AddNewLostDamageItem = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/add/itemtopostloss",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
   
}]); 