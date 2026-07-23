export type AppTab = "fleet" | "setup";

interface Props {
  tab: AppTab;
  onChange: (tab: AppTab) => void;
}

const TABS: { id: AppTab; label: string; hint: string }[] = [
  { id: "fleet", label: "Fleet", hint: "Live status" },
  { id: "setup", label: "Setup", hint: "Diagrams · agents" },
];

export function TabNav({ tab, onChange }: Props) {
  return (
    <nav className="tabs" aria-label="Dioptra views">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`tab${tab === t.id ? " active" : ""}`}
          aria-current={tab === t.id ? "page" : undefined}
          onClick={() => onChange(t.id)}
        >
          <span className="tab-label">{t.label}</span>
          <span className="tab-hint">{t.hint}</span>
        </button>
      ))}
    </nav>
  );
}
