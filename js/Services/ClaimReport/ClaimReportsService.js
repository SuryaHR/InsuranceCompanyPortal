angular.module('MetronicApp').service('ClaimReportsService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    //Get all claims against filer API#17b
    this.getSalvageList = function (param,page,limit) {
        var resp = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/salvage/reports/"+page+"/"+limit,
            headers: AuthHeaderService.getHeader(),
            data: param
        });
        return resp;
    };
    //getStatusList
    this.getStatusList = function(){
        var resp = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/claim/statuslist",
            headers: AuthHeaderService.getHeader(),
            
        });
        return resp;
    }
    // getPolicyTypesList
    this.getPolicyTypesList = function(){
        var resp = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/policytypes",
            headers: AuthHeaderService.getHeader(),
            
        });
        return resp;
    }
    this.getAdjustersList = function (param) {

        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/company/adjusters",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

     // exportSalvageReport
     this.exportSalvageReport = function(param){
        var resp = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/export/salvage/reports",
            headers: AuthHeaderService.getHeader(),
            data: param
        });
        return resp;
    }

    this.getCompanyBranchList = function (param) {
        var List = $http({
            method: "post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/company/details",
            headers: AuthHeaderService.getHeader()
        });
        return List;
    };

    this.getClaimList = function (param) {

        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claims",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    // getClaimTypesList
    this.getClaimTypesList = function(){
        var resp = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/content/services",
            headers: AuthHeaderService.getHeader(),
            
        });
        return resp;
    }
}]);