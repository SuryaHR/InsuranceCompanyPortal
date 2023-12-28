angular.module('MetronicApp').service('NewVendorRegistrationService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    //API #116
    this.getStates = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/states",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    //API #116
    this.addVendor = function () {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/add/vendor",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
}]);