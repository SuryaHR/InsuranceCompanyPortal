angular.module('MetronicApp').controller('AdjusterServiceRequestEditController', function ($rootScope, $uibModal, $scope, settings, $filter, AdjusterServiceRequestService, $location, $translate, $translatePartialLoader) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    //set language 
    $translatePartialLoader.addPart('ServiceRequestEdit');
    $translate.refresh();
    //NOte list
    $scope.NoteListForService = [];
    $scope.StatusList = [];
    $scope.CommonObj = { "ItemNote": "" };
    $scope.serviceRequestDetails = {};
    $scope.SelectedFileNames = [];
    $scope.UploadedFilesString = "";
    $scope.ClaimId = sessionStorage.getItem("AdjusterClaimId");
    $scope.NoteHeight;
    $scope.UserId = sessionStorage.getItem("UserId");
    function init() {
        $scope.ServiceRequestId = sessionStorage.getItem("ServiceRequestId");
        if ($scope.ServiceRequestId === null || angular.isUndefined($scope.ServiceRequestId)) {
            sessionStorage.setItem("ServiceRequestId", null);
            $location.url("AdjusterPropertyClaimDetails");
        }
        else {
            //Get Serbvice request details

            //Get notes attached to service
            getNotes();
            //Get statusList
            var GetStatusList = AdjusterServiceRequestService.GetStatusList();
            GetStatusList.then(function (success) {
                $scope.StatusList = success.data.data;
            }, function (error) {
                $scope.ErrorMessage = error.errorMessage;
            });
            var paramRequestId = { "serviceRequestId": $scope.ServiceRequestId }
            var GetServiceDetails = AdjusterServiceRequestService.GetServiceDetails(paramRequestId);
            GetServiceDetails.then(function (success) {
              
                $scope.serviceRequestDetails = success.data.data;
                getParticipants();
                 
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });

            var param = {
                "companyId": sessionStorage.getItem("CompanyId")
            }
            var ServiceRequestCat = AdjusterServiceRequestService.getCategoriesList(param);
            ServiceRequestCat.then(function (success) {
                $scope.ServiceCategoryList = success.data.data;
            }, function (error) { $scope.ErrorMessage = error.errorMessage });
        }
    }
    init();
    //$scope.PrevUploadedFiles="";
    //$scope.GetFileNames = GetFileNames;
    //function GetFileNames()
    //{
    //    angular.forEach($scope.serviceRequestDetails.attachments, function (obj, key) {

    //        $scope.PrevUploadedFiles += obj.name;
    //        ;
    //        if (key < $scope.serviceRequestDetails.attachments.length - 1)
    //            $scope.PrevUploadedFiles += ",";
    //    });
    //    ;
    //}
    //Go to Assign service screen 
    $scope.GotoAssign = function () {
        sessionStorage.setItem("ServiceRequestId", $scope.ServiceRequestId);
        $location.url("AdjusterAssignServiceRequest");
    }
    //Notes section
    function getNotes() {
        paramServiceId = { "serviceRequestId": $scope.ServiceRequestId };
        var GetServiceRequestNotes = AdjusterServiceRequestService.GetServiceRequestNotes(paramServiceId);
        GetServiceRequestNotes.then(function (success) {
            $scope.NoteListForService = success.data.data;
            
        }, function (error) { $scope.Errormessage = error.data.errorMessage });
    }
   
    //Add note
    $scope.AddNote = function (e) {
        var data = new FormData();
        data.append("mediaFilesDetail", JSON.stringify([{ "fileName": $scope.fileName, "fileType": $scope.fileType, "extension": $scope.FileExtension, "filePurpose": "NOTE", "latitude": null, "longitude": null }]));
        data.append("file", $scope.files);
        var NoteUser = [];
        var internal = true;
        var registration = null;
        if ($scope.PraticipantIdList.length > 0) {
            angular.forEach($scope.PraticipantIdList, function (participant) {
                angular.forEach($scope.ClaimParticipantsList, function (item) {
                    if (participant === item.participantId) {
                        if (item.participantType.participantType == 'CLAIM ASSOCIATE') {
                            angular.forEach($scope.ClaimParticipantsList, function (participant) {
                                if (participant.participantType.participantType == 'EXISTING VENDOR') {
                                    registration = angular.isDefined(participant) ? participant.vendorRegistration : null;
                                }
                            });
                        }

                        if (item.participantType.participantType == 'EXISTING VENDOR') {
                            NoteUser.push({
                                "participantId": participant, "participantType": { "id": item.participantType.id, "participantType": item.participantType.participantType }, "vendorRegistration": angular.isDefined(item) ? item.vendorRegistration : null
                            });
                            registration = angular.isDefined(item) ? item.vendorRegistration : null;
                        }
                        else {
                            NoteUser.push({
                                "participantId": participant, "email": item.emailId, "participantType": { "id": item.participantType.id, "participantType": item.participantType.participantType }
                            });
                        }
                        if (item.participantType.participantType.toUpperCase() == 'EXTERNAL' || item.participantType.participantType.toUpperCase() == 'EXISTING VENDOR' || item.participantType.participantType.toUpperCase() == 'NEW VENDOR' ||
                            item.participantType.participantType.toUpperCase() == 'CLAIM ASSOCIATE') {
                            internal = false;
                        }
                    }
                });
            });
            if (internal == true) {
                registration = sessionStorage.getItem("CRN");
            }
            data.append("noteDetail", JSON.stringify({
                "claimId": $scope.serviceRequestDetails.claimDetails.id,
                "claimNumber": $scope.serviceRequestDetails.claimDetails.claimNumber,
                "sender": sessionStorage.getItem("CRN"),
                "itemUID": null,
                "serviceRequestNumber": $scope.serviceRequestDetails.serviceNumber,
                "isPublicNote": false,
                "message": $scope.CommonObj.ItemNote,
                "isInternal": internal,
                "registrationNumber": registration,
                "groupDetails": {
                    "groupId": null,
                    "groupTitle": $scope.CommonObj.subject,
                    "participants": NoteUser
                }
            }));
        }
        var getpromise = AdjusterServiceRequestService.addNote(data);
        getpromise.then(function (success) {
            $scope.Status = success.data.status; toastr.remove();
            toastr.success(success.data.message, "Confirmation");
            if ($scope.Status == 200) {
                $scope.CommonObj.subject = "";
                $scope.CommonObj.ItemNote = "";
                $scope.PraticipantIdList = [];
                $("#select2insidemodal").empty();
                //cope.CommonObj.claimNote = "";
                $scope.CreateNoteForm.$setUntouched();
                angular.element("input[type='file']").val(null);
                $scope.fileName = '';
                $scope.FileType = '';
                $scope.FileExtension = '';
                //after adding new note updating note list
                getNotes();
            }
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }
    //Open file dialog
    $scope.SelectNoteFile = function () {
        angular.element('#NoteFileUpload').trigger('click');

    };
    //Get note attachment details
    $scope.getNoteFileDetails = function (e) {
        $scope.$apply(function () {
            $scope.fileName = e.files[0].name;
            $scope.FileType = e.files[0].type;
            $scope.FileExtension = $scope.fileName.substr($scope.fileName.lastIndexOf('.'));
            $scope.files = (e.files[0]);
            fr = new FileReader();
            fr.readAsDataURL(e.files[0]);
        });


    };
    //End Notes

    //Rerveice request

    //Attach file
    $scope.AttachmentDetails = []; $scope.FileList = [];
    $scope.SelectFile = function () {
       
        angular.element('#FileUpload').trigger('click');
    }
    //getFiles
    $scope.FilesSelected = "";
    $scope.getFileDetails = function (e) {
        $scope.FilesSelected = "";
            $scope.$apply(function () {
                var files = event.target.files;
                $scope.UploadedFiles = e.files;
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];

                    $scope.FilesSelected += e.files[i].name;
                    if (i != files.length - 1)
                    {
                        $scope.FilesSelected += ',';
                    }
                     

                    var reader = new FileReader();
                    $scope.AttachmentDetails.push({
                        "fileName": file.name,
                        "fileType": file.type,
                        "extension": file.name.substr(file.name.lastIndexOf('.')),
                        "filePurpose": "SERVICE_REQUEST",
                        "latitude": null,
                        "longitude": null
                    });
                    $scope.UploadedFilesString += file.name + ", ";
                    $scope.FileList.push({ "file": file })
                    reader.readAsDataURL(file);
                }
            });
    };
   
  
    $scope.UpdateServiceRequest = UpdateServiceRequest;
    function UpdateServiceRequest() {       
        var ParamServiceDetails = new FormData();        
        ParamServiceDetails.append("serviceRequestDetails", JSON.stringify({
            "serviceNumber": $scope.serviceRequestDetails.serviceNumber,
            "claimNumber": $scope.serviceRequestDetails.claimDetails.claimNumber,
            "description": $scope.serviceRequestDetails.description,
            //"assignDate": $scope.serviceRequestDetails.assignedDate,
            //"dateOfCompletion": $scope.serviceRequestDetails.completionDate,
            "targateDate": $scope.serviceRequestDetails.targetDate,
            "registrationNumber": ($scope.serviceRequestDetails.assignTo.registrationNumber == null) ? sessionStorage.getItem("CRN") : $scope.serviceRequestDetails.assignTo.registrationNumber,
            "serviceCost":250,
            "assignTo": {
                "vendorId": (($scope.serviceRequestDetails.assignTo!==null && angular.isDefined($scope.serviceRequestDetails.assignTo))?$scope.serviceRequestDetails.assignTo.vendorId:null),
            },
            "serviceCategory": {
                "id": ($scope.serviceRequestDetails.category != null) ? $scope.serviceRequestDetails.category.id : null,
                "name": ($scope.serviceRequestDetails.category != null) ? $scope.serviceRequestDetails.category.name : null,
            }
        }));
        if ($scope.FileList.length > 0) {
            angular.forEach($scope.FileList, function (item) {
                ParamServiceDetails.append("file", item.file);
            });
            ParamServiceDetails.append("filesDetails", JSON.stringify($scope.AttachmentDetails));
        }
       
        var UpdateServiceRequest = AdjusterServiceRequestService.UpdateServiceRequest(ParamServiceDetails);
        UpdateServiceRequest.then(function (success) {
            $scope.Status = success.data.status;
            if ($scope.Status == 200) {
                
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");
                $scope.GotoBack();
            };
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }

    //Delete service request
    $scope.Deleteservicerequest = Deleteservicerequest;
    function Deleteservicerequest() {
        bootbox.confirm({
            title: $translate.instant("AlertMessage.Update"),
            closeButton: false,
            className: "modalcustom",
            message: $translate.instant("AlertMessage.ConfirmDelete"),
            buttons: {
                confirm: {
                    label: $translate.instant("AlertMessage.YesBtn"),
                    className: 'btn-success'
                },
                cancel: {
                    label: $translate.instant("AlertMessage.NoBtn"),
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                if (result) {
                    var paramDelete = {
                        "serviceId": 1
                    };
                    var Deleteservice = AdjusterServiceRequestService.DeleteServiceRequest(paramDelete);
                    Deleteservice.then(function (success) {
                        if (success.data.status === 200) {
                            toastr.remove();
                            toastr.success(success.data.message, "Confirmation");
                            $scope.GotoBack();
                        }
                    }, function (error) {
                        toastr.remove();
                        toastr.error(error.data.errorMessage, "Error");
                    });
                }
            }
        });


    }

    $scope.getParticipants = getParticipants;
    function getParticipants() {
        var param = { "claimNumber": $scope.serviceRequestDetails.claimDetails.claimNumber }
        var getpromise = AdjusterServiceRequestService.getVendorsListAgainstClaim(param);
        getpromise.then(function (success) {
            $scope.ClaimParticipantsList = success.data.data;
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    }
    
    $scope.LoadPage=function()
    {
        var ht = angular.element("#ServiceRequestDiv")[0].offsetHeight;
        $scope.NoteHeight = ht-25;
    }
    $scope.GotoClaimDetails = function () {
        $location.url('AdjusterPropertyClaimDetails')
    }
    $scope.GotoBack = function () {
        $location.url('AdjusterPropertyClaimDetails')
    }
    $scope.GotoDashboard = GotoDashboard;
    function GotoDashboard()
    {
        $location.url(sessionStorage.getItem('HomeScreen'));
    }

    $scope.RemoveAttachment = RemoveAttachment;
    function RemoveAttachment(file) {
        bootbox.confirm({
            size: "",
            closeButton: false,
            title: "Delet media file",
            message: "Are you sure you want to delete this Media File?  <b>Please Confirm!",
            className: "modalcustom", buttons: {
                confirm: {
                    label: 'Yes',
                    className: 'btn-success'
                },
                cancel: {
                    label: 'No',
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                //if (result)  call delet function
                if (result) {
                    $(".page-spinner-bar").removeClass("hide");
                    var param = [{
                        id: angular.isUndefined(file.id) ? null : file.id

                    }]
                    var promis = AdjusterServiceRequestService.deleteMediaFile(param);
                    promis.then(function (success) {
                        if (angular.isDefined(file.id)) {
                            //Get Service details
                            var paramRequestId = { "serviceRequestId": $scope.ServiceRequestId }
                            var GetServiceDetails = AdjusterServiceRequestService.GetServiceDetails(paramRequestId);
                            GetServiceDetails.then(function (success) {
                                $scope.serviceRequestDetails = success.data.data;
                                getParticipants();
                                toastr.remove()
                                toastr.success(success.data.message, $translate.instant("SuccessHeading"));
                            }, function (error) { });

                        }

                        $(".page-spinner-bar").addClass("hide");
                    }, function (error) {
                        toastr.remove()
                        toastr.error(error.data.errorMessage, $translate.instant("ErrorHeading"));
                        $(".page-spinner-bar").addClass("hide");
                    });

                }
            }
        });
    }
    $scope.DeleteNotes = DeleteNotes;
    function DeleteNotes(item, participants) {
        bootbox.confirm({
            size: "",
            title: "Delete Note",
            message: "Are you sure want to delete the note?", closeButton: false,
            className: "modalcustom", buttons: {
                confirm: {
                    label: "Yes",
                    className: 'btn-success'
                },
                cancel: {
                    label: "No", //$translate.instant('ClaimDetails_Delete.BtnNo'),
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                if (result) {
                    if (angular.isDefined(item.noteUID) && item.noteUID !== null) {
                        $(".page-spinner-bar").removeClass("hide");
                        var registrationNumber = null;
                        angular.forEach(participants, function (participants) {
                            if (participants.crn != null) {
                                registrationNumber = participants.crn;
                            }
                        });
                        var param = {
                            "noteUID": item.noteUID, "registrationNumber": registrationNumber
                        };

                        var promis = AdjusterServiceRequestService.DeleteNote(param);
                        promis.then(function (success) {
                            GetNotes();
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
});