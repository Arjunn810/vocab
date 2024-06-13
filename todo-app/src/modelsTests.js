import { Word, WordList } from "./models";
export function testWordList() {
    var WordList = new WordList();
    
    // Add Words
    let word1 = new Word("APPLE", "[a'p(ə)l]" , "the round fruit of a tree of the rose family, which typically has thin green or red skin and crisp flesh.");
    let word2 = new Word("BANANA","[bə'na:nə]" , "a long curved fruit that grows in clusters and has soft pulpy flesh and yellow skin when ripe.");
    let word3 = new Word("CHERRY","'[tʃɛri]", "a small, round stone fruit that is typically bright or dark red.");

    WordList.addWord(word1);
    WordList.addWord(word2);
    WordList.addWord(word3);

    console.log("Word Length:", WordList.getLength());

    // Edit Word
    WordList.editWord(0, "lichi","ly·chee" ,"a fruit with red  skin and a sweet");
    console.log("Edited Word:", WordList.arrWordList[0]);

    // Delete Word
    WordList.deleteWord(1);
    console.log("Final Length:", WordList.getLength());
}

testWordList();