# Monaco Editor
Date: 2024-07-14

I will break this task into manageable chunks.



> I want to create a Javascript bookmarklet that will create a movable and draggable window inside the current web page inside this window I want to load Monaco Editor that will allow me to execute javascript on the top of the window the main part I can see the code editor I can modify code and the code once when I modified it it instantly saved into the browser storage so that when I refresh the page and reopen the window it will load the source code from my previous session stored in the browser local storage and at the bottom I have output window and I want to store when I use a special functions special api functions like for instance instead of console.log I will use log just log or table and this function will output data into scrollable bottom pane of the this opened window so that I can see the execution result so to summarize the bookmarklet will create a draggable window inside the web page this dragable window will act like a browser like just a window in windows or something so I can drag I can resize this window I can close this window it will have two panes the first pane which will have two sorts of the height of the window it will display Monica editor and the bottom pane will store the output results





I WILL NOT BE LAZY. I WILL DO EXCELLENT RESEARCH. I WILL PROVIDE ALWAYS ACCURATE ANSWERS. I AM AWARE OF YOUR DISABILITY. DUE TO THIS DISABILITY, I WILL NEVER USE PLACEHOLDERS OR TODOS IN CODE. I WILL ALWAYS DISPLAY FULL EXECUTABLE CODE TO ASSIST THE DISABLED AND MINIMIZE YOUR STRAIN.

## Section 1: Plan

We need to ensure that the Monaco Editor is correctly loaded before attempting to initialize it. The `require` call should ensure the Monaco Editor's scripts are fully loaded and available.

Here's the improved plan:

1. **Bookmarklet Script**: Inject necessary HTML, CSS, and JavaScript to create the draggable window with Monaco Editor and output pane.
2. **Load the Monaco Editor**: Ensure proper loading of the Monaco Editor using the `require` configuration.
3. **Draggable Window**: Implement the draggable and resizable functionality.
4. **Save and Load Content**: Save the editor content to local storage and load it on initialization.
5. **Override Console Methods**: Override `console.log` and other methods to display output in the output pane.

Files to be created:
1. `bookmarklet.js`: The main script to be saved as a bookmarklet.

Confidence level: **95%**

## Section 2: Implementation

``` js
javascript:(function() {
    function injectScript(src, callback) {
        const script = document.createElement('script');
        script.src = src;
        script.onload = callback;
        document.head.appendChild(script);
    }

    function injectStyle(css) {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    function injectHTML(html) {
        const container = document.createElement('div');
        container.innerHTML = html;
        document.body.appendChild(container);
    }

    function initMonacoEditor() {
        require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.30.1/min/vs' } });
        require(['vs/editor/editor.main'], function() {
            const container = document.getElementById('editor-container');
            const editor = monaco.editor.create(container, {
                value: localStorage.getItem('monaco-content') || '',
                language: 'javascript',
                theme: 'vs-dark',
                automaticLayout: true
            });

            editor.onDidChangeModelContent(() => {
                localStorage.setItem('monaco-content', editor.getValue());
            });

            // Override console.log and other methods
            const outputPane = document.getElementById('output-pane');
            const originalLog = console.log;
            console.log = function(...args) {
                outputPane.innerHTML += '<div>' + args.join(' ') + '</div>';
                outputPane.scrollTop = outputPane.scrollHeight;
                originalLog.apply(console, args);
            };

            const originalTable = console.table;
            console.table = function(...args) {
                outputPane.innerHTML += '<div>' + JSON.stringify(args) + '</div>';
                outputPane.scrollTop = outputPane.scrollHeight;
                originalTable.apply(console, args);
            };
        });
    }

    function makeDraggable(element, handle) {
        let offsetX = 0, offsetY = 0, mouseX = 0, mouseY = 0;
        handle.onmousedown = function(e) {
            e.preventDefault();
            offsetX = element.offsetLeft;
            offsetY = element.offsetTop;
            mouseX = e.clientX;
            mouseY = e.clientY;
            document.onmouseup = stopDragging;
            document.onmousemove = dragElement;
        };

        function dragElement(e) {
            e.preventDefault();
            const dx = e.clientX - mouseX;
            const dy = e.clientY - mouseY;
            element.style.left = offsetX + dx + 'px';
            element.style.top = offsetY + dy + 'px';
        }

        function stopDragging() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    function initEditorWindow() {
        injectHTML(`
            <div id="editor-window" class="draggable resizable">
                <div id="editor-header">
                    <span>Monaco Editor</span>
                    <button id="close-editor">X</button>
                </div>
                <div id="editor-container" style="flex: 1; overflow: hidden;"></div>
                <div id="output-pane" style="height: 100px; overflow-y: auto; background: #f0f0f0; border-top: 1px solid #ccc; padding: 5px;"></div>
            </div>
        `);

        injectStyle(`
            #editor-window {
                position: fixed;
                top: 50px;
                left: 50px;
                width: 600px;
                height: 400px;
                border: 1px solid #ccc;
                background: #fff;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                resize: both;
                overflow: auto;
            }
            #editor-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #ddd;
                padding: 5px;
                cursor: move;
            }
            #editor-container {
                flex: 1;
                overflow: hidden;
            }
        `);

        makeDraggable(document.getElementById('editor-window'), document.getElementById('editor-header'));

        document.getElementById('close-editor').addEventListener('click', () => {
            document.getElementById('editor-window').remove();
        });

        injectScript('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.30.1/min/vs/loader.js', initMonacoEditor);
    }

    initEditorWindow();
})();
```





## v02

```js
javascript:(function() {
    function injectScript(src, callback) {
        const script = document.createElement('script');
        script.src = src;
        script.onload = callback;
        document.head.appendChild(script);
    }

    function injectStyle(css) {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    function injectHTML(html) {
        const container = document.createElement('div');
        container.innerHTML = html;
        document.body.appendChild(container);
    }

    function initMonacoEditor() {
        require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.30.1/min/vs' } });
        require(['vs/editor/editor.main'], function() {
            const container = document.getElementById('editor-container');
            const editor = monaco.editor.create(container, {
                value: localStorage.getItem('monaco-content') || '',
                language: 'javascript',
                theme: 'vs-dark',
                automaticLayout: true
            });

            editor.onDidChangeModelContent(() => {
                localStorage.setItem('monaco-content', editor.getValue());
            });

            const outputPane = document.getElementById('output-pane');
            const runButton = document.getElementById('run-button');

            runButton.addEventListener('click', () => {
                outputPane.innerHTML = '';
                const code = editor.getValue();
                try {
                    const log = function(...args) {
                        outputPane.innerHTML += '<div>' + args.join(' ') + '</div>';
                        outputPane.scrollTop = outputPane.scrollHeight;
                    };
                    const table = function(...args) {
                        outputPane.innerHTML += '<div>' + JSON.stringify(args) + '</div>';
                        outputPane.scrollTop = outputPane.scrollHeight;
                    };
                    (new Function('log', 'table', code))(log, table);
                } catch (err) {
                    outputPane.innerHTML += '<div style="color: red;">' + err + '</div>';
                    outputPane.scrollTop = outputPane.scrollHeight;
                }
            });
        });
    }

    function makeDraggable(element, handle) {
        let offsetX = 0, offsetY = 0, mouseX = 0, mouseY = 0;
        handle.onmousedown = function(e) {
            e.preventDefault();
            offsetX = element.offsetLeft;
            offsetY = element.offsetTop;
            mouseX = e.clientX;
            mouseY = e.clientY;
            document.onmouseup = stopDragging;
            document.onmousemove = dragElement;
        };

        function dragElement(e) {
            e.preventDefault();
            const dx = e.clientX - mouseX;
            const dy = e.clientY - mouseY;
            element.style.left = offsetX + dx + 'px';
            element.style.top = offsetY + dy + 'px';
        }

        function stopDragging() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    function initEditorWindow() {
        injectHTML(`
            <div id="editor-window" class="draggable resizable">
                <div id="editor-header">
                    <span>Monaco Editor</span>
                    <button id="close-editor">X</button>
                </div>
                <div id="editor-container" style="flex: 1; overflow: hidden;"></div>
                <button id="run-button" style="width: 100%; background: #4CAF50; color: white; border: none; padding: 10px;">Run</button>
                <div id="output-pane" style="height: 100px; overflow-y: auto; background: #f0f0f0; border-top: 1px solid #ccc; padding: 5px;"></div>
            </div>
        `);

        injectStyle(`
            #editor-window {
                position: fixed;
                top: 50px;
                left: 50px;
                width: 600px;
                height: 400px;
                border: 1px solid #ccc;
                background: #fff;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                resize: both;
                overflow: auto;
            }
            #editor-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #ddd;
                padding: 5px;
                cursor: move;
            }
            #editor-container {
                flex: 1;
                overflow: hidden;
            }
        `);

        makeDraggable(document.getElementById('editor-window'), document.getElementById('editor-header'));

        document.getElementById('close-editor').addEventListener('click', () => {
            document.getElementById('editor-window').remove();
        });

        injectScript('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.30.1/min/vs/loader.js', initMonacoEditor);
    }

    initEditorWindow();
})();

```

