angular.module('MetronicApp').controller('ServiceRequestInvoiceDetailsController', function ($rootScope, $filter, $uibModal, $scope, settings, $http, $timeout, $location, $translate, $translatePartialLoader, SupervisorClaimDetailsService, VendorInvoiceDetailsService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });

    //set language
    $translatePartialLoader.addPart('ServiceRequestInvoiceDetails');
    $translate.refresh();
    $scope.ClaimNumber =
    $scope.StateList = [];

    $scope.SelectedItems = [];
    $scope.pagesize = 5;
    $scope.SubTotal = null;
    $scope.Tax = null;
    $scope.GrandTotal = null;
    $scope.InvoiceNo = null;
    $scope.InvoicesLeftToPay = null;
    $scope.CheckPayment = {};
    $scope.VendorDetails = {};
    $scope.VendorState = "";
    $scope.DisplayPayment = false;
    $scope.ShowPayment = false;
    displayPaymentPart = false;

    $scope.CommomObj = {
        ClaimNumber: sessionStorage.getItem("ServiceRequestClaimNo"),
        InvoiceId: sessionStorage.getItem("ServiceRequestInvoiceId"),
    }

    function init() {
        GetInvoiceDetails();
        //Get StateList
        var GetStates = SupervisorClaimDetailsService.getStates();
        GetStates.then(function (success) {
            $scope.StateList = success.data.data;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        });
       
    }

    init();
    $scope.GetInvoiceDetails = GetInvoiceDetails;
    function GetInvoiceDetails() {
        param = {
        
            "id": $scope.CommomObj.InvoiceId         
        };
       
        //Get Claims list for my claims API #10

        var promisePost = VendorInvoiceDetailsService.getInvoiceDetails(param);
        promisePost.then(function (success) {
            
            $scope.VendorInvoiceDetails = [];
            $scope.VendorInvoiceDetails = success.data.data;
            
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }

    //$scope.SelectAllItems=function()
    //{

    //    $scope.SelectedItems = [];
    //    if ($scope.selectedAll) {
    //        $scope.selectedAll = true;
    //        angular.forEach($scope.VendorInvoiceDetails.invoiceItems, function (Invoice) {

    //            //angular.forEach(Invoice.invoiceItems, function (item) {
    //            $scope.SelectedItems.push(Invoice.id);
    //           // });
    //        });

    //    } else {
    //        $scope.selectedAll = false;
    //        $scope.SelectedItems = [];
    //    }

    //    angular.forEach($scope.VendorInvoiceDetails.invoiceItems, function (Invoice) {
    //        Invoice.Isselected = $scope.selectedAll;
    //    });

    //    $scope.GetAllVariables();
    //}


    //$scope.SelectSingleItem = function (item)
    //{
    //    $scope.CheckUncheckMainCheckBox();
    //    var index = $scope.SelectedItems.indexOf(item.id);
    //    if (index > -1) {
    //        angular.forEach($scope.VendorInvoiceDetails.invoiceItems, function (invoices) {

    //            if (invoices.id === item.id) {
    //                $scope.SelectedItems.splice(index, 1);
    //                item.Isselected = false;
    //            }
    //        })

    //    }
    //    else {
    //        $scope.SelectedItems.push(item.id);
    //    }

    //    $scope.GetAllVariables(item);

    //}

    //checking and uncheking main check box depending on count of item selected
    //$scope.CheckUncheckMainCheckBox = CheckUncheckMainCheckBox;
    //function CheckUncheckMainCheckBox()
    //{
    //    var flag = 0;
    //    angular.forEach($scope.VendorInvoiceDetails.invoiceItems, function (invoices) {

    //        if (invoices.Isselected === true) {
    //            flag++;
    //        }
    //    })


    //    if(flag===$scope.VendorInvoiceDetails.invoiceItems.length)
    //    {
    //        $scope.selectedAll = true;
    //    }
    //    else {
    //        $scope.selectedAll = false;
    //    }
    //}


    $scope.SelectItemsAndValues = SelectItemsAndValues;
    function SelectItemsAndValues() {
        $scope.SelectedItems = [];
        $scope.GrandTotal = null;
        $scope.InvoiceNo = null;
        $scope.InvoicesLeftToPay = null;
        $scope.SubTotal = null;
        $scope.GrandTotal = null;
        $scope.Tax = null;

        if ($scope.VendorInvoiceDetails != null || $scope.VendorInvoiceDetails.length != 0) {
            $scope.InvoiceNo = $scope.VendorInvoiceDetails.invoiceDetails.invoiceNumber;
            $scope.InvoicesLeftToPay = $scope.CommomObj.InvociesToBePaid;
            angular.forEach($scope.VendorInvoiceDetails.invoiceItems, function (invoices) {
                $scope.SelectedItems.push({ itemId: invoices.id });
            });
            angular.forEach($scope.VendorInvoiceDetails.invoiceItems, function (invoices) {
                $scope.SubTotal += invoices.amount;
                $scope.Tax += invoices.tax;
            })
            $scope.GrandTotal = $scope.SubTotal + $scope.Tax;
        }
    }



    $scope.ShowPayment = function () {
        $scope.bindVendorData(); //binding selected vendor data
        $scope.DisplayPayment = true;
    }

    $scope.MakePayment = MakePayment;
    function MakePayment() {
        var Checkdate = new Date($scope.CheckPayment.Date);
        Checkdate = Checkdate.toISOString().split('.')[0];
        Checkdate = Checkdate + 'Z';
        var param = {          
            "claimNumber": $scope.CommomObj.ClaimNumber,
            "items": $scope.SelectedItems,
            "paymentDetails": {
                "bankName": $scope.CheckPayment.BankName,
                "check": true,
                "checkDate": Checkdate,
                "checkNumber": $scope.CheckPayment.CheckNo,
                "payAmount": $scope.GrandTotal
            }
        };
        var makepayment = VendorInvoiceDetailsService.makeItemPaymentByCheck(param);
        makepayment.then(function (success) {
            $scope.status = success.status;
            $scope.DisplayPayment = false;
            if ($scope.status === 200) {
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");
                $scope.Reset();
            }
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }


    $scope.Reset = Reset;
    function Reset() {
        $scope.GrandTotal = null;
        $scope.InvoiceNo = null;
        $scope.InvoicesLeftToPay = null;
        $scope.SubTotal = null;
        $scope.GrandTotal = null;
        $scope.Tax = null;
        $scope.VendorDetails = {};
        $scope.SelectedItems = [];
        $scope.GetInvoiceDetails();
    }

    $scope.bindVendorData = bindVendorData;
    function bindVendorData() {
        $scope.VendorDetails.Name = $scope.VendorInvoiceDetails.vendor.name;
        $scope.VendorDetails.ShippingAddress1 = $scope.VendorInvoiceDetails.vendorRemitAddress.streetAddressOne;
        $scope.VendorDetails.ShippingAddress2 = $scope.VendorInvoiceDetails.vendorRemitAddress.streetAddressTwo;
        $scope.VendorDetails.City = $scope.VendorInvoiceDetails.vendorRemitAddress.city;
        $scope.VendorDetails.State = $scope.VendorInvoiceDetails.vendorRemitAddress.state.id;
        $scope.VendorDetails.ZipCode = $scope.VendorInvoiceDetails.vendorRemitAddress.zipcode;
    }

    $scope.GoBack = function () {
        sessionStorage.setItem("AdjusterInvoiceNo", ""),
        sessionStorage.setItem("ServiceRequestInvoiceNo", ""),
        $location.url(sessionStorage.getItem("ServiceRequestBackURL"));
    };
    $scope.GoToHome=function()
    {
        $location.url(sessionStorage.getItem('HomeScreen'));
    }
});