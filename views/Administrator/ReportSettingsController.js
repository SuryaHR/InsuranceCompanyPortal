angular.module('MetronicApp').controller('ReportSettingsController', function ($rootScope, $scope,
     $translate, $translatePartialLoader, AuthHeaderService, ReportSettingsService) {
     //set language
     $translatePartialLoader.addPart('ReportSettings');
     $translate.refresh();
     $scope.reportSettings = [];
     $scope.SettingsForm = {};
     function init() {
          //Get Report Settings
          $(".page-spinner-bar").removeClass("hide");
          var reportSettings = ReportSettingsService.getReportSettings();
          reportSettings.then(function (success) {
               $scope.reportSettings = success.data.data;
               $(".page-spinner-bar").addClass("hide");
          },
               function (error) {
                    if (error.status === 500 || error.status === 404) {
                         toastr.remove();
                         toastr.success(AuthHeaderService.genericErrorMessage(), "Error");
                    }
                    else {
                         toastr.remove();
                         toastr.error(error.data.errorMessage, "Error");
                    }
                    $(".page-spinner-bar").addClass("hide");
               });
     }
     init();

     //Set default values if resetTodefault
     $scope.resetToDefault = resetToDefault;
     function resetToDefault() {
          $(".page-spinner-bar").removeClass("hide");
          var reportSettings = ReportSettingsService.resetToDefault();
          reportSettings.then(function (success) {
               $scope.reportSettings = success.data.data;
               toastr.remove();
               toastr.success(success.data.message, "Success");
               $(".page-spinner-bar").addClass("hide");
          },
               function (error) {
                    if (error.status === 500 || error.status === 404) {
                         toastr.remove();
                         toastr.success(AuthHeaderService.genericErrorMessage(), "Error");
                    }
                    else {
                         toastr.remove();
                         toastr.error(error.errorMessage, "Error");
                    }
                    $(".page-spinner-bar").addClass("hide");
               });
     }

     $scope.updateSettings = updateSettings;
     function updateSettings() {
          $(".page-spinner-bar").removeClass("hide");
          var param = [];
          angular.forEach($scope.reportSettings, function (setting) {
               if (setting.isUpdated) {
                    param.push(setting);
               }
          });
          var promiseUpdate = ReportSettingsService.updateReportSettings(param);
          promiseUpdate.then(function (success) {
               var res = success.data ? success.data : null;
               if (res) {
                    angular.forEach(res.data, function (updatedSetting) {
                         var index = $scope.reportSettings.findIndex(r => r.role.id === updatedSetting.role.id);
                         if (index > -1)
                              $scope.reportSettings[index] = updatedSetting;
                    });
                    toastr.remove();
                    toastr.success(res.message, "Success");
                    $(".page-spinner-bar").addClass("hide");
               }
          }, function (error) {
               toastr.remove();
               toastr.error(error.data.errorMessage, "Error");
               $(".page-spinner-bar").addClass("hide");
          });
     }
});