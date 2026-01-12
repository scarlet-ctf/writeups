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


import os


_env = {}
_next_match = 1


def get_next_match():
    global _env, _next_match
    key = 'MATCH_{}'.format(_next_match)
    if key not in _env:
        raise Exception('No further matches')
    _next_match += 1
    return _env[key]


def set_env_for_matches(env):
    global _env, _next_match
    _env = env.copy()
    _next_match = 1


set_env_for_matches(os.environ)  # pragma: no cover
