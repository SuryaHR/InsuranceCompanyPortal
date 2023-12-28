angular.module('MetronicApp').service('AllClaimsService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    //Get all claims against filer API#17b
    this.getAllClaims = function (param) {
        var resp = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/adjuster/claims",
            headers: AuthHeaderService.getHeader(),
            data: param
        });
        return resp;
    };
}]);