angular.module('MetronicApp').controller('EditClaimSpecialistsController', function ($rootScope, $filter, $translate, $translatePartialLoader, $scope, settings, $location, EditClaimSpecialistsService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('EditClaimSpecialists');
    $translate.refresh();

    $scope.PageLength = $rootScope.settings.pagesize;
    $scope.ErrorMessage = "";
    $scope.CategoryList = [];
    $scope.Branch = [];
    $scope.Roles = [];
    $scope.Designations = [];
    $scope.Reportingmanagers = [];
    $scope.State = [];
    $scope.Claimlist = [];
    $scope.ClaimSpecialistsId;
    //Specialist Details variables
    $scope.ContactDetails = {};
    $scope.ProfessionalDetails = {};
    $scope.specialities = [];

   
   


    $scope.init = function () {
        //If session null then new specialists if has value then edit go and get the values       
        $scope.ClaimSpecialistsId = sessionStorage.getItem("ClaimSpecialistsId");
        if ($scope.ClaimSpecialistsId === null) {
            $location.url('ClaimSpecialistHome');
        }
        else {

            //get specialist
            var param = {
                "specialistId": $scope.ClaimSpecialistsId
            }
            var Details = EditClaimSpecialistsService.GetSpecialistDetails(param);
            Details.then(function (success) {
                $scope.ContactDetails = success.data.data.contactInfo;

                $scope.ContactDetails.cellPhone = $filter('tel')($scope.ContactDetails.cellPhone);
                $scope.ContactDetails.dayTimePhone = $filter('tel')($scope.ContactDetails.dayTimePhone);

                $scope.ProfessionalDetails = success.data.data.professionalInfo;
                $scope.SpecialtyOfSpecialist = success.data.data.specialities;
                //Get category
                var categoryPromise = EditClaimSpecialistsService.GetCategoryList();
                categoryPromise.then(function (success) {
                    $scope.CategoryList = success.data.data;
                    $scope.OriginalCategoryList = success.data.data;
                    angular.forEach($scope.SpecialtyOfSpecialist, function (item) {
                        $scope.CategoryList = $filter('filter')($scope.CategoryList, { 'categoryId': '!' + item.id });
                    });
                }, function (error) { $scope.ErrorMessage = error.data.errorMessage });

            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
                $location.url('ClaimSpecialistHome');
            });
            var paramClaim = {
                "assignedUserId": $scope.ClaimSpecialistsId
            };
            var ClaimList = EditClaimSpecialistsService.GetClaims(paramClaim);
            ClaimList.then(function (success) { $scope.Claimlist = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

            //Get ddl source
            var paramComanyId = {
                "companyId": sessionStorage.getItem("CompanyId")
            };
            var Getbranch = EditClaimSpecialistsService.GetBranch(paramComanyId);
            Getbranch.then(function (success) { $scope.Branch = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });           

            var GetRoles = EditClaimSpecialistsService.GetRole();
            GetRoles.then(function (success) { $scope.Roles = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

            var getDesignation = EditClaimSpecialistsService.GetDesignation();
            getDesignation.then(function (success) { $scope.Designations = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

            var param=
                {
                    "isTaxRate": false,
                    "isTimeZone": false
                }
            var GetState = EditClaimSpecialistsService.GetState(param);
            GetState.then(function (success) { $scope.State = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

             var GetReportingmanager = EditClaimSpecialistsService.GetReportingmanager(paramComanyId);
            GetReportingmanager.then(function (success) { $scope.Reportingmanagers = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });


        }


    }

    $scope.init();

    //Sort New ClaimSpecialists  Grid wiith radiobutton
    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

    //CategoryExpert Section    
    //Current categoryId of specialty
    $scope.SpecialtyOfSpecialist = [];
    $scope.OriginalCategoryList = [];

    //Add Category to expert button > click
    $scope.AddToExpertCategory = AddToExpertCategory;
    function AddToExpertCategory() {
        angular.forEach($scope.AddSpecialtyList, function (item) {
            if ($scope.SpecialtyOfSpecialist === null) {
                $scope.SpecialtyOfSpecialist = [];
                $scope.SpecialtyOfSpecialist.push(item);
            }
            else if ($scope.SpecialtyOfSpecialist.indexOf(item) === -1)
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
            $scope.RemoveSpecialtyList.splice($scope.RemoveSpecialtyList.indexOf(item), 1);
            $scope.RemoveFromExpertCategory();
        }
    }

    //Get checkbox is cheed or not
    $scope.GetIsChecked = function (list, item) {
        list.indexOf(item) > -1
    }
    //end category

    $scope.SaveClaimSpecialist = SaveClaimSpecialist;
    function SaveClaimSpecialist() {
        var addressOfEmp; var stateName="";
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
            addressOfEmp = {
                "id": (($scope.ContactDetails.address.id !== null && angular.isDefined($scope.ContactDetails.address.id))?$scope.ContactDetails.address.id:null),
                "streetAddressOne": $scope.ContactDetails.address.streetAddressOne,
                "streetAddressTwo": $scope.ContactDetails.address.streetAddressTwo,
                "city": $scope.ContactDetails.address.city,
                "zipcode": $scope.ContactDetails.address.zipcode,
                "state": {
                    "state": stateName,
                    "id": (($scope.ContactDetails.address.state.id !== null && angular.isDefined($scope.ContactDetails.address.state.id) ? $scope.ContactDetails.address.state.id:null))
                },
                "completeAddress": $scope.ContactDetails.address.streetAddress + " " + "," + $scope.ContactDetails.address.streetAddress + " " + "," + $scope.ContactDetails.address.city + " " + "," +
                 stateName + " " + "," + $scope.ContactDetails.address.zipcode
            }
        }
        else
            addressOfEmp = null;
        var designation;
        if ($scope.ProfessionalDetails.designation !== null) {
            if ($scope.ProfessionalDetails.designation.id !== null) {
                var DesignationName = $filter('filter')($scope.Designations, { 'id': $scope.ProfessionalDetails.designation.id });
                if (DesignationName.length === 0)
                    DesignationName = null;
                else
                    DesignationName = DesignationName[0].name;

                designation=  {
                    "id": $scope.ProfessionalDetails.designation.id,
                    "name": DesignationName
                };
            }
        }
        else
            designation=null;
        var branch;
        if ($scope.ProfessionalDetails.branch !== null) {
            if ($scope.ProfessionalDetails.branch.id !== null) {
                var BranchName = $filter('filter')($scope.Branch, { 'id': $scope.ProfessionalDetails.branch.id });
                if (BranchName.length === 0)
                    BranchName = null;
                else
                    BranchName = BranchName[0].name;
                branch={
                    "id": $scope.ProfessionalDetails.branch.id,
                    "name": BranchName
                };
            }
        }
        else
            branch=null;
        var role;
        if ($scope.ProfessionalDetails.roles !== null) {
            if ($scope.ProfessionalDetails.roles.id !== null) {
                var RoleName = $filter('filter')($scope.Roles, { 'id': $scope.ProfessionalDetails.roles.id });
                if (RoleName.length === 0)
                    RoleName = null;
                else
                    RoleName = RoleName[0].roleName;
                role= [
                   {
                       "roleId": $scope.ProfessionalDetails.roles.roleId,
                       "contactRoleId": null,
                       "rolePermissionId": null,
                       "roleName": RoleName,
                       "status": false,
                       "description": null,
                       "permissions": null
                   }
                ];
            }
        }
        else
            role=[];
        var reportingManager;
        if ($scope.ProfessionalDetails.reportingManager !== null) {
            if ($scope.ProfessionalDetails.reportingManager.roleId !== null) {
                var ReportingManagerName = $filter('filter')($scope.Reportingmanagers, { 'id': $scope.ProfessionalDetails.reportingManager.roleId });
                if (ReportingManagerName.length === 0)
                    ReportingManagerName = null;
                else
                    ReportingManagerName = ReportingManagerName[0].name;
                reportingManager = {
                    "id": $scope.ProfessionalDetails.reportingManager.id,
                    "name": ReportingManagerName,
                    "designation": null,
                    "roles": null
                };
            }
        }
        else
            reportingManager = null;
        $scope.ContactDetails.cellPhone = $scope.ContactDetails.cellPhone.replace(/[^0-9]/g, '');
        $scope.ContactDetails.dayTimePhone = $scope.ContactDetails.dayTimePhone.replace(/[^0-9]/g, '');
        var DetailsParam = {
            "specialistId": $scope.ClaimSpecialistsId,
            "contactInfo": {
                "firstName": $scope.ContactDetails.firstName,
                "lastName": $scope.ContactDetails.lastName,
                "email": $scope.ContactDetails.email,
                "cellPhone": $scope.ContactDetails.cellPhone.replace(/[^0-9]/g, ''),
                "dayTimePhone": $scope.ContactDetails.dayTimePhone.replace(/[^0-9]/g, ''),
                "eveningTimePhone": null,
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
        var SaveDetails = EditClaimSpecialistsService.UpdateSpecialist(DetailsParam);
        SaveDetails.then(function (success) {

            toastr.remove();
            toastr.success(success.data.message, "Confirmation");

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
    $scope.GoBack = GoBack;
    function GoBack() {
        $location.url('ClaimSpecialistHome');
    }
});
