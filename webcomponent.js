(function()  {
    
    let tmpl = document.createElement('template');
    tmpl.innerHTML = `
      <style>
      </style>
    `;
    
    class Gauge extends HTMLElement {
    
        constructor() {

            super();
            //Constants
            if (!window._d3){
                window._d3 = d3;
            }
            
            this._shadowRoot = this.attachShadow({mode: 'open'});
            this._shadowRoot.appendChild(tmpl.content.cloneNode(true));
        };
       
      }
      customElements.define('com-sap-teched-gauge-solution-exe1', Gauge);
    })();