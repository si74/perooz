/*ID for context menu entry*/
//var cmid; 
/*On browser launch - check for session token - if existing, add menu event*/
$(document).ready(){

	chrome.cookies.get({'url': 'https://dev.perooz.io/api','name':'session_token'}, function(cookie){
			
		if (!cookie){
			return
		}

		/*Set chrome context menu and Event Listener*/
		chrome.contextMenus.create({"title": "Create Perooz Annotation", "id":"p_menu","contexts":["all"]});

		/*Set the chrome context menu event listener*/
		chrome.contextMenus.onClicked.addListener(function(){

			/*Send message to content script to retrieve selected string from activetab*/
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id,{method: "getSelection", from: "background.js"},function(response){
					console.log('menu click message sent');
					// if (response.message != 'OK'){
					// 	console.log(response.message);
					// }
				});
			});
			
		});
		
	}
}
 
/*Add listener for expired session token*/
chrome.cookies.onChanged.addListener(function(changeInfo){
	if (changeInfo.cookie.name == "session_token" && changeInfo.removed){

		/*Query through all chrome tabs*/
		chrome.tabs.query({}, function(tabs) {
			for (var i=0; i<tabs.length; ++i) {

				/*Send message to remove session token*/
				chrome.tabs.sendMessage(tabs[i].id,{method: "removeSess",from: "background.js"},function(response){
					console.log('remove sessiontoken message sent');
					// if (response.message != 'OK'){
					// 	console.log(response.message);
					// }
				});
		

				/*Send message to remove Mouseicon event in page*/
				chrome.tabs.sendMessage(tabs[i].id,{method: "removeMouseiconEvent",from: "background.js"},function(response){
					console.log('remove mouseicon message sent');
					// if (response.message != 'OK'){
					// 	console.log(response.message);
					// }
				});

				/*Remove annotations*/
				chrome.tabs.sendMessage(tabs[i].id,{method: "removeNotes",from: "background.js"},function(response){
					console.log('remove notes message sent');
					// if (response.message != 'OK'){
					// 	console.log(response.message);
					// }
				});

			}
		});

		/*Remove chrome context menu*/
		chrome.contextMenus.removeAll(function(){
			console.log('Perooz menu removed.');
		});


	}
});

/*Add listener from chrome events*/
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){

	//if message received to set up context menu
	if (request.method == "setupContextMenu"){
		console.log('listener here');

		/*Set chrome context menu and Event Listener*/
		chrome.contextMenus.create({"title": "Create Perooz Annotation", "id":"p_menu","contexts":["all"]});

		/*Set the chrome context menu event listener*/
		chrome.contextMenus.onClicked.addListener(function(){

			/*Send message to content script to retrieve selected string from activetab*/
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id,{method: "getSelection", from: "background.js"},function(response){
					console.log('menu click message sent');
					// if (response.message != 'OK'){
					// 	console.log(response.message);
					// }
				});
			});
			
		});

		sendResponse({message:"OK"});

	//if message received to check tab urls and insert annotations accordingly
	}else if(request.method == "checkTabURL"){

		/*check for presence of session cookie*/
		chrome.cookies.get({'url': 'https://dev.perooz.io/api','name':'session_token'}, function(cookie){
			
			if (!cookie){
				return
			}
				
			//query through all tabs
			chrome.tabs.query({}, function(tabs) {
				for (var i=0; i<tabs.length; ++i) {

					/*Grab the url from the current tab*/
					var tab_url = tabs[i].url;
					var purl_url = $.url(tab_url);
					var url_adjusted = tab_url.replace((purl_url.attr('protocol')+'://'),"");

					/*Prep the the xmlhttprequest*/
					var xhr = new XMLHttpRequest();
					var url = "https://dev.perooz.io/api/search/articles?url=" + encodeURIComponent(url_adjusted); 
					xhr.open("GET", url, false); //note the for loop won't work unless synchronous
					xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
					xhr.setRequestHeader("Client-Id","13adfewasdf432dae");
					xhr.setRequestHeader("Session-Token",cookie.value);

					/*(5) If url is in database, call fxns from content script to display all annotation links*/
					xhr.onreadystatechange = function(){
						if (xhr.readyState == 4){
							var raw_data = xhr.responseText;
							var data=JSON.parse(raw_data);

							console.log(url);
							console.log(xhr.status);

							//If article successfully exists in the db
							if (xhr.status == 200){

								//extract the perooz id of the article
								var obj = data.values;

								//send message to content script with relevant information
								chrome.tabs.sendMessage(tabs[i].id, {method: "setNotes", perooz_article_id: obj.perooz_article_id, from: "background.js"}, function(response) {
		        					//if (response.message !== 'OK') {
				            			console.log(response.message);
		        					//}
			        			});

							}
						}
					}
					xhr.send();

				}
			});

		});

	}

});

/*On a new chrome tab being opened*/
chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
	if (changeInfo.status == "complete"){

		/*(1) check for extension log-in status*/
		chrome.cookies.get({'url': 'https://dev.perooz.io/api','name':'session_token'}, function(cookie){
			
			if (!cookie){
				
				/*Send message to content script to show a reminder to log in*/
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					chrome.tabs.sendMessage(tabs[0].id,{method: "setReminder", from: "background.js"},function(response){
						//if (response.message !== 'OK'){
							console.log(response.message);
						//}
					});
				});

				return;
			}

			/*Grab tab url information*/
			var tab_url = tab.url;
			var purl_url = $.url(tab_url);
			var url_adjusted = tab_url.replace((purl_url.attr('protocol')+'://'),"");

			/*(2) Send message to content script to set value of session cookie*/
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id,{method: "setSess", sess_cookie: cookie.value, from: "background.js"},function(response){
					console.log('message sent');
					// if (response.message != 'OK'){
					// 	console.log(response.message);
					// }
				});
			});

			/*(3) Set event listener for check for text selection - send message to content script to setup listener*/
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id,{method: "setupMouseiconEvent", article_url:url_adjusted, from: "background.js"},function(response){
					console.log('message sent');
					// if (response.message != 'OK'){
					// 	console.log(response.message);
					// }
				});
			});

			

			/*(4)Prep the the xmlhttprequest*/
			var xhr = new XMLHttpRequest();
			var url = "https://dev.perooz.io/api/search/articles?url=" + encodeURIComponent(url_adjusted); 
			xhr.open("GET", url, true);
			xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
			xhr.setRequestHeader("Client-Id","13adfewasdf432dae");
			xhr.setRequestHeader("Session-Token",cookie.value);

			/*(5) If url is in database, call fxns from content script to display all annotation links*/
			xhr.onreadystatechange = function(){
				if (xhr.readyState == 4){
					var raw_data = xhr.responseText;
					var data=JSON.parse(raw_data);

					//If article successfully exists in the db
					if (xhr.status == 200){

						//extract the perooz id of the article
						var msg = data.message;

						if (msg == "OK"){
							var obj = data.values; 


							//send message to content script with relevant information
							chrome.tabs.sendMessage(tabId, {method: "setNotes", perooz_article_id: obj.perooz_article_id, from: "background.js"}, function(response) {
	        					//if (response.message !== 'OK') {
			            			console.log(response.message);
	        					//}
		        			});

		        		}else{
		        			console.log('bad');
		        		}

					}
				}
			}
			xhr.send();

		});

	}

});