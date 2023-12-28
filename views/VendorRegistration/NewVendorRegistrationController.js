angular.module('MetronicApp').controller('NewVendorRegistrationController', function ($rootScope,$stateParams,AuthHeaderService, $filter, $location,NewVendorRegistrationService, $uibModal, $scope, $translate, $translatePartialLoader, AdjusterPropertyClaimDetailsService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('NewVendorRegistration');
    $translate.refresh();
    $scope.NewVendor = {};
    $scope.ddlStateList = [];
    $scope.params = $stateParams.VRN;
    $scope.BillingAddressFlag = false;
    function init()
    {
        getReturnUrl();
    }init();

    function getReturnUrl() {

        var GetReturnUrl = AuthHeaderService.ReturnURL();
        GetReturnUrl.then(function (success) {
            $scope.URLData = success.data.data;
            $scope.GetStateList();
            $scope.getVendorDetails();
        },
            function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            })

    };

    $scope.getVendorDetails = getVendorDetails;
    function getVendorDetails() {
        var param= {
            "universalRegistrationNumber": $scope.params
            };
        $(".page-spinner-bar").removeClass("hide");
        var GetVendorDetails = NewVendorRegistrationService.GetVendorDetails(param);
        GetVendorDetails.then(function (success) {
            $scope.NewVendor = success.data.data;
            $scope.NewVendor.phoneNumber = $filter('tel')($scope.NewVendor.phoneNumber);
            $scope.NewVendor.faxNumber = $filter('tel')($scope.NewVendor.faxNumber);
            $scope.NewVendor.vendorAdminPhone = $filter('tel')($scope.NewVendor.vendorAdminPhone);
            $scope.NewVendor.vendorAdminCellNumber = $filter('tel')($scope.NewVendor.vendorAdminCellNumber);
            $scope.NewVendor.vendorAdminFax = $filter('tel')($scope.NewVendor.vendorAdminFax);
               
            $(".page-spinner-bar").addClass("hide");          
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            if (error !== null) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            }
            else {
                toastr.remove();
                toastr.error("Failed to get vendor details.", "Error");
            }
        });
    };

    $scope.AddNewVendor = function () {        
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "adminCellPhone": (angular.isDefined($scope.NewVendor.vendorAdminCellNumber) ? $scope.NewVendor.vendorAdminCellNumber.replace(/[()-]/g, '').replace(/ /g, '') : null),
            "adminDayTimePhone": (angular.isDefined($scope.NewVendor.adminDayTimePhone) ? $scope.NewVendor.adminDayTimePhone.replace(/[()-]/g, '').replace(/ /g, '') : null),
            "adminDOB": null,
            "adminEmail": $scope.NewVendor.vendorAdminEmail,
            "adminEveningTimePhone": (angular.isDefined($scope.NewVendor.adminEveningTimePhone) ? $scope.NewVendor.adminEveningTimePhone.replace(/[()-]/g, '').replace(/ /g, '') : null),
            "adminFirstName": $scope.NewVendor.adminFirstName,
            "adminLastName": $scope.NewVendor.adminLastName,
            "billingAddress": $scope.NewVendor.billingAddressDetail,
            "createdDate": (angular.isDefined($scope.NewVendor.createDate) ? $scope.NewVendor.createDate : null),
            "defaultTimezone": null,
            "faxNumber": (angular.isDefined($scope.NewVendor.faxNumber) ? $scope.NewVendor.faxNumber.replace(/[()-]/g, '').replace(/ /g, '') : null),
            "id": $scope.NewVendor.vendorId,
            "insuranceCompanyRegNumber": null,
            "name": $scope.NewVendor.vendorCompanyName,
            "officeAddress": $scope.NewVendor.officeAddressDetail,
            "phoneWork": (angular.isDefined($scope.NewVendor.phoneNumber) ? $scope.NewVendor.phoneNumber.replace(/[()-]/g, '').replace(/ /g, '') : null),
            "registrationNumber": (angular.isDefined($scope.NewVendor.universalRegistrationNumber) ? $scope.NewVendor.universalRegistrationNumber : null),
            "url":(angular.isDefined($scope.NewVendor.artigemUrl) ? $scope.NewVendor.artigemUrl : null), 
            "vendorInsuranceCompanyCreateDate": null,
            "workFax": (angular.isDefined($scope.NewVendor.faxNumber) ? $scope.NewVendor.faxNumber.replace(/[()-]/g, '').replace(/ /g, '') : null),
            "isInsuranceCompanyContracted": false,
            "publicUrl": (angular.isDefined($scope.NewVendor.website) ? $scope.NewVendor.website : null),
            "isActive": null,
            "state": $scope.NewVendor.state,
            "city": $scope.NewVendor.city,
            "zipCode": (angular.isDefined($scope.NewVendor.zip)? $scope.NewVendor.zip : null),
            "completeOfficeAddress": $scope.NewVendor.officeAddress,
            "completeBillingAddress": $scope.NewVendor.billingAddress,
            "status": "Registered"
        };
        var addNewVendor = NewVendorRegistrationService.addVendor(param);
        addNewVendor.then(function (success) {
            $(".page-spinner-bar").addClass("hide");
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");          
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            if (error !== null) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            }
            else
            {
                toastr.remove();
                toastr.error("Failed to register vendor.", "Error");
            }
        });
    }

    $scope.GotoDashboard = GotoDashboard;
    function GotoDashboard() {
        $location.url(sessionStorage.getItem('HomeScreen'));
    }
   
    $scope.GetStateList=GetStateList;
    function GetStateList()
        {
            var param =
          {
              "isTaxRate": false,
              "isTimeZone": false
          }
            var getStateList = AdjusterPropertyClaimDetailsService.getStates(param);
            getStateList.then(function (success) {
                $scope.ddlStateList = success.data.data;
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
            });
        }
    


    $scope.AddAddress = AddAddress;
    function AddAddress() {

        if ($scope.BillingAddressFlag)
        {
            $scope.NewVendor.billingAddress = $scope.NewVendor.billingAddress;
        }
       
    };


});