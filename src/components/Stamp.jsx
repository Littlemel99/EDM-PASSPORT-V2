export default function Stamp({
  stamp,
  collected = false,
  onClick,
  isAdmin = false,
}) {
  const showRealStamp = collected || isAdmin

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
      }}
      onClick={onClick}
    >
      {showRealStamp ? (
        <img
          src={stamp.image}
          alt={stamp.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            background: 'rgba(0,0,0,.8)',
          }}
        >
          ❓
        </div>
      )}
    </button>
  )
}