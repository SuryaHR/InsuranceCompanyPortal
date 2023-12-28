angular.module('MetronicApp').service('RequestService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    //get  list of claims API #242
    this.UpdateRequest = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/schedule/request", //For 177 use → web/schedule/Request
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
   

    //Accept or Reject Request API #363
   
    this.completeRequest = function (param) {
        var response = $http({
            method: "PUT",
            url: AuthHeaderService.getApiURL() +"web/request/status", 
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //API to delete Request #240
    this.DeleteRequestByUser = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/delete/request",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

     this.convertTime12to24 = (time12h) => {
        const [time, modifier] = time12h.split(' ');    
        let [hours, minutes] = time.split(':');      
        let parsedHr = parseInt(hours, 10);
        if (parsedHr === 12) {
          hours = '00';
        }
        else if(parsedHr < 10)
            hours = '0'+ parsedHr
        
        if (modifier === 'PM') {
          hours = parseInt(hours, 10) + 12;
        }      
        return `${hours}:${minutes}`;
      }
}]);
