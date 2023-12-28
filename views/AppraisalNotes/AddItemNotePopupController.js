angular.module('MetronicApp').controller('AddItemNotePopupController', function ($rootScope, $filter, AppraisalNotesService, $uibModal, $scope, $translate, $translatePartialLoader, objClaim) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    //set language 
    $translatePartialLoader.addPart('AppraisalNotes');
    $translate.refresh();
    $scope.CommonObj = { 
        "appraisalNumber": objClaim.appraisalNumber 
    };

    $scope.CommonObj.type = 'false'; // Defaulting to Public note
    function init() {
        noteTypeChange();                      
    }
    init(); 

    $scope.fileName = null;
    $scope.FileType = null;
    $scope.FileExtension = null;
    $scope.files = [];
    $scope.PraticipantIdList = [];
    
    //for note attachment
    $scope.SelectNoteFile = SelectNoteFile;
    function SelectNoteFile() {
        angular.element('#NoteFileUpload').trigger('click');
    }
    $scope.filed;
    $scope.getNoteFileDetails = getNoteFileDetails;
    function getNoteFileDetails(event) {
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
    
    $scope.AppraisalParticipantsList = objClaim.ParticipantList;
    console.log($scope.AppraisalParticipantsList);
    /*Get active ParticipantsList for the Appraisal while changing note type*/
    $scope.noteTypeChange = noteTypeChange;
    function noteTypeChange(){        
        var param = { 
            "appraisalNumber": $scope.CommonObj.appraisalNumber,
            "isPrivateParticipants": $scope.CommonObj.type == 'true'
        };        
        var getpromise = AppraisalNotesService.getParticipantsListAgainstAppraisal(param);
        getpromise.then(function (success) {
            $scope.AppraisalParticipantsList = success.data.data;
            if($scope.AppraisalParticipantsList!=null){
                angular.forEach($scope.AppraisalParticipantsList, function (participant) {
                    if (participant.firstName == null) {
                        participant.firstName = " ";
                    }
                    if (participant.lastName == null) {
                        participant.lastName = " ";
                    }                
                    if($scope.CommonObj.type == 'false'){
                        $scope.PraticipantIdList.push(participant.id);
                    }
                });
            }else{
                /* Default Participants as logged-in User */
                var participantId = parseInt(sessionStorage.getItem("UserId"));
                var email = sessionStorage.getItem("UserName");
                var names = sessionStorage.getItem("Name").split(', ');            
                $scope.AppraisalParticipantsList = [{
                    "id": participantId, "email": email, "firstName": names[1], "lastName": names[0], isActive: true
                }];
                $scope.PraticipantIdList.push(participantId);
            }      

        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    }
        
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

        var NoteUser = [];

        if ($scope.PraticipantIdList.length > 0) {
            angular.forEach($scope.PraticipantIdList, function (participant) {
                angular.forEach($scope.AppraisalParticipantsList, function (item) {
                    if (participant === item.id) {
                        NoteUser.push({
                            "participantId": participant, "email": item.email
                        });
                    }
                });
            });    
            
            console.log(NoteUser);
        
            data.append("noteDetail", JSON.stringify({
                "appraisalNumber": $scope.CommonObj.appraisalNumber.toString(),
                "sender": sessionStorage.getItem("CRN"),
                "isPublicNote": false,
                "message": $scope.CommonObj.claimNote,
                //"isInternal": internal, 
                "isPrivateParticipants": $scope.CommonObj.type == 'true',
                "registrationNumber": sessionStorage.getItem("speedCheckVendor"),
                "groupDetails": {
                    "groupId": null,
                    "groupTitle": $scope.CommonObj.subject,
                    "participants": NoteUser
                }
            }));     
            
            var getpromise = AppraisalNotesService.addAppraisalNoteWithParticipant(data);
            getpromise.then(function (success) {
                $scope.Status = success.data.status;
                //console.log(success.data);
                if ($scope.Status == 200) {
                    $scope.$close("Success");
                    toastr.remove();
                    toastr.success(success.data.message, "Confirmation");
                }
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
                $scope.ErrorMessage = error.data.errorMessage;
                $(".page-spinner-bar").addClass("hide");
            });
        }
    }
    //Cancel
    $scope.cancel = function () {
        $scope.$close();
    };
});