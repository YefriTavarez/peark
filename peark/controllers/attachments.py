# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals


import frappe

from frappe import local
from frappe.handler import is_whitelisted

from frappe import _ as translate
from frappe.utils import cint


@frappe.whitelist(allow_guest=True)
def upload_file():
    if frappe.session.user == 'Guest':
        if frappe.get_system_settings('allow_guests_to_upload_files'):
            ignore_permissions = True
        else:
            return
    else:
        ignore_permissions = False

    files = frappe.request.files
    is_private = frappe.form_dict.is_private
    doctype = frappe.form_dict.doctype
    docname = frappe.form_dict.docname
    fieldname = frappe.form_dict.fieldname
    file_url = frappe.form_dict.file_url
    method = frappe.form_dict.method

    folder = frappe.form_dict.folder or 'Home'

    # if doctype == "Project Center":
    #     folder = "Home/Attachments/Proyectos"

    attachment_type = frappe.form_dict.attachment_type

    if not attachment_type:
        attachment_type = "404"

    content = None
    filename = None

    if 'file' in files:
        file = files['file']
        content = file.stream.read()
        filename = file.filename

    filename = get_filename(filename, attachment_type, doctype, docname)

    local.uploaded_file = content
    local.uploaded_filename = filename

    if frappe.session.user == 'Guest':
        import mimetypes
        filetype = mimetypes.guess_type(filename)[0]
        if filetype not in ['image/png', 'image/jpeg', 'application/pdf']:
            frappe.throw("You can only upload JPG, PNG or PDF files.")

    if method:
        method = frappe.get_attr(method)
        is_whitelisted(method)
        return method()
    else:
        ret = frappe.get_doc({
            "doctype": "File",
            "attached_to_doctype": doctype,
            "attached_to_name": docname,
            "attached_to_field": fieldname,
            "folder": folder,
            "file_name": filename,
            "file_url": file_url,
            "is_private": cint(is_private),
            "content": content
        })
        ret.save(ignore_permissions=ignore_permissions)
        return ret


def get_filename(filename, attachment_type, doctype, docname):
    attachment_opts = get_attachment_opts(attachment_type)
    prefix = attachment_opts.prefix

    extension = get_extension(filename)

    common_name_part = "{prefix}-{name}" \
        .format(prefix=prefix, name=docname)

    current_count = get_current_count(common_name_part, doctype, docname)

    if cint(attachment_opts.limit):
        # validate attachment limits
        errmsg = translate("Attachment limit exceeded "
                           "for Attachment Type of: {0}")

        if current_count >= attachment_opts.limit:
            frappe.throw(errmsg.format(attachment_type))

        if cint(attachment_opts.limit) == 1:
            return "{prefix}-{name}.{extension}" \
                .format(prefix=prefix, name=docname, extension=extension)

    version = "{next_version}" \
        .format(next_version=cint(current_count) + 1)

    return "{prefix}-{name}-{version}.{extension}" \
        .format(prefix=prefix, name=docname,
                extension=extension, version=version)


def get_attachment_opts(name):
    doctype = "Attachment Type"

    return frappe.get_doc(doctype, name)


def get_extension(filename):
    if not filename:
        return "pdf"

    parts = filename.split(".")

    extension = parts[-1]

    if not extension:
        extension = "pdf"

    return extension


def get_current_count(prefix, attached_to_doctype, attached_to_name):
    doctype = "File"
    filters = {
        "attached_to_doctype": attached_to_doctype,
        "attached_to_name": attached_to_name,
        "file_name": ["like", "{0}%".format(prefix)],
    }

    fieldname = "Count(1) As current_count"

    return frappe.get_value(doctype, filters, fieldname)
