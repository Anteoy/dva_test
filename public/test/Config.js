var Config = {
    appKey: "17KouyuTestAppKey",
    secretKey: "17KouyuTestSecretKey"
};

if (typeof console == "undefined") {
    console = {
        log: function(){
        }
    }
}

(function(){

    function getCss(src){
        document.write('<' + 'link href="' + src + '"' +
        ' rel="stylesheet" type="text/css" />');
    }
    
    function getScript(src){
        document.write('<' + 'script src="' + src + '"' +
        ' type="text/javascript"><' +
        '/script>');
    }
    
    getScript("../iload.js");
	getScript("../Resources/themes/default/js/class.js");
})();
