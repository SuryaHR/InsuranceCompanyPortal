angular.module('MetronicApp').service('InsuranceCommonServices', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
     //remove Notification by id.
     this.removeNotification = function (notification) {
        var response = $http({
            method: "DELETE",
            url: AuthHeaderService.getApiURL() + "web/delete/notification/" + notification.id,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
}]);