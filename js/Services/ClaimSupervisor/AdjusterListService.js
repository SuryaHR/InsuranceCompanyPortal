angular.module('MetronicApp').service('AdjusterListService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    //API #34
    this.getAdjusterList = function (param) {

        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/company/adjusters",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //API #64
    this.assignClaim=function(param)
    {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/adjuster/claim/reassign",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;

    }

    //API #83
    this.assignPostLostItem = function (param) {

        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/assign",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;

    }
}]);
