angular.module('MetronicApp').controller('SuperVisorInvoiceDetailsController', function ($rootScope, $filter, $uibModal, $scope, settings, $http, $timeout, $location, $translate, $translatePartialLoader,
    SuperVisorInvoiceDetailsService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });

    //set language
    $translatePartialLoader.addPart('VendorInvoiceDetails');
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
    $scope.paymentType = "";
    function init() {
        $scope.CommomObj = {
            ClaimNumber: sessionStorage.getItem("SupervisorClaimNo"),
            SuperVisorInvoiceNo: sessionStorage.getItem("SuperVisorInvoiceNo"),
            InvociesToBePaid: sessionStorage.getItem("SuperVisorInvoicesToBePaid")
        }
        if ($scope.CommomObj.SuperVisorInvoiceNo !== "" && angular.isDefined($scope.CommomObj.SuperVisorInvoiceNo)) {
            GetInvoiceDetails();

            //Get StateList
            var param = { "isTaxRate": false, "isTimeZone": false };
            var GetStates = SuperVisorInvoiceDetailsService.getStates(param);
            GetStates.then(function (success) {
                $scope.StateList = success.data.data;
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
            });

            //Format date
            if ($scope.VendorInvoiceDetails) {
                $scope.VendorInvoiceDetails.invoiceDetails.dueDate = $filter('date')(newValue, 'MM/dd/yyyy');
            }
        }
        else
        {
            sessionStorage.setItem("SuperVisorInvoiceNo", "");
            sessionStorage.setItem("AdjusterVendorId", "");
            sessionStorage.setItem("SuperVisorInvoicesToBePaid", "");
            sessionStorage.setItem("IsVednor", false),
            $location.url('SupervisorDashboard')
        }
        $scope.CheckPayment.Date = $filter('TodaysDate')();
    }

    init();


    $scope.GetInvoiceDetails = GetInvoiceDetails;
    function GetInvoiceDetails() {

        param = {
          
            "invoiceNumber": $scope.CommomObj.SuperVisorInvoiceNo
            //"invoiceNumber": $scope.CommomObj.SuperVisorInvoiceNo
        };

        //Get Claims list for my claims API #10

        var promisePost = SuperVisorInvoiceDetailsService.getInviceDetails(param);
        promisePost.then(function (success) {          
            $scope.VendorInvoiceDetails = [];            
            $scope.VendorInvoiceDetails = success.data.data;
            debugger;
            $scope.SelectItemsAndValues();//setting all the variable values 
          
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });


    }

    $scope.SelectItemsAndValues = SelectItemsAndValues;
    function SelectItemsAndValues() {
        $scope.SelectedItems = [];     
        $scope.InvoiceNo = null;
        $scope.InvoicesLeftToPay = null;
        $scope.SubTotal = null;
        $scope.GrandTotal = $scope.VendorInvoiceDetails.invoiceDetails.amount;

        if ($scope.VendorInvoiceDetails != null || $scope.VendorInvoiceDetails.length != 0) {
            $scope.InvoiceNo = $scope.VendorInvoiceDetails.invoiceDetails.invoiceNumber;
            $scope.InvoicesLeftToPay = $scope.CommomObj.InvociesToBePaid;
            angular.forEach($scope.VendorInvoiceDetails.invoiceItems, function (invoices) {
                $scope.SelectedItems.push({ itemId: invoices.id });
            })
            angular.forEach($scope.VendorInvoiceDetails.invoiceItems, function (invoices) {
                $scope.SubTotal += invoices.amount;
            })
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
        var InvoiceitemId = [];
        angular.forEach($scope.VendorInvoiceDetails.invoiceItems, function (item) {
            InvoiceitemId.push({"itemId":item.id});
        });
        if ($scope.CheckPayment.paymentType == "Check")
        {
            var param = {
                "claimNumber": $scope.VendorInvoiceDetails.claimNumber,
                "paymentDetails": {
                    "bankName": $scope.CheckPayment.BankName,
                    "checkNumber": $scope.CheckPayment.CheckNo,
                    "check": true,
                    "checkDate": Checkdate,
                    "payAmount": $scope.GrandTotal,
                },
                "items": InvoiceitemId,               
            };
        }
        else {
            var param = {
                "claimNumber": $scope.VendorInvoiceDetails.claimNumber,
                "paymentDetails": {
                    "bankName": $scope.CheckPayment.BankName,
                    "checkNumber": $scope.CheckPayment.CheckNo,
                    "debitCard": true,
                    "checkDate": Checkdate,
                    "payAmount": $scope.GrandTotal,
                },
                "items": InvoiceitemId,
            };
        }
   
    
        var makepayment = SuperVisorInvoiceDetailsService.makeItemPaymentByCheck(param);
        makepayment.then(function (success) {       
            $scope.DisplayPayment = false;          
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");
                $scope.Reset();
                $scope.GoBack();

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
        $scope.VendorDetails.Name = $scope.VendorInvoiceDetails.vendor.vendorName;
        $scope.VendorDetails.ShippingAddress1 = $scope.VendorInvoiceDetails.vendorRemitAddress.streetAddressOne;
        $scope.VendorDetails.ShippingAddress2 = $scope.VendorInvoiceDetails.vendorRemitAddress.streetAddressTwo;
        $scope.VendorDetails.City = $scope.VendorInvoiceDetails.vendorRemitAddress.city;
        $scope.VendorDetails.State = $scope.VendorInvoiceDetails.vendorRemitAddress.state.id;
        $scope.VendorDetails.ZipCode = $scope.VendorInvoiceDetails.vendorRemitAddress.zipcode;
    }

    $scope.GoBack = function () {
        sessionStorage.setItem("SuperVisorInvoiceNo", "");
        sessionStorage.setItem("AdjusterVendorId", "");
        sessionStorage.setItem("SuperVisorInvoicesToBePaid", "");
        sessionStorage.setItem("IsVednor", false),
        $location.url('SupervisorDashboard')
    }
    // Approve invoice
    $scope.ApproveInvoice = ApproveInvoice;
    function ApproveInvoice() {
        var Invoiceparam = {
            "id": $scope.VendorInvoiceDetails.invoiceDetails.id,
            "isApproved": true
        }
        var ApproveInvoice = SuperVisorInvoiceDetailsService.ApproveInvoice(Invoiceparam);
        ApproveInvoice.then(function (success) {
            toastr.remove();
            toastr.success(success.data.message, "Confirmation"); $scope.GoBack();
            $scope.GoBack();
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }
});