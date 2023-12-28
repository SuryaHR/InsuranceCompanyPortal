angular.module('MetronicApp').service('ArtigemReviewService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    
   //artigemReview
    this.ArtigemReview = function(param){

        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/review/appraisals",
            data:param,
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }


   

}]);

