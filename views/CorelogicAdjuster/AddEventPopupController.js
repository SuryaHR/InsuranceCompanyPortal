angular.module('MetronicApp').controller('AddEventPopupController', function ($rootScope,$filter, AdjusterPropertyClaimDetailsService, $uibModal, $scope, $translate, $translatePartialLoader,AllEventsService
    ) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    // var objClaim = $scope.objClaim ={
    //     claimId :'',
    //     ParticipantList: []
    // }
    $translatePartialLoader.addPart('AdjusterPropertyClaimDetails');
    $translate.refresh();
    //Variables
    $scope.ClaimParticipantsList = [];
    $scope.participantsForEvent = [];
    $scope.CommonObject = { "SeletedId": null };
    $scope.EventStartDate;
    $scope.EventEndDate;
    $scope.SelectedParticipants;
    $scope.CreateEventObject = {
        StartTime: "12:00 AM",
        EndTime: "12:00 PM",
        reminderTime: "15"
    };
    GetParticipantList();
    // -------Time picker--------------------------------
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
    //Get Event date format
    function returnDateForEvent(dt, time) {
        var startDate = dt.replace(/\//g,'-');
        return startDate + 'T' + time+":00Z";
    }

    function convertTime12to24(time12h) {
        const [time, modifier] = time12h.split(' ');
        // const time = modifier = time12h.split(' ');
        let [hours, minutes] = time.split(':');
        // let hours =  minutes = time.split(':');
      
        if (hours === '12') {
          hours = '00';
        }
      
        if (modifier === 'PM') {
          hours = parseInt(hours, 10) + 12;
        }
      
        return `${hours}:${minutes}`;
      }

    //Add note function
    $scope.ok = function (e) {
        var eventParticipants = [];
        var registration;
        var internal = true;
        $scope.currentDate = $filter("date")(Date.now(), 'MM/dd/yyyy');//current Date
        $scope.currentTime = $filter('date')(new Date(), 'HH:mm');//current time
        if ($scope.SelectedParticipants.length > 0) {
            angular.forEach($scope.SelectedParticipants, function (participant) {
                angular.forEach($scope.ClaimParticipantsList, function (item) {
                    if (participant === item.userId) {
                        // if (item.designation.name == 'VENDOR ASSOCIATE') {
                        //     angular.forEach($scope.ClaimParticipantsList, function (participant) {
                        //         if (participant.designation.name == 'EXISTING VENDOR') {
                        //             registration = angular.isDefined(participant) ? participant.vendorRegistration : null;
                        //         }
                        //     });
                        // }

                        // if (item.designation.name == 'EXISTING VENDOR') {
                        //     eventParticipants.push({
                        //         "participantId": participant, "participantType": { "id": item.participantType.id, "participantType": item.participantType.participantType }, "vendorRegistration": angular.isDefined(item) ? item.vendorRegistration : null
                        //     });
                        //     registration = angular.isDefined(item) ? item.vendorRegistration : null;
                        // }
                        // else {
                        //     eventParticipants.push({
                        //         "userId": participant, "email": item?.emailId, "participantType": { "id": item.participantType?.id, "participantType": item.participantType?.participantType }
                        //     });
                        // }
                        // if (item.participantType?.participantType.toUpperCase() == 'EXTERNAL' || item.participantType?.participantType.toUpperCase() == 'EXISTING VENDOR' || item.participantType?.participantType.toUpperCase() == 'NEW VENDOR' ||
                        //     item.participantType?.participantType.toUpperCase() == 'VENDOR ASSOCIATE') {
                        //     internal = false;
                        // }
                       
                        var contactParticipant = $scope.ClaimParticipantsList.filter((x)=> x.userId==participant)
                        if(contactParticipant[0].vendorUser)
                        {
                            internal = false;
                        }

                        eventParticipants.push({
                            "userId": participant, "vendorUser":contactParticipant[0].vendorUser , "userName":contactParticipant[0].userName,"companyUrl":contactParticipant[0].companyUrl, "participantType": { "id": item.participantType?.id, "participantType": item.participantType?.participantType }
                        });


                    }
                });
            });
        }
        var paramEvent = {
            "id": $scope.CommonObject.SeletedId,
            "claim": {
                "id": null
            },
            "createDate": returnDateForEvent($scope.currentDate, $scope.currentTime),//"2017-01-11T12:10:30Z"
            "endTiming": returnDateForEvent($scope.CreateEventObject.EventStartDate,
                convertTime12to24( $scope.CreateEventObject.EndTime)),//"2017-01-11T12:10:30Z"
            "isDone": false,
            "isReschedule": false,
            "item": {
                "id": null
            },

            "purpose": $scope.CreateEventObject.EventNote,
            "startTiming": returnDateForEvent($scope.CreateEventObject.EventStartDate,
                convertTime12to24($scope.CreateEventObject.StartTime)),//"2017-01-12T12:00:00Z".toISOString()
            "title": $scope.CreateEventObject.EventTitle,
            "participants": eventParticipants,
            "organizer": {
                "email": sessionStorage.getItem("UserName")
            },
            "registrationNumber": registration,
            "internal": internal,
            "isReminder": true,  // new added
            "reminderTime": $scope.CreateEventObject.reminderTime, // new added
        };

        var EventPromise = AdjusterPropertyClaimDetailsService.CreateEvent(paramEvent);
        EventPromise.then(function (success) {
            $scope.$close("Success");
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
            $scope.ErrorMessage = error.data.errorMessage;
        });
    }
    //Cancel
    $scope.cancel = function () {
        $scope.$close();
    };

    $scope.GetParticipantList = GetParticipantList;
    function GetParticipantList() {
        var GetParticipants = AllEventsService.GetAllParticipants();
        GetParticipants.then(function (success) {
            $scope.ParticipantList = success.data.data;
            $scope.ClaimParticipantsList = $scope.ParticipantList;
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; })
    };

    $scope.fun = function(){
        console.log($scope.SelectedParticipants);
    }
});