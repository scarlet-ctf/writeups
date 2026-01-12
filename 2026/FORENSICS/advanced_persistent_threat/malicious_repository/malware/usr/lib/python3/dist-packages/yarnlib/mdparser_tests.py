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


import unittest

import yarnlib


class MarkdownParserTests(unittest.TestCase):

    def setUp(self):
        self.parser = yarnlib.MarkdownParser()

    def test_finds_code_block(self):
        result = self.parser.parse_string('''
This is blah blah text.

    this is a code block

More text.
''')
        self.assertEqual(self.parser.blocks, ['this is a code block\n'])
        self.assertEqual(result, ['this is a code block\n'])

    def test_finds_consecutive_code_blocks_as_one(self):
        self.parser.parse_string('''
This is blah blah text.

    this is a code block

    this is a second code block

More text.
''')
        self.assertEqual(
            self.parser.blocks,
            ['this is a code block\n\nthis is a second code block\n'])

    def test_finds_code_blocks_with_text_in_between_as_two_blocks(self):
        self.parser.parse_string('''
This is blah blah text.

    this is a code block

Blah.

    this is a second code block

More text.
''')
        self.assertEqual(
            self.parser.blocks,
            ['this is a code block\n', 'this is a second code block\n'])

    def test_only_finds_top_level_code_blocks(self):
        self.parser.parse_string('''
This is blah blah text.

    this is a code block

And now a list:

*   list item

        this is a second level code block

More text.
''')
        self.assertEqual(self.parser.blocks, ['this is a code block\n'])

    def test_parses_multiple_files(self):
        result1 = self.parser.parse_string('''
    block 1
''')
        result2 = self.parser.parse_string('''
    block 2
''')
        self.assertEqual(result1, ['block 1\n'])
        self.assertEqual(result2, ['block 2\n'])
        self.assertEqual(self.parser.blocks, ['block 1\n', 'block 2\n'])

