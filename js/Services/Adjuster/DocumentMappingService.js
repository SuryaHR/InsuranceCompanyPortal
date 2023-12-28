angular.module('MetronicApp').service('DocumentMappingService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    //API #404
    this.SaveDocumentComment = function (param) {

        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/add/comment",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //API #404
    this.UpdateComment = function (param) {

        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/update/comment",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    //API #406
    this.GetComments = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/document/comment",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;

    };

    //API #413
    this.DeleteComment = function (param) {

        var response = $http({
            method: "DELETE",
            url: AuthHeaderService.getApiURL() + "web/delete/comment",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;

    }
}]);