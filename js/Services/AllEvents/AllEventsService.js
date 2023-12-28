angular.module('MetronicApp').service('AllEventsService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    //get Event List
    this.GetEventList = function (param) {
        var response = $http({
            method: "Post",
            cache: false,
            url: AuthHeaderService.getApiURL() + "web/claim/events",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    
    this.GetParticipants = function (param) {
        var response = $http({
            method: "Post",
            cache: false,
            url: AuthHeaderService.getApiURL() + "web/claim/participants",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //Get Upcoming events
    this.getEventList = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/myevents",

            headers: AuthHeaderService.getHeader()
        })
        return response;
    }

    this.GetAllParticipants = function () {
        var response = $http({
            method: "GET",
            cache: false,
            url: AuthHeaderService.getApiURL() + "web/all/contacts",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
}]);