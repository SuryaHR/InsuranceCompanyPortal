angular.module('MetronicApp').service('AdjusterPropertyClaimDetailsService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    //get claim status details for content section- API #158
    this.getClaimsStatusContentDetails = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/adjuster/claim/contents",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //get claim status details for invoice section- API #155  
    this.getClaimsStatusInvoiceDetails = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/invoice/contents",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //get post lost items - API #78
    this.getLostOrDamagedContent = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/postloss/items",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //get Category List - API #161
    this.getCategories = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/categories",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //get Vendors List Against Claim with status details - API #173
    this.getVendorsAgainstClaimDetails = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/participants/status",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }


    //get Vendors List Against Claim  - API #172
    this.getClaimParticipants = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/participants",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //Save post lost item against claim    
    //this.AddPostLostItem = function (param) {
    //    var response = $http({
    //        method: "Post",
    //        url: AuthHeaderService.getApiURL() + "web/add/itemtopostloss",
    //        data: param,
    //        headers: AuthHeaderService.getHeader()
    //    });
    //    return response;
    //}


    //Remove post lost item  API #93
    this.removePostLostItem = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/remove/postlossitem",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //get claim notes API New- #126
    this.getClaimNotes = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/notes",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //add claim notes API #120
    this.addClaimNoteWithOptionalAttachment = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/push/note",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    }

    //add vendor API New #56
    this.addVendor = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/add/vendor",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //get participant type #171
    this.getParticipantType = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/partcipant/types",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }


    //get serach result for existing employee#166
    this.searchExistingEmployee = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/search/vendors",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }


    //get serach result for internal employee#147
    this.searchInternalEmployee = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/search/employees",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //get all states #123
    this.getStates = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "customer/get/state/list",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.getSubCategory = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/item/subcategories",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }


    this.getPricingSpecialist = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/price/specialist",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //vendor list to Assign line item
    this.getVendorForAssignItems = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/company/vendors",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }


    this.getPostLostItemsWithComparables = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/line/items",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }


    this.getPostLostItemsForAdjuster = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/adjuster/claim/line/items",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }


    //Post loss
    this.AddPostLossItem = function (param) {
        var AddPostLoss = $http({
            method: "Post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/add/itemtopostloss",
            headers: AuthHeaderService.getFileHeader()
        });
        return AddPostLoss;
    }

    this.UpdatePostLoss = function (param) {
        var UpdatePostLoss = $http({
            method: "post",
            url: AuthHeaderService.getApiURL() + "web/claim/update/postlossitem",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return UpdatePostLoss;
    }
    //Delete Post Loss Item API #93
    this.DeleteLostDamageItem = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/remove/postlossitem",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.getLostDamagedItemList = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/postloss/items",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.getVendorServiceList = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/vendor/services",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //assign multiple post lost items to pricing specialist
    this.assignPostLostItem = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/specialist/assign/items",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    //get Event List
    this.GetEventList = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/events",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //get Request List
    this.GetRequestList = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/claim/requests?claimid=" + param.id,
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    //Get pending task for user
    this.GetPendingTask = function (param) {
        var task = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/pendingtasklist",
            //url: AuthHeaderService.getApiURL() + "web/claim/tasks/status",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return task;
    }

    //Creating a pending task against a claim
    this.CreatePendingtask = function (param) {
        var task = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/create/task",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return task;
    }

    //add external particiapnt

    this.addExternalParticipant = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/add/external/participant",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;

    }

    //get all vendor invoices
    this.getAllVendorInvoices = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/company/invoicelist",//web/vendor/invoicelist  
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //get vendor list who cretaed invocies against claim #401
    this.getAllVendorListForClaim = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/vendor/list",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;

    };

    //get invoices to be paid
    this.getInvoicesToBePaid = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/unpaid/invoices/value",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //get policy details
    this.getPolicyDetails = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/policy/info",
            data: param,
            headers: AuthHeaderService.getHeader()
        })
        return response;
    }

    //Add Existing Vendor/ Internal Vendor against claim 
    this.assignClaim = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/assign",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }


    //get vendor with service cost 
    this.getVendorWithServiceCost = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/vendor/service/rate",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //get all vendors with service list and cost

    this.getVendorWithSelectedService = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/potential/cost",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //CreateEvent
    this.CreateEvent = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/schedule/event",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    //CreateRequest
    this.CreateReqeust = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/schedule/request",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //InvoicePayment
    this.MakePayment = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/invoice/payment",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //Assign Speciality to vendor
    this.assignSpeciality = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/update/speciality",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //GetItemsTobesettle
    this.GetItemsTobesettle = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/settle/items",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    //Payment using Debit
    this.PaymentDebitCard = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/items/payment",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    //Save services requested for Post loss items
    this.SaveServiceRequested = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/assign/items/vendor",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //Invite third party vendor
    this.inviteThirdPartyVendor = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/invite/vendor",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //Get vendor Details
    this.getVendorDetails = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/assignment/vendor/details",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    this.AddParticipantAgainstClaim = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/add/claim/participant",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //get list of service request API #226


    this.getServiceRequestList = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/servicerequests",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //Delete service request
    this.DeleteServiceRequest = function (param) {
        var servicerequest = $http({
            method: "DELETE",
            url: AuthHeaderService.getApiURL() + "web/delete/servicerequest",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return servicerequest;
    }

    //Add note against claim with participant
    this.addClaimNoteWithParticipant = function (param) {
        var Addnote = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/push/note",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return Addnote;
    };
    //Get claim status list
    this.GetClaimStatusList = function (param) {
        var list = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/claim/statuslist",
            headers: AuthHeaderService.getHeader()
        });
        return list;
    };

    //Get claim status list
    this.GetClaimInovicesByStatus = function (param) {
        var list = $http({
            method: "POST",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/claim/invoices",
            headers: AuthHeaderService.getHeader()
        });
        return list;
    };
    //Invoice aprove
    this.ApproveInvoice = function (param) {
        var Result = $http({
            method: "POST",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/invoice/approval",
            headers: AuthHeaderService.getHeader()
        });
        return Result;
    };


    //Vendors on claim
    this.getVendorWorkingonClaim = function (param) {
        var Result = $http({
            method: "POST",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/claim/vendors",
            headers: AuthHeaderService.getHeader()
        });
        return Result;
    };

    //Add note against claim with participant
    this.ReplyClaimNote = function (param) {
        var Addnote = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/push/note",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return Addnote;
    };

    this.getContentService = function () {
        var GetContentService = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/contentservices",
            headers: AuthHeaderService.getHeader()
        });
        return GetContentService;
    };
    this.getSelectedVendorDetails = function (param) {
        var VendorDetails = $http({
            method: "POST",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/assignment/vendor/details",
            headers: AuthHeaderService.getHeader()
        });
        return VendorDetails;
    };
    this.AssignItemToVendor = function (param) {
        var Assign = $http({
            method: "POST",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/assignment/vendor",
            headers: AuthHeaderService.getHeader()
        });
        return Assign;
    };

    this.getVendorList = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL()
                + "web/registered/vendors" + "?page=" + param.page + "&q=" + param.searchKey + "&sort_by=" + param.sortBy + "&order_by=" + param.orderBy + "&limit=" + param.limit
                + (!param.categoryIds.length ? '' : "&categories=" + param.categoryIds.join(',')),
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //Get Vendor assignment list
    this.getVendorAssignmnetList = function (param) {
        var Assign = $http({
            method: "post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/claim/assignment/vendorassignments",
            headers: AuthHeaderService.getHeader()
        });
        return Assign;
    };

    //Get Vendor assignment Details
    this.GetVendorassignmentDetails = function (param) {
        var Assign = $http({
            method: "post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/vendor/assignment/details",
            headers: AuthHeaderService.getHeader()
        });
        return Assign;
    };

    //Get Vendor assignment Details
    this.GetVendorassignmentItems = function (param) {
        var Assign = $http({
            method: "post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/vendor/assignment/items",
            headers: AuthHeaderService.getHeader()
        });
        return Assign;
    };
    //Get Vendor assignment Details
    this.getCompanyBranchList = function (param) {
        var List = $http({
            method: "post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/company/details",
            headers: AuthHeaderService.getHeader()
        });
        return List;
    };

    //Get Vendor assignment Details
    this.getQuoteDetails = function (param) {
        var List = $http({
            method: "post",
            data: param,
            url: AuthHeaderService.getApiURL() + "web/vendor/quote/details",
            headers: AuthHeaderService.getHeader()
        });
        return List;
    };

    this.GetQuoteDetails = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/adjuster/quote/details",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    this.getInvocieContents = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/invoice/contents",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.SendClaimForSupervisorReview = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/review/claim/supervisor",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.GetVendorsList = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/company/vendors",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //API#625 Service to delete media file from insurance company schema
    this.deleteMediaFile = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/delete/mediafiles",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    //API#5 Service to update claim status
    this.updateClaimStatus = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/claim/updatestatus",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.deleteClaim = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/adjuster/claim/delete",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.hardDeleteClaim = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/adjuster/claim/hardDelete",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    //Delete message by message Id
    this.deleteMessage = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/delete/message",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.UpdatePolicyholderDetails = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/update/policyholder",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    ///delete/claimform/
    this.deleteClaimForm = function (formId) {
        var response = $http({
            method: "DELETE",
            url: AuthHeaderService.getApiURL() + "web/claim/task/delete/" + formId,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };


    this.cancelClaimForm = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/task/cancel",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //Get Loss Types
    this.getLossTypes = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/claim/loss/types",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    // Update claim details.
    this.updateClaimDetails = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/claim/update/claimdetails",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    // updatePostLostItemsStatus
    this.updatePostLostItemsStatus = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/claim/items/paid",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    // updatePostLostItemsStatus
    this.updatePostLostItemsStatusSettled = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/claim/items/settled",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    this.updatePostLostItemsStatusPaid = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/claim/items/paid",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.updateAssignmentRating = function (assignmentNumber, assignmentRating,comment) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/assignment/update/rating?assignmentNumber=" + assignmentNumber + "&assignmentRating=" + assignmentRating + "&comment=" + comment,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    //Get Vendor assignment list
    this.getOverAllRating = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/vendor/assignment/list?vendorId= " + param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.getDataForAssignmentBarGraph = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web//assignment/response/time/graph?assignmentNumber=" + param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.getDataForAssignmentLineGraph = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/assignment/status?assignmentNumber=" + param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    // bulkItemSupervisorReview
    this.bulkItemSupervisorReview = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/bulk/item/supervisor/review",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };
    this.getCategory = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/claim/get/category",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    //get claim messages API 
    this.getClaimMessages = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/messages?page=" + param.page + "&limit=" + param.limit + "&claim_id=" + param.claimId,
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    this.getShippingMethods = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/item/shipping/methods",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    this.claimSettlement = function (param) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/calculate/claim/settlement?claim=" + param.claimNumber,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    this.completeEstimate = function (param) {
        var response = $http({
            method: "POST",
            data:param,
            url: AuthHeaderService.getApiURL() + "web/coreLogic/create/estimate",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.UpdateInviteContact = function (param) {
        var User = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/contact/updateinvite",
            data: param,
            headers: AuthHeaderService.getHeader()
            //headers: AuthHeaderService.getFileHeader()
        });
        return User;
    };

    this.resetUserPassword = function (param) {
        var User = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/admin/reset/password/"+param.id,           
            headers: AuthHeaderService.getHeader()
        });
        return User;
    };

    this.getInvoiceDataPdf = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/export/invoice/pdf",
            data: param,
            headers: AuthHeaderService.getHeader(),
            responseType: 'blob'
        });
        return response;
    };
    this.getRoomType = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/room/types",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.getRoom = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "customer/add/room",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

}]);