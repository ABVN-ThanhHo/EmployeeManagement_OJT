sap.ui.define(
  ["sap/ui/core/mvc/Controller", "../model/models", "sap/ui/core/Fragment"],
  function (Controller, Model, Fragment) {
    "use strict";

    return Controller.extend("employeemanagement.controller.CreateEmployee", {
      onInit: function () {
        this.getView().setModel(
          new sap.ui.model.json.JSONModel({
            avatarSrc: "",
          }),
          "viewModel"
        );

        // Set validate check
        this._validateDobCheck = true;
        this._validateHireCheck = true;
      },

      // Press Input Form button
      onInputForm: function (oEvent) {
        this.resetForm();
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("CreateEmployee");
      },

      // Press Employee List button
      onEmpList: function (oEvent) {
        this.resetForm();
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("OverviewPage");
      },

      // Press Master Data button
      onMasterData: function () {
        this.resetForm();
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("MasterDataPage");
      },

      // Click Avatar
      onAvatarPress: function () {
        const oUploader = this.byId("fileUploader");
        oUploader.setValue(""); //
        oUploader.getFocusDomRef().click();
      },

      onUploadImage: function (oEvent) {
        const oFile = oEvent.getParameter("files")[0];
        const oAvatar = this.byId("avatar");

        if (oFile && FileReader) {
          const reader = new FileReader();
          reader.onload = function (e) {
            oAvatar.setSrc(e.target.result);
          };
          reader.readAsDataURL(oFile);
        }
      },

      // Delete avatar
      onDeleteImage: function () {
        const oAvatar = this.byId("avatar");
        oAvatar.setSrc(""); // Remove image
        // Optionally reset to fallback icon by clearing src
      },

      // On email change
      onEmailChange: function (oEvent) {
        const sEmail = oEvent.getParameter("value").trim();
        const oInput = oEvent.getSource();

        const bValid = this._validateEmail(sEmail);

        if (!bValid) {
          oInput.setValueState("Error");
          oInput.setValueStateText("Please enter a valid email address.");
        } else {
          oInput.setValueState("None"); // Clear error
        }
      },

      // Validate Date of birth
      validateDOB: function (oEvent) {
        const oDatePicker = oEvent.getSource();
        const sDateValue = oEvent.getParameter("value");

        if (!sDateValue) {
          oDatePicker.setValueState("Error");
          oDatePicker.setValueStateText("Date of birth is required.");
          this._validateDobCheck = false;
          return;
        }

        const dob = new Date(sDateValue);
        const today = new Date();

        // Check if input is a valid date
        if (isNaN(dob.getTime())) {
          oDatePicker.setValueState("Error");
          oDatePicker.setValueStateText(
            "Invalid date format. Please enter a valid date."
          );
          this._validateDobCheck = false;
          return;
        }

        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        const d = today.getDate() - dob.getDate();

        if (m < 0 || (m === 0 && d < 0)) {
          age--;
        }

        if (age < 18) {
          oDatePicker.setValueState("Error");
          oDatePicker.setValueStateText(
            "Employee must be at least 18 years old."
          );
          this._validateDobCheck = false;
        } else {
          oDatePicker.setValueState("None");
          oDatePicker.setValueStateText("");
          this._validateDobCheck = true;
        }
      },

      // Validate hireDate
      validateHireDate: function (oEvent) {
        const oDatePicker = oEvent.getSource();
        const sDateValue = oEvent.getParameter("value");

        if (!sDateValue) {
          oDatePicker.setValueState("Error");
          oDatePicker.setValueStateText("Hire Date is required.");
          this._validateHireCheck = false;
          return;
        }

        const hireDate = new Date(sDateValue);

        // Check if the input is a valid date
        if (isNaN(hireDate.getTime())) {
          oDatePicker.setValueState("Error");
          oDatePicker.setValueStateText("Invalid Hire Date format.");
          this._validateHireCheck = false;
          return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (hireDate > today) {
          oDatePicker.setValueState("Error");
          oDatePicker.setValueStateText("Hire Date cannot be in the future.");
          this._validateHireCheck = false;
        } else {
          oDatePicker.setValueState("None");
          oDatePicker.setValueStateText("");
          this._validateHireCheck = true;
        }
      },

      // Validate email
      _validateEmail: function (email) {
        // Simple email regex
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
      },

      // Validate required fields
      _validateRequiredFields: function () {
        const oView = this.getView();
        let bValid = true;

        const aFields = [
          oView.byId("name111"),
          oView.byId("name121"),
          oView.byId("gender1"),
          oView.byId("dob1"),
          oView.byId("department1"),
          oView.byId("wfrom1"),
          oView.byId("role1"),
          oView.byId("email1"),
        ];

        aFields.forEach(function (oField) {
          const sValue = oField.getValue?.() || oField.getSelectedKey?.();

          if (!sValue) {
            oField.setValueState("Error");
            oField.setValueStateText("This field is required");
            bValid = false;
          } else {
            oField.setValueState("None");
          }
        });

        return bValid;
      },

      // When press Submit button
      onSubmit: function () {
        // Validate required fields
        if (!this._validateRequiredFields()) {
          sap.m.MessageToast.show("Please fill all required fields.");
          return;
        }

        // Validate Dob field
        if (!this._validateDobCheck) {
          sap.m.MessageToast.show("Invalid Date of Birth field.");
          return;
        }

        // Validate HireDate field
        if (!this._validateHireCheck) {
          sap.m.MessageToast.show("Invalid Hire Date field.");
          return;
        }

        // Check email
        const sEmail = this.byId("email1").getValue().trim();
        const bValidEmail = this._validateEmail(sEmail);

        if (!bValidEmail) {
          this.byId("email1").setValueState("Error");
          this.byId("email1").setValueStateText(
            "Please enter a valid email address."
          );
          sap.m.MessageToast.show("Please enter a valid email address.");
          return;
        } else {
          this.byId("email1").setValueState("None");
        }

        // Open confirmation dialog
        this._openConfirmDialog({
          title: "Confirm Create",
          message: "Are you sure you want to create this employee?",
          state: "Information",
          confirmText: "Create",
          cancelText: "Cancel",
        });
      },

      // Open Confim fragment
      _openConfirmDialog: function (oParams) {
        if (!this._oConfirmDialog) {
          Fragment.load({
            id: this.getView().getId(),
            name: "employeemanagement.view.fragment.ConfirmDialog",
            controller: this,
          }).then(
            function (oDialog) {
              this._oConfirmDialog = oDialog;
              this.getView().addDependent(oDialog);
              this._setDialogProperties(oParams);
              oDialog.open();
            }.bind(this)
          );
        } else {
          this._setDialogProperties(oParams);
          this._oConfirmDialog.open();
        }
      },

      // Set Dialog Properties
      _setDialogProperties: function (oParams) {
        const oDialogModel = new sap.ui.model.json.JSONModel({
          dialogTitle: oParams.title,
          dialogMessage: oParams.message,
          dialogState: oParams.state,
          confirmText: oParams.confirmText,
          cancelText: oParams.cancelText,
        });
        this._oConfirmDialog.setModel(oDialogModel, "dialog");
      },

      // Set validate check
      _setValidateCheck: function () {
        this._validateDobCheck = true;
        this._validateHireCheck = true;
      },

      // On confirm Update
      onConfirm: function () {
        this.onConfirmSubmit();
        this._setValidateCheck();
      },

      // On confirm close Update
      onCancel: function () {
        this._oConfirmDialog.close();
        this._setValidateCheck();
      },

      // Press OK in Confirm dialog
      onConfirmSubmit: async function () {
        const oView = this.getView();
        const oModel = this.getOwnerComponent().getModel("EmployeeModel");

        // Collect form values
        const oNewEmployee = {
          firstName: oView.byId("name111").getValue(),
          lastName: oView.byId("name121").getValue(),
          gender: oView.byId("gender1").getSelectedKey(),
          dateOfBirth: oView
            .byId("dob1")
            .getDateValue()
            ?.toISOString()
            .slice(0, 10),
          hireDate: oView
            .byId("wfrom1")
            .getDateValue()
            ?.toISOString()
            .slice(0, 10),
          email: oView.byId("email1").getValue(),
          role_ID: oView.byId("role1").getSelectedKey(),
          department_ID: oView.byId("department1").getSelectedKey(),
        };

        try {
          const oBinding = oModel.bindList("/Employees");
          const oContext = await oBinding.create(oNewEmployee).created();

          sap.m.MessageToast.show("Employee created successfully");

          // Refresh table if it's accessible
          const oTable = sap.ui
            .getCore()
            .byId("container-employeemanagement---OverviewPage--employeeTable");
          if (oTable) {
            const oTableBinding = oTable.getBinding("items");
            oTableBinding?.refresh();
          }

          this.resetForm();
          this._oConfirmDialog.close();
          this.getOwnerComponent().getRouter().navTo("OverviewPage");
        } catch (err) {
          console.error("Error creating employee:", err);

          const aDetails = err.details || err.messages;
          if (aDetails && Array.isArray(aDetails)) {
            aDetails.forEach((d) => {
              console.error(`• ${d.message} (${d.code})`);
            });
          }

          sap.m.MessageBox.error(
            "Failed to create employee:\n" +
              (aDetails?.map((d) => d.message).join("\n") || err.message)
          );
        }
      },

      // Reset form after submission
      resetForm: function () {
        const oView = this.getView();

        // Clear static inputs
        oView.byId("name111").setValue("");
        oView.byId("name121").setValue("");
        oView.byId("gender1").setSelectedKey("");
        oView.byId("dob1").setValue("");
        oView.byId("department1").setSelectedKey("");
        oView.byId("wfrom1").setValue("");
        oView.byId("role1").setSelectedKey("");
        oView.byId("email1").setValue("");

        // Reset email validation state
        oView.byId("email1").setValueState("None");

        // Reset avatar image (if you're using a viewModel for it)
        this.getView().getModel("viewModel").setProperty("/avatarSrc", "");
      },

      // Validate for comboBox
      onRoleChange: function (oEvent) {
        const oComboBox = oEvent.getSource();
        const sInputValue = oComboBox.getValue().trim();
        const aItems = oComboBox.getItems();

        let bMatchFound = false;
        let sMatchedKey = null;

        for (let i = 0; i < aItems.length; i++) {
          const oItem = aItems[i];
          if (oItem.getText().toLowerCase() === sInputValue.toLowerCase()) {
            bMatchFound = true;
            sMatchedKey = oItem.getKey();
            break;
          }
        }

        if (bMatchFound) {
          oComboBox.setValueState("None");
          oComboBox.setSelectedKey(sMatchedKey); // update the selectedKey if needed
        } else {
          oComboBox.setValueState("Error");
          oComboBox.setValueStateText(
            "Invalid selected. Please choose from the list."
          );
          oComboBox.setSelectedKey(""); // clear invalid key
        }
      },
    });
  }
);
