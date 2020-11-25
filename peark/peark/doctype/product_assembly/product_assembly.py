# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez Nolasco and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
from frappe.model.document import Document

from frappe import bold
from frappe import db as database
from frappe import _ as translate
from frappe import _dict as pydict

from frappe.utils import cstr, cint
from frappe.model.naming import make_autoname

from peark.controllers.utils import gut, s_sanitize


class ProductAssembly(Document):
    def autoname(self):
        self.generate_autoname()

    def onload(self):
        self.add_product_profile_details()

    def validate(self):
        self.load_product_profile_details()
        self.clear_compound_product_fields()

        self.validate_colors()
        self.generate_hash_and_validate()

        self.validate_front_colors()  # allow_printing
        self.validate_pantone_colors()  # allow_printing

        self.validate_back_colors()  # double_sided
        self.validate_pantone_back_colors()  # double_sided

        self.validate_dimension()
        self.validate_paperboard()
        self.validate_backboard()

        self.validate_printing_feature()
        self.validate_control_feature()
        self.validate_cutting_feature()
        self.validate_gluing_feature()
        self.validate_folding_feature()
        self.validate_protection_features()
        self.validate_utils_features()
        self.validate_texture_features()
        self.validate_packing_features()

        self.update_specs()

    def update_specs(self):
        self.full_specifications = \
            self.get_full_specifications()

        self.product_options = \
            self.get_full_product_options()

        if not self.is_new():
            self.db_update()

    def generate_autoname(self):
        self.name = self.get_new_name()

    def get_new_name(self):
        serie = self.product_profile

        if len(serie.split(" ")) > 1 \
                or len(serie.split("-")) > 1:
            splitted_product_profile = gut(self.product_profile)

            serie = "-".join(splitted_product_profile)

        increment_part = ".####"

        naming_serie = "-".join((serie, increment_part))
        return make_autoname(naming_serie.upper())

    def get_item_group(self):
        lastrow = self.item_groups[-1]
        return lastrow.item_group

    def clear_compound_product_fields(self):
        if not self.is_compound_product:
            return False

        self.dimension = None
        self.paperboard = None
        self.horizontal_margin = .000
        self.vertical_margin = .000

        self.printing_feature = None
        self.control_feature = None
        self.cutting_feature = None
        self.gluing_feature = None
        self.folding_feature = None
        self.protection_features = list()
        self.utils_features = list()
        self.texture_features = list()
        self.packing_features = list()

        if not self.flags.dont_update_full_specifications:
            self.full_specifications = None

        self.product_options = None

        return True

    def load_product_profile_details(self):
        self.product_profile_doc = self.get_product_profile_details(
            throw_error=True)

    def validate_colors(self):
        validvalues = ("0", "1", "2", "3", "4")
        fields = (
            "front_colors",
            "pantone_colors",
            "back_colors",
            "pantone_back_colors",
        )

        err_msg = """
            Valor para el campo {0}
                debe estar en el rango (0-4)
        """

        for fieldname in fields:
            value = cstr(self.get(fieldname, 0))

            if value in validvalues:
                continue

            label = self.meta.get_field(fieldname) \
                .label

            translated_label = translate(label)

            frappe.throw(err_msg
                         .format(
                             bold(translated_label)
                         )
                         )

    def validate_front_colors(self):
        allow_printing = self.product_profile_doc \
            .get("allow_printing") \
            and not self.is_compound_product

        if not allow_printing:
            self.front_colors = 0

    def validate_pantone_colors(self):
        allow_printing = self.product_profile_doc \
            .get("allow_printing") \
            and not self.is_compound_product

        if not allow_printing:
            self.pantone_colors = 0

    def validate_back_colors(self):
        double_sided = self.product_profile_doc \
            .get("double_sided")  \
            and not self.is_compound_product

        if not double_sided:
            self.back_colors = 0

    def validate_pantone_back_colors(self):
        double_sided = self.product_profile_doc \
            .get("double_sided") \
            and not self.is_compound_product

        if not double_sided:
            self.pantone_back_colors = 0

    def validate_dimension(self):
        items = self.product_profile_doc.get("dimensions")
        dimensions = [d.dimension for d in items]

        if not self.dimension:
            return True

        if self.dimension in dimensions:
            return True

        err_msg = translate(
            "The selected Dimension {} is not defined in the "
            "Product Profile. Please check!")

        frappe.throw(err_msg
                     .format(
                         bold(self.dimension)
                     )
                     )

    def validate_paperboard(self):
        self.validate_field_value("paperboard", "paperboards", "paperboard")

    def validate_backboard(self):
        self.validate_field_value("backboard", "backboards", "paperboard")

    def validate_printing_feature(self):
        self.validate_field_value(
            "printing_feature", "printing_features", "product_feature")

    def validate_control_feature(self):
        self.validate_field_value(
            "control_feature", "control_features", "product_feature")

    def validate_cutting_feature(self):
        self.validate_field_value(
            "cutting_feature", "cutting_features", "product_feature")

    def validate_gluing_feature(self):
        self.validate_field_value(
            "gluing_feature", "gluing_features", "product_feature")

    def validate_folding_feature(self):
        self.validate_field_value(
            "folding_feature", "folding_features", "product_feature")

    def validate_protection_features(self):
        self.validate_field_value("protection_features", "protection_features",
                                  "product_feature", istable=True)

    def validate_utils_features(self):
        self.validate_field_value("utils_features", "utils_features",
                                  "product_feature", istable=True)

    def validate_texture_features(self):
        self.validate_field_value("texture_features", "texture_features",
                                  "product_feature", istable=True)

    def validate_packing_features(self):
        self.validate_field_value("packing_features", "packing_features",
                                  "product_feature", istable=True)

    def validate_field_value(self, fieldname, datasource,
                             childfieldname, istable=False):

        value = self.get(fieldname)

        if not value:
            return True

        items = self.product_profile_doc \
            .get(datasource, list())

        item_list = (d.get(childfieldname) for d in items)

        if istable:
            for d in self.get(fieldname):
                value = d.get(childfieldname)

                if value in item_list:
                    continue
                break
            else:
                return True
        else:
            if value in item_list:
                return True

        label = self.meta.get_field(fieldname) \
            .label

        translated_label = translate(label)

        err_msg = translate(
            "The selected {} {} is not defined in the "
            "Product Profile. Please check!")

        frappe.throw(err_msg
                     .format(translated_label,
                             bold(value)
                             )
                     )

    def generate_hash_and_validate(self):

        # don't validate for compound products
        unique_hash = self.generate_hash()

        doctype = self.doctype
        filters = {
            "unique_hash": unique_hash,
        }

        if not self.is_new():
            filters.update({
                "name": ["!=", self.name]
            })

        exists = cstr(database.exists(doctype, filters))

        url_to_form = frappe.utils.get_url_to_form(doctype, exists)

        err_msg = """
            Ya existe un Producto con las mismas especificaciones
            <br>
            <strong>{doctype}</strong>
            <a href="{url_to_form}">{name}</a>
        """

        if exists and not self.is_compound_product:
            frappe.throw(
                err_msg
                .format(doctype=translate(doctype),
                        url_to_form=url_to_form,
                        name=exists)
            )

        self.unique_hash = unique_hash

    def generate_hash(self):
        array = [
            "".join(
                gut(cstr(self.get(key))))
            for key in self.get_fields() if cstr(self.get(key))]

        pre_hash = "".join(array)

        proteccions = "".join((pre_hash,
                               self.get_protection_names()))

        textures = "".join((proteccions,
                            self.get_texture_names()))

        utilities = "".join((textures,
                             self.get_utility_names()))

        new_hash = s_sanitize(
            u"{0}".format(utilities))

        return new_hash.lower()

    def get_protection_names(self):
        items = ""

        for item in sorted([opt.product_feature for opt in self.protection_features]):
            items = "{0}{1}".format(items, "".join(gut(item)))

        return "".join(items)

    def get_texture_names(self):
        items = ""

        for item in sorted([opt.product_feature for opt in self.texture_features]):
            items = "{0}{1}".format(items, "".join(gut(item)))

        return items

    def get_packing_names(self):
        items = ""

        for item in sorted([opt.product_feature for opt in self.packing_features]):
            items = "{0}{1}".format(items, "".join(gut(item)))

        return items

    def get_utility_names(self):
        items = ""

        for item in sorted([opt.product_feature for opt in self.utils_features]):
            items = "{0}{1}".format(items, "".join(gut(item)))

        return items

    def add_product_profile_details(self):
        product_profile_doc = self.get_product_profile_details()
        self.set_onload("product_profile_doc", product_profile_doc)

    def get_product_profile_details(self, throw_error=False):
        if not self.product_profile:
            if throw_error:
                err_msg = translate(
                    "Product Profile reference must be specified")

                frappe.throw(err_msg)

            self.set_onload("product_profile_doc", {})

            return False

        doctype = self.meta.get_field("product_profile") \
            .options

        docname = self.product_profile

        product_profile_doc = frappe.get_doc(doctype, docname)

        return product_profile_doc

    def get_compound_product(self, throw_error=True):
        if not self.is_compound_product:
            if throw_error:
                err_msg = translate(
                    "Product Assembly must be a marked as Compound Product")

                frappe.throw(err_msg)

            return False

        doctype = "Compound Product"
        filters = {
            "product_profile": self.product_profile,
            "product_assembly": self.name,
        }

        if not database.exists(doctype, filters):
            err_msg = translate(
                "A Compound Product linked to this "
                "Product Assembly does not exist")

            frappe.throw(err_msg)

        return frappe.get_doc(doctype, filters)

    def get_full_product_options(self, dont_generate=False):
        if dont_generate:
            return self.full_specifications

        if not self.is_compound_product:
            return self.get_product_options()

        if self.is_new():
            return ""

        compound_product = self.get_compound_product()

        specs = list()

        for part in compound_product.parts:
            doctype = part.meta.get_field("product_assembly") \
                .options

            name = part.product_assembly

            product_assembly = frappe.get_doc(doctype, name)

            opts = product_assembly.get_product_options()

            specs.append(opts)

        return ", ".join(value for value in specs if value)

    def get_full_specifications(self, dont_generate=False):
        if dont_generate:
            return self.product_options

        if not self.is_compound_product:
            return self.get_full_name()

        if self.is_new():
            return ""

        compound_product = self.get_compound_product()

        template = "templates/product_specifications_template.html"

        specs = list()

        for part in compound_product.parts:
            spec = pydict()

            if part.part_name:
                spec.part_name = part.part_name

            spec.qty = part.qty
            spec.description = part.product_specification

            specs.append(spec)

        opts = {
            "product_profile": self.product_profile,
            "specs": specs,
        }

        return frappe.render_template(template, opts)

    def get_full_name(self):
        values = (
            self.product_profile,
            self.paperboard,
            self.dimension,
            self.get_front_colors(),
            self.get_pantone_colors(),
            self.get_back_colors(),
            self.get_pantone_back_colors(),
            self.control_feature,
            self.get_textures(),
            self.get_protections(),
            self.cutting_feature,
            self.folding_feature,
            self.gluing_feature,
            self.get_utilities(),
            "."  # final dot
        )

        return ", ".join([value for value in values if value])

    def get_product_options(self):
        values = (
            self.printing_feature,
            self.control_feature,
            self.get_textures(),
            self.get_protections(),
            self.cutting_feature,
            self.folding_feature,
            self.gluing_feature,
            self.get_utilities(),
            # self.get_packing(),
        )

        return ", ".join([value for value in values if value])

    def get_front_colors(self):
        value = cint(self.front_colors)

        formatted_value = "{value} Color Proceso Tiro" \
            .format(value=value)

        if value > 1:
            formatted_value = "{value} Colores Proceso Tiro" \
                .format(value=value)

        if value == 4:
            formatted_value = "Full Color Tiro"

        if not value:
            formatted_value = None

        return formatted_value

    def get_pantone_colors(self):
        value = cint(self.pantone_colors)

        formatted_value = "{value} Color Pantone Tiro" \
            .format(value=value)

        if value > 1:
            formatted_value = "{value} Colores Pantone Tiro" \
                .format(value=value)

        # if value == 4:
        #     formatted_value = "Full Pantone Tiro"

        if not value:
            formatted_value = None

        return formatted_value

    def get_back_colors(self):
        value = cint(self.back_colors)

        formatted_value = "{value} Color Proceso Retiro" \
            .format(value=value)

        if value > 1:
            formatted_value = "{value} Colores Proceso Retiro" \
                .format(value=value)

        if value == 4:
            formatted_value = "Full Color Retiro"

        if not value:
            formatted_value = None

        return formatted_value

    def get_pantone_back_colors(self):
        value = cint(self.pantone_back_colors)

        formatted_value = "{value} Color Pantone Retiro" \
            .format(value=value)

        if value > 1:
            formatted_value = "{value} Colores Pantone Retiro" \
                .format(value=value)

        # if value == 4:
        #     formatted_value = "Full Pantone Retiro"

        if not value:
            formatted_value = None

        return formatted_value

    def get_protections(self):
        values = (d.product_feature for d in self.protection_features)
        return ", ".join([value for value in values if value])

    def get_utilities(self):
        values = (d.product_feature for d in self.utils_features)
        return ", ".join([value for value in values if value])

    def get_textures(self):
        values = (d.product_feature for d in self.texture_features)
        return ", ".join([value for value in values if value])

    def get_packing(self):
        values = (d.product_feature for d in self.packing_features)
        return ", ".join([value for value in values if value])

    def get_fields(self):
        return [
            "dimension",
            "paperboard",
            "front_colors",
            "pantone_colors",
            "back_colors",
            "pantone_back_colors",
            "printing_feature",
            "control_feature",
            "cutting_feature",
            "gluing_feature",
            "folding_feature",
            # "protection_features",
            # "utils_features",
            # "texture_features",
            # "packing_features",
        ]

    product_profile = None
    dimension = None
    horizontal_margin = 0
    vertical_margin = 0
    enabled = True
    is_compound_product = False
    paperboard = None
    item_groups = list()
    front_colors = 0
    pantone_colors = 0
    back_colors = 0
    pantone_back_colors = 0
    printing_feature = None
    control_feature = None
    cutting_feature = None
    gluing_feature = None
    folding_feature = None
    protection_features = list()
    utils_features = list()
    texture_features = list()
    packing_features = list()
    unique_hash = None
    full_specifications = None
    product_options = None
