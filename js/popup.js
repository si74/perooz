/*Javascript for Perooz Chrome extension browser action
Author: Sneha Inguva
Date: 7-29-2014*/

/**
 * Function validates username or password input for sign in form
 * @param  {string} input 
 * @param  {jquery selector variable} $sel  
 * @return {boolean}    
 */
var input_validation = function(input,$sel){
	if (input == ''){
		$sel.html('Username or pw cannot be blank.');
		return false; 
	}

	if (input.indexOf(' ') >= 0){
		$sel.html('Username or pw cannot have spaces.');
		return false; 
	}

	/*Later insert other validation rules here*/
	return true; 
}

/**
 * Function redirects User to sign up tab
 */
var sign_up = function(){
	chrome.tabs.create({url: 'https://dev.perooz.io/joinus.php'});
}

/**
 * Function redirects users to forgot password 
 */
var forgot_pw = function(){
	chrome.tabs.create({url: 'https://dev.perooz.io/forgotpw.php'});
}

$(document).ready(function(){

	/*If not online, display that one must be online to even use the extension*/
	if (!navigator.onLine){
		$(".main").html("<div class='login_container'>Not connected to internet. Please try again.</div>");
		return; 
	}

	chrome.cookies.get({'url': 'https://dev.perooz.io/api','name':'session_token'}, function(cookie){
	
		if (cookie){
			/*Set main popup menu*/
			var menu = "<div class='logout_container'> \
							<div id='instructions'> \
								(1) Keep browsing! If you see a <img src='' alt='annotation' style=''> icon, there are annotations. \
									Simply click the icon to see more. \
								(2) If you are a Perooz annotator, simply select the text you wish to annotate. \
									A <img src='' alt='annotation' style=''> icon will appear, which you can click to create the annotation. \
									Alternatively, you can right click, go to the chrome Perooz menu <img src='' alt='annotation' style=''>, \
									and select ''create an annotation.'' \
							</div> \
							<button id='logout'>LOGOUT</div> \
						</div>";

			$(".main").html(menu);

			/*Set logout function event*/
			$("#logout").on('click',function(){

				/*Chrome get cookie*/
				/*Remove session token from database*/
				chrome.cookies.get({'url':'https://dev.perooz.io/api','name':"session_token"},function(cookie){
													
					if (!cookie){
						return;
					}

					/*Remove session token from db*/
					var xhr2 = new XMLHttpRequest();
					var url2 = "https://dev.perooz.io/api/auth/remove_sess.php";
					xhr2.open("GET",url2,false); //synchronous 
					xhr2.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
					xhr2.setRequestHeader("Client-Id",client_id);
					xhr2.setRequestHeader("Session-Token",cookie.value);

					xhr2.onreadystatechange = function(){
						if (xhr2.readyState == 4 && xhr2.status ==200){
							console.log('cookie removed');
						}
					}
					xhr2.send();

				});

				/*Remove chrome session cookie*/
				chrome.cookies.remove({'url': 'https://dev.perooz.io/api', 'name': 'session_token'}, function(deleted_cookie){ 
					$('.main').html("Logged out! Please refresh page to log back in.");
				});

			});

		}else{

			/*Send web api request to receive nonce value*/
			xhr = new XMLHttpRequest();
			var url = "https://dev.perooz.io/api/auth/nonce.php"; 
			xhr.open("GET", url, true);
			xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
			xhr.setRequestHeader("Client-Id",client_id);

			xhr.onreadystatechange = function(){

				if (xhr.readyState == 4 && xhr.status == 200){

					var raw_data = xhr.responseText;
					var data=JSON.parse(raw_data);
					var nonce = data.nonce;
					console.log(nonce);
					if (nonce){
						/*Display login form if nonce received*/
						var nonce_string = "<div class='login_container'> \
												<div id='logo'><img src='images/Perooz_Icon_130.png' alt='Perooz' style='height:3em;width:auto;'></div> \
													<form id='login_form'>\
														<input id='nonce_id' type='hidden' name='" + nonce + "' /> \
														<input id='username' type='text' name='username' placeholder='username'/><br/> \
														<input id='pwd' type='password' name='username' placeholder='password' /><br/> \
														<button id='sign_in'>SIGN IN</button><br/> \
													</form> \
													<button id='sign_up'>NEW USER? SIGN UP</button><br/> \
													<button id='forgot_pw'>FORGOT YOUR LOGIN INFO?</button><br/> \
													<div class='message'></div> \
											</div>";

						/*Set the login form*/
						 $(".main").html(nonce_string);
						
						/*If user clicks to sign up*/
						$("#sign_in").on('click',function(){

							var nonce_here = $('#nonce_id').attr("name"); 
							var username = $('#username').val(); 
							var pwd = $('#pwd').val();
							  
							$sel = $('.message');

							if (input_validation(username,$sel) && input_validation(pwd,$sel)){ 
								
								var params = "uname=" + username + "&pwd=" + pwd;  
								
								xhr1 = new XMLHttpRequest(); 
								var url1 = "https://dev.perooz.io/api/auth/login.php"
								xhr1.open("POST",url1,true);
								xhr1.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
								xhr1.setRequestHeader("Client-Id",client_id);
								xhr1.setRequestHeader("Nonce",nonce_here);
								
								xhr1.onreadystatechange = function(){
									if (xhr1.readyState == 4){
										var raw_data = xhr1.responseText;
										var data=JSON.parse(raw_data);
										if (xhr1.status == 200 && data.message == 'OK'){
											var sess_token = data.session_token;
											chrome.cookies.set({'url': 'https://dev.perooz.io/api','name':'session_token','value':sess_token, 'expirationDate': new Date().getTime() / 1000 + 1209600}); //cookie expiration date set as 2 months

											/*Set main popup menu items*/
											var menu = "<div class='logout_container'> \
															<div id='instructions'> \
																(1) Keep browsing! If you see a <img src='' alt='annotation' style=''> icon, there are annotations. \
																	Simply click the icon to see more. \
																(2) If you are a Perooz annotator, simply select the text you wish to annotate. \
																	A <img src='' alt='annotation' style=''> icon will appear, which you can click to create the annotation. \
																	Alternatively, you can right click, go to the chrome Perooz menu <img src='' alt='annotation' style=''>, \
																	and select ''create an annotation.'' \
															</div> \
															<button id='logout'>LOGOUT</button> \
														</div>";

											$(".main").html(menu);

											/*Set logout button listener*/
											$("#logout").on('click',function(){

												/*Get chrome cookie and remove sesson token from db*/
												chrome.cookies.get({'url':'https://dev.perooz.io/api','name':"session_token"},function(cookie){
													
													if (!cookie){
														return;
													}

													/*Remove session token from db*/
													var xhr2 = new XMLHttpRequest();
													var url2 = "https://dev.perooz.io/api/auth/remove_sess.php";
													xhr2.open("GET",url2,false); //synchronous 
													xhr2.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
													xhr2.setRequestHeader("Client-Id",client_id);
													xhr2.setRequestHeader("Session-Token",cookie.value);

													xhr2.onreadystatechange = function(){
														if (xhr2.readyState == 4 && xhr.status ==200){
															console.log('cookie removed');
														}
													}
													xhr2.send();

												});

												/*Remove chrome cookie from browser*/
												chrome.cookies.remove({'url': 'https://dev.perooz.io/api', 'name': 'session_token'}, function(deleted_cookie){ 
													$('.main').html("Logged out! Please refresh page to log back in.");
												});

											});
											
											/*Query through all chrome tabs*/
											chrome.tabs.query({}, function(tabs) {
												for (var i=0; i<tabs.length; ++i) {

													/*Send message to context script to set session cookie of the page*/
											
														chrome.tabs.sendMessage(tabs[i].id,{method: "setSess",sess_cookie: sess_token,from: "popup.js"},function(response){
															console.log('message sent');
															// if (response.message != 'OK'){
															// 	console.log(response.message);
															// }
														});

													/*Grab tabs url and other info*/
													var tab_url = tabs[i].url;
													var purl_url = $.url(tab_url);
													var url_adjusted = tab_url.replace((purl_url.attr('protocol')+'://'),"");


													/*Send message to content script page to setup mouseicon event*/
														chrome.tabs.sendMessage(tabs[i].id,{method: "setupMouseiconEvent",from: "popup.js",article_url:url_adjusted},function(response){
															console.log('mouseiconsetup message sent');
															// if (response.message != 'OK'){
															// 	console.log(response.message);
															// }
														});


												}
											});


											/*-----------------------------------------------------------------------------------------------------*/

											/*Send message to background page to setup context menu and event listener*/
											chrome.runtime.sendMessage({method: "setupContextMenu",from: "popup.js"},function(response){
												console.log('mouseiconsetup message sent');
												// if (response.message != 'OK'){
												// 	console.log(response.message);
												// }
											});

											/*Send message to background page to check all chrome tabs whether in db*/
											chrome.runtime.sendMessage({method: "checkTabURL",from: "popup.js"},function(response){
												console.log('tabUrl check message sent');
												// if (response.message != 'OK'){
												// 	console.log(response.message);
												// }
											});

											/*-----------------------------------------------------------------------------------------------------*/

										}else{
											$sel.html(data.message);
										}
									}
								}
								xhr1.send(params);
								
							}
							return false; 
						});

						/*If user wishes to sign up*/
						$("#sign_up").on('click',sign_up);

						/*If password if forgotton*/
						$("#forgot_pw").on('click',forgot_pw);
					}
				}

						
			}
			xhr.send();

		}

	});
	

});


