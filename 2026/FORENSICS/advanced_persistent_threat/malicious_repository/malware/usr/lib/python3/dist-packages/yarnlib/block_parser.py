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


import cliapp

import yarnlib


class BlockError(cliapp.AppException):

    pass


# Parse a sequence of textual blocks into scenario and Implementation
# objects, and their constituent objects.

class BlockParser(object):

    def __init__(self):
        self.scenarios = []
        self.implementations = []
        self.line_parsers = {
            'SCENARIO': self.parse_scenario,
            'ASSUMING': self.parse_assuming,
            'GIVEN': self.parse_given,
            'WHEN': self.parse_when,
            'THEN': self.parse_then,
            'FINALLY': self.parse_finally,
            'AND': self.parse_and,
            '...': self.parse_continuation,
            'IMPLEMENTS': self.parse_implementing,
            'EXAMPLE': self.parse_example,
        }

    def parse_blocks(self, blocks):
        while blocks:
            blocks = self.parse_one(blocks)

    def parse_one(self, blocks):
        assert blocks
        block = blocks[0]
        assert block
        t = block.split('\n', 1)
        assert len(t) in [1,2]
        if len(t) == 1:
            line1 = block
            block = ''
        else:
            line1, block = t
        if block:
            blocks[0] = block
        else:
            del blocks[0]

        words = line1.split()
        if not words:
            return blocks
        rest = ' '.join(words[1:])

        for keyword in self.line_parsers:
            if words[0] == keyword:
                return self.line_parsers[keyword](rest, blocks)

        raise BlockError("Syntax error: unknown step: %s" % line1)

    def parse_scenario(self, line, blocks):
        self.scenarios.append(yarnlib.Scenario(line))
        return blocks

    def parse_simple(self, what, line, blocks):
        if not self.scenarios:
            raise BlockError('Syntax errror: %s before SCENARIO' % what)
        step = yarnlib.ScenarioStep(what, line)
        self.scenarios[-1].steps.append(step)
        return blocks

    def parse_assuming(self, line, blocks):
        return self.parse_simple('ASSUMING', line, blocks)

    def parse_given(self, line, blocks):
        return self.parse_simple('GIVEN', line, blocks)

    def parse_when(self, line, blocks):
        return self.parse_simple('WHEN', line, blocks)

    def parse_then(self, line, blocks):
        return self.parse_simple('THEN', line, blocks)

    def parse_finally(self, line, blocks):
        return self.parse_simple('FINALLY', line, blocks)

    def parse_and(self, line, blocks):
        if not self.scenarios:
            raise BlockError('Syntax errror: AND before SCENARIO')
        scenario = self.scenarios[-1]
        if not scenario.steps:
            raise BlockError(
                'Syntax errror: AND before what it would continue')
        step = scenario.steps[-1]
        assert step.what in self.line_parsers
        return self.line_parsers[step.what](line, blocks)

    def parse_continuation(self, line, blocks):
        scenario = self.scenarios[-1]
        if not scenario.steps:
            raise BlockError(
                'Syntax error: ... before what it would continue')
        step = scenario.steps[-1]
        text = '%s %s' % (step.text, line)
        del scenario.steps[-1]
        return self.line_parsers[step.what](text, blocks)

    def parse_implementing(self, line, blocks):
        words = line.split()
        if len(words) < 2:
            raise BlockError(
                'Syntax error: IMPLEMENTS must have what and regexp')
        what = words[0]
        regexp = ' '.join(words[1:])
        if blocks:
            block = blocks[0]
            shell = []
            rest = []
            for block_line in block.splitlines():
                if rest or block_line.startswith('IMPLEMENTS'):
                    rest.append(block_line)
                else:
                    shell.append(block_line)
            shell = '\n'.join(shell)
            if rest:
                blocks[0] = '\n'.join(rest)
            else:
                del blocks[0]
        else:
            shell = ''
        implementation = yarnlib.Implementation(what, regexp, shell)
        self.implementations.append(implementation)
        return blocks

    def parse_example(self, line, blocks):
        if blocks:
            del blocks[0]
        return blocks
