angular.module('MetronicApp').controller('DetailedInventoryController', function ($translate, $translatePartialLoader, $rootScope, $scope,
    $location, $uibModal, $filter, DetailedInventoryService, StatusConstants, PolicyInfoFactory) {

    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });

    //set language 
    $translatePartialLoader.addPart('PolicyHolderInventory');
    $translate.refresh();
    var policyFactoryInfo = PolicyInfoFactory.getPolicyInfo();
    $scope.commonObj =
    {
        claimNumber: sessionStorage.getItem("PolicyHolderClaimNo"),
        claimId: sessionStorage.getItem("PolicyHolderClaimId"),
        policy: policyFactoryInfo.policyInfo,
        userId: sessionStorage.getItem("UserId"),
        userName: sessionStorage.getItem("UserName")
    }
    $scope.room = {};
    $scope.currentInventoryTab = 'rooms';
    //Get Item / claim status
    $scope.constants = {
        itemStatus: StatusConstants.ItemStatus,
        invoiceStatus: StatusConstants.InvoiceStatus,
    };
    $scope.pagination = {
        current: 1,
    };
    $scope.searchPostLostItems = null;
    $scope.pagesize = 20;
    $scope.defaultRooms = {
        checkAll: false,
        showAddButton: false,
        showDiv: false
    }
    var originalRoomsList = [];

    function init() {
        getInventoryInfo();
        getRooms();
    }
    init();

    function getInventoryInfo() {
        var inventoryInfo = DetailedInventoryService.getInventoryInfo($scope.commonObj.claimNumber);
        inventoryInfo.then(function (success) {
            $scope.claimItemsInfo = success.data.data ? success.data.data : null;
            $scope.totalItems = $scope.claimItemsInfo ? $scope.claimItemsInfo.totalClaimedItems : 0;
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }
    $scope.userRooms = [];
    function getRooms() {
        $(".page-spinner-bar").removeClass("hide");
        var rooms = DetailedInventoryService.getRooms($scope.commonObj.claimId);
        rooms.then(function (success) {
            $scope.userRooms = success.data.data ? success.data.data : [];
            var fetchDefaultRooms = false;
            if (!$scope.userRooms || !$scope.userRooms.length) {
                showWelcomeMessage();
                //if no user rooms available fetch default rooms available for room-typr
                fetchDefaultRooms = true;
                $scope.defaultRooms.showDiv = true;
                $scope.selectedDefaultRooms = [];
            }
            getRoomTypes(fetchDefaultRooms);
            originalRoomsList = angular.copy($scope.userRooms);
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }

    $scope.roomTypes = [];
    function getRoomTypes(fetchDefaultRooms) {
        var roomTypes = DetailedInventoryService.getRoomTypes(fetchDefaultRooms);
        roomTypes.then(function (success) {
            $scope.roomTypes = success.data.data;
            if (fetchDefaultRooms) {
                angular.forEach($scope.roomTypes, function (type) {
                    if (type.rooms) {
                        angular.forEach(type.rooms, function (defaultRoom) {
                            defaultRoom.isDefaultRoom = true;
                            defaultRoom.roomType = {
                                id: type.id,
                                name: type.name
                            }
                            let id = defaultRoom.id;
                            defaultRoom.id = "DR-" + id;
                            $scope.userRooms.push(defaultRoom);
                        })
                        originalRoomsList = angular.copy($scope.userRooms);
                    }
                });
            }
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }

    //Welcome Modal message    
    function showWelcomeMessage() {
        bootbox.alert({
            size: "medium",
            message: "Hey " + ($scope.commonObj.policy.policyHolder ? $scope.commonObj.policy.policyHolder.firstName : "") + "! lets start by adding all the rooms in your house. "
                + "You can either select the prelisted house or add a room of your choice.",
            closeButton: true,
            centerVertical: true,
            onEscape: true,
            className: "modalcustom",
            buttons: {
                ok: {
                    label: 'Lets get started!',
                    className: 'btn-outline green'
                }
                // ,cancel: {
                //     label: 'No',
                //     className: 'btn-outline red hide'
                // }
            },
            callback: function () {
            }
        });
    }

    $scope.toClaimCenter = function () {
        $location.path("PolicyHolderMyClaims");
    }

    $scope.toClaim = function () {
        $location.path("PolicyholderClaimDetails");
    }
    $scope.changeView = function (tab) {
        $scope.currentInventoryTab = tab;
        if (tab === 'list') {
            $scope.pagination = {
                current: 1,
            };
            $scope.searchPostLostItems = null;
            $scope.sortKey = null;
            $scope.reverse = false;
            $scope.limit = 50;
            $scope.moreShown = false;
            getPostLostItems();
        }
        else {
            getRooms();
        }
    }

    $scope.getPostLostItems = getPostLostItems;
    function getPostLostItems() {
        $(".page-spinner-bar").removeClass("hide");
        var param = {
            "claimNumber": $scope.commonObj.claimNumber,
            "pagination": {
                "pageNumber": $scope.pagination.current,
                "limit": $scope.pagesize,
                "sortBy": $scope.sortKey,
                "orderBy": $scope.reverse ? "desc" : "asc",
            },
            "searchKeyword": $scope.searchPostLostItems ? $scope.searchPostLostItems : '',
        }
        var getpromise = DetailedInventoryService.getPostLostItemsWithComparables(param);
        getpromise.then(function (success) {
            $scope.FiletrLostDamageList = [];
            var res = success.data.data;
            if (res != null) {
                $scope.FiletrLostDamageList = res.itemReplacement;
                if ($scope.pagination.current == 1)
                    $scope.lastRecord = $scope.FiletrLostDamageList.length;
                else {
                    $scope.lastRecord = $scope.FiletrLostDamageList.length + ($scope.pagesize * ($scope.pagination.current - 1))
                }
                $scope.totalItems = res.totalItems;
                mapFilterLostDamageList();
            }
            else
                $scope.totalItems = 0;
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
            $(".page-spinner-bar").addClass("hide");
        });
    }

    function mapFilterLostDamageList() {
        $scope.TotalOfACVs = 0;
        $scope.TotalOfRCVs = 0;
        angular.forEach($scope.FiletrLostDamageList, function (item) {
            item.claimItem.itemNumber = Number(item.claimItem.itemNumber);
            item.claimItem.associateName = "";
            if (item.claimItem && item.claimItem.status && item.claimItem.status.id === 4) {
                item.isQuoteSubmittedByVendor = true;
            } else {
                item.isQuoteSubmittedByVendor = false;
            }
            if (item.claimItem.ageMonths != null && item.claimItem.ageMonths != " " && item.claimItem.ageMonths != "") {
                item.claimItem.ageMonths = parseInt(item.claimItem.ageMonths);
            }
            else {
                item.claimItem.ageMonths = 0;
            }
            if (item.claimItem.ageYears != null && item.claimItem.ageYears != " " && item.claimItem.ageYears != "") {
                item.claimItem.ageYears = parseInt(item.claimItem.ageYears);
            }
            else {
                item.claimItem.ageYears = 0;
            }
            if (item.claimItem.status.status != $scope.constants.itemStatus.assigned || item.claimItem.status.status != $scope.constants.itemStatus.approved ||
                item.claimItem.status.status != $scope.constants.itemStatus.settled || item.claimItem.status.status != $scope.constants.itemStatus.repaced) {
                $scope.creaAssignmentFlag = false;
            }
            if (item.claimItem.vendorAssociate) {
                item.claimItem.associateName = item.claimItem.vendorAssociate.lastName + ", " + item.claimItem.vendorAssociate.firstName
            }
            // Calculate of Total ACVs / RCVs
            if (item.claimItem.acv != null) {
                $scope.TotalOfACVs += item.claimItem.acv;
            }
            if (item.comparableItems != null && item.comparableItems[0].unitPrice != null) {
                $scope.TotalOfRCVs += item.comparableItems[0].unitPrice;
            }
        });
    }

    $scope.goToDetails = function (item) {
        sessionStorage.setItem("PolicyHolderPostLostItemId", item.claimItem.id)
        let index = $scope.FiletrLostDamageList.findIndex(function (i) {
            return i.claimItem.id === item.claimItem.id;
        })
        sessionStorage.setItem("pageIndex", index);
        $location.url('PolicyholderItemDetails');
    }

    $scope.roomModal = null;
    $scope.addUserRoom = addUserRoom;
    function addUserRoom() {
        //$scope.room = {};
        $scope.roomModal = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                size: 'sm',
                templateUrl: "views/PolicyHolder/AddUserRoom.html",
                backdrop: 'static',
                keyboard: false,
                transclude: false,
                scope: $scope,
            });
        $scope.roomModal.result.then(
            function () {
                //$scope.roomModal.close()                
            },
            function () {
                //$scope.roomModal.dismiss()
                $scope.room = {};
            }
        );
        return {
            open: open,
        };
    }

    $scope.addRoom = function () {
        $(".page-spinner-bar").removeClass("hide");
        var req = {
            "claim": {
                "claimNumber": $scope.commonObj.claimNumber
            },
            "policyNumber": $scope.commonObj.policy.policyNumber,
            "roomName": $scope.room.name,
            "roomType": {
                id: $scope.room.type.id
            },
            "id": $scope.room.isDefaultRoom ? null : $scope.room.id
        }
        if (!req.id) {
            var newRoom = DetailedInventoryService.addNewRoom(req);
            newRoom.then(function (success) {
                var res = success.data.data;
                if (res) {
                    res.isNew = true
                    if ($scope.room.isDefaultRoom) {
                        $scope.userRooms.splice($scope.userRooms.findIndex(r => r.id === $scope.room.id), 1);
                        $scope.userRooms.unshift(res);
                    }
                    else {
                        $scope.userRooms.unshift(res);
                        var nextItem = $scope.userRooms[1];
                        if (nextItem) {
                            nextItem.isNew = false;
                        }
                    }
                    $scope.room = {};
                }
                $scope.roomModal.close();
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
                $(".page-spinner-bar").addClass("hide");
            });
        }
        else {
            var updateRoom = DetailedInventoryService.updateRoom(req);
            updateRoom.then(function (success) {
                var updatedRoom = success.data.data;
                var index = $scope.userRooms.findIndex(userRoom => userRoom.id === updatedRoom.id);
                if (index > -1)
                    $scope.userRooms.splice(index, 1);
                $scope.userRooms.unshift(updatedRoom);
                $scope.room = {};
                $scope.roomModal.close();
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
                $(".page-spinner-bar").addClass("hide");
            });
        }
        originalRoomsList = angular.copy($scope.userRooms);
    }

    $scope.roomDetails = function (room) {
        $rootScope.roomDetails = {};
        $rootScope.roomDetails = angular.copy(room);
        $location.url("/room/" + room.id);
    }

    $scope.editRoom = function (room, index) {
        $scope.room = {
            id: room.id,
            name: room.roomName,
            type: room.roomType,
            //if default room
            isDefaultRoom: room.isDefaultRoom,
        };
        addUserRoom();
    }

    $scope.removeRoom = function (room, index) {
        if (room.isDefaultRoom) {
            $scope.userRooms.splice(index, 1);
        }
        else {
            $(".page-spinner-bar").removeClass("hide");
            var deleteRoom = DetailedInventoryService.deleteRoom(room);
            deleteRoom.then(function (success) {
                var existingIndex = -1;
                angular.forEach($scope.userRooms, function (userRoom, i) {
                    if (userRoom.id === room.id) {
                        existingIndex = i
                    }
                });
                if (existingIndex > -1)
                    $scope.userRooms.splice(existingIndex, 1)

                originalRoomsList = angular.copy($scope.userRooms);
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
                $(".page-spinner-bar").addClass("hide");
            });
        }
    }

    $scope.sortpostlostitem = function (keyname) {
        $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false; //if true make it false and vice versa 
        $scope.sortKey = keyname; //set the sortKey to the param passed
        $scope.pagination.current = 1;
        getPostLostItems();
    }

    $scope.nextItemsPage = function (pageNum) {
        $scope.pagination = {
            current: pageNum,
        };
        // $scope.sortKey = null;
        // $scope.reverse = false;
        // $scope.searchPostLostItems = null;
        getPostLostItems();
    };

    $scope.customSearch = customSearch
    function customSearch(searchQuery) {
        $scope.searchPostLostItems = angular.isDefined(searchQuery) && searchQuery != null && searchQuery.length > 0 ? searchQuery : '';
        $scope.pagination.current = 1;
        getPostLostItems();
    }

    $scope.selectAllDefaultRooms = function () {
        angular.forEach($scope.userRooms, function (room) {
            if (room.isDefaultRoom) {
                room.selected = $scope.defaultRooms.checkAll;
            }
        });
        $scope.defaultRooms.showAddButton = $scope.defaultRooms.checkAll;
    }

    $scope.selectDefaultRoom = function () {
        let flag = 0, defaultItemsCount = 0;
        angular.forEach($scope.userRooms, function (room) {
            if (room.isDefaultRoom)
                defaultItemsCount++;
            if (room.selected)
                flag++;
        });
        $scope.defaultRooms.showAddButton = flag >= 1 ? true : false;
        $scope.defaultRooms.checkAll = flag != defaultItemsCount ? false : true;
    }

    $scope.addMultipleRooms = function () {
        $(".page-spinner-bar").removeClass("hide");
        let defaultRoomsCount = 0, removeRoomIds = [], selectedDefaultRooms = [];
        angular.forEach($scope.userRooms, function (room) {
            if (room.isDefaultRoom) {
                defaultRoomsCount++;
                if (room.selected) {
                    selectedDefaultRooms.push({
                        "claim": {
                            "claimNumber": $scope.commonObj.claimNumber
                        },
                        "policyNumber": $scope.commonObj.policy.policyNumber,
                        "roomName": room.roomName,
                        "roomType": {
                            id: room.roomType.id
                        },
                        "id": room.isDefaultRoom ? null : room.id
                    });
                    removeRoomIds.push(room.id);
                }
            }
        });
        if (selectedDefaultRooms.length > 0) {
            var multipleRooms = DetailedInventoryService.addMultipleRooms(selectedDefaultRooms, $scope.commonObj.claimId);
            multipleRooms.then(function (success) {
                var res = success.data.data;
                if (res) {
                    angular.forEach(removeRoomIds, function (id) {
                        let index = $scope.userRooms.findIndex(r => r.id === id)
                        if (index > -1)
                            $scope.userRooms.splice(index, 1);
                    })
                    angular.forEach(res, function (savedRoom) {
                        savedRoom.isNew = true
                        $scope.userRooms.unshift(savedRoom);
                    });

                    $scope.defaultRooms = {
                        checkAll: false,
                        showAddButton: false,
                        showDiv: (defaultRoomsCount - selectedDefaultRooms.length) > 0 ? true : false
                    }
                }
                $(".page-spinner-bar").addClass("hide");
                originalRoomsList = angular.copy($scope.userRooms);
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
                $(".page-spinner-bar").addClass("hide");
            });
        }
        else {
            toastr.remove();
            toastr.warning("No rooms selected", "Warning");
        }
    }

    $scope.searchRoomByKeyword = function (keyword) {
        $scope.userRooms = angular.copy(originalRoomsList);
        $scope.userRooms = $filter('filter')($scope.userRooms, keyword);
        $scope.defaultRooms.checkAll = false;
    }
});