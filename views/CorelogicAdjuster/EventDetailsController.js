angular.module('MetronicApp').controller('EventDetailsController', function ($rootScope, $filter, $uibModal, $scope, $translate, $translatePartialLoader,
    EventService, objClaim) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('EventDetails');
    $translate.refresh();

    // -------Time picker--------------------------------
    $scope.HomeScreen = angular.isDefined(objClaim.HomeScreen) && objClaim.HomeScreen != null ? objClaim.HomeScreen : false; // to identify to show claim no or not
    /** @type {Date} */
    $scope.EventTime = new Date;
    /** @type {number} */
    $scope.hstep = 1;
    /** @type {number} */
    $scope.mstep = 15;
    $scope.options = {
        hstep: [1, 2, 3],
        mstep: [1, 5, 10, 15, 25, 30]
    };
    /** @type {boolean} */
    $scope.ismeridian = true;
    /**
     * @return {undefined}
     */
    $scope.toggleMode = function () {
        /** @type {boolean} */
        $scope.ismeridian = !$scope.ismeridian;
    };
    /**
     * @return {undefined}
     */
    $scope.update = function () {
        /** @type {Date} */

        var d = new Date;
        d.setHours(14);
        d.setMinutes(0);
        /** @type {Date} */
        $scope.EventTime = d;
    };
    /**
     * @return {undefined}
     */
    $scope.changed = function () {

        //$log.log("Time changed to: " + $scope.EventTime);
    };
    $scope.changed1 = function () {

        //$log.log("Time changed to: " + $scope.EventTime);
    };
    /**
     * @return {undefined}
     */
    $scope.clear = function () {
        /** @type {null} */
        $scope.EventTime = null;
    };

    //--------End Time Picker-------------------------------------------------------------  
    $scope.ParticipantsList = angular.isDefined(objClaim.ParticipantList) && objClaim.ParticipantList != null ? objClaim.ParticipantList : objClaim.event.participants;
    $scope.ClaimParticipantsList = angular.isDefined(objClaim.AllParticipantList) && objClaim.AllParticipantList != null ? objClaim.AllParticipantList : objClaim.event.participants;
    $scope.EventStartDate;
    $scope.EventEndDate;
    angular.forEach($scope.ParticipantsList, function (particiapant) {
        if (particiapant.firstName === null) {
            particiapant.firstName = "";
        };
        if (particiapant.lastName === null) {
            particiapant.lastName = "";
        };
    });

    //To enable or disable Accepted And rejected button on screen if alredy accepted or rejected
    $scope.isAcceptedOrRejected = false;
    angular.forEach(objClaim.event.participants, function (particiapant) {
        if ((particiapant.isAccepted == true || particiapant.isAccepted == false) && $scope.isAcceptedOrRejected != true) {
            $scope.isAcceptedOrRejected = true;
        }
    });

    $scope.EventDetails = objClaim.event;    
    $scope.PraticipantIdList = [];
    $scope.OldParticipantList = [];
    
    //Adding participants to list
    $scope.showisAccepted = false;
    $scope.showisRejected = false;
    angular.forEach($scope.EventDetails.participants, function (particiapnt) {
        $scope.PraticipantIdList.push(particiapnt.participantId);
        $scope.OldParticipantList.push(particiapnt.participantId);

        if (angular.isDefined(particiapnt.isAccepted)) {
            if (particiapnt.isAccepted == true)
                $scope.showisAccepted = true;
        }
        if (angular.isDefined(particiapnt.isRejected)) {
            if (particiapnt.isRejected == true)
                $scope.showisRejected = true;
        }
        
    });
    $scope.PraticipantIdList = $scope.ParticipantsList.map((arr)=>arr.userId)
    $scope.EventDate = $filter("DateFormatMMddyyyy")($scope.EventDetails.startTiming);
    //get start time
    $scope.EventStartDate = $filter("DateFormatMMddyyyy")($scope.EventDetails.startTiming);
    $scope.EventEndDate = $filter("DateFormatMMddyyyy")($scope.EventDetails.endTiming);
    $scope.EventDetails.startTiming = $filter("TimeFilterAMPM")($scope.EventDetails.startTiming);
  
   // $scope.EventDetails.startTiming = new Date($scope.EventDetails.startTiming);
    //get end time
    // $scope.EventDetails.endTiming = $filter("DateFormatMMddyyyyHHmmTime")($scope.EventDetails.endTiming);
    $scope.EventDetails.endTiming = $filter("TimeFilterAMPM")($scope.EventDetails.endTiming);
    //$scope.EventDetails.endTiming = new Date($scope.EventDetails.endTiming);
    $scope.reminderTime = angular.isUndefined($scope.EventDetails.reminderTime) ? "15" : $scope.EventDetails.reminderTime
    $scope.commonObj =
         {
             ClaimId: objClaim.claimId,
             OragnizerId: parseInt(sessionStorage.getItem("UserId")),
             ClaimNumber: null
         };

    $scope.cancel = function () {

        $scope.$close();
    };

    //Get Event date format
    function returnDateForEvent(dt,time) {
        return dt.replace(/\//g,'-') + 'T' + time+":00Z";
    }

    
    function convertTime12to24(time12h) {
        time12h = time12h.replace(' ','');
        const time = time12h.substring(0,5);
        const modifier = time12h.substring(5);
        // const time = modifier = time12h.split(' ');
        let [hours, minutes] = time.split(':');
        // let hours = minutes = time.split(':');
      
        if (hours === '12') {
          hours = '00';
        }
      
        if (modifier === 'PM') {
          hours = parseInt(hours, 10) + 12;
        }
      
        return `${hours}:${minutes}`;
      }
           

    //Update Event - Only Organizer can update event
    $scope.UpdateEvent = function () {
        var OldSelected = [];
        $scope.eventParticipants =[];
        var isInternal = true;
        var internalCount = 0;
        var ParticipantIds = [];
        var contactParticipant;
        var registrationNumber = null;
        angular.forEach($scope.ClaimParticipantsList, function (Participant) {
            angular.forEach($scope.PraticipantIdList, function (item) {
                if (Participant.userId == item) {
                    // if (Participant.participantType.participantType.toUpperCase() == 'EXISTING VENDOR' || Participant.participantType.participantType.toUpperCase() == 'EXISTING VENDOR' || Participant.participantType.participantType.toUpperCase() == 'NEW VENDOR' ||
                    //       Participant.participantType.participantType.toUpperCase() == 'VENDOR ASSOCIATE') {
                    //     isInternal = false;
                    // }
                    contactParticipant = $scope.ClaimParticipantsList.filter((x)=> x.userId==item)
                    if(contactParticipant[0].vendorUser)
                    {
                        isInternal = false;
                    }
                    $scope.eventParticipants.push({
                        "userId": item, "vendorUser":contactParticipant[0].vendorUser , userName:contactParticipant[0].userName, "participantType": { "id": item.participantType?.id, "participantType": item.participantType?.participantType }
                    });

                }                
            })
        });
        
        // if (isInternal == true) {
            // angular.forEach($scope.ClaimParticipantsList, function (Participant) {
            //     angular.forEach($scope.PraticipantIdList, function (item) {
            //         if (Participant.userId == item) {
            //             $scope.eventParticipants.push({
            //                 "userId": item, "vendorUser":contactParticipant[0].vendorUser , userName:contactParticipant[0].userName, "participantType": { "id": item.participantType?.id, "participantType": item.participantType?.participantType }
            //             });
            //         }
            //     });
            // });
            registrationNumber = sessionStorage.getItem("CRN")
        // } else {
        //     angular.forEach(objClaim.ParticipantList, function (Participant) {
        //         angular.forEach($scope.PraticipantIdList, function (item) {
        //             if (Participant.participantId == item) {
        //                 if (Participant.participantType.participantType == 'EXISTING VENDOR' || Participant.participantType.participantType == 'VENDOR ASSOCIATE') {
        //                     ParticipantIds.push({
        //                         //"email": angular.isUndefined(Participant.emailId) ? null : Participant.emailId,
        //                         "vendorRegistration": angular.isUndefined(Participant.vendorRegistration) ? null : Participant.vendorRegistration
        //                     });
        //                     registrationNumber = Participant.vendorRegistration;
        //                 }
        //                 else {
        //                     ParticipantIds.push({
        //                         "email": angular.isUndefined(Participant.emailId) ? null : Participant.emailId,
        //                         "vendorRegistration": angular.isUndefined(Participant.vendorRegistration) ? null : Participant.vendorRegistration
        //                     });
        //                 }
                    // }
            //     });
            // })
        // }
        $scope.deletedParticipants = $scope.ParticipantsList.filter(({ userId: id1 }) => !$scope.eventParticipants.some(({ userId: id2 }) => id2 === id1));

        $scope.deletedParticipants.map((x)=>x.isDelete=true);
        $scope.eventParticipants = [...$scope.eventParticipants,...$scope.deletedParticipants];
        var paramEvent = {
            "id": $scope.EventDetails.id,
            "claim": {
                "id": $scope.commonObj.ClaimId
            },
            "createDate": returnDateForEvent($scope.EventStartDate, convertTime12to24($scope.EventDetails.startTiming)),//"2017-01-11T12:10:30Z"
            "endTiming": returnDateForEvent($scope.EventEndDate, convertTime12to24($scope.EventDetails.endTiming)),//"2017-01-11T12:10:30Z"
            "isDone": false,
            "isReschedule": false,
            "item": {
                "id": null
            },
            "purpose": $scope.EventDetails.purpose,
            "startTiming": returnDateForEvent($scope.EventStartDate, 
                convertTime12to24($scope.EventDetails.startTiming)),//"2017-01-12T12:00:00Z".toISOString(),
            "title": $scope.EventDetails.title,
            "participants": $scope.eventParticipants,
            "organizer": {
                "email": sessionStorage.getItem("UserName")
            },
            "registrationNumber": null,
            "internal": isInternal,
            "isReminder": true,  // new added
            "reminderTime": $scope.EventDetails.reminderTime, // new added
        };

        //Hide old update parameter 10/04/2018
        //var param =
        //    {
        //        "id": $scope.EventDetails.id,
        //        "claim": {
        //            "id": $scope.commonObj.ClaimId
        //        },
        //        "createDate": null,
        //        "endTiming": returnDateForEvent($scope.EventStartDate, $scope.EventDetails.startTiming),
        //        "isDone": false,
        //        "isReschedule": false,
        //        "item": {
        //            "id": null
        //        },
        //        "purpose": $scope.EventDetails.purpose,
        //        "startTiming": returnDateForEvent($scope.EventEndDate, $scope.EventDetails.endTiming),//"2017-01-12T12:00:00Z".toISOString(),
        //        "title": $scope.EventDetails.title,
        //        "participants": OldSelected,
        //        "organizer": {
        //            "id": sessionStorage.getItem("UserId") //$scope.EventDetails.organizer.id
        //        }
        //    };
       
        var updateEvent = EventService.UpdateEvent(paramEvent);
        updateEvent.then(function (success) {

            $scope.$close("Success");
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    };


    $scope.AcceptOrRejectEvent = AcceptOrRejectEvent;
    function AcceptOrRejectEvent(status) {
        var param = {
            "id": $scope.EventDetails.id,
            "isAccepted": status
        };

        var AcceptOrRejectEventByParticipant = EventService.AcceptRejectEvent(param);
        AcceptOrRejectEventByParticipant.then(function (success) {
            $scope.$close("Success");
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    };


    $scope.DeleteEvent = DeleteEvent;
    function DeleteEvent()
    {
        var msg = "";
        if (angular.isDefined($scope.EventDetails.id)) {
            msg = "Are you sure want to delete Event<b>" + $scope.EventDetails.title + "</b>?";
        }
        else {
            msg = "Are you sure want to delete Event";
        }


        bootbox.confirm({
            size: "",
            title: "Delete Event",
            message: msg, closeButton: false,
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
                    if (angular.isDefined($scope.EventDetails.id) && $scope.EventDetails.id !== null) {
                        var param = {
                            "id": $scope.EventDetails.id,

                        };
                        var Delete = EventService.DeleteEventByUser(param);
                        Delete.then(function (success) {
                            $scope.$close("Success");
                            toastr.remove();
                            toastr.success(success.data.message, "Confirmation");
                        }, function (error) {
                            toastr.remove();
                            toastr.error(error.data.errorMessage, "Error");
                        });
                    };
                }
            }
        });
    }
});