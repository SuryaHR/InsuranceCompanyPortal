angular.module('MetronicApp').controller('ContractedVendorController', function ($rootScope, $filter, $location, AuthHeaderService, $uibModal,
    $scope, $translate, $translatePartialLoader, VendorRegistrationService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });

    $scope.ActiveVendorsList = [];
    function init() {        
        GetVendorsList();
    };
    init();
    $scope.GetVendorsList = GetVendorsList;
    function GetVendorsList() {
        $(".page-spinner-bar").removeClass("hide");
        var GetVendorsList = VendorRegistrationService.GetVendorsList();
        GetVendorsList.then(function (success) { 
            $scope.ActiveVendorsList=[];
            if (angular.isDefined(success.data.data) && success.data.data != null) {
                angular.forEach(success.data.data, function (vendor) {
                    if (vendor.isInsuranceCompanyContracted == true) {
                        $scope.ActiveVendorsList.push(vendor)
                    }
                });
            };
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            if (error != null) {              
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            }
            else {
                toastr.remove();
                toastr.error(AuthHeaderService.getGenericgenericErrorMessage(), "Error");
            }
            $(".page-spinner-bar").addClass("hide");
        });
    };
    $translatePartialLoader.addPart('ContractedVendor');
    $translate.refresh();
  
    $scope.GotoDashboard = GotoDashboard;
    function GotoDashboard() {
        $location.url(sessionStorage.getItem('HomeScreen'));
    }

    $scope.addVendor = addVendor;
    function addVendor() {
        $location.url('VendorsList');
    }
    $scope.inviteVendorOnBoard = inviteVendorOnBoard;
    function inviteVendorOnBoard() {
        sessionStorage.setItem("isOnBoardVendor", true);
        $location.url('VendorsList');
    }
    $scope.UploadVendorDetails = UploadVendorDetails;
    function UploadVendorDetails() {
        $location.url('UploadVendorDetails');
    };

    $scope.GoToDetails = GoToDetails;
    function GoToDetails(item)
    {
        sessionStorage.setItem("VendorId", item.id);
        sessionStorage.setItem("registrationNumber", item.registrationNumber);
        $location.url('NewThirdPartyVendor');
    }
});