export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm) {
    return text
  }

  const regex = new RegExp(`(${searchTerm})`, "gi")
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-400">$1</mark>')
}
