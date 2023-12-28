angular.module('MetronicApp').service('PolicyHolderHomeService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    this.getAgentDetails = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/insured/agent",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    //API #247
    this.getPolicyList = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/insured/policies",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
}]);