interface SkeletonRowProps {
  cols?: number;
  rows?: number;
}

export function SkeletonRow({ cols = 6, rows = 5 }: SkeletonRowProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, ri) => (
        <tr key={ri}>
          {Array.from({ length: cols }).map((_, ci) => (
            <td key={ci} style={{ padding: '12px 16px' }}>
              <div
                className="ac-skeleton"
                style={{ height: 14, borderRadius: 4, width: ci === 0 ? '40%' : ci === 1 ? '70%' : '60%' }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
