angular.module('MetronicApp').controller('StatusChangePopUpController', function ($rootScope, $filter, $location, AdjusterPropertyClaimDetailsService, $uibModal, $scope, $translate, $translatePartialLoader, itemData, AuthHeaderService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    //set language
    $translatePartialLoader.addPart('StatusChangePopUp');
    $translate.refresh();
    $scope.role = sessionStorage.getItem("RoleList");
    $scope.canPaid = itemData.canPaid
    $scope.canValued = itemData.canValued
    $scope.FiletrLostDamageList = itemData.FiletrLostDamageList

    $scope.init = init;
    function init() {

    }
    init();
    $scope.cancel = function () {
        $scope.$close();
    };

    $scope.ChangeStatus = function (statusId) {
        var selectedItems = [];
        //$(".page-spinner-bar").removeClass("hide");
        angular.forEach($scope.FiletrLostDamageList, function (item) {
            if (item.Selected) {
                item.claimItem.adjusterDescription = item.claimItem.description;
                // insuredPrice
                $scope.ItemDetails = item.claimItem;
                $scope.CalculateRCV();
                selectedItems.push($scope.ItemDetails);
            }
        });
        // console.log(selectedItems);            
        var param = {
            "itemIds": itemData.SelectedPostLostItems,
            "itemStatusId": statusId,
            "claimItems": selectedItems
        }
        var getCategories = AdjusterPropertyClaimDetailsService.bulkUpdateStatus(param);
        getCategories.then(function (success) {
            toastr.remove();
            toastr.success("Successfully updated status", $translate.instant("SuccessHeading"));
            $scope.$close();
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            // $scope.$close();
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
            $scope.$close();
        });
    }

    $scope.CalculateRCV = function () {
        //ACV = P - ((CA / EL) * P) Formula
        //Get Price of added comparable value

        var Price = 0.0; var taxRate = 0.0;
        var ACV = 0.0; var RCV = 0.0;
        var Age = 0.0; var usefulYears = 0.0;
        var EL = 0.0; var CA = 0.0;
        var depreciationPercent = 0.0;

        // angular.forEach($scope.Comparables.comparableItems, function (item) {
        //     if (item.isReplacementItem == true) {
        //         Price = parseFloat((item.unitPrice) ? item.unitPrice : item.price);
        //     }
        // });
        Price = $scope.ItemDetails.insuredPrice;

        //Get age of item
        if ($scope.ItemDetails.ageMonths !== null && angular.isDefined($scope.ItemDetails.ageMonths) && $scope.ItemDetails.ageMonths > 0) {
            if ($scope.ItemDetails.ageYears !== null && angular.isDefined($scope.ItemDetails.ageYears) && $scope.ItemDetails.ageYears !== "")
                Age = parseFloat($scope.ItemDetails.ageYears) + (parseFloat($scope.ItemDetails.ageMonths) / 12);
            else
                Age = Math.ceil(parseFloat($scope.ItemDetails.ageMonths) / 12);
        }
        else {
            if ($scope.ItemDetails.ageYears !== null && angular.isDefined($scope.ItemDetails.ageYears))
                Age = parseFloat($scope.ItemDetails.ageYears);
        }

        if ($scope.ItemDetails.subCategory != null && angular.isDefined($scope.ItemDetails.subCategory)) {
            if ($scope.ItemDetails.subCategory.annualDepreciation != null && angular.isDefined($scope.ItemDetails.subCategory.annualDepreciation)) {
                depreciationPercent = parseFloat(Age * ($scope.ItemDetails.subCategory.annualDepreciation / 100));
            }
            else
                depreciationPercent = parseFloat(Age * (10 / 100));
        }

        //if usefulYears not getting form db then calculate usefulYears by formula
        //Useful Years = 100 / (Depreciation %) = 100/10 = 10 years
        EL = (depreciationPercent = null ? 0 : depreciationPercent.toFixed(2));
        CA = parseFloat(Age);
        RCV = parseFloat(Price);
        /**
         * Calculate material cost
         */
        Price = Price * $scope.ItemDetails.quantity;
        taxRate = $scope.ItemDetails.taxRate ? $scope.ItemDetails.taxRate : 0;
        $scope.ItemDetails.totalTax = parseFloat((taxRate / 100) * (isNaN(Price) ? 1 : Price)).toFixed(2);
        ACV = isNaN(ACV) ? 0 : ACV;
        Price = isNaN(Price) ? 0 : (parseFloat($scope.ItemDetails.totalTax) + parseFloat(Price)).toFixed(2);
        CA = isNaN(CA) ? 0 : CA;
        EL = isNaN(EL) ? 0 : EL;
        $scope.ItemDetails.depreciationAmount = parseFloat((parseFloat(Price) * parseFloat(EL)).toFixed(2)) > 0 ? parseFloat((parseFloat(Price) * parseFloat(EL)).toFixed(2)) : 0;
        ACV = (parseFloat(Price) - (parseFloat(Price) * parseFloat(EL))) > 0 ? (parseFloat(Price) - (parseFloat(Price) * parseFloat(EL))) : 0;
        $scope.ItemDetails.rcvTotal = Price;
        $scope.ItemDetails.holdOverValue = parseFloat(Price - ACV).toFixed(2);
        if ($scope.ItemDetails.holdOverValue < 0)
            $scope.ItemDetails.holdOverValue = 0;

        $scope.ItemDetails.acv = (parseFloat(ACV)).toFixed(2);
        $scope.ItemDetails.rcv = (parseFloat(RCV)).toFixed(2);
        // as per request if category is jwelary the acv is equals to replacement cost
        if ($scope.ItemDetails.category && ($scope.ItemDetails.category.id == 31)) {
            $scope.ItemDetails.acv = $scope.ItemDetails.rcvTotal;
        }
        if (isNaN($scope.ItemDetails.valueOfItem)) {
            $scope.ItemDetails.valueOfItem = 0;
        }
        if (isNaN($scope.ItemDetails.holdOverValue)) {
            $scope.ItemDetails.holdOverValue = 0;
        }
        if (isNaN($scope.ItemDetails.totalTax)) {
            $scope.ItemDetails.totalTax = 0;
        }
        if (isNaN($scope.ItemDetails.acv)) {
            $scope.ItemDetails.acv = 0;
        }
        if (isNaN($scope.ItemDetails.rcv)) {
            $scope.ItemDetails.rcv = 0;
        }
        if (isNaN($scope.ItemDetails.rcvTax)) {
            $scope.ItemDetails.rcvTax = 0;
        }
        if (isNaN($scope.ItemDetails.rcvTotal)) {
            $scope.ItemDetails.rcvTotal = 0;
        }
        if (isNaN($scope.ItemDetails.acvTotal)) {
            $scope.ItemDetails.acvTotal = 0;
        }
        if (isNaN($scope.ItemDetails.acvTax)) {
            $scope.ItemDetails.acvTax = 0;
        }
    }
    
    $scope.paid = function () {
        var selectesItems = [];
        var total = 0.00;
        var itemCnt = 0;
        //$(".page-spinner-bar").removeClass("hide");
        angular.forEach($scope.FiletrLostDamageList, function (item) {
            if (item.Selected) {
                selectesItems.push(item.claimItem);
                if (item.claimItem.status.status == "VALUED") {
                    total += item.claimItem.acv
                    itemCnt++;
                }
            }
        });
        var itmStr = (itemCnt == 1) ? "item" : "items";
        bootbox.confirm({
            size: 'small',
            //closeButton: false,
            // Paying a sum of $6,798.00 (ACV) for 20 items
            message: "<b><center>Payment Details</center></b><br/>Paying a sum of " + $filter('currency')(total) + " (ACV) for " + itemCnt + " " + itmStr + "<br/><br/>Check #<span class='text-danger'>*</span>&nbsp;&nbsp;&nbsp;&nbsp;<input type='text' id='checkNumber'>", closeButton: false,
            buttons: {
                confirm: {
                    label: "Submit"
                },
                cancel: {
                    label: "Cancel" //$translate.instant('ClaimDetails_Delete.BtnNo'),
                }
            },
            callback: function (result) {
                if (result) {
                    $(".page-spinner-bar").removeClass("hide");
                    var param = {
                        "checkNumber": $('#checkNumber').val(),
                        "ammount": total,
                        "claimLineItemDetails": selectesItems,
                        "registrationNumber": sessionStorage.getItem("jewelryVendor") ? sessionStorage.getItem("jewelryVendor") : sessionStorage.getItem("speedCheckVendor")
                    }
                    var getpromise = AdjusterPropertyClaimDetailsService.updatePostLostItemsStatus(param);
                    getpromise.then(function (success) {
                        toastr.remove();
                        toastr.success("Successfully submitted request", $translate.instant("SuccessHeading"));
                        $(".page-spinner-bar").addClass("hide");
                        $scope.$close();
                    }, function (error) {
                        $(".page-spinner-bar").addClass("hide");
                        $scope.ErrorMessage = error.data.errorMessage;
                        $scope.$close();
                    });
                    $(".page-spinner-bar").addClass("hide");
                }
            }
        });
    }
});
