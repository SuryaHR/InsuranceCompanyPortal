angular.module('MetronicApp').service('RolesAndPermissionMappingService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    this.GetRoleList = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/roles",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.AssignPermissionToRole = function (param) {     
        var response = $http({
            method: "Post",
            data:param,
            url: AuthHeaderService.getApiURL() + "web/assign/role/permissions",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.GetRoleSpecificScreens = function (param) {       
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/role/screens",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.GetScreenPermissions = function (param) {       
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/role/assigned/permissions",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }


    this.GetAllScreenList = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/admin/permissions",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.GetPaymentTerms = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/paymentterms",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    
    this.updateRole = function (param) {
        var response = $http({
            method: "Put",
            url: AuthHeaderService.getApiURL() + "web/role/update",
            data:param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
}]);