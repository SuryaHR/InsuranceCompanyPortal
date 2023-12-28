angular.module('MetronicApp').controller('SecurityController', function ($rootScope, $scope, $filter, $uibModal, $location, $translate,
    $translatePartialLoader, UserAdminstrationService, AuthHeaderService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    //set language
    $translatePartialLoader.addPart('CompanyAdminstration');
    $translate.refresh();
    $scope.SecurityControls;
    $scope.RememberPasswordList = [{ "id": true, "value": "YES" }, { "id": false, "value": "NO" }]
    function init() {
        var getCompanySecutiyControls = UserAdminstrationService.getCompanySecutiyControls();
        getCompanySecutiyControls.then(function (success) {
            $scope.SecurityControls = success.data.data;
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
        //min password length
        $scope.PasswordLengthList = [];
        var GetPasswordLengthList = UserAdminstrationService.GetPasswordLengthList();
        GetPasswordLengthList.then(function (success) { $scope.PasswordLengthList = success.data.data; }, function (error) {
            if (error.status === 500 || error.status === 404) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
            else {
                toastr.remove();
                toastr.error(error.data, errorMessage, "Error");
            }
        });
        //password complexity
        $scope.PasswordComplexity = [];
        var GetPasswordComplexityList = UserAdminstrationService.getPasswordComplexity();
        GetPasswordComplexityList.then(function (success) { $scope.PasswordComplexity = success.data.data; }, function (error) {
            if (error.status === 500 || error.status === 404) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
            else {
                toastr.remove();
                toastr.error(error.data, errorMessage, "Error");
            }
        });
        //session timeout 
        $scope.SessionTimeout = [];
        var GetSessionTimeoutList = UserAdminstrationService.GetSessionTimeoutList();
        GetSessionTimeoutList.then(function (success) { $scope.SessionTimeout = success.data.data; }, function (error) {
            if (error.status === 500 || error.status === 404) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
            else {
                toastr.remove();
                toastr.error(error.data, errorMessage, "Error");
            }
        });
        // LockOutThreshold
        $scope.LockOutThreshold = [];
        var GetLockOutThresholdList = UserAdminstrationService.GetLockOutThresholdList();
        GetLockOutThresholdList.then(function (success) {
             
            $scope.LockOutThreshold = success.data.data;
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
        //GetLockOutPeriodList
        $scope.LockOutPeriodList = [];
        var GetLockOutPeriodList = UserAdminstrationService.GetLockOutPeriodList();
        GetLockOutPeriodList.then(function (success) { $scope.LockOutPeriodList = success.data.data; }, function (error) {
            if (error.status === 500 || error.status === 404) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
            else {
                toastr.remove();
                toastr.error(error.data, errorMessage, "Error");
            }
        });

        //GetPassowrdExpiryList
        $scope.PassowrdExpiryList = [];
        var GetPassowrdExpiryList = UserAdminstrationService.GetPassowrdExpiryList();
        GetPassowrdExpiryList.then(function (success) { $scope.PassowrdExpiryList = success.data.data; }, function (error) {
            if (error.status === 500 || error.status === 404) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
            else {
                toastr.remove();
                toastr.error(error.data, errorMessage, "Error");
            }
        });
        //GetPasswordHistoryList
        $scope.PasswordHistoryList = [];
        var GetPasswordHistoryList = UserAdminstrationService.GetPasswordHistoryList();
        GetPasswordHistoryList.then(function (success) { $scope.PasswordHistoryList = success.data.data; }, function (error) {
            if (error.status === 500 || error.status === 404) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
            else {
                toastr.remove();
                toastr.error(error.data, errorMessage, "Error");
            }
        });
    }
    init();

    //Update Company Security Controls
    $scope.UpdateSecurityControls = UpdateSecurityControls;
    function UpdateSecurityControls() {
        var param = {
            "companyId": sessionStorage.getItem("CompanyId"),
            "passwordLength": {
                "id": $scope.SecurityControls.passwordLength.id
            },
            "passwordComplexity": {
                "id": $scope.SecurityControls.passwordComplexity.id
            },
            "sessionTimeout": {
                "id": $scope.SecurityControls.sessionTimeout.id
            },
            "lockoutThreshold": {
                "id": $scope.SecurityControls.lockoutThreshold.id
            },
            "lockoutPeriod": {
                "id": $scope.SecurityControls.lockoutPeriod.id
            },
            "passwordExpireTime": {
                "id": $scope.SecurityControls.passwordExpireTime.id
            },
            "passwordHistory": {
                "id": $scope.SecurityControls.passwordHistory.id
            },
            "rememberPassword": $scope.SecurityControls.rememberPassword
        };

        updateSecurityControls = UserAdminstrationService.updateSecurityControls(param);
        updateSecurityControls.then(function (success) {
            if (success.data.status == 200) {
                var getCompanySecutiyControls = UserAdminstrationService.getCompanySecutiyControls();
                getCompanySecutiyControls.then(function (success) {
                    $scope.SecurityControls = success.data.data;
                }, function (error) { });
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");
            }

        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    };   
    $scope.GotoDashboard = function () {
        if(sessionStorage.getItem("RoleList") === "POLICYHOLDER" ){
            $location.path('http://localhost:8080/claim');
        }
        else{
        $location.url(sessionStorage.getItem('HomeScreen'));
        }
    }
});