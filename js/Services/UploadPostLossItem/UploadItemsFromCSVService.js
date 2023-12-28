angular.module('MetronicApp').service('UploadItemsFromCSVService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    //Get items form post loss
    this.UploadItemExcelFile = function (param) {
        var saveDetails = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/read/postloss/items",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return saveDetails;
    }
    //Api #250
    this.UploadItemList = function (param) {
        var saveDetails = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/import/postloss/items",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return saveDetails;
    }

    // Room Types
    this.roomTypes = function () {
        var saveDetails = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/room/types",
            headers: AuthHeaderService.getHeader()
        });
        return saveDetails;
    }
}]);