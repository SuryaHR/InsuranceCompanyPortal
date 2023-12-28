angular.module('MetronicApp').service('SalvageReportsService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

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
            url: AuthHeaderService.getApiURL() + "web/get/salvage/status",
            headers: AuthHeaderService.getHeader(),
            
        });
        return resp;
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
}]);