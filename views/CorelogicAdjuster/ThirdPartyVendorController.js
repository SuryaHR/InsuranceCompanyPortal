angular.module('MetronicApp').controller('ThirdPartyVendorController', function ($rootScope, $scope, settings, $translate, $translatePartialLoader, $location, $filter,
   ThirdPartyVendorService, $uibModal) {

    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    //set language
    $translatePartialLoader.addPart('AdjusterThirdPartyVendor');
    $translate.refresh();
    //Variables
    $scope.pagesize = $rootScope.settings.pagesize;
    $scope.VendorList = [];
    $scope.AllvendorServices = [];
    $scope.FilteredvendorList = [];
    $scope.FilterService = "ALL";
    $scope.ErrorMessage = "";
    function init() {
        sessionStorage.setItem("VendorDetailsId", "");
        var getVendorList = ThirdPartyVendorService.getVendorList();
        getVendorList.then(function (success) {
            $scope.VendorList = success.data.data;
        },
        function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        });

    };
    init();

    //  sort
    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

    //Add new vendor

    $scope.GoToNewVendor = function () {
        sessionStorage.setItem("EmaiInvite", null)
        sessionStorage.setItem("VendorDetailsId", "");
        $location.url('NewThirdPartyVendor');
    }
    //Email invite
    $scope.GoToEmailInvite = function () {
        sessionStorage.setItem("EmaiInvite", "EmailInvite")
        sessionStorage.setItem("VendorDetailsId", "");
        $location.url('NewThirdPartyVendor');
    }

    //Edit Vednor
    $scope.EditVendor = function (Vendor) {
        if (Vendor.id != null) { //Vendor.registrationNumber
            sessionStorage.setItem("VendorDetailsId", Vendor.id)
            sessionStorage.setItem("EmaiInvite", null)
            $location.url('NewThirdPartyVendor');
        }
    };
    $scope.EditVendorNew = function () {
        sessionStorage.setItem("VendorDetailsId", 5)
        sessionStorage.setItem("EmaiInvite", null)
        $location.url('NewThirdPartyVendor')
    };

    //Delete Vendor
    $scope.openConfirmDialog = function () {
        bootbox.confirm({
            size: "",
            title: $translate.instant('DeleteConfirmBox.Title'),
            message: $translate.instant('DeleteConfirmBox.Message'), closeButton: false,
            className: "modalcustom", buttons: {
                confirm: {
                    label: $translate.instant('DeleteConfirmBox.BtnYes'),
                    className: 'btn-success'
                },
                cancel: {
                    label: $translate.instant('DeleteConfirmBox.BtnNo'),
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                if (result) {

                }
            }
        });
    }

    $scope.UploadVendors = UploadVendors;
    function UploadVendors() {
        $location.url('UploadVendorDetails')
    };

    $scope.GoToHome = function () {
        $location.url(sessionStorage.getItem('HomeScreen'));
    };
});