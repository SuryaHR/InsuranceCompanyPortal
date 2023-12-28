angular.module('MetronicApp').controller('AccountPayableController', function ($rootScope, $uibModal, $scope, $filter, settings, $http, $timeout, $location,
    $translate, $translatePartialLoader, AuthHeaderService, AccountPayableService,CommonUtils, CommonConstants) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });

    //set language
    $translatePartialLoader.addPart('Payable');
    $translate.refresh();
    $scope.PageSize = $rootScope.settings.pagesize;


    $scope.pagesize = $rootScope.settings.pagesize; // 20
    $scope.PageLength = 20;
    $scope.currentPage = 1;
    $scope.keyword = "";
    $scope.totalSize = 0;
    var currentTime = new Date()
    var year = currentTime.getFullYear();
    $scope.startDate = "01/01/" + year;
    var d = $filter("TodaysDate")();
    $scope.endDate = d;
    $scope.status = [];
    $scope.toShowingPage = 20;

    $scope.AccountPayable = {};
    $scope.AccountPayable.claims = [];
    $scope.AccountPayableByVendor = {};
    $scope.AccountPayableByVendor.vendors = [];

    $scope.CurrentClaimTab = "ByClaim";
    $scope.claimColor = 'purple';
    $scope.vendorColor = 'blue';
    $scope.filterReports = sessionStorage.getItem('filterReports') && sessionStorage.getItem('filterReports')!=null ? new Map(Object.entries(JSON.parse(sessionStorage.getItem('filterReports')))) : null;

    function init() {
        // Update existing report saved filters
        if($scope.filterReports && $scope.filterReports.get(CommonConstants.filters.INVOICE_PAYABLE)){
            let invoicePayable = new Map(Object.entries(JSON.parse($scope.filterReports.get(CommonConstants.filters.INVOICE_PAYABLE))));
            console.log("invoice payable", invoicePayable);
            if(invoicePayable){  
                $scope.status=invoicePayable.get("invoicesStatus");                  
                $scope.startDate = invoicePayable.get("dateFrom");
                $scope.endDate = invoicePayable.get("dateTo");
                $scope.vendor = angular.isDefined(invoicePayable.get("vendor"))? invoicePayable.get("vendor"): [];
                $scope.claimNumber=invoicePayable.get("claimNumber");       
        }
    }
        //$scope.AccountPayable = [];
        // $scope.AccountPayableByVendor = [];
        getAccountPayableByClaim();
        GetVendorsList();
        GetStatusList();
    };
    init();

    $scope.goToDashboard = goToDashboard;
    function goToDashboard() {
        $location.url(sessionStorage.getItem('HomeScreen'));
    }

    function getAccountPayableByClaim() {
        $(".page-spinner-bar").removeClass("hide");
        $scope.claimColor = 'purple';
        $scope.vendorColor = 'blue';
        var param = {


            "payableStatus": $scope.status,

            "isClaimWise": true,
            "page": $scope.currentPage,
            "limit": $scope.pagesize,
            "reportStartDate": $filter('DateFormatyyyyMMdd')($filter('DatabaseDateFormatMMddyyyy')($scope.startDate)),
            "reportEndDate": $filter('DateFormatyyyyMMdd')($filter('DatabaseDateFormatMMddyyyy')($scope.endDate)),
            "claimNumber": $scope.claimNumber,
            "vendor": $scope.vendor,
        };
         // Set report filters in session
           const invoicePayable = new Map();
           invoicePayable.set("invoicesStatus", $scope.status);
           invoicePayable.set("dateFrom", $scope.startDate);
           invoicePayable.set("dateTo", $scope.endDate);
           invoicePayable.set("vendor", $scope.vendor);  
           invoicePayable.set("claimNumber", $scope.claimNumber);
           CommonUtils.setReportFilters(CommonConstants.filters.INVOICE_PAYABLE, JSON.stringify(Object.fromEntries(invoicePayable)));
       
   var getInvoices = AccountPayableService.getInvoiceList(param)
        getInvoices.then(function (success) {
            // $scope.AccountPayable = success.data.data;
            // angular.forEach($scope.AccountPayable.claims, function (Claim) {
            //     Claim.totalAmount = 0;
            //     angular.forEach(Claim.accountPayables, function (invoice) {
            //         Claim.totalAmount += parseFloat(invoice.total == null ? invoice.total = 0 : invoice.total);
            //     });
            // });

            $scope.totalSize = 0;
            var resultList = success.data.data && success.data.data.claims ? success.data.data.claims : null;
            $scope.totalSize = (resultList && resultList[0]) ? resultList[0].totalSize : 0;

            if (resultList != null && resultList.length > 0) {
                if ($scope.currentPage == 1) {
                    $scope.toShowingPage = resultList.length;
                } else {
                    $scope.toShowingPage = resultList.length + ($scope.PageLength * ($scope.currentPage - 1))
                }
            }
            // var currentListLength = ($scope.currentPage - 1) * $scope.PageLength;
            // if (currentListLength != $scope.AccountPayable.claims.length) {
            //     $scope.AccountPayable.claims = new Array(currentListLength).fill(new Object());
            // }

            $scope.AccountPayable.claims = resultList;
            angular.forEach(resultList, function (item) {
                item.totalAmount = 0;
                angular.forEach(item.accountPayables, function (invoice) {
                    item.totalAmount += parseFloat(invoice.total == null ? invoice.total = 0 : invoice.total);
                });
                //$scope.AccountPayable.claims.push(item);
            });
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.error((angular.isDefined(error.data) && angular.isDefined(error.data.errorMessage) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage()), "Error")
        });
    };

    function getAccountPayableByVendor() {
        $(".page-spinner-bar").removeClass("hide");
        $scope.claimColor = 'blue';
        $scope.vendorColor = 'purple';
        var param = {
            "isVendorWise": true,
            "payableStatus": $scope.status,
            "page": $scope.currentPage,
            "limit": $scope.pagesize,
            "reportStartDate": $filter('DateFormatyyyyMMdd')($filter('DatabaseDateFormatMMddyyyy')($scope.startDate)),
            "reportEndDate": $filter('DateFormatyyyyMMdd')($filter('DatabaseDateFormatMMddyyyy')($scope.endDate)),
            "claimNumber": $scope.claimNumber,
            "vendor": $scope.vendor,
        };
        var getInvoices = AccountPayableService.getInvoiceList(param)
        getInvoices.then(function (success) {
            // $scope.AccountPayableByVendor = success.data.data;
            // angular.forEach($scope.AccountPayableByVendor.vendors, function (Claim) {
            //     Claim.totalAmount = 0;
            //     if (angular.isDefined(Claim.accountPayables) && Claim.accountPayables.length > 0) {
            //         angular.forEach(Claim.accountPayables, function (invoice) {
            //             Claim.totalAmount += parseFloat(invoice.total == null ? invoice.total = 0 : invoice.total);
            //         });
            //     }
            // });
            $scope.totalSize = 0;
            var resultList = success.data.data && success.data.data.vendors ? success.data.data.vendors : null;
            $scope.totalSize = (resultList && resultList[0]) ? resultList[0].totalSize : 0;

            if (resultList != null && resultList.length > 0) {
                if ($scope.currentPage == 1) {
                    $scope.toShowingPage = resultList.length;
                } else {
                    $scope.toShowingPage = resultList.length + ($scope.PageLength * ($scope.currentPage - 1))
                }
            }
            var currentListLength = ($scope.currentPage - 1) * $scope.PageLength;
            if (currentListLength != $scope.AccountPayableByVendor.vendors.length) {
                $scope.AccountPayableByVendor.vendors = new Array(currentListLength).fill(new Object());
            }
            angular.forEach(resultList, function (item) {
                item.totalAmount = 0;
                angular.forEach(item.accountPayables, function (invoice) {
                    item.totalAmount += parseFloat(invoice.total == null ? invoice.total = 0 : invoice.total);
                });
                $scope.AccountPayableByVendor.vendors.push(item);
            });
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.error((angular.isDefined(error.data) && angular.isDefined(error.data.errorMessage) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage()), "Error")
        });
    };

    $scope.GotoInvoiceDetails = GotoInvoiceDetails;
    function GotoInvoiceDetails(item) {
        if (item.invoiceNumber !== null && angular.isDefined(item.invoiceNumber)) {
            var ObjDetails = {
                "InvoiceNo": item.invoiceNumber,
                "isServiceRequestInvoice": item.isServiceRequestInvoice,
                "PageName": "Payable",
                "PagePath": "Payable"
            };
            sessionStorage.setItem("Details", JSON.stringify(ObjDetails))
            $location.url('PayableDetails');
        }
    };

    $scope.ChangeView = ChangeView;
    function ChangeView(type) {
        if (type == 'claim') {
            $scope.claimColor = 'purple';
            $scope.vendorColor = 'blue';
            $scope.CurrentClaimTab = "ByClaim"
            getAccountPayableByClaim();
        }
        else {
            $scope.claimColor = 'blue';
            $scope.vendorColor = 'purple';
            $scope.CurrentClaimTab = 'ByVendor';
            getAccountPayableByVendor();
        }

    }

    $scope.expand = false;
    $scope.claimExpand = [];

    $scope.expanddiv = expanddiv;
    function expanddiv(index) {
        if ($scope.claimExpand[index] && angular.isDefined($scope.claimExpand[index].expand))
            $scope.claimExpand[index].expand = !$scope.claimExpand[index].expand;
        else {
            $scope.claimExpand[index] = {};
            $scope.claimExpand[index].expand = true;
            $scope.expand = !$scope.expand;
        }
    }

    $scope.pageChanged = function pageChanged(pageNum, type) {

        $scope.currentPage = pageNum;

        // get policy reports
        if (type == 'PAYABLE_SUBMITTED_BY_CLAIM')
            getAccountPayableByClaim();
        else if (type == 'PAYABLE_SUBMITTED_BY_VENDOR')
            getAccountPayableByVendor();


    }
    $scope.vendorList = [];
    $scope.GetVendorsList = GetVendorsList;
    function GetVendorsList() {
        $(".page-spinner-bar").removeClass("hide");
        var getVendorList = AccountPayableService.getVendorList();
        getVendorList.then(function (success) {
            $scope.vendorList = success.data.data.companyVendors;
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            toastr.remove();
            toastr.error((error.data !== null) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage(), "Error");
        });
    };

    $scope.GetStatusList = GetStatusList;
    function GetStatusList() {
        $(".page-spinner-bar").removeClass("hide");
        var getStatusList = AccountPayableService.getStatusList();
        getStatusList.then(function (success) {
            $scope.statusList = success.data.data;

            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            toastr.remove();
            toastr.error((error.data !== null) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage(), "Error");
        });
    };

    $scope.searchByFilter = function searchByFilter() {
        if ($scope.claimColor == "purple")
            getAccountPayableByClaim();
        else
            getAccountPayableByVendor();
    }

    $scope.clearFilter = function () {
        $scope.claimNumber = "";

        // $scope.ownerRetained = "0";
        var currentTime = new Date()
        var year = currentTime.getFullYear();
        $scope.startDate = "01/01/" + year;
        var d = $filter("TodaysDate")();
        $scope.endDate = d;
        $scope.status = [];
        $scope.vendor = [];
        $("select").val("").select2();
        getAccountPayableByClaim();
    }
})