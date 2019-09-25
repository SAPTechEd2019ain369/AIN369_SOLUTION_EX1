(function()  {
    let d3Script = document.createElement('script');
    d3Script.src = 'https://d3js.org/d3.v5.min.js';
    d3Script.async = false;
    document.head.appendChild(d3Script);

    let tmpl = document.createElement('template');
    tmpl.innerHTML = `
      <style>
      </style>
    `;

    d3Script.onload = () => 

    customElements.define('com-sap-teched-gauge-solution-exe1', class Gauge extends HTMLElement {


        disconnectedCallback () {
            // your cleanup code goes here
            try{
                document.head.removeChild(d3Script);
            }
            catch{}
        }

        connectedCallback () {
            const bcRect = this.getBoundingClientRect();
            this._widgetHeight = bcRect.height;
            this._widgetWidth = bcRect.width;
        }
    
        constructor() {
            super();
            //Constants
            if (!window._d3){
                window._d3 = d3;
            }
            
            this._shadowRoot = this.attachShadow({mode: 'open'});
            this._shadowRoot.appendChild(tmpl.content.cloneNode(true));
            this._svgContainer;
        };
    
    
    });
        
})();