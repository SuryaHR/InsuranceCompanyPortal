angular.module('MetronicApp').controller('PolicyholderTaskDetailsController', function ($translate, $translatePartialLoader, $rootScope, $log, $scope,
    settings, $http, $window, $location, $uibModal, $filter, PolicyHolderClaimDetailsService){
        $scope.CommonObj = {
            'claimNumber':sessionStorage.getItem("PolicyHolderClaimNo"),
            'ClaimId':sessionStorage.getItem("PolicyHolderClaimId"),
            'user':sessionStorage.getItem("RoleList"),
        }
        $scope.PendingTaskList = [];
        $scope.assignedDate = '';
        function init() {
            var paramUserTaskListList = {
                "claimId": $scope.CommonObj.ClaimId
            };
            var GetPendingTaskPromise = PolicyHolderClaimDetailsService.GetPendingTask(paramUserTaskListList);
            GetPendingTaskPromise.then(function (success) { 
                $scope.PendingTaskList = success.data.data;
                angular.forEach($scope.PendingTaskList, function (task) {
                    task.newAssignedDate = '';
                    var monthNames = [ 'January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December' ];
                    var month = task.assignedDate.substr(0,2);
                    task.newAssignedDate = monthNames[month-1];
                    task.newAssignedDate = task.newAssignedDate+" "+task.assignedDate.substr(3,2);
                    task.newAssignedDate = task.newAssignedDate+" "+task.assignedDate.substr(6,4);
                })
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage; 
            });
            
        }
        init();
        $scope.GoToHome = function () {
            $location.url(sessionStorage.getItem("HomeScreen"));
        }
        $scope.GoBack = function (){
            $location.url("/PolicyholderClaimDetails");
        }
        $scope.completeTaskPopup = completeTaskPopup;
        function completeTaskPopup(task) {
            var obj = {
                "index":$scope.PendingTaskList.indexOf(task)+1,
                "status":task.status.status,
                "comment":task.comment,
                "createdBy":task.createdBy,
                "assignedDate":task.newAssignedDate,
                "taskName":task.taskName,
                "taskId":task.taskId,
                "UserRole":$scope.CommonObj.user,
                "response":task.response,
                "attachments":task.attachments,
                "completedDate":task.completedDate
            }
            $scope.animationsEnabled = true;
            var out = $uibModal.open(
                {
                    animation: $scope.animationsEnabled,
                    templateUrl: "views/PolicyHolder/CompleteTaskPopup.html",
                controller: "CompleteTaskPopupController",
                resolve:
                {
                    objClaim: function () {
                        return obj;
                    }
                }
            });
            out.result.then(function (value) {
                //Call Back Function success
                if (value === "Success") {
                    GetPendingTask();
                }
            }, function (res) {
                //Call Back Function close
            });
            return {
                open: open
            };
        }

        $scope.GetPendingTask = GetPendingTask;
        function GetPendingTask() {
            $scope.PendingTaskList = [];
            var paramUserTaskListList = {
                "claimId": $scope.CommonObj.ClaimId
            };
            var GetPendingTaskPromise = PolicyHolderClaimDetailsService.GetPendingTask(paramUserTaskListList);
            GetPendingTaskPromise.then(function (success) { 
                $scope.PendingTaskList = success.data.data;
                angular.forEach($scope.PendingTaskList, function (task) {
                    task.newAssignedDate = '';
                    var monthNames = [ 'January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December' ];
                    var month = task.assignedDate.substr(0,2);
                    task.newAssignedDate = monthNames[month-1];
                    task.newAssignedDate = task.newAssignedDate+" "+task.assignedDate.substr(3,2);
                    task.newAssignedDate = task.newAssignedDate+" "+task.assignedDate.substr(6,4);
                })
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage; 
            });
        }
    })