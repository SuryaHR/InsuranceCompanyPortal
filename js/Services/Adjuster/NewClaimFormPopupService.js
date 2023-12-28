angular.module('MetronicApp').service('NewClaimFormPopupService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    this.GetTaskList = function ()
    {
        var TaskList = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/claim/tasklist/home",
        headers: AuthHeaderService.getHeader()
        });
        return TaskList;
    }
    this.CreateTask = function (param) {
        var CareateTaskList = $http({
            method: "Post",
            data:param,
            url: AuthHeaderService.getApiURL() + "web/claim/create/task",
            headers: AuthHeaderService.getHeader()
        });
        return CareateTaskList;
    }
    this.GetTaskListAUTO = function () {
        var responseAuto = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/claim/tasklist/auto",
            headers: AuthHeaderService.getHeader()
        });
        return responseAuto;
    }
    //get Vendors List Against Claim  - API #172
    this.getVendorsListAgainstClaim = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/participants",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
}]);