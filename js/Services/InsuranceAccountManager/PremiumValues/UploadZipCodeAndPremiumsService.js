angular.module('MetronicApp').service('UploadZipCodeAndPremiumsService', ['$http', '$rootScope', 'AuthHeaderService', function($http, $rootScope, AuthHeaderService) {

  this.UploadZipCodeAndPremiumsFile = function (param) {
      var resp = $http({
          method: "POST",
          url: AuthHeaderService.getApiURL() + "web/import/bulk/zipcodes",
          data: param,
          headers: AuthHeaderService.getFileHeader()
      });
      return resp;
  }

}]);
