require('./index.scss');

import _ from 'lodash';

window.onload = function() {
    console.log("=====", process.env.NODE_ENV)
    var text = document.getElementsByClassName('content-div')
    console.log(text.length)
    console.log(text[0].innerHTML)
    var contentTest = _.repeat('呵呵哒 ', 2)
    console.log(contentTest, "....")

    document.body.addEventListener('click', function(e){
        text[0].innerHTML = "hello wrold";
    })
}