angular.module('MetronicApp').service('AssignLineItemService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    //Assign Claim to adjuster #23
    this.AssignLineItem = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/assign",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    this.GetAdjusterList = function (param) {
      
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/get/adjuster/" + param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }


    //Get category API #29
    this.getCategory = function () {
     
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/claim/get/category",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //Add item notes API #30
    this.getSubCategory = function (param) {
      
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/item/subcategories",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //API #34
    this.getAdjusterList = function (param) {

        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/company/adjusters",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }


    //API #116
    this.getThirdPartyVendor = function (param) {

        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/company/vendors",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //API #40
    this.getPricingSpecialist = function (param) {

        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/price/specialist",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
}]);