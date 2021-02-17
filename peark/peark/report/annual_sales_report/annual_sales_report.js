// Copyright (c) 2021, Yefri Tavarez and contributors
// For license information, please see license.txt
/* eslint-disable */

class AnnualSalesReport {

	constructor() {
		// todo
	}

	get_opts() {
		const filters = this.get_filters();

		return {
			filters,
		};
	}

	get_filters() {
		return [
			{
				"fieldtype": "Link",
				"fieldname": "company",
				"options": "Company",
				"label": __("Company"),
				"reqd": true,
				"default": frappe.boot.sysdefaults.company
			},
			{
				"fieldtype": "Select",
				"fieldname": "year",
				"label": __("Year"),
				"options": this.get_year_list(),
				"default": this.year(this.get_today()),
			},
			{
				"fieldtype": "Link",
				"fieldname": "customer_group",
				"options": "Customer Group",
				"label": __("Customer Group"),
				"hidden": true
			},
			{
				"fieldtype": "Link",
				"fieldname": "account",
				"options": "Account",
				"label": __("Account"),
				"get_query": _ => {
					const filters = {
						"account_type": "Receivable",
					};

					return { filters };
				}
			},
			{
				"fieldtype": "Check",
				"fieldname": "group_by_month",
				"label": __("Desglosar por Mes"),
			},
		];
	}

	get_year_list() {
		let year_list = new Array();
		let current_date = this.get_today();

		for (let index = 0; index < 10; index++) {
			const current_year = this.year(current_date);

			year_list.push(current_year);

			current_date = this.get_last_year(current_date);
		}

		return year_list;
	}

	year(date) {
		return date.split("-")[0];
	}

	get_last_year(date) {
		return frappe.datetime.add_months(date, -12);
	}

	get_today() {
		const { datetime } = frappe;
		return datetime.nowdate();
	}
}


const report = new AnnualSalesReport();
frappe.query_reports["Annual Sales Report"] = report.get_opts();
