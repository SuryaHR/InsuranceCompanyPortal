angular.module('MetronicApp').controller('VendorInfoController', function ($rootScope, $scope, $filter, $location, AdjusterDashboardService,
    $translate, $translatePartialLoader) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });

    //set language
    $translatePartialLoader.addPart('ThirdPartyVendorAdministration');
    $translate.refresh();

    $scope.VendorDetails;
    $scope.VendorContact;
    $scope.ddlStateList = [];
    
    function init() {
        $scope.CommonObject = {
            "vendorId": parseInt(sessionStorage.getItem("VendorId"))
        };
        //Get vendor details
        var GetDetails = AdjusterDashboardService.GetVendorDetails($scope.CommonObject);
        GetDetails.then(function (success) {
            $scope.VendorDetails = success.data.data;
            $scope.VendorDetails.faxNumber = $scope.VendorDetails.faxNumber != null ? $filter('tel')($scope.VendorDetails.faxNumber) : 'N/A';
            $scope.VendorDetails.dayTimePhone = $filter('tel')($scope.VendorDetails.dayTimePhone);
            angular.forEach($scope.VendorDetails.contactPersons, function (item) {
                item.faxNumber = item.faxNumber != null ? $filter('tel')(item.faxNumber) : 'N/A';
                item.workPhoneNumber = $filter('tel')(item.workPhoneNumber);
                item.mobilePhoneNumber = $filter('tel')(item.mobilePhoneNumber);
            });
        }, function (error) {
            toastr.remove()
            toastr.error(error.data.errorMessage, "Error");
        });
    }
    init();

    $scope.GoToHome = function () {
        sessionStorage.removeItem("currentTab");
        $location.url(sessionStorage.getItem('HomeScreen'));
    }

    $scope.GoToSearchResults = function () {
        $location.url('AdjusterGlobalSearch');
    };
});