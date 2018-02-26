/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * The Intent Schema, Custom Slots, and Sample Utterances for this skill, as well as
 * testing instructions are located at http://amzn.to/1LzFrj6
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */

const Alexa = require('alexa-sdk');

const states = {
    STARTMODE: '_STARTMODE',                // Prompt the user to start or restart the game.
    ASKMODE: '_ASKMODE',                    // Alexa is asking user the questions.
    DESCRIPTIONMODE: '_DESCRIPTIONMODE'     // Alexa is describing the final choice and prompting to start again or quit
};


// Questions
const nodes = [{ "node": 1, "message": "珍しいビールを味わってみたいなぁ〜", "yes": 2, "no": 3 },
	       { "node": 2, "message": "今日はほろ酔い気分になりた〜い", "yes": 4, "no": 5 },
	       { "node": 3, "message": "今日は爽快な気分だぁ", "yes": 6, "no": 7 },
	       { "node": 4, "message": "フルーツ入りのビールに興味あるなぁ〜", "yes": 6, "no": 7 },
	       { "node": 5, "message": "アルコールの強い一品を味わってみたいなぁ〜", "yes": 6, "no": 7 },
	       { "node": 6, "message": "ベルギービール、飲んだことある？", "yes": 8, "no": 9 },
	       { "node": 7, "message": "今日はちょっと辛いことがあった〜", "yes": 10, "no": 11 },

	       // Answers & descriptions
	       { "node": 8, "message":  " セント・ベルナルデュス・アプト " , "yes": 0, "no": 0, 
		 "description":  " 柑橘系の香り、濃厚なフルボディ、高めのアルコール度数と、あらゆる面で味わい深い、ベルギービールの中でも最高級と言われる一品。ベルギー北西部、西フランダース産。海が近い土地柄か、ムール貝、エビなど魚介類に合うビールを産する醸造所が多いとのことだが、このビールも、ピッタリ。 "},
	       { "node": 9, "message":  " カンティロン・フランボワーズ " , "yes": 0, "no": 0, "description":  " FRAMBOISE は木イチゴ、ラズベリー。ランビックの酸味に、木イチゴのほのかな味わいが感じられる、上品なフルーツランビックビール。 "},
	       { "node": 10, "message":  " ビーケン " , "yes": 0, "no": 0, "description":  " 蜂蜜入りビール！ホップの苦さのほうが目立つ。蜂蜜の味は、甘さというより濃厚さに感じる。 "},
	       { "node": 11, "message":  " シャポー・ウィンター・グース " , "yes": 0, "no": 0, "description":  " 各種フルーツビールで有名なシャポーのクリスマス限定ビール。「各種」をすべて混ぜ合わせたような、何種類ものフルーティさを感じさせ、さらにグーズ、ランビックの酸っぱさがほんのり感じられる、クリスマスビールの定番ともいえる一品。 "},
	       { "node": 12, "message":  " リーフマンス・クリーク・ブリュット " , "yes": 0, "no": 0, "description":  " KRIEK は「さくらんぼ」。長期間漬け込んださくらんぼに加え、イチゴやラスベリーなど複数の果実をブレンドしたフルーティな一品。 "},
	       { "node": 13, "message":  " リーフマンス・グーテンバンド " , "yes": 0, "no": 0, "description":  " 「世界一複雑な味わいのビール」と言われている一品。確かに、いろんな味わいがする。レッドビールのような酸っぱさをより濃厚にして、そして麦芽の味わいもそして、アルコール度もしっかり、と、確かに一言では言えない。 "},
	       { "node": 14, "message":  " カスティエル " , "yes": 0, "no": 0, "description":  " アルコール度数が11度と高く、濃いエールビール、ストロング・ダーク・エール。１５世紀の農家が作っていたエールビールを復活させたもの。アルコールより、甘さと濃厚さをより感じさせるゴージャスな一品。 "},
	       { "node": 15, "message":  " ブルーセム・クリーク " , "yes": 0, "no": 0, "description":  " KRIEKは「さくらんぼ」。つまり、チェリー味のビール。甘さが主役だが、酸っぱさ、そしてしっかりとビールの味わいも同居する。 "},
	       { "node": 16, "message":  " セゾン " , "yes": 0, "no": 0, "description":  " セゾンビール。農民が冬の間、夏の過酷な労働時に呑むために仕込んだビール。しっかりとホップが効いた苦み、フルーティな香り、さっぱり感が際立つ。 "},
	       { "node": 17, "message":  " アフリゲム・ブロンド " , "yes": 0, "no": 0, "description":  " アビィ・ビール。ベルギーの修道院ビールでは最も歴史の最も古い歴史を持つもの。写真のように、大小の２つのグラスで楽しむのが特徴。「ボディ＆ソウル」という飲み方。注ぎ始めてから９割くらいは、大きな方のグラスに。こちらが「ボディ」。そして瓶底にある残りは小さい方へ。これが「ソウル」。同じ銘柄のビールとは全く思えないくらい、ぜーんぜん味わいが違う。ボディの方は、ふくよかな、甘みも感じる濃厚な味わい。ソウルの方は、苦さと麦芽のしっかりと感じられる味わい。同じボトルで全く別の味わい方ができる、こんな飲み方を一体誰が考え出したんだろう。 "},
	       { "node": 18, "message":  " アヘル " , "yes": 0, "no": 0, "description":  " 「BRUIN BIER」 とラベルにある。オランダ語? ブラウンというより、赤褐色。これもトラピストビール。甘くて、苦い。これまた不思議な、複雑な味。「コーヒーを思わせる」苦み、とあったけど、より柔らかい苦み、これだけでも、不思議。泡立ちも素晴らしい。病みつきになりそうなトラピストビール。 "},
	       { "node": 19, "message":  " ブーン　フランボワーズ " , "yes": 0, "no": 0, "description":  " 木イチゴ(FRAMBOISE) 味のビール。ベルギーの伝統芸といえるビール「ランビック」に木イチゴをブレンドしさらに発酵させた、ベルギービールお得意のフルーツビール。ビールに見えなくないですか？きれいなピンク色、コルクで閉栓されたビン、シャンパンかロゼワインかと見間違うところ。味わうと、フルーツの甘さが際立つ中、若干だがビールのコク、苦みを感じる、繊細な味。間違いなく、ビール。女性におすすめ。 "},
	       { "node": 20, "message":  " カンティヨン　グース " , "yes": 0, "no": 0, "description":  " ベルギー伝統のランビック。若いものと、何年もかけて熟成したものをブレンドした、「グースランビック」と呼ばれるビール。琥珀のようなきれいな色、しっかりとした香り、ランビックならではの強い酸味が特徴。 "},
	       { "node": 21, "message":  " セゾン　デュポン " , "yes": 0, "no": 0, "description":  " 「セゾンビール」は、南部の農家で夏飲むために冬場に作られたものが発展したもの。一言でいうと、「バランスがいい」。苦み、酸味、甘み、アルコール度数それぞれ、強過ぎず弱すぎず、どれも感じられて絶妙なバランスの味わい。 "},
	       { "node": 22, "message":  " ウェストマール・ダブル " , "yes": 0, "no": 0, "description":  " トラピストビールのひとつ。泡立ちと香りが豊かなのが特徴。「double」 とうい表示は、はアルコール度数が高いものにつけられるもの。さらに上は「tripel」。 "},
	       { "node": 23, "message":  " ピンク・キラー " , "yes": 0, "no": 0, "description":  " ピンクグレープフルーツのビール。アルコールや苦みより、グレープフルーツ味がずっと強く、ビールという感じがしない。アルコール苦手な方でもいけそう。 "},
	       { "node": 24, "message":  " オルヴァル " , "yes": 0, "no": 0, "description":  " オルヴァル修道院製のトラピストビール。苦みとコクが際立つ、トラピストビールの最高峰。アルコール度数も高め、どっしりとした味わい。 "},
	       { "node": 25, "message":  " ローデンバッハ　グラン　クリュ " , "yes": 0, "no": 0, "description":  " レッドビール。酸味が強く、独特の風味。酸っぱいビール! こうなるともはやビールという感じがしないですね。美味いですが。 "},
	       { "node": 26, "message":  " ロシュフォール10 " , "yes": 0, "no": 0, "description":  "トラピストビール。「トラピスト修道会」に属する修道院がつくった修道院ビールで、現存する６つのうちのひとつ。つまり坊主が作ったビール。甘く、でもビールの苦みもあり、濃厚かつ複雑な、どっしりとした味。アルコール度数は11%と高い。"},
	       { "node": 27, "message":  " ロシュフォール6 " , "yes": 0, "no": 0, "description":  " (8) や(10)はよく見かけるけど、(6)は生産量はロシュフォール全体の1%未満。どっしりとした濃厚さが特徴といえるロシュフォールだけど、(6)はテイスト感だけ残しながらサッパリ感を感じる。夏の暑い時期にピッタリの一杯かも。 "},
	       { "node": 28, "message":  " レフ・ブラウン " , "yes": 0, "no": 0, "description":  " 甘みとどっしりとした味わいが特徴的な、修道院ビールの一種、アビー・ビール。数あるベルギービールの中でもメジャーなもの。樽生最高。 "},
	       { "node": 29, "message":  " カンティヨン・クリーク " , "yes": 0, "no": 0, "description":  " ランビックにさくらんぼを漬け込んだ、フルーツのさわやかさ、甘さとゴージャス感を味わえる贅沢なフルーツビール。 "},
	       { "node": 30, "message":  " ヒューガルデン ホワイト " , "yes": 0, "no": 0, "description":  " 小麦が主原料のホワイトビール。見た目も味もさっぱりとした涼しげな感じ。暑い夏場におすすめ。日本で一番入手しやすいベルギービールなのでは。 "},
	       { "node": 31, "message":  " デ・コーニンク " , "yes": 0, "no": 0, "description":  " 樽生!アントワープで最も有名な醸造所、デ・コーニンクの冬季限定のベルジャンエール。香ばしい香りとカラメルの甘さが際立ち、飲み始めてしばらくすると、濃厚さとまろやかさを感じるからなのか、ほんの少し暖まる、なんとも不思議な味。美味い!  "},
	       { "node": 32, "message":  " シャポー・クリーク " , "yes": 0, "no": 0, "description":  " ベルギー独特の「ランビック」に、フルーツを２年以上漬け込んだ、ベルギービールお得意のフルーツビール。アルコール度数は、軽めの3.5%。製造歴100年のフルーツビールの「走り」みたいな存在。フルーツは、アプリコット、さくらんぼ、木イチゴなど多数、なんと、バナナまである。この写真は、さくらんぼ(KRIEK) 味。 "},
	       { "node": 33, "message":  " セント・イデスバルド・ブロンド " , "yes": 0, "no": 0, "description":  " 苦さがやや強く感じられる、ベルジャンエール。注いだ直後は、フルーティな香りが目立つが、飲んでいくうちに、苦さを強く感じていく。 "},
	       { "node": 34, "message":  " コルサイア " , "yes": 0, "no": 0, "description":  " ラベルの人物がコルサイア。海賊の名前。「海賊のように強いビール」ということらしい。アルコール度数は9.5%、高い。ただ味わいはそんなに「きつくは」なく、泡立ちがよく、フルーティな香りの中にホップの苦みをしっかりと感じさえる、典型的なベルジャンエール。「柔和な海賊」ということか。 "},
	       { "node": 35, "message":  " ヴィットハウト " , "yes": 0, "no": 0, "description":  " ものすごく最近できた、ホフ・テン・ドルマール醸造所というところで醸造された、冬季限定のビール。フルーティでスパイシーでやや苦い。しかもフルーツのいろんな味が。一体これは何が入ってるんだろう。どっしりとした味わいの多いクリスマスビールの中では、比較的さっぱりな感。なんと、材料に「チコリ」を使用。醸造所近傍でチコリのことをWit Goud (白い金)と呼ばれていたのが名前の由来。 "},
	       { "node": 36, "message":  " ギロチン " , "yes": 0, "no": 0, "description":  " 名前の由来は、そうそう、あの「ギロチン」。ラベルに書かれているのはギロチン台。フランス革命200年記念で発売されたゴールデンエール。ホップの苦みと香りが目立つ中、フルーツの甘みも感じられる、しっかりとした味。 "},
	       { "node": 37, "message":  " サタン・レッド " , "yes": 0, "no": 0, "description":  " ラベルに悪魔が。強烈なアルコール感が「悪魔」なのか？味わいは、ラベルの印象とは違い、カラメルのような甘さが中心の豊かさが感じられる。 "},
	       { "node": 38, "message":  " ストラッブ アイピーエー " , "yes": 0, "no": 0, "description":  " IPA はIndian Pale Ale ですね。強い苦みが印象的、と思って調べたら、IPA はインドからイギリスに運ぶ間に腐敗しないように、ホップの量が多めで、苦いのが特徴なのですね。初めて飲んで以降、どのバーにも置いていない。二度と味わえないのかも。 "},
	       { "node": 39, "message":  " シメイ・ブルー " , "yes": 0, "no": 0, "description":  " トラピストビール。レッド、ホワイト、ブルーとあるが、ブルーが一番アルコール度数が高い。素晴らしい香りと、深みのあるワインレッドのような色あい。ところで、ブルー/ホワイト/レッドの語源なんだろう。 "}
     ];

// This is used for keeping track of visited nodes when we test for loops in the tree
let visited;

// These are messages that Alexa says to the user during conversation

// This is the initial welcome message
const welcomeMessage = "「ベルギービール万歳」へようこそ！今日のあなたにぴったりなベルギービールを紹介します。いくつか質問をしますので、それぞれに「はい」もしくは「いいえ」でお答えください。始めますか？";

// This is the message that is repeated if the response to the initial welcome message is not heard
const repeatWelcomeMessage = "開始する場合は「はい」、終了する場合は「いいえ」でお答えください。";

// This is the message that is repeated if Alexa does not hear/understand the response to the welcome message
const promptToStartMessage = "開始する場合は「はい」、終了する場合は「いいえ」でお答えください。";

// This is the prompt during the game when Alexa doesnt hear or understand a yes / no reply
const promptToSayYesNo = "「はい」か「いいえ」でお答えください。";

// This is the response to the user after the final question when Alexa decides on what group choice the user should be given
const decisionMessage = "あなたにぴったりな一品は>";

const questionMessage = "質問です。>";

const decisionEndMessage = "です。<break time=\"500ms\"/>";

const descriptionStartMessage = "の説明です";

const pause500ms = "<break time=\"500ms\"/>";
const pause100ms = "<break time=\"100ms\"/>";

// This is the prompt to ask the user if they would like to hear a short description of their chosen profession or to play again
const playAgainMessage = "詳しい説明を聞きたいですか？「はい」か「いいえ」でお答えください。 ";

// This is the help message during the setup at the beginning of the game
const helpMessage = "ぴったりなベルビーギールを探す為にあなたに３つの質問をします。それぞれに「はい」か「いいえ」でお答えください。始めますか？";

// This is the goodbye message when the user has asked to quit the game
const goodbyeMessage = "さようなら、またお会いしましょう！";

const letsEnjoyMessage = "是非お楽しみください！";

const speechNotFoundMessage = "Could not find speech for node";

const nodeNotFoundMessage = "In nodes array could not find node";

const descriptionNotFoundMessage = "Could not find description for node";

const loopsDetectedMessage = "A repeated path was detected on the node tree, please fix before continuing";

const utteranceTellMeMore = "もっと知りたい";

const utterancePlayAgain = "もう一度やります";

// the first node that we will use
let START_NODE = 1;

// --------------- Handlers -----------------------

// Called when the session starts.
exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers(newSessionHandler, startGameHandlers, askQuestionHandlers, descriptionHandlers);
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
const startGameHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
    //    'AMAZON.YesIntent': function () {
    'YesIntent': function () {

	// ---------------------------------------------------------------
	// check to see if there are any loops in the node tree - this section can be removed in production code
	visited = [nodes.length];
	let loopFound = helper.debugFunction_walkNode(START_NODE);
	if( loopFound === true)
	{
	    // comment out this line if you know that there are no loops in your decision tree
	    this.response.speak(loopsDetectedMessage);
	}
	// ---------------------------------------------------------------

	// set state to asking questions
	this.handler.state = states.ASKMODE;

	// ask first question, the response will be handled in the askQuestionHandler
	let message = helper.getSpeechForNode(START_NODE);
	message = questionMessage + pause500ms + message;

	// record the node we are on
	this.attributes.currentNode = START_NODE;

	// ask the first question
	this.response.speak(message).listen(message);
	this.emit(':responseReady');
    },
    //    'AMAZON.NoIntent': function () {
    'NoIntent': function () {
	// Handle No intent.
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


// user will have been asked a question when this intent is called. We want to look at their yes/no
// response and then ask another question. If we have asked more than the requested number of questions Alexa will
// make a choice, inform the user and then ask if they want to play again
const askQuestionHandlers = Alexa.CreateStateHandler(states.ASKMODE, {

    //    'AMAZON.YesIntent': function () {
    'YesIntent': function () {
	// Handle Yes intent.
	helper.yesOrNo(this,'yes');
	this.emit(':responseReady');
    },
    //    'AMAZON.NoIntent': function () {
    'NoIntent': function () {
	// Handle No intent.
	helper.yesOrNo(this, 'no');
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

// user has heard the final choice and has been asked if they want to hear the description or to play again
const descriptionHandlers = Alexa.CreateStateHandler(states.DESCRIPTIONMODE, {

    //'AMAZON.YesIntent': function () {
    'YesIntent': function () {
	// Handle Yes intent.
	// reset the game state to start mode
	this.handler.state = states.STARTMODE;
	helper.giveDescription(this);
	this.emit(':responseReady');
    },
    //'AMAZON.NoIntent': function () {

    'NoIntent': function () {
	// Handle No intent.
	this.handler.state = states.STARTMODE;
	this.response.speak(goodbyeMessage);
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
    'DescriptionIntent': function () {
	const reply = this.event.request.intent.slots.Description.value;
	console.log('HEARD:' + reply);
	//    helper.giveDescription(this);
    },
    'Unhandled': function () {
	this.response.speak(promptToSayYesNo).listen(promptToSayYesNo);
	this.emit(':responseReady');
    }
});

// --------------- Helper Functions  -----------------------

const helper = {

    // gives the user more information on their final choice
    giveDescription: function (context) {

	// get the speech for the child node
	let description = helper.getDescriptionForNode(context.attributes.currentNode);

	let beername = helper.getSpeechForNode(context.attributes.currentNode);

	let message = beername + pause100ms + descriptionStartMessage + pause500ms + description + pause500ms;
	let enjoy = beername + pause100ms + letsEnjoyMessage;
	message = message + enjoy ;

	console.log(message);
	context.response.speak(message);
    },

    // logic to provide the responses to the yes or no responses to the main questions
    yesOrNo: function (context, reply) {

	// this is a question node so we need to see if the user picked yes or no
	let nextNodeId = helper.getNextNode(context.attributes.currentNode, reply);

	// error in node data
	if (nextNodeId == -1)
	{
	    context.handler.state = states.STARTMODE;

	    // the current node was not found in the nodes array
	    // this is due to the current node in the nodes array having a yes / no node id for a node that does not exist
	    context.response.speak(nodeNotFoundMessage);
	}

	// get the speech for the child node
	let message = helper.getSpeechForNode(nextNodeId);

	// have we made a decision
	if (helper.isAnswerNode(nextNodeId) === true) {

	    // set the game state to description mode
	    context.handler.state = states.DESCRIPTIONMODE;

	    // append the play again prompt to the decision and speak it
	    message = decisionMessage + pause500ms + message + decisionEndMessage + playAgainMessage;
	} else {
	    message = questionMessage + pause500ms + message;
	}

	// set the current node to next node we want to go to
	context.attributes.currentNode = nextNodeId;

	context.response.speak(message).listen(message);
    },

    // gets the description for the given node id
    getDescriptionForNode: function (nodeId) {

	for (let i = 0; i < nodes.length; i++) {
	    if (nodes[i].node == nodeId) {
		return nodes[i].description;
	    }
	}
	return descriptionNotFoundMessage + nodeId;
    },

    // returns the speech for the provided node id
    getSpeechForNode: function (nodeId) {

	for (let i = 0; i < nodes.length; i++) {
	    if (nodes[i].node == nodeId) {
		return nodes[i].message;
	    }
	}
	return speechNotFoundMessage + nodeId;
    },

    // checks to see if this node is an choice node or a decision node
    isAnswerNode: function (nodeId) {

	for (let i = 0; i < nodes.length; i++) {
	    if (nodes[i].node == nodeId) {
		if (nodes[i].yes === 0 && nodes[i].no === 0) {
		    return true;
		}
	    }
	}
	return false;
    },

    // gets the next node to traverse to based on the yes no response
    getNextNode: function (nodeId, yesNo) {
	for (let i = 0; i < nodes.length; i++) {
	    if (nodes[i].node == nodeId) {
		if (yesNo == "yes") {
		    return nodes[i].yes;
		}
		return nodes[i].no;
	    }
	}
	// error condition, didnt find a matching node id. Cause will be a yes / no entry in the array but with no corrosponding array entry
	return -1;
    },

    // Recursively walks the node tree looking for nodes already visited
    // This method could be changed if you want to implement another type of checking mechanism
    // This should be run on debug builds only not production
    // returns false if node tree path does not contain any previously visited nodes, true if it finds one
    debugFunction_walkNode: function (nodeId) {

	// console.log("Walking node: " + nodeId);

	if( helper.isAnswerNode(nodeId) === true) {
	    // found an answer node - this path to this node does not contain a previously visted node
	    // so we will return without recursing further

	    // console.log("Answer node found");
	    return false;
	}

	// mark this question node as visited
	if( helper.debugFunction_AddToVisited(nodeId) === false)
	{
	    // node was not added to the visited list as it already exists, this indicates a duplicate path in the tree
	    return true;
	}

	// console.log("Recursing yes path");
	let yesNode = helper.getNextNode(nodeId, "yes");
	let duplicatePathHit = helper.debugFunction_walkNode(yesNode);

	if( duplicatePathHit === true){
	    return true;
	}

	// console.log("Recursing no");
	let noNode = helper.getNextNode(nodeId, "no");
	duplicatePathHit = helper.debugFunction_walkNode(noNode);

	if( duplicatePathHit === true){
	    return true;
	}

	// the paths below this node returned no duplicates
	return false;
    },

    // checks to see if this node has previously been visited
    // if it has it will be set to 1 in the array and we return false (exists)
    // if it hasnt we set it to 1 and return true (added)
    debugFunction_AddToVisited: function (nodeId) {

	if (visited[nodeId] === 1) {
	    // node previously added - duplicate exists
	    // console.log("Node was previously visited - duplicate detected");
	    return false;
	}

	// was not found so add it as a visited node
	visited[nodeId] = 1;
	return true;
    }
};
