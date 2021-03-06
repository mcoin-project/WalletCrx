var lang, usbDevices = {};

var start = function(goToSignup) {
    var suffix = '';
    if (goToSignup) {
        suffix = '#create'
    }
    chrome.app.window.create(lang+'/wallet.html'+suffix, {
        'bounds': {
            'width': 992,
            'height': 700,
        },
        'id': 'wallet'
    }, function() {
        chrome.app.window.get('wallet').onClosed.removeListener(start);
        chrome.app.window.get('wallet').onClosed.addListener(function () {
            for (var i in usbDevices) {
                winUSBInterface.prototype.close.apply(usbDevices[i]);
            }
        });
    });
}
var SUPPORTED_LANGS = ['de', 'en', 'es', 'fr', 'it', 'pl', 'ru', 'uk', 'sv', 'nl', 'el', 'th'];
chrome.app.runtime.onLaunched.addListener(function(data) {
    chrome.storage.local.get('language', function(items) {
        lang = items.language;
        if (!lang) {
            chrome.i18n.getAcceptLanguages(function(langs) {
                lang = 'en';
                for (var i = 0; i < langs.length; i++) {
                    if (SUPPORTED_LANGS.indexOf(langs[i]) != -1) {
                        lang = langs[i];
                        break;
                    }
                }
                start(data.id == "launch_chrome_app_signup");
            });
        } else {
            start(data.id == "launch_chrome_app_signup");
        }
    });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.changeLang) {
        var win = chrome.app.window.get('wallet');
        lang = request.lang;
        win.onClosed.addListener(start);
        win.close();
    } else if (request.usbClaimed) {
        usbDevices[request.usbClaimed.device.handle] = request.usbClaimed;
    } else if (request.usbClosed) {
        delete usbDevices[request.usbClosed.device.handle];
    }
    return true;
});

chrome.runtime.onMessageExternal.addListener(function (msg, sender, sendResponse) {
    sendResponse('GreenAddress installed');
});
