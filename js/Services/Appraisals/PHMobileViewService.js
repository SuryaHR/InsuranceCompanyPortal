angular.module('MetronicApp').service('PHMobileViewService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    //Update profile info

    this.ValidateMobileNumber = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/validate/sms/lastdigits",
            data: param,
            headers: AuthHeaderService.getHeaderWithoutToken()
        });
        return response;
    }; 

        this.LikeComparable = function (param) {
            var response = $http({
                method: "POST",               
                url: AuthHeaderService.getMobileApiURL() + "web/update/policyholder/item/comparables",
                data: param,
                headers: AuthHeaderService.getHeaderWithoutTokenMobile()
            });
            return response;
        };
}]);