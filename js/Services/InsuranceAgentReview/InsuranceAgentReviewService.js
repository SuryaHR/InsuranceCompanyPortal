angular.module('MetronicApp').service('InsuranceAgentReviewService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {    
    //Insurance Agent review
    this.AgentReview = function(param){
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/review/appraisals",
            data:param,
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }
}]);