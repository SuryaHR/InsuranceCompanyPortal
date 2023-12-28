angular.module('MetronicApp').controller('ForgotPasswordController', function ($rootScope, settings, $scope, $http, $timeout,  $location, $state, $translate, $translatePartialLoader, ForgotpasswordService, vcRecaptchaService, LoginService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });


    //set language
    $translatePartialLoader.addPart('Login');
    $translate.refresh();
    $scope.email = "";
    $scope.errormessage = "";
    $scope.errormsg = false;
    $scope.LoginPage = LoginPage;
    init()
    function init() {
        $scope.errormsg = false;
        
        $timeout(function () {
            $scope.hideCaptcha = sessionStorage.getItem("hideCaptcha")=='true';
            if(!$scope.hideCaptcha)
            getForGotPassWordCaptcha();
        }, 600);
        getCompanyDetails();
    }
    function LoginPage(event) {
        if (angular.isDefined(sessionStorage.getItem("IsVendorLogIn")) && (sessionStorage.getItem("IsVendorLogIn") === "True")) {
            sessionStorage.setItem("IsVendorLogIn", undefined);
            $location.path('/VendorLogin');
        }
        else {
            sessionStorage.setItem("IsVendorLogIn", undefined);
            $location.path('/');
        }
    }
    $scope.ResetPassword = ResetPassword;
    function ResetPassword(event) {
        $(".page-spinner-bar").removeClass("hide");
        $scope.errormessage = "";
        var param = { "email": $scope.email, "captchCode": $scope.captchCode,"isHideCaptcha":$scope.hideCaptcha
    };

        var response = ForgotpasswordService.ForgotPassword(param);
        response.then(function (success) {
            $(".page-spinner-bar").addClass("hide");
            /* CTB-1262 */
            toastr.remove();
            toastr.success(success.data && success.data.message ? success.data.message : null, "Confirmation");
            $location.path('/login');
            $scope.errormsg = false;
            //$scope.errormessage = success.data.message;
        },
            function (error) {
                $(".page-spinner-bar").addClass("hide");
                /* CTB-1262 */
                getForGotPassWordCaptcha();
                $scope.errormsg = true;
                //toastr.remove();
                //toastr.error(error.data && error.data.errorMessage ? error.data.errorMessage : null, "Error");
                $scope.errormessage = error.data && error.data.errorMessage ? error.data.errorMessage : null;
            });
    }

    $scope.getForGotPassWordCaptcha = getForGotPassWordCaptcha;
    function getForGotPassWordCaptcha() {
        var getCaptchaDetails = ForgotpasswordService.getForGotPasswordCaptchaDetails();
        getCaptchaDetails.then(function (success) {
            $scope.captchCode = "";
            $scope.captcha = success.data.data;
        },
            function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            })
    }

    $scope.EmptyError = function () {
        $scope.errormsg = '';
    }

    $scope.goToLoginPage = goToLoginPage;
    function goToLoginPage() {
        $location.path('/login');
    }

    // Enter key login action
    document.onkeydown=function(evt){
        var page = window.location.href;            
        if(page.includes("forgotpassword")){
            var keyCode = evt ? (evt.which ? evt.which : evt.keyCode) : event.keyCode;
            if(keyCode == 13)
            {                
                $scope.ResetPassword(evt);                       
            }
        }
    }

    //getting insurance company details
    function getCompanyDetails() {
        var company = LoginService.getCompanyDetails();
        company.then(function (success) {
            var res = success.data.data;
            if (res && res.url === sessionStorage.getItem("Xoriginator")) {
                $scope.companyInfo = res;
                console.log(companyInfo);
                sessionStorage.setItem("companyLogo", res.logo);
                sessionStorage.setItem("CompanyId",1);
            }
        },
            function (error) {
                toastr.remove();
                toastr.error(error.data ? error.data.errorMessage : "", "Error");
            })
    }

});