angular.module('MetronicApp').controller('ContractPopupController', function ($rootScope, $scope, settings, $filter, $translate, $translatePartialLoader, $location, AccountPayableService
) {

    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    //set language
    $translatePartialLoader.addPart('ThirdPartyVendorContracts');
    $translate.refresh();
    $scope.Contracts = true;
    $scope.ContractList;
    $scope.ContractDetails = {};
    $scope.SalvageContractList;
    $scope.isSalvageContract = false;
    $scope.ContractTypeList = [{ id: 1, name: "Claim" }, { id: 2, name: "Salvage" }];
    $scope.ContractType = 2;
    $scope.contractType = sessionStorage.getItem("contractType");
    $scope.files = [];
    $scope.salvageDetails = {};
    $scope.$on('CloseImgDiv', function (event, args) {
        $scope.imgDiv =false;
        $scope.height = {"height":"300px"};
    });


    function init() {

        param = {
            "vendorRegNo": "ARTGM",
            "contactType": $scope.contractType,
            "invoiceNo":sessionStorage.getItem("invoiceNo")
        };
        var contract = AccountPayableService.getContractForPayable(param);
        contract.then(function (success) {
            //console.log(success.data);
            $scope.ContractDetails = success.data.data.claimContract;
            $scope.salvageDetails = success.data.data.salvageContract;

            $scope.Contracts = ($scope.contractType == 'claim');
            $scope.isSalvageContract = $scope.contractType == 'salvage';
        });

        $scope.height = {"height":"300px"};
        //angular.element('#set_height').css('height', '300px');

    }
    init();


    // angular.element('#element').css('height', '100px');
     /* Function to preview uploaded Documents */
     $scope.GetDocxDetails = function (item) {
        $scope.pdf = true;
        $scope.currentPDFUrl = $scope.pdfUrl;
        $scope.pageToDisplay = 1;
        $scope.pageNum = 1;
        $scope.isPDF = 0;
        $scope.DocxDetails = item;
        if ($scope.DocxDetails.isLocal) {
            $scope.showButton = false;
            $scope.DocxDetails.url = item.Image;
        } else {
            $scope.showButton = true;
        }
        $scope.ReceiptList = $scope.DocxDetails.url;
        var urls = $scope.ReceiptList.split('/');
        $scope.DocxDetails.type =  urls[urls.length-1].split('.')[1];
        //$scope.DocxDetails.type =  $scope.ReceiptList.split('.')[1];
        $scope.pdfUrl = $scope.ReceiptList;
        var pdf = ["pdf", "application/pdf"];
        var img = ["image", "application/image", "image/png", "image/jpeg", "image/gif", "png", "jpg", "jpeg", "gif", "image", "PNG", "JPEG", "GIF", "JPG"];
        $scope.imgDiv = true;
        $scope.height = {"height":"260px"};
        //angular.element('#set_height').css('height', '260px');
        if ($scope.DocxDetails && $scope.DocxDetails.type && pdf.indexOf(($scope.DocxDetails.type.toLowerCase())) > -1) {
            $scope.isPDF = 1;
        } else if ( $scope.DocxDetails && $scope.DocxDetails.type && img.indexOf(($scope.DocxDetails.type.toLowerCase())) > -1) {
            $scope.isPDF = 2;
        } else {
            $scope.isPDF = 0;
            var downloadLink = angular.element('<a></a>');
            downloadLink.attr('href', $scope.DocxDetails.url);
            downloadLink.attr('target', '_self');
            downloadLink.attr('download', (($scope.DocxDetails.fileName != null && angular.isDefined($scope.DocxDetails.fileName) && $scope.DocxDetails.fileName !== "") ? $scope.DocxDetails.fileName : "Document"));
            downloadLink[0].click();
        }
        window.setTimeout(function () {
            $("#img_preview").css({
                'right': $('.page-wrapper-middle').offset().left + 'px'
            }).show();
        }, 100);

    }

    $scope.close = function () {
        $("#img_preview").hide();
        $scope.imgDiv =false;
       // $scope.height = '300px';
       $scope.height = {"height":"300px"};
        //angular.element('#set_height').css('height', '300px');

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

         //Fuction to download uploaded files.
         $scope.getAttachements = function (data) {
            var b64Data = data;
            var contentType = 'application/octet-stream';
            var blob = b64toBlob(b64Data, contentType);
            var url = window.URL.createObjectURL(blob);
            var downloadLink = angular.element('<a></a>');
            downloadLink.attr('href', url);
            downloadLink.attr('target', '_self');
            downloadLink.attr('download', (($scope.DocxDetails.fileName != null && angular.isDefined($scope.DocxDetails.fileName) && $scope.DocxDetails.fileName !== "") ? $scope.DocxDetails.fileName : "Document"));
            downloadLink[0].click();
        }

});