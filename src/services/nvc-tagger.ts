import lookup from "../static/lookup.json";
import { byProp, inverse } from "../util";

const COMMON_SUFFIXES =
  "acy|al|ance|ence|dom|er|or|ied|ism|ist|ity|ment|ness|ed|ers|ship|sion|tion|ate|en|ify|fy|ize|ise|able|ible|al|esque|ful|ic|ical|ious|ous|ish|ive|less|y|s|d";

interface Tag {
  match: string[];
  fullGuess: string;
  leafWord: string;
  confidence: number;
}

const DIRECT_CONFIDENCE = 0.8;
const INDIRECT_CONFIENCE = 0.4;
export class NvcTaggerService {
  public tag(text: string): Tag[] {
    const ltext = text.toLowerCase();
    const preliminary: Tag[] = [];
    Object.entries(lookup.direct).forEach(([key, tags]) => {
      if (ltext.includes(key)) {
        const rgx = new RegExp(
          "(^|[^\\w])" + key + "(" + COMMON_SUFFIXES + ")?([^\\w]|$)"
        );
        if (rgx.test(ltext)) {
          tags.forEach((tag) => {
            preliminary.push({
              match: [key],
              fullGuess: tag,
              leafWord: tag.substring(tag.lastIndexOf(":") + 1),
              confidence: DIRECT_CONFIDENCE / tags.length,
            });
          });
        }
      }
    });

    Object.entries(lookup.indirect).forEach(([key, tags]) => {
      if (ltext.includes(key)) {
        const rgx = new RegExp(
          "(^|[^\\w])" + key + "(" + COMMON_SUFFIXES + ")?([^\\w]|$)"
        );
        if (rgx.test(ltext)) {
          tags.forEach((tag) => {
            preliminary.push({
              match: [key],
              fullGuess: tag,
              leafWord: tag.substring(tag.lastIndexOf(":") + 1),
              confidence: INDIRECT_CONFIENCE / tags.length,
            });
          });
        }
      }
    });
    preliminary.sort(inverse(byProp("confidence", byProp("guess"))));
    const result: Tag[] = [];
    preliminary.forEach((tag) => {
      const alreadyIncluded = result.find((t) => t.leafWord === tag.leafWord);
      if (alreadyIncluded) {
        alreadyIncluded.match.push(...tag.match);
        alreadyIncluded.confidence += tag.confidence;
      } else {
        result.push(tag);
      }
    });
    preliminary.sort(inverse(byProp("confidence", byProp("guess"))));
    return result;
  }
}
