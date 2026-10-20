import type { ReactNode } from 'react';
import { glyphs } from '../../lib/glyphs';

/**
 * Browser-style frame used for every project visual. `narrow` = a small native capture
 * that is shown centred at its real size over the canvas instead of being stretched. With a real screenshot it
 * frames the image; without one it shows an abstract canvas + category glyph.
 * Never a fake screenshot. Keep markup in sync with ../MediaFrame.astro.
 */
export default function MediaFrame({
  label,
  category,
  children,
  narrow = false,
  display,
}: {
  label: string;
  category: string;
  children?: ReactNode;
  narrow?: boolean;
  /** phone = app screen in a phone bezel; page = slim full-page capture. */
  display?: 'wide' | 'phone' | 'page';
}) {
  return (
    <div className="frame">
      <div className="frame__bar" aria-hidden>
        <i />
        <i />
        <i />
        <span className="frame__url">{label}</span>
      </div>
      <div className={`frame__view${narrow ? ' frame__view--narrow' : ''}`} data-display={narrow ? display : undefined}>
        {narrow && <div className="frame__canvas" aria-hidden />}
        {narrow && display === 'phone' && children ? (
          <div className="device-phone">
            <span className="device-phone__island" aria-hidden />
            {children}
          </div>
        ) : children ?? (
          <div className="frame__canvas" aria-hidden>
            <svg className="frame__glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              {(glyphs[category] ?? glyphs.Website!).map((d) => (
                <path key={d} d={d} />
              ))}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
