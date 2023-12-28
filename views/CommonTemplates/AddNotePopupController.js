angular.module('MetronicApp').controller('AddNotePopupController', function ($rootScope, $filter, AdjusterPropertyClaimDetailsService, $uibModal, $scope, $timeout, $translate, $translatePartialLoader, objClaim) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });

    //set language
    $translatePartialLoader.addPart('AdjusterPropertyClaimDetails');
    $translate.refresh();
    $scope.CommonObj = {
        "claimNote": null,
        "ClaimId": objClaim.claimId,
        "itemId": angular.isDefined(objClaim.ItemId) ? objClaim.ItemId : null,
        "claimNumber": objClaim.ClaimNumber,
        "subject": angular.isDefined(objClaim.subject) ? objClaim.subject : null,
        "participantsList": objClaim.ParticipantList && objClaim.ParticipantList.length > 0 ? objClaim.ParticipantList : [],

        "assignmentNumber": objClaim.assignmentNumber,
        "itemUID": angular.isDefined(objClaim.ItemUID) ? objClaim.ItemUID : null
    };
    $scope.fileName = null;
    $scope.FileType = null;
    $scope.FileExtension = null;
    $scope.files = [];
    $scope.defaultParticipantList = [];
    $scope.PraticipantIdList = [];
    $scope.ClaimParticipantsList = [];
    $scope.currentUserName = sessionStorage.getItem("Name");
    $scope.invalidAttachment = false;
    var registration = null;
    // Add default recepients if present
    if (objClaim.defaultRecepients && objClaim.defaultRecepients.length > 0) {
        angular.forEach(objClaim.defaultRecepients, function (recepient) {
            $scope.PraticipantIdList.push(recepient.participantId);
        });
    }
    // Check if participants list exist. If fetch or all to ClaimParticipantsList
    if (!angular.isDefined(objClaim.ParticipantList) || objClaim.ParticipantList === null || !objClaim.ParticipantList.length) {
        var paramclaimNo = { "claimNumber": $scope.CommonObj.claimNumber };
        var getParticipants = AdjusterPropertyClaimDetailsService.getClaimParticipants(paramclaimNo);
        getParticipants.then(function (success) {
            $scope.ClaimParticipantsList = success.data.data;
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    }
    else {
        $scope.ClaimParticipantsList = objClaim.ParticipantList;
    }

    //for note attachment
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
            var validExtension = [".pdf", ".docx", ".dotx", ".jpg", ".jpeg", ".png", ".bmp", ".mp4"];
            if (validExtension.indexOf(e.target.fileExtension) <= -1) {
                $scope.invalidAttachment = true;
            }
            $scope.files.push({ "FileName": e.target.fileName, "FileExtension": e.target.fileExtension, "FileType": e.target.fileType, "Image": e.target.result, "File": e.target.file })
        });
    }
    $scope.RemoveImage = RemoveImage;
    function RemoveImage(item) {
        var index = $scope.files.indexOf(item);
        if (index > -1) {
            $scope.files.splice(index, 1);
        }
        var validExtension = [".pdf", ".docx", ".dotx", ".jpg", ".jpeg", ".png", ".bmp", ".mp4"];
        if ($scope.files.length == 0)
            $scope.invalidAttachment = false;
        else {
            angular.forEach($scope.files, function (item) {
                if (validExtension.indexOf(item.FileExtension) > -1) {
                    $scope.invalidAttachment = false;
                }
            })
        }
    }

    //Add note function
    $scope.ok = function (e) {
        $(".page-spinner-bar").removeClass("hide");
        var data = new FormData();
        if ($scope.files.length > 0) {
            var FileDetails = [];
            angular.forEach($scope.files, function (item) {
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
        var messageReceipient = [];
        var internal = true;

        if ($scope.PraticipantIdList.length > 0) {
            angular.forEach($scope.PraticipantIdList, function (participant) {
                angular.forEach($scope.ClaimParticipantsList, function (item) {
                    if (participant === item.participantId) {
                        if (item.participantType.participantType.toUpperCase() == 'EXTERNAL' ||
                            item.participantType.participantType.toUpperCase() == 'EXISTING VENDOR' ||
                            item.participantType.participantType.toUpperCase() == 'NEW VENDOR' ||
                            item.participantType.participantType.toUpperCase() == 'CLAIM ASSOCIATE' ||
                            item.participantType.participantType.toUpperCase() == 'CLAIM REPRESENTATIVE'||
                            item.participantType.participantType.toUpperCase() == 'GEMLAB ASSOCIATE') {
                            internal = false;
                            registration = item.vendorRegistration;
                            messageReceipient.push({
                                "participantId": participant, "email": item.emailId, "participantType": { "id": item.participantType.id, "participantType": item.participantType.participantType }, "vendorRegistration": item ? item.vendorRegistration : null
                            });
                        }
                        else {
                            messageReceipient.push({
                                "participantId": participant, "email": item.emailId, "participantType": { "id": item.participantType.id, "participantType": item.participantType.participantType }
                            });
                        }
                    }
                });
            });
            data.append("noteDetail", JSON.stringify({
                "claimId": $scope.CommonObj.ClaimId.toString(),
                "claimNumber": sessionStorage.getItem("ClaimNo") ? sessionStorage.getItem("ClaimNo") : $scope.CommonObj.claimNumber,
                "sender": sessionStorage.getItem("CRN"),
                "itemUID": $scope.CommonObj.itemUID,
                "serviceRequestNumber": null,
                "isPublicNote": false,
                "message": $scope.CommonObj.claimNote,
                "isInternal": internal,
                "registrationNumber": registration,
                "groupDetails": {
                    "groupId": null,
                    "groupTitle": $scope.CommonObj.subject,
                    "participants": messageReceipient
                },

                "assignmentNumber": $scope.CommonObj.assignmentNumber
            }));
        }
        else {
            data.append("noteDetail", JSON.stringify({
                "claimId": $scope.CommonObj.ClaimId.toString(),
                "claimNumber": $scope.CommonObj.claimNumber.toString(),
                "sender": sessionStorage.getItem("CRN"),
                "itemUID": $scope.CommonObj.itemUID,
                "serviceRequestNumber": null,
                "isPublicNote": true,
                "message": $scope.CommonObj.claimNote,
                "internal": false,  // if we want add note internally then it will be true otherwise false
                "registrationNumber": null, // if we are adding note from company to vendor then it will be vendor registration number or vice versa
                "groupDetails": null,
                "assignmentNumber": $scope.CommonObj.assignmentNumber
            }));
        }
        var getpromise = AdjusterPropertyClaimDetailsService.addClaimNoteWithParticipant(data);
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
    //Cancel
    $scope.cancel = function () {
        $scope.$close("Cancel");
    };
});
