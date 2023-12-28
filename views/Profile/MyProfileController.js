angular.module('MetronicApp').controller('MyProfileController', function ($translate, RoleBasedService, $translatePartialLoader, $scope, $rootScope, $state, settings,
    $location, $filter, MyProfileService, AuthHeaderService, $window) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $scope.PageSize = $rootScope.settings.pagesize;
    $translatePartialLoader.addPart('MyProfile');
    $translate.refresh();

    $scope.profile = {};
    $scope.StateList = [];
    $scope.Strength;//For strength
    $scope.WidthPercentage;//For Percentage
    $scope.BackGround;//For background color
    var tests = [/[0-9]/, /[a-z]/, /[A-Z]/, /[^A-Z-0-9]/i];
    $scope.previous = sessionStorage.getItem("previous");

    $scope.StrengthDiv = false;
    //varibales to set edit / View 
    $scope.IsEditPersonalDetails = false;
    $scope.IsSaveEnabled = false;
    $scope.IsEditEmailId = false;
    var iv = "";
    var salt = "";
    var key = "";
    $scope.headerProfilePicUpdate = false;
    //$scope.NewUserLogin = true;
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
        init();
        $scope.IsEditPersonalDetails = false;
        $scope.IsSaveEnabled = false;
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
        $scope.NewUserLogin = false;
    }
    init();
    function init() {
        $scope.resetPassword = sessionStorage.getItem("isResetPassword");
        if (angular.isDefined($scope.resetPassword)) {
            $scope.IsEditPassword = true;
        }
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

            // $scope.$apply(function() { 
            //  });    
            setTimeout(function () {
                $scope.$apply(function () {
                    sessionStorage.setItem("Name", $scope.personalDetails.lastName + ", " + $scope.personalDetails.firstName);
                });
            }, 2000);

            // Update Profile image data
            var profilePicture = {
                "fileName": $scope.personalDetails.displayPicture!=null ? $scope.personalDetails.displayPicture.fileName : null,
                "filePurpose" :$scope.personalDetails.displayPicture!=null ? $scope.personalDetails.displayPicture.filePurpose : null,
                "fileType" :$scope.personalDetails.displayPicture!=null ? $scope.personalDetails.displayPicture.fileType : null,
                "fileUrl" :$scope.personalDetails.displayPicture!=null ? $scope.personalDetails.displayPicture.fileUrl : null,
                "mediaFileId" :$scope.personalDetails.displayPicture!=null ? $scope.personalDetails.displayPicture.mediaFileId : null
            }

            // HeaderProfilePicUpdate
            if($scope.headerProfilePicUpdate){
                $rootScope.$broadcast('updateProfilePicture', profilePicture);
                $scope.headerProfilePicUpdate = false;
            }

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
    //Save profile update
    $scope.SaveProfileDetails = SaveProfileDetails;
    function SaveProfileDetails() {
        var data = new FormData();
        if ($scope.personalDetails.profilePicture && $scope.personalDetails.profilePicture.FileName != null) {
            data.append("filesDetails", JSON.stringify([{
                "fileName": $scope.personalDetails.profilePicture.FileName,
                "fileType": $scope.personalDetails.profilePicture.FileType,
                "extension": $scope.personalDetails.profilePicture.FileExtension,
                "filePurpose": "PROFILE_PICTURE",
                "latitude": null,
                "longitude": null
            }]))
            data.append("file", $scope.personalDetails.profilePicture.File);
        }else{
            // $scope.personalDetails.profilePicture = null;
        }

        var eveningTimePhone = $scope.personalDetails.eveningTimePhone;
        var cellPhone = $scope.personalDetails.cellPhone;
        var dayTimePhone = $scope.personalDetails.dayTimePhone;
        
        if ($scope.personalDetails.cellPhone != undefined && $scope.personalDetails.cellPhone != null) {
            var cellPhone = $scope.personalDetails.cellPhone.replace(/[^0-9]/g, '');

        }
        if ($scope.personalDetails.dayTimePhone != undefined && $scope.personalDetails.dayTimePhone != null) {
            var dayTimePhone = $scope.personalDetails.dayTimePhone.replace(/[^0-9]/g, '');

        }
        if ($scope.personalDetails.eveningTimePhone != undefined && $scope.personalDetails.eveningTimePhone != null) {
            var eveningTimePhone = $scope.personalDetails.eveningTimePhone.replace(/[^0-9]/g, '');

        }
        data.append("details", JSON.stringify(
            {
            "firstName": $scope.personalDetails.firstName,
            "lastName": $scope.personalDetails.lastName,
            "profilePicture" : $scope.personalDetails.profilePicture?.fileUrl != undefined ? {
                "fileUrl" : $scope.personalDetails.profilePicture.fileUrl
            } : null ,
            "speedCheckVendorUrl": sessionStorage.getItem("speedCheckVendor"),
            "userRole": sessionStorage.getItem("UserType"),
            "dateOfBirth": (($scope.personalDetails.dateOfBirth !== null && angular.isDefined($scope.personalDetails.dateOfBirth)) ? $filter('DatabaseDateFormatMMddyyyy')($scope.personalDetails.dateOfBirth) : null),
            "cellPhone": cellPhone.replace(/[^0-9]/g, ''),
            "dayTimePhone": dayTimePhone.replace(/[^0-9]/g, ''),
            "extension":$scope.personalDetails.extension ? $scope.personalDetails.extension : null,
            "eveningTimePhone": eveningTimePhone.replace(/[^0-9]/g, ''),
            "address": ($scope.personalDetails.address !== null) ? {
                "city": (angular.isDefined($scope.personalDetails.address.city) && $scope.personalDetails.address.city !== null) ? $scope.personalDetails.address.city : null,
                "id": (angular.isDefined($scope.personalDetails.address.id) && $scope.personalDetails.address.id !== null) ? $scope.personalDetails.address.id : null,
                "state": {
                    "id": (angular.isDefined($scope.personalDetails.address.state) && $scope.personalDetails.address.state !== null) ? $scope.personalDetails.address.state.id : null
                },
                "streetAddressOne": (angular.isDefined($scope.personalDetails.address.streetAddressOne) && $scope.personalDetails.address.streetAddressOne !== null) ? $scope.personalDetails.address.streetAddressOne : null,
                "streetAddressTwo": (angular.isDefined($scope.personalDetails.address.streetAddressTwo) && $scope.personalDetails.address.streetAddressTwo !== null) ? $scope.personalDetails.address.streetAddressTwo : null,
                "zipcode": (angular.isDefined($scope.personalDetails.address.zipcode) && $scope.personalDetails.address.zipcode !== null) ? $scope.personalDetails.address.zipcode : null
            } : null
        }));

        var UpdateProfile = MyProfileService.UpdateProfile(data);
        UpdateProfile.then(function (success) {
            $scope.ErrorMessage = success.data.message;
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
            $scope.headerProfilePicUpdate = true;
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
        var encryptedCurrPass = getCipherEncryptedText($scope.PasswordSecurity.CurrentPassword);
        var encryptedNewPass = getCipherEncryptedText($scope.PasswordSecurity.NewPassword);
        var paramPass = {
            "oldPassword": btoa(encryptedCurrPass),
            "newPassword": btoa(encryptedNewPass)
        }
        var changePass = MyProfileService.ChangePassword(paramPass);
        changePass.then(function (success) {
            toastr.remove()
            toastr.success(success.data.message, "Confirmation");
            sessionStorage.setItem('isResetPassword', false);
            sessionStorage.setItem('ForgotPassword', false);
            if (sessionStorage.getItem("isSQExists") === "false") {
                $location.url('/SecurityQuestion');
            }
            $scope.GoToHome();
        }, function (error) {
            toastr.remove()
            if (angular.isDefined(error.data.errorMessage)) {
                toastr.error(error.data.errorMessage, "Error");
            }
            else
                toastr.error('Failed to change password.', "Error");
        })
    }

    $scope.getCipherEncryptedText = getCipherEncryptedText;
    function getCipherEncryptedText(pass) {
        var aesUtil = new AesUtil(128, 1000);
        iv = CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex);
        salt = CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex);
        key = CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex);
        if (pass != null || pass != '')
            return (iv + "::" + aesUtil.encrypt(salt, iv, key, pass) + "::" + salt + "::" + key);
    }

    $scope.checkPass = function () {
        if ((angular.isDefined($scope.PasswordSecurity.NewPassword) && $scope.PasswordSecurity.NewPassword !== null) && (angular.isDefined($scope.PasswordSecurity.ConfirmPassword) && $scope.PasswordSecurity.ConfirmPassword !== null)) {
            if ($scope.PasswordSecurity.NewPassword !== $scope.PasswordSecurity.ConfirmPassword) {
                $scope.PasswordMissmatch = true;
                $scope.PasswordSecurity.ConfirmPassword = "";
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

        if (pass == null || pass.length == 0 || angular.isUndefined(pass)) {

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
        if(sessionStorage.getItem("RoleList") === "POLICYHOLDER" ){
            $location.path('http://localhost:8080/claim');
        }
        else{
        $location.url(sessionStorage.getItem('HomeScreen'));
        }
    };

    function isNullData(objData) {
        if (objData == null || objData == 'null' || objData == '' || objData == 'undefined') {
            return true;
        } else {
            return false;
        }
    }
     $scope.cancel = function(){
        sessionStorage.setItem('ForgotPassword', false);
            sessionStorage.setItem('isResetPassword', false);
           
            $location.url(sessionStorage.getItem("previous")); 
    }
    $scope.AddProfilePicture = function(){
        angular.element('#FileUpload').trigger('click');
    };

    $scope.getAttachmentDetails = function (e) {
        $scope.displayAddImageButton = true;
        $scope.IsSaveEnabled = true;
        $scope.$apply(function () {
            var files = event.target.files;
            $scope.filed = event.target.files;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var reader = new FileReader();
                reader.file = file;
                reader.fileName = files[i].name;
                reader.fileType = files[i].type;
                reader.fileExtension = files[i].name.substr(files[i].name.lastIndexOf('.'));
                reader.onload = $scope.LoadFileInList;
                reader.readAsDataURL(file);
            }
        });
    };

    $scope.LoadFileInList = function (e) {
        $scope.$apply(function () {
            $scope.personalDetails.profilePicture= 
                {
                    "FileName": e.target.fileName, "FileExtension": e.target.fileExtension, "FileType": e.target.fileType,
                    "Image": e.target.result, "File": e.target.file, "isLocal": true
                }
        });
    };

    $scope.DeleteProfilePicture = function(e){
        $scope.personalDetails.profilePicture= null;
        $scope.IsSaveEnabled = true;
    }

});

