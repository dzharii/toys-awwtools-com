
class JSONFormatter extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    padding: 16px;
                    box-sizing: border-box;
                }
                #container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                    height: 100%;
                }
                textarea, pre {
                    flex: 1;
                    min-width: 100px;
                    height: 300px;
                    resize: vertical;
                }
                pre {
                    white-space: pre-wrap;
                    overflow-wrap: break-word;
                    background: #f4f4f4;
                    padding: 8px;
                    border: 1px solid #ccc;
                }
            </style>
            <div id="container">
                <textarea id="inputArea" placeholder="Paste JSON here..."></textarea>
                <pre id="outputArea"></pre>
            </div>
        `;

        this.inputArea = this.shadowRoot.querySelector('#inputArea');
        this.outputArea = this.shadowRoot.querySelector('#outputArea');

        this.inputArea.addEventListener('input', () => this.formatJSON());
    }

    formatJSON() {
        try {
            const obj = JSON.parse(this.inputArea.value);
            this.outputArea.textContent = JSON.stringify(obj, null, 4);
        } catch (e) {
            this.outputArea.textContent = 'Invalid JSON input!';
        }
    }
}

customElements.define('json-formatter', JSONFormatter);

