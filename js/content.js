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
        api_url: "https://dev.perooz.io/",
        mouseiconPosition: {
            top: -9999, 
            left: -9999
        },
        localNotes: [],

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

            /*If text only contains less than words*/
            var trimmed_selection = selection.trim();
            var res = trimmed_selection.split(" ");
            if (res.length < 4){
                $peroozSidebar.html('<button id="peroozClose" class="peroozStyle">close</button> \
                                     <div id="peroozMain" class="peroozStyle"> \
                                        <div id="peroozTxt" class="peroozStyle">Error! Annotated text must be a minimum of 4 words.</div> \
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
                                        <div id="peroozCNote" class="peroozStyle" > \
                                            <div id="peroozNoteInline" class="peroozStyle"> "' + selection + '"</div> \
            					            <input id="peroozCreateNote" class="peroozStyle"></input><br/> \
            					            <button id="peroozSubmit" class="peroozStyle">submit</button> \
                                        </div> \
                                        <div id="peroozMessage" class="peroozStyle"></div> \
                                     </div> \
                                 </div>');
            
            //event function for closing the sidebar
    		$(".peroozStyle#peroozClose").on('click',function(){
    			_this.deactivateSidebar();
    		});

            //submit annotation to temp db
    		$(".peroozStyle#peroozSubmit").on('click',function(){
    			if ($(".peroozStyle#peroozCreateNote").val().length > 0){
    				var annotation = $(".peroozStyle#peroozCreateNote").val();
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

            var start = 0; 
            var max = 10; 

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
                                     <div id="peroozBodyMenu" class="peroozStyle"> \
                                        <button id="pMain" class="peroozStyle" style="background-color:#2a2a2a;">Experts</button> \
                                        <button id="pMain1" class="peroozStyle" style="background-color:#999;">My Notes</button> \
                                        <button id="pMain2" class="peroozStyle" style="background-color:#999;">Sources</button> \
                                     </div> \
                                     <div id="peroozMain" class="peroozStyle"> \
                                        <div id="peroozMessage" class="peroozStyle"></div> \
                                     </div> \
                                 </div>');
            
            //event function for closing the sidebar
    		$(".peroozStyle#peroozClose").on('click',function(){
    			_this.deactivateSidebar();
    		});

            _this.readNotes(notegroup_id);

            $(".peroozStyle#pMain").on('click',function(){
                console.log(notegroup_id);
                $("#peroozMain").html('<div id="peroozMessage" class="peroozStyle"></div>');
                $(this).css("background-color","#2a2a2a");
                $('.peroozStyle#pMain1').css("background-color","#999");
                $('.peroozStyle#pMain2').css("background-color","#999");
                _this.readNotes(notegroup_id);
            });

            $('.peroozStyle#pMain1').on('click',function(){
                $('#peroozMain').html('<div id="peroozMessage" class="peroozStyle"></div>');
                $(this).css("background-color","#2a2a2a");
                $('.peroozStyle#pMain').css("background-color","#999");
                $('.peroozStyle#pMain2').css("background-color","#999");
                _this.readLocalNotes(notegroup_id);
            });

            $('.peroozStyle#pMain2').on('click',function(){
                $('#peroozMain').html('<div id="peroozMessage" class="peroozStyle"></div>');
                $(this).css("background-color","#2a2a2a");
                $('.peroozStyle#pMain').css("background-color","#999");
                $('.peroozStyle#pMain1').css("background-color","#999");
                _this.readSources(_this.article_url);
            });

        },

        /*Load notegroup annotations*/
        readNotes: function(notegroup_id){

            /*Grab notes for notegroup and place in the page*/
            var start_id = 0; 

            var xhr = new XMLHttpRequest();
            var url = _this.api_url + "api/notegroups/" + notegroup_id + "/note_lists" + "?start=" + start_id + "&max=7"; 
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

                            var note_id = notelist_array[i]; //grab note details for each note
                            
                            /*Set request for note details*/
                            var xhr1 = new XMLHttpRequest(); 
                            var url1 = _this.api_url + "api/notes/" + notelist_array[i];
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
                                        var author_name = note.first_name + ' ' + note.last_name;
                                      
                                        //display note and contributor details
                                        $('#peroozMain').append('<div id="' + notelist_array[i] + ' peroozNote" class="peroozStyle" style="background-color:#fff;box-shadow: 0px 0px 10px #d0d0d0;width:340px;margin:10px;"> \
                                                                    <div id="peroozNoteInline" class="peroozStyle">' + note_inline + '</div> \
                                                                    <div id="peroozNoteText" class="peroozStyle">' + note_text + '</div> \
                                                                    <div id="peroozNoteAuthor" class="peroozStyle"> -' + author_name + '</div> \
                                                                </div>');
                                            
                                    }
                                }
                            }
                            xhr1.send();

                        } 

                    }
                }

                start_id += 7; 
            }
            xhr.send();



            $("#peroozMain").bind('scroll',function(){
                if( $(this).scrollTop() == $(this)[0].scrollHeight - $(this).innerHeight() ){
                    
                   /*Preloader not working correctly*/
                   /* var loader_url = chrome.extension.getURL("images/30.gif")
                    $("peroozMain").append('<div id="loader" class="peroozStyle"><img src=' + loader_url + ' /></div>'); */

                    var xhr = new XMLHttpRequest();
                    var url = _this.api_url + "api/notegroups/" + notegroup_id + "/note_lists" + "?start=" + start_id + "&max=3"; 
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

                                    var note_id = notelist_array[i]; //grab note details for each note
                                    
                                    /*Set request for note details*/
                                    var xhr1 = new XMLHttpRequest(); 
                                    var url1 = _this.api_url + "api/notes/" + notelist_array[i];
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
                                                var author_name = note.first_name + ' ' + note.last_name;

                                                /*Preloader not quite working*/
                                                /*$('.peroozStyle#loader').remove();*/
                                                
                                                //display note and contributor details
                                                $('#peroozMain').append('<div id="' + notelist_array[i] + ' peroozNote" class="peroozStyle" style="background-color:#fff;box-shadow: 0px 0px 10px #d0d0d0;width:340px;margin:10px;"> \
                                                                            <div id="peroozNoteInline" class="peroozStyle">' + note_inline + '</div> \
                                                                            <div id="peroozNoteText" class="peroozStyle">' + note_text + '</div> \
                                                                            <div id="peroozNoteAuthor" class="peroozStyle"> -' + author_name + '</div> \
                                                                        </div>');

                                                    
                                            }
                                        }
                                    }
                                    xhr1.send();

                                } 

                            }
                        }

                        start_id += 3; 
                    }
                    xhr.send();
                }
            });

        },

        /*Temporary hack - reads the locally stored user notes*/
        readLocalNotes: function(notegroup_id){

            /*Grab contributor id from user session*/
            var pz_contributor_id = null; 

            // /*Grab contributor id from session cookie*/
            var xhr0 = new XMLHttpRequest();
            var url = _this.api_url + "api/auth/get_contrib_from_sess.php"; 
            xhr0.open("GET", url, false); //note that this is a synchronous request
            xhr0.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
            xhr0.setRequestHeader("Client-Id","13adfewasdf432dae");
            xhr0.setRequestHeader("Session-Token",_this.sess_cookie);
            xhr0.onreadystatechange = function(){
                if (xhr0.readyState == 4){
                    var raw_data0 = xhr0.responseText;
                    var data0=JSON.parse(raw_data0);

                    if (xhr0.status == 200 && data0.message == "OK"){
                        pz_contributor_id = data0.perooz_contributor_id;
                        console.log(pz_contributor_id);

                        /*Grab notes for notegroup and place in the page*/
                        var start_id = 0; 

                        var xhr = new XMLHttpRequest();
                        var url = _this.api_url + "api/notegroups/" + notegroup_id + "/note_lists" + "?start=" + start_id + "&max=7"; 
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

                                        var note_id = notelist_array[i]; //grab note details for each note
                                        
                                        /*Set request for note details*/
                                        var xhr1 = new XMLHttpRequest(); 
                                        var url1 = _this.api_url + "api/notes/" + notelist_array[i];
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
                                                    var author_name = note.first_name + ' ' + note.last_name;
                                                  
                                                    if (note_contributor_id == pz_contributor_id){
                                                        //display note and contributor details
                                                        $('#peroozMain').append('<div id="' + notelist_array[i] + ' peroozNote" class="peroozStyle" style="background-color:#fff;box-shadow: 0px 0px 10px #d0d0d0;width:340px;margin:10px;"> \
                                                                                    <div id="peroozNoteInline" class="peroozStyle">' + note_inline + '</div> \
                                                                                    <div id="peroozNoteText" class="peroozStyle">' + note_text + '</div> \
                                                                                    <div id="peroozNoteAuthor" class="peroozStyle"> -' + author_name + '</div> \
                                                                                </div>');
                                                    }
                                                }
                                            }
                                        }
                                        xhr1.send();

                                    } 

                                }
                            }

                            start_id += 7; 
                        }
                        xhr.send();



                        $("#peroozMain").bind('scroll',function(){
                            if( $(this).scrollTop() == $(this)[0].scrollHeight - $(this).innerHeight() ){
                                
                               /*Preloader not working correctly*/
                               /* var loader_url = chrome.extension.getURL("images/30.gif")
                                $("peroozMain").append('<div id="loader" class="peroozStyle"><img src=' + loader_url + ' /></div>'); */

                                var xhr = new XMLHttpRequest();
                                var url = _this.api_url + "api/notegroups/" + notegroup_id + "/note_lists" + "?start=" + start_id + "&max=3"; 
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

                                                var note_id = notelist_array[i]; //grab note details for each note
                                                
                                                /*Set request for note details*/
                                                var xhr1 = new XMLHttpRequest(); 
                                                var url1 = _this.api_url + "api/notes/" + notelist_array[i];
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
                                                            var author_name = note.first_name + ' ' + note.last_name;

                                                            
                                                            if (note_contributor_id == pz_contributor_id){
                                                                //display note and contributor details
                                                                $('#peroozMain').append('<div id="' + notelist_array[i] + ' peroozNote" class="peroozStyle" style="background-color:#fff;box-shadow: 0px 0px 10px #d0d0d0;width:340px;margin:10px;"> \
                                                                                            <div id="peroozNoteInline" class="peroozStyle">' + note_inline + '</div> \
                                                                                            <div id="peroozNoteText" class="peroozStyle">' + note_text + '</div> \
                                                                                            <div id="peroozNoteAuthor" class="peroozStyle"> -' + author_name + '</div> \
                                                                                        </div>');
                                                            }
                                                                
                                                        }
                                                    }
                                                }
                                                xhr1.send();

                                            } 

                                        }
                                    }

                                    start_id += 3; 
                                }
                                xhr.send();
                            }
                        });



                    }
                }
            }
            xhr0.send();

        },

        /*Temporary hack - makes request to local server*/
        readSources: function(search_url){

            /*Prep the the xmlhttprequest*/
            var xhr = new XMLHttpRequest();
            var url = "http://news.perooz.io/api/check_url.php"; 
            xhr.open("POST", url, true); //trying to let it be asynchronous
            xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");

            /*(5) If url is in database, call fxns from content script to display all annotation links*/
            xhr.onreadystatechange = function(){
                if (xhr.readyState == 4){
                    var raw_data = xhr.responseText;
                    var data=JSON.parse(raw_data);

                    //If article successfully exists in the db
                    if (xhr.status == 200){

                        var search_string = '';
                        var keywords = data.keywords;
                        $.each(keywords,function(i){
                            var temp_string = keywords[i]['text'];
                            var temp_array = temp_string.split(" ");
                            if (temp_array.length > 2){
                                if (i == 0){
                                    search_string = keywords[i]['text'];
                                }
                            }else{
                                if (i < 2){
                                    if (i == 0){
                                        search_string += keywords[i]['text'];
                                    }else{
                                        search_string += ' ' + keywords[i]['text'];
                                    }
                                }
                            }
                        });
                    
                        //Pull NYTimes Blogs Links
                        _this.pullTimes(search_string);

                        //grab stuff from reddit
                        _this.pullReddit(search_string);

                        _this.pullRedditAMA(search_string);

                    }
                }
            }
            xhr.send("search_url=" + search_url);
        },

        pullReddit: function(ents){

            var ents_array = ents.split(" ");
            var ents_search_string = ''; 
            $.each(ents_array, function(i){
                ents_search_string += (ents_array[i] + "+");
            });
            ents_search_string = ents_search_string.substring(0, ents_search_string.length - 1);

            /*Search for general reddit posts*/
            var xhr = new XMLHttpRequest();
            var url = "http://www.reddit.com/r/api/search.json?q=" + ents_search_string + "&limit=3&sort=relevance"; 
            xhr.open("GET", url, true); //trying to let it be asynchronous
            xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
            xhr.onreadystatechange = function(){
                if (xhr.readyState == 4){
                    var raw_data = xhr.responseText;
                    var data=JSON.parse(raw_data);

                    //If article successfully exists in the db
                    if (xhr.status == 200){

                        //iterate through results and append to page
                        var results = data['data']['children'];
                        var posts = []; 

                        //iterate through and grab useful info
                        $.each(results,function(i){
                            var temp = {};
                            var data = results[i]['data'];

                            $.each(data,function(key,val){
                                if (key == 'thumbnail' || key == 'permalink' || key == 'url' || key == 'title' || key == 'id'){
                                    temp[key] = val; 
                                }
                            });

                            posts.push(temp);
                            
                        });

                        $.each(posts,function(i){

                            //console.log(post['id']);
                            var img_url = '';
                            if ("thumbnail" in posts[i]){
                                img_url = posts[i]['thumbnail'];
                            }else{
                                img_url = ''; 
                            }
                            console.log(posts[i]['permalink']);
                            $('#peroozMain').append('<div class="peroozStyle" id="peroozNote" style="background-color:#fff;box-shadow: 0px 0px 10px #d0d0d0;width:340px;margin:10px;"> \
                                                        <div class="peroozStyle" id="peroozNoteInline">Reddit: ' + posts[i]['title'] + '</div> \
                                                        <div class="peroozStyle" id="peroozNoteText"><a target="_blank" href="http://www.reddit.com' + posts[i]['permalink'] + '">Comments</a></div> \
                                                        <div class="peroozStyle" id="peroozPic"><img src="' + img_url + '" /></div> \
                                                    </div>');

                        });  
                        
                        

                    }

                        
                }
            }
            xhr.send(); 

        },

        pullRedditAMA: function(ents){

            var ents_array = ents.split(" ");
            var ents_search_string = ''; 
            $.each(ents_array, function(i){
                ents_search_string += (ents_array[i] + "+");
            });
            ents_search_string = ents_search_string.substring(0, ents_search_string.length - 1);

            /*Search for general reddit posts*/
            var xhr = new XMLHttpRequest();
            var url = "http://www.reddit.com/r/IAma/search.json?q=" + ents_search_string + "&limit=2&sort=relevance&restrict_sr=1"; 
            xhr.open("GET", url, true); //trying to let it be asynchronous
            xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
            xhr.onreadystatechange = function(){
                if (xhr.readyState == 4){
                    var raw_data = xhr.responseText;
                    var data=JSON.parse(raw_data);

                    //If article successfully exists in the db
                    if (xhr.status == 200){

                        //iterate through results and append to page
                        var results = data['data']['children'];
                        var posts = []; 

                        //iterate through and grab useful info
                        $.each(results,function(i){
                            var temp = {};
                            var data = results[i]['data'];

                            $.each(data,function(key,val){
                                if (key == 'thumbnail' || key == 'permalink' || key == 'url' || key == 'title' || key == 'id'){
                                    temp[key] = val; 
                                }
                            });

                            posts.push(temp);
                            
                        });

                        $.each(posts,function(i){

                            //console.log(post['id']);
                            var img_url = '';
                            if ("thumbnail" in posts[i]){
                                img_url = posts[i]['thumbnail'];
                            }else{
                                img_url = ''; 
                            }
                            
                            $('#peroozMain').append('<div class="peroozStyle" id="peroozNote" style="background-color:#fff;box-shadow: 0px 0px 10px #d0d0d0;width:340px;margin:10px;"> \
                                                        <div class="peroozStyle" id="peroozNoteInline">Reddit: ' + posts[i]['title'] + '</div> \
                                                        <div class="peroozStyle" id="peroozNoteText"><a target="_blank" href="http://www.reddit.com' + posts[i]['permalink'] + '">Comments</a></div> \
                                                        <div class="peroozStyle" id="peroozPic"><img src="' + img_url + '" /></div> \
                                                    </div>');

                        });  
                        
                        

                    }

                        
                }
            }
            xhr.send(); 

        },

        pullTimes: function(ents){

            var ents_array = ents.split(" ");
            var ents_search_string = ''; 
            $.each(ents_array, function(i){
                ents_search_string += (ents_array[i] + "+");
            });
            ents_search_string = ents_search_string.substring(0, ents_search_string.length - 1);

            var xhr = new XMLHttpRequest();
            var url = "http://api.nytimes.com/svc/search/v2/articlesearch.json?q=" + ents_search_string + "&fq=news_desk%3A%28%22blogs%22%29ANDpage%3A%28%221%22%29&fl=web_url%2Csnippet&api-key=e4d28186c9eb23f685a46de0f3719ddd%3A9%3A70390456"; 
            xhr.open("GET", url, true); //trying to let it be asynchronous
            xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");

            /*(5) If url is in database, call fxns from content script to display all annotation links*/
            xhr.onreadystatechange = function(){
                if (xhr.readyState == 4){
                    var raw_data = xhr.responseText;
                    var data=JSON.parse(raw_data);

                    //If article successfully exists in the db
                    if (xhr.status == 200){

                        var results = data['response']['docs'];

                        $.each(results,function(i){
                            if (i < 3){

                                $('#peroozMain').append('<div class="peroozStyle" id="peroozNote" style="background-color:#fff;box-shadow: 0px 0px 10px #d0d0d0;width:340px;margin:10px;"> \
                                                        <div class="peroozStyle" id="peroozNoteInline">NYTimesBlogs: ' + results[i]['snippet'] + '</div> \
                                                        <div class="peroozStyle" id="peroozNoteText"><a target="_blank" href="' + results[i]['web_url'] + '">See blog!</a></div><br/> \
                                                         </div>');

                            }
                        });

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

            /*TEMP HACK - APPEND TO LOCAL STORAGE*/
            _this.localNotes.push({'inline': selection, 'note': note});

            /*Retrieve session token*/
            if (!_this.sess_cookie){
                $(".peroozStyle#peroozMessage").html('Session token expired. Please refresh page.');
                return;
            }

            var pz_contributor_id = null;

            /*Grab contributor id from the database if it is present*/
            var xhr = new XMLHttpRequest();
            var url = _this.api_url + "api/auth/get_contrib_from_sess.php"; 
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
            console.log(_this.sess_cookie);
            console.log(pz_contributor_id);
            if (!pz_contributor_id){
                $(".peroozStyle#peroozMessage").html('Insufficient permission to create annotation.');
                return;
            }


            /*Check if article in db*/
            var article_selector = $peroozSidebar.has(".peroozStyle#perooz_article_id").length; //.innerText();
            if (article_selector){
                _this.pz_article_id = $(".peroozStyle#perooz_article_id").innerText();
            }

            if (!_this.pz_article_id){ //if not in db, add current article to db

                //grab article url
                var xhr = new XMLHttpRequest();
                var url = _this.api_url + "api/articles"; 
                xhr.open("POST", url, false); //note that this is a synchronous request
                xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
                xhr.setRequestHeader("Client-Id","13adfewasdf432dae");
                xhr.setRequestHeader("Session-Token",_this.sess_cookie);
                xhr.onreadystatechange = function(){
                    if (xhr.readyState == 4){
                        var raw_data = xhr.responseText;
                        var data=JSON.parse(raw_data);

                        if (xhr.status == 200 && data.message == "OK"){
                            _this.pz_article_id = data.values;
                            console.log('Good');
                        }
                    }
                }
                xhr.send("article_hyperlink=" + _this.article_url + "&approved=0"); //temporary FIX - cannot grab notegroups unless all entries in article filled
            }

            /*If article not properly inserted into db*/
            if (!_this.pz_article_id){
               $(".peroozStyle#peroozMessage").html('Unable to save. Please try again.');
                return;
            }

            var pz_note_id = null;

            /*Create annotation*/
            xhr = new XMLHttpRequest();
            var url = _this.api_url + "api/notes"; 
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
            xhr.send("perooz_contributor_id=" + pz_contributor_id + "&perooz_article_id=" + _this.pz_article_id + "&note_type_id=2&inline_text=" + selection + "&note_text=" + note + "&approved=0&sort_order=1"); //initially no sort of chron job approval

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
            
            /*Insert hidden div tag into perooz sidebar*/
            //$peroozSidebar.append('<div id="perooz_article_id" class="peroozStyle">' + perooz_article_id + '</div>');

            /*(1) Grab notegroup array from background page and display*/
            var xhr = new XMLHttpRequest();
            var url = _this.api_url + "api/articles/" + perooz_article_id + "/notegroup_lists"; 
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
                            var url1 = _this.api_url + "api/notegroups/" + notegroup_array[i];
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
                                        var img_url = chrome.extension.getURL("images/lens_icon.png");

                                        var needle = notegroup_info.note_text_overlap;
                                        var haystack = document.body;

                                        needle = _this.getLastWords(needle, 5); //first grab last three words in annotation overlap
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
                    _this.pz_article_id = request.perooz_article_id;
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