angular.module('MetronicApp').service('VendorLoginService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    this.LogIn = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/login",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    this.GetVersionNumber = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "application/buildinfo",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
}]);