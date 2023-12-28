angular.module('MetronicApp').service('RolesAndScreenMapping', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    this.GetRoleList = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/roles",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.GetAllScreens = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/admin/permissions",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.GetRoleSpecificScreens = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/role/screens",
            data:param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
}]);