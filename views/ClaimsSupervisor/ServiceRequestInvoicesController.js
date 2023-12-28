angular.module('MetronicApp').controller('ServiceRequestInvoicesController', function ($translate, $translatePartialLoader, $scope, $rootScope, $state, settings,
    $location, ServiceRequestInvoicesService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $scope.PageSize = $rootScope.settings.pagesize;
    $translatePartialLoader.addPart('ServiceRequestInvoices');
    $translate.refresh();
    $scope.ErrorMessage = "";
    $scope.AllInvoiceList = [];
    $scope.SelectedInvoices = [];
    $scope.SelectedInvociesFromAllInvoices = [];
    $scope.VendorDetails = {};
    $scope.Payment = {};
    $scope.StateList = [];
    $scope.selectedServiceRequestId = null;
    selectedAllInvoiceServiceRequestId = null;
    $scope.IsEFTPayment = false;
    $scope.ShowPaymentDiv = false;
    $scope.vendorid = null;
    $scope.CurrentClaimTab ='InvoicesToBePaid'//For displaying current active tab

    function init() {
        sessionStorage.setItem("ServiceRequestBackURL", "");
        GetInvociesToBePaid();
        GetAllInvoices();

        //get state list
        var getStateList = ServiceRequestInvoicesService.getStates();
        getStateList.then(function (success) {
            $scope.StateList = success.data.data;
        }, function (error) { });
    }
    init();
    //Show Check Section
    $scope.ShowCheck = function () {
        $scope.IsEFTPayment = false;
        $scope.Payment.CheckNumber = '';
        $scope.Payment.BankAccountNumber = '';
        $scope.Payment.RoutingNumber = '';
       
    };

    //Show Check Section
    $scope.ShowEFT = function () {

        $scope.IsEFTPayment = true;
        $scope.Payment.CheckNumber = '';
        $scope.Payment.BankAccountNumber = '';
        $scope.Payment.RoutingNumber = '';

    };

    //get Invoices pending to pay
    $scope.GetInvociesToBePaid = $scope.GetInvociesToBePaid;
    function GetInvociesToBePaid() {
       
        param = {
            "isCompanyUser": true,
            "invoiceStatus": "APPROVED"
        }

        var getInvoiceList = ServiceRequestInvoicesService.GetInvoiceList(param);
        getInvoiceList.then(function (success) {

            $scope.InvoicesToBePaid = success.data.data;
            
        }, function (error) { });
    };

    //get all Invoices
    $scope.GetAllInvoices = $scope.GetAllInvoices;
    function GetAllInvoices() {
        param = {

            "isCompanyUser": true,

        }
        var getInvoiceList = ServiceRequestInvoicesService.GetInvoiceList(param);
        getInvoiceList.then(function (success) {

            $scope.AllInvoiceList = success.data.data;
            
        }, function (error) { });
    };

    $scope.RemoveRow=function(index,invoice)
    {
     
        $scope.SelectedInvoices.splice(index,1);

        angular.forEach($scope.InvoicesToBePaid, function (obj) {
            angular.forEach(obj.serviceRequest.serviceRequestInvoices, function (Invoice) {
                if (Invoice.id == invoice)
                {
                    Invoice.IsSelected = false;
                }
            });
        });


        if ($scope.SelectedInvoices.length === 0 || $scope.SelectedInvoices === null) {
            $scope.selectedServiceRequestId = null;
        }
       
    }


    //Select all invoices for selected claim number
    $scope.SelectAllInvoicesToBePaid = SelectAllInvoicesToBePaid;
    function SelectAllInvoicesToBePaid(item)
    {
        $scope.SelectedInvoices = [];
        $scope.Payment.TotalAmount = "";
        $scope.vendorid=null;
        angular.forEach($scope.InvoicesToBePaid, function (obj) {
            angular.forEach(obj.serviceRequest.serviceRequestInvoices, function (invoice) {
                invoice.IsSelected = false;
                $scope.Payment.TotalAmount -= obj.totalAmount;
               
            });
        });

        angular.forEach(item.serviceRequest.serviceRequestInvoices, function (obj) {
            obj.IsSelected = true;
            $scope.Payment.TotalAmount += obj.totalAmount;
            $scope.SelectedInvoices.push(obj.id);
        });
        //get vendro deatils
        $scope.vendorid = item.serviceRequest.vendorDetails.vendorId;
        $scope.GetVendorDetails($scope.vendorid);
        $scope.selectedServiceRequestId = item.serviceRequest.serviceRequestId;
    }

    //select single invoice for payment
    $scope.SelectSingleInvoiceToBepaid = SelectSingleInvoiceToBepaid;
    function SelectSingleInvoiceToBepaid(invoice, ServiceRequestId, selectedvendor)
    {
        
        if ($scope.selectedServiceRequestId !== ServiceRequestId)
        {
            $scope.SelectedInvoices = [];
            $scope.Payment.TotalAmount = null;
            $scope.vendorid=null;
            angular.forEach($scope.InvoicesToBePaid, function (obj) {
                angular.forEach(obj.serviceRequest.serviceRequestInvoices, function (invoiceObj) {
                    if (invoiceObj.id !== invoice.id)
                    invoiceObj.IsSelected = false;
                });
            });

            $scope.GetVendorDetails(selectedvendor);
        }
        
        $scope.selectedServiceRequestId = ServiceRequestId;
        $scope.vendorid = selectedvendor;
        var index = $scope.SelectedInvoices.indexOf(invoice.id);
        
        if(index>-1)
        {
            $scope.SelectedInvoices.splice(index, 1);
            invoice.Isselected = false;
            $scope.Payment.TotalAmount -= invoice.totalAmount;
            
        }
        else {
            $scope.SelectedInvoices.push(invoice.id);
            invoice.Isselected =true;
            $scope.Payment.TotalAmount += invoice.totalAmount;
        }
        
    }
    //open payment details section
    $scope.showPayment = function () {
        if ($scope.SelectedInvoices.length === 0 || $scope.SelectedInvoices === null)
        {
            toastr.remove();
            toastr.warning("Please select invoice to pay", "Warning..!!");
        }
        else {
            $scope.ShowPaymentDiv = true;
        }
       

        //$scope.GetVendorDetails($scope.vendorid);
    };

    //hide payment details section
    $scope.HidepaymentDiv = function () {
        $scope.ShowPaymentDiv = false;
    };

    //Select all invoices for selected claim number
    $scope.SelectAllInvoices = SelectAllInvoices;
    function SelectAllInvoices(item) {
        $scope.SelectedInvociesFromAllInvoices = [];
        //$scope.Payment.TotalAmount = "";
        //$scope.vendorid = null;
        angular.forEach($scope.AllInvoiceList, function (obj) {
            angular.forEach(obj.serviceRequest.serviceRequestInvoices, function (invoice) {
                invoice.IsSelected = false;
                //$scope.Payment.TotalAmount -= obj.totalAmount;

            });
        });

        angular.forEach(item.serviceRequest.serviceRequestInvoices, function (obj) {
            obj.IsSelected = true;
            //$scope.Payment.TotalAmount += obj.totalAmount;
            $scope.SelectedInvociesFromAllInvoices.push(obj.id);
        });
        //get vendro deatils
        //$scope.vendorid = item.serviceRequest.vendorDetails.vendorId;
        //$scope.GetVendorDetails($scope.vendorid);
        $scope.selectedAllInvoiceServiceRequestId = item.serviceRequest.serviceRequestId;
    }

    //select single invoice for payment
    $scope.SelectSingleAllInvoice = SelectSingleAllInvoice;
    function SelectSingleAllInvoice(invoice, ServiceRequestId, selectedvendor) {

        if ($scope.selectedAllInvoiceServiceRequestId !== ServiceRequestId) {
            $scope.SelectedInvociesFromAllInvoices = [];
            //$scope.Payment.TotalAmount = null;
            //$scope.vendorid = null;
            angular.forEach($scope.AllInvoiceList, function (obj) {
                angular.forEach(obj.serviceRequest.serviceRequestInvoices, function (invoiceObj) {
                    if (invoiceObj.id !== invoice.id)
                        invoiceObj.IsSelected = false;
                });
            });

            //$scope.GetVendorDetails(selectedvendor);
        }

        $scope.selectedAllInvoiceServiceRequestId = ServiceRequestId;
        //$scope.vendorid = selectedvendor;
        var index = $scope.SelectedInvociesFromAllInvoices.indexOf(invoice.id);

        if (index > -1) {
            $scope.SelectedInvociesFromAllInvoices.splice(index, 1);
            invoice.Isselected = false;
            //$scope.Payment.TotalAmount -= invoice.totalAmount;

        }
        else {
            $scope.SelectedInvociesFromAllInvoices.push(invoice.id);
            invoice.Isselected = true;
            //$scope.Payment.TotalAmount += invoice.totalAmount;
        }

    }


    //Get vendor details
    $scope.GetVendorDetails = GetVendorDetails;
    function GetVendorDetails(vendorid)
    {
        
       param = {
           "vendorId":vendorid 
       };
       
       getVendorDetailsOnID = ServiceRequestInvoicesService.getVendorDetails(param);
       getVendorDetailsOnID.then(function (success) {
           $scope.VendorAllDetails = success.data.data;
           $scope.VendorDetails.Name = $scope.VendorAllDetails.vendorName;
           $scope.VendorDetails.ShippingAddress1 = $scope.VendorAllDetails.billingAddress.streetAddressOne;
           $scope.VendorDetails.ShippingAddress2 = $scope.VendorAllDetails.billingAddress.streetAddressTwo;
           $scope.VendorDetails.City = $scope.VendorAllDetails.billingAddress.city;
           $scope.VendorDetails.State = (($scope.VendorAllDetails.billingAddress.state!==null)?$scope.VendorAllDetails.billingAddress.state.id:null);
           $scope.VendorDetails.ZipCode = $scope.VendorAllDetails.billingAddress.zipcode;

       }, function (error) { });

   }
    
    $scope.MakePayment = function () {
        $scope.Invoices = [];
        angular.forEach($scope.SelectedInvoices, function (invoice) {          
            $scope.Invoices.push({ id: invoice });
        });

        var Checkdate = new Date($scope.Payment.Date);
        Checkdate = Checkdate.toISOString().split('.')[0];
        Checkdate = Checkdate + 'Z';


        var param;
        //Payment By EFT
        if ($scope.IsEFTPayment)
        {
            param = {
                "invoices": $scope.Invoices,
                "paymentDate": Checkdate,
                "bankName": $scope.Payment.BankName,
                "bankAccountNumber": $scope.Payment.BankAccountNumber,
                "eft": true,
                "routingNumber": $scope.Payment.RoutingNumber,
                "payAmount": $scope.Payment.TotalAmount,
                "vendorDetails": {
                    "vendorId": $scope.VendorAllDetails.vendorId
                }
            };

          
        }
            //Payment By check
        else {
            param = {
                "invoices": $scope.Invoices,
                "bankName": $scope.Payment.BankName,
                "checkNumber": $scope.Payment.CheckNumber,
                "check": true,
                "checkDate": Checkdate,
                "payAmount": $scope.Payment.TotalAmount,
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
                    "vendorId": $scope.VendorAllDetails.vendorId
                }
            };
          
        }
        
        var makePayment = ServiceRequestInvoicesService.MakePayment(param);
        makePayment.then(function (success) {
            $(".page-spinner-bar").removeClass("hide");
            $scope.status = success.status;
            $scope.ShowPaymentDiv = false;
            if ($scope.status === 200) {
                $scope.GetInvociesToBePaid();
                $scope.GetAllInvoices();
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");
                $scope.Reset();
                $(".page-spinner-bar").addClass("hide");
            }
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }

    $scope.Reset = Reset;
    function Reset() {
        $scope.VendorDetails = {};
    };

    $scope.GotoInvoiceDetails = GotoInvoiceDetails;
    function GotoInvoiceDetails(item, invoice) {
        sessionStorage.setItem("ServiceRequestBackURL", "ServiceRequestInvoices");
        sessionStorage.setItem("ServiceRequestInvoiceId", invoice.id);
        sessionStorage.setItem("ServiceRequestClaimNo", item.claimDetails.claimNumber);
        $location.url('ServiceRequestInvoiceDetails');
    };
    $scope.GoBack=function()
    {
        $location.url(sessionStorage.getItem('HomeScreen'));
    }
});