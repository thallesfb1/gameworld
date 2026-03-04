import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import GlobeGL from 'react-globe.gl';

const ERA_COLORS = {
    'Stone Age': '#8B6914',
    'Ancient Egypt': '#D4A017',
    'Ancient Greece': '#C4923A',
    'Ancient Greece (Mythological)': '#F39C12',
    'Roman Republic': '#9C6B3C',
    'Roman Empire': '#A0522D',
    'Three Kingdoms': '#B85C38',
    'Viking Age': '#4A7FB5',
    'Norse Mythology': '#2980B9',
    'Sengoku Period': '#E8472D',
    'Feudal Japan': '#C0392B',
    'Edo Period': '#C0392B',
    'Japan Mythology': '#E67E22',
    'Golden Age of Islam': '#27AE60',
    'Crusader Period': '#C49A6C',
    'Medieval Europe': '#8E44AD',
    'Medieval': '#117864',
    'Medieval Fantasy': '#6C3483',
    'Fantasy Medieval': '#7D3C98',
    'Italian Renaissance': '#E74C3C',
    'Ottoman Empire': '#2E86C1',
    'French Revolution': '#3498DB',
    'Victorian Era': '#5D4037',
    'Victorian Gothic': '#4A235A',
    'Napoleonic Era': '#1A5276',
    'Age of Sail': '#1F618D',
    'Age of Discovery': '#2471A3',
    'Colonial Era': '#6D4C41',
    'Prohibition Era': '#616A6B',
    'World War I': '#795548',
    'World War II': '#546E7A',
    '1940s-50s': '#607D8B',
    'Cold War': '#455A64',
    'Retrofuturism': '#7B1FA2',
    'Dieselpunk': '#6D4C41',
    'Steampunk': '#8D6E63',
    'Industrial Revolution': '#5D6D7E',
    'Dark Fantasy': '#6C5CE7',
    'Wild West': '#CA6F1E',
    'Modern Day': '#17A589',
    'Near Future': '#1ABC9C',
    'Post-Apocalyptic': '#5D6D7E',
    'Post-Apocalyptic Future': '#9B59B6',
    'Dystopian Future': '#E74C3C',
    'Ming Dynasty': '#C0392B',
    'Alt-History': '#7F8C8D',
    'Pirate Era': '#1F618D',
    'American Revolution': '#2E4057',
    'Mid-20th Century': '#78909C',
};

const DEFAULT_COLOR = '#6C5CE7';
export function getEraColor(era) { return ERA_COLORS[era] || DEFAULT_COLOR; }

export default function Globe({ games, selectedGame, onGameClick, playedGameIds, theme, focusGame, mapStyle = 'texture' }) {
    const globeRef = useRef();
    const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
    const autoRotateTimer = useRef(null);
    // Always-fresh click handler via ref — fixes stale-closure issue
    const onClickRef = useRef(null);
    const [countries, setCountries] = useState({ features: [] });

    // Load country borders GeoJSON once
    useEffect(() => {
        fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
            .then(r => r.json())
            .then(setCountries)
            .catch(() => { }); // silently fail — globe still works without borders
    }, []);

    onClickRef.current = onGameClick;

    useEffect(() => {
        const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Controls
    useEffect(() => {
        if (!globeRef.current) return;
        const ctrl = globeRef.current.controls();
        ctrl.autoRotate = true;
        ctrl.autoRotateSpeed = 0.35;
        ctrl.enableDamping = true;
        ctrl.dampingFactor = 0.08;
        ctrl.enablePan = true;
        ctrl.panSpeed = 1.0;
        ctrl.screenSpacePanning = false;
        ctrl.enableZoom = true;
        ctrl.zoomSpeed = 0.9;
        ctrl.minDistance = 160;
        ctrl.maxDistance = 750;
        ctrl.mouseButtons = { LEFT: 0, MIDDLE: 1, RIGHT: 2 };

        const canvas = globeRef.current.renderer().domElement;
        const suppressCtx = (e) => e.preventDefault();
        canvas.addEventListener('contextmenu', suppressCtx);

        const pause = () => {
            ctrl.autoRotate = false;
            clearTimeout(autoRotateTimer.current);
            autoRotateTimer.current = setTimeout(() => { ctrl.autoRotate = true; }, 3000);
        };
        canvas.addEventListener('pointerdown', pause);
        canvas.addEventListener('wheel', pause, { passive: true });

        return () => {
            canvas.removeEventListener('contextmenu', suppressCtx);
            canvas.removeEventListener('pointerdown', pause);
            canvas.removeEventListener('wheel', pause);
            clearTimeout(autoRotateTimer.current);
        };
    }, []);

    // Fly-to when focusGame changes (triggered by the Search button)
    useEffect(() => {
        if (!focusGame || !globeRef.current) return;
        const ctrl = globeRef.current.controls();
        ctrl.autoRotate = false;
        clearTimeout(autoRotateTimer.current);
        autoRotateTimer.current = setTimeout(() => { ctrl.autoRotate = true; }, 6000);
        globeRef.current.pointOfView(
            { lat: focusGame.lat, lng: focusGame.lng, altitude: 1.2 },
            1400
        );
    }, [focusGame]);

    // Fly-to on click
    const handlePointClick = useCallback((point) => {
        if (!point) return;
        onClickRef.current(point);
        if (globeRef.current) {
            const ctrl = globeRef.current.controls();
            ctrl.autoRotate = false;
            clearTimeout(autoRotateTimer.current);
            autoRotateTimer.current = setTimeout(() => { ctrl.autoRotate = true; }, 5000);
            globeRef.current.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1.5 }, 1100);
        }
    }, []);

    // Build glowing HTML label per pin (visual only, pointer-events:none)
    const makeLabel = useCallback((game) => {
        const isSelected = selectedGame?.id === game.id;
        const isPlayed = playedGameIds.includes(game.id);
        const color = isPlayed ? '#00FF88' : getEraColor(game.era_label);
        const size = isSelected ? 20 : 11;

        const wrap = document.createElement('div');
        wrap.style.cssText = 'position:relative;display:flex;flex-direction:column;align-items:center;pointer-events:none;';

        // Pulsing ring — only for selected pin (saves 115 CSS animations running in background)
        if (isSelected) {
            const ring = document.createElement('div');
            ring.style.cssText = `
        position:absolute;top:50%;left:50%;
        transform:translate(-50%,-50%);
        width:${size + 14}px;height:${size + 14}px;
        border-radius:50%;
        border:1.5px solid ${color}70;
        animation:pinRing 1s ease-out infinite;
        pointer-events:none;
      `;
            wrap.appendChild(ring);

            const ring2 = document.createElement('div');
            ring2.style.cssText = `
        position:absolute;top:50%;left:50%;
        transform:translate(-50%,-50%);
        width:${size + 28}px;height:${size + 28}px;
        border-radius:50%;
        border:1px solid ${color}30;
        animation:pinRing 1.4s ease-out infinite .35s;
        pointer-events:none;
      `;
            wrap.appendChild(ring2);
        }

        // Core dot
        const dot = document.createElement('div');
        if (isSelected) {
            dot.style.cssText = `
        width:${size}px;height:${size}px;
        border-radius:50%;
        background:radial-gradient(circle at 35% 30%,${color}ff,${color}aa);
        border:2.5px solid rgba(255,255,255,.9);
        box-shadow:0 0 18px ${color}cc,0 0 36px ${color}44,inset 0 1px 3px rgba(255,255,255,.4);
        position:relative;z-index:2;
        display:flex;align-items:center;justify-content:center;
      `;
        } else {
            // Simpler styles for idle pins — no heavy box-shadow spread
            dot.style.cssText = `
        width:${size}px;height:${size}px;
        border-radius:50%;
        background:${color}dd;
        border:1.5px solid rgba(255,255,255,.55);
        box-shadow:0 0 6px ${color}88;
        position:relative;z-index:2;
        display:flex;align-items:center;justify-content:center;
      `;
        }

        if (isPlayed) {
            const tick = document.createElement('span');
            tick.textContent = '✓';
            tick.style.cssText = `font-size:${Math.round(size * .52)}px;line-height:1;color:rgba(0,0,0,.75);font-weight:700;`;
            dot.appendChild(tick);
        }
        wrap.appendChild(dot);

        // Floating label — name only for idle pins, name + era for selected
        const lbl = document.createElement('div');
        lbl.style.cssText = `
      position:absolute;top:${size + 6}px;
      left:50%;transform:translateX(-50%);
      background:rgba(6,6,22,${isSelected ? '.94' : '.80'});
      border:1px solid ${color}${isSelected ? '55' : '33'};
      border-radius:6px;padding:${isSelected ? '4px 9px' : '2px 7px'};
      white-space:nowrap;font-size:${isSelected ? '10px' : '9px'};
      font-family:Inter,sans-serif;color:#fff;font-weight:600;
      pointer-events:none;z-index:10;
      max-width:160px;text-align:center;
    `;
        lbl.innerHTML = isSelected
            ? `${game.title}<span style="display:block;font-size:9px;color:${color};font-weight:400;margin-top:1px">${game.era_label}</span>`
            : game.title;
        wrap.appendChild(lbl);

        return wrap;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedGame?.id, playedGameIds]);

    const isLight = theme === 'light';
    const isLines = mapStyle === 'lines';

    // Solid-color SVG data URLs for lines mode — makes the sphere itself that color
    const GLOBE_LIGHT_LINES = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2' height='1'%3E%3Crect fill='%23eaf2ff' width='2' height='1'/%3E%3C/svg%3E`;
    const GLOBE_DARK_LINES = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2' height='1'%3E%3Crect fill='%23060618' width='2' height='1'/%3E%3C/svg%3E`;

    // ── Textures ────────────────────────────────────────────────────────────
    const globeImg = isLines
        ? (isLight ? GLOBE_LIGHT_LINES : GLOBE_DARK_LINES)
        : isLight
            ? 'https://unpkg.com/three-globe/example/img/earth-day.jpg'
            : 'https://unpkg.com/three-globe/example/img/earth-night.jpg';

    const bumpImg = isLines ? null : 'https://unpkg.com/three-globe/example/img/earth-topology.png';

    // ── Canvas background ────────────────────────────────────────────────────
    const globeBg = isLines
        ? (isLight ? '#eaf2ff' : '#08081a')
        : 'rgba(0,0,0,0)';

    // ── Country polygon styling ─────────────────────────────────────────────
    const polyColor = useCallback(() => {
        if (isLines) return isLight ? 'rgba(30,90,200,0.06)' : 'rgba(80,140,255,0.06)';
        return isLight ? 'rgba(30,30,60,0.06)' : 'rgba(200,220,255,0.04)';
    }, [isLines, isLight]);

    const polySideColor = useCallback(() => 'rgba(0,0,0,0)', []);

    const polyStrokeColor = useCallback(() => {
        // Dark mode lines — bright electric blue (keep as user liked)
        if (isLines && !isLight) return 'rgba(100,180,255,0.80)';
        // Light mode lines — vivid blue on the white/pale-blue sphere
        if (isLines && isLight) return 'rgba(20,80,200,0.80)';
        // Texture mode — subtle overlay
        return isLight ? 'rgba(50,50,120,0.45)' : 'rgba(160,180,255,0.35)';
    }, [isLines, isLight]);

    const atmosphereColor = isLines
        ? (isLight ? '#4a90d9' : '#5B4FF5')
        : (isLight ? '#2980B9' : '#5B4FF5');

    // Points for click interaction only (invisible, high hit-area)
    const pointColor = useCallback((d) => {
        return playedGameIds.includes(d.id) ? '#00FF8822' : `${getEraColor(d.era_label)}22`;
    }, [playedGameIds]);

    return (
        <div className="globe-wrapper">
            <GlobeGL
                ref={globeRef}
                width={dims.w}
                height={dims.h}
                backgroundColor={globeBg}
                globeImageUrl={globeImg}
                bumpImageUrl={bumpImg}
                atmosphereColor={atmosphereColor}
                atmosphereAltitude={isLines ? 0.08 : 0.14}

                // === Country borders ===
                polygonsData={countries.features}
                polygonAltitude={isLines ? 0.003 : 0.002}
                polygonCapColor={polyColor}
                polygonSideColor={polySideColor}
                polygonStrokeColor={polyStrokeColor}
                polygonLabel={() => ''}

                // === Clickable transparent points ===
                pointsData={games}
                pointLat="lat"
                pointLng="lng"
                pointColor={pointColor}
                pointRadius={0.6}
                pointAltitude={0.015}
                onPointClick={handlePointClick}
                pointLabel={() => ''}

                // === Beautiful HTML visual pins (pointer-events:none) ===
                htmlElementsData={games}
                htmlLat="lat"
                htmlLng="lng"
                htmlAltitude={0.015}
                htmlElement={makeLabel}
            />
        </div>
    );
}
