angular.module('MetronicApp').controller('AccountPayableDetailsController', function ($rootScope, $uibModal, $scope, $window, $filter, settings, $http, $timeout, $location, $state,
    $translate, $translatePartialLoader, AuthHeaderService, AccountPayableService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });

    //set language
    $translatePartialLoader.addPart('PayableDetails');
    $translate.refresh();
    $scope.PageSize = $rootScope.settings.pagesize;
    $scope.contractDiv = false;
    $scope.Details = (sessionStorage.getItem("Details") != null || sessionStorage.getItem("Details") != " ") ? JSON.parse(sessionStorage.getItem("Details")) : toastr.error("Missing invoice details");
    function init() {
        $scope.VendorInvoiceDetails = [];
        $scope.DisplayPayment = false;
        $scope.paymentDetails = {};
        $scope.paymentDetails = { PaymentMethod: '1' };
        $scope.VendorDetails = {};
        $scope.isPayNow = false;
        // $scope.CheckSection = true;
        $scope.CommomObj = {
            InvoiceNo: $scope.Details.InvoiceNo,
            PageName: $scope.Details.PageName,
            PagePath: $scope.Details.PagePath
        }
        GetInvoiceDetails();
    };
    init();

    $scope.GetInvoiceDetails = GetInvoiceDetails;
    function GetInvoiceDetails() {
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "invoiceNumber": $scope.CommomObj.InvoiceNo
        };
        var promisePost = AccountPayableService.getAccountPayableDetails(param);
        promisePost.then(function (success) {
            $scope.VendorInvoiceDetails = [];
            $scope.VendorInvoiceDetails = success.data.data;
            if ($scope.VendorInvoiceDetails.paymentDetails != null && angular.isDefined($scope.VendorInvoiceDetails.paymentDetails)) {
                $scope.isPayNow = true;
                $scope.paymentDetails = $scope.VendorInvoiceDetails.paymentDetails;
                if($scope.VendorInvoiceDetails.paymentDetails.check){
                    $scope.CheckSection = true;
                }else{
                    $scope.CheckSection = false;
                }
                
                $scope.paymentDetails.checkDate = (angular.isDefined($scope.paymentDetails.checkDate) && $scope.paymentDetails.checkDate != null) ? ($filter('DateFormatMMddyyyy')($scope.paymentDetails.checkDate)) : ($filter('TodaysDate')());
                $scope.paymentDetails.paymentDate = (angular.isDefined($scope.paymentDetails.paymentDate) && $scope.paymentDetails.paymentDate != null) ? ($filter('DateFormatMMddyyyy')($scope.paymentDetails.paymentDate)) : ($filter('TodaysDate')());
                if ($scope.VendorInvoiceDetails.paymentMethod == "check")
                    $scope.paymentDetails.PaymentMethod = '1';
                else
                    $scope.paymentDetails.PaymentMethod = '2';
            }
            var createdBy = ($scope.VendorInvoiceDetails && $scope.VendorInvoiceDetails.creatorName) ? ($scope.VendorInvoiceDetails.creatorName.split(' ')[1] + ', ' + $scope.VendorInvoiceDetails.creatorName.split(' ')[0]) : "";
            $scope.VendorInvoiceDetails.createdBy = createdBy;
            calculateTotalPayable();
            if (angular.isDefined($scope.VendorInvoiceDetails.accountPayableItemDTOs) && $scope.VendorInvoiceDetails.accountPayableItemDTOs !== null) {
                $scope.SalvageDetails = $scope.VendorInvoiceDetails.accountPayableItemDTOs;
            }
            $(".page-spinner-bar").addClass("hide");
        });
    };

    $scope.calculateTotalPayable = calculateTotalPayable;
    function calculateTotalPayable() {
        if (angular.isDefined($scope.VendorInvoiceDetails.advancePayment) && $scope.VendorInvoiceDetails.advancePayment != null && $scope.VendorInvoiceDetails.advancePayment != "") {
            $scope.VendorInvoiceDetails.total = parseFloat($scope.VendorInvoiceDetails.subtotal) - parseFloat($scope.VendorInvoiceDetails.advancePayment);
        }
        else {
            $scope.VendorInvoiceDetails.total = parseFloat($scope.VendorInvoiceDetails.total);
        }
    };

    var role = sessionStorage.getItem('RoleList');

    $scope.GotToAssignmentDetailsScreen = GotToAssignmentDetailsScreen;
    function GotToAssignmentDetailsScreen(assignement) {
        sessionStorage.setItem("ClaimNo", $scope.VendorInvoiceDetails.claim.claimNumber);
        sessionStorage.setItem("ClaimId", $scope.VendorInvoiceDetails.claim.id);
        sessionStorage.setItem("assignementObject", assignement);
        sessionStorage.setItem("vrn", $scope.VendorInvoiceDetails.registrationNumber)
        var url = $state.href('AdjusterPropertyClaimDetails');
        if (role == 'CLAIM SUPERVISOR') {
            url = $state.href('SupervisorClaimDetails');
        }
        window.open(url, '_blank');
    };

    $scope.GoToSalvageDetails = function (item) {
        var url = $state.href('AdjusterLineItemDetails');
        sessionStorage.setItem("ActiveTab", "Salvage");
        if (role == 'CLAIM ADJUSTER' || role == 'ADJUSTER') {
            sessionStorage.setItem("ClaimNo", $scope.VendorInvoiceDetails.claim.claimNumber);
            sessionStorage.setItem("ClaimId", $scope.VendorInvoiceDetails.claim.id);
            // sessionStorage.setItem("SupervisorPostLostItemId", $scope.VendorInvoiceDetails.item.id);
            sessionStorage.setItem("AdjusterPostLostItemId", $scope.VendorInvoiceDetails.item.id);            
        }
        if (role == 'CLAIM SUPERVISOR') {
            sessionStorage.setItem("SupervisorClaimNo", $scope.VendorInvoiceDetails.claim.claimNumber);
            sessionStorage.setItem("SupervisorClaimId", $scope.VendorInvoiceDetails.claim.id);
            sessionStorage.setItem("SupervisorPostLostItemId", $scope.VendorInvoiceDetails.item.id);
            //sessionStorage.setItem("AdjusterPostLostItemId", $scope.VendorInvoiceDetails.item.id);            
            url = $state.href('SupervisorLineItemDetails');            
        }
        window.open(url, '_blank');
    }

    // $scope.goBack = goBack;
    // function goBack() {
    //     $location.url($scope.Details.PagePath);
    // }

    $scope.openContractDetails = openContractDetails;
    function openContractDetails(invoiceNo) {
        $scope.contractDiv = true;
        sessionStorage.setItem("contractType", "salvage");
        sessionStorage.setItem("invoiceNo", invoiceNo);
        $("#contract_preview").show();
    }

    $scope.close = function () {
        $scope.$broadcast('CloseImgDiv', { imgDiv: false });
        $("#contract_preview").hide();
    }

    // Save as pdf - Account Payable Details 
    $scope.exportPDF = exportPDF;
    function exportPDF() {
        document.getElementById('pdfGenerator').style.display = 'block';
        $(".page-spinner-bar").removeClass("hide");

        /* START - PDF Common Header & footer data */
        $window.apNum = "# " + $scope.VendorInvoiceDetails.invoiceNumber;
        $window.claimNum = "# " + $scope.VendorInvoiceDetails.claimNumber;
        /* END - PDF Common Header & footer data */

        var pdfName = "AP#" + $scope.VendorInvoiceDetails.invoiceNumber + ".pdf";

        setTimeout(function () {
            kendo.drawing.drawDOM("#pdfGenerator", {
                allPages: true,
                paperSize: "A4",
                Portrait: true,
                forcePageBreak: ".page-break",
                multiPage: 'true',
                scale: 0.8,
                margin: { left: 0, right: 0, top: 0, bottom: "1cm" },
                template: kendo.template($("#page-header-footer-template").html())
            }).then(function (group) {
                kendo.drawing.pdf.saveAs(group, pdfName);
                document.getElementById('pdfGenerator').style.display = 'none';
                $(".page-spinner-bar").addClass("hide");
            });
        }, 3000);
    }

    $scope.goToDashboard = goToDashboard;
    function goToDashboard() {
        $location.url(sessionStorage.getItem('HomeScreen'));
    }

     $scope.claimDetailsPage = claimDetailsPage;
     function claimDetailsPage(){
        sessionStorage.setItem("ClaimNo", $scope.VendorInvoiceDetails.claim.claimNumber);
        sessionStorage.setItem("ClaimId", $scope.VendorInvoiceDetails.claim.id);
        $location.url('AdjusterPropertyClaimDetails');
     }
   
     $scope.goToSalvage = goToSalvage;
     function goToSalvage(){
        sessionStorage.setItem("ClaimNo", $scope.VendorInvoiceDetails.claim.claimNumber);
        sessionStorage.setItem("ClaimId", $scope.VendorInvoiceDetails.claim.id);
        sessionStorage.setItem("AdjusterPostLostItemId",$scope.VendorInvoiceDetails.item.id );
        sessionStorage.setItem("ForwardTab", "Salvage");
            $location.url('AdjusterLineItemDetails')

     }
})