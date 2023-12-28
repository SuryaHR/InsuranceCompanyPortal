angular.module('MetronicApp').service('ItemValueService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    //get Event List
    this.SaveItemValue = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/update/replacementdetails",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
}]);