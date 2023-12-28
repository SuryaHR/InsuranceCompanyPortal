angular.module('MetronicApp').service('ReportService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    this.GetDetails = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/report/claim/items/statistics?claimNum=" + param.claimNumber + "&page=" + param.page + "&limit=" + param.limit
                + "&sort_by=" + param.sortBy + "&order_by=" + param.orderBy + (param.q ? "&q=" + param.q : ''),
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.GetPaymentSummary = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/report/claim/item/payment/statistics",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    this.GetItemsReplacedOrPaid = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/report/claim/itemcost/statistics",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.GetAboveLimitItems = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/report/claim/category/statistics",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };


    this.exportDetailedInventory = function (param) {
        var responsepdf = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/export/detailed/inventory?claim=" + param.claimNumber + "&format=" + param.format,
            headers: AuthHeaderService.getHeader(),
            responseType: 'arraybuffer'
        });
        return responsepdf;
    };
    this.GetRepotPaymentPDF = function (param) {
        var responsepdf = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/export/claim/payment/statistics",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return responsepdf;
    };
    this.GetRepotCategoryPDF = function (param) {
        var responsepdf = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/export/claim/category/statistics",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return responsepdf;
    };
    this.GetRepotReplacementPDF = function (param) {
        var responsepdf = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/export/claim/itemcost/statistics",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return responsepdf;
    };

    this.sendContentSummaryMailToPolicyholder = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/report/send/mail/contentSummary?claimNumber=" + param.claimNumber,
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.getPaymentInfo = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/get/paymentInfo?paymentInfoId=" + param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    
    this.downloadPaymentInfoPDF = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/download/paymentInfo/pdf?paymentInfoId=" + param,
            headers: AuthHeaderService.getHeader(),
            responseType: 'arraybuffer'
        });
        return response;
    };

    this.getAllSubCategories = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/claim/get/all/subcategory",
            headers: AuthHeaderService.getHeader(),
        });
        return response;
    };

    
}]);
