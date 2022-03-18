import lookup from "../static/lookup.json";

const COMMON_SUFFIXES =
  "acy|al|ance|ence|dom|er|or|ism|ist|ity|ment|ness|ed|ers|ship|sion|tion|ate|en|ify|fy|ize|ise|able|ible|al|esque|ful|ic|ical|ious|ous|ish|ive|less|y|s";

export class NvcTaggerService {
  public tag(text: string): string[] {
    const ltext = text.toLowerCase();
    const result: string[] = [];
    Object.entries(lookup).forEach(([key, tags]) => {
      if (ltext.includes(key)) {
        const rgx = new RegExp(
          "(^|[^\\w])" + key + "(" + COMMON_SUFFIXES + ")?([^\\w]|$)"
        );
        if (rgx.test(ltext)) {
          tags.forEach((tag) => {
            if (!result.includes(tag)) {
              result.push(tag);
            }
          });
        }
      }
    });
    return result;
  }
}
