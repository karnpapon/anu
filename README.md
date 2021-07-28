# What is seeq?

Sequencer / Livecoding environment.
using search or RegEx pattern to assign triggers.
currently support sending MIDI out.

<div style="text-align:center; background-color: black; padding: 20px;"><img src="src/media/images/usage1.gif" /></div>

## Usage

<img src="src/media/images/diagram.svg?sanitize=true">

```
NOTE: currently, using `canvas`  instead of manipulating DOM directly.
some commands have been changed and undocumented.
```

in order to move selection, the console has to be toggled off ( `cmd` + `i`).


#### movement
Description |  Operation
--- | ---
start / stop | `spacebar`
move | `arrow`
leap | `cmd` + `arrow`


#### selection ( cursor )
Description |  Operation
--- | ---
range | `shift` + `arrow`
large range | `shift` + `arrow` + `cmd`
add | `cmd` + `n`
delete | `cmd` + `backspace`
rename | `cmd` + `e`
show current name | `option` + `e`
switch between | `option` + `tab`
get step within | `cmd` + `return (enter)`
focused | `cmd` + `f`

#### step ( within selection )
Description |  Operation
--- | ---
add step | `shift` + `+`


#### console -> input
Description |  Operation
--- | ---
toggle insert | `cmd` + `i`
eval input | `enter`

#### console -> status
Description |  Operation
--- | ---
BPM up | `cmd` + `>`
BPM down | `cmd` + `<`

#### config
Description |  Operation
--- | ---
set MIDI | `cmd` + `m`



## watch in action.


<div style="text-align:center; background-color: black;"><a href="https://www.youtube.com/watch?v=DGaakhSvYOg"><img src="https://i.ytimg.com/vi/DGaakhSvYOg/hqdefault.jpg" /></a></div>


## Notes.
- currently, MIDI devices / OSC addrs / UDP port are not configurable.

# development

```bash
# Go into the repository
cd Seeq
# Install dependencies
yarn install or npm install
# Run the app
yarn start or npm run start
```
