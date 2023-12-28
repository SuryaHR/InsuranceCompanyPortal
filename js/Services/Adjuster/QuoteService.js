angular.module('MetronicApp').service('QuoteService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    //get all states #123
    this.getStates = function (param) {

        var response = $http({
            method: "post",
            url: AuthHeaderService.getApiURL() + "web/states",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //get claim status details for content section- API #158
    this.getClaimContents = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/adjuster/claim/contents",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //get claim status details for content section- API #158
    this.getInsuranceCompanyDetails = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/get/claim/insuracecompany/detail",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.getQuoteDetails = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/vendor/quote/details?quoteNumber="+param.quoteNumber,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.exportQuoteToPDF = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/vendor/quote/PDF",
            data: param,
            headers: AuthHeaderService.getHeader(),
            responseType: 'arraybuffer'
        })
        return response;
    };

    this.GetReplacementItem = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/replacement/items",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.updateQuoteDetails = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/update/vendor/quote",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
}]);