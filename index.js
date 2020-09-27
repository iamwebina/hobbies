const config = require('rc')('whois') 
const debug  = require('debug')('whois') 
const botkit = require('botkit')

const controller = botkit.slackbot({
  debug: process.env.DEBUG
})

const bot = controller.spawn({
  token: process.env.TOKEN || config.token
})

controller.hears(['(.*)'],['ambient','direct_message','direct_mention','mention'], function(bot, message) {

    var msg1 = message.match[1];
    var msg = msg1.toUpperCase();
    
    if (msg.match('[HELLO]|[HEY]')) 
    {
         bot.reply(message, ' Hi, <@' + message.user + '>.');
         conversationThread(message);
    
    }
    else if (msg.match('HI'))
    {
         bot.reply(message, ' Hello, <@' + message.user + '>.');
         conversationThread(message);
    }
    else if (msg.match('[CORRECT]|[TRUE]|[RIGHT]'))
    {
         bot.reply(message, 'That\'s good to know');    
    }
    else if (msg.match('[NICE]|[GOOD]|[GREAT]|[COOL]'))
	{
		   bot.api.reactions.add({
             	    timestamp: message.ts,
        			channel: message.channel,
        			name: 'slightly_smiling_face',
				    }, function(err, res) {
        			if (err) {
        				bot.botkit.log('Failed to add emoji reaction :(', err);
        			}
		        });
		  msg = msg.toLowerCase();
		  bot.reply(message, "That\'s " + msg + " to hear too. ");
	}
	else if ((msg === 'OKAY') || (msg === 'OKI') || (msg === 'SORRY'))
	{
		bot.reply(message,"Okay. No problem.");
	}
	else if (msg === 'THANK')
	{
		bot.reply(message, ' You\'re welcome, <@' + message.user + '>.');
	}
	else if ((msg === 'MONEY') || (msg === 'WANT') || (msg === 'NEED') )
	{
		bot.reply(message, ' Are you sure that\'s what you want to know <@' + message.user + '>?');
	}
	else if ((msg === 'MONEY') || (msg === 'WANT') || (msg === 'NEED') )
	{
		bot.reply(message, ' Are you sure that\'s what you want to know <@' + message.user + '>?');
	}
	else if ((msg === 'AGE') || (msg === 'WHERE') || (msg === 'JOB') || (msg === 'COUNTRY'))
	{
		//bot.reply(message, "I\'m not sure if I can answer that.");
		getToKnow(message);
	}
    else  
    {  
    	//bot.reply(message, "Testing ..." + msg);
    	checkPerson(msg, message);       
	}
});


function conversationThread(message)
{
	  bot.startConversation(message, function(err, convo) 
	    {
	        if (!err) 
	        {
	            //convo.say('How are you feeling today?');
	            convo.ask('How are you feeling today?', function(response, convo) {	            	 
	                  convo.ask('Oh?! Really?! Do you mind if I ask you something?', [
	                    {
	                        pattern: '[what]|[no]|[sure]',	                        	                                             
	                        callback: function(response, convo) {	                        
	                            convo.say('Ummm ');     
	                            convo.ask('Are you a guy or a girl?', function(response, convo) {
		                          convo.ask(response.text +'?! Is this really your answer ?', [
		                            {
		                                pattern: '[yes]|[yup]|[yep]|[why]',	 		                             
		                                callback: function(response, convo) {		                                    	                                 
		                                    convo.next();
		                                }
		                            },
		                            {
		                                pattern: '[no]',
		                                callback: function(response, convo) {
		                                    // stop the conversation. this will cause it to end with status == 'stopped'
		                                    convo.stop();
		                                }
		                            },
		                            {
		                                pattern: '[why]|[what]',
		                                callback: function(response, convo) {
		                                	    bot.api.reactions.add({
								             	    timestamp: response.ts,
						                			channel: response.channel,
						                			name: 'robot_face',
						        				    }, function(err, res) {
						                			if (err) {
						                				bot.botkit.log('Failed to add emoji reaction :(', err);
						                			}
					        			        });
					        			    	
				        			    	 	bot.reply(message,'I\'m a robot. I don\'t know what you\'re talking <@' + message.user + '>.');
					                                    
					                            convo.repeat();
					                            convo.next();					                               

		                                }
		                            },		                          
		                            {
		                            	default:true,
		                            	callback: function(response, convo) {
		                            		reactExpression(response);
		                            		convo.next();
		                            	}
		                            }
		                        ]);
		                        convo.next();

	            				}, {'key': 'gender'});

	                            convo.next();
	                        }
	                    },
	                    {
	                        pattern: '[yes]|[yup]|[yep]|[why]',	                      
	                        callback: function(response, convo) {
	                            // stop the conversation. this will cause it to end with status == 'stopped'
	                            convo.stop();
	                        }
	                    },	           
	                    {
	                        default: true,
	                        callback: function(response, convo) {
	                            convo.repeat();
	                            convo.next();
	                        }
	                        
	                    }
	                ]);

	                convo.next();

	            }, {'key': 'feeling'}); // store the results in a field called feeling

	            convo.on('end', function(convo) {
	                if (convo.status == 'completed') {
	                    gender = convo.extractResponse('gender');
	                    feels = convo.extractResponse('feeling');

	                    if (gender != '')
	                    {
	                    	bot.reply(message, 'So you\'re a '+ gender +' who\'s feeling '+ feels);	                                  	
	                    }
	                    else
	                    {
	                    	bot.reply(message, 'Okay. So you\'re feeling '+ feels + ' today.');	                    	                
	                    }                                
	      
	                } else {
	                    // this happens if the conversation ended prematurely for some reason
	                    bot.reply(message, 'Okay, nevermind!');
	                                   
	                }	                
	            });
	            //END convo here	            
	    	}   
	    	else
	    	{
	    		    bot.api.reactions.add({
	             	    timestamp: message.ts,
            			channel: message.channel,
            			name: 'robot_face',
    				    }, function(err, res) {
            			if (err) {
            				bot.botkit.log('Failed to add emoji reaction :(', err);
            			}
			        });
			    	
		    	 	bot.reply(message,'I\'m a robot. I don\'t know what you\'re talking <@' + message.user + '>.');
                    
	    	}        

	    });
}

function getToKnow(message)
{
	  bot.startConversation(message, function(err, convo) 
	    {
	        if (!err) 
	        {
	        	convo.say('Haha I\'m not sure if I can answer that.');
	            convo.ask('Do you really want to know?', function(response, convo) {	            	 
	                  convo.ask('Can I just ask you instead?', [
	                    {
	                        pattern: '[what]|[sure][yes]|[yup]|[yep]|[haha]',	                        	                                             
	                        callback: function(response, convo) {	                        
	                            convo.say('mmm');     
	                            convo.ask('What do you usually do in your free time?', function(response, convo) {
		                          convo.ask(response.text +'?! Really?! This is your hobby? ', [
		                            {
		                                pattern: '[yes]|[yup]|[yep]',	 		                             
		                                callback: function(response, convo) {		                                    	                                 
		                                    convo.next();
		                                }
		                            },
		                            {
		                                pattern: '[no]',
		                                callback: function(response, convo) {
		                                    // stop the conversation. this will cause it to end with status == 'stopped'
		                                    convo.stop();
		                                }
		                            },
		                            {
		                                pattern: '[why]|[what]',
		                                callback: function(response, convo) {
		                                	    bot.api.reactions.add({
								             	    timestamp: response.ts,
						                			channel: response.channel,
						                			name: 'robot_face',
						        				    }, function(err, res) {
						                			if (err) {
						                				bot.botkit.log('Failed to add emoji reaction :(', err);
						                			}
					        			        });
					        			    	
				        			    	 	bot.reply(message,'I\'m a robot. I don\'t know what you\'re talking <@' + message.user + '>.');
					                                    
					                            convo.repeat();
					                            convo.next();					                               

		                                }
		                            },		                          
		                            {
		                            	default:true,
		                            	callback: function(response, convo) {
		                            		reactExpression(response);
		                            		convo.next();
		                            	}
		                            }
		                        ]);
		                        convo.next();

	            				}, {'key': 'hobby'});

	                            convo.next();
	                        }
	                    },
	                    {
	                        pattern: '[no]|[why]',	                      
	                        callback: function(response, convo) {
	                            // stop the conversation. this will cause it to end with status == 'stopped'
	                            convo.stop();
	                        }
	                    },	           
	                    {
	                        default: true,
	                        callback: function(response, convo) {
	                            convo.repeat();
	                            convo.next();
	                        }	                        
	                    }
	                ]);

	                convo.next();

	            }, {'key': 'answer'}); // store the results in a field called feeling

	            convo.on('end', function(convo) {
	                if (convo.status == 'completed') {
	                    hobby = convo.extractResponse('hobby');
	                    answer = convo.extractResponse('answer');

	                    if (hobby != '')
	                    {
	                    	bot.reply(message, 'So this is how you spend your free time - ' + hobby);	                                  	
	                    }
	                    else
	                    {
	                    	bot.reply(message, 'Okay. Nice to meet you.');
	                    }
	      
	                } else {
	                    // this happens if the conversation ended prematurely for some reason
	                    bot.reply(message, 'Okay, whatever!');
	                                   
	                }	                
	            });
	            //END convo here	            
	    	}   
	    	else
	    	{
	    		    bot.api.reactions.add({
	             	    timestamp: message.ts,
            			channel: message.channel,
            			name: 'robot_face',
    				    }, function(err, res) {
            			if (err) {
            				bot.botkit.log('Failed to add emoji reaction :(', err);
            			}
			        });
			    	
		    	 	bot.reply(message,'I\'m a robot. I don\'t know what you\'re talking <@' + message.user + '>.');
                    
	    	}        

	    });
}


function listenMsg()
{
	controller.hears(['(.*)'], 'direct_message,direct_mention,mention', function(bot, message) {

	    var msg1 = message.match[1];
	    var msg = msg1.toUpperCase();

	    if ((msg === 'CORRECT') || (msg === 'TRUE') || (msg === 'RIGHT'))
	    {
	         bot.reply(message, 'That\'s good to know');
	    
	    }
	    //bot.reply(message, 'To make use of me, please type in the person you want to know');	  	   
	    reactExpression(message);	  
	});
}

function reactExpression(message)
{
	var msg = message.txt;
 	if ((msg === 'NICE') || (msg === 'GOOD') || (msg === 'GREAT') || (msg === 'COOL') )
	{
		   bot.api.reactions.add({
             	    timestamp: message.ts,
        			channel: message.channel,
        			name: 'slightly_smiling_face',
				    }, function(err, res) {
        			if (err) {
        				bot.botkit.log('Failed to add emoji reaction :(', err);
        			}
		        });
		  msg = msg.toLowerCase();
		  bot.reply(message, "That\'s " + msg + " to hear too. ");
	}
	else if ((msg === 'OKAY') || (msg === 'OKI') || (msg === 'SORRY'))
	{
		bot.reply(message,"Okay. No problem.");
	}
	else if (msg === 'THANK')
	{
		bot.reply(message, ' You\'re welcome, <@' + message.user + '>.');
	}
	else
	{
	   bot.api.reactions.add({
         	    timestamp: message.ts,
    			channel: message.channel,
    			name: 'robot_face',
			    }, function(err, res) {
    			if (err) {
    				bot.botkit.log('Failed to add emoji reaction :(', err);
    			}
	        });	 
	  bot.reply(message, "I don\'t understand what you\'re saying");
	}
}


function checkPerson(msg, message)
{
	var name = '';
	var piclink = '';
	var title = 'What do you want to know about me?';
	var description = 'To serve you better, please message me or invite me in your channel.';
    if (msg != "")
    {
    	   	switch (msg){
				case "GRACE":			
		            name = '<@grace.ungui>';
		            description = " ";
		            piclink =  'https://media.licdn.com/mpr/mpr/shrinknp_200_200/AAEAAQAAAAAAAArLAAAAJDQ2NzlmZjMwLWIyYzAtNDZkOS04NDFlLTQ4NTNjYjQ0ODIxZA.jpg';
					break;
				case "IKHWAN":
				    name = '<@ikhwan>';
				    description = " ";
				    piclink = 'http://scontent.cdninstagram.com/t51.2885-19/s150x150/10569989_701470043312871_343776649_a.jpg';
				    break;
				case "VHEN":
				 	name = '<@vhenjoseph>';
				 	description = " ";
				 	piclink = 'https://pbs.twimg.com/profile_images/1445564935/253785_2074806798502_1494907892_32405091_4620734_n.jpg';
				 	break;
				case "CRAIG":
				 	name = '<@craig.roberts>';
				 	description = " ";
				 	piclink = 'https://avatars2.githubusercontent.com/u/461897?v=4&s=460';
				 	break;
				case "TIM":
				case "TIMOTHY":
				 	name = '<@timothyteoh>';
				 	description = " ";
				 	piclink = 'http://www.emoji.co.uk/files/phantom-open-emojis/smileys-people-phantom/12286-robot-face.png';
				 	break;
				case "RAYMOND":
					name = '<@raymondyong>';
				 	description = " ";
				 	piclink = 'http://www.emoji.co.uk/files/emoji-one/smileys-people-emoji-one/1325-robot-face.png';
				 	break;
				case "EDI":
				 	name = '<@edi_di_ong>';
				 	description = " ";
				 	piclink = 'https://68.media.tumblr.com/baed62bf8f57e8f1853715d65aca75c2/tumblr_o6lueuzfkf1qbjpavo1_500.gif';
				 	break;
				case "JEN":
				 	name = '<@jenelyn>';
				 	description = " ";
				 	piclink = 'http://elgsuii.weebly.com/uploads/3/2/1/6/32167449/9497427.jpg?350';
				 	break;
				case "WEB":
				case "WEBINA":
				 	name = '<@webina>';
				 	description = " ";
				 	piclink = 'http://images6.fanpop.com/image/photos/40400000/Wonder-Woman-Icon-wonder-woman-2017-40413600-200-200.jpg';
				 	break;
				case "KWEENY":
				    name = '<@kweenyl>';
				    description = " ";
				    piclink = "https://i.ytimg.com/vi/yUe_G1oL9qk/maxresdefault.jpg";
				    break;
				case "LEE":
				    name= '<@lee.fenlan>';
				    description = "";
				    piclink = "https://media.licdn.com/mpr/mpr/shrinknp_200_200/p/1/000/099/2a3/0e96b21.jpg";
				    break;
				case "MATT":
				    name= '<@matt.kellett>';
				    description = "";
				    piclink = "https://pbs.twimg.com/profile_images/1600975088/matthew_kellett_400x400.jpg";
				    break;
				default:
				    msg = '';
				    name = 'your friendly bot';
				    title = 'How can I help you?';
				    piclink ='http://nicolfinancial.com/wp-content/uploads/2013/10/Glow-Ball-icon-300x300.png';
				    description = 'Just type the name of the person you want to know';
				    break;
			}
	    	var reply_with_attachments = {
			    'username': msg,
			    'text': 'Hi, I\'m ' + name + '.',
			    'attachments': [
			      {
			        'fallback': 'To know me, ask me',
			        'title': title,
			        'text': description,
			        'color': '#7CD197'
			      }
			    ],
			    'icon_url': piclink
			    }
			bot.reply(message, reply_with_attachments);
    }
    else
    {
    	return false;
    }
    return true;
}

bot.startRTM()
