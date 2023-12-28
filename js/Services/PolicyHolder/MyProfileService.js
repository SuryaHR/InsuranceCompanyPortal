angular.module('MetronicApp').service('MyProfileService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    //Update profile info

    this.UpdateProfile = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/update/user/profile",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    //Get state
    this.getStates = function (param) {
        var response = $http({
            method: "post",
            url: AuthHeaderService.getApiURL() + "web/states",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    //Get polcyholder details
    this.getPolicyHolderdetails = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/policyholder/details",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    //Change password
    this.ChangePassword = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/update/password",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
}]);
