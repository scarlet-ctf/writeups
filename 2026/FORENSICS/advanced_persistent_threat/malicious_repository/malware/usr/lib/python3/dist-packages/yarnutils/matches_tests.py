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


import unittest

import yarnutils


class GetNextMatchTests(unittest.TestCase):

    def test_raises_error_if_no_matches(self):
        yarnutils.set_env_for_matches({})
        with self.assertRaises(Exception):
            yarnutils.get_next_match()

    def test_returns_first_match(self):
        yarnutils.set_env_for_matches({
            'MATCH_1': 'foo',
        })
        self.assertEqual(yarnutils.get_next_match(), 'foo')

    def test_returns_first_two_matches(self):
        yarnutils.set_env_for_matches({
            'MATCH_1': 'foo',
            'MATCH_2': 'bar',
        })
        self.assertEqual(yarnutils.get_next_match(), 'foo')
        self.assertEqual(yarnutils.get_next_match(), 'bar')

    def test_raises_error_after_last_match(self):
        yarnutils.set_env_for_matches({})
        yarnutils.set_env_for_matches({
            'MATCH_1': 'foo',
            'MATCH_2': 'bar',
        })
        yarnutils.get_next_match()
        yarnutils.get_next_match()
        with self.assertRaises(Exception):
            yarnutils.get_next_match()
