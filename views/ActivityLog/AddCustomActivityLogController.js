angular.module('MetronicApp').controller('AddCustomActivityLogController', function ($translate, $translatePartialLoader, $rootScope, $scope, LineItemService, ActivityLogService, objClaim) {

    $translatePartialLoader.addPart('AddCustomItem');
    $translate.refresh();
    $scope.NoImagePath = $rootScope.$settings.NoImagePath;
    $scope.editCustomItem = false;
    // $scope.viewedByAll = true;
    // $scope.selectedEvent = null;
    $scope.CommonObj = {
        "ClaimId": objClaim.ClaimId,
        // "ActivityEventsList": objClaim.ActivityEventsList,
        "ParticipantList": objClaim.ParticipantList,
    };

    console.log("ParticipantList", objClaim.ParticipantList);
    $scope.cancel = function () {
        $scope.$close();
    };
   
    $scope.Base64Image=""
    $scope.addPublishActivity = addPublishActivity;
    function addPublishActivity() {
        $(".page-spinner-bar").removeClass("hide");
        
        var realData;
        // var form = document.getElementById("AddItem");

        // var image = document.getElementById("customImage").src;
        // var block = image.split(";");      
        // var contentType = block[0].split(":")[1];// In this case "image/gif"     
        // var realData = block[1].split(",")[1];// In this case "R0lGODlhPQBEAPeoAJosM...."  
        // $scope.Base64Image = block[1].split(",")[1];// In this case "R0lGODlhPQBEAPeoAJosM...."
        
        var messageReceipient = [];
        var internal = true;
        if ($scope.CommonObj.ParticipantList.length > 0) {           
                angular.forEach($scope.CommonObj.ParticipantList, function (item) {                    
                        if (item.participantType.participantType.toUpperCase() == 'EXTERNAL' ||
                            item.participantType.participantType.toUpperCase() == 'EXISTING VENDOR' ||
                            item.participantType.participantType.toUpperCase() == 'NEW VENDOR'
                            // item.participantType.participantType.toUpperCase() == 'VENDOR ASSOCIATE' ||
                            // item.participantType.participantType.toUpperCase() == 'POLICY HOLDER' || 
                            // item.participantType.participantType.toUpperCase() == 'GEMLAB ASSOCIATE' || 
                            // item.participantType.participantType.toUpperCase() == 'CLAIM REPRESENTATIVE'
                            ) {
                            internal = false;
                            registration = item.vendorRegistration;
                            messageReceipient.push({
                                "participantId": item.participantId, "email": item.emailId, "participantType": { "id": item.participantType.id, "participantType": item.participantType.participantType }, "vendorRegistration": item ? item.vendorRegistration : null
                            });
                            // if($scope.viewedByAll == true){
                            //     messageReceipient.push({
                            //         "participantId": item.participantId, "email": item.emailId, "participantType": { "id": item.participantType.id, "participantType": item.participantType.participantType }, "vendorRegistration": item ? item.vendorRegistration : null
                            //     });
                            // } 
                        }
                        else {
                            messageReceipient.push({
                                "participantId": item.participantId, "email": item.emailId, "participantType": { "id": item.participantType.id, "participantType": item.participantType.participantType }
                            });
                        }                    
                });            
        }


         var param = new FormData();        
        //Request to add quick custom item
        param.append("customActivity", JSON.stringify({
            "id": null,            
            "description": $scope.ActivityDetails.Description,
            "claim": {
                "claimId": $scope.CommonObj.ClaimId
            },
            "participants": messageReceipient,
            "companyURL" : sessionStorage.getItem("CRN"),
            "activityEvent":4,
            // "viewedByAll": $scope.viewedByAll

        }));

        if ($scope.attachmentList && $scope.attachmentList.File) {
            var fileDetaills = [{
                "extension": $scope.attachmentList.FileExtension,
                "fileName": $scope.attachmentList.FileName,
                "filePurpose": "CUSTOM_ACTIVITY_LOG",
                "fileType": $scope.attachmentList.FileType
            }];
            param.append('filesDetails', JSON.stringify(fileDetaills));
            param.append('file', $scope.attachmentList.File);
        } else {
            param.append('filesDetails', []);
            param.append('file', []);
        }
      
        
       
        //Add/Update quick addcustom item
        var addCustomActivityLogOnId = ActivityLogService.AddCustomActivityLog(param);
        addCustomActivityLogOnId.then(function (success) {
                $(".page-spinner-bar").addClass("hide");
                $scope.$close("Success");
            }, function (error) {
                $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
           // $scope.$close("Success");
        });

    };



     //File Upload for attachment
     $scope.AddAttachment = function () {
        angular.element('#FileUpload').trigger('click');
    }
    $scope.displayAddImageButton = false;
    $scope.getAttachmentDetails = function (e) {
        $scope.displayAddImageButton = true;
        $scope.$apply(function () {
            var files = event.target.files;
            $scope.filed = event.target.files;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                // var reader = new FileReader();
                // reader.file = file;
                // reader.fileName = files[i].name;
                // reader.fileType = files[i].type;
                // reader.fileExtension = files[i].name.substr(files[i].name.lastIndexOf('.'));
                // reader.onload = $scope.LoadFileInList;
                // reader.readAsDataURL(file);
                var fileExtension = file.name.substr(file.name.lastIndexOf('.'));
                var size = file.size;
                if(['.jpeg','.png','.jpg','.xls','.xlsx','.pdf','.doc','.docx'].includes(fileExtension.toLowerCase()))
                {              
                    if(size <= 20000000)
                    {
                        var reader = new FileReader();
                        reader.file = file;
                        reader.fileName = files[i].name;
                        reader.fileType = files[i].type;
                        reader.fileExtension = files[i].name.substr(files[i].name.lastIndexOf('.'));
                        reader.onload = $scope.LoadFileInList;
                        reader.readAsDataURL(file);
                        $scope.showAttachmentErro = false;

                        angular.element("#FileUpload1").val(null);
                    }
                    else
                    {
                        toastr.remove()
                        toastr.error("file size exceeded . Please upload image below 20Mb", $translate.instant("File Size")); 
                    }
                }
                else
                {
                    toastr.remove()
                    toastr.warning("File type jpg ,jpeg ,png ,word ,excel ,pdf  is supported", $translate.instant("File Format")); 
                }   
            }
            angular.element("#FileUpload").val(null);
        });
        //$scope.itemForm.contents.$setDirty();
    };
     //Item form object
     $scope.itemForm = {};
    $scope.attachmentList = undefined;
    $scope.LoadFileInList = function (e) {
        var isFileExist = false;
        angular.forEach($scope.attachmentList, function (file) {
            if (e.target.fileName === file.FileName)
                isFileExist = true
        });
        // angular.forEach($scope.attachmentListEdit, function (file) {
        //     if (e.target.fileName === file.FileName)
        //         isFileExist = true
        // });
        if (isFileExist) {
            toastr.remove();
            toastr.warning("Attachment with name '" + e.target.fileName + "' already exists");
        }
        else {
            $scope.$apply(function () {
                $scope.attachmentList=
                    {
                        "FileName": e.target.fileName, "FileExtension": e.target.fileExtension, "FileType": e.target.fileType,
                        "Image": e.target.result, "File": e.target.file, "isLocal": true
                }
                $scope.attachmentListEdit = {}
                $scope.CreateCustomActivity.$pristine = false;
            });
        }
    }
    $scope.isPdf = function (fileName) {
        if (/\.(pdf|PDF)$/i.test(fileName)) {
            return true;
        }
    }

    $scope.isExcel = function (fileName) {
        if (/\.(xls|xlsx)$/i.test(fileName)) {
            return true;
        }
    }

    $scope.isImage = function (fileName) {
        if (/\.(jpe?g|png|gif|bmp)$/i.test(fileName)) {
            return true;
        }
    }


    //Attachments preview
    $scope.GetDocxDetails = function (item) {
        $scope.showDownload = true;
        $scope.showDelete = true;
        $scope.pdf = true;
        $scope.currentPDFUrl = $scope.pdfUrl;
        $scope.pageToDisplay = 1;
        $scope.pageNum = 1;
        $scope.isPDF = 0;
        $scope.DocxDetails = item;
        if ($scope.DocxDetails.isLocal) {
            $scope.showDownload = false;
            $scope.DocxDetails.url = item.Image;
        }
        // else
        //     $scope.showDelete = true;
        $scope.ReceiptList = $scope.DocxDetails.url;
        $scope.pdfUrl = $scope.ReceiptList;
        var pdf = ["pdf", "application/pdf"];
        var img = ["image", "application/image", "image/png", "image/jpeg", "image/gif", "png", "jpg", "jpeg", "gif", "image", "PNG", "JPEG", "GIF", "JPG"];
        $scope.imgDiv = true;
        if (pdf.indexOf(($scope.DocxDetails.FileType.toLowerCase())) > -1) {
            $scope.isPDF = 1;
        }
        else if (img.indexOf(($scope.DocxDetails.FileType.toLowerCase())) > -1) {
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
            // $("#img_preview").show();
        }, 100);

    }

    $scope.close = function () {
        $("#img_preview").hide();
    }

    // Remove attachment
    $scope.removeAttachments = removeAttachments;
    function removeAttachments() {
        var removeAttachmentDetails = ThirdPartyLineItemDetailsService.removeAttachments($scope.attachmentsRmvd);
        removeAttachmentDetails.then(function (success) {
            toastr.remove()
            toastr.success(success.data.message, $translate.instant("ItemEditSuccessHeading"));
            getAttachment();
            $scope.cancelAttachment();

        }, function (error) {
            toastr.remove()
            toastr.error(error.data.errorMessage, $translate.instant("ErrorHeading"));
        });
    }

    $scope.getAttachment = getAttachment;
    function getAttachment(attachments) {
        $scope.attachmentListEdit = [];
        angular.forEach(attachments, function (ItemFile) {
            $scope.attachmentListEdit.push(
                {
                    "id": ItemFile.id, "FileName": ItemFile.name, "FileType": ItemFile.type, "url": ItemFile.url,
                    "uploadDate": ItemFile.uploadDate
                });
        });
    }

    $scope.RemoveAttachment = RemoveAttachment;
    function RemoveAttachment(index) {
        if ($scope.attachmentList.length > 0) {
            $scope.attachmentList.splice(index, 1);
            angular.element("#FileUpload").val(null);
        }
        $scope.imgDiv = false;
    }

    $scope.attachmentsRmvd = [];
    $scope.RemoveEditAttachment = RemoveEditAttachment;
    function RemoveEditAttachment(index) {
        $scope.attachmentList = {}
    }
    $scope.RemoveEditImage = RemoveEditImage;
    function RemoveEditImage() {
        $scope.attachmentListEdit = []
    }

      

    $scope.deleteItemAttachment = deleteItemAttachment;
    function deleteItemAttachment(id) {
        bootbox.confirm({
            size: "",
            closeButton: false,
            title: "Delete",
            message: "Are you sure you want to delete this attachment? <b>Please Confirm!",
            className: "modalcustom", buttons: {
                confirm: {
                    label: 'Yes',
                    className: 'btn-outline green'
                },
                cancel: {
                    label: 'No',
                    className: 'btn-outline red'
                }
            },
            callback: function (result) {
                //if (result)  call delet function
                if (result) {
            $(".page-spinner-bar").removeClass("hide");
                var deleteItemAttachmentSuccess =  LineItemService.deleteMediaFile(id);
                deleteItemAttachmentSuccess.then(function (success) {
                     $(".page-spinner-bar").addClass("hide");
                    $scope.$close("Success");
                    toastr.remove();
                    toastr.success(success.data.message, "Confirmation");
                    }, function (error) {
                    toastr.remove();
                    toastr.error(error.data.errorMessage, "Error");
                });
                }
            }
        });
    }

    function init() {
        if (objClaim && objClaim.CustomItem) {
            $scope.editCustomItem = true;
            $scope.ActivityDetails = {}
            $scope.ActivityDetails.Description = null;
            $scope.ActivityDetails.id = null;
            $scope.attachmentListEdit = [];
            //$scope.attachmentListEdit.push(objClaim.CustomItem?.imageURL);
        }
    } init();

    // $scope.changeViewedToAll = changeViewedToAll;
    // function changeViewedToAll (){
    //     $scope.viewedByAll = true;
    // }

    // $scope.changeViewedToInternal = changeViewedToInternal;
    // function changeViewedToInternal (){
    //     $scope.viewedByAll = false;
    // }

    // $scope.selectActivityEvent = function (event) {
    //     if (event) {
    //         $scope.selected.event = {
    //             "id": event.id,
    //             "eventName": event.roomName
    //         }
    //     } else
    //         $scope.selected.event = null;
    // }

    $scope.isPdf = function (fileName) {
        if(fileName){
            if (/\.(pdf)$/i.test(fileName.toLowerCase())) {
                return true;
            }
        }   
        return false;     
    }
    $scope.isImage = function (fileName) {
        if(fileName){
            if (/\.(jpe?g|png|gif|bmp)$/i.test(fileName.toLowerCase())) {
                return true;
            }
        }        
    }
    $scope.isExcel = function (fileName) {
        if(fileName){
            if (/\.(xls|xlsx)$/i.test(fileName.toLowerCase())) {
                return true;
            }
        }
        return false; 
    }
    $scope.isDocx = function (fileName) {
        if(fileName){
            if (/\.(docx|doc)$/i.test(fileName.toLowerCase())) {
                return true;
            }
        }   
        return false;      
    }
    $scope.isVideo = function (fileName) {
        if(fileName){
            if (/\.(mp4|flv|ogg|3gp|webm)$/i.test(fileName.toLowerCase())) {
                return true;
            }
        }  
        return false;       
    }
});