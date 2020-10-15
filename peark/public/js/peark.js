frappe.provide("frappe.socketio");
jQuery.extend(frappe.socketio, {
	get_host(port) {
		if (port === void 0) port = 3000;

		var host = window.location.origin;
		if (window.dev_server) {
			var parts = host.split(":");
			// port = frappe.boot.socketio_port || port.toString() || '3000';
			port = '443';

			if (parts.length > 2) {
				host = parts[0] + ":" + parts[1];
			}
			host = host + ":" + port;
		}
		return host;
	},
});
