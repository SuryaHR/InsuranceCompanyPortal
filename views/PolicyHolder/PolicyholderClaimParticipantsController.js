angular.module('MetronicApp').controller('PolicyholderClaimParticipantsController', function ($translate, $translatePartialLoader, $rootScope, $log, $scope,
    settings, $http, $window, $location, $uibModal, $filter, PolicyHolderClaimDetailsService){
        $scope.CommonObj = {
            'claimNumber':sessionStorage.getItem("PolicyHolderClaimNo"),
            'ClaimId':sessionStorage.getItem("PolicyHolderClaimId"),
        }
        function init() {
            var param = { "claimNumber": $scope.CommonObj.claimNumber }
            var getpromise = PolicyHolderClaimDetailsService.getVendorsListAgainstClaim(param);
            getpromise.then(function (success) { $scope.ClaimParticipantsList = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
        }
        init();
        $scope.GoToHome = function () {
            $location.url(sessionStorage.getItem("HomeScreen"));
        }
        $scope.GoBack = function (){
            $location.url("/PolicyholderClaimDetails");
        }
        $scope.sendMessageToParticipant = function (participant) {
            $scope.defaultRecepients = [];
            $scope.defaultRecepients.push(participant);
            AddNotePopup();
        }

        //Add Note popup
        $scope.AddNotePopup = AddNotePopup;
        function AddNotePopup() {
            //if ($scope.ClaimParticipantsList.length > 0) {
            var obj = {
                "claimId": $scope.CommonObj.ClaimId,
                "ClaimNumber": $scope.CommonObj.claimNumber,
                "ParticipantList": $scope.ClaimParticipantsList
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
    })