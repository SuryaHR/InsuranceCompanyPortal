angular.module('MetronicApp').service('CompanyAdminstrationService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    this.GetDesignation = function () {
        var Designation = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/designation",
            headers: AuthHeaderService.getHeader()
        });
        return Designation;
    }
    this.GetReportingManager = function (param) {
        var ReportingManager = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/company/reportingmanagers",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return ReportingManager;
    }
    this.GetRole = function () {
        var Role = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/roles",
            headers: AuthHeaderService.getHeader()
        });
        return Role;
    }
    this.GetBranchOffice = function (param) {
        var BranchOffice = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/officelist",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return BranchOffice;

    }
    this.GetCompanyEmployee = function (param) {
        var CompanyEmployee = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/company/employees",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return CompanyEmployee;

    }
    this.GetEmployeeDetails = function (param) {
        var Employee = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/employee",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return Employee;

    };

    //get password length
    this.GetPasswordLengthList = function () {
        var Employee = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/password/length",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return Employee;
    };

    //get company security controls
    //get password length
    this.getCompanySecutiyControls = function () {
        var Employee = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/securitycontrol",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return Employee;
    };

    this.getPasswordComplexity = function () {
        var Employee = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/password/complexity",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return Employee;
    };
    
    this.GetSessionTimeoutList = function () {
        var Employee = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/session/timeout",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return Employee;
    };

    this.GetLockOutThresholdList = function () {
        var Employee = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/lockout/threshold",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return Employee;
    }; 

    this.GetLockOutPeriodList = function () {
        var Employee = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/lockout/period",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return Employee;
    };

    this.GetPassowrdExpiryList = function () {
        var Employee = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/password/expiry",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return Employee;
    };

    this.GetPasswordHistoryList= function () {
        var Employee = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/password/history",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return Employee;
    };
    //updateSecurityControls
    this.updateSecurityControls = function (param) {
        var Employee = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/securitycontrol",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return Employee;
    };
}]); 