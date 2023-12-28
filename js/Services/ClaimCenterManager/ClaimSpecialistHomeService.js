angular.module('MetronicApp').service('ClaimSpecialistHomeService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    //Pricing Specialists list
    this.GetPricingSpecialistsList = function (param) {
        var SpecialistList = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/price/specialist",
            data: param,
            headers:AuthHeaderService.getHeader()
        });
        return SpecialistList;        
    }
    //Get Category Lis
    this.GetCategoryList = function (param) {
        var GetCategoryList = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/categories",
            headers: AuthHeaderService.getHeader()
        });
        return GetCategoryList;
    }

}]);