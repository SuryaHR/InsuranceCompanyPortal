//
angular.module('MetronicApp').service('LoginService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
   
    this.LogIn = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/login",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    //626 Service for create request to artigem admin for create new user. (This API not need login token )
    this.registerUser = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/new/request/adjuster",
            data: param,
            headers: AuthHeaderService.getHeaderWithoutToken()
        });
        return response;
    }
    // getCaptchaDetails
    this.getCaptchaDetails = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/get/captcha",
           headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-Auth-Token": sessionStorage.getItem("AccessToken"),
            "X-originator": sessionStorage.getItem("Xoriginator"),
            "Pragma": 'no-cache'
           }
           //headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    //this.GetVersionNumber = function () {        
    //    var response = $http({
    //        method: "Get",
    //        url: ConfigSettings.apiurl + "application/buildinfo",
    //        headers: {
    //            "Content-Type": "application/json",
    //            "Accept": "application/json",
    //            "X-originator": ConfigSettings.Xoriginator
    //        }
    //    });
    //    return response;
    //}
    this.getCompanyDetails = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/company-logo",
            headers: AuthHeaderService.getHeaderWithoutToken()
        });
        return response;
    }

    this.getSAMLRedirectionURL = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/saml/authrequest",
            headers: AuthHeaderService.getHeaderWithoutToken()
        });
        return response;
    }

    this.GetCompanyBackgroundImages = function (Param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/company-backgroundImage",
            headers: AuthHeaderService.getHeaderWithoutToken()
        });
        return response;
    };


    this.getVendorDetails = function (param) {
        var response = $http({
            method: "POST",
            url : AuthHeaderService.getApiURL() + "web/vendor/logo/details",
            headers : AuthHeaderService.getHeader(),
            data: param,
        });
        return response;
    }

}]);