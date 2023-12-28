//
angular.module('MetronicApp').controller('CompanyHomeController', function ($rootScope, $scope, $filter, settings, $http, $location, $translate, $translatePartialLoader, CompanyHomeService,
    AuthHeaderService) {

    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
    //set language
    $translatePartialLoader.addPart('CompanyHome');
    $translate.refresh();
    $scope.ErrorMessage = "";
    $scope.ComapnyList = [];
    $scope.CompanyDetails;

    $scope.SelectedType = {};
    $scope.OfficeDetails = {};
    $scope.OfficeList = [];
    $scope.FilteredOffice;
    $scope.StateList = [];
    $scope.SelectedOffice = {};
    $scope.ListCompany = true;
    $scope.AddCompany = false;
    $scope.ShowComanyDetails = true;
    $scope.showPersonalDetails = false;
    $scope.AddOffice = false;
    $scope.MemberContact = false;
    $scope.OfficeSummary = false;
    $scope.FlagForBreadcrumb = null;
    $scope.UserType = sessionStorage.getItem('RoleList');
    $scope.FileUploadSave = false;
    $scope.CompanyBgImages = [];
    CompanyBackgroundImages=[];
    $scope.deleteBackgroundImage=[];

    function init() {
        $scope.CommonObj =
        {
            ShowItem: "All"
        };
        GetStateList();
        GetInsuranceCompanyDetails();
        GetCompanyBackgroundImages()
    }
    init();

    $scope.GetOfficeList = GetOfficeList;
    function GetOfficeList() {
        $(".page-spinner-bar").removeClass("hide");
        var CompanyId = {
            "id": sessionStorage.getItem("CompanyId")
        };
        var getOfficePromise = CompanyHomeService.GetOfficeList(CompanyId);
        getOfficePromise.then(function (success) {
            $scope.OfficeList = success.data.data;
            $scope.FilteredOffice = success.data.data;
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            if (error.status === 500 || error.status === 404) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            };
            $(".page-spinner-bar").addClass("hide");
        });
    }

    $scope.GetInsuranceCompanyDetails = GetInsuranceCompanyDetails;
    function GetInsuranceCompanyDetails() {
        $(".page-spinner-bar").removeClass("hide");
        var CompanyId = {
            "id": sessionStorage.getItem("CompanyId")
        };
        var getCompanyDetails = CompanyHomeService.getCompanyDetails(CompanyId);
        getCompanyDetails.then(function (success) {
            $scope.CompanyDetails = success.data.data;
            $scope.CompanyDetails.fax = $filter('tel')($scope.CompanyDetails.fax);
            $scope.CompanyDetails.companyPhoneNumber = $filter('tel')($scope.CompanyDetails.companyPhoneNumber);
            $scope.ImageLogo =
            {
                "FileName": null,
                "FileExtension": null,
                "FileType": null,
                "Image": $scope.CompanyDetails.companyLogo === null ? "assets/global/img/no-image.png" : $scope.CompanyDetails.companyLogo.url,
                "File": null
            };
            if ($scope.CompanyDetails.adminDetails === null) {
                $scope.CompanyDetails.adminDetails = { "firstName": '', "lastName": '', "email": '', "eveningTimePhone": '', "id": null, "isActive": null, "roles": null };
            }
            else {
                $scope.CompanyDetails.adminDetails.eveningTimePhone = $filter('tel')($scope.CompanyDetails.adminDetails.eveningTimePhone);
            }
            $scope.GetOfficeList();
        }, function (error) {
            if (error.status === 500 || error.status === 404) {
                toastr.remove();
                toastr.error(AuthHeaderService.genericErrorMessage(), "Error");
            }
            else {
                toastr.remove();
                toastr.error(error.data, errorMessage, "Error");
            }
            $(".page-spinner-bar").addClass("hide");
        });
    };

    $scope.GetCompanyBackgroundImages = GetCompanyBackgroundImages;
    function GetCompanyBackgroundImages(){
        var CompanyId = {
            "id": sessionStorage.getItem("CompanyId")
        };
        CompanyBackgroundImages =[];
        $scope.CompanyBgImages=[];
        var backgroundimages=[];
        var getCompanyDetails = CompanyHomeService.GetCompanyBackgroundImages(CompanyId);
        getCompanyDetails.then(function (success) {
            var backgroundImages = success.data.data;
            if(backgroundImages){
            backgroundImages.attachments.map((image,index)=>{
            var backgroundImage =
            {
                "FileName": null,
                "FileExtension": null,
                "FileType": null,
                "Image": image.url === null ? "assets/global/img/no-image.png" : image.url,
                "File": null,
                "Id" : image.id,
                "Description" : image.description
            };
        var backgroundimage =
        {
            "FileName": null,
                "FileExtension": null,
                "FileType": null,
                "Image": image.url === null ? "assets/global/img/no-image.png" : image.url,
                "File": null,
                "Id" : image.id,
                "Description" : image.description
        }
        CompanyBackgroundImages[index] = backgroundImage;
          $scope.CompanyBgImages[index] = backgroundimage;
          });
        }
        });
    };

    $scope.GetStateList = GetStateList;
    function GetStateList() {
        var param =
        {
            "isTaxRate": false,
            "isTimeZone": false
        };
        var getStateList = CompanyHomeService.getStateList(param);
        getStateList.then(function (success) { $scope.StateList = success.data.data; }, function (error) { $scope.ErrorMessage = error.data.errorMessage; });
    };

    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

    //To render view as edit or add 
    $scope.AddEditCompany = AddEditCompany;
    function AddEditCompany(item) {
        $scope.ListCompany = false;
        $scope.AddCompany = true;
        $scope.shownextbtn = true;
        $scope.showbackbtn = false;
        $scope.showRegisterbtn = false;
    }

    //Cancel add edit company and show default list view
    $scope.ShowlistComapny = ShowlistComapny;
    function ShowlistComapny() {
        $scope.ListCompany = true;
        $scope.AddCompany = false;
        $scope.AddOffice = false;
        $scope.MemberContact = false;
        $scope.OfficeSummary = false;

        $scope.shownextbtn = false;
        $scope.showbackbtn = false;
        $scope.showRegisterbtn = false;
        $scope.SelectedType.Selected = "";
    }


    //Next Step for insert contact details for company
    $scope.NextStep = NextStep;
    function NextStep(e) {
        {
            $scope.showbackbtn = true;
            $scope.showRegisterbtn = true;
            $scope.shownextbtn = false;
            $scope.ShowComanyDetails = false;
            $scope.showPersonalDetails = true;
        }
    }

    //go to company details
    $scope.PrevStep = PrevStep;
    function PrevStep(e) {
        $scope.showbackbtn = false;
        $scope.showRegisterbtn = false;
        $scope.shownextbtn = true;
        $scope.ShowComanyDetails = true;
        $scope.showPersonalDetails = false;
    }

    $scope.ShowOffice = ShowOffice;
    function ShowOffice() {
        $scope.ListCompany = false;
        $scope.AddCompany = false;
        $scope.AddOffice = true;
        $scope.MemberContact = false;
        $scope.OfficeSummary = false;
    }




    //Save Conatct Details
    $scope.RegisterConatctDetails = RegisterConatctDetails;
    function RegisterConatctDetails(e) {

        var Contactparam = {
            //"companyId": $scope.ContactDetails.companyId,
            "firstName": $scope.ContactDetails.firstName,
            "lastName": $scope.ContactDetails.lastName,
            "email": $scope.ContactDetails.email,
            "phoneNumber": $scope.ContactDetails.phoneNumber.replace(/[^0-9]/g, ''),
            "dob": "2002-08-04T00:00:00Z"
            //"isAdmin":false            
        };
        var AddContactDetails = CompanyHomeService.NewContact(Contactparam);
        AddContactDetails.then(function (success) {
            toastr.remove();
            toastr.success(success.data.message, "Confirmation");
        }, function (error) {
            toastr.remove();
            toastr.error(error.data.errorMessage, "Error");
        });


    }


    $scope.AddNew = AddNew;
    function AddNew() {

        if ($scope.SelectedType.Selected === "1") {
            $scope.AddEditCompany(null);

        }
        else if ($scope.SelectedType.Selected === "2") {
            $scope.ShowOffice();
        }
    }

    $scope.OfcNextStep = OfcNextStep;
    function OfcNextStep() {
        $scope.ListCompany = false;
        $scope.AddCompany = false;
        $scope.AddOffice = false;
        $scope.MemberContact = true;
        $scope.OfficeSummary = false;
    };
    $scope.OfcShowSummary = OfcShowSummary;
    function OfcShowSummary() {

        $scope.ListCompany = false;
        $scope.AddCompany = false;
        $scope.AddOffice = false;
        $scope.MemberContact = false;
        $scope.OfficeSummary = true;
    };

    $scope.OfcBackToList = OfcBackToList;
    function OfcBackToList() {
        $scope.ListCompany = true;
        $scope.AddCompany = false;
        $scope.AddOffice = false;
        $scope.MemberContact = false;
        $scope.OfficeSummary = false;
        $scope.SelectedType.Selected = "";
    }
    $scope.OfcBackToAddOfc = OfcBackToAddOfc;
    function OfcBackToAddOfc() {
        $scope.ListCompany = false;
        $scope.AddCompany = false;
        $scope.AddOffice = true;
        $scope.MemberContact = false;
        $scope.OfficeSummary = false;
    }

    $scope.AddOfficeDetails = AddOfficeDetails;
    function AddOfficeDetails() {
        $scope.OfcBackToList();
    }
    //######################################################################
    $scope.AddNewContact = false;
    $scope.AddNewContacts = AddNewContacts;
    function AddNewContacts() {
        $scope.AddNewContact = true;
    }

    $scope.CancelAddNewContacts = CancelAddNewContacts;
    function CancelAddNewContacts() {
        $scope.AddNewContact = false;
    }

    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }


    //##########################################################################################
    $scope.AddNewOffice = false;
    $scope.EditCompany = false;
    $scope.CompanyHome = true;

    $scope.EditCompanyData = EditCompanyData;
    function EditCompanyData() {
        $scope.EditCompany = true;
        $scope.CompanyHome = false;
    }

    $scope.GotoCompanyDetails = GotoCompanyDetails;
    function GotoCompanyDetails() {
        $scope.EditCompany = false;
        $scope.CompanyHome = true;
    }

    $scope.GoBackCompany = GoBackCompany;
    function GoBackCompany() {
        $scope.EditCompany = false;
        $scope.CompanyHome = true;
    }
    $scope.SelectedOffice = {}


    $scope.getOfficeTemplate = function (item) {

        if (!angular.isUndefined(item)) {
            if (item.id === $scope.SelectedOffice.id) return 'edit';
            else
                return 'display';
        }
        else
            return 'display';
    };

    $scope.editOffice = function (item) {
        sessionStorage.setItem("BranchId", item.id);
        sessionStorage.setItem("CompanyName", $scope.CompanyDetails.companyName)
        sessionStorage.setItem("BranchName", item.branchName)
        sessionStorage.setItem("IsEditBranch", true);
        $location.url('NewBranch');
    };

    $scope.saveOffice = function (idx) {

        if (!angular.isUndefined(idx)) {

            console.log("Saving contact");
            $scope.OfficeList[idx] = angular.copy($scope.SelectedOffice);
        }
        else {//Call Api save And get its id then assign id and pass 
            $scope.SelectedOffice.Id = 101;
            $scope.OfficeList.splice(0, 0, $scope.SelectedOffice)
        }
        $scope.resetOffice();
    };
    $scope.AddNewOfc = function () {
        sessionStorage.setItem("IsEditBranch", false);
        sessionStorage.setItem("CompanyName", $scope.CompanyDetails.companyName)
        $location.url('NewBranch');
    }

    $scope.deleteOffice = function (index) {
        $scope.OfficeList.splice(index, 1);
    }
    $scope.resetOffice = function () {
        $scope.AddNewOffice = false;
        $scope.SelectedOffice = {}
    };
    $scope.SelectLogo = function () {
        angular.element('#CompanyLogoUpload').trigger('click');
    };
    $scope.SelectCompanyBgImage = function (index) {
        angular.element('#bgImage'+index).trigger('click');
    };
    $scope.ImageLogo = {};
    $scope.getLogoDetails = function (e) {
        var files = e.files;
        var file = files[0];
        var reader = new FileReader();
        reader.file = file;
        reader.fileName = file.name;
        reader.fileType = file.type;
        reader.fileExtension = file.name.substr(file.name.lastIndexOf('.'));
        reader.onload = $scope.imageIsLoaded;
        reader.readAsDataURL(file);
        $scope.FileUploadSave = true;
    };
    $scope.Form = {};
    $scope.imageIsLoaded = function (e) {
        $scope.$apply(function () {
            $scope.ImageLogo = {
                "FileName": e.target.fileName,
                "FileExtension": e.target.fileExtension,
                "FileType": e.target.fileType,
                "Image": e.target.result,
                "File": e.target.file,
                "isNew": true
            };
            angular.element('#CompanyLogoUpload').val('');
            $scope.Form.CompanyForm.$setDirty();
        });
    };

    $scope.bgImage = {};
    $scope.getBgImageDetails = function (e,index) {
        var files = e.files;
        var file = files[0];
        var fileExtension = file.name.substr(file.name.lastIndexOf('.'));
        var size = file.size;
        if(['.jpeg','.png','.svg','.webp','.zip','.jpg'].includes(fileExtension))
        {              
            if(size <= 20000000)
            {
            var reader = new FileReader();
            reader.file = file;
            reader.fileName = file.name;
            reader.fileType = file.type;
            reader.fileExtension = file.name.substr(file.name.lastIndexOf('.'));
            reader.onload = (loadevent)=>$scope.BgimageIsLoaded(loadevent,index);
            reader.readAsDataURL(file);
            }
            else
            {
                toastr.remove()
                toastr.error("file size exceeded . Please upload image below 20Mb", $translate.instant("ErrorHeading")); 
            }
        }
        else
        {
            toastr.remove()
            toastr.error("Only image with jpeg,jpg,svg,png,webp and zip format is supported", $translate.instant("ErrorHeading")); 
        }
    };
    
    $scope.Form = {};
    $scope.BgimageIsLoaded = function (e,index) {
        console.log(e);
        $scope.$apply(function () {
            $scope.CompanyBgImages[index] = {
                "FileName": e.target.fileName,
                "FileExtension": e.target.fileExtension,
                "FileType": e.target.fileType,
                "Image": e.target.result,
                "File": e.target.file,
                "isNew": true
            };
            angular.element("#bgImage"+index).val('');
            $scope.Form.CompanyForm.$setDirty();
        });
    };

    $scope.CompanyBgImageCancel = CompanyBgImageCancel;
    function CompanyBgImageCancel(index) {
        $scope.CompanyBgImages[index] =
        {
            "FileName": null,
            "FileExtension": null,
            "FileType": null,
            "Image": CompanyBackgroundImages[index] === undefined ? " " : CompanyBackgroundImages[index].Image,
            "File": null,
            "isNew": false
        };
    }

    $scope.CompanyLogoCancel = CompanyLogoCancel;
    function CompanyLogoCancel() {
        $scope.FileUploadSave = false;
        $scope.ImageLogo =
        {
            "FileName": null,
            "FileExtension": null,
            "FileType": null,
            "Image": $scope.CompanyDetails.companyLogo === null ? "assets/global/img/no-image.png" : $scope.CompanyDetails.companyLogo.url,
            "File": null,
            "isNew": false
        };
    }
    //
    $scope.UpdateCompanyLogo = UpdateCompanyLogo;
    function UpdateCompanyLogo() {
        $(".page-spinner-bar").removeClass("hide");
        var data = new FormData();
        if ($scope.ImageLogo) {
            data.append("fileDetails", JSON.stringify({
                "fileName": $scope.ImageLogo.FileName,
                "fileType": $scope.ImageLogo.FileType,
                "extension": $scope.ImageLogo.FileExtension,
                "filePurpose": "COMPANY_LOGO",
                "latitude": null,
                "longitude": null,
                "footNote": ""
            }));
            data.append("file", $scope.ImageLogo.File);
        }
        var UpdateLogo = CompanyHomeService.UpdateCompanyLogo(data);
        UpdateLogo.then(function (success) {
            var updatedLogo = success.data.data;
            if (updatedLogo)
                mapUpdateLogo(updatedLogo.fileURL, updatedLogo.fileName);
            toastr.remove()
            toastr.success(success.data.message, $translate.instant("CommonConfirmationHeading"));
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            toastr.remove()
            toastr.error(error.data.errorMessage, $translate.instant("ErrorHeading"));
            $(".page-spinner-bar").addClass("hide");
        })
    }

    function mapUpdateLogo(updatedLogoURL, filename) {
        $scope.CompanyDetails.companyLogo = {
            "id": null,
            "name": null,
            "purpose": null,
            "type": null,
            "url": updatedLogoURL == null ? "assets/global/img/no-image.png" : updatedLogoURL,
            "multiPartFiles": null
        }
        $scope.ImageLogo =
        {
            "FileName": null,
            "FileExtension": null,
            "FileType": null,
            "Image": updatedLogoURL == null ? "assets/global/img/no-image.png" : updatedLogoURL,
            "File": null,
            "isNew": false
        };
        $scope.FileUploadSave = false;
    }

    // $scope.UpdateCompanyBgImage = UpdateCompanyBgImage;
    // function UpdateCompanyBgImage(index) {
    //     $(".page-spinner-bar").removeClass("hide");
    //     var data = new FormData();
    //     if ($scope.CompanyBgImages.length > 0 && $scope.CompanyBgImages[index]!==undefined) {
    //         data.append("fileDetails", JSON.stringify({
    //             "fileName": $scope.ImageLogo.FileName,
    //             "fileType": $scope.ImageLogo.FileType,
    //             "extension": $scope.ImageLogo.FileExtension,
    //             "filePurpose": "BACKGROUND_IMAGE",
    //             "latitude": null,
    //             "longitude": null,
    //             "footNote": ""
    //         }));
    //         data.append("file", $scope.CompanyBgImages[index]);
    //     }
    //     var UpdateLogo = CompanyHomeService.UpdateCompanyLogo(data);
    //     UpdateLogo.then(function (success) {
    //         var updatedLogo = success.data.data;
    //         if (updatedLogo)
    //             mapUpdateLogo(updatedLogo.fileURL, updatedLogo.fileName);
    //         toastr.remove()
    //         toastr.success(success.data.message, $translate.instant("CommonConfirmationHeading"));
    //         $(".page-spinner-bar").addClass("hide");
    //     }, function (error) {
    //         toastr.remove()
    //         toastr.error(error.data.errorMessage, $translate.instant("ErrorHeading"));
    //         $(".page-spinner-bar").addClass("hide");
    //     })
    // }

    // function mapUpdateLogo(updatedLogoURL, filename) {
    //     $scope.CompanyDetails.companyLogo = {
    //         "id": null,
    //         "name": null,
    //         "purpose": null,
    //         "type": null,
    //         "url": updatedLogoURL == null ? "assets/global/img/no-image.png" : updatedLogoURL,
    //         "multiPartFiles": null
    //     }
    //     $scope.ImageLogo =
    //     {
    //         "FileName": null,
    //         "FileExtension": null,
    //         "FileType": null,
    //         "Image": updatedLogoURL == null ? "assets/global/img/no-image.png" : updatedLogoURL,
    //         "File": null,
    //         "isNew": false
    //     };
    //     $scope.FileUploadSave = false;
    // }

    

    $scope.UpdateCompany = function () {
        $(".page-spinner-bar").removeClass("hide");
        var data = new FormData();

        $scope.deleteBackgroundImage.forEach(file_Id => {

            var DeleteItem = CompanyHomeService.DeleteBackgroundImage(file_Id);
            DeleteItem.then(function (success) {
                GetCompanyBackgroundImages();
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });
        });
        $scope.deleteBackgroundImage=[];

        var filedetails=[];
        if ($scope.ImageLogo && $scope.ImageLogo.isNew) {
            data.append("filesDetails", JSON.stringify([{
                "fileName": $scope.ImageLogo.FileName,
                "fileType": $scope.ImageLogo.FileType,
                "extension": $scope.ImageLogo.FileExtension,
                "filePurpose": "COMPANY_LOGO",
                "latitude": null,
                "longitude": null
            }]))
            data.append("file", $scope.ImageLogo.File);
        }
        if ($scope.CompanyBgImages.length > 0) {
            var fileDetails = [];
            $scope.CompanyBgImages.map((image,index)=>
            {
                if(image.FileName !== null){
                if(CompanyBackgroundImages[index]?.Id !== undefined)
                 var oldId = CompanyBackgroundImages[index]?.Id
                 fileDetails.push({
                "fileName": image.FileName,
                "fileType": image.FileType,
                "extension": image.FileExtension,
                "filePurpose": "BACKGROUND_IMAGE",
                "latitude": null,
                "longitude": null,
                "description": image.Description,
                "oldId":oldId,
            });
            data.append("file", image.File);
                }
         });
         if(fileDetails.length > 0)
         data.append('filesDetails', JSON.stringify(fileDetails));
        }
        for(var i=0;i< $scope.CompanyBgImages.length;i++)
        {
            if($scope.CompanyBgImages[i]?.Description != CompanyBackgroundImages[i]?.Description)
            {
                if($scope.CompanyBgImages[i].FileName === null)
                {
                
                filedetails.push({
                    "imageId": $scope.CompanyBgImages[i].Id,
                    "filePurpose": "BACKGROUND_IMAGE",
                    "latitude": null,
                    "longitude": null,
                    "description": $scope.CompanyBgImages[i].Description
                  })
                }
            }
        }
        if(filedetails.length>0)
        data.append("filesDetails",JSON.stringify(filedetails));

        if (angular.isDefined($scope.CompanyDetails.id) && $scope.CompanyDetails.id !== null) {
            data.append("companyDetails", JSON.stringify(
                {
                    "id": $scope.CompanyDetails.id,
                    "companyName": $scope.CompanyDetails.companyName,
                    "companyAliasing" : $scope.CompanyDetails.companyAliasing,
                    "publicWebsite": $scope.CompanyDetails.publicWebsite,
                    "companyPhoneNumber": $scope.CompanyDetails.companyPhoneNumber.replace(/[^0-9]/g, ''),
                    "fax": $scope.CompanyDetails.fax.replace(/[^0-9]/g, ''),
                    "active": $scope.CompanyDetails.active,
                    "adminDetails":
                    {
                        "id": $scope.CompanyDetails.adminDetails.id,
                        "email": $scope.CompanyDetails.adminDetails.email,
                        "eveningTimePhone": $scope.CompanyDetails.adminDetails.eveningTimePhone.replace(/[^0-9]/g, ''),
                        "firstName": $scope.CompanyDetails.adminDetails.firstName,
                        "lastName": $scope.CompanyDetails.adminDetails.lastName,
                        "isActive": $scope.CompanyDetails.adminDetails.isActive,
                        "roles": $scope.CompanyDetails.adminDetails.roles
                    },
                    "companyAddress": {
                        "id": $scope.CompanyDetails.companyAddress.id,
                        "city": $scope.CompanyDetails.companyAddress.city,
                        "state": {
                            "id": $scope.CompanyDetails.companyAddress.state.id,
                            "state": $scope.GetStateName($scope.CompanyDetails.companyAddress.state.id)
                        },
                        "streetAddressOne": $scope.CompanyDetails.companyAddress.streetAddressOne,
                        "streetAddressTwo": $scope.CompanyDetails.companyAddress.streetAddressTwo,
                        "zipcode": $scope.CompanyDetails.companyAddress.zipcode
                    },
                   "ssoBaseUrl":$scope.CompanyDetails.ssoBaseUrl,
                   "ssoClientId":$scope.CompanyDetails.ssoClientId,
                   "ssoClientSecretKey":$scope.CompanyDetails.ssoClientSecretKey,
                   "ssoRedirectionUrl":$scope.CompanyDetails.ssoRedirectionUrl

                }));
        };
        var UpdateCompany = CompanyHomeService.UpdateCompanyDetails(data);
        UpdateCompany.then(function (success) {
            var updatedCompany = success.data.data;
            GetCompanyBackgroundImages();
            if (updatedCompany)
                mapUpdateLogo(updatedCompany.companyLogo.url, updatedCompany.companyLogo.name);
            toastr.remove()
            toastr.success(success.data.message, $translate.instant("CommonConfirmationHeading"));
            $(".page-spinner-bar").addClass("hide");
        }, function (error) {
            toastr.remove()
            toastr.error(error.data.errorMessage, $translate.instant("ErrorHeading"));
            $(".page-spinner-bar").addClass("hide");
        })
    };

    $scope.GetStateName = GetStateName;
    function GetStateName(StateId) {
        var list = $filter('filter')($scope.StateList, { id: StateId });
        return list[0].state;
    }

    $scope.FilterCompany = FilterCompany;
    function FilterCompany() {
        if ($scope.CommonObj.ShowItem == "All") {
            $scope.OfficeList = $scope.FilteredOffice;
        }
        else {
            var list = $filter('filter')($scope.FilteredOffice, { id: StateId });
        }
    };


    $scope.GotoHome = function () {
        $location.url(sessionStorage.getItem('HomeScreen'));
    };

    $scope.GoBack = function () {
        $location.url('InsuranceCompanies');
    };
    $scope.ChnageTimeZone = function () {
        if (angular.isDefined($scope.CompanyDetails.companyAddress) && $scope.CompanyDetails.companyAddress !== null) {
            if (angular.isDefined($scope.CompanyDetails.companyAddress.state.id) && $scope.CompanyDetails.companyAddress.state.id != null)
                angular.forEach($scope.StateList, function (item) {
                    if (item.id == $scope.CompanyDetails.companyAddress.state.id)
                        $scope.CompanyDetails.companyAddress.state.timeZone = item.timeZone;
                });
        }
    };



    $scope.DeleteBranch = DeleteBranch;
    function DeleteBranch(item) {
        bootbox.confirm({
            size: "",
            title: "Delete Company Branch",
            message: "Are you sure want to delete branch?", closeButton: false,
            className: "modalcustom", buttons: {
                confirm: {
                    label: "Yes",
                    className: 'btn-success'
                },
                cancel: {
                    label: "No", //$translate.instant('ClaimDetails_Delete.BtnNo'),
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                if (result) {
                    if (angular.isDefined(item.id) && item.id !== null) {
                        var param = {
                            "branchId": item.id
                        };
                        var DeleteItem = CompanyHomeService.DeleteCompanyBranch(param);
                        DeleteItem.then(function (success) {
                            toastr.remove();
                            toastr.success(success.data.message, "Confirmation");
                            $scope.GetOfficeList();
                        }, function (error) {
                            toastr.remove();
                            toastr.error(error.data.errorMessage, "Error");
                        });
                    }
                }
            }
        });
    }

    $scope.DeleteBackgroundImage = DeleteBackgroundImage;
    function DeleteBackgroundImage(index){
        var file_Id = CompanyBackgroundImages[index].Id;
        $scope.deleteBackgroundImage.push(file_Id);
        $scope.CompanyBgImages[index] = {
            "FileName": null,
                "FileExtension": null,
                "FileType": null,
                "Image": 'assets/global/img/no-image.png',
                "File": null,
                "Id" : null,
                "Description" : null
        }
        CompanyBackgroundImages[index] = {
            "FileName": null,
                "FileExtension": null,
                "FileType": null,
                "Image": 'assets/global/img/no-image.png',
                "File": null,
                "Id" : null,
                "Description" : null
        };
        // angular.element("#bgImage"+index).src('')
        $scope.Form.CompanyForm.$setDirty();

    }
});