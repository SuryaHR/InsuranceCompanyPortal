angular.module('MetronicApp').controller('AddRequestPopupController', function ($rootScope, $filter, AdjusterPropertyClaimDetailsService, 
    $uibModal, $scope, $translate, $translatePartialLoader,RequestService,
    objClaim) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('AdjusterPropertyClaimDetails');
    $translate.refresh();
    //Variables
    $scope.ClaimParticipantsList = objClaim.ParticipantList.filter(function (participant) {
        return participant.lastName != null && participant.firstName != null;
    });
    $scope.participantsForEvent = [];
    $scope.CommonObject = { "SeletedId": null };
    $scope.EventStartDate;
    $scope.EventEndDate;
    $scope.SelectedParticipants;
    $scope.CreateEventObject = {
        reminderTime: "15",
        "StartTime" : {
            "hr" : "12",
            "min": "00",
            "mod" : "AM"
        },
        "DueTime" : {
            "hr" : "12",
            "min": "00",
            "mod" : "AM"
        }
    };
    $scope.Name = sessionStorage.getItem("Name");
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
    $scope.todaysDate = new Date();

    //--------End Time Picker-------------------------------------------------------------
    //Get Event date format
    function returnDateForEvent(dt, time) {
        var startDate = dt.replace(/\//g,'-');
        return startDate + 'T' + time+":00Z";
    }

    $scope.$watch('CreateEventObject.requestStartDate', validateDates);
    $scope.$watch('CreateEventObject.requestDueDate', validateDates);

    function validateDates() {
        if (!$scope.CreateEventObject) return;
        if ($scope.CreateEventForm.RequestDate.$error.invalidDate || $scope.CreateEventForm.RequestDueDate.$error.invalidDate) {
            $scope.CreateEventForm.RequestDate.$setValidity("endBeforeStart", true);  //already invalid (per validDate directive)
        } else {
            //depending on whether the user used the date picker or typed it, this will be different (text or date type).  
            //creating a new date object takes care of that.  
            var endDate = new Date($scope.CreateEventObject.requestDueDate);
            var startDate = new Date($scope.CreateEventObject.requestStartDate);
            $scope.CreateEventForm.RequestDate.$setValidity("endBeforeStart", endDate >= startDate);
        }
    }

    //Add note function
    $scope.ok = function (e) {
        $(".page-spinner-bar").removeClass("hide");
        var eventParticipants = [];
        var registration;
        var internal = true;
        $scope.currentDate = $filter("date")(Date.now(), 'MM/dd/yyyy');//current Date
        $scope.currentTime = $filter('date')(new Date(), 'HH:mm');//current time
        if ($scope.SelectedParticipants.length > 0) {
            angular.forEach($scope.SelectedParticipants, function (participant) {
                angular.forEach($scope.ClaimParticipantsList, function (item) {
                    if (participant === item.id) {
                            eventParticipants.push({
                                "id": participant, 
                                "participantType": { "id": item.participantType.id, "participantType": item.participantType.participantType }, 
                            });
                            registration = angular.isDefined(item) ? item.vendorRegistration : null;
                        }
                });
            });
        }
        let startDate = $filter('DatabaseDateFormatMMddyyyyTimeUTC')(formatDateInRequest(returnDateForEvent($scope.CreateEventObject.requestStartDate, RequestService.convertTime12to24($scope.CreateEventObject.StartTime.hr+":"+$scope.CreateEventObject.StartTime.min+" "+$scope.CreateEventObject.StartTime.mod))));
        let dueDate = $filter('DatabaseDateFormatMMddyyyyTimeUTC')(formatDateInRequest(returnDateForEvent($scope.CreateEventObject.requestDueDate, RequestService.convertTime12to24($scope.CreateEventObject.DueTime.hr+":"+$scope.CreateEventObject.DueTime.min+" "+$scope.CreateEventObject.DueTime.mod))));
        var paramRequest = {
            "id": $scope.CommonObject.SeletedId,
            "claim": {
                "id": objClaim.claimId
            },
            "createDate": returnDateForEvent($scope.currentDate, $scope.currentTime),//"2017-01-11T12:10:30Z"
            "isDone": false,
            "isReschedule": false,
            "item": {
                "id": null
            },

            "purpose": $scope.CreateEventObject.EventNote,
            "startDate": startDate,
            "dueDate": dueDate,
            "title": $scope.CreateEventObject.EventTitle,
            "participants": eventParticipants,
            "organizer": {
                "email": sessionStorage.getItem("UserName")
            },
            "registrationNumber": registration,
            "internal": internal,
            "isReminder": true,  // new added
            "priority": $scope.SelectedPriority// new added
        };

        var EventPromise = AdjusterPropertyClaimDetailsService.CreateReqeust(paramRequest);
        EventPromise.then(function (success) {
            $scope.$close("Success");
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
            $scope.ErrorMessage = error.data.errorMessage;
            $(".page-spinner-bar").addClass("hide");
        });
    }

    function formatDateInRequest(input) {
        var datetemp = input.split('T')[0];
        var dt = new Date(datetemp);
        var year = dt.getFullYear();
        var date = dt.getDate();
        if (parseInt(date) < 10)
            date = '0' + date;
        var month = parseInt(dt.getMonth()) + 1;
        if (parseInt(month) < 10)
            month = '0' + month;
        var time = (input.split('T')[1]).split('Z')[0];
        // time = time + '.000Z';
        return year + '-' + month + '-' + date + 'T' + time;
    }

    //Cancel
    $scope.cancel = function () {
        $scope.$close();
    };

    function doubleDigit(num){
        if(num.toString().length===1)
        {
            num="0"+num;
        }
      return num.toString();
    }

    $scope.mins=[];
    $scope.mins= [ ...Array(61).keys() ].map( i => doubleDigit(i));

    $scope.hrs=[];
    $scope.hrs =  [ ...Array(12).keys() ].map( i => doubleDigit(i+1));
});
