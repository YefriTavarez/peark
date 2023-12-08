import frappe


def on_submit(doc, method):
    update_project_center(doc)


def update_project_center(doc):
    doctype = "Project Center"
    project_center = frappe.get_doc(doctype, doc.project_center)

    if project_center:
        project_center.status = "In Progress"
        project_center.db_update()