angular.module('MetronicApp').controller('ReceiptMapperLabelController', function ($rootScope, $uibModal, $scope, $translate, $filter, $translatePartialLoader,
    ReceiptMapperService, PDFID) {
    $translatePartialLoader.addPart('ReceiptMapperHome');
    $translate.refresh();
    $scope.PDFId = PDFID;
    $scope.commonObj = {
        "Labels": [],
        "LabelName": ""
    };
  
    //Get
    var PDFId =
          {
              "pdfId": $scope.PDFId
          }
    var getLabel = ReceiptMapperService.Getlabel(PDFId);
    getLabel.then(function (success) {
          
        $scope.commonObj.Labels = success.data.data;
    }, function (error) {
        toastr.remove();
        toastr.error(error.data.errorMessage, "Error");
    });

    function GeteLabel() {
        var PDFId =
           {
               "pdfId": $scope.PDFId
           }
        var getLabel = ReceiptMapperService.Getlabel(PDFId);
        getLabel.then(function (success) {
            $scope.commonObj.Labels=success.data.data;          
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }

    //Delete label
    $scope.DeleteLabel=function(Id,index)
    {
        var DelPara =
            [{
                "id": Id
            }];
        var deleteMLabel = ReceiptMapperService.Deletelabel(DelPara);
        deleteMLabel.then(function (success) {
            $scope.commonObj.Labels.splice(index, 1);
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }

    $scope.AddLabel = function () {
        var AddPAram =
            [{
                "pdfId": $scope.PDFId,
                "tag": $scope.commonObj.LabelName
            }];
        var AddLabel = ReceiptMapperService.AddLabel(AddPAram);
        AddLabel.then(function (success) {
            $scope.commonObj.LabelName = "";
            //To reset the form validation
            $scope.LabelForm.$setUntouched();
            GeteLabel();
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });
    }
    //Cancel
    $scope.cancel = function () {
        $scope.$close();
    };
});