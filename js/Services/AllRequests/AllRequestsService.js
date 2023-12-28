angular.module('MetronicApp').service('AllRequestsService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    //get Request List
    this.GetRequestList = function (param) {
        var response = $http({
            method: "GET",
            cache: false,
            url: AuthHeaderService.getApiURL() + "web/claim/requests?claimid="+param.id,
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    
    this.GetParticipants = function (param) {
        var response = $http({
            method: "Post",
            cache: false,
            url: AuthHeaderService.getApiURL() + "web/claim/participants",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //Get Upcoming requests
    this.getList = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/myrequests",

            headers: AuthHeaderService.getHeader()
        })
        return response;
    }
}]);