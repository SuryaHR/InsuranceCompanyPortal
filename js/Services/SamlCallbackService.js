//
angular.module('MetronicApp').service('SamlCallbackService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
   
     
    // getLoginDetails
    this.getLoginDetails = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/saml/company",
           headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-Auth-Token": sessionStorage.getItem("AccessToken"),
            "X-originator": sessionStorage.getItem("Xoriginator"),
            "Pragma": 'no-cache'
           }
        });
        return response;
    }
    
    this.getCompanyDetails = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/company-logo",
            headers: AuthHeaderService.getHeaderWithoutToken()
        });
        return response;
    }

    

}]);