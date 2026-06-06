export default function Stamp({ stamp, collected = false, onClick }) {
  return (
    <button
      style={{
        width: 82,
        height: 82,
        borderRadius: 999,
        border: '3px solid rgba(255,255,255,.45)',
        background: 'rgba(0,0,0,.5)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        opacity: collected ? 1 : 0.35,
      }}
      onClick={onClick}
      disabled={!collected && !onClick}
    >
      <img
        src={stamp.image}
        alt={stamp.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        onError={(event) => {
          event.currentTarget.style.display = 'none'
        }}
      />

      <span
        style={{
          position: 'absolute',
          fontSize: 28,
        }}
      >
        {stamp.fallback || '⚡'}
      </span>
    </button>
  )
}
