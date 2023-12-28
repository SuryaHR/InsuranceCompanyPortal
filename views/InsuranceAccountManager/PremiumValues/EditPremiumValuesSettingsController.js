angular.module('MetronicApp').controller('EditPremiumValuesSettingsController', function($rootScope, $scope, $filter, settings, $http, $location, $translate, $uibModal, $translatePartialLoader,
  AuthHeaderService, EditPremiumValueService) {

  //set language
  $translatePartialLoader.addPart('BusinessRules');
  $translate.refresh();

  $scope.StateList = [];
  $scope.Selected = {};
  $scope.zipCodes = [];
  $scope.searchString = '';
  $scope.currentPage = 1;
  $scope.pageSize = 20;
  $scope.totalItems = 0;
  var startPose = 0;
  var maxPose = 20;
  var search = '';
  $scope.selected = {};

  function init() {
    $scope.stateId = sessionStorage.getItem('stateId');
    $scope.stateName = sessionStorage.getItem('stateName');
    $scope.count = sessionStorage.getItem('count');
    getAllZipCodesByStateId($scope.stateId);
    // addNewZipCode();
  };
  init();

  var zipcodeInitEvent = $rootScope.$on("CallGetAllZipCodesByState", function() {
    init();
    console.log('zipcodeInitEvent');
  });
  $scope.$on('$destroy', function() {
    zipcodeInitEvent();
  });


  $scope.GoToStaListPage = GoToStaListPage;

  function GoToStaListPage() {
    $location.path('/PremiumValues');
  }

  //API to add New Zipcode w.r.t to state.
  $scope.addNewZipCode = addNewZipCode;

  function addNewZipCode() {
    var state = {
      "id": sessionStorage.getItem('stateId')
    }

    var out = $uibModal.open({
      templateUrl: "views/InsuranceAccountManager/PremiumValues/AddNewZipCodePopUp.html",
      controller: "AddNewZipCodePopUpController",
      resolve: {
        zipData: function() {
          zipData = state;
          return zipData;
        }
      }

    });
  }

  // API to get Zipcodes w.r.t state by stateId.
  $scope.getAllZipCodesByStateId = getAllZipCodesByStateId;

  function getAllZipCodesByStateId(stateId) {
    var state = {
      "id": stateId
    }
    var zipcodePremiumDTO = {
      "state": state,
      "page": 1,
      "searchString": search
    }
    $(".page-spinner-bar").removeClass("hide");
    var details = EditPremiumValueService.getStateById(zipcodePremiumDTO);
    details.then(function(success) {
        $scope.zipCodes = success.data.zipcodes;
        $scope.size = $scope.zipCodes && $scope.zipCodes.length ? $scope.zipCodes.length : 0;
        $(".page-spinner-bar").addClass("hide");
      },
      function(error) {
        $scope.ErrorMessage = error.data.errorMessage;
        toastr.error('Error while updating display values and the costs. Pleae try again.');
        $(".page-spinner-bar").addClass("hide");
      });
  }

  // API to update Zipcode w.r.t state by zipcode id.
  $scope.updatePremiumValuesWRTZipcode = updatePremiumValuesWRTZipcode;

  function updatePremiumValuesWRTZipcode(zipcode) {
    var state = {
      "id": sessionStorage.getItem('stateId')
    }
    var zipcodePremiumDTO = {
      "id": zipcode.id,
      "premiumValue": zipcode.premiumValue,
      "zipcode": zipcode.zipcode,
      "state": state
    }
    $(".page-spinner-bar").removeClass("hide");
    var details = EditPremiumValueService.updateZipcode(zipcodePremiumDTO);
    details.then(function(success) {
        $scope.data = success.data.data;
        toastr.remove();
        toastr.success('The zip code and its premium value have been successfully updated.');
        $scope.selected = {};
        getAllZipCodesByStateId(sessionStorage.getItem('stateId'));
        getTemplate();
        $(".page-spinner-bar").addClass("hide");
      },
      function(error) {
        $scope.ErrorMessage = error.data.errorMessage;
        toastr.error($scope.ErrorMessage);
        $(".page-spinner-bar").addClass("hide");
      });

  }

  $scope.searchZipcodes = searchZipcodes;

  function searchZipcodes(searchString) {
    search = !(isNullData(searchString)) ? searchString : '';
    getAllZipCodesByStateId(sessionStorage.getItem('stateId'));
  }

  // API to delete Zipcode w.r.t state by zipcode id.
  $scope.removeZipCode = removeZipCode;

  function removeZipCode(zipcode) {
    if (isNullData(zipcode.id) && isNullData(zipcode.premiumValue)) {
      var lastItem = $scope.zipCodes.length - 1;
      $scope.zipCodes.splice(lastItem, 1);
    } else {
      bootbox.confirm({
        size: "",
        title: "Remove Zipcode And Premium Values",
        message: "Are you sure you want to remove the Zipcode And Premium Values? ",
        closeButton: false,
        className: "modalcustom",
        buttons: {
          confirm: {
            label: "Remove",
            className: 'btn-success'
          },
          cancel: {
            label: "Cancel",
            className: 'btn-danger'
          }
        },
        callback: function(result) {
          if (result) {
            $(".page-spinner-bar").removeClass("hide");
            var zipcodePremiumDTO = {
              "id": zipcode.id,
              "premiumValue": zipcode.premiumValue,
              "zipcode": zipcode.zipcode,
              "state": zipcode.state
            }
            var deleteZipcodeWrtState = EditPremiumValueService.deleteZipcode(zipcodePremiumDTO);
            deleteZipcodeWrtState.then(function(success) {
                toastr.remove();
                toastr.success('The zip code and its premium values were successfully removed from the system.');
                getAllZipCodesByStateId(sessionStorage.getItem('stateId'));
                $(".page-spinner-bar").addClass("hide");
              },
              function(error) {
                $scope.ErrorMessage = error.data.errorMessage;
                toastr.error($scope.ErrorMessage);
                $(".page-spinner-bar").addClass("hide");
              });
          }
        }
      });
    }
  }

  $scope.EditZipCodeAndPremiums = function(item) {
    $scope.selected = {};
    $scope.selected = angular.copy(item);
  }

  $scope.getTemplate = getTemplate;

  function getTemplate(item) {
    if (!angular.isUndefined(item)) {
      if (item.id === $scope.selected.id) return 'edit';
      else
        return 'display';
    } else
      return 'display';
  };

  // $scope.pageChanged = function(pageNo) {
  //   $scope.currentPage = pageNo;
  // }

  function isNullData(objData) {
    if (objData == null || objData == 'null' || objData == '' || objData == 'undefined') {
      return true;
    } else {
      return false;
    }
  }


});
