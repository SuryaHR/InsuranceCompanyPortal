angular.module('MetronicApp').controller('RolesAndPermissionMappingController', function ($rootScope, $scope,
    settings, $location, $translate, $translatePartialLoader, RolesAndPermissionMappingService, AuthHeaderService) {

    //set language
    $translatePartialLoader.addPart('AdminPermissionMapping');
    $translate.refresh();
    $scope.RoleList = [];
    $scope.Role;
    $scope.ScreenList = [];
    $scope.ScreenPermission = [];
    $scope.OriginalScreenPermission = [];
    $scope.ErrorMessage = "";
    $scope.DisplayError = false;
    init();

    function init() {
        $(".page-spinner-bar").removeClass("hide");
        //Get Role List #94
        var promiseGetRoles = RolesAndPermissionMappingService.GetRoleList();
        promiseGetRoles.then(function (success) {
            $scope.RoleList = success.data.data;
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

        //Get All Screen list
        var GetAllScreens = RolesAndPermissionMappingService.GetAllScreenList();
        GetAllScreens.then(function (success) {
            $scope.ScreenList = success.data.data;
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

    //Get permission's for specific role
    $scope.GetPermissionsForRoles = GetPermissionsForRoles;
    function GetPermissionsForRoles() {
        if ($scope.Role) {
            $(".page-spinner-bar").removeClass("hide");
            var paramRoleId =
            {
                "roleId": $scope.Role
            };
            var getScreenPermissions = RolesAndPermissionMappingService.GetScreenPermissions(paramRoleId);
            getScreenPermissions.then(function (success) {
                $scope.OriginalScreenPermission = [];
                $scope.OriginalScreenPermission = angular.copy(success.data.data);
                $scope.ScreenPermission = success.data.data;
                $scope.CheckSelected()
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                if (error !== null) {
                    toastr.remove();
                    toastr.error(error.data.errorMessage, "Error");
                }
                $(".page-spinner-bar").addClass("hide");
            });
        }
    }

    //Select existing permission for role
    $scope.CheckSelected = CheckSelected;
    function CheckSelected() {
        angular.forEach($scope.ScreenList, function (screen) {
            screen.IsScreenSelect = false;
            screen.IsCreate = false;
            screen.IsDelete = false;
            screen.IsSelect = false;
            screen.IsUpdate = false;
            screen.isSearch = false;
        });

        $scope.AssignedPermissions = [];
        $scope.AssignedPermissions = $scope.ScreenPermission[0].permissions;
        angular.forEach($scope.AssignedPermissions, function (permission) {
            angular.forEach($scope.ScreenList, function (screen) {
                if (permission.id == screen.id) {
                    if (screen.name === 'COMPARABLE SEARCH') {
                        screen.isSearch = permission.canSearch;
                        if (screen.isSearch)
                            screen.IsScreenSelect = true;
                    }
                    else {
                        screen.IsCreate = permission.canCreate;
                        screen.IsDelete = permission.canDelete;
                        screen.IsSelect = permission.canSelect;
                        screen.IsUpdate = permission.canUpdate;
                        if (screen.IsCreate && screen.IsDelete && screen.IsSelect && screen.IsUpdate)
                            screen.IsScreenSelect = true;
                    }
                    screen.isSelected = true;
                }
            })
        });
    }

    //Save permission
    $scope.AssignPermission = function () {
        if ($scope.ScreenList == null || $scope.ScreenList.length == 0) {
            $scope.DisplayError = true;
        }
        else {
            $(".page-spinner-bar").removeClass("hide");
            $scope.Permissions = [];
            angular.forEach($scope.ScreenList, function (screen) {
                if (screen.isSelected) {
                    $scope.Permissions.push(
                        {
                            "id": screen.id,
                            "permission":
                            {
                                "canDelete": screen.IsDelete,
                                "canUpdate": screen.IsUpdate,
                                "canCreate": screen.IsCreate,
                                "canSelect": screen.IsSelect,
                                "canSearch": screen.isSearch
                            }
                        })
                }
            });
            $scope.DeletePermissionList = [];
            var flag = false;
            angular.forEach($scope.OriginalScreenPermission[0].permissions, function (OldPermissionList) {
                angular.forEach($scope.Permissions, function (Newpermission) {
                    if (Newpermission.id === OldPermissionList.id) {
                        flag = true;
                    }
                });
                if (!flag) {
                    $scope.Permissions.push({
                        "id": OldPermissionList.id,
                        "isDelete": true
                    });
                }
                flag = false;
            });
            var param = {
                "id": $scope.Role,
                "permissions": $scope.Permissions
            };
            //Assign Permission to role
            var promiseGetRoles = RolesAndPermissionMappingService.AssignPermissionToRole(param);
            promiseGetRoles.then(function (success) {
                $scope.Status = success.data.status;
                if ($scope.Status == 200) {
                    bootbox.alert({
                        size: "",
                        title: $translate.instant("AlertMessage.PermissionAssignTitle"),
                        closeButton: false,
                        message: success.data.message,
                        className: "modalcustom",
                        callback: function () { /* your callback code */ }
                    });
                }
                $(".page-spinner-bar").addClass("hide");
            },
                function (error) {
                    toastr.remove();
                    toastr.error(error.data.errorMessage, "Error");
                    $(".page-spinner-bar").addClass("hide");
                });
        }
    }

    //Selete Unselect screen
    $scope.SelectScreen = SelectScreen;
    function SelectScreen(screen) {
        if (screen.name === "COMPARABLE SEARCH")
            screen.isSearch = screen.IsScreenSelect;
        else {
            screen.IsCreate = screen.IsScreenSelect;
            screen.IsDelete = screen.IsScreenSelect;
            screen.IsSelect = screen.IsScreenSelect;
            screen.IsUpdate = screen.IsScreenSelect;
        }
        screen.isSelected = screen.IsScreenSelect;
    }

    $scope.CheckScreen = CheckScreen
    function CheckScreen(screen) {
        if (screen.IsCreate || screen.IsDelete || screen.IsSelect || screen.IsUpdate || screen.isSearch)
            screen.isSelected = true;
        else
            screen.isSelected = false
        //If all permissions get seleted the automatically screen get seleted.
        if ((screen.IsCreate && screen.IsDelete && screen.IsSelect && screen.IsUpdate) || screen.isSearch) {
            screen.IsScreenSelect = true;
        }
        else
            screen.IsScreenSelect = false;
    }

    $scope.GoToHome = function () {
        $location.url(sessionStorage.getItem('HomeScreen'));
    }
});