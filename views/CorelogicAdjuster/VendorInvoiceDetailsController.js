angular.module('MetronicApp').controller('VendorInvoiceDetailsController', function ($rootScope, $filter, $uibModal, $scope, settings,
    $http, $timeout, $location, $translate, $translatePartialLoader, AdjusterPropertyClaimDetailsService, VendorInvoiceDetailsService, AuthHeaderService, $anchorScroll) {
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
    $scope.EFTPayment = {};
    $scope.VendorDetails = {};
    $scope.VendorState = "";
    $scope.DisplayPayment = false;
    $scope.ShowPayment = false;
    $scope.CheckSection = true;
    $scope.MaterialCharges = [];
    $scope.LabourCharges = [];
    $scope.PayInvoice;
    $scope.contractDiv = false;
    $scope.Details = sessionStorage.getItem("Details") != null && sessionStorage.getItem("Details") != " " ? JSON.parse(sessionStorage.getItem("Details")) : toastr.error("Missing invoice details");
    $scope.CommomObj = {
        ClaimNumber: $scope.Details.ClaimNo,
        InvoiceNo: $scope.Details.InvoiceNo,
        InvociesToBePaid: $scope.Details.InvoicesToBePaid,
        PageName: $scope.Details.PageName,
        IsServiceRequestInvoice: $scope.Details.isServiceRequestInvoice,
        SalvageId: $scope.Details.SalvageId,
        PagePath: $scope.Details.PagePath ? $scope.Details.PagePath : $scope.Details.PageName
    };
    $scope.RoleList = sessionStorage.getItem("RoleList");
    $scope.claimNumber = $scope.Details.ClaimNo;
    $scope.ItemNo = $scope.Details.ItemNo
    function init() {
        $scope.PayInvoice = false;
        GetStateList();
        GetInvoiceDetails();
        //Format date
        if ($scope.VendorInvoiceDetails) {
            $scope.VendorInvoiceDetails.invoiceDetails.dueDate = $filter('date')(newValue, 'MM/dd/yyyy');
        }
    }
    init();
    $scope.GetInvoiceDetails = GetInvoiceDetails;
    function GetInvoiceDetails() {
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "invoiceNumber": $scope.CommomObj.InvoiceNo,
            
        };
        $scope.TotalPayable = 0.00
        //Get Claims list for my claims API #10

        var promisePost = VendorInvoiceDetailsService.getInviceDetails(param);
        promisePost.then(function (success) {
            $scope.VendorInvoiceDetails = [];
            $scope.VendorInvoiceDetails = success.data.data;
            if($scope.VendorInvoiceDetails.paymentInfo!=null && $scope.VendorInvoiceDetails.paymentInfo ){
                $scope.VendorInvoiceDetails.paymentInfo.checkDate=$filter('DateFormatMMddyyyy')($scope.VendorInvoiceDetails.paymentInfo.checkDate);
                $scope.VendorInvoiceDetails.paymentInfo.paymentDate=$filter('DateFormatMMddyyyy')($scope.VendorInvoiceDetails.paymentInfo.paymentDate);
            }
            
            $scope.TotalPayable = 0.00

            angular.isDefined($scope.VendorInvoiceDetails.invoiceDetails && $scope.VendorInvoiceDetails.invoiceDetails != null)
            {
                $scope.VendorInvoiceDetails.invoiceDetails.amount = parseFloat($scope.VendorInvoiceDetails.invoiceDetails.amount).toFixed(2);
                $scope.TotalPayable += ($scope.VendorInvoiceDetails.invoiceDetails.amount) ? parseFloat($scope.VendorInvoiceDetails.invoiceDetails.amount) : 0.00;
                $scope.TotalPayable -= ($scope.VendorInvoiceDetails.invoiceDetails.advancePayment) ? parseFloat($scope.VendorInvoiceDetails.invoiceDetails.advancePayment) : 0.00
                $scope.TotalPayable -= ($scope.VendorInvoiceDetails.invoiceDetails.deductible) ? parseFloat($scope.VendorInvoiceDetails.invoiceDetails.deductible).toFixed(2) : 0.00;
                //$scope.TotalPayable = $filter('currency')($scope.TotalPayable);
                if ($scope.VendorInvoiceDetails.invoiceDetails.status.status == "APPROVED") {
                    $scope.PayInvoice = true;
                }
                else if ($scope.VendorInvoiceDetails.invoiceDetails.status.status == "PAID") {
                    $scope.PayInvoice = true;
                }
                else {
                    $scope.PayInvoice = false;
                }
            }

            if (angular.isDefined($scope.VendorInvoiceDetails.additionalCharges)) {
                $scope.MaterialCharges = [];
                $scope.LabourCharges = [];
                angular.forEach($scope.VendorInvoiceDetails.additionalCharges, function (charge) {

                    if (charge.type == "MATERIAL") {
                        $scope.MaterialCharges.push(charge)
                    }
                    else if (charge.type == "LABOR") {
                        $scope.LabourCharges.push(charge)
                    }
                })
            }
            else {
                $scope.SelectItemsAndValues();
            }
            if ($scope.VendorInvoiceDetails.vendor == null) {
                $scope.VendorInvoiceDetails.vendor = { "billingAddress": "" }
            }
            $scope.VendorInvoiceDetails.vendor.billingAddress = $scope.VendorInvoiceDetails.vendorBillAddress;

            var combinedItems = [];
            var found = false;
            var invoiceItems = $scope.VendorInvoiceDetails.invoiceItems;
            angular.forEach(invoiceItems, function (item) {
                for (var i = 0; i < combinedItems.length; i++) {
                    if (item.lineItemServiceType && item.lineItemServiceType.id == combinedItems[i].billingCodeId) {
                        found = true;
                        var item1 = combinedItems[i];
                        //  item1.description =item1.description.concat(", ").concat(item.description);
                        item1.units += item.units;
                        //  item1.rate += item.rate;
                        item1.subTotal += item.subTotal;
                        item1.salesTaxAmount += (item.subTotal / 100) * item.salesTax;
                        item1.amount += item.amount;
                        break;
                    } else {
                        found = false;
                    }
                }
                if (!found) {
                    var item2 = {};
                    item2.billingCodeId = item.lineItemServiceType.id;
                    item2.units = item.units;
                    item2.description = item.description;
                    item2.rate = item.rate;
                    item2.subTotal = item.subTotal;
                    item2.salesTaxAmount = (item.subTotal / 100) * item.salesTax;
                    item2.salesTax = item.salesTax;
                    item2.amount = item.amount;
                    item2.billingCode = item.lineItemServiceType.billingCode;
                    combinedItems.push(item2);
                }
            });
            $scope.combinedItems = combinedItems;
            console.log(combinedItems);
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                toastr.error(error.data.errorMessage, "Error");
            }
            else {
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
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

    $scope.GetStateList = GetStateList;
    function GetStateList() {
        var param =
        {
            "isTaxRate": false,
            "isTimeZone": false
        }
        var GetStates = AdjusterPropertyClaimDetailsService.getStates(param);
        GetStates.then(function (success) {
            $scope.StateList = success.data.data;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        });

    }

    $scope.SelectItemsAndValues = SelectItemsAndValues;
    function SelectItemsAndValues() {
        $scope.SelectedItems = [];
        $scope.GrandTotal = null;
        $scope.InvoiceNo = null;
        $scope.InvoicesLeftToPay = null;
        $scope.SubTotal = null;
        $scope.GrandTotal = null;
        $scope.Tax = null;

        if ($scope.VendorInvoiceDetails != null || angular.isDefined($scope.VendorInvoiceDetails)) {
            $scope.InvoiceNo = $scope.VendorInvoiceDetails.invoiceDetails.invoiceNumber;
            $scope.InvoicesLeftToPay = $scope.CommomObj.InvociesToBePaid;

            angular.forEach($scope.VendorInvoiceDetails.invoiceItems, function (invoices) {
                $scope.SelectedItems.push({ itemId: invoices.id });
                var quantity = 0; var price = 0;
                quantity = (angular.isDefined(invoices.units) && invoices.units !== null) ? parseFloat(invoices.units).toFixed(2) : 0
                price = (angular.isDefined(invoices.unitPrice) && invoices.unitPrice !== null) ? parseFloat(invoices.unitPrice).toFixed(2) : 0;
                $scope.SubTotal += parseFloat(quantity) * parseFloat(price).toFixed(2);

                $scope.Tax += ((angular.isDefined(invoices.tax) && invoices.tax !== null) ? invoices.tax : 0).toFixed(2);
                $scope.GrandTotal += parseFloat(invoices.amount).toFixed(2);

                angular.forEach(invoices.services, function (service) {

                    var quantity = 0; var price = 0;
                    quantity = (angular.isDefined(service.quantity) && service.quantity !== null) ? service.quantity : 0
                    price = (angular.isDefined(service.rate) && service.rate !== null) ? parseFloat(service.rate) : 0;
                    $scope.SubTotal += parseFloat(quantity) * parseFloat(price).toFixed(2)

                    $scope.Tax += ((angular.isDefined(service.tax) && service.tax !== null) ? parseFloat(service.tax).toFixed(2) : 0);
                    $scope.GrandTotal += parseFloat(service.amount).toFixed(2);
                })
            })

        }
    }

    $scope.ShowPayment = function () {
        $scope.bindVendorData(); //binding selected vendor data
        $scope.DisplayPayment = true;
        // var scroT = $('#PaymentSec').offset();
        var h = $('#PayBtn').offset().top > 0 ? $('#PayBtn').offset().top : $(document).height();
        $('html,body').stop(true, true).animate({ scrollTop: h + 200 + 'px' });
    }

    $scope.RadioChecked = RadioChecked;
    function RadioChecked() {
        if ($scope.CheckSection)
            $scope.CheckSection = false;
        else
            $scope.CheckSection = true;
    }


    $scope.MakePayment = MakePayment;
    function MakePayment() {

        if ($scope.CheckSection == true) {
            // var Checkdate = new Date($scope.CheckPayment.Date);
            // Checkdate = Checkdate.toISOString().split('.')[0];
            // Checkdate = Checkdate + 'Z';
            var param = {
                "invoices": [{
                    "id": $scope.VendorInvoiceDetails.invoiceDetails.id
                }],
                "bankName": $scope.CheckPayment.BankName,
                "checkNumber": $scope.CheckPayment.CheckNo,
                "check": true,
                "checkDate": $filter('DatabaseDateFormatMMddyyyy')($scope.CheckPayment.Date),
                "payAmount": $scope.GrandTotal,
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
                    "vendorId": $scope.VendorInvoiceDetails.vendor.vendorId
                }
            };

        }
        else if ($scope.CheckSection == false) {
            // var Checkdate = new Date($scope.EFTPayment.PaymentDate);
            // Checkdate = Checkdate.toISOString().split('.')[0];
            // Checkdate = Checkdate + 'Z';
           

            var param = {
                "invoices": [{
                    "id": $scope.VendorInvoiceDetails.invoiceDetails.id
                }],
                "paymentDate": $filter('DatabaseDateFormatMMddyyyy')($scope.EFTPayment.PaymentDate),
                "bankName": $scope.EFTPayment.BankName,
                "bankAccountNumber": $scope.EFTPayment.BankAccountNumber,
                "eft": true,
                "routingNumber": $scope.EFTPayment.RoutingNumber,
                "referenceNumber":$scope.EFTPayment.referenceNumber,
                "payAmount": $scope.GrandTotal,
                "vendorDetails": {
                    "vendorId": $scope.VendorInvoiceDetails.vendor.vendorId
                }
            };
        }
        
        var makepayment = VendorInvoiceDetailsService.makeItemPaymentByCheck(param);
        makepayment.then(function (success) {
            $scope.status = success.status;
            $scope.DisplayPayment = false;
            if ($scope.status === 200) {
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");
                $scope.Reset();
                GetInvoiceDetails();
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
        $scope.VendorDetails.Name = (angular.isDefined($scope.VendorInvoiceDetails.vendor) && $scope.VendorInvoiceDetails.vendor !== null ? $scope.VendorInvoiceDetails.vendor.vendorName : "");
        $scope.VendorDetails.ShippingAddress1 = (angular.isDefined($scope.VendorInvoiceDetails.vendor.shippingAddress) && $scope.VendorInvoiceDetails.vendor.shippingAddress !== null ? $scope.VendorInvoiceDetails.vendor.shippingAddress.streetAddressOne : "");
        $scope.VendorDetails.ShippingAddress2 = (angular.isDefined($scope.VendorInvoiceDetails.vendor.shippingAddress) && $scope.VendorInvoiceDetails.vendor.shippingAddress !== null ? $scope.VendorInvoiceDetails.vendor.shippingAddress.streetAddressTwo : "");
        $scope.VendorDetails.City = (angular.isDefined($scope.VendorInvoiceDetails.vendor.shippingAddress) && $scope.VendorInvoiceDetails.vendor.shippingAddress !== null ? $scope.VendorInvoiceDetails.vendor.shippingAddress.city : "");
        $scope.VendorDetails.State = (angular.isDefined($scope.VendorInvoiceDetails.vendor.shippingAddress) && $scope.VendorInvoiceDetails.vendor.shippingAddress.state !== null ? $scope.VendorInvoiceDetails.vendor.shippingAddress.state.id : "");
        $scope.VendorDetails.ZipCode = (angular.isDefined($scope.VendorInvoiceDetails.vendor.shippingAddress) && $scope.VendorInvoiceDetails.vendor.shippingAddress !== null ? $scope.VendorInvoiceDetails.vendor.shippingAddress.zipcode : "");
        $scope.GrandTotal = $scope.VendorInvoiceDetails.invoiceDetails.amount ? parseFloat($scope.VendorInvoiceDetails.invoiceDetails.amount - ($scope.VendorInvoiceDetails.invoiceDetails.deductible ? $scope.VendorInvoiceDetails.invoiceDetails.deductible : 0) - ($scope.VendorInvoiceDetails.invoiceDetails.advancePayment ? $scope.VendorInvoiceDetails.invoiceDetails.advancePayment : 0)).toFixed(2) : 0.00;
    };

    $scope.GoBack = function () {
        sessionStorage.setItem("Details", " ");
        $location.url($scope.CommomObj.PagePath);
    };

    $scope.GotoDashboard = GotoDashboard;
    function GotoDashboard() {
        $location.url(sessionStorage.getItem('HomeScreen'));
    };

    $scope.GoClaimDetails = GoClaimDetails;
    function GoClaimDetails() {
        var UserType = sessionStorage.getItem("RoleList");
        if (UserType == "ADJUSTER")
            $location.url("AdjusterPropertyClaimDetails");
        else if (UserType == "CLAIM SUPERVISOR")
            $location.url("SupervisorClaimDetails");
    }

    // Approve invoice
    $scope.ApproveInvoice = ApproveInvoice;
    function ApproveInvoice(flag) {
        if (flag == true) {
            $scope.PayInvoice = true;
        }
        else {
            $scope.PayInvoice = false;
        }
        var Invoiceparam = {
            "id": $scope.VendorInvoiceDetails.invoiceDetails.id,
            "isApproved": flag
        };
        var ApproveInvoice = VendorInvoiceDetailsService.ApproveInvoice(Invoiceparam);
        ApproveInvoice.then(function (success) {
            toastr.remove();
            if (flag == true) {
                toastr.success("Invoice # " + $scope.VendorInvoiceDetails.invoiceDetails.invoiceNumber + " is approved successfully", "Confirmation");
                $scope.PayInvoice = true;
                GetInvoiceDetails();
            }
            else {
                toastr.success("Invoice # " + $scope.VendorInvoiceDetails.invoiceDetails.invoiceNumber + " is rejected/voided", "Confirmation");
                $scope.GoBack();
                GetInvoiceDetails();
            }
            sessionStorage.setItem("Details", " ");
            //$location.url($scope.CommomObj.PageName);
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    };

    $scope.SendToSupervisor = SendToSupervisor;
    function SendToSupervisor() {
        var param = {
            "invoiceId": $scope.VendorInvoiceDetails.invoiceDetails.id
            //"supervisorId":null
        };
        var Details = VendorInvoiceDetailsService.SendToSupervisor(param);
        Details.then(function (success) {
            GetInvoiceDetails();
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }

    //Pay Invocie

    $scope.GotoSearchResult = GotoSearchResult;
    function GotoSearchResult() {
        sessionStorage.setItem("Details", " ");
        $location.url($scope.CommomObj.PageName);
    }

    $scope.PayInvoicefun = PayInvoicefun;
    function PayInvoicefun() {
        $scope.DisplayPayment = true;
    }

    $scope.openContractDetails = openContractDetails;
    function openContractDetails(invoiceNo) {
        $scope.contractDiv = true;
        sessionStorage.setItem("contractType", "claim");
        sessionStorage.setItem("invoiceNo", invoiceNo);
        $("#contract_preview").show();
    }

    $scope.close = function () {
        $scope.$broadcast('CloseImgDiv', { imgDiv: false });
        $("#contract_preview").hide();
    }

    $scope.GoToItem = function () {
        sessionStorage.setItem("SupervisorClaimNo", item.claimItem.claimNumber);
        sessionStorage.setItem("SupervisorClaimId", $scope.CommonObj.ClaimId);
        sessionStorage.setItem("SupervisorPostLostItemId", item.claimItem.id);
        sessionStorage.setItem("AdjusterPostLostItemId", item.claimItem.id);
        $location.url('SupervisorLineItemDetails');
    }

    $scope.GoCancel = function () {
        var pagePath = $scope.Details.PagePath;
        if (pagePath == 'ClaimItems' || pagePath == 'AdjusterClaimItems')
            $scope.GoItemDetails();
        else
            $scope.GoBack();
    }

    $scope.GoItemDetails = function () {
        // $location.url("SupervisorLineItemDetails");
        var pagePath = $scope.Details.PagePath;
        if (pagePath == 'ClaimItems')
            $location.url("SupervisorLineItemDetails");
        else
            $location.url("AdjusterLineItemDetails");
    }

    $scope.downloadInvoicePdf = downloadInvoicePdf;
    function downloadInvoicePdf() {
        var param = {
            "invoiceNumber": $scope.VendorInvoiceDetails.invoiceDetails.invoiceNumber,
            "id":$scope.VendorInvoiceDetails.invoiceDetails.id,
            "claimId": sessionStorage.getItem("ClaimId"),
            "claimNumber" : $scope.VendorInvoiceDetails.claimNumber
        };
        var invoicePdfBytes = AdjusterPropertyClaimDetailsService.getInvoiceDataPdf(param);
        invoicePdfBytes.then(function (response) {
            var blob = response.data;
            startBlobDownload(blob, "Invoice.pdf");
        });
        function startBlobDownload(dataBlob, suggestedFileName) {
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                // for IE
                window.navigator.msSaveOrOpenBlob(dataBlob, suggestedFileName);
            } else {
                // for Non-IE (chrome, firefox etc.)
                var urlObject = URL.createObjectURL(dataBlob);

                var downloadLink = angular.element('<a>Download</a>');
                downloadLink.css('display', 'none');
                downloadLink.attr('href', urlObject);
                downloadLink.attr('download', suggestedFileName);
                angular.element(document.body).append(downloadLink);
                downloadLink[0].click();

                // cleanup
                downloadLink.remove();
                URL.revokeObjectURL(urlObject);
            }
        }
    }

});