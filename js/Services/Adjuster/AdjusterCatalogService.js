angular.module('MetronicApp').service('AdjusterCatalogService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    //API #261 Get catalogs list
    this.GetCatalogs = function (param) {
        var details = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/vendor/catalogs",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return details;
    };

    this.GetCatalogSatusList = function () {
        var details = $http({
            method: "get",
            url: AuthHeaderService.getApiURL() + "web/vendor/catalog/statuslist",
            headers: AuthHeaderService.getHeader()
        });
        return details;
    };

    //API #266
    this.ChangeCatalogStatus = function (param) {
        var details = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/change/vendor/catalog/status",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return details;
    }

    this.GetCatalogItemList = function (param) {
        var details = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/vendor/catalog/items",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return details;
    }
    //API #249
    this.addNewCatalog = function (param) {
        var details = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/manage/vendor/catalog",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return details;
    }
    //API 48 A
    this.addUpdateCatalogItem = function (param) {
        var details = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/vendor/catalogitem",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return details;
    }

    //api #29 item types
    this.GetItemTypeList = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/claim/get/category",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    this.GetItemDetails = function (param) {
        var details = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/vendor/catalog/itemdetails",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return details;
    }
    this.SaveItem = function (param) {
        var saveDetails = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/vendor/catalogitem",
            data: param,
            headers: AuthHeaderService.getFileHeader()
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
    this.GetCatalogDetails = function (param) {
        var GetDetails = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/vendor/catalog/details",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return GetDetails;
    }
}]);