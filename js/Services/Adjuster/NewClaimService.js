angular.module('MetronicApp').service('NewClaimService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    //API #440
    this.UpdatePolicyDetails = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/adjuster/update/policy",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };


    //Get policy holder info on email
    this.GetPolicyHolderDetails = function (param) { //api 184
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/policyholder/info",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }


    //API #424
    this.AddPolicyDetails = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/adjuster/create/policy",//"web/create/policy",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };


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

    //get Policy Type
    this.getPolicyType = function (param) {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/policytypes?stateId=" + param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //getCategoryCoverage
    this.getCategoryCoverage = function (param) {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/claim/get/category/coverage?stateId=" + param.stateId + "&policyTypeId=" + param.policyTypeId,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    //List with check sign
    this.GetCategoriesHomeAppliance = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/categories",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //Get list of policy for account no
    this.GetListOfPolicyForAccNo = function (param) {
        var GetPolicyList = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/insurance/info",
            headers: AuthHeaderService.getHeader(),
            data: param
        });
        return GetPolicyList;
    };

    //Policy details if exists
    this.GetPolicyAndClaimDetails = function (param) { //api 122
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/policy/info",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };


    //Get damage types 26
    this.getDamageType = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/property/damagetypes",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    //Get subCategory
    this.GetSubCategory = function (param) {
        var respSubCat = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/item/subcategories",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return respSubCat;
    };

    //Save claim details
    this.SaveClaimandReportDetails = function (param) {
        var respSubCat = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/adjuster/create/claim",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return respSubCat;
    };

    //Update claim details
    this.UpdateClaimandReportDetails = function (param) {
        var respSubCat = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/adjuster/update/claim",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return respSubCat;
    };
    //Update claim details
    this.UpdateClaimandReportDetails = function (param) {
        var respSubCat = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return respSubCat;
    };

    this.getPostLostItemsWithComparables = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/creation/line/items",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //Post loss
    this.AddPostLossItem = function (param) {
        var AddPostLoss = $http({
            method: "Post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/add/itemtopostloss",
            headers: AuthHeaderService.getFileHeader()
        });
        return AddPostLoss;
    };

    this.AddPostLossItems = function (param) {
        var AddPostLoss = $http({
            method: "Post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/add/itemstopostloss",
            headers: AuthHeaderService.getFileHeader()
        });
        return AddPostLoss;
    };

    this.UpdatePostLoss = function (param) {
        var UpdatePostLoss = $http({
            method: "post",
            url: AuthHeaderService.getApiURL() + "web/claim/update/postlossitem",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return UpdatePostLoss;
    }

    //Get Vendor assignment Details
    this.getCompanyBranchList = function (param) {
        var List = $http({
            method: "post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/company/details",
            headers: AuthHeaderService.getHeader()
        });
        return List;
    };
    this.AssignItemToVendor = function (param) {
        var Assign = $http({
            method: "POST",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/assignment/vendor",
            headers: AuthHeaderService.getHeader()
        });
        return Assign;
    };
    //get Vendor List
    this.getVendorList = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL()
                + "web/registered/vendors" + "?page=" + param.page + "&q=" + param.searchKey + "&sort_by=" + param.sortBy + "&order_by=" + param.orderBy + "&limit=" + param.limit
                + (!param.categoryIds.length ? '' : "&categories=" + param.categoryIds.join(',')),
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.getSelectedVendorDetails = function (param) {
        var VendorDetails = $http({
            method: "POST",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/assignment/vendor/details",
            headers: AuthHeaderService.getHeader()
        });
        return VendorDetails;
    };

    //get damage with template information type based on policy coverage amout value 590
    this.GetDamage = function (param) {
        var policyCoverage = $http({
            method: "POST",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/property/damagetype/data",
            headers: AuthHeaderService.getHeader()
        });
        return policyCoverage;
    };

    //Delete Post Loss Item API #93
    this.DeleteLostDamageItem = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/remove/postlossitem",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.getLossTypes = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/claim/loss/types",
            headers: AuthHeaderService.getHeader()
        });

        return response;
    };

    this.IsValidClaim = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/claim/details",
            data: param,
            headers: AuthHeaderService.getHeader()
        });

        return response;
    }

    this.getShippingMethods = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/item/shipping/methods",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    // get Rooms List
    this.getRooms = function (claimNumber) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "customer/claim/" + claimNumber + "/rooms",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    // get Retailes List
    this.getRetailers = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/all/retailers",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }


    // get Retailes List
    this.sendMailToSupervisor = function (param) {
        var response = $http({
            method: "POST",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/send/claim/creation/mail",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    //Get condition API
    this.getCondition = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/claim/get/condition",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.hardDeleteClaim = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/adjuster/claim/hardDelete",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.updateClaimDetails = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/claim/update/claimdetails",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.getClaimsStatusContentDetails = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/adjuster/claim/contents",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

}]);
