angular.module('MetronicApp').controller('NewEmployeeController', function ($rootScope, $filter, $scope, $http, $location, $translatePartialLoader,
    $translate, NewOfficeService, AuthHeaderService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('NewOffice');
    $translate.refresh();

    $scope.UserType = sessionStorage.getItem('RoleList');
    $scope.EmpDetails = {};
    $scope.StatusList = [{ id: true, name: "Active" }, { id: false, name: "In-Active" }]
    $scope.OfficeList;

    $scope.CommonObj =
        {
            IsEdit: sessionStorage.getItem("IsEdit"),
            CompanyName: sessionStorage.getItem("CompanyName"),
            BranchName: sessionStorage.getItem('BranchName'),
            EmpName: sessionStorage.getItem('EmpName'),
            Role: []
        };
    init();
    $scope.init = init;
    function init() {
        GetRoleList();
        GetDesignationList();
        GetOfficeList();
        GetRepoManagerList();
        if ($scope.CommonObj.IsEdit == "true") {
            $scope.EmpDetail = JSON.parse(sessionStorage.getItem("EmpDetails"));
            $scope.EmpDetails = $scope.EmpDetail;
            angular.forEach($scope.EmpDetails.roles, function (role) {
                $scope.CommonObj.Role.push(role.id);
            });

            $scope.EmpDetails.branchId = $scope.EmpDetails.branchOffice.id;
            $scope.EmpDetails.eveningTimePhone = $filter('tel')($scope.EmpDetails.eveningTimePhone);
        }
    }

    $scope.GoToHome = function () {
        $location.url(sessionStorage.getItem('HomeScreen'));
    };
    $scope.GoToCompany = function () {
        $location.url('Company');
    };
    $scope.GoBack = function () {
        $location.url('NewBranch');
    };
    $scope.GoInsuranceComapny = function () {
        $location.url('InsuranceCompanies');
    }

    $scope.GetRoleList = GetRoleList;
    function GetRoleList() {
        var getRoleLists = NewOfficeService.GetRoleList();
        getRoleLists.then(function (success) {

            $scope.RoleList = success.data.data;
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


    $scope.GetDesignationList = GetDesignationList;
    function GetDesignationList() {
        var getDesignationList = NewOfficeService.GetDesignationlist();
        getDesignationList.then(function (success) {

            $scope.DesignationList = success.data.data;
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



    $scope.GetOfficeList = GetOfficeList;
    function GetOfficeList(param) {

        var param = {
            "id": sessionStorage.getItem("CompanyId")
        }
        var response = NewOfficeService.GetOfficeList(param);
        response.then(function (Success) {
            $scope.OfficeListdata = Success.data.data;
                        $scope.EmpDetails.branchId=parseInt(sessionStorage.getItem("BranchId"));
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
    };
    $scope.GetRepoManagerList = GetRepoManagerList;
    function GetRepoManagerList(param) {
        //var param = {
        //    "companyId": sessionStorage.getItem("CompanyId")
        //}
        //var response = NewOfficeService.GetReprtingManagerlist(param);
        var param={
            id: sessionStorage.getItem("BranchId")
        }
        var response = NewOfficeService.ReportingMangerByBranch(param);
        response.then(function (Success) {
            $scope.RepoManagerList = Success.data.data;
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


    $scope.AddNewEmployee = AddNewEmployee;
    function AddNewEmployee() {
        var RoleList = [];
         
        angular.forEach($scope.CommonObj.Role, function (selectedRoles) {
            angular.forEach($scope.RoleList, function (role) {
                if (selectedRoles === role.id) {
                    RoleList.push({ id: role.id })
                }
            });
        });

        var edit = sessionStorage.getItem("IsEdit");
        if (edit == "false") {

            var param = {
                "id": $scope.EmpDetails.branchId,
                "employeeDetails": [
                  {
                      "password": null,
                      "designation":
                          {
                              "id": (($scope.EmpDetails.designation !== null && angular.isDefined) ? $scope.EmpDetails.designation.id : null)
                          },
                      "reportingManager":
                            {
                                "id": (($scope.EmpDetails.reportingManager !== null && angular.isDefined($scope.EmpDetails.reportingManager)) ? $scope.EmpDetails.reportingManager.id : null)
                            },
                      "email": $scope.EmpDetails.email,
                      "eveningTimePhone": $scope.EmpDetails.eveningTimePhone.replace(/[^0-9]/g, ''),
                      "firstName": $scope.EmpDetails.firstName,
                      "lastName": $scope.EmpDetails.lastName,
                      "isActive": true,
                      "roles": RoleList
                  }
                ]
            };
            var AddNewEmployee = NewOfficeService.AddNewEmployee(param);
            AddNewEmployee.then(function (success) {
                $scope.EmpDetails = {};
                $location.url('NewBranch');
                toastr.remove()
                toastr.success(success.data.message, $translate.instant("CommonConfirmationHeading"));
            }, function (error) {
                toastr.remove()
                toastr.error(error.data.errorMessage, $translate.instant("ErrorMessageHeading"));
            });
        }
        else {

            var param = {
                "id": $scope.EmpDetails.branchId,
                "employeeDetails": [
                  {
                      "password": $scope.EmpDetails.password,
                      "id": $scope.EmpDetails.id,
                      "designation":
                          {
                              "id": (($scope.EmpDetails.designation !== null && angular.isDefined) ? $scope.EmpDetails.designation.id : null)
                          },
                      "reportingManager":
                            {
                                "id": (($scope.EmpDetails.reportingManager !== null && angular.isDefined($scope.EmpDetails.reportingManager)) ? $scope.EmpDetails.reportingManager.id : null)
                            },
                      "email": $scope.EmpDetails.email,
                      "eveningTimePhone": $scope.EmpDetails.eveningTimePhone,
                      "firstName": $scope.EmpDetails.firstName,
                      "lastName": $scope.EmpDetails.lastName,
                      "isActive": $scope.EmpDetails.isActive,
                      "roles": RoleList
                  }
                ]
            };

            var EditEmployee = NewOfficeService.EditEmployee(param);
            EditEmployee.then(function (success) {
                $location.url('NewBranch');
                $scope.EmpDetails = {};
                toastr.remove()
                toastr.success(success.data.message, $translate.instant("CommonConfirmationHeading"));
            }, function (error) {
                toastr.remove()
                toastr.error(error.data.errorMessage, $translate.instant("ErrorMessageHeading"));
            });
        }

    };


});