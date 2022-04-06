var wordNumber = Math.floor(Math.random() * WORDS.length);
var solution = WORDS[wordNumber];

var Wordle = {

    maxNumberOfGuesses: 6,
    maxNumberOfLetters: 5,

    progressFlags: {
        correct: '🟩',
        present: '🟨',
        absent: '⬛'
    },

    colorFlags: {
        correct: 'green',
        present: 'yellow',
        absent: 'grey'
    },

    remainingGuessesCounter: 0,
    letterCounter: 0,
    currentGuessLettersCollection: [],

    stats: {
        winInGuesssNumber: 0,
        progress: []
    },

    elements: {
        wjsGameBoardId: 'wjs_game_board',
        wjsKeyboardId: 'wjs_keyboard',
        wjsShareId: 'wjs_share',

        wjsKeyboardRowKeypadClass: 'wjs-keyboard-row__keypad',

        wjsGameBoardLetterContainer: 'wjs-game-board-letter-container',
        wjsGameBoardLetterItem: 'wjs-game-board-letter-item',
       
        wjsGameBoardLetterItemModifierFilled: '-filled',
    },

    process: {

        checkGuessLetters: function () {

            var self = Wordle;

            var letterContainer = (
                document.getElementsByClassName(self.elements.wjsGameBoardLetterContainer)[
                    self.maxNumberOfGuesses - self.remainingGuessesCounter
                ]
            );

            var guessString = self.currentGuessLettersCollection.join('');

            var correctSolution = Array.from(solution);

            if (guessString.length != self.maxNumberOfLetters) {
                alert('Not enough letters!');
                return;
            }

            if (! WORDS.includes(guessString)) {
                alert('Word not in list!');
                return;
            }

            var statsProgress = [];

            for (var x = 0; x < self.maxNumberOfLetters; x++) {

                var color = '';
                var letterItem = letterContainer.children[x];
                var letter = self.currentGuessLettersCollection[x];

                var letterPosition = correctSolution.indexOf(letter);

                if (letterPosition === -1) {
                    color = self.colorFlags.absent;
                    statsProgress.push(self.progressFlags.absent);
                } else {

                    if (letter === correctSolution[x]) {
                        color = self.colorFlags.correct;
                        statsProgress.push(self.progressFlags.correct);
                    } else {
                        color = self.colorFlags.present;
                        statsProgress.push(self.progressFlags.present);
                    }

                    correctSolution[letterPosition] = '-';
                }

                (function (x, letterItem, letter, color) {

                    setTimeout(function () {
        
                        letterItem.classList.add('pulse');

                        letterItem.addEventListener('animationend', function (e) {

                            e.stopPropagation();

                            letterItem.classList.remove('pulse');

                        }, {once: true});

                        letterItem.style.backgroundColor = color;

                        self.process.shadeKeyboard(letter, color);

                    }, 250 * x);

                })(x, letterItem, letter, color);

            }

            self.stats.progress.push(statsProgress);

            if (guessString === solution) {

                alert('Phew! you got the word!');

                self.stats.winInGuesssNumber = (self.maxNumberOfGuesses - self.remainingGuessesCounter) + 1;
                
                self.remainingGuessesCounter = 0;

                // HOOK DONE
                document.getElementById(self.elements.wjsShareId).classList.remove('-hide-element');

            } else {

                self.remainingGuessesCounter--;
                self.currentGuessLettersCollection = [];
                self.letterCounter = 0;

                // HOOK NEXT GUESS

                if (self.remainingGuessesCounter <= 0) {
                    
                    alert(`Run out of guesses! Game over. The correct word is: "${solution}"`);

                    // HOOK DONE
                    document.getElementById(self.elements.wjsShareId).classList.remove('-hide-element');
                }
            }

        },

        shadeKeyboard: function (letter, color) {

            var self = Wordle;

            var keypadElements = document.getElementsByClassName(self.elements.wjsKeyboardRowKeypadClass);

            for (var x in keypadElements) {

        
                if (keypadElements[x].textContent === letter) {
                    
                    var currentBgColor = keypadElements[x].style.backgroundColor;
                    
                    if (currentBgColor === self.colorFlags.correct) {
                        return;
                    } 
        
                    if (currentBgColor === self.colorFlags.present && color !== self.colorFlags.correct) {
                        return;
                    }

                    keypadElements[x].style.backgroundColor = color;
                    break;
                }
            }

        }

    },

    actions: {

        addLetter: function (pressedKey) {

            var self = Wordle;

            if (self.letterCounter >= self.maxNumberOfLetters) {
                return;
            }
        
            pressedKey = pressedKey.toLowerCase();
        
            var letterContainer = (
                document.getElementsByClassName(self.elements.wjsGameBoardLetterContainer)[
                    self.maxNumberOfGuesses - self.remainingGuessesCounter
                ]
            );

            let letterItem = letterContainer.children[self.letterCounter];
        
            letterItem.classList.add('pulse');
        
            letterItem.addEventListener('animationend', function (e) {
        
                e.stopPropagation();
        
                letterItem.classList.remove('pulse');
        
            }, {once: true});
            
            letterItem.textContent = pressedKey;
        
            letterItem.classList.add(self.elements.wjsGameBoardLetterItemModifierFilled);
        
            self.currentGuessLettersCollection.push(pressedKey);
        
            self.letterCounter++;
            
        },

        deleteLetter: function () {

            var self = Wordle;

            var letterContainer = (
                document.getElementsByClassName(self.elements.wjsGameBoardLetterContainer)[
                    self.maxNumberOfGuesses - self.remainingGuessesCounter
                ]
            );
            
            let letterItem = letterContainer.children[self.letterCounter - 1];
            
            letterItem.textContent = '';
            
            letterItem.classList.remove(self.elements.wjsGameBoardLetterItemModifierFilled);

            self.currentGuessLettersCollection.pop();

            self.letterCounter--;

        }

    },

    events: {

        onKeyUp: function () {

            var self = Wordle;

            document.addEventListener('keyup', function (e) {

                if (self.remainingGuessesCounter === 0) {
                    return
                }
            
                var pressedKey = String(e.key);

                if (pressedKey === 'Backspace' && self.letterCounter !== 0) {

                    self.actions.deleteLetter();
                    return;
                }
            
                if (pressedKey === 'Enter') {

                    self.process.checkGuessLetters();
                    return;
                }
            
                var found = pressedKey.match(/[a-z]/gi);
                
                if (!found || found.length > 1) {
                    return;
                } else {
                    self.actions.addLetter(pressedKey);
                }

            });

        },

        onClickKeyPad: function () {

            var self = Wordle;

            document.getElementById(self.elements.wjsKeyboardId).addEventListener('click', function (e) {
                
                var target = e.target;
                
                if (! target.classList.contains(self.elements.wjsKeyboardRowKeypadClass)) {
                    return;
                }

                var key = target.textContent;
            
                if (key === 'Del') {
                    key = 'Backspace';
                } 
            
                document.dispatchEvent(new KeyboardEvent('keyup', {'key': key}));

            });

        },

        onClickShare: function () {
         
            var self = Wordle;

            document.getElementById(self.elements.wjsShareId).addEventListener('click', function (e) {

                var win = self.stats.winInGuesssNumber ? self.stats.winInGuesssNumber : 'X';

                var stats = `WordleJS #${wordNumber} ${win}/${self.maxNumberOfGuesses}\n\n`;

                stats += self.stats.progress.map(function (row) {
                    return row.join('') + '\n';
                }).join('') + '\n';

                stats += 'https://lorddashme.github.io/'

                navigator.clipboard.writeText(stats);

            });
            
        }

    },

    render: function () {

        var self = this;

        self.remainingGuessesCounter = self.maxNumberOfGuesses;

        var gameBoard = document.getElementById(self.elements.wjsGameBoardId);

        for (var x = 0; x < self.maxNumberOfGuesses; x++) {
            
            var letterContainer = document.createElement('div'); 
                
            letterContainer.className = self.elements.wjsGameBoardLetterContainer;
            
            for (var y = 0; y < self.maxNumberOfLetters; y++) {
                
                var letterItem = document.createElement('div');
                
                letterItem.className = self.elements.wjsGameBoardLetterItem;

                letterContainer.appendChild(letterItem);
            }

            gameBoard.appendChild(letterContainer);
        }

    }

};
