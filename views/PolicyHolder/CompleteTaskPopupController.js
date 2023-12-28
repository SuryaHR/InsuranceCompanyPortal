angular.module('MetronicApp').controller('CompleteTaskPopupController', function ($rootScope, $filter, $uibModal, $scope, $timeout, $translate, $translatePartialLoader, objClaim,
    PolicyHolderClaimDetailsService) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translate.refresh();
    $scope.CommonObj = {
        "index":objClaim.index,
        "status":objClaim.status,
        "comment":objClaim.comment,
        "createdBy":objClaim.createdBy,
        "assignedDate":objClaim.assignedDate,
        "taskName":objClaim.taskName,
        "taskId":objClaim.taskId,
        "UserRole":objClaim.UserRole,
        "response":objClaim.response,
        "attachments":(objClaim.attachments ? objClaim.attachments : null),
        "completedDate":objClaim.completedDate
    }
    $scope.files = [];
    $scope.response = '';
    //Cancel
    $scope.cancel = function () {
        $scope.$close("Cancel");
    };
    $scope.SelectNoteFile = SelectNoteFile;
    function SelectNoteFile() {
        angular.element('#NoteFileUpload').trigger('click');
    }
    $scope.getNoteFileDetails = getNoteFileDetails;
    function getNoteFileDetails(event) {
        var files = event.target.files;        
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
            $scope.files.push({ "FileName": e.target.fileName, "FileExtension": e.target.fileExtension, "FileType": e.target.fileType, "Image": e.target.result, "File": e.target.file })
        });
    }
    $scope.RemoveImage = RemoveImage;
    function RemoveImage(item) {
        var index = $scope.files.indexOf(item);
        if (index > -1) {
            $scope.files.splice(index, 1);
        }
    }
    $scope.complete = function (){
        $(".page-spinner-bar").removeClass("hide");
        var data = new FormData();
        if ($scope.files.length > 0) {
            var FileDetails = [];
            angular.forEach($scope.files, function (item) {
                FileDetails.push({
                    "fileName": item.FileName, "fileType": item.FileType,
                    "extension": item.FileExtension,
                    "filePurpose": "CLAIM_TASK", "latitude": null, "longitude": null
                });
                data.append("file", item.File);
            });
            data.append("mediaFilesDetail", JSON.stringify(FileDetails));
        } else {
            data.append("mediaFilesDetail", null);
            data.append("file", null);
        }
        data.append("taskDetails", JSON.stringify({
            "response":$scope.response,
            "taskId":$scope.CommonObj.taskId
        }));
        var getpromise = PolicyHolderClaimDetailsService.completeTask(data);
        getpromise.then(function (success) {
            $scope.Status = success.data.status;
            if ($scope.Status == 200) {
                $scope.$close("Success");
                toastr.remove();
                $(".page-spinner-bar").addClass("hide");
                toastr.success(success.data.message, "Confirmation");
            }
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
            $scope.ErrorMessage = error.data.errorMessage;
        });
    }
    $scope.GetDocxDetails = function (item) {
        $scope.pdf = true;
        $scope.showDownload = true;
        $scope.showDelete = true;
        $scope.currentPDFUrl = $scope.pdfUrl;
        $scope.pageToDisplay = 1;
        $scope.pageNum = 1;
        $scope.isPDF = 0;
        $scope.DocxDetails = item;
        if ($scope.DocxDetails.isLocal) {
            $scope.showDownload = false;
            $scope.DocxDetails.url = item.Image;
        } else {
            //If attachment uploaded by is not available or current logged in user is not a claim supervisor
            //hide delete button
            if (!item.uploadBy || ($scope.CommonObj.UserId != item.uploadBy.id && $scope.CommonObj.UserRole != 'CLAIM SUPERVISOR'))
                $scope.showDelete = false;
        }
        $scope.ReceiptList = $scope.DocxDetails.url;
        $scope.pdfUrl = $scope.ReceiptList;
        var pdf = ["pdf", "application/pdf"];
        var img = ["image", "application/image", "image/png", "image/jpeg", "image/gif", "png", "jpg", "jpeg", "gif", "image", "PNG", "JPEG", "GIF", "JPG"];
        $scope.imgDiv = true;
        if (pdf.indexOf((($scope.DocxDetails.claimFileType ? $scope.DocxDetails.claimFileType : $scope.DocxDetails.FileType).toLowerCase())) > -1) {
            $scope.isPDF = 1;
        }
        else if (img.indexOf((($scope.DocxDetails.claimFileType ? $scope.DocxDetails.claimFileType : $scope.DocxDetails.FileType).toLowerCase())) > -1) {
            $scope.isPDF = 2;
        }
        else {
            $scope.isPDF = 0;
            var downloadLink = angular.element('<a></a>');
            downloadLink.attr('href', $scope.DocxDetails.url);
            downloadLink.attr('target', '_self');
            downloadLink.attr('download', (($scope.DocxDetails.FileName != null && angular.isDefined($scope.DocxDetails.FileName) && $scope.DocxDetails.FileName !== "") ? $scope.DocxDetails.FileName : "Document"));
            downloadLink[0].click();
        }
        window.setTimeout(function () {
            $("#img_preview").css({
                'right': $('.page-wrapper-middle').offset().left + 'px'
            }).show();
        }, 100);
    }
    $scope.close = function () {
        $("#img_preview").hide();
    }
    var zoomFactor = 100;
$scope.largeMe = largeMe;
function largeMe() {
    zoomFactor += 5;
    document.getElementById('imagepre').style.zoom = zoomFactor + "%";
}
$scope.smallMe = smallMe;
function smallMe() {
    zoomFactor -= 5;
    document.getElementById('imagepre').style.zoom = zoomFactor + "%";
}
$scope.downloadFile = function (data) {
    fetch(data.url).then(function (t) {
        return t.blob().then((b) => {
            var a = document.createElement("a");
            a.href = URL.createObjectURL(b);
            a.setAttribute("download", data.name);
            a.click();
        }
        );
    });
}
$scope.isPdf = function (fileName) {
    if (/\.(pdf|PDF)$/i.test(fileName)) {
        return true;
    }
}
$scope.isImage = function (fileName) {
    if (/\.(jpe?g|png|gif|bmp)$/i.test(fileName)) {
        return true;
    }
}
$scope.isExcel = function (fileName) {
    if (/\.(xls|xlsx)$/i.test(fileName)) {
        return true;
    }
}
$scope.isDocx = function (fileName) {
    if (/\.(docx|doc)$/i.test(fileName)) {
        return true;
    }
}

})