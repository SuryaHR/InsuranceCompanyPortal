angular.module('MetronicApp').service('ReportSettingsService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    this.getReportSettings = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/all/report/settings",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.updateReportSettings = function (Param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/update/report/settings",
            data: Param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.resetToDefault = function (Param) {
        var response = $http({
            method: "PUT",
            url: AuthHeaderService.getApiURL() + "web/reset/report/settings",
            //data: Param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

}]);