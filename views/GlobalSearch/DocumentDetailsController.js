angular.module('MetronicApp').controller('DocumentDetailsController', function ($rootScope, $scope, $uibModal, $translate, $translatePartialLoader, $filter, objDocx) {

    $scope.pdf = true;
    //=========================PDF Region Start================================================    
    $scope.currentPDFUrl = $scope.pdfUrl;
    $scope.pageToDisplay = 1;
    $scope.pageNum = 1;    
    $scope.loading = "Loading....."
    //$scope.ReceiptList = [{ "path": "/views/ClaimFormDetails/CPD-VendorClaimManagement.pdf" }, { "path": "/views/ClaimFormDetails/Contents-Web-Portal.pdf" }, { "path": "/views/ClaimFormDetails/CPD-Vendor.pdf" }];
    $scope.DocxDetails = objDocx;
    $scope.ReceiptList = $scope.DocxDetails.url;
    $scope.pdfUrl = $scope.ReceiptList;
    function renderPage(page) {     
      
    }
    $scope.onError = function (error) {       
    };
    $scope.onLoad = function () {
        $scope.loading = '';
    };
    $scope.Cancel = function () {
        $scope.$close();
    };
    var pdf = ["pdf", "application/pdf"];
    var excel = ["xlsx"];
    var img = ["image", "application/image", "image/png", "image/jpeg", "image/gif", "png", "jpg", "jpeg", "gif", "image", "PNG", "JPEG", "GIF", "JPG"];
    //init functionality
    function init()
    {
        $scope.isPDF = 0;
        $scope.DocxDetails = objDocx;
        if(pdf.indexOf(($scope.DocxDetails.type.toLowerCase()))>-1)
        {
            $scope.isPDF = 1;
        }
        else if(img.indexOf(($scope.DocxDetails.type.toLowerCase()))>-1)
        {
            $scope.isPDF = 2;
        }
        else
        {
            $scope.isPDF = 0;
            var downloadLink = angular.element('<a></a>');
            downloadLink.attr('href', $scope.DocxDetails.url);
            downloadLink.attr('target', '_self');
            downloadLink.attr('download', (($scope.DocxDetails.fileName != null && angular.isDefined($scope.DocxDetails.fileName) && $scope.DocxDetails.fileName !== "") ? $scope.DocxDetails.fileName : "Document"));
            downloadLink[0].click();
        }
    }
    init();
});