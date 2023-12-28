angular.module('MetronicApp').controller('AddNewCustomItemController', function ($rootScope, $filter, $uibModal, $scope, $translate, $translatePartialLoader,
    objClaim) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('AddCustomItem');
    $translate.refresh();
    $scope.SubCustomItem = {};
    $scope.SubCustomItem.taxRate = 0.00;
    $scope.SubCustomItem.quantity = 1;
    $scope.cancel = function () {
       
        $scope.$close();
    };
    $scope.Ok = function () {
        $scope.SubCustomItem.attachment = $scope.IncidentImages;
        $scope.$close($scope.SubCustomItem);
    };

    //upload image
    $scope.IncidentImages = [];
    $scope.uploadImage = uploadImage;
    function uploadImage(event) {
        var files = event.target.files;
        $scope.filed = event.target.files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.file = file;
            reader.fileName = files[i].name;
            reader.fileType = files[i].type;
            reader.fileExtension = files[i].name.substr(files[i].name.lastIndexOf('.'));
            reader.onload = $scope.imageIsLoaded;
            reader.readAsDataURL(file);
        }
    }
    $scope.imageIsLoaded = function (e) {
        $scope.$apply(function () {
            $scope.IncidentImages.push({ "name": e.target.fileName, "FileExtension": e.target.fileExtension, "FileType": e.target.fileType, "Image": e.target.result, "File": e.target.file })

        });
    };
    $scope.RemoveImage = RemoveImage;
    function RemoveImage(item) {

        var index = $scope.IncidentImages.indexOf(item);

        if (index > -1) {

            $scope.IncidentImages.splice(index, 1);
        }
    };
    //Open file upload control
    $scope.FireUploadEvent = FireUploadEvent;
    function FireUploadEvent() {
        angular.element('#FileUpload').trigger('click');
    };
    $scope.SubCustomItem.totalCost = 0.00;
    $scope.GetTotalcost = GetTotalcost;
    function GetTotalcost()
    {
        $scope.SubCustomItem.totalCost = 0.00;
        var Cost = parseInt($scope.SubCustomItem.quantity) * parseInt($scope.SubCustomItem.unitPrice);
        //as per the discussion not considering tax rate
        //var TaxValue = ((parseInt($scope.SubCustomItem.taxRate) /100 ) * Cost);
        $scope.SubCustomItem.totalCost = Cost + 0.00;
       
    }
});