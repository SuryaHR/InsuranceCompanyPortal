angular.module('MetronicApp').controller('SupervisorMyTeamConroller', function ($translate, $translatePartialLoader, $rootScope, $log, $scope, $filter, settings, $http, $timeout, $location, SupervisorMyTeamService, AuthHeaderService) {
    $translatePartialLoader.addPart('SupervisorMyTeam');
    $translate.refresh();
    $scope.init = init;
    $scope.teamCount = 0;
    $scope.reverse = true;
    $scope.AllAdjusterList = [];
    function init() {
        $(".page-spinner-bar").removeClass("hide");
        getAllAdjusterList();
    }
    init();

    // Get adjusters under logged in supervisor
    $scope.getAllAdjusterList = getAllAdjusterList;
    function getAllAdjusterList() {
        var adjusters = SupervisorMyTeamService.getAdjusterList();
        adjusters.then(function (success) {
            var resultList = success.data ? success.data.data : null;
            angular.forEach(resultList, function (adjuster) {
                let roles = Array.prototype.map.call(adjuster.details.role, function (item) { return item.roleName; }).join(",");
                adjuster.details.roleString = roles;
                $scope.AllAdjusterList.push(adjuster);
            });
            if ($scope.AllAdjusterList != null) {
                $scope.teamCount = $scope.AllAdjusterList.length;
            }
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.error((angular.isDefined(error.data) && angular.isDefined(error.data.errorMessage) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage()), "Error");
        });
    }

    // Got to individual adjuster's performance details page
    $scope.GotoAdjusterPerformance = GotoAdjusterPerformance;
    function GotoAdjusterPerformance(adjuster) {
        var obj = {};
        obj.adjusterId = adjuster.details.id;
        sessionStorage.setItem("AdjusterId", adjuster.details.userId);
        sessionStorage.setItem("AdjusterName", adjuster.details.lastName + ", " + adjuster.details.firstName);
        $location.url("/Performance");
    }

});