angular.module('MetronicApp').service('ClaimSpecialistsService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    //Get Specialist List 40
    this.GetSpecialist = function (param) {
        var list = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/price/specialist",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return list;
    }
    //Get Category List 29 30
    this.GetCategoryList = function () {
        var GetCategoryList = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/categories",
            headers: AuthHeaderService.getHeader()
        });
        return GetCategoryList;
    }
    //Assign Category to specialist    #41 
    this.AssignCategoryToSpecialist = function (param) {
            var AssignCategoryToSpecialist = $http({
                method: "Post",
                url: AuthHeaderService.getApiURL() + "web/update/speciality",
                data: param,
                headers: AuthHeaderService.getHeader()             
            });
            return AssignCategoryToSpecialist;
        }
}]);