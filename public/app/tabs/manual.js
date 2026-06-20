import { MANUAL_SECTIONS } from "../content.js";
import { escapeHtml, html } from "../helpers.js";

export function renderManualTab(room) {
  return html`
    <section class="manual-layout">
      <section class="voyage-panel toy-gloss">
        <p class="eyebrow">owner's manual</p>
        ${manualMarkup(room.stats.manualPages)}
      </section>
      <section class="voyage-panel toy-gloss">
        <p class="eyebrow">chapter map</p>
        <div class="chapter-ribbon">${room.chapterSummaries.map((chapter) => `<span class="${room.campaign.completedChapterIds.includes(chapter.id) ? "complete" : room.campaign.currentChapterId === chapter.id ? "active" : room.campaign.unlockedChapters.includes(chapter.id) ? "unlocked" : ""}">${escapeHtml(chapter.title)}</span>`).join("")}</div>
        <p>Completed chapters: ${room.campaign.completedChapterIds.length}</p>
      </section>
      <section class="voyage-panel toy-gloss">
        <div class="log-head"><h2>Captain's Log</h2></div>
        ${room.log.map((item) => `<p>${escapeHtml(item.text)}</p>`).join("")}
      </section>
    </section>`;
}

function manualMarkup(pages) {
  return html`<div class="manual-preview"><h3>Owner's Manual Builder</h3><p>${pages} unlocked page${pages === 1 ? "" : "s"}</p><div class="manual-pages">${MANUAL_SECTIONS.map((section, index) => `<span class="${index < pages ? "unlocked" : ""}">${section}</span>`).join("")}</div></div>`;
}
