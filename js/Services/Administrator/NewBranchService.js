angular.module('MetronicApp').service('NewOfficeService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    this.getStates = function (param) {
        var response = $http({
            method: "post",
            url: AuthHeaderService.getApiURL() + "web/states",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    //Save conatct details
    this.GetBranchDetails = function (Param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/branch/details",
            data: Param,
            headers: AuthHeaderService.getHeader()
        });


        return response;
    };

    //Save conatct details
    this.GetMemberList = function (Param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/company/contactslist",
            data: Param,
            headers: AuthHeaderService.getHeader()
        });

        return response;
    };


    //Get Employee List
    this.GetEmployeelist = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/branch/employeelist",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //Add New Employee for branch
    this.AddNewEmployee = function (param) {
        
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/add/branch/employee",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //Edit branch Employee
    this.EditEmployee = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/update/branch/employee",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //Delete branch Employee
    this.DeleteEmployee = function (param) {
        var response = $http({
            method: "DELETE",
            url: AuthHeaderService.getApiURL() + "web/delete/branch/employees",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    //UpdateCompany
    this.UpdateCompany = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/update/office",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //AddNewCompany/branch
    this.AddNewCompany = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/add/office",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };




    //++++++++++++++++++
    //Get Designation List
    this.GetDesignationlist = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/designation",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //Get Office/branches List

    this.GetOfficeList = function (param) {
        
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/officelist",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }



    //Get Reporting manager List
    this.GetReprtingManagerlist = function (param) {
        
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/company/reportingmanagers",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    //Get Role List
    this.GetRoleList = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/roles",
            //data: Param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //Get Branch Manager List

    this.GetManagerlist = function (Param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/get/contacts/by/role",
            data: Param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //Get All employeesof the company

    this.GetBranchManagerList = function (Param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/company/employees",
            data: Param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };


    this.ReportingMangerByBranch = function (Param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/branch/employeelist",
            data: Param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };



}]);