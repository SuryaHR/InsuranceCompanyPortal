angular.module('MetronicApp').controller('PolicyHolderItemDetailsController', function ($translate, $translatePartialLoader, $rootScope, $log, $scope, $window,
    settings, $http, $timeout, $uibModal, $location, $filter, PolicyHolderItemDetailsService, AddNoteEventService, LineItemsFactory, $sce, utilityMethods, StatusConstants) {

    $scope.items = $rootScope.items;
    $scope.boolValue = true;

    $translatePartialLoader.addPart('PolicyHolderItemDetails');
    $translate.refresh();

    $scope.NoImagePath = $rootScope.settings.NoImagePath;
    $scope.Compairableslist = [];
    $scope.Notes = "";
    $scope.CategoryList = "";
    $scope.Category = "";
    $scope.SubCategoryList = "";
    $scope.SubCategory = "";
    $scope.ErrorMessage = "";
    $scope.ClaimParticipantsList = [];
    $scope.ItemDetails = {};
    $scope.ParticipantName = "";
    //RCV
    $scope.OriginalRCVOfItem = 0.0;
    $scope.OriginalACVOfItem = 0.0;
    $scope.Comparables = [];
    $scope.AddedComparables = [];
    //From google
    $scope.ReplacementSuplier = [];
    $scope.RoomsList = [];
    $scope.Retailers = [];
    $scope.addOtherRetailer = false;
    $scope.GoogleComparableList = [];
    //Sort options for dropdown
    $scope.SortOptions = [{ Id: '-price', Value: "Price-Low TO High" }, { Id: '+price', Value: "Price-High To Low" }];
    $scope.sortcolumn = '-price';
    // Item details object and image object
    $scope.images = [];
    //Serch variables for google
    $scope.displayEmptyPart = true;
    $scope.displaycomparables = false;
    $scope.displayReplacement = false;
    $scope.dispalyAddedComparables = false;
    $scope.bestBuyUrl = sessionStorage.getItem("bestbuyUrl");
    $scope.sortString = "sort=regularPrice.dsc,bestSellingRank.dsc";
    $scope.moreBestBuyResult = true;
    $scope.paymentTypes = [];
    $scope.accessComparable = sessionStorage.getItem("accessComparable") == 'true';
    $scope.NextStep = false;
    $scope.PrevStep = false;
    $scope.userId = sessionStorage.getItem("UserId");
    $scope.totalPages = 0;
    $scope.pager = {};
    $scope.setPageCalled = false;
    $scope.videoLinkEditable = true;
    $scope.pageIndex = parseInt(sessionStorage.getItem("pageIndex"))

    $scope.ItemDetails.cashPayoutExposure = 0.0;
    $scope.ItemDetails.replacementExposure = 0.0;
    $scope.ConditionList = [];
    $scope.constants = {
        itemStatus: StatusConstants.ItemStatus,
        invoiceStatus: StatusConstants.InvoiceStatus,
    };
    $scope.newRetailer = {
        addOtherRetailer: false
    };
    $scope.room = sessionStorage.getItem("room") ? JSON.parse(sessionStorage.getItem("room")) : null;
    $scope.itemForm = {};
    function init() {
        $scope.attachmentList = [];
        $scope.attachmentListEdit = [];
        $scope.CommonObj = {
            ClaimNumber: sessionStorage.getItem("PolicyHolderClaimNo"),
            ClaimId: sessionStorage.getItem("PolicyHolderClaimId"),
            ItemNote: "",
            SearchComparables: "",
            ItemId: sessionStorage.getItem("PolicyHolderPostLostItemId"),
            ParticipantId: null,
            ClaimProfile: sessionStorage.getItem("claimProfile"),
        };
        if ($scope.CommonObj.ClaimProfile != 'Contents')
            GetShippingMethods();
        getRooms();
        getRetailers();
        //get category list #29
        var getpromise = PolicyHolderItemDetailsService.getCategory();
        getpromise.then(function (success) { $scope.CategoryList = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

        //GetReplacementSupplier
        $scope.SelectedSupplier = [];
        var GetReplacementSuplier = PolicyHolderItemDetailsService.GetReplacementSupplier();
        GetReplacementSuplier.then(function (success) {
            $scope.ReplacementSuplier = success.data.data;
            // CTB-2313
            angular.forEach($scope.ReplacementSuplier, function (item) {
                item.isSelected = true;
            })
            // end CTB-2313

        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
        getPostLostItems();
        // CTB-2313
        getCondition();
        //get item notes API #127
        getMessages();
        // var getReciptList = PolicyHolderItemDetailsService.getReceiptList(param);
        // getReciptList.then(function (success) { $scope.ReceiptList = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

        //--------------------------------------------------------------------------------------------------------------
        // get active vendors against claim for autocomplete textbox
        // var param = { "claimNumber": $scope.CommonObj.ClaimNumber };
        // var getpromise = PolicyHolderItemDetailsService.getVendorsListAgainstClaim(param);
        // getpromise.then(function (success) {
        //     $scope.ClaimParticipantsList = success.data.data;
        //     angular.forEach($scope.ClaimParticipantsList, function (participant) {
        //         if (participant.firstName == null) {
        //             participant.firstName = " ";
        //         }
        //         if (participant.lastName == null) {
        //             participant.lastName = " ";
        //         }
        //     });
        // }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    }
    //ACV calclulation
    $scope.ItemDetails.rcvTax = 0.0;
    $scope.ItemDetails.acvTotal = 0.0;
    init();

    $scope.getMessages = getMessages;
    function getMessages() {
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "itemId": $scope.CommonObj.ItemId
        };
        var getpromise = PolicyHolderItemDetailsService.getItemNotes(param);
        getpromise.then(function (success) {
            //var Notes = $filter('orderBy')(success.data && success.data.data ? success.data.data : null, 'updateDate', true);
            var Notes = success.data && success.data.data ? success.data.data : null;
            $scope.Notes = [];
            var idx = 0;
            var selIdx = 0;
            angular.forEach(Notes, function (item, index) {
                if (item.groupTitle != null) {
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
                }
            });
            if ($scope.Notes !== null && $scope.Notes.length > 0) {
                $scope.NoteDetails = $scope.Notes[selIdx];
                $scope.NoteIndex = selIdx;
            }
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            $(".note_refresh_spinner").removeClass("fa-spin");
            $(".page-spinner-bar").addClass("hide");
        });
    }

    //get item details on itemId
    function getItemDetails() {
        $scope.ItemDetails = {};
        $scope.Comparables = {};
        $scope.markedProductList = [];
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "itemId": $scope.CommonObj.ItemId
        };
        var getItemDetailsOnId = PolicyHolderItemDetailsService.gteItemDetails(param);
        getItemDetailsOnId.then(function (success) {
            $scope.ItemDetails = success.data.data;
            // Set Default condition - Very Good
            if ($scope.ItemDetails.condition == null) {
                $scope.ItemDetails.condition = { "conditionId": 3, "conditionName": "Very Good" }
            }
            // CTB-2684
            if (angular.isDefined($scope.ItemDetails) && $scope.ItemDetails.paymentDetails != null) {
                $scope.ItemDetails.paymentDetails.checkDate = $filter('DateFormatMMddyyyy')($scope.ItemDetails.paymentDetails.checkDate);
            }
            // end of CTB-2684
            if ($scope.ItemDetails.status.id === 6) {
                $scope.isQuoteSubmittedByVendor = true;
            } else {
                $scope.isQuoteSubmittedByVendor = false;
            }
            $scope.ItemDetails.appraisalDate = (angular.isDefined($scope.ItemDetails) && $scope.ItemDetails.appraisalDate != null) ? ($filter('DateFormatMMddyyyy')($scope.ItemDetails.appraisalDate)) : ($filter('TodaysDate')());
            $scope.ItemDetails.shippingDate = (angular.isDefined($scope.ItemDetails) && $scope.ItemDetails.shippingDate != null) ? ($filter('DateFormatMMddyyyy')($scope.ItemDetails.shippingDate)) : ($filter('TodaysDate')());
            $scope.newRetailer.addOtherRetailer = $scope.ItemDetails.originallyPurchasedFrom && $scope.ItemDetails.originallyPurchasedFrom.name === 'Other' ? true : false;
            if ($scope.ItemDetails.status && $scope.ItemDetails.status.status == 'VALUED' && !$scope.ItemDetails.isReplaced) {
                $scope.previousValue = $scope.ItemDetails.insuredPrice && $scope.ItemDetails.rcvTotal ? $scope.ItemDetails.insuredPrice : 0;
            }
            $scope.ItemDetails.acv = ($scope.ItemDetails.acv !== null && angular.isDefined($scope.ItemDetails.acv)) ? parseFloat($scope.ItemDetails.acv.toFixed(2)) : $scope.ItemDetails.acv;
            $scope.ItemDetails.holdOverValue = ($scope.ItemDetails.holdOverValue !== null && angular.isDefined($scope.ItemDetails.holdOverValue)) ? parseFloat($scope.ItemDetails.holdOverValue.toFixed(2)) : $scope.ItemDetails.holdOverValue;
            if ($scope.ItemDetails.holdOverValue < 0)
                $scope.ItemDetails.holdOverValue = 0;
            $scope.ItemDetails.totalTax = ($scope.ItemDetails.totalTax !== null && angular.isDefined($scope.ItemDetails.totalTax)) ? parseFloat($scope.ItemDetails.totalTax.toFixed(2)) : $scope.ItemDetails.totalTax;
            $scope.ItemDetails.valueOfItem = ($scope.ItemDetails.valueOfItem !== null && angular.isDefined($scope.ItemDetails.valueOfItem)) ? parseFloat($scope.ItemDetails.valueOfItem.toFixed(2)) : $scope.ItemDetails.valueOfItem;
            $scope.ItemDetails.rcv = ($scope.ItemDetails.rcv !== null && angular.isDefined($scope.ItemDetails.rcv)) ? parseFloat($scope.ItemDetails.rcv.toFixed(2)) : $scope.ItemDetails.rcv;
            $scope.ItemDetails.videoLink = ($scope.ItemDetails.videoLink !== null && angular.isDefined($scope.ItemDetails.videoLink)) ? $scope.ItemDetails.videoLink : "";
            //$scope.ItemDetails.dateOfPurchase = $filter('DateFormatMMddyyyy')($scope.ItemDetails.dateOfPurchase);
            $scope.CommonObj.SearchComparables = angular.copy(success.data.data.description)
            var percentage = $scope.ItemDetails.insuredPrice * 20 / 100;
            $scope.CommonObj.priceFrom = roundOf2Decimal($scope.ItemDetails.insuredPrice - percentage > 0 ? $scope.ItemDetails.insuredPrice - percentage : 0);
            var maxPriceTo = roundOf2Decimal($scope.ItemDetails.insuredPrice + percentage)
            if (maxPriceTo != 0) {
                $scope.CommonObj.priceTo = maxPriceTo;
            }
            GetSubCategory();
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
            if ($scope.ItemDetails.status.status != $scope.constants.itemStatus.underReview) {
                $scope.SearchReplacement();
            }
            // var GetImageOfItem = PolicyHolderItemDetailsService.gteItemImagess(param);
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
            $scope.ClaimParticipantsList = $scope.ItemDetails.itemParticipants;
            //Get payment Details for vendor
            // var GetInvoice = PolicyHolderItemDetailsService.getInvoiceList(param);
            // GetInvoice.then(function (invoices) { $scope.InvoiceDetails = invoices.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

            // var getReciptList = PolicyHolderItemDetailsService.getReceiptList(param);
            // getReciptList.then(function (recipts) { $scope.ReceiptList = recipts.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

            // var GetInvoicList = SupervisorLineItemDetailsService.getInvoiceListByItem(param);
            // GetInvoicList.then(function (invoiceList) {
            //     $scope.InvoiceLIst = invoiceList.data.data;
            // }, function (error) {
            //     $(".page-spinner-bar").addClass("hide");
            //     $scope.ErrorMessage = error.data.errorMessage;
            // });
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }
    function mapComparables() {
        var itemToMove = null;
        angular.forEach($scope.Comparables.comparableItems, function (item) {
            if (item.isReplacementItem) {
                $scope.markedProductList = [];
                $scope.markedProductList.push(item);
                itemToMove = item;
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
            $scope.displayEmptyPart = true;
        }
    }
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
    // SLVG-49
    // Get Shipping methods.
    $scope.GetShippingMethods = GetShippingMethods;
    function GetShippingMethods() {
        var shippingMethods = PolicyHolderItemDetailsService.getShippingMethods();
        shippingMethods.then(function (success) {
            $scope.shippingMethodsList = success.data.data;
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    }
    //go back function
    $scope.goBack = goBack;
    function goBack(e) {
        $location.path('/PolicyHolderClaimDetails');
    }
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
                var getItemDetailsOnId = PolicyHolderItemDetailsService.gteItemDetails(param);
                getItemDetailsOnId.then(function (success) {
                    $scope.ItemDetails = success.data.data;

                    // CTB-2313
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
                    className: 'btn-success'
                },
                cancel: {
                    label: 'No',
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                //if (result)  call delet function
                if (result) {
                    var param = [{
                        "itemId": $scope.CommonObj.ItemId

                    }];
                    var deleteitem = PolicyHolderItemDetailsService.deleteLineItem(param);
                    deleteitem.then(function (success) {

                        $scope.Status = success.data.status;
                        if ($scope.Status === 200) {
                            toastr.remove();
                            toastr.success(success.data.message, "Confirmation");
                        }
                    }, function (error) {
                        toastr.remove();
                        toastr.error(error.data.errorMessage, "Error");
                    });
                }
            }
        });
    }
    //Delete comparables fro list
    $scope.DeletedComparables = [];
    $scope.DeleteComparable = DeleteComparable;
    function DeleteComparable(comp) {
        comp.delete = true;
        $scope.DeletedComparables.push(comp);
        $scope.Comparables.comparableItems.splice($scope.Comparables.comparableItems.indexOf(comp), 1);
        $scope.CalculateRCV();
    }

    //Mark as replacement list
    $scope.MarkAsReplacement = MarkAsReplacement;
    function MarkAsReplacement(comp) {
        $scope.markedProductList = [];
        angular.forEach($scope.AddedComparables, function (item) {
            item.isReplacementItem = false;
        });
        $scope.markedProductList.push(comp);
        comp.isReplacementItem = true;
        $scope.ItemDetails.adjusterDescription = comp.description;
        $scope.CalculateRCV();

        // if (comp.isReplacementItem === true) {
        //     comp.isReplacementItem = false;
        // }
        // else
        //     comp.isReplacementItem = true;
    }

    // CTB-2313
    $scope.addOrRemoveSearchEngine = function (supplier) {
        $scope.Searchoptions = [];
        angular.forEach($scope.ReplacementSuplier, function (item) {
            if (supplier.id == item.id) {
                item.isSelected = !supplier.isSelected;
            }
            if (item.isSelected) {
                $scope.Searchoptions.push(item.id);
            }
        })
        SearchReplacement();
    }
    // end CTB-2313
    // ************* End comparable form DBlist********************


    //*********************Googole search**********************************
    $scope.bestBuyKey = null;
    $scope.Searchoptions = [1, 2, 3];
    $scope.SearchReplacement = SearchReplacement;
    var priceFilter = "";
    function SearchReplacement() {
        //Get items if exists in dbcomparable list and add to addtocomparables list
        $scope.bestBuyComparables = [];
        $scope.IsLoading = true;
        // $(".page-spinner-bar").removeClass("hide");
        if ($scope.Searchoptions.includes(1)) {
            //$scope.priceRange = true;
            // var percentage = $scope.ItemDetails.insuredPrice*20/100;
            // $scope.CommonObj.priceFrom = $scope.ItemDetails.insuredPrice-percentage>0?$scope.ItemDetails.insuredPrice-percentage:0;
            // $scope.CommonObj.priceTo = $scope.ItemDetails.insuredPrice+percentage;
        }
        if ($scope.Searchoptions.includes(2)) {
            //console.log("bestbuy");
            var searchstring = constructSearchURL($scope.CommonObj.SearchComparables);
            var url = "";
            priceFilter = "";
            if ($scope.CommonObj.priceTo)
                priceFilter = "&regularPrice>=" + $scope.CommonObj.priceFrom + "&regularPrice<=" + $scope.CommonObj.priceTo
            if ($scope.CommonObj.brand)
                priceFilter = priceFilter + "&manufacturer=" + $scope.CommonObj.brand
            if (!$scope.bestBuyKey) {
                var key = PolicyHolderItemDetailsService.getBestbuyKey()
                key.then(function (success) {
                    $scope.bestBuyKey = success.data.data;
                    url = $scope.bestBuyUrl + "((" + searchstring + ")" + priceFilter + ")?" + $scope.sortString + "&apiKey=" + $scope.bestBuyKey + "&format=json";
                    bestbuyResult(url);
                    //https://api.bestbuy.com/v1/products((search=check))?apiKey=AJOa71zSLPJlGRM4GE4igNFl&format=json
                }, function (error) {
                    $scope.IsLoading = false;
                    // $(".page-spinner-bar").addClass("hide");
                    toastr.remove()
                    toastr.error("could not get API key", $translate.instant("ErrorHeading"));
                    // $scope.ErrorMessage = error.data.errorMessage;
                });
            } else {
                url = $scope.bestBuyUrl + "((" + searchstring + ")" + priceFilter + ")?" + $scope.sortString + "&apiKey=" + $scope.bestBuyKey + "&format=json";
                bestbuyResult(url);
            }

        }
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
            $scope.GoogleComparableList = [];
            // Get compaiables form google id will be google or amazon and many more
            if ($scope.Searchoptions === null || $scope.Searchoptions.length === 0) {

                if ($scope.ReplacementSuplier.length > 0) {
                    $scope.Searchoptions.push(parseInt($scope.ReplacementSuplier[0].id));
                }
                else
                    $scope.Searchoptions = [1];
            }
            var Searchstring = {
                "item": $scope.CommonObj.SearchComparables,
                "ids": $scope.Searchoptions,
                "numberOfCounts": 20,
                "priceFrom": $scope.CommonObj.priceFrom,
                "priceTo": $scope.CommonObj.priceTo,
                "brand": $scope.CommonObj.brand
            };
            var GetGoogleCompairables = PolicyHolderItemDetailsService.GetComparableListFromGoogle(Searchstring);
            GetGoogleCompairables.then(function (success) {
                //We need to work here googleResults  amazonResults
                var listgooleComparable = [];
                if (success.data.data != null) {
                    angular.forEach(success.data.data.googleResults, function (item) {
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
                            "id": null, "isvendorItem": false,
                            "description": item.description, "brand": null, "model": null, "price": price, "buyURL": item.itemURL,
                            "isDataImage": true, "supplier": null, "imageURL": (item.itemImage) ? item.itemImage : item.base64ImageUrl
                        });
                    });
                    var amazonComparable = [];
                    angular.forEach(success.data.data.amazonResults, function (item) {
                        amazonComparable.push({
                            "id": null, "isvendorItem": false,
                            "description": item.description, "brand": item.brand, "model": item.model,
                            "price": ((item.price.toString()).indexOf('$') > -1) ? item.price.split('$')[1] : item.price, "buyURL": item.buyURL,
                            "isDataImage": false, "supplier": null, "imageURL": item.imageURL
                        });
                    });
                    var VendorComparable = [];
                    angular.forEach(success.data.data.vendorCatalogItems, function (item) {
                        VendorComparable.push({
                            "id": item.id, "isvendorItem": true,
                            "description": item.description, "brand": item.brand, "model": item.model,
                            "price": (item.price && (item.price.toString()).indexOf('$') > -1) ? item.price.split('$')[1] : item.price,
                            "buyURL": null,
                            "isDataImage": false, "supplier": null, "imageURL": ((item.itemImages !== null) ? item[0].url : "")
                        });
                    });
                    $scope.GoogleComparableList = $scope.GoogleComparableList.concat(listgooleComparable.concat(amazonComparable).concat(VendorComparable));
                    $scope.IsLoading = false;
                    // $(".page-spinner-bar").addClass("hide");
                    // $scope.SortGoogleResult();
                }
            }, function (error) {
                // $(".page-spinner-bar").addClass("hide");
                $scope.ErrorMessage = error.data.erromessage; $scope.IsLoading = false;
            });
        }
        // else
        //     $(".page-spinner-bar").addClass("hide");

    }
    $scope.bestbuyPage = 1;
    $scope.NextPage = function () {
        if ($scope.Searchoptions.includes(2) && $scope.moreBestBuyResult) {
            $scope.bestbuyPage++;
            // console.log($scope.bestbuyPage);
            var searchstring = constructSearchURL($scope.CommonObj.SearchComparables);
            var url = $scope.bestBuyUrl + "((" + searchstring + ")" + priceFilter + ")?" + $scope.sortString + "&apiKey=" + $scope.bestBuyKey + "&page=" + $scope.bestbuyPage + "&format=json";
            bestbuyResult(url);
        }
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
        var promise = PolicyHolderItemDetailsService.getBestbuyresult(url)
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
                var key = PolicyHolderItemDetailsService.getBestbuyKey()
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
                //item.price = parseFloat(item.price);

                var price;
                if (item.price.indexOf('₹') > -1)
                    price = item.price.substring(item.price.indexOf('₹') + 2).replace(/,/gi, '');
                else if (item.price.indexOf('$') > -1)
                    price = item.price.substring(item.price.indexOf('$') + 2).replace(/,/gi, '');
                else
                    price = item.price.replace(/,/gi, '');

                item.price = parseFloat(price);
                //item.price = parseFloat(item.price);
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
        $scope.Comparables.comparableItems.push(item);
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
            $scope.isReplaced = false;
        }
        $scope.GoogleComparableList.splice(0, 0, item);
        if (item.isReplacementItem) {
            $scope.markedProductList = [];
            $scope.ItemDetails.adjusterDescription = "";
        }
        item.isReplacementItem = false;
        // Update form validation as touched / dirty
        $scope.itemForm.contents.$setDirty();
    }

    //CTB-2723
    $scope.AddtoComparableListFromRapid = AddtoComparableListFromRapid;
    function AddtoComparableListFromRapid(comp) {
        $scope.markedProductList.splice($scope.markedProductList.indexOf(comp), 1);
        if ($scope.Comparables.comparableItems == null) {
            $scope.Comparables.comparableItems = [];
        }
        let index = $scope.Comparables.comparableItems.findIndex(item => angular.equals(comp, item));
        if (index < 0) {
            $scope.Comparables.comparableItems.push(item);
        } else if (index > -1) {
            comp.isReplacementItem = false;
            comp.isDelete = false;
            $scope.ItemDetails.adjusterDescription = "";
            $scope.ItemDetails.cashPayoutExposure = 0.0;
            $scope.ItemDetails.replacementExposure = 0.0;
            $scope.Comparables.comparableItems[index] = angular.copy(comp);
        }
        $scope.CalculateRCV();

        // Update form validation as touched / dirty
        $scope.itemForm.contents.$setDirty();
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
        if ($scope.itemForm.contents.$invalid) {
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
            ComparableList.push({
                "id": item.id,
                "originalItemId": $scope.ItemDetails.id,
                "isvendorItem": item.isvendorItem,
                "description": item.description,
                "itemName": $scope.ItemDetails.itemName,
                "unitPrice": item.price,
                "price": item.price,
                "taxRate": null,
                "brand": item.brand,
                "model": item.model,
                "supplier": item.supplier,
                "itemType": $scope.ItemDetails.itemType,
                //"isReplacementItem": false,
                "isReplacementItem": item.isReplacementItem,
                "buyURL": item.buyURL,
                "isDataImage": item.isDataImage,
                "imageData": (item.imageData) ? item.imageData : item.imageURL,
                "imageURL": (item.imageData) ? item.imageData : item.imageURL,
                "isDelete": item.isDelete ? true : false,
                "replacementItemUID": item.replacementItemUID
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

        if ($scope.ItemDetails.isScheduledItem == false && $scope.ItemDetails.rcvTotal !== null) {
            $scope.ItemDetails.replacementExposure = parseFloat($scope.ItemDetails.rcvTotal) > $scope.ItemDetails.individualLimitAmount ? $scope.ItemDetails.individualLimitAmount : parseFloat($scope.ItemDetails.rcvTotal);
        } else if ($scope.ItemDetails.isScheduledItem == true && $scope.ItemDetails.rcvTotal !== null) {
            $scope.ItemDetails.replacementExposure = parseFloat($scope.ItemDetails.rcvTotal) > $scope.ItemDetails.scheduleAmount ? $scope.ItemDetails.scheduleAmount : parseFloat($scope.ItemDetails.rcvTotal);
        }

        if ($scope.ItemDetails.isScheduledItem == false && $scope.ItemDetails.acv !== null) {
            $scope.ItemDetails.cashPayoutExposure = parseFloat($scope.ItemDetails.acv) > $scope.ItemDetails.individualLimitAmount ? $scope.ItemDetails.individualLimitAmount : parseFloat($scope.ItemDetails.acv);
        } else if ($scope.ItemDetails.isScheduledItem == true && $scope.ItemDetails.acv !== null) {
            $scope.ItemDetails.cashPayoutExposure = parseFloat($scope.ItemDetails.acv) > $scope.ItemDetails.scheduleAmount ? $scope.ItemDetails.scheduleAmount : parseFloat($scope.ItemDetails.acv);
        }

        if ($scope.ItemDetails.category && $scope.ItemDetails.subCategory && $scope.ItemDetails.category.id != 23) {
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
                        "adjusterDescription": $scope.ItemDetails.adjusterDescription,
                        "ageMonths": $scope.ItemDetails.ageMonths,
                        "ageYears": $scope.ItemDetails.ageYears,
                        "appraisalDate": (angular.isDefined($scope.ItemDetails.appraisalDate) ? $filter('DatabaseDateFormatMMddyyyy')($scope.ItemDetails.appraisalDate) : null),
                        "appraisalValue": $scope.ItemDetails.appraisalValue,
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
                        "categoryLimit": $scope.ItemDetails.categoryLimit,
                        "claimId": $scope.ItemDetails.claimId,
                        "claimNumber": $scope.ItemDetails.claimNumber,
                        "dateOfPurchase": $scope.ItemDetails.dateOfPurchase,
                        "depriciationRate": $scope.ItemDetails.depriciationRate,
                        "description": $scope.ItemDetails.description,
                        "holdOverPaymentDate": $scope.ItemDetails.holdOverPaymentDate,
                        "holdOverPaymentMode": $scope.ItemDetails.holdOverPaymentMode,
                        "holdOverPaymentPaidAmount": $scope.ItemDetails.holdOverPaymentPaidAmount,
                        "holdOverValue": $scope.ItemDetails.holdOverValue,
                        "scheduleAmount": $scope.ItemDetails.scheduleAmount,
                        "deductibleAmount": $scope.ItemDetails.deductibleAmount,
                        "individualLimitAmount": $scope.ItemDetails.individualLimitAmount,
                        "totalStatedAmount": $scope.ItemDetails.totalStatedAmount,
                        "id": $scope.ItemDetails.id,
                        "itemUID": $scope.ItemDetails.itemUID,
                        "insuredPrice": $scope.ItemDetails.insuredPrice > 0 ? $scope.ItemDetails.insuredPrice : 0,
                        "isReplaced": $scope.ItemDetails.isReplaced,
                        // "isNewReplaced":$scope.isReplaced,
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
                        "subCategory": {
                            "annualDepreciation": $scope.ItemDetails.subCategory && $scope.ItemDetails.subCategory.annualDepreciation ? $scope.ItemDetails.subCategory.annualDepreciation : null,
                            "id": $scope.ItemDetails.subCategory && $scope.ItemDetails.subCategory.id ? $scope.ItemDetails.subCategory.id : null,
                            "name": $scope.ItemDetails.subCategory && $scope.ItemDetails.subCategory.name ? $scope.ItemDetails.subCategory.name : null,
                            "usefulYears": $scope.ItemDetails.subCategory && $scope.ItemDetails.subCategory.usefulYears ? $scope.ItemDetails.subCategory.usefulYears : null,
                            "description": null,
                            "aggregateLimit": null
                        },
                        "condition": {
                            "conditionId": (($scope.ItemDetails.condition !== null && angular.isDefined($scope.ItemDetails.condition)) ? $scope.ItemDetails.condition.conditionId : null),
                            "conditionName": (($scope.ItemDetails.condition !== null && angular.isDefined($scope.ItemDetails.condition)) ? $scope.ItemDetails.condition.conditionName : null)
                        },
                        "taxRate": $scope.ItemDetails.taxRate,
                        "totalTax": $scope.ItemDetails.totalTax,
                        "valueOfItem": $scope.ItemDetails.valueOfItem,
                        "vendorDetails": $scope.ItemDetails.vendorDetails,
                        "yearOfManufecturing": $scope.ItemDetails.yearOfManufecturing,

                        "shippingDate": (angular.isDefined($scope.ItemDetails.shippingDate) ? $filter('DatabaseDateFormatMMddyyyy')($scope.ItemDetails.shippingDate) : null),
                        "shippingMethod": {
                            "id": angular.isDefined($scope.ItemDetails.shippingMethod) && $scope.ItemDetails.shippingMethod.id ? $scope.ItemDetails.shippingMethod.id : null
                        },
                        // Originally purchased from, purhase method, If gifted then donor's name and address
                        "originallyPurchasedFrom": $scope.newRetailer.addOtherRetailer ? null : $scope.ItemDetails.originallyPurchasedFrom,
                        "room": $scope.ItemDetails.room,
                        "newRetailer": $scope.newRetailer.addOtherRetailer && $scope.ItemDetails.newRetailer ? $scope.ItemDetails.newRetailer : null,
                        "giftedFrom": $scope.ItemDetails.giftedFrom ? $scope.ItemDetails.giftedFrom : null,
                        "purchaseMethod": $scope.ItemDetails.purchaseMethod ? $scope.ItemDetails.purchaseMethod : null,
                        "videoLink": $scope.ItemDetails.videoLink ? $scope.ItemDetails.videoLink : null,
                        "cashPayoutExposure": $scope.ItemDetails.cashPayoutExposure,
                        "replacementExposure": $scope.ItemDetails.replacementExposure,
                    },
                    "comparableItems": ComparableList,
                }
            ));
        var SaveNewComparables = PolicyHolderItemDetailsService.SaveNewComparables(param);
        SaveNewComparables.then(function (success) {
            var updatedItem = success.data.data;
            if (updatedItem) {
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
                mapComparables();
                // if ($scope.ItemDetails.status.status != $scope.constants.itemStatus.underReview) {
                //     $scope.SearchReplacement();
                // }
                ComparableList = [];
                // $scope.AddedComparables = [];
                $scope.DeletedComparables = [];
                getAttachment(updatedItem.claimItem.attachments);
                //$scope.AddReplacement();
                $(".page-spinner-bar").addClass("hide");
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
    //*********************End Googole search**********************************

    //Show Replacement item pageload state
    $scope.AddReplacement = AddReplacement;
    function AddReplacement() {
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
    };

    //Select comparables if press back the empty list and calculate rcv again pageload state
    $scope.CancelAddedComparables = CancelAddedComparables;
    function CancelAddedComparables() {
        $scope.GoogleComparableList = [];
        $scope.AddedComparables = [];
        $scope.AddReplacement();
        $scope.CalculateRCV();

    }

    //Change Total stated value if quantity and stated value changes
    $scope.CalculateTotalStatedValue = function () {
        if ($scope.ItemDetails.quantity > 0) {
            if ($scope.ItemDetails.insuredPrice > 0) {
                $scope.ItemDetails.totalStatedAmount = parseFloat((parseInt($scope.ItemDetails.quantity) * $scope.ItemDetails.insuredPrice).toFixed(2));
            }
        }
        if (isNaN($scope.ItemDetails.totalStatedAmount)) {
            $scope.ItemDetails.totalStatedAmount = 0;
        }
    }

    //Calculate ACV RCV
    $scope.OriginalRCVOfItem = 0;
    $scope.OrignialLength = 0;
    //Calculate RCV
    $scope.CalculateRCV = function () {
        var Price = 0.0; var taxRate = 0.0;
        var ACV = 0.0; var RCV = 0.0;
        var Age = 0.0; var usefulYears = 0.0;
        var EL = 0.0; var CA = 0.0;
        var depreciationPercent = 0.0;
        var itemReplace = false;
        angular.forEach($scope.AddedComparables, function (item) {
            if (item.isReplacementItem == true) {
                Price = parseFloat((item.unitPrice) ? item.unitPrice : item.price);
                itemReplace = true;
            }
        });
        if (!itemReplace) {
            Price = $scope.ItemDetails.insuredPrice ? $scope.ItemDetails.insuredPrice : 0;
        }
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

        if ($scope.ItemDetails.isScheduledItem == true) {
            $scope.ItemDetails.replacementExposure = parseFloat(parseFloat($scope.ItemDetails.rcvTotal) > $scope.ItemDetails.scheduleAmount ? $scope.ItemDetails.scheduleAmount : parseFloat($scope.ItemDetails.rcvTotal)).toFixed(2);
        } else {
            $scope.ItemDetails.replacementExposure = parseFloat(parseFloat($scope.ItemDetails.rcvTotal) > $scope.ItemDetails.individualLimitAmount ? $scope.ItemDetails.individualLimitAmount : parseFloat($scope.ItemDetails.rcvTotal)).toFixed(2);
        }

        if ($scope.ItemDetails.isScheduledItem == false) {
            $scope.ItemDetails.cashPayoutExposure = parseFloat(parseFloat($scope.ItemDetails.acv) > $scope.ItemDetails.individualLimitAmount ? $scope.ItemDetails.individualLimitAmount : parseFloat($scope.ItemDetails.acv)).toFixed(2);
        } else {
            $scope.ItemDetails.cashPayoutExposure = parseFloat(parseFloat($scope.ItemDetails.acv) > $scope.ItemDetails.scheduleAmount ? $scope.ItemDetails.scheduleAmount : parseFloat($scope.ItemDetails.acv)).toFixed(2);
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
        if (isNaN($scope.ItemDetails.replacementExposure)) {
            $scope.ItemDetails.replacementExposure = 0;
        }
        if (isNaN($scope.ItemDetails.cashPayoutExposure)) {
            $scope.ItemDetails.cashPayoutExposure = 0;
        }

        if ($scope.SubCategoryList && $scope.ItemDetails.subCategory && $scope.ItemDetails.subCategory.id) {
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
                CalculateRCVWithSplCase(subcategory, Price);
            }
        }
    }
    // if ($scope.Comparables !== null) {
    //     $scope.OriginalRCVOfItem = 0;
    //     $scope.OrignialLength = 0;

    //     //Get total of comparable value if already has (Saved in database)
    //     var list = $filter('filter')($scope.Comparables.comparableItems, { delete: false });
    //     angular.forEach(list, function (item) {
    //         $scope.OriginalRCVOfItem = $scope.OriginalRCVOfItem + parseFloat(item.unitPrice)
    //     });

    //$scope.OrignialLength = list.length;
    //     }

    //     var TotalPrice = 0;
    //     var count = 0; var age = 1; var Depereciation = 1;
    //     //Get total of added comparable value
    //     angular.forEach($scope.AddedComparables, function (item) {
    //         TotalPrice = parseFloat(TotalPrice) + parseFloat(item.price); count++;
    //     });

    //     //Toatal RCV if more than one comparable is added
    //     $scope.ItemDetails.rcv = ((TotalPrice + $scope.OriginalRCVOfItem) / (count + $scope.OrignialLength)).toFixed(2);

    //     //Get age of item
    //     if ($scope.ItemDetails.ageMonths !== null && angular.isDefined($scope.ItemDetails.ageMonths) && $scope.ItemDetails.ageMonths > 0) {
    //         if ($scope.ItemDetails.ageYears !== null && angular.isDefined($scope.ItemDetails.ageYears) && $scope.ItemDetails.ageYears !== "")
    //             Age = parseFloat($scope.ItemDetails.ageYears) + (parseFloat($scope.ItemDetails.ageMonths) / 12);
    //         else
    //             Age = Math.ceil(parseFloat($scope.ItemDetails.ageMonths) / 12);
    //     }

    //     //Get Depereciation rate
    //     if ($scope.ItemDetails.depriciationRate !== null && angular.isDefined($scope.ItemDetails.depriciationRate) && $scope.ItemDetails.depriciationRate > 0)
    //         Depereciation = $scope.ItemDetails.depriciationRate;
    //     else
    //         Depereciation = 0.1;

    //     //frequency is always 12  by sameer
    //     var frequency = parseFloat(12);
    //     var DepereciationAmount = parseFloat($scope.ItemDetails.rcv) * (Math.pow((1 + (parseFloat(Depereciation) / (100 * frequency))), (frequency * age)));

    //     //ACV of item
    //     $scope.ItemDetails.acv = (parseFloat($scope.ItemDetails.rcv) - (DepereciationAmount - parseFloat($scope.ItemDetails.rcv))).toFixed(2);

    //     //Toatal value of item
    //     if (angular.isDefined($scope.ItemDetails.taxRate) && $scope.ItemDetails.taxRate !== null) {
    //         $scope.ItemDetails.valueOfItem = (parseFloat($scope.ItemDetails.rcv)).toFixed(2);
    //         //Tax applied on ACV
    //         $scope.ItemDetails.totalTax = (parseFloat($scope.ItemDetails.acv) * ($scope.ItemDetails.taxRate / 100)).toFixed(2);

    //         $scope.ItemDetails.acvTax = parseFloat((parseFloat($scope.ItemDetails.acv) * ($scope.ItemDetails.taxRate / 100))).toFixed(2);
    //         $scope.ItemDetails.acvTotal = (parseFloat(parseFloat($scope.ItemDetails.acv)) + parseFloat((parseFloat($scope.ItemDetails.acv) * ($scope.ItemDetails.taxRate / 100)))).toFixed(2);
    //         //Calculate tax on rcv and total rcv
    //         $scope.ItemDetails.rcvTax = ($scope.ItemDetails.rcv * ($scope.ItemDetails.taxRate / 100)).toFixed(2);
    //         var tx = angular.copy($scope.ItemDetails.rcvTax);
    //         var val = angular.copy($scope.ItemDetails.rcv);
    //         $scope.ItemDetails.rcvTotal = (parseFloat(tx) + parseFloat(val)).toFixed(2);
    //     }
    //     else {
    //         $scope.ItemDetails.valueOfItem = (parseFloat($scope.ItemDetails.rcv)).toFixed(2);
    //         $scope.ItemDetails.totalTax = 0.0;
    //         $scope.ItemDetails.acvTax = 0.00;
    //         $scope.ItemDetails.acvTotal = $scope.ItemDetails.acv;
    //         $scope.ItemDetails.rcvTax = 0.00;
    //         $scope.ItemDetails.rcvTotal = $scope.ItemDetails.rcv
    //     }
    //     //Hold over for item
    //     $scope.ItemDetails.holdOverValue = (parseFloat($scope.ItemDetails.rcv) - parseFloat($scope.ItemDetails.acv)).toFixed(2);
    //     //Check if the value is Nan or not

    //     $scope.ItemDetails.acv = (parseFloat($scope.ItemDetails.acv)).toFixed(2);
    //     $scope.ItemDetails.rcv = (parseFloat($scope.ItemDetails.rcv)).toFixed(2);
    //     if (isNaN($scope.ItemDetails.valueOfItem)) {
    //         $scope.ItemDetails.valueOfItem = 0;
    //     }
    //     if (isNaN($scope.ItemDetails.holdOverValue)) {
    //         $scope.ItemDetails.holdOverValue = 0;
    //     }
    //     if (isNaN($scope.ItemDetails.totalTax)) {
    //         $scope.ItemDetails.totalTax = 0;
    //     }
    //     if (isNaN($scope.ItemDetails.acv)) {
    //         $scope.ItemDetails.acv = 0;
    //     }
    //     if (isNaN($scope.ItemDetails.rcv)) {
    //         $scope.ItemDetails.rcv = 0;
    //     }
    //     if (isNaN($scope.ItemDetails.rcvTax)) {
    //         $scope.ItemDetails.rcvTax = 0;
    //     }
    //     if (isNaN($scope.ItemDetails.rcvTotal)) {
    //         $scope.ItemDetails.rcvTotal = 0;
    //     }
    //     if (isNaN($scope.ItemDetails.acvTotal)) {
    //         $scope.ItemDetails.acvTotal = 0;
    //     }
    //     if (isNaN($scope.ItemDetails.acvTax)) {
    //         $scope.ItemDetails.acvTax = 0;
    //     }
    // }

    function CalculateRCVWithSplCase(subcategory, Price) {
        var depreciateRateDetails = $http.get("Contants/DepriciationRatesContant.json");

        depreciateRateDetails.then(function (success) {
            // console.log(success.data);
            var depreciationDetails = success.data.find(x => x.subcategory.toLowerCase() === subcategory.name.toLowerCase());

            if (depreciationDetails && depreciationDetails.totalRate != 0 && depreciationDetails.monthlyRate == 0) {
                var EL = depreciationDetails.totalRate / 100;
                var ACV = (parseFloat(Price) - (parseFloat(Price) * parseFloat(EL))) > 0 ? (parseFloat(Price) - (parseFloat(Price) * parseFloat(EL))) : 0;

                $scope.ItemDetails.holdOverValue = parseFloat(Price - ACV).toFixed(2);
                if ($scope.ItemDetails.holdOverValue < 0)
                    $scope.ItemDetails.holdOverValue = 0;

                $scope.ItemDetails.acv = (parseFloat(ACV)).toFixed(2);
            }
            else if (depreciationDetails && depreciationDetails.totalRate == 0 && depreciationDetails.monthlyRate == 0 && depreciationDetails.comment) {
                if (depreciationDetails.comment == 'replacement cost') {
                    $scope.ItemDetails.acv = $scope.ItemDetails.rcvTotal;
                }
                if (depreciationDetails.comment == 'appraisal value') {
                    $scope.ItemDetails.acv = $scope.ItemDetails.appraisalValue;
                }
                if (depreciationDetails.comment == 'material cost') {
                    $scope.ItemDetails.acv = $scope.ItemDetails.appraisalValue;
                }
                //  material cost

            }

            //  else if(subcategory.name == 'Paperbacks'){
            //  }
        }, function (error) {

        })


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
    $scope.participants = [];//select particiapnt
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
                "claimId": $scope.CommonObj.ClaimId.toString(),
                "itemId": $scope.CommonObj.ItemId,
                "serviceId": null,
                "isPublicNote": false,
                "message": $scope.CommonObj.ItemNote,
                "groupDetails": {
                    "groupId": null,
                    "groupTitle": "Item Note Group",
                    "groupTitle": "Claim Note Group",
                    "participants": $scope.participants
                }
            }));
            var getpromise = PolicyHolderItemDetailsService.addClaimNoteWithParticipant(data);
            getpromise.then(function (success) {
                $scope.Status = success.data.status;
                if ($scope.Status === 200) {
                    toastr.remove();
                    toastr.success(success.data.message, "Confirmation");
                    angular.element("input[type='file']").val(null);
                    $scope.fileName = '';
                    $scope.FileType = '';
                    $scope.FileExtension = '';
                    //after adding new note updating note list
                    GetNotes();
                }
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });
        }
        else {
            data.append("noteDetail", JSON.stringify({

                "claimId": $scope.CommonObj.ClaimId.toString(),
                "itemId": $scope.CommonObj.ItemId,
                "serviceId": null,
                "message": $scope.CommonObj.ItemNote,
                "isPublicNote": true,
                "groupDetails": null

            }));
            var getpromise = PolicyHolderItemDetailsService.addClaimNoteWithParticipant(data);
            getpromise.then(function (success) {
                $scope.Status = success.data.status;
                if ($scope.Status === 200) {
                    toastr.remove();
                    toastr.success(success.data.message, "Confirmation");
                    angular.element("input[type='file']").val(null);
                    $scope.fileName = '';
                    $scope.FileType = '';
                    $scope.FileExtension = '';
                    //after adding new note updating note list
                    GetNotes();
                }
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });
        }

    }
    //---------------Note Attachment------------------------------------------
    $scope.fileName = '';
    $scope.FileExtension = '';
    $scope.FileType = '';
    $scope.files = [];

    //for claim attachment
    $scope.SelectNoteFile = function () {
        angular.element('#NoteFileUpload').trigger('click');

    };

    //Get note attachment details
    $scope.getNoteFileDetails = function (e) {

        $scope.$apply(function () {
            $scope.fileName = e.files[0].name;
            $scope.FileType = e.files[0].type;
            $scope.FileExtension = $scope.fileName.substr($scope.fileName.lastIndexOf('.'));
            $scope.files.push(e.files[0]);
            var fr = new FileReader();
            //fr.onload = receivedText;
            fr.readAsDataURL(e.files[0]);
        });

    };


    function GetNotes() {
        var param = {
            "itemId": $scope.CommonObj.ItemId
        };
        var getpromise = PolicyHolderItemDetailsService.getItemNotes(param);
        getpromise.then(function (success) { $scope.Notes = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

    }
    //---------------End Note Attachment------------------------------------------

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
        } else if ('subCategory' == dropdown) { // subCategory
            elmsec = $("#itemSubCategorySel");
            elmFlot = $("#floatingSubCatSel");
            if (dropdownId == 'itemSubCategorySel') {
                elmFlot.val(elmsec.val()).trigger('change.select2');
            } else {
                elmsec.val(elmFlot.val()).trigger('change.select2');
            }
            ChangeDepriciationRate();
        } else { // condition
            elmsec = $("#itemConditionSel");
            elmFlot = $("#floatCondtionSel");
            if (dropdownId == 'itemConditionSel') {
                elmFlot.val(elmsec.val()).trigger('change.select2');
            } else {
                elmsec.val(elmFlot.val()).trigger('change.select2');
            }
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
            if ($scope.ItemDetails.category.id === 23) {
                $scope.ItemDetails.acv = $scope.ItemDetails.rcvTotal;
            }
            else {
                if (Price != null)
                    $scope.CalculateRCV();
            }
            var param = { "categoryId": $scope.ItemDetails.category.id };
            var getpromise = PolicyHolderItemDetailsService.getSubCategory(param);
            getpromise.then(function (success) {
                // CTB-2923
                // If a certain category has exactly 1 subcategory - 
                // its should be populated automatically in the sub-category drop down.
                var res = success.data ? success.data.data : null;
                if (res) {
                    $scope.SubCategoryList = res;
                    if ($scope.SubCategoryList.length <= 1) {
                        $scope.ItemDetails.subCategory = angular.copy($scope.SubCategoryList[0]);
                        ChangeDepriciationRate();
                        var elmsec = $("#itemSubCategorySel");
                        var elmFlot = $("#floatingSubCatSel");
                        elmFlot.val(elmsec.val()).trigger('change.select2');
                        elmsec.val(elmFlot.val()).trigger('change.select2');
                    }
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
    //Add item Image
    $scope.SelectItemImage = function () {
        $scope.displayAddImageButton = false;
        $scope.displayImageName = true;
        $scope.EnableAddImage = true;
        angular.element('#ItemImageUpload').trigger('click');

    };

    //Change DepriciationRate
    $scope.ChangeDepriciationRate = ChangeDepriciationRate;
    function ChangeDepriciationRate() {
        var list = $scope.SubCategoryList.find(x => x.id === $scope.ItemDetails.subCategory.id);
        if (list && list != null) {
            $scope.ItemDetails.subCategory = angular.copy(list);
            $scope.ItemDetails.depriciationRate = list.annualDepreciation;
            $scope.ItemDetails.itemUsefulYears = list.usefulYears;
            $scope.CalculateRCV();
        }
    }

    $scope.ImageName;
    $scope.ImageType;
    $scope.ImgExtension;
    $scope.ItemImageList = [];
    $scope.displayImageName = false;
    $scope.displayAddImageButton = true;
    $scope.EnableAddImage = true;
    $scope.getItemImageDetails = function (e) {
        $scope.$apply(function () {
            $scope.ImageName = e.files[0].name;
            $scope.ImageType = e.files[0].type;
            $scope.ImgExtension = $scope.ImageName.substr($scope.ImageName.lastIndexOf('.'));
            $scope.ItemImageList.push(e.files[0]);
            var fr = new FileReader();
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
            "adjusterDescription": $scope.ItemDetails.adjusterDescription,
            "brand": $scope.ItemDetails.brand,
            "category": {
                "id": (($scope.ItemDetails.category !== null && angular.isDefined($scope.ItemDetails.category)) ? $scope.ItemDetails.category.id : null)
            },
            "dateOfPurchase": (($scope.ItemDetails.dateOfPurchase !== null && angular.isDefined($scope.ItemDetails.dateOfPurchase)) ? $scope.ItemDetails.dateOfPurchase : null), "depriciationRate": $scope.ItemDetails.depriciationRate,
            "description": $scope.ItemDetails.description,
            "insuredPrice": $scope.ItemDetails.insuredPrice,
            "quantity": $scope.ItemDetails.quantity,
            "totalTax": $scope.ItemDetails.totalTax,
            "isReplaced": $scope.ItemDetails.isReplaced,
            "holdOverValue": $scope.ItemDetails.holdOverValue,
            "itemName": $scope.ItemDetails.itemName,
            "model": $scope.ItemDetails.model,
            "quotedPrice": $scope.ItemDetails.quotedPrice,
            "rcv": $scope.ItemDetails.rcv,
            "subCategory": {
                "id": (($scope.ItemDetails.subCategory !== null && angular.isDefined($scope.ItemDetails.subCategory)) ? $scope.ItemDetails.subCategory.id : null)
            },
            "taxRate": $scope.ItemDetails.taxRate,
            "valueOfItem": $scope.ItemDetails.valueOfItem,
            "yearOfManufecturing": $scope.ItemDetails.yearOfManufecturing,
            "status": {
                "id": $scope.ItemDetails.status.id
            },
            "isScheduledItem": $scope.ItemDetails.isScheduledItem,
            "age": $scope.ItemDetails.age
        }));
        var SaveItemDetails = PolicyHolderItemDetailsService.SaveItemDetails(param);
        SaveItemDetails.then(function (success) {
            //Show message

            toastr.remove();
            toastr.success(success.data.message, "Confirmation");

            $scope.displayAddImageButton = true;
            $scope.displayImageName = false;
            $scope.ClearImage();
            $scope.GetItemImage();
        }, function (error) {  //Show messagetoastr.remove();
            toastr.error(error.data.errorMessage, "Error");

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
    };


    $scope.AcceptItem = AcceptItem;
    function AcceptItem() {
        var param = {
            "id": $scope.CommonObj.ItemId,
            "approvedItemValue": $scope.ItemDetails.valueOfItem
        };
        var AcceptItem = PolicyHolderItemDetailsService.AcceptItem(param);
        AcceptItem.then(function (success) {
            $scope.Status = success.data.status;
            if ($scope.Status === 200) {
                $scope.ItemDetails.status.id = 5; $scope.ItemDetails.status.status = "Approved";
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");
            }
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }

    $scope.GetItemImage = GetItemImage;
    function GetItemImage() {
        var param = {
            "itemId": $scope.CommonObj.ItemId
        };
        var GetImageOfItem = PolicyHolderItemDetailsService.gteItemImagess(param);
        GetImageOfItem.then(function (success) { $scope.images = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

    }

    //File Upload for item
    $scope.AddAttachment = function () {
        angular.element('#FileUpload').trigger('click');
    }
    $scope.displayAddImageButton = false;
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
                reader.onload = $scope.LoadFileInList;
                reader.readAsDataURL(file);
            }
        });
        // $scope.saveAttachment();
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
    //Remove local attachments
    $scope.RemoveAttachment = RemoveAttachment;
    function RemoveAttachment(index) {
        if ($scope.attachmentList.length > 0) {
            $scope.attachmentList.splice(index, 1);
        }
        $scope.close();
    }
    //Remove attachments saved in server
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

    //Attachments preview
    $scope.newImageIndex = null;
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
        var img = ["image", "application/image", "image/png", "image/jpeg", "image/gif", "png", "jpg", "jpeg", "gif", "image", "PNG", "JPEG", "GIF", "JPG"];
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
    // Attachments preview ends

    $scope.goToDashboard = function () {
        sessionStorage.setItem("PolicyHolderClaimNo", "");
        sessionStorage.setItem("PolicyHolderClaimId", "");
        $location.url(sessionStorage.getItem('HomeScreen'));
    }

    $scope.getPostLostItems = getPostLostItems;
    function getPostLostItems() {
        // get line items stored data from factory
        $scope.FiletrLostDamageList = [];
        var storedData = LineItemsFactory.getItemsList();
        if (!storedData)
            LineItemsFactory.getFromDatabase('postLostItems',function(result)
            {
                storedData=result;
            });
            // storedData = JSON.parse(sessionStorage.getItem("postLostItems"));
        if (storedData && storedData.claim && storedData.claim.claimNumber === $scope.CommonObj.ClaimNumber)
            $scope.FiletrLostDamageList = storedData.originalItemsList

        if ($scope.FiletrLostDamageList && $scope.FiletrLostDamageList.length > 0) {
            if (!$scope.setPageCalled) {
                setPage($scope.pageIndex + 1);
            }
        }
        // If is still empty
        else {
            //get Items list by service call
            var param = {
                "claimNumber": $scope.CommonObj.ClaimNumber,
                "pagination": {
                    "pageNumber": 0,
                    "limit": 0,
                    "sortBy": "itemNumber",
                    "orderBy": "asc",
                },
                "roomId": $scope.room ? $scope.room.id : null
            }
            var items = PolicyHolderItemDetailsService.getPostLostItemsWithComparables(param);
            items.then(function (success) {
                var lostItems = success.data.data.itemReplacement;
                angular.forEach(lostItems, function (item) {
                    $scope.FiletrLostDamageList.push(item.claimItem);
                });
                if ($scope.FiletrLostDamageList && !$scope.setPageCalled)
                    setPage($scope.pageIndex + 1);
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
        let index = $scope.FiletrLostDamageList.findIndex(item => item.id == sessionStorage.getItem("PolicyHolderPostLostItemId"));
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

    $scope.addToComparableAndMarkAsReplacement = addToComparableAndMarkAsReplacement;
    function addToComparableAndMarkAsReplacement(comaprable) {
        AddtoComparableList(comaprable);
        MarkAsReplacement(comaprable);
    }

    $scope.setPage = setPage;
    function setPage(page) {
        if ($scope.itemForm.contents && $scope.itemForm.contents.$invalid) {
            utilityMethods.validateForm($scope.itemForm.contents);
            return false;
        }
        $scope.totalPages = $scope.FiletrLostDamageList.length;
        if (page < 1 || page > $scope.totalPages) {
            return;
        }
        $scope.pageIndex = page;
        // get pager object from service
        $scope.pager = getPage(page);
        if (page > 0) {
            sessionStorage.setItem("PolicyHolderPostLostItemId", $scope.FiletrLostDamageList[page - 1].id);
            $scope.CommonObj.ItemId = $scope.FiletrLostDamageList[page - 1].id;
            $scope.CommonObj.PurchaseItemId = $scope.FiletrLostDamageList[page - 1].id;
            // save current item if only form fields are updated before changing to previous, this is a internal service call
            if ($scope.setPageCalled && $scope.ItemDetails.status.status != $scope.constants.itemStatus.underReview && $scope.itemForm.contents.$dirty)
                SaveNewlyAddedComparables(true, function () {
                    getItemDetails();
                });
            else
                getItemDetails();
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
    }
    $scope.closeVideoPreview = closeVideoPreview;
    function closeVideoPreview() {
        $('iframe').attr('src', $('iframe').attr('src'));
        setTimeout(function () {
            $scope.videoDiv = false;
            $("#video_preview").hide()
        }, 1000);

    };

    // CTB-2313
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
                                id: !document.id ? (!document.imageId ? null : document.imageId) : document.id
                            }
                            var promis = PolicyHolderItemDetailsService.deleteMediaFile(param);
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

    // Get List of Condition
    $scope.getCondition = getCondition;
    function getCondition() {
        var getpromise = PolicyHolderItemDetailsService.getCondition();
        getpromise.then(function (success) {
            $scope.ConditionList = success.data.data;
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    };

    $scope.changeCondition = changeCondition;
    function changeCondition(conditionId) {
        angular.forEach($scope.ConditionList, function (item) {
            if (item.conditionId == conditionId) {
                $scope.ItemDetails.condition.conditionName = item.conditionName;
            }
        });
    }
    // end CTB-2313

    $scope.goToDetailedInventory = function () {
        $location.path('/detailed_inventory');
    }

    $scope.goToRoom = function () {
        $location.url('/room/' + $scope.ItemDetails.room.id);
    }

    $scope.getRooms = getRooms;
    function getRooms() {
        var rooms = PolicyHolderItemDetailsService.getRooms($scope.CommonObj.ClaimNumber);
        rooms.then(function (success) {
            $scope.RoomsList = success.data.data;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }

    $scope.getRetailers = getRetailers;
    function getRetailers() {
        var retailers = PolicyHolderItemDetailsService.getRetailers();
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
    }

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
            if (retailer.name === 'Other')
                $scope.addOtherRetailer = true;
        }
        else {
            $scope.ItemDetails.originallyPurchasedFrom = null;
            $scope.ItemDetails.newRetailer = null;
            $scope.addOtherRetailer = false;
        }
    }

    //ACV Calculation Based On Age and Month
    $scope.itemAgeYearChanged = itemAgeYearChanged;
    function itemAgeYearChanged(year) {
        $scope.ItemDetails.ageYears = year;
        $scope.CalculateRCV();
    }

    $scope.itemAgeMonthChanged = itemAgeMonthChanged;
    function itemAgeMonthChanged(month) {
        $scope.ItemDetails.ageMonths = month;
        $scope.CalculateRCV();
    }

    $scope.selectPaymentmethod = function (paymentMethod) {
        if (paymentMethod === 'Gift')
            $scope.ItemDetails.originallyPurchasedFrom = null;
        else
            $scope.ItemDetails.giftedFrom = null;
    }
    // Round of 2 Decimal point
    $scope.roundOf2Decimal = roundOf2Decimal;
    function roundOf2Decimal(num) {
        if (num != null) {
            return (Math.round(num * 100) / 100).toFixed(2);
        }
        return num;
    }

    $scope.$on('$locationChangeStart', function (event, next, current) {
        if (next.indexOf("/room/") === -1)
            LineItemsFactory.removeAll();
        sessionStorage.removeItem("room");
    });
    $scope.addNewRetailer = function () {
        $scope.ItemDetails.originallyPurchasedFrom = null;
        $scope.newRetailer.addOtherRetailer = true;
    }
});
