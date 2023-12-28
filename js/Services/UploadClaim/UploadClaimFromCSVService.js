angular.module('MetronicApp').service('UploadClaimFromCSVService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    //Get items form post loss
    this.UploadClaimFromExcelFile = function (param) {
        var saveDetails = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/read/claimdetails",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return saveDetails;
    }
    //Api #250
    this.UploadClaimList = function (param) {
        var saveDetails = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/import/claimdetails",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return saveDetails;
    };

    


}]);