type Props = {
  title: string;
  description?: string;
  icon?: string;
};

export function EmptyState({ title, description, icon = "◯" }: Props) {
  return (
    <div style={{
      background: "var(--white)",
      border: "1px dashed var(--gray-200)",
      borderRadius: 12,
      padding: "56px 32px",
      textAlign: "center",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 24,
        background: "var(--gray-50)", border: "1px solid var(--gray-200)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, color: "var(--gray-400)", marginBottom: 14,
      }}>
        {icon}
      </div>
      <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "var(--black)" }}>{title}</p>
      {description && (
        <p style={{ margin: 0, fontSize: 12, color: "var(--gray-500)", maxWidth: 360, marginInline: "auto", lineHeight: 1.5 }}>
          {description}
        </p>
      )}
    </div>
  );
}
