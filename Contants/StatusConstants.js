angular.module('MetronicApp').constant('StatusConstants', {
    "ClaimStatus": {
        "created": "Created",
        "workInProgress": "Work In Progress",
        "thirdPartyVendor": "3rd Party Vendor",
        "waitingOnInformation": "Waiting on Information",
        "supervisorApproval": "Supervisor Approval",
        "approved": "Approved",
        "returned": "Returned",
        "closed": "Closed",
        "rejected": "Rejected",
        "assigned": "Assigned"
    },
    "ItemStatus": {
        "created": "CREATED",
        "assigned": "ASSIGNED",
        "underReview": "UNDER REVIEW",
        "valued": "VALUED",
        "approved": "APPROVED",
        "settled": "SETTLED",
        "replaced": "REPLACED",
        "workInProgress": "WORK IN PROGRESS",
        "paid": "PAID",
        "partialReplaced": "PARTIAL REPLACED"
    },
    "InvoiceStatus" : {
        "created" : "CREATED",
        "processing":"PROCESSING",
        "approved":"APPROVED",
        "paid":"PAID",
        "pendingApproval":"PENDING APPROVAL",
        "rejected":"REJECTED"
    }
});