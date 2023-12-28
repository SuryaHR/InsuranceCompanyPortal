angular.module('MetronicApp').controller('AllEventsController', function ($rootScope, $log, $scope,
    settings, $http, $timeout, $uibModal, $location, $translate, $translatePartialLoader, $compile, uiCalendarConfig, $filter, AllEventsService) {

    //set language
    $translatePartialLoader.addPart('AllEvents');
    $translate.refresh();
    $scope.ParticipantList;
    $scope.EventList;
    $scope.ClaimDetails = JSON.parse(sessionStorage.getItem("ClaimObj"));
    function init() {
        // if ($scope.ClaimDetails != null && angular.isDefined($scope.ClaimDetails)) {
        //     if ($scope.ClaimDetails.IsClaimEvent == false) {
        //         $(".page-spinner-bar").removeClass("hide");
        //         GetParticipantList();
        //         populateUpcomingEvent();
        //     }
        //     else {
        //         $(".page-spinner-bar").removeClass("hide");
        //         GetParticipantList();
        //         populate();
        //     }
        // }
        // else {
            GetParticipantList();
            populateUpcomingEvent();
        // }
    }
    init();
    // $scope.GetParticipantList = GetParticipantList;
    // function GetParticipantList() {
    //     var param = { "claimNumber": $scope.ClaimDetails.ClaimNumber }
    //     var GetParticipants = AllEventsService.GetParticipants(param);
    //     GetParticipants.then(function (success) {
    //         $scope.ParticipantList = success.data.data;
    //     }, function (error) { $scope.ErrorMessage = error.data.errorMessage; })

    // };

    //Event Claendar
    $scope.SelectedEvent = null;
    var isFirstTime = true;
    $scope.events = [];
    $scope.eventSources = [$scope.events];

    $scope.NewEvent = {};
    //this function for get datetime from json date
    function getDate(datetime) {
        if (datetime != null) {
            var mili = datetime.replace(/\/Date\((-?\d+)\)\//, '$1');
            return new Date(parseInt(mili));
        }
        else {
            return "";
        }
    }
    // this function for clear clender enents
    function clearCalendar() {
        if (uiCalendarConfig.calendars.myCalendar != null) {
            uiCalendarConfig.calendars.myCalendar.fullCalendar('removeEvents');
            uiCalendarConfig.calendars.myCalendar.fullCalendar('unselect');
        }
    }

    //Load events from server
    // will put this to a method 
    function populate() {
        clearCalendar();
        var paramClaimId = { "id": null }
        var EventListPromise = AllEventsService.GetEventList(paramClaimId);
        EventListPromise.then(function (data) {
            $scope.events.slice(0, $scope.events.length);
            angular.forEach(data.data.data, function (value) {
                var dt = new Date($filter('DateFormatyyyyMMddHHmmTime')(value.startTiming));
                $scope.events.push({
                    Event: value,
                    id: value.id,
                    title: value.title,
                    description: value.purpose,
                    start: new Date($filter('DateFormatyyyyMMddHHmmTime')(value.startTiming)),
                    end: new Date($filter('DateFormatyyyyMMddHHmmTime')(value.endTiming)),
                    allDay: false,
                    stick: true,
                    className: ((value.isDone) ? 'isDone' : ((value.isReschedule) ? 'isReschedule' : 'isNotDone'))

                });
            });
            if (angular.isDefined($scope.events[0]) && $scope.events[0] != null)
                uiCalendarConfig.calendars.myCalendar.fullCalendar('gotoDate', $scope.events[0].start);
            $(".page-spinner-bar").addClass("hide");
        });

    };

    function populateUpcomingEvent() {
        $(".page-spinner-bar").removeClass("hide");
        clearCalendar();
        var GetEventList = AllEventsService.getEventList();
        GetEventList.then(function (success) {
            $scope.EventList = success.data.data;
             
            angular.forEach($scope.EventList, function (event) {
                event.PrticipantString = "";
                angular.forEach(event.participants, function (participant, key) {
                    event.PrticipantString += participant.firstName == null ? "" : participant.firstName;
                    event.PrticipantString += participant.lastName == null ? "" : participant.lastName;
                    if (key != event.participants.length - 1) {
                        event.PrticipantString += ",";
                    }
                });

            });

            $scope.events.slice(0, $scope.events.length);
            angular.forEach($scope.EventList, function (value) {
                var dt = new Date($filter('DateFormatyyyyMMddHHmmTime')(value.startTiming));
                $scope.events.push({
                    Event: value,
                    id: value.id,
                    title: value.title,
                    description: value.purpose,
                    start: new Date($filter('DateFormatyyyyMMddHHmmTime')(value.startTiming)),
                    end: new Date($filter('DateFormatyyyyMMddHHmmTime')(value.endTiming)),
                    allDay: false,
                    stick: true,
                    className: ((value.isDone) ? 'isDone' : ((value.isReschedule) ? 'isReschedule' : 'isNotDone'))

                });
            });
            if (angular.isDefined($scope.events[0]) && $scope.events[0]!=null)
                uiCalendarConfig.calendars.myCalendar.fullCalendar('gotoDate', $scope.events[0].start);
            $(".page-spinner-bar").addClass("hide");
           
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            $(".page-spinner-bar").addClass("hide");
         
        });

    };

    //configure calendar
    $scope.uiConfig = {
        calendar: {
            height: 500,
            editable: false,
            displayEventTime: true,
            header: {
                left: 'agendaWeek,agendaDay',
                center: 'title',
                right: 'today prev,next'
            },
            timeFormat: {
                month: ' ', // for hide on month view
                agenda: 'h:mm a'
            },
            selectable: false,
            selectHelper: true, defaultView: 'agendaWeek',
            select: function (start, end) {
                var fromDate = moment(start).format('YYYY/MM/DD LT');
                var endDate = moment(end).format('YYYY/MM/DD LT');
                $scope.NewEvent = {
                    EventID: 0,
                    StartAt: fromDate,
                    EndAt: endDate,
                    IsFullDay: false,
                    Title: '',
                    Description: ''
                }

                //$scope.ShowModal();
                //$scope.alertOnEventClick();
            },
            eventClick: function (event) {

                $scope.SelectedEvent = event;
                var fromDate = moment(event.start).format('YYYY/MM/DD LT');
                var endDate = moment(event.end).format('YYYY/MM/DD LT');
                $scope.NewEvent = {
                    EventID: event.id,
                    StartAt: fromDate,
                    EndAt: endDate,
                    IsFullDay: false,
                    Title: event.title,
                    Description: event.description
                }

                //$scope.ShowModal();
                $scope.ShowEventModal(event);
            },
            eventAfterAllRender: function () {
                if ($scope.events.length > 0 && isFirstTime) {
                    //Focus first event
                    if (angular.isDefined($scope.events[0]) && $scope.events[0] != null)
                         uiCalendarConfig.calendars.myCalendar.fullCalendar('gotoDate', $scope.events[0].start);
                    $scope.date = $scope.events[0].start;
                    isFirstTime = false;
                }
            }
        }
    };

    $scope.GoToDashboard = function () {
        $location.url(sessionStorage.getItem("HomeScreen"));
    };
    $scope.Back = function () {
        window.history.back();
    };

    $scope.ShowEventModal = function (event) {

        var obj = {
            "claimId": null,
            "ParticipantList": $scope.ParticipantList,
            "AllParticipantList": $scope.ClaimParticipantsList,
            "event": angular.copy(event.Event),
            "HomeScreen": true
        };
        $scope.animationsEnabled = true;
        var out = $uibModal.open(
        {
            animation: $scope.animationsEnabled,
            templateUrl: "views/Adjuster/EventDetails.html",
            controller: "EventDetailsController",
            resolve:
            {
                objClaim: function () {
                    objClaim = obj;
                    return objClaim;
                }
            }

        });
        out.result.then(function (value) {
            //Call Back Function success
            if (value === "Success") {

                //$scope.GetEventList();
                angular.isDefined($scope.ClaimDetails) && $scope.ClaimDetails != null ? populate() : populateUpcomingEvent();
            }

        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };
    };

    //Add New Event
    $scope.AddNewEvent=function()
    {
        // var obj = {
        //     "claimId": $scope.ClaimDetails.ClaimId,
        //     "ParticipantList": $scope.ParticipantList
        // };

        $scope.animationsEnabled = true;
        var out = $uibModal.open(
        {
            animation: $scope.animationsEnabled,
            templateUrl: "views/Adjuster/AddEventPopup.html",
            controller: "AddEventPopupController",
            resolve:
            {
                // objClaim: function () {
                //     objClaim = obj;
                //     return objClaim;
                // }
            }

        });
        out.result.then(function (value) {
            //Call Back Function success
            if (value === "Success") {
                populate();
                init();
            }

        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };
        //}

    }

    //--------------------------------   
    $scope.GoToDt = function () {
        uiCalendarConfig.calendars.myCalendar.fullCalendar('gotoDate', $scope.date);
    }

    $scope.GetParticipantList = GetParticipantList;
    function GetParticipantList() {
        var GetParticipants = AllEventsService.GetAllParticipants();
        GetParticipants.then(function (success) {
            $scope.ClaimParticipantsList =success.data.data;
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; })
    };

});