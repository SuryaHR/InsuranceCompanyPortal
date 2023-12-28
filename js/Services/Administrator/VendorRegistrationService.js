angular.module('MetronicApp').service('VendorRegistrationService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    this.GetVendorsList = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/artigem/vendors",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.getStates = function (param) {
        var response = $http({
            method: "post",
            url: AuthHeaderService.getApiURL() + "web/states",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    this.CreateRequest = function (param) {
        var response = $http({
            method: "post",
            url: AuthHeaderService.getApiURL() + "web/add/create/request/vendor",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    this.InviteVendor = function (param) {
        var response = $http({
            method: "post",
            url: AuthHeaderService.getApiURL() + "web/invite/exist/vendors",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //Service for get the list of email templates 588
    this.GetEmailTemplates = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/email/templates",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    this.GetEmailTemplateDetails = function (param) {
        var response = $http({
            method: "post",
            url: AuthHeaderService.getApiURL() + "web/email/template/details",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    //PAI#348 Service to get the content services
    this.GetServiceProvided = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/contentservices",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    //API#29 get category list
    this.GetCategories = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/claim/get/category",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
}]);