angular.module('MetronicApp').service('DepartmentsService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    //Get Department
    this.GetDepartments = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/get/vendor/departments",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //Add Department
    this.AddDepartments = function (param) {
        var response = $http({
            method: "Post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/add/vendor/department",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //Update Department
    this.UpdateDepartment = function (param){
        var response = $http({
            method: "PUT",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/update/vendor/department",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    // Department Details
    this.GetDepartmentDetails = function (param) {
        var response = $http({
            method: "Post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/get/vendor/department",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    //Get employees
    this.GetEmployees = function () {
        var response = $http({
            method: "Get",         
            url: AuthHeaderService.getApiURL() + "web/vendor/employees", //"web/vendor/associates" 
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    
    //UPDATE Department Sattus
    this.UpdateStatus = function (param) {
        var response = $http({
            method: "PUT",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/update/vendor/department/status",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //UPDATE Employee Sattus
    this.UpdateStatusEmployee = function (param) {
        var response = $http({
            method: "post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/employee/changestatus",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
}]);