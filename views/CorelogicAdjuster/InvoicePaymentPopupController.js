angular.module('MetronicApp').controller('InvoicePaymentPopupController', function ($rootScope, $filter, AdjusterPropertyClaimDetailsService, $uibModal, $scope, $translate,
    $translatePartialLoader, InvoiceObj) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('VendorInvoices');
    $translate.refresh();


    $scope.InvoiceDetails = InvoiceObj.Invoice;
    $scope.VendorId = InvoiceObj.VendorId;
    $scope.VendorReg = InvoiceObj.VendorReg;
    $scope.VendorAllDetails = [];
    $scope.StateList = [];
    $scope.VendorDetails = {};
    $scope.Payment = {};
    $scope.IsEFTPayment = false;
    $scope.cancel = function () {
        $scope.$close();
    };

    function init()
    {
        var getStateList = AdjusterPropertyClaimDetailsService.getStates();
        getStateList.then(function (success) {
            $scope.StateList = success.data.data;
        }, function (error) { });
        getVendorDetails();
    }
    init();
    $scope.SelectMethod = function (method) {
        if (method == 'check') {
            $scope.IsEFTPayment = false;
        }
        else if (method == 'EFT') {
            $scope.IsEFTPayment = true;
        }
        else {
            $scope.IsEFTPayment = false;
        }
    };


    $scope.getVendorDetails = getVendorDetails;
    function getVendorDetails() {
        param = {
            "id": $scope.VendorId,
            "registrationNumber" : $scope.VendorReg
        };
        getVendorDetailsOnID = AdjusterPropertyClaimDetailsService.getVendorDetails(param);
        getVendorDetailsOnID.then(function (success) {
            $scope.VendorAllDetails = success.data.data;
            $scope.VendorDetails.Name = $scope.VendorAllDetails.vendorName;
            $scope.VendorDetails.ShippingAddress1 = $scope.VendorAllDetails.billingAddress.streetAddressOne;
            $scope.VendorDetails.ShippingAddress2 = $scope.VendorAllDetails.billingAddress.streetAddressTwo;
            $scope.VendorDetails.City = $scope.VendorAllDetails.billingAddress.city;
            $scope.VendorDetails.State = $scope.VendorAllDetails.billingAddress.state.id;
            $scope.VendorDetails.ZipCode = $scope.VendorAllDetails.billingAddress.zipcode;

        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });


    }


    $scope.MakePayment = function () {
        var param;
        var Checkdate = new Date($scope.Payment.Date);
        Checkdate = Checkdate.toISOString().split('.')[0];
        Checkdate = Checkdate + 'Z';

        if ($scope.IsEFTPayment) {
            param = {
                "invoices": [{
                    "id": $scope.InvoiceDetails.id
                }],
                "paymentDate": Checkdate,
                "bankName": $scope.Payment.BankName,
                "bankAccountNumber": $scope.Payment.BankAccountNumber,
                "eft": true,
                "routingNumber": $scope.Payment.RoutingNumber,
                "payAmount": $scope.InvoiceDetails.amount.toString(),
                "vendorDetails": {
                    "vendorId": $scope.VendorId
                }
            }

        }
        else {
            param = {
                "invoices": [{
                    "id": $scope.InvoiceDetails.id
                }],
                "bankName": $scope.Payment.BankName,
                "checkNumber": $scope.Payment.CheckNumber,
                "check": true,
                "checkDate": Checkdate,
                "payAmount": $scope.InvoiceDetails.amount.toString(),
                "remittAddress": {
                    "streetAddressOne": $scope.VendorDetails.ShippingAddress1,
                    "streetAddressTwo": $scope.VendorDetails.ShippingAddress2,
                    "city": $scope.VendorDetails.City,
                    "state": {
                        "id": $scope.VendorDetails.State
                    },
                    "zipcode": $scope.VendorDetails.ZipCode
                },
                "vendorDetails": {
                    "vendorId": $scope.VendorId
                }
            };

        };
        var makePayment = AdjusterPropertyClaimDetailsService.MakePayment(param);
        makePayment.then(function (success) {
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
            $scope.$close("Success");

        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    };



   
});