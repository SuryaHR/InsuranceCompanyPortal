angular.module('MetronicApp').service('RegisterUserService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    this.RegisterUser = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "customer/register",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

}]);