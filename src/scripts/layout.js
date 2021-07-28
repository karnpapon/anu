function Layout(app) {
  const el = (tag) => document.createElement(tag);
  this.headerElem = el("header");
  this.helperElem = el("div");
  this.helperElem.classList.add("helper");

  this.init = function () {
    this.headerElem.innerHTML = `
      <div style="display: flex;">
        <bold>seeq : letter sequencer</bold>
        <p id="helper"> | docs</p>
      </div>
      <div class="info">
        <a target="_blank" href="https://github.com/karnpapon/seeq/tree/web">
          <img src="/src/media/icons/github-logo.svg" alt="gh-logo">
        </a>
      </div>
    `;

    this.helperElem.innerHTML = `
      <div class="scroll-area">
      <section>
          <p>Sequencer / Livecoding environment. using search or RegEx pattern to assign triggers.</p>
          <h2>Documents.</h2>
          <strong>movement</strong>
          <p>in order to move selection with arrow, <br/> the console has to be toggled off by cmd + i<p/>
          <ul class="helper-list">
            <li>
              <p>play/pause</p>
              <code>spacebar</code>
            </li>
            <li>
              <p>move</p>
              <code>arrow</code>
            </li>
            <li>
              <p>leap</p>
              <code>cmd</code><binop>+</binop><code>arrow</code>
            </li>
          </ul>
          <strong>selection</strong>
          <ul class="helper-list">
            <li>
              <p>range</p>
              <code>shift</code><binop>+</binop><code>arrow</code>
            </li>
            <li>
              <p>enlarge</p>
              <code>shift</code><binop>+</binop><code>arrow</code><binop>+</binop><code>cmd</code>
            </li>
            <li>
              <p>add</p>
              <code>cmd</code><binop>+</binop><code>n</code>
            </li>
            <li>
              <p>delete</p>
              <code>cmd</code><binop>+</binop><code>backspace</code>
            </li>
            <li>
              <p>rename</p>
              <code>cmd</code><binop>+</binop><code>e</code>
            </li>
            <li>
              <p>current name</p>
              <code>option</code><binop>+</binop><code>e</code>
            </li>
            <li>
              <p>switch</p>
              <code>option</code><binop>+</binop><code>tab</code>
            </li>
            <li>
              <p>snap</p>
              <code>cmd</code><binop>+</binop><code>return</code>
            </li>
            <li>
              <p>focus</p>
              <code>cmd</code><binop>+</binop><code>f</code>
            </li>
            <li>
              <p>add step</p>
              <code>shift</code><binop>+</binop><code>plus</code>
            </li>
          </ul>
          <strong>console</strong>
          <ul class="helper-list">
            <li>
              <p>toggle insert</p>
              <code>cmd</code><binop>+</binop><code>i</code>
            </li>
            <li>
              <p>eval input</p>
              <code>enter</code>
            </li>
            <li>
              <p>BPM up</p>
              <code>cmd</code><binop>+</binop><code> > </code>
            </li>
            <li>
              <p>BPM down</p>
              <code>cmd</code><binop>+</binop><code> < </code>
            </li>
            <li>
              <p>set MIDI</p>
              <code>cmd</code><binop>+</binop><code>m</code>
            </li>
          </ul>
          <bold>OSC ports (currently, cannot configurable)</bold>
          <p>to active OSC, osc button has to be toggled on.</p>
          <p>open OSC = &nbsp;<code> cmd + o</code></p>
          <p>default: <code>49162</code></p>
          <p>tidalCycles: <code>6010</code></p>
          <p>superCollider: <code>57120</code></p>
          <p>sonicPi: <code>4559</code></p>
          <strong>caveats</strong>
          <ul class="helper-list">
            <div> 
              <p>sharp note is not support, use flat instead</p> 
            </div>
          </ul>
        </section>
      </div>
    `;
  };

  this.addListener = function(){
    const helperBtn = document.getElementById("helper")
    helperBtn.addEventListener("click", () => {
      this.helperElem.classList.toggle("visible") 
    })
  }

  this.build = function () {
    this.init();
    app.appWrapper.appendChild(this.headerElem);
    app.appWrapper.appendChild(this.helperElem);
    this.addListener()
  };
}
