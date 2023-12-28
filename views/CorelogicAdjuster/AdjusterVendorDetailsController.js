angular.module('MetronicApp').controller('AdjusterVendorDetailsController', function ($rootScope, $scope, settings, $filter, $translate, $translatePartialLoader, $location,
    AdjusterPropertyClaimDetailsService, $uibModal, AdjusterCatalogService, ThirdPartyContractService) {

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
    $scope.ContactDeatils = [{ id: null, email: '', firstName: '', lastName: '', workPhoneNumber: '', mobilePhoneNumber: '' }];
    $scope.counter = 0;
    $scope.PhoneNumbers = [{ Type: '', PhoneNo: '' }];
    $scope.phonecounter = 0;
    $scope.ddlStateList = [];
    $scope.commObj = { "BillingState": null, "ShippingState": null };
    $scope.SpecialtyOfSpecialist;
    $scope.ShowDetails;
    $scope.NewContract = false;
    $scope.EmailDetails = {};
    $scope.readOnly = sessionStorage.getItem("RoleList") == 'ADJUSTER' || sessionStorage.getItem("RoleList") == 'CLAIM MANAGER' || sessionStorage.getItem("RoleList") == 'CLAIM SUPERVISOR';
    $scope.claimProfile = sessionStorage.getItem("claimProfile");

    $scope.editContract = false;
    $scope.$on('eventContractNumber', function (event, data) {
        //$scope.mainData.logs = $scope.mainData.logs + '\nMainController - receive EVENT "' + event.name + '" with message = "' + data.message + '"';
        $scope.contractNumber = data.contractNumber;
        $scope.editContract = data.editContract

    });


    $scope.ErrorMessage = "";
    function init() {
        $scope.InviteVendorDetails = false;
        $scope.AddVendorDetails = true;
        $scope.IsEdit;
        angular.element('#select2insidemodal').select2({});
        $scope.NewVendor.vendorId = sessionStorage.getItem("VendorDetailsId");
        if (angular.isDefined($scope.NewVendor.vendorId) && $scope.NewVendor.vendorId !== null && $scope.NewVendor.vendorId !== "") {
            //Call get vendor Details assign it to NewVendor object
            var param = {
                // "vendorId": $scope.NewVendor.vendorId,
                "registrationNumber": $scope.NewVendor.vendorId
            }
            var NewVendor = AdjusterPropertyClaimDetailsService.getVendorDetails(param);
            NewVendor.then(function (success) {
                $scope.GetCatalogList();
                // GetContract();
                $scope.NewVendor.SupplierName = success.data.data.vendorName;
                $scope.NewVendor.vendorNumber = success.data.data.vendorNumber;
                $scope.NewVendor.vendorId = success.data.data.vendorId;
                var vendorId = sessionStorage.getItem('vendorId');
                getVendorAssignments(vendorId);
                if (success.data.data.billingAddress != null) {
                    $scope.NewVendor.BillingAddressLine1 = success.data.data.billingAddress.streetAddressOne;
                    $scope.NewVendor.BillingAddressLine2 = success.data.data.billingAddress.streetAddressTwo;
                    $scope.NewVendor.BillingCity = success.data.data.billingAddress.city;
                    $scope.NewVendor.BillingZipCode = success.data.data.billingAddress.zipcode;
                    $scope.commObj.BillingState = ((success.data.data.billingAddress.state !== null) ? success.data.data.billingAddress.state.state : null);
                    $scope.NewVendor.BillingState = $scope.commObj.BillingState;
                }
                $scope.NewVendor.Website = success.data.data.website;
                $scope.PhoneNumbers = [];
                if (success.data.data.dayTimePhone != null) {
                    $scope.PhoneNumbers.push({ "Type": "Work", "PhoneNo": success.data.data.dayTimePhone });
                }
                if (success.data.data.eveningTimePhone != null || success.data.data.faxNumber !== null) {
                    $scope.PhoneNumbers.push({ "Type": "Other", "PhoneNo": ((success.data.data.eveningTimePhone !== null) ? success.data.data.eveningTimePhone : success.data.data.faxNumber) });
                }
                if (success.data.data.cellPhone != null) {
                    $scope.PhoneNumbers.push({ "Type": "Mobile", "PhoneNo": success.data.data.cellPhone });
                }

                if (success.data.data.contactPersons != null) {
                    $scope.ContactDeatils = success.data.data.contactPersons;
                    angular.forEach($scope.ContactDeatils, function (item) {
                        item.mobilePhoneNumber = $filter('tel')(item.mobilePhoneNumber);
                    });
                }
                if (success.data.data.shippingAddress != null) {
                    $scope.NewVendor.ShippingCity = success.data.data.shippingAddress.city;
                    $scope.NewVendor.ShippingZipCode = success.data.data.shippingAddress.zipcode;
                    $scope.NewVendor.ShippingAddressLine1 = success.data.data.shippingAddress.streetAddressOne;
                    $scope.NewVendor.ShippingAddressLine2 = success.data.data.shippingAddress.streetAddressTwo;
                    $scope.commObj.ShippingState = ((success.data.data.shippingAddress.state !== null) ? success.data.data.shippingAddress.state.state : null);
                    $scope.NewVendor.ShippingState = $scope.commObj.ShippingState;
                }
                $scope.NewVendor.faxNumber = $filter('tel')(success.data.data.faxNumber);
                angular.forEach(success.data.data.categoryExpertise, function (item) {
                    $scope.SpecialtyOfSpecialist.push({ "id": item.id, "speciality": item.name });
                });

                angular.forEach($scope.PhoneNumbers, function (item) {
                    item.PhoneNo = $filter('tel')(item.PhoneNo);
                });

            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
            });

        }
        else {
            $scope.NewVendor.vendorId = null;
        }
        var getcategory = AdjusterPropertyClaimDetailsService.getCategories();
        getcategory.then(function (success) {
            $scope.CategoryList = success.data.data;
            $scope.OriginalCategoryList = success.data.data;

        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        });

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
        var GetCatalogStatus = AdjusterCatalogService.GetCatalogSatusList();
        GetCatalogStatus.then(function (success) {
            $scope.catalogStatusList = success.data.data;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        })
    }

    init();


    $scope.GoBack = GoBack;
    function GoBack() {
        sessionStorage.setItem("VendorDetailsId", null);
        $location.url('AdjusterThirdPartyVendor');
    };
    $scope.GoToDashboard = GoToDashboard;
    function GoToDashboard() {
        sessionStorage.setItem("VendorDetailsId", null);
        $location.url(sessionStorage.getItem('HomeScreen'));
    }



    //Save vendor
    //Dynamically adding textboxes

    $scope.AddContactPerson = function (index, contact) {

        $scope.ContactDeatils.push({ id: null, email: '', firstName: '', lastName: '', phoneNumber: '' });
    };

    $scope.RemoveContactPerson = function (index, contact) {

        $scope.ContactDeatils.splice(index, 1);

    };


    $scope.RemovePhone = function (index) {

        $scope.PhoneNumbers.splice(index, 1)
    };

    $scope.AddPhone = function () {

        $scope.PhoneNumbers.push({ Type: '', PhoneNo: '' });
    };




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
            $scope.CategoryList = $filter('filter')($scope.CategoryList, { 'categoryId': '!' + item.id });
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
        });
        //Splice item form Category list       
        angular.copy($scope.OriginalCategoryList, $scope.CategoryList);
        angular.forEach($scope.SpecialtyOfSpecialist, function (item) {
            $scope.CategoryList = $filter('filter')($scope.CategoryList, { 'categoryId': '!' + item.id });
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
            else
                $scope.AddSpecialtyList.splice(index, 1)
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
            $scope.RemoveSpecialtyList.splice($scope.RemoveSpecialtyList.indexOf(item), 1);
            $scope.RemoveFromExpertCategory();
        }
    }

    //Get checkbox is cheed or not
    $scope.GetIsChecked = function (list, item) {
        list.indexOf(item) > -1
    }

    //Get catalog for vendorCatalog
    $scope.ShowCatalog = function () {
        $scope.showNewCatalog = false;
        $scope.CurrentClaimTab = 'Catalogs';

    }
    $scope.GetCatalogList = GetCatalogList;
    function GetCatalogList() {
        var param = {
            "vendorId": $scope.NewVendor.vendorId
        };
        var GetCatalogList = AdjusterCatalogService.GetCatalogs(param);
        GetCatalogList.then(function (success) {
            $scope.catalogsList = success.data.data;
        },
            function (error) {
                //toastr.remove();
                //toastr.error(error.data.errorMessage, "Error");
            })
    }

    $scope.CancelCatalogDetails = CancelCatalogDetails;
    function CancelCatalogDetails() {
        $scope.showNewCatalog = false;
    }

    //Approve Reject Catalog 
    $scope.ChangeCatalogStatus = function (item, status) {
        var param = {
            "id": item.id,
            "status": {
                "id": status
            }
        };
        var ChangeCatalogStatus = AdjusterCatalogService.ChangeCatalogStatus(param);
        ChangeCatalogStatus.then(function (success) {
            item.status.id = status;
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
            $scope.GetCatalogList();
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    };

    //Get vendorLis for dropdown
    var param = {
        "companyId": sessionStorage.getItem("CompanyId")
    }
    var GetAllVendor = ThirdPartyContractService.getVendorList(param);
    GetAllVendor.then(function (success) {
        $scope.AllVendor = success.data.data;
    }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

    //Contract
    $scope.AddNewContract = AddNewContract;
    function AddNewContract() {
        $scope.ContractDetails = {};
        $scope.NewContract = true;
    }
    $scope.EditContract = EditContract;
    function EditContract(item) {
        $scope.NewContract = true;
        $scope.ContractDetails = angular.copy(item);
        $scope.ContractDetails.startDate = $filter('DateFormatMMddyyyy')($scope.ContractDetails.startDate);
        $scope.ContractDetails.endDate = $filter('DateFormatMMddyyyy')($scope.ContractDetails.endDate);
    }
    $scope.CancelNewContract = CancelNewContract;
    function CancelNewContract() {
        $scope.ContractDetails = {};
        $scope.NewContract = false;
    }

    function GetContract() {
        var param = {
            "vendor": {
                "vendorId": $scope.NewVendor.vendorId
            }
        };
        var GetContracts = ThirdPartyContractService.getContracts(param);
        GetContracts.then(function (success) {
            $scope.ContractList = success.data.data;
        },
            function (error) {
            });
    }

    $scope.ContractKey = "startDate";
    $scope.reverseContract = true;
    $scope.sortContract = function (key) {
        $scope.ContractKey = key;   //set the sortKey to the param passed     
        $scope.reverseContract = !$scope.reverse; //if true make it false and vice versa
    }

    $scope.saveContract = saveContract;
    function saveContract() {
        var data = new FormData();
        //Append File
        if ($scope.files !== null && angular.isDefined($scope.files)) {
            var FileDetails = [];
            angular.forEach($scope.files, function (item) {
                FileDetails.push({
                    "fileName": item.FileName, "fileType": item.FileType,
                    "extension": item.FileExtension,
                    "filePurpose": "CONTRACT"
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
                "contractNumber": $scope.ContractDetails.contractNumber,
                "contractName": $scope.ContractDetails.contractName,
                "startDate": $filter('DatabaseDateFormatMMddyyyy')($scope.ContractDetails.endDate),
                "endDate": $filter('DatabaseDateFormatMMddyyyy')($scope.ContractDetails.endDate),
                "maxClaimTime": $scope.ContractDetails.maxClaimTime,
                "contractStatus": {
                    "id": $scope.ContractDetails.contractStatus.id,
                },
                "vendor": {
                    "vendorId": $scope.ContractDetails.vendor.vendorId,
                },
                "company": {
                    "id": $scope.ContractDetails.company.id,
                }
            }
            data.append("contractDetails", JSON.stringify(contractDetails));
            var SaveContracts = ThirdPartyContractService.UpdateContracts(data);
            SaveContracts.then(function (success) {
                GetContract(); $scope.CancelNewContract();
                toastr.remove();
                toastr.success(((success.data !== null) ? success.data.message : "Contract details saved successfully."), "Confirmation");
            },
                function (error) {
                    toastr.remove();
                    toastr.error(((error.data !== null) ? error.data.message : "Failed to save the contract details. please try again"), "Error");
                });
        }
        else {
            var contractDetails = {
                "contractNumber": $scope.ContractDetails.contractNumber,
                "contractName": $scope.ContractDetails.contractName,
                "startDate": $filter('DatabaseDateFormatMMddyyyy')($scope.ContractDetails.endDate),
                "endDate": $filter('DatabaseDateFormatMMddyyyy')($scope.ContractDetails.endDate),
                "maxClaimTime": $scope.ContractDetails.maxClaimTime,
                "contractStatus": {
                    "id": 1,
                },
                "vendor": {
                    "vendorId": $scope.ContractDetails.vendor.vendorId,
                },
                "company": {
                    "id": sessionStorage.getItem("CompanyId"),
                }
            };
            data.append("contractDetails", JSON.stringify(contractDetails));
            var SaveContracts = ThirdPartyContractService.NewContract(data);
            SaveContracts.then(function (success) {
                GetContract(); $scope.CancelNewContract();
                toastr.remove();
                toastr.success(((success.data !== null) ? success.data.message : "Contract details updated successfully."), "Confirmation");
            },
                function (error) {
                    toastr.remove();
                    toastr.error(((error.data !== null) ? error.data.message : "Failed to update the contract details. please try again"), "Error");
                });
        }
    }

    //File upload
    $scope.files = [];
    //trigger event
    $scope.SelectFile = SelectFile;
    function SelectFile() {
        angular.element('#FileUpload').trigger('click');
    }
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
            $scope.files.push({ "FileName": e.target.fileName, "FileExtension": e.target.fileExtension, "FileType": e.target.fileType, "Image": e.target.result, "File": e.target.file })
        });
    }

    $scope.GoListContract = GoListContract;
    function GoListContract() {
        $scope.CurrentClaimTab == 'Contract';
        $scope.editContract = false;
        var broadcastData = {};
        $rootScope.$broadcast('contractListBroadcast', broadcastData);
    }
    //  //Edit Vednor
    $scope.GoToVendorDetails = function () {
        location.reload();
    };

    //Get assigmentList for vendors
    $scope.getVendorAssignments = getVendorAssignments;
    function getVendorAssignments(params) {
        var getAllVendorAssignmentList = AdjusterPropertyClaimDetailsService.getOverAllRating(params);
        getAllVendorAssignmentList.then(function (success) {
            var result = success.data.data;
            $scope.totalRatings = result && result.totalRatings ? result.totalRatings : 0;
            $scope.assignmentRating = parseFloat((result && result.averageNumber ? result.averageNumber : 0).toFixed(1));
            $scope.starwidth = parseFloat(($scope.assignmentRating / 5 * 100).toFixed(2)) + '%';
            $scope.totalReviews = result && result.totalAssignemnts ? result.totalAssignemnts : 0;
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                toastr.error(error.data.errorMessage, "Error")
            }
            else {
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
            }
        });
    }

});