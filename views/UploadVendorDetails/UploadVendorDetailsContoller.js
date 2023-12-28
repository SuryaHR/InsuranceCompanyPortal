angular.module('MetronicApp').controller('UploadVendorDetailsContoller', function ($translate, $window, $translatePartialLoader, $rootScope, $scope, $location, $interval,
    UploadVendorDetailsService, $filter, $timeout) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $scope.fileControl;
    $translatePartialLoader.addPart('UploadVendorDetails');
    $translate.refresh();
    $scope.ErrorMessage = "";
    $scope.FileDetails = {
        FileName: null,
        FileType: null,
        FileExtension: null,
        Files: []
    };
    $scope.stepScreen = true;
    $scope.VerifyScreen = false
    $scope.FinishScreen = false;
    //trigger fileupload
    $scope.FileUploadEvent = FileUploadEvent;
    function FileUploadEvent() {
        $scope.Itemlist = [];
        angular.element('#FileUpload').trigger('click');
    }
    $scope.TemplateURL = angular.isDefined(sessionStorage.getItem("VendorDetailsTemplate")) && sessionStorage.getItem("VendorDetailsTemplate") != null ? sessionStorage.getItem("VendorDetailsTemplate") : null;
    //Get attached file details
    $scope.FileSupported = [".xls", ".xlsx", ".csv"];
    $scope.getFileDetails = function (e) {
        $scope.$apply(function () {
            $scope.ErrorMessage = "";
            $scope.isError = true;
            $scope.FileDetails;
            $scope.FileDetails.FileName = e.files[0].name;
            $scope.FileDetails.FileType = e.files[0].type;
            $scope.FileDetails.FileExtension = $scope.FileDetails.FileName.substr($scope.FileDetails.FileName.lastIndexOf('.'));
            $scope.FileDetails.Files.push(e.files[0]);
            fr = new FileReader();
            //fr.onload = receivedText;

            fr.readAsDataURL(e.files[0]);
            if ($scope.FileSupported.indexOf(($scope.FileDetails.FileExtension).toLowerCase()) === -1) {
                $scope.isError = true;
                $scope.FileDetails = {
                    FileName: null,
                    FileType: null,
                    FileExtension: null,
                    Files: []
                };
                fr = null;
                toastr.remove();
                toastr.warning("Please select xls, xlsx Or csv file..", "File type");
                $scope.ErrorMessage = ""
            }
            else {
                $scope.isError = false;
            }
        });
    };
    //Go to claim details page form wher it redirect to this page
    $scope.GoBack = function () {
        $scope.FileDetails = {
            FileName: null,
            FileType: null,
            FileExtension: null,
            Files: []
        };
        // $location.url('\ThirdPartyVendor')
        $location.url('ContractedVendor')
    }
    //Reomve file details from object
    function CancelFileUpload() {
        $scope.FileDetails = {
            FileName: null,
            FileType: null,
            FileExtension: null,
            Files: []
        };
    }
    //Upload file form here
    $scope.StartUpload = StartUpload;
    function StartUpload() {
        $scope.VendorList = [];
        //show progress bar
        $scope.showProgress = true;
        $scope.uploader = { "progress": 20 }
        $scope.timer = $interval(function () {
            if (parseInt($scope.uploader.progress) < 90) {
                $scope.uploader.progress = parseInt($scope.uploader.progress) + 10;
            }
        }, 600);

        var data = new FormData();
        data.append("file", $scope.FileDetails.Files[0]);
        var UploadFile = UploadVendorDetailsService.UploadVendorDetailsFile(data);
        UploadFile.then(function (success) {
            $scope.uploader.progress = 100;
            $interval.cancel($scope.timer);
            $scope.VendorList = success.data.data.readOrImportVendorDetails;

            $timeout(function () {
                $scope.stepScreen = false;
                $scope.VerifyScreen = true
                $scope.FinishScreen = false;
            }, 500);
        },
            function (error) {
                $scope.uploader.progress = 100;
                $interval.cancel($scope.timer);
                $scope.showProgress = false;
                toastr.remove();
                toastr.error((error.data.errorMessage !== null) ? error.data.errorMessage : "Failed to upload the file. Please try again.", "Error");
                $scope.ErrorMessage = error.data.errorMessage;
            });

    }
    //Cancel verify 
    $scope.CancelVerify = CancelVerify;
    function CancelVerify() {
        CancelFileUpload();
        $scope.stepScreen = true;
        $scope.VerifyScreen = false
        $scope.FinishScreen = false;
        $scope.uploader.progress = 0;
        $scope.showProgress = false;

    }
    //Sort table

    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed    
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

    //Grid display of items
    $scope.Verify = Verify;
    function Verify() {
        $scope.showProgress = true;
        $scope.stepScreen = false
        $scope.VerifyScreen = false
        //$scope.StatusScreen = true;
        $scope.FinishScreen = true;
        $scope.uploader = { "progress": 20 }
        $scope.timer = $interval(function () {
            if (parseInt($scope.uploader.progress) < 80) {
                $scope.uploader.progress = parseInt($scope.uploader.progress) + 10;
            }
        }, 600);
        var paramList = $scope.VendorList;
        var UploadItem = UploadVendorDetailsService.SaveVendorDetails(paramList);
        UploadItem.then(function (success) {
            StopProgressBarShowFinal();
            HideProgressBar();
            $scope.RowCount = success.data.data.rowProcessed;
            $scope.newRecoredInsertedCount = ((success.data.data.newCreated > 0) ? success.data.data.newCreated : 0);
            $scope.UpdateCount = ((success.data.data.updated > 0) ? success.data.data.updated : 0);
            $scope.FialedItem = ((success.data.data.rejectedVendorDetails !== null) ? success.data.data.rejectedVendorDetails.length : 0);
        }, function (error) {
            StopProgressBarShowFinal();
            HideProgressBar();
            if (angular.isDefined(error.data)) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
                $scope.RowCount = 0;
                $scope.newRecoredInsertedCount = 0;
                $scope.UpdateCount = 0;
                $scope.FialedItem = 0;
            } else {
                toastr.remove();
                toastr.error("Failed to process the items. Please try again..", "Error");
                $scope.RowCount = 0;
                $scope.newRecoredInsertedCount = 0;
                $scope.UpdateCount = 0;
                $scope.FialedItem = 0;
            }
        });

    }
    function StopProgressBarShowFinal() {
        $interval.cancel($scope.timer);
        $scope.uploader.progress = 100;
        $scope.stepScreen = false;
        $scope.VerifyScreen = false
        //$scope.StatusScreen = false;
        $scope.FinishScreen = true;
    }

    function HideProgressBar() {
        $timeout(function () { $scope.showProgress = false; }, 700);

    }
    $scope.Done = Done;
    function Done() {
        toastr.remove();
        $location.url('\ThirdPartyVendor');
    }
});