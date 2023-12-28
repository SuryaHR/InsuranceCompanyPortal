angular.module('MetronicApp').controller('CreateServiceInvoiceController', function ($rootScope, $filter, $uibModal, $window, $scope, settings, $http, $timeout, $location, $translate,
   $translatePartialLoader, CreateServiceInvoiceService) {
    //set language
    $translatePartialLoader.addPart('CreateServiceInvoice');
    $translate.refresh();
    $scope.pagesize = $rootScope.settings.pagesize;

    $scope.StateList = [];
    $scope.SelectedItems = [];
   
    $scope.VendorInvoiceDetails = { invoiceDetails: {}, billingAddress: { state: {} }, shippingAddress: { state: {} }, vendorRemitAddress: { state: {} }, InvoiceItems: [] };
    $scope.commonobject = {};
    $scope.commonobject = JSON.parse(sessionStorage.getItem("ClaimDetailsForInvoice"));
    $scope.VendorInvoiceDetails.invoiceDetails.taxRate = $scope.commonobject.taxRate; 
    $scope.VendorInvoiceDetails.claimNumber = $scope.commonobject.ClaimNoForInvice;    
    $scope.VendorInvoiceDetails.invoiceDetails.createDate = $filter('TodaysDate')();
   
    //$scope.VendorInvoiceDetails.claimNumber = $scope.commonobject.
    $scope.SelectedItemForInvoice = [];
    $scope.Details =
        {
            Page: sessionStorage.getItem("DetailsPageURL"),
            ClaimDetails:JSON.parse( sessionStorage.getItem("DetailsForServiceRequest"))
        }
    function init() {
       // $scope.commonobject = JSON.parse(sessionStorage.getItem("ClaimDetailsForInvoice"));
        //$scope.VendorInvoiceDetails.claimNumber = $scope.commonobject.ClaimNoForInvice;
        $scope.VendorInvoiceDetails.invoiceDetails.currency = "USD";

        //get StateList
        var param =
           {
               "isTaxRate": false,
               "isTimeZone": false
           }
        var getstate = CreateServiceInvoiceService.getStates(param);
        getstate.then(function (success) { $scope.StateList = success.data.data; }, function (error) { });
        $scope.PaymenttermsList = [];
        var GetPaymentTerms = CreateServiceInvoiceService.GetPaymentTerms();
        GetPaymentTerms.then(function (success) { $scope.PaymenttermsList = success.data.data; }, function (error) { });
        
        //Get Vendor Details
        var ParamId = {
            "vendorId": sessionStorage.getItem("VendorId")
        };
        var getVendorDetails = CreateServiceInvoiceService.getVendorDetails(ParamId);
        getVendorDetails.then(function (success) {
            $scope.VendorDetails = success.data.data;
            $scope.VendorInvoiceDetails.name = $scope.VendorDetails.vendorName;
            $scope.VendorInvoiceDetails.billingAddress = $scope.VendorDetails.billingAddress;
            $scope.VendorInvoiceDetails.vendorRemitAddress = $scope.VendorDetails.billingAddress;
            $scope.VendorInvoiceDetails.shippingAddress = $scope.VendorDetails.shippingAddress;
        }, function (error) {

        });
    }
    init();
   

    //File Upload
    $scope.AddAttachment = function () {
        angular.element('#FileUpload').trigger('click');
    }
    $scope.InvoiceList = [];
    $scope.getInvoiceFileDetails = function (e) {
        $scope.$apply(function () {
            var files = event.target.files;
            $scope.filed = event.target.files;
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var reader = new FileReader();
                reader.file = file;
                reader.fileName = files[i].name;
                reader.fileType = files[i].type;
                reader.fileExtension = files[i].name.substr(files[i].name.lastIndexOf('.'));
                reader.onload = $scope.LoadFileInList;
                reader.readAsDataURL(file);
            }
        });
    };
    $scope.LoadFileInList = function (e) {
        $scope.$apply(function () {
            $scope.InvoiceList.push(
                {
                    "FileName": e.target.fileName, "FileExtension": e.target.fileExtension, "FileType": e.target.fileType,
                    "Image": e.target.result, "File": e.target.file
                })
        });
    }
    //End File Upload

    //CreateNew invoice
    $scope.createInvoice = createInvoice;
    function createInvoice() {
        var paramInvoice = new FormData();
       // var ItemListForInvoiceSubmit = [];
        //angular.forEach($scope.SelectedItemForInvoice, function (item) { ItemListForInvoiceSubmit.push({ "id": item }) });

        var materialCharges = [];
        var laborCharges = [];
        angular.forEach($scope.MaterialCharges, function (item) {
            materialCharges.push({
                "description": item.description,
                "totalCharges": item.totalCost,
                "units": item.units,
                "type": "material"
            });
        });

        angular.forEach($scope.LabourCharges, function (item) {
            laborCharges.push({
                "description": item.description,
                "totalCharges": item.totalCost,
                "units": item.workedHour,
                "type": "labor"
            });
        });
        var paramInvoice = new FormData();
        
       
        paramInvoice.append("invoiceDetails",JSON.stringify({
            "serviceRequestId": $scope.Details.ClaimDetails.ServiceRequestId,
            "serviceRequestInvoices": [{
                "isDraft": false,
                "currency": $scope.VendorInvoiceDetails.invoiceDetails.currency,
                "dueDate": $filter('DatabaseDateFormatMMddyyyy')($scope.VendorInvoiceDetails.invoiceDetails.dueDate),//null
                "invoiceDescription": $scope.VendorInvoiceDetails.invoiceDetails.vendorNote,
                "taxRate": $scope.VendorInvoiceDetails.invoiceDetails.taxRate,
                "invoiceAmount": $scope.VendorInvoiceDetails.invoiceDetails.invoiceAmount,
                "totalAmount": $scope.VendorInvoiceDetails.invoiceDetails.invoiceAmount,
                "remitAddress": {
                    "streetAddressOne": $scope.VendorInvoiceDetails.vendorRemitAddress.streetAddressOne,
                    "streetAddressTwo": $scope.VendorInvoiceDetails.vendorRemitAddress.streetAddressTwo,
                    "city": $scope.VendorInvoiceDetails.vendorRemitAddress.city, "state": { "id": $scope.VendorInvoiceDetails.vendorRemitAddress.state.id },
                    "zipcode": $scope.VendorInvoiceDetails.vendorRemitAddress.zipcode
                },
                "paymentTerm": {
                    "id": $scope.VendorInvoiceDetails.invoiceDetails.paymentTrem
                },
                "materialCharges": materialCharges,
                "laborCharges": laborCharges
                //"status": {
                //    "id": 1
                //}

            }]
        }));

        //Adding File details
        if ($scope.InvoiceList.length > 0) {
            var filesDetails = [];
            angular.forEach($scope.InvoiceList, function (item) {
              
                filesDetails.push({
                    "fileName": item.FileName, "fileType": item.FileType, "extension": item.FileExtension,
                    "filePurpose": "SERVICE_REQUEST_INVOICE"
                });
                
            });
         
            paramInvoice.append("filesDetails", JSON.stringify(filesDetails));

            angular.forEach($scope.InvoiceList, function (item) {
                paramInvoice.append("file", item.File)
            });
        }
        else {
            paramInvoice.append("file",null);
            paramInvoice.append("filesDetails", null);
        }
        var AddInvoice = CreateServiceInvoiceService.SaveServiceInvoiceDetails(paramInvoice);
        AddInvoice.then(function (success) {
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
            $scope.GoBack();
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }

    $scope.GoBack = GoBack;
    function GoBack() {       
        if (sessionStorage.getItem("DetailsPageURL")==="ThirdParty")
        {
            $location.url('ThirdPartyServiceRequestEdit');
        }
        if (sessionStorage.getItem("DetailsPageURL")==="Associate"){
            $location.url('AssociateServiceRequestEdit'); 
        }
    }

    $scope.GoToClaimDetails = GoToClaimDetails;
    function GoToClaimDetails()
    {
        if (sessionStorage.getItem("DetailsPageURL") === "ThirdParty") {
            $location.url('ThirdPartyClaimDetails');
        }
        if (sessionStorage.getItem("DetailsPageURL") === "Associate") {
            $location.url('VendorAssociateClaimDetails');
        }
    }
    $scope.goToDashboard = goToDashboard;
    function goToDashboard() {
        if (sessionStorage.getItem("DetailsPageURL") === "ThirdParty") {
            $location.url('ThirdPartyVendorDashboard');
        }
        if (sessionStorage.getItem("DetailsPageURL") === "Associate") {
            $location.url('VendorAssociateDashboard');
        }
    }
   
    //Handle laboyr chagres and its UI
  
    $scope.LabourCharges = [{ "description": '', "costPerHour": '', "workedHour": '', "totalCost": '' }];
   
    $scope.MaterialCharges = [{ "description": '', "unitCost": '', "unit": '', "totalCost": '' }];
   
    $scope.AddLabourAndMaterial = AddLabourAndMaterial;
    function AddLabourAndMaterial(list, objType)
    {
        if (objType==='Material')
            $scope.MaterialCharges.push({ "description": '', "unitCost": '', "unit": '', "totalCost": '' });
        if (objType === 'Labour')
            $scope.LabourCharges.push({ "description": '', "costPerHour": '', "workedHour": '', "totalCost": '' });
    }
    $scope.RemoveLabourAndMaterial = RemoveLabourAndMaterial;
    function RemoveLabourAndMaterial(list, index)
    {
        list.splice(index, 1);
    }

   $scope.CalculateMaterialCost = CalculateMaterialCost;
   function CalculateMaterialCost(index) {
       if ($scope.MaterialCharges[index].unit > 0 && $scope.MaterialCharges[index].unitCost > 0)
       $scope.MaterialCharges[index].totalCost = (parseFloat($scope.MaterialCharges[index].unit) * parseFloat($scope.MaterialCharges[index].unitCost)).toFixed(2);
   }
   $scope.CalculateLabourCost = CalculateLabourCost;
   function CalculateLabourCost(index) {       
       if ($scope.LabourCharges[index].costPerHour > 0 && $scope.LabourCharges[index].workedHour > 0)
           $scope.LabourCharges[index].totalCost = (parseFloat($scope.LabourCharges[index].costPerHour) * parseFloat($scope.LabourCharges[index].workedHour)).toFixed(2);
   }
});