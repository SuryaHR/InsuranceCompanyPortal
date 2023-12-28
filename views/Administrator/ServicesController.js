angular.module('MetronicApp').controller('ServicesController', function ($rootScope, $log, $scope,
    settings, $http, $timeout, $location, $translate, $translatePartialLoader, EnvironmentSettingsService, AuthHeaderService) {

    //set language
    $translatePartialLoader.addPart('Services');
    $translate.refresh();
    $scope.IsEdit = null;
    $scope.showNewCatalog = false;
    $scope.ServiceCategoryList;
    $scope.ServiceCategory = {id:"",name:""};
    $scope.NewService = NewService
    function NewService() {
        $scope.showNewService = true;
        $scope.IsEdit = false;
    }

    $scope.SaveService = SaveService
    function SaveService() {
    }
    $scope.Cancel = Cancel
    function Cancel() {
        $scope.ServiceCategory = {};
        $scope.showNewService = false;
    };

    $scope.GoToHome = function () {
        $location.url(sessionStorage.getItem('HomeScreen'));
    };

    $scope.sort = function (key) {
        $scope.sortKey = key;
        $scope.reverse = !$scope.reverse;
    };
    function init() {
        getServiceCategory();
    };

    $scope.getServiceCategory =getServiceCategory;
    function getServiceCategory()
    {
        var param = { "id": sessionStorage.getItem("CompanyId") };
         
        var getServiceRequestCategory = EnvironmentSettingsService.GetServiceRequestCategories(param);
        getServiceRequestCategory.then(function (success) {
            $scope.ServiceCategoryList = success.data.data;
            
        }, function (error) {
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
    }
    init();
    $scope.AddNewCategory = function () {
       
        if ($scope.IsEdit == false)
        {
            var param = {
                "companyDetails": {
                    "id": sessionStorage.getItem("CompanyId")
                },
                "serviceRequestCategories": [
                 {

                     "name": $scope.ServiceCategory.name,
                     "description": $scope.ServiceCategory.description
                 }]

            };

            var getServiceRequestCategory = EnvironmentSettingsService.AddServiceRequestCategories(param);
            getServiceRequestCategory.then(function (success) {
                
                $scope.status = success.data.status;
                if ($scope.status == 200) {
                    toastr.remove();
                    toastr.success(success.data.message, "Confirmation");
                    $scope.getServiceCategory();
                    $scope.Cancel();
                }
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });
        }
        else if ($scope.IsEdit ==true)
        {
            var param = {
                "companyDetails": {
                    "id": sessionStorage.getItem("CompanyId")
                },
                "serviceRequestCategories": [
                 {
                     "id": $scope.ServiceCategory.id,
                     "name": $scope.ServiceCategory.name,
                     "description": $scope.ServiceCategory.description
                 }]
            };

            var UpdateServiceRequestCategory = EnvironmentSettingsService.UpdateServiceRequestCategories(param);
            UpdateServiceRequestCategory.then(function (success) {
                $scope.status = success.data.status;
                if ($scope.status == 200) {
                    toastr.remove();
                    toastr.success(success.data.message, "Confirmation");
                    $scope.getServiceCategory();
                    $scope.Cancel();
                }
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });
        }
       
    };

    $scope.EditServiceCategory = EditServiceCategory;
    function EditServiceCategory(category)
    {
        $scope.IsEdit = true;
        $scope.showNewService = true;
        $scope.ServiceCategory.id = category.id;
        $scope.ServiceCategory.name = category.name;
        $scope.ServiceCategory.description = category.description;
    };
   
    $scope.DeleteService = DeleteService;
    function DeleteService(category) {
        
        bootbox.confirm({
            size: "",
            title: $translate.instant('Remove Service Category'),
            message: $translate.instant('Are you sure you want to make this category un-available?'), closeButton: false,
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
                    var param = {
                        "companyDetails": {
                            "id": sessionStorage.getItem("CompanyId")
                        },
                        "serviceRequestCategories": [
                         {
                             "id": category.id

                         }]
                    };
                    
                    var RemoveServiceRequestCategory = EnvironmentSettingsService.DeleteServiceRequestCategories(param);
                    RemoveServiceRequestCategory.then(function (success) {
                        
                        $scope.status = success.data.status;
                        if ($scope.status == 200) {
                            toastr.remove();
                            toastr.success(((success !== null) ? success.data.message : "Service request removed successfully."), "Confiramtion");
                            $scope.getServiceCategory();
                        }
                        
                    }, function (error) {
                        toastr.remove();
                        toastr.error(((error !== null) ? error.data.errorMessage : "Failed to remove the service request."), "error");
                    });
                }
            }
        });
    };
});