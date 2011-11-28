# WCA-Style Puzzle Scrambler: Mark 2

NOTE: This is not the official WCA scrambler yet. It is a proposed replacement under development by Lucas Garron.

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