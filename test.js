var yomiagezan = require('./yomiagezan');

var yomiage_array = new Array(10);

yomiagezan.getYomiageContents(yomiage_array,5);
for (var i = 0; i < yomiage_array.length; i++) {
    console.log(yomiage_array[i]);
}
