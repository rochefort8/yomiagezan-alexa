/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * The Intent Schema, Custom Slots, and Sample Utterances for this skill, as well as
 * testing instructions are located at http://amzn.to/1LzFrj6
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */

const Alexa = require('alexa-sdk');
const yomiagezan = require('./yomiagezan');

const states = {
    STARTMODE:   '_STARTMODE',             // Prompt the user to start or restart the game.
    LANKMODE:   '_LANKMODE',            // Alexa is asking user the questions
    CONFIRMMODE: '_CONFIRMMODE',            // Alexa is asking user the questions.
    YOMIAGEMODE: '_YOMIAGEMODE',            // Alexa is asking user the questions.
    REPEATMODE:  '_REPEATRMODE',            // Alexa is asking user the questions.    
};

// This is used for keeping track of visited nodes when we test for loops in the tree
let visited;

// These are messages that Alexa says to the user during conversation

// This is the initial welcome message
const welcomeMessage = "「読み上げ算」のスキルです。そろばんや暗算で、音声で読み上げられた数字を順に足し引きし、結果を音声で答えると、答え合わせをしてくれます。";

const settingLankMessage = "読み上げの難しさを示す「級」を指定しましょう！「九級」から一級によって読み上げる数字の桁数、速度、個数が変わり、級の数字が小さくなるほど難しくなります。";

const repeatSettingLankMessage = "「一級」から「九級」まで、音声で指定してください。";

// This is the message that is repeated if the response to the initial welcome message is not heard
const repeatWelcomeMessage = "開始する場合は「はい」、終了する場合は「いいえ」でお答えください。";

// This is the message that is repeated if Alexa does not hear/understand the response to the welcome message
const promptToStartMessage = "開始する場合は「はい」、終了する場合は「いいえ」でお答えください。";

// This is the prompt during the game when Alexa doesnt hear or understand a yes / no reply
const promptToSayYesNo = "結果を数字でお答えください。読み上げをもう一度繰り返す場合は「もう一度」、終了する場合は「終了」と呼びかけてください。";

const pause500ms = "<break time=\"500ms\"/>";
const pause100ms = "<break time=\"100ms\"/>";
const pause1s = "<break time=\"1000ms\"/>";
const pause2s = "<break time=\"2000ms\"/>";

const repeatAnswerMessage = "結果を数字でお答えください。";

// This is the prompt to ask the user if they would like to hear a short description of their chosen profession or to play again
const playAgainMessage = "もう一度やりますか？「はい」か「いいえ」でお答えください。 ";

const helpMessage ="「読み上げ算」のスキルです。まず、問題の難易度を「級」で指定します。級があがるに従って、桁数、読み上げ速度が速くなります。その後、「願いましては」の音声のあと、数字が所定回数音声で読み上げられますので、そのとおりに加減算をしてください。最後は「～では」の音声で終わります。その後、「答えは」の後に計算結果を音声で回答してください。たとえば「答えは514」のような感じです。それに対して、正解もしくは不正解が音声で返されます。" ;

// This is the goodbye message when the user has asked to quit the game
const goodbyeMessage = "さようなら、またお会いしましょう！";

const endMessage = "これで終わりです。さようなら、またお会いしましょう！";

const speechNotFoundMessage = "Could not find speech for node";

const nodeNotFoundMessage = "In nodes array could not find node";

const descriptionNotFoundMessage = "Could not find description for node";

const loopsDetectedMessage = "A repeated path was detected on the node tree, please fix before continuing";

const utteranceTellMeMore = "もっと知りたい";

const utterancePlayAgain = "もう一度やります";

// the first node that we will use
let START_NODE = 1;

let readingPosition = 0 ;
let readingOrderArray ;
let numberOfTotalReading = 100 ;

let yomiageRank = 0 ;

// --------------- Handlers -----------------------

// Called when the session starts.
exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers(newSessionHandler, startHandlers, 
			   settingLankHandlers,confirmLankHandlers,yomiageHandlers,repeatHandlers);
    alexa.execute();
};

// set state to start up and  welcome the user
const newSessionHandler = {
    'LaunchRequest': function () {
	this.handler.state = states.STARTMODE;
	let message = welcomeMessage + repeatWelcomeMessage ;
	this.response.speak(message).listen(message);
	this.emit(':responseReady');
    },'AMAZON.HelpIntent': function () {
	this.handler.state = states.STARTMODE;
	this.response.speak(helpMessage).listen(helpMessage);
	this.emit(':responseReady');
    },
    'Unhandled': function () {
	this.handler.state = states.STARTMODE;
	this.response.speak(promptToStartMessage).listen(promptToStartMessage);
	this.emit(':responseReady');
    }
};

// --------------- Functions that control the skill's behavior -----------------------

const startHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
    'AMAZON.YesIntent': function () {
	this.handler.state = states.LANKMODE;
	let message = settingLankMessage + repeatSettingLankMessage;
	this.response.speak(message).listen(message);
	this.emit(':responseReady');
    },
    'AMAZON.NoIntent': function () {
	this.response.speak(goodbyeMessage);
	this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
	this.response.speak(goodbyeMessage);
	this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
	this.response.speak(goodbyeMessage);
	this.emit(':responseReady');
    },
    'AMAZON.StartOverIntent': function () {
	this.response.speak(promptToStartMessage).listen(promptToStartMessage);
	this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
	this.response.speak(helpMessage).listen(helpMessage);
	this.emit(':responseReady');
    },
    'Unhandled': function () {
	let message = welcomeMessage + repeatWelcomeMessage ;
	this.response.speak(message).listen(message);
	this.emit(':responseReady');
    }
});


// Called at the start of the game, picks and asks first question for the user
const settingLankHandlers = Alexa.CreateStateHandler(states.LANKMODE, {
    'LankIntent': function () {
	if (this.event.request.intent != undefined) {
	    const intent = this.event.request.intent;
	    const slot = intent.slots.lankNumber ;
	    if (slot != undefined) {
		if (slot.resolutions.resolutionsPerAuthority != undefined) {
		    const resolutionsPerAuthority = slot.resolutions.resolutionsPerAuthority;
		    if (resolutionsPerAuthority.length > 0) {
			const values = resolutionsPerAuthority[0].values;
			if( values != undefined && values.length > 0){
			    let rank =  values[0].value.id;
			    let message = "" ;
			    if ( (1 <= rank) && (rank <= 9 ) ) {
				yomiageRank = rank ;
				this.handler.state = states.CONFIRMMODE;
				message = rank + "級は、" + helper.createDigitMessage(rank) + "の足し算、引き算になります。よろしければ「はい」、違う級を指定するのであれば「いいえ」とお答えください。";

			    } else {
				message = rank + " と聞こえました." + repeatSettingLankMessage;
			    }
			    this.response.speak(message).listen(message);		
			    this.emit(':responseReady');
			    return ;
			}
		    }
		}
	    }
	}
	let message = "よく聞き取れませんでしたので、もう一度お願いします。";
	this.response.speak(message).listen(settingLankMessage);		
	this.emit(':responseReady');
    },

    'AMAZON.StopIntent': function () {
	this.response.speak(goodbyeMessage);
	this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
	this.response.speak(goodbyeMessage);
	this.emit(':responseReady');
    },
    'AMAZON.StartOverIntent': function () {
	this.response.speak(promptToStartMessage).listen(promptToStartMessage);
	this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
	this.response.speak(settingLankMessage).listen(repeatSettingLankMessage);
	this.emit(':responseReady');
    },
    'Unhandled': function () {
	this.response.speak(promptToStartMessage).listen(promptToStartMessage);
	this.emit(':responseReady');
    }
});

// Called at the start of the game, picks and asks first question for the user
const confirmLankHandlers = Alexa.CreateStateHandler(states.CONFIRMMODE, {
    'AMAZON.YesIntent': function () {
	this.handler.state = states.YOMIAGEMODE;

	yomiageArray = new Array(5) ;

	let message = yomiageRank + "級の読み上げをはじめます。" + pause1s ;
	helper.createYomiageContents(yomiageArray,yomiageRank);
	message += helper.getYomiageMessageByRank(yomiageArray, yomiageRank);
	message += pause1s + repeatAnswerMessage ;
	this.response.speak(message).listen(message);
	this.emit(':responseReady');
    },
    'AMAZON.NoIntent': function () {
	this.handler.state = states.LANKMODE;
	this.response.speak(settingLankMessage).listen(repeatSettingLankMessage);
	this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
	this.response.speak(goodbyeMessage);
	this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
	this.response.speak(goodbyeMessage);
	this.emit(':responseReady');
    },
    'AMAZON.StartOverIntent': function () {
	this.response.speak(promptToStartMessage).listen(promptToStartMessage);
	this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
	this.response.speak(helpMessage).listen(helpMessage);
	this.emit(':responseReady');
    },
    'Unhandled': function () {
	this.response.speak(promptToStartMessage).listen(promptToStartMessage);
	this.emit(':responseReady');
    }
});

const yomiageHandlers = Alexa.CreateStateHandler(states.YOMIAGEMODE, {
    'AnswerIntent': function () {
	if (this.event.request.intent != undefined) {
	    const intent = this.event.request.intent;
	    if (intent.slots.answer != undefined) {
		const answer_by_voice = this.event.request.intent.slots.answer.value;
		if (isNaN(answer_by_voice) == false) {
		    this.handler.state = states.REPEATMODE;		    
		    let answer = helper.getAnswer(yomiageArray) ;
		    let message = "" ;
		    if (answer == answer_by_voice) {
			message = "正解です。"+ pause500ms + "答えは" + answer + "です。";
		    } else {
			message = "残念" + pause500ms + answer_by_voice + "と答えましたが、正解は" + answer + "です。";		           }
		    message += pause1s + playAgainMessage ;
		    this.response.speak(message).listen(message);		
		    this.emit(':responseReady');
		    return ;
		}
	    }
	}
	let message = "よく聞き取れませんでしたので、もう一度お願いします。";
	message += repeatAnswerMessage ;
	this.response.speak(message).listen(settingLankMessage);		
	this.emit(':responseReady');
    },
    'AMAZON.YesIntent': function () {
	this.handler.state = states.REPEATMODE;	
	let message = helper.getAnswerMessage(yomiageArray) ;
	this.response.speak(message).listen(message);	
	this.emit(':responseReady');
    },
    'AMAZON.RepeatIntent': function () {
	let message = helper.getYomiageMessageByRank(yomiageArray, 8);
	this.response.speak(message).listen(message);		
	this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
	this.response.speak(helpMessage).listen(helpMessage);		
	this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
	this.response.speak(goodbyeMessage);
	this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
	this.response.speak(goodbyeMessage);
	this.emit(':responseReady');
    },
    'AMAZON.StartOverIntent': function () {
	// reset the game state to start mode
	this.handler.state = states.STARTMODE;
	this.response.speak(welcomeMessage).listen(repeatWelcomeMessage);
	this.emit(':responseReady');
    },
    'Unhandled': function () {
	this.response.speak(promptToSayYesNo).listen(promptToSayYesNo);
	this.emit(':responseReady');
    }
});

const repeatHandlers = Alexa.CreateStateHandler(states.REPEATMODE, {

    'AMAZON.YesIntent': function () {
	this.handler.state = states.YOMIAGEMODE;
	helper.createYomiageContents(yomiageArray,yomiageRank);	
	let message = helper.getYomiageMessageByRank(yomiageArray,yomiageRank );	
	message += pause1s + repeatAnswerMessage ;
	this.response.speak(message).listen(message);		
	this.emit(':responseReady');
    },
    'AMAZON.NoIntent': function () {
	this.response.speak(goodbyeMessage);
	this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
	this.response.speak(helpMessage).listen(helpMessage);	
	this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
	this.response.speak(goodbyeMessage);
	this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
	this.response.speak(goodbyeMessage);
	this.emit(':responseReady');
    },
    'AMAZON.StartOverIntent': function () {
	// reset the game state to start mode
	this.handler.state = states.STARTMODE;
	this.response.speak(welcomeMessage).listen(repeatWelcomeMessage);
	this.emit(':responseReady');
    },
    'Unhandled': function () {
	this.response.speak(promptToSayYesNo).listen(promptToSayYesNo);
	this.emit(':responseReady');
    }
});

// --------------- Helper Functions  -----------------------

const helper = {
    createYomiageContents: function (yomiageArray, rank) {
    	yomiagezan.createYomiageContents(yomiageArray, rank);
    },

    createDigitMessage: function (rank) {
	let min_digit = yomiagezan.getMinimalDigitForYomiage(rank);
	let max_digit = yomiagezan.getMaxDigitForYomiage(rank);

	let message = "" ;
	if (min_digit == max_digit) {
	    message = min_digit + "桁" ;
	} else {
	    message = min_digit + "桁から" + max_digit + "桁" ;
	}
	return message;
    },

    getYomiageMessageByRank: function (yomiageArray) {

	let message = "願いましては" + pause500ms ;
	for (var i = 0; i < yomiageArray.length; i++) {
	    message += yomiageArray[i] + "円" ;
	    if (i < yomiageArray.length - 1) {
		message +="なり" + pause1s ;
	    } else {
		message += "では" ;
	    }
	}
	return message ;
    },

    getAnswer: function (yomiageArray) {
	let sum = 0 ;
	for (var i = 0; i < yomiageArray.length; i++) {
	    sum += yomiageArray[i] ;
	}
	return sum ;
    },
	
    getAnswerMessage: function (yomiageArray, rank) {
	let answer = getAnswer(yomiageArray) ;
	let message = "答えは" + pause100ms + answer + "円です。" ;
	return message ;
    }
};
