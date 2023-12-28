angular.module('MetronicApp').service('AdjusterLineItemDetailsService', ['$http', '$rootScope', 'AuthHeaderService', function ($http, $rootScope, AuthHeaderService) {

    //get item notes API #127
    this.getItemNotes = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/notes",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //Add item notes with attachment API #20
    this.addItemNote = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/item/push/note",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    }

    //Get category API #29
    this.getCategory = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/claim/get/category",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //Add item notes API #30
    this.getSubCategory = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/item/subcategories",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }


    this.GetComparableListFromGoogle = function (param,canceler) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/search/replacement",
            data: param,
            headers: AuthHeaderService.getHeader(),
            timeout: canceler.promise
        });
        return response;
    }

    //API New #34
    this.deleteLineItem = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/remove/postlossitem",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }


    //get participant against line item - API #172
    this.getItemParticipants = function (itemId) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/participants/item/" + itemId,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //Get item single details on id #144
    this.gteItemDetails = function (param) {
        var details = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/itemdetails",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return details;
    }
    //Get image of items on id
    this.gteItemImagess = function (param) {
        var details = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/item/images",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return details;
    }

    //Get compairables for item
    this.gteItemImagess = function (param) {
        var details = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/item/images",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return details;
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
    //Save line item details
    this.SaveItemDetails = function (param) {
        var details = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/claim/update/postlossitem",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return details;
    }
    //Get replacement Suppliers (Google, Amazon)
    this.GetReplacementSupplier = function (param) {
        var list = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/claim/replacementsuppliers",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return list;
    }

    //Get Comparables form DB
    this.GetExistingComparablesFromDb = function (param) {
        var list = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/item/comparables",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return list;
    }

    //Save New comparables form Gooogle
    this.SaveNewComparables = function (param) {
        var list = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/save/item/comparables",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return list;
    }

    //Accept item accept button click
    this.AcceptItem = function (param) {
        var Accept = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/item/approve",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return Accept;
    }

    //Add note against claim with participant
    this.addClaimNoteWithParticipant = function (param) {
        var Addnote = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/push/note", //web/private/note
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return Addnote;
    }

    //Get receipt list 276
    this.getReceiptList = function (param) {
        var getreceipt = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/item/mapped/receipt",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return getreceipt;
    }
    this.getInvoiceList = function (param) {
        var getreceipt = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/item/invoice",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return getreceipt;
    };


    //get all states #123
    this.getStates = function (param) {

        var response = $http({
            method: "post",
            url: AuthHeaderService.getApiURL() + "web/states",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.GetInsuranceCompanyDetails = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/policy/info",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.saveAttachmentList = function (param) {
        var response = $http({
            method: "post",
            url: AuthHeaderService.getApiURL() + "web/add/item/attachments",
            data: param,
            headers: AuthHeaderService.getFileHeader()
        });
        return response;
    };
    this.getAttachmentList = function (param) {
        var response = $http({
            method: "post",
            url: AuthHeaderService.getApiURL() + "web/get/item/attachments",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.addSuperVisorReview = function (param) {
        var response = $http({
            method: "post",
            url: AuthHeaderService.getApiURL() + "web/review/item/supervisor ",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
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

    this.deleteMediaFile = function (param) {
        var response = $http({
            method: "DELETE",
            url: AuthHeaderService.getApiURL() + "web/delete/attachment/" + param.id + "/purpose/" + param.purpose,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    };

    this.getShippingMethods = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/item/shipping/methods",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    this.getBestbuyKey = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/get/bestbuy/key",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    // getBestbuyresult
    this.getBestbuyresult = function (param) {
        var response = $http({
            method: "GET",
            url: param,

        });
        return response;
    }

    // get Rooms List
    this.getRooms = function (claimNumber) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "customer/claim/" + claimNumber + "/rooms",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    // get Retailes List
    this.getRetailers = function () {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/all/retailers",
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    //Add note against claim with participant
    this.GetCustomItemsList = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/get/custom/item",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //Get condition API
    this.getCondition = function () {
        var response = $http({
            method: "Get",
            url: AuthHeaderService.getApiURL() + "web/claim/get/condition",
            //data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    //Service to notify Insurance adjuster of new added items
    this.notifyInsuranceAdjuster = function (param) {
        var response = $http({
            method: "Post",
            url: AuthHeaderService.getApiURL() + "web/internal/notify/items/added",
            data: param,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.updateHOPolicyCategory = function (hoPolicyCategory) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/update/policy/category/limits",
            data: hoPolicyCategory,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }

    this.getAllHOPolicyCategories = function (policyNum) {
        var response = $http({
            method: "GET",
            url: AuthHeaderService.getApiURL() + "web/all/policy/category?policy_num=" + policyNum,
            headers: AuthHeaderService.getHeader()
        });
        return response;
    }
    this.getItemComments = function (param) {

        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/rooms/item/comments",
            headers: AuthHeaderService.getHeader(),
            data: param,

        });
        return response;

    }

    // addItemComments
    this.addItemComments = function (param) {

        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/rooms/add/item/comment",
            headers: AuthHeaderService.getFileHeader(),
            data: param,

        });
        return response;

    }

    this.getMERReport = function (param) {
        var response = $http({
            method: "POST",
            url: AuthHeaderService.getApiURL() + "web/generate/mereport",
            data: param,
            headers: AuthHeaderService.getHeader(),
            responseType: 'arraybuffer'
        });
        return response;
    }

}]);
