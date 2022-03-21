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

const typicalSuffixes =
  "acy|al|ance|ence|dom|er|or|ied|ing|ism|ist|ity|ment|ness|ed|ers|ship|sion|tion|ate|en|ify|fy|ize|ise|able|ible|al|esque|ful|ic|ical|ious|ous|ish|ive|less|y|s|d|e".split(
    "|"
  );
function expandEndings(listOfWords, fullDictionary) {
  const result = new Set();
  listOfWords.forEach((word) => {
    typicalSuffixes.forEach((suffix) => {
      if (word.endsWith(suffix)) {
        //console.log("found common suffix", suffix);
        const prefix = word.slice(0, word.length - suffix.length);
        typicalSuffixes.forEach((s2) => {
          const expandedWord = prefix + s2;
          if (fullDictionary.has(expandedWord)) {
            //console.log(expandedWord, "is a word");
            result.add(expandedWord);
          } else {
            //console.log(expandedWord, "not a word");
          }
        });
      } else {
        result.add(word);
      }
    });
  });
  return Array.from(result);
}

function readDictionaryDirectory(folderPath) {
  // English Dictionary was found here, it's big ~30Mb
  // https://uc9c16915d1918ee4ee5b09732e6.dl.dropboxusercontent.com/cd/0/get/Bhsa1MnlVaKIdB0hX9ssflW3Gug_3dtu446lMJM4_QbW-R_VijxWDb7-Dcgvi6KZRdP56zJOz4KkA7ud1aBA2SoPThJBmc6JOjs4B61MSBICzD8n3dafTM4G5dBe_MhcCzRQxY27dDEdR5EALzA1nOiAtf34i-h90hQSgQd4dSpiXw/file?dl=1#
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
        if (!result.has(lsyn)) {
          addWord(lsyn, synonyms);
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

    expandEndings([word], fullDictionary).forEach((expandedWord) => {
      if (!listResults[word].includes(expandedWord)) {
        listResults[word].push(expandedWord);
      }
    });
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

function mapClues(nvcWords, rotated, fullDictionary) {
  const clues = nvcWords.clues;
  const result = {};
  clues.forEach((clueCategory) => {
    const tags = [];
    clueCategory.feeling.forEach((feeling) => tags.push(...rotated[feeling]));
    clueCategory.response.forEach((response) => {
      const synonyms = fullDictionary.get(response) || [response];
      synonyms.forEach((syn) => {
        if (!result[syn]) {
          result[syn] = [];
        }
        tags.forEach((tag) => {
          if (!result[syn].includes(tag)) {
            result[syn].push(tag);
          }
        });
      });
    });
  });
  return result;
}

function compress(mapOfWords, lookup) {
  const result = {};
  Object.entries(mapOfWords).forEach(([word, tags]) => {
    const altTags = tags.map((tag) => {
      if (!lookup.includes(tag)) {
        lookup.push(tag);
      }
      return lookup.indexOf(tag);
    });
    result[word] = altTags;
  });
  return result;
}

function init() {
  const fullDictionary = readDictionaryDirectory(DEFAULT_DICTIONARY);
  const nvcWords = readNVCWords(DEFAULT_WORDS);
  const finalData = mapSynonyms(nvcWords, fullDictionary);
  const rotated = rotateDictionaryRecursive(finalData);
  const clues = mapClues(nvcWords, rotated, fullDictionary);

  console.log(expandEndings(["intrigued"], fullDictionary));
  const lookup = [];

  const fullLookup = {
    lookup,
    direct: compress(rotated, lookup),
    indirect: compress(clues, lookup),
  };

  writeFile(OUTPUT_LOOKUP_FILE, JSON.stringify(fullLookup, undefined, 0));
  writeFile(OUTPUT_NVC_FILE, JSON.stringify(nvcWords, undefined, 2));
}
init();
