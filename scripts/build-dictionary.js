var fs = require("fs");
var path = require("path");

const DEFAULT_DICTIONARY = path.join("raw", "en");
const DEFAULT_WORDS = path.join("data", "en-ca");
const OUTPUT_LOOKUP_FILE = path.join("src", "static", "lookup.json");
const OUTPUT_NVC_FILE = path.join("src", "static", "nvc.json");

function readFile(filepath) {
  return fs.readFileSync(filepath, { encoding: "utf-8" });
}

function writeFile(filepath, contents) {
  fs.writeFileSync(filepath, contents, { encoding: "utf-8" });
}

function listFiles(folderPath) {
  return fs
    .readdirSync(folderPath)
    .map((filepath) => path.join(folderPath, filepath))
    .filter((path) => fs.statSync(path).isFile());
}

function readDictionaryDirectory(folderPath) {
  const files = listFiles(folderPath);
  const result = new Map();

  const addWord = (word, synonyms) => {
    const lword = word.toLowerCase();
    if (!result.has(lword)) {
      result.set(lword, [lword]);
    }
    const target = result.get(lword);

    if (synonyms) {
      synonyms.forEach((syn) => {
        const lsyn = syn.toLowerCase();
        if (!target.includes(lsyn)) {
          target.push(lsyn);
        }
      });
    }
  };

  files.forEach((filepath) => {
    const file = JSON.parse(readFile(filepath));
    Object.entries(file).forEach(([key, value]) => {
      addWord(key, value.SYNONYMS);
      value.SYNONYMS.filter((i) => !!i).forEach((syn) => addWord(syn, [key]));
    });
  });
  return result;
}

function readNVCWords(folderPath) {
  return JSON.parse(readFile(path.join(folderPath, "nvc-words.json")));
}

function mapSynonyms(nvcWords, fullDictionary) {
  const result = {};

  const doBranchedNode = (topLevelValues) => {
    const branchResult = {};
    Object.entries(topLevelValues).forEach(([branch, branchWords]) => {
      branchResult[branch] = findSynonyms(branchWords, fullDictionary);
      branchResult[branch][branch] = fullDictionary.get(branch) || [];
      if (!branchResult[branch][branch].includes(branch)) {
        branchResult[branch][branch].push(branch);
      }
    });
    return branchResult;
  };
  const doSingleNode = (listOfWords) =>
    findSynonyms(listOfWords, fullDictionary);

  result["needs"] = doBranchedNode(nvcWords.needs);
  result["feelings"] = doBranchedNode(nvcWords.feelings);
  result["thoughts"] = doSingleNode(nvcWords.thoughts);

  return result;
}

function findSynonyms(listOfWords, fullDictionary) {
  const listResults = {};
  listOfWords.forEach((word) => {
    listResults[word] = fullDictionary.get(word) || [];
    if (!listResults[word].includes(word)) {
      listResults[word].push(word);
    }
  });
  return listResults;
}

function rotateDictionaryRecursive(node, result = {}, prefix = "") {
  if (!node) {
    console.log("rdr", prefix);
    console.log("EMPTY");
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((word) => {
      if (!result[word]) {
        result[word] = [];
      }
      result[word].push(prefix);
    });
  } else {
    Object.entries(node).forEach(([key, value]) => {
      if (!value) {
        console.log("-", node);
      }
      rotateDictionaryRecursive(
        value,
        result,
        `${prefix}${prefix ? ":" : ""}${key}`
      );
    });
  }
  return result;
}

function init() {
  const fullDictionary = readDictionaryDirectory(DEFAULT_DICTIONARY);
  const nvcWords = readNVCWords(DEFAULT_WORDS);
  const finalData = mapSynonyms(nvcWords, fullDictionary);
  const rotated = rotateDictionaryRecursive(finalData);
  writeFile(OUTPUT_LOOKUP_FILE, JSON.stringify(rotated));
  writeFile(OUTPUT_NVC_FILE, JSON.stringify(nvcWords));
}
init();
