angular.module('MetronicApp').service('NewItemDamageLostService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    this.getCategory = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/categories",            
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    this.GetSubCategory = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/item/subcategories",
            data:param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

}]);