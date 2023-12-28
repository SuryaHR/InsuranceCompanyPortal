angular.module('MetronicApp').service('ClaimCenterDashboardService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    //get perticular list of claims for manager
    this.getFNOLSubmissionList = function (param) {    
        var response = $http({
            method: "Post",          
            url: AuthHeaderService.getApiURL() + "web/claims",
            data: param,
            headers: AuthHeaderService.getHeader()
        });       
        return response;
    }
    //Global search
    this.GetSearchResult = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/search/claims",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
}]);