angular.module('MetronicApp').controller('InsuranceAccountManagerApplicationSettingsController', function ($rootScope, $scope, $filter, settings, $http, $location, $translate, $translatePartialLoader,
  AuthHeaderService, ApplicationSettingsService) {

  //set language
  $translatePartialLoader.addPart('AppSettingValue');
  $translate.refresh();

  $scope.speedCheckContractDetails = {
    'newlyCreated': 5,
    'updatedAppraisal': 3,
    //  slab1 = 1 - 30,000
    'artigemReview_slab1': 10,
    //  slab2 = 30,000 - 100,000
    'artigemReview_slab2': 15,
    //  slab3 = more that 1,00,000
    'artigemReview_slab3': 25
  }

  function init() {
    getUpdatedValuesSettings();
    getSlabValuesForAppraisals();
  }
  init();

  $scope.reset = reset;

  function reset() {
    $scope.app = {};
    getUpdatedValuesSettings();
  }

  $scope.upDateAppValues = upDateAppValues;

  function upDateAppValues(param) {
    var insuranceReplacementCost = '',
      retailValue = '',
      both = '';
    isRetailValueSelected = '';
    isInsuranceReplacementCostSelected = '';
    if (!isNullData(param)) {
      if (param.itemValue === 'INSUREPLACECOST') {
        insuranceReplacementCost = 'INSUREPLACECOST';
      }
      if (param.itemValue === 'RETAILVALUE') {
        retailValue = 'RETAILVALUE';
      }
      if (param.itemValue === 'BOTH') {
        both = 'BOTH';
      }

      isRetailValueSelected = param.selectAppValue === 'RETAILVALUE' ? param.selectAppValue : '';
      isInsuranceReplacementCostSelected = param.selectAppValue === 'INSUREPLACECOST' ? param.selectAppValue : '';

      var param = {
        id: param.id ? param.id : null,
        "insuranceReplaceCost": insuranceReplacementCost,
        "retailValue": retailValue,
        "both": both,
        "isRetailValueSelected": isRetailValueSelected,
        "isInsuranceReplacementCostSelected": isInsuranceReplacementCostSelected
      }
      var updateReplaceAndRetailValue = ApplicationSettingsService.updateRetailAndInsuranceReplaceCost(param);
      updateReplaceAndRetailValue.then(function (success) {
        getUpdatedValuesSettings();
        toastr.remove();
        toastr.success('The display values and the costs were updated successfully.');
      }, function (error) {
        $scope.ErrorMessage = error.data.errorMessage;
        toastr.error('Error while updating display values and the costs.');
      });

    }

  }

  $scope.getUpdatedValuesSettings = getUpdatedValuesSettings;
  function getUpdatedValuesSettings() {
    var getUpdateValuesSettings = ApplicationSettingsService.getUpdatedValuesSettings();
    getUpdateValuesSettings.then(function (success) {
      $scope.app = {
        id: '',
        itemValue: '',
        selectAppValue: ''
      }
      var appData = success.data && success.data.applicationSettingValueDTO ? success.data.applicationSettingValueDTO : null;
      $scope.app.id = appData.id ? appData.id : null;
      if (appData.insuranceReplaceCost === 'true') {
        $scope.app.itemValue = 'INSUREPLACECOST';
      }
      if (appData.retailValue === 'true') {
        $scope.app.itemValue = 'RETAILVALUE';
      }
      if (appData.both === 'true' && appData.isInsuranceReplacementCostSelected === 'true') {
        $scope.app.itemValue = 'BOTH';
        $scope.app.selectAppValue = 'INSUREPLACECOST';
      }
      if (appData.both === 'true' && appData.isRetailValueSelected === 'true') {
        $scope.app.itemValue = 'BOTH';
        $scope.app.selectAppValue = 'RETAILVALUE';
      }
    }, function (error) {
      $scope.ErrorMessage = error.data.errorMessage;
      toastr.error('Error while getting values display values and the costs.');
    });
  }

  $scope.getSlabValuesForAppraisals = getSlabValuesForAppraisals;
  function getSlabValuesForAppraisals() {
    var param = {
      "contractType": "SPEEDCHECK"
    }
    var responsePromise = ApplicationSettingsService.getSlabValues(param);
    responsePromise.then(function (success) {
      $scope.slabValuesList = success.data && success.data.appraisalInvoiceChargesDTOList ? success.data.appraisalInvoiceChargesDTOList : null;
      angular.forEach($scope.slabValuesList, function (item) {
        console.log('data', item);
        if (item.categaryName === 'New Appraisal') {
          $scope.speedCheckContractDetails.newlyCreated = item.cost;
        }
        if (item.categaryName === 'Appraisal Update') {
          $scope.speedCheckContractDetails.updatedAppraisal = item.cost;
        }
        if (item.categaryName === 'Artigem Review ($1.00 and $29,999.00)') {
          $scope.speedCheckContractDetails.artigemReview_slab1 = item.cost;
        }
        if (item.categaryName === 'Artigem Review ($30,000.00 and $99,999.00)') {
          $scope.speedCheckContractDetails.artigemReview_slab2 = item.cost;
        }
        if (item.categaryName === 'Artigem Review (above $100,000.00)') {
          $scope.speedCheckContractDetails.artigemReview_slab3 = item.cost;
        }
      });

    },
      function (error) {
        $scope.ErrorMessage = error.data.errorMessage;
        toastr.error('Error while getting values display values and the costs.');
      });
  }

  //Sort
  $scope.sort = function (keyname) {
    $scope.sortKey = keyname;   //set the sortKey to the param passed
    $scope.reverse = !$scope.reverse; //if true make it false and vice versa
  }

  function isNullData(objData) {
    if (objData == null || objData == 'null' || objData == '' || objData == 'undefined') {
      return true;
    } else {
      return false;
    }
  }
});
