
angular.module('MetronicApp').service('SearchClaimSpecialistsService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    this.GetEmployeeListForSpecialist = function (param) {//API 147
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/search/employees",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    
}]);