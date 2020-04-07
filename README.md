# Outlining-Tool
text editor with built in outline editor and collabritive editing. 

# Running Application
To run:
1."npm install" 
2."npm start" 

# Features:
1. Collabritive editing (Connect a second user to same address to see this working).
2. Rich keyboard inputs: CTRL+RIGHTARROW creates new outline, CTRL+DOWNARROW moves element down, CTRL+UPARROW moves element up through levels(Ctrl+down ignores levels for faster traversals) and double enter press closes the tree currently in.
3. Help button ("?" button on header) with text to speech of all feature for disability consideration (click speaker icon for TTS). 
4. Printing on CTRL+P which maintains outline styling
5. Rich text formatting on header.
6. Saves user's changes on page close and loads on page open again.(Can be done on refresh, via save button, tab close or browser close)
7. Clear button to reset document. (click clear button on header) 

# Design and implentation rationale :
1. Creating the outline: To create the outline I have used a unordered list, which contains the "+/-" element, and a text element, then I have another unordered list with the default display of hidden which is changed to display: block when the + element is clicked. 
2. Saving the page: I set event listeners on page unload to retrieve the text area's innerHTML, put this within and object, JSON.strinified the object and sent it to my node server where it was then saved locally in a txt file. Then on page load, there is a event listener which uses AJAX to fetch the contents of the txt file and parse the object saved within. Finally, the innerHTML saved in this object is inserted into the text area to load previous content. 
3. Collabritive editing: I created a websocket in my server.js file and I implemented collabritive editing by having the text area's innerHTML and client's id stored in a object and sent to the websocket when user's made a change, which would then send this data to all clients. When clients recieved the data they would save their current cursor position, replace their current text area's data with the new data then restore the cursor position. 
4. Printing: Simply styled the page in CSS to just show the text area on print. 
5. CTRL UP/DOWN: I first search for the LI element the text node is contained in, then i also search for the UL the LI element is contained in. I then loop through the children of the UL till i find the position of LI and then insert the Li element at pos-1. I also check if there is a tree element above and if there is and the nested list is active, append to the end of that instead. 

