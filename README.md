perooz - Chrome extension for website annotation. 
======

Perooz
Inital iteration of the Perooz annotation chrome extension. 
<br/><br/>
This repository consists of only client-side code meant to be run within the browser. To set up server side architecture - look at perooz - Backend code. <br/><br/>

Consists of following: <br/>
(1) Manifest.json - chrome extension manifest file<br/>
(2) js/Background.js - background script for extension<br/>
(3) js/content.js - content script that iteracts with the actual web page <br/>
(4) js/popup.js - browser action file [what happens when you click on the extension button] <br/>
(5) style/inject.css - style for content script<br/>
(6) style/style.css - style for popup<br/>
<br/>
<br/>
To test unpacked extension in chrome browser: <br/> 
(1) Clone is desktop<br/>
(2) Select developer mode in top right-hand corner in chrome://extensions<br/>
(3) Click load unpacked extension and select directory containing all the extension files. <br/>
(4) Make sure unpacked extension is enabled and test! <br/>
