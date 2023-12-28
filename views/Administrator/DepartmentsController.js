angular.module('MetronicApp').controller('DepartmentsController', function ($rootScope, $scope, $location, $uibModal, $translate, $translatePartialLoader,
    DepartmentsService,AuthHeaderService) {

    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('Departments');
    $translate.refresh();
    $scope.NewDepartment = false;
    $scope.HeadList = [];
    $scope.DepartmentList = [];
    $scope.departmentEmpoyeeList = [];
    $scope.departmentHeadList = [];    
    $scope.DeptHeadList = [];
    $scope.EmployeeList = [];
    $scope.SelectedEmployees = [];
    $scope.StatusList = [{ id: true, name: "Active" }, { id: false, name: "In-Active" }]
    $scope.DepartmentDetails = {};
    function init()
    {
        GetDepartmentList();
        GetEmployees();
    }
    init();
    $scope.GetEmployees = GetEmployees;
    function GetEmployees() {
        //$(".page-spinner-bar").removeClass("hide");
        //var getEmployees = DepartmentsService.GetEmployees();
        //getEmployees.then(function (success) {
        //    $scope.EmployeeList = success.data.data;
        //    $scope.departmentHeadList = [];
        //    //Getting list of employees which are active and not part of any deprtment and not head of any department
        //    angular.forEach($scope.EmployeeList, function (value, key) {
        //        if (value.isVendorDepartmentEmployee != true && value.isVendorDepartmentHead != true && value.active == true) {
        //            $scope.departmentEmpoyeeList.push(value);
        //            $scope.departmentHeadList.push(value);
        //        }
        //    });
        //    $(".page-spinner-bar").addClass("hide");
        //}, function (error) {
        //    toastr.remove();
        //    toastr.error(((error !== null) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage, "error"));
        //});
    };
    $scope.GetDepartmentList =GetDepartmentList;
    function GetDepartmentList() {
        //var getDepartments = DepartmentsService.GetDepartments();
        //getDepartments.then(function (success) {
        //    $scope.DepartmentList = success.data.data;           
        //}, function (error) {
        //    toastr.remove();
        //    toastr.error(((error !== null) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage, "error"));
        //});
    };
    $scope.GetDepartmentDetails = GetDepartmentDetails;
    function GetDepartmentDetails(dept) {
        //$(".page-spinner-bar").removeClass("hide");
        var param =
            {
                "id": dept.id
            };
       // var getDepartmentDetails = DepartmentsService.GetDepartmentDetails(param);
        //getDepartmentDetails.then(function (success) {
        //    $scope.DepartmentDetails = success.data.data;
        //    $scope.OrigionalAddedEmployee = $scope.DepartmentDetails.departmentEmployees;
        //    //Get employee(department head) into the list of department head (by deafult we will not get this added in GetEmployees() function)
        //    angular.forEach($scope.EmployeeList, function (value, key) {
        //        if (angular.isDefined($scope.DepartmentDetails.departmentHead) && $scope.DepartmentDetails.departmentHead !== null) {
        //            if ($scope.DepartmentDetails.departmentHead.id == value.id) {
        //                $scope.departmentHeadList.push(value);
        //            }
        //        }
        //    });
        //    $(".page-spinner-bar").addClass("hide");
        //    $scope.GetExistingDepartment();
        //}, function (error) {
        //    toastr.remove();
        //    toastr.error(((error !== null) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage, "error"));
        //});

    };


    $scope.CreateUpdateDepartment = CreateUpdateDepartment;
    function CreateUpdateDepartment() {
        $scope.EmployeeIDs = [];
        angular.forEach($scope.DepartmentDetails.departmentEmployees, function (employee) {
            $scope.EmployeeIDs.push({ "id": employee.id });
        });

        //Edit
        if (angular.isDefined($scope.DepartmentDetails.id) && $scope.DepartmentDetails.id != null) {
            var param = {
                "id": $scope.DepartmentDetails.id,
                "departmentId": $scope.DepartmentDetails.departmentId,
                "departmentName": $scope.DepartmentDetails.departmentName,
                "departmentEmailId": $scope.DepartmentDetails.departmentEmailId,
                "departmentDescription": $scope.DepartmentDetails.departmentDescription,
                "departmentHead": {
                    "id": $scope.DepartmentDetails.departmentHead.id
                },
                "status": true,
                "departmentEmployees": $scope.EmployeeIDs
            };

            //var UpdateDepartment = DepartmentsService.UpdateDepartment(param);
            //UpdateDepartment.then(function (success) {
            //    toastr.remove();
            //    toastr.success(success.data.message, "Confirmation");
            //    $scope.Cancel();
            //    $scope.GetDepartmentList();
            //}, function (error) {
            //    toastr.remove();
            //    toastr.error((error.data !== null) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage(), "error");
            //});
        }
            //Add
        else {

            var param = {
                "departmentId": $scope.DepartmentDetails.departmentId,
                "departmentName": $scope.DepartmentDetails.departmentName,
                "departmentEmailId": $scope.DepartmentDetails.departmentEmailId,
                "departmentDescription": $scope.DepartmentDetails.departmentDescription,
                "departmentHead": {
                    "id": $scope.DepartmentDetails.departmentHead.id
                },
                "status": true,
                "departmentEmployees": $scope.EmployeeIDs

            };
            //var AddDepartment = DepartmentsService.AddDepartments(param);
            //AddDepartment.then(function (success) {
            //    toastr.remove();
            //    toastr.success(success.data.message, "Confirmation");
            //    $scope.Cancel();
            //    $scope.GetDepartmentList();
            //}, function (error) {
            //    toastr.remove();
            //    toastr.error((error.data !== null) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage(), "error");
            //});
        }

    }
    $scope.GotoDashboard = function () {
        $location.url(sessionStorage.getItem('HomeScreen'));
    };

    $scope.AddNewDepartment = AddNewDepartment;
    function AddNewDepartment() {
        $scope.NewDepartment = true;
        $scope.DepartmentDetails = {};       
        $scope.DeptHeadList = [];
        angular.forEach($scope.OrigionalDeptHead, function (employee) {

            if (employee.departmentEmployee === false) {              
                $scope.DeptHeadList.push(employee);
            }
        });
        $scope.departmentEmpoyeeList = [];
        $scope.departmentHeadList = [];
        if (angular.isDefined($scope.EmployeeList) && $scope.EmployeeList.length > 0) {
            angular.forEach($scope.EmployeeList, function (value, key) {
                if (value.isVendorDepartmentEmployee != true && value.isVendorDepartmentHead != true && value.active == true) {
                    $scope.departmentEmpoyeeList.push(value);
                    $scope.departmentHeadList.push(value);
                }
            });
        }
                 
    };

    $scope.EditDepartment = EditDepartment;
    function EditDepartment(item) {
        $scope.NewDepartment = true;
        $scope.DeptHeadList = [];
        angular.forEach($scope.OrigionalDeptHead, function (employee) {

            if (employee.departmentEmployee === false) {
                $scope.DeptHeadList.push(employee);
            }
        });               
        $scope.GetDepartmentDetails(item);
        
       
    };

    $scope.GetExistingDepartment = GetExistingDepartment;
    function GetExistingDepartment() {
        angular.forEach($scope.OrigionalDeptHead, function (employee) {

            if (employee.id === $scope.DepartmentDetails.departmentHead.id) {
                $scope.DeptHeadList.push(employee);
            }
        });
    };

    $scope.Cancel = Cancel;
    function Cancel() {
        $scope.NewDepartment = false;
        $scope.DepartmentDetails = {};
        $scope.DepartmentForm.$setUntouched();
    };

    $scope.Deactivate = Deactivate;
    function Deactivate(item) {

    };

    $scope.SelectEmployeePopUp = SelectEmployeePopUp;
    function SelectEmployeePopUp() {       
        var EmpObj = {
            EmployeeList: []
        };
        //for Edit level
        if (angular.isDefined($scope.DepartmentDetails.id) && $scope.DepartmentDetails.id !== null) {

            angular.forEach($scope.departmentEmpoyeeList, function (employee) {
                employee.IsSelect = false;
            });
            angular.forEach($scope.DepartmentDetails.departmentEmployees, function (AddedEmployee) {
                angular.forEach($scope.departmentEmpoyeeList, function (employee) {
                    if (AddedEmployee.id == employee.id) {                       
                            employee.IsSelect = true;                               
                    }
                });              
            });
            EmpObj.EmployeeList = angular.copy($scope.departmentEmpoyeeList);
            //angular.forEach($scope.OrigionalAddedEmployee, function (Origionalemployee) {
            //    var count = 0;
            //    angular.forEach(EmpObj.EmployeeList, function (employee) {
            //        if (Origionalemployee.id == employee.id) {
            //            count++;
            //        }
            //    });
            //    if (count == 0) {
            //        Origionalemployee.IsSelect == false;
            //        EmpObj.EmployeeList.push(Origionalemployee);
            //    }
            //});
        }
        //For adding new
        else {
            if (angular.isDefined($scope.DepartmentDetails.departmentEmployees) && $scope.DepartmentDetails.departmentEmployees.length > 0)
            {
                angular.forEach($scope.departmentEmpoyeeList, function (employee) {
                        employee.IsSelect = false;                  
                });
                angular.forEach($scope.DepartmentDetails.departmentEmployees, function (deptEmp) {
                    angular.forEach($scope.departmentEmpoyeeList, function (employee) {
                        if(deptEmp.id==employee.id)
                        {
                            employee.IsSelect = true;                           
                        }                                              
                    });
                    
                });
                EmpObj.EmployeeList = angular.copy($scope.EmployeeList);
            }
            else {
                angular.forEach($scope.departmentEmpoyeeList, function (employee) {
                    if (employee.active == true && employee.IsSelect !== true) {
                        employee.IsSelect = false;
                        EmpObj.EmployeeList.push(employee);
                    }
                });
            }
        }
        var out = $uibModal.open(
        {
            animation: $scope.animationsEnabled,
            templateUrl: "views/Administrator/SelectEmpPopUp.html",
            controller: "SelectEmpPopUpController",
            resolve:
            {
                EmpObj: function () {
                    EmpObj = EmpObj;
                    return EmpObj;
                   
                }
            }
        });
        out.result.then(function (value) {
            //Call Back Function success
            if (value) {
                 
                if (value != null && angular.isDefined(value))
                    $scope.DepartmentDetails.departmentEmployees = [];
                    $scope.DepartmentDetails.departmentEmployees = angular.copy(value)

            };


        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };
    };

    // Change status of job code
    $scope.EnableDisbale = EnableDisbale;
    function EnableDisbale(dept, flag) {
         
        var param =
           [{
               "id": dept.id,
               "status": flag
           }];
         
        //var UpdateDeptStatus = DepartmentsService.UpdateStatus(param);
        //UpdateDeptStatus.then(function (success) {          
        //    toastr.remove();
        //    toastr.success(success.data.message, "Confirmation");
        //    $scope.GetDepartmentList();
        //}, function (error) {
        //    toastr.remove();
        //    toastr.error(((error !== null) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage, "error"));
        //});

    }

    //change status of employee
    $scope.enableDisableEmployee = enableDisableEmployee;
    function enableDisableEmployee(emp) {
        var msg = "";
        if (emp.isActive) {
            msg = "Are you sure want to Disable Employee <b>" + emp.lastName + " " + emp.firstName + "</b>";
        }
        else {
            msg = "Are you sure want to Enable Employee <b>" + emp.lastName + " " + emp.firstName + "</b>";
        }
        bootbox.confirm({
            size: "",
            title: "Enable/Disable Employee",
            message: msg, closeButton: false,
            className: "modalcustom", buttons: {
                confirm: {
                    label: "Yes",
                    className: 'btn-success'
                },
                cancel: {
                    label: "No", //$translate.instant('ClaimDetails_Delete.BtnNo'),
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                if (result) {
                    if (angular.isDefined(emp) && emp !== null) {
                        var param = {
                            "userId": emp.id
                        }
                        //var udateEmployeeStatus = DepartmentsService.UpdateStatusEmployee(param);
                        //udateEmployeeStatus.then(function (success) {
                        //    toastr.remove();
                        //    toastr.success(success.data.message, "Confirmation");
                        //    $scope.GetDepartmentDetails($scope.DepartmentDetails);
                        //}, function (error) {
                        //    toastr.remove();
                        //    toastr.error(((error !== null) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage, "error"));
                        //})
                    };
                }
            }
        });
       
    }
});