angular.module('MetronicApp').controller('ContactsController', function ($rootScope, $scope, settings, $http, $timeout, $location, $translate, $translatePartialLoader,$uibModal, CompanyContactsService) {

    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        App.initAjax();
    });
  
    //set language
    $translatePartialLoader.addPart('Contact');
    $translate.refresh();

   //Variables
    
    //setting steps for contacts
    $scope.displaycontactlist = true;
    $scope.displayuploadcontacts = false;
    $scope.displaynewcontacts = false;
    $scope.AddEditTitle;
   
    function init()
    {
        $scope.ContactsList = [];
        $scope.DesignationList = [];
        $scope.ReportingManagerList = [];
        $scope.BranchList = [];
        $scope.SelectedRoles = [];
        $scope.RoleList = [];
        $scope.NewContact = {};
        $scope.CommomObj=
            {
                CompanyId:sessionStorage.getItem("CompanyId")
            }

        //Get contact List
       
        var GetContacts = CompanyContactsService.GetContactList();
        GetContacts.then(function (success) {
         $scope.ContactsList = success.data.data;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        });

        //Get Designation List
     
      
        var GetDesignation = CompanyContactsService.GetDesignationList();
        GetDesignation.then(function (success) {
          
            $scope.DesignationList = success.data.data;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        });

        //Get reporting manager against branch
        var ParamId = {
          
            "companyId": $scope.CommomObj.CompanyId
         
        }
        var GetReportingManager = CompanyContactsService.GetReportingManagerList(ParamId);
        GetReportingManager.then(function (success) {
          
            $scope.ReportingManagerList = success.data.data;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        });

        

        //Get reporting manager against branch
        var ParamId = {

            "companyId": $scope.CommomObj.CompanyId

        }
        var GetBranches = CompanyContactsService.GetBranchList(ParamId);
        GetBranches.then(function (success) {
        
            $scope.BranchList = success.data.data;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        });

        //get roles list
        var GetRoles = CompanyContactsService.GetRoleList();
        GetRoles.then(function (success) {
     
            $scope.RoleList = success.data.data;
        }, function (error) {
            $scope.ErrorMessage = error.data.errorMessage;
        });
    }
    init();

    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

    $scope.NewContact = NewContact;
    function NewContact(e)
    {
        $scope.AddEditTitle = "New Contact";
        $scope.displaycontactlist = false;
        $scope.displayuploadcontacts = false;
        $scope.displaynewcontacts = true;

        $scope.NewContact.FirstName = "";
        $scope.NewContact.LastName = "";
        $scope.NewContact.PhoneNo = "";
        $scope.NewContact.Email = "";
    }

    $scope.UploadContact = UploadContact;
    function UploadContact(e) {
       
        $scope.displaycontactlist = false;
        $scope.displayuploadcontacts = true;
        $scope.displaynewcontacts =false;
    }
    $scope.UploadBack = UploadBack;
    function UploadBack(e) {
        $scope.displaycontactlist = true;
        $scope.displayuploadcontacts = false;
        $scope.displaynewcontacts = false;
    }

    $scope.Back = Back;
    function Back(e) {
        $scope.displaycontactlist = true;
        $scope.displayuploadcontacts = false;
        $scope.displaynewcontacts = false;
    }

    // show boxes

    $scope.SelectRole = SelectRole;
    function SelectRole() {
        bootbox.alert({
            size: "",
            title: $translate.instant("SelectRoleTitle"), closeButton: false,
            message:$translate.instant("SelectRole"), 
            className: "modalcustom",
            callback: function () { /* your callback code */ }
        });
    }

    $scope.NewContactPopup = NewContactPopup;
    function NewContactPopup() {
        bootbox.alert({
            size: "",
            title: "New Contact", closeButton: false,
            message: "New contact added successfully..",
            className: "modalcustom",
            callback: function () { /* your callback code */ }
        });
    }

    $scope.UploadContactPopup = UploadContactPopup;
    function UploadContactPopup() {
        bootbox.alert({
            size: "",
            title: $scope.AddEditTitle, closeButton: false,
            message: "Contact file uploaded successfully..",
            className: "modalcustom",
            callback: function () { /* your callback code */ }
        });
    }

    //open model popup
    $scope.openRoleModel = openRoleModel;
    function openRoleModel() {
        $scope.animationsEnabled = true;
        $scope.items = "Testing Pas Value";
        var vm = this;
        var out = $uibModal.open(
            {
                animation: $scope.animationsEnabled,
                templateUrl: "views/Company/Role.html",
                controller: "RoleController",

                resolve:
                {
                    /**
                     * @return {?}
                     */

                    RoleList: function () {
                        
                        return $scope.RoleList;
                    }
                }

            });
        out.result.then(function (value) {
          
            $scope.SelectedRoles =value;

          
         
         
          
        }, function () {

        });
        return {
            open: open
        };
    }

    $scope.AddContact = AddContact;
    function AddContact()
    {
        if($scope.SelectedRoles===null||angular.isUndefined($scope.SelectedRoles)||$scope.SelectedRoles.length==0)
        {
            $scope.SelectRole();
        }
        else {
            var paramContact = {
                "firstName": $scope.NewContact.FirstName,
                "lastName": $scope.NewContact.LastName,
                "email":$scope.NewContact.Email,
                "phoneNumber": $scope.NewContact.PhoneNo ,
                "dob": "2002-08-04T00:00:00Z"
            };

            
            var AddContact = CompanyContactsService.AddNewContact(paramContact);
            AddContact.then(function (success) {
                toastr.remove();
                toastr.success(success.data.message, "Confirmation");
                $scope.status = success.data.status;
                if($scope.status==200)
                {
                    $scope.NewContactPopup();
                }
            }, function (error) {
                toastr.remove();
                toastr.error(error.data.errorMessage, "Error");
            });
        }
    }


    $scope.EditContact = EditContact;
    function EditContact(contact)
    {
        
        $scope.AddEditTitle = "Edit Contact";
        $scope.NewContact.FirstName = contact.firstName;
        $scope.NewContact.LastName = contact.lastName;
        $scope.NewContact.PhoneNo = contact.cellPhone;
        $scope.NewContact.Email = contact.email;
      
        
        //  $scope.NewContact();

        $scope.displaycontactlist = false;
        $scope.displayuploadcontacts = false;
        $scope.displaynewcontacts = true;

    }
});