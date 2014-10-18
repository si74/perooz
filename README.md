perooz
======

PeroozV1
Inital iteration of the chrome extension. 

Consists of following: 
(1) Manifest.json - chrome extension manifest file
(2) js/Background.js - background script for extension
(3) js/content.js - content script that iteracts with the actual web page 
(4) js/popup.js - browser action file [what happens when you click on the extension button] 
(5) style/inject.css - style for content script
(6) style/style.css - style for popup

To test unpacked extension in chrome browser: 
(1) Clone is desktop
(2) Select developer mode in top right-hand corner in chrome://extensions
(3) Click load unpacked extension and select directory containing all the extension files. 
(4) Make sure unpacked extension is enabled and test! 
