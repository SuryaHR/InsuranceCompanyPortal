angular.module('MetronicApp').controller('AllReplQuotesController', function ($rootScope, $scope,$rootScope, $location, $translate, $translatePartialLoader, settings, $filter, AuthHeaderService, AllReplQuotesService) {

    //set language
    $translatePartialLoader.addPart('AllReplQuotes');
    $translate.refresh();
    $scope.pagesize = $rootScope.settings.pagesize;
    $scope.currentDate = $filter("date")(Date.now(), 'MMMM dd yyyy');//current Date
    $scope.CurrentTab='Vendor Assignments';
    //Go to Home
    $scope.GoToHome = function () {
        $location.url(sessionStorage.getItem('HomeScreen'));
    };

    function init() {
        $scope.CurrentTab= sessionStorage.getItem("claimDetailsCurrentTab") == "Item Replacement Quotes" ? 'quotesByAssignments' : 'Vendor Assignments';
        if (sessionStorage.getItem("claimDetailsCurrentTab") == "Item Replacement Quotes"){
            sessionStorage.removeItem("claimDetailsCurrentTab");
        }
        getQuotesByAssignment();

        // $scope.CurrentTab= sessionStorage.getItem("claimDetailsCurrentTab") == "Item Replacement Quotes" ? 'quotesByAssignments' : 'Vendor Assignments';
        // if (sessionStorage.getItem("claimDetailsCurrentTab") == "Item Replacement Quotes"){
        //     sessionStorage.removeItem("claimDetailsCurrentTab");
        // }
    }
    init();
    $scope.totalEstimate = 0;
    $scope.valueQuotedItems = $scope.FiletrLostDamageList.filter(function (item) {
        // console.assert(item.status);
        if (item.status && item.status.status && item.status.status.toLowerCase() === 'valued') {
            $scope.totalEstimate += Math.round(item.rcvTotal * 1e2) / 1e2;
            return item;
        }
    });

     //GoTo View Quote
     $scope.GoToViewQuote = GoToViewQuote;
     function GoToViewQuote(assignmentNumber,quoteNumber) {
         sessionStorage.setItem("ClaimNumber", $scope.CommonObj.ClaimNumber);
        //  sessionStorage.setItem("ClaimId", $scope.CommonObj.ClaimId);
        //  sessionStorage.setItem("ItemNumber", $scope.ItemDetails.itemNumber);
        //  sessionStorage.setItem("ItemUID", $scope.ItemDetails.itemUID);
         sessionStorage.setItem("assignmentNumber",assignmentNumber);
         sessionStorage.setItem("quoteNumber",quoteNumber)
        //  sessionStorage.setItem("vendorNumber", $scope.ItemDetails.vendorDetails.registrationNumber);
         $location.url('ViewQuote');
     };


    $scope.getQuotesByAssignment = getQuotesByAssignment;
    function getQuotesByAssignment(){
      var quotesPromice =  AllReplQuotesService.getQuotesByAssignment($scope.CommonObj.ClaimNumber);
      quotesPromice.then(function (response){
       $scope.quotesByAssignment = response.data.data;
      })
    }

    //Sorting
    $scope.sortKey = 'updatedDate';
    //$scope.reverse = true;
    $scope.SortClaimForm = function (keyname) {
        $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false;
        $scope.sortKey = keyname;
    };

    $scope.exportReplacementEstimate = exportReplacementEstimate;
    function exportReplacementEstimate(fileType) {
        $(".page-spinner-bar").removeClass("hide");
        var data = {
            "claimNumber": $scope.CommonObj.ClaimNumber,
            "profile": sessionStorage.getItem('claimProfile'),
            "fileType": fileType
        }
        var reports = AllReplQuotesService.getReplacementEstimate(data);
        reports.then(function success(response) {
            var headers = response.headers();
            var filename = headers['x-filename'];
            var contentType = headers['content-type'];
            var linkElement = document.createElement('a');
            try {
                var blob = new Blob([response.data], { type: contentType });
                var url = window.URL.createObjectURL(blob);
                linkElement.setAttribute('href', url);
                linkElement.setAttribute("download", filename);
                var clickEvent = new MouseEvent("click", {
                    "view": window,
                    "bubbles": true,
                    "cancelable": false
                });
                linkElement.dispatchEvent(clickEvent);
                $(".page-spinner-bar").addClass("hide");
            } catch (ex) {
                toastr.remove();
                toastr.success(ex);
            }
        }, function (error) {
            var decodedString = String.fromCharCode.apply(null, new Uint8Array(error.data));
            var obj = JSON.parse(decodedString);
            toastr.remove();
            toastr.error(obj['errorMessage']);
            $(".page-spinner-bar").addClass("hide");
        });
    }

    bindRemarksToRootScope=(event)=>{
        $rootScope.AssignmentRemark = event.target.value ;
        console.log($rootScope.AssignmentRemark);
    }
});
