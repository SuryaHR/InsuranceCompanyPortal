angular.module('MetronicApp').service('DashboardAlertsService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    //get alert ,notifications ,reminder
    this.getAlertList = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/notifications",
            data: param,
            headers: AuthHeaderService.getHeader()
        })
        return response;
    };

    //mark notification status as read
    this.readNotification = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/read/notification",
            data: param,
            headers: AuthHeaderService.getHeader()
        })
        return response;
    };

    //delete notification.
    this.deleteNotification = function (param) {
        var response = $http({
            method: "DELETE",
            url: AuthHeaderService.getApiURL() + "web/delete/notification",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

}]);