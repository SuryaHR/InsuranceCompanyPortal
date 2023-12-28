angular.module('MetronicApp').controller('NewBranchController', function ($rootScope, $scope, $http, $location, $translatePartialLoader, $translate) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('NewBranch');
    $translate.refresh();
});