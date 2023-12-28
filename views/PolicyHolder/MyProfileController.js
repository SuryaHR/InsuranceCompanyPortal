angular.module('MetronicApp').controller('MyProfileController', function ($translate, $translatePartialLoader, $scope, $rootScope, $state, settings,
    $location, $filter, MyProfileService, AuthHeaderService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $scope.PageSize = $rootScope.settings.pagesize;
    $translatePartialLoader.addPart('MyProfile');
    $translate.refresh();

    $scope.StateList = [];
    $scope.Strength;//For strength
    $scope.WidthPercentage;//For Percentage
    $scope.BackGround;//For background color
    var tests = [/[0-9]/, /[a-z]/, /[A-Z]/, /[^A-Z-0-9]/i];
    $scope.StrengthDiv = false;
    //varibales to set edit / View 
    $scope.IsEditPersonalDetails = false;
    $scope.IsEditEmailId = false;

    //Edit Personal Details
    $scope.EditPersonalDetails = EditPersonalDetails;
    function EditPersonalDetails() {
        $scope.personalDetails.eveningTimePhone = $filter('tel')($scope.personalDetails.eveningTimePhone);
        $scope.personalDetails.dayTimePhone = $filter('tel')($scope.personalDetails.dayTimePhone);
        $scope.personalDetails.cellPhone = $filter('tel')($scope.personalDetails.cellPhone);
        $scope.IsEditPersonalDetails = true;

    }
    $scope.CancelEditPersonalDetails = CancelEditPersonalDetails;
    function CancelEditPersonalDetails() {

        $scope.IsEditPersonalDetails = false;
    }
    //Edit EmailId
    $scope.EditEmailId = EditEmailId;
    function EditEmailId() {
        $scope.IsEditEmailId = true;

    }
    $scope.CancelEditEmailId = CancelEditEmailId;
    function CancelEditEmailId() {
        $scope.IsEditEmailId = false;
    }
    $scope.CancelEditPhone = CancelEditPhone;
    function CancelEditPhone() {
        $scope.IsEditPhone = false;

    }
    $scope.EditPhone = EditPhone;
    function EditPhone() {
        $scope.IsEditPhone = true;
    }
    $scope.EditPassword = EditPassword;
    function EditPassword() {
        $scope.IsEditPassword = true;
    }
    $scope.CancelEditPassword = CancelEditPassword;
    function CancelEditPassword() {
        $scope.IsEditPassword = false;
    }
    init();
    function init() {
        var param =
           {
               "isTaxRate": false,
               "isTimeZone": false
           }
        var statePromise = MyProfileService.getStates(param);
        statePromise.then(function (success) { $scope.StateList = success.data.data; }, function (error) { $scope.StateList = []; });

        //Get personalData
        var paramUserId = {
            "userId": sessionStorage.getItem("UserId").toString()        //policy holder id
        };
        var getPolicyHolderDetails = MyProfileService.getPolicyHolderdetails(paramUserId);
        getPolicyHolderDetails.then(function (success) {

            $scope.personalDetails = success.data.data;
            if (angular.isDefined($scope.personalDetails.dateOfBirth))
                $scope.personalDetails.dateOfBirth = $scope.personalDetails.dateOfBirth.replace(/-/g, '/');
            else
                $scope.personalDetails.dateOfBirth = null;

            $scope.personalDetails.eveningTimePhone = $filter('tel')($scope.personalDetails.eveningTimePhone);
            $scope.personalDetails.dayTimePhone = $filter('tel')($scope.personalDetails.dayTimePhone);
            $scope.personalDetails.cellPhone = $filter('tel')($scope.personalDetails.cellPhone);
        }, function (error) {
           
        });

    }
    //Save profile update
    $scope.SaveProfileDetails = SaveProfileDetails;
    function SaveProfileDetails() {
        $scope.personalDetails.cellPhone = $scope.personalDetails.cellPhone.replace(/[^0-9]/g, '');
        $scope.personalDetails.dayTimePhone = $scope.personalDetails.dayTimePhone.replace(/[^0-9]/g, '');
        $scope.personalDetails.eveningTimePhone = $scope.personalDetails.eveningTimePhone.replace(/[^0-9]/g, '');   
      
        var details = {
            "firstName": $scope.personalDetails.firstName,
            "lastName": $scope.personalDetails.lastName,
            "dateOfBirth": (($scope.personalDetails.dateOfBirth !== null && angular.isDefined($scope.personalDetails.dateOfBirth)) ? $filter('DatabaseDateFormatMMddyyyy')($scope.personalDetails.dateOfBirth) : null),
            "cellPhone": $scope.personalDetails.cellPhone,
            "dayTimePhone": $scope.personalDetails.dayTimePhone,
            "eveningTimePhone": $scope.personalDetails.eveningTimePhone,
            "address": {
                "city": $scope.personalDetails.address.city,
                "id": $scope.personalDetails.address.id,
                "state": {
                    "id": $scope.personalDetails.address.state.id
                },
                "streetAddressOne": $scope.personalDetails.address.streetAddressOne,
                "streetAddressTwo": $scope.personalDetails.address.streetAddressTwo,
                "zipcode": $scope.personalDetails.address.zipcode
            }
        };
       
        var UpdateProfile = MyProfileService.UpdateProfile(details);
        UpdateProfile.then(function (success) {
            $scope.ErrorMessage = success.data.message;
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
            CancelEditPersonalDetails();
        }, function (error) {
            toastr.remove()
            if (angular.isDefined(error.data.errorMessage)) {
                toastr.error(error.data.errorMessage, "Error");
            }
            else
                toastr.error('Failed to update details. Please try again..', "Error");
        });

    }

    //Change password
    $scope.PasswordSecurity = { "CurrentPassword": null, "ConfirmPassword": null, "NewPassword": null };
    $scope.ChangePassword = ChangePassword;
    function ChangePassword() {
        var paramPass = {
            "oldPassword": $scope.PasswordSecurity.CurrentPassword,
            "newPassword": $scope.PasswordSecurity.NewPassword
        }
       
        var changePass = MyProfileService.ChangePassword(paramPass);
        changePass.then(function (success) {
            toastr.remove()
            toastr.success(success.data.message, "Confirmation");
            CancelEditPassword();
        }, function (error) {
            toastr.remove()
            if (angular.isDefined(error.data.errorMessage)) {
                toastr.error(error.data.errorMessage, "Error");
            }
            else
                toastr.error('Failed to change password.', "Error");
        })
    }
    $scope.checkPass = function () {
        if ((angular.isDefined($scope.PasswordSecurity.NewPassword) && $scope.PasswordSecurity.NewPassword !== null) && (angular.isDefined($scope.PasswordSecurity.ConfirmPassword) && $scope.PasswordSecurity.ConfirmPassword !== null)) {
            if ($scope.PasswordSecurity.NewPassword !== $scope.PasswordSecurity.ConfirmPassword) {
                $scope.PasswordMissmatch = true;
            }
            else {
                $scope.PasswordMissmatch = false;
            }
        }
        else
            $scope.PasswordMissmatch = false;
    };

    $scope.Show = function () {
        alert($scope.phoneVal);
    };

   
   
 //Password Strength checker function
    $scope.test = test;
    function test() {
        var pass = $scope.PasswordSecurity.NewPassword;
     
        if (pass == null||pass.length == 0 || angular.isUndefined(pass))
        {

            $scope.WidthPercentage = 0;
            $scope.Strength = "Too Short";
            $scope.StrengthDiv = false;
        }
        else {
            var s = 0;
            $scope.StrengthDiv = true;
            if (pass.length < 6) {
                if (pass.length == 0) {
                    $("#StrengthDiv").addClass("hide");
                    $scope.WidthPercentage = 0;
                    $scope.Strength = "Too Short";
                }
                else {

                    $scope.Strength = "Weak";
                    $scope.WidthPercentage = 25;
                    $scope.BackGround = "#e43a45";
                    return 0;
                }
            }
            for (var i in tests)
                if (tests[i].test(pass))
                    s++
            if (s == 1) {
                $scope.Strength = "Weak";
                $scope.WidthPercentage = 25;
                $scope.BackGround = "#e43a45";
            }
            else if (s == 2) {
                $scope.Strength = "Fair";
                $scope.WidthPercentage = 50;
                $scope.BackGround = "#f4d03f";
            }
            else if (s == 3) {
                $scope.Strength = "Good";
                $scope.WidthPercentage = 75;
                $scope.BackGround = "#32c5d2";
            }
            else if (s == 4) {
                $scope.Strength = "Strong";
                $scope.WidthPercentage = 100;
                $scope.BackGround = "#1fb778";
            }
            return s;

        }
        
    };

    $scope.GoToHome = function () {
        $location.url(sessionStorage.getItem('HomeScreen'));
    };
});

