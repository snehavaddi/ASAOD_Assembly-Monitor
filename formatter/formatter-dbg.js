sap.ui.define([], function () {
	"use strict";
	return {
		toBoolean: function (sValue) {
			if (sValue === "true") {
				return true;
			}
			return false;
		},
		Complete: function (s1, s2) {
			var x = s2 / s1;
			x = x * 100;
			return x;
		},
		State: function (s1, s2, s3) {
			if (s3 > 0) {
				return "Error";
			} else {
				if (s1 === s2) {
					return "Success";
				} else {
					return "Warning";
				}
			}
		},
		ProjectStatus: function (status) {
			var val;
			switch (status) {
			case "0000": 
				val = "Finished";
				break;
			case "0002": 
				val = "Manually set to finished";
				break;
			case "0004": 
				val = "Finished with warning";
				break;
			case "0006": 
				val = "Not processed";
				break;
			case "0007": 
				val = "Reset";
				break;
			case "0008": 
				val = "Terminated";
				break;
			case "0012": 
				val = "Aborted";
				break;
			case "0400": 
				val = "Initial";
				break;
			case "0800": 
				val = "Reset";
				break;
			case "4000": 
				val = "In process";
				break;
			case "4100": 
				val = "Waiting for return of process";
				break;
			case "8888": 
				val = "Workflow Confirmed";
				break;
			case "9999": 
				val = "Workflow aborted completely";
				break;
			}
			return val;
		},
		PhaseState: function (state) {
			if (state === "F") { //finished
				return "{imageModel>/path}/images/Green.png";
			} else if (state === "E") { //error
				return "{imageModel>/path}/images/Red.png";
			} else if (state === "N") { //error
				return "{imageModel>/path}/images/grey.png";
			} else { //in process
				return "{imageModel>/path}/images/Yellow.png";
			}
		},
		ItemStatus: function (status) {
			var val;
			switch (status) {
			case "0000": //finished
				val = "Low";
				break;
			case "0002": //manually finished
				val = "Low";
				break;
			case "8888": //workflow confirmed
				val = "Low";
				break;
			case "9999": //workflow deleted
				val = "None";
				break;
			case "0006": //skipped
				val = "None";
				break;
			case "0004": //warning
				val = "Medium";
				break;
			case "0008": //terminated
				val = "High";
				break;
			case "0012": //aborted
				val = "High";
				break;
			case "0800": //reset
				val = "None";
				break;
			case "0400": //initial
				val = "None";
				break;
			case "0007": //reset
				val = "None";
				break;
			case "4000": //in process
				val = "None";
				break;
			case "4100": //in process
				val = "None";
				break;
			}
			return val;
		},
		StatusState: function (status) {
			var val;
			switch (status) {
			case "0000": //finished
				val = "Success";
				break;
			case "0002": //manually finished
				val = "Success";
				break;
			case "8888": //workflow confirmed
				val = "Success";
				break;
			case "9999": //workflow deleted
				val = "None";
				break;
			case "0006": //skipped
				val = "None";
				break;
			case "0004": //warning
				val = "Warning";
				break;
			case "0008": //terminated
				val = "Error";
				break;
			case "0012": //aborted
				val = "Error";
				break;
			case "0800": //reset
				val = "None";
				break;
			case "0400": //initial
				val = "None";
				break;
			case "0007": //reset
				val = "None";
				break;
			case "4000": //in process
				val = "None";
				break;
			case "4100": //in process
				val = "None";
				break;
			}
			return val;
		},
		ItemStatusIcon: function (status) {
			var val;
			switch (status) {
			case "0000": //finished
				val = "sap-icon://accept";
				break;
			case "0002": //manually finished
				val = "sap-icon://complete";
				break;
			case "8888": //workflow confirmed
				val = "sap-icon://locked";
				break;
			case "9999": //workflow deleted
				val = "sap-icon://delete";
				break;
			case "0006": //skipped
				val = "sap-icon://sys-cancel-2";
				break;
			case "0004": //warning
				val = "sap-icon://status-critical";
				break;
			case "0008": //terminated
				val = "sap-icon://cancel";
				break;
			case "0012": //aborted
				val = "sap-icon://status-negative";
				break;
			case "0800": //reset
				val = "sap-icon://reset";
				break;
			case "0400": //initial
				val = "";
				break;
			case "0007": //reset
				val = "sap-icon://reset";
				break;
			case "4000": //in process
				val = "sap-icon://shipping-status";
				break;
			case "4100": //in process
				val = "sap-icon://car-rental";
				break;
			}
			return val;
		},
		EventStatusIcon: function (rc) {
			rc = rc.trim();
			if (rc === "0") {
				return "sap-icon://accept";
			} else if (rc === "4") {
				return "sap-icon://message-warning";
			} else if (rc === "8") {
				return "sap-icon://error";
			} else if (rc === "12") {
				return "sap-icon://stop";
			} else {
				return "sap-icon://question-mark";
			}
		},
		getItemHeader: function (sText, sType) {
			if (sType === 'X') {
				return sText;
			} else {
				return "[Manual] : " + sText;
			}
		},
		notifStatus: function (status) {
			if (status === "Finished") {
				return "High";
			} else if (status === "Terminated") {
				return "Low";
			} else {
				return "";
			}

		},
		resolveDate: function (sVal) {
			if (sVal !== null) {
				var x = new Date(sVal);
				return x.toDateString() + " , " + x.toLocaleTimeString() + " CET";
			}
			return "";
		}
	};
});