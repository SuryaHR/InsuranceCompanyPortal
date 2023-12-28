angular.module('MetronicApp').service('ResetPasswordService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    this.getRandomQuestionsForUser = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/get/selected/question/"+param.id,
            headers: AuthHeaderService.getHeader()

        });
        return response;
    }


    this.verifyAnswer = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/verify/security/answer/",
            data:param,
            headers: AuthHeaderService.getHeader()

        });
        return response;
    }

}]);