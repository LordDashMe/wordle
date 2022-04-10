var Wordle = {
    afterRenderCallback: [],
    guessTryNotEnoughLettersCallback: [],
    guessTryNotInWordListCallback: [],
    gameOverWinCallback: [],
    gameOverLoseCallback: [],
    shareStatsCallback: [],

    maxNumberOfGuesses: 6,
    maxNumberOfLetters: 5,
    animation: {
        checkGuessLettersDelayInSeconds: 0.2
    },

    letterFlags: {
        correct: {
            status: 'correct',
            bgColor: '#5BC05B',
            emoji: '🟩',
            color: '#FFF'
        },
        present: {
            status: 'present',
            bgColor: '#FFFF8E',
            emoji: '🟨',
            color: '#434343'
        },
        absent: {
            status: 'absent',
            bgColor: '#BEBEBE',
            emoji: '⬛',
            color: '#434343'
        }
    },

    wjsn: '',
    wjsx: '',
    remainingGuessesCounter: 0,
    letterCounter: 0,
    currentGuessLettersCollection: [],
    processLettersCollection: [],
    stats: {
        winInGuesssNumber: 0,
        progress: []
    },
    completedOn: null,
    wotd: '',
    lookUpCollection: [],

    elements: {
        wjsGameBoardId: 'wjs_game_board',
        wjsKeyboardId: 'wjs_keyboard',
        wjsShareId: 'wjs_share',

        wjsKeyboardRowKeypadClass: 'wjs-keyboard-row__keypad',
        wjsGameBoardLetterContainerClass: 'wjs-game-board-letter-container',
        wjsGameBoardLetterItemClass: 'wjs-game-board-letter-item',
        wjsGameBoardLetterItemModifierFilledClass: '-filled',
        wjsGameBoardLetterItemModifierSubmittedClass: '-submitted'
    },

    setWjsx: function (wjsx) {
        
        var self = this;

        self.wjsx = btoa('.32541.' + wjsx.slice(0, 3) + '0789.123456.' + wjsx.slice(3) + '1345.');

    },

    collection: {

        getCurrentGuessContainerElement: function () {

            var self = Wordle;

            return (
                document.getElementsByClassName(self.elements.wjsGameBoardLetterContainerClass)[
                    self.maxNumberOfGuesses - self.remainingGuessesCounter
                ]
            );

        },

        getGuessContainerElement: function (index) {

            var self = Wordle;

            return (
                document.getElementsByClassName(self.elements.wjsGameBoardLetterContainerClass)[index]
            );

        },

        getKeypadsElement: function () {

            var self = Wordle;

            return document.getElementsByClassName(self.elements.wjsKeyboardRowKeypadClass);

        }

    },

    process: {

        executeCallback: function (callbackName, parameters) {

            var self = Wordle;
    
            if (typeof self[callbackName] === 'undefined') {
                return;
            }

            if (! Array.isArray(self[callbackName])) {
                return;
            }

            if (typeof parameters === 'undefined') {
                parameters = null;
            }

            for (var x in self[callbackName]) {
    
                if (typeof self[callbackName][x] === 'function') {
                    self[callbackName][x](parameters);
                }
            }
    
        },

        checkGuessLetters: function () {

            var self = Wordle;

            var guessString = self.currentGuessLettersCollection.join('');

            if (guessString.length !== self.maxNumberOfLetters) {
                self.process.executeCallback('guessTryNotEnoughLettersCallback', 
                    (self.maxNumberOfLetters - guessString.length)
                );
                return;
            }

            if (! self.lookUpCollection.includes(guessString)) {
                self.process.executeCallback('guessTryNotInWordListCallback');
                return;
            }

            var correctWord = atob(self.wjsx).replace(/(\d)|(\.)/gm, '');
            var processLetters = [];
            var correctSolution = Array.from(correctWord);

            self.process.filterCorrectLetters(processLetters, correctSolution);

            self.process.filterPresentLetters(processLetters, correctSolution);

            var currentGuessContainerElement = self.collection.getCurrentGuessContainerElement();

            var statsProgress = [];

            for (var x = 0; x < processLetters.length; x++) {

                self.process.shadeGuessLetters(x, 
                    currentGuessContainerElement.children[x], 
                    processLetters[x]
                );

                statsProgress.push(processLetters[x].flags.emoji);
            }

            self.processLettersCollection.push(processLetters);
            self.stats.progress.push(statsProgress);

            if (guessString === correctWord) {
                
                self.stats.winInGuesssNumber = (
                    self.maxNumberOfGuesses - self.remainingGuessesCounter
                ) + 1;

                self.remainingGuessesCounter = 0;
                self.completedOn = Date.now();
                self.process.executeCallback('gameOverWinCallback', correctWord);
                self.saveData();
                return;
            }

            self.remainingGuessesCounter--;
            self.currentGuessLettersCollection = [];
            self.letterCounter = 0;

            if (self.remainingGuessesCounter <= 0) {
                self.completedOn = Date.now();
                self.process.executeCallback('gameOverLoseCallback', correctWord);
            }

            self.saveData();

        },

        filterCorrectLetters: function (processLetters, correctSolution) {

            var self = Wordle;

            for (var x = 0; x < self.maxNumberOfLetters; x++) {

                var letter = self.currentGuessLettersCollection[x];
                var flags = self.letterFlags.absent;

                if (letter === correctSolution[x]) {
                    flags = self.letterFlags.correct;
                    correctSolution[correctSolution.indexOf(letter)] = '-';
                }

                processLetters.push({
                    letter: letter,
                    flags: flags
                });
            }

        },

        filterPresentLetters: function (processLetters, correctSolution) {

            var self = Wordle;

            for (var x = 0; x < processLetters.length; x++) {

                var correctSolutionPosition = correctSolution.indexOf(processLetters[x].letter);

                if (
                    correctSolutionPosition >= 0 && 
                    processLetters[x].flags.status === self.letterFlags.absent.status
                ) {
                    processLetters[x]['flags'] = self.letterFlags.present;
                    correctSolution[correctSolutionPosition] = '-';
                }
            }

        },

        shadeGuessLetters: function (counter, element, processLetters) {

            var self = Wordle;

            (function (counter, element, letter, bgColor, color) {

                setTimeout(function () {
    
                    element.classList.add('pulse');

                    element.addEventListener('animationend', function (e) {

                        e.stopPropagation();

                        element.classList.remove('pulse');

                    }, { once: true });

                    element.classList.add(self.elements.wjsGameBoardLetterItemModifierSubmittedClass);

                    element.setAttribute('data-bg-color', bgColor);
                    element.style.backgroundColor = bgColor;

                    element.setAttribute('data-color', color);
                    element.style.color = color;

                    self.process.shadeKeyboard(letter, bgColor, color);

                // Animation per second(s)
                }, (self.animation.checkGuessLettersDelayInSeconds * 1000) * counter); 

            })(
                counter, 
                element, 
                processLetters.letter, 
                processLetters.flags.bgColor, 
                processLetters.flags.color
            );

        },

        shadeKeyboard: function (letter, bgColor, color) {

            var self = Wordle;

            var keypadsElement = self.collection.getKeypadsElement();

            for (var x in keypadsElement) {
        
                if (keypadsElement[x].getAttribute('data-key') !== letter) {
                    continue;
                }

                var currentBgColor = keypadsElement[x].getAttribute('data-bg-color');

                if (currentBgColor !== self.letterFlags.correct.bgColor) {
                    keypadsElement[x].setAttribute('data-bg-color', bgColor);
                    keypadsElement[x].style.backgroundColor = bgColor;
                    keypadsElement[x].setAttribute('data-color', color);
                    keypadsElement[x].style.color = color;
                }

                break;
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

            var currentGuessContainerElement = self.collection.getCurrentGuessContainerElement();

            let letterItem = currentGuessContainerElement.children[self.letterCounter];
        
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

            var currentGuessContainerElement = self.collection.getCurrentGuessContainerElement();
            
            let letterItem = currentGuessContainerElement.children[self.letterCounter - 1];
            
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
                    return;
                }
            
                var pressedKey = String(e.key);

                if (pressedKey === 'Backspace' && self.letterCounter <= 0) {
                    return;
                }

                if (pressedKey === 'Backspace' && self.letterCounter > 0) {
                    self.actions.deleteLetter();
                    return;
                }
            
                if (pressedKey === 'Enter') {
                    self.process.checkGuessLetters();
                    return;
                }

                if (pressedKey.length > 1) {
                    return;
                }
            
                var found = pressedKey.match(/^(([a-z])(?![0-9]))|^(([A-Z])(?![0-9]))/gi);
                
                if (!found || found.length > 1) {
                    return;
                }

                self.actions.addLetter(pressedKey);

            });

        },

        onClickKeyPad: function () {

            var self = Wordle;

            document.getElementById(self.elements.wjsKeyboardId).addEventListener('click', function (e) {
                
                var target = e.target;
                
                if (! target.classList.contains(self.elements.wjsKeyboardRowKeypadClass)) {
                    return;
                }

                if (self.remainingGuessesCounter === 0) {
                    return;
                }

                target.classList.add('pulse');
        
                target.addEventListener('animationend', function (e) {
            
                    e.stopPropagation();
            
                    target.classList.remove('pulse');
            
                }, {once: true});

                var key = target.getAttribute('data-key');
            
                document.dispatchEvent(new KeyboardEvent('keyup', {'key': key}));

            });

        },

        onClickShareStats: function () {
         
            var self = Wordle;

            document.getElementById(self.elements.wjsShareId).addEventListener('click', function (e) {

                self.process.executeCallback('shareStatsCallback');

            });
            
        }

    },

    saveData: function () {

        if (! BaseLocalStorage.isSupported()) {
            return;
        }

        var self = this;

        BaseLocalStorage.set('wjs', JSON.stringify({
            wjsn: self.wjsn,        
            wjsx: btoa(atob(self.wjsx)),
            stats: self.stats,
            remainingGuessesCounter: self.remainingGuessesCounter,
            letterCounter: self.letterCounter,
            currentGuessLettersCollection: self.currentGuessLettersCollection,
            processLettersCollection: self.processLettersCollection,
            completedOn: self.completedOn,
            wotd: self.wotd
        }));

    },

    loadData: function () {

        if (! BaseLocalStorage.isSupported()) {
            return;
        }

        var self = this;

        var data = BaseLocalStorage.get('wjs');

        if (data) {

            data = JSON.parse(data);
            
            self.wjsn = data.wjsn;
            self.wjsx = atob(data.wjsx);
            self.stats = data.stats;
            self.remainingGuessesCounter = data.remainingGuessesCounter;
            self.letterCounter = data.letterCounter;
            self.currentGuessLettersCollection = data.currentGuessLettersCollection;
            self.processLettersCollection = data.processLettersCollection;
            self.completedOn = data.completedOn;
            self.wotd = data.wotd;
        }

    },

    prepareBoardTemplate: function () {

        var self = this;

        var gameBoard = document.getElementById(self.elements.wjsGameBoardId);

        for (var x = 0; x < self.maxNumberOfGuesses; x++) {
            
            var letterContainer = document.createElement('div'); 
                
            letterContainer.className = self.elements.wjsGameBoardLetterContainerClass;
            
            for (var y = 0; y < self.maxNumberOfLetters; y++) {
                
                var letterItem = document.createElement('div');
                
                letterItem.className = self.elements.wjsGameBoardLetterItemClass;

                letterContainer.appendChild(letterItem);
            }

            gameBoard.appendChild(letterContainer);
        }

    },

    prepareLoadedData: function () {

        var self = this;

        for (var x = 0; x < (self.maxNumberOfGuesses - self.remainingGuessesCounter); x++) {

            var gueesContainerElement = self.collection.getGuessContainerElement(x);

            if (typeof self.processLettersCollection[x] === 'undefined') {
                break;
            }

            for (var y = 0; y < self.processLettersCollection[x].length; y++) {
                
                gueesContainerElement.children[y].textContent = self.processLettersCollection[x][y].letter;

                self.process.shadeGuessLetters(
                    y, 
                    gueesContainerElement.children[y], 
                    self.processLettersCollection[x][y]
                );
            }
        }

    },

    render: function () {

        var self = this;

        self.remainingGuessesCounter = self.maxNumberOfGuesses;

        self.loadData();

        self.prepareBoardTemplate();

        self.prepareLoadedData();

        self.process.executeCallback('afterRenderCallback');

    }
};
