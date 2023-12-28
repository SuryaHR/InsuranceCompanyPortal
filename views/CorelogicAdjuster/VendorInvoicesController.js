angular.module('MetronicApp').controller('VendorInvoicesController', function ($rootScope, $uibModal, $scope, $filter, settings, $http, $timeout, $location, $translate, $translatePartialLoader,
    AdjusterPropertyClaimDetailsService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });

    $translatePartialLoader.addPart('VendorInvoices');
    $translate.refresh();
    $scope.ShowPaymentDiv = false;



    $scope.AllInvoices = [];
    $scope.InvoicesToBePaid = [];
    $scope.SelectedInvoices = [];
    $scope.SelectedVendorId = null;
    $scope.StateList = [];
    $scope.InvoiceAddressed = [];
    $scope.InvoiceModelList = [];
    $scope.AllInvoiceModelList = [];
    $scope.TotalInvoicesToBePaid = null;
    $scope.Payment = {};
    $scope.VendorDetails = {};
    $scope.TotalAmount = null;
    $scope.vendorid = null;
    $scope.IsEFTPayment = false;
    $scope.SelectedFromAllInvoices = [];
    $scope.CurrentClaimTab = 'InvoicesToBePaid';
    function init() {
        $scope.CommomObj = {

            ClaimNumber: sessionStorage.getItem("ClaimNo"),
            ClaimId: sessionStorage.getItem("ClaimId")
        }
        GetInvoicesToBePaid();
        GetAllInvoices();

        var param =
           {
               "isTaxRate": false,
               "isTimeZone": false
           }
        var getStateList = AdjusterPropertyClaimDetailsService.getStates(param);
        getStateList.then(function (success) {
            $scope.StateList = success.data.data;

        }, function (error) { });

    }
    init();

    $scope.GetInvoicesToBePaid = GetInvoicesToBePaid;
    function GetInvoicesToBePaid() {
        var param ={
    "claimId": $scope.CommomObj.ClaimId,
    "claimNumber":  $scope.CommomObj.ClaimNumber,
    "status": "APPROVED"
}

  
        var getVendorInvoices = AdjusterPropertyClaimDetailsService.getAllVendorInvoices(param);
        getVendorInvoices.then(function (success) {

            $scope.InvoicesToBePaid = [];
            $scope.InvoicesToBePaid = success.data.data;
            if ($scope.InvoicesToBePaid !== null && angular.isDefined($scope.InvoicesToBePaid))
            {
                $scope.TotalInvoicesToBePaid = $scope.InvoicesToBePaid[0].invoices === null ? 0 : $scope.InvoicesToBePaid[0].invoices.length;
                
                createModel();
            }
        }, function (error) { });
    };

    $scope.GetAllInvoices = GetAllInvoices;
    function GetAllInvoices() {
        var param = {
            "claimId": $scope.CommomObj.ClaimId,
            "claimNumber": $scope.CommomObj.ClaimNumber
        };
    
        var getAllVendorInvoices = AdjusterPropertyClaimDetailsService.getAllVendorInvoices(param);
        getAllVendorInvoices.then(function (success) {

            $scope.AllInvoices = [];
            $scope.AllInvoices = success.data.data;
            createAllInvoiceModel();
        }, function (error) { });

    };

    //Create Model For Invoices To Be Paid
    $scope.createModel = createModel;
    function createModel() {
        $scope.InvoiceModelList = [];
        //created custom data object 
        angular.forEach($scope.InvoicesToBePaid, function (mainvalue, key) {

            $scope.Invoicemodel = {};
            $scope.Invoicemodel.vendorId = mainvalue.vendorId;
            $scope.Invoicemodel.vendorNumber = null;
            $scope.Invoicemodel.vendorName = mainvalue.vendorName;
            $scope.Invoicemodel.id = null;
            $scope.Invoicemodel.amount = null;
            $scope.Invoicemodel.createDate = null;
            $scope.Invoicemodel.currency = null;
            $scope.Invoicemodel.dueDate = null;
            $scope.Invoicemodel.invoiceNumber = null;
            $scope.Invoicemodel.isApproved = null;
            $scope.Invoicemodel.isPaid = null;
            $scope.Invoicemodel.vendorNote = null;
            $scope.Invoicemodel.taxRate = null;
            $scope.Invoicemodel.status = null;
            $scope.Invoicemodel.invoiceAttachments = null;
            $scope.Invoicemodel.Footer = null;
            $scope.Invoicemodel.TotalTitle = null;
            $scope.Invoicemodel.Header = 1;

            $scope.InvoiceModelList.push($scope.Invoicemodel);


            angular.forEach(mainvalue.invoices, function (value, key) {
                $scope.Invoicemodel = {};

                $scope.Invoicemodel.vendorId = mainvalue.vendorId;
                $scope.Invoicemodel.vendorNumber = mainvalue.vendorNumber;
                $scope.Invoicemodel.vendorName = mainvalue.vendorName;
                $scope.Invoicemodel.id = value.id;
                $scope.Invoicemodel.amount = value.amount;
                $scope.Invoicemodel.createDate = value.createDate;
                $scope.Invoicemodel.currency = value.currency;
                $scope.Invoicemodel.dueDate = value.dueDate;
                $scope.Invoicemodel.invoiceNumber = value.invoiceNumber;
                $scope.Invoicemodel.isApproved = value.isApproved;
                $scope.Invoicemodel.isPaid = value.isPaid;
                $scope.Invoicemodel.vendorNote = value.vendorNote;
                $scope.Invoicemodel.taxRate = value.taxRate;
                $scope.Invoicemodel.status = value.status.status;
                $scope.Invoicemodel.invoiceAttachments = value.invoiceAttachments;
                $scope.Invoicemodel.TotalTitle = null;
                $scope.Invoicemodel.Header = 0;

                $scope.InvoiceModelList.push($scope.Invoicemodel);
            });


            $scope.Invoicemodel = {};
            $scope.Invoicemodel.vendorId = null;
            $scope.Invoicemodel.vendorNumber = null;
            $scope.Invoicemodel.vendorName = mainvalue.vendorName;
            $scope.Invoicemodel.id = null;
            $scope.Invoicemodel.amount = null;
            $scope.Invoicemodel.createDate = null;
            $scope.Invoicemodel.currency = null;
            $scope.Invoicemodel.dueDate = null;
            $scope.Invoicemodel.invoiceNumber = null;
            $scope.Invoicemodel.isApproved = null;
            $scope.Invoicemodel.isPaid = null;
            $scope.Invoicemodel.vendorNote = null;
            $scope.Invoicemodel.taxRate = null;
            $scope.Invoicemodel.status = null;
            $scope.Invoicemodel.invoiceAttachments = null;
            $scope.Invoicemodel.Footer = $scope.calculateTotalForInvocesToBePaid(mainvalue.vendorId);
            $scope.Invoicemodel.Header = 0;
            $scope.Invoicemodel.TotalTitle = "Total"
            $scope.InvoiceModelList.push($scope.Invoicemodel);

        });

    };


    //Create Model For All Invoices

    $scope.createAllInvoiceModel = createAllInvoiceModel;
    function createAllInvoiceModel() {
        $scope.AllInvoiceModelList = [];
        //created custom data object 
        angular.forEach($scope.AllInvoices, function (mainvalue, key) {

            $scope.Invoicemodel = {};
            $scope.Invoicemodel.vendorId = mainvalue.vendorId;
            $scope.Invoicemodel.vendorNumber = null;
            $scope.Invoicemodel.vendorName = mainvalue.vendorName;
            $scope.Invoicemodel.id = null;
            $scope.Invoicemodel.amount = null;
            $scope.Invoicemodel.createDate = null;
            $scope.Invoicemodel.currency = null;
            $scope.Invoicemodel.dueDate = null;
            $scope.Invoicemodel.invoiceNumber = null;
            $scope.Invoicemodel.isApproved = null;
            $scope.Invoicemodel.isPaid = null;
            $scope.Invoicemodel.vendorNote = null;
            $scope.Invoicemodel.taxRate = null;
            $scope.Invoicemodel.status = null;
            $scope.Invoicemodel.invoiceAttachments = null;
            $scope.Invoicemodel.Footer = null;
            $scope.Invoicemodel.TotalTitle = null;
            $scope.Invoicemodel.Header = 1;

            $scope.AllInvoiceModelList.push($scope.Invoicemodel);


            angular.forEach(mainvalue.invoices, function (value, key) {
                $scope.Invoicemodel = {};

                $scope.Invoicemodel.vendorId = mainvalue.vendorId;
                $scope.Invoicemodel.vendorNumber = mainvalue.vendorNumber;
                $scope.Invoicemodel.vendorName = mainvalue.vendorName;
                $scope.Invoicemodel.id = value.id;
                $scope.Invoicemodel.amount = value.amount;
                $scope.Invoicemodel.createDate = value.createDate;
                $scope.Invoicemodel.currency = value.currency;
                $scope.Invoicemodel.dueDate = value.dueDate;
                $scope.Invoicemodel.invoiceNumber = value.invoiceNumber;
                $scope.Invoicemodel.isApproved = value.isApproved;
                $scope.Invoicemodel.isPaid = value.isPaid;
                $scope.Invoicemodel.vendorNote = value.vendorNote;
                $scope.Invoicemodel.taxRate = value.taxRate;
                $scope.Invoicemodel.status = value.status.status;
                $scope.Invoicemodel.invoiceAttachments = value.invoiceAttachments;
                $scope.Invoicemodel.TotalTitle = null;
                $scope.Invoicemodel.Header = 0;

                $scope.AllInvoiceModelList.push($scope.Invoicemodel);
            });


            $scope.Invoicemodel = {};
            $scope.Invoicemodel.vendorId = null;
            $scope.Invoicemodel.vendorNumber = null;
            $scope.Invoicemodel.vendorName = mainvalue.vendorName;
            $scope.Invoicemodel.id = null;
            $scope.Invoicemodel.amount = null;
            $scope.Invoicemodel.createDate = null;
            $scope.Invoicemodel.currency = null;
            $scope.Invoicemodel.dueDate = null;
            $scope.Invoicemodel.invoiceNumber = null;
            $scope.Invoicemodel.isApproved = null;
            $scope.Invoicemodel.isPaid = null;
            $scope.Invoicemodel.vendorNote = null;
            $scope.Invoicemodel.taxRate = null;
            $scope.Invoicemodel.status = null;
            $scope.Invoicemodel.invoiceAttachments = null;
            $scope.Invoicemodel.Footer = $scope.calculateTotalForAllInvoices(mainvalue.vendorId);
            $scope.Invoicemodel.Header = 0;
            $scope.Invoicemodel.TotalTitle = "Total"
            $scope.AllInvoiceModelList.push($scope.Invoicemodel);

        });

    }

    $scope.GotoInvoiceDetails = function (invoice) {
        if (invoice.invoiceNumber !== null && angular.isDefined(invoice.invoiceNumber)) {
            var ObjDetails = {
                "InvoiceNo": invoice.invoiceNumber,
                "ClaimNo": $scope.CommomObj.ClaimNumber,
                "InvoicesToBePaid": $scope.TotalInvoicesToBePaid,
                "PageName": "VendorInvoices"
            };
              sessionStorage.setItem("Details", JSON.stringify(ObjDetails))
            $location.url('VendorInvoiceDetails');
        }
    };

    $scope.calculateTotalForInvocesToBePaid = calculateTotalForInvocesToBePaid
    function calculateTotalForInvocesToBePaid(id) {
        $scope.FilteredList = $filter('filter')($scope.InvoicesToBePaid, { vendorId: id });
        var total = 0;
        angular.forEach($scope.FilteredList, function (data) {
            angular.forEach(data.invoices, function (invoice) {

                total = total + invoice.amount;

            });
        });
        return total;
    };

    $scope.calculateTotalForAllInvoices = calculateTotalForAllInvoices
    function calculateTotalForAllInvoices(id) {
        $scope.FilteredList = $filter('filter')($scope.AllInvoices, { vendorId: id });
        var total = 0;
        angular.forEach($scope.FilteredList, function (data) {
            angular.forEach(data.invoices, function (invoice) {

                total = total + invoice.amount;

            });
        });
        return total;
    };


    $scope.SelectSingleInvoice = SelectSingleInvoice;
    function SelectSingleInvoice(invoice) {
        if ($scope.vendorid === null) {
            $scope.getSelected(invoice);
        }
        else {
            if ($scope.vendorid === invoice.vendorId) {
                $scope.getSelected(invoice);
            }
            else {
                angular.forEach($scope.InvoiceModelList, function (invoices) {

                    if (invoices.id != invoice.id) {

                        invoices.Isselected = false;
                    }
                })
                $scope.InvoiceAddressed = [];
                $scope.getSelected(invoice);
            }

        }
    };

    $scope.getSelected = getSelected;
    function getSelected(invoice) {
        //get selected vendor id on every click of each checkbox

        $scope.vendorid = invoice.vendorId;
        var index = $scope.InvoiceAddressed.indexOf(invoice.id);
        if (index > -1) {
            angular.forEach($scope.InvoiceModelList, function (invoices) {

                if (invoices.id === invoice.id) {
                    $scope.InvoiceAddressed.splice(index, 1);
                    $scope.TotalAmount = $scope.TotalAmount - invoice.amount;
                    invoice.Isselected = false;
                }
            })

        }
        else {
            $scope.InvoiceAddressed.push(invoice.id);
            $scope.TotalAmount = $scope.TotalAmount + invoice.amount;

        }
    };

    $scope.SelectAllInvoices = function (invoice) {
        $scope.vendorid = invoice.vendorId;
        $scope.TotalAmount = 0;
        $scope.InvoiceAddressed = [];
        angular.forEach($scope.InvoiceModelList, function (obj) {
            obj.Isselected = false;
            if (obj.vendorId === invoice.vendorId) {

                if (obj.id != null) {
                    $scope.InvoiceAddressed.push(obj.id);
                    obj.Isselected = true;
                    $scope.TotalAmount = $scope.TotalAmount + obj.amount;
                }
            }
        })
    };
    $scope.RemoveRow = function (index, InvoiceId) {

        angular.forEach($scope.InvoiceModelList, function (Invoice) {

            if (InvoiceId == Invoice.id) {
                Invoice.Isselected = false;
                $scope.TotalAmount = $scope.TotalAmount - Invoice.amount;
            }
        });
        $scope.InvoiceAddressed.splice(index, 1);
    };
    $scope.MakePayment = function () {
        $scope.Invoices = [];
        angular.forEach($scope.InvoiceAddressed, function (invoice) {

            $scope.Invoices.push({ id: invoice });
        });

        var param;
        var Checkdate = new Date($scope.Payment.Date);
        Checkdate = Checkdate.toISOString().split('.')[0];
        Checkdate = Checkdate + 'Z';

        if ($scope.IsEFTPayment)
        {
            param = {
                "invoices": $scope.Invoices,
                "paymentDate": Checkdate,
                "bankName": $scope.Payment.BankName,
                "bankAccountNumber": $scope.Payment.BankAccountNumber,
                "eft": true,
                "routingNumber": $scope.Payment.RoutingNumber,
                "payAmount": $scope.TotalAmount.toString(),
                "vendorDetails": {
                    "vendorId": $scope.vendorid
                }
            }
        }
        else {
            param = {
                "invoices": $scope.Invoices,
                "bankName": $scope.Payment.BankName,
                "checkNumber": $scope.Payment.CheckNumber,
                "check": true,
                "checkDate": Checkdate,
                "payAmount": $scope.TotalAmount.toString(),
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
                    "vendorId": $scope.vendorid
                }
            };
        }
      
        var makePayment = AdjusterPropertyClaimDetailsService.MakePayment(param);
        makePayment.then(function (success) {

            $scope.status = success.status;
            $scope.ShowPaymentDiv = false;
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
        $scope.InvoiceAddressed = [];
        $scope.InvoiceModelList = [];
        $scope.vendorid = null;
        $scope.GetInvoicesToBePaid();
    };

    //Refresh content
    $scope.refreshPage = function () {
       // Reset();
        // GetAllInvoices();
        init();
       
    };

    //Payment By check section
    $scope.ShowCheck = function () {
        $scope.IsEFTPayment = false;
    };

    //Payment By EFT section
    $scope.ShowEFT = function () {
        $scope.IsEFTPayment = true;
    };
    //Show hide Payment
    $scope.showPayment = showPayment;
    function showPayment() {
        $scope.getVendorDetails();
        $scope.TotalAmount = 0;
        angular.forEach($scope.InvoiceModelList, function (invoice) {
            if (invoice.Isselected == true) {
                $scope.TotalAmount += invoice.amount;
            }
        });
        $scope.ShowPaymentDiv = true;
    };


    $scope.getVendorDetails = getVendorDetails;
    function getVendorDetails() {

        param = {
            "vendorId": $scope.vendorid
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

    $scope.HidepaymentDiv = function () {
        $scope.RefreshAllInvoices();
        $scope.CurrentClaimTab = 'AllInvoices';
      
        $scope.ShowPaymentDiv = false;
    }

    $scope.GoBack = function () {
        var UserType = sessionStorage.getItem("RoleList");
        if (UserType == "ADJUSTER") {
            $location.url("AdjusterPropertyClaimDetails");
        }
        else if (UserType == "SUPERVISOR")
        {
            $location.url("SupervisorClaimDetails");
        }
            
    };

    $scope.GotoDashboard = GotoDashboard;
    function GotoDashboard() {
        $location.url(sessionStorage.getItem('HomeScreen'));
    };

    $scope.SelectAllInvoicesAllInvoice = SelectAllInvoicesAllInvoice;
    function SelectAllInvoicesAllInvoice(invoice)
    {
        $scope.vendorid = invoice.vendorId;
        $scope.SelectedFromAllInvoices = [];
        angular.forEach($scope.AllInvoiceModelList, function (obj) {
            obj.Isselected = false;
            if (obj.vendorId === invoice.vendorId) {

                if (obj.id != null) {
                    $scope.SelectedFromAllInvoices.push(obj.id);
                    obj.Isselected = true;
                    //$scope.TotalAmount = $scope.TotalAmount + obj.amount;
                }
            }
        });
      
    }

    $scope.SelectSingleInvoiceFromAllInvoice = SelectSingleInvoiceFromAllInvoice;
    function SelectSingleInvoiceFromAllInvoice(invoice) {
        if ($scope.vendorid === null) {
            $scope.getSelectedFromAllInvoice(invoice);
        }
        else {
            if ($scope.vendorid === invoice.vendorId) {
                $scope.getSelectedFromAllInvoice(invoice);
            }
            else {
                angular.forEach($scope.AllInvoiceModelList, function (invoices) {

                    if (invoices.id != invoice.id) {

                        invoices.Isselected = false;
                    }
                })
                $scope.SelectedFromAllInvoices = [];
                $scope.getSelectedFromAllInvoice(invoice);
            }

        }
    };


    $scope.getSelectedFromAllInvoice = getSelectedFromAllInvoice;
    function getSelectedFromAllInvoice(invoice) {
        //get selected vendor id on every click of each checkbox

        $scope.vendorid = invoice.vendorId;
        var index = $scope.SelectedFromAllInvoices.indexOf(invoice.id);
        if (index > -1) {
            angular.forEach($scope.AllInvoiceModelList, function (invoices) {

                if (invoices.id === invoice.id) {
                    $scope.SelectedFromAllInvoices.splice(index, 1);
                   // $scope.TotalAmount = $scope.TotalAmount - invoice.amount;
                    invoice.Isselected = false;
                }
            })

        }
        else {
            $scope.SelectedFromAllInvoices.push(invoice.id);
            //$scope.TotalAmount = $scope.TotalAmount + invoice.amount;

        }
       
    };


  
    //Approve Invoice
    $scope.ApproveInvoiceFromAllInvoices = ApproveInvoiceFromAllInvoices;
    function ApproveInvoiceFromAllInvoices()
    {
        
        if (($scope.SelectedFromAllInvoices.length ===0 )|| ($scope.SelectedFromAllInvoices===null))
        {
            toastr.remove();
            toastr.error("Please select Invoice to Approve","Warning..!!");
        }
        else
        {
            var count = 0;
            $scope.Message = "";
            angular.forEach($scope.SelectedFromAllInvoices, function (invoice) {
                var param = {

                    "id": invoice,
                    "isApproved": true

                };
              
                ApprooveInvoice = AdjusterPropertyClaimDetailsService.ApproveInvoice(param);
                ApprooveInvoice.then(function (success) {                
                    count = parseInt(count) + 1;
                    $scope.Message = success.data.message;
                }, function (error) {
                    toastr.remove();
                    toastr.error(error.data.errorMessage, "Error");
                });
            });
           
         
                $scope.GetAllInvoices();
                //toastr.remove();
                //toastr.error($scope.Message, "Confirmation");
           
        }
       
    }
    $scope.RefreshInvoicesToBePaidPage = function () {
        
        $scope.GetInvoicesToBePaid();
        $scope.CurrentClaimTab = 'InvoicesToBePaid';
    };

    $scope.RefreshAllInvoices = function () {

        $scope.GetAllInvoices();
    };

});