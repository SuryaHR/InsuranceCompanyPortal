angular.module('MetronicApp').service('LineItemService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    //LineItemService.js contains all common functions of Line Item to be used by all Insurance users
    //Service to update Line Item status
    this.updateItemStatus = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/item/update/status",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
      // bulk Update items Category
      this.bulkUpdateCategory = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/bulk/update/item/category",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    
    // bulk update items status
    this.bulkUpdateStatus = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/bulk/update/item/status",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    // Delete Message added aganist a item
    this.deleteMessage = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/delete/message",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
     //Add update custome item
    this.AddCustomItem = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/add/custom/item",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    };
    this.updateCustomItem = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/update/custom/item",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    };

    this.deleteCustomItem = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/delete/custom/item?id="+param,
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    };

    this.deleteMediaFile = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/delete/customAttachment?id="+param,
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.getShippingMethods = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/item/shipping/methods",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };


    // update Items Log History
    this.updateItemsLogHistory = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/bulk/update/item/status/history",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };


}]);