angular.module('MetronicApp')
    .directive('bsPopover', function () {
        return function (scope, element, attrs) {
            element.find("span[rel=popover]").popover({ placement: 'top', html: 'true' });
        }
    })
    .controller('RoomDetailsController', function ($translate, $translatePartialLoader, $rootScope, $scope,
        $location, $uibModal, $filter, LineItemsFactory, PolicyInfoFactory, DetailedInventoryService, StatusConstants, $state, $stateParams, AdjusterLineItemDetailsService, utilityMethods) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        $scope.room = {
            id: $stateParams.id
        }
        //set language 
        $translatePartialLoader.addPart('PolicyHolderInventory');
        $translate.refresh();
        $scope.item = {};
        $scope.commonObj =
        {
            claimNumber: sessionStorage.getItem("PolicyHolderClaimNo"),
            claimId: sessionStorage.getItem("PolicyHolderClaimId"),
            policyNumber: PolicyInfoFactory.getPolicyInfo(),
            userId: sessionStorage.getItem("UserId"),
            userName: sessionStorage.getItem("UserName")
        }
        //Get Item / claim status
        $scope.constants = {
            itemStatus: StatusConstants.ItemStatus,
            invoiceStatus: StatusConstants.InvoiceStatus,
        };
        $scope.addOtherRetailer = false;
        $scope.ItemFiles = [];
        $scope.form = {
            addItem: {}
        };
        $scope.items = [];
        var originalItemsList = [];
        var filterOutCategories = [];
        var currentPage = 1;
        var limit = 20;
        $scope.searchItemKeyword = null;


        function init() {
            getRoomDetails();
            getRoomInventory();
        }
        init();

        function getRoomInventory() { 
            $("#itemsLoading").removeClass("hide");           
            var param = {
                "page": currentPage,
                "limit": limit,
                "searchKey": $scope.searchItemKeyword ? $scope.searchItemKeyword : null,
                "categories": filterOutCategories ? filterOutCategories : null,
                "roomId": $scope.room.id
            }
            var getpromise = DetailedInventoryService.getRoomInventory(param);
            getpromise.then(function (success) {
                let res = success.data.data ? success.data.data : null;
                if(res){
                    var inventory = res.postLostItems 
                    if (inventory && inventory.length) {
                        angular.forEach(inventory, function (item) {
                            $scope.items.push(item);
                        })
                        originalItemsList = angular.copy($scope.items);
                    }
                    else {
                        $scope.items = [];
                        showWelcomeMessage($scope.room.roomName);                    
                    }   
                    $scope.totalItems = res.totalItems;
                }                
                $("#itemsLoading").addClass("hide");                        
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
                $("#itemsLoading").addClass("hide");           
            });
        }

        function getRoomDetails() {
            $(".page-spinner-bar").removeClass("hide");
            var getpromise = DetailedInventoryService.getRoomDetails($scope.room.id);
            getpromise.then(function (success) {
                var res = success.data.data;
                if (res != null) {
                    $scope.room = res;
                    angular.forEach($scope.room.categories, function (category) {
                        category.active = true;
                    });
                }
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
                $(".page-spinner-bar").addClass("hide");
            });
        }

        function showWelcomeMessage(roomName) {
            bootbox.alert({
                size: "medium",
                message: "Lets start adding items in the <b>" + roomName + "</b>",
                closeButton: true,
                centerVertical: true,
                onEscape: true,
                className: "modalcustom",
                buttons: {
                    ok: {
                        label: 'Ok',
                        className: 'btn-outline green'
                    }
                    // ,cancel: {
                    //     label: 'No',
                    //     className: 'btn-outline red hide'
                    // }
                },
                callback: function () {
                }
            });
        }

        $scope.toClaimCenter = function () {
            $location.path("/PolicyHolderMyClaims");
        }

        $scope.toClaim = function () {
            $location.path("/PolicyholderClaimDetails");
        }

        $scope.toInventory = function () {
            $location.path("/detailed_inventory");
        }
        var counter = 0
        $scope.addItem = function () {
            if (counter === 0) {
                getCategories();
                getRetailers();
                getConditions();
            }
            $scope.item = {};
            $scope.itemModal = $uibModal.open(
                {
                    animation: $scope.animationsEnabled,
                    size: 'md',
                    templateUrl: "views/PolicyHolder/AddUserItem.html",
                    backdrop: 'static',
                    keyboard: false,
                    transclude: false,
                    scope: $scope,
                });
            $scope.itemModal.result.then(
                function () {
                    //$scope.itemModal.close() 
                    $scope.item = {};
                    $scope.ItemFiles = [];
                    $scope.addOtherRetailer = false;
                },
                function () {
                    //$scope.itemModal.dismiss()
                    $scope.item = {};
                    $scope.ItemFiles = [];
                    $scope.addOtherRetailer = false;
                }
            );
            return {
                open: open,
            };
        }

        function getCategories() {
            var getpromise = DetailedInventoryService.getCategories();
            getpromise.then(function (success) {
                $scope.categoryList = success.data.data;
            }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
        }

        // Get List of Condition    
        function getConditions() {
            var getpromise = AdjusterLineItemDetailsService.getCondition();
            getpromise.then(function (success) {
                $scope.conditionList = success.data.data;
            }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
        }

        function getRetailers() {
            var retailers = AdjusterLineItemDetailsService.getRetailers();
            retailers.then(function (success) {
                if (success.data.data) {
                    $scope.retailers = success.data.data.retailers;
                }
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });
        };

        $scope.selectRoom = function (room) {
            $scope.item.room = {};
            $scope.item.room = {
                "id": room.id,
                "roomName": room.roomName
            }
        }

        $scope.selectRetailer = function (retailer) {
            $scope.item.retailer = {};
            if (retailer)
                $scope.item.originallyPurchasedFrom = {
                    "id": retailer.id,
                    "name": retailer.name
                }
            else {
                $scope.item.originallyPurchasedFrom = null;
            }
            $scope.item.newRetailer = null;
            $scope.addOtherRetailer = false;
        };

        $scope.changeSelection = changeSelection;
        function changeSelection(dropdown) {
            if ('category' === dropdown) { // category            
                //Update model
                var categoryObj = $scope.categoryList.find(x => x.categoryId === $scope.item.category.id);
                if (categoryObj && $scope.item) {
                    if ($scope.item.category) {
                        $scope.item.category.id = categoryObj.categoryId;
                        $scope.item.category.name = categoryObj.categoryName;
                        $scope.item.category.description = categoryObj.description;
                    }
                    else {
                        $scope.item.category = {
                            "id": categoryObj.categoryId,
                            "name": categoryObj.categoryName,
                            "description": categoryObj.description
                        }
                    }
                    $scope.item.subCategory = {};
                    getItemSubCategory();
                }
            } else if ('subCategory' === dropdown) { // subCategory            
                var list = $scope.subCategory.find(x => x.id === $scope.item.subCategory.id);
                if (list) {
                    $scope.item.subCategory = angular.copy(list);
                    $scope.item.depriciationRate = list.annualDepreciation;
                    $scope.item.itemUsefulYears = list.usefulYears;
                }
            } else { // condition            
                angular.forEach($scope.ConditionList, function (item) {
                    if ($scope.item.condition.conditionId == item.conditionId) {
                        $scope.item.condition.conditionName = item.conditionName;
                    }
                });
            }
        }

        $scope.getItemSubCategory = getItemSubCategory;
        function getItemSubCategory() {
            if ($scope.item.category) {
                $(".page-spinner-bar").removeClass("hide");
                var param = {
                    "categoryId": $scope.item.category.id
                };
                var respGetSubCategory = AdjusterLineItemDetailsService.getSubCategory(param);
                respGetSubCategory.then(function (success) {
                    $scope.subCategory = success.data.data;
                    if ($scope.subCategory.length <= 1) {
                        $scope.item.subCategory = angular.copy($scope.subCategory[0]);
                    }
                    $(".page-spinner-bar").addClass("hide");
                }, function (error) {
                    $scope.subCategory = null; $scope.ErrorMessage = error.data.errorMessage
                    $(".page-spinner-bar").addClass("hide");
                });
            }
        }

        $scope.addNewRetailerField = function () {
            $scope.item.originallyPurchasedFrom = null;
            $scope.addOtherRetailer = true;
        }
        $scope.removeNewRetailerField = function () {
            $scope.addOtherRetailer = false;
            $scope.item.newRetailer = null;
        }

        $scope.SaveItemDetails = SaveItemDetails;
        function SaveItemDetails() {
            //Check for invalid / error in AddItemForm before save/update
            if (($scope.form.addItem.$invalid || $scope.form.addItem.$pristine) && ($scope.form.addItem.$invalid)) {
                utilityMethods.validateForm($scope.form.addItem);
            } else {
                $(".page-spinner-bar").removeClass("hide");
                var param = new FormData();
                var fileDetails = [];
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
                param.append("itemDetails",
                    JSON.stringify({
                        "ageMonths": $scope.item.ageMonths,
                        "ageYears": $scope.item.ageYears,
                        "brand": $scope.item.brand,
                        "category": $scope.item.category ? {
                            "annualDepreciation": $scope.item.category.annualDepreciation,
                            "id": $scope.item.category.id,
                            "name": $scope.item.category.name,
                            "description": $scope.item.category.description,
                            "usefulYears": $scope.item.category.usefulYears,
                            "aggregateLimit": $scope.item.category.aggregateLimit
                        } : null,
                        "categoryLimit": $scope.item.categoryLimit ? $scope.item.categoryLimit : null,
                        "claimId": $scope.commonObj.claimId,
                        "claimNumber": $scope.commonObj.claimNumber,
                        "description": $scope.item.description,
                        "insuredPrice": $scope.item.unitPrice,
                        "model": $scope.item.model,
                        "quantity": $scope.item.quantity,
                        "subCategory": $scope.item.subCategory ? {
                            "annualDepreciation": $scope.item.subCategory.annualDepreciation,
                            "id": $scope.item.subCategory.id,
                            "name": $scope.item.subCategory.name,
                            "description": $scope.item.subCategory.description,
                            "usefulYears": $scope.item.subCategory.usefulYears,
                            "aggregateLimit": $scope.item.subCategory.aggregateLimit
                        } : null,
                        "condition": {
                            "conditionId": $scope.item.condition ? $scope.item.condition.conditionId : null,
                            "conditionName": $scope.item.condition ? $scope.item.condition.conditionName : null
                        },
                        // Originally purchased from, purhase method, If gifted then donor's name and address
                        "originallyPurchasedFrom": $scope.addOtherRetailer ? null : $scope.item.originallyPurchasedFrom,
                        "room": {
                            id: $scope.room.id,
                            roomName: $scope.room.roomName,
                            roomType: $scope.room.roomType
                        },
                        "newRetailer": $scope.addOtherRetailer && $scope.item.newRetailer ? $scope.item.newRetailer : null,
                        "videoLink": $scope.item.videoLink ? $scope.item.videoLink : null
                    }
                    ));
                var SavePostLossItem = DetailedInventoryService.AddPostLossItem(param);
                SavePostLossItem.then(function (success) {
                    var newItem = success.data.data
                    if (newItem) {
                        var item = {
                            "id": newItem.id,
                            "description": newItem.description,
                            "quantity": newItem.quantity,
                            "category": newItem.category ? {
                                "id": newItem.category.id,
                                "categoryName": newItem.category.name,
                                "active": true
                            } : null,
                            "images": newItem.attachments,
                            "isNew": true,
                            "itemNumber": newItem.itemNumber
                        };
                        $scope.items.unshift(item);
                        originalItemsList.push(item);
                        var nextItem = $scope.items[1];
                        if (nextItem) {
                            nextItem.isNew = false;
                        }
                        updateRoomSnapshot(newItem);
                        toastr.remove()
                        toastr.success("Item added successfully.", $translate.instant("Success"));
                        $(".page-spinner-bar").addClass("hide");
                        $scope.itemModal.close();
                    }
                }, function (error) {
                    $(".page-spinner-bar").addClass("hide");
                    toastr.remove()
                    toastr.error(error.data.errorMessage, $translate.instant("Error"));
                });

            }
        }

        function updateRoomSnapshot(newItem) {
            $scope.room.claimItemsInfo.totalClaimedItems += 1;
            $scope.room.claimItemsInfo.totalValueOfItems += newItem.totalPrice;
            if (newItem.category) {
                var cat = {
                    "id": newItem.category.id,
                    "categoryName": newItem.category.name,
                    "active": true,
                    "noOfItems": 1,
                }
                if ($scope.room.categories && $scope.room.categories.length) {
                    var categoryIndex = $scope.room.categories.findIndex(c => c.categoryId === newItem.category.id);
                    if (categoryIndex === -1) {
                        $scope.room.categories.push(cat);
                    }
                    else
                        $scope.room.categories[categoryIndex].noOfItems += 1;
                }
                else {
                    $scope.room.categories = [];
                    $scope.room.categories.push(cat)
                }
            }
            if ($scope.addOtherRetailer) {
                var value = {};
                angular.forEach($scope.retailers, function (r) {
                    if (r.name === newItem.originallyPurchasedFrom.name)
                        value = r;
                });
                if (value == null)
                    $scope.retailers.push(newItem.originallyPurchasedFrom);
                $scope.addOtherRetailer = false;
                $scope.item.newRetailer = null;
            }
            $scope.room.lastModifiedDate = newItem.room.lastModifiedDate;
        }

        // Attachments Add , delete and Preview
        $scope.SelectItemFile = function () {
            angular.element('#ItemFileUpload').trigger('click');
            $scope.form.addItem.$setDirty();
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

        $scope.removeattchment = removeattchment;
        function removeattchment(deletedImage) {
            $("#ItemFileUpload").val('');
            var index = $scope.ItemFiles.findIndex(file => file.imageId === deletedImage.imageId);
            if (index > -1)
                $scope.ItemFiles.splice(index, 1);
            $scope.form.addItem.$setDirty();
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
                    // .css({
                    //     'right': $('.page-wrapper-middle').offset().left + 'px'
                    // })
                    .show();
                // $("#img_preview").show();
            }, 100);
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


        //Lost Damage Items
        $scope.deleteItem = deleteItem;
        function deleteItem(obj) {
            bootbox.confirm({
                size: "",
                title: $translate.instant('Confirm.DeleteItemTitle'),
                message: $translate.instant('Confirm.DeleteItemMessage'), closeButton: false,
                className: "modalcustom", buttons: {
                    confirm: {
                        label: $translate.instant('Confirm.BtnYes'),
                        className: 'btn-outline green'
                    },
                    cancel: {
                        label: $translate.instant('Confirm.BtnNo'),
                        className: 'btn-outline red'
                    }
                },
                callback: function (result) {
                    if (result) {
                        var param = {
                            "id": obj.id,
                            "itemUID": obj.itemUID
                        }
                        var response = DetailedInventoryService.DeleteLostDamageItem(param);
                        response.then(function (success) { //Filter list and remove item
                            toastr.remove();
                            toastr.success(success.data.message, "Confirmation");
                            removeDeletedItemFromScope(obj);
                        }, function (error) {
                            toastr.remove();
                            toastr.error(error.data.errorMessage, "Error");
                        });
                    }
                }
            });
        }

        function removeDeletedItemFromScope(removedItem) {
            var index = $scope.items.findIndex(item => item.id === removedItem.id);
            if (index > -1) {
                $scope.items.splice(index, 1);
            }
            index = originalItemsList.findIndex(item => item.id === removedItem.id);
            if (index > -1) {
                originalItemsList.splice(index, 1);
            }
            $scope.items = originalItemsList;            
            $scope.room.claimItemsInfo.totalClaimedItems -= 1;
            $scope.room.claimItemsInfo.totalValueOfItems -= (removedItem.worth ? removedItem.worth : 0);
            //Refresh category list
            //If multiple items exist with same category then don't remove
            let categoryOccurences = 0;
            angular.forEach($scope.items, function (item) {
                if (item.category && removedItem.category && (item.category.id === removedItem.category.id))
                    categoryOccurences++;
            });
            if (categoryOccurences >= 1) {
                var categoryIndex = $scope.room.categories.findIndex(c => c.categoryId === removedItem.category.id);
                if (categoryIndex > -1) {
                    if ($scope.room.categories[categoryIndex].noOfItems === 1)
                        $scope.room.categories.splice(categoryIndex, 1);
                    else
                        $scope.room.categories[categoryIndex].noOfItems -= 1;
                }
            }
        }

        $scope.goToItemDetails = function (item) {
            //  sessionStorage.setItem("AdjusterPostLostItemId", item.itemId)
            sessionStorage.setItem("PolicyHolderPostLostItemId", item.id)
            let index = originalItemsList.findIndex(function (i) {
                return i.id === item.id;
            })            
            sessionStorage.setItem("pageIndex", index);
            sessionStorage.setItem("room", JSON.stringify($scope.room));
            $location.path('/PolicyholderItemDetails');
        }

        $scope.$on('$locationChangeStart', function (event, next, current) {
            if(next.indexOf("/PolicyholderItemDetails") === -1)
                LineItemsFactory.removeAll();           
        });

        $scope.getItemsByKeyword = function () {
            currentPage = 1;
            $scope.items = [];
            getRoomInventory();
        }

        $scope.filterByCategories = function (category) {
            //var tempList = [];
            var index = filterOutCategories.findIndex(c => c === category.categoryId);
            if (index > -1)
                filterOutCategories.splice(index, 1);
            else
                filterOutCategories.push(category.categoryId);
            currentPage = 1;
            $scope.items = [];
            getRoomInventory();
        }

        //$scope.nextItems = function () {
        //    let totalPages = Math.ceil($scope.totalItems / limit);
        //    if (currentPage < totalPages) {
        //        currentPage += 1
        //        getRoomInventory();
        //    }
        //}
    });