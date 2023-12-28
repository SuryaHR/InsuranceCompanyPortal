angular.module('MetronicApp').service('EditPremiumValueService', ['$http', '$rootScope', 'AuthHeaderService', function($http, $rootScope, AuthHeaderService) {

  // API to get Zipcodes w.r.t state by stateId.
  this.getStateById = function(param) {
    var response = $http({
      method: "POST",
      url: AuthHeaderService.getApiURL() + "web/get/all/zipcodes",
      data: param,
      headers: AuthHeaderService.getHeader()
    });
    return response;
  }

  // API to update Zipcode w.r.t state by zipcode id.
  this.updateZipcode = function(param) {
    var response = $http({
      method: "POST",
      url: AuthHeaderService.getApiURL() + "web/save/zipcode/premium",
      data: param,
      headers: AuthHeaderService.getHeader()
    });
    return response;
  }

  // API to delete Zipcode w.r.t state by zipcode id.
  this.deleteZipcode = function(param) {
    var response = $http({
      method: "DELETE",
      url: AuthHeaderService.getApiURL() + "web/delete/zipcode",
      data: param,
      headers: AuthHeaderService.getHeader()
    });
    return response;
  }

}]);
