angular.module('MetronicApp').controller('UploadZipCodeAndPremiumsController', function ($rootScope, $scope, $filter, settings, $http, $location, $translate, $translatePartialLoader, $interval,
  $timeout, AuthHeaderService, UploadZipCodeAndPremiumsService) {

  //set language
  $translatePartialLoader.addPart('UploadZipAndPremiums');
  $translate.refresh();
  $scope.FileDetails = {
    FileName: null,
    FileType: null,
    FileExtension: null,
    Files: []
  };

  $scope.stepScreen = true;
  // $scope.VerifyScreen = false
  $scope.FinishScreen = false;
  $scope.TemplateURL = angular.isDefined(sessionStorage.getItem("zipcodeAndPremiumTemplate")) && sessionStorage.getItem("zipcodeAndPremiumTemplate") != null ? sessionStorage.getItem("zipcodeAndPremiumTemplate") : null;
  console.log('Url', $scope.TemplateURL);


  function init() { };
  init();

  $scope.sort = function (keyname) {
    $scope.reverse = ($scope.sortKey === keyname) ? !$scope.reverse : false;
    $scope.sortKey = keyname;   //set the sortKey to the param passed
  }

  $scope.cancel = function () {
    $location.path('/PremiumValues')
  }

  $scope.FileUploadEvent = FileUploadEvent;

  function FileUploadEvent() {
    $scope.Itemlist = [];
    angular.element('#FileUpload').trigger('click');
  }
  //Get attached file details
  $scope.FileSupported = [".xls", ".xlsx", ".csv"];
  $scope.getFileDetails = function (e) {
    $scope.$apply(function () {
      $scope.ErrorMessage = "";
      $scope.isError = true;
      $scope.FileDetails;
      $scope.FileDetails.FileName = e.files[0].name;
      $scope.FileDetails.FileType = e.files[0].type;
      $scope.FileDetails.FileExtension = $scope.FileDetails.FileName.substr($scope.FileDetails.FileName.lastIndexOf('.'));
      $scope.FileDetails.Files.push(e.files[0]);
      fr = new FileReader();
      //fr.onload = receivedText;

      fr.readAsDataURL(e.files[0]);
      if ($scope.FileSupported.indexOf(($scope.FileDetails.FileExtension).toLowerCase()) === -1) {
        $scope.isError = true;
        $scope.FileDetails = {
          FileName: null,
          FileType: null,
          FileExtension: null,
          Files: []
        };
        fr = null;
        toastr.remove();
        toastr.warning("Please select xls, xlsx Or csv file..", "File type");
        $scope.ErrorMessage = ""
      } else {
        $scope.isError = false;
      }
    });
  };

  //Upload file form here
  $scope.startUpload = startUpload;
  function startUpload() {
    //show progress bar
    $scope.showProgress = true;
    $scope.uploader = { "progress": 20 }
    $scope.timer = $interval(function () {
      if (parseInt($scope.uploader.progress) < 90) {
        $scope.uploader.progress = parseInt($scope.uploader.progress) + 10;
      }
    }, 600);

    var data = new FormData();
    data.append("file", $scope.FileDetails.Files[0]);
    var UploadFile = UploadZipCodeAndPremiumsService.UploadZipCodeAndPremiumsFile(data);
    UploadFile.then(function (success) {
      $scope.uploader.progress = 100;
      $interval.cancel($scope.timer);
      $scope.data = success.data.data;
      $timeout(function () {
        $scope.stepScreen = false;
        $scope.FinishScreen = true;
      }, 500);
    },
      function (error) {
        $scope.uploader.progress = 100;
        $interval.cancel($scope.timer);
        $scope.showProgress = false;
        toastr.remove();
        toastr.error((error.data.errorMessage !== null) ? error.data.errorMessage : "Failed to upload the file. Please try again.", "Error");
        $scope.ErrorMessage = error.data.errorMessage;
      });

  }

  $scope.Done = Done;
  function Done() {
    toastr.remove();
    $location.url('/PremiumValues');
  }
});
