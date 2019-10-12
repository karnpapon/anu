# What is Seeq?

Sequencer / Livecoding environment.
using search or RegEx pattern to assign triggers.
currently support sending MIDI out.

## Usage

```
NOTE: currently, using `canvas`  instead of manipulating DOM directly.
some commands have been changed and undocumented.
```

#### movement
Description |  Operation
--- | ---
start / stop | spacebar
move | arrow
leap | arrow + cmd


#### selection
Description |  Operation
--- | ---
range | arrow + shift
large range | arrow + shift + cmd
add | cmd + n
delete | cmd + backspace
rename | cmd + e
switch between | option + tab
get cursor within | cmd + return (enter)
focused | cmd + f

#### console -> Input
Description |  Operation
--- | ---
toggle insert | cmd + i
eval input | shift + enter

#### console -> Status
Description |  Operation
--- | ---
BPM up | cmd + >
BPM down | cmd + <

#### config
Description |  Operation
--- | ---
set MIDI | cmd + m




### watch in action.

[![IMAGE ALT TEXT HERE](https://i.ytimg.com/vi/DGaakhSvYOg/hqdefault.jpg)](https://www.youtube.com/watch?v=DGaakhSvYOg)



# quick start

```bash
# Go into the repository
cd Seeq
# Install dependencies
yarn install or npm install
# Run the app
yarn start or npm start
```
