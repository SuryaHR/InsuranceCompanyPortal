angular.module('MetronicApp').service('ClaimFormService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    this.getClaimFormAuto = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/claim/tasklist/auto",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    this.getClaimFormHome = function () {
        var responseHome = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/claim/tasklist/home",
            headers: AuthHeaderService.getHeader()
        });
        return responseHome;
    }   
    this.DeleteClaimForm= function (param) {
        var responseDelete = $http({
            method: "DELETE",
            data:param,
            url: AuthHeaderService.getApiURL() + "web/delete/claim/form",
            headers: AuthHeaderService.getHeader()
        });
        return responseDelete;
    }
    this.SaveClaimForm = function (param) {
        var responseSave = $http({
            method: "POST",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/manage/claim/form",
            headers: AuthHeaderService.getHeader()
        });
        return responseSave;
    }
}]);