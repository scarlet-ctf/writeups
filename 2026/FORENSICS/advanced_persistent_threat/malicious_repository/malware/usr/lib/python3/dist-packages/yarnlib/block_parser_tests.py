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


class BlockParserTests(unittest.TestCase):

    def setUp(self):
        self.parser = yarnlib.BlockParser()

    def test_is_initially_empty(self):
        self.assertEqual(self.parser.scenarios, [])
        self.assertEqual(self.parser.implementations, [])

    def test_skips_examples(self):
        self.parser.parse_blocks(['EXAMPLE foo', 'bar'])
        self.assertEqual(len(self.parser.scenarios), 0)

    def test_parses_simple_elements(self):
        self.parser.parse_blocks(
            ['SCENARIO foo', 'ASSUMING something', 'GIVEN bar',
             'WHEN foobar\nTHEN yoyo\nFINALLY yay\nAND yeehaa'])

        self.assertEqual(len(self.parser.scenarios), 1)
        self.assertEqual(len(self.parser.implementations), 0)

        scenario = self.parser.scenarios[0]
        self.assertEqual(scenario.name, 'foo')
        self.assertEqual(len(scenario.steps), 6)
        self.assertEqual(scenario.steps[0].what, 'ASSUMING')
        self.assertEqual(scenario.steps[0].text, 'something')
        self.assertEqual(scenario.steps[1].what, 'GIVEN')
        self.assertEqual(scenario.steps[1].text, 'bar')
        self.assertEqual(scenario.steps[2].what, 'WHEN')
        self.assertEqual(scenario.steps[2].text, 'foobar')
        self.assertEqual(scenario.steps[3].what, 'THEN')
        self.assertEqual(scenario.steps[3].text, 'yoyo')
        self.assertEqual(scenario.steps[4].what, 'FINALLY')
        self.assertEqual(scenario.steps[4].text, 'yay')
        self.assertEqual(scenario.steps[5].what, 'FINALLY')
        self.assertEqual(scenario.steps[5].text, 'yeehaa')

    def test_handles_continuation_line(self):
        self.parser.parse_blocks(['SCENARIO foo', 'GIVEN foo', '... and bar'])
        scenario = self.parser.scenarios[0]
        self.assertEqual(len(self.parser.scenarios), 1)
        self.assertEqual(scenario.name, 'foo')
        self.assertEqual(scenario.steps[0].what, 'GIVEN')
        self.assertEqual(scenario.steps[0].text, 'foo and bar')

    def test_normalises_whitespace(self):
        self.parser.parse_blocks(['SCENARIO   foo   bar   '])
        self.assertEqual(self.parser.scenarios[0].name, 'foo bar')

    def test_handles_empty_line(self):
        self.parser.parse_blocks(['SCENARIO foo\n\nGIVEN bar\nTHEN foobar'])
        self.assertEqual(len(self.parser.scenarios), 1)

    def test_raises_error_for_unknown_step(self):
        self.assertRaises(
            yarnlib.BlockError,
            self.parser.parse_blocks,
            ['SCENARIO foo\nblah'])

    def test_raises_error_for_step_outside_scenario(self):
        self.assertRaises(
            yarnlib.BlockError,
            self.parser.parse_blocks,
            ['GIVEN foo'])

    def test_raises_error_for_AND_before_scenario(self):
        self.assertRaises(
            yarnlib.BlockError,
            self.parser.parse_blocks,
            ['AND bar'])

    def test_raises_error_for_AND_before_step(self):
        self.assertRaises(
            yarnlib.BlockError,
            self.parser.parse_blocks,
            ['SCENARIO foo\nAND bar'])

    def test_parses_implements_in_a_block_by_itself(self):
        self.parser.parse_blocks(['IMPLEMENTS GIVEN foo\ntrue'])
        impls = self.parser.implementations
        self.assertEqual(len(impls), 1)
        self.assertEqual(impls[0].what, 'GIVEN')
        self.assertEqual(impls[0].regexp, 'foo')
        self.assertEqual(impls[0].shell, 'true')

    def test_parses_implements_with_empty_shell_text(self):
        self.parser.parse_blocks(['IMPLEMENTS GIVEN foo'])
        impls = self.parser.implementations
        self.assertEqual(len(impls), 1)
        self.assertEqual(impls[0].what, 'GIVEN')
        self.assertEqual(impls[0].regexp, 'foo')
        self.assertEqual(impls[0].shell, '')

    def test_parses_two_implements_in_a_code_block(self):
        self.parser.parse_blocks(
            ['IMPLEMENTS GIVEN foo\ntrue\nIMPLEMENTS WHEN bar\ncat /dev/null'])
        impls = self.parser.implementations
        self.assertEqual(len(impls), 2)
        self.assertEqual(impls[0].what, 'GIVEN')
        self.assertEqual(impls[0].regexp, 'foo')
        self.assertEqual(impls[0].shell, 'true')
        self.assertEqual(impls[1].what, 'WHEN')
        self.assertEqual(impls[1].regexp, 'bar')
        self.assertEqual(impls[1].shell, 'cat /dev/null')

    def test_raises_error_for_implements_with_no_args(self):
        self.assertRaises(
            yarnlib.BlockError,
            self.parser.parse_blocks,
            ['IMPLEMENTS'])

    def test_raises_error_for_implements_with_one_args(self):
        self.assertRaises(
            yarnlib.BlockError,
            self.parser.parse_blocks,
            ['IMPLEMENTS GIVEN'])

    def test_raises_error_for_implements_with_first_args_not_a_keyword(self):
        self.assertRaises(
            yarnlib.BlockError,
            self.parser.parse_blocks,
            ['IMPLEMENTS foo'])

