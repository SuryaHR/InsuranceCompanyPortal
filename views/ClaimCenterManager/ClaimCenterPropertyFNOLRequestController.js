//Store claimid in session object of sessionStorage.getItem("ManagerScreenClaimId")
angular.module('MetronicApp').controller('ClaimCenterPropertyFNOLRequestController', function ($scope, $rootScope, $translatePartialLoader, $translate, $filter,
    $uibModal, $location, PropertyFNOLRequestService, AssignClaimForManagerService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $('.datepicker').datepicker();
    $translatePartialLoader.addPart('ClaimCenterPropertyFNOLRequest');
    $translate.refresh();
    //validating file control for required
    $scope.Validatefile;
    $scope.pageItem = $rootScope.settings.itemPagesize;
    $scope.CellPhoneFirst; $scope.CellPhoneSecond; $scope.CellPhoneThird;
    $scope.DayPhoneFirst; $scope.DayPhoneSecond; $scope.DayPhoneThird;
    $scope.EveningPhoneFirst; $scope.EveningPhoneSecond; $scope.EveningPhoneThird;
    $scope.PolicyDetails = {};
    var d = new Date();
    $scope.PolicyDetails.reportDate = $filter('TodaysDate')();
    $scope.DdlSourcePolicyType;
    $scope.ErrorMessage = "";
    $scope.DdlClaimCategoryWithCovers;
    $scope.ClaimCategoryWithCovers = [];
    // claimDetails object
    $scope.claimDetails = {};
    $scope.PolicyExists = "";
    $scope.AccountExists = "";
    $scope.DdlItemCatregoryList;
    $scope.DdlStateList = [];
    $scope.AgentList = [];
    $scope.CommonObject = {
        Note: '',
        ClaimId: null,
        claimStatusId: "4",
        PolicyType: '',
        ItemCategoryId: '',
        SearchItemCategory: "ALL"
    };
    $scope.SubCategory = [];

    $scope.LostDamagedItemList = [];
    $scope.FiletrLostDamageList = [];
    $scope.OriginalPostLossItem; $scope.OriginalPostLossIndex;
    //Policy list
    $scope.PolicyList = [];
    $scope.ShowPolicyDropdown = false;
    $scope.ShowPolicyTextbox = true;
    //End Policy List

    $scope.PolicyDetails.dt = $filter('date')(new Date(), "dd/MM/yyyy");
    //$scope.PolicyDetails.claimType = "HOME";
    //$scope.PolicyDetails.policyType = "HOME";
    //$scope.dt = Date.parse(new Date())
    $scope.ResetPhoneNumbers = ResetPhoneNumbers;
    function ResetPhoneNumbers() {
        $scope.CellPhoneFirst = null; $scope.CellPhoneSecond = null; $scope.CellPhoneThird = null;
        $scope.DayPhoneFirst = null; $scope.DayPhoneSecond = null; $scope.DayPhoneThird = null;
        $scope.EveningPhoneFirst = null; $scope.EveningPhoneSecond = null; $scope.EveningPhoneThird = null;
    }
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

    $scope.CreatePolicybutton = true;
    function init() {
        $scope.ShowPolicyDropdown = false;
        $scope.ShowPolicyTextbox = true;
        $scope.PolicyList = [];
        //Remove session value if any on page load
        sessionStorage.setItem("ManagerScreenClaimId", "");
        if (sessionStorage.getItem("ManagerScreenClaimId") === "")
            $scope.DisableAssignbtn = true;

        //Get ApplianceCategory with coveragre limit   API# 161
        var promiseGet = PropertyFNOLRequestService.GetCategoriesHomeAppliance();
        promiseGet.then(function (success) { $scope.DdlClaimCategoryWithCovers = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

        //Get Policy Type #95
        var GetPolicyType = PropertyFNOLRequestService.getPolicyType();
        GetPolicyType.then(function (success) { $scope.DdlSourcePolicyType = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

        //get Item Category #96
        var CategoryPromise = PropertyFNOLRequestService.GetItemCategory();
        CategoryPromise.then(function (success) { $scope.DdlItemCatregoryList = success.data.data; $scope.CategoryList = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

        //Get all the state #123
        var param =
           {
               "isTaxRate": false,
               "isTimeZone": false
           }
        var GetStatList = PropertyFNOLRequestService.GetState(param);
        GetStatList.then(function (success) {
             $scope.DdlStateList = success.data.data;
            }, function (error) {
                 $scope.ErrorMessage = error.data.errorMessage;

                });

        // Get List Of Agent
        var companyIdParam = {
            "companyId": sessionStorage.getItem("CompanyId")
        };
        var GetAgents = PropertyFNOLRequestService.GetListOfAgent(companyIdParam);
        GetAgents.then(function (success) {
            $scope.AgentList = success.data.data;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
         });

    }
    init();
    //Calculate total for special limit
    $scope.PolicyDetails.totalSpecialLimit = 0.0;
    $scope.SumSpecialLimit = SumSpecialLimit;
    function SumSpecialLimit(item)
    {
        $scope.PolicyDetails.totalSpecialLimit = 0.0;
        angular.forEach($scope.DefaultCategoryCoverage, function (item) {
            $scope.PolicyDetails.totalSpecialLimit = (parseFloat($scope.PolicyDetails.totalSpecialLimit) + ((item.coverageLimit !== null && item.coverageLimit !== "" && item.coverageLimit >0) ? parseFloat(item.coverageLimit) : 0)).toFixed(2);
        });

    }
    //Set claim type
    $scope.SelectclaimType=function()
    {
        if ($scope.PolicyDetails.policyType === "HOME")
            $scope.PolicyDetails.claimType = "HOME";
        else if ($scope.PolicyDetails.policyType === "AUTO")
            $scope.PolicyDetails.claimType = "AUTO";
        else
            $scope.PolicyDetails.claimType = "HOME";
    }
    //Get policya and claim details  API# 184 ""P13PJJ64
    $scope.GetPolicyDetails = GetPolicyDetails;
    function GetPolicyDetails() {
        $scope.ShowPolicyDropdown = false;
        $scope.ShowPolicyTextbox = true;
        $scope.PolicyExists = "";
        $scope.AccountExists = "";
        if ((angular.isDefined($scope.PolicyDetails.policyNumber)) && ($scope.PolicyDetails.policyNumber !== null)) {
            var insuranceNumber = $scope.PolicyDetails.insuranceNumber;
            var paramPolicyNO = {
                "policyNumber": $scope.PolicyDetails.policyNumber,
                "claimNumber": null
            };
            var promisePost = PropertyFNOLRequestService.GetPolicyAndClaimDetails(paramPolicyNO);
            promisePost.then(function (success) {
                $scope.PolicyExists = "";
                $scope.CreatePolicybutton = false;
                $scope.ResetPhoneNumbers();
                if (success.data.data !== null) {
                    $scope.PolicyDetails = success.data.data;
                   $scope.SelectclaimType();
                   if($scope.PolicyDetails.insuraceAccountDetails.insuranceAccountNumber!=undefined && $scope.PolicyDetails.insuraceAccountDetails.insuranceAccountNumber!=null)
                    $scope.PolicyDetails.insuranceNumber = $scope.PolicyDetails.insuraceAccountDetails.insuranceAccountNumber;

                    $scope.PolicyDetails.reportDate = $filter('formatDate')($scope.PolicyDetails.reportDate);
                    if (success.data.data.policyHolder !== null || angular.isUndefined(success.data.data.policyHolder)) {
                        $scope.PolicyDetails.policyHolder.cellPhone = $filter('tel')($scope.PolicyDetails.policyHolder.cellPhone);
                        $scope.PolicyDetails.policyHolder.eveningTimePhone = $filter('tel')($scope.PolicyDetails.policyHolder.eveningTimePhone);
                        $scope.PolicyDetails.policyHolder.dayTimePhone = $filter('tel')($scope.PolicyDetails.policyHolder.dayTimePhone);
                        if ($scope.PolicyDetails.policyHolder.address === null) {
                            $scope.PolicyDetails.policyHolder.address = { "streetAddressOne": null, "streetAddressTwo": null, "city": null, "state": { id: null }, "zipcode": null };
                        }else{
                           $scope.PolicyDetails.propertyAddress.phState= $scope.PolicyDetails.policyHolder.address.state.id;
                           $scope.PolicyDetails.propertyAddress.plState= $scope.PolicyDetails.propertyAddress.state.id;

                        }



                    }
                    $scope.ClaimCategoryWithCovers = $filter('filter')(success.data.data.categories, { isDefault: false });
                    var list = $filter('filter')(success.data.data.categories, { isDefault: true });
                    if (angular.isDefined(list) && list !== null) {
                        if (list.length > 0) {
                            angular.forEach(list, function (item) {
                                $scope.DefaultCategoryCoverage.push({
                                    "id": item.id,
                                    "name": item.name,
                                    "coverageLimit": item.coverageLimit,
                                    "specialLimit": item.specialLimit,
                                    "deductible": item.deductible
                                });
                            });
                        }
                    }
                    $scope.GetDamageTypes();
                    if (success.data.data.homeownerPolicyType !== null && angular.isDefined(success.data.data.homeownerPolicyType)) {
                        var listobj = $filter('filter')($scope.DdlSourcePolicyType, { typeName: success.data.data.homeownerPolicyType.typeName });
                    }
                    else
                        var listobj = null;
                    if (listobj !== null && angular.isDefined(listobj)) {

                        $scope.PolicyDetails.homeownerPolicyType.id = listobj[0].id;

                    }
                    else {
                        if (success.data.data.homeownerPolicyType !== null && angular.isDefined(success.data.data.homeownerPolicyType))
                            listobj = $filter('filter')($scope.DdlSourcePolicyType, { typeName: success.data.data.homeownerPolicyType.typeName });
                    }
                }
                else {
                    $scope.PolicyExists = "Policy number does not exists. Create new policy.";
                    $scope.CreatePolicybutton = true;
                }
            }, function (error) {
                //Error Message
                $scope.PolicyExists = "Policy number does not exists. Create new policy.";
                $scope.CreatePolicybutton = true;
                $scope.ErrorMessage = error.data.errorMessage;
            });
        }
        else {
            $scope.PolicyDetails.policyNumber = null;
            $scope.PolicyExists = "Please enter policy #.";
        }
    }

    //Get policy holder information on email
    $scope.GetPolicyHolderInfo = GetPolicyHolderInfo;
    function GetPolicyHolderInfo() {
        var param = { "email": $scope.PolicyDetails.policyHolder.email };
        var HolderDetails = PropertyFNOLRequestService.GetPolicyHolderDetails(param);
        HolderDetails.then(function (success) {
            if (success.data.data !== null && (angular.isDefined(success.data.data))) {
                $scope.PolicyDetails.policyHolder = success.data.data;
                if (success.data.data.policyHolder !== null || angular.isUndefined(success.data.data.policyHolder)) {
                    $scope.PolicyDetails.policyHolder.cellPhone = $filter('tel')($scope.PolicyDetails.policyHolder.cellPhone);
                    $scope.PolicyDetails.policyHolder.eveningTimePhone = $filter('tel')($scope.PolicyDetails.policyHolder.eveningTimePhone);
                    $scope.PolicyDetails.policyHolder.dayTimePhone = $filter('tel')($scope.PolicyDetails.policyHolder.dayTimePhone);
                }
                if ($scope.PolicyDetails.policyHolder.address === null) {
                    $scope.PolicyDetails.policyHolder.address = { "streetAddressOne": null, "streetAddressTwo": null, "city": null, "state": { id: null }, "zipcode": null };
                }
            }

        }, function (error) {
            $scope.ErrorMessage = error.data.message;
        })
    }
    //// Reset holder information if not found  on email
    //function ResetPolicyHolderInfo() {
    //    $scope.PolicyDetails.policyHolder.firstName = "";
    //    $scope.PolicyDetails.policyHolder.lastName = "";
    //    $scope.PolicyDetails.policyHolder.email = "";
    //    $scope.CellPhoneFirst = ""; $scope.CellPhoneSecond = ""; $scope.CellPhoneThird = "";
    //    $scope.EveningPhoneFirst = ""; $scope.EveningPhoneSecond = ""; $scope.EveningPhoneThird = "";
    //    $scope.DayPhoneFirst = ""; $scope.DayPhoneSecond = ""; $scope.DayPhoneThird = "";
    //    $scope.PolicyDetails.policyHolder.address.streetAddress = "";
    //    $scope.PolicyDetails.policyHolder.address.city = "";
    //    $scope.PolicyDetails.policyHolder.address.state.id = "";
    //    $scope.PolicyDetails.policyHolder.address.zipcode = "";
    //}
    //Assign Claim to adjuster
    $scope.AssignClaimToAdjuster = AssignClaimToAdjuster;
    function AssignClaimToAdjuster(ev) {
        var obj = {
            //On claimid genertaion pass it
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

    //Add item in list of category of items
    //Change category name to name
    $scope.CreateItemList = CreateItemList;
    function CreateItemList() {
        var flag = [];
        flag = $filter('filter')($scope.ClaimCategoryWithCovers, { categoryId: $scope.CommonObject.ItemCategoryId });
        if (flag !== null) {
            if (flag.length === 0 && $scope.CommonObject.ItemCategoryId !== null) {
                obj = $filter('filter')($scope.DdlClaimCategoryWithCovers, { categoryId: $scope.CommonObject.ItemCategoryId });
                $scope.ClaimCategoryWithCovers.push({
                    coverageLimit: obj[0].coverageLimit,
                    deductible: obj[0].deductible,
                    description: obj[0].description,
                    id: obj[0].categoryId,
                    isDefault: false,
                    name: obj[0].categoryName,
                    specialLimit: null
                });
            }
        }
        else {
            var obj = $filter('filter')($scope.DdlClaimCategoryWithCovers, { categoryId: $scope.CommonObject.ItemCategoryId });
            $scope.ClaimCategoryWithCovers = [];
            $scope.ClaimCategoryWithCovers.push({
                coverageLimit: obj[0].coverageLimit,
                deductible: obj[0].deductible,
                description: obj[0].description,
                id: obj[0].categoryId,
                isDefault: false,
                name: obj[0].categoryName,
                specialLimit: null
            });
        }
    }

    //Get Account details on acc number and policy on account no
    $scope.PolicyListWithDetails = [];
    $scope.PolicyList = [];
    $scope.GetAccountDetails = GetAccountDetails;
    function GetAccountDetails() {
        $scope.PolicyExists = ""; $scope.AccountExists = "";
        if ((angular.isDefined($scope.PolicyDetails.insuranceNumber)) && ($scope.PolicyDetails.insuranceNumber !== null)) {
            var paramAccNO = { "insuranceNumber": $scope.PolicyDetails.insuranceNumber };

            var policyDetailsList = PropertyFNOLRequestService.GetListOfPolicyForAccNo(paramAccNO);
            policyDetailsList.then(function (success) {
                $scope.PolicyDetails.insuranceNumber = paramAccNO.insuranceNumber;
                $scope.PolicyListWithDetails = success.data.data;
                if ($scope.PolicyListWithDetails != null && $scope.PolicyListWithDetails.length > 0) {
                    $scope.ShowPolicyDropdown = true;
                    $scope.ShowPolicyTextbox = false;
                    $scope.PolicyList = [];
                    angular.forEach($scope.PolicyListWithDetails, function (item) {
                        $scope.PolicyList.push(item.policyNumber);
                    });
                }
                else {
                    $scope.ShowPolicyDropdown = false;
                    $scope.ShowPolicyTextbox = true;
                    $scope.PolicyListWithDetails = [];
                    $scope.PolicyList = [];
                    $scope.AccountExists = "Account number does not exists."
                }
            }, function (error) { $scope.PolicyList = []; });
        }
        else {
            $scope.PolicyDetails.insuranceNumber = null;
            $scope.AccountExists = "Please enter account#.";
        }
    }


    //Remove Category from list (From Ui only)
    $scope.DeleteItemCategory = DeleteItemCategory;
    function DeleteItemCategory(item) {
        var index = $scope.ClaimCategoryWithCovers.indexOf(item);
        $scope.ClaimCategoryWithCovers.splice(index, 1);
    }

    // Default category coverage
    $scope.DefaultCategoryCoverage = [];
    $scope.SetDefaultCategoryCoverage = SetDefaultCategoryCoverage;
    function SetDefaultCategoryCoverage() {
        $scope.DefaultCategoryCoverage = [];
        $scope.PolicyDetails.totalSpecialLimit = 0.0;
        var flag = $filter('filter')($scope.DdlSourcePolicyType, { id: $scope.PolicyDetails.homeownerPolicyType.id });
        if (flag.length !== 0 && $scope.PolicyDetails.homeownerPolicyType.id !== null) {
            angular.forEach(flag[0].categories, function (item) {
                $scope.DefaultCategoryCoverage.push({
                    "id": item.id,
                    "name": item.name,
                    "coverageLimit": item.coverageLimit,
                    "specialLimit": item.specialLimit,
                    "deductible": item.deductible,
                    "isDefault": true
                });
                $scope.PolicyDetails.totalSpecialLimit = (parseFloat($scope.PolicyDetails.totalSpecialLimit) + ((item.coverageLimit !== null) ? parseFloat(item.coverageLimit) : 0)).toFixed(2);
            });
            $scope.PolicyDetails.totalCoverage = flag[0].totalCoverage;
            //$scope.PolicyDetails.totalSpecialLimit = flag[0].totalDeductible;
            $scope.PolicyDetails.totalDetuctibleAmount = flag[0].totalDeductible;
            $scope.PolicyDetails.propertyCoverage = (($scope.PolicyDetails.totalCoverage !== null && angular.isDefined($scope.PolicyDetails.totalCoverage) ? (($scope.PolicyDetails.totalCoverage>0)?((parseFloat($scope.PolicyDetails.totalCoverage))/2).toFixed(2):0) : null))
        }
    }
    //Change porperty coverage for policy on policy covergae change
    $scope.ChangePropertyCoverage = ChangePropertyCoverage;
    function ChangePropertyCoverage()
    {
        $scope.PolicyDetails.propertyCoverage = (($scope.PolicyDetails.totalCoverage !== null && angular.isDefined($scope.PolicyDetails.totalCoverage) ? (($scope.PolicyDetails.totalCoverage > 0) ? ((parseFloat($scope.PolicyDetails.totalCoverage)) / 2).toFixed(2) : 0) : null))
    }
    $scope.DeleteDefaultCategory = DeleteDefaultCategory;
    function DeleteDefaultCategory(item) {
        $scope.DefaultCategoryCoverage.splice($scope.DefaultCategoryCoverage.indexOf(item), 1);
    }
    //End Default category coverage

    //Images Of Incident
    $scope.IncidentImages = []
    $scope.ShowIncidentImages = ShowIncidentImages;
    function ShowIncidentImages() {

    }

    //Lost Damge items section
    //Filter Item Category wise
    $scope.FilterLostDamageOnCategory = FilterLostDamageOnCategory;
    function FilterLostDamageOnCategory() {
        if (($scope.CommonObject.SearchItemCategory === "ALL") || (angular.isUndefined($scope.CommonObject.SearchItemCategory) || $scope.CommonObject.SearchItemCategory === null))
            $scope.FiletrLostDamageList = $scope.LostDamagedItemList;
        else
            $scope.FiletrLostDamageList = $filter('filter')($scope.LostDamagedItemList, { categoryName: $scope.CommonObject.SearchItemCategory });
    }

    //Inline Edit show
    $scope.selected = {};
    $scope.AddNewItem = false;
    $scope.AddNewItemToList = AddNewItemToList;
    function AddNewItemToList() {
        if ($scope.DisableAssignbtn === false) {
            $scope.selected = {};
            $scope.selected.scheduled = false;
            $scope.AddNewItem = true;
        }
        else {
            toastr.remove();
            toastr.warning($translate.instant('AddItemWarning.Message'), $translate.instant('AddItemWarning.Title'));
        }
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
        $scope.selected = {};
        $scope.selected = angular.copy(item);
        $scope.OriginalPostLossIndex = $scope.FiletrLostDamageList.indexOf(item);

        $scope.OriginalPostLossItem = angular.copy(item);
        //get Item Category #96
        var CategoryPromise = PropertyFNOLRequestService.GetItemCategory();
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
                    "claimNumber": $scope.PolicyDetails.claimNumber,
                    "dateOfPurchase": (($scope.selected.dateOfPurchase === null || angular.isUndefined($scope.selected.dateOfPurchase)) ? null : $scope.selected.dateOfPurchase),
                    "depriciationRate": null,
                    "description": $scope.selected.description,
                    "holdOverPaymentDate": null,
                    "holdOverPaymentMode": null,
                    "holdOverPaymentPaidAmount": null,
                    "holdOverValue": null,
                    "insuredPrice": $scope.selected.price,
                    "isReplaced": null,
                    "isScheduledItem": $scope.selected.scheduled,
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
            var UpdatePostLoss = PropertyFNOLRequestService.UpdatePostLoss(param);
            UpdatePostLoss.then(function (success) {
                var obj = MakeObjectToAddInList(success);
                obj.status = $scope.OriginalPostLossItem.status;
                $scope.FiletrLostDamageList[$scope.OriginalPostLossIndex] = obj;
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
                    "claimNumber": $scope.PolicyDetails.claimNumber,
                    "dateOfPurchase": (($scope.selected.dateOfPurchase === null || angular.isUndefined($scope.selected.dateOfPurchase)) ? null : $scope.selected.dateOfPurchase),
                    "depriciationRate": null,
                    "description": $scope.selected.description,
                    "holdOverPaymentDate": null,
                    "holdOverPaymentMode": null,
                    "holdOverPaymentPaidAmount": null,
                    "holdOverValue": null,
                    "insuredPrice": $scope.selected.price,
                    "isReplaced": null,
                    "isScheduledItem": $scope.selected.scheduled,
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
            var SavePostLossItem = PropertyFNOLRequestService.AddPostLossItem(param);
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
        $scope.selected = {};
    };
    //Get Lost/ damage items
    function GetLostDamageItem() {
        //Get Lost Damage Item   API #78   Pass Claim Id after saving the claim details and policy details
        var ParamClaimId = {
            "claimId": sessionStorage.getItem("ManagerScreenClaimId")
        };
        var GetLostItem = PropertyFNOLRequestService.getPostLostItems(ParamClaimId);
        GetLostItem.then(function (success) {

            $scope.LostDamagedItemList = success.data.data;
            $scope.FiletrLostDamageList = success.data.data;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            $scope.LostDamagedItemList = [];
        });
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
                    var response = PropertyFNOLRequestService.DeleteLostDamageItem(paramIdList);
                    response.then(function (success) { //Filter list and remove item
                        toastr.remove();
                        toastr.success(success.data.message, "Confirmation");
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
    //End lost damage

    $scope.GoBack = GoBack;
    function GoBack() {
        $location.url('ManagerDashboard');
    }

    //Create Policy and get damage types
   
    $scope.createPolicy = createPolicy;
    function createPolicy() {
        $('.page-spinner-bar').removeClass('hide');
        var eveningTimePhone = "";
        if ($scope.PolicyDetails.policyHolder.eveningTimePhone) {
          eveningTimePhone = $scope.PolicyDetails.policyHolder.eveningTimePhone.replace(
            /[^0-9]/g,
            ""
          );
        }
        var cellPhone = "";
        if($scope.PolicyDetails.policyHolder.cellPhone){
            cellPhone = $scope.PolicyDetails.policyHolder.cellPhone.replace(/[^0-9]/g, '')
        }
        var dayTimePhone = "";
        if($scope.PolicyDetails.policyHolder.dayTimePhone){
            dayTimePhone = $scope.PolicyDetails.policyHolder.dayTimePhone.replace(/[^0-9]/g, '')
        }
       
        var Policydata = {
            "homeOwnerPolicyTypeId": $scope.PolicyDetails.homeownerPolicyType.id.toString(),
            "totalPolicyCoverage": $scope.PolicyDetails.totalCoverage,
            "propertyCoverage": $scope.PolicyDetails.propertyCoverage,
            "totalSpecialLimit": $scope.PolicyDetails.totalSpecialLimit,
            "totalDetuctableAmount": $scope.PolicyDetails.totalDetuctibleAmount,
            "policyType": $scope.PolicyDetails.policyType,
            "policyNumber": $scope.PolicyDetails.policyNumber,
            "policyName": $scope.PolicyDetails.policyName,
            "claimManagerId":sessionStorage.getItem("UserId"),
            "companyId": sessionStorage.getItem("CompanyId"),
            "propertyAddress": ($scope.PolicyDetails.propertyAddress!==null && angular.isDefined($scope.PolicyDetails.propertyAddress))?{
                "streetAddressOne": $scope.PolicyDetails.propertyAddress.streetAddressOne,
                "streetAddressTwo": $scope.PolicyDetails.propertyAddress.streetAddressTwo,
                "city": $scope.PolicyDetails.propertyAddress.city,
                "state": {
                    "id": ((angular.isDefined($scope.PolicyDetails.propertyAddress.plState) && ($scope.PolicyDetails.propertyAddress.plState !== null)) ? $scope.PolicyDetails.propertyAddress.plState : null)
                },
                "zipcode": $scope.PolicyDetails.propertyAddress.zipcode
            }:null,
            "agentId": $scope.PolicyDetails.policyHolder.agentDetails && $scope.PolicyDetails.policyHolder.agentDetails.agentId ? $scope.PolicyDetails.policyHolder.agentDetails.agentId : null,
            "categories": $scope.DefaultCategoryCoverage,
            "insuranceAccountDetails": {
                "insuranceAccountNumber": $scope.PolicyDetails.insuranceNumber
            },
            "policyHolder": {
                "firstName": $scope.PolicyDetails.policyHolder.firstName,
                "lastName": $scope.PolicyDetails.policyHolder.lastName,
                "email": $scope.PolicyDetails.policyHolder.email,
                "cellPhone": cellPhone,
                "eveningTimePhone": eveningTimePhone,
                "dayTimePhone": dayTimePhone,
                "address":($scope.PolicyDetails.policyHolder.address!==null && angular.isDefined($scope.PolicyDetails.policyHolder.address) )? {
                    "streetAddressOne": $scope.PolicyDetails.policyHolder.address.streetAddressOne,
                    "streetAddressTwo": $scope.PolicyDetails.policyHolder.address.streetAddressTwo,
                    "city": $scope.PolicyDetails.policyHolder.address.city,
                    "state": {
                        "id": $scope.PolicyDetails.propertyAddress.phState
                    },
                    "zipcode": $scope.PolicyDetails.policyHolder.address.zipcode
                } : null
            }
        };

        var promiseCreatePolicy = PropertyFNOLRequestService.createHomePolicy(Policydata);
        promiseCreatePolicy.then(function (success) {
            $scope.PolicyDetails.policyNumber = success.data.data.policyNumber;
            // Hide create policy button
            $scope.CreatePolicybutton = false;
            $scope.GetDamageTypes(); $scope.PolicyExists = ""; $scope.PolicyExists = "";
            $('.page-spinner-bar').addClass('hide');
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
        }, function (error) {
            var msg = $translate.instant('PolicyCreation.ErroMessage');
            if (error.data !== null) {
                msg = error.data.errorMessage;
            }
            else
                msg = $translate.instant('PolicyCreation.ErroMessage');
            $scope.ErrorMessage = error.data.errorMessage;
            $('.page-spinner-bar').addClass('hide');
            toastr.remove();
            toastr.error(msg, "Error");

        });
    }
    //end
    //Get damage types
    $scope.DamageTypesList = [];
    $scope.GetDamageTypes = GetDamageTypes;
    function GetDamageTypes() {
        var policyNoparam = {
            "policyNumber": $scope.PolicyDetails.policyNumber
        };
        var GetDamageTypes = PropertyFNOLRequestService.getDamageType(policyNoparam);
        GetDamageTypes.then(function (success) {
            $scope.DamageTypesList = success.data.data;
        }, function (error) { $scope.DamageTypesList = null;
        });
    }

    //Set question on damage type
    $scope.SetQuestionForDamageType = SetQuestionForDamageType;
    function SetQuestionForDamageType() {
        $scope.SeletedDamageTypeObject = $filter('filter')($scope.DamageTypesList, { id: $scope.claimDetails.damageTypeId });
        $scope.QuestionList = $scope.SeletedDamageTypeObject[0].questions;
    }
    //end damage type

    $scope.GetSubCategory = GetSubCategory;
    function GetSubCategory() {
        var param = {
            "categoryId": $scope.selected.categoryId
        };
        var respGetSubCategory = PropertyFNOLRequestService.GetSubCategory(param);
        respGetSubCategory.then(function (success) { $scope.SubCategory = success.data.data; }, function (error) { $scope.SubCategory = null; $scope.ErrorMessage = error.data.errorMessage });

    }

    //Save Claim with Report Details
    $scope.SaveClaimReportDetails = SaveClaimReportDetails;
    function SaveClaimReportDetails() {
        $scope.PolicyExists = ""; $scope.PolicyExists = "";
        $scope.claimDetails.policyCategoryCoverages = [];
        angular.forEach($scope.ClaimCategoryWithCovers, function (item) {
            $scope.claimDetails.policyCategoryCoverages.push({ "categoryId": item.id, "coverageLimit": item.coverageLimit });
        });

        var IsACV; var IsRCV;
        if (angular.isUndefined($scope.claimDetails.isRCV))
            IsRCV = false;
        else
            IsRCV = true;

        if (angular.isUndefined($scope.claimDetails.isACV))
            IsACV = false;
        else
            IsACV = true;


        var ClaimandReportDetails = new FormData();
        var FileDetails = [];
        angular.forEach($scope.IncidentImages, function (item) {
            FileDetails.push({
                "fileName": item.FileName, "fileType": "Image",
                "extension": item.FileExtension,
                "filePurpose": "Claim", "latitude": null, "longitude": null,
                "footNote": "No foot note"
            });

            ClaimandReportDetails.append("file", item.File);
        });

        ClaimandReportDetails.append("filesDetails", JSON.stringify(FileDetails));

        $scope.Questions = [];
        angular.forEach($scope.QuestionList, function (item) {
            var ans = { "id": null, "answer": null };
            if (item.type === "SELECT") {
                ans = { "id": item.answer, "answer": item.answer }
            }
            else if (item.type === "BOOLEAN") {
                if (item.answer === "TRUE")
                    ans = { "id": 0, "answer": item.answer }
                else
                    ans = { "id": 1, "answer": item.answer }
            }
            else
                ans = { "id": null, "answer": item.answer };
            if (item.type !== "IMAGE")
                $scope.Questions.push({ "id": item.id, "question": item.question, "answers": null, "answer": ans });
        });

        ClaimandReportDetails.append("claimDetails", JSON.stringify({
            "claimNumber": $scope.PolicyDetails.claimNumber,
            "policyNumber": $scope.PolicyDetails.policyNumber,
            "claimType": $scope.PolicyDetails.claimType,
            "taxRate": $scope.claimDetails.taxRate,
            "damageTypeId": $scope.claimDetails.damageTypeId,
            "incidentDate": $filter('DatabaseDateFormatMMddyyyy')($scope.PolicyDetails.incidentDate),
            "incidentDescription": (($scope.PolicyDetails.incidentDescription !== null && angular.isDefined($scope.PolicyDetails.incidentDescription))?$scope.PolicyDetails.incidentDescription:null),
            "isACV": true, "isRCV": false,
            "policyCategoryCoverages": $scope.claimDetails.policyCategoryCoverages,
            "questions": $scope.Questions,
            "claimNote": $scope.claimDetails.claimNote
        }
        ));

        //Save details
        var SaveDetails = PropertyFNOLRequestService.SaveClaimandReportDetails(ClaimandReportDetails);
        SaveDetails.then(function (success) {
            $scope.CommonObject.ClaimNo = success.data.data.claimNumber;
            $scope.PolicyDetails.claimNumber = success.data.data.claimNumber;
            $scope.CommonObject.ClaimId = success.data.data.claimId;
            sessionStorage.setItem("ManagerScreenClaimId", success.data.data.claimId);
            if (success.data.data.claimNumber != null) {
                $scope.DisableAssignbtn = false;

                toastr.remove();
                toastr.success(success.data.message + "<br>FNOL# " + success.data.data.claimNumber + ".", "Confirmation");
            }
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }

    //upload image
    $scope.uploadImage = uploadImage;
    function uploadImage(event) {
        var files = event.target.files;
        $scope.filed = event.target.files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.file = file;
            reader.fileName = files[i].name;
            reader.fileType = files[i].type;
            reader.fileExtension = files[i].name.substr(files[i].name.lastIndexOf('.'));
            reader.onload = $scope.imageIsLoaded;
            reader.readAsDataURL(file);
        }
    }
    $scope.imageIsLoaded = function (e) {
        $scope.$apply(function () {
            $scope.IncidentImages.push({ "FileName": e.target.fileName, "FileExtension": e.target.fileExtension, "FileType": e.target.fileType, "Image": e.target.result, "File": e.target.file })
        });
    }

    $scope.RemoveImage = RemoveImage;
    function RemoveImage(item) {

        var index = $scope.IncidentImages.indexOf(item);

        if (index > -1) {

            $scope.IncidentImages.splice(index, 1);
        }
    }

    //Open file upload control
    $scope.FireUploadEvent = FireUploadEvent;
    function FireUploadEvent() {
        angular.element('#FileUpload').trigger('click');
    }

    //Hide dropdown and show textbox
    $scope.NewPolicy = NewPolicy;
    function NewPolicy() {
        $scope.ShowPolicyDropdown = false;
        $scope.ShowPolicyTextbox = true;
    }
    //Upload post loss item from file
    $scope.UploadPostLossItem = function () {
        if ($scope.CommonObject.ClaimNo !== null && angular.isDefined($scope.CommonObject.ClaimNo)) {
            sessionStorage.setItem("UploadClaimNo", $scope.CommonObject.ClaimNo);
            $location.url('UploadItemsFromCSV')
        }
    }
    $scope.SendApp = SendApp;
    function SendApp() {
        bootbox.alert({
            size: "",
            title: "Status",
            closeButton: false,
            message: "Text sent to insured with link for download.",
            className: "modalcustom",
            callback: function () { /* your callback code */ }
        });
    }
});
