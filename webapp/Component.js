sap.ui.define([
	"sap/ui/core/UIComponent",
	'sap/ui/model/json/JSONModel'
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("epdash.epdash.Component", {
		init: function () {
			this.oJson = new sap.ui.model.json.JSONModel();
			sap.ui.getCore().setModel(this.oJson);

			UIComponent.prototype.init.apply(this, arguments);
			this.getRouter().initialize();
			var oRootPath = jQuery.sap.getModulePath("epdash/epdash/img"); // your resource root
			var oImageModel = new sap.ui.model.json.JSONModel({
				path: oRootPath
			});
			this.setModel(oImageModel, "imageModel");
			var Dl_Model = new sap.ui.model.json.JSONModel("model/dl_information.json");
			this.setModel(Dl_Model, 'Dl_Model_comp');
			var Product_oModel = new sap.ui.model.json.JSONModel("model/productName.json");
			this.setModel(Product_oModel, "product_s_name");
            var reuse_component_Model = new sap.ui.model.json.JSONModel("model/reuse_component.json");
            this.setModel(reuse_component_Model, "reuse_component");
		},

		metadata: {
			manifest: "json",
			includes: ["css/style.css"],
			dependencies: {
				libs: [
					"sap.m"
				],
				components: [
					"sap.m.Table"
				]
			}
		}

	});

});