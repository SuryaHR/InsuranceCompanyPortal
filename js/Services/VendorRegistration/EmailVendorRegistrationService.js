angular.module('MetronicApp').service('EmailVendorRegistrationService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    this.addVendor = function () {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/registration/vendor/details",
            headers: AuthHeaderService.getHeaderWithoutToken()
            //headers: AuthHeaderService.getHeader()

        });
        return response;
    }
}]);