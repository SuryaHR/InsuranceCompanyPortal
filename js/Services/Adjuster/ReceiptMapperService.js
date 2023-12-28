angular.module('MetronicApp').service('ReceiptMapperService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    this.getCategories = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/categories",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    this.MapReceiptAgainstItem = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/map/receipt",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    };
    //Get item list
    this.GetItemListForReceipt = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/line/items",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //Upload receipt
    this.uploadReceiptAgainestClaimId = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/upload/receipt",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    };

    //Get existing pdf receipts list
    this.getMappedReceiptsList = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/pdf/list/date",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    //Get existing pdf receipts list fro mapping not by date
    this.getReceiptsList = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/mapper/pdflist",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    // get the path of the receipts
    this.getReceiptPath = function (paramUrl) {
        var response = AuthHeaderService.getReceiptURL();
        //return response + paramUrl;
        return paramUrl;
    }

    //Save new mapped item against claimed list items
    this.saveMappedClaimItem = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/mapper/post/attachitemreplacementcost/",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //get alrady mapped items against claimed list of items
    this.getMappedLineItemsList = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/mapper/get/mappedlineitems",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //update existing mapped item
    this.updateMappedLineItem = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/mapper/edit/mappedlineitem",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };


    //delete existing mapped item of the receipt 
    this.deleteMappedLineItem = function (param) {
        var response = $http({
            method: "DELETE",
            url: AuthHeaderService.getApiURL() + "web/mapper/delete/mappedlineitem",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //Label APIs
    //update existing mapped item
    this.AddLabel = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/add/pdf/tag",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    this.Deletelabel = function (param) {
        var response = $http({
            method: "DELETE",
            url: AuthHeaderService.getApiURL() + "web/delete/pdf/tags",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    this.Getlabel = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/pdf/tags",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //Update item status to settled
    this.updateItemStatusSettled = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/mapper/post/updateItemStatusSettled/",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };


    this.GetSettlementSummaryPDF = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/settlement/PDF",
            data: param,
            headers: AuthHeaderService.getHeader(),
            responseType: 'arraybuffer'

        });
        return response;
    };
}]);
