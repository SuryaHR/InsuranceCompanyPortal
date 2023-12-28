angular.module('MetronicApp').service('AddPolicyService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    //Get states list
    this.getStates = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "customer/get/state/list",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    
    this.savePolicy = function (param) {
        var responseSave = $http({
            method: "POST",
            data: param,
            url: AuthHeaderService.getApiURL() + "customer/create/policy",
            headers: AuthHeaderService.getHeader()
        });
        return responseSave;
    }


    this.getHomeOwnerPolicyTypes = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "customer/get/homeowner/policytypes",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    this.getHomeOwnerPolicyTypesOnState = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/policytypes?stateId="+param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

}]);