# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

from frappe.utils import flt


class RecurringProductionPlanning(Document):
    def validate(self):
        self.calculate_totals()

    def calculate_totals(self):
        self.calcular_precio_de_compra_unitario_del_material()
        self.calcular_gastos_totales_de_material()
        self.calcular_total_a_facturar_por_linea()
        self.calcular_facturacion_total()

        self.calcular_gastos_porcentuales_de_material()
        self.calcular_margen()

        self.calcular_volumen_total()

    def calcular_precio_de_compra_unitario_del_material(self):
        for d in self.detalle:
            if not d.unidades_montadas:
                d.precio_de_compra_unitario_del_material = .000
                continue

            d.precio_de_compra_unitario_del_material = \
                flt(d.precio_de_compra_del_material) \
                / flt(d.unidades_montadas)

    def calcular_gastos_totales_de_material(self):
        total = .000

        for d in self.detalle:
            total += flt(d.precio_de_compra_unitario_del_material) \
                * flt(d.volumen)

        self.gastos_de_material = total

    def calcular_gastos_porcentuales_de_material(self):
        if not flt(self.facturacion_total):
            self.gastos_porcentual_de_material = .000
            return False

        gastos_porcentual_de_material = flt(self.gastos_de_material) \
            / flt(self.facturacion_total)

        self.gastos_porcentual_de_material = gastos_porcentual_de_material \
            * 100.000

    def calcular_total_a_facturar_por_linea(self):
        for d in self.detalle:
            d.total_a_facturar = d.precio_unitario_de_venta \
                * flt(d.volumen)

    def calcular_facturacion_total(self):
        self.facturacion_total = self.get_total_a_facturar()

    def get_total_a_facturar(self):
        import functools
        return functools.reduce(lambda prev, row: flt(row.total_a_facturar) + prev,
                                self.detalle, .000)

    def calcular_margen(self):
        self.margen = flt(self.facturacion_total) \
            - flt(self.gastos_de_material)

    def calcular_volumen_total(self):
        total = .000

        for d in self.detalle:
            total += flt(d.volumen)

        self.volumen_total = total

    cliente = None
    divisa = None
    detalle = list()
    gastos_porcentual_de_material = .000
    volumen_total = .000
    gastos_de_material = .000
    facturacion_total = .000
    margen = .000
