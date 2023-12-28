angular.module('MetronicApp').service('SalvageService', ['$http', 'AuthHeaderService', function ($http, AuthHeaderService) {

    this.GetPolishList = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/stone/polish",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    this.GetSymmetryList = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/stone/symmetry",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    this.GetFluorescenceList = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/stone/fluorescence",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.GetMetalTypeList = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/metal/type",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    this.GetMetalColorList = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/metal/color",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    this.GetStoneTypeList = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/stone/type",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.GetStoneColorList = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/stone/color",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.GetStoneShapeList = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/stone/shape",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    this.GetStoneClarityList = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/stone/clarity",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.GetPolicyHolderDetails = function (param) {
        var response = $http({
            method: "post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/policy/info",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    this.AddSalvage = function (param) {
        var response = $http({
            method: "post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/add/item/salvage/details",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    this.UpdateSalvage = function (param) {
        var response = $http({
            method: "post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/update/item/salvage/details",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.GetSalvageDetails = function (param) {
        var response = $http({
            method: "post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/claimitem/salvage/details",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.GetDropDownDetails = function (param) {
        var response = $http({
            method: "post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/salvage/dropdown/items",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    this.GetSalvageProfile = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/salvage/profile",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //API#606 service to get details of salvage item detail of luxury watch
    this.GetLuxuryWatchSalvageDetails = function (param) {
        var response = $http({
            method: "post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/get/salvage/item/details",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //API#623 Service to get the finished item salvage details from insurance company side
    this.GetFinishedItemDetails = function (param) {
        var response = $http({
            method: "post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/get/finishitem/salvage/details",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //API#622 Service for get details of  diamond item salvage
    this.GetDiamondSalvageDetails = function (param) {
        var response = $http({
            method: "post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/get/diamond/salvage/details",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    // SLVG-45, 46,, update salvage payment/buyout approval request
    this.updateSalvagePaymentRequest = function (param) {
        var response = $http({
            method: "POST",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/update/salvage/review/status",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.getInvoicesUnderItem = function (param) {
        var response = $http({
            method: "GET",          
            url: AuthHeaderService.getApiURL() + "web/list/invoices/item/"+param.itemId,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.estimateApproval = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/estimate/approval/decline/emailAndActivityLog",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

}]);