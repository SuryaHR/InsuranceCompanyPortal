angular.module('MetronicApp').service('AllNotesService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    this.GetNotes = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/notes",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

}]);