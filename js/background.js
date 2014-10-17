/*ID for context menu entry*/
var cmid; 

/*Set context menu click handler*/
// var onClickHandler = function(){
//  	alert('clicked!');
// }

/*On a new chrome tab being opened*/
chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
	if (changeInfo.status == "complete"){

		/*(1) check for extension log-in status*/
		chrome.cookies.get({'url': 'https://dev.perooz.io/api','name':'session_token'}, function(cookie){
			
			if (!cookie){
				
				/*Send message to content script to show a reminder to log in*/
				//chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					chrome.tabs.sendMessage(tabs[0].id,{method: "setReminder", from: "background.js"},function(response){
						if (typeof(response) != 'OK'){
							console.log(response.message);
						}
					});
				//});

				/*If chrome context menu does exist, remove it*/
				if (cmid){
					chrome.contextMenus.removeAll(function(){
						cmid = null;
					});
				}
				return;
			}

			/*(2) Set the chrome context menu*/
			if (!cmid){
				
				chrome.contextMenus.create({"title": "Create Perooz Annotation", "id":"p_menu","contexts":["all"]});

				/*Set the chrome context menu event listener*/
				chrome.contextMenus.onClicked.addListener(function(){

					/*Send message to content script to retrieve selected string from activetab*/
					chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
						chrome.tabs.sendMessage(tabs[0].id,{method: "getSelection", from: "background.js"},function(response){
							console.log('message sent');
							// if (response.message != 'OK'){
							// 	console.log(response.message);
							// }
						});
					});
					
				});

				cmid = true;
			}

			/*(3) Set event listener for check for text selection - displays 'create annotation' box*/
			// $(document.body).addEventListener('mouseup',function(event){
			// 	var select = window.getSelection().toString(); 
			// 	console.log(select);
			// 	alert('selected!');
			// 	if (select.length > 0){
			// 		alert('selected!');
			// 	} 
			// });


			/*(4) Grab the url from the current tab*/
			var tab_url = tab.url;
			var purl_url = $.url(tab_url);
			var url_adjusted = tab_url.replace((purl_url.attr('protocol')+'://'),"");

			/*Prep the the xmlhttprequest*/
			xhr = new XMLHttpRequest();
			var url = "https://dev.perooz.io/api/search/articles?url=" + encodeURIComponent(url_adjusted); 
			xhr.open("GET", url, true);
			xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
			xhr.setRequestHeader("Client-Id","13adfewasdf432dae");
			xhr.setRequestHeader("Session-Token",cookie.value);

			/*(4) If url is in database, call fxns from content script to display all annotation links*/
			xhr.onreadystatechange = function(){
				if (xhr.readyState == 4){
					var raw_data = xhr.responseText;
					var data=JSON.parse(raw_data);

					//If article successfully exists in the db
					if (xhr.status == 200){

						//extract the perooz id of the article
						var obj = data.values; 
						// var msg = {message:'setNotes',
						// 		   perooz_article_id: obj.perooz_article_id};

						//send message to content script with relevant information
						chrome.tabs.sendMessage(tabId, {method: "setNotes", perooz_article_id: obj.perooz_article_id, from: "background.js"}, function(response) {
        					if (response.message !== 'OK') {
		            			//console.log(response.message);
        					}
	        			});

					}
				}
			}
			xhr.send();

		});

	}

});