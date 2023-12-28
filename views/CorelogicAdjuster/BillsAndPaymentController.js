angular.module('MetronicApp')
    .directive(
        'datePicker',
        function () {
            return {
                restrict: "A",
                require: "ngModel",
                link: function (scope, elm, attr, ctrl) {
                    // Format date on load
                    ctrl.$formatters.unshift(function (value) {
                        if (value && moment(value).isValid()) {
                            return moment(new Date(value)).format(
                                'MM/DD/YYYY');
                        }
                        return value;
                    })
                    // Disable Calendar
                    scope.$watch(attr.ngDisabled, function (newVal) {
                        if (newVal === true)
                            $(elm).datepicker("disable");
                        else
                            $(elm).datepicker("enable");
                    });
                    // Datepicker Settings
                    elm.datepicker({
                        autoSize: true,
                        changeYear: true,
                        changeMonth: true,
                        dateFormat: attr["dateformat"] || 'mm/dd/yy',
                        onSelect: function (valu) {
                            scope.$apply(function () {
                                ctrl.$setViewValue(valu);
                            });
                            elm.focus();
                        },

                        beforeShow: function () {
                            if (attr["minDate"] != null)
                                $(elm).datepicker('option', 'minDate',
                                    attr["minDate"]);

                            if (attr["maxDate"] != null)
                                $(elm).datepicker('option', 'maxDate',
                                    attr["maxDate"]);
                        },
                    });
                }
            }
        })

    .directive('valdateDate', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attr, mCtrl) {
                function myValidation(value) {
                    var enterDate = new Date(value);
                    var currDate = new Date();
                    if (enterDate.getTime() <= currDate.getTime()) {
                        mCtrl.$setValidity('dateValid', true);
                    } else {
                        mCtrl.$setValidity('dateValid', false);
                    }
                    return value;
                }
                mCtrl.$parsers.push(myValidation);
            }
        };
    })
angular.module('MetronicApp').controller('BillsAndPaymentController', function ($rootScope, $uibModal, $scope, $filter, settings, $http, $timeout, $location,
    $translate, $translatePartialLoader, BillsAndPaymentService,CommonUtils, CommonConstants) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });

    //set language
    $translatePartialLoader.addPart('BillsAndPayment');
    $translate.refresh();

    $scope.pagesize = $rootScope.settings.pagesize; // 20
    $scope.PageLength = 20;
    $scope.currentPage = 1;
    $scope.keyword = "";
    $scope.totalSize = 0;

    $scope.toShowingPage = 20;
    $scope.InvoicesSubmittedByClaim = {};
    $scope.InvoicesSubmittedByClaim.claims = [];

    $scope.InvoicesSubmittedByVendor = {};
    $scope.InvoicesSubmittedByVendor.vendors = [];

    $scope.InvoicesApprovedByClaim = {};
    $scope.InvoicesApprovedByClaim.claims =[];

    $scope.InvoicesApprovedByVendor = {};
    $scope.InvoicesApprovedByVendor.vendors = [];
    $scope.status=[];
    $scope.SearchResultShow = null;
    $scope.SearchResultHide = null;
    $scope.GlobalSearchTextResult = "";
    $scope.ErrorMessage = '';
    $scope.CompanyId = sessionStorage.getItem("CompanyId");
    $scope.InvoicesApprovedByCompany = [];
   // $scope.InvoicesSubmittedByClaim = [];
    $scope.pagination = { current: 1 };
    $scope.InvoicesSubmittedByCompany = [];
    $scope.TotalInvoicesToBePaid = 0;
    $scope.CurrentClaimTab = 'InvoicesSubmitted';
    $scope.claimColor = 'purple';
    $scope.vendorColor = 'blue';
    var currentTime = new Date()
   var year = currentTime.getFullYear();
$scope.startDate = "01/01/"+year;
var d = $filter("TodaysDate")();
$scope.endDate = d;
    // $scope.itemsPerPage = 1;
    // $scope.currentPage = 1;
    // $scope.totalSize = 1;
    $scope.filterReports = sessionStorage.getItem('filterReports') && sessionStorage.getItem('filterReports')!=null ? new Map(Object.entries(JSON.parse(sessionStorage.getItem('filterReports')))) : null;
    function init() {
         // Update existing report saved filters
         if($scope.filterReports && $scope.filterReports.get(CommonConstants.filters.INVOICE_BILLS_PAYMENTS)){
            let invoiceBillsPayments = new Map(Object.entries(JSON.parse($scope.filterReports.get(CommonConstants.filters.INVOICE_BILLS_PAYMENTS))));
            console.log("invoice bills and payments", invoiceBillsPayments);
            if(invoiceBillsPayments){  
                $scope.status=invoiceBillsPayments.get("invoicesStatus");                  
                $scope.startDate = invoiceBillsPayments.get("dateFrom");
                $scope.endDate = invoiceBillsPayments.get("dateTo");
                $scope.vendor = angular.isDefined(invoiceBillsPayments.get("vendor"))? invoiceBillsPayments.get("vendor"): [];
                $scope.claimNumber=invoiceBillsPayments.get("claimNumber");       
        }
    }
        $scope.SearchResultShow = false;
        $scope.SearchResultHide = true;
        $scope.SubmittedFlag = true;
        $scope.ApprovedFlag = true;

        GetStatusList();
        GetVendorsList();
        GetSubmittedInvoicesGroupedByClaim();
      // GetSubmittedInvoicesGroupedByVendor();
      // GetApprovedInvoicesGroupedByClaim();
      // GetApprovedInvoicesGroupedByVendor();

      $scope.role = sessionStorage.getItem('RoleList');
    }
    init();

    $scope.searchByFilter = function searchByFilter(){
        if($scope.claimColor=="purple")
        $scope.ViewSubmmittedByClaims();
        else
        $scope.ViewSubmmittedByVendor();
    }
    $scope.ViewSubmmittedByClaims = function () {
        $scope.SubmittedFlag = true;
        $scope.claimColor = 'purple';
        $scope.vendorColor = 'blue';
        $scope.toShowingPage = 20;
        $scope.currentPage =1;
        GetSubmittedInvoicesGroupedByClaim();
    };

    $scope.ViewSubmmittedByVendor = function () {
        $scope.SubmittedFlag = false;
        $scope.vendorColor = 'purple';
        $scope.claimColor = 'blue';
        $scope.currentPage =1;
        $scope.toShowingPage = 20;
        GetSubmittedInvoicesGroupedByVendor();
    };

    $scope.ViewApprovedByClaims = function () {
        $scope.ApprovedFlag = true;
        $scope.claimColor = 'purple';
        $scope.vendorColor = 'blue';
        $scope.currentPage =1;
        $scope.toShowingPage = 20;
        GetApprovedInvoicesGroupedByClaim();
    };

    $scope.ViewApprovedByVendor = function () {

        $scope.currentPage =1;
        $scope.toShowingPage = 20;
        $scope.ApprovedFlag = false;
        $scope.vendorColor = 'purple';
        $scope.claimColor = 'blue';
        GetApprovedInvoicesGroupedByVendor();
    };

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

    $scope.pageChanged = function pageChanged(pageNum,type) {

        $scope.currentPage = pageNum;

        // get policy reports
        if(type == 'INVOICE_SUBMITTED_BY_CLAIM')
        GetSubmittedInvoicesGroupedByClaim();
        else if(type == 'INVOICE_SUBMITTED_BY_VENDOR')
        GetSubmittedInvoicesGroupedByVendor();
        else if(type= 'INVOICE_APPROVED_BY_CLAIM')
        GetApprovedInvoicesGroupedByClaim();
        else
        GetApprovedInvoicesGroupedByVendor();

    }

    function GetSubmittedInvoicesGroupedByClaim() {
        $(".page-spinner-bar").removeClass("hide");  
        paramSubmitted =
         {
            "invoicesStatus": $scope.status,

             "isClaimWise": true,
             "page":$scope.currentPage,
             "limit":$scope.pagesize,
             "reportStartDate":$filter('DateFormatyyyyMMdd')($filter('DatabaseDateFormatMMddyyyy')($scope.startDate)),
             "reportEndDate":$filter('DateFormatyyyyMMdd')($filter('DatabaseDateFormatMMddyyyy')($scope.endDate)),
             "claimNumber":$scope.claimNumber,
             "vendor":$scope.vendor,

         };
   // Set report filters in session
   const invoiceBillsPayments = new Map();
   invoiceBillsPayments.set("invoicesStatus", $scope.status);
   invoiceBillsPayments.set("dateFrom", $scope.startDate);
   invoiceBillsPayments.set("dateTo", $scope.endDate);
   invoiceBillsPayments.set("vendor", $scope.vendor);  
   invoiceBillsPayments.set("claimNumber", $scope.claimNumber);
   CommonUtils.setReportFilters(CommonConstants.filters.INVOICE_BILLS_PAYMENTS, JSON.stringify(Object.fromEntries(invoiceBillsPayments)));
        
   var InvoicesSubmitted = BillsAndPaymentService.GetInvoiceListByClaim(paramSubmitted)
        InvoicesSubmitted.then(function (success) {
            // $scope.InvoicesSubmittedByClaim = success.data.data;
            // angular.forEach($scope.InvoicesSubmittedByClaim.claims, function (Claim) {
            //     Claim.totalAmount = 0;
            //     angular.forEach(Claim.invoices, function (invoice) {
            //         Claim.totalAmount += parseFloat(invoice.amount == null ? invoice.amount = 0 : invoice.amount);
            //     });

            // });
            $scope.totalSize =0;
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
            // if (currentListLength !=$scope.InvoicesSubmittedByClaim.claims.length) {
            //     $scope.InvoicesSubmittedByClaim.claims = new Array(currentListLength).fill(new Object());
            // }

            $scope.InvoicesSubmittedByClaim.claims = resultList;
            angular.forEach(resultList, function (item) {
                item.totalAmount = 0;
                angular.forEach(item.invoices, function (invoice) {
                    item.totalAmount += parseFloat(invoice.amount == null ? invoice.amount = 0 : invoice.amount);
                });
                //$scope.InvoicesSubmittedByClaim.claims.push(item);
            });


            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            $scope.ErrorMessage = error.data.errorMessage;

        });
    };

    function GetSubmittedInvoicesGroupedByVendor() {
        $(".page-spinner-bar").removeClass("hide");
        var paramVendorId =
               {

                   "isVendorWise": true,

                   "invoicesStatus": $scope.status,


             "page":$scope.currentPage,
             "limit":$scope.pagesize,
             "reportStartDate":$filter('DateFormatyyyyMMdd')($filter('DatabaseDateFormatMMddyyyy')($scope.startDate)),
             "reportEndDate":$filter('DateFormatyyyyMMdd')($filter('DatabaseDateFormatMMddyyyy')($scope.endDate)),
             "claimNumber":$scope.claimNumber,
             "vendor":$scope.vendor,
               };
        var InvoicesSubmittedGroupedByVendor = BillsAndPaymentService.GetInvoiceListByVendor(paramVendorId)
        InvoicesSubmittedGroupedByVendor.then(function (success) {
            // $scope.InvoicesSubmittedByVendor = success.data.data;
            // angular.forEach($scope.InvoicesSubmittedByVendor.vendors, function (vendor) {
            //     vendor.totalAmount = 0;
            //     angular.forEach(vendor.invoices, function (invoice) {
            //             vendor.totalAmount += parseFloat(invoice.amount == null ? invoice.amount = 0 : invoice.amount);
            //         });
            // });

            $scope.totalSize =0;
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
            if (currentListLength !=$scope.InvoicesSubmittedByVendor.vendors.length) {
                $scope.InvoicesSubmittedByVendor.vendors = new Array(currentListLength).fill(new Object());
            }
            angular.forEach(resultList, function (item) {
                item.totalAmount = 0;
                angular.forEach(item.invoices, function (invoice) {
                    item.totalAmount += parseFloat(invoice.amount == null ? invoice.amount = 0 : invoice.amount);
                });
                $scope.InvoicesSubmittedByVendor.vendors.push(item);
            });
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            $scope.ErrorMessage = error.data.errorMessage;

        });
    };

    function GetApprovedInvoicesGroupedByClaim() {
        $(".page-spinner-bar").removeClass("hide");
        //Get Approved Invoices with claim list
        paramApproved =
        {
            "invoicesStatus": ["APPROVED"],
            "isClaimWise": true,
            "page":$scope.currentPage,
            "limit":$scope.pagesize
        }
        var InvoicesApproved = BillsAndPaymentService.GetInvoiceListByClaim(paramApproved)
        InvoicesApproved.then(function (success) {
            // $scope.InvoicesApprovedByClaim = success.data.data;
            // $scope.TotalInvoicesToBePaid = 0;
            // angular.forEach($scope.InvoicesApprovedByClaim.claims, function (Claim) {
            //     Claim.totalAmount = 0;
            //     if ((angular.isDefined(Claim.invoices) && Claim.invoices != null))
            //     {

            //         $scope.TotalInvoicesToBePaid += Claim.invoices.length;
            //     }
            //     angular.forEach(Claim.invoices, function (invoice) {
            //         Claim.totalAmount += parseFloat(invoice.amount == null ? invoice.amount = 0 : invoice.amount);
            //     });
            // });

            $scope.totalSize =0;
            var resultList = success.data.data && success.data.data.claims ? success.data.data.claims : null;
            $scope.totalSize = (resultList && resultList[0]) ? resultList[0].totalSize : 0;

            if (resultList != null && resultList.length > 0) {
                if ($scope.currentPage == 1) {
                    $scope.toShowingPage = resultList.length;
                } else {
                    $scope.toShowingPage = resultList.length + ($scope.PageLength * ($scope.currentPage - 1))
                }
            }
            var currentListLength = ($scope.currentPage - 1) * $scope.PageLength;
            if (currentListLength !=$scope.InvoicesApprovedByClaim.claims.length) {
                $scope.InvoicesApprovedByClaim.claims = new Array(currentListLength).fill(new Object());
            }
            angular.forEach(resultList, function (item) {
                item.totalAmount = 0;
                angular.forEach(item.invoices, function (invoice) {
                    item.totalAmount += parseFloat(invoice.amount == null ? invoice.amount = 0 : invoice.amount);
                });
                $scope.InvoicesApprovedByClaim.claims.push(item);
            });



            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            $scope.ErrorMessage = error.data.errorMessage;
        });
    };


    function GetApprovedInvoicesGroupedByVendor() {
        $(".page-spinner-bar").removeClass("hide");
        var paramVendorId =
               {
                   "invoicesStatus": ["APPROVED"],
                   "isVendorWise": true,
                   "page":$scope.currentPage,
                   "limit":$scope.pagesize
               }
        var InvoicesSubmittedCompany = BillsAndPaymentService.GetInvoiceListByClaim(paramVendorId)
        InvoicesSubmittedCompany.then(function (success) {

            // $scope.InvoicesApprovedByVendor = success.data.data;
            // angular.forEach($scope.InvoicesApprovedByVendor.vendors, function (vendor) {
            //     vendor.totalAmount = 0;
            //     angular.forEach(vendor.invoices, function (invoice) {
            //             vendor.totalAmount += parseFloat(invoice.amount == null ? invoice.amount = 0 : invoice.amount);
            //     });
            // });


            $scope.totalSize =0;
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
            if (currentListLength !=$scope.InvoicesApprovedByVendor.vendors.length) {
                $scope.InvoicesApprovedByVendor.vendors = new Array(currentListLength).fill(new Object());
            }
            angular.forEach(resultList, function (item) {

                item.totalAmount = 0;
                angular.forEach(item.invoices, function (invoice) {
                    item.totalAmount += parseFloat(invoice.amount == null ? invoice.amount = 0 : invoice.amount);
                });
                $scope.InvoicesApprovedByVendor.vendors.push(item);
            });
            $(".page-spinner-bar").addClass("hide");

        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            $scope.ErrorMessage = error.data.errorMessage;
        });
    }
    $scope.GotoGlobalSearch = GotoGlobalSearch;
    function GotoGlobalSearch() {
        if ($scope.GlobalSearchText !== "") {
            $scope.InvoicesSearchResult = [];
            sessionStorage.setItem("GlobalSearchText", $scope.GlobalSearchText);
            param =
             {
                 "searchString": $scope.GlobalSearchText,
                 "vendorId": sessionStorage.getItem("UserId")
             };
            var InvoicesSubmitted = BillsAndPaymentService.GetSearchInvoiceList(param)
            InvoicesSubmitted.then(function (success) {
                $scope.SearchResultShow = true;
                $scope.SearchResultHide = false;
                $scope.GlobalSearchTextResult = $scope.GlobalSearchText;
                $scope.InvoicesSearchResult = success.data.data;
                angular.forEach($scope.InvoicesSearchResult, function (value, key) {
                    value.Services = "";
                    angular.forEach(value.serviceRequested, function (value1, key1) {
                        value.Services += value1.name + ", ";
                    });


                });
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
            });
        }
    }

    $scope.SortSumbitClaim = function (key) {
        $scope.SubmitsortsorClaimtKey = key;
        $scope.SubmitsortClaimreverse = !$scope.SubmitsortClaimreverse;
    }
    $scope.SortSumbitCompany = function (key) {
        $scope.SubmitsortCompanyKey = key;
        $scope.SubmitsortCompanyreverse = !$scope.SubmitsortCompanyreverse;
    };

    $scope.SortApprovalClaim = function (key) {
        $scope.ApprovalSortClaimKey = key;
        $scope.ApprovalClaimsortreverse = !$scope.ApprovalClaimsortreverse;
    }
    $scope.ApprovalSortVendor = function (key) {
        $scope.ApprovalsortVendorKey = key;
        $scope.ApprovalsortVendorreverse = !$scope.ApprovalsortVendorreverse;
    }
    $scope.GotoInvoiceDetails = function (invoice) {
        if (invoice.invoiceNumber !== null && angular.isDefined(invoice.invoiceNumber)) {
            var ObjDetails = {
                "InvoiceNo": invoice.invoiceNumber,
                "ClaimNo": "",
                "InvoicesToBePaid": $scope.TotalInvoicesToBePaid,
                "isServiceRequestInvoice":invoice.isServiceRequestInvoice,
                "PageName": "BillsAndPayments",
                "PagePath": "BillsAndPayments"
            };
            sessionStorage.setItem("Details", JSON.stringify(ObjDetails))
            $location.url('VendorInvoiceDetails');
        }
    };

    $scope.CancelSearch = CancelSearch;
    function CancelSearch() {
        $scope.GlobalSearchTextResult = "";
        $scope.InvoicesSearchResult = [];
        $scope.SearchResultShow = false;
        $scope.SearchResultHide = true;
    }
    //Sorting
    $scope.Submitsort = function (keyname) {
        $scope.SubmitsortsortKey = keyname;   //set the sortKey to the param passed
        $scope.Submitsortreverse = !$scope.Submitsortreverse; //if true make it false and vice versa
    }
    $scope.Allsort = function (keyname) {
        $scope.AllsortKey = keyname;   //set the sortKey to the param passed
        $scope.Allsortreverse = !$scope.Allsortreverse; //if true make it false and vice versa
    }
    $scope.Searchsort = function (keyname) {
        $scope.SearchsortKey = keyname;   //set the sortKey to the param passed
        $scope.Searchsortreverse = !$scope.Searchsortreverse; //if true make it false and vice versa
    }

    $scope.goToDashboard = goToDashboard;
    function goToDashboard() {
        $location.url(sessionStorage.getItem('HomeScreen'));
    };

    $scope.DummyInvoiceDetails = function () {

            var ObjDetails = {
                "InvoiceNo": 123,
                "ClaimNo": "123",
                "InvoicesToBePaid": 1,
                "PageName": "BillsAndPayments"
            };

            sessionStorage.setItem("Details", JSON.stringify(ObjDetails))
            $location.url('VendorInvoiceDetails');
    };
    $scope.changeTab = changeTab;
    function changeTab(param){
        $scope.CurrentClaimTab = param;
        // ViewSubmmittedByClaims
        if(param == 'InvoicesSubmitted')
            $scope.ViewSubmmittedByClaims();
        else
        $scope.ViewApprovedByClaims();
        // $scope.claimColor = 'purple';
        // $scope.vendorColor = 'blue';
    }
    $scope.vendorList =[];
    $scope.GetVendorsList = GetVendorsList;
    function GetVendorsList() {
        $(".page-spinner-bar").removeClass("hide");
        var getVendorList = BillsAndPaymentService.getVendorList();
        getVendorList.then(function (success) {
            $scope.vendorList = success.data && success.data.data ? success.data.data.companyVendors : null;
            // $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            toastr.remove();
            toastr.error((error.data !== null) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage(), "Error");
        });
    };

    $scope.adjusterList =[];
    $scope.GetAdjusterList = GetAdjusterList();
    function GetAdjusterList() {

        var param = {
            "companyId": $scope.CompanyId
        };

        var getpromise = BillsAndPaymentService.getAdjusterList(param);
        getpromise.then(function (success) {
            $scope.AdjusterList = success.data.data;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        });
    };

   
    $scope.GetStatusList = GetStatusList;
    function GetStatusList() {
        $(".page-spinner-bar").removeClass("hide");
        var getStatusList = BillsAndPaymentService.getStatusList();
        getStatusList.then(function (success) {
            $scope.statusList = success.data.data;

            // $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            toastr.remove();
            toastr.error((error.data !== null) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage(), "Error");
        });
    };

    $scope.clearFilter = function (){
        $scope.claimNumber = "";
        // $scope.ownerRetained = "0";
        var currentTime = new Date()
        var year = currentTime.getFullYear();
        $scope.startDate = "01/01/"+year;
        var d = $filter("TodaysDate")();
        $scope.endDate = d;
        $scope.status = [];
        $scope.vendor =[];
        $("select").val("").select2();
        GetSubmittedInvoicesGroupedByClaim();
    }
});
