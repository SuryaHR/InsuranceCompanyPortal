angular.module('MetronicApp').controller('ContentServiceController', function ($rootScope, $log, $scope,
    settings, $http, $timeout, $location, $translate, $translatePartialLoader, EnvironmentSettingsService, AuthHeaderService) {

    //set language
    $translatePartialLoader.addPart('Services');
    $translate.refresh();
    $scope.showNewCatalog = false;
    $scope.IsEdit = null;
    $scope.IsMinimunServiceCost=true;
    $scope.ContentService = {}; //{ id: "", service: "", description: "", isminimumServiceFee: true, serviceCharge:null}
    $scope.NewService = NewService
    function NewService() {
        $scope.showNewService = true;
        $scope.IsEdit =false;
    }

    $scope.SaveService = SaveService
    function SaveService() {
    }
    $scope.Cancel = Cancel;
    function Cancel() {
        $scope.ContentService = {};
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
        getContentService();
    };

    $scope.sort = function (key) {
        $scope.sortKey = key;
        $scope.reverse = !$scope.reverse;
    };
    $scope.getContentService = getContentService;
    function getContentService() {
       
        var getServiceRequestCategory = EnvironmentSettingsService.GetContentService();
        getServiceRequestCategory.then(function (success) {
            $scope.ContentServiceList = success.data.data;
            
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

    $scope.MinimumServiceFee=function(value)
    {
        $scope.IsMinimunServiceCost=value;
    }
    // Add / Update Content Service
    $scope.AddUpdateContentService = function () {
        
        if ($scope.IsEdit == false) {
            var param = {
                "service":$scope.ContentService.service,
                "description":$scope.ContentService.description ,
                "isminimumServiceFee": $scope.ContentService.isminimumServiceFee,
                "isDefault": false
            };
            var AddContentService = EnvironmentSettingsService.AddContentService(param);
            AddContentService.then(function (success) {
                $scope.status = success.data.status;
                if ($scope.status == 200) {
                    toastr.remove();
                    toastr.success(success.data.message, "Confirmation");
                    $scope.getContentService();
                    $scope.Cancel();
                }
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });
        }
        else if ($scope.IsEdit == true) {
            var param = {
                "id": $scope.ContentService.id,
                "service": $scope.ContentService.service,
                "description": $scope.ContentService.description,
                "isminimumServiceFee": $scope.ContentService.isminimumServiceFee,
                "isDefault": false
            };

            var UpdateContentService = EnvironmentSettingsService.UpdateContentService(param);
            UpdateContentService.then(function (success) {
                $scope.status = success.data.status;
                if ($scope.status == 200) {
                    toastr.remove();
                    toastr.success(success.data.message, "Confirmation");
                    $scope.getContentService();
                    $scope.Cancel();
                }
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });
        }

    };

    $scope.EditContentService = EditContentService;
    function EditContentService(category) {
        
        $scope.IsEdit = true;
        $scope.showNewService = true;
        $scope.ContentService.id = category.id,
        $scope.ContentService.service=category.service;
        $scope.ContentService.description = category.description,
        $scope.ContentService.isminimumServiceFee = category.isminimumServiceFee;
            
    };

    $scope.DeleteContentService = DeleteContentService;
    function DeleteContentService(Service) {
        
        bootbox.confirm({
            size: "",
            title: $translate.instant('Remove Service Category'),
            message: $translate.instant("Are you sure you want to delete this 'Content Service' type?"), closeButton: false,
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
                        "id": Service.id
                    }; 
                   
                    var RemoveContentService = EnvironmentSettingsService.DeleteContentService(param);
                    RemoveContentService.then(function (success) {
                        
                        $scope.status = success.data.status;
                        if ($scope.status == 200) {
                            toastr.remove();
                            toastr.success(((success !== null) ? success.data.message : "Content Service  removed successfully."), "Confiramtion");
                            $scope.getContentService();
                        }

                    }, function (error) {
                        toastr.remove();
                        toastr.error(((error !== null) ? error.data.errorMessage : "Failed to remove the Content service."), "error");
                    });
                }
            }
        });
    };
});