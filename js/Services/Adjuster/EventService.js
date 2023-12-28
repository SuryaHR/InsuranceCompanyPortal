angular.module('MetronicApp').service('EventService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    //get  list of claims API #242
    this.UpdateEvent = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/schedule/event", //For 177 use → web/schedule/event
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
   

    //Accept or Reject Event API #363
   
    this.AcceptRejectEvent = function (param) {
        var response = $http({
            method: "PUT",
            url: AuthHeaderService.getApiURL() +"web/event/invitation", 
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //API to delete Event #240
    this.DeleteEventByUser = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/delete/event",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
}]);
