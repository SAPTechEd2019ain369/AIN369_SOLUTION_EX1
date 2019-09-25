(function() {
	let template = document.createElement("template");
	template.innerHTML = `
		<form id="form">
		</form>
	`;

	class GaugeAps extends HTMLElement {
		constructor() {
			super();
		}
	}

customElements.define("com-sap-teched-gauge-solution-exe1-aps", GaugeAps);
})();