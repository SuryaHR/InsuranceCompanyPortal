angular.module('MetronicApp').controller('PeopleDetailsController', function ($rootScope, AdjusterDashboardService, $scope, $location, $translate, $translatePartialLoader) {
   // $translatePartialLoader.addPart('AdjusterGlobalSearch');
    $translate.refresh();
    
    var pageName = "PEOPLE_DETAILS";

    function init() {
        $(".page-spinner-bar").removeClass("hide");
        $scope.PeoleDetails = JSON.parse(sessionStorage.getItem("PeopleDetails"));
        $scope.PeoleDetails.primaryPhone = (($scope.PeoleDetails.phoneNumbers !== null && $scope.PeoleDetails.phoneNumbers !== "") ? (($scope.PeoleDetails.phoneNumbers.split(',')[0] !== null && angular.isDefined($scope.PeoleDetails.phoneNumbers.split(',')[0])) ? $scope.PeoleDetails.phoneNumbers.split(',')[0] : "") : "")
        $scope.PeoleDetails.mobilePhone = (($scope.PeoleDetails.phoneNumbers !== null && $scope.PeoleDetails.phoneNumbers !== "") ? (($scope.PeoleDetails.phoneNumbers.split(',')[1] !== null && angular.isDefined($scope.PeoleDetails.phoneNumbers.split(',')[1])) ? $scope.PeoleDetails.phoneNumbers.split(',')[1] : "") : "")
        $scope.Claim = [];
        var param =
       {
           "userId": $scope.PeoleDetails.id
       };
        var GetClaimForUser = AdjusterDashboardService.getClaimsInProgress(param);
        GetClaimForUser.then(function (success) {
            $scope.Claim = angular.isDefined(success.data) && success.data != null && success.data.data != null && success.data.data.claims != null ? success.data.data.claims :  null;
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }
    init();
    $scope.GotoDashboard = function () {
        sessionStorage.removeItem("currentTab");
        $location.url(sessionStorage.getItem('HomeScreen'));
    }
    $scope.Back = function () {
        $location.url('AdjusterGlobalSearch');
    }
    //Sorting  
    $scope.sortClaim = function (keyname) {
        $scope.sortKeyClaim = keyname;   //set the sortKey to the param passed
        $scope.Claimreverse = !$scope.Claimreverse; //if true make it false and vice versa
    }

    $scope.GotoClaimDetails = GotoClaimDetails;
    function GotoClaimDetails(claim) {
        sessionStorage.setItem("refferer", "PEOPLE_DETAILS");
        var role = sessionStorage.getItem("RoleList");
        //For adjuster
        if (role === 'ADJUSTER') {
            //sessionStorage.setItem("AdjusterClaimId", claim.claimId);
            //sessionStorage.setItem("AdjusterClaimNo", claim.claimNumber);
            sessionStorage.setItem("ClaimId", claim.claimId);
            sessionStorage.setItem("ClaimNo", claim.claimNumber);
            if(sessionStorage.getItem("isCoreLogic")=="true"){
                $location.url('CorelogicAdjusterPropertyClaimDetails')

            }else{
                $location.url('\AdjusterPropertyClaimDetails', claim.policyNumber);

            }
        }
            //For Third party vendor
        else if (role === 'VENDOR CONTACT PERSON' || role === "VENDOR") {
            sessionStorage.setItem("ThirdPartyClaimId", claim.claimId);
            sessionStorage.setItem("ThirdPartyClaimNo", claim.claimNumber);
            $location.url('\ThirdPartyClaimDetails');
        }
            //For policyholder
        else if (role === 'INSURED') {
            sessionStorage.setItem("PolicyHolderClaimId", claim.claimId);
            sessionStorage.setItem("PolicyHolderClaimNo", claim.claimNumber);
            $location.url('\PolicyHolderClaimDetails');
        }
            //For vendor associate
        else if (role === 'CLAIM ASSOCIATE') {
            sessionStorage.setItem("VendorAssociateClaimId", claim.claimId);
            sessionStorage.setItem("VendorAssociateClaimNo", claim.claimNumber);
            $location.url('\VendorAssociateClaimDetails');
        }
            //For Claim Supervisor
        else if (role === 'SUPERVISOR') {
            sessionStorage.setItem("SupervisorClaimId", claim.claimId);
            sessionStorage.setItem("SupervisorClaimNo", claim.claimNumber);
            $location.url('\SupervisorClaimDetails');
        }
        else if (role === "CLAIM MANAGER" || role === "CLAIM CENTER ADMIN" || role === "AGENT") {
            sessionStorage.setItem("ManagerScreenClaimId", claim.claimId);
            sessionStorage.setItem("ManagerScreenClaimNo", claim.claimNumber);
            sessionStorage.setItem("ManagerScreenpolicyNo", claim.claimNumber);

            $location.url('\ClaimCenter-ClaimDetails');
        }
    }
});