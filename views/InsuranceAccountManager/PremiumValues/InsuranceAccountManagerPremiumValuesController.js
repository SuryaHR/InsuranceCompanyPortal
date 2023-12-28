angular.module('MetronicApp').controller('InsuranceAccountManagerPremiumValuesController', function($rootScope, $scope, $filter, settings, $http, $location, $translate, $translatePartialLoader,
  AuthHeaderService, BusinessRuleService) {

  //set language
  $translatePartialLoader.addPart('BusinessRules');
  $translate.refresh();

  $scope.StateList = []
  $scope.Selected = {};

  function init() {
    $(".page-spinner-bar").removeClass("hide");
    GetStateList();
  };
  init();

  $scope.GetStateList = GetStateList;

  function GetStateList() {
    param = {
      "isTaxRate": true,
      "isTimeZone": false
    };
    var GetStateList = BusinessRuleService.GetStateList(param);
    GetStateList.then(function(success) {
        $scope.StateList = success.data.data;
        console.log($scope.StateList);
        $(".page-spinner-bar").addClass("hide");
      },
      function(error) {});
  }

  $scope.openEditPremiumValuesZipCode = function(state) {
    if (state) {
      sessionStorage.setItem("stateId", state.id);
      sessionStorage.setItem("stateName", state.stateName);
      sessionStorage.setItem('count',state.noOfZipcodesWrtState)
      $location.path('/EditPremiumValuesSettings');
    }
  }

  $scope.gotoUploadZipandPremiums = function() {
    $location.path('/UploadZipCodeAndPremiums');
  }

});
