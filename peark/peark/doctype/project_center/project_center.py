# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
from frappe.model.document import Document

from frappe import db as database
from frappe import _ as translate
from frappe import get_doc, get_all

from frappe.utils import flt

from peark.controllers.task_center import update_project_center_status


class ProjectCenter(Document):
    def before_insert(self):
        self.verify_if_sales_order_or_quotation_has_items()
        self.verify_existing_sales_orders()
        self.verify_existing_quotations()

        if self.status == "Presentar arte":
            self.status = "Presentar Arte"
        elif self.status == "In Progress":
            self.status = "En Progreso"

        if self.project_center_template == get_non_manufacturing_template():
            self.status = "En Progreso"

    def onload(self):
        # self.update_projects(force=True)
        self.load_projects_reloaded()
        self.set_dashboard_data()

    def after_insert(self):
        # self.generate_projects()
        # instead, send it to a background queue
        if not self.flags.dont_auto_commit:
            frappe.db.commit()
        # frappe.enqueue_doc(self.doctype, self.name, "generate_projects")
        self.set_missing_values_on_children()
        self.create_material_request_without_bom()

    def on_update(self):
        self.set_missing_values_on_children()

    def validate(self):
        self.update_title()
        self.validate_production_qty()
        self.validate_cancelation()

    def verify_if_sales_order_or_quotation_has_items(self):
        doctype = "Sales Order" if self.sales_order else "Quotation"

        if not self.sales_order and not self.quotation:
            return

        filters = {
            "name": self.sales_order or self.quotation,
        }

        doc = frappe.get_doc(doctype, filters)

        if not doc.items:
            frappe.throw(f"La {translate(doctype)} no tiene Items")

    def verify_existing_sales_orders(self):
        if not self.sales_order:
            return

        items = self.get_items(sales_order=self.sales_order)

        if not items:
            return

        if self.item_code not in [item.get("item_code") for item in items]:
            frappe.throw("Este Item no está incluido en la Orden de Venta")

        project_centers = self.get_project_centers_with_same_item(
            self.item_code,
            sales_order=self.sales_order
        )

        if project_centers:
            frappe.throw("Este Item ya está asignado a otro Centro de Proyecto con la misma Orden de Venta")

    def verify_existing_quotations(self):
        if not self.quotation:
            return

        items = self.get_items(quotation=self.quotation)

        if not items:
            return

        if self.item_code not in [item.get("item_code") for item in items]:
            frappe.throw("Este Item no está incluido en la Cotización")

        project_centers = self.get_project_centers_with_same_item(
            self.item_code, 
            quotation=self.quotation
        )

        if project_centers:
            frappe.throw("Este Item ya está asignado a otro Centro de Proyecto con la misma Cotización")

    def get_project_centers_with_same_item(self, item, sales_order=None, quotation=None):
        doctype = "Project Center"
        filters = {
            "item_code": item,
        }

        if sales_order:
            filters["sales_order"] = sales_order

        if quotation:
            filters["quotation"] = quotation

        fields = "name"

        return get_all(doctype, filters, fields)

    def get_items(self, sales_order=None, quotation=None):
        doctype = "Sales Order Item" if sales_order else "Quotation Item"
        filters = {
            "parent": sales_order or quotation,
        }

        fields = "item_code"

        return get_all(doctype, filters, fields)

    def set_dashboard_data(self):
        dashboard_data = {
            "production_order": self.get_linked_production_order(),
            "billing_percent": self.get_billing_percent(),
            "delivery_percent": self.get_delivery_percent(),
            "invoice_count": self.get_invoice_count(),
            "delivery_count": self.get_delivery_count(),
        }

        for key in dashboard_data.keys():
            self.set_onload(key, dashboard_data[key])

    def get_linked_production_order(self):
        doctype = "Work Order"
        filters = {
            "project_center": self.name
        }

        if not database.exists(doctype, filters):
            return None

        return frappe.get_value(doctype, filters)

    def get_billing_percent(self):
        filters = {
            "item_code": self.item_code,
            "project_center": self.name,
        }

        result = database.sql("""
            Select
                Sum(qty) As total_billed
            From
                `tabSales Invoice Item`
            Where
                item_code = %(item_code)s
                And project_center = %(project_center)s
                And docstatus = 1
        """, filters)

        production_qty = flt(self.production_qty)

        if not production_qty:
            return .0

        billed_qty = flt(result[0][0]) if result else .0

        if billed_qty > production_qty:
            return 100.0

        return flt(billed_qty) / flt(production_qty) * 100.0

    def get_invoice_count(self):
        filters = {
            "project_center": self.name,
        }

        result = database.sql("""
            Select
                Count(parent) As invoice_count
            From
                `tabSales Invoice Item`
            Where
                project_center = %(project_center)s
                And docstatus = 1
            Group By
                parent
        """, filters)

        return flt(result[0][0]) if result else .0

    def get_delivery_count(self):
        filters = {
            "project_center": self.name,
        }

        result = database.sql("""
            Select
                Count(name) As delivery_count
            From
                `tabDelivery Note`
            Where
                project_center = %(project_center)s
                And docstatus = 1
            Group By
                parent
        """, filters)

        return flt(result[0][0]) if result else .0

    def get_delivery_percent(self):
        filters = {
            "item_code": self.item_code,
            "project_center": self.name,
        }

        result = database.sql("""
            Select
                Sum(delivered_qty) As total_delivered
            From
                `tabSales Invoice Item`
            Where
                item_code = %(item_code)s
                And project_center = %(project_center)s
                And docstatus = 1
        """, filters)

        production_qty = flt(self.production_qty)

        if not production_qty:
            return .0

        delivered_qty = flt(result[0][0]) if result else .0

        if delivered_qty > production_qty:
            return 100.0

        return flt(delivered_qty) / flt(production_qty) * 100.0

    def load_projects_reloaded(self):
        doctype = "Project"
        filters = {
            "name": ["like", f"{self.name}%"],
        }

        projects = get_all(doctype, filters, [
                           "department", "name As project", "project_template", "status"], order_by="name Asc")

        self.projects = []

        for project in projects:
            self.append("projects", project)

        status = "Open"

        # if not projects:
        #     status = "Open"
        if self.status == "Open":
            status = "Open"
        elif self.status == "Stopped":
            status = "Stopped"
        elif self.status == "Delayed":
            status = "Delayed"
        elif self.status == "In Progress":
            status = "In Progress"
        elif self.status == "Canceled":
            status = "Canceled"
        elif self.status == "Paused":
            status = "Paused"
        elif self.status == "Completed":
            status = "Completed"
        elif all(project.status == "Completed" for project in projects):
            status = "Completed"
        else:
            if any(project.status == "Delayed" for project in projects):
                status = "Delayed"
            elif any(project.status == "Complete" for project in projects):
                status = "Partially Completed"
            else:
                status = "Open"

        if status == self.status:
            self.status = status
            self.db_set("status", status, update_modified=False)

    def update_projects(self, autocommit=True, force=False):
        if not force:
            return False

        status_list = list()

        def update_child_project(project):
            doctype = "Project"
            name = project.project

            fieldname = "status"

            value = frappe.get_value(doctype, name, fieldname)

            if value != project.status:
                project.set(fieldname, value)
                project.db_update()

            return project.status

        # remember project center status
        prev_status = self.status

        for project in self.projects:
            status = update_child_project(project=project)

            status_list.append(status)

        # just a bit of config
        status_change_comment = translate("Set to {}")

        # if not status_list:
        #     self.status = "Open"
        if prev_status == "Open":
            self.status = "Open"
        elif prev_status == "In Progress":
            self.status = "In Progress"
        elif prev_status == "Stopped":
            self.status = "Stopped"
        elif prev_status == "Canceled":
            self.status = "Canceled"    
        elif all(status == "Completed" for status in status_list):
            self.status = "Completed"
        else:
            if "Delayed" in status_list:
                self.status = "Delayed"
            else:
                self.status = "Open"

        if prev_status != self.status:
            comment = status_change_comment \
                .format(self.status)

            self.add_comment("Edit", comment)

            self.db_update()

        if autocommit:
            frappe.db.commit()

    def set_missing_values_on_children(self):
        projects = self.get_projects()

        for d in projects:
            d.update_missing_values()

    def get_projects(self):
        doctype = "Projects"

        filters = {
            "parent": self.name,
            "parenttype": "Project Center",
            "parentfield": "projects",
        }

        fields = "name"

        doclist = get_all(doctype, filters, fields, as_list=True)

        return [get_doc(doctype, name) for name, in doclist]

    def validate_production_qty(self):
        if flt(self.production_qty):
            return True

        errmsg = translate("Missing Fields")
        field = translate("Production Qty")

        frappe.throw("{}: {}".format(errmsg, field))

    def validate_cancelation(self):
        if self.status == "Cancelado":
            query = f"""
                Select
                    name
                From
                    `tabWork Order`
                Where
                    project_center = '{self.name}'
                    And docstatus = 1
            """

            work_order = database.sql(query)

            if work_order:
                frappe.throw("No se puede cancelar un proyecto con ordenes de trabajo validadas")
    
    def create_material_request_without_bom(self):
        if self.project_center_template == get_non_manufacturing_template():
            self.make_material_request(self.sales_order)
            # self.status = "In Progress"
    
    def make_material_request(self, sales_order):
        doctype = "Material Request"

        branch = get_branch()
        warehouse = None
        cost_center = None
        
        if branch == "Santo Domingo":
            warehouse = "Productos terminados - L"
            cost_center = "100 - Santo Domingo - L"
        
        if branch == "Santiago":
            warehouse = "Productos terminados Santiago - L"
            cost_center = "200 - Santiago - L"

        doc = frappe.new_doc(doctype)
        doc.update({
            "material_request_type": "Material Transfer",
            "required_date": self.delivery_date,
        })
        doc.append("items", {
            "cost_center": cost_center,
            "item_code": self.item_code,
            "qty": self.production_qty,
            "required_date": self.delivery_date,
            "warehouse": warehouse,
            "sales_order": sales_order,
            "project_center": self.name,
        })
        doc.submit()

    def update_title(self):
        title = ""

        if self.get("project_type"):
            title = "{}: {}".format(self.project_type, title)

        if self.get("customer"):
            title = "{} {}".format(title, self.customer)

        if self.get("product_name"):
            title = "{} ({})".format(title, self.product_name)

        if self.get("item_specifications"):
            title = "{} {}".format(title, self.item_specifications)

        self.title = title

    def generate_projects(self):
        def set_fetch_from(doc):
            doctype = "Task"

            kwargs = {
                "filters": {
                    "project": doc.name,
                },
                "fields": "name",
                "as_list": True,
            }

            doclist = frappe.get_all(doctype, **kwargs)

            for name, in doclist:
                doc = frappe.get_doc(doctype, name)

                doc.project_title = self.title
                doc.title = "{}: {}" \
                    .format(self.name, self.title)
                # doc.department = get_department_for_task(task=doc

                # persists changes
                doc.db_update()

        def append_child(doc, template, idx):
            doctype = "Projects"
            childdoc = frappe.new_doc(doctype)

            childdoc.update({
                "project": doc.name,
                "project_title": doc.title,
                "department": template.department,
                "parent": self.name,
                "parenttype": self.doctype,
                "parentfield": "projects",
                "idx": idx,
            })

            childdoc.save(ignore_permissions=True)

        def set_missing_values(doc, template):
            doc.update({
                "expected_start_date": self.expected_start_date,
                "expected_end_date": self.expected_end_date,
                "title": self.title,
                "project_name": self.product_name or self.item_name,
                "sales_order": self.sales_order,
                "customer": self.customer,
                "project_type": self.project_type,
                "priority": self.priority,
                "department": template.department,
                "item_specifications": self.item_specifications,
            })

        def get_template():
            doctype = "Project Center Template"
            name = self.project_center_template

            errmsg = translate("Missing Fields")
            if not name:
                frappe.throw("{}: {}".format(errmsg, doctype))

            return frappe.get_doc(doctype, name)

        template = get_template()

        if self.is_new():
            self.projects = list()

        templates = template.get("templates", default=list())
        for idx, template in enumerate(templates, start=1):
            doctype = "Project"

            doc = frappe.new_doc(doctype)

            set_missing_values(doc, template)

            doc.project_template = template.project_template

            # fake field for project center
            doc.project_center = self.name

            doc.save()

            # update projects table
            set_fetch_from(doc)
            append_child(doc, template, idx)

        frappe.publish_realtime("generated_projects",
                                doctype=self.doctype, docname=self.name)

    def get_product_assembly(self):
        item_doc = self.get_item_doc()

        doctype = item_doc.ref_doctype
        name = item_doc.ref_docname

        errmsg = translate("Product Assembly not found for Item: {}")
        if not database \
                .exists(doctype, name):
            frappe.throw(errmsg.format(item_doc.name))

        return frappe.get_doc(doctype, name)

    def get_item_doc(self):
        doctype = "Item"
        name = self.item_code

        errmsg = translate("Item Code is missing")

        if not name:
            frappe.throw(errmsg)

        return frappe.get_doc(doctype, name)

    project_naming_series = None
    title = None
    project_center_template = None
    project_type = None
    status = None
    naming_series = None
    order_required = None
    customer = None
    product_name = None
    sales_order = None
    bom = None
    make = None
    model = None
    primary_color = None
    secondary_color = None
    item_code = None
    item_name = None
    item_specifications = None
    production_qty = 0
    priority = None
    expected_start_date = None
    expected_end_date = None
    actual_start_date = None
    actual_end_date = None
    projects = list()


valid_status = ("Open", "Completed")


@frappe.whitelist()
def update_subproject_status(name, status):
    from peark.controllers.task_center import get_project_center_id
    
    if status not in valid_status:
        frappe.throw(translate("Invalid Status"))

    # dealing doctype
    doctype = "Project"

    # fetching doc
    doc = frappe.get_doc(doctype, name)

    comment_template = translate("Status Updated from {} to {}")

    if doc.status != status:
        doc.add_comment("Edit", comment_template
                        .format(translate(doc.status), translate(status)))

    # updating fields
    doc.status = status

    # persists changes
    doc.db_update()

    # update project tasks
    update_project_tasks(doc, status)

    first_task = frappe.get_value("Task", {"project": doc.name})

    if first_task:
        doctype = "Project Center"
        name = get_project_center_id(first_task)
        fieldname = "status"
        db_status = frappe.get_value(doctype, name, fieldname)
        
        update_project_center_status(first_task, prev_status=db_status)
    else:
        frappe.throw(f"No Tasks found for Project: {doc.name}: {doc.project_template}")

    # returns doc
    return doc


def update_project_tasks(doc, status):
    # dealing doctype

    doctype = "Task"

    filters = {
        "project": doc.name,
        "status": ["!=", status],
    }

    fields = "name"

    doclist = get_all(doctype, filters, fields, as_list=True)

    comment_template = translate("Status Updated from {} to {}")

    for name, in doclist:
        doc = frappe.get_doc(doctype, name)

        if doc.status != status:
            doc.add_comment("Edit", comment_template
                            .format(translate(doc.status), translate(status)))

        doc.status = status

        # persists changes
        doc.db_update()


@frappe.whitelist()
def make_work_order(project_center, cost_center):
    from erpnext.manufacturing.doctype.work_order.work_order \
        import make_work_order as erpnext_make_work_order

    # dealing doctype
    doctype = "Project Center"

    doc = frappe.get_doc(doctype, project_center)

    # bom_no = BOM-PRPLENPL1248-001
    # item = PRPLENPL1248
    # qty = 1
    work_order = erpnext_make_work_order(
        doc.bom, doc.item_code, doc.production_qty)

    # add additional fields or info
    update_work_order(work_order, doc, cost_center)

    # update_project_center(doc, work_order)

    return work_order


def update_work_order(work_order, project_center, cost_center):
    for item in work_order.required_items:
        item.source_warehouse = get_user_cost_center(cost_center)

    work_order.update({
        "sales_order": project_center.sales_order,
        "delivery_date": project_center.delivery_date,
        "delivery_time": project_center.delivery_time,
        "planned_start_date": project_center.expected_start_date,
        "expected_delivery_date": project_center.expected_end_date,
        "fg_warehouse": get_finished_goods_warehouse(),
        "project_center": project_center.name,
        "make": project_center.make,
        "model": project_center.model,
        "primary_color": project_center.primary_color,
        "secondary_color": project_center.secondary_color,
    })


def get_user_cost_center(cost_center=None):

    if cost_center:
        if cost_center == "100 - Santo Domingo - L":
            return "Principal - L"
        
        if cost_center == "200 - Santiago - L":
            return "Santiago - L"


def update_project_center(project_center, work_order):
    project_center.work_orders.append({
        "work_order": work_order.name,
    })
    project_center.status = "In Progress"
    project_center.db_update()
    project_center.reload()


def get_finished_goods_warehouse():
    # We prefer something like this:
    # return frappe.db.get_single_value("Stock Settings", "finished_goods_warehouse")

    return "Productos terminados - L"


def get_default_supply_warehouse():
    # We prefer something like this:
    # return frappe.db.get_single_value("Stock Settings", "default_supply_warehouse")

    return "Principal - L"


def get_default_warehouse():
    defaults = frappe.defaults.get_defaults()

    return defaults.get("default_warehouse")


def get_branch():
    doctype = "Employee"
    filters = {
        "user_id": frappe.session.user,
    }
    fields = "branch"

    return frappe.get_value(doctype, filters, fields)


def get_non_manufacturing_template():
    doctype = "Logomarca Defaults"
    fieldname = "non_manufacturing_template"
    return frappe.db.get_single_value(doctype, fieldname)