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
import yaml


class Variables(object):

    _basename = 'vars.yaml'

    def __init__(self, dirname):
        self._filename = os.path.join(dirname, self._basename)
        self._dict = self._load()

    def _load(self):
        if os.path.exists(self._filename):
            with open(self._filename) as f:
                return yaml.safe_load(f)
        else:
            return {}

    def _save(self, values):
        with open(self._filename, 'w') as f:
            return yaml.safe_dump(values, stream=f)

    def __getitem__(self, key):
        return self._dict.get(key)

    def __setitem__(self, key, value):
        self._dict[key] = value
        self._save(self._dict)

    def get(self, key, default=None):
        return self._dict.get(key, default)

    def save(self):
        self._save(self._dict)

    def append(self, key, value):
        if key in self._dict:
            if not isinstance(self[key], list):
                raise Exception('Value for {} is not a list'.format(key))
        if key not in self._dict:
            self._dict[key] = []
        self._dict[key].append(value)
        self.save()
