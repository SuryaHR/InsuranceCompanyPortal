angular.module('MetronicApp').service('ForgotpasswordService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    this.ForgotPassword = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "customer/forgetpassword",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.getForGotPasswordCaptchaDetails = function(){
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "customer/get/forgotpassword/captcha",
            headers: AuthHeaderService.getCaptchHeaders()
        });
        return response;
    }

}]);