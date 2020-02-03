sap.ui.define([
	"asaod/ASAOD/controller/BaseController",
	"asaod/ASAOD/formatter/formatter",
	"sap/ui/model/json/JSONModel",
	'sap/m/MessageBox',
	'sap/m/MessageToast',
	'sap/m/Dialog',
	'sap/m/Button',
	'sap/m/Text'
], function (BaseController, formatter, JSONModel, MessageToast, MessageBox, Dialog, Button, Text) {
	"use strict";

	return BaseController.extend("asaod.ASAOD.controller.Admin", {
		formatter: formatter,
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("Admin").attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function (oEvent) {
			this.oModel = this.getOwnerComponent().getModel();
			this.onRefreshAdmin();

		},

		onAddAdmin: function () {
			if (!this._oCreateDialog) {
				this._oCreateDialog = sap.ui.xmlfragment("asaod.ASAOD.fragment.admin", this);
				this.getView().addDependent(this._oCreateDialog);
				var oMembers = new JSONModel();
				var oDlList = new JSONModel();

				this.oModel.read("/AresMemberSet", {
					success: function (oData) {
						oMembers.setData(oData);
					},
					async: false
				});

				this.oModel.read("/AresDlSet", {
					success: function (oData) {
						oDlList.setData(oData);
					},
					error: function () {},
					async: false
				});
				this._oCreateDialog.setModel(oMembers, 'DlMembers');
				this._oCreateDialog.setModel(oDlList, 'DlList');
			}
			var oCreateModel = new sap.ui.model.json.JSONModel({
				Name: "",
				ToolAdmin: false,
				Lead: false,
				Dl: ""
			});
			this._oCreateDialog.setModel(oCreateModel, 'admin');
			this._oCreateDialog.open();

		},

		closeCreateDialog: function () {
			if (this._oCreateDialog.getModel('list') !== undefined) {
				this._oCreateDialog.getModel('list').setData(null);
			}
			this._oCreateDialog.close();

		},
		onSuggest: function (oEvent) {
			var value = oEvent.getParameter("suggestValue");
			var filters = [];
			if (value) {
				filters = [
					new sap.ui.model.Filter([
						new sap.ui.model.Filter("DlName", function (sText) {
							return (sText || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
						})
					], false)
				];
			}
			oEvent.getSource().getBinding("suggestionItems").filter(filters);
			oEvent.getSource().suggest();
			// dlName = oEvent.getParameters().suggestValue;
		},
		onDeleteAdmin: function (oEvent) {
			var that = this;
			var sName = that.getView().getModel("hdr").getProperty(oEvent.getSource().getParent().getBindingContextPath("hdr")).Uname;
			jQuery.sap.require("sap.m.MessageBox");
			sap.m.MessageBox.warning(
				"Are you sure, you want to DELETE?", {
					actions: [sap.m.MessageBox.Action.DELETE, sap.m.MessageBox.Action.CANCEL],
					onClose: function (sAction) {
						if (sAction === "DELETE") {
							var sPath = "/AdminHdrSet('" + sName + "')";
							that.oModel.remove(sPath, {
								success: function () {
								    sap.ui.getCore().getModel('roles').oData.LEAD = 'false';
									that.onRefreshAdmin();
								},
								error: function () {
									sap.m.MessageBox.error("Deletion failed!!!");
								}

							});
						}
					}
				}
			);

		},
		onRefreshAdmin: function () {
			var oAdminHdrModel = new sap.ui.model.json.JSONModel();
			this.oModel.read("/AdminHdrSet", {
				success: function (oData) {
					oAdminHdrModel.setData(oData);
				},
				error: function () {
					sap.m.MessageBox.error("Backend Call Failed, Please try again.If error persists, contact Developer");
				}
			});
			this.getView().setModel(oAdminHdrModel, "hdr");
		},
		onDlAdd_create: function (oEvent) {
			var selectDl = this._oCreateDialog.getModel('admin').getData().Dl;
			//    var selectDl = oEvent.getSource().getParent().getElements()[0].getValue();
			var that = this;
			var oselectDl = new JSONModel();
			this.oModel.read("/AresDlSet('" + selectDl + "')", {
				success: function (oData) {
					var isModel = that._oCreateDialog.getModel('list');
					var oFrgModel = that._oCreateDialog.getModel('admin');
					var oFrgData = oFrgModel.getData();
					var aData;
					if (oData.DlAlias.length !== 0) {
						if (isModel === undefined || isModel.getData() === null) {
							aData = [];
							aData.push(oData);
							oselectDl.setData(aData);
							oFrgData.Lead = true;
							oFrgData.Dl = "";
							oFrgModel.setData(oFrgData);
							oFrgModel.refresh(true);
							that._oCreateDialog.setModel(oselectDl, 'list');
						} else {
							aData = that._oCreateDialog.getModel('list').getData();
							for (var x in aData) {
								if (aData[x].DlName === oData.DlName) {
									MessageToast.show("DL already added");
									var bDlExists = true;
									break;
								}
							}
							if (!bDlExists) {
								aData.push(oData);
								oselectDl.setData(aData);
								that._oCreateDialog.setModel(oselectDl, 'list');
								oFrgData.Lead = true;
								oFrgData.Dl = "";
								oFrgModel.setData(oFrgData);
								oFrgModel.refresh(true);
							}

						}
					} else {
						MessageToast.show('DL is Invalid');
					}

				},
				error: function () {}
			});
		},
		onDlAdd_update: function (oEvent) {
			var selectDl = this._oUpdateDialog.getModel('update_admin').getData().Dl;
			var that = this;
			this.oModel.read("/AresDlSet('" + selectDl + "')", {
				success: function (oData) {
					var isModel = that._oUpdateDialog.getModel('list');
					var oFrgModel = that._oUpdateDialog.getModel('update_admin');
					var oFrgData = oFrgModel.getData();
					var aData;
					if (oData.DlAlias.length !== 0) {
						if (isModel === undefined || isModel.getData().results.length === 0) {
							var oEntry = {
								Dl: oData.DlName
							};
							that._oUpdateDialog.getModel('list').getData().results.push(oEntry);
							that._oUpdateDialog.getModel('list').refresh(true);
							oFrgData.Islead = true;
							oFrgModel.setData(oFrgData);
							oFrgModel.refresh(true);
							that._oUpdateDialog.getModel('update_admin').getData().Dl = "";
							that._oUpdateDialog.getModel('update_admin').refresh(true);
						} else {
							aData = that._oUpdateDialog.getModel('list').getData();
							for (var x in aData.results) {
								if (aData.results[x].Dl === oData.DlName) {
									MessageToast.show("DL already added");
									var bDlExists = true;
									break;
								}
							}
							if (!bDlExists) {
								oEntry = {
									Dl: oData.DlName
								};
								that._oUpdateDialog.getModel('list').getData().results.push(oEntry);
								that._oUpdateDialog.getModel('list').refresh(true);
								that._oUpdateDialog.getModel('update_admin').getData().Dl = "";
								that._oUpdateDialog.getModel('update_admin').refresh(true);
							}
						}
					} else {
						MessageToast.show('DL is Invalid');
					}
				},
				error: function () {}
			});
		},
		onDeleteToken: function (oEvent) {
			var deleteDl = oEvent.getSource().getProperty("text");
			var isModel = this._oCreateDialog.getModel('list');
			var obj = this._oCreateDialog.getModel('list').getData();
			for (var x in obj) {
				if (obj[x].DlName === deleteDl) {
					obj.splice(x, 1);
				}
			}
			this._oCreateDialog.getModel('list').setData(obj);
			isModel.refresh();
			if (obj.length === 0) {
				var oFrgModel = this._oCreateDialog.getModel('admin');
				var oFrgData = oFrgModel.getData();
				oFrgData.Lead = false;
				oFrgModel.setData(oFrgData);
				oFrgModel.refresh(true);
			}
		},
		onDeleteToken_update: function (oEvent) {
			var deleteDl = oEvent.getSource().getProperty("text");
			var isModel = this._oUpdateDialog.getModel('list');
			var obj = this._oUpdateDialog.getModel('list').getData();
			for (var x in obj.results) {
				if (obj.results[x].Dl === deleteDl) {
					obj.results.splice(x, 1);
				}
			}
			this._oUpdateDialog.getModel('list').setData(obj);
			isModel.refresh();
			if (obj.results.length === 0) {
				var oFrgModel = this._oUpdateDialog.getModel('update_admin');
				var oFrgData = oFrgModel.getData();
				oFrgData.Islead = false;
				oFrgModel.setData(oFrgData);
				oFrgModel.refresh(true);
			}
		},
		createAdmin: function (oEvent) {
			var that = this;
			var aData = this._oCreateDialog.getModel('admin').getData();
			if (aData.Name.length !== 0 && (aData.ToolAdmin || aData.Lead)) {
				var oEntry = {
					Uname: aData.Name,
					Name: "",
					Istoolie: aData.ToolAdmin,
					Islead: aData.Lead
				};
				this.oModel.create("/AdminHdrSet", oEntry, {
					success: function (oData) {
						MessageToast.show("record successfully created");
						sap.ui.getCore().getModel('roles').oData.LEAD = 'true';
					},
					error: function () {},
					async: false
				});
				var batchChanges = [];
				try {
					var aDlList = this._oCreateDialog.getModel('list').getData();
				} catch (e) {
					aDlList = [];
				}
				if (aDlList.length > 0) {
					for (var x in aDlList) {
						var oDlEntry = {
							Uname: oEntry.Uname,
							Slno: " ",
							Dl: aDlList[x].DlName
						};
						batchChanges.push(this.oModel.createBatchOperation("AdminDlSet", "POST", oDlEntry));
						this.oModel.addBatchChangeOperations(batchChanges);
					}
					this.oModel.submitBatch(function () {
						sap.m.MessageBox.information("Saved Successfully");
						that.onRefreshAdmin();
						that._oCreateDialog.close();
					});
				} else {
					this.onRefreshAdmin();
					this.closeCreateDialog();
				}

			} else {
				MessageToast.show("Name is Mandatory. Admin should atleast be Tool Admin or Lead");
			}

		},
		ShowDls: function (oEvent) {
			var that = this;
			if (!this._oDlListDialog) {
				this._oDlListDialog = new sap.ui.xmlfragment("asaod.ASAOD.fragment.DlList", this);
				this.getView().addDependent(this._oCreateDialog);
			}
			var oKey = this.getView().getModel("hdr").getProperty(oEvent.getSource().getParent().getBindingContextPath("hdr")).Uname;
			var aFilters = [];
			var oFilters = new sap.ui.model.Filter("Uname", sap.ui.model.FilterOperator.EQ, oKey);
			aFilters.push(oFilters);
			this.oModel.read("/AdminDlSet", {
				filters: aFilters,
				success: function (oData) {
					var oDlList = new JSONModel();
					oDlList.setData(oData);
					that._oDlListDialog.setModel(oDlList, 'dllist');
				},
				error: function () {}
			});

			this._oDlListDialog.open();

		},
		closeDlListDialog: function (oEvent) {
			this._oDlListDialog.close();
		},
		selectToUpdateRow: function (oEvent) {
			this.getView().addDependent(this._oDlListDialog);
			var path = oEvent.getSource().getBindingContextPath();
			var oEntry = this.getView().getModel("hdr").getProperty(path);
			oEntry = {
				Islead: JSON.parse(oEntry.Islead),
				Istoolie: JSON.parse(oEntry.Istoolie),
				Name: oEntry.Name,
				Uname: oEntry.Uname
			};
			var oUpdateJson = new JSONModel(oEntry);
			var oDlList = new JSONModel();
			if (!this._oUpdateDialog) {
				this._oUpdateDialog = new sap.ui.xmlfragment("asaod.ASAOD.fragment.updateRow", this);
				this.getView().addDependent(this._oUpdateDialog);
				this.oModel.read("/AresDlSet", {
					success: function (oData) {
						oDlList.setData(oData);
					},
					error: function () {},
					async: false
				});
				this.getView().setModel(oDlList, 'DlList');
			}
			this._oUpdateDialog.setModel(oUpdateJson, 'update_admin');
			this._oUpdateDialog.open();

			var that = this;
			var oKey = this.getView().getModel("hdr").getProperty(oEvent.getSource().getBindingContextPath("hdr")).Uname;
			var aFilters = [];
			var oFilters = new sap.ui.model.Filter("Uname", sap.ui.model.FilterOperator.EQ, oKey);
			aFilters.push(oFilters);
			this.oModel.read("/AdminDlSet", {
				filters: aFilters,
				success: function (oData) {
					var oMyDlList = new JSONModel();
					oMyDlList.setData(oData);
					that._oUpdateDialog.setModel(oMyDlList, 'list');
				},
				error: function () {}
			});

		},
		closeUpdateDialog: function () {
			this._oUpdateDialog.close();
		},
		updateAdminRow: function (oEvent) {
			var aData = this._oUpdateDialog.getModel('list').getData().results;
			var oFragModel = this._oUpdateDialog.getModel('update_admin');
			var aFragData = oFragModel.getData();
			var that = this;
			var oParam = {
				Uname: aFragData.Uname,
				Name: "",
				Istoolie: aFragData.Istoolie,
				Islead: aFragData.Islead
			};
			var sPath = "/AdminHdrSet('" + aFragData.Uname + "')";
			this.oModel.update(sPath, oParam, {
				success: function (oData) {
					sap.m.MessageBox.information("updated successfully");
					that.onRefreshAdmin();
					that._oUpdateDialog.close();
				},
				error: function () {}
			});

			var batchChanges = [];
			for (var x in aData) {
				var oEntry = {
					Uname: aFragData.Uname,
					Slno: " ",
					Dl: aData[x].Dl
				};

				batchChanges.push(this.oModel.createBatchOperation("AdminDlSet", "POST", oEntry));
				this.oModel.addBatchChangeOperations(batchChanges);
			}
			this.oModel.submitBatch(function () {
				sap.m.MessageBox.information("Saved Successfully");
				that.onRefreshAdmin();
				that._oUpdateDialog.close();
			});

		}

	});
});
