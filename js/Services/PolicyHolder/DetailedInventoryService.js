angular.module('MetronicApp').service('DetailedInventoryService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    this.getPostLostItemsWithComparables = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/line/items",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.getRoomTypes = function (isUserRoomsExit) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/room/types?fetch_default_rooms=" + isUserRoomsExit,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    this.addNewRoom = function (req) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "customer/add/room",
            data: req,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    this.getRooms = function (q) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "customer/claim/" + q + "/rooms",
            //data: req,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.deleteRoom = function (q) {
        var response = $http({
            method: "DELETE",
            url: AuthHeaderService.getApiURL() + "customer/delete/room/" + q.id,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    this.updateRoom = function (req) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "customer/update/room",
            data: req,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.getRoomDetails = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "customer/room/details/" + param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.getCategories = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/categories",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    //Post loss
    this.AddPostLossItem = function (param) {
        var AddPostLoss = $http({
            method: "Post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/add/itemtopostloss",
            headers: AuthHeaderService.getFileHeader()
        });
        return AddPostLoss;
    }
    this.DeleteLostDamageItem = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/remove/postlossitem",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.addMultipleRooms = function (req, claimId) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "customer/add/multiple/rooms/" + claimId,
            data: req,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.getInventoryInfo = function (claimId) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "customer/inventory/summary/" + claimId,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.getRoomInventory = function (param) {
        var response = $http({
            method: "GET",
            url: `${AuthHeaderService.getApiURL()}customer/room/inventory/${param.roomId}?page=${param.page}&limit=${param.limit}${param.searchKey && param.searchKey.length ? '&q=' + param.searchKey : ''}${param.categories && param.categories.length ? '&filter_category=' + param.categories : ''}`,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

}]);

