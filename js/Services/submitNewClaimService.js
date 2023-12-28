angular.module('MetronicApp').service('submitNewClaimService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    this.submitnewclaim = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/claimCreation/email/adjuster",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    }

}]);