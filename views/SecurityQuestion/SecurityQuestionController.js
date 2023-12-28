angular.module('MetronicApp').controller('SecurityQuestionController', function ($translate, RoleBasedService, $translatePartialLoader, $scope, $rootScope, $state, settings,
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
    $scope.first = [];
    $scope.second = [];
    $scope.Third = [];
    $scope.answers = {};
    
    init();
    function init() {
        getSecurityQuestions();
    }

    $scope.masterlist = [];
    $scope.getSecurityQuestions = getSecurityQuestions;
    function getSecurityQuestions() {
        var getSecurityQuestions = MyProfileService.getSecurityQuestions();
        getSecurityQuestions.then(function (success) {
            $scope.masterlist = success.data && success.data.data ? success.data.data : '';
            angular.forEach($scope.masterlist, function (data) {
                data.selected = false;
            });
            $scope.first = { list: angular.copy($scope.masterlist), option: null };
            $scope.second = { list: angular.copy($scope.masterlist), option: null };
            $scope.third = { list: angular.copy($scope.masterlist), option: null };

        }, function (error) {
            toastr.remove()
            if (angular.isDefined(error.data.errorMessage)) {
                toastr.error(error.data.errorMessage, "Error");
            }
            else
                toastr.error('Failed to get security questions details. Please try again..', "Error");
        });
    }

    $scope.getRemoveSelectedValues = getRemoveSelectedValues;
    function getRemoveSelectedValues() {

        $scope.enableAllOptions($scope.first.list);
        $scope.enableAllOptions($scope.second.list);
        $scope.enableAllOptions($scope.third.list);

        $scope.disableOptions($scope.first.list, $scope.second.list, $scope.second.option);
        $scope.disableOptions($scope.first.list, $scope.third.list, $scope.third.option);

        $scope.disableOptions($scope.second.list, $scope.first.list, $scope.first.option);
        $scope.disableOptions($scope.second.list, $scope.third.list, $scope.third.option);

        $scope.disableOptions($scope.third.list, $scope.first.list, $scope.first.option);
        $scope.disableOptions($scope.third.list, $scope.second.list, $scope.second.option);

    }

    //Enable all options by default.
    $scope.enableAllOptions = function (arr) {
        for (var i = 0; i < arr.length; i++) {
            arr[i].selected = false;
        }
    };

    //Function that takes the destinationArr , Source Arry , and Source selected item
    $scope.disableOptions = function (destArr, srcArr, srcItem) {
        if (srcItem !== null) {
            var index = srcArr.map(function (x) { return x.id; }).indexOf(srcItem);
            console.log('data', index);
            if (index >= 0) destArr[index].selected = true;
        }
    };

    var questionAnswerList = [];
    $scope.isInvalidForm = false;
    $scope.saveSecurityQuestionsAndAnswers = saveSecurityQuestionsAndAnswers;
    function saveSecurityQuestionsAndAnswers() {
        if (!isNullData($scope.first.option)) {
            questionAnswerList.push({
                'questionId': $scope.first.option,
                'answer': $scope.answers.answerOne,
            });
        }
        if (!isNullData($scope.second.option)) {
            questionAnswerList.push({
                'questionId': $scope.second.option,
                'answer': $scope.answers.answerTwo,
            });
        }
        if (!isNullData($scope.third.option)) {
            questionAnswerList.push({
                'questionId': $scope.third.option,
                'answer': $scope.answers.answerThree,
            });
        }
        var paramDTO = {
            "userId": sessionStorage.getItem("UserId").toString(),
            'questionAnswerList': questionAnswerList
        }
        var saveSecurityAnswer = MyProfileService.saveSecurityQuestion(paramDTO);
        saveSecurityAnswer.then(function (success) {
            sessionStorage.setItem('isResetPassword', false);
            sessionStorage.setItem('ForgotPassword', false);
            sessionStorage.setItem('isSQExists', true);
            $scope.GoToHome();
            questionAnswerList = [];
            $scope.answers = {};
        }, function (error) {
            questionAnswerList = [];
            $scope.answers = {};
            toastr.remove()
            toastr.error('Failed to save security changes, Please try again.', "Error");
        })
    }

    $scope.GoToHome = function () {
        if(sessionStorage.getItem("RoleList") === "POLICYHOLDER" ){
            $location.path('http://localhost:8080/claim');
        }
        else{
        $location.url(sessionStorage.getItem('HomeScreen'));
        }
    };

    $scope.resetAnswer1 = resetAnswer1;
    function resetAnswer1(params) {
        $scope.answers.answerOne = '';
    }

    $scope.resetAnswer2 = resetAnswer2;
    function resetAnswer2(params) {
        $scope.answers.answerTwo = '';
    }

    $scope.resetAnswer3 = resetAnswer3;
    function resetAnswer3(params) {
        $scope.answers.answerThree = '';
    }

   

    function isNullData(objData) {
        if (objData == null || objData == 'null' || objData == '' || objData == 'undefined') {
            return true;
        } else {
            return false;
        }
    }
});

