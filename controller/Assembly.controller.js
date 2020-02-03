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

	return BaseController.extend("asaod.ASAOD.controller.Assemby", {
		formatter: formatter,
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("Assembly").attachPatternMatched(this._onObjectMatched, this);
			this.oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/BRLT/AS_AOD_SRV");
		},
		_onObjectMatched: function (oEvent) {
			var sProjectId = oEvent.getParameter("arguments").projectId;
			var sMode = oEvent.getParameter("arguments").mode;
			this._init(sProjectId, sMode);
		},
		_init: function (sProjectId, sMode) {
			this._fetchPhase(sProjectId); //group project or single projectid
			this._checkLock(sProjectId, sMode);
		},
		handleRefresh: function (oEvent) {
			var sProjectId = this.getView().getModel().getData().results[0].ProjectId;
			this._init(sProjectId);
		},
		_checkLock: function (sProjectId, sMode) {
			var oEditModel = new sap.ui.model.json.JSONModel({
				switchState: false
			});
			this.getView().setModel(oEditModel, "edit");
			this._toggleEditMode(sProjectId, sMode);
		},
		_toggleEditMode: function (sProjectId, sMode) {
			var oEditModel = this.getView().getModel("edit");
			var aData = oEditModel.getData();
			if (sMode === "D") {
				//
			} else {
				this.oModel.read("/ProjectSet('" + sProjectId + "')/ProjectToLock", {
					success: function (oData) {
						if (oData.results.length > 0) {
							aData.switchState = false;
							var sMsg = "Project is locked by " + oData.results[0].Username;
							sap.m.MessageBox.warning(sMsg);
						} else {
							aData.switchState = true;
						}
						oEditModel.refresh(true);
					},
					error: function () {
						aData.switchState = false;
						oEditModel.refresh(true);
						sap.m.MessageBox.error("Connection Failure. Please refresh!");
					}
				});
			}
		},
		//if edit - > display , then no check
		//if display - > edit, then check if it is locked
		toggleMode: function (oEvent) {
			var sProjectId = this.getView().getModel().getData().results[0].ProjectId;
			if (oEvent.getParameter("state")) {
				this._toggleEditMode(sProjectId);
			}
		},
		_lockProject: function (sProjectId) {
			this._toggleProject(sProjectId, true);
		},
		_unlockProject: function (sProjectId) {
			this._toggleProject(sProjectId, false);
		},
		_toggleProject: function (sProjectId, bLock) {
			var sLock = "F";
			if (bLock) {
				sLock = "T";
			}
			var oEditModel = this.getView().getModel("edit");
			var aData = oEditModel.getData();
			this.oModel.read("ToggleLockSet(ProjectId='" + sProjectId + "',Lock='" + sLock + "')", {
				success: function (oData) {
					if (oData.Lock !== "X") {

						aData.switchState = false;
					} else {
						if (bLock) {
							aData.switchState = true;

						} else {
							aData.switchState = false;
						}
					}
					sap.m.MessageToast.show(oData.Message);
					oEditModel.refresh(true);
				},
				error: function () {
					aData.switchState = false;
					sap.m.MessageToast.show(oData.Message);
					oEditModel.refresh(true);
				}
			});
		},
		_fetchPhase: function (projectId) {
			var oPhaseModel = new sap.ui.model.json.JSONModel();
			var aFilters = [];
			var oFilter = new sap.ui.model.Filter("ProjectId", sap.ui.model.FilterOperator.EQ, projectId);
			aFilters.push(oFilter);
			this.oModel.read("/ProjectPhaseSet", {
				filters: aFilters,
				success: function (oData) {
					oPhaseModel.setData(oData);
				}
			});
			this.getView().setModel(oPhaseModel);
		},
		syncProject: function () {
			this._fetchPhase(this.getView().getModel().getData().results[0].ProjectId);
		},
		onExpandPhase: function (oEvent) {
			var bExpand = oEvent.getParameter("expand");
			if (bExpand) {
				var sPath = oEvent.getSource().getBindingContext().getPath();
				var sId = oEvent.getSource().getId();
				var oRow = this.getView().getModel().getProperty(sPath);
				this._fetchItems(sId, oRow.ProjectId, oRow.Phase);
			}
		},
		_fetchItems: function (sId, projectId, phase) {
			var aFilters = [];
			var oItemModel = new sap.ui.model.json.JSONModel();
			var oFilter = new sap.ui.model.Filter("Project_ID", sap.ui.model.FilterOperator.EQ, projectId);
			aFilters.push(oFilter);
			oFilter = new sap.ui.model.Filter("Phase", sap.ui.model.FilterOperator.EQ, phase);
			aFilters.push(oFilter);
			this.oModel.read("/ItemSet", {
				filters: aFilters,
				success: function (oData) {
					oItemModel.setData(oData);
				}
			});
			sap.ui.getCore().byId(sId).setModel(oItemModel, "item");
		},
		syncPhase: function (oEvent) {
			var sId = oEvent.getSource().getParent().getParent().getId();
			var sPath = oEvent.getSource().getBindingContext().getPath();
			var oRow = this.getView().getModel().getProperty(sPath);
			this._fetchItems(sId, oRow.ProjectId, oRow.Phase);
		},
		onPressAction: function (oEvent) {
			var oButton = oEvent.getSource();
			//	var sId = oEvent.getSource().getParent().getParent().getParent().getParent().getId();
			// create action sheet only once
			if (!this._actionSheet) {
				this._actionSheet = sap.ui.xmlfragment(
					"asaod.ASAOD.fragment.Action",
					this
				);
				this.getView().addDependent(this._actionSheet);
			}
			var sPath = oEvent.getSource().getBindingContext("item").getPath();
			var sParent = oEvent.getSource().getParent().getParent().getId();
			var oModel = sap.ui.getCore().byId(sParent).getModel("item");
			var aData = oModel.getProperty(sPath);
			//aData.sId = sId;
			var oDetailModel = new sap.ui.model.json.JSONModel(aData);
			var bExecute = false,
				bManualFinish = false,
				bSkip = false,
				bReset = false,
				bResetAll = false;
			if (aData.Item_Status === "0000" || aData.Item_Status === "0002" || aData.Item_Status === "0004" || aData.Item_Status === "0006") {
				bReset = true;
				bResetAll = true;
			}
			if (aData.Item_Status === "0008" || aData.Item_Status === "0012" ||
				aData.Item_Status === "0800" || aData.Item_Status === "0007") {
				bExecute = true;
				bManualFinish = true;
				bSkip = true;
			}
			if (aData.Item_Status === "0400") {
				bManualFinish = true;
				bSkip = true;
				if (aData.MW_ACTION === "X") {
					bExecute = true;
				} else {
					bExecute = false;
				}
			}
			if (aData.Item_Status === "4000" || aData.Item_Status === "4100" || aData.Item_Status === "8888" || aData.Item_Status === "9999") {
				bExecute = false;
				bManualFinish = false;
				bSkip = false;
				bReset = false;
				bResetAll = false;
				sap.m.MessageToast.show("No actions can be taken now");
			}
			aData.V_Execute = bExecute;
			aData.V_Manual = bManualFinish;
			aData.V_Skip = bSkip;
			aData.V_Reset = bReset;
			aData.V_ResetAll = bResetAll;
			this._actionSheet.setModel(oDetailModel);
			this._actionSheet.openBy(oButton);
		},
		onPressDetail: function (oEvent) {
			if (!this._detailSheet) {
				this._detailSheet = sap.ui.xmlfragment(
					"asaod.ASAOD.fragment.Detail",
					this
				);
				this.getView().addDependent(this._detailSheet);
			}
			var sPath = oEvent.getSource().getBindingContext("item").getPath();
			var sParent = oEvent.getSource().getParent().getParent().getId();
			var oModel = sap.ui.getCore().byId(sParent).getModel("item");
			var aData = oModel.getProperty(sPath);
			var oDetailModel = new sap.ui.model.json.JSONModel(aData);
			this._detailSheet.setModel(oDetailModel);
			//get Logs
			var aFilters = [];
			var oFilter = new sap.ui.model.Filter("WorkflowId", sap.ui.model.FilterOperator.EQ, aData.Project_ID);
			aFilters.push(oFilter);
			oFilter = new sap.ui.model.Filter("ItemId", sap.ui.model.FilterOperator.EQ, aData.Item_ID);
			aFilters.push(oFilter);
			var oLogModel = new sap.ui.model.json.JSONModel();
			this.oModel.read("/LogHeaderSet", {
				filters: aFilters,
				success: function (oData) {
					oLogModel.setData(oData);
				}
			});
			this._detailSheet.setModel(oLogModel, "log");
			this._detailSheet.open();
		},
		closeDetailDialog: function () {
			this._detailSheet.destroy();
			this._detailSheet = undefined;
		},
		/*
		Start of Item Events
		Odata entityset : ItemEventSet
		Input : ProjectId , ItemId, EventType ('E','F','S','R')
		*/
		onExecute: function (oEvent) {
			var aSelectedItem = oEvent.getSource().getParent().getModel().getData();
			this._startEvent(aSelectedItem, 'E');
		},
		onReset: function (oEvent) {
			var aSelectedItem = oEvent.getSource().getParent().getModel().getData();
			this._startEvent(aSelectedItem, 'RS');
		},
		onResetAll: function (oEvent) {
			var aSelectedItem = oEvent.getSource().getParent().getModel().getData();
			this._startEvent(aSelectedItem, 'RA');
		},
		onSkip: function (oEvent) {
			var aSelectedItem = oEvent.getSource().getParent().getModel().getData();
			this._startEvent(aSelectedItem, 'S');
		},
		onFinish: function (oEvent) {
			var aSelectedItem = oEvent.getSource().getParent().getModel().getData();
			this._startEvent(aSelectedItem, 'F');
		},
		runGroupProject: function (oEvent) {
			var aData = this.getView().getModel().getData().results;
			var aFilters = [];
			var that = this;
			var oFilter = new sap.ui.model.Filter("ProjectId", sap.ui.model.FilterOperator.EQ, aData[0].ProjectId);
			aFilters.push(oFilter);
			oFilter = new sap.ui.model.Filter("ItemId", sap.ui.model.FilterOperator.EQ, "");
			aFilters.push(oFilter);
			oFilter = new sap.ui.model.Filter("EventType", sap.ui.model.FilterOperator.EQ, "G");
			aFilters.push(oFilter);
			this.oModel.read("/ItemEventSet", {
				filters: aFilters,
				success: function (oData) {
					//	sap.m.MessageToast.show("Job Scheduled.");
					that._showMessage(oData.results[0].RC.trim(), oData.results[0].VAR1);
				},
				error: function () {
					sap.m.MessageToast.show("Task failed, please try again later");
				}
			});
		},
		_startEvent: function (pSelectedItem, pEventType) {
			var aFilters = [];
			var that = this;
			var sGroupProject = this.getView().getModel().getData().results[0].ProjectId;
			var oFilter = new sap.ui.model.Filter("Projectid", sap.ui.model.FilterOperator.EQ, pSelectedItem.ProjectId);
			aFilters.push(oFilter);
			oFilter = new sap.ui.model.Filter("Itemid", sap.ui.model.FilterOperator.EQ, pSelectedItem.ItemId);
			aFilters.push(oFilter);
			oFilter = new sap.ui.model.Filter("Eventtype", sap.ui.model.FilterOperator.EQ, pEventType);
			aFilters.push(oFilter);
			this.oModel.read("/ItemEventSet", {
				filters: aFilters,
				success: function (oData) {
					if (oData.results.length > 0) {
						that._showMessage(oData.results[0].Rc.trim(), oData.results[0].Var1);
						that._checkLock(pSelectedItem.ProjectId, 'E');
					} else {
						//sap.m.MessageToast.show(oData.results[0].Rc.trim(), oData.results[0].Var1);
						sap.m.MessageToast.show("Please check log of item");
					}
					that._fetchPhase(sGroupProject);
				},
				error: function () {
					sap.m.MessageToast.show("Task failed, please try again later");
				}
			});
		},
		_showMessage: function (sRc, sMessage) {
			if (sRc === "0") {
				sap.m.MessageBox.success(sMessage);
			} else if (sRc === "04") {
				sap.m.MessageBox.warning(sMessage);
			} else if (sRc === "08") {
				sap.m.MessageBox.error(sMessage);
				
			}
		},
		onLogPress: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContext("log").getPath();
			var aData = this._detailSheet.getModel("log").getProperty(sPath);
			var aFilters = [];
			var oFilter = new sap.ui.model.Filter("WorkflowId", sap.ui.model.FilterOperator.EQ, aData.WorkflowId);
			aFilters.push(oFilter);
			oFilter = new sap.ui.model.Filter("ItemId", sap.ui.model.FilterOperator.EQ, aData.ItemId);
			aFilters.push(oFilter);
			oFilter = new sap.ui.model.Filter("ItemRunId", sap.ui.model.FilterOperator.EQ, aData.ItemRunId);
			aFilters.push(oFilter);
			var oLogModel = new sap.ui.model.json.JSONModel();
			this.oModel.read("/LogSet", {
				filters: aFilters,
				success: function (oData) {
					if (oData.results.length > 0) {
						var sText = "";
						for (var i = 0; i < oData.results.length; i++) {
							sText += "\u2022 " + oData.results[i].Line + "\n";
						}
						var aText = [];
						aText.Line = sText;
						oLogModel.setData(aText);
					}
				}
			});
			if (!this._logSheet) {
				this._logSheet = sap.ui.xmlfragment(
					"asaod.ASAOD.fragment.Log",
					this
				);
				this.getView().addDependent(this._logSheet);
			}
			this._logSheet.setModel(oLogModel, "logDetails");
			this._logSheet.open();
		},
		closeLogDialog: function () {
			this._logSheet.destroy();
			this._logSheet = undefined;
		},
		openInfo: function () {
			if (!this._infoSheet) {
				this._infoSheet = sap.ui.xmlfragment("asaod.ASAOD.fragment.Legend", this);
				this.getView().addDependent(this._infoSheet);
			}
			this._infoSheet.open();
		},
		closeLegendBox: function () {
			this._infoSheet.destroy();
			this._infoSheet = undefined;
		},
		openAttributes: function (oEvent) {
			var oAttrModel = new sap.ui.model.json.JSONModel();
			var aData = this.getView().getModel().getData().results;
			var aFilters = [];
			var that = this;
			var oFilter = new sap.ui.model.Filter("ProjectId", sap.ui.model.FilterOperator.EQ, aData[0].ProjectId);
			aFilters.push(oFilter);
			if (!this._attrSheet) {
				this._attrSheet = sap.ui.xmlfragment(
					"asaod.ASAOD.fragment.Attributes",
					this
				);
				this.getView().addDependent(this._attrSheet);
			}
			this.oModel.read("/AttributesSet", {
				filters: aFilters,
				success: function (oDetails) {
					oAttrModel.setData(oDetails);
					that._attrSheet.open();
				},
				error: function () {
					sap.m.MessageToast.show("Failed to get details");
				}
			});
			this._attrSheet.setModel(oAttrModel);
		},
		closeAttributes: function () {
			this._attrSheet.close();
			this._attrSheet = undefined;
		}
	});
});