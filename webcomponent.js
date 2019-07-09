(function()  {
    
    let tmpl = document.createElement('template');
    tmpl.innerHTML = `
      <style>
      :host(.vu_fixed) {
        background-image: url(https://github.wdf.sap.corp/pages/d023588/orca_customWidget_samples/gauge/css/vu_fixed.png);
        background-size: 100% 100%;
        background-repeat: no-repeat;
    }
    
    .vu_turning {
        background-image: url(https://github.wdf.sap.corp/pages/d023588/orca_customWidget_samples/gauge/css/vu_turning.png);
        background-repeat: no-repeat;
        background-size: 100% 100%;
        position: absolute;
        width: 100%;
        height: 100%;
        transform-origin: 50% 100%;
        transition: 1s ease-out
    }
    
    :host(.knob_fixed) {
        background-image: url(https://github.wdf.sap.corp/pages/d023588/orca_customWidget_samples/gauge/css/knob_fixed.png);
        background-size: 100% 100%;
        background-repeat: no-repeat;
    }
    
    .knob_turning {
        background-image: url(https://github.wdf.sap.corp/pages/d023588/orca_customWidget_samples/gauge/css/knob_turning.png);
        background-repeat: no-repeat;
        background-size: 100% 100%;
        position: absolute;
        width: 100%;
        height: 100%;
        transform-origin: 51% 52;
    }
      </style>
      <div id="needle"><div>
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
            this._svgContainer;
    
            this._outerRad = 0.0;
            this._endAngleDeg = 0.0;
            this._startAngleDeg = -145.0;
            this._widgetWidth = 144;
            
            //New with Part 6
            this._useMeasures = true;
            this._endAngleDegMax = 145.0;
            this._measureMax = 0;
            this._measureMin = 0;
            this._measureVal = 0;
            
            //Part 7 conditional formatting
            this._colorCode = 'white';
            this._gaugeOpacity = 0.75,
            this._displayedColor = 'white'
            this._colorArray = 1;  //abusing JS duck typing here.  ;-)
            
            //Part 8 Guide Lines
            this._enableGuideLines = true;
            this._enableGuideRing = true;
            this._ringColorCode = 'blue';
            this._guideOpacity = 0.75;
            this._ringThickness = 5;
            this._bracketThickness = 5;
            
            //Part 10 - Animations
            this._animationEnable = true;
            this._animationDelay = 500;
            this._animationDuration = 1000;
            this._animationEase = "easeLinear";
            this._animationEnableOpacity = false;
            this._animationDelayOpacity = 500;
            this._animationDurationOpacity = 500;
            
            this.redraw();
        };
    
    
        get measureMax() {
            return this._measureMax;
        }
        set measureMax(value) {
            this._measureMax = value;
            
        };
    
    
        get measureMin() {
            return this._measureMin;
        }
        set measureMin(value) {
            this._measureMin = value;
            
        };
    
        get measureVal() {
            return this._measureVal;
        }
        set measureVal(value) {
            if (this._svgContainer){
                //super nasty hack, that needs to get cleaned up
                this._svgContainer._groups[0][0].innerHTML = "";
            }
            this._measureVal = value;
            
            this.redraw();
        };
    
        
        
        redraw() {
    
            if (this._measureMax > this._measureMin){
                if (!this._svgContainer){
                    this._svgContainer = window._d3.select(this._shadowRoot)
                    .append("svg:svg")
                    .attr("id", "gauge")
                    .attr("width", this._widgetWidth)
                    .attr("height", this._widgetWidth);
                }
        
                this.recalculateCurrentAngle();
                
                //Prepare the animation settings
                // If this._animationEnable is false, then we'll act as if this._animationDelay and this._animationDuration
                //   are both 0, without actually altering their values.
                var tempAnimationDelay = 0;
                var tempAnimationDuration = 0;
                if (this._animationEnable == true){
                    tempAnimationDelay = this._animationDelay;
                    tempAnimationDuration = this._animationDuration;
                }
                
                var pi = Math.PI;		
                this._outerRad = (this._widgetWidth)/2;
    
                var arcDef = window._d3.svg.arc()
                    .innerRadius(0)
                    .outerRadius(this._outerRad);
    
                var guageArc = this._svgContainer.append("path")
                    .datum({endAngle: this._startAngleDeg * (pi/180), startAngle: this._startAngleDeg * (pi/180)})
                    .style("fill", this._displayedColor)
                    .attr("width", this._widgetWidth).attr("height", this._widgetWidth) // Added height and width so arc is visible
                    .attr("transform", "translate(" + this._outerRad + "," + this._outerRad + ")")
                    .attr("d", arcDef)
                    .attr( "fill-opacity", this._gaugeOpacity );
                

                ///////////////////////////////////////////	
                //Lets build a border ring around the gauge
                ///////////////////////////////////////////
                var visRing = window._d3.select(myDiv).append("svg:svg").attr("width", "100%").attr("height", "100%");
                    
                var ringOuterRad = this._outerRad + ( -1 * this._ringThickness);  //Outer ring starts at the outer radius of the inner arc
        
                var ringArcDefinition = window._d3.svg.arc()
                    .innerRadius(this._outerRad)
                    .outerRadius(ringOuterRad)
                    .startAngle(this._startAngleDeg * (pi/180)) //converting from degs to radians
                    .endAngle(this._endAngleDegMax * (pi/180)) //converting from degs to radians
        
                var ringArc = this._svgContainer
                    .append("path")
                    .attr("d", ringArcDefinition)
                    .attr("fill", this._ringColorCode)
                    .attr("transform", "translate(" + this._outerRad + "," + this._outerRad + ")");


                ///////////////////////////////////////////
                //Lets build a the start and end lines
                ///////////////////////////////////////////
                var visStartBracket = window._d3.select(myDiv).append("svg:svg").attr("width", "100%").attr("height", "100%");
                var lineData = [endPoints (this._outerRad, this._startAngleDeg), {x:this._outerRad, y:this._outerRad}, endPoints (this._outerRad, this._endAngleDegMax)];
                var lineFunction = window._d3.line()
                    .x(function(d) { return d.x; })
                    .y(function(d) { return d.y; })
                    .interpolate("linear");
                                            
                var borderLines = this._svgContainer
                    .attr("width", me.$().width()).attr("height", me.$().height()) // Added height and width so line is visible
                    .append("path")
                    .attr("d", lineFunction(lineData))
                    .attr("stroke", this._ringColorCode)
                    .attr("stroke-width", this._bracketThickness)
                    .attr("fill", "none");	

                                
                ///////////////////////////////////////////
                //Lets add our animations
                ///////////////////////////////////////////			
                //This blog post explains using attrTween for arcs: http://bl.ocks.org/mbostock/5100636
                // Function adapted from this example
                // Creates a tween on the specified transition's "d" attribute, transitioning
                // any selected arcs from their current angle to the specified new angle.
                if (this._enableArc == true){
                    if ((this._endAngleDeg > 0) && (this._startAngleDeg < 0)){
                        
                            guageArc.transition()
                                .duration(tempAnimationDuration)
                                .delay(tempAnimationDelay)
                                .attrTween("d", function(d) {
                                    var interpolate = window._d3.interpolate(this._startAngleDeg * (pi/180), 0);
                                    return function(t) {
                                        d.endAngle = interpolate(t);
                                        return arcDef(d);
                                    };
                                });
                            guageArc.transition()
                                .duration(tempAnimationDuration)
                                .delay(0)
                                .ease(this._animationEase)
                                .attrTween("d", function(d) {
                                    var interpolate = window._d3.interpolate(0, this._endAngleDeg * (pi/180));
                                    return function(t) {
                                        d.endAngle = interpolate(t);
                                        return arcDef(d);
                                    };
                                });
                    } else {
                            guageArc.transition()
                                .duration(tempAnimationDuration)
                                .delay(tempAnimationDelay)
                                .ease(this._animationEase)
                                .attrTween("d", function(d) {
                                    var interpolate = window._d3.interpolate(this._startAngleDeg * (pi/180), this._endAngleDeg * (pi/180));
                                    return function(t) {
                                        d.endAngle = interpolate(t);
                                        return arcDef(d);
                                    };
                                });			
                    }
                }

            }	
        };
        
    
        
        //New with Part 6
        recalculateCurrentAngle = function(){
            if (this._useMeasures == true){
                //Firstly, ensure that we can turn in a clockwise manner to get from startAngleDeg to endAngleDegMax
                while (this._endAngleDeg < this._startAngleDeg){
                    this._endAngleDegMax = me.this._endAngleDegMax + 360.0;
                }
                
                var currEnd = 0.0;
                if (this._measureVal > this._measureMax){
                    currEnd = this._endAngleDegMax;
                } 
                else if (this._measureVal  < this._measureMin){
                    currEnd = this._startAngleDeg;
                } else{
                    var measureDelta = this._measureMax - this._measureMin;
                    var measureValNormalized = 0.0;
                    if (measureDelta >  measureValNormalized){
                        var measureValNormalized = this._measureVal / measureDelta;
                    }
                    currEnd = this._startAngleDeg + (measureValNormalized * (this._endAngleDegMax - this._startAngleDeg))
                }
                
                if (currEnd >  this._endAngleDegMax){
                    currEnd = this._endAngleDegMax;
                } 
        
                //Now set this._endAngleDeg
                this._endAngleDeg = currEnd;
            }		
            else {
                //Right now, this gauge is hardcoded to turn in a clockwise manner. 
                //  Ensure that the arc can turn in a clockwise direction to get to the end angles
                while (this._endAngleDeg < this._startAngleDeg){
                    this._endAngleDeg = this._endAngleDeg + 360.0;
                }
                
                //Ensure that endAngleDeg falls within the range from startAngleDeg to endAngleDegMax
                while (this._endAngleDeg > this._endAngleDegMax){
                    this._endAngleDegMax = this._endAngleDegMax + 360.0;
                }
            }
        };
        
        
        //Helper function	
        endPoints (lineLength, lineAngle){
            var pi = Math.PI;
            var endX = this._outerRad + (lineLength * Math.sin(lineAngle * (pi/180)));
            var endY = this._outerRad - (lineLength * Math.cos(lineAngle * (pi/180)));
            return {x:endX, y:endY}
        }
        
      }
      customElements.define('com-sap-teched-gauge-solution', Gauge);
    })();