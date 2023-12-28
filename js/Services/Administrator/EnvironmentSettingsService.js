angular.module('MetronicApp').service('EnvironmentSettingsService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    
    this.GetServiceRequestCategories = function (param) {
        var State = $http({
            method: "POST",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/service/category/list",
            headers: AuthHeaderService.getHeader()
        });
        return State;
    };

    this.AddServiceRequestCategories = function (param) {
        var State = $http({
            method: "POST",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/service/category",
            headers: AuthHeaderService.getHeader()
        });
        return State;
    };

    this.UpdateServiceRequestCategories = function (param) {
        var State = $http({
            method: "Put",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/service/category",
            headers: AuthHeaderService.getHeader()
        });
        return State;
    };

    this.DeleteServiceRequestCategories = function (param) {
        var State = $http({
            method: "Delete",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/service/category",
            headers: AuthHeaderService.getHeader()
        });
        return State;
    };


    this.GetContentService = function () {
        var State = $http({
            method: "Get",
            //data: param,
            url: AuthHeaderService.getApiURL() + "web/contentservices", 
            headers: AuthHeaderService.getHeader()
        });
        return State;
    };

    this.AddContentService = function (param) {
        var State = $http({
            method: "POST",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/admin/add/contentservice",
            headers: AuthHeaderService.getHeader()
        });
        return State;
    };

    this.UpdateContentService = function (param) {
        var State = $http({
            method: "Post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/admin/update/contentservice",
            headers: AuthHeaderService.getHeader()
        });
        return State;
    };

    this.DeleteContentService = function (param) {
        var State = $http({
            method: "Delete",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/admin/delete/contentservice",
            headers: AuthHeaderService.getHeader()
        });
        return State;
    };

    //Get Email Templates
    this.GetEmailTemplatesList = function () {
         
        var data = $http({
            method: "Get",
            //data: param,
            url: AuthHeaderService.getApiURL() + "web/email/templates", 
            headers: AuthHeaderService.getHeader()
        });
        return data;
    };
    //Add EmailTemplates
    this.AddEmailTemplate = function (param) {
        var State = $http({
            method: "Post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/email/template",
            headers: AuthHeaderService.getHeader()
        });
        return State;
    };

    //Update EmailTemplates
    this.UpdateEmailTemplate = function (param) {
         
        var State = $http({
            method: "PUT",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/email/template",
            headers: AuthHeaderService.getHeader()
        });
        return State;
    };

    //Delete EmailTemplates
    this.DeleteEmailTemplate = function (param) {
         
        var State = $http({
            method: "DELETE",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/email/template",
            headers: AuthHeaderService.getHeader()
        });
        return State;
    };
    //Get email template details
    this.GetEmailTemplatesDetails = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/email/template/details",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.getPolicyholderPortalSettingsService = function () {
        var State = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "customer/policyholder/preferences", 
            headers: AuthHeaderService.getHeader()
        });
        return State;
    };

    this.updateReportSettings = function (Param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "customer/policyholder/preferences",
            data: Param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.resetToDefault = function (Param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "customer/policyholder/preferences",
            data: Param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
}]);