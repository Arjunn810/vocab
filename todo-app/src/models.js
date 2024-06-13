export class Word {
    constructor(word, pronunciation, meaning, usage) {
        this.id = Math.random().toString(16).slice(2);
        this.word = word;
        this.meaning = meaning;
        this.pronunciation = pronunciation;
        this.usage = usage || [];
    }
}

export class WordList {
    constructor(words = []) {
        this.arrWordList = words;
    }

    addWord(word) {
        this.arrWordList.push(word);
    }

    editWord(id, newWord) {
        let wordIndex = this.arrWordList.findIndex(word => word.id === id);
        if (wordIndex !== -1) {
            this.arrWordList[wordIndex] = newWord;
        }
    }

    deleteWord(id) {
        this.arrWordList = this.arrWordList.filter(word => word.id !== id);
    }

    getLength() {
        return this.arrWordList.length;
    }

    getWords() {
        return this.arrWordList;
    }

    getWordById(id) {
        return this.arrWordList.find(word => word.id === id);
    }

    map(callback) {
        if (!this.arrWordList) return []
        let found = []
        for (let idx = 0; idx < this.arrWordList.length; idx++) {
            let elm = callback(this.arrWordList[idx], idx)
            if (elm) {
                found.push(elm)
            }
        }
        return found;
    }
}

