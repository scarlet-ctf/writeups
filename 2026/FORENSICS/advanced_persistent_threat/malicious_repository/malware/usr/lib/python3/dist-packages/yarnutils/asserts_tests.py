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


class AssertTests(unittest.TestCase):

    def test_true_and_false_work(self):
        truths = [
            True, 1, "notempty", [0], (0,), {'foo': 0},
        ]
        falsehoods = [
            None, False, 0, "", [], {},
        ]

        for thing in truths:
            yarnutils.assertTrue(thing)
            with self.assertRaises(yarnutils.AssertError):
                yarnutils.assertFalse(thing)

        for thing in falsehoods:
            yarnutils.assertFalse(thing)
            with self.assertRaises(yarnutils.AssertError):
                yarnutils.assertTrue(thing)

    def test_equal_works(self):
        yarnutils.assertEqual(0, 0)
        with self.assertRaises(yarnutils.AssertError):
            yarnutils.assertEqual("foo", None)

    def test_not_equal_works(self):
        yarnutils.assertNotEqual(0, 1)
        with self.assertRaises(yarnutils.AssertError):
            yarnutils.assertNotEqual(0, 0)

    def test_gt_works(self):
        yarnutils.assertGreaterThan(1, 0)
        with self.assertRaises(yarnutils.AssertError):
            yarnutils.assertGreaterThan(0, 1)

    def test_lt_works(self):
        yarnutils.assertLessThan(0, 1)
        with self.assertRaises(yarnutils.AssertError):
            yarnutils.assertLessThan(1, 0)

    def test_in_works(self):
        yarnutils.assertIn(0, [0])
        with self.assertRaises(yarnutils.AssertError):
            yarnutils.assertIn(0, [])
            yarnutils.assertIn(0, [1, 2, 3])
