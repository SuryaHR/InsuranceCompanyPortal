
angular.module('MetronicApp').controller('AddNewZipCodePopUpController', function($rootScope, $scope, $location, $translate, $translatePartialLoader,
  AuthHeaderService, EditPremiumValueService, zipData) {

  $scope.$on('$viewContentLoaded', function() {
    // initialize core components
    App.initAjax();
  });
  $translatePartialLoader.addPart('Departments');
  $scope.cancel = cancel;
  $scope.zipData = zipData;

  function cancel() {
    $scope.$close();
  };

  $scope.AddNewZipCode = function(zipcode) {
    console.log(zipcode);
    var state = {
      "id": sessionStorage.getItem('stateId')
    }
    var zipcodePremiumDTO = {
      "id": "",
      "premiumValue": zipcode.premiumValue,
      "zipcode": zipcode.zipcode,
      "state": state
    }
    var details = EditPremiumValueService.updateZipcode(zipcodePremiumDTO);
    details.then(function(success) {
        $rootScope.$emit("CallGetAllZipCodesByState", {});
        toastr.remove();
        toastr.success('The zip code and its premium value have been successfully Added.');
        $scope.$close();
        $(".page-spinner-bar").addClass("hide");
      },
      function(error) {
        $scope.ErrorMessage = error.data.errorMessage;
        toastr.error($scope.ErrorMessage);
        $(".page-spinner-bar").addClass("hide");
      });

  };

});
