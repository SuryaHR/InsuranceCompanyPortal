angular.module('MetronicApp').controller('PolicyDetailsController', function ($rootScope, $log, $scope,
    settings, $http, $timeout, $location, $translate, $translatePartialLoader) {

    //set language
    $translatePartialLoader.addPart('PolicyDetails');
    $translate.refresh();
    var pageName = "POLICY_DETAILS"
    $scope.GotoDashboard = function () {
        sessionStorage.removeItem("currentTab");
        $location.url(sessionStorage.getItem('HomeScreen'));
    }
    $scope.GoToSearchResults = function () {
        $location.url('AdjusterGlobalSearch');
    };
});