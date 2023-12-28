angular.module('MetronicApp').service('JewelryCustomComparableService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {


    this.getSpeedcheValues = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getSpeedCheckApiURL() + "web/get/speedcheck/values",
            data: param,
            headers: {
                "Content-Type": "application/json"
            }
        });
        return response;
    }

    //Get Dropdown List
    this.getDropdowns = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/get/appraisal/dropdowns",
            data: '',
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //getSpeedcheMapping 
    this.getSpeedcheMapping = function () {
        //var data={};
        var response = $http.get('views/SpeedCheckContact/Dashboard/Appraisals/SpeedCheckMapping.json')
            .success(function (data) {
                data = data;// console.log(data);
            })
            .error(function (data) {
                //console.log("Error getting data from " + thisCtrl.route);
            });
        return response;
    }

    //getAvgStoneCount
    this.getAvgStoneCount = function (param) {
        var response = $http({
            method: "post",
            url: AuthHeaderService.getApiURL() + "web/get/average/count",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //sending SMS to pH
    this.sendSMSToPolicyholder = function (param) {
        var response = $http({
            method: "post",
            url: AuthHeaderService.getApiURL() + "web/policyholder/replacement/sms",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //sending SMS to pH
    this.sendEmailToPolicyholder = function (param) {
        var response = $http({
            method: "post",
            url: AuthHeaderService.getApiURL() + "web/policyholder/replacement/email",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    // Add custome comparable for Jewelary components
    this.AddJewelryCustomItem = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/save/custom/jewelry/replacement",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    }

    this.AddCustomItem = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/save/whole/custom/jewelry/replacement",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    };

    // Update custome comparable for Jewelary components
    this.updateJewelryCustomItem = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/update/custom/jewelry/replacement",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    };

     // Update custome comparable for Jewelary components
     this.getWholeJewelryCustomItem = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/get/whole/custom/jewelry/replacement?itemReplacementId=" + param,
            data: param,
            headers: AuthHeaderService.getHeaderWithoutToken()
        });
        return response;
    };


     //get insurance details
     this.GetInsuranceDetails = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/get/claim/insuracecompany/detail",
            data: param,
            headers: AuthHeaderService.getHeaderWithoutToken()
        });
        return response;
    };
    
    //Get item single details on id #144
    this.getItemDetails=function(param)
    {
        var details = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/itemdetails",
            data: param,
            headers: AuthHeaderService.getHeaderWithoutToken()
        });
        return details;
    }

    this.validateMobileNum=function(param)
    {
        var details = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/validate/jewlery/sms/lastdigits",
            data: param,
            headers: AuthHeaderService.getHeaderWithoutToken()
        });
        return details;
    }

    // Update Favourite Item for Jewelary component
    this.updateFavouriteItem = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/update/custom/jewelry/item/favourite",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    // Delete Comparable Item for Jewelary component
    this.deleteComparableItem = function (param) {
        var response = $http({
            method: "DELETE",
            url: AuthHeaderService.getApiURL() + "web/delete/custom/jewelry/item",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.sendMailToAssociate = function(param)
    {
        var details = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/send/email/vendorAssociate",
            data:param,
            headers: AuthHeaderService.getHeaderWithoutToken()
        });
        return details;
    }

    this.getVendorDetails = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/vendor-logo",
            headers: AuthHeaderService.getHeaderWithoutToken()
        });
        return response;
    }

    // Delete jewelary comparable
    this.deleteCustomItem = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/delete/custom/itemById?id="+param,
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    };

    // Update Favourite Item for Jewelary component
    this.updateLikeItem = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/update/custom/jewelry/item/like",
            data: param,
            headers: AuthHeaderService.getHeaderWithoutToken()
        });
        return response;
    };

    // Delete jewelary comparable
    this.deleteAllSubCustomItems = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/multiDelete/subItems/byParentId?id="+param,
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    };

}]);