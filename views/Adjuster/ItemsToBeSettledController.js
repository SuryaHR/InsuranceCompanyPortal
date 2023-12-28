
angular.module('MetronicApp').controller('ItemsToBeSettledController', function ($scope,$filter, $rootScope, $translatePartialLoader, $translate, $location, AdjusterPropertyClaimDetailsService) {
    $translatePartialLoader.addPart('ItemsToBeSettled');
    $translate.refresh();

    $scope.pagesize = $rootScope.settings.pagesize;
    $scope.search;
    $scope.DdlSourceCategoryList = [];
    $scope.Category = "1";
    $scope.TotalACV = 0;
    $scope.DebitCardDetails = {
        "BankName":null,
        "PaymentDate": null,
        "debitCardNumber": null,
        "payAmount": $scope.TotalACV
    };
    $scope.CheckDetails = {
        "bankName": null,
        "PaymentDate": null,
        "checkNumber": null,
        "payAmount": $scope.TotalACV
    };
    init();
    function init() {
        $scope.ClaimNo = sessionStorage.getItem("ClaimNo").toString();
        var GetItemsList = AdjusterPropertyClaimDetailsService.GetItemsTobesettle({
            "claimNumber": $scope.ClaimNo
        });
        GetItemsList.then(function (success) { $scope.ItemsList = success.data.data; }, function (error) { });

    }
    //Check All
    $scope.SelectedItems = [];
    $scope.selectedAll = false;
    $scope.checkAll = function () {
        $scope.SelectedItems = [];
        if ($scope.selectedAll) {
            angular.forEach($scope.ItemsList, function (item) {
                $scope.SelectedItems.push(item.id);
            });
        }
        else {
            $scope.SelectedItems = [];
        }
        calculateTotal();
    };
    $scope.getIsChecked = function getIsChecked(id) {
        if ($scope.SelectedItems.indexOf(id) > -1)
            return true;
        else
            return false;
    }
    $scope.SelectItem = SelectItem;
    function SelectItem(id) {
        var indx = $scope.SelectedItems.indexOf(id);
        if (indx > -1) {
            $scope.SelectedItems.splice(indx, 1);
            $scope.selectedAll = false;
        }
        else
            $scope.SelectedItems.push(id);

        calculateTotal();
    }
    function calculateTotal() {
        $scope.TotalACV = 0;
        angular.forEach($scope.SelectedItems, function (item) {
            angular.forEach($scope.ItemsList, function (costItem) {
                if (costItem.id === item)
                    $scope.TotalACV = $scope.TotalACV + costItem.acv;
            });
        })
        $scope.DebitCardDetails.Amount = $scope.TotalACV;
        $scope.CheckDetails.Amount = $scope.TotalACV;
    }

    $scope.GoBack = GoBack;
    function GoBack() {
        $location.url('AdjusterPropertyClaimDetails');
    }

    $scope.ShowPaymentDetails = function (param) {
        if (param == 'DirectDeposit') {
            $scope.DebitCardSection = false;
            $scope.CheckSection = false;
            //   $scope.DirectDepositSection = true;

        }
        else if (param == 'DebitCard') {
            $scope.DebitCardSection = true;
            $scope.CheckSection = false;
            // $scope.DirectDepositSection = false;
        }
        else if (param = 'check') {
            $scope.DebitCardSection = false;
            $scope.CheckSection = true;
            //$scope.DirectDepositSection = false;
        }
    }
    //PayMent
    $scope.Payment = Payment;
    function Payment() {
        var itemsId = [];;
        angular.forEach($scope.SelectedItems, function (item) {
            itemsId.push({ "itemId": item });
        })
     
       
        var param;
        if ($scope.DebitCardSection) {
             param = {
                 "claimNumber": $scope.ClaimNo,
                "items": itemsId,
                "paymentDetails": {
                    "bankName": $scope.DebitCardDetails.BankName,
                    "debitCard": true,
                    "paymentDate": $filter('DatabaseDateFormatMMddyyyy')($scope.DebitCardDetails.PaymentDate),
                    "debitCardNumber": $scope.DebitCardDetails.CardNo,
                    "payAmount": $scope.DebitCardDetails.Amount.toString()
                }
             }

        }
        if ($scope.CheckSection) {
            param = {
                "claimNumber": $scope.ClaimNo,
                "items": itemsId,
                "paymentDetails": {
                    "bankName": $scope.CheckDetails.BankName,
                    "check": true,
                    "checkDate": $filter('DatabaseDateFormatMMddyyyy')($scope.CheckDetails.PaymentDate),
                    "checkNumber": $scope.CheckDetails.CheckNo,
                    "payAmount": $scope.CheckDetails.Amount.toString()
                }
            }          
        }
      
        var Pay = AdjusterPropertyClaimDetailsService.PaymentDebitCard(param);
        Pay.then(function (success) {
            $scope.ClaimNo = sessionStorage.getItem("ClaimNo").toString();
            var GetItemsList = AdjusterPropertyClaimDetailsService.GetItemsTobesettle({
                "claimNumber": $scope.ClaimNo
            });
            GetItemsList.then(function (success) { $scope.ItemsList = success.data.data; }, function (error) { });
            toastr.remove()
            toastr.success($translate.instant(success.data.message), $translate.instant("SuccessHeading"));
        }, function (error) {

            toastr.remove()
            toastr.success($translate.instant(error.data.errorMessage), $translate.instant("ErrorHeading"));
        });
    }
    //Go to Dashboard
    $scope.GotoDashboard = GotoDashboard;
    function GotoDashboard() {
        $location.url(sessionStorage.getItem('HomeScreen'));
    }
});