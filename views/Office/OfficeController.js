angular.module('MetronicApp').controller('OfficeController', function ($rootScope, $uibModal, $scope, $http, $location, $translatePartialLoader, $translate) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('Office');
    $translate.refresh();
    //tab events
    var NewBranch = angular.element(document.querySelector('#tab_newbranch'));
    var MemberContact = angular.element(document.querySelector('#tab_membercontact'));
    var OfficeSummary = angular.element(document.querySelector('#tab_officesummary'));
   
    $scope.ShowNewBranch = ShowNewBranch;
    function ShowNewBranch() {
        NewBranch.addClass('active')
        MemberContact.removeClass('active');
        OfficeSummary.removeClass('active');
    }

    $scope.ShowMemberContact = ShowMemberContact;
    function ShowMemberContact() {
        NewBranch.removeClass('active')
        MemberContact.addClass('active');
        OfficeSummary.removeClass('active');
    }

    $scope.ShowOfficeSummary = ShowOfficeSummary;
    function ShowOfficeSummary() {
        NewBranch.removeClass('active')
        MemberContact.removeClass('active');
        OfficeSummary.addClass('active');
    }
    
});