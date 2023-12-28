angular.module('MetronicApp').controller('NewOfficeController', function ($rootScope, $filter, $scope, $http, $location, $translatePartialLoader, NewOfficeService,
    $translate, AuthHeaderService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('NewOffice');
    $translate.refresh();

    $scope.CommonObj =
        {
            BranchId: sessionStorage.getItem("BranchId"),
            IdEdit: sessionStorage.getItem("IsEditBranch"),
            ShowItem: "All",
            CompanyName: sessionStorage.getItem('CompanyName'),
            BranchName: sessionStorage.getItem('BranchName')
        };

    $scope.BranchDetails;
    $scope.EmployeeList;
    $scope.AllEmployees;//used for filteration
    $scope.RoleList = [];
    $scope.BranchMgnrList = [];
    $scope.SelectedBranch;
    $scope.SelectedMember = {};
    $scope.commonObj = { "RoleId": [] };
    $scope.CompanyName = sessionStorage.getItem("CompanyName")
    $scope.AddNewContact = false;
    $scope.EditContact = false;
    $scope.UserType = sessionStorage.getItem('RoleList');
    $scope.StatusList = [{ Id: true, Name: "Active" }, { Id: false, Name: "InActive" }]
    function init() {

        getBranchManagerList();
        var param =
             {
                 "isTaxRate": false,
                 "isTimeZone": true
             }
        var StateList = NewOfficeService.getStates(param);
        StateList.then(function (success) { $scope.ddlStateList = success.data.data; }, function (error) {
            if (error.status === 500 || error.status === 404) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
            else {
                toastr.remove();
                toastr.error(error.data, errorMessage, "Error");
            }
        });

        var GetRoleList = NewOfficeService.GetRoleList();
        GetRoleList.then(function (success) {
            $scope.RoleList = success.data.data;
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

        //get office details in edit mode
        if ($scope.CommonObj.IdEdit == "true") {

            getBranchDetails($scope.CommonObj.BranchId);

        };
    }
    init();
    $scope.GoBack = function () {
        $location.url('Company');
    };

    $scope.getBranchManagerList = getBranchManagerList;
    function getBranchManagerList() {
        var param =
          {    
            "companyId" : 1
          };
        var GetManagerlist = NewOfficeService.GetBranchManagerList(param);
        GetManagerlist.then(function (success) {
            $scope.BranchMgnrList = success.data.data.contactDTOs;           
        }, function (error) {
            if (error.status === 500 || error.status === 404) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
            else {
                toastr.remove();
                toastr.error(error.data, errorMessage, "Error");
            }
        });
    };
    $scope.getEmployees = getEmployees;
    function getEmployees(id) {
        var param =
           {
               "id": id
           };
        var GetEmployeelist = NewOfficeService.GetEmployeelist(param);
        GetEmployeelist.then(function (success) {
            $scope.EmployeeList = success.data.data;
            $scope.AllEmployees = success.data.data;
             
        }, function (error) {
            if (error.status === 500 || error.status === 404) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
            else {
                toastr.remove();
                toastr.error(error.data, errorMessage, "Error");
            }
        });
    };

    $scope.getBranchDetails = getBranchDetails;
    function getBranchDetails(id) {

        var param =
           {
               "id": id
           };

        var StateList = NewOfficeService.GetBranchDetails(param);
        StateList.then(function (success) {
            $scope.BranchDetails = success.data.data;           
            $scope.BindData();
            $scope.getEmployees($scope.BranchDetails.branchId);
        }, function (error) {
            if (error.status === 500 || error.status === 404) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            };
        });
    }
    $scope.EditOfficebtn = false;

    $scope.EditOffice = EditOffice;
    function EditOffice() {
        $scope.EditOfficebtn = true;


    };
    $scope.SaveBranchDetails = SaveBranchDetails;
    function SaveBranchDetails() {
        var employeeList = [];
        angular.forEach($scope.EmployeeList, function (employee) {

            employeeList.push(employee)
        });

        if ($scope.SelectedBranch.Id !== null && angular.isDefined($scope.SelectedBranch.Id)) {
            $scope.EditOfficebtn = false;

            var param = {
                "id": sessionStorage.getItem("CompanyId"),
                "branchId": $scope.BranchDetails.branchId,
                "branchCode": $scope.SelectedBranch.OfficeCode,
                "companyName": $scope.SelectedBranch.OfficeName,
                "companyPhoneNumber": $scope.SelectedBranch.PhoneNo.replace(/[^0-9]/g, ''),
                "fax": $scope.SelectedBranch.Fax.replace(/[^0-9]/g, ''),
                "active": $scope.SelectedBranch.Active,
                "defaultTimeZone": $scope.SelectedBranch.DefaultTimeZone,
                "invoiceForwardingEmail":$scope.SelectedBranch.invoiceForwardingEmail,
                "adminDetails":
                    {
                        "id": $scope.SelectedBranch.BranchManager
                    },
                "employeeDetails": null,
                "companyAddress": {
                    "id": $scope.SelectedBranch.CompanyAddressId,
                    "city": $scope.SelectedBranch.City,
                    "state": {
                        "id": $scope.SelectedBranch.State
                    },
                    "streetAddressOne": $scope.SelectedBranch.StreetAddressOne,
                    "streetAddressTwo": $scope.SelectedBranch.StreetAddressTwo,
                    "zipcode": $scope.SelectedBranch.Zip
                }
            }

            //Edit Company Details
            var UpdateCompany = NewOfficeService.UpdateCompany(param);
            UpdateCompany.then(function (success) {
                $scope.getBranchDetails($scope.CommonObj.BranchId);
                toastr.remove();
                toastr.success(success.data.message, $translate.instant("CommonConfirmationHeading"));
            }, function (error) {
                toastr.remove()
                toastr.error(error.data.errorMessage, $translate.instant("ErrorMessageHeading"));
            });

        }
        else {

            var param = {
                "id": sessionStorage.getItem("CompanyId"),
                "branchCode": $scope.SelectedBranch.OfficeCode,
                "companyName": $scope.SelectedBranch.OfficeName,
                "companyPhoneNumber": $scope.SelectedBranch.PhoneNo,
                "fax": $scope.SelectedBranch.Fax,
                "active": true,
                "defaultTimeZone": $scope.SelectedBranch.DefaultTimeZone,
                "invoiceForwardingEmail":$scope.SelectedBranch.invoiceForwardingEmail,
                "adminDetails": {
                    "id": $scope.SelectedBranch.BranchManager
                },
                "employeeDetails": null,
                "companyAddress": {
                    "city": $scope.SelectedBranch.City,
                    "state": {
                        "id": $scope.SelectedBranch.State
                    },
                    "streetAddressOne": $scope.SelectedBranch.StreetAddressOne,
                    "streetAddressTwo": $scope.SelectedBranch.StreetAddressTwo,
                    "zipcode": $scope.SelectedBranch.Zip
                }
            }


            //Edit Company Details
            var AddNewCompany = NewOfficeService.AddNewCompany(param);
            AddNewCompany.then(function (success) {

                $scope.getBranchDetails(success.data.data.branchId);
                toastr.remove();
                toastr.success(success.data.message, $translate.instant("CommonConfirmationHeading"));
            }, function (error) {
                toastr.remove()
                toastr.error(error.data.errorMessage, $translate.instant("ErrorMessageHeading"));
            });
        }
    };

    //$scope.back = back;
    //function back() {
    //    $location.url('Company');
    //};
    $scope.GoInsuranceComapny = function () {
        $location.url('InsuranceCompanies');
    };
    $scope.GoToHome = function () {
        $location.url(sessionStorage.getItem('HomeScreen'));
    };

    $scope.BindData = BindData;
    function BindData() {
        $scope.SelectedBranch = {};
        $scope.SelectedBranch.Id = $scope.BranchDetails.branchId;
        $scope.SelectedBranch.OfficeCode = $scope.BranchDetails.branchCode;
        $scope.SelectedBranch.OfficeName = $scope.BranchDetails.companyName;
        $scope.SelectedBranch.PhoneNo = $filter('tel')($scope.BranchDetails.companyPhoneNumber);
        $scope.SelectedBranch.DefaultTimeZone = $scope.BranchDetails.companyAddress.state.timeZone;
        $scope.SelectedBranch.StreetAddressOne = $scope.BranchDetails.companyAddress.streetAddressOne;
        $scope.SelectedBranch.StreetAddressTwo = $scope.BranchDetails.companyAddress.streetAddressTwo;
        $scope.SelectedBranch.City = $scope.BranchDetails.companyAddress.city;
        $scope.SelectedBranch.State = $scope.BranchDetails.companyAddress.state.id;
        $scope.SelectedBranch.Zip = $scope.BranchDetails.companyAddress.zipcode;
        $scope.SelectedBranch.Fax = $filter('tel')($scope.BranchDetails.fax);
        $scope.SelectedBranch.Active = $scope.BranchDetails.active;
        $scope.SelectedBranch.AdminDetails = $scope.BranchDetails.adminDetails;
        $scope.SelectedBranch.CompanyAddressId = $scope.BranchDetails.companyAddress.id;
        $scope.SelectedBranch.BranchManager = $scope.BranchDetails.adminDetails.id;
        $scope.SelectedBranch.invoiceForwardingEmail = $scope.BranchDetails.invoiceForwardingEmail
    };

    $scope.getTemplate = getTemplate;
    function getTemplate(item) {

        if (!angular.isUndefined(item)) {

            if (item.id === $scope.SelectedMember.id) return 'edit';
            else
                return 'display';
        }
        else
            return 'display';
    };


    $scope.editContact = editContact;
    function editContact(item) {
        sessionStorage.setItem("IsEdit", true)
        //sessionStorage.setItem("branchId",)
        sessionStorage.setItem("EmpDetails", JSON.stringify(item))
        $location.url('NewEmployee');
    };

    //Cancel Edit 
    $scope.CancelEdit = function (item) {
        $scope.AddNewContact = false;
        $scope.EditContact = false;
        $scope.commonObj.RoleId = [];
        $scope.SelectedMember = {};

    };
    //Add new Contact
    $scope.AddNewContacts = function () {



        //if ($scope.SelectedBranch!== null && angular.isDefined($scope.SelectedBranch))
        //{
        //    if ($scope.SelectedBranch.Id !== null && angular.isDefined($scope.SelectedBranch.Id))
        //    {
        //        $scope.commonObj.RoleId = [];
        //        $scope.SelectedMember = {};
        //        $scope.AddNewContact = true;
        //        $scope.EditContact = false;
        //          }
        //    else {
        //        toastr.remove()
        //        toastr.warning($translate.instant("WarningMessageAddEmployee"), $translate.instant("WarningHeading"));

        //    }
        //}
        //else {

        //    toastr.remove()
        //    toastr.warning($translate.instant("WarningMessageAddEmployee"), $translate.instant("WarningHeading"));
        //}


        if ($scope.SelectedBranch !== null && angular.isDefined($scope.SelectedBranch)) {
            if ($scope.SelectedBranch.Id !== null && angular.isDefined($scope.SelectedBranch.Id)) {
                sessionStorage.setItem("IsEdit", false);
                sessionStorage.setItem("CompanyName", $scope.CommonObj.CompanyName);
                sessionStorage.setItem("BranchName", $scope.CommonObj.BranchName);
                $location.url('NewEmployee');
            }
            else {
                sessionStorage.setItem("IsEdit", false);
                sessionStorage.setItem("BranchId", null);
                sessionStorage.setItem("CompanyName", $scope.CommonObj.CompanyName);
                sessionStorage.setItem("BranchName", "");
                $location.url('NewEmployee');
            }
        }
        else {
            sessionStorage.setItem("IsEdit", false);
            sessionStorage.setItem("BranchId", null);
            sessionStorage.setItem("CompanyName", $scope.CommonObj.CompanyName);
            sessionStorage.setItem("BranchName", null);
            $location.url('NewEmployee');
        }



    };
    //Cancel Add New Record
    $scope.CancelAddNewContacts = function () {
        $scope.AddNewContact = false;
        $scope.EditContact = false;
        $scope.SelectedMember = {};
        $scope.commonObj.RoleId = [];
    };

    $scope.saveContact = function (index, opr) {
        var rolelist = [];
        angular.forEach($scope.commonObj.RoleId, function (id) { rolelist.push({ "id": id }); });
        if (opr == "Save") {
            var param = {
                "id": $scope.BranchDetails.branchId,
                "employeeDetails": [
                  {
                      "email": $scope.SelectedMember.email,
                      "eveningTimePhone": $scope.SelectedMember.eveningTimePhone,
                      "firstName": $scope.SelectedMember.firstName,
                      "lastName": $scope.SelectedMember.lastName,
                      "isActive": $scope.SelectedMember.isActive,
                      "roles": rolelist
                  }
                ]

            };
            //Save New Employee
            var AddNewEmployee = NewOfficeService.AddNewEmployee(param);
            AddNewEmployee.then(function (success) {
                $scope.commonObj.RoleId = [];
                $scope.SelectedMember = {};
                $scope.AddNewContact = false;
                $scope.getEmployees($scope.BranchDetails.branchId);
                toastr.remove()
                toastr.success(success.data.message, $translate.instant("CommonConfirmationHeading"));
            }, function (error) {
                toastr.remove()
                toastr.error(error.data.errorMessage, $translate.instant("ErrorMessageHeading"));
            });
        }
        else if (opr == "Edit") {
            var NewRoleList = [];

            angular.forEach($scope.OrignialRoleListOfEmployee, function (original) {
                var count = 0;
                angular.forEach(rolelist, function (role) {

                    if (role.id === original.id)
                        count++;
                });
                if (count === 0) {
                    NewRoleList.push({
                        "id": original.id,
                        "isDelete": true
                    });
                }
            });
            angular.forEach(rolelist, function (item) {
                NewRoleList.push({
                    "id": item.id
                });
            });


            var param = {
                "id": $scope.BranchDetails.branchId,
                "employeeDetails": [
                  {
                      "id": $scope.SelectedMember.id,
                      "email": $scope.SelectedMember.email,
                      "eveningTimePhone": $scope.SelectedMember.eveningTimePhone,
                      "firstName": $scope.SelectedMember.firstName,
                      "lastName": $scope.SelectedMember.lastName,
                      "isActive": $scope.SelectedMember.isActive,
                      "roles": NewRoleList
                  }
                ]
            };
            //Edit employee
            var EditEmployee = NewOfficeService.EditEmployee(param);
            EditEmployee.then(function (success) {

                $scope.SelectedMember = {};
                $scope.AddNewContact = false;
                $scope.EditContact = true;
                $scope.getEmployees($scope.BranchDetails.branchId);
                toastr.remove()
                toastr.success(success.data.message, $translate.instant("CommonConfirmationHeading"));
            }, function (error) {
                toastr.remove()
                toastr.error(error.data.errorMessage, $translate.instant("ErrorMessageHeading"));
            });
        }
        $scope.commonObj.RoleId = [];
    };

    $scope.DeleteContact = function (item) {

        var param =
        {
            "id": $scope.BranchDetails.branchId,
            "employeeDetails": [
              {
                  "id": item.id
              }
            ]
        }
        bootbox.confirm({
            size: "",
            title: $translate.instant('ConfirmTitle'),
            message: $translate.instant('ConfirmMessage'), closeButton: false,
            className: "modalcustom", buttons: {
                confirm: {
                    label: $translate.instant('BtnYes'),
                    className: 'btn-success'
                },
                cancel: {
                    label: $translate.instant('BtnNo'),
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                if (result) {
                    var DeleteEmployee = NewOfficeService.DeleteEmployee(param);
                    DeleteEmployee.then(function (success) {
                        $scope.getEmployees($scope.BranchDetails.branchId);
                        toastr.remove();
                        toastr.success(success.data.message, $translate.instant("CommonConfirmationHeading"));
                    }, function (error) {
                        toastr.remove();
                        toastr.error(error.data.errorMessage, $translate.instant("ErrorMessageHeading"));
                    });
                }
            }
        });
    }

    $scope.getRoleName = function (Id) {
        var list = $filter('filter')($scope.RoleList, { id: Id });

        return list[0].name;

    };

    $scope.FilterRecord = FilterRecord;
    function FilterRecord() {
        if ($scope.CommonObj.ShowItem == "All") {
            $scope.EmployeeList = $scope.AllEmployees;
        }
        else {
            var filteredList = $filter('filter')($scope.AllEmployees, { isActive: $scope.CommonObj.ShowItem })

            $scope.EmployeeList = filteredList;
        }
    }
    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

    $scope.UploadEmployees = function () {
        $location.url('UserDetailsUpload');
    }
    //Set Default time zone
    $scope.SetTimeZone = function () {
        angular.forEach($scope.ddlStateList, function (item) {
            if (item.id == $scope.SelectedBranch.State) {
                $scope.SelectedBranch.DefaultTimeZone = item.timeZone;
            }
        });

    }

});
