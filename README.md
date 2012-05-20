# WCA-Style Puzzle Scrambler: Mark 2 [BETA]

This is not the official WCA scrambler, although it may proposed as one.

The name "Mark 2" represents that this is an entirely rewritten second-generation system for the WCA, and is also a reference to the attempt to convert all scramblers into Markov Random State Scramblers.

# Goals

- Replace all scramblers by high-quality random scramblers, where possible (reasonable alternatives otherwise).
- Implement everything entirely in client-side Javascript. Everything should work in a browser online OR offline, without any other effort. (e.g. no remote/local servers or executables to start. Sorry, tnooodle.)
- Unify the old scramblers into one, easy-to-use interface for generating competition scrambles.

# New Features

- Markov Random-State 3x3x3 and Square-1 scramblers.
- Clearer clock and Square-1 notation.

# Style Guide

- When updating a scrambler, update date of the version at the end of the file.
- Make sure all scramblers use implement a setRandomSource(src) methoda and use randomSource.random() instead of Math.random().
- Always loop over an array using `for (var i=0; i < array.length; i++)` instead of `for (var i in array)`.

# Credit

## Software
- [GWT](https://code.google.com/webtoolkit/) for Java -> Javascript compilation.

## People
- [Jaap Scherphuis](http://www.jaapsch.net/puzzles/) (original scramblers for all puzzles
- Tom van der Zanden (2x2x2)
- [Conrad Rider](http://cube.crider.co.uk/) (2x2x2 and 3x3x3 ini)
- Walter Souza ([Square-1 solver](https://bitbucket.org/walter/puzzle-timer/raw/7049018bbdc7/src/com/puzzletimer/solvers/Square1Solver.java) from [Prisma Puzzle Timer](http://prismapuzzletimer.com/))
- [Herbert Kociemba](http://kociemba.org/cube.htm) (for the [Kociemba two-phase algorithm](http://kociemba.org/math/imptwophase.htm))
- [Stefan Pochmann](http://www.stefan-pochmann.info/spocc/) (Megaminx)
- Clement Gallet (Megaminx)
- Syoji Takamatsu (Pyraminx)
- [Andrew Nelson](http://crunchatize.me/) (Square-1 drawings)
- [Michael Gottlieb](http://mzrg.com/) (Square-1)
- [Lucas Garron](http://www.garron.us/) (Square-1, Mark 2)
- Evan Gates (QBX)
- Shuang Chen (Fast GWT-compiled 3x3x3 scrambler and Square-1 scrambler)