interface TagListProps {
  tags: string[];
  activeTag?: string;
  onSelect: (tag: string) => void;
}

// Clickable popular-tags sidebar. The active tag is highlighted; clicking a tag
// invokes onSelect (the HomePage sets ?tag= from it).
export default function TagList({ tags, activeTag, onSelect }: TagListProps) {
  if (tags.length === 0) return null;

  return (
    <div className="sidebar-tags">
      <p className="sidebar-title">Popular Tags</p>
      <ul className="tag-list">
        {tags.map((tag) => (
          <li key={tag}>
            <button
              type="button"
              className={tag === activeTag ? 'tag-pill active' : 'tag-pill'}
              aria-pressed={tag === activeTag}
              onClick={() => onSelect(tag)}
            >
              {tag}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
