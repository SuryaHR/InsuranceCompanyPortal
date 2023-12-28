angular.module('MetronicApp').controller('SupervisorMyInvoicesConroller', function ($translate, $translatePartialLoader, $rootScope, $log, $scope, $filter, settings, $http, $timeout, $location, SupervisorMyInvoicesService, AuthHeaderService) {
    $translatePartialLoader.addPart('SupervisorMyInvoices');  
    $translate.refresh();
    $scope.init = init;
    $scope.vendorInvoiceList = [];
    $scope.newInvoicesToReview = 0;
    $scope.reverse = true;
    $scope.CurrentEventTab = 'Alert';
    $scope.CurrentKPITab = 'Month'
    $scope.limit = 50;
    $scope.moreShown = false;
    $scope.pagesize = 10;
    $scope.AlertList = [];

    function init() {
        $(".page-spinner-bar").removeClass("hide");
        $scope.vendorInvoiceSrcKey = '';
        $scope.vendorInvoiceSortKey = '';
        $scope.vendorInvoiceReverse = true;
        $scope.totalInvoices = 0;
        $scope.invoicesNeedApproval = {
            "currentPage": 1,
            "lastRecord": 10,
            "searchKeyword ": ''
        }
        getVendorInvoiceList();
    }
    init();
    
    // Get Vendor Invoice List
    $scope.getVendorInvoiceList = getVendorInvoiceList;
    function getVendorInvoiceList() {
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "userId": sessionStorage.getItem("UserId"),
            "page": $scope.invoicesNeedApproval.currentPage,
            "sortBy": $scope.vendorInvoiceSortKey,
            "orderBy": $scope.vendorInvoiceReverse ? 1 : 0,
            "searchString": $scope.vendorInvoiceSrcKey,
            "limit":$scope.pagesize
        };
        var vendorInvoiceList = SupervisorMyInvoicesService.getVendorInvoiceList(param);
        vendorInvoiceList.then(function (success) {
            $scope.vendorInvoiceList = [];
            var invoices = success.data.data != null
                && success.data.data.invoices != null ? success.data.data.invoices : null;
                var claims = success.data.data != null
                    && success.data.data.invoices != null ? success.data.data.invoices : null;
            if (angular.isDefined(invoices) && invoices != null && invoices.length > 0) {
                if ($scope.invoicesNeedApproval.currentPage == 1)
                    $scope.invoicesNeedApproval.lastRecord = invoices.length;
                else {
                    // var currentListLength = ($scope.invoicesNeedApproval.currentPage - 1) * $scope.pagesize;
                    // if (currentListLength != $scope.vendorInvoiceList)
                    //     $scope.vendorInvoiceList = new Array(currentListLength).fill(new Object());
                    $scope.invoicesNeedApproval.lastRecord = invoices.length + ($scope.pagesize * ($scope.invoicesNeedApproval.currentPage - 1))
                }
                angular.forEach(claims, function (item) {
                    $scope.vendorInvoiceList.push(item);
                });
                $scope.newInvoicesToReview = $scope.vendorInvoiceList.length;
            }
            $scope.totalInvoices = success.data.data && success.data.data.totalCount != null ? success.data.data.totalCount : 0;
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
            $(".page-spinner-bar").addClass("hide");
        });
    }

    // Vendor Invoices
    $scope.VendorInvoiceListsort = function (keyname) {
        $scope.vendorInvoiceReverse = ($scope.vendorInvoiceSortKey == keyname) ? !$scope.vendorInvoiceReverse : false; //if true make it false and vice versa
        $scope.vendorInvoiceSortKey = keyname;   //set the sortKey to the param passed
        $scope.invoicesNeedApproval.currentPage = 1;
        getVendorInvoiceList();
    }

    // Search keyword
    $scope.searchByKeyword = searchByKeyword
    function searchByKeyword(searchQuery) {        
        $scope.vendorInvoiceSrcKey = angular.isDefined(searchQuery) && searchQuery != null && searchQuery.length > 0 ? searchQuery : '';
        $scope.invoicesNeedApproval.currentPage = 1;
        getVendorInvoiceList();
    };
    // go to invoice details
    $scope.InvoiceDetails = InvoiceDetails;
    function InvoiceDetails(invoice){
        if (invoice.invoiceNumber !== null && angular.isDefined(invoice.invoiceNumber)) {
            var ObjDetails = {
                "InvoiceNo": invoice.invoiceNumber,
                "ClaimNo": "",
                "InvoicesToBePaid": $scope.TotalInvoicesToBePaid,
                "isServiceRequestInvoice":invoice.isServiceRequestInvoice,
                "PageName": "SupervisorMyInvoices",
                "PagePath": "SupervisorMyInvoices"
            };
            sessionStorage.setItem("Details", JSON.stringify(ObjDetails))
            $location.url('VendorInvoiceDetails');
        }
    }

    $scope.setClaimCurrentPage = setClaimCurrentPage;
    function setClaimCurrentPage(pageNum, number){
        $scope.invoicesNeedApproval.lastRecord = $scope.pagesize * (pageNum);
        if($scope.invoicesNeedApproval.lastRecord >= $scope.totalInvoices){
            $scope.invoicesNeedApproval.lastRecord = $scope.totalInvoices;
        }
        $scope.invoicesNeedApproval.currentPage = pageNum;
        getVendorInvoiceList();
    }

  
});