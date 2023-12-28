angular.module('MetronicApp').controller('EmailVendorRegistrationController', function ($rootScope, $filter,
    $location, EmailVendorRegistrationService, $uibModal, $scope, $translate, $translatePartialLoader) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('NewVendorRegistration');
    $translate.refresh();
    $scope.NewVendor = {};

    $scope.AddNewVendor = function () {
        //$scope.DayTime = null;
        //$scope.EveningTime = null;
        //$scope.Cell = null;
        //$scope.tempSpecialtyOfSpecialist = [];
        //angular.forEach($scope.PhoneNumbers, function (phone) {
        //    if (phone.Type == "Work") {
        //        $scope.DayTime = phone.PhoneNo
        //    }
        //    else if (phone.Type == "Other") {
        //        $scope.Cell = phone.PhoneNo;
        //    }
        //});
        var param =
            {
                "url":$scope.NewVendor.Website,                
                "name": $scope.NewVendor.SupplierName,
                "adminEmail": $scope.NewVendor.Email,
                "adminFirstName": $scope.NewVendor.FirstName,
                "adminLastName": $scope.NewVendor.LastName,
                "adminDOB": $filter('date')(new Date($scope.NewVendor.DOB), "yyyy-MM-dd"),
                "adminCellPhone": $scope.NewVendor.Mobile,
                "adminDayTimePhone": $scope.NewVendor.Phone,
                "adminEveningTimePhone": $scope.NewVendor.EveningTimePhone,
                "registrationNumber": $scope.NewVendor.VendorRegistrationNumber               
            };
        var addNewVendor = EmailVendorRegistrationService.addVendor(param);
        addNewVendor.then(function (success) {      
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");
          
        }, function (error) {
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
});