angular.module('MetronicApp').service('AllReplQuotesService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    
    this.getReplacementEstimate = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/download/replacement/summary?fileType="+param.fileType,
            data: param,
            headers: AuthHeaderService.getHeader(),
            responseType: 'arraybuffer'
        })
        return response;
    };

    this.getQuotesByAssignment = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/assignment/quotes?claimNumber="+param,
            data: param,
            headers: AuthHeaderService.getHeader(),
        })
        return response;
    };

}]);
