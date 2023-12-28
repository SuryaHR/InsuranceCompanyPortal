angular.module('MetronicApp').controller('PolicyholderPortalSettingsController', function ($scope,
       $translate, $translatePartialLoader, EnvironmentSettingsService, AuthHeaderService) {
        //set language
        $translatePartialLoader.addPart('ReportSettings');
        $translate.refresh();
        $scope.resetValues = [];
        $scope.SettingsForm = {};
        function init() {
            getPolicyholderPortalSettingsService();
        }
        init();
   
        $scope.getPolicyholderPortalSettingsService = getPolicyholderPortalSettingsService;
        function getPolicyholderPortalSettingsService() {
       
        var getPolicyholderPortalSettings = EnvironmentSettingsService.getPolicyholderPortalSettingsService();
        getPolicyholderPortalSettings.then(function (success) {
            $scope.PolicyholderPortalSettingsList = success.data.PolicyHolderPreferencesDetails;
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

    $scope.reset = reset;
    function reset() {
        angular.forEach($scope.PolicyholderPortalSettingsList, function (list) {
            list.status = 1;
            resetToDefault();
    });
    }

        //Set default values if resetTodefault
        $scope.resetToDefault = resetToDefault;
        function resetToDefault() {
             $(".page-spinner-bar").removeClass("hide");
             var param = $scope.PolicyholderPortalSettingsList;
             var promiseReset = EnvironmentSettingsService.resetToDefault(param);
             promiseReset.then(function (success) {
                  $scope.resetValues = success.data.data;
                  toastr.remove();
                  toastr.success(success.data.success);
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
             var param = $scope.PolicyholderPortalSettingsList;
            
             var promiseUpdate = EnvironmentSettingsService.updateReportSettings(param);
             promiseUpdate.then(function (success) {
                  $scope.updatedList =success.data;
                  toastr.remove();
                  toastr.success(success.data.success);
                  $(".page-spinner-bar").addClass("hide");
             }, function (error) {
                  toastr.remove();
                  toastr.error(error.data.errorMessage, "Error");
                  $(".page-spinner-bar").addClass("hide");
             });
        }
        
        $scope.toggleSwitch = toggleSwitch;
        function toggleSwitch(id){
            angular.forEach($scope.PolicyholderPortalSettingsList, function (list) {
               if(id == list.id){
                if(list.status == 1){
                    list.status = 0;
                }else{
                    list.status = 1;
                }
               }
            });
            
        }
        
   });