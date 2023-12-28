angular.module('MetronicApp').service('ClaimDocumentsService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    //get claim attachment #156
    this.getClaimAttachments = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/claim/attachments?claimnumber=" + param.claimNumber + "&type=" + param.type + "&page=" + param.page + "&limit=" + param.limit+"&q="+param.keyword,
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.addClaimAttachment = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/add/claim/attachments",
            data: param,
            headers: AuthHeaderService.getFileHeader()
            //headers: { "X-Auth-Token": sessionStorage.getItem("AccessToken") }
        });
        return response;
    }

    this.deleteMediaFile = function (param) {
        var response = $http({
            method: "DELETE",
            url: AuthHeaderService.getApiURL() + "web/delete/attachment/"+param.id+"/purpose/"+param.purpose,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };	
}]);