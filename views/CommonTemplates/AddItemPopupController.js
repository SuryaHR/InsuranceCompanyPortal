angular.module('MetronicApp').controller('AddItemPopupController', function ($rootScope, $filter, AdjusterPropertyClaimDetailsService, AdjusterLineItemDetailsService, $uibModal,
    $scope, $translate, $translatePartialLoader, objData, LineItemsFactory, utilityMethods, $window,StatusConstants, $sce) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    //set language
    $translatePartialLoader.addPart('AddItemPopup');
    $translate.refresh();
    $scope.selected = {
        "category": {}
    };
    $scope.RoomsList = [];
    $scope.Retailers = [];
    $scope.paymentTypes = [];
    $scope.AddItemForm = {};
    $scope.ItemFiles = [];
    $scope.FiletrLostDamageList = [];
    $scope.categoryList = [];
    $scope.policy = objData.PolicyDetails;
    $scope.isEditItem = objData.isEditItem ? true : false;
    $scope.selected.isScheduledItem = false;
    $scope.videoLinkEditable = true;
    $scope.constants = {
        itemStatus: StatusConstants.ItemStatus,
        invoiceStatus: StatusConstants.InvoiceStatus,
    };
    $scope.CommonObj ={
        ClaimProfile : sessionStorage.getItem("claimProfile")
    }

    $scope.newItemAdded = false;

    // CTB-2992
    $scope.selected.applyTax = true;
    $scope.newRoom=false;
    var newItems = [];
    function init() {
        console.log("objData.CommonObj", objData.CommonObj);
        $scope.popupObj = objData.CommonObj;
        $scope.popupObj.UserRole = sessionStorage.getItem("RoleList");
        $scope.popupObj.refferer = sessionStorage.getItem("BackPage");
        if ($scope.popupObj.ClaimProfile != "Jewelry") {
            $scope.selected = { isScheduledItem: false, category: { id: null } };
        }
        else
            $scope.shippingMethods = objData.ShippingMethods;
        getCategories();
        getCondition();
        getRooms();
        getRetailers();
        GetSubCategoryList()
        $scope.selected.addOtherRetailer = false;
        $scope.selected.applyTax = objData.applyTax;
        var storedData = LineItemsFactory.getItemsList();
        
        if($scope.popupObj.UserRole === 'CLAIM SUPERVISOR'){
            if (storedData && storedData.claim)
            $scope.FiletrLostDamageList = storedData.originalItemsList
        }else{
            if (storedData && storedData.claim && storedData.claim.claimNumber === $scope.popupObj.ClaimNumber)
            $scope.FiletrLostDamageList = storedData.originalItemsList
        }
        // Set Default condition - Very Good
        if ($scope.selected.condition == null) {
            $scope.selected.condition = { "conditionId": 3, "conditionName": "Very Good" }
        }
    }
    init();

    //Cancel
    $scope.cancel = function () {
        if (newItems && newItems.length > 0 && $scope.popupObj.UserRole === 'CLAIM SUPERVISOR')
            notifyInsuranceAdjuster();
        
        if($scope.newItemAdded){
            $scope.newItemAdded = false;
            $scope.$close("Added");
        }else{
            $scope.$close("Close");
        }        
    };

    function notifyInsuranceAdjuster() {
        var param = {
            "claimNumber": $scope.popupObj.ClaimNumber,
            "postlossItems": newItems
        }
        var getpromise = AdjusterLineItemDetailsService.notifyInsuranceAdjuster(param);
        getpromise.then(function (success) {
            newItems = [];
        }, function (error) {
            toastr.remove();
            toastr.error("Failed to notify adjuster for new items added");
        });
    }

    function getCategories() {
        $scope.categoryList = objData.Category;
        if ($scope.popupObj.ClaimProfile === "Jewelry") {
            var jewelryCategory = $scope.categoryList.filter(function (category) {
                return category.categoryName.toLowerCase() === "jewelry";
            })[0];
            if (jewelryCategory) {
                sessionStorage.setItem("CurrentCategoryJewelryId", jewelryCategory.categoryId);
                $scope.selected = {
                    isScheduledItem: false,
                    category: {
                        id: jewelryCategory.categoryId,
                        name: jewelryCategory.categoryName,
                        aggregateLimit: null
                    },
                    individualLimitAmount: 0
                };
                // //To set jewelry profile by default
                GetItemSubCategory();
            }
            sessionStorage.setItem("CurrentCategoryJewelryCoverageLimit", $scope.selected.category.aggregateLimit)

        }
    }

    function getRooms() {
        var rooms = AdjusterLineItemDetailsService.getRooms($scope.popupObj.ClaimNumber);
        rooms.then(function (success) {
            $scope.RoomsList = success.data.data;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }

    function getRetailers() {
        var retailers = AdjusterLineItemDetailsService.getRetailers();
        retailers.then(function (success) {
            if (success.data.data) {
                $scope.Retailers = success.data.data.retailers;
                $scope.paymentTypes = success.data.data.paymentTypes;
            }
            if ($scope.isEditItem) {
                var selectedItem = objData.Item;
                EditItemDetails(selectedItem);
            }
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    };

    $scope.selectRoom = function (room) {
        $scope.selected.room = {};
        $scope.selected.room = {
            "id": room.id,
            "roomName": room.roomName
        }
    }

    $scope.selectRetailer = function (retailer) {
        $scope.selected.retailer = {};
        if (retailer)
            $scope.selected.originallyPurchasedFrom = {
                "id": retailer.id,
                "name": retailer.name
            }
        else {
            $scope.selected.originallyPurchasedFrom = null;
        }
        $scope.selected.newRetailer = null;
        $scope.selected.addOtherRetailer = false;
    };

    $scope.selectPaymentmethod = function (paymentMethod) {
        if (paymentMethod === 'Gift')
            $scope.selected.originallyPurchasedFrom = null;
        else
            $scope.selected.giftedFrom = null;
    }

    $scope.SelectScheduledItem = SelectScheduledItem;
    function SelectScheduledItem(val) {
        if (val == true) {
            $scope.ScheduledItem = true;
        }
        else if (val == false) {
            $scope.ScheduledItem = false;
        }
    }

    $scope.AddNewItem = false;
    $scope.EditItem = false;
    $scope.GetItemSubCategory = GetItemSubCategory;
    function GetItemSubCategory() {
        if ($scope.selected.category) {
            //$(".page-spinner-bar").removeClass("hide");
            var param = {
                "categoryId": $scope.selected.category.id
            };
            GetItemCategoryLimit($scope.selected.category.id);
            var respGetSubCategory = AdjusterPropertyClaimDetailsService.getSubCategory(param);
            respGetSubCategory.then(function (success) {
                $scope.SubCategory = success.data.data; 
                if ($scope.SubCategory.length <= 1) {
                    $scope.selected.subCategory = angular.copy($scope.SubCategory[0]);                  
                }
                
                // For claim Profile Jewelry
                if($scope.CommonObj.ClaimProfile.toLowerCase()=="jewelry"){
                    $scope.SubCategory = $scope.SubCategory .filter(item => (item.name !="Costume Jewelry" && item.name !="Watches under $100"));
                }
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                $scope.SubCategory = null; $scope.ErrorMessage = error.data.errorMessage
                $(".page-spinner-bar").addClass("hide");
            });
        }
    }
    function GetItemCategoryLimit(id) {
        var count = 0;
        angular.forEach($scope.policy.categories, function (item) {
            if (item.id == id) {
                count++
                // CTB-3045
                // if ($scope.selected.category) {
                // if (!$scope.selected.categoryLimit || $scope.selected.categoryLimit <= 0)
                $scope.selected.categoryLimit = !item.coverageLimit ? 0 : item.coverageLimit;
                //}
                // if (!$scope.selected.individualLimitAmount || $scope.selected.individualLimitAmount <= 0)
                $scope.selected.individualLimitAmount = !item.individualItemLimit ? 0 : item.individualItemLimit;
                //}
                // }
            }
        });
        // if (count === 0) {
        //     $scope.selected.categoryLimit = 0;
        //     $scope.selected.individualLimitAmount = 0;
        // }
    }

    $scope.SetScheduledStatus = SetScheduledStatus;
    function SetScheduledStatus(item, status) {
        item.isScheduledItem = status;
    }

    // CTB-2992
    $scope.SetApplyTaxesStatus = SetApplyTaxesStatus;
    function SetApplyTaxesStatus(item, status) {
        item.applyTax = status;
    }

    $scope.CalculateRCV = function (itemid, callback) {        
        $scope.ItemDetails = $scope.selected;
        // Get Price of added comparable or 
        // Some Items are valued directly from claim dashboard, then get rcvTotal
        if($scope.ItemDetails.isReplaced && $scope.CommonObj.ClaimProfile.toLowerCase!="jewelry"){
        var Price = 0.0;
        var taxRate = 0.0;
        var ACV = 0.0;
        var RCV = 0.0;
        Price = $scope.acceptedStandardCost? $scope.ItemDetails.rcv : $scope.ItemDetails.totalStatedAmount ;

        $scope.ItemDetails.replacementQty = Number($scope.ItemDetails.replacementQty) || 1

        $scope.ItemDetails.individualLimitAmount = $scope.ItemDetails.homeInsurancePolicyCategoryLimits?.individualItemLimit ?? $scope.ItemDetails.individualLimitAmount;


        // var Age = 0.0;
        // var EL = 0.0; var CA = 0.0;
        // var depreciationPercent = 0.0;
        var itemReplace = false;
        if ($scope.Comparables && $scope.Comparables.comparableItems && $scope.Comparables.comparableItems.length > 0) {
            angular.forEach($scope.Comparables.comparableItems, function (item) {
                if (item.isReplacementItem == true && !item.isDelete) {
                    Price = parseFloat(item.unitPrice ? item.unitPrice : item.price);
                    itemReplace = true;
                }
            });
        } else if ($scope.ItemDetails.status.status === $scope.constants.itemStatus.valued ||
            $scope.ItemDetails.status.status === $scope.constants.itemStatus.replaced || $scope.ItemDetails.status.status === $scope.constants.itemStatus.paid ||  $scope.ItemDetails.status.status === $scope.constants.itemStatus.settled ) {
            Price = $scope.ItemDetails.rcv;
        }
        if (!itemReplace) {
            if ($scope.previousValue) {
                Price = parseFloat($scope.ItemDetails.insuredPrice ? $scope.ItemDetails.insuredPrice : 0);
                $scope.previousValue = Price;
            }
        }
        //Get age of item
        // Prefixing '+' converts String => number
        $scope.ItemDetails.ageMonths = +$scope.ItemDetails.ageMonths;
        $scope.ItemDetails.ageYears = +$scope.ItemDetails.ageYears;

        // if ($scope.ItemDetails.ageMonths && $scope.ItemDetails.ageMonths > 0) {
        //     if ($scope.ItemDetails.ageYears)
        //         Age = utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.ageYears + $scope.ItemDetails.ageMonths / 12);
        //     else
        //         Age = Math.ceil(utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.ageMonths / 12));
        // }
        // else {
        //     if ($scope.ItemDetails.ageYears)
        //         Age = parseFloat($scope.ItemDetails.ageYears);
        // }
        // if ($scope.ItemDetails.subCategory) {
        //     if ($scope.ItemDetails.subCategory.annualDepreciation) {
        //         depreciationPercent = Age * $scope.ItemDetails.subCategory.annualDepreciation;
        //     }
        // }

        // if usefulYears not getting from db then calculate usefulYears by formula
        // Useful Years = 100 / (Depreciation %) = 100/10 = 10 years
        // EL = (depreciationPercent == null ? 0 : depreciationPercent);  
        
        RCV = Price;
        if($scope.isReplaced || $scope.ItemDetails.isReplaced){
            Price =$scope.ItemDetails.replacedItemPrice*$scope.ItemDetails.replacementQty
        }              
        // else{
        // // Calculate material cost
        // Price = Price * $scope.ItemDetails.replacementQty;
        // }
        
        taxRate = ($scope.ItemDetails.taxRate && $scope.ItemDetails.applyTax == true) ? $scope.ItemDetails.taxRate : 0;
        $scope.ItemDetails.totalTax = utilityMethods.parseFloatWithFixedDecimal((taxRate / 100) * (isNaN(Price) ? 1 : Price));

        Price = isNaN(Price) ? 0 : utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.totalTax + Price);
        // EL = isNaN(EL) ? 0 : EL;

        $scope.ItemDetails.rcvTotal = Price;

        if ($scope.SubCategoryList
            && $scope.ItemDetails.subCategory && $scope.ItemDetails.subCategory.id) {
            var subcategory = null;// = $scope.SubCategoryList.find(x => x.id == $scope.ItemDetails.subCategory.id);
            angular.forEach($scope.SubCategoryList, function (item) {
                if (item.id == $scope.ItemDetails.subCategory.id) {
                    subcategory = item;
                }
            })
            // if(subcategory && subcategory.name.toLowerCase() == 'Fiction and Non-Fiction'.toLowerCase()){
            //     EL = (60/100).toFixed(2);
            // }
            // else if(subcategory && subcategory.name.toLowerCase() == 'Paperbacks'.toLowerCase()){
            //     EL = (50/100).toFixed(2);
            // }
            if (subcategory) {
                $scope.CalculateRCVWithSplCase(subcategory, Price);
            }
        }

        // $scope.ItemDetails.depreciationAmount = utilityMethods.parseFloatWithFixedDecimal(Price * (EL / 100));
        ACV = utilityMethods.parseFloatWithFixedDecimal(Price - $scope.ItemDetails.depreciationAmount);
        ACV = isNaN(ACV) || ACV < 0 ? 0 : ACV;

        //$scope.ItemDetails.rcvTotal = Price;
        $scope.ItemDetails.itemOverage = 0.0;
        //$scope.ItemDetails.individualLimitAmount = $scope.ItemDetails.individualLimitAmount ? $scope.ItemDetails.individualLimitAmount : 0.0;
        $scope.ItemDetails.scheduleAmount = $scope.ItemDetails.scheduleAmount ? $scope.ItemDetails.scheduleAmount : 0.0;
        // CTB-2903
        // Condition where Item's category is not listed in selected home owners Policy type
        // then individual Limit will be 0.00, Item overage must also be considered 0.00.
        // Every item’s final Item Overage(holdover value) will be calculated based on the final Total Cash Value (ACV)
        // If(Total Cash Value > Item Limit) then acv - individual item limit else  Item Overage = 0.0
        if ($scope.ItemDetails.individualLimitAmount && $scope.ItemDetails.individualLimitAmount > 0 && ACV > $scope.ItemDetails.individualLimitAmount)
            $scope.ItemDetails.itemOverage = ACV - $scope.ItemDetails.individualLimitAmount;

        $scope.ItemDetails.acv = ACV;
        $scope.ItemDetails.rcv = RCV;

        // as per request if category is jewelry the acv is equals to replacement cost
        if ($scope.ItemDetails.category && ($scope.ItemDetails.category.name.toLowerCase() == 'jewelry')) {
            $scope.ItemDetails.acv = $scope.ItemDetails.rcvTotal;
        }
        //CTB-3151
        if($scope.ItemDetails.condition && $scope.ItemDetails.condition.conditionId ){
            // if($scope.ItemDetails.condition.conditionId === 1){
            // $scope.ItemDetails.acv = $scope.ItemDetails.acv*1.10;
            // }else if($scope.ItemDetails.condition.conditionId === 2){
            // $scope.ItemDetails.acv = $scope.ItemDetails.acv*1.05;
            // }else if($scope.ItemDetails.condition.conditionId === 4){
            // $scope.ItemDetails.acv = $scope.ItemDetails.acv*0.9;
            // }

            //ACV shld be always smaller than RCV
            if($scope.ItemDetails.acv >$scope.ItemDetails.rcvTotal){
            $scope.ItemDetails.acv = $scope.ItemDetails.rcvTotal;
            }

        }

        if (isNaN($scope.ItemDetails.valueOfItem)) {
            $scope.ItemDetails.valueOfItem = 0;
        }
        if (isNaN($scope.ItemDetails.itemOverage)) {
            $scope.ItemDetails.itemOverage = 0;
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
    SaveItemDetails(itemid,callback);


    }

    $scope.CalculateRCVWithSplCase = function (subcategory, Price) {
        var ACV = 0;
        var depriciationAmt = 0;
        var maxDepreciationAmt = utilityMethods.parseFloatWithFixedDecimal(Price * (subcategory.maxDepreciation / 100));
        $scope.ItemDetails.ageYears = Number.isNaN(Number($scope.ItemDetails.ageYears)) ? 0 : $scope.ItemDetails.ageYears;
        $scope.ItemDetails.ageMonths = Number.isNaN(Number($scope.ItemDetails.ageMonths)) ? 0 : $scope.ItemDetails.ageMonths;
        var depreciationRate = subcategory.annualDepreciation * ($scope.ItemDetails.ageYears + ($scope.ItemDetails.ageMonths/12));
        $scope.ItemDetails.depreciationRate = depreciationRate;
        $scope.ItemDetails.depriciationRateStr = subcategory.annualDepreciation + "%";
        
        $scope.ItemDetails.subcategory = subcategory;
        if (subcategory.specialCase) {
            if (subcategory.depreciation) {
                var ageInYrs = $scope.ItemDetails.ageYears + ($scope.ItemDetails.ageMonths/12);
                if(ageInYrs>0){
                var depreciatedPrice = Price;
                // depriciationAmt = Price * (subcategory.firstYearDepreciation / 100);
                if(ageInYrs <1)
                {
                    depriciationAmt += (depreciatedPrice * ((subcategory.firstYearDepreciation / 100)* ageInYrs));
                    depreciatedPrice = (depreciatedPrice - (depreciatedPrice * (subcategory.firstYearDepreciation / 100) * ageInYrs));
                }
                else
                {
                    depriciationAmt += depreciatedPrice * (subcategory.firstYearDepreciation / 100);
                    depreciatedPrice = depreciatedPrice - (depreciatedPrice * (subcategory.firstYearDepreciation / 100));
                }
                // var depreciatedPrice = Price - depriciationAmt;
                ageInYrs = ageInYrs-1;//after fst yr depreciation
                while (ageInYrs > 0) {
                    if(ageInYrs <1)
                    {
                        depriciationAmt += depreciatedPrice * ((subcategory.correspondYearDepreciation / 100)* ageInYrs);
                        depreciatedPrice = depreciatedPrice - (depreciatedPrice * ((subcategory.correspondYearDepreciation / 100)* ageInYrs));
                        ageInYrs = ageInYrs - 1;
                    }
                    else
                    {
                        depriciationAmt += depreciatedPrice * (subcategory.correspondYearDepreciation / 100);
                        depreciatedPrice = depreciatedPrice - (depreciatedPrice * (subcategory.correspondYearDepreciation / 100));
                        ageInYrs = ageInYrs - 1;
                    }

                }
                $scope.ItemDetails.depreciationAmount = utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.rcvTotal - depreciatedPrice);
                ACV = utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.rcvTotal - $scope.ItemDetails.depreciationAmount);
            }

                $scope.ItemDetails.depriciationRateStr = subcategory.firstYearDepreciation + "%, "+subcategory.correspondYearDepreciation+"% year on, " + subcategory.maxDepreciation+ "% max";

            }
            else if (subcategory.flatDepreciation && subcategory.flatDepreciation > 0) {
                depriciationAmt = utilityMethods.parseFloatWithFixedDecimal(Price * (subcategory.flatDepreciation / 100));
                ACV = Price - depriciationAmt;
                $scope.ItemDetails.depriciationRateStr = subcategory.flatDepreciation +"% flat"
            }
            else {
                var ageInYrs = $scope.ItemDetails.ageYears;
                ageInYrs = $scope.ItemDetails.ageYears + ($scope.ItemDetails.ageMonths/12);
                // depriciationAmt = Price * (subcategory.annualDepreciation / 100);
                var depreciatedPrice = Price;
                //  = Price - depriciationAmt;
                // ageInYrs = ageInYrs-1;//after fst yr depreciation
                while (ageInYrs > 0) {
                    if(ageInYrs <1)
                    {
                    depriciationAmt += (depreciatedPrice * ((subcategory.annualDepreciation / 100)* ageInYrs));
                    depreciatedPrice = (depreciatedPrice - (depreciatedPrice * (subcategory.annualDepreciation / 100) * ageInYrs));
                    }
                    else{
                    depriciationAmt += (depreciatedPrice * (subcategory.annualDepreciation / 100));
                    depreciatedPrice = (depreciatedPrice - (depreciatedPrice * (subcategory.annualDepreciation / 100)));
                    }
                    ageInYrs = ageInYrs - 1;

                   
                }
                $scope.ItemDetails.depreciationAmount = utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.rcvTotal - depreciatedPrice);
                    ACV = utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.rcvTotal - $scope.ItemDetails.depreciationAmount);
             
                $scope.ItemDetails.depriciationRateStr += ", "+subcategory.maxDepreciation+ "% max";

            }
            // $scope.ItemDetails.rcv = RCV;
        }
        else {
            ageInYrs = $scope.ItemDetails.ageYears + ($scope.ItemDetails.ageMonths/12);
                // depriciationAmt = Price * (subcategory.annualDepreciation / 100);
                var depreciatedPrice = Price;
                //  = Price - depriciationAmt;
                // ageInYrs = ageInYrs-1;//after fst yr depreciation
            while (ageInYrs > 0) {
                if(ageInYrs <1)
                {
                depriciationAmt += (depreciatedPrice * ((subcategory.annualDepreciation / 100)* ageInYrs));
                depreciatedPrice = (depreciatedPrice - (depreciatedPrice * (subcategory.annualDepreciation / 100) * ageInYrs));
                }
                else{
                depriciationAmt += (depreciatedPrice * (subcategory.annualDepreciation / 100));
                depreciatedPrice = (depreciatedPrice - (depreciatedPrice * (subcategory.annualDepreciation / 100)));
                }
                ageInYrs = ageInYrs - 1;

            }
            $scope.ItemDetails.depreciationAmount = utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.rcvTotal - depreciatedPrice);
                    ACV = utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.rcvTotal - $scope.ItemDetails.depreciationAmount);

            $scope.ItemDetails.depriciationRateStr += ", "+subcategory.maxDepreciation+ "% max"

        }
        
        $scope.ItemDetails.depreciationAmount = utilityMethods.parseFloatWithFixedDecimal(depriciationAmt);
        $scope.ItemDetails.acv = utilityMethods.parseFloatWithFixedDecimal(ACV);

             //CTB-3151
             if($scope.ItemDetails.condition && $scope.ItemDetails.condition.conditionId && (subcategory.flatDepreciation > 0 || ($scope.ItemDetails.ageYears>0 || $scope.ItemDetails.ageMonths>0)) ){
                if($scope.ItemDetails.condition.conditionId === 1){
                    $scope.ItemDetails.acv = $scope.ItemDetails.acv*1.10;
                }else if($scope.ItemDetails.condition.conditionId === 2){
                    $scope.ItemDetails.acv = $scope.ItemDetails.acv*1.05;
                }else if($scope.ItemDetails.condition.conditionId === 4){
                    $scope.ItemDetails.acv = $scope.ItemDetails.acv*0.9;
                 }
            }
    
            if($scope.ItemDetails.acv>0){    
                $scope.ItemDetails.depreciationAmount = utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.rcvTotal - $scope.ItemDetails.acv);
                $scope.ItemDetails.depreciationAmount = $scope.ItemDetails.depreciationAmount < 0 ? 0 : $scope.ItemDetails.depreciationAmount;
                if($scope.ItemDetails.depreciationAmount > maxDepreciationAmt && maxDepreciationAmt>0 ){
                    $scope.ItemDetails.depreciationAmount =utilityMethods.parseFloatWithFixedDecimal(maxDepreciationAmt);
                    $scope.ItemDetails.acv = $scope.ItemDetails.rcvTotal - $scope.ItemDetails.depreciationAmount;    
                }
               }
               else
               {
                if($scope.ItemDetails.isReplaced && $scope.ItemDetails.depreciationAmount>0 && maxDepreciationAmt && maxDepreciationAmt>0)
                {
                    $scope.ItemDetails.depreciationAmount =utilityMethods.parseFloatWithFixedDecimal(maxDepreciationAmt);
                    $scope.ItemDetails.acv = $scope.ItemDetails.rcvTotal - $scope.ItemDetails.depreciationAmount;   
                }
                else{    
                 $scope.ItemDetails.depreciationAmount =0;
                 $scope.ItemDetails.acv = $scope.ItemDetails.rcvTotal;
                }
               }
            
        
        // var depreciateRateDetails = $http.get("Contants/DepriciationRatesContant.json");
        // depreciateRateDetails.then(function (success) {
        //     // console.log(success.data);
        //     var depreciationDetails = success.data.find(x => x.subcategory.toLowerCase() === subcategory.name.toLowerCase());

        //     if (depreciationDetails && depreciationDetails.totalRate != 0 && depreciationDetails.monthlyRate == 0) {
        //         var EL = depreciationDetails.totalRate / 100;
        //         let depreciateValue = Price * EL;
        //         var ACV = utilityMethods.parseFloatWithFixedDecimal((Price - depreciateValue) > 0 ? (Price - depreciateValue) : 0);
        //         $scope.ItemDetails.itemOverage = utilityMethods.parseFloatWithFixedDecimal(Price - ACV);
        //         if ($scope.ItemDetails.itemOverage < 0)
        //             $scope.ItemDetails.itemOverage = 0;
        //         $scope.ItemDetails.acv = utilityMethods.parseFloatWithFixedDecimal(ACV);
        //     }
        //     else if (depreciationDetails && depreciationDetails.totalRate == 0 && depreciationDetails.monthlyRate == 0 && depreciationDetails.comment) {
        //         if (depreciationDetails.comment == 'replacement cost') {
        //             $scope.ItemDetails.acv = $scope.ItemDetails.rcvTotal;
        //         }
        //         if (depreciationDetails.comment == 'appraisal value') {
        //             $scope.ItemDetails.acv = $scope.ItemDetails.appraisalValue;
        //         }
        //         if (depreciationDetails.comment == 'material cost') {
        //             $scope.ItemDetails.acv = $scope.ItemDetails.appraisalValue;
        //         }
        //         //  material cost
        //     }
        //     //  else if(subcategory.name == 'Paperbacks'){
        //     //  }
        // }, function (error) {
        // })

    }

    $scope.GetSubCategoryList = GetSubCategoryList;
    function GetSubCategoryList() {
        //--------------------------------------------------------------------------------------------------------------
        //bind subcategory
        
                        // else {
            //     if (Price != null)
            //         $scope.CalculateRCV();
            // }
            var param = { "categoryId": null };
            var getpromise = AdjusterPropertyClaimDetailsService.getSubCategory(param);
            getpromise.then(function (success) {
                // CTB-2923
                // If a certain category has exactly 1 subcategory -
                // its should be populated automatically in the sub-category drop down.
                var res = success.data ? success.data.data : null;
                if (res) {
                        $scope.SubCategoryList=res;
                    
                   
                    // else
                    //     $scope.CalculateRCV();
                }
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                //$scope.ErrorMessage = error.data.errorMessage;
                toastr.remove();
                toastr.error(error.data.errorMessage, 'Error');
                $(".page-spinner-bar").addClass("hide");
            });
    }


    $scope.SaveItemDetails = SaveItemDetails;
    function SaveItemDetails(itemid, callback) {
        
        //Check for invalid / error in AddItemForm before save/update
        if (($scope.AddItemForm.$invalid || $scope.AddItemForm.$pristine) && ($scope.AddItemForm.$invalid)) {
            utilityMethods.validateForm($scope.AddItemForm);
        } else {
            $(".page-spinner-bar").removeClass("hide");
            var param = new FormData();
            var fileDetails = [];
            if (itemid) {
                //Update service
                angular.forEach($scope.ItemFiles, function (ItemFile) {
                    if (ItemFile.isLocal) {
                        fileDetails.push({ "fileName": ItemFile.FileName, "fileType": ItemFile.FileType, "extension": ItemFile.FileExtension, "filePurpose": "ITEM", "latitude": null, "longitude": null })
                        param.append('file', ItemFile.File);
                    }
                });
                if ($scope.ItemFiles.length == 0 || $scope.ItemFiles == null) {
                    param.append('filesDetails', null);
                    param.append('file', null);
                }
                else {
                    param.append('filesDetails', JSON.stringify(fileDetails));
                }
                // $scope.selected = $scope.ItemDetails;

                param.append("itemDetails",
                    JSON.stringify(
                        {
                            "id": $scope.selected.id,
                            "acv":!!$scope.selected.acv ? $scope.selected.acv :0,                            
                            "ageMonths": (angular.isDefined($scope.selected.ageMonths) ? $scope.selected.ageMonths : 0),
                            "ageYears": (angular.isDefined($scope.selected.ageYears) ? $scope.selected.ageYears : 0),
                            "brand": $scope.selected.brand,
                            "category": $scope.selected.category ? {
                                "annualDepreciation": $scope.selected.category.annualDepreciation ? $scope.selected.category.annualDepreciation : null,
                                "id": $scope.selected.category.id ? $scope.selected.category.id : null,
                                "name": $scope.selected.category.id ? GetCategoryOrSubCategoryOnId(true, $scope.selected.category.id) : null,
                                "description": $scope.selected.category.description ? $scope.selected.category.description : null,
                                "usefulYears": $scope.selected.category.usefulYears ? $scope.selected.category.usefulYears : null,
                                "aggregateLimit": $scope.selected.category.aggregateLimit ? $scope.selected.category.aggregateLimit : null
                            } : null,
                            "categoryLimit": $scope.selected.categoryLimit ? $scope.selected.categoryLimit : null,
                            "claimId": $scope.selected.claimId,
                            "claimNumber": $scope.selected.claimNumber,
                            "depriciationRate": $scope.selected.depriciationRate,
                            "depreciationAmount":(angular.isDefined($scope.ItemDetails) && $scope.ItemDetails.depreciationAmount > 0) ? $scope.ItemDetails.depreciationAmount : 0,
                            "appraisalValue": $scope.selected.appraisalValue,
                            "appraisalDate": ((angular.isDefined($scope.selected.appraisalDate) && $scope.selected.appraisalDate !== null && $scope.selected.appraisalDate != "") ? $filter('DatabaseDateFormatMMddyyyy')($scope.selected.appraisalDate) : null),
                            "description": $scope.selected.description && $scope.selected.description!="" ? encodeURIComponent($scope.selected.description):"",
                            "insuredPrice": (angular.isDefined($scope.selected.insuredPrice) && $scope.selected.insuredPrice !="" ? $scope.selected.insuredPrice : 0),
                            "individualLimitAmount": (angular.isDefined($scope.selected.individualLimitAmount)  && $scope.selected.individualLimitAmount !="" ? $scope.selected.individualLimitAmount : 0),
                            "itemName": $scope.selected.itemName,
                            "isScheduledItem": $scope.selected.isScheduledItem,
                            "scheduleAmount": $scope.selected.scheduleAmount,
                            "model": $scope.selected.model,
                            "quantity": $scope.selected.quantity,
                            "status": {
                                "id": $scope.selected.status.id,
                                "status": $scope.selected.status.status
                            },
                            "subCategory": $scope.selected.subCategory ? {
                                "annualDepreciation": $scope.selected.subCategory.annualDepreciation ? $scope.selected.subCategory.annualDepreciation : null,
                                "id": $scope.selected.subCategory.id ? $scope.selected.subCategory.id : null,
                                "name": $scope.selected.subCategory.id ? GetCategoryOrSubCategoryOnId(false, $scope.selected.subCategory.id) : null,
                                "description": $scope.selected.subCategory.description ? $scope.selected.subCategory.description : null,
                                "usefulYears": $scope.selected.subCategory.usefulYears ? $scope.selected.subCategory.usefulYears : null,
                                "aggregateLimit": $scope.selected.subCategory.aggregateLimit ? $scope.selected.subCategory.aggregateLimit : null,
                            } : null,
                            "condition": {
                                "conditionId": (($scope.selected.condition !== null && angular.isDefined($scope.selected.condition)) ? $scope.selected.condition.conditionId : null),
                                "conditionName": (($scope.selected.condition !== null && angular.isDefined($scope.selected.condition)) ? $scope.selected.condition.conditionName : null)
                            },
                            "itemNumber": $scope.selected.itemNumber,
                            "shippingDate": $scope.selected.shippingDate && $scope.selected.shippingDate != '' ? $filter('DatabaseDateFormatMMddyyyy')($scope.selected.shippingDate) : null,
                            "shippingMethod": {
                                "id": $scope.selected.shippingMethod && $scope.selected.shippingMethod.id ? $scope.selected.shippingMethod.id : null
                            },
                            // delete attachments
                            "deleteAttachments": deletedItemAttachments && deletedItemAttachments.length > 0 ? deletedItemAttachments : null,
                            // Originally purchased from, purhase method, If gifted then donor's name and address
                            "originallyPurchasedFrom": $scope.selected.addOtherRetailer ? {
                                "name": $scope.selected.newRetailer
                            } : $scope.selected.originallyPurchasedFrom,
                            "room": $scope.selected.room,
                            "giftedFrom": $scope.selected.giftedFrom ? $scope.selected.giftedFrom : null,
                            "purchaseMethod": $scope.selected.purchaseMethod ? $scope.selected.purchaseMethod : null,
                            "applyTax": $scope.selected.applyTax,
                            "rcv": angular.isDefined($scope.ItemDetails)? $scope.ItemDetails.rcv:0,
                            "rcvTotal": angular.isDefined($scope.ItemDetails) ? $scope.ItemDetails.rcvTotal:0
                        }
                    ));
                var UpdatePostLoss = AdjusterPropertyClaimDetailsService.UpdatePostLoss(param);
                UpdatePostLoss.then(function (success) {
                    var updatedItem = success.data.data
                    if (updatedItem) {
                        if ($scope.selected.addOtherRetailer) {
                            $scope.selected.originallyPurchasedFrom = {
                                "id": updatedItem.originallyPurchasedFrom.id,
                                "name": updatedItem.originallyPurchasedFrom.name
                            }
                            var value = null;
                            angular.forEach($scope.Retailers, function (r) {
                                if (r.name === updatedItem.originallyPurchasedFrom.name)
                                    value = r;
                            });
                            if (value == null)
                                $scope.Retailers.push(updatedItem.originallyPurchasedFrom);
                            $scope.selected.addOtherRetailer = false;
                            $scope.selected.newRetailer = null;
                        }
                        // update item detailsin PostLost Items List using LineItemsFactory
                        LineItemsFactory.addUpdateItem(updatedItem, $scope.popupObj.ClaimNumber);
                        $scope.ItemFiles = [];
                        angular.forEach(updatedItem.attachments, function (attachment) {
                            $scope.ItemFiles.push({
                                "FileName": attachment.name, "FileExtension": attachment.name.substr((attachment.name.lastIndexOf('.') + 1)), "FileType": attachment.type,
                                "Image": attachment.url, "File": attachment.url, "url": attachment.url, "imageId": attachment.id, "data": attachment.multiPartFiles, "purpose": attachment.filePurpose, "imageUID": attachment.imageUID
                            })
                        });
                        toastr.remove();
                        toastr.success("Item #" + $scope.selected.itemNumber + " successfully updated", "Success");
                        
                        if (callback){                            
                            callback();
                        }else{
                            $scope.$close("Updated");
                        }
                    }
                    $(".page-spinner-bar").addClass("hide");
                },
                    function (error) {
                        $(".page-spinner-bar").addClass("hide");
                        toastr.remove()
                        toastr.error(error.data.errorMessage, $translate.instant("Error"));
                    });
                    $(".page-spinner-bar").addClass("hide");
            }
            else {
                // service to save new item
                //Call Api save And get its id then assign id and pass
                angular.forEach($scope.ItemFiles, function (ItemFile) {
                    fileDetails.push({ "fileName": ItemFile.FileName, "fileType": ItemFile.FileType, "extension": ItemFile.FileExtension, "filePurpose": "ITEM", "latitude": null, "longitude": null })
                    param.append('file', ItemFile.File);
                });
                if ($scope.ItemFiles.length == 0 || $scope.ItemFiles == null) {
                    param.append('filesDetails', null);
                    param.append('file', null);
                } else {
                    param.append('filesDetails', JSON.stringify(fileDetails));
                }

                if($scope.popupObj.ClaimProfile == 'Jewelry'){
                    $scope.selected.quantity =1;
                    $scope.selected.insuredPrice=$scope.popupObj.individualLimit;
                    $scope.selected.individualLimitAmount=$scope.popupObj.individualLimit;
                }

                param.append("itemDetails",
                    JSON.stringify({
                        "ageMonths": (angular.isDefined($scope.selected.ageMonths) ? $scope.selected.ageMonths : 0),
                        "ageYears": (angular.isDefined($scope.selected.ageYears) ? $scope.selected.ageYears : 0),
                        "brand": $scope.selected.brand,
                        "category": $scope.selected.category ? {
                            "annualDepreciation": $scope.selected.category.annualDepreciation ? $scope.selected.category.annualDepreciation : null,
                            "id": $scope.selected.category.id ? $scope.selected.category.id : null,
                            "name": $scope.selected.category.id ? GetCategoryOrSubCategoryOnId(true, $scope.selected.category.id) : null,
                            "description": $scope.selected.category.description ? $scope.selected.category.description : null,
                            "usefulYears": $scope.selected.category.usefulYears ? $scope.selected.category.usefulYears : null,
                            "aggregateLimit": $scope.selected.category.aggregateLimit ? $scope.selected.category.aggregateLimit : null
                        } : null,
                        "categoryLimit": $scope.selected.categoryLimit ? $scope.selected.categoryLimit : null,
                        "claimId": $scope.popupObj.ClaimId,
                        "claimNumber": $scope.popupObj.ClaimNumber,
                        "appraisalValue": $scope.selected.appraisalValue,
                        "appraisalDate": ((angular.isDefined($scope.selected.appraisalDate) && $scope.selected.appraisalDate !== null && $scope.selected.appraisalDate != "") ? $filter('DatabaseDateFormatMMddyyyy')($scope.selected.appraisalDate) : null),
                        "depriciationRate": $scope.selected.depriciationRate,
                        "description": $scope.selected.description && $scope.selected.description!="" ? encodeURIComponent($scope.selected.description):"",
                        "insuredPrice": $scope.selected.insuredPrice,
                        "individualLimitAmount": (angular.isDefined($scope.selected.individualLimitAmount) ? $scope.selected.individualLimitAmount : null),
                        "itemName": $scope.selected.itemName,
                        "isScheduledItem": $scope.selected.isScheduledItem,
                        "scheduleAmount": $scope.selected.scheduleAmount,
                        "model": $scope.selected.model,
                        "quantity": $scope.selected.quantity,
                        "status": {
                            "id": (($scope.selected.status !== null && angular.isDefined($scope.selected.status)) ? $scope.selected.status.id : null),
                            "status": (($scope.selected.status !== null && angular.isDefined($scope.selected.status)) ? $scope.selected.status.status : null)
                        },
                        "subCategory": $scope.selected.subCategory ? {
                            "annualDepreciation": $scope.selected.subCategory.annualDepreciation ? $scope.selected.subCategory.annualDepreciation : null,
                            "id": $scope.selected.subCategory.id ? $scope.selected.subCategory.id : null,
                            "name": $scope.selected.subCategory.id ? GetCategoryOrSubCategoryOnId(false, $scope.selected.subCategory.id) : null,
                            "description": $scope.selected.subCategory.description ? $scope.selected.subCategory.description : null,
                            "usefulYears": $scope.selected.subCategory.usefulYears ? $scope.selected.subCategory.usefulYears : null,
                            "aggregateLimit": $scope.selected.subCategory.aggregateLimit ? $scope.selected.subCategory.aggregateLimit : null
                        } : null,
                        "condition": {
                            "conditionId": (($scope.selected.condition !== null && angular.isDefined($scope.selected.condition)) ? $scope.selected.condition.conditionId : null),
                            "conditionName": (($scope.selected.condition !== null && angular.isDefined($scope.selected.condition)) ? $scope.selected.condition.conditionName : null)
                        },
                        "shippingDate": $scope.selected.shippingDate ? $filter('DatabaseDateFormatMMddyyyy')($scope.selected.shippingDate) : null,
                        "shippingMethod": {
                            "id": $scope.selected.shippingMethod && $scope.selected.shippingMethod.id ? $scope.selected.shippingMethod.id : null
                        },
                        // Originally purchased from, purhase method, If gifted then donor's name and address
                        "originallyPurchasedFrom": $scope.selected.addOtherRetailer ? {
                            "name": $scope.selected.newRetailer
                        } : $scope.selected.originallyPurchasedFrom,
                        "room": $scope.selected.room,
                        "giftedFrom": $scope.selected.giftedFrom ? $scope.selected.giftedFrom : null,
                        "purchaseMethod": $scope.selected.purchaseMethod ? $scope.selected.purchaseMethod : null,
                        "videoLink": $scope.selected.videoLink ? $scope.selected.videoLink : null,
                        "applyTax": $scope.selected.applyTax
                    }
                    ));
                var SavePostLossItem = AdjusterPropertyClaimDetailsService.AddPostLossItem(param);
                SavePostLossItem.then(function (success) {
                    var newItem = success.data.data
                    if (newItem) {
                        newItems.push({
                            "id": newItem.id,
                            "itemUID": newItem.itemUID
                        });
                        //Need to pass the ItemId which will generate after inserting item
                        $scope.NewlyAddedItemId = newItem.id;
                        if ($scope.selected.addOtherRetailer) {
                            var value = {};
                            angular.forEach($scope.Retailers, function (r) {
                                if (r.name === newItem.originallyPurchasedFrom.name)
                                    value = r;
                            });
                            if (value == null)
                                $scope.Retailers.push(newItem.originallyPurchasedFrom);
                            $scope.selected.addOtherRetailer = false;
                            $scope.selected.newRetailer = null;
                        }
                        // If user is claim supervisor, check if current tab is not My Claims
                        //to save new item to Post Lost items list
                        if ($scope.popupObj.UserRole === 'ADJUSTER' || ($scope.popupObj.UserRole === 'CLAIM SUPERVISOR' && $scope.popupObj.refferer != 'Dashboard'))
                            // Add newly added item to PostLost Items List using LineItemsFactory
                            LineItemsFactory.addUpdateItem(newItem, $scope.popupObj.ClaimNumber);
                        $scope.selected.id = $scope.NewlyAddedItemId;
                        toastr.remove()
                        toastr.success("Item added successfully.", $translate.instant("Success"));
                        $(".page-spinner-bar").addClass("hide");
                        $scope.resetForm();
                        if (callback){
                            $scope.newItemAdded = true;
                            callback();
                        }
                    }
                }, function (error) {
                    $(".page-spinner-bar").addClass("hide");
                    toastr.remove()
                    toastr.error(error.data.errorMessage, $translate.instant("Error"));
                });
            }
        }
    }

    $scope.resetForm = function () {
        $scope.AddItemForm.$setUntouched();
        $scope.AddItemForm.$setPristine();
        $scope.AddNewItem = false;
        $scope.EditItem = false;
        $scope.ItemFiles = [];
        $scope.isEditItem = false;

        if ($scope.popupObj.ClaimProfile == 'Jewelry') {
            $scope.selected = {
                isScheduledItem: false,
                // CTB-2992
                applyTax: true,
                category: {
                    id: parseInt(sessionStorage.getItem("CurrentCategoryJewelryId")),
                    aggregateLimit: parseInt(sessionStorage.getItem("CurrentCategoryJewelryCoverageLimit"))
                },
                // individualLimitAmount: sessionStorage.getItem("IndividualLimitJewelryCat"),
            };
        }
        else {
            $scope.selected = { isScheduledItem: false, applyTax: true };
        }
        $scope.selected.addOtherRetailer = false;
    };

    //get Category name on category id for showing in grid of post loss itemd
    function GetCategoryOrSubCategoryOnId(OpertionFlag, id) {
        if (id !== null && angular.isDefined(id)) {
            if (OpertionFlag) {
                var list = $filter('filter')($scope.categoryList, { categoryId: id });
                return list[0].categoryName;
            }
            else {
                var list = $filter('filter')($scope.SubCategory, { id: id });
                if (list.length > 0)
                    return list[0].name;
                else
                    return null;
            }
        }
        else
            return null;
    }
    // Attachments Add , delete and Preview
    $scope.SelectItemFile = function () {
        angular.element('#ItemFileUpload').trigger('click');
        $scope.AddItemForm.$setDirty();
    }

    $scope.getItemFileDetails = function (e) {
        var files = event.target.files;
        $scope.filed = event.target.files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.file = file;
            reader.fileName = files[i].name;
            reader.fileType = files[i].type;
            reader.fileExtension = files[i].name.substr(files[i].name.lastIndexOf('.'));
            reader.onload = $scope.ItemImageLoaded;
            reader.readAsDataURL(file);
        }
    };

    var randomId = Math.floor((Math.random() * 100) + 1);
    $scope.ItemImageLoaded = function (e) {
        $scope.$apply(function () {
            var itemExist = false;
            var newFilenm = e.target.fileName
            angular.forEach($scope.ItemFiles, function (item) {
                var filenm = item.FileName;
                if (filenm == newFilenm) {
                    itemExist = true;
                }
            });
            if (!itemExist) {
                $scope.ItemFiles.push({
                    "FileName": e.target.fileName, "FileExtension": e.target.fileExtension, "FileType": e.target.fileType, "Image": e.target.result, "File": e.target.file,
                    "isLocal": true, "imageId": "LOC_" + randomId++
                })
            } else {
                toastr.remove();
                toastr.warning('<b>File <u>' + newFilenm + '</u> is added already! Please add another file.</b>')
            }
            $("#ItemFileUpload").val('');
        });
    };

    // Category / Condition selection changes (Section & Floating box)
    $scope.changeSelection = changeSelection;
    function changeSelection(dropdown) {
        if ('category' === dropdown) { // category
            //Update model
            var categoryObj = $scope.categoryList.find(x => x.categoryId === $scope.selected.category.id);
            if (categoryObj && $scope.selected) {
                if ($scope.selected.category) {
                    $scope.selected.category.id = categoryObj.categoryId;
                    $scope.selected.category.name = categoryObj.categoryName;
                    $scope.selected.category.description = categoryObj.description;
                }
                else {
                    $scope.selected.category = {
                        "id": categoryObj.categoryId,
                        "name": categoryObj.categoryName,
                        "description": categoryObj.description
                    }
                }
                $scope.selected.subCategory = {};
                GetItemSubCategory();
            }
        } else if ('subCategory' === dropdown) { // subCategory
            var list = $scope.SubCategory.find(x => x.id === $scope.selected.subCategory.id);
            if (list) {
                $scope.selected.subCategory = angular.copy(list);
                $scope.selected.depriciationRate = list.annualDepreciation;
                $scope.selected.itemUsefulYears = list.usefulYears;
            }
        } else { // condition
            angular.forEach($scope.ConditionList, function (item) {
                if ($scope.selected.condition.conditionId == item.conditionId) {
                    $scope.selected.condition.conditionName = item.conditionName;
                }
            });
        }
    }

    // $scope.changeSelection = changeSelection;
    // function changeSelection(conditionId) {
    //     angular.forEach($scope.ConditionList, function (item) {
    //         if (conditionId == item.conditionId) {
    //             $scope.selected.condition.conditionId = item.conditionId;
    //             $scope.selected.condition.conditionName = item.conditionName;
    //         }
    //     });
    // }

    var deletedItemAttachments = [];
    $scope.removeattchment = removeattchment;
    function removeattchment(deletedImage) {
        $("#ItemFileUpload").val('');
        if (deletedImage && $scope.ItemFiles.length > 0) {
            if (!deletedImage.isLocal && angular.isDefined(deletedImage.imageId)) {
                deletedItemAttachments.push({
                    "id": deletedImage.imageId,
                    "imageUID": deletedImage.imageUID
                });
            }
            var index = $scope.ItemFiles.findIndex(file => file.imageId === deletedImage.imageId);
            if (index > -1)
                $scope.ItemFiles.splice(index, 1);
        }
        $scope.AddItemForm.$setDirty();
        $scope.close();
    }

    $scope.GetDocxDetails = function (item) {
        $scope.pdf = true;
        $scope.currentPDFUrl = $scope.pdfUrl;
        $scope.pageToDisplay = 1;
        $scope.pageNum = 1;
        $scope.isPDF = 0;
        $scope.DocxDetails = item;
        if ($scope.DocxDetails.isLocal) {
            $scope.showButton = false;
            $scope.DocxDetails.url = item.Image;
        } else
            $scope.showButton = true;
        $scope.ReceiptList = $scope.DocxDetails.url;
        $scope.pdfUrl = $scope.ReceiptList;
        var pdf = ["pdf", "application/pdf"];
        var img = ["image", "application/image", "image/png", "image/jpeg", "image/jpg", "image/gif", "png", "jpg", "jpeg", "gif", "image", "PNG", "JPEG", "GIF", "JPG"];
        $scope.imgDiv = true;
        if (pdf.indexOf((($scope.DocxDetails.FileType ? $scope.DocxDetails.FileType : $scope.DocxDetails.type).toLowerCase())) > -1) {
            $scope.isPDF = 1;
        }
        else if (img.indexOf((($scope.DocxDetails.FileType ? $scope.DocxDetails.FileType : $scope.DocxDetails.type).toLowerCase())) > -1) {
            $scope.isPDF = 2;
        }
        else {
            $scope.isPDF = 0;
            var downloadLink = angular.element('<a></a>');
            downloadLink.attr('href', $scope.DocxDetails.url);
            downloadLink.attr('target', '_self');
            downloadLink.attr('download', (($scope.DocxDetails.FileName != null && angular.isDefined($scope.DocxDetails.FileName) && $scope.DocxDetails.FileName !== "") ? $scope.DocxDetails.FileName : "Document"));
            downloadLink[0].click();
        }
        window.setTimeout(function () {
            $("#img_preview")
                // .css({
                //     'right': $('.page-wrapper-middle').offset().left + 'px'
                // })
                .show();
            // $("#img_preview").show();
        }, 100);
    }

    $scope.close = function () {
        $("#img_preview").hide();
        $scope.imgDiv = false;
    }

    var zoomFactor = 100;
    $scope.largeMe = largeMe;
    function largeMe() {
        zoomFactor += 5;
        document.getElementById('imagepre').style.zoom = zoomFactor + "%";
    }

    $scope.smallMe = smallMe;
    function smallMe() {
        zoomFactor -= 5;
        document.getElementById('imagepre').style.zoom = zoomFactor + "%";
    }

    $scope.downloadFile = function (data) {
        fetch(data.url).then(function (t) {
            return t.blob().then((b) => {
                var a = document.createElement("a");
                a.href = URL.createObjectURL(b);
                a.setAttribute("download", data.FileName);
                a.click();
            }
            );
        });
    }
    // Attachments end
    function EditItemDetails(item) {
        $(".page-spinner-bar").addClass("hide");
        var getItemParam = {
            "itemId": item.id,
            "forEdit": true
        };
        var getItemDetailsOnId = AdjusterLineItemDetailsService.gteItemDetails(getItemParam);
        getItemDetailsOnId.then(function (success) {
            var claimItem = success.data.data;

            $scope.ItemFiles = [];
            angular.forEach(claimItem.attachments, function (attachment) {
                $scope.ItemFiles.push({
                    "FileName": attachment.name, "FileExtension": attachment.name.substr((attachment.name.lastIndexOf('.') + 1)), "FileType": attachment.type,
                    "Image": attachment.url, "File": attachment.url, "url": attachment.url, "imageId": attachment.id, "data": attachment.multiPartFiles, "purpose": attachment.filePurpose, "imageUID": attachment.imageUID
                })
            });
            $scope.selected = {};
            $scope.selected = claimItem;
            $scope.selected.description = decodeURIComponent($scope.selected.description);
            if ($scope.selected.category) {
                $scope.selected.category.aggregateLimit = $scope.selected.categoryLimit;
            }
            $scope.selected.shippingDate = $filter('formatDate')((angular.isDefined($scope.selected.shippingDate) && $scope.selected.shippingDate !== null && $scope.selected.shippingDate != "") ? $filter('DateFormatMMddyyyy')($scope.selected.shippingDate) : null);
            $scope.selected.shippingMethod = {
                "id": ((angular.isDefined($scope.selected.shippingMethod) && $scope.selected.shippingMethod !== null) ? $scope.selected.shippingMethod.id : null)
            };
            $scope.selected.appraisalDate = $filter('formatDate')((angular.isDefined($scope.selected.appraisalDate) && $scope.selected.appraisalDate !== null && $scope.selected.appraisalDate != "") ? $filter('DateFormatMMddyyyy')($scope.selected.appraisalDate) : null);
            GetItemSubCategory();
            $scope.selected.room = {
                "id": claimItem.room ? claimItem.room.id : null,
                "roomName": claimItem.room ? claimItem.room.roomName : null
            }
            if (claimItem.originallyPurchasedFrom) {
                var index = $scope.Retailers.findIndex(retailer => retailer.name === claimItem.originallyPurchasedFrom.name);
                if (index <= -1)
                    getRetailers();
                $scope.selected.originallyPurchasedFrom = {
                    "id": claimItem.originallyPurchasedFrom ? claimItem.originallyPurchasedFrom.id : null,
                    "name": claimItem.originallyPurchasedFrom ? claimItem.originallyPurchasedFrom.name : null
                }
                if (claimItem.originallyPurchasedFrom.name === 'Other')
                    $scope.selected.addOtherRetailer = true;
            }
            $scope.selected.purchaseMethod = claimItem.purchaseMethod ? claimItem.purchaseMethod : null;
            $scope.selected.giftFrom = claimItem.giftedFrom ? claimItem.giftedFrom : null;
            DisableItemArrows(item);
        });
    };

    $scope.NextStep = false;
    $scope.PrevStep = false;
    $scope.DisableItemArrows = DisableItemArrows;
    function DisableItemArrows(item) {
        if ($scope.FiletrLostDamageList.length > 1) {
            let index = $scope.FiletrLostDamageList.findIndex(originalItem => originalItem.id === item.id);
            if (index == 0) {
                $scope.PrevStep = false;
                $scope.NextStep = true;
            }
            else if (index == $scope.FiletrLostDamageList.length - 1) {
                $scope.NextStep = false;
                $scope.PrevStep = true;
            }
            else {
                $scope.NextStep = true;
                $scope.PrevStep = true;
            }
        }
    }

    $scope.ChangePreviousItem = ChangePreviousItem;
    function ChangePreviousItem($event) {
        let index = $scope.FiletrLostDamageList.findIndex(item => item.id === $scope.selected.id);
        if (index > 0) {
            $scope.CalculateRCV($scope.selected.id, function () {
                EditItemDetails($scope.FiletrLostDamageList[index - 1]);
            });
        }
    }

    $scope.ChangeNextItem = ChangeNextItem;
    function ChangeNextItem($event) {
        let index = $scope.FiletrLostDamageList.findIndex(item => item.id === $scope.selected.id);
        if (index < $scope.FiletrLostDamageList.length - 1) {
            $scope.CalculateRCV($scope.selected.id, function () {
                EditItemDetails($scope.FiletrLostDamageList[index + 1]);
            });
        }
    }

    $scope.isPdf = function (fileName) {
        if (/\.(pdf|PDF)$/i.test(fileName)) {
            return true;
        }
    }

    $scope.isImage = function (fileName) {
        if (/\.(jpe?g|png|gif|bmp)$/i.test(fileName)) {
            return true;
        }
    }

    $scope.isExcel = function (fileName) {
        if (/\.(xls|xlsx)$/i.test(fileName)) {
            return true;
        }
    }

    $scope.isDocx = function (fileName) {
        if (/\.(docx|doc)$/i.test(fileName)) {
            return true;
        }
    }

    // Get List of Condition
    function getCondition() {
        var getpromise = AdjusterLineItemDetailsService.getCondition();
        getpromise.then(function (success) {
            $scope.ConditionList = success.data.data;
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    }

    $scope.playVideoOnDblClick = function () {
        // var urlStr = $scope.selected.videoLink;
        // if (urlStr != null && !urlStr.includes("http")) {
        //     urlStr = "https://" + $scope.selected.videoLink;
        // }
        // $window.open(urlStr, '_blank');
        $scope.videoDiv = true;
        if ($scope.selected.videoLink.includes("watch?v=")) {
            $scope.givenURL = $scope.selected.videoLink.replace("watch?v=", "embed/");
        }
        $scope.givenURL = $sce.trustAsResourceUrl($scope.givenURL);
        window.setTimeout(function () {
            $("#video_preview")
                .css({
                    'right': $('.page-wrapper-middle').offset().left + 'px'
                })
                .show();
            // $("#img_preview").show();
        }, 100);
    };
    $scope.clearVideoLink = function () {
        $scope.selected.videoLink = "";
    };
    $scope.editVideoLink = function () {
        $scope.videoLinkEditable = true;
    };
    $scope.playVideo = function () {
        $scope.videoLinkEditable = false;
    };
    $scope.closeVideoPreview = closeVideoPreview;
    function closeVideoPreview() {
        $scope.videoDiv = false;
        $("#video_preview").hide();
    }
    $scope.addNewRetailerField = function () {
        $scope.selected.originallyPurchasedFrom = null;
        $scope.selected.addOtherRetailer = true;
    }

    $scope.getnewRoom = getnewRoom;
    function getnewRoom(){
        angular.forEach($scope.roomTypes, function (room) {
            if(room.id === $scope.selected.roomType)
            $scope.SelectedRoom=room;
        });
    
        var param =
        { 
        "claim":{ "claimNumber": $scope.popupObj.ClaimNumber},
        "roomType":$scope.SelectedRoom,
            "roomName":$scope.newRoomName
        };
        var getpromise = AdjusterPropertyClaimDetailsService.getRoom(param);
        getpromise.then(function (success) {
            console.log(success.data.data)
            $scope.roomList=success.data.data;
            $scope.addRoom=success.data;
        getRooms();
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });  
        
    }

    $scope.getroomTypes=getroomTypes;
    function getroomTypes(){
        $scope.newRoom = true;
        var getpromise = AdjusterPropertyClaimDetailsService.getRoomType();
        getpromise.then(function (success) {
            $scope.roomTypes = success.data.data;
            //$scope.roomName = '';
        
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });  

    }
})
