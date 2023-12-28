angular.module('MetronicApp').controller('ReportController', function ($rootScope, $scope, $location, $translate, $translatePartialLoader, ReportService, AuthHeaderService,ReceiptMapperService, StatusConstants) {
    //set language
    $translatePartialLoader.addPart('Report');
    $translate.refresh();
    $scope.pagesize = $rootScope.settings.pagesize;
    //Serch models
    $scope.detailedInventory = [];
    $scope.PaymentSummary = [];
    $scope.ItemsReplacedOrPaid = [];
    $scope.ItemsAboveLimit = [];
    $scope.TotalAmountPaid = 0;
    $scope.TotalReplacementCost = 0;
    $scope.TotalDepreciationAmount = 0;
    $scope.TotalActualCashValue = 0;
    $scope.totalHoldOverValue = 0;
    $scope.totalSettlement = 0;
    $scope.Category = [];
    $scope.ErrorMesage = "";
    $scope.limit = 50;
    $scope.moreShown = false;
    $scope.CurrentTab = 'detailedInventory';

    var currentpage = 1;
    const limit = 20;
    $scope.searchDetailedInventory = null;
    $scope.reverseReport = false;
    $scope.isItemsLoading = false;
    $scope.totalItems = 0;
    $scope.detailedInventorySummary = {};
    var totalItemPages = 0;
    $scope.getNumberOfRec = 20;

     //Get Item / claim status
     $scope.constants = {
        itemStatus: StatusConstants.ItemStatus,
    };
    function init() {
        $(".page-spinner-bar").removeClass("hide");
        $scope.CommomObj = {
            ClaimNo: sessionStorage.getItem("ClaimNo")
        };
        getDetailedInventory();
        if ($scope.CommomObj.ClaimNo !== null && angular.isDefined($scope.CommomObj.ClaimNo)) {
            var param = {
                "claimNumber": $scope.CommomObj.ClaimNo
            };
            var GetPaymentSummary = ReportService.GetPaymentSummary(param);
            GetPaymentSummary.then(function (success) {
                $scope.PaymentSummary = success.data.data;
                GetTotalPaidAmount();
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });

            var GetPaidOrReplacedItems = ReportService.GetItemsReplacedOrPaid(param);
            GetPaidOrReplacedItems.then(function (success) {
                $scope.ItemsReplacedOrPaid = success.data.data;
            }, function (error) {
                //toastr.remove();
                //toastr.error(error.data.errorMessage, "Error");
            });

            var GetAboveLimitItems = ReportService.GetAboveLimitItems(param);
            GetAboveLimitItems.then(function (success) {
                $scope.ItemsAboveLimit = success.data.data;
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                //toastr.remove();
                //toastr.error(error.data.errorMessage, "Error");
                $(".page-spinner-bar").addClass("hide")
            });
        }
        else {
            Back();
        }
        GetAllSubCategories();
    }
    init();

    // $scope.showPaymentDetails = showPaymentDetails
    // function showPaymentDetails (paymentData) {
    //     sessionStorage.setItem("paymentId", paymentData.paymentID);
    //     getPaymentInfo()
    // }

    $scope.switchTab = function (tabName) {
        $scope.CurrentTab = tabName;
    }

    $scope.getPaymentInfo = function(paymentData){
        var  pyamentPromice =  ReportService.getPaymentInfo(paymentData.paymentID);
        //This var will be used in below function
        $scope.paymentInfoId = paymentData.paymentID;
        pyamentPromice.then(function(success){
        $scope.paymentInfo = success.data.data
        $scope.totalCashExposure = 0
        $scope.totalHoldoverPaid = 0
            $scope.paymentInfo.items.forEach(item => {
                $scope.totalCashExposure += item.holdoverPaid
                $scope.totalHoldoverPaid += item.cashExposure
            });
        });
     }

    $scope.downloadPaymentInfo = function(){
        $(".page-spinner-bar").removeClass("hide");
        var  pyamentPDFPromice =  ReportService.downloadPaymentInfoPDF($scope.paymentInfoId);
        pyamentPDFPromice.then(function success(response) {
            var headers = response.headers();
            var filename = headers['x-filename'];
            var contentType = headers['content-type'];
            var linkElement = document.createElement('a');
            try {
                var blob = new Blob([response.data], { type: contentType });
                var url = window.URL.createObjectURL(blob);
                linkElement.setAttribute('href', url);
                linkElement.setAttribute("download", filename);
                var clickEvent = new MouseEvent("click", {
                    "view": window,
                    "bubbles": true,
                    "cancelable": false
                });
                linkElement.dispatchEvent(clickEvent);
                $(".page-spinner-bar").addClass("hide");
            } catch (ex) {
                toastr.remove();
                toastr.success(ex);
            }
        }, function (error) {
            var decodedString = String.fromCharCode.apply(null, new Uint8Array(error.data));
            var obj = JSON.parse(decodedString);
            toastr.remove();
            toastr.error(obj['errorMessage']);
            $(".page-spinner-bar").addClass("hide");
        });

    }
  

    function getDetailedInventory() {
        var param = {
            "claimNumber": $scope.CommomObj.ClaimNo,
            "page": currentpage,
            "limit": limit,
            "sortBy": $scope.sortReportKey ? $scope.sortReportKey : '',
            "orderBy": $scope.reverseReport ? "desc" : "asc",
            "q": $scope.searchDetailedInventory
        };
        var getDetails = ReportService.GetDetails(param);
        getDetails.then(function (success) {
            if (success.data) {
                var res = success.data.data;
                $scope.minimumThreshold = res.minimumThreshold;
                angular.forEach(res.claimItemsDetails, function (item) {
                    $scope.detailedInventory.push(item);
                });
                if (res.inventorySummary) {
                    $scope.totalItems = res.inventorySummary.totalClaimedItems;
                    totalItemPages = Math.ceil($scope.totalItems / limit);
                    getAllTotal(res.inventorySummary);
                }
            }
            $scope.isItemsLoading = false;
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }

    //GoBack
    $scope.Back = Back;
    function Back() {
        sessionStorage.setItem("ReportClaimNo", null);
        window.history.back();
    };
    //Go to Home
    $scope.GoToHome = function () {
        $location.url(sessionStorage.getItem('HomeScreen'));
    };

    function GetTotalPaidAmount() {
        $scope.TotalAmountPaid = 0;
        angular.forEach($scope.PaymentSummary.paymentSummaryDetails, function (item) {
            $scope.TotalAmountPaid += item.amountPaid;
        });

    };

    function getAllTotal(inventorySummary) {
        $scope.detailedInventorySummary = {
            ...inventorySummary
        }
    }

    // Get PDF / Excel of Detailed Inventory
    $scope.exportDetailedInventory = function (type) {
        $(".page-spinner-bar").removeClass("hide");
        var claimDetails = {
            "claimNumber": $scope.CommomObj.ClaimNo,
            "format": type
        };
        var fileDetails = ReportService.exportDetailedInventory(claimDetails);
        fileDetails.then(function (response) {
            var headers = response.headers();
            var filename = headers['x-filename'];
            var contentType = headers['content-type'];
            var linkElement = document.createElement('a');
            try {
                var blob = new Blob([response.data], { type: contentType });
                var url = window.URL.createObjectURL(blob);
                linkElement.setAttribute('href', url);
                linkElement.setAttribute("download", filename);
                var clickEvent = new MouseEvent("click", {
                    "view": window,
                    "bubbles": true,
                    "cancelable": false
                });
                linkElement.dispatchEvent(clickEvent);
                $(".page-spinner-bar").addClass("hide");
            } catch (ex) {
                console.exception(ex);
                $(".page-spinner-bar").addClass("hide");
            }
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            $(".page-spinner-bar").addClass("hide");
        });
    }
    // Get Category pdf
    $scope.ExportCategoryDetails = ExportCategoryDetails;
    function ExportCategoryDetails() {
        var ClaimDetails = {
            "claimNumber": $scope.CommomObj.ClaimNo
        };
        var pdfDetails = ReportService.GetRepotCategoryPDF(ClaimDetails);
        pdfDetails.then(function (success) {
            if (success.data.data !== null && angular.isDefined(success.data.data)) {
                if (success.data.data.pathUrl !== null && angular.isDefined(success.data.data.pathUrl)) {
                    var PdfUrl = AuthHeaderService.getExportUrl() + success.data.data.pathUrl;
                    var downloadLink = angular.element('<a></a>');
                    downloadLink.attr('href', PdfUrl);
                    downloadLink.attr('target', '_self');
                    downloadLink.attr('download', success.data.data.name);
                    downloadLink[0].click();
                }
            }
        }, function (error) {
            toastr.remove()
            if (angular.isDefined(error.data) && error.data !== null)
                toastr.error(error.data.errorMessage, "Error");
            else
                toastr.error("Failed to export the details. Please try again..", "Error");
        });
    }
    // Get PDF replacement
    $scope.ExportReplacementDetails = ExportReplacementDetails;
    function ExportReplacementDetails() {
        var ClaimDetails = {
            "claimNumber": $scope.CommomObj.ClaimNo
        };
        var pdfDetails = ReportService.GetRepotReplacementPDF(ClaimDetails);
        pdfDetails.then(function (success) {
            if (success.data.data !== null && angular.isDefined(success.data.data)) {
                if (success.data.data.pathUrl !== null && angular.isDefined(success.data.data.pathUrl)) {
                    var PdfUrl = AuthHeaderService.getExportUrl() + success.data.data.pathUrl;
                    var downloadLink = angular.element('<a></a>');
                    downloadLink.attr('href', PdfUrl);
                    downloadLink.attr('target', '_self');
                    downloadLink.attr('download', success.data.data.name);
                    downloadLink[0].click();
                }
            }
        }, function (error) {
            toastr.remove()
            if (angular.isDefined(error.data) && error.data !== null)
                toastr.error(error.data.errorMessage, "Error");
            else
                toastr.error("Failed to export the details. Please try again..", "Error");
        });
    }
    // Get PDF of payment
    $scope.ExportPaymentDetails = ExportPaymentDetails;
    function ExportPaymentDetails() {
        var ClaimDetails = {
            "claimNumber": $scope.CommomObj.ClaimNo
        };
        var pdfDetails = ReportService.GetRepotPaymentPDF(ClaimDetails);
        pdfDetails.then(function (success) {
            if (success.data.data !== null && angular.isDefined(success.data.data)) {
                if (success.data.data.pathUrl !== null && angular.isDefined(success.data.data.pathUrl)) {
                    var PdfUrl = AuthHeaderService.getExportUrl() + success.data.data.pathUrl;
                    var downloadLink = angular.element('<a></a>');
                    downloadLink.attr('href', PdfUrl);
                    downloadLink.attr('target', '_self');
                    downloadLink.attr('download', success.data.data.name);
                    downloadLink[0].click();
                }
            }
        }, function (error) {
            toastr.remove()
            if (angular.isDefined(error.data) && error.data !== null)
                toastr.error(error.data.errorMessage, "Error");
            else
                toastr.error("Failed to export the details. Please try again..", "Error");
        });
    }

    //Sorting Detailed Inventory
    $scope.sortReport = function (keyname) {
        $scope.reverseReport = ($scope.sortReportKey === keyname) ? !$scope.reverseReport : false; //if true make it false and vice versa
        $scope.sortReportKey = keyname; //set the sortKey to the param passed
        $scope.detailedInventory = [];
        currentpage = 1;
        getDetailedInventory();
    };

    //Sort Payment Summary
    $scope.sortPaymentSummary = function (keyname) {
        $scope.sortPaymenySummaryKey = keyname;   //set the sortKey to the param passed
        $scope.reversePaymentSummary = !$scope.reversePaymentSummary; //if true make it false and vice versa
    };

    //Sort Above Limit
    $scope.sortAboveLimit = function (keyname) {
        $scope.sortAboveLimitKey = keyname;   //set the sortKey to the param passed
        $scope.reverseAboveLimit = !$scope.reverseAboveLimit; //if true make it false and vice versa
    };

    // Round of 2 Decimal point
    function roundOf2Decimal(number) {
        if (number)
            return Math.round(number * 1e2) / 1e2;
        else
            return 0;
    }

    $scope.nextItems = function () {
        if (currentpage < totalItemPages) {
            $scope.isItemsLoading = true;
            currentpage += 1;
            getDetailedInventory();
            setInterval(3000);
        }
    }

    $scope.exportSummaryToPDF = exportSummaryToPDF;
    function exportSummaryToPDF() {
        window.setTimeout(()=>{
        toastr.remove();
        toastr.success("The generation of the detailed inventory PDF is <b><i> In Progress.</i></b>")},2000);
        var param = {
            "claimNumber": $scope.CommonObj.ClaimNumber,
            "reqForReceiptMapper": false,
            "reqForPdfExport" : true,
            "reqForPayoutSummary" : false,
            "reqForRoomWiseItems" : true,
            "reqForCoverageSummary" : true,
            "showThirdPartyInsDetails": sessionStorage.getItem("ThirdPartyAdjusting")
        };

        var reports = ReceiptMapperService.GetSettlementSummaryPDF(param);
        reports.then(function success(response) {
            var headers = response.headers();
            // var filename = headers['x-filename'];
            var contentType = headers['content-type'];
            var linkElement = document.createElement('a');
            try {
                var blob = new Blob([response.data], { type: contentType });
                var url = window.URL.createObjectURL(blob);
                linkElement.setAttribute('href', url);
                linkElement.setAttribute("download", "DetailedInventory-"+$scope.CommonObj.ClaimNumber);
                var clickEvent = new MouseEvent("click", {
                    "view": window,
                    "bubbles": true,
                    "cancelable": false
                });
                linkElement.dispatchEvent(clickEvent);
                $(".page-spinner-bar").addClass("hide");
            } catch (ex) {
                toastr.remove();
                toastr.success(ex);
            }
        }, function (error) {
            var decodedString = String.fromCharCode.apply(null, new Uint8Array(error.data));
            var obj = JSON.parse(decodedString);
            toastr.remove();
            toastr.error(obj['errorMessage']);
            $(".page-spinner-bar").addClass("hide");
        });
    }

    // Search keyword
    $scope.searchInventory = function (searchQuery) {
        $scope.searchDetailedInventory = searchQuery && searchQuery.length > 0 ? searchQuery : null;
        currentpage = 1;
        $scope.detailedInventory = [];
        getDetailedInventory();
    }

    //email content summary to policyholder
    $scope.emailContentSumamry = function () {
        $(".page-spinner-bar").removeClass("hide");
        var claimDetails = {
            "claimNumber": $scope.CommomObj.ClaimNo,
        };
        var fileDetails = ReportService.sendContentSummaryMailToPolicyholder(claimDetails);
        fileDetails.then(function (success) {
          toastr.remove();
          toastr.success("Content summary sent successfully");
          $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }

    $scope.GetAllSubCategories = GetAllSubCategories;
    function GetAllSubCategories(){
        var subCategories = ReportService.getAllSubCategories();
        subCategories.then(function (success) {
            $scope.subCategories = success.data.data;
          }, function (error) {
              toastr.remove();
              toastr.error(error.data.errorMessage, "Error");
          });
    }

    $scope.GetDepreciationRate = GetDepreciationRate;
    function GetDepreciationRate(item){
        if(item.replacementItemDescription!=null){
        var depreciationRate = "0.00%";
        var subCategory = $scope.subCategories.filter((sub)=>sub.name == item.subcategoryDetails?.name)[0];
        if(!!subCategory)
        {
            if (subCategory.depreciation) {
                if(subCategory.specialCase && subCategory.name!="Ring"){
                    depreciationRate = subCategory.firstYearDepreciation + "%, "+subCategory.correspondYearDepreciation+"% year on" ;
                }else{
                    depreciationRate = subCategory.annualDepreciation+"%";
                }

                depreciationRate += ", "+ subCategory.maxDepreciation+ "% max";                

            } else if(subCategory.flatDepreciation){
                depreciationRate = subCategory.flatDepreciation+"% flat";
            } else{
                depreciationRate = subCategory.annualDepreciation+"%";

                if (!(subCategory.specialCase && subCategory.depreciation ==false)) {
                    depreciationRate += ", "+ subCategory.maxDepreciation+ "% max";
                }
            }

            // if(subCategory.specialCase && subCategory.name!="Ring")
            // {
                
            //     if(subCategory.flatDepreciation){
            //         depreciationRate = subCategory.flatDepreciation+"% flat";
            //     }else{
            //         depreciationRate = subCategory.firstYearDepreciation + "%, "+subCategory.correspondYearDepreciation+"% year on" ;
            //     }

            //     if (subCategory.depreciation) {
            //        depreciationRate += ", "+ subCategory.maxDepreciation+ "% max"
            //     }
            // }
            // else
            // {
            //     depreciationRate = subCategory.annualDepreciation+"%";

            //     if (subCategory.depreciation) {
            //         depreciationRate += ", "+ subCategory.maxDepreciation+ "% max";
            //     }
            // }
        }
        return depreciationRate;
     }
     return "0.00%";
    }

    $scope.ExportPayoutSummary = ExportPayoutSummary;
    function ExportPayoutSummary()
    {
        window.setTimeout(()=>{
            toastr.remove();
            toastr.success("The generation of the detailed inventory PDF is <b><i> In Progress.</i></b>")},2000);
        var param = {
            "claimNumber": $scope.CommonObj.ClaimNumber,
            "reqForReceiptMapper": false,
            "reqForPdfExport" : true,
            "reqForPayoutSummary" : true,
            "reqForRoomWiseItems" : false,
            "reqForCoverageSummary" : false
        };

        var reports = ReceiptMapperService.GetSettlementSummaryPDF(param);
        reports.then(function success(response) {
            var headers = response.headers();
            // var filename = headers['x-filename'];
            var contentType = headers['content-type'];
            var linkElement = document.createElement('a');
            try {
                var blob = new Blob([response.data], { type: contentType });
                var url = window.URL.createObjectURL(blob);
                linkElement.setAttribute('href', url);
                linkElement.setAttribute("download", "PayoutSummary-"+$scope.CommonObj.ClaimNumber);
                var clickEvent = new MouseEvent("click", {
                    "view": window,
                    "bubbles": true,
                    "cancelable": false
                });
                linkElement.dispatchEvent(clickEvent);
                $(".page-spinner-bar").addClass("hide");
            } catch (ex) {
                toastr.remove();
                toastr.success(ex);
            }
        }, function (error) {
            var decodedString = String.fromCharCode.apply(null, new Uint8Array(error.data));
            var obj = JSON.parse(decodedString);
            toastr.remove();
            toastr.error(obj['errorMessage']);
            $(".page-spinner-bar").addClass("hide");
        });
    }

    $scope.nextRecords = function () {
        $scope.getNumberOfRec += 20;
    }

}).directive("scroll", function ($window) {
    return function (scope, element, attrs) {
        angular.element(document.querySelector('.table-scroll-container')).bind("scroll", function () {
            const firstColumn = document.querySelectorAll('.fixed-left');
            const fixedHeader = document.querySelectorAll('.fixed-top-left');
            if (this.scrollLeft === 0) {
                firstColumn.forEach(td => td.classList.remove('left-shadow'));
            } else {
                firstColumn.forEach(td => td.classList.add('left-shadow'));
            }
            if (this.scrollLeft === 0) {
                fixedHeader.forEach(th => th.classList.remove('left-shadow'));
            } else {
                fixedHeader.forEach(th => th.classList.add('left-shadow'));
            }
            scope.$apply();
        });
    };
});
