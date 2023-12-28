angular.module('MetronicApp').controller('PolicyHolderMobileViewController', function ($translate,$stateParams, $translatePartialLoader, $rootScope, $log, $scope, $window,
    settings, $http, $timeout, $uibModal, $location, $filter, PHMobileViewService) {


      //set language
    $translatePartialLoader.addPart('AddAppraisal');
    $translatePartialLoader.addPart('PolicyholderMobileView');

    $translate.refresh();
    $scope.PhoneValidation = true;
    $scope.ItemTab = 'Assembled';
    $scope.IsJwellery = false;
    $scope.PhoneNumber = {};
    $scope.ItemDetails = {};
    $scope.ShowItem = false;
    $scope.CheckNumber = CheckNumber;
    $scope.URL = null;
    function init()
    {
        $scope.URL = $location.absUrl();
        $scope.Prev = true;
        $scope.Next = true;
    }

    init();
    function CheckNumber(event) {
        switch (event) {
            case 'txtFirst':
                $("#txtSecond").focus();
                CheckPhonenUmber();
                break;
            case 'txtSecond':
                $("#txtThird").focus();
                CheckPhonenUmber();
                break;
            case 'txtThird':
                $("#txtFourth").focus();
                CheckPhonenUmber();
                break;
            case 'txtFourth':
                $("#txtFirst").focus();
                CheckPhonenUmber();
                break;
            default:

        }
    };

    function CheckPhonenUmber() {
        if (angular.isDefined($scope.PhoneNumber)) {
            var first = (parseInt(angular.isDefined($scope.PhoneNumber.FirstDigit) && $scope.PhoneNumber.FirstDigit != "" ? $scope.PhoneNumber.FirstDigit : null));
            var second = (parseInt(angular.isDefined($scope.PhoneNumber.SecondDigit) && $scope.PhoneNumber.SecondDigit != "" ? $scope.PhoneNumber.SecondDigit : null));
            var third = (parseInt(angular.isDefined($scope.PhoneNumber.ThirdDigit) && $scope.PhoneNumber.ThirdDigit != "" ? $scope.PhoneNumber.ThirdDigit : null));
            var fourth = (parseInt(angular.isDefined($scope.PhoneNumber.FourthDigit) && $scope.PhoneNumber.FourthDigit != "" ? $scope.PhoneNumber.FourthDigit : null));

            if (first != null && second != null && third != null && fourth != null) {

                    var MobileNumber = first.toString()+""+second.toString()+""+third.toString()+""+fourth.toString()

                    if(MobileNumber.length==4)
                    {
                        ValidateMobileNumber(MobileNumber);
                    }

            }
        }
    };

    $scope.ShowItemDetails = ShowItemDetails;
    function ShowItemDetails(item) {

        $scope.ItemDetails = angular.copy(item)

        $scope.ShowItem = true;
        $scope.Prev = false;
        $scope.Next = true;

    };
    $scope.Back = function () {
        $scope.ItemDetails = {};
        $scope.ShowItem = false;
    };
    $scope.GotoNext = function ($event) {
        $(".page-spinner-bar").removeClass("hide");


        var index;
        angular.forEach($scope.AllComparablesList.nonJewelleryItemComparables, function (item, key)
        {
            if(item.id==$scope.ItemDetails.id)
            {
                index = key;
                $scope.Prev = true;

            }
        })

        if (index != $scope.AllComparablesList.nonJewelleryItemComparables.length - 1)
        {
            $scope.ItemDetails = {};
            $scope.ItemDetails = angular.copy($scope.AllComparablesList.nonJewelleryItemComparables[index + 1]);
        }
        else {


                $scope.Prev = true;
                $scope.Next = false;



        }
        $(".page-spinner-bar").addClass("hide");

    };
    $scope.GotoPrevious = function ($event) {
        $(".page-spinner-bar").removeClass("hide");
        var index;
        angular.forEach($scope.AllComparablesList.nonJewelleryItemComparables, function (item, key) {
            if (item.id == $scope.ItemDetails.id) {
                index = key;
                $scope.Next = true;

            }
        })

        if (index != 0) {
            $scope.ItemDetails = {};
            $scope.ItemDetails = angular.copy($scope.AllComparablesList.nonJewelleryItemComparables[index - 1]);
        }
        else {
            $scope.Prev = false;
            $scope.Next = true;

        }
        $(".page-spinner-bar").addClass("hide");
    };

    $scope.SelectCat = SelectCat;
    function SelectCat(flag) {
        $scope.IsJwellery = flag;
    };
    $scope.AllComparablesList;
    $scope.ValidateMobileNumber = ValidateMobileNumber;
    function ValidateMobileNumber(mobileNumber) {
        $(".page-spinner-bar").removeClass("hide");
        var param =
            {
                "url":"http://192.168.2.121:8081/#/PolicyHolderReview",
                "lastDigits": parseInt(mobileNumber)

            }
        var validateMobileNo = PHMobileViewService.ValidateMobileNumber(param);
        validateMobileNo.then(function (success) {
            $scope.AllComparablesList = success.data.data;

            if ($scope.AllComparablesList==null)
            {
                toastr.remove();
                toastr.error(success.data.message, "Error");
                $(".page-spinner-bar").addClass("hide");
            }
        else{
          $(".page-spinner-bar").addClass("hide");
        if ($scope.AllComparablesList.nonJewelleryItemComparables.length>0)
        {
            $scope.IsJwellery = false;
        }
        $scope.PhoneValidation = false;
    }

        }, function (error) {
            toastr.remove()
            toastr.error(error.data.message, "Error");
            $(".page-spinner-bar").addClass("hide");
        });
    };

    $scope.LikeComparable = LikeComparable;
    function LikeComparable(item, flag) {
        $(".page-spinner-bar").removeClass("hide");
        if (flag == 'LIKE')
        {
            item.like = !item.like;
            if (angular.isDefined($scope.ItemDetails)) {
                angular.forEach($scope.AllComparablesList.nonJewelleryItemComparables, function (item, key) {
                    if (item.id == $scope.ItemDetails.id) {
                        item.like = $scope.ItemDetails.like;
                    }
                })
            }
        }
        else if (flag == 'PURCHASE')
        {
            item.purchase = !item.purchase;
            if (angular.isDefined($scope.ItemDetails)) {
                angular.forEach($scope.AllComparablesList.nonJewelleryItemComparables, function (item, key) {
                    if (item.id == $scope.ItemDetails.id) {
                        item.purchase = $scope.ItemDetails.purchase;
                    }
                    else {
                        item.purchase = false;
                    }
                })
            }
        }

        var ItemsList = [];
        angular.forEach($scope.AllComparablesList.nonJewelleryItemComparables, function (item) {
            ItemsList.push({
                "id": item.id,
                "like": item.like,
                "purchase": item.purchase

            })
        });

        var param =
           {
               "claimItem": {
                   "id": $scope.AllComparablesList.item.id
               },
               "vendorAssociate": {
                   "id": $scope.AllComparablesList.vendorAssociate.id
               },
               "comparableItems": ItemsList
           };

        var LikeUnlike = PHMobileViewService.LikeComparable(param);
        LikeUnlike.then(function (success) {
            $(".page-spinner-bar").addClass("hide");
            toastr.remove()
            toastr.success(error.data.message, "Confirmation");
        }, function (error) {
            toastr.remove()
            toastr.error(error.data.errorMessage, "Error");
            $(".page-spinner-bar").addClass("hide");
        });

    }

});
