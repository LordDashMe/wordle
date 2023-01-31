document.addEventListener('DOMContentLoaded', function(e) {

    window.WNUM = ((Math.round(moment().dayOfYear() + moment().year()) / window._WS.length) * window._WS.length) + 1;

    if (window.WNUM > window._WS.length) {
        window.WNUM = Math.floor(window.WNUM / window._WS.length) * 1;
    }

    window.WNUM = Math.floor(window.WNUM);

    WordleJS.wjsn = window.WNUM;

    WordleJS.lookUpCollection = window._WS;

    if (BaseLocalStorage.isSupported()) {

        // Do some clean up for old version of data.
        if (! BaseLocalStorage.get('wjs_version') || BaseLocalStorage.get('wjs_version') !== GLOBAL_WJS_VERSION) {
            
            BaseLocalStorage.set('wjs_version', GLOBAL_WJS_VERSION);
            
            if (BaseLocalStorage.get('wjs')) {
                BaseLocalStorage.remove('wjs');
            }
        }

        // Time Schedule - Every Midnight Reset for new Word
        if (! BaseLocalStorage.get('wjs_next_word_schedule')) {
            BaseLocalStorage.set('wjs_next_word_schedule', GLOBAL_NEXT_WORD_SCHEDULE);
        } else if (BaseLocalStorage.get('wjs_next_word_schedule') < GLOBAL_NEXT_WORD_SCHEDULE) {
            BaseLocalStorage.set('wjs_next_word_schedule', GLOBAL_NEXT_WORD_SCHEDULE);
            BaseLocalStorage.remove('wjs');
        }

    } else {
        alert('The local storage is not supported with the current browser some of the features might not working properly.');
    }

    var showCountDown = function () {

        if (! BaseLocalStorage.isSupported()) {
            return;
        }

        document.getElementById('wjs_countdown_container').classList.remove('-hide-element');

        document.getElementById('wjs_countdown').textContent = moment.utc(moment.duration(GLOBAL_NEXT_WORD_SCHEDULE - GLOBAL_CURRENT_DATE).asMilliseconds()).format('HH:mm:ss');

        var countdown = setInterval(function () {

            GLOBAL_CURRENT_DATE = Date.now();

            if (GLOBAL_CURRENT_DATE > GLOBAL_NEXT_WORD_SCHEDULE) {
                clearInterval(countdown);
                return;
            }

            var timeRemaining = moment.utc(
                moment.duration(GLOBAL_NEXT_WORD_SCHEDULE - GLOBAL_CURRENT_DATE).asMilliseconds()
            ).format('HH:mm:ss');

            document.getElementById('wjs_countdown').textContent = timeRemaining;

        }, 1000);

    };

    WordleJS.afterRenderCallback.push(function () {

        var self = WordleJS;

        if (self.completedOn) {
            
            document.getElementById('wjs_options_container').classList.remove('-hide-element');

            showCountDown();

        }

    });

    WordleJS.guessTryNotEnoughLettersCallback.push(function (remainingLetters) {

        alert('Provide the required number of letter(s) before submitting the guess. You have remaining ' + remainingLetters + ' letter(s).');

    });

    WordleJS.guessTryNotInWordListCallback.push(function () {

        alert('The word that you provided is invalid.');

    });

    WordleJS.gameOverWinCallback.push(function (correctWord) {

        var self = WordleJS;

        self.wotd = correctWord;

        alert('Phew! you got the word!');

        document.getElementById('wjs_options_container').classList.remove('-hide-element');

        showCountDown();

    });

    WordleJS.gameOverLoseCallback.push(function (correctWord) {

        var self = WordleJS;

        self.wotd = correctWord;

        alert('Game over! sorry, you\'ve run out of guesses. The correct word is: "' + correctWord.toUpperCase() + '".');

        document.getElementById('wjs_options_container').classList.remove('-hide-element');

        showCountDown();

    });

    WordleJS.shareStatsCallback.push(function () {

        var self = WordleJS;

        var win = self.stats.winInGuesssNumber ? self.stats.winInGuesssNumber : 'X';

        var stats = `WordleJS #${self.wjsn} ${win}/${self.maxNumberOfGuesses}\n\n`;

        stats += self.stats.progress.map(function (row) { return row.join('') + '\n'; }).join('');

        var clipboard = new ClipboardJS('#wjs_share', {
            text: function () { return stats; }
        });

        clipboard.on('success', function(e) {
            alert('Copied');
            e.clearSelection();
            clipboard.destroy();
        });

        clipboard.on('error', function(e) {
            alert('Share failed');
            clipboard.destroy();
        });

    });

    WordleJS.setWjsx(window._WS[window.WNUM]);

    WordleJS.events.onKeyUp();

    WordleJS.events.onClickKeyPad();

    WordleJS.events.onClickShareStats();

    WordleJS.render();

    document.getElementById('wjs_search_meaning').addEventListener('click', function (e) {

        window.open('https://www.google.com.ph/search?q=' + WordleJS.wotd + '+meaning', '_blank');

    });

});
