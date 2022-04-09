var WNUM = Math.floor(Math.random() * WORDS.length);

document.addEventListener('DOMContentLoaded', function(e) {

    // Time Schedule - Every Midnight Reset for new Word
    if (BaseLocalStorage.isSupported()) {

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

        document.getElementById('wjs_countdown').textContent = GLOBAL_TIME_REMAINING_NEXT_WORD_SCHEDULE;

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

    Wordle.afterRenderCallback.push(function () {

        var self = Wordle;

        if (self.completedOn) {
            
            document.getElementById(self.elements.wjsShareId).classList.remove('-hide-element');

            showCountDown();

        }

    });

    Wordle.guessTryNotEnoughLettersCallback.push(function (remainingLetters) {

        alert('Please provide the required number of letters before submitting the guess. You have remaining ' + remainingLetters + ' letter(s).');

    });

    Wordle.guessTryNotInWordListCallback.push(function () {

        alert('The word that you provided is not valid, please try again.');

    });

    Wordle.gameOverWinCallback.push(function () {

        var self = Wordle;

        alert('Phew! you got the word!');

        document.getElementById(self.elements.wjsShareId).classList.remove('-hide-element');

        showCountDown();

    });

    Wordle.gameOverLoseCallback.push(function (correctWord) {

        var self = Wordle;

        alert(`Run out of guesses! Game over. The correct word is: "${correctWord}"`);

        document.getElementById(self.elements.wjsShareId).classList.remove('-hide-element');

        showCountDown();

    });

    Wordle.shareStatsCallback.push(function () {

        var self = Wordle;

        var win = self.stats.winInGuesssNumber ? self.stats.winInGuesssNumber : 'X';

        var stats = `WordleJS #${WNUM} ${win}/${self.maxNumberOfGuesses}\n\n`;

        stats += self.stats.progress.map(function (row) {
            return row.join('') + '\n';
        }).join('');

        navigator.clipboard.writeText(stats);

    });

    Wordle.wjsx = WORDS[WNUM];
    Wordle.events.onKeyUp();
    Wordle.events.onClickKeyPad();
    Wordle.events.onClickShareStats();
    Wordle.render();

});
