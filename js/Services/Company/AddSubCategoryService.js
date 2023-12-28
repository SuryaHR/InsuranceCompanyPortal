angular.module('MetronicApp').service('AddSubCategoryService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    this.NewSubCategory=function(param)
    {
        
        var AddNewSubCategory = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/add/subcategories",
            data:param,
            headers: AuthHeaderService.getHeader()
        });
        return AddNewSubCategory;
    }
    this.UpdateSubCategory=function(param){
        var UpdateCategory = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/update/subcategories",
            data: param,
            headers:AuthHeaderService.getHeader()
        });
        return UpdateCategory;
}
}]);