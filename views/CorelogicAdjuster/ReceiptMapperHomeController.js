angular.module('MetronicApp').controller('ReceiptMapperHomeController', function ($rootScope, $uibModal, $scope, $timeout,
    $location, $translate, $filter, $translatePartialLoader, ReceiptMapperService, $compile, $interval, $q, AdjusterPropertyClaimDetailsService, StatusConstants) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    //$('body').addClass('page-on-load');
    $translatePartialLoader.addPart('ReceiptMapperHome');

    $(".page-spinner-bar").removeClass("hide");
    $translate.refresh();
    //Selected ItemId should be enter into this array as  $scope.ItemSelectedForReceiptMap.push({"id":id of item})
    //Selected item list to map against the receipt
    $scope.ItemSelectedForReceiptMap = [];

    $scope.isPDFLoaded = false;
    $scope.all = true;
    $scope.displaystatusfiltr = false;
    $scope.allpaid = true;
    $scope.displaypaidfiltr = false;
    $scope.alldue = true;
    $scope.displayduefiltr = false;
    //This is the list of item of claim
    $scope.FilteredClaimedItemList = [];
    $scope.noOfHoldoverItems = 0;
    $scope.ClaimedItemList = [];
    $scope.TotalACV = 0;
    $scope.TotalCost = 0;
    $scope.TotalHoldover = 0;
    $scope.DdlSourceCategoryList = [];
    $scope.ReceiptList = [];
    $scope.Recieptindex = 0;
    // $scope.isSaveBtn = true;
    $scope.isRowClicked = false;
    $scope.isDataSaving = false;
    $scope.PDFPageCount = 0;
    $scope.pdfId = "";
    $scope.PDFPageNumber = 1;
    $scope.currentPDFUrl = "";
    $scope.receiptName = "";
    $scope.mappedItemsList = [];
    $scope.itemsMappedArr = [];
    $scope.ACVValue = 0;
    $scope.RCVValue = 0;
    $scope.HoldoverValue = 0;
    $scope.rect = {};
    var canvas = {};
    var context = {};
    var pdfDoc = "";
    $scope.command = "create";
    //$scope.pageNum = 1;
    $scope.pageToDisplay = 1;
    $scope.payHoldOver = false;
    var scale = 1;

    $scope.constants = {
        itemStatus: StatusConstants.ItemStatus
    };

    function renderPage(page) {
        scale = 1;
        //context.clearRect(0, 0, canvas.width, canvas.height);
        var viewport = page.getViewport(scale);
        canvas = document.getElementById("pdf");
        $scope.rect.width = canvas.width;
        context = canvas.getContext('2d');
        var renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        page.render(renderContext);
    }
    //PDFJS.disableWorker = true;
    //PDFJS.getDocument("http://localhost:8080/pdf/1492764333798.pdf").then(renderPages);

    //Get the existing mapped items list
    $scope.getMappedItemsList = function (claimId) {
        var param = {
            "claimId": claimId
        };
        var mappedItems = ReceiptMapperService.getMappedLineItemsList(param);
        mappedItems.then(function (success) {
            $scope.mappedItemsList = (((success.data.data) != null) ? success.data.data.items : []);
            if ($scope.mappedItemsList.length > 0) {
                angular.forEach($scope.mappedItemsList, function (item) {
                    $scope.itemsMappedArr.push(item.itemId);
                });

            }
        }, function (error) {
            console.log("Error in getting mapped line list");
        });
    }
    //Get the existing pdf receipts list
    $scope.getReceiptsList = function (claimId) {
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "claimId": claimId
        };
        var receiptsList = ReceiptMapperService.getMappedReceiptsList(param);
        receiptsList.then(function (success) {

            $scope.ReceiptList = success.data.data;

            //If only one receipt exist. Then show first file initially
            if ($scope.ReceiptList != null && $scope.ReceiptList.length == 1) {
                if ($scope.ReceiptList[0].pdfList.length == 1) {
                    $scope.pdfUrl = ReceiptMapperService.getReceiptPath($scope.ReceiptList[0].pdfList[0].url);
                    $scope.pdfId = $scope.ReceiptList[0].pdfList[0].pdfId;
                    $scope.receiptName = $scope.ReceiptList[0].pdfList[0].name;
                    $scope.getMappedItemsList(claimId);
                    $scope.currentPDFUrl = $scope.pdfUrl;
                    $scope.ShowPdfDetails = "ShowDetails";
                }
            }
            else {
                $scope.ShowPdfDetails = "ShowList";
            }
           window.setTimeout(()=>$(".page-spinner-bar").addClass("hide"),2500);
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            console.log("Error in getting pdf list");
        });
    }

    function init() {
        //Newly added
        $scope.CurrentTab = 'Recipt';
        $scope.ShowPdfDetails = "ShowList";
        //Bind Item grid
        $scope.CommonObj = {
            Categories: "ALL",
            ClaimNumber: sessionStorage.getItem("ClaimNoForReceipt"),
            ClaimId: sessionStorage.getItem("ClaimIdForReceipt"),
            ReceiptNo: "",
            ReceiptAmount: ""
        };
        if ($scope.CommonObj.ClaimNumber !== null && angular.isDefined($scope.CommonObj.ClaimNumber)) {
            //Get list items

            GetItemList();
            //Get list of pdf if available
            $scope.getReceiptsList($scope.CommonObj.ClaimId);
            GetReceiptToShowMappedItem();
            //Get category to filter item list on selected category
            GetCategory();
        }
        else {
            $location.url('AdjusterPropertyClaimDetails');
        }
    }
    init();

    function parseFloatWithFixedDecimal(number) {
        if (number)
            //return +(Math.round(number + "e+2")  + "e-2");
            return Math.round((number + Number.EPSILON) * 100) / 100;
        else
            return 0;
    }

    $scope.payHoldOver = false;
    $scope.GetItemList = GetItemList;
    function GetItemList() {
        $(".page-spinner-bar").removeClass("hide");
        //Get item list to map new/edit receipt
        var param = {
            "claimNumber": $scope.CommonObj.ClaimNumber,
            "reqForReceiptMapper": true
        };

        //Call to service to get item list
        var GetItemList = ReceiptMapperService.GetItemListForReceipt(param);
        GetItemList.then(function (success) {
            //Filter list on status (Approved:5 and valued :4)
            //var ApprovedList = $filter('filter')(success.data.data, { claimItem: { status: { id: 5 } } });
            //var ValuedList = $filter('filter')(success.data.data, { claimItem: { status: { id: 4 } } });
            //merge list and bind to grid. Keep orginal list as it is to filter it with category
            // $scope.ClaimedItemList = ApprovedList.concat(ValuedList);
            //LIst bind to grid
            //$scope.FilteredClaimedItemList = ApprovedList.concat(ValuedList);
            $(".page-spinner-bar").removeClass("hide");
            $scope.MasterFilteredClaimedItemList = success.data.data != null ? success.data.data.itemReplacement : [];
            $scope.FilteredClaimedItemList = success.data.data != null ? success.data.data.itemReplacement : [];
            $scope.ClaimedItemList = success.data.data != null ? success.data.data.itemReplacement : [];
            $scope.totalCount = $scope.FilteredClaimedItemList.length > 0 ? $scope.FilteredClaimedItemList.length : 0;

            prepareItemsDatatable(null);
            $scope.uniqueStatus=[];
            $scope.filterStatus=[];
            $scope.uniqueStatus = [...new Set($scope.FilteredClaimedItemList.map(item => item.claimItem.status.status))];
            $scope.uniqueStatus = $scope.uniqueStatus.filter((status)=> !!status)
            $scope.filterStatus = [...$scope.uniqueStatus];

            $scope.uniqueHoldOvrPaid = [];
            $scope.filterHoldOvrPaid = [];
            $scope.uniqueHoldOvrPaid = ['$0.00','Others'];
            $scope.filterHoldOvrPaid = [...$scope.uniqueHoldOvrPaid];
            
            $scope.uniqueHoldOvrDue = [];
            $scope.filterHoldOvrDue = [];
            $scope.uniqueHoldOvrDue = ['$0.00','Others'];
            $scope.filterHoldOvrDue = [...$scope.uniqueHoldOvrDue];

            checkAllfilters();

            $scope.displaypaidfiltr =
            $scope.displayduefiltr = 
            $scope.displaystatusfiltr = false;

            constructTotalRowforEachItem();
           window.setTimeout(()=>$(".page-spinner-bar").addClass("hide"),1000);
        },
            function (error) { $(".page-spinner-bar").addClass("hide"); $scope.FilteredClaimedItemList = []; $scope.ClaimedItemList = []; });
        //End Item grid
    }

    function prepareItemsDatatable(updatedItems) {
        //Calculate total for columns ACV, RCV and Holdover
        $scope.TotalACV = 0.0;
        $scope.TotalCost = 0.0;
        $scope.TotalHoldover = 0.0;
        $scope.totalSettlement = 0.0;
        $scope.totalRCV = 0;
        $scope.TotalReceiptVal = 0;
        $scope.TotalStatedAmt = 0;
        $scope.TotalDepreciationAmt = 0;
        $scope.noOfHoldoverItems = 0;
        $scope.totalCashPaid = 0.0;
        $scope.TotalHoldoverDue = 0.0;
        $scope.TotalHoldoverPaid = 0.0;
        $scope.TotalQuantityToReplace = 0;
        $scope.TotalQuantityReplaced = 0;
        $scope.totalMaxHoldover = 0.0;
        $scope.totalReplacementExposure = 0.0;

        angular.forEach($scope.FilteredClaimedItemList, function (items, index) {
            angular.forEach(updatedItems, function (paidItem, i) {
                if (paidItem.id === items.claimItem.id) {
                    items.claimItem = angular.copy(paidItem);
                    updatedItems.splice(i, 1);
                }
            });
            $scope.TotalACV += items.claimItem.acv;
            $scope.totalRCV += items.claimItem.rcvTotal;
            $scope.TotalReceiptVal += items.claimItem.receiptValue;
            $scope.TotalStatedAmt += items.claimItem.totalStatedAmount;
            $scope.TotalDepreciationAmt += items.claimItem.depreciationAmount ? items.claimItem.depreciationAmount : 0.0;
            $scope.TotalQuantityToReplace += items.claimItem.quantity;
            $scope.TotalQuantityReplaced += items.claimItem.totalQuantityReplaced;
            items.subTotalQty = 0;
            items.subTotalReceiptValue = 0;
            items.subTotalRCV = 0;
            items.subTotalACV = 0;
            items.subTotalHoldOver = 0;
            $scope.defaultTaxRate = items.claimItem.taxRate;

            angular.forEach(items.claimItem.replaceItems, function (receiptItem) {
                items.subTotalQty += receiptItem.quantity
                items.subTotalReceiptValue += receiptItem.receiptValue;
                items.subTotalRCV += receiptItem.rcv;
                items.subTotalACV += receiptItem.acv;
                items.subTotalHoldOver += receiptItem.holdOver;
            });
            // items.claimItem.holdOverValue = items.subTotalRCV - items.claimItem.acv;
            // if (items.claimItem.holdOverValue < 0) {
            //     if (items.subTotalHoldOver > 0) {
            //         items.claimItem.holdOverValue = items.subTotalHoldOver;
            //         $scope.TotalHoldover += items.claimItem.holdOverValue;
            //     } else {
            //         items.claimItem.holdOverValue = 0;
            //     }
            // } else {
            //     $scope.TotalHoldover += items.claimItem.holdOverValue;
            // }
            $scope.TotalCost += items.subTotalRCV;
            // items.claimItem.quantity === items.claimItem.totalQuantityReplaced
            let cashPaid = items.claimItem.cashPaid ? parseFloatWithFixedDecimal(items.claimItem.cashPaid) : 0.0;
            let holdOverPaymentPaidAmount = items.claimItem.holdOverPaymentPaidAmount ? parseFloatWithFixedDecimal(items.claimItem.holdOverPaymentPaidAmount) : 0.0
            items.totalSettlement = cashPaid + holdOverPaymentPaidAmount;
            $scope.totalSettlement = parseFloatWithFixedDecimal($scope.totalSettlement + items.totalSettlement);

            $scope.totalCashPaid += (items.claimItem.cashPaid != null ? parseFloatWithFixedDecimal(items.claimItem.cashPaid) : 0);
            $scope.TotalHoldoverDue += (items.claimItem.holdOverDue != null ? parseFloatWithFixedDecimal(items.claimItem.holdOverDue) : 0);
            $scope.TotalHoldoverPaid += (items.claimItem.holdOverPaymentPaidAmount != null ? parseFloatWithFixedDecimal(items.claimItem.holdOverPaymentPaidAmount) : 0);
            if(items.claimItem.holdOverPaymentPaidAmount!=null && items.claimItem.holdOverPaymentPaidAmount!=0)
                $scope.noOfHoldoverItems++;
            if (items.claimItem.status.status == 'REPLACED' ||
                items.claimItem.status.status == 'SETTLED') {
                items.claimItem.totalQuantityReplaced = items.claimItem.quantity;
            }
            //RM-14
            $scope.totalMaxHoldover += items.claimItem.maxHoldover ? items.claimItem.maxHoldover : 0.0;
            $scope.totalReplacementExposure += items.claimItem.replacementExposure ? items.claimItem.replacementExposure : 0.0;
        });
    }

    //General functionality
    //Get Categiroes of item for dropdown
    $scope.GetCategory = GetCategory;
    function GetCategory() {
        var inc = 10000;
        var getpromise = ReceiptMapperService.getCategories();
        getpromise.then(function (success) {
            $scope.DdlSourceCategoryList = success.data.data;
        },
            function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    }

    //Go back to previous page
    $scope.GoBack = function (e) {
        // if ($scope.isDataSaving) {
        //     var btn = confirm("Changes you made are not saved. Yout still want leave the page.");
        //     if (btn == true) {
        //         $location.url(sessionStorage.getItem('previous'));
        //     }
        //     else return
        // }
        // else
            $location.url(sessionStorage.getItem('previous'));
    };
    //Go back to Dashboard
    $scope.GotoDashboard = function (e) {
        // if ($scope.isDataSaving) {
        //     var btn = confirm("Changes you made are not saved. You still want leave the page.");
        //     if (btn == true) {
        //         $location.url(sessionStorage.getItem('HomeScreen'));
        //     }
        //     else return
        // }
        // else
            $location.url(sessionStorage.getItem('HomeScreen'));
    };
    //Sort a table of item

    //CTB-3661 - navigation issue
    $scope.GotoClaimDetails = function () {
        $location.url('AdjusterPropertyClaimDetails');
    };

    $scope.sort = function (keyname) {
        $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false;
        $scope.sortKey = keyname;
    }

    //Calculate Totals of column
    angular.forEach($scope.FilteredClaimedItemList, function (items) {
        $scope.TotalACV += items.ACV;
        $scope.TotalCost += items.replacementCost;
        $scope.TotalHoldover += items.holdover;
        $scope.TotalQuantityToReplace += item.claimItem.quantity;
        $scope.TotalQuantityReplaced += item.claimItem.totalQuantityReplaced;
    });

    //Summary Tab functionality
    $scope.SummeryItemList = [];
    //$scope.FilteredSummeryItemList = [];
    $scope.FilteredSummeryItemList = [];
    $scope.quantityToReplace = 0;
    //Filter summary list by category
    $scope.GetItemsByCategory = function (e) {
        $scope.TempObj = [];
        $scope.TotalACV = 0;
        $scope.TotalCost = 0;
        $scope.TotalHoldover = 0;
        if (($scope.CommonObj.Categories === "ALL") || (angular.isUndefined($scope.CommonObj.Categories) || $scope.CommonObj.Categories === null)) {
            $scope.FilteredClaimedItemList = $scope.ClaimedItemList;
        }
        else {
            $scope.TempObj = $filter('filter')($scope.ClaimedItemList, { claimItem: { category: { name: $scope.CommonObj.Categories } } });
            $scope.FilteredClaimedItemList = $scope.TempObj;
        }
        angular.forEach($scope.FilteredClaimedItemList, function (items) {
            $scope.TotalACV += items.claimItem.acv;
            $scope.TotalCost += items.claimItem.rcv;
            $scope.TotalHoldover += items.claimItem.holdOverValue;
            $scope.TotalQuantityToReplace += items.claimItem.quantity;
            $scope.TotalQuantityReplaced += items.claimItem.totalQuantityReplaced;

        });

    }
    $scope.TotalACVFromSummery = 0;
    $scope.TotalCostFromSummery = 0;
    $scope.TotalHoldoverFromSummery = 0;
    $scope.itemsReplaced = 0;
    $scope.FilterSummaryByCategory = function (e) {
        $scope.SummertyTempObj = [];
        $scope.TotalACVFromSummery = 0;
        $scope.TotalCostFromSummery = 0;
        $scope.TotalHoldoverFromSummery = 0;
        if (($scope.CommonObj.Categories === "ALL") || (angular.isUndefined($scope.CommonObj.Categories) || $scope.CommonObj.Categories === null)) {
            $scope.FilteredSummeryItemList = $scope.SummeryItemList;
        }
        else {
            $scope.TempObj = $filter('filter')($scope.SummeryItemList, { category: $scope.CommonObj.Categories });
            $scope.FilteredSummeryItemList = $scope.TempObj;
        }
        angular.forEach($scope.FilteredSummeryItemList, function (items) {
            $scope.TotalACVFromSummery += items.acv;
            $scope.TotalCostFromSummery += items.rcv;
            $scope.TotalHoldoverFromSummery += items.holdOverValue;
        });

    }

    angular.forEach($scope.FilteredSummeryItemList, function (items) {
        $scope.TotalACVFromSummery += items.cumulativeACV;
        $scope.TotalCostFromSummery += items.replacementspend;
        $scope.TotalHoldoverFromSummery += items.holdover;
        $scope.itemsReplaced += items.itemsreplaced;
    });

    //Sort a table of summary item
    $scope.sortSummary = function (keyname) {
        $scope.Summaryreverse = ($scope.sortSummaryKey === keyname) ? !$scope.Summaryreverse : false;
        $scope.sortSummaryKey = keyname;   //set the sortKey to the param passed
    }
    //End Summerry tab functionality
    //End General functionality

    //PDF functionality

    $scope.loading = 'loading please wait...';

    $scope.getNavStyle = function (scroll) {
        if (scroll > 100) return 'pdf-controls fixed';
        else return 'pdf-controls';
    };

    $scope.onError = function (error) {
        console.log(error);
    };

    $scope.onLoad = function () {
        $scope.loading = '';
        if ($('#pdf').is(':visible')) {
            canvas = document.getElementById("pdf");
            context = canvas.getContext('2d');
            $scope.rect.width = canvas.width;
            $scope.rect.height = document.getElementById("mapItem").clientHeight;
            //Get PDF list and loop through the maped item and then show mapping (Need to work)
        }
        // else {
        //     console.log("canvas was not loaded yet.");
        // }
    };
    // To show first page of pdf and will be used to nevigate pdf pages

    //Go to previous Receipt PDF in the list
    $scope.PreviousReceipt = PreviousReceipt;
    function PreviousReceipt() {
        if ($scope.Recieptindex > 0) {
            $scope.Recieptindex = parseInt($scope.Recieptindex) - 1;
            $scope.pdfUrl = ReceiptMapperService.getReceiptPath($scope.ReceiptList[$scope.Recieptindex].url);
            $scope.pdfId = $scope.ReceiptList[$scope.Recieptindex].pdfId;
            $scope.receiptName = $scope.ReceiptList[$scope.Recieptindex].name;
            $scope.PDFPageNumber = 1;
            showPDFMappedItems($scope.pdfId, $scope.PDFPageNumber);
            $scope.isRowClicked = false;
            $scope.currentPDFUrl = $scope.pdfUrl;
        }
    }

    //Go to next Receipt PDF in the list
    $scope.NextReceipt = NextReceipt;
    function NextReceipt() {
        if ($scope.Recieptindex < $scope.ReceiptList.length - 1) {
            $scope.Recieptindex = parseInt($scope.Recieptindex) + 1;
            $scope.pdfUrl = ReceiptMapperService.getReceiptPath($scope.ReceiptList[$scope.Recieptindex].url);
            $scope.receiptName = $scope.ReceiptList[$scope.Recieptindex].name;
            $scope.pdfId = $scope.ReceiptList[$scope.Recieptindex].pdfId;
            $scope.PDFPageNumber = 1;
            showPDFMappedItems($scope.pdfId, $scope.PDFPageNumber);
            $scope.isRowClicked = false;
            $scope.currentPDFUrl = $scope.pdfUrl;
        }
    }

    //Go to next page of the pdf
    $scope.goNextPage = function () {
        pdfDoc = $scope.currentPDFUrl;
        $scope.isRowClicked = true;
        $scope.pageToDisplay = $scope.PDFPageNumber;
        PDFJS.getDocument(pdfDoc).then(function (pdfDoc) {
            $scope.pageToDisplay >= pdfDoc.numPages || ($scope.pageToDisplay = parseInt($scope.pageToDisplay) + 1, document.getElementById("page_num").value = $scope.pageToDisplay)
            $scope.PDFPageNumber = $scope.pageToDisplay;
            pdfDoc.getPage(parseInt($scope.pageToDisplay)).then(renderPage);
            $scope.PDFPageCount = pdfDoc.numPages;
            showPDFMappedItems($scope.pdfId, $scope.pageToDisplay);
        });

    }
    //Go to previous page of the pdf
    $scope.goPreviousPage = function () {
        pdfDoc = $scope.currentPDFUrl;
        $scope.isRowClicked = true;
        $scope.pageToDisplay = $scope.PDFPageNumber;
        PDFJS.getDocument(pdfDoc).then(function (pdfDoc) {
            $scope.pageToDisplay <= 1 || ($scope.pageToDisplay = parseInt($scope.pageToDisplay) - 1, document.getElementById("page_num").value = $scope.pageToDisplay)
            $scope.PDFPageNumber = $scope.pageToDisplay;
            pdfDoc.getPage(parseInt($scope.pageToDisplay)).then(renderPage);
            showPDFMappedItems($scope.pdfId, $scope.pageToDisplay);
            $scope.PDFPageCount = pdfDoc.numPages;
        });
    }
    //zoomin pdf page
    $scope.zoomInPage = function () {
        pdfDoc = $scope.currentPDFUrl;
        scale = scale + .2;
        PDFJS.getDocument(pdfDoc).then(function (pdfDoc) {
            pdfDoc.getPage($scope.PDFPageNumber).then(renderPage);
        });
    }
    //zoom out pdf page
    $scope.zoomOutPage = function () {
        pdfDoc = $scope.currentPDFUrl;
        scale = scale - .2;
        PDFJS.getDocument(pdfDoc).then(function (pdfDoc) {
            pdfDoc.getPage($scope.PDFPageNumber).then(renderPage);
        });
    }

    //fit page to 100% size
    $scope.fitPage = function () {
        pdfDoc = $scope.currentPDFUrl;
        scale = 1;
        PDFJS.getDocument(pdfDoc).then(function (pdfDoc) {
            pdfDoc.getPage($scope.PDFPageNumber).then(renderPage);
        });
    }

    $scope.editMappedItem = function (itemId, id) {
        angular.forEach($scope.FilteredClaimedItemList, function (items) {
            //Add quantity, receipt value here
            if (itemId == items.claimItem.id) {
                //Global Value for seleted Item for calculate ACV RCV in short this variable refers the original item from the list with all the details by sd 11 sept
                $scope.ItemDetails = angular.copy(items.claimItem);
            }
        });

        if ($scope.ItemDetails.status.status == 'REPLACED' || $scope.ItemDetails.status.status == 'PARTIAL REPLACED') {
            if ($scope.EditObject.id == id) {
                $scope.ACVValue = $scope.EditObject.acv;
                $scope.RCVValue = $scope.EditObject.rcv;
                $scope.HoldoverValue = $scope.EditObject.holdOver;
                $scope.mapItem.itemValue = angular.copy($scope.EditObject.receiptValue);
                $scope.mapItem.itemQuantity = $scope.EditObject.quantity;

                $scope.mapItem.itemMCost = $scope.EditObject.materialCost;
                $scope.mapItem.itemSalesTax = $scope.EditObject.salesTax;
                $scope.mapItem.itemShipping = $scope.EditObject.shipping;
            }
            var mapItem = document.getElementById("mapItem");
            mapItem.style.top = $scope.EditObject.offsetY + "px";
            $scope.mapItem.itemId = itemId;
            $scope.isShowPopup = true;
            $scope.popupMessage = "";
            document.getElementById("pdf").style.cursor = "auto";
            $scope.isPopupExists = true;
            $scope.command = "edit";
            document.getElementById("mapItem").style.display = "block";
            setTimeout(function () {
                $("#txtItemQuantity").focus();
            }, 500);

        } else {
            bootbox.alert({
                size: "",
                title: "Alert", closeButton: false,
                message: "'" + $scope.ItemDetails.status.status + "'" + " status mapped item #" + $scope.ItemDetails.itemNumber + " can not be Edited!"
            });
        }
    }

    function showPDFMappedItems(pdfId, PDFPageNumber) {
        clearPDFMapping();
        angular.forEach($scope.ReceiptListMappedItem.pdfList, function (item) {
            if (item.pdfId == pdfId && angular.isDefined(item.mappedLineItem)) {
                for (var i = 0; i < item.mappedLineItem.length; i++) {
                    if (item.mappedLineItem[i].PDFPageNumber == PDFPageNumber) {
                        $scope.isRowClicked = true;
                        $scope.mapItem.itemId = item.mappedLineItem[i].itemId;
                        if (angular.isDefined($scope.EditObject)) {
                            $scope.EditObject.id = item.mappedLineItem[i].id;
                        }
                        else {
                            $scope.EditObject = {};
                            $scope.EditObject.id = item.mappedLineItem[i].id;
                        }
                        drawItemBox(item.mappedLineItem[i].itemId, item.mappedLineItem[i]);
                        angular.element(document.querySelector('.itemBorder')).removeClass("itemBorder");
                        document.getElementById(item.mappedLineItem[i].itemId).classList.add("itemBorder");
                        document.getElementById(item.mappedLineItem[i].itemId).style.width = "" + canvas.width + "px";
                        $scope.isShowPopup = false;
                        $scope.isPopupExists = false;
                        $scope.popupMessage = "Click to map item";
                        document.getElementById("pdf").style.cursor = "crosshair";
                        break;
                    }
                }
            }
        });

        $(".page-spinner-bar").addClass("hide");
    }
    //Show already mapped item (Two textboxes with value and itemID)
    function drawItemBox(id, item) {
        //console.log(item);
        $scope.EditObject = item;
        var newMapItem = $(document.createElement('div'))
            .attr("id", id).attr("class", "plotbox");
        newMapItem.css({ "top": item.offsetY + "px", "width": ((angular.isDefined($scope.rect.width)) ? $scope.rect.width : ('151px')), "height": 35 });
        // item.offsetX replace to 0
        newMapItem.after().html('<div class="mapItem" style="left:' + 0 + 'px">' +
            '<input type= "number"  value= "' + item.itemNumber + '" disabled><input type= "number" value= "' + item.receiptValue + '" disabled></div>' +
            '<div class="actions_btns"><i class="fa fa-edit fa-2x text-success" aria-hidden="true" ng-click="editMappedItem(' + id + ',' + item.id + ')" title="Edit/View"></i></div>');
        //newMapItem.appendTo("#mapItemsGroup");
        var content = $compile(newMapItem)($scope);
        content.appendTo("#mapItemsGroup");
    }
    //Clear other marking areas
    function clearPDFMapping() {
        var el = document.getElementsByClassName('plotbox');
        if (el.length > 0) {
            for (var i = el.length - 1; i > -1; i--) {
                el[i].remove();
            }
        }
    }
    //End PDF functionality

    //New PDF upload region
    //Clear files form file uploader
    $scope.ClearFiles = ClearFiles;
    function ClearFiles() {
        $scope.ReceiptName = "";
        $scope.ReceiptFileType = "";
        $scope.ReceiptFileExtension = "";
        $scope.Receiptfiles = [];
        angular.element("input[type='file']").val(null);
    }

    //Open file dialog
    $scope.UploadFile = function () {
        angular.element("input[type='file']").val(null);
        angular.element('#FileUpload').trigger('click');
    }

    //Get Uploaded file
    $scope.Receiptfiles = [];
    $scope.files = [];
    $scope.getReceiptFile = function (e) {
        $(".page-spinner-bar").removeClass("hide");
        // $scope.files = e.files;
        var pdf = ["pdf", "application/pdf"];
        var fileNames = [];
        angular.forEach($scope.ReceiptList, function (date) {
            let pdfFiles = date.pdfList.map(file => file.name);
            angular.forEach(pdfFiles, function (fileName) {
                fileNames.push(fileName);
            });
        })
        // var fileCount = 0;
        angular.forEach(e.target.files, function (file) {
            if ($scope.files.length < 20) {
                // Validate file before pushing to list
                let isPDF = true, isSizeExceeded = false, isExist = false, message = "";
                // Check file format
                if (pdf.indexOf((file.FileType ? file.FileType : file.type).toLowerCase()) > -1) {
                    // Check if receipt name already exist
                    if (!fileNames.includes(file.name)) {
                        // Check file size
                        if (file.size > 20971520) {
                            isSizeExceeded = true;
                            message = file.name + " is skipped because file is more than 20MB.";
                        }
                    }
                    else {
                        isExist = true;
                        message = "Skipping duplicate PDF with name " + file.name + ". Please rename the file or choose a different file."
                    }
                }
                else
                    message = file.name + " is skipped because it is not a pdf. Please upload only .pdf files";
                if (isPDF && !isSizeExceeded && !isExist)
                    $scope.files.push(file);
                else
                    toastr.warning(message, "Warning");
            }
            else {
                toastr.remove();
                toastr.warning("Skipping files. Cannot upload more than 20 receipts.", "Warning");
                $scope.files = [];
                angular.element("input[type='file']").val(null);
                return false;
            }
        });
        if ($scope.files && $scope.files.length > 0) {
            var fileData = new FormData();
            //var filesDetails = [];
            angular.forEach($scope.files, function (file) {
                // filesDetails.push({
                //     "fileName": file.FileName,
                //     "fileType": file.FileType,
                //     "extension": file.FileExtension,
                //     "filePurpose": file.Purpose,
                //     "latitude": null,
                //     "longitude": null,
                //     "description": ItemFile.description
                // });
                fileData.append('pdfFile', file);
            });
            fileData.append('pdfName', "File for receipt");
            //fileData.append('filesDetails', JSON.stringify(filesDetails));
            fileData.append('claimId', $scope.CommonObj.ClaimId);
            var saveReceipt = ReceiptMapperService.uploadReceiptAgainestClaimId(fileData);
            saveReceipt.then(function (success) {
                toastr.success((success.data !== null && angular.isDefined(success.data) ? success.data.message : "Receipt uploded successfully."), "Confirmation");
                $scope.getReceiptsList($scope.CommonObj.ClaimId);
                GetReceiptToShowMappedItem();
            }, function (error) {
                //toastr.remove();
                toastr.error((error.data !== null) ? error.data.errorMessage : "Failed to upload the receipts. please try again.", "Error");
                //$scope.getReceiptsList($scope.CommonObj.ClaimId);
                //GetReceiptToShowMappedItem();
                $(".page-spinner-bar").addClass("hide");
            });
            $scope.files = [];
            angular.element("input[type='file']").val(null);
        }
        else
            $(".page-spinner-bar").addClass("hide");
    };

    //all the aggrigate limits details
    $scope.AggregateLimitValueDetails = { "TotalReceiptValue": 0, "TotalRCVValues": 0, "TotalAggregateCoverage": 0 };

    //(Need to work on) Get aggreate covergare to set the RCV and holdover
    function getAggregateLimit(categoryId) {
        $scope.AggregateLimitValueDetails = { "TotalReceiptValue": 0, "TotalRCVValues": 0, "TotalAggregateCoverage": 0 };
        angular.forEach($scope.FilteredClaimedItemList, function (items) {
            if (items.claimItem.category !== null && angular.isDefined(items.claimItem.category)) {
                if (categoryId == items.claimItem.category.id) {
                    $scope.AggregateLimitValueDetails.TotalReceiptValue = $scope.AggregateLimitValueDetails.TotalReceiptValue + ((items.claimItem.receiptValue !== null && angular.isDefined(items.claimItem.receiptValue)) ? parseFloat(items.claimItem.receiptValue) : 0);
                    $scope.AggregateLimitValueDetails.TotalRCVValues = $scope.AggregateLimitValueDetails.TotalRCVValues + ((items.claimItem.rcv !== null && angular.isDefined(items.claimItem.rcv)) ? parseFloat(items.claimItem.rcv) : 0);
                }
            }
        });
    }


    //plot popup textboxes on canvas
    $scope.addItemObj = {};
    $scope.isPopupExists = false;
    $scope.addDivCounter = 1;
    $scope.getCoordinates = function (element) {

        $scope.addItemObj.offsetX = element.position().left;
        $scope.addItemObj.offsetY = element.position().top;
    }
    $scope.isShowPopup = false;
    $scope.popupMessage = "Click to map item";
    $scope.isItemExists = false;
    $scope.mapItem = {};

    //clear all popup data before adding new item
    $scope.clearPopup = function () {
        $scope.mapItem.itemId = "";
        $scope.mapItem.itemValue = "";
        $scope.mapItem.itemQuantity = "";
        $scope.ACVValue = 0;
        $scope.RCVValue = 0;
        $scope.HoldoverValue = 0;

        $scope.mapItem.itemMCost = 0;
        $scope.mapItem.itemApplyTax = true;
        $scope.mapItem.itemSalesTax = $scope.defaultTaxRate != null ? $scope.defaultTaxRate : 0;
        $scope.mapItem.itemShipping = 0;

        $scope.mapItem.itemNumber = null;
    }

    //plot a popup on click of pdf with input boxes
    $scope.drawPopupBox = function (evt) {

        if (!$scope.isPopupExists) {
            //clear the textboxes of the popup
            $scope.clearPopup();
            $scope.rect.leftX = evt.offsetX;
            $scope.rect.topY = evt.offsetY;
            $scope.addItemObj.offsetX = $scope.rect.leftX;
            $scope.addItemObj.offsetY = $scope.rect.topY;
            document.getElementById("mapItem").style.display = "block";
            $scope.isShowPopup = true;
            var mapItem = document.getElementById("mapItem");
            mapItem.style.left = $scope.rect.leftX + "px";
            mapItem.style.top = $scope.rect.topY + "px";
            $scope.popupMessage = "";
            document.getElementById("pdf").style.cursor = "auto";
            $scope.isPopupExists = true;
            $scope.command = "create";

            // setTimeout(function(){
            //     $("#txtItemId").focus()
            // }, 500);

            $('.itemMapped').draggable({
                start: function () {
                    $scope.getCoordinates($(this));
                },
                stop: function () {
                    $scope.getCoordinates($(this));
                }
            });
        }
        else {
            console.log("Can't draw a new popup as there was some unsaved mapping present on the pdf.");
            return;
        }
    }
    //Save the new mapped item for pdf
    $scope.SaveMappedItem = function () {
        // ItemId, ItemNumber and ItemValue
        $scope.itemId = $scope.ItemDetails.id;
        $scope.itemNumber = $scope.ItemDetails.itemNumber
        $scope.itemValue = $scope.mapItem.itemValue;

        // MaterialCost, SalesTax and Shipping
        $scope.itemMCost = $scope.mapItem.itemMCost;
        $scope.itemSalesTax = $scope.mapItem.itemSalesTax;
        $scope.itemShipping = $scope.mapItem.itemShipping;

        if ($scope.command == "create") {

            if ($scope.isNullOrEmpty($scope.mapItem.itemQuantity)) {
                bootbox.alert({
                    title: "Alert",
                    message: "Quantity should not be empty"
                });
                return;
            } else if ($scope.mapItem.itemQuantity == 0) {
                bootbox.alert({
                    title: "Alert",
                    message: "Quantity should not be zero"
                });
                return;
            } else if ($scope.isNullOrEmpty($scope.itemMCost) || $scope.itemMCost == 0) {
                bootbox.alert({
                    title: "Alert",
                    message: "Material cost should not be empty or zero"
                });
                return;
            } else if ($scope.mapItem.itemApplyTax && ($scope.isNullOrEmpty($scope.itemSalesTax) || $scope.itemSalesTax == 0)) {
                bootbox.alert({
                    title: "Alert",
                    message: "Sales Tax should not be empty or zero"
                });
                return;
            }
            // else if ($scope.isNullOrEmpty($scope.itemShipping) || $scope.itemShipping == 0) {
            //     bootbox.alert({
            //         title: "Alert",
            //         message: "Shipping cost should not be empty or zero"
            //     });
            //     return;
            // }

            if ($scope.ItemDetails.replaceItems !== null) {
                var qty = 0;
                angular.forEach($scope.ItemDetails.replaceItems, function (item) {
                    qty += item.quantity
                })
                var remainingQuantity = $scope.ItemDetails.quantity - qty;
                if ($scope.mapItem.itemQuantity > remainingQuantity) {
                    $scope.mapItem.itemQuantity = remainingQuantity;
                }
            }

            if ($scope.mapItem.itemQuantity > $scope.ItemDetails.quantity) {
                bootbox.alert({
                    title: "Alert",
                    message: "Item Quantity should not be greater than available quantity."
                });
                return;
            }

            if ($scope.isNullOrEmpty($scope.itemId) || $scope.isNullOrEmpty($scope.itemValue)) {
                bootbox.alert({
                    title: "Alert",
                    message: "Item Id or Price should not be empty."
                });
                return;
            }
            else if (isNaN($scope.itemId) || isNaN($scope.itemValue)) {
                bootbox.alert({
                    title: "Alert",
                    message: "Please enter numbers only."
                });
                return;
            }
            if ($scope.validateItem($scope.itemId, $scope.itemValue)) {
                //Check if the item has been alrady mapped
                if ($scope.itemsMappedArr.indexOf($scope.itemId) > -1 && (1 != 1)) {
                    bootbox.alert({
                        title: "Alert",
                        message: "This item has been already mapped against calimed line items."
                    });
                    return;
                }
                $scope.isDataSaving = true;
                // $scope.isSaveBtn = false;
                $scope.addItemObj.itemId = $scope.itemId;
                $scope.addItemObj.itemValue = $scope.itemValue;

                var newItem = {
                    "pdfId": $scope.pdfId,
                    "offsetX": $scope.addItemObj.offsetX,
                    "offsetY": $scope.addItemObj.offsetY,
                    "itemId": $scope.addItemObj.itemId,
                    "value": $scope.addItemObj.itemValue,
                    "PDFPageNumber": $scope.PDFPageNumber
                }
                var param = {
                    "acv": $scope.ACVValue,
                    "itemId": $scope.addItemObj.itemId,
                    "offsetX": $scope.addItemObj.offsetX,
                    "offsetY": $scope.addItemObj.offsetY,
                    "pdf": {
                        "pdfId": $scope.pdfId
                    },
                    "PDFPageNumber": $scope.PDFPageNumber,
                    "rcv": $scope.RCVValue,
                    "receiptValue": $scope.mapItem.itemValue,
                    "quantity": $scope.mapItem.itemQuantity,
                    "holdOverDue": $scope.HoldoverValue,
                    "holdOverPaid": 0,
                    "cashPaid": $scope.cashPaidForMapItems,
                    "materialCost": $scope.itemMCost,
                    "salesTax": $scope.itemSalesTax,
                    "shipping": $scope.itemShipping,
                    "replacementExposure": $scope.replacementExposureMapItems
                };
                var saveNewMappedItem = ReceiptMapperService.saveMappedClaimItem(param);
                saveNewMappedItem.then(function (success) {//refresh list after saving mapped item
                    var obj =
                    {
                        "PDFPageNumber": $scope.PDFPageNumber,
                        "acv": $scope.ACVValue,
                        //"holdOver": $scope.HoldoverValue,
                        "id": success.data.data.id,
                        "offsetX": $scope.addItemObj.offsetX,
                        "offsetY": $scope.addItemObj.offsetY,
                        "pdf": {
                            "pdfId": $scope.pdfId,
                            "name": $scope.receiptName
                        },
                        "quantity": $scope.mapItem.itemQuantity,
                        "rcv": $scope.RCVValue,
                        "receiptValue": $scope.mapItem.itemValue,
                        "materialCost": $scope.mapItem.itemMCost,
                        "salesTax": $scope.mapItem.itemSalesTax,
                        "shipping": $scope.mapItem.itemShipping,
                        "cashPaid": $scope.mapItem.cashPaid,
                        "replacementExposure": $scope.mapItem.replacementExposure
                    }

                    $scope.GetItemList();
                    $scope.clearPopup();
                    //make replacement item obj and drowbox
                    $scope.ShowPdfCoordinates(obj, $scope.itemId, $scope.itemNumber);
                    toastr.remove();
                    toastr.success(success.data.message, "Confirmation");
                },
                    function (error) {
                        toastr.remove();
                        toastr.error(error.data.errorMessage, "Error");
                    });

                $scope.isShowPopup = false;
                $scope.isPopupExists = false;
                $scope.popupMessage = "Click to map item";
                document.getElementById("pdf").style.cursor = "crosshair";
            }
            else {
                bootbox.alert({
                    title: "Alert",
                    message: "The item you are trying to map does not exist in the claimed items."
                });
                return;
            }

        }

        else if ($scope.command == "edit") {
            //$scope.itemId = $scope.mapItem.itemId;
            //$scope.itemValue = $scope.mapItem.itemValue;
            if ($scope.isNullOrEmpty($scope.itemValue)) {
                bootbox.alert({
                    title: "Alert",
                    message: "Price should not be empty."
                });
                return;
            }
            else if (isNaN($scope.itemValue)) {
                bootbox.alert({
                    title: "Alert",
                    message: "Please enter numbers only."
                });
                return;
            } else if ($scope.isNullOrEmpty($scope.mapItem.itemQuantity)) {
                bootbox.alert({
                    title: "Alert",
                    message: "Quantity should not be empty"
                });
                return;
            } else if ($scope.mapItem.itemQuantity == 0) {
                bootbox.alert({
                    title: "Alert",
                    message: "Quantity should not be zero"
                });
                return;
            } else if ($scope.isNullOrEmpty($scope.itemMCost) || $scope.itemMCost == 0) {
                bootbox.alert({
                    title: "Alert",
                    message: "Material cost should not be empty or zero"
                });
                return;
            } else if ($scope.isNullOrEmpty($scope.itemSalesTax) || $scope.itemSalesTax == 0) {
                bootbox.alert({
                    title: "Alert",
                    message: "Sales Tax should not be empty or zero"
                });
                return;
            }
            // else if ($scope.isNullOrEmpty($scope.itemShipping) || $scope.itemShipping == 0) {
            //     bootbox.alert({
            //         title: "Alert",
            //         message: "Shipping cost should not be empty or zero"
            //     });
            //     return;
            // }

            $scope.isDataSaving = true;
            $scope.isShowPopup = false;
            $scope.isPopupExists = false;
            $scope.popupMessage = "Click to map item";
            document.getElementById("pdf").style.cursor = "crosshair";

            var param = {
                "id": $scope.EditObject.id,
                "acv": $scope.ACVValue,
                "holdOver": $scope.HoldoverValue,
                "itemId": $scope.mapItem.itemId,
                "offsetX": $scope.EditObject.offsetX,
                "offsetY": $scope.EditObject.offsetY,
                "pdf": {
                    "pdfId": $scope.pdfId
                },
                "PDFPageNumber": $scope.PDFPageNumber,
                "rcv": $scope.RCVValue,
                "receiptValue": $scope.mapItem.itemValue,
                "quantity": $scope.mapItem.itemQuantity,
                "holdOverDue": $scope.HoldoverValue,
                "holdOverPaid": 0,
                "cashPaid": 0,
                "materialCost": $scope.itemMCost,
                "salesTax": $scope.itemSalesTax,
                "shipping": $scope.itemShipping,
                "replacementExposure":$scope.replacementExposureMapItems,
                "cashPaid" : $scope.cashPaidForMapItems
            };
            var UpdateMappedItem = ReceiptMapperService.updateMappedLineItem(param);
            UpdateMappedItem.then(function (success) {
                $scope.EditObject.acv = $scope.ACVValue;
                $scope.EditObject.rcv = $scope.RCVValue;
                $scope.EditObject.holdOver = $scope.HoldoverValue;
                $scope.EditObject.quantity = $scope.mapItem.itemQuantity;
                $scope.EditObject.receiptValue = $scope.mapItem.itemValue;

                $scope.EditObject.materialCost = $scope.mapItem.itemMCost;
                $scope.EditObject.salesTax = $scope.mapItem.itemSalesTax;
                $scope.EditObject.shipping = $scope.mapItem.itemShipping;

                $scope.isDataSaving = false;
                $scope.GetItemList();
                $scope.addItemObj = {};
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");
                var element = document.getElementById($scope.itemId);
                element.getElementsByTagName("input")[1].value = $scope.itemValue;

                //refresh list after editing mapped item

            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });
        }
    }

    // Update - Settled Action
    $scope.updateItemSettledStatus = function (item) {
        $(".page-spinner-bar").removeClass("hide");
        $scope.itemId = item.claimItem.id;
        $scope.itemNumber = item.claimItem.itemNumber;
        var holdoverValue = 0;
        var receiptVal = 0;
        var cashPaid = 0;

        var holdoverPaid = parseFloat(item.claimItem.holdOverPaymentPaidAmount != null ? item.claimItem.holdOverPaymentPaidAmount : 0);

        // Status changing 'PARTIAL REPLACED'  to 'SETTLED'
        if (item.claimItem.status.status == 'PARTIAL REPLACED') {
            /*var hold = (parseFloat(item.claimItem.rcvTotal) - parseFloat(item.claimItem.acv)).toFixed(2);
            holdoverValue = parseFloat((hold > 0) ? hold : 0);
            //Check if the value is Nan or not
            if (isNaN(holdoverValue)) {
                holdoverValue = 0;
            }*/

            /*holdoverValue = $scope.parseFloatWithFixedDecimal(holdoverValue - holdoverPaid);
            if(holdoverValue > 0){
                holdoverPaid += holdoverValue;
            }

            if(item.claimItem.receiptValue == null || item.claimItem.receiptValue == 0){
                receiptVal = item.claimItem.rcvTotal;
            }else{
                receiptVal = item.claimItem.receiptValue
            }*/
            receiptVal = parseFloatWithFixedDecimal(item.claimItem.receiptValue);
            cashPaid = parseFloatWithFixedDecimal(item.claimItem.acv + holdoverPaid);
        } else {// Status changing 'PAID'  to 'SETTLED'
            cashPaid = parseFloatWithFixedDecimal(item.claimItem.cashPaid != null ? item.claimItem.cashPaid : 0);
        }

        var param = {
            "acv": parseFloat(item.claimItem.acv),
            "holdOver": holdoverValue,
            "itemId": $scope.itemId,
            // "offsetX": 0,
            // "offsetY": 0,
            // "pdf": {
            //     "pdfId": $scope.pdfId
            //  },
            // "PDFPageNumber": 0,
            "rcv": parseFloat(item.claimItem.rcvTotal),
            "receiptValue": parseFloat(receiptVal),
            //"quantity": item.claimItem.quantity,
            "holdOverDue": 0,
            "holdOverPaid": parseFloat(holdoverPaid),
            "cashPaid": parseFloat(cashPaid)
        };

        var saveNewSettledItem = ReceiptMapperService.updateItemStatusSettled(param);
        saveNewSettledItem.then(function (success) {//refresh list after updating item status
            $scope.GetItemList();
            $scope.clearPopup();
            //console.log(success.data.message);
            toastr.remove();
            toastr.success("Item’s status was successfully updated.", "Confirmation");
        },
            function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });


    }

    //save the item if the enter key pressed
    $scope.saveItem = function (e) {
        if (e.keyCode == 13 || e.key == "Enter") {
            $scope.SaveMappedItem();
        }
    }

    //check if the mapping item id exists in the list of claimed items
    $scope.validateItem = function (id, value) {
        $scope.isItemExists = false;
        angular.forEach($scope.FilteredClaimedItemList, function (item) {
            if (item.claimItem.id == id || item.claimItem.itemNumber == $scope.itemNumber) {
                $scope.isItemExists = true;
            }
        });
        return $scope.isItemExists;
    }
    $scope.isNullOrEmpty = function (obj) {
        return (obj === null || obj === '');
    }

    //To show the cordinates on pdf
    $scope.ShowPdfCoordinates = ShowPdfCoordinates;
    function ShowPdfCoordinates(ObjReplacement, itemId, itemNumber) {
        clearPDFMapping();
        //Go Here
        $scope.mapItem.itemId = itemId;
        var pdfPageNum = ObjReplacement.PDFPageNumber;
        $scope.mapItem.itemNumber = itemNumber;
        ObjReplacement.itemNumber = itemNumber;
        angular.forEach($scope.ReceiptList, function (rpt) {
            angular.forEach(rpt.pdfList, function (receipt) {
                if (ObjReplacement.pdf.pdfId === receipt.pdfId) {
                    $scope.pdfUrl = null; $scope.currentPDFUrl = null; $scope.pdfId = null; $scope.receiptName = null; $scope.PDFPageNumber = 1;

                    $scope.getMappedItemsList($scope.CommonObj.ClaimId);
                    pdfDoc = ReceiptMapperService.getReceiptPath(receipt.url);
                    //$scope.pdfUrl = pdfDoc;
                    $scope.pdfId = receipt.pdfId;
                    $scope.receiptName = receipt.name;
                    document.getElementById("page_num").value = ObjReplacement.PDFPageNumber;
                    $scope.PDFPageNumber = ObjReplacement.PDFPageNumber;

                    PDFJS.getDocument(pdfDoc).then(function (pdfDoc) {
                        $scope.$apply(function () {
                            $scope.pageCount = $scope.PDFPageCount;
                            $scope.PDFPageCount = pdfDoc.numPages;
                            $scope.PDFPageNumber = ObjReplacement.PDFPageNumber;
                        });
                        pdfDoc.getPage(ObjReplacement.PDFPageNumber).then(renderPage);
                        $scope.ShowPdfDetails = 'ShowDetails';
                    });
                    $scope.currentPDFUrl = pdfDoc;
                    $scope.pdfUrl = pdfDoc;
                    $scope.isRowClicked = true;
                    //clearPDFMapping();
                    drawItemBox(itemId, ObjReplacement);
                    angular.element(document.querySelector('.itemBorder')).removeClass("itemBorder");
                    var d = document.getElementById(itemId);
                    d.classList.add("itemBorder");
                    document.getElementById(itemId).style.width = "" + canvas.width + "px";
                    $scope.isShowPopup = false;
                    $scope.isPopupExists = false;
                    $scope.popupMessage = "Click to map item";
                    document.getElementById("pdf").style.cursor = "crosshair";
                }
            });
        });
    }

    //on table row click event highlight the existing mapped item on the pdf
    $scope.showMappedItemOnPDF = function (mapItemObj) {
        $scope.mapItem.itemId = null;
        var pdfPageNum = 0;
        //Here check if popup is open or not   && (mapItemObj.totalQuantityReplaced == mapItemObj.quantity)
        if (mapItemObj.replaceItems !== null && angular.isDefined(mapItemObj.replaceItems)) {
            if (mapItemObj.totalQuantityReplaced > 0 && !$scope.isShowPopup) {
                $scope.ShowPdfDetails = "ShowDetails";
                $scope.ShowPdfCoordinates(mapItemObj.replaceItems[0], mapItemObj.id, mapItemObj.itemNumber);
            }
            else {
                if ($scope.isShowPopup && (mapItemObj.totalQuantityReplaced == mapItemObj.quantity)) {
                    $scope.isShowPopup = false;
                    $scope.ShowPdfDetails = "ShowDetails";
                    $scope.ShowPdfCoordinates(mapItemObj.replaceItems[0], mapItemObj.id, mapItemObj.itemNumber);
                }
                else {
                    clearPDFMapping();
                    $scope.reloadPopupData(); $scope.command = "create";
                    $scope.mapItem.itemId = mapItemObj.id;
                    $scope.mapItem.itemNumber = mapItemObj.itemNumber;
                    $scope.RCVValue = mapItemObj.rcvTotal;
                    $scope.ACVValue = mapItemObj.acv;
                    $scope.getItemDetails();
                    $scope.calculateACVandRCVBasedOnQuantity($scope.ItemDetails.quantity);
                }
            }
        }
        else {
            //Need to do the stuff here
            if ($scope.isShowPopup) {
                clearPDFMapping();
                $scope.reloadPopupData(); $scope.command = "create";
                $scope.mapItem.itemId = mapItemObj.id;
                $scope.mapItem.itemNumber = mapItemObj.itemNumber
                //RM-17
                $scope.mapItem.itemApplyTax = mapItemObj.applyTax
                $scope.mapItem.itemSalesTax = !mapItemObj.applyTax ? 0.0 : mapItemObj.taxRate;

                $scope.RCVValue = mapItemObj.rcvTotal;
                $scope.ACVValue = mapItemObj.acv;

                $scope.mapItem.itemQuantity =mapItemObj.quantity;

                $scope.getItemDetails();

            }
            else {
                bootbox.alert({
                    title: "Alert",
                    message: "No receipt has been mapped yet for this item."
                });
                $scope.isPopupExists = false;
                clearPDFMapping();
                document.getElementById("pdf").style.cursor = "crosshair";
            }
        }
    }
    //load the pdf page as per the search
    $scope.loadSeletedPage = function (PDFPageNumber) {
        pdfDoc = $scope.currentPDFUrl;
        showPDFMappedItems($scope.pdfId, PDFPageNumber);
        PDFJS.getDocument(pdfDoc).then(function (pdfDoc) {
            pdfDoc.getPage(parseInt(PDFPageNumber)).then(renderPage);
        });
    }

    window.onbeforeunload = function () {
        if ($scope.isDataSaving) {
            return confirm("Do you really want to close?");
        }
        else {
            windowClose();
        }
    }

    //get item details before mapping
    $scope.getItemDetails = function () {
        $scope.ItemDetails = {};
        $scope.EditObject = {};

        $scope.itemId = $scope.mapItem.itemId;
        $scope.itemNumber = $scope.mapItem.itemNumber;
        if ($scope.isNullOrEmpty($scope.itemId) && !$scope.itemNumber) {
            bootbox.alert({
                title: "Alert",
                message: "Item Id should not be empty."
            });
            return;
        }
        else if (isNaN($scope.itemId) && !$scope.itemNumber) {
            bootbox.alert({
                title: "Alert",
                message: "Please enter numbers only."
            });
            return;
        }
        if ($scope.validateItem($scope.itemId, $scope.itemValue)) {
            //Check if the item has been alrady mapped
            if ($scope.itemsMappedArr.indexOf($scope.itemId) > -1 && (1 != 1)) {
                bootbox.alert({
                    title: "Alert",
                    message: "This item has been already mapped against calimed line items."
                });
                return;
            }
            $scope.isDataSaving = true;
            angular.forEach($scope.FilteredClaimedItemList, function (items) {
                //Add quantity, receipt value here
                if ($scope.itemId == items.claimItem.id || $scope.itemNumber == items.claimItem.itemNumber) {
                    if (items.claimItem.category !== null && angular.isDefined(items.claimItem.category)) {
                        getAggregateLimit(items.claimItem.category.id);
                    }

                    if (items.claimItem.rcv === null || angular.isUndefined(items.claimItem.rcv)) {
                        if (items.claimItem.rcv <= 0) {
                            $scope.reloadPopupData();
                            $scope.isShowPopup = false;
                            $scope.isPopupExists = false;
                            bootbox.alert({
                                title: "Alert",
                                message: "Cannot replace an item which has not been priced yet..."
                            });
                            document.getElementById("pdf").style.cursor = "crosshair";
                            return;
                        }
                    }
                    else {
                        $scope.ACVValue = items.claimItem.acv;
                        $scope.HoldoverValue = "";
                        $scope.RCVValue = items.claimItem.rcvTotal;
                        $scope.mapItem.itemValue = "";
                        //$scope.mapItem.itemQuantity = items.claimItem.quantity;
                        $scope.averageRCVQuantity = parseFloatWithFixedDecimal((1 * (parseFloat($scope.RCVValue) / parseFloat($scope.mapItem.itemQuantity))));
                        $scope.averageACVQuantity = parseFloatWithFixedDecimal((1 * (parseFloat($scope.ACVValue) / parseFloat($scope.mapItem.itemQuantity))));

                        var hold = 0;
                        hold = parseFloatWithFixedDecimal($scope.RCVValue - $scope.ACVValue);
                        $scope.HoldoverValue = ((hold > 0) ? hold : 0);
                        //Check if the value is Nan or not
                        if (isNaN($scope.HoldoverValue)) {
                            $scope.HoldoverValue = 0;
                        }
                        //Global Value for seleted Item for calculate ACV RCV in short this variable refers the original item from the list with all the details by sd 11 sept
                        $scope.ItemDetails = angular.copy(items.claimItem);
                        //end
                    }

                    //RM-17
                    $scope.mapItem.itemApplyTax = items.claimItem.applyTax
                    $scope.mapItem.itemSalesTax = !items.claimItem.applyTax ? 0.0 : items.claimItem.taxRate;
                }
            });


        }
        else {
            bootbox.alert({
                title: "Alert",
                message: "The item you are trying to map does not exist in the claimed items."
            });
            return;
        }
    }
    $scope.loadItemDetails = function (e) {
        clearPDFMapping();
        $scope.getItemDetails();
        $scope.calculateACVandRCVBasedOnQuantity($scope.ItemDetails.quantity);
    }

    $scope.reloadPopupData = function () {
        //clear the popup data if new/create mapping
        if ($scope.command == "create" || $scope.command == "edit") {
            $scope.mapItem.itemId = "";
            $scope.mapItem.itemValue = "";
            $scope.mapItem.itemQuantity = "";
            $scope.ACVValue = 0;
            $scope.RCVValue = 0;
            $scope.HoldoverValue = 0;

            $scope.mapItem.itemMCost = 0;
            $scope.mapItem.itemSalesTax = 0;
            $scope.mapItem.itemShipping = 0;
        }
        //reload already mapped item data if edit/view mapping  $scope.EditObject.id
        else {
            var curremntMapId = $scope.EditObject.id;
            angular.forEach($scope.ItemDetails.replaceItems, function (rpItem) {
                if (curremntMapId == rpItem.id) {
                    $scope.EditObject = rpItem;
                    $scope.ACVValue = $scope.EditObject.acv;
                    $scope.RCVValue = $scope.EditObject.rcv;
                    $scope.HoldoverValue = $scope.EditObject.holdOver;
                    $scope.mapItem.itemValue = $scope.EditObject.receiptValue;
                    $scope.mapItem.itemQuantity = $scope.EditObject.quantity;

                    $scope.mapItem.itemMCost = $scope.EditObject.materialCost;
                    $scope.mapItem.itemSalesTax = $scope.EditObject.salesTax;
                    $scope.mapItem.itemShipping = $scope.EditObject.shipping;
                }
            });
        }
    }
    $scope.deleteMapping = function () {
        bootbox.confirm({
            size: "",
            title: $translate.instant('Confirm.DeleteItemTitle'),
            message: $translate.instant('Confirm.DeleteItemMessage'), closeButton: false,
            className: "modalcustom", buttons: {
                confirm: {
                    label: $translate.instant('Confirm.BtnYes'),
                    className: 'btn-outline green   '
                },
                cancel: {
                    label: $translate.instant('Confirm.BtnNo'),
                    className: 'btn-outline red'
                }
            },
            callback: function (result) {
                if (result) {
                    //remove popup if new/create mapping
                    if ($scope.command == "create") {
                        //alert("hide and clear the popup");
                        document.getElementById("mapItem").style.display = "none";
                        $scope.isShowPopup = false;
                        $scope.isPopupExists = false;
                        $scope.popupMessage = "Click to map item";
                        document.getElementById("pdf").style.cursor = "crosshair";
                    }
                    //remove mapping from server if edit/view mapping
                    else {
                        $scope.itemId = $scope.mapItem.itemId;
                        var param = {
                            "id": $scope.EditObject.id,
                            "parentId": $scope.mapItem.itemId
                        };
                        var deleteMappedItem = ReceiptMapperService.deleteMappedLineItem(param);
                        deleteMappedItem.then(function (success) {
                            $scope.GetItemList();
                            toastr.remove();
                            toastr.success(success.data.message, "Confirmation");
                            $scope.isDataSaving = false;
                            document.getElementById("mapItem").style.display = "none";
                            $scope.isShowPopup = false;
                            $scope.isPopupExists = false;
                            $scope.popupMessage = "Click to map item";
                            document.getElementById("pdf").style.cursor = "crosshair";
                            document.getElementById($scope.itemId).remove();
                            document.getElementById("row_" + $scope.itemId).classList.remove("rowmapped");
                        }, function (error) {
                            toastr.remove();
                            toastr.error(error.data.errorMessage, "Error");
                        });
                    }
                }
            }
        });
    }

    $scope.closeMapping = closeMapping;
    function closeMapping() {
        document.getElementById("mapItem").style.display = "none";
        $scope.isShowPopup = false;
        $scope.isPopupExists = false;
        $scope.reloadPopupData();
        $scope.popupMessage = "Click to map item";
        document.getElementById("pdf").style.cursor = "crosshair";
    }

    $scope.ZoomIn = true;
    $scope.ZoomOut = false;
    $scope.ZoomPdfSection = ZoomPdfSection;
    function ZoomPdfSection() {
        $scope.ZoomIn = false;
        $scope.ZoomOut = true;
        var PdfDiv = angular.element(document.querySelector('#PdfViewerDiv'));
        angular.element(PdfDiv[0]).css('width', '70%');
        var ItemDIv = angular.element(document.querySelector('#ItemDiv'));
        angular.element(ItemDIv[0]).css('width', '30%');

        var Table = angular.element(document.querySelector('#ScrollableTable'));
        //angular.element(Table[0]).css('margin-top', '20%');
    }
    $scope.ZoomOutPdfSection = ZoomOutPdfSection;
    function ZoomOutPdfSection() {
        $scope.ZoomIn = true;
        $scope.ZoomOut = false;
        var PdfDiv = angular.element(document.querySelector('#PdfViewerDiv'));
        angular.element(PdfDiv[0]).css('width', '38%');
        var ItemDIv = angular.element(document.querySelector('#ItemDiv'));
        angular.element(ItemDIv[0]).css('width', '62%');
        var Table = angular.element(document.querySelector('#ScrollableTable'));
        angular.element(Table[0]).css('margin-top', '0%');
    }

    //Newly added by sd dated 09/06/2017
    //Show file
    $scope.showReceipt = showReceipt;
    function showReceipt(itemFile) {
        $(".page-spinner-bar").removeClass("hide");
        clearPDFMapping();
        $scope.pdfUrl = null; $scope.currentPDFUrl = null; $scope.pdfId = null; $scope.receiptName = null; $scope.PDFPageNumber = 1
        $scope.pdfUrl = ReceiptMapperService.getReceiptPath(itemFile.url);
        $scope.pdfId = itemFile.pdfId;
        $scope.receiptName = itemFile.name;
        $scope.getMappedItemsList($scope.CommonObj.ClaimId);
        $scope.currentPDFUrl = $scope.pdfUrl;
        $scope.ShowPdfDetails = "ShowDetails";
        showPDFMappedItems($scope.pdfId, 1);
    };

    function GetReceiptToShowMappedItem() {
        $scope.ReceiptListMappedItem = {
            pdfList: []
        };
        if ($scope.ReceiptList != null) {
            angular.forEach($scope.ReceiptList, function (dateWiseReceipts) {
                angular.forEach(dateWiseReceipts.pdfList, function (pdf) {
                    $scope.ReceiptListMappedItem.pdfList.push(pdf);
                });
            });
        }
        // var param = {
        //     "claimId": $scope.CommonObj.ClaimId
        // };
        // var receiptsList = ReceiptMapperService.getReceiptsList(param);
        // receiptsList.then(function (success) {
        //     $scope.ReceiptListMappedItem = success.data.data;
        //     $(".page-spinner-bar").addClass("hide");
        // }, function (error) {
        //     $(".page-spinner-bar").addClass("hide");
        // });
    }

    /**
     * Calculating RCV and ACV average Based Replace quatity
     */
    $scope.averageRCVQuantity = 0.0;
    $scope.averageACVQuantity = 0.0;
    var originalQuantity = null;
    $scope.calculateACVandRCVBasedOnQuantity = calculateACVandRCVBasedOnQuantity;
    function calculateACVandRCVBasedOnQuantity(replacedQuantity) {
        replacedQuantity = parseInt(replacedQuantity);
        var totalRCV = parseFloat($scope.ItemDetails.rcvTotal);
        var totalACV = parseFloat($scope.ItemDetails.acv);
        $scope.averageRCVQuantity = parseFloatWithFixedDecimal((1 * (totalRCV / $scope.ItemDetails.quantity)));
        $scope.averageACVQuantity = parseFloatWithFixedDecimal((1 * (totalACV / $scope.ItemDetails.quantity)));
        if ($scope.ItemDetails.replaceItems === null) {
            originalQuantity = $scope.ItemDetails.quantity;
            $scope.averageRCVQuantity = $scope.averageRCVQuantity * replacedQuantity;
            $scope.averageACVQuantity = $scope.averageACVQuantity * replacedQuantity;
        } else {
            var editFlg = false;
            var qty = 0;
            angular.forEach($scope.ItemDetails.replaceItems, function (item) {
                if (item.id == $scope.EditObject.id) {
                    qty += replacedQuantity;
                    editFlg = true;
                } else {
                    qty += item.quantity;
                }
            });

            if (editFlg) {
                if (qty <= $scope.ItemDetails.quantity) {
                    originalQuantity = replacedQuantity;

                    if (originalQuantity == 0) {
                        bootbox.alert({
                            title: "Alert",
                            message: "Quantity should not be zero"
                        });
                        return;
                    }
                } else {
                    var pendingQnty = $scope.ItemDetails.quantity - (qty - replacedQuantity);
                    pendingQnty  = Number.isNaN(pendingQnty) ? 0 : pendingQnty;
                    $scope.mapItem.itemQuantity = null;
                    bootbox.alert({
                        title: "Alert",
                        message: "Replaced Item Quantity should not be greater than available quantity(" + pendingQnty + ")."
                    });
                    return;
                }
            } else {
                originalQuantity = $scope.ItemDetails.quantity - qty;
                if (originalQuantity < replacedQuantity) {
                    $scope.mapItem.itemQuantity = originalQuantity;
                }
                replacedQuantity = originalQuantity;
            }

            if (originalQuantity == 0) {
                document.getElementById("mapItem").style.display = "none";
                $scope.closeMapping();
                bootbox.alert({
                    title: "Alert",
                    message: "All quantity of the item #" + $scope.ItemDetails.itemNumber + " got replaced. Item can't be mapped!"
                });
                return;
            } else if (originalQuantity < replacedQuantity) {
                bootbox.alert({
                    title: "Alert",
                    message: "Replaced Item Quantity should not be greater than available quantity(" + $scope.ItemDetails.quantity + ")."
                });
                return;
            } else {
                $scope.averageRCVQuantity = $scope.averageRCVQuantity * replacedQuantity;
                $scope.averageACVQuantity = $scope.averageACVQuantity * replacedQuantity;
            }

            // if(replacedQuantity == $scope.ItemDetails.quantity ||
            //     replacedQuantity < $scope.ItemDetails.quantity){
            //     originalQuantity = replacedQuantity
            // }else{
            //     originalQuantity = $scope.ItemDetails.quantity - qty;
            // }

            // if (originalQuantity < replacedQuantity) {
            //     replacedQuantity = originalQuantity;
            //     $scope.averageRCVQuantity = $scope.averageRCVQuantity * replacedQuantity;
            //     $scope.averageACVQuantity = $scope.averageACVQuantity * replacedQuantity;
            // } else {
            //     $scope.averageRCVQuantity = $scope.averageRCVQuantity * replacedQuantity;
            //     $scope.averageACVQuantity = $scope.averageACVQuantity * replacedQuantity;
            // }

        }
    }

    //Calculate RCV
    $scope.CalculateRCVForReplacedItem = function () {
        // Calculate MaterialCost, SalesTax and Shipping for item
        $scope.mapItem.itemMCost = parseFloat(($scope.mapItem.itemMCost != null && $scope.mapItem.itemMCost != "") ? $scope.mapItem.itemMCost : 0);
        $scope.mapItem.itemSalesTax = parseFloat(($scope.mapItem.itemSalesTax != null && $scope.mapItem.itemSalesTax != "") ? $scope.mapItem.itemSalesTax : 0);
        $scope.mapItem.itemShipping = parseFloat(($scope.mapItem.itemShipping != null && $scope.mapItem.itemShipping != "") ? $scope.mapItem.itemShipping : 0);

        var salesTaxVal = parseFloatWithFixedDecimal($scope.mapItem.itemSalesTax * $scope.mapItem.itemMCost / 100);
        //Receipt value
        $scope.mapItem.itemValue = parseFloatWithFixedDecimal($scope.mapItem.itemMCost + salesTaxVal + $scope.mapItem.itemShipping);

        //Reset RCV according to use cases
        if ($scope.mapItem.itemValue && ($scope.mapItem.itemQuantity && $scope.mapItem.itemQuantity > 0)) {
            if ($scope.mapItem.itemValue > 0 && $scope.mapItem.itemQuantity > 0) {
                var ItemReceiptvalue = 0;
                if ($scope.command == "edit") {
                    $scope.ItemDetails.receiptValue = parseFloat($scope.ItemDetails.receiptValue) > 0 ? parseFloat($scope.ItemDetails.receiptValue) : 0;
                    $scope.EditObject.receiptValue = parseFloat($scope.EditObject.receiptValue) > 0 ? parseFloat($scope.EditObject.receiptValue) : 0;
                    ItemReceiptvalue = $scope.ItemDetails.receiptValue - $scope.EditObject.receiptValue;
                }
                else {
                    ItemReceiptvalue = $scope.ItemDetails.receiptValue ? parseFloat($scope.ItemDetails.receiptValue) : 0;
                }

                // if($scope.ItemDetails.replaceItems === null) {


                $scope.RCVValue = $scope.averageRCVQuantity > 0 ? $scope.averageRCVQuantity : 0;
                $scope.ACVValue = $scope.averageACVQuantity > 0 ? $scope.averageACVQuantity : 0;
                // $scope.mapItem.itemQuantity

                /*
                var avgRcptValue = $scope.mapItem.itemValue;
                if (avgRcptValue < $scope.RCVValue)
                    $scope.RCVValue = avgRcptValue;
                */

                $scope.RCVValue = $scope.mapItem.itemValue;


                // }else {
                //     angular.forEach($scope.ItemDetails.replaceItems, function(item) {
                //         console.log('Item', item);
                //     })
                // }

                //Case 1 : Receipt value < RCV
                // if (($scope.mapItem.itemValue + ItemReceiptvalue) <= $scope.ItemDetails.rcv) {
                //     $scope.RCVValue = ($scope.mapItem.itemValue);
                // }

                // if (($scope.mapItem.itemValue + ItemReceiptvalue) <= $scope.ItemDetails.rcvTotal) {
                //     $scope.RCVValue = ($scope.mapItem.itemValue);
                // }

                //Case 2 : Receipt value > RCV
                // else if (($scope.mapItem.itemValue + ItemReceiptvalue) > $scope.ItemDetails.rcv) {
                //     $scope.RCVValue = $scope.ItemDetails.rcv - (ItemReceiptvalue);
                // }
                // else if (($scope.mapItem.itemValue + ItemReceiptvalue) > $scope.ItemDetails.rcvTotal) {
                //     $scope.RCVValue = $scope.ItemDetails.rcvTotal - (ItemReceiptvalue);
                // }
                //Case 3 : Replacement value < RCV but the group total exceeds group limits
                //RCV (for engagement ring) = (group limit) - (cost of individual items already replaced) = $20,000 - $12,500 = $7,500
                // if ($scope.ItemDetails.category !== null) {
                //     if ($scope.ItemDetails.category.aggregateLimit !== null && $scope.ItemDetails.category.aggregateLimit >> 0) {
                //         if (($scope.RCVValue + $scope.AggregateLimitValueDetails.TotalRCVValues) > $scope.ItemDetails.category.aggregateLimit) {
                //             if ($scope.AggregateLimitValueDetails.TotalRCVValues > 0)
                //                 $scope.RCVValue = ($scope.AggregateLimitValueDetails.TotalRCVValues) - $scope.ItemDetails.category.aggregateLimit;
                //             else
                //                 $scope.RCVValue = ($scope.mapItem.itemValue) - $scope.ItemDetails.category.aggregateLimit;
                //             toastr.remove();
                //             toastr.warning("Your Aggregate Category Limits Exceeded.", "Warning");
                //         }
                //     }
                // }

                //End Calculating RCV

                //Calculating ACV
                //Get age of item

                // var age = 0;
                // if ($scope.ItemDetails.ageMonths !== null && angular.isDefined($scope.ItemDetails.ageMonths) && $scope.ItemDetails.ageMonths > 0) {
                //     if ($scope.ItemDetails.ageYears !== null && angular.isDefined($scope.ItemDetails.ageYears) && $scope.ItemDetails.ageYears !== "")
                //         age = parseFloat($scope.ItemDetails.ageYears) + (parseFloat($scope.ItemDetails.ageMonths) / 12);
                //     else
                //         age = Math.ceil(parseFloat($scope.ItemDetails.ageMonths) / 12);
                // }
                // else {
                //     if ($scope.ItemDetails.ageYears !== null && angular.isDefined($scope.ItemDetails.ageYears))
                //         age = parseFloat($scope.ItemDetails.ageYears);
                //     else
                //         age = 0;
                // }

                //As per the sameer discussion the code is hidden on the 17 April 2018
                ////frequency is always 12  by sameer
                //var frequency = parseFloat(12);
                ////Get Depereciation rate and calculate depreciation
                //var Depereciation = 0;
                //if ($scope.ItemDetails.depriciationRate !== null && angular.isDefined($scope.ItemDetails.depriciationRate) && $scope.ItemDetails.depriciationRate > 0)
                //    Depereciation = $scope.ItemDetails.depriciationRate;
                //else
                //    Depereciation = 0;
                //if ((Depereciation > 0) && (age > 0)) {
                //    var DepereciationAmount = parseFloat($scope.RCVValue) * (Math.pow((1 + (parseFloat(Depereciation) / (100 * frequency))), (frequency * age)));
                //    $scope.ACVValue = (parseFloat($scope.RCVValue) - (DepereciationAmount - parseFloat($scope.RCVValue))).toFixed(2);
                //}
                //else {
                //    $scope.ACVValue = $scope.RCVValue;
                //}
                //End Calculating ACV

                // var usefulYears = 0.0;
                // var EL = 0.0; var CA = 0.0; var depreciationPercent = 0.0;

                // if ($scope.ItemDetails.subCategory != null && angular.isDefined($scope.ItemDetails.subCategory)) {
                //     if ($scope.ItemDetails.subCategory.annualDepreciation != null && angular.isDefined($scope.ItemDetails.subCategory.annualDepreciation)) {
                //         depreciationPercent = parseFloat(age * ($scope.ItemDetails.subCategory.annualDepreciation / 100));
                //     }
                //     else
                //         depreciationPercent = parseFloat(age * (10 / 100));
                // }

                // if ($scope.ItemDetails.subCategory != null && angular.isUndefined($scope.ItemDetails.subCategory)) {
                //     if ($scope.ItemDetails.subCategory.usefulYears == null || angular.isUndefined($scope.ItemDetails.subCategory.usefulYears)) {
                //         if ($scope.ItemDetails.depriciationRate != null && angular.isUndefined($scope.ItemDetails.depriciationRate)) {
                //             usefulYears = parseFloat(100 / $scope.ItemDetails.depriciationRate)
                //         }
                //     } else {
                //         usefulYears = $scope.ItemDetails.subCategory.usefulYears;
                //     }
                // }
                // else {
                //     if ($scope.ItemDetails.depriciationRate != null && angular.isUndefined($scope.ItemDetails.depriciationRate)) {
                //         usefulYears = parseFloat(100 / $scope.ItemDetails.depriciationRate)
                //     } else {
                //         //set useful year here if the item usefull year is not mention in the database
                //         usefulYears = 10;
                //     }
                // }
                // EL = (usefulYears = null ? 0 : usefulYears);
                // CA = parseFloat(age);

                // EL = (depreciationPercent = null ? 0 : depreciationPercent);
                // CA = parseFloat(age);
                // //$scope.ACVValue = parseFloat($scope.RCVValue) - ((parseFloat(CA) / parseFloat(EL)) * parseFloat($scope.RCVValue)).toFixed(2);
                // $scope.ACVValue = parseFloat($scope.RCVValue) - (parseFloat($scope.RCVValue) * parseFloat(EL)).toFixed(2);

                /*
                Get current selected items details
                Calculate the Max. Replacement exposure for replaced quantity
                Max. Replacement Exposure / quantity replaced
                */
                let replacementExposureBreakDown = parseFloatWithFixedDecimal($scope.ItemDetails.replacementExposure / $scope.ItemDetails.quantity);
                let cashPaidBreakDown = parseFloatWithFixedDecimal($scope.ItemDetails.cashPaid / $scope.ItemDetails.quantity);

                /*The Holdover Due value of the map item must be calculated as :
                 If(Receipt Value > Replacement Exposure)
                 then
                 Holdover Due = Replacement Exposure - Cash Paid
                 else
                 Holdover Due= Receipt Value - Cash Paid
                 */
                $scope.replacementExposureMapItems = replacementExposureBreakDown * $scope.mapItem.itemQuantity;
                $scope.cashPaidForMapItems = cashPaidBreakDown * $scope.mapItem.itemQuantity;
                //Hold over for item
                var hold = 0;
                if ($scope.mapItem.itemValue > $scope.replacementExposureMapItems) {
                    hold = parseFloatWithFixedDecimal($scope.replacementExposureMapItems - $scope.cashPaidForMapItems);
                } else {
                    hold = parseFloatWithFixedDecimal($scope.mapItem.itemValue - $scope.cashPaidForMapItems);
                }
                $scope.HoldoverValue = ((hold > 0) ? hold : 0);
                //Check if the value is Nan or not
                if (isNaN($scope.HoldoverValue)) {
                    $scope.HoldoverValue = 0;
                }
            }
        }
    }
    //get labels
    $scope.GetModalLabels = GetModalLabels;
    function GetModalLabels(PdfId) {
        var PDFId =
        {
            "pdfId": PdfId
        }
        var getLabel = ReceiptMapperService.Getlabel(PDFId);
        getLabel.then(function (success) {
            return ((success.data != nul) ? success.data.data : []);
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
            var arrr = [];
            return (arr);
        });

    }
    // Add lebels
    $scope.ModalLabels = function (PDFId) {
        $scope.animationsEnabled = true;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/Adjuster/ReceiptMapperLabel.html",
                controller: "ReceiptMapperLabelController",
                resolve:
                {
                    PDFID: function () {
                        return PDFId;
                    }
                }

            });
        out.result.then(function (value) {
            $scope.getReceiptsList($scope.CommonObj.ClaimId);
        }, function () {

        });
        return {
            open: open
        };
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = (function () {
            return window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback, element) {
                    window.setTimeout(callback, 1000 / 60);
                };
        })();
    }

    $scope.refreshPage = refreshPage;
    function refreshPage() {
        GetItemList();
        //Get list of pdf if available
        $scope.getReceiptsList($scope.CommonObj.ClaimId);
        GetReceiptToShowMappedItem();
        $scope.ShowPdfDetails = 'ShowList';
    }

    $scope.limitQuantity = function (e) {
        var value = e.target.value + String.fromCharCode(e.which);
        var remainingItems = 0;
        if ($scope.ItemDetails.replaceItems === null) {
            remainingItems = $scope.ItemDetails.quantity;
        }
        angular.forEach($scope.ItemDetails.replaceItems, function (item) {
            remainingItems = $scope.ItemDetails.quantity - item.quantity;
        });
        if (value && Number(value) > remainingItems) {
            e.preventDefault();
        }
    };


    $scope.holdoverCheck = holdoverCheck;
    function holdoverCheck() {
        $scope.TotalHoldover = parseFloatWithFixedDecimal($scope.TotalHoldover);
        $scope.count = 0;
        var dueAmmount = 0;
        angular.forEach($scope.FilteredClaimedItemList, function (item) {
            if (item.claimItem.status && item.claimItem.status.status && (item.claimItem.status.status == 'REPLACED' || item.claimItem.status.status == 'PARTIAL REPLACED') && item.claimItem.Selected) {
                $scope.count++;
                if (item.claimItem.holdOverDue)
                    dueAmmount = dueAmmount + item.claimItem.holdOverDue
            }
        })
        if (dueAmmount == 0 && $scope.count == 0) {
            bootbox.alert({
                message: "<b><center>Holdover Details</center></b><br/>Paying a sum of Holdover for all items should be greater than $0.00",
                size: 'small'
            });
            return false;
        }
        // $scope.FilteredClaimedItemList

        if (dueAmmount == 0) {
            bootbox.alert({
                message: "Due amount is $0.00",
                size: 'small'
            });
            return false;
        }

        if (dueAmmount) {
            bootbox.confirm({
                size: 'small',
                //closeButton: false,
                // Paying a sum of $6,798.00 (ACV) for 20 items
                message: "<b><center>Holdover Details</center></b><br/>Paying a sum of Holdover for all items is " + $filter('currency')(dueAmmount) + "<br/><br/>Check #<span class='text-danger'>*</span>&nbsp;&nbsp;&nbsp;&nbsp;<input type='text' id='checkNumber'>" +
                    "<span class='text-danger' id='checkError' hidden>Please Enter Check number</span>",
                closeButton: true,
                buttons: {
                    confirm: {
                        label: "Submit",
                        className: "submitCheckDetails"
                    },
                    cancel: {
                        label: "Cancel" //$translate.instant('ClaimDetails_Delete.BtnNo'),
                    }
                },
                callback: function (result) {
                    if (result) {
                        $(".page-spinner-bar").removeClass("hide");
                        if (!$.trim($('#checkNumber').val()) || $.trim($('#checkNumber').val()) == "") {
                            $(".page-spinner-bar").addClass("hide");
                            $('#checkError').show();
                            $("#checkNumber").focus();
                            return false;
                        }
                        $('#checkError').hide();
                        var claimItem = [];
                        angular.forEach($scope.FilteredClaimedItemList, function (item) {
                            if (item.claimItem.status && item.claimItem.status.status && (item.claimItem.status.status == 'REPLACED' || item.claimItem.status.status == 'PARTIAL REPLACED') && item.claimItem.Selected) {
                                item.claimItem.isPaid = false;

                                if (item.claimItem.holdOverDue && item.claimItem.holdOverDue > 0) {
                                    item.claimItem.holdOverPaymentPaidAmount = item.claimItem.holdOverDue
                                    item.claimItem.holdOverDue = 0.00;
                                    //item.claimItem.cashPaid = item.claimItem.cashPaid + item.claimItem.holdOverPaymentPaidAmount
                                }
                                //$scope.count++;

                                claimItem.push(item.claimItem);
                            }
                        })
                        var param = {
                            "checkNumber": $('#checkNumber').val(),
                            "ammount": dueAmmount,
                            "claimLineItemDetails": claimItem,
                            "registrationNumber": sessionStorage.getItem("jewelryVendor") ? sessionStorage.getItem("jewelryVendor") : sessionStorage.getItem("speedCheckVendor"),
                            "holdoverCheck": true,
                            "paidBy":sessionStorage.getItem("UserId")
                        }
                        var getpromise = AdjusterPropertyClaimDetailsService.updatePostLostItemsStatusPaid(param);
                        getpromise.then(function (success) {
                            if (success.data.data != null) {
                                prepareItemsDatatable(success.data.data);
                            }
                            toastr.remove();
                            toastr.success("Successfully submitted request", $translate.instant("SuccessHeading"));
                            // Cancel();
                            $(".page-spinner-bar").addClass("hide");

                        }, function (error) {
                            $(".page-spinner-bar").addClass("hide");
                            $scope.ErrorMessage = error.data.errorMessage;
                        });


                    }
                }
            });
        }
        else if ($scope.count > 0) {
            var claimItem = [];

            angular.forEach($scope.FilteredClaimedItemList, function (item) {
                if (item.claimItem.status && item.claimItem.status.status && item.claimItem.status.status == 'REPLACED') {
                    item.claimItem.isPaid = false;
                    if (item.claimItem.holdOverDue && item.claimItem.holdOverDue > 0) {
                        item.claimItem.holdOverPaymentPaidAmount = item.claimItem.holdOverDue
                        item.claimItem.holdOverDue = 0.00;
                    }
                    claimItem.push(item.claimItem);

                }
            })
            var param = {

                "ammount": $scope.TotalHoldover,
                "claimLineItemDetails": claimItem,
                "registrationNumber": sessionStorage.getItem("jewelryVendor") ? sessionStorage.getItem("jewelryVendor") : sessionStorage.getItem("speedCheckVendor"),
                "holdoverCheck": false
            }
            var getpromise = AdjusterPropertyClaimDetailsService.updatePostLostItemsStatusPaid(param);
            getpromise.then(function (success) {
                if (success.data.data != null) {
                    prepareItemsDatatable(success.data.data);
                }
                toastr.remove();
                toastr.success("Successfully submitted request", $translate.instant("SuccessHeading"));

            }, function (error) {
                $(".page-spinner-bar").addClass("hide");
                $scope.ErrorMessage = error.data.errorMessage;
            });

        }
    }

    $scope.filterItemsInReceiptMapper = function (searchKey) {
        $scope.FilteredClaimedItemList = angular.copy($scope.ClaimedItemList);
        if (searchKey != null && searchKey != '') {
            $scope.FilteredClaimedItemList = $filter('filter')($scope.FilteredClaimedItemList, function (item) {
                return (item.claimItem.itemNumber == searchKey ||
                    angular.lowercase(item.claimItem.description).includes(angular.lowercase(searchKey)) ||
                    (item.claimItem.category && item.claimItem.category.name && angular.lowercase(item.claimItem.category.name).includes(angular.lowercase(searchKey))) ||
                    (item.claimItem.subCategory && item.claimItem.subCategory.name ? angular.lowercase(item.claimItem.subCategory.name).includes(angular.lowercase(searchKey)) : false)
                );
            });
        }
    }
    $scope.setDetails = function (holdoverPaidItems) {
        //$scope.FilteredClaimedItemList = param ? param : [];
        //$scope.ClaimedItemList = param;
        $scope.totalCount = $scope.FilteredClaimedItemList ? $scope.FilteredClaimedItemList.length : 0;

        //Calculate total for columns ACV, RCV and Holdover
        $scope.TotalACV = 0.0;
        $scope.TotalCost = 0.0;
        $scope.TotalHoldover = 0.0;
        $scope.totalSettlement = 0.0;
        $scope.totalRCV = 0;
        $scope.TotalReceiptVal = 0;
        $scope.TotalStatedAmt = 0;
        $scope.TotalDepreciationAmt = 0;

        $scope.totalCashPaid = 0.0;
        $scope.TotalHoldoverDue = 0.0;
        $scope.TotalHoldoverPaid = 0.0;
        $scope.TotalQuantityToReplace = 0;
        $scope.TotalQuantityReplaced = 0;

        angular.forEach($scope.FilteredClaimedItemList, function (items, index) {
            angular.forEach(holdoverPaidItems, function (paidItem) {
                if (paidItem.id === items.claimItem.id) {
                    items.claimItem = angular.copy(paidItem);
                }
            });
            $scope.TotalACV += items.claimItem.acv;
            $scope.totalRCV += items.claimItem.rcvTotal;
            $scope.TotalReceiptVal += items.claimItem.receiptValue;
            $scope.TotalStatedAmt += items.claimItem.totalStatedAmount;
            $scope.TotalDepreciationAmt += items.claimItem.depreciationAmount ? items.claimItem.depreciationAmount : 0.0;

            $scope.TotalQuantityToReplace += items.claimItem.quantity;
            $scope.TotalQuantityReplaced += items.claimItem.totalQuantityReplaced;

            items.subTotalQty = 0;
            items.subTotalReceiptValue = 0;
            items.subTotalRCV = 0;
            items.subTotalACV = 0;
            items.subTotalHoldOver = 0;

            angular.forEach(items.claimItem.replaceItems, function (receiptItem) {
                items.subTotalQty += receiptItem.quantity
                items.subTotalReceiptValue += receiptItem.receiptValue;
                items.subTotalRCV += receiptItem.rcv;
                items.subTotalACV += receiptItem.acv;
                items.subTotalHoldOver += receiptItem.holdOver;
            });
            items.claimItem.holdOverValue = items.subTotalRCV - items.claimItem.acv;
            if (items.claimItem.holdOverValue < 0) {
                if (items.subTotalHoldOver > 0) {
                    items.claimItem.holdOverValue = items.subTotalHoldOver;
                    $scope.TotalHoldover += items.claimItem.holdOverValue;
                } else {
                    items.claimItem.holdOverValue = 0;
                }
            } else {
                $scope.TotalHoldover += items.claimItem.holdOverValue;
            }

            $scope.TotalCost += items.subTotalRCV;

            // items.claimItem.quantity === items.claimItem.totalQuantityReplaced
            items.totalSettlement = items.claimItem.receiptValue < items.claimItem.rcvTotal ? items.claimItem.acv : (items.claimItem.acv + items.claimItem.holdOverValue);
            $scope.totalSettlement += parseFloatWithFixedDecimal(items.totalSettlement);

            $scope.totalCashPaid += (items.claimItem.cashPaid != null ? parseFloatWithFixedDecimal(items.claimItem.cashPaid) : 0);
            $scope.TotalHoldoverDue += (items.claimItem.holdOverDue != null ? parseFloatWithFixedDecimal(items.claimItem.holdOverDue) : 0);
            $scope.TotalHoldoverPaid += (items.claimItem.holdOverPaymentPaidAmount != null ? parseFloatWithFixedDecimal(items.claimItem.holdOverPaymentPaidAmount) : 0);
            $scope.payHoldOver = false;
            $scope.selectedAll = false;

        });
    }

    $scope.SelectPostLostItem = function (param) {
        // if(param.status && param.status.status == 'REPLACED'){
        // param.Selected =true;
        // }
        // else{
        //     param.Selected = false;
        // }
        var cnt = 0;
        var totalcnt = 0;
        angular.forEach($scope.FilteredClaimedItemList, function (item) {
            if (item.claimItem.status && (item.claimItem.status.status == 'REPLACED' || item.claimItem.status.status == 'PARTIAL REPLACED')) {
                if (item.claimItem.Selected)
                    cnt++;
                totalcnt++;
            }
        })
        $scope.selectedAll = cnt == totalcnt;
        $scope.payHoldOver = cnt > 0;
    }
    $scope.checkAll = function () {
        var cnt = 0;
        angular.forEach($scope.FilteredClaimedItemList, function (item) {
            if (item.claimItem.status && (item.claimItem.status.status == 'REPLACED' || item.claimItem.status.status == 'PARTIAL REPLACED')) {
                item.claimItem.Selected = $scope.selectedAll;
                if ($scope.selectedAll)
                    cnt++;
            }
            else {
                item.claimItem.Selected = false;
            }
        })
        $scope.payHoldOver = cnt > 0;
    }

    $scope.CreatePDF = CreatePDF;
    function CreatePDF() {
        ////Get the HTML of div
        //var divElements = document.getElementById('PrintableDiv').innerHTML;
        ////Get the HTML of whole page
        //var oldPage = document.body.innerHTML;

        ////Reset the page's HTML with div's HTML only
        //document.body.innerHTML =
        //  "<html><head><title></title></head><body>" +
        //  divElements + "</body>";
        ////Print Page
        //window.print();
        ////Restore orignal HTML
        //document.body.innerHTML = oldPage;
        var pdfTitle = $scope.QuoteDetails.quoteNumber;

        var printContents = document.getElementById('PrintableDiv').innerHTML;
        var popupWin = window.open('', '_blank', 'width=300,height=300');
        popupWin.document.open();
        popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /><title>' + pdfTitle + '</title></head><body onload="window.print()">' + printContents + '</body></html>');
        popupWin.document.close();
    }

    $scope.exportSummaryToPDF = exportSummaryToPDF;
    function exportSummaryToPDF() {
        var param = {
            "claimNumber": $scope.CommonObj.ClaimNumber,
            "reqForReceiptMapper": true,
            "reqForPdfExport" : true,
            "reqForPayoutSummary" : true,
            "reqForRoomWiseItems" : true,
            "reqForCoverageSummary" : true
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
                linkElement.setAttribute("download", "SettlementSummary-"+$scope.CommonObj.ClaimNumber);
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

    $scope.handleCheckbx = handleCheckbx;
    function handleCheckbx(){
       var elements= document.getElementsByClassName("status_check");
       $scope.filterStatus = [];
    angular.forEach(elements,function(ele){
    
            if(ele.checked)
            {
                $scope.filterStatus.push(ele.value);
            }
    });
    console.log($scope.filterStatus)
  }

  $scope.handleCancelbx = handleCancelbx;
  function handleCancelbx(flag){
      if(flag ==='status')
      $scope.displaystatusfiltr = !$scope.displaystatusfiltr;
      if(flag ==='paid')
      $scope.displaypaidfiltr = !$scope.displaypaidfiltr;
      if(flag ==='due')
      $scope.displayduefiltr = !$scope.displayduefiltr;
  }

  $scope.Filter = Filter;
  function Filter(flag){
    
    $scope.FilteredClaimedItemList = $scope.MasterFilteredClaimedItemList.filter(item=>
        $scope.filterStatus.includes(item.claimItem.status.status) &&
        $scope.filterHoldOvrDue.includes(item.claimItem.holdOverDue==null || item.claimItem.holdOverDue<= 0 ? "$0.00" : "Others") &&
        $scope.filterHoldOvrPaid.includes(item.claimItem.holdOverPaymentPaidAmount==null || item.claimItem.holdOverPaymentPaidAmount<= 0 ? "$0.00" : "Others")
            );
      
    $scope.handleCancelbx(flag);
    prepareItemsDatatable($scope.FilteredClaimedItemList);
  }

  handleCheck = function(event)
  {
    var checked = event.target.checked;
    var value = event.target.value;
    if( checked && !$scope.filterStatus.includes(value))
    {
        $scope.filterStatus.push(value);
    }
    else if(!checked && $scope.filterStatus.includes(value))
    {
        $scope.filterStatus =$scope.filterStatus.filter((status)=> status!==value)
    }     
    console.log($scope.filterStatus)
    if($scope.filterStatus.length!==$scope.uniqueStatus.length)
    {
        var elements = document.getElementsByClassName('selectall');
        angular.forEach(elements,(ele)=>ele.checked= false);
    }
    else
    {
        var elements = document.getElementsByClassName('selectall');
        angular.forEach(elements,(ele)=>ele.checked= true);
    }
  }

  selectAll = function(event) {
      if(event.target.checked)
      {
        $scope.uniqueStatus.forEach(value => {
        handleCheck({target: {value, checked:true}})
      })
      var elements = document.getElementsByClassName('status_check');
        angular.forEach(elements,(ele)=>{ ele.checked=true;})
    }
    else
    {
        $scope.uniqueStatus.forEach(value => {
            handleCheck({target: {value, checked:false}})
        })
        var elements = document.getElementsByClassName('status_check');
            angular.forEach(elements,(ele)=>{ ele.checked=false;})
   }
  }

  handleCheckHoldOvrDue = function(event)
  {
    var checked = event.target.checked;
    var value = event.target.value;
    if( checked && !$scope.filterHoldOvrDue.includes(value))
    {
        $scope.filterHoldOvrDue.push(value);
    }
    else if(!checked && $scope.filterHoldOvrDue.includes(value))
    {
        $scope.filterHoldOvrDue =$scope.filterHoldOvrDue.filter((due)=> due!==value)
    }     
    if($scope.filterHoldOvrDue.length!==$scope.uniqueHoldOvrDue.length)
    {
        var elements = document.getElementsByClassName('selectalldue');
        angular.forEach(elements,(ele)=>ele.checked= false);
    }
    else
    {
        var elements = document.getElementsByClassName('selectalldue');
        angular.forEach(elements,(ele)=>ele.checked= true);
    }
  }

  selectAllDue = function(event) {
      if(event.target.checked)
      {
        $scope.uniqueHoldOvrDue.forEach(value => {
        handleCheckHoldOvrDue({target: {value, checked:true}})
      })
      var elements = document.getElementsByClassName('due_check');
        angular.forEach(elements,(ele)=>{ ele.checked=true;})
    }
    else
    {
        $scope.uniqueHoldOvrDue.forEach(value => {
            handleCheckHoldOvrDue({target: {value, checked:false}})
        })
        var elements = document.getElementsByClassName('due_check');
            angular.forEach(elements,(ele)=>{ ele.checked=false;})
   }
  }

  handleCheckHoldOvrPaid = function(event)
  {
    var checked = event.target.checked;
    var value = event.target.value;
    if( checked && !$scope.filterHoldOvrPaid.includes(value))
    {
        $scope.filterHoldOvrPaid.push(value);
    }
    else if(!checked && $scope.filterHoldOvrPaid.includes(value))
    {
        $scope.filterHoldOvrPaid =$scope.filterHoldOvrPaid.filter((paid)=> paid!==value)
    }     
    if($scope.filterHoldOvrPaid.length!==$scope.uniqueHoldOvrPaid.length)
    {
        var elements = document.getElementsByClassName('selectallpaid');
        angular.forEach(elements,(ele)=>ele.checked= false);
    }
    else
    {
        var elements = document.getElementsByClassName('selectallpaid');
        angular.forEach(elements,(ele)=>ele.checked= true);
    }
  }

  selectAllPaid = function(event) {
      if(event.target.checked)
      {
        $scope.uniqueHoldOvrPaid.forEach(value => {
        handleCheckHoldOvrPaid({target: {value, checked:true}})
      })
      var elements = document.getElementsByClassName('paid_check');
        angular.forEach(elements,(ele)=>{ ele.checked=true;})
    }
    else
    {
        $scope.uniqueHoldOvrPaid.forEach(value => {
            handleCheckHoldOvrPaid({target: {value, checked:false}})
        })
        var elements = document.getElementsByClassName('paid_check');
            angular.forEach(elements,(ele)=>{ ele.checked=false;})
   }
  }

  checkAllfilters = function()
  {
    selectAll({'target':{'checked':true}});
    selectAllDue({'target':{'checked':true}});
    selectAllPaid({'target':{'checked':true}});
  }

  function constructTotalRowforEachItem(){
    $scope.FilteredClaimedItemList.map(item=>{
        if(!!item.claimItem?.replaceItems && item.claimItem?.replaceItems.length>0)
        {
            item.claimItem.replaceItemsTotal =[{
              totalReceiptValue : item.claimItem.replaceItems.reduce((accumlator,itr)=>accumlator+itr.receiptValue,0),
              totalQuantityReplaced: item.claimItem.replaceItems.reduce((accumlator,itr)=>accumlator+itr.quantity??0,0),
              totalMaxReplacement : item.claimItem.replaceItems.reduce((accumlator,itr)=>accumlator+itr.replacementExposure,0),
              totalCashPaid: item.claimItem.replaceItems.reduce((accumlator,itr)=>accumlator+itr.cashPaid,0),
              totalHoldoverDue : item.claimItem.replaceItems.reduce((accumlator,itr)=>accumlator+itr.holdOverDue,0),
              totalHoldoverPaid: item.claimItem.replaceItems.reduce((accumlator,itr)=>accumlator+itr.holdOverPaid??0,0)
            }]
        }
    });
    console.log( $scope.FilteredClaimedItemList);
  }
  

});
