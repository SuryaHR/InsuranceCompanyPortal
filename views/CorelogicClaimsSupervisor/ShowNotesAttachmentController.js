angular.module('MetronicApp').controller('ShowNotesAttachmentController', function ($rootScope, $scope, settings, $filter, $http, $timeout, $location, $translate, $translatePartialLoader, items) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });

    //set language
    $translatePartialLoader.addPart('NotesAttachmentDetails');
    $translate.refresh();

    
    $scope.AttachmentDetails = items;
    $scope.FileName = $scope.AttachmentDetails.name;
    $scope.UploadDate = $scope.AttachmentDetails.uploadDate;
    $scope.DownloadUrl = $scope.AttachmentDetails.url;
    $scope.cancel=function()
    {
        $scope.$close();
    }
});