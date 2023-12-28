angular.module('MetronicApp').controller('AdjusterClaimsInProgressController', function ($rootScope, $log, $scope,
    settings, $http, $timeout, $location, $translate, $translatePartialLoader) {

   
   
   

    $scope.pagesize = "10"
    $scope.pagesize2 = "10"
    $scope.pagesize3 = "10"
    $scope.pagesize4 = "10"

    //set language
    $translatePartialLoader.addPart('AdjusterClaimsInProgress');
    $translate.refresh();

    $scope.showMyDraftTab = true;
    $scope.showInProgressTab = false;
    $scope.showWaitingForApprovalTab = false;
    $scope.showDeclinedTab = false;

    $scope.showMyDraft = showMyDraft;
    function showMyDraft(e) {
        $scope.showMyDraftTab = true;
        $scope.showInProgressTab = false;
        $scope.showWaitingForApprovalTab = false;
        $scope.showDeclinedTab = false;
    }
    $scope.showInProgress = showInProgress;
    function showInProgress(e) {
        
        $scope.showMyDraftTab = false;
        $scope.showInProgressTab = true;
        $scope.showWaitingForApprovalTab = false;
        $scope.showDeclinedTab = false;
    }
    $scope.showWaitingForApproval = showWaitingForApproval;
    function showWaitingForApproval(e) {
        
        $scope.showMyDraftTab = false;
        $scope.showInProgressTab = false;
        $scope.showWaitingForApprovalTab = true;
        $scope.showDeclinedTab = false;
    }
    $scope.showDeclined = showDeclined;
    function showDeclined(e) {
        
        $scope.showMyDraftTab = false;
        $scope.showInProgressTab = false;
        $scope.showWaitingForApprovalTab = false;
        $scope.showDeclinedTab = true;
    }
    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }
  
   
});