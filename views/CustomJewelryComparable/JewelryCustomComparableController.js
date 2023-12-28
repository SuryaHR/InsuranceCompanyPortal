angular.module('MetronicApp')
    .directive('ngFileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var model = $parse(attrs.ngFileModel);
                var isMultiple = attrs.multiple;
                var modelSetter = model.assign;
                element.bind('change', function () {
                    var values = [];
                    angular.forEach(element[0].files, function (item) {
                        var value = {
                            // File Name
                            name: item.name,
                            //File Size
                            size: item.size,
                            //File URL to view
                            url: URL.createObjectURL(item),
                            // File Input Value
                            _file: item
                        };
                        values.push(value);
                    });
                    scope.$apply(function () {
                        if (isMultiple) {
                            modelSetter(scope, values);
                        } else {
                            modelSetter(scope, values[0]);
                        }
                    });
                });
            }
        };
    }])

    /* Directive for File Drag and Drop */
    .directive('filedropzone', ['$log', function ($log) {
        return {
            restrict: 'A',
            scope: {
                dropfiles: '=' //One way to return your drop file data to your controller
            },
            link: function (scope, element, attrs) {
                var processDragOverOrEnter;
                processDragOverOrEnter = function (event) {
                    if (event != null) {
                        event.preventDefault();
                    }
                    return false;
                }
                element.bind('dragover', processDragOverOrEnter);
                element.bind('dragenter', processDragOverOrEnter);
                return element.bind('drop', function (event) {
                    if (event != null) {
                        event.preventDefault();
                    }
                    var fileObjectArray = [];
                    angular.forEach(event.originalEvent.dataTransfer.files, function (file) {
                        var reader = new FileReader();
                        reader.onload = function (event) {
                            scope.$apply(function () {
                                var base64 = event.target.result;
                                var fileName = file.name;
                                var type = file.type;
                                var extension = fileName.substring(fileName.lastIndexOf('.'));
                                var fileObject = {
                                    File: file,
                                    fileName: fileName,
                                    type: type,
                                    Image: base64,
                                    isLocal: true,
                                    FileExtension: extension
                                }
                                scope.dropfiles.push(fileObject);
                            });
                        }

                        reader.readAsDataURL(file);
                    });

                });

            }
        }
    }])

    .directive('disablearrows', function () {
        function disableArrows(event) {
            if (event.keyCode === 38 || event.keyCode === 40) {
                event.preventDefault();
            }
        }
        return {
            link: function (scope, element, attrs) {
                element.on('keydown', disableArrows);
            }
        };
    })

    .directive('stringToNumber', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function (value) {
                    return '' + value;
                });
                ngModel.$formatters.push(function (value) {
                    if (value == '0.0') {
                        return value = null;
                    } else {
                        return parseFloat(value, 100);
                    }
                });
            }
        };
    })
    .controller('JewelryCustomComparableController', function ( $rootScope, $scope,  $translate, $translatePartialLoader,
        AuthHeaderService, $uibModal, ItemDetailService, $location, $window, JewelryCustomComparableService) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        //set language
        $translatePartialLoader.addPart('AddAppraisal');
        $translatePartialLoader.addPart('TooltipInfo');
        $translate.refresh();

        $scope.UserType = sessionStorage.getItem("RoleList");
        $scope.UserName = sessionStorage.getItem("UserLastName") + ", " + sessionStorage.getItem("UserFirstName")
        $scope.role = sessionStorage.getItem("RoleList");       

        $scope.NoImagePath = $rootScope.settings.NoImagePath;
        $scope.ItemDetails = {};
        $scope.ErrorMessage = "";       

        $scope.files = [];
        $scope.attachmentList = [];        
        $scope.showAttachmentErro = false;
        
        $scope.item_types = [];

        $scope.itemCategorySelect = "";
        $scope.itemTypeSelect = "";

        $scope.itemCategoryValue = "";
        $scope.itemTypeValue = "";

        $scope.itemCategoryText = "";
        $scope.itemTypeText = "";

        // default dropdown value
        $scope.CenterStone = ""  
        
        $scope.parentId = 0;
       
        // Initialize custom comparable obj
        $scope.CustomComp = {
            "ItemCategory": {
                "attributeValueId" : "",
                "atttibuteValue" : ""
            },
            "ItemType" : {
                "attributeValueTypeId" : "",
                "atttibuteType" : ""
            },
            "itemDescription" : "",
            "totalPrice": 0.00,
            "replacementDescription" : "",
            "totalReplacementPrice": 0.00,
            "labourCharges" : 0.00,
            "subTotal" : 0.00,
            "taxes" : 0.00,
            "taxesVal" : 0.00,
            "replacementId": null,
            "attachmentList" : [],
            
            // default dropdown value
            "centerStone": "Diamond",

            // Jewelary Components list objects
            "centerStoneDiamonds" : [],
            "centerStoneGemstones" : [],
            "settings": [],
            "weddingBands": []
            
        };
       
        
        $scope.init = init;
        function init() {
            $("#comparableReport").removeClass("hide");
            // Getting data from itemDetails page
            $scope.ItemDetails = ItemDetailService.getItemDetails();
            
            console.log("ItemDetails",$scope.ItemDetails);
            console.log("jewelryCustomItem", $scope.ItemDetails.jewelryCustomItem)
            $scope.isReplacement = $scope.ItemDetails && $scope.ItemDetails.jewelryCustomItem ? $scope.ItemDetails.jewelryCustomItem.isReplacementItem : false;
            $scope.parentId = $scope.ItemDetails.jewelryCustomItem ? $scope.ItemDetails.jewelryCustomItem.id : 0;
            // $scope.CustomComp.itemDescription = $scope.ItemDetails.description;
            //$scope.CustomComp.totalPrice = $scope.ItemDetails.insuredPrice? ($scope.ItemDetails.insuredPrice * $scope.ItemDetails.quantity) : 0.00; 
            //$scope.CustomComp.taxes = $scope.ItemDetails.taxRate ? $scope.ItemDetails.taxRate : sessionStorage.getItem("itemTax");

            GetDropdowns();            

            $scope.CommonObj = {
                itemTax:sessionStorage.getItem("itemTax"),
                ItemId: sessionStorage.getItem("AssociatePostLostItemId"),
                itemReplacementId : $scope.ItemDetails.jewelryCustomItem ? $scope.ItemDetails.jewelryCustomItem.id:undefined,
            };
            // $("#comparableReport").addClass("hide");
        }

       // Get componentList from allComponent List 
       $scope.getComponentList = getComponentList
       function getComponentList(componentsList,itemType){
            const compList = componentsList.filter(fElm => fElm.itemType == itemType);
            return compList;
       }

       $scope.GetWholeCustomComparable = GetWholeCustomComparable
       function GetWholeCustomComparable(internal){
            $(".page-spinner-bar").removeClass("hide");

            if($scope.CommonObj.itemReplacementId){
                // Fatch all component details by itemReplacementId
                var itemReplacementId = $scope.parentId;
                var wholeJewelryCustomItem = JewelryCustomComparableService.getWholeJewelryCustomItem(itemReplacementId);
                wholeJewelryCustomItem.then(function (success) {

                    if(success && success.data && success.data.data && success.data.data.itemId!=0){
                        // Comparable Item details
                        $scope.CustomComp.itemDescription = success.data.data.itemDescription;
                        $scope.CustomComp.totalReplacementPrice = success.data.data.totalReplacementPrice ? success.data.data.totalReplacementPrice : 0.00;
                        $scope.CustomComp.subTotal = success.data.data.subTotal ? success.data.data.subTotal : 0.00;
                        $scope.CustomComp.totalPrice = success.data.data.totalCost ? success.data.data.totalCost : ($scope.ItemDetails.insuredPrice? ($scope.ItemDetails.insuredPrice * $scope.ItemDetails.quantity) : 0.00); 
                        $scope.CustomComp.taxes = success.data.data.taxes ? success.data.data.taxes : $scope.ItemDetails.taxRate ? $scope.ItemDetails.taxRate : sessionStorage.getItem("itemTax");
                        $scope.CustomComp.taxesVal = success.data.data.taxesVal ? success.data.data.taxesVal : 0.00;
                        $scope.CustomComp.ItemCategory.attributeValueId = success.data.data.itemCategory ? parseInt(success.data.data.itemCategory) : null;
                        $scope.CustomComp.replacementDescription = success.data.data.replacementDescription;
                        $scope.CustomComp.labourCharges = success.data.data.labourCharges ? success.data.data.labourCharges : 0.00; 

                        $scope.CustomComp.replacementId = success.data.data.replacementId ? success.data.data.replacementId : null; 
                        

                        $scope.CustomComp.itemId = success.data.data.itemId
                        $scope.CustomComp.replacementId = success.data.data.replacementId
                        
                        areYouSureConfirmation('ItemCategory');
                        $scope.CustomComp.ItemType.attributeValueTypeId = success.data.data.itemType ? parseInt(success.data.data.itemType) : null;               
                        
                        if(success.data.data.imagesDTOSet){
                            let fileExtension = success.data.data.imagesDTOSet && success.data.data.imagesDTOSet[0].name ? success.data.data.imagesDTOSet[0].name.substr(success.data.data.imagesDTOSet[0].name.lastIndexOf('.')) : "";
                            $scope.attachmentList = [{
                                "fileName": success.data.data.imagesDTOSet[0].name ? success.data.data.imagesDTOSet[0].name : "txt.jpg" , "FileExtension":fileExtension, "FileType": success.data.data.imagesDTOSet[0].claimFileType,
                                "Image": success.data.data.imagesDTOSet[0].url, "File": null, "isLocal": true, "mediaFileId": success.data.data.imagesDTOSet[0].imageId
                            }];
                        }

                        const allComparableComponets = success.data.data['customJewelryReplacementDTOS'];
                        
                        // component list
                        $scope.CustomComp.centerStoneDiamonds = getComponentList(allComparableComponets, 'CENTER_DIAMOND');
                        $scope.CustomComp.centerStoneGemstones = getComponentList(allComparableComponets, 'CENTER_GEMSTONE');
                        $scope.CustomComp.settings = getComponentList(allComparableComponets, 'SETTING');
                        $scope.CustomComp.weddingBands = getComponentList(allComparableComponets, 'WEDDING_BAND');

                        // Sort Favourite Selected item first
                        sortFavouriteItems();

                    }else{
                        $scope.CustomComp.itemDescription = $scope.ItemDetails.description;
                        $scope.CustomComp.totalPrice = $scope.ItemDetails.insuredPrice? ($scope.ItemDetails.insuredPrice * $scope.ItemDetails.quantity) : 0.00; 
                        $scope.CustomComp.taxes = $scope.ItemDetails.taxRate ? $scope.ItemDetails.taxRate : sessionStorage.getItem("itemTax");

                        // Default category and type -  Ring / Eng
                        $scope.CustomComp.ItemCategory.attributeValueId = 7;
                        areYouSureConfirmation('ItemCategory');
                        //$scope.CustomComp.ItemType.attributeValueTypeId=2;                    

                    }                

                    // Calculate Total replacement price
                    calculateReplacementPrice(internal);

                }, function (error) {               
                    toastr.remove();
                    toastr.error(error.data.errorMessage, "Error");
                });
            }else{
                $scope.CustomComp.itemDescription = $scope.ItemDetails.description;
                $scope.CustomComp.totalPrice = $scope.ItemDetails.insuredPrice? ($scope.ItemDetails.insuredPrice * $scope.ItemDetails.quantity) : 0.00; 
                $scope.CustomComp.taxes = $scope.ItemDetails.taxRate ? $scope.ItemDetails.taxRate : sessionStorage.getItem("itemTax");

                // Default category and type -  Ring / Eng
                $scope.CustomComp.ItemCategory.attributeValueId = 7;
                areYouSureConfirmation('ItemCategory');
                //$scope.CustomComp.ItemType.attributeValueTypeId=2;
            }
       }
        //Jewelry custom comparable - Add My Own Option popup
        $scope.AddMyOwnOptionPopup = AddMyOwnOptionPopup;
        function AddMyOwnOptionPopup(type, item, iType) {            
            // CTB-2868
            $scope.customItem = true;
            //SaveNewlyAddedComparables(false);

            $scope.CustomComp.attachmentList = $scope.attachmentList;

            var obj = {
                "type" : type,
                "item" : item,
                "itemId": $scope.CommonObj.ItemId,
                "CustomItemType": $scope.ItemDetails.CustomItemType,
                "itemType" : iType,
                "parentItem" : $scope.CustomComp
            };
            $scope.animationsEnabled = true;
            var out = $uibModal.open(
                {
                    size: "md",
                    animation: $scope.animationsEnabled,
                    templateUrl: "views/ThirdPartyVendor/AddMyOwnOptionPopup.html",
                    controller: "AddMyOwnOptionPopupController",
                    backdrop: 'static',
                    keyboard: false,
                    resolve:
                    {
                        objOwn: function () {
                            return obj;
                        }
                    }

                });
            out.result.then(function (pResp) {
                //$scope.$apply(function () {
                    setTimeout(function(){
                        $scope.$apply(function () {
                            if (pResp && pResp.data && pResp.data.status === 200) {
                                $scope.parentId = pResp.data.data.parentId;
                                $scope.CommonObj.itemReplacementId = pResp.data.data.parentId;
                                // Save first time Parent item details defaultly                    
                                GetWholeCustomComparable();
                            }else{
                                $(".page-spinner-bar").addClass("hide");
                            }                            
                                                    
                    });  
                    
                },1000)
                //});

            }, function (res) {
                //Call Back Function close
            });

            return {
                open: open
            };
            //}
        }

        // Remove entire jewelary comparable and navigate to Item details page        
        $scope.deleteCustomItem = deleteCustomItem;
        function deleteCustomItem() {  
            bootbox.confirm({
                size: "",
                closeButton: false,
                title: "Delete Jewelry comparable Item ",
                message: "Are you sure you want to delete whole jewelry comparable item?  <b>Please Confirm!",
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
                    if (result) {
                        $(".page-spinner-bar").removeClass("hide"); 

                        //Add/Update quick addcustom item
                        var getItemDetailsOnId = JewelryCustomComparableService.deleteCustomItem($scope.parentId);
                        getItemDetailsOnId.then(function (success) {
                            $(".page-spinner-bar").addClass("hide");

                            // $scope.tab='Contents';
                            // getItemDetails();                          

                            toastr.remove();
                            toastr.success("Jewelry custom comparable is deleted successfully", "Confirmation");
                            
                            $window.location.reload();
                            
                        }, function (error) { 
                            $(".page-spinner-bar").addClass("hide");               
                            toastr.remove();
                            toastr.error(error.data.errorMessage, "Error");
                        });
                    }
                }
            });

        }

        // Remove Jewelry Component item
        $scope.removeJewelryComponent = removeJewelryComponent;
        function removeJewelryComponent(item, index) {
            bootbox.confirm({
                size: "",
                closeButton: false,
                title: "Delete Jewelry comparable Item ",
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
                    if (result) {
                        $(".page-spinner-bar").removeClass("hide"); 
                        //Request param
                        var param = {
                            "replacementId": item.replacementId,
                            "imageId": item.imagesDTOSet && item.imagesDTOSet[0].imageId ? item.imagesDTOSet[0].imageId : null
                        };

                        //Add/Update quick addcustom item
                        var getItemDetailsOnId = JewelryCustomComparableService.deleteComparableItem(param);
                        getItemDetailsOnId.then(function (success) {
                            $(".page-spinner-bar").addClass("hide");

                            // Call get api
                            GetWholeCustomComparable(0);

                            toastr.remove();
                            toastr.success(success.data.message, "Confirmation");               
                            
                        }, function (error) { 
                            $(".page-spinner-bar").addClass("hide");               
                            toastr.remove();
                            toastr.error(error.data.errorMessage, "Error");
                        });
                    }
                }
            });
        }

        // Mark Favourite Jewelry Component
        $scope.markFavouriteJewelryComponent = markFavouriteJewelryComponent;
        function markFavouriteJewelryComponent(item) {
            if($scope.ItemDetails.status.status !== $scope.constants.itemStatus.supervisorReview){
                $(".page-spinner-bar").removeClass("hide");

                let fItem = null;
                if(item.itemType == "CENTER_DIAMOND"){
                    fItem = $scope.CustomComp.centerStoneDiamonds.filter(fElm => fElm.itemFavourite == true);
                }

                if(item.itemType == "CENTER_GEMSTONE"){
                    fItem = $scope.CustomComp.centerStoneGemstones.filter(fElm => fElm.itemFavourite == true);
                }
                
                if(item.itemType == "SETTING"){
                    fItem = $scope.CustomComp.settings.filter(fElm => fElm.itemFavourite == true);
                }
                
                if(item.itemType == "WEDDING_BAND"){
                    fItem = $scope.CustomComp.weddingBands.filter(fElm => fElm.itemFavourite == true);
                }

                // Update selection
                if(fItem && fItem.length!=0){
                    if(fItem[0].replacementId != item.replacementId){
                    fItem[0].itemFavourite = false;
                    item.itemFavourite = true;
                    item.currFavouriteId = fItem[0].replacementId
                    }else{
                    item.itemFavourite = !item.itemFavourite; 
                    item.currFavouriteId = null;
                    }
                }else{
                    item.itemFavourite = true; 
                    item.currFavouriteId = null;
                }

                // Sort Favourite Selected item first
                //sortFavouriteItems();

                //calculateReplacementPrice();

                // Update Favourite item
                updateFavouriteItem(item);
            }
        }

        $scope.sortFavouriteItems = sortFavouriteItems;
        function sortFavouriteItems(){
            // Sort Favourite Selected item first
            $scope.CustomComp.centerStoneDiamonds.sort((a, b) =>  (a.itemFavourite === b.itemFavourite)? 0 : a.itemFavourite? -1 : 1);
            $scope.CustomComp.centerStoneGemstones.sort((a, b) =>  (a.itemFavourite === b.itemFavourite)? 0 : a.itemFavourite? -1 : 1);
            $scope.CustomComp.settings.sort((a, b) =>  (a.itemFavourite === b.itemFavourite)? 0 : a.itemFavourite? -1 : 1);
            $scope.CustomComp.weddingBands.sort((a, b) =>  (a.itemFavourite === b.itemFavourite)? 0 : a.itemFavourite? -1 : 1);
        }

        //Get Dropdowns
        $scope.calculateReplacementPrice = calculateReplacementPrice;
        function calculateReplacementPrice(internal) {
            const diamondItem = $scope.CustomComp.centerStoneDiamonds.filter(fElm => fElm.itemFavourite == true);
            const gemstoneItem = $scope.CustomComp.centerStoneGemstones.filter(fElm => fElm.itemFavourite == true);
            const settingItem = $scope.CustomComp.settings.filter(fElm => fElm.itemFavourite == true);
            const wbandItem = $scope.CustomComp.weddingBands.filter(fElm => fElm.itemFavourite == true);

            $scope.CustomComp.subTotal = 0;
            $scope.CustomComp.totalReplacementPrice = 0;
            if(diamondItem && diamondItem.length!=0){
                $scope.CustomComp.subTotal += diamondItem[0].totalReplacementPrice;
            }
            if(gemstoneItem && gemstoneItem.length!=0){
                $scope.CustomComp.subTotal += gemstoneItem[0].totalReplacementPrice;
            }
            if(settingItem && settingItem.length!=0){
                $scope.CustomComp.subTotal += settingItem[0].totalReplacementPrice;
            }
            if(wbandItem && wbandItem.length!=0){
                $scope.CustomComp.subTotal += wbandItem[0].totalReplacementPrice;
            }

            $scope.CustomComp.subTotal += $scope.CustomComp.labourCharges && $scope.CustomComp.labourCharges!="" ? parseFloat($scope.CustomComp.labourCharges) :0;            

            // Calculate taxes
            if($scope.ItemDetails.applyTax)
            $scope.CustomComp.taxesVal = parseFloat($scope.CustomComp.subTotal * $scope.CustomComp.taxes) / 100;
            else
            $scope.CustomComp.taxesVal = 0;

            $scope.CustomComp.totalReplacementPrice = parseFloat($scope.CustomComp.subTotal + $scope.CustomComp.taxesVal);

            // Save date again if internal is 0
            if(internal == 0){
                SaveComponentsDetails(0);
            }
            $(".page-spinner-bar").addClass("hide");
        }        

        // Update for favourite item
        $scope.updateFavouriteItem = updateFavouriteItem;
        function updateFavouriteItem(item) { 

            //Request param
            var param = {
                "replacementId": item.replacementId,
                "itemFavourite":item.itemFavourite,                
                "itemType" : item.itemType,
                "currFavouriteId" : item.currFavouriteId
            };

            //Add/Update quick addcustom item
            var getItemDetailsOnId = JewelryCustomComparableService.updateFavouriteItem(param);
            getItemDetailsOnId.then(function (success) {
                $(".page-spinner-bar").addClass("hide"); 
                toastr.remove();
                toastr.success(success.data.message, "Confirmation"); 
                
                // Save whole page data
                SaveComponentsDetails(0);

                // Call get api                
                //GetWholeCustomComparable(0);

                // Save entire details again
                //SaveComponentsDetails(0);
                
            }, function (error) { 
                $(".page-spinner-bar").addClass("hide");               
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });
        }

        //Get Dropdowns
        $scope.GetDropdowns = GetDropdowns;
        function GetDropdowns() {
            var promis = JewelryCustomComparableService.getDropdowns();
            promis.then(function (success) {
                $scope.dropdowns = success.data.appraisalDropdownValue;
                for (var i = 0; i < $scope.dropdowns.length; i++) {
                    var dropdown = $scope.dropdowns[i];
                    if (dropdown.attributeName == 'ITEM_CATEGORY') {
                        $scope.itemCategoryList = dropdown.attributeValue;
                    } else if (dropdown.attributeName == 'ITEM_TYPE') {
                        $scope.item_types = dropdown.attributeValueTypes;
                    } else if (dropdown.attributeName == 'DIAMOND_CLARITY') {
                        $scope.diamondClarityList = dropdown.attributeValue;

                        $scope.tempDiamondClarityFromList = dropdown.attributeValue;
                        $scope.tempDiamondClarityToList = dropdown.attributeValue;

                        $scope.tempWeddingDiamondClarityFromList = dropdown.attributeValue;
                        $scope.tempWeddingDiamondClarityToList = dropdown.attributeValue;

                        $scope.centerStoneClarityTo = dropdown.attributeValue;
                    }else if (dropdown.attributeName == 'DIAMOND_SHAPE') {
                        $scope.diamondShapeList = dropdown.attributeValue;
                    }else if (dropdown.attributeName == 'DIAMOND_COLOR') {
                        $scope.diamondColorFromList = dropdown.attributeValue;
                        $scope.diamondColorToList = dropdown.attributeValue;

                        $scope.tempDiamondColorFromList = dropdown.attributeValue;
                        $scope.tempDiamondColorToList = dropdown.attributeValue;

                        $scope.tempWeddingDiamondColorFromList = dropdown.attributeValue;
                        $scope.tempWeddingDiamondColorToList = dropdown.attributeValue;

                        $scope.centerStoneColorToList = dropdown.attributeValue;
                    } else if (dropdown.attributeName == 'CUT_GRADE') {
                        $scope.diamondCutGradeList = dropdown.attributeValue;
                    } else if (dropdown.attributeName == 'GEM_LAB') {
                        $scope.diamondGemlabList = dropdown.attributeValue;
                    } else if (dropdown.attributeName == 'GENDER') {
                        $scope.genderList = dropdown.attributeValue;
                    } else if (dropdown.attributeName == 'CUSTOM') {
                        $scope.customList = dropdown.attributeValue;
                    }
                    else if (dropdown.attributeName == 'DESIGNER') {

                        $scope.designerList = dropdown.attributeValue;

                    } else if (dropdown.attributeName == 'METAL_TYPE') {

                        $scope.metalTypeList = dropdown.attributeValue;

                    }
                    else if (dropdown.attributeName == 'METAL_COLOR') {

                        $scope.metalColorList = dropdown.attributeValue;

                    }
                    else if (dropdown.attributeName == 'METAL_WEIGHT') {

                        $scope.metalWeightList = dropdown.attributeValue;

                        // angular.forEach(dropdown.attributeValue, function (subItem) {
                        //     $scope.chainWeights.push(subItem);
                        // });

                        // if ($scope.chainWeights.length > 2)
                        //     $scope.chainWeights.splice(2);

                    } else if (dropdown.attributeName == 'GEMSTONE_TYPE') {

                        $scope.gemstoneTypeList = dropdown.attributeValue;

                    } else if (dropdown.attributeName == 'GEMSTONE_SHAPE') {

                        $scope.gemstoneShapeList = dropdown.attributeValue;

                    }
                    else if (dropdown.attributeName == 'GEMSTONE_QUALITY') {

                        $scope.gemstoneQualityList = dropdown.attributeValue;

                    }
                }

                // Default category and type
                //$scope.CustomComp.ItemCategory.attributeValueId = 7;
                //areYouSureConfirmation('ItemCategory');
                //$scope.CustomComp.ItemType.attributeValueTypeId=2;
                
                GetWholeCustomComparable();

                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                toastr.remove();
                $(".page-spinner-bar").addClass("hide");
                if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                    toastr.error(error.data.errorMessage, "Error")
                }
                else {
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
                }
            });
        }

        // areYouSureConfirmation panel
        $scope.areYouSureConfirmation = areYouSureConfirmation;
        function areYouSureConfirmation(catagoryId) {
            var msg = "";
            var header = "";
            if (catagoryId == 'ItemCategory') {
                header = "Change Item Category?";
                msg = "Are you sure you want to change the item category?";
            } else {
                header = "Change Item Type?";
                msg = "Are you sure you want to change the item type?";
            }

            if ((catagoryId == 'ItemCategory' && angular.isDefined($scope.itemCategorySelect) && $scope.itemCategorySelect != '' && $scope.itemCategorySelect != '?') ||
                (catagoryId == 'type' && angular.isDefined($scope.itemTypeSelect) && $scope.itemTypeSelect != '' && $scope.itemTypeSelect != '?')) {
                bootbox.confirm({
                    size: "",
                    title: header,
                    message: msg,
                    closeButton: false,
                    className: "modalcustom", buttons: {
                        confirm: {
                            label: "Change",
                            className: 'btn-success'
                        },
                        cancel: {
                            label: "Cancel",
                            className: 'btn-danger'
                        }
                    },
                    callback: function (result) {
                        $scope.$apply(function () {
                            if (result) {                                
                                if (catagoryId == 'ItemCategory') {
                                    //ClearFilters('ItemType');
                                    onCategoryChange();
                                    //Reseting Type selections
                                    var elm = document.getElementById('type');
                                    if (elm != null && angular.isDefined(elm)) {
                                        elm.value = '?';
                                        $scope.itemTypeSelect = '?';
                                    }
                                } else {
                                    //ClearFilters('IteyymType');
                                    //onChangePopulate();
                                }
                            } else {
                                if (catagoryId == 'ItemCategory') {
                                    var id = $scope.itemCategorySelect.split(":");
                                    $scope.CustomComp.ItemCategory.attributeValueId = parseInt(id[1]);
                                    $scope.CustomComp.ItemCategory.atttibuteValue = $scope.itemCategoryText;
                                } else {
                                    var id = $scope.itemTypeSelect.split(":");
                                    $scope.CustomComp.ItemType.attributeValueTypeId = parseInt(id[1]);
                                    $scope.CustomComp.ItemType.atttibuteType = $scope.itemTypeText;
                                }
                            }
                        });
                    }
                });
            } else {
                if (catagoryId == 'ItemCategory') {
                    //ClearFilters('ItemType');
                    onCategoryChange();

                } else {
                    var elm = document.getElementById(catagoryId);
                    $scope.itemTypeSelect = elm.value;
                    //ClearFilters('IteyymType');
                    //onChangePopulate();

                }

                if (catagoryId == 'type' && ($scope.itemTypeSelect == '?' || $scope.itemTypeSelect == '') && angular.isDefined($scope.itemCategorySelect) && $scope.itemCategorySelect != '' && $scope.itemCategorySelect != '?') {
                    $scope.showMountingandSetting = false;
                }
            }
        }
        
        //on catagory change
        $scope.onCategoryChange = onCategoryChange;
        function onCategoryChange() {

            $scope.itemTypeList = [];
            var catagoryId = ($scope.CustomComp.ItemCategory) ? $scope.CustomComp.ItemCategory.attributeValueId : "";


            angular.forEach($scope.item_types, function (Item) {

                if (Item.attributeValueId == catagoryId)
                    $scope.itemTypeList.push(Item);
            });
            
            if (catagoryId == 149 || catagoryId == 150) {

                $scope.showLabel = true;
                $scope.CustomComp.ItemType = {};

                if (catagoryId == 149) {
                    $scope.CustomComp.ItemType.attributeValueTypeId = 19;
                }
                else {
                    $scope.CustomComp.ItemType.attributeValueTypeId = 20;
                }
            }
        }

        /* set itemCategory Selected Value  */
        $scope.itemCategorySelectedVal = itemCategorySelectedVal;
        function itemCategorySelectedVal(id) {
            var elm = document.getElementById(id);
            if (angular.isDefined(elm)) {
                $scope.itemCategoryText = elm.options[elm.selectedIndex].text;
                $scope.itemCategorySelect = elm.options[elm.selectedIndex].value;
            }
        }
        /* set itemType Selected Value  */
        $scope.itemTypeSelectedVal = itemTypeSelectedVal;
        function itemTypeSelectedVal(id) {
            var elm = document.getElementById(id);
            if (angular.isDefined(elm)) {
                $scope.itemTypeText = elm.options[elm.selectedIndex].text;
                $scope.itemTypeSelect = elm.options[elm.selectedIndex].value;
            }
        }

        init();

        
        // Current Form status updated
        $scope.setFormStatus = setFormStatus;
        function setFormStatus(status) {
            $scope.formStatus = status;
            //console.log($scope.formStatus);
        }
        

        // Round of 2 Decimal point
        $scope.roundOf2Decimal = roundOf2Decimal;
        function roundOf2Decimal(num) {
            if (num != null) {
                return (Math.round(num * 100) / 100).toFixed(2);
            }
            return num;
        }        

        // String Title case
        function toTitleCase(str) {
            return str.replace(
                /\w\S*/g,
                function (txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                }
            );
        }

        // Formate date
        $scope.formatDateDB = formatDateDB;
        function formatDateDB(date) {
            return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
        } 

        //File Upload for attachment
        $scope.AddAttachment = function () {
            $scope.isUpload = true;            
            angular.element('#FileUpload1').trigger('click');
        }

        $scope.RemoveAttachment = RemoveAttachment;
        function RemoveAttachment(index) {
            $("#FileUpload1").val('');
            $scope.deleted = $scope.attachmentList[index];
            var msg = "Are you sure you want to delete the attachment " + $scope.deleted.fileName + "?";
            if ($scope.attachmentList.length > 0) {
                bootbox.confirm({
                    size: "",
                    title: "Delete Attachment",
                    message: msg,
                    closeButton: false,
                    className: "modalcustom",
                    buttons: {
                        confirm: {
                            label: "Delete",
                            className: 'btn-success'
                        },
                        cancel: {
                            label: "Cancel",
                            className: 'btn-danger'
                        }
                    },
                    callback: function (result) {
                        if (result) {
                            $scope.$apply(function () { 
                                if($scope.deleted.isLocal){
                                    // Remove from local - Soft delete for new added file which is not saved yet 
                                    if (angular.isDefined($scope.deleted.url)) {
                                        $scope.deletedAttachmentList.push($scope.deleted.url);
                                    }
                                    $scope.attachmentList.splice(index, 1);
                                    toastr.remove();
                                    toastr.success("The attachment " + $scope.deleted.fileName + " was deleted successfully.", "Confirmation"); 
                                }else{
                                    // Remove from DB - Hard delete for already added file
                                    // var promiseResponse = AppraisalService.deteleAttachment($scope.deleted.url);
                                    // promiseResponse.then(function (data) {
                                    //     $scope.attachmentList.splice(index, 1);
                                    //     toastr.remove();
                                    //     toastr.success("The attachment " + $scope.deleted.fileName + " was deleted successfully.", "Confirmation");
                                    //     //location.reload();
                                    // }, function (error) {
                                    //     $(".page-spinner-bar").addClass("hide");
                                    //     toastr.remove();
                                    //     toastr.error('Error while Deletting attachment.', "Error");
                                    // });
                                }
                                
                            });
                        }
                    }
                });               

            }
        };

        $scope.displayAddImageButton = false;
        $scope.getAttachmentDetails = function (e) {
            $scope.$apply(function () {
                if (e.files.length > 0) {
                    var files = event.target.files;
                    $scope.filed = event.target.files;
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        var fileExtension = file.name.substr(file.name.lastIndexOf('.'));
                        var size = file.size;

                        if(['.jpeg','.png','.svg','.webp','.jpg'].includes(fileExtension))
                        {              
                            if(size <= 20000000)
                            {
                                var reader = new FileReader();
                                reader.file = file;
                                reader.fileName = files[i].name;
                                reader.fileType = files[i].type;
                                reader.fileExtension = files[i].name.substr(files[i].name.lastIndexOf('.'));
                                reader.onload = $scope.LoadFileInList;
                                reader.readAsDataURL(file);
                                $scope.showAttachmentErro = false;

                                angular.element("#FileUpload1").val(null);
                            }
                            else
                            {
                                toastr.remove()
                                toastr.error("file size exceeded . Please upload image below 20Mb", $translate.instant("File Size")); 
                            }
                        }
                        else
                        {
                            toastr.remove()
                            toastr.error("Only image with jpeg,jpg,svg,png and webp format is supported", $translate.instant("File Format")); 
                        }                        
                    }
                }else {
                    $scope.showAttachmentErro = true;
                }
            });
        };
        $scope.LoadFileInList = function (e) {
            $scope.$apply(function () {
                var itemExist = false;
                var newFilenm = e.target.fileName
                angular.forEach($scope.attachmentList, function (item) {
                    var filenm = item.fileName;
                    if (filenm == newFilenm) {
                        itemExist = true;
                    }
                });
                if (!itemExist) {
                    $scope.attachmentList=
                    [{
                        "fileName": e.target.fileName, "FileExtension": e.target.fileExtension, "type": e.target.fileType,
                        "Image": e.target.result, "File": e.target.file, "isLocal": true
                    }];

                    // $scope.attachmentList.push(
                    //     {
                    //         "fileName": e.target.fileName, "FileExtension": e.target.fileExtension, "type": e.target.fileType,
                    //         "Image": e.target.result, "File": e.target.file, "isLocal": true
                    //     })
                } else {
                    toastr.remove();
                    toastr.warning('<b>File <u>' + newFilenm + '</u> is added already! Please add another file.</b>')
                }
                $("#FileUpload1").val('');
            });
        }
        //End File Upload

        //Function to covert base64 data to blob.
        function b64toBlob(b64Data, contentType, sliceSize) {
            contentType = contentType || '';
            sliceSize = sliceSize || 512;
            var byteCharacters = atob(b64Data);
            var byteArrays = [];
            for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                var slice = byteCharacters.slice(offset, offset + sliceSize);
                var byteNumbers = new Array(slice.length);
                for (var i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }
            var blob = new Blob(byteArrays, { type: contentType });
            return blob;
        }

        //Fuction to download uploaded files.
        $scope.getAttachements = function (data) {
            var b64Data = data;
            var contentType = 'application/octet-stream';
            var blob = b64toBlob(b64Data, contentType);
            var url = window.URL.createObjectURL(blob);
            var downloadLink = angular.element('<a></a>');
            downloadLink.attr('href', url);
            downloadLink.attr('target', '_self');
            downloadLink.attr('download', (($scope.DocxDetails.fileName != null && angular.isDefined($scope.DocxDetails.fileName) && $scope.DocxDetails.fileName !== "") ? $scope.DocxDetails.fileName : "Document"));
            downloadLink[0].click();
        }
 
        //Disable scroll for input type number.
        $(document).on("wheel", "input[type=number]", function (e) {
            $(this).blur();
        });
        
        $scope.isPdf = function (fileName) {
            if (/\.(pdf|PDF)$/i.test(fileName ? fileName.toLowerCase() : "")) {
                return true;
            }
        }
        
        $scope.isExcel = function (fileName) {
            if (/\.(xls|xlsx)$/i.test(fileName ? fileName.toLowerCase() : "")) {
                return true;
            }
        }
        
        $scope.isImage = function (fileName) {
            if (/\.(jpe?g|png|gif|bmp)$/i.test(fileName ? fileName.toLowerCase() : "")) {
                return true;
            }
        }

        $scope.isDocx = function (fileName) {
            if (/\.(docx|doc)$/i.test(fileName ? fileName.toLowerCase() : "")) {
                return true;
            }
        }

        $scope.isVideo = function (fileName) {
            if (/\.(mp4|flv|ogg|3gp|webm)$/i.test(fileName ? fileName.toLowerCase() : "")) {
                return true;
            }
        }

        /* Function to preview uploaded Documents */
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
            } else {
                $scope.showButton = true;
            }
            $scope.ReceiptList = $scope.DocxDetails.url;
            $scope.pdfUrl = $scope.ReceiptList;
            var pdf = ["pdf", "application/pdf"];
            var img = ["image", "application/image", "image/png", "image/jpeg", "image/gif", "png", "jpg", "jpeg", "gif", "image", "PNG", "JPEG", "GIF", "JPG"];
            $scope.imgDiv = true;
            if (pdf.indexOf(($scope.DocxDetails.type.toLowerCase())) > -1) {
                $scope.isPDF = 1;
            }
            else if (img.indexOf(($scope.DocxDetails.type.toLowerCase())) > -1) {
                $scope.isPDF = 2;
            }
            else {
                $scope.isPDF = 0;
                var downloadLink = angular.element('<a></a>');
                downloadLink.attr('href', $scope.DocxDetails.url);
                downloadLink.attr('target', '_self');
                downloadLink.attr('download', (($scope.DocxDetails.fileName != null && angular.isDefined($scope.DocxDetails.fileName) && $scope.DocxDetails.fileName !== "") ? $scope.DocxDetails.fileName : "Document"));
                downloadLink[0].click();
            }

            window.setTimeout(function () {
                $("#img_preview").css({
                    'right': $('.page-wrapper-middle').offset().left + 'px'
                }).show();
            }, 100);
        }

        $scope.close = function () {
            /* $("#previewclose").click(function(){ */
            $("#img_preview").hide();
            /*  }); */
        }
        
        function isNullData(objData) {
            if (objData == null || objData == 'null' || objData == '' || objData == 'undefined') {
                return true;
            } else {
                return false;
            }
        }

        
        //Zoom in and Zoom out.
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

        // US Format Current Date
        $scope.currUSFormatDate = currUSFormatDate;
        function currUSFormatDate() {
            var todayTime = new Date();
            var month = todayTime.getMonth() + 1;
            var day = todayTime.getDate();
            var year = todayTime.getFullYear();
            return month + "/" + day + "/" + year;
        }

        $scope.saveReplacementItem = saveReplacementItem;
        function saveReplacementItem() {
            $scope.isReplacement = true;
            $scope.SaveComponentsDetails();
        }

        $scope.saveComparableItem = saveComparableItem;
        function saveComparableItem() {
            $scope.isReplacement = false;
            $scope.SaveComponentsDetails();
        }
         
        // SaveComponentsDetails - Jewelary components
        $scope.SaveComponentsDetails = SaveComponentsDetails;
        function SaveComponentsDetails(internal) { 
            $(".page-spinner-bar").removeClass("hide");

           var param = new FormData();
           var customItem =  JSON.stringify({
                "replacementId": $scope.CustomComp.replacementId,
                "customItemFlag": true,
                "itemDescription":$scope.CustomComp.itemDescription,
                "taxes":$scope.CustomComp.taxes,
                "taxesVal": $scope.CustomComp.taxesVal,
                "replacementDescription": $scope.CustomComp.replacementDescription,
                "itemStatus": "Comparable",
                "totalReplacementPrice": $scope.CustomComp.totalReplacementPrice,
                "registrationNumber": sessionStorage.getItem("CompanyCRN"),
                "claim": {
                    "claimId": $scope.CommonObj.ClaimId
                },
                "itemId": $scope.CommonObj.ItemId,
                "replacementItem":$scope.isReplacement,
                "itemType": $scope.CustomComp.ItemType.attributeValueTypeId,
                "itemCategory": $scope.CustomComp.ItemCategory.attributeValueId,
                "labourCharges" : $scope.CustomComp.labourCharges,
                "subTotal":$scope.CustomComp.subTotal,
                "totalPrice" : $scope.CustomComp.totalPrice,
            })
             
            param.append("customItem",customItem);

            angular.forEach($scope.attachmentList, function (ItemFile) {
                param.append('filesDetails', JSON.stringify([{ "mediaFileId": ItemFile.mediaFileId, "fileName": ItemFile.fileName, "fileType": ItemFile.type, "extension": ItemFile.FileExtension, "filePurpose": "ITEM", "latitude": null, "longitude": null }]));
                param.append('file', ItemFile.File);
            });
            if ($scope.attachmentList.length == 0 || $scope.attachmentList == null) {
                param.append('filesDetails', null);
                param.append('file', null);
            };

            var getItemDetailsOnId = JewelryCustomComparableService.AddCustomItem(param);
            getItemDetailsOnId.then(function (success) {
                console.log(success); 
                $scope.parentId = success.data.data.replacementId;   
                $scope.CommonObj.itemReplacementId = success.data.data.replacementId;              
                if(internal!=0){
                    toastr.remove();
                    toastr.success(success.data.message, "Confirmation");

                    $window.location.reload(); 
                }else{
                    GetWholeCustomComparable();                    
                    $(".page-spinner-bar").addClass("hide");
                } 
            });
        }


        $scope.searchSettingPopup = searchSettingPopup;
        function searchSettingPopup() {
            $scope.animationsEnabled = true;
            //addNewWeddingItem();
            let param = {
                "popup": 'Setting',
                "itemCategory" : $scope.CustomComp.ItemCategory,
                "itemType": $scope.CustomComp.ItemType
            }

            var out = $uibModal.open(
                {
                    animation: $scope.animationsEnabled,
                    templateUrl: "views/ThirdPartyVendor/SearchSettingPopup.html",
                    controller: "JewelryPopupComponentsController",
                    resolve:
                    {
                        popupComponents: function () {
                            return param;
                        }
                    }
                });
                out.result.then(function (value) {
            }, function () {
            });
            return {
                open: open
            };
       }

        $scope.popUpToSearchCenterStone = popUpToSearchCenterStone;
        function popUpToSearchCenterStone(centerStone, iType){
            $scope.animationsEnabled = true;
            $scope.CustomComp.attachmentList = $scope.attachmentList;
            //addNewWeddingItem();
            let param = {
                "popup": centerStone,
                "itemCategory" : $scope.CustomComp.ItemCategory,
                "itemType": $scope.CustomComp.ItemType,

                "type" : centerStone,
                "item" : null,
                "itemId": $scope.CommonObj.ItemId,
                "CustomItemType": $scope.ItemDetails.CustomItemType,
                "iType" : iType,
                "parentItem" : $scope.CustomComp
            }

            var out = $uibModal.open(
                {
                    animation: $scope.animationsEnabled,
                    templateUrl: "views/ThirdPartyVendor/SearchCenterStonePopup.html",
                    controller: "JewelryPopupComponentsController",
                    resolve:
                    {
                        popupComponents: function () {
                            return param;
                        }
                    }
                });
                out.result.then(function (pResp) {

                    setTimeout(function(){
                        $scope.$apply(function () {
                            if (pResp && pResp.data && pResp.data.status === 200) {
                                $scope.parentId = pResp.data.data.parentId;
                                $scope.CommonObj.itemReplacementId = pResp.data.data.parentId;
                                // Save first time Parent item details defaultly                    
                                GetWholeCustomComparable();
                            }else{
                                $(".page-spinner-bar").addClass("hide");     
                            }                           
                                               
                    });  
                    
                },1000)

            }, function () {
            });
            return {
                open: open
            };
        }        

        $scope.searchWeddingBandPopup = searchWeddingBandPopup;
        function searchWeddingBandPopup() {
            $scope.animationsEnabled = true;
            //addNewWeddingItem();
            let param = {
                "popup": 'Wband',
                "itemCategory" : $scope.CustomComp.ItemCategory,
                "itemType": $scope.CustomComp.ItemType
            }

            var out = $uibModal.open(
                {
                    animation: $scope.animationsEnabled,
                    templateUrl: "views/ThirdPartyVendor/SearchWeddingBandPopup.html",
                    controller: "JewelryPopupComponentsController",
                    resolve:
                    {
                        popupComponents: function () {
                            return param;
                        }
                    }
                });
                out.result.then(function (value) {
            }, function () {
            });
            return {
                open: open
            };
        }

    });