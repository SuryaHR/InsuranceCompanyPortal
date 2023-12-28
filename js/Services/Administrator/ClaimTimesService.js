angular.module('MetronicApp').service('ClaimTimesService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    this.getClaimTimes = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/fetch/claimTimes",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }


    this.saveClaimTimes = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/save/claimTimes",
            headers: AuthHeaderService.getHeader(),
            data:param
        });
        return response;
    }
}]);