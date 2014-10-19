
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
        mouseiconPosition: {
            top: -9999, 
            left: -9999
        },

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
                //    _this.createNote(selection);
                    $(".peroozStyle#peroozMessage").html('Annotation successfully created!')
    			}else{
    				$(".peroozStyle#peroozMessage").html('Annotation cannot be blank.');
    			}
    		});
        },

        // activateReadSidebar: function(notegroup_id,noteid){
        //  	var $body = $('body');
        //  	var $peroozSidebar = $('.peroozStyle #peroozSidebar');
            
        // },
        
        /*Create Note*/
        // createNote: function(selection){
        //     var $body = $('body');
        //     var $peroozSidebar = $(".peroozStyle#peroozSidebar");

        //     var message = '';
        //     var in_db = false;

        //     /*Retrieve session token*/
        //     

        //         /*Check if article in db*/
        //         var perooz_article_id = $peroozSidebar.has(".peroozStyle#perooz_article_id").innerText()
        //         if (!perooz_article_id){ //if not in db, add current article
        //             //check if source in db
                    
        //             //check if author in db
        //         }

        //         /*Create annotation*/
        //         xhr = new XMLHttpRequest();
        //         var url = "https://dev.perooz.io/api/articles"; 
        //         xhr.open("POST", url, true);
        //         xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
        //         xhr.setRequestHeader("Client-Id","13adfewasdf432dae");
        //         xhr.setRequestHeader("Session-Token",cookie.value);
        //         xhr.onreadystatechange = function(){
        //             if (xhr.readyState == 4){
        //                 if (xhr.status == 200){
        //                     message = 'Annotation successfully created!';
        //                 }else{
        //                     message = 'Error creating annotation. Please try again.';
        //                 }
        //             }
        //         }
        //         xhr.send("");

        //     $(".peroozStyle#peroozMain").html('<div id="peroozMessage" class="peroozStyle">' + message + '</div>');
        // },

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
            xhr.open("GET", url, true);
            xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
            xhr.setRequestHeader("Client-Id","13adfewasdf432dae");
            xhr.setRequestHeader("Session-Token",cookie.value);
            xhr.onreadystatechange = function(){
                if (xhr.readyState == 4){
                    var raw_data = xhr.responseText;
                    var data=JSON.parse(raw_data);

                    if (xhr.status == 200){
                        console.log('Succesfully grabbed annotations.');
                        
                        var notegroup_array = data.values;
                        console.log(notegroup_array);

                         /*(2) Go through each item in notegroup array*/ 
                        

                    }else{
                        console.log('Unable to fetch annotations.');       
                    }
                }
            }
            xhr.send();

           

            /*grab text of each notegroup*/

            /*Search for the text in each page*/

            /*Place miniature perooz icon after text*/ 

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
            $(window).on('mouseup',function(){
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

        /*Set message listener to listen to messages*/
		setupReceiver : function() {
            chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

                //setup mouseicon listener
                if (request.method == "setupMouseiconEvent"){
                    console.log('setMouseupevent');
                    _this.setupMouseicon(); 
                    _this.attachObservers(); 
                    sendResponse({message: "OK"});
                
                //annotation creation message
            	}else if (request.method == "getSelection"){
            		console.log('message received');
            		var select = window.getSelection().toString();
            		_this.activateCreateSidebar(select);
            		sendResponse({message: "OK"});

                //insert notes into DOM 
               	}else if(request.method == "setNotes"){
               		sendResponse({message: "OK"});
                    _this.setNotes(request.perooz_article_id);

                //read notes
                }else if(request.method == "readNotes"){
                    sendResponse({message: "OK"});
                    _this.activateReadSidebar;
                
                //set reminder to log in to page
               	}else if(request.method == "setReminder"){
               		sendResponse({message: "OK"});

                //set session token - upon user login or tab refresh
                }else if(request.method == "setSess"){
                    _this.sess_cookie = request.sess_cookie;

                //remove session token [if user logs out]
                }else if(request.method == "removeSess"){
                    if (_this.sess_cookie != null){
                        _this.sess_cookie = null;
                    sendResponse({message: "OK"});

                //if message is not legitimate
               	}else{
               		sendResponse({message: "Unknown"});
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