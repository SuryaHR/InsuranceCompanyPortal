angular.module('MetronicApp').controller('UploadItemsFromCSVController', function ($translate, $window, $timeout, $interval, $translatePartialLoader, $rootScope, $log, $scope,
    settings, $location, UploadItemsFromCSVService, $filter) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('UploadItemsFromCSV');
    $translate.refresh();
    $scope.ErrorMessage = "";
    $scope.FileDetails = {
        FileName: null,
        FileType: null,
        FileExtension: null,
        Files: []
    };
    $scope.showProgress = true;
    $scope.stepScreen = false;
    $scope.VerifyScreen = false;
    //$scope.StatusScreen = false;
    $scope.FinishScreen = false;
    $scope.uploader = {
        "progress": 5
    }
    $scope.TemplateURL = angular.isDefined(sessionStorage.getItem("ItemTemplate")) && sessionStorage.getItem("ItemTemplate") != null ? sessionStorage.getItem("ItemTemplate") : null;
    $scope.UploadedFile = [];
    $scope.Itemlist = [];
    $scope.FailedItemlist = [];
    $scope.isError = true;
    $scope.currentPage = 1;
    $scope.init = init;
    function init() {
        $scope.ClaimNumber = sessionStorage.getItem("UploadClaimNo");
        if (angular.isDefined($scope.ClaimNumber) && $scope.ClaimNumber !== null) {
            $scope.stepScreen = true;
            $scope.VerifyScreen = false;
            //$scope.StatusScreen = false;
            $scope.FinishScreen = false;
        }
        else
            $window.history.back();
        getRoomTypes();
    }
    $scope.init();
    $scope.showProgress = false;
    //Upload file from here
    $scope.StartUpload = StartUpload;
    function StartUpload() {
        $scope.Itemlist = [];
        $scope.FailedItemlist = [];
        //show progress bar
        $scope.showProgress = true;
        $scope.uploader = { "progress": 20 }
        $scope.timer = $interval(function () {
            if (parseInt($scope.uploader.progress) < 90) {
                $scope.uploader.progress = parseInt($scope.uploader.progress) + 10;
            }
        }, 600);

        var data = new FormData();
        data.append("file", $scope.FileDetails.Files[0]);
        var UploadFile = UploadItemsFromCSVService.UploadItemExcelFile(data);
        UploadFile.then(function (success) {
            $scope.uploader.progress = 100;
            $interval.cancel($scope.timer);
            var uploadData = success.data.data;
            $scope.rowsProcessed = uploadData.rowsProcessed;
            $scope.Itemlist = uploadData.postLossItemDetails;
            angular.forEach(uploadData.postLossItemDetails, function (p) {
                if (!p.isValidItem)
                    $scope.FailedItemlist.push(p);
            });
            $timeout(function () {
                var tbodyElm = $('#itemListTbl');
                var tblHeadElm = $('#itemListTblHead');
                if ($scope.Itemlist.length <= 20) {
                    tbodyElm.addClass('itemTblBody-no-scroll');
                    tbodyElm.removeClass('itemTblBody-scroll');
                } else {
                    tblHeadElm.removeClass("itemTblHead-width1");
                    tbodyElm.addClass('itemTblBody-scroll');
                    tbodyElm.removeClass('itemTblBody-no-scroll');
                }
                $scope.stepScreen = false;
                $scope.VerifyScreen = true
                $scope.StatusScreen = false;
                $scope.FinishScreen = false;
            }, 500);
            $timeout(function () {
                $scope.scrollable = $scope.isScrollable();
                console.log($scope.scrollToTop);
            }, 550)
        },
            function (error) {
                toastr.remove();
                toastr.error("Failed to process the items. Please try again..", "Error");
                $scope.ErrorMessage = error.data.errorMessage;
            });

    }

    //Cancel verify 
    $scope.CancelVerify = CancelVerify;
    function CancelVerify() {
        $scope.stepScreen = true;
        $scope.uploader.progress = 0;
        $scope.VerifyScreen = false
        $scope.StatusScreen = false;
        $scope.FinishScreen = false;
        $scope.showProgress = false;
        CancelFileUpload();
    }

    //Grid display of items
    $scope.Verify = Verify;
    function Verify() {
        $scope.showProgress = true;
        $scope.stepScreen = false
        $scope.VerifyScreen = false
        //$scope.StatusScreen = true;
        $scope.FinishScreen = true;
        $scope.uploader = { "progress": 20 }
        $scope.timer = $interval(function () {
            if (parseInt($scope.uploader.progress) < 80) {
                $scope.uploader.progress = parseInt($scope.uploader.progress) + 10;
            }
        }, 600);

        //Call API to upload item list
        var postlossItems = angular.copy($scope.Itemlist);
        angular.forEach(postlossItems, function (item) {
            item.description = item.description && item.description!="" ? encodeURIComponent(item.description):"";
        });
        var paramList = {
            "claimNumber": $scope.ClaimNumber,
            "postlossItems": postlossItems,
            "applyTax":sessionStorage.getItem("applyTax") && sessionStorage.getItem("applyTax") != null ? sessionStorage.getItem("applyTax") : true
        };
        var UploadItem = UploadItemsFromCSVService.UploadItemList(paramList);
        UploadItem.then(function (success) {
            StopProgressBarShowFinal();
            HideProgressBar();
            var savedData = success.data.data;
            $scope.RowCount = savedData.rowProcessed;
            $scope.newRecoredInsertedCount = savedData.newCreated;
            $scope.UpdateCount = savedData.updated;
            $scope.FailedItem = savedData.failedRecordsItems ? savedData.failedRecordsItems : [];
            // $scope.stepScreen = true;
            // $scope.VerifyScreen = false;
            // $scope.FinishScreen = false;
            CancelFileUpload();
            if($scope.FailedItem!=null && $scope.FailedItem.length==0){
                $scope.stepScreen = true;
                $scope.VerifyScreen = false;
                $scope.FinishScreen = false;                
                $scope.GoBack();
                toastr.remove();
                toastr.success("Items uploaded successfully", "Success");
            }else{
                $scope.stepScreen = false;
                $scope.VerifyScreen = true;
                $scope.FinishScreen = false;
                toastr.remove();
                toastr.warning("Please re-check and correct the failed items. Please try again..", "Validation Failed");
            }
        }, function (error) {
            StopProgressBarShowFinal();
            HideProgressBar();
            if (angular.isDefined(error.data)) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
                $scope.RowCount = 0;
                $scope.newRecoredInsertedCount = 0;
                $scope.UpdateCount = 0;
                $scope.FialedItem = 0;
            } else {
                toastr.remove();
                toastr.error("Failed to process the items. Please try again..", "Error");
                $scope.RowCount = 0;
                $scope.newRecoredInsertedCount = 0;
                $scope.UpdateCount = 0;
                $scope.FialedItem = 0;
            }
        });

    }
    function StopProgressBarShowFinal() {
        $interval.cancel($scope.timer);
        $scope.uploader.progress = 100;
        $scope.stepScreen = false;
        $scope.VerifyScreen = false
        //$scope.StatusScreen = false;
        $scope.FinishScreen = true;
    }

    function HideProgressBar() {
        $timeout(function () { $scope.showProgress = false; }, 700);

    }
    //Last step of file upload
    $scope.Done = Done;
    function Done() {
        toastr.remove();
        $scope.stepScreen = true;
        $scope.VerifyScreen = false
        //$scope.StatusScreen = false;
        $scope.FinishScreen = false;
        CancelFileUpload();
        $scope.GoBack();
    }

    //Sorting for table   
    $scope.reverse = false;
    $scope.sort = function (colname) {
        $scope.reverse = ($scope.sortKey === colname) ? !$scope.reverse : false;
        $scope.sortKey = colname;
        $scope.Itemlist = $filter('orderBy')($scope.Itemlist, colname, $scope.reverse)
    }

    //trigger fileupload
    $scope.FileUploadEvent = FileUploadEvent;
    function FileUploadEvent() {
        $scope.Itemlist = [];
        CancelFileUpload();
        angular.element('#FileUpload').trigger('click');
    }
    //Get attached file details
    $scope.FileSupported = [".xls", ".xlsx", ".csv"];
    $scope.getFileDetails = function (e) {
        $scope.$apply(function () {
            $scope.ErrorMessage = "";
            $scope.isError = true;
            $scope.FileDetails.FileName = e.files[0].name;
            $scope.FileDetails.FileType = e.files[0].type;
            $scope.FileDetails.FileExtension = $scope.FileDetails.FileName.substr($scope.FileDetails.FileName.lastIndexOf('.'));
            $scope.FileDetails.Files.push(e.files[0]);
            let fr = new FileReader();
            //fr.onload = receivedText;
            fr.readAsDataURL(e.files[0]);
            if ($scope.FileSupported.indexOf(($scope.FileDetails.FileExtension).toLowerCase()) === -1) {
                $scope.isError = true;
                $scope.FileDetails = {
                    FileName: null,
                    FileType: null,
                    FileExtension: null,
                    Files: []
                };
                toastr.remove();
                toastr.warning("Please select xls, xlsx Or csv file..", "File type");
                $scope.ErrorMessage = ""
            }
            else {
                $scope.isError = false;
            }
        });
    };

    //Remove file details from object
    function CancelFileUpload() {
        $scope.FileDetails = {
            FileName: null,
            FileType: null,
            FileExtension: null,
            Files: []
        };
        angular.element("input[type='file']").val(null);
    }
    //Go to claim details page form wher it redirect to this page
    $scope.GoBack = function () {
        sessionStorage.setItem("UploadClaimNo", null);
        CancelFileUpload();
        sessionStorage.setItem("isItemUploaded", true);
        $window.history.back();
    };

    $scope.GotoDashboard = function () {
        $location.url(sessionStorage.getItem('HomeScreen'));
    };
    //Calculate Total amount for item from quantity and unit cost
    $scope.CalculateTotal = function (item) {
        if ((item.purchasedUnitCost !== null && angular.isDefined(item.purchasedUnitCost)) && (item.quantity !== null && angular.isDefined(item.quantity))) {
            item.totalCost = item.purchasedUnitCost * item.quantity;
        }
    }

    $scope.pageChangeHandler = pageChangeHandler;
    function pageChangeHandler(pageNum) {
        $scope.currentPage = pageNum;
    }
    $scope.selectedItem = {};
    $scope.getTemplateItemsList = getTemplateItemsList;
    function getTemplateItemsList(item) {
        if (!angular.isUndefined(item)) {
            if (item.id === $scope.selectedItem.id)
                return 'editItem';
            else
                return 'displayItems';
        } else
            return 'displayItems';
    }

    $scope.EditItem = EditItem;
    function EditItem(item) {
        $scope.selectedItem = angular.copy(item);
    }
    $scope.saveorCancelEditedRow = saveorCancelEditedRow;
    function saveorCancelEditedRow(editedRow, op) {
        if (op === 'save') {
            var index = -1;
            $scope.Itemlist.some(function (obj, i) {
                return obj.id === editedRow.id ? index = i : false;
            });
            if (index > -1) {
                if (editedRow.description && editedRow.quantity > 0 && editedRow.replacementCost > 0 && editedRow.totalCost > 0) {
                    editedRow.isValidItem = true;
                    var failedIndex = -1
                    $scope.FailedItemlist.some(function (obj, i) {
                        return obj.id === editedRow.id ? failedIndex = i : false;
                    });
                    if (failedIndex > -1) {
                        $scope.FailedItemlist.splice(failedIndex, 1);
                    }
                }
                $scope.Itemlist[index] = editedRow;
            }
        }
        $scope.selectedItem = {};
    }
    $scope.removeItem = removeItem;
    function removeItem(item) {
        var index = -1;
        // Remove if present in failed items list
        if ($scope.FailedItemlist) {
            $scope.FailedItemlist.some(function (obj, i) {
                return obj.id === item.id ? index = i : false;
            });
            if (index > -1) {
                $scope.FailedItemlist.splice(index, 1);
                index = -1
            }
        }
        //Remove from origina list
        $scope.Itemlist.some(function (obj, i) {
            return obj.id === item.id ? index = i : false;
        });
        if (index > -1) {
            $scope.Itemlist.splice(index, 1);
        }
    }
    $scope.goToTop = goToTop;
    function goToTop() {
        // Item List scroll-Top
        $('#itemListTbl').animate({
            scrollTop: 0
        }, 100);

        // Page scroll-Top
        $('html, body').animate({
            scrollTop: 0
        }, 100);
    }

    $scope.isScrollable = function isScrollable() {
        var el = document.getElementById("itemListTbl");
        /*The scrollTop() method sets or returns the  
        vertical scrollbar position for the selected elements*/
        var y1 = el.scrollTop;
        el.scrollTop += 1;
        var y2 = el.scrollTop;
        el.scrollTop -= 1;
        var y3 = el.scrollTop;
        el.scrollTop = y1;

        // /*The scrollLeft() method returns the horizontal  
        // scrollbar position for the selected elements.*/ 
        // var x1 = el.scrollLeft;  
        // el.scrollLeft += 1; 
        // var x2 = el.scrollLeft; 
        // el.scrollLeft -= 1; 
        // var x3 = el.scrollLeft; 
        // el.scrollLeft = x1; 

        //returns true or false accordingly 
        return {
            // horizontallyScrollable: x1 !== x2 || x2 !== x3,  
            verticallyScrollable: y1 !== y2 || y2 !== y3
        };
    };

    $scope.updateItemPrice = function () {
        $scope.selectedItem.totalCost = Math.round(($scope.selectedItem.quantity * $scope.selectedItem.replacementCost) * 1e2) / 1e2;
    }

    // Get all room types
    function getRoomTypes() {
        var types = UploadItemsFromCSVService.roomTypes();
        types.then(function (success) {
            if (success.data)
                $scope.roomTypes = success.data.data;
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }

});
