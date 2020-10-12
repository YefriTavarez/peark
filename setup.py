# -*- coding: utf-8 -*-
from setuptools import setup, find_packages

with open('requirements.txt') as f:
	install_requires = f.read().strip().split('\n')

# get version from __version__ variable in merpigc/__init__.py
from merpigc import __version__ as version

setup(
	name='merpigc',
	version=version,
	description='Manufacturing ERP for IGC Company',
	author='Yefri Tavarez Nolasco',
	author_email='yefritavarez@gmail.com',
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
