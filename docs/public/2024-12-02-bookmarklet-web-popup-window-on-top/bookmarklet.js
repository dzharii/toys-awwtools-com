javascript:(function(){
    /* Create a function to initialize the bookmarklet */
    const initializeBookmarklet = () => {
        console.log('#a1b2c3d4e5f Initializing bookmarklet...');
        /* Avoid creating multiple instances of the window */
        if (document.getElementById('custom-draggable-window')) {
            alert('The custom search window is already open!');
            console.log('#g6h7i8j9k0l Custom search window is already open, aborting initialization.');
            return;
        }

        /* Create a form to get search provider and query */
        const createSearchForm = () => {
            console.log('#m1n2o3p4q5r Creating search form...');
            const form = document.createElement('div');
            form.id = 'custom-search-form';
            form.style.position = 'fixed';
            form.style.top = '20px';
            form.style.left = '20px';
            form.style.padding = '10px';
            form.style.backgroundColor = 'white';
            form.style.border = '1px solid #ccc';
            form.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            form.style.zIndex = '9999';

            form.innerHTML = `
                <label for="search-provider">Search Provider:</label>
                <select id="search-provider" style="margin-right:10px;">
                    <option value="https://www.google.com/search?q=__SEARCH_PHRASE__">Google</option>
                    <option value="https://www.bing.com/search?q=__SEARCH_PHRASE__">Bing</option>
                    <option value="https://www.yelp.com/search?find_desc=__SEARCH_PHRASE__">Yelp</option>
                    <option value="https://copilot.microsoft.com/?q=__SEARCH_PHRASE__&sendquery=1&form=HECODX&showconv=1">MS Copilot</option>
                </select>
                <input type="text" id="search-query" placeholder="Enter your search query" style="margin-right:10px;"/>
                <button id="search-go" style="margin-right:5px;">Go</button>
                <button id="search-cancel">Cancel</button>
            `;

            /* Append to the document body */
            document.body.appendChild(form);
            console.log('#s6t7u8v9w0x Search form added to the document body.');

            /* Add event listeners for the buttons */
            document.getElementById('search-go').addEventListener('click', () => {
                console.log('#y1z2a3b4c5d Go button clicked.');
                const provider = document.getElementById('search-provider').value;
                const query = document.getElementById('search-query').value;
                if (!query.trim()) {
                    alert('Please enter a search query.');
                    console.log('#e6f7g8h9i0j Search query is empty, alerting user.');
                    return;
                }
                console.log(`#k1l2m3n4o5p Creating draggable window with URL: ${provider.replace('__SEARCH_PHRASE__', encodeURIComponent(query))}`);
                createDraggableWindow(provider.replace('__SEARCH_PHRASE__', encodeURIComponent(query)));
                form.remove();
                console.log('#q6r7s8t9u0v Search form removed after submission.');
            });

            document.getElementById('search-cancel').addEventListener('click', () => {
                console.log('#w1x2y3z4a5b Cancel button clicked, removing search form.');
                form.remove();
            });
        };

        /* Create a draggable and resizable window */
        const createDraggableWindow = (url) => {
            console.log('#c6d7e8f9g0h Creating draggable window...');
            const windowDiv = document.createElement('div');
            windowDiv.id = 'custom-draggable-window';
            windowDiv.style.position = 'fixed';
            windowDiv.style.top = '100px';
            windowDiv.style.left = '100px';
            windowDiv.style.width = '800px';
            windowDiv.style.height = '400px';
            windowDiv.style.backgroundColor = 'white';
            windowDiv.style.border = '2px solid #333';
            windowDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            windowDiv.style.resize = 'both';
            windowDiv.style.overflow = 'hidden';
            windowDiv.style.zIndex = '10000';

            /* Header bar for dragging and close button */
            const header = document.createElement('div');
            header.style.backgroundColor = '#333';
            header.style.color = 'white';
            header.style.padding = '10px';
            header.style.cursor = 'move';
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'center';

            const title = document.createElement('div');
            title.innerText = 'Custom Search Window';

            const closeButton = document.createElement('button');
            closeButton.innerText = 'X';
            closeButton.style.backgroundColor = 'red';
            closeButton.style.color = 'white';
            closeButton.style.border = 'none';
            closeButton.style.cursor = 'pointer';
            closeButton.style.padding = '5px';
            closeButton.style.marginLeft = '10px';

            /* Close button functionality */
            closeButton.addEventListener('click', () => {
                console.log('#i1j2k3l4m5n Close button clicked, removing draggable window.');
                windowDiv.remove();
            });

            header.appendChild(title);
            header.appendChild(closeButton);
            windowDiv.appendChild(header);

            /* Read-only URL bar */
            const urlBar = document.createElement('input');
            urlBar.type = 'text';
            urlBar.value = url;
            urlBar.readOnly = true;
            urlBar.style.width = '100%';
            urlBar.style.boxSizing = 'border-box';
            urlBar.style.padding = '10px';
            urlBar.style.border = 'none';
            urlBar.style.borderBottom = '1px solid #ccc';

            windowDiv.appendChild(urlBar);
            console.log('#o6p7q8r9s0t URL bar added to draggable window.');

            /* Iframe to display the search page */
            const iframe = document.createElement('iframe');
            iframe.src = url;
            iframe.style.width = '100%';
            iframe.style.height = 'calc(100% - 71px)';
            iframe.style.border = 'none';

            windowDiv.appendChild(iframe);
            console.log('#u1v2w3x4y5z Iframe added to draggable window with URL:', url);

            /* Append the window to the document body */
            document.body.appendChild(windowDiv);
            console.log('#a6b7c8d9e0f Draggable window added to the document body.');

            /* Make the window draggable */
            makeDraggable(windowDiv, header);
        };

        /* Function to make a div draggable */
        const makeDraggable = (element, handle) => {
            console.log('#g1h2i3j4k5l Making the window draggable...');
            let isDragging = false;
            let offsetX, offsetY;

            handle.addEventListener('mousedown', (e) => {
                console.log('#m6n7o8p9q0r Mouse down on header, starting drag...');
                isDragging = true;
                offsetX = e.clientX - element.getBoundingClientRect().left;
                offsetY = e.clientY - element.getBoundingClientRect().top;
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });

            const onMouseMove = (e) => {
                if (!isDragging) return;
                console.log(`#s1t2u3v4w5x Dragging window to position (${e.clientX - offsetX}, ${e.clientY - offsetY})`);
                const left = e.clientX - offsetX;
                const top = e.clientY - offsetY;
                element.style.left = `${Math.max(0, Math.min(window.innerWidth - element.offsetWidth, left))}px`;
                element.style.top = `${Math.max(0, Math.min(window.innerHeight - element.offsetHeight, top))}px`;
            };

            const onMouseUp = () => {
                if (isDragging) {
                    console.log('#y6z7a8b9c0d Mouse up, ending drag.');
                }
                isDragging = false;
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };
        };

        /* Initialize the search form */
        createSearchForm();
    };

    /* Start the bookmarklet */
    console.log('#e1f2g3h4i5j Starting bookmarklet...');
    initializeBookmarklet();
})();
