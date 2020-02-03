sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
		"use strict";

		// Very simple page-context personalization
		// persistence service, not for productive use!
		var DemoPersoService = {

			oData: {
				_persoSchemaVersion: "1.0",
				aColumns: [{
					id: "epdash.epdash-idProductsTable23-EpRequestId",
					order: 0,
					text: "EP Req ID",
					visible: true
				}, {
					id: "epdash.epdash-idProductsTable23-SpsName",
					order: 1,
					text: "SPS Version",
					visible: true
				}, {
					id: "epdash.epdash-idProductsTable23-HotfixId",
					order: 2,
					text: "HOTFIX ID",
					visible: true
				}, {
					id: "epdash.epdash-idProductsTable23-Requester",
					order: 3,
					text: "Hotfix Requester",
					visible: true
				}, {
					id: "epdash.epdash-idProductsTable23-HeaderStatus",
					order: 4,
					text: "Header Status",
					visible: true
				}, {
					id: "epdash.epdash-idProductsTable23-StatusRm",
					order: 5,
					text: "Approver Status RM",
					visible: true
				}, {
					id: "epdash.epdash-idProductsTable23-StatusHf",
					order: 6,
					text: "Approver Status RM",
					visible: true
				}, {
					id: "epdash.epdash-idProductsTable23-Status",
					order: 7,
					text: "MAO Codeline Status",
					visible: true
				}, {
					id: "epdash.epdash-idProductsTable23-BusinessReason",
					order: 8,
					text: "Comment From HFG",
					visible: true
				}, {
					id: "epdash.epdash-idProductsTable23-Details",
					order: 9,
					text: "Comment From RM",
					visible: true
				}, {
					id: "epdash.epdash-idProductsTable23-Action",
					order: 10,
					text: "Action",
					visible: true
				}]
			},

			getPersData: function() {
				var oDeferred = new jQuery.Deferred();
				if (!this._oBundle) {
					this._oBundle = this.oData;
				}
				var oBundle = this._oBundle;
				oDeferred.resolve(oBundle);
				return oDeferred.promise();
			},

			setPersData: function(oBundle) {
				var oDeferred = new jQuery.Deferred();
				this._oBundle = oBundle;
				oDeferred.resolve();
				return oDeferred.promise();
			},

			resetPersData: function() {
				var oDeferred = new jQuery.Deferred();
				var oInitialData = {
					_persoSchemaVersion: "1.0",
					aColumns: [{
						id: "epdash.epdash-idProductsTable23-EpRequestId",
						order: 0,
						text: "EP Req ID",
						visible: true
					}, {
						id: "epdash.epdash-idProductsTable23-SpsName",
						order: 1,
						text: "SPS Version",
						visible: true
					}, {
						id: "epdash.epdash-idProductsTable23-HotfixId",
						order: 2,
						text: "HOTFIX ID",
						visible: true
					}, {
						id: "epdash.epdash-idProductsTable23-Requester",
						order: 3,
						text: "Hotfix Requester",
						visible: true
					}, {
						id: "epdash.epdash-idProductsTable23-HeaderStatus",
						order: 4,
						text: "Header Status",
						visible: true
					}, {
						id: "epdash.epdash-idProductsTable23-StatusRm",
						order: 5,
						text: "Approver Status RM",
						visible: true
					}, {
						id: "epdash.epdash-idProductsTable23-StatusHf",
						order: 6,
						text: "Approver Status RM",
						visible: true
					}, {
						id: "epdash.epdash-idProductsTable23-Status",
						order: 7,
						text: "MAO Codeline Status",
						visible: true
					}, {
						id: "epdash.epdash-idProductsTable23-BusinessReason",
						order: 8,
						text: "Comment From HFG",
						visible: true
					}, {
						id: "epdash.epdash-idProductsTable23-Details",
						order: 9,
						text: "Comment From RM",
						visible: true
					}, {
						id: "epdash.epdash-idProductsTable23-Action",
						order: 10,
						text: "Action",
						visible: true
					}]
				};

				//set personalization
				this._oBundle = oInitialData;

				//reset personalization, i.e. display table as defined
				//    this._oBundle = null;

				oDeferred.resolve();
				return oDeferred.promise();
			},

			//this caption callback will modify the TablePersoDialog' entry for the 'Weight' column
			//to 'Weight (Important!)', but will leave all other column names as they are.
			getCaption: function(oColumn) {
				if (oColumn.getHeader() && oColumn.getHeader().getText) {
					if (oColumn.getHeader().getText() === "Weight") {
						return "Weight (Important!)";
					}
				}
				return null;
			},

			getGroup: function(oColumn) {
				if (oColumn.getId().indexOf('productCol') != -1 ||
					oColumn.getId().indexOf('supplierCol') != -1) {
					return "Primary Group";
				}
				return "Secondary Group";
			}
		};

		return DemoPersoService;

	}, /* bExport= */ true);