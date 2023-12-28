angular.module('MetronicApp').service('MyPaymentService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

 
    //API #34
    this.getStates = function () {

        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/states",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    //API #34
    this.getAgentDetails = function () {

        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/insured/agent",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
}]);