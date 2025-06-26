sap.ui.define(
  ["sap/ui/core/mvc/Controller", "../model/models", "sap/ui/core/Fragment"],
  function (Controller, Model, Fragment) {
    "use strict";

    return Controller.extend("employeemanagement.controller.DetailEmployee", {
      onInit: function () {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("DetailEmployee")
          .attachPatternMatched(this._onRouteMatched, this);

        // Set edit mode
        this._bEditMode = false;
        this._oOriginalData = null;
        this._validateDobCheck = true;
        this._validateHireCheck = true;
      },

      _onRouteMatched: async function (oEvent) {
        const sId = oEvent.getParameter("arguments").id;
        const oODataModel = this.getOwnerComponent().getModel("EmployeeModel");

        const sPath = `/Employees('${sId}')`;

        try {
          // Bind context and request the object from OData V4
          const oContext = oODataModel.bindContext(sPath, undefined, {
            parameters: {
              $expand: "role,department",
            },
          });

          const oData = await oContext.requestObject();

          if (oData) {
            // Set it into a JSONModel for the view
            let oEmployeeDetailModel =
              this.getView().getModel("EmployeeDetail");
            if (!oEmployeeDetailModel) {
              const oJSONEmployee = new sap.ui.model.json.JSONModel(oData);
              this.getView().setModel(oJSONEmployee, "EmployeeDetail");
            }
          } else {
            sap.m.MessageToast.show("Employee not found.");
          }
        } catch (error) {
          console.error("Failed to load employee:", error);
          sap.m.MessageBox.error("Error loading employee data.");
        }
      },

      // Press Input Form button
      onInputForm: function (oEvent) {
        // Refresh detail and reset UI
        this._bEditMode = false;
        this._setInputsEditable(false);
        this._toggleButtons(false);
        // Navigate to Create Employee Page
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("CreateEmployee");
      },

      // Press Employee List button
      onEmpList: function (oEvent) {
        // Refresh detail and reset UI
        this._bEditMode = false;
        this._setInputsEditable(false);
        this._toggleButtons(false);
        // Navigate to Overview Page
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("OverviewPage");
      },

      // Press Master Data button
      onMasterData: function () {
        // Refresh detail and reset UI
        this._bEditMode = false;
        this._setInputsEditable(false);
        this._toggleButtons(false);
        // Navigate to Master data Page
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("MasterDataPage");
      },

      // Switch to edit mode
      onEditPress: function () {
        this._bEditMode = true;
        const oView = this.getView();

        // Save original data to revert if needed
        this._oOriginalData = JSON.parse(
          JSON.stringify(oView.getModel("EmployeeDetail").getData())
        );

        // Set validate check
        this._setValidateCheck();

        // Enable inputs: find inputs by IDs and set editable
        this._setInputsEditable(true);

        // Toggle buttons visibility
        this._toggleButtons(true);
      },

      // Set validate check
      _setValidateCheck: function () {
        this._validateDobCheck = true;
        this._validateHireCheck = true;
      },

      // Cancel editing
      onCancelPress: function () {
        this._bEditMode = false;
        const oView = this.getView();

        // Revert data
        oView.getModel("EmployeeDetail").setData(this._oOriginalData);

        // Disable inputs
        this._setInputsEditable(false);

        // Toggle buttons
        this._toggleButtons(false);
      },

      // Validate Date of birth
      validateDOB: function (oEvent) {
        const oDatePicker = oEvent.getSource();
        const sDateValue = oEvent.getParameter("value");

        if (!sDateValue) {
          oDatePicker.setValueState("Error");
          oDatePicker.setValueStateText("Date of Birth is required.");
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

      // Validate form
      _validateRequiredFields: function () {
        const oView = this.getView();
        let bValid = true;

        const aFields = [
          oView.byId("name"), // first name
          oView.byId("name2"), // last name
          oView.byId("gender"), // gender
          oView.byId("dob"), // date of birth
          oView.byId("department"), // department
          oView.byId("hireDate"), // hire date
          oView.byId("role"), // role
          oView.byId("email"), // email
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

      // When mail change
      onEmailChange: function (oEvent) {
        const sEmail = oEvent.getParameter("value").trim();
        const oInput = oEvent.getSource();

        const bValid = this._validateEmail(sEmail);

        if (!bValid) {
          oInput.setValueState("Error");
          oInput.setValueStateText("Please enter a valid email address.");
        } else {
          oInput.setValueState("None");
        }
      },

      // Validate Email
      _validateEmail: function (email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
      },

      // Update button pressed
      onUpdatePress: function () {
        const oView = this.getView();

        // Run required field validation
        const bValid = this._validateRequiredFields();

        if (!bValid) {
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
        const sEmail = oView.byId("email").getValue().trim();
        const bValidEmail = this._validateEmail(sEmail);

        if (!bValidEmail) {
          const oEmailField = oView.byId("email");
          oEmailField.setValueState("Error");
          oEmailField.setValueStateText("Please enter a valid email address.");
          sap.m.MessageToast.show("Please enter a valid email address.");
          return;
        } else {
          oView.byId("email").setValueState("None");
        }

        // Open confirmation dialog
        this._openConfirmDialog({
          title: "Confirm Update",
          message: "Are you sure you want to update this employee?",
          state: "Information",
          confirmText: "Update",
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

      //Update employee
      _handleEmployeeUpdate: async function () {
        const oView = this.getView();
        const oDetailModel = oView.getModel("EmployeeDetail");
        // const oData = { ...oDetailModel.getData() };
        const oData = oDetailModel.getData();

        const sEmployeeID = oData.ID;

        if (!sEmployeeID) {
          throw new Error("Employee ID is required.");
        }

        // Remove read-only or backend-managed fields
        delete oData.ID;
        delete oData.createdAt;
        delete oData.__metadata;
        delete oData.departmentName;
        delete oData.roleName;
        delete oData.salary;
        delete oData.createdBy;
        delete oData.modifiedAt;
        delete oData.modifiedBy;

        // Convert dates to valid ISO format (YYYY-MM-DD)
        if (oData.dateOfBirth) {
          const dob = new Date(oData.dateOfBirth);
          if (!isNaN(dob)) {
            oData.dateOfBirth = dob.toISOString().slice(0, 10);
          } else {
            console.warn("Invalid dateOfBirth:", oData.dateOfBirth);
          }
        }

        if (oData.hireDate) {
          const hireDate = new Date(oData.hireDate);
          if (!isNaN(hireDate)) {
            oData.hireDate = hireDate.toISOString().slice(0, 10);
          } else {
            console.warn("Invalid hireDate:", oData.hireDate);
          }
        }

        try {
          // Use correct OData format
          const sUrl = `/odata/v4/employee/Employees('${sEmployeeID}')`;

          const response = await fetch(sUrl, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(oData),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Update failed (${response.status}): ${errorText}`);
          }

          sap.m.MessageToast.show("Employee updated successfully");

          // Refresh table if it's accessible
          const oTable = sap.ui
            .getCore()
            .byId("container-employeemanagement---OverviewPage--employeeTable");
          if (oTable) {
            const oTableBinding = oTable.getBinding("items");
            oTableBinding?.refresh();
          }
        } catch (err) {
          console.error("Failed to update employee:", err);
          sap.m.MessageBox.error(
            "Failed to update employee:\n" + (err.message || "")
          );
        }
        // Refresh detail and reset UI
        this._refreshEmployeeDetail(sEmployeeID);
        this._bEditMode = false;
        this._setInputsEditable(false);
        this._toggleButtons(false);
      },

      // On confirm Update
      onConfirm: function () {
        this._handleEmployeeUpdate();
        this._oConfirmDialog.close();
      },

      // On confirm close Update
      onCancel: function () {
        this._oConfirmDialog.close();
      },

      // Enable/disable inputs by ID
      _setInputsEditable: function (bEditable) {
        const oView = this.getView();
        [
          "name",
          "name2",
          "dob",
          "gender",
          "department",
          "hireDate",
          "role",
          "email",
        ].forEach((id) => {
          const oControl = oView.byId(id);
          if (oControl && oControl.setEditable) {
            oControl.setEditable(bEditable);
          }
        });
      },

      // Utility: toggle button visibility for edit/update/cancel
      _toggleButtons: function (bEditMode) {
        const oView = this.getView();
        oView.byId("btnEdit").setVisible(!bEditMode);
        oView.byId("btnUpdate").setVisible(bEditMode);
        oView.byId("btnCancel").setVisible(bEditMode);
        oView.byId("btnCalculateSalary").setEnabled(bEditMode);
      },

      // Utility: refresh employee detail model data after update
      _refreshEmployeeDetail: async function (sEmployeeID) {
        try {
          const oView = this.getView();
          const oModel = oView.getModel("EmployeeModel");
          const sPath = `/Employees('${sEmployeeID}')`;

          // Create a context binding and request the object
          const oContextBinding = oModel.bindContext(sPath);
          const oContext = await oContextBinding.requestObject();

          // Update the EmployeeDetail model with fresh data
          oView.getModel("EmployeeDetail").setData(oContext);
        } catch (oError) {
          console.error("Failed to refresh employee details", oError);
          sap.m.MessageBox.error("Failed to refresh employee details.");
        }
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

      // Calculate Salary
      onCalculateSalary: function () {
        const oView = this.getView();
        const oComboBox = oView.byId("role");
        const oDatePicker = oView.byId("hireDate");

        const sSelectedRoleId = oComboBox.getSelectedKey();
        const oHireDate = oDatePicker.getDateValue(); // JS Date object

        if (!sSelectedRoleId || !oHireDate) {
          sap.m.MessageBox.information("Please select a role and hire date.");
          return;
        }

        const oRoles = this.getView()
          .getModel("MasterDataModel")
          .getProperty("/roles");

        // Find the selected role by ID
        const oSelectedRole = oRoles.find(
          (role) => role.ID === sSelectedRoleId
        );
        if (!oSelectedRole) {
          sap.m.MessageBox.information("Selected role not found.");
          return;
        }

        const baseSalary = parseFloat(oSelectedRole.baseSalary || 0);
        const today = new Date();
        let years = today.getFullYear() - oHireDate.getFullYear();

        // Adjust for month/day
        const monthDiff = today.getMonth() - oHireDate.getMonth();
        const dayDiff = today.getDate() - oHireDate.getDate();
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
          years--;
        }

        const bonus = years * 1000;
        const totalSalary = baseSalary + bonus;

        // Update EmployeeDetail model
        const oEmployeeModel = this.getView().getModel("EmployeeDetail");
        oEmployeeModel.setProperty("/salary", totalSalary.toFixed(2));
      },
    });
  }
);
