# Copyright 2017  Lars Wirzenius
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
# =*= License: GPL-3+ =*=


import shutil
import tempfile
import unittest

import yarnutils


class VariablesTests(unittest.TestCase):

    def setUp(self):
        self.tempdir = tempfile.mkdtemp()

    def tearDown(self):
        shutil.rmtree(self.tempdir)

    def test_unset_variable_is_None(self):
        vars = yarnutils.Variables(self.tempdir)
        self.assertEqual(vars['foo'], None)
        self.assertEqual(vars.get('foo'), None)

    def test_get_returns_default_for_missing_variable(self):
        vars = yarnutils.Variables(self.tempdir)
        self.assertEqual(vars.get('foo', 'default'), 'default')

    def test_get_returns_value_for_variable_that_exists(self):
        vars = yarnutils.Variables(self.tempdir)
        vars['foo'] = 'value'
        self.assertEqual(vars.get('foo', 'default'), 'value')

    def test_set_value_is_persistent(self):
        vars1 = yarnutils.Variables(self.tempdir)
        vars1['foo'] = 'bar'
        vars2 = yarnutils.Variables(self.tempdir)
        self.assertEqual(vars1['foo'], vars2['foo'])
        self.assertEqual(vars2['foo'], 'bar')

    def test_saves_explicitly(self):
        vars1 = yarnutils.Variables(self.tempdir)
        vars1['foo'] = []
        vars1['foo'].append(0)
        vars1.save()
        vars2 = yarnutils.Variables(self.tempdir)
        self.assertEqual(vars1['foo'], vars2['foo'])
        self.assertEqual(vars2['foo'], [0])

    def test_appends_to_unset_key(self):
        vars = yarnutils.Variables(self.tempdir)
        vars.append('foo', 0)
        self.assertEqual(vars['foo'], [0])

    def test_append_saves(self):
        vars1 = yarnutils.Variables(self.tempdir)
        vars1.append('foo', 0)
        vars2 = yarnutils.Variables(self.tempdir)
        self.assertEqual(vars1['foo'], vars2['foo'])
        self.assertEqual(vars2['foo'], [0])

    def test_append_gives_error_if_appending_to_nonlist_value(self):
        vars = yarnutils.Variables(self.tempdir)
        vars['foo'] = 0
        with self.assertRaises(Exception):
            vars.append('foo', 0)
