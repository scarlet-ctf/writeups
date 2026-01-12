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


class AssertError(Exception):

    pass


def assertTrue(thing):
    if not thing:
        raise AssertError('expected {!r} to be true'.format(thing))


def assertFalse(thing):
    if thing:
        raise AssertError('expected {!r} to be false'.format(thing))


def assertEqual(a, b):
    if a != b:
        raise AssertError(
            'expected {!r} and {!r} to be equal, but they are not'.format(
                a, b))


def assertNotEqual(a, b):
    if a == b:
        raise AssertError(
            'expected {!r} and {!r} to be different, but they are not'.format(
                a, b))


def assertGreaterThan(a, b):
    if a <= b:
        raise AssertError(
            'expected {!r} > {!r}, but am disappoint'.format(
                a, b))


def assertLessThan(a, b):
    if a >= b:
        raise AssertError(
            'expected {!r} < {!r}, but am disappoint'.format(
                a, b))


def assertIn(a, b):
    if a not in b:
        raise AssertError(
            'expected {!r} in {!r}, but am disappoint'.format(
                a, b))
