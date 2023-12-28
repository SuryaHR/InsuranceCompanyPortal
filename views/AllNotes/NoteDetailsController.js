angular.module('MetronicApp').controller('NoteDetailsController', function ($rootScope, $scope,   $uibModal, $translate,
    $translatePartialLoader,AuthHeaderService, AdjusterPropertyClaimDetailsService, NoteObj) {
    
    $scope.NoteDetails = NoteObj.Note;   
    $scope.UserId = sessionStorage.getItem("UserId");

    //Cancel / close popup
    $scope.cancel = function () {
        $scope.$close();
    };

    $scope.DeleteNote = DeleteNote;
    function DeleteNote(item, ParticipantsList)
    {
        var registrationNumber = null;
        angular.forEach(ParticipantsList, function (participants) {
            if (participants.crn != null) {
                registrationNumber = participants.crn;
            }
        });
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
                        var param = {
                            "noteUID": item.noteUID, "registrationNumber": registrationNumber
                        };
                        var promis = AdjusterPropertyClaimDetailsService.DeleteNote(param);
                        promis.then(function (success) {
                            $scope.$close();
                            $(".page-spinner-bar").addClass("hide");
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
    }
});