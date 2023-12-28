angular.module('MetronicApp')
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
    }).controller('NewThirdPartyVendorController', function ($rootScope, $scope, settings, $filter, $translate, $translatePartialLoader, $location,
        AdjusterPropertyClaimDetailsService, $uibModal, $timeout, ThirdPartyContractService, utilityMethods) {

        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });
        //set language
        $translatePartialLoader.addPart('AdjusterNewThirdPartyVendor');
        $translate.refresh();
        $scope.catalogsList = [];
        $scope.CategoryList = [];
        $scope.catalogItemsList = [];
        $scope.CurrentClaimTab = "VendorDetails";
        $scope.ExportCategories = [];
        $scope.SelectedCategory = [];
        $scope.NewVendor = {};
        $scope.ContractDetails = {};
        $scope.ContactDeatils = [{ id: null, email: '', firstName: '', lastName: '', workPhoneNumber: '', mobilePhoneNumber: '' }];
        $scope.counter = 0;
        $scope.PhoneNumbers = [{ Type: '', PhoneNo: '' }];
        $scope.phonecounter = 0;
        $scope.ddlStateList = [];
        $scope.commObj = { "BillingState": null, "ShippingState": null };
        $scope.SpecialtyOfSpecialist;
        $scope.ShowDetails;
        $scope.NewContract = false;
        $scope.isClaimContract = true;
        $scope.EmailTemplateList = [];
        $scope.EmailDetails = {};
        $scope.ContractTypeList = [{ id: 1, name: "Claim" }, { id: 2, name: "Salvage" }, { id: 3, name: 'SpeedCheck' }];
        $scope.ContractType;
        $scope.ErrorMessage = "";
        $scope.SalvageContractList = [];
        $scope.salvageDetails = {};
        $scope.CatalogsList = [];
        $scope.SpecialtyOfSpecialist;
        $scope.contractUID = "";
        $scope.claimContractExists = false;
        $scope.salvageContractExists = false;
        $scope.speedcheckContractExists = false;
        $scope.contractSpeedCheckForm = {};

        $scope.speedCheckContractDetails = {
            'newlyCreated': 5,
            'updatedAppraisal': 3,
            //  slab1 = 1 - 30,000
            'artigemReview_slab1': 10,
            //  slab2 = 30,000 - 100,000
            'artigemReview_slab2': 15,
            //  slab3 = more that 1,00,000
            'artigemReview_slab3': 25
        }

        function init() {
            // $scope.ContractType = 1;
            getVendorList();
            //GetContract();
            $scope.IsEdit;
            $scope.salvageDetails.immediateRepair = "true";
            $scope.salvageDetails.immediateSettlement = "true";

            $scope.ShowDetails = "VendorDetails";
            angular.element('#select2insidemodal').select2({});

            var param =
            {
                "isTaxRate": false,
                "isTimeZone": false
            }
            var getStateList = AdjusterPropertyClaimDetailsService.getStates(param);
            getStateList.then(function (success) {
                $scope.ddlStateList = success.data.data;
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
            });
            GetVendorDetails();
        }

        init();

        $scope.getVendorList = getVendorList;
        function getVendorList() {
            $(".page-spinner-bar").removeClass("hide");
            var param =
            {
                "companyId": sessionStorage.getItem("CompanyId"),
                "claimNumber": null
            };
            var GetVendorsList = AdjusterPropertyClaimDetailsService.GetVendorsList(param);
            GetVendorsList.then(function (success) {
                $scope.ActiveVendorsList = success.data.data;
                // $scope.ContractDetails = {
                //     vendor: {
                //         vendorId: parseInt(sessionStorage.getItem("VendorId"))
                //     }
                // };
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                if (error != null) {
                    toastr.remove();
                    toastr.error(error.data.errorMessage, "Error");
                }
                else {
                    toastr.remove();
                    toastr.error(AuthHeaderService.getGenericgenericErrorMessage(), "Error");
                }
                $(".page-spinner-bar").addClass("hide");
            });
        }

        $scope.GoBack = GoBack;
        function GoBack() {
            sessionStorage.setItem("VendorDetailsId", null);
            $location.url('ContractedVendor');
        };
        $scope.GoToDashboard = GoToDashboard;
        function GoToDashboard() {
            sessionStorage.setItem("VendorDetailsId", null);
            $location.url(sessionStorage.getItem('HomeScreen'));
        }

        //invite vendor   
        $scope.AddVendor = function () {
            $scope.InviteVendorDetails = false;
            $scope.AddVendorDetails = true;
        };

        //Contract
        $scope.AddNewContract = AddNewContract;
        function AddNewContract() {
            if ($scope.claimContractExists && $scope.salvageContractExists && $scope.speedcheckContractExists) {
                bootbox.alert({
                    message: "Contract already exists for all three types!",
                    backdrop: false
                });
            }
            else {
                $scope.ContractDetails = {
                    vendor: {
                        vendorId: parseInt(sessionStorage.getItem("VendorId"))
                    },
                    'contractName': '',
                    'startDate': '',
                    'endDate': ''
                };

                /**
                 * Contracts Dropdown Based On Selected Contract Types.
                 */
                $scope.ContractType = 1;
                $scope.showClaimContract = true;
                $scope.showSalvageContract = false;
                $scope.showSpeedCheckContract = false;
                $scope.ContractTypeList = $scope.ContractTypeList.filter(function () { return true; });

                if ($scope.claimContractExists) {
                    $scope.ContractTypeList = $scope.ContractTypeList.filter(e => e.id !== 1);
                    $scope.ContractType = 2;
                    $scope.showClaimContract = false;
                    $scope.showSalvageContract = true;
                }
                if ($scope.salvageContractExists) {
                    $scope.ContractTypeList = $scope.ContractTypeList.filter(e => e.id !== 2);
                    $scope.ContractType = 1;
                    $scope.showClaimContract = true;
                    $scope.showSalvageContract = false;
                }
                if ($scope.speedcheckContractExists) {
                    $scope.ContractTypeList = $scope.ContractTypeList.filter(e => e.id !== 3);
                    $scope.ContractType = 1;
                    $scope.showClaimContract = true;
                    $scope.showSpeedCheckContract = false;
                }

                if (!$scope.claimContractExists && $scope.salvageContractExists && $scope.speedcheckContractExists) {
                    $scope.showClaimContract = true;
                    $scope.showSalvageContract = false;
                    $scope.showSpeedCheckContract = false;
                    $scope.ContractType = 1;
                    $scope.ContractTypeList = $scope.ContractTypeList.filter(e => e.id === 1);
                }

                if (!$scope.salvageContractExists && $scope.speedcheckContractExists && $scope.claimContractExists) {
                    $scope.showClaimContract = false;
                    $scope.showSalvageContract = true;
                    $scope.showSpeedCheckContract = false;
                    $scope.ContractType = 2;
                    $scope.ContractTypeList = $scope.ContractTypeList.filter(e => e.id === 2);
                }

                if (!$scope.speedcheckContractExists && $scope.claimContractExists && $scope.salvageContractExists) {
                    $scope.showClaimContract = false;
                    $scope.showSalvageContract = false;
                    $scope.showSpeedCheckContract = true;
                    $scope.ContractType = 3;
                    $scope.ContractTypeList = $scope.ContractTypeList.filter(e => e.id === 3);
                }



                $scope.NewContract = true;
                $scope.editContract = false;
                $scope.files = [];
            }
        }

        $scope.EditContract = EditContract;
        function EditContract(item) {

            $scope.editContract = true;
            $scope.NewContract = true;

            if (item.contractType === 'CLAIM') {
                $scope.showClaimContract = true;
                $scope.showSalvageContract = false;
                $scope.showSpeedCheckContract = false;
            }

            if (item.contractType === 'SPEEDCHECK') {
                $scope.showClaimContract = false;
                $scope.showSalvageContract = false;
                $scope.showSpeedCheckContract = true;
            }

            var parm = {
                "id": item.id
            }

            var GetContracts = ThirdPartyContractService.getContractsDetails(parm);
            GetContracts.then(function (success) {
                $scope.editAttachmentList = [];
                $scope.ContractDetails = success.data.data;
                $scope.contractUID = $scope.ContractDetails.contractUID;
                $scope.ContractDetails.startDate = (angular.isDefined($scope.ContractDetails.startDate) && $scope.ContractDetails.startDate != null) ? ($filter('DateFormatMMddyyyy')($scope.ContractDetails.startDate)) : null
                $scope.ContractDetails.endDate = (angular.isDefined($scope.ContractDetails.endDate) && $scope.ContractDetails.endDate != null) ? ($filter('DateFormatMMddyyyy')($scope.ContractDetails.endDate)) : null;
                $scope.ContractTypeList = $scope.ContractTypeList.filter(function () { return true; });
                if ($scope.ContractDetails.contractType == 'CLAIM') {
                    angular.forEach($scope.ContractDetails.attachments, function (item) {
                        $scope.editAttachmentList.push({
                            "FileName": item.name,
                            "url": item.url,
                            "purpose": item.filePurpose,
                            "FileType": item.name.split('.').pop()
                        });
                    });
                    $scope.ContractType = 1;
                    $scope.contractName = $scope.ContractTypeList.filter(function (item) {
                        return item.id === $scope.ContractType;
                    })[0];
                } else {
                    angular.forEach($scope.ContractDetails.attachments, function (item) {
                        $scope.editAttachmentList.push({
                            "FileName": item.name,
                            "url": item.url,
                            "purpose": item.filePurpose,
                            "FileType": item.name.split('.').pop()
                        });
                    });

                    angular.forEach($scope.ContractDetails.invoiceValuesList, function (item) {
                        if (item.newlyCreated) {
                            $scope.speedCheckContractDetails.newlyCreated = item.newlyCreated;
                        }
                        if (item.updatedAppraisal) {
                            $scope.speedCheckContractDetails.updatedAppraisal = item.updatedAppraisal;
                        }
                        if (item.artigemReview_slab1) {
                            $scope.speedCheckContractDetails.artigemReview_slab1 = item.artigemReview_slab1;
                        }
                        if (item.artigemReview_slab2) {
                            $scope.speedCheckContractDetails.artigemReview_slab2 = item.artigemReview_slab2;
                        }
                        if (item.artigemReview_slab3) {
                            $scope.speedCheckContractDetails.artigemReview_slab3 = item.artigemReview_slab3;
                        }
                    });
                    $scope.ContractType = 3;
                    $scope.contractName = $scope.ContractTypeList.filter(function (item) {
                        return item.id === $scope.ContractType;
                    })[0];
                }
            },
                function (error) {
                    $scope.files = [];
                    //Display error message
                });
        }

        $scope.editContract = false;
        $scope.EditSalvageContract = EditSalvageContract;
        function EditSalvageContract(item) {
            $(".page-spinner-bar").removeClass("hide");

            $scope.editContract = true;
            $scope.NewContract = true;
            item.contractType = 'SALVAGE';

            if (item.contractType === 'SALVAGE') {
                $scope.showClaimContract = false;
                $scope.showSalvageContract = true;
                $scope.showSpeedCheckContract = false;
            }

            var parm = {
                "id": item.id
            }

            var GetContracts = ThirdPartyContractService.getSalvageContractsDetails(parm);
            GetContracts.then(function (success) {
                $scope.salvageDetails = success.data.data;
                $scope.salvageDetails.immediateRepair = ($scope.salvageDetails.immediateRepair) ? "true" : "false";
                $scope.salvageDetails.immediateSettlement = ($scope.salvageDetails.immediateSettlement) ? "true" : "false";
                $scope.ContractType = 2;
                $scope.contractName = $scope.ContractTypeList.filter(function (item) {
                    return item.id === $scope.ContractType;
                })[0];
                $scope.contractUID = $scope.salvageDetails.contractUID;
                $scope.ContractDetails.contractUID = $scope.salvageDetails.contractUID;
                $scope.ContractDetails.vendor = $scope.salvageDetails.vendor;
                $scope.ContractDetails.contractName = $scope.salvageDetails.contractName;
                $scope.ContractDetails.startDate = (angular.isDefined($scope.salvageDetails.startDate) && $scope.salvageDetails.startDate != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.startDate)) : null
                $scope.ContractDetails.endDate = (angular.isDefined($scope.salvageDetails.expirationDate) && $scope.salvageDetails.expirationDate != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.expirationDate)) : null;

                $(".page-spinner-bar").addClass("hide");
            },
                function (error) {
                    //Display error message
                });
        }

        // Claim Contracts
        $scope.GetContract = GetContract;
        function GetContract() {
            $(".page-spinner-bar").removeClass("hide");
            var GetContracts = ThirdPartyContractService.getContracts();
            GetContracts.then(function (success) {
                var contractListAll = success.data.data;
                var contractList = contractListAll.filter((contract)=>contract.vendor.vendorNumber == $scope.VendorDetails.vendorNumber);
                $scope.ContractList = [];
                $scope.speedCheckContractList = [];
                angular.forEach(contractList, function (item) {
                    if (item != null && item.active && item.contractType === 'SPEEDCHECK') {
                        $scope.speedCheckContractList.push(item);
                        if (item.expiry !== true) {
                            $scope.speedcheckContractExists = true;
                        }
                        $scope.ContractType = 3;
                    }
                    if (item != null && item.active && item.contractType === 'CLAIM') {
                        $scope.ContractList.push(item);
                        if (item.expiry !== true) {
                            $scope.claimContractExists = true;
                        }
                        $scope.ContractType = 1;
                    }

                });

                $(".page-spinner-bar").addClass("hide");

            },
                function (error) {
                    $scope.ContractList = [];
                    $scope.speedCheckContractList = [];
                    if (error != null) {
                        toastr.remove();
                        toastr.error(error.data.errorMessage, "Error");
                    }
                    else {
                        toastr.remove();
                        toastr.error(AuthHeaderService.getGenericgenericErrorMessage(), "Error");
                    }
                    $(".page-spinner-bar").addClass("hide");
                });
        }

        //Salvage Contract
        $scope.GetSalvageContract = GetSalvageContract;
        function GetSalvageContract() {
            $(".page-spinner-bar").removeClass("hide");
            var GetContracts = ThirdPartyContractService.getSalvageContracts();
            GetContracts.then(function (success) {
                $scope.AllSalvageContractList = success.data.data;
                $scope.SalvageContractList = $scope.AllSalvageContractList?.filter((contract)=>contract.vendor.vendorNumber == $scope.VendorDetails.vendorNumber);
                angular.forEach($scope.SalvageContractList, function (item) {
                    if (item.active) {
                        if (item.expiry !== true) {
                            $scope.salvageContractExists = true;
                        }
                        $scope.ContractType = 2;
                    }
                });

                $(".page-spinner-bar").addClass("hide");

            },
                function (error) {
                    if (error != null) {
                        toastr.remove();
                        toastr.error(error.data.errorMessage, "Error");
                    }
                    else {
                        toastr.remove();
                        toastr.error(AuthHeaderService.getGenericgenericErrorMessage(), "Error");
                    }
                    $(".page-spinner-bar").addClass("hide");
                });
        }

        $scope.ContractKey = "startDate";
        $scope.reverseContract = true;
        $scope.sortContract = function (key) {
            $scope.ContractKey = key;   //set the sortKey to the param passed     
            $scope.reverseContract = !$scope.reverse; //if true make it false and vice versa
        };


        //Save Claim Contract
        $scope.saveContract = saveContract;
        function saveContract() {

            $scope.isInvalidForm = false;


            // if ($scope.contractClaimForm.$invalid) {

            //     utilityMethods.validateForm($scope.contractClaimForm);
            //     $scope.isInvalidForm = true;

            // }
            // if ($scope.NewContractForm.$invalid) {

            //     utilityMethods.validateForm($scope.NewContractForm);
            //     $scope.isInvalidForm = true;
            // }

            if (!$scope.isInvalidForm) {
                $(".page-spinner-bar").removeClass("hide");
                var data = new FormData();
                //Append File
                if ($scope.files !== null && angular.isDefined($scope.files)) {
                    var FileDetails = [];
                    angular.forEach($scope.files, function (item) {
                        FileDetails.push({
                            "extension": item.FileExtension,
                            "fileName": item.FileName,
                            "fileType": item.FileType,
                            "filePurpose": "CLAIM_CONTRACT"
                        });
                        data.append("attachment", item.File);
                    });
                    data.append("filesDetails", JSON.stringify(FileDetails));
                }
                else {
                    data.append("filesDetails", null);
                    data.append("attachment", null);
                }

                if ($scope.ContractDetails.id !== null && angular.isDefined($scope.ContractDetails.id)) {
                    var contractDetails = {
                        "id": $scope.ContractDetails.id,
                        "contractNumber": null,
                        "contractName": $scope.ContractDetails.contractName,
                        "startDate": $filter('DatabaseDateFormatMMddyyyy')($scope.ContractDetails.startDate),
                        "endDate": $filter('DatabaseDateFormatMMddyyyy')($scope.ContractDetails.endDate),
                        "maxClaimTime": $scope.ContractDetails.maxClaimTime,
                        "contractStatus": {
                            "id": $scope.ContractDetails.contractStatus.id,
                        },
                        "vendor": {
                            "vendorId": $scope.ContractDetails.vendor.vendorId,
                        },
                        "company": {
                            "id": sessionStorage.getItem("CompanyId"),
                        },
                        "initialResponseTime": $scope.ContractDetails.initialResponseTime,
                        "followUpResponseTime": $scope.ContractDetails.followUpResponseTime,
                        "shippingCharge": $scope.ContractDetails.shippingCharge,
                        "pickupFee": $scope.ContractDetails.pickupFee,

                        "jewelryQuoteOnlyFee": $scope.ContractDetails.jewelryQuoteOnlyFee,
                        "jewelryMaxLineItemsPerAssignment": $scope.ContractDetails.jewelryMaxLineItemsPerAssignment,
                        "jewelryAdditionalLineItemQuoteFee": $scope.ContractDetails.jewelryAdditionalLineItemQuoteFee,
                        "jewelryFullEvaluationFee": $scope.ContractDetails.jewelryFullEvaluationFee,

                        "gemologistEvalFee": $scope.ContractDetails.gemologistEvalFee,
                        "gemologistEvalFullReportFee": $scope.ContractDetails.gemologistEvalFullReportFee,
                        "contractType": $scope.ContractDetails.contractType,

                        "quoteTimeUpTo5Items": $scope.ContractDetails.quoteTimeUpTo5Items,
                        "quoteTimeUpTo99Items": $scope.ContractDetails.quoteTimeUpTo99Items,
                        "quoteTime100To299Items": $scope.ContractDetails.quoteTime100To299Items,
                        "quoteTime300PlusItems": $scope.ContractDetails.quoteTime300PlusItems,

                        "contentsQuoteOnlyFee": $scope.ContractDetails.contentsQuoteOnlyFee,
                        "contentsMaxLineItemsPerAssignment": $scope.ContractDetails.contentsMaxLineItemsPerAssignment,
                        "contentsAdditionalLineItemQuoteFee": $scope.ContractDetails.contentsAdditionalLineItemQuoteFee
                    }

                    data.append("contractDetails", JSON.stringify(contractDetails));
                    var SaveContracts = ThirdPartyContractService.UpdateContracts(data);
                    SaveContracts.then(function (success) {
                        $scope.GetContract();
                        $scope.CancelNewContract();
                        $(".page-spinner-bar").addClass("hide");
                        toastr.remove();
                        toastr.success(((success.data !== null) ? success.data.message : "Contract details saved successfully."), "Confirmation");
                    },
                        function (error) {
                            toastr.remove();
                            toastr.error(((error.data !== null) ? error.data.message : "Failed to save the contract details. please try again"), "Error");
                            $(".page-spinner-bar").addClass("hide");
                        });
                }
                else {

                    var contractDetails = {
                        "id": null,
                        "contractNumber": null,
                        "contractName": $scope.ContractDetails.contractName,
                        "startDate": $filter('DatabaseDateFormatMMddyyyy')($scope.ContractDetails.startDate),
                        "endDate": $filter('DatabaseDateFormatMMddyyyy')($scope.ContractDetails.endDate),
                        "maxClaimTime": $scope.ContractDetails.maxClaimTime,
                        "contractStatus": {
                            "status": "IN-FORCE"
                        },
                        "vendor": {
                            "vendorId": $scope.ContractDetails.vendor.vendorId,
                        },
                        "company": {
                            "id": sessionStorage.getItem("CompanyId"),
                        },
                        "initialResponseTime": $scope.ContractDetails.initialResponseTime,
                        "followUpResponseTime": $scope.ContractDetails.followUpResponseTime,
                        "shippingCharge": $scope.ContractDetails.shippingCharge,
                        "pickupFee": $scope.ContractDetails.pickupFee,
                        "quoteOnlyFee": $scope.ContractDetails.quoteOnlyFee,
                        "maxLineItemAssignmentFee": $scope.ContractDetails.maxLineItemAssignmentFee,
                        "additionalLineItemQuoteFee": $scope.ContractDetails.additionalLineItemQuoteFee,
                        "fullEvaluationFee": $scope.ContractDetails.fullEvaluationFee,
                        "gemologistEvalFee": $scope.ContractDetails.gemologistEvalFee,
                        "gemologistEvalFullReportFee": $scope.ContractDetails.gemologistEvalFullReportFee,
                        "contractType": "CLAIM",

                        "jewelryQuoteOnlyFee": $scope.ContractDetails.jewelryQuoteOnlyFee,
                        "jewelryMaxLineItemsPerAssignment": $scope.ContractDetails.jewelryMaxLineItemsPerAssignment,
                        "jewelryAdditionalLineItemQuoteFee": $scope.ContractDetails.jewelryAdditionalLineItemQuoteFee,
                        "jewelryFullEvaluationFee": $scope.ContractDetails.jewelryFullEvaluationFee,

                        "quoteTimeUpTo5Items": $scope.ContractDetails.quoteTimeUpTo5Items,
                        "quoteTimeUpTo99Items": $scope.ContractDetails.quoteTimeUpTo99Items,
                        "quoteTime100To299Items": $scope.ContractDetails.quoteTime100To299Items,
                        "quoteTime300PlusItems": $scope.ContractDetails.quoteTime300PlusItems,

                        "contentsQuoteOnlyFee": $scope.ContractDetails.contentsQuoteOnlyFee,
                        "contentsMaxLineItemsPerAssignment": $scope.ContractDetails.contentsMaxLineItemsPerAssignment,
                        "contentsAdditionalLineItemQuoteFee": $scope.ContractDetails.contentsAdditionalLineItemQuoteFee
                    };
                    data.append("contractDetails", JSON.stringify(contractDetails));
                    var SaveContracts = ThirdPartyContractService.NewContract(data);
                    SaveContracts.then(function (success) {
                        $scope.GetContract();
                        $scope.CancelNewContract();
                        toastr.remove();
                        toastr.success(((success.data !== null) ? success.data.message : "Contract details updated successfully."), "Confirmation");
                        $(".page-spinner-bar").addClass("hide");
                    },
                        function (error) {
                            toastr.remove();
                            toastr.error(((error.data !== null) ? error.data.message : "Failed to update the contract details. please try again"), "Error");
                            $(".page-spinner-bar").addClass("hide");
                        });
                }
            }
        }

        $scope.fieldEmptyMessage = false;

        //Save Salvage Contract
        $scope.saveSalvegContract = saveSalvegContract;
        function saveSalvegContract() {
            $scope.isInvalidForm = false;

            // if ($scope.contractSalvageForm.$invalid) {
            //     utilityMethods.validateForm($scope.contractSalvageForm);
            //     $scope.isInvalidForm = true;
            // }

            // if ($scope.NewContractForm.$invalid) {
            //     utilityMethods.validateForm($scope.NewContractForm);
            //     $scope.isInvalidForm = true;
            // }

            if (!$scope.isInvalidForm) {
                $(".page-spinner-bar").removeClass("hide");
                var data = new FormData();
                //Append File

                if ($scope.files !== null & angular.isDefined($scope.files)) {
                    var FileDetails = [];
                    angular.forEach($scope.files, function (item) {
                        FileDetails.push({
                            "extension": item.FileExtension,
                            "fileName": item.FileName,
                            "fileType": item.FileType,
                            "filePurpose": "SALVAGE_CONTRACT",
                            "documentComments": null
                        });
                        data.append("attachment", item.File);
                    });
                    data.append("filesDetails", JSON.stringify(FileDetails));
                }
                else {
                    data.append("filesDetails", null);
                    data.append("attachment", null);
                }

                if ($scope.salvageDetails.id !== null && angular.isDefined($scope.salvageDetails.id)) {
                    var salvageDetails = {
                        "id": $scope.salvageDetails.id,
                        "contractNumber": $scope.ContractDetails.contractUID,
                        "contractName": $scope.ContractDetails.contractName,
                        "startDate": $filter('DatabaseDateFormatMMddyyyy')($scope.ContractDetails.startDate),
                        "expirationDate": $filter('DatabaseDateFormatMMddyyyy')($scope.ContractDetails.endDate),
                        "vendor": {
                            "vendorId": angular.isDefined($scope.ContractDetails.vendor) ? $scope.ContractDetails.vendor.vendorId : parseInt(sessionStorage.getItem("VendorId")),
                        },
                        "immediateRepair": $scope.salvageDetails.immediateRepair,
                        "immediateSettlement": $scope.salvageDetails.immediateSettlement,
                        "salvageMetal": $scope.salvageDetails.salvageMetal,
                        "finishedJewlery0_5": $scope.salvageDetails.finishedJewlery0_5,
                        "finishedJewlery5_15": $scope.salvageDetails.finishedJewlery5_15,
                        "finishedJewlery15_5": $scope.salvageDetails.finishedJewlery15_5,
                        "finishedJewlery5": $scope.salvageDetails.finishedJewlery5,
                        "looseDiamonds0_5": $scope.salvageDetails.looseDiamonds0_5,
                        "looseDaimond5_15": $scope.salvageDetails.looseDaimond5_15,
                        "looseDiamond15_5": $scope.salvageDetails.looseDiamond15_5,
                        "looseDiamond5": $scope.salvageDetails.looseDiamond5,
                        "retailLooseStones": $scope.salvageDetails.retailLooseStones,
                        "wholesaleLooseStones": $scope.salvageDetails.wholesaleLooseStones,
                        "purchaseByArtigem": $scope.salvageDetails.purchaseByArtigem,
                        "priceDecrease30": $scope.salvageDetails.priceDecrease30,
                        "priceDecrease60": $scope.salvageDetails.priceDecrease60,
                        "priceDecrease90": $scope.salvageDetails.priceDecrease90,
                        "commissionRate0_5": $scope.salvageDetails.commissionRate0_5,
                        "commissionRate5_15": $scope.salvageDetails.commissionRate5_15,
                        "commissionRate15_5": $scope.salvageDetails.commissionRate15_5,
                        "commissionRate5": $scope.salvageDetails.commissionRate5
                    }

                    data.append("salvageDetails", JSON.stringify(salvageDetails));
                    var SaveContracts = ThirdPartyContractService.UpdateSalvageContracts(data);
                    SaveContracts.then(function (success) {
                        $scope.GetSalvageContract();
                        $scope.CancelNewContract();
                        $(".page-spinner-bar").addClass("hide");
                        toastr.remove();
                        toastr.success(((success.data !== null) ? success.data.message : "Contract details saved successfully."), "Confirmation");
                    },
                        function (error) {
                            toastr.remove();
                            toastr.error(((error.data !== null) ? error.data.message : "Failed to save the contract details. please try again"), "Error");
                            $(".page-spinner-bar").addClass("hide");
                        });
                }
                else {
                    var salvageDetails = {
                        "id": null,
                        "contractNumber": null,
                        "contractName": $scope.ContractDetails.contractName,
                        "startDate": $filter('DatabaseDateFormatMMddyyyy')($scope.ContractDetails.startDate),
                        "expirationDate": $filter('DatabaseDateFormatMMddyyyy')($scope.ContractDetails.endDate),
                        "vendor": {
                            "vendorId": angular.isDefined($scope.ContractDetails.vendor) ? $scope.ContractDetails.vendor.vendorId : parseInt(sessionStorage.getItem("VendorId")),
                        },
                        "immediateRepair": $scope.salvageDetails.immediateRepair,
                        "immediateSettlement": $scope.salvageDetails.immediateSettlement,

                        "salvageMetal": $scope.salvageDetails.salvageMetal,
                        "finishedJewlery0_5": $scope.salvageDetails.finishedJewlery0_5,
                        "finishedJewlery5_15": $scope.salvageDetails.finishedJewlery5_15,
                        "finishedJewlery15_5": $scope.salvageDetails.finishedJewlery15_5,
                        "finishedJewlery5": $scope.salvageDetails.finishedJewlery5,
                        "looseDiamonds0_5": $scope.salvageDetails.looseDiamonds0_5,
                        "looseDaimond5_15": $scope.salvageDetails.looseDaimond5_15,
                        "looseDiamond15_5": $scope.salvageDetails.looseDiamond15_5,
                        "looseDiamond5": $scope.salvageDetails.looseDiamond5,
                        "retailLooseStones": $scope.salvageDetails.retailLooseStones,
                        "wholesaleLooseStones": $scope.salvageDetails.wholesaleLooseStones,
                        "purchaseByArtigem": $scope.salvageDetails.purchaseByArtigem,
                        "priceDecrease30": $scope.salvageDetails.priceDecrease30,
                        "priceDecrease60": $scope.salvageDetails.priceDecrease60,
                        "priceDecrease90": $scope.salvageDetails.priceDecrease90,
                        "commissionRate0_5": $scope.salvageDetails.commissionRate0_5,
                        "commissionRate5_15": $scope.salvageDetails.commissionRate5_15,
                        "commissionRate15_5": $scope.salvageDetails.commissionRate15_5,
                        "commissionRate5": $scope.salvageDetails.commissionRate5
                    };
                    data.append("salvageDetails", JSON.stringify(salvageDetails));
                    var SaveContracts = ThirdPartyContractService.UpdateSalvageContracts(data);
                    SaveContracts.then(function (success) {
                        $scope.GetSalvageContract();
                        $scope.CancelNewContract();
                        toastr.remove();
                        toastr.success(((success.data !== null) ? success.data.message : "Contract details updated successfully."), "Confirmation");
                        $(".page-spinner-bar").addClass("hide");
                    },
                        function (error) {
                            toastr.remove();
                            toastr.error(((error.data !== null) ? error.data.message : "Failed to update the contract details. please try again"), "Error");
                            $(".page-spinner-bar").addClass("hide");
                        });
                }
            }
        }


        //Save Speedcheck Contract
        $scope.saveSpeedCheckContract = saveSpeedCheckContract;
        function saveSpeedCheckContract() {

            $scope.isInvalidForm = false;
            // if ($scope.contractSpeedCheckForm.$invalid) {
            //     utilityMethods.validateForm($scope.contractSpeedCheckForm);
            //     $scope.isInvalidForm = true;
            // }

            // if ($scope.NewContractForm.$invalid) {
            //     utilityMethods.validateForm($scope.NewContractForm);
            //     $scope.isInvalidForm = true;
            // }

            if (!$scope.isInvalidForm) {
                $(".page-spinner-bar").removeClass("hide");
                var data = new FormData();

                //Save Documents
                if ($scope.files !== null & angular.isDefined($scope.files)) {
                    var FileDetails = [];
                    angular.forEach($scope.files, function (item) {
                        if (item.isLocal) {
                            FileDetails.push({
                                "extension": item.FileExtension,
                                "fileName": item.FileName,
                                "fileType": item.FileType,
                                "filePurpose": "SPEEDCHECK_CONTRACT",
                                "documentComments": null
                            });
                            data.append("attachment", item.File);
                        }
                    });
                    data.append("filesDetails", JSON.stringify(FileDetails));
                }

                else {
                    data.append("filesDetails", null);
                    data.append("attachment", null);
                }

                //Update Speedcheck contract
                if ($scope.ContractDetails.id !== null && angular.isDefined($scope.ContractDetails.id)) {
                    var contractDetails = {
                        "id": $scope.ContractDetails.id,
                        "contractNumber": $scope.ContractDetails.contractUID,
                        "contractName": $scope.ContractDetails.contractName,
                        "startDate": $filter('DatabaseDateFormatMMddyyyy')($scope.ContractDetails.startDate),
                        "endDate": $filter('DatabaseDateFormatMMddyyyy')($scope.ContractDetails.endDate),
                        "vendor": {
                            "vendorId": angular.isDefined($scope.ContractDetails.vendor) ? $scope.ContractDetails.vendor.vendorId : parseInt(sessionStorage.getItem("VendorId")),
                        },
                        "appraisalInvoiceChargesDTO": {
                            'newlyCreated': $scope.speedCheckContractDetails.newlyCreated ? $scope.speedCheckContractDetails.newlyCreated : null,
                            'updatedAppraisal': $scope.speedCheckContractDetails.updatedAppraisal ? $scope.speedCheckContractDetails.updatedAppraisal : null,
                            'artigemReview_slab1': $scope.speedCheckContractDetails.artigemReview_slab1 ? $scope.speedCheckContractDetails.artigemReview_slab1 : null,
                            'artigemReview_slab2': $scope.speedCheckContractDetails.artigemReview_slab2 ? $scope.speedCheckContractDetails.artigemReview_slab2 : null,
                            'artigemReview_slab3': $scope.speedCheckContractDetails.artigemReview_slab3 ? $scope.speedCheckContractDetails.artigemReview_slab3 : null
                        },
                        "contractStatus": {
                            "id": $scope.ContractDetails.contractStatus.id,
                        },
                        "company": {
                            "id": sessionStorage.getItem("CompanyId"),
                        },
                        // "initialResponseTime": $scope.ContractDetails.initialResponseTime,
                        // "followUpResponseTime": $scope.ContractDetails.followUpResponseTime,
                        // "shippingCharge": $scope.ContractDetails.shippingCharge,
                        // "pickupFee": $scope.ContractDetails.pickupFee,
                        //  "quoteOnlyFee": $scope.ContractDetails.quoteOnlyFee,
                        // "maxLineItemAssignmentFee": $scope.ContractDetails.maxLineItemAssignmentFee,
                        // "additionalLineItemQuoteFee": $scope.ContractDetails.additionalLineItemQuoteFee,
                        // "fullEvaluationFee": $scope.ContractDetails.fullEvaluationFee,
                        // "gemologistEvalFee": $scope.ContractDetails.gemologistEvalFee,
                        // "gemologistEvalFullReportFee": $scope.ContractDetails.gemologistEvalFullReportFee,
                        "contractType": $scope.ContractDetails.contractType
                    }

                    data.append("contractDetails", JSON.stringify(contractDetails));
                    var SaveContracts = ThirdPartyContractService.updateSpeedCheckContract(data);
                    SaveContracts.then(function (success) {
                        $(".page-spinner-bar").addClass("hide");
                        $scope.GetContract();
                        toastr.remove();
                        toastr.success(("SpeedCheck contract updated successfully."), "Confirmation");
                        $(".page-spinner-bar").addClass("hide");
                        $scope.CancelNewContract();
                    },
                        function (error) {
                            toastr.remove();
                            toastr.error(("Failed to Update the SpeedCheck contract details. please try again"), "Error");
                            $(".page-spinner-bar").addClass("hide");
                        });
                }

                //Save New Speedcheck contract
                else {
                    var contractDetails = {
                        "id": null,
                        "contractNumber": null,
                        "contractName": $scope.ContractDetails.contractName,
                        "startDate": $filter('DatabaseDateFormatMMddyyyy')($scope.ContractDetails.startDate),
                        "endDate": $filter('DatabaseDateFormatMMddyyyy')($scope.ContractDetails.endDate),
                        "vendor": {
                            "vendorId": angular.isDefined($scope.ContractDetails.vendor) ? $scope.ContractDetails.vendor.vendorId : parseInt(sessionStorage.getItem("VendorId")),
                        },
                        "appraisalInvoiceChargesDTO": {
                            'newlyCreated': $scope.speedCheckContractDetails.newlyCreated ? $scope.speedCheckContractDetails.newlyCreated : null,
                            'updatedAppraisal': $scope.speedCheckContractDetails.updatedAppraisal ? $scope.speedCheckContractDetails.updatedAppraisal : null,
                            'artigemReview_slab1': $scope.speedCheckContractDetails.artigemReview_slab1 ? $scope.speedCheckContractDetails.artigemReview_slab1 : null,
                            'artigemReview_slab2': $scope.speedCheckContractDetails.artigemReview_slab2 ? $scope.speedCheckContractDetails.artigemReview_slab2 : null,
                            'artigemReview_slab3': $scope.speedCheckContractDetails.artigemReview_slab3 ? $scope.speedCheckContractDetails.artigemReview_slab3 : null
                        },
                        "contractType": 'SPEEDCHECK',
                        "maxClaimTime": null,
                        "contractStatus": {
                            "status": "IN-FORCE"
                        },
                        "company": {
                            "id": sessionStorage.getItem("CompanyId"),
                        },
                        // "initialResponseTime": null,
                        // "followUpResponseTime": null,
                        // "shippingCharge": null,
                        // "pickupFee": null,
                        // "quoteOnlyFee": null,
                        // "maxLineItemAssignmentFee": null,
                        // "additionalLineItemQuoteFee": null,
                        // "fullEvaluationFee": null,
                        // "gemologistEvalFee": null,
                        // "gemologistEvalFullReportFee": null
                    };
                    data.append("contractDetails", JSON.stringify(contractDetails));
                    var responsePromise = ThirdPartyContractService.newSpeedCheckContract(data);
                    responsePromise.then(function (success) {
                        $scope.GetContract();
                        toastr.remove();
                        toastr.success("New SpeedCheck Contract has been created successfully.", "Confirmation");
                        $scope.CancelNewContract();
                        $(".page-spinner-bar").addClass("hide");
                    },
                        function (error) {
                            toastr.remove();
                            toastr.error(("Failed to Save the SpeedCheck contract details. please try again"), "Error");
                            $(".page-spinner-bar").addClass("hide");
                        });
                }
            }
        }

        $scope.DeleteContract = DeleteContract;
        function DeleteContract(item) {

            bootbox.confirm({
                size: "",
                closeButton: false,
                title: "Delete Contract ",
                message: "Are you sure you want to delete this contract?  <b>Please Confirm!",
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
                        $(".page-spinner-bar").removeClass("hide");
                        var param =
                        {
                            "contractList": [

                                { "id": item.id }
                            ],
                            "registrationNumber": sessionStorage.getItem("registrationNumber")
                        };
                        var deleteContract = ThirdPartyContractService.DeleteContracts(param);
                        deleteContract.then(function (success) {
                            $scope.ContractTypeList = [{ id: 1, name: "Claim" }, { id: 2, name: "Salvage" }, { id: 3, name: 'SpeedCheck' }];
                            $scope.GetContract();
                            $scope.CancelNewContract();
                            toastr.remove()
                            if (item.contractType == "CLAIM") {
                                $scope.claimContractExists = false;
                            }
                            else {
                                $scope.speedcheckContractExists = false;
                            }
                            toastr.success(((success.data !== null) ? 'Contract deleted successfully.' : "Contract delted successfully."), "Confiramtion");
                            $(".page-spinner-bar").addClass("hide");
                        }, function (error) {
                            $(".page-spinner-bar").addClass("hide");
                            toastr.remove()
                            toastr.error(((error.data !== null) ? error.data.errorMessage : "Failed to delete contract. please try again."), "Error");

                        });
                    }
                }
            });
        }

        $scope.DeleteSalvageContract = DeleteSalvageContract;
        function DeleteSalvageContract(item) {
            bootbox.confirm({
                size: "",
                closeButton: false,
                title: "Delete Contract ",
                message: "Are you sure you want to delete this contract?  <b>Please Confirm!",
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
                        $(".page-spinner-bar").removeClass("hide");
                        var param = { "id": item.id };

                        var deleteContract = ThirdPartyContractService.DeleteSalvageContracts(param);
                        deleteContract.then(function (success) {
                            $scope.GetSalvageContract();
                            $scope.salvageContractExists = false;
                            toastr.remove()
                            toastr.success(((success.data !== null) ? success.data.message : "Contract delted successfully."), "Confiramtion");
                            $(".page-spinner-bar").addClass("hide");
                        }, function (error) {
                            $(".page-spinner-bar").addClass("hide");
                            toastr.remove()
                            toastr.error(((error.data !== null) ? error.data.errorMessage : "Failed to delete contract. please try again."), "Error");

                        });
                    }
                }
            });
        }

        $scope.files = [];
        //trigger event
        $scope.SelectFile = SelectFile;
        function SelectFile() {
            angular.element("input[type='file']").val(null);
            angular.element('#FileUpload').trigger('click');
        };
        $scope.getFileDetails = getFileDetails;
        function getFileDetails(event) {
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
                $scope.files.push(
                    {
                        "FileName": e.target.fileName,
                        "FileExtension": e.target.fileExtension,
                        "FileType": e.target.fileType,
                        "Image": e.target.result,
                        "File": e.target.file,
                        "isLocal": true
                    })
            });
        };

        $scope.CancelNewContract = CancelNewContract;
        function CancelNewContract() {
            $scope.NewContract = false;
            $scope.salvageDetails = {};
            $scope.files = [];
            $scope.ContractType = null;
            $scope.ContractTypeList = [{ id: 1, name: "Claim" }, { id: 2, name: "Salvage" }, { id: 3, name: 'SpeedCheck' }];
            $scope.ContractDetails = {
                vendor: {
                    vendorId: sessionStorage.getItem("VendorId")
                }
            };
            $scope.CurrentClaimTab = "Contract";
        };

        $scope.showContracts = showContracts;
        function showContracts() {
            $scope.CurrentClaimTab = "Contract";
            $scope.GetContract();
            $scope.GetSalvageContract();
            $scope.NewContract = false;
        }

        $scope.GetVendorDetails = GetVendorDetails;
        function GetVendorDetails() {
            $(".page-spinner-bar").removeClass("hide");
            $scope.registrationNumber = sessionStorage.getItem("registrationNumber")
            if (angular.isDefined($scope.registrationNumber) && $scope.registrationNumber !== null && $scope.registrationNumber !== "") {
                var param = {
                    "registrationNumber": $scope.registrationNumber
                }
                var NewVendor = ThirdPartyContractService.getVendorDetails(param);
                NewVendor.then(function (success) {
                    $scope.VendorDetails = success.data.data;
                    $(".page-spinner-bar").addClass("hide");
                }, function (error) {
                    $scope.ErrorMessage = error.data.errorMessage;
                    $(".page-spinner-bar").addClass("hide");
                });
            }
        };

        $scope.showSalvageContract = true;
        $scope.showClaimContract = false;
        $scope.showSpeedCheckContract = false;
        $scope.ChangeClaimType = ChangeClaimType;
        function ChangeClaimType(item) {
            if (item == 1) {
                $scope.showClaimContract = true;
                $scope.showSalvageContract = false;
                $scope.showSpeedCheckContract = false;
                if ($scope.claimContractExists) {
                    bootbox.alert({
                        message: "Contract already exists for selected type!",
                        backdrop: false
                    });
                }
            }

            if (item == 2) {
                $scope.showClaimContract = false;
                $scope.showSalvageContract = true;
                $scope.showSpeedCheckContract = false;
                if ($scope.salvageContractExists) {
                    bootbox.alert({
                        message: "Contract already exists for selected type!",
                        backdrop: false
                    });
                }
            }

            if (item == 3) {
                $scope.showClaimContract = false;
                $scope.showSalvageContract = false;
                $scope.showSpeedCheckContract = true;
                if ($scope.speedcheckContractExists) {
                    bootbox.alert({
                        message: "Contract already exists for selected type!",
                        backdrop: false
                    });
                }
            }

            //return false;
        }

        $scope.showContentSpecialties = showContentSpecialties;
        function showContentSpecialties() {
            $scope.CurrentClaimTab = "ContentSpecialties";
            $scope.SpecialtyOfSpecialist = [];
            getCategory();
        }

        $scope.showCatalogs = showCatalogs;
        function showCatalogs() {
            $scope.CurrentClaimTab = "Catalogs";
        }

        $scope.getCategory = getCategory;
        function getCategory() {
            $(".page-spinner-bar").removeClass("hide");
            var categoryPromise = ThirdPartyContractService.GetCategoryList();
            categoryPromise.then(function (success) {
                $(".page-spinner-bar").addClass("hide");
                $scope.CategoryList = success.data.data;
                $scope.OriginalCategoryList = success.data.data;
                $scope.getSpecialities();
            }, function (error) {
                $(".page-spinner-bar").addClass("hide");
                $scope.ErrorMessage = error.data.errorMessage
            });
        }

        //CategoryExpert Section    
        //Current categoryId of specialty
        $scope.SpecialtyOfSpecialist = [];
        $scope.OriginalCategoryList = [];

        //Add Category to expert button > click
        $scope.AddToExpertCategory = AddToExpertCategory;
        function AddToExpertCategory() {
            angular.forEach($scope.AddSpecialtyList, function (item) {
                if ($scope.SpecialtyOfSpecialist.indexOf(item) === -1)
                    $scope.SpecialtyOfSpecialist.push(item);
            });
            angular.forEach($scope.AddSpecialtyList, function (item) {
                $scope.CategoryList = $scope.CategoryList.filter(x => x.categoryId !== item.id);
            });

            $scope.AddSpecialtyList = [];
        }

        //Remove Category to expert button < click
        $scope.RemoveFromExpertCategory = RemoveFromExpertCategory;
        function RemoveFromExpertCategory() {
            //Splice item form specialty list
            angular.forEach($scope.RemoveSpecialtyList, function (item) {
                var objindex = $scope.SpecialtyOfSpecialist.indexOf(item);
                if (objindex !== undefined || objindex > -1) {
                    $scope.SpecialtyOfSpecialist.splice(objindex, 1)
                }
                $scope.CategoryList.push($scope.OriginalCategoryList.find(category => category.categoryId === item.id));
            });
            $scope.RemoveSpecialtyList = [];
        }

        //Add Category to specialist specialty Check item is in list or not on checkbox click
        $scope.AddSpecialtyList = [];
        $scope.AddCategoryToExpert = AddCategoryToExpert;
        function AddCategoryToExpert(item) {
            var cat = {
                "id": item.categoryId,
                "speciality": item.categoryName
            };
            var flag = true; var index = 0;
            if ($scope.AddSpecialtyList.length !== 0) {
                for (var i = 0; i < $scope.AddSpecialtyList.length; i++) {
                    if ($scope.AddSpecialtyList[i].id === item.categoryId) {
                        flag = false;
                        index = i;
                    }
                }
                if (flag) {
                    $scope.AddSpecialtyList.push(cat);
                    $scope.AddToExpertCategory();
                }
                else {
                    $scope.AddSpecialtyList.splice(index, 1);
                    $scope.AddToExpertCategory();
                }
            }
            else {
                $scope.AddSpecialtyList.push(cat);
                $scope.AddToExpertCategory();
            }
        }

        //Remove Category from specialist specialty
        $scope.RemoveSpecialtyList = [];
        $scope.RemoveExpertCategory = RemoveExpertCategory;
        function RemoveExpertCategory(item) {//Remove specialty of specialist Check item is in list or not on checkbox click      
            if ($scope.RemoveSpecialtyList.indexOf(item) === -1) {
                $scope.RemoveSpecialtyList.push(item);
                $scope.RemoveFromExpertCategory();
            }
            else {
                $scope.RemoveSpecialtyList.splice($scope.RemoveSpecialtyList.indexOf(item), 1)
                $scope.RemoveFromExpertCategory();
            }
        }

        //Get checkbox is cheed or not
        $scope.GetIsChecked = function (list, item) {
            list.indexOf(item) > -1
        }

        //Save specialist
        $scope.SaveClaimSpecialist = SaveClaimSpecialist;
        function SaveClaimSpecialist() {
            var addressOfEmp; var stateName = "";
            if ($scope.VendorDetails.officeAddress !== null) {
                if ($scope.VendorDetails.officeAddress.state !== null) {
                    if ($scope.VendorDetails.officeAddress.state.id !== null) {
                        var stateNamelist = $filter('filter')($scope.State, { 'id': $scope.VendorDetails.officeAddress.state.id });
                        if (stateNamelist.length === 0)
                            stateName = null;
                        else
                            stateName = stateNamelist[0].name;
                    }
                }
                addressOfEmp =
                {
                    "id": null,
                    "streetAddressOne": $scope.VendorDetails.officeAddress.streetAddressOne,
                    "streetAddressTwo": $scope.VendorDetails.officeAddress.streetAddressTwo,
                    "city": $scope.VendorDetails.officeAddress.city,
                    "state": {
                        "id": (($scope.VendorDetails.officeAddress.state.id !== null && angular.isDefined($scope.VendorDetails.officeAddress.state.id) ? $scope.VendorDetails.officeAddress.state.id : null)),

                    },
                    "zipcode": $scope.VendorDetails.officeAddress.zipcode,
                    "completeAddress": $scope.VendorDetails.officeAddress.streetAddress + " " + "," + $scope.VendorDetails.officeAddress.streetAddress + " " + "," + $scope.VendorDetails.officeAddress.city + " " + "," +
                        stateName + " " + "," + $scope.VendorDetails.officeAddress.zipcode
                }
            }
            else
                addressOfEmp = null;

            if ($scope.VendorDetails !== null && angular.isDefined($scope.VendorDetails)) {
                var designation;
                if ($scope.VendorDetails.designation !== null && angular.isDefined($scope.VendorDetails.designation)) {
                    if ($scope.VendorDetails.designation.id !== null) {
                        var DesignationName = $filter('filter')($scope.Designations, { 'id': $scope.VendorDetails.designation.id });
                        if (DesignationName.length === 0)
                            DesignationName = null;
                        else
                            DesignationName = DesignationName[0].name;

                        designation = {
                            "id": $scope.VendorDetails.designation.id,
                            "name": DesignationName
                        };
                    }
                }
                else
                    designation = null;
                var branch;
                if ($scope.VendorDetails.branch !== null && angular.isDefined($scope.VendorDetails.branch)) {
                    if ($scope.VendorDetails.branch.id !== null) {
                        var BranchName = $filter('filter')($scope.Branch, { 'id': $scope.VendorDetails.branch.id });
                        if (BranchName.length === 0)
                            BranchName = null;
                        else
                            BranchName = BranchName[0].name;
                        branch = {
                            "id": $scope.VendorDetails.branch.id
                        };
                    }
                }
                else
                    branch = null;

                var reportingManager;
                if ($scope.VendorDetails.reportingManager !== null && angular.isDefined($scope.VendorDetails.reportingManager)) {
                    if ($scope.VendorDetails.reportingManager.id !== null) {
                        reportingManager = {
                            "id": $scope.VendorDetails.reportingManager.id,
                            "name": null,
                            "designation": null,
                            "roles": null
                        };
                    }
                }
                else
                    reportingManager = null;

                var role;
                if ($scope.VendorDetails.roles !== null && angular.isDefined($scope.VendorDetails.roles)) {
                    if ($scope.VendorDetails.roles.roleId !== null) {
                        var RoleName = $filter('filter')($scope.Roles, { 'id': $scope.VendorDetails.roles.roleId });
                        if (RoleName.length === 0)
                            RoleName = null;
                        else
                            RoleName = RoleName[0].roleName;
                        //"contactRoleId": $scope.VendorDetails.reportingManager.id,
                        var obj = {

                            "roleId": $scope.VendorDetails.roles.roleId,
                            "contactRoleId": null,
                            "rolePermissionId": null,
                            "status": false,
                            "description": null,
                            "permissions": null
                        }
                        role = [];
                        role.push(obj);
                    }
                }
                else {
                    role = [];
                }

            }
            else
                $scope.VendorDetails = {
                    "reportingManager": null,
                    "branch": null,
                    "designation": null,
                    "roles": null
                }

            $scope.Cellphone = $scope.Cellphone.replace(/[^0-9]/g, '');
            $scope.DayTimePhone = $scope.DayTimePhone.replace(/[^0-9]/g, '');

            var DetailsParam = {
                "specialistId": null,
                "contactInfo": {
                    "firstName": $scope.VendorDetails.adminFirstName,
                    "lastName": $scope.VendorDetails.adminFirstName,
                    "email": $scope.VendorDetails.adminEmail,
                    "cellPhone": $scope.VendorDetails.phoneWork,
                    "eveningTimePhone": null,
                    "dayTimePhone": $scope.$scope.VendorDetails.phoneWork,
                    "address": addressOfEmp
                },
                "professionalInfo": {
                    "reportingManager": reportingManager,
                    "branch": branch,
                    "designation": designation,
                    "roles": role
                },
                "specialities": $scope.SpecialtyOfSpecialist
            };
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

        /* Function to preview uploaded Documents */
        $scope.GetDocxDetails = function (item) {
            $scope.showDelete = true;
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
            if ($scope.ReceiptList) {
                $scope.pdfUrl = $scope.ReceiptList;
                //var urls = $scope.ReceiptList.split('/');
                //$scope.DocxDetails.type = urls[urls.length - 1].split('.')[1];

                //$scope.DocxDetails.type =  $scope.ReceiptList.split('.')[1];
                var pdf = ["pdf", "application/pdf"];
                var img = ["image", "application/image", "image/png", "image/jpeg", "image/gif", "png", "jpg", "jpeg", "gif", "image", "PNG", "JPEG", "GIF", "JPG"];
                $scope.imgDiv = true;
                if (pdf.indexOf(($scope.DocxDetails.FileType.toLowerCase())) > -1) {
                    $scope.isPDF = 1;
                } else if (img.indexOf(($scope.DocxDetails.FileType.toLowerCase())) > -1) {
                    $scope.isPDF = 2;
                } else {
                    $scope.isPDF = 0;
                    var downloadLink = angular.element('<a></a>');
                    downloadLink.attr('href', $scope.DocxDetails.url);
                    downloadLink.attr('target', '_self');
                    downloadLink.attr('download', (($scope.DocxDetails.fileName != null && angular.isDefined($scope.DocxDetails.fileName) && $scope.DocxDetails.fileName !== "") ? $scope.DocxDetails.fileName : "Document"));
                    downloadLink[0].click();
                }

            }
            else {
                $scope.showDelete = false;
                $scope.pdfUrl = $scope.DocxDetails.Image;
                //$scope.DocxDetails.type =  $scope.ReceiptList.split('.')[1];
                var pdf = ["pdf", "application/pdf"];
                var img = ["image", "application/image", "image/png", "image/jpeg", "image/gif", "png", "jpg", "jpeg", "gif", "image", "PNG", "JPEG", "GIF", "JPG"];
                $scope.imgDiv = true;
                if (pdf.indexOf(($scope.DocxDetails.FileType.toLowerCase())) > -1) {
                    $scope.isPDF = 1;
                } else if (img.indexOf(($scope.DocxDetails.FileType.toLowerCase())) > -1) {
                    $scope.isPDF = 2;
                    $scope.DocxDetails.url = $scope.DocxDetails.Image;
                } else {
                    $scope.isPDF = 0;
                    var downloadLink = angular.element('<a></a>');
                    downloadLink.attr('href', $scope.DocxDetails.url);
                    downloadLink.attr('target', '_self');
                    downloadLink.attr('download', (($scope.DocxDetails.fileName != null && angular.isDefined($scope.DocxDetails.fileName) && $scope.DocxDetails.fileName !== "") ? $scope.DocxDetails.fileName : "Document"));
                    downloadLink[0].click();
                }

            }
            window.setTimeout(function () {
                $("#img_preview").css({
                    'right': $('.page-wrapper-middle').offset().left + 'px'
                }).show();
            }, 100);

        }

        $scope.close = function () {
            $("#img_preview").hide();
        }

        /* Delete attachements */
        $scope.DeleteAttachement = DeleteAttachement;

        function DeleteAttachement(item) {
            $scope.DocxDetails = item;
            var msg = "";
            msg = "Are you sure you want to delete the attachment " + $scope.DocxDetails.FileName + "?";
            bootbox.confirm({
                size: "",
                title: "Delete Attachement?",
                message: msg,
                closeButton: false,
                className: "modalcustom",
                buttons: {
                    confirm: {
                        label: "Delete",
                        className: 'btn-success'
                    },
                    cancel: {
                        label: "Cancel", //$translate.instant('ClaimDetails_Delete.BtnNo'),
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    if (result) {

                        var param = {
                            "contractUID": $scope.contractUID,
                            "url": item.url,
                            "vendorRegistrationNumber": sessionStorage.getItem("speedCheckVendor")
                        }

                        $(".page-spinner-bar").removeClass("hide");
                        var categoryPromise = ThirdPartyContractService.deleteContractAttachements(param);
                        categoryPromise.then(function (success) {
                            $(".page-spinner-bar").addClass("hide");
                            if ($scope.editAttachmentList.length > 0) {
                                var index = $scope.editAttachmentList.indexOf(item);
                                if (index >= 0) {
                                    $scope.editAttachmentList.splice(index, 1);
                                }
                                // else if($scope.files){
                                // var index = $scope.files.indexOf(item);
                                // if(index>=0)
                                // $scope.files.splice(index, 1);
                                // }
                            }
                            else if ($scope.salvageDetails.attachments) {
                                var index = $scope.salvageDetails.attachments.indexOf(item);
                                if (index >= 0) {

                                    $scope.salvageDetails.attachments.splice(index, 1);
                                }
                                // else if($scope.files){
                                // var index = $scope.files.indexOf(item);
                                // if(index>=0)
                                // $scope.files.splice(index, 1);
                                // }
                            }

                            $("#img_preview").hide();

                        }, function (error) {
                            $(".page-spinner-bar").addClass("hide");
                            $scope.ErrorMessage = error.data.errorMessage
                        });

                    }
                }
            });
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

        // removeAttachment
        $scope.removeAttachment = function removeAttachment(item) {
            if ($scope.files) {
                var index = $scope.files.indexOf(item);
                if (index >= 0)
                    $scope.files.splice(index, 1);
                else
                    DeleteAttachement(item);
            }
            else
                DeleteAttachement(item);
        }

        //Download Attachments
        $scope.getAttachments = getAttachments;
        function getAttachments(param) {
            var downloadLink = angular.element('<a></a>');
            downloadLink.attr('href', $scope.DocxDetails.url);
            downloadLink.attr('target', '_blank');
            downloadLink.attr('download', (($scope.DocxDetails.FileName != null && angular.isDefined($scope.DocxDetails.FileName) && $scope.DocxDetails.FileName !== "") ? $scope.DocxDetails.FileName : "Document"));
            downloadLink[0].click();
        }

        $scope.saveSpecialities = function () {
            // $scope.SpecialtyOfSpecialist
            var param = {
                "categoryList": $scope.SpecialtyOfSpecialist,
                "vendorId": sessionStorage.getItem("VendorId")
            }

            $(".page-spinner-bar").removeClass("hide");
            var specialities = ThirdPartyContractService.saveVendorSpecialities(param);
            specialities.then(function (success) {
                $(".page-spinner-bar").addClass("hide");
                GoBack();

            }, function (error) {
                $(".page-spinner-bar").addClass("hide");
                $scope.ErrorMessage = error.data.errorMessage
            });
        }

        $scope.getSpecialities = function () {
            var param = {
                "vendorId": sessionStorage.getItem("VendorId")
            }
            $(".page-spinner-bar").removeClass("hide");
            var specialityList = ThirdPartyContractService.getVendorSpecialities(param);
            specialityList.then(function (success) {
                
                $scope.AddSpecialtyList = success.data.data;
                AddToExpertCategory();
                window.setTimeout(function(){
                    $(".page-spinner-bar").addClass("hide");
                },1000);
            }, function (error) {
                $(".page-spinner-bar").addClass("hide");
                $scope.ErrorMessage = error.data.errorMessage
            });
        }

        $scope.dateValidations = dateValidations;
        function dateValidations() {
            $scope.showValidationMessage = false;
            var startDate = document.getElementById("startDate").value;
            var endDate = document.getElementById("endDateId").value;
            if ((Date.parse(endDate) < Date.parse(startDate))) {
                $scope.showValidationMessage = true;
                document.getElementById("endDateId").value = "";
            }
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

    });