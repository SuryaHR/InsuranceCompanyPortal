angular.module('MetronicApp').service('HeaderService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    //get alert ,notifications ,reminder
    this.getAlertList = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/notifications",
            data: param,
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }

    //mark notification as read
    this.markAsRead = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/read/notification",
            data:param,
            headers: AuthHeaderService.getHeader()
        })
        return response;
    };

    this.getEventList = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/myevents",
            
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }

    this.authenticate = function (url,param,Xoriginator) {
        var response = $http({
            method: "POST",
            url: url,
            data:param,
            headers: {"X-originator":Xoriginator,"Content-Type": "application/json",
            "Accept": "application/json",}
        })
        return response;
    };

}]);