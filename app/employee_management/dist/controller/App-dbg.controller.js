sap.ui.define(["sap/ui/core/mvc/Controller"], (BaseController) => {
  "use strict";

  return BaseController.extend("employeemanagement.controller.App", {
    onInit() {
      // Check user login
      const oUserModel = this.getOwnerComponent().getModel("userLoginModel");
      const roles = Object.keys(oUserModel.getData().roles || {});

      if (roles.includes("Admin")) {
        this.byId("inputForm")?.setVisible(false);
      }
    },

    onNavToOverview: function () {
      this.getOwnerComponent().getRouter().navTo("OverviewPage");
    },

    // Press Input Form button
    onInputForm: function (oEvent) {
      const oRouter = this.getOwnerComponent().getRouter();
      oRouter.navTo("CreateEmployee");
    },

    // Press Employee List button
    onEmpList: function (oEvent) {
      const oRouter = this.getOwnerComponent().getRouter();
      oRouter.navTo("OverviewPage");
    },
  });
});
