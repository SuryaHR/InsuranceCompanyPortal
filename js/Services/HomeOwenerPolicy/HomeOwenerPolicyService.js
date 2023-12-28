angular.module('MetronicApp').service('HomeOwenerPolicyService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    this.getPolicytype = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/policytypes",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    this.getCategory = function () {
        var responseCat = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/categories",
            headers: AuthHeaderService.getHeader()
        });
        return responseCat;
    }
   
    this.GetPolicyTypeDetails = function (param) {
        var responseDetails = $http({
            method: "POST",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/homeinsurance/policytype",
            headers: AuthHeaderService.getHeader()
        });
        return responseDetails;
    }
    
    this.SavePolicyType = function (param) {
        var responseSave = $http({
            method: "POST",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/manage/homeinsurance/policytype",
            headers: AuthHeaderService.getHeader()
        });
        return responseSave;
    }
    this.getState = function (param) {
        var responsegetState = $http({
            method: "POST",
            data:param,
            url: AuthHeaderService.getApiURL() + "web/states",
            headers: AuthHeaderService.getHeader()
        });
        return responsegetState;
    };

    this.filterByState = function (param) {
        var responsegetState = $http({
            method: "POST",
            data:param,
            url: AuthHeaderService.getApiURL() + "web/homeinsurance/policytype",
            headers: AuthHeaderService.getHeader()
        });
        return responsegetState;
    }

    this.getPolicyInfoByState = function(param){
        var policyInfoByState = $http({
            method: "POST",
            data:param,
            url: AuthHeaderService.getApiURL() + "web/homeinsurance/policytype/typename",
            headers: AuthHeaderService.getHeader()
        });
        return policyInfoByState;
    }
}]);