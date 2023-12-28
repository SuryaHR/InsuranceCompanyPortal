angular.module('MetronicApp').service('UserDetailsUploadService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    this.UploadVendorDetailsFile = function (param) {
        var resp = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/read/userdetails",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return resp;
    }

    this.SaveVendorDetails = function (param) {
        var resp = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/import/userdetails",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return resp;
    }
}]);