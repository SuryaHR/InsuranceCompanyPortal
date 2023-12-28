angular.module('MetronicApp').controller('RegisterController', function ($rootScope, settings, $scope,  $location, $state, $translate, $translatePartialLoader,RegisterUserService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });

    //set language
    $translatePartialLoader.addPart('Login');
    $translate.refresh();

    $scope.errormsg = "";
    $scope.LoginPage = LoginPage;
    function LoginPage(event) {
        $location.path('/');
    }
    $('.datepicker').datepicker();
    $(".datepicker").datepicker({
        autoclose: true
    });
  
    $scope.RegisterObj = {
        firstName: "",
        lastName:"",
        email:"",
        password:"",
        accNumber: "",
        dob: ""
    };
    $scope.RegisterUser = RegisterUser;
    $scope.ConfirmPass = "";
    $scope.email = "";
    function RegisterUser(event) {
        var form = {
            firstName: $scope.RegisterObj.firstName,
            lastName: $scope.RegisterObj.lastName,
            email: $scope.RegisterObj.email,
            password:$scope.RegisterObj.password,
            accNumber: $scope.RegisterObj.accNumber,
            dob: $scope.RegisterObj.dob
        }; 
        var response=RegisterUserService.RegisterUser(form);

        response.then({
            function (success) {
                $scope.errormsg = success.message;
            }
        },function (error) {
            if (angular.isUndefined(error.errorMessage) || error.errorMessage === null ) {
                $scope.errormsg = error.message ;
            }
            else
                $scope.errormsg = error.errorMessage;
        }
        );
    }
});