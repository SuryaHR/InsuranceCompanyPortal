angular.module('MetronicApp').service('ClaimItemsService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {
    this.GetDetails = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/report/claim/items/statistics?claimNum="+param.claimNumber,
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    
    this.exportDetailedInventory = function (param) {
        var responsepdf = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/export/detailed/inventory?claim="+param.claimNumber+"&format="+param.format,
            headers: AuthHeaderService.getHeader(),
            responseType: 'arraybuffer'
        });
        return responsepdf;
    };
}]);