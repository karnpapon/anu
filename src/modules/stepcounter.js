'use strict'

/* global client */

function StepCounter(canvas) {
  this.counter = [{ x: 0, y: 0, y_counter: 0, i: 0 }]
  this.monoStepMarkerIndex = canvas.marker.active;

  this.reset = function () {
    this.counter = [{ x: 0, y: 0, y_counter: 0, i: 0 }]
  }

  this.resetTarget = function(index) {
    this.counter[index] = { x: canvas.marker.markers[index].x, y: canvas.marker.markers[index].y, y_counter: 0, i: index }
  }

  this.run = function () {
    if (canvas.monoStepMode) {
      return this.runMonoStepCounter()
    }
    this.runCounter()
  }

  this.runCounter = function () {
    this.counter.forEach(c => {
      increment(c)
    })
  }

  this.runMonoStepCounter = function () {
    incrementMonoMode(this.counter[this.monoStepMarkerIndex])
  }

  function back(c){
    let rand
    c.x--
    canvas.marker.markers.forEach(value => {
      if (value.i === c.i) {
        c.isOverlap = canvas.isOverlapArea(c.x, c.y)
        if (!c.isOverlap) {
          if( c.x < (value.x) || c.y < (value.y)) {
            c.x = value.x + value.w - 1
            c.y = value.h > 1 ? value.y + c.y_counter % value.h : value.y
            c.y_counter--
            c.y_counter = ((c.y_counter % value.h) + value.h) % value.h
          }
        } else {
          value.overlapIndex.forEach((i) => {
            rand = getRandomValue(canvas.marker.markers[i].overlapAreas)
            if(rand && 'x' in rand) {
              c.x = rand.x < value.x || rand.x > value.x + value.w - 1 ? c.x-- : rand.x
            } 
          })
        }
      }
    })
  }

  function forth(c){
    let rand
    c.x++
      canvas.marker.markers.forEach(value => {
        if (value.i === c.i) {
          c.isOverlap = canvas.isOverlapArea(c.x, c.y)
          if (!c.isOverlap) {
            if (
              c.x > (value.x + value.w - 1) ||
              c.y > (value.y + value.h) ||
              value.x > c.x ||
              value.y > c.y
            ) {
              c.x = value.x
              c.y = value.h > 1 ? value.y + c.y_counter % value.h : value.y
              c.y_counter++
              c.y_counter = c.y_counter % value.h // wrapped to height since there's no needs to count up more than marker height.
            }
          } else {
            value.overlapIndex.forEach((i) => {
              rand = getRandomValue(canvas.marker.markers[i].overlapAreas)
              if(rand && 'x' in rand) {
                c.x = rand.x < value.x || rand.x > value.x + value.w - 1 ? c.x++ : rand.x
              } 
            })

          }
        } 
      })
  }

  function forthMonoMode(c, marker){
    c.x++
    if (marker.i === c.i) {
      c.isOverlap = canvas.isOverlapArea(c.x, c.y)
      if (!c.isOverlap) {
        if (
          c.x > (marker.x + marker.w - 1) ||
          c.y > (marker.y + marker.h) ||
          marker.x > c.x ||
          marker.y > c.y
        ) {
          // increasing monoStepMarkerIndex (but keep within total marker length)
          if (canvas.seequencer.indexAt(c.x,c.y) === canvas.seequencer.indexAt(marker.x + marker.w, marker.y + ( marker.h - 1 ))) {
            canvas.stepcounter.monoStepMarkerIndex++
            canvas.stepcounter.monoStepMarkerIndex = canvas.stepcounter.monoStepMarkerIndex % canvas.marker.markers.length 
            marker["control"]["muted"] = true
          }
          
          c.x = marker.x
          c.y = marker.h > 1 ? marker.y + c.y_counter % marker.h : marker.y
          c.y_counter++
          c.y_counter = c.y_counter % marker.h 
        }
      } else {
        // TODO: should handle overlapped area ?
      }
    } 
  }

  function incrementMonoMode(c) {
    if(metronome.current16thNote % canvas.marker.markers[c.i]["control"]["noteRatio"] === 0 ){ 
      // TODO: should handle reverse for mono step ?
      let currentMarker = canvas.marker.markers[canvas.stepcounter.monoStepMarkerIndex]
      currentMarker["control"]["muted"] = false
      forthMonoMode(c, currentMarker)
    }
  }

  function increment(c) {
    if(metronome.current16thNote % canvas.marker.markers[c.i]["control"]["noteRatio"] === 0 ){ 
      if (canvas.marker.markers[c.i]["control"]["reverse"]) { return back(c) }
      forth(c)
    }
  }

  function getRandomValue(collection) {
    let keys = Array.from(collection.keys());
    return  collection.get(keys[Math.floor(Math.random() * keys.length)]);
  }
}
