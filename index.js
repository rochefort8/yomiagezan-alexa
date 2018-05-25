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
    YOMIAGEMODE: '_YOMIAGEMODE',            // Alexa is asking user the questions.
    REPEATMODE:  '_REPEATRMODE',            // Alexa is asking user the questions.    
};

// This is used for keeping track of visited nodes when we test for loops in the tree
let visited;

// These are messages that Alexa says to the user during conversation

// This is the initial welcome message
const welcomeMessage = "日本人のこころ、小倉百人一首を楽しみましょう。百句ある歌を、ランダムな順番で読み上げます。始めますか？";

// This is the message that is repeated if the response to the initial welcome message is not heard
const repeatWelcomeMessage = "開始する場合は「はい」、終了する場合は「いいえ」でお答えください。";

// This is the message that is repeated if Alexa does not hear/understand the response to the welcome message
const promptToStartMessage = "開始する場合は「はい」、終了する場合は「いいえ」でお答えください。";

// This is the prompt during the game when Alexa doesnt hear or understand a yes / no reply
const promptToSayYesNo = "今の句を繰り返す場合は「もう一度」、次の句に進む場合は「次へ」、終了する場合は「終了」と呼びかけてください。";

const pause500ms = "<break time=\"500ms\"/>";
const pause100ms = "<break time=\"100ms\"/>";
const pause1s = "<break time=\"1000ms\"/>";
const pause2s = "<break time=\"2000ms\"/>";

// This is the prompt to ask the user if they would like to hear a short description of their chosen profession or to play again
const playAgainMessage = "これで終わりです。もう一度やりますか？「はい」か「いいえ」でお答えください。 ";


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

// --------------- Handlers -----------------------

// Called when the session starts.
exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers(newSessionHandler, startHandlers, yomiageHandlers,repeatHandlers);
    alexa.execute();
};

// set state to start up and  welcome the user
const newSessionHandler = {
    'LaunchRequest': function () {
	this.handler.state = states.STARTMODE;
	this.response.speak(welcomeMessage).listen(repeatWelcomeMessage);
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

// Called at the start of the game, picks and asks first question for the user
const startHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
    'AnswerIntent': function () {
	if (this.event.request.intent != undefined) {
	    const intent = this.event.request.intent;
	    if (intent.slots.answer != undefined) {
		const answer = this.event.request.intent.slots.answer.value;
		let message = answer + "と答えました。";
		this.response.speak(message).listen(message);		
		this.emit(':responseReady');
		
	    }
	}
    },
    'AMAZON.YesIntent': function () {
	this.handler.state = states.YOMIAGEMODE;

	// Start first action
	yomiageArray = new Array(5) ;
	helper.createYomiageContents(yomiageArray,8);
	let message = helper.getYomiageMessageByRank(yomiageArray, 8);
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
	this.response.speak(promptToStartMessage).listen(promptToStartMessage);
	this.emit(':responseReady');
    }
});

const yomiageHandlers = Alexa.CreateStateHandler(states.YOMIAGEMODE, {
    'AnswerIntent': function () {
	if (this.event.request.intent != undefined) {
	    this.handler.state = states.REPEATMODE;		    
	    const intent = this.event.request.intent;
	    if (intent.slots.answer != undefined) {
		const answer_by_voice = this.event.request.intent.slots.answer.value;
		let answer = helper.getAnswer(yomiageArray) ;
		let message = "" ;
		if (answer == answer_by_voice) {
		    message = "正解です。"+ pause500ms + "答えは" + answer + "です。";
		} else {
		    message = "残念" + pause500ms + answer_by_voice + "と答えましたが、正解は" + answer + "です。";		    	  }
		this.response.speak(message).listen(message);		
		this.emit(':responseReady');
		
	    }
	}
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
	this.response.speak(promptToSayYesNo).listen(promptToSayYesNo);
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

    'AMAZON.RepeatIntent': function () {
	this.handler.state = states.YOMIAGEMODE;
	helper.createYomiageContents(yomiageArray,8);	
	let message = helper.getYomiageMessageByRank(yomiageArray, 8);	
	this.response.speak(message).listen(message);		
	this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
	this.response.speak(promptToSayYesNo).listen(promptToSayYesNo);
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
    
    getYomiageMessageByRank: function (yomiageArray) {

	let message = "" ;
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
