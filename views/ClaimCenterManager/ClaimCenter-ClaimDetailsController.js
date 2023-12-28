angular.module('MetronicApp').controller('ClaimCenter-ClaimDetailsController', function ($filter, $translate, ClaimCenterClaimDetailsService, $translatePartialLoader, $rootScope,
   $uibModal, $scope, settings, $location, AssignClaimForManagerService, RejectApproveClaimService, $sce) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('ClaimCenter-ClaimDetails');
    $translate.refresh();

    //Stored Claim StatusId And ClaimId   
    $scope.CommonObject = {
        ClaimId: sessionStorage.getItem("ManagerScreenClaimId"),
        ClaimNo: sessionStorage.getItem("ManagerScreenClaimNo"),
        ItemCategoryId: ""
    };
    $scope.pageItem = $rootScope.settings.itemPagesize;
    $scope.ErrorMessage = "";
    $scope.ClaimStatusDetails;
    $scope.DdlSourcePolicyType;
    $scope.PolicyDetails;
    $scope.DeleteListLostDamageItem = [];
    $scope.DdlClaimCategoryWithCovers;
    $scope.ClaimCategoryWithCovers = [];
    $scope.PendingTaskList = [];
    $scope.stateList = [];
    $scope.AgentList = [];

    $scope.LostDamagedItemList = [];
    $scope.FiletrLostDamageList = [];
    $scope.OriginalPostLossItem; $scope.OriginalPostLossIndex;

    //Split Mobile number in three parts
    $scope.SplitPhoneNumber = SplitPhoneNumber;
    function SplitPhoneNumber(cell, Evening, Day) {
        if (angular.isDefined(cell) && cell !== null) {
            $scope.CellPhoneFirst = cell.substring(0, 3); $scope.CellPhoneSecond = cell.substring(3, 6); $scope.CellPhoneThird = cell.substring(6, 12);
        }
        if (angular.isDefined(Day) && Day !== null) {
            $scope.DayPhoneFirst = Day.substring(0, 3); $scope.DayPhoneSecond = Day.substring(3, 6); $scope.DayPhoneThird = Day.substring(6, 12);
        }
        if (angular.isDefined(Evening) && Evening !== null) {
            $scope.EveningPhoneFirst = Evening.substring(0, 3); $scope.EveningPhoneSecond = Evening.substring(3, 6); $scope.EveningPhoneThird = Evening.substring(6, 12);
        }
    }
    init();
    function init() {
        $scope.selected = {};
        $scope.AddNewItem = false;
        $scope.EditItem=false


        $scope.CommonObject = {
            ClaimId: sessionStorage.getItem("ManagerScreenClaimId"),
            ClaimNo: sessionStorage.getItem("ManagerScreenClaimNo"),
            SearchItemCategory: "ALL"
        };
        if ((angular.isDefined($scope.CommonObject.ClaimId) && $scope.CommonObject.ClaimId !== null) && (angular.isDefined($scope.CommonObject.ClaimNo) && $scope.CommonObject.ClaimNo !== null)) {
            //get Policy Details      
            var policyNumber = {
                "policyNumber": sessionStorage.getItem("ManagerScreenpolicyNo").toString()
            };

            var response = ClaimCenterClaimDetailsService.getPolicyDetails(policyNumber);
            response.then(function (success) {
                $scope.PolicyDetails = success.data.data;
                
                $scope.OrignialCategoryListCoverage = angular.copy(success.data.data.categories);
                if (success.data.data !== null) {
                    if (success.data.data.policyHolder !== null) {
                        if ($scope.PolicyDetails.policyHolder.address !== null) {
                            $scope.PolicyDetails.policyHolder.cellPhone = $filter('tel')($scope.PolicyDetails.policyHolder.cellPhone);
                            $scope.PolicyDetails.policyHolder.eveningTimePhone = $filter('tel')($scope.PolicyDetails.policyHolder.eveningTimePhone);
                            $scope.PolicyDetails.policyHolder.dayTimePhone = $filter('tel')($scope.PolicyDetails.policyHolder.dayTimePhone);
                           // $scope.PolicyDetails.policyHolder.address = { "streetAddressOne": null, "streetAddressTwo": null, "city": null, "state": { id: null }, "zipcode": null };
                        }
                        $scope.ClaimCategoryWithCovers = success.data.data.categories;
                    }
                }
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });


            // Get List Of Agent
              var companyIdParam = {
                "companyId": sessionStorage.getItem("CompanyId")
               };        
             var GetAgents = ClaimCenterClaimDetailsService.GetListOfAgent(companyIdParam);
               GetAgents.then(function (success) { 
                $scope.AgentList = success.data.data; 
                }, function (error) { 
                 $scope.ErrorMessage = error.data.errorMessage;
                });

            //get Policy Type
            var response = ClaimCenterClaimDetailsService.getPolicyType();
            response.then(function (success) {
                $scope.DdlSourcePolicyType = success.data.data;
            }, function (error) { });

            //Get claim status details
            var paramClaimStatusDetails = {
                "claimId": sessionStorage.getItem("ManagerScreenClaimId").toString()
            };
            var response = ClaimCenterClaimDetailsService.GetClaimStatusDetails(paramClaimStatusDetails);
            response.then(function (success) { $scope.ClaimStatusDetails = success.data.data; }, function (error) { });

            //get Lost Damage items
            var paramLostDamageList = {
                "claimId": sessionStorage.getItem("ManagerScreenClaimId").toString()
            };

            var response = ClaimCenterClaimDetailsService.getLostDamagedItemList(paramLostDamageList);
            response.then(function (success) {
                $scope.LostDamagedItemList = success.data.data;
                $scope.FiletrLostDamageList = success.data.data;
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });

            //get Covergae Category
            var promiseGet = ClaimCenterClaimDetailsService.GetCategoriesHomeAppliance();
            promiseGet.then(function (success) { $scope.DdlClaimCategoryWithCovers = success.data.data; },
                function (error) {
                    $scope.ErrorMessage = error.data.errorMessage;
                });

            //get GetPendingTask for claim
            var paramUserTaskListList = {
                "claimId": sessionStorage.getItem("ManagerScreenClaimId").toString()
            };
            var GetPendingTaskPromise = ClaimCenterClaimDetailsService.GetPendingTask(paramUserTaskListList);
            GetPendingTaskPromise.then(function (success) { $scope.PendingTaskList = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

            //Get state List
            var param =
           {
               "isTaxRate": false,
               "isTimeZone": false
           }
            var Getstate = ClaimCenterClaimDetailsService.GetStateList(param);
            Getstate.then(function (success) { $scope.stateList = success.data.data; }, function () { $scope.stateList = []; $scope.ErrorMessage = error.data.errorMessage; });
            //category
            var CategoryPromise = ClaimCenterClaimDetailsService.GetCategoriesHomeAppliance();
            CategoryPromise.then(function (success) { $scope.CategoryList = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

        }
        else {
            $scope.GoBack();
        }

    }

    $scope.GoBack = GoBack;
    function GoBack() {
        //$location.url('ClaimCenterAllClaims');
        $location.url(sessionStorage.getItem('HomeScreen'));
    }

    //Add item in list of category of items
    $scope.CreateItemList = CreateItemList;
    function CreateItemList() {
        var flag = [];
        flag = $filter('filter')($scope.ClaimCategoryWithCovers, { id: $scope.CommonObject.ItemCategoryId });
        if (flag !== null) {
            if (flag.length === 0 && $scope.CommonObject.ItemCategoryId !== null) {
                obj = $filter('filter')($scope.DdlClaimCategoryWithCovers, { categoryId: $scope.CommonObject.ItemCategoryId });
                var pushObj = {
                    "id": obj[0].categoryId,
                    "name": obj[0].categoryName,
                    "coverageLimit": obj[0].coverageLimit,
                    "specialLimit": null,
                    "deductible": obj[0].deductible
                };
                $scope.ClaimCategoryWithCovers.push(pushObj);
            }
        }
        else {
            var obj = $filter('filter')($scope.DdlClaimCategoryWithCovers, { categoryId: $scope.CommonObject.ItemCategoryId });
            if ($scope.ClaimCategoryWithCovers===null)
            $scope.ClaimCategoryWithCovers = [];
            var pushObj = {
                "id": obj[0].categoryId,
                "name": obj[0].categoryName,
                "coverageLimit": obj[0].coverageLimit,
                "specialLimit": null,
                "deductible": obj[0].deductible
            };
            $scope.ClaimCategoryWithCovers.push(pushObj);
        }
    }

    //Remove Category from list (From Ui only)
    $scope.DeleteItemCategory = DeleteItemCategory;
    function DeleteItemCategory(item) {
        var index = $scope.ClaimCategoryWithCovers.indexOf(item);
        $scope.ClaimCategoryWithCovers.splice(index, 1);
    }

    $scope.RejectClaim = RejectClaim;
    function RejectClaim(e) {
        $scope.animationsEnabled = true;
        var paramClaimId = {
            "claimNumber":sessionStorage.getItem("ManagerScreenClaimNo"),
            "isApproved": false,
            "IsApprove": false,
            "IsReject": true
        }
        var out = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "views/ClaimCenterManager/RejectorApproveClaimPopUp.html",
            controller: "RejectOrApproveClaimController",
            resolve:
            {
                ClaimDetails: function () {
                    return paramClaimId;
                }
            }
        });
        out.result.then(function (value) {
            //Call Back remove item

        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };

    }

    $scope.ApproveClaim = ApproveClaim;
    function ApproveClaim(e) {
        var paramClaimId = {
            "claimNumber": sessionStorage.getItem("ManagerScreenClaimNo"),
            "isApproved": true
        };
        var response = RejectApproveClaimService.RejectOrApproveClaim(paramClaimId);
        response.then(function (success) {
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });

    }

    $scope.AssignClaimToAdjuster = AssignClaimToAdjuster;
    function AssignClaimToAdjuster(ev) {
        var obj = {
            "claimId": $scope.CommonObject.ClaimId,
            "claimStatusId": 4
        };
        $scope.animationsEnabled = true;
        var paramCompanyId = {
            "companyId": sessionStorage.getItem("CompanyId")
        };
        var promiseGetAdjuster = AssignClaimForManagerService.GetAdjusterList(paramCompanyId);
        promiseGetAdjuster.then(function (success) {
            $scope.AdjusterList = success.data.data;
            var out = $uibModal.open(
           {
               animation: $scope.animationsEnabled,
               templateUrl: "views/ClaimCenterManager/AssignClaimForManager.html",
               controller: "AssignClaimForManagerController",
               resolve:
               {
                   items: function () {
                       objClaim = obj;
                       return objClaim;
                   },
                   AdjusterList: function () {
                       return $scope.AdjusterList;
                   }
               }

           });
            out.result.then(function (value) {
                //Call Back Function success
                if (value === "Success") {

                }

            }, function (res) {
                //Call Back Function close
            });
            return {
                open: open
            };
        }, function (errorPl) {
            //Error Message           
            toastr.remove();
            toastr.error(errorPl.data.errorMessage, "Error");
        });
    }

    // Create task list to cretae pending task
    $scope.dynamicPopover = {
        isOpen: false,
        html: true,
        templateUrl: "myPopoverTemplate.html",
        open: function open() {
            $scope.dynamicPopover.isOpen = true;
            // $("[data-toggle=popover]").popover();
        },
        close: function close() {
            $scope.dynamicPopover.isOpen = false;

        }
    };
    $scope.CreatePendingTasksObjList = [];
    $scope.StoreTaskObject = StoreTaskObject;
    function StoreTaskObject(taskSet) {
        $scope.CreatePendingTasksObjList = [];
        $scope.CreatePendingTasksObjList.push({
            "taskId": taskSet.taskId,
            "comment": taskSet.comment
        });
    }
    //Create Pending task against claim
    $scope.CreatePendingtask = CreatePendingtask;
    function CreatePendingtask() {
        var param = {
            "claimId": sessionStorage.getItem("ManagerScreenClaimId").toString(),
            claimPendingTasks: $scope.CreatePendingTasksObjList
        };
        // $scope.dynamicPopover.close();
        var CreateTask = ClaimCenterClaimDetailsService.CreatePendingtask(param);
        CreateTask.then(function (success) {
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");  $scope.dynamicPopover.close();
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }
    //End Task 

    //Dropdown Policy type change event assign type to policy and fill dedutables and other field according to policy type
    $scope.AssignPolicyType = AssignPolicyType;
    function AssignPolicyType() {
        var policyObject = $filter('filter')($scope.DdlSourcePolicyType, { typeName: $scope.PolicyDetails.policyType });
        $scope.PolicyDetails.policyCoverage = policyObject[0].coverageDetails.policyCoverage;
        $scope.PolicyDetails.detuctables = policyObject[0].coverageDetails.deductible;
        $scope.PolicyDetails.specialLimits = policyObject[0].coverageDetails.specialLimits;
        $scope.PolicyDetails.aggregateCoverage = policyObject[0].coverageDetails.aggregateCoverage;
    }

    //Lost damaged item Region
    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

    //Filter Loast Damage items
    $scope.FilterLostDamageItems = FilterLostDamageItems;
    function FilterLostDamageItems() {

        if (($scope.CommonObject.SearchItemCategory === "ALL") || (angular.isUndefined($scope.CommonObject.SearchItemCategory) || $scope.CommonObject.SearchItemCategory === null)) {
            $scope.FiletrLostDamageList = $scope.LostDamagedItemList;
        }
        else {
            $scope.FiletrLostDamageList = $filter('filter')($scope.LostDamagedItemList, { categoryName: $scope.CommonObject.SearchItemCategory });
        }
    }

    $scope.GetSubCategory = GetSubCategory;
    function GetSubCategory() {
        var param = {
            "categoryId": $scope.selected.categoryId
        };
        var respGetSubCategory = ClaimCenterClaimDetailsService.GetSubCategory(param);
        respGetSubCategory.then(function (success) { $scope.SubCategory = success.data.data; }, function (error) { $scope.SubCategory = null; $scope.ErrorMessage = error.data.errorMessage });

    }


    $scope.AddNewItemToList = AddNewItemToList;
    function AddNewItemToList() {
        $scope.selected = {};
        $scope.selected.scheduled = false;
        $scope.AddNewItem = true;
    }
    $scope.CancelAddNewItem = CancelAddNewItem;
    function CancelAddNewItem() {
        $scope.AddNewItem = false;
    }
    $scope.getTemplate = function (item) {
        if (!angular.isUndefined(item)) {
            if (item.itemId === $scope.selected.itemId) return 'edit';
            else
                return 'display';
        }
        else
            return 'display';
    };
    $scope.EditItemDetails = function (item) {
        $scope.AddNewItem = false;
        $scope.EditItem = true
        $scope.selected = {};
        $scope.selected = angular.copy(item);
        $scope.OriginalPostLossIndex = $scope.FiletrLostDamageList.indexOf(item);
        $scope.OriginalPostLossItem = angular.copy(item);

        //get Item Category #96
        var CategoryPromise = ClaimCenterClaimDetailsService.GetCategoriesHomeAppliance();
        CategoryPromise.then(function (success) { $scope.CategoryList = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });


        $scope.GetSubCategory();
    };
    $scope.SaveItemDetails = function (itemid) {
        if (angular.isDefined(itemid)) {
            var param = new FormData();
            param.append('filesDetails', null);
            param.append("itemDetails",
                JSON.stringify({
                    "id": $scope.selected.itemId,
                    "acv": null,
                    "acvTax": null,
                    "acvTotal": null,
                    "adjusterDescription": null,
                    "ageMonths": $scope.selected.ageMonths,
                    "ageYears": $scope.selected.age,
                    "approvedItemValue": null,
                    "brand": $scope.selected.brand,
                    "category": {
                        "annualDepreciation": null,
                        "id": $scope.selected.categoryId,
                        "name": $scope.selected.categoryName,
                        "description": null,
                        "usefulYears": null,
                        "aggregateLimit": null
                    }, "assignedTo": null,
                    "claimId": sessionStorage.getItem("ManagerScreenClaimId").toString(),
                    "claimNumber": sessionStorage.getItem("ManagerScreenClaimNo").toString(),
                    "dateOfPurchase": (($scope.selected.dateOfPurchase === null || angular.isUndefined($scope.selected.dateOfPurchase)) ? null : $scope.selected.dateOfPurchase),
                    "depriciationRate": null,
                    "description": $scope.selected.description,
                    "holdOverPaymentDate": null,
                    "holdOverPaymentMode": null,
                    "holdOverPaymentPaidAmount": null,
                    "holdOverValue": null,
                    "insuredPrice": $scope.selected.price,
                    "isReplaced": null,
                    "isScheduledItem": null,
                    "itemName": $scope.selected.itemName,
                    "itemType": null,
                    "model": $scope.selected.model,
                    "paymentDetails": null,
                    "quantity": $scope.selected.quantity,
                    "quotedPrice": $scope.selected.price,
                    "rcv": null,
                    "rcvTax": null,
                    "rcvTotal": null,
                    "receiptValue": null,
                    "status": {
                        "id": null,
                        "status": null
                    },
                    "subCategory": {
                        "annualDepreciation": null,
                        "id": $scope.selected.subCategoryId,
                        "name": $scope.selected.subCategoryName,
                        "description": null,
                        "usefulYears": null,
                        "aggregateLimit": null
                    },
                    "taxRate": null,
                    "totalTax": null,
                    "valueOfItem": null,
                    "vendorDetails": null,
                    "yearOfManufecturing": "0000",
                    "totalStatedAmount": parseFloat($scope.selected.price) * parseFloat(($scope.selected.quantity !== null && angular.isDefined($scope.selected.quantity) ? $scope.selected.quantity : (1))),



                }
                ));
            param.append('file', null);
            var UpdatePostLoss = ClaimCenterClaimDetailsService.UpdatePostLoss(param);
            UpdatePostLoss.then(function (success) {
                var obj = MakeObjectToAddInList(success);
                obj.status = $scope.OriginalPostLossItem.status;
                $scope.FiletrLostDamageList[$scope.OriginalPostLossIndex] = obj;
                //$scope.LostDamagedItemList = $filter('filter')($scope.LostDamagedItemList, { itemId: success.data.data.id });
                //if ($scope.LostDamagedItemList.length > 0)
                //    angular.copy(obj, $scope.LostDamagedItemList[0]);

                $scope.reset();
            },
            function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });
        }
        else {//Call Api save And get its id then assign id and pass 
            var param = new FormData();
            param.append('filesDetails', null);
            param.append("itemDetails",
                JSON.stringify({
                    "acv": null,
                    "acvTax": null,
                    "acvTotal": null,
                    "adjusterDescription": null,
                    "ageMonths": $scope.selected.ageMonths,
                    "ageYears": $scope.selected.age,
                    "approvedItemValue": null,
                    "brand": $scope.selected.brand,
                    "category": {
                        "annualDepreciation": null,
                        "id": $scope.selected.categoryId,
                        "name": $scope.selected.categoryName,
                        "description": null,
                        "usefulYears": null,
                        "aggregateLimit": null
                    }, "assignedTo": null,
                    "claimId": sessionStorage.getItem("ManagerScreenClaimId").toString(),
                    "claimNumber": sessionStorage.getItem("ManagerScreenClaimNo").toString(),
                    "dateOfPurchase": (($scope.selected.dateOfPurchase === null || angular.isUndefined($scope.selected.dateOfPurchase)) ? null : $scope.selected.dateOfPurchase),
                    "depriciationRate": null,
                    "description": $scope.selected.description,
                    "holdOverPaymentDate": null,
                    "holdOverPaymentMode": null,
                    "holdOverPaymentPaidAmount": null,
                    "holdOverValue": null,
                    "insuredPrice": $scope.selected.price,
                    "isReplaced": null,
                    "isScheduledItem": null,
                    "itemName": $scope.selected.itemName,
                    "itemType": null,
                    "model": $scope.selected.model,
                    "paymentDetails": null,
                    "quantity": $scope.selected.quantity,
                    "quotedPrice": $scope.selected.price,
                    "rcv": null,
                    "rcvTax": null,
                    "rcvTotal": null,
                    "receiptValue": null,
                    "status": {
                        "id": null,
                        "status": null
                    },
                    "subCategory": {
                        "annualDepreciation": null,
                        "id": $scope.selected.subCategoryId,
                        "name": $scope.selected.subCategoryName,
                        "description": null,
                        "usefulYears": null,
                        "aggregateLimit": null
                    },
                    "taxRate": null,
                    "totalTax": null,
                    "valueOfItem": null,
                    "vendorDetails": null,
                    "yearOfManufecturing": "0000",
                    "totalStatedAmount": parseFloat($scope.selected.price) * parseFloat(($scope.selected.quantity !== null && angular.isDefined($scope.selected.quantity) ? $scope.selected.quantity : (1))),

                }
                ));
            param.append('file', null);
            var SavePostLossItem = ClaimCenterClaimDetailsService.AddPostLossItem(param);
            SavePostLossItem.then(function (success) {
                //Need to pass the ItemId which will generate after inserting item 
                var obj = MakeObjectToAddInList(success);
                if ($scope.FiletrLostDamageList !== null) {
                    $scope.FiletrLostDamageList.splice(0, 0, obj);
                    $scope.reset();
                }
                else {
                    $scope.FiletrLostDamageList = [];
                    $scope.FiletrLostDamageList.push(obj); $scope.reset();
                }
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });
        }

    };
    $scope.reset = function () {
        $scope.AddNewItem = false;
        $scope.EditItem = false
        $scope.selected = {};
    };

    //Make object to be add or replace after save or edit item details
    function MakeObjectToAddInList(success) {
        return {
            "itemId": success.data.data.id,
            "itemName": success.data.data.itemName,
            "itemPrice": null,
            "collection": null,
            "images": [],
            "quantity": null,
            "dateOfPurchase": success.data.data.dateOfPurchase,
            "category": null,
            "rooms": null,
            "currentValue": null,
            "brand": success.data.data.brand,
            "model": success.data.data.model,
            "description": success.data.data.description,
            "roomId": null,
            "collectionId": null,
            "price": success.data.data.quotedPrice,
            "categoryId": success.data.data.category.id,
            "categoryName": ((angular.isDefined(success.data.data.category.id) && success.data.data.category.id !== null) ? GetCategoryOrSubCategoryOnId(true, success.data.data.category.id) : null),
            "subCategoryId": success.data.data.subCategory.id,
            "subCategoryName": ((angular.isDefined(success.data.data.subCategory.id) && success.data.data.subCategory.id !== null) ? GetCategoryOrSubCategoryOnId(false, success.data.data.subCategory.id) : null),
            "templateType": null,
            "itemWorth": 0,
            "policyNumber": null,
            "appraisalValue": null,
            "productSerialNo": null,
            "imageId": null,
            "jwelleryTypeId": null,
            "jwelleryType": null,
            "claimed": false,
            "claimId": success.data.data.claimId,
            "vendorId": null,
            "ageMonths": success.data.data.ageMonths,
            "age": success.data.data.ageYears,
            "status": "CREATED",
            "statusId": success.data.data.statusId,
            "itemCategory": null,
            "contact": null,
            "notes": null,
            "additionalInfo": null,
            "approved": false,
            "scheduled": success.data.data.isScheduledItem
        }
    }
    //get Category name on category id for showing in grid of post loss itemd
    function GetCategoryOrSubCategoryOnId(OpertionFlag, id) {
        if (OpertionFlag) {
            var list = $filter('filter')($scope.CategoryList, { categoryId: id });
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

    //Lost Damage Items 
    $scope.DeletItem = DeletItem;
    function DeletItem(obj) {
        bootbox.confirm({
            size: "",
            title: $translate.instant('ClaimDetails_Delete.Title'),
            message: $translate.instant('ClaimDetails_Delete.Message'), closeButton: false,
            className: "modalcustom", buttons: {
                confirm: {
                    label: $translate.instant('ClaimDetails_Delete.BtnYes'),
                    className: 'btn-success'
                },
                cancel: {
                    label: $translate.instant('ClaimDetails_Delete.BtnNo'),
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                if (result) {
                    var paramIdList = [];
                    paramIdList.push({ "itemId": obj.itemId })
                    var response = ClaimCenterClaimDetailsService.DeleteLostDamageItem(paramIdList);
                    response.then(function (success) { //Filter list and remove item                      
                        var index = $scope.FiletrLostDamageList.indexOf(obj);
                        if (index > -1) {
                            $scope.FiletrLostDamageList.splice(index, 1);
                        }
                    }, function (error) {
                        toastr.remove();
                        toastr.error(error.data.errorMessage, "Error");
                    });
                }
            }
        });
    }
    //Change porperty coverage for policy on policy covergae change
    $scope.ChangePropertyCoverage = ChangePropertyCoverage;
    function ChangePropertyCoverage() {
        $scope.PolicyDetails.propertyCoverage = (($scope.PolicyDetails.totalCoverage !== null && angular.isDefined($scope.PolicyDetails.totalCoverage) ? (($scope.PolicyDetails.totalCoverage > 0) ? ((parseFloat($scope.PolicyDetails.totalCoverage)) / 2).toFixed(2) : 0) : null))
    }
    //Save policy details
    $scope.SavePolicyDetails = SavePolicyDetails;
    function SavePolicyDetails() {
        //var policytypeObject = $filter('filter')($scope.DdlSourcePolicyType, { typeName: $scope.PolicyDetails.policyType });
        //var PolicyTypeId = policytypeObject[0].id;
        var CategoryListToSave = []; var CategoryListToDelete = [];
        angular.forEach($scope.ClaimCategoryWithCovers, function (Item) {
            CategoryListToSave.push({
                "id": Item.id,
                "name": Item.categoryName,
                "coverageLimit": Item.coverageLimit,
                "specialLimit": Item.specialLimit,
                "deductible": Item.deductible,
                "isDefault": Item.isDefault,
                "description": null,
            });
        });

        angular.forEach($scope.OrignialCategoryListCoverage, function (OrignalListItem) {
            var checker = false;
            angular.forEach(CategoryListToSave, function (NewListItem) {
                if (OrignalListItem.id === NewListItem.id)
                    checker = true;
            });
            if (checker === false)
                CategoryListToDelete.push(OrignalListItem);
        });

        var listobj = $filter('filter')($scope.DdlSourcePolicyType, { typeName: $scope.PolicyDetails.homeownerPolicyType.typeName });
        if (listobj !== null && angular.isDefined(listobj)) {
            $scope.PolicyDetails.homeownerPolicyType.id = listobj[0].id;
        }
        else {
            $scope.PolicyDetails.homeownerPolicyType.id = 1;
        }
        var PolicyDetailsParam = {
            "benefits": null,
            "id": $scope.PolicyDetails.id,
            "homeOwnerPolicyTypeId": $scope.PolicyDetails.homeownerPolicyType.id,
            "totalPolicyCoverage": $scope.PolicyDetails.totalCoverage,
            "propertyCoverage": $scope.PolicyDetails.propertyCoverage,
            "totalSpecialLimit": $scope.PolicyDetails.totalSpecialLimit,
            "totalDetuctableAmount": $scope.PolicyDetails.totalDetuctibleAmount,
            "expiryDate": null,
            "policyId": $scope.PolicyDetails.id,
            "claimType": $scope.PolicyDetails.claimType,
            "policyNumber": $scope.PolicyDetails.policyNumber,
            "policyType": $scope.PolicyDetails.policyType,
            "policyName": $scope.PolicyDetails.policyName,
            "propertyAddress":(($scope.PolicyDetails.propertyAddress!==null)? {
                "streetAddressOne": $scope.PolicyDetails.propertyAddress.streetAddressOne,
                "streetAddressTwo": $scope.PolicyDetails.propertyAddress.streetAddressTwo,
                "city": $scope.PolicyDetails.propertyAddress.city,
                "state": {
                    "id": (($scope.PolicyDetails.propertyAddress.state !== null && angular.isDefined($scope.PolicyDetails.propertyAddress.state)) ? $scope.PolicyDetails.propertyAddress.state.id : null)
                },
                "zipcode": $scope.PolicyDetails.propertyAddress.zipcode
            }:null),
            "companyId": sessionStorage.getItem("CompanyId"),
            "agentId":  (($scope.PolicyDetails.agentDetails !== null && angular.isDefined($scope.PolicyDetails.agentDetails))?(($scope.PolicyDetails.agentDetails.agentId !== null && angular.isDefined($scope.PolicyDetails.agentDetails.agentId)) ? $scope.PolicyDetails.agentDetails.agentId : null):null),
            "deletedCategories": CategoryListToDelete,
            "categories": CategoryListToSave,
            "insuranceAccountDetails": {
                "insuranceAccountNumber": (angular.isDefined($scope.PolicyDetails.insuraceAccountDetails.insuranceAccountNumber) && $scope.PolicyDetails.insuraceAccountDetails.insuranceAccountNumber !== null) ? ($scope.PolicyDetails.insuraceAccountDetails.insuranceAccountNumber) : null,
                "id": $scope.PolicyDetails.insuraceAccountDetails.id
            },
            "vehicleDateOfPurchase": null,
            "vehicleMakeModel": null,
            "vehicleManufecturingYear": null,
            "vehicleRegistrationNumber": null,
            "policyHolder": {
                "firstName": $scope.PolicyDetails.policyHolder.firstName,
                "lastName": $scope.PolicyDetails.policyHolder.lastName,
                "email": $scope.PolicyDetails.policyHolder.email,
                "cellPhone": $scope.PolicyDetails.policyHolder.cellPhone.replace(/[^0-9]/g, ''),
                "eveningTimePhone": $scope.PolicyDetails.policyHolder.eveningTimePhone.replace(/[^0-9]/g, ''),
                "dayTimePhone": $scope.PolicyDetails.policyHolder.dayTimePhone.replace(/[^0-9]/g, ''),
                "insuranceNumber": (angular.isDefined($scope.PolicyDetails.insuraceAccountDetails.insuranceAccountNumber) && $scope.PolicyDetails.insuraceAccountDetails.insuranceAccountNumber !== null) ? ($scope.PolicyDetails.insuraceAccountDetails.insuranceAccountNumber) : null,
                "policyHolderId": $scope.PolicyDetails.policyHolder.policyHolderId,
                "agentDetails": $scope.PolicyDetails.insuraceAccountDetails.policyHolderDetails.agentDetails,
                "address": {
                    "streetAddressOne": $scope.PolicyDetails.policyHolder.address.streetAddressOne,
                    "streetAddressTwo": $scope.PolicyDetails.policyHolder.address.streetAddressTwo,
                    "city": $scope.PolicyDetails.policyHolder.address.city,
                    "id": null,
                    "state": {
                        "id": (($scope.PolicyDetails.policyHolder.address.state !== null && angular.isDefined($scope.PolicyDetails.policyHolder.address.state)) ? $scope.PolicyDetails.policyHolder.address.state.id : null),
                        "state": null
                    },
                    "zipcode": $scope.PolicyDetails.policyHolder.address.zipcode,
                    "completeAddress": $scope.PolicyDetails.policyHolder.address.completeAddress
                }
            }
            }
        var SavePolicyDetailsPromise = ClaimCenterClaimDetailsService.SavePolicy(PolicyDetailsParam);
        SavePolicyDetailsPromise.then(function (success) {
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
            //var CategoryWithCoverages = [];
            //angular.forEach($scope.ClaimCategoryWithCovers, function (item) {
            //    CategoryWithCoverages.push({
            //        "categoryId": item.categoryId,
            //        "categoryLimit": item.coverageLimit
            //    });
            //});
            //var ParamCategoryCoverage = {
            //    "policyNumber": $scope.PolicyDetails.policyNumber,
            //    "categoryList": CategoryWithCoverages
            //};
            //var SaveCategoryCoverage = ClaimCenterClaimDetailsService.AlterCategoryCoverage(ParamCategoryCoverage);
            //SaveCategoryCoverage.then(function (success) {
            //    bootbox.alert({
            //        size: "", closeButton: false,
            //        title: $translate.instant('ClaimDetails_Save.Title'),
            //        message: $translate.instant('ClaimDetails_Save.Message'),
            //        className: "modalcustom",
            //        callback: function () { /* your callback code */ }
            //    });
            //}, function (error) { });
        }, function (error) {

            var msg;
            if (error.data.errorMessage != null) {
                msg = error.data.errorMessage;
            }
            else {
                msg = $translate.instant('FNOL_Save.ErrorMessage');
            }
            toastr.remove();
            toastr.error(msg, "Error");

        });
    }

    //Upload post loss item from file
    $scope.UploadPostLossItem = function () {
        if ($scope.CommonObject.ClaimNo !== null && angular.isDefined($scope.CommonObject.ClaimNo)) {
            sessionStorage.setItem("UploadClaimNo", $scope.CommonObject.ClaimNo);
            $location.url('UploadItemsFromCSV')
        }
    }
});

