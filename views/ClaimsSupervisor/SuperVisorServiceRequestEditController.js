angular.module('MetronicApp').controller('SuperVisorServiceRequestEditController', function ($rootScope, $uibModal, $scope, settings, $filter, SuperVisorServiceRequestService, $location, $translate, $translatePartialLoader) {
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
    $scope.ClaimId = sessionStorage.getItem("SupervisorClaimId");
    function init() {
        $scope.ServiceRequestId = sessionStorage.getItem("ServiceRequestId");
        if ($scope.ServiceRequestId === null || angular.isUndefined($scope.ServiceRequestId)) {
            sessionStorage.setItem("ServiceRequestId", null);
            $location.url("SupervisorClaimDetails");
        }
        else {
            //Get Serbvice request details

            //Get notes attached to service
            getNotes();
            //Get statusList
            var GetStatusList = SuperVisorServiceRequestService.GetStatusList();
            GetStatusList.then(function (success) {
                $scope.StatusList = success.data.data;
            }, function (error) {
                $scope.ErrorMessage = error.errorMessage;
            });
            var param = {
                "companyId": sessionStorage.getItem("CompanyId")
            }
            var NewServiceRequest = SuperVisorServiceRequestService.getCategoriesList(param);
            NewServiceRequest.then(function (success) {
                $scope.ServiceCategoryList = success.data.data;
            }, function (error) { $scope.ErrorMessage = error.errorMessage });
            var paramRequestId = { "serviceRequestId": $scope.ServiceRequestId }
            var GetServiceDetails = SuperVisorServiceRequestService.GetServiceDetails(paramRequestId);
            GetServiceDetails.then(function (success) {
                $scope.serviceRequestDetails = success.data.data;
            }, function (error) { });
        }
    }
    init();

    //Go to Assign service screen 
    $scope.GotoAssign = function () {
        sessionStorage.setItem("ServiceRequestId", $scope.ServiceRequestId);
        $location.url("SuperVisorAssignServiceRequest");
    }
    //Notes section
    function getNotes() {
        let paramServiceId = { "serviceRequestId": $scope.ServiceRequestId };
        var GetServiceRequestNotes = SuperVisorServiceRequestService.GetServiceRequestNotes(paramServiceId);
        GetServiceRequestNotes.then(function (success) {
            $scope.NoteListForService = success.data.data;
        }, function (error) { $scope.Errormessage = error.data.errorMessage });
    }

    //Add note
    $scope.AddNote = function (e) {
        var data = new FormData();
        data.append("mediaFilesDetail", JSON.stringify([{ "fileName": $scope.fileName, "fileType": $scope.fileType, "extension": $scope.FileExtension, "filePurpose": "NOTE", "latitude": null, "longitude": null }]))
        data.append("noteDetail", JSON.stringify({
            //"serviceId": $scope.ServiceRequestId,
            //"addedBy": "CORPORATE USER",
            //"addedById": sessionStorage.getItem("UserId"),
            //"message": $scope.CommonObj.ItemNote

             "claimId": $scope.ClaimId,
            "itemId": null,
            "serviceId": $scope.ServiceRequestId,
           "isPublicNote": true,
           "message": $scope.CommonObj.ItemNote,
           "groupDetails":null 
        }));
        data.append("file", $scope.files);
        var getpromise = SuperVisorServiceRequestService.addNote(data);
        getpromise.then(function (success) {
            $scope.Status = success.data.status;
            if ($scope.Status == 200) {
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");

                $scope.CommonObj.claimNote = "";
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
            let fr = new FileReader();
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

    $scope.getFileDetails = function (e) {
        $scope.SelectedFileList = "";
        $scope.$apply(function () {
            var files = event.target.files;
            $scope.UploadedFiles = e.files;
            $scope.SelectedFileNames.push(e.files[0].name);
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                $scope.SelectedFileList += file.name;
                if (i != files.length - 1)
                {
                    $scope.SelectedFileList += ",";
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

    $scope.GotoBack = function () {
        sessionStorage.setItem("ServiceRequestId", null)
        $location.url('SupervisorClaimDetails')
    }
    $scope.UpdateServiceRequest = UpdateServiceRequest;
    function UpdateServiceRequest() {
        var ParamServiceDetails = new FormData();
        ParamServiceDetails.append("serviceRequestDetails", JSON.stringify({
            "serviceId": $scope.serviceRequestDetails.serviceRequestId,
            "claimId": $scope.serviceRequestDetails.claimDetails.id,
            "description": $scope.serviceRequestDetails.description,
            "assignDate": $scope.serviceRequestDetails.assignedDate,
            "dateOfCompletion": $scope.serviceRequestDetails.completionDate,
            "targateDate": $scope.serviceRequestDetails.targetDate,
            "assignTo": {
                "vendorId": ((angular.isDefined($scope.serviceRequestDetails.SeletedVendor) && $scope.serviceRequestDetails.SeletedVendor !== null) ? $scope.serviceRequestDetails.SeletedVendor : null)
            },
            "serviceCategory": {
                "id": ($scope.serviceRequestDetails.category != null) ? $scope.serviceRequestDetails.category.id : null
            },
            "status": {
                "statusId": $scope.serviceRequestDetails.status.statusId
            }
        }));
        if ($scope.FileList.length > 0) {
            angular.forEach($scope.FileList, function (item) {
                ParamServiceDetails.append("file", item.file);
            });
            ParamServiceDetails.append("filesDetails", JSON.stringify($scope.AttachmentDetails));
        }

        var UpdateServiceRequest = SuperVisorServiceRequestService.UpdateServiceRequest(ParamServiceDetails);
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
                        "serviceId": $scope.serviceRequestDetails.serviceRequestId
                    };
                    var Deleteservice = SuperVisorServiceRequestService.DeleteServiceRequest(paramDelete);
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
    //End Service Request
    $scope.GotoDashboard = GotoDashboard;
    function GotoDashboard() {
        $location.url(sessionStorage.getItem('HomeScreen'));
    }
});