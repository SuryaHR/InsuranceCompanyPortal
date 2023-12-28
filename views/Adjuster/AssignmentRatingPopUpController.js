angular.module('MetronicApp').controller('assignmentRatingController', function($uibModal, $scope,$translate, $filter, $translatePartialLoader, assignmentObj){
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $scope.comment = assignmentObj[0].comment??"";
    $scope.rating = assignmentObj[0].ratingNumber;
    $scope.cancel = function () {
        var assignmentDetails = {
            assignmentRating:assignmentObj[0].prevAssignmentDetails.assignmentRating,
            comment : assignmentObj[0].prevAssignmentDetails.assignmentComment??"",
            cancel: true
        };
        $scope.$close(assignmentDetails);
    };
    $scope.submitRating = function(){
        var assignmentDetails = {
            assignmentRating:$scope.rating,
            comment : $scope.comment??"",
            cancel: false
        };
        console.log(assignmentDetails);
        $scope.$close(assignmentDetails);
    }
    console.log(assignmentObj);
});