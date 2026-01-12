# Copyright 2013  Lars Wirzenius
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


# This is a step in a scenario: GIVEN, WHEN, THEN, etc.

class ScenarioStep(object):

    def __init__(self, what, text):
        self.what = what
        self.text = text
        self.implementation = None


# This is the scenario itself.

class Scenario(object):

    def __init__(self, name):
        self.name = name
        self.steps = []


# This is an IMPLEMENTS chunk.

class Implementation(object):

    def __init__(self, what, regexp, shell):
        self.what = what
        self.regexp = regexp
        self.shell = shell

