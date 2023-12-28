angular.module('MetronicApp')
.controller('PolicyHolderClaimDetailsController', function ($translate, $translatePartialLoader, $rootScope, $log, $scope,
    settings, $http, $window, $location, $uibModal, $filter, PolicyHolderClaimDetailsService, AdjusterLineItemDetailsService, PolicyInfoFactory) {

    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });

    //set language
    $translatePartialLoader.addPart('PolicyHolderClaimDetails');
    $translate.refresh();

    //-------------------------------Varaibles----------------------------------------------//
    $scope.CreateEventObject = {
        "EventDate": null,
        "EventTitle": null,
        "StartTime": null,
        "Endtime": null,
        "EventNote": null
    };
    $scope.claimStatus = { id: 1 };
    $scope.pagesize = $rootScope.settings.pagesize;
    $scope.itemPageSize = $rootScope.settings.itemPagesize;
    $scope.currentAttchment = null;
    $scope.ClaimStatusInvoiceDetails = [];
    $scope.ClaimStatusContent = [];
    $scope.ClaimAttachments = [];
    $scope.ClaimParticipantsList = []; //We are adding vendor list to this object which is used for autocomplete extender
    $scope.ParticipantId = null;
    $scope.ParticipantName = "";
    $scope.ErrorMessage = "";
    $scope.FiletrLostDamageList = [];
    $scope.OriginalPostLossItem = [];
    $scope.DdlSourceCategoryList = [];
    $scope.LostDamagedContentByCategory = [];
    $scope.SubCategory = [];
    $scope.VendorsAgainstClaim = [];
    $scope.ClaimNotes = [];
    $scope.SelectedPostLostItems = [];
    $scope.EventList = [];
    $scope.PolicyDetails = [];
    $scope.ServiceRequestList = [];

    // CTB-2308
    $scope.claimMessages = [];
    var currentMessagePage = 1;
    var scrollItemsLimit = 5;
    var totalMessagePages = 0;
    $scope.LogList = [];
    $scope.PaymentSummary = [];

    //$scope.sortKey = "claimItem.id"//setting by defult sorting by created date
    sessionStorage.setItem("SelectedItemList", $scope.SelectedPostLostItems);
    sessionStorage.setItem("ServiceRequestId", "");

    $scope.ContentTab = 'ClaimDetails';//For displaying active tab at the page load
    $scope.EventsTab = 'Notes';//For displaying active tab at the page load
    //Pending task list
    $scope.PendingTaskList = [];
    //----------------------------End Varaibles----------------------------------------------//

    // Expand / collapse long descriptions
    $scope.limit = 30;
    $scope.desclimit = 30;
    $scope.moreShown = false;
    $scope.descMoreShown = false;

    //------Show hide variables and functions for hide and show div--------------------------//
    $scope.displayEvent = true;
    $scope.displayNotes = false;
    $scope.displayParticipant = false;
    $scope.displayOrigionalItems = true;
    $scope.displayContentList = false;
    $scope.reverseIcon = true;
    $scope.displayClaimDetails = false;
    $scope.displayAddAttachmentbtn = true;
    $scope.displayClaimFileName = false;

    $scope.tab = 'Contents';

    $scope.deletedItemAttachments = [];
    $scope.attachmentList = [];

    $scope.ShowEvent = function () {
        $scope.displayEvent = true;
        $scope.displayNotes = false;
        $scope.displayAttachment = false;
        $scope.displayParticipant = false;
    }
    $scope.ShowNotes = function () {
        $scope.displayEvent = false;
        $scope.displayNotes = true;
        $scope.displayAttachment = false;
        $scope.displayParticipant = false;
    }
    $scope.ShowParticipant = function () {
        $scope.displayEvent = false;
        $scope.displayNotes = false;
        $scope.displayAttachment = false;
        $scope.displayParticipant = true;
    }
    $scope.ShowAttachments = function () {
        $scope.displayEvent = false;
        $scope.displayNotes = false;
        $scope.displayParticipant = false;
        $scope.displayAttachment = true;
    }

    $scope.showOriginalItems = function () {
        $scope.displayOrigionalItems = true;
        $scope.displayContentList = false;
    }
    $scope.showContentList = function () {
        $scope.displayOrigionalItems = false;
        $scope.displayContentList = true;
    }
    $scope.showDetails = function () {
        $scope.displayClaimDetails = !$scope.displayClaimDetails;

        $scope.reverseIcon = !$scope.reverseIcon;
    }
    //------End Show hide variables for hide and show div-----------------------------------------//


    //----------Sorting of datatbale--------------------------------------------------------------//

    $scope.sortServiceRequest = function (keyname) {
        $scope.sortServiceRequestKey = keyname;   //set the sortKey to the param passed
        $scope.sortServiceRequestreverse = !$scope.sortServiceRequestreverse; //if true make it false and vice versa
    }
    $scope.sortpostlostitem = function (keyname) {
        $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false;
        $scope.sortKey = keyname;
    };
    $scope.sortVendor = function (keyname) {
        $scope.sortVendorKey = keyname;
        $scope.reverseVendor = !$scope.reverseVendor;
    }

    $scope.sortClaimDetails = function (keyname) {
        $scope.sortClaimDetailsKey = keyname;
        $scope.reverseClaimDetails = !$scope.reverseClaimDetails;
    }
    //----------Sorting of datatbale--------------------------------------------------------------//

    //--------------page load function-------------------------------------------------------------//
    function init() {
        $scope.CommonObj =
        {
            ClaimNumber: sessionStorage.getItem("PolicyHolderClaimNo"),
            ClaimId: sessionStorage.getItem("PolicyHolderClaimId"),
            UserId: sessionStorage.getItem("UserId"),
            claimNote: "",
            eventNote: "",
            Categories: "ALL",
            Attachment: '',
            EventTitle: "",
            ClaimProfile: sessionStorage.getItem("claimProfile"),
            UserRole: sessionStorage.getItem("RoleList"),
            EventDate: $filter('date')(new Date(), "dd/MM/yyyy"),
            user : sessionStorage.getItem("RoleList"),            
        };
        if ($scope.CommonObj.ClaimId != null || $scope.CommonObj.ClaimNumber != null) {
            //show loader
            $(".page-spinner-bar").removeClass("hide");
            //get post lost items #162
            GetPostLostItems();
            // get claim notes API New-#126
            GetNotes();
            //get claim attachments #156

            // CTB-2308
            // GetClaimAttachment();
            GetInsuranceCompanyDetails();
            GetSettlementSummary();
            GetCategory();
            if (window.location.href.indexOf("/Policyholder_Add_Item") > -1) {
                getRooms();
                getRetailers();
            }
            getClaimParticipant();
            //GetEventList();
            getRequestList();

            // CTb-2308
            getMessages();
            getRecentDocuments();
            getClaimLog();

            //get claim status details for invoice section API #155
            // var param = { "id": $scope.CommonObj.ClaimId };
            // var getpromise = PolicyHolderClaimDetailsService.getClaimsStatusInvoiceDetails(param);
            // getpromise.then(function (success) { $scope.ClaimStatusInvoiceDetails = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

            //get claim status details for content section API #158
            var param = {
                "id": $scope.CommonObj.ClaimId,
                "claimNumber": $scope.CommonObj.ClaimNumber
            };
            var getpromise = PolicyHolderClaimDetailsService.getClaimsStatusContentDetails(param);
            getpromise.then(function (success) { $scope.ClaimStatusContent = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

            // get active vendors against claim with all details for binding to grid
            var param = { "claimNumber": $scope.CommonObj.ClaimNumber }
            var getpromise = PolicyHolderClaimDetailsService.getVendorsAgainstClaimDetails(param);
            getpromise.then(function (success) { $scope.VendorsAgainstClaim = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

            var GetPaymentSummary = PolicyHolderClaimDetailsService.GetPaymentSummary(param);
            GetPaymentSummary.then(function (success) {
                $scope.PaymentSummary = success.data.data;
                GetTotalPaidAmount();
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });

            // get active vendors against claim for autocomplete textbox
            var param = { "claimNumber": $scope.CommonObj.ClaimNumber }
            var getpromise = PolicyHolderClaimDetailsService.getVendorsListAgainstClaim(param);
            getpromise.then(function (success) { $scope.ClaimParticipantsList = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
            var paramUserTaskListList = {
                "claimId": $scope.CommonObj.ClaimId
            };
            var GetPendingTaskPromise = PolicyHolderClaimDetailsService.GetPendingTask(paramUserTaskListList);
            GetPendingTaskPromise.then(function (success) { $scope.PendingTaskList = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

            //Get Policy Details
            var param = { "policyNumber": null, "claimNumber": $scope.CommonObj.ClaimNumber }; var getPolicyDetails = PolicyHolderClaimDetailsService.getPolicyDetails(param);
            getPolicyDetails.then(function (success) { $scope.PolicyDetails = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
            // Get Claim Status
            $scope.ClaimStatusList = [];
            var claimStatusList = PolicyHolderClaimDetailsService.GetClaimStatusList();
            claimStatusList.then(function (success) { $scope.ClaimStatusList = success.data.data; }, function (error) { })
        }
        else {
            $location.url('PolicyholderMyClaim'); //if session data is lost then redirect to previous page

        }

        if ($scope.CommonObj.ClaimProfile == "Jewelry") {
            sessionStorage.setItem("CurrentCategoryJewelryId", 30);
            $scope.selected = {
                isScheduledItem: false, category: { id: parseInt(sessionStorage.getItem("CurrentCategoryJewelryId")) },
                individualLimitAmount: 0
            }
            // individualLimitAmount: sessionStorage.getItem("IndividualLimitJewelryCat")
        }
        else {
            $scope.selected = { isScheduledItem: false, category: { id: null } };
        }
        //var param = {
        //    "claimId": $scope.CommonObj.ClaimId
        //};
        //var getServiceRequestList = PolicyHolderClaimDetailsService.getServiceRequestList(param);
        //getServiceRequestList.then(function (success) { $scope.ServiceRequestList = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    }
    init();
    //---------End page load function--------------------------------------------------------------//


    //---------------Other functions---------------------------------------------------------------//

    $scope.GetNotes = GetNotes;
    function GetNotes(event) {
        if (event && event === 'refresh')
            $(".note_refresh_spinner").addClass("fa-spin");
        var param = { "claimId": $scope.CommonObj.ClaimId }
        var getpromise = PolicyHolderClaimDetailsService.getClaimNotes(param);
        getpromise.then(function (success) {
            $scope.ClaimNotes = []; $scope.ClaimNotes = success.data.data;
            //$scope.ClaimNotes = $filter('orderBy')($scope.ClaimNotes, 'createDate');
            //$scope.ClaimNotes = $filter('orderBy')($scope.ClaimNotes, 'createDate');
            angular.forEach($scope.ClaimNotes, function (note) {
                note.ParticipantList = "";
                angular.forEach(note.participants, function (participant, key) {
                    note.ParticipantList += participant.name ? participant.name : '';
                    if (key != note.participants.length - 1) {
                        note.ParticipantList += ' , ';
                    }
                });
            });
            if (event && event === 'refresh')
                $(".note_refresh_spinner").removeClass("fa-spin");
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    };

    $scope.goToActivityLog = goToActivityLog;
    function goToActivityLog() {
        $location.url('ActivityLog');
    }
    $scope.goToPolicyCoverage = goToPolicyCoverage;
    function goToPolicyCoverage(){
        $location.url('PolicyCoverage');
    }
    $scope.goToClaimItems = goToClaimItems;
    function goToClaimItems(){
        $location.url('ClaimItems');
    }

    $scope.GetClaimAttachment = GetClaimAttachment
    function GetClaimAttachment() {
        var param = { "claimNumber": $scope.CommonObj.ClaimNumber.toString() };
        var getpromise = PolicyHolderClaimDetailsService.getClaimAttachments(param);
        getpromise.then(function (success) {
            $scope.ClaimAttachments = [];
            $scope.ClaimAttachments = success.data.data;

        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    };

    $scope.GetPostLostItems = GetPostLostItems;
    function GetPostLostItems() {
        $(".page-spinner-bar").removeClass("hide");
        var param = { "claimNumber": $scope.CommonObj.ClaimNumber };
        var getpromise = PolicyHolderClaimDetailsService.getPostLostItemsWithComparables(param);
        getpromise.then(function (success) {
            $scope.FiletrLostDamageList = [];
            if (success.data.data) {
                $scope.itemPageSize = $scope.totalItems = success.data.data.totalItems
                $scope.FiletrLostDamageList = success.data.data.itemReplacement;
                $scope.OriginalPostLossItem = success.data.data.itemReplacement;
                $scope.LostDamagedContentByCategory = success.data.data.itemReplacement;
            } else {
                $scope.OriginalPostLossItem = [];
                $scope.LostDamagedContentByCategory = [];
            }
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");

        });
    };

    $scope.GetEventList = GetEventList;
    function GetEventList() {
        var paramClaimId = { "id": $scope.CommonObj.ClaimId }
        var EventListPromise = PolicyHolderClaimDetailsService.GetEventList(paramClaimId);
        EventListPromise.then(function (success) {
            $scope.EventList = [];
            $scope.EventList = success.data.data;
            //Getting accepted event
            angular.forEach($scope.EventList, function (event) {
                //event.IsPaticiapntAccepted = "false";
                if (event.organizer.id == parseInt($scope.CommonObj.UserId)) {
                    event.IsPaticiapntAccepted = "creator";
                }
                else {
                    angular.forEach(event.participants, function (participant, key) {
                        if (participant.id == parseInt($scope.CommonObj.UserId)) {
                            if (participant.isAccepted == true) {
                                event.IsPaticiapntAccepted = "true";
                            }
                            else if (participant.isAccepted == null) {
                                event.IsPaticiapntAccepted = "pending";
                            }
                            else if (participant.isAccepted == false) {
                                event.IsPaticiapntAccepted = "false";
                            }
                        }
                    });
                }
            });
            //Getting participant list as string
            angular.forEach($scope.EventList, function (event) {
                event.particiapntsTstring = '';
                angular.forEach(event.participants, function (participant, key) {
                    participant.firstName = ((participant.firstName == null) ? participant.firstName = "" : participant.firstName);
                    participant.lastName = ((participant.lastName == null) ? participant.lastName = "" : participant.lastName);

                    event.particiapntsTstring += participant.firstName + " " + participant.lastName
                    if (key != event.participants.length - 1) {
                        event.particiapntsTstring += ',';
                    }
                });
            });
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            $(".page-spinner-bar").addClass("hide");
        })
    }

    $scope.getRequestList = getRequestList;
    function getRequestList() {
        var paramClaimId = { "id": $scope.CommonObj.ClaimId }
        var requestListPromise = PolicyHolderClaimDetailsService.GetRequestList(paramClaimId);
        requestListPromise.then(function (success) {
            $scope.requestList = [];
            $scope.requestList = success.data.data;
            //Getting accepted event
            angular.forEach($scope.requestList, function (request) {
                //event.IsPaticiapntAccepted = "false";
                if (request.organizer.id == parseInt($scope.CommonObj.UserId)) {
                    request.IsPaticiapntAccepted = "creator";
                }
                else {
                    angular.forEach(request.participants, function (participant, key) {
                        if (participant.id == parseInt($scope.CommonObj.UserId)) {
                            if (participant.isAccepted == true) {
                                request.IsPaticiapntAccepted = "true";
                            }
                            else if (participant.isAccepted == null) {
                                request.IsPaticiapntAccepted = "pending";
                            }
                            else if (participant.isAccepted == false) {
                                request.IsPaticiapntAccepted = "false";
                            }
                        }
                    });
                }
            });
            //Getting participant list as string
            angular.forEach($scope.requestList, function (request) {
                request.particiapntsTstring = '';
                angular.forEach(request.participants, function (participant, key) {
                    participant.firstName = ((participant.firstName == null) ? participant.firstName = "" : participant.firstName);
                    participant.lastName = ((participant.lastName == null) ? participant.lastName = "" : participant.lastName);
                    request.particiapntsTstring += participant.firstName + " " + participant.lastName
                    if (key != request.participants.length - 1) {
                        request.particiapntsTstring += ',';
                    }
                });
            });
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            $(".page-spinner-bar").addClass("hide");
        })
    }


    $scope.getClaimParticipant = getClaimParticipant;
    function getClaimParticipant() {
        // get active vendors against claim with all details for binding to grid
        var param = { "claimNumber": $scope.CommonObj.ClaimNumber }
        var getpromise = PolicyHolderClaimDetailsService.getVendorsAgainstClaimDetails(param);
        getpromise.then(function (success) { $scope.VendorsAgainstClaim = []; $scope.VendorsAgainstClaim = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    };

    function returnDateForEvent(dt, time) {
        //EventDate
        var eventdate = new Date(dt);
        eventdate = new Date(eventdate.toISOString());
        var date = eventdate.getDate();
        var month = eventdate.getMonth();
        var year = eventdate.getFullYear();
        time = new Date(time);
        time.setDate(date);
        time.setMonth(month);
        time.setYear(year);
        time = time.toISOString().split('.')[0];
        time = time + 'Z';
        return time;
    };


    //Showing claim attachment details
    $scope.ClaimAttachmentDetails = function (attachment) {
        $scope.animationsEnabled = true;
        var vm = this;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                size: "md",
                templateUrl: "views/Adjuster/ShowClaimAttachmentDetails.html",
                controller: "ShowClaimAttachmentController",

                resolve:
                {
                    /**
                     * @return {?}
                     */

                    items: function () {

                        return attachment
                    }
                }

            });
        out.result.then(function (value) {

            //Call Back Function success
        }, function () {

        });
        return {
            open: open
        };
    }
    //Showing notes attachment details
    $scope.NotesAttachmentDetails = function (attachment) {

        $scope.animationsEnabled = true;
        var vm = this;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                size: "md",
                templateUrl: "views/Adjuster/ShowNoteAttachmentDetails.html",
                controller: "ShowNotesAttachmentController",

                resolve:
                {
                    items: function () {

                        return attachment;
                    }
                }

            });
        out.result.then(function (value) {

            //Call Back Function success
        }, function () {

        });
        return {
            open: open
        };
    }

    //Get post lost items by category
    $scope.GetItemsByCategory = function (e) {
        $scope.TempObj = [];
        if (($scope.CommonObj.Categories === "ALL") || (angular.isUndefined($scope.CommonObj.Categories) || $scope.CommonObj.Categories === null)) {
            $scope.FiletrLostDamageList = $scope.LostDamagedContentByCategory;
        }
        else {
            angular.forEach($scope.LostDamagedContentByCategory, function (value) {
                if ($scope.CommonObj.Categories != null && value.claimItem.category !== null) {
                    if (value.claimItem.category.id == $scope.CommonObj.Categories) {
                        $scope.TempObj.push(value);
                    }
                }
            });
            $scope.FiletrLostDamageList = $scope.TempObj;
        }
    }

    //Delete Items Form Damage Lost
    $scope.FiletrLostDamageList;
    $scope.DeleteListLostDamageItem = [];
    $scope.DeleteAllItems = function () {
        $scope.DeleteListLostDamageItem = [];
        if ($scope.DeleteAll) {
            angular.forEach($scope.FiletrLostDamageList, function (item) {
                $scope.DeleteListLostDamageItem.push(item.itemId)
            });
        }
    }
    $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
    };
    $scope.AddToDeleteList = function (item) {
        var idx = $scope.DeleteListLostDamageItem.indexOf(item);
        if (idx > -1) {
            $scope.DeleteAll = false;
            $scope.DeleteListLostDamageItem.splice(idx, 1);
        }
        else {
            $scope.DeleteListLostDamageItem.push(item);
        }
    }

    $scope.DeletItem = function (ev) {
        bootbox.confirm({
            size: "",
            title: $translate.instant('ClaimDetails_Delete.Title'),
            message: $translate.instant('ClaimDetails_Delete.Message'), closeButton: false,
            className: "modalcustom", buttons: {
                confirm: {
                    label: $translate.instant('ClaimDetails_Delete.BtnYes'),
                    className: 'btn-success'
                },
                cancel: {
                    label: $translate.instant('ClaimDetails_Delete.BtnNo'),
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                if (result) {
                    var paramIdList = [];
                    angular.forEach($scope.DeleteListLostDamageItem, function (item) {
                        paramIdList.push({ "itemId": item })
                    });
                    var response = PolicyHolderClaimDetailsService.removePostLostItem(paramIdList);
                    response.then(function (success) { //Filter list and remove item
                        $scope.DeleteListLostDamageItem = [];
                        var paramLostDamageList = {
                            "claimId": $scope.CommonObj.ClaimId
                        };
                        var response = PolicyHolderClaimDetailsService.getFiletrLostDamageList(paramLostDamageList);
                        response.then(function (success) {
                            $scope.FiletrLostDamageList = success.data.data;
                        }, function (error) { });
                    }, function (error) { });
                }
            }
        });
    }
    //End Post loss


    $scope.OpenAddNewVendorModel = function (e) {
        $scope.animationsEnabled = true;
        var ClaimObj = [];
        ClaimObj.push({ ClaimId: sessionStorage.getItem("ClaimId"), ClaimNumber: sessionStorage.getItem("ClaimNo") });

        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                size: "lg",
                templateUrl: "views/Adjuster/AddNewVendor.html",
                controller: "AddNewVendorController",
                backdrop: 'static',
                keyboard: false,
                resolve:
                {
                    ClaimObj: function () {
                        return ClaimObj;
                    }
                }

            });
        out.result.then(function (value) {

            $scope.getClaimParticipant();
        }, function () {

        });
        return {
            open: open
        };
    }

    //--Redirection------------------------//

    $scope.GotoNewServiceRequest = function () {
        sessionStorage.setItem("AdjusterClaimId", $scope.CommonObj.ClaimId)
        $location.url('AdjusterServiceRequest');
    }
    //Service requested
    $scope.GoToServiceRequestEdit = function (item) {
        if (item.serviceRequestId !== null && angular.isDefined(item.serviceRequestId)) {
            sessionStorage.setItem("ServiceRequestId", item.serviceRequestId);

            sessionStorage.setItem("AdjusterClaimId", $scope.CommonObj.ClaimId);
            $location.url('AdjusterServiceRequestEdit');
        }
    }
    $scope.GotoAssign = function (item) {
        if (item.serviceRequestId !== null && angular.isDefined(item.serviceRequestId)) {
            sessionStorage.setItem("ServiceRequestId", item.serviceRequestId);

            $location.url('AdjusterAssignServiceRequest');
        }
    }

    $scope.GotoItemStteled = function () {

        $location.url('ItemsSetteled');

    }
    $scope.GotoItemToBeStteled = function () {

        $location.url('ItemsToBeSetteled');

    }
    $scope.HoldoverDetails = function () {
        $location.url('ItemsHoldover');
    }
    $scope.GotoVendorInvoices = function () {
        $location.url('VendorInvoices');
    }
    $scope.GoToDetails = function (item) {
        //  sessionStorage.setItem("AdjusterPostLostItemId", item.itemId)
        sessionStorage.setItem("PolicyHolderPostLostItemId", item.claimItem.id)
        let index = $scope.FiletrLostDamageList.findIndex(function (i) {
            return i.claimItem.id === item.claimItem.id;
        })
        sessionStorage.setItem("pageIndex", index + 1)
        $location.url('PolicyholderItemDetails');
    }

    $scope.back = function () {
        sessionStorage.setItem("PolicyHolderClaimNo", "");
        sessionStorage.setItem("PolicyHolderClaimId", "");
        $location.url('PolicyholderMyClaims');
    };

    // $scope.GoToDashboard = function () {
    //     sessionStorage.setItem("PolicyHolderClaimNo", "");
    //     sessionStorage.setItem("PolicyHolderClaimId", "");
    //     $location.url(sessionStorage.getItem('HomeScreen'));
    // };

    // $scope.GoToHome = function () {
    //     $location.url(sessionStorage.getItem('HomeScreen'));
    // }

    $scope.ItemsToBeSetteled = function () {
        $location.url('ItemsToBeSetteled');
    }
    //--End Redirection--------------------//

    //---------------End Other functions-------------------------------------------//

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


    //--------Auto complete extender to search and participant------------------------------



    $scope.participantsForEvent = [];
    //select particiapnt
    $scope.afterSelectedParticipant = function (selected) {
        if (selected) {
            $scope.participantsForEvent.push({
                "ParticipantId": selected.originalObject.id,
                "ParticipantName": selected.originalObject.firstName + " " + selected.originalObject.lastName
            });
        }
    }
    $scope.ParticipantName = "";    //select particiapnt
    $scope.GetNoteParticipant = function (selected) {
        if (selected) {
            $scope.ParticipantName = selected.originalObject.firstName + " " + selected.originalObject.lastName
        }
    }


    // search function to match full text
    $scope.localSearch = function (str) {

        var matches = [];
        $scope.ClaimParticipantsList.forEach(function (person) {

            var fullName = person.firstName + ' ' + person.lastName;
            if ((person.firstName.toLowerCase().indexOf(str.toString().toLowerCase()) >= 0) ||
                (person.lastName.toLowerCase().indexOf(str.toString().toLowerCase()) >= 0) ||
                (fullName.toLowerCase().indexOf(str.toString().toLowerCase()) >= 0)) {
                matches.push(person);
            }
        });
        return matches;
    };


    //-------- End Auto complete extender --------------------------------------------------


    //------File Upload----------------------------------------------------

    // Variables for file upload
    $scope.fileName = '';
    $scope.FileExtension = '';
    $scope.FileType = '';
    $scope.files = [];
    $scope.ClaimfileName = '';
    $scope.ClaimFileExtension = '';
    $scope.ClaimFileType = '';
    $scope.Claimfiles = [];

    //for note attachment
    $scope.SelectNoteFile = function () {
        angular.element('#NoteFileUpload').trigger('click');

    }

    //for claim attachment
    $scope.SelectClaimFile = function () {
        angular.element('#ClaimFileUploadPolicyHolder').trigger('click');
    }

    //Get note attachment details
    $scope.getNoteFileDetails = function (e) {
        $scope.$apply(function () {
            $scope.fileName = e.files[0].name;
            $scope.FileType = e.files[0].type
            $scope.FileExtension = $scope.fileName.substr($scope.fileName.lastIndexOf('.'))
            $scope.files.push(e.files[0]);
            var fr = new FileReader();
            //fr.onload = receivedText;
            fr.readAsDataURL(e.files[0]);
        });

    };

    //get claim attachment details
    $scope.getClaimFileDetails = function (e) {
        $scope.displayClaimFileName = true;
        $scope.displayAddAttachmentbtn = false;
        $scope.$apply(function () {
            $scope.ClaimfileName = e.files[0].name;
            $scope.ClaimFileType = e.files[0].type
            $scope.ClaimFileExtension = $scope.ClaimfileName.substr($scope.ClaimfileName.lastIndexOf('.'))
            $scope.Claimfiles.push(e.files[0]);
            var fr = new FileReader();
            //fr.onload = receivedText;
            fr.readAsDataURL(e.files[0]);
        });
        if ($scope.Claimfiles.length > 0)
            $scope.AddClaimAttachment();
    };

    //Add claim attachment
    $scope.AddClaimAttachment = function () {
        $(".page-spinner-bar").removeClass("hide");
        var data = new FormData();
        data.append("claimDetail", JSON.stringify({ "claimNumber": $scope.CommonObj.ClaimNumber.toString() }))
        angular.forEach($scope.attachmentList, function (ItemFile) {
            data.append('filesDetails', JSON.stringify([{
                "fileName": ItemFile.FileName, "fileType": ItemFile.FileType, "extension": ItemFile.FileExtension, "filePurpose": "CLAIM", "latitude": null, "longitude": null, "footNote": null, "claimFileType": $scope.currentAttchment == 'claimAttachments' ? null : $scope.currentAttchment
            }]));
            data.append('file', ItemFile.File);
        });
        if ($scope.attachmentList.length == 0 || $scope.attachmentList == null) {
            data.append('filesDetails', null);
            data.append('file', null);
        };
        var getpromise = AdjusterPropertyClaimDetailsService.addClaimAttachment(data);
        getpromise.then(function (success) {
            toastr.remove();
            toastr.success(success.data.message, "Confirmation")
            $scope.CommonObj.claimNote = "";
            $scope.ClaimfileName = '';
            angular.element("input[type='file']").val(null);
            $scope.displayClaimFileName = false;
            $scope.displayAddAttachmentbtn = true;
            GetClaimAttachment();//refresh claim attachment list
            $scope.cancelAttachment();
            $(".page-spinner-bar").addClass("hide");

        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.error((angular.isDefined(error.data) && angular.isDefined(error.data.errorMessage) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage()), "Error");
        });
    };

    //clear  attachments
    $scope.ClearAttachments = function () {
        angular.element("input[type='file']").val(null);
        $scope.displayClaimFileName = false;
        $scope.displayAddAttachmentbtn = true;
    }

    //------End File Upload----------------------------------------------------




    //------------------Post lost item------------------------------------------------------

    $scope.selected = { isScheduledItem: false };
    $scope.AddNewItem = false;
    $scope.EditItem = false;
    $scope.GetSubCategory = GetSubCategory;
    function GetSubCategory() {
        if ($scope.selected.category !== null && angular.isDefined($scope.selected.category)) {
            var param = {
                "categoryId": $scope.selected.category.id
            };
            GetCatagoryLimit($scope.selected.category.id);
            var respGetSubCategory = PolicyHolderClaimDetailsService.getSubCategory(param);
            respGetSubCategory.then(function (success) { $scope.SubCategory = success.data.data; }, function (error) { $scope.SubCategory = null; $scope.ErrorMessage = error.data.errorMessage });
        }
    }

    $scope.GetCatagoryLimit = GetCatagoryLimit;
    function GetCatagoryLimit(id) {
        var count = 0;
        angular.forEach($scope.PolicyDetails.categories, function (item) {
            if (item.id == id) {
                count++
                $scope.selected.category.aggregateLimit = (item.coverageLimit == null ? 0 : item.coverageLimit);
            }
        })
        if (count == 0) {
            $scope.selected.category.aggregateLimit = 0;
        }
    };

    $scope.GetCategory = GetCategory;
    function GetCategory() {
        var getpromise = PolicyHolderClaimDetailsService.getCategories();
        getpromise.then(function (success) {
            $scope.DdlSourceCategoryList = success.data.data;
            if ($scope.CommonObj.ClaimProfile == 'Jewelry') {
                $scope.selected = {
                    isScheduledItem: false,
                    category: {
                        id: parseInt(sessionStorage.getItem("CurrentCategoryJewelryId")),
                        aggregateLimit: null
                    },
                    // individualLimitAmount: sessionStorage.getItem("IndividualLimitJewelryCat")
                };
                var count = 0;
                angular.forEach($scope.PolicyDetails.categories, function (item) {
                    if (item.id == $scope.selected.category.id) {
                        count++;
                        $scope.selected.category.aggregateLimit = (item.coverageLimit == null ? 0 : item.coverageLimit);
                    }
                })
                if (count == 0) {
                    $scope.selected.category.aggregateLimit = 0;
                }
                sessionStorage.setItem("CurrentCategoryJewelryCoverageLimit", $scope.selected.category.aggregateLimit)
                //To set jewelry profile by default
                GetSubCategory();
            }
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    }

    $scope.AddNewItemToList = AddNewItemToList;
    function AddNewItemToList() {
        // $scope.selected = {};
        // $scope.selected.scheduled = false;
        // $scope.AddNewItem = true;
        if (sessionStorage.getItem("claimProfile") == "Jewelry") {
            sessionStorage.setItem("IndividualLimitJewelryCat", (($scope.PolicyDetails.claimIndividualLimit != null && $scope.PolicyDetails.claimIndividualLimit != "") ? $scope.PolicyDetails.claimIndividualLimit : 0))
        }
        $location.url('Policyholder_Add_Item');
    }
    $scope.CancelAddNewItem = CancelAddNewItem;
    function CancelAddNewItem() {
        $scope.AddNewItem = false;
    }

    $scope.getTemplate = function (item) {
        // if (!angular.isUndefined(item)) {
        //     if (item.claimItem.id === $scope.selected.id) return 'edit';
        //     else
        //         return 'display';
        // }
        // else
        return 'display';
    };

    // $scope.reset = function () {
    //     $scope.AddNewItem = false;
    //     $scope.EditItem = false;
    //     $scope.selected = {};
    // };

    // $scope.EditItemDetails = function (item) {
    //     $scope.AddNewItem = false;
    //     $scope.EditItem = true;
    //     $scope.selected = {};
    //     $scope.selected = angular.copy(item.claimItem);
    // }
    $scope.EditItemFiles = [];
    $scope.OriginalPostLossIndex = 0;
    $scope.EditItemDetails = function (item) {
        $scope.AddNewItem = false;
        $scope.EditItem = false;
        $scope.ItemFiles = [];
        $scope.EditItemFiles = [];
        if ($scope.EditItemFiles == null || $scope.EditItemFiles.length == 0) {
            angular.forEach(item.claimItem.attachments, function (attachment) {
                $scope.EditItemFiles.push({ "FileName": attachment.name, "url": attachment.url })
                $scope.ItemFiles.push({
                    "FileName": attachment.name, "FileExtension": attachment.name.substr((attachment.name.lastIndexOf('.') + 1)), "FileType": attachment.name.substr((attachment.name.lastIndexOf('.') + 1)),
                    "Image": attachment.url, "File": attachment.url, "url": attachment.url, "imageId": attachment.id, "data": attachment.multiPartFiles, "purpose": attachment.filePurpose
                })
            });
        }
        $scope.selected = {};
        $scope.selected = angular.copy(item.claimItem);
        $scope.selected.category.aggregateLimit = $scope.selected.categoryLimit;
        $scope.selected.shippingDate = $filter('formatDate')((angular.isDefined($scope.selected.shippingDate) && $scope.selected.shippingDate !== null && $scope.selected.shippingDate != "") ? $filter('DateFormatMMddyyyy')($scope.selected.shippingDate) : null);
        $scope.selected.shippingMethod = {
            "id": ((angular.isDefined($scope.selected.shippingMethod) && $scope.selected.shippingMethod !== null) ? $scope.selected.shippingMethod.id : null)
        };
        $scope.selected.appraisalDate = $filter('formatDate')((angular.isDefined($scope.selected.appraisalDate) && $scope.selected.appraisalDate !== null && $scope.selected.appraisalDate != "") ? $filter('DateFormatMMddyyyy')($scope.selected.appraisalDate) : null);
        $scope.OriginalPostLossIndex = $scope.FiletrLostDamageList.indexOf(item);
        $scope.OriginalPostLossItem = angular.copy(item);

        if ($scope.CommonObj.ClaimProfile == 'Contents') {
            $scope.GetCategory();
            $scope.GetSubCategory();
        }
        if (item.claimItem.room) {
            $scope.selected.room = {
                "id": item.claimItem.room ? item.claimItem.room.id : null,
                "roomName": item.claimItem.room ? item.claimItem.room.roomName : null
            }
        }
        if (item.claimItem.originallyPurchasedFrom) {
            var index = $scope.Retailers.findIndex(retailer => retailer.name === item.claimItem.originallyPurchasedFrom.name);
            if (index <= -1)
                getRetailers();
            $scope.selected.originallyPurchasedFrom = {
                "id": item.claimItem.originallyPurchasedFrom ? item.claimItem.originallyPurchasedFrom.id : null,
                "name": item.claimItem.originallyPurchasedFrom ? item.claimItem.originallyPurchasedFrom.name : null
            }
            if (item.claimItem.originallyPurchasedFrom.name === 'Other')
                $scope.addOtherRetailer = true;
        }
        $scope.selected.purchaseMethod = item.claimItem.purchaseMethod ? item.claimItem.purchaseMethod : null;
        $scope.selected.giftFrom = item.claimItem.giftedFrom ? item.claimItem.giftedFrom : null;
        //$scope.EditItemFiles = item.claimItem.attachments;
    };

    // $scope.OriginalPostLossIndex = 0;
    // $scope.EditItemDetails = function (item) {
    //     $scope.AddNewItem = false;
    //     $scope.EditItem = true;
    //     $scope.selected = {};
    //     $scope.selected = angular.copy(item.claimItem);
    //     $scope.OriginalPostLossIndex = $scope.FiletrLostDamageList.indexOf(item);
    //     $scope.OriginalPostLossItem = angular.copy(item);
    //     $scope.GetCategory();
    //     $scope.GetSubCategory();
    // };


    $scope.SaveItemDetails = function (itemid) {
        $(".page-spinner-bar").removeClass("hide");
        if (!angular.isUndefined(itemid)) {
            var param = new FormData();
            var fileDetails = [];
            angular.forEach($scope.ItemFiles, function (ItemFile) {
                if (ItemFile.isLocal) {
                    fileDetails.push({ "fileName": ItemFile.FileName, "fileType": ItemFile.FileType, "extension": ItemFile.FileExtension, "filePurpose": "ITEM", "latitude": null, "longitude": null })
                    param.append('file', ItemFile.File);
                }
            });
            if ($scope.ItemFiles.length == 0 || $scope.ItemFiles == null) {
                param.append('filesDetails', null);
                param.append('file', null);
            }
            else {
                param.append('filesDetails', JSON.stringify(fileDetails));
            }
            param.append("itemDetails",
                JSON.stringify(
                    {
                        "id": $scope.selected.id,
                        "ageMonths": (angular.isDefined($scope.selected.ageMonths) ? $scope.selected.ageMonths : 0),
                        "ageYears": (angular.isDefined($scope.selected.ageYears) ? $scope.selected.ageYears : 0),
                        "brand": $scope.selected.brand,
                        "category": {
                            "annualDepreciation": $scope.selected.category && $scope.selected.category.annualDepreciation ? $scope.selected.category.annualDepreciation : null,
                            "id": $scope.selected.category && $scope.selected.category.id ? $scope.selected.category.id : null,
                            "name": $scope.selected.category && $scope.selected.category.id ? GetCategoryOrSubCategoryOnId(true, $scope.selected.category.id) : null,
                            "description": $scope.selected.category && $scope.selected.category.description ? $scope.selected.category.description : null,
                            "usefulYears": $scope.selected.category && $scope.selected.category.usefulYears ? $scope.selected.category.usefulYears : null,
                            "aggregateLimit": $scope.selected.category && $scope.selected.category.aggregateLimit ? $scope.selected.category.aggregateLimit : null
                        },
                        "categoryLimit": $scope.selected.category && $scope.selected.category.aggregateLimit ? $scope.selected.category.aggregateLimit : 0,
                        "claimId": $scope.selected.claimId,
                        "claimNumber": $scope.selected.claimNumber,
                        "depriciationRate": $scope.selected.depriciationRate,
                        "appraisalValue": $scope.selected.appraisalValue,
                        "appraisalDate": ((angular.isDefined($scope.selected.appraisalDate) && $scope.selected.appraisalDate !== null && $scope.selected.appraisalDate != "") ? $filter('DatabaseDateFormatMMddyyyy')($scope.selected.appraisalDate) : null),
                        "description": $scope.selected.description,
                        "insuredPrice": $scope.selected.insuredPrice,
                        "individualLimitAmount": (angular.isDefined($scope.selected.individualLimitAmount) ? $scope.selected.individualLimitAmount : null),
                        "itemName": $scope.selected.itemName,
                        "isScheduledItem": $scope.selected.isScheduledItem,
                        "scheduleAmount": $scope.selected.scheduleAmount,
                        "model": $scope.selected.model,
                        "quantity": $scope.selected.quantity,
                        "status": {
                            "id": $scope.selected.status.id,
                            "status": $scope.selected.status.status
                        },
                        "subCategory": $scope.selected.subCategory ? {
                            "annualDepreciation": $scope.selected.subCategory.annualDepreciation ? $scope.selected.subCategory.annualDepreciation : null,
                            "id": $scope.selected.subCategory.id ? $scope.selected.subCategory.id : null,
                            "name": $scope.selected.subCategory.id ? GetCategoryOrSubCategoryOnId(false, $scope.selected.subCategory.id) : null,
                            "description": $scope.selected.subCategory.description ? $scope.selected.subCategory.description : null,
                            "usefulYears": $scope.selected.subCategory.usefulYears ? $scope.selected.subCategory.usefulYears : null,
                            "aggregateLimit": $scope.selected.subCategory.aggregateLimit ? $scope.selected.subCategory.aggregateLimit : null
                        } : null,
                        "itemNumber": $scope.selected.itemNumber,
                        // "shippingDate": (angular.isDefined($scope.selected.shippingDate) && $scope.selected.shippingDate != null && $scope.selected.shippingDate != '' ? $filter('DatabaseDateFormatMMddyyyy')($scope.selected.shippingDate) : null),
                        // "shippingMethod": {
                        //     "id": (angular.isDefined($scope.selected.shippingMethod.id) ? $scope.selected.shippingMethod.id : null)
                        // },
                        // deleted attachments
                        "attachments": $scope.deletedItemAttachments && $scope.deletedItemAttachments.length > 0 ? $scope.deletedItemAttachments : null,
                        // Originally purchased from, purhase method, If gifted then donor's name and address
                        "originallyPurchasedFrom": $scope.selected.originallyPurchasedFrom,
                        "room": $scope.selected.room,
                        "newRetailer": $scope.selected.newRetailer ? $scope.selected.newRetailer : null,
                        "giftedFrom": $scope.selected.giftedFrom ? $scope.selected.giftedFrom : null,
                        "purchaseMethod": $scope.selected.purchaseMethod ? $scope.selected.purchaseMethod : null
                    }
                ));
            var UpdatePostLoss = PolicyHolderClaimDetailsService.UpdatePostLoss(param);
            UpdatePostLoss.then(function (success) {
                $scope.EditItemFiles = [];
                $scope.GetPostLostItems();
                toastr.remove();
                toastr.success("Item # " + $scope.selected.itemNumber + " successfully updated", "Success");
                $(".page-spinner-bar").addClass("hide");
                //$scope.reset();
            },
                function (error) {
                    $(".page-spinner-bar").addClass("hide");
                    toastr.remove()
                    toastr.error(error.data.errorMessage, $translate.instant("ItemEditErrorHeading"));
                });
        }
        else {
            //Call Api save And get its id then assign id and pass
            calculateMaxItemNo();
            var param = new FormData();
            var fileDetails = [];
            angular.forEach($scope.ItemFiles, function (ItemFile) {
                fileDetails.push({ "fileName": ItemFile.FileName, "fileType": ItemFile.FileType, "extension": ItemFile.FileExtension, "filePurpose": "ITEM", "latitude": null, "longitude": null })
                param.append('file', ItemFile.File);
            });
            if ($scope.ItemFiles.length == 0 || $scope.ItemFiles == null) {
                param.append('filesDetails', null);
                param.append('file', null);
            } else {
                param.append('filesDetails', JSON.stringify(fileDetails));
            }
            param.append("itemDetails",
                JSON.stringify({
                    "ageMonths": (angular.isDefined($scope.selected.ageMonths) ? $scope.selected.ageMonths : 0),
                    "ageYears": (angular.isDefined($scope.selected.ageYears) ? $scope.selected.ageYears : 0),
                    "brand": $scope.selected.brand,
                    "category": {
                        "annualDepreciation": $scope.selected.category && $scope.selected.category.annualDepreciation ? $scope.selected.category.annualDepreciation : null,
                        "id": $scope.selected.category && $scope.selected.category.id ? $scope.selected.category.id : null,
                        "name": $scope.selected.category && $scope.selected.category.id ? GetCategoryOrSubCategoryOnId(true, $scope.selected.category.id) : null,
                        "description": $scope.selected.category && $scope.selected.category.description ? $scope.selected.category.description : null,
                        "usefulYears": $scope.selected.category && $scope.selected.category.usefulYears ? $scope.selected.category.usefulYears : null,
                        "aggregateLimit": $scope.selected.category && $scope.selected.category.aggregateLimit ? $scope.selected.category.aggregateLimit : null
                    },
                    "categoryLimit": $scope.selected.category && $scope.selected.category.aggregateLimit ? $scope.selected.category.aggregateLimit : 0,
                    "claimId": $scope.CommonObj.ClaimId,
                    "itemNumber": $scope.selected.itemNumber,
                    "claimNumber": $scope.CommonObj.ClaimNumber,
                    "appraisalValue": $scope.selected.appraisalValue,
                    "appraisalDate": ((angular.isDefined($scope.selected.appraisalDate) && $scope.selected.appraisalDate !== null && $scope.selected.appraisalDate != "") ? $filter('DatabaseDateFormatMMddyyyy')($scope.selected.appraisalDate) : null),
                    "depriciationRate": $scope.selected.depriciationRate,
                    "description": $scope.selected.description,
                    "insuredPrice": $scope.selected.insuredPrice,
                    "individualLimitAmount": (angular.isDefined($scope.selected.individualLimitAmount) ? $scope.selected.individualLimitAmount : null),
                    "itemName": $scope.selected.itemName,
                    "isScheduledItem": $scope.selected.isScheduledItem,
                    "scheduleAmount": $scope.selected.scheduleAmount,
                    "model": $scope.selected.model,
                    "quantity": $scope.selected.quantity,
                    "status": {
                        "id": (($scope.selected.status !== null && angular.isDefined($scope.selected.status)) ? $scope.selected.status.id : null),
                        "status": (($scope.selected.status !== null && angular.isDefined($scope.selected.status)) ? $scope.selected.status.status : null)
                    },
                    "subCategory": $scope.selected.subCategory ? {
                        "annualDepreciation": $scope.selected.subCategory.annualDepreciation ? $scope.selected.subCategory.annualDepreciation : null,
                        "id": $scope.selected.subCategory.id ? $scope.selected.subCategory.id : null,
                        "name": $scope.selected.subCategory.id ? GetCategoryOrSubCategoryOnId(false, $scope.selected.subCategory.id) : null,
                        "description": $scope.selected.subCategory.description ? $scope.selected.subCategory.description : null,
                        "usefulYears": $scope.selected.subCategory.usefulYears ? $scope.selected.subCategory.usefulYears : null,
                        "aggregateLimit": $scope.selected.subCategory.aggregateLimit ? $scope.selected.subCategory.aggregateLimit : null
                    } : null,
                    // "shippingDate": (angular.isDefined($scope.selected.shippingDate) ? $filter('DatabaseDateFormatMMddyyyy')($scope.selected.shippingDate) : null),
                    // "shippingMethod": {
                    //     "id": ($scope.selected.shippingMethod && angular.isDefined($scope.selected.shippingMethod.id) ? $scope.selected.shippingMethod.id : null)
                    // },
                    // Originally purchased from, purhase method, If gifted then donor's name and address
                    "originallyPurchasedFrom": $scope.selected.originallyPurchasedFrom,
                    "room": $scope.selected.room,
                    "newRetailer": $scope.selected.newRetailer ? $scope.selected.newRetailer : null,
                    "giftedFrom": $scope.selected.giftedFrom ? $scope.selected.giftedFrom : null,
                    "purchaseMethod": $scope.selected.purchaseMethod ? $scope.selected.purchaseMethod : null
                }
                ));

            var SavePostLossItem = PolicyHolderClaimDetailsService.AddPostLossItem(param);
            SavePostLossItem.then(function (success) {
                //Need to pass the ItemId which will generate after inserting item
                $scope.NewlyAddedItemId = success.data.data.id;
                $scope.EditItemFiles = [];
                $scope.selected.id = $scope.NewlyAddedItemId;
                $scope.GetPostLostItems();
                toastr.remove()
                toastr.success("Item added successfully.", $translate.instant("ItemEditSuccessHeading"));
                $(".page-spinner-bar").removeClass("hide");
                $scope.reset();
            }, function (error) {
                $(".page-spinner-bar").removeClass("hide");
                toastr.remove()
                toastr.error(error.data.errorMessage, $translate.instant("ItemEditErrorHeading"));
            });
        }
    };

    $scope.calculateMaxItemNo = calculateMaxItemNo;
    function calculateMaxItemNo() {
        $scope.selected.itemNumber = parseInt($scope.FiletrLostDamageList == null ? 0 : $scope.FiletrLostDamageList.length) + 1;
    }

    //get Category name on category id for showing in grid of post loss itemd
    function GetCategoryOrSubCategoryOnId(OpertionFlag, id) {
        if (id !== null && angular.isDefined(id)) {
            if (OpertionFlag) {
                var list = $filter('filter')($scope.DdlSourceCategoryList, { categoryId: id });
                return list[0].categoryName;
            }
            else {
                var list = $filter('filter')($scope.SubCategory, { id: id });
                if (list.length > 0)
                    return list[0].name;
                else
                    return null;
            }
        }
        else
            return null;
    }

    //Lost Damage Items
    $scope.DeletItem = DeletItem;
    function DeletItem(obj) {
        bootbox.confirm({
            size: "",
            title: $translate.instant('Confirm.DeleteItemTitle'),
            message: $translate.instant('Confirm.DeleteItemMessage'), closeButton: false,
            className: "modalcustom", buttons: {
                confirm: {
                    label: $translate.instant('Confirm.BtnYes'),
                    className: 'btn-success'
                },
                cancel: {
                    label: $translate.instant('Confirm.BtnNo'),
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                if (result) {
                    var param = {
                        "id": obj.claimItem.id,
                        "itemUID": obj.claimItem.itemUID
                    }
                    var response = PolicyHolderClaimDetailsService.DeleteLostDamageItem(param);
                    response.then(function (success) { //Filter list and remove item
                        var index = $scope.FiletrLostDamageList.indexOf(obj);
                        if (index > -1) {
                            $scope.FiletrLostDamageList.splice(index, 1);
                            toastr.remove();
                            toastr.success(success.data.message, "Confirmation");
                        }
                    }, function (error) {
                        toastr.remove();
                        toastr.error(error.data.errorMessage, "Error");

                    });
                }
            }
        });
    }

    $scope.SelectPostLostItem = function (item) {
        var flag = 0;
        angular.forEach($scope.FiletrLostDamageList, function (item) {
            if (item.Selected) {
                flag++;
            }
        });
        var flagNew = 0;
        angular.forEach($scope.FiletrLostDamageList, function (item) {
            if (item.claimItem.status.status != 'UNDER REVIEW' || item.claimItem.status.id != 3) {
                flagNew++;
            }
        });
        if (flag != flagNew) {
            $scope.selectedAll = false;
        }
        else if (flag == flagNew) {
            $scope.selectedAll = true;
        }
        var index = $scope.SelectedPostLostItems.indexOf(item.claimItem.id);
        if (index > -1) {
            $scope.SelectedPostLostItems.splice(index, 1);
        }
        else {
            $scope.SelectedPostLostItems.push(item.claimItem.id);
        }
    }

    $scope.checkAll = function () {
        $scope.SelectedPostLostItems = [];
        if ($scope.selectedAll) {
            $scope.selectedAll = true;
            angular.forEach($scope.FiletrLostDamageList, function (item) {
                if (item.claimItem.status.id != 3 || item.claimItem.status.status != 'UNDER REVIEW') {
                    $scope.SelectedPostLostItems.push(item.claimItem.id);
                }
            });
        } else {
            $scope.selectedAll = false;
            $scope.SelectedPostLostItems = [];
        }
        angular.forEach($scope.FiletrLostDamageList, function (item) {
            if (item.claimItem.status.id != 3 || item.claimItem.status.status != 'UNDER REVIEW') {
                item.Selected = $scope.selectedAll;
            }
        });

    };

    //-------End Inline editing for post lost item-------------------------------------//
    //Claim Form functionlity
    // Create task list to cretae pending task
    $scope.dynamicPopover = {
        isOpen: false,
        html: true,
        templateUrl: "myPopoverTemplate.html",
        open: function open() {
            $scope.dynamicPopover.isOpen = true;
            // $("[data-toggle=popover]").popover();
        },
        close: function close() {
            $scope.dynamicPopover.isOpen = false;

        }
    };
    $scope.CreatePendingTasksObjList = [];
    $scope.StoreTaskObject = StoreTaskObject;
    function StoreTaskObject(taskSet) {
        $scope.CreatePendingTasksObjList = [];
        $scope.CreatePendingTasksObjList.push({
            "taskId": taskSet.taskId,
            "comment": taskSet.comment
        });
    }
    //Create Pending task against claim
    $scope.CreatePendingtask = CreatePendingtask;
    function CreatePendingtask() {
        var param = {
            "claimId": $scope.CommonObj.ClaimId.toString(),
            claimPendingTasks: $scope.CreatePendingTasksObjList
        };
        // $scope.dynamicPopover.close();
        var CreateTask = PolicyHolderClaimDetailsService.CreatePendingtask(param);
        CreateTask.then(function (success) {
            $scope.dynamicPopover.close();
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }
    //End Task

    //Add Note popup
    $scope.AddNotePopup = AddNotePopup;
    function AddNotePopup() {
        //if ($scope.ClaimParticipantsList.length > 0) {                
        var obj = {
            "claimId": $scope.CommonObj.ClaimId,
            "ClaimNumber": $scope.CommonObj.ClaimNumber,
            "ParticipantList": $scope.ClaimParticipantsList.filter(function(cp) {
                if(cp.emailId != $rootScope.userName)
                    return cp;            
            })
        };
        $scope.animationsEnabled = true;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/CommonTemplates/AddNotePopup.html",
                controller: "AddNotePopupController",
                backdrop: 'static',
                keyboard: false,
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
                $scope.GetNotes();
            }

        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };
        // }
    }
    //End add note popup

    //Add Event Popup

    $scope.AddEventPopup = AddEventPopup;
    function AddEventPopup(ev) {
        //if ($scope.ClaimParticipantsList.length > 0) {
        var obj = {
            "claimId": $scope.CommonObj.ClaimId,
            "ParticipantList": $scope.ClaimParticipantsList
        };
        $scope.animationsEnabled = true;
        var paramCompanyId = {
            "companyId": sessionStorage.getItem("CompanyId")
        };


        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/PolicyHolder/AddEventPopup.html",
                controller: "AddEventPopupController",
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
                $scope.GetEventList();
            }

        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };
        //}

    }
    //End Event popup

    //Incedent popup
    $scope.IncedentPicturePopup = IncedentPicturePopup;
    function IncedentPicturePopup(task) {
        var obj = {
            "claimId": $scope.CommonObj.ClaimId,
            "ParticipantList": $scope.ClaimParticipantsList
        };
        $scope.animationsEnabled = true;
        var paramCompanyId = {
            "companyId": sessionStorage.getItem("CompanyId")
        };
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/PolicyHolder/IncedentPicturePopup.html",
                controller: "IncedentPicturePopupController",
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

            }

        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };

    }
    //End Incedent popup

    //Report attached popup
    $scope.ReportAttachedPopup = ReportAttachedPopup;
    function ReportAttachedPopup(task) {
        var obj = {
            "claimId": $scope.CommonObj.ClaimId,
            "ParticipantList": $scope.ClaimParticipantsList
        };
        $scope.animationsEnabled = true;
        var paramCompanyId = {
            "companyId": sessionStorage.getItem("CompanyId")
        };
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/PolicyHolder/ReportAttachedPopup.html",
                controller: "ReportAttachedPopupController",
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

            }

        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };

    }

    //End repoert attached

    $scope.GotoReceiptMapperHome = GotoReceiptMapperHome;
    function GotoReceiptMapperHome() {
        if ((angular.isDefined($scope.CommonObj.ClaimNumber) && $scope.CommonObj.ClaimNumber !== null && $scope.CommonObj.ClaimNumber !== "") &&
            (angular.isDefined($scope.CommonObj.ClaimId) && $scope.CommonObj.ClaimId !== null && $scope.CommonObj.ClaimId !== "")) {
            sessionStorage.setItem("ClaimNoForReceipt", $scope.CommonObj.ClaimNumber);
            sessionStorage.setItem("ClaimIdForReceipt", $scope.CommonObj.ClaimId);
            $location.url('ReceiptMapperHome');
        }
    }
    //Servcie request
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
                        "serviceId": 1
                    };
                    var Deleteservice = PolicyHolderClaimDetailsService.DeleteServiceRequest(paramDelete);
                    Deleteservice.then(function (success) {
                        if (success.data.status === 200) {
                            var param = {
                                "claimId": $scope.CommonObj.ClaimId
                            };

                            var getServiceRequestList = PolicyHolderClaimDetailsService.getServiceRequestList(param);
                            getServiceRequestList.then(function (success) { $scope.ServiceRequestList = []; $scope.ServiceRequestList = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });

                            toastr.remove();
                            toastr.success(success.data.message, "Confirmation");
                        }
                    }, function (error) {
                        toastr.remove();
                        toastr.error(error.data.errorMessage, "Error");
                    });
                }
            }
        });


    }
    //Upload post loss item from file
    $scope.UploadPostLossItem = function () {
        if ($scope.CommonObj.ClaimNumber !== null && angular.isDefined($scope.CommonObj.ClaimNumber)) {
            sessionStorage.setItem("UploadClaimNo", $scope.CommonObj.ClaimNumber);
            $location.url('UploadItemsFromCSV')
        }
    };

    //Get event details
    $scope.GetEventDetails = function (event) {
        var obj = {
            "claimId": $scope.CommonObj.ClaimId,
            "ParticipantList": $scope.ClaimParticipantsList,
            "event": angular.copy(event)
        };
        $scope.animationsEnabled = true;
        var paramCompanyId = {
            "companyId": sessionStorage.getItem("CompanyId")
        };
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/Adjuster/EventDetails.html",
                controller: "EventDetailsController",
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
                $scope.GetEventList();
            }

        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };
    }
    $scope.GotoAllEvents = GotoAllEvents;
    function GotoAllEvents() {
        var ClaimObj = {
            "IsClaimEvent": true,
            "ClaimNumber": $scope.CommonObj.ClaimNumber,
            "ClaimId": $scope.CommonObj.ClaimId
        }
        sessionStorage.setItem("ClaimObj", JSON.stringify(ClaimObj));
        $location.url("AllEvents");
    }
    $scope.GotoAllNotes = GotoAllNotes;
    function GotoAllNotes() {
        if (($scope.CommonObj.ClaimId !== null && angular.isDefined($scope.CommonObj.ClaimId)) && ($scope.CommonObj.ClaimNumber !== null && angular.isDefined($scope.CommonObj.ClaimNumber))) {
            sessionStorage.setItem("AllNoteClaimId", $scope.CommonObj.ClaimId);
            sessionStorage.setItem("AllNoteClaimNumber", $scope.CommonObj.ClaimNumber);
            $location.url('AllNotes');
        }
    };

    //Goto Report
    $scope.GoToReport = GoToReport;
    function GoToReport() {
        sessionStorage.setItem("ReportClaimNo", $scope.CommonObj.ClaimNumber);
        $location.url('Report');
    };

    //For note details
    $scope.GetNoteDetails = function (item) {
        var obj = {
            "Note": angular.copy(item),
            "ParticipantList": $scope.ClaimParticipantsList,
        };
        $scope.animationsEnabled = true;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/AllNotes/NoteDetails.html",
                controller: "NoteDetailsController",
                resolve:
                {
                    NoteObj: function () {
                        return obj;
                    }
                }

            });
        out.result.then(function (value) {
        }, function (res) {
        });
        return {
            open: open
        };
    }

    $scope.GoToClaim = function () {
        $location.url('PolicyholderClaimDetails');
    }

    $scope.getRooms = getRooms;
    function getRooms() {
        var rooms = AdjusterLineItemDetailsService.getRooms();
        rooms.then(function (success) {
            $scope.RoomsList = success.data.data;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    };

    $scope.getRetailers = getRetailers;
    function getRetailers() {
        var retailers = AdjusterLineItemDetailsService.getRetailers();
        retailers.then(function (success) {
            if (success.data.data) {
                $scope.Retailers = success.data.data.retailers;
                $scope.paymentTypes = success.data.data.paymentTypes;
            }
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    };

    $scope.selected.room = {};
    $scope.selectRoom = function (room) {
        $scope.selected.room = {
            "id": room.id,
            "roomName": room.roomName
        }
    }
    $scope.selected.retailer = {};
    $scope.selectRetailer = function (retailer) {
        $scope.selected.originallyPurchasedFrom = {
            "id": retailer.id,
            "name": retailer.name
        }
        if (retailer.name === 'Other')
            $scope.addOtherRetailer = true;
        else {
            $scope.selected.newRetailer = null;
            $scope.addOtherRetailer = false;
        }
    };




    $scope.showContents = showContents;
    function showContents() {
        $scope.tab = 'Contents';
        $(".page-spinner-bar").removeClass("hide");
        // getClaimsStatusContentDetails();
        //GetEventList();
        getRequestList();
        //GetServiceRequestList();
        GetPostLostItems();
        //GetVendorAssignmnetList();
        sessionStorage.setItem("claimDetailsCurrentTab", "Contents");
        //resetItemListSelection();
        //$(".page-spinner-bar").addClass("hide");
    };

    $scope.ShowActivityLogTab = ShowActivityLogTab;
    function ShowActivityLogTab() {
        $scope.tab = 'ActivityLog';
        sessionStorage.setItem("ClaimId", $scope.CommonObj.ClaimId);
        sessionStorage.setItem("BackPage", "PolicyholderClaimDetails");
    };

    $scope.ShowClaimSummaryTab = function () {
        sessionStorage.setItem("ReportClaimNo", $scope.CommonObj.ClaimNumber);
        sessionStorage.setItem("ClaimNo", $scope.CommonObj.ClaimNumber);
        $scope.tab = 'ClaimSummary';
    }

    $scope.ShowPolicyDetails = ShowPolicyDetails;
    function ShowPolicyDetails() {
        sessionStorage.setItem("ClaimNo", $scope.CommonObj.ClaimNumber);
        $scope.tab = 'PolicyDetails';
    };

    $scope.ShowClaimForm = ShowClaimForm;
    function ShowClaimForm() {
        $scope.tab = 'ClaimForm';
        GetPendingTaskList();
    };

    //Get Claim Form Task
    function GetPendingTaskList() {
        var paramUserTaskListList = {
            "claimId": $scope.CommonObj.ClaimId
        };
        var GetPendingTaskPromise = PolicyHolderClaimDetailsService.GetPendingTask(paramUserTaskListList);
        GetPendingTaskPromise.then(function (success) {

            $scope.PendingTaskList = success.data.data;
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    };

    $scope.SelectItemFile = function () {
        angular.element('#ItemFileUpload').trigger('click');
        if ($scope.CommonObj.ClaimProfile == 'Jewelry')
            $scope.AddItemForm.$setDirty();
        else
            $scope.AddContentsItemForm.$setDirty();
    };

    //Get note attachment details
    $scope.ItemFiles = []
    $scope.getItemFileDetails = function (e) {
        var files = event.target.files;
        $scope.filed = event.target.files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.file = file;
            reader.fileName = files[i].name;
            reader.fileType = files[i].type;
            reader.fileExtension = files[i].name.substr(files[i].name.lastIndexOf('.'));
            reader.onload = $scope.ItemImageLoaded;
            reader.readAsDataURL(file);
        }
    };

    $scope.ItemImageLoaded = function (e) {
        $scope.$apply(function () {
            var itemExist = false;
            var newFilenm = e.target.fileName
            angular.forEach($scope.ItemFiles, function (item) {
                var filenm = item.FileName;
                if (filenm == newFilenm) {
                    itemExist = true;
                }
            });
            if (!itemExist) {
                $scope.ItemFiles.push({ "FileName": e.target.fileName.substring(0, 10) + "...", "FileExtension": e.target.fileExtension, "FileType": e.target.fileType, "Image": e.target.result, "File": e.target.file, "isLocal": true })
            } else {
                toastr.remove();
                toastr.warning('<b>File <u>' + newFilenm + '</u> is added already! Please add another file.</b>')
            }
            $("#ItemFileUpload").val('');
        });
    };

    $scope.removeattchment = removeattchment;
    function removeattchment(index) {
        $("#ItemFileUpload").val('');
        if ($scope.ItemFiles.length > 0) {
            var deletedItem = $scope.ItemFiles[index];
            if (angular.isDefined(deletedItem.imageId)) {
                $scope.deletedItemAttachments.push({ "id": deletedItem.imageId });
            }
            $scope.ItemFiles.splice(index, 1);
        }
        if ($scope.CommonObj.ClaimProfile == 'Jewelry')
            $scope.AddItemForm.$setDirty();
        else
            $scope.AddContentsItemForm.$setDirty();
    };

    $scope.reset = function () {
        if ($scope.CommonObj.ClaimProfile == 'Jewelry') {
            $scope.AddItemForm.$setUntouched();
            $scope.AddItemForm.$setPristine();
        }
        else {
            $scope.AddContentsItemForm.$setUntouched();
            $scope.AddContentsItemForm.$setPristine();
        }
        $scope.AddNewItem = false;
        $scope.EditItem = false;
        $scope.ItemFiles = [];
        $scope.EditItemFiles = [];
        if ($scope.CommonObj.ClaimProfile == 'Jewelry') {
            $scope.selected = {
                isScheduledItem: false,
                category: {
                    id: parseInt(sessionStorage.getItem("CurrentCategoryJewelryId")),
                    aggregateLimit: parseInt(sessionStorage.getItem("CurrentCategoryJewelryCoverageLimit"))
                },
                // individualLimitAmount: sessionStorage.getItem("IndividualLimitJewelryCat"),
            };
            $scope.GetSubCategory();
            getShippingMethods();
        }
        else {
            $scope.selected = { isScheduledItem: false };
        }
        $scope.addOtherRetailer = false;
    };

    $scope.AddRequestPopup = AddRequestPopup;
    function AddRequestPopup(ev) {
        //if ($scope.ClaimParticipantsList.length > 0) {
        var obj = {
            "claimId": $scope.CommonObj.ClaimId,
            "ParticipantList": $scope.ClaimParticipantsList
        };
        $scope.animationsEnabled = true;
        var paramCompanyId = {
            "companyId": sessionStorage.getItem("CompanyId")
        };
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/Adjuster/AddRequestPopup.html",
                controller: "AddRequestPopupController",
                backdrop: 'static',
                keyboard: false,
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
                $scope.getRequestList();
            }
        }, function (res) {
            //Call Back Function close
        });
        return {
            open: open
        };
    }

    $scope.getAttachmentDetails = function (e) {
        $scope.displayAddImageButton = true;
        $scope.$apply(function () {
            var files = event.target.files;
            $scope.filed = event.target.files;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var reader = new FileReader();
                reader.file = file;
                reader.fileName = files[i].name;
                reader.fileType = files[i].type;
                reader.fileExtension = files[i].name.substr(files[i].name.lastIndexOf('.'));
                reader.onload = $scope.LoadFileInList;
                reader.readAsDataURL(file);
            }
        });
        // $scope.saveAttachment();
    };

    $scope.LoadFileInList = function (e) {
        $scope.$apply(function () {
            $scope.attachmentList.push(
                {
                    "FileName": e.target.fileName, "FileExtension": e.target.fileExtension, "FileType": e.target.fileType,
                    "Image": e.target.result, "File": e.target.file, 'isLocal': true
                })
        });
    };

    //cancel claim attachment
    $scope.cancelAttachment = cancelAttachment;
    function cancelAttachment() {
        $scope.displayAddImageButton = false;
        $scope.attachmentList = [];
        angular.element("input[type='file']").val(null);
    }

    $scope.RemoveAttachment = RemoveAttachment;
    function RemoveAttachment(index) {
        if ($scope.attachmentList.length > 0) {
            $scope.attachmentList.splice(index, 1);
        }
    };

    $scope.OnCancel = OnCancel;
    function OnCancel() {
        $window.history.back();
    }

    // CTB-2311
    $scope.showDocumentsTab = function () {
        //Claim Attachments (Gets all attachments under Policy & Claim / Items / Invoices / Receipts / Others)
        $scope.tab = 'Documents';
    }

    // CTB-2308 start
    $scope.getRecentDocuments = getRecentDocuments();
    function getRecentDocuments() {
      var param = { "id": $scope.CommonObj.ClaimId,
                    "limit": 3
                  }
      var RecentDocuments = PolicyHolderClaimDetailsService.getRecentDocuments(param);
      RecentDocuments.then(function (success) {
          $scope.RecentDocuments = success.data.data;
          $(".page-spinner-bar").addClass("hide");
      }, function (error) {
          toastr.remove();
          toastr.error(error.data.errorMessage, "Error");
          $(".page-spinner-bar").addClass("hide");

      });
    }

    // Messages
    $scope.getMessages = getMessages;
    function getMessages(event) {
        var param = {
            "claimId": $scope.CommonObj.ClaimId,
            "page": currentMessagePage,
            "limit": scrollItemsLimit
        }
        var getpromise = PolicyHolderClaimDetailsService.getClaimMessages(param);
        getpromise.then(function (success) {
            var messagesList = success.data.data;
            if (messagesList) {
                angular.forEach(messagesList.messages, function (msg) {
                    $scope.claimMessages.push(msg);
                });
                $scope.totalMessages = messagesList.totalCount;
                totalMessagePages = Math.ceil(messagesList.totalCount / scrollItemsLimit);
            }
            $scope.isMessagesLoading = false;
        }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    }

    $scope.nextMessagePage = function () {
        if (currentMessagePage < totalMessagePages) {
            $scope.isMessagesLoading = true;
            currentMessagePage += 1;
            getMessages();
        }
    }

    $scope.isPdf = function (fileName) {
        if (/\.(pdf|PDF)$/i.test(fileName)) {
            return true;
        }
    }
    $scope.isImage = function (fileName) {
        if (/\.(jpe?g|png|gif|bmp)$/i.test(fileName)) {
            return true;
        }
    }
    $scope.isExcel = function (fileName) {
        if (/\.(xls|xlsx)$/i.test(fileName)) {
            return true;
        }
    }
    $scope.isDocx = function (fileName) {
        if (/\.(docx|doc)$/i.test(fileName)) {
            return true;
        }
    }

    // Attachments Preview and download
    $scope.GetDocxDetails = function (item) {
        $scope.pdf = true;
        $scope.showDownload = true;
        $scope.showDelete = true;
        $scope.currentPDFUrl = $scope.pdfUrl;
        $scope.pageToDisplay = 1;
        $scope.pageNum = 1;
        $scope.isPDF = 0;
        $scope.DocxDetails = item;
        if ($scope.DocxDetails.isLocal) {
            $scope.showDownload = false;
            $scope.DocxDetails.url = item.Image;
        } else {
            //If attachment uploaded by is not available or current logged in user is not a claim supervisor
            //hide delete button
            if (!item.uploadBy || ($scope.CommonObj.UserId != item.uploadBy.id && $scope.CommonObj.UserRole != 'CLAIM SUPERVISOR'))
                $scope.showDelete = false;
        }
        $scope.ReceiptList = $scope.DocxDetails.url;
        $scope.pdfUrl = $scope.ReceiptList;
        var pdf = ["pdf", "application/pdf"];
        var img = ["image", "application/image", "image/png", "image/jpeg", "image/gif", "png", "jpg", "jpeg", "gif", "image", "PNG", "JPEG", "GIF", "JPG"];
        $scope.imgDiv = true;
        if (pdf.indexOf((($scope.DocxDetails.FileType ? $scope.DocxDetails.FileType : $scope.DocxDetails.type).toLowerCase())) > -1) {
            $scope.isPDF = 1;
        }
        else if (img.indexOf((($scope.DocxDetails.FileType ? $scope.DocxDetails.FileType : $scope.DocxDetails.type).toLowerCase())) > -1) {
            $scope.isPDF = 2;
        }
        else {
            $scope.isPDF = 0;
            var downloadLink = angular.element('<a></a>');
            downloadLink.attr('href', $scope.DocxDetails.url);
            downloadLink.attr('target', '_self');
            downloadLink.attr('download', (($scope.DocxDetails.FileName != null && angular.isDefined($scope.DocxDetails.FileName) && $scope.DocxDetails.FileName !== "") ? $scope.DocxDetails.FileName : "Document"));
            downloadLink[0].click();
        }
        window.setTimeout(function () {
            $("#img_preview").css({
                'right': $('.page-wrapper-middle').offset().left + 'px'
            }).show();
        }, 100);
    }
    $scope.closePreview = function () {
        $("#img_preview").hide();
        $scope.imgDiv = false;
    }

    var zoomFactor = 100;
    $scope.largeMe = largeMe;
    function largeMe() {
        zoomFactor += 5;
        document.getElementById('imagepre').style.zoom = zoomFactor + "%";
    }
    $scope.smallMe = smallMe;
    function smallMe() {
        zoomFactor -= 5;
        document.getElementById('imagepre').style.zoom = zoomFactor + "%";
    }

    $scope.sendMessageToParticipant = function (participant) {
        $scope.defaultRecepients = [];
        $scope.defaultRecepients.push(participant);
        AddNotePopup();
    }

    function GetSettlementSummary() {
        $(".page-spinner-bar").removeClass("hide");

        if ($scope.CommonObj.ClaimNumber !== null && angular.isDefined($scope.CommonObj.ClaimNumber)) {
            var param = {
                "claimNumber": $scope.CommonObj.ClaimNumber
            };
            var getDetails = PolicyHolderClaimDetailsService.GetDetails(param);
            getDetails.then(function (success) {
              $scope.paidItemsCount=0;
              $scope.totalSettlement = 0;
                $scope.ReportDetails = success.data.data;
                if($scope.ReportDetails.claimItemsDetails){
                  angular.forEach($scope.ReportDetails.claimItemsDetails, function (item) {
                    if(roundOf2Decimal(item.settlementValue) >0){
                        $scope.paidItemsCount++;
                    }
                      $scope.totalSettlement += parseFloat(roundOf2Decimal(item.settlementValue));
                  });
                }
                $(".page-spinner-bar").addClass("hide");
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });
        }
    }
    $scope.roundOf2Decimal = roundOf2Decimal;
    function roundOf2Decimal(num) {
        if (num != null) {
            return (Math.round(num * 100) / 100).toFixed(2);
        }
        return num;
    }

    function GetTotalPaidAmount() {
        $scope.TotalAmountPaid = 0;
        angular.forEach($scope.PaymentSummary.paymentSummaryDetails, function (item) {
            $scope.TotalAmountPaid += item.amountPaid;
        });

    };


    // end CTB-2308
    $scope.gotoDetailedInventory = gotoDetailedInventory;
    function gotoDetailedInventory() {
        PolicyInfoFactory.addPolicyInfo(angular.copy($scope.PolicyDetails));
        $location.path("/detailed_inventory");
    }

    $scope.GoToClaimParticipants = GoToClaimParticipants;
    function GoToClaimParticipants(){
        $location.url('PolicyholderClaimParticipants');
    }

    $scope.getClaimLog = getClaimLog;
    function getClaimLog() {
        //Get Claim Log Details
        $(".page-spinner-bar").removeClass("hide");
        var param = { "claimId": $scope.CommonObj.ClaimId };
        var getLogDetailsDetails = PolicyHolderClaimDetailsService.GetClaimLog(param);
        getLogDetailsDetails.then(function (success) {
            $(".page-spinner-bar").addClass("hide");
            if (success.data.data != null)
            {
                $scope.LogList = $scope.LogList.concat(success.data.data.status);
                $scope.LogList = $filter('orderBy')($scope.LogList, 'updatedDate');
                $scope.logs = [{ "date": "novenber-18", "noteDetails": $scope.LogList }];
                console.log($scope.logs);
                $scope.logs = [{
                    "date": "November-19", "noteDetails": [{ "actionTaken": "Aniruddh Kumar changed the status of the claim to Created.", "updatedDate": "Friday, Jan 15, 2021 17:55 PM", "updatedBy": { "name": "Aniruddh Kumar" } }, { "actionTaken": "Aniruddh Kumar changed the status of the claim to Created.", "updatedDate": "Friday, Jan 15, 2021 17:55 PM", "updatedBy": { "name": "Aniruddh Kumar" } }]
                }, {
                    "date": "November-18", "noteDetails": [{ "actionTaken": "Aniruddh Kumar changed the status of the claim to Created.", "updatedDate": "Friday, Jan 15, 2021 17:55 PM", "updatedBy": { "name": "Aniruddh Kumar" } }, { "actionTaken": "Aniruddh Kumar changed the status of the claim to Created.", "updatedDate": "Friday, Jan 16, 2021 17:55 PM", "updatedBy": { "name": "Aniruddh Kumar" } }]
                }];

                //$scope.ClaimLog = true;
                $scope.logs= success.data.data;
            }
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.error((angular.isDefined(error.data) && angular.isDefined(error.data.errorMessage) ? error.data.errorMessage : AuthHeaderService.genericErrorMessage()), "Error");

        });

    };

    $scope.GetInsuranceCompanyDetails = GetInsuranceCompanyDetails;
    function GetInsuranceCompanyDetails() {
        $(".page-spinner-bar").removeClass("hide");
        var CompanyId = {
            "id": sessionStorage.getItem("CompanyId")
        };
        var getCompanyDetails = PolicyHolderClaimDetailsService.getCompanyDetails(CompanyId);
        getCompanyDetails.then(function (success) {
            $scope.CompanyDetails = success.data.data;
        }, function (error) {
            if (error.status === 500 || error.status === 404) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
            else {
                toastr.remove();
                toastr.error(error.data, errorMessage, "Error");
            }
            $(".page-spinner-bar").addClass("hide");
        });
    };

    $scope.GoToAllTasks = GoToAllTasks;
    function GoToAllTasks(){
        $location.url('PolicyholderClaimTask');
    }

    $scope.completeTaskPopup = completeTaskPopup;
        function completeTaskPopup(task) {
            var obj = {
                "index":$scope.PendingTaskList.indexOf(task)+1,
                "status":task.status.status,
                "comment":task.comment,
                "createdBy":task.createdBy,
                "assignedDate":task.newAssignedDate,
                "taskName":task.taskName,
                "taskId":task.taskId,
                "UserRole":$scope.CommonObj.user,
                "response":task.response,
                "attachments":task.attachments,
                "completedDate":task.completedDate
            }
            $scope.animationsEnabled = true;
            var out = $uibModal.open(
                {
                    animation: $scope.animationsEnabled,
                    templateUrl: "views/PolicyHolder/CompleteTaskPopup.html",
                controller: "CompleteTaskPopupController",
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
                    GetPendingTask();
                }
            }, function (res) {
                //Call Back Function close
            });
            return {
                open: open
            };
        }
});
