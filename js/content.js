
/**
 * Perooz class and function
 * @return {[type]} [description]
 */
var Perooz = (function() { //encapsulated in Perooz variable - have static variables and private functions
	
	// this reference
	var _this;

	// Constructor
	function Perooz() {
		_this = this;
		this.setupReceiver();
	}
	
	Perooz.prototype = {

		// Public functions
		constructor : Perooz,
		sidebarTransitionDuration : 400,
        $mouseicon : null,
        sess_cookie: null,
        pz_article_id : null,
        article_url : null,
        mouseiconPosition: {
            top: -9999, 
            left: -9999
        },

        /*--------------------------------------------------------------*/
        /*Open sidebar for note creation*/
	    activateCreateSidebar: function(selection){
        	var $body = $('body');
        	var $peroozSidebar = $('.peroozStyle#peroozSidebar');

            /*Animate body to withdraw*/
        	$body.animate({
        		'width': $body.width() - $peroozSidebar.width()
        	},this.sidebarTransitionDuration);

            /*Animate sidebar to come out*/
        	$peroozSidebar.animate({
            	'margin-right': 0
        	}, this.sidebarTransitionDuration,function(){
                $peroozSidebar.attr('padding-left', '1.5em');
                $peroozSidebar.attr('padding-right', '1.5em');
            });

            /*If session token is not present*/
            if (_this.sess_cookie == null){
                $peroozSidebar.html('<button id="peroozClose" class="peroozStyle">close</button> \
                                     <div id="peroozMain" class="peroozStyle"> \
                                        <div id="peroozTxt" class="peroozStyle">Error! Session token expired. Please login again.</div> \
                                     </div>');
                $(".peroozStyle#peroozClose").on('click',function(){
                    _this.deactivateSidebar();
                });
                return; 
            }

            /*If text length is not greater than 0*/
            if (selection.length <= 0){
                console.log(selection);
                $peroozSidebar.html('<button id="peroozClose" class="peroozStyle">close</button> \
                                     <div id="peroozMain" class="peroozStyle"> \
                                        <div id="peroozTxt" class="peroozStyle">Error! Must select text before making annotation.</div> \
                                     </div>');
                $(".peroozStyle#peroozClose").on('click',function(){
                    _this.deactivateSidebar();
                });
                return;
            }
       
            //set perooz sidebar menu
    		$peroozSidebar.html('<div id="peroozBody" class="peroozStyle"> \
                                     <button id="peroozClose" class ="peroozStyle">close</button> \
                                     <div id="peroozMain" class="peroozStyle"> \
                                        <div id="peroozTxt" class="peroozStyle"> "' + selection + '"<div><br/> \
        					            <input id="peroozNote" class="peroozStyle"></input><br/> \
        					            <button id="peroozSubmit" class="peroozStyle">submit</button> \
                                        <div id="peroozMessage" class="peroozStyle"></div> \
                                     </div> \
                                 </div>');
            
            //event function for closing the sidebar
    		$(".peroozStyle#peroozClose").on('click',function(){
    			_this.deactivateSidebar();
    		});

            //submit annotation to temp db
    		$(".peroozStyle#peroozSubmit").on('click',function(){
    			if ($(".peroozStyle#peroozNote").val().length > 0){
    				var annotation = $(".peroozStyle#peroozNote").val().length;
                    var result = _this.createNote(selection,annotation);
                    //$(".peroozStyle#peroozMessage").html('Annotation successfully created!')
    			}else{
    				$(".peroozStyle#peroozMessage").html('Annotation cannot be blank.');
    			}
    		});
        },

        /*When notegroup icon is pressed, sidebar comes out*/
        activateReadSidebar: function(notegroup_id){
          	var $body = $('body');
          	var $peroozSidebar = $('.peroozStyle #peroozSidebar');
            
            var $body = $('body');
        	var $peroozSidebar = $('.peroozStyle#peroozSidebar');

            /*Animate body to withdraw*/
        	$body.animate({
        		'width': $body.width() - $peroozSidebar.width()
        	},this.sidebarTransitionDuration);

            /*Animate sidebar to come out*/
        	$peroozSidebar.animate({
            	'margin-right': 0
        	}, this.sidebarTransitionDuration,function(){
                $peroozSidebar.attr('padding-left', '1.5em');
                $peroozSidebar.attr('padding-right', '1.5em');
            });

        	/*If session token is not present*/
            if (_this.sess_cookie == null){
                $peroozSidebar.html('<button id="peroozClose" class="peroozStyle">close</button> \
                                     <div id="peroozMain" class="peroozStyle"> \
                                        <div id="peroozTxt" class="peroozStyle">Error! Session token expired. Please login again.</div> \
                                     </div>');
                $(".peroozStyle#peroozClose").on('click',function(){
                    _this.deactivateSidebar();
                });
                return; 
            }

            /*Set general properties of the page*/
            //set perooz sidebar menu
    		$peroozSidebar.html('<div id="peroozBody" class="peroozStyle"> \
                                     <button id="peroozClose" class ="peroozStyle">close</button> \
                                     <div id="peroozMain" class="peroozStyle"> \
                                        <div id="peroozMessage" class="peroozStyle"></div> \
                                     </div> \
                                 </div>');
            
            //event function for closing the sidebar
    		$(".peroozStyle#peroozClose").on('click',function(){
    			_this.deactivateSidebar();
    		});

            var pz_contributor_id = null; 

            /*Grab contributor id from session cookie*/
            var xhr = new XMLHttpRequest();
            var url = "https://dev.perooz.io/api/auth/get_contrib_from_sess.php"; 
            xhr.open("GET", url, false); //note that this is a synchronous request
            xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
            xhr.setRequestHeader("Client-Id","13adfewasdf432dae");
            xhr.setRequestHeader("Session-Token",_this.sess_cookie);
            xhr.onreadystatechange = function(){
                if (xhr.readyState == 4){
                    var raw_data = xhr.responseText;
                    var data=JSON.parse(raw_data);

                    if (xhr.status == 200 && data.message == "OK"){
                        pz_contributor_id = data.perooz_contributor_id;
                    }
                }
            }
            xhr.send();

    		/*Grab notes for notegroup and place in the page*/
    		var xhr = new XMLHttpRequest();
            var url = "https://dev.perooz.io/api/notegroups/" + notegroup_id + "/note_lists"; 
            xhr.open("GET", url, false); //note that this is a synchronous request
            xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
            xhr.setRequestHeader("Client-Id","13adfewasdf432dae");
            xhr.setRequestHeader("Session-Token",_this.sess_cookie);
            xhr.onreadystatechange = function(){
            	if (xhr.readyState == 4){
            		var raw_data = xhr.responseText;
                    var data=JSON.parse(raw_data);

            		if (xhr.status == 200){
            			
            			var notelist_array = data.values;
                        var notelist_arrayLength = notelist_array.length; //grab list of notes for notegroup

                        for (var i=0; i< notelist_arrayLength; i++){ //iterate through notelist
                            console.log(notelist_array[i]);

                            var note_id = notelist_array[i]; //grab note details for each note
                            
                            /*Set request for note details*/
                            var xhr1 = new XMLHttpRequest(); 
                            var url1 = "https://dev.perooz.io/api/notes/" + notelist_array[i];
                            xhr1.open("GET",url1,false); //synchronous request
                            xhr1.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
                            xhr1.setRequestHeader("Client-Id","13adfewasdf432dae");
                            xhr1.setRequestHeader("Session-Token",_this.sess_cookie);
                            xhr1.onreadystatechange = function(){
                            	if (xhr1.readyState == 4){
                            		
                            		var raw_data1 = xhr1.responseText;
                                   	var data1 =JSON.parse(raw_data1);

                            		if (xhr1.status == 200){

                            			var note = data1.values;

                            			var note_inline = note.inline_text;
                            			var note_text =  note.note_text;
                                        var note_contributor_id = note.perooz_contributor_id;
                            			
                      					//display note and contributor details
                      					$('#peroozMain').append('<div id="' + notelist_array[i] + '" class="peroozStyle peroozNote"> \
                      												<div id="peroozNoteInline" class="peroozStyle">' + note_inline + '</div> <br/><br/> \
                      												<div id="peroozNoteText" class="peroozStyle">' + note_text + '</div> <br/><br/> \
                      										    </div>');

                                        //check if annotation is by this contributor
                                        if (pz_contributor_id == note_contributor_id){
                                            $('#' + notelist_array[i]).append('<button class="peroozStyle peroozNote" id="' + notelist_array[i] + '"></button><br/>');

                                            $('#' + notelist_array[i]).on('click',function(){
                                                $('#' + notelist_array[i]).append('<input id="peroozNoteEdit" class="peroozStyle"></input><br/> \
                                                                               <button class="peroozStyle" id="peroozNoteEditSave"></button> \
                                                                               <button class="peroozStyle" id="peroozNoteEditCancel"></button>');
                                            });


                                        }

                                        



                      					//add an line image afer note if not the last in the notegroup
                      						
                            		}
                            	}
                            }
                            xhr1.send();

                        }

            		}
            	}
            }
            xhr.send();

        },

        /*Hide sidebar*/
        deactivateSidebar: function(){
            var $body = $('body');
        	var $peroozSidebar = $(".peroozStyle#peroozSidebar");
            var $peroozBody = $(".peroozStyle#peroozBody");

        	$peroozBody.remove();

            //animate body to fill page
        	$body.animate({
        		'width': '100%'
        	},this.sidebarTransitionDuration);

            //animate sidebar to disappear
        	$peroozSidebar.animate({
            	'margin-right': '-360px'
        	}, this.sidebarTransitionDuration,function(){
                $peroozSidebar.attr('padding-left', '0');
                $peroozSidebar.attr('padding-right', '0');
            });
        },

        /*--------------------------------------------------------------*/
        /*SET OF FUNCTIONS RELATING TO ANNOTATIONS*/
        /*Create Note*/
        createNote: function(selection,note){
            var $body = $('body');
            var $peroozSidebar = $(".peroozStyle#peroozSidebar");

            var message = '';
            var in_db = false;

            /*Retrieve session token*/
            if (!_this.sess_cookie){
                $(".peroozStyle#peroozMessage").html('Session token expired. Please refresh page.');
                return;
            }

            var pz_contributor_id = null; 

            /*Grab contributor id from the database if it is present*/
            var xhr = new XMLHttpRequest();
            var url = "https://dev.perooz.io/api/auth/get_contrib_from_sess.php"; 
            xhr.open("GET", url, false); //note that this is a synchronous request
            xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
            xhr.setRequestHeader("Client-Id","13adfewasdf432dae");
            xhr.setRequestHeader("Session-Token",_this.sess_cookie);
            xhr.onreadystatechange = function(){
                if (xhr.readyState == 4){
                    var raw_data = xhr.responseText;
                    var data=JSON.parse(raw_data);

                    if (xhr.status == 200 && data.message == "OK"){
                        pz_contributor_id = data.perooz_contributor_id;
                    }
                }
            }
            xhr.send();
            if (!pz_contributor_id){
                $(".peroozStyle#peroozMessage").html('Insufficient permission to create annotation.');
                return;
            }


            /*Check if article in db*/
            var article_selector = $peroozSidebar.has(".peroozStyle#perooz_article_id").length; //.innerText();
            if (article_selector){
                _this.pz_article_id = $(".peroozStyle#perooz_article_id").innerText();
            }
            console.log(_this.pz_article_id);
            if (!_this.pz_article_id){ //if not in db, add current article to db
                console.log('hehe');
                console.log(_this.article_url);
                //grab article url
                var xhr = new XMLHttpRequest();
                var url = "https://dev.perooz.io/api/articles"; 
                xhr.open("POST", url, false); //note that this is a synchronous request
                xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
                xhr.setRequestHeader("Client-Id","13adfewasdf432dae");
                xhr.setRequestHeader("Session-Token",_this.sess_cookie);
                xhr.onreadystatechange = function(){
                    if (xhr.readyState == 4){
                        var raw_data = xhr.responseText;
                        var data=JSON.parse(raw_data);

                        if (xhr.status == 200 && data.message == "OK"){
                            _this.pz_article_id = data.perooz_article_id;
                        }
                    }
                }
                xhr.send("article_hyperlink=" + _this.article_url + "&approved=0");
            }

            /*If article not properly inserted into db*/
            if (!_this.pz_article_id){
               $(".peroozStyle#peroozMessage").html('Unable to save. Please try again.');
                return;
            }

            /*Create annotation*/
            xhr = new XMLHttpRequest();
            var url = "https://dev.perooz.io/api/notes"; 
            xhr.open("POST", url, false);
            xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
            xhr.setRequestHeader("Client-Id","13adfewasdf432dae");
            xhr.setRequestHeader("Session-Token",_this.sess_cookie);
            xhr.onreadystatechange = function(){
                if (xhr.readyState == 4){
                    var raw_data = xhr.responseText;
                    var data=JSON.parse(raw_data);

                    if (xhr.status == 200){
                        pz_note_id =  data.values; 
                    }
                }
            }
            xhr.send("perooz_contributor_id=" + pz_contributor_id + "&perooz_article_id=" + _this.perooz_article_id + "&note_type_id=2&inline_text=" + selection + "&note_text=" + note + "&approved=0");

            if (pz_note_id){
                message = "Note successfully created!";
            }else{
                message = 'Error creating annotation. Please try again.';
            }
            $(".peroozStyle#peroozMain").html('<div id="peroozMessage" class="peroozStyle">' + message + '</div>');
            
        },

        /*Fxns relating to annotation insertion----------------------------------------------------------------------------------*/
        /*insert Annotations into the Page*/
        setNotes: function(perooz_article_id){
            var $body = $('body');
            var $peroozSidebar = $(".peroozStyle#peroozSidebar");

            console.log(perooz_article_id); 
            
            /*Insert hidden div tag into perooz sidebar*/
            $peroozSidebar.append('<div id="perooz_article_id" class="peroozStyle" style="visibility:hidden;">' + perooz_article_id + '</div>');

            /*(1) Grab notegroup array from background page and display*/
            var xhr = new XMLHttpRequest();
            var url = "https://dev.perooz.io/api/articles/" + perooz_article_id + "/notegroup_lists"; 
            xhr.open("GET", url, false); //note that this is a synchronous request
            xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
            xhr.setRequestHeader("Client-Id","13adfewasdf432dae");
            xhr.setRequestHeader("Session-Token",_this.sess_cookie);
            xhr.onreadystatechange = function(){
                if (xhr.readyState == 4){
                    var raw_data = xhr.responseText;
                    var data=JSON.parse(raw_data);

                    if (xhr.status == 200){
                        console.log('Succesfully grabbed annotations.');
                        
                        var notegroup_array = data.values;
                        var notegroup_arrayLength = notegroup_array.length; 

                         /*(2) Go through each item in notegroup array*/ 
                         for (var i=0; i< notegroup_arrayLength; i++){
                            console.log(notegroup_array[i]);

                            /*Create get request to pull notegroup information*/
                            var xhr1 = new XMLHttpRequest(); 
                            var url1 = "https://dev.perooz.io/api/notegroups/" + notegroup_array[i];
                            xhr1.open("GET",url1,false); //synchronous request
                            xhr1.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
                            xhr1.setRequestHeader("Client-Id","13adfewasdf432dae");
                            xhr1.setRequestHeader("Session-Token",_this.sess_cookie);
                            xhr1.onreadystatechange = function(){
                                if (xhr1.readyState == 4){
                                    var raw_data1 = xhr1.responseText;
                                    var data1 =JSON.parse(raw_data1);
                                    if (xhr1.status == 200){
                                        var notegroup_info = data1.values;
                                        var img_url = chrome.extension.getURL("images/icon_mini.png");

                                        var needle = notegroup_info.note_text_overlap;
                                        var haystack = document.body;

                                        needle = _this.getLastWords(needle, 3); //first grab last three words in annotation overlap
                                        replacement = needle + ' <button style="background:url(' + img_url + ');background-repeat: no-repeat;height:16px;width:15px;margin:0px;padding:1px;border:0px;display:inline-block;" id="'+ notegroup_array[i] +'" class="peroozStyle peroozNotegroup"></button>'; //div tag with relevant info 
                                        _this.findAndReplace(needle, replacement, haystack);

                                    }
                                }
                            }
                            xhr1.send();

                         }

                         /*Set event listener for icon click*/
                         $('.peroozNotegroup').on('click',function(){
                            _this.activateReadSidebar(this.id);
                         });
                        

                    }else{
                        console.log('Unable to fetch annotations.');       
                    }
                }
            }
            xhr.send();

        },

        /*Remove article id and annotations from article*/
        removeNotes: function(){
            $(".peroozStyle#perooz_article_id").remove();
            $(".peroozNotegroup").remove(); 
        },

        //if greater than 4 words, grab last 3 letters
        //if less, grab n-1 letters
        //cannot annotate less than 2 words
        getLastWords: function(words, wordCount){
            result = words.split(" ");
            result = result.slice(Math.max(result.length - wordCount, 1)).join(" "); 
            return result;
        },

        /*Find and replace certain text in a page*/
        /*Searching for last 3 words of annotation*/

        findAndReplace: function(searchText, replacement, searchNode) {
            // See http://james.padolsey.com/javascript/find-and-replace-text-with-javascript/
            
            if (!searchText || typeof replacement === 'undefined') {
                // Throw error here if you want...
                console.log('not working');
                return;
            }

            /*Set regex value*/
            var regex = typeof searchText === 'string' ?
                        new RegExp(searchText,'g') : searchText;

            /*determine child notes*/
            var childNodes = (searchNode || document.body).childNodes;
            var cnLength = childNodes.length;
            var excludes = 'html,head,style,title,link,meta,script,object,iframe';

            //walks the tree and goes to child nodes simultaneously 
            while (cnLength--) {
                var currentNode = childNodes[cnLength]; //grab last node first. work bottom to top
                if (currentNode.nodeType === 1 &&
                    (excludes + ',').indexOf(currentNode.nodeName.toLowerCase() + ',') === -1) { //if node is element node (not text) and not one of the forbidden types (blacklisted)
                    //argument.callee is recursive - calling findAndReplace within itself - makes parent node child node
                    arguments.callee(searchText, replacement, currentNode);
                }


                //if node is not a text node or string node contained in current node - continue (skip over current iteration)
                if (currentNode.nodeType !== 3 || !regex.test(currentNode.data) ) {  
                    continue;
                }

                /*If there is a match - this code runs*/
                var parent = currentNode.parentNode,
                    frag = (function(){
                        var html = currentNode.data.replace(regex, replacement),
                            wrap = document.createElement('div'),
                            frag = document.createDocumentFragment();
                        wrap.innerHTML = html;
                        while (wrap.firstChild) {
                            frag.appendChild(wrap.firstChild);
                        }
                        return frag;
                    })();
                parent.insertBefore(frag, currentNode);
                parent.removeChild(currentNode);
            }
        },

        /*SET OF FUNCTIONS RELATING TO MOUSEUP--------------------*/
        /*Set hidden annotation div tag on Page*/
        setupMouseicon : function(){
            mouseiconHTML = '<button id="perooz-mouseicon" class="peroozStyle"> + </button>';
            $('body').append(mouseiconHTML);
            _this.$mouseicon = $('.peroozStyle#perooz-mouseicon').css({
                top: _this.mouseiconPosition.top,
                left: _this.mouseiconPosition.left
            })
        },

        /*Set listener for mouseup*/
        attachObservers: function(){
            $(window).on("mouseup.peroozHandler",function(){
                var selection = window.getSelection(); 

                //if text in a range is selected
                if (selection.type.toLowerCase() === 'range' && selection.toString().length > 0){ 
                    var selectionRange = selection.getRangeAt(0); //range object
                    var selectionNode = selectionRange.startContainer.parentNode; //parent node of range object

                    //search for parent node that is a block
                    while ( $(selectionNode).css('display') !== 'block' ){
                        selectionNode = $(selectionNode).parent().get(0);
                    }

                    var selectionRangeBoundingRect = selectionRange.getBoundingClientRect(); //bounding rectangle for selected text
                    var selectionNodeBoundingRect = selectionNode.getBoundingClientRect(); //block Node bounding rectangle

                    //show mouseicon and relocate to correct position 
                    _this.placeMouseicon( selectionRangeBoundingRect, selectionNodeBoundingRect);
                    _this.showMouseicon(selection.toString());

                }else{ //if no text selected, mouse icon is hidden
                    _this.hideMouseicon();
                }

            });
        },

        placeMouseicon : function(rangeBoundingRect, nodeBoundingRect){
            if ( typeof(rangeBoundingRect) !== 'undefined' && typeof(nodeBoundingRect) !== 'undefined' ) {
                this.mouseiconPosition = {
                    top : $(window).scrollTop() + rangeBoundingRect.top,
                    left: $(window).scrollLeft() + nodeBoundingRect.right
                }
            }
        },

        //show Mouseicon and move to correct location
        showMouseicon: function(selection){
            this.$mouseicon.css({
                top : this.mouseiconPosition.top,
                left : this.mouseiconPosition.left
            }).addClass('active');
            $('.peroozStyle.active#perooz-mouseicon').on('click',function() {
                _this.activateCreateSidebar(selection); //on click on mouseup icon, sidebar comes out
                _this.hideMouseicon(); //remove the icon
            });
        },

        //move icon back to its hidden position by removing class with details
        hideMouseicon: function(){
            this.$mouseicon.removeClass('active');
        },

        /*--------------------------------------------------------*/
        /*SET OF FUNCTIONS REMOVING THE MOUSEUP*/
        removeObservers: function(){
            /*Turn off all window event listeners*/
            console.log('wohoo!');
            $(window).off("mouseup.peroozHandler");
        },

        removeMouseicon: function(){
            $('.peroozStyle#perooz-mouseicon').remove();
            _this.$mouseicon = null;
        },

        /*--------------------------------------------------------*/
        /*Set Reminder Fxn*/
        setReminder: function(){

        },

        /*--------------------------------------------------------*/
        /*Set message listener to listen to messages*/
		setupReceiver : function() {
            chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

                //setup mouseicon listener
                if (request.method == "setupMouseiconEvent"){
                    console.log('setMouseupevent');
                    _this.article_url = request.article_url;
                    _this.setupMouseicon(); 
                    _this.attachObservers(); 
                    sendResponse({message: "OK"});
                
                //remove mouseicon listener
                }else if(request.method == "removeMouseiconEvent"){
                    console.log('removeMouseupevent'); 
                    _this.removeObservers();
                    _this.removeMouseicon();
                    sendResponse({message: "OK"});

                //annotation creation message
            	}else if (request.method == "getSelection"){
            		console.log('message received');
            		var select = window.getSelection().toString();
            		_this.activateCreateSidebar(select);
            		sendResponse({message: "OK"});

                //insert notes into DOM 
               	}else if(request.method == "setNotes"){
                    _this.setNotes(request.perooz_article_id);
                    console.log('setNotes');
                    sendResponse({message: "OK"});

                //read notes
                }else if(request.method == "readNotes"){
                    _this.activateReadSidebar;
                    sendResponse({message: "OK"});
                
                //remove annotations
                }else if(request.method == "removeNotes"){
                    _this.removeNotes();
                    sendResponse({message: "OK"});

                //set reminder to log in to page
               	}else if(request.method == "setReminder"){
                    console.log('HAPPENED');
                    _this.setReminder;
               		sendResponse({message: "OK"});

                //set session token - upon user login or tab refresh
                }else if(request.method == "setSess"){
                    _this.sess_cookie = request.sess_cookie;
                    sendResponse({message: "OK"});

                //remove session token [if user logs out]
                }else if(request.method == "removeSess"){
                    if (_this.sess_cookie != null){
                        _this.sess_cookie = null;
                    }
                    if (_this.pz_article_id != null){
                        _this.pz_article_id = null;
                    }
                    if (_this.article_url != null){
                        _this.article_url = null;
                    }
                    sendResponse({message: "OK"});
                }
            });
        }
        
	}
	
	return Perooz;
})();

window.perooz = new Perooz();

jQuery(function(){
	$('body').append('<div id="peroozSidebar" class="peroozStyle"></div>');
})