angular.module('MetronicApp').controller('ShowClaimAttachmentController', function ($rootScope, $scope, settings, $filter, $http, $timeout, $location, $translate, $translatePartialLoader, items) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });

    //set language
    $translatePartialLoader.addPart('ClaimAttachmentDetails');
    $translate.refresh();
    
  
    $scope.FileName = items.name;
    $scope.Purpose = items.purpose;
    $scope.Type = items.type;
    $scope.UploadDate = $filter('date')(items.uploadDate, "dd/MM/yyyy");
    $scope.DownloadUrl = items.url;
    $scope.cancel = function () {
        $scope.$close();
    }
});