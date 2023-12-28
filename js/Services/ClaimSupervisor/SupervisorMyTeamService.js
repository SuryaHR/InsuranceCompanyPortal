angular.module('MetronicApp').service('SupervisorMyTeamService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
      
    //get adjuster list
    this.getAdjusterList = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/supervisor/adjuster",
            headers: AuthHeaderService.getHeader()
        })
        return response;
    };

}]);