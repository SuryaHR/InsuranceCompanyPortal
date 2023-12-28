angular.module('MetronicApp').service('RoleBasedService', ['$http', '$rootScope', function ($http, $rootScope) {
    this.GetUserScreenListFromSession = function () {
        return JSON.parse(sessionStorage.getItem("ScreenList"));
    };

    this.GetUserRoleNameAdjuster = function () {
        return "ADJUSTER"
    };

    this.GetUserScreenList = function () {
        return $http.get("Contants/AppConstants.json");
    };

    //Set and Role list
    this.SetUserRoles = function (RoleList) {
        sessionStorage.setItem("RoleList", RoleList);
        window.localStorage.setItem("RoleList", RoleList);
        return true;
    }

    this.GetUserRoles = function () {
        return sessionStorage.getItem("RoleList");
    }

    this.GetHomePageForUser = function () {       
        return sessionStorage.getItem("HomeScreen");
    }
}]);