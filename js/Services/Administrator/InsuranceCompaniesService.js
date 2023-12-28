angular.module('MetronicApp').service('InsuranceCompaniesService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {


    this.SaveNewCompany = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/add/company",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    }


    this.GetState = function (param) {
        var respState = $http({
            method: "post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/states",
            headers: AuthHeaderService.getHeader()
        });
        return respState;
    }
    this.GetCompanies = function () {
        var respComp = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/companylist",
            headers: AuthHeaderService.getHeader()
        });
        return respComp;
    }

    this.GetRole = function () {
        var respState = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/roles",
            headers: AuthHeaderService.getHeader()
        });
        return respState;
    }
    this.GetCompanyDetails = function (param) {
        var respState = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/company/details",
            headers: AuthHeaderService.getHeader(),
            data: param
        });
        return respState;
    }
    this.UpdateAdminCompany = function (param) {
        var resp = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/update/company",
            headers: AuthHeaderService.getFileHeader(),
            data: param
        });
        return resp;
    };

    this.ConfigureCompany = function (param) {
        var resp = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "admin/manage/company",
            headers: AuthHeaderService.getHeader(),
            data: param
        });
        return resp;
    };

    this.CreateSchema = function (param) {
        var resp = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "admin/configure/company",
            headers: AuthHeaderService.getHeader(),
            data: param
        });
        return resp;
    };

    this.CreateSchemaTables = function (param) {
        var resp = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "admin/configure/company/database",
            headers: AuthHeaderService.getHeader(),
            data: param
        });
        return resp;
    };

    this.AddDataToTables = function (param) {
        var resp = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "admin/configure/company/schema",
            headers: AuthHeaderService.getHeader(),
            data: param
        });
        return resp;
    };



    this.AddCompanyDetails = function (param) {
        var resp = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "admin/push/company/data",
            headers: AuthHeaderService.getHeader(),
            data: param
        });
        return resp;
    };
}]);
