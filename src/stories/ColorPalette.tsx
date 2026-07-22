const checkerboard = {
  backgroundImage:
    'linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)',
  backgroundSize: '10px 10px',
  backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
  backgroundColor: '#fff',
};

function Swatch({
  value,
  name,
  scheme,
  border = false,
  width = 128,
  height = 24,
}: {
  value: string;
  name?: string;
  scheme?: 'light' | 'dark';
  border?: boolean;
  width?: number;
  height?: number;
}) {
  return (
    <div style={{ textAlign: 'center', width }}>
      <div
        style={{
          width,
          height,
          borderRadius: 4,
          overflow: 'hidden',
          ...(border ? { outline: '1px solid var(--border-default)' } : {}),
          ...(scheme ? {} : checkerboard),
        }}
      >
        <div style={{ colorScheme: scheme, width: '100%', height: '100%', background: value }} />
      </div>
      {name && (
        <div style={{ fontSize: 12, marginTop: 4, color: '#777', wordBreak: 'break-word' }}>
          {name}
        </div>
      )}
    </div>
  );
}

function TextSwatch({
  value,
  scheme,
  background,
  width = 128,
}: {
  value: string;
  scheme: 'light' | 'dark';
  background?: string;
  width?: number;
}) {
  return (
    <div
      style={{
        colorScheme: scheme,
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: 8,
        background: background ?? 'var(--surface-background)',
        outline: '1px solid rgba(0,0,0,0.1)',
        width: width ?? '100%',
        height: 40,
      }}
    >
      <span
        style={{
          color: value,
          fontSize: 20,
          fontWeight: 500,
          lineHeight: 1,
          letterSpacing: '-0.01em',
        }}
      >
        Aa
      </span>
    </div>
  );
}

export function Palette({
  colors,
  width = 80,
  border = false,
}: {
  colors: [string, string][];
  width?: number;
  border?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
      {colors.map(([name, value]) => (
        <Swatch key={name} name={name} value={value} width={width} border={border} />
      ))}
    </div>
  );
}

interface SemanticToken {
  token: string;
  description?: string;
  type?: 'color' | 'text';
  background?: string;
}

function SemanticRow({ token, description, type = 'color', background }: SemanticToken) {
  const cssVar = `var(--${token})`;
  return (
    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <td style={{ padding: '10px 16px', verticalAlign: 'middle', minWidth: 240 }}>
        <code
          style={{
            fontSize: 12,
            background: 'rgba(0,0,0,0.05)',
            padding: '4px 8px',
            borderRadius: 4,
          }}
        >
          {token}
        </code>
        {description && (
          <div style={{ fontSize: 14, color: '#444', marginTop: 4 }}>{description}</div>
        )}
      </td>
      <td style={{ padding: '10px 16px', verticalAlign: 'middle' }}>
        {type === 'text' ? (
          <TextSwatch value={cssVar} scheme="light" background={background} />
        ) : (
          <div
            style={{
              colorScheme: 'light',
              display: 'inline-flex',
              padding: 8,
              borderRadius: 8,
              background: 'var(--surface-background)',
              outline: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            <Swatch value={cssVar} scheme="light" />
          </div>
        )}
      </td>
      <td style={{ padding: '10px 16px', verticalAlign: 'middle' }}>
        {type === 'text' ? (
          <TextSwatch value={cssVar} scheme="dark" background={background} />
        ) : (
          <div
            style={{
              colorScheme: 'dark',
              display: 'inline-flex',
              padding: 8,
              borderRadius: 8,
              background: 'var(--surface-background)',
              outline: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            <Swatch value={cssVar} scheme="dark" />
          </div>
        )}
      </td>
    </tr>
  );
}

export function SemanticTable({ tokens }: { tokens: (string | SemanticToken)[] }) {
  const rows = tokens.map((t) => (typeof t === 'string' ? { token: t } : t));
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 32 }}>
      <thead>
        <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.1)' }}>
          <th
            style={{
              padding: '16px 16px',
              textAlign: 'left',
              fontSize: 14,
              fontWeight: 600,
              color: '#555',
            }}
          >
            Token
          </th>
          <th
            style={{
              padding: '16px 16px',
              textAlign: 'left',
              fontSize: 14,
              fontWeight: 600,
              color: '#555',
            }}
          >
            Light
          </th>
          <th
            style={{
              padding: '16px 16px',
              textAlign: 'left',
              fontSize: 14,
              fontWeight: 600,
              color: '#555',
            }}
          >
            Dark
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <SemanticRow key={r.token} {...r} />
        ))}
      </tbody>
    </table>
  );
}
