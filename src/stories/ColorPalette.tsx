interface SwatchProps {
  name: string;
  value: string;
  width?: number;
}

function Swatch({ name, value, width = 80 }: SwatchProps) {
  return (
    <div style={{ textAlign: 'center', width }}>
      <div
        style={{
          width,
          height: 48,
          borderRadius: 6,
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.1)',
          backgroundImage:
            'linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px',
          backgroundColor: '#fff',
        }}
      >
        <div style={{ width: '100%', height: '100%', background: value }} />
      </div>
      <div style={{ fontSize: 11, marginTop: 4, color: '#777', wordBreak: 'break-word' }}>
        {name}
      </div>
    </div>
  );
}

export function Palette({ colors, width = 80 }: { colors: [string, string][]; width?: number }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
      {colors.map(([name, value]) => (
        <Swatch key={name} name={name} value={value} width={width} />
      ))}
    </div>
  );
}
