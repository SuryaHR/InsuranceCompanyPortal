angular.module('MetronicApp').service('AddEditThirdPartyInventoryService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    //API #29
    this.GetItemTypeList = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/vendor/catalogitemtypes",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    this.GetItemDetails = function (param) {
        var details = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/vendor/catalogitem/detail",
            data:param,
            headers: AuthHeaderService.getHeader()
        });
        return details;
    }
    this.SaveItem=function(param)
    {
        var saveDetails = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/add/vendor/catalogitem",
            data: param,
            headers:AuthHeaderService.getHeader()
        });
        return saveDetails;
    }

    this.UpdateItem = function (param) {
        var saveDetails = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/update/vendor/catalogitem",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return saveDetails;
    }
   
}]);