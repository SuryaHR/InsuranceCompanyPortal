angular.module('MetronicApp')
    /* Directive for File Drag and Drop */
    .directive('filedropzone', ['$log', function ($log) {
        return {
            restrict: 'A',
            scope: false,
            // scope: {
            //     dropfiles: '=' //One way to return your drop file data to your controller
            // },
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
                                    FileName: fileName,
                                    FileType: type,
                                    Image: base64,
                                    FileExtension: extension,
                                    isLocal: true
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
    .directive('draggable', function () {
        return {
            restrict: 'A',
            link: function (scope, elm, attrs) {
                var options = scope.$eval(attrs.draggable); //allow options to be passed in
                elm.draggable(options);
            }
        };
    }).controller('NewClaimController', function ($window, $rootScope, $filter, $state, $scope, $translate, $translatePartialLoader, $location,
        NewClaimService, AuthHeaderService, utilityMethods, $timeout, $uibModal,LineItemsFactory) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });
        // $scope.$watch('ShippingDate', function (value) {
        //     console.log("shipping date",value);
        // });
        $translatePartialLoader.addPart('NewClaim');
        $translate.refresh();
        $scope.step1 = true;
        $scope.step2 = false;
        $scope.StateList = [];
        $scope.PolicyDetails = {};
        $scope.addCatCov = false;
        $scope.selected = {
            isScheduledItem: false
        };
        $scope.newRetailer = false;
        $scope.DdlSourcePolicyType = [];
        $scope.ClaimCategoryWithCovers = [];
        $scope.FiletrLostDamageList = [];
        $scope.OriginalPostLossItem = [];
        $scope.selectedCategory = [];
        $scope.SelectedPostLostItems = [];
        $scope.NewItemList =[];
        $scope.LostDamagedContentByCategory = [];
        $scope.pagesize = 10;
        $scope.ShowAddItemDiv = false;
        $scope.maxItemNo = 0;
        $scope.DisablePolicyNextBtn = true;
        $scope.DisableClaimNextBtn = true;
        $scope.SelectedVendorDetails = {};
        $scope.VendorId;
        $scope.InsuranceCompanyName = null;
        $scope.isItemUploaded;
        $scope.branchId = null;

        $scope.branchId = angular.isDefined(sessionStorage.getItem('BranchId')) && sessionStorage.getItem('BranchId') != null && sessionStorage.getItem('BranchId') != '' ? sessionStorage.getItem('BranchId') : null;
        $scope.shippingMethodsList = [];
        $scope.SelectedVendorPostLossItem = [];
        $scope.ShippingDate = "";
        $scope.ShippingMethod = {};
        $scope.claimDetails = {};
        $scope.limit = 30;
        $scope.moreShown = false;
        var itemCategoryIds = [];
        $scope.reverseVendorsList = false;
        $scope.vendorSortKey = '';
        $scope.searchVendorsKeyword = '';
        var isClaimCreationMailTriggered = false;
        $scope.disableAddCoverage = false;
        // Pagination
        $scope.totalVendors = 0;
        $scope.vendorPage = 1;
        $scope.lastRowCount = 0;
        $scope.currentPage = 1;
        $scope.specialLimit = 25000;
        $scope.videoLinkEditable = true;
        $scope.lossCouseType = {};
        $scope.savedDetails = false;
        $scope.IncidentImages = [];
        $scope.savedAddedItems = false;
        $scope.ThirdPartyAdjusting = sessionStorage.getItem("ThirdPartyAdjusting") != null ? sessionStorage.getItem("ThirdPartyAdjusting") : null;
        var PolicyNumber;
        var CustAccNumber;
        function init() {
            $(".page-spinner-bar").removeClass("hide");
            PolicyNumber = "";
            CustAccNumber = "";
            $scope.PolicyDetails = {
                "policyType": "HOME",
                "claimType": "HOME"
            };
            $scope.SinglePageWizard = null;
            $scope.InsuranceCompanyName = sessionStorage.getItem("InsuranceCompanyName");
            $scope.imgDiv = false;

            $scope.claimProfile = sessionStorage.getItem("claimProfile");
            $scope.CurrentWizard = 'PolicyInfo';
            $scope.CurrentStepNo = 1;
            $scope.JewelryVendorDetails = {};
            $scope.CommonObject =
            {
                CompanyId: sessionStorage.getItem("CompanyId"),
                ClaimId: "",
                ClaimNumber: "",
                Categories: "ALL",
                BranchCode: null,
                BranchId: null,
                CRN: sessionStorage.getItem("CRN")
            };
            if ($scope.claimProfile.toLowerCase() === "jewelry") {
                $scope.ArtigemVendor =
                {
                    VendorId: null,
                    name: ''
                };
                $scope.SinglePageWizard = true;
                $scope.JewelryVendorDetails = {
                    RegistartionNumber: sessionStorage.getItem("jewelryVendor"),
                    //id: 19
                };
                GetCategory();
                //GetVendorsList();
                //GetPolicyType("");
                GetLossTypes();
                GetShippingMethods();
            }
            else if ($scope.claimProfile == "Contents") {
                $scope.SinglePageWizard = false;
                $scope.isItemUploaded = sessionStorage.getItem("isItemUploaded");
                if ($scope.isItemUploaded == 'true') {
                    $scope.PolicyDetails = JSON.parse(sessionStorage.getItem("PolicyDetails"));
                    $scope.claimDetails = JSON.parse(sessionStorage.getItem("ClaimDetails"));
                    //$scope.selectedCategory = JSON.parse(sessionStorage.getItem("SelectedCategory"));
                    $scope.IncidentImages = JSON.parse(sessionStorage.getItem("IncidentImages"));
                    $scope.savedDetails = sessionStorage.getItem("savedDetails");
                    $scope.CommonObject.ClaimNumber = $scope.PolicyDetails.claimNumber;
                    $scope.step1 = false;
                    $scope.step2 = true;
                    ShowCurrentWizard('ClaimItem', 2);
                    GetPostLostItems();
                    getRetailers();
                    getRooms();
                    GetLossTypes();
                    GetPolicyType($scope.PolicyDetails.policyHolder.address.state.id);
                }
                else if ($scope.isItemUploaded == 'false') {
                    //GetPolicyType("");
                    GetLossTypes();
                }
                GetCategory();
            }
            GetStateList();
            // $(".page-spinner-bar").addClass("hide");
            if($scope.CommonObj?.ClaimProfile===undefined)
            {
                $scope.CommonObj ={
                    ClaimProfile : sessionStorage.getItem("claimProfile")
                }
            }

            if($scope.CommonObj.ClaimProfile == "Jewelry"){
                GetVendorsList();
                GetCompanyBranchList();
            }
        }
        init();

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

        $scope.GetStateList = GetStateList;
        function GetStateList() {
            $(".page-spinner-bar").removeClass("hide");
            var param =
            {
                "isTaxRate": false,
                "isTimeZone": false
            };
            var GetStates = NewClaimService.getStates(param);
            GetStates.then(function (success) {
                $scope.StateList = success.data.data;
            }, function (error) { });
        };

        $scope.GetPolicyType = GetPolicyType
        function GetPolicyType(param) {
            $(".page-spinner-bar").removeClass("hide");
            //API#95
            var policyTypes = NewClaimService.getPolicyType(param);
            policyTypes.then(function (success) {
                $scope.DdlSourcePolicyType = success.data.data;
                if($scope.CommonObj.ClaimProfile.toLowerCase() !=="jewelry")
                $scope.selectedCategory = null;
                $scope.showSpecialLimit = false;
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage; $(".page-spinner-bar").addClass("hide");
            });
        }

        $scope.GetLossTypes = GetLossTypes;
        function GetLossTypes() {
            $(".page-spinner-bar").removeClass("hide");
            var GetLossTypesList = NewClaimService.getLossTypes();
            GetLossTypesList.then(function (success) {
                $scope.LossTypeList = success.data.data;
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                $(".page-spinner-bar").addClass("hide");
                $scope.ErrorMessage = error.data.errorMessage;
            });
        };

        $scope.calculateMaxItemNo = calculateMaxItemNo;
        function calculateMaxItemNo() {
            if (angular.isDefined($scope.selected.itemNumber)) {
                $scope.selected.itemNumber = parseInt($scope.FiletrLostDamageList == null ? 0 : $scope.FiletrLostDamageList.length) + 1;
            }

        }

       
        $scope.ShowCurrentWizard = ShowCurrentWizard;
        function ShowCurrentWizard(currentDiv, step) {
            $scope.CurrentWizard = currentDiv;
            $scope.CurrentStepNo = step;
            $window.scrollTo(0, 0);
        }
        //Get policy holder information on email
        $scope.GetPolicyHolderInfo = GetPolicyHolderInfo;
        function GetPolicyHolderInfo() {
            if (angular.isDefined($scope.PolicyDetails.policyHolder)) {
                var param = { "email": $scope.PolicyDetails.policyHolder.email };
                var HolderDetails = NewClaimService.GetPolicyHolderDetails(param);
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
                    toastr.remove();
                    toastr.error(error.data.errorMessage, "Attention");
                })
            }
        }

        $scope.Cancel = Cancel;
        function Cancel() {
            $scope.CurrentWizard = 'PolicyInfo';
            $scope.CurrentStepNo = 1;
        };


        $scope.GoToDashboard = GoToDashboard;
        function GoToDashboard() {
            $location.url(sessionStorage.getItem('HomeScreen'));
        }

        $scope.CancelNewClaim = function () {
            $location.url('AdjusterDashboard');
        }

        $scope.PolicyDetails.dt = $filter('date')(new Date(), "dd/MM/yyyy");
        $scope.ResetPhoneNumbers = ResetPhoneNumbers;
        function ResetPhoneNumbers() {
            $scope.CellPhoneFirst = null; $scope.CellPhoneSecond = null; $scope.CellPhoneThird = null;
            $scope.DayPhoneFirst = null; $scope.DayPhoneSecond = null; $scope.DayPhoneThird = null;
            $scope.EveningPhoneFirst = null; $scope.EveningPhoneSecond = null; $scope.EveningPhoneThird = null;
        }

        //Get Account details on acc number and policy on account no
        $scope.PolicyListWithDetails = [];
        $scope.PolicyList = [];
        $scope.GetAccountDetails = GetAccountDetails;
        function GetAccountDetails() {
            $(".page-spinner-bar").removeClass("hide");
            $scope.PolicyExists = ""; $scope.AccountExists = "";
            if ((angular.isDefined($scope.PolicyDetails.insuranceNumber)) && ($scope.PolicyDetails.insuranceNumber !== null)) {
                var paramAccNO = { "insuranceNumber": $scope.PolicyDetails.insuranceNumber };

                var policyDetailsList = NewClaimService.GetListOfPolicyForAccNo(paramAccNO);
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
                    $(".page-spinner-bar").addClass("hide");
                }, function (error) {
                    $scope.PolicyList = [];
                    $(".page-spinner-bar").addClass("hide");
                });
            }
            else {
                $(".page-spinner-bar").addClass("hide");
                $scope.PolicyDetails.insuranceNumber = null;
                $scope.AccountExists = "Please enter account#.";
            }
        }

        //Get policya and claim details  API# 184 ""P13PJJ64
        $scope.GetPolicyDetails = GetPolicyDetails;
        function GetPolicyDetails() {
            $(".page-spinner-bar").removeClass("hide");
            $scope.ShowPolicyDropdown = false;
            $scope.ShowPolicyTextbox = true;
            $scope.PolicyExists = "";
            $scope.AccountExists = "";
            if ((angular.isDefined($scope.PolicyDetails.policyNumber)) && ($scope.PolicyDetails.policyNumber !== null)) {
                var paramPolicyNO = {
                    "policyNumber": $scope.PolicyDetails.policyNumber,
                    "claimNumber": null
                };
                var promisePost = NewClaimService.GetPolicyAndClaimDetails(paramPolicyNO);
                promisePost.then(function (success) {
                    $scope.PolicyExists = "";
                    $scope.CreatePolicybutton = false;
                    $scope.DisablePolicyNextBtn = false;//To enabling next button
                    $scope.ResetPhoneNumbers();
                    if (success.data.data !== null) {
                        $scope.PolicyDetails = success.data.data;

                        $scope.SelectclaimType();
                        $scope.PolicyDetails.insuranceNumber = $scope.PolicyDetails.insuraceAccountDetails.insuranceAccountNumber;
                        $scope.PolicyDetails.reportDate = $filter('DateFormatMMddyyyy')($scope.PolicyDetails.reportDate);
                        if (success.data.data.policyHolder !== null || angular.isUndefined(success.data.data.policyHolder)) {
                            $scope.PolicyDetails.policyHolder.cellPhone = $filter('tel')($scope.PolicyDetails.policyHolder.cellPhone);
                            $scope.PolicyDetails.policyHolder.eveningTimePhone = $filter('tel')($scope.PolicyDetails.policyHolder.eveningTimePhone);
                            $scope.PolicyDetails.policyHolder.dayTimePhone = $filter('tel')($scope.PolicyDetails.policyHolder.dayTimePhone);
                            if ($scope.PolicyDetails.policyHolder.address === null) {
                                $scope.PolicyDetails.policyHolder.address = { "streetAddressOne": null, "streetAddressTwo": null, "city": null, "state": { id: null }, "zipcode": null };
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
                                        "deductible": item.deductible,
                                        minimumThreshold: item.minimumThreshold
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
                    $(".page-spinner-bar").addClass("hide");
                }, function (error) {
                    //Error Message
                    $(".page-spinner-bar").addClass("hide");
                    $scope.PolicyExists = "Policy number does not exists. Create new policy.";
                    $scope.CreatePolicybutton = true;
                    $scope.ErrorMessage = error.data.errorMessage;
                });
            }
            else {
                $scope.PolicyDetails.policyNumber = null;
                $scope.PolicyExists = "Please enter policy #.";
                $(".page-spinner-bar").addClass("hide");
            }
        }

        //Set claim type
        $scope.SelectclaimType = function () {

            if ($scope.PolicyDetails.policyType === "HOME")
                $scope.PolicyDetails.claimType = "HOME";
            else if ($scope.PolicyDetails.policyType === "AUTO")
                $scope.PolicyDetails.claimType = "AUTO";
            else
                $scope.PolicyDetails.claimType = "HOME";


        };

        //get damage with template information
        //$scope.getDamage = getDamage;
        //function getDamage(PolicyCoverage) {
        //    $scope.DamageTypesList = [];
        //    var param = {
        //        "totalPolicyCoverage": PolicyCoverage
        //    }
        //    var promise = NewClaimService.GetDamage(param);
        //    promise.then(function (success) {
        //        if (success.data.data !== null) {
        //            $scope.DamageTypesList = success.data.data;
        //        }
        //        else {
        //            $scope.DamageTypesList = [];
        //        }

        //    }, function (error) {
        //        if (error.status === 500 || error.status === 404) {
        //            toastr.remove();
        //            toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
        //        }
        //        else {
        //            toastr.remove();
        //            toastr.error(error.data, errorMessage, "Error");
        //        }
        //        $(".page-spinner-bar").addClass("hide");
        //    });
        //}

        // Default category coverage
        $scope.DefaultCategoryCoverage = [];
        $scope.showSpecialLimit = false;
        $scope.SetDefaultCategoryCoverage = SetDefaultCategoryCoverage;
        function SetDefaultCategoryCoverage() {
            $scope.DefaultCategoryCoverage = [];
            $scope.PolicyDetails.totalSpecialLimit = 0.0;
            // $scope.showSpecialLimit = true;
            var flag = [];
            angular.forEach($scope.DdlSourcePolicyType, function (policyType) {
                if (policyType.id == $scope.PolicyDetails.homeownerPolicyType.id) {
                    flag.push(policyType);
                }
            });
            if (flag.length !== 0 && $scope.PolicyDetails.homeownerPolicyType.id !== null) {
                angular.forEach(flag[0].categories, function (item) {
                    $scope.DefaultCategoryCoverage.push({
                        "id": item.id,
                        "name": item.name,
                        "coverageLimit": item.coverageLimit,
                        "specialLimit": item.specialLimit,
                        "deductible": item.deductible,
                        "minimumThreshold": item.minimumThreshold,
                        "isDefault": true
                    });
                    $scope.PolicyDetails.totalSpecialLimit = (parseFloat($scope.PolicyDetails.totalSpecialLimit) + ((item.coverageLimit !== null) ? parseFloat(item.coverageLimit) : 0)).toFixed(2);
                });

                $scope.PolicyDetails.totalCoverage = flag[0].totalCoverage;
                //$scope.PolicyDetails.totalSpecialLimit = flag[0].totalDeductible;
                $scope.PolicyDetails.totalDetuctibleAmount = flag[0].totalDeductible;
                $scope.PolicyDetails.propertyCoverage = (($scope.PolicyDetails.totalCoverage !== null && angular.isDefined($scope.PolicyDetails.totalCoverage) ? (($scope.PolicyDetails.totalCoverage > 0) ? ((parseFloat($scope.PolicyDetails.totalCoverage)) / 2).toFixed(2) : 0) : null));
                $scope.PolicyDetails.totalThresholdAmount = flag[0].totalThreshold;

                $scope.getCategoryCoverage();

            }
        };


        $scope.PolicyDetails.totalSpecialLimit = 0.0;
        $scope.SumSpecialLimit = SumSpecialLimit;
        function SumSpecialLimit(item) {
            $scope.PolicyDetails.totalSpecialLimit = 0.0;
            angular.forEach($scope.DefaultCategoryCoverage, function (item) {
                $scope.PolicyDetails.totalSpecialLimit = (parseFloat($scope.PolicyDetails.totalSpecialLimit) + ((item.coverageLimit !== null && item.coverageLimit !== "" && item.coverageLimit > 0) ? parseFloat(item.coverageLimit) : 0)).toFixed(2);
            });
        };

        //Remove Category from list (From Ui only)
        $scope.DeleteItemCategory = DeleteItemCategory;
        function DeleteItemCategory(item) {
            var index = $scope.ClaimCategoryWithCovers.indexOf(item);
            $scope.ClaimCategoryWithCovers.splice(index, 1);
        };
        //Remove Default coverages in Policy Details
        $scope.DeleteDefaultCategory = DeleteDefaultCategory;
        function DeleteDefaultCategory(item) {
            $scope.DefaultCategoryCoverage.splice($scope.DefaultCategoryCoverage.indexOf(item), 1);
        };

        //Get damage types
        $scope.DamageTypesList = [];
        $scope.GetDamageTypes = GetDamageTypes;
        function GetDamageTypes() {
            $(".page-spinner-bar").removeClass("hide");
            var policyNoparam = {
                "policyNumber": $scope.PolicyDetails.policyNumber
            };
            var GetDamageTypes = NewClaimService.getDamageType(policyNoparam);
            GetDamageTypes.then(function (success) {
                $scope.DamageTypesList = [];
                $scope.DamageTypesList = success.data.data;
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                $scope.DamageTypesList = null;
                $(".page-spinner-bar").addClass("hide");
            });
        };

        //Set question on damage type
        $scope.SetQuestionForDamageType = SetQuestionForDamageType;
        function SetQuestionForDamageType() {
            //Code Commmented for time being
            //$scope.SeletedDamageTypeObject = $filter('filter')($scope.DamageTypesList, { id: $scope.claimDetails.damageTypeId });
            //$scope.QuestionList = $scope.SeletedDamageTypeObject[0].questions;
        }
        //end damage type
        $scope.GetSubCategory = GetSubCategory;
        function GetSubCategory(id) {
            $(".page-spinner-bar").removeClass("hide");
            var param = { "categoryId": id ? id : $scope.selected.category.id };
            var respGetSubCategory = NewClaimService.GetSubCategory(param);
            respGetSubCategory.then(function (success) {
                $scope.SubCategory = success.data.data;
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                $scope.SubCategory = null; $scope.ErrorMessage = error.data.errorMessage;
                $(".page-spinner-bar").addClass("hide");
            });
            GetCatagoryLimit(id ? id : $scope.selected.category.id);
        }

        $scope.GetCatagoryLimit = GetCatagoryLimit;
        function GetCatagoryLimit(id) {
            //Add Category limit and Individual Item Limit
            var count = 0;
            let isValueUpdated = false;
            angular.forEach($scope.claimDetails.policyCategoryCoverages, function (item) {
                if (item.categoryId == id) {
                    count++
                    if (!$scope.selected.categoryLimit) {
                        $scope.selected.categoryLimit = !item.coverageLimit ? 0 : item.coverageLimit;
                        isValueUpdated = true;
                    }
                    if (!$scope.selected.individualLimitAmount) {
                        $scope.selected.individualLimitAmount = !item.individualItemLimit ? 0 : item.individualItemLimit;
                        isValueUpdated = true;
                    }
                }
            })
            if (count == 0) {
                $scope.selected.categoryLimit = 0;
                $scope.selected.individualLimitAmount = 0;
            }
            if (isValueUpdated)
                $scope.AddItemForm.$setDirty();
        }

        //upload image
        $scope.uploadImage = uploadImage;
        $scope.invalidFile = false;
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
                //20mb
                if (reader.file.size > 20000000) {
                    $scope.$apply(function () {
                        $scope.invalidFile = true;
                    });
                    return false;
                } else {
                    $scope.$apply(function () {
                        $scope.invalidFile = false;
                    });
                }
                reader.onload = $scope.imageIsLoaded;
                reader.readAsDataURL(file);
            }
        }
        $scope.imageIsLoaded = function (e) {
            $scope.$apply(function () {
                var itemExist = false;
                var newFilenm = e.target.fileName
                angular.forEach($scope.IncidentImages, function (item) {
                    var filenm = item.FileName;
                    if (filenm == newFilenm) {
                        itemExist = true;
                    }
                });
                if (!itemExist) {
                    $scope.IncidentImages.push({ "FileName": e.target.fileName, "FileExtension": e.target.fileExtension, "FileType": e.target.fileType, "Image": e.target.result, "File": e.target.file, "isLocal": true })
                } else {
                    toastr.remove();
                    toastr.warning('<b>File <u>' + newFilenm + '</u> is added already! Please add another file.</b>')
                }
                $("#FileUpload").val('');
            });
        }

        $scope.RemoveImage = RemoveImage;
        function RemoveImage(item) {
            $("#FileUpload").val('');
            if ($scope.itemImageList != undefined && $scope.itemImageList != null) {
                $scope.removeJewelryItemattchment($scope.itemImageList, $scope.index);
            } else {
                var index = $scope.IncidentImages.indexOf(item);
                if (index > -1) {
                    $scope.IncidentImages.splice(index, 1);
                }
            }

            $scope.close();
        }

        //Open file upload control
        $scope.FireUploadEvent = FireUploadEvent;
        function FireUploadEvent() {
            angular.element('#FileUpload').trigger('click');
        }

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
                        minimumThreshold: obj[0].minimumThreshold,
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
                    minimumThreshold: obj[0].minimumThreshold,
                    description: obj[0].description,
                    id: obj[0].categoryId,
                    isDefault: false,
                    name: obj[0].categoryName,
                    specialLimit: null
                });
            }
        };

        $scope.NewPolicy = NewPolicy;
        function NewPolicy() {
            $scope.ShowPolicyDropdown = false;
            $scope.ShowPolicyTextbox = true;
            $scope.PolicyDetails.id = null;
        }


        //Add /Update Policy
        $scope.AddUpdatePolicy = AddUpdatePolicy;
        function AddUpdatePolicy() {
            $(".page-spinner-bar").removeClass("hide");
            if ($scope.PolicyDetails.policyNumber !== null && angular.isDefined($scope.PolicyDetails.policyNumber)) {
                var paramUpdate = {
                    "companyId": $scope.CommonObject.CompanyId,
                    "homeOwnerPolicyTypeId": (angular.isDefined($scope.PolicyDetails.homeownerPolicyType) ? $scope.PolicyDetails.homeownerPolicyType.id : null),
                    "policyHolder": {
                        "address": {
                            "city": $scope.PolicyDetails.policyHolder.address.city,
                            "state": {
                                "id": $scope.PolicyDetails.policyHolder.address.state.id,
                                "state": null
                            },
                            "streetAddressOne": $scope.PolicyDetails.policyHolder.address.streetAddressOne,
                            "streetAddressTwo": $scope.PolicyDetails.policyHolder.address.streetAddressTwo,
                            "zipcode": $scope.PolicyDetails.policyHolder.address.zipcode,
                            "completeAddress": $scope.PolicyDetails.policyHolder.address.completeAddress,
                        },
                        "cellPhone": $scope.PolicyDetails.policyHolder.cellPhone ? $scope.PolicyDetails.policyHolder.cellPhone.replace(/[^0-9]/g, '') : null,
                        "eveningTimePhone": $scope.PolicyDetails.policyHolder.dayTimePhone ? $scope.PolicyDetails.policyHolder.dayTimePhone.replace(/[^0-9]/g, '') : null,
                        "dayTimePhone": $scope.PolicyDetails.policyHolder.dayTimePhone ? $scope.PolicyDetails.policyHolder.dayTimePhone.replace(/[^0-9]/g, '') : null,
                        "email": $scope.PolicyDetails.policyHolder.email && $scope.PolicyDetails.policyHolder.email !="" ? $scope.PolicyDetails.policyHolder.email : null,
                        "firstName": $scope.PolicyDetails.policyHolder.firstName,
                        //"insuranceNumber": $scope.PolicyDetails.policyHolder.lastName,
                        "lastName": $scope.PolicyDetails.policyHolder.lastName,
                        "policyHolderId": $scope.PolicyDetails.policyHolder.policyHolderId
                    },
                    "policyNumber": $scope.PolicyDetails.policyNumber,
                    "policyId": $scope.PolicyDetails.id,
                    "policyType": "Property", //property, Auto
                    "policyName": "testPolicyName",
                    "insuranceAccountDetails": {
                        "insuranceAccountNumber": $scope.PolicyDetails && $scope.PolicyDetails.insuranceNumber,
                        "id": $scope.PolicyDetails.insuraceAccountDetails && $scope.PolicyDetails.insuraceAccountDetails.id
                    }
                    //"propertyCoverage": $scope.PolicyDetails.propertyCoverage,
                    //"totalPolicyCoverage": $scope.PolicyDetails.totalCoverage,
                    //"totalSpecialLimit": $scope.PolicyDetails.totalSpecialLimit
                };
                var UpdatePolicyDetails = NewClaimService.UpdatePolicyDetails(paramUpdate);
                UpdatePolicyDetails.then(function (success) {
                    $(".page-spinner-bar").addClass("hide");
                    toastr.remove();
                    toastr.success(success.data.message, "Confirmation");
                    $scope.DisablePolicyNextBtn = false;
                    ShowCurrentWizard("ClaimItem", 2);
                    if($scope.CommonObject.ClaimId != null & $scope.CommonObject.ClaimId != "")
                    updateClaimDetails();
                    else{
                        SaveClaimReportDetails();
                        if($scope.CommonObj.ClaimProfile.toLowerCase =="jewelry")
                        $location.url("AdjusterDashboard");
                    }
                },
                    function (error) {
                        toastr.error();
                        toastr.error(error.data.errorMessage, "Error");
                        $(".page-spinner-bar").addClass("hide");
                    });
            }
            else {
                var param = {
                    "homeOwnerPolicyTypeId": (angular.isDefined($scope.PolicyDetails.homeownerPolicyType) ? $scope.PolicyDetails.homeownerPolicyType.id : null),
                    "totalPolicyCoverage": (angular.isDefined($scope.PolicyDetails.totalCoverage) ? $scope.PolicyDetails.totalCoverage : null),
                    "propertyCoverage": (angular.isDefined($scope.PolicyDetails.propertyCoverage) ? $scope.PolicyDetails.propertyCoverage : null),
                    "totalSpecialLimit": (angular.isDefined($scope.PolicyDetails.totalSpecialLimit) ? $scope.PolicyDetails.totalSpecialLimit : null),
                    "additionalNote": "This is additional note for claim",
                    "policyType": "Home",//$scope.PolicyDetails.policyType,
                    "policyName": (angular.isDefined($scope.PolicyDetails.policyName) ? $scope.PolicyDetails.policyName : null),
                    "policyNumber": (angular.isDefined(PolicyNumber) ? PolicyNumber : null),  //$scope.PolicyDetails.policyNumber,
                    "companyId": $scope.CommonObject.CompanyId,
                    "insuranceAccountDetails":
                    {
                        "insuranceAccountNumber": CustAccNumber
                    },
                    "description": "Test",
                    "policyHolder": {
                        "firstName": $scope.PolicyDetails.policyHolder.firstName,
                        "lastName": $scope.PolicyDetails.policyHolder.lastName,
                        "email": $scope.PolicyDetails.policyHolder.email && $scope.PolicyDetails.policyHolder.email !="" ? $scope.PolicyDetails.policyHolder.email : null,
                        "cellPhone": $scope.PolicyDetails.policyHolder.cellPhone ? $scope.PolicyDetails.policyHolder.cellPhone.replace(/[^0-9]/g, '') : null,
                        "eveningTimePhone": $scope.PolicyDetails.policyHolder.dayTimePhone ? $scope.PolicyDetails.policyHolder.dayTimePhone.replace(/[^0-9]/g, '') : null,
                        "dayTimePhone": $scope.PolicyDetails.policyHolder.dayTimePhone ? $scope.PolicyDetails.policyHolder.dayTimePhone.replace(/[^0-9]/g, '') : null,
                        "address": {
                            "streetAddressOne": (angular.isDefined($scope.PolicyDetails.policyHolder.address.streetAddressOne) ? $scope.PolicyDetails.policyHolder.address.streetAddressOne : null),
                            "streetAddressTwo": (angular.isDefined($scope.PolicyDetails.policyHolder.address.streetAddressTwo) ? $scope.PolicyDetails.policyHolder.address.streetAddressTwo : null),
                            "city": (angular.isDefined($scope.PolicyDetails.policyHolder.address.city) ? $scope.PolicyDetails.policyHolder.address.city : null),
                            "state": {
                                "id": $scope.PolicyDetails.policyHolder.address.state.id
                            },
                            "zipcode": $scope.PolicyDetails.policyHolder.address.zipcode
                        }
                    },
                    "claimNumber": $scope.PolicyDetails && $scope.PolicyDetails.claimNumber ? $scope.PolicyDetails.claimNumber : null,
                    "policyLimits": $scope.claimDetails.policyLimits ? $scope.claimDetails.policyLimits : null
                };

                var AddPolicyDetails = NewClaimService.AddPolicyDetails(param);
                AddPolicyDetails.then(function (success) {
                    //$(".page-spinner-bar").addClass("hide");
                    if($scope.CommonObj.ClaimProfile =="Contents"){
                    toastr.remove();
                    toastr.success(success.data.message, "Confirmation");
                    }
                    $scope.DisablePolicyNextBtn = false;
                    $scope.PolicyDetails.policyNumber = success.data.data.policyNumber;
                    //Step -2 → Add claim under theh policy
                    SaveClaimReportDetails();
                    if($scope.CommonObj.ClaimProfile.toLowerCase =="jewelry")
                    $location.url("AdjusterDashboard");
                },
                    function (error) {
                        toastr.remove();
                        toastr.error(error.data.errorMessage, "Error", { timeOut: 0 });
                        $(".page-spinner-bar").addClass("hide");
                    });
            }
        };

        $scope.getDate = getDate;
        function getDate() {
            var today = new Date();
            $scope.PolicyDetails.ClaimDate = formatDatetoString(today);
        }

        $scope.formatDatetoString = formatDatetoString
        function formatDatetoString(renewDate) {
            var d = new Date(renewDate);
            var curr_date = (d.getDate() < 10 ? '0' : '') + (d.getDate());
            // Months are zero based
            var curr_month = (d.getMonth() + 1 >= 10 ? '' : '0') + (d.getMonth() + 1);
            var curr_year = d.getFullYear();
            var formattedDate = curr_month + "/" + curr_date + "/" + curr_year;
            return formattedDate;
        }



        // update selector for branch
        $scope.update = update;
        function update() {
           // console.log(CommonObject.BranchId);
            $scope.branchId = $scope.CommonObject.BranchId;
        }

        //Save Claim with Report Details
        $scope.SaveClaimReportDetails = SaveClaimReportDetails;
        function SaveClaimReportDetails() {
            $(".page-spinner-bar").removeClass("hide");
            $scope.PolicyExists = ""; $scope.PolicyExists = "";
            $scope.claimDetails.policyCategoryCoverages = [];
            angular.forEach($scope.selectedCategory, function (item) {
                $scope.claimDetails.policyCategoryCoverages.push({ "categoryId": item.id, "coverageLimit": item.coverageLimit, "individualItemLimit": item.individualItemLimit });
            });
            var ClaimandReportDetails = new FormData();
            var FileDetails = [];
            if ($scope.IncidentImages.length > 0) {
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
            }
            else {
                ClaimandReportDetails.append("filesDetails", null);
                ClaimandReportDetails.append("file", null);
            }



            //$scope.Questions = [];
            //angular.forEach($scope.QuestionList, function (item) {
            //    var ans = { "id": null, "answer": null };
            //    if (item.type === "SELECT") {
            //        ans = { "id": item.answer, "answer": item.answer }
            //    }
            //    else if (item.type === "BOOLEAN") {
            //        if (item.answer === "TRUE")
            //            ans = { "id": 0, "answer": item.answer }
            //        else
            //            ans = { "id": 1, "answer": item.answer }
            //    }
            //    else
            //        ans = { "id": null, "answer": item.answer };
            //    if (item.type !== "IMAGE")
            //        $scope.Questions.push({ "id": item.id, "question": item.question, "answers": null, "answer": ans });
            //});

            ClaimandReportDetails.append("claimDetails", JSON.stringify({
                "claimNumber": (angular.isDefined($scope.PolicyDetails.claimNumber) ? $scope.PolicyDetails.claimNumber : null),
                "policyNumber": (angular.isDefined($scope.PolicyDetails.policyNumber) ? $scope.PolicyDetails.policyNumber : null),
                "claimType": (angular.isDefined($scope.PolicyDetails.claimType) ? $scope.PolicyDetails.claimType : null),
                "applyTax": $scope.PolicyDetails.applyTax,
                "taxRate": $scope.PolicyDetails.taxRate,  // Removed from UI Hence Defaulted
                "damageTypeId": $scope.PolicyDetails.lossCauseType ? $scope.PolicyDetails.lossCauseType.id : 9,
                "deductible": $scope.claimDetails.totalDetuctibleAmount ? $scope.claimDetails.totalDetuctibleAmount : null,
                "additionalNote": (angular.isDefined($scope.AssignmentRemark) && $scope.AssignmentRemark != null ? $scope.AssignmentRemark : null),//$scope.claimDetails.claimNote,
                "incidentDate": (angular.isDefined($scope.PolicyDetails.ClaimDate) ? $filter('DatabaseDateFormatMMddyyyy')($scope.PolicyDetails.ClaimDate) : null),
                //"description": (($scope.PolicyDetails.incidentDescription !== null && angular.isDefined($scope.PolicyDetails.incidentDescription)) ? $scope.PolicyDetails.incidentDescription : null),
                "description": (angular.isDefined($scope.AssignmentRemark) && $scope.AssignmentRemark != null ? $scope.AssignmentRemark : null),
                "isACV": true,
                "isRCV": false,
                "branchId": $scope.branchId,
                "policyCategoryCoverages": (angular.isDefined($scope.claimDetails.policyCategoryCoverages) && $scope.claimDetails.policyCategoryCoverages.length > 0 ? $scope.claimDetails.policyCategoryCoverages : null),
                //"questions": $scope.Questions,
                "individualLimit": (angular.isDefined($scope.claimDetails.individualLimit) ? $scope.claimDetails.individualLimit : null),
                "shippingDate": (angular.isDefined($scope.claimDetails.ShippingDate)) ? $filter('DatabaseDateFormatMMddyyyy')($scope.claimDetails.ShippingDate) : null,
                "shippingMethod": (angular.isDefined($scope.claimDetails.ShippingMethod)) ? $scope.claimDetails.ShippingMethod : null,
                "noOfItems": angular.isDefined($scope.NewItemList) && $scope.NewItemList != null ? $scope.NewItemList.length : 0,
                "minimumThreshold": (angular.isDefined($scope.claimDetails.totalThresholdAmount) ? $scope.claimDetails.totalThresholdAmount : null),
                "thirdPartyInsCompName" : (angular.isDefined($scope.PolicyDetails.insuranceCompany) ? $scope.PolicyDetails.insuranceCompany : null),
                "thirdPartyInsAdjName" : (angular.isDefined($scope.PolicyDetails.adjusterName) ? $scope.PolicyDetails.adjusterName : null),
                "aggigateLimit": $scope.claimDetails.policyLimits ? $scope.claimDetails.policyLimits : null
            }));

            //Save details
            var SaveDetails = NewClaimService.SaveClaimandReportDetails(ClaimandReportDetails);
            SaveDetails.then(function (success) {
                $scope.DisableClaimNextBtn = false; //enable claim next button
                $scope.CommonObject.ClaimNumber = success.data.data.claimNumber;
                $scope.PolicyDetails.claimNumber = success.data.data.claimNumber;
                $scope.CommonObject.ClaimId = success.data.data.claimId;
                $scope.applyTax = success.data.data.applyTax;
                sessionStorage.setItem("claimId", $scope.CommonObject.ClaimId);
                if (success.data.data.claimNumber != null && $scope.claimProfile === "Contents") {
                    toastr.remove();
                    toastr.success(success.data.message + "<br>FNOL# " + success.data.data.claimNumber + ".", "Confirmation");
                }
                $scope.claimDetails.policyCategoryCoverages = success.data.data.policyCategoryCoverages;

                if ($scope.claimProfile.toLowerCase() === "jewelry") {
                    //Save Item if the claim profile is jewelry
                    SaveItemDetailsJewelry();
                    $(".page-spinner-bar").addClass("hide");

                } else {
                    $(".page-spinner-bar").addClass("hide");
                }
                $scope.step1 = false;
                $scope.step2 = true;
                ShowCurrentWizard("ClaimItem", 2);
                $scope.savedDetails = true;
                sessionStorage.setItem("savedDetails",$scope.savedDetails);
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
                $(".page-spinner-bar").addClass("hide");
            });
        };

        //update claim Details
        $scope.updateClaimDetails = updateClaimDetails;
        function updateClaimDetails() {
            if (angular.isDefined($scope.CommonObject.ClaimId) && $scope.CommonObject.ClaimId != null && $scope.CommonObject.ClaimId != '') {
                var updateClaimDetailsDTO = {
                    "claimId": $scope.CommonObject.ClaimId,
                    "updatedClaimNumber": $scope.PolicyDetails.claimNumber ? $scope.PolicyDetails.claimNumber: $scope.CommonObject.ClaimNumber,
                    "oldClaimNumber": $scope.PolicyDetails.claimNumber,
                    "claimType": (angular.isDefined($scope.PolicyDetails.claimType) ? $scope.PolicyDetails.claimType : null),
                    "applyTax": $scope.PolicyDetails.applyTax,
                    "taxRate": $scope.PolicyDetails.taxRate,  // Removed from UI Hence Defaulted
                    "damageTypeId": $scope.PolicyDetails.lossCauseType ? $scope.PolicyDetails.lossCauseType.id : 9,
                    "deductible": $scope.claimDetails.totalDetuctibleAmount ? $scope.claimDetails.totalDetuctibleAmount : null,
                    "additionalNote": (angular.isDefined($scope.AssignmentRemark) && $scope.AssignmentRemark != null ? $scope.AssignmentRemark : null),//$scope.claimDetails.claimNote,
                    "incidentDate": (angular.isDefined($scope.PolicyDetails.ClaimDate) ? $filter('DatabaseDateFormatMMddyyyy')($scope.PolicyDetails.ClaimDate) : null),
                    //"description": (($scope.PolicyDetails.incidentDescription !== null && angular.isDefined($scope.PolicyDetails.incidentDescription)) ? $scope.PolicyDetails.incidentDescription : null),
                    "description": (angular.isDefined($scope.AssignmentRemark) && $scope.AssignmentRemark != null ? $scope.AssignmentRemark : null),
                    "isACV": true,
                    "isRCV": false,
                    "branchId": $scope.branchId,
                    "policyCategoryCoverages": (angular.isDefined($scope.claimDetails.policyCategoryCoverages) && $scope.claimDetails.policyCategoryCoverages != null && $scope.claimDetails.policyCategoryCoverages.length > 0 ? $scope.claimDetails.policyCategoryCoverages : null),
                    //"questions": $scope.Questions,
                    "individualLimit": (angular.isDefined($scope.claimDetails.individualLimit) ? $scope.claimDetails.individualLimit : null),
                    "shippingDate": (angular.isDefined($scope.claimDetails.ShippingDate)) ? $filter('DatabaseDateFormatMMddyyyy')($scope.claimDetails.ShippingDate) : null,
                    "shippingMethod": (angular.isDefined($scope.claimDetails.ShippingMethod)) ? $scope.claimDetails.ShippingMethod : null,
                    "noOfItems": angular.isDefined($scope.NewItemList) && $scope.NewItemList != null ? $scope.NewItemList.length : 0,
                    "minimumThreshold": (angular.isDefined($scope.claimDetails.totalThresholdAmount) ? $scope.claimDetails.totalThresholdAmount : null)
                }
                var upDateClaimDetails = NewClaimService.updateClaimDetails(updateClaimDetailsDTO);
                upDateClaimDetails.then(function (success) {
                    $scope.CommonObject.ClaimNumber = $scope.PolicyDetails.claimNumber ? $scope.PolicyDetails.claimNumber: $scope.CommonObject.ClaimNumber;
                    sessionStorage.setItem('ClaimNumber', $scope.CommonObject.ClaimNumber);
                    sessionStorage.setItem('ClaimNo', $scope.CommonObject.ClaimNumber);
                    $scope.editClaimDetail = false;
                    getClaimsStatusContentDetails();
                    toastr.remove();
                    toastr.success(success.data.message, $translate.instant("SuccessHeading"));
                }, function (error) {
                    $scope.ErrorMessage = error.data.errorMessage;
                    toastr.remove();
                    toastr.error(error.data.errorMessage);
                });
            }
        }

        $scope.getClaimsStatusContentDetails = getClaimsStatusContentDetails;
        function getClaimsStatusContentDetails() {
            $(".page-spinner-bar").removeClass("hide");
            var param = { "id": $scope.CommonObject.ClaimId, "claimNumber": $scope.CommonObject.ClaimNumber };
            var getpromise = NewClaimService.getClaimsStatusContentDetails(param);
            getpromise.then(function (success) {
                $(".page-spinner-bar").addClass("hide");
                $scope.ClaimStatusContent = success.data.data;
                $scope.ClaimStatusContent.shippingDate = $filter('formatDate')($scope.ClaimStatusContent.shippingDate);
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
                if (error.data.errorCode == 400203) {
                    $location.url("AdjusterDashboard");
                }
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error")
                $(".page-spinner-bar").addClass("hide");
            });
        }

        //Add /Update New post loss item
        $scope.SaveItemDetails = function (itemid) {
            $(".page-spinner-bar").removeClass("hide");
            //Update post loss item
            if (itemid) {
                var param = new FormData();
                var FileDetails = [];
                if ($scope.ItemFiles.length > 0) {
                    angular.forEach($scope.ItemFiles, function (ItemFile) {
                        FileDetails.push({
                            "fileName": ItemFile.FileName, "fileType": ItemFile.FileType,
                            "extension": ItemFile.FileExtension,
                            "filePurpose": "ITEM", "latitude": null, "longitude": null
                        });
                        param.append('file', ItemFile.File);
                    });

                    param.append("filesDetails", JSON.stringify(FileDetails));
                } else {
                    param.append('fileDetails', null);
                    param.append('file', null);
                }
                param.append("itemDetails",
                    JSON.stringify(
                        {
                            "ageMonths": (angular.isDefined($scope.selected.ageMonths) ? $scope.selected.ageMonths : 0),
                            "ageYears": (angular.isDefined($scope.selected.ageYears) ? $scope.selected.ageYears : 0),
                            "acvTotal": $scope.selected.acvTotal,
                            "adjusterDescription": $scope.selected.adjusterDescription && $scope.selected.adjusterDescription!="" ? encodeURIComponent($scope.selected.adjusterDescription):"",
                            "approvedItemValue": $scope.selected.approvedItemValue,
                            "assignedTo": $scope.selected.assignedTo,
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
                            "dateOfPurchase": $scope.selected.dateOfPurchase ? $scope.selected.dateOfPurchase : null,
                            "depriciationRate": $scope.selected.depriciationRate,
                            "description": $scope.selected.description && $scope.selected.description!="" ? encodeURIComponent($scope.selected.description):"",
                            "holdOverPaymentDate": $scope.selected.holdOverPaymentDate,
                            "holdOverPaymentMode": $scope.selected.holdOverPaymentMode,
                            "holdOverPaymentPaidAmount": $scope.selected.holdOverPaymentPaidAmount,
                            "holdOverValue": $scope.selected.holdOverValue,
                            "id": $scope.selected.id,
                            "itemNumber": $scope.selected.itemNumber,
                            "insuredPrice": $scope.selected.insuredPrice,
                            "individualLimitAmount": $scope.selected.individualLimitAmount,
                            "isReplaced": $scope.selected.isReplaced,
                            "isScheduledItem": $scope.selected.isScheduledItem,
                            "scheduleAmount": $scope.selected.scheduleAmount,
                            "itemName": $scope.selected.itemName,
                            "itemType": $scope.selected.itemType,
                            "model": $scope.selected.model,
                            "paymentDetails": $scope.selected.paymentDetails,
                            "quantity": $scope.selected.quantity,
                            "quotedPrice": $scope.selected.insuredPrice,
                            "rcv": $scope.selected.rcv,
                            "rcvTax": $scope.selected.rcvTax,
                            "rcvTotal": $scope.selected.rcvTotal,
                            "receiptValue": $scope.selected.receiptValue,
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
                            "taxRate": $scope.selected.taxRate,
                            "totalTax": $scope.selected.totalTax,
                            "valueOfItem": $scope.selected.valueOfItem,
                            "vendorDetails": $scope.selected.vendorDetails,
                            "yearOfManufecturing": $scope.selected.yearOfManufecturing,
                            "totalStatedAmount": parseFloat($scope.selected.insuredPrice) * parseFloat(($scope.selected.quantity !== null && angular.isDefined($scope.selected.quantity) ? $scope.selected.quantity : (1))),
                            // Originally purchased from, purhase method, If gifted then donor's name and address
                            "originallyPurchasedFrom": $scope.newRetailer? {
                                "name": $scope.selected.newRetailer
                            } : $scope.selected.originallyPurchasedFrom,
                            "room": $scope.selected.room,
                            "newRetailer": $scope.selected.newRetailer ? $scope.selected.newRetailer : null,
                            "giftedFrom": $scope.selected.giftedFrom ? $scope.selected.giftedFrom : null,
                            "purchaseMethod": $scope.selected.purchaseMethod ? $scope.selected.purchaseMethod : null
                        }
                    ));

                var UpdatePostLoss = NewClaimService.UpdatePostLoss(param);
                UpdatePostLoss.then(function (success) {
                    $scope.EditItemFiles = [];
                    $scope.GetPostLostItems();
                    toastr.remove()
                    toastr.success(success.data.message, "Confirmation");
                    $scope.step1 = false;
                    $scope.step2 = true;
                    $scope.reset();
                    $(".page-spinner-bar").addClass("hide");
                },
                    function (error) {
                        toastr.remove()
                        toastr.error(error.data.errorMessage, "Error");
                        $(".page-spinner-bar").addClass("hide");
                    });
            }
            //Add New Post Loss Item
            else {
                calculateMaxItemNo();
                var param = new FormData();
                var FileDetails = [];
                if ($scope.ItemFiles.length > 0) {
                    angular.forEach($scope.ItemFiles, function (ItemFile) {
                        FileDetails.push({
                            "fileName": ItemFile.FileName, "fileType": ItemFile.FileType,
                            "extension": ItemFile.FileExtension,
                            "filePurpose": "ITEM", "latitude": null, "longitude": null
                        });
                        param.append('file', ItemFile.File);
                    });

                    param.append("filesDetails", JSON.stringify(FileDetails));
                } else {
                    param.append('fileDetails', null);
                    param.append('file', null);
                }
                param.append("itemDetails",
                    JSON.stringify({
                        "ageMonths": (angular.isDefined($scope.selected.ageMonths) ? $scope.selected.ageMonths : 0),
                        "ageYears": (angular.isDefined($scope.selected.ageYears) ? $scope.selected.ageYears : 0),
                        "brand": $scope.selected.brand,
                        "category": $scope.selected.category ?
                            {
                                "annualDepreciation": $scope.selected.category.annualDepreciation ? $scope.selected.category.annualDepreciation : null,
                                "id": $scope.selected.category.id,
                                "name": $scope.selected.category.id ? GetCategoryOrSubCategoryOnId(true, $scope.selected.category.id) : null,
                                "description": $scope.selected.category.description ? $scope.selected.category.description : null,
                                "usefulYears": $scope.selected.category.usefulYears ? $scope.selected.category.usefulYears : null,
                                "aggregateLimit": $scope.selected.category.aggregateLimit ? $scope.selected.category.aggregateLimit : null
                            } : null,
                        "categoryLimit": $scope.selected.categoryLimit ? $scope.selected.categoryLimit : null,
                        "claimId": $scope.CommonObject.ClaimId,
                        "itemNumber": $scope.selected.itemNumber,
                        "claimNumber": $scope.PolicyDetails.claimNumber,
                        "appraisalValue": (angular.isDefined($scope.selected.appraisalValue) ? $scope.selected.appraisalValue : null),
                        "appraisalDate": (angular.isDefined($scope.selected.appraisalDate) ? $filter('DatabaseDateFormatMMddyyyy')($scope.selected.appraisalDate) : null),
                        "depriciationRate": $scope.selected.depriciationRate,
                        "description": $scope.selected.description,
                        "insuredPrice": (angular.isDefined($scope.selected.insuredPrice) ? $scope.selected.insuredPrice : null),//previously it was quoted prise
                        "individualLimitAmount": (angular.isDefined($scope.selected.individualLimitAmount) ? $scope.selected.individualLimitAmount : null),
                        "itemName": $scope.selected.itemName,
                        "isScheduledItem": (angular.isDefined($scope.selected.isScheduledItem) ? $scope.selected.isScheduledItem : false),
                        "scheduleAmount": (angular.isDefined($scope.selected.scheduleAmount) ? $scope.selected.scheduleAmount : null),
                        "model": $scope.selected.model,
                        "quantity": (angular.isDefined($scope.selected.quantity) ? $scope.selected.quantity : false),
                        "status": {
                            "id": (($scope.selected.status !== null && angular.isDefined($scope.selected.status)) ? $scope.selected.status.id : null),
                            "status": (($scope.selected.status !== null && angular.isDefined($scope.selected.status)) ? $scope.selected.status.status : null)
                        },
                        "subCategory": $scope.selected.subCategory ?
                            {
                                "annualDepreciation": $scope.selected.subCategory.annualDepreciation ? $scope.selected.subCategory.annualDepreciation : null,
                                "id": $scope.selected.subCategory.id,
                                "name": $scope.selected.subCategory.id ? GetCategoryOrSubCategoryOnId(false, $scope.selected.subCategory.id) : null,
                                "description": $scope.selected.subCategory.description ? $scope.selected.subCategory.description : null,
                                "usefulYears": $scope.selected.subCategory.usefulYears ? $scope.selected.subCategory.usefulYears : null,
                                "aggregateLimit": $scope.selected.subCategory.aggregateLimit ? $scope.selected.subCategory.aggregateLimit : null,
                            } : null,

                        // Originally purchased from, purhase method, If gifted then donor's name and address
                        "originallyPurchasedFrom": $scope.newRetailer? {
                            "name": $scope.selected.newRetailer
                        } : $scope.selected.originallyPurchasedFrom,
                        "room": $scope.selected.room,
                        "newRetailer": $scope.selected.newRetailer ? $scope.selected.newRetailer : null,
                        "giftedFrom": $scope.selected.giftedFrom ? $scope.selected.giftedFrom : null,
                        "purchaseMethod": $scope.selected.purchaseMethod ? $scope.selected.purchaseMethod : null,
                        "videoLink": $scope.selected.videoLink ? $scope.selected.videoLink : null
                    }
                    ));
                var SavePostLossItem = NewClaimService.AddPostLossItem(param);
                SavePostLossItem.then(function (success) {
                    //Need to pass the ItemId which will generate after inserting item
                    $scope.NewlyAddedItemId = success.data.data.id;
                    $scope.GetPostLostItems();
                    toastr.remove()
                    toastr.success(success.data.message, "Confirmation");
                    $(".page-spinner-bar").addClass("hide");
                    $scope.step1 = false;
                    $scope.step2 = true;
                    $scope.reset();
                }, function (error) {
                    $(".page-spinner-bar").addClass("hide");
                    toastr.remove()
                    toastr.error(error.data.errorMessage, "Error");
                });
            }

        };

        //get Category name on category id for showing in grid of post loss itemd
        function GetCategoryOrSubCategoryOnId(OpertionFlag, id) {
            if (id !== null && angular.isDefined(id)) {
                if (OpertionFlag) {
                    var list = $filter('filter')($scope.DdlClaimCategoryWithCovers, { categoryId: id });
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
        };

        $scope.reset = function () {
            $scope.AddNewItem = false;
            $scope.EditItem = false;
            $scope.ItemFiles = [];
            $scope.EditItemFiles = [];
            $scope.selected = {
                isScheduledItem: false
            };
            if (angular.isDefined($scope.AddItemForm)) {
                $scope.AddItemForm.$setUntouched();
            }
        };

        $scope.SelectItemFile = function () {
            angular.element('#ItemFileUpload').trigger('click');
        };

        //Get note attachment details
        $scope.ItemFiles = []
        $scope.getContentsItemFileDetails = function (e) {
            //$scope.ItemFiles = [];
            var files = event.target.files;
            $scope.filed = event.target.files;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var reader = new FileReader();
                reader.file = file;
                reader.fileName = files[i].name;
                reader.fileType = files[i].type;
                reader.fileExtension = files[i].name.substr(files[i].name.lastIndexOf('.'));
                reader.onload = $scope.ItemContentsImageLoaded;
                reader.readAsDataURL(file);
            }
        };

        $scope.ItemContentsImageLoaded = function (e) {
            $scope.$apply(function () {
                $scope.ItemFiles.push({ "FileName": e.target.fileName, "FileExtension": e.target.fileExtension, "FileType": e.target.fileType, "Image": e.target.result, "File": e.target.file })
            });
        };

        $scope.removeattchment = removeattchment;
        function removeattchment(index) {
            $scope.ItemFiles.splice(index, 1);
        };

        $scope.GetPostLostItems = GetPostLostItems;
        function GetPostLostItems() {
            $(".page-spinner-bar").removeClass("hide");
            var param = {
                "claimNumber": $scope.PolicyDetails.claimNumber,
                "claimId": $scope.CommonObject.ClaimId ? $scope.CommonObject.ClaimId : sessionStorage.getItem("claimId")
            }
            var getpromise = NewClaimService.getPostLostItemsWithComparables(param);
            getpromise.then(function (success) {
                if (success.data.data != null) {
                    $scope.FiletrLostDamageList = success.data.data;
                    $scope.OriginalPostLossItem = success.data.data;
                    $scope.LostDamagedContentByCategory = success.data.data;
                }
                if ($scope.claimProfile.toLowerCase() === "jewelry") {
                    angular.forEach($scope.FiletrLostDamageList, function (item) {
                        $scope.SelectedVendorPostLossItem.push(item.itemUID);
                    })
                    AssignItemToVendor();
                }
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                $(".page-spinner-bar").addClass("hide");
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
                $scope.ErrorMessage = error.data.errorMessage;
                return "error";
            });
        };

        $scope.getTemplate = function (item) {

            //if (!angular.isUndefined(item)) {
            //    if (item.id === $scope.selected.id) return 'edit';
            //    else
            //        return 'display';
            //}
            //else
            return 'display';
        };

        $scope.EditItemFiles = [];
        $scope.OriginalPostLossIndex = 0;
        $scope.EditItemDetails = function (item) {
            $scope.AddNewItem = false;
            $scope.EditItem = true;
            $scope.ShowAddItemDiv = true;
            $scope.EditItemFiles = [];
            if ($scope.EditItemFiles == null || $scope.EditItemFiles.length == 0) {
                angular.forEach(item.attachments, function (attachment) {
                    $scope.EditItemFiles.push({ "FileName": attachment.name, "url": attachment.url })
                });
            }
            $scope.selected = {};
            $scope.selected = angular.copy(item);
            $scope.OriginalPostLossIndex = $scope.FiletrLostDamageList.indexOf(item);
            $scope.OriginalPostLossItem = angular.copy(item);
            $scope.GetCategory();
            if ($scope.selected.category) {
                $scope.GetSubCategory();
            }
            
            if (item.room) {
                $scope.selected.room = {
                    "id": item.room ? item.room.id : null,
                    "roomName": item.room ? item.room.roomName : null
                }
            }
            if (item.originallyPurchasedFrom) {
                var index = $scope.Retailers.findIndex(retailer => retailer.name === item.originallyPurchasedFrom.name);
                if (index <= -1)
                    getRetailers();
                $scope.selected.originallyPurchasedFrom = {
                    "id": item.originallyPurchasedFrom ? item.originallyPurchasedFrom.id : null,
                    "name": item.originallyPurchasedFrom ? item.originallyPurchasedFrom.name : null
                }
                if (item.originallyPurchasedFrom.name === 'Other')
                    $scope.addOtherRetailer = true;
            }
            $scope.selected.purchaseMethod = item.purchaseMethod ? item.purchaseMethod : null;
            $scope.selected.giftFrom = item.giftedFrom ? item.giftedFrom : null;
            //$scope.EditItemFiles = item.attachments;
        };


        //Get post lost items by category
        $scope.GetItemsByCategory = function (e) {
            $scope.TempObj = [];
            if (($scope.CommonObject.Categories === "ALL") || (angular.isUndefined($scope.CommonObject.Categories) || $scope.CommonObject.Categories === null)) {
                $scope.FiletrLostDamageList = $scope.LostDamagedContentByCategory;
                $scope.VendorAssignmentList = $scope.LostDamagedContentByCategory;
            }
            else {
                angular.forEach($scope.LostDamagedContentByCategory, function (value) {
                    if ($scope.CommonObject.Categories != null && value.category !== null) {
                        if (value.category.id == $scope.CommonObject.Categories) {
                            $scope.TempObj.push(value);
                        }
                    }
                });
                $scope.FiletrLostDamageList = $scope.TempObj;
                $scope.VendorAssignmentList = $scope.TempObj;
            }
        };

        $scope.ShowHideAddItem = ShowHideAddItem
        function ShowHideAddItem(flag) {
            $scope.ShowAddItemDiv = flag;
            $scope.selected = { isScheduledItem: false };
            if (angular.isDefined($scope.AddItemForm)) {
                $scope.AddItemForm.$setUntouched();
            }
            $scope.selected = []
            $scope.selected.category = []
            $scope.selected.isScheduledItem = false;
            //$scope.selected.category.id = $scope.DdlClaimCategoryWithCovers[0].categoryId;
        };

        //Upload post loss item from file
        $scope.UploadPostLossItem = function ($event) {
            if ($scope.PolicyDetails.claimNumber !== null && angular.isDefined($scope.PolicyDetails.claimNumber)) {
                sessionStorage.setItem("UploadClaimNo", $scope.PolicyDetails.claimNumber);
                sessionStorage.setItem("PolicyDetails", JSON.stringify($scope.PolicyDetails));
                sessionStorage.setItem("ClaimDetails", JSON.stringify($scope.claimDetails));
                sessionStorage.setItem("SelectedCategory", JSON.stringify($scope.selectedCategory));
                sessionStorage.setItem("IncidentImages", JSON.stringify($scope.IncidentImages));
                sessionStorage.setItem("applyTax",(angular.isDefined($scope.applyTax) ? $scope.applyTax : sessionStorage.getItem("applyTax")));
                $location.url('UploadItemsFromCSV')
            }
            else {
                toastr.remove()
                toastr.warning("Create claim first", "Warning");
                $event.stopPropagation();
                $event.preventDefault();
            }

        };

        $scope.AssignItems = AssignItems;
        function AssignItems() {
            $scope.savedAddedItems = true;
            $scope.step1 = false;
            $scope.step2 = false;
            ShowCurrentWizard('AssignItem', 3);
            VendorAssignment();
            if ($scope.CommonObject.ClaimNumber && !isClaimCreationMailTriggered) {
                $scope.mailToSupervisorOnClaimCreation();
            }
        };

        $scope.AddEditItems = AddEditItems;
    function AddEditItems(item, operation) {
        if ($scope.CommonObj.ClaimProfile.toLowerCase() === "jewelry") {
            sessionStorage.setItem("IndividualLimitJewelryCat", (($scope.PolicyDetails.claimIndividualLimit != null && $scope.PolicyDetails.claimIndividualLimit != "") ? $scope.PolicyDetails.claimIndividualLimit : 0))
        }
        $scope.CommonObj.ClaimNumber = $scope.PolicyDetails.claimNumber;
        $scope.animationsEnabled = true;
        var itemParam = {
            claimNumber: $scope.CommonObj.ClaimNumber,
        }
        LineItemsFactory.addItemsToList(angular.copy($scope.FiletrLostDamageList), itemParam);
        var data = {
            "CommonObj": angular.copy($scope.CommonObj),
            "PolicyDetails": angular.copy($scope.PolicyDetails),
            "Category": angular.copy($scope.DdlSourceCategoryList),
            "isEditItem": operation === 'EDIT' ? true : false,
            "Item": operation === 'EDIT' ? item : null,
            "ShippingMethods": angular.copy($scope.CommonObj.ClaimProfile.toLowerCase() === "jewelry" ? $scope.shippingMethodsList : null),
            "applyTax": $scope.PolicyDetails.applyTax,
            "items": $scope.FiletrLostDamageList
        }
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                size: 'lg',
                templateUrl: "views/CommonTemplates/AddItemPopup.html",
                controller: "AddItemPopupController",
                backdrop: 'static',
                keyboard: false,
                transclude: false,
                resolve:
                {
                    objData: function () {
                        return data;
                    }
                }
            });
        out.result.then(
            function (value) {
                //Call Back Function success
                $scope.FiletrLostDamageList = LineItemsFactory.getItemsList().originalItemsList;
                $scope.statusFilterItems = $scope.FiletrLostDamageList;
                $scope.statusBasedFilter($scope.FiletrLostDamageList);
                $scope.GetPostLostItems();
                // $scope.getLineItems();
                // removePostLostItems($scope.constants.itemStatus.underReview);
                mapFilterLostDamageList({
                    claimNumber: $scope.CommonObj.ClaimNumber,
                });
            },
            function (res) {
                //Call Back Function close
            }
        );
        return {
            open: open,
        };
    }

        $scope.AddNewItem = AddNewItem;
        function AddNewItem() {
            if ($scope.claimProfile.toLowerCase() === 'jewelry' && angular.isDefined($scope.selectedCategory[0].coverageLimit)) {
                $scope.NewItemList.push({
                    id: $scope.NewItemList.length + 1,
                    selected: {
                        category: { id: $scope.selectedCategory[0].id, aggregateLimit: $scope.selectedCategory[0].coverageLimit },
                        isScheduledItem: false,
                    },

                    ItemAttachment: [],
                    IsRequired: false
                });
                calculateMinServiceCost();
            }
            else
                $scope.NewItemList.push({
                    id: $scope.NewItemList.length + 1,
                    selected: {
                        category: { id: "", aggregateLimit: "" }
                    },
                    ItemAttachment: [],
                    IsRequired: false
                });

        };

        $scope.RemoveItem = function (index) {
            $scope.NewItemList.splice(index, 1);
            calculateMinServiceCost();
        }

        $scope.searchCategories = searchCategories;
        function searchCategories(data) {
            if (angular.isDefined(data) && !$scope.disableAddCoverage) {
                var flag = true;
                if (angular.isDefined($scope.selectedCategory) && $scope.selectedCategory.length > 0) {
                    angular.forEach($scope.selectedCategory, function (item) {
                        if (item.id == data.originalObject.categoryId) {
                            flag = false;
                        }
                    });
                    if (flag) {
                        $scope.selectedCategory.push({
                            id: data.originalObject.categoryId, Name: data.originalObject.categoryName, coverageLimit: "", canEdit: true,
                            individualItemLimit: data.originalObject.individualItemLimit
                        })
                    }
                }
                else {
                    $scope.selectedCategory.push({
                        id: data.originalObject.categoryId, Name: data.originalObject.categoryName, coverageLimit: "", canEdit: true,
                        individualItemLimit: data.originalObject.individualItemLimit
                    })
                }
                $scope.$broadcast('angucomplete-alt:clearInput');
            }
        }

        $scope.RemoveCategory = RemoveCategory;
        function RemoveCategory(item) {
            var index = $scope.selectedCategory.indexOf(item);
            if (index > -1) {
                $scope.selectedCategory.splice(index, 1);
            }
            $scope.checkLimit($scope.specialLimit);
        }
        $scope.VendorAssignment = VendorAssignment;
        function VendorAssignment() {
            GetCompanyBranchList();
            GoToVendorAssignment();
        }
        //For Vendor Item Assignment -Item Selection and category selection
        $scope.GoToVendorAssignment = GoToVendorAssignment;
        function GoToVendorAssignment() {
            $scope.SelectedVendorPostLossItem = [];
            if ($scope.SelectedPostLostItems.length > 0) {
                $scope.VendorAssignmentList = [];
                angular.forEach($scope.SelectedPostLostItems, function (selected) {
                    angular.forEach($scope.FiletrLostDamageList, function (item) {
                        if (selected == item.id) {
                            item.Selected = true;
                            $scope.VendorAssignmentList.push(item);
                            $scope.SelectedVendorPostLossItem.push(item.itemUID);
                            // Fetch vendors list based on selected item categories
                            if (item.category)
                                itemCategoryIds.push(item.category.id);
                        }
                    });
                });
                $scope.selectedAllVendorItem = true;
                //$scope.SelectedVendorPostLossItem = $scope.SelectedPostLostItems;
                GetVendorsList();
                // $scope.tab = 'Vendors';
                $scope.IscheckedParticipant = false;
                $scope.ContentServiceList = [];
                $scope.ServiceTypeDiv = "";
                $scope.ShowAssignments = true;
                $scope.ShowAssignmentsList = false;
            }
            else {
                //$scope.GetVendorsList();
                $scope.selectedAllVendorItem = false;
                $scope.VendorAssignmentList = angular.copy($scope.FiletrLostDamageList);
                // $scope.tab = 'Vendors';
                $scope.IscheckedParticipant = false;
                $scope.ContentServiceList = [];
                $scope.ShowAssignments = true;
                $scope.ShowAssignmentsList = false;
            }

            $scope.SelectCategory();
        }

        //to get selected categories of selected item
        $scope.SelectedCategories = [];
        $scope.SelectCategory = SelectCategory;
        function SelectCategory() {
            $scope.TotalStatedValue = 0.00;
            angular.forEach($scope.VendorAssignmentList, function (item) {
                if (item.Selected) {
                    $scope.TotalStatedValue += item.insuredPrice ? item.insuredPrice : item.unitCost ? item.unitCost : 0 ;
                }
            })
            if ($scope.SelectedVendorPostLossItem.length > 0) {
                $scope.SelectedCategories = [];
                angular.forEach($scope.SelectedVendorPostLossItem, function (obj) {
                    angular.forEach($scope.VendorAssignmentList, function (Origionalitem) {
                        if (Origionalitem.category != null && angular.isDefined(Origionalitem.category)) {
                            if (obj == Origionalitem.itemUID) {
                                var param =
                                {
                                    id: Origionalitem.category.id,
                                    name: Origionalitem.category.name
                                };
                                var count = 0
                                angular.forEach($scope.SelectedCategories, function (categories) {
                                    if (categories.id == param.id) {
                                        count++;
                                    }
                                })
                                if (count == 0) {
                                    $scope.SelectedCategories.push(param)
                                    count = 0;
                                }
                                else {
                                    count = 0;
                                }

                            }

                        }


                    });
                });
            }
            else {
                $scope.SelectedCategories = [];
            }
        };
        //Assign post losss item
        $scope.GetVendorsList = GetVendorsList;
        function GetVendorsList() {
            $(".page-spinner-bar").removeClass("hide");
            var param = {
                'searchKey': $scope.searchVendorsKeyword,
                'categoryIds': itemCategoryIds,
                'page': $scope.vendorPage,
                'limit': $scope.pagesize,
                'sortBy': $scope.vendorSortKey,
                'orderBy': $scope.reverseVendorsList ? 'desc' : 'asc'
            }
            var VendorList = NewClaimService.getVendorList(param);
            VendorList.then(function (success) {
                $scope.PricingSpecialist = [];
                $scope.totalVendors = 0;
                if (success.data.data) {
                    var resData = success.data.data;
                    $scope.totalVendors = resData && resData.totalVendors > 0 ? resData.totalVendors : 0;
                    if ($scope.vendorPage == 1) {
                        $scope.lastRowCount = resData.totalPageSize;
                    } else {
                        $scope.lastRowCount = resData.totalPageSize + ($scope.pagesize * ($scope.vendorPage - 1));
                        // var currentListLength = ($scope.currentPage - 1) * $scope.pagesize;
                        // if (currentListLength != $scope.appraisalInvoices.length) {
                        //     $scope.appraisalInvoices = new Array(currentListLength).fill(new Object());
                        // }
                    }
                    if (angular.isDefined(resData.companyVendors) && resData.companyVendors != null) {
                        angular.forEach(resData.companyVendors, function (vendor) {
                            if (vendor.registrationNumber === $scope.JewelryVendorDetails.RegistartionNumber) {
                                $scope.ArtigemVendor.name = vendor.name;
                                $scope.ArtigemVendor.registrationNumber = $scope.JewelryVendorDetails.RegistartionNumber;
                            }
                            if (angular.isDefined(vendor.specializedCategories) && vendor.specializedCategories != null && vendor.specializedCategories.length > 0) {
                                var specialities = [];
                                angular.forEach(vendor.specializedCategories, function (item) {
                                    specialities.push(item.speciality);
                                    vendor.specializedCategories = specialities.join(', ');
                                });
                            }
                            $scope.PricingSpecialist.push(vendor);
                        });
                    }
                if($scope.CommonObj.ClaimProfile.toLowerCase() =="jewelry")
                     selectVendor($scope.ArtigemVendor);
                }else{
                   $(".page-spinner-bar").addClass("hide");
                }
            }, function (error) {
                $(".page-spinner-bar").addClass("hide");
                toastr.remove();
                toastr.error((error.data !== null) ? error.data.errorMessage : "Failed to get vendor details. please try again.", "Error");
            });
        }

        $scope.selectVendor = selectVendor;
        function selectVendor(vendor) {
            $(".page-spinner-bar").removeClass("hide");
            var paramVendor = {
                "registrationNumber": vendor.registrationNumber,
                "categories": $scope.SelectedCategories && $scope.SelectedCategories.length > 0 ? $scope.SelectedCategories : null
            };
            var VendorDetails = NewClaimService.getSelectedVendorDetails(paramVendor);
            VendorDetails.then(function (success) {
                $scope.SelectedVendorDetails = success.data.data;
                if ($scope.SelectedVendorDetails && $scope.SelectedVendorDetails.vendorContentServiceList && $scope.SelectedVendorDetails.vendorContentServiceList.length > 0) {
                    if ($scope.claimProfile.toLowerCase() === "jewelry" && $scope.SelectedVendorDetails.registrationNumber === $scope.JewelryVendorDetails.RegistartionNumber) {
                        $scope.ArtigemVendor = {
                            "name": $scope.SelectedVendorDetails.registrationNumber,
                            "registrationNumber": $scope.JewelryVendorDetails.RegistartionNumber
                        };
                    }
                    BindSelectedServices();
                }
                else {
                    toastr.remove();
                    toastr.error("No service is provided by " + vendor.name + " for selected categories. Please select different vendor and try again. For more info contact admin.", "Error", { timeOut: 0 });
                    $(".page-spinner-bar").addClass("hide");
                }
            }, function (error) {
                $(".page-spinner-bar").addClass("hide");
                toastr.remove();
                toastr.error((error.data !== null) ? error.data.errorMessage : "Failed to get vendor details. please try again.", "Error");
            });
        }

        function BindSelectedServices() {
            $(".page-spinner-bar").removeClass("hide");
            $scope.ContentServiceList = [];
            var nonServicedCategories = [];
            //For time being we are matching only first category from selected category list and getting content service for that first category by checking the id of selected first category to vendor provided category(Put debugger to see categories)
            if ($scope.SelectedCategories && $scope.SelectedCategories.length > 0) {
                angular.forEach($scope.SelectedCategories, function (seletedCategory, key) {
                    var index = $scope.SelectedVendorDetails.vendorContentServiceList.findIndex(vendorContentService => vendorContentService.category.name === seletedCategory.name);
                    if (index <= -1)
                        nonServicedCategories.push(seletedCategory.name);
                    else if (key === 0) {
                        var contentServices = $scope.SelectedVendorDetails.vendorContentServiceList[0].contentServices;
                        if (contentServices && contentServices.length > 0) {
                            angular.forEach(contentServices, function (service) {
                                if($scope.CommonObj.ClaimProfile != "Jewelry"){
                                //ctb-3410 
                                if(service.service != 'Salvage Only')
                                $scope.ContentServiceList.push(service);
                                }
                                else
                                {
                                $scope.ContentServiceList.push(service);
                                }
                            });
                        }
                    }
                });
                if (nonServicedCategories.length > 0) {
                    toastr.remove();
                    toastr.error($scope.SelectedVendorDetails.vendorName + " do not provide services for " + nonServicedCategories.join(", ") + ". Please remove item(s) from the assignment or select a different vendor and try again.", "Error", { timeOut: 0 });
                }
            }
            // Get default content services & subservices from selected vendor
            else {
                var category = $scope.SelectedVendorDetails.vendorContentServiceList.find(vendorcategory => vendorcategory.category.name === "Others");
                angular.forEach(category.contentServices, function (service) {
                    if($scope.CommonObj.ClaimProfile != "Jewelry"){
                        //ctb-3410 
                        if(service.service != 'Salvage Only')
                        $scope.ContentServiceList.push(service);
                        }
                        else
                        {
                        $scope.ContentServiceList.push(service);
                        }
                });
            }

            setTimeout(() => {
                $(".page-spinner-bar").addClass("hide");
            }, 600);
            
        }

        $scope.Servicetype = null;
        $scope.ServiceTypeDiv = "";
        $scope.isSalvage = false;
        $scope.SelectServicetype = SelectServicetype;
        function SelectServicetype() {
            $scope.minCost = 0;
            $scope.isSalvage = false
            $scope.selectedSubserviceList = [];
            if (!$scope.Servicetype) {
                $scope.ServiceTypeDiv = null
            }
            else {
                //"Quote with Contact"
                if ($scope.Servicetype == 1) {
                    $scope.ServiceTypeDiv = "Quote with Contact";
                    angular.forEach($scope.ContentServiceList, function (item) {
                        if (item.service == 'Quote With Contact') {
                            var subServices = item.subServices;
                            item.subServices = [];
                            if($scope.CommonObj.ClaimProfile.toLowerCase() === "jewelry")
                                angular.forEach(subServices, function (subservice) {
                                if(subservice.service != 'Quote Only' && subservice.service != 'Full Inspection')
                                 item.subServices.push(subservice)
                                 subservice.Selected = false;
                            });
                            else
                                angular.forEach(subServices, function (subservice) {
                                    if(subservice.service == 'Salvage')
                                     item.subServices.push(subservice)
                                     subservice.Selected = false;
                            });
                            calculateMinServiceCost();
                        }
                    });
                    $scope.PolicyDetails.applyTax = true;
                }
                //"Quote No Contact"
                else if ($scope.Servicetype == 2) {
                    $scope.ServiceTypeDiv = "Quote No Contact";
                    calculateMinServiceCost();
                    angular.forEach($scope.ContentServiceList, function (item) {
                        if (item.service == 'Quote No Contact') {
                            // angular.forEach(item.subServices, function (subservice) {
                            //     subservice.Selected = false;
                            // });
                            item.subServices = [];
                        }
                    });
                    $scope.PolicyDetails.applyTax = true;
                }
                //"Salvage"
                else if ($scope.Servicetype == 3) {
                    $scope.ServiceTypeDiv = "Salvage Only";
                    $scope.isSalvage = true;
                    $scope.salvageContentService = [];
                    angular.forEach($scope.ContentServiceList[0].subServices, function (subService){
                        if(subService.service != 'Salvage' && subService.service != 'Quote Only'){
                            $scope.salvageContentService.push(subService);
                        }
                    })
                    $scope.PolicyDetails.applyTax = false;
                    calculateMinServiceCost();
                }
            }
        };

        function calculateMinServiceCost() {
            if($scope.Servicetype !=3){
                const contract = $scope.SelectedVendorDetails.contractBaseDTO;
                $scope.minCost =0;
                var maxLineItems ;
                var additionalQuoteFee ;
                var minCost =0;
                if($scope.CommonObj.ClaimProfile.toLowerCase() === "jewelry"){
                    var itemCount = $scope.NewItemList?.length;
                    var maxLineItems = contract.jewelryMaxLineItemsPerAssignment;
                    var additionalQuoteFee = contract.jewelryAdditionalLineItemQuoteFee;
                    var quoteFee = contract.jewelryQuoteOnlyFee;
                    var minCost = 0;
    
                    if (itemCount > maxLineItems) {
                         minCost = parseFloat(quoteFee);
                         minCost = parseFloat(minCost) + parseFloat(additionalQuoteFee) * (itemCount - maxLineItems);
                         $scope.minCost = $scope.minCost + minCost;
                    }
                    else{
                         $scope.minCost = $scope.minCost + parseFloat(quoteFee);
                    }
    
                    return $scope.minCost;
                    
                }else{
                    countJewelryAndContentItems();
                    var itemCount = $scope.SelectedVendorPostLossItem?.length;
                    var maxLineItems = contract.contentsMaxLineItemsPerAssignment;
                    var additionalQuoteFee = contract.contentsAdditionalLineItemQuoteFee;
                    var quoteFee = contract.contentsQuoteOnlyFee;
                    var minCost = 0;
                }
    
                if($scope.jewelryItems?.length>0)
                {
                    minCost = parseInt(contract.jewelryQuoteOnlyFee);
                    if ($scope.jewelryItems.length > contract.jewelryMaxLineItemsPerAssignment) {
                        minCost = parseFloat(minCost * contract.jewelryMaxLineItemsPerAssignment);
                        minCost = parseFloat(minCost) + parseFloat(contract.jewelryAdditionalLineItemQuoteFee * ($scope.jewelryItems.length - contract.jewelryMaxLineItemsPerAssignment));
                        $scope.minCost = minCost;
                    }
                    else{
                        $scope.minCost = parseFloat(minCost * contract.jewelryMaxLineItemsPerAssignment); 
                    }
                    itemCount = $scope.contentItems.length;
                }
                if (itemCount > maxLineItems) {
                    minCost = parseFloat(quoteFee * maxLineItems);
                    minCost = parseFloat(minCost) + parseFloat(additionalQuoteFee) * (itemCount - maxLineItems);
                    $scope.minCost = $scope.minCost + minCost;
                }
                else{
                $scope.minCost = $scope.minCost + parseFloat(quoteFee * itemCount);
                }
                return minCost;
            }
            else{
                $scope.minCost = parseFloat($scope.NewItemList?.length *$scope.SelectedVendorDetails.contractBaseDTO.gemologistEvalFee);
            }
            
        }
    
        //assign claim to selected vendor
        $scope.AssignItemToVendor = AssignItemToVendor;
        function AssignItemToVendor() {
            $(".page-spinner-bar").removeClass("hide");
            $scope.ServiceText;
            if ($scope.Servicetype == 1) {
                $scope.ServiceText = "Quote With Contact"
            }
            else if ($scope.Servicetype == 2) {
                $scope.ServiceText = "Quote No Contact"
            }
            if ($scope.Servicetype == 3) {
                $scope.ServiceText = "Salvage Only"
            }

            if ($scope.SelectedVendorPostLossItem.length > 0) {
                if (angular.isDefined($scope.SelectedVendorDetails.registrationNumber) && $scope.SelectedVendorDetails.registrationNumber !== null) {
                    var categories = [];
                    angular.forEach($scope.SelectedCategories, function (item) {
                        categories.push({
                            "categoryId": item.id,
                            "categoryName": item.name
                        })
                    });
                    var ItemIds = [];
                    var SelectedPostItems = [];
                    angular.forEach($scope.SelectedVendorPostLossItem, function (item) {
                        SelectedPostItems.push(item);
                    });
                    var ParamAssignment = {
                        "vendorDetails": {
                            "registrationNumber": $scope.SelectedVendorDetails.registrationNumber
                        },
                        "claimBasicDetails": {
                            "claimNumber": $scope.CommonObject.ClaimNumber
                        },
                        "categories": categories,
                        "claimedItems": SelectedPostItems,
                        "requestedVendorService": {
                            "id": $scope.Servicetype,
                            "name": $scope.ServiceText,
                            "subContentServices": ($scope.selectedSubserviceList.length > 0 ? $scope.selectedSubserviceList : null)
                        },
                        "canContactInsured": true,
                        "vendorAssigment": {
                            "claimNumber": $scope.CommonObject.ClaimNumber,
                            "dueDate": null,//"12-26-2017T14:47:56Z",
                            "remark": (angular.isDefined($scope.AssignmentRemark) && $scope.AssignmentRemark != null ? $scope.AssignmentRemark : null)
                        },
                        "insuranceCompanyDetails": {
                            "crn": sessionStorage.getItem("CRN")
                        }
                    };

                    var Assign = NewClaimService.AssignItemToVendor(ParamAssignment);
                    Assign.then(function (success) {
                        $scope.selectedSubserviceList = [];
                        $scope.minCost = 0;
                        toastr.remove();
                        toastr.success((success.data !== null) ? success.data.message : "Item(s) assigned scuccessfully.", "Success");
                        sessionStorage.setItem("isItemUploaded", false);
                        $(".page-spinner-bar").addClass("hide");
                        $location.url("AdjusterDashboard");
                    }, function (error) {
                        toastr.remove();
                        toastr.error((error.data !== null) ? error.data.errorMessage : "Failed to assign item to vendor. please try again.", "Error");
                        $(".page-spinner-bar").addClass("hide");
                    });
                }
                else {
                    toastr.remove();
                    toastr.warning("Please select vendor to whome you want to assign items.", "Warning");
                    $(".page-spinner-bar").addClass("hide");
                }
            } else {
                toastr.remove();
                toastr.warning("Please select items to assign .", "Warning");
                $(".page-spinner-bar").addClass("hide");
            }
        };

        //add items in subservice List
        $scope.minCost = 0;
        $scope.selectedSubserviceList = [];
        $scope.SelectSubservice = SelectSubservice;
        function SelectSubservice(Subservices) {
            var flag = 1;
            var subservice = {
                "name": Subservices.service
            }



            angular.forEach($scope.selectedSubserviceList, function (value, index) {
                if (Subservices.service == value.name) {
                    $scope.selectedSubserviceList.splice(index, 1);
                    // $scope.minCost = $scope.minCost - Subservices.serviceCharge;
                    flag = 0;
                }
            });
            if (flag != 0 && Subservices.Selected) {
                $scope.selectedSubserviceList.push(subservice);
                // $scope.minCost = $scope.minCost + Subservices.serviceCharge;
            }
            // $scope.isSalvage = false;
            // angular.forEach($scope.selectedSubserviceList, function (item) {
            //     if (!$scope.isSalvage && item.name == 'Salvage') {
            //         $scope.isSalvage = true;
            //     }
            // });

            if($scope.Servicetype ===3)
            {
                $scope.isSalvage = true;
            }
        }

        $scope.GetCompanyBranchList = GetCompanyBranchList;
        function GetCompanyBranchList() {
            $(".page-spinner-bar").removeClass("hide");
            var param = { "id": sessionStorage.getItem("CompanyId") };
            var getBranchList = NewClaimService.getCompanyBranchList(param);
            getBranchList.then(function (success) {
                $scope.CommonObject.BranchCode = sessionStorage.getItem("BranchCode");
                $scope.CommonObject.BranchId = Number(sessionStorage.getItem("BranchId"));
                $scope.BranchList = success.data.data.companyBranches;
                $scope.item = $scope.BranchList[0].id
                if($scope.CommonObj.ClaimProfile =="Contents"){
                    $(".page-spinner-bar").addClass("hide");
                }
            }, function (error) {
                toastr.remove();
                if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                    toastr.error(error.data.errorMessage, "Error")
                }
                else {
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
                }
                $(".page-spinner-bar").addClass("hide");
            });
        }

        $scope.savePolicyClaimDetails = savePolicyClaimDetails;
        function savePolicyClaimDetails(e) {
            AddUpdatePolicy();
        }

        //For claim line item
    $scope.lastChecked = [];
    $scope.SelectMultiple = function($event,$index)
    { 
        var keyname = $scope.sortKey;
        if(keyname === undefined)
        {
            var filterlist = $scope.FiletrLostDamageList;
        }
        else
        {
            filterlist = $filter('orderBy')($scope.FiletrLostDamageList,$scope.sortKey, $scope.reverse);    
        }
      

       if($scope.lastChecked[$scope.lastChecked.length-1]!=null && $event.shiftKey)
       {  
        if($scope.lastChecked[$scope.lastChecked.length-1] <= $index)
        {      
            for(i=$scope.lastChecked[$scope.lastChecked.length-1]+1; i<=$index;i++)
            {
                item = filterlist[i];
                itemindex = $scope.FiletrLostDamageList.indexOf(item);
                // if(
                //     // !(item.status.id === 4 && item.status.status === $scope.constants.itemStatus.valued) &&
                // !(item.status.id === 6 && item.status.status === $scope.constants.itemStatus.settled) &&
                // !(item.status.id === 2 && item.status.status === $scope.constants.itemStatus.assigned))                
                // {
                $scope.FiletrLostDamageList[itemindex].Selected = true;
                // }
                $scope.SelectPostLostItem($scope.FiletrLostDamageList[itemindex]);
            }
        }
        else if($scope.lastChecked[$scope.lastChecked.length-1] > $index)
        {
            for(i=$scope.lastChecked[$scope.lastChecked.length-1]-1;i>=$index;i--)
            {
                item = filterlist[i];
                itemindex = $scope.FiletrLostDamageList.indexOf(item);
                // if(
                //     // !(item.status.id === 4 && item.status.status === $scope.constants.itemStatus.valued) &&
                // !(item.status.id === 6 && item.status.status === $scope.constants.itemStatus.settled) &&
                // !(item.status.id === 2 && item.status.status === $scope.constants.itemStatus.assigned))
                // {
                $scope.FiletrLostDamageList[itemindex].Selected = true;
                // }
                $scope.SelectPostLostItem($scope.FiletrLostDamageList[itemindex]);
            }
        }
       }
       else
       {
        if($scope.lastChecked[$scope.lastChecked.length-1] === $index && $scope.FiletrLostDamageList[$index].Selected === false)
        {
                $scope.lastChecked.pop();
        }else
        {
            $scope.lastChecked.push($index);
        }
        item = filterlist[$index];
        itemindex = $scope.FiletrLostDamageList.indexOf(item);
        $scope.SelectPostLostItem($scope.FiletrLostDamageList[itemindex]);
       }
    }

        $scope.SelectPostLostItem = function (item) {
            var flag = 0;
            angular.forEach($scope.FiletrLostDamageList, function (item) {
                if (item.Selected) {
                    flag++;
                }
            });
            var flagNew = 0;
            angular.forEach($scope.FiletrLostDamageList, function (item) {
                if (angular.isDefined(item.status) && item.status !== null) {
                    if ((item.status.id != 3 || item.status.status != 'UNDER REVIEW') && ((item.status.id != 2 || item.status.status != 'ASSIGNED'))) {
                        flagNew++;
                    }
                }
            });
            if (flag != flagNew) {
                $scope.selectedAll = false;
            }
            else if (flag == flagNew) {
                $scope.selectedAll = true;
            }
            var index = $scope.SelectedPostLostItems.indexOf(item.id);

            if (index > -1) {
                $scope.SelectedPostLostItems.splice(index, 1);
            }
            else {
                $scope.SelectedPostLostItems.push(item.id);
            }
            //$scope.SelectCategory(item);
        };
        $scope.selectedAll = false;
        $scope.checkAll = function () {
            $scope.SelectedPostLostItems = [];
            if ($scope.selectedAll) {
                $scope.selectedAll = true;
                angular.forEach($scope.FiletrLostDamageList, function (item) {
                    if ((item.status.id != 3 || item.status.status != 'UNDER REVIEW') && ((item.status.id != 2 || item.status.status != 'ASSIGNED'))) {
                        $scope.SelectedPostLostItems.push(item.id);
                    }
                });
            } else {
                $scope.selectedAll = false;
                $scope.SelectedPostLostItems = [];
            }
            angular.forEach($scope.FiletrLostDamageList, function (item) {
                if ((item.status.id != 3 || item.status.status != 'UNDER REVIEW') && ((item.status.id != 2 || item.status.status != 'ASSIGNED'))) {
                    item.Selected = $scope.selectedAll;
                }
            });
        };

        $scope.SaveItemDetailsJewelry = SaveItemDetailsJewelry;
        function SaveItemDetailsJewelry(callback) {
            $(".page-spinner-bar").removeClass("hide");
            var addedItemsNoFlag = 0;
            let itemNumber = 0;
            var CheckValidListCount = $scope.NewItemList?.length;
            var itemsArray=[];
            var param = new FormData();
            var FileDetails = [];
            var FileDetailsPerItem=[];
            var isAttachmentPresent= false;
            angular.forEach($scope.NewItemList, function (item) {
                FileDetailsPerItem=[];
                //calculateMaxItemNo();
                //Checking wheather user has enterd item details for all the items or not (only valid items will be save to database)
                if (angular.isDefined(item.selected) &&
                    (angular.isDefined(item.selected.description) && item.selected.description)) {
                    if (item.ItemAttachment.length > 0) {
                        angular.forEach(item.ItemAttachment, function (ItemFile) {
                            FileDetailsPerItem.push({
                                "fileName": ItemFile.FileName, "fileType": ItemFile.FileType,
                                "extension": ItemFile.FileExtension,
                                "filePurpose": "ITEM", "latitude": null, "longitude": null
                            });
                            param.append('file', ItemFile.File);
                        });
                        FileDetails.push(FileDetailsPerItem);
                        isAttachmentPresent = true;
                    }
                    else
                    {
                        FileDetails.push(FileDetailsPerItem);
                    }
                    itemsArray.push(
                       {
                            "ageMonths": (angular.isDefined(item.selected.ageMonths) ? item.selected.ageMonths : 0),
                            "ageYears": (angular.isDefined(item.selected.ageYears) ? item.selected.ageYears : 0),
                            "brand": item.selected.brand,
                            "category": item.selected.category ? {
                                "annualDepreciation": item.selected.category.annualDepreciation ? item.selected.category.annualDepreciation : null,
                                "id": $scope.jewelryCategory.categoryId,
                                "name": $scope.jewelryCategory.categoryId ? GetCategoryOrSubCategoryOnId(true, $scope.jewelryCategory.categoryId) : null,
                                "description": item.selected.category.description ? item.selected.category.description : null,
                                "usefulYears": item.selected.category.usefulYears ? item.selected.category.usefulYears : null,
                                "aggregateLimit": item.selected.category.aggregateLimit ? item.selected.category.aggregateLimit : null
                            } : null,
                            "categoryLimit": $scope.claimDetails.categoryLimit,
                            "claimId": $scope.CommonObject.ClaimId,
                            "itemNumber": ++itemNumber,
                            //"itemNumber": item.selected.itemNumber,
                            "claimNumber": $scope.PolicyDetails.claimNumber,
                            "appraisalValue": (angular.isDefined(item.selected.appraisalValue) ? item.selected.appraisalValue : null),
                            "appraisalDate": (angular.isDefined(item.selected.appraisalDate) ? $filter('DatabaseDateFormatMMddyyyy')(item.selected.appraisalDate) : null),
                            "depriciationRate": item.selected.depriciationRate,
                            "description": item.selected.description && item.selected.description!="" ? encodeURIComponent(item.selected.description) : "",
                            "insuredPrice": (angular.isDefined($scope.claimDetails.individualLimit) ? $scope.claimDetails.individualLimit : 0.00),//previously it was quoted prise
                            "individualLimitAmount": (angular.isDefined($scope.claimDetails.individualLimit) ? $scope.claimDetails.individualLimit : 0),
                            "itemName": (angular.isDefined(item.selected.itemName) ? item.selected.itemName : null),
                            "isScheduledItem": (angular.isDefined(item.selected.isScheduledItem) ? item.selected.isScheduledItem : false),
                            "scheduleAmount": (angular.isDefined(item.selected.scheduleAmount) ? item.selected.scheduleAmount : null),
                            "model": item.selected.model,
                            "quantity": 1,
                            "status": {
                                "id": ((item.selected.status !== null && angular.isDefined(item.selected.status)) ? item.selected.status.id : null),
                                "status": ((item.selected.status !== null && angular.isDefined(item.selected.status)) ? item.selected.status.status : null)
                            },
                            "subCategory": item.selected.subCategory ?
                                {
                                    "annualDepreciation": item.selected.subCategory.annualDepreciation ? item.selected.subCategory.annualDepreciation : null,
                                    "id": item.selected.subCategory.id,
                                    "name": item.selected.subCategory.id ? GetCategoryOrSubCategoryOnId(false, item.selected.subCategory.id) : null,
                                    "description": item.selected.description ? item.selected.description : null,
                                    "usefulYears": item.selected.usefulYears ? item.selected.usefulYears : null,
                                    "aggregateLimit": item.selected.aggregateLimit ? item.selected.aggregateLimit : null,
                                } : null,
                            // SLVG-49
                            "shippingDate": $scope.claimDetails.ShippingDate!=null ? $filter('DatabaseDateFormatMMddyyyy')($scope.claimDetails.ShippingDate) : null,
                            "shippingMethod": $scope.claimDetails.ShippingMethod,
                            "applyTax" : true
                        });
                }
            });
            if(!isAttachmentPresent)
            {
                param.append('fileDetails', null);
                param.append('file', null);
            }
            else
            param.append("filesDetails", JSON.stringify(FileDetails));
            param.append("itemDetails",JSON.stringify(itemsArray));
            var SavePostLossItem = NewClaimService.AddPostLossItems(param);
            SavePostLossItem.then(function (success) {
                addedItemsNoFlag++;
                $scope.reset();
                $scope.addedItems = success.data.data;
                $scope.addedItems.map((item)=>$scope.SelectedVendorPostLossItem.push(item.itemUID));
                AssignItemToVendor();
            },
                function (error) {
                    $(".page-spinner-bar").addClass("hide");
                    toastr.remove()
                    toastr.error(error.data.errorMessage, "Error");
                });
        }

        // Send mail to supervisor after successfully creating mail and adding Items
        $scope.$on('$locationChangeStart', function (event, next, current) {
            if ($scope.CommonObject.ClaimNumber && next.indexOf("/UploadItemsFromCSV") === -1 && !isClaimCreationMailTriggered) {
                $scope.mailToSupervisorOnClaimCreation();
                sessionStorage.removeItem("claimId");
            }
        });

        $scope.mailToSupervisorOnClaimCreation = function () {
            var param = {
                "claimNumber": $scope.CommonObject.ClaimNumber
            }
            var mailTriggered = NewClaimService.sendMailToSupervisor(param);
            mailTriggered.then(function (success) {
                isClaimCreationMailTriggered = true;
            },
                function (error) {
                    toastr.remove()
                    toastr.error(error.data.errorMessage, "Error");
                });
        }

        //End code for claim line item selection
        //Lost Damage Items
        $scope.DeletItem = DeletItem;
        function DeletItem(obj) {
            bootbox.confirm({
                size: "",
                title: $translate.instant('Confirm.DeleteItemTitle'),
                message: $translate.instant('Confirm.DeleteItemMessage'), closeButton: false,
                className: "modalcustom", buttons: {
                    confirm: {
                        label: $translate.instant('Yes'),
                        className: 'btn-success'
                    },
                    cancel: {
                        label: $translate.instant('No'),
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    if (result) {
                        var paramIdList = { "id": obj.id, "itemUID": obj.itemUID };
                        var response = NewClaimService.DeleteLostDamageItem(paramIdList);
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

        $scope.AssignItemJewelry = AssignItemJewelry;
        function AssignItemJewelry() {
            GetPostLostItems();
        };

        $scope.currentItem = null;
        $scope.SelectJewelryItemFile = function (item) {
            $scope.currentItem = item;
            angular.element('#JewelryItemFileUpload').trigger('click');
        };
        //Get jewelry item attachment details
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
                //20mb
                if (reader.file.size > 20000000) {
                    $scope.$apply(function () {
                        $scope.invalidItemFile = true;
                    });
                    return false;
                } else {
                    $scope.$apply(function () {
                        $scope.invalidItemFile = false;
                    });
                }
                reader.onload = $scope.ItemImageLoaded;
                reader.readAsDataURL(file);

            }
            angular.element("input[type='file']").val(null);
        };

        $scope.ItemImageLoaded = function (e) {
            $scope.$apply(function () {
                var itemExist = false;
                var newFilenm = e.target.fileName
                angular.forEach($scope.currentItem.ItemAttachment, function (item) {
                    var filenm = item.FileName;
                    if (filenm == newFilenm) {
                        itemExist = true;
                    }
                });
                if (!itemExist) {
                    if ($scope.currentItem != null) {
                        $scope.currentItem.ItemAttachment.push({ "FileName": e.target.fileName, "FileExtension": e.target.fileExtension, "FileType": e.target.fileType, "Image": e.target.result, "File": e.target.file, "isLocal": true })
                    }
                } else {
                    toastr.remove();
                    toastr.warning('<b>File <u>' + newFilenm + '</u> is added already! Please add another file.</b>');
                }
                $("#FileUpload").val('');
            });
        };

        $scope.removeJewelryItemattchment = removeJewelryItemattchment;
        function removeJewelryItemattchment(list, index) {
            list.splice(index, 1);
        };
        $scope.SetScheduledStatus = SetScheduledStatus;
        function SetScheduledStatus(item, status) {
            item.isScheduledItem = status;
        };

        $scope.CreateDefaultDetails = CreateDefaultDetails;
        function CreateDefaultDetails(checkCategoryCoverage) {
            if (angular.isDefined($scope.PolicyDetails.policyHolder)) {
                var PolicyInitials = "";
                var InsuranceCompanyIntials = "";
                var CurrentDate = $filter('date')(new Date(), "MMddyyyy");
                var CurrentTime = $filter('date')(new Date(), "HHmm");
                if ((angular.isDefined($scope.PolicyDetails.policyHolder.lastName) && $scope.PolicyDetails.policyHolder.lastName !== null) &&
                    (angular.isDefined($scope.PolicyDetails.policyHolder.firstName) && $scope.PolicyDetails.policyHolder.firstName !== null)) {
                    PolicyInitials += ($scope.PolicyDetails.policyHolder.firstName.charAt(0)) + "" + ($scope.PolicyDetails.policyHolder.lastName.charAt(0));
                }
                if (angular.isDefined($scope.InsuranceCompanyName) && $scope.InsuranceCompanyName !== null) {
                    $scope.InsuranceCompanyName = $scope.InsuranceCompanyName.trim();//Removing Empty spaces at left and right side
                    var abc = $scope.InsuranceCompanyName.indexOf(' ');//Checking for spaces in Company name string
                    if (abc == -1) {
                        InsuranceCompanyIntials += ($scope.InsuranceCompanyName.charAt(0)) + "" + ($scope.InsuranceCompanyName.charAt());
                        if ((angular.isDefined(PolicyInitials) && PolicyInitials.length > 0) &&
                            (angular.isDefined(InsuranceCompanyIntials) && InsuranceCompanyIntials.length > 0)) {
                            PolicyNumber = "PL" + "" + InsuranceCompanyIntials.toUpperCase() + "" + PolicyInitials.toUpperCase() + "" + CurrentDate + "" + CurrentTime.toString();
                            CustAccNumber = "CA" + "" + InsuranceCompanyIntials.toUpperCase() + "" + PolicyInitials.toUpperCase() + "" + CurrentDate + CurrentTime.toString();
                        }
                    }
                    else {
                        InsuranceCompanyIntials += ($scope.InsuranceCompanyName.charAt(0));
                        for (var i = 0; i <= $scope.InsuranceCompanyName.length; i++) {
                            if ($scope.InsuranceCompanyName[i] == " " && i < $scope.InsuranceCompanyName.length) {
                                InsuranceCompanyIntials += $scope.InsuranceCompanyName[i + 1];
                            }
                        }
                        if ((angular.isDefined(PolicyInitials) && PolicyInitials.length > 0) &&
                            (angular.isDefined(InsuranceCompanyIntials) && InsuranceCompanyIntials.length > 0)) {
                            PolicyNumber = "PL" + "" + InsuranceCompanyIntials.toUpperCase() + "" + PolicyInitials.toUpperCase() + "" + CurrentDate + CurrentTime.toString();
                            CustAccNumber = "CA" + "" + InsuranceCompanyIntials.toUpperCase() + "" + PolicyInitials.toUpperCase() + "" + CurrentDate + CurrentTime.toString();
                        }
                    }
                }
                if (checkCategoryCoverage) {
                    $scope.getCategoryCoverage();
                }
            }
        }

        $scope.ResetItem = ResetItem;
        function ResetItem(item, e) {
            item.ItemAttachment = [];
            item.selected.appraisalDate = "";
            item.selected.appraisalValue = "";
            item.selected.description = "";
            item.selected.insuredPrice = "";
            item.selected.isScheduledItem = false;
            item.selected.quantity = "";
            item.selected.scheduleAmount = "";
            item.selected.subCategory = "";
            var CurrentItemDiv = $("#" + item.id)
            var textBox = CurrentItemDiv.find('#Description_' + item.id);
            if (item.id > 1) {
                item.IsRequired = false;
            }
            textBox.focus();
            e.preventDefault();
            e.stopPropagation();
            AddItemForm.$setUntouched();
            $scope.addOtherRetailer = false;
        };

        $scope.SelectVendorPostLostItem = function (item) {
            var flag = $scope.VendorAssignmentList.filter(i => i.selected).length;
            var flagNew = 0;
            angular.forEach($scope.VendorAssignmentList, function (item) {
                if (angular.isDefined(item.status) && item.status !== null) {
                    if ((item.status.id != 3 || item.status.status != 'UNDER REVIEW') && ((item.status.id != 2 || item.status.status != 'ASSIGNED'))) {
                        flagNew++;
                    }
                }
            });
            if (flag != flagNew) {
                $scope.selectedAllVendorItem = false;
            }
            else if (flag == flagNew) {
                $scope.selectedAllVendorItem = true;
            }
            var index = $scope.SelectedVendorPostLossItem.indexOf(item.itemUID);
            if (index > -1) {
                $scope.SelectedVendorPostLossItem.splice(index, 1);
                // remove deselected category from selected item category array
                if (item.category) {
                    var removeIndex = itemCategoryIds.indexOf(item.category.id);
                    itemCategoryIds.splice(removeIndex, 1);
                }
            }
            else {
                $scope.SelectedVendorPostLossItem.push(item.itemUID);
                // Add selcedted item category to array to filter vendor companies
                if (item.category)
                    itemCategoryIds.push(item.category.id);
            }
            GetVendorsList();
            $scope.SelectCategory();
        };

        $scope.selectedAllVendorItem = false;
        $scope.checkAllVendorItem = function () {
            $scope.SelectedVendorPostLossItem = [];
            if ($scope.selectedAllVendorItem) {
                $scope.selectedAllVendorItem = true;
                angular.forEach($scope.VendorAssignmentList, function (item) {
                    if ((item.status.id != 3 || item.status.status != 'UNDER REVIEW') && ((item.status.id != 2 || item.status.status != 'ASSIGNED'))) {
                        $scope.SelectedVendorPostLossItem.push(item.itemUID);
                        if (item.category)
                            itemCategoryIds.push(item.category.id);
                    }
                });
            } else {
                $scope.selectedAllVendorItem = false;
                $scope.SelectedVendorPostLossItem = [];
                itemCategoryIds = [];
            }
            angular.forEach($scope.VendorAssignmentList, function (item) {
                if ((item.status.id != 3 || item.status.status != 'UNDER REVIEW') && ((item.status.id != 2 || item.status.status != 'ASSIGNED'))) {
                    item.Selected = $scope.selectedAllVendorItem;
                }
            });
            GetVendorsList();
            $scope.SelectCategory();
        };

        $scope.setValidation = setValidation;
        function setValidation(item) {
            if (item.id > 1) {
                if ((angular.isDefined(item.selected) && (angular.isDefined(item.selected.description) && item.selected.description.trim() !== "")) ||
                    (angular.isDefined(item.selected) && (angular.isDefined(item.selected.quantity) && item.selected.quantity.trim() !== ""))
                    || (item.selected.isScheduledItem == true && (angular.isDefined(item.selected)) && (angular.isDefined(item.selected.scheduleAmount)) && item.selected.scheduleAmount.trim() !== "")
                    || (item.selected.isScheduledItem == false && (angular.isDefined(item.selected)) && (angular.isDefined(item.selected.insuredPrice)) && item.selected.insuredPrice.trim() !== "")) {
                    item.IsRequired = true;
                }
                else {
                    item.IsRequired = false;
                }

            }

        };

        $scope.IsValidClaim = true;
        $scope.CheckClaimAvailability = CheckClaimAvailability;
        function CheckClaimAvailability() {
            if (angular.isDefined($scope.PolicyDetails.claimNumber) && $scope.PolicyDetails.claimNumber != null) {
                $scope.PolicyDetails.claimNumber = $scope.PolicyDetails.claimNumber.trim();
                if ($scope.PolicyDetails.claimNumber !== "") {
                    $(".page-spinner-bar").removeClass("hide");
                    var param = { "claimNumber": $scope.PolicyDetails.claimNumber }
                    var IsClaimAvailable = NewClaimService.IsValidClaim(param);
                    IsClaimAvailable.then(function (success) {
                        $(".page-spinner-bar").addClass("hide");
                        if (success.data.data != null) {
                            $scope.IsValidClaim = false;
                        } else {
                            $scope.IsValidClaim = true;
                        }
                    },
                        function (error) {
                            $(".page-spinner-bar").addClass("hide");
                            toastr.remove()
                            toastr.error(error.data.errorMessage, "Error");
                        });
                }
            }
        };
        $scope.item = null;
        $scope.itemImageList = null;
        $scope.index = null;
        /* Function to preview uploaded Documents */

        $scope.GetDocxDetails = GetDocxDetails;
        function GetDocxDetails(item, itemImageList, index) {
            $scope.itemImageList = itemImageList;
            $scope.index = index;
            $scope.item = item;
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
                $("#img_preview").css({
                    'right': $('.page-wrapper-middle').offset().left + 'px'
                }).show();
                // $("#img_preview").show();
            }, 100);
        }

        $scope.close = function () {
            $("#img_preview").hide();
            $scope.itemImageList = null;
            $scope.index = null;

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

        $scope.CheckAllFormValidation = CheckAllFormValidation;
        function CheckAllFormValidation(formName) {
            if ($scope.SinglePageWizard == false) {
                if ($scope.ContentsProfile.$invalid) {
                    //put your logic here
                    $scope.ContentsProfile.$touched = true;
                    $scope.JewelryClaimForm.$setPristine(true);
                    $scope.JewelryClaimForm.$setUntouched(true);
                }
                else {
                    $scope.JewelryClaimForm.$setPristine(false);
                    $scope.JewelryClaimForm.$setUntouched(true);
                    $scope.savePolicyClaimDetails()
                }
            }
            else if ($scope.SinglePageWizard == true) {
                if (($scope.JewelryClaimForm.$invalid || $scope.JewelryClaimForm.$pristine) && ($scope.AddItemForm.$invalid)) {
                    utilityMethods.validateForm($scope.JewelryClaimForm);
                }
                else {
                    $scope.JewelryClaimForm.$setPristine(true);
                    $scope.JewelryClaimForm.$setUntouched(true);
                    $scope.savePolicyClaimDetails()
                }
            }
            $(document).ready(function () {
                $(this).scrollTop(0);
            });
        };

        function SetTouched(Formcontrol) {
            Formcontrol.$touched = true
        }

        // SLVG-49
        // Get Shipping methods.
        $scope.GetShippingMethods = GetShippingMethods;
        function GetShippingMethods() {
            $(".page-spinner-bar").removeClass("hide");
            var shippingMethods = NewClaimService.getShippingMethods();
            shippingMethods.then(function (success) {
                $scope.shippingMethodsList = success.data.data;
            }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
        };

        // Sort vendors List
        $scope.sortVendors = function (keyname) {
            $scope.reverseVendorsList = ($scope.vendorSortKey === keyname) ? !$scope.reverseVendorsList : false;
            $scope.vendorSortKey = keyname;   //set the sortKey to the param passed
            GetVendorsList();
        }

        $scope.searchVendors = searchVendors
        function searchVendors(key) {
            $scope.vendorPage = 1
            GetVendorsList();
        }

        $scope.removeAttachment = removeAttachment;
        function removeAttachment(index) {
            if ($scope.IncidentImages.length > 0) {
                $scope.IncidentImages.splice(index, 1);
            }
            $scope.close();
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


        $scope.getAttachments = function (data) {
            var b64Data = data;
            var contentType = 'application/octet-stream';
            var blob = b64toBlob(b64Data, contentType);
            var url = window.URL.createObjectURL(blob);
            var downloadLink = angular.element('<a></a>');
            downloadLink.attr('href', url);
            downloadLink.attr('target', '_self');
            downloadLink.attr('download', (($scope.DocxDetails.FileName != null && angular.isDefined($scope.DocxDetails.FileName) && $scope.DocxDetails.FileName !== "") ? $scope.DocxDetails.FileName : "Document"));
            downloadLink[0].click();
        }

        $scope.deteteClaimAttachment = deteteClaimAttachment;
        function deteteClaimAttachment(document) {
            bootbox.confirm({
                size: "",
                closeButton: false,
                title: "Delet media file",
                message: "Are you sure you want to delete this Media " + document.FileName + "? <b>Please Confirm!",
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
                        var index = $scope.IncidentImages.indexOf(document);
                        $scope.IncidentImages.splice(index, 1);
                        $scope.imgDiv = false;
                    }
                }
            });
        }

        $scope.hardDeleteClaim = hardDeleteClaim;
        function hardDeleteClaim(claim) {
            bootbox.confirm({
                size: "",
                title: "Delete Claim",
                message: "Are you sure want to delete claim# " + claim.claimNumber + " ?", closeButton: false,
                className: "modalcustom", buttons: {
                    confirm: {
                        label: "Yes",
                        className: 'btn-success'
                    },
                    cancel: {
                        label: "No",
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    if (result) {
                        $(".page-spinner-bar").removeClass("hide");
                        var param =
                            { "claimNumber": claim.claimNumber };

                        var DeleteclaimAdjuster = NewClaimService.hardDeleteClaim(param);
                        DeleteclaimAdjuster.then(function (success) {
                            toastr.remove();
                            toastr.success(success.data.message, "Confirmation");
                            $location.url(sessionStorage.getItem('HomeScreen'));
                            $(".page-spinner-bar").addClass("hide");
                        }, function (error) {
                            toastr.remove()
                            toastr.error(error.data.errorMessage, $translate.instant("ErrorHeading"));
                            $(".page-spinner-bar").addClass("hide");
                        });
                    }
                }
            });
        }

        $scope.resetDetails = resetDetails;
        function resetDetails() {
            bootbox.confirm({
                size: "",
                title: "Reset Information",
                message: "Are you sure you want to discard the entered claim information?", closeButton: false,
                className: "modalcustom", buttons: {
                    confirm: {
                        label: "Yes",
                        className: 'btn-success'
                    },
                    cancel: {
                        label: "No",
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                  if(result){
                    $scope.PolicyDetails = '';
                    $scope.claimDetails = '';
                    $window.location.reload();
                  } 
                }
            });
        }

        $scope.populatePHInfo = function populatePHInfo() {
            //if (result)  call delet function
            if ($scope.PolicyDetails && $scope.PolicyDetails.policyHolder && $scope.PolicyDetails.policyHolder.email) {
                var param = {
                    "email": $scope.PolicyDetails.policyHolder.email
                }
                var policyholderDetails = NewClaimService.GetPolicyHolderDetails(param);
                policyholderDetails.then(function (success) {
                    if (success.data.data !== null && (angular.isDefined(success.data.data))) {
                        bootbox.confirm({
                            size: "",
                            closeButton: false,
                            title: "Policyhlder Info",
                            message: "This policyholder Email alreary exists! do you want to prepopulate the data? Please Confirm!",
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
                                $(".page-spinner-bar").removeClass("hide");
                                $timeout(function () {
                                    if (result) {
                                        $scope.PolicyDetails.policyHolder = success.data.data;
                                        if (success.data.data.policyHolder !== null || angular.isUndefined(success.data.data.policyHolder)) {
                                            $scope.PolicyDetails.policyHolder.cellPhone = $filter('tel')($scope.PolicyDetails.policyHolder.cellPhone);
                                            $scope.PolicyDetails.policyHolder.eveningTimePhone = $filter('tel')($scope.PolicyDetails.policyHolder.eveningTimePhone);
                                            $scope.PolicyDetails.policyHolder.dayTimePhone = $filter('tel')($scope.PolicyDetails.policyHolder.dayTimePhone);
                                        }
                                        if ($scope.PolicyDetails.policyHolder.address === null) {
                                            $scope.PolicyDetails.policyHolder.address = { "streetAddressOne": null, "streetAddressTwo": null, "city": null, "state": { id: null }, "zipcode": null };
                                        }
                                        CreateDefaultDetails(true);
                                        GetPolicyType($scope.PolicyDetails.policyHolder.address.state.id);
                                    }
                                    $(".page-spinner-bar").addClass("hide");
                                }, 500);


                            }
                        });
                    }
                }, function (error) {
                    toastr.remove();
                    toastr.error(error.data.errorMessage, "Attention");
                });
            }
        }

        $scope.confirmTaxRate = confirmTaxRate;
        function confirmTaxRate() {
            if ($scope.PolicyDetails.applyTax && $scope.PolicyDetails.taxRate == 0) {
                bootbox.confirm({
                    size: "",
                    closeButton: false,
                    title: "Tax Rate",
                    message: "Tax rate you have entered is 0.00%? Please Confirm!",
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
                        if (result) {

                        } else {
                            document.querySelector("#tax").focus();
                        }
                    }
                });
            }
        }

        // Get Item rooms
        $scope.getRooms = getRooms;
        function getRooms() {
            if ($scope.PolicyDetails) {
                var rooms = NewClaimService.getRooms($scope.PolicyDetails.claimNumber);
                rooms.then(function (success) {
                    $scope.RoomsList = success.data.data;
                }, function (error) {
                    $scope.ErrorMessage = error.data.errorMessage;
                    toastr.remove();
                    toastr.error(error.data.errorMessage, "Error");
                });
            }
        }

        // Get Item retailers
        $scope.getRetailers = getRetailers;
        function getRetailers() {
            var retailers = NewClaimService.getRetailers();
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

        $scope.selected.room = {};
        $scope.selectRoom = function (room) {
            $scope.selected.room = {
                "id": room.id,
                "roomName": room.roomName
            }
        }
        $scope.selected.retailer = {};
        $scope.selectRetailer = function (retailer) {
            $scope.selected.originallyPurchasedFrom = {
                "id": retailer.id,
                "name": retailer.name
            }
            if (retailer.name === 'Other')
                $scope.addOtherRetailer = true;
            else {
                $scope.selected.newRetailer = null;
                $scope.addOtherRetailer = false;
            }
        };

        $scope.selectPaymentmethod = function (paymentMethod) {
            if (paymentMethod === 'Gift')
                $scope.selected.originallyPurchasedFrom = null;
            else
                $scope.selected.giftedFrom = null;
        }

        // init the filtered items
        $scope.getItemsByKeyword = function () {
            $scope.FiletrLostDamageList = $scope.LostDamagedContentByCategory;
            if ($scope.searchDamagedContent != null && $scope.searchDamagedContent != '') {
                $scope.FiletrLostDamageList = $filter('filter')($scope.FiletrLostDamageList, $scope.searchDamagedContent)
            }
        }


        //Get post lost items by category
        $scope.GetItemsByCategory = function (e) {
            $scope.TempObj = [];
            $scope.VendorAssignmentListTemp = $scope.VendorAssignmentList;
            if (($scope.CommonObject.Categories === "ALL") || (angular.isUndefined($scope.CommonObject.Categories) || $scope.CommonObject.Categories === null)) {
                $scope.FiletrLostDamageList = $scope.LostDamagedContentByCategory;
                $scope.VendorAssignmentList = $scope.LostDamagedContentByCategory;
            }
            else {
                angular.forEach($scope.LostDamagedContentByCategory, function (value) {
                    if ($scope.CommonObject.Categories != null && value.category !== null) {
                        if (value.category.id == $scope.CommonObject.Categories) {
                            $scope.TempObj.push(value);
                        }
                    }
                });
                $scope.FiletrLostDamageList = $scope.TempObj;
                $scope.VendorAssignmentList = $scope.TempObj
            }
        };
        $scope.getCategoryCoverage = function () {
            //GetPolicyType($scope.PolicyDetails.policyHolder.address.state.id);
            // $scope.PolicyDetails.policyHolder.address.state.id
            if ($scope.PolicyDetails && $scope.PolicyDetails.homeownerPolicyType
                && $scope.PolicyDetails.homeownerPolicyType.id) {
                var category = $scope.DdlSourcePolicyType.find(item => item.id === $scope.PolicyDetails.homeownerPolicyType.id);
                $scope.specialLimit = category.specialLimit ? category.specialLimit : 25000;
                $scope.limit = $scope.specialLimit;
                var param = {
                    "policyTypeId": $scope.PolicyDetails.homeownerPolicyType.id,
                    "stateId": $scope.PolicyDetails.policyHolder.address.state.id
                }
                var categoryCoverage = NewClaimService.getCategoryCoverage(param);
                categoryCoverage.then(function (success) {
                    if (success.data.data) {
                        $scope.selectedCategory = [];
                        angular.forEach(success.data.data, function (item) {
                            $scope.selectedCategory.push({
                                "Name": item.categoryName, "id": item.categoryId, "categoryId": item.categoryId, "coverageLimit": item.coverageLimit, "canEdit": true,
                                "individualItemLimit": item.individualItemLimit
                            })
                        })
                        $scope.checkLimit($scope.limit);
                        $scope.showSpecialLimit = true;
                    } else {
                        $scope.selectedCategory = null;
                    }
                    $(".page-spinner-bar").addClass("hide");
                }, function (error) {
                    toastr.remove();
                    toastr.error(error.data.errorMessage, "Error");
                    $(".page-spinner-bar").addClass("hide");
                });
            }
            else
                $scope.showSpecialLimit = false;
        }
        $scope.resetLimit = function (index) {
            $scope.limit = parseFloat($scope.specialLimit);
            var totalcategoryLimit = 0;
            var i = 0;
            angular.forEach($scope.selectedCategory, function (item) {
                if (i != index)
                    totalcategoryLimit = totalcategoryLimit + ((item && item.coverageLimit) ? parseFloat(item.coverageLimit) : 0);
                i++;
            })
            $scope.limit = $scope.limit - totalcategoryLimit;
        }

        $scope.checkLimit = function (specilaLimit) {
            if ($scope.selectedCategory) {
                var totalcategoryLimit = 0.00;
                specilaLimit = (specilaLimit) ? parseFloat(specilaLimit) : 0.00
                $scope.limit = specilaLimit;
                angular.forEach($scope.selectedCategory, function (item) {
                    totalcategoryLimit = totalcategoryLimit + ((item && item.coverageLimit) ? parseFloat(item.coverageLimit) : 0);
                })
                if (specilaLimit <= totalcategoryLimit) {
                    $scope.disableAddCoverage = true;
                    $scope.limit = $scope.limit - totalcategoryLimit;

                }
                else {
                    $scope.disableAddCoverage = false;
                    $scope.limit = $scope.limit - totalcategoryLimit;
                }


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

        $scope.setSpecialLimit = function (hoId) {
            if (hoId && $scope.DdlSourcePolicyType) {
                var specialLimit = $scope.DdlSourcePolicyType.find(x => x.id == hoId);
                if (specialLimit) {
                    $scope.specialLimit = specialLimit.specialLimit;
                    $scope.showSpecialLimit = true;
                }
                else {
                    $scope.specialLimit = 25000;
                    $scope.showSpecialLimit = true;
                }
            }
        };
        $scope.playVideoOnDblClick = function () {
            var urlStr = $scope.selected.videoLink;
            if (urlStr != null && !urlStr.includes("http")) {
                urlStr = "https://" + $scope.selected.videoLink;
            }
            $window.open(urlStr, '_blank');
        };
        $scope.playVideo = function () {
            $scope.videoLinkEditable = false;
        };
        $scope.clearVideoLink = function () {
            $scope.selected.videoLink = "";
        };
        $scope.editVideoLink = function () {
            $scope.videoLinkEditable = true;
        };
        $scope.addSpclCat = function () {

            $scope.addCatCov = 'true';
        }
        $scope.viewAllItems = function(e){
            $scope.animationsEnabled = true;
            var itemsObj = [];
            itemsObj.push({items:$scope.VendorAssignmentList});
            console.log("vendorAssigment",$scope.VendorAssignmentList )
            itemsObj.push({DdlSourceCategoryList:$scope.DdlSourceCategoryList})

            // itemsObj.push({DdlSourceCategoryList:$scope.SelectedVendorPostLossItem})
            var out = $uibModal.open(
                {
                    animation: $scope.animationsEnabled,
                    size: "lg",
                    templateUrl:'views/Adjuster/itemAssignmentPopUp.html',
                    controller:"itemAssignmentPopUpController",
                    backdrop: 'static',
                    keyboard: false,
                    resolve:
                    {
                        itemsObj: function () {
                            return angular.copy(itemsObj);
                        }
                    }
                }
            );
            out.result.then(function (value) {
                $scope.VendorAssignmentList = angular.copy(value);
                $scope.SelectedPostLostItems = angular.copy(value);
                $scope.SelectedVendorPostLossItem = [];            
                angular.forEach(value, function (itemSelected) {
                    $scope.SelectVendorPostLostItem(itemSelected);
                });
            },function () {
            });
            return{
                open: open
            };
        }

        $scope.GetCategory = GetCategory;
    function GetCategory() {
        var getpromise = NewClaimService.GetCategoriesHomeAppliance();
        getpromise.then(function (success) {
            $scope.DdlSourceCategoryList = success.data.data;
            $scope.DdlClaimCategoryWithCovers = success.data.data;
            if ($scope.CommonObj.ClaimProfile == 'Jewelry') {
                $scope.jewelryCategory = angular.copy($scope.DdlSourceCategoryList.filter(function (category) {
                    return category.categoryName.toLowerCase() === "jewelry";
                })[0]);
                sessionStorage.setItem("CurrentCategoryJewelryId", $scope.jewelryCategory.categoryId);
                $scope.selected = {
                    isScheduledItem: false,
                    category: {
                        id: $scope.jewelryCategory.categoryId,
                        aggregateLimit: null,
                        individualLimitAmount: 0
                    },
                };
                $scope.selectedCategory.push($scope.jewelryCategory);
                $scope.selectedCategory[0].coverageLimit ="";
                GetSubCategory($scope.jewelryCategory.categoryId);
                $scope.NewItemList = [{
                    id: 1,
                    selected: {
                        category: $scope.jewelryCategory,
                        isScheduledItem: false
                    },
                    ItemAttachment: [],
                    IsRequired: true
                }];
                var count = 0;
                angular.forEach($scope.PolicyDetails.categories, function (item) {
                    if (item.id == $scope.selected.category.id) {
                        count++;
                        $scope.selected.category.aggregateLimit = (item.coverageLimit == null ? 0 : item.coverageLimit);
                    }
                })
                if (count == 0) {
                    $scope.selected.category.aggregateLimit = 0;
                }
                sessionStorage.setItem("CurrentCategoryJewelryCoverageLimit", $scope.selected.category.aggregateLimit)
            }
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    }

    $scope.addNewRetailer = function () {
        $scope.selected.originallyPurchasedFrom = null;
        $scope.newRetailer = true;
    }

    $scope.closeRetailer = closeRetailer;
    function closeRetailer()
    {
        $scope.newRetailer = false;
        $scope.selected.newRetailer=null
    }

    $scope.statusBasedFilter = statusBasedFilter;
    function statusBasedFilter(itemList) {
        if (itemList && itemList.length > 0) {
            $scope.TotalOfACVs = 0;
            $scope.TotalOfRCVs = 0;
            $scope.TotalOfCashExpo = 0;
            $scope.TotalOfHoldoverPaid = 0;
            $scope.TotalOfHoldoverRemaining = 0;
            $scope.TotalOfCashPaid = 0;
            $scope.TotalOfReplExpo = 0;
            for (var i = 0; i < itemList.length; i++) {
                var item = itemList[i];
                item.rcvTotal = item.rcvTotal ? item.rcvTotal : 0.0;
                item.cashPayoutExposure = item.cashPayoutExposure ? item.cashPayoutExposure : 0.0;
                item.totalStatedAmount = item.totalStatedAmount ? item.totalStatedAmount : 0.0;
                item.holdOverPaid = item.holdOverPaid ? item.holdOverPaid : 0.0;
                item.holdOverRemaining = item.holdOverRemaining ? item.holdOverRemaining : 0.0;
                item.cashPaid = item.cashPaid ? item.cashPaid : 0.0;
                item.replacementExposure = item.replacementExposure ? item.replacementExposure : 0.0;

                $scope.TotalOfCashExpo += item.cashPayoutExposure;
                $scope.TotalOfHoldoverPaid += item.holdOverPaid;
                $scope.TotalOfHoldoverRemaining += item.holdOverRemaining;
                $scope.TotalOfCashPaid += item.cashPaid;
                $scope.TotalOfReplExpo += item.replacementExposure;
                if (item.acv != null) {
                    $scope.TotalOfACVs += parseInt(item.acv);
                }
                if (item.rcvTotal != null) {
                    $scope.TotalOfRCVs += parseInt(item.rcvTotal);
                }
                item.itemNumber = Number(item.itemNumber);
            }
        }
    }

    $scope.countJewelryAndContentItems = countJewelryAndContentItems;
  function countJewelryAndContentItems()
  {
      $scope.contentItems = $scope.VendorAssignmentList.filter((item)=>item?.category?.name!="Jewelry");
      $scope.jewelryItems = $scope.VendorAssignmentList.filter((item)=>item?.category?.name=="Jewelry");
      console.log( $scope.contentItems);
      console.log(  $scope.jewelryItems);
  }

    $scope.TotalOfACVs = 0;
    $scope.TotalOfRCVs = 0;
    function mapFilterLostDamageList(param) {
        $scope.totalItems = $scope.toShowingPage = $scope.FiletrLostDamageList.length;
        var tempList = [];
        $scope.OriginalPostLossItem = $scope.FiletrLostDamageList;
        $scope.LostDamagedContentByCategory = $scope.FiletrLostDamageList;
        $scope.VendorAssignmentList = $scope.FiletrLostDamageList; //Used for vendor assignment tab
        $scope.ContentServiceList = [];
        // store item list in a factory
        LineItemsFactory.addItemsToList(angular.copy($scope.FiletrLostDamageList), param);
        if ($scope.name === "true") {
            var ItemList = sessionStorage.getItem("ItemsList");
            if (ItemList != null && angular.isDefined(ItemList)) {
                $scope.VendorAssignmentList = JSON.parse(ItemList);
                if ($scope.VendorAssignmentList.length == 0) {
                    $scope.VendorAssignmentList = $scope.FiletrLostDamageList;
                }
            }
            var SelectedPostlossItems = sessionStorage.getItem("SelectedItemsList");
            if (SelectedPostlossItems != null && angular.isDefined(SelectedPostlossItems)) {
                $scope.SelectedVendorPostLossItem = JSON.parse(SelectedPostlossItems);
                if ($scope.SelectedVendorPostLossItem.length == 0) {
                    $scope.SelectedVendorPostLossItem = [];
                    $scope.selectedAllVendorItem = false;
                    $scope.SelectedCategories = [];
                }
                else {
                    $scope.selectedAllVendorItem = true;
                    $scope.SelectCategory();
                }
            }
            var ItemStatus = sessionStorage.getItem("ItemsStatus");
            if (ItemStatus != null && angular.isDefined(ItemStatus)) {
                if (ItemStatus === "true") {
                    $scope.selectedAllVendorItem = true;
                }
                else {
                    $scope.selectedAllVendorItem = false;
                }
            }
            else {
                $scope.selectedAllVendorItem = false;
            }
        }
        else {
            $scope.SelectedVendorPostLossItem = [];
            $scope.selectedAllVendorItem = false;
            $scope.SelectedCategories = [];
        }
    }
   
    });

  

MetronicApp.directive('select', function () {
    return {
        restrict: 'E',
        require: '?ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            if (ngModelCtrl && attr.multiple) {
                ngModelCtrl.$isEmpty = function (value) {
                    return !value || value.length === 0;
                }
            }
        }
    }
});
