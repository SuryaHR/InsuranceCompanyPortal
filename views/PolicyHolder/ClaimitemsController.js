
angular.module('MetronicApp').controller('ClaimItemsController', function ($rootScope, $uibModal, $state,
    $scope, settings, $filter, $window, $timeout, $location, $translate, $translatePartialLoader, ClaimItemsService, LineItemsFactory, StatusConstants) {
        $scope.limit = 50;
    function init() {
        $scope.CommonObj =
        {
            ClaimNumber: sessionStorage.getItem("PolicyHolderClaimNo"),
            ClaimId: sessionStorage.getItem("PolicyHolderClaimId"),
            UserId: sessionStorage.getItem("UserId"),
            ClaimProfile: sessionStorage.getItem("claimProfile"),
            UserRole: sessionStorage.getItem("RoleList"),
            EventDate: $filter('date')(new Date(), "dd/MM/yyyy")
        };
        GetPostLostItems();
    } init();

    $scope.constants = {
        itemStatus: StatusConstants.ItemStatus,
        invoiceStatus: StatusConstants.InvoiceStatus,
    };
    $scope.getTemplate = function (item) {
        return 'display';
    };
    function GetPostLostItems() {
        $(".page-spinner-bar").removeClass("hide");

        if ($scope.CommonObj.ClaimNumber !== null && angular.isDefined($scope.CommonObj.ClaimNumber)) {
            var param = {
                "claimNumber": $scope.CommonObj.ClaimNumber
            };
            var getDetails = ClaimItemsService.GetDetails(param);
            getDetails.then(function (success) {
                $scope.ReportDetails = success.data.data;
                if($scope.ReportDetails.claimItemsDetails){
                    $scope.istfoot = $scope.ReportDetails.claimItemsDetails.length > 0 ? true : false;
                }

                GetAllTotal();
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });
        }
    }

    function GetAllTotal() {
        $scope.TotalReplacementCost = 0;
        $scope.TotalDepreciationAmount = 0;
        $scope.TotalActualCashValue = 0;
        $scope.totalHoldOverValue = 0;
        $scope.totalSettlement = 0;
        $scope.paidItemsCount=0;
        $scope.ReportDetails.reportClaimDetails.coverageLimit = parseFloat(roundOf2Decimal($scope.ReportDetails.reportClaimDetails.coverageLimit != null ? $scope.ReportDetails.reportClaimDetails.coverageLimit : '0'));
        if ($scope.ItemsReplacedOrPaid && $scope.ItemsReplacedOrPaid.reportClaimDetails) {
            $scope.ItemsReplacedOrPaid.reportClaimDetails.coverageLimit = parseFloat(roundOf2Decimal($scope.ItemsReplacedOrPaid.reportClaimDetails.coverageLimit != null ? $scope.ItemsReplacedOrPaid.reportClaimDetails.coverageLimit : 0));
            $scope.ItemsReplacedOrPaid.reportClaimDetails.personalPropertyCoverageLimit = parseFloat(roundOf2Decimal($scope.ItemsReplacedOrPaid.reportClaimDetails.personalPropertyCoverageLimit != 0 ? $scope.ItemsReplacedOrPaid.reportClaimDetails.personalPropertyCoverageLimit : 0));
        }

        angular.forEach($scope.ReportDetails.claimItemsDetails, function (item) {
            $scope.TotalReplacementCost += item.replacementTotalCost;
            $scope.TotalDepreciationAmount += item.depreciationAmount;
            $scope.TotalActualCashValue += parseFloat(roundOf2Decimal(item.actualCashValue ? item.actualCashValue : 0));
            item.actualCashValue = parseFloat(roundOf2Decimal(item.actualCashValue ? item.actualCashValue : 0));
            item.replacementCost = parseFloat(roundOf2Decimal(item.replacementCost ? item.replacementCost : 0));
            item.replacementTotalCost = parseFloat(roundOf2Decimal(item.replacementTotalCost ? item.replacementTotalCost : 0));
            var holdover = parseFloat(item.replacementTotalCost) - parseFloat(item.actualCashValue);
            item.holdOverValue = parseFloat(roundOf2Decimal(holdover && holdover > 0 ? holdover : 0));
            item.unitPrice = parseFloat(roundOf2Decimal(item.unitPrice ? item.unitPrice : 0));
            item.totalPrice = parseFloat(roundOf2Decimal(item.totalPrice ? item.totalPrice : 0));
            item.depreciationAmount = parseFloat(roundOf2Decimal(item.depreciationAmount ? item.depreciationAmount : 0));
            $scope.totalHoldOverValue += item.holdOverValue ? item.holdOverValue : 0
            //item.settlementValue = (item.actualCashValue) + (item.holdOverValue);
            if(roundOf2Decimal(item.settlementValue) >0){
                $scope.paidItemsCount++;
            }
            $scope.totalSettlement += parseFloat(roundOf2Decimal(item.settlementValue));
        });
    }

 // Round of 2 Decimal point
 $scope.roundOf2Decimal = roundOf2Decimal;
 function roundOf2Decimal(num) {
     if (num != null) {
         return (Math.round(num * 100) / 100).toFixed(2);
     }
     return num;
 }

   // Get PDF / Excel of Detailed Inventory
   $scope.exportDetailedInventory = function (type) {
    $(".page-spinner-bar").removeClass("hide");
    var claimDetails = {
        "claimNumber": $scope.CommonObj.ClaimNumber,
        "format": type
    };
    var fileDetails = ClaimItemsService.exportDetailedInventory(claimDetails);
    fileDetails.then(function (response) {
        var headers = response.headers();
        // var filename = headers['x-filename'];
        var filename = "CLAIM_SETTLEMENT_"+$scope.CommonObj.ClaimNumber+".xlsx";
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

});
