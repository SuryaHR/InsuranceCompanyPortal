angular.module('MetronicApp').controller('NewClaimFormPopupController', function ($rootScope, NewClaimFormPopupService, $uibModal, $scope, $translate, $translatePartialLoader,
    objClaim) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('AdjusterPropertyClaimDetails');
    $translate.refresh();
    $scope.ClaimFormList = [];
    $scope.selectedtaskList = [];
    $scope.ErrorMessage = "";
    $scope.participant = {};

    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    };
    $scope.ObjTask = {
        "taskId": null,
        "comment": null

    }
    
    function getPolicyholder() {
      $scope.ClaimParticipantsList.forEach((participant)=> {
          if(participant.participantType.id === 5){
            return $scope.participant = participant;
          };
        });
    }
    function init() {
        //Get all tghe claim form
        if (objClaim.PolicyType !== null && angular.isDefined(objClaim.PolicyType)) {
            if (objClaim.PolicyType == "HOME") {
                var GetTaskList = NewClaimFormPopupService.GetTaskList();
                GetTaskList.then(function (success) {
                    $scope.ClaimFormList = success.data.data;
                }, function (error) { });
            }
            else {
                var GetTaskList = NewClaimFormPopupService.GetTaskListAUTO();
                GetTaskList.then(function (success) {
                    $scope.ClaimFormList = success.data.data;
                }, function (error) { });
            }
        }
        else {
            var GetTaskList = NewClaimFormPopupService.GetTaskList();
            GetTaskList.then(function (success) { $scope.ClaimFormList = success.data.data; }, function (error) { });
        }

        var param = { "claimNumber": objClaim.ClaimNumber }
        var getpromise = NewClaimFormPopupService.getVendorsListAgainstClaim(param);
        getpromise.then(function (success) {
            $scope.ClaimParticipantsList = success.data.data;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        });

    }
    init();
    //Add to selected claim list
    //$scope.AddToSeletedClaimTask = function (obj) {
    //    var indexobj = $scope.selectedtaskList.indexOf(obj);
    //    if (indexobj === -1)
    //        $scope.selectedtaskList.push(obj);
    //    else {
    //        $scope.selectedtaskList.splice(indexobj, 1);
    //    }
    //}

    //Save claim form tasks
    $scope.ok = function (e) {
        //  if ($scope.selectedtaskList !== null && $scope.selectedtaskList.length > 0) {
        //var TaskIdComments = [];
        //angular.forEach($scope.selectedtaskList, function (item) {
        //    TaskIdComments.push({
        //        "taskId": item.taskId,
        //        "comment": item.comment
        //    });
        //});
        //var ParamTasks = {
        //    "claimId": objClaim.ClaimId,
        //    "claimPendingTasks": TaskIdComments
        //};
        getPolicyholder();
        var createdBy = {
            "id": sessionStorage.getItem("UserId"),
            "email": sessionStorage.getItem("UserName")
        };

        var ParamTasks = {
            "claimId": objClaim.ClaimId,
            "claimParticipantDTO": $scope.participant,
            "registrationNumber": sessionStorage.getItem("speedCheckVendor"),
            "claimPendingTasks": [$scope.ObjTask],
            "adjusterDetails": createdBy,
        };
        var GetTaskList = NewClaimFormPopupService.CreateTask(ParamTasks);
        GetTaskList.then(function (success) {
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
            $scope.$close("Success");
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
        // }
        // else {
        //     $scope.ErrorMessage = "Please select at least one task."
        //  }
    }
    //Cancel
    $scope.cancel = function () {
        $scope.$close();
    };
});
