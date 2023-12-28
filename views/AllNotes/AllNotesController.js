angular.module('MetronicApp').controller('AllNotesController', function ($rootScope, $scope, $location, $translate, $translatePartialLoader, $uibModal, $filter,
    AuthHeaderService, AdjusterPropertyClaimDetailsService, $timeout, $window, $http) {
    //set language
    $translatePartialLoader.addPart('AllNotes');
    $translate.refresh();
    $scope.sortNote = 'updateDate';
    $scope.sortNotereverse = true;
    var RoleList = sessionStorage.getItem("RoleList");
    $scope.displayParticipants = false;
    //$scope.isAllNotes = $scope.isAllNotes ? $scope.isAllNotes : true;
    $scope.isAllNotes = true;
    $scope.NoteDetails = {};
    // Message Participants circle
    $scope.color = ["#C9F1FD", "#FFEBCD", "#3BB9FF", "#f7bec5", "#bdb9f7", "#85f7cb", "#f4d28d", "#f78a74", "#abef97", "#f9f17a"];
    $scope.left = ["0px", "-60px", "-60px", "-60px", "-60px", "-60px", "-60px", "-60px", "-60px", "-60px"];
    $scope.zindex = ["10", "9", "8", "7", "6", "5", "4", "3", "2", "1"];
    $scope.NoteDetails = JSON.parse(sessionStorage.getItem("selectedMessageGrp"));
    $scope.reply = {
        "message": null,
        "uploadedMessageFiles": []
    };
    //$scope.replyForms = {};
    function init() {
        $scope.CommonObj = {
            "claimNumber": sessionStorage.getItem("AllNoteClaimNumber"),
            "ClaimId": sessionStorage.getItem("AllNoteClaimId"),
            "UserId": sessionStorage.getItem("UserId"),
            "AssignmentNumber": sessionStorage.getItem("AssignmentNumber"),
            "PolicyNumber": sessionStorage.getItem("PolicyNo")
        };
        if (($scope.CommonObj.ClaimId !== null && angular.isDefined($scope.CommonObj.ClaimId))
            && ($scope.CommonObj.claimNumber !== null && angular.isDefined($scope.CommonObj.claimNumber))) {
            GetMessages(null);
        } else {
            $scope.GoBack();
        }
    }
    init();

    $scope.chatResize = false;
    $scope.expandMessageBox = function (isMessageGrp) {
        var toGetId = "#messages";
        if ($(toGetId).hasClass("expand_msg_box") || isMessageGrp) {
            $(toGetId).removeClass("expand_msg_box");
        }
        else {
            $(toGetId).addClass("expand_msg_box");
        }
    }

    $scope.resetReply = function () {
        $scope.reply.message = null;
        $scope.reply.messageForm.$setUntouched();
        $scope.reply.uploadedMessageFiles = [];
        angular.element("input[type='file']").val(null);
    }

    //Get Note
    $scope.GetMessages = GetMessages;
    function GetMessages(event) {
        var messageGrpId = sessionStorage.getItem("messageGrpId");
        if (event && event === 'refresh')
            $(".note_refresh_spinner").addClass("fa-spin");
        else
            $(".page-spinner-bar").removeClass("hide");
        var param = {
            "claimId": $scope.CommonObj.ClaimId
        };
        var GetMessages = AdjusterPropertyClaimDetailsService.getClaimNotes(param);
        GetMessages.then(function (success) {
            //var Notes = $filter('orderBy')(success.data && success.data.data ? success.data.data : null, 'createDate', true);
            var Notes = success.data && success.data.data ? success.data.data : null;
            $scope.Notes = [];
            var idx = 0;
            var selIdx = 0;
            angular.forEach(Notes, function (item) {
                // CTB-2895
                // if (item.groupTitle != null) {
                // end CTB-2895
                var tooltip = '';
                var count = 0;
                if ($scope.NoteDetails && $scope.NoteDetails.groupId == item.groupId) {
                    selIdx = idx;
                } else {
                    idx++;
                }
                angular.forEach(item.participants, function (participant) {
                    if (count == item.participants.length - 1) {
                        tooltip += (participant.firstName + " " + participant.lastName);
                    } else {
                        tooltip += (participant.firstName + " " + participant.lastName) + "\n";
                    }
                    participant.avatarColor = $scope.color[count];
                    count++;
                });
                // map messages attachments within group
                angular.forEach(item.messages, function (message) {
                    angular.forEach(message.attachments, function (attachment) {
                        attachment.FileType = attachment.claimFileType;
                        attachment.FileName = attachment.name;
                        attachment.addedByUser = {
                            "id": message.addedBy.id
                        };
                        attachment.message = {
                            "id": message.noteId
                        };
                    });
                });
                item.tooltipText = tooltip;
                $scope.Notes.push(item);
                // CTB-2895
                // }
                // end CTB-2895
            });
            var item = $scope.Notes.find(x => x.groupId === Number(messageGrpId));
            var index = $scope.Notes.indexOf(item);


            if (index >= 0) {
                GetNoteDetails(item, index);
            }
            else  if ($scope.Notes.length > 0) {
                $scope.NoteDetails = $scope.Notes[selIdx];
                $scope.NoteIndex = selIdx;
            }
            if (event && event === 'refresh')
                $(".note_refresh_spinner").removeClass("fa-spin");
            else
                $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $(".note_refresh_spinner").removeClass("fa-spin");
            $(".page-spinner-bar").addClass("hide");
        });
    }

    $scope.$on('$locationChangeStart', function (event, next, current) {
        sessionStorage.removeItem("selectedMessageGrp");
    });

    $scope.GoBack = GoBack;
    function GoBack() {
        sessionStorage.setItem("AllNoteClaimId", null);
        sessionStorage.setItem("AllNoteClaimNumber", null);
        if (RoleList === 'ADJUSTER')
            $location.url("/AdjusterPropertyClaimDetails");
        else if (RoleList === 'CLAIM SUPERVISOR')
            $location.url("/SupervisorClaimDetails");
        else if (RoleList === 'POLICYHOLDER')
            $location.url("/PolicyholderClaimDetails");
        //window.history.back();
    }

    //Get message Details
    $scope.GetNoteDetails = GetNoteDetails;
    function GetNoteDetails(item, ind) {
        var window = angular.element($window);
        if (window.width() < 767) {
            $(".sidebar").css("display", "none");
            $(".messages").css("display", "block");
        }
        $scope.NoteIndex = ind;
        $scope.NoteDetails = item;
        $scope.expandMessageBox(true);
        $timeout(function () {
            var $id = $("#chat_history");
            //$id.scrollTop($id[0].scrollHeight);
            $id.scrollTop($(document).height());
        }, 1000);
        $scope.reply.messageForm.$setUntouched();
    };

    $scope.hideChatHistory = function () {
        $(".sidebar").css("display", "block");
        $(".messages").css("display", "none");
        $scope.reply.messageForm.$setUntouched();
    }

    $scope.ClaimParticipantsList = [];
    var param = { "claimNumber": $scope.CommonObj.claimNumber }
    var getpromise = AdjusterPropertyClaimDetailsService.getClaimParticipants(param);
    getpromise.then(function (success) { $scope.ClaimParticipantsList = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

    //New Note
    $scope.AddNotePopup = AddNotePopup;
    function AddNotePopup(ev) {
        var obj = {
            "claimId": $scope.CommonObj.ClaimId,
            "ParticipantList": $scope.ClaimParticipantsList.filter(function (cp) {
                if (cp.emailId != $rootScope.userName)
                    return cp;
            }),
            "ClaimNumber": $scope.CommonObj.claimNumber,
            "assignmentNumber": $scope.CommonObj.AssignmentNumber
        };
        $scope.animationsEnabled = true;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/CommonTemplates/AddNotePopup.html",
                controller: "AddNotePopupController",
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
                GetMessages(null);
            }

        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };

    }
    $scope.GoToHome = function () {
        $location.url(sessionStorage.getItem("HomeScreen"));
    }
    //---- Start upload message attachment -----//
    $scope.selectMessageAttachments = function () {
        angular.element('#messageFileUpload').trigger('click');
    }
    $scope.getMessageAttachmentDetails = function (e) {
        $scope.$apply(function () {
            var files = event.target.files;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var reader = new FileReader();
                reader.file = file;
                reader.fileName = files[i].name;
                reader.fileType = files[i].type;
                reader.fileExtension = files[i].name.substr(files[i].name.lastIndexOf('.'));
                //20 MB - 20,971,520 Bytes
                if (reader.file.size > 20971520) {
                    toastr.warning("Please upload file less than 20MB.", "Warning");
                    return false;
                } else {
                    $scope.invalidAttachment = false;
                }
                reader.onload = $scope.imageIsLoaded;
                reader.readAsDataURL(file);
            }
        });
        angular.element("#messageFileUpload").val(null);
    };
    $scope.reply.uploadedMessageFiles = [];

    $scope.imageIsLoaded = function (e) {
        if ($scope.reply.uploadedMessageFiles.length === 10) {
            toastr.remove();
            toastr.warning("Can't add more than 10 files", "Warning");
            return false;
        } else {
            var isFileExist = false;
            angular.forEach($scope.reply.uploadedMessageFiles, function (file) {
                if (e.target.fileName === file.FileName)
                    isFileExist = true
            });
            if (isFileExist) {
                toastr.remove();
                toastr.warning("Attachment with name '" + e.target.fileName + "' already exists");
            }
            else {
                $scope.$apply(function () {
                    var validExtension = [".pdf", ".docx", ".jpg", ".jpeg", ".png", ".bmp", ".mp4", ".xlsx", ".xls", ".doc", ".webm", ".ogg", ".3gp"];
                    if (validExtension.indexOf(e.target.fileExtension.toLowerCase()) <= -1) {
                        $scope.invalidFileType = true;
                    }
                    $scope.reply.uploadedMessageFiles.push(
                        {
                            "FileName": e.target.fileName, "FileExtension": e.target.fileExtension,
                            "FileType": e.target.fileType,
                            "Image": e.target.result, "File": e.target.file, "isLocal": true
                        })
                });
            }
        }
    }

    $scope.removeMessageFile = function (item) {
        var index = $scope.reply.uploadedMessageFiles.indexOf(item);
        if (index > -1) {
            $scope.reply.uploadedMessageFiles.splice(index, 1);
        }
        // var validExtension = [".pdf", ".docx", ".jpg", ".jpeg", ".png", ".bmp", ".mp4", ".xlsx", ".doc", ".webm", ".ogg", ".3gp"];
        // if ($scope.reply.uploadedMessageFiles == 0)
        //     $scope.invalidFileType = false;
        // else {
        //     angular.forEach($scope.reply.uploadedMessageFiles, function (item) {
        //         if (validExtension.indexOf(item.FileExtension) > -1) {
        //             $scope.invalidFileType = false;
        //         }
        //     })
        // }
        $scope.close();
    }
    //------ Upload attachment End -----//

    // Reply message
    $scope.replyMessage = function (NoteDetails) {
        $(".page-spinner-bar").removeClass("hide");
        var data = new FormData();
        var FileDetails = [];
        if ($scope.reply.uploadedMessageFiles.length > 0) {
            angular.forEach($scope.reply.uploadedMessageFiles, function (item) {
                FileDetails.push({
                    "fileName": item.FileName, "fileType": item.FileType,
                    "extension": item.FileExtension,
                    "filePurpose": "NOTE", "latitude": null, "longitude": null
                });
                data.append("file", item.File);
            });
            data.append("mediaFilesDetail", JSON.stringify(FileDetails));
        }
        else {
            data.append("mediaFilesDetail", null);
            data.append("file", null);
        }
        //var registrationNumber = NoteDetails.isAddedByVendor ? NoteDetails.vendorURN : null;
        var registrationNumber = null;
        angular.forEach(NoteDetails.participants, function (participants) {
            if (participants.crn != null) {
                registrationNumber = participants.crn;
            }
        });
        data.append("noteDetail", JSON.stringify(
            {
                "isPublicNote": NoteDetails.isPublicNote,
                "registrationNumber": registrationNumber,
                "sender": sessionStorage.getItem("CRN"),
                "itemUID": NoteDetails && NoteDetails.itemUID ? NoteDetails.itemUID : null,            // if it is item level note
                "serviceRequestNumber": null,
                "isInternal": registrationNumber && registrationNumber != "" ? false : true,
                "claimNumber": $scope.CommonObj.claimNumber,
                "message": $scope.reply.message,
                "groupDetails":
                    { "groupId": NoteDetails.groupId, "groupNumber": NoteDetails.groupNumber }
            }))
        var getpromise = AdjusterPropertyClaimDetailsService.ReplyClaimNote(data);
        getpromise.then(function (success) {
            $scope.Status = success.data.status;
            if ($scope.Status == 200) {
                $scope.resetReply();
                GetMessages(NoteDetails.groupId);
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");
                $(".page-spinner-bar").addClass("hide");
            }
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
            $scope.ErrorMessage = error.data.errorMessage;
            $(".page-spinner-bar").addClass("hide");
        });
    };
    // Delete message
    $scope.deleteMessage = deleteMessage;
    function deleteMessage(item, participants) {
        bootbox.confirm({
            size: "",
            // title: "Delete Message",
            message: "Are you sure want to delete the message?", closeButton: false,
            className: "modalcustom", buttons: {
                confirm: {
                    label: "Yes",
                    className: 'btn-outline green'
                },
                cancel: {
                    label: "No", //$translate.instant('ClaimDetails_Delete.BtnNo'),
                    className: 'btn-outline red'
                }
            },
            callback: function (result) {
                if (result) {
                    if (angular.isDefined(item.noteUID) && item.noteUID !== null) {
                        $(".page-spinner-bar").removeClass("hide");
                        var param = {
                            "noteUID": item.noteUID
                        };
                        var promis = AdjusterPropertyClaimDetailsService.deleteMessage(param);
                        promis.then(function (success) {
                            $(".page-spinner-bar").addClass("hide");
                            GetMessages(null);
                            toastr.remove();
                            toastr.success(success.data.message, "Confirmation");
                        },
                            function (error) {
                                toastr.remove();
                                if (error.data.errorMessage != null && angular.isDefined(error.data.errorMessage)) {
                                    toastr.error(error.data.errorMessage, "Error")
                                }
                                else {
                                    toastr.error(AuthHeaderService.genericErrorMessage(), "Error")
                                }
                                $(".page-spinner-bar").addClass("hide");
                            });
                    };
                }
            }
        });
    };

    //Attachments preview
    $scope.GetDocxDetails = function (item, index) {
        $scope.showDownload = true;
        $scope.showDelete = true;
        if (index != undefined && index != null) {
            $scope.newImageIndex = index;
        }
        $scope.pdf = true;
        $scope.currentPDFUrl = $scope.pdfUrl;
        $scope.pageToDisplay = 1;
        $scope.pageNum = 1;
        $scope.isPDF = 0;
        $scope.DocxDetails = item;
        if ($scope.DocxDetails.isLocal) {
            $scope.showDownload = false;
            $scope.DocxDetails.url = item.Image;
        } else {
            if ($scope.CommonObj.UserId != item.addedByUser.id)
                $scope.showDelete = false;
        }
        $scope.ReceiptList = $scope.DocxDetails.url;
        $scope.pdfUrl = $scope.ReceiptList;
        var pdf = ["pdf", "application/pdf", "PDF"];
        var img = ["image", "application/image", "image/jpg", "image/png", "image/jpeg",
            "image/gif", "png", "jpg", "jpeg", "gif",
            "image/bmp", "bmp"];
        var video = ["video/mp4", "video/ogg", "video/3gpp", "video/webm"];
        var docs = ["doc", "docx", "application/msword"]
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
            if (videoElm)
                videoElm.src = $filter('trustUrl')($scope.DocxDetails.url);
        }
        else {
            $scope.isPDF = 0;
            if (!$scope.DocxDetails.isLocal)
                $scope.downloadFile($scope.DocxDetails);
        }
        window.setTimeout(function () {
            $("#img_preview").css({
                'center': $('.page-wrapper-middle').offset().left + 'px'
            }).show();
            // $("#img_preview").show();
        }, 100);

    }
    $scope.close = function () {
        $scope.imgDiv = false;
        $scope.newImageIndex = null;
        //If video tag is active, pause and close
        let videoElm = $('#video-attachment').get(0);
        if (videoElm) {
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

    $scope.deleteMessageAttachment = deleteMessageAttachment;
    function deleteMessageAttachment(document) {
        bootbox.confirm({
            size: "",
            closeButton: false,
            title: "Delete '" + document.FileName + "",
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
                    var param = [{
                        id: angular.isUndefined(document.id) ? (angular.isUndefined(document.imageId) ? null : document.imageId) : document.id
                    }]
                    var promis = AdjusterPropertyClaimDetailsService.deleteMediaFile(param);
                    promis.then(function (success) {
                        var message = $scope.NoteDetails.messages.find(message => message.noteId === document.message.id);
                        if (message) {
                            var attachmentIndex = message.attachments.findIndex(attachment => attachment.imageId === document.imageId);
                            if (attachmentIndex > -1)
                                message.attachments.splice(attachmentIndex, 1);
                        }
                        $scope.close();
                        toastr.remove()
                        toastr.success(success.data.message, "Success");
                        $(".page-spinner-bar").addClass("hide");
                    }, function (error) {
                        toastr.remove()
                        toastr.error(error.data.errorMessage, "Error");
                        $(".page-spinner-bar").addClass("hide");
                    });

                }
            }
        });
    }

    //Fuction to download uploaded files.
    $scope.downloadAttachment = function (data) {
        fetch(data.url).then(function (t) {
            return t.blob().then((b) => {
                var a = document.createElement("a");
                a.href = URL.createObjectURL(b);
                a.setAttribute("download", data.FileName);
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
});
