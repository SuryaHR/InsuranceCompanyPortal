angular.module('MetronicApp').service('UnderWriterReviewService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    
    //underwriter review
    this.UnderWriterReview = function(param){

    var xOriginator = sessionStorage.getItem("Xoriginator");
    param.xOriginator = xOriginator;
    var response = $http({
    method: "POST",
    url: AuthHeaderService.getApiURL() + "web/review/appraisals",
    data:param,
    headers: AuthHeaderService.getHeader()
    })
    return response;
    }


   

}]);