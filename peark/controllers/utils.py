# -*- coding: utf-8 -*-
# Copyright (c) 2020, Yefri Tavarez and contributors
# For license information, please see license.txt

import re
import frappe
import hashlib

# from frappe.utils import flt, cstr, cint


def s_hash(string):
    """Hash a string with a unique value"""

    # generate the hash
    sha1_hash = hashlib.sha1(string)

    # convert to hex
    return sha1_hash.hexdigest()


def s_sanitize(value, upper=True):
    """Remove the most common special caracters from Spanish"""

    special_cars = [
        (u"á", "a"), (u"Á", "A"),
        (u"é", "e"), (u"É", "E"),
        (u"í", "i"), (u"Í", "I"),
        (u"ó́", "o"), (u"Ó", "O"),
        (u"ó", "o"), (u"Ó", "O"),
        (u"ú", "u"), (u"Ú", "U"),
        (u"ü", "u"), (u"Ü", "U"),
        (u"ñ", "n"), (u"Ñ", "N")
    ]

    # do not change the parameters
    s_sanitized = value

    for target, replacement in special_cars:
        s_sanitized = s_sanitized \
            .replace(target, replacement)

    s_sanitized = re.sub(r'[^a-zA-Z0-9\n\./,()\-]', ' ', s_sanitized)

    if upper:
        return s_sanitized.upper()

    return s_sanitized


def s_strip(value):
    """Clean and convert a string into a valid variable name"""

    # remove blank spaces
    s_word = value.replace(" ", "")

    # remove most common special caracters
    s_sanitized = s_sanitize(s_word)

    # convert to upper case
    s_upper = s_sanitized.upper()

    return s_upper


def gut(string, size=2):
    """Will gut a string into an array of the specify size like this:
        ex: gut("Empaque Plegadizo", size=2)
        will return ['Em', 'Pl']
    """
    return [word[:size]
            for part in string.split("-")
            for word in part.split()
            ]
