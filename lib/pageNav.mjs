export function listPageTitles(pages) {
  return pages.map((page) => page.title);
}

export function findPageIndexByTitle(pages, title) {
  const index = pages.findIndex((page) => page.title === title);
  return index === -1 ? 0 : index;
}
