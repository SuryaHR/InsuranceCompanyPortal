angular.module('MetronicApp').controller('ResetPasswordController', function ($rootScope, $window, $scope, settings, $uibModal, $location, $translate, $translatePartialLoader,
    $filter, ResetPasswordService) {

    /*SetVariables,*/
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });

    //set language
    $translatePartialLoader.addPart('ResetPassword');
    $translate.refresh();
    $scope.previous = sessionStorage.getItem("previous");

    init()
    function init(params) {
        sessionStorage.setItem('FromState', 'AfterLoginResetPassword');
        getRandomQuestions();
    }

    

    //GetRandomQuestions
    $scope.getRandomQuestions = getRandomQuestions;
    function getRandomQuestions() {
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "id": sessionStorage.getItem('UserId')
        }
        var responsePromise = ResetPasswordService.getRandomQuestionsForUser(param);
        responsePromise.then(function (success) {        
            $scope.securityQuestions = success.data && success.data.data ? success.data.data : null;
            if(!(!!$scope.securityQuestions?.questionName))
            {   
                sessionStorage.setItem("isSQExists","false");
                $location.path('/SecurityQuestion');
            }

            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
            $scope.ErrorMessage = error.data.errorMessage;
        });
    };


    //Verify Answers
    var questionAnswerList = [];
    $scope.verifyAnswer = verifyAnswer;
    function verifyAnswer(answer, questions) {

        $(".page-spinner-bar").removeClass("hide");

        if ($scope.securityAnswer) {
            questionAnswerList.push({
                'questionId': questions.id,
                'answer': $scope.securityAnswer,
            });
        }

        var SecurityAnswerDTO = {
            "userId": sessionStorage.getItem('UserId'),
            "questionAnswerList": questionAnswerList
        }

        var responsePromise = ResetPasswordService.verifyAnswer(SecurityAnswerDTO);
        responsePromise.then(function (success) {           
            sessionStorage.setItem('ForgotPassword', false);
            
                sessionStorage.setItem('isResetPassword', true);

            $location.url('/Security'); 
             
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            questionAnswerList = [];
            getRandomQuestions();
            $scope.securityAnswer = '';
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
            $scope.ErrorMessage = error.data.errorMessage;
        });
    }

    $scope.cancel = function(){
        sessionStorage.setItem('ForgotPassword', false);
            sessionStorage.setItem('isResetPassword', false);
           
            $location.url(sessionStorage.getItem("previous")); 
    }

    $scope.GoToHome = function () {
        if(sessionStorage.getItem("RoleList") === "POLICYHOLDER" ){
            $location.path('http://localhost:8080/claim');
        }
        else{
        $location.url(sessionStorage.getItem('HomeScreen'));
        }
    };

});