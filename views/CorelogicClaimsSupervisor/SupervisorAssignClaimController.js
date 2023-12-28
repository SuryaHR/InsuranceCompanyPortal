angular.module('MetronicApp').controller('SupervisorAssignClaimController',function AssignClaimForManagerController($translate, $translatePartialLoader, $rootScope, $scope, 
     $http, $location, AssignClaimForAdjusterService,items, AdjusterList) {
    $translatePartialLoader.addPart('SupervisorAssignClaim');
    $translate.refresh();
    $scope.Error = "";
    $scope.assignedUserId;
    $scope.objClaim = items;
    $scope.AdjusterList = AdjusterList;
    
    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }
   
    $scope.ok = function () {
        $scope.Error = "";
        //success call back
        if ($scope.assignedUserId > 0) {
            var param = {
                "claimId": $scope.objClaim.claimId,
                "assignedUserId": $scope.assignedUserId,
                "claimStatusId": 2
            };
            var promisePost = AssignClaimForAdjusterService.AssignClaim(param);
            promisePost.then(function (pl) {
                toastr.remove();
                toastr.success(pl.data.message,"Confirmation");
                if (pl.data.status == 200)
                    $scope.$close("Success");
                else
                    $scope.$close("Fail");
            }, function (errorPl) {            //Error Message
                $scope.$close("Fail"); toastr.remove();
                toastr.error(errorPl.data.errorMessage, "Error");
            });
            $scope.$close("Success");
        }
        else {
            toastr.remove();
            toastr.warning("Please select adjuster from the list.", "Select adjuster"); 
        }
    };
    $scope.cancel = function () {
        
        $scope.$close();
    };

    $scope.getAdjusterId = getAdjusterId;
    function getAdjusterId(id) {
        $scope.Error = "";
        $scope.assignedUserId = id;
    }
});