angular.module('MetronicApp').service('PropertyFNOLRequestService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    
    this.AddNote = function (param) {//API 66
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/attachnote",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    //Policy details if exists
    this.GetPolicyAndClaimDetails = function (param) { //api 122
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/policy/info",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
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

    this.createHomePolicy = function (param) {
        var postResponse = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/create/policy",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return postResponse;
    }

    this.UpdateClaimStatus = function (param)
    {
        var response = $http({
            method: "Post",
            url:AuthHeaderService.getApiURL()+ "web/claim/updatestatus",
            data:param,
            headers:AuthHeaderService.getHeader()
        });
        return response;
    }
    //Create claim with report details
    this.SaveClaimandReportDetails = function (param)
    {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/update/reportdetails",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    }

    //List with check sign
    this.GetCategoriesHomeAppliance = function ()
    {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/categories",           
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //get Policy Type
    this.getPolicyType = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/policytypes ",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    //get post Lost/damage Item
    this.getPostLostItems = function (param) {
        var response = $http({
            method: "post",
            url: AuthHeaderService.getApiURL() + "web/claim/postloss/items",
            data:param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    
    //Get damage types 26
    this.getDamageType = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/property/damagetypes",
            data:param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    
    //Get Item category list #96 
    this.GetItemCategory = function () {    
        var resp = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL()+"web/categories",
            headers: AuthHeaderService.getHeader()
        });
        return resp;
    }
    //Get all the State 
    this.GetState = function (param) {
       var respState= $http({
           method: "post",
           data:param,
            url: AuthHeaderService.getApiURL() + "web/states",
            headers: AuthHeaderService.getHeader()
       });
       return respState;
    }
    //Get subCategory
    this.GetSubCategory=function(param)
    {
        var respSubCat = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/item/subcategories",
            data:param,
            headers: AuthHeaderService.getHeader()
        });
        return respSubCat;
    }
    //Post Loss items
    this.AddPostLossItem = function (param) {       
        var AddPostLoss = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/add/itemtopostloss",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return AddPostLoss;
    }
    this.UpdatePostLoss=function(param)
    {
        var UpdatePostLoss = $http({
            method: "post",
            url: AuthHeaderService.getApiURL() + "web/claim/update/postlossitem ",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return UpdatePostLoss;
    }
    //Delete Post Loss Item API #93
    this.DeleteLostDamageItem = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/remove/postlossitem",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //Get list of policy for account no
    this.GetListOfPolicyForAccNo = function (param) {
        var GetPolicyList = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() +  "web/insurance/info",
            headers: AuthHeaderService.getHeader(),
            data:param
        });
        return GetPolicyList;
    }
    //Get agent list
    this.GetListOfAgent= function (param) {
        var GetAgent = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/agents",
            headers: AuthHeaderService.getHeader(),
            data: param
        });
        return GetAgent;
    }
}]);