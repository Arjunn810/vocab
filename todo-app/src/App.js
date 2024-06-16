import React, { useState } from "react";
import "./App.css";
import { Word, WordList } from "./models";

function App() {
  const [wordList, setWordList] = useState(new WordList());
  const [word, setWord] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [meaning, setMeaning] = useState("");
  const [usage, setUsage] = useState("");
  const [formMode, setFormMode] = useState("CREATE");
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [filteredWords, setFilteredWords] = useState(wordList.getWords());

  const handleWordChange = (e) => {
    setWord(e.target.value);
  };

  const handlePronunciationChange = (e) => {
    setPronunciation(e.target.value);
  };

  const handleMeaningChange = (e) => {
    setMeaning(e.target.value.split("\r\n"));
  };

  const handleUsageChange = (e) => {
    setUsage(e.target.value);
  };

  const handleAddWord = () => {
    if (formMode === "EDIT") {
      saveEditedWord();
    } else {
      saveWord();
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearch = () => {
    setFilteredWords(searchByWord(search));
  };

  const saveEditedWord = () => {
    if (word && meaning && editId !== null) {
      const updatedWord = new Word(word, pronunciation, meaning, [usage || "-"]);
      wordList.editWord(editId, updatedWord);
      setWordList(new WordList(wordList.getWords()));
      resetForm();
    }
  };

  const saveWord = () => {
    if (word && pronunciation && meaning) {
      const newWord = new Word(word, pronunciation, meaning, [usage]);
      wordList.addWord(newWord);
      setWordList(new WordList(wordList.getWords()));
      saveMeaningToDB(newWord);
      resetForm();
    }
  };

  const resetForm = () => {
    setWord("");
    setPronunciation("");
    setMeaning("");
    setUsage("");
    setFormMode("CREATE");
    setEditId(null);
    setFilteredWords(wordList.getWords());
  };

  const editWord = (id) => {
    setFormMode("EDIT");
    setEditId(id);
    let word = wordList.getWordById(id);
    if (word) {
      setWord(word.word);
      setPronunciation(word.pronunciation);
      setMeaning(word.meaning);
      setUsage(word.usage.join(", "));
    }
  };

  const deleteWord = (id) => {
    wordList.deleteWord(id);
    setWordList(new WordList(wordList.getWords()));
    setFilteredWords(wordList.getWords());
  };

  const searchByWord = (str) => {
    if (!wordList) return [];

    return wordList.getWords().filter((word) =>
      word.word.toLowerCase().includes(str.toLowerCase())
    );
  };

  const fetchMeaning = () => {
    if (!word) return;

    const url = `http://localhost:3100/vocab/${word}`;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data) {
          let meaning = data.definition.join("\r\n")
          setMeaning(meaning);
          setPronunciation(data.pronunciation);
        }
      })
      .catch(error => console.error('Error fetching word meaning:', error));
  };

  const saveMeaningToDB = (word) => {
    if (!word) return;

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const content = JSON.stringify(word);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: content,
      redirect: "follow"
    };

    fetch("http://localhost:3100/word/", requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));
  };

  const formatMeaning = (meaning) => {
    if (Array.isArray(meaning)) {
      let str = meaning.map(w => `-  ${w} \r\n`).join("")
      return str
    } else {
      let str = meaning.split("\r\n").map(w => `-  ${w} \r\n`).join("")
      return str
    }
  }

  const formatMeaningForDisplay = (meaning) => {
    if (Array.isArray(meaning)) {
      let str = meaning.map(w => <li>{w}</li>)
      return str
    } else {
      let str = meaning.split("\r\n").map(w => <li>{w}</li>)
      return str
    }
  }

  return (
    <div className="App">
      <h2>Dictionary</h2>
      <div className="form-container">
        <div className="form-group">
          <label htmlFor="txtWord">Word</label>
          <input
            id="txtWord"
            className="form-control"
            type="text"
            placeholder="Input Word"
            value={word}
            onChange={handleWordChange}
            onBlur={fetchMeaning}
          />
        </div>

        <div className="form-group">
          <label htmlFor="txtPronunciation">Pronunciation</label>
          <input
            id="txtPronunciation"
            className="form-control"
            type="text"
            placeholder="Pronunciation"
            value={pronunciation}
            onChange={handlePronunciationChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="txtMeaning">Meaning</label>
          <textarea
            id="txtMeaning"
            className="form-control"
            rows="3"
            placeholder="Meaning"
            value={formatMeaning(meaning)}
            onChange={handleMeaningChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="txtUsage">Usage</label>
          <textarea
            id="txtUsage"
            className="form-control"
            rows="3"
            placeholder="Usage"
            value={usage}
            onChange={handleUsageChange}
          />
        </div>

        <div className="form-group">
          <button className="btn" onClick={handleAddWord}>
            {formMode === "EDIT" ? "Save" : "Add"}
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="txtSearch">Search Word</label>
          <div style={{ display: "flex", marginTop: "0px" }}>
            <input
              id="txtSearch"
              className="form-control"
              type="text"
              placeholder="Search"
              value={search}
              onChange={handleSearchChange}
            />
            <button className="btn" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>



        {filteredWords.map((word, idx) => (
          <div className="vocab-word" key={word.id}>
            <p className="word">
              {idx + 1}. {word.word} (
              <span className="pronunciation">{word.pronunciation}</span>
              )
              <button
                className="btn btn-light btn-sm"
                onClick={() => editWord(word.id)}
              >
                <span className="badge text-bg-light"></span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="currentColor"
                  className="bi bi-pencil-square"
                  viewBox="0 0 16 16"
                >
                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                  <path
                    fillRule="evenodd"
                    d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                  />
                </svg>
              </button>

              <button
                className="btn btn-light btn-sm"
                type="button"
                onClick={() => deleteWord(word.id)}
              >
                <span className="badge text-bg-light"></span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="currentColor"
                  className="bi bi-trash"
                  viewBox="0 0 16 16"
                >
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                </svg>
              </button>
            </p>
            <p className="meaning">{formatMeaningForDisplay(word.meaning)}</p>

            <p className="usage">Usage</p>
            <p className="usage">
              {word.usage.map((sentence, i) => (
                <li key={i}>{sentence}</li>
              ))}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
