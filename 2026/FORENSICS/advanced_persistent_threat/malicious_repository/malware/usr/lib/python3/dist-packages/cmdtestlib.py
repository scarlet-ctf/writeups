# Copyright 2011  Lars Wirzenius
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


import os


def cat(filename):
    '''Return contents of file, or empty string if it doesn't exist.'''
    if os.path.exists(filename):
        with open(filename) as f:
            return f.read()
    else:
        return ''


class TestCase(object):

    def __init__(self, name, path_prefix):
        self.name = name
        self.path_prefix = path_prefix


class TestDir(object):

    '''Contain information about a directory of test cases.'''
    
    per_test_suffixes = ('script', 'stdin', 'stdout', 'stderr', 
                         'exit', 'setup', 'teardown')
    
    def __init__(self):
        self.setup = None
        self.setup_once = None
        self.tests = []
        self.teardown = None
        self.teardown_once = None
    
    def scan(self, dirname, filenames=None):
        filenames = os.listdir(dirname) if filenames is None else filenames

        script_names = ['setup_once', 'setup', 'teardown', 'teardown_once']
        for name in script_names:
            if name in filenames:
                full_path = os.path.join(dirname, name)
                setattr(self, name, full_path)

        prefixes = self.find_prefixes(filenames)
        for prefix in prefixes:
            test = TestCase(prefix, os.path.join(dirname, prefix))
            for suffix in self.per_test_suffixes:
                name = '%s.%s' % (prefix, suffix)
                if name in filenames:
                    value = os.path.join(dirname, name)
                else:
                    value = None
                setattr(test, suffix, value)
            self.tests.append(test)
            
    def find_prefixes(self, filenames):
        prefixes = set()
        for filename in filenames:
            for suffix in self.per_test_suffixes:
                suffix = '.' + suffix
                if filename.endswith(suffix):
                    prefix = filename[:-len(suffix)]
                    prefixes.add(prefix)
        return sorted(list(prefixes))

