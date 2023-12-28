/* Setup blank page controller */
angular.module('MetronicApp').controller('AdjusterLineItemDetailsController', function ($rootScope, $q, $window, $scope, settings, $uibModal,
    $location, $translate, $translatePartialLoader, AdjusterLineItemDetailsService, PolicyHolderClaimDetailsService, AdjusterPropertyClaimDetailsService, $filter, LineItemsFactory, utilityMethods,
    $timeout, $sce, LineItemService, StatusConstants, ItemDetailService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    //set language
    $translatePartialLoader.addPart('AdjusterLineItemDetails');
    $translate.refresh();
    $scope.tab = "Contents";
    $scope.NoImagePath = $rootScope.settings.NoImagePath;
    $scope.Notes = [];
    $scope.FiletrLostDamageList = [];
    $scope.NoteDetails = {};
    $scope.CategoryList = "";
    $scope.Category = "";
    $scope.SubCategoryList = [];
    $scope.copySubCategoryList = [];
    $scope.SubCategory = "";
    $scope.ErrorMessage = "";
    $scope.ClaimParticipantsList = [];
    $scope.ParticipantName = "";
    $scope.ConditionList = [];
    $scope.OriginalRCVOfItem = 0.0;
    $scope.OriginalACVOfItem = 0.0;
    $scope.Comparables = {};
    $scope.AddedComparables = [];
    //From google
    $scope.ReplacementSuplier = []; false
    $scope.GoogleComparableList = [];
    //Sort options for dropdown
    $scope.SortOptions = [{ Id: '-price', Value: "Price-Low TO High" }, { Id: '+price', Value: "Price-High To Low" }];
    $scope.sortcolumn = '-price';
    // Item details object and image object
    $scope.ItemDetails = {};
    $scope.images = [];
    //Serch variables for google
    $scope.displayEmptyPart = true;
    $scope.displaycomparables = false;
    $scope.displayReplacement = false;
    $scope.dispalyAddedComparables = false;
    $scope.NextStep = false;
    $scope.PrevStep = false;
    $scope.isQuote = false;
    $scope.statuslist = [{ id: true, status: 'Yes' }, { id: false, status: 'No' }];
    $scope.accessComparable = sessionStorage.getItem("accessComparable") && sessionStorage.getItem("accessComparable")=="true" ? true : false;
    // Omni search
    $scope.fromSearch = false;
    $scope.fromPeopleDetails = false;
    $scope.bestBuyUrl = sessionStorage.getItem("bestbuyUrl");
    $scope.sortString = "sort=regularPrice.dsc,bestSellingRank.dsc";
    $scope.moreBestBuyResult = true;
    $scope.RoomsList = [];
    $scope.Retailers = [];
    $scope.newRetailer = {
        addOtherRetailer: false
    };
    $scope.paymentTypes = [];
    $scope.color = ["#ABB5BE", "#C9F1FD", "#FEFCE0", "#f7bec5", "#bdb9f7", "#85f7cb", "#f4d28d", "#f78a74", "#abef97", "#f9f17a"];
    $scope.left = ["0px", "-60px", "-60px", "-60px", "-60px", "-60px", "-60px", "-60px", "-60px", "-60px"];
    $scope.zindex = ["10", "9", "8", "7", "6", "5", "4", "3", "2", "1"];
    $scope.defaultRecepients = [];
    $scope.isAllNotes = false;
    $scope.reply = {
        "message": null,
        "uploadedMessageFiles": []
    };
    $scope.videoLinkEditable = true;
    $scope.videoDiv = false;
    $scope.pageSize = 10;
    $scope.totalPages = 0;
    $scope.pager = {};
    $scope.setPageCalled = false;
    $scope.pageIndex = parseInt(sessionStorage.getItem("pageIndex"))
    //Item form object
    $scope.itemForm = {};
    $scope.constants = {
        itemStatus: StatusConstants.ItemStatus,
        invoiceStatus: StatusConstants.InvoiceStatus,
    };

    $scope.google = true;
    $scope.amazon = false;
    $scope.ebay = false;
    $scope.pageNumber = 1;
    // $scope.Searchoptions = [1];
    $scope.noMoreResults = false;
    $scope.searchEngines = [{ id: "10", name: "Google Shopping" },{ id: "1", name: "Google" }, { id: "2", name: "Amazon" }, { id: "3", name: "Ebay" }];
    $scope.searchEngine ="10";
    $scope.acceptedStandardCost = false;
    $scope.addStandardCostasReplacement = false;

    $scope.reCheckSearchCount = 0;

    $scope.formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    //Replacement / Cash payout exposure
    // $scope.ItemDetails.cashPayoutExposure = 0.0;
    // $scope.ItemDetails.replacementExposure = 0.0;
    // //Home owners policy category limit
    // var hoPolicyCategoriesList = [];
    // var hoPolicyCategory = null;
    $scope.saveItem = false;
    $scope.noItemFound = false;
    $scope.websearchMarkReplItem = false;

    function init() {
        $(".page-spinner-bar").removeClass("hide");
        $scope.attachmentList = [];
        $scope.attachmentListEdit = [];
        $scope.GoogleComparableList = [];
        $scope.CommonObj = {
            ClaimNumber: sessionStorage.getItem("ClaimNo"),
            ClaimId: sessionStorage.getItem("ClaimId"),
            ClaimProfile: sessionStorage.getItem("claimProfile"),
            ItemNote: "",
            SearchComparables: "",
            ItemId: sessionStorage.getItem("AdjusterPostLostItemId"),
            itemUID:"",
            claimsNote: "",
            ParticipantId: null,
            UserId: sessionStorage.getItem("UserId"),
            AssignmentNumber: sessionStorage.getItem("AssignmentNumber"),
            policyNumber: sessionStorage.getItem("PolicyNo"),
        };
        // getAllHOPolicyCategories();
        GetPolicyHolderDetails();
        getRooms();
        getRetailers();
        getPostLostItems();
        if ($scope.CommonObj.ClaimProfile != 'Contents')
            GetShippingMethods();
        getCondition();
        //get category list #29
        var getCategories = AdjusterLineItemDetailsService.getCategory();
        getCategories.then(function (success) {
            $scope.CategoryList = success.data.data;
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

        //GetReplacementSupplier
        var GetReplacementSuplier = AdjusterLineItemDetailsService.GetReplacementSupplier();
        GetReplacementSuplier.then(function (success) {
            $scope.ReplacementSuplier = success.data.data;
            angular.forEach($scope.ReplacementSuplier, function (item) {
                item.isSelected = true;
            })
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
        if (sessionStorage.getItem("refferer") === "SEARCH_RESULT")
            $scope.fromSearch = true;
        else if (sessionStorage.getItem("refferer") === "PEOPLE_DETAILS") {
            $scope.fromSearch = true;
            $scope.fromPeopleDetails = true;
        } else {
            $scope.fromSearch = false;
            $scope.fromPeopleDetails = false;
        }
        var ActiveTab = sessionStorage.getItem("ActiveTab");
        if (ActiveTab) {
            // var ActiveTab = sessionStorage.removeItem("ActiveTab");
            $scope.tab = ActiveTab;
        }

        $scope.googleShoppingDropdown = sessionStorage.getItem("googleShoppingDropdown");
        if($scope.googleShoppingDropdown == "false"){
            $scope.searchEngines.splice(0,1);
            $scope.searchEngine ="1";
        }
    }
    //ACV calclulation
    $scope.ItemDetails.rcvTax = 0.0;
    $scope.ItemDetails.acvTotal = 0.0;
    init();

    //get item details on itemId
    function getItemDetails() {
        $(".page-spinner-bar").removeClass("hide");
        $scope.ItemDetails = {};
        $scope.Comparables = {};
        $scope.markedProductList = [];
        var param = {
            "itemId": $scope.CommonObj.ItemId
        };
        var getItemDetailsOnId = AdjusterLineItemDetailsService.gteItemDetails(param);
        getItemDetailsOnId.then(function (success) {
            $scope.ItemDetails = success.data.data;
            // Set Default condition - Very Good
            if ($scope.ItemDetails.condition == null) {
                $scope.ItemDetails.condition = { "conditionId": 3, "conditionName": "Very Good" }
            }
            $scope.CommonObj.itemUID = $scope.ItemDetails.itemUID
            //$scope.ItemDetails.description = decodeURIComponent($scope.ItemDetails.description);
            //$scope.CommonObj.description = decodeURIComponent($scope.ItemDetails.description.replace(/\+/g, " "));
            $scope.CommonObj.description = $scope.ItemDetails.description;

            sessionStorage.setItem("AdjusterPostLostItemId", $scope.CommonObj.ItemId)
            // If serviceRequest is of salvgetItemDeage then redirect the user to salvage tab
            if (sessionStorage.getItem("ForwardTab") && sessionStorage.getItem("ForwardTab").toLowerCase() === 'notes')
                showMessages();
            else if (($scope.ItemDetails.contentService != null ? $scope.ItemDetails.contentService.service === 'Salvage Only' : false) || (sessionStorage.getItem("ForwardTab") != null && sessionStorage.getItem("ForwardTab").toLowerCase() === 'salvage'))
                $scope.tab = 'Salvage';
                sessionStorage.setItem('tab', 'Salvage');
            if ($scope.ItemDetails.status.id === 6) {
                $scope.isQuoteSubmittedByVendor = true;
            } else {
                $scope.isQuoteSubmittedByVendor = false;
            }
            if (angular.isDefined($scope.ItemDetails.assignmentDetails) && $scope.ItemDetails.assignmentDetails != null) {
                if (angular.isDefined($scope.ItemDetails.assignmentDetails.assignmentNumber)) {
                    sessionStorage.setItem("assignmentNumber", angular.isUndefined($scope.ItemDetails.assignmentDetails.assignmentNumber) ? 0 : $scope.ItemDetails.assignmentDetails.assignmentNumber);
                }
            }

            // CTB-2684
            if (angular.isDefined($scope.ItemDetails) && $scope.ItemDetails.paymentDetails != null) {
                $scope.ItemDetails.paymentDetails.checkDate = $filter('DateFormatMMddyyyy')($scope.ItemDetails.paymentDetails.checkDate);
            }
            // end of CTB-2684
            if($scope.ItemDetails.status.status !== $scope.constants.itemStatus.underReview)
            {
            $scope.ItemDetails.appraisalDate = (angular.isDefined($scope.ItemDetails) && $scope.ItemDetails.appraisalDate != null) ? ($filter('DateFormatMMddyyyy')($scope.ItemDetails.appraisalDate)) : ($filter('TodaysDate')());
            $scope.ItemDetails.shippingDate = (angular.isDefined($scope.ItemDetails) && $scope.ItemDetails.shippingDate != null) ? ($filter('DateFormatMMddyyyy')($scope.ItemDetails.shippingDate)) : ($filter('TodaysDate')());
          
            }
            $scope.newRetailer.addOtherRetailer = $scope.ItemDetails.originallyPurchasedFrom && $scope.ItemDetails.originallyPurchasedFrom.name === 'Other' ? true : false;
            if ($scope.ItemDetails.status && $scope.ItemDetails.status.status === 'VALUED' && !$scope.ItemDetails.isReplaced) {
                $scope.previousValue = $scope.ItemDetails.insuredPrice && $scope.ItemDetails.rcvTotal ? $scope.ItemDetails.insuredPrice : 0;
            }
            if ($scope.ItemDetails.itemOverage < 0)
                $scope.ItemDetails.itemOverage = 0;
            $scope.ItemDetails.videoLink = $scope.ItemDetails.videoLink ? $scope.ItemDetails.videoLink : "";
            //$scope.ItemDetails.dateOfPurchase = $filter('DateFormatMMddyyyy')($scope.ItemDetails.dateOfPurchase);
            $scope.CommonObj.SearchComparables = angular.copy(success.data.data.description)
            var percentage = $scope.ItemDetails.insuredPrice * 20 / 100;
            $scope.CommonObj.priceFrom = utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.insuredPrice - percentage > 0 ? $scope.ItemDetails.insuredPrice - percentage : 0);
            var maxPriceTo = utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.insuredPrice + percentage)
            if (maxPriceTo != 0) {
                $scope.CommonObj.priceTo = maxPriceTo;
            }
            $scope.CalculateTotalStatedValue();
            //get images of item
            if (angular.isDefined($scope.ItemDetails.assignedTo) && $scope.ItemDetails.assignedTo !== null)
                $scope.AssignedName = (angular.isDefined($scope.ItemDetails.assignedTo.firstName) ? $scope.ItemDetails.assignedTo.firstName : "") + " " + (angular.isDefined($scope.ItemDetails.assignedTo.lastName) ? $scope.ItemDetails.assignedTo.lastName : "");
            else
                $scope.AssignedName = ""
            // get compairables stored in database and insrt in list Comparables
            $scope.Comparables = {
                comparableItems: $scope.ItemDetails.comparableItems
            }
            mapComparables();
            if($scope.GoogleComparableList.length ===0)
            {
            if ($scope.ItemDetails.status.status != $scope.constants.itemStatus.underReview) {
                $scope.GoogleComparableList = [];
                $scope.pageNumber = 1;
                $scope.retainedSearchEngineId = sessionStorage.getItem("currentEngineId") && sessionStorage.getItem("currentEngineId")!="undefined" ? sessionStorage.getItem("currentEngineId") : $scope.searchEngine;
                SearchReplacement($scope.retainedSearchEngineId);
            } else {
                $scope.GoogleComparableList = [];
            }
           }
            // var GetImageOfItem = AdjusterLineItemDetailsService.gteItemImagess(param);
            // GetImageOfItem.then(function (success) {
            //     $scope.images = success.data.data;
            // }, function (error) {
            //     $(".page-spinner-bar").addClass("hide");
            //     $scope.ErrorMessage = error.data.errorMessage;
            // });

            // Set Temp Category of previous item selection
            if ($scope.ItemDetails.category == null) {
                $scope.ItemDetails.category = $scope.tempCategory;
            } else {
                $scope.tempCategory = $scope.ItemDetails.category;
            }
            getAttachment($scope.ItemDetails.attachments);
            //Get Item Participants
            getItemParticipants();
            //Get payment Details for vendor
            // var GetInvoice = AdjusterLineItemDetailsService.getInvoiceList(param);
            // GetInvoice.then(function (invoices) { $scope.InvoiceDetails = invoices.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

            // var getReciptList = AdjusterLineItemDetailsService.getReceiptList(param);
            // getReciptList.then(function (recipts) { $scope.ReceiptList = recipts.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

            // var GetInvoicList = SupervisorLineItemDetailsService.getInvoiceListByItem(param);
            // GetInvoicList.then(function (invoiceList) {
            //     $scope.InvoiceLIst = invoiceList.data.data;
            // }, function (error) {
            //     $(".page-spinner-bar").addClass("hide");
            //     $scope.ErrorMessage = error.data.errorMessage;
            // });  
            $scope.ItemDetails.source = $scope.ItemDetails.source ? $scope.ItemDetails.source : null;
            $scope.ItemDetails.replacementQty =    $scope.ItemDetails.replacementQty?$scope.ItemDetails.replacementQty:0;
            $scope.ItemDetails.replacedItemPrice =!! $scope.ItemDetails.replacedItemPrice?$scope.ItemDetails.replacedItemPrice:$scope.ItemDetails.rcv;
            $scope.ItemDetails.imageURL = !!$scope.ItemDetails.imageURL ? $scope.ItemDetails.imageURL : "assets/global/img/no-image.png";
            if($scope.markedProductList && $scope.markedProductList.length <=0 && $scope.ItemDetails.isReplaced && ($scope.ItemDetails.status.status == 'VALUED' || $scope.ItemDetails.status.status == 'PARTIAL REPLACED' || $scope.ItemDetails.status.status == 'PAID' || $scope.ItemDetails.status.status == 'REPLACED' || $scope.ItemDetails.status.status == 'SETTLED')){
                $scope.ItemDetails.replacementQty = !!$scope.ItemDetails.replacementQty? $scope.ItemDetails.replacementQty: $scope.ItemDetails.quantity;
                $scope.acceptedStandardCost = true;
                $scope.isReplaced = true;
            }
            GetSubCategory();

            if($scope.tab=='Salvage'){
                $scope.$broadcast ('getSalvageDetails');
            }

            setTimeout(() => {
                $(".page-spinner-bar").addClass("hide");
            }, 1000);            
        }, function (error) {
            if (error.data.errorCode == 400203) {
                $location.url("/AdjusterPropertyClaimDetails");
            }
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }

    function mapComparables() {
        var itemToMove = null;
        angular.forEach($scope.Comparables.comparableItems, function (item) {
            item.imageURL = !!item.imageURL ? item.imageURL : "assets/global/img/no-image.png";
            if (item.isReplacementItem) {
                $scope.ItemDetails.isReplaced = true;
                $scope.markedProductList = [];
                
                // Jewelry Updated
                item.imageURL = !!item.imageURL ? item.imageURL : "assets/global/img/no-image.png";
                
                if($scope.CommonObj.ClaimProfile=="Jewelry" && item.customItem && !item.customItemDetail){
                    item.subJewelryReplacements.map((x)=>{
                        x.totalReplacementPrice = Number( x.totalReplacementPrice).toFixed(2);
                    });
                    $scope.ItemDetails.subTotal = Number(item.price).toFixed(2);
                    $scope.ItemDetails.taxAmount = Number(item.taxesVal).toFixed(2);
                    $scope.ItemDetails.tax=Number(item.taxRate).toFixed(2);
                    $scope.ItemDetails.rcvJwlTotal = Number(item.totalReplacementPrice).toFixed(2);                
                    $scope.ItemDetails.customCharges = Number(item.customCharges).toFixed(2);
                    $scope.ItemDetails.laborCharges = Number(item.labourCharges).toFixed(2);
                    $scope.ItemDetails.customChargesNote = item.customChargesNote;
                    $scope.ItemDetails.labourChargesNote = item.labourChargesNote;
                    calculateTaxForCustomJewelryItems();
                    $scope.ItemDetails.imageURL = !!item.imageURL ? item.imageURL : "assets/global/img/no-image.png";
                    angular.forEach(item.subJewelryReplacements,(component)=>{
                        if(!(!!component.imagesDTOSet)){
                            component.imagesDTOSet =[
                                {"url" :  (component.imageUrl == undefined || component.imageUrl == null || component.imageUrl =="") ? "assets/global/img/no-image.png" : component.imageUrl
                            }]
                        }

                        // subItems
                        angular.forEach(component.subItems,(sItem)=>{
                            if(!(!!sItem.imagesDTOSet)){
                                sItem.imagesDTOSet =[
                                {"url" : (sItem.imageUrl == undefined || sItem.imageUrl == null || sItem.imageUrl =="") ? "assets/global/img/no-image.png" : sItem.imageUrl
                                }]
                            }
                        });
                    })
                }


                $scope.markedProductList.push(item);
                itemToMove = item;
                
                $scope.ItemDetails.adjusterDescription = item.description;
                $scope.ItemDetails.source = item.buyURL;
                $scope.isReplaced = true;
                $scope.ItemDetails.replacedItemPrice = item.unitPrice;
                $scope.ItemDetails.replacementQty = item.quantity ?? 1;
                $scope.CalculateRCV();
            }
            item.isDelete = item.isDelete ? true : false;
            item.price = item.unitPrice;
        });
        if (itemToMove != null) {
            $scope.Comparables.comparableItems.sort(function (x, y) { return x == itemToMove ? -1 : y == itemToMove ? 1 : 0; });
        }
        if ($scope.Comparables != null && $scope.Comparables.comparableItems != null) {
            $scope.AddedComparables = $scope.Comparables.comparableItems;
        } else {
            $scope.AddedComparables = [];
        }
        $scope.dispalyAddedComparables = false;
        if ($scope.Comparables.comparableItems != null) {
            $scope.displaycomparables = true;
            $scope.displayEmptyPart = false;
        }
        else {
            $scope.displaycomparables = false;
            // $scope.displayEmptyPart = true;
        }
    }

    $scope.calculateTaxForCustomJewelryItems = calculateTaxForCustomJewelryItems;
    function calculateTaxForCustomJewelryItems(){
        $scope.markedProductList.forEach((item)=>{
            $scope.ItemDetails.taxAmount = Number(item.taxesVal).toFixed(2);
            if( $scope.ItemDetails.taxAmount ==0)
            {
                $scope.ItemDetails.taxAmount = Number($scope.ItemDetails.subTotal * ($scope.ItemDetails.taxRate / 100)).toFixed(2);
            }
            if($scope.ItemDetails.applyTax) {
                $scope.ItemDetails.rcvTotal = Number(item.totalReplacementPrice).toFixed(2);
                $scope.ItemDetails.tax =$scope.ItemDetails.taxRate;
                }
            else{
                $scope.ItemDetails.rcvTotal = Number(item.totalReplacementPrice).toFixed(2)- $scope.ItemDetails.taxAmount     
                $scope.ItemDetails.taxAmount = 0;
                $scope.ItemDetails.tax ="0.00";
            }
        });
    }

    function getItemParticipants() {
        var getpromise = AdjusterLineItemDetailsService.getItemParticipants($scope.ItemDetails.id);
        getpromise.then(function (success) {
            $scope.ClaimParticipantsList = success.data.data;
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    }
    // Get List of Condition
    $scope.getCondition = getCondition;
    function getCondition() {
        var getpromise = AdjusterLineItemDetailsService.getCondition();
        getpromise.then(function (success) {
            $scope.ConditionList = success.data.data;
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    }

    $scope.changeCondition = changeCondition;
    function changeCondition(conditionId) {
        angular.forEach($scope.ConditionList, function (item) {
            if (item.conditionId == conditionId) {
                $scope.ItemDetails.condition.conditionName = item.conditionName;
            }
        });
    }

    //go back function
    $scope.goBack = goBack;
    function goBack(e) {
        sessionStorage.removeItem("ForwardTab");
        $location.url('AdjusterPropertyClaimDetails');
    };


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
    //GotoMyClaim()
    $scope.GotoDashboard = GotoDashboard;
    function GotoDashboard() {
        sessionStorage.removeItem("refferer");
        sessionStorage.removeItem("ForwardTab");
        LineItemsFactory.removeAll();
        $location.url(sessionStorage.getItem('HomeScreen'));
    };

    //open model item value
    $scope.openValueModel = openValueModel;
    function openValueModel() {
        var ItemDetails = {
            "ItemId": $scope.ItemDetails.id,
            "ItemName": $scope.ItemDetails.itemName,
            "quotedPrice": $scope.ItemDetails.totalStatedAmount,
            "IsReplaced": $scope.ItemDetails.isReplaced,
            "depriciationRate": $scope.ItemDetails.depriciationRate,
            "totalTax": $scope.ItemDetails.totalTax,
            "acv": $scope.ItemDetails.acv, "taxRate": $scope.ItemDetails.taxRate, "TotalValue": $scope.ItemDetails.rcvTotal, "rcv": $scope.ItemDetails.rcv
        };
        $scope.animationsEnabled = true;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/Adjuster/ItemValue.html",
                controller: "ItemValueController",
                backdrop: 'static',
                keyboard: false,
                resolve:
                {
                    items: function () {
                        return ItemDetails;
                    }
                }

            });
        out.result.then(function (value) {
            if (value === "Success") {
                var param = {
                    "itemId": $scope.CommonObj.ItemId
                };
                var getItemDetailsOnId = AdjusterLineItemDetailsService.gteItemDetails(param);
                getItemDetailsOnId.then(function (success) {
                    $scope.ItemDetails = success.data.data;

                    // Set Default condition - Very Good
                    if ($scope.ItemDetails.condition == null) {
                        $scope.ItemDetails.condition = { "conditionId": 3, "conditionName": "Very Good" }
                    }

                    GetSubCategory();
                    if ($scope.ItemDetails.assignedTo !== null)
                        $scope.AssignedName = $scope.ItemDetails.assignedTo.firstName + " " + $scope.ItemDetails.assignedTo.lastName;
                    else
                        $scope.AssignedName = ""
                    $scope.CommonObj.SearchComparables = angular.copy($scope.ItemDetails.description)
                }, function (error) {
                    $scope.ErrorMessage = error.data.errorMessage;
                });
            }
            //Call Back Function success
        }, function () {

        });
        return {
            open: open
        };
    }
    // *************Add delete comparable form DBlist********************
    $scope.DeletItem = DeletItem;
    function DeletItem(ev) {
        bootbox.confirm({
            size: "",
            closeButton: false,
            title: "Delet Lost/Damaged Item ",
            message: "Are you sure you want to delete this item?  <b>Please Confirm!",
            className: "modalcustom", buttons: {
                confirm: {
                    label: 'Yes',
                    className: 'btn-outline green'
                },
                cancel: {
                    label: 'No',
                    className: 'btn-outline red'
                }
            },
            callback: function (result) {
                //if (result)  call delet function
                if (result) {
                    var param = {
                        "id":$scope.CommonObj.ItemId,
                        "itemUID":$scope.CommonObj.itemUID
                    }
                    var deleteitem = AdjusterLineItemDetailsService.deleteLineItem(param);
                    deleteitem.then(function (success) {
                        $scope.Status = success.data.status;
                        if ($scope.Status === 200) {
                            toastr.remove()
                            toastr.success(success.data.message, "Success");

                            $location.path("/AdjusterPropertyClaimDetails");
                        }
                    }, function (error) {
                        toastr.remove()
                        toastr.error(error.data.errorMessage, "Error");
                        $scope.ErrorMessage = error.data.errorMessage;
                    });

                }
            }
        });
    }

    $scope.saveItem = false;

    //Delete comparables fro list
    $scope.DeletedComparables = [];
    $scope.DeleteComparable = DeleteComparable;
    function DeleteComparable(comp) {
        comp.delete = true;
        $scope.DeletedComparables.push(comp);
        $scope.Comparables.comparableItems.splice($scope.Comparables.comparableItems.indexOf(comp), 1);
        $scope.AddedComparables = $scope.Comparables.comparableItems//splice($scope.AddedComparables.indexOf(comp), 1);
        $scope.CalculateRCV();
    }

    //Mark as replacement list
    $scope.MarkAsReplacement = MarkAsReplacement;
    function MarkAsReplacement(comp) {
        $scope.ItemDetails.replacementQty = !!comp.quantity ? comp.quantity: $scope.ItemDetails.quantity;
        if ($scope.SubCategoryList
            && $scope.ItemDetails.subCategory && $scope.ItemDetails.subCategory.id) {
            var subcategory = $scope.SubCategoryList.find(x => x.id == $scope.ItemDetails.subCategory.id);
           // var subcategory = $scope.SubCategoryList.find(x => x.id === $scope.ItemDetails.subCategory.id);

           if(subcategory.associateSubCat && subcategory.associateSubCat!=""){
           
               if(comp.price<subcategory.minPricePoint || comp.price>subcategory.maxPricePoint){
                var subcat =$scope.SubCategoryList.find(x => x.associateSubCat == subcategory.associateSubCat && x.id!=subcategory.id)
                $timeout(function(){
                     $("#itemSubCategorySel").select2();
                     $("#floatingSubCatSel").select2();
                 },10)
 
                $scope.ItemDetails.subCategory.id = subcat?subcat.id:$scope.ItemDetails.subCategory.id;
 
               }
           }
           $scope.ItemDetails.replacedItemPrice = utilityMethods.parseFloatWithFixedDecimal(comp.price);
            
        $scope.markedProductList = [];
        angular.forEach($scope.Comparables.comparableItems, function (item) {
            item.isReplacementItem = false;

            // if (comp.id != item.id) {
            //     if (item.isReplacementItem == true) {
            //         item.isReplacementItem = false;

            //     }
            // }
            // else if (comp.id == item.id) {
            //     comp.isReplacementItem = true;
            //     $scope.ItemDetails.adjusterDescription = comp.description;
            //     $scope.markedProductList.push(comp);
            // }
        });
        $scope.markedProductList.push(comp);
        comp.isReplacementItem = true;
        $scope.ItemDetails.isReplaced = true;
        $scope.ItemDetails.adjusterDescription = comp.description;
        $scope.ItemDetails.source = comp.buyURL;
        $scope.isReplaced = true;
        $scope.saveItem = true;
        $scope.CalculateRCV();

        }
        else{
            $timeout( function(){
                toastr.warning("Please select subcategory","Warning", {timeOut: 5000});
            },0);

        $timeout( function(){
            document.getElementById('itemSubCategorySel').focus();
        },1000)

        }

    }

    $scope.addOrRemoveSearchEngine = function (engineId) {
        
        sessionStorage.setItem("currentEngineId", engineId);
        // $scope.Searchoptions = [];
        $scope.GoogleComparableList = [];
        $scope.pageNumber = 1;
        $scope.searchEngine = engineId === undefined ? $scope.searchEngine : engineId;
        // if (supplier == 1) {
        //     $scope.google = !$scope.google;
        //     $scope.amazon = false;
        //     $scope.ebay = false;
        //     if ($scope.google) {
        //         $scope.Searchoptions.push(1);
        //     }
        // } else if (supplier == 2) {
        //     $scope.google = false;
        //     $scope.amazon = !$scope.amazon;
        //     $scope.ebay = false;
        //     if ($scope.amazon) {
        //         $scope.Searchoptions.push(2);
        //     }
        // } else if (supplier == 3) {
        //     $scope.google = false;
        //     $scope.amazon = false;
        //     $scope.ebay = !$scope.ebay;
        //     if ($scope.ebay) {
        //         $scope.Searchoptions.push(3);
        //     }
        // }
        // angular.forEach($scope.ReplacementSuplier, function (item) {
        //     if (supplier.id == item.id) {
        //         item.isSelected = !supplier.isSelected;
        //     }
        //     if (item.isSelected) {
        //         $scope.Searchoptions.push(item.id);
        //     }
        // });
        SearchReplacement($scope.searchEngine);
    }

    // ************* End comparable form DBlist********************
    //*********************Googole search**********************************
    $scope.bestBuyKey = null;
    $scope.onEnterClick = function (engineId) {
        $scope.GoogleComparableList = [];
        $scope.pageNumber = 1;
        // $scope.searchEngine = engineId;
        SearchReplacement(engineId);
    }
   
    $scope.SearchReplacement = SearchReplacement;
    var GetGoogleCompairables;
    var canceler ;
    var priceFilter = "";
    function SearchReplacement(engineId) {
        //Get items if exists in dbcomparable list and add to addtocomparables list
        $scope.bestBuyComparables = [];
        $scope.IsLoading = true;
        // $(".page-spinner-bar").removeClass("hide");
        // if ($scope.Searchoptions.includes(1)) {
            //$scope.priceRange = true;
            // var percentage = $scope.ItemDetails.insuredPrice*20/100;
            // $scope.CommonObj.priceFrom = $scope.ItemDetails.insuredPrice-percentage>0?$scope.ItemDetails.insuredPrice-percentage:0;
            // $scope.CommonObj.priceTo = $scope.ItemDetails.insuredPrice+percentage;
        // }
        // if ($scope.Searchoptions.includes(2)) {
        //     //console.log("bestbuy");
        //     var searchstring = constructSearchURL($scope.CommonObj.SearchComparables);
        //     var url = "";
        //     priceFilter = "";
        //     if ($scope.CommonObj.priceTo)
        //         priceFilter = "&regularPrice>=" + $scope.CommonObj.priceFrom + "&regularPrice<=" + $scope.CommonObj.priceTo
        //     if ($scope.CommonObj.brand)
        //         priceFilter = priceFilter + "&manufacturer=" + $scope.CommonObj.brand
        //     if (!$scope.bestBuyKey) {
        //         var key = AdjusterLineItemDetailsService.getBestbuyKey()
        //         key.then(function (success) {
        //             $scope.bestBuyKey = success.data.data;
        //             url = $scope.bestBuyUrl + "((" + searchstring + ")" + priceFilter + ")?" + $scope.sortString + "&apiKey=" + $scope.bestBuyKey + "&format=json";
        //             bestbuyResult(url);
        //             //https://api.bestbuy.com/v1/products((search=check))?apiKey=AJOa71zSLPJlGRM4GE4igNFl&format=json
        //         }, function (error) {
        //             $scope.IsLoading = false;
        //             // $(".page-spinner-bar").addClass("hide");
        //             toastr.remove()
        //             toastr.error("could not get API key", $translate.instant("ErrorHeading"));
        //             // $scope.ErrorMessage = error.data.errorMessage;
        //         });
        //     } else {
        //         url = $scope.bestBuyUrl + "((" + searchstring + ")" + priceFilter + ")?" + $scope.sortString + "&apiKey=" + $scope.bestBuyKey + "&format=json";
        //         bestbuyResult(url);
        //     }

        // }
        if ($scope.Comparables !== null) {
            if ($scope.AddedComparables.length === 0) {
                angular.forEach($scope.Comparables.comparableItems, function (item) {
                    $scope.AddedComparables.push({
                        "id": item.id,
                        "description": item.description, "brand": item.brand, "model": item.model, "price": (item.price && (item.price.toString()).indexOf('$') > -1) ? item.price.split('$')[1] : item.price, "buyURL": item.buyURL,
                        "isDataImage": item.isDataImage, "supplier": item.supplier, "imageURL": ((item.imageData !== null) ? item.imageData : item.imageURL)
                    });
                });
            }
        }
        if ($scope.CommonObj.SearchComparables !== null && !angular.isUndefined($scope.CommonObj.SearchComparables) && $scope.CommonObj.SearchComparables !== "") {
            $scope.displaycomparables = false;
            $scope.displayReplacement = true;
            $scope.displayEmptyPart = false;
            $scope.dispalyAddedComparables = false;
            $scope.noMoreResults = false;
            // $scope.GoogleComparableList = [];
            // Get compaiables form google id will be google or amazon and many more
            // if ($scope.Searchoptions === null || $scope.Searchoptions.length === 0) {

            //     if ($scope.ReplacementSuplier.length > 0) {
            //         $scope.Searchoptions.push(parseInt($scope.ReplacementSuplier[0].id));
            //     }
            //     else
            //         $scope.Searchoptions = [1];
            // }
          
            var Searchstring = {
                "item": $scope.CommonObj.SearchComparables,
                "id": engineId && engineId!="undefined" ? engineId: $scope.searchEngine ,
                "numberOfCounts": 10,
                "priceFrom": $scope.CommonObj.priceFrom,
                "priceTo": $scope.CommonObj.priceTo,
                "brand": $scope.CommonObj.brand,
                "pincode": $scope.ItemDetails.policyHolderPinCode,
                "pageNo":$scope.pageNumber,
                "serfWowSearch":engineId==="10" || engineId===undefined || engineId=="undefined"?false:true,
                "ids":[1]
            };
            if (GetGoogleCompairables && canceler) {
                canceler.resolve();
            }
            canceler = $q.defer();
            GetGoogleCompairables = AdjusterLineItemDetailsService.GetComparableListFromGoogle(Searchstring,canceler);
            GetGoogleCompairables.then(function (success) {
                

                //We need to work here googleResults  amazonResults
                var listgooleComparable = [];
                console.log("success.data.data",(success.data.data!=null && success.data.data.searchResults!=null && success.data.data.searchResults.length!=0));
                if (success.data.data!=null && success.data.data.searchResults != null && success.data.data.searchResults.length!=0) {
                    angular.forEach(success.data.data.searchResults, function (item) {
                        var price = 0.00;
                        if (item.itemPrice) {
                            if ((item.itemPrice.toString()).indexOf('$') > -1) {
                                price = item.itemPrice.split('$')[1]
                                price = price.replace(',', '');
                            } else if ((item.itemPrice.toString()).indexOf('₹') > -1) {
                                price = item.itemPrice.split('₹')[1]
                                price = (price.includes(' ')) ? price.split(' ')[0] : price
                                price = price.replace(',', '');
                            }
                            else
                                price = item.itemPrice
                        }
                        else
                            price = item.price
                        price = parseFloat(price)
                        listgooleComparable.push({
                            "id": null, "isvendorItem": false, "rating":item.rating,
                            "description": item.description, "brand": null, "model": null, "price": price, "buyURL": item.itemURL,"merchant":item.merchant,
                            "isDataImage": true, "supplier": null, "imageURL": (item.itemImage) ? item.itemImage : item.base64ImageUrl
                        });
                    });
                    // var amazonComparable = [];
                    // angular.forEach(success.data.data.amazonResults, function (item) {
                    //     amazonComparable.push({
                    //         "id": null, "isvendorItem": false,
                    //         "description": item.description, "brand": item.brand, "model": item.model,
                    //         "price": ((item.price.toString()).indexOf('$') > -1) ? item.price.split('$')[1] : item.price, "buyURL": item.buyURL,
                    //         "isDataImage": false, "supplier": null, "imageURL": item.imageURL
                    //     });
                    // });
                    // var VendorComparable = [];
                    // angular.forEach(success.data.data.vendorCatalogItems, function (item) {
                    //     VendorComparable.push({
                    //         "id": item.id, "isvendorItem": true,
                    //         "description": item.description, "brand": item.brand, "model": item.model,
                    //         "price": (item.price && (item.price.toString()).indexOf('$') > -1) ? item.price.split('$')[1] : item.price,
                    //         "buyURL": null,
                    //         "isDataImage": false, "supplier": null, "imageURL": ((item.itemImages !== null) ? item[0].url : "")
                    //     });
                    // });
                    $scope.GoogleComparableList = $scope.GoogleComparableList.concat(listgooleComparable);
                    $scope.IsLoading = false;
                    $scope.reCheckSearchCount=0;
                    $scope.noItemFound = false;
                    if (listgooleComparable.length == 0 && $scope.pageNumber > 1) {
                        $scope.noMoreResults = true;
                    }
                    // $(".page-spinner-bar").addClass("hide");
                    // $scope.SortGoogleResult();
                }
                else{
                    //$scope.IsLoading = false;                    
                    if($scope.GoogleComparableList.length===0){
                        if($scope.reCheckSearchCount <1){
                            $scope.reCheckSearchCount +=1;
                            $scope.addOrRemoveSearchEngine(engineId);
                        }else{   
                            $scope.reCheckSearchCount=0;                       
                            $scope.IsLoading = false;
                            $scope.noItemFound = true;
                            if ($scope.searchEngine != 1) {
                                $scope.addOrRemoveSearchEngine("1");
                            }
                        }
                    }else{
                        $scope.IsLoading = false;
                        $scope.reCheckSearchCount=0;
                    } 
                }                    
                                           
                   
            }, function (error) {
                // $(".page-spinner-bar").addClass("hide");
                // $scope.IsLoading = false;
                // if(error.data){
                //     $scope.ErrorMessage = error.data.erromessage; 
                // }
               
            });
        }
        // else
        //     $(".page-spinner-bar").addClass("hide");

    }
    $scope.bestbuyPage = 1;
    $scope.NextPage = function () {
        $scope.noItemFound = false;
        if (!$scope.IsLoading) {
            $scope.pageNumber += 1;
            $scope.retainedSearchEngineId = sessionStorage.getItem("currentEngineId") ? sessionStorage.getItem("currentEngineId") : $scope.searchEngine;
            SearchReplacement($scope.retainedSearchEngineId);
        }
        
        // if ($scope.Searchoptions.includes(2) && $scope.moreBestBuyResult) {
        //     $scope.bestbuyPage++;
        //     // console.log($scope.bestbuyPage);
        //     var searchstring = constructSearchURL($scope.CommonObj.SearchComparables);
        //     var url = $scope.bestBuyUrl + "((" + searchstring + ")" + priceFilter + ")?" + $scope.sortString + "&apiKey=" + $scope.bestBuyKey + "&page=" + $scope.bestbuyPage + "&format=json";
        //     bestbuyResult(url);
        // }
    }
    function constructSearchURL(param) {
        var searchstring = "search=" + param;
        if (param.includes(" ")) {
            searchstring = "search=";
            searchstring = searchstring + param.split(" ").join("&search=");//.replace(" ","&search=");
        }
        return searchstring;
    }
    $scope.bestBuyComparables = [];
    function bestbuyResult(url) {
        $scope.IsLoading = true;
        var promise = AdjusterLineItemDetailsService.getBestbuyresult(url)
        promise.then(function (success) {

            var bestbuyProduct = success.data.products;
            if (!bestbuyProduct || bestbuyProduct.length == 0) {
                $scope.moreBestBuyResult = false;
            }
            $scope.bestBuyComparables = [];
            angular.forEach(bestbuyProduct, function (item) {
                var temp = {
                    "base64ImageUrl": (item.image) ? item.image : "",
                    "description": item.longDescription && item.longDescription.length > 1000 ? item.shortDescription : item.longDescription,
                    "itemImage": item.image,
                    "price": item.regularPrice,
                    "imageURL": item.image,
                    "buyURL": item.url,
                    "model": item.modelNumber,
                    "brand": item.manufacturer,
                }
                $scope.bestBuyComparables.push(temp);

            })
            $scope.GoogleComparableList = $scope.GoogleComparableList.concat($scope.bestBuyComparables);
            //console.log($scope.GoogleComparableList);
            $scope.IsLoading = false;
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            $scope.IsLoading = false;
            //toastr.error("Error in fetching BestBuy results", "Error");
        });

    }
    //Sort Google result
    $scope.SortGoogleResult = SortGoogleResult;
    function SortGoogleResult() {
        if ($scope.Searchoptions.includes(2)) {
            //console.log("bestbuy");

            $scope.GoogleComparableList = [];
            $scope.CommonObj.SearchComparables = $scope.CommonObj.SearchComparables.replace("\"", "'")
            var searchstring = constructSearchURL($scope.CommonObj.SearchComparables)//"search="+$scope.CommonObj.SearchComparables;

            /* if($scope.CommonObj.SearchComparables.includes(" ")){
              searchstring = "search=";
              searchstring = searchstring+$scope.CommonObj.SearchComparables.split(" ").join("&search=");//.replace(" ","&search=");

             }*/

            var url = "";
            if (!$scope.bestBuyKey) {
                var key = AdjusterLineItemDetailsService.getBestbuyKey()
                key.then(function (success) {
                    $scope.bestBuyKey = success.data.data;

                    url = $scope.bestBuyUrl + "((" + searchstring + "))?sort=regularPrice.desc&apiKey=" + $scope.bestBuyKey + "&format=json";
                    bestbuyResult(url);
                    //https://api.bestbuy.com/v1/products((search=check))?apiKey=AJOa71zSLPJlGRM4GE4igNFl&format=json
                }, function (error) {
                    toastr.remove()
                    toastr.error("could not get API key", $translate.instant("ErrorHeading"));
                    // $scope.ErrorMessage = error.data.errorMessage;
                });
            } else {

                url = $scope.bestBuyUrl + "((" + searchstring + "))?sort=regularPrice.desc&apiKey=" + $scope.bestBuyKey + "&format=json";
                bestbuyResult(url);
            }

        }
        else {
            $scope.GoogleComparableList = $filter('orderBy')($scope.GoogleComparableList, $scope.sortcolumn);

            angular.forEach($scope.GoogleComparableList, function (item) {
                var price;
                if (item.price.indexOf('₹') > -1)
                    price = item.price.substring(item.price.indexOf('₹') + 2).replace(/,/gi, '');
                else if (item.price.indexOf('$') > -1)
                    price = item.price.substring(item.price.indexOf('$') + 2).replace(/,/gi, '');
                else
                    price = item.price.replace(/,/gi, '');

                item.price = parseFloat(price);
            })
        }
    };

    //List for selected comparables and function add it in list\

    $scope.AddtoComparableList = AddtoComparableList;
    function AddtoComparableList(item) {
        $scope.GoogleComparableList.splice($scope.GoogleComparableList.indexOf(item), 1);
        item.isReplacementItem = false;
        item.isDelete = false;
        if ($scope.Comparables.comparableItems == null) {
            $scope.Comparables.comparableItems = [];
        }

        // Update merchant to supplier
        if(item!=null)
           item.supplier = item.merchant;
        $scope.Comparables.comparableItems.push(item);
        if(!$scope.websearchMarkReplItem)
          SaveNewlyAddedComparables(false);
        
        $scope.websearchMarkReplItem = false;
        // Update form validation as touched / dirty
        $scope.itemForm.contents.$setDirty();
    }
    //Remove form comaprables from list
    $scope.RemoveFromComparableList = RemoveFromComparableList;
    function RemoveFromComparableList(item) {
        angular.forEach($scope.Comparables.comparableItems, function (comparableItem) {
            if (angular.equals(comparableItem, item)) {
                if (item.id != null)
                    comparableItem.isDelete = true;
                else
                    $scope.Comparables.comparableItems.splice($scope.Comparables.comparableItems.indexOf(item), 1);
            }
        });
        $scope.CalculateRCV();
        // if (item.id === null)
        //     $scope.GoogleComparableList.push(item);
        //if (item.id === null)
        if (item.isReplacementItem == true) {
           // $scope.isReplaced = false;
        }
        if(item.id == null)
        $scope.GoogleComparableList.splice(0, 0, item);
        if (item.isReplacementItem) {
            $scope.markedProductList = [];
            $scope.ItemDetails.adjusterDescription = "";
            $scope.ItemDetails.source="";
            $scope.ItemDetails.replacedItemPrice="";
            $scope.ItemDetails.replacementQty="";
            $scope.ItemDetails.totalTax = "";
            $scope.ItemDetails.rcvTotal="";
        }
        item.isReplacementItem = false;
        // Update form validation as touched / dirty
        $scope.itemForm.contents.$setDirty();
        if (item.customItem) {
            $(".page-spinner-bar").removeClass("hide");
                var getItemDetailsOnId =  LineItemService.deleteCustomItem(item.id);
            getItemDetailsOnId.then(function (success) {
                     $(".page-spinner-bar").addClass("hide");
                    $scope.$close("Success");
                    toastr.remove();
                    toastr.success(success.data.message, "Confirmation");
                    }, function (error) {
                    toastr.remove();
                    toastr.error(error.data.errorMessage, "Error");
                });
        }
    };

    //CTB-2723
    $scope.AddtoComparableListFromRapid = AddtoComparableListFromRapid;
    function AddtoComparableListFromRapid(comp) {
        if(comp!==undefined){
        $scope.markedProductList.splice($scope.markedProductList.indexOf(comp), 1);
        if ($scope.Comparables.comparableItems == null) {
            $scope.Comparables.comparableItems = [];
        }
        let index = $scope.Comparables.comparableItems.findIndex(item => angular.equals(comp, item));
        if (index < 0) {
            $scope.Comparables.comparableItems.push(item);
        } else if (index > -1) {
            $scope.markedProductList=[];
            comp.isReplacementItem = false;
            comp.isDelete = false;
            $scope.ItemDetails.adjusterDescription = "";
            $scope.ItemDetails.source ="";
            $scope.ItemDetails.replacedItemPrice="";
            $scope.ItemDetails.replacementQty="";
            $scope.ItemDetails.totalTax = "";
            $scope.ItemDetails.rcv = 0;
            $scope.ItemDetails.rcvTotal=0;
            $scope.ItemDetails.status = $scope.ItemDetails.previousStatus;
            $scope.Comparables.comparableItems[index] = angular.copy(comp);
        }
    }
    else
    {
        $scope.ItemDetails.adjusterDescription = "";
        $scope.ItemDetails.source="";
        $scope.ItemDetails.replacedItemPrice=0;
        $scope.ItemDetails.replacementQty="";
        $scope.ItemDetails.totalTax = "";
        $scope.ItemDetails.rcvTotal=0;
        $scope.ItemDetails.rcv = 0;
        $scope.ItemDetails.acv = "";
     
        $scope.isReplaced = false;
        $scope.ItemDetails.status = $scope.ItemDetails.previousStatus;
    }
        $scope.ItemDetails.acv=0;
        $scope.ItemDetails.isReplaced = false;
        $scope.CalculateRCV();
        $scope.acceptedStandardCost = false;
        $scope.ItemDetails.cashPayoutExposure = 0.0;
        $scope.ItemDetails.replacementExposure = 0.0;
        // Update form validation as touched / dirty
        $scope.itemForm.contents.$setDirty();
        SaveNewlyAddedComparables(false);
    }

    //Go to shopping URL
    $scope.ShopNow = ShopNow;
    function ShopNow(comparable) {
        var urlStr = comparable.buyURL;
        if (urlStr != null && !urlStr.includes("http")) {
            urlStr = "https://" + comparable.buyURL;
        }
        $window.open(urlStr, '_blank');
    }

    //Save Newly Added Comparables
    $scope.SaveNewlyAddedComparables = SaveNewlyAddedComparables;
    function SaveNewlyAddedComparables(isInternal, callback)//SaveNewComparables
    {
        if (!$scope.customItem && $scope.itemForm.contents.$invalid) {
            utilityMethods.validateForm($scope.itemForm.contents);
            return false;
        }
        // if($scope.ItemDetails.description)
        $(".page-spinner-bar").removeClass("hide");
        var ComparableList = [];
        $scope.CommonObj.SearchComparables = $scope.ItemDetails.description;
        var param = new FormData();
        if ($scope.attachmentList.length > 0) {
            //$scope.saveAttachment();
            $scope.filesDetails = [];
            angular.forEach($scope.attachmentList, function (ItemFile) {
                $scope.filesDetails.push({
                    "fileName": ItemFile.FileName, "fileType": ItemFile.FileType, "extension": ItemFile.FileExtension, "filePurpose": "ITEM", "latitude": null, "longitude": null, "footNote": null
                });
                param.append('file', ItemFile.File);
            });
            param.append('filesDetails', JSON.stringify($scope.filesDetails));
            if ($scope.attachmentList.length == 0 || $scope.attachmentList == null) {
                param.append('filesDetails', null);
                param.append('file', null);
            }
            $scope.attachmentList = [];
        }
        var itemToMove = null;
        angular.forEach($scope.Comparables.comparableItems, function (item) {
            let desc = item.isReplacementItem ? $scope.ItemDetails.adjusterDescription : item.description;
            ComparableList.push({
                "id": item.id,
                "originalItemId": $scope.ItemDetails.id,
                "isvendorItem": item.isvendorItem,
                "description": desc && desc!="" ? encodeURIComponent(desc) : "",
                "itemName": $scope.ItemDetails.itemName,
                "quantity": item.isReplacementItem ? $scope.ItemDetails.replacementQty : item.quantity,
                "unitPrice": item.isReplacementItem ? $scope.ItemDetails.replacedItemPrice: item.unitPrice,
                "price": item.isReplacementItem ? $scope.ItemDetails.replacedItemPrice: item.price,
                "taxRate": item.taxRate,
                "brand": item.brand,
                "model": item.model,
                "supplier": item.supplier,
                "supplierWebsite": item.isReplacementItem ? $scope.ItemDetails.source : item.buyURL,
                "itemType": $scope.ItemDetails.itemType,
                //"isReplacementItem": false,
                "isReplacementItem": item.isReplacementItem,
                "buyURL": item.isReplacementItem ? $scope.ItemDetails.source : item.buyURL,
                "isDataImage": item.isDataImage,
                "imageData": (item.imageData) ? item.imageData : item.imageURL,
                "imageURL": (item.imageData) ? item.imageData : item.imageURL,
                "isDelete": item.isDelete ? true : false,
                "replacementItemUID": item.replacementItemUID,
                "rating" : item.rating,
                "customItem" : item.customItem,
                "isCustomItem" : item.isCustomItem
            });
            if (item.isReplacementItem) {
                itemToMove = item;
            }
        });
        if (itemToMove != null) {
            $scope.Comparables.comparableItems.sort(function (x, y) { return x == itemToMove ? -1 : y == itemToMove ? 1 : 0; });
        }
        if ($scope.ItemDetails.isScheduledItem == false) {
            $scope.ItemDetails.scheduleAmount = 0;
        }

    //     if($scope.addStandardCostasReplacement){
    //         $scope.addStandardCostasReplacement = false;
    //         ComparableList = [];
    //     ComparableList.push({
    //         "originalItemId": $scope.ItemDetails.id,
    //         "itemName": $scope.ItemDetails.itemName,
    //         "itemType": $scope.ItemDetails.itemType,
    //         "description": $scope.ItemDetails.standardDescription,
    //             "quantity": $scope.ItemDetails.replacementQty,
    //             "unitPrice":$scope.ItemDetails.standardCost,
    //             "price": $scope.ItemDetails.standardCost,
    //             "buyURL": $scope.ItemDetails.standardItemSource,
    //             //"isReplacementItem": false,
    //             "isDelete": false,
    //             "isReplacementItem": true,
    //     })
    // }
        // if ($scope.ItemDetails.isScheduledItem == false && $scope.ItemDetails.rcvTotal !== null) {
        //     $scope.ItemDetails.replacementExposure = parseFloat($scope.ItemDetails.rcvTotal) > $scope.ItemDetails.individualLimitAmount ? $scope.ItemDetails.individualLimitAmount : parseFloat($scope.ItemDetails.rcvTotal);
        // } else if ($scope.ItemDetails.isScheduledItem == true && $scope.ItemDetails.rcvTotal !== null) {
        //     $scope.ItemDetails.replacementExposure = parseFloat($scope.ItemDetails.rcvTotal) > $scope.ItemDetails.scheduleAmount ? $scope.ItemDetails.scheduleAmount : parseFloat($scope.ItemDetails.rcvTotal);
        // }

        // if ($scope.ItemDetails.isScheduledItem == false && $scope.ItemDetails.acv !== null) {
        //     $scope.ItemDetails.cashPayoutExposure = parseFloat($scope.ItemDetails.acv) > $scope.ItemDetails.individualLimitAmount ? $scope.ItemDetails.individualLimitAmount : parseFloat($scope.ItemDetails.acv);
        // } else if ($scope.ItemDetails.isScheduledItem == true && $scope.ItemDetails.acv !== null) {
        //     $scope.ItemDetails.cashPayoutExposure = parseFloat($scope.ItemDetails.acv) > $scope.ItemDetails.scheduleAmount ? $scope.ItemDetails.scheduleAmount : parseFloat($scope.ItemDetails.acv);
        // }

        if ($scope.ItemDetails.category && $scope.ItemDetails.subCategory && $scope.ItemDetails.category.name.toLowerCase() != "jewelry") {
            $scope.ItemDetails.appraisalValue = 0;
        }
        let itemNumber = $scope.ItemDetails.itemNumber;
        param.append("itemDetails",
            JSON.stringify(
                {
                    "registrationNumber": sessionStorage.getItem("CRN"),
                    "claimItem": {
                        "acv": $scope.ItemDetails.acv,
                        "acvTax": $scope.ItemDetails.acvTax,
                        "acvTotal": $scope.ItemDetails.acvTotal,
                        "adjusterDescription": $scope.ItemDetails.adjusterDescription && $scope.ItemDetails.adjusterDescription!="" ? encodeURIComponent($scope.ItemDetails.adjusterDescription) : "",
                        "source": $scope.ItemDetails.source,
                        "ageMonths": $scope.ItemDetails.ageMonths,
                        "ageYears": $scope.ItemDetails.ageYears,
                        "appraisalDate": (angular.isDefined($scope.ItemDetails.appraisalDate) ? $filter('DatabaseDateFormatMMddyyyy')($scope.ItemDetails.appraisalDate) : null),
                        "appraisalValue": $scope.ItemDetails.appraisalValue,
                        "approvedItemValue": $scope.ItemDetails.approvedItemValue,
                        "assignedTo": $scope.ItemDetails.assignedTo,
                        "brand": $scope.ItemDetails.brand,
                        "category": $scope.ItemDetails.category ? {
                            "annualDepreciation": $scope.ItemDetails.category.annualDepreciation ? $scope.ItemDetails.category.annualDepreciation : null,
                            "id": $scope.ItemDetails.category.id ? $scope.ItemDetails.category.id : null,
                            "name": $scope.ItemDetails.category.name ? $scope.ItemDetails.category.name : null,
                            "usefulYears": $scope.ItemDetails.category.usefulYears ? $scope.ItemDetails.category.usefulYears : null,
                            "aggregateLimit": null,
                            "description": null,
                        } : null,
                        "categoryLimit": $scope.ItemDetails.categoryLimit,
                        "claimId": $scope.ItemDetails.claimId,
                        "claimNumber": $scope.ItemDetails.claimNumber,
                        "dateOfPurchase": $scope.ItemDetails.dateOfPurchase,
                        "depriciationRate": $scope.ItemDetails.depriciationRate,
                        "description": $scope.ItemDetails.description && $scope.ItemDetails.description!="" ? encodeURIComponent($scope.ItemDetails.description):"",
                        "applyTax": $scope.ItemDetails.applyTax,
                        "holdOverPaymentDate": $scope.ItemDetails.holdOverPaymentDate,
                        "holdOverPaymentMode": $scope.ItemDetails.holdOverPaymentMode,
                        "holdOverPaymentPaidAmount": $scope.ItemDetails.holdOverPaymentPaidAmount,
                        "itemOverage": $scope.ItemDetails.itemOverage,
                        "scheduleAmount": $scope.ItemDetails.scheduleAmount,
                        "deductibleAmount": $scope.ItemDetails.deductibleAmount,
                        "individualLimitAmount": $scope.ItemDetails.individualLimitAmount,
                        "totalStatedAmount": $scope.ItemDetails.totalStatedAmount,
                        "id": $scope.ItemDetails.id,
                        "itemUID": $scope.ItemDetails.itemUID,
                        "insuredPrice": $scope.ItemDetails.insuredPrice > 0 ? $scope.ItemDetails.insuredPrice : 0,
                        "isReplaced": $scope.ItemDetails.isReplaced,
                        // "isNewReplaced":$scope.isReplaced,
                        "replacementQty":$scope.ItemDetails.replacementQty,
                         "replacedItemPrice":$scope.ItemDetails.replacedItemPrice,
                        "isScheduledItem": $scope.ItemDetails.isScheduledItem,
                        "itemName": $scope.ItemDetails.itemName,
                        "itemType": $scope.ItemDetails.itemType,
                        "itemUsefulYears": $scope.ItemDetails.itemUsefulYears,
                        "model": $scope.ItemDetails.model,
                        "paymentDetails": $scope.ItemDetails.paymentDetails,
                        "quantity": $scope.ItemDetails.quantity > 0 ? $scope.ItemDetails.quantity : 0,
                        "quotedPrice": $scope.ItemDetails.quotedPrice,
                        "rcv": $scope.ItemDetails.rcv,
                        "rcvTax": $scope.ItemDetails.rcvTax,
                        "rcvTotal": $scope.ItemDetails.rcvTotal,
                        "receiptValue": $scope.ItemDetails.receiptValue > 0 ? $scope.ItemDetails.receiptValue : 0,
                        "depreciationAmount": $scope.ItemDetails.depreciationAmount > 0 ? $scope.ItemDetails.depreciationAmount : 0,
                        "status": {
                            "id": ($scope.ItemDetails.status) ? $scope.ItemDetails.status.id : null,
                            "status": ($scope.ItemDetails.status) ? $scope.ItemDetails.status.status : null
                        },
                        "subCategory": $scope.ItemDetails.subCategory ? {
                            "annualDepreciation": $scope.ItemDetails.subCategory.annualDepreciation ? $scope.ItemDetails.subCategory.annualDepreciation : null,
                            "id": $scope.ItemDetails.subCategory.id ? $scope.ItemDetails.subCategory.id : null,
                            "name": $scope.ItemDetails.subCategory.name ? $scope.ItemDetails.subCategory.name : null,
                            "usefulYears": $scope.ItemDetails.subCategory.usefulYears ? $scope.ItemDetails.subCategory.usefulYears : null,
                            "description": null,
                            "aggregateLimit": null
                        } : null,
                        "condition": {
                            "conditionId": (($scope.ItemDetails.condition !== null && angular.isDefined($scope.ItemDetails.condition)) ? $scope.ItemDetails.condition.conditionId : null),
                            "conditionName": (($scope.ItemDetails.condition !== null && angular.isDefined($scope.ItemDetails.condition)) ? $scope.ItemDetails.condition.conditionName : null)
                        },
                        "taxRate": $scope.ItemDetails.taxRate,
                        "totalTax": $scope.ItemDetails.totalTax,
                        "valueOfItem": $scope.ItemDetails.valueOfItem,
                        "vendorDetails": $scope.ItemDetails.vendorDetails,
                        "yearOfManufecturing": $scope.ItemDetails.yearOfManufecturing,

                        "shippingDate": $scope.ItemDetails.shippingDate ? $filter('DatabaseDateFormatMMddyyyy')($scope.ItemDetails.shippingDate) : null,
                        "shippingMethod": {
                            "id": $scope.ItemDetails.shippingMethod ? $scope.ItemDetails.shippingMethod.id : null
                        },
                        // Originally purchased from, purhase method, If gifted then donor's name and address
                        "originallyPurchasedFrom": $scope.newRetailer.addOtherRetailer ? {
                            "name": $scope.ItemDetails.newRetailer
                        } : $scope.ItemDetails.originallyPurchasedFrom,
                        "room": $scope.ItemDetails.room,
                        "giftedFrom": $scope.ItemDetails.giftedFrom ? $scope.ItemDetails.giftedFrom : null,
                        "purchaseMethod": $scope.ItemDetails.purchaseMethod ? $scope.ItemDetails.purchaseMethod : null,
                        "videoLink": $scope.ItemDetails.videoLink ? $scope.ItemDetails.videoLink : null,
                        "cashPayoutExposure": $scope.ItemDetails.cashPayoutExposure,
                        "replacementExposure": $scope.ItemDetails.replacementExposure,
                        "maxHoldover": $scope.ItemDetails.maxHoldover,
                    },
                    "comparableItems": ComparableList,
                }
            ));
        var SaveNewComparables = AdjusterLineItemDetailsService.SaveNewComparables(param);
        SaveNewComparables.then(function (success) {
            var updatedItem = success.data.data;
            $scope.customItem = false;
            if (updatedItem && $scope.customItem == false) {
                $scope.ItemDetails.status = updatedItem.claimItem.status;
                if ($scope.newRetailer.addOtherRetailer) {
                    $scope.ItemDetails.originallyPurchasedFrom = {
                        "id": updatedItem.claimItem.originallyPurchasedFrom.id,
                        "name": updatedItem.claimItem.originallyPurchasedFrom.name
                    }
                    $scope.Retailers.push(angular.copy(updatedItem.claimItem.originallyPurchasedFrom));
                    $scope.newRetailer.addOtherRetailer = false;
                    $scope.ItemDetails.newRetailer = null;
                }
                toastr.remove()
                toastr.success("Item # " + itemNumber + " details successfully updated", $translate.instant("SuccessHeading"));
            }
            //$scope.GoogleComparableList = [];

            // execute following if user saves item details
            // isInternal is true when user changes item through next or previous buttons
            if (!isInternal) {
                //Add replacement hide google result and show from Comparables from db
                // get compairables stored in database and insrt in list Comparables
                $scope.Comparables = {
                    comparableItems: updatedItem.comparableItems
                }
                getItemDetails();
                // mapComparables();
                // if ($scope.ItemDetails.status.status != $scope.constants.itemStatus.underReview) {
                //     $scope.SearchReplacement();
                // }
                ComparableList = [];
                // $scope.AddedComparables = [];
                $scope.DeletedComparables = [];
                getAttachment(updatedItem.claimItem.attachments);
                //$scope.AddReplacement();
                //$(".page-spinner-bar").addClass("hide");
            }
            else
                callback();
            // Set itemForm.contents as valid and pristine
            $scope.itemForm.contents.$setValidity("valid", true);
            $scope.itemForm.contents.$setPristine();
        }, function (error) {
            //Show toastr for error
            toastr.remove()
            toastr.error(error.data.errorMessage, $translate.instant("ErrorHeading"));
            $(".page-spinner-bar").addClass("hide");
        });
    }

    //*********************End Google search**********************************

    //Show Replacement item pageload state
    $scope.AddReplacement = AddReplacement;
    function AddReplacement() {
        // $scope.displaycomparables = true;
        if ($scope.Comparables != null) {
            $scope.displaycomparables = true;
            $scope.displayEmptyPart = false;
        }
        else {
            $scope.displaycomparables = false;
            $scope.displayEmptyPart = true;
        }
        $scope.displayReplacement = false;
        $scope.dispalyAddedComparables = false;
        //$scope.Comparables=$scope.AddedAsReplacementList;//serchers
    }

    //Select comparables if press back the empty list and calculate rcv again pageload state
    $scope.CancelAddedComparables = CancelAddedComparables;
    function CancelAddedComparables() {
        $scope.GoogleComparableList = [];
        $scope.AddedComparables = [];
        $scope.AddReplacement();
        $scope.CalculateRCV();
    }

    //Calculate ACV RCV
    $scope.OriginalRCVOfItem = 0;
    $scope.OrignialLength = 0;
    $scope.CalculateRCV = function () {
        // Get Price of added comparable or 
        // Some Items are valued directly from claim dashboard, then get rcvTotal
        if($scope.ItemDetails.isReplaced){
        var Price = 0.0;
        var taxRate = 0.0;
        var ACV = 0.0;
        var RCV = 0.0;
        Price = $scope.acceptedStandardCost? $scope.ItemDetails.rcv : $scope.ItemDetails.totalStatedAmount ;

        $scope.ItemDetails.replacementQty = Number($scope.ItemDetails.replacementQty) || 1

        $scope.ItemDetails.individualLimitAmount = utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.homeInsurancePolicyCategoryLimits?.individualItemLimit ?? $scope.ItemDetails.individualLimitAmount);


        // var Age = 0.0;
        // var EL = 0.0; var CA = 0.0;
        // var depreciationPercent = 0.0;
        var isCustom = false;
        var customCharges = 0.0;
        var laborCharges = 0.0;
        var itemReplace = false;
        if ($scope.Comparables && $scope.Comparables.comparableItems && $scope.Comparables.comparableItems.length > 0) {
            angular.forEach($scope.Comparables.comparableItems, function (item) {
                if (item.isReplacementItem == true && !item.isDelete) {
                    Price = parseFloat(item.unitPrice ? item.unitPrice : item.price);
                    itemReplace = true;
                    isCustom = item.customItem;
                    laborCharges = item.labourCharges ? item.labourCharges : 0.0;
                    customCharges = item.customCharges ? item.customCharges : 0.0;
                }
            });
        } else if ($scope.ItemDetails.status.status === $scope.constants.itemStatus.valued ||
            $scope.ItemDetails.status.status === $scope.constants.itemStatus.replaced || $scope.ItemDetails.status.status === $scope.constants.itemStatus.paid ||  $scope.ItemDetails.status.status === $scope.constants.itemStatus.settled ) {
            Price = utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.rcv);
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
            Price = utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.replacedItemPrice*$scope.ItemDetails.replacementQty);
        }              
        // else{
        // // Calculate material cost
        // Price = Price * $scope.ItemDetails.replacementQty;
        // }
        
        taxRate = ($scope.ItemDetails.taxRate && $scope.ItemDetails.applyTax == true) ? $scope.ItemDetails.taxRate : 0;
        $scope.ItemDetails.totalTax = utilityMethods.parseFloatWithFixedDecimal((taxRate / 100) * (isNaN(Price) ? 1 : Price));

        Price = isNaN(Price) ? 0 : utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.totalTax + Price);
        // EL = isNaN(EL) ? 0 : EL;

        // Add laborCharges in price for custom Jewelry item
        if(isCustom){
            Price +=laborCharges+customCharges;
        }
        $scope.ItemDetails.rcvTotal = utilityMethods.parseFloatWithFixedDecimal(Price);

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

        // $scope.ItemDetails.itemOverage = 0.0;
        //$scope.ItemDetails.individualLimitAmount = $scope.ItemDetails.individualLimitAmount ? $scope.ItemDetails.individualLimitAmount : 0.0;
        $scope.ItemDetails.scheduleAmount = utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.scheduleAmount ? $scope.ItemDetails.scheduleAmount : 0.0);
        // CTB-2903
        // Condition where Item's category is not listed in selected home owners Policy type
        // then individual Limit will be 0.00, Item overage must also be considered 0.00.
        // Every item’s final Item Overage(holdover value) will be calculated based on the final Total Cash Value (ACV)
        // If(Total Cash Value > Item Limit) then acv - individual item limit else  Item Overage = 0.0
        if ($scope.ItemDetails.individualLimitAmount && $scope.ItemDetails.individualLimitAmount > 0 && ACV > $scope.ItemDetails.individualLimitAmount)
            $scope.ItemDetails.itemOverage = ACV - $scope.ItemDetails.individualLimitAmount;

        $scope.ItemDetails.acv = utilityMethods.parseFloatWithFixedDecimal(ACV);
        $scope.ItemDetails.rcv = utilityMethods.parseFloatWithFixedDecimal(RCV);

        // as per request if category is jewelry the acv is equals to replacement cost
        //as per request commented out the below lines decided to handle this in configuration
        // if ($scope.ItemDetails.category && ($scope.ItemDetails.category.name.toLowerCase() == 'jewelry' && $scope.ItemDetails.subCategory != null && $scope.ItemDetails.subCategory.name !== 'Costume Jewelry')) {
        //     $scope.ItemDetails.acv = $scope.ItemDetails.rcvTotal;
        // }

        //ACV shld be always smaller than RCV
        if($scope.ItemDetails.acv >$scope.ItemDetails.rcvTotal){
            $scope.ItemDetails.acv = $scope.ItemDetails.rcvTotal;
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

        if($scope.addStandardCostasReplacement || $scope.saveItem ){
            $scope.addStandardCostasReplacement = false;
            $scope.saveItem = false;
            $scope.isReplaced = false;
            SaveNewlyAddedComparables(false);
        }
    }else{
        if($scope.saveItem){
            $scope.saveItem = false;
            SaveNewlyAddedComparables(false);
        }
    }

    }


    $scope.CalculateSearchPrices = function (searchEngine){
    const insuredPrice = $scope.ItemDetails.insuredPrice;
    var variablePrice = (0.2 * insuredPrice).toFixed(2);
    $scope.CommonObj.priceTo = parseFloat(Number(insuredPrice) + Number(variablePrice));
    $scope.CommonObj.priceFrom = parseFloat(Number(insuredPrice) - Number(variablePrice));
    $scope.addOrRemoveSearchEngine(searchEngine);
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

    //Change Total stated value if quantity and stated value changes
    $scope.CalculateTotalStatedValue = function () {
        if (+$scope.ItemDetails.quantity >= 0) {
            if ($scope.ItemDetails.insuredPrice >= 0) {
                $scope.ItemDetails.totalStatedAmount = utilityMethods.parseFloatWithFixedDecimal(+$scope.ItemDetails.quantity * $scope.ItemDetails.insuredPrice);
            }
        }
        if (isNaN($scope.ItemDetails.totalStatedAmount)) {
            $scope.ItemDetails.totalStatedAmount = 0;
        }
    }

    //------------Auto compalete extender----------------------------------
    //select particiapnt
    $scope.participantsForNote = [];
    $scope.afterSelectedParticipant = function (selected) {
        if (selected) {
            $scope.participantsForNote.push({
                "ParticipantId": selected.originalObject.id,
                "ParticipantName": selected.originalObject.firstName + " " + selected.originalObject.lastName
            });
        }
    };

    //------------End Auto compalete extender----------------------------------
    $scope.ParticipantName = [];
    $scope.participants = [];
    //select particiapnt
    //$scope.GetNoteParticipant = function (selected) {
    //    if (selected) {

    //if ($scope.participants.indexOf(selected.originalObject.participantId) == -1) {

    //            $scope.participants.push({
    //                "participantId": selected.originalObject.participantId,
    //                "participantType": selected.originalObject.participantType
    //            })
    //            $scope.ParticipantName.push(selected.originalObject.firstName + " " + selected.originalObject.lastName);
    //        }
    //    }
    //};

    $scope.GetNoteParticipant = function (selected) {
        if (selected) {
            var flag = 0;
            angular.forEach($scope.participants, function (participant) {

                if (participant.participantId == selected.originalObject.participantId) {
                    flag++;
                }
            });
            if (flag == 0) {
                $scope.participants.push({
                    "participantId": selected.originalObject.participantId,
                    "participantType": selected.originalObject.participantType
                })
                $scope.ParticipantName.push(selected.originalObject.firstName + " " + selected.originalObject.lastName);
            }
        }

    }

    // search function to match full text
    $scope.localSearch = function (str) {
        var matches = [];
        $scope.ClaimParticipantsList.forEach(function (person) {
            var fullName = ((person.firstName === null) ? "" : person.firstName.toLowerCase()) + ' ' + ((person.lastName === null) ? "" : person.lastName.toLowerCase());
            if (fullName.indexOf(str.toString().toLowerCase()) >= 0) {
                matches.push(person);
            }
        });
        return matches;
    };

    $scope.PraticipantIdList = [];
    //Add note with attachment against claim item
    $scope.AddNote = function (e) {
        //NoteParticipants
        var data = new FormData();
        data.append("mediaFilesDetail", JSON.stringify([{ "fileName": $scope.fileName, "fileType": $scope.FileType, "extension": $scope.FileExtension, "filePurpose": "NOTE", "latitude": null, "longitude": null }]));

        data.append("file", $scope.files[0]);
        var NoteUser = [];
        if ($scope.PraticipantIdList.length > 0) {
            angular.forEach($scope.PraticipantIdList, function (participant) {
                angular.forEach($scope.ClaimParticipantsList, function (item) {
                    if (participant === item.participantId) {
                        NoteUser.push({
                            "participantId": participant, "participantType": { "id": item.participantType.id, "participantType": item.participantType.participantType }
                        });
                    }
                });
            });

            data.append("noteDetail", JSON.stringify({
                "claimId": $scope.ItemDetails.claimId.toString(),
                "itemId": $scope.CommonObj.ItemId,
                "itemUID": $scope.ItemDetails.itemUID,
                "serviceId": null,
                //"addedBy": "CORPORATE USER",
                "isPublicNote": false,
                "message": $scope.CommonObj.ItemNote,
                //"addedById": sessionStorage.getItem("UserId"),
                "groupDetails": {
                    "groupId": null,
                    "groupTitle": "Item Note Group",
                    "participants": NoteUser
                }
            }));

            var getpromise = AdjusterLineItemDetailsService.addClaimNoteWithParticipant(data);
            getpromise.then(function (success) {

                $scope.Status = success.data.status;
                if ($scope.Status === 200) {
                    toastr.remove()
                    toastr.success(success.data.message, $translate.instant("SuccessHeading"));
                    angular.element("input[type='file']").val(null);
                    $scope.fileName = '';
                    $scope.FileType = '';
                    $scope.FileExtension = '';
                    //after adding new note updating note list
                    GetMessages(null);
                }
            }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
        }
        else {
            data.append("noteDetail", JSON.stringify({
                "claimId": $scope.ItemDetails.claimId.toString(),
                "itemId": $scope.CommonObj.ItemId,
                "itemUID": $scope.ItemDetails.itemUID,
                "serviceId": null,
                //"addedById": sessionStorage.getItem("UserId"),
                "message": $scope.CommonObj.ItemNote,
                "isPublicNote": true,
                "groupDetails": null
            }));

            var addClaimNoteWithPart = AdjusterLineItemDetailsService.addClaimNoteWithParticipant(data);
            addClaimNoteWithPart.then(function (success) {
                $scope.Status = success.data.status;
                if ($scope.Status === 200) {
                    toastr.remove()
                    toastr.success(success.data.message, $translate.instant("SuccessHeading"));
                    angular.element("input[type='file']").val(null);
                    $scope.fileName = '';
                    $scope.FileType = '';
                    $scope.FileExtension = '';
                    //after adding new note updating note list
                    GetMessages(null);

                }
            }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
        }

    }
    //---------------Note Attachment------------------------------------------
    $scope.fileName = '';
    $scope.FileExtension = '';
    $scope.FileType = '';
    $scope.files = [];

    //for attachments in origional Item
    $scope.SelectFile = function () {
        angular.element('#FileUpload').trigger('click');
    };
    //Get origional Item attachment details
    $scope.filesAttachment = [];
    $scope.getFileDetails = getFileDetails;
    function getFileDetails(event) {
        var files = event.target.files;
        $scope.files = event.target.files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.file = file;
            reader.fileName = files[i].name;
            reader.fileType = files[i].type;
            reader.fileExtension = files[i].name.substr(files[i].name.lastIndexOf('.'));
            reader.onload = $scope.FileIsLoaded;
            reader.readAsDataURL(file);
        }
    }
    $scope.FileIsLoaded = function (e) {
        $scope.$apply(function () {
            $scope.filesAttachment.push({ "FileName": e.target.fileName, "FileExtension": e.target.fileExtension, "FileType": e.target.fileType, "Image": e.target.result, "File": e.target.file })
        });
    }
    $scope.RemoveFile = RemoveFile;
    function RemoveFile(item) {
        var index = $scope.filesAttachment.indexOf(item);
        if (index > -1) {
            $scope.filesAttachment.splice(index, 1);
        }
    }
    //---------------Start Message Attachment------------------------------------------//

    //Get message attachment details
    $scope.selectMessageAttachments = function () {
        angular.element('#messageFileUpload').trigger('click');
    }
    $scope.getMessageAttachmentDetails = function (e) {
        $scope.$apply(function () {
            var files = event.target.files;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var reader = new FileReader();
                reader.file = file;
                reader.fileName = files[i].name;
                reader.fileType = files[i].type;
                reader.fileExtension = files[i].name.substr(files[i].name.lastIndexOf('.'));
                //20 MB
                if (reader.file.size > 20000000) {
                    $scope.invalidAttachment = true;
                    return false;
                } else {
                    $scope.invalidAttachment = false;
                }
                reader.onload = $scope.imageIsLoaded;
                reader.readAsDataURL(file);
            }
        });
    };
    $scope.reply.uploadedMessageFiles = [];
    $scope.imageIsLoaded = function (e) {
        $scope.$apply(function () {
            $scope.reply.uploadedMessageFiles.push(
                {
                    "FileName": e.target.fileName, "FileExtension": e.target.fileExtension,
                    "FileType": e.target.fileType,
                    "Image": e.target.result, "File": e.target.file, "isLocal": true
                })
        });
    }
    $scope.removeMessageFile = function (item) {
        var index = $scope.reply.uploadedMessageFiles.indexOf(item);
        if (index > -1) {
            $scope.reply.uploadedMessageFiles.splice(index, 1);
        }
        $scope.close();
    }
    $scope.GetMessages = GetMessages;
    function GetMessages(event) {
        if (event && event === 'refresh')
            $(".note_refresh_spinner").addClass("fa-spin");
        else
            $(".page-spinner-bar").removeClass("hide");
        var param = {
            "itemId": $scope.CommonObj.ItemId
        };
        var getpromise = AdjusterLineItemDetailsService.getItemNotes(param);
        getpromise.then(function (success) {
            //var Notes = $filter('orderBy')(success.data && success.data.data ? success.data.data : null, 'updateDate', true);
            var Notes = success.data && success.data.data ? success.data.data : null;
            $scope.Notes = [];
            var idx = 0;
            var selIdx = 0;
            angular.forEach(Notes, function (item, index) {
                // if (item.groupTitle != null) {
                var tooltip = '';
                var count = 0;
                if ($scope.NoteDetails && $scope.NoteDetails.groupId == item.groupId) {
                    selIdx = idx;
                } else {
                    idx++;
                }
                angular.forEach(item.participants, function (participant) {
                    if (count == item.participants.length - 1) {
                        tooltip += participant.name;
                    } else {
                        tooltip += participant.name + "\n";
                    }
                    count++;
                });
                // map messages attachments within group
                angular.forEach(item.messages, function (message) {
                    angular.forEach(message.attachments, function (attachment) {
                        attachment.FileType = attachment.claimFileType;
                        attachment.FileName = attachment.name;
                        attachment.addedByUser = {
                            "id": message.addedBy.id
                        };
                        attachment.message = {
                            "id": message.noteId
                        };
                    });
                });
                item.tooltipText = tooltip;
                $scope.Notes.push(item);
                // }
            });
            if ($scope.Notes !== null && $scope.Notes.length > 0) {
                $scope.NoteDetails = $scope.Notes[selIdx];
                $scope.NoteIndex = selIdx;
            }
            if (event && event === 'refresh')
                $(".note_refresh_spinner").removeClass("fa-spin");
            else
                $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            $(".note_refresh_spinner").removeClass("fa-spin");
            $(".page-spinner-bar").addClass("hide");
        });
    }
    //---------------End Message Attachment------------------------------------------//

    // Category / Condition selection changes (Section & Floating box)
    $scope.changeSelection = changeSelection;
    function changeSelection(dropdownId, dropdown) {
        var elmsec = null;
        var elmFlot = null;
        if ('category' == dropdown) { // category
            elmsec = $("#itemCategorySel");
            elmFlot = $("#floatingboxSel");
            if (dropdownId == 'itemCategorySel') {
                elmFlot.val(elmsec.val()).trigger('change.select2');
            } else {
                elmsec.val(elmFlot.val()).trigger('change.select2');
            }
            //Update model
            var categoryObj = $scope.CategoryList.find(x => x.categoryId === $scope.ItemDetails.category.id);
            if (categoryObj && $scope.ItemDetails) {
                if ($scope.ItemDetails.category) {
                    $scope.ItemDetails.category.id = categoryObj.categoryId;
                    $scope.ItemDetails.category.name = categoryObj.categoryName;
                    $scope.ItemDetails.category.description = categoryObj.description;
                }
                else {
                    $scope.ItemDetails.category = {
                        "id": categoryObj.categoryId,
                        "name": categoryObj.categoryName,
                        "description": categoryObj.description
                    }
                }
                $scope.ItemDetails.subCategory = {};
                GetSubCategory();
            }
            else {
                $scope.ItemDetails.categoryLimit = 0.0;
                $scope.ItemDetails.individualLimitAmount = 0.0;
                $scope.ItemDetails.category = null;
                $scope.ItemDetails.subCategory = null;
                $scope.CalculateRCV();
            }
        } else if ('subCategory' == dropdown) { // subCategory
            elmsec = $("#itemSubCategorySel");
            elmFlot = $("#floatingSubCatSel");
            if (dropdownId == 'itemSubCategorySel') {
                elmFlot.val(elmsec.val()).trigger('change.select2');
            } else {
                elmsec.val(elmFlot.val()).trigger('change.select2');
            }
            ChangeDepriciationRate();
            SaveNewlyAddedComparables(false);
        } else { // condition
            elmsec = $("#itemConditionSel");
            elmFlot = $("#floatCondtionSel");
            if (dropdownId == 'itemConditionSel') {
                elmFlot.val(elmsec.val()).trigger('change.select2');
            } else {
                elmsec.val(elmFlot.val()).trigger('change.select2');
            }
            var conditionObj = $scope.ConditionList.find(x => x.conditionId === $scope.ItemDetails.condition.conditionId);
            if (conditionObj && $scope.ItemDetails) {
                if ($scope.ItemDetails.condition) {
                    $scope.ItemDetails.condition.conditionId = conditionObj.conditionId;
                    $scope.ItemDetails.condition.conditionName = conditionObj.conditionName;
                }
                else {
                    $scope.ItemDetails.category = {
                        "id": conditionObj.conditionId,
                        "name": conditionObj.conditionName,
                    }
                }
            }
            $scope.CalculateRCV();
        }
        //$scope.ItemDetails.subCategory = {};
        // Temp category
        $scope.tempCategory = $scope.ItemDetails.category;
    }

    $scope.GetSubCategory = GetSubCategory;
    function GetSubCategory() {
        //--------------------------------------------------------------------------------------------------------------
        //bind subcategory
        if ($scope.ItemDetails.category) {
            var Price = null;
            if ($scope.Comparables && $scope.Comparables.comparableItems && $scope.Comparables.comparableItems.length > 0) {
                angular.forEach($scope.Comparables.comparableItems, function (item) {
                    if (item.isReplacementItem == true) {
                        Price = parseFloat((item.unitPrice) ? item.unitPrice : item.price);
                    }
                });
            }
            if ($scope.ItemDetails.category.name.toLowerCase() === "jewelry" && $scope.ItemDetails.subCategory != null && $scope.ItemDetails.subCategory.name !== 'Costume Jewelry') {
                $scope.ItemDetails.acv = $scope.ItemDetails.rcvTotal;
            }
            // else {
            //     if (Price != null)
            //         $scope.CalculateRCV();
            // }
            var param = { "categoryId": $scope.ItemDetails.category.id };
            var getpromise = AdjusterLineItemDetailsService.getSubCategory(param);
            getpromise.then(function (success) {
                // CTB-2923
                // If a certain category has exactly 1 subcategory -
                // its should be populated automatically in the sub-category drop down.
                var res = success.data ? success.data.data : null;
                if (res) {
                        $scope.SubCategoryList=res;
                    
                    if ($scope.SubCategoryList.length <= 1) {
                        $scope.ItemDetails.subCategory = angular.copy($scope.SubCategoryList[0]);
                        ChangeDepriciationRate();
                        var elmsec = $("#itemSubCategorySel");
                        var elmFlot = $("#floatingSubCatSel");
                        elmFlot.val(elmsec.val()).trigger('change.select2');
                        elmsec.val(elmFlot.val()).trigger('change.select2');
                    }
                    // else
                    //     $scope.CalculateRCV();
                $scope.CalculateRCV();
                }
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                //$scope.ErrorMessage = error.data.errorMessage;
                toastr.remove();
                toastr.error(error.data.errorMessage, 'Error');
                $(".page-spinner-bar").addClass("hide");
            });
        }
    }

    $scope.SelectItemImage = function () {
        $scope.displayAddImageButton = false;
        $scope.displayImageName = true;
        $scope.EnableAddImage = true;
        angular.element('#FileUpload').trigger('click');
    };

    //Change DepriciationRate
    $scope.ChangeDepriciationRate = ChangeDepriciationRate;
    function ChangeDepriciationRate() {
        // $scope.SubCategoryList =[];
        // angular.forEach($scope.copySubCategoryList,function(subcat){
        //     $scope.SubCategoryList.push(subcat);

        // })
        var list = $scope.SubCategoryList.find(x => x.id === $scope.ItemDetails.subCategory.id);
        if (list && list != null) {
            $scope.ItemDetails.subCategory = angular.copy(list);
            $scope.ItemDetails.depriciationRate = list.annualDepreciation;
            $scope.ItemDetails.itemUsefulYears = list.usefulYears;
            $scope.CalculateRCV();
        }
    }

    $scope.ItemImageList = [];
    $scope.displayImageName = false;

    $scope.EnableAddImage = true;
    $scope.getItemImageDetails = function (e) {
        $scope.$apply(function () {
            $scope.ImageName = e.files[0].name;
            $scope.ImageType = e.files[0].type
            $scope.ImgExtension = $scope.ImageName.substr($scope.ImageName.lastIndexOf('.'))
            $scope.ItemImageList.push(e.files[0]);
            let fr = new FileReader();
            //fr.onload = receivedText;
            fr.readAsDataURL(e.files[0]);
            $scope.displayImageName = true;
            $scope.displayAddImageButton = false;
            $scope.EnableAddImage = false;
        });
    };

    $scope.AddImage = function () {
        var param = new FormData();
        param.append('filesDetails', JSON.stringify([{ "fileType": "IMAGE", "extension": ".png", "filePurpose": "ITEM", "latitude": null, "longitude": null }]));
        param.append('file', $scope.ItemImageList[0]);
        param.append("itemDetails", JSON.stringify({
            "id": $scope.ItemDetails.id,
            "acv": $scope.ItemDetails.acv,
            "acvTax": $scope.ItemDetails.acvTax,
            "acvTotal": $scope.ItemDetails.acvTotal,
            "adjusterDescription": $scope.ItemDetails.adjusterDescription,
            "source":$scope.ItemDetails.source,
            "ageMonths": $scope.ItemDetails.ageMonths,
            "ageYears": $scope.ItemDetails.ageYears,
            "approvedItemValue": $scope.ItemDetails.approvedItemValue,
            "assignedTo": $scope.ItemDetails.assignedTo,
            "brand": $scope.ItemDetails.brand,
            "category": {
                "annualDepreciation": $scope.ItemDetails.category && $scope.ItemDetails.category.annualDepreciation ? $scope.ItemDetails.category.annualDepreciation : null,
                "id": $scope.ItemDetails.category && $scope.ItemDetails.category.id ? $scope.ItemDetails.category.id : null,
                "name": $scope.ItemDetails.category && $scope.ItemDetails.category.name ? $scope.ItemDetails.category.name : null,
                "usefulYears": $scope.ItemDetails.category && $scope.ItemDetails.category.usefulYears ? $scope.ItemDetails.category.usefulYears : null,
                "aggregateLimit": null,
                "description": null,
            },
            "claimId": $scope.ItemDetails.claimId,
            "claimNumber": $scope.ItemDetails.claimNumber,
            "dateOfPurchase": $scope.ItemDetails.dateOfPurchase,
            "depriciationRate": $scope.ItemDetails.depriciationRate,
            "description": $scope.ItemDetails.description,
            "holdOverPaymentDate": $scope.ItemDetails.holdOverPaymentDate,
            "holdOverPaymentMode": $scope.ItemDetails.holdOverPaymentMode,
            "holdOverPaymentPaidAmount": $scope.ItemDetails.holdOverPaymentPaidAmount,
            "itemOverage": $scope.ItemDetails.itemOverage,
            "insuredPrice": $scope.ItemDetails.insuredPrice,
            "isReplaced": $scope.ItemDetails.isReplaced,
            "isScheduledItem": $scope.ItemDetails.isScheduledItem,
            "itemName": $scope.ItemDetails.itemName,
            "itemType": $scope.ItemDetails.itemType,
            "model": $scope.ItemDetails.model,
            "paymentDetails": $scope.ItemDetails.paymentDetails,
            "quantity": $scope.ItemDetails.quantity,
            "quotedPrice": $scope.ItemDetails.quotedPrice,
            "rcv": $scope.ItemDetails.rcv,
            "replacementQty":$scope.ItemDetails.replacementQty,
            "replacedItemPrice":$scope.ItemDetails.replacedItemPrice,
            "rcvTax": $scope.ItemDetails.rcvTax,
            "rcvTotal": $scope.ItemDetails.rcvTotal,
            "receiptValue": null,
            "status": {
                "id": $scope.ItemDetails.status.id,
                "status": $scope.ItemDetails.status.status
            },
            "subCategory": {
                "annualDepreciation": $scope.ItemDetails.subCategory && $scope.ItemDetails.subCategory.annualDepreciation ? $scope.ItemDetails.subCategory.annualDepreciation : null,
                "id": $scope.ItemDetails.subCategory && $scope.ItemDetails.subCategory.id ? $scope.ItemDetails.subCategory.id : null,
                "name": $scope.ItemDetails.subCategory && $scope.ItemDetails.subCategory.name ? $scope.ItemDetails.subCategory.name : null,
                "usefulYears": $scope.ItemDetails.subCategory && $scope.ItemDetails.subCategory.usefulYears ? $scope.ItemDetails.subCategory.usefulYears : null,
                "description": null,
                "aggregateLimit": null
            },
            "taxRate": $scope.ItemDetails.taxRate,
            "totalTax": $scope.ItemDetails.totalTax,
            "valueOfItem": $scope.ItemDetails.valueOfItem,
            "vendorDetails": $scope.ItemDetails.vendorDetails,
            "yearOfManufecturing": $scope.ItemDetails.yearOfManufecturing
        }));
        var SaveItemDetails = AdjusterLineItemDetailsService.SaveItemDetails(param);
        SaveItemDetails.then(function (success) {
            //Show message
            toastr.remove()
            toastr.success(success.data.message, $translate.instant("SuccessHeading"));
            $scope.displayAddImageButton = true;
            $scope.displayImageName = false;
            $scope.ClearImage();
            $scope.GetItemImage();
        }, function (error) {  //Show message
            toastr.remove()
            toastr.error(error.data.errorMessage, $translate.instant("ErrorHeading"));
            $scope.displayAddImageButton = true;
            $scope.displayImageName = false;
            $scope.ClearImage();
        });
    }

    //clear  attachments
    $scope.ClearImage = function () {
        angular.element("input[type='file']").val(null);
        $scope.displayImageName = false;
        $scope.displayAddImageButton = true;
        $scope.EnableAddImage = false;
        $scope.ImageName = null;
    }

    //Accept button
    $scope.AcceptItem = AcceptItem;
    function AcceptItem() {
        var param = {
            "id": $scope.CommonObj.ItemId,
            "approvedItemValue": $scope.ItemDetails.approvedItemValue
        };
        var AcceptItm = AdjusterLineItemDetailsService.AcceptItem(param);
        AcceptItm.then(function (success) {
            $scope.Status = success.data.status;
            if ($scope.Status === 200) {
                $scope.ItemDetails.status.id = 5; $scope.ItemDetails.status.status = "Approved"

                toastr.remove()
                toastr.success(success.data.message, $translate.instant("SuccessHeading"));
            }
        }, function (error) {
            toastr.remove()
            toastr.error(error.data.errorMessage, $translate.instant("ErrorHeading"));
        });
    }

    $scope.GetItemImage = GetItemImage;
    function GetItemImage() {
        var param = {
            "itemId": $scope.CommonObj.ItemId
        };
        var GetImageOfItem = AdjusterLineItemDetailsService.gteItemImagess(param);
        GetImageOfItem.then(function (success) {
            $scope.images = success.data.data;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        });
    }

    $scope.mapSupervisorReviewData = function () {
        $scope.defaultRecepients = [];
        // if null get all Claimparticipants
        // if (!$scope.ClaimParticipantsList || !$scope.ClaimParticipantsList.length) {
        //     getItemParticipants();
        // }
        if ($scope.ClaimParticipantsList && $scope.ClaimParticipantsList.length > 0) {
            //Selected Claim supervisor has default recepient
            $scope.defaultRecepients.push($scope.ClaimParticipantsList.find(participant => participant.role === 'CLAIM SUPERVISOR'))
            AddNotePopup('REVIEW');
        }
    }

    $scope.supervisorReview = supervisorReview;
    function supervisorReview() {
        $(".page-spinner-bar").removeClass("hide");

        //bootbox.alert({
        //    size: "",
        //    title: "Status",
        //    closeButton: false,
        //    message: "Item sent for supervisor approval..",
        //    className: "modalcustom",
        //    callback: function () { /* your callback code */ }
        //});
        var param = {
            "itemUID": $scope.ItemDetails.itemUID
        };
        var addSuperVisorReview = AdjusterLineItemDetailsService.addSuperVisorReview(param);
        addSuperVisorReview.then(function (success) {
            $(".page-spinner-bar").addClass("hide");
            var getItemParam = {
                "itemId": $scope.CommonObj.ItemId
            };
            var getItemDetailsOnId = AdjusterLineItemDetailsService.gteItemDetails(getItemParam);
            getItemDetailsOnId.then(function (success) {
                $scope.ItemDetails = success.data.data;

                // Set Default condition - Very Good
                if ($scope.ItemDetails.condition == null) {
                    $scope.ItemDetails.condition = { "conditionId": 3, "conditionName": "Very Good" }
                }
                $scope.Comparables = {
                    comparableItems: $scope.ItemDetails.comparableItems
                }
                mapComparables();
                GetSubCategory();
                if ($scope.ItemDetails.assignedTo !== null)
                    $scope.AssignedName = $scope.ItemDetails.assignedTo.firstName + " " + $scope.ItemDetails.assignedTo.lastName;
                else
                    $scope.AssignedName = ""
                $scope.CommonObj.SearchComparables = angular.copy($scope.ItemDetails.description)
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
            });
            toastr.remove()
            $(".page-spinner-bar").addClass("hide");
            toastr.success(success.data.message, $translate.instant("SuccessHeading"));
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove()
            $(".page-spinner-bar").addClass("hide");
            toastr.error(error.data.errorMessage, $translate.instant("ErrorHeading"));
        });
    };

    $scope.GetNoteDetails = GetNoteDetails;
    function GetNoteDetails(item, ind) {
        var window = angular.element($window);
        if (window.width() < 767) {
            $(".sidebar").css("display", "none");
            $(".messages").css("display", "block");
        }
        $scope.NoteIndex = ind;
        $scope.NoteDetails = item;
        $scope.expandMessageBox(true);
        $timeout(function () {
            var $id = $("#chat_history");
            //$id.scrollTop($id[0].scrollHeight);
            $id.scrollTop($(document).height());
        }, 1000);
        $scope.reply.messageForm.$setUntouched();
    };

    $scope.hideChatHistory = function () {
        $(".sidebar").css("display", "block");
        $(".messages").css("display", "none");
        $scope.reply.messageForm.$setUntouched();
    }

    //New Note
    $scope.AddNotePopup = AddNotePopup;
    function AddNotePopup(operation) {
        var obj = {
            "ClaimId": $scope.CommonObj.ClaimId,
            "ClaimNumber": $scope.CommonObj.ClaimNumber,
            "ItemId": $scope.CommonObj.ItemId,
            "ItemUID": $scope.ItemDetails.itemUID,
            "ParticipantList": $scope.ClaimParticipantsList.filter(function (cp) {
                if (cp.emailId != sessionStorage.getItem("UserName"))
                    return cp;
            }),
            "subject": operation === 'REVIEW' ? "Supervisor Review" : null,
            "defaultRecepients": operation === 'REVIEW' && $scope.defaultRecepients.length > 0 ? $scope.defaultRecepients : null,
            "assignmentNumber": $scope.ItemDetails.assignmentDetails ? $scope.ItemDetails.assignmentDetails.assignmentNumber : null,
        };
        $scope.animationsEnabled = true;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/CommonTemplates/AddNotePopup.html",
                controller: "AddItemNotePopupController",
                backdrop: 'static',
                keyboard: false,
                resolve:
                {
                    objClaim: function () {
                        return obj;
                    }
                }

            });
        out.result.then(function (value) {
            //Call Back Function success
            if (value === "Success") {
                if (operation === 'REVIEW')
                    supervisorReview();
                else
                    GetMessages(null);
            }
        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };
    };

    $scope.GoToMER = GoToMER;
    function GoToMER() {
        var Item = [$scope.CommonObj.ItemId]
        sessionStorage.setItem("ClaimNumber", $scope.CommonObj.ClaimNumber);
        sessionStorage.setItem("ClaimId", $scope.CommonObj.ClaimId);
        sessionStorage.setItem("ItemNumber", $scope.ItemDetails.itemNumber);
        sessionStorage.setItem("ItemId", $scope.CommonObj.ItemId);
        sessionStorage.setItem("Items", JSON.stringify(Item));
        sessionStorage.setItem("BackPage", "AdjusterLineItemDetails");
        sessionStorage.setItem("ClaimDetailsPage", "AdjusterPropertyClaimDetails");
        sessionStorage.setItem("LineDetailsPage", "AdjusterLineItemDetails");
        $location.url('MER');
    };

    //GoTo View Quote
    $scope.GoToViewQuote = GoToViewQuote;
    function GoToViewQuote() {
        sessionStorage.setItem("ClaimNumber", $scope.CommonObj.ClaimNumber);
        sessionStorage.setItem("ClaimId", $scope.CommonObj.ClaimId);
        sessionStorage.setItem("ItemNumber", $scope.ItemDetails.itemNumber);
        sessionStorage.setItem("ItemUID", $scope.ItemDetails.itemUID);
        sessionStorage.setItem("assignmentNumber", $scope.ItemDetails.assignmentDetails.assignmentNumber);// not getting value  that's why hide
        sessionStorage.setItem("vendorNumber", $scope.ItemDetails.vendorDetails.registrationNumber);
        $location.url('ViewQuote');
    };

    $scope.SalvageDetails = {
        Selection: false
    };
    $scope.GetPolicyHolderDetails = GetPolicyHolderDetails;
    function GetPolicyHolderDetails() {
        var param_PolicyHolder =
        {
            "policyNumber": null,
            "claimNumber": $scope.CommonObj.ClaimNumber
        };
        var getDetails = PolicyHolderClaimDetailsService.getPolicyDetails(param_PolicyHolder);
        getDetails.then(function (success) {
            var res = success.data.data;
            if (res) {
                $scope.PolicyholderDetails = res;
                $scope.PolicyholderDetails.policyHolder.lastName = $scope.PolicyholderDetails.policyHolder.lastName.charAt(0).toUpperCase() + $scope.PolicyholderDetails.policyHolder.lastName.substr(1).toLowerCase();
                $scope.PolicyholderDetails.policyHolder.firstName = $scope.PolicyholderDetails.policyHolder.firstName.charAt(0).toUpperCase() + $scope.PolicyholderDetails.policyHolder.firstName.substr(1).toLowerCase();
            }
        }, function (error) {
            toastr.remove();
            if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                toastr.error(error.data.errorMessage, "Error")
            }
            else {
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
            }
        });
    }

    //File Upload
    $scope.AddAttachment = function () {
        angular.element('#FileUpload').trigger('click');
    }
    $scope.displayAddImageButton = false;
    $scope.attachmentList = [];
    $scope.getAttachmentDetails = function (e) {
        $scope.displayAddImageButton = true;
        $scope.$apply(function () {
            var files = event.target.files;
            $scope.filed = event.target.files;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var reader = new FileReader();
                reader.file = file;
                reader.fileName = files[i].name;
                reader.fileType = files[i].type;
                reader.fileExtension = files[i].name.substr(files[i].name.lastIndexOf('.'));
                //20 MB
                if (reader.file.size > 20000000) {
                    $scope.invalidAttachment = true;
                    return false;
                } else {
                    $scope.invalidAttachment = false;
                }
                reader.onload = $scope.LoadFileInList;
                reader.readAsDataURL(file);
            }
            angular.element("#FileUpload").val(null);
        });
        $scope.itemForm.contents.$setDirty();
    };

    var randomId = Math.floor((Math.random() * 100) + 1);
    $scope.LoadFileInList = function (e) {
        var isFileExist = false;
        angular.forEach($scope.attachmentList, function (file) {
            if (e.target.fileName === file.FileName)
                isFileExist = true
        });
        if (isFileExist) {
            toastr.remove();
            toastr.warning("Attachment with name '" + e.target.fileName + "' already exists");
        }
        else {
            $scope.$apply(function () {
                $scope.attachmentList.push(
                    {
                        "FileName": e.target.fileName, "FileExtension": e.target.fileExtension, "FileType": e.target.fileType,
                        "Image": e.target.result, "File": e.target.file, "isLocal": true,
                        "imageId": "LOC_" + randomId++
                    })
            });
        }
    }

    $scope.RemoveAttachment = RemoveAttachment;
    function RemoveAttachment(index) {
        if ($scope.attachmentList.length > 0) {
            $scope.attachmentList.splice(index, 1);
        }
        $scope.close();
    };

    $scope.attachmentsRmvd = [];
    $scope.RemoveEditAttachment = RemoveEditAttachment;
    function RemoveEditAttachment(index) {
        if ($scope.attachmentListEdit.length > 0) {
            $scope.attachmentsRmvd.push($scope.attachmentListEdit[index]);
            $scope.attachmentListEdit.splice(index, 1);
            $scope.itemForm.contents.$setDirty();
        }
    }
    //End File Upload
    $scope.SaveItemDetails = function (itemid) {
        var param = new FormData();
        angular.forEach($scope.attachmentList, function (ItemFile) {
            param.append('filesDetails', JSON.stringify([{
                "fileName": ItemFile.FileName,
                "fileType": ItemFile.FileType,
                "extension": ItemFile.FileExtension,
                "filePurpose": "Item",
                // "latitude": 41.403528,
                // "longitude": 2.173944,
                "footNote": Item.footNote
            }]));
            param.append('file', ItemFile.File);
        });
        if ($scope.attachmentList.length == 0 || $scope.attachmentList == null) {
            param.append('filesDetails', null);
            param.append('file', null);
        };

        param.append("itemDetails",
            JSON.stringify(
                {
                    "id": $scope.ItemDetails.id,
                    "ageMonths": $scope.ItemDetails.ageMonths,
                    "ageYears": $scope.ItemDetails.ageYears,
                    "brand": $scope.ItemDetails.brand,
                    "category": {
                        "annualDepreciation": $scope.ItemDetails.category && $scope.ItemDetails.category.annualDepreciation ? $scope.ItemDetails.category.annualDepreciation : null,
                        "id": $scope.ItemDetails.category && $scope.ItemDetails.category.id ? $scope.ItemDetails.category.id : null,
                        "name": $scope.ItemDetails.category && $scope.ItemDetails.category.name ? $scope.ItemDetails.category.name : null,
                        "usefulYears": $scope.ItemDetails.category && $scope.ItemDetails.category.usefulYears ? $scope.ItemDetails.category.usefulYears : null,
                        "aggregateLimit": $scope.ItemDetails.category && $scope.ItemDetails.category.aggregateLimit ? $scope.ItemDetails.category.aggregateLimit : null,
                        "description": $scope.ItemDetails.category && $scope.ItemDetails.category.description ? $scope.ItemDetails.category.description : null
                    },
                    "claimId": $scope.ItemDetails.claimId,
                    "claimNumber": $scope.ItemDetails.claimNumber,
                    "depriciationRate": $scope.ItemDetails.depriciationRate,
                    "appraisalValue": $scope.ItemDetails.appraisalValue,
                    "appraisalDate": $filter('DatabaseDateFormatMMddyyyy')($scope.ItemDetails.appraisalDate),
                    "description": $scope.ItemDetails.description,
                    "insuredPrice": $scope.ItemDetails.insuredPrice,
                    "individualLimitAmount": $scope.ItemDetails.individualLimitAmount,
                    "itemName": $scope.ItemDetails.itemName,
                    //"isScheduledItem": $scope.ItemDetails.isScheduledItem,
                    //"scheduleAmount": $scope.ItemDetails.scheduleAmount,
                    "model": $scope.ItemDetails.model,
                    "quantity": $scope.ItemDetails.quantity,
                    "status": {
                        "id": $scope.ItemDetails.status.id,
                        "status": $scope.ItemDetails.status.status
                    },
                    "subCategory": {
                        "annualDepreciation": $scope.ItemDetails.subCategory && $scope.ItemDetails.subCategory.annualDepreciation ? $scope.ItemDetails.subCategory.annualDepreciation : null,
                        "id": $scope.ItemDetails.subCategory && $scope.ItemDetails.subCategory.id ? $scope.ItemDetails.subCategory.id : null,
                        "name": $scope.ItemDetails.subCategory && $scope.ItemDetails.subCategory.name ? $scope.ItemDetails.subCategory.name : null,
                        "usefulYears": $scope.ItemDetails.subCategory && $scope.ItemDetails.subCategory.usefulYears ? $scope.ItemDetails.subCategory.usefulYears : null,
                        "description": $scope.ItemDetails.subCategory && $scope.ItemDetails.subCategory.description ? $scope.ItemDetails.subCategory.description : null,
                        "aggregateLimit": $scope.ItemDetails.subCategory && $scope.ItemDetails.subCategory.aggregateLimit ? $scope.ItemDetails.subCategory.aggregateLimit : null
                    },
                    //"itemNumber": $scope.ItemDetails.itemNumber,
                }
            ));


        var UpdatePostLoss = AdjusterLineItemDetailsService.UpdatePostLoss(param);
        UpdatePostLoss.then(function (success) {
            $(".page-spinner-bar").removeClass("hide");
            $scope.ItemDetails = success.data.data;

            // Set Default condition - Very Good
            if ($scope.ItemDetails.condition == null) {
                $scope.ItemDetails.condition = { "conditionId": 3, "conditionName": "Very Good" }
            }

            $scope.ItemDetails.appraisalDate = (angular.isDefined($scope.ItemDetails) && $scope.ItemDetails.appraisalDate != null) ? ($filter('DateFormatMMddyyyy')($scope.ItemDetails.appraisalDate)) : null;
            $(".page-spinner-bar").addClass("hide");
            toastr.remove()
            toastr.success(success.data.message, $translate.instant("ItemEditSuccessHeading"));
            $scope.reset();
        },
            function (error) {
                $(".page-spinner-bar").addClass("hide");
                toastr.remove()
                toastr.error(error.data.errorMessage, $translate.instant("ItemEditErrorHeading"));
            });
    };
    $scope.getPostLostItems = getPostLostItems;
    function getPostLostItems() {
        // get line items stored data from factory
        $scope.FiletrLostDamageList = [];
        var storedData = LineItemsFactory.getItemsList();
        if (!storedData)
            storedData = JSON.parse(sessionStorage.getItem("postLostItems"));
        if (storedData && storedData.claim && storedData.claim.claimNumber === $scope.CommonObj.ClaimNumber)
            $scope.FiletrLostDamageList = storedData.originalItemsList

        if ($scope.FiletrLostDamageList && $scope.FiletrLostDamageList.length > 0) {
            if (!$scope.setPageCalled) {
                setPage($scope.pageIndex);
            }
        }
        // If is still empty
        else {
            //get Items list by service call
            let param = {
                // "claimNumber": $scope.CommonObj.ClaimNumber
                "claimId": $scope.CommonObj.ClaimId
            }
            //var items = AdjusterPropertyClaimDetailsService.getPostLostItemsWithComparables(param);
            var items = AdjusterPropertyClaimDetailsService.getPostLostItemsForAdjuster(param);
            items.then(function (success) {
                //$scope.FiletrLostDamageList = success.data.data.itemReplacement;
                $scope.FiletrLostDamageList = success.data.data;
                if ($scope.FiletrLostDamageList && !$scope.setPageCalled)
                {
                    if(Number.isNaN($scope.pageIndex) || $scope.pageIndex==null)
                    {
                        calculatePageIndex();   
                    }
                  if(sessionStorage.getItem("AdjusterPostLostItemId") != null)
                  {
                    $scope.FiletrLostDamageList.forEach((i, index) => {
                    if(i.id == sessionStorage.getItem("AdjusterPostLostItemId"))
                    {
                        $scope.pageIndex =index +1;
                    }
                    });
                }
                   
                    setPage($scope.pageIndex);
                }
                // store item list in a factory
                LineItemsFactory.addItemsToList(angular.copy($scope.FiletrLostDamageList), param);
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
                $(".page-spinner-bar").addClass("hide");
            });
        }
    }

    $scope.DisableItemArrows = DisableItemArrows;
    function DisableItemArrows() {
        let index = $scope.FiletrLostDamageList.findIndex(item => item.id == sessionStorage.getItem("AdjusterPostLostItemId"));
        $scope.itemIndex = index + 1;
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

    $scope.ChangePreviousItem = ChangePreviousItem;
    function ChangePreviousItem($event) { 
        if ($scope.itemForm.contents.$invalid) {
            utilityMethods.validateForm($scope.itemForm.contents);
            return false;
        }
        $(".page-spinner-bar").removeClass("hide");
        sessionStorage.setItem('tab', 'Contents');
        $scope.tab = 'Contents';
        if ($scope.PrevStep == true) {
            let index = $scope.FiletrLostDamageList.findIndex(item => item.id === $scope.ItemDetails.id);
            setPage(index);
        } else if ($scope.PrevStep == false) {
            let index = $scope.FiletrLostDamageList.length;
            setPage(index);
        }
    }

    $scope.ChangeNextItem = ChangeNextItem;
    function ChangeNextItem($event) {        
        if ($scope.itemForm.contents.$invalid) {
            utilityMethods.validateForm($scope.itemForm.contents);
            return false;
        }
        $(".page-spinner-bar").removeClass("hide");
        sessionStorage.setItem('tab', 'Contents');
        $scope.tab = 'Contents';
        if ($scope.NextStep == true) {
            let index = $scope.FiletrLostDamageList.findIndex(item => item.id === $scope.ItemDetails.id);
            sessionStorage.setItem("AdjusterPostLostItemId", $scope.FiletrLostDamageList[index + 1].id);

            setPage(index + 2);
        } else if ($scope.NextStep == false) {
            let index = 0;
            setPage(index + 1);
        }
    }

    $scope.showMessages = showMessages;
    function showMessages() {
        $(".page-spinner-bar").removeClass("hide");
        $scope.tab = 'Notes';
        GetMessages(null);
        $(".page-spinner-bar").addClass("hide");
    }
    //Unused
    $scope.saveAttachment = saveAttachment;
    function saveAttachment() {
        var param = new FormData();
        $scope.filesDetails = [];
        angular.forEach($scope.attachmentList, function (ItemFile) {
            $scope.filesDetails.push({
                "fileName": ItemFile.FileName, "fileType": ItemFile.FileType, "extension": ItemFile.FileExtension, "filePurpose": "ITEM", "latitude": null, "longitude": null, "footNote": null
            });
            param.append('file', ItemFile.File);

        });
        param.append('filesDetails', JSON.stringify($scope.filesDetails));

        if ($scope.attachmentList.length == 0 || $scope.attachmentList == null) {
            param.append('filesDetails', null);
            param.append('file', null);
        };
        param.append("itemDetail",
            JSON.stringify(
                {
                    "itemId": $scope.ItemDetails.id
                }));
        var saveAttachmentDetails = AdjusterLineItemDetailsService.saveAttachmentList(param);
        saveAttachmentDetails.then(function (success) {
            toastr.remove()
            toastr.success(success.data.message, $translate.instant("ItemEditSuccessHeading"));
            getAttachment();
            $scope.cancelAttachment();
        }, function (error) {
            toastr.remove()
            toastr.error(error.data.errorMessage, $translate.instant("ErrorHeading"));
        });
    }

    $scope.attachmentListEdit = [];
    $scope.getAttachment = getAttachment;
    function getAttachment(attachments) {
        $scope.attachmentListEdit = [];
        angular.forEach(attachments, function (ItemFile) {
            $scope.attachmentListEdit.push(
                {
                    "id": ItemFile.id, "FileName": ItemFile.name, "FileType": ItemFile.type, "url": ItemFile.url,
                    "uploadDate": ItemFile.uploadDate
                });
        });
    }

    $scope.cancelAttachment = cancelAttachment;
    function cancelAttachment() {
        $scope.displayAddImageButton = false;
        $scope.attachmentList = [];
        angular.element("input[type='file']").val(null);
    }

    $scope.deleteItemAttachment = deleteItemAttachment;
    function deleteItemAttachment(document) {
        bootbox.confirm({
            size: "",
            closeButton: false,
            title: "Delete '" + document.FileName + "'",
            message: "Are you sure you want to delete this attachment? <b>Please Confirm!",
            className: "modalcustom", buttons: {
                confirm: {
                    label: 'Yes',
                    className: 'btn-outline green'
                },
                cancel: {
                    label: 'No',
                    className: 'btn-outline red'
                }
            },
            callback: function (result) {
                //if (result)  call delet function
                if (result) {
                    $scope.$apply(function () {
                        if (document.isLocal) {
                            if ($scope.attachmentList.length > 0) {
                                var index = $scope.attachmentList.findIndex(file => file.imageId === document.imageId);
                                if (index > -1)
                                    $scope.attachmentList.splice(index, 1);
                            }
                        }
                        else {
                            $(".page-spinner-bar").removeClass("hide");
                            var param = {
                                id: !document.id ? (!document.imageId ? null : document.imageId) : document.id,
                                purpose: document.purpose
                            }
                            var promis = AdjusterLineItemDetailsService.deleteMediaFile(param);
                            promis.then(function (success) {
                                if ($scope.tab == 'Notes') {
                                    var message = $scope.NoteDetails.messages.find(msg => msg.noteId === document.message.id);
                                    if (message) {
                                        var attachmentIndex = message.attachments.findIndex(attachment => attachment.imageId === document.imageId);
                                        if (attachmentIndex > -1)
                                            message.attachments.splice(attachmentIndex, 1);
                                    }
                                }
                                else {
                                    var editIndex = $scope.attachmentListEdit.findIndex(file => file.id === document.id);
                                    if (editIndex > -1)
                                        $scope.attachmentListEdit.splice(editIndex, 1);
                                }
                                toastr.remove()
                                toastr.success(success.data.message, "Success");
                                $(".page-spinner-bar").addClass("hide");
                            }, function (error) {
                                toastr.remove()
                                toastr.error(error.data.errorMessage, "Error");
                                $(".page-spinner-bar").addClass("hide");
                            });
                        }
                        $scope.imgDiv = false;
                    });
                }
            }
        });
    }

    $scope.replyMessage = function (NoteDetails) {
        $(".page-spinner-bar").removeClass("hide");
        var data = new FormData();
        if ($scope.reply.uploadedMessageFiles.length > 0) {
            var FileDetails = [];
            angular.forEach($scope.reply.uploadedMessageFiles, function (item) {
                FileDetails.push({
                    "fileName": item.FileName, "fileType": item.FileType,
                    "extension": item.FileExtension,
                    "filePurpose": "NOTE", "latitude": null, "longitude": null
                });
                data.append("file", item.File);
            });
            data.append("mediaFilesDetail", JSON.stringify(FileDetails));
        }
        else {
            data.append("mediaFilesDetail", null);
            data.append("file", null);
        }
        var registrationNumber = NoteDetails.isAddedByVendor ? NoteDetails.vendorURN : null;
        data.append("noteDetail", JSON.stringify(
            {
                "isPublicNote": NoteDetails.isPublicNote,
                "registrationNumber": registrationNumber,
                "sender": sessionStorage.getItem("CRN"),
                "isInternal": angular.isDefined(registrationNumber) && registrationNumber != "" ? false : true,
                "claimNumber": $scope.CommonObj.ClaimNumber,
                "itemUID": $scope.ItemDetails.itemUID,            // if it is item level note
                "serviceRequestNumber": null,
                "message": $scope.reply.message,
                "groupDetails":
                    { "groupId": NoteDetails.groupId, "groupNumber": NoteDetails.groupNumber }
            }))

        var getpromise = AdjusterLineItemDetailsService.ReplyClaimNote(data);
        getpromise.then(function (success) {
            $scope.Status = success.data.status;
            if ($scope.Status == 200) {
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");
                GetMessages();
                $scope.reply.message = null;
                $scope.reply.messageForm.$setUntouched();
                $scope.reply.uploadedMessageFiles = [];
                angular.element("input[type='file']").val(null);
                $(".page-spinner-bar").addClass("hide");
            }
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
            $scope.ErrorMessage = error.data.errorMessage;
            $(".page-spinner-bar").addClass("hide");
        });
    }
    $scope.deleteMessage = deleteMessage;
    function deleteMessage(item, participants) {
        bootbox.confirm({
            size: "",
            //title: "Delete Message",
            message: "Are you sure want to delete the message?", closeButton: false,
            className: "modalcustom", buttons: {
                confirm: {
                    label: "Yes",
                    className: 'btn-outline green'
                },
                cancel: {
                    label: "No",
                    className: 'btn-outline red'
                }
            },
            callback: function (result) {
                if (result) {
                    if (angular.isDefined(item.noteUID) && item.noteUID !== null) {
                        $(".page-spinner-bar").removeClass("hide");
                        var param = {
                            "noteUID": item.noteUID
                        };
                        var promis = LineItemService.deleteMessage(param);
                        promis.then(function (success) {
                            GetMessages(null);
                            toastr.remove();
                            toastr.success(success.data.message, "Confirmation");
                        },
                            function (error) {
                                toastr.remove();
                                if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                                    toastr.error(error.data.errorMessage, "Error")
                                }
                                else {
                                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
                                }
                                $(".page-spinner-bar").addClass("hide");
                            });

                    };
                }
            }
        });
    }

    $scope.ShowActivityLogTab = ShowActivityLogTab;
    function ShowActivityLogTab() {
        $scope.tab = 'ActivityLog';
        sessionStorage.setItem('tab', 'ActivityLog');
        sessionStorage.setItem("AdjusterPostLostItemId", $scope.CommonObj.ItemId);
        sessionStorage.setItem("BackPage", "AdjusterLineItemDetails");
    };

    $scope.newImageIndex = null;
    //Attachments preview
    $scope.GetDocxDetails = function (item, index) {
        $scope.showDownload = true;
        $scope.showDelete = true;
        if (index != undefined && index != null) {
            $scope.newImageIndex = index;
        }
        $scope.pdf = true;
        $scope.currentPDFUrl = $scope.pdfUrl;
        $scope.pageToDisplay = 1;
        $scope.pageNum = 1;
        $scope.isPDF = 0;
        $scope.DocxDetails = item;
        if ($scope.DocxDetails.isLocal) {
            $scope.showDownload = false;
            $scope.DocxDetails.url = item.Image;
        } else {
            if (($scope.tab == 'Notes' && $scope.CommonObj.UserId != item.addedByUser.id) || $scope.ItemDetails.status.status === $scope.constants.itemStatus.underReview)
                $scope.showDelete = false;
        }
        $scope.ReceiptList = $scope.DocxDetails.url;
        $scope.pdfUrl = $scope.ReceiptList;
        var pdf = ["pdf", "application/pdf"];
        var img = ["image", "application/image", "image/png", "image/jpeg","image/jpg", "image/gif", "png", "jpg", "jpeg", "gif", "image", "PNG", "JPEG", "GIF", "JPG"];
        $scope.imgDiv = true;
        if (pdf.indexOf(($scope.DocxDetails.FileType.toLowerCase())) > -1) {
            $scope.isPDF = 1;
        }
        else if (img.indexOf(($scope.DocxDetails.FileType.toLowerCase())) > -1) {
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
                .css({
                    'right': $('.page-wrapper-middle').offset().left + 'px'
                })
                .show();
            // $("#img_preview").show();
        }, 100);
    }
    $scope.close = function () {
        $scope.imgDiv = false;
        $scope.newImageIndex = null;
        $("#img_preview").hide();
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
    $scope.refresh = function () {
        getAttachment();
    }
    //Fuction to download uploaded files.
    $scope.downloadAttachment = function (data) {
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

    //go to search results page
    $scope.goToSearchResult = goToSearchResult;
    function goToSearchResult() {
        $location.path("/AdjusterGlobalSearch");
    }

    // go to people details page
    $scope.goToPeopleDetails = goToPeopleDetails
    function goToPeopleDetails() {
        $location.path("/PeopleDetails");
    }

    // SLVG-49
    // Get Shipping methods.
    $scope.GetShippingMethods = GetShippingMethods;
    function GetShippingMethods() {
        var shippingMethods = AdjusterLineItemDetailsService.getShippingMethods();
        shippingMethods.then(function (success) {
            $scope.shippingMethodsList = success.data.data;
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    }

    //CTB-2056
    $scope.GotoInvoiceDetails = function (invoice) {
        // var ObjDetails = {
        // "InvoiceNo": invoice.invoiceNumber,
        // "ClaimNo": $scope.CommonObj.ClaimNumber,
        // "PageName": "AdjusterPropertyClaimDetails"
        // };
        var ObjDetails = {
            "InvoiceNo": invoice.invoiceNumber,
            "ClaimNo": $scope.CommonObj.ClaimNumber,
            "ItemNo": $scope.ItemDetails.itemNumber,
            "InvoicesToBePaid": $scope.TotalInvoicesToBePaid,
            "isServiceRequestInvoice": invoice.isServiceRequestInvoice,
            "PageName": "ClaimItems",
            "PagePath": "AdjusterClaimItems"
        };
        sessionStorage.setItem("Details", JSON.stringify(ObjDetails))
        $location.url('VendorInvoiceDetails');
    };

    $scope.CheckForAlreadyAddedComparables = CheckForAlreadyAddedComparables;
    function CheckForAlreadyAddedComparables() {
        if ($scope.Comparables != null && $scope.Comparables.comparableItems != null) {
            angular.forEach($scope.Comparables.comparableItems, function (item) {
                $scope.AddedComparables.push({
                    "id": item.id,
                    "isvendorItem": item.isvendorItem,
                    "description": item.description,
                    "itemName": $scope.ItemDetails.itemName,
                    "price": item.price,
                    "taxRate": item.taxRate,
                    "brand": item.brand,
                    "model": item.model,
                    "supplier": item.supplier,
                    "itemType": item.itemType,
                    "isReplacementItem": ($scope.ItemDetails.isReplacementItem) ? $scope.ItemDetails.isReplacementItem : false,
                    "buyURL": item.buyURL,
                    "isDataImage": item.isDataImage,
                    "imageData": (item.imageData) ? item.imageData : item.imageURL,
                    "imageURL": (item.imageData) ? item.imageData : item.imageURL,
                    "isDelete": item.isDelete ? true : false,
                    "replacementItemUID": item.replacementItemUID
                })
            })
        } else {
            $scope.AddedComparables = [];
        }
        if ($scope.Comparables.comparableItems != null) {
            $scope.displayReplacement = false;
            $scope.displaycomparables = true;
            $scope.displayEmptyPart = false;
            $scope.dispalyAddedComparables = false;
        }
        else {
            $scope.displaycomparables = false;
            $scope.displayEmptyPart = true;
            //$scope.SearchReplacement();
            $scope.dispalyAddedComparables = false;
        }
    };

    $scope.getRooms = getRooms;
    function getRooms() {
        var rooms = AdjusterLineItemDetailsService.getRooms($scope.CommonObj.ClaimNumber);
        rooms.then(function (success) {
            $scope.RoomsList = success.data.data;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    };

    $scope.getRetailers = getRetailers;
    function getRetailers() {
        var retailers = AdjusterLineItemDetailsService.getRetailers();
        retailers.then(function (success) {
            if (success.data.data) {
                $scope.Retailers = success.data.data.retailers;
                $scope.paymentTypes = success.data.data.paymentTypes;
            }
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    };

    $scope.selectRoom = function (room) {
        if (room) {
            $scope.ItemDetails.room = {
                "id": room.id,
                "roomName": room.roomName
            }
        } else
            $scope.ItemDetails.room = null;
    }
    $scope.selectRetailer = function (retailer) {
        if (retailer) {
            $scope.ItemDetails.originallyPurchasedFrom = {
                "id": retailer.id,
                "name": retailer.name
            }
            // if (retailer.name === 'Other')
            //     $scope.newRetailer.addOtherRetailer = true;
        }
        else {
            $scope.ItemDetails.originallyPurchasedFrom = null;
        }
        $scope.ItemDetails.newRetailer = null;
        $scope.newRetailer.addOtherRetailer = false;
    }

    $scope.selectPaymentmethod = function (paymentMethod) {
        if (paymentMethod === 'Gift')
            $scope.ItemDetails.originallyPurchasedFrom = null;
        else
            $scope.ItemDetails.giftedFrom = null;
    }

    $scope.SetScheduledStatus = SetScheduledStatus;
    function SetScheduledStatus(item, status) {
        item.isScheduledItem = status;
    };

    $scope.CreateCustomItem = CreateCustomItem;
    function CreateCustomItem() {
        // if ($scope.ItemDetails.CustomItemType == "2") {
        sessionStorage.setItem("ClaimNo", $scope.CommonObj.ClaimNumber)
        sessionStorage.setItem("ClaimId", $scope.CommonObj.ClaimId)
        sessionStorage.setItem("Policyholder", $scope.CommonObj.PolicyHolder)
        sessionStorage.setItem("ItemNumber", $scope.ItemDetails.itemNumber);
        sessionStorage.setItem("ItemId", $scope.CommonObj.ItemId);
        sessionStorage.setItem("Page", "AdjusterLineItemDetails");

        $location.path("/AddCustomItem");
        // }
        // else {
        //     $scope.AddCustomItemPopup();
        // }

    };
   
    $scope.addToComparableAndMarkAsReplacement = addToComparableAndMarkAsReplacement;
    function addToComparableAndMarkAsReplacement(comaprable) {
        if($scope.CategoryList && $scope.ItemDetails.category && $scope.ItemDetails.category.id){

        if ($scope.SubCategoryList
            && $scope.ItemDetails.subCategory && $scope.ItemDetails.subCategory.id) {
            var subcategory = $scope.SubCategoryList.find(x => x.id == $scope.ItemDetails.subCategory.id);

            if(subcategory.associateSubCat && subcategory.associateSubCat!=""){
                if(comaprable.price<subcategory.minPricePoint || comaprable.price>subcategory.maxPricePoint){
                    var subcat =$scope.SubCategoryList.find(x => x.associateSubCat == subcategory.associateSubCat && x.id!=subcategory.id)
                $timeout(function(){
                        $("#itemSubCategorySel").select2();
                        $("#floatingSubCatSel").select2();
                    },10)

                $scope.ItemDetails.subCategory.id = subcat?subcat.id:$scope.ItemDetails.subCategory.id;
                }
            }
            $scope.ItemDetails.isReplaced = true;
            $scope.websearchMarkReplItem = true;            
            AddtoComparableList(comaprable);
            MarkAsReplacement(comaprable);
        
        }
    //subcategory else part
    else{
            $timeout( function(){
                toastr.warning("Please select subcategory","Warning", {timeOut: 5000});
            },0);

        $timeout( function(){
            var rapidPricingElement=document.getElementsByClassName('summaryBox');
            if(!rapidPricingElement[0].className.includes('hide'))
            document.getElementById('floatingSubCatSel').focus();
            else
            document.getElementById('itemSubCategorySel').focus();
        },1000)

        }
    }
    //category else part
    else{
        $timeout( function(){
            toastr.warning("Please select category and subcategory","Warning", {timeOut: 5000});
        },0);

    $timeout( function(){
        var rapidPricingElement=document.getElementsByClassName('summaryBox');
        if(!rapidPricingElement[0].className.includes('hide'))
        document.getElementById('floatingboxSel').focus();
        else
        document.getElementById('itemCategorySel').focus();
    },1000)  
    }

    }

    $scope.setContentTab = function () {
        $scope.tab = 'Contents';
        sessionStorage.setItem('tab', 'Contents');
    }

    $scope.expandMessageBox = function (isMessageGrp) {
        var toGetId = "#messages";
        if ($(toGetId).hasClass("expand_msg_box") || isMessageGrp) {
            $(toGetId).removeClass("expand_msg_box");
        }
        else {
            $(toGetId).addClass("expand_msg_box");
        }
    }
    $scope.clearVideoLink = function () {
        $scope.ItemDetails.videoLink = "";
    }

    $scope.playVideo = function () {
        $scope.videoLinkEditable = false;
    }
    $scope.editVideoLink = function () {
        $scope.videoLinkEditable = true;
    }
    $scope.playVideoOnDblClick = function () {
        // var urlStr = $scope.ItemDetails.videoLink;
        // if (urlStr != null && !urlStr.includes("http")) {
        //     urlStr = "https://" + $scope.ItemDetails.videoLink;
        // }
        // $window.open(urlStr, '_blank');
        $scope.videoDiv = true;
        if ($scope.ItemDetails.videoLink.includes("watch?v=")) {
            $scope.givenURL = $scope.ItemDetails.videoLink.replace("watch?v=", "embed/");
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

    $scope.closeVideoPreview = closeVideoPreview;
    function closeVideoPreview() {
        $('iframe').attr('src', $('iframe').attr('src'));
        setTimeout(function () {
            $scope.videoDiv = false;
            $("#video_preview").hide()
        }, 1000);
    }

    $scope.setPage = setPage;
    function setPage(page) {
        // reseting flag
        $scope.reCheckSearchCount = 0;

        $(".page-spinner-bar").removeClass("hide");
        // if ($scope.itemForm.contents && $scope.itemForm.contents.$invalid) {
        //     utilityMethods.validateForm($scope.itemForm.contents);
        //     return false;
        // }
        $scope.totalPages = $scope.FiletrLostDamageList.length;
        if (page < 1 || page > $scope.totalPages) {
            return;
        }
        $scope.pageIndex = page;
        sessionStorage.setItem("pageIndex", $scope.pageIndex)
        // get pager object from service
        $scope.pager = getPage(page);
        if (page > 0) {
            sessionStorage.setItem("AdjusterPostLostItemId", $scope.FiletrLostDamageList[page - 1].id);
            $scope.CommonObj.ItemId = $scope.FiletrLostDamageList[page - 1].id;
            $scope.CommonObj.PurchaseItemId = $scope.FiletrLostDamageList[page - 1].id;
            // save current item if only form fields are updated before changing to previous, this is a internal service call
            if ($scope.setPageCalled && ($scope.ItemDetails.status ? $scope.ItemDetails.status.status != $scope.constants.itemStatus.underReview : true) && $scope.itemForm.contents.$dirty)
                SaveNewlyAddedComparables(true, function () {
                    $scope.GoogleComparableList=[];
                    getItemDetails();
                });
            else{
                $scope.GoogleComparableList=[];
                getItemDetails();
            }
            $scope.acceptedStandardCost = false;
        }
        $scope.setPageCalled = true;
        DisableItemArrows();
    }

    $scope.getPage = getPage;
    function getPage(currentPage) {
        var startPage = 0;
        var endPage = 0;
        if ($scope.totalPages <= 6) {
            startPage = 1;
            endPage = $scope.totalPages;
        }
        else {
            if (currentPage <= 4) {
                startPage = 1;
                endPage = 7;
            }
            else if (currentPage >= $scope.totalPages - 4) {
                startPage = $scope.totalPages - 5;
                endPage = $scope.totalPages;
            }
            else {
                startPage = currentPage - 2;
                endPage = currentPage + 3;
            }
        }
        var pages = [];
        for (var i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return {
            currentPage: currentPage,
            startPage: startPage,
            endPage: endPage,
            pages: pages
        }
    }

    $scope.markItemAsReplaced = function () {
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "id": $scope.ItemDetails.id,
            "itemUID": $scope.ItemDetails.itemUID,
            "status": {
                "status": "REPLACED"
            }
        }
        var statusUpdated = LineItemService.updateItemStatus(param);
        statusUpdated.then(function (success) {
            if (success)
                $scope.ItemDetails.status = success.data.data.status;
            toastr.remove()
            toastr.success(success.data.message, $translate.instant("SuccessHeading"));
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            toastr.remove()
            toastr.success(error.data.errorMessage, $translate.instant("ErrorHeading"));
            $(".page-spinner-bar").addClass("hide");
        });
    }

    $scope.addNewRetailer = function () {
        $scope.ItemDetails.originallyPurchasedFrom = null;
        $scope.newRetailer.addOtherRetailer = true;
    }

    // CTB-2895
    $scope.ConversationPopup = ConversationPopup;
    function ConversationPopup(operation) {
        $scope.ItemDetails.noOfUnreadComment = 0;
        var obj = {
            "ClaimId": $scope.CommonObj.ClaimId,
            "ClaimNumber": $scope.CommonObj.ClaimNumber,
            "ItemId": $scope.CommonObj.ItemId,
            "ItemUID": $scope.ItemDetails.itemUID,
            "description": $scope.ItemDetails.description,
            "ParticipantList": $scope.ClaimParticipantsList.filter(function (cp) {
                if (cp.emailId != sessionStorage.getItem("UserName"))
                    return cp;
            }),
            "UserId": sessionStorage.getItem("UserId"),
        };
        $scope.animationsEnabled = true;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/Adjuster/ConversationPopup.html",
                controller: "ConversationController",
                backdrop: 'static',
                keyboard: false,
                resolve:
                {
                    objMsg: function () {
                        return obj;
                    }
                }

            });
        out.result.then(function (value) {
            //Call Back Function success
            if (value === "Success") {
                $scope.Tab = sessionStorage.getItem("ActiveTab");
                showMessages();
                sessionStorage.removeItem("ActiveTab");
            }
            $scope.ItemDetails.noOfUnreadComment = 0;

        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };
    }
    // end CTB-2895   

     //Add Custom Item popup
     $scope.AddCustomItemPopup = AddCustomItemPopup;
     function AddCustomItemPopup(ev) {
         //$location.url("AddCustomItemPopup");
         //if ($scope.ClaimParticipantsList.length > 0) {
 
        if($scope.CategoryList && $scope.ItemDetails.category && $scope.ItemDetails.category.id){
            if ($scope.SubCategoryList
                && $scope.ItemDetails.subCategory && $scope.ItemDetails.subCategory.id) {
                var subcategory = $scope.SubCategoryList.find(x => x.id == $scope.ItemDetails.subCategory.id);
                
         // CTB-2870
         //$scope.customItem = true;
         //SaveNewlyAddedComparables(false);
 
         var obj = {
             "ClaimId": $scope.CommonObj.ClaimId,
             "itemUID": $scope.ItemDetails.itemUID,
             "CustomItemType": $scope.ItemDetails.CustomItemType,
             "applyTax" : $scope.ItemDetails.applyTax,
             "TaxRate" : $scope.ItemDetails.taxRate,
             "quantity" : $scope.ItemDetails.quantity
         };
         $scope.animationsEnabled = true;
         var out = $uibModal.open(
             {
                 size: "md",
                 animation: $scope.animationsEnabled,
                 templateUrl: "views/Adjuster/AddCustomItemPopup.html",
                 controller: "AddCustomItemPopupController",
                 backdrop: 'static',
                 keyboard: false,
                 resolve:
                 {
                     objClaim: function () {
                         return obj;
                     }
                 }
 
             });
         out.result.then(function (value) {
             $scope.ItemDetails.CustomItemType = "";
             //Call Back Function success
             if (value === "Success") {
                 //  console.log("log");
                 $scope.saveItem = true;
                 $scope.customItem = true;
                 getItemDetails();
             }
             //getItemDetails();
 
         }, function (res) {
             //Call Back Function close
 
             //getItemDetails();
         });
 
         return {
             open: open
         };
 
            
        }
            else{
                $timeout( function(){
                    toastr.warning("Please select subcategory","Warning", {timeOut: 5000});
                },0);
    
            $timeout( function(){
                var rapidPricingElement=document.getElementsByClassName('summaryBox');
                if(!rapidPricingElement[0].className.includes('hide'))
                document.getElementById('floatingSubCatSel').focus();
                else
                document.getElementById('itemSubCategorySel').focus();
            },1000)
    
            }
         
        } 
        //category else part
        else{
            $timeout( function(){
                toastr.warning("Please select category and subcategory","Warning", {timeOut: 5000});
            },0);

        $timeout( function(){
            var rapidPricingElement=document.getElementsByClassName('summaryBox');
            if(!rapidPricingElement[0].className.includes('hide'))
            document.getElementById('floatingboxSel').focus();
            else
            document.getElementById('itemCategorySel').focus();
        },1000)  
        }
     }
    
      //Add Custom Item popup
      $scope.EditCustomItemPopup = EditCustomItemPopup;
      function EditCustomItemPopup(item) {
            SaveNewlyAddedComparables(false);
          var obj = {
              "ClaimId": $scope.CommonObj.ClaimId,
              "itemUID": $scope.ItemDetails.itemUID,
              "CustomItemType": $scope.ItemDetails.CustomItemType,
              "CustomItem":item,
              "applyTax" : $scope.ItemDetails.applyTax,
             "TaxRate" : $scope.ItemDetails.taxRate,
             "quantity" : $scope.ItemDetails.quantity             
          };
          $scope.animationsEnabled = true;
          var out = $uibModal.open(
              {
                  size: "md",
                  animation: $scope.animationsEnabled,
                  templateUrl: "views/Adjuster/AddCustomItemPopup.html",
                  controller: "AddCustomItemPopupController",
                  backdrop: 'static',
                  keyboard: false,
                  resolve:
                  {
                      objClaim: function () {
                          return obj;
                      }
                  }
  
              });
          out.result.then(function (value) {
              $scope.ItemDetails.CustomItemType = "";
              if (value === "Success") {
                  $scope.saveItem = true;
                  $scope.customItem = true;
                  getItemDetails();
              }
          }, function (res) {
          });
  
          return {
              open: open
          };
      }

     $scope.CalculateRaplacementCost = function CalculateRaplacementCost(){

        $scope.ItemDetails.rcv = utilityMethods.parseFloatWithFixedDecimal($scope.ItemDetails.replacedItemPrice);
        angular.forEach($scope.Comparables.comparableItems, function (item) {
            if (item.isReplacementItem == true && !item.isDelete) {
                item.unitPrice =$scope.ItemDetails.rcv;
                item.price = $scope.ItemDetails.rcv;
            }}
        );
        $scope.CalculateRCV();
     };
     $scope.acceptStandardCost = function acceptStandardCost(){
         if(!$scope.ItemDetails.standardCost || $scope.ItemDetails.standardCost<=0)
        {
            toastr.remove();
            toastr.warning("Standard cost not available for this item","Warning", {timeOut: 5000});

        }
        else{
            if($scope.markedProductList.length>0)
              {
                var comp = $scope.markedProductList[0];
                $scope.markedProductList=[];
                $scope.Comparables.comparableItems.map(x=>x.isReplacementItem=false)
              }
            $scope.acceptedStandardCost = true;
            $scope.addStandardCostasReplacement = true;

            $scope.ItemDetails.replacedItemPrice = $scope.ItemDetails.standardCost;
            $scope.ItemDetails.replacementQty = $scope.ItemDetails.quantity;
            $scope.ItemDetails.rcv = $scope.ItemDetails.standardCost;
            $scope.ItemDetails.adjusterDescription = $scope.ItemDetails.standardDescription;
            $scope.ItemDetails.source = $scope.ItemDetails.standardItemSource;
            $scope.isReplaced = true;
            $scope.ItemDetails.isReplacementItem = true;
            $scope.ItemDetails.isReplaced = true;
            $scope.CalculateRCV();
            

        }
     }

     //Jewelry custom comparable - PolicyHolder - SMS review Popop
    $scope.PolicyholderSMSReviewPopup = PolicyholderSMSReviewPopup;
    function PolicyholderSMSReviewPopup() {    
            var data = {
            "claimId": $scope.CommonObj.ClaimId,
            "ClaimNumber" : $scope.CommonObj.ClaimNumber,
            "AssignmentId" : $scope.CommonObj.AssignmentId,
            // "AssignmentNumber" : $scope.CommonObj.AssignmentNumber,
            "ItemId" : $scope.ItemDetails.id,
            "itemUID": $scope.ItemDetails.itemUID,            
            "email" : $scope.PolicyholderDetails.policyHolder.email,
            "phone": $scope.PolicyholderDetails.policyHolder.cellPhone,
            "associatePhone" : $scope.ItemDetails.adjusterDetail.cellPhone,
            "policyHolderId": $scope.PolicyholderDetails.policyHolder.id,
            "policyHolderFName": $scope.PolicyholderDetails.policyHolder.firstName,
            "policyHolderLName": $scope.PolicyholderDetails.policyHolder.lastName,           
         };


        //window.sessionStorage.setItem('appraisalDTO', JSON.stringify(appraisalDTO));
        //$rootScope.$broadcast('suggestedCoverage',appraisalDTO);
        $scope.animationsEnabled = true;
        var out = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "views/CommonTemplates/PolicyholderSMSReviewPopup.html",
            controller: "PolicyholderSMSReviewPopupController",
            backdrop: 'static',
            keyboard: false,
            resolve: {
                SMSData: function () {
                    return data;
                }
            }
        });
        window.setTimeout(function () {
            out.close();
        }, 300000);
        out.result.then(function (value) {
            //Call Back Function success
            if (value === "Success") {

                // GetNotes();
            }

        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };
    }

    //Jewelry custom comparable - PolicyHolder - Email review Popop
    $scope.PolicyholderEmailReviewPopup = PolicyholderEmailReviewPopup;
    function PolicyholderEmailReviewPopup() { 
    
        var data = {
            "claimId": $scope.CommonObj.ClaimId,
            "ClaimNumber" : $scope.CommonObj.ClaimNumber,
            "AssignmentId" : $scope.CommonObj.AssignmentId,
            "AssignmentNumber" : $scope.CommonObj.AssignmentNumber,
            "ItemId" : $scope.ItemDetails.id,
            "itemUID": $scope.ItemDetails.itemUID,            
            "email" : $scope.PolicyholderDetails.policyHolder.email,
            "phone": $scope.PolicyholderDetails.policyHolder.cellPhone,
            "associatePhone" : $scope.ItemDetails.adjusterDetail.cellPhone,
            "policyHolderId": $scope.PolicyholderDetails.policyHolder.id,
            "policyHolderFName": $scope.PolicyholderDetails.policyHolder.firstName,
            "policyHolderLName": $scope.PolicyholderDetails.policyHolder.lastName,           
        };
console.log("$scope.ItemDetails",$scope.ItemDetails)
        //window.sessionStorage.setItem('appraisalDTO', JSON.stringify(appraisalDTO));
        $scope.animationsEnabled = true;
        var out = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "views/CommonTemplates/PolicyholderEmailReviewPopup.html",
            controller: "PolicyholderEmailReviewPopupController",
            backdrop: 'static',
            keyboard: false,
            resolve: {
                EmailData: function () {                    
                    return data;
                }
            }
        });
        window.setTimeout(function () {
            out.close();
        }, 300000);
        out.result.then(function (value) {
            //Call Back Function success
            if (value === "Success") {

                // GetNotes();
            }

        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };    
    }

    //Add Custom Item popup
    $scope.ViewJewelryCustomItemPopup = ViewJewelryCustomItemPopup;
    function ViewJewelryCustomItemPopup(item) {
        //if($scope.ItemDetails.category.name =='Jewelry'){
        if(!(item.isDataImage || item.customItemDetail)){
            $scope.ItemDetails.jewelryCustomItem = item;
            ItemDetailService.setItemDetails($scope.ItemDetails);
            $scope.tab = 'CustomComparable';
        }else{
            EditCustomItemPopup(item);
        }      
    }

    // Replacement Jewelry View Link
    $scope.viewJewelryBreakupDetails = viewJewelryBreakupDetails;
    function viewJewelryBreakupDetails(item) {
        $(".page-spinner-bar").removeClass("hide");
        if($scope.ItemDetails.category.name =='Jewelry'){
            $scope.ItemDetails.jewelryCustomItem = item;
            ItemDetailService.setItemDetails($scope.ItemDetails);
            $scope.tab = 'CustomComparable';
        }
        $timeout(function(){

        },1000)
        $(".page-spinner-bar").addClass("hide");
    }

    $scope.calculatePageIndex = calculatePageIndex;
function calculatePageIndex(){
    $scope.FiletrLostDamageList.sort((a,b)=> a.itemNumber - b.itemNumber);
    $scope.pageIndex = $scope.FiletrLostDamageList.findIndex((item)=> item.id==$scope.CommonObj.ItemId)
    $scope.pageIndex = $scope.pageIndex+1;
}

$scope.getYellowStars = getYellowStars;
function getYellowStars(num) {  
    var numberOfStars = Math.ceil(parseFloat(num==null ? 0:num));  
    if (numberOfStars > 5)  
        numberOfStars = 5;  
    var data = new Array(numberOfStars);  
    for (var i = 0; i < data.length; i++) {  
        data[i] = i;  
    }  
    return data;  
} 

$scope.getGreyStars = getGreyStars;
function getGreyStars (num) {  
    var numberOfStars = Math.ceil(parseFloat(num==null ? 0:num));  
    var restStars = 5 - numberOfStars;  
    if (restStars > 0) {  
        var data = new Array(restStars);  
        for (var i = 0; i < data.length; i++) {  
            data[i] = i;  
        }  
        return data;  
    }  
}

});
