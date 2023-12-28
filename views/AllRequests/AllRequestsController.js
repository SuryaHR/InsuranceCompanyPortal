angular.module('MetronicApp').controller('AllRequestsController', function ($rootScope, $log, $scope,
    settings, $http, $timeout, $uibModal, $location, $translate, $translatePartialLoader, $compile, uiCalendarConfig, $filter, AllRequestsService) {

    //set language
    $translatePartialLoader.addPart('AllRequests');
    $translate.refresh();
    $scope.ParticipantList;
    $scope.RequestList;
    $scope.ClaimDetails = JSON.parse(sessionStorage.getItem("ClaimObj"));
    function init() {
        if ($scope.ClaimDetails != null && angular.isDefined($scope.ClaimDetails)) {
            if ($scope.ClaimDetails.IsClaimRequest == false) {
                $(".page-spinner-bar").removeClass("hide");
                GetParticipantList();
                populateUpcomingRequest();
            }
            else {
                $(".page-spinner-bar").removeClass("hide");
                GetParticipantList();
                populate();
            }
        }
        else {
            populateUpcomingRequest();
        }
    }
    init();
    $scope.GetParticipantList = GetParticipantList;
    function GetParticipantList() {
        var param = { "claimNumber": $scope.ClaimDetails.ClaimNumber }
        var GetParticipants = AllRequestsService.GetParticipants(param);
        GetParticipants.then(function (success) {
            $scope.ParticipantList = success.data.data;
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; })

    };

    //Request Claendar
    $scope.SelectedRequest = null;
    var isFirstTime = true;
    $scope.requests = [];
    $scope.requestSources = [$scope.requests];

    $scope.NewRequest = {};
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
            uiCalendarConfig.calendars.myCalendar.fullCalendar('removeRequests');
            uiCalendarConfig.calendars.myCalendar.fullCalendar('unselect');
        }
    }

    //Load requests from server
    // will put this to a method 
    function populate() {
        clearCalendar();
        var paramClaimId = { "id": $scope.ClaimDetails.ClaimId }
        var RequestListPromise = AllRequestsService.GetRequestList(paramClaimId);
        RequestListPromise.then(function (data) {
            $scope.requests.length = 0;
            $scope.requests.slice(0, $scope.requests.length);
            angular.forEach(data.data.data, function (value) {
                var dt = new Date($filter('DateFormatyyyyMMddHHmmTime')(value.startTiming));
                $scope.requests.push({
                    Request: value,
                    id: value.id,
                    title: value.title,
                    description: value.purpose,
                    start: new Date($filter('DateFormatyyyyMMddHHmmTime')(value.startDate)).toString(),
                    end: new Date($filter('DateFormatyyyyMMddHHmmTime')(value.dueDate)).toString(),
                    allDay: false,
                    stick: true,
                    className: ((value.isDone) ? 'isDone' : ((value.isReschedule) ? 'isReschedule' : 'isNotDone'))

                });
            });
            if (angular.isDefined($scope.requests[0]) && $scope.requests[0] != null)
                uiCalendarConfig.calendars.myCalendar.fullCalendar('gotoDate', $scope.requests[0].start);
            $(".page-spinner-bar").addClass("hide");
        });

    };

    function populateUpcomingRequest() {
        $(".page-spinner-bar").removeClass("hide");
        clearCalendar();
        var GetRequestList = AllRequestsService.getRequestList();
        GetRequestList.then(function (success) {
            $scope.RequestList = success.data.data;

            angular.forEach($scope.RequestList, function (request) {
                request.PrticipantString = "";
                angular.forEach(request.participants, function (participant, key) {
                    request.PrticipantString += participant.firstName == null ? "" : participant.firstName;
                    request.PrticipantString += participant.lastName == null ? "" : participant.lastName;
                    if (key != request.participants.length - 1) {
                        request.PrticipantString += ",";
                    }
                });

            });
            $scope.requests.length = 0;
            $scope.requests.slice(0, $scope.requests.length);
            angular.forEach($scope.RequestList, function (value) {
                var dt = new Date($filter('DateFormatyyyyMMddHHmmTime')(value.startTiming));
                $scope.requests.push({
                    Request: value,
                    id: value.id,
                    title: value.title,
                    description: value.purpose,
                    start: new Date($filter('DateFormatyyyyMMddHHmmTime')(value.startDate.toString())),
                    end: new Date($filter('DateFormatyyyyMMddHHmmTime')(value.startDate.toString())),
                    allDay: true,
                    stick: true,
                    className: ((value.isDone) ? 'isDone' : ((value.isReschedule) ? 'isReschedule' : 'isNotDone'))

                });
            });
            console.log($scope.requests);
            if (angular.isDefined($scope.requests[0]) && $scope.requests[0] != null)
                uiCalendarConfig.calendars.myCalendar.fullCalendar('gotoDate', $scope.requests[0].start);
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
            displayRequestTime: true,
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
                $scope.NewRequest = {
                    RequestID: 0,
                    StartAt: fromDate.toString(),
                    EndAt: endDate.toString(),
                    IsFullDay: false,
                    Title: '',
                    Description: ''
                }

                //$scope.ShowModal();
                //$scope.alertOnRequestClick();
            },
            eventClick: function (request) {

                $scope.SelectedRequest = request;
                var fromDate = moment(request.start).format('YYYY/MM/DD LT');
                var endDate = moment(request.end).format('YYYY/MM/DD LT');
                $scope.NewRequest = {
                    RequestID: request.id,
                    StartAt: fromDate,
                    EndAt: endDate,
                    IsFullDay: false,
                    Title: request.title,
                    Description: request.description
                }

                //$scope.ShowModal();
                $scope.ShowRequestModal(request);
            },
            eventAfterAllRender: function () {
                if ($scope.requests.length > 0 && isFirstTime) {
                    //Focus first request
                    if (angular.isDefined($scope.requests[0]) && $scope.requests[0] != null)
                        uiCalendarConfig.calendars.myCalendar.fullCalendar('gotoDate', $scope.requests[0].start);
                    $scope.date = $scope.requests[0].start;
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

    $scope.ShowRequestModal = function (request) {

        var obj = {
            "claimId": angular.isDefined($scope.ClaimDetails) && $scope.ClaimDetails != null ? $scope.ClaimDetails.ClaimId : request.Request.claim.id,
            "ParticipantList": $scope.ParticipantList,
            "request": angular.copy(request.Request),
            "HomeScreen": angular.isDefined($scope.ClaimDetails) && $scope.ClaimDetails != null ? false : true
        };
        $scope.animationsEnabled = true;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/Adjuster/RequestDetails.html",
                controller: "RequestDetailsController",
                resolve:
                {
                    objClaim: function () {
                        return obj;
                    }
                }

            });
        out.result.then(function (value) {
            //Call Back Function success
            if (value === "Success") {

                //$scope.GetRequestList();
                angular.isDefined($scope.ClaimDetails) && $scope.ClaimDetails != null ? populate() : populateUpcomingRequest();
            }

        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };
    };

    //Add New Request
    $scope.AddNewRequest = function () {
        var obj = {
            "claimId": $scope.ClaimDetails.ClaimId,
            "ParticipantList": $scope.ParticipantList
        };

        $scope.animationsEnabled = true;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/Adjuster/AddRequestPopup.html",
                controller: "AddRequestPopupController",
                resolve:
                {
                    objClaim: function () {
                        return obj;
                    }
                }

            });
        out.result.then(function (value) {
            //Call Back Function success
            if (value === "Success") {
                populate();
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
        uiCalendarConfig.calendars.myCalendar.fullCalendar('gotoDate', $scope.date.toString());
    }

});