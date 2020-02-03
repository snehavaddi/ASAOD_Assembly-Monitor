sap.ui.define([
	"asaod/ASAOD/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	'sap/ui/model/Filter',
	"asaod/ASAOD/formatter/formatter",
	"sap/m/MessageToast"
], function (BaseController, JSONModel, Filter, formatter, MessageToast) {
	"use strict";

	return BaseController.extend("asaod.ASAOD.controller.Home", {
		formatter: formatter,
		onInit: function () {
			this.oModel = this.getOwnerComponent().getModel();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oHomeModel = new JSONModel({
				comp: "",
				compRel: "",
				splevel: "",
				release: false,
				visible: "search",
				alignItems: "Center",
				height: "85%",
				topBar: true,
				showButton: false,
				hideButton: false
			});
			this.getView().setModel(oHomeModel, "home");
			var oCompModel = new JSONModel();
			this.oModel.read("/ComponentSet", {
				success: function (oData) {
					oCompModel.setData(oData);
				},
				error: function () {
					//handle error case 
				},
				async: false
			});
			this.getView().setModel(oCompModel, "comp");
			oRouter.getRoute("RouteHome").attachPatternMatched(this._onObjectMatched, this);
			this.byId("openMenu").attachBrowserEvent("tab keyup", function (oEvent) {
				this._bKeyboard = oEvent.type === "keyup";
			}, this);
		},
		_onObjectMatched: function () {
			var oRoleModel = this.getOwnerComponent().getModel("roles");
			this.getView().setModel(oRoleModel, "roles");
			var oEntry = this._setVisibilityParams();
			var oHome = this.getView().getModel("home");
			oHome.getData().topBar = oEntry.topBar;
			oHome.getData().showButton = oEntry.showButton;
			oHome.getData().hideButton = oEntry.hideButton;
			oHome.refresh(true);
			switch (oHome.getData().visible) {
			case "search":
				this.onPressSearch();
				break;
			case "personal":
				this.onPressPersonal();
				break;
			case "team":
				this.onPressTeam();
				break;
			case "fav":
				this.onPressFav();
				break;
			default:
				this.onPressSearch();
			}
		},
		_setVisibilityParams: function () {
			var aData = this.getView().getModel("device").getData();
			var oEntry = {
				topBar: true,
				showButton: false,
				hideButton: false
			};
			if (aData.system.phone) {
				oEntry = {
					topBar: false,
					showButton: true,
					hideButton: false
				};
			}
			return oEntry;
		},
		onToggleNav: function () {
			var oModel = this.getView().getModel("home");
			var aData = oModel.getData();
			aData.topBar = !aData.topBar;
			aData.showButton = !aData.showButton;
			aData.hideButton = !aData.hideButton;
			oModel.setData(aData);
			oModel.refresh(true);
		},
		_onHideNav: function () {
			if (this.getView().getModel("device").getData().system.phone) {
				var oModel = this.getView().getModel("home");
				var aData = oModel.getData();
				aData.topBar = false;
				aData.showButton = true;
				aData.hideButton = false;
				oModel.setData(aData);
				oModel.refresh(true);
			}
		},
		_onPressTopBar: function (pValue, pAlign, pHeight) {
			var oModel = this.getView().getModel("home");
			oModel.getData().visible = pValue;
			oModel.getData().alignItems = pAlign;
			oModel.getData().height = pHeight;
			oModel.refresh(true);
		},
		onPressSearch: function () {
			this._onPressTopBar("search", "Center", "85%");
			this._onHideNav();
		},
		onPressPersonal: function () {
			this._onPressTopBar("personal", "Start", "auto");
			this._getProjectsByFilter("P");
			this._onHideNav();
		},
		onPressTeam: function () {
			this._onPressTopBar("team", "Start", "auto");
			this._getProjectsByFilter("T");
			this._onHideNav();

		},
		onPressFav: function () {
			this._onPressTopBar("fav", "Start", "auto");
			this._getProjectsByFilter("F");
			// var that = this;
			/*			this.oModel.read("/addToFavSet",{
							success: function(oData){
								var oFavModel = new JSONModel();
								oFavModel.setData(oData);
								that.getView().setModel(oFavModel, 'favs');
							},
							error: function(){
								
							}
						});*/
			this._onHideNav();
		},
		/* P : Personal , T : Team , F : Favorites */
		_getProjectsByFilter: function (pType) {
			var that = this;
			var oProjectModel = new JSONModel();
			var aFilters = [],
				oFilter;
			if (pType === "P") {
				aFilters = [];
			} else if (pType === "T") {
				var sUname = this.getOwnerComponent().getModel("usermodel").getData().name;
				oFilter = new Filter("Owner", sap.ui.model.FilterOperator.EQ, sUname);
				aFilters.push(oFilter);
			} else if (pType === "F") {
				var dispname = this.getOwnerComponent().getModel("usermodel").getData().displayName;
				oFilter = new Filter("Name", sap.ui.model.FilterOperator.EQ, dispname);
				aFilters.push(oFilter);
			}
			this.oModel.read("/ProjectSet", {
				filters: aFilters,
				success: function (oData) {
				var oData1 = [];
					for (var i = 0; i < oData.results.length; i++) {
						if (oData.results[i].Status !== "8888" || oData.results[i].Status !== "9999") {
							oData1.push(oData.results[i]);
						}
					}
					oData1.results = oData1;
					oProjectModel.setData(oData1);
					that._getUniqueOwnerList(oData);
					
				},
				error: function () {
					sap.m.MessageBox.error("Backend Call Failed, Please try again.If error persists, contact Developer");
				},
				//this.getView().setModel(oProjectModel1, 'projectList');

				async: false
			});
			this.getView().setModel(oProjectModel, "prj");
			this.byId("idFacetFilter").fireReset();
		},
		_getUniqueOwnerList: function (oData) {
			var data = oData.results;

			function removeDuplicates(originalArray, prop) {
				var newArray = [];
				var lookupObject = {};
				for (var i in originalArray) {
					lookupObject[originalArray[i][prop]] = originalArray[i];
				}
				for (i in lookupObject) {
					newArray.push(lookupObject[i]);
				}
				return newArray;
			}
			var uniqueNames = removeDuplicates(data, "Owner");
			var oNames = new JSONModel(uniqueNames);
			this.getView().setModel(oNames, "name");
		},
		onShowProgress: function (oEvent) {
			var aFilters = [];
			var aData = this.getView().getModel("home").getData();
			var bSelected = this._validateProjectForm(aData);
			if (bSelected) {
				var that = this;
				var sSpLevel = "";
				var oFilter = new Filter("GroupId", sap.ui.model.FilterOperator.EQ, aData.comp);
				aFilters.push(oFilter);
				oFilter = new Filter("GroupRel", sap.ui.model.FilterOperator.EQ, aData.compRel);
				aFilters.push(oFilter);
				sSpLevel = aData.splevel;
				if (aData.release) {
					sSpLevel = "REL";
				}
				oFilter = new Filter("ScenarioId", sap.ui.model.FilterOperator.EQ, sSpLevel);
				aFilters.push(oFilter);
				this.oModel.read("/group_projSet", {
					filters: aFilters,
					success: function (oData) {
						if (oData.results[0].ProjgrpId.length > 0) {
							var sProject = oData.results[0].ProjgrpId;
							that._getProgress(sProject);
						} else {
							MessageToast.show("No Projects Found!!");
						}
					},
					error: function (oData) {
						MessageToast.show("No Projects Found!!");
					}
				});

			} else {
				MessageToast.show("Please fill all the fields.");
			}
		},

		_getProgress: function (sProjectID) {
			var aData = this.getView().getModel("home").getData();
			var bSuccess = false;
			var oFilter = new Filter("ProjectId", sap.ui.model.FilterOperator.EQ, sProjectID);
			this.oModel.read("/ProjectPhaseSet", {
				filters: [oFilter],
				success: function (oData) {
					aData.lanes = [];
					aData.nodes = [];
					for (var i = 0; i < oData.results.length; i++) {
						var sIcon, aRow, sText = "";
						aRow = oData.results[i];
						var iSuccess = (aRow.Success / aRow.TotalItems) * 100;
						var iFail = (aRow.Fail / aRow.TotalItems) * 100;
						var iPlanned = (aRow.YetToStart / aRow.TotalItems) * 100;
						//var iPercent = ();
						if (iSuccess === 100) {
							sIcon = "sap-icon://accept";
							sText = "Complete, " + parseInt(iSuccess) + "% Complete";
						}
						if (iFail > 0) {
							sIcon = "sap-icon://status-error";
							sText = "Error Stop, " + parseInt(iSuccess) + "% Complete";
						}
						if (iPlanned === 100) {
							sIcon = "sap-icon://pending";
							sText = "Yet to Start, " + parseInt(iSuccess) + "% Complete";
						}
						if (aRow.CurrentPhase === "true" && iFail === 0) {
							sIcon = "sap-icon://physical-activity";
							sText = "Current Phase, " + parseInt(iSuccess) + "% Complete";

						}
						var oLane = {
							"id": i.toString(),
							"icon": sIcon,
							"position": i,
							"label": aRow.PhseShortText + " [" + sText + "]",
							"state": [{
								"state": "Positive",
								"value": iSuccess
							}, {
								"state": "Negative",
								"value": iFail
							}, {
								"state": "Neutral",
								"value": iPlanned
							}]
						};
						aData.lanes.push(oLane);
					}
					bSuccess = true;
				},
				error: function () {
					bSuccess = false;
				},
				async: false
			});
			if (bSuccess) {
				if (!this._statusDialog) {
					this._statusDialog = sap.ui.xmlfragment(
						"asaod.ASAOD.fragment.ProjectPhase",
						this
					);
					this.getView().addDependent(this._statusDialog);
				}
				this._statusDialog.setModel(new JSONModel(aData), "prj");
				this._statusDialog.open();
			} else {
				sap.m.MessageToast.show("Could not load the project status. Please try again!");
			}
		},
		onPressProject: function (oEvent) {
			var bSuccess = false;
			var sPath = oEvent.getSource().getBindingContext("prj").getPath();
			var oPrjModel = oEvent.getSource().getModel("prj");
			var aData = oPrjModel.getProperty(sPath);
			var oFilter = new Filter("ProjectId", sap.ui.model.FilterOperator.EQ, aData.ProjgrpId);
			this.oModel.read("/ProjectPhaseSet", {
				filters: [oFilter],
				success: function (oData) {
					aData.lanes = [];
					aData.nodes = [];
					for (var i = 0; i < oData.results.length; i++) {
						var sIcon, aRow, sText = "";
						aRow = oData.results[i];
						var iSuccess = (aRow.Success / aRow.TotalItems) * 100;
						var iFail = (aRow.Fail / aRow.TotalItems) * 100;
						var iPlanned = (aRow.YetToStart / aRow.TotalItems) * 100;
						//var iPercent = ();
						if (iSuccess === 100) {
							sIcon = "sap-icon://accept";
							sText = "Complete, " + parseInt(iSuccess) + "% Complete";
						}
						if (iFail > 0) {
							sIcon = "sap-icon://status-error";
							sText = "Error Stop, " + parseInt(iSuccess) + "% Complete";
						}
						if (iPlanned === 100) {
							sIcon = "sap-icon://pending";
							sText = "Yet to Start, " + parseInt(iSuccess) + "% Complete";
						}
						if (aRow.CurrentPhase === "true" && iFail === 0) {
							sIcon = "sap-icon://physical-activity";
							sText = "Current Phase, " + parseInt(iSuccess) + "% Complete";

						}
						var oLane = {
							"id": i.toString(),
							"icon": sIcon,
							"position": i,
							"label": aRow.PhseShortText + " [" + sText + "]",
							"state": [{
								"state": "Positive",
								"value": iSuccess
							}, {
								"state": "Negative",
								"value": iFail
							}, {
								"state": "Neutral",
								"value": iPlanned
							}]
						};
						aData.lanes.push(oLane);
					}
					oPrjModel.setProperty(sPath, aData);
					oPrjModel.refresh(true);
					bSuccess = true;
				},
				error: function () {
					bSuccess = false;
				},
				async: false
			});
			if (bSuccess) {
				if (!this._statusDialog) {
					this._statusDialog = sap.ui.xmlfragment(
						"asaod.ASAOD.fragment.ProjectPhase",
						this
					);
					this.getView().addDependent(this._statusDialog);
				}
				this._statusDialog.setModel(new JSONModel(aData), "prj");
				this._statusDialog.open();
			} else {
				sap.m.MessageToast.show("Could not load the project status. Please try again!");
			}
		},
		handleLoadItems: function (oControlEvent) {
			oControlEvent.getSource().getBinding("items").resume();
		},
		onSearchProjectText: function (oEvt) {
			var aFilters = [];
			var sQuery = oEvt.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("ShortText", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}
			var list = this.byId("projectList");
			var binding = list.getBinding("items");
			binding.filter(aFilters, "Application");
		},
		onSuggest: function (oEvent) {
			var value = oEvent.getParameter("suggestValue");
			var filters = [];
			if (value) {
				filters = [
					new sap.ui.model.Filter([
						new sap.ui.model.Filter("CompId", function (sText) {
							return (sText || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
						})
					], false)
				];
			}

			oEvent.getSource().getBinding("suggestionItems").filter(filters);
			oEvent.getSource().suggest();
		},
		handleValueHelp: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();

			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(
					"asaod.ASAOD.fragment.Component",
					this
				);
				this.getView().addDependent(this._valueHelpDialog);
			}

			// create a filter for the binding
			this._valueHelpDialog.getBinding("items").filter([new Filter(
				"CompId",
				sap.ui.model.FilterOperator.Contains, sInputValue
			)]);

			// open value help dialog filtered by the input value
			this._valueHelpDialog.open(sInputValue);
		},

		_handleValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"CompId",
				sap.ui.model.FilterOperator.Contains, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		_handleLiveChangeComp: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"CompId",
				sap.ui.model.FilterOperator.Contains, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},
		_handleValueHelpClose: function (evt) {
			var oHomeModel = this.getView().getModel("home");
			// var aData = oHomeModel.getData()
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				oHomeModel.getData().splevel = "";
				oHomeModel.getData().compRel = "";
				oHomeModel.getData().comp = oSelectedItem.getTitle();
				oHomeModel.refresh(true);
				this._getCompRel(oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);
		},
		_getCompRel: function (sComp) {
			var aFilters = [];
			var oCompRel = new JSONModel();
			var oFilter = new Filter("CompId", sap.ui.model.FilterOperator.EQ, sComp);
			aFilters.push(oFilter);
			this.oModel.read("/ComponentSet", {
				filters: aFilters,
				success: function (oData) {
					oCompRel.setData(oData);
				},
				error: function () {
					//handle error cases here
				}
			});
			this.getView().setModel(oCompRel, "comprel");
		},
		editProject: function () {
			this._getProject("E");
		},
		displayProject: function () {
			this._getProject("D");
		},
		_getProject: function (pMode) {
			var aFilters = [];
			var aData = this.getView().getModel("home").getData();
			var bSelected = this._validateProjectForm(aData);
			if (bSelected) {
				var that = this;
				var sSpLevel = "";
				var oFilter = new Filter("GroupId", sap.ui.model.FilterOperator.EQ, aData.comp);
				aFilters.push(oFilter);
				oFilter = new Filter("GroupRel", sap.ui.model.FilterOperator.EQ, aData.compRel);
				aFilters.push(oFilter);
				sSpLevel = aData.splevel;
				if (aData.release) {
					sSpLevel = "REL";
				}
				oFilter = new Filter("ScenarioId", sap.ui.model.FilterOperator.EQ, sSpLevel);
				aFilters.push(oFilter);
				this.oModel.read("/group_projSet", {
					filters: aFilters,
					success: function (oData) {
						if (oData.results[0].ProjgrpId.length > 0) {
							var sProject = oData.results[0].ProjgrpId;
							that._openProject(sProject, pMode);
						} else {
							MessageToast.show("No Projects Found!!");
						}
					},
					error: function (oData) {
						MessageToast.show("No Projects Found!!");
					}
				});

			} else {
				MessageToast.show("Please fill all the fields.");
			}
		},
		addToFav: function (oEvent) {
			// var oFavJsonModel = new JSONModel();
			var that = this;
			var sPath = oEvent.getSource().getBindingContext('prj').getPath();
			var projData = this.getView().getModel('prj').getProperty(sPath);
			if (projData.fav_state === false) {
				this.oModel.remove("/addToFavSet('" + projData.ProjgrpId + "')", {
					success: function () {
						//	that._getProjectsByFilter();
						that._onObjectMatched();
						MessageToast.show("Removed from Favourites");
					},
					error: function () {}
				});
			} else {
				var oEntry = {
					ProjgrpId: projData.ProjgrpId,
					GroupId: projData.GroupId,
					GroupRel: projData.GroupRel,
					ScenarioId: projData.ScenarioId,
					Status: projData.Status,
					ShortText: projData.ShortText,
					Description: projData.Description,
					Docu: projData.Docu,
					Owner: projData.Owner,
					CreateUser: projData.CreateUser,
					CreateDate: projData.CreateDate,
					CreateTime: projData.CreateTime,
					ChangeUser: projData.ChangeUser,
					ChangeDate: projData.ChangeDate,
					ChangeTime: projData.ChangeTime,
					EndUser: projData.EndUser,
					EndDate: projData.EndDate,
					EndTime: projData.EndTime,
					Name: projData.Name,
					D_Text: projData.D_Text,
					//	D_DateTime: projData.D_DateTime,
					D_Date: projData.D_DateTime,
					fav_state: projData.fav_state,
					D_State: projData.D_State
				};

				this.oModel.create("/addToFavSet", oEntry, {
					success: function () {
						that._onObjectMatched();
						//	that._getProjectsByFilter();
						MessageToast.show("Added to Favourites");
					},
					error: function () {}
				});
			}
		},
		changeProject: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContext("prj").getPath();
			var sProject = oEvent.getSource().getModel("prj").getProperty(sPath).ProjgrpId;
			this._openProject(sProject, "E");
		},
		viewProject: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContext("prj").getPath();
			var sProject = oEvent.getSource().getModel("prj").getProperty(sPath).ProjgrpId;
			this._openProject(sProject, "D");
		},
		_validateProjectForm: function (aData) {
			if (aData.release) {
				if (aData.comp.length === 0 || aData.compRel.length === 0) {
					return false;
				}
			} else {
				if (aData.comp.length === 0 || aData.compRel.length === 0 || aData.splevel.length === 0) {
					return false;
				}
			}
			return true;
		},
		_openProject: function (pProjectId, pMode) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Assembly", {
				projectId: pProjectId,
				mode: pMode
			});
		},
		onSelectRelease: function (oEvent) {
			var aFilters = [];
			var oSpLevel = new JSONModel();
			var aData = this.getView().getModel("home").getData();
			var oFilter = new Filter("CompId", sap.ui.model.FilterOperator.EQ, aData.comp);
			aFilters.push(oFilter);
			oFilter = new Filter("CompRel", sap.ui.model.FilterOperator.EQ, aData.compRel);
			aFilters.push(oFilter);
			this.oModel.read("/SPLevelSet", {
				filters: aFilters,
				success: function (oData) {
					oSpLevel.setData(oData);
				},
				error: function () {
					//handle error cases here
				}
			});
			this.getView().setModel(oSpLevel, "splevel");
		},
		handlePressOpenMenu: function (oEvent) {
			var oButton = oEvent.getSource();
			// create menu only once
			if (!this._menu) {
				this._menu = sap.ui.xmlfragment(
					"asaod.ASAOD.fragment.Menu",
					this
				);
				this.getView().addDependent(this._menu);
			}
			var eDock = sap.ui.core.Popup.Dock;
			this._menu.open(this._bKeyboard, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);
		},
		//Start of report bug/FR
		closeBug: function () {
			this.reportBugSheet.close();
		},
		submitBug: function (oEvent) {
			var aData = this.reportBugSheet.getModel("bug").getData();
			var bState = this._validateFields(aData);
			if (bState) {
				var oEntry = {
					Tool: aData.Tool,
					Priority: aData.Priority,
					Summary: aData.Summary,
					Description: aData.Description,
					IssueType: aData.IssueType,
					Component: aData.Component
				};
				var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/BRLT/ASSEMBLY_ON_DEVICE_SRV");
				oModel.create("/ReportBugSet", oEntry);
				sap.m.MessageToast.show("Developer will be informed via Mail");
				this.closeBug();
			} else {
				sap.m.MessageToast.show("All Fields are mandatory");
			}
		},
		_validateFields: function (aData) {
			if (aData.Summary.length === 0) {
				return false;
			}
			if (aData.Description.length === 0) {
				return false;
			}
			return true;
		},
		openReportBug: function () {
			if (!this.reportBugSheet) {
				this.reportBugSheet = sap.ui.xmlfragment(
					"asaod.ASAOD.fragment.ReportBug",
					this
				);
				this.getView().addDependent(this.reportBugSheet);
				var oCompModel = new sap.ui.model.json.JSONModel();
				var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/BRLT/ASSEMBLY_ON_DEVICE_SRV");
				oModel.read("/ComponentSet", {
					success: function (oData) {
						oCompModel.setData(oData);
					},
					error: function () {
						var oData = {};
						oData.results = [];
						oData.results[0] = {
							ComponentId: "72963",
							Text: "TOOLS - DASHBOARDS"
						};
						oCompModel.setData(oData);
					}
				});
				this.reportBugSheet.setModel(oCompModel, "comp");
			}
			var oBugModel = new sap.ui.model.json.JSONModel({
				Tool: "AODAS", // TO-DO : Replace your app id here>
				Priority: "3",
				Summary: "",
				Description: "",
				IssueType: "1",
				Component: "72963"
			});
			this.reportBugSheet.setModel(oBugModel, "bug");
			this.reportBugSheet.open();
		},
		handleListClose: function (oEvent) {
			// Get the Facet Filter lists and construct a (nested) filter for the binding
			var oFacetFilter = oEvent.getSource().getParent();
			this._filterModel(oFacetFilter);
		},
		_filterModel: function (oFacetFilter) {
			var mFacetFilterLists = oFacetFilter.getLists().filter(function (oList) {
				return oList.getSelectedItems().length;
			});
			if (mFacetFilterLists.length) {
				// Build the nested filter with ORs between the values of each group and
				// ANDs between each group
				var oFilter = new Filter(mFacetFilterLists.map(function (oList) {
					return new Filter(oList.getSelectedItems().map(function (oItem) {
						return new Filter(oList.getKey(), "EQ", oItem.getKey());
					}), false);
				}), true);
				this._applyFilter(oFilter);
			} else {
				this._applyFilter([]);
			}
		},
		_applyFilter: function (oFilter) {
			// Get the table (last thing in the VBox) and apply the filter
			var oTable = this.byId("projectList");
			oTable.getBinding("items").filter(oFilter);
		},
		handleFacetFilterReset: function (oEvent) {
			var oFacetFilter = sap.ui.getCore().byId(oEvent.getParameter("id"));
			var aFacetFilterLists = oFacetFilter.getLists();
			for (var i = 0; i < aFacetFilterLists.length; i++) {
				aFacetFilterLists[i].setSelectedKeys();
			}
			this._applyFilter([]);
		},
		closeHelpBox: function () {
			this._helpDialog.close();
		},
		closePhaseBox: function () {
			this._statusDialog.destroy();
			this._statusDialog = undefined;
		},
		openProjectHelp: function () {
			if (!this._cCodeDialog) {
				this._cCodeDialog = sap.ui.xmlfragment(
					"asaod.ASAOD.fragment.ProjectHelp",
					this
				);
				this.getView().addDependent(this._cCodeDialog);
			}
			this._cCodeDialog.open();
		},
		closeProjectHelp: function () {
			this._cCodeDialog.destroy();
			this._cCodeDialog = undefined;
		},
		getProjectHeader: function (oGroup) {
			return new sap.m.GroupHeaderListItem({
				title: oGroup.key,
				upperCase: false
			});

		}
	});
});