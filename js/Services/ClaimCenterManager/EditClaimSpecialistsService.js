angular.module('MetronicApp').service('EditClaimSpecialistsService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    //Get Category Lis
    this.GetCategoryList = function () {
        var GetCategoryList = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/categories",
            headers: AuthHeaderService.getHeader()
        });
        return GetCategoryList;
    }
    this.GetSpecialistDetails = function (param) {
        var Deatisl = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/pricing/specialistdetails",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return Deatisl;
    }
    this.GetBranch = function (param) {
        var Branch = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/branches",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return Branch;
    }
    this.GetReportingmanager = function (param) {        
        var ManagerList = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/company/reportingmanagers",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return ManagerList;
    }
    this.GetDesignation = function () {        
        var Designation = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/designation",
            headers: AuthHeaderService.getHeader()
        });
        return Designation;
    }
    this.GetRole= function () {
        var Role = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/roles",
            headers: AuthHeaderService.getHeader()
        });
        return Role;
    }
    this.GetState= function (param) {
        var State = $http({
            method: "Post",
            data:param,
            url: AuthHeaderService.getApiURL() + "web/states",
            headers: AuthHeaderService.getHeader()
        });
        return State;
    }
    this.UpdateSpecialist = function (param) {
        var updateInfo = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/update/pricing/specialist",
            headers: AuthHeaderService.getHeader(),
            data:param
        });
        return updateInfo;
    }
    this.GetClaims = function (param) {
       var ClaimList= $http({
        method: "Post",
        url: AuthHeaderService.getApiURL() + "web/claims",
        headers: AuthHeaderService.getHeader(),
        data:param
    });
       return ClaimList;
    }
}]);