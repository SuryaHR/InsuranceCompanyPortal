angular.module('MetronicApp').controller('ClaimDocumentsController', function ($scope, $translate, $translatePartialLoader, ClaimDocumentsService, AuthHeaderService, $filter) {
    $translatePartialLoader.addPart('ClaimDocuments');
    $translate.refresh();

    $scope.currentAttchment = null;
    // Claim Documents
    var docPage = 1;
    var docLimit = 13;
    var newDocumentObj = {
        "totalAttachments": 0,
        "attachments": []
    }
    var currentClaimDocsPage = 1;
    var currentItemDocsPage = 1;
    var currentReceiptDocsPage = 1;
    var currentInvoiceDocsPage = 1;
    var currentOtherDocsPage = 1;
    $scope.attachmentList = [];
    $scope.searchDocuments = {
        keyword: ""
    }
    getClaimAttachments();

    $scope.searchDocuments = function () {
        currentClaimDocsPage = 1;
        currentItemDocsPage = 1;
        currentReceiptDocsPage = 1;
        currentInvoiceDocsPage = 1;
        currentOtherDocsPage = 1;
        getClaimAttachments();
    }

    function getClaimAttachments(page, limit, type) {
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "claimNumber": $scope.CommonObj.ClaimNumber,
            "page": docPage,
            "limit": docLimit,
            "type": 'All',
            "keyword": $scope.searchDocuments.keyword ? $scope.searchDocuments.keyword : ""
        }
        var getpromise = ClaimDocumentsService.getClaimAttachments(param);
        getpromise.then(function (success) {
            let docResponse = success.data.data;
            if (docResponse) {
                $scope.claimAttachments = docResponse.claimAttachments ? docResponse.claimAttachments : angular.copy(newDocumentObj);
                $scope.claimItemsAttachments = docResponse.claimItemsAttachments ? docResponse.claimItemsAttachments : angular.copy(newDocumentObj);
                $scope.receiptAttachments = docResponse.receiptAttachments ? docResponse.receiptAttachments : angular.copy(newDocumentObj);
                $scope.invoiceAttachments = docResponse.invoiceAttachments ? docResponse.invoiceAttachments : angular.copy(newDocumentObj);
                $scope.otherAttachments = docResponse.otherAttachments ? docResponse.otherAttachments : angular.copy(newDocumentObj);
            }
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            $scope.ErrorMessage = error.data.errorMessage;
            toastr.remove();
            toastr.error($scope.ErrorMessage, "Error")
        });
    }

    //for claim attachment
    $scope.SelectClaimFile = function (event, filepurpose) {
        if ($scope.currentAttchment != filepurpose && $scope.attachmentList.length > 0) {
            event.stopPropagation();
            toastr.remove();
            toastr.warning('Please save previously added documents before proceeding.')
            return false;
        }
        if (filepurpose === 'CLAIM_RECEIPT')
            angular.element('#receiptFileUpload').trigger('click');
        else
            angular.element('#claimFileUpload').trigger('click');
        $scope.currentAttchment = filepurpose;
    }

    //Add claim attachment
    $scope.AddClaimAttachment = function () {
        $(".page-spinner-bar").removeClass("hide");
        var data = new FormData();
        data.append("claimDetail", JSON.stringify({ "claimNumber": $scope.CommonObj.ClaimNumber }))
        var filesDetails = [];
        angular.forEach($scope.attachmentList, function (ItemFile) {
            filesDetails.push({
                "fileName": ItemFile.FileName,
                "fileType": ItemFile.FileType,
                "extension": ItemFile.FileExtension,
                "filePurpose": ItemFile.Purpose,
                "latitude": null,
                "longitude": null,
                "description": ItemFile.description
            });
            data.append('file', ItemFile.File);
        });
        data.append('filesDetails', JSON.stringify(filesDetails));
        if ($scope.attachmentList.length == 0 || $scope.attachmentList == null) {
            data.append('filesDetails', null);
            data.append('file', null);
        };
        var getpromise = ClaimDocumentsService.addClaimAttachment(data);
        getpromise.then(function (success) {
            //get saved attachments from response
            let response = success.data;
            if (response) {
                $scope.CommonObj.claimNote = "";
                $scope.ClaimfileName = '';
                angular.element("input[type='file']").val(null);
                $scope.displayClaimFileName = false;
                $scope.displayAddAttachmentbtn = true;
                mapSavedAttachmentToList($scope.currentAttchment, response.data);
                $scope.cancelAttachment();
            }
            toastr.remove();
            toastr.success(response.message, "Confirmation")
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.error((angular.isDefined(error.data) && angular.isDefined(error.data.errorMessage) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage()), "Error");
        });
    }
    //clear attachments
    $scope.ClearAttachments = function () {
        angular.element("input[type='file']").val(null);
        $scope.displayClaimFileName = false;
        $scope.displayAddAttachmentbtn = true;
    }
    function mapSavedAttachmentToList(purpose, savedAttachments) {
        let tempImg = {};
        angular.forEach(savedAttachments, function (image) {
            tempImg = {
                "id": image.imageId,
                "name": image.name,
                "purpose": image.filePurpose,
                "type": image.claimFileType,
                "url": image.url,
                "uploadDate": image.uploadDate,
                "uploadBy": image.uploadBy,
                "description": image.description
            }
            if (purpose === 'CLAIM') {
                $scope.claimAttachments.attachments.unshift(tempImg);
                $scope.claimAttachments.totalAttachments += 1;
            }
            else if (purpose === 'CLAIM_ITEM') {
                $scope.claimItemsAttachments.attachments.unshift(tempImg);
                $scope.claimItemsAttachments.totalAttachments += 1;
            }
            else if (purpose === 'CLAIM_RECEIPT') {
                $scope.receiptAttachments.attachments.unshift(tempImg);
                $scope.receiptAttachments.totalAttachments += 1;
            }
            else if (purpose === 'CLAIM_INVOICE') {
                $scope.invoiceAttachments.attachments.unshift(tempImg);
                $scope.invoiceAttachments.totalAttachments += 1;
            }
            else if (purpose === 'CLAIM_OTHER') {
                $scope.otherAttachments.attachments.unshift(tempImg);
                $scope.otherAttachments.totalAttachments += 1;
            }
        });
    }

    $scope.addClaimAttachments = function (e) {
        $(".upload-overlay").removeClass("hide");
        $scope.$apply(function () {
            var files = e.files;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var reader = new FileReader();
                reader.file = file;
                reader.fileName = files[i].name;
                reader.fileType = files[i].type;
                reader.fileExtension = files[i].name.substr(files[i].name.lastIndexOf('.'));
                //20 MB - 20,971,520 Bytes
                if (reader.file.size > 20971520) {
                    toastr.remove();
                    toastr.warning("Please upload file less than 20MB.", "Warning");
                } else {
                    reader.onload = $scope.LoadFileInList;
                    reader.readAsDataURL(file);
                }
            }
            if ($scope.currentAttchment === 'CLAIM_RECEIPT')
                angular.element('#receiptFileUpload').val(null);
            else
                angular.element("#claimFileUpload").val(null);
        });
    };
    $scope.LoadFileInList = function (e) {
        if ($scope.attachmentList.length === 10) {
            toastr.remove();
            toastr.warning("Can't add more than 10 files", "Warning");
            $(".upload-overlay").addClass("hide");
            return false;
        } else {
            var isFileExist = false;
            angular.forEach($scope.attachmentList, function (file) {
                if (e.target.fileName === file.FileName)
                    isFileExist = true
            });
            if (isFileExist) {
                toastr.remove();
                toastr.warning("Document with name '" + e.target.fileName + "' already exists");
            }
            else {
                $scope.$apply(function () {
                    let file = {
                        "FileName": e.target.fileName, "FileExtension": e.target.fileExtension, "FileType": e.target.fileType,
                        "Image": e.target.result, "File": e.target.file, 'isLocal': true, "Purpose": $scope.currentAttchment
                    };
                    let validExtension = null;
                    if ($scope.currentAttchment === 'CLAIM_RECEIPT') {
                        validExtension = ".pdf";
                        if (validExtension === e.target.fileExtension.toLowerCase()) {
                            $scope.attachmentList.push(file);
                        }
                        else {
                            toastr.warning(file.FileName + " cannot be uploaded. Please upload only .pdf files for receipts.");
                        }
                    }
                    else {
                        validExtension = [".pdf", ".docx", ".jpg", ".jpeg", ".png", ".bmp", ".mp4", ".xlsx", ".doc", ".webm", ".ogg", ".3gp"];
                        if (validExtension.indexOf(e.target.fileExtension.toLowerCase()) > -1)
                            $scope.attachmentList.push(file);
                        else
                            toastr.warning(file.FileName + " cannot be uploaded. File types " + validExtension.join(", ") + " accepted.");

                    }
                });
            }
        }
        $(".upload-overlay").addClass("hide");
    }
    //cancel claim attachment
    $scope.cancelAttachment = cancelAttachment;
    function cancelAttachment() {
        $scope.attachmentList = [];
        $scope.currentAttchment = null;
        angular.element("input[type='file']").val(null);
    }
    //Remove
    $scope.RemoveAttachment = RemoveAttachment;
    function RemoveAttachment(index) {
        if ($scope.attachmentList.length > 0) {
            $scope.attachmentList.splice(index, 1);
        }
    }
    //Delete Attachments
    $scope.deleteClaimAttachment = deleteClaimAttachment;
    function deleteClaimAttachment(document) {
        bootbox.confirm({
            size: "",
            closeButton: false,
            title: "Delete '" + document.name + "'",
            message: "Are you sure you want to delete ? <b>Please Confirm!",
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
                if (result) {
                    $scope.$apply(function () {
                        let index = -1;
                        if (document.isLocal) {
                            //Compare by object
                            if ($scope.attachmentList.length > 0) {
                                index = $scope.attachmentList.findIndex(file => file === document);
                                if (index > -1)
                                    $scope.attachmentList.splice(index, 1);
                            }
                        }
                        else {
                            $(".page-spinner-bar").removeClass("hide");
                            var param = {
                                id: !document.id ? (!document.imageId ? null : document.imageId) : document.id,
                                purpose: document.purpose
                            }
                            var promis = ClaimDocumentsService.deleteMediaFile(param);
                            promis.then(function (success) {
                                //Delete from particular section of attachments
                                if (document.purpose === 'CLAIM') {
                                    index = $scope.claimAttachments.attachments.findIndex(file => file.id === document.id);
                                    if (index > -1)
                                        $scope.claimAttachments.attachments.splice(index, 1);
                                }
                                else if (document.purpose === 'CLAIM_ITEM' || document.purpose === 'ITEM') {
                                    index = $scope.claimItemsAttachments.attachments.findIndex(file => file.id === document.id);
                                    if (index > -1)
                                        $scope.claimItemsAttachments.attachments.splice(index, 1);
                                }
                                else if (document.purpose === 'CLAIM_RECEIPT') {
                                    index = $scope.receiptAttachments.attachments.findIndex(file => file.id === document.id);
                                    if (index > -1)
                                        $scope.receiptAttachments.attachments.splice(index, 1);
                                }
                                else if (document.purpose === 'CLAIM_INVOICE') {
                                    index = $scope.invoiceAttachments.attachments.findIndex(file => file.id === document.id);
                                    if (index > -1)
                                        $scope.invoiceAttachments.attachments.splice(index, 1);
                                }
                                else if (document.purpose === 'CLAIM_OTHER') {
                                    index = $scope.otherAttachments.attachments.findIndex(file => file.id === document.id);
                                    if (index > -1)
                                        $scope.otherAttachments.attachments.splice(index, 1);
                                }
                                toastr.remove()
                                toastr.success(success.data.message, "Success");
                                $(".page-spinner-bar").addClass("hide");
                                getClaimAttachments();
                            }, function (error) {
                                toastr.remove()
                                toastr.error(error.data.errorMessage + ". Please refresh once and try again.", "Error");
                                $(".page-spinner-bar").addClass("hide");
                            });
                        }
                        $scope.imgDiv = false;
                    });
                }
            }
        });
    }

    // Attachments Preview and download
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
            //Except Policyholder, Adjuster and Claim supervisor can delete all files
            if ($scope.CommonObj.UserRole != 'POLICYHOLDER')
                $scope.showDelete = false;
        }
        $scope.ReceiptList = $scope.DocxDetails.url;
        $scope.pdfUrl = $scope.ReceiptList;
        var pdf = ["pdf", "application/pdf"];
        var img = ["image", "application/image", "image/jpg", "image/png", "image/jpeg", 
                    "image/gif", "png", "jpg", "jpeg", "gif", 
                    "image/bmp", "bmp"];
        var video = ["video/mp4", "video/ogg", "video/3gpp", "video/webm"];
        $scope.imgDiv = true;
        let fileType = ($scope.DocxDetails.FileType ? $scope.DocxDetails.FileType : $scope.DocxDetails.type).toLowerCase();
        if (pdf.indexOf(fileType) > -1) {
            $scope.isPDF = 1;
        }
        else if (img.indexOf(fileType) > -1) {
            $scope.isPDF = 2;
        }
        else if (video.indexOf(fileType) > -1) {
            $scope.isPDF = 3;
            let videoElm = $('#video-attachment').get(0);
            if(videoElm)
                videoElm.src = $filter('trustUrl')($scope.DocxDetails.url);
        }
        else {
            $scope.isPDF = 0;   
            if(!$scope.DocxDetails.isLocal)
                $scope.downloadFile($scope.DocxDetails);                    
        }
        window.setTimeout(function () {
            $("#img_preview").css({
                'right': $('.page-wrapper-middle').offset().left + 'px'
            }).show();
        }, 100);
    }
    $scope.close = function () {
        //If video tag is active, pause and close
        let videoElm = $('#video-attachment').get(0);
        if(videoElm){
            videoElm.pause();        
            videoElm.src = null; 
        }
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
        if (/\.(pdf)$/i.test(fileName.toLowerCase())) {
            return true;
        }
    }
    $scope.isImage = function (fileName) {
        if (/\.(jpe?g|png|gif|bmp)$/i.test(fileName.toLowerCase())) {
            return true;
        }
    }
    $scope.isExcel = function (fileName) {
        if (/\.(xls|xlsx)$/i.test(fileName.toLowerCase())) {
            return true;
        }
    }
    $scope.isDocx = function (fileName) {
        if (/\.(docx|doc)$/i.test(fileName.toLowerCase())) {
            return true;
        }
    }
    $scope.isVideo = function (fileName) {
        if (/\.(mp4|flv|ogg|3gp|webm)$/i.test(fileName.toLowerCase())) {
            return true;
        }
    }
    // Attachment Preview and Download

    $scope.nextClaimDocuments = function (totalCount) {
        let totalPages = Math.ceil(totalCount / docLimit);
        if (currentClaimDocsPage < totalPages) {
            $("#claimDocsLoad").removeClass("hide");
            currentClaimDocsPage += 1;
            var param = {
                "claimNumber": $scope.CommonObj.ClaimNumber,
                "page": currentClaimDocsPage,
                "limit": docLimit,
                "type": "claim",
                "keyword": $scope.searchDocuments.keyword ? $scope.searchDocuments.keyword : ""
            }
            var getpromise = ClaimDocumentsService.getClaimAttachments(param);
            getpromise.then(function (success) {
                let nextDocs = success.data.data ? success.data.data.claimAttachments : null;
                if (nextDocs) {
                    angular.forEach(nextDocs.attachments, function (doc) {
                        $scope.claimAttachments.attachments.push(doc);
                    });
                    $scope.claimAttachments.totalAttachments = nextDocs.totalAttachments;
                }
                $("#claimDocsLoad").addClass("hide");
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
                toastr.remove();
                toastr.error($scope.ErrorMessage, "Error");
                $("#claimDocsLoad").addClass("hide");
            });
        }
    }

    $scope.nextItemDocuments = function (totalCount) {
        let totalPages = Math.ceil(totalCount / docLimit);
        if (currentItemDocsPage < totalPages) {
            $("#itemDocsLoad").removeClass("hide");
            currentItemDocsPage += 1;
            var param = {
                "claimNumber": $scope.CommonObj.ClaimNumber,
                "page": currentItemDocsPage,
                "limit": docLimit,
                "type": "items",
                "keyword": $scope.searchDocuments.keyword ? $scope.searchDocuments.keyword : ""
            }
            var getpromise = ClaimDocumentsService.getClaimAttachments(param);
            getpromise.then(function (success) {
                let nextDocs = success.data.data ? success.data.data.claimItemsAttachments : null;
                if (nextDocs) {
                    angular.forEach(nextDocs.attachments, function (doc) {
                        $scope.claimItemsAttachments.attachments.push(doc);
                    });
                    $scope.claimItemsAttachments.totalAttachments = nextDocs.totalAttachments;
                }
                $("#itemDocsLoad").addClass("hide");
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
                toastr.remove();
                toastr.error($scope.ErrorMessage, "Error");
                $("#itemDocsLoad").addClass("hide");
            });
        }
    }

    $scope.nextReceiptDocuments = function (totalCount) {
        let totalPages = Math.ceil(totalCount / docLimit);
        if (currentReceiptDocsPage < totalPages) {
            currentReceiptDocsPage += 1;
            $("#receiptsDocsLoad").removeClass("hide");
            var param = {
                "claimNumber": $scope.CommonObj.ClaimNumber,
                "page": currentReceiptDocsPage,
                "limit": docLimit,
                "type": "receipts",
                "keyword": $scope.searchDocuments.keyword ? $scope.searchDocuments.keyword : ""
            }
            var getpromise = ClaimDocumentsService.getClaimAttachments(param);
            getpromise.then(function (success) {
                let nextDocs = success.data.data ? success.data.data.receiptAttachments : null;
                if (nextDocs) {
                    angular.forEach(nextDocs.attachments, function (doc) {
                        $scope.receiptAttachments.attachments.push(doc);
                    });
                    $scope.receiptAttachments.totalAttachments = nextDocs.totalAttachments;
                }
                $("#receiptsDocsLoad").addClass("hide");
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
                toastr.remove();
                toastr.error($scope.ErrorMessage, "Error");
                $("#receiptsDocsLoad").add("hide");
            });
        }
    }

    $scope.nextInvoiceDocuments = function (totalCount) {
        let totalPages = Math.ceil(totalCount / docLimit);
        if (currentInvoiceDocsPage < totalPages) {
            currentInvoiceDocsPage += 1;
            $("#invoicesDocsLoad").remove("hide");
            var param = {
                "claimNumber": $scope.CommonObj.ClaimNumber,
                "page": currentInvoiceDocsPage,
                "limit": docLimit,
                "type": "invoices",
                "keyword": $scope.searchDocuments.keyword ? $scope.searchDocuments.keyword : ""
            }
            var getpromise = ClaimDocumentsService.getClaimAttachments(param);
            getpromise.then(function (success) {
                let nextDocs = success.data.data ? success.data.data.invoiceAttachments : null;
                if (nextDocs) {
                    angular.forEach(nextDocs.attachments, function (doc) {
                        $scope.invoiceAttachments.attachments.push(doc);
                    });
                    $scope.invoiceAttachments.totalAttachments = nextDocs.totalAttachments;
                }
                $("#invoicesDocsLoad").add("hide");
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
                toastr.remove();
                toastr.error($scope.ErrorMessage, "Error");
                $("#invoicesDocsLoad").add("hide");
            });
        }
    }

    $scope.nextOtherDocuments = function (totalCount) {
        let totalPages = Math.ceil(totalCount / docLimit);
        if (currentOtherDocsPage < totalPages) {
            currentOtherDocsPage += 1;
            $("#othersDocsLoad").add("hide");
            var param = {
                "claimNumber": $scope.CommonObj.ClaimNumber,
                "page": currentOtherDocsPage,
                "limit": docLimit,
                "type": "others",
                "keyword": $scope.searchDocuments.keyword ? $scope.searchDocuments.keyword : ""
            }
            var getpromise = ClaimDocumentsService.getClaimAttachments(param);
            getpromise.then(function (success) {
                let nextDocs = success.data.data ? success.data.data.otherAttachments : null;
                if (nextDocs) {
                    angular.forEach(nextDocs.attachments, function (doc) {
                        $scope.otherAttachments.attachments.push(doc);
                    });
                    $scope.otherAttachments.totalAttachments = nextDocs.totalAttachments;
                }
                $("#othersDocsLoad").remove("hide");
            }, function (error) {
                $scope.ErrorMessage = error.data.errorMessage;
                toastr.remove();
                toastr.error($scope.ErrorMessage, "Error");
                $("#othersDocsLoad").remove("hide");
            });
        }
    }
});
