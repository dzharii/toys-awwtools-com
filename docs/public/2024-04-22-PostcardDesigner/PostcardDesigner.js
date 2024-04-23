
/**
 * Represents a template rendering web component that uses Shadow DOM for style encapsulation.
 */
class TemplateRenderer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['templateid'];
    }

    /**
     * Reacts to changes in attributes, particularly 'templateid' to rerender the template.
     * @param {string} name - The name of the attribute that changed.
     * @param {string} oldValue - The old value of the attribute.
     * @param {string} newValue - The new value of the attribute.
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'templateid') {
            this.render();
        }
    }

    /**
     * Renders the template based on the selected ID.
     */
    render() {
        const templateId = this.getAttribute('templateid');
        const templates = {
            birthday: { html: `<p>Edit me to send birthday wishes!</p>`, css: `p { color: blue; font-size: 20px; }` },
            congratulations: { html: `<p>Congratulations on your achievement!</p>`, css: `p { color: green; font-size: 20px; }` },
            holiday: { html: `<p>Happy Holidays!</p>`, css: `p { color: red; font-size: 20px; }` }
        };
        const template = templates[templateId] || templates['birthday'];
        this.shadowRoot.innerHTML = `
            <style>${template.css}</style>
            <div contenteditable="true">${template.html}</div>
        `;
    }
}

customElements.define('template-renderer', TemplateRenderer);

/**
 * Main web component for designing postcards.
 */
class PostcardDesigner extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    /**
     * Sets up the component's initial internal structure and event handlers.
     */
    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>
                :host { display: block; padding: 10px; border: 1px solid #ccc; }
                select { margin-bottom: 10px; }
                button { margin-top: 10px; }
            </style>
            <select id="template-selector">
                <option value="birthday">Birthday</option>
                <option value="congratulations">Congratulations</option>
                <option value="holiday">Holiday</option>
            </select>
            <template-renderer templateid="birthday"></template-renderer>
            <button id="save-button">Save as PNG</button>
        `;
        this.shadowRoot.querySelector('#template-selector').addEventListener('change', this.changeTemplate.bind(this));
        this.shadowRoot.querySelector('#save-button').addEventListener('click', this.saveAsPng.bind(this));
    }

    /**
     * Handles template selection, updating the template renderer.
     * @param {Event} event - The event object from the select element.
     */
    changeTemplate(event) {
        const newTemplate = event.target.value;
        this.shadowRoot.querySelector('template-renderer').setAttribute('templateid', newTemplate);
    }

    /**
     * Converts the current content of the postcard to a PNG image and triggers a download.
     */
    async saveAsPng() {
        const content = this.shadowRoot.querySelector('template-renderer').shadowRoot.querySelector('div');
        try {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const data = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="300">
                            <foreignObject width="100%" height="100%">
                                <div xmlns="http://www.w3.org/1999/xhtml" style="font-size:20px">
                                    ${content.innerHTML}
                                </div>
                            </foreignObject>
                          </svg>`;
            const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const image = new Image();
            image.onload = () => {
                canvas.width = image.width;
                canvas.height = image.height;
                context.drawImage(image, 0, 0);
                canvas.toBlob(async (blob) => {
                    const pngUrl = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = pngUrl;
                    a.download = 'postcard.png';
                    a.click();
                    URL.revokeObjectURL(pngUrl);
                }, 'image/png');
            };
            image.src = url;
            image.onerror = () => {
                console.error('Error loading the image for the PNG conversion.');
                alert('Failed to load the image for conversion. Please try again.');
            };
        } catch (error) {
            console.error('Error generating PNG:', error);
            alert('An error occurred while generating the PNG. Please check the console for more details.');
        }
    }
}

customElements.define('postcard-designer', PostcardDesigner);
console.log("Hello");

