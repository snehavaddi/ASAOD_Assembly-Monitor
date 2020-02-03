sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"asaod/ASAOD/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("asaod.ASAOD.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			var oRootPath = jQuery.sap.getModulePath("asaod.ASAOD"); // your resource root
			var oImageModel = new sap.ui.model.json.JSONModel({
				path: oRootPath
			});
			this.setModel(oImageModel, "imageModel");
			var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/BRLT/AS_AOD_SRV/");
			var oRoleModel = new sap.ui.model.json.JSONModel();
			oModel.read("/CheckAuthSet('')", {
				success: function (oData) {
					oRoleModel.setData(oData);
				},
				error: function () {
					var oEntry = {
						EXT: "false",
						GEN: "false",
						LEAD: "false",
						TOOLADM: "false"
					};
					oRoleModel.setData(oEntry);
				},
				async: false
			});
			var oUserModel = new sap.ui.model.json.JSONModel("/services/userapi/currentUser");
			this.setModel(oUserModel, "usermodel");
			this.setModel(oModel);
			this.setModel(oRoleModel, "roles");

		}
	});
});