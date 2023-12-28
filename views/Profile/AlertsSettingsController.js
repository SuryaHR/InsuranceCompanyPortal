angular.module('MetronicApp').controller('AlertsSettingsController', function ($translate, $translatePartialLoader, $scope, $rootScope, $state, settings,
    $location, $filter, MyProfileService, AuthHeaderService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $scope.PageSize = $rootScope.settings.pagesize;
    $translatePartialLoader.addPart('MyProfile');
    $translate.refresh();

    $scope.UserAlertCategory = [];
    $scope.UserSettingAlert = [];
    $scope.CategoryModel = [];
    $scope.AlertCategory;
   
    function init() {
        GetUserAlertSettingCategory();
      
    };
    init()
    $scope.previousCatName;
    $scope.catName = function (Category)
    {
         
        if ($scope.previousCatName !== Category.alertCategory)
        {
            $scope.previousCatName = Category.alertCategory;
            Category.ShowCatName = true;
        }
        else {
            $scope.previousCatName ="";
            Category.ShowCatName = false;
        }
      

    }
    //Get category
    $scope.GetUserAlertSettingCategory = GetUserAlertSettingCategory;
    function GetUserAlertSettingCategory() {

        var GetAlert = MyProfileService.GetUserSettingAlertCategory();
        GetAlert.then(function (success) {
            $scope.UserAlertCategory = success.data.data;        

            angular.forEach($scope.UserAlertCategory, function (category) {
              
                category.dashboardAlert = false;
                category.emailAlert = false;
            })

            GetUserSettingsAlert();

        }, function (error) {
            toastr.remove()
            if (angular.isDefined(error.data.errorMessage)) {
                toastr.error(error.data.errorMessage, "Error");
            }
            else
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
        });
    };
    //Get Settings
    $scope.GetUserSettingsAlert = GetUserSettingsAlert;
    function GetUserSettingsAlert() {

        var param = {
            "contact": {
                "id": sessionStorage.getItem("UserId")
            }
        };

        var GetAlert = MyProfileService.GetUserSettingAlert(param);
        GetAlert.then(function (success) {
            $scope.UserSettingAlert = success.data.data;
            $scope.SetValues();
        }, function (error) {
            toastr.remove()
            if (angular.isDefined(error.data.errorMessage)) {
                toastr.error(error.data.errorMessage, "Error");
            }
            else
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
        });
    };


    $scope.SetValues = SetValues;
    function SetValues()
    {
        angular.forEach($scope.UserSettingAlert.userAlertsSetting, function (settings) {
            angular.forEach($scope.UserAlertCategory, function (category) {

                if (settings.settingAlert.id == category.id)
                {
                  category.dashboardAlert=settings.dashboardAlert,
                 category.emailAlert=settings.emailAlert
                }                    
                    
                });
            });
        
    }

    $scope.SaveUserSettingsAlert = SaveUserSettingsAlert;
    function SaveUserSettingsAlert() {
        var Settings = [];
        angular.forEach($scope.UserAlertCategory, function (category) {           
            Settings.push({
                "dashboardAlert":category.dashboardAlert ,
                "emailAlert": category.emailAlert,
                "settingAlert": {
                    "id":category.id
                }
            });
        })
       
        var param = {
            "contact": {
                "id": sessionStorage.getItem("UserId")
            },
            "userAlertsSetting": Settings
        };

        var GetAlert = MyProfileService.AddUserSettingAlert(param);
        GetAlert.then(function (success) {
            toastr.remove()
            toastr.success(success.data.message, "Confirmation");
            $scope.GetUserSettingsAlert();
        }, function (error) {
            toastr.remove()
            if (angular.isDefined(error.data.errorMessage)) {
                toastr.error(error.data.errorMessage, "Error");
            }
            else
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
        });
    };

    $scope.GoToHome = GoToHome;
    function GoToHome()
    {
        $location.url(sessionStorage.getItem('HomeScreen'));
    }
   
});