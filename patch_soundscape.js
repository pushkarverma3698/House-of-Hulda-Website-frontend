const fs = require('fs');
const file = 'components/film/Soundscape.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace the return block
code = code.replace(
  /<div className="fixed z-40 flex items-center gap-2\.5 select-none top-4 right-20 md:top-auto md:right-auto md:left-8 md:bottom-8">[\s\S]*<\/div>/g,
  `<div className="fixed z-40 flex items-center select-none bottom-[calc(5.5rem_+_env(safe-area-inset-bottom))] md:bottom-[32px] left-[32px]">
      <button
        onClick={toggleSound}
        aria-label={isPlaying ? 'Turn atmospheric audio off' : 'Turn atmospheric audio on'}
        aria-pressed={isPlaying}
        className={\`pointer-events-auto flex items-center justify-center h-[50px] w-[50px] rounded-full border backdrop-blur-md transition-all duration-500 shadow-[0_8px_24px_rgba(0,0,0,0.35)] group \${
          isPlaying
            ? 'bg-[#25D366] border-transparent shadow-[0_0_25px_rgba(37,211,102,0.4)]'
            : 'border-white/10 bg-black/20 hover:scale-[1.06] hover:bg-[#25D366] hover:border-transparent'
        }\`}
        title="Toggle Himalayan Atmospheric Sound"
      >
        {/* Equalizer Waveform Bars / Sound Icon */}
        <span className="flex items-end justify-center gap-[3px] h-4 w-4">
          <span className={\`w-[2px] rounded-full transition-all duration-300 \${isPlaying ? 'bg-black h-4 animate-[pulse_0.6s_ease-in-out_infinite]' : 'bg-white/60 h-2 group-hover:bg-white'}\`} />
          <span className={\`w-[2px] rounded-full transition-all duration-300 \${isPlaying ? 'bg-black h-3 animate-[pulse_0.9s_ease-in-out_infinite]' : 'bg-white/60 h-3.5 group-hover:bg-white'}\`} />
          <span className={\`w-[2px] rounded-full transition-all duration-300 \${isPlaying ? 'bg-black h-3.5 animate-[pulse_1.2s_ease-in-out_infinite]' : 'bg-white/60 h-1.5 group-hover:bg-white'}\`} />
        </span>
      </button>
    </div>`
);

fs.writeFileSync(file, code);
