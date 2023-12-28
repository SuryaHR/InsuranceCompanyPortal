angular.module('MetronicApp').controller('ContractsController', function ($rootScope, $scope, settings, $filter, $translate, $translatePartialLoader, $location, ContractService
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
    $scope.ContractType=2;
    $scope.files = [];
    $scope.salvageDetails = {};
    $scope.$on('contractListBroadcast', function(event, data) {
        
        $scope.Contracts = true;
        $scope.isSalvageContract = false;
        $scope.salvageDetails = {};
        $scope.ContractDetails = {};

      });
    function init() {

        var broadcastData = {
            "contractNumber": "",
            "editContract": false
        }

        $rootScope.$broadcast('eventContractNumber', broadcastData);
        
        var vendorRegNo = sessionStorage.getItem("VendorDetailsId");
        var GetContracts = ContractService.getContracts(vendorRegNo);
        GetContracts.then(function (success) {
            $scope.ContractList = success.data.data;
        }, function (error) {

        });
        var GetSalvageContracts = ContractService.getSalvageContracts(vendorRegNo);
        GetSalvageContracts.then(function (success) {
            $scope.SalvageContractList = success.data.data;
        }, function (error) {

        });
    }
    init();
    $scope.reverseNewClaim = true;
    $scope.sortNewClaimKey = "startDate";
    $scope.sortNewClaim = function (keyname) {
        $scope.sortNewClaimKey = keyname;   //set the sortKey to the param passed     
        $scope.reverseNewClaim = !$scope.reverseNewClaim; //if true make it false and vice versa
    };
    $scope.EditContract = EditContract;
    function EditContract(item) {
        $(".page-spinner-bar").removeClass("hide");
        $scope.Contracts = false;
        var parm = {
            "id": item.id
        };
        var GetContracts = ContractService.getContractsDetails(parm);
        GetContracts.then(function (success) {
            $scope.ContractDetails = success.data.data; 
            $scope.ContractDetails.createDate = (angular.isDefined($scope.ContractDetails.createDate) && $scope.ContractDetails.createDate != null) ? ($filter('DateFormatMMddyyyy')($scope.ContractDetails.createDate)) : null
            $scope.ContractDetails.endDate = (angular.isDefined($scope.ContractDetails.endDate) && $scope.ContractDetails.endDate != null) ? ($filter('DateFormatMMddyyyy')($scope.ContractDetails.endDate)) : null
          
            var broadcastData = {
                "contractNumber": $scope.ContractDetails.contractUID,
                "editContract": true
            }
    
            $rootScope.$broadcast('eventContractNumber', broadcastData);
            $(".page-spinner-bar").addClass("hide");
        },
            function (error) {
                $(".page-spinner-bar").addClass("hide");
            });
    };

    $scope.EditSalvageContract = EditSalvageContract;
    function EditSalvageContract(item) {
        $scope.Contracts = false;
        $scope.isSalvageContract = true;
        var param = {
            "id":item.id
        }
        var GetContracts = ContractService.getSalvageContractsDetails(param);
        GetContracts.then(function (success) {
            $scope.ContractDetails = success.data.data;
            $scope.salvageDetails = success.data.data;
            $scope.salvageDetails.createDate = (angular.isDefined($scope.salvageDetails.createDate) && $scope.salvageDetails.createDate != null) ? ($filter('DateFormatMMddyyyy')($scope.ContractDetails.createDate)) : null
            $scope.salvageDetails.expirationDate = (angular.isDefined($scope.salvageDetails.expirationDate) && $scope.salvageDetails.expirationDate != null) ? ($filter('DateFormatMMddyyyy')($scope.salvageDetails.expirationDate)) : null

            var broadcastData = {
                "contractNumber": $scope.salvageDetails.contractUID,
                "editContract": true
            }
    
            $rootScope.$broadcast('eventContractNumber', broadcastData);
            $(".page-spinner-bar").addClass("hide");
        },
            function (error) {
                $(".page-spinner-bar").addClass("hide");
            });
    }
    
    $scope.CancelContracts = CancelContracts;
    function CancelContracts() {
        var broadcastData = {
            "contractNumber": "",
            "editContract": false
        }

        $rootScope.$broadcast('eventContractNumber', broadcastData);
        $scope.Contracts = true;
        $scope.isSalvageContract = false;
        $scope.salvageDetails = {};
        $scope.ContractDetails = {};
    };

    $scope.SelectFile = SelectFile;
    function SelectFile() {
        angular.element("input[type='file']").val(null);
        angular.element('#FileUpload').trigger('click');
    };

    $scope.getFileDetails = getFileDetails;
    function getFileDetails(event) {
        var files = event.target.files;
        $scope.filed = event.target.files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.file = file;
            reader.fileName = files[i].name;
            reader.fileType = files[i].type;
            reader.fileExtension = files[i].name.substr(files[i].name.lastIndexOf('.'));
            reader.onload = $scope.imageIsLoaded;
            reader.readAsDataURL(file);

        }
    }
    $scope.imageIsLoaded = function (e) {
        $scope.$apply(function () {
            $scope.files.push({ "FileName": e.target.fileName, "FileExtension": e.target.fileExtension, "FileType": e.target.fileType, "Image": e.target.result, "File": e.target.file })

        });
    };
    $scope.updateSalvegContract = updateSalvegContract;
    function updateSalvegContract() {
        debugger;

        $(".page-spinner-bar").removeClass("hide");
        var data = new FormData();
        //Append File
        if ($scope.files !== null && angular.isDefined($scope.files)) {
            var FileDetails = [];
            angular.forEach($scope.files, function (item) {
                FileDetails.push({
                    "extension": item.FileExtension,
                    "fileName": item.FileName,
                    "fileType": item.FileType,
                    "filePurpose": "SALVAGE_CONTRACT",
                    "documentComments": null
                });
                data.append("attachment", item.File);
            });
            data.append("filesDetails", JSON.stringify(FileDetails));
        }
        else {
            data.append("filesDetails", null);
            data.append("attachment", null);
        }

        if ($scope.salvageDetails.id !== null && angular.isDefined($scope.salvageDetails.id)) {
            var salvageDetails = {
                "id": $scope.salvageDetails.id,
                "contractNumber": $scope.ContractDetails.contractUID,
                "contractName": $scope.ContractDetails.contractName,
                "startDate": $filter('DatabaseDateFormatMMddyyyy')($scope.ContractDetails.startDate),
                "expirationDate": $filter('DatabaseDateFormatMMddyyyy')($scope.ContractDetails.endDate),
                "company": {
                    "id": $scope.ContractDetails.vendor.vendorId,
                },
                "immediateRepair": $scope.salvageDetails.immediateRepair,
                "salvageMetal": $scope.salvageDetails.salvageMetal,
                "finishedJewlery0_5": $scope.salvageDetails.finishedJewlery0_5,
                "finishedJewlery5_15": $scope.salvageDetails.finishedJewlery5_15,
                "finishedJewlery15_5": $scope.salvageDetails.finishedJewlery15_5,
                "finishedJewlery5": $scope.salvageDetails.finishedJewlery5,
                "looseDiamonds0_5": $scope.salvageDetails.looseDiamonds0_5,
                "looseDaimond5_15": $scope.salvageDetails.looseDaimond5_15,
                "looseDiamond15_5": $scope.salvageDetails.looseDiamond15_5,
                "looseDiamond5": $scope.salvageDetails.looseDiamond5,
                "retailLooseStones": $scope.salvageDetails.retailLooseStones,
                "wholesaleLooseStones": $scope.salvageDetails.wholesaleLooseStones,
                "purchaseByArtigem": $scope.salvageDetails.purchaseByArtigem,
                "priceDecrease30": $scope.salvageDetails.priceDecrease30,
                "priceDecrease60": $scope.salvageDetails.priceDecrease60,
                "priceDecrease90": $scope.salvageDetails.priceDecrease90,
                "commissionRate0_5": $scope.salvageDetails.commissionRate0_5,
                "commissionRate5_15": $scope.salvageDetails.commissionRate5_15,
                "commissionRate15_5": $scope.salvageDetails.commissionRate15_5,
                "commissionRate5": $scope.salvageDetails.commissionRate5
            }
            data.append("salvageDetails", JSON.stringify(contractDetails));
            var SaveContracts = ContractService.UpdateSalvageContracts(data);
            SaveContracts.then(function (success) {
                $scope.GetSalvageContract();
                $scope.CancelNewContract();
                $(".page-spinner-bar").addClass("hide");
                toastr.remove();
                toastr.success(((success.data !== null) ? success.data.message : "Contract details saved successfully."), "Confirmation");
            },
                function (error) {
                    toastr.remove();
                    toastr.error(((error.data !== null) ? error.data.message : "Failed to save the contract details. please try again"), "Error");
                    $(".page-spinner-bar").addClass("hide");
                });
        }
        else {
            var salvageDetails = {
                "id": null,
                "contractNumber": null,
                "contractName": $scope.salvageDetails.contractName,
                "startDate": $filter('DatabaseDateFormatMMddyyyy')($scope.salvageDetails.startDate),
                "expirationDate": $filter('DatabaseDateFormatMMddyyyy')($scope.salvageDetails.endDate),
                "vendor": {
                    "vendorId": $scope.salvageDetails.vendor.vendorId,
                },
                "immediateRepair": $scope.salvageDetails.immediateRepair,
                "salvageMetal": $scope.salvageDetails.salvageMetal,
                "finishedJewlery0_5": $scope.salvageDetails.finishedJewlery0_5,
                "finishedJewlery5_15": $scope.salvageDetails.finishedJewlery5_15,
                "finishedJewlery15_5": $scope.salvageDetails.finishedJewlery15_5,
                "finishedJewlery5": $scope.salvageDetails.finishedJewlery5,
                "looseDiamonds0_5": $scope.salvageDetails.looseDiamonds0_5,
                "looseDaimond5_15": $scope.salvageDetails.looseDaimond5_15,
                "looseDiamond15_5": $scope.salvageDetails.looseDiamond15_5,
                "looseDiamond5": $scope.salvageDetails.looseDiamond5,
                "retailLooseStones": $scope.salvageDetails.retailLooseStones,
                "wholesaleLooseStones": $scope.salvageDetails.wholesaleLooseStones,
                "purchaseByArtigem": $scope.salvageDetails.purchaseByArtigem,
                "priceDecrease30": $scope.salvageDetails.priceDecrease30,
                "priceDecrease60": $scope.salvageDetails.priceDecrease60,
                "priceDecrease90": $scope.salvageDetails.priceDecrease90,
                "commissionRate0_5": $scope.salvageDetails.commissionRate0_5,
                "commissionRate5_15": $scope.salvageDetails.commissionRate5_15,
                "commissionRate15_5": $scope.salvageDetails.commissionRate15_5,
                "commissionRate5": $scope.salvageDetails.commissionRate5
            };
            data.append("salvageDetails", JSON.stringify(salvageDetails));
            var SaveContracts = ContractService.UpdateSalvageContracts(data);
            SaveContracts.then(function (success) {
                $scope.GetSalvageContract();
                $scope.CancelNewContract();
                toastr.remove();
                toastr.success(((success.data !== null) ? success.data.message : "Contract details updated successfully."), "Confirmation");
                $(".page-spinner-bar").addClass("hide");
            },
                function (error) {
                    toastr.remove();
                    toastr.error(((error.data !== null) ? error.data.message : "Failed to update the contract details. please try again"), "Error");
                    $(".page-spinner-bar").addClass("hide");
                });
        }

    }

    $scope.GoToHome = GoToHome;
    function GoToHome(){
        $location.path("/CompanyDetails");  
    }

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