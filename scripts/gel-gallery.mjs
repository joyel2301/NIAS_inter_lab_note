// 젤 사진 모아보기 페이지 생성: content/사진 의 gel_*.png 중 성공한 사진만 라인별로 모음
// 실행: node scripts/gel-gallery.mjs  (Cloudflare 빌드 명령에서도 실행)
import fs from "fs"
import path from "path"
import { slugifyFilePath } from "@quartz-community/utils"

const ROOT = "content"
const PHOTO_DIR = "사진"
const OUT = path.join(ROOT, "젤 사진 모아보기.md")

const LINES = [
  ["FD1-sg1", /fd1[\s_-]*sg/],
  ["FD1-CDS", /fd1[\s_-]*cds/],
  ["W90-CDS", /w[\s-]*90/],
  ["W104-sg1", /w[\s-]*104/],
]
const OTHER = "프라이머 테스트"

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c])
const url = (fp) => "/" + encodeURI(slugifyFilePath(fp))
// 날짜 바로가기(#:~:text=)는 Quartz가 내부 링크의 #을 바꿔버리므로 사이트 전체 주소로 적음
const BASE = fs.readFileSync("quartz.config.yaml", "utf8").match(/^\s*baseUrl:\s*(\S+)/m)?.[1]
const pageUrl = (fp) => (BASE ? `https://${BASE}` : "") + url(fp)

// 일지에서 사진이 처음 나온 날짜 찾기
const journals = fs
  .readdirSync(ROOT)
  .filter((d) => /^\d+월$/.test(d) && fs.statSync(path.join(ROOT, d)).isDirectory())
  .sort((a, b) => parseInt(a) - parseInt(b))
  .flatMap((d) =>
    fs
      .readdirSync(path.join(ROOT, d))
      .filter((f) => f.endsWith(".md"))
      .sort((a, b) => parseInt(a.match(/(\d+)주차/)?.[1] ?? 0) - parseInt(b.match(/(\d+)주차/)?.[1] ?? 0))
      .map((f) => `${d}/${f}`),
  )

const where = {}
for (const j of journals) {
  let day = null
  for (const line of fs.readFileSync(path.join(ROOT, j), "utf8").split(/\r?\n/)) {
    const d = line.match(/^(\d{1,2})\/(\d{1,2})일?(?:\s+(.*?))?\s*$/)
    if (d) {
      day = { label: `${d[1]}/${d[2]}`, wd: (d[3] || "").trim(), raw: line.trim() }
      continue
    }
    for (const m of line.matchAll(/!\[\[(gel_[^\]|]+)(?:\|\d+)?\]\]/g)) {
      if (!where[m[1]] && day) where[m[1]] = { note: j, ...day }
    }
  }
}

const files = fs
  .readdirSync(path.join(ROOT, PHOTO_DIR))
  .filter((f) => f.startsWith("gel_") && /\.(png|jpe?g)$/i.test(f))
const ok = files.filter((f) => !f.includes("실패"))
const failed = files.length - ok.length

const groups = new Map([...LINES.map(([n]) => [n, []]), [OTHER, []]])
for (const f of ok) {
  const low = f.toLowerCase()
  const g = LINES.find(([, rx]) => rx.test(low))?.[0] ?? OTHER
  groups.get(g).push(f)
}
const order = (f) => {
  const w = where[f]
  return w ? journals.indexOf(w.note) * 1000 + parseInt(w.label.split("/")[1]) : 1e9
}

const card = (f) => {
  const w = where[f]
  const name = f.replace(/^gel_/, "").replace(/\.\w+$/, "").replace(/_/g, " ")
  const img = url(`${PHOTO_DIR}/${f}`)
  const href = w ? pageUrl(w.note) + "#:~:text=" + encodeURIComponent(w.raw) : null
  const pic = `<img src="${img}" alt="${esc(name)}" loading="lazy">`
  return [
    `<figure class="gel-card">`,
    href ? `<a class="gel-pic" href="${href}" data-router-ignore>${pic}</a>` : `<span class="gel-pic">${pic}</span>`,
    `<figcaption><b>${esc(name)}</b>`,
    `<span class="gel-meta">`,
    href
      ? `<a href="${href}" data-router-ignore>${esc(w.label)} ${esc(w.wd)} · ${esc(path.basename(w.note, ".md"))} →</a>`
      : `<span>일지에 없음</span>`,
    `<a class="gel-dl" href="${img}" download="${esc(f)}" data-router-ignore>저장</a>`,
    `</span></figcaption></figure>`,
  ].join("")
}

let md = `---
title: 젤 사진 모아보기
---
성공한 전기영동 사진 ${ok.length}장을 라인별로 모았습니다. 사진이나 날짜를 누르면 그날 실험 기록으로 이동하고, **저장**을 누르면 원본 파일이 내려받아집니다. (실패 사진 ${failed}장 제외)

`
for (const [g, list] of groups) {
  if (!list.length) continue
  list.sort((a, b) => order(a) - order(b))
  md += `## ${g}\n\n<div class="gel-grid">${list.map(card).join("")}</div>\n\n`
}
md += `---\n이 페이지는 \`scripts/gel-gallery.mjs\`가 자동으로 만듭니다. 직접 고치지 마세요.\n`

fs.writeFileSync(OUT, md)
console.log(`gel gallery: ${ok.length} photos (${failed} failed skipped) -> ${OUT}`)
