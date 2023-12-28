angular.module('MetronicApp').controller('UploadClaimFromCSVController', function ($translate, $window, $timeout, $interval, $translatePartialLoader, $rootScope, $log, $scope,
    settings, UploadClaimFromCSVService, $filter) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $scope.fileControl;
    $translatePartialLoader.addPart('UploadClaimFromCSV');
    $translate.refresh();
    $scope.ErrorMessage = "";
    $scope.FileDetails = {
        FileName: null,
        FileType: null,
        FileExtension: null,
        Files: []
    };
    $scope.showProgress = true;
    $scope.stepScreen = false;
    $scope.VerifyScreen = false;
    //$scope.StatusScreen = false;
    $scope.FinishScreen = false;
    $scope.uploader = {
        "progress": 5
    };
    $scope.TemplateURL = angular.isDefined(sessionStorage.getItem("ClaimTemplate")) && sessionStorage.getItem("ClaimTemplate") != null ? sessionStorage.getItem("ClaimTemplate") : null;
    $scope.UploadedFile = [];
    var type = "success";
    $scope.Itemlist = [];
    $scope.isError = true;
    $scope.init = init;
    function init() {
        $scope.ClaimNumber = 123;//sessionStorage.getItem("UploadClaimNo");
        if (angular.isDefined($scope.ClaimNumber) && $scope.ClaimNumber !== null) {
            $scope.stepScreen = true;
            $scope.VerifyScreen = false;
            //$scope.StatusScreen = false;
            $scope.FinishScreen = false;
        }
        else
            $window.history.back();
    }
    $scope.init();

    //Upload file form here
    $scope.StartUpload = StartUpload;
    function StartUpload() {
        //Hide show div
        $scope.stepScreen = false;
        $scope.VerifyScreen = true
        //$scope.StatusScreen = false;
        $scope.FinishScreen = false;

        $scope.Itemlist = [];

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
        var UploadFile = UploadClaimFromCSVService.UploadClaimFromExcelFile(data);
        UploadFile.then(function (success) {
            $scope.uploader.progress = 100;
            $interval.cancel($scope.timer);
            HideProgressBar();
            $scope.stepScreen = false;
            $scope.VerifyScreen = true
            $scope.StatusScreen = false;
            $scope.FinishScreen = false;
            $scope.Itemlist = success.data.data.claimDetails;
        },
            function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
                $scope.ErrorMessage = error.data.errorMessage;
            });
        $scope.stepScreen = false;
        $scope.VerifyScreen = true
        $scope.StatusScreen = false;
        $scope.FinishScreen = false;
    }

    //Cancel verify 
    $scope.CancelVerify = CancelVerify;
    function CancelVerify() {
        $scope.stepScreen = true;
        $scope.VerifyScreen = false
        $scope.StatusScreen = false;
        $scope.FinishScreen = false;
        CancelFileUpload();
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

        //Call API to upload item list
        var ClaimDetails = [];
        angular.forEach($scope.Itemlist, function (item) {
            
            ClaimDetails.push({

                "id": item.id,
                "incidentDate": item.incidentDate,
                "policyNumber": item.policyNumber,
                "accountNumber": item.accountNumber,
                "homeOwnerPolicyType": item.homeOwnerPolicyType,
                "policyHolderFirstName": item.policyHolderFirstName,
                "policyHolderLastName": item.policyHolderLastName,
                "email": item.email,
                "dayTimePhone": item.dayTimePhone,
                "eveningTimePhone": item.eveningTimePhone,
                "cellPhone": item.cellPhone,
                "address": {
                    "city": item.address.city,
                    "id": null,
                    "state": {
                        "id": null,
                        "state": item.address.state.state
                    },              
                    "streetAddressOne": item.address.streetAddressOne,
                    "streetAddressTwo": item.address.streetAddressTwo,
                    "zipcode": item.address.zipcode,
                    "completeAddress": item.address.completeAddress
                },
                "claimNumber": item.claimNumber,
                "taxRate": item.taxRate,
                "replacementOption": item.replacementOption,
                "claimReportDate": item.claimReportDate,
                "damageType": item.damageType,
                "reportDetails": item.reportDetails,
                "additionalNotes": item.additionalNotes

            });

        });
       
        
        var UploadItem = UploadClaimFromCSVService.UploadClaimList(ClaimDetails);
        UploadItem.then(function (success) {
            
            StopProgressBarShowFinal();
            HideProgressBar();
            $scope.RowCount = success.data.data.rowProcessed == null ? 0 : success.data.data.rowProcessed;
            $scope.newRecoredInsertedCount = success.data.data.newCreated == null ? 0 : success.data.data.newCreated;
            $scope.UpdateCount = success.data.data.updated == null ? 0 : success.data.data.updated;
            $scope.FialedItem = success.data.data.rejectedClaimDetails == null ? 0 : success.data.data.rejectedClaimDetails.length;
            if ($scope.RowCount == $scope.newRecoredInsertedCount) {
                toastr.remove();
                toastr.success("Claim details uploaded successfully.", "Confirmation");
            }
            else {
                toastr.remove();
                toastr.error("Some items could not be updated. Please try again..", "Error");
            }
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
        StopProgressBarShowFinal();
           HideProgressBar();

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
    //Last step of file upload
    $scope.Done = Done;
    function Done() {
        toastr.remove();
        $scope.stepScreen = true;
        $scope.VerifyScreen = false
        //$scope.StatusScreen = false;
        $scope.FinishScreen = false;
        CancelFileUpload();
    }

    //Sorting for table   
    $scope.reverse = true
    $scope.sort = function (colname) {
        $scope.reverse = !($scope.reverse);
        $scope.Itemlist = $filter('orderBy')($scope.Itemlist, colname, $scope.reverse)
    }

    //trigger fileupload
    $scope.FileUploadEvent = FileUploadEvent;
    function FileUploadEvent() {
        $scope.Itemlist = [];
        angular.element('#FileUpload').trigger('click');
    }
    //Get attached file details
    $scope.FileSupported = [".xls", ".xlsx", ".csv"];
    $scope.getFileDetails = function (e) {
        $scope.$apply(function () {
            $scope.ErrorMessage = "";
            $scope.isError = true;
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
    //Reomve file details from object
    function CancelFileUpload() {
        $scope.FileDetails = {
            FileName: null,
            FileType: null,
            FileExtension: null,
            Files: []
        };
        $window.history.back();
    }
    //Go to claim details page form wher it redirect to this page
    $scope.GoBack = function () {
        
        $scope.FileDetails = {
            FileName: null,
            FileType: null,
            FileExtension: null,
            Files: []
        };
        $window.history.back();
    }
});
