angular.module('MetronicApp').controller('RequestDetailsController', function ($rootScope, $filter, $uibModal, $scope, $translate, $translatePartialLoader,
    RequestService, objClaim) {
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    $translatePartialLoader.addPart('RequestDetails');
    $translate.refresh();

    // -------Time picker--------------------------------
    $scope.HomeScreen = angular.isDefined(objClaim.HomeScreen) && objClaim.HomeScreen != null ? objClaim.HomeScreen : false; // to identify to show claim no or not
    /** @type {Date} */
    $scope.RequestTime = new Date;
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
        $scope.RequestTime = d;
    };
    /**
     * @return {undefined}
     */
    $scope.changed = function () {

        //$log.log("Time changed to: " + $scope.RequestTime);
    };
    $scope.changed1 = function () {

        //$log.log("Time changed to: " + $scope.RequestTime);
    };
    /**
     * @return {undefined}
     */
    $scope.clear = function () {
        /** @type {null} */
        $scope.RequestTime = null;
    };

    $scope.priorities = [{ type: "urgent" }, { type: "normal" }, { type: "minor" }]

    //--------End Time Picker-------------------------------------------------------------  

    $scope.ParticipantsList = angular.isDefined(objClaim.ParticipantList) && objClaim.ParticipantList != null ? objClaim.ParticipantList : objClaim.Request.participants;
    $scope.ParticipantsList = $scope.ParticipantsList.filter(function (participant) {
        return participant.lastName != null && participant.firstName != null;
    });
    $scope.RequestStartDate;
    $scope.RequestEndDate;
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
    angular.forEach(objClaim.request.participants, function (particiapant) {
        if ((particiapant.isAccepted == true || particiapant.isAccepted == false) && $scope.isAcceptedOrRejected != true) {
            $scope.isAcceptedOrRejected = true;
        }
    });

    $scope.RequestDetails = objClaim.request;
    $scope.PraticipantIdList = [];
    $scope.OldParticipantList = [];

    $scope.todaysDate = new Date();

    //Adding participants to list
    $scope.showisAccepted = false;
    $scope.showisRejected = false;
    angular.forEach($scope.RequestDetails.participants, function (particiapnt) {
        $scope.PraticipantIdList.push(particiapnt.id);
        $scope.OldParticipantList.push(particiapnt.id);

        if (angular.isDefined(particiapnt.isAccepted)) {
            if (particiapnt.isAccepted == true)
                $scope.showisAccepted = true;
        }
        if (angular.isDefined(particiapnt.isRejected)) {
            if (particiapnt.isRejected == true)
                $scope.showisRejected = true;
        }

    });
    $scope.startDate = $filter("DateFormatMMddyyyy")(returnDateForRequest($scope.RequestDetails.startDate));
    $scope.StartTime = $filter("DateFormatTime")($scope.RequestDetails.startDate);
    var[time,mod] = $scope.StartTime.toString().split(' ');
    var [hr,min] = time.split(':');
    $scope.StartTime ={
        'hr' : hr,
        'min' : min,
        'mod' : mod
    }
    $scope.dueDate = $filter("DateFormatMMddyyyy")($scope.RequestDetails.dueDate);
    $scope.DueTime = $filter("DateFormatTime")($scope.RequestDetails.dueDate);
    var[time,mod] = $scope.DueTime.toString().split(' ');
    var [hr,min] = time.split(':');
    $scope.DueTime ={
        'hr' : hr,
        'min' : min,
        'mod' : mod
    }

    $scope.RequestDetails.startTiming = $filter("TimeFilterHHmm")($scope.RequestDetails.startTiming);
    $scope.RequestDetails.endTiming = $filter("TimeFilterHHmm")($scope.RequestDetails.endTiming);
    $scope.reminderTime = angular.isUndefined($scope.RequestDetails.reminderTime) ? "15" : $scope.RequestDetails.reminderTime
    $scope.commonObj =
    {
        ClaimId: objClaim.claimId,
        OragnizerId: parseInt(sessionStorage.getItem("UserId")),
        ClaimNumber: objClaim.request.claim.claimNumber
    };


    $scope.$watch('startDate', validateDates);
    $scope.$watch('dueDate', validateDates);

    function validateDates() {
        if (!($scope.startDate && $scope.dueDate)) return;
        if ($scope.CreateRequestForm.RequestDate.$error.invalidDate || $scope.CreateRequestForm.RequestDueDate.$error.invalidDate) {
            $scope.CreateRequestForm.RequestDueDate.$setValidity("endBeforeStart", true);  //already invalid (per validDate directive)
        } else {
            //depending on whether the user used the date picker or typed it, this will be different (text or date type).  
            //creating a new date object takes care of that.  
            var endDate = new Date($scope.dueDate);
            var startDate = new Date($scope.startDate);
            $scope.CreateRequestForm.RequestDueDate.$setValidity("endBeforeStart", endDate >= startDate);
        }
    }
    $scope.cancel = function () {

        $scope.$close();
    };

    //Get Request date format
    function returnDateForRequest(dt, time) {
        return dt.replace(/\//g, '-') + 'T' + time + ":00Z";
    }

    //Update Request - Only Organizer can update Request
    $scope.UpdateRequest = function () {
        var isInternal = true;
        var ParticipantIds = [];
        var registrationNumber = null;
        $scope.currentDate = $filter("date")(Date.now(), 'MM/dd/yyyy');//current Date
        $scope.currentTime = $filter('date')(new Date(), 'HH:mm');//current time
        angular.forEach(objClaim.ParticipantList, function (Participant) {
            angular.forEach($scope.PraticipantIdList, function (item) {
                if (Participant.id == item) {
                    ParticipantIds.push({
                        "id": angular.isUndefined(Participant.id) ? null : Participant.id,
                        "vendorRegistration": angular.isUndefined(Participant.vendorRegistration) ? null : Participant.vendorRegistration
                    });
                }
            });
        });
        registrationNumber = sessionStorage.getItem("CRN");

        let startDate = $filter('DatabaseDateFormatMMddyyyyTimeUTC')(formatDateInRequest(returnDateForRequest($scope.startDate, RequestService.convertTime12to24($scope.StartTime.hr+":"+$scope.StartTime.min+" "+$scope.StartTime.mod))));
        let dueDate = $filter('DatabaseDateFormatMMddyyyyTimeUTC')(formatDateInRequest(returnDateForRequest($scope.dueDate, RequestService.convertTime12to24($scope.DueTime.hr+":"+$scope.DueTime.min+" "+$scope.DueTime.mod))));

        var paramRequest = {
            "id": $scope.RequestDetails.id,
            "claim": {
                "id": $scope.commonObj.ClaimId
            },
            "createDate": returnDateForRequest($scope.currentDate, $scope.currentTime),//"2017-01-11T12:10:30Z"
            "isDone": false,
            "isReschedule": false,
            "purpose": $scope.RequestDetails.purpose,
            "startDate": startDate,
            "dueDate": dueDate,
            "title": $scope.RequestDetails.title,
            "participants": ParticipantIds,
            "organizer": {
                "email": sessionStorage.getItem("UserName")
            },
            "registrationNumber": registrationNumber,
            "internal": isInternal,
            "isReminder": true,  // new added
            "reminderTime": $scope.RequestDetails.reminderTime, // new added
            "priority": $scope.RequestDetails.priority
        };

        var updateRequest = RequestService.UpdateRequest(paramRequest);
        updateRequest.then(function (success) {

            $scope.$close("Success");
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    };

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

    $scope.CompleteRequest = CompleteRequest;
    function CompleteRequest(status) {
        if (!status) {
            $scope.$close("Success");
            return false;
        }
        var param = {
            "id": $scope.RequestDetails.id,
            "completed": status
        };

        var CompleteRequestByParticipant = RequestService.completeRequest(param);
        CompleteRequestByParticipant.then(function (success) {
            $scope.$close("Success");
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    };


    $scope.DeleteRequest = DeleteRequest;
    function DeleteRequest() {
        var msg = "";
        if (angular.isDefined($scope.RequestDetails.id)) {
            msg = "Are you sure want to delete Request <b>" + $scope.RequestDetails.title + "</b>?";
        }
        else {
            msg = "Are you sure want to delete Request";
        }


        bootbox.confirm({
            size: "",
            title: "Delete Request",
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
                    if (angular.isDefined($scope.RequestDetails.id) && $scope.RequestDetails.id !== null) {
                        var param = {
                            "id": $scope.RequestDetails.id,

                        };
                        var Delete = RequestService.DeleteRequestByUser(param);
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