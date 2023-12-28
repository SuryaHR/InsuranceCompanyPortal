angular.module('MetronicApp').controller('EnvironmentEmailTempalteController', function ($rootScope, $scope, settings, $http, $uibModal,
    $timeout, $location, $translate, $translatePartialLoader, EnvironmentSettingsService, AuthHeaderService) {

    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('EmailTempalte');
    $translate.refresh();
    $scope.ErrorMessage = "";
    $scope.pagesize = $rootScope.settings.pagesize;
    $scope.AddEmailTempShow;
    $scope.EmailTempleteListView;
    $scope.EmailTemplateList = [];
    $scope.init = init;
    $scope.Show = false;
    $scope.ShowSuccess = false;
    $scope.columnList = [{ column: '', type: '' }];
    function init() {
        $scope.AddEmailTempShow = false;
        $scope.EmailTempleteListView = true;
        $scope.EmailTemplateList = [];
        $scope.EmailTemplate = {};
        GetEmailTemplates();
    };
    $scope.init();
    $scope.GetEmailTemplates = GetEmailTemplates;
    function GetEmailTemplates() {
        var getEmailTemplateList = EnvironmentSettingsService.GetEmailTemplatesList()
        getEmailTemplateList.then(function (success) {
            $scope.EmailTemplateList = success.data.data;
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

    //Create Template
    $scope.AddUpdateEmailTemplate = CreateEmailTemplate;
    function CreateEmailTemplate() {

        if (angular.isDefined($scope.EmailTemplate.id) && $scope.EmailTemplate.id !== null) {
            var param = {
                "id": $scope.EmailTemplate.id,
                "shortDescription": $scope.EmailTemplate.shortDescription,
                "templateBody": $scope.EmailTemplate.templateBody,
                "templateSubject": $scope.EmailTemplate.templateBody,
                "templateTitle": $scope.EmailTemplate.templateTitle
            };

            var Update = EnvironmentSettingsService.UpdateEmailTemplate(param)
            Update.then(function (success) {
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");
                $scope.GetEmailTemplates();
                $scope.AddEmailTempShow = false;
                $scope.EmailTempleteListView = true;
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
        else {

            var param = {
                "shortDescription": $scope.EmailTemplate.shortDescription,
                "templateBody": $scope.EmailTemplate.templateBody,
                "templateSubject": $scope.EmailTemplate.templateBody,
                "templateTitle": $scope.EmailTemplate.templateTitle
            };

            var Add = EnvironmentSettingsService.AddEmailTemplate(param)
            Add.then(function (success) {
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");
                $scope.GetEmailTemplates();
                $scope.AddEmailTempShow = false;
                $scope.EmailTempleteListView = true;
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

    };

    $scope.DeleteTemplate = function (item) {
        bootbox.confirm({
            size: "",
            title: $translate.instant('HeaderText.EmailTemplete'),
            message: $translate.instant('Message'), closeButton: false,
            className: "modalcustom", buttons: {
                confirm: {
                    label: $translate.instant('ControlText.BtnYes'),
                    className: 'btn-success'
                },
                cancel: {
                    label: $translate.instant('ControlText.BtnNo'),
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                if (result) {

                    var param = {
                        "id": item.id
                    };

                    var Delete = EnvironmentSettingsService.DeleteEmailTemplate(param)
                    Delete.then(function (success) {
                        toastr.remove();
                        toastr.success(success.data.message, "Confirmation");
                        $scope.GetEmailTemplates();
                        $scope.AddEmailTempShow = false;
                        $scope.EmailTempleteListView = true;
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
        });
    }

    $scope.AddNewEmailTempalte = AddNewEmailTempalte;
    function AddNewEmailTempalte() {
        $scope.AddEmailTempShow = true;
        $scope.EmailTempleteListView = false;
        $scope.EmailTemplate = {};
    }
    $scope.Edit = Edit;
    function Edit(item) {
        $scope.AddEmailTempShow = true;
        $scope.EmailTempleteListView = false;
        var param = {
            "id": item.id
        };
        var GetEmail = EnvironmentSettingsService.GetEmailTemplatesDetails(param);
        GetEmail.then(function (success) {
            $scope.EmailTemplate = success.data.data;
        }, function (error) {

        });
    }

    $scope.BtnBackClick = BtnBackClick;
    function BtnBackClick() {
        $scope.AddEmailTempShow = false;
        $scope.EmailTempleteListView = true;
    }

    $scope.Save = Save;
    function Save() {
        $scope.Show = true;
    }

    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

    $scope.closeSuccess = function () {
        $scope.Show = false;
    };
});