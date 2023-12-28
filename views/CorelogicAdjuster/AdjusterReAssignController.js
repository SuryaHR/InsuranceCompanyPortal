angular.module('MetronicApp').controller('AdjusterReAssignController',function ($rootScope, $scope, settings, $translate, $translatePartialLoader,
    AdjusterListService, AuthHeaderService) {
    $scope.PageSize = $rootScope.pagesize;
    //set language
    $translatePartialLoader.addPart('AdjusterList');
    $translate.refresh();

    $scope.ErrorMessage = '';
    $scope.AdjusterList = '';
    $scope.SelectedAdjuster=null
    function init() {
        //get adjuster list API #94
        var param = {
            "companyId": sessionStorage.getItem("CompanyId")
        };

        var getpromise = AdjusterListService.getAdjusterList(param);
        getpromise.then(function (success) {
            $scope.AdjusterList = success.data.data;
            if($scope.AdjusterList!=undefined && $scope.AdjusterList!=null){
                var loggedInUserId= sessionStorage.getItem("UserId");

                for(var i=0; i< $scope.AdjusterList.length;i++){
                    if(loggedInUserId==$scope.AdjusterList[i].userId){
                        $scope.AdjusterList.splice(i,1);
                    }
                }
            }
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        });
    }

    init();

    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

    $scope.selectRadioButton = selectRadioButton;

    function selectRadioButton(Adjustor) {
        $scope.selectedAdjuster = Adjustor;
    }
    $scope.SelectAdjuster = SelectAdjuster;
    function SelectAdjuster(adjuster) {
        $(".page-spinner-bar").removeClass("hide");
        var param =
        {
            "claimId": sessionStorage.getItem("ClaimId"),
            "assignedUserId": adjuster.userId
        };
        
         
        var getpromise = AdjusterListService.assignClaim(param);
        getpromise.then(function (success) {

            $scope.status = success.data.status;

            if ($scope.status == 200) {
                $(".page-spinner-bar").addClass("hide");
                toastr.remove();
                toastr.success(success.data.message, "Confirmation")

                $scope.$close();

                //bootbox.alert({
                //    size: "",
                //    title: "Assign Claim",
                //    closeButton: false,
                //    message: success.data.message,
                //    className: "modalcustom",
                //    callback: function () { /* your callback code */ }
                //});
            }
            else {
                toastr.remove();
                toastr.success(success.data.message, "Confirmation")
                $scope.$close();
                $(".page-spinner-bar").addClass("hide");
            }

        }, function (error) {
            toastr.remove();
            toastr.error((error.data.errorMessage) != null ? error.data.errorMessage :AuthHeaderService.genericErrorMessage(), "Error")
            $(".page-spinner-bar").addClass("hide");
        });

    };
    $scope.cancel = function () {

        $scope.$close();
    };


});