/*
  Copyright
*/

const yomiage_rank_list = [
		{ "min_digit": "",  "max_digit": ""  },
    /*  1 */	{ "min_digit": "5", "max_digit": "10" },
    /*  2 */	{ "min_digit": "5", "max_digit": "8" },
    /*  3 */	{ "min_digit": "3", "max_digit": "6" },
    /*  4 */	{ "min_digit": "3", "max_digit": "5" },
    /*  5 */	{ "min_digit": "3", "max_digit": "4" },
    /*  6 */	{ "min_digit": "2", "max_digit": "3" },
    /*  7 */	{ "min_digit": "2", "max_digit": "2" },
    /*  8 */	{ "min_digit": "1", "max_digit": "2" },
];

const anzan_rank_list = [
		{ "min_digit": "",  "max_digit": ""  },
    /*  1 */	{ "min_digit": "3", "max_digit": "4" },
    /*  2 */	{ "min_digit": "2", "max_digit": "3" },
    /*  3 */	{ "min_digit": "2", "max_digit": "2" },
    /*  4 */	{ "min_digit": "2", "max_digit": "2" },
    /*  5 */	{ "min_digit": "1", "max_digit": "2" },
    /*  6 */	{ "min_digit": "1", "max_digit": "1" },
];

exports.createYomiageContents = function (array,rank) {

    rank_list = yomiage_rank_list ;
    if (rank_list.length <= rank) {
	console.log("Rank too big") ;
	return ;
    }
    let min_value = Math.pow(10,(rank_list[rank].min_digit - 1));
    let max_value = Math.pow(10,(rank_list[rank].max_digit)) - 1;    

    for (var i = 0; i < array.length; i++) {
	array[i] = Math.floor(Math.random() * (max_value - min_value + 1)) + min_value ;
    }
};



    




