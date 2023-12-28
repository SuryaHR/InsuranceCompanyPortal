//
angular.module('MetronicApp').controller('NewClaimSpecialistController', function ($rootScope, $filter, $translate, $translatePartialLoader, $scope,
    settings, $location, NewClaimSpecialistService, AuthHeaderService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('NewClaimSpecialist');
    $translate.refresh();
    $scope.ErrorMessage = "";
    $scope.CategoryList = [];
    $scope.Branch = [];
    $scope.Roles = [];
    $scope.Designations = [];
    $scope.Reportingmanagers = [];
    $scope.State = [];

    //Ng model object for page
    $scope.ContactDetails;
    $scope.ProfessionalDetails;
    $scope.SpecialtyOfSpecialist;

    //Phone numbers Region
    $scope.CellPhoneFirst; $scope.CellPhoneSecond; $scope.CellPhoneThird;
    $scope.DayPhoneFirst; $scope.DayPhoneSecond; $scope.DayPhoneThird;


    $scope.CategoryList = [];

    $scope.init = function () {
        var categoryPromise = NewClaimSpecialistService.GetCategoryList();
        categoryPromise.then(function (success) {
            $scope.CategoryList = success.data.data;
            $scope.OriginalCategoryList = success.data.data;
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage });

        var paramComanyId = {
            "id": sessionStorage.getItem("CompanyId")
        };
        var Getbranch = NewClaimSpecialistService.GetBranch(paramComanyId);
        Getbranch.then(function (success) { $scope.Branch = success.data.data; }, function (error) {
            if (angular.isDefined(error.data.errorMessag)) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            }
            else {
                if (error.status === 500 || error.status === 404) {
                    toastr.remove();
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                }
            }
        });

        var GetRoles = NewClaimSpecialistService.GetRole();
        GetRoles.then(function (success) { $scope.Roles = success.data.data; }, function (error) {
            if (angular.isDefined(error.data.errorMessag)) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            }
            else {
                if (error.status === 500 || error.status === 404) {
                    toastr.remove();
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                }
            }
        });

        var getDesignation = NewClaimSpecialistService.GetDesignation();
        getDesignation.then(function (success) { $scope.Designations = success.data.data; }, function (error) {
            if (angular.isDefined(error.data.errorMessag)) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            }
            else {
                if (error.status === 500 || error.status === 404) {
                    toastr.remove();
                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                }
            }
        });

        var param =
            {
                "isTaxRate": false,
                "isTimeZone": false
            }

        var GetState = NewClaimSpecialistService.GetState(param);
        GetState.then(function (success) { $scope.State = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    };
    $scope.init();

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
        if ($scope.ContactDetails.address !== null) {
            if ($scope.ContactDetails.address.state !== null) {
                if ($scope.ContactDetails.address.state.id !== null) {
                    var stateNamelist = $filter('filter')($scope.State, { 'id': $scope.ContactDetails.address.state.id });
                    if (stateNamelist.length === 0)
                        stateName = null;
                    else
                        stateName = stateNamelist[0].name;
                }
            }
            addressOfEmp =
                 {
                     "id": null,
                     "streetAddressOne": $scope.ContactDetails.address.streetAddressOne,
                     "streetAddressTwo": $scope.ContactDetails.address.streetAddressTwo,
                     "city": $scope.ContactDetails.address.city,
                     "state": {
                         "id": (($scope.ContactDetails.address.state.id !== null && angular.isDefined($scope.ContactDetails.address.state.id) ? $scope.ContactDetails.address.state.id : null)),

                     },
                     "zipcode": $scope.ContactDetails.address.zipcode,
                     "completeAddress": $scope.ContactDetails.address.streetAddress + " " + "," + $scope.ContactDetails.address.streetAddress + " " + "," + $scope.ContactDetails.address.city + " " + "," +
                 stateName + " " + "," + $scope.ContactDetails.address.zipcode
                 }
        }
        else
            addressOfEmp = null;

        if ($scope.ProfessionalDetails !== null && angular.isDefined($scope.ProfessionalDetails)) {
            var designation;
            if ($scope.ProfessionalDetails.designation !== null && angular.isDefined($scope.ProfessionalDetails.designation)) {
                if ($scope.ProfessionalDetails.designation.id !== null) {
                    var DesignationName = $filter('filter')($scope.Designations, { 'id': $scope.ProfessionalDetails.designation.id });
                    if (DesignationName.length === 0)
                        DesignationName = null;
                    else
                        DesignationName = DesignationName[0].name;

                    designation = {
                        "id": $scope.ProfessionalDetails.designation.id,
                        "name": DesignationName
                    };
                }
            }
            else
                designation = null;
            var branch;
            if ($scope.ProfessionalDetails.branch !== null && angular.isDefined($scope.ProfessionalDetails.branch)) {
                if ($scope.ProfessionalDetails.branch.id !== null) {
                    var BranchName = $filter('filter')($scope.Branch, { 'id': $scope.ProfessionalDetails.branch.id });
                    if (BranchName.length === 0)
                        BranchName = null;
                    else
                        BranchName = BranchName[0].name;
                    branch = {
                        "id": $scope.ProfessionalDetails.branch.id
                    };
                }
            }
            else
                branch = null;

            var reportingManager;
            if ($scope.ProfessionalDetails.reportingManager !== null && angular.isDefined($scope.ProfessionalDetails.reportingManager)) {
                if ($scope.ProfessionalDetails.reportingManager.id !== null) {
                    reportingManager = {
                        "id": $scope.ProfessionalDetails.reportingManager.id,
                        "name": null,
                        "designation": null,
                        "roles": null
                    };
                }
            }
            else
                reportingManager = null;

            var role;
            if ($scope.ProfessionalDetails.roles !== null && angular.isDefined($scope.ProfessionalDetails.roles)) {
                if ($scope.ProfessionalDetails.roles.roleId !== null) {
                    var RoleName = $filter('filter')($scope.Roles, { 'id': $scope.ProfessionalDetails.roles.roleId });
                    if (RoleName.length === 0)
                        RoleName = null;
                    else
                        RoleName = RoleName[0].roleName;
                    //"contactRoleId": $scope.ProfessionalDetails.reportingManager.id,
                    var obj = {

                        "roleId": $scope.ProfessionalDetails.roles.roleId,
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
            $scope.ProfessionalDetails = {
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
                "firstName": $scope.ContactDetails.firstName,
                "lastName": $scope.ContactDetails.lastName,
                "email": $scope.ContactDetails.email,
                "cellPhone": $scope.Cellphone,
                "eveningTimePhone": null,
                "dayTimePhone": $scope.DayTimePhone,
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

        var SaveDetails = NewClaimSpecialistService.SaveSpecialist(DetailsParam);
        SaveDetails.then(function (success) {
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
            $location.url('ClaimSpecialistHome');
        }, function (error) {
            //$scope.ErrorMessage = error.data.errorMessage;
            var msg = $translate.instant('SaveDetails.ErroMessage');
            if (error.data != null) {
                msg = error.data.errorMessage;
            }
            else {
                msg = $translate.instant('SaveDetails.ErroMessage');
            }
            toastr.remove();
            toastr.error(msg, "Error");
        });
    }
    $scope.GetReportingmanager = GetReportingmanager;
    function GetReportingmanager() {
        if (angular.isDefined($scope.ProfessionalDetails.branch) && $scope.ProfessionalDetails.branch.id !== null) {
            var paramOfficeIdId =
                { "companyId": sessionStorage.getItem("CompanyId") };

            var GetReportingmanager = NewClaimSpecialistService.GetReportingmanager(paramOfficeIdId);
            GetReportingmanager.then(function (success) { $scope.Reportingmanagers = success.data.data; }, function (error) {
            });
        }
    }
    $scope.GoBack = GoBack;
    function GoBack() {
        $location.url('ClaimSpecialistHome');
    }
});