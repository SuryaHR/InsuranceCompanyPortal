angular.module('MetronicApp').service('NewClaimSpecialistService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    //Get Category Lis
    this.GetCategoryList = function (param) {
        var GetCategoryList = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/categories",
            headers: AuthHeaderService.getHeader()
        });
        return GetCategoryList;
    }
    this.GetBranch = function (param) {
        var Branch = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/officelist",  
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
    this.GetRole = function () {
        var Role = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/roles",
            headers: AuthHeaderService.getHeader()
        });
        return Role;
    }
    this.GetState = function (param) {
        var State = $http({
            method: "post",
            data:param,
            url: AuthHeaderService.getApiURL() + "web/states",
            headers: AuthHeaderService.getHeader()
        });
        return State;
    }

    this.SaveSpecialist = function (param) {
        var SaveDetails = $http({
            method: "Post",
            data:param,
            url: AuthHeaderService.getApiURL() + "web/add/pricing/specialist",
            headers: AuthHeaderService.getHeader()
        });
        return SaveDetails;
    }
}]);