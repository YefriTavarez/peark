# -*- coding: utf-8 -*-
from setuptools import setup, find_packages

with open('requirements.txt') as f:
	install_requires = f.read().strip().split('\n')

# get version from __version__ variable in peark/__init__.py
from peark import __version__ as version

setup(
	name='peark',
	version=version,
	description='A totally revolutionary application specialized to the press business',
	author='Yefri Tavarez',
	author_email='yefritavarez@gmail.com',
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
