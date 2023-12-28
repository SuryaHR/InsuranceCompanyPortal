angular.module('MetronicApp').controller('UserController', function ($rootScope, $scope, $window, $state, $filter, $uibModal, $timeout, $location, $translate,
    $translatePartialLoader, UserAdminstrationService, AuthHeaderService, ReportingManagerRoleMapConstants) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    //set language
    $translatePartialLoader.addPart('CompanyAdminstration');
    $translate.refresh();
    $scope.pagesize = $rootScope.settings.pagesize;
    $scope.pageNum = 1;
    $scope.AddEditUser = false;
    $scope.IsInsuranceAgent = false;
    $scope.isButtonClicked = false;
    $scope.userNameChanges = false;
    $scope.IsEditPersonalDetails = false;
    $scope.IsSaveEnabled = false;
    $scope.CompanyTotalEmp = 0;
    $scope.ReportingManager = [];
    $scope.EmployeeExistingEmail = null;
    
    function init() {
        $scope.accountStatusList = [{ "id": true, "name": "Blocked" }, { "id": false, "name": "Unblock" }];

        // Get Employee list
        ;getEmployeeList()
    }
    init();

    $scope.getEmployeeList = getEmployeeList;
    function getEmployeeList() {
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "companyId": sessionStorage.getItem("CompanyId"),
            "pageSize": $scope.pagesize,
            "pageNumber": $scope.pageNum
        };
        $scope.CompanyEmployeeList = [];
        var CompanyEmployee = UserAdminstrationService.GetCompanyEmployee(param);
        CompanyEmployee.then(function (success) {
            $scope.CompanyEmployeeList = success.data.data["contactDTOs"];
            $scope.CompanyTotalEmp = success.data.data["totalUser"];

            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            if (error.status === 500 || error.status === 404) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
            else {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            }
            $(".page-spinner-bar").addClass("hide");
        });
    }

    $scope.pageChanged = function pageChanged(pageNum) {
        $scope.pageNum = pageNum;
        // Get Employee list based on current page
        getEmployeeList();
    }


    $scope.getOtherDetails = getOtherDetails;
    function getOtherDetails() {
        // var param = { "companyId": sessionStorage.getItem("CompanyId") };
        // $scope.ReportingManager = [];
        // var Desigantion = UserAdminstrationService.GetReportingManager(param);
        // Desigantion.then(function (success) { $scope.ReportingManager = success.data.data; }, function (error) {

        //     if (error.status === 500 || error.status === 404) {
        //         toastr.remove();
        //         toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
        //     }
        //     else {
        //         toastr.remove();
        //         toastr.error(error.data.errorMessage, "Error");
        //     }

        // });

        var paramCompanyId = { "id": sessionStorage.getItem("CompanyId") };
        $scope.OfficeList = [];
        var Office = UserAdminstrationService.GetBranchOffice(paramCompanyId);
        Office.then(function (success) { $scope.OfficeList = success.data.data; }, function (error) {

            if (error.status === 500 || error.status === 404) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
            else {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            }
        });
        $scope.DesignationList = [];
        var Desigantion = UserAdminstrationService.GetDesignation();
        Desigantion.then(function (success) { $scope.DesignationList = success.data.data; }, function (error) {

            if (error.status === 500 || error.status === 404) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
            else {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            }
        });
        $scope.RoleList = [];
        var Role = UserAdminstrationService.GetRole();
        Role.then(function (success) {
            $scope.RoleList = success.data.data;
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            if (error.status === 500 || error.status === 404) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
            else {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            }
        });
    }
    $scope.CommonObj = { "RoleOfUser": [], "branch": [] };


    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }
    $scope.IsEdit = false;
    $scope.editAdminContact = function (item) {
        //  $(".page-spinner-bar").removeClass("hide");
        $scope.getOtherDetails();
        if (item !== null && angular.isDefined(item)) {
            $scope.IsEdit = true;
            var ParamEmployee = { "id": item.userId };
            var Details = UserAdminstrationService.GetEmployeeDetails(ParamEmployee);
            Details.then(function (success) {
                $scope.EmployeeDetails = success.data.data;
                $scope.EmployeeExistingEmail = success.data.data.email;
                $scope.EmployeeDetails.SSOEnabled = $scope.EmployeeDetails.ssoEnableFlag?.toString();
                if ($scope.EmployeeDetails.agencyCode != undefined && $scope.EmployeeDetails.agencyCode != null && $scope.EmployeeDetails.agencyCode !== '') {
                    $scope.IsInsuranceAgent = true;
                } else {
                    $scope.IsInsuranceAgent = false;
                }
                $scope.EmployeeDetails.dayTimePhone = $filter('tel')($scope.EmployeeDetails.dayTimePhone);
                $scope.CommonObj.RoleOfUser = [];        
                angular.forEach($scope.EmployeeDetails.role, function (roleobj) {
                    $scope.EmployeeDetails.role.id = roleobj.roleId;
                    updateRoleValue($scope.EmployeeDetails.role.id);
                    $scope.CommonObj.RoleOfUser.push(roleobj.roleId);
                   

                });
                $timeout(function () {
                    // $scope.EmployeeDetails.accountStatus = $scope.EmployeeDetails.accountStatus ;
                    $scope.AddEditUser = true;
                    $scope.$apply();
                    $(".page-spinner-bar").addClass("hide");
                }, 1000);
            }, function (error) { });

        }
        else {
            $scope.Form.$setPristine();
            $scope.Form.$setUntouched();
            $scope.IsEdit = false;
            $scope.EmployeeDetails = {"accountStatus":true};
            $scope.EmployeeDetails.SSOEnabled = "false";
            $scope.CommonObj.RoleOfUser = [];
            $scope.CommonObj.branch = [];
            $scope.AddEditUser = true;

        }
    };
    $scope.updateRoleValue =  updateRoleValue;
    function updateRoleValue(value){

        $scope.reportRole = ReportingManagerRoleMapConstants.managerRoleMaping;
        console.log($scope.reportRole)
        for (let index = 0; index < $scope.reportRole.length; index++) {
            const element = $scope.reportRole[index];
            if (element.id == value) {
                
                var param = 
                {
                    "manegers":element.mappingRole
                }
             
                var Desigantion = UserAdminstrationService.GetReportingManagerRolemap(param);
                Desigantion.then(function (success) { 
                $scope.ReportingManager = success.data.data; 
                
                }, function (error) {

                    if (error.status === 500 || error.status === 404) {
                        toastr.remove();
                        toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
                    }
                    else {
                        toastr.remove();
                        toastr.error(error.data.errorMessage, "Error");
                    }

                });

            }
        }

        if (value !== undefined && value != null) {
            //  var isRole = isInsuranceRoleAvailableInArray(1007,value);
            if (value == 1007) {
                $scope.IsInsuranceAgent = true;
            } else {
                $scope.IsInsuranceAgent = false;
            }
        } else {
            $scope.IsInsuranceAgent = false;
        }
    };

    var isInsuranceRoleAvailableInArray = function (value, array) {
        return array.indexOf(value) > -1;
    }
    $scope.DeleteAdminContact = function (item) {
        if (item.accountStatus == true) {
            var param = { "id": item.userId, "status": item.accountStatus };
            $scope.CompanyEmployeeList = [];
            var DeleteEmployee = UserAdminstrationService.DeleteUser(param);
            DeleteEmployee.then(function (success) {
                toastr.remove()
                toastr.success(success.data.message, "Confirmation");
                getEmployeeList();
            }, function (error) {
                toastr.remove()
                toastr.error(error.data.errorMessage, "Error");
            });
        }
        else {
            bootbox.confirm({
                size: "",
                title: $translate.instant('Delete Employee'),
                message: $translate.instant('Are you sure you want to delete the user?'), closeButton: false,
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
                        var param = { "id": item.userId, "status": item.accountStatus };
                        $scope.CompanyEmployeeList = [];
                        var DeleteEmployee = UserAdminstrationService.DeleteUser(param);
                        DeleteEmployee.then(function (success) {
                            toastr.remove()
                            toastr.success(success.data.message, "Confirmation");
                            getEmployeeList();
                        }, function (error) {
                            toastr.remove()
                            toastr.error(error.data.errorMessage, "Error");
                        });
                    }
                }
            });
        }
    };


    $scope.DeleteAdminContactDirect = function (EmployeeDetails) {
        bootbox.confirm({
            size: "",
            title: $translate.instant('Delete Employee'),
            message: $translate.instant('Are you sure you want to delete the user?'), closeButton: false,
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
                    var param = { "id": EmployeeDetails.userId, "status": false };
                    $scope.CompanyEmployeeList = [];
                    var DeleteEmployee = UserAdminstrationService.DeleteUser(param);
                    DeleteEmployee.then(function (success) {
                        toastr.remove()
                        toastr.success(success.data.message, "Confirmation");
                        $scope.AddEditUser = false;
                        getEmployeeList();
                    }, function (error) {
                        toastr.remove()
                        toastr.error(error.data.errorMessage, "Error");
                    });
                }
            }
        });

    };


    $scope.ActiveInactiveContact = function (EmployeeDetails) {

        var param = { "id": EmployeeDetails.userId, "status": EmployeeDetails.accountStatus };
        $scope.CompanyEmployeeList = [];
        if (EmployeeDetails.accountStatus) {
            $scope.isButtonClicked = true;
            var DeleteEmployee = UserAdminstrationService.DeleteUser(param);
            DeleteEmployee.then(function (success) {
                $scope.EmployeeDetails.accountStatus = false;
                $scope.isButtonClicked = false;
                toastr.remove()
                toastr.success(success.data.message, "Confirmation");
                getEmployeeList();
            }, function (error) {
                toastr.remove()
                toastr.error(error.data.errorMessage, "Error");
            });
        } else {
            $scope.isButtonClicked = true;
            var DeleteEmployee = UserAdminstrationService.ActivateUser(param);
            DeleteEmployee.then(function (success) {
                $scope.EmployeeDetails.accountStatus = true;
                $scope.isButtonClicked = false;
                toastr.remove()
                toastr.success(success.data.message, "Confirmation");
                getEmployeeList();
            }, function (error) {
                toastr.remove()
                toastr.error(error.data.errorMessage, "Error");
            });
        }


    };

    $scope.Cancel = Cancel;
    function Cancel() {
        $scope.EmployeeDetails = {};
        $scope.CommonObj.RoleOfUser = [];
        $scope.CommonObj.branch = [];
        $scope.AddEditUser = false; GetEmployee();
    }

    var getValue = function (value) {
        alert("value is", value);
    }
    $scope.Update = Update;
    function Update() {
        $(".page-spinner-bar").removeClass("hide");
        var RoleList = [];
        angular.forEach($scope.CommonObj.RoleOfUser, function (role) {
            RoleList.push({ "id": role });
        });
        var requestData = new FormData();
        if ($scope.EmployeeDetails.displayPicture != null && $scope.EmployeeDetails.displayPicture.FileName != null) {
            requestData.append("filesDetails", JSON.stringify([{
                "fileName": $scope.EmployeeDetails.displayPicture.FileName,
                "fileType": $scope.EmployeeDetails.displayPicture.FileType,
                "extension": $scope.EmployeeDetails.displayPicture.FileExtension,
                "filePurpose": "PROFILE_PICTURE",
                "latitude": null,
                "longitude": null
            }]))
            requestData.append("file", $scope.EmployeeDetails.displayPicture.File);
        } else {
            $scope.EmployeeDetails.displayPicture = null;
        }


        var userRole = [];
        userRole.push({ "id": $scope.EmployeeDetails.role.id });
        if (!$scope.IsEdit) {
            var EmpDetails = {
                "id": (angular.isDefined($scope.EmployeeDetails.branchDetails) && $scope.EmployeeDetails.branchDetails != null) ? $scope.EmployeeDetails.branchDetails.id : null,
                "employeeDetails": [{
                    "password": null,
                    "designation":
                    {
                        "id": (($scope.EmployeeDetails.designation.id !== null && angular.isDefined($scope.EmployeeDetails.designation.id)) ? $scope.EmployeeDetails.designation.id : null)
                    },
                    "reportingManager":
                    {
                        "id": (($scope.EmployeeDetails.reportingManagerId !== null && angular.isDefined($scope.EmployeeDetails.reportingManagerId)) ? $scope.EmployeeDetails.reportingManagerId : null)
                    },
                    "email": $scope.EmployeeDetails.email,
                    "dayTimePhone": $scope.EmployeeDetails.dayTimePhone.replace(/[^0-9]/g, ''),
                    "cellPhone": $scope.EmployeeDetails.cellPhone ? $scope.EmployeeDetails.cellPhone.replace(/[^0-9]/g, '') : null,
                    "firstName": $scope.EmployeeDetails.firstName,
                    "lastName": $scope.EmployeeDetails.lastName,
                    "agencyCode": $scope.EmployeeDetails.agencyCode,
                    "isActive": true,
                    "roles": userRole,
                    "agencyCode": $scope.EmployeeDetails.agencyCode,
                    "isEmailChanges": $scope.userNameChanges,
                    "extension": $scope.EmployeeDetails.extension ? $scope.EmployeeDetails.extension : null,
                    "ssoEnableFlag" : $scope.EmployeeDetails.SSOEnabled ? $scope.EmployeeDetails.SSOEnabled : false


                }]
            };
        }

        var data = new FormData();
        if ($scope.personalDetails && $scope.personalDetails.profilePicture) {
            data.append("filesDetails", null);
            data.append("file", null);
            data.append("details", JSON.stringify(EmpDetails))
            var AddDetails = UserAdminstrationService.AddUser(data);
            AddDetails.then(function (success) {
                getEmployeeList();
                $scope.isUserAlrealdyExist = success.data.data.alreadyExistEmployees;
                if ($scope.isUserAlrealdyExist != null && $scope.isUserAlrealdyExist.length > 0) {
                    $(".page-spinner-bar").addClass("hide");
                    toastr.remove();
                    toastr.error('Email address has been previously used.', "Error");

                } else {
                    $scope.AddEditUser = false;
                    // GetEmployee();
                    $(".page-spinner-bar").addClass("hide");
                    toastr.remove();
                    toastr.success(success.data.message, "Confirmation");
                }
            }, function (error) {
                $(".page-spinner-bar").addClass("hide");
                toastr.remove()
                toastr.error(error.data.errorMessage, "Error");
            });
        } else {
            var EmpDetails = {
                "id": (angular.isDefined($scope.EmployeeDetails.branchDetails) && $scope.EmployeeDetails.branchDetails != null) ? $scope.EmployeeDetails.branchDetails.id : null,
                "employeeDetails": [{
                    "password": null,
                    "id": $scope.EmployeeDetails.userId,
                    "designation":
                    {
                        "id": (($scope.EmployeeDetails.designation.id !== null && angular.isDefined($scope.EmployeeDetails.designation.id)) ? $scope.EmployeeDetails.designation.id : null)
                    },
                    "reportingManager": { "id": (($scope.EmployeeDetails.reportingManagerId !== null && angular.isDefined($scope.EmployeeDetails.reportingManagerId)) ? $scope.EmployeeDetails.reportingManagerId : null) },
                    "email": $scope.EmployeeDetails.email,
                    "dayTimePhone": $scope.EmployeeDetails.dayTimePhone.replace(/[^0-9]/g, ''),
                    "cellPhone": $scope.EmployeeDetails.cellPhone ? $scope.EmployeeDetails.cellPhone.replace(/[^0-9]/g, '') : null,
                    "firstName": $scope.EmployeeDetails.firstName,
                    "lastName": $scope.EmployeeDetails.lastName,
                    "isActive": $scope.EmployeeDetails.accountStatus,
                    "roles": userRole,
                    "agencyCode": $scope.EmployeeDetails.agencyCode,
                    "isEmailChanges": $scope.userNameChanges,
                    "isAccountBlocked": $scope.EmployeeDetails.isAccountBlocked,
                    "extension": $scope.EmployeeDetails.extension ? $scope.EmployeeDetails.extension : null,
                    "ssoEnableFlag" : $scope.EmployeeDetails.SSOEnabled ? $scope.EmployeeDetails.SSOEnabled : false
                }]
            };
            requestData.append("details", JSON.stringify(EmpDetails));
            var UpdateDetails = UserAdminstrationService.updateUser(requestData);
            UpdateDetails.then(function (success) {
                getEmployeeList()
                //$scope.AddEditUser = false;
                if (success.data && success.data.data)
                    $scope.EmployeeDetails.isAccountBlocked = success.data.data.isAccountBlocked;
                $(".page-spinner-bar").addClass("hide");
                toastr.remove()
                toastr.success(success.data.message, "Confirmation");
                $scope.userNameChanges = false;
                $scope.AddEditUser = false; GetEmployee();
            }, function (error) {
                $(".page-spinner-bar").addClass("hide");
                toastr.remove()
                if (error.status === 500 || error.status === 404) {
                    toastr.error('Email address already exists!', "Error");
                } else {
                    toastr.error(error.data.errorMessage, "Error");
                }
            });
        }
    }

    function GetEmployee() {
        var param = { "companyId": sessionStorage.getItem("CompanyId") };
       // $scope.CompanyEmployeeList = [];
        var CompanyEmployee = UserAdminstrationService.GetCompanyEmployee(param);
        CompanyEmployee.then(function (success) {
            $scope.CompanyEmployeeList = success.data.data;
        }, function (error) {

        });
    }
    $scope.ResetPassword = ResetPassword;
    function ResetPassword(ev) {
        bootbox.alert({
            size: "",
            title: $translate.instant('PopPasswordResetLink.title'),
            message: $translate.instant('PopPasswordResetLink.Message'),
            closeButton: false,
            className: "modalcustom",
            callback: function () { /* your callback code */ }
        });
    };

    //Go to upload user details
    $scope.LoadUserDetailsFromFile = LoadUserDetailsFromFile;
    function LoadUserDetailsFromFile() {
        $location.url('\UserDetailsUpload')
    }

    $scope.GotoDashboard = function () {
        $location.url(sessionStorage.getItem('HomeScreen'));
    }

    $scope.resetUserPassword = resetUserPassword;
    function resetUserPassword(employeeDetails) {
        $(".page-spinner-bar").removeClass("hide");
        if (employeeDetails) {
            var EmpDetails = {
                "id": employeeDetails.userId
            }
            var resetPassword = UserAdminstrationService.resetUserPassword(EmpDetails);
            resetPassword.then(function (success) {
                $(".page-spinner-bar").addClass("hide");
                toastr.remove()
                toastr.success(success.data.message, "Confirmation");
            }, function (error) {
                $(".page-spinner-bar").addClass("hide");
                toastr.remove()
                toastr.error(error.data.errorMessage, "Error");
            });
        }
    }


    //Reset Password when email address has been changed.
    $scope.emailChanged = emailChanged;
    function emailChanged() {
        if(!!$scope.EmployeeExistingEmail && $scope.EmployeeExistingEmail == $scope.EmployeeDetails.email)
            $scope.userNameChanges = false;
        else
            $scope.userNameChanges = true;
    }

    // Unblock employee
    $scope.unblockEmployee = unblockEmployee;
    function unblockEmployee() {
        $scope.EmployeeDetails.isAccountBlocked = false;
        Update();
    }

    $scope.AddProfilePicture = function () {
        angular.element('#FileUpload').trigger('click');
    };

    $scope.DeleteProfilePicture = function (e) {
        $scope.EmployeeDetails.displayPicture = null;
        $scope.Form.$setDirty();

    }

    $scope.LoadFileInList = function (e) {
        $scope.$apply(function () {
            $scope.EmployeeDetails.displayPicture =
            {
                "FileName": e.target.fileName, "FileExtension": e.target.fileExtension, "FileType": e.target.fileType,
                "Image": e.target.result, "File": e.target.file, "isLocal": true
            }
        });
    };


    $scope.getAttachmentDetails = function (e) {
        $scope.displayAddImageButton = true;
        $scope.IsSaveEnabled = true;
        $scope.$apply(function () {
            var files = event.target.files;
            $scope.filed = event.target.files;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var reader = new FileReader();
                reader.file = file;
                reader.fileName = files[i].name;
                reader.fileType = files[i].type;
                reader.fileExtension = files[i].name.substr(files[i].name.lastIndexOf('.'));
                reader.onload = $scope.LoadFileInList;
                reader.readAsDataURL(file);
            }
        });
        $scope.Form.$setDirty();
    };

});
