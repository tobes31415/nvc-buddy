import { DI } from "@tobes31415/dependency-injection";
import { NvcTaggerService } from "./services/nvc-tagger";

const lookupSvc: NvcTaggerService = DI.resolve(NvcTaggerService);
(globalThis as any).lookupSvc = lookupSvc;

(globalThis as any).updateTags = () => {
  const tagsSection =
    document.querySelector<HTMLDivElement>("#tags") || undefined;
  const userInput = document.querySelector<HTMLTextAreaElement>("#userText");
  if (tagsSection && userInput) {
    const tags = lookupSvc.tag(userInput.value);
    tagsSection.innerHTML = tags
      .map((tag) => {
        console.log(tag);
        const parts = tag.fullGuess.split(":");
        const confidence =
          tag.confidence >= 1
            ? "confirmed"
            : tag.confidence > 0.6
            ? "high"
            : tag.confidence < 0.3
            ? "low"
            : "medium";
        return `<nvc-word data-type="${
          parts[0]
        }" data-confidence="${confidence}" data-num-confidence="${
          tag.confidence
        }" data-match="${tag.match}" title="${tag.fullGuess}">${parts.at(
          -1
        )}</nvc-word>`;
      })
      .join(" ");
  }
};

setTimeout((globalThis as any).updateTags);
