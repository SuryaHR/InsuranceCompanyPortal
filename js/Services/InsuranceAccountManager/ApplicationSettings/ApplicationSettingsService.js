angular.module('MetronicApp').service('ApplicationSettingsService', ['$http', '$rootScope', 'AuthHeaderService', function($http, $rootScope, AuthHeaderService) {

  this.updateRetailAndInsuranceReplaceCost = function(param) {
    var response = $http({
      method: "Post",
      url: AuthHeaderService.getApiURL() + "web/update/retailandinsurancevalue",
      data: param,
      headers: AuthHeaderService.getHeader()
    });
    return response;
  }


  this.getUpdatedValuesSettings = function() {
    var response = $http({
      method: "GET",
      url: AuthHeaderService.getApiURL() + "web/get/appvalues",
      headers: AuthHeaderService.getHeader()
    });
    return response;
  }
  
  this.getSlabValues = function(param) {
    var response = $http({
      method: "GET",
      url: AuthHeaderService.getApiURL() + "web/get/active/slabvalues?contractType="+param.contractType,
      headers: AuthHeaderService.getHeader()
    });
    return response;
  }

}]);
