angular.module('MetronicApp').service('PolicyDetailsService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    this.UpdatePolicyDetails = function(param){
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/update/policydetails",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

      //get policy details
      this.getPolicyDetails = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/policy/info",
            data: param,
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }

    this.UpdatePolicyholderDetails = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/update/policyholder",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

     this.getPolicyType = function (param) {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/policytypes?stateId="+param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //get all states #123
    this.getStates = function (param) {
        var response = $http({
            method: "post",
            url: AuthHeaderService.getApiURL() + "web/states",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //getCategoryCoverage
    this.getCategoryCoverage = function (param) {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/claim/get/category/coverage?stateId="+param.stateId+"&policyTypeId="+param.policyTypeId,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.resetUserPassword = function (param) {
        var User = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/admin/reset/password/"+param.id,           
            headers: AuthHeaderService.getHeader()
        });
        return User;
    };

}]);