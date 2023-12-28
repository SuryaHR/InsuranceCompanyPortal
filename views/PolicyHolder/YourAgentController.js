angular.module('MetronicApp').controller('YourAgentController', function ($translate, $translatePartialLoader, $scope, $uibModal, $rootScope, $state, settings,
    $location, MyPaymentService) {
    //$scope.$on('$viewContentLoaded', function () {
    //    // initialize core components
    //    App.initAjax();
    //});
    $scope.PageSize = $rootScope.settings.pagesize;
    $translatePartialLoader.addPart('MyProfile');
    $translate.refresh();

    $scope.AgentDetails = {};
    $scope.ErrorMessage;
    function init() {
        //get agent details
        var GetAgent = MyPaymentService.getAgentDetails();
        GetAgent.then(function (success) {
            $scope.AgentDetails = success.data.data;
            getLanLat();
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    };
    init();

    //Map region
    var infoWindow = new google.maps.InfoWindow();
    //var mapOptions = {
    //    zoom: 10,
    //    center: new google.maps.LatLng(18.5204303, 73.8567437),
    //    mapTypeId: google.maps.MapTypeId.ROADMAP
    //};
    var mapOptions = {
        zoom: 10,
        center: new google.maps.LatLng(null, null),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
    $scope.markers = [];
    $scope.cities = [];
    $scope.ResultList = [];
    var image = {
        url: "assets/layouts/layout3/img/map-pin-1.png", // url
        scaledSize: new google.maps.Size(30, 30), // scaled size
        origin: new google.maps.Point(0, 0), // origin
        anchor: new google.maps.Point(0, 0) // anchor
    };
    var marker = new google.maps.Marker({
        map: $scope.map,
        position: new google.maps.LatLng("18.5204303", "73.8567437"),
        title: "Pune",
        icon: image
    });
    marker.content = '<div class="">' + '</div>';
    //MouseOver Event
    google.maps.event.addListener(marker, 'mouseover', function () {
        infoWindow.setContent('<span class="">' + marker.title + '</span>' + marker.content);
        infoWindow.open($scope.map, marker);
    });
    google.maps.event.addListener(map, 'click', function (event) {
        placeMarker(event.latLng);
    });

    function placeMarker(location) {
        var marker = new google.maps.Marker({
            position: location,
            map: map
        });
    }
    //Click Event
    google.maps.event.addListener(marker, 'click', function (e) {
        
        getLanLat();
    });
    $scope.markers.push(marker);
    //$scope.openInfoWindow = function (e, selectedMarker) {
    //    e.preventDefault();
    //    google.maps.event.trigger(selectedMarker, 'mouseover');
    //}



    function getLanLat() {
        var CompletAddress = "";
        if ($scope.AgentDetails.agentAddress !== null && angular.isDefined($scope.AgentDetails.agentAddress)) {
            if ($scope.AgentDetails.agentAddress.completeAddress !== null && $scope.AgentDetails.agentAddress.completeAddress !== "" && angular.isDefined($scope.AgentDetails.agentAddress.completeAddress)) {
                CompletAddress = $scope.AgentDetails.agentAddress.completeAddress;
            }
        }
        else {
            CompletAddress = "15 N 1st St #100, Belleville, IL 62220, USA"
        }
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({
            address: CompletAddress,
            region: 'no'
        },
            function (results, status) {
                if (status.toLowerCase() == 'ok') {
                    // Get center

                    var coords = new google.maps.LatLng(
                        results[0]['geometry']['location'].lat(),
                        results[0]['geometry']['location'].lng()
                    );

                    // Set marker also
                    var mapProp = {
                        center: new google.maps.LatLng(results[0]['geometry']['location'].lat(), results[0]['geometry']['location'].lng()),
                        zoom: 10,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    };
                    map = new google.maps.Map(document.getElementById('map'), mapProp);
                    var marker = new google.maps.Marker({
                        map: $scope.map,
                        position: new google.maps.LatLng(results[0]['geometry']['location'].lat(), results[0]['geometry']['location'].lng()),
                        title: "Pune",
                        icon: image
                    });
                    placeMarker(new google.maps.LatLng(results[0]['geometry']['location'].lat(), results[0]['geometry']['location'].lng()));

                }
            }
        );
    }

});