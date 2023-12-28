angular.module('MetronicApp').service('CategoryService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    this.GetCategoryList = function () {
        var response = $http({
            method: "Get",
                url: AuthHeaderService.getApiURL() + "web/categories",            
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    this.GetSubCategoryList = function (param) {
        var response = $http({
            method: "post",
            url: AuthHeaderService.getApiURL() + "web/item/subcategories",
            data:param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    this.AddUpdateCategory = function (param) {
        var CategoryResponse = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/category/manage",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return CategoryResponse;
    }
}]);