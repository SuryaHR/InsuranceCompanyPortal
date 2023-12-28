angular.module('MetronicApp').service('ClaimCenterClaimDetailsService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    //Get list of lost damage item API #78
    this.getLostDamagedItemList = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/postloss/items",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
  
    //get Policy Type with deductible ,coverage and special limit API #95
    this.getPolicyType = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/policytypes",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    //Get Claim info including contact details API #184
    this.getPolicyDetails = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/policy/info",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    //Assign Policy Type to policy API# 96 which id it need policy not working
    this.AssignPolicyType = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/assign/policytype",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    //Get claim status Details API #140
    this.GetClaimStatusDetails = function (param) {
        var resp = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/details",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return resp;
    }

    //List with Coverage Category
    this.GetCategoriesHomeAppliance = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/categories",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.GetSubCategory = function (param) {
        var respSubCat = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/item/subcategories",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return respSubCat;
    }
    //Post loss
    this.AddPostLossItem = function (param) {
        var AddPostLoss = $http({
            method: "Post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/add/itemtopostloss",
            headers: AuthHeaderService.getFileHeader()
        });
        return AddPostLoss;
    }
    this.UpdatePostLoss = function (param) {
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
    //List of pending task for user 
    this.GetPendingTask = function (param) {
        var task = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/pendingtasklist",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return task;
    }

    //Creating a pending task against a claim
    this.CreatePendingtask = function (param) {
        var task = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/create/task",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return task;
    }
    //get stste List   
    this.GetStateList = function (param) {
        var State = $http({
            method: "post",
            data:param,
            url: AuthHeaderService.getApiURL() + "web/states",
            headers: AuthHeaderService.getHeader()
        });
        return State;
    }
    //Save Policy details
    this.SavePolicy=function(param)
    {
        var SavePolicy = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/update/policy",
            headers: AuthHeaderService.getHeader(),
            data:param
        });
        return SavePolicy;
    }

    this.AlterCategoryCoverage = function (param) {
        var CategoryCoverage = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/update/policycoverage",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return CategoryCoverage;
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