angular.module('MetronicApp').controller('EnvironmentClaimFormController', function ($rootScope, $scope, $location, $translate, $translatePartialLoader,
    ClaimFormService, AuthHeaderService) {

    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('ClaimForm');
    $translate.refresh();
    $scope.ErrorMessage = "";
    $scope.pagesize = $rootScope.settings.pagesize;
    $scope.AddClaimFromsShow;
    $scope.ClaimFormListView;
    $scope.ClaimFormsList = [];
    $scope.policyTypeList = [{ "name": "HOME", "id": "HOME" }, { "name": "AUTO", "id": "AUTO" }]
    $scope.ObjClaimForm = {
        "taskId": null,
        "taskName": null,
        "attributeRequired": null,
        "policyType": null,
        "description": null
    }
    $scope.columnList = [{ column: '', type: '' }];
    function init() {
        $scope.Show = false;
        $scope.AddClaimFromsShow = false;
        $scope.ClaimFormListView = true;
        $scope.ClaimFormsList = [];
        $scope.ClaimFormsHome = []; $scope.ClaimFormsAuto = [];
        getFormLists();
    }
    init();
    function getFormLists()
    {
        //get claim form for auto
        GetClaimForm = ClaimFormService.getClaimFormAuto();
        GetClaimForm.then(function (success) {
            $scope.ClaimFormsAuto = success.data.data;
            angular.forEach($scope.ClaimFormsAuto, function (item) { item.PolicyType = "AUTO"; });
            $scope.ClaimFormsList = $scope.ClaimFormsHome.concat($scope.ClaimFormsAuto)
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
        //get claim form for home
        GetClaimForm = ClaimFormService.getClaimFormHome();
        GetClaimForm.then(function (success) {
            $scope.ClaimFormsHome = success.data.data;
            angular.forEach($scope.ClaimFormsHome, function (item) { item.PolicyType = "HOME"; });
            $scope.ClaimFormsList = $scope.ClaimFormsHome.concat($scope.ClaimFormsAuto)
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }
    $scope.Remove = function (index) {
        $scope.columnList.splice(index, 1)
    };
    $scope.AddColumn = function () {
        $scope.columnList.push({ column: '', type: '' });
    }

    $scope.AddClaimForms = AddClaimForms;
    function AddClaimForms() {
        $scope.AddClaimFromsShow = true;
        $scope.ClaimFormListView = false;
    }
    $scope.closeSuccess = closeSuccess
    function closeSuccess() {
        $scope.Show = false;
    }
    $scope.Edit = Edit;
    function Edit(item) {
        $scope.ObjClaimForm = {
            "taskId": item.taskId,
            "taskName": item.taskName,
            "attributeRequired": item.attributeRequired,
            "policyType": item.PolicyType,
            "description": item.comment
        }
        $scope.AddClaimFromsShow = true;
        $scope.ClaimFormListView = false;
    }

    $scope.BtnBackClick = BtnBackClick;
    function BtnBackClick() {
        $scope.ObjClaimForm = {
            "taskId": null,
            "taskName": null,
            "attributeRequired": null,
            "policyType": null,
            "description": null
        };
        $scope.AddClaimFromsShow = false;
        $scope.ClaimFormListView = true;
    }

    $scope.Save = Save;
    function Save() {
        var TaskParam;
        if (angular.isDefined($scope.ObjClaimForm.taskId) && $scope.ObjClaimForm.taskId !== null) {
            TaskParam = {
                "taskId": $scope.ObjClaimForm.taskId,
                "taskName": $scope.ObjClaimForm.taskName,
                "attributeRequired": $scope.ObjClaimForm.attributeRequired,
                "polcyType": $scope.ObjClaimForm.policyType,
                "comment": $scope.ObjClaimForm.description
            };
            
        }
        else {
            TaskParam = {
                "taskName": $scope.ObjClaimForm.taskName,
                "attributeRequired": $scope.ObjClaimForm.attributeRequired,
                "polcyType": $scope.ObjClaimForm.policyType,
                "comment": $scope.ObjClaimForm.description
            };
        }
        var SaveFrom = ClaimFormService.SaveClaimForm(TaskParam);
        SaveFrom.then(function () {       
            getFormLists();
            toastr.remove()
            toastr.success(success.data.message, "Confirmation");
            $scope.BtnBackClick();
        }, function (error) {
            toastr.remove()
            if (angular.isDefined(error.data) && error.data!==null)
                toastr.error(error.data.errorMessage, "Error");
            else
                toastr.error("Failed to save the new form. Please try again..", "Error");
        });
    }

    $scope.closeAlert = function () {
        $scope.Show = false;
    };

    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }  
    //Delete claim form
    $scope.Delete = Delete;
    function Delete(item, index) {
        bootbox.confirm({
            size: "",
            title: $translate.instant('Delete'),
            message: $translate.instant('Are you sure to delete claim form?'), closeButton: false,
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
                    var TaskIdParam = {
                        "taskId": item.taskId
                    };
                    var DeleteFrom = ClaimFormService.DeleteClaimForm(TaskIdParam);
                    DeleteFrom.then(function () {
                        $scope.ClaimFormsList.splice(index, 1);
                        toastr.remove()
                        toastr.success(success.data.message, "Confirmation");
                    }, function (error) {
                        toastr.remove()
                        if (angular.isDefined(error.data) && error.data !== null)
                            toastr.error(error.data.errorMessage, "Error");
                        else
                            toastr.error("Failed to delete the form. Please try again..", "Error");
                    });
                }
            }
        });
    };
    $scope.GotoDashboard=function()
    {
        $location.url(sessionStorage.getItem('HomeScreen'));
    }   
});